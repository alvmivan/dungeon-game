import type { Camera } from "@/engine/Camera"
import { COLORS, TILE_SIZE, weaponRarityColor } from "@/shared/config/gameConfig"
import type { ChestData } from "@/engine/dungeon/RoomPopulator"
import type { Item } from "@/engine/items/ItemTypes"

export function drawChests(ctx: CanvasRenderingContext2D, chests: ChestData[], camera: Camera) {
    for (const chest of chests) {
        const sx = Math.round(chest.x * TILE_SIZE + TILE_SIZE / 2 - camera.x)
        const sy = Math.round(chest.y * TILE_SIZE + TILE_SIZE / 2 - camera.y)

        ctx.fillStyle = COLORS.chest
        ctx.fillRect(sx - 8, sy - 6, 16, 12)
        ctx.fillStyle = "#ffd54f"
        ctx.fillRect(sx - 6, sy - 4, 12, 3)
        ctx.fillStyle = "#5d4037"
        ctx.fillRect(sx - 2, sy - 6, 4, 3)
    }
}

export function drawDroppedWeapon(ctx: CanvasRenderingContext2D, dropped: { x: number; y: number; item: Item }[], camera: Camera) {
    const iconMap: Record<string, string> = {
        weapon: "⚔", armor: "🛡", helmet: "⛑", accessory: "💍", potion: "🧪",
    }
    for (const entry of dropped) {
        const sx = Math.round(entry.x * TILE_SIZE + TILE_SIZE / 2 - camera.x)
        const sy = Math.round(entry.y * TILE_SIZE + TILE_SIZE / 2 - camera.y)
        const color = weaponRarityColor(entry.item.rarity)

        ctx.save()
        ctx.translate(sx, sy)

        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(0, 0, 7, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = "#ffffff"
        ctx.font = "9px sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(iconMap[entry.item.type] || "?", 0, 0)

        ctx.restore()
    }
}
