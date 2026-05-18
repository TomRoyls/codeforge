import { describe, it, expect } from 'vitest'
import { BinomialHeap4, BinomialNode } from '../../src/core/binomial-heap-4/index.js'

// ─── Constructor ───

describe('BinomialHeap4', () => {
  describe('constructor', () => {
    it('creates an empty heap with default comparator', () => {
      const heap = new BinomialHeap4<number>()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty).toBe(true)
    })

    it('creates a heap with custom comparator', () => {
      const heap = new BinomialHeap4<number>({ comparator: (a, b) => b - a })
      heap.insert(1)
      heap.insert(5)
      expect(heap.findMin()).toBe(5)
    })
  })

  // ─── Insert ───

  describe('insert', () => {
    it('inserts a single element', () => {
      const heap = new BinomialHeap4<number>()
      const node = heap.insert(10)
      expect(heap.size).toBe(1)
      expect(heap.isEmpty).toBe(false)
      expect(node.value).toBe(10)
    })

    it('inserts multiple elements', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      expect(heap.size).toBe(3)
      expect(heap.findMin()).toBe(3)
    })

    it('returns node with correct structure', () => {
      const heap = new BinomialHeap4<number>()
      const node = heap.insert(42)
      expect(node.value).toBe(42)
      expect(node.degree).toBe(0)
      expect(node.parent).toBeNull()
      expect(node.child).toBeNull()
      expect(node.sibling).toBeNull()
    })
  })

  // ─── FindMin ───

  describe('findMin', () => {
    it('returns null for empty heap', () => {
      const heap = new BinomialHeap4<number>()
      expect(heap.findMin()).toBeNull()
    })

    it('returns the minimum element', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(10)
      heap.insert(3)
      heap.insert(7)
      expect(heap.findMin()).toBe(3)
    })

    it('handles negative numbers', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(-5)
      heap.insert(3)
      heap.insert(-10)
      expect(heap.findMin()).toBe(-10)
    })
  })

  // ─── ExtractMin ───

  describe('extractMin', () => {
    it('returns null for empty heap', () => {
      const heap = new BinomialHeap4<number>()
      expect(heap.extractMin()).toBeNull()
    })

    it('extracts the minimum element', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      expect(heap.extractMin()).toBe(3)
      expect(heap.size).toBe(2)
    })

    it('extracts all elements in sorted order', () => {
      const heap = new BinomialHeap4<number>()
      heap.bulkInsert([5, 3, 7, 1, 9, 2, 8, 4, 6])
      const sorted: number[] = []
      while (!heap.isEmpty) {
        sorted.push(heap.extractMin()!)
      }
      expect(sorted).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('handles single element', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(42)
      expect(heap.extractMin()).toBe(42)
      expect(heap.size).toBe(0)
      expect(heap.isEmpty).toBe(true)
    })

    it('handles duplicates', () => {
      const heap = new BinomialHeap4<number>()
      heap.bulkInsert([3, 1, 2, 1, 3])
      const sorted: number[] = []
      while (!heap.isEmpty) {
        sorted.push(heap.extractMin()!)
      }
      expect(sorted).toEqual([1, 1, 2, 3, 3])
    })
  })

  // ─── Find ───

  describe('find', () => {
    it('returns null for value not in heap', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(1)
      expect(heap.find(99)).toBeNull()
    })

    it('returns node for value in heap', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(10)
      const found = heap.find(10)
      expect(found).not.toBeNull()
      expect(found!.value).toBe(10)
    })

    it('returns null in empty heap', () => {
      const heap = new BinomialHeap4<number>()
      expect(heap.find(1)).toBeNull()
    })
  })

  // ─── Delete ───

  describe('delete', () => {
    it('deletes a node from the heap', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(5)
      const node = heap.insert(3)
      heap.insert(7)
      heap.delete(node)
      expect(heap.size).toBe(2)
      expect(heap.findMin()).toBe(5)
    })

    it('deletes the only element', () => {
      const heap = new BinomialHeap4<number>()
      const node = heap.insert(42)
      heap.delete(node)
      expect(heap.size).toBe(0)
      expect(heap.isEmpty).toBe(true)
    })
  })

  // ─── DecreaseKey ───

  describe('decreaseKey', () => {
    it('decreases the key of a node', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(1)
      const node = heap.insert(10)
      heap.insert(5)
      heap.decreaseKey(node, 2)
      expect(heap.findMin()).toBe(1)
    })

    it('does nothing if new value is greater', () => {
      const heap = new BinomialHeap4<number>()
      const node = heap.insert(5)
      heap.decreaseKey(node, 10)
      expect(node.value).toBe(5)
    })
  })

  // ─── Update ───

  describe('update', () => {
    it('updates a value in the heap', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(5)
      heap.insert(10)
      expect(heap.update(10, 1)).toBe(true)
      expect(heap.findMin()).toBe(1)
    })

    it('returns false for value not in heap', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(5)
      expect(heap.update(99, 1)).toBe(false)
    })
  })

  // ─── BulkInsert ───

  describe('bulkInsert', () => {
    it('inserts multiple values', () => {
      const heap = new BinomialHeap4<number>()
      heap.bulkInsert([5, 3, 7, 1, 9])
      expect(heap.size).toBe(5)
      expect(heap.findMin()).toBe(1)
    })

    it('handles empty array', () => {
      const heap = new BinomialHeap4<number>()
      heap.bulkInsert([])
      expect(heap.size).toBe(0)
    })
  })

  // ─── Merge ───

  describe('merge', () => {
    it('merges two heaps', () => {
      const heap1 = new BinomialHeap4<number>()
      heap1.bulkInsert([5, 3, 7])
      const heap2 = new BinomialHeap4<number>()
      heap2.bulkInsert([1, 9, 2])
      const merged = heap1.merge(heap2)
      expect(merged.size).toBe(6)
      expect(merged.findMin()).toBe(1)
    })

    it('merge does not affect original heaps', () => {
      const heap1 = new BinomialHeap4<number>()
      heap1.insert(5)
      const heap2 = new BinomialHeap4<number>()
      heap2.insert(1)
      const merged = heap1.merge(heap2)
      expect(heap1.size).toBe(1)
      expect(heap2.size).toBe(1)
      expect(merged.size).toBe(2)
    })

    it('merges with empty heap', () => {
      const heap1 = new BinomialHeap4<number>()
      heap1.bulkInsert([3, 1, 2])
      const heap2 = new BinomialHeap4<number>()
      const merged = heap1.merge(heap2)
      expect(merged.size).toBe(3)
      expect(merged.findMin()).toBe(1)
    })
  })

  // ─── ToArray ───

  describe('toArray', () => {
    it('returns empty array for empty heap', () => {
      const heap = new BinomialHeap4<number>()
      expect(heap.toArray()).toEqual([])
    })

    it('returns all values', () => {
      const heap = new BinomialHeap4<number>()
      heap.bulkInsert([3, 1, 2])
      const arr = heap.toArray()
      expect(arr.length).toBe(3)
      expect(arr.sort((a, b) => a - b)).toEqual([1, 2, 3])
    })
  })

  // ─── ForEach ───

  describe('forEach', () => {
    it('iterates over all values', () => {
      const heap = new BinomialHeap4<number>()
      heap.bulkInsert([3, 1, 2])
      const values: number[] = []
      heap.forEach((value) => values.push(value))
      expect(values.sort((a, b) => a - b)).toEqual([1, 2, 3])
    })

    it('does nothing for empty heap', () => {
      const heap = new BinomialHeap4<number>()
      const values: number[] = []
      heap.forEach((value) => values.push(value))
      expect(values).toEqual([])
    })
  })

  // ─── Clear ───

  describe('clear', () => {
    it('clears the heap', () => {
      const heap = new BinomialHeap4<number>()
      heap.bulkInsert([3, 1, 2])
      heap.clear()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty).toBe(true)
      expect(heap.findMin()).toBeNull()
    })
  })

  // ─── GetTimeComplexity ───

  describe('getTimeComplexity', () => {
    it('returns complexity string', () => {
      const heap = new BinomialHeap4<number>()
      const complexity = heap.getTimeComplexity()
      expect(complexity).toContain('insert')
      expect(complexity).toContain('extractMin')
      expect(complexity).toContain('merge')
    })
  })
})
