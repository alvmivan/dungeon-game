export type InputState = {
    up: boolean
    down: boolean
    left: boolean
    right: boolean
    attack: boolean
    interact: boolean
    interactJustPressed: boolean
    dropWeapon: boolean
    dropWeaponJustPressed: boolean
    pause: boolean
    inventory: boolean
}

export class InputManager {
    private keys = new Set<string>()
    private justPressed = new Set<string>()
    private mouseX: number = 0
    private mouseY: number = 0
    private mouseClicked: boolean = false
    private mousePressed: boolean = false
    private prevAttack: boolean = false
    private canvas: HTMLCanvasElement | null = null

    attach(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.detach()

        this.onKeyDown = this.handleKeyDown.bind(this)
        this.onKeyUp = this.handleKeyUp.bind(this)
        this.onMouseDown = this.handleMouseDown.bind(this)
        this.onMouseMove = this.handleMouseMove.bind(this)
        this.onMouseUp = this.handleMouseUp.bind(this)
        this.onContextMenu = (e: Event) => e.preventDefault()

        window.addEventListener("keydown", this.onKeyDown)
        window.addEventListener("keyup", this.onKeyUp)
        canvas.addEventListener("mousedown", this.onMouseDown)
        canvas.addEventListener("mousemove", this.onMouseMove)
        canvas.addEventListener("mouseup", this.onMouseUp)
        canvas.addEventListener("contextmenu", this.onContextMenu)
    }

    private onKeyDown: ((e: KeyboardEvent) => void) | null = null
    private onKeyUp: ((e: KeyboardEvent) => void) | null = null
    private onMouseDown: ((e: MouseEvent) => void) | null = null
    private onMouseMove: ((e: MouseEvent) => void) | null = null
    private onMouseUp: ((e: MouseEvent) => void) | null = null
    private onContextMenu: ((e: Event) => void) | null = null

    detach() {
        if (this.onKeyDown) window.removeEventListener("keydown", this.onKeyDown)
        if (this.onKeyUp) window.removeEventListener("keyup", this.onKeyUp)
        if (this.canvas && this.onMouseDown) {
            this.canvas.removeEventListener("mousedown", this.onMouseDown)
        }
        if (this.canvas && this.onMouseMove) {
            this.canvas.removeEventListener("mousemove", this.onMouseMove)
        }
        if (this.canvas && this.onMouseUp) {
            this.canvas.removeEventListener("mouseup", this.onMouseUp)
        }
        if (this.canvas && this.onContextMenu) {
            this.canvas.removeEventListener("contextmenu", this.onContextMenu)
        }
    }

    private handleKeyDown(e: KeyboardEvent) {
        const key = e.key.toLowerCase()
        if (!this.keys.has(key)) {
            this.justPressed.add(key)
        }
        this.keys.add(key)
    }

    private handleKeyUp(e: KeyboardEvent) {
        this.keys.delete(e.key.toLowerCase())
    }

    private handleMouseDown(e: MouseEvent) {
        if (e.button === 0) {
            this.mouseClicked = true
            this.mousePressed = true
        }
    }

    private handleMouseUp(e: MouseEvent) {
        if (e.button === 0) {
            this.mousePressed = false
        }
    }

    private handleMouseMove(e: MouseEvent) {
        if (this.canvas) {
            const rect = this.canvas.getBoundingClientRect()
            this.mouseX = e.clientX - rect.left
            this.mouseY = e.clientY - rect.top
        }
    }

    getState(): InputState {
        const attackHeld = this.keys.has(" ")
        const attackJust = this.mouseClicked || (attackHeld && !this.prevAttack)
        this.prevAttack = attackHeld

        const interactHeld = this.keys.has("e")
        const interactJust = this.justPressed.has("e")

        const dropHeld = this.keys.has("q")
        const dropJust = this.justPressed.has("q")

        const state: InputState = {
            up: this.keys.has("w") || this.keys.has("arrowup"),
            down: this.keys.has("s") || this.keys.has("arrowdown"),
            left: this.keys.has("a") || this.keys.has("arrowleft"),
            right: this.keys.has("d") || this.keys.has("arrowright"),
            attack: attackJust,
            interact: interactHeld,
            interactJustPressed: interactJust,
            dropWeapon: dropHeld,
            dropWeaponJustPressed: dropJust,
            pause: this.justPressed.has("escape"),
            inventory: this.justPressed.has("i"),
        }

        if (attackHeld) {
            this.keys.delete(" ")
        }

        this.mouseClicked = false
        this.justPressed.clear()

        return state
    }

    getMouseWorldPosition(camera: { x: number; y: number }): { x: number; y: number } {
        return {
            x: this.mouseX + camera.x,
            y: this.mouseY + camera.y,
        }
    }

    isMousePressed(): boolean {
        return this.mousePressed
    }
}
