"use client"

import { useEffect, useRef, useCallback } from "react"
import { GameEngine } from "@/engine/GameEngine"

type GameCanvasProps = {
    onEngineReady: (engine: GameEngine) => void
}

export function GameCanvas({ onEngineReady }: GameCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const engineRef = useRef<GameEngine | null>(null)

    const resizeCanvas = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        engineRef.current?.setCanvasSize(canvas.width, canvas.height)
    }, [])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        resizeCanvas()
        const engine = new GameEngine(canvas)
        engineRef.current = engine
        engine.start()
        onEngineReady(engine)

        window.addEventListener("resize", resizeCanvas)

        return () => {
            window.removeEventListener("resize", resizeCanvas)
            engine.stop()
        }
    }, [onEngineReady, resizeCanvas])

    return (
        <canvas
            ref={canvasRef}
            className="block w-full h-full cursor-crosshair"
            tabIndex={0}
        />
    )
}
