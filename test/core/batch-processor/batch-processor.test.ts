import { describe, it, expect } from 'vitest'
import { BatchProcessor } from '../../../src/core/batch-processor/batch-processor.js'
import { DEFAULT_BATCH_CONFIG } from '../../../src/core/batch-processor/types.js'
import type { BatchItem, BatchResult, BatchProgress } from '../../../src/core/batch-processor/types.js'

// ─── Helpers ───

function item(id: string, data: unknown = null): BatchItem {
  return { id, data }
}

function items(count: number): BatchItem[] {
  return Array.from({ length: count }, (_, i) => item(`item-${i}`, i))
}

function syncHandler(result: unknown = 'ok'): (item: BatchItem) => unknown {
  return (_item: BatchItem) => result
}

function asyncHandler(result: unknown = 'ok', delay = 0): (item: BatchItem) => Promise<unknown> {
  return async (_item: BatchItem) => {
    if (delay > 0) await new Promise<void>((r) => setTimeout(r, delay))
    return result
  }
}

function failingHandler(msg = 'fail'): (item: BatchItem) => unknown {
  return (_item: BatchItem) => {
    throw new Error(msg)
  }
}

function asyncFailingHandler(msg = 'fail'): (item: BatchItem) => Promise<unknown> {
  return async (_item: BatchItem) => { throw new Error(msg) }
}

// ─── Constructor ───

describe('BatchProcessor', () => {
  describe('constructor', () => {
    it('creates processor with default config', () => {
      const bp = new BatchProcessor()
      expect(bp.getConfig()).toEqual(DEFAULT_BATCH_CONFIG)
    })

    it('merges partial config with defaults', () => {
      const bp = new BatchProcessor({ batchSize: 5, concurrency: 3 })
      const cfg = bp.getConfig()
      expect(cfg.batchSize).toBe(5)
      expect(cfg.concurrency).toBe(3)
      expect(cfg.retries).toBe(DEFAULT_BATCH_CONFIG.retries)
    })

    it('returns a copy from getConfig', () => {
      const bp = new BatchProcessor()
      const c1 = bp.getConfig()
      const c2 = bp.getConfig()
      expect(c1).toEqual(c2)
      expect(c1).not.toBe(c2)
    })

    it('starts in idle state', () => {
      const bp = new BatchProcessor()
      expect(bp.getState()).toBe('idle')
    })

    it('starts with empty results', () => {
      const bp = new BatchProcessor()
      expect(bp.getResults()).toEqual([])
    })
  })

  // ─── process() — sync ───

  describe('process — sync', () => {
    it('processes a single item synchronously', () => {
      const bp = new BatchProcessor()
      const results = bp.process([item('a', 1)], syncHandler('done'))
      expect(results).toHaveLength(1)
      expect(results[0]!.success).toBe(true)
      expect(results[0]!.result).toBe('done')
      expect(results[0]!.id).toBe('a')
    })

    it('processes multiple items sequentially', () => {
      const bp = new BatchProcessor()
      const results = bp.process(items(3), syncHandler())
      expect(results).toHaveLength(3)
      expect(results.every((r) => r.success)).toBe(true)
    })

    it('returns empty array for empty input', () => {
      const bp = new BatchProcessor()
      const results = bp.process([], syncHandler())
      expect(results).toEqual([])
      expect(bp.getState()).toBe('completed')
    })

    it('sets state to completed after processing', () => {
      const bp = new BatchProcessor()
      bp.process([item('a')], syncHandler())
      expect(bp.getState()).toBe('completed')
    })

    it('records error on failed item with continueOnError', () => {
      const bp = new BatchProcessor({ continueOnError: true })
      const results = bp.process([item('a'), item('b'), item('c')], (it: BatchItem) => {
        if (it.id === 'b') throw new Error('boom')
        return 'ok'
      })
      expect(results).toHaveLength(3)
      expect(results[0]!.success).toBe(true)
      expect(results[1]!.success).toBe(false)
      expect(results[1]!.error).toBe('boom')
      expect(results[2]!.success).toBe(true)
    })

    it('stops on error when continueOnError is false', () => {
      const bp = new BatchProcessor({ continueOnError: false })
      const results = bp.process([item('a'), item('b'), item('c')], (it: BatchItem) => {
        if (it.id === 'b') throw new Error('stop')
        return 'ok'
      })
      expect(bp.getState()).toBe('error')
      expect(results.length).toBeLessThanOrEqual(2)
      const failed = results.find((r) => !r.success)
      expect(failed).toBeDefined()
      expect(failed!.error).toBe('stop')
    })

    it('retries on sync failure up to retries count', () => {
      let calls = 0
      const bp = new BatchProcessor({ retries: 2, continueOnError: true })
      const results = bp.process([item('a')], () => {
        calls++
        throw new Error('fail')
      })
      expect(results[0]!.success).toBe(false)
      expect(calls).toBe(3)
    })

    it('succeeds if retry succeeds', () => {
      let calls = 0
      const bp = new BatchProcessor({ retries: 2, continueOnError: true })
      const results = bp.process([item('a')], () => {
        calls++
        if (calls < 2) throw new Error('transient')
        return 'recovered'
      })
      expect(results[0]!.success).toBe(true)
      expect(results[0]!.result).toBe('recovered')
    })
  })

  // ─── process() — async ───

  describe('process — async', () => {
    it('processes async handlers and returns promise', async () => {
      const bp = new BatchProcessor()
      const results = await bp.process([item('a')], asyncHandler('async-result'))
      expect(results).toHaveLength(1)
      expect(results[0]!.success).toBe(true)
      expect(results[0]!.result).toBe('async-result')
    })

    it('processes multiple async items', async () => {
      const bp = new BatchProcessor({ batchSize: 2 })
      const results = await bp.process(items(4), asyncHandler())
      expect(results).toHaveLength(4)
      expect(results.every((r) => r.success)).toBe(true)
    })

    it('handles async failures with continueOnError', async () => {
      const bp = new BatchProcessor({ continueOnError: true })
      const results = await bp.process(
        [item('a'), item('b'), item('c')],
        async (it: BatchItem) => {
          if (it.id === 'b') throw new Error('async-fail')
          return 'ok'
        },
      )
      expect(results[1]!.success).toBe(false)
      expect(results[1]!.error).toBe('async-fail')
      expect(results).toHaveLength(3)
    })

    it('stops on async error when continueOnError false', async () => {
      const bp = new BatchProcessor({ continueOnError: false })
      const results = await bp.process(
        [item('a'), item('b'), item('c')],
        async (it: BatchItem) => {
          if (it.id === 'b') throw new Error('stop-async')
          return 'ok'
        },
      )
      expect(bp.getState()).toBe('error')
      expect(results.some((r) => !r.success)).toBe(true)
    })

    it('retries async failures', async () => {
      let calls = 0
      const bp = new BatchProcessor({ retries: 1, continueOnError: true })
      const results = await bp.process([item('a')], async () => {
        calls++
        if (calls < 2) throw new Error('transient')
        return 'recovered'
      })
      expect(results[0]!.success).toBe(true)
      expect(results[0]!.result).toBe('recovered')
    })
  })

  // ─── processBatch() ───

  describe('processBatch', () => {
    it('processes items as a batch synchronously', () => {
      const bp = new BatchProcessor()
      const results = bp.processBatch(items(3), syncHandler())
      expect(results).toHaveLength(3)
      expect(results.every((r) => r.success)).toBe(true)
    })

    it('processes items as a batch asynchronously', async () => {
      const bp = new BatchProcessor()
      const results = await bp.processBatch(items(3), asyncHandler())
      expect(results).toHaveLength(3)
      expect(results.every((r) => r.success)).toBe(true)
    })

    it('returns empty array for empty input', () => {
      const bp = new BatchProcessor()
      const results = bp.processBatch([], syncHandler())
      expect(results).toEqual([])
      expect(bp.getState()).toBe('completed')
    })

    it('handles batch failures with continueOnError', () => {
      const bp = new BatchProcessor({ continueOnError: true })
      const results = bp.processBatch([item('a'), item('b')], (it: BatchItem) => {
        if (it.id === 'b') throw new Error('batch-fail')
        return 'ok'
      })
      expect(results).toHaveLength(2)
      expect(results[1]!.success).toBe(false)
    })
  })

  // ─── State Management ───

  describe('state management', () => {
    it('transition: idle -> running -> completed', () => {
      const bp = new BatchProcessor()
      expect(bp.getState()).toBe('idle')
      bp.process([item('a')], syncHandler())
      expect(bp.getState()).toBe('completed')
    })

    it('transition: idle -> running -> error (sync fail, no continue)', () => {
      const bp = new BatchProcessor({ continueOnError: false })
      bp.process([item('a')], failingHandler())
      expect(bp.getState()).toBe('error')
    })

    it('cancel sets state to error from running', async () => {
      const bp = new BatchProcessor({ continueOnError: true })
      const promise = bp.process([item('a'), item('b'), item('c')], asyncHandler('val', 50))
      bp.cancel()
      await promise
      expect(['error', 'completed']).toContain(bp.getState())
    })

    it('cancel from paused sets state to error', async () => {
      const bp = new BatchProcessor({ continueOnError: true })
      const promise = bp.process([item('a'), item('b'), item('c')], asyncHandler('val', 50))
      bp.pause()
      bp.cancel()
      await promise
      expect(bp.getState()).toBe('error')
    })

    it('reset returns processor to idle', () => {
      const bp = new BatchProcessor()
      bp.process([item('a')], syncHandler())
      expect(bp.getState()).toBe('completed')
      bp.reset()
      expect(bp.getState()).toBe('idle')
      expect(bp.getResults()).toEqual([])
    })

    it('pause only works when running', () => {
      const bp = new BatchProcessor()
      bp.pause()
      expect(bp.getState()).toBe('idle')
    })

    it('resume only works when paused', () => {
      const bp = new BatchProcessor()
      bp.resume()
      expect(bp.getState()).toBe('idle')
    })
  })

  // ─── Progress ───

  describe('progress', () => {
    it('tracks total items in progress', () => {
      const bp = new BatchProcessor()
      bp.process(items(5), syncHandler())
      const progress = bp.getProgress()
      expect(progress.total).toBe(5)
    })

    it('tracks completed count', () => {
      const bp = new BatchProcessor()
      bp.process(items(3), syncHandler())
      expect(bp.getProgress().completed).toBe(3)
    })

    it('tracks failed count', () => {
      const bp = new BatchProcessor({ continueOnError: true })
      bp.process([item('a'), item('b')], (it: BatchItem) => {
        if (it.id === 'b') throw new Error('fail')
        return 'ok'
      })
      expect(bp.getProgress().failed).toBe(1)
    })

    it('returns a copy from getProgress', () => {
      const bp = new BatchProcessor()
      bp.process([item('a')], syncHandler())
      const p1 = bp.getProgress()
      const p2 = bp.getProgress()
      expect(p1).toEqual(p2)
      expect(p1).not.toBe(p2)
    })

    it('calls onProgress callback', () => {
      const progressCalls: BatchProgress[] = []
      const bp = new BatchProcessor({
        onProgress: (p) => progressCalls.push(p),
      })
      bp.process([item('a'), item('b')], syncHandler())
      expect(progressCalls.length).toBeGreaterThan(0)
      expect(progressCalls[0]!.total).toBe(2)
    })

    it('has startTime in progress', () => {
      const bp = new BatchProcessor()
      const before = Date.now()
      bp.process([item('a')], syncHandler())
      const after = Date.now()
      const progress = bp.getProgress()
      expect(progress.startTime).toBeGreaterThanOrEqual(before)
      expect(progress.startTime).toBeLessThanOrEqual(after)
    })
  })

  // ─── Results ───

  describe('results', () => {
    it('getResults returns copy', () => {
      const bp = new BatchProcessor()
      bp.process([item('a')], syncHandler())
      const r1 = bp.getResults()
      const r2 = bp.getResults()
      expect(r1).toEqual(r2)
      expect(r1).not.toBe(r2)
    })

    it('getSuccessfulResults filters only successes', () => {
      const bp = new BatchProcessor({ continueOnError: true })
      bp.process([item('a'), item('b')], (it: BatchItem) => {
        if (it.id === 'b') throw new Error('nope')
        return 'ok'
      })
      const success = bp.getSuccessfulResults()
      expect(success).toHaveLength(1)
      expect(success[0]!.id).toBe('a')
    })

    it('getFailedResults filters only failures', () => {
      const bp = new BatchProcessor({ continueOnError: true })
      bp.process([item('a'), item('b')], (it: BatchItem) => {
        if (it.id === 'b') throw new Error('nope')
        return 'ok'
      })
      const failed = bp.getFailedResults()
      expect(failed).toHaveLength(1)
      expect(failed[0]!.id).toBe('b')
      expect(failed[0]!.error).toBe('nope')
    })

    it('results include duration', () => {
      const bp = new BatchProcessor()
      bp.process([item('a')], syncHandler())
      const results = bp.getResults()
      expect(results[0]!.duration).toBeGreaterThanOrEqual(0)
    })
  })

  // ─── Statistics ───

  describe('getStatistics', () => {
    it('returns zero stats before processing', () => {
      const bp = new BatchProcessor()
      const stats = bp.getStatistics()
      expect(stats.total).toBe(0)
      expect(stats.succeeded).toBe(0)
      expect(stats.failed).toBe(0)
      expect(stats.averageDuration).toBe(0)
      expect(stats.totalDuration).toBe(0)
    })

    it('returns correct stats after processing', () => {
      const bp = new BatchProcessor({ continueOnError: true })
      bp.process([item('a'), item('b'), item('c')], (it: BatchItem) => {
        if (it.id === 'c') throw new Error('fail')
        return 'ok'
      })
      const stats = bp.getStatistics()
      expect(stats.total).toBe(3)
      expect(stats.succeeded).toBe(2)
      expect(stats.failed).toBe(1)
      expect(stats.totalDuration).toBeGreaterThanOrEqual(0)
      expect(stats.averageDuration).toBe(stats.totalDuration / stats.total)
    })

    it('returns updated stats after reset and reprocess', () => {
      const bp = new BatchProcessor()
      bp.process(items(2), syncHandler())
      bp.reset()
      const stats = bp.getStatistics()
      expect(stats.total).toBe(0)
    })
  })

  // ─── Reset ───

  describe('reset', () => {
    it('clears all state', () => {
      const bp = new BatchProcessor({ continueOnError: true })
      bp.process([item('a'), item('b')], syncHandler())
      bp.reset()
      expect(bp.getState()).toBe('idle')
      expect(bp.getResults()).toEqual([])
      expect(bp.getProgress().total).toBe(0)
      expect(bp.getProgress().completed).toBe(0)
      expect(bp.getProgress().failed).toBe(0)
    })

    it('allows processing again after reset', () => {
      const bp = new BatchProcessor()
      bp.process([item('a')], syncHandler())
      expect(bp.getState()).toBe('completed')
      bp.reset()
      bp.process([item('b')], syncHandler())
      expect(bp.getState()).toBe('completed')
      expect(bp.getResults()).toHaveLength(1)
      expect(bp.getResults()[0]!.id).toBe('b')
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('handles item with numeric id', () => {
      const bp = new BatchProcessor()
      const results = bp.process([{ id: 42, data: 'test' }], syncHandler())
      expect(results[0]!.id).toBe(42)
      expect(results[0]!.success).toBe(true)
    })

    it('handles handler returning undefined', () => {
      const bp = new BatchProcessor()
      const results = bp.process([item('a')], () => undefined)
      expect(results[0]!.success).toBe(true)
      expect(results[0]!.result).toBeUndefined()
    })

    it('handles handler returning null', () => {
      const bp = new BatchProcessor()
      const results = bp.process([item('a')], () => null)
      expect(results[0]!.success).toBe(true)
      expect(results[0]!.result).toBe(null)
    })

    it('handles non-Error thrown object', () => {
      const bp = new BatchProcessor({ continueOnError: true })
      const results = bp.process([item('a')], () => {
        throw 'string error'
      })
      expect(results[0]!.success).toBe(false)
      expect(results[0]!.error).toBe('string error')
    })
  })
})
