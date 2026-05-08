import type { ParallelConfig, BatchResult, WorkerPoolStats, ParallelExecutionOptions } from './types.js'
import { DEFAULT_PARALLEL_CONFIG } from './types.js'
import { TaskQueue } from './task-queue.js'

export class ParallelExecutor {
  private queue: TaskQueue

  constructor(config?: Partial<ParallelConfig>) {
    this.queue = new TaskQueue({ ...DEFAULT_PARALLEL_CONFIG, ...config })
  }

  async analyzeFiles(
    filePaths: string[],
    analyzeFn: (filePath: string) => Promise<unknown>,
    options?: ParallelExecutionOptions,
  ): Promise<BatchResult<unknown>> {
    if (options?.config) {
      this.queue.updateConfig(options.config)
    }

    return this.queue.executeBatch(filePaths, analyzeFn, options?.onProgress)
  }

  async processBatches(
    filePaths: string[],
    processFn: (batch: string[]) => Promise<unknown[]>,
  ): Promise<BatchResult<unknown>[]> {
    if (filePaths.length === 0) {
      return []
    }

    const stats = this.queue.getStats()
    const batchSize = this.getBatchSize()

    const batches: string[][] = []
    for (let i = 0; i < filePaths.length; i += batchSize) {
      batches.push(filePaths.slice(i, i + batchSize))
    }

    const batchResults: BatchResult<unknown>[] = []
    for (const batch of batches) {
      const batchStart = performance.now()
      const processed = await processFn(batch)
      const batchDuration = performance.now() - batchStart

      const results = batch.map((filePath, idx) => ({
        filePath,
        success: true,
        result: processed[idx],
        duration: batchDuration / batch.length,
        retries: 0,
      }))

      const durations = results.map(r => r.duration)
      batchResults.push({
        results,
        totalDuration: batchDuration,
        successCount: results.length,
        failureCount: 0,
        averageDuration: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
        minDuration: durations.length > 0 ? Math.min(...durations) : 0,
        maxDuration: durations.length > 0 ? Math.max(...durations) : 0,
        throughput: batchDuration > 0 ? (results.length / batchDuration) * 1000 : 0,
      })
    }

    void stats
    return batchResults
  }

  getQueue(): TaskQueue {
    return this.queue
  }

  getStats(): WorkerPoolStats {
    return this.queue.getStats()
  }

  private getBatchSize(): number {
    return (this.queue as unknown as { config: ParallelConfig }).config.batchSize
  }
}
