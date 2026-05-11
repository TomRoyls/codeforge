import { describe, it, expect } from 'vitest'
import { RedBlackSet } from '../../src/core/red-black-set/index.js'

describe('RedBlackSet', () => {
  describe('constructor', () => {
    it('creates an empty set', () => {
      const s = new RedBlackSet<number>()
      expect(s.size).toBe(0)
      expect(s.isEmpty).toBe(true)
    })

    it('accepts a custom comparator', () => {
      const s = new RedBlackSet<string>({
        compare: (a, b) => a.localeCompare(b),
      })
      s.add('b')
      s.add('a')
      expect(s.toArray()).toEqual(['a', 'b'])
    })

    it('accepts a reverse comparator', () => {
      const s = new RedBlackSet<number>({
        compare: (a, b) => b - a,
      })
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.toArray()).toEqual([3, 2, 1])
    })

    it('works with default comparator for numbers', () => {
      const s = new RedBlackSet<number>()
      s.add(3)
      s.add(1)
      s.add(2)
      expect(s.toArray()).toEqual([1, 2, 3])
    })

    it('works with default comparator for strings', () => {
      const s = new RedBlackSet<string>()
      s.add('c')
      s.add('a')
      s.add('b')
      expect(s.toArray()).toEqual(['a', 'b', 'c'])
    })
  })

  describe('add', () => {
    it('adds a single value', () => {
      const s = new RedBlackSet<number>()
      expect(s.add(1)).toBe(true)
      expect(s.size).toBe(1)
      expect(s.has(1)).toBe(true)
    })

    it('returns false when adding duplicate', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      expect(s.add(1)).toBe(false)
      expect(s.size).toBe(1)
    })

    it('adds multiple values', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.size).toBe(3)
    })

    it('maintains sorted order', () => {
      const s = new RedBlackSet<number>()
      s.add(5)
      s.add(1)
      s.add(3)
      s.add(2)
      s.add(4)
      expect(s.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('handles adding in ascending order', () => {
      const s = new RedBlackSet<number>()
      for (let i = 0; i < 100; i++) s.add(i)
      expect(s.size).toBe(100)
      expect(s.toArray()).toEqual(Array.from({ length: 100 }, (_, i) => i))
    })

    it('handles adding in descending order', () => {
      const s = new RedBlackSet<number>()
      for (let i = 99; i >= 0; i--) s.add(i)
      expect(s.size).toBe(100)
      expect(s.toArray()).toEqual(Array.from({ length: 100 }, (_, i) => i))
    })

    it('handles many insertions', () => {
      const s = new RedBlackSet<number>()
      for (let i = 0; i < 1000; i++) s.add(i)
      expect(s.size).toBe(1000)
      expect(s.min()).toBe(0)
      expect(s.max()).toBe(999)
    })
  })

  describe('delete', () => {
    it('deletes an existing value', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      expect(s.delete(1)).toBe(true)
      expect(s.size).toBe(0)
      expect(s.has(1)).toBe(false)
    })

    it('returns false for non-existent value', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      expect(s.delete(2)).toBe(false)
      expect(s.size).toBe(1)
    })

    it('deletes from empty set without error', () => {
      const s = new RedBlackSet<number>()
      expect(s.delete(1)).toBe(false)
    })

    it('deletes the minimum element', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(1)
      expect(s.toArray()).toEqual([2, 3])
    })

    it('deletes the maximum element', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(3)
      expect(s.toArray()).toEqual([1, 2])
    })

    it('deletes a middle element', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(2)
      expect(s.toArray()).toEqual([1, 3])
    })

    it('deletes the only element', () => {
      const s = new RedBlackSet<number>()
      s.add(42)
      expect(s.delete(42)).toBe(true)
      expect(s.isEmpty).toBe(true)
    })

    it('handles multiple deletions', () => {
      const s = new RedBlackSet<number>()
      for (let i = 0; i < 10; i++) s.add(i)
      for (let i = 0; i < 10; i += 2) s.delete(i)
      expect(s.toArray()).toEqual([1, 3, 5, 7, 9])
    })

    it('deletes all elements', () => {
      const s = new RedBlackSet<number>()
      for (let i = 0; i < 5; i++) s.add(i)
      for (let i = 0; i < 5; i++) s.delete(i)
      expect(s.isEmpty).toBe(true)
      expect(s.size).toBe(0)
    })

    it('deletes in reverse order', () => {
      const s = new RedBlackSet<number>()
      for (let i = 0; i < 10; i++) s.add(i)
      for (let i = 9; i >= 0; i--) s.delete(i)
      expect(s.isEmpty).toBe(true)
    })
  })

  describe('has', () => {
    it('returns true for existing value', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      expect(s.has(1)).toBe(true)
    })

    it('returns false for non-existent value', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      expect(s.has(2)).toBe(false)
    })

    it('returns false for empty set', () => {
      const s = new RedBlackSet<number>()
      expect(s.has(1)).toBe(false)
    })

    it('finds values after deletions', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(2)
      expect(s.has(1)).toBe(true)
      expect(s.has(2)).toBe(false)
      expect(s.has(3)).toBe(true)
    })
  })

  describe('size and isEmpty', () => {
    it('size is 0 for empty set', () => {
      const s = new RedBlackSet<number>()
      expect(s.size).toBe(0)
    })

    it('isEmpty is true for empty set', () => {
      const s = new RedBlackSet<number>()
      expect(s.isEmpty).toBe(true)
    })

    it('isEmpty is false after add', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      expect(s.isEmpty).toBe(false)
    })

    it('size updates after add and delete', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      expect(s.size).toBe(1)
      s.add(2)
      expect(s.size).toBe(2)
      s.delete(1)
      expect(s.size).toBe(1)
    })

    it('isEmpty after clear', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      s.add(2)
      s.clear()
      expect(s.isEmpty).toBe(true)
      expect(s.size).toBe(0)
    })
  })

  describe('clear', () => {
    it('clears all elements', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.clear()
      expect(s.size).toBe(0)
      expect(s.isEmpty).toBe(true)
    })

    it('clear on empty set is safe', () => {
      const s = new RedBlackSet<number>()
      s.clear()
      expect(s.size).toBe(0)
    })

    it('allows adding after clear', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      s.clear()
      s.add(2)
      expect(s.size).toBe(1)
      expect(s.has(2)).toBe(true)
      expect(s.has(1)).toBe(false)
    })
  })

  describe('min and max', () => {
    it('min returns undefined for empty set', () => {
      const s = new RedBlackSet<number>()
      expect(s.min()).toBeUndefined()
    })

    it('max returns undefined for empty set', () => {
      const s = new RedBlackSet<number>()
      expect(s.max()).toBeUndefined()
    })

    it('min returns the smallest value', () => {
      const s = new RedBlackSet<number>()
      s.add(5)
      s.add(3)
      s.add(7)
      expect(s.min()).toBe(3)
    })

    it('max returns the largest value', () => {
      const s = new RedBlackSet<number>()
      s.add(5)
      s.add(3)
      s.add(7)
      expect(s.max()).toBe(7)
    })

    it('min and max are same for single element', () => {
      const s = new RedBlackSet<number>()
      s.add(42)
      expect(s.min()).toBe(42)
      expect(s.max()).toBe(42)
    })

    it('min updates after deletion', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(1)
      expect(s.min()).toBe(2)
    })

    it('max updates after deletion', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(3)
      expect(s.max()).toBe(2)
    })
  })

  describe('floor', () => {
    it('returns exact match', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      s.add(3)
      s.add(5)
      expect(s.floor(3)).toBe(3)
    })

    it('returns largest value less than input', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      s.add(3)
      s.add(5)
      expect(s.floor(4)).toBe(3)
    })

    it('returns undefined when all values are greater', () => {
      const s = new RedBlackSet<number>()
      s.add(5)
      s.add(10)
      expect(s.floor(3)).toBeUndefined()
    })

    it('returns undefined for empty set', () => {
      const s = new RedBlackSet<number>()
      expect(s.floor(1)).toBeUndefined()
    })

    it('returns the largest value when equal to max', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      s.add(5)
      expect(s.floor(5)).toBe(5)
    })
  })

  describe('ceiling', () => {
    it('returns exact match', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      s.add(3)
      s.add(5)
      expect(s.ceiling(3)).toBe(3)
    })

    it('returns smallest value greater than input', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      s.add(3)
      s.add(5)
      expect(s.ceiling(2)).toBe(3)
    })

    it('returns undefined when all values are less', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      s.add(3)
      expect(s.ceiling(5)).toBeUndefined()
    })

    it('returns undefined for empty set', () => {
      const s = new RedBlackSet<number>()
      expect(s.ceiling(1)).toBeUndefined()
    })

    it('returns the smallest value when equal to min', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      s.add(5)
      expect(s.ceiling(1)).toBe(1)
    })
  })

  describe('lower', () => {
    it('returns greatest value strictly less than input', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      s.add(3)
      s.add(5)
      expect(s.lower(4)).toBe(3)
    })

    it('does not return exact match', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      s.add(3)
      s.add(5)
      expect(s.lower(3)).toBe(1)
    })

    it('returns undefined when no smaller value', () => {
      const s = new RedBlackSet<number>()
      s.add(5)
      s.add(10)
      expect(s.lower(5)).toBeUndefined()
    })

    it('returns undefined for empty set', () => {
      const s = new RedBlackSet<number>()
      expect(s.lower(1)).toBeUndefined()
    })

    it('returns value less than min of set', () => {
      const s = new RedBlackSet<number>()
      s.add(5)
      s.add(10)
      expect(s.lower(6)).toBe(5)
    })
  })

  describe('higher', () => {
    it('returns smallest value strictly greater than input', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      s.add(3)
      s.add(5)
      expect(s.higher(2)).toBe(3)
    })

    it('does not return exact match', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      s.add(3)
      s.add(5)
      expect(s.higher(3)).toBe(5)
    })

    it('returns undefined when no greater value', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      s.add(5)
      expect(s.higher(5)).toBeUndefined()
    })

    it('returns undefined for empty set', () => {
      const s = new RedBlackSet<number>()
      expect(s.higher(1)).toBeUndefined()
    })

    it('returns value greater than max of set', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      s.add(5)
      expect(s.higher(3)).toBe(5)
    })
  })

  describe('range', () => {
    it('returns values in range inclusive', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.add(4)
      s.add(5)
      expect(s.range(2, 4)).toEqual([2, 3, 4])
    })

    it('returns single element range', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.range(2, 2)).toEqual([2])
    })

    it('returns empty for range with no matches', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      s.add(5)
      expect(s.range(2, 4)).toEqual([])
    })

    it('returns empty for empty set', () => {
      const s = new RedBlackSet<number>()
      expect(s.range(1, 5)).toEqual([])
    })

    it('returns all elements for full range', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.range(1, 3)).toEqual([1, 2, 3])
    })

    it('returns partial range at low end', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.add(4)
      s.add(5)
      expect(s.range(1, 2)).toEqual([1, 2])
    })

    it('returns partial range at high end', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.add(4)
      s.add(5)
      expect(s.range(4, 5)).toEqual([4, 5])
    })
  })

  describe('indexOf', () => {
    it('returns 0 for minimum value', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.indexOf(1)).toBe(0)
    })

    it('returns last index for maximum value', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.indexOf(3)).toBe(2)
    })

    it('returns correct index for middle value', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.indexOf(2)).toBe(1)
    })

    it('returns -1 for non-existent value', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      s.add(3)
      expect(s.indexOf(2)).toBe(-1)
    })

    it('returns -1 for empty set', () => {
      const s = new RedBlackSet<number>()
      expect(s.indexOf(1)).toBe(-1)
    })

    it('returns correct indices after deletions', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.add(4)
      s.add(5)
      s.delete(3)
      expect(s.indexOf(1)).toBe(0)
      expect(s.indexOf(2)).toBe(1)
      expect(s.indexOf(4)).toBe(2)
      expect(s.indexOf(5)).toBe(3)
    })
  })

  describe('at', () => {
    it('returns element at index 0', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.at(0)).toBe(1)
    })

    it('returns element at last index', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.at(2)).toBe(3)
    })

    it('returns element at middle index', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.at(1)).toBe(2)
    })

    it('returns undefined for out-of-bounds index', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      expect(s.at(1)).toBeUndefined()
    })

    it('returns undefined for negative index', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      expect(s.at(-1)).toBeUndefined()
    })

    it('returns undefined for empty set', () => {
      const s = new RedBlackSet<number>()
      expect(s.at(0)).toBeUndefined()
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty set', () => {
      const s = new RedBlackSet<number>()
      expect(s.toArray()).toEqual([])
    })

    it('returns sorted array', () => {
      const s = new RedBlackSet<number>()
      s.add(3)
      s.add(1)
      s.add(2)
      expect(s.toArray()).toEqual([1, 2, 3])
    })

    it('reflects additions and deletions', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(2)
      expect(s.toArray()).toEqual([1, 3])
    })
  })

  describe('forEach', () => {
    it('iterates all elements in order', () => {
      const s = new RedBlackSet<number>()
      s.add(3)
      s.add(1)
      s.add(2)
      const result: number[] = []
      s.forEach((v) => result.push(v))
      expect(result).toEqual([1, 2, 3])
    })

    it('provides correct indices', () => {
      const s = new RedBlackSet<number>()
      s.add(10)
      s.add(20)
      s.add(30)
      const indices: number[] = []
      s.forEach((_, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('does not iterate on empty set', () => {
      const s = new RedBlackSet<number>()
      let count = 0
      s.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('iterates single element', () => {
      const s = new RedBlackSet<number>()
      s.add(42)
      const result: number[] = []
      s.forEach((v) => result.push(v))
      expect(result).toEqual([42])
    })
  })

  describe('Symbol.iterator', () => {
    it('is iterable', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      expect([...s]).toEqual([1, 2, 3])
    })

    it('works with for...of', () => {
      const s = new RedBlackSet<number>()
      s.add(3)
      s.add(1)
      s.add(2)
      const result: number[] = []
      for (const v of s) result.push(v)
      expect(result).toEqual([1, 2, 3])
    })

    it('returns empty for empty set', () => {
      const s = new RedBlackSet<number>()
      expect([...s]).toEqual([])
    })

    it('works with spread in array', () => {
      const s = new RedBlackSet<number>()
      s.add(2)
      s.add(1)
      expect([0, ...s, 4]).toEqual([0, 1, 2, 4])
    })
  })

  describe('union', () => {
    it('returns union of two sets', () => {
      const a = new RedBlackSet<number>()
      a.add(1)
      a.add(2)
      const b = new RedBlackSet<number>()
      b.add(2)
      b.add(3)
      const u = a.union(b)
      expect(u.toArray()).toEqual([1, 2, 3])
    })

    it('returns copy when no overlap', () => {
      const a = new RedBlackSet<number>()
      a.add(1)
      const b = new RedBlackSet<number>()
      b.add(2)
      const u = a.union(b)
      expect(u.toArray()).toEqual([1, 2])
    })

    it('returns copy of first when second is empty', () => {
      const a = new RedBlackSet<number>()
      a.add(1)
      a.add(2)
      const b = new RedBlackSet<number>()
      const u = a.union(b)
      expect(u.toArray()).toEqual([1, 2])
    })

    it('returns copy of second when first is empty', () => {
      const a = new RedBlackSet<number>()
      const b = new RedBlackSet<number>()
      b.add(1)
      b.add(2)
      const u = a.union(b)
      expect(u.toArray()).toEqual([1, 2])
    })

    it('does not modify original sets', () => {
      const a = new RedBlackSet<number>()
      a.add(1)
      const b = new RedBlackSet<number>()
      b.add(2)
      a.union(b)
      expect(a.toArray()).toEqual([1])
      expect(b.toArray()).toEqual([2])
    })
  })

  describe('intersection', () => {
    it('returns common elements', () => {
      const a = new RedBlackSet<number>()
      a.add(1)
      a.add(2)
      a.add(3)
      const b = new RedBlackSet<number>()
      b.add(2)
      b.add(3)
      b.add(4)
      const i = a.intersection(b)
      expect(i.toArray()).toEqual([2, 3])
    })

    it('returns empty when no overlap', () => {
      const a = new RedBlackSet<number>()
      a.add(1)
      const b = new RedBlackSet<number>()
      b.add(2)
      const i = a.intersection(b)
      expect(i.isEmpty).toBe(true)
    })

    it('returns empty when either is empty', () => {
      const a = new RedBlackSet<number>()
      a.add(1)
      const b = new RedBlackSet<number>()
      expect(a.intersection(b).isEmpty).toBe(true)
      expect(b.intersection(a).isEmpty).toBe(true)
    })

    it('returns full set when both are identical', () => {
      const a = new RedBlackSet<number>()
      a.add(1)
      a.add(2)
      const b = new RedBlackSet<number>()
      b.add(1)
      b.add(2)
      expect(a.intersection(b).toArray()).toEqual([1, 2])
    })
  })

  describe('difference', () => {
    it('returns elements in a but not b', () => {
      const a = new RedBlackSet<number>()
      a.add(1)
      a.add(2)
      a.add(3)
      const b = new RedBlackSet<number>()
      b.add(2)
      b.add(4)
      const d = a.difference(b)
      expect(d.toArray()).toEqual([1, 3])
    })

    it('returns copy when no overlap', () => {
      const a = new RedBlackSet<number>()
      a.add(1)
      a.add(2)
      const b = new RedBlackSet<number>()
      b.add(3)
      b.add(4)
      expect(a.difference(b).toArray()).toEqual([1, 2])
    })

    it('returns empty when a is subset of b', () => {
      const a = new RedBlackSet<number>()
      a.add(1)
      a.add(2)
      const b = new RedBlackSet<number>()
      b.add(1)
      b.add(2)
      b.add(3)
      expect(a.difference(b).isEmpty).toBe(true)
    })

    it('returns empty when a is empty', () => {
      const a = new RedBlackSet<number>()
      const b = new RedBlackSet<number>()
      b.add(1)
      expect(a.difference(b).isEmpty).toBe(true)
    })
  })

  describe('symmetricDifference', () => {
    it('returns elements in either but not both', () => {
      const a = new RedBlackSet<number>()
      a.add(1)
      a.add(2)
      a.add(3)
      const b = new RedBlackSet<number>()
      b.add(2)
      b.add(3)
      b.add(4)
      const sd = a.symmetricDifference(b)
      expect(sd.toArray()).toEqual([1, 4])
    })

    it('returns empty when sets are identical', () => {
      const a = new RedBlackSet<number>()
      a.add(1)
      a.add(2)
      const b = new RedBlackSet<number>()
      b.add(1)
      b.add(2)
      expect(a.symmetricDifference(b).isEmpty).toBe(true)
    })

    it('returns union when sets are disjoint', () => {
      const a = new RedBlackSet<number>()
      a.add(1)
      a.add(2)
      const b = new RedBlackSet<number>()
      b.add(3)
      b.add(4)
      expect(a.symmetricDifference(b).toArray()).toEqual([1, 2, 3, 4])
    })

    it('returns copy of other when this is empty', () => {
      const a = new RedBlackSet<number>()
      const b = new RedBlackSet<number>()
      b.add(1)
      b.add(2)
      expect(a.symmetricDifference(b).toArray()).toEqual([1, 2])
    })
  })

  describe('isSubsetOf', () => {
    it('returns true for equal sets', () => {
      const a = new RedBlackSet<number>()
      a.add(1)
      a.add(2)
      const b = new RedBlackSet<number>()
      b.add(1)
      b.add(2)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('returns true for proper subset', () => {
      const a = new RedBlackSet<number>()
      a.add(1)
      a.add(2)
      const b = new RedBlackSet<number>()
      b.add(1)
      b.add(2)
      b.add(3)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('returns false when not subset', () => {
      const a = new RedBlackSet<number>()
      a.add(1)
      a.add(2)
      a.add(3)
      const b = new RedBlackSet<number>()
      b.add(1)
      b.add(2)
      expect(a.isSubsetOf(b)).toBe(false)
    })

    it('empty set is subset of any set', () => {
      const a = new RedBlackSet<number>()
      const b = new RedBlackSet<number>()
      b.add(1)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('empty set is subset of empty set', () => {
      const a = new RedBlackSet<number>()
      const b = new RedBlackSet<number>()
      expect(a.isSubsetOf(b)).toBe(true)
    })
  })

  describe('isSupersetOf', () => {
    it('returns true for equal sets', () => {
      const a = new RedBlackSet<number>()
      a.add(1)
      a.add(2)
      const b = new RedBlackSet<number>()
      b.add(1)
      b.add(2)
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('returns true for proper superset', () => {
      const a = new RedBlackSet<number>()
      a.add(1)
      a.add(2)
      a.add(3)
      const b = new RedBlackSet<number>()
      b.add(1)
      b.add(2)
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('returns false when not superset', () => {
      const a = new RedBlackSet<number>()
      a.add(1)
      a.add(2)
      const b = new RedBlackSet<number>()
      b.add(1)
      b.add(2)
      b.add(3)
      expect(a.isSupersetOf(b)).toBe(false)
    })

    it('any set is superset of empty set', () => {
      const a = new RedBlackSet<number>()
      a.add(1)
      const b = new RedBlackSet<number>()
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('empty set is superset of empty set', () => {
      const a = new RedBlackSet<number>()
      const b = new RedBlackSet<number>()
      expect(a.isSupersetOf(b)).toBe(true)
    })
  })

  describe('generics', () => {
    it('works with strings', () => {
      const s = new RedBlackSet<string>()
      s.add('banana')
      s.add('apple')
      s.add('cherry')
      expect(s.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('works with custom objects using comparator', () => {
      interface Point {
        x: number
        y: number
      }
      const s = new RedBlackSet<Point>({
        compare: (a, b) => a.x - b.x || a.y - b.y,
      })
      s.add({ x: 2, y: 1 })
      s.add({ x: 1, y: 3 })
      s.add({ x: 1, y: 1 })
      expect(s.toArray()).toEqual([
        { x: 1, y: 1 },
        { x: 1, y: 3 },
        { x: 2, y: 1 },
      ])
    })

    it('works with dates using comparator', () => {
      const s = new RedBlackSet<Date>({
        compare: (a, b) => a.getTime() - b.getTime(),
      })
      const d1 = new Date(2023, 0, 1)
      const d2 = new Date(2023, 0, 3)
      const d3 = new Date(2023, 0, 2)
      s.add(d1)
      s.add(d2)
      s.add(d3)
      expect(s.toArray()).toEqual([d1, d3, d2])
    })
  })

  describe('stress tests', () => {
    it('handles sequential insert and delete', () => {
      const s = new RedBlackSet<number>()
      for (let i = 0; i < 100; i++) s.add(i)
      for (let i = 0; i < 100; i++) {
        expect(s.has(i)).toBe(true)
        expect(s.indexOf(i)).toBe(i)
      }
      for (let i = 0; i < 100; i++) s.delete(i)
      expect(s.isEmpty).toBe(true)
    })

    it('handles random operations', () => {
      const s = new RedBlackSet<number>()
      const reference = new Set<number>()
      for (let i = 0; i < 200; i++) {
        const val = Math.floor(Math.random() * 50)
        const op = Math.random()
        if (op < 0.6) {
          s.add(val)
          reference.add(val)
        } else {
          s.delete(val)
          reference.delete(val)
        }
      }
      expect(s.size).toBe(reference.size)
      const sorted = [...reference].sort((a, b) => a - b)
      expect(s.toArray()).toEqual(sorted)
    })

    it('handles many elements for indexOf and at', () => {
      const s = new RedBlackSet<number>()
      for (let i = 0; i < 200; i++) s.add(i)
      for (let i = 0; i < 200; i++) {
        expect(s.indexOf(i)).toBe(i)
        expect(s.at(i)).toBe(i)
      }
    })

    it('handles range queries on large sets', () => {
      const s = new RedBlackSet<number>()
      for (let i = 0; i < 100; i++) s.add(i * 2)
      expect(s.range(10, 20)).toEqual([10, 12, 14, 16, 18, 20])
    })
  })

  describe('set operation chains', () => {
    it('chains set operations', () => {
      const a = new RedBlackSet<number>()
      a.add(1)
      a.add(2)
      a.add(3)
      const b = new RedBlackSet<number>()
      b.add(2)
      b.add(3)
      b.add(4)
      const c = new RedBlackSet<number>()
      c.add(3)
      c.add(4)
      c.add(5)
      const result = a.union(b).intersection(c)
      expect(result.toArray()).toEqual([3, 4])
    })

    it('chains difference operations', () => {
      const a = new RedBlackSet<number>()
      a.add(1)
      a.add(2)
      a.add(3)
      a.add(4)
      a.add(5)
      const b = new RedBlackSet<number>()
      b.add(2)
      b.add(4)
      const c = new RedBlackSet<number>()
      c.add(5)
      const result = a.difference(b).difference(c)
      expect(result.toArray()).toEqual([1, 3])
    })
  })

  describe('edge cases', () => {
    it('handles negative numbers', () => {
      const s = new RedBlackSet<number>()
      s.add(-3)
      s.add(-1)
      s.add(0)
      s.add(2)
      expect(s.toArray()).toEqual([-3, -1, 0, 2])
      expect(s.min()).toBe(-3)
      expect(s.max()).toBe(2)
    })

    it('handles duplicate insertions gracefully', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      s.add(1)
      s.add(1)
      expect(s.size).toBe(1)
    })

    it('handles delete of non-existent after clear', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      s.clear()
      expect(s.delete(1)).toBe(false)
    })

    it('handles floor and ceiling with single element', () => {
      const s = new RedBlackSet<number>()
      s.add(5)
      expect(s.floor(5)).toBe(5)
      expect(s.floor(6)).toBe(5)
      expect(s.floor(4)).toBeUndefined()
      expect(s.ceiling(5)).toBe(5)
      expect(s.ceiling(4)).toBe(5)
      expect(s.ceiling(6)).toBeUndefined()
    })

    it('handles lower and higher with single element', () => {
      const s = new RedBlackSet<number>()
      s.add(5)
      expect(s.lower(5)).toBeUndefined()
      expect(s.lower(6)).toBe(5)
      expect(s.higher(5)).toBeUndefined()
      expect(s.higher(4)).toBe(5)
    })

    it('indexOf returns -1 for value not in set after deletions', () => {
      const s = new RedBlackSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(2)
      expect(s.indexOf(2)).toBe(-1)
    })

    it('operations on empty set return consistent results', () => {
      const s = new RedBlackSet<number>()
      expect(s.min()).toBeUndefined()
      expect(s.max()).toBeUndefined()
      expect(s.floor(1)).toBeUndefined()
      expect(s.ceiling(1)).toBeUndefined()
      expect(s.lower(1)).toBeUndefined()
      expect(s.higher(1)).toBeUndefined()
      expect(s.indexOf(1)).toBe(-1)
      expect(s.at(0)).toBeUndefined()
      expect(s.toArray()).toEqual([])
      expect(s.range(0, 10)).toEqual([])
    })
  })
})
