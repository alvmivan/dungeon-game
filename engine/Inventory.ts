import type { Item, EquipSlots } from "@/engine/items/ItemTypes"

export class Inventory {
    slots: EquipSlots = { weapon: null, head: null, body: null, accessory: null }
    backpack: Item[] = []
    maxBackpackSize: number = 16

    get defense(): number {
        let d = 0
        for (const slot of Object.values(this.slots)) {
            if (slot?.defense) d += slot.defense
        }
        return d
    }

    get hpBonus(): number {
        let h = 0
        for (const slot of Object.values(this.slots)) {
            if (slot?.hpBonus) h += slot.hpBonus
        }
        return h
    }

    get speedBonus(): number {
        let s = 0
        for (const slot of Object.values(this.slots)) {
            if (slot?.speedBonus) s += slot.speedBonus
        }
        return s
    }

    get critChanceBonus(): number {
        let c = 0
        for (const slot of Object.values(this.slots)) {
            if (slot?.critChance) c += slot.critChance
        }
        return c
    }

    equip(item: Item): Item | null {
        if (item.slot === "none") return null

        const slotKey = item.slot as keyof EquipSlots
        const previous = this.slots[slotKey]
        this.slots[slotKey] = item

        const idx = this.backpack.indexOf(item)
        if (idx !== -1) {
            this.backpack.splice(idx, 1)
        }

        if (previous) {
            this.backpack.push(previous)
        }

        return previous
    }

    unequip(slot: keyof EquipSlots): Item | null {
        const item = this.slots[slot]
        if (!item) return null

        if (this.backpack.length < this.maxBackpackSize) {
            this.slots[slot] = null
            this.backpack.push(item)
            return item
        }
        return null
    }

    addToBackpack(item: Item): boolean {
        if (this.backpack.length >= this.maxBackpackSize) return false
        this.backpack.push(item)
        return true
    }

    removeFromBackpack(index: number): Item | null {
        if (index < 0 || index >= this.backpack.length) return null
        return this.backpack.splice(index, 1)[0]
    }

    hasItem(id: string): boolean {
        for (const slot of Object.values(this.slots)) {
            if (slot?.id === id) return true
        }
        return this.backpack.some((i) => i.id === id)
    }

    usePotion(index: number): number | null {
        const item = this.backpack[index]
        if (!item || item.type !== "potion" || !item.healAmount) return null
        this.backpack.splice(index, 1)
        return item.healAmount
    }

    getEquippedWeapon(): Item | null {
        return this.slots.weapon
    }
}
