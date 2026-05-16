import type { Item } from "./ItemTypes"

type BaseItemDef = {
    id: string
    name: string
    type: Item["type"]
    slot: Item["slot"]
    tier: number
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

export const BASE_ITEMS: BaseItemDef[] = [
    // Weapons
    { id: "knife", name: "Cuchillo", type: "weapon", slot: "weapon", tier: 1, description: "Hoja corta y oxidada", weaponDamage: 5, weaponSpeed: 2.0, weaponRange: 1.2 },
    { id: "dagger", name: "Daga", type: "weapon", slot: "weapon", tier: 1, description: "Pequeña pero letal", weaponDamage: 4, weaponSpeed: 2.5, weaponRange: 1.0, critChance: 0.1 },
    { id: "sword", name: "Espada", type: "weapon", slot: "weapon", tier: 2, description: "Hoja larga balanceada", weaponDamage: 10, weaponSpeed: 1.2, weaponRange: 1.8 },
    { id: "axe", name: "Hacha", type: "weapon", slot: "weapon", tier: 2, description: "Golpe devastador", weaponDamage: 18, weaponSpeed: 0.8, weaponRange: 1.5 },
    { id: "spear", name: "Lanza", type: "weapon", slot: "weapon", tier: 2, description: "Alcance superior", weaponDamage: 8, weaponSpeed: 1.0, weaponRange: 3.0 },
    { id: "staff", name: "Bastón", type: "weapon", slot: "weapon", tier: 2, description: "Canaliza energía", weaponDamage: 7, weaponSpeed: 1.5, weaponRange: 2.5, element: "fire" },
    { id: "bow", name: "Arco", type: "weapon", slot: "weapon", tier: 3, description: "Dispara a distancia", weaponDamage: 12, weaponSpeed: 0.6, weaponRange: 6.0 },
    { id: "hammer", name: "Martillo", type: "weapon", slot: "weapon", tier: 3, description: "Aplasta huesos", weaponDamage: 22, weaponSpeed: 0.5, weaponRange: 1.3 },

    // Armor
    { id: "leather-vest", name: "Chaleco de cuero", type: "armor", slot: "body", tier: 1, description: "Protección ligera", defense: 2, hpBonus: 5 },
    { id: "chainmail", name: "Cota de malla", type: "armor", slot: "body", tier: 2, description: "Protección media", defense: 5, hpBonus: 10 },
    { id: "plate-armor", name: "Armadura de placas", type: "armor", slot: "body", tier: 3, description: "Protección pesada", defense: 10, hpBonus: 20, speedBonus: -10 },
    { id: "robe", name: "Túnica arcana", type: "armor", slot: "body", tier: 2, description: "Tejido con runas", defense: 3, hpBonus: 8, speedBonus: 5 },

    // Helmets
    { id: "hood", name: "Capucha", type: "helmet", slot: "head", tier: 1, description: "Cubre tu identidad", defense: 1, hpBonus: 3 },
    { id: "iron-helm", name: "Yelmo de hierro", type: "helmet", slot: "head", tier: 2, description: "Protección craneal", defense: 4, hpBonus: 8 },
    { id: "crown", name: "Corona", type: "helmet", slot: "head", tier: 3, description: "Realeza enana", defense: 3, hpBonus: 15 },

    // Accessories
    { id: "ring-protection", name: "Anillo de protección", type: "accessory", slot: "accessory", tier: 2, description: "Escudo mágico", defense: 3 },
    { id: "amulet-vigor", name: "Amuleto de vigor", type: "accessory", slot: "accessory", tier: 2, description: "Energía vital", hpBonus: 15 },
    { id: "ring-speed", name: "Anillo de velocidad", type: "accessory", slot: "accessory", tier: 2, description: "Movimiento felino", speedBonus: 15 },
    { id: "lucky-charm", name: "Amuleto de suerte", type: "accessory", slot: "accessory", tier: 3, description: "Golpes certeros", critChance: 0.08 },

    // Potions
    { id: "health-potion", name: "Poción de salud", type: "potion", slot: "none", tier: 1, description: "Restaura 25 HP", healAmount: 25 },
    { id: "big-health-potion", name: "Poción de salud +", type: "potion", slot: "none", tier: 2, description: "Restaura 50 HP", healAmount: 50 },
    { id: "elixir", name: "Elixir de vida", type: "potion", slot: "none", tier: 3, description: "Restaura 100 HP", healAmount: 100 },
]

export function getBaseItem(id: string): BaseItemDef | undefined {
    return BASE_ITEMS.find((i) => i.id === id)
}
