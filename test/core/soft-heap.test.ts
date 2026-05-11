import { describe, it, expect } from 'vitest'
import { SoftHeap } from '../../src/core/soft-heap/index.js'

describe('SoftHeap', () => {
  describe('constructor', () => {
    it('should create a soft heap with default options', () => {
      const heap = new SoftHeap<number>()
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
      expect(heap.errorRate).toBe(0.1)
    })

    it('should create a soft heap with custom error rate', () => {
      const heap = new SoftHeap<number>({ errorRate: 0.5 })
      expect(heap.errorRate).toBe(0.5)
    })

    it('should create a soft heap with custom comparator', () => {
      const heap = new SoftHeap<{ val: number }>({
        comparator: (a, b) => a.val - b.val,
      })
      expect(heap.errorRate).toBe(0.1)
    })

    it('should accept error rate of 0', () => {
      const heap = new SoftHeap<number>({ errorRate: 0 })
      expect(heap.errorRate).toBe(0)
    })

    it('should accept very small error rate', () => {
      const heap = new SoftHeap<number>({ errorRate: 0.001 })
      expect(heap.errorRate).toBe(0.001)
    })

    it('should accept error rate of 1', () => {
      const heap = new SoftHeap<number>({ errorRate: 1 })
      expect(heap.errorRate).toBe(1)
    })

    it('should create empty heap', () => {
      const heap = new SoftHeap<string>()
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
      expect(heap.peek()).toBeUndefined()
    })

    it('should work with both options provided', () => {
      const heap = new SoftHeap<number>({
        errorRate: 0.25,
        comparator: (a, b) => a - b,
      })
      expect(heap.errorRate).toBe(0.25)
    })
  })

  describe('insert', () => {
    it('should insert a single item', () => {
      const heap = new SoftHeap<number>()
      heap.insert(5)
      expect(heap.size()).toBe(1)
      expect(heap.isEmpty()).toBe(false)
    })

    it('should insert multiple items', () => {
      const heap = new SoftHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      expect(heap.size()).toBe(3)
    })

    it('should allow peeking after insert', () => {
      const heap = new SoftHeap<number>()
      heap.insert(42)
      expect(heap.peek()).toBe(42)
    })

    it('should insert items in sorted order', () => {
      const heap = new SoftHeap<number>()
      for (let i = 0; i < 10; i++) {
        heap.insert(i)
      }
      expect(heap.size()).toBe(10)
    })

    it('should insert items in reverse sorted order', () => {
      const heap = new SoftHeap<number>()
      for (let i = 9; i >= 0; i--) {
        heap.insert(i)
      }
      expect(heap.size()).toBe(10)
    })

    it('should insert duplicate items', () => {
      const heap = new SoftHeap<number>()
      heap.insert(5)
      heap.insert(5)
      heap.insert(5)
      expect(heap.size()).toBe(3)
    })

    it('should insert negative numbers', () => {
      const heap = new SoftHeap<number>()
      heap.insert(-10)
      heap.insert(-5)
      heap.insert(0)
      expect(heap.size()).toBe(3)
    })

    it('should insert zero', () => {
      const heap = new SoftHeap<number>()
      heap.insert(0)
      expect(heap.size()).toBe(1)
      expect(heap.peek()).toBe(0)
    })

    it('should handle string items', () => {
      const heap = new SoftHeap<string>()
      heap.insert('hello')
      heap.insert('world')
      expect(heap.size()).toBe(2)
    })

    it('should handle object items with comparator', () => {
      const heap = new SoftHeap<{ id: number }>({
        comparator: (a, b) => a.id - b.id,
      })
      heap.insert({ id: 3 })
      heap.insert({ id: 1 })
      heap.insert({ id: 2 })
      expect(heap.size()).toBe(3)
    })

    it('should insert many items', () => {
      const heap = new SoftHeap<number>()
      for (let i = 0; i < 1000; i++) {
        heap.insert(i)
      }
      expect(heap.size()).toBe(1000)
    })
  })

  describe('extractMin', () => {
    it('should return undefined on empty heap', () => {
      const heap = new SoftHeap<number>()
      expect(heap.extractMin()).toBeUndefined()
    })

    it('should extract single item', () => {
      const heap = new SoftHeap<number>()
      heap.insert(42)
      const result = heap.extractMin()
      expect(result).toBe(42)
      expect(heap.size()).toBe(0)
    })

    it('should extract items in approximately sorted order', () => {
      const heap = new SoftHeap<number>()
      const items = [5, 3, 1, 4, 2]
      for (const item of items) {
        heap.insert(item)
      }
      const extracted: number[] = []
      while (!heap.isEmpty()) {
        extracted.push(heap.extractMin()!)
      }
      expect(extracted.length).toBe(5)
      expect(extracted).toContain(1)
      expect(extracted).toContain(2)
      expect(extracted).toContain(3)
      expect(extracted).toContain(4)
      expect(extracted).toContain(5)
    })

    it('should extract all inserted items', () => {
      const heap = new SoftHeap<number>()
      const items = [10, 20, 30, 40, 50]
      for (const item of items) {
        heap.insert(item)
      }
      const extracted: number[] = []
      while (!heap.isEmpty()) {
        extracted.push(heap.extractMin()!)
      }
      expect(extracted.length).toBe(5)
      const sorted = [...extracted].sort((a, b) => a - b)
      expect(extracted).toEqual(sorted)
    })

    it('should handle extract on heap with one item', () => {
      const heap = new SoftHeap<number>()
      heap.insert(1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle alternating insert and extract', () => {
      const heap = new SoftHeap<number>()
      heap.insert(1)
      heap.insert(2)
      expect(heap.extractMin()).toBeDefined()
      heap.insert(3)
      expect(heap.size()).toBe(2)
      expect(heap.extractMin()).toBeDefined()
      expect(heap.extractMin()).toBeDefined()
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle extract after many inserts', () => {
      const heap = new SoftHeap<number>()
      for (let i = 0; i < 100; i++) {
        heap.insert(i)
      }
      const results: number[] = []
      while (!heap.isEmpty()) {
        results.push(heap.extractMin()!)
      }
      expect(results.length).toBe(100)
    })

    it('should return all items without loss', () => {
      const heap = new SoftHeap<number>()
      const items = [42, 17, 99, 3, 55, 28, 71, 8, 63, 36]
      for (const item of items) {
        heap.insert(item)
      }
      const extracted: number[] = []
      while (!heap.isEmpty()) {
        extracted.push(heap.extractMin()!)
      }
      expect(extracted.length).toBe(items.length)
      expect(extracted.sort((a, b) => a - b)).toEqual(
        [...items].sort((a, b) => a - b),
      )
    })

    it('should handle duplicates correctly', () => {
      const heap = new SoftHeap<number>()
      heap.insert(5)
      heap.insert(5)
      heap.insert(5)
      expect(heap.extractMin()).toBe(5)
      expect(heap.extractMin()).toBe(5)
      expect(heap.extractMin()).toBe(5)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle sequential inserts and extracts', () => {
      const heap = new SoftHeap<number>()
      for (let i = 0; i < 10; i++) {
        heap.insert(i)
      }
      for (let i = 0; i < 10; i++) {
        expect(heap.extractMin()).toBeDefined()
      }
      expect(heap.isEmpty()).toBe(true)
    })
  })

  describe('peek', () => {
    it('should return undefined on empty heap', () => {
      const heap = new SoftHeap<number>()
      expect(heap.peek()).toBeUndefined()
    })

    it('should return the first inserted item for single item', () => {
      const heap = new SoftHeap<number>()
      heap.insert(42)
      expect(heap.peek()).toBe(42)
    })

    it('should not remove the item', () => {
      const heap = new SoftHeap<number>()
      heap.insert(42)
      heap.peek()
      expect(heap.size()).toBe(1)
    })

    it('should return consistent result on multiple peeks', () => {
      const heap = new SoftHeap<number>()
      heap.insert(42)
      expect(heap.peek()).toBe(heap.peek())
      expect(heap.peek()).toBe(heap.peek())
    })

    it('should work after multiple inserts', () => {
      const heap = new SoftHeap<number>()
      heap.insert(10)
      heap.insert(20)
      heap.insert(30)
      expect(heap.peek()).toBeDefined()
      expect(heap.size()).toBe(3)
    })
  })

  describe('meld', () => {
    it('should meld two empty heaps', () => {
      const heap1 = new SoftHeap<number>()
      const heap2 = new SoftHeap<number>()
      heap1.meld(heap2)
      expect(heap1.size()).toBe(0)
      expect(heap2.size()).toBe(0)
    })

    it('should meld empty heap into non-empty', () => {
      const heap1 = new SoftHeap<number>()
      const heap2 = new SoftHeap<number>()
      heap1.insert(1)
      heap1.meld(heap2)
      expect(heap1.size()).toBe(1)
    })

    it('should meld non-empty heap into empty', () => {
      const heap1 = new SoftHeap<number>()
      const heap2 = new SoftHeap<number>()
      heap2.insert(1)
      heap1.meld(heap2)
      expect(heap1.size()).toBe(1)
      expect(heap2.size()).toBe(0)
    })

    it('should meld two non-empty heaps', () => {
      const heap1 = new SoftHeap<number>()
      const heap2 = new SoftHeap<number>()
      heap1.insert(1)
      heap1.insert(3)
      heap2.insert(2)
      heap2.insert(4)
      heap1.meld(heap2)
      expect(heap1.size()).toBe(4)
      expect(heap2.size()).toBe(0)
    })

    it('should clear the other heap after meld', () => {
      const heap1 = new SoftHeap<number>()
      const heap2 = new SoftHeap<number>()
      heap2.insert(10)
      heap2.insert(20)
      heap1.meld(heap2)
      expect(heap2.isEmpty()).toBe(true)
      expect(heap2.size()).toBe(0)
    })

    it('should extract all items after meld', () => {
      const heap1 = new SoftHeap<number>()
      const heap2 = new SoftHeap<number>()
      const items1 = [1, 3, 5]
      const items2 = [2, 4, 6]
      for (const item of items1) heap1.insert(item)
      for (const item of items2) heap2.insert(item)
      heap1.meld(heap2)
      const extracted: number[] = []
      while (!heap1.isEmpty()) {
        extracted.push(heap1.extractMin()!)
      }
      expect(extracted.length).toBe(6)
      expect(extracted.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('should handle meld of large heaps', () => {
      const heap1 = new SoftHeap<number>()
      const heap2 = new SoftHeap<number>()
      for (let i = 0; i < 100; i++) heap1.insert(i)
      for (let i = 100; i < 200; i++) heap2.insert(i)
      heap1.meld(heap2)
      expect(heap1.size()).toBe(200)
    })

    it('should handle meld with same error rates', () => {
      const heap1 = new SoftHeap<number>({ errorRate: 0.2 })
      const heap2 = new SoftHeap<number>({ errorRate: 0.2 })
      heap1.insert(1)
      heap2.insert(2)
      heap1.meld(heap2)
      expect(heap1.size()).toBe(2)
    })

    it('should handle self-meld of empty heap', () => {
      const heap = new SoftHeap<number>()
      const other = new SoftHeap<number>()
      heap.meld(other)
      expect(heap.size()).toBe(0)
    })

    it('should preserve all items through meld', () => {
      const heap1 = new SoftHeap<number>()
      const heap2 = new SoftHeap<number>()
      for (let i = 0; i < 50; i++) heap1.insert(i)
      for (let i = 50; i < 100; i++) heap2.insert(i)
      heap1.meld(heap2)
      const arr = heap1.toArray()
      expect(arr.length).toBe(100)
    })
  })

  describe('size and isEmpty', () => {
    it('should track size correctly', () => {
      const heap = new SoftHeap<number>()
      expect(heap.size()).toBe(0)
      heap.insert(1)
      expect(heap.size()).toBe(1)
      heap.insert(2)
      expect(heap.size()).toBe(2)
      heap.extractMin()
      expect(heap.size()).toBe(1)
      heap.extractMin()
      expect(heap.size()).toBe(0)
    })

    it('should track isEmpty correctly', () => {
      const heap = new SoftHeap<number>()
      expect(heap.isEmpty()).toBe(true)
      heap.insert(1)
      expect(heap.isEmpty()).toBe(false)
      heap.extractMin()
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle size after clear', () => {
      const heap = new SoftHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.clear()
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should track size through multiple operations', () => {
      const heap = new SoftHeap<number>()
      for (let i = 0; i < 10; i++) heap.insert(i)
      expect(heap.size()).toBe(10)
      for (let i = 0; i < 5; i++) heap.extractMin()
      expect(heap.size()).toBe(5)
    })
  })

  describe('clear', () => {
    it('should clear an empty heap', () => {
      const heap = new SoftHeap<number>()
      heap.clear()
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should clear a heap with items', () => {
      const heap = new SoftHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.clear()
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should allow operations after clear', () => {
      const heap = new SoftHeap<number>()
      heap.insert(1)
      heap.clear()
      heap.insert(2)
      expect(heap.size()).toBe(1)
      expect(heap.peek()).toBe(2)
    })

    it('should handle multiple clears', () => {
      const heap = new SoftHeap<number>()
      heap.insert(1)
      heap.clear()
      heap.clear()
      expect(heap.size()).toBe(0)
    })

    it('should handle insert after clear', () => {
      const heap = new SoftHeap<number>()
      for (let i = 0; i < 100; i++) heap.insert(i)
      heap.clear()
      heap.insert(42)
      expect(heap.size()).toBe(1)
      expect(heap.peek()).toBe(42)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty heap', () => {
      const heap = new SoftHeap<number>()
      expect(heap.toArray()).toEqual([])
    })

    it('should return single item', () => {
      const heap = new SoftHeap<number>()
      heap.insert(42)
      expect(heap.toArray()).toEqual([42])
    })

    it('should return all items', () => {
      const heap = new SoftHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      const arr = heap.toArray()
      expect(arr.length).toBe(3)
      expect(arr.sort((a, b) => a - b)).toEqual([1, 2, 3])
    })

    it('should not modify the heap', () => {
      const heap = new SoftHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.toArray()
      expect(heap.size()).toBe(2)
    })

    it('should return new array each time', () => {
      const heap = new SoftHeap<number>()
      heap.insert(1)
      const arr1 = heap.toArray()
      const arr2 = heap.toArray()
      expect(arr1).not.toBe(arr2)
    })

    it('should work after partial extraction', () => {
      const heap = new SoftHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.extractMin()
      const arr = heap.toArray()
      expect(arr.length).toBe(2)
    })

    it('should handle large heaps', () => {
      const heap = new SoftHeap<number>()
      for (let i = 0; i < 500; i++) heap.insert(i)
      const arr = heap.toArray()
      expect(arr.length).toBe(500)
    })
  })

  describe('clone', () => {
    it('should clone an empty heap', () => {
      const heap = new SoftHeap<number>()
      const cloned = heap.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should clone a heap with items', () => {
      const heap = new SoftHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      const cloned = heap.clone()
      expect(cloned.size()).toBe(3)
    })

    it('should not affect original when modifying clone', () => {
      const heap = new SoftHeap<number>()
      heap.insert(1)
      heap.insert(2)
      const cloned = heap.clone()
      cloned.extractMin()
      expect(heap.size()).toBe(2)
      expect(cloned.size()).toBe(1)
    })

    it('should not affect clone when modifying original', () => {
      const heap = new SoftHeap<number>()
      heap.insert(1)
      heap.insert(2)
      const cloned = heap.clone()
      heap.extractMin()
      expect(cloned.size()).toBe(2)
      expect(heap.size()).toBe(1)
    })

    it('should preserve error rate in clone', () => {
      const heap = new SoftHeap<number>({ errorRate: 0.5 })
      const cloned = heap.clone()
      expect(cloned.errorRate).toBe(0.5)
    })

    it('should clone heap with custom comparator', () => {
      const heap = new SoftHeap<{ val: number }>({
        comparator: (a, b) => a.val - b.val,
      })
      heap.insert({ val: 1 })
      const cloned = heap.clone()
      expect(cloned.size()).toBe(1)
    })

    it('should produce independent copies', () => {
      const heap = new SoftHeap<number>()
      for (let i = 0; i < 10; i++) heap.insert(i)
      const cloned = heap.clone()
      heap.clear()
      expect(cloned.size()).toBe(10)
    })

    it('should contain same items after clone', () => {
      const heap = new SoftHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      const cloned = heap.clone()
      const origArr = heap.toArray().sort((a, b) => a - b)
      const clonedArr = cloned.toArray().sort((a, b) => a - b)
      expect(origArr).toEqual(clonedArr)
    })
  })

  describe('errorRate', () => {
    it('should return default error rate', () => {
      const heap = new SoftHeap<number>()
      expect(heap.errorRate).toBe(0.1)
    })

    it('should return custom error rate', () => {
      const heap = new SoftHeap<number>({ errorRate: 0.5 })
      expect(heap.errorRate).toBe(0.5)
    })

    it('should be a getter', () => {
      const heap = new SoftHeap<number>()
      expect(typeof heap.errorRate).toBe('number')
    })

    it('should handle edge case error rate 0', () => {
      const heap = new SoftHeap<number>({ errorRate: 0 })
      const items = [5, 3, 1, 4, 2]
      for (const item of items) items
      for (const item of items) heap.insert(item)
      expect(heap.size()).toBe(5)
    })

    it('should work with high error rate', () => {
      const heap = new SoftHeap<number>({ errorRate: 0.9 })
      for (let i = 0; i < 20; i++) heap.insert(i)
      const results: number[] = []
      while (!heap.isEmpty()) results.push(heap.extractMin()!)
      expect(results.length).toBe(20)
    })
  })

  describe('edge cases', () => {
    it('should handle empty heap operations', () => {
      const heap = new SoftHeap<number>()
      expect(heap.peek()).toBeUndefined()
      expect(heap.extractMin()).toBeUndefined()
      expect(heap.toArray()).toEqual([])
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle single item operations', () => {
      const heap = new SoftHeap<number>()
      heap.insert(42)
      expect(heap.peek()).toBe(42)
      expect(heap.extractMin()).toBe(42)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle sorted input', () => {
      const heap = new SoftHeap<number>()
      for (let i = 0; i < 50; i++) heap.insert(i)
      const results: number[] = []
      while (!heap.isEmpty()) results.push(heap.extractMin()!)
      expect(results.length).toBe(50)
    })

    it('should handle reverse sorted input', () => {
      const heap = new SoftHeap<number>()
      for (let i = 49; i >= 0; i--) heap.insert(i)
      const results: number[] = []
      while (!heap.isEmpty()) results.push(heap.extractMin()!)
      expect(results.length).toBe(50)
    })

    it('should handle all same values', () => {
      const heap = new SoftHeap<number>()
      for (let i = 0; i < 10; i++) heap.insert(42)
      const results: number[] = []
      while (!heap.isEmpty()) results.push(heap.extractMin()!)
      expect(results).toEqual(Array(10).fill(42))
    })

    it('should handle two items', () => {
      const heap = new SoftHeap<number>()
      heap.insert(2)
      heap.insert(1)
      const results: number[] = []
      while (!heap.isEmpty()) results.push(heap.extractMin()!)
      expect(results.sort((a, b) => a - b)).toEqual([1, 2])
    })

    it('should handle three items', () => {
      const heap = new SoftHeap<number>()
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      const results: number[] = []
      while (!heap.isEmpty()) results.push(heap.extractMin()!)
      expect(results.length).toBe(3)
      expect(results.sort((a, b) => a - b)).toEqual([1, 2, 3])
    })

    it('should handle negative numbers', () => {
      const heap = new SoftHeap<number>()
      heap.insert(-5)
      heap.insert(-10)
      heap.insert(-1)
      const results: number[] = []
      while (!heap.isEmpty()) results.push(heap.extractMin()!)
      expect(results.length).toBe(3)
    })

    it('should handle mix of positive and negative', () => {
      const heap = new SoftHeap<number>()
      heap.insert(-5)
      heap.insert(5)
      heap.insert(0)
      const results: number[] = []
      while (!heap.isEmpty()) results.push(heap.extractMin()!)
      expect(results.sort((a, b) => a - b)).toEqual([-5, 0, 5])
    })

    it('should handle floating point numbers', () => {
      const heap = new SoftHeap<number>()
      heap.insert(1.5)
      heap.insert(0.5)
      heap.insert(2.5)
      expect(heap.size()).toBe(3)
    })

    it('should handle very large numbers', () => {
      const heap = new SoftHeap<number>()
      heap.insert(Number.MAX_SAFE_INTEGER)
      heap.insert(Number.MIN_SAFE_INTEGER)
      heap.insert(0)
      expect(heap.size()).toBe(3)
    })

    it('should handle power of 2 number of items', () => {
      const heap = new SoftHeap<number>()
      for (let i = 0; i < 64; i++) heap.insert(i)
      expect(heap.size()).toBe(64)
      const results: number[] = []
      while (!heap.isEmpty()) results.push(heap.extractMin()!)
      expect(results.length).toBe(64)
    })

    it('should handle non-power-of-2 number of items', () => {
      const heap = new SoftHeap<number>()
      for (let i = 0; i < 37; i++) heap.insert(i)
      expect(heap.size()).toBe(37)
    })

    it('should handle string comparison with custom comparator', () => {
      const heap = new SoftHeap<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      heap.insert('cherry')
      heap.insert('apple')
      heap.insert('banana')
      expect(heap.size()).toBe(3)
    })

    it('should handle insert after extract all', () => {
      const heap = new SoftHeap<number>()
      heap.insert(1)
      heap.extractMin()
      heap.insert(2)
      expect(heap.size()).toBe(1)
      expect(heap.peek()).toBe(2)
    })

    it('should handle clear after extract all', () => {
      const heap = new SoftHeap<number>()
      heap.insert(1)
      heap.extractMin()
      heap.clear()
      expect(heap.size()).toBe(0)
    })

    it('should handle meld after clear', () => {
      const heap1 = new SoftHeap<number>()
      const heap2 = new SoftHeap<number>()
      heap1.insert(1)
      heap1.clear()
      heap2.insert(2)
      heap1.meld(heap2)
      expect(heap1.size()).toBe(1)
    })

    it('should handle clone after extract all', () => {
      const heap = new SoftHeap<number>()
      heap.insert(1)
      heap.extractMin()
      const cloned = heap.clone()
      expect(cloned.size()).toBe(0)
    })
  })

  describe('approximate sorting property', () => {
    it('should return all items eventually', () => {
      const heap = new SoftHeap<number>()
      const items = Array.from({ length: 100 }, (_, i) => i)
      for (const item of items) heap.insert(item)
      const extracted: number[] = []
      while (!heap.isEmpty()) extracted.push(heap.extractMin()!)
      expect(extracted.length).toBe(100)
      expect([...extracted].sort((a, b) => a - b)).toEqual(
        Array.from({ length: 100 }, (_, i) => i),
      )
    })

    it('should maintain approximate sorted order for low error rate', () => {
      const heap = new SoftHeap<number>({ errorRate: 0.01 })
      const items = Array.from({ length: 50 }, () => Math.floor(Math.random() * 1000))
      for (const item of items) heap.insert(item)
      const extracted: number[] = []
      while (!heap.isEmpty()) extracted.push(heap.extractMin()!)
      expect(extracted.length).toBe(items.length)
      const sorted = [...items].sort((a, b) => a - b)
      expect([...extracted].sort((a, b) => a - b)).toEqual(sorted)
    })

    it('should maintain approximate sorted order for default error rate', () => {
      const heap = new SoftHeap<number>()
      const items = Array.from({ length: 30 }, (_, i) => 30 - i)
      for (const item of items) heap.insert(item)
      const extracted: number[] = []
      while (!heap.isEmpty()) extracted.push(heap.extractMin()!)
      expect(extracted.length).toBe(30)
      expect([...extracted].sort((a, b) => a - b)).toEqual(
        Array.from({ length: 30 }, (_, i) => i + 1),
      )
    })

    it('should work with error rate 0 (no corruption)', () => {
      const heap = new SoftHeap<number>({ errorRate: 0 })
      for (let i = 20; i >= 0; i--) heap.insert(i)
      const results: number[] = []
      while (!heap.isEmpty()) results.push(heap.extractMin()!)
      expect(results.length).toBe(21)
    })

    it('should work with error rate 1', () => {
      const heap = new SoftHeap<number>({ errorRate: 1 })
      const items = [1, 2, 3, 4, 5]
      for (const item of items) heap.insert(item)
      const results: number[] = []
      while (!heap.isEmpty()) results.push(heap.extractMin()!)
      expect(results.length).toBe(5)
      expect([...results].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('large datasets', () => {
    it('should handle 1000 items', () => {
      const heap = new SoftHeap<number>()
      for (let i = 0; i < 1000; i++) heap.insert(i)
      expect(heap.size()).toBe(1000)
      const extracted: number[] = []
      while (!heap.isEmpty()) extracted.push(heap.extractMin()!)
      expect(extracted.length).toBe(1000)
    })

    it('should handle 5000 items', () => {
      const heap = new SoftHeap<number>()
      for (let i = 0; i < 5000; i++) heap.insert(i)
      expect(heap.size()).toBe(5000)
      const extracted: number[] = []
      while (!heap.isEmpty()) extracted.push(heap.extractMin()!)
      expect(extracted.length).toBe(5000)
    })

    it('should handle shuffled large dataset', () => {
      const heap = new SoftHeap<number>()
      const items = Array.from({ length: 500 }, (_, i) => i)
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[items[i], items[j]] = [items[j]!, items[i]!]
      }
      for (const item of items) heap.insert(item)
      const extracted: number[] = []
      while (!heap.isEmpty()) extracted.push(heap.extractMin()!)
      expect(extracted.length).toBe(500)
      expect([...extracted].sort((a, b) => a - b)).toEqual(
        Array.from({ length: 500 }, (_, i) => i),
      )
    })

    it('should handle meld of large datasets', () => {
      const heap1 = new SoftHeap<number>()
      const heap2 = new SoftHeap<number>()
      for (let i = 0; i < 500; i++) heap1.insert(i)
      for (let i = 500; i < 1000; i++) heap2.insert(i)
      heap1.meld(heap2)
      expect(heap1.size()).toBe(1000)
      const extracted: number[] = []
      while (!heap1.isEmpty()) extracted.push(heap1.extractMin()!)
      expect(extracted.length).toBe(1000)
    })

    it('should handle large dataset with custom comparator', () => {
      const heap = new SoftHeap<{ id: number }>({
        comparator: (a, b) => a.id - b.id,
      })
      for (let i = 0; i < 200; i++) heap.insert({ id: i })
      expect(heap.size()).toBe(200)
    })

    it('should handle clone of large heap', () => {
      const heap = new SoftHeap<number>()
      for (let i = 0; i < 500; i++) heap.insert(i)
      const cloned = heap.clone()
      expect(cloned.size()).toBe(500)
      expect(heap.size()).toBe(500)
    })

    it('should handle toArray on large heap', () => {
      const heap = new SoftHeap<number>()
      for (let i = 0; i < 300; i++) heap.insert(i)
      const arr = heap.toArray()
      expect(arr.length).toBe(300)
    })

    it('should handle clear on large heap', () => {
      const heap = new SoftHeap<number>()
      for (let i = 0; i < 1000; i++) heap.insert(i)
      heap.clear()
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })
  })

  describe('custom comparator', () => {
    it('should sort objects by property', () => {
      const heap = new SoftHeap<{ val: number }>({
        comparator: (a, b) => a.val - b.val,
      })
      heap.insert({ val: 3 })
      heap.insert({ val: 1 })
      heap.insert({ val: 2 })
      const results: { val: number }[] = []
      while (!heap.isEmpty()) results.push(heap.extractMin()!)
      expect(results.map((r) => r.val).sort((a, b) => a - b)).toEqual([1, 2, 3])
    })

    it('should handle reverse comparator', () => {
      const heap = new SoftHeap<number>({
        comparator: (a, b) => b - a,
      })
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      const results: number[] = []
      while (!heap.isEmpty()) results.push(heap.extractMin()!)
      expect(results.length).toBe(3)
    })

    it('should handle string comparator', () => {
      const heap = new SoftHeap<string>({
        comparator: (a, b) => a.length - b.length,
      })
      heap.insert('aaa')
      heap.insert('b')
      heap.insert('cc')
      const results: string[] = []
      while (!heap.isEmpty()) results.push(heap.extractMin()!)
      expect(results.map((s) => s.length).sort((a, b) => a - b)).toEqual([1, 2, 3])
    })

    it('should handle complex objects', () => {
      interface Item {
        priority: number
        name: string
      }
      const heap = new SoftHeap<Item>({
        comparator: (a, b) => a.priority - b.priority,
      })
      heap.insert({ priority: 3, name: 'low' })
      heap.insert({ priority: 1, name: 'high' })
      heap.insert({ priority: 2, name: 'medium' })
      expect(heap.size()).toBe(3)
    })
  })

  describe('meld edge cases', () => {
    it('should handle meld then extract', () => {
      const heap1 = new SoftHeap<number>()
      const heap2 = new SoftHeap<number>()
      heap1.insert(3)
      heap2.insert(1)
      heap1.meld(heap2)
      const val = heap1.extractMin()
      expect(val).toBeDefined()
      expect(heap1.size()).toBe(1)
    })

    it('should handle meld of heaps with many items', () => {
      const heap1 = new SoftHeap<number>()
      const heap2 = new SoftHeap<number>()
      for (let i = 0; i < 100; i++) {
        heap1.insert(i * 2)
        heap2.insert(i * 2 + 1)
      }
      heap1.meld(heap2)
      expect(heap1.size()).toBe(200)
      const extracted: number[] = []
      while (!heap1.isEmpty()) extracted.push(heap1.extractMin()!)
      expect(extracted.length).toBe(200)
    })

    it('should handle meld then clone', () => {
      const heap1 = new SoftHeap<number>()
      const heap2 = new SoftHeap<number>()
      heap1.insert(1)
      heap2.insert(2)
      heap1.meld(heap2)
      const cloned = heap1.clone()
      expect(cloned.size()).toBe(2)
    })

    it('should handle meld then toArray', () => {
      const heap1 = new SoftHeap<number>()
      const heap2 = new SoftHeap<number>()
      heap1.insert(1)
      heap2.insert(2)
      heap1.meld(heap2)
      const arr = heap1.toArray()
      expect(arr.length).toBe(2)
    })
  })

  describe('complex operations', () => {
    it('should handle interleaved operations', () => {
      const heap = new SoftHeap<number>()
      heap.insert(5)
      heap.insert(3)
      expect(heap.extractMin()).toBeDefined()
      heap.insert(7)
      heap.insert(1)
      expect(heap.size()).toBe(3)
      const cloned = heap.clone()
      expect(cloned.size()).toBe(3)
      heap.clear()
      expect(heap.size()).toBe(0)
      expect(cloned.size()).toBe(3)
    })

    it('should handle stress pattern', () => {
      const heap = new SoftHeap<number>()
      for (let round = 0; round < 5; round++) {
        for (let i = 0; i < 20; i++) heap.insert(Math.floor(Math.random() * 100))
        for (let i = 0; i < 10; i++) heap.extractMin()
      }
      expect(heap.size()).toBe(50)
    })

    it('should handle clone-then-meld', () => {
      const heap1 = new SoftHeap<number>()
      for (let i = 0; i < 10; i++) heap1.insert(i)
      const cloned = heap1.clone()
      const heap2 = new SoftHeap<number>()
      for (let i = 10; i < 20; i++) heap2.insert(i)
      cloned.meld(heap2)
      expect(cloned.size()).toBe(20)
      expect(heap1.size()).toBe(10)
    })

    it('should handle repeated insert and extract', () => {
      const heap = new SoftHeap<number>()
      for (let i = 0; i < 50; i++) {
        heap.insert(i)
        if (i % 3 === 0) heap.extractMin()
      }
      expect(heap.size()).toBeLessThanOrEqual(50)
    })

    it('should handle toArray during operations', () => {
      const heap = new SoftHeap<number>()
      heap.insert(1)
      heap.insert(2)
      const arr1 = heap.toArray()
      expect(arr1.length).toBe(2)
      heap.extractMin()
      const arr2 = heap.toArray()
      expect(arr2.length).toBe(1)
    })
  })
})
