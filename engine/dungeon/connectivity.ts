import { TileType, type TileMap } from "./TileMap"

export function ensureConnectivity(
    map: TileMap,
    startX: number,
    startY: number,
    targetX: number,
    targetY: number,
): boolean {
    const visited = floodFill(map, startX, startY)
    if (visited[targetY]?.[targetX]) return true

    carvePath(map, startX, startY, targetX, targetY)
    return false
}

function floodFill(map: TileMap, sx: number, sy: number): boolean[][] {
    const w = map.width
    const h = map.height
    const visited: boolean[][] = Array.from({ length: h }, () => Array(w).fill(false))

    const stack: { x: number; y: number }[] = [{ x: sx, y: sy }]
    visited[sy][sx] = true

    while (stack.length > 0) {
        const { x, y } = stack.pop()!
        for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
            const nx = x + dx
            const ny = y + dy
            if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue
            if (visited[ny][nx]) continue
            if (map.tiles[ny][nx] === TileType.Wall) continue
            visited[ny][nx] = true
            stack.push({ x: nx, y: ny })
        }
    }

    return visited
}

function carvePath(map: TileMap, sx: number, sy: number, tx: number, ty: number) {
    let x = sx
    let y = sy
    const w = map.width
    const h = map.height

    for (let i = 0; i < 500; i++) {
        if (x === tx && y === ty) break
        if (x > 0 && x < w - 1 && y > 0 && y < h - 1) {
            map.tiles[y][x] = TileType.Floor
        }

        const dx = tx - x
        const dy = ty - y

        if (Math.abs(dx) > Math.abs(dy)) {
            x += dx > 0 ? 1 : -1
        } else if (Math.abs(dy) > Math.abs(dx)) {
            y += dy > 0 ? 1 : -1
        } else {
            if (Math.random() < 0.5) {
                x += dx > 0 ? 1 : -1
            } else {
                y += dy > 0 ? 1 : -1
            }
        }
    }
}
