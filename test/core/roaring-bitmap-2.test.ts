import { describe, it, expect } from 'vitest'
import { RoaringBitmap2 } from '../../src/core/roaring-bitmap-2/index.js'

describe('RoaringBitmap2', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('creates an empty bitmap', () => {
      const bm = new RoaringBitmap2()
      expect(bm.size).toBe(0)
      expect(bm.isEmpty()).toBe(true)
    })
  })

  // ─── add() ───
  describe('add', () => {
    it('adds a single value', () => {
      const bm = new RoaringBitmap2()
      bm.add(5)
      expect(bm.size).toBe(1)
      expect(bm.has(5)).toBe(true)
    })

    it('adds multiple non-contiguous values', () => {
      const bm = new RoaringBitmap2()
      bm.add(1)
      bm.add(10)
      bm.add(100)
      expect(bm.size).toBe(3)
      expect(bm.has(1)).toBe(true)
      expect(bm.has(10)).toBe(true)
      expect(bm.has(100)).toBe(true)
    })

    it('adds contiguous values creating a run', () => {
      const bm = new RoaringBitmap2()
      bm.add(1)
      bm.add(2)
      bm.add(3)
      expect(bm.size).toBe(3)
    })

    it('ignores duplicate values', () => {
      const bm = new RoaringBitmap2()
      bm.add(5)
      bm.add(5)
      bm.add(5)
      expect(bm.size).toBe(1)
    })

    it('ignores negative values', () => {
      const bm = new RoaringBitmap2()
      bm.add(-1)
      expect(bm.size).toBe(0)
      expect(bm.has(-1)).toBe(false)
    })

    it('adds value 0', () => {
      const bm = new RoaringBitmap2()
      bm.add(0)
      expect(bm.has(0)).toBe(true)
      expect(bm.size).toBe(1)
    })

    it('extends existing run to the left', () => {
      const bm = new RoaringBitmap2()
      bm.add(5)
      bm.add(6)
      bm.add(4)
      expect(bm.size).toBe(3)
      expect(bm.has(4)).toBe(true)
    })

    it('fills gap between two runs', () => {
      const bm = new RoaringBitmap2()
      bm.add(1)
      bm.add(3)
      bm.add(2)
      expect(bm.size).toBe(3)
      expect(bm.has(1)).toBe(true)
      expect(bm.has(2)).toBe(true)
      expect(bm.has(3)).toBe(true)
    })

    it('merges two runs when gap is filled', () => {
      const bm = new RoaringBitmap2()
      bm.add(1)
      bm.add(2)
      bm.add(4)
      bm.add(5)
      bm.add(3)
      expect(bm.size).toBe(5)
    })

    it('adds value that bridges adjacent runs', () => {
      const bm = new RoaringBitmap2()
      bm.add(1)
      bm.add(2)
      bm.add(4)
      bm.add(5)
      bm.add(3)
      expect(bm.size).toBe(5)
      for (let i = 1; i <= 5; i++) {
        expect(bm.has(i)).toBe(true)
      }
    })
  })

  // ─── has() ───
  describe('has', () => {
    it('returns true for values that exist', () => {
      const bm = new RoaringBitmap2()
      bm.add(42)
      expect(bm.has(42)).toBe(true)
    })

    it('returns false for values that do not exist', () => {
      const bm = new RoaringBitmap2()
      bm.add(42)
      expect(bm.has(43)).toBe(false)
    })

    it('returns false for negative values', () => {
      const bm = new RoaringBitmap2()
      expect(bm.has(-1)).toBe(false)
    })

    it('returns false on empty bitmap', () => {
      const bm = new RoaringBitmap2()
      expect(bm.has(0)).toBe(false)
    })

    it('finds values in large contiguous run', () => {
      const bm = new RoaringBitmap2()
      for (let i = 0; i < 100; i++) {
        bm.add(i)
      }
      expect(bm.has(0)).toBe(true)
      expect(bm.has(50)).toBe(true)
      expect(bm.has(99)).toBe(true)
      expect(bm.has(100)).toBe(false)
    })
  })

  // ─── remove() ───
  describe('remove', () => {
    it('removes a single value', () => {
      const bm = new RoaringBitmap2()
      bm.add(5)
      bm.remove(5)
      expect(bm.has(5)).toBe(false)
      expect(bm.size).toBe(0)
    })

    it('removes from the start of a run', () => {
      const bm = new RoaringBitmap2()
      bm.add(1)
      bm.add(2)
      bm.add(3)
      bm.remove(1)
      expect(bm.has(1)).toBe(false)
      expect(bm.has(2)).toBe(true)
      expect(bm.has(3)).toBe(true)
      expect(bm.size).toBe(2)
    })

    it('removes from the end of a run', () => {
      const bm = new RoaringBitmap2()
      bm.add(1)
      bm.add(2)
      bm.add(3)
      bm.remove(3)
      expect(bm.has(3)).toBe(false)
      expect(bm.has(1)).toBe(true)
      expect(bm.has(2)).toBe(true)
      expect(bm.size).toBe(2)
    })

    it('splits a run when removing from the middle', () => {
      const bm = new RoaringBitmap2()
      bm.add(1)
      bm.add(2)
      bm.add(3)
      bm.remove(2)
      expect(bm.has(2)).toBe(false)
      expect(bm.has(1)).toBe(true)
      expect(bm.has(3)).toBe(true)
      expect(bm.size).toBe(2)
    })

    it('does nothing for non-existent value', () => {
      const bm = new RoaringBitmap2()
      bm.add(5)
      bm.remove(10)
      expect(bm.size).toBe(1)
    })

    it('does nothing for negative value', () => {
      const bm = new RoaringBitmap2()
      bm.add(5)
      bm.remove(-1)
      expect(bm.size).toBe(1)
    })

    it('removes a single-element run completely', () => {
      const bm = new RoaringBitmap2()
      bm.add(1)
      bm.add(3)
      bm.remove(1)
      expect(bm.has(1)).toBe(false)
      expect(bm.has(3)).toBe(true)
      expect(bm.size).toBe(1)
    })
  })

  // ─── size ───
  describe('size', () => {
    it('returns 0 for empty bitmap', () => {
      const bm = new RoaringBitmap2()
      expect(bm.size).toBe(0)
    })

    it('counts values across multiple runs', () => {
      const bm = new RoaringBitmap2()
      bm.add(1)
      bm.add(2)
      bm.add(3)
      bm.add(10)
      bm.add(11)
      bm.add(20)
      expect(bm.size).toBe(6)
    })

    it('decreases after removal', () => {
      const bm = new RoaringBitmap2()
      bm.add(1)
      bm.add(2)
      bm.add(3)
      bm.remove(2)
      expect(bm.size).toBe(2)
    })
  })

  // ─── isEmpty() ───
  describe('isEmpty', () => {
    it('returns true for new bitmap', () => {
      const bm = new RoaringBitmap2()
      expect(bm.isEmpty()).toBe(true)
    })

    it('returns false after adding', () => {
      const bm = new RoaringBitmap2()
      bm.add(1)
      expect(bm.isEmpty()).toBe(false)
    })

    it('returns true after removing all', () => {
      const bm = new RoaringBitmap2()
      bm.add(1)
      bm.remove(1)
      expect(bm.isEmpty()).toBe(true)
    })
  })

  // ─── and() ───
  describe('and', () => {
    it('returns intersection of two bitmaps', () => {
      const a = new RoaringBitmap2()
      const b = new RoaringBitmap2()
      a.add(1)
      a.add(2)
      a.add(3)
      b.add(2)
      b.add(3)
      b.add(4)
      const result = a.and(b)
      expect(result.has(2)).toBe(true)
      expect(result.has(3)).toBe(true)
      expect(result.has(1)).toBe(false)
      expect(result.has(4)).toBe(false)
      expect(result.size).toBe(2)
    })

    it('returns empty for disjoint bitmaps', () => {
      const a = new RoaringBitmap2()
      const b = new RoaringBitmap2()
      a.add(1)
      a.add(2)
      b.add(5)
      b.add(6)
      const result = a.and(b)
      expect(result.size).toBe(0)
      expect(result.isEmpty()).toBe(true)
    })

    it('returns empty when one operand is empty', () => {
      const a = new RoaringBitmap2()
      const b = new RoaringBitmap2()
      a.add(1)
      a.add(2)
      const result = a.and(b)
      expect(result.size).toBe(0)
    })

    it('returns identical when both are the same', () => {
      const a = new RoaringBitmap2()
      const b = new RoaringBitmap2()
      a.add(1)
      a.add(2)
      a.add(3)
      b.add(1)
      b.add(2)
      b.add(3)
      const result = a.and(b)
      expect(result.size).toBe(3)
    })

    it('does not modify original bitmaps', () => {
      const a = new RoaringBitmap2()
      const b = new RoaringBitmap2()
      a.add(1)
      a.add(2)
      b.add(2)
      b.add(3)
      a.and(b)
      expect(a.size).toBe(2)
      expect(b.size).toBe(2)
    })
  })

  // ─── or() ───
  describe('or', () => {
    it('returns union of two bitmaps', () => {
      const a = new RoaringBitmap2()
      const b = new RoaringBitmap2()
      a.add(1)
      a.add(2)
      b.add(3)
      b.add(4)
      const result = a.or(b)
      expect(result.size).toBe(4)
      expect(result.has(1)).toBe(true)
      expect(result.has(2)).toBe(true)
      expect(result.has(3)).toBe(true)
      expect(result.has(4)).toBe(true)
    })

    it('deduplicates overlapping values', () => {
      const a = new RoaringBitmap2()
      const b = new RoaringBitmap2()
      a.add(1)
      a.add(2)
      a.add(3)
      b.add(2)
      b.add(3)
      b.add(4)
      const result = a.or(b)
      expect(result.size).toBe(4)
    })

    it('returns copy when one operand is empty', () => {
      const a = new RoaringBitmap2()
      const b = new RoaringBitmap2()
      a.add(1)
      a.add(2)
      const result = a.or(b)
      expect(result.size).toBe(2)
    })

    it('does not modify original bitmaps', () => {
      const a = new RoaringBitmap2()
      const b = new RoaringBitmap2()
      a.add(1)
      b.add(2)
      a.or(b)
      expect(a.size).toBe(1)
      expect(b.size).toBe(1)
    })

    it('merges overlapping runs', () => {
      const a = new RoaringBitmap2()
      const b = new RoaringBitmap2()
      a.add(1)
      a.add(2)
      b.add(2)
      b.add(3)
      const result = a.or(b)
      expect(result.size).toBe(3)
    })
  })

  // ─── xor() ───
  describe('xor', () => {
    it('returns symmetric difference of two bitmaps', () => {
      const a = new RoaringBitmap2()
      const b = new RoaringBitmap2()
      a.add(1)
      a.add(2)
      a.add(3)
      b.add(2)
      b.add(3)
      b.add(4)
      const result = a.xor(b)
      expect(result.has(1)).toBe(true)
      expect(result.has(4)).toBe(true)
      expect(result.has(2)).toBe(false)
      expect(result.has(3)).toBe(false)
      expect(result.size).toBe(2)
    })

    it('returns all values when bitmaps are disjoint', () => {
      const a = new RoaringBitmap2()
      const b = new RoaringBitmap2()
      a.add(1)
      a.add(2)
      b.add(5)
      b.add(6)
      const result = a.xor(b)
      expect(result.size).toBe(4)
    })

    it('returns empty when both are the same', () => {
      const a = new RoaringBitmap2()
      const b = new RoaringBitmap2()
      a.add(1)
      a.add(2)
      a.add(3)
      b.add(1)
      b.add(2)
      b.add(3)
      const result = a.xor(b)
      expect(result.size).toBe(0)
    })

    it('returns copy when one operand is empty', () => {
      const a = new RoaringBitmap2()
      const b = new RoaringBitmap2()
      a.add(1)
      a.add(2)
      const result = a.xor(b)
      expect(result.size).toBe(2)
    })

    it('does not modify original bitmaps', () => {
      const a = new RoaringBitmap2()
      const b = new RoaringBitmap2()
      a.add(1)
      a.add(2)
      b.add(2)
      b.add(3)
      a.xor(b)
      expect(a.size).toBe(2)
      expect(b.size).toBe(2)
    })
  })

  // ─── clear() ───
  describe('clear', () => {
    it('removes all values', () => {
      const bm = new RoaringBitmap2()
      bm.add(1)
      bm.add(2)
      bm.add(3)
      bm.clear()
      expect(bm.size).toBe(0)
      expect(bm.isEmpty()).toBe(true)
    })

    it('is safe to call on empty bitmap', () => {
      const bm = new RoaringBitmap2()
      bm.clear()
      expect(bm.size).toBe(0)
    })

    it('allows adding after clear', () => {
      const bm = new RoaringBitmap2()
      bm.add(1)
      bm.clear()
      bm.add(2)
      expect(bm.size).toBe(1)
      expect(bm.has(2)).toBe(true)
    })
  })

  // ─── Edge Cases ───
  describe('edge cases', () => {
    it('handles single value at 0', () => {
      const bm = new RoaringBitmap2()
      bm.add(0)
      expect(bm.has(0)).toBe(true)
      expect(bm.size).toBe(1)
    })

    it('handles large values', () => {
      const bm = new RoaringBitmap2()
      bm.add(1000000)
      bm.add(1000001)
      expect(bm.size).toBe(2)
      expect(bm.has(1000000)).toBe(true)
      expect(bm.has(1000001)).toBe(true)
    })

    it('handles adding in reverse order', () => {
      const bm = new RoaringBitmap2()
      bm.add(3)
      bm.add(2)
      bm.add(1)
      expect(bm.size).toBe(3)
      expect(bm.has(1)).toBe(true)
      expect(bm.has(2)).toBe(true)
      expect(bm.has(3)).toBe(true)
    })

    it('handles sparse values', () => {
      const bm = new RoaringBitmap2()
      bm.add(0)
      bm.add(100)
      bm.add(1000)
      bm.add(10000)
      expect(bm.size).toBe(4)
    })

    it('handles remove then re-add', () => {
      const bm = new RoaringBitmap2()
      bm.add(5)
      bm.remove(5)
      expect(bm.has(5)).toBe(false)
      bm.add(5)
      expect(bm.has(5)).toBe(true)
      expect(bm.size).toBe(1)
    })

    it('handles chaining set operations', () => {
      const a = new RoaringBitmap2()
      const b = new RoaringBitmap2()
      const c = new RoaringBitmap2()
      a.add(1)
      a.add(2)
      a.add(3)
      b.add(2)
      b.add(3)
      b.add(4)
      c.add(3)
      c.add(4)
      c.add(5)
      const result = a.and(b).or(c)
      expect(result.has(2)).toBe(true)
      expect(result.has(3)).toBe(true)
      expect(result.has(4)).toBe(true)
      expect(result.has(5)).toBe(true)
      expect(result.size).toBe(4)
    })
  })
})
