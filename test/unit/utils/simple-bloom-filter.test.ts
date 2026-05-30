import { describe, expect, it } from 'vitest'
import { SimpleBloomFilter } from '../../../src/utils/simple-bloom-filter.js'

describe('SimpleBloomFilter', () => {
  it('creates filter with valid capacity', () => {
    const bf = new SimpleBloomFilter(100)
    expect(bf.size).toBe(0)
    expect(bf.isEmpty).toBe(true)
  })

  it('throws for capacity < 1', () => {
    expect(() => new SimpleBloomFilter(0)).toThrow(RangeError)
    expect(() => new SimpleBloomFilter(-1)).toThrow(RangeError)
  })

  it('throws for invalid false positive rate', () => {
    expect(() => new SimpleBloomFilter(100, 0)).toThrow(RangeError)
    expect(() => new SimpleBloomFilter(100, 1)).toThrow(RangeError)
    expect(() => new SimpleBloomFilter(100, -0.5)).toThrow(RangeError)
  })

  it('adds items and reports size', () => {
    const bf = new SimpleBloomFilter(100)
    bf.add('hello')
    bf.add('world')
    expect(bf.size).toBe(2)
    expect(bf.isEmpty).toBe(false)
  })

  it('has returns true for added items', () => {
    const bf = new SimpleBloomFilter(100)
    bf.add('hello')
    expect(bf.has('hello')).toBe(true)
  })

  it('has returns false for items not added', () => {
    const bf = new SimpleBloomFilter(100)
    bf.add('hello')
    expect(bf.has('world')).toBe(false)
  })

  it('never produces false negatives', () => {
    const bf = new SimpleBloomFilter(100)
    const items = Array.from({ length: 50 }, (_, i) => `item-${i}`)
    for (const item of items) {
      bf.add(item)
    }
    for (const item of items) {
      expect(bf.has(item)).toBe(true)
    }
  })

  it('has reasonable false positive rate', () => {
    const bf = new SimpleBloomFilter(1000, 0.01)
    const items = Array.from({ length: 500 }, (_, i) => `item-${i}`)
    for (const item of items) {
      bf.add(item)
    }
    let falsePositives = 0
    const testCount = 1000
    for (let i = 0; i < testCount; i++) {
      if (bf.has(`nonexistent-${i}`)) {
        falsePositives++
      }
    }
    expect(falsePositives / testCount).toBeLessThan(0.1)
  })

  it('clears the filter', () => {
    const bf = new SimpleBloomFilter(100)
    bf.add('hello')
    bf.add('world')
    bf.clear()
    expect(bf.size).toBe(0)
    expect(bf.isEmpty).toBe(true)
    expect(bf.has('hello')).toBe(false)
    expect(bf.has('world')).toBe(false)
  })

  it('returns stats', () => {
    const bf = new SimpleBloomFilter(100)
    bf.add('hello')
    const stats = bf.stats()
    expect(stats.capacity).toBe(100)
    expect(stats.size).toBe(1)
    expect(stats.bitCount).toBeGreaterThan(0)
    expect(stats.hashCount).toBeGreaterThan(0)
  })

  it('capacity getter returns capacity', () => {
    const bf = new SimpleBloomFilter(200)
    expect(bf.capacity).toBe(200)
  })

  it('falsePositiveRate is 0 when empty', () => {
    const bf = new SimpleBloomFilter(100)
    expect(bf.falsePositiveRate).toBe(0)
  })

  it('falsePositiveRate increases with items', () => {
    const bf = new SimpleBloomFilter(50)
    bf.add('a')
    const rate1 = bf.falsePositiveRate
    for (let i = 0; i < 40; i++) {
      bf.add(`item-${i}`)
    }
    const rate2 = bf.falsePositiveRate
    expect(rate2).toBeGreaterThanOrEqual(rate1)
  })

  it('handles single item', () => {
    const bf = new SimpleBloomFilter(10)
    bf.add('only')
    expect(bf.has('only')).toBe(true)
    expect(bf.size).toBe(1)
  })

  it('handles empty string', () => {
    const bf = new SimpleBloomFilter(100)
    bf.add('')
    expect(bf.has('')).toBe(true)
  })

  it('handles unicode strings', () => {
    const bf = new SimpleBloomFilter(100)
    bf.add('日本語')
    bf.add('emoji🎉')
    expect(bf.has('日本語')).toBe(true)
    expect(bf.has('emoji🎉')).toBe(true)
  })

  it('handles long strings', () => {
    const bf = new SimpleBloomFilter(100)
    const longStr = 'a'.repeat(10000)
    bf.add(longStr)
    expect(bf.has(longStr)).toBe(true)
  })

  it('works with very low false positive rate', () => {
    const bf = new SimpleBloomFilter(100, 0.001)
    bf.add('test')
    expect(bf.has('test')).toBe(true)
  })

  it('works with higher false positive rate', () => {
    const bf = new SimpleBloomFilter(100, 0.1)
    bf.add('test')
    expect(bf.has('test')).toBe(true)
  })

  it('maintains no false negatives after many adds', () => {
    const bf = new SimpleBloomFilter(1000)
    const items = Array.from({ length: 100 }, (_, i) => `item-${i}`)
    for (const item of items) {
      bf.add(item)
    }
    for (const item of items) {
      expect(bf.has(item)).toBe(true)
    }
  })

  it('size tracks adds correctly', () => {
    const bf = new SimpleBloomFilter(100)
    expect(bf.size).toBe(0)
    bf.add('a')
    expect(bf.size).toBe(1)
    bf.add('b')
    expect(bf.size).toBe(2)
    bf.add('a')
    expect(bf.size).toBe(3)
  })
})
