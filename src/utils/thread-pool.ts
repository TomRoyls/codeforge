export interface ThreadPoolOptions {
  maxConcurrency: number
}

export interface TaskResult<T> {
  result: T
  duration: number
  error: false
}

export interface TaskError {
  error: true
  message: string
  duration: number
}

export type TaskOutcome<T> = TaskResult<T> | TaskError

export class ThreadPool {
  private maxConcurrency: number
  private activeCount: number = 0
  private queue: Array<{
    task: () => Promise<unknown>
    resolve: (value: unknown) => void
    reject: (reason: unknown) => void
  }> = []
  private _qi: number = 0

  constructor(options?: Partial<ThreadPoolOptions>) {
    this.maxConcurrency = options?.maxConcurrency ?? 4
  }

  async submit<T>(task: () => Promise<T>): Promise<TaskOutcome<T>> {
    return new Promise<TaskOutcome<T>>((resolve) => {
      const wrapped = async () => {
        const start = performance.now()
        try {
          const result = await task()
          const duration = performance.now() - start
          resolve({ result, duration, error: false })
        } catch (err) {
          const duration = performance.now() - start
          resolve({
            error: true,
            message: err instanceof Error ? err.message : String(err),
            duration,
          })
        }
      }

      if (this.activeCount < this.maxConcurrency) {
        this.execute(wrapped)
      } else {
        this.queue.push({
          task: wrapped,
          resolve: resolve as (value: unknown) => void,
          reject: () => {},
        })
      }
    })
  }

  private async execute(task: () => Promise<void>): Promise<void> {
    this.activeCount++
    try {
      await task()
    } finally {
      this.activeCount--
      this.processQueue()
    }
  }

  private processQueue(): void {
    if (this._qi >= this.queue.length || this.activeCount >= this.maxConcurrency) return
    const next = this.queue[this._qi]!
    this._qi++
    if (this._qi >= 64 && this._qi >= this.queue.length) {
      this.queue.length = 0
      this._qi = 0
    }
    if (next) {
      void this.execute(next.task as () => Promise<void>).then(next.resolve).catch(next.reject)
    }
  }

  get pending(): number {
    return this.queue.length - this._qi
  }

  get active(): number {
    return this.activeCount
  }

  get available(): number {
    return this.maxConcurrency - this.activeCount
  }

  get maxSlots(): number {
    return this.maxConcurrency
  }
}
