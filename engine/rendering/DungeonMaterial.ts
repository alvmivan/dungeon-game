export interface DungeonTheme {
    name: string
    floor: string
    floorAlt: string
    wall: string
    wallAccent: string
    decor: string
    ambient: string
    ambientIntensity: number
}

export const THEMES: DungeonTheme[] = [
    {
        name: "dungeon",
        floor: "#3a3a3a",
        floorAlt: "#4a4a3a",
        wall: "#6b5b4f",
        wallAccent: "#8b7b6a",
        decor: "#5a4a3a",
        ambient: "#fff8e7",
        ambientIntensity: 0.04,
    },
    {
        name: "crypt",
        floor: "#2a2a3a",
        floorAlt: "#3a3a4a",
        wall: "#5a5a6a",
        wallAccent: "#7a7a8a",
        decor: "#4a4a5a",
        ambient: "#d8e0f0",
        ambientIntensity: 0.06,
    },
    {
        name: "caves",
        floor: "#2a3a2a",
        floorAlt: "#3a4a3a",
        wall: "#5a6a5a",
        wallAccent: "#6b8a5a",
        decor: "#4a5a3a",
        ambient: "#c8f0c8",
        ambientIntensity: 0.05,
    },
    {
        name: "hell",
        floor: "#3a1a1a",
        floorAlt: "#4a2a1a",
        wall: "#6a2a1a",
        wallAccent: "#8a3a2a",
        decor: "#5a1a0a",
        ambient: "#ff6040",
        ambientIntensity: 0.08,
    },
    {
        name: "abyss",
        floor: "#1a0a2a",
        floorAlt: "#2a1a3a",
        wall: "#4a2a5a",
        wallAccent: "#6a4a8a",
        decor: "#3a1a4a",
        ambient: "#a080ff",
        ambientIntensity: 0.07,
    },
]

export function getThemeForDepth(depth: number): DungeonTheme {
    if (depth <= 10) return THEMES[0]
    if (depth <= 20) return THEMES[1]
    if (depth <= 30) return THEMES[2]
    if (depth <= 40) return THEMES[3]
    return THEMES[4]
}

export function tileRand(seed: number): number {
    let n = Math.imul(seed ^ (seed >>> 13), 1274126177)
    n = Math.imul(n ^ (n >>> 16), 374761393)
    return (n >>> 0) / 4294967296
}
