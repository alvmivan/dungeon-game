type Palette = {
    skin: string
    skinShadow: string
    eye: string
    pupil: string
    hair: string
    hairHighlight: string
    shirt: string
    shirtShadow: string
    pants: string
    pantsShadow: string
    shoes: string
}

function seededRng(seed: number) {
    let s = seed | 0
    return () => {
        s = (s * 1664525 + 1013904223) | 0
        return (s >>> 0) / 4294967296
    }
}

function hsl(h: number, sat: number, light: number): string {
    return `hsl(${h}, ${sat}%, ${light}%)`
}

function generatePalette(seed: number): Palette {
    const rng = seededRng(seed)
    const hue = rng() * 360
    return {
        skin: hsl(25 + rng() * 15, 40 + rng() * 20, 70 + rng() * 15),
        skinShadow: hsl(25 + rng() * 15, 40 + rng() * 20, 55 + rng() * 10),
        eye: "#fff",
        pupil: "#222",
        hair: hsl(hue, 40 + rng() * 30, 25 + rng() * 20),
        hairHighlight: hsl(hue, 40 + rng() * 30, 35 + rng() * 20),
        shirt: hsl(hue + 180 + rng() * 60, 50 + rng() * 30, 40 + rng() * 20),
        shirtShadow: hsl(hue + 180 + rng() * 60, 50 + rng() * 30, 30 + rng() * 15),
        pants: hsl(hue + 90 + rng() * 60, 30 + rng() * 20, 25 + rng() * 15),
        pantsShadow: hsl(hue + 90 + rng() * 60, 30 + rng() * 20, 18 + rng() * 10),
        shoes: "#333",
    }
}

const W = 14
const H = 22

const IDLE: string[] = [
    "  .hhhhhh.  ",
    " .hhhhhhhh. ",
    ".hhsssssshh.",
    ".hsseessehh.",
    ".hssppsshh.",
    " .hsssssh.  ",
    "  .tttttt.  ",
    " a.tttttt.a ",
    " a.tttttt.a ",
    " .attttt.a. ",
    "  .attt.a.  ",
    "  ..all.a.. ",
    " .llllllll. ",
    " .llllllll. ",
    " .ll..ll..  ",
    " .ff..ff..  ",
]

const WALK_A: string[] = [
    "  .hhhhhh.  ",
    " .hhhhhhhh. ",
    ".hhsssssshh.",
    ".hsseessehh.",
    ".hssppsshh.",
    " .hsssssh.  ",
    "  .tttttt.  ",
    " a.tttttt.a ",
    " a.tttttt.a ",
    " .attttt.a. ",
    "  .attt.a.  ",
    "  ..all.a.. ",
    " .ll..lll.  ",
    " .ll..lll.. ",
    "  ll....ff  ",
    " .ff....ff  ",
]

const WALK_B: string[] = [
    "  .hhhhhh.  ",
    " .hhhhhhhh. ",
    ".hhsssssshh.",
    ".hsseessehh.",
    ".hssppsshh.",
    " .hsssssh.  ",
    "  .tttttt.  ",
    " a.tttttt.a ",
    " a.tttttt.a ",
    " .attttt.a. ",
    "  .attt.a.  ",
    "  ..all.a.. ",
    "  .lll..ll. ",
    " ..lll..ll. ",
    "  ff....ll  ",
    "  ff....ff  ",
]

const FRAMES = [IDLE, WALK_A, IDLE, WALK_B]

export type AnimFrame = "idle" | "walk"

export function getPlayerFrame(
    frame: AnimFrame,
    walkCycle: number,
    facing: "down" | "up" | "left" | "right",
    seed: number,
): HTMLCanvasElement {
    const palette = generatePalette(seed)

    const frameIndex = frame === "walk" ? (Math.floor(walkCycle / Math.PI) % 2 === 0 ? 1 : 3) : 0
    const grid = FRAMES[frameIndex]

    const scale = 2
    const c = document.createElement("canvas")
    c.width = W * scale
    c.height = H * scale
    const ctx = c.getContext("2d")!
    ctx.imageSmoothingEnabled = false

    const colorMap: Record<string, string> = {
        h: palette.hair,
        H: palette.hairHighlight,
        s: palette.skin,
        S: palette.skinShadow,
        e: palette.eye,
        p: palette.pupil,
        t: palette.shirt,
        T: palette.shirtShadow,
        a: palette.skin,
        l: palette.pants,
        L: palette.pantsShadow,
        f: palette.shoes,
    }

    for (let y = 0; y < H; y++) {
        const row = grid[y]
        if (!row) continue
        for (let x = 0; x < W; x++) {
            const ch = row[x]
            if (ch === " " || ch === ".") continue
            const color = colorMap[ch]
            if (!color) continue
            ctx.fillStyle = color
            ctx.fillRect(x * scale, y * scale, scale, scale)
        }
    }

    if (facing === "right" || facing === "up") {
        const flipped = document.createElement("canvas")
        flipped.width = c.width
        flipped.height = c.height
        const fctx = flipped.getContext("2d")!
        fctx.imageSmoothingEnabled = false
        fctx.scale(-1, 1)
        fctx.drawImage(c, -c.width, 0)
        return flipped
    }

    return c
}
