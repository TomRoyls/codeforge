import { CompactSet } from '../src/core/compact-set/compact-set.js'
import type { CompactSetOptions } from '../src/core/compact-set/types.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('CompactSet', () => {
  describe('constructor', () => {
    it('creates a set with a number argument', () => {
      const set = new CompactSet(63)
      expect(set.size).toBe(0)
      expect(set.isEmpty()).toBe(true)
    })

    it('creates a set with options object', () => {
      const opts: CompactSetOptions = { maxValue: 100 }
      const set = new CompactSet(opts)
      expect(set.size).toBe(0)
      expect(set.isEmpty()).toBe(true)
    })

    it('creates a set with maxValue 0', () => {
      const set = new CompactSet(0)
      expect(set.size).toBe(0)
    })

    it('throws RangeError for negative maxValue', () => {
      expect(() => new CompactSet(-1)).toThrow(RangeError)
      expect(() => new CompactSet(-1)).toThrow('maxValue must be a non-negative integer')
    })

    it('throws RangeError for non-integer maxValue', () => {
      expect(() => new CompactSet(1.5)).toThrow(RangeError)
      expect(() => new CompactSet(1.5)).toThrow('maxValue must be a non-negative integer')
    })

    it('creates a set for a large maxValue', () => {
      const set = new CompactSet(1023)
      expect(set.size).toBe(0)
      expect(set.isEmpty()).toBe(true)
    })
  })

  // ─── add ───────────────────────────────────────────────────────────────

  describe('add', () => {
    it('adds a value and returns true', () => {
      const set = new CompactSet(63)
      expect(set.add(5)).toBe(true)
      expect(set.size).toBe(1)
      expect(set.has(5)).toBe(true)
    })

    it('returns false when adding a duplicate', () => {
      const set = new CompactSet(63)
      set.add(5)
      expect(set.add(5)).toBe(false)
      expect(set.size).toBe(1)
    })

    it('adds 0 as a valid value', () => {
      const set = new CompactSet(10)
      expect(set.add(0)).toBe(true)
      expect(set.has(0)).toBe(true)
    })

    it('adds maxValue as a valid value', () => {
      const set = new CompactSet(63)
      expect(set.add(63)).toBe(true)
      expect(set.has(63)).toBe(true)
    })

    it('throws RangeError for value exceeding maxValue', () => {
      const set = new CompactSet(10)
      expect(() => set.add(11)).toThrow(RangeError)
    })

    it('throws RangeError for negative value', () => {
      const set = new CompactSet(10)
      expect(() => set.add(-1)).toThrow(RangeError)
    })

    it('throws RangeError for non-integer value', () => {
      const set = new CompactSet(10)
      expect(() => set.add(3.14)).toThrow(RangeError)
    })

    it('tracks size correctly after multiple adds', () => {
      const set = new CompactSet(100)
      set.add(1)
      set.add(2)
      set.add(3)
      expect(set.size).toBe(3)
    })
  })

  // ─── has ───────────────────────────────────────────────────────────────

  describe('has', () => {
    it('returns true for a value that was added', () => {
      const set = new CompactSet(63)
      set.add(10)
      expect(set.has(10)).toBe(true)
    })

    it('returns false for a value that was not added', () => {
      const set = new CompactSet(63)
      expect(set.has(10)).toBe(false)
    })

    it('returns false for a value out of range instead of throwing', () => {
      const set = new CompactSet(10)
      expect(set.has(11)).toBe(false)
      expect(set.has(-1)).toBe(false)
    })

    it('returns false for non-integer values', () => {
      const set = new CompactSet(10)
      expect(set.has(1.5)).toBe(false)
    })

    it('returns false on an empty set', () => {
      const set = new CompactSet(63)
      expect(set.has(0)).toBe(false)
    })
  })

  // ─── delete ────────────────────────────────────────────────────────────

  describe('delete', () => {
    it('deletes a value and returns true', () => {
      const set = new CompactSet(63)
      set.add(5)
      expect(set.delete(5)).toBe(true)
      expect(set.size).toBe(0)
      expect(set.has(5)).toBe(false)
    })

    it('returns false when deleting a non-existent value', () => {
      const set = new CompactSet(63)
      expect(set.delete(5)).toBe(false)
      expect(set.size).toBe(0)
    })

    it('throws RangeError for out-of-range value', () => {
      const set = new CompactSet(10)
      expect(() => set.delete(11)).toThrow(RangeError)
    })

    it('throws RangeError for negative value', () => {
      const set = new CompactSet(10)
      expect(() => set.delete(-1)).toThrow(RangeError)
    })

    it('can add back a deleted value', () => {
      const set = new CompactSet(63)
      set.add(5)
      set.delete(5)
      expect(set.add(5)).toBe(true)
      expect(set.size).toBe(1)
    })

    it('decrements size only when value existed', () => {
      const set = new CompactSet(63)
      set.add(1)
      set.add(2)
      set.delete(1)
      expect(set.size).toBe(1)
      set.delete(1) // already removed
      expect(set.size).toBe(1)
    })
  })

  // ─── size / isEmpty / isFull ───────────────────────────────────────────

  describe('size, isEmpty, isFull', () => {
    it('size is 0 on empty set', () => {
      const set = new CompactSet(10)
      expect(set.size).toBe(0)
    })

    it('isEmpty returns true on empty set', () => {
      const set = new CompactSet(10)
      expect(set.isEmpty()).toBe(true)
    })

    it('isEmpty returns false after add', () => {
      const set = new CompactSet(10)
      set.add(1)
      expect(set.isEmpty()).toBe(false)
    })

    it('isFull returns true when all values are present', () => {
      const set = new CompactSet(3)
      set.add(0)
      set.add(1)
      set.add(2)
      set.add(3)
      expect(set.isFull()).toBe(true)
    })

    it('isFull returns false when not all values present', () => {
      const set = new CompactSet(3)
      set.add(0)
      set.add(2)
      expect(set.isFull()).toBe(false)
    })

    it('isFull returns false on empty set', () => {
      const set = new CompactSet(3)
      expect(set.isFull()).toBe(false)
    })

    it('isFull works for maxValue 0', () => {
      const set = new CompactSet(0)
      expect(set.isFull()).toBe(false)
      set.add(0)
      expect(set.isFull()).toBe(true)
    })
  })

  // ─── clear ─────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('removes all elements', () => {
      const set = new CompactSet(63)
      set.add(1)
      set.add(2)
      set.add(3)
      set.clear()
      expect(set.size).toBe(0)
      expect(set.isEmpty()).toBe(true)
    })

    it('clear on empty set does nothing', () => {
      const set = new CompactSet(63)
      set.clear()
      expect(set.size).toBe(0)
    })

    it('allows adding after clear', () => {
      const set = new CompactSet(63)
      set.add(5)
      set.clear()
      expect(set.add(5)).toBe(true)
      expect(set.size).toBe(1)
    })
  })

  // ─── addAll / deleteAll ────────────────────────────────────────────────

  describe('addAll / deleteAll', () => {
    it('addAll adds multiple values from an array', () => {
      const set = new CompactSet(100)
      set.addAll([1, 2, 3, 4, 5])
      expect(set.size).toBe(5)
      expect(set.has(3)).toBe(true)
    })

    it('addAll ignores duplicates', () => {
      const set = new CompactSet(10)
      set.add(1)
      set.addAll([1, 2, 3])
      expect(set.size).toBe(3)
    })

    it('addAll works with an empty iterable', () => {
      const set = new CompactSet(10)
      set.addAll([])
      expect(set.size).toBe(0)
    })

    it('deleteAll removes multiple values', () => {
      const set = new CompactSet(100)
      set.addAll([1, 2, 3, 4, 5])
      set.deleteAll([2, 4])
      expect(set.size).toBe(3)
      expect(set.has(2)).toBe(false)
      expect(set.has(4)).toBe(false)
      expect(set.has(1)).toBe(true)
    })

    it('deleteAll ignores values not in the set', () => {
      const set = new CompactSet(100)
      set.addAll([1, 2])
      set.deleteAll([3, 4])
      expect(set.size).toBe(2)
    })

    it('addAll works with a generator', () => {
      const set = new CompactSet(100)
      function* gen() {
        yield 10
        yield 20
        yield 30
      }
      set.addAll(gen())
      expect(set.size).toBe(3)
      expect(set.has(10)).toBe(true)
      expect(set.has(20)).toBe(true)
      expect(set.has(30)).toBe(true)
    })
  })

  // ─── toArray ───────────────────────────────────────────────────────────

  describe('toArray', () => {
    it('returns an empty array for empty set', () => {
      const set = new CompactSet(63)
      expect(set.toArray()).toEqual([])
    })

    it('returns all values in ascending order', () => {
      const set = new CompactSet(63)
      set.addAll([5, 1, 3, 2, 4])
      expect(set.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('returns values across word boundaries', () => {
      const set = new CompactSet(100)
      set.addAll([0, 31, 32, 63])
      expect(set.toArray()).toEqual([0, 31, 32, 63])
    })
  })

  // ─── forEach ───────────────────────────────────────────────────────────

  describe('forEach', () => {
    it('iterates over all values', () => {
      const set = new CompactSet(63)
      set.addAll([1, 2, 3])
      const collected: number[] = []
      set.forEach((v) => collected.push(v))
      expect(collected).toEqual([1, 2, 3])
    })

    it('does not call callback on empty set', () => {
      const set = new CompactSet(63)
      let count = 0
      set.forEach(() => { count++ })
      expect(count).toBe(0)
    })
  })

  // ─── Symbol.iterator ──────────────────────────────────────────────────

  describe('Symbol.iterator', () => {
    it('is iterable via forEach (tests iterator path)', () => {
      const set = new CompactSet(63)
      set.addAll([10, 20, 30])
      const result: number[] = []
      set.forEach((v) => result.push(v))
      expect(result).toEqual([10, 20, 30])
    })

    it('yields values in ascending order via toArray', () => {
      const set = new CompactSet(63)
      set.addAll([50, 5, 30])
      expect(set.toArray()).toEqual([5, 30, 50])
    })

    it('returns empty for empty set via toArray', () => {
      const set = new CompactSet(63)
      expect(set.toArray()).toEqual([])
    })
  })

  // ─── first / last ─────────────────────────────────────────────────────

  describe('first / last', () => {
    it('first returns the smallest value', () => {
      const set = new CompactSet(63)
      set.addAll([10, 20, 30])
      expect(set.first()).toBe(10)
    })

    it('first returns undefined for empty set', () => {
      const set = new CompactSet(63)
      expect(set.first()).toBeUndefined()
    })

    it('last returns the largest value', () => {
      const set = new CompactSet(63)
      set.addAll([10, 20, 30])
      expect(set.last()).toBe(30)
    })

    it('last returns undefined for empty set', () => {
      const set = new CompactSet(63)
      expect(set.last()).toBeUndefined()
    })

    it('first and last are same for a single-element set', () => {
      const set = new CompactSet(63)
      set.add(42)
      expect(set.first()).toBe(42)
      expect(set.last()).toBe(42)
    })
  })

  // ─── next / previous ──────────────────────────────────────────────────

  describe('next / previous', () => {
    it('next returns the next higher value', () => {
      const set = new CompactSet(63)
      set.addAll([10, 20, 30])
      expect(set.next(10)).toBe(20)
      expect(set.next(20)).toBe(30)
    })

    it('next returns undefined when no higher value exists', () => {
      const set = new CompactSet(63)
      set.addAll([10, 20])
      expect(set.next(20)).toBeUndefined()
    })

    it('next with negative argument returns first', () => {
      const set = new CompactSet(63)
      set.addAll([5, 10])
      expect(set.next(-1)).toBe(5)
    })

    it('previous returns the next lower value', () => {
      const set = new CompactSet(63)
      set.addAll([10, 20, 30])
      expect(set.previous(30)).toBe(20)
      expect(set.previous(20)).toBe(10)
    })

    it('previous returns undefined when no lower value exists', () => {
      const set = new CompactSet(63)
      set.addAll([10, 20])
      expect(set.previous(10)).toBeUndefined()
    })

    it('previous with value > maxValue returns last', () => {
      const set = new CompactSet(30)
      set.addAll([10, 20])
      expect(set.previous(100)).toBe(20)
    })

    it('previous with value 0 returns undefined', () => {
      const set = new CompactSet(63)
      set.addAll([10, 20])
      expect(set.previous(0)).toBeUndefined()
    })

    it('next skips gaps correctly', () => {
      const set = new CompactSet(63)
      set.addAll([1, 50])
      expect(set.next(1)).toBe(50)
    })

    it('previous skips gaps correctly', () => {
      const set = new CompactSet(63)
      set.addAll([1, 50])
      expect(set.previous(50)).toBe(1)
    })
  })

  // ─── complement ────────────────────────────────────────────────────────

  describe('complement', () => {
    it('returns the complement of an empty set', () => {
      const set = new CompactSet(3)
      const comp = set.complement()
      expect(comp.toArray()).toEqual([0, 1, 2, 3])
      expect(comp.size).toBe(4)
    })

    it('returns the complement of a full set', () => {
      const set = new CompactSet(3)
      set.addAll([0, 1, 2, 3])
      const comp = set.complement()
      expect(comp.toArray()).toEqual([])
      expect(comp.size).toBe(0)
    })

    it('returns the complement of a partial set', () => {
      const set = new CompactSet(5)
      set.addAll([1, 3])
      const comp = set.complement()
      expect(comp.toArray()).toEqual([0, 2, 4, 5])
      expect(comp.size).toBe(4)
    })

    it('double complement returns the original set', () => {
      const set = new CompactSet(63)
      set.addAll([5, 10, 20])
      const double = set.complement().complement()
      expect(double.toArray()).toEqual([5, 10, 20])
      expect(double.size).toBe(3)
    })

    it('does not modify the original set', () => {
      const set = new CompactSet(10)
      set.addAll([1, 2])
      set.complement()
      expect(set.toArray()).toEqual([1, 2])
    })
  })

  // ─── union ─────────────────────────────────────────────────────────────

  describe('union', () => {
    it('returns union of two sets', () => {
      const a = new CompactSet(63)
      a.addAll([1, 2, 3])
      const b = new CompactSet(63)
      b.addAll([3, 4, 5])
      const result = a.union(b)
      expect(result.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('returns copy when other set is empty', () => {
      const a = new CompactSet(63)
      a.addAll([1, 2])
      const b = new CompactSet(63)
      const result = a.union(b)
      expect(result.toArray()).toEqual([1, 2])
    })

    it('returns copy when this set is empty', () => {
      const a = new CompactSet(63)
      const b = new CompactSet(63)
      b.addAll([1, 2])
      const result = a.union(b)
      expect(result.toArray()).toEqual([1, 2])
    })

    it('handles sets with different maxValue', () => {
      const a = new CompactSet(31)
      a.addAll([1, 2])
      const b = new CompactSet(63)
      b.addAll([50])
      const result = a.union(b)
      expect(result.toArray()).toEqual([1, 2, 50])
    })

    it('does not modify the original sets', () => {
      const a = new CompactSet(63)
      a.addAll([1])
      const b = new CompactSet(63)
      b.addAll([2])
      a.union(b)
      expect(a.toArray()).toEqual([1])
      expect(b.toArray()).toEqual([2])
    })
  })

  // ─── intersect ─────────────────────────────────────────────────────────

  describe('intersect', () => {
    it('returns intersection of two sets', () => {
      const a = new CompactSet(63)
      a.addAll([1, 2, 3])
      const b = new CompactSet(63)
      b.addAll([2, 3, 4])
      const result = a.intersect(b)
      expect(result.toArray()).toEqual([2, 3])
    })

    it('returns empty when no overlap', () => {
      const a = new CompactSet(63)
      a.addAll([1, 2])
      const b = new CompactSet(63)
      b.addAll([3, 4])
      const result = a.intersect(b)
      expect(result.toArray()).toEqual([])
    })

    it('returns copy when sets are identical', () => {
      const a = new CompactSet(63)
      a.addAll([1, 2, 3])
      const b = new CompactSet(63)
      b.addAll([1, 2, 3])
      const result = a.intersect(b)
      expect(result.toArray()).toEqual([1, 2, 3])
    })

    it('handles sets with different maxValue', () => {
      const a = new CompactSet(63)
      a.addAll([1, 50])
      const b = new CompactSet(31)
      b.addAll([1, 30])
      const result = a.intersect(b)
      expect(result.toArray()).toEqual([1])
    })

    it('returns empty when intersecting with empty', () => {
      const a = new CompactSet(63)
      a.addAll([1, 2])
      const b = new CompactSet(63)
      const result = a.intersect(b)
      expect(result.toArray()).toEqual([])
    })
  })

  // ─── difference ────────────────────────────────────────────────────────

  describe('difference', () => {
    it('returns difference of two sets', () => {
      const a = new CompactSet(63)
      a.addAll([1, 2, 3])
      const b = new CompactSet(63)
      b.addAll([2, 4])
      const result = a.difference(b)
      expect(result.toArray()).toEqual([1, 3])
    })

    it('returns copy when other set is empty', () => {
      const a = new CompactSet(63)
      a.addAll([1, 2])
      const b = new CompactSet(63)
      const result = a.difference(b)
      expect(result.toArray()).toEqual([1, 2])
    })

    it('returns empty when this set is subset of other', () => {
      const a = new CompactSet(63)
      a.addAll([1, 2])
      const b = new CompactSet(63)
      b.addAll([1, 2, 3, 4])
      const result = a.difference(b)
      expect(result.toArray()).toEqual([])
    })

    it('preserves values only in this set', () => {
      const a = new CompactSet(63)
      a.addAll([1, 2, 3])
      const b = new CompactSet(63)
      b.addAll([4, 5, 6])
      const result = a.difference(b)
      expect(result.toArray()).toEqual([1, 2, 3])
    })
  })

  // ─── equals ────────────────────────────────────────────────────────────

  describe('equals', () => {
    it('returns true for identical sets', () => {
      const a = new CompactSet(63)
      a.addAll([1, 2, 3])
      const b = new CompactSet(63)
      b.addAll([1, 2, 3])
      expect(a.equals(b)).toBe(true)
    })

    it('returns true for empty sets', () => {
      const a = new CompactSet(63)
      const b = new CompactSet(63)
      expect(a.equals(b)).toBe(true)
    })

    it('returns false for different values', () => {
      const a = new CompactSet(63)
      a.addAll([1, 2])
      const b = new CompactSet(63)
      b.addAll([1, 3])
      expect(a.equals(b)).toBe(false)
    })

    it('returns false for different sizes', () => {
      const a = new CompactSet(63)
      a.addAll([1, 2])
      const b = new CompactSet(63)
      b.addAll([1, 2, 3])
      expect(a.equals(b)).toBe(false)
    })

    it('handles sets with different maxValue but same content', () => {
      const a = new CompactSet(31)
      a.addAll([1, 2])
      const b = new CompactSet(63)
      b.addAll([1, 2])
      expect(a.equals(b)).toBe(true)
    })
  })

  // ─── isSubsetOf ────────────────────────────────────────────────────────

  describe('isSubsetOf', () => {
    it('returns true for a proper subset', () => {
      const a = new CompactSet(63)
      a.addAll([1, 2])
      const b = new CompactSet(63)
      b.addAll([1, 2, 3])
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('returns true for identical sets', () => {
      const a = new CompactSet(63)
      a.addAll([1, 2])
      const b = new CompactSet(63)
      b.addAll([1, 2])
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('returns false when not a subset', () => {
      const a = new CompactSet(63)
      a.addAll([1, 2, 3])
      const b = new CompactSet(63)
      b.addAll([1, 2])
      expect(a.isSubsetOf(b)).toBe(false)
    })

    it('returns true for empty set as subset of any set', () => {
      const a = new CompactSet(63)
      const b = new CompactSet(63)
      b.addAll([1, 2, 3])
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('returns true for empty set as subset of empty set', () => {
      const a = new CompactSet(63)
      const b = new CompactSet(63)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('handles different maxValue', () => {
      const a = new CompactSet(63)
      a.addAll([1, 2])
      const b = new CompactSet(31)
      b.addAll([1, 2])
      expect(a.isSubsetOf(b)).toBe(true)
    })
  })

  // ─── clone ─────────────────────────────────────────────────────────────

  describe('clone', () => {
    it('creates an independent copy', () => {
      const set = new CompactSet(63)
      set.addAll([1, 2, 3])
      const cloned = set.clone()
      expect(cloned.toArray()).toEqual([1, 2, 3])
      expect(cloned.size).toBe(3)
    })

    it('modifications to clone do not affect original', () => {
      const set = new CompactSet(63)
      set.addAll([1, 2])
      const cloned = set.clone()
      cloned.add(3)
      expect(set.size).toBe(2)
      expect(cloned.size).toBe(3)
    })

    it('clones an empty set', () => {
      const set = new CompactSet(63)
      const cloned = set.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })
  })

  // ─── Edge Cases ────────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles values at word boundaries (31, 32)', () => {
      const set = new CompactSet(100)
      set.add(31)
      set.add(32)
      expect(set.has(31)).toBe(true)
      expect(set.has(32)).toBe(true)
      expect(set.size).toBe(2)
      expect(set.toArray()).toEqual([31, 32])
    })

    it('handles adding all values in range', () => {
      const set = new CompactSet(15)
      for (let i = 0; i <= 15; i++) {
        set.add(i)
      }
      expect(set.size).toBe(16)
      expect(set.isFull()).toBe(true)
      expect(set.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])
    })

    it('handles delete and re-add cycle', () => {
      const set = new CompactSet(63)
      set.add(5)
      set.delete(5)
      set.add(5)
      expect(set.size).toBe(1)
      expect(set.has(5)).toBe(true)
    })

    it('handles large dataset', () => {
      const set = new CompactSet(9999)
      for (let i = 0; i <= 9999; i += 2) {
        set.add(i)
      }
      expect(set.size).toBe(5000)
      expect(set.has(0)).toBe(true)
      expect(set.has(9998)).toBe(true)
      expect(set.has(9999)).toBe(false)
      expect(set.has(1)).toBe(false)
    })

    it('forEach visits all elements on large set', () => {
      const set = new CompactSet(255)
      for (let i = 0; i <= 255; i++) {
        set.add(i)
      }
      let count = 0
      set.forEach(() => { count++ })
      expect(count).toBe(256)
    })

    it('iterator works after partial delete', () => {
      const set = new CompactSet(63)
      set.addAll([1, 2, 3, 4, 5])
      set.delete(3)
      expect(set.toArray()).toEqual([1, 2, 4, 5])
    })

    it('complement size is correct for non-word-aligned maxValue', () => {
      const set = new CompactSet(5)
      set.addAll([1, 3])
      const comp = set.complement()
      expect(comp.size).toBe(4) // 6 total - 2 present
      expect(comp.toArray()).toEqual([0, 2, 4, 5])
    })

    it('next/previous at boundaries', () => {
      const set = new CompactSet(63)
      set.add(0)
      set.add(63)
      expect(set.next(0)).toBe(63)
      expect(set.previous(63)).toBe(0)
      expect(set.next(63)).toBeUndefined()
      expect(set.previous(0)).toBeUndefined()
    })

    it('set operations on sets with different sizes produce correct maxValue', () => {
      const a = new CompactSet(10)
      a.addAll([1, 5])
      const b = new CompactSet(100)
      b.addAll([1, 50])
      const u = a.union(b)
      expect(u.toArray()).toEqual([1, 5, 50])
      const d = a.difference(b)
      expect(d.toArray()).toEqual([5])
    })

    it('clear and refill works correctly', () => {
      const set = new CompactSet(63)
      set.addAll([1, 2, 3])
      set.clear()
      expect(set.isEmpty()).toBe(true)
      set.addAll([10, 20, 30])
      expect(set.size).toBe(3)
      expect(set.toArray()).toEqual([10, 20, 30])
    })

    it('first and last after single delete', () => {
      const set = new CompactSet(63)
      set.addAll([1, 5, 10])
      set.delete(1)
      expect(set.first()).toBe(5)
      set.delete(10)
      expect(set.last()).toBe(5)
    })

    it('clone preserves independence through delete', () => {
      const set = new CompactSet(63)
      set.addAll([1, 2, 3])
      const cloned = set.clone()
      cloned.delete(2)
      expect(set.has(2)).toBe(true)
      expect(cloned.has(2)).toBe(false)
    })
  })
})
