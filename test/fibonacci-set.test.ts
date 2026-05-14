import { describe, it, expect } from 'vitest'
import { FibonacciSet } from '../src/core/fibonacci-set/index.js'

describe('FibonacciSet', () => {
  describe('constructor', () => {
    it('creates empty set with default options', () => {
      const s = new FibonacciSet<number>()
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
      expect(s.toArray()).toEqual([])
    })

    it('creates set with custom comparator', () => {
      const s = new FibonacciSet<number>({ compare: (a, b) => b - a })
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.toArray()).toEqual([3, 2, 1])
    })

    it('creates set with string comparator', () => {
      const s = new FibonacciSet<string>({ compare: (a, b) => a.localeCompare(b) })
      s.add('cherry')
      s.add('apple')
      s.add('banana')
      expect(s.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('creates set with reverse string comparator', () => {
      const s = new FibonacciSet<string>({ compare: (a, b) => b.localeCompare(a) })
      s.add('cherry')
      s.add('apple')
      s.add('banana')
      expect(s.toArray()).toEqual(['cherry', 'banana', 'apple'])
    })
  })

  describe('add', () => {
    it('adds single element', () => {
      const s = new FibonacciSet<number>()
      s.add(5)
      expect(s.size).toBe(1)
      expect(s.has(5)).toBe(true)
    })

    it('adds multiple elements', () => {
      const s = new FibonacciSet<number>()
      s.add(5)
      s.add(3)
      s.add(7)
      expect(s.size).toBe(3)
      expect(s.toArray()).toEqual([3, 5, 7])
    })

    it('ignores duplicates', () => {
      const s = new FibonacciSet<number>()
      s.add(5)
      s.add(5)
      s.add(5)
      expect(s.size).toBe(1)
    })

    it('returns this for chaining', () => {
      const s = new FibonacciSet<number>()
      const result = s.add(1)
      expect(result).toBe(s)
    })

    it('handles negative numbers', () => {
      const s = new FibonacciSet<number>()
      s.add(-5)
      s.add(-10)
      s.add(0)
      s.add(10)
      s.add(5)
      expect(s.toArray()).toEqual([-10, -5, 0, 5, 10])
    })

    it('handles floating point numbers', () => {
      const s = new FibonacciSet<number>()
      s.add(1.5)
      s.add(0.5)
      s.add(2.5)
      expect(s.toArray()).toEqual([0.5, 1.5, 2.5])
    })

    it('handles zero', () => {
      const s = new FibonacciSet<number>()
      s.add(0)
      expect(s.has(0)).toBe(true)
      expect(s.size).toBe(1)
    })
  })

  describe('delete', () => {
    it('deletes existing element', () => {
      const s = new FibonacciSet<number>()
      s.add(5)
      expect(s.delete(5)).toBe(true)
      expect(s.size).toBe(0)
      expect(s.has(5)).toBe(false)
    })

    it('returns false for non-existent element', () => {
      const s = new FibonacciSet<number>()
      expect(s.delete(5)).toBe(false)
    })

    it('deletes from middle', () => {
      const s = new FibonacciSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(2)
      expect(s.toArray()).toEqual([1, 3])
    })

    it('deletes first element', () => {
      const s = new FibonacciSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(1)
      expect(s.toArray()).toEqual([2, 3])
    })

    it('deletes last element', () => {
      const s = new FibonacciSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(3)
      expect(s.toArray()).toEqual([1, 2])
    })

    it('deletes all elements', () => {
      const s = new FibonacciSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(1)
      s.delete(2)
      s.delete(3)
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('handles delete on single element set', () => {
      const s = new FibonacciSet<number>()
      s.add(42)
      s.delete(42)
      expect(s.isEmpty()).toBe(true)
      expect(s.min()).toBeUndefined()
      expect(s.max()).toBeUndefined()
    })
  })

  describe('has', () => {
    it('returns true for existing element', () => {
      const s = new FibonacciSet<number>()
      s.add(5)
      expect(s.has(5)).toBe(true)
    })

    it('returns false for non-existent element', () => {
      const s = new FibonacciSet<number>()
      expect(s.has(5)).toBe(false)
    })

    it('returns false after deletion', () => {
      const s = new FibonacciSet<number>()
      s.add(5)
      s.delete(5)
      expect(s.has(5)).toBe(false)
    })
  })

  describe('size', () => {
    it('returns 0 for empty set', () => {
      const s = new FibonacciSet<number>()
      expect(s.size).toBe(0)
    })

    it('returns correct size after adds', () => {
      const s = new FibonacciSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.size).toBe(3)
    })

    it('returns correct size after deletes', () => {
      const s = new FibonacciSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(2)
      expect(s.size).toBe(2)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new set', () => {
      const s = new FibonacciSet<number>()
      expect(s.isEmpty()).toBe(true)
    })

    it('returns false after add', () => {
      const s = new FibonacciSet<number>()
      s.add(1)
      expect(s.isEmpty()).toBe(false)
    })

    it('returns true after clear', () => {
      const s = new FibonacciSet<number>()
      s.add(1)
      s.clear()
      expect(s.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears all elements', () => {
      const s = new FibonacciSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.clear()
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('clears empty set without error', () => {
      const s = new FibonacciSet<number>()
      s.clear()
      expect(s.size).toBe(0)
    })

    it('allows adding after clear', () => {
      const s = new FibonacciSet<number>()
      s.add(1)
      s.clear()
      s.add(2)
      expect(s.size).toBe(1)
      expect(s.has(2)).toBe(true)
    })
  })

  describe('min', () => {
    it('returns undefined for empty set', () => {
      const s = new FibonacciSet<number>()
      expect(s.min()).toBeUndefined()
    })

    it('returns minimum element', () => {
      const s = new FibonacciSet<number>()
      s.add(5)
      s.add(3)
      s.add(7)
      expect(s.min()).toBe(3)
    })

    it('updates after deletion', () => {
      const s = new FibonacciSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(1)
      expect(s.min()).toBe(2)
    })

    it('handles negative numbers', () => {
      const s = new FibonacciSet<number>()
      s.add(-5)
      s.add(5)
      s.add(0)
      expect(s.min()).toBe(-5)
    })
  })

  describe('max', () => {
    it('returns undefined for empty set', () => {
      const s = new FibonacciSet<number>()
      expect(s.max()).toBeUndefined()
    })

    it('returns maximum element', () => {
      const s = new FibonacciSet<number>()
      s.add(5)
      s.add(3)
      s.add(7)
      expect(s.max()).toBe(7)
    })

    it('updates after deletion', () => {
      const s = new FibonacciSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(3)
      expect(s.max()).toBe(2)
    })

    it('handles negative numbers', () => {
      const s = new FibonacciSet<number>()
      s.add(-5)
      s.add(5)
      s.add(0)
      expect(s.max()).toBe(5)
    })
  })

  describe('values', () => {
    it('returns empty array for empty set', () => {
      const s = new FibonacciSet<number>()
      expect(s.values()).toEqual([])
    })

    it('returns sorted values', () => {
      const s = new FibonacciSet<number>()
      s.add(3)
      s.add(1)
      s.add(2)
      expect(s.values()).toEqual([1, 2, 3])
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty set', () => {
      const s = new FibonacciSet<number>()
      expect(s.toArray()).toEqual([])
    })

    it('returns sorted array', () => {
      const s = new FibonacciSet<number>()
      s.add(3)
      s.add(1)
      s.add(2)
      expect(s.toArray()).toEqual([1, 2, 3])
    })

    it('returns copy of data', () => {
      const s = new FibonacciSet<number>()
      s.add(1)
      s.add(2)
      const arr = s.toArray()
      arr.push(3)
      expect(s.size).toBe(2)
    })
  })

  describe('forEach', () => {
    it('iterates in order', () => {
      const s = new FibonacciSet<number>()
      s.add(3)
      s.add(1)
      s.add(2)
      const result: number[] = []
      s.forEach((v) => result.push(v))
      expect(result).toEqual([1, 2, 3])
    })

    it('provides correct index', () => {
      const s = new FibonacciSet<number>()
      s.add(10)
      s.add(20)
      s.add(30)
      const indices: number[] = []
      s.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('does not iterate empty set', () => {
      const s = new FibonacciSet<number>()
      let count = 0
      s.forEach(() => count++)
      expect(count).toBe(0)
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates in sorted order', () => {
      const s = new FibonacciSet<number>()
      s.add(3)
      s.add(1)
      s.add(2)
      expect([...s]).toEqual([1, 2, 3])
    })

    it('works with for of', () => {
      const s = new FibonacciSet<number>()
      s.add(10)
      s.add(20)
      const result: number[] = []
      for (const v of s) result.push(v)
      expect(result).toEqual([10, 20])
    })

    it('returns empty for empty set', () => {
      const s = new FibonacciSet<number>()
      expect([...s]).toEqual([])
    })
  })

  describe('union', () => {
    it('unions two disjoint sets', () => {
      const a = FibonacciSet.fromArray([1, 2, 3])
      const b = FibonacciSet.fromArray([4, 5, 6])
      const result = a.union(b)
      expect(result.toArray()).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('unions overlapping sets', () => {
      const a = FibonacciSet.fromArray([1, 2, 3])
      const b = FibonacciSet.fromArray([2, 3, 4])
      const result = a.union(b)
      expect(result.toArray()).toEqual([1, 2, 3, 4])
    })

    it('unions with empty set', () => {
      const a = FibonacciSet.fromArray([1, 2, 3])
      const b = new FibonacciSet<number>()
      const result = a.union(b)
      expect(result.toArray()).toEqual([1, 2, 3])
    })

    it('does not modify original sets', () => {
      const a = FibonacciSet.fromArray([1, 2])
      const b = FibonacciSet.fromArray([3, 4])
      a.union(b)
      expect(a.toArray()).toEqual([1, 2])
      expect(b.toArray()).toEqual([3, 4])
    })
  })

  describe('intersection', () => {
    it('intersects overlapping sets', () => {
      const a = FibonacciSet.fromArray([1, 2, 3, 4])
      const b = FibonacciSet.fromArray([2, 3, 5])
      const result = a.intersection(b)
      expect(result.toArray()).toEqual([2, 3])
    })

    it('returns empty for disjoint sets', () => {
      const a = FibonacciSet.fromArray([1, 2])
      const b = FibonacciSet.fromArray([3, 4])
      const result = a.intersection(b)
      expect(result.isEmpty()).toBe(true)
    })

    it('intersects identical sets', () => {
      const a = FibonacciSet.fromArray([1, 2, 3])
      const b = FibonacciSet.fromArray([1, 2, 3])
      const result = a.intersection(b)
      expect(result.toArray()).toEqual([1, 2, 3])
    })

    it('intersects with empty set', () => {
      const a = FibonacciSet.fromArray([1, 2, 3])
      const b = new FibonacciSet<number>()
      const result = a.intersection(b)
      expect(result.isEmpty()).toBe(true)
    })
  })

  describe('difference', () => {
    it('computes difference', () => {
      const a = FibonacciSet.fromArray([1, 2, 3, 4])
      const b = FibonacciSet.fromArray([2, 4])
      const result = a.difference(b)
      expect(result.toArray()).toEqual([1, 3])
    })

    it('returns copy when no overlap', () => {
      const a = FibonacciSet.fromArray([1, 2])
      const b = FibonacciSet.fromArray([3, 4])
      const result = a.difference(b)
      expect(result.toArray()).toEqual([1, 2])
    })

    it('returns empty when fully overlapping', () => {
      const a = FibonacciSet.fromArray([1, 2])
      const b = FibonacciSet.fromArray([1, 2, 3])
      const result = a.difference(b)
      expect(result.isEmpty()).toBe(true)
    })

    it('does not modify original', () => {
      const a = FibonacciSet.fromArray([1, 2, 3])
      const b = FibonacciSet.fromArray([2])
      a.difference(b)
      expect(a.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('symmetricDifference', () => {
    it('computes symmetric difference', () => {
      const a = FibonacciSet.fromArray([1, 2, 3])
      const b = FibonacciSet.fromArray([2, 3, 4])
      const result = a.symmetricDifference(b)
      expect(result.toArray()).toEqual([1, 4])
    })

    it('returns union for disjoint sets', () => {
      const a = FibonacciSet.fromArray([1, 2])
      const b = FibonacciSet.fromArray([3, 4])
      const result = a.symmetricDifference(b)
      expect(result.toArray()).toEqual([1, 2, 3, 4])
    })

    it('returns empty for identical sets', () => {
      const a = FibonacciSet.fromArray([1, 2, 3])
      const b = FibonacciSet.fromArray([1, 2, 3])
      const result = a.symmetricDifference(b)
      expect(result.isEmpty()).toBe(true)
    })

    it('handles empty set', () => {
      const a = FibonacciSet.fromArray([1, 2])
      const b = new FibonacciSet<number>()
      const result = a.symmetricDifference(b)
      expect(result.toArray()).toEqual([1, 2])
    })
  })

  describe('isSubsetOf', () => {
    it('returns true for subset', () => {
      const a = FibonacciSet.fromArray([1, 2])
      const b = FibonacciSet.fromArray([1, 2, 3])
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('returns false for non-subset', () => {
      const a = FibonacciSet.fromArray([1, 2, 5])
      const b = FibonacciSet.fromArray([1, 2, 3])
      expect(a.isSubsetOf(b)).toBe(false)
    })

    it('returns true for identical sets', () => {
      const a = FibonacciSet.fromArray([1, 2, 3])
      const b = FibonacciSet.fromArray([1, 2, 3])
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('returns true for empty set', () => {
      const a = new FibonacciSet<number>()
      const b = FibonacciSet.fromArray([1, 2, 3])
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('returns false when larger', () => {
      const a = FibonacciSet.fromArray([1, 2, 3, 4])
      const b = FibonacciSet.fromArray([1, 2])
      expect(a.isSubsetOf(b)).toBe(false)
    })
  })

  describe('isSupersetOf', () => {
    it('returns true for superset', () => {
      const a = FibonacciSet.fromArray([1, 2, 3])
      const b = FibonacciSet.fromArray([1, 2])
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('returns false for non-superset', () => {
      const a = FibonacciSet.fromArray([1, 2])
      const b = FibonacciSet.fromArray([1, 2, 3])
      expect(a.isSupersetOf(b)).toBe(false)
    })

    it('returns true for identical sets', () => {
      const a = FibonacciSet.fromArray([1, 2])
      const b = FibonacciSet.fromArray([1, 2])
      expect(a.isSupersetOf(b)).toBe(true)
    })
  })

  describe('equals', () => {
    it('returns true for identical sets', () => {
      const a = FibonacciSet.fromArray([1, 2, 3])
      const b = FibonacciSet.fromArray([1, 2, 3])
      expect(a.equals(b)).toBe(true)
    })

    it('returns false for different sizes', () => {
      const a = FibonacciSet.fromArray([1, 2])
      const b = FibonacciSet.fromArray([1, 2, 3])
      expect(a.equals(b)).toBe(false)
    })

    it('returns false for same size different elements', () => {
      const a = FibonacciSet.fromArray([1, 2, 3])
      const b = FibonacciSet.fromArray([1, 2, 4])
      expect(a.equals(b)).toBe(false)
    })

    it('returns true for empty sets', () => {
      const a = new FibonacciSet<number>()
      const b = new FibonacciSet<number>()
      expect(a.equals(b)).toBe(true)
    })
  })

  describe('clone', () => {
    it('clones set', () => {
      const s = FibonacciSet.fromArray([1, 2, 3])
      const c = s.clone()
      expect(c.toArray()).toEqual([1, 2, 3])
    })

    it('clone is independent', () => {
      const s = FibonacciSet.fromArray([1, 2, 3])
      const c = s.clone()
      c.delete(2)
      expect(s.toArray()).toEqual([1, 2, 3])
      expect(c.toArray()).toEqual([1, 3])
    })

    it('clones empty set', () => {
      const s = new FibonacciSet<number>()
      const c = s.clone()
      expect(c.isEmpty()).toBe(true)
    })

    it('preserves comparator', () => {
      const s = new FibonacciSet<number>({ compare: (a, b) => b - a })
      s.add(1)
      s.add(2)
      s.add(3)
      const c = s.clone()
      expect(c.toArray()).toEqual([3, 2, 1])
    })
  })

  describe('fromArray', () => {
    it('creates set from array', () => {
      const s = FibonacciSet.fromArray([3, 1, 2])
      expect(s.toArray()).toEqual([1, 2, 3])
    })

    it('deduplicates', () => {
      const s = FibonacciSet.fromArray([1, 2, 2, 3, 3])
      expect(s.toArray()).toEqual([1, 2, 3])
    })

    it('creates empty from empty array', () => {
      const s = FibonacciSet.fromArray([])
      expect(s.isEmpty()).toBe(true)
    })

    it('accepts options', () => {
      const s = FibonacciSet.fromArray([1, 2, 3], { compare: (a, b) => b - a })
      expect(s.toArray()).toEqual([3, 2, 1])
    })
  })

  describe('range', () => {
    it('returns elements in range', () => {
      const s = FibonacciSet.fromArray([1, 2, 3, 4, 5])
      expect(s.range(2, 4)).toEqual([2, 3, 4])
    })

    it('returns single element range', () => {
      const s = FibonacciSet.fromArray([1, 2, 3])
      expect(s.range(2, 2)).toEqual([2])
    })

    it('returns empty for no matches', () => {
      const s = FibonacciSet.fromArray([1, 2, 3])
      expect(s.range(4, 6)).toEqual([])
    })

    it('returns empty for inverted range', () => {
      const s = FibonacciSet.fromArray([1, 2, 3])
      expect(s.range(3, 1)).toEqual([])
    })

    it('returns all elements for full range', () => {
      const s = FibonacciSet.fromArray([1, 2, 3, 4, 5])
      expect(s.range(1, 5)).toEqual([1, 2, 3, 4, 5])
    })

    it('handles boundary values', () => {
      const s = FibonacciSet.fromArray([1, 3, 5, 7, 9])
      expect(s.range(2, 8)).toEqual([3, 5, 7])
    })
  })

  describe('count', () => {
    it('returns 0 for empty set', () => {
      const s = new FibonacciSet<number>()
      expect(s.count()).toBe(0)
    })

    it('returns correct count', () => {
      const s = FibonacciSet.fromArray([1, 2, 3])
      expect(s.count()).toBe(3)
    })
  })

  describe('floor', () => {
    it('returns exact match', () => {
      const s = FibonacciSet.fromArray([1, 3, 5, 7])
      expect(s.floor(5)).toBe(5)
    })

    it('returns lower element', () => {
      const s = FibonacciSet.fromArray([1, 3, 5, 7])
      expect(s.floor(4)).toBe(3)
    })

    it('returns undefined when all greater', () => {
      const s = FibonacciSet.fromArray([5, 6, 7])
      expect(s.floor(4)).toBeUndefined()
    })

    it('returns undefined for empty set', () => {
      const s = new FibonacciSet<number>()
      expect(s.floor(5)).toBeUndefined()
    })

    it('returns max for large value', () => {
      const s = FibonacciSet.fromArray([1, 3, 5])
      expect(s.floor(100)).toBe(5)
    })
  })

  describe('ceiling', () => {
    it('returns exact match', () => {
      const s = FibonacciSet.fromArray([1, 3, 5, 7])
      expect(s.ceiling(5)).toBe(5)
    })

    it('returns higher element', () => {
      const s = FibonacciSet.fromArray([1, 3, 5, 7])
      expect(s.ceiling(4)).toBe(5)
    })

    it('returns undefined when all smaller', () => {
      const s = FibonacciSet.fromArray([1, 2, 3])
      expect(s.ceiling(4)).toBeUndefined()
    })

    it('returns undefined for empty set', () => {
      const s = new FibonacciSet<number>()
      expect(s.ceiling(5)).toBeUndefined()
    })

    it('returns min for small value', () => {
      const s = FibonacciSet.fromArray([3, 5, 7])
      expect(s.ceiling(-100)).toBe(3)
    })
  })

  describe('lower', () => {
    it('returns strictly lower element', () => {
      const s = FibonacciSet.fromArray([1, 3, 5, 7])
      expect(s.lower(5)).toBe(3)
    })

    it('returns undefined for exact min', () => {
      const s = FibonacciSet.fromArray([1, 3, 5])
      expect(s.lower(1)).toBeUndefined()
    })

    it('returns undefined for empty set', () => {
      const s = new FibonacciSet<number>()
      expect(s.lower(5)).toBeUndefined()
    })

    it('returns max for large value', () => {
      const s = FibonacciSet.fromArray([1, 3, 5])
      expect(s.lower(100)).toBe(5)
    })

    it('returns element below value', () => {
      const s = FibonacciSet.fromArray([1, 3, 5, 7])
      expect(s.lower(4)).toBe(3)
    })
  })

  describe('higher', () => {
    it('returns strictly higher element', () => {
      const s = FibonacciSet.fromArray([1, 3, 5, 7])
      expect(s.higher(5)).toBe(7)
    })

    it('returns undefined for exact max', () => {
      const s = FibonacciSet.fromArray([1, 3, 5])
      expect(s.higher(5)).toBeUndefined()
    })

    it('returns undefined for empty set', () => {
      const s = new FibonacciSet<number>()
      expect(s.higher(5)).toBeUndefined()
    })

    it('returns min for small value', () => {
      const s = FibonacciSet.fromArray([3, 5, 7])
      expect(s.higher(-100)).toBe(3)
    })

    it('returns element above value', () => {
      const s = FibonacciSet.fromArray([1, 3, 5, 7])
      expect(s.higher(4)).toBe(5)
    })
  })

  describe('string elements', () => {
    it('handles string elements with default comparator', () => {
      const s = new FibonacciSet<string>()
      s.add('delta')
      s.add('alpha')
      s.add('charlie')
      s.add('bravo')
      expect(s.toArray()).toEqual(['alpha', 'bravo', 'charlie', 'delta'])
      expect(s.min()).toBe('alpha')
      expect(s.max()).toBe('delta')
      expect(s.floor('bravo')).toBe('bravo')
      expect(s.ceiling('bravo')).toBe('bravo')
      expect(s.lower('charlie')).toBe('bravo')
      expect(s.higher('bravo')).toBe('charlie')
    })

    it('handles set operations with strings', () => {
      const a = FibonacciSet.fromArray(['a', 'b', 'c'])
      const b = FibonacciSet.fromArray(['b', 'c', 'd'])
      expect(a.union(b).toArray()).toEqual(['a', 'b', 'c', 'd'])
      expect(a.intersection(b).toArray()).toEqual(['b', 'c'])
      expect(a.difference(b).toArray()).toEqual(['a'])
      expect(a.symmetricDifference(b).toArray()).toEqual(['a', 'd'])
    })
  })

  describe('stress tests', () => {
    it('handles large number of operations', () => {
      const s = new FibonacciSet<number>()
      for (let i = 0; i < 200; i++) s.add(i)
      expect(s.size).toBe(200)
      for (let i = 0; i < 100; i++) s.delete(i)
      expect(s.size).toBe(100)
      expect(s.min()).toBe(100)
      expect(s.max()).toBe(199)
    })

    it('handles alternating add/delete', () => {
      const s = new FibonacciSet<number>()
      for (let i = 0; i < 50; i++) {
        s.add(i)
        if (i % 2 === 0) s.delete(i)
      }
      expect(s.size).toBe(25)
      for (let i = 1; i < 50; i += 2) {
        expect(s.has(i)).toBe(true)
      }
    })
  })

  describe('range with custom comparator', () => {
    it('works with reverse comparator', () => {
      const s = new FibonacciSet<number>({ compare: (a, b) => b - a })
      s.add(1)
      s.add(2)
      s.add(3)
      s.add(4)
      s.add(5)
      expect(s.range(4, 2)).toEqual([4, 3, 2])
    })
  })
})
