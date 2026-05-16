export type ItemSlot = "weapon" | "head" | "body" | "accessory" | "none"

export type ItemType = "weapon" | "armor" | "helmet" | "accessory" | "potion"

export interface Item {
    id: string
    name: string
    type: ItemType
    slot: ItemSlot
    tier: number
    rarity: number
    description: string

    weaponDamage?: number
    weaponSpeed?: number
    weaponRange?: number
    critChance?: number
    element?: string

    defense?: number
    hpBonus?: number
    speedBonus?: number

    healAmount?: number
}

export type EquipSlots = {
    weapon: Item | null
    head: Item | null
    body: Item | null
    accessory: Item | null
}

export const RARITY_LABELS: Record<number, string> = {
    1: "Común",
    2: "Poco común",
    3: "Raro",
    4: "Épico",
    5: "Legendario",
}

export const SLOT_LABELS: Record<ItemSlot, string> = {
    weapon: "Mano",
    head: "Cabeza",
    body: "Cuerpo",
    accessory: "Accesorio",
    none: "—",
}
