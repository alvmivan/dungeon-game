import type { TileMap } from "@/engine/dungeon/TileMap"
import { TILE_SIZE } from "@/shared/config/gameConfig"

export class CollisionSystem {
    private map: TileMap

    constructor(map: TileMap) {
        this.map = map
    }

    isWalkable(x: number, y: number, width: number, height: number): boolean {
        const left = Math.floor(x / TILE_SIZE)
        const right = Math.floor((x + width - 1) / TILE_SIZE)
        const top = Math.floor(y / TILE_SIZE)
        const bottom = Math.floor((y + height - 1) / TILE_SIZE)

        for (let ty = top; ty <= bottom; ty++) {
            for (let tx = left; tx <= right; tx++) {
                if (!this.map.isWalkable(tx, ty)) return false
            }
        }
        return true
    }

    tryMove(entity: { x: number; y: number; width: number; height: number }, dx: number, dy: number): { x: number; y: number } {
        let newX = entity.x
        let newY = entity.y

        if (dx !== 0) {
            const testX = entity.x + dx
            if (this.isWalkable(testX, entity.y, entity.width, entity.height)) {
                newX = testX
            }
        }

        if (dy !== 0) {
            const testY = entity.y + dy
            if (this.isWalkable(newX, testY, entity.width, entity.height)) {
                newY = testY
            }
        }

        return { x: newX, y: newY }
    }

    isInRange(ax: number, ay: number, bx: number, by: number, range: number): boolean {
        const dx = Math.abs(ax - bx)
        const dy = Math.abs(ay - by)
        const tileRange = range * TILE_SIZE
        return dx < tileRange && dy < tileRange
    }

    aStar(startX: number, startY: number, endX: number, endY: number, maxSteps: number = 500): { x: number; y: number }[] {
        const startTileX = Math.floor(startX / TILE_SIZE)
        const startTileY = Math.floor(startY / TILE_SIZE)
        const endTileX = Math.floor(endX / TILE_SIZE)
        const endTileY = Math.floor(endY / TILE_SIZE)

        const open = new Set<string>()
        const closed = new Set<string>()
        const cameFrom = new Map<string, string>()
        const gScore = new Map<string, number>()
        const fScore = new Map<string, number>()

        const key = (x: number, y: number) => `${x},${y}`
        const startKey = key(startTileX, startTileY)
        const endKey = key(endTileX, endTileY)

        open.add(startKey)
        gScore.set(startKey, 0)
        fScore.set(startKey, this.heuristic(startTileX, startTileY, endTileX, endTileY))

        let steps = 0

        while (open.size > 0 && steps < maxSteps) {
            steps++
            let current: string | null = null
            let currentF = Infinity

            for (const k of open) {
                const f = fScore.get(k) ?? Infinity
                if (f < currentF) {
                    currentF = f
                    current = k
                }
            }

            if (!current) break
            if (current === endKey) {
                return this.reconstructPath(cameFrom, current)
            }

            open.delete(current)
            closed.add(current)

            const [cx, cy] = current.split(",").map(Number)
            const neighbors = [
                [cx + 1, cy], [cx - 1, cy],
                [cx, cy + 1], [cx, cy - 1],
            ]

            for (const [nx, ny] of neighbors) {
                const nk = key(nx, ny)
                if (closed.has(nk)) continue
                if (!this.map.isWalkable(nx, ny)) continue

                const tentativeG = (gScore.get(current) ?? Infinity) + 1

                if (!open.has(nk)) {
                    open.add(nk)
                } else if (tentativeG >= (gScore.get(nk) ?? Infinity)) {
                    continue
                }

                cameFrom.set(nk, current)
                gScore.set(nk, tentativeG)
                fScore.set(nk, tentativeG + this.heuristic(nx, ny, endTileX, endTileY))
            }
        }

        return []
    }

    private heuristic(ax: number, ay: number, bx: number, by: number): number {
        return Math.abs(ax - bx) + Math.abs(ay - by)
    }

    private reconstructPath(cameFrom: Map<string, string>, current: string): { x: number; y: number }[] {
        const path: { x: number; y: number }[] = []
        let cur: string | undefined = current

        while (cur) {
            const [cx, cy] = cur.split(",").map(Number)
            path.unshift({ x: cx * TILE_SIZE + TILE_SIZE / 2, y: cy * TILE_SIZE + TILE_SIZE / 2 })
            cur = cameFrom.get(cur)
        }

        return path
    }
}
