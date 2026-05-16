"use client"

import { useRef, useEffect } from "react"
import type { TileMap } from "@/engine/dungeon/TileMap"
import { TileType } from "@/engine/dungeon/TileMap"
import { MAP_WIDTH, MAP_HEIGHT } from "@/shared/config/gameConfig"

type MinimapProps = {
    map: TileMap | null
    playerX: number
    playerY: number
}

export function Minimap({ map, playerX, playerY }: MinimapProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const scale = 3

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas || !map) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        ctx.fillStyle = "#0a0a0a"
        ctx.fillRect(0, 0, MAP_WIDTH * scale, MAP_HEIGHT * scale)

        for (let y = 0; y < MAP_HEIGHT; y++) {
            for (let x = 0; x < MAP_WIDTH; x++) {
                const tile = map.tiles[y][x]
                if (tile === TileType.Floor) {
                    ctx.fillStyle = "#333"
                    ctx.fillRect(x * scale, y * scale, scale, scale)
                } else if (tile === TileType.StairsDown) {
                    ctx.fillStyle = "#5e7a8f"
                    ctx.fillRect(x * scale, y * scale, scale, scale)
                }
            }
        }

        ctx.fillStyle = "#8f5e5e"
        ctx.beginPath()
        ctx.arc(playerX * scale, playerY * scale, 2.5, 0, Math.PI * 2)
        ctx.fill()
    }, [map, playerX, playerY])

    return (
        <canvas
            ref={canvasRef}
            width={MAP_WIDTH * scale}
            height={MAP_HEIGHT * scale}
            className="border border-[#222]"
            style={{ width: MAP_WIDTH * scale, height: MAP_HEIGHT * scale }}
        />
    )
}
