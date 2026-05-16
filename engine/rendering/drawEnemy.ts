import type { Enemy } from "@/engine/entities/Enemy"
import type { Camera } from "@/engine/Camera"
import { COLORS } from "@/shared/config/gameConfig"

const ENEMY_COLORS: Record<string, string> = {
    slime: COLORS.enemySlime,
    skeleton: COLORS.enemySkeleton,
    bat: COLORS.enemyBat,
    goblin: COLORS.enemyGoblin,
    golem: COLORS.enemyGolem,
}

export function drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy, camera: Camera) {
    if (!enemy.alive) return

    const x = Math.round(enemy.centerX - camera.x)
    const y = Math.round(enemy.centerY - camera.y)
    const color = ENEMY_COLORS[enemy.enemyType] || COLORS.enemySlime
    const size = enemy.width

    ctx.save()
    ctx.translate(x, y)

    drawName(ctx, enemy, size)

    switch (enemy.enemyType) {
        case "slime":
            drawSlime(ctx, size, color)
            break
        case "skeleton":
            drawSkeleton(ctx, size, color)
            break
        case "bat":
            drawBat(ctx, size, color)
            break
        case "goblin":
            drawGoblin(ctx, size, color)
            break
        case "golem":
            drawGolem(ctx, size, color)
            break
        default:
            drawSlime(ctx, size, color)
    }

    drawHealthBar(ctx, enemy, size)

    ctx.restore()
}

function drawName(ctx: CanvasRenderingContext2D, enemy: Enemy, size: number) {
    const nameY = -size / 2 - 18
    ctx.fillStyle = "rgba(0,0,0,0.6)"
    const textW = ctx.measureText(enemy.enemyName).width
    ctx.fillRect(-textW / 2 - 3, nameY - 6, textW + 6, 12)
    ctx.fillStyle = "#e0e0e0"
    ctx.font = "8px monospace"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(enemy.enemyName, 0, nameY)
}

function drawSlime(ctx: CanvasRenderingContext2D, size: number, color: string) {
    ctx.beginPath()
    ctx.ellipse(0, 2, size / 2, size / 3, 0, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()
    ctx.fillStyle = "#ffffff"
    ctx.beginPath()
    ctx.arc(-3, -2, 2, 0, Math.PI * 2)
    ctx.arc(3, -2, 2, 0, Math.PI * 2)
    ctx.fill()
}

function drawSkeleton(ctx: CanvasRenderingContext2D, size: number, color: string) {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(0, -size / 3, size / 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillRect(-size / 4, 0, size / 2, size / 2.5)
    ctx.strokeStyle = color
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(-size / 3, size / 4)
    ctx.lineTo(-size / 2, size / 2)
    ctx.moveTo(size / 3, size / 4)
    ctx.lineTo(size / 2, size / 2)
    ctx.moveTo(-size / 4, size / 2)
    ctx.lineTo(-size / 3, size / 1.5)
    ctx.moveTo(size / 4, size / 2)
    ctx.lineTo(size / 3, size / 1.5)
    ctx.stroke()
    ctx.fillStyle = "#000000"
    ctx.beginPath()
    ctx.arc(-2, -size / 3 - 1, 1.5, 0, Math.PI * 2)
    ctx.arc(2, -size / 3 - 1, 1.5, 0, Math.PI * 2)
    ctx.fill()
}

function drawBat(ctx: CanvasRenderingContext2D, size: number, color: string) {
    const wingPhase = (Date.now() / 200) % (Math.PI * 2)
    const wingAngle = Math.sin(wingPhase) * 0.3
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(0, -2, size / 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = "#ffffff"
    ctx.beginPath()
    ctx.arc(-2, -3, 1.5, 0, Math.PI * 2)
    ctx.arc(2, -3, 1.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(-size / 3, -1)
    ctx.lineTo(-size / 1.8, -1 + wingAngle * 5)
    ctx.lineTo(-size / 3, 3)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(size / 3, -1)
    ctx.lineTo(size / 1.8, -1 + wingAngle * 5)
    ctx.lineTo(size / 3, 3)
    ctx.stroke()
}

function drawGoblin(ctx: CanvasRenderingContext2D, size: number, color: string) {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(0, -size / 3, size / 3.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillRect(-size / 3.5, 0, size / 1.75, size / 2)
    ctx.strokeStyle = color
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(-size / 3, size / 3)
    ctx.lineTo(-size / 2, size / 1.5)
    ctx.moveTo(size / 3, size / 3)
    ctx.lineTo(size / 2, size / 1.5)
    ctx.stroke()
    ctx.fillStyle = "#ef5350"
    ctx.beginPath()
    ctx.arc(-2, -size / 3 - 2, 1.5, 0, Math.PI * 2)
    ctx.arc(2, -size / 3 - 2, 1.5, 0, Math.PI * 2)
    ctx.fill()
}

function drawGolem(ctx: CanvasRenderingContext2D, size: number, color: string) {
    ctx.fillStyle = color
    ctx.fillRect(-size / 2, -size / 2.5, size, size / 1.2)
    ctx.fillStyle = "#37474f"
    ctx.fillRect(-size / 2, -size / 2.5, size, 3)
    ctx.fillRect(-size / 2, size / 3, size, 3)
    ctx.fillStyle = "#ffb300"
    ctx.beginPath()
    ctx.arc(-3, -3, 2, 0, Math.PI * 2)
    ctx.arc(3, -3, 2, 0, Math.PI * 2)
    ctx.fill()
}

function drawHealthBar(ctx: CanvasRenderingContext2D, enemy: Enemy, size: number) {
    const barW = Math.max(size, 20)
    const barH = 3
    const barX = -barW / 2
    const barY = -size / 2 - 10
    const pct = enemy.hp / enemy.maxHp

    ctx.fillStyle = "#1a1a1a"
    ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2)

    ctx.fillStyle = "#424242"
    ctx.fillRect(barX, barY, barW, barH)

    const hpColor = pct > 0.5 ? "#4caf50" : pct > 0.25 ? "#ffb300" : "#ef5350"
    ctx.fillStyle = hpColor
    ctx.fillRect(barX, barY, barW * pct, barH)
}
