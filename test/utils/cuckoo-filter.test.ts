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

describe('CuckooFilter edge cases', () => {
  it('handles empty string', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    cf.insert('')
    expect(cf.contains('')).toBe(true)
    expect(cf.remove('')).toBe(true)
    expect(cf.contains('')).toBe(false)
  })

  it('handles unicode strings', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    cf.insert('日本語テスト')
    expect(cf.contains('日本語テスト')).toBe(true)
    expect(cf.contains('日本語')).toBe(false)
  })

  it('handles numbers as strings', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    cf.insert('42')
    expect(cf.contains('42')).toBe(true)
    expect(cf.contains(42 as unknown as string)).toBe(false)
  })

  it('re-insert after remove works', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    cf.insert('x')
    cf.remove('x')
    expect(cf.contains('x')).toBe(false)
    cf.insert('x')
    expect(cf.contains('x')).toBe(true)
    expect(cf.size).toBe(1)
  })

  it('loadFactor approaches 1 as filter fills', () => {
    const cf = new CuckooFilter({ capacity: 50 })
    for (let i = 0; i < 40; i++) {
      cf.insert(`item-${i}`)
    }
    expect(cf.loadFactor).toBeGreaterThan(0.5)
  })

  it('clear allows reinsertion', () => {
    const cf = new CuckooFilter({ capacity: 50 })
    for (let i = 0; i < 10; i++) {
      cf.insert(`item-${i}`)
    }
    cf.clear()
    for (let i = 0; i < 10; i++) {
      expect(cf.insert(`item-${i}`)).toBe(true)
    }
    for (let i = 0; i < 10; i++) {
      expect(cf.contains(`item-${i}`)).toBe(true)
    }
  })

  it('size tracks insertions', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    expect(cf.size).toBe(0)
    cf.insert('a')
    expect(cf.size).toBe(1)
    cf.insert('b')
    expect(cf.size).toBe(2)
  })

  it('remove decreases size', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    cf.insert('a')
    cf.insert('b')
    expect(cf.size).toBe(2)
    cf.remove('a')
    expect(cf.size).toBe(1)
  })

  it('contains returns false after removal', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    cf.insert('test')
    cf.remove('test')
    expect(cf.contains('test')).toBe(false)
  })
})
