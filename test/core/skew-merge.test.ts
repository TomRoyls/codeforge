import { describe, it, expect } from 'vitest'
import { SkewMerge } from '../../src/core/skew-merge/index.js'

// ─── Constructor ───

describe('SkewMerge', () => {
  describe('constructor', () => {
    it('creates empty heap with default comparator', () => {
      const heap = new SkewMerge<number>()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('creates heap with custom comparator (max-heap)', () => {
      const heap = new SkewMerge<number>((a, b) => b - a)
      heap.insert(1)
      heap.insert(3)
      heap.insert(2)
      expect(heap.peek()).toBe(3)
    })
  })

  // ─── insert ───

  describe('insert', () => {
    it('inserts a single element', () => {
      const heap = new SkewMerge<number>()
      heap.insert(5)
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(5)
    })

    it('inserts multiple elements maintaining min at root', () => {
      const heap = new SkewMerge<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.insert(1)
      heap.insert(4)
      expect(heap.peek()).toBe(1)
      expect(heap.size).toBe(5)
    })

    it('handles duplicate values', () => {
      const heap = new SkewMerge<number>()
      heap.insert(3)
      heap.insert(3)
      heap.insert(3)
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(3)
    })

    it('handles negative values', () => {
      const heap = new SkewMerge<number>()
      heap.insert(-5)
      heap.insert(0)
      heap.insert(-3)
      heap.insert(2)
      expect(heap.peek()).toBe(-5)
    })
  })

  // ─── peek ───

  describe('peek', () => {
    it('returns undefined for empty heap', () => {
      const heap = new SkewMerge<number>()
      expect(heap.peek()).toBeUndefined()
    })

    it('returns the minimum element', () => {
      const heap = new SkewMerge<number>()
      heap.insert(5)
      heap.insert(2)
      heap.insert(8)
      expect(heap.peek()).toBe(2)
    })

    it('does not remove the element', () => {
      const heap = new SkewMerge<number>()
      heap.insert(5)
      heap.insert(2)
      heap.peek()
      expect(heap.size).toBe(2)
      expect(heap.peek()).toBe(2)
    })
  })

  // ─── extractMin ───

  describe('extractMin', () => {
    it('returns undefined for empty heap', () => {
      const heap = new SkewMerge<number>()
      expect(heap.extractMin()).toBeUndefined()
    })

    it('extracts elements in sorted order', () => {
      const heap = new SkewMerge<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.insert(1)
      heap.insert(4)
      const result: number[] = []
      while (!heap.isEmpty()) {
        const val = heap.extractMin()
        if (val !== undefined) result.push(val)
      }
      expect(result).toEqual([1, 3, 4, 5, 7])
    })

    it('decreases size on each extraction', () => {
      const heap = new SkewMerge<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.extractMin()
      expect(heap.size).toBe(2)
      heap.extractMin()
      expect(heap.size).toBe(1)
      heap.extractMin()
      expect(heap.size).toBe(0)
    })

    it('handles single element', () => {
      const heap = new SkewMerge<number>()
      heap.insert(42)
      expect(heap.extractMin()).toBe(42)
      expect(heap.isEmpty()).toBe(true)
    })

    it('handles duplicates', () => {
      const heap = new SkewMerge<number>()
      heap.insert(2)
      heap.insert(2)
      heap.insert(1)
      heap.insert(1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(2)
      expect(heap.extractMin()).toBe(2)
    })

    it('handles negative numbers', () => {
      const heap = new SkewMerge<number>()
      heap.insert(-3)
      heap.insert(0)
      heap.insert(-5)
      heap.insert(2)
      expect(heap.extractMin()).toBe(-5)
      expect(heap.extractMin()).toBe(-3)
      expect(heap.extractMin()).toBe(0)
      expect(heap.extractMin()).toBe(2)
    })
  })

  // ─── merge ───

  describe('merge', () => {
    it('merges two non-empty heaps', () => {
      const heap1 = new SkewMerge<number>()
      const heap2 = new SkewMerge<number>()
      heap1.insert(3)
      heap1.insert(1)
      heap2.insert(4)
      heap2.insert(2)
      heap1.merge(heap2)
      expect(heap1.size).toBe(4)
      expect(heap1.peek()).toBe(1)
    })

    it('clears the other heap after merge', () => {
      const heap1 = new SkewMerge<number>()
      const heap2 = new SkewMerge<number>()
      heap1.insert(1)
      heap2.insert(2)
      heap2.insert(3)
      heap1.merge(heap2)
      expect(heap2.size).toBe(0)
      expect(heap2.isEmpty()).toBe(true)
    })

    it('merges into empty heap', () => {
      const heap1 = new SkewMerge<number>()
      const heap2 = new SkewMerge<number>()
      heap2.insert(1)
      heap2.insert(2)
      heap1.merge(heap2)
      expect(heap1.size).toBe(2)
      expect(heap1.peek()).toBe(1)
    })

    it('merges empty heap into non-empty', () => {
      const heap1 = new SkewMerge<number>()
      const heap2 = new SkewMerge<number>()
      heap1.insert(5)
      heap1.insert(3)
      heap1.merge(heap2)
      expect(heap1.size).toBe(2)
    })

    it('merged heap extracts all elements in order', () => {
      const heap1 = new SkewMerge<number>()
      const heap2 = new SkewMerge<number>()
      heap1.insert(5)
      heap1.insert(1)
      heap2.insert(4)
      heap2.insert(2)
      heap2.insert(3)
      heap1.merge(heap2)
      const result: number[] = []
      while (!heap1.isEmpty()) {
        const val = heap1.extractMin()
        if (val !== undefined) result.push(val)
      }
      expect(result).toEqual([1, 2, 3, 4, 5])
    })

    it('merges two empty heaps safely', () => {
      const heap1 = new SkewMerge<number>()
      const heap2 = new SkewMerge<number>()
      heap1.merge(heap2)
      expect(heap1.isEmpty()).toBe(true)
      expect(heap2.isEmpty()).toBe(true)
    })
  })

  // ─── size ───

  describe('size', () => {
    it('returns 0 for new heap', () => {
      const heap = new SkewMerge<number>()
      expect(heap.size).toBe(0)
    })

    it('increments with each insert', () => {
      const heap = new SkewMerge<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      expect(heap.size).toBe(3)
    })

    it('decrements with extractMin', () => {
      const heap = new SkewMerge<number>()
      heap.insert(1)
      heap.insert(2)
      heap.extractMin()
      expect(heap.size).toBe(1)
    })
  })

  // ─── isEmpty ───

  describe('isEmpty', () => {
    it('returns true for new heap', () => {
      expect(new SkewMerge<number>().isEmpty()).toBe(true)
    })

    it('returns false after insert', () => {
      const heap = new SkewMerge<number>()
      heap.insert(1)
      expect(heap.isEmpty()).toBe(false)
    })

    it('returns true after extracting all elements', () => {
      const heap = new SkewMerge<number>()
      heap.insert(1)
      heap.extractMin()
      expect(heap.isEmpty()).toBe(true)
    })
  })

  // ─── clear ───

  describe('clear', () => {
    it('clears a non-empty heap', () => {
      const heap = new SkewMerge<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.clear()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
      expect(heap.peek()).toBeUndefined()
    })

    it('clearing an already empty heap is safe', () => {
      const heap = new SkewMerge<number>()
      heap.clear()
      expect(heap.size).toBe(0)
    })
  })

  // ─── toArray ───

  describe('toArray', () => {
    it('returns empty array for empty heap', () => {
      const heap = new SkewMerge<number>()
      expect(heap.toArray()).toEqual([])
    })

    it('returns sorted elements', () => {
      const heap = new SkewMerge<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(1)
      heap.insert(4)
      heap.insert(2)
      expect(heap.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('does not modify the heap', () => {
      const heap = new SkewMerge<number>()
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      heap.toArray()
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(1)
    })

    it('handles single element', () => {
      const heap = new SkewMerge<number>()
      heap.insert(42)
      expect(heap.toArray()).toEqual([42])
    })

    it('handles duplicates', () => {
      const heap = new SkewMerge<number>()
      heap.insert(2)
      heap.insert(1)
      heap.insert(2)
      heap.insert(1)
      expect(heap.toArray()).toEqual([1, 1, 2, 2])
    })
  })
})
