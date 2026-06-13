export interface PoolTask2<T> {
  id: string
  fn: () => Promise<T>
}

export interface PoolResult2<T> {
  id: string
  result?: T
  error?: Error
  success: boolean
}

export class PromisePool2<T> {
  private concurrency: number
  private tasks: PoolTask2<T>[] = []
  private completed: PoolResult2<T>[] = []
  private active: number = 0
  private paused = false
  private taskCounter = 0

  constructor(concurrency = 5) {
    this.concurrency = Math.max(1, concurrency)
  }

  add(id: string, fn: () => Promise<T>): this {
    this.tasks.push({ id, fn })
    return this
  }

  addMany(tasks: { id: string; fn: () => Promise<T> }[]): this {
    this.tasks.push(...tasks)
    return this
  }

  setConcurrency(n: number): this {
    this.concurrency = Math.max(1, n)
    return this
  }

  getConcurrency(): number {
    return this.concurrency
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

  async run(): Promise<PoolResult2<T>[]> {
    return new Promise((resolve) => {
      this.completed = []

      const checkComplete = () => {
        if (this.tasks.length === 0 && this.active === 0) {
          resolve(this.completed)
        }
      }

      const runNext = () => {
        if (this.paused) return
        while (this.active < this.concurrency && this.tasks.length > 0) {
          const task = this.tasks.shift()!
          this.active++

          task.fn()
            .then(result => {
              this.completed.push({ id: task.id, result, success: true })
            })
            .catch(error => {
              this.completed.push({ id: task.id, error, success: false })
            })
            .finally(() => {
              this.active--
              runNext()
              checkComplete()
            })
        }
        checkComplete()
      }

      runNext()
    })
  }

  async runAll(): Promise<PoolResult2<T>[]> {
    const results = await Promise.all(
      this.tasks.map(async task => {
        try {
          const result = await task.fn()
          return { id: task.id, result, success: true } as PoolResult2<T>
        } catch (error) {
          return { id: task.id, error: error as Error, success: false } as PoolResult2<T>
        }
      })
    )
    this.tasks = []
    return results
  }

  getPendingCount(): number {
    return this.tasks.length
  }

  getActiveCount(): number {
    return this.active
  }

  getCompletedCount(): number {
    return this.completed.length
  }

  getResults(): PoolResult2<T>[] {
    return [...this.completed]
  }

  count(): number { return this.tasks.length + this.completed.length }

  toArray(): string[] { return this.tasks.map(t => t.id) }
  toString(): string { return JSON.stringify({ concurrency: this.concurrency, pending: this.tasks.length }) }
  toJSON(): Record<string, unknown> { return { concurrency: this.concurrency, pending: this.getPendingCount(), completed: this.getCompletedCount() } }
  clone(): PromisePool2<T> {
    const pool = new PromisePool2<T>(this.concurrency)
    pool.tasks = [...this.tasks]
    pool.completed = [...this.completed]
    return pool
  }
  equals(other: unknown): boolean {
    if (!(other instanceof PromisePool2)) return false
    return this.concurrency === other.concurrency
  }
  clear(): void {
    this.tasks = []
    this.completed = []
    this.active = 0
    this.taskCounter = 0
  }
}
