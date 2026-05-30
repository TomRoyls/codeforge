export class EventSink<T extends Record<string, unknown>> {
  private listeners: Map<keyof T, Set<(...args: unknown[]) => void>> = new Map()

  on<K extends keyof T>(event: K, handler: (data: T[K]) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(handler as (...args: unknown[]) => void)
    return () => this.off(event, handler)
  }

  off<K extends keyof T>(event: K, handler: (data: T[K]) => void): void {
    this.listeners.get(event)?.delete(handler as (...args: unknown[]) => void)
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    const handlers = this.listeners.get(event)
    if (handlers) {
      for (const handler of handlers) {
        handler(data)
      }
    }
  }

  listenerCount(event: keyof T): number {
    return this.listeners.get(event)?.size ?? 0
  }

  removeAllListeners(event?: keyof T): void {
    if (event) {
      this.listeners.delete(event)
    } else {
      this.listeners.clear()
    }
  }

  get eventNames(): Array<keyof T> {
    return Array.from(this.listeners.keys())
  }
}
