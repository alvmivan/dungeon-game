"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { GameCanvas } from "./GameCanvas"
import type { GameEngine } from "@/engine/GameEngine"
import { HealthBar } from "@/components/HUD/HealthBar"
import { WeaponDisplay } from "@/components/HUD/WeaponDisplay"
import { Minimap } from "@/components/HUD/Minimap"
import { ScoreDisplay } from "@/components/HUD/ScoreDisplay"
import { PauseMenu } from "@/components/UI/PauseMenu"
import { GameOverScreen } from "@/components/UI/GameOverScreen"
import { Tutorial } from "@/components/UI/Tutorial"
import { InventoryMenu } from "@/components/UI/InventoryMenu"
import { bus } from "@/engine/EventBus"
import type { Item, EquipSlots } from "@/engine/items/ItemTypes"

type PlayerState = {
    hp: number
    maxHp: number
    weapon: Item | null
    level: number
    score: number
    depth: number
    inventory: import("@/engine/Inventory").Inventory | null
    totalDamage: number
    totalCritChance: number
    defense: number
}

const INITIAL_PLAYER: PlayerState = {
    hp: 50, maxHp: 50, weapon: null, level: 1, score: 0, depth: 1,
    inventory: null, totalDamage: 5, totalCritChance: 0.05, defense: 0,
}

export function GameContainer({ showTutorial = false, onGoToMenu }: { showTutorial?: boolean; onGoToMenu: () => void }) {
    const [playerState, setPlayerState] = useState<PlayerState>(INITIAL_PLAYER)
    const [showPause, setShowPause] = useState(false)
    const [showGameOver, setShowGameOver] = useState(false)
    const [showTut, setShowTut] = useState(showTutorial)
    const [showInventory, setShowInventory] = useState(false)
    const [mapView, setMapView] = useState(false)
    const engineRef = useRef<GameEngine | null>(null)
    const pauseLockRef = useRef(false)
    const inventoryLockRef = useRef(false)

    const onEngineReady = useCallback((engine: GameEngine) => {
        engineRef.current = engine
    }, [])

    useEffect(() => {
        const unsub1 = bus.on("player-updated", (arg: unknown) => {
            setPlayerState(arg as PlayerState)
        })
        const unsub2 = bus.on("game-paused", () => {
            if (!pauseLockRef.current) {
                pauseLockRef.current = true
                setShowPause(true)
            }
        })
        const unsub3 = bus.on("game-over", () => {
            setShowGameOver(true)
        })
        const unsub4 = bus.on("open-inventory", () => {
            if (!inventoryLockRef.current) {
                inventoryLockRef.current = true
                setShowInventory(true)
            }
        })

        return () => {
            unsub1(); unsub2(); unsub3(); unsub4()
        }
    }, [])

    const handleResume = useCallback(() => {
        setShowPause(false)
        pauseLockRef.current = false
        engineRef.current?.resume()
    }, [])

    const handleRestart = useCallback(() => {
        setShowPause(false)
        setShowGameOver(false)
        setShowInventory(false)
        pauseLockRef.current = false
        inventoryLockRef.current = false
        setPlayerState(INITIAL_PLAYER)
        setTimeout(() => engineRef.current?.restart(), 50)
    }, [])

    const handleMenu = useCallback(() => {
        engineRef.current?.stop()
        onGoToMenu()
    }, [onGoToMenu])

    const handleCloseInventory = useCallback(() => {
        setShowInventory(false)
        inventoryLockRef.current = false
        engineRef.current?.resume()
    }, [])

    const handleEquip = useCallback((item: Item) => {
        engineRef.current?.equipItem(item)
    }, [])

    const handleUnequip = useCallback((slot: keyof EquipSlots) => {
        engineRef.current?.unequipSlot(slot)
    }, [])

    const handleUsePotion = useCallback((index: number) => {
        engineRef.current?.usePotion(index)
    }, [])

    const handleDropItem = useCallback((index: number) => {
        engineRef.current?.dropItem(index)
    }, [])

    return (
        <div className="relative w-full h-screen overflow-hidden bg-[#050505] select-none">
            <GameCanvas onEngineReady={onEngineReady} />

            <div className="absolute top-0 left-0 right-0 p-3 flex items-start justify-between pointer-events-none">
                <div className="space-y-1">
                    <HealthBar hp={playerState.hp} maxHp={playerState.maxHp} />
                    <WeaponDisplay weapon={playerState.weapon} />
                </div>
                <ScoreDisplay score={playerState.score} depth={playerState.depth} />
            </div>

            <div className="absolute bottom-4 left-4 flex gap-2">
                <button
                    onClick={() => setMapView(!mapView)}
                    className="px-3 py-1.5 bg-[#0a0a0a] hover:bg-[#111] text-[#888] font-mono text-xs border border-[#222] pointer-events-auto transition-colors"
                >
                    {mapView ? "[cerrar mapa]" : "[mapa]"}
                </button>
                <button
                    onClick={() => {
                        engineRef.current!.state = "paused"
                        setShowInventory(true)
                    }}
                    className="px-3 py-1.5 bg-[#0a0a0a] hover:bg-[#111] text-[#888] font-mono text-xs border border-[#222] pointer-events-auto transition-colors"
                >
                    [inventario]
                </button>
            </div>

            {mapView && (
                <div className="absolute bottom-12 left-4 border border-[#222] overflow-hidden">
                    <Minimap
                        map={null}
                        playerX={0}
                        playerY={0}
                    />
                </div>
            )}

            <div className="absolute bottom-4 right-4 text-[#444] text-[10px] font-mono pointer-events-none text-right leading-relaxed">
                wasd mover<br />
                click atacar · e interactuar<br />
                q soltar · i inventario
            </div>

            {showTut && <Tutorial onComplete={() => setShowTut(false)} />}
            {showPause && (
                <PauseMenu
                    onResume={handleResume}
                    onRestart={handleRestart}
                    onMenu={handleMenu}
                />
            )}
            {showGameOver && (
                <GameOverScreen
                    score={playerState.score}
                    depth={playerState.depth}
                    onRestart={handleRestart}
                    onMenu={handleMenu}
                />
            )}
            {showInventory && playerState.inventory && (
                <InventoryMenu
                    inventory={playerState.inventory}
                    playerHp={playerState.hp}
                    playerMaxHp={playerState.maxHp}
                    totalDamage={playerState.totalDamage}
                    totalCritChance={playerState.totalCritChance}
                    defense={playerState.defense}
                    onClose={handleCloseInventory}
                    onEquip={handleEquip}
                    onUnequip={handleUnequip}
                    onUsePotion={handleUsePotion}
                    onDrop={handleDropItem}
                />
            )}
        </div>
    )
}
