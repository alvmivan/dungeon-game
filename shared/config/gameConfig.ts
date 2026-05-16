export const TILE_SIZE = 32
export const MAP_WIDTH = 60
export const MAP_HEIGHT = 50
export const MIN_ROOM_SIZE = 6
export const MAX_ROOM_SIZE = 12

export const PLAYER_SPEED = 120
export const PLAYER_MAX_HP = 50

export const ENEMY_BASE_SPEED = 40
export const ENEMY_BASE_HP = 10

export const FOG_OF_WAR_RADIUS = 8

export const COLORS = {
    wall: "#2d2d2d",
    floor: "#4a4a4a",
    door: "#8d6e63",
    stairsDown: "#29b6f6",
    stairsUp: "#ef5350",
    trap: "#ffb300",
    water: "#1565c0",
    player: "#4fc3f7",
    enemySlime: "#66bb6a",
    enemySkeleton: "#eeeeee",
    enemyBat: "#7e57c2",
    enemyGoblin: "#8d6e63",
    enemyGolem: "#78909c",
    chest: "#8d6e63",
    weaponCommon: "#ffffff",
    weaponUncommon: "#42a5f5",
    weaponRare: "#ab47bc",
    weaponEpic: "#ffa726",
    weaponLegendary: "#ff3d00",
    hudBg: "rgba(0,0,0,0.7)",
    hpBar: "#ef5350",
    hpBarBg: "#424242",
} as const

export function weaponRarityColor(rarity: number): string {
    if (rarity >= 5) return COLORS.weaponLegendary
    if (rarity >= 4) return COLORS.weaponEpic
    if (rarity >= 3) return COLORS.weaponRare
    if (rarity >= 2) return COLORS.weaponUncommon
    return COLORS.weaponCommon
}
