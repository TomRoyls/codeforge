import { describe, expect, it } from 'vitest'
import { CountingBloomFilter } from '../../src/utils/counting-bloom-filter.js'

// ─── Construction ───

describe('CountingBloomFilter construction', () => {
  it('creates with capacity', () => {
    const bf = new CountingBloomFilter(100)
    expect(bf.size).toBe(0)
    expect(bf.isEmpty).toBe(true)
  })

  it('throws on zero capacity', () => {
    expect(() => new CountingBloomFilter(0)).toThrow(RangeError)
  })

  it('throws on invalid false positive rate', () => {
    expect(() => new CountingBloomFilter(100, 0)).toThrow(RangeError)
    expect(() => new CountingBloomFilter(100, 1)).toThrow(RangeError)
    expect(() => new CountingBloomFilter(100, -0.1)).toThrow(RangeError)
  })
})

// ─── Add & Has ───

describe('CountingBloomFilter add & has', () => {
  it('adds and checks items', () => {
    const bf = new CountingBloomFilter(100)
    bf.add('hello')
    expect(bf.has('hello')).toBe(true)
    expect(bf.size).toBe(1)
  })

  it('returns false for missing items', () => {
    const bf = new CountingBloomFilter(100)
    expect(bf.has('missing')).toBe(false)
  })

  it('adds multiple items', () => {
    const bf = new CountingBloomFilter(100)
    const items = ['a', 'b', 'c', 'd', 'e']
    for (const item of items) bf.add(item)
    for (const item of items) expect(bf.has(item)).toBe(true)
    expect(bf.size).toBe(5)
  })

  it('adds duplicate item increments size', () => {
    const bf = new CountingBloomFilter(100)
    bf.add('x')
    bf.add('x')
    expect(bf.size).toBe(2)
  })
})

// ─── Remove ───

describe('CountingBloomFilter remove', () => {
  it('removes an added item', () => {
    const bf = new CountingBloomFilter(100)
    bf.add('hello')
    expect(bf.remove('hello')).toBe(true)
    expect(bf.size).toBe(0)
  })

  it('returns false for non-added item', () => {
    const bf = new CountingBloomFilter(100)
    expect(bf.remove('missing')).toBe(false)
  })

  it('can add back after remove', () => {
    const bf = new CountingBloomFilter(100)
    bf.add('x')
    bf.remove('x')
    bf.add('x')
    expect(bf.has('x')).toBe(true)
    expect(bf.size).toBe(1)
  })
})

// ─── Stats ───

describe('CountingBloomFilter stats', () => {
  it('returns stats object', () => {
    const bf = new CountingBloomFilter(100)
    bf.add('test')
    const stats = bf.stats()
    expect(stats.capacity).toBe(100)
    expect(stats.size).toBe(1)
    expect(stats.counterCount).toBeGreaterThan(0)
    expect(stats.hashCount).toBeGreaterThan(0)
    expect(stats.falsePositiveRate).toBeGreaterThanOrEqual(0)
  })

  it('falsePositiveRate is 0 when empty', () => {
    const bf = new CountingBloomFilter(100)
    expect(bf.falsePositiveRate).toBe(0)
  })
})

// ─── Clear ───

describe('CountingBloomFilter clear', () => {
  it('clears the filter', () => {
    const bf = new CountingBloomFilter(100)
    bf.add('a')
    bf.add('b')
    bf.clear()
    expect(bf.size).toBe(0)
    expect(bf.isEmpty).toBe(true)
  })

  it('handles many add-remove cycles', () => {
    const bf = new CountingBloomFilter(100)
    for (let i = 0; i < 20; i++) {
      bf.add(`item-${i}`)
    }
    for (let i = 0; i < 20; i++) {
      bf.remove(`item-${i}`)
    }
    expect(bf.size).toBe(0)
  })

  it('handles unicode keys', () => {
    const bf = new CountingBloomFilter(50)
    bf.add('日本語')
    bf.add('🎉')
    expect(bf.has('日本語')).toBe(true)
    expect(bf.has('🎉')).toBe(true)
  })

  it('isEmpty after removing all', () => {
    const bf = new CountingBloomFilter(100)
    bf.add('x')
    bf.add('y')
    bf.remove('x')
    bf.remove('y')
    expect(bf.isEmpty).toBe(true)
  })

  it('adding same item multiple times increases count', () => {
    const bf = new CountingBloomFilter(100)
    bf.add('a')
    bf.add('a')
    bf.add('a')
    expect(bf.has('a')).toBe(true)
    bf.remove('a')
    expect(bf.has('a')).toBe(true)
    bf.remove('a')
    expect(bf.has('a')).toBe(true)
    bf.remove('a')
    expect(bf.isEmpty).toBe(true)
  })
})
