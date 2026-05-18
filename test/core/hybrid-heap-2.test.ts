import { describe, it, expect, beforeEach } from 'vitest'
import { HybridHeap2 } from '../../src/core/hybrid-heap-2/index.js'

describe('HybridHeap2', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('should create an empty heap with default comparator', () => {
      const heap = new HybridHeap2<number>()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should create a heap with custom comparator (max-heap)', () => {
      const heap = new HybridHeap2<number>((a, b) => b - a)
      heap.insert(3)
      heap.insert(1)
      heap.insert(5)
      expect(heap.peek()).toBe(5)
    })
  })

  // ─── insert ───
  describe('insert', () => {
    it('should insert a single element', () => {
      const heap = new HybridHeap2<number>()
      heap.insert(5)
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(5)
    })

    it('should maintain min-heap property for multiple inserts', () => {
      const heap = new HybridHeap2<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.insert(1)
      expect(heap.peek()).toBe(1)
    })

    it('should handle duplicate values', () => {
      const heap = new HybridHeap2<number>()
      heap.insert(5)
      heap.insert(5)
      heap.insert(5)
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(5)
    })

    it('should handle negative values', () => {
      const heap = new HybridHeap2<number>()
      heap.insert(-5)
      heap.insert(-1)
      heap.insert(-3)
      expect(heap.peek()).toBe(-5)
    })

    it('should handle mixed positive and negative values', () => {
      const heap = new HybridHeap2<number>()
      heap.insert(3)
      heap.insert(-1)
      heap.insert(0)
      heap.insert(-5)
      heap.insert(2)
      expect(heap.peek()).toBe(-5)
    })

    it('should handle many elements (triggering 4-ary mode)', () => {
      const heap = new HybridHeap2<number>()
      for (let i = 100; i >= 0; i--) {
        heap.insert(i)
      }
      expect(heap.size).toBe(101)
      expect(heap.peek()).toBe(0)
    })
  })

  // ─── extractMin ───
  describe('extractMin', () => {
    it('should return undefined for empty heap', () => {
      const heap = new HybridHeap2<number>()
      expect(heap.extractMin()).toBeUndefined()
    })

    it('should extract the single element', () => {
      const heap = new HybridHeap2<number>()
      heap.insert(42)
      expect(heap.extractMin()).toBe(42)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should extract elements in sorted order', () => {
      const heap = new HybridHeap2<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.insert(1)
      heap.insert(4)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(3)
      expect(heap.extractMin()).toBe(4)
      expect(heap.extractMin()).toBe(5)
      expect(heap.extractMin()).toBe(7)
      expect(heap.extractMin()).toBeUndefined()
    })

    it('should handle duplicates', () => {
      const heap = new HybridHeap2<number>()
      heap.insert(2)
      heap.insert(2)
      heap.insert(1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(2)
      expect(heap.extractMin()).toBe(2)
    })

    it('should handle negatives', () => {
      const heap = new HybridHeap2<number>()
      heap.insert(-3)
      heap.insert(1)
      heap.insert(-5)
      expect(heap.extractMin()).toBe(-5)
      expect(heap.extractMin()).toBe(-3)
      expect(heap.extractMin()).toBe(1)
    })

    it('should maintain heap property after many extractions', () => {
      const heap = new HybridHeap2<number>()
      const values = [9, 3, 7, 1, 8, 2, 6, 5, 4]
      for (const v of values) heap.insert(v)
      const extracted: number[] = []
      while (!heap.isEmpty()) {
        extracted.push(heap.extractMin()!)
      }
      expect(extracted).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })
  })

  // ─── peek ───
  describe('peek', () => {
    it('should return undefined for empty heap', () => {
      const heap = new HybridHeap2<number>()
      expect(heap.peek()).toBeUndefined()
    })

    it('should return the minimum element without removing it', () => {
      const heap = new HybridHeap2<number>()
      heap.insert(5)
      heap.insert(3)
      expect(heap.peek()).toBe(3)
      expect(heap.size).toBe(2)
    })
  })

  // ─── size ───
  describe('size', () => {
    it('should track size correctly', () => {
      const heap = new HybridHeap2<number>()
      expect(heap.size).toBe(0)
      heap.insert(1)
      expect(heap.size).toBe(1)
      heap.insert(2)
      expect(heap.size).toBe(2)
      heap.extractMin()
      expect(heap.size).toBe(1)
    })
  })

  // ─── isEmpty ───
  describe('isEmpty', () => {
    it('should return true for new heap', () => {
      const heap = new HybridHeap2<number>()
      expect(heap.isEmpty()).toBe(true)
    })

    it('should return false after insert', () => {
      const heap = new HybridHeap2<number>()
      heap.insert(1)
      expect(heap.isEmpty()).toBe(false)
    })

    it('should return true after all elements extracted', () => {
      const heap = new HybridHeap2<number>()
      heap.insert(1)
      heap.extractMin()
      expect(heap.isEmpty()).toBe(true)
    })
  })

  // ─── clear ───
  describe('clear', () => {
    it('should remove all elements', () => {
      const heap = new HybridHeap2<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.clear()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
      expect(heap.peek()).toBeUndefined()
    })
  })

  // ─── toArray ───
  describe('toArray', () => {
    it('should return empty array for empty heap', () => {
      const heap = new HybridHeap2<number>()
      expect(heap.toArray()).toEqual([])
    })

    it('should return elements in sorted order', () => {
      const heap = new HybridHeap2<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.insert(1)
      expect(heap.toArray()).toEqual([1, 3, 5, 7])
    })

    it('should not modify the heap', () => {
      const heap = new HybridHeap2<number>()
      heap.insert(3)
      heap.insert(1)
      heap.toArray()
      expect(heap.size).toBe(2)
      expect(heap.peek()).toBe(1)
    })
  })

  // ─── fromArray ───
  describe('fromArray', () => {
    it('should create a heap from an array', () => {
      const heap = HybridHeap2.fromArray([5, 3, 7, 1])
      expect(heap.size).toBe(4)
      expect(heap.peek()).toBe(1)
    })

    it('should create a heap from an empty array', () => {
      const heap = HybridHeap2.fromArray<number>([])
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should accept a custom comparator', () => {
      const heap = HybridHeap2.fromArray([1, 3, 2], (a, b) => b - a)
      expect(heap.peek()).toBe(3)
    })

    it('should produce sorted output via toArray', () => {
      const heap = HybridHeap2.fromArray([9, 3, 7, 1, 8])
      expect(heap.toArray()).toEqual([1, 3, 7, 8, 9])
    })
  })

  // ─── Larger dataset (binary path, < 64) ───
  describe('larger dataset', () => {
    it('should correctly handle 50 elements via extractMin', () => {
      const heap = new HybridHeap2<number>()
      for (let i = 50; i >= 0; i--) {
        heap.insert(i)
      }
      expect(heap.peek()).toBe(0)
      for (let i = 0; i <= 50; i++) {
        expect(heap.extractMin()).toBe(i)
      }
      expect(heap.isEmpty()).toBe(true)
    })
  })
})
