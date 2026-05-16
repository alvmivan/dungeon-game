export type Projectile = {
    x: number
    y: number
    vx: number
    vy: number
    damage: number
    speed: number
    range: number
    distTraveled: number
    color: string
    size: number
    isCrit: boolean
    alive: boolean
}

export function createProjectile(
    x: number,
    y: number,
    angle: number,
    damage: number,
    speed: number,
    range: number,
    isCrit: boolean,
    color: string
): Projectile {
    return {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        damage,
        speed,
        range: range * 32,
        distTraveled: 0,
        color,
        size: isCrit ? 5 : 3,
        isCrit,
        alive: true,
    }
}
