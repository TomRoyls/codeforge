import { describe, it, expect, beforeEach } from 'vitest'
import { TwoThreeHeap } from '../../src/core/two-three-heap/index.js'

describe('TwoThreeHeap', () => {
  let heap: TwoThreeHeap<number>

  beforeEach(() => {
    heap = new TwoThreeHeap<number>()
  })

  // ─── Constructor ───

  describe('constructor', () => {
    it('should create an empty heap with default comparator', () => {
      const h = new TwoThreeHeap<number>()
      expect(h.size).toBe(0)
      expect(h.isEmpty()).toBe(true)
    })

    it('should accept a custom comparator for max-heap behavior', () => {
      const maxHeap = new TwoThreeHeap<number>((a, b) => b - a)
      maxHeap.insert(1)
      maxHeap.insert(3)
      maxHeap.insert(2)
      expect(maxHeap.peek()).toBe(3)
    })

    it('should accept a custom comparator for string sorting', () => {
      const strHeap = new TwoThreeHeap<string>((a, b) => a.localeCompare(b))
      strHeap.insert('banana')
      strHeap.insert('apple')
      strHeap.insert('cherry')
      expect(strHeap.peek()).toBe('apple')
    })
  })

  // ─── insert ───

  describe('insert', () => {
    it('should insert a single element', () => {
      heap.insert(5)
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(5)
    })

    it('should insert multiple elements', () => {
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      expect(heap.size).toBe(3)
    })

    it('should maintain min at root', () => {
      heap.insert(5)
      heap.insert(3)
      heap.insert(1)
      heap.insert(4)
      heap.insert(2)
      expect(heap.peek()).toBe(1)
    })

    it('should handle duplicate values', () => {
      heap.insert(5)
      heap.insert(5)
      heap.insert(5)
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(5)
    })

    it('should handle negative numbers', () => {
      heap.insert(-5)
      heap.insert(-1)
      heap.insert(-3)
      expect(heap.peek()).toBe(-5)
    })

    it('should handle zero', () => {
      heap.insert(0)
      expect(heap.peek()).toBe(0)
    })

    it('should handle single element', () => {
      heap.insert(42)
      expect(heap.size).toBe(1)
      expect(heap.isEmpty()).toBe(false)
    })
  })

  // ─── extractMin ───

  describe('extractMin', () => {
    it('should return undefined for empty heap', () => {
      expect(heap.extractMin()).toBeUndefined()
    })

    it('should extract the minimum element', () => {
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      expect(heap.extractMin()).toBe(1)
    })

    it('should extract elements in sorted order', () => {
      const values = [5, 3, 1, 4, 2]
      values.forEach(v => heap.insert(v))
      const extracted: number[] = []
      while (!heap.isEmpty()) {
        extracted.push(heap.extractMin()!)
      }
      expect(extracted).toEqual([1, 2, 3, 4, 5])
    })

    it('should decrease size after extraction', () => {
      heap.insert(1)
      heap.insert(2)
      expect(heap.size).toBe(2)
      heap.extractMin()
      expect(heap.size).toBe(1)
    })

    it('should handle extraction of all elements', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.extractMin()
      heap.extractMin()
      heap.extractMin()
      expect(heap.isEmpty()).toBe(true)
      expect(heap.size).toBe(0)
    })

    it('should handle duplicate values during extraction', () => {
      heap.insert(1)
      heap.insert(1)
      heap.insert(2)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(2)
    })

    it('should handle extraction of single element', () => {
      heap.insert(42)
      expect(heap.extractMin()).toBe(42)
      expect(heap.isEmpty()).toBe(true)
    })
  })

  // ─── peek ───

  describe('peek', () => {
    it('should return undefined for empty heap', () => {
      expect(heap.peek()).toBeUndefined()
    })

    it('should return the minimum element without removing it', () => {
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      expect(heap.peek()).toBe(1)
      expect(heap.peek()).toBe(1)
      expect(heap.size).toBe(3)
    })
  })

  // ─── size ───

  describe('size', () => {
    it('should return 0 for empty heap', () => {
      expect(heap.size).toBe(0)
    })

    it('should track size across insertions and extractions', () => {
      heap.insert(1)
      heap.insert(2)
      expect(heap.size).toBe(2)
      heap.extractMin()
      expect(heap.size).toBe(1)
      heap.insert(3)
      expect(heap.size).toBe(2)
    })
  })

  // ─── isEmpty ───

  describe('isEmpty', () => {
    it('should return true for new heap', () => {
      expect(heap.isEmpty()).toBe(true)
    })

    it('should return false after insertion', () => {
      heap.insert(1)
      expect(heap.isEmpty()).toBe(false)
    })

    it('should return true after extracting all elements', () => {
      heap.insert(1)
      heap.extractMin()
      expect(heap.isEmpty()).toBe(true)
    })
  })

  // ─── clear ───

  describe('clear', () => {
    it('should clear all elements', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.clear()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should allow insertions after clear', () => {
      heap.insert(1)
      heap.clear()
      heap.insert(2)
      expect(heap.peek()).toBe(2)
      expect(heap.size).toBe(1)
    })
  })

  // ─── toArray ───

  describe('toArray', () => {
    it('should return empty array for empty heap', () => {
      expect(heap.toArray()).toEqual([])
    })

    it('should return elements in sorted order', () => {
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      expect(heap.toArray()).toEqual([1, 2, 3])
    })

    it('should not modify the heap', () => {
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      heap.toArray()
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(1)
    })
  })

  // ─── meld ───

  describe('meld', () => {
    it('should merge two heaps', () => {
      const other = new TwoThreeHeap<number>()
      heap.insert(1)
      heap.insert(3)
      other.insert(2)
      other.insert(4)
      heap.meld(other)
      expect(heap.size).toBe(4)
      expect(heap.peek()).toBe(1)
    })

    it('should clear the other heap after meld', () => {
      const other = new TwoThreeHeap<number>()
      heap.insert(1)
      other.insert(2)
      heap.meld(other)
      expect(other.isEmpty()).toBe(true)
      expect(other.size).toBe(0)
    })

    it('should handle melding with empty heap', () => {
      const other = new TwoThreeHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.meld(other)
      expect(heap.size).toBe(2)
    })

    it('should handle melding into empty heap', () => {
      const other = new TwoThreeHeap<number>()
      other.insert(1)
      other.insert(2)
      heap.meld(other)
      expect(heap.size).toBe(2)
      expect(heap.peek()).toBe(1)
    })

    it('should extract in order after meld', () => {
      const other = new TwoThreeHeap<number>()
      heap.insert(1)
      heap.insert(4)
      other.insert(2)
      other.insert(3)
      heap.meld(other)
      const extracted: number[] = []
      while (!heap.isEmpty()) {
        extracted.push(heap.extractMin()!)
      }
      expect(extracted).toEqual([1, 2, 3, 4])
    })
  })

  // ─── Edge cases ───

  describe('edge cases', () => {
    it('should handle large number of elements', () => {
      const count = 100
      for (let i = count; i >= 1; i--) {
        heap.insert(i)
      }
      expect(heap.size).toBe(count)
      expect(heap.peek()).toBe(1)
      for (let i = 1; i <= count; i++) {
        expect(heap.extractMin()).toBe(i)
      }
    })

    it('should handle alternating insert and extract', () => {
      heap.insert(5)
      heap.insert(3)
      expect(heap.extractMin()).toBe(3)
      heap.insert(1)
      heap.insert(4)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(4)
      expect(heap.extractMin()).toBe(5)
    })

    it('should handle max-heap with negative numbers', () => {
      const maxHeap = new TwoThreeHeap<number>((a, b) => b - a)
      maxHeap.insert(-5)
      maxHeap.insert(-1)
      maxHeap.insert(-3)
      expect(maxHeap.peek()).toBe(-1)
      expect(maxHeap.extractMin()).toBe(-1)
    })

    it('should handle inserting same value repeatedly', () => {
      for (let i = 0; i < 10; i++) {
        heap.insert(42)
      }
      expect(heap.size).toBe(10)
      for (let i = 0; i < 10; i++) {
        expect(heap.extractMin()).toBe(42)
      }
    })
  })
})
