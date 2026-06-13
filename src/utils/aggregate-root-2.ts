export interface AggregateEvent2 {
  type: string
  data: unknown
}

export class AggregateRoot2<T = unknown> {
  protected state: T
  private changes: AggregateEvent2[] = []
  private version = 0
  private applyMap: Map<string, (state: T, data: unknown) => void>

  constructor(initialState: T, applyMap: Map<string, (state: T, data: unknown) => void>) {
    this.state = initialState
    this.applyMap = applyMap
  }

  applyEvent(event: AggregateEvent2): void {
    const handler = this.applyMap.get(event.type)
    if (handler) handler(this.state, event.data)
    this.changes.push(event)
    this.version++
  }

  applyFromHistory(events: AggregateEvent2[]): void {
    for (const event of events) {
      const handler = this.applyMap.get(event.type)
      if (handler) handler(this.state, event.data)
      this.version++
    }
  }

  markChangesAsCommitted(): void {
    this.changes = []
  }

  getUncommittedChanges(): AggregateEvent2[] {
    return [...this.changes]
  }

  getState(): T { return this.state }
  getVersion(): number { return this.version }

  hasUncommittedChanges(): boolean {
    return this.changes.length > 0
  }

  reset(): void {
    this.changes = []
  }

  static create<T>(initialState: T, handlers: Record<string, (state: T, data: unknown) => void>): AggregateRoot2<T> {
    const map = new Map(Object.entries(handlers) as [string, (state: T, data: unknown) => void][])
    return new AggregateRoot2(initialState, map)
  }

  toArray(): AggregateEvent2[] { return this.getUncommittedChanges() }
  toString(): string { return JSON.stringify({ version: this.version, uncommitted: this.changes.length }) }
  toJSON(): Record<string, unknown> { return { version: this.version, uncommitted: this.changes.length } }
  clone(): AggregateRoot2<T> {
    const ar = new AggregateRoot2(this.state, this.applyMap)
    ar.version = this.version
    return ar
  }
  equals(other: unknown): boolean {
    if (!(other instanceof AggregateRoot2)) return false
    return this.version === other.version
  }
}
