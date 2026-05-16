"use client"

type HealthBarProps = {
    hp: number
    maxHp: number
}

export function HealthBar({ hp, maxHp }: HealthBarProps) {
    const pct = Math.max(0, (hp / maxHp) * 100)
    const color = pct > 50 ? "#6b8f5e" : pct > 25 ? "#a8944a" : "#8f5e5e"

    return (
        <div className="flex items-center gap-2">
            <span className="text-[#8f5e5e] text-xs font-mono font-bold">HP</span>
            <div className="w-32 h-2 bg-[#111] overflow-hidden border border-[#222]">
                <div
                    className="h-full transition-all duration-200"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                />
            </div>
            <span className="text-[#888] text-xs font-mono">
                {hp}/{maxHp}
            </span>
        </div>
    )
}
