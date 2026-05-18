import { describe, it, expect } from 'vitest'
import { SimpleBloomFilter } from '../src/utils/simple-bloom-filter.js'

// ─── Constructor ───

describe('SimpleBloomFilter', () => {
  it('creates with default false positive rate', () => {
    const bf = new SimpleBloomFilter(1000)
    expect(bf.capacity).toBe(1000)
    expect(bf.size).toBe(0)
    expect(bf.isEmpty).toBe(true)
  })

  it('creates with custom false positive rate', () => {
    const bf = new SimpleBloomFilter(1000, 0.001)
    expect(bf.capacity).toBe(1000)
  })

  it('throws for capacity < 1', () => {
    expect(() => new SimpleBloomFilter(0)).toThrow(RangeError)
    expect(() => new SimpleBloomFilter(-1)).toThrow(RangeError)
  })

  it('throws for invalid false positive rate', () => {
    expect(() => new SimpleBloomFilter(100, 0)).toThrow(RangeError)
    expect(() => new SimpleBloomFilter(100, 1)).toThrow(RangeError)
    expect(() => new SimpleBloomFilter(100, -0.1)).toThrow(RangeError)
  })

  // ─── Add / Has ───

  it('add and has work for single item', () => {
    const bf = new SimpleBloomFilter(100)
    bf.add('hello')
    expect(bf.has('hello')).toBe(true)
    expect(bf.size).toBe(1)
  })

  it('has returns false for missing item', () => {
    const bf = new SimpleBloomFilter(100)
    bf.add('hello')
    expect(bf.has('world')).toBe(false)
  })

  it('has returns false on empty filter', () => {
    const bf = new SimpleBloomFilter(100)
    expect(bf.has('anything')).toBe(false)
  })

  it('add multiple items', () => {
    const bf = new SimpleBloomFilter(1000)
    bf.add('a')
    bf.add('b')
    bf.add('c')
    expect(bf.size).toBe(3)
    expect(bf.has('a')).toBe(true)
    expect(bf.has('b')).toBe(true)
    expect(bf.has('c')).toBe(true)
  })

  it('never produces false negatives', () => {
    const bf = new SimpleBloomFilter(100, 0.01)
    for (let i = 0; i < 100; i++) {
      bf.add(`item-${i}`)
    }
    for (let i = 0; i < 100; i++) {
      expect(bf.has(`item-${i}`)).toBe(true)
    }
  })

  // ─── Clear ───

  it('clear resets filter', () => {
    const bf = new SimpleBloomFilter(100)
    bf.add('test')
    bf.clear()
    expect(bf.size).toBe(0)
    expect(bf.isEmpty).toBe(true)
  })

  it('filter usable after clear', () => {
    const bf = new SimpleBloomFilter(100)
    bf.add('old')
    bf.clear()
    bf.add('new')
    expect(bf.has('new')).toBe(true)
  })

  // ─── Stats ───

  it('stats returns correct info', () => {
    const bf = new SimpleBloomFilter(100, 0.01)
    bf.add('a')
    bf.add('b')
    const stats = bf.stats()
    expect(stats.capacity).toBe(100)
    expect(stats.size).toBe(2)
    expect(stats.bitCount).toBeGreaterThan(0)
    expect(stats.hashCount).toBeGreaterThanOrEqual(1)
    expect(stats.falsePositiveRate).toBeGreaterThanOrEqual(0)
  })

  it('falsePositiveRate is 0 when empty', () => {
    const bf = new SimpleBloomFilter(100)
    expect(bf.falsePositiveRate).toBe(0)
  })

  // ─── Edge cases ───

  it('handles empty string', () => {
    const bf = new SimpleBloomFilter(100)
    bf.add('')
    expect(bf.has('')).toBe(true)
  })

  it('handles unicode strings', () => {
    const bf = new SimpleBloomFilter(100)
    bf.add('日本語')
    bf.add('中文')
    expect(bf.has('日本語')).toBe(true)
    expect(bf.has('中文')).toBe(true)
  })

  it('handles special characters', () => {
    const bf = new SimpleBloomFilter(100)
    bf.add('hello\nworld')
    bf.add('tab\there')
    expect(bf.has('hello\nworld')).toBe(true)
    expect(bf.has('tab\there')).toBe(true)
  })

  it('capacity 1 filter', () => {
    const bf = new SimpleBloomFilter(1)
    bf.add('only')
    expect(bf.has('only')).toBe(true)
  })

  it('empirical false positive rate within bounds', () => {
    const bf = new SimpleBloomFilter(1000, 0.01)
    for (let i = 0; i < 1000; i++) bf.add(`item-${i}`)
    let falsePositives = 0
    const trials = 10000
    for (let i = 0; i < trials; i++) {
      if (bf.has(`absent-${i}`)) falsePositives++
    }
    const empiricalFPR = falsePositives / trials
    expect(empiricalFPR).toBeLessThan(0.05)
  })

  it('duplicate adds increment size', () => {
    const bf = new SimpleBloomFilter(100)
    bf.add('same')
    bf.add('same')
    expect(bf.size).toBe(2)
  })
})
