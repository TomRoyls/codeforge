import { describe, it, expect } from 'vitest'
import { SplayTreeSet } from '../../src/core/splay-tree-set/index.js'

describe('SplayTreeSet', () => {
  describe('constructor', () => {
    it('creates empty set with defaults', () => {
      const s = new SplayTreeSet<number>()
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('creates set with custom comparator', () => {
      const s = new SplayTreeSet<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      s.add('banana')
      s.add('apple')
      expect(s.min()).toBe('apple')
      expect(s.max()).toBe('banana')
    })

    it('creates set with descending comparator', () => {
      const s = new SplayTreeSet<number>({
        comparator: (a, b) => b - a,
      })
      s.add(1)
      s.add(5)
      s.add(3)
      expect(s.toArray()).toEqual([5, 3, 1])
    })

    it('handles no options argument', () => {
      const s = new SplayTreeSet()
      expect(s.size).toBe(0)
    })
  })

  describe('add', () => {
    it('adds a single element', () => {
      const s = new SplayTreeSet<number>()
      expect(s.add(1)).toBe(true)
      expect(s.size).toBe(1)
      expect(s.isEmpty()).toBe(false)
    })

    it('returns false for duplicate', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      expect(s.add(1)).toBe(false)
      expect(s.size).toBe(1)
    })

    it('adds multiple elements in any order', () => {
      const s = new SplayTreeSet<number>()
      s.add(5)
      s.add(1)
      s.add(3)
      s.add(2)
      s.add(4)
      expect(s.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('maintains sorted order after many insertions', () => {
      const s = new SplayTreeSet<number>()
      const input = [10, 5, 20, 15, 1, 25, 3, 8, 12, 18]
      for (const v of input) s.add(v)
      const arr = s.toArray()
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]).toBeGreaterThanOrEqual(arr[i - 1])
      }
    })

    it('handles many insertions', () => {
      const s = new SplayTreeSet<number>()
      for (let i = 0; i < 200; i++) {
        s.add(i)
      }
      expect(s.size).toBe(200)
      expect(s.min()).toBe(0)
      expect(s.max()).toBe(199)
    })

    it('handles reverse-order insertions', () => {
      const s = new SplayTreeSet<number>()
      for (let i = 100; i >= 0; i--) {
        s.add(i)
      }
      expect(s.size).toBe(101)
      expect(s.toArray()[0]).toBe(0)
      expect(s.toArray()[100]).toBe(100)
    })

    it('handles duplicate insertions among many', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.add(2)).toBe(false)
      expect(s.size).toBe(3)
    })

    it('inserts at beginning', () => {
      const s = new SplayTreeSet<number>()
      s.add(5)
      s.add(10)
      expect(s.add(1)).toBe(true)
      expect(s.min()).toBe(1)
    })

    it('inserts at end', () => {
      const s = new SplayTreeSet<number>()
      s.add(5)
      s.add(10)
      expect(s.add(20)).toBe(true)
      expect(s.max()).toBe(20)
    })

    it('handles negative numbers', () => {
      const s = new SplayTreeSet<number>()
      s.add(-5)
      s.add(-10)
      s.add(0)
      s.add(5)
      expect(s.toArray()).toEqual([-10, -5, 0, 5])
    })

    it('handles string values', () => {
      const s = new SplayTreeSet<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      s.add('cherry')
      s.add('apple')
      s.add('banana')
      expect(s.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })
  })

  describe('delete', () => {
    it('deletes an existing element', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      expect(s.delete(1)).toBe(true)
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('returns false for non-existent element', () => {
      const s = new SplayTreeSet<number>()
      expect(s.delete(1)).toBe(false)
    })

    it('deletes from larger set', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.delete(2)).toBe(true)
      expect(s.toArray()).toEqual([1, 3])
      expect(s.size).toBe(2)
    })

    it('deletes root element', () => {
      const s = new SplayTreeSet<number>()
      s.add(2)
      s.add(1)
      s.add(3)
      expect(s.delete(2)).toBe(true)
      expect(s.size).toBe(2)
      expect(s.has(1)).toBe(true)
      expect(s.has(3)).toBe(true)
    })

    it('deletes leaf element', () => {
      const s = new SplayTreeSet<number>()
      s.add(2)
      s.add(1)
      s.add(3)
      expect(s.delete(1)).toBe(true)
      expect(s.toArray()).toEqual([2, 3])
    })

    it('deletes all elements one by one', () => {
      const s = new SplayTreeSet<number>()
      for (let i = 0; i < 10; i++) s.add(i)
      for (let i = 0; i < 10; i++) {
        expect(s.delete(i)).toBe(true)
      }
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('deletes in reverse order', () => {
      const s = new SplayTreeSet<number>()
      for (let i = 0; i < 10; i++) s.add(i)
      for (let i = 9; i >= 0; i--) {
        expect(s.delete(i)).toBe(true)
      }
      expect(s.size).toBe(0)
    })

    it('returns false for double delete', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.delete(1)
      expect(s.delete(1)).toBe(false)
    })

    it('handles deleting only element', () => {
      const s = new SplayTreeSet<number>()
      s.add(42)
      expect(s.delete(42)).toBe(true)
      expect(s.size).toBe(0)
      expect(s.root).toBeNull()
    })

    it('deletes many elements preserving order', () => {
      const s = new SplayTreeSet<number>()
      for (let i = 0; i < 50; i++) s.add(i)
      for (let i = 0; i < 50; i += 2) s.delete(i)
      expect(s.size).toBe(25)
      const arr = s.toArray()
      for (const v of arr) {
        expect(v % 2).toBe(1)
      }
    })
  })

  describe('has', () => {
    it('returns true for existing element', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      expect(s.has(1)).toBe(true)
    })

    it('returns false for non-existent element', () => {
      const s = new SplayTreeSet<number>()
      expect(s.has(1)).toBe(false)
    })

    it('returns false on empty set', () => {
      const s = new SplayTreeSet<number>()
      expect(s.has(0)).toBe(false)
    })

    it('finds after many operations', () => {
      const s = new SplayTreeSet<number>()
      for (let i = 0; i < 100; i++) s.add(i)
      for (let i = 0; i < 100; i++) {
        expect(s.has(i)).toBe(true)
      }
      expect(s.has(100)).toBe(false)
      expect(s.has(-1)).toBe(false)
    })

    it('returns false after deletion', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.delete(1)
      expect(s.has(1)).toBe(false)
    })
  })

  describe('size', () => {
    it('returns 0 for empty set', () => {
      const s = new SplayTreeSet<number>()
      expect(s.size).toBe(0)
    })

    it('returns correct size after adds', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.size).toBe(3)
    })

    it('returns correct size after deletes', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(2)
      expect(s.size).toBe(2)
    })

    it('returns correct size after clear', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.add(2)
      s.clear()
      expect(s.size).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new set', () => {
      expect(new SplayTreeSet<number>().isEmpty()).toBe(true)
    })

    it('returns false after add', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      expect(s.isEmpty()).toBe(false)
    })

    it('returns true after deleting all', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.delete(1)
      expect(s.isEmpty()).toBe(true)
    })

    it('returns true after clear', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.add(2)
      s.clear()
      expect(s.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears a populated set', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.clear()
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
      expect(s.toArray()).toEqual([])
    })

    it('clear on empty set is no-op', () => {
      const s = new SplayTreeSet<number>()
      s.clear()
      expect(s.size).toBe(0)
    })

    it('allows reuse after clear', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.clear()
      s.add(2)
      expect(s.size).toBe(1)
      expect(s.has(2)).toBe(true)
      expect(s.has(1)).toBe(false)
    })
  })

  describe('min', () => {
    it('returns undefined for empty set', () => {
      expect(new SplayTreeSet<number>().min()).toBeUndefined()
    })

    it('returns the minimum element', () => {
      const s = new SplayTreeSet<number>()
      s.add(5)
      s.add(1)
      s.add(3)
      expect(s.min()).toBe(1)
    })

    it('updates after deletion', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(1)
      expect(s.min()).toBe(2)
    })

    it('returns single element', () => {
      const s = new SplayTreeSet<number>()
      s.add(42)
      expect(s.min()).toBe(42)
    })
  })

  describe('max', () => {
    it('returns undefined for empty set', () => {
      expect(new SplayTreeSet<number>().max()).toBeUndefined()
    })

    it('returns the maximum element', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.add(5)
      s.add(3)
      expect(s.max()).toBe(5)
    })

    it('updates after deletion', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(3)
      expect(s.max()).toBe(2)
    })

    it('returns single element', () => {
      const s = new SplayTreeSet<number>()
      s.add(42)
      expect(s.max()).toBe(42)
    })
  })

  describe('floor', () => {
    it('returns undefined for empty set', () => {
      expect(new SplayTreeSet<number>().floor(5)).toBeUndefined()
    })

    it('returns exact match', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.add(3)
      s.add(5)
      expect(s.floor(3)).toBe(3)
    })

    it('returns largest element less than value', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.add(3)
      s.add(5)
      expect(s.floor(4)).toBe(3)
    })

    it('returns undefined when all elements are greater', () => {
      const s = new SplayTreeSet<number>()
      s.add(5)
      s.add(10)
      expect(s.floor(1)).toBeUndefined()
    })

    it('returns element equal to min', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.add(5)
      expect(s.floor(1)).toBe(1)
    })

    it('returns max when value exceeds all', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.add(5)
      expect(s.floor(100)).toBe(5)
    })
  })

  describe('ceiling', () => {
    it('returns undefined for empty set', () => {
      expect(new SplayTreeSet<number>().ceiling(5)).toBeUndefined()
    })

    it('returns exact match', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.add(3)
      s.add(5)
      expect(s.ceiling(3)).toBe(3)
    })

    it('returns smallest element greater than value', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.add(3)
      s.add(5)
      expect(s.ceiling(4)).toBe(5)
    })

    it('returns undefined when all elements are less', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.add(5)
      expect(s.ceiling(100)).toBeUndefined()
    })

    it('returns element equal to max', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.add(5)
      expect(s.ceiling(5)).toBe(5)
    })

    it('returns min when value is below all', () => {
      const s = new SplayTreeSet<number>()
      s.add(5)
      s.add(10)
      expect(s.ceiling(1)).toBe(5)
    })
  })

  describe('lower', () => {
    it('returns undefined for empty set', () => {
      expect(new SplayTreeSet<number>().lower(5)).toBeUndefined()
    })

    it('returns element strictly less', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.add(3)
      s.add(5)
      expect(s.lower(3)).toBe(1)
    })

    it('returns undefined when no smaller element', () => {
      const s = new SplayTreeSet<number>()
      s.add(5)
      expect(s.lower(5)).toBeUndefined()
    })

    it('returns element less than non-existent value', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.add(5)
      s.add(10)
      expect(s.lower(7)).toBe(5)
    })

    it('returns undefined when value is below all', () => {
      const s = new SplayTreeSet<number>()
      s.add(5)
      s.add(10)
      expect(s.lower(1)).toBeUndefined()
    })
  })

  describe('higher', () => {
    it('returns undefined for empty set', () => {
      expect(new SplayTreeSet<number>().higher(5)).toBeUndefined()
    })

    it('returns element strictly greater', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.add(3)
      s.add(5)
      expect(s.higher(3)).toBe(5)
    })

    it('returns undefined when no greater element', () => {
      const s = new SplayTreeSet<number>()
      s.add(5)
      expect(s.higher(5)).toBeUndefined()
    })

    it('returns element greater than non-existent value', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.add(5)
      s.add(10)
      expect(s.higher(7)).toBe(10)
    })

    it('returns undefined when value is above all', () => {
      const s = new SplayTreeSet<number>()
      s.add(5)
      s.add(10)
      expect(s.higher(100)).toBeUndefined()
    })
  })

  describe('range', () => {
    it('returns empty for empty set', () => {
      const s = new SplayTreeSet<number>()
      expect([...s.range(1, 5)]).toEqual([])
    })

    it('returns elements in range inclusive', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.add(4)
      s.add(5)
      expect([...s.range(2, 4)]).toEqual([2, 3, 4])
    })

    it('returns single element', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.add(3)
      s.add(5)
      expect([...s.range(3, 3)]).toEqual([3])
    })

    it('returns empty when range has no elements', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.add(5)
      expect([...s.range(2, 4)]).toEqual([])
    })

    it('returns all elements with full range', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      expect([...s.range(1, 3)]).toEqual([1, 2, 3])
    })

    it('handles range at boundaries', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.add(5)
      s.add(10)
      expect([...s.range(0, 6)]).toEqual([1, 5])
    })
  })

  describe('indexOf', () => {
    it('returns -1 for empty set', () => {
      expect(new SplayTreeSet<number>().indexOf(1)).toBe(-1)
    })

    it('returns index of element', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.indexOf(1)).toBe(0)
      expect(s.indexOf(2)).toBe(1)
      expect(s.indexOf(3)).toBe(2)
    })

    it('returns -1 for non-existent element', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.add(3)
      expect(s.indexOf(2)).toBe(-1)
    })

    it('returns correct index after deletions', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.add(4)
      s.delete(2)
      expect(s.indexOf(1)).toBe(0)
      expect(s.indexOf(3)).toBe(1)
      expect(s.indexOf(4)).toBe(2)
    })

    it('returns 0 for minimum element', () => {
      const s = new SplayTreeSet<number>()
      s.add(5)
      s.add(1)
      s.add(3)
      expect(s.indexOf(1)).toBe(0)
    })

    it('returns size-1 for maximum element', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.add(3)
      s.add(5)
      expect(s.indexOf(5)).toBe(2)
    })
  })

  describe('at', () => {
    it('returns undefined for empty set', () => {
      expect(new SplayTreeSet<number>().at(0)).toBeUndefined()
    })

    it('returns element at index', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.at(0)).toBe(1)
      expect(s.at(1)).toBe(2)
      expect(s.at(2)).toBe(3)
    })

    it('returns undefined for negative index', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      expect(s.at(-1)).toBeUndefined()
    })

    it('returns undefined for out-of-bounds index', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      expect(s.at(5)).toBeUndefined()
    })

    it('returns correct elements after deletions', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.add(4)
      s.delete(2)
      expect(s.at(0)).toBe(1)
      expect(s.at(1)).toBe(3)
      expect(s.at(2)).toBe(4)
    })

    it('works with large sets', () => {
      const s = new SplayTreeSet<number>()
      for (let i = 0; i < 100; i++) s.add(i)
      expect(s.at(0)).toBe(0)
      expect(s.at(50)).toBe(50)
      expect(s.at(99)).toBe(99)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty set', () => {
      expect(new SplayTreeSet<number>().toArray()).toEqual([])
    })

    it('returns sorted array', () => {
      const s = new SplayTreeSet<number>()
      s.add(3)
      s.add(1)
      s.add(2)
      expect(s.toArray()).toEqual([1, 2, 3])
    })

    it('reflects mutations', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(2)
      expect(s.toArray()).toEqual([1, 3])
    })

    it('returns copy', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.add(2)
      const arr = s.toArray()
      arr.push(3)
      expect(s.size).toBe(2)
    })
  })

  describe('forEach', () => {
    it('iterates over all elements in order', () => {
      const s = new SplayTreeSet<number>()
      s.add(3)
      s.add(1)
      s.add(2)
      const result: number[] = []
      s.forEach((v) => result.push(v))
      expect(result).toEqual([1, 2, 3])
    })

    it('provides correct indices', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      const indices: number[] = []
      s.forEach((_, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('does not iterate on empty set', () => {
      const s = new SplayTreeSet<number>()
      let count = 0
      s.forEach(() => count++)
      expect(count).toBe(0)
    })
  })

  describe('iterator', () => {
    it('iterates in sorted order', () => {
      const s = new SplayTreeSet<number>()
      s.add(3)
      s.add(1)
      s.add(2)
      expect([...s]).toEqual([1, 2, 3])
    })

    it('works with for-of', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      const result: number[] = []
      for (const v of s) result.push(v)
      expect(result).toEqual([1, 2, 3])
    })

    it('works with spread', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.add(2)
      expect([...s]).toEqual([1, 2])
    })

    it('yields nothing for empty set', () => {
      const s = new SplayTreeSet<number>()
      expect([...s]).toEqual([])
    })
  })

  describe('union', () => {
    it('returns union of two sets', () => {
      const a = new SplayTreeSet<number>()
      a.add(1)
      a.add(2)
      const b = new SplayTreeSet<number>()
      b.add(2)
      b.add(3)
      const u = a.union(b)
      expect(u.toArray()).toEqual([1, 2, 3])
    })

    it('returns copy when other is empty', () => {
      const a = new SplayTreeSet<number>()
      a.add(1)
      a.add(2)
      const b = new SplayTreeSet<number>()
      const u = a.union(b)
      expect(u.toArray()).toEqual([1, 2])
    })

    it('returns copy when self is empty', () => {
      const a = new SplayTreeSet<number>()
      const b = new SplayTreeSet<number>()
      b.add(1)
      const u = a.union(b)
      expect(u.toArray()).toEqual([1])
    })

    it('does not modify original sets', () => {
      const a = new SplayTreeSet<number>()
      a.add(1)
      const b = new SplayTreeSet<number>()
      b.add(2)
      const u = a.union(b)
      expect(u.size).toBe(2)
      expect(a.size).toBe(1)
      expect(b.size).toBe(1)
    })

    it('handles identical sets', () => {
      const a = new SplayTreeSet<number>()
      a.add(1)
      a.add(2)
      const b = new SplayTreeSet<number>()
      b.add(1)
      b.add(2)
      const u = a.union(b)
      expect(u.toArray()).toEqual([1, 2])
      expect(u.size).toBe(2)
    })
  })

  describe('intersection', () => {
    it('returns intersection of two sets', () => {
      const a = new SplayTreeSet<number>()
      a.add(1)
      a.add(2)
      a.add(3)
      const b = new SplayTreeSet<number>()
      b.add(2)
      b.add(3)
      b.add(4)
      const i = a.intersection(b)
      expect(i.toArray()).toEqual([2, 3])
    })

    it('returns empty for disjoint sets', () => {
      const a = new SplayTreeSet<number>()
      a.add(1)
      const b = new SplayTreeSet<number>()
      b.add(2)
      expect(a.intersection(b).toArray()).toEqual([])
    })

    it('returns copy for identical sets', () => {
      const a = new SplayTreeSet<number>()
      a.add(1)
      a.add(2)
      const b = new SplayTreeSet<number>()
      b.add(1)
      b.add(2)
      expect(a.intersection(b).toArray()).toEqual([1, 2])
    })

    it('handles empty sets', () => {
      const a = new SplayTreeSet<number>()
      const b = new SplayTreeSet<number>()
      expect(a.intersection(b).size).toBe(0)
    })

    it('handles one empty set', () => {
      const a = new SplayTreeSet<number>()
      a.add(1)
      const b = new SplayTreeSet<number>()
      expect(a.intersection(b).size).toBe(0)
    })
  })

  describe('difference', () => {
    it('returns difference of two sets', () => {
      const a = new SplayTreeSet<number>()
      a.add(1)
      a.add(2)
      a.add(3)
      const b = new SplayTreeSet<number>()
      b.add(2)
      const d = a.difference(b)
      expect(d.toArray()).toEqual([1, 3])
    })

    it('returns copy when sets are disjoint', () => {
      const a = new SplayTreeSet<number>()
      a.add(1)
      a.add(2)
      const b = new SplayTreeSet<number>()
      b.add(3)
      expect(a.difference(b).toArray()).toEqual([1, 2])
    })

    it('returns empty when a is subset of b', () => {
      const a = new SplayTreeSet<number>()
      a.add(1)
      a.add(2)
      const b = new SplayTreeSet<number>()
      b.add(1)
      b.add(2)
      b.add(3)
      expect(a.difference(b).size).toBe(0)
    })

    it('handles empty sets', () => {
      const a = new SplayTreeSet<number>()
      const b = new SplayTreeSet<number>()
      expect(a.difference(b).size).toBe(0)
    })

    it('handles self difference', () => {
      const a = new SplayTreeSet<number>()
      a.add(1)
      a.add(2)
      const b = new SplayTreeSet<number>()
      b.add(1)
      b.add(2)
      expect(a.difference(b).size).toBe(0)
    })
  })

  describe('count', () => {
    it('returns 0 for empty set', () => {
      expect(new SplayTreeSet<number>().count(1, 5)).toBe(0)
    })

    it('counts elements in range inclusive', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.add(4)
      s.add(5)
      expect(s.count(2, 4)).toBe(3)
    })

    it('counts single element', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.add(3)
      s.add(5)
      expect(s.count(3, 3)).toBe(1)
    })

    it('returns 0 when no elements in range', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.add(5)
      expect(s.count(2, 4)).toBe(0)
    })

    it('counts all elements', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.count(1, 3)).toBe(3)
    })
  })

  describe('stress tests', () => {
    it('handles sequential insertions', () => {
      const s = new SplayTreeSet<number>()
      for (let i = 0; i < 500; i++) s.add(i)
      expect(s.size).toBe(500)
      for (let i = 0; i < 500; i++) {
        expect(s.has(i)).toBe(true)
      }
    })

    it('handles reverse sequential insertions', () => {
      const s = new SplayTreeSet<number>()
      for (let i = 499; i >= 0; i--) s.add(i)
      expect(s.size).toBe(500)
      const arr = s.toArray()
      for (let i = 0; i < arr.length - 1; i++) {
        expect(arr[i]).toBeLessThan(arr[i + 1])
      }
    })

    it('handles alternating insertions', () => {
      const s = new SplayTreeSet<number>()
      for (let i = 0; i < 250; i++) {
        s.add(i)
        s.add(499 - i)
      }
      expect(s.size).toBe(500)
    })

    it('handles mixed operations', () => {
      const s = new SplayTreeSet<number>()
      for (let i = 0; i < 100; i++) s.add(i)
      for (let i = 0; i < 50; i++) s.delete(i)
      expect(s.size).toBe(50)
      for (let i = 50; i < 100; i++) {
        expect(s.has(i)).toBe(true)
      }
      for (let i = 0; i < 50; i++) {
        expect(s.has(i)).toBe(false)
      }
    })

    it('maintains order after heavy operations', () => {
      const s = new SplayTreeSet<number>()
      for (let i = 0; i < 200; i++) s.add(i)
      for (let i = 0; i < 200; i += 3) s.delete(i)
      const arr = s.toArray()
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]).toBeGreaterThan(arr[i - 1])
      }
    })

    it('indexOf and at are consistent', () => {
      const s = new SplayTreeSet<number>()
      for (let i = 0; i < 50; i++) s.add(i * 2)
      for (let i = 0; i < 50; i++) {
        const val = s.at(i)
        expect(val).not.toBeUndefined()
        expect(s.indexOf(val!)).toBe(i)
      }
    })

    it('at and toArray are consistent', () => {
      const s = new SplayTreeSet<number>()
      const values = [50, 30, 70, 10, 40, 60, 80]
      for (const v of values) s.add(v)
      const arr = s.toArray()
      for (let i = 0; i < arr.length; i++) {
        expect(s.at(i)).toBe(arr[i])
      }
    })

    it('floor/ceiling/lower/higher are consistent', () => {
      const s = new SplayTreeSet<number>()
      s.add(1)
      s.add(3)
      s.add(5)
      s.add(7)
      s.add(9)
      expect(s.floor(5)).toBe(5)
      expect(s.ceiling(5)).toBe(5)
      expect(s.lower(5)).toBe(3)
      expect(s.higher(5)).toBe(7)
    })

    it('set operations work with custom comparator', () => {
      const s = new SplayTreeSet<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      s.add('dog')
      s.add('cat')
      s.add('elephant')
      s.add('bird')
      expect(s.min()).toBe('bird')
      expect(s.max()).toBe('elephant')
      expect(s.floor('cow')).toBe('cat')
      expect(s.ceiling('cow')).toBe('dog')
      expect(s.lower('dog')).toBe('cat')
      expect(s.higher('dog')).toBe('elephant')
    })

    it('handles object values with custom comparator', () => {
      interface Point {
        x: number
        y: number
      }
      const s = new SplayTreeSet<Point>({
        comparator: (a, b) => a.x - b.x || a.y - b.y,
      })
      s.add({ x: 1, y: 2 })
      s.add({ x: 3, y: 4 })
      s.add({ x: 1, y: 1 })
      const arr = s.toArray()
      expect(arr[0]).toEqual({ x: 1, y: 1 })
      expect(arr[1]).toEqual({ x: 1, y: 2 })
      expect(arr[2]).toEqual({ x: 3, y: 4 })
    })
  })
})
