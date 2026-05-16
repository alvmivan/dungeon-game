import { TILE_SIZE } from "@/shared/config/gameConfig"
import { TileType } from "@/engine/dungeon/TileMap"

export function renderAmbientOcclusion(
    ctx: CanvasRenderingContext2D,
    tiles: TileType[][],
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    cameraX: number,
    cameraY: number
) {
    const s = TILE_SIZE

    for (let row = startY; row < endY; row++) {
        for (let col = startX; col < endX; col++) {
            if (tiles[row][col] !== TileType.Floor) continue

            let wallCount = 0
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue
                    const ny = row + dy
                    const nx = col + dx
                    if (ny >= 0 && ny < tiles.length && nx >= 0 && nx < tiles[0].length) {
                        if (tiles[ny][nx] === TileType.Wall) wallCount++
                    }
                }
            }

            if (wallCount > 0) {
                const alpha = (wallCount / 8) * 0.35
                const sx = Math.round(col * s - cameraX)
                const sy = Math.round(row * s - cameraY)
                ctx.fillStyle = `rgba(0,0,0,${alpha})`
                ctx.fillRect(sx, sy, s, s)
            }
        }
    }
}
