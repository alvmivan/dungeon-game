"use client"

import { useEffect } from "react"
import type { Inventory } from "@/engine/Inventory"
import type { Item, EquipSlots } from "@/engine/items/ItemTypes"
import { SLOT_LABELS } from "@/engine/items/ItemTypes"
import { weaponRarityColor } from "@/shared/config/gameConfig"

type InventoryMenuProps = {
    inventory: Inventory
    playerHp: number
    playerMaxHp: number
    totalDamage: number
    totalCritChance: number
    defense: number
    onClose: () => void
    onEquip: (item: Item) => void
    onUnequip: (slot: keyof EquipSlots) => void
    onUsePotion: (index: number) => void
    onDrop: (index: number) => void
}

export function InventoryMenu({ inventory, playerHp, playerMaxHp, totalDamage, totalCritChance, defense, onClose, onEquip, onUnequip, onUsePotion, onDrop }: InventoryMenuProps) {

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "i" || e.key === "I" || e.key === "escape") {
                onClose()
            }
        }
        window.addEventListener("keydown", handleKey)
        return () => window.removeEventListener("keydown", handleKey)
    }, [onClose])

    const slots: { key: keyof EquipSlots; label: string }[] = [
        { key: "weapon", label: "mano" },
        { key: "head", label: "cabeza" },
        { key: "body", label: "cuerpo" },
        { key: "accessory", label: "accesorio" },
    ]

    const potions = inventory.backpack
        .map((item, i) => ({ item, index: i }))
        .filter(({ item }) => item.type === "potion")

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/85">
            <div className="bg-[#0a0a0a] border border-[#222] w-full max-w-lg max-h-[85vh] overflow-y-auto mx-4">
                <div className="sticky top-0 bg-[#0a0a0a] border-b border-[#222] p-4 flex items-center justify-between">
                    <h2 className="font-mono text-sm font-bold text-[#ccc]">
                        inventario
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-[#555] hover:text-[#ccc] font-mono text-sm transition-colors"
                    >
                        [x]
                    </button>
                </div>

                <div className="p-4 space-y-4">

                    <div>
                        <h3 className="font-mono text-[10px] text-[#555] uppercase tracking-wider mb-2">estado</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 bg-[#0d0d0d] border border-[#1a1a1a] p-3">
                            <StatLine label="vida" value={`${playerHp}/${playerMaxHp}`} color="#8f5e5e" />
                            <StatLine label="defensa" value={`${defense}`} color="#5e7a8f" />
                            <StatLine label="daño" value={`${totalDamage}`} color="#8f6b5e" />
                            <StatLine label="crítico" value={`${Math.round(totalCritChance * 100)}%`} color="#8f7a5e" />
                        </div>
                    </div>

                    <div>
                        <h3 className="font-mono text-[10px] text-[#555] uppercase tracking-wider mb-2">equipamiento</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {slots.map(({ key, label }) => (
                                <EquipSlotBox
                                    key={key}
                                    label={label}
                                    item={inventory.slots[key]}
                                    onUnequip={() => onUnequip(key)}
                                />
                            ))}
                        </div>
                    </div>

                    {potions.length > 0 && (
                        <div>
                            <h3 className="font-mono text-[10px] text-[#555] uppercase tracking-wider mb-2">
                                pociones ({potions.length})
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                {potions.map(({ item, index }) => (
                                    <button
                                        key={item.id}
                                        onClick={() => onUsePotion(index)}
                                        className="flex items-center gap-2 p-2 bg-[#0d0d0d] border border-[#1a1a1a] hover:border-[#333] text-left transition-colors"
                                    >
                                        <span className="text-[#5e8f6b] font-mono text-xs font-bold">P</span>
                                        <div className="min-w-0">
                                            <div className="font-mono text-xs font-bold text-[#5e8f6b] truncate">{item.name}</div>
                                            <div className="font-mono text-[10px] text-[#555]">+{item.healAmount} hp · click para usar</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <h3 className="font-mono text-[10px] text-[#555] uppercase tracking-wider mb-2">
                            mochila ({inventory.backpack.length}/{inventory.maxBackpackSize})
                        </h3>
                        {inventory.backpack.length === 0 ? (
                            <div className="text-center text-[#444] font-mono text-xs py-6">
                                [vacío]
                            </div>
                        ) : (
                            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                                {inventory.backpack.map((item, i) => (
                                    <BackpackSlot
                                        key={`${item.id}-${i}`}
                                        item={item}
                                        index={i}
                                        onUse={() => {
                                            if (item.type === "potion") {
                                                onUsePotion(i)
                                            } else if (item.slot !== "none") {
                                                onEquip(item)
                                            }
                                        }}
                                        onDrop={() => onDrop(i)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                </div>

                <div className="border-t border-[#222] p-3 text-center font-mono text-[10px] text-[#444]">
                    click en item para equipar/usar · click en slot para desequipar · i/esc para cerrar
                </div>
            </div>
        </div>
    )
}

function ItemIcon({ item, size = 28 }: { item: Item; size?: number }) {
    const color = weaponRarityColor(item.rarity)
    const icons: Record<string, string> = {
        weapon: "W", armor: "A", helmet: "H", accessory: "X", potion: "P",
    }
    return (
        <div className="flex items-center justify-center font-mono text-xs font-bold" style={{ width: size, height: size, backgroundColor: color + "15", border: `1px solid ${color}44`, color }}>
            {icons[item.type] || "?"}
        </div>
    )
}

function EquipSlotBox({ label, item, onUnequip }: { label: string; item: Item | null; onUnequip: () => void }) {
    return (
        <div className="flex items-center gap-2 p-2 bg-[#0d0d0d] border border-[#1a1a1a] cursor-pointer hover:border-[#333] transition-colors" onClick={() => item && onUnequip()} title={item ? "click para desequipar" : "vacío"}>
            <div className="w-7 h-7 flex items-center justify-center text-xs font-mono" style={{ backgroundColor: item ? weaponRarityColor(item.rarity) + "15" : "#0a0a0a", border: `1px solid ${item ? weaponRarityColor(item.rarity) + "44" : "#1a1a1a"}`, color: item ? weaponRarityColor(item.rarity) : "#333" }}>
                {item ? <ItemIcon item={item} size={18} /> : "—"}
            </div>
            <div className="min-w-0 flex-1">
                <div className="font-mono text-[10px] text-[#555]">{label}</div>
                {item ? <div className="font-mono text-xs font-bold truncate" style={{ color: weaponRarityColor(item.rarity) }}>{item.name}</div> : <div className="font-mono text-xs text-[#333]">[vacío]</div>}
            </div>
        </div>
    )
}

function BackpackSlot({ item, index, onUse, onDrop }: { item: Item; index: number; onUse: () => void; onDrop: () => void }) {
    const color = weaponRarityColor(item.rarity)
    return (
        <div className="flex items-center gap-2 p-1.5 bg-[#0d0d0d] border border-[#1a1a1a] group hover:border-[#333] transition-colors">
            <span className="font-mono text-[10px] text-[#444] w-4 text-right">{index + 1}</span>
            <ItemIcon item={item} size={22} />
            <div className="min-w-0 flex-1 cursor-pointer" onClick={onUse}>
                <div className="font-mono text-xs font-bold truncate" style={{ color }}>{item.name}</div>
                <div className="font-mono text-[10px] text-[#555] truncate">
                    {SLOT_LABELS[item.slot]} · t{item.tier}
                    {item.defense && <span className="ml-1">· def +{item.defense}</span>}
                    {item.hpBonus && <span className="ml-1">· hp +{item.hpBonus}</span>}
                    {item.healAmount && <span className="ml-1">· cura +{item.healAmount}</span>}
                    {item.weaponDamage && <span className="ml-1">· atk {item.weaponDamage}</span>}
                </div>
            </div>
            <button onClick={onDrop} className="opacity-0 group-hover:opacity-100 text-[#444] hover:text-[#8f5e5e] font-mono text-xs px-1 transition-opacity" title="tirar">[x]</button>
        </div>
    )
}

function StatLine({ label, value, color = "#ccc" }: { label: string; value: string; color?: string }) {
    return (
        <div className="flex justify-between items-center font-mono text-xs">
            <span className="text-[#555]">{label}</span>
            <span style={{ color }}>{value}</span>
        </div>
    )
}
