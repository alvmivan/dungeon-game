"use client"

import { useState } from "react"
import { Tutorial } from "./Tutorial"

type MainMenuProps = {
    onStart: () => void
}

export function MainMenu({ onStart }: MainMenuProps) {
    const [showTutorial, setShowTutorial] = useState(false)
    const [showControls, setShowControls] = useState(false)

    if (showTutorial) {
        return <Tutorial onComplete={onStart} />
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]">
            <div className="text-center px-6 max-w-lg">
                <div className="mb-2 font-mono text-4xl text-[#555]">~/dungeon</div>
                <h1 className="font-mono text-4xl font-bold text-[#e5e5e5] mb-2">
                    procedural
                </h1>
                <p className="font-mono text-[#666] mb-2 text-sm">dungeon crawler</p>
                <p className="font-mono text-[#444] text-xs mb-8">
                    bajá a la mazmorra. encontrá armas. sobreviví.
                </p>

                <div className="space-y-2">
                    <button
                        onClick={onStart}
                        className="w-full py-3 bg-[#111] border border-[#222] text-[#ccc] font-mono text-sm font-bold hover:bg-[#1a1a1a] hover:border-[#333] transition-colors"
                    >
                        jugar
                    </button>
                    <button
                        onClick={() => setShowTutorial(true)}
                        className="w-full py-2 bg-transparent border border-[#1a1a1a] text-[#555] font-mono text-xs hover:text-[#888] hover:border-[#333] transition-colors"
                    >
                        tutorial
                    </button>
                    <button
                        onClick={() => setShowControls(!showControls)}
                        className="w-full py-2 bg-transparent border border-[#1a1a1a] text-[#555] font-mono text-xs hover:text-[#888] hover:border-[#333] transition-colors"
                    >
                        {showControls ? "ocultar controles" : "controles"}
                    </button>
                </div>

                {showControls && (
                    <div className="mt-4 p-4 bg-[#0a0a0a] border border-[#1a1a1a] text-left font-mono text-xs text-[#888] space-y-1">
                        <p><kbd className="text-[#5e7a8f]">wasd</kbd> — moverse</p>
                        <p><kbd className="text-[#5e7a8f]">click / space</kbd> — atacar</p>
                        <p><kbd className="text-[#5e7a8f]">e</kbd> — interactuar (cofres, escaleras, armas)</p>
                        <p><kbd className="text-[#5e7a8f]">i</kbd> — inventario</p>
                        <p><kbd className="text-[#5e7a8f]">q</kbd> — soltar arma</p>
                        <p><kbd className="text-[#5e7a8f]">esc</kbd> — pausa</p>
                    </div>
                )}
            </div>
        </div>
    )
}
