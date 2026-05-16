import { randomFloat } from "@/shared/lib/math"
import type { Camera } from "@/engine/Camera"

export type Particle = {
    x: number
    y: number
    vx: number
    vy: number
    life: number
    maxLife: number
    color: string
    size: number
}

export function spawnHitParticles(x: number, y: number, color: string): Particle[] {
    const particles: Particle[] = []
    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8
        particles.push({
            x,
            y,
            vx: Math.cos(angle) * randomFloat(20, 50),
            vy: Math.sin(angle) * randomFloat(20, 50),
            life: 0.3,
            maxLife: 0.3,
            color,
            size: randomFloat(2, 4),
        })
    }
    return particles
}

export function spawnDeathParticles(x: number, y: number, color: string): Particle[] {
    const particles: Particle[] = []
    for (let i = 0; i < 16; i++) {
        const angle = (Math.PI * 2 * i) / 16
        particles.push({
            x,
            y,
            vx: Math.cos(angle) * randomFloat(30, 80),
            vy: Math.sin(angle) * randomFloat(30, 80),
            life: 0.6,
            maxLife: 0.6,
            color,
            size: randomFloat(2, 5),
        })
    }
    return particles
}

export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[], dt: number, camera: Camera): Particle[] {
    const alive: Particle[] = []

    for (const p of particles) {
        p.life -= dt
        if (p.life <= 0) continue

        p.x += p.vx * dt
        p.y += p.vy * dt

        const sx = Math.round(p.x - camera.x)
        const sy = Math.round(p.y - camera.y)
        const alpha = p.life / p.maxLife

        ctx.globalAlpha = alpha
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(sx, sy, p.size * alpha, 0, Math.PI * 2)
        ctx.fill()

        alive.push(p)
    }

    ctx.globalAlpha = 1
    return alive
}
