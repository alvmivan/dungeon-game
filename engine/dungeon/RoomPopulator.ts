import { TileType, type TileMap, type Room } from "./TileMap"
import { randomInt, randomPick } from "@/shared/lib/math"

export type EnemyData = {
    type: "slime" | "skeleton" | "bat" | "goblin" | "golem"
    x: number
    y: number
}

export type ChestData = {
    x: number
    y: number
    tier: number
}

export function populateRooms(map: TileMap, rooms: Room[], depth: number): {
    enemies: EnemyData[]
    chests: ChestData[]
    playerStart: { x: number; y: number }
} {
    const enemies: EnemyData[] = []
    const chests: ChestData[] = []
    const difficulty = 1 + depth * 0.5

    const startRoom = rooms[0]
    const endRoom = rooms[rooms.length - 1]

    for (const room of rooms) {
        const isStart = room === startRoom
        const isEnd = room === endRoom

        if (!isStart && !isEnd) {
            const enemyCount = randomInt(1, Math.min(3, 1 + Math.floor(depth / 2)))
            for (let i = 0; i < enemyCount; i++) {
                const pos = getRandomFloorInRoom(map, room)
                if (pos) {
                    enemies.push({
                        type: pickEnemyType(difficulty),
                        x: pos.x,
                        y: pos.y,
                    })
                }
            }
        }

        if (!isStart && Math.random() < 0.25) {
            const pos = getRandomFloorInRoom(map, room)
            if (pos) {
                chests.push({ x: pos.x, y: pos.y, tier: depth })
            }
        }
    }

    const startPos = getRandomFloorInRoom(map, startRoom) || { x: startRoom.cx, y: startRoom.cy }

    const lastRoom = rooms[rooms.length - 1]
    const stairPos = getRandomFloorInRoom(map, lastRoom) || { x: lastRoom.cx, y: lastRoom.cy }
    map.tiles[stairPos.y][stairPos.x] = TileType.StairsDown

    return { enemies, chests, playerStart: startPos }
}

function getRandomFloorInRoom(map: TileMap, room: Room): { x: number; y: number } | null {
    for (let attempt = 0; attempt < 50; attempt++) {
        const x = randomInt(room.x + 1, room.x + room.w - 2)
        const y = randomInt(room.y + 1, room.y + room.h - 2)
        if (map.tiles[y][x] === TileType.Floor) return { x, y }
    }
    return null
}

const ENEMY_TYPES = ["slime", "skeleton", "bat", "goblin"] as const

function pickEnemyType(difficulty: number): EnemyData["type"] {
    if (difficulty > 8 && Math.random() < 0.2) return "golem"
    return randomPick([...ENEMY_TYPES])
}
