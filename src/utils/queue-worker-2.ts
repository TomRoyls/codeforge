export interface QueueJob2<T = unknown> {
  id: string
  data: T
  attempts: number
  maxAttempts: number
  enqueuedAt: number
}

export class QueueWorker2<T = unknown> {
  private queue: QueueJob2<T>[] = []
  private processing = false
  private processed = 0
  private failed = 0
  private handler?: (job: QueueJob2<T>) => Promise<void>
  private concurrency = 1
  private activeJobs = 0

  setHandler(fn: (job: QueueJob2<T>) => Promise<void>): this {
    this.handler = fn
    return this
  }

  setConcurrency(n: number): this {
    this.concurrency = Math.max(1, n)
    return this
  }

  enqueue(data: T, maxAttempts = 3): string {
    const id = `job_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    this.queue.push({ id, data, attempts: 0, maxAttempts, enqueuedAt: Date.now() })
    return id
  }

  dequeue(): QueueJob2<T> | undefined {
    return this.queue.shift()
  }

  size(): number {
    return this.queue.length
  }

  isEmpty(): boolean {
    return this.queue.length === 0
  }

  async process(): Promise<void> {
    if (this.processing) return
    this.processing = true
    try {
      while (this.queue.length > 0) {
        const batch = this.queue.splice(0, this.concurrency)
        this.activeJobs = batch.length
        await Promise.all(batch.map(job => this.processJob(job)))
        this.activeJobs = 0
      }
    } finally {
      this.processing = false
    }
  }

  private async processJob(job: QueueJob2<T>): Promise<void> {
    if (!this.handler) return
    job.attempts++
    try {
      await this.handler(job)
      this.processed++
    } catch (err) {
      if (job.attempts < job.maxAttempts) {
        this.queue.push(job)
      } else {
        this.failed++
      }
    }
  }

  getStats(): { queueSize: number; processed: number; failed: number; active: number } {
    return { queueSize: this.queue.length, processed: this.processed, failed: this.failed, active: this.activeJobs }
  }

  clear(): void {
    this.queue = []
    this.processed = 0
    this.failed = 0
  }

  peek(): QueueJob2<T> | undefined {
    return this.queue[0]
  }

  remove(id: string): boolean {
    const idx = this.queue.findIndex(j => j.id === id)
    if (idx !== -1) {
      this.queue.splice(idx, 1)
      return true
    }
    return false
  }

  toArray(): QueueJob2<T>[] { return [...this.queue] }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, number> { return this.getStats() }
  clone(): QueueWorker2<T> {
    const q = new QueueWorker2<T>()
    q.queue = [...this.queue]
    q.concurrency = this.concurrency
    return q
  }
  equals(other: unknown): boolean {
    if (!(other instanceof QueueWorker2)) return false
    return this.size() === other.size()
  }
}
