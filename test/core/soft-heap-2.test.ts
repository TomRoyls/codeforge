import { describe, it, expect } from 'vitest'
import { SoftHeap2 } from '../../src/core/soft-heap-2/index.js'

describe('SoftHeap2', () => {
  describe('constructor', () => {
    it('should create an empty heap with default comparator', () => {
      const heap = new SoftHeap2<number>()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should create a heap with a custom comparator', () => {
      const heap = new SoftHeap2<number>((a, b) => b - a)
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should work with string type using default comparator', () => {
      const heap = new SoftHeap2<string>()
      heap.insert('banana')
      heap.insert('apple')
      expect(heap.peek()).toBe('apple')
    })
  })

  // ─── Insert ───

  describe('insert', () => {
    it('should insert a single element', () => {
      const heap = new SoftHeap2<number>()
      heap.insert(5)
      expect(heap.size).toBe(1)
      expect(heap.isEmpty()).toBe(false)
      expect(heap.peek()).toBe(5)
    })

    it('should maintain min-heap property', () => {
      const heap = new SoftHeap2<number>()
      heap.insert(10)
      heap.insert(3)
      heap.insert(7)
      heap.insert(1)
      expect(heap.peek()).toBe(1)
    })

    it('should handle duplicate values', () => {
      const heap = new SoftHeap2<number>()
      heap.insert(5)
      heap.insert(5)
      heap.insert(5)
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(5)
    })

    it('should handle negative numbers', () => {
      const heap = new SoftHeap2<number>()
      heap.insert(-3)
      heap.insert(0)
      heap.insert(-7)
      heap.insert(2)
      expect(heap.peek()).toBe(-7)
    })
  })

  // ─── ExtractMin ───

  describe('extractMin', () => {
    it('should return undefined for empty heap', () => {
      const heap = new SoftHeap2<number>()
      expect(heap.extractMin()).toBeUndefined()
    })

    it('should extract the only element', () => {
      const heap = new SoftHeap2<number>()
      heap.insert(42)
      expect(heap.extractMin()).toBe(42)
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should extract elements in sorted order', () => {
      const heap = new SoftHeap2<number>()
      const values = [5, 3, 8, 1, 9, 2, 7]
      values.forEach(v => heap.insert(v))
      const extracted: number[] = []
      while (!heap.isEmpty()) {
        extracted.push(heap.extractMin()!)
      }
      expect(extracted).toEqual([1, 2, 3, 5, 7, 8, 9])
    })

    it('should handle negative numbers in extraction', () => {
      const heap = new SoftHeap2<number>()
      heap.insert(-1)
      heap.insert(-5)
      heap.insert(3)
      expect(heap.extractMin()).toBe(-5)
      expect(heap.extractMin()).toBe(-1)
      expect(heap.extractMin()).toBe(3)
    })

    it('should handle duplicates in extraction', () => {
      const heap = new SoftHeap2<number>()
      heap.insert(3)
      heap.insert(3)
      heap.insert(1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(3)
      expect(heap.extractMin()).toBe(3)
    })
  })

  // ─── Peek ───

  describe('peek', () => {
    it('should return undefined for empty heap', () => {
      const heap = new SoftHeap2<number>()
      expect(heap.peek()).toBeUndefined()
    })

    it('should return the minimum element without removing it', () => {
      const heap = new SoftHeap2<number>()
      heap.insert(10)
      heap.insert(5)
      expect(heap.peek()).toBe(5)
      expect(heap.size).toBe(2)
    })

    it('should update after extraction', () => {
      const heap = new SoftHeap2<number>()
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      heap.extractMin()
      expect(heap.peek()).toBe(2)
    })
  })

  // ─── Size and IsEmpty ───

  describe('size and isEmpty', () => {
    it('should track size correctly', () => {
      const heap = new SoftHeap2<number>()
      expect(heap.size).toBe(0)
      heap.insert(1)
      expect(heap.size).toBe(1)
      heap.insert(2)
      expect(heap.size).toBe(2)
      heap.extractMin()
      expect(heap.size).toBe(1)
    })

    it('should report empty correctly', () => {
      const heap = new SoftHeap2<number>()
      expect(heap.isEmpty()).toBe(true)
      heap.insert(1)
      expect(heap.isEmpty()).toBe(false)
      heap.extractMin()
      expect(heap.isEmpty()).toBe(true)
    })
  })

  // ─── Clear ───

  describe('clear', () => {
    it('should clear all elements', () => {
      const heap = new SoftHeap2<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.clear()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
      expect(heap.peek()).toBeUndefined()
    })

    it('should allow insertions after clear', () => {
      const heap = new SoftHeap2<number>()
      heap.insert(5)
      heap.clear()
      heap.insert(3)
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(3)
    })
  })

  // ─── ToArray ───

  describe('toArray', () => {
    it('should return empty array for empty heap', () => {
      const heap = new SoftHeap2<number>()
      expect(heap.toArray()).toEqual([])
    })

    it('should return sorted array', () => {
      const heap = new SoftHeap2<number>()
      heap.insert(5)
      heap.insert(1)
      heap.insert(3)
      expect(heap.toArray()).toEqual([1, 3, 5])
    })

    it('should not modify the heap', () => {
      const heap = new SoftHeap2<number>()
      heap.insert(5)
      heap.insert(1)
      heap.toArray()
      expect(heap.size).toBe(2)
      expect(heap.peek()).toBe(1)
    })
  })

  // ─── Delete ───

  describe('delete', () => {
    it('should return false when deleting from empty heap', () => {
      const heap = new SoftHeap2<number>()
      expect(heap.delete(5)).toBe(false)
    })

    it('should return false when element not found', () => {
      const heap = new SoftHeap2<number>()
      heap.insert(1)
      heap.insert(2)
      expect(heap.delete(99)).toBe(false)
    })

    it('should delete the only element', () => {
      const heap = new SoftHeap2<number>()
      heap.insert(10)
      expect(heap.delete(10)).toBe(true)
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should delete an element and maintain heap property', () => {
      const heap = new SoftHeap2<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      expect(heap.delete(3)).toBe(true)
      expect(heap.size).toBe(2)
      expect(heap.peek()).toBe(5)
    })

    it('should handle deleting duplicates (removes first match)', () => {
      const heap = new SoftHeap2<number>()
      heap.insert(3)
      heap.insert(3)
      expect(heap.delete(3)).toBe(true)
      expect(heap.size).toBe(1)
    })
  })

  // ─── Meld ───

  describe('meld', () => {
    it('should meld two heaps', () => {
      const heap1 = new SoftHeap2<number>()
      heap1.insert(1)
      heap1.insert(4)
      const heap2 = new SoftHeap2<number>()
      heap2.insert(2)
      heap2.insert(3)
      heap1.meld(heap2)
      expect(heap1.size).toBe(4)
      const extracted: number[] = []
      while (!heap1.isEmpty()) {
        extracted.push(heap1.extractMin()!)
      }
      expect(extracted).toEqual([1, 2, 3, 4])
    })

    it('should meld with empty heap', () => {
      const heap1 = new SoftHeap2<number>()
      heap1.insert(1)
      heap1.insert(2)
      const heap2 = new SoftHeap2<number>()
      heap1.meld(heap2)
      expect(heap1.size).toBe(2)
    })

    it('should meld into empty heap', () => {
      const heap1 = new SoftHeap2<number>()
      const heap2 = new SoftHeap2<number>()
      heap2.insert(1)
      heap2.insert(2)
      heap1.meld(heap2)
      expect(heap1.size).toBe(2)
      expect(heap1.peek()).toBe(1)
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('should handle single element operations', () => {
      const heap = new SoftHeap2<number>()
      heap.insert(1)
      expect(heap.peek()).toBe(1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.peek()).toBeUndefined()
      expect(heap.extractMin()).toBeUndefined()
    })

    it('should handle large number of insertions and extractions', () => {
      const heap = new SoftHeap2<number>()
      const n = 100
      for (let i = n; i >= 1; i--) {
        heap.insert(i)
      }
      for (let i = 1; i <= n; i++) {
        expect(heap.extractMin()).toBe(i)
      }
      expect(heap.isEmpty()).toBe(true)
    })

    it('should work with reverse comparator', () => {
      const heap = new SoftHeap2<number>((a, b) => b - a)
      heap.insert(1)
      heap.insert(5)
      heap.insert(3)
      expect(heap.peek()).toBe(5)
      expect(heap.extractMin()).toBe(5)
      expect(heap.extractMin()).toBe(3)
      expect(heap.extractMin()).toBe(1)
    })
  })
})
