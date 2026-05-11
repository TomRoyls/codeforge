import { describe, it, expect } from 'vitest'
import { LeftistHeap3 } from '../../src/core/leftist-heap-3/index.js'
import type { Comparator } from '../../src/core/leftist-heap-3/types.js'

const reverseComparator: Comparator<number> = (a, b) => b - a
const stringComparator: Comparator<string> = (a, b) => a.localeCompare(b)
const absComparator: Comparator<number> = (a, b) => Math.abs(a) - Math.abs(b)

describe('LeftistHeap3', () => {
  describe('constructor', () => {
    it('creates empty heap with no arguments', () => {
      const heap = new LeftistHeap3<number>()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty).toBe(true)
    })

    it('creates heap with options object (comparator)', () => {
      const heap = new LeftistHeap3<number>({ comparator: reverseComparator })
      heap.insert(1)
      heap.insert(5)
      heap.insert(3)
      expect(heap.peek()).toBe(5)
    })

    it('creates heap with default comparator', () => {
      const heap = new LeftistHeap3<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(1)
      expect(heap.peek()).toBe(1)
    })

    it('creates heap with undefined options', () => {
      const heap = new LeftistHeap3<number>(undefined)
      expect(heap.size).toBe(0)
      expect(heap.isEmpty).toBe(true)
    })

    it('creates heap with string type', () => {
      const heap = new LeftistHeap3<string>()
      heap.insert('cherry')
      heap.insert('apple')
      heap.insert('banana')
      expect(heap.peek()).toBe('apple')
    })
  })

  describe('insert', () => {
    it('inserts into empty heap', () => {
      const heap = new LeftistHeap3<number>()
      heap.insert(5)
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(5)
    })

    it('returns a node with the value', () => {
      const heap = new LeftistHeap3<number>()
      const node = heap.insert(5)
      expect(node.value).toBe(5)
    })

    it('inserts smaller element as new min', () => {
      const heap = new LeftistHeap3<number>()
      heap.insert(10)
      heap.insert(20)
      heap.insert(30)
      heap.insert(5)
      expect(heap.peek()).toBe(5)
    })

    it('inserts larger element', () => {
      const heap = new LeftistHeap3<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.insert(100)
      expect(heap.peek()).toBe(1)
      expect(heap.size).toBe(4)
    })

    it('inserts duplicate element', () => {
      const heap = new LeftistHeap3<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.insert(2)
      expect(heap.size).toBe(4)
      expect(heap.peek()).toBe(1)
    })

    it('maintains leftist property after many inserts', () => {
      const heap = new LeftistHeap3<number>()
      for (let i = 20; i >= 1; i--) {
        heap.insert(i)
      }
      expect(heap.isValid()).toBe(true)
    })

    it('inserts many elements in order', () => {
      const heap = new LeftistHeap3<number>()
      for (let i = 0; i < 50; i++) {
        heap.insert(i)
      }
      expect(heap.size).toBe(50)
      expect(heap.peek()).toBe(0)
      expect(heap.isValid()).toBe(true)
    })

    it('inserts many elements in reverse order', () => {
      const heap = new LeftistHeap3<number>()
      for (let i = 49; i >= 0; i--) {
        heap.insert(i)
      }
      expect(heap.size).toBe(50)
      expect(heap.peek()).toBe(0)
      expect(heap.isValid()).toBe(true)
    })

    it('inserts negative numbers', () => {
      const heap = new LeftistHeap3<number>()
      heap.insert(-5)
      heap.insert(-10)
      heap.insert(-1)
      expect(heap.peek()).toBe(-10)
    })

    it('inserts zero', () => {
      const heap = new LeftistHeap3<number>()
      heap.insert(0)
      heap.insert(1)
      heap.insert(-1)
      expect(heap.peek()).toBe(-1)
    })
  })

  describe('extractMin', () => {
    it('throws on empty heap', () => {
      const heap = new LeftistHeap3<number>()
      expect(() => heap.extractMin()).toThrow('Heap is empty')
    })

    it('extracts the only element', () => {
      const heap = new LeftistHeap3<number>()
      heap.insert(42)
      expect(heap.extractMin()).toBe(42)
      expect(heap.size).toBe(0)
      expect(heap.isEmpty).toBe(true)
    })

    it('extracts elements in sorted order', () => {
      const heap = new LeftistHeap3<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(1)
      heap.insert(4)
      heap.insert(2)
      const result: number[] = []
      while (!heap.isEmpty) {
        result.push(heap.extractMin())
      }
      expect(result).toEqual([1, 2, 3, 4, 5])
    })

    it('updates size after extraction', () => {
      const heap = new LeftistHeap3<number>()
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      expect(heap.size).toBe(3)
      heap.extractMin()
      expect(heap.size).toBe(2)
      heap.extractMin()
      expect(heap.size).toBe(1)
      heap.extractMin()
      expect(heap.size).toBe(0)
    })

    it('maintains heap property after extraction', () => {
      const heap = new LeftistHeap3<number>()
      const values = [5, 3, 7, 1, 4, 6, 2]
      for (const v of values) heap.insert(v)
      heap.extractMin()
      expect(heap.isValid()).toBe(true)
    })

    it('maintains heap property through multiple extractions', () => {
      const heap = new LeftistHeap3<number>()
      const values = [5, 3, 7, 1, 4, 6, 2]
      for (const v of values) heap.insert(v)
      for (let i = 0; i < 7; i++) {
        heap.extractMin()
        expect(heap.isValid()).toBe(true)
      }
    })

    it('extracts duplicate values correctly', () => {
      const heap = new LeftistHeap3<number>()
      for (const v of [2, 1, 2, 1, 2]) heap.insert(v)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(2)
      expect(heap.extractMin()).toBe(2)
      expect(heap.extractMin()).toBe(2)
    })

    it('extracts from large heap in order', () => {
      const heap = new LeftistHeap3<number>()
      for (let i = 50; i >= 1; i--) {
        heap.insert(i)
      }
      const result: number[] = []
      while (!heap.isEmpty) {
        result.push(heap.extractMin())
      }
      for (let i = 0; i < 50; i++) {
        expect(result[i]).toBe(i + 1)
      }
    })

    it('works with custom comparator (max heap)', () => {
      const heap = new LeftistHeap3<number>({ comparator: reverseComparator })
      for (const v of [1, 2, 3, 4, 5]) heap.insert(v)
      expect(heap.extractMin()).toBe(5)
      expect(heap.extractMin()).toBe(4)
      expect(heap.extractMin()).toBe(3)
    })
  })

  describe('peek', () => {
    it('throws on empty heap', () => {
      const heap = new LeftistHeap3<number>()
      expect(() => heap.peek()).toThrow('Heap is empty')
    })

    it('returns minimum element', () => {
      const heap = new LeftistHeap3<number>()
      for (const v of [5, 3, 1, 4, 2]) heap.insert(v)
      expect(heap.peek()).toBe(1)
    })

    it('does not remove the element', () => {
      const heap = new LeftistHeap3<number>()
      for (const v of [1, 2, 3]) heap.insert(v)
      heap.peek()
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(1)
    })

    it('returns updated min after extractMin', () => {
      const heap = new LeftistHeap3<number>()
      for (const v of [1, 2, 3]) heap.insert(v)
      heap.extractMin()
      expect(heap.peek()).toBe(2)
    })

    it('returns updated min after insert of smaller element', () => {
      const heap = new LeftistHeap3<number>()
      for (const v of [5, 10, 15]) heap.insert(v)
      heap.insert(1)
      expect(heap.peek()).toBe(1)
    })
  })

  describe('merge', () => {
    it('merges two empty heaps', () => {
      const a = new LeftistHeap3<number>()
      const b = new LeftistHeap3<number>()
      a.merge(b)
      expect(a.size).toBe(0)
      expect(a.isEmpty).toBe(true)
    })

    it('merges empty with non-empty', () => {
      const a = new LeftistHeap3<number>()
      const b = new LeftistHeap3<number>()
      b.insert(1)
      b.insert(2)
      b.insert(3)
      a.merge(b)
      expect(a.size).toBe(3)
      expect(a.peek()).toBe(1)
      expect(b.size).toBe(0)
    })

    it('merges non-empty with empty', () => {
      const a = new LeftistHeap3<number>()
      a.insert(1)
      a.insert(2)
      a.insert(3)
      const b = new LeftistHeap3<number>()
      a.merge(b)
      expect(a.size).toBe(3)
      expect(a.peek()).toBe(1)
    })

    it('merges two non-empty heaps', () => {
      const a = new LeftistHeap3<number>()
      for (const v of [1, 3, 5]) a.insert(v)
      const b = new LeftistHeap3<number>()
      for (const v of [2, 4, 6]) b.insert(v)
      a.merge(b)
      expect(a.size).toBe(6)
      expect(a.toSortedArray()).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('clears the other heap after merge', () => {
      const a = new LeftistHeap3<number>()
      a.insert(1)
      const b = new LeftistHeap3<number>()
      b.insert(2)
      a.merge(b)
      expect(b.size).toBe(0)
      expect(b.isEmpty).toBe(true)
    })

    it('merges with itself is no-op', () => {
      const heap = new LeftistHeap3<number>()
      heap.insert(1)
      heap.insert(2)
      heap.merge(heap)
      expect(heap.size).toBe(2)
    })

    it('maintains leftist property after merge', () => {
      const a = new LeftistHeap3<number>()
      for (const v of [1, 5, 9, 13]) a.insert(v)
      const b = new LeftistHeap3<number>()
      for (const v of [2, 6, 10, 14]) b.insert(v)
      a.merge(b)
      expect(a.isValid()).toBe(true)
    })

    it('merges large heaps', () => {
      const a = new LeftistHeap3<number>()
      for (let i = 0; i < 50; i++) a.insert(i * 2)
      const b = new LeftistHeap3<number>()
      for (let i = 0; i < 50; i++) b.insert(i * 2 + 1)
      a.merge(b)
      expect(a.size).toBe(100)
      expect(a.isValid()).toBe(true)
      expect(a.peek()).toBe(0)
    })
  })

  describe('meld', () => {
    it('meld is alias for merge', () => {
      const a = new LeftistHeap3<number>()
      a.insert(1)
      a.insert(3)
      const b = new LeftistHeap3<number>()
      b.insert(2)
      b.insert(4)
      a.meld(b)
      expect(a.size).toBe(4)
      expect(a.toSortedArray()).toEqual([1, 2, 3, 4])
    })

    it('meld clears the other heap', () => {
      const a = new LeftistHeap3<number>()
      a.insert(1)
      const b = new LeftistHeap3<number>()
      b.insert(2)
      a.meld(b)
      expect(b.size).toBe(0)
    })

    it('meld two empty heaps', () => {
      const a = new LeftistHeap3<number>()
      const b = new LeftistHeap3<number>()
      a.meld(b)
      expect(a.size).toBe(0)
    })

    it('meld maintains leftist property', () => {
      const a = new LeftistHeap3<number>()
      for (const v of [1, 5, 9]) a.insert(v)
      const b = new LeftistHeap3<number>()
      for (const v of [2, 6, 10]) b.insert(v)
      a.meld(b)
      expect(a.isValid()).toBe(true)
    })
  })

  describe('decreaseKey', () => {
    it('decreases key of a node', () => {
      const heap = new LeftistHeap3<number>()
      const n5 = heap.insert(5)
      heap.insert(3)
      heap.insert(1)
      heap.decreaseKey(n5, 0)
      expect(heap.peek()).toBe(0)
    })

    it('decreases key to same value', () => {
      const heap = new LeftistHeap3<number>()
      const n = heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      heap.decreaseKey(n, 3)
      expect(heap.size).toBe(3)
    })

    it('throws when newValue > oldValue', () => {
      const heap = new LeftistHeap3<number>()
      const n = heap.insert(1)
      expect(() => heap.decreaseKey(n, 5)).toThrow(
        'New value is greater than current value'
      )
    })

    it('throws on empty heap', () => {
      const heap = new LeftistHeap3<number>()
      const n: { value: number; left: null; right: null; npl: number } = {
        value: 1,
        left: null,
        right: null,
        npl: 1,
      }
      expect(() => heap.decreaseKey(n, 0)).toThrow('Heap is empty')
    })

    it('maintains heap property after decrease', () => {
      const heap = new LeftistHeap3<number>()
      const n7 = heap.insert(7)
      heap.insert(5)
      heap.insert(3)
      heap.insert(1)
      heap.insert(4)
      heap.decreaseKey(n7, 0)
      expect(heap.isValid()).toBe(true)
    })

    it('produces correct sorted output after decrease', () => {
      const heap = new LeftistHeap3<number>()
      const n5 = heap.insert(5)
      heap.insert(3)
      heap.insert(1)
      heap.insert(4)
      heap.insert(2)
      heap.decreaseKey(n5, 0)
      expect(heap.toSortedArray()).toEqual([0, 1, 2, 3, 4])
    })

    it('decreaseKey on minimum element', () => {
      const heap = new LeftistHeap3<number>()
      const n1 = heap.insert(1)
      heap.insert(5)
      heap.insert(3)
      heap.decreaseKey(n1, -10)
      expect(heap.peek()).toBe(-10)
    })

    it('decreaseKey on multiple nodes', () => {
      const heap = new LeftistHeap3<number>()
      const n10 = heap.insert(10)
      const n20 = heap.insert(20)
      const n30 = heap.insert(30)
      heap.decreaseKey(n10, 1)
      heap.decreaseKey(n20, 2)
      heap.decreaseKey(n30, 3)
      expect(heap.toSortedArray()).toEqual([1, 2, 3])
    })
  })

  describe('delete', () => {
    it('deletes a node', () => {
      const heap = new LeftistHeap3<number>()
      const n3 = heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      heap.delete(n3)
      expect(heap.size).toBe(2)
    })

    it('deletes minimum element', () => {
      const heap = new LeftistHeap3<number>()
      const n1 = heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.delete(n1)
      expect(heap.peek()).toBe(2)
    })

    it('deletes maximum element', () => {
      const heap = new LeftistHeap3<number>()
      const n5 = heap.insert(5)
      heap.insert(1)
      heap.insert(3)
      heap.insert(2)
      heap.insert(4)
      heap.delete(n5)
      expect(heap.toSortedArray()).toEqual([1, 2, 3, 4])
    })

    it('deletes only element', () => {
      const heap = new LeftistHeap3<number>()
      const n = heap.insert(42)
      heap.delete(n)
      expect(heap.isEmpty).toBe(true)
    })

    it('maintains heap property after delete', () => {
      const heap = new LeftistHeap3<number>()
      const n3 = heap.insert(3)
      heap.insert(5)
      heap.insert(7)
      heap.insert(1)
      heap.insert(4)
      heap.insert(6)
      heap.insert(2)
      heap.delete(n3)
      expect(heap.isValid()).toBe(true)
    })

    it('produces correct sorted output after delete', () => {
      const heap = new LeftistHeap3<number>()
      const n3 = heap.insert(3)
      heap.insert(5)
      heap.insert(1)
      heap.insert(4)
      heap.insert(2)
      heap.delete(n3)
      expect(heap.toSortedArray()).toEqual([1, 2, 4, 5])
    })

    it('delete multiple elements', () => {
      const heap = new LeftistHeap3<number>()
      const n1 = heap.insert(1)
      const n2 = heap.insert(2)
      const n3 = heap.insert(3)
      const n4 = heap.insert(4)
      const n5 = heap.insert(5)
      heap.delete(n3)
      heap.delete(n1)
      expect(heap.size).toBe(3)
      expect(heap.toSortedArray()).toEqual([2, 4, 5])
      heap.delete(n5)
      heap.delete(n2)
      heap.delete(n4)
      expect(heap.isEmpty).toBe(true)
    })

    it('delete maintains size correctly', () => {
      const heap = new LeftistHeap3<number>()
      const n = heap.insert(5)
      heap.insert(3)
      heap.insert(1)
      expect(heap.size).toBe(3)
      heap.delete(n)
      expect(heap.size).toBe(2)
    })
  })

  describe('update', () => {
    it('updates to smaller value', () => {
      const heap = new LeftistHeap3<number>()
      const n = heap.insert(5)
      heap.insert(3)
      heap.insert(1)
      heap.update(n, 0)
      expect(heap.peek()).toBe(0)
    })

    it('updates to larger value', () => {
      const heap = new LeftistHeap3<number>()
      const n = heap.insert(1)
      heap.insert(3)
      heap.insert(5)
      heap.update(n, 10)
      expect(heap.peek()).toBe(3)
      expect(heap.size).toBe(3)
    })

    it('updates to same value', () => {
      const heap = new LeftistHeap3<number>()
      const n = heap.insert(3)
      heap.insert(1)
      heap.insert(5)
      heap.update(n, 3)
      expect(heap.size).toBe(3)
      expect(n.value).toBe(3)
    })

    it('throws on empty heap', () => {
      const heap = new LeftistHeap3<number>()
      const n: { value: number; left: null; right: null; npl: number } = {
        value: 1,
        left: null,
        right: null,
        npl: 1,
      }
      expect(() => heap.update(n, 2)).toThrow('Heap is empty')
    })

    it('maintains heap property after update', () => {
      const heap = new LeftistHeap3<number>()
      const n = heap.insert(5)
      heap.insert(3)
      heap.insert(1)
      heap.update(n, 0)
      expect(heap.isValid()).toBe(true)
    })

    it('update with larger value produces correct sorted output', () => {
      const heap = new LeftistHeap3<number>()
      const n1 = heap.insert(1)
      heap.insert(3)
      heap.insert(5)
      heap.update(n1, 10)
      expect(heap.toSortedArray()).toEqual([3, 5, 10])
    })
  })

  describe('size', () => {
    it('returns 0 for empty heap', () => {
      const heap = new LeftistHeap3<number>()
      expect(heap.size).toBe(0)
    })

    it('returns correct size after inserts', () => {
      const heap = new LeftistHeap3<number>()
      heap.insert(1)
      expect(heap.size).toBe(1)
      heap.insert(2)
      expect(heap.size).toBe(2)
      heap.insert(3)
      expect(heap.size).toBe(3)
    })

    it('returns correct size after extractions', () => {
      const heap = new LeftistHeap3<number>()
      for (const v of [1, 2, 3, 4, 5]) heap.insert(v)
      heap.extractMin()
      expect(heap.size).toBe(4)
      heap.extractMin()
      expect(heap.size).toBe(3)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new heap', () => {
      const heap = new LeftistHeap3<number>()
      expect(heap.isEmpty).toBe(true)
    })

    it('returns false after insert', () => {
      const heap = new LeftistHeap3<number>()
      heap.insert(1)
      expect(heap.isEmpty).toBe(false)
    })

    it('returns true after extracting all elements', () => {
      const heap = new LeftistHeap3<number>()
      heap.insert(1)
      heap.insert(2)
      heap.extractMin()
      heap.extractMin()
      expect(heap.isEmpty).toBe(true)
    })

    it('returns true after clear', () => {
      const heap = new LeftistHeap3<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.clear()
      expect(heap.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears empty heap without error', () => {
      const heap = new LeftistHeap3<number>()
      heap.clear()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty).toBe(true)
    })

    it('clears non-empty heap', () => {
      const heap = new LeftistHeap3<number>()
      for (const v of [1, 2, 3, 4, 5]) heap.insert(v)
      heap.clear()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty).toBe(true)
    })

    it('allows operations after clear', () => {
      const heap = new LeftistHeap3<number>()
      for (const v of [1, 2, 3]) heap.insert(v)
      heap.clear()
      heap.insert(10)
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(10)
    })

    it('allows construction after clear', () => {
      const heap = new LeftistHeap3<number>()
      for (const v of [5, 4, 3, 2, 1]) heap.insert(v)
      heap.clear()
      heap.insert(100)
      heap.insert(50)
      expect(heap.extractMin()).toBe(50)
      expect(heap.extractMin()).toBe(100)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty heap', () => {
      const heap = new LeftistHeap3<number>()
      expect(heap.toArray()).toEqual([])
    })

    it('returns single element', () => {
      const heap = new LeftistHeap3<number>()
      heap.insert(42)
      expect(heap.toArray()).toEqual([42])
    })

    it('returns elements from the heap', () => {
      const heap = new LeftistHeap3<number>()
      for (const v of [5, 3, 1, 4, 2]) heap.insert(v)
      const arr = heap.toArray()
      expect(arr.length).toBe(5)
      expect(arr.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5])
    })

    it('does not modify the heap', () => {
      const heap = new LeftistHeap3<number>()
      for (const v of [3, 1, 2]) heap.insert(v)
      heap.toArray()
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(1)
    })

    it('handles duplicates', () => {
      const heap = new LeftistHeap3<number>()
      for (const v of [3, 1, 3, 1, 2]) heap.insert(v)
      const arr = heap.toArray()
      expect(arr.sort((a, b) => a - b)).toEqual([1, 1, 2, 3, 3])
    })
  })

  describe('toSortedArray', () => {
    it('returns empty array for empty heap', () => {
      const heap = new LeftistHeap3<number>()
      expect(heap.toSortedArray()).toEqual([])
    })

    it('returns sorted elements', () => {
      const heap = new LeftistHeap3<number>()
      for (const v of [5, 3, 1, 4, 2]) heap.insert(v)
      expect(heap.toSortedArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('does not modify the heap', () => {
      const heap = new LeftistHeap3<number>()
      for (const v of [3, 1, 2]) heap.insert(v)
      heap.toSortedArray()
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(1)
    })

    it('handles duplicates', () => {
      const heap = new LeftistHeap3<number>()
      for (const v of [3, 1, 3, 1, 2]) heap.insert(v)
      expect(heap.toSortedArray()).toEqual([1, 1, 2, 3, 3])
    })
  })

  describe('contains', () => {
    it('returns false for empty heap', () => {
      const heap = new LeftistHeap3<number>()
      expect(heap.contains(1)).toBe(false)
    })

    it('returns true for existing element', () => {
      const heap = new LeftistHeap3<number>()
      for (const v of [5, 3, 1, 4, 2]) heap.insert(v)
      expect(heap.contains(3)).toBe(true)
    })

    it('returns true for minimum element', () => {
      const heap = new LeftistHeap3<number>()
      for (const v of [5, 3, 1, 4, 2]) heap.insert(v)
      expect(heap.contains(1)).toBe(true)
    })

    it('returns false for non-existing element', () => {
      const heap = new LeftistHeap3<number>()
      for (const v of [5, 3, 1, 4, 2]) heap.insert(v)
      expect(heap.contains(10)).toBe(false)
    })

    it('returns false after element extracted', () => {
      const heap = new LeftistHeap3<number>()
      for (const v of [1, 2, 3]) heap.insert(v)
      heap.extractMin()
      expect(heap.contains(1)).toBe(false)
    })

    it('returns true after insert', () => {
      const heap = new LeftistHeap3<number>()
      for (const v of [1, 2, 3]) heap.insert(v)
      heap.insert(10)
      expect(heap.contains(10)).toBe(true)
    })
  })

  describe('clone', () => {
    it('clones empty heap', () => {
      const heap = new LeftistHeap3<number>()
      const cloned = heap.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty).toBe(true)
    })

    it('clones non-empty heap', () => {
      const heap = new LeftistHeap3<number>()
      for (const v of [5, 3, 1, 4, 2]) heap.insert(v)
      const cloned = heap.clone()
      expect(cloned.size).toBe(5)
      expect(cloned.peek()).toBe(1)
    })

    it('returns independent copy', () => {
      const heap = new LeftistHeap3<number>()
      for (const v of [1, 2, 3]) heap.insert(v)
      const cloned = heap.clone()
      heap.extractMin()
      expect(heap.size).toBe(2)
      expect(cloned.size).toBe(3)
    })

    it('cloned heap maintains leftist property', () => {
      const heap = new LeftistHeap3<number>()
      for (const v of [5, 3, 7, 1, 4, 6, 2]) heap.insert(v)
      const cloned = heap.clone()
      expect(cloned.isValid()).toBe(true)
    })

    it('preserves comparator in clone', () => {
      const heap = new LeftistHeap3<number>({ comparator: reverseComparator })
      for (const v of [1, 2, 3]) heap.insert(v)
      const cloned = heap.clone()
      expect(cloned.peek()).toBe(3)
      expect(cloned.toSortedArray()).toEqual([3, 2, 1])
    })
  })

  describe('static fromArray', () => {
    it('creates heap from array', () => {
      const heap = LeftistHeap3.fromArray([5, 3, 1, 4, 2])
      expect(heap.size).toBe(5)
      expect(heap.peek()).toBe(1)
    })

    it('creates heap from empty array', () => {
      const heap = LeftistHeap3.fromArray<number>([])
      expect(heap.size).toBe(0)
    })

    it('creates heap with custom comparator', () => {
      const heap = LeftistHeap3.fromArray([1, 2, 3, 4, 5], {
        comparator: reverseComparator,
      })
      expect(heap.peek()).toBe(5)
    })

    it('created heap is valid', () => {
      const heap = LeftistHeap3.fromArray([5, 3, 7, 1, 4, 6, 2])
      expect(heap.isValid()).toBe(true)
    })
  })

  describe('static merge', () => {
    it('merges two heaps statically', () => {
      const a = new LeftistHeap3<number>()
      for (const v of [1, 3, 5]) a.insert(v)
      const b = new LeftistHeap3<number>()
      for (const v of [2, 4, 6]) b.insert(v)
      const merged = LeftistHeap3.merge(a, b)
      expect(merged.size).toBe(6)
      expect(merged.toSortedArray()).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('does not modify original heaps', () => {
      const a = new LeftistHeap3<number>()
      a.insert(1)
      a.insert(3)
      const b = new LeftistHeap3<number>()
      b.insert(2)
      b.insert(4)
      LeftistHeap3.merge(a, b)
      expect(a.size).toBe(2)
      expect(b.size).toBe(2)
    })

    it('merges empty heaps', () => {
      const a = new LeftistHeap3<number>()
      const b = new LeftistHeap3<number>()
      const merged = LeftistHeap3.merge(a, b)
      expect(merged.isEmpty).toBe(true)
    })

    it('merged heap is valid', () => {
      const a = new LeftistHeap3<number>()
      for (const v of [1, 5, 9]) a.insert(v)
      const b = new LeftistHeap3<number>()
      for (const v of [2, 6, 10]) b.insert(v)
      const merged = LeftistHeap3.merge(a, b)
      expect(merged.isValid()).toBe(true)
    })
  })

  describe('forEach', () => {
    it('does not call callback on empty heap', () => {
      const heap = new LeftistHeap3<number>()
      let count = 0
      heap.forEach(() => {
        count++
      })
      expect(count).toBe(0)
    })

    it('calls callback for each element', () => {
      const heap = new LeftistHeap3<number>()
      for (const v of [1, 2, 3]) heap.insert(v)
      let count = 0
      heap.forEach(() => {
        count++
      })
      expect(count).toBe(3)
    })

    it('provides correct values', () => {
      const heap = new LeftistHeap3<number>()
      for (const v of [3, 1, 2]) heap.insert(v)
      const values: number[] = []
      heap.forEach((v) => {
        values.push(v)
      })
      expect(values.sort()).toEqual([1, 2, 3])
    })

    it('does not modify heap', () => {
      const heap = new LeftistHeap3<number>()
      for (const v of [1, 2, 3]) heap.insert(v)
      heap.forEach(() => {})
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(1)
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates over empty heap', () => {
      const heap = new LeftistHeap3<number>()
      const result = [...heap]
      expect(result).toEqual([])
    })

    it('iterates in sorted order', () => {
      const heap = new LeftistHeap3<number>()
      for (const v of [5, 3, 1, 4, 2]) heap.insert(v)
      expect([...heap]).toEqual([1, 2, 3, 4, 5])
    })

    it('does not modify the heap', () => {
      const heap = new LeftistHeap3<number>()
      for (const v of [3, 1, 2]) heap.insert(v)
      ;[...heap]
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(1)
    })

    it('works with for...of', () => {
      const heap = new LeftistHeap3<number>()
      for (const v of [3, 1, 2]) heap.insert(v)
      const result: number[] = []
      for (const val of heap) {
        result.push(val)
      }
      expect(result).toEqual([1, 2, 3])
    })

    it('can be used multiple times', () => {
      const heap = new LeftistHeap3<number>()
      for (const v of [3, 1, 2]) heap.insert(v)
      expect([...heap]).toEqual([1, 2, 3])
      expect([...heap]).toEqual([1, 2, 3])
    })
  })

  describe('isValid', () => {
    it('empty heap is valid', () => {
      const heap = new LeftistHeap3<number>()
      expect(heap.isValid()).toBe(true)
    })

    it('single element heap is valid', () => {
      const heap = new LeftistHeap3<number>()
      heap.insert(1)
      expect(heap.isValid()).toBe(true)
    })

    it('heap after construction is valid', () => {
      const heap = LeftistHeap3.fromArray([5, 3, 7, 1, 4, 6, 2])
      expect(heap.isValid()).toBe(true)
    })

    it('heap remains valid after inserts', () => {
      const heap = new LeftistHeap3<number>()
      for (let i = 10; i >= 1; i--) {
        heap.insert(i)
      }
      expect(heap.isValid()).toBe(true)
    })
  })

  describe('custom comparator', () => {
    it('works as max heap with reverse comparator', () => {
      const heap = new LeftistHeap3<number>({ comparator: reverseComparator })
      heap.insert(1)
      heap.insert(5)
      heap.insert(3)
      heap.insert(2)
      heap.insert(4)
      expect(heap.toSortedArray()).toEqual([5, 4, 3, 2, 1])
    })

    it('works with absolute value comparator', () => {
      const heap = new LeftistHeap3<number>({ comparator: absComparator })
      heap.insert(-5)
      heap.insert(3)
      heap.insert(-1)
      heap.insert(4)
      heap.insert(-2)
      expect(heap.extractMin()).toBe(-1)
      expect(heap.extractMin()).toBe(-2)
      expect(heap.extractMin()).toBe(3)
    })

    it('works with string comparator', () => {
      const heap = new LeftistHeap3<string>({ comparator: stringComparator })
      heap.insert('cherry')
      heap.insert('apple')
      heap.insert('banana')
      expect(heap.toSortedArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('works with object comparator', () => {
      interface Item {
        priority: number
        name: string
      }
      const cmp: Comparator<Item> = (a, b) => a.priority - b.priority
      const heap = new LeftistHeap3<Item>({ comparator: cmp })
      heap.insert({ priority: 3, name: 'low' })
      heap.insert({ priority: 1, name: 'high' })
      heap.insert({ priority: 2, name: 'medium' })
      expect(heap.extractMin().name).toBe('high')
      expect(heap.extractMin().name).toBe('medium')
      expect(heap.extractMin().name).toBe('low')
    })
  })

  describe('edge cases', () => {
    it('handles alternating insert and extract', () => {
      const heap = new LeftistHeap3<number>()
      heap.insert(5)
      heap.insert(3)
      expect(heap.extractMin()).toBe(3)
      heap.insert(1)
      heap.insert(7)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(5)
      expect(heap.extractMin()).toBe(7)
      expect(heap.isEmpty).toBe(true)
    })

    it('handles large number of elements', () => {
      const heap = new LeftistHeap3<number>()
      for (let i = 1000; i >= 0; i--) {
        heap.insert(i)
      }
      expect(heap.size).toBe(1001)
      expect(heap.peek()).toBe(0)
      expect(heap.extractMin()).toBe(0)
      expect(heap.peek()).toBe(1)
    })

    it('handles sorted input', () => {
      const heap = LeftistHeap3.fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      expect(heap.isValid()).toBe(true)
      expect(heap.toSortedArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('handles reverse sorted input', () => {
      const heap = LeftistHeap3.fromArray([10, 9, 8, 7, 6, 5, 4, 3, 2, 1])
      expect(heap.isValid()).toBe(true)
      expect(heap.toSortedArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('handles same element repeated', () => {
      const heap = LeftistHeap3.fromArray([5, 5, 5, 5, 5])
      expect(heap.size).toBe(5)
      expect(heap.toSortedArray()).toEqual([5, 5, 5, 5, 5])
    })

    it('handles floating point numbers', () => {
      const heap = LeftistHeap3.fromArray([3.14, 1.41, 2.72, 0.58])
      expect(heap.extractMin()).toBeCloseTo(0.58)
      expect(heap.extractMin()).toBeCloseTo(1.41)
    })

    it('handles negative numbers', () => {
      const heap = LeftistHeap3.fromArray([-5, -1, -3, -2, -4])
      expect(heap.toSortedArray()).toEqual([-5, -4, -3, -2, -1])
    })

    it('heap sort produces correct result', () => {
      const input = [42, 17, 23, 8, 91, 55, 3, 66, 1, 34]
      const heap = LeftistHeap3.fromArray(input)
      const sorted: number[] = []
      while (!heap.isEmpty) {
        sorted.push(heap.extractMin())
      }
      expect(sorted).toEqual([...input].sort((a, b) => a - b))
    })
  })

  describe('leftist property', () => {
    it('maintains npl(left) >= npl(right) for all nodes', () => {
      const heap = LeftistHeap3.fromArray([10, 20, 30, 5, 15, 25, 35, 1, 2, 3])
      expect(heap.isValid()).toBe(true)
    })

    it('right spine length is O(log n)', () => {
      const heap = new LeftistHeap3<number>()
      for (let i = 100; i >= 1; i--) {
        heap.insert(i)
      }
      expect(heap.isValid()).toBe(true)
    })

    it('merge is efficient (O(log n))', () => {
      const a = new LeftistHeap3<number>()
      for (let i = 0; i < 100; i++) a.insert(i)
      const b = new LeftistHeap3<number>()
      for (let i = 0; i < 100; i++) b.insert(i + 100)
      const merged = LeftistHeap3.merge(a, b)
      expect(merged.isValid()).toBe(true)
      expect(merged.size).toBe(200)
      expect(merged.peek()).toBe(0)
    })

    it('maintains property after many operations', () => {
      const heap = new LeftistHeap3<number>()
      for (let i = 50; i >= 1; i--) {
        heap.insert(i)
      }
      for (let i = 0; i < 25; i++) {
        heap.extractMin()
      }
      expect(heap.isValid()).toBe(true)
      expect(heap.size).toBe(25)
    })
  })
})
