import { randomPick, randomInt } from "@/shared/lib/math"

export type DifficultyTier = {
    minDepth: number
    coordinationLevel: number
    statMultiplier: number
    extraSpawnChance: number
    enemyCombos: [string, string][]
}

export const DIFFICULTY_TIERS: DifficultyTier[] = [
    { minDepth: 1, coordinationLevel: 0, statMultiplier: 1.0, extraSpawnChance: 0, enemyCombos: [] },
    { minDepth: 3, coordinationLevel: 1, statMultiplier: 1.2, extraSpawnChance: 0.2, enemyCombos: [["goblin", "skeleton"]] },
    { minDepth: 5, coordinationLevel: 1, statMultiplier: 1.3, extraSpawnChance: 0.3, enemyCombos: [["goblin", "skeleton"], ["bat", "slime"]] },
    { minDepth: 8, coordinationLevel: 2, statMultiplier: 1.5, extraSpawnChance: 0.4, enemyCombos: [["goblin", "skeleton"], ["bat", "slime"], ["golem", "goblin"]] },
    { minDepth: 12, coordinationLevel: 3, statMultiplier: 1.8, extraSpawnChance: 0.5, enemyCombos: [["goblin", "skeleton"], ["bat", "slime"], ["golem", "goblin"]] },
]

export function getDifficultyTier(depth: number): DifficultyTier {
    let tier = DIFFICULTY_TIERS[0]
    for (const t of DIFFICULTY_TIERS) {
        if (depth >= t.minDepth) tier = t
    }
    return tier
}

export function scaleEnemyStats(hp: number, damage: number, depth: number): { hp: number; damage: number } {
    const tier = getDifficultyTier(depth)
    return {
        hp: Math.round(hp * tier.statMultiplier),
        damage: Math.round(damage * (1 + (tier.statMultiplier - 1) * 0.7)),
    }
}

export function getSpawnCount(baseCount: number, depth: number, playerHPPercent: number): number {
    const tier = getDifficultyTier(depth)
    let count = baseCount

    if (playerHPPercent > 0.7) count += 1
    if (playerHPPercent > 0.9) count += 1
    if (depth >= 5) count += 1
    if (depth >= 10) count += 1

    if (Math.random() < tier.extraSpawnChance) count += 1

    return Math.max(1, count)
}

export function pickComboEnemyTypes(depth: number): [string, string] | null {
    const tier = getDifficultyTier(depth)
    if (tier.enemyCombos.length === 0 || Math.random() > 0.3) return null
    return randomPick(tier.enemyCombos)
}
