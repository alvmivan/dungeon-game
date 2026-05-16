import type { Player } from "@/engine/entities/Player"
import type { Camera } from "@/engine/Camera"
import { weaponRarityColor } from "@/shared/config/gameConfig"
import { getPlayerFrame } from "./playerSprite"

export function drawPlayer(ctx: CanvasRenderingContext2D, player: Player, camera: Camera) {
    if (!player.alive) return

    const x = Math.round(player.centerX - camera.x)
    const y = Math.round(player.centerY - camera.y)
    const flash = player.invulnerableTimer > 0 && Math.floor(player.invulnerableTimer * 10) % 2 === 0

    if (flash) return

    ctx.save()
    ctx.translate(x, y)

    drawShadow(ctx)

    const anim: "idle" | "walk" = player.state === "idle" && player.walkCycle === 0 ? "idle" : "walk"
    const sprite = getPlayerFrame(anim, player.walkCycle, player.facing, 42)
    ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2)

    drawWeapon(ctx, player, anim)

    ctx.restore()
}

function drawShadow(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "rgba(0,0,0,0.25)"
    ctx.beginPath()
    ctx.ellipse(0, 12, 12, 4, 0, 0, Math.PI * 2)
    ctx.fill()
}

function getHandOffset(facing: Player["facing"]): { x: number; y: number } {
    switch (facing) {
        case "right": return { x: 7, y: -3 }
        case "left": return { x: -7, y: -3 }
        case "up": return { x: 0, y: -8 }
        case "down": return { x: 0, y: 8 }
    }
}

function getFacingAngle(facing: Player["facing"]): number {
    switch (facing) {
        case "right": return 0
        case "left": return Math.PI
        case "up": return -Math.PI / 2
        case "down": return Math.PI / 2
    }
}

function drawWeapon(ctx: CanvasRenderingContext2D, player: Player, anim: string) {
    const weapon = player.inventory.getEquippedWeapon()
    if (!weapon) return

    const color = weaponRarityColor(weapon.rarity)
    const isRanged = (weapon.weaponRange || 0) > 2.5
    const hand = getHandOffset(player.facing)
    const dirAngle = getFacingAngle(player.facing)

    ctx.save()

    const bobX = anim === "walk" ? Math.sin(player.walkCycle * 2) * 1.5 : 0
    const bobY = anim === "walk" ? Math.abs(Math.sin(player.walkCycle * 2)) * 1 : 0
    ctx.translate(hand.x + bobX, hand.y + bobY)
    ctx.rotate(dirAngle)

    const swingAngle = player.state === "attacking"
        ? Math.min(Date.now() / 60, 0.8) * (player.facing === "left" ? 1 : -1)
        : 0
    ctx.rotate(swingAngle)

    ctx.imageSmoothingEnabled = false

    if (isRanged) {
        ctx.strokeStyle = "#8d6e63"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(0, -2)
        ctx.lineTo(16, -2)
        ctx.stroke()

        ctx.strokeStyle = color
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(0, -2)
        ctx.lineTo(16, -2)
        ctx.stroke()
    } else {
        const baseType = weapon.name.toLowerCase()

        if (baseType.includes("dagger") || baseType.includes("cuchillo")) {
            ctx.fillStyle = "#b0bec5"
            ctx.fillRect(0, -1, 10, 2)
            ctx.fillRect(10, 0, 2, 1)
            ctx.fillStyle = "#8d6e63"
            ctx.fillRect(-2, -1, 2, 2)
            ctx.fillStyle = color
            ctx.fillRect(0, -1, 10, 1)
        } else if (baseType.includes("sword") || baseType.includes("espada")) {
            ctx.fillStyle = "#b0bec5"
            ctx.fillRect(0, -1, 16, 2)
            ctx.fillRect(16, 0, 2, 1)
            ctx.fillStyle = "#8d6e63"
            ctx.fillRect(-2, -1, 2, 2)
            ctx.fillRect(0, -2, 2, 4)
            ctx.fillStyle = color
            ctx.fillRect(0, -1, 16, 1)
        } else if (baseType.includes("axe") || baseType.includes("hacha")) {
            ctx.fillStyle = "#8d6e63"
            ctx.fillRect(0, -1, 8, 2)
            ctx.fillStyle = "#78909c"
            ctx.fillRect(6, -4, 6, 8)
            ctx.fillStyle = color
            ctx.fillRect(6, -4, 6, 1)
        } else if (baseType.includes("spear") || baseType.includes("lanza")) {
            ctx.fillStyle = "#8d6e63"
            ctx.fillRect(0, -1, 16, 2)
            ctx.fillStyle = "#b0bec5"
            ctx.fillRect(14, -2, 4, 4)
            ctx.fillRect(16, -1, 2, 2)
            ctx.fillStyle = color
            ctx.fillRect(14, -1, 4, 1)
        } else if (baseType.includes("hammer") || baseType.includes("martillo")) {
            ctx.fillStyle = "#8d6e63"
            ctx.fillRect(0, -1, 8, 2)
            ctx.fillStyle = "#78909c"
            ctx.fillRect(6, -5, 6, 10)
            ctx.fillStyle = color
            ctx.fillRect(6, -5, 6, 1)
        } else {
            ctx.fillStyle = "#b0bec5"
            ctx.fillRect(0, -1, 14, 2)
            ctx.fillStyle = color
            ctx.fillRect(0, -1, 14, 1)
        }
    }

    ctx.restore()
}
