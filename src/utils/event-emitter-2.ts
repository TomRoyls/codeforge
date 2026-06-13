export class EventEmitter2 {
  private listeners = new Map<string, ((...args: unknown[]) => void)[]>()
  private onceListeners = new Map<string, ((...args: unknown[]) => void)[]>()

  on(event: string, fn: (...args: unknown[]) => void): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, [])
    this.listeners.get(event)!.push(fn)
    return () => this.off(event, fn)
  }

  once(event: string, fn: (...args: unknown[]) => void): void {
    if (!this.onceListeners.has(event)) this.onceListeners.set(event, [])
    this.onceListeners.get(event)!.push(fn)
  }

  off(event: string, fn: (...args: unknown[]) => void): void {
    const list = this.listeners.get(event)
    if (list) {
      const idx = list.indexOf(fn)
      if (idx !== -1) list.splice(idx, 1)
    }
    const onceList = this.onceListeners.get(event)
    if (onceList) {
      const idx = onceList.indexOf(fn)
      if (idx !== -1) onceList.splice(idx, 1)
    }
  }

  emit(event: string, ...args: unknown[]): void {
    const list = this.listeners.get(event)
    if (list) for (const fn of [...list]) fn(...args)
    const onceList = this.onceListeners.get(event)
    if (onceList) {
      for (const fn of [...onceList]) fn(...args)
      this.onceListeners.delete(event)
    }
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event)
      this.onceListeners.delete(event)
    } else {
      this.listeners.clear()
      this.onceListeners.clear()
    }
  }

  listenerCount(event: string): number {
    return (this.listeners.get(event)?.length ?? 0) + (this.onceListeners.get(event)?.length ?? 0)
  }

  eventNames(): string[] {
    return [...new Set([...this.listeners.keys(), ...this.onceListeners.keys()])]
  }

  get size(): number { return this.listeners.size + this.onceListeners.size }

  clear(): void { this.listeners.clear(); this.onceListeners.clear() }

  toArray(): string[] { return this.eventNames() }
  toString(): string { return JSON.stringify({ events: this.size }) }
  toJSON(): Record<string, number> { return { events: this.size } }
  clone(): EventEmitter2 { return new EventEmitter2() }
  equals(other: unknown): boolean { return other instanceof EventEmitter2 }
}
