import { describe, it, expect, beforeEach } from 'vitest'
import { CuckooFilter } from '../src/utils/cuckoo-filter.js'

describe('CuckooFilter', () => {
  let filter: CuckooFilter

  beforeEach(() => {
    filter = new CuckooFilter({ capacity: 1000 })
  })

  // ─── constructor ───

  describe('constructor', () => {
    it('creates filter with capacity', () => {
      const f = new CuckooFilter({ capacity: 500 })
      expect(f.capacity).toBeGreaterThan(0)
    })

    it('throws on invalid capacity', () => {
      expect(() => new CuckooFilter({ capacity: 0 })).toThrow(RangeError)
      expect(() => new CuckooFilter({ capacity: -1 })).toThrow(RangeError)
    })
  })

  // ─── insert ───

  describe('insert', () => {
    it('adds items and returns true', () => {
      expect(filter.insert('hello')).toBe(true)
      expect(filter.insert('world')).toBe(true)
    })
  })

  // ─── contains ───

  describe('contains', () => {
    it('returns true for inserted items', () => {
      filter.insert('apple')
      filter.insert('banana')
      expect(filter.contains('apple')).toBe(true)
      expect(filter.contains('banana')).toBe(true)
    })

    it('returns false for missing items', () => {
      filter.insert('apple')
      expect(filter.contains('orange')).toBe(false)
    })
  })

  // ─── remove ───

  describe('remove', () => {
    it('removes item and returns true', () => {
      filter.insert('cherry')
      expect(filter.remove('cherry')).toBe(true)
      expect(filter.contains('cherry')).toBe(false)
    })

    it('returns false for missing item', () => {
      expect(filter.remove('nonexistent')).toBe(false)
    })
  })

  // ─── insert-remove-insert ───

  describe('insert-remove-insert', () => {
    it('correctly handles insert-remove-insert cycle', () => {
      expect(filter.insert('delta')).toBe(true)
      expect(filter.contains('delta')).toBe(true)
      expect(filter.remove('delta')).toBe(true)
      expect(filter.contains('delta')).toBe(false)
      expect(filter.insert('delta')).toBe(true)
      expect(filter.contains('delta')).toBe(true)
    })
  })

  // ─── size ───

  describe('size', () => {
    it('tracks count', () => {
      expect(filter.size).toBe(0)
      filter.insert('a')
      expect(filter.size).toBe(1)
      filter.insert('b')
      expect(filter.size).toBe(2)
      filter.remove('a')
      expect(filter.size).toBe(1)
    })
  })

  // ─── loadFactor ───

  describe('loadFactor', () => {
    it('returns ratio', () => {
      expect(filter.loadFactor).toBe(0)
      filter.insert('x')
      expect(filter.loadFactor).toBeGreaterThan(0)
      expect(filter.loadFactor).toBeLessThanOrEqual(1)
    })
  })

  // ─── isEmpty ───

  describe('isEmpty', () => {
    it('returns correct states', () => {
      expect(filter.isEmpty()).toBe(true)
      filter.insert('foo')
      expect(filter.isEmpty()).toBe(false)
      filter.remove('foo')
      expect(filter.isEmpty()).toBe(true)
    })
  })

  // ─── clear ───

  describe('clear', () => {
    it('empties the filter', () => {
      filter.insert('a')
      filter.insert('b')
      filter.insert('c')
      filter.clear()
      expect(filter.size).toBe(0)
      expect(filter.isEmpty()).toBe(true)
      expect(filter.contains('a')).toBe(false)
    })
  })

  // ─── false positive rate ───

  describe('false positive rate', () => {
    it('FP rate < 10% for 100 items checked against 1000 non-items', () => {
      const f = new CuckooFilter({ capacity: 200, bucketSize: 4, fingerprintSize: 2 })
      for (let i = 0; i < 100; i++) {
        f.insert(`item-${i}`)
      }
      let falsePositives = 0
      for (let i = 0; i < 1000; i++) {
        if (f.contains(`nonitem-${i}`)) falsePositives++
      }
      const rate = falsePositives / 1000
      expect(rate).toBeLessThan(0.1)
    })
  })

  // ─── capacity limit ───

  describe('capacity limit', () => {
    it('inserting beyond capacity eventually returns false', () => {
      const f = new CuckooFilter({ capacity: 20, bucketSize: 2, maxKicks: 50 })
      let inserted = 0
      for (let i = 0; i < 200; i++) {
        if (!f.insert(`overflow-${i}`)) break
        inserted++
      }
      expect(inserted).toBeLessThan(200)
    })
  })
})
