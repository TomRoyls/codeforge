export type ExportFormat2 = 'otlp' | 'jaeger' | 'zipkin' | 'json' | 'protobuf'
export type ExportStatus2 = 'idle' | 'exporting' | 'success' | 'failed' | 'timeout'

export interface ExportBatch2 {
  id: number
  format: ExportFormat2
  spans: unknown[]
  status: ExportStatus2
  createdAt: number
  completedAt: number | null
  error: string | null
  byteSize: number
}

export class SpanExporter2 {
  private batches: Map<number, ExportBatch2> = new Map()
  private transports: Map<ExportFormat2, (data: unknown[]) => Promise<void>> = new Map()
  private idCounter = 0
  private batchSize: number = 512
  private flushInterval: number = 5000
  private maxRetries: number = 3
  private timeout: number = 10000
  private queue: unknown[] = []
  private listeners: Array<(event: string, batch: ExportBatch2) => void> = []
  private totalExported: number = 0
  private totalFailed: number = 0

  setBatchSize(n: number): this { this.batchSize = n; return this }
  setFlushInterval(ms: number): this { this.flushInterval = ms; return this }
  setMaxRetries(n: number): this { this.maxRetries = n; return this }
  setTimeout(ms: number): this { this.timeout = ms; return this }

  registerTransport(format: ExportFormat2, transport: (data: unknown[]) => Promise<void>): this {
    this.transports.set(format, transport)
    return this
  }

  enqueue(span: unknown): void {
    this.queue.push(span)
  }

  enqueueBatch(spans: unknown[]): void {
    this.queue.push(...spans)
  }

  async exportBatch(format: ExportFormat2 = 'json'): Promise<ExportBatch2 | null> {
    if (this.queue.length === 0) return null
    const transport = this.transports.get(format)
    const batchSpans = this.queue.splice(0, this.batchSize)
    const id = ++this.idCounter
    const batch: ExportBatch2 = {
      id, format, spans: batchSpans,
      status: 'exporting',
      createdAt: Date.now(),
      completedAt: null,
      error: null,
      byteSize: JSON.stringify(batchSpans).length,
    }
    this.batches.set(id, batch)
    this.notify('exporting', batch)

    if (!transport) {
      batch.status = 'failed'
      batch.error = `No transport for format: ${format}`
      batch.completedAt = Date.now()
      this.totalFailed++
      this.notify('failed', batch)
      return batch
    }

    let retries = 0
    while (retries < this.maxRetries) {
      try {
        await transport(batchSpans)
        batch.status = 'success'
        batch.completedAt = Date.now()
        this.totalExported += batchSpans.length
        this.notify('success', batch)
        return batch
      } catch (e) {
        retries++
        batch.error = String(e)
      }
    }
    batch.status = 'failed'
    batch.completedAt = Date.now()
    this.totalFailed += batchSpans.length
    this.notify('failed', batch)
    return batch
  }

  async exportAll(format: ExportFormat2 = 'json'): Promise<ExportBatch2[]> {
    const results: ExportBatch2[] = []
    while (this.queue.length > 0) {
      const batch = await this.exportBatch(format)
      if (batch) results.push(batch)
    }
    return results
  }

  getQueueSize(): number { return this.queue.length }
  getBatch(id: number): ExportBatch2 | undefined { return this.batches.get(id) }

  getFailedBatches(): ExportBatch2[] {
    return Array.from(this.batches.values()).filter(b => b.status === 'failed')
  }

  getSuccessfulBatches(): ExportBatch2[] {
    return Array.from(this.batches.values()).filter(b => b.status === 'success')
  }

  retryBatch(id: number): boolean {
    const batch = this.batches.get(id)
    if (!batch || batch.status !== 'failed') return false
    batch.status = 'exporting'
    batch.error = null
    this.queue.push(...batch.spans)
    this.batches.delete(id)
    return true
  }

  listen(fn: (event: string, batch: ExportBatch2) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, batch: ExportBatch2): void {
    this.listeners.forEach(fn => fn(event, batch))
  }

  getStats(): { total: number; exported: number; failed: number; queued: number; batches: number } {
    return {
      total: this.totalExported + this.totalFailed,
      exported: this.totalExported,
      failed: this.totalFailed,
      queued: this.queue.length,
      batches: this.batches.size,
    }
  }

  count(): number { return this.batches.size }

  toArray(): ExportBatch2[] { return Array.from(this.batches.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): SpanExporter2 {
    const se = new SpanExporter2()
    se.batchSize = this.batchSize
    se.flushInterval = this.flushInterval
    se.maxRetries = this.maxRetries
    se.timeout = this.timeout
    se.totalExported = this.totalExported
    se.totalFailed = this.totalFailed
    return se
  }
  equals(other: unknown): boolean {
    if (!(other instanceof SpanExporter2)) return false
    return this.totalExported === other.totalExported
  }
  clear(): void {
    this.batches.clear()
    this.transports.clear()
    this.queue = []
    this.listeners = []
    this.idCounter = 0
    this.totalExported = 0
    this.totalFailed = 0
  }
}
