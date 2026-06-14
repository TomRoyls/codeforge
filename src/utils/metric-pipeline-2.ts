export type MetricType2 = 'counter' | 'gauge' | 'histogram' | 'timer' | 'set'

export interface MetricPoint2 {
  name: string
  type: MetricType2
  value: number
  tags: Record<string, string>
  timestamp: number
}

export class MetricPipeline2 {
  private buffer: MetricPoint2[] = []
  private flushers: Array<(points: MetricPoint2[]) => void> = []
  private transformers: Array<(point: MetricPoint2) => MetricPoint2> = []
  private filters: Array<(point: MetricPoint2) => boolean> = []
  private batchSize: number = 100
  private flushCount: number = 0
  private totalProcessed: number = 0
  private totalFlushed: number = 0
  private dropped: number = 0

  setBatchSize(n: number): this { this.batchSize = n; return this }

  addTransformer(fn: (point: MetricPoint2) => MetricPoint2): this {
    this.transformers.push(fn)
    return this
  }

  addFilter(fn: (point: MetricPoint2) => boolean): this {
    this.filters.push(fn)
    return this
  }

  addFlusher(fn: (points: MetricPoint2[]) => void): this {
    this.flushers.push(fn)
    return this
  }

  emit(name: string, type: MetricType2, value: number, tags: Record<string, string> = {}): void {
    let point: MetricPoint2 = { name, type, value, tags, timestamp: Date.now() }
    for (const filter of this.filters) {
      if (!filter(point)) { this.dropped++; return }
    }
    for (const transform of this.transformers) {
      point = transform(point)
    }
    this.buffer.push(point)
    this.totalProcessed++
    if (this.buffer.length >= this.batchSize) this.flush()
  }

  flush(): number {
    if (this.buffer.length === 0) return 0
    const batch = [...this.buffer]
    this.buffer = []
    for (const flusher of this.flushers) {
      flusher(batch)
    }
    this.flushCount++
    this.totalFlushed += batch.length
    return batch.length
  }

  getBuffer(): MetricPoint2[] { return [...this.buffer] }
  getBufferSize(): number { return this.buffer.length }
  getFlushCount(): number { return this.flushCount }

  getStats(): { processed: number; flushed: number; dropped: number; buffered: number; flushes: number } {
    return {
      processed: this.totalProcessed,
      flushed: this.totalFlushed,
      dropped: this.dropped,
      buffered: this.buffer.length,
      flushes: this.flushCount,
    }
  }

  count(): number { return this.totalProcessed }

  toArray(): MetricPoint2[] { return [...this.buffer] }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): MetricPipeline2 {
    const mp = new MetricPipeline2()
    mp.buffer = [...this.buffer]
    mp.batchSize = this.batchSize
    mp.flushCount = this.flushCount
    mp.totalProcessed = this.totalProcessed
    mp.totalFlushed = this.totalFlushed
    mp.dropped = this.dropped
    return mp
  }
  equals(other: unknown): boolean {
    if (!(other instanceof MetricPipeline2)) return false
    return this.totalProcessed === other.totalProcessed
  }
  clear(): void {
    this.buffer = []
    this.flushers = []
    this.transformers = []
    this.filters = []
    this.flushCount = 0
    this.totalProcessed = 0
    this.totalFlushed = 0
    this.dropped = 0
  }
}
