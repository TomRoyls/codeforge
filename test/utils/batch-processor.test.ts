import { describe, it, expect, vi } from 'vitest'
import { processBatch, processBatchSequential } from '../../src/utils/batch-processor.js'

describe('batch-processor', () => {
  it('processes all items successfully with default options', async () => {
    const items = [1, 2, 3, 4, 5]
    const handler = async (item: number) => item * 2
    const result = await processBatch(items, handler)

    expect(result.isOk()).toBe(true)
    if (!result.isOk()) return

    const value = result.unwrap()
    expect(value.successful).toEqual([2, 4, 6, 8, 10])
    expect(value.failed).toHaveLength(0)
    expect(value.total).toBe(5)
    expect(value.durationMs).toBeGreaterThanOrEqual(0)
  })

  it('respects custom concurrency limit', async () => {
    const items = [1, 2, 3, 4, 5]
    let activeCount = 0
    let maxActive = 0

    const handler = async (item: number) => {
      activeCount++
      maxActive = Math.max(maxActive, activeCount)
      await new Promise((resolve) => setTimeout(resolve, 10))
      activeCount--
      return item
    }

    await processBatch(items, handler, { concurrency: 2 })

    expect(maxActive).toBeLessThanOrEqual(2)
  })

  it('continues on error by default', async () => {
    const items = [1, 2, 3, 4, 5]
    const handler = async (item: number) => {
      if (item === 3) throw new Error('Failed on 3')
      return item * 2
    }

    const result = await processBatch(items, handler, { continueOnError: true })

    expect(result.isOk()).toBe(true)
    if (!result.isOk()) return

    const value = result.unwrap()
    expect(value.successful).toHaveLength(4)
    expect(value.failed).toHaveLength(1)
    expect(value.failed[0]!.input).toBe(2)
  })

  it('stops on first error when continueOnError is false', async () => {
    const items = [1, 2, 3, 4, 5]
    const handler = async (item: number) => {
      if (item === 3) throw new Error('Failed on 3')
      return item * 2
    }

    const result = await processBatch(items, handler, { continueOnError: false })

    expect(result.isOk()).toBe(false)

    const json = result.toJSON()
    expect(json.ok).toBe(false)
    expect(json.error).toBeInstanceOf(Error)
  })

  it('calls onProgress callback with completion status', async () => {
    const items = [1, 2, 3, 4, 5]
    const progressCalls: Array<[number, number]> = []

    const handler = async (item: number) => {
      await new Promise((resolve) => setTimeout(resolve, 5))
      return item
    }

    await processBatch(items, handler, {
      onProgress: (completed, total) => {
        progressCalls.push([completed, total])
      },
    })

    expect(progressCalls).toHaveLength(5)
    expect(progressCalls[0]![0]).toBe(1)
    expect(progressCalls[0]![1]).toBe(5)
    expect(progressCalls[4]![0]).toBe(5)
  })

  it('handles empty array', async () => {
    const items: number[] = []
    const handler = async (item: number) => item * 2
    const result = await processBatch(items, handler)

    expect(result.isOk()).toBe(true)
    if (!result.isOk()) return

    const value = result.unwrap()
    expect(value.successful).toHaveLength(0)
    expect(value.failed).toHaveLength(0)
    expect(value.total).toBe(0)
  })

  it('passes correct index to handler', async () => {
    const items = ['a', 'b', 'c']
    const indices: number[] = []

    const handler = async (item: string, index: number) => {
      indices.push(index)
      return item.toUpperCase()
    }

    await processBatch(items, handler)

    expect(indices).toEqual([0, 1, 2])
  })

  it('handles mixed success and failure results', async () => {
    const items = [1, 2, 3, 4, 5, 6]
    const handler = async (item: number) => {
      if (item % 2 === 0) throw new Error(`Even number: ${item}`)
      return item * 10
    }

    const result = await processBatch(items, handler, { continueOnError: true })

    expect(result.isOk()).toBe(true)
    if (!result.isOk()) return

    const value = result.unwrap()
    expect(value.successful).toEqual([10, 30, 50])
    expect(value.failed).toHaveLength(3)
  })

  it('processes items with concurrency higher than item count', async () => {
    const items = [1, 2]
    const handler = async (item: number) => item * 2
    const result = await processBatch(items, handler, { concurrency: 10 })

    expect(result.isOk()).toBe(true)
    if (!result.isOk()) return

    const value = result.unwrap()
    expect(value.successful).toEqual([2, 4])
  })

  it('returns error on failure when continueOnError is false', async () => {
    const items = [1, 2, 3]
    const handler = async (item: number) => {
      if (item === 2) throw new Error('Specific error')
      return item
    }

    const result = await processBatch(items, handler, { continueOnError: false })

    expect(result.isOk()).toBe(false)

    const json = result.toJSON()
    expect(json.ok).toBe(false)
    expect(json.error).toBeInstanceOf(Error)
  })

  it('processBatchSequential processes items in order', async () => {
    const items = [1, 2, 3, 4, 5]
    const processedOrder: number[] = []

    const handler = async (item: number) => {
      processedOrder.push(item)
      await new Promise((resolve) => setTimeout(resolve, 1))
      return item * 2
    }

    const result = await processBatchSequential(items, handler)

    expect(processedOrder).toEqual([1, 2, 3, 4, 5])
    expect(result.successful).toEqual([2, 4, 6, 8, 10])
    expect(result.failed).toHaveLength(0)
  })

  it('processBatchSequential stops on error when continueOnError is false', async () => {
    const items = [1, 2, 3, 4, 5]
    const handler = async (item: number) => {
      if (item === 3) throw new Error('Error at 3')
      return item * 2
    }

    const result = await processBatchSequential(items, handler, false)

    expect(result.successful).toEqual([2, 4])
    expect(result.failed).toHaveLength(1)
    expect(result.failed[0]!.input).toBe(2)
  })

  it('processBatchSequential continues on error by default', async () => {
    const items = [1, 2, 3, 4, 5]
    const handler = async (item: number) => {
      if (item === 3) throw new Error('Error at 3')
      return item * 2
    }

    const result = await processBatchSequential(items, handler, true)

    expect(result.successful).toEqual([2, 4, 8, 10])
    expect(result.failed).toHaveLength(1)
    expect(result.failed[0]!.input).toBe(2)
  })

  it('processBatchSequential handles empty array', async () => {
    const items: number[] = []
    const handler = async (item: number) => item * 2
    const result = await processBatchSequential(items, handler)

    expect(result.successful).toHaveLength(0)
    expect(result.failed).toHaveLength(0)
    expect(result.total).toBe(0)
  })

  it('processBatchSequential records duration', async () => {
    const items = [1, 2, 3]
    const handler = async (item: number) => {
      await new Promise((resolve) => setTimeout(resolve, 5))
      return item
    }

    const result = await processBatchSequential(items, handler)

    expect(result.durationMs).toBeGreaterThanOrEqual(0)
  })

  it('handles single item batch', async () => {
    const result = await processBatch([42], async (x) => x * 10)
    expect(result.isOk()).toBe(true)
    if (!result.isOk()) return
    expect(result.unwrap().successful).toEqual([420])
    expect(result.unwrap().total).toBe(1)
  })

  it('captures error messages in failed items', async () => {
    const items = [1, 2, 3]
    const handler = async (item: number) => {
      if (item === 2) throw new Error('boom')
      return item
    }

    const result = await processBatch(items, handler, { continueOnError: true })
    expect(result.isOk()).toBe(true)
    if (!result.isOk()) return

    const value = result.unwrap()
    expect(value.failed).toHaveLength(1)
    expect(value.failed[0]!.error).toBeInstanceOf(Error)
    expect(value.failed[0]!.error.message).toBe('boom')
  })

  it('processBatchSequential with single item', async () => {
    const result = await processBatchSequential([5], async (x) => x + 1)
    expect(result.successful).toEqual([6])
    expect(result.failed).toHaveLength(0)
    expect(result.total).toBe(1)
  })

  it('processes empty batch', async () => {
    const handler = async (x: number) => x * 2
    const result = await processBatch([], handler)
    expect(result.isOk()).toBe(true)
  })

  it('processes single item', async () => {
    const handler = async (x: number) => x * 2
    const result = await processBatch([3], handler)
    expect(result.isOk()).toBe(true)
  })

  it('processes empty batch', async () => {
    const handler = async (x: number) => x * 2
    const result = await processBatch([], handler)
    expect(result.isOk()).toBe(true)
  })

  it('processBatch with single item returns doubled', async () => {
    const handler = async (x: number) => x * 2
    const result = await processBatch([5], handler)
    expect(result.isOk()).toBe(true)
  })

  it('processBatch handles empty array', async () => {
    const handler = async (x: number) => x * 2
    const result = await processBatch([], handler)
    expect(result.isOk()).toBe(true)
  })

  it('processBatch with single item', async () => {
    const handler = async (x: number) => x * 2
    const result = await processBatch([5], handler)
    expect(result.isOk()).toBe(true)
  })
})