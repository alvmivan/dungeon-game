"use client"

import { useState, useEffect } from "react"

const TUTORIAL_STEPS = [
    { title: "movimiento", text: "usá WASD o las flechas para moverte por la mazmorra.", keys: "W A S D" },
    { title: "ataque", text: "hacé clic izquierdo o presioná ESPACIO para atacar con tu arma actual.", keys: "click / space" },
    { title: "armas", text: "encontrá armas en cofres y enemigos. acercate y presioná E para recoger.", keys: "E" },
    { title: "inventario", text: "presioná I para abrir el inventario. equipá armas, armaduras y pociones.", keys: "I" },
    { title: "soltar arma", text: "presioná Q para soltar el arma actual. siempre podés recogerla de nuevo.", keys: "Q" },
    { title: "descender", text: "llegá a las escaleras azules y presioná E para bajar al siguiente nivel.", keys: "E en ▼" },
    { title: "objetivo", text: "sobreviví. bajá lo más profundo posible. cada piso es más difícil.", keys: "" },
]

type TutorialProps = {
    onComplete: () => void
}

export function Tutorial({ onComplete }: TutorialProps) {
    const [step, setStep] = useState(0)
    const current = TUTORIAL_STEPS[step]

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                if (step < TUTORIAL_STEPS.length - 1) {
                    setStep((s) => s + 1)
                } else {
                    onComplete()
                }
            }
        }
        window.addEventListener("keydown", handleKey)
        return () => window.removeEventListener("keydown", handleKey)
    }, [step, onComplete])

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/90">
            <div className="bg-[#0a0a0a] border border-[#222] p-8 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-mono text-sm font-bold text-[#ccc]">
                        {current.title}
                    </h2>
                    <span className="font-mono text-[#555] text-xs">
                        {step + 1}/{TUTORIAL_STEPS.length}
                    </span>
                </div>

                <p className="font-mono text-xs text-[#888] mb-4 leading-relaxed">
                    {current.text}
                </p>

                {current.keys && (
                    <div className="flex gap-2 mb-6 flex-wrap">
                        {current.keys.split(" / ").map((key) => (
                            <kbd
                                key={key}
                                className="px-3 py-1 bg-[#111] border border-[#222] text-xs text-[#aaa] font-mono"
                            >
                                {key}
                            </kbd>
                        ))}
                    </div>
                )}

                <div className="flex gap-1 mb-4">
                    {TUTORIAL_STEPS.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 flex-1 transition-colors ${
                                i === step ? "bg-[#5e7a8f]" : "bg-[#1a1a1a]"
                            }`}
                        />
                    ))}
                </div>

                <button
                    onClick={() => {
                        if (step < TUTORIAL_STEPS.length - 1) {
                            setStep((s) => s + 1)
                        } else {
                            onComplete()
                        }
                    }}
                    className="w-full py-2 bg-[#111] border border-[#222] text-[#ccc] font-mono text-xs hover:bg-[#1a1a1a] hover:border-[#333] transition-colors"
                >
                    {step < TUTORIAL_STEPS.length - 1 ? "siguiente (enter)" : "a jugar"}
                </button>
            </div>
        </div>
    )
}
