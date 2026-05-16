import type { EntityData, EntityState, FacingDirection } from "./types"

export class Entity implements EntityData {
    x: number
    y: number
    width: number
    height: number
    hp: number
    maxHp: number
    speed: number
    state: EntityState = "idle"
    facing: FacingDirection = "down"
    walkCycle: number = 0

    constructor(x: number, y: number, width: number, height: number, hp: number, speed: number) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.hp = hp
        this.maxHp = hp
        this.speed = speed
    }

    get centerX(): number {
        return this.x + this.width / 2
    }

    get centerY(): number {
        return this.y + this.height / 2
    }

    get alive(): boolean {
        return this.hp > 0 && this.state !== "dead"
    }

    takeDamage(amount: number): boolean {
        this.hp -= amount
        if (this.hp <= 0) {
            this.hp = 0
            this.state = "dead"
            return true
        }
        this.state = "hit"
        return false
    }

    heal(amount: number) {
        this.hp = Math.min(this.maxHp, this.hp + amount)
    }
}
