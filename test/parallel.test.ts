import { describe, it, expect, vi } from 'vitest'
import { TaskQueue } from '../src/core/parallel/task-queue.js'
import { ParallelExecutor } from '../src/core/parallel/parallel-executor.js'

// ─── TaskQueue: Single Task Execution ───

describe('TaskQueue: single task execution', () => {
  it('executeTask returns success for a passing task', async () => {
    const tq = new TaskQueue({ timeout: 5000, retryCount: 0, retryDelay: 0 })
    const result = await tq.executeTask('test.ts', async () => 42)
    expect(result.success).toBe(true)
    expect(result.result).toBe(42)
    expect(result.filePath).toBe('test.ts')
    expect(result.retries).toBe(0)
  })

  it('executeTask returns failure for a throwing task', async () => {
    const tq = new TaskQueue({ timeout: 5000, retryCount: 0, retryDelay: 0 })
    const result = await tq.executeTask('fail.ts', async () => {
      throw new Error('boom')
    })
    expect(result.success).toBe(false)
    expect(result.error).toBeInstanceOf(Error)
    expect(result.error!.message).toBe('boom')
  })

  it('executeTask retries on failure', async () => {
    let attempt = 0
    const tq = new TaskQueue({ timeout: 5000, retryCount: 2, retryDelay: 1 })
    const result = await tq.executeTask('retry.ts', async () => {
      attempt++
      if (attempt < 3) throw new Error('retry me')
      return 'ok'
    })
    expect(result.success).toBe(true)
    expect(result.result).toBe('ok')
    expect(attempt).toBe(3)
  })

  it('executeTask reports timeout as failure', async () => {
    const tq = new TaskQueue({ timeout: 10, retryCount: 0, retryDelay: 0 })
    const result = await tq.executeTask('slow.ts', async () => {
      await new Promise(r => setTimeout(r, 500))
      return 'too late'
    })
    expect(result.success).toBe(false)
    expect(result.error!.message).toContain('timed out')
  })
})

// ─── TaskQueue: Batch Execution ───

describe('TaskQueue: batch execution', () => {
  it('executeBatch processes multiple files', async () => {
    const tq = new TaskQueue({ maxConcurrency: 2, timeout: 5000, retryCount: 0, retryDelay: 0 })
    const files = ['a.ts', 'b.ts', 'c.ts']
    const result = await tq.executeBatch(files, async (f) => f.toUpperCase())
    expect(result.results).toHaveLength(3)
    expect(result.successCount).toBe(3)
    expect(result.failureCount).toBe(0)
    expect(result.results[0]!.result).toBe('A.TS')
  })

  it('executeBatch returns empty result for empty input', async () => {
    const tq = new TaskQueue({ timeout: 5000, retryCount: 0, retryDelay: 0 })
    const result = await tq.executeBatch([], async () => null)
    expect(result.results).toHaveLength(0)
    expect(result.totalDuration).toBe(0)
    expect(result.successCount).toBe(0)
  })

  it('executeBatch calls onProgress callback', async () => {
    const tq = new TaskQueue({ maxConcurrency: 1, timeout: 5000, retryCount: 0, retryDelay: 0 })
    const progress: [number, number][] = []
    await tq.executeBatch(['a.ts', 'b.ts'], async () => 1, (c, t) => progress.push([c, t]))
    expect(progress).toEqual([[1, 2], [2, 2]])
  })

  it('executeBatch handles mixed success and failure', async () => {
    const tq = new TaskQueue({ maxConcurrency: 2, timeout: 5000, retryCount: 0, retryDelay: 0 })
    const files = ['ok.ts', 'bad.ts']
    const result = await tq.executeBatch(files, async (f) => {
      if (f === 'bad.ts') throw new Error('bad')
      return 'ok'
    })
    expect(result.successCount).toBe(1)
    expect(result.failureCount).toBe(1)
  })
})

// ─── TaskQueue: Stats and Config ───

describe('TaskQueue: stats and config', () => {
  it('getStats returns initial zeroed stats', () => {
    const tq = new TaskQueue({ maxConcurrency: 4, timeout: 5000, retryCount: 0, retryDelay: 0 })
    const stats = tq.getStats()
    expect(stats.completedTasks).toBe(0)
    expect(stats.failedTasks).toBe(0)
    expect(stats.activeTasks).toBe(0)
  })

  it('getStats reflects completed tasks', async () => {
    const tq = new TaskQueue({ maxConcurrency: 1, timeout: 5000, retryCount: 0, retryDelay: 0 })
    await tq.executeTask('a.ts', async () => 1)
    const stats = tq.getStats()
    expect(stats.completedTasks).toBe(1)
  })

  it('updateConfig changes concurrency', async () => {
    const tq = new TaskQueue({ maxConcurrency: 1, timeout: 5000, retryCount: 0, retryDelay: 0 })
    tq.updateConfig({ maxConcurrency: 4 })
    await tq.executeTask('test.ts', async () => 1)
    expect(tq.getStats().completedTasks).toBe(1)
  })

  it('reset clears counters', async () => {
    const tq = new TaskQueue({ maxConcurrency: 1, timeout: 5000, retryCount: 0, retryDelay: 0 })
    await tq.executeTask('a.ts', async () => 1)
    tq.reset()
    expect(tq.getStats().completedTasks).toBe(0)
    expect(tq.getStats().failedTasks).toBe(0)
  })

  it('getActiveCount and getPendingCount return numbers', () => {
    const tq = new TaskQueue({ maxConcurrency: 4, timeout: 5000, retryCount: 0, retryDelay: 0 })
    expect(typeof tq.getActiveCount()).toBe('number')
    expect(typeof tq.getPendingCount()).toBe('number')
  })
})

// ─── ParallelExecutor ───

describe('ParallelExecutor: analyzeFiles', () => {
  it('analyzeFiles processes files and returns batch result', async () => {
    const pe = new ParallelExecutor({ maxConcurrency: 2, timeout: 5000, retryCount: 0, retryDelay: 0, batchSize: 10 })
    const result = await pe.analyzeFiles(['a.ts', 'b.ts'], async (f) => f.length)
    expect(result.results).toHaveLength(2)
    expect(result.successCount).toBe(2)
  })

  it('analyzeFiles accepts config via options', async () => {
    const pe = new ParallelExecutor({ maxConcurrency: 1, timeout: 5000, retryCount: 0, retryDelay: 0, batchSize: 10 })
    const result = await pe.analyzeFiles(
      ['x.ts'],
      async (f) => f,
      { config: { maxConcurrency: 2 } },
    )
    expect(result.successCount).toBe(1)
  })
})

// ─── ParallelExecutor: processBatches ───

describe('ParallelExecutor: processBatches', () => {
  it('processBatches splits files into batches', async () => {
    const pe = new ParallelExecutor({ maxConcurrency: 2, timeout: 5000, retryCount: 0, retryDelay: 0, batchSize: 2 })
    const files = ['a.ts', 'b.ts', 'c.ts', 'd.ts', 'e.ts']
    const results = await pe.processBatches(files, async (batch) => batch.map(f => f.toUpperCase()))
    expect(results).toHaveLength(3)
    expect(results[0]!.successCount).toBe(2)
    expect(results[1]!.successCount).toBe(2)
    expect(results[2]!.successCount).toBe(1)
  })

  it('processBatches returns empty array for empty input', async () => {
    const pe = new ParallelExecutor({ maxConcurrency: 2, timeout: 5000, retryCount: 0, retryDelay: 0, batchSize: 10 })
    const results = await pe.processBatches([], async () => [])
    expect(results).toEqual([])
  })
})

// ─── ParallelExecutor: Stats ───

describe('ParallelExecutor: stats', () => {
  it('getStats returns current stats', async () => {
    const pe = new ParallelExecutor({ maxConcurrency: 2, timeout: 5000, retryCount: 0, retryDelay: 0, batchSize: 10 })
    await pe.analyzeFiles(['test.ts'], async () => 1)
    const stats = pe.getStats()
    expect(stats.completedTasks).toBe(1)
  })

  it('getQueue exposes internal TaskQueue', () => {
    const pe = new ParallelExecutor({ maxConcurrency: 2, timeout: 5000, retryCount: 0, retryDelay: 0, batchSize: 10 })
    const tq = pe.getQueue()
    expect(tq).toBeInstanceOf(TaskQueue)
  })
})
