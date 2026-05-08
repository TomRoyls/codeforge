import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TaskQueue } from '../../src/core/parallel/task-queue.js'
import { ParallelExecutor } from '../../src/core/parallel/parallel-executor.js'
import { DEFAULT_PARALLEL_CONFIG } from '../../src/core/parallel/types.js'
import type { TaskResult, BatchResult } from '../../src/core/parallel/types.js'

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

describe('TaskQueue', () => {
  let queue: TaskQueue

  beforeEach(() => {
    queue = new TaskQueue()
  })

  describe('executeTask', () => {
    it('succeeds for simple task', async () => {
      const result = await queue.executeTask('/test.ts', async () => 42)
      expect(result.success).toBe(true)
      expect(result.result).toBe(42)
      expect(result.filePath).toBe('/test.ts')
    })

    it('returns error result for failing task', async () => {
      const result = await queue.executeTask('/fail.ts', async () => {
        throw new Error('boom')
      })
      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('boom')
      expect(result.filePath).toBe('/fail.ts')
    })

    it('measures duration correctly', async () => {
      const result = await queue.executeTask('/slow.ts', async () => {
        await delay(50)
        return 'done'
      })
      expect(result.success).toBe(true)
      expect(result.duration).toBeGreaterThanOrEqual(40)
    })

    it('retries on failure', async () => {
      let attempts = 0
      const q = new TaskQueue({ retryCount: 2, retryDelay: 10 })
      const result = await q.executeTask('/retry.ts', async () => {
        attempts++
        if (attempts < 3) throw new Error('fail')
        return 'ok'
      })
      expect(result.success).toBe(true)
      expect(result.result).toBe('ok')
      expect(result.retries).toBeGreaterThanOrEqual(1)
    })

    it('times out for slow tasks', async () => {
      const q = new TaskQueue({ timeout: 50, retryCount: 0 })
      const result = await q.executeTask('/timeout.ts', async () => {
        await delay(500)
        return 'late'
      })
      expect(result.success).toBe(false)
      expect(result.error?.message).toContain('timed out')
    })

    it('returns correct retries count on all-fail', async () => {
      const q = new TaskQueue({ retryCount: 2, retryDelay: 10 })
      const result = await q.executeTask('/always-fail.ts', async () => {
        throw new Error('nope')
      })
      expect(result.success).toBe(false)
      expect(result.retries).toBe(2)
    })

    it('handles non-Error throws', async () => {
      const result = await queue.executeTask('/string-error.ts', async () => {
        throw 'string error'
      })
      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('string error')
    })

    it('resolves undefined results', async () => {
      const result = await queue.executeTask('/void.ts', async () => {
        return
      })
      expect(result.success).toBe(true)
      expect(result.result).toBeUndefined()
    })
  })

  describe('executeBatch', () => {
    it('processes all files', async () => {
      const files = ['/a.ts', '/b.ts', '/c.ts']
      const batch = await queue.executeBatch(files, async () => 'ok')
      expect(batch.results).toHaveLength(3)
      expect(batch.results.every(r => r.success)).toBe(true)
    })

    it('reports correct success/failure counts', async () => {
      const files = ['/ok.ts', '/fail.ts', '/ok2.ts']
      const batch = await queue.executeBatch(files, async (fp) => {
        if (fp.includes('fail')) throw new Error('fail')
        return 'ok'
      })
      expect(batch.successCount).toBe(2)
      expect(batch.failureCount).toBe(1)
    })

    it('computes correct statistics', async () => {
      const files = ['/a.ts', '/b.ts']
      const batch = await queue.executeBatch(files, async () => {
        await delay(10)
        return 'ok'
      })
      expect(batch.averageDuration).toBeGreaterThan(0)
      expect(batch.minDuration).toBeLessThanOrEqual(batch.maxDuration)
      expect(batch.throughput).toBeGreaterThan(0)
    })

    it('calls onProgress callback', async () => {
      const progress = vi.fn()
      const files = ['/a.ts', '/b.ts', '/c.ts']
      await queue.executeBatch(files, async () => 'ok', progress)
      expect(progress).toHaveBeenCalledTimes(3)
      expect(progress).toHaveBeenLastCalledWith(3, 3)
    })

    it('handles empty file list', async () => {
      const batch = await queue.executeBatch([], async () => 'ok')
      expect(batch.results).toHaveLength(0)
      expect(batch.totalDuration).toBe(0)
      expect(batch.successCount).toBe(0)
      expect(batch.failureCount).toBe(0)
      expect(batch.averageDuration).toBe(0)
      expect(batch.minDuration).toBe(0)
      expect(batch.maxDuration).toBe(0)
      expect(batch.throughput).toBe(0)
    })

    it('handles mix of successes and failures', async () => {
      const files = ['/s1.ts', '/f1.ts', '/s2.ts', '/f2.ts', '/s3.ts']
      const batch = await queue.executeBatch(files, async (fp) => {
        if (fp.startsWith('/f')) throw new Error('fail')
        return 'ok'
      })
      expect(batch.successCount).toBe(3)
      expect(batch.failureCount).toBe(2)
      expect(batch.results).toHaveLength(5)
    })

    it('respects concurrency limit', async () => {
      const q = new TaskQueue({ maxConcurrency: 1 })
      let maxConcurrent = 0
      let current = 0
      const files = Array.from({ length: 5 }, (_, i) => `/file${i}.ts`)
      await q.executeBatch(files, async () => {
        current++
        maxConcurrent = Math.max(maxConcurrent, current)
        await delay(20)
        current--
        return 'ok'
      })
      expect(maxConcurrent).toBeLessThanOrEqual(1)
    })

    it('computes min and max duration', async () => {
      const q = new TaskQueue({ maxConcurrency: 1 })
      const files = ['/fast.ts', '/slow.ts']
      const batch = await q.executeBatch(files, async (fp) => {
        if (fp.includes('slow')) await delay(50)
        else await delay(5)
        return 'ok'
      })
      expect(batch.minDuration).toBeLessThan(batch.maxDuration)
    })

    it('tracks throughput', async () => {
      const files = Array.from({ length: 10 }, (_, i) => `/f${i}.ts`)
      const batch = await queue.executeBatch(files, async () => 'ok')
      expect(batch.throughput).toBeGreaterThan(0)
    })
  })

  describe('getStats', () => {
    it('returns correct initial statistics', () => {
      const stats = queue.getStats()
      expect(stats.activeTasks).toBe(0)
      expect(stats.queuedTasks).toBe(0)
      expect(stats.completedTasks).toBe(0)
      expect(stats.failedTasks).toBe(0)
      expect(stats.totalTasks).toBe(0)
      expect(stats.averageTaskDuration).toBe(0)
      expect(stats.poolUtilization).toBe(0)
    })

    it('returns updated stats after execution', async () => {
      await queue.executeTask('/done.ts', async () => 1)
      const stats = queue.getStats()
      expect(stats.completedTasks).toBe(1)
      expect(stats.averageTaskDuration).toBeGreaterThanOrEqual(0)
    })

    it('tracks failed tasks', async () => {
      await queue.executeTask('/fail.ts', async () => {
        throw new Error('fail')
      })
      const stats = queue.getStats()
      expect(stats.failedTasks).toBe(1)
    })

    it('computes pool utilization', () => {
      const stats = queue.getStats()
      expect(stats.poolUtilization).toBe(0)
    })
  })

  describe('updateConfig', () => {
    it('updates concurrency', () => {
      queue.updateConfig({ maxConcurrency: 8 })
      expect(queue.getActiveCount()).toBe(0)
      expect(queue.getPendingCount()).toBe(0)
    })

    it('updates timeout', () => {
      queue.updateConfig({ timeout: 5000 })
      expect(queue.getStats().activeTasks).toBe(0)
    })
  })

  describe('reset', () => {
    it('clears counters', async () => {
      await queue.executeTask('/a.ts', async () => 1)
      await queue.executeTask('/b.ts', async () => {
        throw new Error('x')
      })
      queue.reset()
      const stats = queue.getStats()
      expect(stats.completedTasks).toBe(0)
      expect(stats.failedTasks).toBe(0)
    })
  })

  describe('getPendingCount / getActiveCount', () => {
    it('returns correct values when idle', () => {
      expect(queue.getActiveCount()).toBe(0)
      expect(queue.getPendingCount()).toBe(0)
    })

    it('returns correct values during execution', async () => {
      const q = new TaskQueue({ maxConcurrency: 1 })
      const files = Array.from({ length: 3 }, (_, i) => `/f${i}.ts`)
      const batchPromise = q.executeBatch(files, async () => {
        await delay(50)
        return 'ok'
      })
      await delay(10)
      const active = q.getActiveCount()
      const pending = q.getPendingCount()
      expect(active).toBeGreaterThanOrEqual(0)
      expect(pending).toBeGreaterThanOrEqual(0)
      expect(active + pending).toBeGreaterThan(0)
      await batchPromise
    })
  })
})

describe('ParallelExecutor', () => {
  let executor: ParallelExecutor

  beforeEach(() => {
    executor = new ParallelExecutor()
  })

  describe('analyzeFiles', () => {
    it('processes files in parallel', async () => {
      const files = ['/a.ts', '/b.ts', '/c.ts']
      const result = await executor.analyzeFiles(files, async () => 42)
      expect(result.results).toHaveLength(3)
      expect(result.successCount).toBe(3)
    })

    it('respects concurrency limit', async () => {
      const ex = new ParallelExecutor({ maxConcurrency: 1 })
      let maxConcurrent = 0
      let current = 0
      const files = Array.from({ length: 4 }, (_, i) => `/f${i}.ts`)
      await ex.analyzeFiles(files, async () => {
        current++
        maxConcurrent = Math.max(maxConcurrent, current)
        await delay(20)
        current--
        return 'ok'
      })
      expect(maxConcurrent).toBeLessThanOrEqual(1)
    })

    it('calls onProgress', async () => {
      const progress = vi.fn()
      const files = ['/a.ts', '/b.ts']
      await executor.analyzeFiles(files, async () => 'ok', { onProgress: progress })
      expect(progress).toHaveBeenCalledTimes(2)
    })

    it('handles empty file list', async () => {
      const result = await executor.analyzeFiles([], async () => 'ok')
      expect(result.results).toHaveLength(0)
    })

    it('passes through config from options', async () => {
      const result = await executor.analyzeFiles(
        ['/a.ts'],
        async () => 'ok',
        { config: { timeout: 1000 } },
      )
      expect(result.successCount).toBe(1)
    })

    it('handles task failures', async () => {
      const files = ['/ok.ts', '/fail.ts']
      const result = await executor.analyzeFiles(files, async (fp) => {
        if (fp.includes('fail')) throw new Error('bad')
        return 'ok'
      })
      expect(result.successCount).toBe(1)
      expect(result.failureCount).toBe(1)
    })
  })

  describe('processBatches', () => {
    it('splits into batches', async () => {
      const files = Array.from({ length: 25 }, (_, i) => `/f${i}.ts`)
      const ex = new ParallelExecutor({ batchSize: 10 })
      const results = await ex.processBatches(files, async (batch) =>
        batch.map(() => 'ok'),
      )
      expect(results).toHaveLength(3)
    })

    it('processes all batches', async () => {
      const files = Array.from({ length: 15 }, (_, i) => `/f${i}.ts`)
      const ex = new ParallelExecutor({ batchSize: 5 })
      const results = await ex.processBatches(files, async (batch) =>
        batch.map(() => 'processed'),
      )
      const totalProcessed = results.reduce((sum, r) => sum + r.successCount, 0)
      expect(totalProcessed).toBe(15)
    })

    it('handles empty input', async () => {
      const results = await executor.processBatches([], async (batch) =>
        batch.map(() => 'ok'),
      )
      expect(results).toHaveLength(0)
    })

    it('handles single batch', async () => {
      const files = ['/a.ts', '/b.ts']
      const results = await executor.processBatches(files, async (batch) =>
        batch.map(() => 'ok'),
      )
      expect(results).toHaveLength(1)
      expect(results[0]!.successCount).toBe(2)
    })

    it('computes per-batch stats', async () => {
      const files = ['/a.ts', '/b.ts']
      const results = await executor.processBatches(files, async (batch) =>
        batch.map(() => 'ok'),
      )
      expect(results[0]!.throughput).toBeGreaterThan(0)
      expect(results[0]!.totalDuration).toBeGreaterThanOrEqual(0)
    })
  })

  describe('getStats', () => {
    it('delegates to queue', () => {
      const stats = executor.getStats()
      expect(stats).toHaveProperty('activeTasks')
      expect(stats).toHaveProperty('queuedTasks')
      expect(stats).toHaveProperty('completedTasks')
    })
  })

  describe('getQueue', () => {
    it('returns the task queue', () => {
      const q = executor.getQueue()
      expect(q).toBeInstanceOf(TaskQueue)
    })
  })
})

describe('DEFAULT_PARALLEL_CONFIG', () => {
  it('has expected defaults', () => {
    expect(DEFAULT_PARALLEL_CONFIG.maxConcurrency).toBe(4)
    expect(DEFAULT_PARALLEL_CONFIG.batchSize).toBe(10)
    expect(DEFAULT_PARALLEL_CONFIG.timeout).toBe(30000)
    expect(DEFAULT_PARALLEL_CONFIG.retryCount).toBe(1)
    expect(DEFAULT_PARALLEL_CONFIG.retryDelay).toBe(100)
  })
})

describe('Integration: TaskQueue + ParallelExecutor', () => {
  it('handles large batch of files', async () => {
    const ex = new ParallelExecutor({ maxConcurrency: 4 })
    const files = Array.from({ length: 50 }, (_, i) => `/file${i}.ts`)
    const result = await ex.analyzeFiles(files, async () => 'ok')
    expect(result.successCount).toBe(50)
    expect(result.failureCount).toBe(0)
  })

  it('handles all-failing batch', async () => {
    const ex = new ParallelExecutor({ maxConcurrency: 2, retryCount: 0 })
    const files = ['/f1.ts', '/f2.ts', '/f3.ts']
    const result = await ex.analyzeFiles(files, async () => {
      throw new Error('always fail')
    })
    expect(result.failureCount).toBe(3)
    expect(result.successCount).toBe(0)
  })

  it('handles timeout with retries disabled', async () => {
    const ex = new ParallelExecutor({ timeout: 30, retryCount: 0 })
    const files = ['/slow.ts']
    const result = await ex.analyzeFiles(files, async () => {
      await delay(200)
      return 'late'
    })
    expect(result.failureCount).toBe(1)
    expect(result.results[0]!.error?.message).toContain('timed out')
  })
})
