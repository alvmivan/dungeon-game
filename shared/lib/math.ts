export function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t
}

export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value))
}

export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min
}

export function randomPick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}

export function manhattanDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2)
}

export function distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
}

export function angleBetween(x1: number, y1: number, x2: number, y2: number): number {
    return Math.atan2(y2 - y1, x2 - x1)
}

export type Point = { x: number; y: number }
export type Rect = { x: number; y: number; w: number; h: number }
