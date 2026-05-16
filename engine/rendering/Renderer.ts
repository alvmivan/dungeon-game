import type { Camera } from "@/engine/Camera"
import type { TileMap } from "@/engine/dungeon/TileMap"
import type { Player } from "@/engine/entities/Player"
import type { Enemy } from "@/engine/entities/Enemy"
import type { Projectile } from "@/engine/entities/Projectile"
import type { ChestData } from "@/engine/dungeon/RoomPopulator"
import type { Item } from "@/engine/items/ItemTypes"
import { TILE_SIZE } from "@/shared/config/gameConfig"
import { drawDungeon } from "./drawDungeon"
import { drawPlayer } from "./drawPlayer"
import { drawEnemy } from "./drawEnemy"
import { drawProjectile } from "./drawProjectile"
import { drawChests, drawDroppedWeapon } from "./drawItems"
import { drawParticles, type Particle } from "./drawEffects"
import { renderPlayerLight } from "./lighting"

export class Renderer {
    private ctx: CanvasRenderingContext2D
    private canvasW: number
    private canvasH: number

    constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
        this.ctx = ctx
        this.canvasW = width
        this.canvasH = height
    }

    resize(width: number, height: number) {
        this.canvasW = width
        this.canvasH = height
    }

    render(
        camera: Camera,
        map: TileMap,
        player: Player,
        enemies: Enemy[],
        projectiles: Projectile[],
        chests: ChestData[],
        droppedItems: { x: number; y: number; item: Item }[],
        particles: Particle[],
        dt: number,
        depth: number = 1,
    ) {
        const ctx = this.ctx

        drawDungeon(ctx, map, camera, this.canvasW, this.canvasH, depth)

        for (const chest of chests) {
            drawChests(ctx, [chest], camera)
        }

        drawDroppedWeapon(ctx, droppedItems, camera)

        for (const enemy of enemies) {
            drawEnemy(ctx, enemy, camera)
        }

        for (const proj of projectiles) {
            drawProjectile(ctx, proj, camera)
        }

        drawPlayer(ctx, player, camera)

        this.drawFloatingTexts(ctx, camera)

        this.drawParticles(ctx, particles, dt, camera)

        renderPlayerLight(
            ctx,
            this.canvasW,
            this.canvasH,
            map,
            Math.floor(player.centerX / TILE_SIZE),
            Math.floor(player.centerY / TILE_SIZE),
            camera.x,
            camera.y,
        )
    }

    private _particles: Particle[] = []

    addParticles(particles: Particle[]) {
        this._particles.push(...particles)
    }

    private drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[], dt: number, camera: Camera) {
        this._particles = drawParticles(ctx, [...this._particles, ...particles], dt, camera)
    }

    private floatingTexts: { x: number; y: number; text: string; color: string; life: number }[] = []

    addFloatingText(x: number, y: number, text: string, color: string = "#ffffff") {
        this.floatingTexts.push({ x, y, text, color, life: 1.0 })
    }

    private drawFloatingTexts(ctx: CanvasRenderingContext2D, camera: Camera) {
        const alive: typeof this.floatingTexts = []
        for (const ft of this.floatingTexts) {
            ft.life -= 0.02
            ft.y -= 0.5
            if (ft.life <= 0) continue

            ctx.globalAlpha = ft.life
            ctx.fillStyle = ft.color
            ctx.font = "bold 14px monospace"
            ctx.textAlign = "center"
            ctx.fillText(ft.text, ft.x - camera.x, ft.y - camera.y)

            alive.push(ft)
        }
        ctx.globalAlpha = 1
        this.floatingTexts = alive
    }

    clear() {
        this._particles = []
        this.floatingTexts = []
    }
}
