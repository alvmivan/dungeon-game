import { Entity } from "./Entity"
import { Inventory } from "@/engine/Inventory"
import type { Item } from "@/engine/items/ItemTypes"
import { ItemGenerator } from "@/engine/items/ItemGenerator"
import { PLAYER_MAX_HP, PLAYER_SPEED } from "@/shared/config/gameConfig"

export class Player extends Entity {
    inventory: Inventory
    attackCooldown: number = 0
    attackTimer: number = 0
    level: number = 1
    score: number = 0
    invulnerableTimer: number = 0
    baseMaxHp: number
    baseSpeed: number

    constructor(x: number, y: number) {
        super(x, y, 22, 28, PLAYER_MAX_HP, PLAYER_SPEED)
        this.baseMaxHp = PLAYER_MAX_HP
        this.baseSpeed = PLAYER_SPEED
        this.inventory = new Inventory()
        this.inventory.equip(ItemGenerator.createStarterKnife())
        this.recalcStats()
    }

    recalcStats() {
        this.maxHp = this.baseMaxHp + this.inventory.hpBonus
        this.speed = Math.max(20, this.baseSpeed + this.inventory.speedBonus)
        if (this.hp > this.maxHp) this.hp = this.maxHp
    }

    get totalCritChance(): number {
        const weapon = this.inventory.getEquippedWeapon()
        const base = weapon?.critChance || 0.05
        return Math.min(0.5, base + this.inventory.critChanceBonus)
    }

    get equippedWeapon(): Item | null {
        return this.inventory.getEquippedWeapon()
    }

    get totalDamage(): number {
        return this.equippedWeapon?.weaponDamage || 5
    }

    get totalAttackSpeed(): number {
        return this.equippedWeapon?.weaponSpeed || 2.0
    }

    get totalRange(): number {
        return this.equippedWeapon?.weaponRange || 1.2
    }

    get weaponElement(): string {
        return this.equippedWeapon?.element || "none"
    }

    override takeDamage(amount: number): boolean {
        const reduced = Math.max(1, amount - this.inventory.defense)
        return super.takeDamage(reduced)
    }

    canAttack(): boolean {
        return this.attackTimer <= 0 && this.alive
    }

    performAttack(): boolean {
        if (!this.canAttack()) return false
        this.attackTimer = 1 / this.totalAttackSpeed
        this.state = "attacking"
        return true
    }

    update(dt: number) {
        if (this.attackTimer > 0) this.attackTimer -= dt
        if (this.invulnerableTimer > 0) this.invulnerableTimer -= dt
        if (this.state === "hit") this.state = "idle"
        if (this.state === "attacking" && this.attackTimer <= 0) {
            this.state = "idle"
        }
    }
}
