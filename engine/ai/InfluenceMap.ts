import type { TileMap } from "@/engine/dungeon/TileMap"
import type { Enemy } from "@/engine/entities/Enemy"
import { TILE_SIZE } from "@/shared/config/gameConfig"

export class InfluenceMap {
    grid: Float32Array
    width: number
    height: number

    constructor(width: number, height: number) {
        this.width = width
        this.height = height
        this.grid = new Float32Array(width * height)
    }

    calculate(map: TileMap, playerX: number, playerY: number, enemies: Enemy[]) {
        const w = this.width
        const h = this.height
        this.grid.fill(0)

        const ptx = Math.floor(playerX / TILE_SIZE)
        const pty = Math.floor(playerY / TILE_SIZE)

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                if (!map.isWalkable(x, y)) {
                    this.grid[y * w + x] = -999
                    continue
                }

                let value = 0

                const distP = Math.abs(x - ptx) + Math.abs(y - pty)
                value += 100 / (1 + distP)

                let openCount = 0
                for (let dy = -2; dy <= 2; dy++) {
                    for (let dx = -2; dx <= 2; dx++) {
                        if (map.isWalkable(x + dx, y + dy)) openCount++
                    }
                }
                value += openCount

                for (const e of enemies) {
                    if (!e.alive) continue
                    const ex = Math.floor(e.centerX / TILE_SIZE)
                    const ey = Math.floor(e.centerY / TILE_SIZE)
                    const d = Math.abs(x - ex) + Math.abs(y - ey)
                    if (d < 3) value -= 3 * (3 - d)
                }

                this.grid[y * w + x] = value
            }
        }
    }

    getBestAdjacent(tileX: number, tileY: number, preferHigh: boolean): { x: number; y: number } {
        const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]]
        let best = { x: tileX, y: tileY }
        let bestVal = preferHigh ? -Infinity : Infinity

        for (const [dx, dy] of dirs) {
            const nx = tileX + dx
            const ny = tileY + dy
            if (nx < 0 || ny < 0 || nx >= this.width || ny >= this.height) continue
            const val = this.grid[ny * this.width + nx]
            if (preferHigh ? val > bestVal : val < bestVal) {
                bestVal = val
                best = { x: nx, y: ny }
            }
        }
        return best
    }
}
