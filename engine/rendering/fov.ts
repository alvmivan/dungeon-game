import type { TileMap } from "@/engine/dungeon/TileMap"
import { TileType } from "@/engine/dungeon/TileMap"

export function computeFOV(map: TileMap, px: number, py: number, radius: number): boolean[][] {
    const visible: boolean[][] = Array.from({ length: map.height }, () =>
        Array(map.width).fill(false),
    )

    visible[py][px] = true

    const minX = Math.max(0, px - radius)
    const maxX = Math.min(map.width - 1, px + radius)
    const minY = Math.max(0, py - radius)
    const maxY = Math.min(map.height - 1, py + radius)

    for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
            if (x === px && y === py) continue

            const dx = x - px
            const dy = y - py
            if (dx * dx + dy * dy > radius * radius) continue

            if (hasLineOfSight(map, px, py, x, y)) {
                visible[y][x] = true
            }
        }
    }

    return visible
}

function hasLineOfSight(map: TileMap, x0: number, y0: number, x1: number, y1: number): boolean {
    const dx = Math.abs(x1 - x0)
    const dy = Math.abs(y1 - y0)
    const sx = x0 < x1 ? 1 : -1
    const sy = y0 < y1 ? 1 : -1
    let err = dx - dy
    let cx = x0
    let cy = y0

    while (cx !== x1 || cy !== y1) {
        const e2 = err * 2
        if (e2 > -dy) {
            err -= dy
            cx += sx
        }
        if (e2 < dx) {
            err += dx
            cy += sy
        }

        if (cx === x1 && cy === y1) break
        if (map.tiles[cy]?.[cx] === TileType.Wall) return false
    }

    return true
}
