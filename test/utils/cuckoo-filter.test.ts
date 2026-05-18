import { describe, expect, it } from 'vitest'
import { CuckooFilter } from '../../src/utils/cuckoo-filter.js'

// ─── Construction ───

describe('CuckooFilter construction', () => {
  it('creates with capacity', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    expect(cf.size).toBe(0)
    expect(cf.isEmpty()).toBe(true)
    expect(cf.capacity).toBeGreaterThan(0)
  })

  it('throws on zero capacity', () => {
    expect(() => new CuckooFilter({ capacity: 0 })).toThrow(RangeError)
  })
})

// ─── Insert & Contains ───

describe('CuckooFilter insert & contains', () => {
  it('inserts and contains an item', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    expect(cf.insert('hello')).toBe(true)
    expect(cf.contains('hello')).toBe(true)
    expect(cf.size).toBe(1)
  })

  it('contains returns false for missing item', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    expect(cf.contains('missing')).toBe(false)
  })

  it('inserts multiple items', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    const items = ['a', 'b', 'c', 'd', 'e']
    for (const item of items) {
      cf.insert(item)
    }
    for (const item of items) {
      expect(cf.contains(item)).toBe(true)
    }
    expect(cf.size).toBe(5)
  })
})

// ─── Remove ───

describe('CuckooFilter remove', () => {
  it('removes an inserted item', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    cf.insert('hello')
    expect(cf.remove('hello')).toBe(true)
    expect(cf.size).toBe(0)
  })

  it('returns false for non-existent item', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    expect(cf.remove('missing')).toBe(false)
  })
})

// ─── Clear ───

describe('CuckooFilter clear', () => {
  it('clears the filter', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    cf.insert('a')
    cf.insert('b')
    cf.clear()
    expect(cf.size).toBe(0)
    expect(cf.isEmpty()).toBe(true)
    expect(cf.contains('a')).toBe(false)
  })
})

// ─── Load Factor ───

describe('CuckooFilter loadFactor', () => {
  it('tracks load factor', () => {
    const cf = new CuckooFilter({ capacity: 20 })
    expect(cf.loadFactor).toBe(0)
    cf.insert('a')
    expect(cf.loadFactor).toBeGreaterThan(0)
  })
})

// ─── Capacity ───

describe('CuckooFilter capacity', () => {
  it('capacity equals buckets * bucketSize', () => {
    const cf = new CuckooFilter({ capacity: 50, bucketSize: 4 })
    expect(cf.capacity).toBeGreaterThanOrEqual(50)
  })
})
