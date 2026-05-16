import { TILE_SIZE } from "@/shared/config/gameConfig"

const VISION_RADIUS = 7
const DARK_COLOR = "rgba(3, 1, 12, 0.92)"

export function renderPlayerLight(
    ctx: CanvasRenderingContext2D,
    canvasW: number,
    canvasH: number,
    _map: unknown,
    playerTileX: number,
    playerTileY: number,
    cameraX: number,
    cameraY: number,
) {
    const mask = document.createElement("canvas")
    mask.width = canvasW
    mask.height = canvasH
    const mctx = mask.getContext("2d")!

    mctx.fillStyle = DARK_COLOR
    mctx.fillRect(0, 0, canvasW, canvasH)

    const pSX = playerTileX * TILE_SIZE + TILE_SIZE / 2 - cameraX
    const pSY = playerTileY * TILE_SIZE + TILE_SIZE / 2 - cameraY

    mctx.globalCompositeOperation = "destination-out"

    const lightRadius = VISION_RADIUS * TILE_SIZE
    const grad = mctx.createRadialGradient(pSX, pSY, 0, pSX, pSY, lightRadius)
    grad.addColorStop(0, "rgba(0,0,0,1)")
    grad.addColorStop(0.35, "rgba(0,0,0,0.95)")
    grad.addColorStop(0.65, "rgba(0,0,0,0.4)")
    grad.addColorStop(0.85, "rgba(0,0,0,0.05)")
    grad.addColorStop(1, "rgba(0,0,0,0)")
    mctx.fillStyle = grad
    mctx.fillRect(0, 0, canvasW, canvasH)

    mctx.globalCompositeOperation = "source-over"
    ctx.drawImage(mask, 0, 0)
}
