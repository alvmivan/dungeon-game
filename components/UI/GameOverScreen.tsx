"use client"

type GameOverScreenProps = {
    score: number
    depth: number
    onRestart: () => void
    onMenu: () => void
}

export function GameOverScreen({ score, depth, onRestart, onMenu }: GameOverScreenProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/90">
            <div className="bg-[#0a0a0a] border border-[#222] p-8 max-w-sm w-full mx-4 text-center">
                <div className="font-mono text-3xl font-bold text-[#8f5e5e] mb-2">
                    has muerto
                </div>
                <p className="font-mono text-xs text-[#555] mb-6">
                    piso {depth} · score {score}
                </p>

                <div className="space-y-2">
                    <button
                        onClick={onRestart}
                        className="w-full py-3 bg-[#111] border border-[#222] text-[#ccc] font-mono text-sm hover:bg-[#1a1a1a] hover:border-[#333] transition-colors"
                    >
                        reintentar
                    </button>
                    <button
                        onClick={onMenu}
                        className="w-full py-2 bg-transparent border border-[#1a1a1a] text-[#555] font-mono text-xs hover:text-[#888] hover:border-[#333] transition-colors"
                    >
                        menú principal
                    </button>
                </div>
            </div>
        </div>
    )
}
