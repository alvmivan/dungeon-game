import { randomPick, randomInt } from "@/shared/lib/math"
import type { Item } from "./ItemTypes"
import { BASE_ITEMS } from "./ItemDatabase"

let nextItemId = 1

const PREFIXES = [
    { word: "Ardiente", weaponDamage: 1.3, element: "fire" },
    { word: "Gélido", weaponDamage: 1.2, element: "ice" },
    { word: "Veloz", weaponSpeed: 1.4 },
    { word: "Pesado", weaponDamage: 1.5, weaponSpeed: 0.7 },
    { word: "Reforzado", defense: 1.4 },
    { word: "Vigoroso", hpBonus: 1.5 },
    { word: "Preciso", critChance: 0.1 },
    { word: "Venomoso", weaponDamage: 1.1, element: "poison" },
    { word: "Sagrado", weaponDamage: 1.4, element: "holy" },
    { word: "Feroz", weaponDamage: 1.3, weaponSpeed: 1.1 },
]

export class ItemGenerator {
    static createStarterKnife(): Item {
        return {
            id: "starter-knife",
            name: "Cuchillo oxidado",
            type: "weapon",
            slot: "weapon",
            tier: 1,
            rarity: 1,
            description: "Hoja corta y oxidada. Sirve para empezar.",
            weaponDamage: 5,
            weaponSpeed: 2.0,
            weaponRange: 1.2,
            critChance: 0.05,
        }
    }

    static generate(depth: number): Item {
        const tier = this.calcTier(depth)
        const rarity = this.rollRarity(depth)
        const base = this.pickBase(tier)

        const item = this.baseToItem(base, tier, rarity)

        if (Math.random() < 0.35) {
            const prefix = randomPick(PREFIXES)
            item.name = `${prefix.word} ${item.name}`
            this.applyModifiers(item, prefix)
        }

        if ((item.type === "weapon" || item.type === "armor") && rarity >= 3) {
            item.name += ` +${rarity - 1}`
        }

        return item
    }

    private static baseToItem(base: typeof BASE_ITEMS[number], tier: number, rarity: number): Item {
        const mult = this.rarityMult(rarity)
        return {
            id: `item_${nextItemId++}`,
            name: base.name,
            type: base.type,
            slot: base.slot,
            tier: base.tier + tier - 1,
            rarity,
            description: base.description,
            weaponDamage: base.weaponDamage ? +(base.weaponDamage * mult * (1 + (tier - 1) * 0.2)).toFixed(1) : undefined,
            weaponSpeed: base.weaponSpeed ? +(base.weaponSpeed * this.raritySpeedMult(rarity)).toFixed(2) : undefined,
            weaponRange: base.weaponRange,
            critChance: base.critChance ? Math.min(0.5, base.critChance + (rarity - 1) * 0.02) : undefined,
            element: base.element,
            defense: base.defense ? Math.round(base.defense * mult) : undefined,
            hpBonus: base.hpBonus ? Math.round(base.hpBonus * mult) : undefined,
            speedBonus: base.speedBonus,
            healAmount: base.healAmount ? Math.round(base.healAmount * mult) : undefined,
        }
    }

    private static calcTier(depth: number): number {
        return Math.max(1, Math.min(5, Math.floor(depth / 2) + 1 + randomInt(-1, 1)))
    }

    private static rollRarity(depth: number): number {
        const roll = Math.random()
        const bonus = Math.min(3, Math.floor(depth / 3)) * 0.02
        if (roll < 0.05 + bonus) return 5
        if (roll < 0.15 + bonus * 1.5) return 4
        if (roll < 0.35 + bonus * 2) return 3
        if (roll < 0.65 + bonus * 2.5) return 2
        return 1
    }

    private static pickBase(tier: number): typeof BASE_ITEMS[number] {
        const filtered = BASE_ITEMS.filter((b) => b.tier <= tier + 1)
        return randomPick(filtered.length > 0 ? filtered : BASE_ITEMS)
    }

    private static rarityMult(rarity: number): number {
        return [1, 1.2, 1.5, 2.0, 3.0][rarity - 1] || 1
    }

    private static raritySpeedMult(rarity: number): number {
        return [1, 1.05, 1.1, 1.2, 1.3][rarity - 1] || 1
    }

    private static applyModifiers(item: Item, mod: Record<string, unknown>) {
        if (typeof mod.weaponDamage === "number" && item.weaponDamage) {
            item.weaponDamage = +(item.weaponDamage * mod.weaponDamage).toFixed(1)
        }
        if (typeof mod.weaponSpeed === "number" && item.weaponSpeed) {
            item.weaponSpeed = +(item.weaponSpeed * mod.weaponSpeed).toFixed(2)
        }
        if (typeof mod.defense === "number" && item.defense) {
            item.defense = Math.round(item.defense * mod.defense)
        }
        if (typeof mod.hpBonus === "number" && item.hpBonus) {
            item.hpBonus = Math.round(item.hpBonus * mod.hpBonus)
        }
        if (typeof mod.critChance === "number" && item.critChance !== undefined) {
            item.critChance = Math.min(0.5, item.critChance + mod.critChance)
        } else if (typeof mod.critChance === "number" && item.type === "weapon") {
            item.critChance = mod.critChance as number
        }
        if (typeof mod.element === "string" && item.type === "weapon") {
            item.element = mod.element as string
        }
    }
}
