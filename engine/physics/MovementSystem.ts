import type { CollisionSystem } from "./CollisionSystem"

export class MovementSystem {
    private collision: CollisionSystem

    constructor(collision: CollisionSystem) {
        this.collision = collision
    }

    moveToward(
        entity: { x: number; y: number; width: number; height: number },
        targetX: number,
        targetY: number,
        speed: number,
        dt: number
    ): boolean {
        const dx = targetX - entity.x
        const dy = targetY - entity.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < 1) return false

        const moveX = (dx / dist) * speed * dt
        const moveY = (dy / dist) * speed * dt

        const result = this.collision.tryMove(entity, moveX, moveY)
        entity.x = result.x
        entity.y = result.y

        return true
    }
}
