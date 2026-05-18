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
