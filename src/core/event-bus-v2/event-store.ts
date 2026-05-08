import type { Event } from './types.js'

class EventStore {
  private events: Event[] = []

  add(event: Event): void {
    this.events.push(event)
  }

  getByType(type: string): Event[] {
    return this.events.filter((e) => e.type === type)
  }

  getAll(): Event[] {
    return [...this.events]
  }

  getByCorrelationId(id: string): Event[] {
    return this.events.filter((e) => e.correlationId === id)
  }

  clear(): void {
    this.events = []
  }

  size(): number {
    return this.events.length
  }

  prune(maxSize: number): number {
    if (this.events.length <= maxSize) {
      return 0
    }
    const removed = this.events.length - maxSize
    this.events = maxSize === 0 ? [] : this.events.slice(-maxSize)
    return removed
  }
}

export { EventStore }
