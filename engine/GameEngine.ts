import { Player } from "@/engine/entities/Player"
import { Enemy } from "@/engine/entities/Enemy"
import { Camera } from "@/engine/Camera"
import { CollisionSystem } from "@/engine/physics/CollisionSystem"
import { MovementSystem } from "@/engine/physics/MovementSystem"
import { Renderer } from "@/engine/rendering/Renderer"
import { generateDungeonLevel, type DungeonLevel } from "@/engine/dungeon/DungeonGenerator"
import { TileMap } from "@/engine/dungeon/TileMap"
import { ItemGenerator } from "@/engine/items/ItemGenerator"
import type { Item, EquipSlots } from "@/engine/items/ItemTypes"
import { bus } from "@/engine/EventBus"
import { InputManager } from "@/components/Game/InputManager"
import { TILE_SIZE, COLORS, weaponRarityColor, MAP_WIDTH, MAP_HEIGHT } from "@/shared/config/gameConfig"
import { spawnHitParticles, spawnDeathParticles } from "@/engine/rendering/drawEffects"
import { distance } from "@/shared/lib/math"
import { createProjectile, type Projectile } from "@/engine/entities/Projectile"
import { Squad } from "@/engine/ai/Squad"
import { InfluenceMap } from "@/engine/ai/InfluenceMap"
import { scaleEnemyStats } from "@/engine/dungeon/DifficultyScaler"
export type GameState = "playing" | "dead" | "paused"

export class GameEngine {
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private renderer: Renderer
    private input: InputManager
    private animationId: number = 0
    private lastTimestamp: number = 0

    player!: Player
    enemies: Enemy[] = []
    chests: ReturnType<typeof generateDungeonLevel>["rooms"]["chests"] = []
    droppedItems: { x: number; y: number; item: Item }[] = []
    projectiles: Projectile[] = []

    squads: Squad[] = []
    private influenceMap: InfluenceMap

    private camera: Camera
    private collision!: CollisionSystem
    private movement!: MovementSystem
    private level!: DungeonLevel

    state: GameState = "playing"
    currentDepth: number = 1
    isInitialized: boolean = false

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.ctx = canvas.getContext("2d")!
        this.camera = new Camera()
        this.renderer = new Renderer(this.ctx, canvas.width, canvas.height)
        this.input = new InputManager()
        this.influenceMap = new InfluenceMap(MAP_WIDTH, MAP_HEIGHT)
    }

    start() {
        this.input.attach(this.canvas)
        this.currentDepth = 1
        this.initLevel()
        this.lastTimestamp = performance.now()
        this.gameLoop(this.lastTimestamp)
    }

    private initLevel() {
        this.level = generateDungeonLevel(this.currentDepth)
        this.collision = new CollisionSystem(this.level.map)
        this.movement = new MovementSystem(this.collision)
        this.renderer.clear()

        const startPos = this.level.rooms.playerStart
        this.player = new Player(
            startPos.x * TILE_SIZE + (TILE_SIZE - 22) / 2,
            startPos.y * TILE_SIZE + (TILE_SIZE - 28) / 2
        )
        this.player.level = this.currentDepth

        this.enemies = this.level.rooms.enemies.map((e) => {
            const scaled = scaleEnemyStats(0, 0, this.currentDepth)
            const enemy = new Enemy(e)
            const stats = enemy.maxHp
            const scaledStats = scaleEnemyStats(enemy.maxHp, enemy.damage, this.currentDepth)
            enemy.maxHp = scaledStats.hp
            enemy.hp = scaledStats.hp
            enemy.damage = scaledStats.damage
            return enemy
        })
        this.squads = this.createSquads()
        this.chests = [...this.level.rooms.chests]
        this.droppedItems = []
        this.projectiles = []
        this.camera.reset()
        this.state = "playing"
        this.isInitialized = true

        bus.emit("level-changed", this.currentDepth)
        this.emitPlayerState()
    }

    private gameLoop = (timestamp: number) => {
        const dt = Math.min((timestamp - this.lastTimestamp) / 1000, 0.05)
        this.lastTimestamp = timestamp

        if (this.state === "playing") {
            this.update(dt)
            this.render(dt)
        } else if (this.state === "dead") {
            this.render(dt)
        }

        this.animationId = requestAnimationFrame(this.gameLoop)
    }

    private update(dt: number) {
        const inputState = this.input.getState()

        if (inputState.pause) {
            this.state = "paused"
            bus.emit("game-paused")
            return
        }

        if (inputState.inventory) {
            bus.emit("open-inventory")
            return
        }

        this.player.update(dt)

        let dx = 0, dy = 0
        if (inputState.up) dy -= 1
        if (inputState.down) dy += 1
        if (inputState.left) dx -= 1
        if (inputState.right) dx += 1

        if (dx !== 0 || dy !== 0) {
            const len = Math.sqrt(dx * dx + dy * dy)
            dx /= len
            dy /= len
            const moveResult = this.collision.tryMove(this.player, dx * this.player.speed * dt, dy * this.player.speed * dt)
            this.player.x = moveResult.x
            this.player.y = moveResult.y
            this.player.walkCycle += dt * 5
            this.player.state = "walking"

            if (Math.abs(dx) > Math.abs(dy)) {
                this.player.facing = dx > 0 ? "right" : "left"
            } else {
                this.player.facing = dy > 0 ? "down" : "up"
            }
        } else {
            this.player.walkCycle = 0
            if (this.player.state === "walking") this.player.state = "idle"
        }

        if (inputState.attack && this.player.canAttack()) {
            this.player.performAttack()
            this.performAttack()
        }

        this.updateProjectiles(dt)
        this.updateEnemies(dt)

        if (inputState.interactJustPressed) {
            this.checkChestPickup()
            this.checkStairs()
            this.pickupDroppedItem()
        }

        this.camera.follow(this.player.centerX, this.player.centerY, this.canvas.width, this.canvas.height)

        if (inputState.dropWeaponJustPressed) {
            this.dropEquippedWeapon()
        }

        this.emitPlayerState()
    }

    private alertNearbyEnemies(source: Enemy) {
        const alertRange = 5 * TILE_SIZE
        for (const e of this.enemies) {
            if (!e.alive || e === source) continue
            const d = distance(source.centerX, source.centerY, e.centerX, e.centerY)
            if (d < alertRange) {
                e.isAlerted = true
                e.alertTimer = 3.0
            }
        }
    }

    private createSquads(): Squad[] {
        const squads: Squad[] = []
        const assigned = new Set<Enemy>()

        for (const enemy of this.enemies) {
            if (!enemy.alive || assigned.has(enemy)) continue
            const members: Enemy[] = [enemy]
            assigned.add(enemy)

            for (const other of this.enemies) {
                if (other === enemy || !other.alive || assigned.has(other)) continue
                const d = Math.abs(enemy.centerX - other.centerX) + Math.abs(enemy.centerY - other.centerY)
                if (d < TILE_SIZE * 4) {
                    members.push(other)
                    assigned.add(other)
                }
            }

            const avgX = Math.floor(members.reduce((s, e) => s + e.centerX / TILE_SIZE, 0) / members.length)
            const avgY = Math.floor(members.reduce((s, e) => s + e.centerY / TILE_SIZE, 0) / members.length)
            squads.push(new Squad(members, avgX, avgY))
        }

        return squads
    }

    private performAttack() {
        const isRanged = this.player.totalRange > 2.5

        if (isRanged) {
            this.fireProjectile()
        } else {
            this.performMeleeAttack()
        }
    }

    private fireProjectile() {
        const isCrit = Math.random() < this.player.totalCritChance
        const dmg = isCrit ? this.player.totalDamage * 2 : this.player.totalDamage
        const color = this.player.equippedWeapon
            ? weaponRarityColor(this.player.equippedWeapon.rarity)
            : "#ffffff"

        const dirMap: Record<string, { dx: number; dy: number }> = {
            up: { dx: 0, dy: -1 },
            down: { dx: 0, dy: 1 },
            left: { dx: -1, dy: 0 },
            right: { dx: 1, dy: 0 },
        }
        const dir = dirMap[this.player.facing] || { dx: 0, dy: 1 }
        const angle = Math.atan2(dir.dy, dir.dx)

        const proj = createProjectile(
            this.player.centerX + dir.dx * 16,
            this.player.centerY + dir.dy * 16,
            angle,
            dmg,
            200 + this.player.totalAttackSpeed * 50,
            this.player.totalRange,
            isCrit,
            color
        )

        this.projectiles.push(proj)
    }

    private updateProjectiles(dt: number) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i]
            if (!proj.alive) {
                this.projectiles.splice(i, 1)
                continue
            }

            proj.x += proj.vx * dt
            proj.y += proj.vy * dt
            proj.distTraveled += Math.abs(proj.vx * dt) + Math.abs(proj.vy * dt)

            const tileX = Math.floor(proj.x / TILE_SIZE)
            const tileY = Math.floor(proj.y / TILE_SIZE)

            if (proj.distTraveled > proj.range || !this.level.map.isWalkable(tileX, tileY)) {
                this.renderer.addParticles(spawnHitParticles(proj.x, proj.y, "#9e9e9e"))
                proj.alive = false
                this.projectiles.splice(i, 1)
                continue
            }

            for (const enemy of this.enemies) {
                if (!enemy.alive) continue
                const dist = distance(proj.x, proj.y, enemy.centerX, enemy.centerY)
                if (dist < enemy.width) {
                    enemy.takeDamage(proj.damage)
                    enemy.isAlerted = true
                    enemy.alertTimer = 3.0
                    this.alertNearbyEnemies(enemy)
                    this.renderer.addParticles(spawnHitParticles(proj.x, proj.y, proj.color))
                    this.renderer.addFloatingText(
                        enemy.centerX, enemy.centerY - 10,
                        proj.isCrit ? `¡${proj.damage}!` : `-${proj.damage}`,
                        proj.isCrit ? "#ff3d00" : "#ffffff"
                    )

                    if (!enemy.alive) {
                        this.onEnemyDeath(enemy)
                    }

                    proj.alive = false
                    this.projectiles.splice(i, 1)
                    break
                }
            }
        }
    }

    private updateEnemies(dt: number) {
        this.influenceMap.calculate(this.level.map, this.player.centerX, this.player.centerY, this.enemies)

        for (const squad of this.squads) {
            squad.update(dt, this.player.centerX, this.player.centerY, this.level.map)
        }

        for (const enemy of this.enemies) {
            if (!enemy.alive) continue

            enemy.update(dt)
            enemy.alertTimer = Math.max(0, enemy.alertTimer - dt)
            if (enemy.alertTimer <= 0) enemy.isAlerted = false

            const dist = distance(this.player.centerX, this.player.centerY, enemy.centerX, enemy.centerY)

            if (dist < enemy.aggroRange || enemy.isAlerted) {
                const speed = enemy.isAlerted ? enemy.speed * 1.4 : enemy.speed

                let targetX = this.player.centerX
                let targetY = this.player.centerY
                if (enemy.isAlerted && enemy.groupTargetX !== 0 && enemy.groupTargetY !== 0) {
                    targetX = enemy.groupTargetX
                    targetY = enemy.groupTargetY
                }

                enemy.pathTimer -= dt
                if (enemy.pathTimer <= 0 || enemy.pathTargetX === 0) {
                    const path = this.collision.aStar(enemy.centerX, enemy.centerY, targetX, targetY)
                    if (path.length > 1) {
                        enemy.pathTargetX = path[1].x
                        enemy.pathTargetY = path[1].y
                    }
                    enemy.pathTimer = enemy.isAlerted ? 0.15 : 0.3
                }

                const distToTarget = distance(enemy.centerX, enemy.centerY, targetX, targetY)
                if (dist > 15 && distToTarget > 8) {
                    this.movement.moveToward(enemy, enemy.pathTargetX, enemy.pathTargetY, speed, dt)
                    enemy.walkCycle += dt * 3
                }

                if (dist < 25 && enemy.canAttack()) {
                    this.player.takeDamage(enemy.damage)
                    enemy.attackTimer = enemy.attackCooldown
                    this.renderer.addParticles(spawnHitParticles(this.player.centerX, this.player.centerY, "#ef5350"))
                    this.renderer.addFloatingText(this.player.centerX, this.player.centerY - 10, `-${enemy.damage}`, "#ef5350")
                    this.emitPlayerState()

                    if (!this.player.alive) {
                        this.state = "dead"
                        this.renderer.addParticles(spawnDeathParticles(this.player.centerX, this.player.centerY, COLORS.player))
                        bus.emit("game-over", this.player.score)
                        return
                    }
                }
            }
        }
    }

    private performMeleeAttack() {
        const range = this.player.totalRange * TILE_SIZE

        for (const enemy of this.enemies) {
            if (!enemy.alive) continue

            const dist = distance(this.player.centerX, this.player.centerY, enemy.centerX, enemy.centerY)
            if (dist <= range) {
                const isCrit = Math.random() < this.player.totalCritChance
                const dmg = isCrit ? this.player.totalDamage * 2 : this.player.totalDamage

                enemy.takeDamage(dmg)
                enemy.isAlerted = true
                enemy.alertTimer = 3.0
                this.alertNearbyEnemies(enemy)
                this.renderer.addParticles(spawnHitParticles(enemy.centerX, enemy.centerY, "#ffb300"))
                this.renderer.addFloatingText(enemy.centerX, enemy.centerY - 10, isCrit ? `¡${dmg}!` : `-${dmg}`, isCrit ? "#ff3d00" : "#ffffff")

                if (!enemy.alive) {
                    this.onEnemyDeath(enemy)
                }
                break
            }
        }
    }

    private onEnemyDeath(enemy: Enemy) {
        this.player.score += enemy.damage * 10
        this.renderer.addParticles(spawnDeathParticles(enemy.centerX, enemy.centerY, "#66bb6a"))
        this.emitPlayerState()

        if (Math.random() < 0.35) {
            const item = ItemGenerator.generate(this.currentDepth)
            const tileX = Math.floor(enemy.centerX / TILE_SIZE)
            const tileY = Math.floor(enemy.centerY / TILE_SIZE)
            this.droppedItems.push({ x: tileX, y: tileY, item })
            this.renderer.addFloatingText(
                tileX * TILE_SIZE + TILE_SIZE / 2,
                tileY * TILE_SIZE,
                `¡${item.name}!`,
                weaponRarityColor(item.rarity)
            )
        }
    }

    private checkChestPickup() {
        const px = Math.floor(this.player.centerX / TILE_SIZE)
        const py = Math.floor(this.player.centerY / TILE_SIZE)

        const toRemove: number[] = []
        for (let i = 0; i < this.chests.length; i++) {
            const chest = this.chests[i]
            if (Math.abs(chest.x - px) <= 1 && Math.abs(chest.y - py) <= 1) {
                const item = ItemGenerator.generate(this.currentDepth)
                this.droppedItems.push({ x: chest.x, y: chest.y, item })
                toRemove.push(i)
                this.renderer.addFloatingText(
                    chest.x * TILE_SIZE + TILE_SIZE / 2,
                    chest.y * TILE_SIZE,
                    `¡${item.name}!`,
                    weaponRarityColor(item.rarity)
                )
            }
        }
        this.chests = this.chests.filter((_, i) => !toRemove.includes(i))
    }

    private checkStairs() {
        const px = Math.floor(this.player.centerX / TILE_SIZE)
        const py = Math.floor(this.player.centerY / TILE_SIZE)
        if (this.level.map.tiles[py][px] === 3) {
            this.currentDepth++
            this.initLevel()
        }
    }

    private pickupDroppedItem() {
        const px = Math.floor(this.player.centerX / TILE_SIZE)
        const py = Math.floor(this.player.centerY / TILE_SIZE)

        for (let i = 0; i < this.droppedItems.length; i++) {
            const dropped = this.droppedItems[i]
            if (dropped.x === px && dropped.y === py) {
                const item = dropped.item

                if (item.type === "potion") {
                    const heal = item.healAmount || 25
                    this.player.heal(heal)
                    this.droppedItems.splice(i, 1)
                    this.renderer.addFloatingText(
                        px * TILE_SIZE + TILE_SIZE / 2,
                        py * TILE_SIZE,
                        `+${heal} HP`,
                        "#4caf50"
                    )
                    this.emitPlayerState()
                    return
                }

                if (item.slot !== "none") {
                    if (this.player.inventory.backpack.length < this.player.inventory.maxBackpackSize) {
                        this.player.inventory.addToBackpack(item)
                        this.droppedItems.splice(i, 1)
                        this.renderer.addFloatingText(
                            px * TILE_SIZE + TILE_SIZE / 2,
                            py * TILE_SIZE,
                            `¡${item.name}!`,
                            weaponRarityColor(item.rarity)
                        )
                    } else {
                        const previous = this.player.inventory.equip(item)
                        this.droppedItems.splice(i, 1)
                        if (previous) {
                            this.droppedItems.push({ x: px, y: py, item: previous })
                        }
                        this.renderer.addFloatingText(
                            px * TILE_SIZE + TILE_SIZE / 2,
                            py * TILE_SIZE,
                            `¡${item.name}!`,
                            weaponRarityColor(item.rarity)
                        )
                    }
                } else {
                    this.player.inventory.addToBackpack(item)
                    this.droppedItems.splice(i, 1)
                }

                this.player.recalcStats()
                this.emitPlayerState()
                break
            }
        }
    }

    dropItem(index: number) {
        const item = this.player.inventory.removeFromBackpack(index)
        if (item) {
            const px = Math.floor(this.player.centerX / TILE_SIZE)
            const py = Math.floor(this.player.centerY / TILE_SIZE)
            this.droppedItems.push({ x: px, y: py, item })
            this.emitPlayerState()
        }
    }

    usePotion(index: number) {
        const heal = this.player.inventory.usePotion(index)
        if (heal) {
            this.player.heal(heal)
            this.renderer.addFloatingText(this.player.centerX, this.player.centerY - 20, `+${heal} HP`, "#4caf50")
            this.emitPlayerState()
        }
    }

    equipItem(item: Item) {
        this.player.inventory.equip(item)
        this.renderer.addFloatingText(this.player.centerX, this.player.centerY - 20, `Equipado: ${item.name}`, weaponRarityColor(item.rarity))
        this.player.recalcStats()
        this.emitPlayerState()
    }

    unequipSlot(slot: keyof EquipSlots) {
        const item = this.player.inventory.unequip(slot)
        if (item) {
            this.renderer.addFloatingText(this.player.centerX, this.player.centerY - 20, `Desequipado: ${item.name}`, "#e0e0e0")
        }
        this.player.recalcStats()
        this.emitPlayerState()
    }

    private dropEquippedWeapon() {
        const weapon = this.player.inventory.getEquippedWeapon()
        if (weapon) {
            const px = Math.floor(this.player.centerX / TILE_SIZE)
            const py = Math.floor(this.player.centerY / TILE_SIZE)
            this.player.inventory.slots.weapon = null
            this.droppedItems.push({ x: px, y: py, item: weapon })
            this.player.recalcStats()
            this.emitPlayerState()
        }
    }

    private render(dt: number) {
        this.renderer.render(
            this.camera,
            this.level.map,
            this.player,
            this.enemies,
            this.projectiles,
            this.chests,
            this.droppedItems,
            [],
            dt,
            this.currentDepth,
        )
    }

    resume() {
        this.state = "playing"
        this.lastTimestamp = performance.now()
    }

    restart() {
        this.currentDepth = 1
        this.initLevel()
        this.lastTimestamp = performance.now()
    }

    stop() {
        cancelAnimationFrame(this.animationId)
        this.input.detach()
    }

    setCanvasSize(width: number, height: number) {
        this.renderer.resize(width, height)
    }

    private emitPlayerState() {
        bus.emit("player-updated", {
            hp: this.player.hp,
            maxHp: this.player.maxHp,
            weapon: this.player.equippedWeapon,
            level: this.player.level,
            score: this.player.score,
            depth: this.currentDepth,
            inventory: this.player.inventory,
            totalDamage: this.player.totalDamage,
            totalCritChance: this.player.totalCritChance,
            defense: this.player.inventory.defense,
        })
    }
}
