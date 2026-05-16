export enum TileType {
    Wall = 0,
    Floor = 1,
    Door = 2,
    StairsDown = 3,
    StairsUp = 4,
    Trap = 5,
    Water = 6,
}

export type Room = {
    x: number
    y: number
    w: number
    h: number
    cx: number
    cy: number
}

export class TileMap {
    tiles: TileType[][]
    width: number
    height: number
    rooms: Room[] = []
    stairsDown: { x: number; y: number } | null = null
    stairsUp: { x: number; y: number } | null = null

    constructor(width: number, height: number) {
        this.width = width
        this.height = height
        this.tiles = Array.from({ length: height }, () =>
            Array(width).fill(TileType.Wall)
        )
    }

    isWalkable(x: number, y: number): boolean {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height) return false
        return this.tiles[y][x] !== TileType.Wall
    }

    isFloor(x: number, y: number): boolean {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height) return false
        return this.tiles[y][x] === TileType.Floor
    }

    getRandomFloor(): { x: number; y: number } {
        for (let attempt = 0; attempt < 100; attempt++) {
            const x = randomInt(1, this.width - 2)
            const y = randomInt(1, this.height - 2)
            if (this.tiles[y][x] === TileType.Floor) return { x, y }
        }
        return { x: 1, y: 1 }
    }

    getFloorsInRoom(room: Room): { x: number; y: number }[] {
        const tiles: { x: number; y: number }[] = []
        for (let y = room.y; y < room.y + room.h; y++) {
            for (let x = room.x; x < room.x + room.w; x++) {
                if (this.tiles[y][x] === TileType.Floor) {
                    tiles.push({ x, y })
                }
            }
        }
        return tiles
    }
}

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
}
