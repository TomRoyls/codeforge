import { describe, it, expect } from 'vitest'
import { SortedArraySet } from '../../src/core/sorted-array-set/index.js'

function assertSorted(s: SortedArraySet<number>): void {
  const arr = s.toArray()
  for (let i = 1; i < arr.length; i++) {
    expect(arr[i]).toBeGreaterThanOrEqual(arr[i - 1]!)
  }
}

function fromNumbers(...nums: number[]): SortedArraySet<number> {
  const s = new SortedArraySet<number>()
  for (const n of nums) s.add(n)
  return s
}

describe('SortedArraySet', () => {
  describe('constructor', () => {
    it('creates empty set with no options', () => {
      const s = new SortedArraySet<number>()
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('creates empty set with empty options', () => {
      const s = new SortedArraySet<number>({})
      expect(s.size).toBe(0)
    })

    it('accepts custom comparator', () => {
      const s = new SortedArraySet<number>({ comparator: (a, b) => b - a })
      s.add(1)
      s.add(3)
      s.add(2)
      expect(s.toArray()).toEqual([3, 2, 1])
    })

    it('accepts string comparator', () => {
      const s = new SortedArraySet<string>()
      s.add('banana')
      s.add('apple')
      s.add('cherry')
      expect(s.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })
  })

  describe('add', () => {
    it('adds element to empty set', () => {
      const s = new SortedArraySet<number>()
      expect(s.add(5)).toBe(true)
      expect(s.size).toBe(1)
      expect(s.has(5)).toBe(true)
    })

    it('adds element in sorted order', () => {
      const s = fromNumbers(3, 1, 2)
      expect(s.toArray()).toEqual([1, 2, 3])
    })

    it('returns false for duplicate', () => {
      const s = new SortedArraySet<number>()
      expect(s.add(5)).toBe(true)
      expect(s.add(5)).toBe(false)
      expect(s.size).toBe(1)
    })

    it('adds to beginning', () => {
      const s = fromNumbers(5, 10, 15)
      expect(s.add(1)).toBe(true)
      expect(s.toArray()).toEqual([1, 5, 10, 15])
    })

    it('adds to end', () => {
      const s = fromNumbers(5, 10, 15)
      expect(s.add(20)).toBe(true)
      expect(s.toArray()).toEqual([5, 10, 15, 20])
    })

    it('adds to middle', () => {
      const s = fromNumbers(5, 15)
      expect(s.add(10)).toBe(true)
      expect(s.toArray()).toEqual([5, 10, 15])
    })

    it('handles many adds maintaining sort', () => {
      const s = new SortedArraySet<number>()
      const input = [50, 30, 70, 10, 90, 20, 80, 40, 60, 0]
      for (const n of input) s.add(n)
      assertSorted(s)
      expect(s.size).toBe(10)
    })

    it('maintains sort with negative numbers', () => {
      const s = fromNumbers(-5, 3, -1, 0, 2, -3)
      expect(s.toArray()).toEqual([-5, -3, -1, 0, 2, 3])
    })

    it('handles strings with default comparator', () => {
      const s = new SortedArraySet<string>()
      s.add('delta')
      s.add('alpha')
      s.add('charlie')
      s.add('bravo')
      expect(s.toArray()).toEqual(['alpha', 'bravo', 'charlie', 'delta'])
    })

    it('handles zero', () => {
      const s = fromNumbers(0)
      expect(s.toArray()).toEqual([0])
    })
  })

  describe('delete', () => {
    it('removes existing element', () => {
      const s = fromNumbers(1, 2, 3)
      expect(s.delete(2)).toBe(true)
      expect(s.toArray()).toEqual([1, 3])
    })

    it('returns false for non-existent', () => {
      const s = fromNumbers(1, 2, 3)
      expect(s.delete(99)).toBe(false)
      expect(s.size).toBe(3)
    })

    it('removes first element', () => {
      const s = fromNumbers(1, 2, 3)
      expect(s.delete(1)).toBe(true)
      expect(s.toArray()).toEqual([2, 3])
    })

    it('removes last element', () => {
      const s = fromNumbers(1, 2, 3)
      expect(s.delete(3)).toBe(true)
      expect(s.toArray()).toEqual([1, 2])
    })

    it('removes only element', () => {
      const s = fromNumbers(42)
      expect(s.delete(42)).toBe(true)
      expect(s.isEmpty()).toBe(true)
    })

    it('returns false on empty set', () => {
      const s = new SortedArraySet<number>()
      expect(s.delete(1)).toBe(false)
    })
  })

  describe('has', () => {
    it('returns true for existing element', () => {
      const s = fromNumbers(1, 2, 3)
      expect(s.has(2)).toBe(true)
    })

    it('returns false for non-existent element', () => {
      const s = fromNumbers(1, 2, 3)
      expect(s.has(99)).toBe(false)
    })

    it('returns false on empty set', () => {
      const s = new SortedArraySet<number>()
      expect(s.has(1)).toBe(false)
    })

    it('finds first element', () => {
      const s = fromNumbers(1, 2, 3)
      expect(s.has(1)).toBe(true)
    })

    it('finds last element', () => {
      const s = fromNumbers(1, 2, 3)
      expect(s.has(3)).toBe(true)
    })

    it('works after add and delete', () => {
      const s = fromNumbers(1, 2, 3)
      s.delete(2)
      s.add(4)
      expect(s.has(2)).toBe(false)
      expect(s.has(4)).toBe(true)
    })
  })

  describe('get', () => {
    it('returns element at index', () => {
      const s = fromNumbers(10, 20, 30)
      expect(s.get(0)).toBe(10)
      expect(s.get(1)).toBe(20)
      expect(s.get(2)).toBe(30)
    })

    it('returns undefined for negative index', () => {
      const s = fromNumbers(1, 2, 3)
      expect(s.get(-1)).toBeUndefined()
    })

    it('returns undefined for out of bounds', () => {
      const s = fromNumbers(1, 2, 3)
      expect(s.get(3)).toBeUndefined()
      expect(s.get(100)).toBeUndefined()
    })

    it('returns undefined on empty set', () => {
      const s = new SortedArraySet<number>()
      expect(s.get(0)).toBeUndefined()
    })
  })

  describe('indexOf', () => {
    it('returns index of existing element', () => {
      const s = fromNumbers(10, 20, 30)
      expect(s.indexOf(10)).toBe(0)
      expect(s.indexOf(20)).toBe(1)
      expect(s.indexOf(30)).toBe(2)
    })

    it('returns -1 for non-existent', () => {
      const s = fromNumbers(1, 2, 3)
      expect(s.indexOf(99)).toBe(-1)
    })

    it('returns -1 on empty set', () => {
      const s = new SortedArraySet<number>()
      expect(s.indexOf(1)).toBe(-1)
    })

    it('returns correct index after modifications', () => {
      const s = fromNumbers(1, 2, 3, 4, 5)
      s.delete(3)
      expect(s.indexOf(4)).toBe(2)
    })
  })

  describe('floor', () => {
    it('returns equal element', () => {
      const s = fromNumbers(10, 20, 30)
      expect(s.floor(20)).toBe(20)
    })

    it('returns largest element less than value', () => {
      const s = fromNumbers(10, 20, 30)
      expect(s.floor(25)).toBe(20)
    })

    it('returns undefined when all elements greater', () => {
      const s = fromNumbers(10, 20, 30)
      expect(s.floor(5)).toBeUndefined()
    })

    it('returns undefined on empty set', () => {
      const s = new SortedArraySet<number>()
      expect(s.floor(5)).toBeUndefined()
    })

    it('returns min for value between min and max', () => {
      const s = fromNumbers(10, 20, 30)
      expect(s.floor(15)).toBe(10)
    })

    it('returns max for value greater than max', () => {
      const s = fromNumbers(10, 20, 30)
      expect(s.floor(100)).toBe(30)
    })

    it('returns first element equal', () => {
      const s = fromNumbers(10)
      expect(s.floor(10)).toBe(10)
    })
  })

  describe('ceiling', () => {
    it('returns equal element', () => {
      const s = fromNumbers(10, 20, 30)
      expect(s.ceiling(20)).toBe(20)
    })

    it('returns smallest element greater than value', () => {
      const s = fromNumbers(10, 20, 30)
      expect(s.ceiling(15)).toBe(20)
    })

    it('returns undefined when all elements less', () => {
      const s = fromNumbers(10, 20, 30)
      expect(s.ceiling(100)).toBeUndefined()
    })

    it('returns undefined on empty set', () => {
      const s = new SortedArraySet<number>()
      expect(s.ceiling(5)).toBeUndefined()
    })

    it('returns min for value less than min', () => {
      const s = fromNumbers(10, 20, 30)
      expect(s.ceiling(5)).toBe(10)
    })
  })

  describe('lower', () => {
    it('returns strictly less element', () => {
      const s = fromNumbers(10, 20, 30)
      expect(s.lower(20)).toBe(10)
    })

    it('returns undefined when no smaller element', () => {
      const s = fromNumbers(10, 20, 30)
      expect(s.lower(5)).toBeUndefined()
    })

    it('returns undefined on empty set', () => {
      const s = new SortedArraySet<number>()
      expect(s.lower(5)).toBeUndefined()
    })

    it('returns element for value between elements', () => {
      const s = fromNumbers(10, 20, 30)
      expect(s.lower(25)).toBe(20)
    })

    it('returns max for value greater than max', () => {
      const s = fromNumbers(10, 20, 30)
      expect(s.lower(100)).toBe(30)
    })

    it('returns undefined for value equal to min', () => {
      const s = fromNumbers(10, 20, 30)
      expect(s.lower(10)).toBeUndefined()
    })
  })

  describe('higher', () => {
    it('returns strictly greater element', () => {
      const s = fromNumbers(10, 20, 30)
      expect(s.higher(20)).toBe(30)
    })

    it('returns undefined when no greater element', () => {
      const s = fromNumbers(10, 20, 30)
      expect(s.higher(100)).toBeUndefined()
    })

    it('returns undefined on empty set', () => {
      const s = new SortedArraySet<number>()
      expect(s.higher(5)).toBeUndefined()
    })

    it('returns element for value between elements', () => {
      const s = fromNumbers(10, 20, 30)
      expect(s.higher(15)).toBe(20)
    })

    it('returns min for value less than min', () => {
      const s = fromNumbers(10, 20, 30)
      expect(s.higher(5)).toBe(10)
    })

    it('returns undefined for value equal to max', () => {
      const s = fromNumbers(10, 20, 30)
      expect(s.higher(30)).toBeUndefined()
    })
  })

  describe('range', () => {
    it('returns elements in range inclusive', () => {
      const s = fromNumbers(10, 20, 30, 40, 50)
      expect(s.range(20, 40)).toEqual([20, 30, 40])
    })

    it('returns single element range', () => {
      const s = fromNumbers(10, 20, 30)
      expect(s.range(20, 20)).toEqual([20])
    })

    it('returns empty for inverted range', () => {
      const s = fromNumbers(10, 20, 30)
      expect(s.range(30, 10)).toEqual([])
    })

    it('returns empty on empty set', () => {
      const s = new SortedArraySet<number>()
      expect(s.range(1, 10)).toEqual([])
    })

    it('returns all elements for full range', () => {
      const s = fromNumbers(10, 20, 30)
      expect(s.range(1, 100)).toEqual([10, 20, 30])
    })

    it('returns elements matching partial range', () => {
      const s = fromNumbers(10, 20, 30, 40, 50)
      expect(s.range(25, 45)).toEqual([30, 40])
    })

    it('returns empty when no elements in range', () => {
      const s = fromNumbers(10, 20, 30)
      expect(s.range(100, 200)).toEqual([])
    })

    it('returns elements from lower bound only', () => {
      const s = fromNumbers(10, 20, 30)
      expect(s.range(25, 100)).toEqual([30])
    })
  })

  describe('size', () => {
    it('returns 0 for empty', () => {
      const s = new SortedArraySet<number>()
      expect(s.size).toBe(0)
    })

    it('returns correct count after adds', () => {
      const s = fromNumbers(1, 2, 3)
      expect(s.size).toBe(3)
    })

    it('does not increment on duplicate add', () => {
      const s = fromNumbers(1, 1, 2)
      expect(s.size).toBe(2)
    })

    it('decrements on delete', () => {
      const s = fromNumbers(1, 2, 3)
      s.delete(2)
      expect(s.size).toBe(2)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new set', () => {
      const s = new SortedArraySet<number>()
      expect(s.isEmpty()).toBe(true)
    })

    it('returns false after add', () => {
      const s = fromNumbers(1)
      expect(s.isEmpty()).toBe(false)
    })

    it('returns true after deleting all', () => {
      const s = fromNumbers(1)
      s.delete(1)
      expect(s.isEmpty()).toBe(true)
    })

    it('returns true after clear', () => {
      const s = fromNumbers(1, 2, 3)
      s.clear()
      expect(s.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('removes all elements', () => {
      const s = fromNumbers(1, 2, 3)
      s.clear()
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
      expect(s.toArray()).toEqual([])
    })

    it('is safe on empty set', () => {
      const s = new SortedArraySet<number>()
      s.clear()
      expect(s.size).toBe(0)
    })

    it('allows adding after clear', () => {
      const s = fromNumbers(1, 2, 3)
      s.clear()
      s.add(10)
      expect(s.size).toBe(1)
      expect(s.has(10)).toBe(true)
    })
  })

  describe('min', () => {
    it('returns smallest element', () => {
      const s = fromNumbers(30, 10, 20)
      expect(s.min).toBe(10)
    })

    it('returns undefined on empty', () => {
      const s = new SortedArraySet<number>()
      expect(s.min).toBeUndefined()
    })

    it('updates after delete', () => {
      const s = fromNumbers(10, 20, 30)
      s.delete(10)
      expect(s.min).toBe(20)
    })
  })

  describe('max', () => {
    it('returns largest element', () => {
      const s = fromNumbers(30, 10, 20)
      expect(s.max).toBe(30)
    })

    it('returns undefined on empty', () => {
      const s = new SortedArraySet<number>()
      expect(s.max).toBeUndefined()
    })

    it('updates after delete', () => {
      const s = fromNumbers(10, 20, 30)
      s.delete(30)
      expect(s.max).toBe(20)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty set', () => {
      const s = new SortedArraySet<number>()
      expect(s.toArray()).toEqual([])
    })

    it('returns sorted copy', () => {
      const s = fromNumbers(3, 1, 2)
      expect(s.toArray()).toEqual([1, 2, 3])
    })

    it('returns a copy', () => {
      const s = fromNumbers(1, 2, 3)
      const arr = s.toArray()
      arr.push(4)
      expect(s.size).toBe(3)
    })
  })

  describe('forEach', () => {
    it('iterates in order', () => {
      const s = fromNumbers(3, 1, 2)
      const result: number[] = []
      s.forEach((v) => result.push(v))
      expect(result).toEqual([1, 2, 3])
    })

    it('provides index', () => {
      const s = fromNumbers(10, 20, 30)
      const indices: number[] = []
      s.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('does not iterate on empty set', () => {
      const s = new SortedArraySet<number>()
      let count = 0
      s.forEach(() => count++)
      expect(count).toBe(0)
    })
  })

  describe('Symbol.iterator', () => {
    it('is iterable', () => {
      const s = fromNumbers(3, 1, 2)
      const result = [...s]
      expect(result).toEqual([1, 2, 3])
    })

    it('works with for...of', () => {
      const s = fromNumbers(3, 1, 2)
      const result: number[] = []
      for (const v of s) result.push(v)
      expect(result).toEqual([1, 2, 3])
    })

    it('produces nothing for empty set', () => {
      const s = new SortedArraySet<number>()
      expect([...s]).toEqual([])
    })

    it('works with destructuring', () => {
      const s = fromNumbers(10, 20, 30)
      const [a, b, c] = s
      expect(a).toBe(10)
      expect(b).toBe(20)
      expect(c).toBe(30)
    })
  })

  describe('union', () => {
    it('combines two sets', () => {
      const a = fromNumbers(1, 2, 3)
      const b = fromNumbers(3, 4, 5)
      expect(a.union(b).toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('returns copy when no overlap', () => {
      const a = fromNumbers(1, 2)
      const b = fromNumbers(3, 4)
      expect(a.union(b).toArray()).toEqual([1, 2, 3, 4])
    })

    it('returns copy when fully overlapping', () => {
      const a = fromNumbers(1, 2)
      const b = fromNumbers(1, 2)
      expect(a.union(b).toArray()).toEqual([1, 2])
    })

    it('handles empty left', () => {
      const a = new SortedArraySet<number>()
      const b = fromNumbers(1, 2, 3)
      expect(a.union(b).toArray()).toEqual([1, 2, 3])
    })

    it('handles empty right', () => {
      const a = fromNumbers(1, 2, 3)
      const b = new SortedArraySet<number>()
      expect(a.union(b).toArray()).toEqual([1, 2, 3])
    })

    it('handles both empty', () => {
      const a = new SortedArraySet<number>()
      const b = new SortedArraySet<number>()
      expect(a.union(b).toArray()).toEqual([])
    })
  })

  describe('intersection', () => {
    it('returns common elements', () => {
      const a = fromNumbers(1, 2, 3, 4)
      const b = fromNumbers(2, 3, 5)
      expect(a.intersection(b).toArray()).toEqual([2, 3])
    })

    it('returns empty for no overlap', () => {
      const a = fromNumbers(1, 2)
      const b = fromNumbers(3, 4)
      expect(a.intersection(b).toArray()).toEqual([])
    })

    it('returns copy for full overlap', () => {
      const a = fromNumbers(1, 2, 3)
      const b = fromNumbers(1, 2, 3)
      expect(a.intersection(b).toArray()).toEqual([1, 2, 3])
    })

    it('handles empty left', () => {
      const a = new SortedArraySet<number>()
      const b = fromNumbers(1, 2)
      expect(a.intersection(b).toArray()).toEqual([])
    })

    it('handles empty right', () => {
      const a = fromNumbers(1, 2)
      const b = new SortedArraySet<number>()
      expect(a.intersection(b).toArray()).toEqual([])
    })
  })

  describe('difference', () => {
    it('returns elements only in first set', () => {
      const a = fromNumbers(1, 2, 3, 4)
      const b = fromNumbers(2, 3, 5)
      expect(a.difference(b).toArray()).toEqual([1, 4])
    })

    it('returns copy when no overlap', () => {
      const a = fromNumbers(1, 2)
      const b = fromNumbers(3, 4)
      expect(a.difference(b).toArray()).toEqual([1, 2])
    })

    it('returns empty for full overlap', () => {
      const a = fromNumbers(1, 2, 3)
      const b = fromNumbers(1, 2, 3)
      expect(a.difference(b).toArray()).toEqual([])
    })

    it('handles empty left', () => {
      const a = new SortedArraySet<number>()
      const b = fromNumbers(1, 2)
      expect(a.difference(b).toArray()).toEqual([])
    })

    it('handles empty right', () => {
      const a = fromNumbers(1, 2)
      const b = new SortedArraySet<number>()
      expect(a.difference(b).toArray()).toEqual([1, 2])
    })
  })

  describe('symmetricDifference', () => {
    it('returns elements in either but not both', () => {
      const a = fromNumbers(1, 2, 3)
      const b = fromNumbers(2, 3, 4)
      expect(a.symmetricDifference(b).toArray()).toEqual([1, 4])
    })

    it('returns empty for full overlap', () => {
      const a = fromNumbers(1, 2)
      const b = fromNumbers(1, 2)
      expect(a.symmetricDifference(b).toArray()).toEqual([])
    })

    it('returns union for no overlap', () => {
      const a = fromNumbers(1, 2)
      const b = fromNumbers(3, 4)
      expect(a.symmetricDifference(b).toArray()).toEqual([1, 2, 3, 4])
    })

    it('handles empty left', () => {
      const a = new SortedArraySet<number>()
      const b = fromNumbers(1, 2)
      expect(a.symmetricDifference(b).toArray()).toEqual([1, 2])
    })

    it('handles empty right', () => {
      const a = fromNumbers(1, 2)
      const b = new SortedArraySet<number>()
      expect(a.symmetricDifference(b).toArray()).toEqual([1, 2])
    })

    it('handles both empty', () => {
      const a = new SortedArraySet<number>()
      const b = new SortedArraySet<number>()
      expect(a.symmetricDifference(b).toArray()).toEqual([])
    })
  })

  describe('isSubsetOf', () => {
    it('returns true for subset', () => {
      const a = fromNumbers(2, 3)
      const b = fromNumbers(1, 2, 3, 4)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('returns true for equal sets', () => {
      const a = fromNumbers(1, 2, 3)
      const b = fromNumbers(1, 2, 3)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('returns true for empty set', () => {
      const a = new SortedArraySet<number>()
      const b = fromNumbers(1, 2)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('returns false for non-subset', () => {
      const a = fromNumbers(1, 5)
      const b = fromNumbers(1, 2, 3)
      expect(a.isSubsetOf(b)).toBe(false)
    })

    it('returns false when element missing', () => {
      const a = fromNumbers(1, 2, 3, 4)
      const b = fromNumbers(1, 2, 3)
      expect(a.isSubsetOf(b)).toBe(false)
    })

    it('empty subset of empty', () => {
      const a = new SortedArraySet<number>()
      const b = new SortedArraySet<number>()
      expect(a.isSubsetOf(b)).toBe(true)
    })
  })

  describe('isSupersetOf', () => {
    it('returns true for superset', () => {
      const a = fromNumbers(1, 2, 3, 4)
      const b = fromNumbers(2, 3)
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('returns true for equal sets', () => {
      const a = fromNumbers(1, 2, 3)
      const b = fromNumbers(1, 2, 3)
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('returns false for non-superset', () => {
      const a = fromNumbers(1, 2, 3)
      const b = fromNumbers(1, 2, 3, 4)
      expect(a.isSupersetOf(b)).toBe(false)
    })

    it('empty is superset of empty', () => {
      const a = new SortedArraySet<number>()
      const b = new SortedArraySet<number>()
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('non-empty is superset of empty', () => {
      const a = fromNumbers(1, 2)
      const b = new SortedArraySet<number>()
      expect(a.isSupersetOf(b)).toBe(true)
    })
  })

  describe('custom comparator', () => {
    it('descending order', () => {
      const s = new SortedArraySet<number>({ comparator: (a, b) => b - a })
      s.add(1)
      s.add(3)
      s.add(2)
      expect(s.toArray()).toEqual([3, 2, 1])
      expect(s.min).toBe(3)
      expect(s.max).toBe(1)
    })

    it('custom object comparator', () => {
      type Item = { id: number; name: string }
      const s = new SortedArraySet<Item>({
        comparator: (a, b) => a.id - b.id,
      })
      s.add({ id: 3, name: 'c' })
      s.add({ id: 1, name: 'a' })
      s.add({ id: 2, name: 'b' })
      expect(s.toArray().map((x) => x.name)).toEqual(['a', 'b', 'c'])
    })

    it('descending preserves operations', () => {
      const s = new SortedArraySet<number>({ comparator: (a, b) => b - a })
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.has(2)).toBe(true)
      expect(s.has(5)).toBe(false)
      expect(s.delete(2)).toBe(true)
      expect(s.size).toBe(2)
      expect(s.toArray()).toEqual([3, 1])
    })

    it('range with custom comparator', () => {
      const s = new SortedArraySet<number>({ comparator: (a, b) => b - a })
      s.add(10)
      s.add(20)
      s.add(30)
      expect(s.range(30, 10)).toEqual([30, 20, 10])
    })

    it('floor/ceiling/lower/higher with custom comparator', () => {
      const s = new SortedArraySet<number>({ comparator: (a, b) => b - a })
      s.add(10)
      s.add(20)
      s.add(30)
      expect(s.floor(20)).toBe(20)
      expect(s.ceiling(20)).toBe(20)
      expect(s.lower(20)).toBe(30)
      expect(s.higher(20)).toBe(10)
    })

    it('union preserves comparator', () => {
      const s1 = new SortedArraySet<number>({ comparator: (a, b) => b - a })
      s1.add(1)
      s1.add(3)
      const s2 = new SortedArraySet<number>({ comparator: (a, b) => b - a })
      s2.add(2)
      s2.add(4)
      expect(s1.union(s2).toArray()).toEqual([4, 3, 2, 1])
    })
  })

  describe('stats', () => {
    it('returns stats for non-empty set', () => {
      const s = fromNumbers(10, 20, 30)
      const st = s.stats()
      expect(st.size).toBe(3)
      expect(st.min).toBe(10)
      expect(st.max).toBe(30)
    })

    it('returns stats for empty set', () => {
      const s = new SortedArraySet<number>()
      const st = s.stats()
      expect(st.size).toBe(0)
      expect(st.min).toBeUndefined()
      expect(st.max).toBeUndefined()
    })
  })

  describe('stress tests', () => {
    it('handles large number of elements', () => {
      const s = new SortedArraySet<number>()
      const count = 1000
      for (let i = count - 1; i >= 0; i--) {
        s.add(i)
      }
      expect(s.size).toBe(count)
      assertSorted(s)
      expect(s.min).toBe(0)
      expect(s.max).toBe(count - 1)
    })

    it('handles large number of duplicates', () => {
      const s = new SortedArraySet<number>()
      for (let i = 0; i < 1000; i++) {
        s.add(42)
      }
      expect(s.size).toBe(1)
    })

    it('maintains sort through interleaved add/delete', () => {
      const s = new SortedArraySet<number>()
      for (let i = 0; i < 100; i++) {
        s.add(Math.floor(Math.random() * 50))
      }
      for (let i = 0; i < 25; i++) {
        s.delete(i)
      }
      assertSorted(s)
    })

    it('binary search correctness on all positions', () => {
      const s = fromNumbers(0, 10, 20, 30, 40, 50, 60, 70, 80, 90)
      for (let i = 0; i <= 90; i += 10) {
        expect(s.has(i)).toBe(true)
        expect(s.indexOf(i)).toBe(i / 10)
      }
      for (let i = 0; i <= 90; i += 10) {
        expect(s.has(i + 5)).toBe(false)
      }
    })
  })

  describe('edge cases', () => {
    it('handles single element operations', () => {
      const s = new SortedArraySet<number>()
      s.add(42)
      expect(s.has(42)).toBe(true)
      expect(s.min).toBe(42)
      expect(s.max).toBe(42)
      expect(s.get(0)).toBe(42)
      expect(s.indexOf(42)).toBe(0)
      expect(s.floor(42)).toBe(42)
      expect(s.ceiling(42)).toBe(42)
      expect(s.lower(42)).toBeUndefined()
      expect(s.higher(42)).toBeUndefined()
    })

    it('two element operations', () => {
      const s = fromNumbers(10, 20)
      expect(s.lower(20)).toBe(10)
      expect(s.higher(10)).toBe(20)
      expect(s.floor(15)).toBe(10)
      expect(s.ceiling(15)).toBe(20)
    })

    it('sequential adds', () => {
      const s = new SortedArraySet<number>()
      for (let i = 0; i < 10; i++) s.add(i)
      expect(s.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('reverse sequential adds', () => {
      const s = new SortedArraySet<number>()
      for (let i = 9; i >= 0; i--) s.add(i)
      expect(s.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('set operations on sets with same elements', () => {
      const a = fromNumbers(1, 2, 3)
      const b = fromNumbers(1, 2, 3)
      expect(a.union(b).size).toBe(3)
      expect(a.intersection(b).size).toBe(3)
      expect(a.difference(b).size).toBe(0)
      expect(a.symmetricDifference(b).size).toBe(0)
      expect(a.isSubsetOf(b)).toBe(true)
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('negative numbers in range', () => {
      const s = fromNumbers(-5, -3, -1, 0, 1, 3, 5)
      expect(s.range(-3, 1)).toEqual([-3, -1, 0, 1])
    })

    it('floating point numbers', () => {
      const s = new SortedArraySet<number>()
      s.add(1.5)
      s.add(0.5)
      s.add(2.5)
      expect(s.toArray()).toEqual([0.5, 1.5, 2.5])
      expect(s.has(1.5)).toBe(true)
    })
  })
})
