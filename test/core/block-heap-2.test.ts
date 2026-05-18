import { describe, it, expect } from 'vitest'
import { BlockHeap2 } from '../../src/core/block-heap-2/index.js'

// ─── Constructor ───

describe('BlockHeap2', () => {
  describe('constructor', () => {
    it('creates an empty heap with default block size', () => {
      const heap = new BlockHeap2()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('creates a heap with custom block size', () => {
      const heap = new BlockHeap2(8)
      expect(heap.size).toBe(0)
    })

    it('throws on block size less than 1', () => {
      expect(() => new BlockHeap2(0)).toThrow('Block size must be at least 1')
      expect(() => new BlockHeap2(-1)).toThrow('Block size must be at least 1')
    })
  })

  // ─── Push ───

  describe('push', () => {
    it('pushes a single element', () => {
      const heap = new BlockHeap2()
      heap.push(10)
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(10)
    })

    it('pushes multiple elements maintaining min-heap property', () => {
      const heap = new BlockHeap2()
      heap.push(5)
      heap.push(3)
      heap.push(7)
      heap.push(1)
      heap.push(4)
      expect(heap.peek()).toBe(1)
      expect(heap.size).toBe(5)
    })

    it('handles negative numbers', () => {
      const heap = new BlockHeap2()
      heap.push(-5)
      heap.push(3)
      heap.push(-10)
      expect(heap.peek()).toBe(-10)
    })

    it('handles duplicates', () => {
      const heap = new BlockHeap2()
      heap.push(3)
      heap.push(3)
      heap.push(1)
      expect(heap.peek()).toBe(1)
      expect(heap.size).toBe(3)
    })

    it('works with block size of 1', () => {
      const heap = new BlockHeap2(1)
      heap.push(5)
      heap.push(3)
      heap.push(1)
      expect(heap.peek()).toBe(1)
    })
  })

  // ─── Pop ───

  describe('pop', () => {
    it('returns undefined for empty heap', () => {
      const heap = new BlockHeap2()
      expect(heap.pop()).toBeUndefined()
    })

    it('pops the minimum element', () => {
      const heap = new BlockHeap2()
      heap.push(5)
      heap.push(3)
      heap.push(7)
      expect(heap.pop()).toBe(3)
      expect(heap.size).toBe(2)
    })

    it('pops all elements in sorted order', () => {
      const heap = new BlockHeap2()
      heap.push(5)
      heap.push(3)
      heap.push(7)
      heap.push(1)
      heap.push(4)
      const sorted: number[] = []
      while (!heap.isEmpty()) {
        sorted.push(heap.pop()!)
      }
      expect(sorted).toEqual([1, 3, 4, 5, 7])
    })

    it('handles single element', () => {
      const heap = new BlockHeap2()
      heap.push(42)
      expect(heap.pop()).toBe(42)
      expect(heap.isEmpty()).toBe(true)
    })

    it('handles duplicates', () => {
      const heap = new BlockHeap2()
      heap.push(3)
      heap.push(1)
      heap.push(1)
      heap.push(3)
      const sorted: number[] = []
      while (!heap.isEmpty()) {
        sorted.push(heap.pop()!)
      }
      expect(sorted).toEqual([1, 1, 3, 3])
    })
  })

  // ─── Peek ───

  describe('peek', () => {
    it('returns undefined for empty heap', () => {
      const heap = new BlockHeap2()
      expect(heap.peek()).toBeUndefined()
    })

    it('returns the minimum element without removing it', () => {
      const heap = new BlockHeap2()
      heap.push(5)
      heap.push(3)
      expect(heap.peek()).toBe(3)
      expect(heap.size).toBe(2)
    })
  })

  // ─── Contains ───

  describe('contains', () => {
    it('returns false for empty heap', () => {
      const heap = new BlockHeap2()
      expect(heap.contains(1)).toBe(false)
    })

    it('returns true for existing value', () => {
      const heap = new BlockHeap2()
      heap.push(5)
      heap.push(3)
      heap.push(7)
      expect(heap.contains(5)).toBe(true)
      expect(heap.contains(3)).toBe(true)
      expect(heap.contains(7)).toBe(true)
    })

    it('returns false for non-existing value', () => {
      const heap = new BlockHeap2()
      heap.push(5)
      expect(heap.contains(99)).toBe(false)
    })
  })

  // ─── Remove ───

  describe('remove', () => {
    it('returns false for non-existing value', () => {
      const heap = new BlockHeap2()
      heap.push(5)
      expect(heap.remove(99)).toBe(false)
    })

    it('removes an element', () => {
      const heap = new BlockHeap2()
      heap.push(5)
      heap.push(3)
      heap.push(7)
      expect(heap.remove(5)).toBe(true)
      expect(heap.size).toBe(2)
      expect(heap.contains(5)).toBe(false)
    })

    it('removes the minimum element', () => {
      const heap = new BlockHeap2()
      heap.push(5)
      heap.push(3)
      heap.push(7)
      expect(heap.remove(3)).toBe(true)
      expect(heap.peek()).toBe(5)
    })

    it('removes the only element', () => {
      const heap = new BlockHeap2()
      heap.push(42)
      expect(heap.remove(42)).toBe(true)
      expect(heap.isEmpty()).toBe(true)
    })

    it('maintains heap property after removal', () => {
      const heap = new BlockHeap2()
      heap.push(1)
      heap.push(5)
      heap.push(3)
      heap.push(7)
      heap.push(2)
      heap.remove(3)
      const sorted: number[] = []
      while (!heap.isEmpty()) {
        sorted.push(heap.pop()!)
      }
      const expected = [1, 2, 5, 7]
      expect(sorted).toEqual(expected)
    })
  })

  // ─── Merge ───

  describe('merge', () => {
    it('merges two heaps', () => {
      const h1 = new BlockHeap2()
      h1.push(5)
      h1.push(3)
      const h2 = new BlockHeap2()
      h2.push(1)
      h2.push(7)
      h1.merge(h2)
      expect(h1.size).toBe(4)
      expect(h1.peek()).toBe(1)
    })

    it('merge with empty heap', () => {
      const h1 = new BlockHeap2()
      h1.push(3)
      const h2 = new BlockHeap2()
      h1.merge(h2)
      expect(h1.size).toBe(1)
      expect(h1.peek()).toBe(3)
    })

    it('merge into empty heap', () => {
      const h1 = new BlockHeap2()
      const h2 = new BlockHeap2()
      h2.push(5)
      h2.push(3)
      h1.merge(h2)
      expect(h1.size).toBe(2)
      expect(h1.peek()).toBe(3)
    })
  })

  // ─── ToArray ───

  describe('toArray', () => {
    it('returns empty array for empty heap', () => {
      const heap = new BlockHeap2()
      expect(heap.toArray()).toEqual([])
    })

    it('returns elements in heap order', () => {
      const heap = new BlockHeap2()
      heap.push(5)
      heap.push(3)
      heap.push(7)
      const arr = heap.toArray()
      expect(arr.length).toBe(3)
      expect(arr).toContain(3)
      expect(arr).toContain(5)
      expect(arr).toContain(7)
    })
  })

  // ─── Clear ───

  describe('clear', () => {
    it('clears the heap', () => {
      const heap = new BlockHeap2()
      heap.push(5)
      heap.push(3)
      heap.push(7)
      heap.clear()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
      expect(heap.peek()).toBeUndefined()
    })
  })

  // ─── IsEmpty ───

  describe('isEmpty', () => {
    it('returns true for empty heap', () => {
      const heap = new BlockHeap2()
      expect(heap.isEmpty()).toBe(true)
    })

    it('returns false after push', () => {
      const heap = new BlockHeap2()
      heap.push(1)
      expect(heap.isEmpty()).toBe(false)
    })

    it('returns true after popping all elements', () => {
      const heap = new BlockHeap2()
      heap.push(1)
      heap.pop()
      expect(heap.isEmpty()).toBe(true)
    })
  })
})
