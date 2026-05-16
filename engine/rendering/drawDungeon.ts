import { TileType, type TileMap } from "@/engine/dungeon/TileMap"
import type { Camera } from "@/engine/Camera"
import { TILE_SIZE } from "@/shared/config/gameConfig"
import { getThemeForDepth } from "@/engine/rendering/DungeonMaterial"
import { computeBitmask, drawWallTile, drawFloorTile } from "@/engine/rendering/autoTile"
import { clearFloorCache } from "@/engine/rendering/floorTexture"
import { renderAmbientOcclusion } from "@/engine/rendering/ambientOcclusion"

let lastDepth = -1

export function drawDungeon(ctx: CanvasRenderingContext2D, map: TileMap, camera: Camera, canvasW: number, canvasH: number, depth: number) {
    if (depth !== lastDepth) {
        clearFloorCache()
        lastDepth = depth
    }

    const theme = getThemeForDepth(depth)
    const tiles = map.tiles
    const startX = Math.max(0, Math.floor(camera.x / TILE_SIZE))
    const startY = Math.max(0, Math.floor(camera.y / TILE_SIZE))
    const endX = Math.min(map.width, Math.ceil((camera.x + canvasW) / TILE_SIZE))
    const endY = Math.min(map.height, Math.ceil((camera.y + canvasH) / TILE_SIZE))

    for (let row = startY; row < endY; row++) {
        for (let col = startX; col < endX; col++) {
            const tile = tiles[row][col]
            const sx = Math.round(col * TILE_SIZE - camera.x)
            const sy = Math.round(row * TILE_SIZE - camera.y)

            if (tile === TileType.Wall) {
                const mask = computeBitmask(tiles, col, row, TileType.Wall)
                const seed = col * 31 + row * 17
                drawWallTile(ctx, sx, sy, mask, theme, seed)
            } else {
                const mask = computeBitmask(tiles, col, row, TileType.Wall)
                const seed = col * 31 + row * 17
                drawFloorTile(ctx, sx, sy, mask, theme, seed)

                if (tile === TileType.StairsDown) {
                    ctx.fillStyle = "#ffffff"
                    ctx.font = "16px sans-serif"
                    ctx.textAlign = "center"
                    ctx.textBaseline = "middle"
                    ctx.fillText("▼", sx + TILE_SIZE / 2, sy + TILE_SIZE / 2)
                }
                if (tile === TileType.Trap) {
                    ctx.fillStyle = "#ffb300"
                    ctx.font = "14px sans-serif"
                    ctx.textAlign = "center"
                    ctx.textBaseline = "middle"
                    ctx.fillText("⚠", sx + TILE_SIZE / 2, sy + TILE_SIZE / 2)
                }
                if (tile === TileType.Door) {
                    ctx.fillStyle = "rgba(255,255,255,0.1)"
                    ctx.fillRect(sx + 2, sy + 2, TILE_SIZE - 4, TILE_SIZE - 4)
                }
            }
        }
    }

    renderAmbientOcclusion(ctx, tiles, startX, startY, endX, endY, camera.x, camera.y)

    ctx.globalAlpha = theme.ambientIntensity
    ctx.fillStyle = theme.ambient
    ctx.fillRect(0, 0, canvasW, canvasH)
    ctx.globalAlpha = 1
}
