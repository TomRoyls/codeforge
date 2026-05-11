import { describe, it, expect } from 'vitest'
import { AVLSet } from '../../src/core/avl-set/index.js'

function insertRange(s: AVLSet<number>, from: number, to: number): void {
  for (let i = from; i <= to; i++) s.add(i)
}

describe('AVLSet', () => {
  describe('constructor', () => {
    it('creates empty set with defaults', () => {
      const s = new AVLSet<number>()
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('creates set with custom comparator', () => {
      const s = new AVLSet<string>({ comparator: (a, b) => a.localeCompare(b) })
      s.add('banana')
      s.add('apple')
      s.add('cherry')
      expect(s.min()).toBe('apple')
      expect(s.max()).toBe('cherry')
    })

    it('creates set with descending comparator', () => {
      const s = new AVLSet<number>({ comparator: (a, b) => b - a })
      s.add(1)
      s.add(5)
      s.add(3)
      expect(s.toArray()).toEqual([5, 3, 1])
    })

    it('handles no options argument', () => {
      const s = new AVLSet()
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })
  })

  describe('add', () => {
    it('adds a single element', () => {
      const s = new AVLSet<number>()
      expect(s.add(1)).toBe(true)
      expect(s.size).toBe(1)
      expect(s.isEmpty()).toBe(false)
    })

    it('returns false for duplicate', () => {
      const s = new AVLSet<number>()
      s.add(1)
      expect(s.add(1)).toBe(false)
      expect(s.size).toBe(1)
    })

    it('adds multiple elements in any order', () => {
      const s = new AVLSet<number>()
      s.add(5)
      s.add(1)
      s.add(3)
      s.add(2)
      s.add(4)
      expect(s.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('maintains sorted order after many insertions', () => {
      const s = new AVLSet<number>()
      const input = [10, 5, 20, 15, 1, 25, 3, 8, 12, 18]
      for (const v of input) s.add(v)
      const arr = s.toArray()
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]).toBeGreaterThanOrEqual(arr[i - 1])
      }
    })

    it('handles many insertions while staying balanced', () => {
      const s = new AVLSet<number>()
      for (let i = 0; i < 200; i++) s.add(i)
      expect(s.size).toBe(200)
      expect(s.min()).toBe(0)
      expect(s.max()).toBe(199)
      expect(s.isAVLBalanced).toBe(true)
    })

    it('handles reverse-order insertions', () => {
      const s = new AVLSet<number>()
      for (let i = 100; i >= 0; i--) s.add(i)
      expect(s.size).toBe(101)
      expect(s.toArray()[0]).toBe(0)
      expect(s.toArray()[100]).toBe(100)
      expect(s.isAVLBalanced).toBe(true)
    })

    it('handles sequential insertions', () => {
      const s = new AVLSet<number>()
      for (let i = 0; i < 50; i++) s.add(i)
      expect(s.size).toBe(50)
      expect(s.isAVLBalanced).toBe(true)
    })

    it('handles duplicates among many insertions', () => {
      const s = new AVLSet<number>()
      for (let i = 0; i < 50; i++) {
        s.add(i)
        s.add(i)
      }
      expect(s.size).toBe(50)
    })

    it('returns true when adding new values', () => {
      const s = new AVLSet<number>()
      expect(s.add(1)).toBe(true)
      expect(s.add(2)).toBe(true)
      expect(s.add(3)).toBe(true)
    })
  })

  describe('delete', () => {
    it('deletes an existing element', () => {
      const s = new AVLSet<number>()
      s.add(1)
      expect(s.delete(1)).toBe(true)
      expect(s.size).toBe(0)
      expect(s.has(1)).toBe(false)
    })

    it('returns false for non-existent element', () => {
      const s = new AVLSet<number>()
      expect(s.delete(1)).toBe(false)
    })

    it('returns false when deleting from empty set', () => {
      const s = new AVLSet<number>()
      expect(s.delete(42)).toBe(false)
    })

    it('deletes from a populated set', () => {
      const s = new AVLSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.delete(2)).toBe(true)
      expect(s.size).toBe(2)
      expect(s.has(2)).toBe(false)
      expect(s.toArray()).toEqual([1, 3])
    })

    it('deletes min element', () => {
      const s = new AVLSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.delete(1)).toBe(true)
      expect(s.min()).toBe(2)
      expect(s.toArray()).toEqual([2, 3])
    })

    it('deletes max element', () => {
      const s = new AVLSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.delete(3)).toBe(true)
      expect(s.max()).toBe(2)
      expect(s.toArray()).toEqual([1, 2])
    })

    it('deletes all elements one by one', () => {
      const s = new AVLSet<number>()
      for (let i = 0; i < 20; i++) s.add(i)
      for (let i = 0; i < 20; i++) {
        expect(s.delete(i)).toBe(true)
        expect(s.isAVLBalanced).toBe(true)
      }
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('deletes in reverse order', () => {
      const s = new AVLSet<number>()
      for (let i = 0; i < 20; i++) s.add(i)
      for (let i = 19; i >= 0; i--) {
        expect(s.delete(i)).toBe(true)
      }
      expect(s.size).toBe(0)
    })

    it('deletes in alternating pattern', () => {
      const s = new AVLSet<number>()
      for (let i = 0; i < 20; i++) s.add(i)
      for (let i = 0; i < 20; i += 2) s.delete(i)
      expect(s.size).toBe(10)
      expect(s.isAVLBalanced).toBe(true)
    })

    it('maintains balance after deletions', () => {
      const s = new AVLSet<number>()
      for (let i = 0; i < 100; i++) s.add(i)
      for (let i = 0; i < 50; i++) s.delete(i * 2)
      expect(s.isAVLBalanced).toBe(true)
    })

    it('deleting same element twice returns false second time', () => {
      const s = new AVLSet<number>()
      s.add(5)
      expect(s.delete(5)).toBe(true)
      expect(s.delete(5)).toBe(false)
    })
  })

  describe('has', () => {
    it('returns true for existing element', () => {
      const s = new AVLSet<number>()
      s.add(1)
      expect(s.has(1)).toBe(true)
    })

    it('returns false for non-existent element', () => {
      const s = new AVLSet<number>()
      expect(s.has(1)).toBe(false)
    })

    it('returns false on empty set', () => {
      const s = new AVLSet<number>()
      expect(s.has(42)).toBe(false)
    })

    it('works after deletion', () => {
      const s = new AVLSet<number>()
      s.add(1)
      s.delete(1)
      expect(s.has(1)).toBe(false)
    })

    it('works with many elements', () => {
      const s = new AVLSet<number>()
      for (let i = 0; i < 100; i++) s.add(i)
      for (let i = 0; i < 100; i++) expect(s.has(i)).toBe(true)
      expect(s.has(100)).toBe(false)
      expect(s.has(-1)).toBe(false)
    })
  })

  describe('size and isEmpty', () => {
    it('returns 0 for empty set', () => {
      const s = new AVLSet<number>()
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('increments on add', () => {
      const s = new AVLSet<number>()
      s.add(1)
      expect(s.size).toBe(1)
      s.add(2)
      expect(s.size).toBe(2)
    })

    it('does not increment on duplicate add', () => {
      const s = new AVLSet<number>()
      s.add(1)
      s.add(1)
      expect(s.size).toBe(1)
    })

    it('decrements on delete', () => {
      const s = new AVLSet<number>()
      s.add(1)
      s.add(2)
      s.delete(1)
      expect(s.size).toBe(1)
    })

    it('does not decrement on failed delete', () => {
      const s = new AVLSet<number>()
      s.add(1)
      s.delete(2)
      expect(s.size).toBe(1)
    })

    it('isEmpty returns false after add', () => {
      const s = new AVLSet<number>()
      s.add(1)
      expect(s.isEmpty()).toBe(false)
    })

    it('isEmpty returns true after deleting all', () => {
      const s = new AVLSet<number>()
      s.add(1)
      s.delete(1)
      expect(s.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears the set', () => {
      const s = new AVLSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.clear()
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
      expect(s.has(1)).toBe(false)
      expect(s.has(2)).toBe(false)
      expect(s.has(3)).toBe(false)
    })

    it('clear on empty set is no-op', () => {
      const s = new AVLSet<number>()
      s.clear()
      expect(s.size).toBe(0)
    })

    it('can add after clear', () => {
      const s = new AVLSet<number>()
      s.add(1)
      s.clear()
      s.add(2)
      expect(s.size).toBe(1)
      expect(s.has(2)).toBe(true)
      expect(s.has(1)).toBe(false)
    })
  })

  describe('min', () => {
    it('returns undefined on empty set', () => {
      const s = new AVLSet<number>()
      expect(s.min()).toBeUndefined()
    })

    it('returns single element', () => {
      const s = new AVLSet<number>()
      s.add(5)
      expect(s.min()).toBe(5)
    })

    it('returns minimum after many insertions', () => {
      const s = new AVLSet<number>()
      s.add(10)
      s.add(5)
      s.add(20)
      s.add(1)
      s.add(15)
      expect(s.min()).toBe(1)
    })

    it('updates after deleting min', () => {
      const s = new AVLSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(1)
      expect(s.min()).toBe(2)
    })
  })

  describe('max', () => {
    it('returns undefined on empty set', () => {
      const s = new AVLSet<number>()
      expect(s.max()).toBeUndefined()
    })

    it('returns single element', () => {
      const s = new AVLSet<number>()
      s.add(5)
      expect(s.max()).toBe(5)
    })

    it('returns maximum after many insertions', () => {
      const s = new AVLSet<number>()
      s.add(10)
      s.add(5)
      s.add(20)
      s.add(1)
      s.add(15)
      expect(s.max()).toBe(20)
    })

    it('updates after deleting max', () => {
      const s = new AVLSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(3)
      expect(s.max()).toBe(2)
    })
  })

  describe('floor', () => {
    it('returns undefined on empty set', () => {
      const s = new AVLSet<number>()
      expect(s.floor(5)).toBeUndefined()
    })

    it('returns exact match', () => {
      const s = new AVLSet<number>()
      s.add(5)
      expect(s.floor(5)).toBe(5)
    })

    it('returns largest element <= value', () => {
      const s = new AVLSet<number>()
      s.add(1)
      s.add(3)
      s.add(5)
      s.add(7)
      expect(s.floor(4)).toBe(3)
    })

    it('returns undefined if all elements are greater', () => {
      const s = new AVLSet<number>()
      s.add(5)
      s.add(10)
      expect(s.floor(3)).toBeUndefined()
    })

    it('returns value itself when present', () => {
      const s = new AVLSet<number>()
      insertRange(s, 1, 10)
      expect(s.floor(5)).toBe(5)
    })

    it('returns element just below missing value', () => {
      const s = new AVLSet<number>()
      insertRange(s, 1, 10)
      s.delete(5)
      expect(s.floor(5)).toBe(4)
    })
  })

  describe('ceiling', () => {
    it('returns undefined on empty set', () => {
      const s = new AVLSet<number>()
      expect(s.ceiling(5)).toBeUndefined()
    })

    it('returns exact match', () => {
      const s = new AVLSet<number>()
      s.add(5)
      expect(s.ceiling(5)).toBe(5)
    })

    it('returns smallest element >= value', () => {
      const s = new AVLSet<number>()
      s.add(1)
      s.add(3)
      s.add(5)
      s.add(7)
      expect(s.ceiling(4)).toBe(5)
    })

    it('returns undefined if all elements are less', () => {
      const s = new AVLSet<number>()
      s.add(1)
      s.add(3)
      expect(s.ceiling(5)).toBeUndefined()
    })

    it('returns value itself when present', () => {
      const s = new AVLSet<number>()
      insertRange(s, 1, 10)
      expect(s.ceiling(5)).toBe(5)
    })

    it('returns element just above missing value', () => {
      const s = new AVLSet<number>()
      insertRange(s, 1, 10)
      s.delete(5)
      expect(s.ceiling(5)).toBe(6)
    })
  })

  describe('lower', () => {
    it('returns undefined on empty set', () => {
      const s = new AVLSet<number>()
      expect(s.lower(5)).toBeUndefined()
    })

    it('returns undefined when only exact match exists', () => {
      const s = new AVLSet<number>()
      s.add(5)
      expect(s.lower(5)).toBeUndefined()
    })

    it('returns largest element strictly less than value', () => {
      const s = new AVLSet<number>()
      s.add(1)
      s.add(3)
      s.add(5)
      s.add(7)
      expect(s.lower(5)).toBe(3)
    })

    it('returns element less than value even when exact not present', () => {
      const s = new AVLSet<number>()
      s.add(1)
      s.add(3)
      s.add(7)
      expect(s.lower(5)).toBe(3)
    })

    it('returns undefined if all elements are >= value', () => {
      const s = new AVLSet<number>()
      s.add(5)
      s.add(10)
      expect(s.lower(3)).toBeUndefined()
    })
  })

  describe('higher', () => {
    it('returns undefined on empty set', () => {
      const s = new AVLSet<number>()
      expect(s.higher(5)).toBeUndefined()
    })

    it('returns undefined when only exact match exists', () => {
      const s = new AVLSet<number>()
      s.add(5)
      expect(s.higher(5)).toBeUndefined()
    })

    it('returns smallest element strictly greater than value', () => {
      const s = new AVLSet<number>()
      s.add(1)
      s.add(3)
      s.add(5)
      s.add(7)
      expect(s.higher(5)).toBe(7)
    })

    it('returns element greater than value even when exact not present', () => {
      const s = new AVLSet<number>()
      s.add(1)
      s.add(5)
      s.add(7)
      expect(s.higher(3)).toBe(5)
    })

    it('returns undefined if all elements are <= value', () => {
      const s = new AVLSet<number>()
      s.add(1)
      s.add(3)
      expect(s.higher(5)).toBeUndefined()
    })
  })

  describe('range', () => {
    it('returns empty for empty set', () => {
      const s = new AVLSet<number>()
      expect([...s.range(1, 10)]).toEqual([])
    })

    it('returns elements in range inclusive', () => {
      const s = new AVLSet<number>()
      insertRange(s, 1, 10)
      expect([...s.range(3, 7)]).toEqual([3, 4, 5, 6, 7])
    })

    it('returns single element when lo equals hi and present', () => {
      const s = new AVLSet<number>()
      insertRange(s, 1, 10)
      expect([...s.range(5, 5)]).toEqual([5])
    })

    it('returns empty when lo > hi', () => {
      const s = new AVLSet<number>()
      insertRange(s, 1, 10)
      expect([...s.range(7, 3)]).toEqual([])
    })

    it('returns all elements when range covers everything', () => {
      const s = new AVLSet<number>()
      insertRange(s, 1, 5)
      expect([...s.range(1, 5)]).toEqual([1, 2, 3, 4, 5])
    })

    it('returns partial range at boundaries', () => {
      const s = new AVLSet<number>()
      insertRange(s, 1, 10)
      expect([...s.range(0, 3)]).toEqual([1, 2, 3])
      expect([...s.range(8, 15)]).toEqual([8, 9, 10])
    })

    it('returns empty when range is outside set', () => {
      const s = new AVLSet<number>()
      insertRange(s, 5, 10)
      expect([...s.range(1, 3)]).toEqual([])
      expect([...s.range(12, 15)]).toEqual([])
    })
  })

  describe('indexOf', () => {
    it('returns -1 for non-existent element', () => {
      const s = new AVLSet<number>()
      expect(s.indexOf(5)).toBe(-1)
    })

    it('returns -1 on empty set', () => {
      const s = new AVLSet<number>()
      expect(s.indexOf(1)).toBe(-1)
    })

    it('returns 0 for first element', () => {
      const s = new AVLSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.indexOf(1)).toBe(0)
    })

    it('returns correct index for middle element', () => {
      const s = new AVLSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.indexOf(2)).toBe(1)
    })

    it('returns correct index for last element', () => {
      const s = new AVLSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.indexOf(3)).toBe(2)
    })

    it('returns correct indices for many elements', () => {
      const s = new AVLSet<number>()
      for (let i = 0; i < 100; i++) s.add(i)
      for (let i = 0; i < 100; i++) {
        expect(s.indexOf(i)).toBe(i)
      }
    })

    it('returns -1 for element not in set', () => {
      const s = new AVLSet<number>()
      s.add(1)
      s.add(3)
      s.add(5)
      expect(s.indexOf(2)).toBe(-1)
      expect(s.indexOf(4)).toBe(-1)
    })
  })

  describe('at', () => {
    it('returns undefined for out-of-bounds index', () => {
      const s = new AVLSet<number>()
      s.add(1)
      expect(s.at(-1)).toBeUndefined()
      expect(s.at(1)).toBeUndefined()
    })

    it('returns undefined on empty set', () => {
      const s = new AVLSet<number>()
      expect(s.at(0)).toBeUndefined()
    })

    it('returns element at index 0', () => {
      const s = new AVLSet<number>()
      s.add(5)
      s.add(1)
      s.add(3)
      expect(s.at(0)).toBe(1)
    })

    it('returns element at last index', () => {
      const s = new AVLSet<number>()
      s.add(5)
      s.add(1)
      s.add(3)
      expect(s.at(2)).toBe(5)
    })

    it('returns correct elements for all indices', () => {
      const s = new AVLSet<number>()
      for (let i = 0; i < 50; i++) s.add(i)
      for (let i = 0; i < 50; i++) {
        expect(s.at(i)).toBe(i)
      }
    })

    it('returns undefined for large index', () => {
      const s = new AVLSet<number>()
      s.add(1)
      expect(s.at(1000)).toBeUndefined()
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty set', () => {
      const s = new AVLSet<number>()
      expect(s.toArray()).toEqual([])
    })

    it('returns sorted array', () => {
      const s = new AVLSet<number>()
      s.add(3)
      s.add(1)
      s.add(2)
      expect(s.toArray()).toEqual([1, 2, 3])
    })

    it('returns all elements in order after many operations', () => {
      const s = new AVLSet<number>()
      for (let i = 0; i < 20; i++) s.add(i)
      s.delete(5)
      s.delete(10)
      s.delete(15)
      const arr = s.toArray()
      expect(arr.length).toBe(17)
      expect(arr).not.toContain(5)
      expect(arr).not.toContain(10)
      expect(arr).not.toContain(15)
    })
  })

  describe('forEach', () => {
    it('does nothing on empty set', () => {
      const s = new AVLSet<number>()
      const items: number[] = []
      s.forEach((v) => items.push(v))
      expect(items).toEqual([])
    })

    it('iterates in order', () => {
      const s = new AVLSet<number>()
      s.add(3)
      s.add(1)
      s.add(2)
      const items: number[] = []
      s.forEach((v) => items.push(v))
      expect(items).toEqual([1, 2, 3])
    })

    it('provides correct indices', () => {
      const s = new AVLSet<number>()
      s.add(10)
      s.add(20)
      s.add(30)
      const indices: number[] = []
      s.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('iterates many elements', () => {
      const s = new AVLSet<number>()
      for (let i = 0; i < 100; i++) s.add(i)
      const items: number[] = []
      s.forEach((v) => items.push(v))
      expect(items.length).toBe(100)
      for (let i = 0; i < 100; i++) expect(items[i]).toBe(i)
    })
  })

  describe('Symbol.iterator', () => {
    it('returns empty iterator for empty set', () => {
      const s = new AVLSet<number>()
      expect([...s]).toEqual([])
    })

    it('iterates in sorted order', () => {
      const s = new AVLSet<number>()
      s.add(3)
      s.add(1)
      s.add(2)
      expect([...s]).toEqual([1, 2, 3])
    })

    it('works with for...of', () => {
      const s = new AVLSet<number>()
      s.add(5)
      s.add(3)
      s.add(7)
      const result: number[] = []
      for (const v of s) result.push(v)
      expect(result).toEqual([3, 5, 7])
    })

    it('works with spread operator', () => {
      const s = new AVLSet<number>()
      insertRange(s, 1, 5)
      expect([...s]).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('union', () => {
    it('returns union of two sets', () => {
      const a = new AVLSet<number>()
      a.add(1)
      a.add(2)
      a.add(3)
      const b = new AVLSet<number>()
      b.add(3)
      b.add(4)
      b.add(5)
      const u = a.union(b)
      expect(u.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('returns copy when other is empty', () => {
      const a = new AVLSet<number>()
      a.add(1)
      a.add(2)
      const b = new AVLSet<number>()
      const u = a.union(b)
      expect(u.toArray()).toEqual([1, 2])
    })

    it('returns copy when self is empty', () => {
      const a = new AVLSet<number>()
      const b = new AVLSet<number>()
      b.add(1)
      b.add(2)
      const u = a.union(b)
      expect(u.toArray()).toEqual([1, 2])
    })

    it('returns empty when both empty', () => {
      const a = new AVLSet<number>()
      const b = new AVLSet<number>()
      expect(a.union(b).size).toBe(0)
    })

    it('does not modify original sets', () => {
      const a = new AVLSet<number>()
      a.add(1)
      const b = new AVLSet<number>()
      b.add(2)
      a.union(b)
      expect(a.size).toBe(1)
      expect(b.size).toBe(1)
    })
  })

  describe('intersection', () => {
    it('returns intersection of two sets', () => {
      const a = new AVLSet<number>()
      a.add(1)
      a.add(2)
      a.add(3)
      const b = new AVLSet<number>()
      b.add(2)
      b.add(3)
      b.add(4)
      const i = a.intersection(b)
      expect(i.toArray()).toEqual([2, 3])
    })

    it('returns empty when no common elements', () => {
      const a = new AVLSet<number>()
      a.add(1)
      a.add(2)
      const b = new AVLSet<number>()
      b.add(3)
      b.add(4)
      expect(a.intersection(b).size).toBe(0)
    })

    it('returns empty when either is empty', () => {
      const a = new AVLSet<number>()
      a.add(1)
      const b = new AVLSet<number>()
      expect(a.intersection(b).size).toBe(0)
      expect(b.intersection(a).size).toBe(0)
    })

    it('returns full set when both are identical', () => {
      const a = new AVLSet<number>()
      a.add(1)
      a.add(2)
      const b = new AVLSet<number>()
      b.add(1)
      b.add(2)
      expect(a.intersection(b).toArray()).toEqual([1, 2])
    })
  })

  describe('difference', () => {
    it('returns elements in self but not other', () => {
      const a = new AVLSet<number>()
      a.add(1)
      a.add(2)
      a.add(3)
      const b = new AVLSet<number>()
      b.add(2)
      b.add(4)
      const d = a.difference(b)
      expect(d.toArray()).toEqual([1, 3])
    })

    it('returns copy when other is empty', () => {
      const a = new AVLSet<number>()
      a.add(1)
      a.add(2)
      const b = new AVLSet<number>()
      expect(a.difference(b).toArray()).toEqual([1, 2])
    })

    it('returns empty when both are identical', () => {
      const a = new AVLSet<number>()
      a.add(1)
      a.add(2)
      const b = new AVLSet<number>()
      b.add(1)
      b.add(2)
      expect(a.difference(b).size).toBe(0)
    })

    it('returns empty when self is empty', () => {
      const a = new AVLSet<number>()
      const b = new AVLSet<number>()
      b.add(1)
      expect(a.difference(b).size).toBe(0)
    })
  })

  describe('isSubsetOf', () => {
    it('returns true for subset', () => {
      const a = new AVLSet<number>()
      a.add(1)
      a.add(2)
      const b = new AVLSet<number>()
      b.add(1)
      b.add(2)
      b.add(3)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('returns false when not subset', () => {
      const a = new AVLSet<number>()
      a.add(1)
      a.add(4)
      const b = new AVLSet<number>()
      b.add(1)
      b.add(2)
      b.add(3)
      expect(a.isSubsetOf(b)).toBe(false)
    })

    it('returns true for empty set', () => {
      const a = new AVLSet<number>()
      const b = new AVLSet<number>()
      b.add(1)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('returns true when both empty', () => {
      const a = new AVLSet<number>()
      const b = new AVLSet<number>()
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('returns true for identical sets', () => {
      const a = new AVLSet<number>()
      a.add(1)
      a.add(2)
      const b = new AVLSet<number>()
      b.add(1)
      b.add(2)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('returns false for equal size different elements', () => {
      const a = new AVLSet<number>()
      a.add(1)
      a.add(2)
      const b = new AVLSet<number>()
      b.add(3)
      b.add(4)
      expect(a.isSubsetOf(b)).toBe(false)
    })
  })

  describe('isSupersetOf', () => {
    it('returns true for superset', () => {
      const a = new AVLSet<number>()
      a.add(1)
      a.add(2)
      a.add(3)
      const b = new AVLSet<number>()
      b.add(1)
      b.add(2)
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('returns false when not superset', () => {
      const a = new AVLSet<number>()
      a.add(1)
      a.add(2)
      const b = new AVLSet<number>()
      b.add(1)
      b.add(2)
      b.add(3)
      expect(a.isSupersetOf(b)).toBe(false)
    })

    it('returns true when other is empty', () => {
      const a = new AVLSet<number>()
      a.add(1)
      const b = new AVLSet<number>()
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('returns true when both empty', () => {
      const a = new AVLSet<number>()
      const b = new AVLSet<number>()
      expect(a.isSupersetOf(b)).toBe(true)
    })
  })

  describe('balance property', () => {
    it('stays balanced after sequential insertions', () => {
      const s = new AVLSet<number>()
      for (let i = 0; i < 100; i++) s.add(i)
      expect(s.isAVLBalanced).toBe(true)
    })

    it('stays balanced after reverse insertions', () => {
      const s = new AVLSet<number>()
      for (let i = 100; i >= 0; i--) s.add(i)
      expect(s.isAVLBalanced).toBe(true)
    })

    it('stays balanced after random-ish insertions', () => {
      const s = new AVLSet<number>()
      const values = [50, 25, 75, 12, 37, 62, 87, 6, 18, 31, 43, 56, 68, 81, 93]
      for (const v of values) s.add(v)
      expect(s.isAVLBalanced).toBe(true)
    })

    it('stays balanced after mixed add and delete', () => {
      const s = new AVLSet<number>()
      for (let i = 0; i < 50; i++) s.add(i)
      for (let i = 0; i < 25; i++) s.delete(i * 2)
      expect(s.isAVLBalanced).toBe(true)
    })

    it('stays balanced after deleting all', () => {
      const s = new AVLSet<number>()
      for (let i = 0; i < 30; i++) s.add(i)
      for (let i = 0; i < 30; i++) s.delete(i)
      expect(s.isAVLBalanced).toBe(true)
      expect(s.size).toBe(0)
    })
  })

  describe('generics', () => {
    it('works with strings', () => {
      const s = new AVLSet<string>({ comparator: (a, b) => a.localeCompare(b) })
      s.add('cherry')
      s.add('apple')
      s.add('banana')
      expect(s.toArray()).toEqual(['apple', 'banana', 'cherry'])
      expect(s.has('banana')).toBe(true)
      expect(s.min()).toBe('apple')
      expect(s.max()).toBe('cherry')
    })

    it('works with custom objects', () => {
      type Point = { x: number; y: number }
      const s = new AVLSet<Point>({ comparator: (a, b) => a.x - b.x || a.y - b.y })
      s.add({ x: 3, y: 1 })
      s.add({ x: 1, y: 2 })
      s.add({ x: 2, y: 3 })
      expect(s.size).toBe(3)
      expect(s.min()).toEqual({ x: 1, y: 2 })
      expect(s.max()).toEqual({ x: 3, y: 1 })
    })

    it('works with negative numbers', () => {
      const s = new AVLSet<number>()
      s.add(-5)
      s.add(-1)
      s.add(0)
      s.add(3)
      s.add(10)
      expect(s.toArray()).toEqual([-5, -1, 0, 3, 10])
      expect(s.min()).toBe(-5)
      expect(s.max()).toBe(10)
    })
  })

  describe('stress test', () => {
    it('handles large number of operations', () => {
      const s = new AVLSet<number>()
      const n = 500
      for (let i = 0; i < n; i++) s.add(i)
      expect(s.size).toBe(n)
      expect(s.isAVLBalanced).toBe(true)
      for (let i = 0; i < n; i += 2) s.delete(i)
      expect(s.size).toBe(n / 2)
      expect(s.isAVLBalanced).toBe(true)
      for (let i = 0; i < n; i++) {
        if (i % 2 === 0) {
          expect(s.has(i)).toBe(false)
        } else {
          expect(s.has(i)).toBe(true)
        }
      }
    })

    it('indexOf and at are consistent', () => {
      const s = new AVLSet<number>()
      for (let i = 0; i < 100; i++) s.add(i)
      for (let i = 0; i < 100; i++) {
        expect(s.indexOf(s.at(i)!)).toBe(i)
      }
    })

    it('toArray and iterator produce same result', () => {
      const s = new AVLSet<number>()
      for (let i = 0; i < 50; i++) s.add(i)
      expect(s.toArray()).toEqual([...s])
    })

    it('set operations are correct after many modifications', () => {
      const a = new AVLSet<number>()
      const b = new AVLSet<number>()
      for (let i = 0; i < 50; i++) a.add(i)
      for (let i = 25; i < 75; i++) b.add(i)
      const u = a.union(b)
      expect(u.size).toBe(75)
      const inter = a.intersection(b)
      expect(inter.size).toBe(25)
      const diff = a.difference(b)
      expect(diff.size).toBe(25)
      expect(a.isSubsetOf(u)).toBe(true)
      expect(b.isSubsetOf(u)).toBe(true)
    })
  })
})
