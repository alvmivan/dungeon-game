import type { Projectile } from "@/engine/entities/Projectile"
import type { Camera } from "@/engine/Camera"

export function drawProjectile(ctx: CanvasRenderingContext2D, proj: Projectile, camera: Camera) {
    if (!proj.alive) return

    const sx = Math.round(proj.x - camera.x)
    const sy = Math.round(proj.y - camera.y)

    ctx.save()

    ctx.shadowColor = proj.color
    ctx.shadowBlur = 8

    ctx.fillStyle = proj.color
    ctx.beginPath()
    ctx.arc(sx, sy, proj.size, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = "#ffffff"
    ctx.beginPath()
    ctx.arc(sx - proj.size * 0.3, sy - proj.size * 0.3, proj.size * 0.4, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
}
