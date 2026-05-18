/// <reference types="vitest" />

import { BatchProcessor, DEFAULT_BATCH_CONFIG } from '../src/core/batch-processor/batch-processor.js'
import type { BatchItem, BatchResult, BatchProgress, BatchConfig, BatchProcessorState } from '../src/core/batch-processor/batch-processor.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('BatchProcessor', () => {
  describe('constructor', () => {
    it('creates an instance with default config', () => {
      const bp = new BatchProcessor()
      const config = bp.getConfig()
      expect(config.batchSize).toBe(DEFAULT_BATCH_CONFIG.batchSize)
      expect(config.concurrency).toBe(DEFAULT_BATCH_CONFIG.concurrency)
      expect(config.retries).toBe(DEFAULT_BATCH_CONFIG.retries)
      expect(config.retryDelay).toBe(DEFAULT_BATCH_CONFIG.retryDelay)
      expect(config.timeout).toBe(DEFAULT_BATCH_CONFIG.timeout)
      expect(config.continueOnError).toBe(DEFAULT_BATCH_CONFIG.continueOnError)
    })

    it('creates an instance with partial custom config', () => {
      const bp = new BatchProcessor({ batchSize: 5, retries: 3 })
      const config = bp.getConfig()
      expect(config.batchSize).toBe(5)
      expect(config.retries).toBe(3)
      expect(config.concurrency).toBe(DEFAULT_BATCH_CONFIG.concurrency)
    })

    it('creates an instance with fully custom config', () => {
      const custom: BatchConfig = {
        batchSize: 1,
        concurrency: 2,
        retries: 5,
        retryDelay: 50,
        timeout: 5000,
        continueOnError: false,
      }
      const bp = new BatchProcessor(custom)
      const config = bp.getConfig()
      expect(config).toEqual(custom)
    })

    it('starts in idle state', () => {
      const bp = new BatchProcessor()
      expect(bp.getState()).toBe('idle')
    })

    it('has empty results initially', () => {
      const bp = new BatchProcessor()
      expect(bp.getResults()).toEqual([])
    })

    it('has zero progress initially', () => {
      const bp = new BatchProcessor()
      const progress = bp.getProgress()
      expect(progress.total).toBe(0)
      expect(progress.completed).toBe(0)
      expect(progress.failed).toBe(0)
      expect(progress.inFlight).toBe(0)
    })
  })

  // ─── getConfig ─────────────────────────────────────────────────────────

  describe('getConfig', () => {
    it('returns a copy of the config', () => {
      const bp = new BatchProcessor({ batchSize: 3 })
      const config1 = bp.getConfig()
      const config2 = bp.getConfig()
      expect(config1).toEqual(config2)
      expect(config1).not.toBe(config2)
    })
  })

  // ─── getState ──────────────────────────────────────────────────────────

  describe('getState', () => {
    it('returns idle before processing', () => {
      const bp = new BatchProcessor()
      expect(bp.getState()).toBe<BatchProcessorState>('idle')
    })
  })

  // ─── getProgress ───────────────────────────────────────────────────────

  describe('getProgress', () => {
    it('returns a copy of the progress object', () => {
      const bp = new BatchProcessor()
      const p1 = bp.getProgress()
      const p2 = bp.getProgress()
      expect(p1).toEqual(p2)
      expect(p1).not.toBe(p2)
    })
  })

  // ─── getResults ────────────────────────────────────────────────────────

  describe('getResults', () => {
    it('returns a copy of the results array', () => {
      const bp = new BatchProcessor()
      const r1 = bp.getResults()
      const r2 = bp.getResults()
      expect(r1).toEqual(r2)
      expect(r1).not.toBe(r2)
    })
  })

  // ─── process (sync) ───────────────────────────────────────────────────

  describe('process sync', () => {
    it('processes an empty array and returns empty results', () => {
      const bp = new BatchProcessor()
      const ret = bp.process([], (item) => item.data)
      expect(Array.isArray(ret)).toBe(true)
      const results = ret as BatchResult[]
      expect(results).toEqual([])
      expect(bp.getState()).toBe('completed')
    })

    it('processes a single sync item successfully', () => {
      const bp = new BatchProcessor()
      bp.process([{ id: 'a', data: 42 }], (item) => item.data)
      const results = bp.getResults()
      expect(results).toHaveLength(1)
      expect(results[0]!.id).toBe('a')
      expect(results[0]!.success).toBe(true)
      expect(results[0]!.result).toBe(42)
      expect(results[0]!.error).toBe('')
      expect(bp.getState()).toBe('completed')
    })

    it('processes multiple sync items successfully', () => {
      const bp = new BatchProcessor()
      bp.process(
        [
          { id: 1, data: 'x' },
          { id: 2, data: 'y' },
          { id: 3, data: 'z' },
        ],
        (item) => item.data,
      )
      const results = bp.getResults()
      expect(results).toHaveLength(3)
      expect(results.map((r) => r.result)).toEqual(['x', 'y', 'z'])
      expect(results.every((r) => r.success)).toBe(true)
    })

    it('tracks progress during sync processing', () => {
      const bp = new BatchProcessor()
      bp.process(
        [
          { id: 1, data: 10 },
          { id: 2, data: 20 },
        ],
        (item) => item.data,
      )
      const progress = bp.getProgress()
      expect(progress.total).toBe(2)
      expect(progress.completed).toBe(2)
      expect(progress.estimatedTimeRemaining).toBe(0)
    })

    it('handles sync handler that throws on first item', () => {
      const bp = new BatchProcessor({ continueOnError: true })
      let callCount = 0
      bp.process(
        [
          { id: 'fail', data: null },
          { id: 'ok', data: 1 },
        ],
        () => {
          callCount++
          if (callCount === 1) throw new Error('boom')
          return 'ok'
        },
      )
      const results = bp.getResults()
      expect(results).toHaveLength(2)
      expect(results[0]!.success).toBe(false)
      expect(results[0]!.error).toBe('boom')
      expect(results[1]!.success).toBe(true)
    })

    it('stops on error when continueOnError is false (sync first item)', () => {
      const bp = new BatchProcessor({ continueOnError: false })
      bp.process(
        [
          { id: 'fail', data: null },
          { id: 'ok', data: 1 },
        ],
        () => {
          throw new Error('fail!')
        },
      )
      const results = bp.getResults()
      expect(results).toHaveLength(1)
      expect(results[0]!.success).toBe(false)
      expect(bp.getState()).toBe('error')
    })

    it('stops on error mid-batch when continueOnError is false', () => {
      const bp = new BatchProcessor({ continueOnError: false, batchSize: 2 })
      let count = 0
      bp.process(
        [
          { id: 1, data: 'a' },
          { id: 2, data: 'b' },
          { id: 3, data: 'c' },
        ],
        () => {
          count++
          if (count === 2) throw new Error('mid fail')
          return 'ok'
        },
      )
      const results = bp.getResults()
      expect(results.length).toBe(2)
      expect(results[1]!.success).toBe(false)
      expect(bp.getState()).toBe('error')
    })

    it('captures non-Error thrown values as error strings', () => {
      const bp = new BatchProcessor({ continueOnError: true })
      bp.process([{ id: 'x', data: null }], () => {
        throw 'string error'
      })
      const results = bp.getResults()
      expect(results[0]!.success).toBe(false)
      expect(results[0]!.error).toBe('string error')
    })

    it('records duration for sync items', () => {
      const bp = new BatchProcessor()
      bp.process([{ id: 1, data: 'hello' }], (item) => item.data)
      const results = bp.getResults()
      expect(results[0]!.duration).toBeGreaterThanOrEqual(0)
    })

    it('respects batchSize for sync processing', () => {
      const bp = new BatchProcessor({ batchSize: 2 })
      bp.process(
        [
          { id: 1, data: 'a' },
          { id: 2, data: 'b' },
          { id: 3, data: 'c' },
          { id: 4, data: 'd' },
          { id: 5, data: 'e' },
        ],
        (item) => item.data,
      )
      const results = bp.getResults()
      expect(results).toHaveLength(5)
      expect(results.every((r) => r.success)).toBe(true)
    })

    it('retries on sync failure up to retry count', () => {
      let attempts = 0
      const bp = new BatchProcessor({ retries: 2, continueOnError: true })
      bp.process([{ id: 1, data: null }], () => {
        attempts++
        if (attempts <= 2) throw new Error('retry me')
        return 'finally'
      })
      const results = bp.getResults()
      expect(results[0]!.success).toBe(true)
      expect(results[0]!.result).toBe('finally')
    })

    it('retries sync items in remaining batch', () => {
      let secondItemAttempts = 0
      const bp = new BatchProcessor({ retries: 2, continueOnError: true })
      bp.process(
        [
          { id: 1, data: 'first' },
          { id: 2, data: 'second' },
        ],
        (item) => {
          if (item.id === 2) {
            secondItemAttempts++
            if (secondItemAttempts <= 2) throw new Error('retry')
          }
          return item.data
        },
      )
      const results = bp.getResults()
      expect(results).toHaveLength(2)
      expect(results[1]!.success).toBe(true)
    })
  })

  // ─── process (async) ──────────────────────────────────────────────────

  describe('process async', () => {
    it('processes a single async item successfully', async () => {
      const bp = new BatchProcessor()
      const items: BatchItem[] = [{ id: 'a', data: 42 }]
      const results = await bp.process(items, (item) =>
        Promise.resolve(item.data),
      )
      expect(results).toHaveLength(1)
      expect(results[0]!.success).toBe(true)
      expect(results[0]!.result).toBe(42)
      expect(bp.getState()).toBe('completed')
    })

    it('processes multiple async items', async () => {
      const bp = new BatchProcessor({ concurrency: 2 })
      const items: BatchItem[] = [
        { id: 1, data: 'x' },
        { id: 2, data: 'y' },
        { id: 3, data: 'z' },
      ]
      const results = await bp.process(items, (item) =>
        Promise.resolve(item.data),
      )
      expect(results).toHaveLength(3)
      expect(results.map((r) => r.result)).toEqual(['x', 'y', 'z'])
    })

    it('handles async rejection on first item with continueOnError', async () => {
      const bp = new BatchProcessor({ continueOnError: true })
      let callCount = 0
      const results = await bp.process(
        [
          { id: 'fail', data: null },
          { id: 'ok', data: 1 },
        ],
        () => {
          callCount++
          if (callCount === 1) return Promise.reject(new Error('async fail'))
          return Promise.resolve('ok')
        },
      )
      expect(results).toHaveLength(2)
      expect(results[0]!.success).toBe(false)
      expect(results[0]!.error).toBe('async fail')
      expect(results[1]!.success).toBe(true)
    })

    it('stops on async error when continueOnError is false', async () => {
      const bp = new BatchProcessor({ continueOnError: false })
      const results = await bp.process(
        [
          { id: 'fail', data: null },
          { id: 'ok', data: 1 },
        ],
        () => Promise.reject(new Error('nope')),
      )
      expect(results).toHaveLength(1)
      expect(results[0]!.success).toBe(false)
      expect(bp.getState()).toBe('error')
    })

    it('times out on slow async handler', async () => {
      const bp = new BatchProcessor({ timeout: 50 })
      const results = await bp.process(
        [{ id: 'slow', data: null }],
        () => new Promise((resolve) => setTimeout(() => resolve('late'), 500)),
      )
      expect(results).toHaveLength(1)
      expect(results[0]!.success).toBe(false)
      expect(results[0]!.error).toBe('Batch item timeout')
    })

    it('retries async items on failure', async () => {
      let attempt = 0
      const bp = new BatchProcessor({ retries: 2, retryDelay: 10 })
      const results = await bp.process([{ id: 1, data: null }], () => {
        attempt++
        if (attempt <= 1) return Promise.reject(new Error('retry'))
        return Promise.resolve('recovered')
      })
      expect(results[0]!.success).toBe(true)
      expect(results[0]!.result).toBe('recovered')
    })

    it('records duration for async items', async () => {
      const bp = new BatchProcessor()
      const results = await bp.process(
        [{ id: 1, data: 'hello' }],
        (item) => Promise.resolve(item.data),
      )
      expect(results[0]!.duration).toBeGreaterThanOrEqual(0)
    })

    it('handles non-Error async rejection', async () => {
      const bp = new BatchProcessor({ continueOnError: true, retries: 0 })
      const results = await bp.process(
        [{ id: 1, data: null }],
        () => Promise.reject('raw string'),
      )
      expect(results[0]!.success).toBe(false)
      expect(results[0]!.error).toBe('raw string')
    })
  })

  // ─── processBatch (sync) ──────────────────────────────────────────────

  describe('processBatch sync', () => {
    it('processes an empty array and returns empty results', () => {
      const bp = new BatchProcessor()
      const ret = bp.processBatch([], (item) => item.data)
      expect(Array.isArray(ret)).toBe(true)
      expect(ret as BatchResult[]).toEqual([])
      expect(bp.getState()).toBe('completed')
    })

    it('processes a single sync item', () => {
      const bp = new BatchProcessor()
      bp.processBatch([{ id: 'a', data: 99 }], (item) => item.data)
      const results = bp.getResults()
      expect(results).toHaveLength(1)
      expect(results[0]!.success).toBe(true)
      expect(results[0]!.result).toBe(99)
    })

    it('processes multiple sync items', () => {
      const bp = new BatchProcessor()
      bp.processBatch(
        [
          { id: 1, data: 'a' },
          { id: 2, data: 'b' },
          { id: 3, data: 'c' },
        ],
        (item) => item.data,
      )
      const results = bp.getResults()
      expect(results).toHaveLength(3)
      expect(results.every((r) => r.success)).toBe(true)
    })

    it('handles error on first item with continueOnError true', () => {
      const bp = new BatchProcessor({ continueOnError: true })
      let callCount = 0
      bp.processBatch(
        [
          { id: 'fail', data: null },
          { id: 'ok', data: 1 },
        ],
        () => {
          callCount++
          if (callCount === 1) throw new Error('batch fail')
          return 'ok'
        },
      )
      const results = bp.getResults()
      expect(results).toHaveLength(2)
      expect(results[0]!.success).toBe(false)
      expect(results[1]!.success).toBe(true)
    })

    it('stops on first error with continueOnError false', () => {
      const bp = new BatchProcessor({ continueOnError: false })
      bp.processBatch(
        [
          { id: 'fail', data: null },
          { id: 'ok', data: 1 },
        ],
        () => {
          throw new Error('stop')
        },
      )
      const results = bp.getResults()
      expect(results).toHaveLength(1)
      expect(bp.getState()).toBe('error')
    })
  })

  // ─── processBatch (async) ─────────────────────────────────────────────

  describe('processBatch async', () => {
    it('processes async items', async () => {
      const bp = new BatchProcessor({ concurrency: 2 })
      const results = await bp.processBatch(
        [
          { id: 1, data: 'a' },
          { id: 2, data: 'b' },
        ],
        (item) => Promise.resolve(item.data),
      )
      expect(results).toHaveLength(2)
      expect(results.every((r) => r.success)).toBe(true)
    })

    it('handles async rejection with continueOnError false', async () => {
      const bp = new BatchProcessor({ continueOnError: false })
      const results = await bp.processBatch(
        [
          { id: 'fail', data: null },
          { id: 'ok', data: 1 },
        ],
        () => Promise.reject(new Error('batch async fail')),
      )
      expect(results).toHaveLength(1)
      expect(results[0]!.success).toBe(false)
      expect(bp.getState()).toBe('error')
    })

    it('processes batch with concurrency > 1', async () => {
      const bp = new BatchProcessor({ concurrency: 3 })
      const results = await bp.processBatch(
        [
          { id: 1, data: 'a' },
          { id: 2, data: 'b' },
          { id: 3, data: 'c' },
          { id: 4, data: 'd' },
          { id: 5, data: 'e' },
        ],
        (item) => Promise.resolve(item.data),
      )
      expect(results).toHaveLength(5)
    })

    it('handles timeout in batch processing', async () => {
      const bp = new BatchProcessor({ timeout: 50 })
      const results = await bp.processBatch(
        [{ id: 1, data: null }],
        () => new Promise((resolve) => setTimeout(() => resolve('late'), 500)),
      )
      expect(results[0]!.success).toBe(false)
      expect(results[0]!.error).toBe('Batch item timeout')
    })
  })

  // ─── getSuccessfulResults ──────────────────────────────────────────────

  describe('getSuccessfulResults', () => {
    it('returns only successful results after mixed sync processing', () => {
      const bp = new BatchProcessor({ continueOnError: true })
      let count = 0
      bp.process(
        [
          { id: 1, data: 'ok' },
          { id: 2, data: 'ok' },
          { id: 3, data: 'fail' },
        ],
        () => {
          count++
          if (count === 3) throw new Error('fail')
          return 'ok'
        },
      )
      const successful = bp.getSuccessfulResults()
      expect(successful).toHaveLength(2)
      expect(successful.every((r) => r.success)).toBe(true)
    })

    it('returns empty array when no results', () => {
      const bp = new BatchProcessor()
      expect(bp.getSuccessfulResults()).toEqual([])
    })
  })

  // ─── getFailedResults ──────────────────────────────────────────────────

  describe('getFailedResults', () => {
    it('returns only failed results after mixed sync processing', () => {
      const bp = new BatchProcessor({ continueOnError: true })
      let count = 0
      bp.process(
        [
          { id: 1, data: 'ok' },
          { id: 2, data: 'fail' },
        ],
        () => {
          count++
          if (count === 2) throw new Error('fail')
          return 'ok'
        },
      )
      const failed = bp.getFailedResults()
      expect(failed).toHaveLength(1)
      expect(failed[0]!.success).toBe(false)
    })

    it('returns empty array when all succeed', () => {
      const bp = new BatchProcessor()
      bp.process([{ id: 1, data: 'ok' }], () => 'ok')
      expect(bp.getFailedResults()).toEqual([])
    })
  })

  // ─── getStatistics ─────────────────────────────────────────────────────

  describe('getStatistics', () => {
    it('returns zeros before processing', () => {
      const bp = new BatchProcessor()
      const stats = bp.getStatistics()
      expect(stats.total).toBe(0)
      expect(stats.succeeded).toBe(0)
      expect(stats.failed).toBe(0)
      expect(stats.averageDuration).toBe(0)
      expect(stats.totalDuration).toBe(0)
    })

    it('returns correct stats after sync processing', () => {
      const bp = new BatchProcessor({ continueOnError: true })
      let count = 0
      bp.process(
        [
          { id: 1, data: 'a' },
          { id: 2, data: 'b' },
          { id: 3, data: 'c' },
        ],
        () => {
          count++
          if (count === 2) throw new Error('fail')
          return 'ok'
        },
      )
      const stats = bp.getStatistics()
      expect(stats.total).toBe(3)
      expect(stats.succeeded).toBe(2)
      expect(stats.failed).toBe(1)
      expect(stats.totalDuration).toBeGreaterThanOrEqual(0)
      expect(stats.averageDuration).toBeGreaterThanOrEqual(0)
    })

    it('calculates averageDuration correctly', () => {
      const bp = new BatchProcessor()
      bp.process([{ id: 1, data: 'a' }], () => 'ok')
      const stats = bp.getStatistics()
      expect(stats.averageDuration).toBe(stats.totalDuration / stats.total)
    })
  })

  // ─── reset ─────────────────────────────────────────────────────────────

  describe('reset', () => {
    it('resets state to idle after processing', () => {
      const bp = new BatchProcessor()
      bp.process([{ id: 1, data: 'a' }], () => 'ok')
      expect(bp.getState()).toBe('completed')
      bp.reset()
      expect(bp.getState()).toBe('idle')
    })

    it('clears results after reset', () => {
      const bp = new BatchProcessor()
      bp.process([{ id: 1, data: 'a' }], () => 'ok')
      expect(bp.getResults()).toHaveLength(1)
      bp.reset()
      expect(bp.getResults()).toEqual([])
    })

    it('resets progress after reset', () => {
      const bp = new BatchProcessor()
      bp.process([{ id: 1, data: 'a' }], () => 'ok')
      bp.reset()
      const progress = bp.getProgress()
      expect(progress.total).toBe(0)
      expect(progress.completed).toBe(0)
      expect(progress.failed).toBe(0)
    })

    it('allows re-processing after reset', () => {
      const bp = new BatchProcessor()
      bp.process([{ id: 1, data: 'first' }], () => 'ok')
      bp.reset()
      expect(bp.getState()).toBe('idle')
      bp.process([{ id: 2, data: 'second' }], () => 'ok2')
      const results = bp.getResults()
      expect(results).toHaveLength(1)
      expect(results[0]!.result).toBe('ok2')
    })
  })

  // ─── pause ─────────────────────────────────────────────────────────────

  describe('pause', () => {
    it('changes state from running to paused', () => {
      const bp = new BatchProcessor()
      const items: BatchItem[] = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        data: i,
      }))
      const promise = bp.process(items, (item) =>
        new Promise((resolve) => setTimeout(() => resolve(item.data), 50)),
      )
      if (bp.getState() === 'running') {
        bp.pause()
        expect(bp.getState()).toBe('paused')
      }
      bp.cancel()
      void promise
    })

    it('does nothing when already idle', () => {
      const bp = new BatchProcessor()
      bp.pause()
      expect(bp.getState()).toBe('idle')
    })

    it('does nothing when already completed', () => {
      const bp = new BatchProcessor()
      bp.process([{ id: 1, data: 'a' }], () => 'ok')
      bp.pause()
      expect(bp.getState()).toBe('completed')
    })
  })

  // ─── resume ────────────────────────────────────────────────────────────

  describe('resume', () => {
    it('does nothing when state is idle', () => {
      const bp = new BatchProcessor()
      bp.resume()
      expect(bp.getState()).toBe('idle')
    })

    it('does nothing when state is completed', () => {
      const bp = new BatchProcessor()
      bp.process([{ id: 1, data: 'a' }], () => 'ok')
      bp.resume()
      expect(bp.getState()).toBe('completed')
    })
  })

  // ─── cancel ────────────────────────────────────────────────────────────

  describe('cancel', () => {
    it('sets state to error when running', () => {
      const bp = new BatchProcessor()
      const items: BatchItem[] = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        data: i,
      }))
      const promise = bp.process(items, (item) =>
        new Promise((resolve) => setTimeout(() => resolve(item.data), 50)),
      )
      if (bp.getState() === 'running') {
        bp.cancel()
        expect(bp.getState()).toBe('error')
      } else {
        bp.cancel()
      }
      void promise
    })

    it('sets state to error when paused', async () => {
      const bp = new BatchProcessor()
      const items: BatchItem[] = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        data: i,
      }))
      const promise = bp.process(items, (item) =>
        new Promise((resolve) => setTimeout(() => resolve(item.data), 50)),
      )
      bp.pause()
      if (bp.getState() === 'paused') {
        bp.cancel()
        expect(bp.getState()).toBe('error')
      }
      void promise
    })

    it('cancel from idle does not change state', () => {
      const bp = new BatchProcessor()
      bp.cancel()
      expect(bp.getState()).toBe('idle')
    })

    it('cancel from completed does not change state', () => {
      const bp = new BatchProcessor()
      bp.process([{ id: 1, data: 'a' }], () => 'ok')
      bp.cancel()
      expect(bp.getState()).toBe('completed')
    })
  })

  // ─── onProgress callback ───────────────────────────────────────────────

  describe('onProgress callback', () => {
    it('invokes onProgress callback during sync processing', () => {
      const progressCalls: BatchProgress[] = []
      const bp = new BatchProcessor({
        onProgress: (p) => progressCalls.push(p),
      })
      bp.process(
        [
          { id: 1, data: 'a' },
          { id: 2, data: 'b' },
        ],
        (item) => item.data,
      )
      expect(progressCalls.length).toBeGreaterThan(0)
    })

    it('invokes onProgress for empty items', () => {
      const progressCalls: BatchProgress[] = []
      const bp = new BatchProcessor({
        onProgress: (p) => progressCalls.push(p),
      })
      bp.process([], () => undefined)
      expect(progressCalls.length).toBeGreaterThan(0)
    })

    it('passes progress copies to callback', () => {
      const progressCalls: BatchProgress[] = []
      const bp = new BatchProcessor({
        onProgress: (p) => progressCalls.push(p),
      })
      bp.process([{ id: 1, data: 'a' }], () => 'ok')
      if (progressCalls.length >= 2) {
        expect(progressCalls[0]).not.toBe(progressCalls[1])
      }
    })

    it('invokes onProgress during async processing', async () => {
      const progressCalls: BatchProgress[] = []
      const bp = new BatchProcessor({
        onProgress: (p) => progressCalls.push(p),
      })
      await bp.process(
        [{ id: 1, data: 'a' }],
        (item) => Promise.resolve(item.data),
      )
      expect(progressCalls.length).toBeGreaterThan(0)
    })
  })

  // ─── Pause and Resume integration ─────────────────────────────────────

  describe('pause and resume integration', () => {
    it('pauses and resumes async processing', async () => {
      const bp = new BatchProcessor({ concurrency: 1 })
      const order: string[] = []
      const items: BatchItem[] = Array.from({ length: 5 }, (_, i) => ({
        id: i,
        data: i,
      }))

      const promise = bp.process(items, (item) => {
        order.push(String(item.id))
        return new Promise((resolve) =>
          setTimeout(() => resolve(item.data), 30),
        )
      })

      // Wait a bit then pause
      await new Promise((r) => setTimeout(r, 60))
      bp.pause()
      expect(bp.getState()).toBe('paused')

      // Wait while paused
      await new Promise((r) => setTimeout(r, 100))

      // Resume
      bp.resume()
      expect(bp.getState()).toBe('running')

      const results = await promise
      expect(results.length).toBeGreaterThan(0)
    })
  })

  // ─── DEFAULT_BATCH_CONFIG ──────────────────────────────────────────────

  describe('DEFAULT_BATCH_CONFIG', () => {
    it('has expected default values', () => {
      expect(DEFAULT_BATCH_CONFIG.batchSize).toBe(10)
      expect(DEFAULT_BATCH_CONFIG.concurrency).toBe(1)
      expect(DEFAULT_BATCH_CONFIG.retries).toBe(0)
      expect(DEFAULT_BATCH_CONFIG.retryDelay).toBe(100)
      expect(DEFAULT_BATCH_CONFIG.timeout).toBe(30000)
      expect(DEFAULT_BATCH_CONFIG.continueOnError).toBe(true)
    })
  })

  // ─── BatchItem IDs ─────────────────────────────────────────────────────

  describe('BatchItem IDs', () => {
    it('supports string IDs', () => {
      const bp = new BatchProcessor()
      bp.process(
        [
          { id: 'alpha', data: 1 },
          { id: 'beta', data: 2 },
        ],
        (item) => item.data,
      )
      const results = bp.getResults()
      expect(results[0]!.id).toBe('alpha')
      expect(results[1]!.id).toBe('beta')
    })

    it('supports numeric IDs', () => {
      const bp = new BatchProcessor()
      bp.process(
        [
          { id: 100, data: 'a' },
          { id: 200, data: 'b' },
        ],
        (item) => item.data,
      )
      const results = bp.getResults()
      expect(results[0]!.id).toBe(100)
      expect(results[1]!.id).toBe(200)
    })
  })

  // ─── BatchResult shape ─────────────────────────────────────────────────

  describe('BatchResult shape', () => {
    it('has correct shape for successful result', () => {
      const bp = new BatchProcessor()
      bp.process([{ id: 'x', data: 'val' }], () => 'result')
      const result = bp.getResults()[0]!
      expect(result).toMatchObject({
        id: 'x',
        success: true,
        result: 'result',
        error: '',
      })
      expect(result.duration).toBeTypeOf('number')
    })

    it('has correct shape for failed result', () => {
      const bp = new BatchProcessor({ continueOnError: true })
      bp.process([{ id: 'x', data: null }], () => {
        throw new Error('bad')
      })
      const result = bp.getResults()[0]!
      expect(result).toMatchObject({
        id: 'x',
        success: false,
        result: undefined,
        error: 'bad',
      })
      expect(result.duration).toBeTypeOf('number')
    })
  })

  // ─── Edge Cases ────────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles batchSize larger than item count', () => {
      const bp = new BatchProcessor({ batchSize: 100 })
      bp.process(
        [
          { id: 1, data: 'a' },
          { id: 2, data: 'b' },
        ],
        (item) => item.data,
      )
      expect(bp.getResults()).toHaveLength(2)
    })

    it('handles batchSize of 1', () => {
      const bp = new BatchProcessor({ batchSize: 1 })
      bp.process(
        [
          { id: 1, data: 'a' },
          { id: 2, data: 'b' },
          { id: 3, data: 'c' },
        ],
        (item) => item.data,
      )
      expect(bp.getResults()).toHaveLength(3)
    })

    it('handles concurrency larger than item count', async () => {
      const bp = new BatchProcessor({ concurrency: 100 })
      const results = await bp.process(
        [
          { id: 1, data: 'a' },
          { id: 2, data: 'b' },
        ],
        (item) => Promise.resolve(item.data),
      )
      expect(results).toHaveLength(2)
    })

    it('handles handler returning undefined', () => {
      const bp = new BatchProcessor()
      bp.process([{ id: 1, data: null }], () => undefined)
      const results = bp.getResults()
      expect(results[0]!.success).toBe(true)
      expect(results[0]!.result).toBeUndefined()
    })

    it('handles handler returning null', () => {
      const bp = new BatchProcessor()
      bp.process([{ id: 1, data: null }], () => null)
      const results = bp.getResults()
      expect(results[0]!.success).toBe(true)
      expect(results[0]!.result).toBeNull()
    })

    it('handles large number of sync items', () => {
      const bp = new BatchProcessor({ batchSize: 5 })
      const items: BatchItem[] = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        data: i * 2,
      }))
      bp.process(items, (item) => item.data)
      const results = bp.getResults()
      expect(results).toHaveLength(100)
      expect(results.every((r) => r.success)).toBe(true)
    })

    it('handles mixed success and failure across batches', () => {
      const bp = new BatchProcessor({
        batchSize: 2,
        continueOnError: true,
        retries: 0,
      })
      const items: BatchItem[] = Array.from({ length: 6 }, (_, i) => ({
        id: i,
        data: i,
      }))
      bp.process(items, (item) => {
        if ((item.id as number) % 2 === 1) throw new Error('odd')
        return item.data
      })
      const results = bp.getResults()
      expect(results).toHaveLength(6)
      const successful = results.filter((r) => r.success)
      const failed = results.filter((r) => !r.success)
      expect(successful).toHaveLength(3)
      expect(failed).toHaveLength(3)
    })

    it('can process again after previous completed run', () => {
      const bp = new BatchProcessor()
      bp.process([{ id: 1, data: 'first' }], () => 'a')
      expect(bp.getResults()).toHaveLength(1)
      expect(bp.getState()).toBe('completed')

      bp.process([{ id: 2, data: 'second' }], () => 'b')
      const results = bp.getResults()
      expect(results).toHaveLength(1)
      expect(results[0]!.result).toBe('b')
    })

    it('handles handler returning complex objects', () => {
      const bp = new BatchProcessor()
      const obj = { nested: { deep: [1, 2, 3] } }
      bp.process([{ id: 1, data: null }], () => obj)
      const results = bp.getResults()
      expect(results[0]!.result).toEqual(obj)
    })

    it('cancel mid-async stops processing further items', async () => {
      const bp = new BatchProcessor({ concurrency: 1 })
      const processedIds: number[] = []
      const items: BatchItem[] = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        data: i,
      }))

      const promise = bp.process(items, (item) => {
        processedIds.push(item.id as number)
        return new Promise((resolve) =>
          setTimeout(() => resolve(item.data), 30),
        )
      })

      await new Promise((r) => setTimeout(r, 80))
      bp.cancel()

      const results = await promise
      // Should have stopped before processing all items
      expect(results.length).toBeLessThan(10)
      expect(bp.getState()).toBe('error')
    })

    it('handles zero retries', () => {
      const bp = new BatchProcessor({ retries: 0, continueOnError: true })
      let attempts = 0
      bp.process([{ id: 1, data: null }], () => {
        attempts++
        throw new Error('no retry')
      })
      expect(attempts).toBe(1)
    })

    it('handles async handler returning a value directly (non-promise)', async () => {
      const bp = new BatchProcessor()
      const items: BatchItem[] = [{ id: 1, data: 'sync' }]
      const results = await bp.process(items, (item) => item.data)
      expect(results).toHaveLength(1)
      expect(results[0]!.success).toBe(true)
    })
  })

  // ─── Type exports ──────────────────────────────────────────────────────

  describe('type exports', () => {
    it('BatchItem accepts valid shapes', () => {
      const item1: BatchItem = { id: 'str', data: 42 }
      const item2: BatchItem = { id: 42, data: { foo: 'bar' } }
      expect(item1.id).toBe('str')
      expect(item2.id).toBe(42)
    })

    it('BatchProgress has expected fields', () => {
      const bp = new BatchProcessor()
      const progress: BatchProgress = bp.getProgress()
      expect(progress).toHaveProperty('total')
      expect(progress).toHaveProperty('completed')
      expect(progress).toHaveProperty('failed')
      expect(progress).toHaveProperty('inFlight')
      expect(progress).toHaveProperty('startTime')
      expect(progress).toHaveProperty('estimatedTimeRemaining')
    })

    it('BatchProcessorState covers all states', () => {
      const states: BatchProcessorState[] = [
        'idle',
        'running',
        'paused',
        'completed',
        'error',
      ]
      expect(states).toHaveLength(5)
    })
  })

  // ─── State transitions ─────────────────────────────────────────────────

  describe('state transitions', () => {
    it('transitions idle -> running -> completed for sync', () => {
      const bp = new BatchProcessor()
      expect(bp.getState()).toBe('idle')
      bp.process([{ id: 1, data: 'a' }], () => 'ok')
      expect(bp.getState()).toBe('completed')
    })

    it('transitions idle -> running -> completed for async', async () => {
      const bp = new BatchProcessor()
      const promise = bp.process(
        [{ id: 1, data: 'a' }],
        (item) => Promise.resolve(item.data),
      )
      // May be running or already completed by now
      const state = bp.getState()
      expect(state === 'running' || state === 'completed').toBe(true)
      await promise
      expect(bp.getState()).toBe('completed')
    })

    it('transitions to error on sync failure with continueOnError false', () => {
      const bp = new BatchProcessor({ continueOnError: false })
      bp.process([{ id: 1, data: null }], () => {
        throw new Error('fail')
      })
      expect(bp.getState()).toBe('error')
    })

    it('transitions to completed even with failures when continueOnError true', () => {
      const bp = new BatchProcessor({ continueOnError: true })
      bp.process(
        [{ id: 1, data: null }],
        () => {
          throw new Error('fail')
        },
      )
      expect(bp.getState()).toBe('completed')
    })

    it('reset restores to idle from completed', () => {
      const bp = new BatchProcessor()
      bp.process([{ id: 1, data: 'a' }], () => 'ok')
      expect(bp.getState()).toBe('completed')
      bp.reset()
      expect(bp.getState()).toBe('idle')
    })

    it('reset restores to idle from error', () => {
      const bp = new BatchProcessor({ continueOnError: false })
      bp.process([{ id: 1, data: null }], () => {
        throw new Error('fail')
      })
      expect(bp.getState()).toBe('error')
      bp.reset()
      expect(bp.getState()).toBe('idle')
    })
  })
})
