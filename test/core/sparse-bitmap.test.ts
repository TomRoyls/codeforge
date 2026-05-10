import { describe, it, expect } from 'vitest'
import { SparseBitmap } from '../../src/core/sparse-bitmap/sparse-bitmap.js'

describe('SparseBitmap', () => {
  describe('construction', () => {
    it('creates empty bitmap with no options', () => {
      const bm = new SparseBitmap()
      expect(bm.isEmpty).toBe(true)
    })

    it('creates empty bitmap with empty options', () => {
      const bm = new SparseBitmap({})
      expect(bm.isEmpty).toBe(true)
    })

    it('creates empty bitmap with initialCapacity option', () => {
      const bm = new SparseBitmap({ initialCapacity: 100 })
      expect(bm.isEmpty).toBe(true)
    })

    it('starts with zero set bits', () => {
      const bm = new SparseBitmap()
      expect(bm.countSetBits()).toBe(0)
    })

    it('starts with no runs', () => {
      const bm = new SparseBitmap()
      expect(bm.stats().runCount).toBe(0)
    })
  })

  describe('set', () => {
    it('sets a single bit', () => {
      const bm = new SparseBitmap()
      bm.set(5)
      expect(bm.get(5)).toBe(1)
    })

    it('sets bit at 0', () => {
      const bm = new SparseBitmap()
      bm.set(0)
      expect(bm.get(0)).toBe(1)
    })

    it('sets large bit index', () => {
      const bm = new SparseBitmap()
      bm.set(1000000)
      expect(bm.get(1000000)).toBe(1)
    })

    it('idempotent set on same bit', () => {
      const bm = new SparseBitmap()
      bm.set(5)
      bm.set(5)
      expect(bm.get(5)).toBe(1)
      expect(bm.countSetBits()).toBe(1)
    })

    it('sets multiple non-adjacent bits', () => {
      const bm = new SparseBitmap()
      bm.set(1)
      bm.set(10)
      bm.set(100)
      expect(bm.countSetBits()).toBe(3)
    })

    it('merges adjacent bits into one run', () => {
      const bm = new SparseBitmap()
      bm.set(5)
      bm.set(6)
      bm.set(7)
      expect(bm.stats().runCount).toBe(1)
      expect(bm.countSetBits()).toBe(3)
    })

    it('merges with previous run', () => {
      const bm = new SparseBitmap()
      bm.set(5)
      bm.set(7)
      bm.set(6)
      expect(bm.stats().runCount).toBe(1)
      expect(bm.get(5)).toBe(1)
      expect(bm.get(6)).toBe(1)
      expect(bm.get(7)).toBe(1)
    })

    it('merges two runs when bridging bit is set', () => {
      const bm = new SparseBitmap()
      bm.set(1)
      bm.set(2)
      bm.set(4)
      bm.set(5)
      expect(bm.stats().runCount).toBe(2)
      bm.set(3)
      expect(bm.stats().runCount).toBe(1)
      expect(bm.countSetBits()).toBe(5)
    })

    it('throws on negative bit', () => {
      const bm = new SparseBitmap()
      expect(() => bm.set(-1)).toThrow(RangeError)
    })
  })

  describe('clear', () => {
    it('clears a set bit', () => {
      const bm = new SparseBitmap()
      bm.set(5)
      bm.clear(5)
      expect(bm.get(5)).toBe(0)
    })

    it('clear on unset bit is no-op', () => {
      const bm = new SparseBitmap()
      bm.clear(5)
      expect(bm.get(5)).toBe(0)
    })

    it('splits a run when clearing middle bit', () => {
      const bm = new SparseBitmap()
      bm.set(1)
      bm.set(2)
      bm.set(3)
      bm.clear(2)
      expect(bm.stats().runCount).toBe(2)
      expect(bm.get(1)).toBe(1)
      expect(bm.get(2)).toBe(0)
      expect(bm.get(3)).toBe(1)
    })

    it('removes run when clearing last bit in single-run', () => {
      const bm = new SparseBitmap()
      bm.set(5)
      bm.clear(5)
      expect(bm.isEmpty).toBe(true)
    })

    it('trims start of run when clearing first bit', () => {
      const bm = new SparseBitmap()
      bm.set(5)
      bm.set(6)
      bm.set(7)
      bm.clear(5)
      expect(bm.stats().runCount).toBe(1)
      expect(bm.get(5)).toBe(0)
      expect(bm.get(6)).toBe(1)
      expect(bm.get(7)).toBe(1)
    })

    it('trims end of run when clearing last bit', () => {
      const bm = new SparseBitmap()
      bm.set(5)
      bm.set(6)
      bm.set(7)
      bm.clear(7)
      expect(bm.stats().runCount).toBe(1)
      expect(bm.get(5)).toBe(1)
      expect(bm.get(6)).toBe(1)
      expect(bm.get(7)).toBe(0)
    })

    it('throws on negative bit', () => {
      const bm = new SparseBitmap()
      expect(() => bm.clear(-1)).toThrow(RangeError)
    })
  })

  describe('get', () => {
    it('returns 0 for unset bit', () => {
      const bm = new SparseBitmap()
      expect(bm.get(5)).toBe(0)
    })

    it('returns 1 for set bit', () => {
      const bm = new SparseBitmap()
      bm.set(5)
      expect(bm.get(5)).toBe(1)
    })

    it('returns 0 for bit 0 on empty bitmap', () => {
      const bm = new SparseBitmap()
      expect(bm.get(0)).toBe(0)
    })

    it('throws on negative bit', () => {
      const bm = new SparseBitmap()
      expect(() => bm.get(-1)).toThrow(RangeError)
    })

    it('returns correct values across a range', () => {
      const bm = new SparseBitmap()
      bm.set(10)
      bm.set(11)
      bm.set(12)
      expect(bm.get(9)).toBe(0)
      expect(bm.get(10)).toBe(1)
      expect(bm.get(11)).toBe(1)
      expect(bm.get(12)).toBe(1)
      expect(bm.get(13)).toBe(0)
    })
  })

  describe('flip', () => {
    it('flips unset bit to set', () => {
      const bm = new SparseBitmap()
      bm.flip(5)
      expect(bm.get(5)).toBe(1)
    })

    it('flips set bit to unset', () => {
      const bm = new SparseBitmap()
      bm.set(5)
      bm.flip(5)
      expect(bm.get(5)).toBe(0)
    })

    it('double flip restores original', () => {
      const bm = new SparseBitmap()
      bm.flip(5)
      bm.flip(5)
      expect(bm.get(5)).toBe(0)
    })

    it('throws on negative bit', () => {
      const bm = new SparseBitmap()
      expect(() => bm.flip(-1)).toThrow(RangeError)
    })

    it('flip merges adjacent runs', () => {
      const bm = new SparseBitmap()
      bm.set(1)
      bm.set(3)
      bm.flip(2)
      expect(bm.stats().runCount).toBe(1)
      expect(bm.countSetBits()).toBe(3)
    })
  })

  describe('setRange', () => {
    it('sets a range of bits', () => {
      const bm = new SparseBitmap()
      bm.setRange(5, 10)
      expect(bm.countSetBits()).toBe(5)
      for (let i = 5; i < 10; i++) {
        expect(bm.get(i)).toBe(1)
      }
    })

    it('empty range is no-op', () => {
      const bm = new SparseBitmap()
      bm.setRange(5, 5)
      expect(bm.isEmpty).toBe(true)
    })

    it('sets range starting at 0', () => {
      const bm = new SparseBitmap()
      bm.setRange(0, 3)
      expect(bm.countSetBits()).toBe(3)
    })

    it('merges with existing runs', () => {
      const bm = new SparseBitmap()
      bm.set(3)
      bm.set(4)
      bm.setRange(5, 8)
      expect(bm.stats().runCount).toBe(1)
      expect(bm.countSetBits()).toBe(5)
    })

    it('throws on negative start', () => {
      const bm = new SparseBitmap()
      expect(() => bm.setRange(-1, 5)).toThrow(RangeError)
    })

    it('throws when end < start', () => {
      const bm = new SparseBitmap()
      expect(() => bm.setRange(10, 5)).toThrow(RangeError)
    })
  })

  describe('clearRange', () => {
    it('clears a range of set bits', () => {
      const bm = new SparseBitmap()
      bm.setRange(0, 10)
      bm.clearRange(3, 7)
      expect(bm.countSetBits()).toBe(6)
      expect(bm.get(2)).toBe(1)
      expect(bm.get(3)).toBe(0)
      expect(bm.get(6)).toBe(0)
      expect(bm.get(7)).toBe(1)
    })

    it('empty range is no-op', () => {
      const bm = new SparseBitmap()
      bm.setRange(0, 5)
      bm.clearRange(3, 3)
      expect(bm.countSetBits()).toBe(5)
    })

    it('clearing entire range empties bitmap', () => {
      const bm = new SparseBitmap()
      bm.setRange(0, 10)
      bm.clearRange(0, 10)
      expect(bm.isEmpty).toBe(true)
    })

    it('clears across multiple runs', () => {
      const bm = new SparseBitmap()
      bm.setRange(0, 5)
      bm.setRange(10, 15)
      bm.setRange(20, 25)
      bm.clearRange(2, 22)
      expect(bm.get(0)).toBe(1)
      expect(bm.get(1)).toBe(1)
      expect(bm.get(2)).toBe(0)
      expect(bm.get(22)).toBe(1)
      expect(bm.get(23)).toBe(1)
      expect(bm.get(24)).toBe(1)
    })

    it('throws on negative start', () => {
      const bm = new SparseBitmap()
      expect(() => bm.clearRange(-1, 5)).toThrow(RangeError)
    })

    it('throws when end < start', () => {
      const bm = new SparseBitmap()
      expect(() => bm.clearRange(10, 5)).toThrow(RangeError)
    })
  })

  describe('getRange', () => {
    it('returns subset bitmap', () => {
      const bm = new SparseBitmap()
      bm.setRange(0, 10)
      const sub = bm.getRange(3, 7)
      expect(sub.countSetBits()).toBe(4)
      expect(sub.get(3)).toBe(1)
      expect(sub.get(6)).toBe(1)
      expect(sub.get(7)).toBe(0)
    })

    it('returns empty for range with no set bits', () => {
      const bm = new SparseBitmap()
      bm.setRange(0, 5)
      const sub = bm.getRange(10, 15)
      expect(sub.isEmpty).toBe(true)
    })

    it('empty range returns empty bitmap', () => {
      const bm = new SparseBitmap()
      bm.set(5)
      const sub = bm.getRange(5, 5)
      expect(sub.isEmpty).toBe(true)
    })

    it('throws on negative start', () => {
      const bm = new SparseBitmap()
      expect(() => bm.getRange(-1, 5)).toThrow(RangeError)
    })

    it('throws when end < start', () => {
      const bm = new SparseBitmap()
      expect(() => bm.getRange(10, 5)).toThrow(RangeError)
    })
  })

  describe('countSetBits', () => {
    it('returns 0 for empty bitmap', () => {
      const bm = new SparseBitmap()
      expect(bm.countSetBits()).toBe(0)
    })

    it('counts single bit', () => {
      const bm = new SparseBitmap()
      bm.set(5)
      expect(bm.countSetBits()).toBe(1)
    })

    it('counts contiguous run', () => {
      const bm = new SparseBitmap()
      bm.setRange(0, 100)
      expect(bm.countSetBits()).toBe(100)
    })

    it('counts across multiple runs', () => {
      const bm = new SparseBitmap()
      bm.setRange(0, 10)
      bm.setRange(20, 30)
      bm.setRange(50, 55)
      expect(bm.countSetBits()).toBe(10 + 10 + 5)
    })
  })

  describe('findFirstSet', () => {
    it('returns -1 for empty bitmap', () => {
      const bm = new SparseBitmap()
      expect(bm.findFirstSet()).toBe(-1)
    })

    it('returns first bit of single run', () => {
      const bm = new SparseBitmap()
      bm.set(10)
      expect(bm.findFirstSet()).toBe(10)
    })

    it('returns 0 when bit 0 is set', () => {
      const bm = new SparseBitmap()
      bm.set(0)
      expect(bm.findFirstSet()).toBe(0)
    })

    it('returns first bit across multiple runs', () => {
      const bm = new SparseBitmap()
      bm.set(100)
      bm.set(5)
      bm.set(50)
      expect(bm.findFirstSet()).toBe(5)
    })
  })

  describe('findFirstClear', () => {
    it('returns 0 for empty bitmap', () => {
      const bm = new SparseBitmap()
      expect(bm.findFirstClear()).toBe(0)
    })

    it('returns 0 when first run starts above 0', () => {
      const bm = new SparseBitmap()
      bm.set(5)
      expect(bm.findFirstClear()).toBe(0)
    })

    it('returns bit after first run when run starts at 0', () => {
      const bm = new SparseBitmap()
      bm.set(0)
      bm.set(1)
      bm.set(2)
      expect(bm.findFirstClear()).toBe(3)
    })

    it('returns 0 when only bit 0 is set', () => {
      const bm = new SparseBitmap()
      bm.set(0)
      expect(bm.findFirstClear()).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new bitmap', () => {
      const bm = new SparseBitmap()
      expect(bm.isEmpty).toBe(true)
    })

    it('returns false after setting a bit', () => {
      const bm = new SparseBitmap()
      bm.set(5)
      expect(bm.isEmpty).toBe(false)
    })

    it('returns true after clearing all bits', () => {
      const bm = new SparseBitmap()
      bm.set(5)
      bm.clear(5)
      expect(bm.isEmpty).toBe(true)
    })

    it('returns true after clear()', () => {
      const bm = new SparseBitmap()
      bm.setRange(0, 100)
      bm.clear()
      expect(bm.isEmpty).toBe(true)
    })
  })

  describe('union', () => {
    it('empty union empty is empty', () => {
      const a = new SparseBitmap()
      const b = new SparseBitmap()
      expect(a.union(b).isEmpty).toBe(true)
    })

    it('empty union non-empty returns non-empty', () => {
      const a = new SparseBitmap()
      const b = new SparseBitmap()
      b.set(5)
      const result = a.union(b)
      expect(result.countSetBits()).toBe(1)
      expect(result.get(5)).toBe(1)
    })

    it('non-empty union empty returns non-empty', () => {
      const a = new SparseBitmap()
      a.set(5)
      const b = new SparseBitmap()
      const result = a.union(b)
      expect(result.countSetBits()).toBe(1)
    })

    it('merges overlapping runs', () => {
      const a = new SparseBitmap()
      a.setRange(0, 5)
      const b = new SparseBitmap()
      b.setRange(3, 8)
      const result = a.union(b)
      expect(result.countSetBits()).toBe(8)
      expect(result.stats().runCount).toBe(1)
    })

    it('combines disjoint runs', () => {
      const a = new SparseBitmap()
      a.setRange(0, 3)
      const b = new SparseBitmap()
      b.setRange(10, 13)
      const result = a.union(b)
      expect(result.countSetBits()).toBe(6)
      expect(result.stats().runCount).toBe(2)
    })

    it('does not modify original bitmaps', () => {
      const a = new SparseBitmap()
      a.set(5)
      const b = new SparseBitmap()
      b.set(10)
      a.union(b)
      expect(a.countSetBits()).toBe(1)
      expect(b.countSetBits()).toBe(1)
    })
  })

  describe('intersection', () => {
    it('empty intersection non-empty is empty', () => {
      const a = new SparseBitmap()
      const b = new SparseBitmap()
      b.set(5)
      expect(a.intersection(b).isEmpty).toBe(true)
    })

    it('non-empty intersection empty is empty', () => {
      const a = new SparseBitmap()
      a.set(5)
      const b = new SparseBitmap()
      expect(a.intersection(b).isEmpty).toBe(true)
    })

    it('empty intersection empty is empty', () => {
      const a = new SparseBitmap()
      const b = new SparseBitmap()
      expect(a.intersection(b).isEmpty).toBe(true)
    })

    it('overlapping ranges produce intersection', () => {
      const a = new SparseBitmap()
      a.setRange(0, 10)
      const b = new SparseBitmap()
      b.setRange(5, 15)
      const result = a.intersection(b)
      expect(result.countSetBits()).toBe(5)
      expect(result.get(5)).toBe(1)
      expect(result.get(9)).toBe(1)
      expect(result.get(10)).toBe(0)
    })

    it('disjoint ranges produce empty intersection', () => {
      const a = new SparseBitmap()
      a.setRange(0, 5)
      const b = new SparseBitmap()
      b.setRange(10, 15)
      expect(a.intersection(b).isEmpty).toBe(true)
    })

    it('partial overlap of multiple runs', () => {
      const a = new SparseBitmap()
      a.setRange(0, 5)
      a.setRange(10, 15)
      const b = new SparseBitmap()
      b.setRange(3, 12)
      const result = a.intersection(b)
      expect(result.get(3)).toBe(1)
      expect(result.get(4)).toBe(1)
      expect(result.get(10)).toBe(1)
      expect(result.get(11)).toBe(1)
      expect(result.countSetBits()).toBe(4)
    })

    it('does not modify original bitmaps', () => {
      const a = new SparseBitmap()
      a.setRange(0, 5)
      const b = new SparseBitmap()
      b.setRange(3, 8)
      a.intersection(b)
      expect(a.countSetBits()).toBe(5)
      expect(b.countSetBits()).toBe(5)
    })
  })

  describe('difference', () => {
    it('empty difference non-empty is empty', () => {
      const a = new SparseBitmap()
      const b = new SparseBitmap()
      b.set(5)
      expect(a.difference(b).isEmpty).toBe(true)
    })

    it('non-empty difference empty is unchanged', () => {
      const a = new SparseBitmap()
      a.setRange(0, 5)
      const b = new SparseBitmap()
      const result = a.difference(b)
      expect(result.countSetBits()).toBe(5)
    })

    it('removes overlapping bits', () => {
      const a = new SparseBitmap()
      a.setRange(0, 10)
      const b = new SparseBitmap()
      b.setRange(3, 7)
      const result = a.difference(b)
      expect(result.countSetBits()).toBe(6)
      expect(result.get(2)).toBe(1)
      expect(result.get(3)).toBe(0)
      expect(result.get(6)).toBe(0)
      expect(result.get(7)).toBe(1)
    })

    it('disjoint difference is no-op', () => {
      const a = new SparseBitmap()
      a.setRange(0, 5)
      const b = new SparseBitmap()
      b.setRange(10, 15)
      const result = a.difference(b)
      expect(result.countSetBits()).toBe(5)
    })

    it('does not modify original bitmaps', () => {
      const a = new SparseBitmap()
      a.setRange(0, 10)
      const b = new SparseBitmap()
      b.setRange(5, 15)
      a.difference(b)
      expect(a.countSetBits()).toBe(10)
      expect(b.countSetBits()).toBe(10)
    })
  })

  describe('symmetricDifference', () => {
    it('empty symdiff empty is empty', () => {
      const a = new SparseBitmap()
      const b = new SparseBitmap()
      expect(a.symmetricDifference(b).isEmpty).toBe(true)
    })

    it('empty symdiff non-empty is non-empty', () => {
      const a = new SparseBitmap()
      const b = new SparseBitmap()
      b.set(5)
      const result = a.symmetricDifference(b)
      expect(result.countSetBits()).toBe(1)
      expect(result.get(5)).toBe(1)
    })

    it('overlapping bits are removed', () => {
      const a = new SparseBitmap()
      a.setRange(0, 10)
      const b = new SparseBitmap()
      b.setRange(5, 15)
      const result = a.symmetricDifference(b)
      expect(result.countSetBits()).toBe(10)
      expect(result.get(4)).toBe(1)
      expect(result.get(5)).toBe(0)
      expect(result.get(9)).toBe(0)
      expect(result.get(10)).toBe(1)
      expect(result.get(14)).toBe(1)
    })

    it('disjoint bits are kept', () => {
      const a = new SparseBitmap()
      a.setRange(0, 5)
      const b = new SparseBitmap()
      b.setRange(10, 15)
      const result = a.symmetricDifference(b)
      expect(result.countSetBits()).toBe(10)
    })

    it('does not modify original bitmaps', () => {
      const a = new SparseBitmap()
      a.set(5)
      const b = new SparseBitmap()
      b.set(5)
      a.symmetricDifference(b)
      expect(a.get(5)).toBe(1)
      expect(b.get(5)).toBe(1)
    })
  })

  describe('clear', () => {
    it('clears all bits', () => {
      const bm = new SparseBitmap()
      bm.setRange(0, 100)
      bm.clear()
      expect(bm.isEmpty).toBe(true)
      expect(bm.countSetBits()).toBe(0)
    })

    it('clear on empty is no-op', () => {
      const bm = new SparseBitmap()
      bm.clear()
      expect(bm.isEmpty).toBe(true)
    })

    it('allows setting bits after clear', () => {
      const bm = new SparseBitmap()
      bm.set(5)
      bm.clear()
      bm.set(10)
      expect(bm.get(10)).toBe(1)
      expect(bm.get(5)).toBe(0)
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const bm = new SparseBitmap()
      bm.setRange(0, 5)
      const clone = bm.clone()
      expect(clone.countSetBits()).toBe(5)
      clone.clear(0)
      expect(bm.get(0)).toBe(1)
      expect(clone.get(0)).toBe(0)
    })

    it('clone of empty is empty', () => {
      const bm = new SparseBitmap()
      const clone = bm.clone()
      expect(clone.isEmpty).toBe(true)
    })

    it('clone preserves all runs', () => {
      const bm = new SparseBitmap()
      bm.setRange(0, 5)
      bm.setRange(10, 15)
      bm.setRange(100, 105)
      const clone = bm.clone()
      expect(clone.stats().runCount).toBe(3)
      expect(clone.countSetBits()).toBe(bm.countSetBits())
    })
  })

  describe('static from', () => {
    it('creates bitmap from array', () => {
      const bm = SparseBitmap.from([1, 3, 5])
      expect(bm.countSetBits()).toBe(3)
      expect(bm.get(1)).toBe(1)
      expect(bm.get(2)).toBe(0)
      expect(bm.get(3)).toBe(1)
    })

    it('creates bitmap from set', () => {
      const bm = SparseBitmap.from(new Set([10, 20, 30]))
      expect(bm.countSetBits()).toBe(3)
    })

    it('creates empty from empty iterable', () => {
      const bm = SparseBitmap.from([])
      expect(bm.isEmpty).toBe(true)
    })

    it('handles unsorted input', () => {
      const bm = SparseBitmap.from([5, 1, 3])
      expect(bm.countSetBits()).toBe(3)
    })

    it('deduplicates input', () => {
      const bm = SparseBitmap.from([5, 5, 5])
      expect(bm.countSetBits()).toBe(1)
    })

    it('creates contiguous run from sequential values', () => {
      const bm = SparseBitmap.from([1, 2, 3, 4, 5])
      expect(bm.stats().runCount).toBe(1)
    })
  })

  describe('toSet', () => {
    it('returns empty set for empty bitmap', () => {
      const bm = new SparseBitmap()
      expect(bm.toSet().size).toBe(0)
    })

    it('returns all set bits', () => {
      const bm = new SparseBitmap()
      bm.set(1)
      bm.set(5)
      bm.set(10)
      const s = bm.toSet()
      expect(s.size).toBe(3)
      expect(s.has(1)).toBe(true)
      expect(s.has(5)).toBe(true)
      expect(s.has(10)).toBe(true)
    })

    it('includes all bits from contiguous run', () => {
      const bm = new SparseBitmap()
      bm.setRange(3, 7)
      const s = bm.toSet()
      expect(s.size).toBe(4)
      expect(s.has(3)).toBe(true)
      expect(s.has(6)).toBe(true)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty bitmap', () => {
      const bm = new SparseBitmap()
      expect(bm.toArray()).toEqual([])
    })

    it('returns sorted array of set bits', () => {
      const bm = new SparseBitmap()
      bm.set(10)
      bm.set(5)
      bm.set(1)
      expect(bm.toArray()).toEqual([1, 5, 10])
    })

    it('includes all bits from contiguous runs', () => {
      const bm = new SparseBitmap()
      bm.setRange(3, 6)
      expect(bm.toArray()).toEqual([3, 4, 5])
    })

    it('includes all bits from multiple runs', () => {
      const bm = new SparseBitmap()
      bm.setRange(1, 3)
      bm.setRange(5, 7)
      expect(bm.toArray()).toEqual([1, 2, 5, 6])
    })
  })

  describe('forEach', () => {
    it('does not call callback on empty bitmap', () => {
      const bm = new SparseBitmap()
      const bits: number[] = []
      bm.forEach(bit => bits.push(bit))
      expect(bits).toEqual([])
    })

    it('iterates all set bits in order', () => {
      const bm = new SparseBitmap()
      bm.set(5)
      bm.set(10)
      bm.set(15)
      const bits: number[] = []
      bm.forEach(bit => bits.push(bit))
      expect(bits).toEqual([5, 10, 15])
    })

    it('iterates across contiguous runs', () => {
      const bm = new SparseBitmap()
      bm.setRange(3, 6)
      const bits: number[] = []
      bm.forEach(bit => bits.push(bit))
      expect(bits).toEqual([3, 4, 5])
    })

    it('iterates across multiple runs', () => {
      const bm = new SparseBitmap()
      bm.setRange(1, 3)
      bm.setRange(10, 12)
      const bits: number[] = []
      bm.forEach(bit => bits.push(bit))
      expect(bits).toEqual([1, 2, 10, 11])
    })
  })

  describe('stats', () => {
    it('returns correct stats for empty bitmap', () => {
      const bm = new SparseBitmap()
      const s = bm.stats()
      expect(s.runCount).toBe(0)
      expect(s.setBitCount).toBe(0)
      expect(s.memoryUsageBytes).toBe(0)
      expect(s.isEmpty).toBe(true)
      expect(s.minBit).toBe(null)
      expect(s.maxBit).toBe(null)
    })

    it('returns correct stats for single run', () => {
      const bm = new SparseBitmap()
      bm.setRange(10, 15)
      const s = bm.stats()
      expect(s.runCount).toBe(1)
      expect(s.setBitCount).toBe(5)
      expect(s.minBit).toBe(10)
      expect(s.maxBit).toBe(14)
      expect(s.isEmpty).toBe(false)
    })

    it('returns correct stats for multiple runs', () => {
      const bm = new SparseBitmap()
      bm.setRange(0, 5)
      bm.setRange(100, 105)
      const s = bm.stats()
      expect(s.runCount).toBe(2)
      expect(s.setBitCount).toBe(10)
      expect(s.minBit).toBe(0)
      expect(s.maxBit).toBe(104)
    })

    it('memory usage scales with run count', () => {
      const bm = new SparseBitmap()
      bm.set(1)
      bm.set(3)
      bm.set(5)
      const s = bm.stats()
      expect(s.memoryUsageBytes).toBe(3 * 2 * 8)
    })

    it('compression ratio for sparse data', () => {
      const bm = new SparseBitmap()
      bm.set(0)
      bm.set(1000000)
      const s = bm.stats()
      expect(s.compressionRatio).toBeGreaterThan(0)
      expect(s.compressionRatio).toBeLessThan(1)
    })

    it('compression ratio is 0 for empty bitmap', () => {
      const bm = new SparseBitmap()
      expect(bm.stats().compressionRatio).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('empty bitmap operations', () => {
      const bm = new SparseBitmap()
      expect(bm.get(0)).toBe(0)
      expect(bm.countSetBits()).toBe(0)
      expect(bm.findFirstSet()).toBe(-1)
      expect(bm.findFirstClear()).toBe(0)
      expect(bm.isEmpty).toBe(true)
      expect(bm.toArray()).toEqual([])
      expect(bm.toSet().size).toBe(0)
    })

    it('single bit operations', () => {
      const bm = new SparseBitmap()
      bm.set(42)
      expect(bm.get(42)).toBe(1)
      expect(bm.countSetBits()).toBe(1)
      expect(bm.findFirstSet()).toBe(42)
      bm.clear(42)
      expect(bm.isEmpty).toBe(true)
    })

    it('merge adjacent runs when filling gap', () => {
      const bm = new SparseBitmap()
      bm.setRange(0, 5)
      bm.setRange(10, 15)
      expect(bm.stats().runCount).toBe(2)
      bm.setRange(5, 10)
      expect(bm.stats().runCount).toBe(1)
      expect(bm.countSetBits()).toBe(15)
    })

    it('split run on clear', () => {
      const bm = new SparseBitmap()
      bm.setRange(0, 10)
      bm.clear(5)
      expect(bm.stats().runCount).toBe(2)
      expect(bm.get(4)).toBe(1)
      expect(bm.get(5)).toBe(0)
      expect(bm.get(6)).toBe(1)
    })

    it('large gaps between bits', () => {
      const bm = new SparseBitmap()
      bm.set(0)
      bm.set(1000000)
      bm.set(2000000)
      expect(bm.stats().runCount).toBe(3)
      expect(bm.countSetBits()).toBe(3)
      expect(bm.get(0)).toBe(1)
      expect(bm.get(1000000)).toBe(1)
      expect(bm.get(500000)).toBe(0)
    })

    it('setting bits in reverse order', () => {
      const bm = new SparseBitmap()
      bm.set(10)
      bm.set(5)
      bm.set(1)
      expect(bm.toArray()).toEqual([1, 5, 10])
    })

    it('clearing bits in various orders', () => {
      const bm = new SparseBitmap()
      bm.setRange(0, 10)
      bm.clear(5)
      bm.clear(0)
      bm.clear(9)
      expect(bm.countSetBits()).toBe(7)
      expect(bm.get(0)).toBe(0)
      expect(bm.get(1)).toBe(1)
    })

    it('set and clear same bit repeatedly', () => {
      const bm = new SparseBitmap()
      for (let i = 0; i < 10; i++) {
        bm.set(5)
        bm.clear(5)
      }
      expect(bm.get(5)).toBe(0)
      expect(bm.isEmpty).toBe(true)
    })
  })

  describe('large bitmaps', () => {
    it('handles millions of bits in a single run', () => {
      const bm = new SparseBitmap()
      bm.setRange(0, 1000000)
      expect(bm.countSetBits()).toBe(1000000)
      expect(bm.stats().runCount).toBe(1)
      expect(bm.get(0)).toBe(1)
      expect(bm.get(999999)).toBe(1)
      expect(bm.get(1000000)).toBe(0)
    })

    it('handles sparse million-bit range', () => {
      const bm = new SparseBitmap()
      for (let i = 0; i < 1000; i++) {
        bm.set(i * 1000)
      }
      expect(bm.countSetBits()).toBe(1000)
      expect(bm.stats().runCount).toBe(1000)
      expect(bm.get(0)).toBe(1)
      expect(bm.get(999000)).toBe(1)
      expect(bm.get(500)).toBe(0)
    })

    it('union of large bitmaps', () => {
      const a = new SparseBitmap()
      a.setRange(0, 500000)
      const b = new SparseBitmap()
      b.setRange(500000, 1000000)
      const result = a.union(b)
      expect(result.countSetBits()).toBe(1000000)
    })

    it('intersection of large overlapping bitmaps', () => {
      const a = new SparseBitmap()
      a.setRange(0, 1000000)
      const b = new SparseBitmap()
      b.setRange(500000, 1500000)
      const result = a.intersection(b)
      expect(result.countSetBits()).toBe(500000)
    })

    it('clear range on large bitmap', () => {
      const bm = new SparseBitmap()
      bm.setRange(0, 1000000)
      bm.clearRange(400000, 600000)
      expect(bm.countSetBits()).toBe(800000)
      expect(bm.get(399999)).toBe(1)
      expect(bm.get(400000)).toBe(0)
      expect(bm.get(599999)).toBe(0)
      expect(bm.get(600000)).toBe(1)
    })

    it('clone large bitmap', () => {
      const bm = new SparseBitmap()
      bm.setRange(0, 1000000)
      const clone = bm.clone()
      expect(clone.countSetBits()).toBe(1000000)
      clone.clear(0)
      expect(bm.get(0)).toBe(1)
    })
  })

  describe('toData', () => {
    it('returns empty runs for empty bitmap', () => {
      const bm = new SparseBitmap()
      expect(bm.toData().runs).toEqual([])
    })

    it('returns runs for bitmap with data', () => {
      const bm = new SparseBitmap()
      bm.setRange(5, 10)
      const data = bm.toData()
      expect(data.runs).toEqual([{ start: 5, length: 5 }])
    })

    it('returns multiple runs', () => {
      const bm = new SparseBitmap()
      bm.setRange(1, 4)
      bm.setRange(10, 13)
      const data = bm.toData()
      expect(data.runs).toEqual([
        { start: 1, length: 3 },
        { start: 10, length: 3 },
      ])
    })
  })

  describe('operations chaining', () => {
    it('set then get then clear then get', () => {
      const bm = new SparseBitmap()
      bm.set(42)
      expect(bm.get(42)).toBe(1)
      bm.clear(42)
      expect(bm.get(42)).toBe(0)
    })

    it('multiple set/clear cycles', () => {
      const bm = new SparseBitmap()
      bm.set(1)
      bm.set(2)
      bm.set(3)
      bm.clear(2)
      expect(bm.toArray()).toEqual([1, 3])
      bm.set(2)
      expect(bm.toArray()).toEqual([1, 2, 3])
    })

    it('setRange then clearRange then getRange', () => {
      const bm = new SparseBitmap()
      bm.setRange(0, 20)
      bm.clearRange(5, 15)
      const sub = bm.getRange(3, 17)
      expect(sub.get(3)).toBe(1)
      expect(sub.get(4)).toBe(1)
      expect(sub.get(5)).toBe(0)
      expect(sub.get(14)).toBe(0)
      expect(sub.get(15)).toBe(1)
      expect(sub.get(16)).toBe(1)
    })
  })
})
