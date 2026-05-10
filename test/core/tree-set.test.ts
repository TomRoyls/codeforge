import { describe, it, expect, beforeEach } from 'vitest'
import { TreeSet } from '../../src/core/tree-set/tree-set.js'
import type { TreeSetOptions, TreeSetStats, TreeSetCompareFunction } from '../../src/core/tree-set/types.js'

describe('TreeSet', () => {
  let set: TreeSet<number>

  beforeEach(() => {
    set = new TreeSet<number>()
  })

  describe('construction', () => {
    it('should create empty set with no arguments', () => {
      const s = new TreeSet<number>()
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('should accept custom comparator via options', () => {
      const s = new TreeSet<string>({ compare: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()) })
      s.add('Hello')
      s.add('hello')
      expect(s.size).toBe(1)
    })

    it('should use default comparator for numbers', () => {
      const s = new TreeSet<number>()
      s.add(3)
      s.add(1)
      s.add(2)
      expect(s.toArray()).toEqual([1, 2, 3])
    })

    it('should use default comparator for strings', () => {
      const s = new TreeSet<string>()
      s.add('c')
      s.add('a')
      s.add('b')
      expect(s.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('should accept empty options object', () => {
      const s = new TreeSet<number>({})
      s.add(1)
      expect(s.size).toBe(1)
    })
  })

  describe('add', () => {
    it('should add a single element', () => {
      expect(set.add(1)).toBe(true)
      expect(set.size).toBe(1)
      expect(set.has(1)).toBe(true)
    })

    it('should add multiple elements', () => {
      set.add(1)
      set.add(2)
      set.add(3)
      expect(set.size).toBe(3)
    })

    it('should reject duplicates', () => {
      expect(set.add(1)).toBe(true)
      expect(set.add(1)).toBe(false)
      expect(set.size).toBe(1)
    })

    it('should reject duplicate after many adds', () => {
      set.add(1)
      set.add(2)
      set.add(3)
      expect(set.add(2)).toBe(false)
      expect(set.size).toBe(3)
    })

    it('should maintain sorted order', () => {
      set.add(5)
      set.add(3)
      set.add(7)
      set.add(1)
      set.add(9)
      expect(set.toArray()).toEqual([1, 3, 5, 7, 9])
    })

    it('should handle negative values', () => {
      set.add(-5)
      set.add(0)
      set.add(5)
      expect(set.toArray()).toEqual([-5, 0, 5])
    })

    it('should handle zero', () => {
      set.add(0)
      expect(set.has(0)).toBe(true)
      expect(set.size).toBe(1)
    })

    it('should return true for new unique elements', () => {
      expect(set.add(10)).toBe(true)
      expect(set.add(20)).toBe(true)
      expect(set.add(30)).toBe(true)
    })

    it('should handle strings', () => {
      const s = new TreeSet<string>()
      s.add('banana')
      s.add('apple')
      s.add('cherry')
      expect(s.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })
  })

  describe('delete', () => {
    it('should delete an existing element', () => {
      set.add(1)
      expect(set.delete(1)).toBe(true)
      expect(set.has(1)).toBe(false)
      expect(set.size).toBe(0)
    })

    it('should return false for non-existing element', () => {
      expect(set.delete(99)).toBe(false)
    })

    it('should return false for empty set', () => {
      expect(set.delete(1)).toBe(false)
    })

    it('should delete from larger set', () => {
      set.add(5)
      set.add(3)
      set.add(7)
      set.add(1)
      set.add(9)
      expect(set.delete(3)).toBe(true)
      expect(set.size).toBe(4)
      expect(set.has(3)).toBe(false)
    })

    it('should delete all elements sequentially', () => {
      const values = [5, 3, 7, 1, 9, 4, 6, 8]
      for (const v of values) set.add(v)
      for (const v of values) {
        expect(set.delete(v)).toBe(true)
      }
      expect(set.size).toBe(0)
      expect(set.isEmpty()).toBe(true)
    })

    it('should handle deleting root', () => {
      set.add(5)
      set.add(3)
      set.add(7)
      expect(set.delete(5)).toBe(true)
      expect(set.has(5)).toBe(false)
      expect(set.size).toBe(2)
    })

    it('should handle deleting leaf', () => {
      set.add(5)
      set.add(3)
      expect(set.delete(3)).toBe(true)
      expect(set.has(3)).toBe(false)
    })

    it('should handle deleting node with one child', () => {
      set.add(10)
      set.add(5)
      set.add(15)
      set.add(3)
      set.delete(5)
      expect(set.size).toBe(3)
      expect(set.has(3)).toBe(true)
    })

    it('should handle deleting node with two children', () => {
      set.add(10)
      set.add(5)
      set.add(15)
      set.add(3)
      set.add(7)
      set.delete(5)
      expect(set.size).toBe(4)
      expect(set.has(3)).toBe(true)
      expect(set.has(7)).toBe(true)
    })

    it('should maintain BST ordering after deletions', () => {
      for (let i = 1; i <= 20; i++) set.add(i)
      for (let i = 1; i <= 10; i++) set.delete(i)
      const arr = set.toArray()
      const sorted = [...arr].sort((a, b) => a - b)
      expect(arr).toEqual(sorted)
    })

    it('should handle reinserting deleted values', () => {
      set.add(10)
      set.add(5)
      set.delete(10)
      set.add(10)
      expect(set.has(10)).toBe(true)
      expect(set.size).toBe(2)
    })

    it('should handle deleting down to empty', () => {
      set.add(1)
      set.add(2)
      set.delete(1)
      set.delete(2)
      expect(set.isEmpty()).toBe(true)
    })
  })

  describe('has', () => {
    it('should return true for existing element', () => {
      set.add(1)
      expect(set.has(1)).toBe(true)
    })

    it('should return false for non-existing element', () => {
      expect(set.has(1)).toBe(false)
    })

    it('should return false for empty set', () => {
      expect(set.has(1)).toBe(false)
    })

    it('should return false after deletion', () => {
      set.add(1)
      set.delete(1)
      expect(set.has(1)).toBe(false)
    })

    it('should return true for multiple elements', () => {
      set.add(1)
      set.add(2)
      set.add(3)
      expect(set.has(1)).toBe(true)
      expect(set.has(2)).toBe(true)
      expect(set.has(3)).toBe(true)
      expect(set.has(4)).toBe(false)
    })
  })

  describe('min/max', () => {
    it('should return undefined for empty set', () => {
      expect(set.min).toBeUndefined()
      expect(set.max).toBeUndefined()
    })

    it('should return single element for single-element set', () => {
      set.add(5)
      expect(set.min).toBe(5)
      expect(set.max).toBe(5)
    })

    it('should return correct min and max', () => {
      set.add(5)
      set.add(3)
      set.add(7)
      set.add(1)
      set.add(9)
      expect(set.min).toBe(1)
      expect(set.max).toBe(9)
    })

    it('should update after deletion of min', () => {
      set.add(1)
      set.add(5)
      set.add(10)
      set.delete(1)
      expect(set.min).toBe(5)
    })

    it('should update after deletion of max', () => {
      set.add(1)
      set.add(5)
      set.add(10)
      set.delete(10)
      expect(set.max).toBe(5)
    })

    it('should work with negative values', () => {
      set.add(-10)
      set.add(0)
      set.add(10)
      expect(set.min).toBe(-10)
      expect(set.max).toBe(10)
    })
  })

  describe('lowerBound', () => {
    beforeEach(() => {
      set.add(5)
      set.add(3)
      set.add(7)
      set.add(1)
      set.add(9)
    })

    it('should find exact value', () => {
      expect(set.lowerBound(5)).toBe(5)
    })

    it('should find next greater when value not present', () => {
      expect(set.lowerBound(4)).toBe(5)
    })

    it('should find exact min', () => {
      expect(set.lowerBound(1)).toBe(1)
    })

    it('should return undefined when value above max', () => {
      expect(set.lowerBound(10)).toBeUndefined()
    })

    it('should return undefined for empty set', () => {
      const empty = new TreeSet<number>()
      expect(empty.lowerBound(1)).toBeUndefined()
    })

    it('should return min for value below all', () => {
      expect(set.lowerBound(0)).toBe(1)
    })
  })

  describe('upperBound', () => {
    beforeEach(() => {
      set.add(5)
      set.add(3)
      set.add(7)
      set.add(1)
      set.add(9)
    })

    it('should find next greater for exact value', () => {
      expect(set.upperBound(5)).toBe(7)
    })

    it('should find next greater when value not present', () => {
      expect(set.upperBound(4)).toBe(5)
    })

    it('should return undefined when value at max', () => {
      expect(set.upperBound(9)).toBeUndefined()
    })

    it('should return undefined for empty set', () => {
      const empty = new TreeSet<number>()
      expect(empty.upperBound(1)).toBeUndefined()
    })

    it('should return min for value below all', () => {
      expect(set.upperBound(0)).toBe(1)
    })

    it('should return undefined for value above max', () => {
      expect(set.upperBound(10)).toBeUndefined()
    })
  })

  describe('range', () => {
    beforeEach(() => {
      for (let i = 1; i <= 10; i++) set.add(i)
    })

    it('should return values in inclusive range', () => {
      expect(set.range(3, 7)).toEqual([3, 4, 5, 6, 7])
    })

    it('should return single element range', () => {
      expect(set.range(5, 5)).toEqual([5])
    })

    it('should return empty range when lower > upper', () => {
      expect(set.range(7, 3)).toEqual([])
    })

    it('should return full range', () => {
      expect(set.range(1, 10).length).toBe(10)
    })

    it('should handle range with non-existent bounds', () => {
      expect(set.range(2, 8)).toEqual([2, 3, 4, 5, 6, 7, 8])
    })

    it('should handle range outside set bounds', () => {
      expect(set.range(0, 20).length).toBe(10)
    })

    it('should handle range with no matches', () => {
      expect(set.range(20, 30)).toEqual([])
    })

    it('should handle range on empty set', () => {
      const empty = new TreeSet<number>()
      expect(empty.range(1, 10)).toEqual([])
    })

    it('should handle range on single element set', () => {
      const single = new TreeSet<number>()
      single.add(5)
      expect(single.range(1, 10)).toEqual([5])
      expect(single.range(5, 5)).toEqual([5])
      expect(single.range(6, 10)).toEqual([])
    })
  })

  describe('forEach', () => {
    it('should iterate in sorted order', () => {
      set.add(3)
      set.add(1)
      set.add(2)
      const collected: number[] = []
      set.forEach((v) => collected.push(v))
      expect(collected).toEqual([1, 2, 3])
    })

    it('should not call callback for empty set', () => {
      let called = false
      set.forEach(() => { called = true })
      expect(called).toBe(false)
    })

    it('should visit all elements', () => {
      for (let i = 0; i < 20; i++) set.add(i)
      let count = 0
      set.forEach(() => count++)
      expect(count).toBe(20)
    })
  })

  describe('toArray', () => {
    it('should return sorted array', () => {
      set.add(5)
      set.add(3)
      set.add(7)
      set.add(1)
      set.add(9)
      expect(set.toArray()).toEqual([1, 3, 5, 7, 9])
    })

    it('should return empty array for empty set', () => {
      expect(set.toArray()).toEqual([])
    })

    it('should return single element array', () => {
      set.add(5)
      expect(set.toArray()).toEqual([5])
    })
  })

  describe('size/isEmpty', () => {
    it('should return 0 for empty set', () => {
      expect(set.size).toBe(0)
    })

    it('should return correct count after additions', () => {
      set.add(1)
      expect(set.size).toBe(1)
      set.add(2)
      expect(set.size).toBe(2)
    })

    it('should decrease after deletion', () => {
      set.add(1)
      set.add(2)
      set.delete(1)
      expect(set.size).toBe(1)
    })

    it('should not change for duplicate add', () => {
      set.add(1)
      set.add(1)
      expect(set.size).toBe(1)
    })

    it('isEmpty should return true for empty set', () => {
      expect(set.isEmpty()).toBe(true)
    })

    it('isEmpty should return false after insertion', () => {
      set.add(1)
      expect(set.isEmpty()).toBe(false)
    })

    it('isEmpty should return true after deleting all', () => {
      set.add(1)
      set.delete(1)
      expect(set.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear all elements', () => {
      set.add(1)
      set.add(2)
      set.add(3)
      set.clear()
      expect(set.size).toBe(0)
      expect(set.isEmpty()).toBe(true)
      expect(set.has(1)).toBe(false)
    })

    it('should handle clearing empty set', () => {
      set.clear()
      expect(set.size).toBe(0)
    })

    it('should allow operations after clear', () => {
      set.add(1)
      set.clear()
      set.add(2)
      expect(set.size).toBe(1)
      expect(set.has(1)).toBe(false)
      expect(set.has(2)).toBe(true)
    })
  })

  describe('clone', () => {
    it('should create independent copy', () => {
      set.add(1)
      set.add(2)
      set.add(3)
      const cloned = set.clone()
      expect(cloned.size).toBe(3)
      expect(cloned.has(1)).toBe(true)
      expect(cloned.has(2)).toBe(true)
      expect(cloned.has(3)).toBe(true)
    })

    it('should be independent from original', () => {
      set.add(1)
      set.add(2)
      const cloned = set.clone()
      cloned.delete(1)
      cloned.add(99)
      expect(set.has(1)).toBe(true)
      expect(set.has(99)).toBe(false)
      expect(cloned.has(1)).toBe(false)
      expect(cloned.has(99)).toBe(true)
    })

    it('should clone empty set', () => {
      const cloned = set.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should preserve comparator', () => {
      const s = new TreeSet<number>({ compare: (a, b) => b - a })
      s.add(1)
      s.add(2)
      s.add(3)
      const cloned = s.clone()
      expect(cloned.toArray()).toEqual([3, 2, 1])
    })
  })

  describe('from factory', () => {
    it('should create set from array', () => {
      const s = TreeSet.from([5, 3, 7, 1, 9])
      expect(s.size).toBe(5)
      expect(s.toArray()).toEqual([1, 3, 5, 7, 9])
    })

    it('should create set with custom comparator', () => {
      const s = TreeSet.from(['b', 'a', 'c'], {
        compare: (a, b) => b.localeCompare(a),
      })
      expect(s.toArray()).toEqual(['c', 'b', 'a'])
    })

    it('should handle empty iterable', () => {
      const s = TreeSet.from<number>([])
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('should handle duplicate values', () => {
      const s = TreeSet.from([1, 2, 1, 3, 2])
      expect(s.size).toBe(3)
      expect(s.toArray()).toEqual([1, 2, 3])
    })

    it('should handle Set as input', () => {
      const s = TreeSet.from(new Set([3, 1, 2]))
      expect(s.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('union', () => {
    it('should return union of two sets', () => {
      set.add(1)
      set.add(2)
      set.add(3)
      const other = new TreeSet<number>()
      other.add(3)
      other.add(4)
      other.add(5)
      const result = set.union(other)
      expect(result.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('should return copy when no overlap', () => {
      set.add(1)
      set.add(2)
      const other = new TreeSet<number>()
      other.add(3)
      other.add(4)
      const result = set.union(other)
      expect(result.toArray()).toEqual([1, 2, 3, 4])
    })

    it('should handle union with empty set', () => {
      set.add(1)
      set.add(2)
      const other = new TreeSet<number>()
      const result = set.union(other)
      expect(result.toArray()).toEqual([1, 2])
    })

    it('should not modify original sets', () => {
      set.add(1)
      const other = new TreeSet<number>()
      other.add(2)
      set.union(other)
      expect(set.size).toBe(1)
      expect(other.size).toBe(1)
    })
  })

  describe('intersection', () => {
    it('should return intersection of two sets', () => {
      set.add(1)
      set.add(2)
      set.add(3)
      const other = new TreeSet<number>()
      other.add(2)
      other.add(3)
      other.add(4)
      const result = set.intersection(other)
      expect(result.toArray()).toEqual([2, 3])
    })

    it('should return empty when no overlap', () => {
      set.add(1)
      set.add(2)
      const other = new TreeSet<number>()
      other.add(3)
      other.add(4)
      const result = set.intersection(other)
      expect(result.isEmpty()).toBe(true)
    })

    it('should handle intersection with empty set', () => {
      set.add(1)
      const other = new TreeSet<number>()
      const result = set.intersection(other)
      expect(result.isEmpty()).toBe(true)
    })

    it('should return identical set for same sets', () => {
      set.add(1)
      set.add(2)
      set.add(3)
      const other = new TreeSet<number>()
      other.add(1)
      other.add(2)
      other.add(3)
      const result = set.intersection(other)
      expect(result.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('difference', () => {
    it('should return difference of two sets', () => {
      set.add(1)
      set.add(2)
      set.add(3)
      const other = new TreeSet<number>()
      other.add(2)
      other.add(4)
      const result = set.difference(other)
      expect(result.toArray()).toEqual([1, 3])
    })

    it('should return copy when no overlap', () => {
      set.add(1)
      set.add(2)
      const other = new TreeSet<number>()
      other.add(3)
      other.add(4)
      const result = set.difference(other)
      expect(result.toArray()).toEqual([1, 2])
    })

    it('should return empty when all elements in other', () => {
      set.add(1)
      set.add(2)
      const other = new TreeSet<number>()
      other.add(1)
      other.add(2)
      other.add(3)
      const result = set.difference(other)
      expect(result.isEmpty()).toBe(true)
    })
  })

  describe('symmetricDifference', () => {
    it('should return symmetric difference', () => {
      set.add(1)
      set.add(2)
      set.add(3)
      const other = new TreeSet<number>()
      other.add(2)
      other.add(3)
      other.add(4)
      const result = set.symmetricDifference(other)
      expect(result.toArray()).toEqual([1, 4])
    })

    it('should return union when no overlap', () => {
      set.add(1)
      set.add(2)
      const other = new TreeSet<number>()
      other.add(3)
      other.add(4)
      const result = set.symmetricDifference(other)
      expect(result.toArray()).toEqual([1, 2, 3, 4])
    })

    it('should return empty for identical sets', () => {
      set.add(1)
      set.add(2)
      const other = new TreeSet<number>()
      other.add(1)
      other.add(2)
      const result = set.symmetricDifference(other)
      expect(result.isEmpty()).toBe(true)
    })
  })

  describe('isSubsetOf', () => {
    it('should return true for subset', () => {
      set.add(1)
      set.add(2)
      const other = new TreeSet<number>()
      other.add(1)
      other.add(2)
      other.add(3)
      expect(set.isSubsetOf(other)).toBe(true)
    })

    it('should return false for non-subset', () => {
      set.add(1)
      set.add(2)
      set.add(3)
      const other = new TreeSet<number>()
      other.add(1)
      other.add(2)
      expect(set.isSubsetOf(other)).toBe(false)
    })

    it('should return true for equal sets', () => {
      set.add(1)
      set.add(2)
      const other = new TreeSet<number>()
      other.add(1)
      other.add(2)
      expect(set.isSubsetOf(other)).toBe(true)
    })

    it('should return true for empty set', () => {
      const other = new TreeSet<number>()
      other.add(1)
      expect(set.isSubsetOf(other)).toBe(true)
    })

    it('should return false for empty other', () => {
      set.add(1)
      const other = new TreeSet<number>()
      expect(set.isSubsetOf(other)).toBe(false)
    })
  })

  describe('isSupersetOf', () => {
    it('should return true for superset', () => {
      set.add(1)
      set.add(2)
      set.add(3)
      const other = new TreeSet<number>()
      other.add(1)
      other.add(2)
      expect(set.isSupersetOf(other)).toBe(true)
    })

    it('should return false for non-superset', () => {
      set.add(1)
      set.add(2)
      const other = new TreeSet<number>()
      other.add(1)
      other.add(2)
      other.add(3)
      expect(set.isSupersetOf(other)).toBe(false)
    })

    it('should return true for equal sets', () => {
      set.add(1)
      set.add(2)
      const other = new TreeSet<number>()
      other.add(1)
      other.add(2)
      expect(set.isSupersetOf(other)).toBe(true)
    })

    it('should return true for empty other', () => {
      set.add(1)
      const other = new TreeSet<number>()
      expect(set.isSupersetOf(other)).toBe(true)
    })
  })

  describe('predecessor', () => {
    beforeEach(() => {
      set.add(1)
      set.add(3)
      set.add(5)
      set.add(7)
      set.add(9)
    })

    it('should return predecessor of existing element', () => {
      expect(set.predecessor(5)).toBe(3)
    })

    it('should return predecessor of non-existing element', () => {
      expect(set.predecessor(6)).toBe(5)
    })

    it('should return undefined for smallest element', () => {
      expect(set.predecessor(1)).toBeUndefined()
    })

    it('should return undefined for value below all', () => {
      expect(set.predecessor(0)).toBeUndefined()
    })

    it('should return undefined for empty set', () => {
      const empty = new TreeSet<number>()
      expect(empty.predecessor(1)).toBeUndefined()
    })

    it('should find predecessor for value above max', () => {
      expect(set.predecessor(10)).toBe(9)
    })
  })

  describe('successor', () => {
    beforeEach(() => {
      set.add(1)
      set.add(3)
      set.add(5)
      set.add(7)
      set.add(9)
    })

    it('should return successor of existing element', () => {
      expect(set.successor(5)).toBe(7)
    })

    it('should return successor of non-existing element', () => {
      expect(set.successor(4)).toBe(5)
    })

    it('should return undefined for largest element', () => {
      expect(set.successor(9)).toBeUndefined()
    })

    it('should return undefined for value above all', () => {
      expect(set.successor(10)).toBeUndefined()
    })

    it('should return undefined for empty set', () => {
      const empty = new TreeSet<number>()
      expect(empty.successor(1)).toBeUndefined()
    })

    it('should find successor for value below min', () => {
      expect(set.successor(0)).toBe(1)
    })
  })

  describe('rank', () => {
    beforeEach(() => {
      set.add(10)
      set.add(20)
      set.add(30)
      set.add(40)
      set.add(50)
    })

    it('should return correct rank for existing elements', () => {
      expect(set.rank(10)).toBe(0)
      expect(set.rank(20)).toBe(1)
      expect(set.rank(30)).toBe(2)
      expect(set.rank(40)).toBe(3)
      expect(set.rank(50)).toBe(4)
    })

    it('should return -1 for non-existing element', () => {
      expect(set.rank(25)).toBe(-1)
    })

    it('should return -1 for empty set', () => {
      const empty = new TreeSet<number>()
      expect(empty.rank(1)).toBe(-1)
    })

    it('should return 0 for minimum element', () => {
      expect(set.rank(10)).toBe(0)
    })

    it('should return size-1 for maximum element', () => {
      expect(set.rank(50)).toBe(4)
    })
  })

  describe('atIndex', () => {
    beforeEach(() => {
      set.add(10)
      set.add(20)
      set.add(30)
      set.add(40)
      set.add(50)
    })

    it('should return element at index 0', () => {
      expect(set.atIndex(0)).toBe(10)
    })

    it('should return element at last index', () => {
      expect(set.atIndex(4)).toBe(50)
    })

    it('should return element at middle index', () => {
      expect(set.atIndex(2)).toBe(30)
    })

    it('should throw for negative index', () => {
      expect(() => set.atIndex(-1)).toThrow(RangeError)
    })

    it('should throw for out of bounds index', () => {
      expect(() => set.atIndex(5)).toThrow(RangeError)
    })

    it('should throw for empty set', () => {
      const empty = new TreeSet<number>()
      expect(() => empty.atIndex(0)).toThrow(RangeError)
    })

    it('should return all elements in order via iteration', () => {
      const result: number[] = []
      for (let i = 0; i < set.size; i++) {
        result.push(set.atIndex(i))
      }
      expect(result).toEqual([10, 20, 30, 40, 50])
    })
  })

  describe('stats', () => {
    it('should return correct stats for empty set', () => {
      const s = set.stats
      expect(s.nodeCount).toBe(0)
      expect(s.height).toBe(0)
      expect(s.minValue).toBeNull()
      expect(s.maxValue).toBeNull()
    })

    it('should return correct stats for single element', () => {
      set.add(5)
      const s = set.stats
      expect(s.nodeCount).toBe(1)
      expect(s.height).toBe(1)
      expect(s.minValue).toBe(5)
      expect(s.maxValue).toBe(5)
    })

    it('should return correct stats for multiple elements', () => {
      for (let i = 1; i <= 10; i++) set.add(i)
      const s = set.stats
      expect(s.nodeCount).toBe(10)
      expect(s.height).toBeGreaterThan(0)
      expect(s.isBalanced).toBe(true)
      expect(s.minValue).toBe(1)
      expect(s.maxValue).toBe(10)
    })

    it('should report isBalanced for balanced tree', () => {
      for (let i = 0; i < 100; i++) set.add(i)
      expect(set.stats.isBalanced).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle empty set operations gracefully', () => {
      expect(set.delete(1)).toBe(false)
      expect(set.has(1)).toBe(false)
      expect(set.min).toBeUndefined()
      expect(set.max).toBeUndefined()
      expect(set.lowerBound(1)).toBeUndefined()
      expect(set.upperBound(1)).toBeUndefined()
      expect(set.range(1, 10)).toEqual([])
      expect(set.toArray()).toEqual([])
    })

    it('should handle single element', () => {
      set.add(1)
      expect(set.size).toBe(1)
      expect(set.min).toBe(1)
      expect(set.max).toBe(1)
      expect(set.delete(1)).toBe(true)
      expect(set.isEmpty()).toBe(true)
    })

    it('should handle sorted insert (worst case for naive BST)', () => {
      for (let i = 0; i < 100; i++) set.add(i)
      expect(set.size).toBe(100)
      expect(set.min).toBe(0)
      expect(set.max).toBe(99)
      expect(set.stats.isBalanced).toBe(true)
    })

    it('should handle reverse sorted insert', () => {
      for (let i = 100; i >= 0; i--) set.add(i)
      expect(set.size).toBe(101)
      expect(set.min).toBe(0)
      expect(set.max).toBe(100)
      expect(set.stats.isBalanced).toBe(true)
    })

    it('should handle insert delete cycles', () => {
      for (let cycle = 0; cycle < 5; cycle++) {
        for (let i = 0; i < 20; i++) set.add(i)
        for (let i = 0; i < 20; i++) set.delete(i)
        expect(set.isEmpty()).toBe(true)
      }
    })

    it('should handle two elements', () => {
      set.add(1)
      set.add(2)
      expect(set.size).toBe(2)
      expect(set.toArray()).toEqual([1, 2])
    })
  })

  describe('Symbol.iterator', () => {
    it('should iterate in sorted order', () => {
      set.add(3)
      set.add(1)
      set.add(2)
      const collected: number[] = []
      for (const v of set) {
        collected.push(v)
      }
      expect(collected).toEqual([1, 2, 3])
    })

    it('should work with spread operator', () => {
      set.add(1)
      set.add(2)
      const arr = [...set]
      expect(arr).toEqual([1, 2])
    })

    it('should handle empty set iteration', () => {
      const arr = [...set]
      expect(arr).toEqual([])
    })
  })

  describe('type exports', () => {
    it('should support TreeSetOptions type', () => {
      const opts: TreeSetOptions<number> = {
        compare: (a, b) => a - b,
      }
      expect(opts.compare).toBeDefined()
    })

    it('should support TreeSetStats type', () => {
      const s: TreeSetStats = {
        nodeCount: 0,
        height: 0,
        isBalanced: true,
        minValue: null,
        maxValue: null,
      }
      expect(s.nodeCount).toBe(0)
    })

    it('should support TreeSetCompareFunction type', () => {
      const cmp: TreeSetCompareFunction<number> = (a, b) => a - b
      expect(cmp(1, 2)).toBe(-1)
      expect(cmp(2, 1)).toBe(1)
      expect(cmp(1, 1)).toBe(0)
    })
  })

  describe('large sets', () => {
    it('should handle 10000 sequential insertions', () => {
      for (let i = 0; i < 10000; i++) set.add(i)
      expect(set.size).toBe(10000)
      expect(set.min).toBe(0)
      expect(set.max).toBe(9999)
    })

    it('should handle 10000 random insertions with verification', () => {
      const values = new Set<number>()
      for (let i = 0; i < 10000; i++) {
        const v = Math.floor(Math.random() * 50000)
        values.add(v)
        set.add(v)
      }
      expect(set.size).toBe(values.size)
      for (const v of values) {
        expect(set.has(v)).toBe(true)
      }
    })

    it('should handle deleting all 10000 elements', () => {
      for (let i = 0; i < 10000; i++) set.add(i)
      for (let i = 0; i < 10000; i++) {
        expect(set.delete(i)).toBe(true)
      }
      expect(set.isEmpty()).toBe(true)
    })

    it('should handle range query on large set', () => {
      for (let i = 0; i < 10000; i++) set.add(i)
      const result = set.range(100, 200)
      expect(result.length).toBe(101)
      expect(result[0]).toBe(100)
      expect(result[100]).toBe(200)
    })

    it('should maintain sorted order after 10000 insertions', () => {
      const keys = Array.from({ length: 10000 }, () => Math.floor(Math.random() * 100000))
      const unique = [...new Set(keys)]
      for (const v of unique) set.add(v)
      const arr = set.toArray()
      const sorted = [...arr].sort((a, b) => a - b)
      expect(arr).toEqual(sorted)
    })

    it('should handle set operations on large sets', () => {
      const a = new TreeSet<number>()
      const b = new TreeSet<number>()
      for (let i = 0; i < 5000; i++) a.add(i)
      for (let i = 2500; i < 7500; i++) b.add(i)
      const unionResult = a.union(b)
      expect(unionResult.size).toBe(7500)
      const intersectResult = a.intersection(b)
      expect(intersectResult.size).toBe(2500)
    })

    it('should handle rank and atIndex on large set', () => {
      for (let i = 0; i < 5000; i++) set.add(i * 2)
      expect(set.rank(0)).toBe(0)
      expect(set.rank(9998)).toBe(4999)
      expect(set.atIndex(0)).toBe(0)
      expect(set.atIndex(4999)).toBe(9998)
    })
  })
})
