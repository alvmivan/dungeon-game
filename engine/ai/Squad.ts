import { Enemy } from "@/engine/entities/Enemy"
import type { TileMap } from "@/engine/dungeon/TileMap"
import { TILE_SIZE } from "@/shared/config/gameConfig"
import { distance, angleBetween } from "@/shared/lib/math"

export type EnemyRole = "attacker" | "flanker" | "tank" | "support"

type TacticalOrder = {
    type: "advance" | "flank" | "hold" | "retreat" | "surround" | "defend_choke"
    targetTileX: number
    targetTileY: number
}

export class Squad {
    members: Enemy[]
    roomCenterX: number
    roomCenterY: number
    order: TacticalOrder
    waveIndex: number = 0
    waveTimer: number = 0
    alertTimer: number = 0

    constructor(enemies: Enemy[], roomCenterX: number, roomCenterY: number) {
        this.members = enemies
        this.roomCenterX = roomCenterX
        this.roomCenterY = roomCenterY
        this.assignRoles()
        this.order = { type: "advance", targetTileX: roomCenterX, targetTileY: roomCenterY }
    }

    private assignRoles() {
        const sorted = [...this.members].sort((a, b) => b.speed - a.speed)
        for (let i = 0; i < sorted.length; i++) {
            const e = sorted[i]
            if (e.maxHp >= 35) {
                e.role = "tank"
            } else if (e.speed >= 50 && i < Math.ceil(sorted.length * 0.35)) {
                e.role = "flanker"
            } else {
                e.role = "attacker"
            }
        }
    }

    update(dt: number, playerX: number, playerY: number, map: TileMap) {
        this.alertTimer = Math.max(0, this.alertTimer - dt)
        this.waveTimer = Math.max(0, this.waveTimer - dt)

        const living = this.members.filter(e => e.alive)
        if (living.length === 0) return

        if (Math.random() < 0.02) {
            this.evaluateOrder(playerX, playerY, map)
        }

        for (const e of living) {
            if (!this.isInWave(e)) continue
            this.updateEnemy(e, playerX, playerY, map)
        }
    }

    private evaluateOrder(playerX: number, playerY: number, map: TileMap) {
        const ptx = Math.floor(playerX / TILE_SIZE)
        const pty = Math.floor(playerY / TILE_SIZE)
        const living = this.members.filter(e => e.alive)
        const avgHP = living.reduce((s, e) => s + e.hp / e.maxHp, 0) / living.length

        if (living.length >= 4) {
            this.order = { type: "surround", targetTileX: ptx, targetTileY: pty }
        } else if (living.length >= 2) {
            this.order = { type: "flank", targetTileX: ptx, targetTileY: pty }
        } else if (avgHP < 0.3 && living.some(e => e.role === "tank")) {
            this.order = { type: "retreat", targetTileX: this.roomCenterX, targetTileY: this.roomCenterY }
        } else {
            this.order = { type: "advance", targetTileX: ptx, targetTileY: pty }
        }
    }

    private updateEnemy(e: Enemy, px: number, py: number, map: TileMap) {
        const ptx = Math.floor(px / TILE_SIZE)
        const pty = Math.floor(py / TILE_SIZE)
        const etx = Math.floor(e.centerX / TILE_SIZE)
        const ety = Math.floor(e.centerY / TILE_SIZE)

        switch (this.order.type) {
            case "advance":
                this.setGroupTarget(e, ptx, pty)
                break
            case "flank":
                this.setFlankTarget(e, ptx, pty)
                break
            case "surround":
                this.setSurroundTarget(e, ptx, pty)
                break
            case "retreat":
                this.setRetreatTarget(e, px, py)
                break
        }
    }

    private setGroupTarget(e: Enemy, tx: number, ty: number) {
        if (e.role === "flanker") {
            const angle = angleBetween(e.centerX, e.centerY, tx * TILE_SIZE, ty * TILE_SIZE) + (Math.random() > 0.5 ? 0.7 : -0.7)
            e.groupTargetX = tx * TILE_SIZE + Math.cos(angle) * 48
            e.groupTargetY = ty * TILE_SIZE + Math.sin(angle) * 48
        } else {
            e.groupTargetX = tx * TILE_SIZE
            e.groupTargetY = ty * TILE_SIZE
        }
    }

    private setFlankTarget(e: Enemy, tx: number, ty: number) {
        if (e.role === "flanker") {
            const angle = angleBetween(e.centerX, e.centerY, tx * TILE_SIZE, ty * TILE_SIZE) + (Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2)
            e.groupTargetX = tx * TILE_SIZE + Math.cos(angle) * 64
            e.groupTargetY = ty * TILE_SIZE + Math.sin(angle) * 64
        } else {
            e.groupTargetX = tx * TILE_SIZE
            e.groupTargetY = ty * TILE_SIZE
        }
    }

    private setSurroundTarget(e: Enemy, tx: number, ty: number) {
        const idx = this.members.indexOf(e)
        const total = this.members.filter(m => m.alive).length
        const angle = (idx / total) * Math.PI * 2
        const radius = e.role === "tank" ? 32 : e.role === "flanker" ? 64 : 48
        e.groupTargetX = tx * TILE_SIZE + Math.cos(angle) * radius
        e.groupTargetY = ty * TILE_SIZE + Math.sin(angle) * radius
    }

    private setRetreatTarget(e: Enemy, px: number, py: number) {
        if (e.role === "tank") {
            e.groupTargetX = px
            e.groupTargetY = py
        } else {
            e.groupTargetX = this.roomCenterX * TILE_SIZE
            e.groupTargetY = this.roomCenterY * TILE_SIZE
        }
    }

    private isInWave(e: Enemy): boolean {
        const idx = this.members.indexOf(e)
        return idx < Math.max(1, Math.floor(this.members.length * 0.5)) + this.waveIndex
    }

    advanceWave() {
        if (this.waveIndex < this.members.length) {
            this.waveIndex += Math.max(1, Math.floor(this.members.length * 0.3))
            this.waveTimer = 1.0
        }
    }
}
