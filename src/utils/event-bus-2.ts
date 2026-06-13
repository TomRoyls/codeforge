export type EventHandler<T = unknown> = (data: T) => void

export class EventBus2<T = unknown> {
  private handlers: Map<string, Set<EventHandler<T>>> = new Map()
  private history: { event: string; data: T; timestamp: number }[] = []
  private maxHistory = 0

  on(event: string, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set())
    this.handlers.get(event)!.add(handler)
    return () => this.off(event, handler)
  }

  once(event: string, handler: EventHandler<T>): () => void {
    const wrapper: EventHandler<T> = (data) => {
      this.off(event, wrapper)
      handler(data)
    }
    return this.on(event, wrapper)
  }

  off(event: string, handler: EventHandler<T>): boolean {
    const set = this.handlers.get(event)
    if (!set) return false
    return set.delete(handler)
  }

  offAll(event: string): number {
    const set = this.handlers.get(event)
    if (!set) return 0
    const count = set.size
    set.clear()
    return count
  }

  emit(event: string, data: T): number {
    const set = this.handlers.get(event)
    if (this.maxHistory > 0) {
      this.history.push({ event, data, timestamp: Date.now() })
      if (this.history.length > this.maxHistory) this.history.shift()
    }
    if (!set) return 0
    set.forEach(h => h(data))
    return set.size
  }

  setMaxHistory(max: number): this {
    this.maxHistory = max
    return this
  }

  getHistory(): { event: string; data: T; timestamp: number }[] {
    return [...this.history]
  }

  clearHistory(): void {
    this.history = []
  }

  listenerCount(event: string): number {
    return this.handlers.get(event)?.size ?? 0
  }

  eventNames(): string[] {
    return Array.from(this.handlers.keys()).filter(e => this.listenerCount(e) > 0)
  }

  clear(): void {
    this.handlers.clear()
    this.history = []
  }

  pipe(target: EventBus2<T>, event: string): () => void {
    return this.on(event, (data) => target.emit(event, data))
  }

  static merge<T = unknown>(...buses: EventBus2<T>[]): EventBus2<T> {
    const merged = new EventBus2<T>()
    for (const bus of buses) {
      bus.on('*', (data) => {
        const entry = bus.getHistory().pop()
        if (entry) merged.emit(entry.event, data)
      })
    }
    return merged
  }

  toArray(): string[] { return this.eventNames() }
  toString(): string { return JSON.stringify({ events: this.eventNames() }) }
  toJSON(): Record<string, number> {
    const result: Record<string, number> = {}
    this.handlers.forEach((set, event) => { result[event] = set.size })
    return result
  }
  clone(): EventBus2<T> {
    const bus = new EventBus2<T>()
    bus.maxHistory = this.maxHistory
    return bus
  }
  equals(other: unknown): boolean {
    if (!(other instanceof EventBus2)) return false
    return this.eventNames().length === other.eventNames().length
  }
}
