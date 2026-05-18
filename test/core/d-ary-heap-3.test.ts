import { describe, it, expect } from 'vitest'
import { DAryHeap } from '../../src/core/d-ary-heap-3/index.js'

function createMaxHeap(): DAryHeap<number> {
  return new DAryHeap<number>(4)
}

function createMinHeap(): DAryHeap<number> {
  return new DAryHeap<number>(4, (a, b) => b - a)
}

function createTernaryHeap(): DAryHeap<number> {
  return new DAryHeap<number>(3)
}

// ─── Constructor ───

describe('DAryHeap', () => {
  describe('constructor', () => {
    it('creates an empty heap by default with d=4', () => {
      const heap = createMaxHeap()
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('creates a min-heap with custom comparator', () => {
      const heap = createMinHeap()
      heap.insert(5)
      heap.insert(1)
      heap.insert(3)
      expect(heap.peek()).toBe(1)
    })

    it('creates a ternary heap with d=3', () => {
      const heap = createTernaryHeap()
      heap.insert(1)
      heap.insert(5)
      heap.insert(3)
      expect(heap.peek()).toBe(5)
    })

    it('defaults to d=4 when no d is provided', () => {
      const heap = new DAryHeap<number>()
      heap.insert(1)
      heap.insert(5)
      expect(heap.peek()).toBe(5)
    })

    it('enforces minimum d of 2', () => {
      const heap = new DAryHeap<number>(1)
      heap.insert(1)
      heap.insert(5)
      heap.insert(3)
      expect(heap.peek()).toBe(5)
      expect(heap.size()).toBe(3)
    })
  })

  // ─── Insert ───

  describe('insert', () => {
    it('inserts a single element', () => {
      const heap = createMaxHeap()
      heap.insert(5)
      expect(heap.size()).toBe(1)
      expect(heap.isEmpty()).toBe(false)
      expect(heap.peek()).toBe(5)
    })

    it('inserts multiple elements maintaining max-heap property', () => {
      const heap = createMaxHeap()
      heap.insert(1)
      heap.insert(5)
      heap.insert(3)
      heap.insert(2)
      heap.insert(4)
      expect(heap.peek()).toBe(5)
      expect(heap.size()).toBe(5)
    })

    it('inserts duplicate values', () => {
      const heap = createMaxHeap()
      heap.insert(3)
      heap.insert(3)
      heap.insert(1)
      heap.insert(1)
      expect(heap.size()).toBe(4)
      expect(heap.peek()).toBe(3)
    })

    it('inserts in sorted order', () => {
      const heap = createMaxHeap()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      expect(heap.peek()).toBe(3)
    })

    it('inserts in reverse sorted order', () => {
      const heap = createMaxHeap()
      heap.insert(3)
      heap.insert(2)
      heap.insert(1)
      expect(heap.peek()).toBe(3)
    })
  })

  // ─── Extract ───

  describe('extract', () => {
    it('returns undefined on empty heap', () => {
      const heap = createMaxHeap()
      expect(heap.extract()).toBeUndefined()
    })

    it('extracts the single element', () => {
      const heap = createMaxHeap()
      heap.insert(42)
      expect(heap.extract()).toBe(42)
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('extracts elements in descending order for max-heap', () => {
      const heap = createMaxHeap()
      const values = [1, 3, 5, 2, 4]
      for (const v of values) heap.insert(v)
      const extracted: number[] = []
      while (!heap.isEmpty()) extracted.push(heap.extract()!)
      expect(extracted).toEqual([5, 4, 3, 2, 1])
    })

    it('handles duplicate values correctly', () => {
      const heap = createMaxHeap()
      heap.insert(2)
      heap.insert(1)
      heap.insert(2)
      heap.insert(1)
      expect(heap.extract()).toBe(2)
      expect(heap.extract()).toBe(2)
      expect(heap.extract()).toBe(1)
      expect(heap.extract()).toBe(1)
    })

    it('preserves heap property after extraction', () => {
      const heap = createMaxHeap()
      for (let i = 1; i <= 10; i++) heap.insert(i)
      heap.extract()
      expect(heap.peek()).toBe(9)
    })
  })

  // ─── Peek ───

  describe('peek', () => {
    it('returns undefined on empty heap', () => {
      const heap = createMaxHeap()
      expect(heap.peek()).toBeUndefined()
    })

    it('returns the top element without removing it', () => {
      const heap = createMaxHeap()
      heap.insert(5)
      heap.insert(10)
      heap.insert(3)
      expect(heap.peek()).toBe(10)
      expect(heap.size()).toBe(3)
    })

    it('returns the same element on repeated calls', () => {
      const heap = createMaxHeap()
      heap.insert(42)
      expect(heap.peek()).toBe(42)
      expect(heap.peek()).toBe(42)
    })
  })

  // ─── Size and isEmpty ───

  describe('size and isEmpty', () => {
    it('tracks size correctly through operations', () => {
      const heap = createMaxHeap()
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
      heap.insert(1)
      expect(heap.size()).toBe(1)
      expect(heap.isEmpty()).toBe(false)
      heap.insert(2)
      expect(heap.size()).toBe(2)
      heap.extract()
      expect(heap.size()).toBe(1)
      heap.extract()
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })
  })

  // ─── Heapify ───

  describe('heapify', () => {
    it('builds a valid max-heap from an unsorted array', () => {
      const heap = createMaxHeap()
      heap.heapify([1, 3, 5, 2, 4])
      expect(heap.peek()).toBe(5)
      expect(heap.size()).toBe(5)
    })

    it('handles an empty array', () => {
      const heap = createMaxHeap()
      heap.heapify([])
      expect(heap.isEmpty()).toBe(true)
    })

    it('handles a single-element array', () => {
      const heap = createMaxHeap()
      heap.heapify([42])
      expect(heap.peek()).toBe(42)
      expect(heap.size()).toBe(1)
    })

    it('builds heap that extracts in descending order', () => {
      const heap = createMaxHeap()
      heap.heapify([1, 2, 3, 4, 5, 6, 7, 8, 9])
      const sorted: number[] = []
      while (!heap.isEmpty()) sorted.push(heap.extract()!)
      expect(sorted).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1])
    })
  })

  // ─── ToArray ───

  describe('toArray', () => {
    it('returns empty array for empty heap', () => {
      const heap = createMaxHeap()
      expect(heap.toArray()).toEqual([])
    })

    it('returns a copy of the internal array', () => {
      const heap = createMaxHeap()
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
      const heap = createMaxHeap()
      expect(heap.contains(1)).toBe(false)
    })

    it('returns true for existing element', () => {
      const heap = createMaxHeap()
      heap.insert(5)
      heap.insert(10)
      expect(heap.contains(5)).toBe(true)
      expect(heap.contains(10)).toBe(true)
    })

    it('returns false for non-existing element', () => {
      const heap = createMaxHeap()
      heap.insert(5)
      expect(heap.contains(99)).toBe(false)
    })
  })

  // ─── Merge ───

  describe('merge', () => {
    it('merges two heaps', () => {
      const h1 = createMaxHeap()
      h1.insert(3)
      h1.insert(1)
      const h2 = createMaxHeap()
      h2.insert(4)
      h2.insert(2)
      const merged = h1.merge(h2)
      expect(merged.size()).toBe(4)
      expect(merged.peek()).toBe(4)
    })

    it('merges with an empty heap', () => {
      const h1 = createMaxHeap()
      h1.insert(5)
      h1.insert(3)
      const h2 = createMaxHeap()
      const merged = h1.merge(h2)
      expect(merged.size()).toBe(2)
      expect(merged.peek()).toBe(5)
    })

    it('does not modify original heaps', () => {
      const h1 = createMaxHeap()
      h1.insert(1)
      const h2 = createMaxHeap()
      h2.insert(2)
      const merged = h1.merge(h2)
      expect(h1.size()).toBe(1)
      expect(h2.size()).toBe(1)
      expect(merged.size()).toBe(2)
    })
  })

  // ─── Update ───

  describe('update', () => {
    it('updates a value and maintains heap property', () => {
      const heap = createMaxHeap()
      heap.insert(10)
      heap.insert(20)
      heap.insert(30)
      heap.update(0, 50)
      expect(heap.peek()).toBe(50)
    })

    it('does nothing for out-of-bounds index', () => {
      const heap = createMaxHeap()
      heap.insert(1)
      heap.insert(2)
      heap.update(-1, 100)
      heap.update(5, 100)
      expect(heap.size()).toBe(2)
    })

    it('handles decrease in value correctly', () => {
      const heap = createMaxHeap()
      heap.insert(30)
      heap.insert(20)
      heap.insert(10)
      heap.update(0, 5)
      expect(heap.peek()).toBe(20)
    })
  })

  // ─── Clear ───

  describe('clear', () => {
    it('clears all elements', () => {
      const heap = createMaxHeap()
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
      const heap = createMaxHeap()
      const tc = heap.getTimeComplexity()
      expect(typeof tc).toBe('string')
      expect(tc.length).toBeGreaterThan(0)
    })

    it('includes d value in complexity string', () => {
      const heap = createTernaryHeap()
      const tc = heap.getTimeComplexity()
      expect(tc).toContain('3')
    })
  })
})
