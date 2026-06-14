export type EventStatus2 = 'pending' | 'processing' | 'processed' | 'failed' | 'dead-letter'
export type EventPriority2 = 'low' | 'normal' | 'high' | 'critical'

export interface StoredEvent2 {
  id: string
  stream: string
  type: string
  data: Record<string, unknown>
  metadata: Record<string, string>
  version: number
  timestamp: number
  status: EventStatus2
  priority: EventPriority2
  attempts: number
  maxAttempts: number
  processedAt: number | null
  error: string | null
}

export class EventStore2 {
  private events: Map<string, StoredEvent2> = new Map()
  private streams: Map<string, string[]> = new Map()
  private subscriptions: Map<string, Array<(event: StoredEvent2) => void>> = new Map()
  private deadLetterQueue: StoredEvent2[] = []
  private idCounter = 0
  private globalVersion = 0

  append(stream: string, type: string, data: Record<string, unknown>, priority: EventPriority2 = 'normal', metadata: Record<string, string> = {}): string {
    const id = `evt_${++this.idCounter}`
    this.globalVersion++
    const event: StoredEvent2 = {
      id, stream, type, data, metadata,
      version: this.globalVersion,
      timestamp: Date.now(),
      status: 'pending', priority,
      attempts: 0, maxAttempts: 3,
      processedAt: null, error: null,
    }
    this.events.set(id, event)
    if (!this.streams.has(stream)) this.streams.set(stream, [])
    this.streams.get(stream)!.push(id)
    this.notify(stream, event)
    return id
  }

  get(id: string): StoredEvent2 | undefined { return this.events.get(id) }

  getStream(stream: string, fromVersion = 0, limit = 100): StoredEvent2[] {
    const ids = this.streams.get(stream)
    if (!ids) return []
    return ids
      .map(id => this.events.get(id)!)
      .filter(e => e.version > fromVersion)
      .slice(0, limit)
  }

  getAll(fromVersion = 0, limit = 100): StoredEvent2[] {
    return Array.from(this.events.values())
      .filter(e => e.version > fromVersion)
      .sort((a, b) => a.version - b.version)
      .slice(0, limit)
  }

  getByType(type: string): StoredEvent2[] {
    return Array.from(this.events.values()).filter(e => e.type === type)
  }

  getByStatus(status: EventStatus2): StoredEvent2[] {
    return Array.from(this.events.values()).filter(e => e.status === status)
  }

  getByPriority(priority: EventPriority2): StoredEvent2[] {
    return Array.from(this.events.values()).filter(e => e.priority === priority)
  }

  markProcessing(id: string): boolean {
    const event = this.events.get(id)
    if (!event || event.status !== 'pending') return false
    event.status = 'processing'
    event.attempts++
    return true
  }

  markProcessed(id: string): boolean {
    const event = this.events.get(id)
    if (!event) return false
    event.status = 'processed'
    event.processedAt = Date.now()
    return true
  }

  markFailed(id: string, error: string): boolean {
    const event = this.events.get(id)
    if (!event) return false
    event.error = error
    if (event.attempts >= event.maxAttempts) {
      event.status = 'dead-letter'
      this.deadLetterQueue.push(event)
    } else {
      event.status = 'pending'
    }
    return true
  }

  retry(id: string): boolean {
    const event = this.events.get(id)
    if (!event) return false
    if (event.status !== 'failed' && event.status !== 'dead-letter') return false
    event.status = 'pending'
    event.error = null
    return true
  }

  subscribe(stream: string, callback: (event: StoredEvent2) => void): this {
    if (!this.subscriptions.has(stream)) this.subscriptions.set(stream, [])
    this.subscriptions.get(stream)!.push(callback)
    return this
  }

  unsubscribeAll(stream: string): boolean { return this.subscriptions.delete(stream) }

  private notify(stream: string, event: StoredEvent2): void {
    this.subscriptions.get(stream)?.forEach(cb => cb(event))
  }

  getDeadLetterQueue(): StoredEvent2[] { return [...this.deadLetterQueue] }
  clearDeadLetterQueue(): void { this.deadLetterQueue = [] }

  compact(beforeVersion: number): number {
    let removed = 0
    this.events.forEach((event, id) => {
      if (event.version < beforeVersion && event.status === 'processed') {
        this.events.delete(id)
        const stream = this.streams.get(event.stream)
        if (stream) {
          const idx = stream.indexOf(id)
          if (idx >= 0) stream.splice(idx, 1)
        }
        removed++
      }
    })
    return removed
  }

  getStreams(): string[] { return Array.from(this.streams.keys()) }
  getStreamVersion(stream: string): number {
    const ids = this.streams.get(stream)
    if (!ids || ids.length === 0) return 0
    return this.events.get(ids[ids.length - 1])?.version ?? 0
  }

  getGlobalVersion(): number { return this.globalVersion }

  getStats(): { total: number; pending: number; processed: number; failed: number; deadLetter: number; streams: number } {
    return {
      total: this.events.size,
      pending: this.getByStatus('pending').length,
      processed: this.getByStatus('processed').length,
      failed: this.getByStatus('failed').length,
      deadLetter: this.deadLetterQueue.length,
      streams: this.streams.size,
    }
  }

  count(): number { return this.events.size }

  toArray(): StoredEvent2[] { return Array.from(this.events.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): EventStore2 {
    const es = new EventStore2()
    this.events.forEach((e, id) => es.events.set(id, { ...e, data: { ...e.data }, metadata: { ...e.metadata } }))
    this.streams.forEach((ids, stream) => es.streams.set(stream, [...ids]))
    es.deadLetterQueue = [...this.deadLetterQueue]
    es.idCounter = this.idCounter
    es.globalVersion = this.globalVersion
    return es
  }
  equals(other: unknown): boolean {
    if (!(other instanceof EventStore2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.events.clear()
    this.streams.clear()
    this.subscriptions.clear()
    this.deadLetterQueue = []
    this.idCounter = 0
    this.globalVersion = 0
  }
}
