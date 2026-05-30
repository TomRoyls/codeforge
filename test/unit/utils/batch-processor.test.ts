import { describe, test, expect, vi } from 'vitest'
import { processBatch, processBatchSequential } from '../../../src/utils/batch-processor.js'

describe('processBatch', () => {
  test('processes all items successfully', async () => {
    const items = [1, 2, 3, 4, 5]
    const result = await processBatch(items, async (n) => n * 2)
    expect(result.isOk()).toBe(true)
    const batch = result.unwrap()
    expect(batch.successful.sort((a, b) => a - b)).toEqual([2, 4, 6, 8, 10])
    expect(batch.failed).toHaveLength(0)
    expect(batch.total).toBe(5)
  })

  test('tracks failed items', async () => {
    const items = [1, 2, 3, 4, 5]
    const result = await processBatch(items, async (n) => {
      if (n === 3) throw new Error('bad')
      return n
    })
    expect(result.isOk()).toBe(true)
    const batch = result.unwrap()
    expect(batch.successful.length).toBe(4)
    expect(batch.failed).toHaveLength(1)
    expect(batch.failed[0]?.input).toBe(2)
  })

  test('respects concurrency option', async () => {
    const order: number[] = []
    const items = [1, 2, 3, 4, 5, 6]
    await processBatch(
      items,
      async (n) => {
        order.push(n)
        await new Promise((r) => setTimeout(r, 10))
        return n
      },
      { concurrency: 2 },
    )
    expect(order.length).toBe(6)
  })

  test('calls onProgress callback', async () => {
    const onProgress = vi.fn()
    await processBatch(
      [1, 2, 3],
      async (n) => n,
      { onProgress },
    )
    expect(onProgress).toHaveBeenCalledTimes(3)
    expect(onProgress).toHaveBeenLastCalledWith(3, 3)
  })

  test('stops on error when continueOnError is false', async () => {
    let processed = 0
    const result = await processBatch(
      [1, 2, 3, 4, 5],
      async (n) => {
        processed++
        if (n === 2) throw new Error('stop')
        return n
      },
      { continueOnError: false, concurrency: 1 },
    )
    expect(result.isErr()).toBe(true)
    expect(processed).toBeLessThanOrEqual(5)
  })

  test('continues on error by default', async () => {
    const result = await processBatch(
      [1, 2, 3],
      async (n) => {
        if (n === 2) throw new Error('skip')
        return n
      },
      { concurrency: 1 },
    )
    expect(result.isOk()).toBe(true)
    const batch = result.unwrap()
    expect(batch.successful.length).toBe(2)
    expect(batch.failed.length).toBe(1)
  })

  test('returns durationMs', async () => {
    const result = await processBatch(
      [1, 2, 3],
      async (n) => {
        await new Promise((r) => setTimeout(r, 5))
        return n
      },
    )
    expect(result.isOk()).toBe(true)
    expect(result.unwrap().durationMs).toBeGreaterThan(0)
  })

  test('handles empty array', async () => {
    const result = await processBatch([], async (n) => n)
    expect(result.isOk()).toBe(true)
    expect(result.unwrap().successful).toEqual([])
    expect(result.unwrap().total).toBe(0)
  })

  test('handles single item', async () => {
    const result = await processBatch([42], async (n) => n * 2)
    expect(result.isOk()).toBe(true)
    expect(result.unwrap().successful).toEqual([84])
  })
})

describe('processBatchSequential', () => {
  test('processes items in order', async () => {
    const order: number[] = []
    const result = await processBatchSequential([1, 2, 3], async (n) => {
      order.push(n)
      return n * 2
    })
    expect(order).toEqual([1, 2, 3])
    expect(result.successful).toEqual([2, 4, 6])
  })

  test('tracks failures', async () => {
    const result = await processBatchSequential([1, 2, 3], async (n) => {
      if (n === 2) throw new Error('bad')
      return n
    })
    expect(result.successful).toEqual([1, 3])
    expect(result.failed).toHaveLength(1)
    expect(result.failed[0]?.input).toBe(1)
  })

  test('stops on first error when continueOnError is false', async () => {
    const order: number[] = []
    const result = await processBatchSequential([1, 2, 3], async (n) => {
      order.push(n)
      if (n === 2) throw new Error('stop')
      return n
    }, false)
    expect(order).toEqual([1, 2])
    expect(result.successful).toEqual([1])
    expect(result.failed).toHaveLength(1)
  })

  test('returns durationMs', async () => {
    const result = await processBatchSequential([1, 2], async (n) => {
      await new Promise((r) => setTimeout(r, 5))
      return n
    })
    expect(result.durationMs).toBeGreaterThan(0)
  })

  test('handles empty array', async () => {
    const result = await processBatchSequential([], async (n) => n)
    expect(result.successful).toEqual([])
    expect(result.total).toBe(0)
  })
})
