export type CommitState2 = 'uncommitted' | 'committed' | 'aborted'

export interface OffsetEntry2 {
  topic: string
  partition: number
  consumerGroup: string
  offset: number
  committedOffset: number
  state: CommitState2
  updatedAt: number
  metadata: Record<string, unknown>
}

export class OffsetStore2 {
  private offsets: Map<string, OffsetEntry2> = new Map()
  private idCounter = 0
  private listeners: Array<(event: string, entry: OffsetEntry2) => void> = []

  private key(topic: string, partition: number, group: string): string {
    return `${topic}:${partition}:${group}`
  }

  init(topic: string, partition: number, group: string, offset = 0): void {
    const k = this.key(topic, partition, group)
    if (this.offsets.has(k)) return
    this.offsets.set(k, {
      topic, partition, consumerGroup: group,
      offset, committedOffset: offset,
      state: 'uncommitted',
      updatedAt: Date.now(),
      metadata: {},
    })
  }

  position(topic: string, partition: number, group: string, offset: number): boolean {
    const k = this.key(topic, partition, group)
    const entry = this.offsets.get(k)
    if (!entry) return false
    entry.offset = offset
    entry.state = 'uncommitted'
    entry.updatedAt = Date.now()
    return true
  }

  advance(topic: string, partition: number, group: string, delta = 1): boolean {
    const k = this.key(topic, partition, group)
    const entry = this.offsets.get(k)
    if (!entry) return false
    entry.offset += delta
    entry.state = 'uncommitted'
    entry.updatedAt = Date.now()
    return true
  }

  commit(topic: string, partition: number, group: string): boolean {
    const k = this.key(topic, partition, group)
    const entry = this.offsets.get(k)
    if (!entry) return false
    entry.committedOffset = entry.offset
    entry.state = 'committed'
    entry.updatedAt = Date.now()
    this.notify('committed', entry)
    return true
  }

  commitAll(group: string): number {
    let count = 0
    this.offsets.forEach((entry) => {
      if (entry.consumerGroup === group && entry.state === 'uncommitted') {
        entry.committedOffset = entry.offset
        entry.state = 'committed'
        entry.updatedAt = Date.now()
        count++
        this.notify('committed', entry)
      }
    })
    return count
  }

  abort(topic: string, partition: number, group: string): boolean {
    const k = this.key(topic, partition, group)
    const entry = this.offsets.get(k)
    if (!entry) return false
    entry.offset = entry.committedOffset
    entry.state = 'aborted'
    entry.updatedAt = Date.now()
    this.notify('aborted', entry)
    return true
  }

  get(topic: string, partition: number, group: string): OffsetEntry2 | undefined {
    return this.offsets.get(this.key(topic, partition, group))
  }

  getOffset(topic: string, partition: number, group: string): number {
    return this.offsets.get(this.key(topic, partition, group))?.offset ?? 0
  }

  getCommitted(topic: string, partition: number, group: string): number {
    return this.offsets.get(this.key(topic, partition, group))?.committedOffset ?? 0
  }

  getLag(topic: string, partition: number, group: string): number {
    const entry = this.offsets.get(this.key(topic, partition, group))
    if (!entry) return 0
    return entry.offset - entry.committedOffset
  }

  getGroupLag(group: string): number {
    let lag = 0
    this.offsets.forEach(entry => {
      if (entry.consumerGroup === group) lag += entry.offset - entry.committedOffset
    })
    return lag
  }

  getByGroup(group: string): OffsetEntry2[] {
    return Array.from(this.offsets.values()).filter(e => e.consumerGroup === group)
  }

  getByTopic(topic: string): OffsetEntry2[] {
    return Array.from(this.offsets.values()).filter(e => e.topic === topic)
  }

  getByState(state: CommitState2): OffsetEntry2[] {
    return Array.from(this.offsets.values()).filter(e => e.state === state)
  }

  reset(group: string): number {
    let count = 0
    this.offsets.forEach(entry => {
      if (entry.consumerGroup === group) {
        entry.offset = 0
        entry.committedOffset = 0
        entry.state = 'uncommitted'
        entry.updatedAt = Date.now()
        count++
      }
    })
    return count
  }

  seek(topic: string, partition: number, group: string, offset: number): boolean {
    const k = this.key(topic, partition, group)
    const entry = this.offsets.get(k)
    if (!entry) return false
    entry.offset = offset
    entry.committedOffset = offset
    entry.state = 'committed'
    entry.updatedAt = Date.now()
    return true
  }

  listen(fn: (event: string, entry: OffsetEntry2) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, entry: OffsetEntry2): void {
    this.listeners.forEach(fn => fn(event, entry))
  }

  getStats(): { total: number; committed: number; uncommitted: number; aborted: number; totalLag: number } {
    const entries = Array.from(this.offsets.values())
    return {
      total: entries.length,
      committed: entries.filter(e => e.state === 'committed').length,
      uncommitted: entries.filter(e => e.state === 'uncommitted').length,
      aborted: entries.filter(e => e.state === 'aborted').length,
      totalLag: entries.reduce((s, e) => s + (e.offset - e.committedOffset), 0),
    }
  }

  count(): number { return this.offsets.size }

  toArray(): OffsetEntry2[] { return Array.from(this.offsets.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): OffsetStore2 {
    const os = new OffsetStore2()
    this.offsets.forEach((e, k) => os.offsets.set(k, { ...e, metadata: { ...e.metadata } }))
    return os
  }
  equals(other: unknown): boolean {
    if (!(other instanceof OffsetStore2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.offsets.clear()
    this.listeners = []
    this.idCounter = 0
  }
}
