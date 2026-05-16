import { TILE_SIZE } from "@/shared/config/gameConfig"
import { tileRand } from "@/engine/rendering/DungeonMaterial"
import type { DungeonTheme } from "@/engine/rendering/DungeonMaterial"
import { TileType } from "@/engine/dungeon/TileMap"

const CORNER_SIZE = TILE_SIZE * 0.35

const N = 1, S = 16, E = 4, W = 64
const NE = 2, NW = 128, SE = 8, SW = 32

export function computeBitmask(tiles: TileType[][], col: number, row: number, wallType: number): number {
    let mask = 0
    const h = tiles.length
    const w = tiles[0].length

    if (row > 0 && tiles[row - 1][col] === wallType) mask |= 1
    if (row > 0 && col < w - 1 && tiles[row - 1][col + 1] === wallType) mask |= 2
    if (col < w - 1 && tiles[row][col + 1] === wallType) mask |= 4
    if (row < h - 1 && col < w - 1 && tiles[row + 1][col + 1] === wallType) mask |= 8
    if (row < h - 1 && tiles[row + 1][col] === wallType) mask |= 16
    if (row < h - 1 && col > 0 && tiles[row + 1][col - 1] === wallType) mask |= 32
    if (col > 0 && tiles[row][col - 1] === wallType) mask |= 64
    if (row > 0 && col > 0 && tiles[row - 1][col - 1] === wallType) mask |= 128

    return mask
}

function isSet(mask: number, bit: number): boolean {
    return (mask & bit) !== 0
}

export function drawWallTile(ctx: CanvasRenderingContext2D, x: number, y: number, mask: number, theme: DungeonTheme, seed: number) {
    const s = TILE_SIZE

    ctx.fillStyle = theme.wall
    ctx.fillRect(x, y, s, s)

    const rng = () => tileRand(seed)

    ctx.fillStyle = `rgba(0,0,0,${0.04 + rng() * 0.06})`
    for (let i = 0; i < 3; i++) {
        const sx = x + rng() * s
        const sy = y + rng() * s
        ctx.beginPath()
        ctx.arc(sx, sy, 1 + rng() * 2, 0, Math.PI * 2)
        ctx.fill()
    }

    const top = isSet(mask, N)
    const bottom = isSet(mask, S)
    const left = isSet(mask, W)
    const right = isSet(mask, E)
    const topLeft = isSet(mask, NW)
    const topRight = isSet(mask, NE)
    const bottomLeft = isSet(mask, SW)
    const bottomRight = isSet(mask, SE)

    if (!top) {
        ctx.fillStyle = theme.wallAccent
        ctx.fillRect(x, y, s, 2)
    } else {
        ctx.fillStyle = `rgba(255,255,255,0.06)`
        ctx.fillRect(x, y, s, 1)
    }

    if (!left) {
        ctx.fillStyle = theme.wallAccent
        ctx.fillRect(x, y + 2, 2, s - 2)
    }

    if (!right) {
        ctx.fillStyle = `rgba(0,0,0,0.2)`
        ctx.fillRect(x + s - 2, y + 2, 2, s - 2)
    }

    if (!bottom) {
        ctx.fillStyle = `rgba(0,0,0,0.15)`
        ctx.fillRect(x, y + s - 2, s, 2)
    }

    if (top && left && !topLeft) {
        ctx.fillStyle = theme.floor
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + CORNER_SIZE, y)
        ctx.lineTo(x, y + CORNER_SIZE)
        ctx.closePath()
        ctx.fill()
    }

    if (top && right && !topRight) {
        ctx.fillStyle = theme.floor
        ctx.beginPath()
        ctx.moveTo(x + s, y)
        ctx.lineTo(x + s - CORNER_SIZE, y)
        ctx.lineTo(x + s, y + CORNER_SIZE)
        ctx.closePath()
        ctx.fill()
    }

    if (bottom && left && !bottomLeft) {
        ctx.fillStyle = theme.floor
        ctx.beginPath()
        ctx.moveTo(x, y + s)
        ctx.lineTo(x + CORNER_SIZE, y + s)
        ctx.lineTo(x, y + s - CORNER_SIZE)
        ctx.closePath()
        ctx.fill()
    }

    if (bottom && right && !bottomRight) {
        ctx.fillStyle = theme.floor
        ctx.beginPath()
        ctx.moveTo(x + s, y + s)
        ctx.lineTo(x + s - CORNER_SIZE, y + s)
        ctx.lineTo(x + s, y + s - CORNER_SIZE)
        ctx.closePath()
        ctx.fill()
    }

    if (!top && !left && topLeft) {
        ctx.fillStyle = `rgba(0,0,0,0.12)`
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + CORNER_SIZE * 0.5, y)
        ctx.lineTo(x, y + CORNER_SIZE * 0.5)
        ctx.closePath()
        ctx.fill()
    }
    if (!top && !right && topRight) {
        ctx.fillStyle = `rgba(0,0,0,0.12)`
        ctx.beginPath()
        ctx.moveTo(x + s, y)
        ctx.lineTo(x + s - CORNER_SIZE * 0.5, y)
        ctx.lineTo(x + s, y + CORNER_SIZE * 0.5)
        ctx.closePath()
        ctx.fill()
    }
    if (!bottom && !left && bottomLeft) {
        ctx.fillStyle = `rgba(0,0,0,0.12)`
        ctx.beginPath()
        ctx.moveTo(x, y + s)
        ctx.lineTo(x + CORNER_SIZE * 0.5, y + s)
        ctx.lineTo(x, y + s - CORNER_SIZE * 0.5)
        ctx.closePath()
        ctx.fill()
    }
    if (!bottom && !right && bottomRight) {
        ctx.fillStyle = `rgba(0,0,0,0.12)`
        ctx.beginPath()
        ctx.moveTo(x + s, y + s)
        ctx.lineTo(x + s - CORNER_SIZE * 0.5, y + s)
        ctx.lineTo(x + s, y + s - CORNER_SIZE * 0.5)
        ctx.closePath()
        ctx.fill()
    }

    ctx.fillStyle = `rgba(0,0,0,0.03)`
    if (top && left) ctx.fillRect(x, y, 2, 2)
    if (top && right) ctx.fillRect(x + s - 2, y, 2, 2)
    if (bottom && left) ctx.fillRect(x, y + s - 2, 2, 2)
    if (bottom && right) ctx.fillRect(x + s - 2, y + s - 2, 2, 2)
}

export function drawFloorTile(ctx: CanvasRenderingContext2D, x: number, y: number, mask: number, theme: DungeonTheme, seed: number) {
    const s = TILE_SIZE

    ctx.fillStyle = theme.floor
    ctx.fillRect(x, y, s, s)

    const rng = () => tileRand(seed)

    ctx.fillStyle = `rgba(255,255,255,${0.02 + rng() * 0.03})`
    for (let i = 0; i < 4; i++) {
        ctx.fillRect(x + rng() * s, y + rng() * s, 1 + rng() * 2, 1)
    }

    const topWall = isSet(mask, N)
    const bottomWall = isSet(mask, S)
    const leftWall = isSet(mask, W)
    const rightWall = isSet(mask, E)
    const topLeftWall = isSet(mask, NW)
    const topRightWall = isSet(mask, NE)
    const bottomLeftWall = isSet(mask, SW)
    const bottomRightWall = isSet(mask, SE)

    if (topWall) {
        ctx.fillStyle = `rgba(0,0,0,0.2)`
        ctx.fillRect(x, y, s, 4)
    }
    if (bottomWall) {
        ctx.fillStyle = `rgba(0,0,0,0.15)`
        ctx.fillRect(x, y + s - 4, s, 4)
    }
    if (leftWall) {
        ctx.fillStyle = `rgba(0,0,0,0.15)`
        ctx.fillRect(x, y, 4, s)
    }
    if (rightWall) {
        ctx.fillStyle = `rgba(0,0,0,0.15)`
        ctx.fillRect(x + s - 4, y, 4, s)
    }

    if (topWall && leftWall && !topLeftWall) {
        ctx.fillStyle = `rgba(0,0,0,0.08)`
        ctx.fillRect(x, y, CORNER_SIZE * 0.6, CORNER_SIZE * 0.6)
    }
    if (topWall && rightWall && !topRightWall) {
        ctx.fillStyle = `rgba(0,0,0,0.08)`
        ctx.fillRect(x + s - CORNER_SIZE * 0.6, y, CORNER_SIZE * 0.6, CORNER_SIZE * 0.6)
    }
    if (bottomWall && leftWall && !bottomLeftWall) {
        ctx.fillStyle = `rgba(0,0,0,0.08)`
        ctx.fillRect(x, y + s - CORNER_SIZE * 0.6, CORNER_SIZE * 0.6, CORNER_SIZE * 0.6)
    }
    if (bottomWall && rightWall && !bottomRightWall) {
        ctx.fillStyle = `rgba(0,0,0,0.08)`
        ctx.fillRect(x + s - CORNER_SIZE * 0.6, y + s - CORNER_SIZE * 0.6, CORNER_SIZE * 0.6, CORNER_SIZE * 0.6)
    }
}
