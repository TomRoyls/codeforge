import type { BatchConfig, BatchItem, BatchProgress, BatchProcessorState, BatchResult } from './types.js'
import { DEFAULT_BATCH_CONFIG } from './types.js'

export type { BatchItem, BatchResult, BatchProgress, BatchConfig, BatchProcessorState } from './types.js'
export { DEFAULT_BATCH_CONFIG } from './types.js'

function isThenable(value: unknown): value is Promise<unknown> {
  if (value === null || value === undefined) return false
  if (typeof value !== 'object') return false
  return typeof (value as Record<string, unknown>)['then'] === 'function'
}

export class BatchProcessor {
  private config: BatchConfig
  private processorState: BatchProcessorState = 'idle'
  private processorResults: BatchResult[] = []
  private processorProgress: BatchProgress
  private isCancelled = false
  private isPaused = false

  constructor(config?: Partial<BatchConfig>) {
    this.config = { ...DEFAULT_BATCH_CONFIG, ...config }
    this.processorProgress = this.makeProgress(0)
  }

  process(
    items: BatchItem[],
    handler: (item: BatchItem) => unknown | Promise<unknown>,
  ): BatchResult[] | Promise<BatchResult[]> {
    this.beginProcessing(items.length)

    if (items.length === 0) {
      this.processorState = 'completed'
      this.emitProgress()
      return []
    }

    let firstResult: unknown
    let firstError: string | undefined
    for (let attempt = 0; attempt <= this.config.retries; attempt++) {
      try {
        firstResult = handler(items[0]!)
        firstError = undefined
        break
      } catch (err) {
        firstError = err instanceof Error ? err.message : String(err)
      }
    }

    if (firstError !== undefined) {
      const result: BatchResult = { id: items[0]!.id, success: false, result: undefined, error: firstError, duration: 0 }
      this.processorResults.push(result)
      this.processorProgress.completed++
      this.processorProgress.failed++
      this.emitProgress()
      if (!this.config.continueOnError) {
        this.processorState = 'error'
        this.isCancelled = true
        return [...this.processorResults]
      }
      const remaining = items.slice(1)
      if (remaining.length > 0) {
        return this.runSyncRemaining(remaining, handler)
      }
      this.processorState = 'completed'
      return [...this.processorResults]
    }

    if (isThenable(firstResult)) {
      return this.runAsyncFromFirst(items, handler, firstResult)
    }

    const result: BatchResult = { id: items[0]!.id, success: true, result: firstResult, error: '', duration: 0 }
    this.processorResults.push(result)
    this.processorProgress.completed++
    this.emitProgress()
    const remaining = items.slice(1)
    if (remaining.length > 0) {
      return this.runSyncRemaining(remaining, handler)
    }
    this.processorState = 'completed'
    this.processorProgress.estimatedTimeRemaining = 0
    this.emitProgress()
    return [...this.processorResults]
  }

  processBatch(
    items: BatchItem[],
    handler: (item: BatchItem) => unknown | Promise<unknown>,
  ): BatchResult[] | Promise<BatchResult[]> {
    this.beginProcessing(items.length)

    if (items.length === 0) {
      this.processorState = 'completed'
      this.emitProgress()
      return []
    }

    let firstResult: unknown
    let firstError: string | undefined
    for (let attempt = 0; attempt <= this.config.retries; attempt++) {
      try {
        firstResult = handler(items[0]!)
        firstError = undefined
        break
      } catch (err) {
        firstError = err instanceof Error ? err.message : String(err)
      }
    }

    if (firstError !== undefined) {
      const result: BatchResult = { id: items[0]!.id, success: false, result: undefined, error: firstError, duration: 0 }
      this.processorResults.push(result)
      this.processorProgress.completed++
      this.processorProgress.failed++
      this.emitProgress()
      if (!this.config.continueOnError) {
        this.processorState = 'error'
        this.isCancelled = true
        return [...this.processorResults]
      }
      const remaining = items.slice(1)
      if (remaining.length > 0) {
        return this.runSyncBatchRemaining(remaining, handler)
      }
      this.processorState = 'completed'
      return [...this.processorResults]
    }

    if (isThenable(firstResult)) {
      return this.runAsyncBatchFromFirst(items, handler, firstResult)
    }

    const result: BatchResult = { id: items[0]!.id, success: true, result: firstResult, error: '', duration: 0 }
    this.processorResults.push(result)
    this.processorProgress.completed++
    this.emitProgress()
    const remaining = items.slice(1)
    if (remaining.length > 0) {
      return this.runSyncBatchRemaining(remaining, handler)
    }
    this.processorState = 'completed'
    this.processorProgress.estimatedTimeRemaining = 0
    this.emitProgress()
    return [...this.processorResults]
  }

  pause(): void {
    if (this.processorState === 'running') {
      this.processorState = 'paused'
      this.isPaused = true
    }
  }

  resume(): void {
    if (this.processorState === 'paused') {
      this.processorState = 'running'
      this.isPaused = false
    }
  }

  cancel(): void {
    this.isCancelled = true
    if (this.processorState === 'running' || this.processorState === 'paused') {
      this.processorState = 'error'
    }
  }

  getState(): BatchProcessorState {
    return this.processorState
  }

  getProgress(): BatchProgress {
    return { ...this.processorProgress }
  }

  getResults(): BatchResult[] {
    return [...this.processorResults]
  }

  getSuccessfulResults(): BatchResult[] {
    return this.processorResults.filter((r) => r.success)
  }

  getFailedResults(): BatchResult[] {
    return this.processorResults.filter((r) => !r.success)
  }

  getConfig(): BatchConfig {
    return { ...this.config }
  }

  reset(): void {
    this.processorState = 'idle'
    this.processorResults = []
    this.processorProgress = this.makeProgress(0)
    this.isCancelled = false
    this.isPaused = false
  }

  getStatistics(): {
    total: number
    succeeded: number
    failed: number
    averageDuration: number
    totalDuration: number
  } {
    const total = this.processorResults.length
    const succeeded = this.processorResults.filter((r) => r.success).length
    const failed = this.processorResults.filter((r) => !r.success).length
    const totalDuration = this.processorResults.reduce((sum, r) => sum + r.duration, 0)
    const averageDuration = total > 0 ? totalDuration / total : 0
    return { total, succeeded, failed, averageDuration, totalDuration }
  }

  private beginProcessing(total: number): void {
    this.processorState = 'running'
    this.processorResults = []
    this.processorProgress = this.makeProgress(total)
    this.isCancelled = false
    this.isPaused = false
  }

  private makeProgress(total: number): BatchProgress {
    return {
      total,
      completed: 0,
      failed: 0,
      inFlight: 0,
      startTime: Date.now(),
      estimatedTimeRemaining: 0,
    }
  }

  private splitBatches(items: BatchItem[]): BatchItem[][] {
    const batches: BatchItem[][] = []
    for (let i = 0; i < items.length; i += this.config.batchSize) {
      batches.push(items.slice(i, i + this.config.batchSize))
    }
    return batches
  }

  private runSyncRemaining(
    items: BatchItem[],
    handler: (item: BatchItem) => unknown | Promise<unknown>,
  ): BatchResult[] {
    const batches = this.splitBatches(items)
    for (const batch of batches) {
      for (const item of batch) {
        if (this.isCancelled) break
        const outcome = this.processSyncItem(item, handler)
        this.processorResults.push(outcome)
        this.processorProgress.completed++
        if (!outcome.success) this.processorProgress.failed++
        this.emitProgress()
        if (!outcome.success && !this.config.continueOnError) {
          this.processorState = 'error'
          this.isCancelled = true
          return [...this.processorResults]
        }
      }
    }
    this.processorState = this.isCancelled ? 'error' : 'completed'
    this.processorProgress.estimatedTimeRemaining = 0
    this.emitProgress()
    return [...this.processorResults]
  }

  private runSyncBatchRemaining(
    items: BatchItem[],
    handler: (item: BatchItem) => unknown | Promise<unknown>,
  ): BatchResult[] {
    for (const item of items) {
      if (this.isCancelled) break
      const outcome = this.processSyncItem(item, handler)
      this.processorResults.push(outcome)
      this.processorProgress.completed++
      if (!outcome.success) this.processorProgress.failed++
      this.emitProgress()
      if (!outcome.success && !this.config.continueOnError) {
        this.processorState = 'error'
        this.isCancelled = true
        return [...this.processorResults]
      }
    }
    this.processorState = this.isCancelled ? 'error' : 'completed'
    this.processorProgress.estimatedTimeRemaining = 0
    this.emitProgress()
    return [...this.processorResults]
  }

  private async runAsyncFromFirst(
    items: BatchItem[],
    handler: (item: BatchItem) => unknown | Promise<unknown>,
    firstPromise: Promise<unknown>,
  ): Promise<BatchResult[]> {
    const firstItem = items[0]!
    const firstResult = await this.resolveWithRetry(firstItem, firstPromise, handler)
    this.processorResults.push(firstResult)
    this.processorProgress.completed++
    if (!firstResult.success) this.processorProgress.failed++
    this.emitProgress()
    if (!firstResult.success && !this.config.continueOnError) {
      this.processorState = 'error'
      return [...this.processorResults]
    }

    const remaining = items.slice(1)
    if (remaining.length === 0) {
      this.finalizeAsync()
      return [...this.processorResults]
    }

    const batches = this.splitBatches(remaining)
    for (const batch of batches) {
      if (this.isCancelled) break
      await this.waitForResume()
      if (this.isCancelled) break
      const batchResults = await this.processChunkAsync(batch, handler)
      this.processorResults.push(...batchResults)
    }
    this.finalizeAsync()
    return [...this.processorResults]
  }

  private async runAsyncBatchFromFirst(
    items: BatchItem[],
    handler: (item: BatchItem) => unknown | Promise<unknown>,
    firstPromise: Promise<unknown>,
  ): Promise<BatchResult[]> {
    const firstItem = items[0]!
    const firstResult = await this.resolveWithRetry(firstItem, firstPromise, handler)
    this.processorResults.push(firstResult)
    this.processorProgress.completed++
    if (!firstResult.success) this.processorProgress.failed++
    this.emitProgress()
    if (!firstResult.success && !this.config.continueOnError) {
      this.processorState = 'error'
      return [...this.processorResults]
    }

    const remaining = items.slice(1)
    if (remaining.length === 0) {
      this.finalizeAsync()
      return [...this.processorResults]
    }

    const results = await this.processChunkAsync(remaining, handler)
    this.processorResults.push(...results)
    this.finalizeAsync()
    return [...this.processorResults]
  }

  private async resolveWithRetry(
    item: BatchItem,
    initialPromise: Promise<unknown>,
    handler: (item: BatchItem) => unknown | Promise<unknown>,
  ): Promise<BatchResult> {
    const start = Date.now()
    let lastError = ''
    let success = false
    let value: unknown = undefined

    for (let attempt = 0; attempt <= this.config.retries; attempt++) {
      try {
        if (attempt === 0) {
          value = await this.withResolvedPromise(initialPromise)
        } else {
          value = await this.withTimeout(handler, item)
        }
        success = true
        lastError = ''
        break
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err)
        success = false
        if (attempt < this.config.retries) {
          await new Promise<void>((r) => setTimeout(r, this.config.retryDelay))
        }
      }
    }
    const duration = Date.now() - start
    this.processorProgress.completed++
    if (!success) this.processorProgress.failed++
    this.computeEta()
    this.emitProgress()
    return {
      id: item.id,
      success,
      result: success ? value : undefined,
      error: lastError,
      duration,
    }
  }

  private withResolvedPromise(promise: Promise<unknown>): Promise<unknown> {
    return new Promise<unknown>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error('Batch item timeout')),
        this.config.timeout,
      )
      promise
        .then((val) => {
          clearTimeout(timer)
          resolve(val)
        })
        .catch((err: unknown) => {
          clearTimeout(timer)
          reject(err)
        })
    })
  }

  private processSyncItem(
    item: BatchItem,
    handler: (item: BatchItem) => unknown | Promise<unknown>,
  ): BatchResult {
    const start = Date.now()
    let lastError = ''
    for (let attempt = 0; attempt <= this.config.retries; attempt++) {
      try {
        const value = handler(item)
        return { id: item.id, success: true, result: value, error: '', duration: Date.now() - start }
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err)
      }
    }
    return { id: item.id, success: false, result: undefined, error: lastError, duration: Date.now() - start }
  }

  private async processChunkAsync(
    batch: BatchItem[],
    handler: (item: BatchItem) => unknown | Promise<unknown>,
  ): Promise<BatchResult[]> {
    const results: BatchResult[] = []
    for (let i = 0; i < batch.length; i += this.config.concurrency) {
      if (this.isCancelled) break
      await this.waitForResume()
      if (this.isCancelled) break
      const chunk = batch.slice(i, i + this.config.concurrency)
      this.processorProgress.inFlight = chunk.length
      const promises = chunk.map((item) => this.processItemAsync(item, handler))
      const chunkResults = await Promise.all(promises)
      results.push(...chunkResults)
      if (!this.config.continueOnError && chunkResults.some((r) => !r.success)) {
        this.isCancelled = true
        this.processorState = 'error'
      }
    }
    this.processorProgress.inFlight = 0
    return results
  }

  private async processItemAsync(
    item: BatchItem,
    handler: (item: BatchItem) => unknown | Promise<unknown>,
  ): Promise<BatchResult> {
    const start = Date.now()
    let lastError = ''
    let value: unknown = undefined
    let success = false
    for (let attempt = 0; attempt <= this.config.retries; attempt++) {
      try {
        value = await this.withTimeout(handler, item)
        success = true
        lastError = ''
        break
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err)
        success = false
        if (attempt < this.config.retries) {
          await new Promise<void>((r) => setTimeout(r, this.config.retryDelay))
        }
      }
    }
    const duration = Date.now() - start
    this.processorProgress.completed++
    if (!success) this.processorProgress.failed++
    this.processorProgress.inFlight = Math.max(0, this.processorProgress.inFlight - 1)
    this.computeEta()
    this.emitProgress()
    return {
      id: item.id,
      success,
      result: success ? value : undefined,
      error: lastError,
      duration,
    }
  }

  private async withTimeout(
    handler: (item: BatchItem) => unknown | Promise<unknown>,
    item: BatchItem,
  ): Promise<unknown> {
    return new Promise<unknown>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error('Batch item timeout')),
        this.config.timeout,
      )
      Promise.resolve(handler(item))
        .then((val) => {
          clearTimeout(timer)
          resolve(val)
        })
        .catch((err: unknown) => {
          clearTimeout(timer)
          reject(err)
        })
    })
  }

  private async waitForResume(): Promise<void> {
    while (this.isPaused && !this.isCancelled) {
      await new Promise<void>((r) => setTimeout(r, 10))
    }
  }

  private computeEta(): void {
    const elapsed = Date.now() - this.processorProgress.startTime
    if (elapsed > 0) {
      const rate = this.processorProgress.completed / elapsed
      this.processorProgress.estimatedTimeRemaining =
        rate > 0 ? (this.processorProgress.total - this.processorProgress.completed) / rate : 0
    }
  }

  private emitProgress(): void {
    if (this.config.onProgress) {
      this.config.onProgress({ ...this.processorProgress })
    }
  }

  private finalizeAsync(): void {
    if (this.processorState === 'running' || this.processorState === 'paused') {
      this.processorState = this.isCancelled ? 'error' : 'completed'
    }
    this.processorProgress.estimatedTimeRemaining = 0
    this.emitProgress()
  }
}
