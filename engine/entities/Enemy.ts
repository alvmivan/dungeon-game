import { Entity } from "./Entity"
import { randomInt } from "@/shared/lib/math"
import type { EnemyData } from "@/engine/dungeon/RoomPopulator"
import { generateEnemyName } from "./enemyNames"

const ENEMY_STATS: Record<string, { hp: number; speed: number; damage: number; aggroRange: number; size: number }> = {
    slime: { hp: 10, speed: 30, damage: 5, aggroRange: 6, size: 14 },
    skeleton: { hp: 20, speed: 40, damage: 8, aggroRange: 8, size: 18 },
    bat: { hp: 8, speed: 60, damage: 3, aggroRange: 10, size: 10 },
    goblin: { hp: 15, speed: 45, damage: 7, aggroRange: 7, size: 16 },
    golem: { hp: 50, speed: 20, damage: 15, aggroRange: 5, size: 24 },
}

export class Enemy extends Entity {
    enemyType: string
    enemyName: string
    damage: number
    aggroRange: number
    attackCooldown: number = 1.0
    attackTimer: number = 0
    pathTimer: number = 0
    pathTargetX: number = 0
    pathTargetY: number = 0

    groupTargetX: number = 0
    groupTargetY: number = 0
    role: string = "attacker"
    isAlerted: boolean = false
    alertTimer: number = 0

    constructor(data: EnemyData) {
        const stats = ENEMY_STATS[data.type] || ENEMY_STATS.slime
        super(
            data.x * 32 + (32 - stats.size) / 2,
            data.y * 32 + (32 - stats.size) / 2,
            stats.size,
            stats.size,
            stats.hp + randomInt(-2, 2),
            stats.speed
        )
        this.enemyType = data.type
        this.enemyName = generateEnemyName(data.type)
        this.damage = stats.damage
        this.aggroRange = stats.aggroRange * 32
        this.attackCooldown = 1.0
    }

    canAttack(): boolean {
        return this.attackTimer <= 0 && this.alive
    }

    update(dt: number) {
        if (this.attackTimer > 0) this.attackTimer -= dt
        if (this.state === "hit") this.state = "idle"
    }
}
