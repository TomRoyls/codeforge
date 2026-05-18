import { describe, it, expect } from 'vitest'
import { MinHeap } from '../../src/core/min-heap-4/index.js'

function createHeap(): MinHeap<number> {
  return new MinHeap<number>()
}

// ─── Constructor ───

describe('MinHeap', () => {
  describe('constructor', () => {
    it('creates an empty heap by default', () => {
      const heap = createHeap()
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('creates a heap with custom comparator for max-heap behavior', () => {
      const heap = new MinHeap<number>((a, b) => b - a)
      heap.insert(1)
      heap.insert(5)
      heap.insert(3)
      expect(heap.peek()).toBe(5)
    })

    it('creates a heap with string comparator', () => {
      const heap = new MinHeap<string>((a, b) => a.localeCompare(b))
      heap.insert('cherry')
      heap.insert('apple')
      heap.insert('banana')
      expect(heap.peek()).toBe('apple')
    })
  })

  // ─── Insert ───

  describe('insert', () => {
    it('inserts a single element', () => {
      const heap = createHeap()
      heap.insert(5)
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
    it('returns undefined on empty heap', () => {
      const heap = createHeap()
      expect(heap.extractMin()).toBeUndefined()
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
      while (!heap.isEmpty()) {
        extracted.push(heap.extractMin()!)
      }
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
    it('returns undefined on empty heap', () => {
      const heap = createHeap()
      expect(heap.peek()).toBeUndefined()
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

  // ─── DecreaseKey ───

  describe('decreaseKey', () => {
    it('decreases a key and maintains heap property', () => {
      const heap = createHeap()
      heap.insert(10)
      heap.insert(20)
      heap.insert(30)
      heap.decreaseKey(2, 5)
      expect(heap.peek()).toBe(5)
    })

    it('does nothing for out-of-bounds index', () => {
      const heap = createHeap()
      heap.insert(1)
      heap.insert(2)
      heap.decreaseKey(-1, 0)
      heap.decreaseKey(5, 0)
      expect(heap.size()).toBe(2)
      expect(heap.peek()).toBe(1)
    })

    it('does nothing if new value is greater', () => {
      const heap = createHeap()
      heap.insert(1)
      heap.insert(5)
      heap.decreaseKey(0, 10)
      expect(heap.peek()).toBe(1)
    })
  })

  // ─── Delete ───

  describe('delete', () => {
    it('deletes an element at given index', () => {
      const heap = createHeap()
      heap.insert(10)
      heap.insert(20)
      heap.insert(30)
      heap.delete(1)
      expect(heap.size()).toBe(2)
    })

    it('does nothing for out-of-bounds index', () => {
      const heap = createHeap()
      heap.insert(1)
      heap.delete(-1)
      heap.delete(5)
      expect(heap.size()).toBe(1)
    })

    it('deletes root and maintains heap property', () => {
      const heap = createHeap()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.delete(0)
      expect(heap.peek()).toBe(2)
    })

    it('deletes last element', () => {
      const heap = createHeap()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.delete(2)
      expect(heap.size()).toBe(2)
      expect(heap.toArray()).toEqual(expect.arrayContaining([1, 2]))
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
  })

  // ─── Contains ───

  describe('contains', () => {
    it('returns false for empty heap', () => {
      const heap = createHeap()
      expect(heap.contains(1)).toBe(false)
    })

    it('returns true for existing element', () => {
      const heap = createHeap()
      heap.insert(5)
      heap.insert(10)
      expect(heap.contains(5)).toBe(true)
      expect(heap.contains(10)).toBe(true)
    })

    it('returns false for non-existing element', () => {
      const heap = createHeap()
      heap.insert(5)
      expect(heap.contains(99)).toBe(false)
    })
  })

  // ─── Merge ───

  describe('merge', () => {
    it('merges two heaps', () => {
      const h1 = createHeap()
      h1.insert(1)
      h1.insert(3)
      const h2 = createHeap()
      h2.insert(2)
      h2.insert(4)
      const merged = h1.merge(h2)
      expect(merged.size()).toBe(4)
      expect(merged.peek()).toBe(1)
    })

    it('merges with an empty heap', () => {
      const h1 = createHeap()
      h1.insert(5)
      h1.insert(3)
      const h2 = createHeap()
      const merged = h1.merge(h2)
      expect(merged.size()).toBe(2)
      expect(merged.peek()).toBe(3)
    })

    it('does not modify original heaps', () => {
      const h1 = createHeap()
      h1.insert(1)
      const h2 = createHeap()
      h2.insert(2)
      const merged = h1.merge(h2)
      expect(h1.size()).toBe(1)
      expect(h2.size()).toBe(1)
      expect(merged.size()).toBe(2)
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
      expect(heap.peek()).toBeUndefined()
    })
  })

  // ─── GetTimeComplexity ───

  describe('getTimeComplexity', () => {
    it('returns a non-empty string', () => {
      const heap = createHeap()
      const tc = heap.getTimeComplexity()
      expect(typeof tc).toBe('string')
      expect(tc.length).toBeGreaterThan(0)
    })
  })
})
