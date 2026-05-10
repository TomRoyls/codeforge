import { describe, it, expect } from 'vitest'
import { SortedSet } from '../../src/core/sorted-set/sorted-set.js'

function assertSorted<T>(s: SortedSet<T>): void {
  const arr = s.toArray()
  for (let i = 1; i < arr.length; i++) {
    expect(arr[i]! >= arr[i - 1]!).toBe(true)
  }
}

describe('SortedSet', () => {
  describe('construction', () => {
    it('should create empty set with no arguments', () => {
      const s = new SortedSet<number>()
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('should accept custom comparator function', () => {
      const s = new SortedSet<number>({ comparator: (a, b) => b - a })
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.toArray()).toEqual([3, 2, 1])
    })

    it('should accept empty options object', () => {
      const s = new SortedSet<number>({})
      s.add(3)
      s.add(1)
      s.add(2)
      expect(s.toArray()).toEqual([1, 2, 3])
    })

    it('should work with strings by default', () => {
      const s = new SortedSet<string>()
      s.add('cherry')
      s.add('apple')
      s.add('banana')
      expect(s.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('should accept string comparator', () => {
      const s = new SortedSet<string>({ comparator: (a, b) => a.localeCompare(b) })
      s.add('banana')
      s.add('apple')
      s.add('cherry')
      expect(s.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })
  })

  describe('add', () => {
    it('should add values in sorted order', () => {
      const s = new SortedSet<number>()
      s.add(5)
      s.add(1)
      s.add(3)
      expect(s.toArray()).toEqual([1, 3, 5])
    })

    it('should reject duplicate values', () => {
      const s = new SortedSet<number>()
      s.add(1)
      s.add(1)
      s.add(1)
      expect(s.size).toBe(1)
    })

    it('should reject duplicate after adding other values', () => {
      const s = new SortedSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.add(2)
      expect(s.size).toBe(3)
      expect(s.toArray()).toEqual([1, 2, 3])
    })

    it('should handle many insertions', () => {
      const s = new SortedSet<number>()
      for (let i = 0; i < 100; i++) {
        s.add(i)
      }
      expect(s.size).toBe(100)
      assertSorted(s)
    })

    it('should handle reverse order insertion', () => {
      const s = new SortedSet<number>()
      for (let i = 100; i >= 0; i--) {
        s.add(i)
      }
      expect(s.size).toBe(101)
      expect(s.min).toBe(0)
      expect(s.max).toBe(100)
    })

    it('should handle negative values', () => {
      const s = new SortedSet<number>()
      s.add(-3)
      s.add(0)
      s.add(5)
      expect(s.toArray()).toEqual([-3, 0, 5])
    })

    it('should handle inserting same value multiple times', () => {
      const s = new SortedSet<number>()
      s.add(1)
      s.add(1)
      s.add(1)
      s.add(1)
      expect(s.size).toBe(1)
      expect(s.has(1)).toBe(true)
    })

    it('should handle string values', () => {
      const s = new SortedSet<string>()
      s.add('b')
      s.add('a')
      s.add('c')
      expect(s.toArray()).toEqual(['a', 'b', 'c'])
    })
  })

  describe('delete', () => {
    it('should delete existing value and return true', () => {
      const s = new SortedSet<number>()
      s.add(1)
      s.add(2)
      expect(s.delete(1)).toBe(true)
      expect(s.size).toBe(1)
      expect(s.has(1)).toBe(false)
    })

    it('should return false when deleting missing value', () => {
      const s = new SortedSet<number>()
      expect(s.delete(1)).toBe(false)
    })

    it('should handle deleting all entries', () => {
      const s = new SortedSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(2)
      s.delete(1)
      s.delete(3)
      expect(s.isEmpty()).toBe(true)
    })

    it('should maintain order after deletions', () => {
      const s = new SortedSet<number>()
      for (let i = 0; i < 20; i++) s.add(i)
      s.delete(5)
      s.delete(10)
      s.delete(15)
      expect(s.size).toBe(17)
      assertSorted(s)
    })

    it('should handle deleting from empty set', () => {
      const s = new SortedSet<number>()
      expect(s.delete(1)).toBe(false)
      expect(s.size).toBe(0)
    })

    it('should handle deleting only element', () => {
      const s = new SortedSet<number>()
      s.add(42)
      expect(s.delete(42)).toBe(true)
      expect(s.isEmpty()).toBe(true)
    })

    it('should handle add-delete-add cycle', () => {
      const s = new SortedSet<number>()
      s.add(1)
      s.delete(1)
      s.add(1)
      expect(s.has(1)).toBe(true)
      expect(s.size).toBe(1)
    })

    it('should handle deleting min', () => {
      const s = new SortedSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(1)
      expect(s.min).toBe(2)
    })

    it('should handle deleting max', () => {
      const s = new SortedSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(3)
      expect(s.max).toBe(2)
    })

    it('should handle deleting middle element', () => {
      const s = new SortedSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(2)
      expect(s.toArray()).toEqual([1, 3])
    })
  })

  describe('has', () => {
    it('should return true for existing value', () => {
      const s = new SortedSet<number>()
      s.add(1)
      expect(s.has(1)).toBe(true)
    })

    it('should return false for missing value', () => {
      const s = new SortedSet<number>()
      expect(s.has(1)).toBe(false)
    })

    it('should return false after delete', () => {
      const s = new SortedSet<number>()
      s.add(1)
      s.delete(1)
      expect(s.has(1)).toBe(false)
    })

    it('should find values in large set', () => {
      const s = new SortedSet<number>()
      for (let i = 0; i < 100; i++) s.add(i)
      expect(s.has(0)).toBe(true)
      expect(s.has(99)).toBe(true)
      expect(s.has(50)).toBe(true)
      expect(s.has(100)).toBe(false)
      expect(s.has(-1)).toBe(false)
    })
  })

  describe('min/max', () => {
    it('should return min value', () => {
      const s = new SortedSet<number>()
      s.add(5)
      s.add(3)
      s.add(7)
      expect(s.min).toBe(3)
    })

    it('should return max value', () => {
      const s = new SortedSet<number>()
      s.add(5)
      s.add(3)
      s.add(7)
      expect(s.max).toBe(7)
    })

    it('should return undefined for min on empty set', () => {
      const s = new SortedSet<number>()
      expect(s.min).toBeUndefined()
    })

    it('should return undefined for max on empty set', () => {
      const s = new SortedSet<number>()
      expect(s.max).toBeUndefined()
    })

    it('should return same value for min and max on single element', () => {
      const s = new SortedSet<number>()
      s.add(42)
      expect(s.min).toBe(42)
      expect(s.max).toBe(42)
    })

    it('should update min after deletion', () => {
      const s = new SortedSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(1)
      expect(s.min).toBe(2)
    })

    it('should update max after deletion', () => {
      const s = new SortedSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(3)
      expect(s.max).toBe(2)
    })

    it('should handle min/max with strings', () => {
      const s = new SortedSet<string>()
      s.add('cherry')
      s.add('apple')
      s.add('banana')
      expect(s.min).toBe('apple')
      expect(s.max).toBe('cherry')
    })
  })

  describe('lowerBound/upperBound', () => {
    it('should find exact value with lowerBound', () => {
      const s = new SortedSet<number>()
      s.add(1)
      s.add(3)
      s.add(5)
      expect(s.lowerBound(3)).toBe(3)
    })

    it('should find next greater value with lowerBound', () => {
      const s = new SortedSet<number>()
      s.add(1)
      s.add(3)
      s.add(5)
      expect(s.lowerBound(2)).toBe(3)
    })

    it('should return undefined from lowerBound if all values smaller', () => {
      const s = new SortedSet<number>()
      s.add(1)
      s.add(3)
      expect(s.lowerBound(5)).toBeUndefined()
    })

    it('should return undefined from lowerBound for empty set', () => {
      const s = new SortedSet<number>()
      expect(s.lowerBound(1)).toBeUndefined()
    })

    it('should return smallest value when lowerBound searching below min', () => {
      const s = new SortedSet<number>()
      s.add(5)
      s.add(10)
      expect(s.lowerBound(1)).toBe(5)
    })

    it('should find exact min value with lowerBound', () => {
      const s = new SortedSet<number>()
      s.add(5)
      s.add(10)
      expect(s.lowerBound(5)).toBe(5)
    })

    it('should find next greater value with upperBound', () => {
      const s = new SortedSet<number>()
      s.add(1)
      s.add(3)
      s.add(5)
      expect(s.upperBound(3)).toBe(5)
    })

    it('should find next value from upperBound even if exact match exists', () => {
      const s = new SortedSet<number>()
      s.add(1)
      s.add(5)
      expect(s.upperBound(1)).toBe(5)
    })

    it('should return undefined from upperBound if no greater value', () => {
      const s = new SortedSet<number>()
      s.add(1)
      s.add(3)
      expect(s.upperBound(5)).toBeUndefined()
    })

    it('should return undefined from upperBound for empty set', () => {
      const s = new SortedSet<number>()
      expect(s.upperBound(1)).toBeUndefined()
    })

    it('should return undefined from upperBound at max value', () => {
      const s = new SortedSet<number>()
      s.add(1)
      s.add(5)
      expect(s.upperBound(5)).toBeUndefined()
    })

    it('should correctly bound around a gap', () => {
      const s = new SortedSet<number>()
      s.add(1)
      s.add(5)
      s.add(10)
      expect(s.lowerBound(3)).toBe(5)
      expect(s.upperBound(3)).toBe(5)
    })

    it('should handle boundary correctly', () => {
      const s = new SortedSet<number>()
      s.add(1)
      s.add(5)
      s.add(10)
      expect(s.lowerBound(5)).toBe(5)
      expect(s.upperBound(5)).toBe(10)
    })
  })

  describe('range', () => {
    it('should return values in range inclusive', () => {
      const s = new SortedSet<number>()
      for (let i = 0; i < 10; i++) s.add(i)
      const r = s.range(3, 7)
      expect(r).toEqual([3, 4, 5, 6, 7])
    })

    it('should return empty for no matches', () => {
      const s = new SortedSet<number>()
      s.add(1)
      s.add(10)
      expect(s.range(3, 5)).toEqual([])
    })

    it('should handle full range', () => {
      const s = new SortedSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.range(1, 3)).toEqual([1, 2, 3])
    })

    it('should return empty for inverted range', () => {
      const s = new SortedSet<number>()
      s.add(1)
      s.add(2)
      expect(s.range(5, 1)).toEqual([])
    })

    it('should handle single element range', () => {
      const s = new SortedSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.range(2, 2)).toEqual([2])
    })

    it('should handle range on empty set', () => {
      const s = new SortedSet<number>()
      expect(s.range(1, 5)).toEqual([])
    })

    it('should handle range at boundaries', () => {
      const s = new SortedSet<number>()
      s.add(1)
      s.add(5)
      s.add(10)
      expect(s.range(0, 11)).toEqual([1, 5, 10])
    })

    it('should handle range with no matching values in gap', () => {
      const s = new SortedSet<number>()
      s.add(1)
      s.add(10)
      expect(s.range(3, 5)).toEqual([])
    })

    it('should handle range that partially overlaps', () => {
      const s = new SortedSet<number>()
      s.add(1)
      s.add(5)
      s.add(10)
      expect(s.range(3, 7)).toEqual([5])
    })

    it('should handle range outside set values', () => {
      const s = new SortedSet<number>()
      s.add(5)
      s.add(10)
      s.add(15)
      expect(s.range(0, 4)).toEqual([])
      expect(s.range(16, 20)).toEqual([])
    })
  })

  describe('forEach', () => {
    it('should iterate all values in order', () => {
      const s = new SortedSet<number>()
      s.add(3)
      s.add(1)
      s.add(2)
      const result: number[] = []
      s.forEach((v) => result.push(v))
      expect(result).toEqual([1, 2, 3])
    })

    it('should not iterate empty set', () => {
      const s = new SortedSet<number>()
      let count = 0
      s.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('should iterate single element', () => {
      const s = new SortedSet<number>()
      s.add(1)
      const result: number[] = []
      s.forEach((v) => result.push(v))
      expect(result).toEqual([1])
    })
  })

  describe('toArray', () => {
    it('should return sorted array', () => {
      const s = new SortedSet<number>()
      s.add(3)
      s.add(1)
      s.add(2)
      expect(s.toArray()).toEqual([1, 2, 3])
    })

    it('should return empty array for empty set', () => {
      const s = new SortedSet<number>()
      expect(s.toArray()).toEqual([])
    })

    it('should return a copy', () => {
      const s = new SortedSet<number>()
      s.add(1)
      s.add(2)
      const arr = s.toArray()
      arr.push(3)
      expect(s.size).toBe(2)
    })
  })

  describe('size/isEmpty', () => {
    it('should track size through operations', () => {
      const s = new SortedSet<number>()
      expect(s.size).toBe(0)
      s.add(1)
      expect(s.size).toBe(1)
      s.add(2)
      expect(s.size).toBe(2)
      s.add(1)
      expect(s.size).toBe(2)
      s.delete(1)
      expect(s.size).toBe(1)
      s.delete(999)
      expect(s.size).toBe(1)
      s.clear()
      expect(s.size).toBe(0)
    })

    it('isEmpty should reflect state', () => {
      const s = new SortedSet<number>()
      expect(s.isEmpty()).toBe(true)
      s.add(1)
      expect(s.isEmpty()).toBe(false)
      s.delete(1)
      expect(s.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear all entries', () => {
      const s = new SortedSet<number>()
      s.add(1)
      s.add(2)
      s.clear()
      expect(s.isEmpty()).toBe(true)
      expect(s.size).toBe(0)
    })

    it('should allow reuse after clear', () => {
      const s = new SortedSet<number>()
      s.add(1)
      s.clear()
      s.add(2)
      expect(s.size).toBe(1)
      expect(s.has(2)).toBe(true)
    })

    it('should clear empty set without error', () => {
      const s = new SortedSet<number>()
      s.clear()
      expect(s.isEmpty()).toBe(true)
    })
  })

  describe('clone', () => {
    it('should create independent copy', () => {
      const s = new SortedSet<number>()
      s.add(1)
      s.add(2)
      const c = s.clone()
      expect(c.size).toBe(2)
      expect(c.has(1)).toBe(true)
      c.add(3)
      expect(s.size).toBe(2)
      expect(c.size).toBe(3)
    })

    it('should clone empty set', () => {
      const s = new SortedSet<number>()
      const c = s.clone()
      expect(c.isEmpty()).toBe(true)
    })

    it('should preserve comparator', () => {
      const s = new SortedSet<number>({ comparator: (a, b) => b - a })
      s.add(1)
      s.add(2)
      const c = s.clone()
      c.add(3)
      expect(c.toArray()).toEqual([3, 2, 1])
    })

    it('should not affect original when modifying clone', () => {
      const s = new SortedSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      const c = s.clone()
      c.delete(2)
      c.add(4)
      expect(s.size).toBe(3)
      expect(s.has(2)).toBe(true)
      expect(s.has(4)).toBe(false)
      expect(c.size).toBe(3)
      expect(c.has(2)).toBe(false)
      expect(c.has(4)).toBe(true)
    })

    it('should not affect clone when modifying original', () => {
      const s = new SortedSet<number>()
      s.add(1)
      s.add(2)
      const c = s.clone()
      s.delete(1)
      expect(c.has(1)).toBe(true)
      expect(c.size).toBe(2)
    })
  })

  describe('from factory', () => {
    it('should create set from iterable', () => {
      const s = SortedSet.from([3, 1, 2])
      expect(s.size).toBe(3)
      expect(s.toArray()).toEqual([1, 2, 3])
    })

    it('should handle empty iterable', () => {
      const s = SortedSet.from<number>([])
      expect(s.isEmpty()).toBe(true)
    })

    it('should accept custom comparator', () => {
      const s = SortedSet.from([1, 2, 3], { comparator: (a, b) => b - a })
      expect(s.toArray()).toEqual([3, 2, 1])
    })

    it('should handle duplicate values in iterable', () => {
      const s = SortedSet.from([1, 1, 1])
      expect(s.size).toBe(1)
    })

    it('should handle large number of items', () => {
      const items: number[] = []
      for (let i = 0; i < 200; i++) items.push(i)
      const s = SortedSet.from(items)
      expect(s.size).toBe(200)
    })

    it('should handle reverse sorted items', () => {
      const items: number[] = []
      for (let i = 200; i >= 0; i--) items.push(i)
      const s = SortedSet.from(items)
      expect(s.size).toBe(201)
      expect(s.min).toBe(0)
      expect(s.max).toBe(200)
    })

    it('should work with Set as input', () => {
      const s = SortedSet.from(new Set([3, 1, 2]))
      expect(s.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('set operations', () => {
    it('union should combine two sets', () => {
      const a = new SortedSet<number>()
      a.add(1)
      a.add(2)
      const b = new SortedSet<number>()
      b.add(2)
      b.add(3)
      const u = a.union(b)
      expect(u.toArray()).toEqual([1, 2, 3])
    })

    it('union should not modify original sets', () => {
      const a = new SortedSet<number>()
      a.add(1)
      const b = new SortedSet<number>()
      b.add(2)
      a.union(b)
      expect(a.size).toBe(1)
      expect(b.size).toBe(1)
    })

    it('union of set with itself should return clone', () => {
      const a = new SortedSet<number>()
      a.add(1)
      a.add(2)
      const u = a.union(a)
      expect(u.size).toBe(2)
    })

    it('union with empty set should return clone', () => {
      const a = new SortedSet<number>()
      a.add(1)
      const b = new SortedSet<number>()
      const u = a.union(b)
      expect(u.size).toBe(1)
    })

    it('union of two empty sets should return empty', () => {
      const a = new SortedSet<number>()
      const b = new SortedSet<number>()
      expect(a.union(b).isEmpty()).toBe(true)
    })

    it('union should produce sorted result', () => {
      const a = new SortedSet<number>()
      a.add(5)
      a.add(1)
      const b = new SortedSet<number>()
      b.add(3)
      b.add(7)
      expect(a.union(b).toArray()).toEqual([1, 3, 5, 7])
    })

    it('intersection should return common values', () => {
      const a = new SortedSet<number>()
      a.add(1)
      a.add(2)
      a.add(3)
      const b = new SortedSet<number>()
      b.add(2)
      b.add(3)
      b.add(4)
      expect(a.intersection(b).toArray()).toEqual([2, 3])
    })

    it('intersection of set with itself should return clone', () => {
      const a = new SortedSet<number>()
      a.add(1)
      a.add(2)
      expect(a.intersection(a).size).toBe(2)
    })

    it('intersection with empty set should return empty', () => {
      const a = new SortedSet<number>()
      a.add(1)
      const b = new SortedSet<number>()
      expect(a.intersection(b).isEmpty()).toBe(true)
    })

    it('intersection of disjoint sets should return empty', () => {
      const a = new SortedSet<number>()
      a.add(1)
      const b = new SortedSet<number>()
      b.add(2)
      expect(a.intersection(b).isEmpty()).toBe(true)
    })

    it('difference should return values in first but not second', () => {
      const a = new SortedSet<number>()
      a.add(1)
      a.add(2)
      a.add(3)
      const b = new SortedSet<number>()
      b.add(2)
      b.add(4)
      const diff = a.difference(b)
      expect(diff.toArray()).toEqual([1, 3])
    })

    it('difference of set with itself should return empty', () => {
      const a = new SortedSet<number>()
      a.add(1)
      a.add(2)
      expect(a.difference(a).isEmpty()).toBe(true)
    })

    it('difference with empty set should return clone', () => {
      const a = new SortedSet<number>()
      a.add(1)
      const b = new SortedSet<number>()
      expect(a.difference(b).size).toBe(1)
    })

    it('difference of empty set should return empty', () => {
      const a = new SortedSet<number>()
      const b = new SortedSet<number>()
      b.add(1)
      expect(a.difference(b).isEmpty()).toBe(true)
    })

    it('difference should produce sorted result', () => {
      const a = new SortedSet<number>()
      a.add(5)
      a.add(1)
      a.add(3)
      const b = new SortedSet<number>()
      b.add(3)
      expect(a.difference(b).toArray()).toEqual([1, 5])
    })

    it('symmetricDifference should return values in either but not both', () => {
      const a = new SortedSet<number>()
      a.add(1)
      a.add(2)
      a.add(3)
      const b = new SortedSet<number>()
      b.add(2)
      b.add(3)
      b.add(4)
      expect(a.symmetricDifference(b).toArray()).toEqual([1, 4])
    })

    it('symmetricDifference of identical sets should return empty', () => {
      const a = new SortedSet<number>()
      a.add(1)
      a.add(2)
      expect(a.symmetricDifference(a).isEmpty()).toBe(true)
    })

    it('symmetricDifference with empty set should return clone', () => {
      const a = new SortedSet<number>()
      a.add(1)
      const b = new SortedSet<number>()
      expect(a.symmetricDifference(b).toArray()).toEqual([1])
    })

    it('symmetricDifference should produce sorted result', () => {
      const a = new SortedSet<number>()
      a.add(5)
      a.add(1)
      const b = new SortedSet<number>()
      b.add(3)
      b.add(5)
      expect(a.symmetricDifference(b).toArray()).toEqual([1, 3])
    })
  })

  describe('subset/superset/disjoint', () => {
    it('isSubsetOf should return true for subset', () => {
      const a = new SortedSet<number>()
      a.add(1)
      a.add(2)
      const b = new SortedSet<number>()
      b.add(1)
      b.add(2)
      b.add(3)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('isSubsetOf should return false for non-subset', () => {
      const a = new SortedSet<number>()
      a.add(1)
      a.add(4)
      const b = new SortedSet<number>()
      b.add(1)
      b.add(2)
      b.add(3)
      expect(a.isSubsetOf(b)).toBe(false)
    })

    it('isSubsetOf should return true for equal sets', () => {
      const a = new SortedSet<number>()
      a.add(1)
      a.add(2)
      const b = new SortedSet<number>()
      b.add(1)
      b.add(2)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('empty set is subset of any set', () => {
      const a = new SortedSet<number>()
      const b = new SortedSet<number>()
      b.add(1)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('empty set is subset of empty set', () => {
      const a = new SortedSet<number>()
      const b = new SortedSet<number>()
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('isSupersetOf should return true for superset', () => {
      const a = new SortedSet<number>()
      a.add(1)
      a.add(2)
      a.add(3)
      const b = new SortedSet<number>()
      b.add(1)
      b.add(2)
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('isSupersetOf should return false for non-superset', () => {
      const a = new SortedSet<number>()
      a.add(1)
      a.add(2)
      const b = new SortedSet<number>()
      b.add(1)
      b.add(2)
      b.add(3)
      expect(a.isSupersetOf(b)).toBe(false)
    })

    it('isDisjointFrom should return true for disjoint sets', () => {
      const a = new SortedSet<number>()
      a.add(1)
      a.add(2)
      const b = new SortedSet<number>()
      b.add(3)
      b.add(4)
      expect(a.isDisjointFrom(b)).toBe(true)
    })

    it('isDisjointFrom should return false for overlapping sets', () => {
      const a = new SortedSet<number>()
      a.add(1)
      a.add(2)
      const b = new SortedSet<number>()
      b.add(2)
      b.add(3)
      expect(a.isDisjointFrom(b)).toBe(false)
    })

    it('empty set is disjoint from any set', () => {
      const a = new SortedSet<number>()
      const b = new SortedSet<number>()
      b.add(1)
      expect(a.isDisjointFrom(b)).toBe(true)
    })

    it('empty set is disjoint from empty set', () => {
      const a = new SortedSet<number>()
      const b = new SortedSet<number>()
      expect(a.isDisjointFrom(b)).toBe(true)
    })
  })

  describe('indexOf', () => {
    it('should return index of existing value', () => {
      const s = new SortedSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.indexOf(1)).toBe(0)
      expect(s.indexOf(2)).toBe(1)
      expect(s.indexOf(3)).toBe(2)
    })

    it('should return -1 for missing value', () => {
      const s = new SortedSet<number>()
      s.add(1)
      s.add(3)
      expect(s.indexOf(2)).toBe(-1)
    })

    it('should return -1 for empty set', () => {
      const s = new SortedSet<number>()
      expect(s.indexOf(1)).toBe(-1)
    })

    it('should return correct index after modifications', () => {
      const s = new SortedSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(2)
      expect(s.indexOf(1)).toBe(0)
      expect(s.indexOf(3)).toBe(1)
      expect(s.indexOf(2)).toBe(-1)
    })
  })

  describe('atIndex', () => {
    it('should return value at given index', () => {
      const s = new SortedSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.atIndex(0)).toBe(1)
      expect(s.atIndex(1)).toBe(2)
      expect(s.atIndex(2)).toBe(3)
    })

    it('should return undefined for out of bounds index', () => {
      const s = new SortedSet<number>()
      s.add(1)
      expect(s.atIndex(-1)).toBeUndefined()
      expect(s.atIndex(1)).toBeUndefined()
    })

    it('should return undefined for empty set', () => {
      const s = new SortedSet<number>()
      expect(s.atIndex(0)).toBeUndefined()
    })

    it('should return correct values after modifications', () => {
      const s = new SortedSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(2)
      expect(s.atIndex(0)).toBe(1)
      expect(s.atIndex(1)).toBe(3)
    })
  })

  describe('edge cases', () => {
    it('should handle single element', () => {
      const s = new SortedSet<number>()
      s.add(42)
      expect(s.size).toBe(1)
      expect(s.min).toBe(42)
      expect(s.max).toBe(42)
      expect(s.has(42)).toBe(true)
    })

    it('should handle zero as value', () => {
      const s = new SortedSet<number>()
      s.add(0)
      expect(s.has(0)).toBe(true)
      expect(s.min).toBe(0)
    })

    it('should handle empty string as value', () => {
      const s = new SortedSet<string>()
      s.add('')
      expect(s.has('')).toBe(true)
      expect(s.min).toBe('')
    })

    it('should handle sorted insert', () => {
      const s = new SortedSet<number>()
      for (let i = 0; i < 100; i++) s.add(i)
      expect(s.size).toBe(100)
      assertSorted(s)
    })

    it('should handle reverse sorted insert', () => {
      const s = new SortedSet<number>()
      for (let i = 99; i >= 0; i--) s.add(i)
      expect(s.size).toBe(100)
      assertSorted(s)
    })

    it('should handle alternating insert pattern', () => {
      const s = new SortedSet<number>()
      for (let i = 0; i < 50; i++) {
        s.add(i)
        s.add(99 - i)
      }
      expect(s.size).toBe(100)
      assertSorted(s)
    })
  })

  describe('large sets', () => {
    it('should handle 10000+ elements', () => {
      const s = new SortedSet<number>()
      for (let i = 0; i < 10000; i++) s.add(i)
      expect(s.size).toBe(10000)
      expect(s.min).toBe(0)
      expect(s.max).toBe(9999)
    })

    it('should handle 10000+ reverse order insertions', () => {
      const s = new SortedSet<number>()
      for (let i = 10000; i >= 0; i--) s.add(i)
      expect(s.size).toBe(10001)
      assertSorted(s)
    })

    it('should handle 10000 insertions and deletions', () => {
      const s = new SortedSet<number>()
      for (let i = 0; i < 10000; i++) s.add(i)
      for (let i = 0; i < 5000; i++) s.delete(i)
      expect(s.size).toBe(5000)
      assertSorted(s)
    })

    it('should handle large random operations', () => {
      const s = new SortedSet<number>()
      const reference = new Set<number>()
      for (let i = 0; i < 5000; i++) {
        const key = Math.floor(Math.random() * 1000)
        const op = Math.random()
        if (op < 0.7) {
          s.add(key)
          reference.add(key)
        } else {
          s.delete(key)
          reference.delete(key)
        }
      }
      expect(s.size).toBe(reference.size)
      for (const k of reference) {
        expect(s.has(k)).toBe(true)
      }
    })

    it('should handle large scale insert then delete all', () => {
      const s = new SortedSet<number>()
      for (let i = 0; i < 5000; i++) s.add(i)
      for (let i = 0; i < 5000; i++) s.delete(i)
      expect(s.isEmpty()).toBe(true)
    })

    it('should handle large scale deduplication', () => {
      const s = new SortedSet<number>()
      for (let i = 0; i < 10000; i++) s.add(i % 100)
      expect(s.size).toBe(100)
    })

    it('should handle large from factory', () => {
      const items: number[] = []
      for (let i = 0; i < 10000; i++) items.push(i)
      const s = SortedSet.from(items)
      expect(s.size).toBe(10000)
    })

    it('should handle large union', () => {
      const a = new SortedSet<number>()
      const b = new SortedSet<number>()
      for (let i = 0; i < 5000; i++) a.add(i)
      for (let i = 3000; i < 8000; i++) b.add(i)
      const u = a.union(b)
      expect(u.size).toBe(8000)
    })

    it('should handle large intersection', () => {
      const a = new SortedSet<number>()
      const b = new SortedSet<number>()
      for (let i = 0; i < 5000; i++) a.add(i)
      for (let i = 3000; i < 8000; i++) b.add(i)
      const inter = a.intersection(b)
      expect(inter.size).toBe(2000)
    })
  })

  describe('stats', () => {
    it('should return correct stats for empty set', () => {
      const s = new SortedSet<number>()
      const stats = s.stats()
      expect(stats.size).toBe(0)
      expect(stats.min).toBeUndefined()
      expect(stats.max).toBeUndefined()
    })

    it('should return correct stats for single element', () => {
      const s = new SortedSet<number>()
      s.add(1)
      const stats = s.stats()
      expect(stats.size).toBe(1)
      expect(stats.min).toBe(1)
      expect(stats.max).toBe(1)
    })

    it('should return correct stats after modifications', () => {
      const s = new SortedSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      let stats = s.stats()
      expect(stats.size).toBe(3)
      expect(stats.min).toBe(1)
      expect(stats.max).toBe(3)
      s.delete(1)
      stats = s.stats()
      expect(stats.size).toBe(2)
      expect(stats.min).toBe(2)
    })

    it('should return correct stats for large set', () => {
      const s = new SortedSet<number>()
      for (let i = 0; i < 1000; i++) s.add(i)
      const stats = s.stats()
      expect(stats.size).toBe(1000)
      expect(stats.min).toBe(0)
      expect(stats.max).toBe(999)
    })
  })

  describe('Symbol.iterator', () => {
    it('should iterate in sorted order', () => {
      const s = new SortedSet<number>()
      s.add(3)
      s.add(1)
      s.add(2)
      expect([...s]).toEqual([1, 2, 3])
    })

    it('should iterate empty set', () => {
      const s = new SortedSet<number>()
      expect([...s]).toEqual([])
    })

    it('should work with for of', () => {
      const s = new SortedSet<number>()
      s.add(1)
      s.add(2)
      const result: number[] = []
      for (const v of s) {
        result.push(v)
      }
      expect(result).toEqual([1, 2])
    })
  })

  describe('set operations with custom comparator', () => {
    it('union should work with reverse comparator', () => {
      const cmp = (a: number, b: number) => b - a
      const a = new SortedSet<number>({ comparator: cmp })
      a.add(1)
      a.add(2)
      const b = new SortedSet<number>({ comparator: cmp })
      b.add(2)
      b.add(3)
      expect(a.union(b).toArray()).toEqual([3, 2, 1])
    })

    it('intersection should work with reverse comparator', () => {
      const cmp = (a: number, b: number) => b - a
      const a = new SortedSet<number>({ comparator: cmp })
      a.add(1)
      a.add(2)
      a.add(3)
      const b = new SortedSet<number>({ comparator: cmp })
      b.add(2)
      b.add(3)
      b.add(4)
      expect(a.intersection(b).toArray()).toEqual([3, 2])
    })
  })
})
