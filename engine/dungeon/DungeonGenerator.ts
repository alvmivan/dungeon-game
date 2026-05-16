import { TileMap } from "./TileMap"
import { BSPGenerator } from "./BSPGenerator"
import { populateRooms, type EnemyData, type ChestData } from "./RoomPopulator"
import { MAP_WIDTH, MAP_HEIGHT, MIN_ROOM_SIZE, MAX_ROOM_SIZE } from "@/shared/config/gameConfig"
import { runAntSimulation, thresholdTrails } from "./antSimulation"
import { ensureConnectivity } from "./connectivity"

export type DungeonLevel = {
    map: TileMap
    rooms: ReturnType<typeof populateRooms>
    depth: number
}

export function generateDungeonLevel(depth: number): DungeonLevel {
    const map = new TileMap(MAP_WIDTH, MAP_HEIGHT)
    const bsp = new BSPGenerator(map, MIN_ROOM_SIZE, MAX_ROOM_SIZE)
    const rooms = bsp.generate()

    const trailMap = runAntSimulation(rooms, MAP_WIDTH, MAP_HEIGHT)
    const newTiles = thresholdTrails(trailMap, rooms)
    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
            map.tiles[y][x] = newTiles[y][x]
        }
    }

    const populated = populateRooms(map, rooms, depth)

    const stairsTile = findStairs(map)
    ensureConnectivity(map, populated.playerStart.x, populated.playerStart.y, stairsTile.x, stairsTile.y)

    return { map, rooms: populated, depth }
}

export type { EnemyData, ChestData }

function findStairs(map: TileMap): { x: number; y: number } {
    for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
            if (map.tiles[y][x] === 3) return { x, y }
        }
    }
    return { x: 1, y: 1 }
}
