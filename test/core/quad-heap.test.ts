import { describe, it, expect } from 'vitest'
import { QuadHeap } from '../../src/core/quad-heap/index.js'

function createHeap(): QuadHeap<number> {
  return new QuadHeap<number>()
}

function createMaxHeap(): QuadHeap<number> {
  return new QuadHeap<number>((a, b) => b - a)
}

// ─── Constructor ───

describe('QuadHeap', () => {
  describe('constructor', () => {
    it('creates an empty heap by default', () => {
      const heap = createHeap()
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('creates a max-heap with custom comparator', () => {
      const heap = createMaxHeap()
      heap.insert(1)
      heap.insert(5)
      heap.insert(3)
      expect(heap.peek()).toBe(5)
    })

    it('creates a heap with string comparator', () => {
      const heap = new QuadHeap<string>((a, b) => a.localeCompare(b))
      heap.insert('cherry')
      heap.insert('apple')
      heap.insert('banana')
      expect(heap.peek()).toBe('apple')
    })
  })

  // ─── Insert ───

  describe('insert', () => {
    it('inserts a single element and returns index', () => {
      const heap = createHeap()
      const idx = heap.insert(5)
      expect(idx).toBe(0)
      expect(heap.size()).toBe(1)
      expect(heap.isEmpty()).toBe(false)
      expect(heap.peek()).toBe(5)
    })

    it('inserts multiple elements maintaining min-heap property', () => {
      const heap = createHeap()
      heap.insert(5)
      heap.insert(3)
      heap.insert(1)
      heap.insert(4)
      heap.insert(2)
      expect(heap.peek()).toBe(1)
      expect(heap.size()).toBe(5)
    })

    it('inserts duplicate values', () => {
      const heap = createHeap()
      heap.insert(3)
      heap.insert(3)
      heap.insert(1)
      heap.insert(1)
      expect(heap.size()).toBe(4)
      expect(heap.peek()).toBe(1)
    })

    it('inserts in sorted order', () => {
      const heap = createHeap()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.insert(4)
      expect(heap.peek()).toBe(1)
    })

    it('inserts in reverse sorted order', () => {
      const heap = createHeap()
      heap.insert(4)
      heap.insert(3)
      heap.insert(2)
      heap.insert(1)
      expect(heap.peek()).toBe(1)
    })
  })

  // ─── ExtractMin ───

  describe('extractMin', () => {
    it('returns null on empty heap', () => {
      const heap = createHeap()
      expect(heap.extractMin()).toBeNull()
    })

    it('extracts the single element', () => {
      const heap = createHeap()
      heap.insert(42)
      expect(heap.extractMin()).toBe(42)
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('extracts elements in sorted order', () => {
      const heap = createHeap()
      const values = [5, 3, 1, 4, 2]
      for (const v of values) heap.insert(v)
      const extracted: number[] = []
      while (!heap.isEmpty()) extracted.push(heap.extractMin()!)
      expect(extracted).toEqual([1, 2, 3, 4, 5])
    })

    it('handles duplicate values correctly', () => {
      const heap = createHeap()
      heap.insert(2)
      heap.insert(1)
      heap.insert(2)
      heap.insert(1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(2)
      expect(heap.extractMin()).toBe(2)
    })

    it('preserves heap property after extraction', () => {
      const heap = createHeap()
      for (let i = 10; i >= 1; i--) heap.insert(i)
      heap.extractMin()
      expect(heap.peek()).toBe(2)
    })
  })

  // ─── Peek ───

  describe('peek', () => {
    it('returns null on empty heap', () => {
      const heap = createHeap()
      expect(heap.peek()).toBeNull()
    })

    it('returns the minimum element without removing it', () => {
      const heap = createHeap()
      heap.insert(5)
      heap.insert(1)
      heap.insert(3)
      expect(heap.peek()).toBe(1)
      expect(heap.size()).toBe(3)
    })

    it('returns the same element on repeated calls', () => {
      const heap = createHeap()
      heap.insert(42)
      expect(heap.peek()).toBe(42)
      expect(heap.peek()).toBe(42)
      expect(heap.peek()).toBe(42)
    })
  })

  // ─── Size and isEmpty ───

  describe('size and isEmpty', () => {
    it('tracks size correctly through insertions and extractions', () => {
      const heap = createHeap()
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
      heap.insert(1)
      expect(heap.size()).toBe(1)
      expect(heap.isEmpty()).toBe(false)
      heap.insert(2)
      expect(heap.size()).toBe(2)
      heap.extractMin()
      expect(heap.size()).toBe(1)
      heap.extractMin()
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })
  })

  // ─── Clear ───

  describe('clear', () => {
    it('clears all elements', () => {
      const heap = createHeap()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.clear()
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
      expect(heap.peek()).toBeNull()
    })
  })

  // ─── ToArray ───

  describe('toArray', () => {
    it('returns empty array for empty heap', () => {
      const heap = createHeap()
      expect(heap.toArray()).toEqual([])
    })

    it('returns a copy of the internal array', () => {
      const heap = createHeap()
      heap.insert(1)
      heap.insert(2)
      const arr = heap.toArray()
      expect(arr).toHaveLength(2)
      expect(arr).toContain(1)
      expect(arr).toContain(2)
    })

    it('does not modify heap when returned array is mutated', () => {
      const heap = createHeap()
      heap.insert(1)
      heap.insert(2)
      const arr = heap.toArray()
      arr.push(99)
      expect(heap.size()).toBe(2)
    })
  })

  // ─── Heapify ───

  describe('heapify', () => {
    it('builds a valid heap from an unsorted array', () => {
      const heap = createHeap()
      heap.heapify([5, 3, 1, 4, 2])
      expect(heap.peek()).toBe(1)
      expect(heap.size()).toBe(5)
    })

    it('handles an empty array', () => {
      const heap = createHeap()
      heap.heapify([])
      expect(heap.isEmpty()).toBe(true)
    })

    it('handles a single-element array', () => {
      const heap = createHeap()
      heap.heapify([42])
      expect(heap.peek()).toBe(42)
      expect(heap.size()).toBe(1)
    })

    it('builds heap that extracts in sorted order', () => {
      const heap = createHeap()
      heap.heapify([9, 7, 5, 3, 1, 2, 4, 6, 8])
      const sorted: number[] = []
      while (!heap.isEmpty()) sorted.push(heap.extractMin()!)
      expect(sorted).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })
  })

  // ─── Replace ───

  describe('replace', () => {
    it('returns null on empty heap', () => {
      const heap = createHeap()
      expect(heap.replace(5)).toBeNull()
    })

    it('replaces the root and returns old root', () => {
      const heap = createHeap()
      heap.insert(1)
      heap.insert(5)
      heap.insert(3)
      const old = heap.replace(10)
      expect(old).toBe(1)
      expect(heap.peek()).toBe(3)
    })

    it('maintains heap property after replace', () => {
      const heap = createHeap()
      heap.heapify([1, 2, 3, 4, 5])
      heap.replace(0)
      expect(heap.peek()).toBe(0)
    })
  })

  // ─── PushPop ───

  describe('pushPop', () => {
    it('inserts and returns null on empty heap', () => {
      const heap = createHeap()
      const result = heap.pushPop(5)
      expect(result).toBeNull()
      expect(heap.size()).toBe(1)
    })

    it('returns the new value if it is smaller than min', () => {
      const heap = createHeap()
      heap.insert(10)
      heap.insert(20)
      heap.insert(30)
      const result = heap.pushPop(5)
      expect(result).toBe(5)
      expect(heap.peek()).toBe(10)
    })

    it('returns the old min and inserts new value if new is larger', () => {
      const heap = createHeap()
      heap.insert(10)
      heap.insert(20)
      heap.insert(30)
      const result = heap.pushPop(25)
      expect(result).toBe(10)
      expect(heap.peek()).toBe(20)
    })

    it('maintains heap size when value is returned', () => {
      const heap = createHeap()
      heap.insert(10)
      heap.pushPop(5)
      expect(heap.size()).toBe(1)
    })

    it('maintains heap size when value is inserted', () => {
      const heap = createHeap()
      heap.insert(10)
      heap.pushPop(20)
      expect(heap.size()).toBe(1)
      expect(heap.peek()).toBe(20)
    })
  })
})
