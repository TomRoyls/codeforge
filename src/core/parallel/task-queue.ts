import pLimit from 'p-limit'
import type { ParallelConfig, TaskResult, BatchResult, WorkerPoolStats } from './types.js'
import { DEFAULT_PARALLEL_CONFIG } from './types.js'

export class TaskQueue {
  private config: ParallelConfig
  private limiter: ReturnType<typeof pLimit>
  private completedCount = 0
  private failedCount = 0
  private totalDuration = 0

  constructor(config?: Partial<ParallelConfig>) {
    this.config = { ...DEFAULT_PARALLEL_CONFIG, ...config }
    this.limiter = pLimit(this.config.maxConcurrency)
  }

  async executeTask<T>(
    filePath: string,
    taskFn: (filePath: string) => Promise<T>,
  ): Promise<TaskResult<T>> {
    const start = performance.now()
    let lastError: Error | undefined
    let retries = 0

    for (let attempt = 0; attempt <= this.config.retryCount; attempt++) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Task timed out after ${this.config.timeout}ms`)), this.config.timeout),
        )
        const result = await Promise.race([taskFn(filePath), timeoutPromise])
        const duration = performance.now() - start
        this.completedCount++
        this.totalDuration += duration
        return { filePath, success: true, result, duration, retries }
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
        retries = attempt
        if (attempt < this.config.retryCount) {
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay))
        }
      }
    }

    const duration = performance.now() - start
    this.failedCount++
    this.totalDuration += duration
    return { filePath, success: false, error: lastError, duration, retries }
  }

  async executeBatch<T>(
    filePaths: string[],
    taskFn: (filePath: string) => Promise<T>,
    onProgress?: (completed: number, total: number) => void,
  ): Promise<BatchResult<T>> {
    if (filePaths.length === 0) {
      return {
        results: [],
        totalDuration: 0,
        successCount: 0,
        failureCount: 0,
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        throughput: 0,
      }
    }

    const batchStart = performance.now()
    let completed = 0
    const total = filePaths.length

    const promises = filePaths.map(filePath =>
      this.limiter(async () => {
        const result = await this.executeTask(filePath, taskFn)
        completed++
        onProgress?.(completed, total)
        return result
      }),
    )

    const settled = await Promise.allSettled(promises)
    const results: TaskResult<T>[] = settled.map((s, i) => {
      if (s.status === 'fulfilled') return s.value
      return {
        filePath: filePaths[i]!,
        success: false,
        error: s.reason instanceof Error ? s.reason : new Error(String(s.reason)),
        duration: 0,
        retries: 0,
      }
    })

    const totalDuration = performance.now() - batchStart
    let successCount = 0
    let failureCount = 0
    let totalResultDuration = 0
    let minDuration = Infinity
    let maxDuration = 0
    for (const r of results) {
      if (r.success) successCount++
      else failureCount++
      totalResultDuration += r.duration
      if (r.duration < minDuration) minDuration = r.duration
      if (r.duration > maxDuration) maxDuration = r.duration
    }
    const averageDuration = results.length > 0 ? totalResultDuration / results.length : 0
    if (results.length === 0) { minDuration = 0 }
    const throughput = totalDuration > 0 ? (results.length / totalDuration) * 1000 : 0

    return {
      results,
      totalDuration,
      successCount,
      failureCount,
      averageDuration,
      minDuration,
      maxDuration,
      throughput,
    }
  }

  getStats(): WorkerPoolStats {
    const activeTasks = this.limiter.activeCount
    const queuedTasks = this.limiter.pendingCount
    const completedTasks = this.completedCount
    const failedTasks = this.failedCount
    const totalTasks = completedTasks + failedTasks + activeTasks + queuedTasks
    const averageTaskDuration = this.completedCount > 0 ? this.totalDuration / this.completedCount : 0
    const poolUtilization = this.config.maxConcurrency > 0 ? activeTasks / this.config.maxConcurrency : 0

    return {
      activeTasks,
      queuedTasks,
      completedTasks,
      failedTasks,
      totalTasks,
      averageTaskDuration,
      poolUtilization,
    }
  }

  updateConfig(config: Partial<ParallelConfig>): void {
    this.config = { ...this.config, ...config }
    if (config.maxConcurrency !== undefined) {
      this.limiter = pLimit(this.config.maxConcurrency)
    }
  }

  reset(): void {
    this.completedCount = 0
    this.failedCount = 0
    this.totalDuration = 0
  }

  getPendingCount(): number {
    return this.limiter.pendingCount
  }

  getActiveCount(): number {
    return this.limiter.activeCount
  }
}
