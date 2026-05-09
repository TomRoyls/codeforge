import { describe, it, expect, beforeEach } from 'vitest'
import { BinomialHeap, DEFAULT_BINOMIAL_HEAP_OPTIONS } from '../../src/core/binomial-heap/binomial-heap.js'
import type { BinomialHeapOptions, BinomialNode } from '../../src/core/binomial-heap/binomial-heap.js'

describe('BinomialHeap', () => {
  let heap: BinomialHeap<number>

  beforeEach(() => {
    heap = new BinomialHeap<number>()
  })

  describe('constructor', () => {
    it('should create an empty heap', () => {
      const h = new BinomialHeap<number>()
      expect(h.size()).toBe(0)
      expect(h.isEmpty()).toBe(true)
    })

    it('should accept empty options', () => {
      const h = new BinomialHeap<number>({})
      expect(h.size()).toBe(0)
    })

    it('should accept undefined options', () => {
      const h = new BinomialHeap<number>(undefined)
      expect(h.size()).toBe(0)
    })

    it('should accept custom comparator', () => {
      const h = new BinomialHeap<number>({ comparator: (a, b) => (b as number) - (a as number) })
      h.insert(1)
      h.insert(2)
      h.insert(3)
      expect(h.peek()).toBe(3)
    })

    it('should accept comparator for max heap', () => {
      const h = new BinomialHeap<number>({
        comparator: (a, b) => (b as number) - (a as number),
      })
      h.insert(5)
      h.insert(3)
      h.insert(8)
      expect(h.extractMin()).toBe(8)
    })
  })

  describe('insert', () => {
    it('should add a single element', () => {
      heap.insert(5)
      expect(heap.size()).toBe(1)
      expect(heap.isEmpty()).toBe(false)
    })

    it('should add multiple elements', () => {
      heap.insert(3)
      heap.insert(1)
      heap.insert(4)
      expect(heap.size()).toBe(3)
    })

    it('should maintain min on insert', () => {
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.insert(1)
      expect(heap.peek()).toBe(1)
    })

    it('should handle negative values', () => {
      heap.insert(-5)
      heap.insert(-10)
      heap.insert(3)
      expect(heap.peek()).toBe(-10)
    })

    it('should handle zero', () => {
      heap.insert(0)
      expect(heap.peek()).toBe(0)
    })

    it('should handle duplicate values', () => {
      heap.insert(5)
      heap.insert(5)
      heap.insert(5)
      expect(heap.size()).toBe(3)
      expect(heap.peek()).toBe(5)
    })

    it('should handle floating point values', () => {
      heap.insert(3.14)
      heap.insert(2.71)
      expect(heap.peek()).toBeCloseTo(2.71)
    })

    it('should update size correctly for 100 inserts', () => {
      for (let i = 0; i < 100; i++) {
        heap.insert(i)
      }
      expect(heap.size()).toBe(100)
    })

    it('should insert in reverse order', () => {
      for (let i = 100; i >= 1; i--) {
        heap.insert(i)
      }
      expect(heap.peek()).toBe(1)
    })

    it('should handle single element insert', () => {
      heap.insert(42)
      expect(heap.size()).toBe(1)
      expect(heap.peek()).toBe(42)
    })
  })

  describe('extractMin', () => {
    it('should return undefined on empty heap', () => {
      expect(heap.extractMin()).toBeUndefined()
    })

    it('should extract single element', () => {
      heap.insert(10)
      const result = heap.extractMin()
      expect(result).toBe(10)
      expect(heap.size()).toBe(0)
    })

    it('should extract min from two elements', () => {
      heap.insert(5)
      heap.insert(3)
      expect(heap.extractMin()).toBe(3)
      expect(heap.extractMin()).toBe(5)
    })

    it('should extract in sorted order', () => {
      const values = [5, 3, 7, 1, 4, 6, 2, 8]
      for (const v of values) {
        heap.insert(v)
      }
      const extracted: number[] = []
      while (!heap.isEmpty()) {
        extracted.push(heap.extractMin()!)
      }
      expect(extracted).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    })

    it('should handle consolidation after extract', () => {
      for (let i = 10; i >= 1; i--) {
        heap.insert(i)
      }
      expect(heap.extractMin()).toBe(1)
      expect(heap.peek()).toBe(2)
    })

    it('should extract all elements correctly', () => {
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(2)
      expect(heap.extractMin()).toBe(3)
      expect(heap.extractMin()).toBeUndefined()
    })

    it('should update size after extraction', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.extractMin()
      expect(heap.size()).toBe(2)
      heap.extractMin()
      expect(heap.size()).toBe(1)
    })

    it('should handle extract after many inserts', () => {
      for (let i = 50; i >= 1; i--) {
        heap.insert(i)
      }
      for (let i = 1; i <= 50; i++) {
        expect(heap.extractMin()).toBe(i)
      }
    })

    it('should handle alternating insert and extract', () => {
      heap.insert(5)
      heap.insert(3)
      expect(heap.extractMin()).toBe(3)
      heap.insert(1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(5)
    })

    it('should handle duplicate values extraction', () => {
      heap.insert(1)
      heap.insert(1)
      heap.insert(1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(1)
    })

    it('should return undefined when heap becomes empty', () => {
      heap.insert(1)
      heap.extractMin()
      expect(heap.extractMin()).toBeUndefined()
    })

    it('should maintain heap property across many extracts', () => {
      for (let i = 0; i < 32; i++) {
        heap.insert(Math.floor(Math.random() * 1000))
      }
      let prev = -Infinity
      while (!heap.isEmpty()) {
        const curr = heap.extractMin()!
        expect(curr).toBeGreaterThanOrEqual(prev)
        prev = curr
      }
    })
  })

  describe('peek', () => {
    it('should return undefined on empty heap', () => {
      expect(heap.peek()).toBeUndefined()
    })

    it('should return min element without removing', () => {
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      expect(heap.peek()).toBe(3)
      expect(heap.size()).toBe(3)
    })

    it('should update after insert', () => {
      heap.insert(10)
      expect(heap.peek()).toBe(10)
      heap.insert(5)
      expect(heap.peek()).toBe(5)
    })

    it('should update after extractMin', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.extractMin()
      expect(heap.peek()).toBe(2)
    })

    it('should return same element on repeated calls', () => {
      heap.insert(5)
      expect(heap.peek()).toBe(heap.peek())
    })

    it('should handle single element', () => {
      heap.insert(42)
      expect(heap.peek()).toBe(42)
    })

    it('should not modify heap', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      const sizeBefore = heap.size()
      heap.peek()
      expect(heap.size()).toBe(sizeBefore)
    })
  })

  describe('size', () => {
    it('should return 0 on empty heap', () => {
      expect(heap.size()).toBe(0)
    })

    it('should return 1 after single insert', () => {
      heap.insert(1)
      expect(heap.size()).toBe(1)
    })

    it('should return correct size after multiple inserts', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      expect(heap.size()).toBe(3)
    })

    it('should decrease after extractMin', () => {
      heap.insert(1)
      heap.insert(2)
      heap.extractMin()
      expect(heap.size()).toBe(1)
    })

    it('should return 0 after clear', () => {
      heap.insert(1)
      heap.insert(2)
      heap.clear()
      expect(heap.size()).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('should return true on new heap', () => {
      expect(heap.isEmpty()).toBe(true)
    })

    it('should return false after insert', () => {
      heap.insert(1)
      expect(heap.isEmpty()).toBe(false)
    })

    it('should return true after all elements extracted', () => {
      heap.insert(1)
      heap.insert(2)
      heap.extractMin()
      heap.extractMin()
      expect(heap.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      heap.insert(1)
      heap.clear()
      expect(heap.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should empty non-empty heap', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.clear()
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should clear heap with one element', () => {
      heap.insert(1)
      heap.clear()
      expect(heap.size()).toBe(0)
    })

    it('should allow reuse after clear', () => {
      heap.insert(1)
      heap.clear()
      heap.insert(5)
      expect(heap.size()).toBe(1)
      expect(heap.peek()).toBe(5)
    })

    it('should handle clear on already empty heap', () => {
      heap.clear()
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should allow extractMin after clear and reinsert', () => {
      heap.insert(10)
      heap.clear()
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      expect(heap.extractMin()).toBe(1)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty heap', () => {
      expect(heap.toArray()).toEqual([])
    })

    it('should return all elements', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      const arr = heap.toArray()
      expect(arr.length).toBe(3)
    })

    it('should return correct count after operations', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.extractMin()
      expect(heap.toArray().length).toBe(2)
    })

    it('should return new array each call', () => {
      heap.insert(1)
      const a = heap.toArray()
      const b = heap.toArray()
      expect(a).not.toBe(b)
    })

    it('should return all elements after merge', () => {
      heap.insert(1)
      const other = new BinomialHeap<number>()
      other.insert(2)
      heap.merge(other)
      expect(heap.toArray().length).toBe(2)
    })

    it('should contain all inserted values', () => {
      heap.insert(10)
      heap.insert(20)
      heap.insert(30)
      const arr = heap.toArray()
      expect(arr).toContain(10)
      expect(arr).toContain(20)
      expect(arr).toContain(30)
    })
  })

  describe('contains', () => {
    it('should return false on empty heap', () => {
      expect(heap.contains(1)).toBe(false)
    })

    it('should return true for existing value', () => {
      heap.insert(5)
      expect(heap.contains(5)).toBe(true)
    })

    it('should return false for non-existing value', () => {
      heap.insert(5)
      expect(heap.contains(10)).toBe(false)
    })

    it('should find values after multiple inserts', () => {
      heap.insert(3)
      heap.insert(1)
      heap.insert(4)
      expect(heap.contains(3)).toBe(true)
      expect(heap.contains(1)).toBe(true)
      expect(heap.contains(4)).toBe(true)
      expect(heap.contains(2)).toBe(false)
    })

    it('should handle duplicate values', () => {
      heap.insert(5)
      heap.insert(5)
      expect(heap.contains(5)).toBe(true)
    })

    it('should find value after extractMin', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.extractMin()
      expect(heap.contains(2)).toBe(true)
      expect(heap.contains(1)).toBe(false)
    })

    it('should return false after clear', () => {
      heap.insert(5)
      heap.clear()
      expect(heap.contains(5)).toBe(false)
    })

    it('should find values deep in tree', () => {
      for (let i = 1; i <= 16; i++) {
        heap.insert(i)
      }
      expect(heap.contains(16)).toBe(true)
      expect(heap.contains(1)).toBe(true)
      expect(heap.contains(8)).toBe(true)
    })
  })

  describe('clone', () => {
    it('should clone empty heap', () => {
      const cloned = heap.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should clone heap with elements', () => {
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      const cloned = heap.clone()
      expect(cloned.size()).toBe(3)
      expect(cloned.peek()).toBe(1)
    })

    it('should not share state with original', () => {
      heap.insert(1)
      heap.insert(2)
      const cloned = heap.clone()
      cloned.insert(3)
      expect(heap.size()).toBe(2)
      expect(cloned.size()).toBe(3)
    })

    it('should produce independent extractMin sequence', () => {
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      const cloned = heap.clone()
      expect(heap.extractMin()).toBe(1)
      expect(cloned.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(2)
      expect(cloned.extractMin()).toBe(2)
    })

    it('should clone heap after merge', () => {
      heap.insert(5)
      const other = new BinomialHeap<number>()
      other.insert(3)
      heap.merge(other)
      const cloned = heap.clone()
      expect(cloned.size()).toBe(2)
      expect(cloned.peek()).toBe(3)
    })

    it('should clone large heap', () => {
      for (let i = 0; i < 100; i++) {
        heap.insert(i)
      }
      const cloned = heap.clone()
      expect(cloned.size()).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(cloned.extractMin()).toBe(i)
      }
    })
  })

  describe('isValid', () => {
    it('should return true for empty heap', () => {
      expect(heap.isValid()).toBe(true)
    })

    it('should return true for single element', () => {
      heap.insert(1)
      expect(heap.isValid()).toBe(true)
    })

    it('should return true after multiple inserts', () => {
      for (let i = 0; i < 10; i++) {
        heap.insert(i)
      }
      expect(heap.isValid()).toBe(true)
    })

    it('should return true after extractMin', () => {
      for (let i = 0; i < 10; i++) {
        heap.insert(i)
      }
      heap.extractMin()
      expect(heap.isValid()).toBe(true)
    })

    it('should return true after merge', () => {
      heap.insert(1)
      heap.insert(3)
      const other = new BinomialHeap<number>()
      other.insert(2)
      other.insert(4)
      heap.merge(other)
      expect(heap.isValid()).toBe(true)
    })

    it('should return true for power of 2 elements', () => {
      for (let i = 0; i < 8; i++) {
        heap.insert(i)
      }
      expect(heap.isValid()).toBe(true)
    })

    it('should return true after decreaseKey', () => {
      heap.insert(10)
      heap.insert(20)
      heap.insert(30)
      heap.decreaseKey(30, 5)
      expect(heap.isValid()).toBe(true)
    })

    it('should return true after many operations', () => {
      for (let i = 0; i < 50; i++) {
        heap.insert(i)
      }
      for (let i = 0; i < 25; i++) {
        heap.extractMin()
      }
      expect(heap.isValid()).toBe(true)
    })
  })

  describe('decreaseKey', () => {
    it('should decrease key of element', () => {
      heap.insert(5)
      heap.insert(3)
      expect(heap.decreaseKey(5, 1)).toBe(true)
      expect(heap.peek()).toBe(1)
    })

    it('should return false for key increase', () => {
      heap.insert(3)
      expect(heap.decreaseKey(3, 10)).toBe(false)
    })

    it('should return false for non-existent value', () => {
      heap.insert(3)
      expect(heap.decreaseKey(99, 1)).toBe(false)
    })

    it('should return true on success', () => {
      heap.insert(5)
      expect(heap.decreaseKey(5, 2)).toBe(true)
    })

    it('should update min after decrease', () => {
      heap.insert(10)
      heap.insert(20)
      heap.decreaseKey(20, 5)
      expect(heap.peek()).toBe(5)
    })

    it('should bubble up correctly', () => {
      for (let i = 1; i <= 10; i++) {
        heap.insert(i)
      }
      heap.extractMin()
      heap.decreaseKey(10, 0)
      expect(heap.peek()).toBe(0)
    })

    it('should handle decrease of non-min element', () => {
      heap.insert(1)
      heap.insert(5)
      heap.insert(3)
      heap.decreaseKey(5, 2)
      expect(heap.peek()).toBe(1)
    })

    it('should handle multiple decreases', () => {
      heap.insert(10)
      heap.insert(20)
      heap.decreaseKey(10, 5)
      heap.decreaseKey(20, 3)
      expect(heap.extractMin()).toBe(3)
      expect(heap.extractMin()).toBe(5)
    })

    it('should handle decrease to same value', () => {
      heap.insert(5)
      const result = heap.decreaseKey(5, 5)
      expect(result).toBe(true)
      expect(heap.peek()).toBe(5)
    })

    it('should handle decrease after merge', () => {
      heap.insert(10)
      const other = new BinomialHeap<number>()
      other.insert(20)
      heap.merge(other)
      heap.decreaseKey(20, 1)
      expect(heap.peek()).toBe(1)
    })

    it('should maintain valid heap after decrease', () => {
      for (let i = 1; i <= 8; i++) {
        heap.insert(i * 10)
      }
      heap.decreaseKey(80, 1)
      expect(heap.isValid()).toBe(true)
      expect(heap.peek()).toBe(1)
    })
  })

  describe('merge', () => {
    it('should merge two non-empty heaps', () => {
      heap.insert(5)
      heap.insert(10)
      const other = new BinomialHeap<number>()
      other.insert(3)
      other.insert(7)
      heap.merge(other)
      expect(heap.size()).toBe(4)
      expect(heap.peek()).toBe(3)
    })

    it('should merge empty with non-empty', () => {
      const other = new BinomialHeap<number>()
      other.insert(1)
      heap.merge(other)
      expect(heap.size()).toBe(1)
      expect(heap.peek()).toBe(1)
    })

    it('should merge non-empty with empty', () => {
      heap.insert(1)
      const other = new BinomialHeap<number>()
      heap.merge(other)
      expect(heap.size()).toBe(1)
    })

    it('should merge two empty heaps', () => {
      const other = new BinomialHeap<number>()
      heap.merge(other)
      expect(heap.size()).toBe(0)
    })

    it('should clear source heap after merge', () => {
      heap.insert(1)
      const other = new BinomialHeap<number>()
      other.insert(2)
      other.insert(3)
      heap.merge(other)
      expect(other.size()).toBe(0)
      expect(other.isEmpty()).toBe(true)
    })

    it('should update size after merge', () => {
      for (let i = 0; i < 5; i++) heap.insert(i)
      const other = new BinomialHeap<number>()
      for (let i = 5; i < 10; i++) other.insert(i)
      heap.merge(other)
      expect(heap.size()).toBe(10)
    })

    it('should update min after merge', () => {
      heap.insert(10)
      const other = new BinomialHeap<number>()
      other.insert(1)
      heap.merge(other)
      expect(heap.peek()).toBe(1)
    })

    it('should handle merge with equal mins', () => {
      heap.insert(1)
      const other = new BinomialHeap<number>()
      other.insert(1)
      heap.merge(other)
      expect(heap.size()).toBe(2)
      expect(heap.peek()).toBe(1)
    })

    it('should extract in order after merge', () => {
      heap.insert(5)
      heap.insert(1)
      const other = new BinomialHeap<number>()
      other.insert(3)
      other.insert(2)
      other.insert(4)
      heap.merge(other)
      const extracted: number[] = []
      while (!heap.isEmpty()) {
        extracted.push(heap.extractMin()!)
      }
      expect(extracted).toEqual([1, 2, 3, 4, 5])
    })

    it('should maintain valid heap after merge', () => {
      for (let i = 0; i < 8; i++) heap.insert(i * 2)
      const other = new BinomialHeap<number>()
      for (let i = 0; i < 8; i++) other.insert(i * 2 + 1)
      heap.merge(other)
      expect(heap.isValid()).toBe(true)
    })

    it('should handle merging large heaps', () => {
      for (let i = 0; i < 50; i++) heap.insert(i)
      const other = new BinomialHeap<number>()
      for (let i = 50; i < 100; i++) other.insert(i)
      heap.merge(other)
      expect(heap.size()).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(heap.extractMin()).toBe(i)
      }
    })

    it('should handle consecutive merges', () => {
      heap.insert(5)
      const other1 = new BinomialHeap<number>()
      other1.insert(3)
      heap.merge(other1)
      const other2 = new BinomialHeap<number>()
      other2.insert(1)
      heap.merge(other2)
      expect(heap.size()).toBe(3)
      expect(heap.peek()).toBe(1)
    })

    it('should merge heaps with same tree structures', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      const other = new BinomialHeap<number>()
      other.insert(4)
      other.insert(5)
      other.insert(6)
      heap.merge(other)
      expect(heap.size()).toBe(6)
      expect(heap.isValid()).toBe(true)
    })
  })

  describe('binomial tree structure', () => {
    it('should maintain correct structure for 1 element', () => {
      heap.insert(1)
      expect(heap.size()).toBe(1)
      expect(heap.isValid()).toBe(true)
    })

    it('should maintain correct structure for 2 elements', () => {
      heap.insert(2)
      heap.insert(1)
      expect(heap.size()).toBe(2)
      expect(heap.isValid()).toBe(true)
    })

    it('should maintain correct structure for 4 elements', () => {
      for (let i = 1; i <= 4; i++) heap.insert(i)
      expect(heap.size()).toBe(4)
      expect(heap.isValid()).toBe(true)
    })

    it('should maintain correct structure for 8 elements', () => {
      for (let i = 1; i <= 8; i++) heap.insert(i)
      expect(heap.size()).toBe(8)
      expect(heap.isValid()).toBe(true)
    })

    it('should maintain correct structure for 16 elements', () => {
      for (let i = 1; i <= 16; i++) heap.insert(i)
      expect(heap.size()).toBe(16)
      expect(heap.isValid()).toBe(true)
    })

    it('should maintain correct structure for 7 elements', () => {
      for (let i = 1; i <= 7; i++) heap.insert(i)
      expect(heap.size()).toBe(7)
      expect(heap.isValid()).toBe(true)
    })

    it('should maintain structure through extractMin', () => {
      for (let i = 1; i <= 16; i++) heap.insert(i)
      for (let i = 1; i <= 8; i++) {
        heap.extractMin()
        expect(heap.isValid()).toBe(true)
      }
    })
  })

  describe('edge cases', () => {
    it('should handle string values', () => {
      const h = new BinomialHeap<string>()
      h.insert('banana')
      h.insert('apple')
      h.insert('cherry')
      expect(h.extractMin()).toBe('apple')
      expect(h.extractMin()).toBe('banana')
      expect(h.extractMin()).toBe('cherry')
    })

    it('should handle object values with comparator', () => {
      const h = new BinomialHeap<{ id: number }>({
        comparator: (a, b) => (a as { id: number }).id - (b as { id: number }).id,
      })
      h.insert({ id: 3 })
      h.insert({ id: 1 })
      h.insert({ id: 2 })
      expect(h.extractMin()?.id).toBe(1)
      expect(h.extractMin()?.id).toBe(2)
      expect(h.extractMin()?.id).toBe(3)
    })

    it('should handle negative values extraction', () => {
      heap.insert(-3)
      heap.insert(-1)
      heap.insert(-5)
      expect(heap.extractMin()).toBe(-5)
      expect(heap.extractMin()).toBe(-3)
      expect(heap.extractMin()).toBe(-1)
    })

    it('should handle interleaved operations', () => {
      heap.insert(5)
      heap.insert(3)
      heap.extractMin()
      heap.insert(1)
      heap.insert(7)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(5)
      expect(heap.extractMin()).toBe(7)
    })

    it('should handle large range of values', () => {
      heap.insert(-100)
      heap.insert(0)
      heap.insert(100)
      expect(heap.extractMin()).toBe(-100)
      expect(heap.extractMin()).toBe(0)
      expect(heap.extractMin()).toBe(100)
    })

    it('should handle min at boundary', () => {
      heap.insert(Number.MAX_SAFE_INTEGER)
      heap.insert(0)
      heap.insert(Number.MIN_SAFE_INTEGER)
      expect(heap.extractMin()).toBe(Number.MIN_SAFE_INTEGER)
    })
  })

  describe('stress tests', () => {
    it('should handle 1000 elements', () => {
      for (let i = 1000; i >= 1; i--) {
        heap.insert(i)
      }
      expect(heap.size()).toBe(1000)
      for (let i = 1; i <= 1000; i++) {
        expect(heap.extractMin()).toBe(i)
      }
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle 1000 random elements', () => {
      const values: number[] = []
      for (let i = 0; i < 1000; i++) {
        const v = Math.floor(Math.random() * 10000)
        values.push(v)
        heap.insert(v)
      }
      values.sort((a, b) => a - b)
      for (let i = 0; i < 1000; i++) {
        expect(heap.extractMin()).toBe(values[i])
      }
    })

    it('should handle 1000 elements with merge', () => {
      const h1 = new BinomialHeap<number>()
      const h2 = new BinomialHeap<number>()
      for (let i = 0; i < 500; i++) {
        h1.insert(i * 2)
        h2.insert(i * 2 + 1)
      }
      h1.merge(h2)
      expect(h1.size()).toBe(1000)
      for (let i = 0; i < 1000; i++) {
        expect(h1.extractMin()).toBe(i)
      }
    })

    it('should handle alternating insert extract 1000', () => {
      for (let i = 0; i < 500; i++) {
        heap.insert(i)
      }
      for (let i = 0; i < 250; i++) {
        heap.extractMin()
      }
      for (let i = 500; i < 750; i++) {
        heap.insert(i)
      }
      expect(heap.size()).toBe(500)
      expect(heap.isValid()).toBe(true)
      let prev = -Infinity
      while (!heap.isEmpty()) {
        const curr = heap.extractMin()!
        expect(curr).toBeGreaterThanOrEqual(prev)
        prev = curr
      }
    })

    it('should handle 1000 elements with decreaseKey', () => {
      for (let i = 1; i <= 1000; i++) {
        heap.insert(i)
      }
      expect(heap.decreaseKey(1000, 0)).toBe(true)
      expect(heap.peek()).toBe(0)
      expect(heap.isValid()).toBe(true)
    })

    it('should handle clone of 1000 elements', () => {
      for (let i = 0; i < 1000; i++) {
        heap.insert(i)
      }
      const cloned = heap.clone()
      expect(cloned.size()).toBe(1000)
      expect(cloned.isValid()).toBe(true)
      for (let i = 0; i < 1000; i++) {
        expect(cloned.extractMin()).toBe(i)
      }
    })

    it('should maintain valid heap under stress', () => {
      for (let i = 0; i < 500; i++) {
        heap.insert(Math.floor(Math.random() * 10000))
      }
      expect(heap.isValid()).toBe(true)
      for (let i = 0; i < 250; i++) {
        heap.extractMin()
      }
      expect(heap.isValid()).toBe(true)
    })
  })

  describe('exports', () => {
    it('should export DEFAULT_BINOMIAL_HEAP_OPTIONS', () => {
      expect(DEFAULT_BINOMIAL_HEAP_OPTIONS).toEqual({})
    })

    it('should export BinomialHeapOptions type', () => {
      const opts: BinomialHeapOptions = {}
      expect(opts).toBeDefined()
    })

    it('should allow typed node reference', () => {
      const node: BinomialNode<number> = {
        value: 1,
        degree: 0,
        parent: null,
        child: null,
        sibling: null,
      }
      expect(node.value).toBe(1)
    })
  })

  describe('merge O(1) behavior', () => {
    it('should merge two size-1 heaps efficiently', () => {
      heap.insert(2)
      const other = new BinomialHeap<number>()
      other.insert(1)
      heap.merge(other)
      expect(heap.size()).toBe(2)
      expect(heap.isValid()).toBe(true)
      expect(heap.peek()).toBe(1)
    })

    it('should merge heaps to form larger trees', () => {
      for (let i = 0; i < 4; i++) heap.insert(i)
      const other = new BinomialHeap<number>()
      for (let i = 4; i < 8; i++) other.insert(i)
      heap.merge(other)
      expect(heap.size()).toBe(8)
      expect(heap.isValid()).toBe(true)
    })

    it('should merge many small heaps', () => {
      for (let i = 0; i < 10; i++) {
        const small = new BinomialHeap<number>()
        small.insert(i)
        heap.merge(small)
      }
      expect(heap.size()).toBe(10)
      expect(heap.isValid()).toBe(true)
      for (let i = 0; i < 10; i++) {
        expect(heap.extractMin()).toBe(i)
      }
    })
  })

  describe('complex decreaseKey scenarios', () => {
    it('should handle decreaseKey triggering multiple bubble ups', () => {
      for (let i = 1; i <= 16; i++) {
        heap.insert(i)
      }
      heap.extractMin()
      heap.decreaseKey(16, 0)
      expect(heap.peek()).toBe(0)
      expect(heap.isValid()).toBe(true)
    })

    it('should handle decreaseKey on root node', () => {
      heap.insert(5)
      heap.insert(10)
      heap.insert(15)
      heap.decreaseKey(5, 1)
      expect(heap.peek()).toBe(1)
    })

    it('should not affect other elements during decreaseKey', () => {
      heap.insert(10)
      heap.insert(20)
      heap.insert(30)
      heap.decreaseKey(30, 15)
      expect(heap.extractMin()).toBe(10)
      expect(heap.extractMin()).toBe(15)
      expect(heap.extractMin()).toBe(20)
    })
  })
})
