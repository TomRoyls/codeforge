import { describe, it, expect } from 'vitest'
import { IntegerIntervalTree } from '../../../src/utils/integer-interval-tree.js'

describe('IntegerIntervalTree', () => {
  describe('insert and queryPoint', () => {
    it('inserts and queries single interval', () => {
      const t = new IntegerIntervalTree<string>()
      t.insert(5, 10, 'a')
      expect(t.queryPoint(7)).toEqual([{ lo: 5, hi: 10, value: 'a' }])
    })

    it('returns empty for point outside all intervals', () => {
      const t = new IntegerIntervalTree<string>()
      t.insert(5, 10, 'a')
      expect(t.queryPoint(3)).toEqual([])
      expect(t.queryPoint(11)).toEqual([])
    })

    it('returns multiple overlapping intervals', () => {
      const t = new IntegerIntervalTree<string>()
      t.insert(1, 10, 'a')
      t.insert(5, 15, 'b')
      const results = t.queryPoint(7)
      expect(results.length).toBe(2)
    })

    it('handles boundary points', () => {
      const t = new IntegerIntervalTree<string>()
      t.insert(5, 10, 'a')
      expect(t.queryPoint(5).length).toBe(1)
      expect(t.queryPoint(10).length).toBe(1)
      expect(t.queryPoint(4).length).toBe(0)
      expect(t.queryPoint(11).length).toBe(0)
    })
  })

  describe('queryRange', () => {
    it('finds overlapping intervals', () => {
      const t = new IntegerIntervalTree<string>()
      t.insert(1, 5, 'a')
      t.insert(10, 20, 'b')
      t.insert(30, 40, 'c')
      expect(t.queryRange(3, 12).length).toBe(2)
    })

    it('returns empty for non-overlapping range', () => {
      const t = new IntegerIntervalTree<string>()
      t.insert(10, 20, 'a')
      expect(t.queryRange(1, 5)).toEqual([])
    })

    it('handles exact match', () => {
      const t = new IntegerIntervalTree<string>()
      t.insert(5, 10, 'a')
      expect(t.queryRange(5, 10).length).toBe(1)
    })
  })

  describe('contains', () => {
    it('returns true when point is covered', () => {
      const t = new IntegerIntervalTree<string>()
      t.insert(1, 10, 'a')
      expect(t.contains(5)).toBe(true)
    })

    it('returns false when point is not covered', () => {
      const t = new IntegerIntervalTree<string>()
      t.insert(1, 10, 'a')
      expect(t.contains(15)).toBe(false)
    })
  })

  describe('coversRange', () => {
    it('returns true when range fully covered', () => {
      const t = new IntegerIntervalTree<string>()
      t.insert(1, 10, 'a')
      expect(t.coversRange(3, 7)).toBe(true)
    })

    it('returns true for multi-interval coverage', () => {
      const t = new IntegerIntervalTree<string>()
      t.insert(1, 5, 'a')
      t.insert(6, 10, 'b')
      expect(t.coversRange(1, 10)).toBe(true)
    })

    it('returns false for gap in coverage', () => {
      const t = new IntegerIntervalTree<string>()
      t.insert(1, 5, 'a')
      t.insert(7, 10, 'b')
      expect(t.coversRange(1, 10)).toBe(false)
    })

    it('returns false for partial coverage', () => {
      const t = new IntegerIntervalTree<string>()
      t.insert(3, 7, 'a')
      expect(t.coversRange(1, 10)).toBe(false)
    })
  })

  describe('remove', () => {
    it('removes an interval', () => {
      const t = new IntegerIntervalTree<string>()
      t.insert(1, 5, 'a')
      t.insert(10, 15, 'b')
      expect(t.remove(1, 5)).toBe(1)
      expect(t.size).toBe(1)
      expect(t.contains(3)).toBe(false)
    })

    it('returns 0 when interval not found', () => {
      const t = new IntegerIntervalTree<string>()
      t.insert(1, 5, 'a')
      expect(t.remove(10, 15)).toBe(0)
    })
  })

  describe('union', () => {
    it('combines two trees', () => {
      const a = new IntegerIntervalTree<string>()
      a.insert(1, 5, 'a')
      const b = new IntegerIntervalTree<string>()
      b.insert(10, 15, 'b')
      const u = a.union(b)
      expect(u.size).toBe(2)
      expect(u.contains(3)).toBe(true)
      expect(u.contains(12)).toBe(true)
    })
  })

  describe('toArray', () => {
    it('returns sorted entries', () => {
      const t = new IntegerIntervalTree<string>()
      t.insert(10, 15, 'b')
      t.insert(1, 5, 'a')
      t.insert(20, 25, 'c')
      const arr = t.toArray()
      expect(arr[0]!.lo).toBe(1)
      expect(arr[1]!.lo).toBe(10)
      expect(arr[2]!.lo).toBe(20)
    })
  })

  describe('size', () => {
    it('tracks number of intervals', () => {
      const t = new IntegerIntervalTree<string>()
      expect(t.size).toBe(0)
      t.insert(1, 5, 'a')
      expect(t.size).toBe(1)
      t.insert(6, 10, 'b')
      expect(t.size).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('ignores invalid intervals', () => {
      const t = new IntegerIntervalTree<string>()
      t.insert(10, 5, 'a')
      expect(t.size).toBe(0)
    })

    it('handles point intervals', () => {
      const t = new IntegerIntervalTree<string>()
      t.insert(5, 5, 'a')
      expect(t.contains(5)).toBe(true)
      expect(t.contains(4)).toBe(false)
    })
  })
})
