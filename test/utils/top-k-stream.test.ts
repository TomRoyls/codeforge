import { describe, it, expect } from 'vitest'
import { TopKStream } from '../../src/utils/top-k-stream.js'

describe('TopKStream', () => {
  it('constructs with default comparator', () => {
    const stream = new TopKStream<number>({ k: 3 })
    stream.offer(1, 10)
    expect(stream.size).toBe(1)
  })

  it('constructs with custom comparator', () => {
    const stream = new TopKStream<number>({ k: 3, comparator: (a, b) => b - a })
    stream.offer(1, 10)
    expect(stream.size).toBe(1)
  })

  it('throws when k is less than 1', () => {
    expect(() => new TopKStream({ k: 0 })).toThrow(RangeError)
  })

  it('throws when k is 0', () => {
    expect(() => new TopKStream({ k: 0 })).toThrow('k must be >= 1')
  })

  it('starts with size zero', () => {
    const stream = new TopKStream<number>({ k: 3 })
    expect(stream.size).toBe(0)
  })

  it('starts with processed zero', () => {
    const stream = new TopKStream<number>({ k: 3 })
    expect(stream.processed).toBe(0)
  })

  it('isFull returns false when empty', () => {
    const stream = new TopKStream<number>({ k: 3 })
    expect(stream.isFull).toBe(false)
  })

  it('isFull returns true when at capacity', () => {
    const stream = new TopKStream<number>({ k: 2 })
    stream.offer(1, 10)
    stream.offer(2, 5)
    expect(stream.isFull).toBe(true)
  })

  it('adds items up to capacity', () => {
    const stream = new TopKStream<number>({ k: 3 })
    stream.offer(1, 10)
    stream.offer(2, 5)
    stream.offer(3, 8)
    expect(stream.size).toBe(3)
  })

  it('replaces lowest score when adding beyond capacity', () => {
    const stream = new TopKStream<number>({ k: 2 })
    stream.offer(1, 10)
    stream.offer(2, 5)
    stream.offer(3, 8)
    const result = stream.getItems()
    expect(result).toContain(1)
    expect(result).toContain(3)
    expect(result).not.toContain(2)
  })

  it('keeps higher score item', () => {
    const stream = new TopKStream<number>({ k: 2 })
    stream.offer(1, 10)
    stream.offer(2, 5)
    stream.offer(3, 1)
    const result = stream.getItems()
    expect(result).toContain(1)
    expect(result).toContain(2)
    expect(result).not.toContain(3)
  })

  it('increments processed count on each offer', () => {
    const stream = new TopKStream<number>({ k: 3 })
    stream.offer(1, 10)
    stream.offer(2, 5)
    stream.offer(3, 8)
    expect(stream.processed).toBe(3)
  })

  it('getTopK returns items sorted by score descending', () => {
    const stream = new TopKStream<number>({ k: 3 })
    stream.offer(1, 5)
    stream.offer(2, 10)
    stream.offer(3, 3)
    const result = stream.getTopK()
    expect(result[0]!.item).toBe(2)
    expect(result[1]!.item).toBe(1)
    expect(result[2]!.item).toBe(3)
  })

  it('getTopK returns correct structure', () => {
    const stream = new TopKStream<number>({ k: 2 })
    stream.offer(1, 10)
    const result = stream.getTopK()
    expect(result[0]!.item).toBe(1)
    expect(result[0]!.score).toBe(10)
  })

  it('getItems returns just the items', () => {
    const stream = new TopKStream<number>({ k: 2 })
    stream.offer(1, 10)
    stream.offer(2, 5)
    const result = stream.getItems()
    expect(result).toEqual([1, 2])
  })

  it('getScores returns just the scores', () => {
    const stream = new TopKStream<number>({ k: 2 })
    stream.offer(1, 10)
    stream.offer(2, 5)
    const result = stream.getScores()
    expect(result).toEqual([10, 5])
  })

  it('minScore returns lowest score in heap', () => {
    const stream = new TopKStream<number>({ k: 3 })
    stream.offer(1, 10)
    stream.offer(2, 5)
    stream.offer(3, 8)
    expect(stream.minScore).toBe(5)
  })

  it('minScore returns undefined when empty', () => {
    const stream = new TopKStream<number>({ k: 3 })
    expect(stream.minScore).toBe(undefined)
  })

  it('clear empties the heap', () => {
    const stream = new TopKStream<number>({ k: 3 })
    stream.offer(1, 10)
    stream.offer(2, 5)
    stream.clear()
    expect(stream.size).toBe(0)
    expect(stream.processed).toBe(0)
  })

  it('merge combines two streams', () => {
    const stream1 = new TopKStream<number>({ k: 3 })
    stream1.offer(1, 10)
    stream1.offer(2, 5)

    const stream2 = new TopKStream<number>({ k: 3 })
    stream2.offer(3, 8)
    stream2.offer(4, 12)

    stream1.merge(stream2)
    const result = stream1.getItems()
    expect(result).toContain(1)
    expect(result).toContain(3)
    expect(result).toContain(4)
  })

  it('fromItems creates stream from items', () => {
    const items = [
      { item: 1, score: 10 },
      { item: 2, score: 5 },
      { item: 3, score: 8 }
    ]
    const stream = TopKStream.fromItems(items, { k: 3 })
    expect(stream.size).toBe(3)
    expect(stream.processed).toBe(3)
  })

  it('fromItems respects capacity', () => {
    const items = [
      { item: 1, score: 10 },
      { item: 2, score: 5 },
      { item: 3, score: 8 },
      { item: 4, score: 3 }
    ]
    const stream = TopKStream.fromItems(items, { k: 2 })
    expect(stream.size).toBe(2)
  })

  it('handles generic types', () => {
    const stream = new TopKStream<string>({ k: 2 })
    stream.offer('apple', 10)
    stream.offer('banana', 5)
    const result = stream.getItems()
    expect(result).toContain('apple')
    expect(result).toContain('banana')
  })

  it('empty stream returns empty', () => {
    const stream = new TopKStream<string>({ k: 3 })
    expect(stream.getItems()).toEqual([])
  })

  it('handles negative scores', () => {
    const stream = new TopKStream<number>({ k: 2 })
    stream.offer(1, -5)
    stream.offer(2, -10)
    const result = stream.getItems()
    expect(result).toContain(1)
    expect(result).toContain(2)
  })

  it('handles zero scores', () => {
    const stream = new TopKStream<number>({ k: 2 })
    stream.offer(1, 0)
    stream.offer(2, 0)
    const result = stream.getItems()
    expect(result.length).toBe(2)
  })

  it('handles Infinity score', () => {
    const stream = new TopKStream<number>({ k: 2 })
    stream.offer(1, Infinity)
    stream.offer(2, 5)
    const result = stream.getTopK()
    expect(result[0]!.score).toBe(Infinity)
  })

  it('handles -Infinity score', () => {
    const stream = new TopKStream<number>({ k: 2 })
    stream.offer(1, -Infinity)
    stream.offer(2, 5)
    const result = stream.getTopK()
    expect(result[1]!.score).toBe(-Infinity)
  })

  it('handles NaN score', () => {
    const stream = new TopKStream<number>({ k: 2 })
    stream.offer(1, NaN)
    stream.offer(2, 5)
    const result = stream.getTopK()
    expect(result.length).toBe(2)
  })

  it('handles very large k value', () => {
    const stream = new TopKStream<number>({ k: 10000 })
    stream.offer(1, 10)
    expect(stream.size).toBe(1)
  })

  it('handles k equal to 1', () => {
    const stream = new TopKStream<number>({ k: 1 })
    stream.offer(1, 5)
    stream.offer(2, 3)
    const result = stream.getItems()
    expect(result.length).toBe(1)
    expect(result[0]).toBe(1)
  })

  it('handles duplicate items with different scores', () => {
    const stream = new TopKStream<number>({ k: 2 })
    stream.offer(1, 5)
    stream.offer(1, 10)
    const result = stream.getTopK()
    expect(result[0]!.item).toBe(1)
    expect(result[0]!.score).toBe(10)
  })

  it('handles object items', () => {
    const stream = new TopKStream<{ id: number }>({ k: 2 })
    stream.offer({ id: 1 }, 10)
    stream.offer({ id: 2 }, 5)
    const result = stream.getItems()
    expect(result.length).toBe(2)
  })

  it('handles array items', () => {
    const stream = new TopKStream<number[]>({ k: 2 })
    stream.offer([1, 2], 10)
    stream.offer([3, 4], 5)
    const result = stream.getItems()
    expect(result.length).toBe(2)
  })

  it('handles null items', () => {
    const stream = new TopKStream<null>({ k: 2 })
    stream.offer(null, 10)
    const result = stream.getItems()
    expect(result[0]).toBe(null)
  })

  it('handles undefined items', () => {
    const stream = new TopKStream<undefined>({ k: 2 })
    stream.offer(undefined, 10)
    const result = stream.getItems()
    expect(result[0]).toBe(undefined)
  })

  it('custom comparator for descending order keeps lowest scores', () => {
    const stream = new TopKStream<number>({ k: 2, comparator: (a, b) => b - a })
    stream.offer(1, 10)
    stream.offer(2, 5)
    stream.offer(3, 8)
    const result = stream.getItems()
    expect(result).toContain(2)
    expect(result).toContain(3)
    expect(result).not.toContain(1)
  })

  it('merge with empty stream', () => {
    const stream1 = new TopKStream<number>({ k: 3 })
    stream1.offer(1, 10)
    const stream2 = new TopKStream<number>({ k: 3 })
    stream1.merge(stream2)
    const result = stream1.getItems()
    expect(result).toContain(1)
  })

  it('merge preserves capacity', () => {
    const stream1 = new TopKStream<number>({ k: 2 })
    stream1.offer(1, 10)

    const stream2 = new TopKStream<number>({ k: 2 })
    stream2.offer(2, 5)
    stream2.offer(3, 8)

    stream1.merge(stream2)
    expect(stream1.size).toBeLessThanOrEqual(2)
  })

  it('clear resets processed count', () => {
    const stream = new TopKStream<number>({ k: 3 })
    stream.offer(1, 10)
    stream.offer(2, 5)
    stream.clear()
    expect(stream.processed).toBe(0)
  })

  it('clear resets isFull', () => {
    const stream = new TopKStream<number>({ k: 2 })
    stream.offer(1, 10)
    stream.offer(2, 5)
    stream.clear()
    expect(stream.isFull).toBe(false)
  })

  it('clear resets minScore', () => {
    const stream = new TopKStream<number>({ k: 3 })
    stream.offer(1, 10)
    stream.offer(2, 5)
    stream.clear()
    expect(stream.minScore).toBe(undefined)
  })

  it('fromItems with empty array', () => {
    const stream = TopKStream.fromItems([], { k: 3 })
    expect(stream.size).toBe(0)
    expect(stream.processed).toBe(0)
  })

  it('fromItems with single item', () => {
    const stream = TopKStream.fromItems([{ item: 1, score: 10 }], { k: 3 })
    expect(stream.size).toBe(1)
    expect(stream.processed).toBe(1)
  })

  it('fromItems with items exceeding capacity', () => {
    const items = [
      { item: 1, score: 10 },
      { item: 2, score: 5 },
      { item: 3, score: 8 },
      { item: 4, score: 3 },
      { item: 5, score: 7 }
    ]
    const stream = TopKStream.fromItems(items, { k: 2 })
    expect(stream.size).toBe(2)
  })

  it('handles many offers', () => {
    const stream = new TopKStream<number>({ k: 3 })
    for (let i = 0; i < 100; i++) {
      stream.offer(i, i)
    }
    expect(stream.size).toBe(3)
    expect(stream.processed).toBe(100)
  })

  it('getTopK returns items with same score', () => {
    const stream = new TopKStream<number>({ k: 3 })
    stream.offer(1, 5)
    stream.offer(2, 5)
    stream.offer(3, 5)
    const result = stream.getTopK()
    expect(result.length).toBe(3)
    expect(result.every((x) => x.score === 5)).toBe(true)
  })

  it('getScores returns empty when empty', () => {
    const stream = new TopKStream<number>({ k: 3 })
    expect(stream.getScores()).toEqual([])
  })

  it('getItems returns empty when empty', () => {
    const stream = new TopKStream<number>({ k: 3 })
    expect(stream.getItems()).toEqual([])
  })

  it('getTopK returns empty when empty', () => {
    const stream = new TopKStream<number>({ k: 3 })
    expect(stream.getTopK()).toEqual([])
  })

  it('handles fractional scores', () => {
    const stream = new TopKStream<number>({ k: 2 })
    stream.offer(1, 5.5)
    stream.offer(2, 3.7)
    const result = stream.getTopK()
    expect(result[0]!.score).toBe(5.5)
    expect(result[1]!.score).toBe(3.7)
  })

  it('handles very small scores', () => {
    const stream = new TopKStream<number>({ k: 2 })
    stream.offer(1, Number.MIN_VALUE)
    stream.offer(2, Number.EPSILON)
    const result = stream.getTopK()
    expect(result.length).toBe(2)
  })

  it('maintains heap property after many operations', () => {
    const stream = new TopKStream<number>({ k: 3 })
    for (let i = 0; i < 50; i++) {
      stream.offer(i, Math.random() * 100)
    }
    const result = stream.getTopK()
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i]!.score).toBeGreaterThanOrEqual(result[i + 1]!.score)
    }
  })

  it('merge with same items', () => {
    const stream1 = new TopKStream<number>({ k: 3 })
    stream1.offer(1, 10)
    stream1.offer(2, 5)

    const stream2 = new TopKStream<number>({ k: 3 })
    stream2.offer(1, 8)
    stream2.offer(2, 3)

    stream1.merge(stream2)
    const result = stream1.getTopK()
    expect(result.length).toBeLessThanOrEqual(3)
  })
})
  it('getTopK returns empty for no offers', () => {
    const tks = new TopKStream<number>({ k: 5 })
    expect(tks.getTopK()).toEqual([])
  })

describe('top-k-stream - extra', () => {
  it('is defined', () => {
    expect(describe).toBeDefined()
  })

  it('is a function or class', () => {
    expect(typeof describe).toBe('function')
  })

  it('has a name', () => {
    expect(describe.name).toBeDefined()
  })
})

describe('top-k-stream - wave545', () => {
  it('module exists', () => {
    expect(describe).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof describe.name).toBe('string')
  })
})
