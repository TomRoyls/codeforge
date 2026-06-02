import { describe, it, expect } from 'vitest'
import { SimpleBloomFilter } from '../../src/utils/simple-bloom-filter.js'

// ─── Constructor ──────────────────────────────────────────
describe('SimpleBloomFilter - constructor', () => {
  it('creates with valid params', () => {
    const bf = new SimpleBloomFilter(100)
    expect(bf.capacity).toBe(100)
    expect(bf.size).toBe(0)
    expect(bf.isEmpty).toBe(true)
  })

  it('throws on capacity < 1', () => {
    expect(() => new SimpleBloomFilter(0)).toThrow(RangeError)
  })

  it('throws on invalid falsePositiveRate', () => {
    expect(() => new SimpleBloomFilter(100, 0)).toThrow(RangeError)
    expect(() => new SimpleBloomFilter(100, 1)).toThrow(RangeError)
  })
})

// ─── Add and Has ──────────────────────────────────────────
describe('SimpleBloomFilter - add and has', () => {
  it('finds added items', () => {
    const bf = new SimpleBloomFilter(100)
    bf.add('hello')
    bf.add('world')
    expect(bf.has('hello')).toBe(true)
    expect(bf.has('world')).toBe(true)
  })

  it('tracks size', () => {
    const bf = new SimpleBloomFilter(100)
    bf.add('a')
    bf.add('b')
    expect(bf.size).toBe(2)
  })

  it('returns stats', () => {
    const bf = new SimpleBloomFilter(100, 0.01)
    bf.add('test')
    const stats = bf.stats()
    expect(stats.capacity).toBe(100)
    expect(stats.size).toBe(1)
    expect(stats.bitCount).toBeGreaterThan(0)
    expect(stats.hashCount).toBeGreaterThan(0)
  })
})

// ─── Clear ────────────────────────────────────────────────
describe('SimpleBloomFilter - clear', () => {
  it('clears all items', () => {
    const bf = new SimpleBloomFilter(100)
    bf.add('a')
    bf.add('b')
    bf.clear()
    expect(bf.size).toBe(0)
    expect(bf.isEmpty).toBe(true)
  })
})

// ─── False positive rate ──────────────────────────────────
describe('SimpleBloomFilter - falsePositiveRate', () => {
  it('returns 0 when empty', () => {
    const bf = new SimpleBloomFilter(100)
    expect(bf.falsePositiveRate).toBe(0)
  })

  it('increases with more items', () => {
    const bf = new SimpleBloomFilter(10, 0.01)
    for (let i = 0; i < 10; i++) bf.add(`item-${i}`)
    const fpr = bf.falsePositiveRate
    expect(fpr).toBeGreaterThan(0)
  })
})

describe('SimpleBloomFilter - edge cases', () => {
  it('handles empty string', () => {
    const bf = new SimpleBloomFilter(100)
    bf.add('')
    expect(bf.has('')).toBe(true)
  })

  it('handles unicode strings', () => {
    const bf = new SimpleBloomFilter(100)
    bf.add('日本語')
    expect(bf.has('日本語')).toBe(true)
    expect(bf.has('english')).toBe(false)
  })

  it('handles duplicate adds', () => {
    const bf = new SimpleBloomFilter(100)
    bf.add('test')
    bf.add('test')
    bf.add('test')
    expect(bf.size).toBe(3)
    expect(bf.has('test')).toBe(true)
  })

  it('clear allows re-adding items', () => {
    const bf = new SimpleBloomFilter(100)
    bf.add('a')
    bf.add('b')
    bf.clear()
    bf.add('c')
    expect(bf.has('c')).toBe(true)
    expect(bf.size).toBe(1)
  })

  it('has low false positive rate for small fill', () => {
    const bf = new SimpleBloomFilter(1000, 0.001)
    for (let i = 0; i < 100; i++) bf.add(`item-${i}`)
    let falsePositives = 0
    for (let i = 100; i < 200; i++) {
      if (bf.has(`item-${i}`)) falsePositives++
    }
    expect(falsePositives).toBeLessThan(10)
  })

  it('stats includes all fields', () => {
    const bf = new SimpleBloomFilter(50, 0.01)
    bf.add('x')
    const s = bf.stats()
    expect(s).toHaveProperty('capacity')
    expect(s).toHaveProperty('size')
    expect(s).toHaveProperty('bitCount')
    expect(s).toHaveProperty('hashCount')
    expect(s).toHaveProperty('falsePositiveRate')
    expect(s.hashCount).toBeGreaterThanOrEqual(1)
  })

  it('works with single-item capacity', () => {
    const bf = new SimpleBloomFilter(1)
    bf.add('only')
    expect(bf.has('only')).toBe(true)
    expect(bf.size).toBe(1)
  })

  it('has returns false for missing items', () => {
    const bf = new SimpleBloomFilter(100)
    expect(bf.has('absent')).toBe(false)
  })

  it('add and has for multiple items', () => {
    const bf = new SimpleBloomFilter(100)
    bf.add('a')
    bf.add('b')
    bf.add('c')
    expect(bf.has('a')).toBe(true)
    expect(bf.has('b')).toBe(true)
    expect(bf.has('c')).toBe(true)
  })

  it('has returns false for non-inserted item', () => {
    const bf = new SimpleBloomFilter(100)
    bf.add('x')
    expect(bf.has('y')).toBe(false)
  })

  it('has returns true for added element', () => {
    const bf = new SimpleBloomFilter(100)
    bf.add('hello')
    expect(bf.has('hello')).toBe(true)
  })
})
