import { TileType } from "./TileMap"
import type { Room } from "./TileMap"

const AGENT_COUNT = 600
const SENSOR_ANGLE = Math.PI / 2.8
const SENSOR_DIST = 7
const MOVE_SPEED = 2.5
const TURN_SPEED = 1.8
const RANDOM_TURN = 0.8
const EVAPORATE = 0.997
const DEPOSIT = 1.5
const FOOD_TRAIL = 80
const ITERS = 1800
const DIFFUSE_EVERY = 6
const DIFFUSE_RATE = 0.14

type Agent = { x: number; y: number; angle: number }

export function runAntSimulation(
    rooms: Room[],
    mapWidth: number,
    mapHeight: number,
): number[][] {
    const SCALE = 2
    const gw = mapWidth * SCALE
    const gh = mapHeight * SCALE
    const trail = new Float32Array(gw * gh)

    const centers = rooms.map((r) => ({ x: r.cx, y: r.cy }))

    for (const c of centers) {
        const cx = c.x * SCALE
        const cy = c.y * SCALE
        const r = SCALE * 2
        for (let dy = -r; dy <= r; dy++) {
            for (let dx = -r; dx <= r; dx++) {
                if (dx * dx + dy * dy > r * r) continue
                const idx = (cy + dy) * gw + (cx + dx)
                if (idx >= 0 && idx < trail.length) {
                    trail[idx] = FOOD_TRAIL
                }
            }
        }
    }

    const agents: Agent[] = []
    for (let i = 0; i < AGENT_COUNT; i++) {
        const c = centers[Math.floor(Math.random() * centers.length)]
        agents.push({ x: c.x * SCALE, y: c.y * SCALE, angle: Math.random() * Math.PI * 2 })
    }

    const scratch = new Float32Array(gw * gh)

    for (let iter = 0; iter < ITERS; iter++) {
        for (const a of agents) {
            const cos = Math.cos(a.angle)
            const sin = Math.sin(a.angle)
            const sd = SENSOR_DIST

            const fwd = sample(trail, gw, gh, a.x + cos * sd, a.y + sin * sd)
            const left = sample(trail, gw, gh, a.x + Math.cos(a.angle - SENSOR_ANGLE) * sd, a.y + Math.sin(a.angle - SENSOR_ANGLE) * sd)
            const right = sample(trail, gw, gh, a.x + Math.cos(a.angle + SENSOR_ANGLE) * sd, a.y + Math.sin(a.angle + SENSOR_ANGLE) * sd)

            if (fwd >= left && fwd >= right) {
                a.angle += (Math.random() - 0.5) * RANDOM_TURN
            } else if (left > right) {
                a.angle -= TURN_SPEED * (Math.random() * 0.5 + 0.5)
            } else if (right > left) {
                a.angle += TURN_SPEED * (Math.random() * 0.5 + 0.5)
            } else {
                a.angle += (Math.random() - 0.5) * TURN_SPEED
            }

            a.x += Math.cos(a.angle) * MOVE_SPEED
            a.y += Math.sin(a.angle) * MOVE_SPEED

            if (a.x < 0) a.x += gw
            if (a.x >= gw) a.x -= gw
            if (a.y < 0) a.y += gh
            if (a.y >= gh) a.y -= gh

            const idx = Math.floor(a.y) * gw + Math.floor(a.x)
            if (idx >= 0 && idx < trail.length) {
                trail[idx] = Math.min(trail[idx] + DEPOSIT, 200)
            }
        }

        for (let i = 0; i < trail.length; i++) {
            trail[i] *= EVAPORATE
        }

        if (iter % DIFFUSE_EVERY === 0) {
            blur3x3(trail, scratch, gw, gh, DIFFUSE_RATE)
            trail.set(scratch)
        }
    }

    const result: number[][] = Array.from({ length: mapHeight }, () => Array(mapWidth).fill(0))
    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
            let sum = 0
            for (let dy = 0; dy < SCALE; dy++) {
                for (let dx = 0; dx < SCALE; dx++) {
                    sum += trail[(y * SCALE + dy) * gw + (x * SCALE + dx)]
                }
            }
            result[y][x] = sum / (SCALE * SCALE)
        }
    }

    return result
}

export function thresholdTrails(trails: number[][], rooms: Room[]): TileType[][] {
    const h = trails.length
    const w = trails[0].length
    const tiles: TileType[][] = Array.from({ length: h }, () => Array(w).fill(TileType.Wall))

    const values: number[] = []
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (trails[y][x] > 0.01) values.push(trails[y][x])
        }
    }
    if (values.length === 0) return tiles

    values.sort((a, b) => a - b)
    const threshold = values[Math.floor(values.length * 0.35)]

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (trails[y][x] > threshold) {
                tiles[y][x] = TileType.Floor
            }
        }
    }

    for (const room of rooms) {
        for (let y = room.y; y < room.y + room.h; y++) {
            for (let x = room.x; x < room.x + room.w; x++) {
                if (y > 0 && y < h - 1 && x > 0 && x < w - 1) {
                    tiles[y][x] = TileType.Floor
                }
            }
        }
    }

    applyCASmoothing(tiles, rooms, 2)

    return tiles
}

function applyCASmoothing(tiles: TileType[][], rooms: Room[], iters: number) {
    const h = tiles.length
    const w = tiles[0].length

    const protectedTiles: boolean[][] = Array.from({ length: h }, () => Array(w).fill(false))
    for (const room of rooms) {
        for (let y = room.y + 1; y < room.y + room.h - 1; y++) {
            for (let x = room.x + 1; x < room.x + room.w - 1; x++) {
                if (y > 0 && y < h - 1 && x > 0 && x < w - 1) {
                    protectedTiles[y][x] = true
                }
            }
        }
    }

    for (let iter = 0; iter < iters; iter++) {
        const next = tiles.map((row) => [...row])
        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                if (protectedTiles[y][x]) continue
                let count = 0
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue
                        if (tiles[y + dy][x + dx] === TileType.Wall) count++
                    }
                }
                if (tiles[y][x] === TileType.Wall) {
                    if (count < 3) next[y][x] = TileType.Floor
                } else {
                    if (count >= 5) next[y][x] = TileType.Wall
                }
            }
        }
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                tiles[y][x] = next[y][x]
            }
        }
    }
}

function sample(trail: Float32Array, w: number, h: number, x: number, y: number): number {
    const ix = Math.floor(x)
    const iy = Math.floor(y)
    if (ix < 0 || ix >= w - 1 || iy < 0 || iy >= h - 1) return 0
    const fx = x - ix
    const fy = y - iy
    const a = trail[iy * w + ix]
    const b = trail[iy * w + ix + 1]
    const c = trail[(iy + 1) * w + ix]
    const d = trail[(iy + 1) * w + ix + 1]
    return a * (1 - fx) * (1 - fy) + b * fx * (1 - fy) + c * (1 - fx) * fy + d * fx * fy
}

function blur3x3(src: Float32Array, dst: Float32Array, w: number, h: number, rate: number) {
    const centerW = 1 - rate
    const neighW = rate / 8
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const idx = y * w + x
            let sum = src[idx] * centerW
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue
                    const nx = x + dx
                    const ny = y + dy
                    if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                        sum += src[ny * w + nx] * neighW
                    } else {
                        sum += src[idx] * neighW
                    }
                }
            }
            dst[idx] = sum
        }
    }
}
