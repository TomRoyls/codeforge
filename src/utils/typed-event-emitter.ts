type Listener<T = unknown> = (data: T) => void

export class TypedEventEmitter<Events extends Record<string, unknown> = Record<string, unknown>> {
  private listeners = new Map<keyof Events, Set<Listener>>()
  private onceListeners = new Map<keyof Events, Set<Listener>>()

  on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener as Listener)
    return () => this.off(event, listener)
  }

  once<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, new Set())
    }
    this.onceListeners.get(event)!.add(listener as Listener)
  }

  off<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
    this.listeners.get(event)?.delete(listener as Listener)
    this.onceListeners.get(event)?.delete(listener as Listener)
  }

  emit<K extends keyof Events>(event: K, data: Events[K]): void {
    const set = this.listeners.get(event)
    if (set) {
      for (const listener of set) {
        listener(data)
      }
    }
    const onceSet = this.onceListeners.get(event)
    if (onceSet) {
      for (const listener of onceSet) {
        listener(data)
      }
      onceSet.clear()
    }
  }

  listenerCount(event: keyof Events): number {
    return (this.listeners.get(event)?.size ?? 0) + (this.onceListeners.get(event)?.size ?? 0)
  }

  eventNames(): Array<keyof Events> {
    const names = new Set<keyof Events>()
    for (const key of this.listeners.keys()) names.add(key)
    for (const key of this.onceListeners.keys()) names.add(key)
    return Array.from(names)
  }

  removeAllListeners(event?: keyof Events): void {
    if (event !== undefined) {
      this.listeners.delete(event)
      this.onceListeners.delete(event)
    } else {
      this.listeners.clear()
      this.onceListeners.clear()
    }
  }

  get size(): number {
    let total = 0
    for (const set of this.listeners.values()) total += set.size
    for (const set of this.onceListeners.values()) total += set.size
    return total
  }

  toString(): string {
    return JSON.stringify(Object.fromEntries(
      this.eventNames().map((e) => [e, this.listenerCount(e)])
    ))
  }

  clone(): TypedEventEmitter<Events> {
    const copy = new TypedEventEmitter<Events>()
    for (const [event, set] of this.listeners) {
      for (const listener of set) {
        copy.listeners.get(event)?.add(listener) ?? copy.listeners.set(event, new Set([listener]))
      }
    }
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof TypedEventEmitter)) return false
    const a = this.eventNames().sort()
    const b = other.eventNames().sort()
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false
    }
    return true
  }
}
