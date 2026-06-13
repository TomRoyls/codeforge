export interface DomainEvent2 {
  id: string
  type: string
  data: unknown
  timestamp: number
  version: number
}

export class EventSourcing2 {
  private events: DomainEvent2[] = []
  private snapshots: Map<number, unknown> = new Map()
  private version = 0
  private applyFn: (state: unknown, event: DomainEvent2) => unknown

  constructor(applyFn: (state: unknown, event: DomainEvent2) => unknown) {
    this.applyFn = applyFn
  }

  append(type: string, data: unknown): DomainEvent2 {
    this.version++
    const event: DomainEvent2 = {
      id: `evt_${this.version}_${Math.random().toString(36).substring(2, 6)}`,
      type, data, timestamp: Date.now(), version: this.version,
    }
    this.events.push(event)
    return event
  }

  getEvents(): DomainEvent2[] {
    return [...this.events]
  }

  getEventsFromVersion(fromVersion: number): DomainEvent2[] {
    return this.events.filter(e => e.version > fromVersion)
  }

  getEventsByType(type: string): DomainEvent2[] {
    return this.events.filter(e => e.type === type)
  }

  reconstruct(fromVersion = 0, initialState: unknown = null): unknown {
    let state = this.snapshots.get(fromVersion) ?? initialState
    const events = this.getEventsFromVersion(fromVersion)
    for (const event of events) {
      state = this.applyFn(state, event)
    }
    return state
  }

  saveSnapshot(version: number, state: unknown): void {
    this.snapshots.set(version, state)
  }

  getLatestSnapshot(): { version: number; state: unknown } | null {
    if (this.snapshots.size === 0) return null
    const versions = Array.from(this.snapshots.keys()).sort((a, b) => b - a)
    return { version: versions[0], state: this.snapshots.get(versions[0]) }
  }

  getVersion(): number { return this.version }
  count(): number { return this.events.length }

  clear(): void {
    this.events = []
    this.snapshots.clear()
    this.version = 0
  }

  toArray(): DomainEvent2[] { return this.getEvents() }
  toString(): string { return JSON.stringify({ events: this.count(), version: this.version }) }
  toJSON(): Record<string, unknown> { return { events: this.count(), version: this.version } }
  clone(): EventSourcing2 {
    const es = new EventSourcing2(this.applyFn)
    es.events = [...this.events]
    es.version = this.version
    this.snapshots.forEach((s, v) => es.saveSnapshot(v, s))
    return es
  }
  equals(other: unknown): boolean {
    if (!(other instanceof EventSourcing2)) return false
    return this.version === other.version
  }
}
