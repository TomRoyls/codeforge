import type { PoolConfig, PoolStats, PoolTask } from './types.js'
import { DEFAULT_POOL_CONFIG } from './types.js'
import { TaskQueue } from './task-queue.js'

export class WorkerPool {
  private config: PoolConfig
  private queue: TaskQueue = new TaskQueue()
  private active: Set<string> = new Set()
  private taskResolvers: Map<string, {
    resolve: (value: unknown) => void
    reject: (reason: unknown) => void
  }> = new Map()
  private taskCounter: number = 0

  constructor(config?: Partial<PoolConfig>) {
    this.config = { ...DEFAULT_POOL_CONFIG, ...config }
  }

  submit<T>(fn: () => T | Promise<T>, priority?: number, id?: string): Promise<T> {
    const taskId = id ?? `pool-task-${++this.taskCounter}`
    const task: PoolTask<T> = {
      id: taskId,
      fn,
      priority: priority ?? 0,
      status: 'pending',
    }
    this.queue.enqueue(task)

    const promise = new Promise<T>((resolve, reject) => {
      this.taskResolvers.set(taskId, {
        resolve: resolve as (value: unknown) => void,
        reject,
      })
    })

    this.tryRun()

    return promise
  }

  tryRun(): void {
    while (this.active.size < this.config.concurrency) {
      const task = this.queue.dequeue()
      if (!task) break
      this.active.add(task.id)
      this.runTask(task)
        .then((result) => {
          task.status = 'completed'
          task.result = result
          const resolver = this.taskResolvers.get(task.id)
          if (resolver) {
            resolver.resolve(result)
            this.taskResolvers.delete(task.id)
          }
        })
        .catch((err: unknown) => {
          task.status = 'failed'
          task.error = err
          const resolver = this.taskResolvers.get(task.id)
          if (resolver) {
            resolver.reject(err)
            this.taskResolvers.delete(task.id)
          }
        })
        .finally(() => {
          this.active.delete(task.id)
          this.tryRun()
        })
    }
  }

  async runTask<T>(task: PoolTask<T>): Promise<T> {
    let lastError: unknown
    const maxAttempts = this.config.retryCount + 1

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const result = await this.executeWithTimeout(task.fn)
        return result
      } catch (err) {
        lastError = err
        if (attempt < this.config.retryCount) {
          await new Promise<void>((r) => setTimeout(r, this.config.retryDelay))
        }
      }
    }

    throw lastError
  }

  private executeWithTimeout<T>(fn: () => T | Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Task timeout')), this.config.timeout)
      Promise.resolve(fn())
        .then((result) => {
          clearTimeout(timer)
          resolve(result)
        })
        .catch((err) => {
          clearTimeout(timer)
          reject(err)
        })
    })
  }

  cancel(id: string): boolean {
    const task = this.queue.get(id)
    if (!task) return false
    if (task.status !== 'pending') return false
    task.status = 'cancelled'
    const resolver = this.taskResolvers.get(id)
    if (resolver) {
      resolver.reject(new Error('Task cancelled'))
      this.taskResolvers.delete(id)
    }
    return true
  }

  cancelAll(): number {
    const pendingTasks = this.queue.pending()
    let count = 0
    for (const task of pendingTasks) {
      task.status = 'cancelled'
      const resolver = this.taskResolvers.get(task.id)
      if (resolver) {
        resolver.reject(new Error('Task cancelled'))
        this.taskResolvers.delete(task.id)
      }
      count++
    }
    return count
  }

  getStatus(): PoolStats {
    const allTasks = this.getAllTasks()
    return {
      total: allTasks.length,
      pending: allTasks.filter((t) => t.status === 'pending').length,
      running: allTasks.filter((t) => t.status === 'running').length,
      completed: allTasks.filter((t) => t.status === 'completed').length,
      failed: allTasks.filter((t) => t.status === 'failed').length,
      cancelled: allTasks.filter((t) => t.status === 'cancelled').length,
    }
  }

  getTask(id: string): PoolTask<unknown> | undefined {
    return this.queue.get(id)
  }

  async awaitAll(): Promise<unknown[]> {
    while (this.active.size > 0) {
      await new Promise<void>((r) => setTimeout(r, 10))
    }
    const allTasks = this.getAllTasks()
    return allTasks
      .filter((t) => t.status === 'completed')
      .map((t) => t.result)
  }

  getConfig(): PoolConfig {
    return { ...this.config }
  }

  private getAllTasks(): PoolTask<unknown>[] {
    return this.queue.all()
  }
}
