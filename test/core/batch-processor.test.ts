import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BatchProcessor } from '../../src/core/batch-processor/batch-processor.js'
import { DEFAULT_BATCH_CONFIG } from '../../src/core/batch-processor/types.js'
import type { BatchItem, BatchResult, BatchConfig, BatchProgress } from '../../src/core/batch-processor/types.js'

function makeItem(overrides: Partial<BatchItem> = {}): BatchItem {
  return { id: overrides.id ?? '1', data: overrides.data ?? 'test' }
}

describe('BatchProcessor - Construction', () => {
  it('should use default config values', () => {
    const bp = new BatchProcessor()
    const config = bp.getConfig()
    expect(config.batchSize).toBe(DEFAULT_BATCH_CONFIG.batchSize)
    expect(config.concurrency).toBe(DEFAULT_BATCH_CONFIG.concurrency)
    expect(config.retries).toBe(DEFAULT_BATCH_CONFIG.retries)
    expect(config.retryDelay).toBe(DEFAULT_BATCH_CONFIG.retryDelay)
    expect(config.timeout).toBe(DEFAULT_BATCH_CONFIG.timeout)
    expect(config.continueOnError).toBe(DEFAULT_BATCH_CONFIG.continueOnError)
  })

  it('should accept custom config', () => {
    const bp = new BatchProcessor({ batchSize: 5, concurrency: 3, retries: 2, timeout: 5000 })
    const config = bp.getConfig()
    expect(config.batchSize).toBe(5)
    expect(config.concurrency).toBe(3)
    expect(config.retries).toBe(2)
    expect(config.timeout).toBe(5000)
  })

  it('should merge partial config with defaults', () => {
    const bp = new BatchProcessor({ batchSize: 20 })
    const config = bp.getConfig()
    expect(config.batchSize).toBe(20)
    expect(config.concurrency).toBe(DEFAULT_BATCH_CONFIG.concurrency)
    expect(config.timeout).toBe(DEFAULT_BATCH_CONFIG.timeout)
  })

  it('should return a copy from getConfig', () => {
    const bp = new BatchProcessor()
    const config = bp.getConfig()
    config.batchSize = 999
    expect(bp.getConfig().batchSize).toBe(DEFAULT_BATCH_CONFIG.batchSize)
  })

  it('should start in idle state', () => {
    const bp = new BatchProcessor()
    expect(bp.getState()).toBe('idle')
  })
})

describe('BatchProcessor - Processing - Sync', () => {
  it('should process a single item synchronously', () => {
    const bp = new BatchProcessor()
    const items = [makeItem({ id: '1', data: 'hello' })]
    const results = bp.process(items, (item) => item.data) as BatchResult[]
    expect(results).toHaveLength(1)
    expect(results[0]!.success).toBe(true)
    expect(results[0]!.result).toBe('hello')
  })

  it('should process multiple items synchronously', () => {
    const bp = new BatchProcessor()
    const items = [
      makeItem({ id: '1', data: 'a' }),
      makeItem({ id: '2', data: 'b' }),
      makeItem({ id: '3', data: 'c' }),
    ]
    const results = bp.process(items, (item) => item.data) as BatchResult[]
    expect(results).toHaveLength(3)
    expect(results[0]!.result).toBe('a')
    expect(results[1]!.result).toBe('b')
    expect(results[2]!.result).toBe('c')
  })

  it('should return empty array for empty input', () => {
    const bp = new BatchProcessor()
    const results = bp.process([], (item) => item.data) as BatchResult[]
    expect(results).toHaveLength(0)
    expect(bp.getState()).toBe('completed')
  })

  it('should pass correct item to handler', () => {
    const bp = new BatchProcessor()
    const received: BatchItem[] = []
    const items = [makeItem({ id: 'x', data: 42 })]
    bp.process(items, (item) => { received.push(item); return item.data }) as BatchResult[]
    expect(received).toHaveLength(1)
    expect(received[0]!.id).toBe('x')
    expect(received[0]!.data).toBe(42)
  })

  it('should preserve item order in results', () => {
    const bp = new BatchProcessor()
    const items = Array.from({ length: 10 }, (_, i) => makeItem({ id: i, data: i }))
    const results = bp.process(items, (item) => item.data) as BatchResult[]
    expect(results.map((r) => r.result)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('should handle handler returning undefined', () => {
    const bp = new BatchProcessor()
    const results = bp.process([makeItem()], () => undefined) as BatchResult[]
    expect(results[0]!.success).toBe(true)
    expect(results[0]!.result).toBeUndefined()
  })

  it('should handle handler returning null', () => {
    const bp = new BatchProcessor()
    const results = bp.process([makeItem()], () => null) as BatchResult[]
    expect(results[0]!.success).toBe(true)
    expect(results[0]!.result).toBeNull()
  })

  it('should handle handler returning complex object', () => {
    const bp = new BatchProcessor()
    const obj = { name: 'test', nested: { value: [1, 2, 3] } }
    const results = bp.process([makeItem()], () => obj) as BatchResult[]
    expect(results[0]!.result).toEqual(obj)
  })

  it('should record duration for each result', () => {
    const bp = new BatchProcessor()
    const results = bp.process([makeItem()], () => 'done') as BatchResult[]
    expect(results[0]!.duration).toBeGreaterThanOrEqual(0)
  })

  it('should handle large number of items synchronously', () => {
    const bp = new BatchProcessor()
    const items = Array.from({ length: 100 }, (_, i) => makeItem({ id: i, data: i }))
    const results = bp.process(items, (item) => item.data) as BatchResult[]
    expect(results).toHaveLength(100)
    expect(results.every((r) => r.success)).toBe(true)
  })
})

describe('BatchProcessor - Processing - Async', () => {
  it('should process items with async handler', async () => {
    const bp = new BatchProcessor()
    const items = [makeItem({ id: '1', data: 'hello' })]
    const results = await bp.process(items, async (item) => item.data)
    expect(results).toHaveLength(1)
    expect(results[0]!.success).toBe(true)
    expect(results[0]!.result).toBe('hello')
  })

  it('should process single item with async handler', async () => {
    const bp = new BatchProcessor()
    const results = await bp.process([makeItem()], async () => Promise.resolve('val'))
    expect(results[0]!.success).toBe(true)
    expect(results[0]!.result).toBe('val')
  })

  it('should handle async handler returning values', async () => {
    const bp = new BatchProcessor()
    const items = [makeItem({ id: '1', data: 10 }), makeItem({ id: '2', data: 20 })]
    const results = await bp.process(items, async (item) => (item.data as number) * 2)
    expect(results[0]!.result).toBe(20)
    expect(results[1]!.result).toBe(40)
  })

  it('should process multiple async items', async () => {
    const bp = new BatchProcessor()
    const items = Array.from({ length: 5 }, (_, i) => makeItem({ id: i, data: i }))
    const results = await bp.process(items, async (item) => item.data)
    expect(results).toHaveLength(5)
  })

  it('should await resolved promises', async () => {
    const bp = new BatchProcessor()
    const results = await bp.process([makeItem()], async () => Promise.resolve(42))
    expect(results[0]!.result).toBe(42)
  })

  it('should handle async handler with batching', async () => {
    const bp = new BatchProcessor({ batchSize: 2 })
    const items = Array.from({ length: 6 }, (_, i) => makeItem({ id: i, data: i }))
    const results = await bp.process(items, async (item) => item.data)
    expect(results).toHaveLength(6)
    expect(results.map((r) => r.result)).toEqual([0, 1, 2, 3, 4, 5])
  })
})

describe('BatchProcessor - Batch Splitting', () => {
  it('should split 10 items into 4 batches with batchSize 3', () => {
    const bp = new BatchProcessor({ batchSize: 3 })
    const items = Array.from({ length: 10 }, (_, i) => makeItem({ id: i, data: i }))
    const results = bp.process(items, (item) => item.data) as BatchResult[]
    expect(results).toHaveLength(10)
    expect(bp.getState()).toBe('completed')
  })

  it('should handle single item batch', () => {
    const bp = new BatchProcessor({ batchSize: 10 })
    const results = bp.process([makeItem()], (item) => item.data) as BatchResult[]
    expect(results).toHaveLength(1)
  })

  it('should handle batch size larger than items', () => {
    const bp = new BatchProcessor({ batchSize: 100 })
    const items = [makeItem({ id: '1', data: 'a' }), makeItem({ id: '2', data: 'b' })]
    const results = bp.process(items, (item) => item.data) as BatchResult[]
    expect(results).toHaveLength(2)
  })

  it('should handle exact batch size match', () => {
    const bp = new BatchProcessor({ batchSize: 3 })
    const items = Array.from({ length: 6 }, (_, i) => makeItem({ id: i, data: i }))
    const results = bp.process(items, (item) => item.data) as BatchResult[]
    expect(results).toHaveLength(6)
  })

  it('should handle batch size of 1', () => {
    const bp = new BatchProcessor({ batchSize: 1 })
    const items = Array.from({ length: 5 }, (_, i) => makeItem({ id: i, data: i }))
    const results = bp.process(items, (item) => item.data) as BatchResult[]
    expect(results).toHaveLength(5)
  })

  it('should handle all items in one batch', () => {
    const bp = new BatchProcessor({ batchSize: 50 })
    const items = Array.from({ length: 10 }, (_, i) => makeItem({ id: i, data: i }))
    const results = bp.process(items, (item) => item.data) as BatchResult[]
    expect(results).toHaveLength(10)
  })
})

describe('BatchProcessor - Concurrency', () => {
  it('should process sequentially with concurrency 1', async () => {
    const bp = new BatchProcessor({ concurrency: 1 })
    const order: number[] = []
    const items = Array.from({ length: 3 }, (_, i) => makeItem({ id: i, data: i }))
    await bp.process(items, async (item) => {
      order.push(item.id as number)
      await new Promise<void>((r) => setTimeout(r, 20))
      return item.data
    })
    expect(order).toEqual([0, 1, 2])
  })

  it('should process in parallel within batch with concurrency > 1', async () => {
    let maxConcurrent = 0
    let current = 0
    const bp = new BatchProcessor({ concurrency: 3, batchSize: 10 })
    const items = Array.from({ length: 6 }, (_, i) => makeItem({ id: i, data: i }))
    await bp.process(items, async (item) => {
      current++
      maxConcurrent = Math.max(maxConcurrent, current)
      await new Promise<void>((r) => setTimeout(r, 30))
      current--
      return item.data
    })
    expect(maxConcurrent).toBeGreaterThanOrEqual(2)
  })

  it('should respect concurrency limit', async () => {
    let maxConcurrent = 0
    let current = 0
    const bp = new BatchProcessor({ concurrency: 2, batchSize: 10 })
    const items = Array.from({ length: 8 }, (_, i) => makeItem({ id: i, data: i }))
    await bp.process(items, async (item) => {
      current++
      maxConcurrent = Math.max(maxConcurrent, current)
      await new Promise<void>((r) => setTimeout(r, 20))
      current--
      return item.data
    })
    expect(maxConcurrent).toBeLessThanOrEqual(2)
  })

  it('should handle concurrency with sync handler', () => {
    const bp = new BatchProcessor({ concurrency: 4, batchSize: 10 })
    const items = Array.from({ length: 10 }, (_, i) => makeItem({ id: i, data: i }))
    const results = bp.process(items, (item) => item.data) as BatchResult[]
    expect(results).toHaveLength(10)
    expect(results.every((r) => r.success)).toBe(true)
  })
})

describe('BatchProcessor - Error Handling - Sync', () => {
  it('should handle handler throwing error', () => {
    const bp = new BatchProcessor()
    const results = bp.process([makeItem()], () => { throw new Error('fail') }) as BatchResult[]
    expect(results[0]!.success).toBe(false)
    expect(results[0]!.error).toBe('fail')
  })

  it('should continue on error when continueOnError true', () => {
    const bp = new BatchProcessor({ continueOnError: true })
    const items = [
      makeItem({ id: '1', data: 'a' }),
      makeItem({ id: '2', data: 'b' }),
      makeItem({ id: '3', data: 'c' }),
    ]
    let callCount = 0
    const results = bp.process(items, () => {
      callCount++
      if (callCount === 2) throw new Error('mid fail')
      return 'ok'
    }) as BatchResult[]
    expect(results).toHaveLength(3)
    expect(results[0]!.success).toBe(true)
    expect(results[1]!.success).toBe(false)
    expect(results[2]!.success).toBe(true)
  })

  it('should stop on error when continueOnError false', () => {
    const bp = new BatchProcessor({ continueOnError: false })
    const items = [
      makeItem({ id: '1', data: 'a' }),
      makeItem({ id: '2', data: 'b' }),
      makeItem({ id: '3', data: 'c' }),
    ]
    let callCount = 0
    const results = bp.process(items, () => {
      callCount++
      if (callCount === 2) throw new Error('stop')
      return 'ok'
    }) as BatchResult[]
    expect(results).toHaveLength(2)
    expect(results[0]!.success).toBe(true)
    expect(results[1]!.success).toBe(false)
    expect(bp.getState()).toBe('error')
  })

  it('should record error message in result', () => {
    const bp = new BatchProcessor()
    const results = bp.process([makeItem()], () => { throw new Error('custom error msg') }) as BatchResult[]
    expect(results[0]!.error).toBe('custom error msg')
  })

  it('should handle all items failing', () => {
    const bp = new BatchProcessor({ continueOnError: true })
    const items = [makeItem({ id: '1' }), makeItem({ id: '2' }), makeItem({ id: '3' })]
    const results = bp.process(items, () => { throw new Error('boom') }) as BatchResult[]
    expect(results).toHaveLength(3)
    expect(results.every((r) => !r.success)).toBe(true)
  })

  it('should handle mixed success and failure', () => {
    const bp = new BatchProcessor({ continueOnError: true })
    const items = [
      makeItem({ id: '1', data: 'good' }),
      makeItem({ id: '2', data: 'bad' }),
      makeItem({ id: '3', data: 'good' }),
    ]
    const results = bp.process(items, (item) => {
      if (item.data === 'bad') throw new Error('bad')
      return 'ok'
    }) as BatchResult[]
    expect(results).toHaveLength(3)
    expect(results[0]!.success).toBe(true)
    expect(results[1]!.success).toBe(false)
    expect(results[2]!.success).toBe(true)
  })
})

describe('BatchProcessor - Error Handling - Async', () => {
  it('should handle async handler error', async () => {
    const bp = new BatchProcessor({ continueOnError: true })
    const results = await bp.process([makeItem()], async () => { throw new Error('async fail') })
    expect(results[0]!.success).toBe(false)
    expect(results[0]!.error).toBe('async fail')
  })

  it('should continue on async error when continueOnError true', async () => {
    const bp = new BatchProcessor({ continueOnError: true })
    const items = [makeItem({ id: '1' }), makeItem({ id: '2' }), makeItem({ id: '3' })]
    let count = 0
    const results = await bp.process(items, async () => {
      count++
      if (count === 2) throw new Error('mid')
      return 'ok'
    })
    expect(results).toHaveLength(3)
    expect(results[1]!.success).toBe(false)
  })

  it('should stop on async error when continueOnError false', async () => {
    const bp = new BatchProcessor({ continueOnError: false })
    const items = [makeItem({ id: '1' }), makeItem({ id: '2' }), makeItem({ id: '3' })]
    let count = 0
    const results = await bp.process(items, async () => {
      count++
      if (count === 2) throw new Error('stop async')
      return 'ok'
    })
    expect(results.length).toBeLessThanOrEqual(2)
    expect(bp.getState()).toBe('error')
  })

  it('should handle all async items failing', async () => {
    const bp = new BatchProcessor({ continueOnError: true })
    const items = [makeItem({ id: '1' }), makeItem({ id: '2' })]
    const results = await bp.process(items, async () => { throw new Error('all fail') })
    expect(results).toHaveLength(2)
    expect(results.every((r) => !r.success)).toBe(true)
  })
})

describe('BatchProcessor - Retry', () => {
  it('should retry on failure with retries > 0 sync', () => {
    let attempts = 0
    const bp = new BatchProcessor({ retries: 3 })
    const results = bp.process([makeItem()], () => {
      attempts++
      if (attempts < 3) throw new Error('retry')
      return 'ok'
    }) as BatchResult[]
    expect(results[0]!.success).toBe(true)
    expect(results[0]!.result).toBe('ok')
    expect(attempts).toBe(3)
  })

  it('should succeed after retry', () => {
    let attempts = 0
    const bp = new BatchProcessor({ retries: 2 })
    const results = bp.process([makeItem()], () => {
      attempts++
      if (attempts === 1) throw new Error('first fail')
      return 'recovered'
    }) as BatchResult[]
    expect(results[0]!.success).toBe(true)
    expect(attempts).toBe(2)
  })

  it('should fail after all retries exhausted', () => {
    const bp = new BatchProcessor({ retries: 2 })
    const results = bp.process([makeItem()], () => { throw new Error('always') }) as BatchResult[]
    expect(results[0]!.success).toBe(false)
    expect(results[0]!.error).toBe('always')
  })

  it('should not retry when retries is 0', () => {
    let attempts = 0
    const bp = new BatchProcessor({ retries: 0 })
    bp.process([makeItem()], () => {
      attempts++
      throw new Error('no retry')
    }) as BatchResult[]
    expect(attempts).toBe(1)
  })

  it('should apply retry delay for async handlers', async () => {
    let attempts = 0
    const bp = new BatchProcessor({ retries: 2, retryDelay: 10 })
    const results = await bp.process([makeItem()], async () => {
      attempts++
      if (attempts < 3) throw new Error('retry async')
      return 'ok'
    })
    expect(results[0]!.success).toBe(true)
    expect(attempts).toBe(3)
  })
})

describe('BatchProcessor - Timeout', () => {
  it('should timeout slow async handlers', async () => {
    const bp = new BatchProcessor({ timeout: 30 })
    const results = await bp.process([makeItem()], async () => {
      await new Promise<void>((r) => setTimeout(r, 500))
      return 'late'
    })
    expect(results[0]!.success).toBe(false)
    expect(results[0]!.error).toBe('Batch item timeout')
  })

  it('should not timeout fast async handlers', async () => {
    const bp = new BatchProcessor({ timeout: 500 })
    const results = await bp.process([makeItem()], async () => {
      await new Promise<void>((r) => setTimeout(r, 10))
      return 'fast'
    })
    expect(results[0]!.success).toBe(true)
    expect(results[0]!.result).toBe('fast')
  })

  it('should record timeout error message', async () => {
    const bp = new BatchProcessor({ timeout: 20 })
    const results = await bp.process([makeItem()], async () => {
      await new Promise<void>((r) => setTimeout(r, 200))
      return 'never'
    })
    expect(results[0]!.error).toContain('timeout')
  })
})

describe('BatchProcessor - Results', () => {
  it('getResults should return all results', () => {
    const bp = new BatchProcessor({ continueOnError: true })
    const items = [makeItem({ id: '1' }), makeItem({ id: '2' }), makeItem({ id: '3' })]
    bp.process(items, (item) => {
      if (item.id === '2') throw new Error('fail')
      return 'ok'
    }) as BatchResult[]
    expect(bp.getResults()).toHaveLength(3)
  })

  it('getSuccessfulResults should return only successful', () => {
    const bp = new BatchProcessor({ continueOnError: true })
    const items = [makeItem({ id: '1' }), makeItem({ id: '2' }), makeItem({ id: '3' })]
    bp.process(items, (item) => {
      if (item.id === '2') throw new Error('fail')
      return 'ok'
    }) as BatchResult[]
    const successful = bp.getSuccessfulResults()
    expect(successful).toHaveLength(2)
    expect(successful.every((r) => r.success)).toBe(true)
  })

  it('getFailedResults should return only failed', () => {
    const bp = new BatchProcessor({ continueOnError: true })
    const items = [makeItem({ id: '1' }), makeItem({ id: '2' }), makeItem({ id: '3' })]
    bp.process(items, (item) => {
      if (item.id === '2') throw new Error('fail')
      return 'ok'
    }) as BatchResult[]
    const failed = bp.getFailedResults()
    expect(failed).toHaveLength(1)
    expect(failed[0]!.error).toBe('fail')
  })

  it('result should have correct id', () => {
    const bp = new BatchProcessor()
    const items = [makeItem({ id: 'test-id', data: 'x' })]
    const results = bp.process(items, (item) => item.data) as BatchResult[]
    expect(results[0]!.id).toBe('test-id')
  })

  it('result success field should be true for success', () => {
    const bp = new BatchProcessor()
    const results = bp.process([makeItem()], () => 'ok') as BatchResult[]
    expect(results[0]!.success).toBe(true)
  })

  it('result error field should be empty string for success', () => {
    const bp = new BatchProcessor()
    const results = bp.process([makeItem()], () => 'ok') as BatchResult[]
    expect(results[0]!.error).toBe('')
  })

  it('result should have duration >= 0', () => {
    const bp = new BatchProcessor()
    const results = bp.process([makeItem()], () => 'ok') as BatchResult[]
    expect(results[0]!.duration).toBeGreaterThanOrEqual(0)
  })

  it('result should have result field matching handler return', () => {
    const bp = new BatchProcessor()
    const results = bp.process([makeItem()], () => 'handler-value') as BatchResult[]
    expect(results[0]!.result).toBe('handler-value')
  })
})

describe('BatchProcessor - State Management', () => {
  it('initial state should be idle', () => {
    const bp = new BatchProcessor()
    expect(bp.getState()).toBe('idle')
  })

  it('state should be completed after sync processing', () => {
    const bp = new BatchProcessor()
    bp.process([makeItem()], () => 'ok') as BatchResult[]
    expect(bp.getState()).toBe('completed')
  })

  it('state should be completed after async processing', async () => {
    const bp = new BatchProcessor()
    await bp.process([makeItem()], async () => 'ok')
    expect(bp.getState()).toBe('completed')
  })

  it('state should be error when continueOnError false and item fails', () => {
    const bp = new BatchProcessor({ continueOnError: false })
    bp.process([makeItem()], () => { throw new Error('fail') }) as BatchResult[]
    expect(bp.getState()).toBe('error')
  })

  it('pause should set state to paused', async () => {
    const bp = new BatchProcessor({ batchSize: 1, concurrency: 1 })
    const promise = bp.process(
      [makeItem({ id: '1' }), makeItem({ id: '2' })],
      async () => {
        await new Promise<void>((r) => setTimeout(r, 100))
        return 'ok'
      },
    )
    await new Promise<void>((r) => setTimeout(r, 50))
    bp.pause()
    expect(bp.getState()).toBe('paused')
    bp.resume()
    await promise
  })

  it('resume should set state to running from paused', async () => {
    const bp = new BatchProcessor({ batchSize: 1, concurrency: 1 })
    const promise = bp.process(
      [makeItem({ id: '1' }), makeItem({ id: '2' })],
      async () => {
        await new Promise<void>((r) => setTimeout(r, 80))
        return 'ok'
      },
    )
    await new Promise<void>((r) => setTimeout(r, 50))
    bp.pause()
    expect(bp.getState()).toBe('paused')
    bp.resume()
    expect(bp.getState()).toBe('running')
    await promise
  })

  it('cancel should stop processing', async () => {
    const bp = new BatchProcessor({ batchSize: 1, concurrency: 1, continueOnError: true })
    const promise = bp.process(
      [makeItem({ id: '1' }), makeItem({ id: '2' }), makeItem({ id: '3' })],
      async () => {
        await new Promise<void>((r) => setTimeout(r, 80))
        return 'ok'
      },
    )
    await new Promise<void>((r) => setTimeout(r, 40))
    bp.cancel()
    expect(bp.getState()).toBe('error')
    const results = await promise
    expect(results.length).toBeLessThan(3)
  })

  it('pause when not running should not change state', () => {
    const bp = new BatchProcessor()
    bp.pause()
    expect(bp.getState()).toBe('idle')
  })
})

describe('BatchProcessor - Progress', () => {
  it('getProgress should return progress object with all fields', () => {
    const bp = new BatchProcessor()
    const progress = bp.getProgress()
    expect(progress).toHaveProperty('total')
    expect(progress).toHaveProperty('completed')
    expect(progress).toHaveProperty('failed')
    expect(progress).toHaveProperty('inFlight')
    expect(progress).toHaveProperty('startTime')
    expect(progress).toHaveProperty('estimatedTimeRemaining')
  })

  it('total should match item count', () => {
    const bp = new BatchProcessor()
    bp.process(
      [makeItem({ id: '1' }), makeItem({ id: '2' }), makeItem({ id: '3' })],
      () => 'ok',
    ) as BatchResult[]
    expect(bp.getProgress().total).toBe(3)
  })

  it('completed should match processed count', () => {
    const bp = new BatchProcessor()
    bp.process(
      [makeItem({ id: '1' }), makeItem({ id: '2' }), makeItem({ id: '3' })],
      () => 'ok',
    ) as BatchResult[]
    expect(bp.getProgress().completed).toBe(3)
  })

  it('failed should match failed count', () => {
    const bp = new BatchProcessor({ continueOnError: true })
    bp.process(
      [makeItem({ id: '1' }), makeItem({ id: '2' })],
      () => { throw new Error('fail') },
    ) as BatchResult[]
    expect(bp.getProgress().failed).toBe(2)
  })

  it('onProgress callback should be called', () => {
    const onProgress = vi.fn()
    const bp = new BatchProcessor({ onProgress })
    bp.process([makeItem()], () => 'ok') as BatchResult[]
    expect(onProgress).toHaveBeenCalled()
  })

  it('onProgress should receive correct progress data', () => {
    const progresses: BatchProgress[] = []
    const onProgress = (p: BatchProgress) => { progresses.push(p) }
    const bp = new BatchProcessor({ onProgress })
    bp.process(
      [makeItem({ id: '1' }), makeItem({ id: '2' })],
      () => 'ok',
    ) as BatchResult[]
    expect(progresses.length).toBeGreaterThan(0)
    const first = progresses[0]!
    expect(first.total).toBe(2)
    expect(first.completed).toBe(1)
  })

  it('estimatedTimeRemaining should be zero when complete', () => {
    const bp = new BatchProcessor()
    bp.process([makeItem()], () => 'ok') as BatchResult[]
    expect(bp.getProgress().estimatedTimeRemaining).toBe(0)
  })
})

describe('BatchProcessor - Statistics', () => {
  it('getStatistics should return total', () => {
    const bp = new BatchProcessor({ continueOnError: true })
    bp.process(
      [makeItem({ id: '1' }), makeItem({ id: '2' })],
      () => 'ok',
    ) as BatchResult[]
    expect(bp.getStatistics().total).toBe(2)
  })

  it('getStatistics should return succeeded count', () => {
    const bp = new BatchProcessor({ continueOnError: true })
    bp.process(
      [makeItem({ id: '1' }), makeItem({ id: '2' })],
      () => 'ok',
    ) as BatchResult[]
    expect(bp.getStatistics().succeeded).toBe(2)
  })

  it('getStatistics should return failed count', () => {
    const bp = new BatchProcessor({ continueOnError: true })
    bp.process(
      [makeItem({ id: '1' }), makeItem({ id: '2' })],
      () => { throw new Error('fail') },
    ) as BatchResult[]
    expect(bp.getStatistics().failed).toBe(2)
  })

  it('getStatistics should return averageDuration', () => {
    const bp = new BatchProcessor()
    bp.process([makeItem()], () => 'ok') as BatchResult[]
    const stats = bp.getStatistics()
    expect(stats.averageDuration).toBeGreaterThanOrEqual(0)
  })

  it('getStatistics should return totalDuration', () => {
    const bp = new BatchProcessor()
    bp.process(
      [makeItem({ id: '1' }), makeItem({ id: '2' })],
      () => 'ok',
    ) as BatchResult[]
    const stats = bp.getStatistics()
    expect(stats.totalDuration).toBeGreaterThanOrEqual(0)
  })

  it('getStatistics with no results should return zeros', () => {
    const bp = new BatchProcessor()
    const stats = bp.getStatistics()
    expect(stats.total).toBe(0)
    expect(stats.succeeded).toBe(0)
    expect(stats.failed).toBe(0)
    expect(stats.averageDuration).toBe(0)
    expect(stats.totalDuration).toBe(0)
  })

  it('getStatistics should calculate correctly for mixed results', () => {
    const bp = new BatchProcessor({ continueOnError: true })
    bp.process(
      [makeItem({ id: '1' }), makeItem({ id: '2' }), makeItem({ id: '3' })],
      (item) => {
        if (item.id === '2') throw new Error('fail')
        return 'ok'
      },
    ) as BatchResult[]
    const stats = bp.getStatistics()
    expect(stats.total).toBe(3)
    expect(stats.succeeded).toBe(2)
    expect(stats.failed).toBe(1)
  })
})

describe('BatchProcessor - Reset', () => {
  it('reset should clear results', () => {
    const bp = new BatchProcessor()
    bp.process([makeItem()], () => 'ok') as BatchResult[]
    expect(bp.getResults()).toHaveLength(1)
    bp.reset()
    expect(bp.getResults()).toHaveLength(0)
  })

  it('reset should clear progress', () => {
    const bp = new BatchProcessor()
    bp.process([makeItem()], () => 'ok') as BatchResult[]
    expect(bp.getProgress().completed).toBe(1)
    bp.reset()
    expect(bp.getProgress().total).toBe(0)
    expect(bp.getProgress().completed).toBe(0)
  })

  it('reset should set state to idle', () => {
    const bp = new BatchProcessor()
    bp.process([makeItem()], () => 'ok') as BatchResult[]
    expect(bp.getState()).toBe('completed')
    bp.reset()
    expect(bp.getState()).toBe('idle')
  })

  it('reset should allow reprocessing', () => {
    const bp = new BatchProcessor()
    bp.process([makeItem()], () => 'first') as BatchResult[]
    bp.reset()
    const results = bp.process([makeItem({ id: '2', data: 'second' })], (item) => item.data) as BatchResult[]
    expect(results).toHaveLength(1)
    expect(results[0]!.result).toBe('second')
    expect(bp.getState()).toBe('completed')
  })

  it('reset should clear error state', () => {
    const bp = new BatchProcessor({ continueOnError: false })
    bp.process([makeItem()], () => { throw new Error('fail') }) as BatchResult[]
    expect(bp.getState()).toBe('error')
    bp.reset()
    expect(bp.getState()).toBe('idle')
    expect(bp.getResults()).toHaveLength(0)
  })
})

describe('BatchProcessor - Edge Cases', () => {
  it('should handle string ids', () => {
    const bp = new BatchProcessor()
    const items = [makeItem({ id: 'alpha', data: 'a' }), makeItem({ id: 'beta', data: 'b' })]
    const results = bp.process(items, (item) => item.data) as BatchResult[]
    expect(results[0]!.id).toBe('alpha')
    expect(results[1]!.id).toBe('beta')
  })

  it('should handle numeric ids', () => {
    const bp = new BatchProcessor()
    const items = [makeItem({ id: 1, data: 'a' }), makeItem({ id: 2, data: 'b' })]
    const results = bp.process(items, (item) => item.data) as BatchResult[]
    expect(results[0]!.id).toBe(1)
    expect(results[1]!.id).toBe(2)
  })

  it('should handle mixed string and numeric ids', () => {
    const bp = new BatchProcessor()
    const items = [makeItem({ id: 'str', data: 'a' }), makeItem({ id: 42, data: 'b' })]
    const results = bp.process(items, (item) => item.data) as BatchResult[]
    expect(results[0]!.id).toBe('str')
    expect(results[1]!.id).toBe(42)
  })

  it('should process 100 items correctly', () => {
    const bp = new BatchProcessor({ batchSize: 7 })
    const items = Array.from({ length: 100 }, (_, i) => makeItem({ id: i, data: i }))
    const results = bp.process(items, (item) => (item.data as number) * 2) as BatchResult[]
    expect(results).toHaveLength(100)
    expect(results.every((r) => r.success)).toBe(true)
    expect(results[0]!.result).toBe(0)
    expect(results[99]!.result).toBe(198)
  })

  it('processBatch should process items without splitting into batches', () => {
    const bp = new BatchProcessor({ batchSize: 2 })
    const items = Array.from({ length: 5 }, (_, i) => makeItem({ id: i, data: i }))
    const results = bp.processBatch(items, (item) => item.data) as BatchResult[]
    expect(results).toHaveLength(5)
    expect(bp.getState()).toBe('completed')
  })

  it('processBatch with empty array returns empty', () => {
    const bp = new BatchProcessor()
    const results = bp.processBatch([], () => 'ok') as BatchResult[]
    expect(results).toHaveLength(0)
    expect(bp.getState()).toBe('completed')
  })

  it('processBatch handles async handler', async () => {
    const bp = new BatchProcessor({ concurrency: 2 })
    const items = [makeItem({ id: '1', data: 'a' }), makeItem({ id: '2', data: 'b' })]
    const results = await bp.processBatch(items, async (item) => item.data)
    expect(results).toHaveLength(2)
    expect(results[0]!.success).toBe(true)
    expect(results[1]!.success).toBe(true)
  })
})
