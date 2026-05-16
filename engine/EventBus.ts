type Listener = (...args: unknown[]) => void

class EventBus {
    private listeners = new Map<string, Set<Listener>>()

    on(event: string, callback: Listener) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set())
        }
        this.listeners.get(event)!.add(callback)
        return () => this.off(event, callback)
    }

    off(event: string, callback: Listener) {
        this.listeners.get(event)?.delete(callback)
    }

    emit(event: string, ...args: unknown[]) {
        const fns = this.listeners.get(event)
        if (fns) {
            for (const cb of fns) {
                if (args.length === 1) {
                    cb(args[0])
                } else {
                    cb(...args)
                }
            }
        }
    }

    clear() {
        this.listeners.clear()
    }
}

export const bus = new EventBus()
