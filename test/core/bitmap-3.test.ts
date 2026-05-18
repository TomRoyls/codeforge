import { describe, it, expect } from 'vitest'
import { Bitmap3 } from '../../src/core/bitmap-3/index.js'

// ─── Constructor ───

describe('Bitmap3', () => {
  describe('constructor', () => {
    it('creates a bitmap with given size', () => {
      const bm = new Bitmap3(100)
      expect(bm.size).toBe(100)
      expect(bm.isEmpty).toBe(true)
    })

    it('creates a bitmap of size 0', () => {
      const bm = new Bitmap3(0)
      expect(bm.size).toBe(0)
      expect(bm.isEmpty).toBe(true)
    })

    it('throws on negative size', () => {
      expect(() => new Bitmap3(-1)).toThrow('Size must be non-negative')
    })

    it('creates bitmap larger than 32 bits', () => {
      const bm = new Bitmap3(100)
      expect(bm.size).toBe(100)
      expect(bm.isEmpty).toBe(true)
    })
  })

  // ─── Set / Get / Clear ───

  describe('set / get / clear', () => {
    it('sets and gets a bit', () => {
      const bm = new Bitmap3(64)
      bm.set(5)
      expect(bm.get(5)).toBe(true)
      expect(bm.get(0)).toBe(false)
      expect(bm.get(6)).toBe(false)
    })

    it('clears a set bit', () => {
      const bm = new Bitmap3(64)
      bm.set(10)
      expect(bm.get(10)).toBe(true)
      bm.clear(10)
      expect(bm.get(10)).toBe(false)
    })

    it('clearing an unset bit is a no-op', () => {
      const bm = new Bitmap3(64)
      bm.clear(5)
      expect(bm.get(5)).toBe(false)
    })

    it('throws on out of bounds index (negative)', () => {
      const bm = new Bitmap3(64)
      expect(() => bm.get(-1)).toThrow('Index out of bounds')
      expect(() => bm.set(-1)).toThrow('Index out of bounds')
      expect(() => bm.clear(-1)).toThrow('Index out of bounds')
    })

    it('throws on out of bounds index (too large)', () => {
      const bm = new Bitmap3(64)
      expect(() => bm.get(64)).toThrow('Index out of bounds')
      expect(() => bm.set(64)).toThrow('Index out of bounds')
      expect(() => bm.clear(64)).toThrow('Index out of bounds')
    })

    it('handles first and last bit positions', () => {
      const bm = new Bitmap3(32)
      bm.set(0)
      bm.set(31)
      expect(bm.get(0)).toBe(true)
      expect(bm.get(31)).toBe(true)
      expect(bm.get(15)).toBe(false)
    })

    it('handles bits spanning multiple words', () => {
      const bm = new Bitmap3(100)
      bm.set(0)
      bm.set(31)
      bm.set(32)
      bm.set(63)
      bm.set(64)
      bm.set(99)
      expect(bm.get(0)).toBe(true)
      expect(bm.get(31)).toBe(true)
      expect(bm.get(32)).toBe(true)
      expect(bm.get(63)).toBe(true)
      expect(bm.get(64)).toBe(true)
      expect(bm.get(99)).toBe(true)
      expect(bm.get(50)).toBe(false)
    })
  })

  // ─── Toggle ───

  describe('toggle', () => {
    it('toggles a bit from false to true', () => {
      const bm = new Bitmap3(64)
      const result = bm.toggle(10)
      expect(result).toBe(true)
      expect(bm.get(10)).toBe(true)
    })

    it('toggles a bit from true to false', () => {
      const bm = new Bitmap3(64)
      bm.set(10)
      const result = bm.toggle(10)
      expect(result).toBe(false)
      expect(bm.get(10)).toBe(false)
    })

    it('toggles twice returns to original', () => {
      const bm = new Bitmap3(64)
      bm.toggle(10)
      bm.toggle(10)
      expect(bm.get(10)).toBe(false)
    })
  })

  // ─── ClearAll ───

  describe('clearAll', () => {
    it('clears all bits', () => {
      const bm = new Bitmap3(64)
      bm.set(5)
      bm.set(10)
      bm.set(50)
      bm.clearAll()
      expect(bm.isEmpty).toBe(true)
      expect(bm.get(5)).toBe(false)
      expect(bm.get(10)).toBe(false)
      expect(bm.get(50)).toBe(false)
    })

    it('clears all bits in larger bitmap', () => {
      const bm = new Bitmap3(200)
      bm.set(0)
      bm.set(100)
      bm.set(199)
      bm.clearAll()
      expect(bm.isEmpty).toBe(true)
    })
  })

  // ─── IsEmpty ───

  describe('isEmpty', () => {
    it('returns true for new bitmap', () => {
      const bm = new Bitmap3(64)
      expect(bm.isEmpty).toBe(true)
    })

    it('returns false after setting a bit', () => {
      const bm = new Bitmap3(64)
      bm.set(5)
      expect(bm.isEmpty).toBe(false)
    })

    it('returns true after clearing all set bits', () => {
      const bm = new Bitmap3(64)
      bm.set(5)
      bm.clear(5)
      expect(bm.isEmpty).toBe(true)
    })
  })

  // ─── ToArray ───

  describe('toArray', () => {
    it('returns empty array for empty bitmap', () => {
      const bm = new Bitmap3(64)
      expect(bm.toArray()).toEqual([])
    })

    it('returns indices of set bits', () => {
      const bm = new Bitmap3(64)
      bm.set(5)
      bm.set(10)
      bm.set(63)
      expect(bm.toArray()).toEqual([5, 10, 63])
    })

    it('returns empty for zero-size bitmap', () => {
      const bm = new Bitmap3(0)
      expect(bm.toArray()).toEqual([])
    })
  })

  // ─── Bitwise Operations ───

  describe('and', () => {
    it('performs bitwise AND', () => {
      const a = new Bitmap3(32)
      a.set(1)
      a.set(2)
      a.set(3)
      const b = new Bitmap3(32)
      b.set(2)
      b.set(3)
      b.set(4)
      const result = a.and(b)
      expect(result.toArray()).toEqual([2, 3])
    })

    it('throws on different sizes', () => {
      const a = new Bitmap3(32)
      const b = new Bitmap3(64)
      expect(() => a.and(b)).toThrow('Bitmaps must have same size')
    })
  })

  describe('or', () => {
    it('performs bitwise OR', () => {
      const a = new Bitmap3(32)
      a.set(1)
      a.set(2)
      const b = new Bitmap3(32)
      b.set(2)
      b.set(3)
      const result = a.or(b)
      expect(result.toArray()).toEqual([1, 2, 3])
    })

    it('throws on different sizes', () => {
      const a = new Bitmap3(32)
      const b = new Bitmap3(64)
      expect(() => a.or(b)).toThrow('Bitmaps must have same size')
    })
  })

  describe('xor', () => {
    it('performs bitwise XOR', () => {
      const a = new Bitmap3(32)
      a.set(1)
      a.set(2)
      const b = new Bitmap3(32)
      b.set(2)
      b.set(3)
      const result = a.xor(b)
      expect(result.toArray()).toEqual([1, 3])
    })

    it('throws on different sizes', () => {
      const a = new Bitmap3(32)
      const b = new Bitmap3(64)
      expect(() => a.xor(b)).toThrow('Bitmaps must have same size')
    })
  })

  describe('not', () => {
    it('performs bitwise NOT', () => {
      const bm = new Bitmap3(4)
      bm.set(1)
      bm.set(3)
      const result = bm.not()
      expect(result.toArray()).toEqual([0, 2])
    })

    it('NOT of empty bitmap sets all bits', () => {
      const bm = new Bitmap3(4)
      const result = bm.not()
      expect(result.toArray()).toEqual([0, 1, 2, 3])
    })
  })

  // ─── Search Operations ───

  describe('countLeadingZeros', () => {
    it('returns count for bitmap with set bits', () => {
      const bm = new Bitmap3(10)
      bm.set(3)
      bm.set(7)
      expect(bm.countLeadingZeros()).toBe(3)
    })

    it('returns size for empty bitmap', () => {
      const bm = new Bitmap3(10)
      expect(bm.countLeadingZeros()).toBe(10)
    })

    it('returns 0 when first bit is set', () => {
      const bm = new Bitmap3(10)
      bm.set(0)
      expect(bm.countLeadingZeros()).toBe(0)
    })
  })

  describe('countTrailingZeros', () => {
    it('returns count for bitmap with set bits', () => {
      const bm = new Bitmap3(10)
      bm.set(3)
      bm.set(7)
      expect(bm.countTrailingZeros()).toBe(2)
    })

    it('returns size for empty bitmap', () => {
      const bm = new Bitmap3(10)
      expect(bm.countTrailingZeros()).toBe(10)
    })

    it('returns 0 when last bit is set', () => {
      const bm = new Bitmap3(10)
      bm.set(9)
      expect(bm.countTrailingZeros()).toBe(0)
    })
  })

  describe('findFirstSet', () => {
    it('returns first set bit index', () => {
      const bm = new Bitmap3(64)
      bm.set(10)
      bm.set(20)
      expect(bm.findFirstSet()).toBe(10)
    })

    it('returns -1 for empty bitmap', () => {
      const bm = new Bitmap3(64)
      expect(bm.findFirstSet()).toBe(-1)
    })
  })

  describe('findLastSet', () => {
    it('returns last set bit index', () => {
      const bm = new Bitmap3(64)
      bm.set(10)
      bm.set(20)
      expect(bm.findLastSet()).toBe(20)
    })

    it('returns -1 for empty bitmap', () => {
      const bm = new Bitmap3(64)
      expect(bm.findLastSet()).toBe(-1)
    })
  })

  // ─── ForEach ───

  describe('forEach', () => {
    it('iterates over all positions', () => {
      const bm = new Bitmap3(4)
      bm.set(1)
      bm.set(3)
      const results: [number, boolean][] = []
      bm.forEach((index, value) => results.push([index, value]))
      expect(results).toEqual([
        [0, false],
        [1, true],
        [2, false],
        [3, true],
      ])
    })

    it('does not iterate for zero-size bitmap', () => {
      const bm = new Bitmap3(0)
      const results: [number, boolean][] = []
      bm.forEach((index, value) => results.push([index, value]))
      expect(results).toEqual([])
    })
  })

  // ─── GetTimeComplexity ───

  describe('getTimeComplexity', () => {
    it('returns complexity record with expected keys', () => {
      const bm = new Bitmap3(32)
      const tc = bm.getTimeComplexity()
      expect(tc.set).toBe('O(1)')
      expect(tc.get).toBe('O(1)')
      expect(tc.clear).toBe('O(1)')
      expect(tc.toggle).toBe('O(1)')
    })
  })
})
