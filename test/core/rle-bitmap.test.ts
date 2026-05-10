import { describe, it, expect } from 'vitest'
import { RLEBitmap } from '../../src/core/rle-bitmap/rle-bitmap.js'
import type { RLEBitmapOptions } from '../../src/core/rle-bitmap/types.js'

describe('RLEBitmap', () => {
  describe('constructor', () => {
    it('creates empty bitmap with no options', () => {
      const bm = new RLEBitmap()
      expect(bm.size).toBe(0)
      expect(bm.runs).toEqual([])
    })

    it('creates bitmap with empty options', () => {
      const bm = new RLEBitmap({})
      expect(bm.size).toBe(0)
    })

    it('creates bitmap with initialCapacity option', () => {
      const opts: RLEBitmapOptions = { initialCapacity: 100 }
      const bm = new RLEBitmap(opts)
      expect(bm.size).toBe(0)
    })

    it('creates independent instances', () => {
      const a = new RLEBitmap()
      const b = new RLEBitmap()
      a.set(0, 1)
      expect(b.size).toBe(0)
    })
  })

  describe('set and get', () => {
    it('sets and gets a single bit', () => {
      const bm = new RLEBitmap()
      bm.set(0, 1)
      expect(bm.get(0)).toBe(1)
    })

    it('sets bit at arbitrary index', () => {
      const bm = new RLEBitmap()
      bm.set(50, 1)
      expect(bm.get(50)).toBe(1)
    })

    it('expands size when setting beyond current size', () => {
      const bm = new RLEBitmap()
      bm.set(10, 1)
      expect(bm.size).toBe(11)
    })

    it('fills gap with zeros when setting beyond end', () => {
      const bm = new RLEBitmap()
      bm.set(5, 1)
      expect(bm.get(0)).toBe(0)
      expect(bm.get(4)).toBe(0)
      expect(bm.get(5)).toBe(1)
    })

    it('overwrites existing bit', () => {
      const bm = new RLEBitmap()
      bm.set(0, 1)
      expect(bm.get(0)).toBe(1)
      bm.set(0, 0)
      expect(bm.get(0)).toBe(0)
    })

    it('throws on negative index', () => {
      const bm = new RLEBitmap()
      expect(() => bm.set(-1, 1)).toThrow(RangeError)
    })

    it('throws on get out of bounds', () => {
      const bm = new RLEBitmap()
      bm.set(2, 1)
      expect(() => bm.get(3)).toThrow(RangeError)
    })

    it('throws on get with negative index', () => {
      const bm = new RLEBitmap()
      expect(() => bm.get(-1)).toThrow(RangeError)
    })

    it('sets consecutive bits', () => {
      const bm = new RLEBitmap()
      bm.set(0, 1)
      bm.set(1, 1)
      bm.set(2, 1)
      expect(bm.get(0)).toBe(1)
      expect(bm.get(1)).toBe(1)
      expect(bm.get(2)).toBe(1)
    })

    it('sets alternating bits', () => {
      const bm = new RLEBitmap()
      for (let i = 0; i < 10; i++) {
        bm.set(i, (i % 2) as 0 | 1)
      }
      for (let i = 0; i < 10; i++) {
        expect(bm.get(i)).toBe(i % 2)
      }
    })

    it('stores value as 0 for any falsy input normalized to 0', () => {
      const bm = new RLEBitmap()
      bm.set(0, 0)
      expect(bm.get(0)).toBe(0)
    })

    it('setting index 0 to 1 on empty bitmap', () => {
      const bm = new RLEBitmap()
      bm.set(0, 1)
      expect(bm.size).toBe(1)
      expect(bm.get(0)).toBe(1)
    })

    it('setting same value twice is idempotent', () => {
      const bm = new RLEBitmap()
      bm.set(0, 1)
      bm.set(0, 1)
      expect(bm.get(0)).toBe(1)
      expect(bm.runs.length).toBe(1)
    })
  })

  describe('flip', () => {
    it('flips 0 to 1', () => {
      const bm = new RLEBitmap()
      bm.set(0, 0)
      bm.flip(0)
      expect(bm.get(0)).toBe(1)
    })

    it('flips 1 to 0', () => {
      const bm = new RLEBitmap()
      bm.set(0, 1)
      bm.flip(0)
      expect(bm.get(0)).toBe(0)
    })

    it('double flip returns to original', () => {
      const bm = new RLEBitmap()
      bm.set(0, 1)
      bm.flip(0)
      bm.flip(0)
      expect(bm.get(0)).toBe(1)
    })

    it('flips bit in middle of run', () => {
      const bm = RLEBitmap.compress([1, 1, 1, 1, 1])
      bm.flip(2)
      expect(bm.get(1)).toBe(1)
      expect(bm.get(2)).toBe(0)
      expect(bm.get(3)).toBe(1)
    })

    it('throws on out of bounds', () => {
      const bm = new RLEBitmap()
      expect(() => bm.flip(0)).toThrow(RangeError)
    })

    it('throws on negative index', () => {
      const bm = new RLEBitmap()
      bm.set(0, 1)
      expect(() => bm.flip(-1)).toThrow(RangeError)
    })
  })

  describe('fill', () => {
    it('fills entire bitmap with 1', () => {
      const bm = new RLEBitmap()
      bm.set(4, 0)
      bm.fill(1)
      for (let i = 0; i < 5; i++) {
        expect(bm.get(i)).toBe(1)
      }
    })

    it('fills entire bitmap with 0', () => {
      const bm = RLEBitmap.compress([1, 1, 1])
      bm.fill(0)
      expect(bm.expand()).toEqual([0, 0, 0])
    })

    it('fills a subrange', () => {
      const bm = RLEBitmap.compress([0, 0, 0, 0, 0])
      bm.fill(1, 1, 4)
      expect(bm.get(0)).toBe(0)
      expect(bm.get(1)).toBe(1)
      expect(bm.get(3)).toBe(1)
      expect(bm.get(4)).toBe(0)
    })

    it('fills from start index to end', () => {
      const bm = RLEBitmap.compress([0, 0, 0, 0, 0])
      bm.fill(1, 3)
      expect(bm.get(2)).toBe(0)
      expect(bm.get(3)).toBe(1)
      expect(bm.get(4)).toBe(1)
    })

    it('fills single index', () => {
      const bm = RLEBitmap.compress([0, 0, 0])
      bm.fill(1, 1, 2)
      expect(bm.get(0)).toBe(0)
      expect(bm.get(1)).toBe(1)
      expect(bm.get(2)).toBe(0)
    })

    it('throws on invalid range', () => {
      const bm = new RLEBitmap()
      expect(() => bm.fill(1, 5, 2)).toThrow(RangeError)
    })

    it('throws on negative start', () => {
      const bm = new RLEBitmap()
      expect(() => bm.fill(1, -1)).toThrow(RangeError)
    })

    it('no-op when start equals end', () => {
      const bm = RLEBitmap.compress([0, 1, 0])
      bm.fill(1, 1, 1)
      expect(bm.get(1)).toBe(1)
    })

    it('expands when end exceeds size', () => {
      const bm = RLEBitmap.compress([0, 0])
      bm.fill(1, 0, 5)
      expect(bm.size).toBe(5)
      expect(bm.get(4)).toBe(1)
    })
  })

  describe('countOnes', () => {
    it('counts ones in empty bitmap', () => {
      const bm = new RLEBitmap()
      expect(bm.countOnes()).toBe(0)
    })

    it('counts ones in all-zero bitmap', () => {
      const bm = RLEBitmap.compress([0, 0, 0, 0])
      expect(bm.countOnes()).toBe(0)
    })

    it('counts ones in all-one bitmap', () => {
      const bm = RLEBitmap.compress([1, 1, 1])
      expect(bm.countOnes()).toBe(3)
    })

    it('counts ones in mixed bitmap', () => {
      const bm = RLEBitmap.compress([1, 0, 1, 0, 1])
      expect(bm.countOnes()).toBe(3)
    })

    it('counts ones in range', () => {
      const bm = RLEBitmap.compress([1, 1, 0, 0, 1])
      expect(bm.countOnes(1, 4)).toBe(1)
    })

    it('counts ones from start index', () => {
      const bm = RLEBitmap.compress([1, 1, 1, 0, 0])
      expect(bm.countOnes(2)).toBe(1)
    })

    it('returns 0 for empty range', () => {
      const bm = RLEBitmap.compress([1, 1, 1])
      expect(bm.countOnes(2, 2)).toBe(0)
    })
  })

  describe('countZeros', () => {
    it('counts zeros in all-zero bitmap', () => {
      const bm = RLEBitmap.compress([0, 0, 0])
      expect(bm.countZeros()).toBe(3)
    })

    it('counts zeros in all-one bitmap', () => {
      const bm = RLEBitmap.compress([1, 1, 1])
      expect(bm.countZeros()).toBe(0)
    })

    it('counts zeros in mixed bitmap', () => {
      const bm = RLEBitmap.compress([1, 0, 1, 0])
      expect(bm.countZeros()).toBe(2)
    })

    it('counts zeros in range', () => {
      const bm = RLEBitmap.compress([0, 0, 1, 1, 0])
      expect(bm.countZeros(1, 4)).toBe(1)
    })

    it('total equals size', () => {
      const bm = RLEBitmap.compress([1, 0, 1, 0, 1])
      expect(bm.countOnes() + bm.countZeros()).toBe(bm.size)
    })

    it('returns 0 for empty range', () => {
      const bm = RLEBitmap.compress([0, 0, 0])
      expect(bm.countZeros(1, 1)).toBe(0)
    })
  })

  describe('size', () => {
    it('returns 0 for empty bitmap', () => {
      const bm = new RLEBitmap()
      expect(bm.size).toBe(0)
    })

    it('returns highest bit + 1', () => {
      const bm = new RLEBitmap()
      bm.set(9, 1)
      expect(bm.size).toBe(10)
    })

    it('does not shrink when clearing last bit', () => {
      const bm = new RLEBitmap()
      bm.set(5, 1)
      bm.set(5, 0)
      expect(bm.size).toBe(6)
    })
  })

  describe('runs', () => {
    it('returns empty array for empty bitmap', () => {
      const bm = new RLEBitmap()
      expect(bm.runs).toEqual([])
    })

    it('returns single run for uniform bitmap', () => {
      const bm = RLEBitmap.compress([1, 1, 1])
      expect(bm.runs).toEqual([{ value: 1, count: 3 }])
    })

    it('returns multiple runs for mixed bitmap', () => {
      const bm = RLEBitmap.compress([1, 1, 0, 0, 1])
      expect(bm.runs).toEqual([
        { value: 1, count: 2 },
        { value: 0, count: 2 },
        { value: 1, count: 1 },
      ])
    })

    it('returns defensive copy', () => {
      const bm = RLEBitmap.compress([1, 1])
      const r = bm.runs
      r[0].count = 999
      expect(bm.runs[0].count).toBe(2)
    })

    it('merges adjacent runs after set', () => {
      const bm = RLEBitmap.compress([1, 0, 1])
      bm.set(1, 1)
      expect(bm.runs).toEqual([{ value: 1, count: 3 }])
    })
  })

  describe('compress (static)', () => {
    it('compresses empty array', () => {
      const bm = RLEBitmap.compress([])
      expect(bm.size).toBe(0)
      expect(bm.runs).toEqual([])
    })

    it('compresses all zeros', () => {
      const bm = RLEBitmap.compress([0, 0, 0, 0])
      expect(bm.runs).toEqual([{ value: 0, count: 4 }])
      expect(bm.size).toBe(4)
    })

    it('compresses all ones', () => {
      const bm = RLEBitmap.compress([1, 1, 1])
      expect(bm.runs).toEqual([{ value: 1, count: 3 }])
    })

    it('compresses alternating pattern', () => {
      const bm = RLEBitmap.compress([0, 1, 0, 1])
      expect(bm.runs.length).toBe(4)
    })

    it('preserves values through round-trip', () => {
      const bits = [1, 1, 0, 0, 0, 1, 0]
      const bm = RLEBitmap.compress(bits)
      expect(bm.expand()).toEqual(bits)
    })

    it('handles single element', () => {
      const bm = RLEBitmap.compress([1])
      expect(bm.size).toBe(1)
      expect(bm.get(0)).toBe(1)
    })

    it('normalizes non-0/1 values to 1', () => {
      const bm = RLEBitmap.compress([2, 0, 3])
      expect(bm.get(0)).toBe(1)
      expect(bm.get(2)).toBe(1)
    })
  })

  describe('expand', () => {
    it('expands empty bitmap', () => {
      const bm = new RLEBitmap()
      expect(bm.expand()).toEqual([])
    })

    it('expands single run', () => {
      const bm = RLEBitmap.compress([1, 1, 1])
      expect(bm.expand()).toEqual([1, 1, 1])
    })

    it('expands multiple runs', () => {
      const bm = RLEBitmap.compress([1, 0, 1, 1, 0])
      expect(bm.expand()).toEqual([1, 0, 1, 1, 0])
    })

    it('round-trip compress then expand', () => {
      const original = [0, 0, 1, 1, 1, 0, 1, 0, 0, 0]
      expect(RLEBitmap.compress(original).expand()).toEqual(original)
    })
  })

  describe('and', () => {
    it('returns all zeros when one is all zeros', () => {
      const a = RLEBitmap.compress([1, 1, 1])
      const b = RLEBitmap.compress([0, 0, 0])
      const result = a.and(b)
      expect(result.expand()).toEqual([0, 0, 0])
    })

    it('returns intersection of ones', () => {
      const a = RLEBitmap.compress([1, 0, 1, 1])
      const b = RLEBitmap.compress([1, 1, 0, 1])
      const result = a.and(b)
      expect(result.expand()).toEqual([1, 0, 0, 1])
    })

    it('handles different sizes (min)', () => {
      const a = RLEBitmap.compress([1, 1, 1])
      const b = RLEBitmap.compress([1, 0])
      const result = a.and(b)
      expect(result.expand()).toEqual([1, 0])
    })

    it('and with empty bitmap', () => {
      const a = RLEBitmap.compress([1, 1])
      const b = new RLEBitmap()
      const result = a.and(b)
      expect(result.size).toBe(0)
    })

    it('and is idempotent with all ones', () => {
      const a = RLEBitmap.compress([1, 0, 1])
      const b = RLEBitmap.compress([1, 1, 1])
      expect(a.and(b).expand()).toEqual([1, 0, 1])
    })
  })

  describe('or', () => {
    it('returns all ones when one is all ones', () => {
      const a = RLEBitmap.compress([1, 1, 1])
      const b = RLEBitmap.compress([0, 0, 0])
      expect(a.or(b).expand()).toEqual([1, 1, 1])
    })

    it('returns union of ones', () => {
      const a = RLEBitmap.compress([1, 0, 0])
      const b = RLEBitmap.compress([0, 1, 0])
      expect(a.or(b).expand()).toEqual([1, 1, 0])
    })

    it('handles different sizes (max)', () => {
      const a = RLEBitmap.compress([1, 0])
      const b = RLEBitmap.compress([0, 0, 1])
      expect(a.or(b).expand()).toEqual([1, 0, 1])
    })

    it('or with empty bitmap returns first', () => {
      const a = RLEBitmap.compress([1, 0, 1])
      const b = new RLEBitmap()
      expect(a.or(b).expand()).toEqual([1, 0, 1])
    })

    it('or of two all-zeros is all-zeros', () => {
      const a = RLEBitmap.compress([0, 0, 0])
      const b = RLEBitmap.compress([0, 0, 0])
      expect(a.or(b).expand()).toEqual([0, 0, 0])
    })
  })

  describe('xor', () => {
    it('returns zeros for identical bitmaps', () => {
      const a = RLEBitmap.compress([1, 0, 1])
      expect(a.xor(a).expand()).toEqual([0, 0, 0])
    })

    it('returns ones for complementary bitmaps', () => {
      const a = RLEBitmap.compress([1, 0, 1])
      const b = RLEBitmap.compress([0, 1, 0])
      expect(a.xor(b).expand()).toEqual([1, 1, 1])
    })

    it('handles different sizes', () => {
      const a = RLEBitmap.compress([1, 0])
      const b = RLEBitmap.compress([0, 0, 1])
      expect(a.xor(b).expand()).toEqual([1, 0, 1])
    })

    it('xor with empty bitmap', () => {
      const a = RLEBitmap.compress([1, 0, 1])
      const b = new RLEBitmap()
      expect(a.xor(b).expand()).toEqual([1, 0, 1])
    })

    it('xor is symmetric', () => {
      const a = RLEBitmap.compress([1, 0, 1, 0])
      const b = RLEBitmap.compress([0, 1, 1, 0])
      expect(a.xor(b).expand()).toEqual(b.xor(a).expand())
    })
  })

  describe('not', () => {
    it('inverts all zeros to ones', () => {
      const bm = RLEBitmap.compress([0, 0, 0])
      expect(bm.not.expand()).toEqual([1, 1, 1])
    })

    it('inverts all ones to zeros', () => {
      const bm = RLEBitmap.compress([1, 1, 1])
      expect(bm.not.expand()).toEqual([0, 0, 0])
    })

    it('inverts mixed bitmap', () => {
      const bm = RLEBitmap.compress([1, 0, 1, 0])
      expect(bm.not.expand()).toEqual([0, 1, 0, 1])
    })

    it('double not returns original', () => {
      const bm = RLEBitmap.compress([1, 0, 1, 1, 0])
      expect(bm.not.not.expand()).toEqual(bm.expand())
    })

    it('not does not modify original', () => {
      const bm = RLEBitmap.compress([1, 0, 1])
      const inverted = bm.not
      expect(bm.get(0)).toBe(1)
      expect(inverted.get(0)).toBe(0)
    })

    it('not on empty bitmap', () => {
      const bm = new RLEBitmap()
      expect(bm.not.size).toBe(0)
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const bm = RLEBitmap.compress([1, 0, 1])
      const copy = bm.clone()
      copy.set(1, 1)
      expect(bm.get(1)).toBe(0)
      expect(copy.get(1)).toBe(1)
    })

    it('preserves size', () => {
      const bm = RLEBitmap.compress([1, 0, 1, 0])
      expect(bm.clone().size).toBe(4)
    })

    it('preserves runs', () => {
      const bm = RLEBitmap.compress([1, 1, 0, 0, 1])
      expect(bm.clone().runs).toEqual(bm.runs)
    })

    it('clone of empty bitmap', () => {
      const bm = new RLEBitmap()
      expect(bm.clone().size).toBe(0)
    })
  })

  describe('toString', () => {
    it('returns empty string for empty bitmap', () => {
      const bm = new RLEBitmap()
      expect(bm.toString()).toBe('')
    })

    it('returns single run representation', () => {
      const bm = RLEBitmap.compress([1, 1, 1])
      expect(bm.toString()).toBe('1:3')
    })

    it('returns multi-run representation', () => {
      const bm = RLEBitmap.compress([1, 1, 0, 0, 1])
      expect(bm.toString()).toBe('1:2 0:2 1:1')
    })

    it('format is parseable', () => {
      const bm = RLEBitmap.compress([0, 0, 1, 1, 1, 0])
      const str = bm.toString()
      expect(str).toBe('0:2 1:3 0:1')
    })
  })

  describe('equals', () => {
    it('empty bitmaps are equal', () => {
      expect(new RLEBitmap().equals(new RLEBitmap())).toBe(true)
    })

    it('identical bitmaps are equal', () => {
      const a = RLEBitmap.compress([1, 0, 1])
      const b = RLEBitmap.compress([1, 0, 1])
      expect(a.equals(b)).toBe(true)
    })

    it('different bitmaps are not equal', () => {
      const a = RLEBitmap.compress([1, 0])
      const b = RLEBitmap.compress([0, 1])
      expect(a.equals(b)).toBe(false)
    })

    it('different sizes are not equal', () => {
      const a = RLEBitmap.compress([1, 1])
      const b = RLEBitmap.compress([1, 1, 0])
      expect(a.equals(b)).toBe(false)
    })

    it('bitmap equals its clone', () => {
      const bm = RLEBitmap.compress([1, 0, 1, 1])
      expect(bm.equals(bm.clone())).toBe(true)
    })

    it('bitmap equals its double negation', () => {
      const bm = RLEBitmap.compress([0, 1, 0])
      expect(bm.equals(bm.not.not)).toBe(true)
    })
  })

  describe('slice', () => {
    it('slices entire bitmap', () => {
      const bm = RLEBitmap.compress([1, 0, 1])
      const s = bm.slice(0, 3)
      expect(s.expand()).toEqual([1, 0, 1])
    })

    it('slices subrange', () => {
      const bm = RLEBitmap.compress([1, 0, 1, 0, 1])
      expect(bm.slice(1, 4).expand()).toEqual([0, 1, 0])
    })

    it('slices single element', () => {
      const bm = RLEBitmap.compress([1, 0, 1])
      expect(bm.slice(1, 2).expand()).toEqual([0])
    })

    it('slices from index to end', () => {
      const bm = RLEBitmap.compress([1, 0, 1, 0])
      expect(bm.slice(2).expand()).toEqual([1, 0])
    })

    it('throws on invalid range', () => {
      const bm = RLEBitmap.compress([1, 0, 1])
      expect(() => bm.slice(2, 1)).toThrow(RangeError)
    })

    it('throws on out of bounds', () => {
      const bm = RLEBitmap.compress([1, 0])
      expect(() => bm.slice(0, 5)).toThrow(RangeError)
    })

    it('throws on negative start', () => {
      const bm = RLEBitmap.compress([1, 0])
      expect(() => bm.slice(-1)).toThrow(RangeError)
    })

    it('empty slice at boundary', () => {
      const bm = RLEBitmap.compress([1, 0])
      const s = bm.slice(2, 2)
      expect(s.size).toBe(0)
    })
  })

  describe('run merging', () => {
    it('merges after setting middle of run to same value', () => {
      const bm = RLEBitmap.compress([1, 0, 1])
      bm.set(1, 1)
      expect(bm.runs).toEqual([{ value: 1, count: 3 }])
    })

    it('merges after flipping boundary', () => {
      const bm = RLEBitmap.compress([1, 1, 0, 0])
      bm.flip(1)
      expect(bm.runs).toEqual([
        { value: 1, count: 1 },
        { value: 0, count: 3 },
      ])
    })

    it('keeps runs minimal after multiple sets', () => {
      const bm = RLEBitmap.compress([0, 0, 0, 0, 0])
      bm.set(1, 1)
      bm.set(3, 1)
      bm.set(1, 0)
      bm.set(3, 0)
      expect(bm.runs).toEqual([{ value: 0, count: 5 }])
    })
  })

  describe('large bitmaps', () => {
    it('handles 10000 zeros', () => {
      const bits = new Array(10000).fill(0)
      const bm = RLEBitmap.compress(bits)
      expect(bm.size).toBe(10000)
      expect(bm.runs.length).toBe(1)
      expect(bm.countOnes()).toBe(0)
    })

    it('handles 10000 ones', () => {
      const bits = new Array(10000).fill(1)
      const bm = RLEBitmap.compress(bits)
      expect(bm.size).toBe(10000)
      expect(bm.countOnes()).toBe(10000)
    })

    it('handles setting far index', () => {
      const bm = new RLEBitmap()
      bm.set(99999, 1)
      expect(bm.size).toBe(100000)
      expect(bm.get(99999)).toBe(1)
      expect(bm.get(0)).toBe(0)
    })

    it('compresses efficiently for long runs', () => {
      const bits = [1, ...new Array(9999).fill(0)]
      const bm = RLEBitmap.compress(bits)
      expect(bm.runs.length).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('set then get at index 0', () => {
      const bm = new RLEBitmap()
      bm.set(0, 1)
      expect(bm.get(0)).toBe(1)
      expect(bm.size).toBe(1)
    })

    it('multiple operations preserve consistency', () => {
      const bm = RLEBitmap.compress([0, 0, 0, 0, 0])
      bm.set(0, 1)
      bm.set(2, 1)
      bm.set(4, 1)
      expect(bm.expand()).toEqual([1, 0, 1, 0, 1])
      expect(bm.countOnes()).toBe(3)
      expect(bm.countZeros()).toBe(2)
    })

    it('fill then expand', () => {
      const bm = new RLEBitmap()
      bm.fill(1, 0, 5)
      expect(bm.expand()).toEqual([1, 1, 1, 1, 1])
    })

    it('clone after mutations', () => {
      const bm = new RLEBitmap()
      bm.set(0, 1)
      bm.set(2, 1)
      const copy = bm.clone()
      expect(copy.expand()).toEqual(bm.expand())
    })

    it('bitmap from compress is independent of source array', () => {
      const bits = [1, 0, 1]
      const bm = RLEBitmap.compress(bits)
      bits[0] = 0
      expect(bm.get(0)).toBe(1)
    })
  })

  describe('operations combinations', () => {
    it('and then or', () => {
      const a = RLEBitmap.compress([1, 0, 1, 0])
      const b = RLEBitmap.compress([0, 1, 0, 1])
      const andResult = a.and(b)
      const orResult = a.or(b)
      expect(andResult.expand()).toEqual([0, 0, 0, 0])
      expect(orResult.expand()).toEqual([1, 1, 1, 1])
    })

    it('xor then not', () => {
      const a = RLEBitmap.compress([1, 0, 1])
      const b = RLEBitmap.compress([1, 1, 0])
      const result = a.xor(b).not
      expect(result.expand()).toEqual([1, 0, 0])
    })

    it('slice then clone', () => {
      const bm = RLEBitmap.compress([1, 0, 1, 0, 1])
      const sliced = bm.slice(1, 4)
      const cloned = sliced.clone()
      expect(cloned.expand()).toEqual([0, 1, 0])
    })

    it('not then and with original', () => {
      const bm = RLEBitmap.compress([1, 0, 1, 0])
      const result = bm.and(bm.not)
      expect(result.countOnes()).toBe(0)
    })

    it('or then and recovers intersection', () => {
      const a = RLEBitmap.compress([1, 0, 1, 0])
      const b = RLEBitmap.compress([1, 1, 0, 0])
      const union = a.or(b)
      const intersection = a.and(b)
      expect(union.countOnes()).toBe(3)
      expect(intersection.countOnes()).toBe(1)
    })
  })
})
