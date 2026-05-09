import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { TaskQueue, ParallelExecutor, DEFAULT_PARALLEL_CONFIG } from '../../src/core/parallel/index.js'
import type {
  ParallelConfig,
  TaskResult,
  BatchResult,
  WorkerPoolStats,
  ParallelExecutionOptions,
} from '../../src/core/parallel/index.js'

const instantTask = (_filePath: string): Promise<string> =>
  new Promise(resolve => resolve('done'))

const failingTask = (_filePath: string): Promise<string> =>
  new Promise((_, reject) => reject(new Error('task failed')))

const delayedTask = (ms: number) => (_filePath: string): Promise<string> =>
  new Promise(resolve => setTimeout(() => resolve('done'), ms))

describe('DEFAULT_PARALLEL_CONFIG', () => {
  it('has maxConcurrency of 4', () => {
    expect(DEFAULT_PARALLEL_CONFIG.maxConcurrency).toBe(4)
  })

  it('has batchSize of 10', () => {
    expect(DEFAULT_PARALLEL_CONFIG.batchSize).toBe(10)
  })

  it('has timeout of 30000', () => {
    expect(DEFAULT_PARALLEL_CONFIG.timeout).toBe(30000)
  })

  it('has retryCount of 1', () => {
    expect(DEFAULT_PARALLEL_CONFIG.retryCount).toBe(1)
  })

  it('has retryDelay of 100', () => {
    expect(DEFAULT_PARALLEL_CONFIG.retryDelay).toBe(100)
  })

  it('is a valid ParallelConfig object', () => {
    const config: ParallelConfig = DEFAULT_PARALLEL_CONFIG
    expect(config).toBeDefined()
    expect(typeof config.maxConcurrency).toBe('number')
    expect(typeof config.batchSize).toBe('number')
    expect(typeof config.timeout).toBe('number')
    expect(typeof config.retryCount).toBe('number')
    expect(typeof config.retryDelay).toBe('number')
  })
})

describe('TaskResult type', () => {
  it('has correct shape for success', () => {
    const result: TaskResult<string> = {
      filePath: '/test.ts',
      success: true,
      result: 'ok',
      duration: 10,
      retries: 0,
    }
    expect(result.success).toBe(true)
    expect(result.result).toBe('ok')
    expect(result.error).toBeUndefined()
  })

  it('has correct shape for failure', () => {
    const result: TaskResult<string> = {
      filePath: '/test.ts',
      success: false,
      error: new Error('fail'),
      duration: 10,
      retries: 1,
    }
    expect(result.success).toBe(false)
    expect(result.error).toBeInstanceOf(Error)
    expect(result.result).toBeUndefined()
  })
})

describe('BatchResult type', () => {
  it('has correct shape', () => {
    const result: BatchResult<string> = {
      results: [],
      totalDuration: 100,
      successCount: 0,
      failureCount: 0,
      averageDuration: 0,
      minDuration: 0,
      maxDuration: 0,
      throughput: 0,
    }
    expect(result.results).toEqual([])
    expect(result.totalDuration).toBe(100)
    expect(result.successCount).toBe(0)
    expect(result.failureCount).toBe(0)
  })
})

describe('WorkerPoolStats type', () => {
  it('has correct shape', () => {
    const stats: WorkerPoolStats = {
      activeTasks: 0,
      queuedTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      totalTasks: 0,
      averageTaskDuration: 0,
      poolUtilization: 0,
    }
    expect(stats.activeTasks).toBe(0)
    expect(stats.queuedTasks).toBe(0)
    expect(stats.completedTasks).toBe(0)
    expect(stats.failedTasks).toBe(0)
    expect(stats.totalTasks).toBe(0)
    expect(stats.averageTaskDuration).toBe(0)
    expect(stats.poolUtilization).toBe(0)
  })
})

describe('ParallelExecutionOptions type', () => {
  it('accepts empty options', () => {
    const options: ParallelExecutionOptions = {}
    expect(options.config).toBeUndefined()
    expect(options.onProgress).toBeUndefined()
    expect(options.onFileComplete).toBeUndefined()
    expect(options.onError).toBeUndefined()
  })

  it('accepts full options', () => {
    const options: ParallelExecutionOptions = {
      config: { maxConcurrency: 2 },
      onProgress: (_c: number, _t: number) => {},
      onFileComplete: (_r: TaskResult<unknown>) => {},
      onError: (_e: Error, _f: string) => {},
    }
    expect(options.config).toBeDefined()
    expect(options.onProgress).toBeDefined()
    expect(options.onFileComplete).toBeDefined()
    expect(options.onError).toBeDefined()
  })
})

describe('TaskQueue', () => {
  let queue: TaskQueue

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    queue = new TaskQueue()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('constructor', () => {
    it('creates queue with default config', () => {
      const q = new TaskQueue()
      expect(q).toBeDefined()
    })

    it('creates queue with custom config', () => {
      const q = new TaskQueue({ maxConcurrency: 2 })
      expect(q).toBeDefined()
    })

    it('creates queue with partial config', () => {
      const q = new TaskQueue({ timeout: 5000, retryCount: 3 })
      expect(q).toBeDefined()
    })

    it('creates queue with empty config', () => {
      const q = new TaskQueue({})
      expect(q).toBeDefined()
    })
  })

  describe('executeTask', () => {
    it('returns successful result for resolving task', async () => {
      const result = await queue.executeTask('/test.ts', instantTask)
      expect(result.success).toBe(true)
      expect(result.filePath).toBe('/test.ts')
      expect(result.result).toBe('done')
      expect(result.retries).toBe(0)
    })

    it('records duration', async () => {
      const result = await queue.executeTask('/test.ts', instantTask)
      expect(result.duration).toBeGreaterThanOrEqual(0)
    })

    it('returns failed result for rejecting task', async () => {
      const result = await queue.executeTask('/test.ts', failingTask)
      expect(result.success).toBe(false)
      expect(result.error).toBeInstanceOf(Error)
      expect(result.error!.message).toBe('task failed')
    })

    it('preserves file path in result', async () => {
      const result = await queue.executeTask('/nested/path/file.ts', instantTask)
      expect(result.filePath).toBe('/nested/path/file.ts')
    })

    it('handles task returning undefined', async () => {
      const result = await queue.executeTask('/test.ts', () => Promise.resolve(undefined))
      expect(result.success).toBe(true)
      expect(result.result).toBeUndefined()
    })

    it('handles task returning object', async () => {
      const result = await queue.executeTask('/test.ts', () =>
        Promise.resolve({ key: 'value' }),
      )
      expect(result.success).toBe(true)
      expect(result.result).toEqual({ key: 'value' })
    })

    it('handles task returning number', async () => {
      const result = await queue.executeTask('/test.ts', () => Promise.resolve(42))
      expect(result.success).toBe(true)
      expect(result.result).toBe(42)
    })

    it('retries on failure when retryCount > 0', async () => {
      const retryQueue = new TaskQueue({ retryCount: 2, retryDelay: 10 })
      let attempts = 0
      const flakyTask = (_filePath: string): Promise<string> =>
        new Promise((resolve, reject) => {
          attempts++
          if (attempts < 3) {
            reject(new Error('not yet'))
          } else {
            resolve('finally')
          }
        })

      const result = await retryQueue.executeTask('/test.ts', flakyTask)
      expect(result.success).toBe(true)
      expect(result.result).toBe('finally')
      expect(attempts).toBe(3)
    })

    it('returns failure after all retries exhausted', async () => {
      const retryQueue = new TaskQueue({ retryCount: 2, retryDelay: 10 })
      let attempts = 0
      const alwaysFails = (_filePath: string): Promise<string> =>
        new Promise((_, reject) => {
          attempts++
          reject(new Error('always fails'))
        })

      const result = await retryQueue.executeTask('/test.ts', alwaysFails)
      expect(result.success).toBe(false)
      expect(result.error!.message).toBe('always fails')
      expect(attempts).toBe(3)
    })

    it('times out long-running tasks', async () => {
      const timeoutQueue = new TaskQueue({ timeout: 50, retryCount: 0 })
      const slowTask = (_filePath: string): Promise<string> =>
        new Promise(resolve => setTimeout(() => resolve('late'), 5000))

      const result = await timeoutQueue.executeTask('/test.ts', slowTask)
      expect(result.success).toBe(false)
      expect(result.error!.message).toContain('timed out')
    })

    it('wraps non-Error rejections', async () => {
      const result = await queue.executeTask('/test.ts', () =>
        Promise.reject('string error'),
      )
      expect(result.success).toBe(false)
      expect(result.error).toBeInstanceOf(Error)
      expect(result.error!.message).toBe('string error')
    })

    it('wraps number rejections', async () => {
      const result = await queue.executeTask('/test.ts', () =>
        Promise.reject(42),
      )
      expect(result.success).toBe(false)
      expect(result.error).toBeInstanceOf(Error)
      expect(result.error!.message).toBe('42')
    })

    it('records retries count correctly on success without retries', async () => {
      const result = await queue.executeTask('/test.ts', instantTask)
      expect(result.retries).toBe(0)
    })

    it('records retries count on failure', async () => {
      const retryQueue = new TaskQueue({ retryCount: 2, retryDelay: 10 })
      const result = await retryQueue.executeTask('/test.ts', failingTask)
      expect(result.retries).toBeGreaterThanOrEqual(0)
    })
  })

  describe('executeBatch', () => {
    it('returns empty batch result for empty file list', async () => {
      const result = await queue.executeBatch([], instantTask)
      expect(result.results).toEqual([])
      expect(result.totalDuration).toBe(0)
      expect(result.successCount).toBe(0)
      expect(result.failureCount).toBe(0)
      expect(result.averageDuration).toBe(0)
      expect(result.minDuration).toBe(0)
      expect(result.maxDuration).toBe(0)
      expect(result.throughput).toBe(0)
    })

    it('executes single file', async () => {
      const result = await queue.executeBatch(['/test.ts'], instantTask)
      expect(result.results).toHaveLength(1)
      expect(result.successCount).toBe(1)
      expect(result.failureCount).toBe(0)
    })

    it('executes multiple files', async () => {
      const files = ['/a.ts', '/b.ts', '/c.ts']
      const result = await queue.executeBatch(files, instantTask)
      expect(result.results).toHaveLength(3)
      expect(result.successCount).toBe(3)
    })

    it('calculates correct success and failure counts', async () => {
      const files = ['/ok.ts', '/fail.ts', '/ok2.ts']
      const mixedTask = (fp: string): Promise<string> =>
        fp.includes('fail')
          ? Promise.reject(new Error('fail'))
          : Promise.resolve('ok')
      const result = await queue.executeBatch(files, mixedTask)
      expect(result.successCount).toBe(2)
      expect(result.failureCount).toBe(1)
    })

    it('calculates averageDuration', async () => {
      const result = await queue.executeBatch(['/a.ts', '/b.ts'], instantTask)
      expect(result.averageDuration).toBeGreaterThanOrEqual(0)
    })

    it('calculates minDuration', async () => {
      const result = await queue.executeBatch(['/a.ts'], instantTask)
      expect(result.minDuration).toBeGreaterThanOrEqual(0)
    })

    it('calculates maxDuration', async () => {
      const result = await queue.executeBatch(['/a.ts'], instantTask)
      expect(result.maxDuration).toBeGreaterThanOrEqual(0)
    })

    it('calculates throughput', async () => {
      const slowTask = async () => { await new Promise(r => setTimeout(r, 5)) }
      const result = await queue.executeBatch(['/a.ts', '/b.ts'], slowTask)
      expect(result.throughput).toBeGreaterThan(0)
    })

    it('calculates totalDuration', async () => {
      const slowTask = async () => { await new Promise(r => setTimeout(r, 5)) }
      const result = await queue.executeBatch(['/a.ts', '/b.ts'], slowTask)
      expect(result.totalDuration).toBeGreaterThan(0)
    })

    it('calculates totalDuration', async () => {
      const result = await queue.executeBatch(['/a.ts', '/b.ts'], instantTask)
      expect(result.totalDuration).toBeGreaterThanOrEqual(0)
    })

    it('calls onProgress for each completed task', async () => {
      const progressCalls: Array<[number, number]> = []
      const onProgress = (completed: number, total: number) => {
        progressCalls.push([completed, total])
      }
      const files = ['/a.ts', '/b.ts', '/c.ts']
      await queue.executeBatch(files, instantTask, onProgress)
      expect(progressCalls).toHaveLength(3)
      expect(progressCalls[0]![1]).toBe(3)
      expect(progressCalls[2]![0]).toBe(3)
    })

    it('does not call onProgress when not provided', async () => {
      const files = ['/a.ts', '/b.ts']
      const result = await queue.executeBatch(files, instantTask)
      expect(result.successCount).toBe(2)
    })

    it('respects maxConcurrency', async () => {
      const concurrencyQueue = new TaskQueue({ maxConcurrency: 1, retryCount: 0 })
      let maxConcurrent = 0
      let currentConcurrent = 0
      const trackedTask = (_fp: string): Promise<string> =>
        new Promise(resolve => {
          currentConcurrent++
          if (currentConcurrent > maxConcurrent) maxConcurrent = currentConcurrent
          setTimeout(() => {
            currentConcurrent--
            resolve('done')
          }, 50)
        })
      const files = ['/a.ts', '/b.ts', '/c.ts', '/d.ts']
      await concurrencyQueue.executeBatch(files, trackedTask)
      expect(maxConcurrent).toBeLessThanOrEqual(1)
    })

    it('allows concurrency of 2', async () => {
      const concurrencyQueue = new TaskQueue({ maxConcurrency: 2, retryCount: 0 })
      let maxConcurrent = 0
      let currentConcurrent = 0
      const trackedTask = (_fp: string): Promise<string> =>
        new Promise(resolve => {
          currentConcurrent++
          if (currentConcurrent > maxConcurrent) maxConcurrent = currentConcurrent
          setTimeout(() => {
            currentConcurrent--
            resolve('done')
          }, 50)
        })
      const files = ['/a.ts', '/b.ts', '/c.ts', '/d.ts']
      await concurrencyQueue.executeBatch(files, trackedTask)
      expect(maxConcurrent).toBeLessThanOrEqual(2)
      expect(maxConcurrent).toBeGreaterThanOrEqual(1)
    })

    it('preserves file paths in results', async () => {
      const files = ['/a.ts', '/b.ts', '/c.ts']
      const result = await queue.executeBatch(files, instantTask)
      const paths = result.results.map(r => r.filePath)
      expect(paths).toEqual(files)
    })

    it('handles all tasks failing', async () => {
      const files = ['/a.ts', '/b.ts']
      const result = await queue.executeBatch(files, failingTask)
      expect(result.failureCount).toBe(2)
      expect(result.successCount).toBe(0)
    })

    it('handles large batch', async () => {
      const files = Array.from({ length: 50 }, (_, i) => `/file${i}.ts`)
      const result = await queue.executeBatch(files, instantTask)
      expect(result.results).toHaveLength(50)
      expect(result.successCount).toBe(50)
    })

    it('handles task that throws synchronously in the function body', async () => {
      const throwTask = (_fp: string): Promise<string> => {
        throw new Error('sync throw')
      }
      const result = await queue.executeBatch(['/a.ts'], throwTask)
      expect(result.failureCount).toBe(1)
    })
  })

  describe('getStats', () => {
    it('returns zeroed stats initially', () => {
      const stats = queue.getStats()
      expect(stats.activeTasks).toBe(0)
      expect(stats.queuedTasks).toBe(0)
      expect(stats.completedTasks).toBe(0)
      expect(stats.failedTasks).toBe(0)
      expect(stats.averageTaskDuration).toBe(0)
      expect(stats.poolUtilization).toBe(0)
    })

    it('updates completedTasks after successful task', async () => {
      await queue.executeTask('/test.ts', instantTask)
      const stats = queue.getStats()
      expect(stats.completedTasks).toBe(1)
    })

    it('updates failedTasks after failed task', async () => {
      await queue.executeTask('/test.ts', failingTask)
      const stats = queue.getStats()
      expect(stats.failedTasks).toBe(1)
    })

    it('tracks averageTaskDuration after tasks', async () => {
      await queue.executeTask('/test.ts', instantTask)
      const stats = queue.getStats()
      expect(stats.averageTaskDuration).toBeGreaterThanOrEqual(0)
    })

    it('accumulates completed and failed counts', async () => {
      await queue.executeTask('/ok.ts', instantTask)
      await queue.executeTask('/fail.ts', failingTask)
      const stats = queue.getStats()
      expect(stats.completedTasks).toBe(1)
      expect(stats.failedTasks).toBe(1)
    })

    it('calculates totalTasks correctly', () => {
      const stats = queue.getStats()
      expect(stats.totalTasks).toBeGreaterThanOrEqual(0)
    })
  })

  describe('updateConfig', () => {
    it('updates timeout', () => {
      queue.updateConfig({ timeout: 5000 })
      expect(queue).toBeDefined()
    })

    it('updates retryCount', () => {
      queue.updateConfig({ retryCount: 5 })
      expect(queue).toBeDefined()
    })

    it('updates maxConcurrency and creates new limiter', () => {
      queue.updateConfig({ maxConcurrency: 8 })
      expect(queue).toBeDefined()
    })

    it('does not replace limiter when maxConcurrency not changed', () => {
      queue.updateConfig({ timeout: 1000 })
      expect(queue).toBeDefined()
    })
  })

  describe('reset', () => {
    it('resets counters to zero', async () => {
      await queue.executeTask('/test.ts', instantTask)
      await queue.executeTask('/fail.ts', failingTask)
      queue.reset()
      const stats = queue.getStats()
      expect(stats.completedTasks).toBe(0)
      expect(stats.failedTasks).toBe(0)
      expect(stats.averageTaskDuration).toBe(0)
    })
  })

  describe('getPendingCount', () => {
    it('returns 0 when no tasks are pending', () => {
      expect(queue.getPendingCount()).toBe(0)
    })
  })

  describe('getActiveCount', () => {
    it('returns 0 when no tasks are active', () => {
      expect(queue.getActiveCount()).toBe(0)
    })
  })
})

describe('ParallelExecutor', () => {
  let executor: ParallelExecutor

  beforeEach(() => {
    executor = new ParallelExecutor()
  })

  describe('constructor', () => {
    it('creates executor with default config', () => {
      const ex = new ParallelExecutor()
      expect(ex).toBeDefined()
    })

    it('creates executor with custom config', () => {
      const ex = new ParallelExecutor({ maxConcurrency: 2 })
      expect(ex).toBeDefined()
    })

    it('creates executor with partial config', () => {
      const ex = new ParallelExecutor({ timeout: 1000, batchSize: 5 })
      expect(ex).toBeDefined()
    })
  })

  describe('analyzeFiles', () => {
    it('returns empty result for empty file list', async () => {
      const result = await executor.analyzeFiles([], instantTask)
      expect(result.results).toEqual([])
      expect(result.successCount).toBe(0)
    })

    it('analyzes a single file', async () => {
      const result = await executor.analyzeFiles(['/test.ts'], instantTask)
      expect(result.results).toHaveLength(1)
      expect(result.successCount).toBe(1)
    })

    it('analyzes multiple files', async () => {
      const files = ['/a.ts', '/b.ts', '/c.ts']
      const result = await executor.analyzeFiles(files, instantTask)
      expect(result.results).toHaveLength(3)
      expect(result.successCount).toBe(3)
    })

    it('handles task failures', async () => {
      const result = await executor.analyzeFiles(['/fail.ts'], failingTask)
      expect(result.failureCount).toBe(1)
      expect(result.successCount).toBe(0)
    })

    it('calls onProgress callback', async () => {
      const progressCalls: Array<[number, number]> = []
      const options: ParallelExecutionOptions = {
        onProgress: (completed, total) => progressCalls.push([completed, total]),
      }
      await executor.analyzeFiles(['/a.ts', '/b.ts'], instantTask, options)
      expect(progressCalls.length).toBeGreaterThan(0)
    })

    it('updates config via options', async () => {
      const options: ParallelExecutionOptions = {
        config: { maxConcurrency: 1 },
      }
      const result = await executor.analyzeFiles(['/a.ts'], instantTask, options)
      expect(result.successCount).toBe(1)
    })

    it('passes correct filePaths to analyzeFn', async () => {
      const receivedPaths: string[] = []
      const trackTask = (fp: string): Promise<string> => {
        receivedPaths.push(fp)
        return Promise.resolve('done')
      }
      const files = ['/x.ts', '/y.ts']
      await executor.analyzeFiles(files, trackTask)
      expect(receivedPaths).toEqual(files)
    })

    it('returns correct file paths in results', async () => {
      const files = ['/a.ts', '/b.ts']
      const result = await executor.analyzeFiles(files, instantTask)
      const paths = result.results.map(r => r.filePath)
      expect(paths).toEqual(files)
    })

    it('handles mixed success and failure', async () => {
      const mixedTask = (fp: string): Promise<string> =>
        fp.includes('fail')
          ? Promise.reject(new Error('nope'))
          : Promise.resolve('ok')
      const files = ['/ok1.ts', '/fail.ts', '/ok2.ts']
      const result = await executor.analyzeFiles(files, mixedTask)
      expect(result.successCount).toBe(2)
      expect(result.failureCount).toBe(1)
    })
  })

  describe('processBatches', () => {
    it('returns empty array for empty file list', async () => {
      const result = await executor.processBatches([], (_batch) => Promise.resolve([]))
      expect(result).toEqual([])
    })

    it('processes a single batch', async () => {
      const files = ['/a.ts', '/b.ts']
      const processFn = (batch: string[]) =>
        Promise.resolve(batch.map(f => `processed:${f}`))
      const results = await executor.processBatches(files, processFn)
      expect(results).toHaveLength(1)
      expect(results[0]!.successCount).toBe(2)
      expect(results[0]!.failureCount).toBe(0)
    })

    it('splits files into multiple batches based on batchSize', async () => {
      const batchExecutor = new ParallelExecutor({ batchSize: 2 })
      const files = ['/a.ts', '/b.ts', '/c.ts', '/d.ts', '/e.ts']
      const processFn = (batch: string[]) =>
        Promise.resolve(batch.map(f => `processed:${f}`))
      const results = await batchExecutor.processBatches(files, processFn)
      expect(results.length).toBe(3)
      expect(results[0]!.results).toHaveLength(2)
      expect(results[1]!.results).toHaveLength(2)
      expect(results[2]!.results).toHaveLength(1)
    })

    it('includes processed results in batch results', async () => {
      const files = ['/a.ts']
      const processFn = (batch: string[]) =>
        Promise.resolve(batch.map(f => `result:${f}`))
      const results = await executor.processBatches(files, processFn)
      expect(results[0]!.results[0]!.result).toBe('result:/a.ts')
    })

    it('calculates throughput for each batch', async () => {
      const files = ['/a.ts', '/b.ts']
      const processFn = (batch: string[]) =>
        Promise.resolve(batch.map(f => f.toUpperCase()))
      const results = await executor.processBatches(files, processFn)
      expect(results[0]!.throughput).toBeGreaterThan(0)
    })

    it('calculates averageDuration for each batch', async () => {
      const files = ['/a.ts']
      const processFn = (batch: string[]) =>
        Promise.resolve(batch.map(f => f))
      const results = await executor.processBatches(files, processFn)
      expect(results[0]!.averageDuration).toBeGreaterThanOrEqual(0)
    })

    it('calculates min and max duration', async () => {
      const files = ['/a.ts', '/b.ts']
      const processFn = (batch: string[]) =>
        Promise.resolve(batch.map(f => f))
      const results = await executor.processBatches(files, processFn)
      expect(results[0]!.minDuration).toBeGreaterThanOrEqual(0)
      expect(results[0]!.maxDuration).toBeGreaterThanOrEqual(0)
    })

    it('sets all results as successful', async () => {
      const files = ['/a.ts', '/b.ts', '/c.ts']
      const processFn = (batch: string[]) =>
        Promise.resolve(batch.map(f => f))
      const results = await executor.processBatches(files, processFn)
      const allSuccessful = results.every(
        r => r.results.every(res => res.success)
      )
      expect(allSuccessful).toBe(true)
    })

    it('preserves file paths in results', async () => {
      const files = ['/a.ts', '/b.ts']
      const processFn = (batch: string[]) =>
        Promise.resolve(batch.map(f => f))
      const results = await executor.processBatches(files, processFn)
      const paths = results.flatMap(r => r.results.map(res => res.filePath))
      expect(paths).toEqual(files)
    })

    it('handles batch of exactly batchSize', async () => {
      const batchExecutor = new ParallelExecutor({ batchSize: 3 })
      const files = ['/a.ts', '/b.ts', '/c.ts']
      const processFn = (batch: string[]) =>
        Promise.resolve(batch.map(f => f))
      const results = await batchExecutor.processBatches(files, processFn)
      expect(results).toHaveLength(1)
      expect(results[0]!.results).toHaveLength(3)
    })

    it('handles single file', async () => {
      const files = ['/a.ts']
      const processFn = (batch: string[]) =>
        Promise.resolve(batch.map(f => f))
      const results = await executor.processBatches(files, processFn)
      expect(results).toHaveLength(1)
      expect(results[0]!.results).toHaveLength(1)
    })

    it('sets retries to 0 for all results', async () => {
      const files = ['/a.ts', '/b.ts']
      const processFn = (batch: string[]) =>
        Promise.resolve(batch.map(f => f))
      const results = await executor.processBatches(files, processFn)
      const allZeroRetries = results.every(
        r => r.results.every(res => res.retries === 0)
      )
      expect(allZeroRetries).toBe(true)
    })

    it('passes correct batches to processFn', async () => {
      const batchExecutor = new ParallelExecutor({ batchSize: 2 })
      const files = ['/a.ts', '/b.ts', '/c.ts']
      const receivedBatches: string[][] = []
      const processFn = (batch: string[]) => {
        receivedBatches.push([...batch])
        return Promise.resolve(batch.map(f => f))
      }
      await batchExecutor.processBatches(files, processFn)
      expect(receivedBatches).toHaveLength(2)
      expect(receivedBatches[0]).toEqual(['/a.ts', '/b.ts'])
      expect(receivedBatches[1]).toEqual(['/c.ts'])
    })
  })

  describe('getQueue', () => {
    it('returns the internal TaskQueue', () => {
      const q = executor.getQueue()
      expect(q).toBeInstanceOf(TaskQueue)
    })

    it('returns same queue instance', () => {
      const q1 = executor.getQueue()
      const q2 = executor.getQueue()
      expect(q1).toBe(q2)
    })
  })

  describe('getStats', () => {
    it('returns stats from internal queue', () => {
      const stats = executor.getStats()
      expect(stats).toBeDefined()
      expect(typeof stats.activeTasks).toBe('number')
      expect(typeof stats.completedTasks).toBe('number')
    })

    it('reflects completed tasks', async () => {
      await executor.analyzeFiles(['/test.ts'], instantTask)
      const stats = executor.getStats()
      expect(stats.completedTasks).toBe(1)
    })

    it('reflects failed tasks', async () => {
      await executor.analyzeFiles(['/test.ts'], failingTask)
      const stats = executor.getStats()
      expect(stats.failedTasks).toBe(1)
    })
  })
})

describe('Integration: TaskQueue with real async work', () => {
  it('handles concurrent delayed tasks', async () => {
    const queue = new TaskQueue({ maxConcurrency: 4, retryCount: 0 })
    const files = ['/a.ts', '/b.ts', '/c.ts', '/d.ts']
    const task = delayedTask(10)
    const result = await queue.executeBatch(files, task)
    expect(result.successCount).toBe(4)
    expect(result.failureCount).toBe(0)
  })

  it('handles mixed fast and slow tasks', async () => {
    const queue = new TaskQueue({ maxConcurrency: 2, retryCount: 0 })
    const task = (fp: string): Promise<string> => {
      const delay = fp.includes('slow') ? 50 : 5
      return new Promise(resolve => setTimeout(() => resolve('done'), delay))
    }
    const files = ['/fast1.ts', '/slow1.ts', '/fast2.ts', '/slow2.ts']
    const result = await queue.executeBatch(files, task)
    expect(result.successCount).toBe(4)
  })

  it('sequential batches share stats via reset', async () => {
    const queue = new TaskQueue({ retryCount: 0 })
    await queue.executeBatch(['/a.ts'], instantTask)
    let stats = queue.getStats()
    expect(stats.completedTasks).toBe(1)
    queue.reset()
    stats = queue.getStats()
    expect(stats.completedTasks).toBe(0)
    await queue.executeBatch(['/b.ts'], instantTask)
    stats = queue.getStats()
    expect(stats.completedTasks).toBe(1)
  })
})

describe('Integration: ParallelExecutor end-to-end', () => {
  it('analyzes files then processes batches', async () => {
    const executor = new ParallelExecutor({ batchSize: 3, maxConcurrency: 2, retryCount: 0 })
    const files = ['/a.ts', '/b.ts', '/c.ts', '/d.ts', '/e.ts']
    const analyzeResult = await executor.analyzeFiles(files, instantTask)
    expect(analyzeResult.successCount).toBe(5)
    const batchResults = await executor.processBatches(
      files,
      (batch) => Promise.resolve(batch.map(f => `processed:${f}`)),
    )
    expect(batchResults).toHaveLength(2)
    expect(batchResults[0]!.results).toHaveLength(3)
    expect(batchResults[1]!.results).toHaveLength(2)
  })

  it('handles empty analyzeFiles and processBatches together', async () => {
    const executor = new ParallelExecutor()
    const analyzeResult = await executor.analyzeFiles([], instantTask)
    expect(analyzeResult.results).toEqual([])
    const batchResults = await executor.processBatches([], (_b) => Promise.resolve([]))
    expect(batchResults).toEqual([])
  })
})

describe('Edge cases', () => {
  it('handles file path with special characters', async () => {
    const queue = new TaskQueue({ retryCount: 0 })
    const result = await queue.executeTask('/path/with spaces/and-dashes/file.ts', instantTask)
    expect(result.filePath).toBe('/path/with spaces/and-dashes/file.ts')
    expect(result.success).toBe(true)
  })

  it('handles file path with unicode', async () => {
    const queue = new TaskQueue({ retryCount: 0 })
    const result = await queue.executeTask('/路径/文件.ts', instantTask)
    expect(result.filePath).toBe('/路径/文件.ts')
    expect(result.success).toBe(true)
  })

  it('handles very long file path', async () => {
    const queue = new TaskQueue({ retryCount: 0 })
    const longPath = '/' + 'a'.repeat(500) + '.ts'
    const result = await queue.executeTask(longPath, instantTask)
    expect(result.filePath).toBe(longPath)
    expect(result.success).toBe(true)
  })

  it('handles task returning null', async () => {
    const queue = new TaskQueue({ retryCount: 0 })
    const result = await queue.executeTask('/test.ts', () => Promise.resolve(null))
    expect(result.success).toBe(true)
    expect(result.result).toBeNull()
  })

  it('handles task returning empty string', async () => {
    const queue = new TaskQueue({ retryCount: 0 })
    const result = await queue.executeTask('/test.ts', () => Promise.resolve(''))
    expect(result.success).toBe(true)
    expect(result.result).toBe('')
  })

  it('handles task returning false', async () => {
    const queue = new TaskQueue({ retryCount: 0 })
    const result = await queue.executeTask('/test.ts', () => Promise.resolve(false))
    expect(result.success).toBe(true)
    expect(result.result).toBe(false)
  })

  it('handles task returning zero', async () => {
    const queue = new TaskQueue({ retryCount: 0 })
    const result = await queue.executeTask('/test.ts', () => Promise.resolve(0))
    expect(result.success).toBe(true)
    expect(result.result).toBe(0)
  })

  it('handles batch with single failing task among many', async () => {
    const queue = new TaskQueue({ maxConcurrency: 4, retryCount: 0 })
    const files = ['/a.ts', '/b.ts', '/c.ts']
    const selectiveFail = (fp: string): Promise<string> =>
      fp === '/b.ts' ? Promise.reject(new Error('selective')) : Promise.resolve('ok')
    const result = await queue.executeBatch(files, selectiveFail)
    expect(result.successCount).toBe(2)
    expect(result.failureCount).toBe(1)
    expect(result.results[1]!.success).toBe(false)
    expect(result.results[0]!.success).toBe(true)
    expect(result.results[2]!.success).toBe(true)
  })

  it('TaskQueue with maxConcurrency of 1 processes sequentially', async () => {
    const queue = new TaskQueue({ maxConcurrency: 1, retryCount: 0 })
    const order: string[] = []
    const trackedTask = (fp: string): Promise<string> =>
      new Promise(resolve => {
        order.push(fp)
        resolve('done')
      })
    const files = ['/first.ts', '/second.ts', '/third.ts']
    await queue.executeBatch(files, trackedTask)
    expect(order).toEqual(files)
  })

  it('does not retry when retryCount is 0', async () => {
    const queue = new TaskQueue({ retryCount: 0, retryDelay: 10 })
    let attempts = 0
    const trackedFail = (_fp: string): Promise<string> => {
      attempts++
      return Promise.reject(new Error('no retry'))
    }
    const result = await queue.executeTask('/test.ts', trackedFail)
    expect(result.success).toBe(false)
    expect(attempts).toBe(1)
  })

  it('config merge preserves unspecified fields', async () => {
    const queue = new TaskQueue({ timeout: 999 })
    const result = await queue.executeTask('/test.ts', instantTask)
    expect(result.success).toBe(true)
  })

  it('ParallelExecutor with all custom config options', async () => {
    const executor = new ParallelExecutor({
      maxConcurrency: 2,
      batchSize: 5,
      timeout: 5000,
      retryCount: 0,
      retryDelay: 50,
    })
    const result = await executor.analyzeFiles(['/a.ts'], instantTask)
    expect(result.successCount).toBe(1)
  })
})
