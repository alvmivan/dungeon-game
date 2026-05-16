import { TILE_SIZE } from "@/shared/config/gameConfig"
import type { DungeonTheme } from "@/engine/rendering/DungeonMaterial"

const s = TILE_SIZE

function mulberry32(a: number): () => number {
    return () => {
        a |= 0
        a = (a + 0x6d2b79f5) | 0
        let t = Math.imul(a ^ (a >>> 15), 1 | a)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

const floorCache = new Map<string, OffscreenCanvas>()

export function getFloorTexture(theme: DungeonTheme, seed: number): OffscreenCanvas {
    const key = `${theme.name}_${seed}`
    if (floorCache.has(key)) return floorCache.get(key)!

    const canvas = new OffscreenCanvas(s, s)
    const ctx = canvas.getContext("2d")!

    const rng = mulberry32(seed)

    const baseR = parseInt(theme.floor.slice(1, 3), 16)
    const baseG = parseInt(theme.floor.slice(3, 5), 16)
    const baseB = parseInt(theme.floor.slice(5, 7), 16)

    const colors: string[] = []
    for (let i = 0; i < 5; i++) {
        const v = (rng() - 0.5) * 20
        const r = Math.max(0, Math.min(255, Math.round(baseR + v)))
        const g = Math.max(0, Math.min(255, Math.round(baseG + v)))
        const b = Math.max(0, Math.min(255, Math.round(baseB + v)))
        colors.push(`rgb(${r},${g},${b})`)
    }

    ctx.fillStyle = colors[0]
    ctx.fillRect(0, 0, s, s)

    const stoneCount = 2 + Math.floor(rng() * 3)
    for (let i = 0; i < stoneCount; i++) {
        const cx = rng() * s
        const cy = rng() * s
        const rx = 4 + rng() * (s / 3)
        const ry = 4 + rng() * (s / 3)
        const rot = rng() * Math.PI

        ctx.fillStyle = colors[Math.floor(rng() * colors.length)]
        ctx.beginPath()
        ctx.ellipse(cx, cy, rx, ry, rot, 0, Math.PI * 2)
        ctx.fill()
    }

    ctx.strokeStyle = `rgba(0,0,0,0.25)`
    ctx.lineWidth = 1
    for (let i = 0; i < 3; i++) {
        let cx = rng() * s
        let cy = rng() * s
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        for (let j = 0; j < 3; j++) {
            cx += (rng() - 0.5) * 10
            cy += (rng() - 0.5) * 10
            ctx.lineTo(cx, cy)
        }
        ctx.stroke()
    }

    for (let i = 0; i < 6; i++) {
        const px = rng() * s
        const py = rng() * s
        const brightness = 0.02 + rng() * 0.04
        ctx.fillStyle = `rgba(255,255,255,${brightness})`
        ctx.fillRect(px, py, 1 + rng() * 2, 1)
    }

    floorCache.set(key, canvas)
    return canvas
}

export function clearFloorCache() {
    floorCache.clear()
}
