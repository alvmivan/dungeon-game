"use client"

import type { Item } from "@/engine/items/ItemTypes"
import { weaponRarityColor } from "@/shared/config/gameConfig"

type WeaponDisplayProps = {
    weapon: Item | null
}

const RARITY_LABELS: Record<number, string> = {
    1: "común", 2: "poco común", 3: "raro", 4: "épico", 5: "legendario",
}

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
    const pct = Math.min(100, (value / max) * 100)
    return (
        <div className="flex items-center gap-1.5">
            <span className="text-[#555] w-6 text-[10px] text-right font-mono">{label}</span>
            <div className="w-16 h-1 bg-[#111] overflow-hidden flex-1 border border-[#1a1a1a]">
                <div className="h-full" style={{ width: `${pct}%`, backgroundColor: color }} />
            </div>
        </div>
    )
}

export function WeaponDisplay({ weapon }: WeaponDisplayProps) {
    if (!weapon) {
        return <div className="text-[#555] text-xs font-mono">[sin arma]</div>
    }

    const color = weaponRarityColor(weapon.rarity)
    const rarityLabel = RARITY_LABELS[weapon.rarity] || ""
    const dmg = weapon.weaponDamage || 5
    const spd = weapon.weaponSpeed || 2.0
    const rng = weapon.weaponRange || 1.2
    const crit = weapon.critChance || 0.05

    return (
        <div className="flex items-start gap-2 bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2 min-w-[220px]">
            <div
                className="mt-0.5 w-8 h-8 flex items-center justify-center text-sm font-mono font-bold border"
                style={{ backgroundColor: color + "15", color, borderColor: color + "44" }}
            >
                W
            </div>
            <div className="min-w-0">
                <div className="text-xs font-mono font-bold truncate" style={{ color }}>
                    {weapon.name}
                </div>
                <div className="text-[10px] text-[#555] font-mono mb-1">
                    {rarityLabel} · t{weapon.tier}
                    {weapon.element && weapon.element !== "none" && <span className="ml-1">· {weapon.element}</span>}
                </div>
                <div className="space-y-0.5">
                    <StatBar label="atk" value={dmg} max={50} color="#8f5e5e" />
                    <StatBar label="vel" value={spd} max={3} color="#5e7a8f" />
                    <StatBar label="alc" value={rng} max={8} color="#5e8f6b" />
                    {crit > 0.05 && (
                        <div className="text-[10px] text-[#8f7a5e] font-mono">
                            crit +{Math.round(crit * 100)}%
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
