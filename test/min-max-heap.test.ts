import { describe, it, expect } from 'vitest'
import { MinMaxHeap } from '../src/utils/min-max-heap.js'

describe('MinMaxHeap', () => {
  describe('constructor', () => {
    it('creates empty heap with default comparator', () => {
      const heap = new MinMaxHeap<number>()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('creates heap with custom comparator', () => {
      const heap = new MinMaxHeap<{ val: number }>({
        comparator: (a, b) => a.val - b.val,
      })
      heap.insert({ val: 5 })
      heap.insert({ val: 3 })
      expect(heap.peekMin()?.val).toBe(3)
      expect(heap.peekMax()?.val).toBe(5)
    })
  })

  describe('insert and basic queries', () => {
    it('inserts single element', () => {
      const heap = new MinMaxHeap<number>()
      heap.insert(42)
      expect(heap.size).toBe(1)
      expect(heap.peekMin()).toBe(42)
      expect(heap.peekMax()).toBe(42)
    })

    it('inserts multiple elements', () => {
      const heap = new MinMaxHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.insert(1)
      heap.insert(9)
      expect(heap.size).toBe(5)
      expect(heap.peekMin()).toBe(1)
      expect(heap.peekMax()).toBe(9)
    })

    it('handles duplicate values', () => {
      const heap = new MinMaxHeap<number>()
      heap.insert(5)
      heap.insert(5)
      heap.insert(5)
      expect(heap.peekMin()).toBe(5)
      expect(heap.peekMax()).toBe(5)
      expect(heap.size).toBe(3)
    })
  })

  describe('peekMin / peekMax', () => {
    it('returns undefined for empty heap', () => {
      const heap = new MinMaxHeap<number>()
      expect(heap.peekMin()).toBeUndefined()
      expect(heap.peekMax()).toBeUndefined()
    })

    it('peekMin returns smallest', () => {
      const heap = new MinMaxHeap<number>()
      for (const v of [10, 2, 8, 4, 6]) heap.insert(v)
      expect(heap.peekMin()).toBe(2)
    })

    it('peekMax returns largest', () => {
      const heap = new MinMaxHeap<number>()
      for (const v of [10, 2, 8, 4, 6]) heap.insert(v)
      expect(heap.peekMax()).toBe(10)
    })

    it('peek does not remove element', () => {
      const heap = new MinMaxHeap<number>()
      heap.insert(1)
      heap.peekMin()
      heap.peekMax()
      expect(heap.size).toBe(1)
    })
  })

  describe('extractMin', () => {
    it('returns undefined for empty heap', () => {
      expect(new MinMaxHeap<number>().extractMin()).toBeUndefined()
    })

    it('extracts single element', () => {
      const heap = new MinMaxHeap<number>()
      heap.insert(42)
      expect(heap.extractMin()).toBe(42)
      expect(heap.isEmpty()).toBe(true)
    })

    it('extracts in ascending order', () => {
      const heap = new MinMaxHeap<number>()
      const values = [5, 3, 7, 1, 9, 2, 8, 4, 6]
      for (const v of values) heap.insert(v)

      const extracted: number[] = []
      while (!heap.isEmpty()) {
        extracted.push(heap.extractMin()!)
      }
      expect(extracted).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('handles duplicates in extraction', () => {
      const heap = new MinMaxHeap<number>()
      for (const v of [3, 1, 3, 1, 2]) heap.insert(v)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(2)
    })
  })

  describe('extractMax', () => {
    it('returns undefined for empty heap', () => {
      expect(new MinMaxHeap<number>().extractMax()).toBeUndefined()
    })

    it('extracts single element', () => {
      const heap = new MinMaxHeap<number>()
      heap.insert(42)
      expect(heap.extractMax()).toBe(42)
      expect(heap.isEmpty()).toBe(true)
    })

    it('extracts in descending order', () => {
      const heap = new MinMaxHeap<number>()
      const values = [5, 3, 7, 1, 9, 2, 8, 4, 6]
      for (const v of values) heap.insert(v)

      const extracted: number[] = []
      while (!heap.isEmpty()) {
        extracted.push(heap.extractMax()!)
      }
      expect(extracted).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1])
    })
  })

  describe('replaceMin / replaceMax', () => {
    it('replaceMin returns old min and inserts new value', () => {
      const heap = new MinMaxHeap<number>()
      for (const v of [5, 3, 7]) heap.insert(v)
      const old = heap.replaceMin(10)
      expect(old).toBe(3)
      expect(heap.peekMin()).toBe(5)
    })

    it('replaceMax returns old max and inserts new value', () => {
      const heap = new MinMaxHeap<number>()
      for (const v of [5, 3, 7]) heap.insert(v)
      const old = heap.replaceMax(0)
      expect(old).toBe(7)
      expect(heap.peekMax()).toBe(5)
    })

    it('replaceMin returns undefined on empty heap', () => {
      expect(new MinMaxHeap<number>().replaceMin(5)).toBeUndefined()
    })

    it('replaceMax returns undefined on empty heap', () => {
      expect(new MinMaxHeap<number>().replaceMax(5)).toBeUndefined()
    })
  })

  describe('clear', () => {
    it('removes all elements', () => {
      const heap = new MinMaxHeap<number>()
      for (const v of [1, 2, 3]) heap.insert(v)
      heap.clear()
      expect(heap.isEmpty()).toBe(true)
      expect(heap.size).toBe(0)
    })
  })

  describe('toArray', () => {
    it('returns copy of internal array', () => {
      const heap = new MinMaxHeap<number>()
      heap.insert(1)
      heap.insert(2)
      const arr = heap.toArray()
      expect(arr).toHaveLength(2)
      expect(arr).not.toBe(heap.toArray())
    })
  })

  describe('mixed min/max extraction', () => {
    it('alternating extractMin and extractMax', () => {
      const heap = new MinMaxHeap<number>()
      for (const v of [5, 3, 7, 1, 9]) heap.insert(v)

      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMax()).toBe(9)
      expect(heap.extractMin()).toBe(3)
      expect(heap.extractMax()).toBe(7)
      expect(heap.extractMin()).toBe(5)
      expect(heap.isEmpty()).toBe(true)
    })
  })

  describe('negative numbers', () => {
    it('handles negative numbers correctly', () => {
      const heap = new MinMaxHeap<number>()
      for (const v of [-5, 3, -1, 0, 7]) heap.insert(v)
      expect(heap.peekMin()).toBe(-5)
      expect(heap.peekMax()).toBe(7)
    })
  })

  describe('large dataset', () => {
    it('sorts 100 random-ish elements correctly', () => {
      const heap = new MinMaxHeap<number>()
      const values = Array.from({ length: 100 }, (_, i) => (i * 37) % 100)
      for (const v of values) heap.insert(v)

      const sorted = []
      while (!heap.isEmpty()) sorted.push(heap.extractMin()!)
      expect(sorted).toEqual([...values].sort((a, b) => a - b))
    })
  })

  describe('size tracking', () => {
    it('tracks size through inserts and extractions', () => {
      const heap = new MinMaxHeap<number>()
      heap.insert(1)
      heap.insert(2)
      expect(heap.size).toBe(2)
      heap.extractMin()
      expect(heap.size).toBe(1)
      heap.extractMax()
      expect(heap.size).toBe(0)
    })
  })
})
