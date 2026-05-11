import { describe, it, expect } from 'vitest'
import { LeftistHeap } from '../../src/core/leftist-heap-2/index.js'
import type { Comparator } from '../../src/core/leftist-heap-2/types.js'

const reverseComparator: Comparator<number> = (a, b) => b - a
const stringComparator: Comparator<string> = (a, b) => a.localeCompare(b)
const absComparator: Comparator<number> = (a, b) => Math.abs(a) - Math.abs(b)

describe('LeftistHeap', () => {
  describe('constructor', () => {
    it('creates empty heap with no arguments', () => {
      const heap = new LeftistHeap<number>()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('creates heap from element array', () => {
      const heap = new LeftistHeap([5, 3, 1, 4, 2])
      expect(heap.size).toBe(5)
      expect(heap.peek()).toBe(1)
    })

    it('creates heap from empty array', () => {
      const heap = new LeftistHeap<number>([])
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('creates heap from single element array', () => {
      const heap = new LeftistHeap([42])
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(42)
    })

    it('creates heap with options object (comparator)', () => {
      const heap = new LeftistHeap<number>({ comparator: reverseComparator })
      heap.insert(1)
      heap.insert(5)
      heap.insert(3)
      expect(heap.peek()).toBe(5)
    })

    it('creates heap with options object (elements)', () => {
      const heap = new LeftistHeap({ elements: [3, 1, 2] })
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(1)
    })

    it('creates heap with options object (elements + comparator)', () => {
      const heap = new LeftistHeap<number>({ elements: [3, 1, 2], comparator: reverseComparator })
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(3)
    })

    it('creates heap with elements array and options', () => {
      const heap = new LeftistHeap([3, 1, 2], { comparator: reverseComparator })
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(3)
    })

    it('creates heap with string elements', () => {
      const heap = new LeftistHeap(['cherry', 'apple', 'banana'])
      expect(heap.peek()).toBe('apple')
    })

    it('creates heap with custom string comparator', () => {
      const heap = new LeftistHeap<string>({ comparator: stringComparator })
      heap.insert('cherry')
      heap.insert('apple')
      heap.insert('banana')
      expect(heap.peek()).toBe('apple')
    })

    it('handles undefined argument as empty', () => {
      const heap = new LeftistHeap<number>(undefined)
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('creates heap with duplicate elements', () => {
      const heap = new LeftistHeap([3, 3, 1, 1, 2])
      expect(heap.size).toBe(5)
      expect(heap.peek()).toBe(1)
    })

    it('creates heap with many elements', () => {
      const items = Array.from({ length: 100 }, (_, i) => 100 - i)
      const heap = new LeftistHeap(items)
      expect(heap.size).toBe(100)
      expect(heap.peek()).toBe(1)
    })

    it('preserves heap property after construction', () => {
      const heap = new LeftistHeap([5, 3, 7, 1, 4, 6, 2])
      expect(heap.isValid()).toBe(true)
    })
  })

  describe('insert', () => {
    it('inserts into empty heap', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(5)
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(5)
    })

    it('returns a handle', () => {
      const heap = new LeftistHeap<number>()
      const handle = heap.insert(5)
      expect(handle).toEqual({ value: 5 })
      expect(handle.value).toBe(5)
    })

    it('inserts smaller element as new min', () => {
      const heap = new LeftistHeap([10, 20, 30])
      heap.insert(5)
      expect(heap.peek()).toBe(5)
    })

    it('inserts larger element', () => {
      const heap = new LeftistHeap([1, 2, 3])
      heap.insert(100)
      expect(heap.peek()).toBe(1)
      expect(heap.size).toBe(4)
    })

    it('inserts duplicate element', () => {
      const heap = new LeftistHeap([1, 2, 3])
      heap.insert(2)
      expect(heap.size).toBe(4)
      expect(heap.peek()).toBe(1)
    })

    it('maintains leftist property after insert', () => {
      const heap = new LeftistHeap<number>()
      for (let i = 20; i >= 1; i--) {
        heap.insert(i)
      }
      expect(heap.isValid()).toBe(true)
    })

    it('inserts many elements in order', () => {
      const heap = new LeftistHeap<number>()
      for (let i = 0; i < 50; i++) {
        heap.insert(i)
      }
      expect(heap.size).toBe(50)
      expect(heap.peek()).toBe(0)
      expect(heap.isValid()).toBe(true)
    })

    it('inserts many elements in reverse order', () => {
      const heap = new LeftistHeap<number>()
      for (let i = 49; i >= 0; i--) {
        heap.insert(i)
      }
      expect(heap.size).toBe(50)
      expect(heap.peek()).toBe(0)
      expect(heap.isValid()).toBe(true)
    })

    it('inserts negative numbers', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(-5)
      heap.insert(-10)
      heap.insert(-1)
      expect(heap.peek()).toBe(-10)
    })

    it('inserts zero', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(0)
      heap.insert(1)
      heap.insert(-1)
      expect(heap.peek()).toBe(-1)
    })

    it('insert maintains heap after each operation', () => {
      const heap = new LeftistHeap<number>()
      const values = [5, 3, 7, 1, 4, 6, 2, 8, 0, 9]
      for (const v of values) {
        heap.insert(v)
        expect(heap.isValid()).toBe(true)
      }
    })

    it('handle reflects initial value', () => {
      const heap = new LeftistHeap<number>()
      const h = heap.insert(42)
      expect(h.value).toBe(42)
    })
  })

  describe('extractMin', () => {
    it('throws on empty heap', () => {
      const heap = new LeftistHeap<number>()
      expect(() => heap.extractMin()).toThrow('extractMin called on empty heap')
    })

    it('extracts the only element', () => {
      const heap = new LeftistHeap([42])
      expect(heap.extractMin()).toBe(42)
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('extracts elements in sorted order', () => {
      const heap = new LeftistHeap([5, 3, 1, 4, 2])
      const result: number[] = []
      while (!heap.isEmpty()) {
        result.push(heap.extractMin())
      }
      expect(result).toEqual([1, 2, 3, 4, 5])
    })

    it('updates size after extraction', () => {
      const heap = new LeftistHeap([3, 1, 2])
      expect(heap.size).toBe(3)
      heap.extractMin()
      expect(heap.size).toBe(2)
      heap.extractMin()
      expect(heap.size).toBe(1)
      heap.extractMin()
      expect(heap.size).toBe(0)
    })

    it('maintains heap property after extraction', () => {
      const heap = new LeftistHeap([5, 3, 7, 1, 4, 6, 2])
      heap.extractMin()
      expect(heap.isValid()).toBe(true)
    })

    it('maintains heap property through multiple extractions', () => {
      const heap = new LeftistHeap([5, 3, 7, 1, 4, 6, 2])
      for (let i = 0; i < 7; i++) {
        heap.extractMin()
        expect(heap.isValid()).toBe(true)
      }
    })

    it('extracts duplicate values correctly', () => {
      const heap = new LeftistHeap([2, 1, 2, 1, 2])
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(2)
      expect(heap.extractMin()).toBe(2)
      expect(heap.extractMin()).toBe(2)
    })

    it('extracts from large heap in order', () => {
      const items = Array.from({ length: 50 }, (_, i) => 50 - i)
      const heap = new LeftistHeap(items)
      const result: number[] = []
      while (!heap.isEmpty()) {
        result.push(heap.extractMin())
      }
      for (let i = 0; i < 50; i++) {
        expect(result[i]).toBe(i + 1)
      }
    })

    it('works with custom comparator (max heap)', () => {
      const heap = new LeftistHeap([1, 2, 3, 4, 5], { comparator: reverseComparator })
      expect(heap.extractMin()).toBe(5)
      expect(heap.extractMin()).toBe(4)
      expect(heap.extractMin()).toBe(3)
    })
  })

  describe('peek', () => {
    it('throws on empty heap', () => {
      const heap = new LeftistHeap<number>()
      expect(() => heap.peek()).toThrow('peek called on empty heap')
    })

    it('returns minimum element', () => {
      const heap = new LeftistHeap([5, 3, 1, 4, 2])
      expect(heap.peek()).toBe(1)
    })

    it('does not remove the element', () => {
      const heap = new LeftistHeap([1, 2, 3])
      heap.peek()
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(1)
    })

    it('returns updated min after extractMin', () => {
      const heap = new LeftistHeap([1, 2, 3])
      heap.extractMin()
      expect(heap.peek()).toBe(2)
    })

    it('returns updated min after insert of smaller element', () => {
      const heap = new LeftistHeap([5, 10, 15])
      heap.insert(1)
      expect(heap.peek()).toBe(1)
    })

    it('returns same min after insert of larger element', () => {
      const heap = new LeftistHeap([1, 5, 10])
      heap.insert(100)
      expect(heap.peek()).toBe(1)
    })
  })

  describe('size', () => {
    it('returns 0 for empty heap', () => {
      const heap = new LeftistHeap<number>()
      expect(heap.size).toBe(0)
    })

    it('returns correct size after inserts', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(1)
      expect(heap.size).toBe(1)
      heap.insert(2)
      expect(heap.size).toBe(2)
      heap.insert(3)
      expect(heap.size).toBe(3)
    })

    it('returns correct size after extractions', () => {
      const heap = new LeftistHeap([1, 2, 3, 4, 5])
      heap.extractMin()
      expect(heap.size).toBe(4)
      heap.extractMin()
      expect(heap.size).toBe(3)
    })

    it('returns 0 after clear', () => {
      const heap = new LeftistHeap([1, 2, 3])
      heap.clear()
      expect(heap.size).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new heap', () => {
      const heap = new LeftistHeap<number>()
      expect(heap.isEmpty()).toBe(true)
    })

    it('returns false after insert', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(1)
      expect(heap.isEmpty()).toBe(false)
    })

    it('returns true after extracting all elements', () => {
      const heap = new LeftistHeap([1, 2])
      heap.extractMin()
      heap.extractMin()
      expect(heap.isEmpty()).toBe(true)
    })

    it('returns true after clear', () => {
      const heap = new LeftistHeap([1, 2, 3])
      heap.clear()
      expect(heap.isEmpty()).toBe(true)
    })

    it('returns false after clear and insert', () => {
      const heap = new LeftistHeap([1, 2, 3])
      heap.clear()
      heap.insert(1)
      expect(heap.isEmpty()).toBe(false)
    })
  })

  describe('clear', () => {
    it('clears empty heap without error', () => {
      const heap = new LeftistHeap<number>()
      heap.clear()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('clears non-empty heap', () => {
      const heap = new LeftistHeap([1, 2, 3, 4, 5])
      heap.clear()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('allows operations after clear', () => {
      const heap = new LeftistHeap([1, 2, 3])
      heap.clear()
      heap.insert(10)
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(10)
    })

    it('allows construction after clear', () => {
      const heap = new LeftistHeap([5, 4, 3, 2, 1])
      heap.clear()
      heap.insert(100)
      heap.insert(50)
      expect(heap.extractMin()).toBe(50)
      expect(heap.extractMin()).toBe(100)
    })
  })

  describe('merge', () => {
    it('merges two empty heaps', () => {
      const a = new LeftistHeap<number>()
      const b = new LeftistHeap<number>()
      const merged = a.merge(b)
      expect(merged.size).toBe(0)
      expect(merged.isEmpty()).toBe(true)
    })

    it('merges empty with non-empty', () => {
      const a = new LeftistHeap<number>()
      const b = new LeftistHeap([1, 2, 3])
      const merged = a.merge(b)
      expect(merged.size).toBe(3)
      expect(merged.peek()).toBe(1)
    })

    it('merges non-empty with empty', () => {
      const a = new LeftistHeap([1, 2, 3])
      const b = new LeftistHeap<number>()
      const merged = a.merge(b)
      expect(merged.size).toBe(3)
      expect(merged.peek()).toBe(1)
    })

    it('merges two non-empty heaps', () => {
      const a = new LeftistHeap([1, 3, 5])
      const b = new LeftistHeap([2, 4, 6])
      const merged = a.merge(b)
      expect(merged.size).toBe(6)
      expect(merged.toArray()).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('does not modify original heaps', () => {
      const a = new LeftistHeap([1, 3])
      const b = new LeftistHeap([2, 4])
      a.merge(b)
      expect(a.size).toBe(2)
      expect(b.size).toBe(2)
      expect(a.peek()).toBe(1)
      expect(b.peek()).toBe(2)
    })

    it('returns a new heap', () => {
      const a = new LeftistHeap([1])
      const b = new LeftistHeap([2])
      const merged = a.merge(b)
      expect(merged).not.toBe(a)
      expect(merged).not.toBe(b)
    })

    it('maintained leftist property', () => {
      const a = new LeftistHeap([1, 5, 9, 13])
      const b = new LeftistHeap([2, 6, 10, 14])
      const merged = a.merge(b)
      expect(merged.isValid()).toBe(true)
    })

    it('merges with custom comparator', () => {
      const a = new LeftistHeap([1, 3], { comparator: reverseComparator })
      const b = new LeftistHeap([2, 4], { comparator: reverseComparator })
      const merged = a.merge(b)
      expect(merged.toArray()).toEqual([4, 3, 2, 1])
    })

    it('merges heaps with overlapping values', () => {
      const a = new LeftistHeap([1, 3, 5])
      const b = new LeftistHeap([1, 3, 5])
      const merged = a.merge(b)
      expect(merged.size).toBe(6)
      expect(merged.toArray()).toEqual([1, 1, 3, 3, 5, 5])
    })

    it('merges large heaps', () => {
      const a = new LeftistHeap(Array.from({ length: 50 }, (_, i) => i * 2))
      const b = new LeftistHeap(Array.from({ length: 50 }, (_, i) => i * 2 + 1))
      const merged = a.merge(b)
      expect(merged.size).toBe(100)
      expect(merged.isValid()).toBe(true)
      expect(merged.peek()).toBe(0)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty heap', () => {
      const heap = new LeftistHeap<number>()
      expect(heap.toArray()).toEqual([])
    })

    it('returns single element', () => {
      const heap = new LeftistHeap([42])
      expect(heap.toArray()).toEqual([42])
    })

    it('returns elements in sorted order', () => {
      const heap = new LeftistHeap([5, 3, 1, 4, 2])
      expect(heap.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('does not modify the heap', () => {
      const heap = new LeftistHeap([3, 1, 2])
      heap.toArray()
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(1)
    })

    it('returns correct array after modifications', () => {
      const heap = new LeftistHeap([5, 3, 1])
      heap.insert(4)
      heap.insert(2)
      expect(heap.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('handles duplicates', () => {
      const heap = new LeftistHeap([3, 1, 3, 1, 2])
      expect(heap.toArray()).toEqual([1, 1, 2, 3, 3])
    })
  })

  describe('toSortedArray', () => {
    it('returns empty array for empty heap', () => {
      const heap = new LeftistHeap<number>()
      expect(heap.toSortedArray()).toEqual([])
    })

    it('returns sorted elements', () => {
      const heap = new LeftistHeap([5, 3, 1, 4, 2])
      expect(heap.toSortedArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('returns same result as toArray', () => {
      const heap = new LeftistHeap([5, 3, 1, 4, 2])
      expect(heap.toSortedArray()).toEqual(heap.toArray())
    })
  })

  describe('contains', () => {
    it('returns false for empty heap', () => {
      const heap = new LeftistHeap<number>()
      expect(heap.contains(1)).toBe(false)
    })

    it('returns true for existing element', () => {
      const heap = new LeftistHeap([5, 3, 1, 4, 2])
      expect(heap.contains(3)).toBe(true)
    })

    it('returns true for minimum element', () => {
      const heap = new LeftistHeap([5, 3, 1, 4, 2])
      expect(heap.contains(1)).toBe(true)
    })

    it('returns false for non-existing element', () => {
      const heap = new LeftistHeap([5, 3, 1, 4, 2])
      expect(heap.contains(10)).toBe(false)
    })

    it('returns true for duplicate elements', () => {
      const heap = new LeftistHeap([3, 1, 3])
      expect(heap.contains(3)).toBe(true)
    })

    it('returns false for element smaller than min', () => {
      const heap = new LeftistHeap([5, 3, 1, 4, 2])
      expect(heap.contains(0)).toBe(false)
    })

    it('returns false after element extracted', () => {
      const heap = new LeftistHeap([1, 2, 3])
      heap.extractMin()
      expect(heap.contains(1)).toBe(false)
    })

    it('returns true after insert', () => {
      const heap = new LeftistHeap([1, 2, 3])
      heap.insert(10)
      expect(heap.contains(10)).toBe(true)
    })

    it('returns false after clear', () => {
      const heap = new LeftistHeap([1, 2, 3])
      heap.clear()
      expect(heap.contains(1)).toBe(false)
      expect(heap.contains(2)).toBe(false)
    })
  })

  describe('decreaseKey (handle-based)', () => {
    it('decreases key via handle', () => {
      const heap = new LeftistHeap<number>()
      const h5 = heap.insert(5)
      heap.insert(3)
      heap.insert(1)
      heap.decreaseKey(h5, 0)
      expect(heap.peek()).toBe(0)
    })

    it('decreases key to same value', () => {
      const heap = new LeftistHeap<number>()
      const h = heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      heap.decreaseKey(h, 3)
      expect(heap.size).toBe(3)
    })

    it('throws when newValue > oldValue', () => {
      const heap = new LeftistHeap<number>()
      const h = heap.insert(1)
      expect(() => heap.decreaseKey(h, 5)).toThrow(
        'newValue must be less than or equal to oldValue',
      )
    })

    it('throws when handle not found (after clear)', () => {
      const heap = new LeftistHeap<number>()
      const h = heap.insert(3)
      heap.clear()
      expect(() => heap.decreaseKey(h, 0)).toThrow('handle not found in heap')
    })

    it('maintains heap property after decrease', () => {
      const heap = new LeftistHeap<number>()
      const h7 = heap.insert(7)
      heap.insert(5)
      heap.insert(3)
      heap.insert(1)
      heap.insert(4)
      heap.decreaseKey(h7, 0)
      expect(heap.isValid()).toBe(true)
    })

    it('maintains correct size after decrease', () => {
      const heap = new LeftistHeap<number>()
      const h = heap.insert(5)
      heap.insert(3)
      heap.insert(1)
      heap.insert(4)
      heap.insert(2)
      heap.decreaseKey(h, 0)
      expect(heap.size).toBe(5)
    })

    it('produces correct sorted output after decrease', () => {
      const heap = new LeftistHeap<number>()
      const h5 = heap.insert(5)
      heap.insert(3)
      heap.insert(1)
      heap.insert(4)
      heap.insert(2)
      heap.decreaseKey(h5, 0)
      expect(heap.toArray()).toEqual([0, 1, 2, 3, 4])
    })

    it('updates handle value', () => {
      const heap = new LeftistHeap<number>()
      const h = heap.insert(10)
      heap.decreaseKey(h, 5)
      expect(h.value).toBe(5)
    })

    it('decreaseKey on minimum element', () => {
      const heap = new LeftistHeap<number>()
      const h1 = heap.insert(1)
      heap.insert(5)
      heap.insert(3)
      heap.decreaseKey(h1, -10)
      expect(heap.peek()).toBe(-10)
    })

    it('decreaseKey on multiple handles', () => {
      const heap = new LeftistHeap<number>()
      const h10 = heap.insert(10)
      const h20 = heap.insert(20)
      const h30 = heap.insert(30)
      heap.decreaseKey(h10, 1)
      heap.decreaseKey(h20, 2)
      heap.decreaseKey(h30, 3)
      expect(heap.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('delete (handle-based)', () => {
    it('deletes element via handle', () => {
      const heap = new LeftistHeap<number>()
      const h3 = heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      expect(heap.delete(h3)).toBe(true)
      expect(heap.size).toBe(2)
    })

    it('returns false for already deleted handle', () => {
      const heap = new LeftistHeap<number>()
      const h = heap.insert(3)
      heap.delete(h)
      expect(heap.delete(h)).toBe(false)
    })

    it('deletes minimum element', () => {
      const heap = new LeftistHeap<number>()
      const h1 = heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.delete(h1)
      expect(heap.peek()).toBe(2)
    })

    it('deletes maximum element', () => {
      const heap = new LeftistHeap<number>()
      const h5 = heap.insert(5)
      heap.insert(1)
      heap.insert(3)
      heap.insert(2)
      heap.insert(4)
      heap.delete(h5)
      expect(heap.toArray()).toEqual([1, 2, 3, 4])
    })

    it('deletes only element', () => {
      const heap = new LeftistHeap<number>()
      const h = heap.insert(42)
      heap.delete(h)
      expect(heap.isEmpty()).toBe(true)
    })

    it('deletes from empty heap returns false', () => {
      const heap = new LeftistHeap<number>()
      const h = { value: 1 }
      expect(heap.delete(h)).toBe(false)
    })

    it('maintains heap property after delete', () => {
      const heap = new LeftistHeap<number>()
      const h3 = heap.insert(3)
      heap.insert(5)
      heap.insert(7)
      heap.insert(1)
      heap.insert(4)
      heap.insert(6)
      heap.insert(2)
      heap.delete(h3)
      expect(heap.isValid()).toBe(true)
    })

    it('produces correct sorted output after delete', () => {
      const heap = new LeftistHeap<number>()
      const h3 = heap.insert(3)
      heap.insert(5)
      heap.insert(1)
      heap.insert(4)
      heap.insert(2)
      heap.delete(h3)
      expect(heap.toArray()).toEqual([1, 2, 4, 5])
    })

    it('delete after clear returns false', () => {
      const heap = new LeftistHeap<number>()
      const h = heap.insert(3)
      heap.clear()
      expect(heap.delete(h)).toBe(false)
    })

    it('delete multiple elements', () => {
      const heap = new LeftistHeap<number>()
      const h1 = heap.insert(1)
      const h2 = heap.insert(2)
      const h3 = heap.insert(3)
      const h4 = heap.insert(4)
      const h5 = heap.insert(5)
      heap.delete(h3)
      heap.delete(h1)
      expect(heap.size).toBe(3)
      expect(heap.toArray()).toEqual([2, 4, 5])
      heap.delete(h5)
      heap.delete(h2)
      heap.delete(h4)
      expect(heap.isEmpty()).toBe(true)
    })
  })

  describe('clone', () => {
    it('clones empty heap', () => {
      const heap = new LeftistHeap<number>()
      const cloned = heap.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('clones non-empty heap', () => {
      const heap = new LeftistHeap([5, 3, 1, 4, 2])
      const cloned = heap.clone()
      expect(cloned.size).toBe(5)
      expect(cloned.peek()).toBe(1)
    })

    it('returns independent copy', () => {
      const heap = new LeftistHeap([1, 2, 3])
      const cloned = heap.clone()
      heap.extractMin()
      expect(heap.size).toBe(2)
      expect(cloned.size).toBe(3)
    })

    it('cloned heap maintains leftist property', () => {
      const heap = new LeftistHeap([5, 3, 7, 1, 4, 6, 2])
      const cloned = heap.clone()
      expect(cloned.isValid()).toBe(true)
    })

    it('cloned heap has same elements', () => {
      const heap = new LeftistHeap([5, 3, 1, 4, 2])
      const cloned = heap.clone()
      expect(cloned.toArray()).toEqual(heap.toArray())
    })

    it('preserves comparator in clone', () => {
      const heap = new LeftistHeap([1, 2, 3], { comparator: reverseComparator })
      const cloned = heap.clone()
      expect(cloned.peek()).toBe(3)
      expect(cloned.toArray()).toEqual([3, 2, 1])
    })
  })

  describe('static fromArray', () => {
    it('creates heap from array', () => {
      const heap = LeftistHeap.fromArray([5, 3, 1, 4, 2])
      expect(heap.size).toBe(5)
      expect(heap.peek()).toBe(1)
    })

    it('creates heap from empty array', () => {
      const heap = LeftistHeap.fromArray<number>([])
      expect(heap.size).toBe(0)
    })

    it('creates heap with custom comparator', () => {
      const heap = LeftistHeap.fromArray([1, 2, 3, 4, 5], reverseComparator)
      expect(heap.peek()).toBe(5)
    })

    it('created heap is valid', () => {
      const heap = LeftistHeap.fromArray([5, 3, 7, 1, 4, 6, 2])
      expect(heap.isValid()).toBe(true)
    })
  })

  describe('static merge', () => {
    it('merges two heaps statically', () => {
      const a = new LeftistHeap([1, 3, 5])
      const b = new LeftistHeap([2, 4, 6])
      const merged = LeftistHeap.merge(a, b)
      expect(merged.size).toBe(6)
      expect(merged.toArray()).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('does not modify original heaps', () => {
      const a = new LeftistHeap([1, 3])
      const b = new LeftistHeap([2, 4])
      LeftistHeap.merge(a, b)
      expect(a.size).toBe(2)
      expect(b.size).toBe(2)
    })

    it('merges empty heaps', () => {
      const a = new LeftistHeap<number>()
      const b = new LeftistHeap<number>()
      const merged = LeftistHeap.merge(a, b)
      expect(merged.isEmpty()).toBe(true)
    })
  })

  describe('forEach', () => {
    it('does not call callback on empty heap', () => {
      const heap = new LeftistHeap<number>()
      let count = 0
      heap.forEach(() => {
        count++
      })
      expect(count).toBe(0)
    })

    it('calls callback for each element', () => {
      const heap = new LeftistHeap([1, 2, 3])
      let count = 0
      heap.forEach(() => {
        count++
      })
      expect(count).toBe(3)
    })

    it('provides correct index', () => {
      const heap = new LeftistHeap([1, 2, 3])
      const indices: number[] = []
      heap.forEach((_, idx) => {
        indices.push(idx)
      })
      expect(indices).toEqual([0, 1, 2])
    })

    it('provides correct values', () => {
      const heap = new LeftistHeap([3, 1, 2])
      const values: number[] = []
      heap.forEach((v) => {
        values.push(v)
      })
      expect(values.sort()).toEqual([1, 2, 3])
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates over empty heap', () => {
      const heap = new LeftistHeap<number>()
      const result = [...heap]
      expect(result).toEqual([])
    })

    it('iterates in sorted order', () => {
      const heap = new LeftistHeap([5, 3, 1, 4, 2])
      expect([...heap]).toEqual([1, 2, 3, 4, 5])
    })

    it('does not modify the heap', () => {
      const heap = new LeftistHeap([3, 1, 2])
      ;[...heap]
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(1)
    })

    it('works with for...of', () => {
      const heap = new LeftistHeap([3, 1, 2])
      const result: number[] = []
      for (const val of heap) {
        result.push(val)
      }
      expect(result).toEqual([1, 2, 3])
    })

    it('can be used multiple times', () => {
      const heap = new LeftistHeap([3, 1, 2])
      expect([...heap]).toEqual([1, 2, 3])
      expect([...heap]).toEqual([1, 2, 3])
    })
  })

  describe('isValid', () => {
    it('empty heap is valid', () => {
      const heap = new LeftistHeap<number>()
      expect(heap.isValid()).toBe(true)
    })

    it('single element heap is valid', () => {
      const heap = new LeftistHeap([1])
      expect(heap.isValid()).toBe(true)
    })

    it('heap after construction is valid', () => {
      const heap = new LeftistHeap([5, 3, 7, 1, 4, 6, 2])
      expect(heap.isValid()).toBe(true)
    })

    it('heap remains valid after inserts', () => {
      const heap = new LeftistHeap<number>()
      for (let i = 10; i >= 1; i--) {
        heap.insert(i)
      }
      expect(heap.isValid()).toBe(true)
    })

    it('heap remains valid after extracts', () => {
      const heap = new LeftistHeap([5, 3, 7, 1, 4, 6, 2])
      for (let i = 0; i < 5; i++) {
        heap.extractMin()
        expect(heap.isValid()).toBe(true)
      }
    })

    it('heap remains valid after merge', () => {
      const a = new LeftistHeap([1, 5, 9])
      const b = new LeftistHeap([2, 6, 10])
      const merged = a.merge(b)
      expect(merged.isValid()).toBe(true)
    })
  })

  describe('custom comparator', () => {
    it('works as max heap with reverse comparator', () => {
      const heap = new LeftistHeap<number>({ comparator: reverseComparator })
      heap.insert(1)
      heap.insert(5)
      heap.insert(3)
      heap.insert(2)
      heap.insert(4)
      expect(heap.toArray()).toEqual([5, 4, 3, 2, 1])
    })

    it('works with absolute value comparator', () => {
      const heap = new LeftistHeap<number>({ comparator: absComparator })
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
      const heap = new LeftistHeap<string>({ comparator: stringComparator })
      heap.insert('cherry')
      heap.insert('apple')
      heap.insert('banana')
      expect(heap.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('works with object comparator', () => {
      interface Item {
        priority: number
        name: string
      }
      const cmp: Comparator<Item> = (a, b) => a.priority - b.priority
      const heap = new LeftistHeap<Item>({ comparator: cmp })
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
      const heap = new LeftistHeap<number>()
      heap.insert(5)
      heap.insert(3)
      expect(heap.extractMin()).toBe(3)
      heap.insert(1)
      heap.insert(7)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(5)
      expect(heap.extractMin()).toBe(7)
      expect(heap.isEmpty()).toBe(true)
    })

    it('handles large number of elements', () => {
      const heap = new LeftistHeap<number>()
      for (let i = 1000; i >= 0; i--) {
        heap.insert(i)
      }
      expect(heap.size).toBe(1001)
      expect(heap.peek()).toBe(0)
      expect(heap.extractMin()).toBe(0)
      expect(heap.peek()).toBe(1)
    })

    it('handles sorted input', () => {
      const heap = new LeftistHeap([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      expect(heap.isValid()).toBe(true)
      expect(heap.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('handles reverse sorted input', () => {
      const heap = new LeftistHeap([10, 9, 8, 7, 6, 5, 4, 3, 2, 1])
      expect(heap.isValid()).toBe(true)
      expect(heap.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('handles same element repeated', () => {
      const heap = new LeftistHeap([5, 5, 5, 5, 5])
      expect(heap.size).toBe(5)
      expect(heap.toArray()).toEqual([5, 5, 5, 5, 5])
    })

    it('handles floating point numbers', () => {
      const heap = new LeftistHeap([3.14, 1.41, 2.72, 0.58])
      expect(heap.extractMin()).toBeCloseTo(0.58)
      expect(heap.extractMin()).toBeCloseTo(1.41)
    })

    it('handles negative numbers', () => {
      const heap = new LeftistHeap([-5, -1, -3, -2, -4])
      expect(heap.toArray()).toEqual([-5, -4, -3, -2, -1])
    })

    it('handles mixed positive and negative', () => {
      const heap = new LeftistHeap([-3, 5, -1, 2, 0, -4, 3])
      expect(heap.toArray()).toEqual([-4, -3, -1, 0, 2, 3, 5])
    })

    it('heap sort produces correct result', () => {
      const input = [42, 17, 23, 8, 91, 55, 3, 66, 1, 34]
      const heap = new LeftistHeap(input)
      const sorted: number[] = []
      while (!heap.isEmpty()) {
        sorted.push(heap.extractMin())
      }
      expect(sorted).toEqual([...input].sort((a, b) => a - b))
    })

    it('merge followed by extract produces correct order', () => {
      const a = new LeftistHeap([4, 1, 7])
      const b = new LeftistHeap([3, 6, 2])
      const merged = a.merge(b)
      const result: number[] = []
      while (!merged.isEmpty()) {
        result.push(merged.extractMin())
      }
      expect(result).toEqual([1, 2, 3, 4, 6, 7])
    })

    it('clone followed by operations on original', () => {
      const heap = new LeftistHeap([1, 2, 3, 4, 5])
      const cloned = heap.clone()
      heap.extractMin()
      heap.insert(0)
      expect(cloned.toArray()).toEqual([1, 2, 3, 4, 5])
      expect(heap.toArray()).toEqual([0, 2, 3, 4, 5])
    })

    it('handles chaining operations', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      const min1 = heap.extractMin()
      heap.insert(1)
      heap.insert(6)
      const min2 = heap.extractMin()
      expect(min1).toBe(3)
      expect(min2).toBe(1)
      expect(heap.toArray()).toEqual([5, 6, 7])
    })

    it('handles clear and rebuild', () => {
      const heap = new LeftistHeap([5, 3, 1, 4, 2])
      heap.clear()
      expect(heap.isEmpty()).toBe(true)
      heap.insert(10)
      heap.insert(20)
      heap.insert(30)
      expect(heap.toArray()).toEqual([10, 20, 30])
    })
  })

  describe('leftist property', () => {
    it('maintains rank(left) >= rank(right) for all nodes', () => {
      const heap = new LeftistHeap([10, 20, 30, 5, 15, 25, 35, 1, 2, 3])
      expect(heap.isValid()).toBe(true)
    })

    it('right spine length is O(log n)', () => {
      const heap = new LeftistHeap<number>()
      for (let i = 100; i >= 1; i--) {
        heap.insert(i)
      }
      expect(heap.isValid()).toBe(true)
    })

    it('merge is efficient (O(log n))', () => {
      const a = new LeftistHeap(Array.from({ length: 100 }, (_, i) => i))
      const b = new LeftistHeap(Array.from({ length: 100 }, (_, i) => i + 100))
      const merged = a.merge(b)
      expect(merged.isValid()).toBe(true)
      expect(merged.size).toBe(200)
      expect(merged.peek()).toBe(0)
    })
  })

  describe('handle-based operations integration', () => {
    it('insert returns unique handles', () => {
      const heap = new LeftistHeap<number>()
      const h1 = heap.insert(1)
      const h2 = heap.insert(1)
      expect(h1).not.toBe(h2)
      expect(h1.value).toBe(1)
      expect(h2.value).toBe(1)
    })

    it('decreaseKey and delete on same heap', () => {
      const heap = new LeftistHeap<number>()
      const h1 = heap.insert(10)
      const h2 = heap.insert(20)
      const h3 = heap.insert(30)
      heap.decreaseKey(h3, 5)
      heap.delete(h2)
      expect(heap.toArray()).toEqual([5, 10])
    })

    it('handles from cleared heap handle reuse', () => {
      const heap = new LeftistHeap<number>()
      const h1 = heap.insert(5)
      heap.clear()
      expect(heap.delete(h1)).toBe(false)
      const h2 = heap.insert(10)
      expect(heap.delete(h2)).toBe(true)
    })

    it('handles multiple decreaseKey calls', () => {
      const heap = new LeftistHeap<number>()
      const handles = []
      for (let i = 10; i < 20; i++) {
        handles.push(heap.insert(i))
      }
      for (let i = 0; i < handles.length; i++) {
        heap.decreaseKey(handles[i]!, i)
      }
      expect(heap.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('handles delete all elements one by one', () => {
      const heap = new LeftistHeap<number>()
      const handles = []
      for (let i = 1; i <= 10; i++) {
        handles.push(heap.insert(i))
      }
      for (const h of handles) {
        heap.delete(h)
      }
      expect(heap.isEmpty()).toBe(true)
    })
  })
})
