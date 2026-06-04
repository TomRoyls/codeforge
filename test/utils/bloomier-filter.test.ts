import { describe, expect, it } from 'vitest'

import { BloomierFilter } from '../../src/utils/bloomier-filter.js'

// ─── Empty filter ──────────────────────────────────────
describe('BloomierFilter empty filter', () => {
  it('creates from empty map', () => {
    const bf = BloomierFilter.create(new Map<string, number>())
    expect(bf.size).toBe(0)
    expect(bf.capacity).toBe(0)
  })

  it('returns undefined for get on empty filter', () => {
    const bf = BloomierFilter.create(new Map<string, number>())
    expect(bf.get('anything')).toBeUndefined()
  })

  it('returns false for has on empty filter', () => {
    const bf = BloomierFilter.create(new Map<string, number>())
    expect(bf.has('anything')).toBe(false)
  })

  it('reports falsePositiveRate of 0 for empty filter', () => {
    const bf = BloomierFilter.create(new Map<string, number>())
    expect(bf.falsePositiveRate).toBe(0)
  })
})

// ─── Single entry ──────────────────────────────────────
describe('BloomierFilter single entry', () => {
  it('returns correct value for single key', () => {
    const entries = new Map<string, number>()
    entries.set('alpha', 42)
    const bf = BloomierFilter.create(entries)
    expect(bf.get('alpha')).toBe(42)
  })

  it('returns true for has on single key', () => {
    const entries = new Map<string, number>()
    entries.set('alpha', 42)
    const bf = BloomierFilter.create(entries)
    expect(bf.has('alpha')).toBe(true)
  })

  it('reports size 1', () => {
    const entries = new Map<string, number>()
    entries.set('alpha', 42)
    const bf = BloomierFilter.create(entries)
    expect(bf.size).toBe(1)
  })
})

// ─── Multiple entries ──────────────────────────────────
describe('BloomierFilter multiple entries', () => {
  const entries = new Map<string, number>()
  entries.set('red', 1)
  entries.set('green', 2)
  entries.set('blue', 3)
  entries.set('yellow', 4)
  entries.set('purple', 5)
  const bf = BloomierFilter.create(entries)

  it('returns correct value for each key', () => {
    expect(bf.get('red')).toBe(1)
    expect(bf.get('green')).toBe(2)
    expect(bf.get('blue')).toBe(3)
    expect(bf.get('yellow')).toBe(4)
    expect(bf.get('purple')).toBe(5)
  })

  it('returns true for has on all inserted keys', () => {
    expect(bf.has('red')).toBe(true)
    expect(bf.has('green')).toBe(true)
    expect(bf.has('blue')).toBe(true)
    expect(bf.has('yellow')).toBe(true)
    expect(bf.has('purple')).toBe(true)
  })

  it('returns false for has on non-inserted keys', () => {
    expect(bf.has('orange')).toBe(false)
    expect(bf.has('cyan')).toBe(false)
    expect(bf.has('magenta')).toBe(false)
  })

  it('reports correct size', () => {
    expect(bf.size).toBe(5)
  })

  it('capacity is greater than or equal to size', () => {
    expect(bf.capacity).toBeGreaterThanOrEqual(bf.size)
  })
})

// ─── Same value for multiple keys ──────────────────────
describe('BloomierFilter same value for multiple keys', () => {
  it('handles multiple keys with the same value', () => {
    const entries = new Map<string, number>()
    entries.set('a', 99)
    entries.set('b', 99)
    entries.set('c', 99)
    const bf = BloomierFilter.create(entries)
    expect(bf.get('a')).toBe(99)
    expect(bf.get('b')).toBe(99)
    expect(bf.get('c')).toBe(99)
    expect(bf.size).toBe(3)
  })
})

// ─── Large dataset ─────────────────────────────────────
describe('BloomierFilter large dataset', () => {
  const entries = new Map<string, number>()
  for (let i = 0; i < 100; i++) {
    entries.set(`key-${i}`, i * 7)
  }
  const bf = BloomierFilter.create(entries)

  it('returns correct values for all 100 keys', () => {
    for (let i = 0; i < 100; i++) {
      expect(bf.get(`key-${i}`)).toBe(i * 7)
    }
  })

  it('has returns true for all inserted keys', () => {
    for (let i = 0; i < 100; i++) {
      expect(bf.has(`key-${i}`)).toBe(true)
    }
  })

  it('has returns false for non-inserted keys', () => {
    for (let i = 100; i < 150; i++) {
      expect(bf.has(`nonkey-${i}`)).toBe(false)
    }
  })

  it('reports correct size', () => {
    expect(bf.size).toBe(100)
  })
})

// ─── Seed and recreation ───────────────────────────────
describe('BloomierFilter seed and recreation', () => {
  it('creates with explicit seed', () => {
    const entries = new Map<string, number>()
    entries.set('x', 10)
    entries.set('y', 20)
    const bf = BloomierFilter.create(entries, 12345)
    expect(bf.get('x')).toBe(10)
    expect(bf.get('y')).toBe(20)
  })

  it('re-creating with same entries produces consistent results', () => {
    const entries = new Map<string, number>()
    entries.set('hello', 1)
    entries.set('world', 2)
    const bf1 = BloomierFilter.create(entries)
    const bf2 = BloomierFilter.create(entries)
    expect(bf1.get('hello')).toBe(bf2.get('hello'))
    expect(bf1.get('world')).toBe(bf2.get('world'))
  })

  it('creates with different seeds', () => {
    const entries = new Map<string, number>()
    entries.set('test', 55)
    const bf1 = BloomierFilter.create(entries, 1)
    const bf2 = BloomierFilter.create(entries, 999)
    expect(bf1.get('test')).toBe(55)
    expect(bf2.get('test')).toBe(55)
  })
})

// ─── Stats and properties ──────────────────────────────
describe('BloomierFilter stats and properties', () => {
  it('stats returns expected shape', () => {
    const entries = new Map<string, number>()
    entries.set('a', 1)
    entries.set('b', 2)
    const bf = BloomierFilter.create(entries)
    const stats = bf.stats()
    expect(stats.size).toBe(2)
    expect(stats.capacity).toBeGreaterThan(0)
    expect(stats.hashCount).toBeGreaterThanOrEqual(3)
    expect(stats.falsePositiveRate).toBeGreaterThanOrEqual(0)
    expect(stats.falsePositiveRate).toBeLessThanOrEqual(1)
  })

  it('falsePositiveRate is between 0 and 1 for non-empty filter', () => {
    const entries = new Map<string, number>()
    for (let i = 0; i < 50; i++) {
      entries.set(`k${i}`, i)
    }
    const bf = BloomierFilter.create(entries)
    expect(bf.falsePositiveRate).toBeGreaterThanOrEqual(0)
    expect(bf.falsePositiveRate).toBeLessThanOrEqual(1)
  })
})

// ─── Negative and zero values ──────────────────────────
describe('BloomierFilter negative and zero values', () => {
  it('handles zero values', () => {
    const entries = new Map<string, number>()
    entries.set('zero', 0)
    entries.set('nonzero', 5)
    const bf = BloomierFilter.create(entries)
    expect(bf.get('zero')).toBe(0)
    expect(bf.get('nonzero')).toBe(5)
  })

  it('handles negative values', () => {
    const entries = new Map<string, number>()
    entries.set('neg', -42)
    entries.set('pos', 42)
    const bf = BloomierFilter.create(entries)
    expect(bf.get('neg')).toBe(-42)
    expect(bf.get('pos')).toBe(42)
  })

  it('create with empty map returns filter', () => {
    const bf = BloomierFilter.create(new Map<string, number>())
    expect(bf).toBeDefined()
  })
})
