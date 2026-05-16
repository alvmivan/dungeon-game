"use client"

type PauseMenuProps = {
    onResume: () => void
    onRestart: () => void
    onMenu: () => void
}

export function PauseMenu({ onResume, onRestart, onMenu }: PauseMenuProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/80">
            <div className="bg-[#0a0a0a] border border-[#222] p-8 max-w-sm w-full mx-4 text-center">
                <h2 className="font-mono text-xl font-bold text-[#ccc] mb-6">
                    pausa
                </h2>

                <div className="space-y-2">
                    <button
                        onClick={onResume}
                        className="w-full py-3 bg-[#111] border border-[#222] text-[#ccc] font-mono text-sm hover:bg-[#1a1a1a] hover:border-[#333] transition-colors"
                    >
                        continuar
                    </button>
                    <button
                        onClick={onRestart}
                        className="w-full py-2 bg-transparent border border-[#1a1a1a] text-[#555] font-mono text-xs hover:text-[#888] hover:border-[#333] transition-colors"
                    >
                        reiniciar
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
