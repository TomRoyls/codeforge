import { describe, it, expect } from 'vitest'
import { IntervalHeap } from '../../src/core/interval-heap/index.js'
import type { Comparator } from '../../src/core/interval-heap/types.js'

const reverseComparator: Comparator<number> = (a, b) => b - a
const stringComparator: Comparator<string> = (a, b) => a.localeCompare(b)
const absComparator: Comparator<number> = (a, b) => Math.abs(a) - Math.abs(b)

describe('IntervalHeap', () => {
  describe('constructor', () => {
    it('creates empty heap', () => {
      const h = new IntervalHeap<number>()
      expect(h.size).toBe(0)
      expect(h.isEmpty).toBe(true)
    })

    it('creates heap with custom comparator', () => {
      const h = new IntervalHeap<number>({ comparator: reverseComparator })
      expect(h.size).toBe(0)
    })

    it('creates heap with empty options', () => {
      const h = new IntervalHeap<number>({})
      expect(h.isEmpty).toBe(true)
    })

    it('accepts undefined options', () => {
      const h = new IntervalHeap<number>(undefined)
      expect(h.isEmpty).toBe(true)
    })

    it('creates heap with string comparator', () => {
      const h = new IntervalHeap<string>({ comparator: stringComparator })
      expect(h.isEmpty).toBe(true)
    })
  })

  describe('insert', () => {
    it('inserts single element', () => {
      const h = new IntervalHeap<number>()
      h.insert(10)
      expect(h.size).toBe(1)
      expect(h.getMin()).toBe(10)
      expect(h.getMax()).toBe(10)
    })

    it('inserts two elements', () => {
      const h = new IntervalHeap<number>()
      h.insert(5)
      h.insert(10)
      expect(h.size).toBe(2)
      expect(h.getMin()).toBe(5)
      expect(h.getMax()).toBe(10)
    })

    it('inserts two elements in reverse order', () => {
      const h = new IntervalHeap<number>()
      h.insert(10)
      h.insert(5)
      expect(h.size).toBe(2)
      expect(h.getMin()).toBe(5)
      expect(h.getMax()).toBe(10)
    })

    it('inserts three elements', () => {
      const h = new IntervalHeap<number>()
      h.insert(5)
      h.insert(10)
      h.insert(3)
      expect(h.size).toBe(3)
      expect(h.getMin()).toBe(3)
      expect(h.getMax()).toBe(10)
    })

    it('inserts many elements maintaining min/max', () => {
      const h = new IntervalHeap<number>()
      const values = [50, 30, 70, 10, 90, 20, 80, 40, 60]
      for (const v of values) h.insert(v)
      expect(h.getMin()).toBe(10)
      expect(h.getMax()).toBe(90)
      expect(h.size).toBe(9)
    })

    it('inserts duplicate values', () => {
      const h = new IntervalHeap<number>()
      h.insert(5)
      h.insert(5)
      h.insert(5)
      expect(h.size).toBe(3)
      expect(h.getMin()).toBe(5)
      expect(h.getMax()).toBe(5)
    })

    it('inserts negative numbers', () => {
      const h = new IntervalHeap<number>()
      h.insert(-5)
      h.insert(-10)
      h.insert(-1)
      expect(h.getMin()).toBe(-10)
      expect(h.getMax()).toBe(-1)
    })

    it('inserts zero', () => {
      const h = new IntervalHeap<number>()
      h.insert(0)
      h.insert(1)
      h.insert(-1)
      expect(h.getMin()).toBe(-1)
      expect(h.getMax()).toBe(1)
    })

    it('inserts floating point numbers', () => {
      const h = new IntervalHeap<number>()
      h.insert(3.14)
      h.insert(1.41)
      h.insert(2.72)
      expect(h.getMin()).toBeCloseTo(1.41)
      expect(h.getMax()).toBeCloseTo(3.14)
    })

    it('inserts string values', () => {
      const h = new IntervalHeap<string>()
      h.insert('cherry')
      h.insert('apple')
      h.insert('banana')
      expect(h.getMin()).toBe('apple')
      expect(h.getMax()).toBe('cherry')
    })

    it('inserts sorted sequence', () => {
      const h = new IntervalHeap<number>()
      for (let i = 1; i <= 10; i++) h.insert(i)
      expect(h.size).toBe(10)
      expect(h.getMin()).toBe(1)
      expect(h.getMax()).toBe(10)
    })

    it('inserts reverse sorted sequence', () => {
      const h = new IntervalHeap<number>()
      for (let i = 10; i >= 1; i--) h.insert(i)
      expect(h.size).toBe(10)
      expect(h.getMin()).toBe(1)
      expect(h.getMax()).toBe(10)
    })
  })

  describe('getMin', () => {
    it('throws on empty heap', () => {
      const h = new IntervalHeap<number>()
      expect(() => h.getMin()).toThrow('getMin called on empty heap')
    })

    it('returns single element', () => {
      const h = new IntervalHeap<number>()
      h.insert(42)
      expect(h.getMin()).toBe(42)
    })

    it('returns minimum of multiple elements', () => {
      const h = new IntervalHeap<number>()
      h.insert(5)
      h.insert(3)
      h.insert(1)
      h.insert(4)
      h.insert(2)
      expect(h.getMin()).toBe(1)
    })

    it('does not remove element', () => {
      const h = new IntervalHeap<number>()
      h.insert(1)
      h.insert(2)
      h.getMin()
      expect(h.size).toBe(2)
      expect(h.getMin()).toBe(1)
    })

    it('returns updated min after deleteMin', () => {
      const h = new IntervalHeap<number>()
      h.insert(1)
      h.insert(2)
      h.insert(3)
      h.deleteMin()
      expect(h.getMin()).toBe(2)
    })

    it('returns same min after inserting larger', () => {
      const h = new IntervalHeap<number>()
      h.insert(1)
      h.insert(100)
      expect(h.getMin()).toBe(1)
    })
  })

  describe('getMax', () => {
    it('throws on empty heap', () => {
      const h = new IntervalHeap<number>()
      expect(() => h.getMax()).toThrow('getMax called on empty heap')
    })

    it('returns single element', () => {
      const h = new IntervalHeap<number>()
      h.insert(42)
      expect(h.getMax()).toBe(42)
    })

    it('returns maximum of multiple elements', () => {
      const h = new IntervalHeap<number>()
      h.insert(5)
      h.insert(3)
      h.insert(1)
      h.insert(4)
      h.insert(2)
      expect(h.getMax()).toBe(5)
    })

    it('does not remove element', () => {
      const h = new IntervalHeap<number>()
      h.insert(1)
      h.insert(2)
      h.getMax()
      expect(h.size).toBe(2)
      expect(h.getMax()).toBe(2)
    })

    it('returns updated max after deleteMax', () => {
      const h = new IntervalHeap<number>()
      h.insert(1)
      h.insert(2)
      h.insert(3)
      h.deleteMax()
      expect(h.getMax()).toBe(2)
    })
  })

  describe('deleteMin', () => {
    it('throws on empty heap', () => {
      const h = new IntervalHeap<number>()
      expect(() => h.deleteMin()).toThrow('deleteMin called on empty heap')
    })

    it('deletes single element', () => {
      const h = new IntervalHeap<number>()
      h.insert(42)
      expect(h.deleteMin()).toBe(42)
      expect(h.isEmpty).toBe(true)
    })

    it('deletes min from two elements', () => {
      const h = new IntervalHeap<number>()
      h.insert(3)
      h.insert(7)
      expect(h.deleteMin()).toBe(3)
      expect(h.size).toBe(1)
      expect(h.getMin()).toBe(7)
    })

    it('extracts all elements in sorted order', () => {
      const h = new IntervalHeap<number>()
      h.insert(5)
      h.insert(3)
      h.insert(8)
      h.insert(1)
      h.insert(9)
      h.insert(2)
      h.insert(7)
      const result: number[] = []
      while (!h.isEmpty) result.push(h.deleteMin())
      expect(result).toEqual([1, 2, 3, 5, 7, 8, 9])
    })

    it('handles duplicates', () => {
      const h = new IntervalHeap<number>()
      h.insert(3)
      h.insert(3)
      h.insert(1)
      h.insert(1)
      h.insert(2)
      h.insert(2)
      const result: number[] = []
      while (!h.isEmpty) result.push(h.deleteMin())
      expect(result).toEqual([1, 1, 2, 2, 3, 3])
    })

    it('maintains max after deleteMin', () => {
      const h = new IntervalHeap<number>()
      h.insert(5)
      h.insert(3)
      h.insert(9)
      h.insert(1)
      h.deleteMin()
      expect(h.getMax()).toBe(9)
      h.deleteMin()
      expect(h.getMax()).toBe(9)
    })

    it('updates size after deleteMin', () => {
      const h = new IntervalHeap<number>()
      h.insert(1)
      h.insert(2)
      h.insert(3)
      expect(h.size).toBe(3)
      h.deleteMin()
      expect(h.size).toBe(2)
      h.deleteMin()
      expect(h.size).toBe(1)
      h.deleteMin()
      expect(h.size).toBe(0)
    })

    it('deleteMin from single element leaves empty', () => {
      const h = new IntervalHeap<number>()
      h.insert(42)
      expect(h.deleteMin()).toBe(42)
      expect(h.isEmpty).toBe(true)
      expect(h.size).toBe(0)
    })
  })

  describe('deleteMax', () => {
    it('throws on empty heap', () => {
      const h = new IntervalHeap<number>()
      expect(() => h.deleteMax()).toThrow('deleteMax called on empty heap')
    })

    it('deletes single element', () => {
      const h = new IntervalHeap<number>()
      h.insert(42)
      expect(h.deleteMax()).toBe(42)
      expect(h.isEmpty).toBe(true)
    })

    it('deletes max from two elements', () => {
      const h = new IntervalHeap<number>()
      h.insert(3)
      h.insert(7)
      expect(h.deleteMax()).toBe(7)
      expect(h.size).toBe(1)
      expect(h.getMax()).toBe(3)
    })

    it('extracts all elements in descending order', () => {
      const h = new IntervalHeap<number>()
      h.insert(5)
      h.insert(3)
      h.insert(8)
      h.insert(1)
      h.insert(9)
      h.insert(2)
      h.insert(7)
      const result: number[] = []
      while (!h.isEmpty) result.push(h.deleteMax())
      expect(result).toEqual([9, 8, 7, 5, 3, 2, 1])
    })

    it('handles duplicates', () => {
      const h = new IntervalHeap<number>()
      h.insert(3)
      h.insert(3)
      h.insert(1)
      h.insert(1)
      h.insert(2)
      h.insert(2)
      const result: number[] = []
      while (!h.isEmpty) result.push(h.deleteMax())
      expect(result).toEqual([3, 3, 2, 2, 1, 1])
    })

    it('maintains min after deleteMax', () => {
      const h = new IntervalHeap<number>()
      h.insert(5)
      h.insert(3)
      h.insert(9)
      h.insert(1)
      h.deleteMax()
      expect(h.getMin()).toBe(1)
      h.deleteMax()
      expect(h.getMin()).toBe(1)
    })

    it('deletes max from single element', () => {
      const h = new IntervalHeap<number>()
      h.insert(42)
      expect(h.deleteMax()).toBe(42)
      expect(h.isEmpty).toBe(true)
    })
  })

  describe('mixed min/max extraction', () => {
    it('alternating deleteMin and deleteMax', () => {
      const h = new IntervalHeap<number>()
      for (let i = 1; i <= 8; i++) h.insert(i)
      expect(h.deleteMin()).toBe(1)
      expect(h.deleteMax()).toBe(8)
      expect(h.deleteMin()).toBe(2)
      expect(h.deleteMax()).toBe(7)
      expect(h.deleteMin()).toBe(3)
      expect(h.deleteMax()).toBe(6)
      expect(h.deleteMin()).toBe(4)
      expect(h.deleteMax()).toBe(5)
      expect(h.isEmpty).toBe(true)
    })

    it('deleteMin then deleteMax then deleteMin', () => {
      const h = new IntervalHeap<number>()
      h.insert(10)
      h.insert(20)
      h.insert(30)
      expect(h.deleteMin()).toBe(10)
      expect(h.deleteMax()).toBe(30)
      expect(h.deleteMin()).toBe(20)
      expect(h.isEmpty).toBe(true)
    })

    it('deleteMax then deleteMin', () => {
      const h = new IntervalHeap<number>()
      h.insert(10)
      h.insert(20)
      h.insert(30)
      expect(h.deleteMax()).toBe(30)
      expect(h.deleteMin()).toBe(10)
      expect(h.size).toBe(1)
    })

    it('all same values extracted correctly', () => {
      const h = new IntervalHeap<number>()
      for (let i = 0; i < 5; i++) h.insert(5)
      for (let i = 0; i < 5; i++) {
        expect(h.deleteMin()).toBe(5)
      }
      expect(h.isEmpty).toBe(true)
    })

    it('alternating insert and delete', () => {
      const h = new IntervalHeap<number>()
      h.insert(5)
      expect(h.deleteMin()).toBe(5)
      h.insert(3)
      h.insert(7)
      expect(h.deleteMax()).toBe(7)
      expect(h.deleteMin()).toBe(3)
      expect(h.isEmpty).toBe(true)
    })

    it('insert after full extraction', () => {
      const h = new IntervalHeap<number>()
      h.insert(1)
      h.insert(2)
      h.insert(3)
      while (!h.isEmpty) h.deleteMin()
      h.insert(10)
      expect(h.size).toBe(1)
      expect(h.getMin()).toBe(10)
      expect(h.getMax()).toBe(10)
    })
  })

  describe('replaceMin', () => {
    it('throws on empty heap', () => {
      const h = new IntervalHeap<number>()
      expect(() => h.replaceMin(1)).toThrow('replaceMin called on empty heap')
    })

    it('replaces single element', () => {
      const h = new IntervalHeap<number>()
      h.insert(5)
      const old = h.replaceMin(10)
      expect(old).toBe(5)
      expect(h.getMin()).toBe(10)
      expect(h.getMax()).toBe(10)
    })

    it('replaces min with larger value', () => {
      const h = new IntervalHeap<number>()
      h.insert(1)
      h.insert(5)
      h.insert(3)
      const old = h.replaceMin(10)
      expect(old).toBe(1)
      expect(h.size).toBe(3)
      const sorted: number[] = []
      while (!h.isEmpty) sorted.push(h.deleteMin())
      const copy = [...sorted].sort((a, b) => a - b)
      expect(sorted).toEqual(copy)
    })

    it('replaces min with smaller value', () => {
      const h = new IntervalHeap<number>()
      h.insert(1)
      h.insert(5)
      h.insert(3)
      const old = h.replaceMin(0)
      expect(old).toBe(1)
      expect(h.getMin()).toBe(0)
    })

    it('replaces min maintaining heap property', () => {
      const h = new IntervalHeap<number>()
      for (let i = 1; i <= 7; i++) h.insert(i)
      h.replaceMin(100)
      expect(h.getMax()).toBe(100)
      const result: number[] = []
      while (!h.isEmpty) result.push(h.deleteMin())
      expect(result).toEqual([2, 3, 4, 5, 6, 7, 100])
    })
  })

  describe('replaceMax', () => {
    it('throws on empty heap', () => {
      const h = new IntervalHeap<number>()
      expect(() => h.replaceMax(1)).toThrow('replaceMax called on empty heap')
    })

    it('replaces single element', () => {
      const h = new IntervalHeap<number>()
      h.insert(5)
      const old = h.replaceMax(10)
      expect(old).toBe(5)
      expect(h.getMin()).toBe(10)
      expect(h.getMax()).toBe(10)
    })

    it('replaces max with smaller value', () => {
      const h = new IntervalHeap<number>()
      h.insert(1)
      h.insert(5)
      h.insert(3)
      const old = h.replaceMax(0)
      expect(old).toBe(5)
      expect(h.size).toBe(3)
      const sorted: number[] = []
      while (!h.isEmpty) sorted.push(h.deleteMin())
      const copy = [...sorted].sort((a, b) => a - b)
      expect(sorted).toEqual(copy)
    })

    it('replaces max with larger value', () => {
      const h = new IntervalHeap<number>()
      h.insert(1)
      h.insert(5)
      h.insert(3)
      const old = h.replaceMax(10)
      expect(old).toBe(5)
      expect(h.getMax()).toBe(10)
    })

    it('replaces max maintaining heap property', () => {
      const h = new IntervalHeap<number>()
      for (let i = 1; i <= 7; i++) h.insert(i)
      h.replaceMax(0)
      expect(h.getMin()).toBe(0)
      const result: number[] = []
      while (!h.isEmpty) result.push(h.deleteMax())
      expect(result).toEqual([6, 5, 4, 3, 2, 1, 0])
    })
  })

  describe('size', () => {
    it('returns 0 for empty heap', () => {
      const h = new IntervalHeap<number>()
      expect(h.size).toBe(0)
    })

    it('returns correct size after inserts', () => {
      const h = new IntervalHeap<number>()
      h.insert(1)
      expect(h.size).toBe(1)
      h.insert(2)
      expect(h.size).toBe(2)
      h.insert(3)
      expect(h.size).toBe(3)
    })

    it('returns correct size after deletions', () => {
      const h = new IntervalHeap<number>()
      h.insert(1)
      h.insert(2)
      h.insert(3)
      h.deleteMin()
      expect(h.size).toBe(2)
      h.deleteMin()
      expect(h.size).toBe(1)
    })

    it('returns 0 after clear', () => {
      const h = new IntervalHeap<number>()
      h.insert(1)
      h.insert(2)
      h.clear()
      expect(h.size).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new heap', () => {
      const h = new IntervalHeap<number>()
      expect(h.isEmpty).toBe(true)
    })

    it('returns false after insert', () => {
      const h = new IntervalHeap<number>()
      h.insert(1)
      expect(h.isEmpty).toBe(false)
    })

    it('returns true after deleting all elements', () => {
      const h = new IntervalHeap<number>()
      h.insert(1)
      h.insert(2)
      h.deleteMin()
      h.deleteMin()
      expect(h.isEmpty).toBe(true)
    })

    it('returns true after clear', () => {
      const h = new IntervalHeap<number>()
      h.insert(1)
      h.clear()
      expect(h.isEmpty).toBe(true)
    })

    it('returns false after clear and insert', () => {
      const h = new IntervalHeap<number>()
      h.insert(1)
      h.clear()
      h.insert(1)
      expect(h.isEmpty).toBe(false)
    })
  })

  describe('clear', () => {
    it('clears empty heap without error', () => {
      const h = new IntervalHeap<number>()
      h.clear()
      expect(h.size).toBe(0)
      expect(h.isEmpty).toBe(true)
    })

    it('clears non-empty heap', () => {
      const h = new IntervalHeap<number>()
      h.insert(1)
      h.insert(2)
      h.insert(3)
      h.clear()
      expect(h.size).toBe(0)
      expect(h.isEmpty).toBe(true)
    })

    it('allows operations after clear', () => {
      const h = new IntervalHeap<number>()
      h.insert(1)
      h.clear()
      h.insert(10)
      expect(h.size).toBe(1)
      expect(h.getMin()).toBe(10)
    })

    it('double clear is safe', () => {
      const h = new IntervalHeap<number>()
      h.insert(1)
      h.clear()
      h.clear()
      expect(h.size).toBe(0)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty heap', () => {
      const h = new IntervalHeap<number>()
      expect(h.toArray()).toEqual([])
    })

    it('returns single element', () => {
      const h = new IntervalHeap<number>()
      h.insert(42)
      expect(h.toArray()).toEqual([42])
    })

    it('returns elements in sorted order', () => {
      const h = new IntervalHeap<number>()
      h.insert(5)
      h.insert(3)
      h.insert(1)
      h.insert(4)
      h.insert(2)
      expect(h.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('does not modify the heap', () => {
      const h = new IntervalHeap<number>()
      h.insert(3)
      h.insert(1)
      h.insert(2)
      h.toArray()
      expect(h.size).toBe(3)
      expect(h.getMin()).toBe(1)
    })

    it('handles duplicates', () => {
      const h = new IntervalHeap<number>()
      h.insert(3)
      h.insert(1)
      h.insert(3)
      h.insert(1)
      h.insert(2)
      expect(h.toArray()).toEqual([1, 1, 2, 3, 3])
    })

    it('handles string elements', () => {
      const h = new IntervalHeap<string>()
      h.insert('cherry')
      h.insert('apple')
      h.insert('banana')
      expect(h.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('returns new array each time', () => {
      const h = new IntervalHeap<number>()
      h.insert(1)
      h.insert(2)
      const arr1 = h.toArray()
      const arr2 = h.toArray()
      expect(arr1).toEqual(arr2)
      expect(arr1).not.toBe(arr2)
    })
  })

  describe('contains', () => {
    it('returns false for empty heap', () => {
      const h = new IntervalHeap<number>()
      expect(h.contains(1)).toBe(false)
    })

    it('returns true for element in heap', () => {
      const h = new IntervalHeap<number>()
      h.insert(5)
      h.insert(3)
      h.insert(1)
      expect(h.contains(3)).toBe(true)
    })

    it('returns true for min element', () => {
      const h = new IntervalHeap<number>()
      h.insert(1)
      expect(h.contains(1)).toBe(true)
    })

    it('returns true for max element', () => {
      const h = new IntervalHeap<number>()
      h.insert(5)
      h.insert(10)
      expect(h.contains(10)).toBe(true)
    })

    it('returns false for missing element', () => {
      const h = new IntervalHeap<number>()
      h.insert(1)
      h.insert(3)
      h.insert(5)
      expect(h.contains(4)).toBe(false)
    })

    it('returns false after deletion', () => {
      const h = new IntervalHeap<number>()
      h.insert(1)
      h.insert(2)
      h.deleteMin()
      expect(h.contains(1)).toBe(false)
    })

    it('returns false after clear', () => {
      const h = new IntervalHeap<number>()
      h.insert(5)
      h.clear()
      expect(h.contains(5)).toBe(false)
    })

    it('handles duplicate values', () => {
      const h = new IntervalHeap<number>()
      h.insert(1)
      h.insert(1)
      h.deleteMin()
      expect(h.contains(1)).toBe(true)
    })

    it('works with string values', () => {
      const h = new IntervalHeap<string>()
      h.insert('hello')
      expect(h.contains('hello')).toBe(true)
      expect(h.contains('world')).toBe(false)
    })
  })

  describe('merge', () => {
    it('merges into empty heap', () => {
      const a = new IntervalHeap<number>()
      const b = new IntervalHeap<number>()
      b.insert(1)
      b.insert(2)
      b.insert(3)
      a.merge(b)
      expect(a.size).toBe(3)
      expect(a.getMin()).toBe(1)
    })

    it('merges empty into non-empty', () => {
      const a = new IntervalHeap<number>()
      a.insert(1)
      const b = new IntervalHeap<number>()
      a.merge(b)
      expect(a.size).toBe(1)
      expect(a.getMin()).toBe(1)
    })

    it('merges two non-empty heaps', () => {
      const a = new IntervalHeap<number>()
      a.insert(1)
      a.insert(3)
      a.insert(5)
      const b = new IntervalHeap<number>()
      b.insert(2)
      b.insert(4)
      b.insert(6)
      a.merge(b)
      expect(a.size).toBe(6)
      expect(a.toArray()).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('is destructive for source heap', () => {
      const a = new IntervalHeap<number>()
      a.insert(1)
      const b = new IntervalHeap<number>()
      b.insert(2)
      a.merge(b)
      expect(b.size).toBe(0)
      expect(b.isEmpty).toBe(true)
    })

    it('handles merging with itself (no-op)', () => {
      const a = new IntervalHeap<number>()
      a.insert(1)
      a.insert(2)
      a.merge(a)
      expect(a.size).toBe(2)
    })

    it('merge followed by deleteMin produces correct order', () => {
      const a = new IntervalHeap<number>()
      a.insert(4)
      a.insert(1)
      a.insert(7)
      const b = new IntervalHeap<number>()
      b.insert(3)
      b.insert(6)
      b.insert(2)
      a.merge(b)
      const result: number[] = []
      while (!a.isEmpty) result.push(a.deleteMin())
      expect(result).toEqual([1, 2, 3, 4, 6, 7])
    })

    it('merges two empty heaps', () => {
      const a = new IntervalHeap<number>()
      const b = new IntervalHeap<number>()
      a.merge(b)
      expect(a.size).toBe(0)
      expect(a.isEmpty).toBe(true)
    })

    it('merges large heaps', () => {
      const a = new IntervalHeap<number>()
      for (let i = 0; i < 50; i++) a.insert(i * 2)
      const b = new IntervalHeap<number>()
      for (let i = 0; i < 50; i++) b.insert(i * 2 + 1)
      a.merge(b)
      expect(a.size).toBe(100)
      expect(a.getMin()).toBe(0)
      for (let i = 0; i < 100; i++) {
        expect(a.deleteMin()).toBe(i)
      }
    })
  })

  describe('custom comparator', () => {
    it('works as max-min heap with reverse comparator', () => {
      const h = new IntervalHeap<number>({ comparator: reverseComparator })
      h.insert(1)
      h.insert(5)
      h.insert(3)
      h.insert(2)
      h.insert(4)
      expect(h.toArray()).toEqual([5, 4, 3, 2, 1])
    })

    it('getMin returns largest with reverse comparator', () => {
      const h = new IntervalHeap<number>({ comparator: reverseComparator })
      h.insert(1)
      h.insert(5)
      h.insert(3)
      expect(h.getMin()).toBe(5)
      expect(h.getMax()).toBe(1)
    })

    it('deleteMin extracts largest with reverse comparator', () => {
      const h = new IntervalHeap<number>({ comparator: reverseComparator })
      h.insert(1)
      h.insert(5)
      h.insert(3)
      expect(h.deleteMin()).toBe(5)
      expect(h.deleteMin()).toBe(3)
      expect(h.deleteMin()).toBe(1)
    })

    it('works with absolute value comparator', () => {
      const h = new IntervalHeap<number>({ comparator: absComparator })
      h.insert(-5)
      h.insert(3)
      h.insert(-1)
      h.insert(4)
      h.insert(-2)
      expect(h.deleteMin()).toBe(-1)
      expect(h.deleteMin()).toBe(-2)
      expect(h.deleteMin()).toBe(3)
    })

    it('works with string comparator', () => {
      const h = new IntervalHeap<string>({ comparator: stringComparator })
      h.insert('cherry')
      h.insert('apple')
      h.insert('banana')
      expect(h.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('works with object comparator', () => {
      interface Item { priority: number; name: string }
      const cmp: Comparator<Item> = (a, b) => a.priority - b.priority
      const h = new IntervalHeap<Item>({ comparator: cmp })
      h.insert({ priority: 3, name: 'low' })
      h.insert({ priority: 1, name: 'high' })
      h.insert({ priority: 2, name: 'medium' })
      expect(h.deleteMin().name).toBe('high')
      expect(h.deleteMin().name).toBe('medium')
      expect(h.deleteMin().name).toBe('low')
    })

    it('reverse comparator deleteMax extracts smallest', () => {
      const h = new IntervalHeap<number>({ comparator: reverseComparator })
      h.insert(1)
      h.insert(5)
      h.insert(3)
      expect(h.deleteMax()).toBe(1)
      expect(h.deleteMax()).toBe(3)
      expect(h.deleteMax()).toBe(5)
    })

    it('merge preserves comparator', () => {
      const a = new IntervalHeap<number>({ comparator: reverseComparator })
      a.insert(1)
      a.insert(2)
      const b = new IntervalHeap<number>({ comparator: reverseComparator })
      b.insert(3)
      a.merge(b)
      expect(a.size).toBe(3)
      const result: number[] = []
      while (!a.isEmpty) result.push(a.deleteMin())
      expect(result).toEqual([3, 2, 1])
    })
  })

  describe('edge cases', () => {
    it('single element full cycle', () => {
      const h = new IntervalHeap<number>()
      h.insert(1)
      expect(h.getMin()).toBe(1)
      expect(h.getMax()).toBe(1)
      expect(h.deleteMin()).toBe(1)
      expect(h.isEmpty).toBe(true)
      h.insert(3)
      expect(h.getMin()).toBe(3)
      expect(h.deleteMax()).toBe(3)
      expect(h.isEmpty).toBe(true)
    })

    it('two elements', () => {
      const h = new IntervalHeap<number>()
      h.insert(1)
      h.insert(2)
      expect(h.size).toBe(2)
      expect(h.getMin()).toBe(1)
      expect(h.getMax()).toBe(2)
      expect(h.deleteMin()).toBe(1)
      expect(h.deleteMax()).toBe(2)
      expect(h.isEmpty).toBe(true)
    })

    it('four elements', () => {
      const h = new IntervalHeap<number>()
      h.insert(4)
      h.insert(2)
      h.insert(3)
      h.insert(1)
      const result: number[] = []
      while (!h.isEmpty) result.push(h.deleteMin())
      expect(result).toEqual([1, 2, 3, 4])
    })

    it('six elements', () => {
      const h = new IntervalHeap<number>()
      h.insert(6)
      h.insert(5)
      h.insert(4)
      h.insert(3)
      h.insert(2)
      h.insert(1)
      const result: number[] = []
      while (!h.isEmpty) result.push(h.deleteMax())
      expect(result).toEqual([6, 5, 4, 3, 2, 1])
    })

    it('seven elements mixed extraction', () => {
      const h = new IntervalHeap<number>()
      for (let i = 1; i <= 7; i++) h.insert(i)
      const mins: number[] = []
      const maxs: number[] = []
      mins.push(h.deleteMin())
      maxs.push(h.deleteMax())
      mins.push(h.deleteMin())
      maxs.push(h.deleteMax())
      expect(mins).toEqual([1, 2])
      expect(maxs).toEqual([7, 6])
    })

    it('handles negative numbers', () => {
      const h = new IntervalHeap<number>()
      h.insert(-5)
      h.insert(-1)
      h.insert(-3)
      h.insert(-2)
      h.insert(-4)
      expect(h.toArray()).toEqual([-5, -4, -3, -2, -1])
    })

    it('handles mixed positive and negative', () => {
      const h = new IntervalHeap<number>()
      h.insert(-3)
      h.insert(5)
      h.insert(-1)
      h.insert(2)
      h.insert(0)
      h.insert(-4)
      h.insert(3)
      expect(h.toArray()).toEqual([-4, -3, -1, 0, 2, 3, 5])
    })

    it('handles large numbers', () => {
      const h = new IntervalHeap<number>()
      h.insert(Number.MAX_SAFE_INTEGER)
      h.insert(0)
      h.insert(-Number.MAX_SAFE_INTEGER)
      expect(h.getMin()).toBe(-Number.MAX_SAFE_INTEGER)
      expect(h.getMax()).toBe(Number.MAX_SAFE_INTEGER)
    })

    it('clear and rebuild', () => {
      const h = new IntervalHeap<number>()
      h.insert(5)
      h.insert(3)
      h.insert(1)
      h.clear()
      expect(h.isEmpty).toBe(true)
      h.insert(10)
      h.insert(20)
      h.insert(30)
      expect(h.toArray()).toEqual([10, 20, 30])
    })

    it('handles same element repeated', () => {
      const h = new IntervalHeap<number>()
      for (let i = 0; i < 5; i++) h.insert(5)
      expect(h.toArray()).toEqual([5, 5, 5, 5, 5])
    })

    it('alternating insert delete operations', () => {
      const h = new IntervalHeap<number>()
      h.insert(5)
      h.insert(3)
      expect(h.deleteMin()).toBe(3)
      h.insert(1)
      h.insert(7)
      expect(h.deleteMin()).toBe(1)
      expect(h.deleteMin()).toBe(5)
      expect(h.deleteMin()).toBe(7)
      expect(h.isEmpty).toBe(true)
    })

    it('replaceMin then extract all', () => {
      const h = new IntervalHeap<number>()
      h.insert(1)
      h.insert(2)
      h.insert(3)
      h.replaceMin(10)
      expect(h.toArray()).toEqual([2, 3, 10])
    })

    it('replaceMax then extract all', () => {
      const h = new IntervalHeap<number>()
      h.insert(1)
      h.insert(2)
      h.insert(3)
      h.replaceMax(0)
      expect(h.toArray()).toEqual([0, 1, 2])
    })

    it('push after partial delete', () => {
      const h = new IntervalHeap<number>()
      h.insert(1)
      h.insert(2)
      h.insert(3)
      h.deleteMin()
      h.deleteMin()
      expect(h.size).toBe(1)
      h.insert(10)
      h.insert(20)
      expect(h.toArray()).toEqual([3, 10, 20])
    })
  })

  describe('stress tests', () => {
    it('handles 500 sequential items', () => {
      const h = new IntervalHeap<number>()
      for (let i = 0; i < 500; i++) h.insert(i)
      expect(h.getMin()).toBe(0)
      expect(h.getMax()).toBe(499)
      expect(h.size).toBe(500)
      const result: number[] = []
      while (!h.isEmpty) result.push(h.deleteMin())
      expect(result).toEqual(Array.from({ length: 500 }, (_, i) => i))
    })

    it('handles 300 reverse sequential items', () => {
      const h = new IntervalHeap<number>()
      for (let i = 299; i >= 0; i--) h.insert(i)
      expect(h.getMin()).toBe(0)
      expect(h.getMax()).toBe(299)
      const result: number[] = []
      while (!h.isEmpty) result.push(h.deleteMin())
      expect(result).toEqual(Array.from({ length: 300 }, (_, i) => i))
    })

    it('handles 200+ random items deleteMin sorted', () => {
      const values: number[] = []
      for (let i = 0; i < 250; i++) {
        values.push(Math.floor(Math.random() * 10000))
      }
      const h = new IntervalHeap<number>()
      for (const v of values) h.insert(v)
      const result: number[] = []
      while (!h.isEmpty) result.push(h.deleteMin())
      expect(result.length).toBe(250)
      for (let i = 1; i < result.length; i++) {
        expect(result[i]).toBeGreaterThanOrEqual(result[i - 1])
      }
    })

    it('handles 200+ random items deleteMax sorted', () => {
      const values: number[] = []
      for (let i = 0; i < 250; i++) {
        values.push(Math.floor(Math.random() * 10000))
      }
      const h = new IntervalHeap<number>()
      for (const v of values) h.insert(v)
      const result: number[] = []
      while (!h.isEmpty) result.push(h.deleteMax())
      expect(result.length).toBe(250)
      for (let i = 1; i < result.length; i++) {
        expect(result[i]).toBeLessThanOrEqual(result[i - 1])
      }
    })

    it('handles 200+ random items mixed extraction', () => {
      const values: number[] = []
      for (let i = 0; i < 250; i++) {
        values.push(Math.floor(Math.random() * 10000))
      }
      const h = new IntervalHeap<number>()
      for (const v of values) h.insert(v)
      const mins: number[] = []
      const maxs: number[] = []
      let turn = true
      while (!h.isEmpty) {
        if (turn) {
          mins.push(h.deleteMin())
        } else {
          maxs.push(h.deleteMax())
        }
        turn = !turn
      }
      expect(mins.length + maxs.length).toBe(250)
      for (let i = 1; i < mins.length; i++) {
        expect(mins[i]).toBeGreaterThanOrEqual(mins[i - 1])
      }
      for (let i = 1; i < maxs.length; i++) {
        expect(maxs[i]).toBeLessThanOrEqual(maxs[i - 1])
      }
    })

    it('handles 1000 items with replaceMin', () => {
      const h = new IntervalHeap<number>()
      for (let i = 0; i < 1000; i++) h.insert(i)
      for (let i = 0; i < 100; i++) {
        h.replaceMin(1000 + i)
      }
      expect(h.size).toBe(1000)
      expect(h.getMax()).toBe(1099)
    })

    it('handles 1000 items with replaceMax', () => {
      const h = new IntervalHeap<number>()
      for (let i = 0; i < 1000; i++) h.insert(i)
      for (let i = 0; i < 100; i++) {
        h.replaceMax(-1 - i)
      }
      expect(h.size).toBe(1000)
      expect(h.getMin()).toBe(-100)
    })

    it('handles alternating insert and delete', () => {
      const h = new IntervalHeap<number>()
      for (let i = 0; i < 500; i++) {
        h.insert(i)
        if (i % 3 === 0 && h.size > 1) {
          h.deleteMin()
        }
      }
      const result: number[] = []
      while (!h.isEmpty) result.push(h.deleteMin())
      const copy = [...result].sort((a, b) => a - b)
      expect(result).toEqual(copy)
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates over empty heap', () => {
      const h = new IntervalHeap<number>()
      expect([...h]).toEqual([])
    })

    it('iterates in sorted order', () => {
      const h = new IntervalHeap<number>()
      h.insert(5)
      h.insert(3)
      h.insert(1)
      h.insert(4)
      h.insert(2)
      expect([...h]).toEqual([1, 2, 3, 4, 5])
    })

    it('does not modify heap', () => {
      const h = new IntervalHeap<number>()
      h.insert(3)
      h.insert(1)
      h.insert(2)
      ;[...h]
      expect(h.size).toBe(3)
      expect(h.getMin()).toBe(1)
    })

    it('works with for...of', () => {
      const h = new IntervalHeap<number>()
      h.insert(3)
      h.insert(1)
      h.insert(2)
      const result: number[] = []
      for (const val of h) result.push(val)
      expect(result).toEqual([1, 2, 3])
    })

    it('can be used multiple times', () => {
      const h = new IntervalHeap<number>()
      h.insert(3)
      h.insert(1)
      h.insert(2)
      expect([...h]).toEqual([1, 2, 3])
      expect([...h]).toEqual([1, 2, 3])
    })

    it('iteration after delete', () => {
      const h = new IntervalHeap<number>()
      h.insert(1)
      h.insert(2)
      h.insert(3)
      h.deleteMin()
      expect([...h]).toEqual([2, 3])
    })
  })

  describe('type exports', () => {
    it('IntervalHeapOptions is exported', () => {
      const opts: import('../../src/core/interval-heap/index.js').IntervalHeapOptions<number> = {
        comparator: (a, b) => a - b,
      }
      const h = new IntervalHeap(opts)
      h.insert(1)
      expect(h.size).toBe(1)
    })

    it('Comparator is exported', () => {
      const cmp: import('../../src/core/interval-heap/index.js').Comparator<number> = (a, b) => a - b
      const h = new IntervalHeap<number>({ comparator: cmp })
      h.insert(1)
      expect(h.getMin()).toBe(1)
    })

    it('IntervalNode is exported', () => {
      const node: import('../../src/core/interval-heap/index.js').IntervalNode<number> = {
        min: 1,
        max: 2,
      }
      expect(node.min).toBe(1)
      expect(node.max).toBe(2)
    })
  })
})
