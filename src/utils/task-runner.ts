export interface TaskRunnerOptions {
  concurrency: number
  onProgress?: (completed: number, total: number) => void
  stopOnError?: boolean
}

export interface TaskResult<T> {
  error?: Error
  index: number
  result?: T
  status: 'error' | 'success'
  taskName: string
}

export interface TaskRunnerStats {
  completed: number
  errors: number
  total: number
  elapsedMs: number
}

export class TaskRunner {
  private concurrency: number
  private onProgress?: (completed: number, total: number) => void
  private stopOnError: boolean
  private aborted = false

  constructor(options: Partial<TaskRunnerOptions> & { concurrency: number }) {
    if (options.concurrency < 1) {
      throw new RangeError(`concurrency must be >= 1, got ${options.concurrency}`)
    }
    this.concurrency = options.concurrency
    this.onProgress = options.onProgress
    this.stopOnError = options.stopOnError ?? false
  }

  async runAll<T>(
    tasks: Array<{ fn: () => Promise<T>; name: string }>,
  ): Promise<TaskResult<T>[]> {
    this.aborted = false
    const total = tasks.length
    const results: TaskResult<T>[] = new Array(total)
    let completedCount = 0
    let nextIndex = 0

    const runNext = async (): Promise<void> => {
      while (nextIndex < total && !this.aborted) {
        const idx = nextIndex++
        const task = tasks[idx]!
        try {
          const result = await task.fn()
          results[idx] = { index: idx, result, status: 'success', taskName: task.name }
        } catch (error) {
          results[idx] = { index: idx, error: error as Error, status: 'error', taskName: task.name }
          if (this.stopOnError) {
            this.aborted = true
          }
        }
        completedCount++
        this.onProgress?.(completedCount, total)
      }
    }

    const workers: Promise<void>[] = []
    const workerCount = Math.min(this.concurrency, total)
    for (let i = 0; i < workerCount; i++) {
      workers.push(runNext())
    }
    await Promise.all(workers)

    return results
  }

  async runSuccessful<T>(
    tasks: Array<{ fn: () => Promise<T>; name: string }>,
  ): Promise<T[]> {
    const results = await this.runAll(tasks)
    return results
      .filter((r): r is TaskResult<T> & { status: 'success' } => r.status === 'success')
      .map((r) => r.result!)
  }

  getStats(results: TaskResult<unknown>[]): TaskRunnerStats {
    let errors = 0
    for (const r of results) {
      if (r.status === 'error') errors++
    }
    return {
      completed: results.length,
      errors,
      total: results.length,
      elapsedMs: 0,
    }
  }

  abort(): void {
    this.aborted = true
  }

  get isAborted(): boolean {
    return this.aborted
  }
}

export async function runWithConcurrency<T>(
  items: T[],
  fn: (item: T, index: number) => Promise<void>,
  concurrency: number,
): Promise<void> {
  let nextIndex = 0
  const runNext = async (): Promise<void> => {
    while (nextIndex < items.length) {
      const idx = nextIndex++
      await fn(items[idx]!, idx)
    }
  }
  const workers: Promise<void>[] = []
  const workerCount = Math.min(concurrency, items.length)
  for (let i = 0; i < workerCount; i++) {
    workers.push(runNext())
  }
  await Promise.all(workers)
}
