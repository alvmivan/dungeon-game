import type { Item } from "@/engine/items/ItemTypes"

export type EntityState = "idle" | "walking" | "attacking" | "hit" | "dying" | "dead"

export type FacingDirection = "up" | "down" | "left" | "right"

export interface EntityData {
    x: number
    y: number
    width: number
    height: number
    hp: number
    maxHp: number
    speed: number
    state: EntityState
    facing: FacingDirection
    walkCycle: number
}

export interface EnemyEntityData extends EntityData {
    enemyType: string
    attackCooldown: number
    attackTimer: number
    damage: number
    aggroRange: number
}

export interface PlayerEntityData extends EntityData {
    weapon: Item | null
    attackCooldown: number
    attackTimer: number
    level: number
    score: number
}
