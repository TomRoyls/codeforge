import { describe, expect, it } from 'vitest'
import { TopKStream } from '../../../src/utils/top-k-stream.js'

describe('TopKStream', () => {
  it('constructor accepts valid k values', () => {
    const stream = new TopKStream({ k: 5 })
    expect(stream.size).toBe(0)
    expect(stream.processed).toBe(0)
    expect(stream.isFull).toBe(false)
  })

  it('constructor throws for k less than 1', () => {
    expect(() => new TopKStream({ k: 0 })).toThrow(RangeError)
    expect(() => new TopKStream({ k: -1 })).toThrow(RangeError)
    expect(() => new TopKStream({ k: 0 })).toThrow('k must be >= 1')
  })

  it('k=1 keeps only single top element', () => {
    const stream = new TopKStream<string>({ k: 1 })
    stream.offer('a', 5)
    stream.offer('b', 10)
    stream.offer('c', 3)
    const result = stream.getTopK()
    expect(result).toHaveLength(1)
    expect(result[0].item).toBe('b')
    expect(result[0].score).toBe(10)
  })

  it('k=1 with custom comparator for bottom-K keeps single largest', () => {
    const stream = new TopKStream<string>({ k: 1, comparator: (a, b) => a - b })
    stream.offer('a', 5)
    stream.offer('b', 10)
    stream.offer('c', 3)
    const result = stream.getTopK()
    expect(result).toHaveLength(1)
    expect(result[0].item).toBe('b')
    expect(result[0].score).toBe(10)
  })

  it('custom comparator for bottom-K selects smallest scores', () => {
    const stream = new TopKStream<number>({ k: 3, comparator: (a, b) => b - a })
    stream.offer(1, 10)
    stream.offer(2, 5)
    stream.offer(3, 15)
    stream.offer(4, 2)
    stream.offer(5, 8)
    const result = stream.getTopK()
    expect(result.map((e) => e.score)).toEqual([2, 5, 8])
    expect(result.map((e) => e.item)).toEqual([4, 2, 5])
  })

  it('default comparator for top-K selects highest scores', () => {
    const stream = new TopKStream<number>({ k: 3 })
    stream.offer(1, 10)
    stream.offer(2, 5)
    stream.offer(3, 15)
    stream.offer(4, 2)
    stream.offer(5, 8)
    const result = stream.getTopK()
    expect(result.map((e) => e.score)).toEqual([15, 10, 8])
    expect(result.map((e) => e.item)).toEqual([3, 1, 5])
  })

  it('offer adds items until k is reached', () => {
    const stream = new TopKStream<string>({ k: 3 })
    stream.offer('a', 5)
    expect(stream.size).toBe(1)
    expect(stream.processed).toBe(1)
    expect(stream.isFull).toBe(false)

    stream.offer('b', 10)
    expect(stream.size).toBe(2)
    expect(stream.processed).toBe(2)
    expect(stream.isFull).toBe(false)

    stream.offer('c', 3)
    expect(stream.size).toBe(3)
    expect(stream.processed).toBe(3)
    expect(stream.isFull).toBe(true)
  })

  it('offer evicts lower scores when full', () => {
    const stream = new TopKStream<string>({ k: 2 })
    stream.offer('a', 10)
    stream.offer('b', 5)
    stream.offer('c', 8)
    stream.offer('d', 12)
    const result = stream.getTopK()
    expect(result).toHaveLength(2)
    expect(result.map((e) => e.score)).toEqual([12, 10])
    expect(result.map((e) => e.item)).toEqual(['d', 'a'])
  })

  it('offer does not add item with lower score when full', () => {
    const stream = new TopKStream<string>({ k: 2 })
    stream.offer('a', 10)
    stream.offer('b', 8)
    stream.offer('c', 5)
    const result = stream.getTopK()
    expect(result).toHaveLength(2)
    expect(result.map((e) => e.score)).toEqual([10, 8])
  })

  it('offering fewer items than k keeps all', () => {
    const stream = new TopKStream<string>({ k: 5 })
    stream.offer('a', 1)
    stream.offer('b', 2)
    stream.offer('c', 3)
    const result = stream.getTopK()
    expect(result).toHaveLength(3)
    expect(result.map((e) => e.item)).toEqual(['c', 'b', 'a'])
  })

  it('offering exactly k items keeps all', () => {
    const stream = new TopKStream<string>({ k: 3 })
    stream.offer('a', 1)
    stream.offer('b', 2)
    stream.offer('c', 3)
    const result = stream.getTopK()
    expect(result).toHaveLength(3)
    expect(result.map((e) => e.score)).toEqual([3, 2, 1])
  })

  it('offering more than k items evicts lower scores', () => {
    const stream = new TopKStream<string>({ k: 3 })
    stream.offer('a', 1)
    stream.offer('b', 2)
    stream.offer('c', 3)
    stream.offer('d', 4)
    stream.offer('e', 5)
    const result = stream.getTopK()
    expect(result).toHaveLength(3)
    expect(result.map((e) => e.score)).toEqual([5, 4, 3])
  })

  it('same score items all accepted until full', () => {
    const stream = new TopKStream<string>({ k: 3 })
    stream.offer('a', 5)
    stream.offer('b', 5)
    stream.offer('c', 5)
    stream.offer('d', 5)
    const result = stream.getTopK()
    expect(result).toHaveLength(3)
    expect(result.every((e) => e.score === 5)).toBe(true)
  })

  it('large k keeps more items than offered', () => {
    const stream = new TopKStream<string>({ k: 10 })
    stream.offer('a', 5)
    stream.offer('b', 3)
    stream.offer('c', 7)
    const result = stream.getTopK()
    expect(result).toHaveLength(3)
    expect(result.map((e) => e.item)).toEqual(['c', 'a', 'b'])
  })

  it('getTopK returns items sorted by score descending', () => {
    const stream = new TopKStream<string>({ k: 3 })
    stream.offer('z', 1)
    stream.offer('y', 5)
    stream.offer('x', 3)
    const result = stream.getTopK()
    expect(result[0].score).toBeGreaterThan(result[1].score)
    expect(result[1].score).toBeGreaterThan(result[2].score)
  })

  it('getTopK returns array of item and score objects', () => {
    const stream = new TopKStream<string>({ k: 2 })
    stream.offer('a', 5)
    stream.offer('b', 10)
    const result = stream.getTopK()
    expect(result[0]).toHaveProperty('item', 'b')
    expect(result[0]).toHaveProperty('score', 10)
    expect(result[1]).toHaveProperty('item', 'a')
    expect(result[1]).toHaveProperty('score', 5)
  })

  it('getTopK returns empty array when no items offered', () => {
    const stream = new TopKStream<string>({ k: 5 })
    const result = stream.getTopK()
    expect(result).toEqual([])
  })

  it('getItems returns just items sorted by score', () => {
    const stream = new TopKStream<string>({ k: 3 })
    stream.offer('a', 5)
    stream.offer('b', 10)
    stream.offer('c', 3)
    const result = stream.getItems()
    expect(result).toEqual(['b', 'a', 'c'])
  })

  it('getItems returns empty array when no items offered', () => {
    const stream = new TopKStream<string>({ k: 5 })
    const result = stream.getItems()
    expect(result).toEqual([])
  })

  it('getScores returns just scores sorted descending', () => {
    const stream = new TopKStream<string>({ k: 3 })
    stream.offer('a', 5)
    stream.offer('b', 10)
    stream.offer('c', 3)
    const result = stream.getScores()
    expect(result).toEqual([10, 5, 3])
  })

  it('getScores returns empty array when no items offered', () => {
    const stream = new TopKStream<string>({ k: 5 })
    const result = stream.getScores()
    expect(result).toEqual([])
  })

  it('minScore returns undefined when empty', () => {
    const stream = new TopKStream<string>({ k: 5 })
    expect(stream.minScore).toBeUndefined()
  })

  it('minScore returns lowest score among current items', () => {
    const stream = new TopKStream<string>({ k: 3 })
    stream.offer('a', 10)
    stream.offer('b', 5)
    stream.offer('c', 15)
    expect(stream.minScore).toBe(5)
  })

  it('minScore updates after eviction', () => {
    const stream = new TopKStream<string>({ k: 2 })
    stream.offer('a', 10)
    stream.offer('b', 5)
    expect(stream.minScore).toBe(5)
    stream.offer('c', 8)
    expect(stream.minScore).toBe(8)
  })

  it('size returns number of items currently stored', () => {
    const stream = new TopKStream<string>({ k: 5 })
    expect(stream.size).toBe(0)
    stream.offer('a', 1)
    expect(stream.size).toBe(1)
    stream.offer('b', 2)
    expect(stream.size).toBe(2)
  })

  it('size does not exceed k', () => {
    const stream = new TopKStream<string>({ k: 3 })
    for (let i = 0; i < 10; i++) {
      stream.offer(`item${i}`, i)
    }
    expect(stream.size).toBe(3)
  })

  it('processed returns total number of offer calls', () => {
    const stream = new TopKStream<string>({ k: 3 })
    expect(stream.processed).toBe(0)
    stream.offer('a', 1)
    expect(stream.processed).toBe(1)
    stream.offer('b', 2)
    expect(stream.processed).toBe(2)
    stream.offer('c', 3)
    expect(stream.processed).toBe(3)
  })

  it('processed includes evicted items', () => {
    const stream = new TopKStream<string>({ k: 2 })
    stream.offer('a', 10)
    stream.offer('b', 5)
    stream.offer('c', 3)
    expect(stream.processed).toBe(3)
  })

  it('isFull returns true when size equals k', () => {
    const stream = new TopKStream<string>({ k: 2 })
    expect(stream.isFull).toBe(false)
    stream.offer('a', 1)
    expect(stream.isFull).toBe(false)
    stream.offer('b', 2)
    expect(stream.isFull).toBe(true)
  })

  it('isFull remains true after eviction', () => {
    const stream = new TopKStream<string>({ k: 2 })
    stream.offer('a', 10)
    stream.offer('b', 5)
    expect(stream.isFull).toBe(true)
    stream.offer('c', 8)
    expect(stream.isFull).toBe(true)
  })

  it('clear resets all state', () => {
    const stream = new TopKStream<string>({ k: 3 })
    stream.offer('a', 1)
    stream.offer('b', 2)
    stream.offer('c', 3)
    stream.clear()
    expect(stream.size).toBe(0)
    expect(stream.processed).toBe(0)
    expect(stream.isFull).toBe(false)
    expect(stream.minScore).toBeUndefined()
    expect(stream.getTopK()).toEqual([])
  })

  it('merge combines two streams', () => {
    const stream1 = new TopKStream<string>({ k: 3 })
    stream1.offer('a', 10)
    stream1.offer('b', 5)
    const stream2 = new TopKStream<string>({ k: 3 })
    stream2.offer('c', 15)
    stream2.offer('d', 3)
    stream1.merge(stream2)
    const result = stream1.getTopK()
    expect(result.map((e) => e.score)).toEqual([15, 10, 5])
  })

  it('merge updates processed count from other stream', () => {
    const stream1 = new TopKStream<string>({ k: 3 })
    stream1.offer('a', 1)
    const stream2 = new TopKStream<string>({ k: 3 })
    stream2.offer('b', 2)
    stream2.offer('c', 3)
    stream1.merge(stream2)
    expect(stream1.processed).toBe(3)
  })

  it('fromItems creates stream from array of items', () => {
    const items = [
      { item: 'a', score: 5 },
      { item: 'b', score: 10 },
      { item: 'c', score: 3 },
    ]
    const stream = TopKStream.fromItems(items, { k: 2 })
    const result = stream.getTopK()
    expect(result.map((e) => e.item)).toEqual(['b', 'a'])
  })

  it('fromItems handles empty array', () => {
    const stream = TopKStream.fromItems([], { k: 5 })
    expect(stream.size).toBe(0)
    expect(stream.getTopK()).toEqual([])
  })

  it('fromItems accepts custom comparator', () => {
    const items = [
      { item: 'a', score: 5 },
      { item: 'b', score: 10 },
      { item: 'c', score: 3 },
    ]
    const stream = TopKStream.fromItems(items, { k: 2, comparator: (a, b) => b - a })
    const result = stream.getTopK()
    expect(result.map((e) => e.score)).toEqual([3, 5])
  })

  it('large stream with 1000+ offers maintains top-10', () => {
    const stream = new TopKStream<number>({ k: 10 })
    for (let i = 0; i < 1000; i++) {
      stream.offer(i, i)
    }
    const result = stream.getTopK()
    expect(result).toHaveLength(10)
    expect(result[0].score).toBe(999)
    expect(result[9].score).toBe(990)
    expect(stream.processed).toBe(1000)
  })

  it('large stream with duplicate scores handles eviction correctly', () => {
    const stream = new TopKStream<number>({ k: 3 })
    for (let i = 0; i < 100; i++) {
      stream.offer(i, 5)
    }
    const result = stream.getTopK()
    expect(result).toHaveLength(3)
    expect(result.every((e) => e.score === 5)).toBe(true)
  })

  it('handles negative scores', () => {
    const stream = new TopKStream<number>({ k: 2 })
    stream.offer(1, -10)
    stream.offer(2, -5)
    stream.offer(3, -15)
    const result = stream.getTopK()
    expect(result.map((e) => e.score)).toEqual([-5, -10])
  })

  it('handles floating point scores', () => {
    const stream = new TopKStream<number>({ k: 2 })
    stream.offer(1, 3.14)
    stream.offer(2, 2.71)
    stream.offer(3, 1.41)
    const result = stream.getTopK()
    expect(result.map((e) => e.score)).toEqual([3.14, 2.71])
  })

  it('handles complex item types', () => {
    interface ComplexItem {
      id: number
      name: string
    }
    const stream = new TopKStream<ComplexItem>({ k: 2 })
    stream.offer({ id: 1, name: 'first' }, 5)
    stream.offer({ id: 2, name: 'second' }, 10)
    stream.offer({ id: 3, name: 'third' }, 3)
    const result = stream.getTopK()
    expect(result[0].item.id).toBe(2)
    expect(result[0].item.name).toBe('second')
    expect(result[0].score).toBe(10)
  })

  it('getTopK returns new array, not reference to internal state', () => {
    const stream = new TopKStream<string>({ k: 2 })
    stream.offer('a', 5)
    const result1 = stream.getTopK()
    const result2 = stream.getTopK()
    expect(result1).not.toBe(result2)
  })

  it('multiple offers with same item but different scores', () => {
    const stream = new TopKStream<string>({ k: 2 })
    stream.offer('x', 5)
    stream.offer('x', 10)
    stream.offer('x', 3)
    const result = stream.getTopK()
    expect(result).toHaveLength(2)
    expect(result[0].item).toBe('x')
    expect(result[0].score).toBe(10)
  })
})