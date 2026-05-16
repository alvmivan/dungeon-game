"use client"

import { useState, useCallback } from "react"
import { MainMenu } from "@/components/UI/MainMenu"
import { GameContainer } from "@/components/Game/GameContainer"

export default function DungeonPage() {
    const [screen, setScreen] = useState<"menu" | "game">("menu")

    const handleStart = useCallback(() => {
        setScreen("game")
    }, [])

    const handleGoToMenu = useCallback(() => {
        setScreen("menu")
    }, [])

    if (screen === "game") {
        return (
            <GameContainer
                showTutorial={false}
                onGoToMenu={handleGoToMenu}
            />
        )
    }

    return <MainMenu onStart={handleStart} />
}
