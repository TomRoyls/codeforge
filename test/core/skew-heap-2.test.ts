import { describe, it, expect } from 'vitest'
import { SkewHeap2 } from '../../src/core/skew-heap-2/index.js'

// ─── Constructor ───

describe('SkewHeap2', () => {
  describe('constructor', () => {
    it('creates empty heap with default comparator', () => {
      const heap = new SkewHeap2<number>()
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('creates heap with custom comparator (max-heap)', () => {
      const heap = new SkewHeap2<number>((a, b) => b - a)
      heap.insert(1).insert(3).insert(2)
      expect(heap.peek()).toBe(3)
    })
  })

  // ─── insert ───

  describe('insert', () => {
    it('inserts a single element', () => {
      const heap = new SkewHeap2<number>()
      heap.insert(5)
      expect(heap.size()).toBe(1)
      expect(heap.peek()).toBe(5)
    })

    it('inserts multiple elements and maintains min at root', () => {
      const heap = new SkewHeap2<number>()
      heap.insert(5).insert(3).insert(7).insert(1).insert(4)
      expect(heap.peek()).toBe(1)
      expect(heap.size()).toBe(5)
    })

    it('returns the heap instance for chaining', () => {
      const heap = new SkewHeap2<number>()
      const result = heap.insert(1)
      expect(result).toBe(heap)
    })

    it('handles duplicate values', () => {
      const heap = new SkewHeap2<number>()
      heap.insert(3).insert(3).insert(3)
      expect(heap.size()).toBe(3)
      expect(heap.peek()).toBe(3)
    })

    it('handles negative values', () => {
      const heap = new SkewHeap2<number>()
      heap.insert(-5).insert(0).insert(-3).insert(2)
      expect(heap.peek()).toBe(-5)
    })
  })

  // ─── peek ───

  describe('peek', () => {
    it('returns null for empty heap', () => {
      const heap = new SkewHeap2<number>()
      expect(heap.peek()).toBeNull()
    })

    it('returns the minimum element', () => {
      const heap = new SkewHeap2<number>()
      heap.insert(5).insert(2).insert(8)
      expect(heap.peek()).toBe(2)
    })

    it('does not remove the element', () => {
      const heap = new SkewHeap2<number>()
      heap.insert(5).insert(2)
      heap.peek()
      expect(heap.size()).toBe(2)
      expect(heap.peek()).toBe(2)
    })
  })

  // ─── extractMin ───

  describe('extractMin', () => {
    it('returns null for empty heap', () => {
      const heap = new SkewHeap2<number>()
      expect(heap.extractMin()).toBeNull()
    })

    it('extracts elements in sorted order', () => {
      const heap = new SkewHeap2<number>()
      heap.insert(5).insert(3).insert(7).insert(1).insert(4)
      const result: number[] = []
      while (!heap.isEmpty()) {
        const val = heap.extractMin()
        if (val !== null) result.push(val)
      }
      expect(result).toEqual([1, 3, 4, 5, 7])
    })

    it('decreases size on each extraction', () => {
      const heap = new SkewHeap2<number>()
      heap.insert(1).insert(2).insert(3)
      heap.extractMin()
      expect(heap.size()).toBe(2)
      heap.extractMin()
      expect(heap.size()).toBe(1)
      heap.extractMin()
      expect(heap.size()).toBe(0)
    })

    it('handles single element', () => {
      const heap = new SkewHeap2<number>()
      heap.insert(42)
      expect(heap.extractMin()).toBe(42)
      expect(heap.isEmpty()).toBe(true)
    })

    it('handles duplicates', () => {
      const heap = new SkewHeap2<number>()
      heap.insert(2).insert(2).insert(1).insert(1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(2)
      expect(heap.extractMin()).toBe(2)
    })

    it('handles negative numbers', () => {
      const heap = new SkewHeap2<number>()
      heap.insert(-3).insert(0).insert(-5).insert(2)
      expect(heap.extractMin()).toBe(-5)
      expect(heap.extractMin()).toBe(-3)
      expect(heap.extractMin()).toBe(0)
      expect(heap.extractMin()).toBe(2)
    })
  })

  // ─── merge ───

  describe('merge', () => {
    it('merges two non-empty heaps', () => {
      const heap1 = new SkewHeap2<number>()
      const heap2 = new SkewHeap2<number>()
      heap1.insert(3).insert(1)
      heap2.insert(4).insert(2)
      heap1.merge(heap2)
      expect(heap1.size()).toBe(4)
      expect(heap1.peek()).toBe(1)
    })

    it('clears the other heap after merge', () => {
      const heap1 = new SkewHeap2<number>()
      const heap2 = new SkewHeap2<number>()
      heap1.insert(1)
      heap2.insert(2).insert(3)
      heap1.merge(heap2)
      expect(heap2.size()).toBe(0)
      expect(heap2.isEmpty()).toBe(true)
    })

    it('merges into empty heap', () => {
      const heap1 = new SkewHeap2<number>()
      const heap2 = new SkewHeap2<number>()
      heap2.insert(1).insert(2)
      heap1.merge(heap2)
      expect(heap1.size()).toBe(2)
      expect(heap1.peek()).toBe(1)
    })

    it('merges empty heap into non-empty', () => {
      const heap1 = new SkewHeap2<number>()
      const heap2 = new SkewHeap2<number>()
      heap1.insert(5).insert(3)
      heap1.merge(heap2)
      expect(heap1.size()).toBe(2)
    })

    it('merged heap extracts all elements in order', () => {
      const heap1 = new SkewHeap2<number>()
      const heap2 = new SkewHeap2<number>()
      heap1.insert(5).insert(1)
      heap2.insert(4).insert(2).insert(3)
      heap1.merge(heap2)
      const result: number[] = []
      while (!heap1.isEmpty()) {
        const val = heap1.extractMin()
        if (val !== null) result.push(val)
      }
      expect(result).toEqual([1, 2, 3, 4, 5])
    })

    it('returns the heap instance for chaining', () => {
      const heap1 = new SkewHeap2<number>()
      const heap2 = new SkewHeap2<number>()
      heap1.insert(1)
      const result = heap1.merge(heap2)
      expect(result).toBe(heap1)
    })
  })

  // ─── size ───

  describe('size', () => {
    it('returns 0 for new heap', () => {
      const heap = new SkewHeap2<number>()
      expect(heap.size()).toBe(0)
    })

    it('increments with each insert', () => {
      const heap = new SkewHeap2<number>()
      heap.insert(1).insert(2).insert(3)
      expect(heap.size()).toBe(3)
    })

    it('decrements with extractMin', () => {
      const heap = new SkewHeap2<number>()
      heap.insert(1).insert(2)
      heap.extractMin()
      expect(heap.size()).toBe(1)
    })
  })

  // ─── isEmpty ───

  describe('isEmpty', () => {
    it('returns true for new heap', () => {
      expect(new SkewHeap2<number>().isEmpty()).toBe(true)
    })

    it('returns false after insert', () => {
      const heap = new SkewHeap2<number>()
      heap.insert(1)
      expect(heap.isEmpty()).toBe(false)
    })

    it('returns true after extracting all elements', () => {
      const heap = new SkewHeap2<number>()
      heap.insert(1)
      heap.extractMin()
      expect(heap.isEmpty()).toBe(true)
    })
  })

  // ─── clear ───

  describe('clear', () => {
    it('clears a non-empty heap', () => {
      const heap = new SkewHeap2<number>()
      heap.insert(1).insert(2).insert(3)
      heap.clear()
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
      expect(heap.peek()).toBeNull()
    })

    it('clearing an already empty heap is safe', () => {
      const heap = new SkewHeap2<number>()
      heap.clear()
      expect(heap.size()).toBe(0)
    })
  })

  // ─── toArray ───

  describe('toArray', () => {
    it('returns empty array for empty heap', () => {
      const heap = new SkewHeap2<number>()
      expect(heap.toArray()).toEqual([])
    })

    it('returns sorted elements', () => {
      const heap = new SkewHeap2<number>()
      heap.insert(5).insert(3).insert(1).insert(4).insert(2)
      expect(heap.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('does not modify the heap', () => {
      const heap = new SkewHeap2<number>()
      heap.insert(3).insert(1).insert(2)
      heap.toArray()
      expect(heap.size()).toBe(3)
      expect(heap.peek()).toBe(1)
    })

    it('handles single element', () => {
      const heap = new SkewHeap2<number>()
      heap.insert(42)
      expect(heap.toArray()).toEqual([42])
    })

    it('handles duplicates', () => {
      const heap = new SkewHeap2<number>()
      heap.insert(2).insert(1).insert(2).insert(1)
      expect(heap.toArray()).toEqual([1, 1, 2, 2])
    })
  })

  // ─── decreaseKey ───

  describe('decreaseKey', () => {
    it('decreases a key successfully', () => {
      const heap = new SkewHeap2<number>()
      heap.insert(5).insert(10).insert(15)
      expect(heap.decreaseKey(10, 2)).toBe(true)
      expect(heap.toArray().sort((a, b) => a - b)).toEqual([2, 5, 15])
    })

    it('returns false when increasing a key', () => {
      const heap = new SkewHeap2<number>()
      heap.insert(5).insert(10)
      expect(heap.decreaseKey(5, 15)).toBe(false)
    })

    it('returns false when value does not exist', () => {
      const heap = new SkewHeap2<number>()
      heap.insert(5)
      expect(heap.decreaseKey(10, 1)).toBe(false)
    })

    it('returns false on empty heap', () => {
      const heap = new SkewHeap2<number>()
      expect(heap.decreaseKey(1, 0)).toBe(false)
    })

    it('allows decreasing to same value', () => {
      const heap = new SkewHeap2<number>()
      heap.insert(5)
      expect(heap.decreaseKey(5, 5)).toBe(true)
    })
  })

  // ─── delete ───

  describe('delete', () => {
    it('deletes an existing element', () => {
      const heap = new SkewHeap2<number>()
      heap.insert(5).insert(3).insert(7)
      expect(heap.delete(5)).toBe(true)
      expect(heap.size()).toBe(2)
    })

    it('returns false when element does not exist', () => {
      const heap = new SkewHeap2<number>()
      heap.insert(5)
      expect(heap.delete(10)).toBe(false)
    })

    it('returns false on empty heap', () => {
      const heap = new SkewHeap2<number>()
      expect(heap.delete(1)).toBe(false)
    })

    it('deleted heap still extracts remaining in order', () => {
      const heap = new SkewHeap2<number>()
      heap.insert(5).insert(3).insert(7).insert(1)
      heap.delete(3)
      const result: number[] = []
      while (!heap.isEmpty()) {
        const val = heap.extractMin()
        if (val !== null) result.push(val)
      }
      expect(result).toEqual([1, 5, 7])
    })

    it('handles deleting the only element', () => {
      const heap = new SkewHeap2<number>()
      heap.insert(42)
      expect(heap.delete(42)).toBe(true)
      expect(heap.isEmpty()).toBe(true)
    })
  })
})
