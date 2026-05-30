import { describe, it, expect } from 'vitest'
import { CompactIntSet } from '../../../src/utils/compact-int-set.js'

describe('CompactIntSet', () => {
  describe('construction', () => {
    it('creates empty set', () => {
      const s = new CompactIntSet()
      expect(s.size).toBe(0)
      expect(s.toArray()).toEqual([])
    })

    it('creates from sorted array', () => {
      const s = new CompactIntSet([1, 5, 10, 20])
      expect(s.size).toBe(4)
      expect(s.toArray()).toEqual([1, 5, 10, 20])
    })

    it('creates from unsorted array', () => {
      const s = new CompactIntSet([10, 5, 20, 1])
      expect(s.toArray()).toEqual([1, 5, 10, 20])
    })
  })

  describe('add', () => {
    it('adds values', () => {
      const s = new CompactIntSet()
      expect(s.add(5)).toBe(true)
      expect(s.add(3)).toBe(true)
      expect(s.add(7)).toBe(true)
      expect(s.size).toBe(3)
      expect(s.toArray()).toEqual([3, 5, 7])
    })

    it('returns false for duplicate', () => {
      const s = new CompactIntSet()
      s.add(5)
      expect(s.add(5)).toBe(false)
      expect(s.size).toBe(1)
    })

    it('rejects negative values', () => {
      const s = new CompactIntSet()
      expect(s.add(-1)).toBe(false)
    })

    it('maintains sorted order', () => {
      const s = new CompactIntSet()
      s.add(100)
      s.add(1)
      s.add(50)
      s.add(25)
      expect(s.toArray()).toEqual([1, 25, 50, 100])
    })
  })

  describe('has', () => {
    it('finds existing values', () => {
      const s = new CompactIntSet([1, 5, 10, 20])
      expect(s.has(1)).toBe(true)
      expect(s.has(5)).toBe(true)
      expect(s.has(20)).toBe(true)
    })

    it('returns false for missing values', () => {
      const s = new CompactIntSet([1, 5, 10])
      expect(s.has(2)).toBe(false)
      expect(s.has(11)).toBe(false)
    })

    it('returns false for negative', () => {
      const s = new CompactIntSet([1, 2, 3])
      expect(s.has(-1)).toBe(false)
    })

    it('returns false for empty set', () => {
      const s = new CompactIntSet()
      expect(s.has(0)).toBe(false)
    })
  })

  describe('delete', () => {
    it('removes values', () => {
      const s = new CompactIntSet([1, 5, 10])
      expect(s.delete(5)).toBe(true)
      expect(s.size).toBe(2)
      expect(s.toArray()).toEqual([1, 10])
    })

    it('returns false for missing', () => {
      const s = new CompactIntSet([1, 5])
      expect(s.delete(3)).toBe(false)
    })

    it('can remove all values', () => {
      const s = new CompactIntSet([1, 2, 3])
      s.delete(2)
      s.delete(1)
      s.delete(3)
      expect(s.size).toBe(0)
      expect(s.toArray()).toEqual([])
    })
  })

  describe('compression', () => {
    it('uses delta encoding for consecutive values', () => {
      const s = new CompactIntSet([100, 101, 102, 103, 104])
      expect(s.byteLength).toBeLessThan(20)
    })

    it('compresses sparse values', () => {
      const dense = new CompactIntSet([1, 2, 3, 4, 5])
      const sparse = new CompactIntSet([1, 1000, 1000000])
      expect(dense.byteLength).toBeLessThan(sparse.byteLength)
    })

    it('handles large values', () => {
      const s = new CompactIntSet([0, 1000000, 2000000])
      expect(s.size).toBe(3)
      expect(s.toArray()).toEqual([0, 1000000, 2000000])
    })
  })

  describe('set operations', () => {
    it('computes union', () => {
      const a = new CompactIntSet([1, 3, 5])
      const b = new CompactIntSet([2, 3, 6])
      const u = a.union(b)
      expect(u.toArray()).toEqual([1, 2, 3, 5, 6])
    })

    it('computes intersection', () => {
      const a = new CompactIntSet([1, 3, 5, 7])
      const b = new CompactIntSet([3, 5, 9])
      const i = a.intersection(b)
      expect(i.toArray()).toEqual([3, 5])
    })

    it('union with empty set', () => {
      const a = new CompactIntSet([1, 2])
      const b = new CompactIntSet()
      expect(a.union(b).toArray()).toEqual([1, 2])
    })

    it('intersection with empty set', () => {
      const a = new CompactIntSet([1, 2])
      const b = new CompactIntSet()
      expect(a.intersection(b).toArray()).toEqual([])
    })

    it('union preserves duplicates', () => {
      const a = new CompactIntSet([1, 3])
      const b = new CompactIntSet([1, 3])
      expect(a.union(b).toArray()).toEqual([1, 3])
    })
  })

  describe('stress', () => {
    it('handles many additions', () => {
      const s = new CompactIntSet()
      for (let i = 0; i < 100; i++) {
        s.add(i * 10)
      }
      expect(s.size).toBe(100)
      expect(s.has(0)).toBe(true)
      expect(s.has(990)).toBe(true)
      expect(s.has(5)).toBe(false)
    })
  })
})
