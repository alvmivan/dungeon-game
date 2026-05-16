import { lerp, clamp } from "@/shared/lib/math"
import { TILE_SIZE, MAP_WIDTH, MAP_HEIGHT } from "@/shared/config/gameConfig"

export class Camera {
    x: number = 0
    y: number = 0

    follow(targetX: number, targetY: number, canvasW: number, canvasH: number) {
        const targetCamX = targetX - canvasW / 2
        const targetCamY = targetY - canvasH / 2
        this.x = lerp(this.x, targetCamX, 0.1)
        this.y = lerp(this.y, targetCamY, 0.1)
        this.x = clamp(this.x, 0, MAP_WIDTH * TILE_SIZE - canvasW)
        this.y = clamp(this.y, 0, MAP_HEIGHT * TILE_SIZE - canvasH)
    }

    reset() {
        this.x = 0
        this.y = 0
    }
}
