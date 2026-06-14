export type LogLevel2 = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'
export type ShipperStatus2 = 'idle' | 'shipping' | 'flushing' | 'error' | 'stopped'

export interface LogEntry2 {
  id: string
  level: LogLevel2
  message: string
  timestamp: number
  source: string
  fields: Record<string, unknown>
  traceId: string | null
  spanId: string | null
}

export interface LogBatch2 {
  entries: LogEntry2[]
  size: number
  createdAt: number
}

export class LogShipper2 {
  private queue: LogEntry2[] = []
  private batches: LogBatch2[] = []
  private shipped: number = 0
  private dropped: number = 0
  private errors: number = 0
  private status: ShipperStatus2 = 'idle'
  private batchSize: number = 100
  private maxQueueSize: number = 10000
  private flushInterval: number = 5000
  private lastFlush: number = 0
  private endpoints: Map<string, boolean> = new Map()
  private filters: Array<(entry: LogEntry2) => boolean> = []
  private enrichers: Array<(entry: LogEntry2) => LogEntry2> = []
  private levelFilter: Set<LogLevel2> = new Set(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])

  addEndpoint(name: string): this { this.endpoints.set(name, true); return this }
  removeEndpoint(name: string): boolean { return this.endpoints.delete(name) }
  getEndpoints(): string[] { return Array.from(this.endpoints.keys()) }

  setBatchSize(size: number): this { this.batchSize = size; return this }
  setMaxQueueSize(size: number): this { this.maxQueueSize = size; return this }
  setFlushInterval(ms: number): this { this.flushInterval = ms; return this }

  enableLevel(level: LogLevel2): this { this.levelFilter.add(level); return this }
  disableLevel(level: LogLevel2): this { this.levelFilter.delete(level); return this }
  isLevelEnabled(level: LogLevel2): boolean { return this.levelFilter.has(level) }

  addFilter(fn: (entry: LogEntry2) => boolean): this { this.filters.push(fn); return this }
  addEnricher(fn: (entry: LogEntry2) => LogEntry2): this { this.enrichers.push(fn); return this }

  enqueue(entry: Omit<LogEntry2, 'id'> & { id?: string }): boolean {
    if (!this.isLevelEnabled(entry.level)) { this.dropped++; return false }
    const fullEntry: LogEntry2 = { ...entry, id: entry.id ?? `log_${Date.now()}_${this.queue.length}` }
    for (const filter of this.filters) {
      if (!filter(fullEntry)) { this.dropped++; return false }
    }
    for (const enricher of this.enrichers) {
      fullEntry = enricher(fullEntry)
    }
    if (this.queue.length >= this.maxQueueSize) {
      this.dropped++
      this.queue.shift()
    }
    this.queue.push(fullEntry)
    return true
  }

  batch(): LogBatch2 | null {
    if (this.queue.length === 0) return null
    const entries = this.queue.splice(0, Math.min(this.batchSize, this.queue.length))
    const batch: LogBatch2 = {
      entries,
      size: entries.length,
      createdAt: Date.now(),
    }
    this.batches.push(batch)
    this.status = 'shipping'
    return batch
  }

  ship(batch: LogBatch2): boolean {
    this.status = 'shipping'
    if (this.endpoints.size === 0) {
      this.errors++
      this.status = 'error'
      return false
    }
    this.shipped += batch.size
    const idx = this.batches.indexOf(batch)
    if (idx >= 0) this.batches.splice(idx, 1)
    this.status = 'idle'
    this.lastFlush = Date.now()
    return true
  }

  flush(): number {
    this.status = 'flushing'
    let count = 0
    while (this.queue.length > 0) {
      const batch = this.batch()
      if (!batch) break
      if (this.ship(batch)) count += batch.size
    }
    this.lastFlush = Date.now()
    this.status = 'idle'
    return count
  }

  shouldFlush(): boolean {
    return this.queue.length >= this.batchSize || (Date.now() - this.lastFlush >= this.flushInterval && this.queue.length > 0)
  }

  getQueueSize(): number { return this.queue.length }
  getPendingBatches(): number { return this.batches.length }
  getShipped(): number { return this.shipped }
  getDropped(): number { return this.dropped }
  getErrors(): number { return this.errors }
  getStatus(): ShipperStatus2 { return this.status }

  stop(): void { this.status = 'stopped' }

  getStats(): { queued: number; shipped: number; dropped: number; errors: number; pendingBatches: number } {
    return {
      queued: this.queue.length,
      shipped: this.shipped,
      dropped: this.dropped,
      errors: this.errors,
      pendingBatches: this.batches.length,
    }
  }

  count(): number { return this.shipped }

  toArray(): LogEntry2[] { return [...this.queue] }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): LogShipper2 {
    const ls = new LogShipper2()
    ls.queue = [...this.queue]
    ls.shipped = this.shipped
    ls.dropped = this.dropped
    ls.errors = this.errors
    ls.batchSize = this.batchSize
    ls.maxQueueSize = this.maxQueueSize
    ls.flushInterval = this.flushInterval
    this.endpoints.forEach((v, k) => ls.endpoints.set(k, v))
    this.levelFilter.forEach(l => ls.levelFilter.add(l))
    return ls
  }
  equals(other: unknown): boolean {
    if (!(other instanceof LogShipper2)) return false
    return this.shipped === other.shipped
  }
  clear(): void {
    this.queue = []
    this.batches = []
    this.shipped = 0
    this.dropped = 0
    this.errors = 0
    this.status = 'idle'
  }
}
