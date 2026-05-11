import { describe, it, expect } from 'vitest'
import { SigmaSet } from '../../src/core/sigma-set/index.js'
import type { SigmaSetOptions } from '../../src/core/sigma-set/types.js'

describe('SigmaSet', () => {
  describe('constructor', () => {
    it('creates empty set with universeSize 0', () => {
      const s = new SigmaSet({ universeSize: 0 })
      expect(s.size).toBe(0)
      expect(s.isEmpty).toBe(true)
    })

    it('creates empty set with universeSize 1', () => {
      const s = new SigmaSet({ universeSize: 1 })
      expect(s.size).toBe(0)
      expect(s.isEmpty).toBe(true)
      expect(s.universeSize).toBe(1)
    })

    it('creates empty set with universeSize 100', () => {
      const s = new SigmaSet({ universeSize: 100 })
      expect(s.size).toBe(0)
      expect(s.universeSize).toBe(100)
    })

    it('creates set with large universeSize', () => {
      const s = new SigmaSet({ universeSize: 10000 })
      expect(s.universeSize).toBe(10000)
      expect(s.size).toBe(0)
    })

    it('throws on negative universeSize', () => {
      expect(() => new SigmaSet({ universeSize: -1 })).toThrow(RangeError)
    })

    it('throws on non-integer universeSize', () => {
      expect(() => new SigmaSet({ universeSize: 1.5 })).toThrow(RangeError)
    })

    it('throws on NaN universeSize', () => {
      expect(() => new SigmaSet({ universeSize: NaN })).toThrow(RangeError)
    })

    it('creates set with universeSize exactly 32', () => {
      const s = new SigmaSet({ universeSize: 32 })
      expect(s.universeSize).toBe(32)
    })
  })

  describe('add', () => {
    it('adds a value and returns true', () => {
      const s = new SigmaSet({ universeSize: 10 })
      expect(s.add(0)).toBe(true)
      expect(s.size).toBe(1)
    })

    it('returns false when adding duplicate', () => {
      const s = new SigmaSet({ universeSize: 10 })
      s.add(5)
      expect(s.add(5)).toBe(false)
      expect(s.size).toBe(1)
    })

    it('adds value at upper boundary', () => {
      const s = new SigmaSet({ universeSize: 10 })
      expect(s.add(9)).toBe(true)
      expect(s.has(9)).toBe(true)
    })

    it('throws on value equal to universeSize', () => {
      const s = new SigmaSet({ universeSize: 10 })
      expect(() => s.add(10)).toThrow(RangeError)
    })

    it('throws on negative value', () => {
      const s = new SigmaSet({ universeSize: 10 })
      expect(() => s.add(-1)).toThrow(RangeError)
    })

    it('throws on non-integer value', () => {
      const s = new SigmaSet({ universeSize: 10 })
      expect(() => s.add(1.5)).toThrow(RangeError)
    })

    it('adds multiple values correctly', () => {
      const s = new SigmaSet({ universeSize: 10 })
      s.add(1)
      s.add(3)
      s.add(5)
      expect(s.size).toBe(3)
      expect(s.has(1)).toBe(true)
      expect(s.has(3)).toBe(true)
      expect(s.has(5)).toBe(true)
    })

    it('handles values across word boundaries', () => {
      const s = new SigmaSet({ universeSize: 100 })
      s.add(31)
      s.add(32)
      s.add(63)
      s.add(64)
      expect(s.size).toBe(4)
      expect(s.has(31)).toBe(true)
      expect(s.has(32)).toBe(true)
      expect(s.has(63)).toBe(true)
      expect(s.has(64)).toBe(true)
    })
  })

  describe('delete', () => {
    it('deletes a value and returns true', () => {
      const s = new SigmaSet({ universeSize: 10 })
      s.add(5)
      expect(s.delete(5)).toBe(true)
      expect(s.size).toBe(0)
    })

    it('returns false when deleting absent value', () => {
      const s = new SigmaSet({ universeSize: 10 })
      expect(s.delete(5)).toBe(false)
    })

    it('deletes and re-adds correctly', () => {
      const s = new SigmaSet({ universeSize: 10 })
      s.add(3)
      s.delete(3)
      s.add(3)
      expect(s.size).toBe(1)
      expect(s.has(3)).toBe(true)
    })

    it('throws on out-of-range value', () => {
      const s = new SigmaSet({ universeSize: 10 })
      expect(() => s.delete(10)).toThrow(RangeError)
    })

    it('throws on negative value', () => {
      const s = new SigmaSet({ universeSize: 10 })
      expect(() => s.delete(-1)).toThrow(RangeError)
    })
  })

  describe('has / contains', () => {
    it('returns false for absent value', () => {
      const s = new SigmaSet({ universeSize: 10 })
      expect(s.has(5)).toBe(false)
    })

    it('returns true for present value', () => {
      const s = new SigmaSet({ universeSize: 10 })
      s.add(5)
      expect(s.has(5)).toBe(true)
    })

    it('contains is alias for has', () => {
      const s = new SigmaSet({ universeSize: 10 })
      s.add(7)
      expect(s.contains(7)).toBe(true)
      expect(s.contains(3)).toBe(false)
    })

    it('returns false for out-of-range value without throwing', () => {
      const s = new SigmaSet({ universeSize: 10 })
      expect(s.has(10)).toBe(false)
      expect(s.has(-1)).toBe(false)
    })

    it('returns false for NaN', () => {
      const s = new SigmaSet({ universeSize: 10 })
      expect(s.has(NaN)).toBe(false)
    })
  })

  describe('size / isEmpty', () => {
    it('size tracks elements', () => {
      const s = new SigmaSet({ universeSize: 10 })
      expect(s.size).toBe(0)
      s.add(1)
      expect(s.size).toBe(1)
      s.add(2)
      expect(s.size).toBe(2)
      s.delete(1)
      expect(s.size).toBe(1)
    })

    it('isEmpty reflects state', () => {
      const s = new SigmaSet({ universeSize: 10 })
      expect(s.isEmpty).toBe(true)
      s.add(0)
      expect(s.isEmpty).toBe(false)
      s.delete(0)
      expect(s.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('removes all elements', () => {
      const s = new SigmaSet({ universeSize: 10 })
      s.add(1)
      s.add(2)
      s.add(3)
      s.clear()
      expect(s.size).toBe(0)
      expect(s.isEmpty).toBe(true)
      expect(s.has(1)).toBe(false)
      expect(s.has(2)).toBe(false)
      expect(s.has(3)).toBe(false)
    })

    it('clear on empty set is no-op', () => {
      const s = new SigmaSet({ universeSize: 10 })
      s.clear()
      expect(s.size).toBe(0)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty set', () => {
      const s = new SigmaSet({ universeSize: 10 })
      expect(s.toArray()).toEqual([])
    })

    it('returns sorted elements', () => {
      const s = new SigmaSet({ universeSize: 10 })
      s.add(5)
      s.add(2)
      s.add(8)
      expect(s.toArray()).toEqual([2, 5, 8])
    })

    it('returns all elements when full', () => {
      const s = new SigmaSet({ universeSize: 5 })
      s.fill()
      expect(s.toArray()).toEqual([0, 1, 2, 3, 4])
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const s = new SigmaSet({ universeSize: 10 })
      s.add(1)
      s.add(3)
      const c = s.clone()
      expect(c.toArray()).toEqual([1, 3])
      expect(c.universeSize).toBe(10)
      c.add(5)
      expect(s.has(5)).toBe(false)
      expect(c.has(5)).toBe(true)
    })

    it('clone of empty set', () => {
      const s = new SigmaSet({ universeSize: 10 })
      const c = s.clone()
      expect(c.size).toBe(0)
      expect(c.isEmpty).toBe(true)
    })
  })

  describe('fromArray', () => {
    it('creates set from array', () => {
      const s = SigmaSet.fromArray([1, 3, 5], { universeSize: 10 })
      expect(s.toArray()).toEqual([1, 3, 5])
    })

    it('handles empty array', () => {
      const s = SigmaSet.fromArray([], { universeSize: 10 })
      expect(s.size).toBe(0)
    })

    it('deduplicates', () => {
      const s = SigmaSet.fromArray([1, 1, 2, 2], { universeSize: 10 })
      expect(s.toArray()).toEqual([1, 2])
    })
  })

  describe('forEach', () => {
    it('iterates over all elements in order', () => {
      const s = new SigmaSet({ universeSize: 10 })
      s.add(5)
      s.add(2)
      s.add(8)
      const collected: number[] = []
      s.forEach((v) => collected.push(v))
      expect(collected).toEqual([2, 5, 8])
    })

    it('does not call callback on empty set', () => {
      const s = new SigmaSet({ universeSize: 10 })
      let called = false
      s.forEach(() => { called = true })
      expect(called).toBe(false)
    })
  })

  describe('Symbol.iterator', () => {
    it('is iterable', () => {
      const s = new SigmaSet({ universeSize: 10 })
      s.add(1)
      s.add(3)
      expect([...s]).toEqual([1, 3])
    })

    it('works with for-of', () => {
      const s = new SigmaSet({ universeSize: 10 })
      s.add(0)
      s.add(9)
      const result: number[] = []
      for (const v of s) {
        result.push(v)
      }
      expect(result).toEqual([0, 9])
    })
  })

  describe('min', () => {
    it('returns smallest element', () => {
      const s = new SigmaSet({ universeSize: 10 })
      s.add(5)
      s.add(2)
      s.add(8)
      expect(s.min()).toBe(2)
    })

    it('returns 0 when 0 is present', () => {
      const s = new SigmaSet({ universeSize: 10 })
      s.add(0)
      s.add(5)
      expect(s.min()).toBe(0)
    })

    it('throws on empty set', () => {
      const s = new SigmaSet({ universeSize: 10 })
      expect(() => s.min()).toThrow(RangeError)
    })
  })

  describe('max', () => {
    it('returns largest element', () => {
      const s = new SigmaSet({ universeSize: 10 })
      s.add(5)
      s.add(2)
      s.add(8)
      expect(s.max()).toBe(8)
    })

    it('throws on empty set', () => {
      const s = new SigmaSet({ universeSize: 10 })
      expect(() => s.max()).toThrow(RangeError)
    })
  })

  describe('next', () => {
    it('returns next element at or after value', () => {
      const s = new SigmaSet({ universeSize: 10 })
      s.add(3)
      s.add(7)
      expect(s.next(0)).toBe(3)
      expect(s.next(3)).toBe(3)
      expect(s.next(4)).toBe(7)
      expect(s.next(7)).toBe(7)
    })

    it('returns -1 when no element at or after value', () => {
      const s = new SigmaSet({ universeSize: 10 })
      s.add(3)
      expect(s.next(4)).toBe(-1)
      expect(s.next(10)).toBe(-1)
    })

    it('throws on negative value', () => {
      const s = new SigmaSet({ universeSize: 10 })
      expect(() => s.next(-1)).toThrow(RangeError)
    })

    it('throws on non-integer', () => {
      const s = new SigmaSet({ universeSize: 10 })
      expect(() => s.next(1.5)).toThrow(RangeError)
    })
  })

  describe('prev', () => {
    it('returns previous element at or before value', () => {
      const s = new SigmaSet({ universeSize: 10 })
      s.add(3)
      s.add(7)
      expect(s.prev(9)).toBe(7)
      expect(s.prev(7)).toBe(7)
      expect(s.prev(5)).toBe(3)
      expect(s.prev(3)).toBe(3)
    })

    it('returns -1 when no element at or before value', () => {
      const s = new SigmaSet({ universeSize: 10 })
      s.add(7)
      expect(s.prev(6)).toBe(-1)
    })

    it('handles value above universe', () => {
      const s = new SigmaSet({ universeSize: 10 })
      s.add(5)
      expect(s.prev(100)).toBe(5)
    })

    it('throws on negative value', () => {
      const s = new SigmaSet({ universeSize: 10 })
      expect(() => s.prev(-1)).toThrow(RangeError)
    })

    it('returns -1 for empty set', () => {
      const s = new SigmaSet({ universeSize: 10 })
      expect(s.prev(5)).toBe(-1)
    })
  })

  describe('countRange', () => {
    it('counts elements in range', () => {
      const s = new SigmaSet({ universeSize: 20 })
      s.add(2)
      s.add(5)
      s.add(7)
      s.add(10)
      expect(s.countRange(0, 5)).toBe(2)
      expect(s.countRange(5, 10)).toBe(3)
      expect(s.countRange(0, 19)).toBe(4)
    })

    it('returns 0 for range with no elements', () => {
      const s = new SigmaSet({ universeSize: 10 })
      s.add(5)
      expect(s.countRange(0, 4)).toBe(0)
    })

    it('throws on invalid range', () => {
      const s = new SigmaSet({ universeSize: 10 })
      expect(() => s.countRange(5, 3)).toThrow(RangeError)
      expect(() => s.countRange(-1, 5)).toThrow(RangeError)
    })

    it('counts single element', () => {
      const s = new SigmaSet({ universeSize: 10 })
      s.add(5)
      expect(s.countRange(5, 5)).toBe(1)
    })

    it('clamps hi to universeSize-1', () => {
      const s = new SigmaSet({ universeSize: 10 })
      s.add(5)
      expect(s.countRange(0, 100)).toBe(1)
    })
  })

  describe('range', () => {
    it('returns elements in range', () => {
      const s = new SigmaSet({ universeSize: 20 })
      s.add(2)
      s.add(5)
      s.add(7)
      s.add(10)
      expect(s.range(3, 10)).toEqual([5, 7, 10])
    })

    it('returns empty array for no match', () => {
      const s = new SigmaSet({ universeSize: 10 })
      s.add(5)
      expect(s.range(0, 4)).toEqual([])
    })

    it('throws on invalid range', () => {
      const s = new SigmaSet({ universeSize: 10 })
      expect(() => s.range(5, 3)).toThrow(RangeError)
    })

    it('clamps to universe boundary', () => {
      const s = new SigmaSet({ universeSize: 10 })
      s.add(5)
      s.add(9)
      expect(s.range(0, 100)).toEqual([5, 9])
    })
  })

  describe('union', () => {
    it('unions two sets', () => {
      const a = SigmaSet.fromArray([1, 2, 3], { universeSize: 10 })
      const b = SigmaSet.fromArray([3, 4, 5], { universeSize: 10 })
      const u = a.union(b)
      expect(u.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('does not modify originals', () => {
      const a = SigmaSet.fromArray([1], { universeSize: 10 })
      const b = SigmaSet.fromArray([2], { universeSize: 10 })
      a.union(b)
      expect(a.toArray()).toEqual([1])
      expect(b.toArray()).toEqual([2])
    })

    it('throws on mismatched universe sizes', () => {
      const a = new SigmaSet({ universeSize: 10 })
      const b = new SigmaSet({ universeSize: 20 })
      expect(() => a.union(b)).toThrow(RangeError)
    })

    it('union with empty set', () => {
      const a = SigmaSet.fromArray([1, 2], { universeSize: 10 })
      const b = new SigmaSet({ universeSize: 10 })
      expect(a.union(b).toArray()).toEqual([1, 2])
    })

    it('union of two empty sets', () => {
      const a = new SigmaSet({ universeSize: 10 })
      const b = new SigmaSet({ universeSize: 10 })
      expect(a.union(b).toArray()).toEqual([])
    })
  })

  describe('intersection', () => {
    it('intersects two sets', () => {
      const a = SigmaSet.fromArray([1, 2, 3], { universeSize: 10 })
      const b = SigmaSet.fromArray([2, 3, 4], { universeSize: 10 })
      expect(a.intersection(b).toArray()).toEqual([2, 3])
    })

    it('returns empty for disjoint sets', () => {
      const a = SigmaSet.fromArray([1, 2], { universeSize: 10 })
      const b = SigmaSet.fromArray([3, 4], { universeSize: 10 })
      expect(a.intersection(b).toArray()).toEqual([])
    })

    it('throws on mismatched universe sizes', () => {
      const a = new SigmaSet({ universeSize: 10 })
      const b = new SigmaSet({ universeSize: 20 })
      expect(() => a.intersection(b)).toThrow(RangeError)
    })
  })

  describe('difference', () => {
    it('computes difference', () => {
      const a = SigmaSet.fromArray([1, 2, 3], { universeSize: 10 })
      const b = SigmaSet.fromArray([2, 3, 4], { universeSize: 10 })
      expect(a.difference(b).toArray()).toEqual([1])
    })

    it('returns copy when no overlap', () => {
      const a = SigmaSet.fromArray([1, 2], { universeSize: 10 })
      const b = SigmaSet.fromArray([3, 4], { universeSize: 10 })
      expect(a.difference(b).toArray()).toEqual([1, 2])
    })

    it('throws on mismatched universe sizes', () => {
      const a = new SigmaSet({ universeSize: 10 })
      const b = new SigmaSet({ universeSize: 20 })
      expect(() => a.difference(b)).toThrow(RangeError)
    })
  })

  describe('complement', () => {
    it('computes complement', () => {
      const s = SigmaSet.fromArray([1, 3], { universeSize: 5 })
      const c = s.complement()
      expect(c.toArray()).toEqual([0, 2, 4])
    })

    it('complement of full set is empty', () => {
      const s = new SigmaSet({ universeSize: 5 })
      s.fill()
      expect(s.complement().toArray()).toEqual([])
    })

    it('complement of empty set is full', () => {
      const s = new SigmaSet({ universeSize: 5 })
      expect(s.complement().toArray()).toEqual([0, 1, 2, 3, 4])
    })

    it('complement of complement is original', () => {
      const s = SigmaSet.fromArray([1, 3], { universeSize: 5 })
      expect(s.complement().complement().toArray()).toEqual([1, 3])
    })

    it('handles universeSize not multiple of 32', () => {
      const s = SigmaSet.fromArray([0, 2], { universeSize: 5 })
      const c = s.complement()
      expect(c.toArray()).toEqual([1, 3, 4])
      expect(c.size).toBe(3)
    })
  })

  describe('isSubsetOf', () => {
    it('returns true for subset', () => {
      const a = SigmaSet.fromArray([1, 2], { universeSize: 10 })
      const b = SigmaSet.fromArray([1, 2, 3], { universeSize: 10 })
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('returns false for non-subset', () => {
      const a = SigmaSet.fromArray([1, 2, 5], { universeSize: 10 })
      const b = SigmaSet.fromArray([1, 2, 3], { universeSize: 10 })
      expect(a.isSubsetOf(b)).toBe(false)
    })

    it('empty set is subset of any', () => {
      const a = new SigmaSet({ universeSize: 10 })
      const b = SigmaSet.fromArray([1, 2], { universeSize: 10 })
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('set is subset of itself', () => {
      const a = SigmaSet.fromArray([1, 2], { universeSize: 10 })
      expect(a.isSubsetOf(a)).toBe(true)
    })

    it('throws on mismatched universe sizes', () => {
      const a = new SigmaSet({ universeSize: 10 })
      const b = new SigmaSet({ universeSize: 20 })
      expect(() => a.isSubsetOf(b)).toThrow(RangeError)
    })
  })

  describe('isSupersetOf', () => {
    it('returns true for superset', () => {
      const a = SigmaSet.fromArray([1, 2, 3], { universeSize: 10 })
      const b = SigmaSet.fromArray([1, 2], { universeSize: 10 })
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('returns false for non-superset', () => {
      const a = SigmaSet.fromArray([1, 2], { universeSize: 10 })
      const b = SigmaSet.fromArray([1, 2, 5], { universeSize: 10 })
      expect(a.isSupersetOf(b)).toBe(false)
    })
  })

  describe('equals', () => {
    it('returns true for equal sets', () => {
      const a = SigmaSet.fromArray([1, 2, 3], { universeSize: 10 })
      const b = SigmaSet.fromArray([3, 2, 1], { universeSize: 10 })
      expect(a.equals(b)).toBe(true)
    })

    it('returns false for different sets', () => {
      const a = SigmaSet.fromArray([1, 2], { universeSize: 10 })
      const b = SigmaSet.fromArray([1, 3], { universeSize: 10 })
      expect(a.equals(b)).toBe(false)
    })

    it('returns false for different sizes', () => {
      const a = SigmaSet.fromArray([1, 2], { universeSize: 10 })
      const b = SigmaSet.fromArray([1], { universeSize: 10 })
      expect(a.equals(b)).toBe(false)
    })

    it('returns false for different universe sizes', () => {
      const a = new SigmaSet({ universeSize: 10 })
      const b = new SigmaSet({ universeSize: 20 })
      expect(a.equals(b)).toBe(false)
    })

    it('empty sets with same universe are equal', () => {
      const a = new SigmaSet({ universeSize: 10 })
      const b = new SigmaSet({ universeSize: 10 })
      expect(a.equals(b)).toBe(true)
    })
  })

  describe('intersects', () => {
    it('returns true when sets overlap', () => {
      const a = SigmaSet.fromArray([1, 2, 3], { universeSize: 10 })
      const b = SigmaSet.fromArray([3, 4, 5], { universeSize: 10 })
      expect(a.intersects(b)).toBe(true)
    })

    it('returns false for disjoint sets', () => {
      const a = SigmaSet.fromArray([1, 2], { universeSize: 10 })
      const b = SigmaSet.fromArray([3, 4], { universeSize: 10 })
      expect(a.intersects(b)).toBe(false)
    })

    it('returns false for two empty sets', () => {
      const a = new SigmaSet({ universeSize: 10 })
      const b = new SigmaSet({ universeSize: 10 })
      expect(a.intersects(b)).toBe(false)
    })

    it('throws on mismatched universe sizes', () => {
      const a = new SigmaSet({ universeSize: 10 })
      const b = new SigmaSet({ universeSize: 20 })
      expect(() => a.intersects(b)).toThrow(RangeError)
    })
  })

  describe('fill', () => {
    it('adds all elements', () => {
      const s = new SigmaSet({ universeSize: 5 })
      s.fill()
      expect(s.size).toBe(5)
      expect(s.toArray()).toEqual([0, 1, 2, 3, 4])
    })

    it('fill replaces existing elements', () => {
      const s = SigmaSet.fromArray([1, 3], { universeSize: 5 })
      s.fill()
      expect(s.size).toBe(5)
    })

    it('fill on universe size not multiple of 32', () => {
      const s = new SigmaSet({ universeSize: 50 })
      s.fill()
      expect(s.size).toBe(50)
      for (let i = 0; i < 50; i++) {
        expect(s.has(i)).toBe(true)
      }
    })

    it('fill on empty universe', () => {
      const s = new SigmaSet({ universeSize: 0 })
      s.fill()
      expect(s.size).toBe(0)
    })
  })

  describe('universeSize', () => {
    it('returns the universe size', () => {
      const s = new SigmaSet({ universeSize: 42 })
      expect(s.universeSize).toBe(42)
    })
  })

  describe('density', () => {
    it('returns 0 for empty set', () => {
      const s = new SigmaSet({ universeSize: 10 })
      expect(s.density()).toBe(0)
    })

    it('returns 1 for full set', () => {
      const s = new SigmaSet({ universeSize: 10 })
      s.fill()
      expect(s.density()).toBe(1)
    })

    it('returns fraction for partial set', () => {
      const s = SigmaSet.fromArray([0, 5], { universeSize: 10 })
      expect(s.density()).toBe(0.2)
    })

    it('returns 0 for zero universe', () => {
      const s = new SigmaSet({ universeSize: 0 })
      expect(s.density()).toBe(0)
    })
  })

  describe('toString', () => {
    it('returns bit string for empty set', () => {
      const s = new SigmaSet({ universeSize: 5 })
      expect(s.toString()).toBe('00000')
    })

    it('returns bit string with set bits', () => {
      const s = new SigmaSet({ universeSize: 8 })
      s.add(1)
      s.add(3)
      s.add(7)
      expect(s.toString()).toBe('01010001')
    })

    it('returns all 1s for full set', () => {
      const s = new SigmaSet({ universeSize: 4 })
      s.fill()
      expect(s.toString()).toBe('1111')
    })

    it('returns empty string for universeSize 0', () => {
      const s = new SigmaSet({ universeSize: 0 })
      expect(s.toString()).toBe('')
    })
  })

  describe('edge cases', () => {
    it('handles universeSize of 1', () => {
      const s = new SigmaSet({ universeSize: 1 })
      expect(s.add(0)).toBe(true)
      expect(s.has(0)).toBe(true)
      expect(s.size).toBe(1)
      expect(s.min()).toBe(0)
      expect(s.max()).toBe(0)
      expect(s.complement().toArray()).toEqual([])
    })

    it('handles add and delete at boundary 31/32', () => {
      const s = new SigmaSet({ universeSize: 64 })
      s.add(31)
      s.add(32)
      expect(s.has(31)).toBe(true)
      expect(s.has(32)).toBe(true)
      s.delete(31)
      expect(s.has(31)).toBe(false)
      expect(s.has(32)).toBe(true)
    })

    it('handles large universe', () => {
      const s = new SigmaSet({ universeSize: 1000 })
      s.add(0)
      s.add(500)
      s.add(999)
      expect(s.size).toBe(3)
      expect(s.min()).toBe(0)
      expect(s.max()).toBe(999)
    })

    it('chained operations', () => {
      const s = new SigmaSet({ universeSize: 10 })
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(2)
      s.add(4)
      s.clear()
      s.add(0)
      s.add(9)
      expect(s.toArray()).toEqual([0, 9])
    })

    it('set operations with word-boundary values', () => {
      const a = SigmaSet.fromArray([31, 32, 63], { universeSize: 100 })
      const b = SigmaSet.fromArray([32, 63, 64], { universeSize: 100 })
      expect(a.union(b).toArray()).toEqual([31, 32, 63, 64])
      expect(a.intersection(b).toArray()).toEqual([32, 63])
      expect(a.difference(b).toArray()).toEqual([31])
    })

    it('fill and complement', () => {
      const s = new SigmaSet({ universeSize: 33 })
      s.fill()
      expect(s.size).toBe(33)
      const c = s.complement()
      expect(c.size).toBe(0)
      expect(c.toArray()).toEqual([])
    })

    it('next/prev across word boundaries', () => {
      const s = new SigmaSet({ universeSize: 100 })
      s.add(30)
      s.add(33)
      expect(s.next(31)).toBe(33)
      expect(s.prev(32)).toBe(30)
    })

    it('universeSize 0 operations', () => {
      const s = new SigmaSet({ universeSize: 0 })
      expect(s.toArray()).toEqual([])
      expect(s.toString()).toBe('')
      expect(s.clone().size).toBe(0)
      expect(s.density()).toBe(0)
      expect([...s]).toEqual([])
    })

    it('fromArray ignores duplicates gracefully', () => {
      const s = SigmaSet.fromArray([1, 1, 1, 2, 2], { universeSize: 10 })
      expect(s.size).toBe(2)
      expect(s.toArray()).toEqual([1, 2])
    })

    it('isSupersetOf with empty set', () => {
      const a = SigmaSet.fromArray([1, 2], { universeSize: 10 })
      const b = new SigmaSet({ universeSize: 10 })
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('countRange on full set', () => {
      const s = new SigmaSet({ universeSize: 10 })
      s.fill()
      expect(s.countRange(0, 9)).toBe(10)
      expect(s.countRange(3, 7)).toBe(5)
    })

    it('range on full set', () => {
      const s = new SigmaSet({ universeSize: 10 })
      s.fill()
      expect(s.range(2, 5)).toEqual([2, 3, 4, 5])
    })

    it('clone preserves universeSize', () => {
      const s = new SigmaSet({ universeSize: 42 })
      s.add(10)
      const c = s.clone()
      expect(c.universeSize).toBe(42)
      expect(() => c.add(42)).toThrow(RangeError)
    })

    it('union with self returns self', () => {
      const s = SigmaSet.fromArray([1, 3, 5], { universeSize: 10 })
      const u = s.union(s)
      expect(u.toArray()).toEqual([1, 3, 5])
    })

    it('complement density', () => {
      const s = SigmaSet.fromArray([0], { universeSize: 4 })
      const c = s.complement()
      expect(c.size).toBe(3)
      expect(c.density()).toBe(0.75)
    })

    it('min/max after delete', () => {
      const s = new SigmaSet({ universeSize: 10 })
      s.add(1)
      s.add(5)
      s.add(9)
      s.delete(1)
      expect(s.min()).toBe(5)
      s.delete(9)
      expect(s.max()).toBe(5)
    })
  })
})
