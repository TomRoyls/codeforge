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
    const stream = new TopKStream<string>(3)
    expect(stream.getItems()).toEqual([])
  })
})