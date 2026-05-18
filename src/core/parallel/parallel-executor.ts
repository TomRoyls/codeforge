import type { ParallelConfig, BatchResult, WorkerPoolStats, ParallelExecutionOptions } from './types.js'
import { DEFAULT_PARALLEL_CONFIG } from './types.js'
import { TaskQueue } from './task-queue.js'
import { chunk } from '../../utils/array-helpers.js'

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

    const batches = chunk(filePaths, batchSize)

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

      let avgDur = 0
      let minDur = 0
      let maxDur = 0
      if (results.length > 0) {
        let durSum = results[0]!.duration
        minDur = durSum
        maxDur = durSum
        for (let i = 1; i < results.length; i++) {
          const d = results[i]!.duration
          durSum += d
          if (d < minDur) minDur = d
          if (d > maxDur) maxDur = d
        }
        avgDur = durSum / results.length
      }
      batchResults.push({
        results,
        totalDuration: batchDuration,
        successCount: results.length,
        failureCount: 0,
        averageDuration: avgDur,
        minDuration: minDur,
        maxDuration: maxDur,
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
