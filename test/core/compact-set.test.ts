import { describe, it, expect } from 'vitest'
import { CompactSet } from '../../src/core/compact-set/compact-set.js'

describe('CompactSet', () => {
  describe('constructor', () => {
    it('should create a set with maxValue 0', () => {
      const s = new CompactSet(0)
      expect(s.size).toBe(0)
    })

    it('should create a set with maxValue 31 (one word)', () => {
      const s = new CompactSet(31)
      expect(s.size).toBe(0)
    })

    it('should create a set with maxValue 32 (two words)', () => {
      const s = new CompactSet(32)
      expect(s.size).toBe(0)
    })

    it('should create a set with maxValue 1000', () => {
      const s = new CompactSet(1000)
      expect(s.size).toBe(0)
    })

    it('should accept CompactSetOptions object', () => {
      const s = new CompactSet({ maxValue: 63 })
      expect(s.size).toBe(0)
    })

    it('should throw on negative maxValue', () => {
      expect(() => new CompactSet(-1)).toThrow(RangeError)
    })

    it('should throw on non-integer maxValue', () => {
      expect(() => new CompactSet(1.5)).toThrow(RangeError)
    })

    it('should throw on NaN maxValue', () => {
      expect(() => new CompactSet(NaN)).toThrow(RangeError)
    })
  })

  describe('add', () => {
    it('should add value 0', () => {
      const s = new CompactSet(10)
      expect(s.add(0)).toBe(true)
      expect(s.has(0)).toBe(true)
    })

    it('should add value at maxValue', () => {
      const s = new CompactSet(10)
      expect(s.add(10)).toBe(true)
      expect(s.has(10)).toBe(true)
    })

    it('should add multiple values', () => {
      const s = new CompactSet(100)
      expect(s.add(5)).toBe(true)
      expect(s.add(50)).toBe(true)
      expect(s.add(100)).toBe(true)
      expect(s.size).toBe(3)
    })

    it('should return false on duplicate add', () => {
      const s = new CompactSet(10)
      expect(s.add(5)).toBe(true)
      expect(s.add(5)).toBe(false)
      expect(s.size).toBe(1)
    })

    it('should throw on value out of range (negative)', () => {
      const s = new CompactSet(10)
      expect(() => s.add(-1)).toThrow(RangeError)
    })

    it('should throw on value out of range (too large)', () => {
      const s = new CompactSet(10)
      expect(() => s.add(11)).toThrow(RangeError)
    })

    it('should throw on non-integer value', () => {
      const s = new CompactSet(10)
      expect(() => s.add(1.5)).toThrow(RangeError)
    })

    it('should handle boundary between words', () => {
      const s = new CompactSet(100)
      expect(s.add(31)).toBe(true)
      expect(s.add(32)).toBe(true)
      expect(s.has(31)).toBe(true)
      expect(s.has(32)).toBe(true)
    })
  })

  describe('delete', () => {
    it('should delete an existing value', () => {
      const s = new CompactSet(10)
      s.add(5)
      expect(s.delete(5)).toBe(true)
      expect(s.has(5)).toBe(false)
    })

    it('should return false for non-existent value', () => {
      const s = new CompactSet(10)
      expect(s.delete(5)).toBe(false)
    })

    it('should track size correctly after delete', () => {
      const s = new CompactSet(10)
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.size).toBe(3)
      s.delete(2)
      expect(s.size).toBe(2)
    })

    it('should throw on value out of range', () => {
      const s = new CompactSet(10)
      expect(() => s.delete(-1)).toThrow(RangeError)
      expect(() => s.delete(11)).toThrow(RangeError)
    })

    it('should allow re-adding after delete', () => {
      const s = new CompactSet(10)
      s.add(5)
      s.delete(5)
      expect(s.add(5)).toBe(true)
      expect(s.size).toBe(1)
    })
  })

  describe('has', () => {
    it('should return false for non-present value', () => {
      const s = new CompactSet(10)
      expect(s.has(5)).toBe(false)
    })

    it('should return true for present value', () => {
      const s = new CompactSet(10)
      s.add(5)
      expect(s.has(5)).toBe(true)
    })

    it('should return false for negative value without throwing', () => {
      const s = new CompactSet(10)
      expect(s.has(-1)).toBe(false)
    })

    it('should return false for value above maxValue without throwing', () => {
      const s = new CompactSet(10)
      expect(s.has(11)).toBe(false)
    })

    it('should return false for non-integer without throwing', () => {
      const s = new CompactSet(10)
      expect(s.has(1.5)).toBe(false)
    })

    it('should check boundary value 0', () => {
      const s = new CompactSet(10)
      s.add(0)
      expect(s.has(0)).toBe(true)
    })

    it('should check boundary maxValue', () => {
      const s = new CompactSet(10)
      s.add(10)
      expect(s.has(10)).toBe(true)
    })
  })

  describe('size', () => {
    it('should be 0 for empty set', () => {
      const s = new CompactSet(10)
      expect(s.size).toBe(0)
    })

    it('should track additions', () => {
      const s = new CompactSet(10)
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.size).toBe(3)
    })

    it('should not change on duplicate add', () => {
      const s = new CompactSet(10)
      s.add(1)
      s.add(1)
      expect(s.size).toBe(1)
    })

    it('should decrease on delete', () => {
      const s = new CompactSet(10)
      s.add(1)
      s.add(2)
      s.delete(1)
      expect(s.size).toBe(1)
    })

    it('should reset to 0 on clear', () => {
      const s = new CompactSet(10)
      s.add(1)
      s.add(2)
      s.clear()
      expect(s.size).toBe(0)
    })
  })

  describe('clear', () => {
    it('should remove all elements', () => {
      const s = new CompactSet(10)
      s.add(1)
      s.add(2)
      s.add(3)
      s.clear()
      expect(s.size).toBe(0)
      expect(s.has(1)).toBe(false)
      expect(s.has(2)).toBe(false)
      expect(s.has(3)).toBe(false)
    })

    it('should be safe to call on empty set', () => {
      const s = new CompactSet(10)
      s.clear()
      expect(s.size).toBe(0)
    })

    it('should allow adding after clear', () => {
      const s = new CompactSet(10)
      s.add(5)
      s.clear()
      expect(s.add(5)).toBe(true)
      expect(s.size).toBe(1)
    })
  })

  describe('addAll', () => {
    it('should add multiple values from array', () => {
      const s = new CompactSet(10)
      s.addAll([1, 3, 5, 7])
      expect(s.size).toBe(4)
      expect(s.has(1)).toBe(true)
      expect(s.has(3)).toBe(true)
      expect(s.has(5)).toBe(true)
      expect(s.has(7)).toBe(true)
    })

    it('should add values from generator', () => {
      const s = new CompactSet(10)
      function* gen() {
        yield 1
        yield 2
        yield 3
      }
      s.addAll(gen())
      expect(s.size).toBe(3)
    })

    it('should handle empty iterable', () => {
      const s = new CompactSet(10)
      s.addAll([])
      expect(s.size).toBe(0)
    })

    it('should skip duplicates in iterable', () => {
      const s = new CompactSet(10)
      s.addAll([1, 1, 2, 2, 3])
      expect(s.size).toBe(3)
    })
  })

  describe('deleteAll', () => {
    it('should delete multiple values', () => {
      const s = new CompactSet(10)
      s.addAll([1, 2, 3, 4, 5])
      s.deleteAll([2, 4])
      expect(s.size).toBe(3)
      expect(s.has(1)).toBe(true)
      expect(s.has(2)).toBe(false)
      expect(s.has(3)).toBe(true)
      expect(s.has(4)).toBe(false)
      expect(s.has(5)).toBe(true)
    })

    it('should handle non-existent values gracefully', () => {
      const s = new CompactSet(10)
      s.addAll([1, 2])
      s.deleteAll([3, 4])
      expect(s.size).toBe(2)
    })

    it('should handle empty iterable', () => {
      const s = new CompactSet(10)
      s.addAll([1, 2])
      s.deleteAll([])
      expect(s.size).toBe(2)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty set', () => {
      const s = new CompactSet(10)
      expect(s.toArray()).toEqual([])
    })

    it('should return sorted array', () => {
      const s = new CompactSet(10)
      s.add(5)
      s.add(1)
      s.add(3)
      expect(s.toArray()).toEqual([1, 3, 5])
    })

    it('should return all values including 0 and maxValue', () => {
      const s = new CompactSet(10)
      s.add(0)
      s.add(10)
      expect(s.toArray()).toEqual([0, 10])
    })

    it('should return values across word boundaries', () => {
      const s = new CompactSet(100)
      s.add(31)
      s.add(32)
      s.add(63)
      s.add(64)
      expect(s.toArray()).toEqual([31, 32, 63, 64])
    })
  })

  describe('forEach', () => {
    it('should call callback for each element', () => {
      const s = new CompactSet(10)
      s.addAll([1, 3, 5])
      const collected: number[] = []
      s.forEach((v) => collected.push(v))
      expect(collected).toEqual([1, 3, 5])
    })

    it('should not call callback for empty set', () => {
      const s = new CompactSet(10)
      let called = false
      s.forEach(() => { called = true })
      expect(called).toBe(false)
    })
  })

  describe('Symbol.iterator', () => {
    it('should be iterable', () => {
      const s = new CompactSet(10)
      s.addAll([1, 2, 3])
      const arr = [...s]
      expect(arr).toEqual([1, 2, 3])
    })

    it('should work with for-of loop', () => {
      const s = new CompactSet(10)
      s.addAll([2, 4, 6])
      const collected: number[] = []
      for (const v of s) {
        collected.push(v)
      }
      expect(collected).toEqual([2, 4, 6])
    })

    it('should produce empty iterator for empty set', () => {
      const s = new CompactSet(10)
      expect([...s]).toEqual([])
    })
  })

  describe('first', () => {
    it('should return undefined for empty set', () => {
      const s = new CompactSet(10)
      expect(s.first()).toBeUndefined()
    })

    it('should return the smallest value', () => {
      const s = new CompactSet(10)
      s.addAll([5, 3, 8])
      expect(s.first()).toBe(3)
    })

    it('should return 0 when present', () => {
      const s = new CompactSet(10)
      s.add(0)
      s.add(5)
      expect(s.first()).toBe(0)
    })
  })

  describe('last', () => {
    it('should return undefined for empty set', () => {
      const s = new CompactSet(10)
      expect(s.last()).toBeUndefined()
    })

    it('should return the largest value', () => {
      const s = new CompactSet(10)
      s.addAll([5, 3, 8])
      expect(s.last()).toBe(8)
    })

    it('should return maxValue when present', () => {
      const s = new CompactSet(10)
      s.add(10)
      s.add(5)
      expect(s.last()).toBe(10)
    })
  })

  describe('next', () => {
    it('should return the next higher value', () => {
      const s = new CompactSet(10)
      s.addAll([1, 3, 5])
      expect(s.next(1)).toBe(3)
      expect(s.next(3)).toBe(5)
    })

    it('should return undefined when no higher value', () => {
      const s = new CompactSet(10)
      s.addAll([1, 3, 5])
      expect(s.next(5)).toBeUndefined()
    })

    it('should return first() for negative input', () => {
      const s = new CompactSet(10)
      s.addAll([3, 7])
      expect(s.next(-1)).toBe(3)
    })

    it('should skip non-present values', () => {
      const s = new CompactSet(10)
      s.addAll([1, 5])
      expect(s.next(2)).toBe(5)
    })

    it('should return undefined when value >= maxValue', () => {
      const s = new CompactSet(10)
      s.addAll([5, 10])
      expect(s.next(10)).toBeUndefined()
    })

    it('should work across word boundaries', () => {
      const s = new CompactSet(100)
      s.addAll([30, 35])
      expect(s.next(30)).toBe(35)
    })
  })

  describe('previous', () => {
    it('should return the next lower value', () => {
      const s = new CompactSet(10)
      s.addAll([1, 3, 5])
      expect(s.previous(5)).toBe(3)
      expect(s.previous(3)).toBe(1)
    })

    it('should return undefined when no lower value', () => {
      const s = new CompactSet(10)
      s.addAll([1, 3, 5])
      expect(s.previous(1)).toBeUndefined()
    })

    it('should return last() for value above maxValue', () => {
      const s = new CompactSet(10)
      s.addAll([3, 7])
      expect(s.previous(20)).toBe(7)
    })

    it('should skip non-present values', () => {
      const s = new CompactSet(10)
      s.addAll([1, 5])
      expect(s.previous(4)).toBe(1)
    })

    it('should return undefined for value 0', () => {
      const s = new CompactSet(10)
      s.addAll([0, 5])
      expect(s.previous(0)).toBeUndefined()
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty set', () => {
      const s = new CompactSet(10)
      expect(s.isEmpty()).toBe(true)
    })

    it('should return false after add', () => {
      const s = new CompactSet(10)
      s.add(1)
      expect(s.isEmpty()).toBe(false)
    })

    it('should return true after clearing all', () => {
      const s = new CompactSet(10)
      s.add(1)
      s.delete(1)
      expect(s.isEmpty()).toBe(true)
    })
  })

  describe('isFull', () => {
    it('should return false for empty set', () => {
      const s = new CompactSet(10)
      expect(s.isFull()).toBe(false)
    })

    it('should return true when all values present', () => {
      const s = new CompactSet(3)
      s.addAll([0, 1, 2, 3])
      expect(s.isFull()).toBe(true)
    })

    it('should return false when not all values present', () => {
      const s = new CompactSet(10)
      s.addAll([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
      expect(s.isFull()).toBe(false)
    })

    it('should work for maxValue 0', () => {
      const s = new CompactSet(0)
      expect(s.isFull()).toBe(false)
      s.add(0)
      expect(s.isFull()).toBe(true)
    })
  })

  describe('complement', () => {
    it('should return full set for empty set', () => {
      const s = new CompactSet(5)
      const c = s.complement()
      expect(c.size).toBe(6)
      expect(c.toArray()).toEqual([0, 1, 2, 3, 4, 5])
    })

    it('should return empty set for full set', () => {
      const s = new CompactSet(5)
      s.addAll([0, 1, 2, 3, 4, 5])
      const c = s.complement()
      expect(c.size).toBe(0)
    })

    it('should return correct complement for partial set', () => {
      const s = new CompactSet(5)
      s.addAll([1, 3, 5])
      const c = s.complement()
      expect(c.toArray()).toEqual([0, 2, 4])
    })

    it('should not modify original set', () => {
      const s = new CompactSet(5)
      s.addAll([1, 3])
      s.complement()
      expect(s.toArray()).toEqual([1, 3])
    })

    it('should handle maxValue at word boundary', () => {
      const s = new CompactSet(31)
      s.add(0)
      const c = s.complement()
      expect(c.size).toBe(31)
      expect(c.has(0)).toBe(false)
      expect(c.has(1)).toBe(true)
      expect(c.has(31)).toBe(true)
    })

    it('should handle maxValue not at word boundary', () => {
      const s = new CompactSet(47)
      s.add(47)
      const c = s.complement()
      expect(c.has(47)).toBe(false)
      expect(c.has(0)).toBe(true)
    })
  })

  describe('union', () => {
    it('should combine two non-overlapping sets', () => {
      const a = new CompactSet(10)
      a.addAll([1, 3])
      const b = new CompactSet(10)
      b.addAll([5, 7])
      const u = a.union(b)
      expect(u.toArray()).toEqual([1, 3, 5, 7])
    })

    it('should handle overlapping sets', () => {
      const a = new CompactSet(10)
      a.addAll([1, 2, 3])
      const b = new CompactSet(10)
      b.addAll([2, 3, 4])
      const u = a.union(b)
      expect(u.toArray()).toEqual([1, 2, 3, 4])
    })

    it('should handle different maxValues', () => {
      const a = new CompactSet(5)
      a.addAll([1, 3])
      const b = new CompactSet(15)
      b.addAll([10, 15])
      const u = a.union(b)
      expect(u.toArray()).toEqual([1, 3, 10, 15])
    })

    it('should handle empty sets', () => {
      const a = new CompactSet(10)
      const b = new CompactSet(10)
      expect(a.union(b).toArray()).toEqual([])
    })

    it('should not modify original sets', () => {
      const a = new CompactSet(10)
      a.addAll([1])
      const b = new CompactSet(10)
      b.addAll([2])
      a.union(b)
      expect(a.toArray()).toEqual([1])
      expect(b.toArray()).toEqual([2])
    })
  })

  describe('intersect', () => {
    it('should return common elements', () => {
      const a = new CompactSet(10)
      a.addAll([1, 2, 3])
      const b = new CompactSet(10)
      b.addAll([2, 3, 4])
      const i = a.intersect(b)
      expect(i.toArray()).toEqual([2, 3])
    })

    it('should return empty for non-overlapping', () => {
      const a = new CompactSet(10)
      a.addAll([1, 2])
      const b = new CompactSet(10)
      b.addAll([5, 6])
      expect(a.intersect(b).toArray()).toEqual([])
    })

    it('should handle different maxValues', () => {
      const a = new CompactSet(5)
      a.addAll([1, 3])
      const b = new CompactSet(15)
      b.addAll([1, 3, 10])
      const i = a.intersect(b)
      expect(i.toArray()).toEqual([1, 3])
    })

    it('should return empty for empty set intersection', () => {
      const a = new CompactSet(10)
      const b = new CompactSet(10)
      b.addAll([1, 2])
      expect(a.intersect(b).toArray()).toEqual([])
    })
  })

  describe('difference', () => {
    it('should return elements in a but not in b', () => {
      const a = new CompactSet(10)
      a.addAll([1, 2, 3, 4])
      const b = new CompactSet(10)
      b.addAll([2, 4])
      const d = a.difference(b)
      expect(d.toArray()).toEqual([1, 3])
    })

    it('should return all elements when b is empty', () => {
      const a = new CompactSet(10)
      a.addAll([1, 2, 3])
      const b = new CompactSet(10)
      expect(a.difference(b).toArray()).toEqual([1, 2, 3])
    })

    it('should return empty when a is subset of b', () => {
      const a = new CompactSet(10)
      a.addAll([1, 2])
      const b = new CompactSet(10)
      b.addAll([1, 2, 3, 4])
      expect(a.difference(b).toArray()).toEqual([])
    })

    it('should handle different maxValues', () => {
      const a = new CompactSet(5)
      a.addAll([1, 3])
      const b = new CompactSet(15)
      b.addAll([1, 10])
      const d = a.difference(b)
      expect(d.toArray()).toEqual([3])
    })
  })

  describe('equals', () => {
    it('should return true for identical sets', () => {
      const a = new CompactSet(10)
      a.addAll([1, 3, 5])
      const b = new CompactSet(10)
      b.addAll([5, 1, 3])
      expect(a.equals(b)).toBe(true)
    })

    it('should return false for different sets', () => {
      const a = new CompactSet(10)
      a.addAll([1, 2])
      const b = new CompactSet(10)
      b.addAll([1, 3])
      expect(a.equals(b)).toBe(false)
    })

    it('should return true for two empty sets', () => {
      const a = new CompactSet(10)
      const b = new CompactSet(10)
      expect(a.equals(b)).toBe(true)
    })

    it('should return false for different sizes', () => {
      const a = new CompactSet(10)
      a.addAll([1, 2])
      const b = new CompactSet(10)
      b.addAll([1, 2, 3])
      expect(a.equals(b)).toBe(false)
    })

    it('should handle different maxValues with same content', () => {
      const a = new CompactSet(10)
      a.addAll([1, 2, 3])
      const b = new CompactSet(20)
      b.addAll([1, 2, 3])
      expect(a.equals(b)).toBe(true)
    })
  })

  describe('isSubsetOf', () => {
    it('should return true for subset', () => {
      const a = new CompactSet(10)
      a.addAll([1, 3])
      const b = new CompactSet(10)
      b.addAll([1, 2, 3, 4])
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('should return false for non-subset', () => {
      const a = new CompactSet(10)
      a.addAll([1, 5])
      const b = new CompactSet(10)
      b.addAll([1, 2, 3])
      expect(a.isSubsetOf(b)).toBe(false)
    })

    it('should return true for empty set', () => {
      const a = new CompactSet(10)
      const b = new CompactSet(10)
      b.addAll([1, 2, 3])
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('should return true for identical sets', () => {
      const a = new CompactSet(10)
      a.addAll([1, 2, 3])
      const b = new CompactSet(10)
      b.addAll([1, 2, 3])
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('should handle different maxValues', () => {
      const a = new CompactSet(10)
      a.addAll([1, 2])
      const b = new CompactSet(20)
      b.addAll([1, 2, 15])
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('should return false when a has element outside b range', () => {
      const a = new CompactSet(20)
      a.addAll([1, 15])
      const b = new CompactSet(10)
      b.addAll([1, 2])
      expect(a.isSubsetOf(b)).toBe(false)
    })
  })

  describe('clone', () => {
    it('should produce an equal set', () => {
      const s = new CompactSet(10)
      s.addAll([1, 3, 5, 7])
      const c = s.clone()
      expect(c.toArray()).toEqual([1, 3, 5, 7])
    })

    it('should not share state with original', () => {
      const s = new CompactSet(10)
      s.addAll([1, 2, 3])
      const c = s.clone()
      s.delete(2)
      expect(s.has(2)).toBe(false)
      expect(c.has(2)).toBe(true)
    })

    it('should preserve size', () => {
      const s = new CompactSet(10)
      s.addAll([1, 2, 3])
      expect(s.clone().size).toBe(3)
    })
  })

  describe('empty set', () => {
    it('should have size 0', () => {
      const s = new CompactSet(100)
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('should return undefined for first/last', () => {
      const s = new CompactSet(100)
      expect(s.first()).toBeUndefined()
      expect(s.last()).toBeUndefined()
    })

    it('should produce empty toArray', () => {
      const s = new CompactSet(100)
      expect(s.toArray()).toEqual([])
    })

    it('should be iterable with no results', () => {
      const s = new CompactSet(100)
      expect([...s]).toEqual([])
    })
  })

  describe('full set', () => {
    it('should be full when all values added', () => {
      const s = new CompactSet(63)
      for (let i = 0; i <= 63; i++) s.add(i)
      expect(s.isFull()).toBe(true)
      expect(s.size).toBe(64)
    })

    it('should have complement of size 0', () => {
      const s = new CompactSet(63)
      for (let i = 0; i <= 63; i++) s.add(i)
      expect(s.complement().size).toBe(0)
    })
  })

  describe('many values (10000+)', () => {
    it('should handle 10000 values', () => {
      const s = new CompactSet(10000)
      for (let i = 0; i <= 10000; i += 2) {
        s.add(i)
      }
      expect(s.size).toBe(5001)
      expect(s.has(0)).toBe(true)
      expect(s.has(10000)).toBe(true)
      expect(s.has(1)).toBe(false)
    })

    it('should iterate 10000 values in order', () => {
      const s = new CompactSet(10000)
      for (let i = 0; i <= 10000; i++) s.add(i)
      const arr = s.toArray()
      expect(arr.length).toBe(10001)
      expect(arr[0]).toBe(0)
      expect(arr[10000]).toBe(10000)
    })

    it('should handle sparse large range', () => {
      const s = new CompactSet(100000)
      s.add(0)
      s.add(50000)
      s.add(100000)
      expect(s.size).toBe(3)
      expect(s.toArray()).toEqual([0, 50000, 100000])
    })

    it('should clone large set', () => {
      const s = new CompactSet(10000)
      for (let i = 0; i <= 10000; i++) s.add(i)
      const c = s.clone()
      expect(c.size).toBe(10001)
    })
  })

  describe('boundary values', () => {
    it('should handle maxValue 0', () => {
      const s = new CompactSet(0)
      expect(s.add(0)).toBe(true)
      expect(s.has(0)).toBe(true)
      expect(s.size).toBe(1)
      expect(s.isFull()).toBe(true)
    })

    it('should handle value at exact word boundary (31)', () => {
      const s = new CompactSet(63)
      s.add(31)
      expect(s.has(31)).toBe(true)
      expect(s.first()).toBe(31)
      expect(s.last()).toBe(31)
    })

    it('should handle value just past word boundary (32)', () => {
      const s = new CompactSet(63)
      s.add(32)
      expect(s.has(32)).toBe(true)
    })

    it('should handle values spanning multiple words', () => {
      const s = new CompactSet(127)
      s.add(0)
      s.add(63)
      s.add(127)
      expect(s.toArray()).toEqual([0, 63, 127])
    })

    it('should handle next/previous across word boundary', () => {
      const s = new CompactSet(100)
      s.add(31)
      s.add(33)
      expect(s.next(31)).toBe(33)
      expect(s.previous(33)).toBe(31)
    })

    it('should handle complement with non-aligned maxValue', () => {
      const s = new CompactSet(47)
      const c = s.complement()
      expect(c.size).toBe(48)
      expect(c.last()).toBe(47)
    })
  })

  describe('set operations combinations', () => {
    it('union then intersect should be idempotent-like', () => {
      const a = new CompactSet(10)
      a.addAll([1, 2, 3])
      const b = new CompactSet(10)
      b.addAll([2, 3, 4])
      const u = a.union(b)
      const i = a.intersect(b)
      expect(u.intersect(i).toArray()).toEqual([2, 3])
    })

    it('difference with complement', () => {
      const s = new CompactSet(10)
      s.addAll([1, 3, 5])
      const c = s.complement()
      const d = s.difference(c)
      expect(d.toArray()).toEqual([1, 3, 5])
    })

    it('double complement should equal original', () => {
      const s = new CompactSet(10)
      s.addAll([1, 3, 5, 7])
      const cc = s.complement().complement()
      expect(cc.equals(s)).toBe(true)
    })

    it('a union b equals b union a', () => {
      const a = new CompactSet(10)
      a.addAll([1, 2])
      const b = new CompactSet(10)
      b.addAll([2, 3])
      expect(a.union(b).equals(b.union(a))).toBe(true)
    })

    it('a intersect b equals b intersect a', () => {
      const a = new CompactSet(10)
      a.addAll([1, 2, 3])
      const b = new CompactSet(10)
      b.addAll([2, 3, 4])
      expect(a.intersect(b).equals(b.intersect(a))).toBe(true)
    })
  })

  describe('add then delete cycles', () => {
    it('should handle repeated add/delete of same value', () => {
      const s = new CompactSet(10)
      s.add(5)
      s.delete(5)
      s.add(5)
      s.delete(5)
      expect(s.size).toBe(0)
      expect(s.has(5)).toBe(false)
    })

    it('should handle interleaved operations', () => {
      const s = new CompactSet(10)
      s.add(1)
      s.add(2)
      s.delete(1)
      s.add(3)
      s.delete(2)
      expect(s.toArray()).toEqual([3])
    })
  })

  describe('iteration order', () => {
    it('should iterate in ascending order', () => {
      const s = new CompactSet(100)
      s.add(50)
      s.add(10)
      s.add(90)
      s.add(30)
      expect(s.toArray()).toEqual([10, 30, 50, 90])
    })

    it('should iterate across word boundaries in order', () => {
      const s = new CompactSet(100)
      s.add(30)
      s.add(35)
      s.add(65)
      s.add(70)
      const arr = s.toArray()
      expect(arr).toEqual([30, 35, 65, 70])
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]).toBeGreaterThan(arr[i - 1]!)
      }
    })
  })
})
