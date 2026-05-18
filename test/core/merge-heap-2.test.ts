import { describe, it, expect } from 'vitest'
import { MergeHeap2 } from '../../src/core/merge-heap-2/index.js'

describe('MergeHeap2', () => {
  describe('constructor', () => {
    it('creates empty heap with default comparator', () => {
      const heap = new MergeHeap2<number>()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('creates heap with custom comparator (max-heap)', () => {
      const heap = new MergeHeap2<number>((a, b) => b - a)
      heap.insert(1)
      heap.insert(3)
      heap.insert(2)
      expect(heap.peek()).toBe(3)
    })

    it('creates heap with custom comparator for strings', () => {
      const heap = new MergeHeap2<string>((a, b) => a.localeCompare(b))
      heap.insert('banana')
      heap.insert('apple')
      expect(heap.peek()).toBe('apple')
    })
  })

  // ─── insert and extractMin ───

  describe('insert and extractMin', () => {
    it('inserts and extracts a single element', () => {
      const heap = new MergeHeap2<number>()
      heap.insert(5)
      expect(heap.extractMin()).toBe(5)
    })

    it('extracts elements in ascending order', () => {
      const heap = new MergeHeap2<number>()
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(2)
      expect(heap.extractMin()).toBe(3)
    })

    it('handles duplicates', () => {
      const heap = new MergeHeap2<number>()
      heap.insert(1)
      heap.insert(1)
      heap.insert(1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(1)
    })

    it('returns undefined on extractMin from empty heap', () => {
      const heap = new MergeHeap2<number>()
      expect(heap.extractMin()).toBeUndefined()
    })

    it('handles negative values', () => {
      const heap = new MergeHeap2<number>()
      heap.insert(-5)
      heap.insert(3)
      heap.insert(-1)
      expect(heap.extractMin()).toBe(-5)
      expect(heap.extractMin()).toBe(-1)
      expect(heap.extractMin()).toBe(3)
    })

    it('maintains heap property after many insertions', () => {
      const heap = new MergeHeap2<number>()
      for (let i = 10; i >= 1; i--) {
        heap.insert(i)
      }
      for (let i = 1; i <= 10; i++) {
        expect(heap.extractMin()).toBe(i)
      }
    })
  })

  // ─── peek ───

  describe('peek', () => {
    it('returns minimum without removing it', () => {
      const heap = new MergeHeap2<number>()
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      expect(heap.peek()).toBe(1)
      expect(heap.size).toBe(3)
    })

    it('returns undefined for empty heap', () => {
      const heap = new MergeHeap2<number>()
      expect(heap.peek()).toBeUndefined()
    })

    it('updates after extractMin', () => {
      const heap = new MergeHeap2<number>()
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      heap.extractMin()
      expect(heap.peek()).toBe(2)
    })
  })

  // ─── merge ───

  describe('merge', () => {
    it('merges two heaps and clears the other', () => {
      const h1 = new MergeHeap2<number>()
      const h2 = new MergeHeap2<number>()
      h1.insert(1)
      h1.insert(3)
      h2.insert(2)
      h2.insert(4)
      h1.merge(h2)
      expect(h1.size).toBe(4)
      expect(h2.size).toBe(0)
      expect(h2.isEmpty()).toBe(true)
    })

    it('merged heap returns elements in sorted order', () => {
      const h1 = new MergeHeap2<number>()
      const h2 = new MergeHeap2<number>()
      h1.insert(5)
      h1.insert(1)
      h2.insert(3)
      h2.insert(2)
      h1.merge(h2)
      expect(h1.extractMin()).toBe(1)
      expect(h1.extractMin()).toBe(2)
      expect(h1.extractMin()).toBe(3)
      expect(h1.extractMin()).toBe(5)
    })

    it('merging with empty heap does not change the first', () => {
      const h1 = new MergeHeap2<number>()
      const h2 = new MergeHeap2<number>()
      h1.insert(1)
      h1.insert(2)
      h1.merge(h2)
      expect(h1.size).toBe(2)
    })

    it('merging into empty heap takes all elements', () => {
      const h1 = new MergeHeap2<number>()
      const h2 = new MergeHeap2<number>()
      h2.insert(10)
      h2.insert(20)
      h1.merge(h2)
      expect(h1.size).toBe(2)
      expect(h1.extractMin()).toBe(10)
    })

    it('merge with custom comparator preserves ordering', () => {
      const h1 = new MergeHeap2<number>((a, b) => b - a)
      const h2 = new MergeHeap2<number>((a, b) => b - a)
      h1.insert(1)
      h2.insert(5)
      h1.merge(h2)
      expect(h1.peek()).toBe(5)
    })
  })

  // ─── size and isEmpty ───

  describe('size and isEmpty', () => {
    it('tracks size correctly', () => {
      const heap = new MergeHeap2<number>()
      expect(heap.size).toBe(0)
      heap.insert(1)
      expect(heap.size).toBe(1)
      heap.insert(2)
      expect(heap.size).toBe(2)
      heap.extractMin()
      expect(heap.size).toBe(1)
    })

    it('isEmpty returns true when empty', () => {
      const heap = new MergeHeap2<number>()
      expect(heap.isEmpty()).toBe(true)
    })

    it('isEmpty returns false when not empty', () => {
      const heap = new MergeHeap2<number>()
      heap.insert(1)
      expect(heap.isEmpty()).toBe(false)
    })
  })

  // ─── clear ───

  describe('clear', () => {
    it('removes all elements', () => {
      const heap = new MergeHeap2<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.clear()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
      expect(heap.peek()).toBeUndefined()
    })
  })

  // ─── edge cases ───

  describe('edge cases', () => {
    it('handles single element', () => {
      const heap = new MergeHeap2<number>()
      heap.insert(42)
      expect(heap.peek()).toBe(42)
      expect(heap.extractMin()).toBe(42)
      expect(heap.isEmpty()).toBe(true)
    })

    it('handles many elements in reverse order', () => {
      const heap = new MergeHeap2<number>()
      for (let i = 100; i >= 0; i--) {
        heap.insert(i)
      }
      for (let i = 0; i <= 100; i++) {
        expect(heap.extractMin()).toBe(i)
      }
    })

    it('handles interleaved insert and extract', () => {
      const heap = new MergeHeap2<number>()
      heap.insert(5)
      heap.insert(3)
      expect(heap.extractMin()).toBe(3)
      heap.insert(1)
      heap.insert(4)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(4)
      expect(heap.extractMin()).toBe(5)
    })
  })
})
