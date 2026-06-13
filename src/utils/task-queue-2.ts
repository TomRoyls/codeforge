export interface TaskItem2<T = unknown> {
  id: string
  data: T
  priority: number
  createdAt: number
}

export type TaskHandler2<T> = (data: T) => void | Promise<void>

export class TaskQueue2<T = unknown> {
  private queue: TaskItem2<T>[] = []
  private processing: Set<string> = new Set()
  private completed: string[] = []
  private failed: Map<string, Error> = new Map()
  private handler: TaskHandler2<T> | null = null
  private concurrency: number = 1
  private paused = false
  private maxRetries: number = 0
  private retryCounts: Map<string, number> = new Map()

  setHandler(handler: TaskHandler2<T>): this {
    this.handler = handler
    return this
  }

  setConcurrency(n: number): this {
    this.concurrency = Math.max(1, n)
    return this
  }

  setMaxRetries(n: number): this {
    this.maxRetries = n
    return this
  }

  enqueue(id: string, data: T, priority = 0): this {
    this.queue.push({ id, data, priority, createdAt: Date.now() })
    this.queue.sort((a, b) => b.priority - a.priority || a.createdAt - b.createdAt)
    return this
  }

  dequeue(): TaskItem2<T> | undefined {
    return this.queue.shift()
  }

  pause(): void {
    this.paused = true
  }

  resume(): void {
    this.paused = false
  }

  isPaused(): boolean {
    return this.paused
  }

  async process(): Promise<void> {
    if (!this.handler) return

    while (this.queue.length > 0 && !this.paused) {
      const tasksToRun: TaskItem2<T>[] = []
      while (tasksToRun.length < this.concurrency && this.queue.length > 0) {
        const task = this.queue.shift()
        if (task) tasksToRun.push(task)
      }

      await Promise.all(tasksToRun.map(async task => {
        this.processing.add(task.id)
        try {
          await this.handler!(task.data)
          this.completed.push(task.id)
        } catch (err) {
          const retries = this.retryCounts.get(task.id) ?? 0
          if (retries < this.maxRetries) {
            this.retryCounts.set(task.id, retries + 1)
            this.queue.push(task)
          } else {
            this.failed.set(task.id, err as Error)
          }
        }
        this.processing.delete(task.id)
      }))
    }
  }

  async processOne(): Promise<boolean> {
    if (!this.handler || this.paused) return false
    const task = this.queue.shift()
    if (!task) return false

    this.processing.add(task.id)
    try {
      await this.handler(task.data)
      this.completed.push(task.id)
    } catch (err) {
      const retries = this.retryCounts.get(task.id) ?? 0
      if (retries < this.maxRetries) {
        this.retryCounts.set(task.id, retries + 1)
        this.queue.push(task)
      } else {
        this.failed.set(task.id, err as Error)
      }
    }
    this.processing.delete(task.id)
    return true
  }

  getQueueSize(): number { return this.queue.length }
  getProcessingCount(): number { return this.processing.size }
  getCompletedCount(): number { return this.completed.length }
  getFailedCount(): number { return this.failed.size }

  getFailedIds(): string[] {
    return Array.from(this.failed.keys())
  }

  getCompletedIds(): string[] {
    return [...this.completed]
  }

  peek(): TaskItem2<T> | undefined {
    return this.queue[0]
  }

  has(id: string): boolean {
    return this.queue.some(t => t.id === id)
  }

  remove(id: string): boolean {
    const idx = this.queue.findIndex(t => t.id === id)
    if (idx === -1) return false
    this.queue.splice(idx, 1)
    return true
  }

  clear(): void {
    this.queue = []
    this.processing.clear()
    this.completed = []
    this.failed.clear()
    this.retryCounts.clear()
  }

  count(): number {
    return this.queue.length + this.processing.size
  }

  toArray(): string[] { return this.queue.map(t => t.id) }
  toString(): string { return JSON.stringify({ pending: this.queue.length, completed: this.completed.length }) }
  toJSON(): Record<string, unknown> { return { pending: this.getQueueSize(), processing: this.getProcessingCount(), completed: this.getCompletedCount(), failed: this.getFailedCount() } }
  clone(): TaskQueue2<T> {
    const tq = new TaskQueue2<T>()
    tq.queue = [...this.queue]
    tq.handler = this.handler
    tq.concurrency = this.concurrency
    tq.maxRetries = this.maxRetries
    return tq
  }
  equals(other: unknown): boolean {
    if (!(other instanceof TaskQueue2)) return false
    return this.count() === other.count()
  }
}
