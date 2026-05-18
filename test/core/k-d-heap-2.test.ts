import { describe, it, expect, beforeEach } from 'vitest'
import { KDHeap2 } from '../../src/core/k-d-heap-2/index.js'

describe('KDHeap2', () => {
  let heap: KDHeap2<number>

  beforeEach(() => {
    heap = new KDHeap2()
  })

  // ─── Constructor ───

  describe('constructor', () => {
    it('should create with default d=4', () => {
      const h = new KDHeap2<number>()
      expect(h.size()).toBe(0)
      expect(h.isEmpty()).toBe(true)
    })

    it('should accept custom d value', () => {
      const h = new KDHeap2<number>(3)
      h.heapify([5, 3, 1, 4, 2])
      expect(h.extract()).toBe(1)
    })

    it('should throw for d < 2', () => {
      expect(() => new KDHeap2<number>(1)).toThrow('d must be at least 2')
    })

    it('should accept custom comparator for max heap', () => {
      const h = new KDHeap2<number>(4, (a, b) => b - a)
      h.heapify([1, 3, 5, 2, 4])
      expect(h.extract()).toBe(5)
    })
  })

  // ─── insert/extract ───

  describe('insert and extract', () => {
    it('should insert and extract single element', () => {
      heap.insert(42)
      expect(heap.extract()).toBe(42)
    })

    it('should extract in sorted order', () => {
      heap.insert(5)
      heap.insert(3)
      heap.insert(1)
      heap.insert(4)
      heap.insert(2)
      expect(heap.extract()).toBe(1)
      expect(heap.extract()).toBe(2)
      expect(heap.extract()).toBe(3)
      expect(heap.extract()).toBe(4)
      expect(heap.extract()).toBe(5)
    })

    it('should handle duplicates', () => {
      heap.insert(3)
      heap.insert(1)
      heap.insert(3)
      expect(heap.extract()).toBe(1)
      expect(heap.extract()).toBe(3)
      expect(heap.extract()).toBe(3)
    })

    it('should return undefined for empty heap extract', () => {
      expect(heap.extract()).toBeUndefined()
    })

    it('should handle negative numbers', () => {
      heap.insert(-5)
      heap.insert(-1)
      heap.insert(-3)
      expect(heap.extract()).toBe(-5)
      expect(heap.extract()).toBe(-3)
      expect(heap.extract()).toBe(-1)
    })
  })

  // ─── peek ───

  describe('peek', () => {
    it('should return minimum without removing', () => {
      heap.insert(5)
      heap.insert(1)
      heap.insert(3)
      expect(heap.peek()).toBe(1)
      expect(heap.size()).toBe(3)
    })

    it('should return undefined for empty heap', () => {
      expect(heap.peek()).toBeUndefined()
    })
  })

  // ─── size/isEmpty ───

  describe('size and isEmpty', () => {
    it('should track size', () => {
      expect(heap.size()).toBe(0)
      heap.insert(1)
      expect(heap.size()).toBe(1)
      heap.insert(2)
      expect(heap.size()).toBe(2)
      heap.extract()
      expect(heap.size()).toBe(1)
    })

    it('should track isEmpty', () => {
      expect(heap.isEmpty()).toBe(true)
      heap.insert(1)
      expect(heap.isEmpty()).toBe(false)
      heap.extract()
      expect(heap.isEmpty()).toBe(true)
    })
  })

  // ─── clear ───

  describe('clear', () => {
    it('should clear all elements', () => {
      heap.insert(1)
      heap.insert(2)
      heap.clear()
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
      expect(heap.peek()).toBeUndefined()
    })
  })

  // ─── toArray ───

  describe('toArray', () => {
    it('should return a copy of the heap array', () => {
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      const arr = heap.toArray()
      expect(arr).toHaveLength(3)
      expect(heap.size()).toBe(3)
    })

    it('should return empty array for empty heap', () => {
      expect(heap.toArray()).toEqual([])
    })
  })

  // ─── heapify ───

  describe('heapify', () => {
    it('should build a valid heap from array', () => {
      heap.heapify([5, 3, 1, 4, 2])
      expect(heap.size()).toBe(5)
      expect(heap.extract()).toBe(1)
      expect(heap.extract()).toBe(2)
      expect(heap.extract()).toBe(3)
      expect(heap.extract()).toBe(4)
      expect(heap.extract()).toBe(5)
    })

    it('should handle empty array', () => {
      heap.heapify([])
      expect(heap.size()).toBe(0)
    })

    it('should handle single element', () => {
      heap.heapify([42])
      expect(heap.peek()).toBe(42)
    })

    it('should handle already sorted array', () => {
      heap.heapify([1, 2, 3, 4, 5])
      expect(heap.extract()).toBe(1)
      expect(heap.extract()).toBe(2)
    })

    it('should handle reverse sorted array', () => {
      heap.heapify([5, 4, 3, 2, 1])
      expect(heap.extract()).toBe(1)
      expect(heap.extract()).toBe(2)
    })
  })

  // ─── Edge cases with different d values ───

  describe('different d values', () => {
    it('should work with d=2 (binary heap)', () => {
      const h = new KDHeap2<number>(2)
      h.heapify([5, 3, 1, 4, 2])
      expect(h.extract()).toBe(1)
      expect(h.extract()).toBe(2)
      expect(h.extract()).toBe(3)
    })

    it('should work with d=3', () => {
      const h = new KDHeap2<number>(3)
      h.heapify([5, 3, 1, 4, 2])
      expect(h.extract()).toBe(1)
      expect(h.extract()).toBe(2)
      expect(h.extract()).toBe(3)
    })

    it('should work with d=8', () => {
      const h = new KDHeap2<number>(8)
      h.heapify([9, 7, 5, 3, 1, 2, 4, 6, 8])
      expect(h.extract()).toBe(1)
      expect(h.extract()).toBe(2)
      expect(h.extract()).toBe(3)
    })
  })
})
