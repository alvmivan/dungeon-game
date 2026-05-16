import { TileType, type Room, type TileMap } from "./TileMap"

type BSPNode = {
    x: number
    y: number
    w: number
    h: number
    left: BSPNode | null
    right: BSPNode | null
    room: Room | null
}

export class BSPGenerator {
    private minRoomSize: number
    private maxRoomSize: number
    private map: TileMap

    constructor(map: TileMap, minRoomSize: number, maxRoomSize: number) {
        this.map = map
        this.minRoomSize = minRoomSize
        this.maxRoomSize = maxRoomSize
    }

    generate(): Room[] {
        const root = this.split({ x: 1, y: 1, w: this.map.width - 2, h: this.map.height - 2, left: null, right: null, room: null }, 5)
        this.carveRooms(root)
        this.connectRooms(root)
        const rooms = this.collectRooms(root)
        this.map.rooms = rooms
        return rooms
    }

    private split(node: BSPNode, depth: number): BSPNode {
        if (depth <= 0) return node
        if (node.w < this.minRoomSize * 2 && node.h < this.minRoomSize * 2) return node

        const horizontal = node.w >= node.h && node.w > this.minRoomSize * 2
            ? Math.random() < 0.6
            : node.h > this.minRoomSize * 2 && Math.random() < 0.6

        const max = (horizontal ? node.h : node.w) - this.minRoomSize
        if (max < this.minRoomSize) return node

        const splitPos = this.minRoomSize + Math.floor(Math.random() * (max - this.minRoomSize))

        if (horizontal) {
            node.left = this.split({ x: node.x, y: node.y, w: node.w, h: splitPos, left: null, right: null, room: null }, depth - 1)
            node.right = this.split({ x: node.x, y: node.y + splitPos, w: node.w, h: node.h - splitPos, left: null, right: null, room: null }, depth - 1)
        } else {
            node.left = this.split({ x: node.x, y: node.y, w: splitPos, h: node.h, left: null, right: null, room: null }, depth - 1)
            node.right = this.split({ x: node.x + splitPos, y: node.y, w: node.w - splitPos, h: node.h, left: null, right: null, room: null }, depth - 1)
        }

        return node
    }

    private carveRooms(node: BSPNode) {
        if (!node) return
        if (!node.left && !node.right) {
            const roomW = randomInt(this.minRoomSize, Math.min(node.w - 2, this.maxRoomSize))
            const roomH = randomInt(this.minRoomSize, Math.min(node.h - 2, this.maxRoomSize))
            const roomX = node.x + 1 + Math.floor(Math.random() * (node.w - roomW - 2))
            const roomY = node.y + 1 + Math.floor(Math.random() * (node.h - roomH - 2))

            node.room = { x: roomX, y: roomY, w: roomW, h: roomH, cx: Math.floor(roomX + roomW / 2), cy: Math.floor(roomY + roomH / 2) }

            for (let y = roomY; y < roomY + roomH; y++) {
                for (let x = roomX; x < roomX + roomW; x++) {
                    this.map.tiles[y][x] = TileType.Floor
                }
            }
        } else {
            this.carveRooms(node.left!)
            this.carveRooms(node.right!)
        }
    }

    private getRoom(node: BSPNode): Room | null {
        if (!node) return null
        if (node.room) return node.room
        const leftRoom = this.getRoom(node.left!)
        const rightRoom = this.getRoom(node.right!)
        return leftRoom || rightRoom
    }

    private connectRooms(node: BSPNode) {
        if (!node || !node.left || !node.right) return

        this.connectRooms(node.left)
        this.connectRooms(node.right)

        const leftRoom = this.getRoom(node.left)
        const rightRoom = this.getRoom(node.right)
        if (!leftRoom || !rightRoom) return

        this.carveCorridor(leftRoom.cx, leftRoom.cy, rightRoom.cx, rightRoom.cy)
    }

    private carveCorridor(x1: number, y1: number, x2: number, y2: number) {
        let x = x1
        let y = y1

        while (x !== x2) {
            if (x > 0 && x < this.map.width - 1 && y > 0 && y < this.map.height - 1) {
                this.map.tiles[y][x] = TileType.Floor
            }
            x += x < x2 ? 1 : -1
        }
        while (y !== y2) {
            if (x > 0 && x < this.map.width - 1 && y > 0 && y < this.map.height - 1) {
                this.map.tiles[y][x] = TileType.Floor
            }
            y += y < y2 ? 1 : -1
        }
    }

    private collectRooms(node: BSPNode): Room[] {
        if (!node) return []
        if (node.room) return [node.room]
        return [...this.collectRooms(node.left!), ...this.collectRooms(node.right!)]
    }
}

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
}
