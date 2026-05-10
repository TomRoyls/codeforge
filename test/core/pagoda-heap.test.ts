import { describe, it, expect, beforeEach } from 'vitest'
import { PagodaHeap } from '../../src/core/pagoda-heap/pagoda-heap.js'
import type { PagodaHeapOptions } from '../../src/core/pagoda-heap/types.js'

describe('PagodaHeap', () => {
  describe('constructor', () => {
    it('should create an empty heap with default options', () => {
      const heap = new PagodaHeap<number>()
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should create a heap with custom comparator (max-heap)', () => {
      const heap = new PagodaHeap<number>({ comparator: (a, b) => b - a })
      heap.push(1)
      heap.push(3)
      heap.push(2)
      expect(heap.peek()).toBe(3)
    })

    it('should create a heap with empty options object', () => {
      const heap = new PagodaHeap<number>({})
      heap.push(5)
      expect(heap.peek()).toBe(5)
    })

    it('should work with undefined options', () => {
      const heap = new PagodaHeap<number>(undefined)
      heap.push(10)
      expect(heap.peek()).toBe(10)
    })

    it('should default to min-heap behavior', () => {
      const heap = new PagodaHeap<number>()
      heap.push(5)
      heap.push(1)
      heap.push(3)
      expect(heap.peek()).toBe(1)
    })

    it('should work with string values', () => {
      const heap = new PagodaHeap<string>()
      heap.push('banana')
      heap.push('apple')
      heap.push('cherry')
      expect(heap.peek()).toBe('apple')
    })

    it('should work with object values using custom comparator', () => {
      const heap = new PagodaHeap<{ priority: number }>({
        comparator: (a, b) => a.priority - b.priority,
      })
      heap.push({ priority: 3 })
      heap.push({ priority: 1 })
      heap.push({ priority: 2 })
      expect(heap.peek().priority).toBe(1)
    })
  })

  describe('push', () => {
    let heap: PagodaHeap<number>

    beforeEach(() => {
      heap = new PagodaHeap<number>()
    })

    it('should add a single element', () => {
      heap.push(5)
      expect(heap.size()).toBe(1)
      expect(heap.peek()).toBe(5)
    })

    it('should add multiple elements in order', () => {
      heap.push(1)
      heap.push(2)
      heap.push(3)
      expect(heap.size()).toBe(3)
      expect(heap.peek()).toBe(1)
    })

    it('should add multiple elements in reverse order', () => {
      heap.push(3)
      heap.push(2)
      heap.push(1)
      expect(heap.size()).toBe(3)
      expect(heap.peek()).toBe(1)
    })

    it('should maintain min at root after each push', () => {
      heap.push(5)
      expect(heap.peek()).toBe(5)
      heap.push(3)
      expect(heap.peek()).toBe(3)
      heap.push(7)
      expect(heap.peek()).toBe(3)
      heap.push(1)
      expect(heap.peek()).toBe(1)
      heap.push(2)
      expect(heap.peek()).toBe(1)
    })

    it('should handle duplicate values', () => {
      heap.push(5)
      heap.push(5)
      heap.push(5)
      expect(heap.size()).toBe(3)
      expect(heap.peek()).toBe(5)
    })

    it('should handle negative numbers', () => {
      heap.push(-1)
      heap.push(-5)
      heap.push(3)
      expect(heap.peek()).toBe(-5)
    })

    it('should handle zero', () => {
      heap.push(0)
      heap.push(-1)
      heap.push(1)
      expect(heap.peek()).toBe(-1)
    })

    it('should handle floating point numbers', () => {
      heap.push(1.5)
      heap.push(0.3)
      heap.push(2.7)
      expect(heap.peek()).toBeCloseTo(0.3)
    })
  })

  describe('pop', () => {
    let heap: PagodaHeap<number>

    beforeEach(() => {
      heap = new PagodaHeap<number>()
    })

    it('should throw on empty heap', () => {
      expect(() => heap.pop()).toThrow('Heap is empty')
    })

    it('should return the single element', () => {
      heap.push(5)
      expect(heap.pop()).toBe(5)
      expect(heap.size()).toBe(0)
    })

    it('should return elements in sorted order', () => {
      heap.push(3)
      heap.push(1)
      heap.push(2)
      expect(heap.pop()).toBe(1)
      expect(heap.pop()).toBe(2)
      expect(heap.pop()).toBe(3)
    })

    it('should return elements in sorted order for larger set', () => {
      const values = [5, 3, 7, 1, 4, 6, 2]
      for (const v of values) heap.push(v)
      const result: number[] = []
      while (!heap.isEmpty()) result.push(heap.pop())
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7])
    })

    it('should handle duplicate values', () => {
      heap.push(1)
      heap.push(1)
      heap.push(2)
      expect(heap.pop()).toBe(1)
      expect(heap.pop()).toBe(1)
      expect(heap.pop()).toBe(2)
    })

    it('should maintain heap property after each pop', () => {
      heap.push(5)
      heap.push(3)
      heap.push(7)
      heap.push(1)
      heap.push(4)
      expect(heap.pop()).toBe(1)
      expect(heap.peek()).toBe(3)
      expect(heap.pop()).toBe(3)
      expect(heap.peek()).toBe(4)
    })

    it('should handle alternating push and pop', () => {
      heap.push(5)
      expect(heap.pop()).toBe(5)
      heap.push(3)
      heap.push(1)
      expect(heap.pop()).toBe(1)
      expect(heap.pop()).toBe(3)
    })
  })

  describe('peek', () => {
    let heap: PagodaHeap<number>

    beforeEach(() => {
      heap = new PagodaHeap<number>()
    })

    it('should throw on empty heap', () => {
      expect(() => heap.peek()).toThrow('Heap is empty')
    })

    it('should return the minimum element', () => {
      heap.push(3)
      heap.push(1)
      heap.push(2)
      expect(heap.peek()).toBe(1)
    })

    it('should not remove the element', () => {
      heap.push(1)
      expect(heap.peek()).toBe(1)
      expect(heap.size()).toBe(1)
      expect(heap.peek()).toBe(1)
    })

    it('should update when min is removed', () => {
      heap.push(3)
      heap.push(1)
      heap.push(2)
      heap.pop()
      expect(heap.peek()).toBe(2)
    })
  })

  describe('merge', () => {
    it('should merge two non-empty heaps', () => {
      const heap1 = new PagodaHeap<number>()
      heap1.push(1)
      heap1.push(3)
      const heap2 = new PagodaHeap<number>()
      heap2.push(2)
      heap2.push(4)
      heap1.merge(heap2)
      expect(heap1.size()).toBe(4)
      expect(heap2.size()).toBe(0)
      expect(heap2.isEmpty()).toBe(true)
    })

    it('should maintain sorted order after merge', () => {
      const heap1 = new PagodaHeap<number>()
      heap1.push(1)
      heap1.push(5)
      const heap2 = new PagodaHeap<number>()
      heap2.push(2)
      heap2.push(3)
      heap2.push(4)
      heap1.merge(heap2)
      const result: number[] = []
      while (!heap1.isEmpty()) result.push(heap1.pop())
      expect(result).toEqual([1, 2, 3, 4, 5])
    })

    it('should merge with empty heap (other is empty)', () => {
      const heap1 = new PagodaHeap<number>()
      heap1.push(1)
      heap1.push(2)
      const heap2 = new PagodaHeap<number>()
      heap1.merge(heap2)
      expect(heap1.size()).toBe(2)
      expect(heap1.pop()).toBe(1)
      expect(heap1.pop()).toBe(2)
    })

    it('should merge into empty heap (this is empty)', () => {
      const heap1 = new PagodaHeap<number>()
      const heap2 = new PagodaHeap<number>()
      heap2.push(1)
      heap2.push(2)
      heap1.merge(heap2)
      expect(heap1.size()).toBe(2)
      expect(heap1.pop()).toBe(1)
      expect(heap1.pop()).toBe(2)
    })

    it('should merge two empty heaps', () => {
      const heap1 = new PagodaHeap<number>()
      const heap2 = new PagodaHeap<number>()
      heap1.merge(heap2)
      expect(heap1.size()).toBe(0)
      expect(heap1.isEmpty()).toBe(true)
    })

    it('should be destructive for the other heap', () => {
      const heap1 = new PagodaHeap<number>()
      heap1.push(1)
      const heap2 = new PagodaHeap<number>()
      heap2.push(2)
      heap2.push(3)
      heap1.merge(heap2)
      expect(heap2.size()).toBe(0)
      expect(heap2.isEmpty()).toBe(true)
    })

    it('should handle merge with self (no-op)', () => {
      const heap = new PagodaHeap<number>()
      heap.push(1)
      heap.push(2)
      heap.merge(heap)
      expect(heap.size()).toBe(2)
      expect(heap.pop()).toBe(1)
      expect(heap.pop()).toBe(2)
    })

    it('should merge heaps with overlapping values', () => {
      const heap1 = new PagodaHeap<number>()
      heap1.push(1)
      heap1.push(3)
      heap1.push(5)
      const heap2 = new PagodaHeap<number>()
      heap2.push(2)
      heap2.push(3)
      heap2.push(4)
      heap1.merge(heap2)
      expect(heap1.size()).toBe(6)
      const result: number[] = []
      while (!heap1.isEmpty()) result.push(heap1.pop())
      expect(result).toEqual([1, 2, 3, 3, 4, 5])
    })

    it('should merge single element heaps', () => {
      const heap1 = new PagodaHeap<number>()
      heap1.push(2)
      const heap2 = new PagodaHeap<number>()
      heap2.push(1)
      heap1.merge(heap2)
      expect(heap1.size()).toBe(2)
      expect(heap1.pop()).toBe(1)
      expect(heap1.pop()).toBe(2)
    })

    it('should handle multiple sequential merges', () => {
      const heap1 = new PagodaHeap<number>()
      heap1.push(1)
      const heap2 = new PagodaHeap<number>()
      heap2.push(2)
      const heap3 = new PagodaHeap<number>()
      heap3.push(3)
      heap1.merge(heap2)
      heap1.merge(heap3)
      expect(heap1.size()).toBe(3)
      expect(heap1.pop()).toBe(1)
      expect(heap1.pop()).toBe(2)
      expect(heap1.pop()).toBe(3)
    })
  })

  describe('size', () => {
    it('should return 0 for new heap', () => {
      const heap = new PagodaHeap<number>()
      expect(heap.size()).toBe(0)
    })

    it('should return correct size after pushes', () => {
      const heap = new PagodaHeap<number>()
      heap.push(1)
      expect(heap.size()).toBe(1)
      heap.push(2)
      expect(heap.size()).toBe(2)
      heap.push(3)
      expect(heap.size()).toBe(3)
    })

    it('should return correct size after pops', () => {
      const heap = new PagodaHeap<number>()
      heap.push(1)
      heap.push(2)
      heap.push(3)
      heap.pop()
      expect(heap.size()).toBe(2)
      heap.pop()
      expect(heap.size()).toBe(1)
      heap.pop()
      expect(heap.size()).toBe(0)
    })

    it('should return correct size after clear', () => {
      const heap = new PagodaHeap<number>()
      heap.push(1)
      heap.push(2)
      heap.clear()
      expect(heap.size()).toBe(0)
    })

    it('should return correct size after merge', () => {
      const heap1 = new PagodaHeap<number>()
      heap1.push(1)
      heap1.push(2)
      const heap2 = new PagodaHeap<number>()
      heap2.push(3)
      heap2.push(4)
      heap1.merge(heap2)
      expect(heap1.size()).toBe(4)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new heap', () => {
      const heap = new PagodaHeap<number>()
      expect(heap.isEmpty()).toBe(true)
    })

    it('should return false after push', () => {
      const heap = new PagodaHeap<number>()
      heap.push(1)
      expect(heap.isEmpty()).toBe(false)
    })

    it('should return true after removing all elements', () => {
      const heap = new PagodaHeap<number>()
      heap.push(1)
      heap.pop()
      expect(heap.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      const heap = new PagodaHeap<number>()
      heap.push(1)
      heap.push(2)
      heap.clear()
      expect(heap.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear an empty heap', () => {
      const heap = new PagodaHeap<number>()
      heap.clear()
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should clear a heap with elements', () => {
      const heap = new PagodaHeap<number>()
      heap.push(1)
      heap.push(2)
      heap.push(3)
      heap.clear()
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should allow push after clear', () => {
      const heap = new PagodaHeap<number>()
      heap.push(1)
      heap.clear()
      heap.push(2)
      expect(heap.size()).toBe(1)
      expect(heap.peek()).toBe(2)
    })

    it('should allow pop after clear and push', () => {
      const heap = new PagodaHeap<number>()
      heap.push(1)
      heap.clear()
      heap.push(2)
      expect(heap.pop()).toBe(2)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty heap', () => {
      const heap = new PagodaHeap<number>()
      expect(heap.toArray()).toEqual([])
    })

    it('should return sorted array for single element', () => {
      const heap = new PagodaHeap<number>()
      heap.push(5)
      expect(heap.toArray()).toEqual([5])
    })

    it('should return sorted array for multiple elements', () => {
      const heap = new PagodaHeap<number>()
      heap.push(3)
      heap.push(1)
      heap.push(2)
      expect(heap.toArray()).toEqual([1, 2, 3])
    })

    it('should return sorted array with duplicates', () => {
      const heap = new PagodaHeap<number>()
      heap.push(2)
      heap.push(1)
      heap.push(2)
      heap.push(1)
      expect(heap.toArray()).toEqual([1, 1, 2, 2])
    })

    it('should not modify the heap', () => {
      const heap = new PagodaHeap<number>()
      heap.push(3)
      heap.push(1)
      heap.push(2)
      const arr = heap.toArray()
      expect(arr).toEqual([1, 2, 3])
      expect(heap.size()).toBe(3)
      expect(heap.peek()).toBe(1)
    })

    it('should return sorted array after partial pops', () => {
      const heap = new PagodaHeap<number>()
      heap.push(3)
      heap.push(1)
      heap.push(4)
      heap.push(2)
      heap.pop()
      expect(heap.toArray()).toEqual([2, 3, 4])
    })
  })

  describe('contains', () => {
    let heap: PagodaHeap<number>

    beforeEach(() => {
      heap = new PagodaHeap<number>()
      heap.push(3)
      heap.push(1)
      heap.push(4)
      heap.push(1)
      heap.push(5)
    })

    it('should find existing element', () => {
      expect(heap.contains(3)).toBe(true)
    })

    it('should find minimum element', () => {
      expect(heap.contains(1)).toBe(true)
    })

    it('should find maximum element', () => {
      expect(heap.contains(5)).toBe(true)
    })

    it('should not find non-existing element', () => {
      expect(heap.contains(2)).toBe(false)
    })

    it('should return false for empty heap', () => {
      const empty = new PagodaHeap<number>()
      expect(empty.contains(1)).toBe(false)
    })

    it('should find element after pop', () => {
      heap.pop()
      expect(heap.contains(3)).toBe(true)
      expect(heap.contains(4)).toBe(true)
      expect(heap.contains(5)).toBe(true)
    })

    it('should not find removed element', () => {
      heap.remove(3)
      expect(heap.contains(3)).toBe(false)
    })
  })

  describe('remove', () => {
    let heap: PagodaHeap<number>

    beforeEach(() => {
      heap = new PagodaHeap<number>()
      heap.push(3)
      heap.push(1)
      heap.push(4)
      heap.push(2)
      heap.push(5)
    })

    it('should remove an existing element', () => {
      expect(heap.remove(3)).toBe(true)
      expect(heap.size()).toBe(4)
      expect(heap.contains(3)).toBe(false)
    })

    it('should remove the minimum element', () => {
      expect(heap.remove(1)).toBe(true)
      expect(heap.size()).toBe(4)
      expect(heap.peek()).toBe(2)
    })

    it('should remove the maximum element', () => {
      expect(heap.remove(5)).toBe(true)
      expect(heap.size()).toBe(4)
    })

    it('should return false for non-existing element', () => {
      expect(heap.remove(10)).toBe(false)
      expect(heap.size()).toBe(5)
    })

    it('should return false for empty heap', () => {
      const empty = new PagodaHeap<number>()
      expect(empty.remove(1)).toBe(false)
    })

    it('should maintain sorted order after removal', () => {
      heap.remove(3)
      const result: number[] = []
      while (!heap.isEmpty()) result.push(heap.pop())
      expect(result).toEqual([1, 2, 4, 5])
    })

    it('should remove and maintain order when removing multiple', () => {
      heap.remove(1)
      heap.remove(5)
      const result: number[] = []
      while (!heap.isEmpty()) result.push(heap.pop())
      expect(result).toEqual([2, 3, 4])
    })

    it('should handle removing single element heap', () => {
      const single = new PagodaHeap<number>()
      single.push(42)
      expect(single.remove(42)).toBe(true)
      expect(single.size()).toBe(0)
      expect(single.isEmpty()).toBe(true)
    })

    it('should remove from heap with two elements', () => {
      const two = new PagodaHeap<number>()
      two.push(1)
      two.push(2)
      expect(two.remove(1)).toBe(true)
      expect(two.size()).toBe(1)
      expect(two.peek()).toBe(2)
    })

    it('should handle removing last element', () => {
      const small = new PagodaHeap<number>()
      small.push(1)
      small.push(2)
      small.push(3)
      small.pop()
      small.pop()
      expect(small.remove(3)).toBe(true)
      expect(small.isEmpty()).toBe(true)
    })
  })

  describe('decreaseKey', () => {
    let heap: PagodaHeap<number>

    beforeEach(() => {
      heap = new PagodaHeap<number>()
      heap.push(5)
      heap.push(3)
      heap.push(7)
      heap.push(1)
    })

    it('should decrease key of existing element', () => {
      expect(heap.decreaseKey(5, 0)).toBe(true)
      expect(heap.peek()).toBe(0)
    })

    it('should return false for non-existing element', () => {
      expect(heap.decreaseKey(10, 0)).toBe(false)
    })

    it('should return false for empty heap', () => {
      const empty = new PagodaHeap<number>()
      expect(empty.decreaseKey(1, 0)).toBe(false)
    })

    it('should update the element value', () => {
      heap.decreaseKey(7, 2)
      const arr = heap.toArray()
      expect(arr).toContain(2)
      expect(arr).not.toContain(7)
    })

    it('should maintain sorted order after decreaseKey', () => {
      heap.decreaseKey(5, 0)
      const result: number[] = []
      while (!heap.isEmpty()) result.push(heap.pop())
      expect(result).toEqual([0, 1, 3, 7])
    })

    it('should handle decreasing root', () => {
      expect(heap.decreaseKey(1, 0)).toBe(true)
      expect(heap.peek()).toBe(0)
    })

    it('should handle decreaseKey on single element', () => {
      const single = new PagodaHeap<number>()
      single.push(5)
      expect(single.decreaseKey(5, 1)).toBe(true)
      expect(single.peek()).toBe(1)
    })

    it('should work with same priority value', () => {
      expect(heap.decreaseKey(5, 5)).toBe(true)
      expect(heap.size()).toBe(4)
    })
  })

  describe('clone', () => {
    it('should clone an empty heap', () => {
      const heap = new PagodaHeap<number>()
      const cloned = heap.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should clone a heap with elements', () => {
      const heap = new PagodaHeap<number>()
      heap.push(3)
      heap.push(1)
      heap.push(2)
      const cloned = heap.clone()
      expect(cloned.size()).toBe(3)
      expect(cloned.peek()).toBe(1)
    })

    it('should produce independent copy', () => {
      const heap = new PagodaHeap<number>()
      heap.push(3)
      heap.push(1)
      heap.push(2)
      const cloned = heap.clone()
      heap.pop()
      expect(heap.size()).toBe(2)
      expect(cloned.size()).toBe(3)
    })

    it('should preserve comparator', () => {
      const heap = new PagodaHeap<number>({ comparator: (a, b) => b - a })
      heap.push(1)
      heap.push(3)
      heap.push(2)
      const cloned = heap.clone()
      expect(cloned.peek()).toBe(3)
      cloned.push(5)
      expect(cloned.peek()).toBe(5)
    })

    it('should clone correctly after operations', () => {
      const heap = new PagodaHeap<number>()
      heap.push(5)
      heap.push(3)
      heap.push(7)
      heap.push(1)
      heap.pop()
      const cloned = heap.clone()
      expect(cloned.toArray()).toEqual([3, 5, 7])
    })

    it('should not affect original when modifying clone', () => {
      const heap = new PagodaHeap<number>()
      heap.push(1)
      heap.push(2)
      const cloned = heap.clone()
      cloned.push(0)
      expect(heap.size()).toBe(2)
      expect(cloned.size()).toBe(3)
    })
  })

  describe('fromArray', () => {
    it('should create heap from empty array', () => {
      const heap = PagodaHeap.fromArray([] as number[])
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should create heap from single element array', () => {
      const heap = PagodaHeap.fromArray([5])
      expect(heap.size()).toBe(1)
      expect(heap.peek()).toBe(5)
    })

    it('should create heap from sorted array', () => {
      const heap = PagodaHeap.fromArray([1, 2, 3, 4, 5])
      expect(heap.size()).toBe(5)
      expect(heap.peek()).toBe(1)
    })

    it('should create heap from reverse sorted array', () => {
      const heap = PagodaHeap.fromArray([5, 4, 3, 2, 1])
      expect(heap.size()).toBe(5)
      expect(heap.peek()).toBe(1)
    })

    it('should create heap from random array', () => {
      const heap = PagodaHeap.fromArray([3, 1, 4, 1, 5, 9, 2, 6])
      expect(heap.size()).toBe(8)
      expect(heap.peek()).toBe(1)
      const result: number[] = []
      while (!heap.isEmpty()) result.push(heap.pop())
      expect(result).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
    })

    it('should create heap with custom comparator', () => {
      const heap = PagodaHeap.fromArray([1, 2, 3, 4, 5], {
        comparator: (a, b) => b - a,
      })
      expect(heap.peek()).toBe(5)
      expect(heap.pop()).toBe(5)
      expect(heap.pop()).toBe(4)
    })

    it('should create independent heap', () => {
      const arr = [3, 1, 2]
      const heap = PagodaHeap.fromArray(arr)
      arr.push(0)
      expect(heap.size()).toBe(3)
    })

    it('should handle array with duplicates', () => {
      const heap = PagodaHeap.fromArray([2, 2, 2, 1, 1])
      const result: number[] = []
      while (!heap.isEmpty()) result.push(heap.pop())
      expect(result).toEqual([1, 1, 2, 2, 2])
    })
  })

  describe('custom comparator (max-heap)', () => {
    let heap: PagodaHeap<number>

    beforeEach(() => {
      heap = new PagodaHeap<number>({ comparator: (a, b) => b - a })
    })

    it('should keep max element at top', () => {
      heap.push(1)
      heap.push(5)
      heap.push(3)
      expect(heap.peek()).toBe(5)
    })

    it('should pop in descending order', () => {
      heap.push(1)
      heap.push(3)
      heap.push(2)
      expect(heap.pop()).toBe(3)
      expect(heap.pop()).toBe(2)
      expect(heap.pop()).toBe(1)
    })

    it('should toArray in descending order', () => {
      heap.push(1)
      heap.push(3)
      heap.push(2)
      expect(heap.toArray()).toEqual([3, 2, 1])
    })

    it('should merge correctly with max-heap comparator', () => {
      heap.push(5)
      heap.push(3)
      const other = new PagodaHeap<number>({ comparator: (a, b) => b - a })
      other.push(4)
      other.push(2)
      heap.merge(other)
      expect(heap.size()).toBe(4)
      expect(heap.pop()).toBe(5)
      expect(heap.pop()).toBe(4)
      expect(heap.pop()).toBe(3)
      expect(heap.pop()).toBe(2)
    })

    it('should clone with max-heap comparator', () => {
      heap.push(1)
      heap.push(5)
      heap.push(3)
      const cloned = heap.clone()
      expect(cloned.peek()).toBe(5)
      expect(cloned.pop()).toBe(5)
    })

    it('should decreaseKey correctly in max-heap', () => {
      heap.push(3)
      heap.push(5)
      heap.push(1)
      heap.decreaseKey(1, 10)
      expect(heap.peek()).toBe(10)
    })

    it('should remove correctly in max-heap', () => {
      heap.push(3)
      heap.push(5)
      heap.push(1)
      heap.remove(5)
      expect(heap.peek()).toBe(3)
    })
  })

  describe('edge cases', () => {
    it('should handle single element operations', () => {
      const heap = new PagodaHeap<number>()
      heap.push(42)
      expect(heap.peek()).toBe(42)
      expect(heap.pop()).toBe(42)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle push after pop to empty', () => {
      const heap = new PagodaHeap<number>()
      heap.push(1)
      heap.pop()
      heap.push(2)
      expect(heap.peek()).toBe(2)
      expect(heap.pop()).toBe(2)
    })

    it('should handle repeated push-pop cycles', () => {
      const heap = new PagodaHeap<number>()
      for (let i = 0; i < 10; i++) {
        heap.push(i)
        expect(heap.pop()).toBe(i)
        expect(heap.isEmpty()).toBe(true)
      }
    })

    it('should handle two elements push-pop', () => {
      const heap = new PagodaHeap<number>()
      heap.push(2)
      heap.push(1)
      expect(heap.pop()).toBe(1)
      expect(heap.pop()).toBe(2)
    })

    it('should handle negative numbers correctly', () => {
      const heap = new PagodaHeap<number>()
      heap.push(-5)
      heap.push(-1)
      heap.push(-3)
      expect(heap.pop()).toBe(-5)
      expect(heap.pop()).toBe(-3)
      expect(heap.pop()).toBe(-1)
    })

    it('should handle all same elements', () => {
      const heap = new PagodaHeap<number>()
      for (let i = 0; i < 5; i++) heap.push(7)
      while (!heap.isEmpty()) expect(heap.pop()).toBe(7)
    })

    it('should handle string comparison', () => {
      const heap = new PagodaHeap<string>()
      heap.push('delta')
      heap.push('alpha')
      heap.push('charlie')
      heap.push('bravo')
      expect(heap.pop()).toBe('alpha')
      expect(heap.pop()).toBe('bravo')
      expect(heap.pop()).toBe('charlie')
      expect(heap.pop()).toBe('delta')
    })
  })

  describe('large datasets', () => {
    it('should handle 100 elements sorted', () => {
      const heap = new PagodaHeap<number>()
      for (let i = 0; i < 100; i++) heap.push(i)
      expect(heap.size()).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(heap.pop()).toBe(i)
      }
    })

    it('should handle 100 elements reverse sorted', () => {
      const heap = new PagodaHeap<number>()
      for (let i = 99; i >= 0; i--) heap.push(i)
      for (let i = 0; i < 100; i++) {
        expect(heap.pop()).toBe(i)
      }
    })

    it('should handle 1000 elements', () => {
      const heap = new PagodaHeap<number>()
      const values = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 10000))
      for (const v of values) heap.push(v)
      values.sort((a, b) => a - b)
      for (const v of values) {
        expect(heap.pop()).toBe(v)
      }
    })

    it('should handle 500 elements with merge', () => {
      const heap1 = new PagodaHeap<number>()
      const heap2 = new PagodaHeap<number>()
      for (let i = 0; i < 250; i++) {
        heap1.push(i * 2)
        heap2.push(i * 2 + 1)
      }
      heap1.merge(heap2)
      expect(heap1.size()).toBe(500)
      for (let i = 0; i < 500; i++) {
        expect(heap1.pop()).toBe(i)
      }
    })

    it('should handle fromArray with large dataset', () => {
      const values = Array.from({ length: 500 }, (_, i) => 500 - i)
      const heap = PagodaHeap.fromArray(values)
      for (let i = 1; i <= 500; i++) {
        expect(heap.pop()).toBe(i)
      }
    })

    it('should handle toArray with large dataset', () => {
      const heap = new PagodaHeap<number>()
      for (let i = 100; i >= 1; i--) heap.push(i)
      const arr = heap.toArray()
      expect(arr.length).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(arr[i]).toBe(i + 1)
      }
    })
  })

  describe('interleaved operations', () => {
    it('should handle push-pop-merge sequence', () => {
      const heap = new PagodaHeap<number>()
      heap.push(5)
      heap.push(3)
      heap.pop()
      heap.push(2)
      const other = new PagodaHeap<number>()
      other.push(1)
      other.push(4)
      heap.merge(other)
      const result: number[] = []
      while (!heap.isEmpty()) result.push(heap.pop())
      expect(result).toEqual([1, 2, 4, 5])
    })

    it('should handle remove between operations', () => {
      const heap = new PagodaHeap<number>()
      heap.push(5)
      heap.push(3)
      heap.push(7)
      heap.push(1)
      heap.remove(3)
      heap.push(2)
      const result: number[] = []
      while (!heap.isEmpty()) result.push(heap.pop())
      expect(result).toEqual([1, 2, 5, 7])
    })

    it('should handle decreaseKey between operations', () => {
      const heap = new PagodaHeap<number>()
      heap.push(5)
      heap.push(3)
      heap.push(7)
      heap.decreaseKey(7, 1)
      heap.push(2)
      const result: number[] = []
      while (!heap.isEmpty()) result.push(heap.pop())
      expect(result).toEqual([1, 2, 3, 5])
    })

    it('should handle clone-merge-pop sequence', () => {
      const heap1 = new PagodaHeap<number>()
      heap1.push(1)
      heap1.push(3)
      const cloned = heap1.clone()
      heap1.merge(cloned)
      expect(heap1.size()).toBe(4)
      expect(heap1.pop()).toBe(1)
      expect(heap1.pop()).toBe(1)
      expect(heap1.pop()).toBe(3)
      expect(heap1.pop()).toBe(3)
    })

    it('should handle clear and rebuild', () => {
      const heap = new PagodaHeap<number>()
      heap.push(5)
      heap.push(3)
      heap.clear()
      heap.push(2)
      heap.push(1)
      expect(heap.toArray()).toEqual([1, 2])
    })

    it('should handle complex interleaved sequence', () => {
      const heap = new PagodaHeap<number>()
      heap.push(10)
      heap.push(5)
      heap.push(15)
      expect(heap.pop()).toBe(5)
      heap.push(3)
      heap.push(8)
      expect(heap.remove(10)).toBe(true)
      heap.decreaseKey(15, 2)
      expect(heap.toArray()).toEqual([2, 3, 8])
    })

    it('should handle merge after partial drain', () => {
      const heap1 = new PagodaHeap<number>()
      heap1.push(1)
      heap1.push(3)
      heap1.push(5)
      heap1.pop()
      heap1.pop()
      const heap2 = new PagodaHeap<number>()
      heap2.push(2)
      heap2.push(4)
      heap1.merge(heap2)
      const result: number[] = []
      while (!heap1.isEmpty()) result.push(heap1.pop())
      expect(result).toEqual([2, 4, 5])
    })

    it('should handle fromArray then merge', () => {
      const heap1 = PagodaHeap.fromArray([1, 3, 5])
      const heap2 = PagodaHeap.fromArray([2, 4])
      heap1.merge(heap2)
      const result: number[] = []
      while (!heap1.isEmpty()) result.push(heap1.pop())
      expect(result).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle multiple merges with operations between', () => {
      const heap = new PagodaHeap<number>()
      heap.push(5)
      const h1 = new PagodaHeap<number>()
      h1.push(3)
      h1.push(1)
      heap.merge(h1)
      heap.pop()
      const h2 = new PagodaHeap<number>()
      h2.push(2)
      h2.push(4)
      heap.merge(h2)
      const result: number[] = []
      while (!heap.isEmpty()) result.push(heap.pop())
      expect(result).toEqual([2, 3, 4, 5])
    })
  })

  describe('type safety', () => {
    it('should work with string type', () => {
      const heap = new PagodaHeap<string>()
      heap.push('c')
      heap.push('a')
      heap.push('b')
      expect(heap.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('should work with object type', () => {
      type Item = { id: number; name: string }
      const heap = new PagodaHeap<Item>({
        comparator: (a, b) => a.id - b.id,
      })
      heap.push({ id: 3, name: 'charlie' })
      heap.push({ id: 1, name: 'alpha' })
      heap.push({ id: 2, name: 'bravo' })
      expect(heap.peek().name).toBe('alpha')
    })

    it('should export PagodaHeapOptions type', () => {
      const options: PagodaHeapOptions<number> = {
        comparator: (a, b) => a - b,
      }
      const heap = new PagodaHeap<number>(options)
      heap.push(1)
      expect(heap.peek()).toBe(1)
    })

    it('should handle boolean-like values with custom comparator', () => {
      const heap = new PagodaHeap<number>()
      heap.push(0)
      heap.push(1)
      heap.push(0)
      heap.push(1)
      const result: number[] = []
      while (!heap.isEmpty()) result.push(heap.pop())
      expect(result).toEqual([0, 0, 1, 1])
    })

    it('should handle merge after remove', () => {
      const heap1 = new PagodaHeap<number>()
      heap1.push(3)
      heap1.push(1)
      heap1.remove(3)
      const heap2 = new PagodaHeap<number>()
      heap2.push(2)
      heap2.push(4)
      heap1.merge(heap2)
      const result: number[] = []
      while (!heap1.isEmpty()) result.push(heap1.pop())
      expect(result).toEqual([1, 2, 4])
    })

    it('should handle multiple decreaseKey operations', () => {
      const heap = new PagodaHeap<number>()
      heap.push(10)
      heap.push(20)
      heap.push(30)
      heap.decreaseKey(20, 5)
      heap.decreaseKey(10, 1)
      const result: number[] = []
      while (!heap.isEmpty()) result.push(heap.pop())
      expect(result).toEqual([1, 5, 30])
    })

    it('should handle clone of cloned heap', () => {
      const heap = new PagodaHeap<number>()
      heap.push(3)
      heap.push(1)
      heap.push(2)
      const clone1 = heap.clone()
      const clone2 = clone1.clone()
      expect(clone2.toArray()).toEqual([1, 2, 3])
      clone2.pop()
      expect(clone1.size()).toBe(3)
      expect(heap.size()).toBe(3)
    })
  })
})
