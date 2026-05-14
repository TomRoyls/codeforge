import { describe, it, expect } from 'vitest'
import { FibonacciHeap } from '../src/core/fibonacci-heap-2/index.js'

describe('FibonacciHeap', () => {
  describe('constructor and basic operations', () => {
    it('should create an empty heap', () => {
      const heap = new FibonacciHeap<number>()
      expect(heap.isEmpty).toBe(true)
      expect(heap.size).toBe(0)
    })

    it('should use default comparator correctly', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      expect(heap.peek()).toBe(3)
    })

    it('should use custom comparator correctly', () => {
      const heap = new FibonacciHeap<number>({
        comparator: (a, b) => b - a,
      })
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      expect(heap.peek()).toBe(7)
    })
  })

  describe('insert', () => {
    it('should insert single value', () => {
      const heap = new FibonacciHeap<number>()
      const node = heap.insert(5)
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(5)
      expect(heap.isEmpty).toBe(false)
      expect(node.value).toBe(5)
    })

    it('should maintain min-heap property after multiple inserts', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.insert(1)
      heap.insert(9)
      expect(heap.peek()).toBe(1)
      expect(heap.size).toBe(5)
    })

    it('should insert duplicate values', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      heap.insert(5)
      heap.insert(5)
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(5)
    })

    it('should insert strings', () => {
      const heap = new FibonacciHeap<string>()
      heap.insert('zebra')
      heap.insert('apple')
      heap.insert('banana')
      expect(heap.peek()).toBe('apple')
    })

    it('should insert objects with custom comparator', () => {
      const heap = new FibonacciHeap<{ id: number }>({
        comparator: (a, b) => b.id - a.id,
      })
      heap.insert({ id: 5 })
      heap.insert({ id: 2 })
      heap.insert({ id: 8 })
      expect(heap.peek()!.id).toBe(8)
    })
  })

  describe('extractMin', () => {
    it('should throw for empty heap', () => {
      const heap = new FibonacciHeap<number>()
      expect(() => heap.extractMin()).toThrow('Heap is empty')
    })

    it('should extract single element', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      const extracted = heap.extractMin()
      expect(extracted).toBe(5)
      expect(heap.isEmpty).toBe(true)
      expect(heap.size).toBe(0)
    })

    it('should extract elements in ascending order', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.insert(1)
      heap.insert(9)
      const result: number[] = []
      while (!heap.isEmpty) {
        result.push(heap.extractMin())
      }
      expect(result).toEqual([1, 3, 5, 7, 9])
    })

    it('should extract duplicates correctly', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(5)
      heap.insert(1)
      heap.insert(3)
      const result: number[] = []
      while (!heap.isEmpty) {
        result.push(heap.extractMin())
      }
      expect(result).toEqual([1, 3, 3, 5, 5])
    })

    it('should maintain heap structure after partial extraction', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.insert(1)
      heap.insert(9)
      heap.insert(2)
      expect(heap.extractMin()).toBe(1)
      expect(heap.peek()).toBe(2)
      expect(heap.extractMin()).toBe(2)
      expect(heap.peek()).toBe(3)
      expect(heap.size).toBe(4)
    })
  })

  describe('peek', () => {
    it('should throw for empty heap', () => {
      const heap = new FibonacciHeap<number>()
      expect(() => heap.peek()).toThrow('Heap is empty')
    })

    it('should return minimum without removing', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      expect(heap.peek()).toBe(3)
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(3)
    })

    it('should update peek after insert', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      expect(heap.peek()).toBe(5)
      heap.insert(3)
      expect(heap.peek()).toBe(3)
      heap.insert(7)
      expect(heap.peek()).toBe(3)
      heap.insert(1)
      expect(heap.peek()).toBe(1)
    })

    it('should update peek after extractMin', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.insert(1)
      heap.insert(9)
      expect(heap.peek()).toBe(1)
      heap.extractMin()
      expect(heap.peek()).toBe(3)
      heap.extractMin()
      expect(heap.peek()).toBe(5)
    })
  })

  describe('merge', () => {
    it('should merge empty heap with non-empty heap', () => {
      const heap1 = new FibonacciHeap<number>()
      const heap2 = new FibonacciHeap<number>()
      heap2.insert(5)
      heap2.insert(3)
      heap1.merge(heap2)
      expect(heap1.size).toBe(2)
      expect(heap1.peek()).toBe(3)
      expect(heap2.isEmpty).toBe(true)
    })

    it('should merge two non-empty heaps', () => {
      const heap1 = new FibonacciHeap<number>()
      const heap2 = new FibonacciHeap<number>()
      heap1.insert(5)
      heap1.insert(3)
      heap2.insert(7)
      heap2.insert(1)
      heap1.merge(heap2)
      expect(heap1.size).toBe(4)
      expect(heap1.peek()).toBe(1)
      expect(heap2.isEmpty).toBe(true)
    })

    it('should maintain heap property after merge', () => {
      const heap1 = new FibonacciHeap<number>()
      const heap2 = new FibonacciHeap<number>()
      heap1.insert(5)
      heap1.insert(8)
      heap1.insert(2)
      heap2.insert(7)
      heap2.insert(1)
      heap2.insert(9)
      heap1.merge(heap2)
      const result: number[] = []
      while (!heap1.isEmpty) {
        result.push(heap1.extractMin())
      }
      expect(result).toEqual([1, 2, 5, 7, 8, 9])
    })

    it('should merge heaps with same comparator', () => {
      const heap1 = new FibonacciHeap<number>({
        comparator: (a, b) => b - a,
      })
      const heap2 = new FibonacciHeap<number>({
        comparator: (a, b) => b - a,
      })
      heap1.insert(5)
      heap2.insert(3)
      heap1.merge(heap2)
      expect(heap1.peek()).toBe(5)
    })

    it('should handle multiple merges', () => {
      const heap1 = new FibonacciHeap<number>()
      const heap2 = new FibonacciHeap<number>()
      const heap3 = new FibonacciHeap<number>()
      heap1.insert(5)
      heap2.insert(3)
      heap3.insert(1)
      heap1.merge(heap2)
      heap1.merge(heap3)
      expect(heap1.size).toBe(3)
      expect(heap1.peek()).toBe(1)
    })

    it('should not merge heap with itself', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      heap.insert(3)
      const sizeBefore = heap.size
      heap.merge(heap)
      expect(heap.size).toBe(sizeBefore)
    })
  })

  describe('size and isEmpty', () => {
    it('should track size correctly through operations', () => {
      const heap = new FibonacciHeap<number>()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty).toBe(true)
      heap.insert(5)
      expect(heap.size).toBe(1)
      expect(heap.isEmpty).toBe(false)
      heap.insert(3)
      heap.insert(7)
      expect(heap.size).toBe(3)
      heap.extractMin()
      expect(heap.size).toBe(2)
      heap.extractMin()
      heap.extractMin()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear all elements', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.clear()
      expect(heap.isEmpty).toBe(true)
      expect(heap.size).toBe(0)
    })

    it('should allow insert after clear', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.clear()
      heap.insert(7)
      heap.insert(1)
      expect(heap.size).toBe(2)
      expect(heap.peek()).toBe(1)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty heap', () => {
      const heap = new FibonacciHeap<number>()
      expect(heap.toArray()).toEqual([])
    })

    it('should return elements containing all values', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.insert(1)
      heap.insert(9)
      const result = heap.toArray()
      expect(result.length).toBe(5)
      expect(result).toContain(1)
      expect(result).toContain(3)
      expect(result).toContain(5)
      expect(result).toContain(7)
      expect(result).toContain(9)
    })

    it('should not modify original heap', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      const sizeBefore = heap.size
      const peekBefore = heap.peek()
      heap.toArray()
      expect(heap.size).toBe(sizeBefore)
      expect(heap.peek()).toBe(peekBefore)
    })

    it('should handle duplicates', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(5)
      heap.insert(1)
      heap.insert(3)
      const result = heap.toArray()
      expect(result.length).toBe(5)
      expect(result.filter(x => x === 1).length).toBe(1)
      expect(result.filter(x => x === 3).length).toBe(2)
      expect(result.filter(x => x === 5).length).toBe(2)
    })
  })

  describe('toSortedArray', () => {
    it('should return empty array for empty heap', () => {
      const heap = new FibonacciHeap<number>()
      expect(heap.toSortedArray()).toEqual([])
    })

    it('should return sorted array', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.insert(1)
      heap.insert(9)
      const result = heap.toSortedArray()
      expect(result).toEqual([1, 3, 5, 7, 9])
    })

    it('should not modify original heap', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      const sizeBefore = heap.size
      const peekBefore = heap.peek()
      heap.toSortedArray()
      expect(heap.size).toBe(sizeBefore)
      expect(heap.peek()).toBe(peekBefore)
    })

    it('should sort with duplicates', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(5)
      heap.insert(1)
      heap.insert(3)
      const result = heap.toSortedArray()
      expect(result).toEqual([1, 3, 3, 5, 5])
    })
  })

  describe('contains', () => {
    it('should return false for empty heap', () => {
      const heap = new FibonacciHeap<number>()
      expect(heap.contains(5)).toBe(false)
    })

    it('should return true for existing element', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      expect(heap.contains(5)).toBe(true)
      expect(heap.contains(3)).toBe(true)
      expect(heap.contains(7)).toBe(true)
    })

    it('should return false for non-existing element', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      expect(heap.contains(1)).toBe(false)
      expect(heap.contains(10)).toBe(false)
    })

    it('should work with strings', () => {
      const heap = new FibonacciHeap<string>()
      heap.insert('apple')
      heap.insert('banana')
      heap.insert('cherry')
      expect(heap.contains('apple')).toBe(true)
      expect(heap.contains('banana')).toBe(true)
      expect(heap.contains('date')).toBe(false)
    })

    it('should find duplicate values', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(5)
      expect(heap.contains(5)).toBe(true)
    })
  })

  describe('decreaseKey', () => {
    it('should throw for empty heap', () => {
      const heap = new FibonacciHeap<number>()
      const node = heap.insert(5)
      heap.clear()
      expect(() => heap.decreaseKey(node, 1)).toThrow('Heap is empty')
    })

    it('should throw when new value is greater', () => {
      const heap = new FibonacciHeap<number>()
      const node = heap.insert(5)
      expect(() => heap.decreaseKey(node, 10)).toThrow('New value is greater than current value')
    })

    it('should decrease key of existing element', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      const node = heap.insert(10)
      heap.decreaseKey(node, 1)
      expect(heap.peek()).toBe(1)
      expect(heap.size).toBe(4)
      expect(heap.contains(10)).toBe(false)
    })

    it('should work when new value is same', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      const node = heap.insert(3)
      heap.decreaseKey(node, 3)
      expect(heap.peek()).toBe(3)
      expect(heap.size).toBe(4)
    })

    it('should decrease root element', () => {
      const heap = new FibonacciHeap<number>()
      const node1 = heap.insert(5)
      heap.insert(10)
      heap.insert(15)
      heap.decreaseKey(node1, 2)
      expect(heap.peek()).toBe(2)
      expect(heap.extractMin()).toBe(2)
      expect(heap.extractMin()).toBe(10)
      expect(heap.extractMin()).toBe(15)
    })

    it('should handle cascading cuts', () => {
      const heap = new FibonacciHeap<number>()
      const node1 = heap.insert(1)
      const node2 = heap.insert(2)
      heap.insert(3)
      heap.insert(4)
      heap.insert(5)
      heap.decreaseKey(node2, 0)
      expect(heap.peek()).toBe(0)
      heap.decreaseKey(node1, -1)
      expect(heap.peek()).toBe(-1)
    })
  })

  describe('delete', () => {
    it('should work with single element', () => {
      const heap = new FibonacciHeap<number>()
      const node = heap.insert(5)
      heap.delete(node)
      expect(heap.isEmpty).toBe(true)
      expect(heap.size).toBe(0)
    })

    it('should delete element and maintain heap property', () => {
      const heap = new FibonacciHeap<number>()
      const node5 = heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.insert(1)
      heap.insert(9)
      heap.delete(node5)
      expect(heap.size).toBe(4)
      const result: number[] = []
      while (!heap.isEmpty) {
        result.push(heap.extractMin())
      }
      expect(result).toEqual([1, 3, 7, 9])
    })

    it('should delete root element', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      const node1 = heap.insert(1)
      heap.insert(9)
      heap.delete(node1)
      expect(heap.peek()).toBe(3)
      expect(heap.size).toBe(4)
    })

    it('should handle delete after decreaseKey', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      heap.insert(3)
      const node = heap.insert(10)
      heap.decreaseKey(node, 2)
      heap.delete(node)
      expect(heap.size).toBe(2)
      expect(heap.peek()).toBe(3)
    })

    it('should delete duplicate values', () => {
      const heap = new FibonacciHeap<number>()
      const node5a = heap.insert(5)
      heap.insert(3)
      const node5b = heap.insert(5)
      heap.insert(1)
      heap.insert(3)
      heap.delete(node5a)
      expect(heap.size).toBe(4)
      heap.delete(node5b)
      expect(heap.size).toBe(3)
      expect(heap.contains(5)).toBe(false)
    })
  })

  describe('clone', () => {
    it('should clone empty heap', () => {
      const heap = new FibonacciHeap<number>()
      const cloned = heap.clone()
      expect(cloned.isEmpty).toBe(true)
      expect(cloned.size).toBe(0)
    })

    it('should clone heap with elements', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      const cloned = heap.clone()
      expect(cloned.size).toBe(3)
      expect(cloned.peek()).toBe(3)
    })

    it('should create independent clone', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      const cloned = heap.clone()
      cloned.insert(1)
      cloned.extractMin()
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(3)
      expect(cloned.size).toBe(3)
    })

    it('should clone with same comparator', () => {
      const heap = new FibonacciHeap<number>({
        comparator: (a, b) => b - a,
      })
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      const cloned = heap.clone()
      cloned.insert(1)
      expect(cloned.peek()).toBe(7)
    })
  })

  describe('forEach', () => {
    it('should iterate over empty heap', () => {
      const heap = new FibonacciHeap<number>()
      const result: number[] = []
      heap.forEach(item => result.push(item))
      expect(result).toEqual([])
    })

    it('should iterate over all elements', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.insert(1)
      heap.insert(9)
      const result: number[] = []
      heap.forEach(item => result.push(item))
      expect(result.length).toBe(5)
      expect(result).toContain(5)
      expect(result).toContain(3)
      expect(result).toContain(7)
      expect(result).toContain(1)
      expect(result).toContain(9)
    })

    it('should not modify heap during iteration', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      const sizeBefore = heap.size
      const peekBefore = heap.peek()
      heap.forEach(item => {})
      expect(heap.size).toBe(sizeBefore)
      expect(heap.peek()).toBe(peekBefore)
    })

    it('should handle strings', () => {
      const heap = new FibonacciHeap<string>()
      heap.insert('apple')
      heap.insert('banana')
      heap.insert('cherry')
      const result: string[] = []
      heap.forEach(item => result.push(item))
      expect(result.length).toBe(3)
      expect(result).toContain('apple')
      expect(result).toContain('banana')
      expect(result).toContain('cherry')
    })
  })

  describe('iterator', () => {
    it('should iterate over empty heap', () => {
      const heap = new FibonacciHeap<number>()
      const result: number[] = []
      for (const item of heap) {
        result.push(item)
      }
      expect(result).toEqual([])
    })

    it('should iterate over all elements', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.insert(1)
      heap.insert(9)
      const result: number[] = []
      for (const item of heap) {
        result.push(item)
      }
      expect(result.length).toBe(5)
      expect(result).toContain(5)
      expect(result).toContain(3)
      expect(result).toContain(7)
      expect(result).toContain(1)
      expect(result).toContain(9)
    })

    it('should not modify heap during iteration', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      const sizeBefore = heap.size
      const peekBefore = heap.peek()
      for (const item of heap) {}
      expect(heap.size).toBe(sizeBefore)
      expect(heap.peek()).toBe(peekBefore)
    })
  })

  describe('fromArray', () => {
    it('should create heap from empty array', () => {
      const heap = FibonacciHeap.fromArray<number>([])
      expect(heap.isEmpty).toBe(true)
      expect(heap.size).toBe(0)
    })

    it('should create heap from single element', () => {
      const heap = FibonacciHeap.fromArray<number>([5])
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(5)
    })

    it('should create heap from multiple elements', () => {
      const heap = FibonacciHeap.fromArray<number>([5, 3, 7, 1, 9])
      expect(heap.size).toBe(5)
      expect(heap.peek()).toBe(1)
      const result: number[] = []
      while (!heap.isEmpty) {
        result.push(heap.extractMin())
      }
      expect(result).toEqual([1, 3, 5, 7, 9])
    })

    it('should use default comparator', () => {
      const heap = FibonacciHeap.fromArray<string>(['zebra', 'apple', 'banana'])
      expect(heap.peek()).toBe('apple')
    })

    it('should use custom comparator', () => {
      const heap = FibonacciHeap.fromArray<number>(
        [5, 3, 7, 1, 9],
        { comparator: (a, b) => b - a },
      )
      const result: number[] = []
      while (!heap.isEmpty) {
        result.push(heap.extractMin())
      }
      expect(result).toEqual([9, 7, 5, 3, 1])
    })

    it('should create heap from array with duplicates', () => {
      const heap = FibonacciHeap.fromArray<number>([5, 3, 5, 1, 3])
      const result: number[] = []
      while (!heap.isEmpty) {
        result.push(heap.extractMin())
      }
      expect(result).toEqual([1, 3, 3, 5, 5])
    })
  })

  describe('static merge', () => {
    it('should merge two empty heaps', () => {
      const heap1 = new FibonacciHeap<number>()
      const heap2 = new FibonacciHeap<number>()
      const merged = FibonacciHeap.merge(heap1, heap2)
      expect(merged.isEmpty).toBe(true)
      expect(merged.size).toBe(0)
    })

    it('should merge empty heap with non-empty heap', () => {
      const heap1 = new FibonacciHeap<number>()
      const heap2 = new FibonacciHeap<number>()
      heap2.insert(5)
      heap2.insert(3)
      const merged = FibonacciHeap.merge(heap1, heap2)
      expect(merged.size).toBe(2)
      expect(merged.peek()).toBe(3)
      expect(heap1.isEmpty).toBe(true)
      expect(heap2.size).toBe(2)
    })

    it('should merge two non-empty heaps', () => {
      const heap1 = new FibonacciHeap<number>()
      heap1.insert(5)
      heap1.insert(3)
      const heap2 = new FibonacciHeap<number>()
      heap2.insert(7)
      heap2.insert(1)
      const merged = FibonacciHeap.merge(heap1, heap2)
      expect(merged.size).toBe(4)
      expect(merged.peek()).toBe(1)
      expect(heap1.size).toBe(2)
      expect(heap2.size).toBe(2)
    })

    it('should preserve original heaps', () => {
      const heap1 = new FibonacciHeap<number>()
      heap1.insert(1)
      heap1.insert(3)
      const heap2 = new FibonacciHeap<number>()
      heap2.insert(2)
      heap2.insert(4)
      const merged = FibonacciHeap.merge(heap1, heap2)
      expect(heap1.size).toBe(2)
      expect(heap2.size).toBe(2)
      expect(merged.size).toBe(4)
    })

    it('should merge heaps with same comparator', () => {
      const heap1 = new FibonacciHeap<number>({
        comparator: (a, b) => b - a,
      })
      heap1.insert(5)
      const heap2 = new FibonacciHeap<number>({
        comparator: (a, b) => b - a,
      })
      heap2.insert(3)
      const merged = FibonacciHeap.merge(heap1, heap2)
      expect(merged.peek()).toBe(5)
    })
  })

  describe('edge cases', () => {
    it('should handle insert after complete extraction', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.extractMin()
      heap.extractMin()
      expect(heap.isEmpty).toBe(true)
      heap.insert(7)
      expect(heap.peek()).toBe(7)
    })

    it('should handle clear on empty heap', () => {
      const heap = new FibonacciHeap<number>()
      heap.clear()
      expect(heap.isEmpty).toBe(true)
      expect(heap.size).toBe(0)
    })

    it('should handle negative numbers', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(-5)
      heap.insert(3)
      heap.insert(-1)
      heap.insert(0)
      expect(heap.peek()).toBe(-5)
    })

    it('should handle zero', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(0)
      heap.insert(0)
      heap.insert(0)
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(0)
    })
  })

  describe('large datasets', () => {
    it('should handle large number of inserts', () => {
      const heap = new FibonacciHeap<number>()
      const count = 10000
      for (let i = 0; i < count; i++) {
        heap.insert(Math.random() * 1000)
      }
      expect(heap.size).toBe(count)
    })

    it('should maintain heap property with large dataset', () => {
      const heap = new FibonacciHeap<number>()
      const values: number[] = []
      const count = 1000
      for (let i = 0; i < count; i++) {
        const value = Math.random() * 1000
        values.push(value)
        heap.insert(value)
      }
      const result: number[] = []
      while (!heap.isEmpty) {
        result.push(heap.extractMin())
      }
      const sorted = [...values].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
      expect(result).toEqual(sorted)
    })

    it('should handle large merge operation', () => {
      const heap1 = new FibonacciHeap<number>()
      const heap2 = new FibonacciHeap<number>()
      const count = 5000
      for (let i = 0; i < count; i++) {
        heap1.insert(Math.random() * 1000)
        heap2.insert(Math.random() * 1000)
      }
      heap1.merge(heap2)
      expect(heap1.size).toBe(count * 2)
      expect(heap2.isEmpty).toBe(true)
    })

    it('should create heap from large array', () => {
      const values: number[] = []
      const count = 10000
      for (let i = 0; i < count; i++) {
        values.push(Math.random() * 1000)
      }
      const heap = FibonacciHeap.fromArray<number>(values)
      expect(heap.size).toBe(count)
    })

    it('should handle large sequential extract', () => {
      const heap = FibonacciHeap.fromArray<number>(
        Array.from({ length: 5000 }, () => Math.random() * 1000),
      )
      const count = heap.size
      let prev: number | null = null
      for (let i = 0; i < count; i++) {
        const current = heap.extractMin()
        if (prev !== null) {
          expect(current >= prev).toBe(true)
        }
        prev = current
      }
      expect(heap.isEmpty).toBe(true)
    })
  })

  describe('sequential extract', () => {
    it('should extract all elements in order', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.insert(1)
      heap.insert(9)
      heap.insert(2)
      heap.insert(8)
      heap.insert(4)
      heap.insert(6)
      const result: number[] = []
      while (!heap.isEmpty) {
        result.push(heap.extractMin())
      }
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('should maintain heap structure during sequential extract', () => {
      const heap = new FibonacciHeap<number>()
      const values = [5, 3, 7, 1, 9, 2, 8, 4, 6]
      for (const value of values) {
        heap.insert(value)
      }
      const sorted = [...values].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
      for (let i = 0; i < sorted.length; i++) {
        expect(heap.extractMin()).toBe(sorted[i]!)
        expect(heap.size).toBe(sorted.length - i - 1)
      }
      expect(heap.isEmpty).toBe(true)
    })

    it('should handle extractMin with interleaved inserts', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      heap.insert(3)
      expect(heap.extractMin()).toBe(3)
      heap.insert(1)
      expect(heap.extractMin()).toBe(1)
      heap.insert(7)
      heap.insert(2)
      expect(heap.extractMin()).toBe(2)
      expect(heap.extractMin()).toBe(5)
      expect(heap.extractMin()).toBe(7)
      expect(heap.isEmpty).toBe(true)
    })
  })

  describe('min-heap property', () => {
    it('should maintain min-heap property after complex operations', () => {
      const heap = new FibonacciHeap<number>()
      const values = [15, 3, 9, 2, 8, 7, 1, 10, 4, 6, 5, 14, 13, 11, 12]
      for (const value of values) {
        heap.insert(value)
      }

      const node8 = heap.toArray().find(x => x === 8)
      const node15 = heap.toArray().find(x => x === 15)
      if (node8 !== undefined) {
        const node8Ref = heap.toArray().find(() => true)
        if (node8Ref !== undefined) {
          heap.insert(node8Ref)
        }
      }
      if (node15 !== undefined) {
        const node15Ref = heap.toArray().find(() => true)
        if (node15Ref !== undefined) {
          heap.insert(node15Ref)
        }
      }

      const result: number[] = []
      while (!heap.isEmpty) {
        result.push(heap.extractMin())
      }

      for (let i = 1; i < result.length; i++) {
        expect(result[i]! >= result[i - 1]!).toBe(true)
      }
    })
  })
})
