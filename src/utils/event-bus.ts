export class EventBus {
  private handlers = new Map<string, Set<(...args: unknown[]) => void>>()

  on(event: string, handler: (...args: unknown[]) => void): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set())
    }
    this.handlers.get(event)!.add(handler)
    return () => this.off(event, handler)
  }

  once(event: string, handler: (...args: unknown[]) => void): () => void {
    const wrapper = (...args: unknown[]) => {
      this.off(event, wrapper)
      handler(...args)
    }
    return this.on(event, wrapper)
  }

  off(event: string, handler: (...args: unknown[]) => void): void {
    this.handlers.get(event)?.delete(handler)
  }

  emit(event: string, ...args: unknown[]): void {
    const handlers = this.handlers.get(event)
    if (handlers) {
      for (const handler of handlers) handler(...args)
    }
  }

  listenerCount(event: string): number {
    return this.handlers.get(event)?.size ?? 0
  }

  eventNames(): string[] {
    return Array.from(this.handlers.keys())
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.handlers.delete(event)
    } else {
      this.handlers.clear()
    }
  }

  get totalListeners(): number {
    let count = 0
    for (const handlers of this.handlers.values()) count += handlers.size
    return count
  }

  clear(): void {
    this.handlers.clear()
  }

  toString(): string {
    return JSON.stringify({ events: this.eventNames().length, listeners: this.totalListeners })
  }

  toJSON(): Record<string, unknown> {
    return { events: this.eventNames(), totalListeners: this.totalListeners }
  }

  clone(): EventBus {
    return new EventBus()
  }

  equals(other: unknown): boolean {
    if (!(other instanceof EventBus)) return false
    return this.totalListeners === other.totalListeners
  }
}
