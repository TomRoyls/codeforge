import { describe, it, expect, beforeEach } from 'vitest'
import { MinHeap } from '../../src/core/min-heap/min-heap.js'
import { DEFAULT_COMPARE } from '../../src/core/min-heap/types.js'
import type { CompareFunction } from '../../src/core/min-heap/types.js'

describe('MinHeap', () => {
  let heap: MinHeap<number>

  beforeEach(() => {
    heap = new MinHeap<number>()
  })

  describe('constructor', () => {
    it('should create an empty heap with default comparator', () => {
      const h = new MinHeap<number>()
      expect(h.size).toBe(0)
      expect(h.isEmpty()).toBe(true)
    })

    it('should accept a custom comparator', () => {
      const h = new MinHeap<number>((a, b) => b - a)
      h.insert(3)
      h.insert(1)
      h.insert(2)
      expect(h.peek()).toBe(3)
    })

    it('should create a heap with no arguments', () => {
      const h = new MinHeap()
      expect(h.size).toBe(0)
    })

    it('should work with string comparator', () => {
      const h = new MinHeap<string>((a, b) => a.localeCompare(b))
      h.insert('cherry')
      h.insert('apple')
      h.insert('banana')
      expect(h.peek()).toBe('apple')
    })
  })

  describe('insert', () => {
    it('should insert a single element', () => {
      heap.insert(5)
      expect(heap.size).toBe(1)
      expect(heap.isEmpty()).toBe(false)
    })

    it('should insert multiple elements', () => {
      heap.insert(3)
      heap.insert(1)
      heap.insert(4)
      expect(heap.size).toBe(3)
    })

    it('should maintain min element after inserts', () => {
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.insert(1)
      expect(heap.peek()).toBe(1)
    })

    it('should handle duplicate values', () => {
      heap.insert(5)
      heap.insert(5)
      heap.insert(5)
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(5)
    })

    it('should handle zero', () => {
      heap.insert(0)
      expect(heap.peek()).toBe(0)
    })

    it('should handle negative numbers', () => {
      heap.insert(-3)
      heap.insert(-1)
      heap.insert(-7)
      expect(heap.peek()).toBe(-7)
    })

    it('should handle very large numbers', () => {
      heap.insert(Number.MAX_SAFE_INTEGER)
      heap.insert(Number.MIN_SAFE_INTEGER)
      expect(heap.peek()).toBe(Number.MIN_SAFE_INTEGER)
    })

    it('should handle floating point values', () => {
      heap.insert(3.14)
      heap.insert(2.71)
      heap.insert(1.41)
      expect(heap.peek()).toBe(1.41)
    })

    it('should update min when inserting smaller value', () => {
      heap.insert(10)
      heap.insert(5)
      heap.insert(3)
      expect(heap.peek()).toBe(3)
    })

    it('should not change min when inserting larger value', () => {
      heap.insert(1)
      heap.insert(10)
      heap.insert(20)
      expect(heap.peek()).toBe(1)
    })

    it('should maintain heap property after many inserts', () => {
      for (let i = 20; i >= 1; i--) {
        heap.insert(i)
      }
      expect(heap.peek()).toBe(1)
    })
  })

  describe('peek', () => {
    it('should return undefined for empty heap', () => {
      expect(heap.peek()).toBeUndefined()
    })

    it('should return the minimum element', () => {
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      expect(heap.peek()).toBe(3)
    })

    it('should not remove the element', () => {
      heap.insert(5)
      heap.peek()
      expect(heap.size).toBe(1)
    })

    it('should return the same element on repeated calls', () => {
      heap.insert(5)
      heap.insert(3)
      expect(heap.peek()).toBe(3)
      expect(heap.peek()).toBe(3)
      expect(heap.peek()).toBe(3)
    })
  })

  describe('extractMin', () => {
    it('should return undefined for empty heap', () => {
      expect(heap.extractMin()).toBeUndefined()
    })

    it('should return the only element', () => {
      heap.insert(5)
      expect(heap.extractMin()).toBe(5)
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should return elements in sorted order', () => {
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

    it('should handle duplicate values', () => {
      heap.insert(3)
      heap.insert(3)
      heap.insert(1)
      heap.insert(1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(3)
      expect(heap.extractMin()).toBe(3)
    })

    it('should decrease size after each extraction', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      expect(heap.size).toBe(3)
      heap.extractMin()
      expect(heap.size).toBe(2)
      heap.extractMin()
      expect(heap.size).toBe(1)
      heap.extractMin()
      expect(heap.size).toBe(0)
    })

    it('should maintain heap property after extractions', () => {
      for (let i = 10; i >= 1; i--) {
        heap.insert(i)
      }
      for (let i = 1; i <= 10; i++) {
        expect(heap.extractMin()).toBe(i)
      }
    })

    it('should handle negative values correctly', () => {
      heap.insert(-5)
      heap.insert(-3)
      heap.insert(-7)
      expect(heap.extractMin()).toBe(-7)
      expect(heap.extractMin()).toBe(-5)
      expect(heap.extractMin()).toBe(-3)
    })

    it('should handle extracting all then inserting again', () => {
      heap.insert(1)
      heap.insert(2)
      heap.extractMin()
      heap.extractMin()
      heap.insert(3)
      expect(heap.peek()).toBe(3)
      expect(heap.size).toBe(1)
    })
  })

  describe('delete', () => {
    it('should delete an existing value', () => {
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      expect(heap.delete(3)).toBe(true)
      expect(heap.size).toBe(2)
    })

    it('should return false for non-existing value', () => {
      heap.insert(5)
      heap.insert(3)
      expect(heap.delete(10)).toBe(false)
      expect(heap.size).toBe(2)
    })

    it('should delete the min element', () => {
      heap.insert(3)
      heap.insert(5)
      heap.insert(7)
      expect(heap.delete(3)).toBe(true)
      expect(heap.peek()).toBe(5)
      expect(heap.size).toBe(2)
    })

    it('should delete the only element', () => {
      heap.insert(5)
      expect(heap.delete(5)).toBe(true)
      expect(heap.isEmpty()).toBe(true)
      expect(heap.size).toBe(0)
    })

    it('should handle deleting from middle', () => {
      heap.insert(1)
      heap.insert(3)
      heap.insert(5)
      heap.insert(7)
      heap.insert(9)
      heap.delete(5)
      expect(heap.toArray()).toEqual([1, 3, 7, 9])
    })

    it('should delete the max element', () => {
      heap.insert(1)
      heap.insert(3)
      heap.insert(5)
      expect(heap.delete(5)).toBe(true)
      expect(heap.toArray()).toEqual([1, 3])
    })

    it('should delete multiple elements', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.insert(4)
      heap.delete(3)
      heap.delete(1)
      expect(heap.size).toBe(2)
      expect(heap.peek()).toBe(2)
    })

    it('should maintain heap property after deletion', () => {
      heap.insert(10)
      heap.insert(20)
      heap.insert(30)
      heap.insert(40)
      heap.delete(20)
      expect(heap.extractMin()).toBe(10)
      expect(heap.extractMin()).toBe(30)
      expect(heap.extractMin()).toBe(40)
    })

    it('should handle delete and reinsert', () => {
      heap.insert(5)
      heap.insert(10)
      heap.insert(3)
      heap.delete(5)
      heap.insert(5)
      expect(heap.toArray()).toEqual([3, 5, 10])
    })

    it('should return false when deleting from empty heap', () => {
      expect(heap.delete(5)).toBe(false)
    })

    it('should delete last element by index', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      expect(heap.delete(3)).toBe(true)
      expect(heap.toArray()).toEqual([1, 2])
    })
  })

  describe('replace', () => {
    it('should replace min and return old min', () => {
      heap.insert(1)
      heap.insert(3)
      heap.insert(5)
      expect(heap.replace(2)).toBe(1)
      expect(heap.peek()).toBe(2)
    })

    it('should return undefined for empty heap', () => {
      expect(heap.replace(5)).toBeUndefined()
    })

    it('should maintain heap property after replace', () => {
      heap.insert(1)
      heap.insert(3)
      heap.insert(5)
      heap.replace(4)
      expect(heap.extractMin()).toBe(3)
      expect(heap.extractMin()).toBe(4)
      expect(heap.extractMin()).toBe(5)
    })

    it('should work when new value is larger', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.replace(10)
      expect(heap.peek()).toBe(2)
    })

    it('should work when new value is smaller than remaining', () => {
      heap.insert(5)
      heap.insert(10)
      heap.insert(15)
      heap.replace(1)
      expect(heap.peek()).toBe(1)
    })

    it('should handle replace on single-element heap', () => {
      heap.insert(5)
      expect(heap.replace(10)).toBe(5)
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(10)
    })

    it('should maintain size after replace', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.replace(4)
      expect(heap.size).toBe(3)
    })
  })

  describe('merge', () => {
    it('should merge two non-empty heaps', () => {
      heap.insert(1)
      heap.insert(3)
      const other = new MinHeap<number>()
      other.insert(2)
      other.insert(4)
      heap.merge(other)
      expect(heap.size).toBe(4)
      expect(other.size).toBe(0)
      expect(other.isEmpty()).toBe(true)
    })

    it('should merge into empty heap', () => {
      const other = new MinHeap<number>()
      other.insert(1)
      other.insert(2)
      heap.merge(other)
      expect(heap.size).toBe(2)
      expect(heap.peek()).toBe(1)
    })

    it('should merge empty heap into non-empty', () => {
      heap.insert(1)
      heap.insert(2)
      const other = new MinHeap<number>()
      heap.merge(other)
      expect(heap.size).toBe(2)
      expect(heap.peek()).toBe(1)
    })

    it('should merge two empty heaps', () => {
      const other = new MinHeap<number>()
      heap.merge(other)
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should maintain sorted order after merge', () => {
      heap.insert(1)
      heap.insert(5)
      const other = new MinHeap<number>()
      other.insert(2)
      other.insert(3)
      other.insert(4)
      heap.merge(other)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(2)
      expect(heap.extractMin()).toBe(3)
      expect(heap.extractMin()).toBe(4)
      expect(heap.extractMin()).toBe(5)
    })

    it('should clear the other heap after merge', () => {
      heap.insert(1)
      const other = new MinHeap<number>()
      other.insert(2)
      other.insert(3)
      heap.merge(other)
      expect(other.peek()).toBeUndefined()
    })

    it('should update min to smallest from both heaps', () => {
      heap.insert(10)
      heap.insert(20)
      const other = new MinHeap<number>()
      other.insert(5)
      other.insert(15)
      heap.merge(other)
      expect(heap.peek()).toBe(5)
    })

    it('should merge heaps with overlapping ranges', () => {
      heap.insert(1)
      heap.insert(4)
      heap.insert(7)
      const other = new MinHeap<number>()
      other.insert(2)
      other.insert(5)
      other.insert(8)
      heap.merge(other)
      const result = heap.toArray()
      expect(result).toEqual([1, 2, 4, 5, 7, 8])
    })

    it('should merge three heaps sequentially', () => {
      heap.insert(1)
      heap.insert(6)
      const h2 = new MinHeap<number>()
      h2.insert(3)
      h2.insert(8)
      const h3 = new MinHeap<number>()
      h3.insert(2)
      h3.insert(5)
      heap.merge(h2)
      heap.merge(h3)
      expect(heap.toArray()).toEqual([1, 2, 3, 5, 6, 8])
    })
  })

  describe('isEmpty', () => {
    it('should return true for new heap', () => {
      expect(heap.isEmpty()).toBe(true)
    })

    it('should return false after insert', () => {
      heap.insert(1)
      expect(heap.isEmpty()).toBe(false)
    })

    it('should return true after extracting all elements', () => {
      heap.insert(1)
      heap.insert(2)
      heap.extractMin()
      heap.extractMin()
      expect(heap.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      heap.insert(1)
      heap.insert(2)
      heap.clear()
      expect(heap.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear an empty heap', () => {
      heap.clear()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should clear a non-empty heap', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.clear()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
      expect(heap.peek()).toBeUndefined()
    })

    it('should allow insertions after clear', () => {
      heap.insert(1)
      heap.clear()
      heap.insert(2)
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(2)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty heap', () => {
      expect(heap.toArray()).toEqual([])
    })

    it('should return sorted elements', () => {
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

    it('should handle single element', () => {
      heap.insert(42)
      expect(heap.toArray()).toEqual([42])
    })

    it('should handle duplicate values', () => {
      heap.insert(1)
      heap.insert(1)
      heap.insert(2)
      expect(heap.toArray()).toEqual([1, 1, 2])
    })
  })

  describe('contains', () => {
    it('should return false for empty heap', () => {
      expect(heap.contains(5)).toBe(false)
    })

    it('should return true for existing value', () => {
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      expect(heap.contains(5)).toBe(true)
      expect(heap.contains(3)).toBe(true)
      expect(heap.contains(7)).toBe(true)
    })

    it('should return false for non-existing value', () => {
      heap.insert(5)
      heap.insert(3)
      expect(heap.contains(10)).toBe(false)
    })

    it('should find min element', () => {
      heap.insert(1)
      heap.insert(5)
      heap.insert(3)
      expect(heap.contains(1)).toBe(true)
    })

    it('should handle duplicate values', () => {
      heap.insert(5)
      heap.insert(5)
      expect(heap.contains(5)).toBe(true)
    })

    it('should return false after extracting all', () => {
      heap.insert(5)
      heap.extractMin()
      expect(heap.contains(5)).toBe(false)
    })
  })

  describe('forEach', () => {
    it('should not call callback for empty heap', () => {
      const items: number[] = []
      heap.forEach((value) => items.push(value))
      expect(items).toEqual([])
    })

    it('should iterate over all elements', () => {
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      const items: number[] = []
      heap.forEach((value) => items.push(value))
      expect(items.length).toBe(3)
    })

    it('should provide correct indices', () => {
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      const indices: number[] = []
      heap.forEach((_value, index) => indices.push(index))
      expect(indices).toEqual([0, 1, 2])
    })

    it('should handle single element', () => {
      heap.insert(5)
      const items: number[] = []
      heap.forEach((value) => items.push(value))
      expect(items).toEqual([5])
    })
  })

  describe('clone', () => {
    it('should clone an empty heap', () => {
      const cloned = heap.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should clone a non-empty heap', () => {
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      const cloned = heap.clone()
      expect(cloned.size).toBe(3)
      expect(cloned.peek()).toBe(1)
    })

    it('should not affect original when modifying clone', () => {
      heap.insert(1)
      heap.insert(2)
      const cloned = heap.clone()
      cloned.extractMin()
      expect(heap.size).toBe(2)
      expect(cloned.size).toBe(1)
    })

    it('should not affect clone when modifying original', () => {
      heap.insert(1)
      heap.insert(2)
      const cloned = heap.clone()
      heap.extractMin()
      expect(cloned.size).toBe(2)
      expect(heap.size).toBe(1)
    })

    it('should produce correct sorted output', () => {
      heap.insert(5)
      heap.insert(3)
      heap.insert(1)
      heap.insert(4)
      heap.insert(2)
      const cloned = heap.clone()
      expect(cloned.toArray()).toEqual([1, 2, 3, 4, 5])
      expect(heap.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('should clone heap with custom comparator', () => {
      const h = new MinHeap<number>((a, b) => b - a)
      h.insert(1)
      h.insert(2)
      h.insert(3)
      const cloned = h.clone()
      expect(cloned.peek()).toBe(3)
      expect(cloned.extractMin()).toBe(3)
    })
  })

  describe('Symbol.iterator', () => {
    it('should iterate over empty heap', () => {
      const result: number[] = []
      for (const val of heap) {
        result.push(val)
      }
      expect(result).toEqual([])
    })

    it('should iterate over elements in sorted order', () => {
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      const result: number[] = []
      for (const val of heap) {
        result.push(val)
      }
      expect(result).toEqual([1, 2, 3])
    })

    it('should work with spread operator', () => {
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      expect([...heap]).toEqual([1, 2, 3])
    })

    it('should not modify the heap', () => {
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      void [...heap]
      expect(heap.size).toBe(3)
    })

    it('should iterate single element', () => {
      heap.insert(42)
      expect([...heap]).toEqual([42])
    })
  })

  describe('fromArray', () => {
    it('should create heap from empty array', () => {
      const h = MinHeap.fromArray([])
      expect(h.size).toBe(0)
      expect(h.isEmpty()).toBe(true)
    })

    it('should create heap from single element', () => {
      const h = MinHeap.fromArray([5])
      expect(h.size).toBe(1)
      expect(h.peek()).toBe(5)
    })

    it('should create heap from multiple elements', () => {
      const h = MinHeap.fromArray([5, 3, 1, 4, 2])
      expect(h.size).toBe(5)
      expect(h.peek()).toBe(1)
    })

    it('should create heap with custom comparator', () => {
      const h = MinHeap.fromArray([1, 2, 3], (a, b) => b - a)
      expect(h.peek()).toBe(3)
    })

    it('should extract elements in sorted order', () => {
      const h = MinHeap.fromArray([5, 3, 1, 4, 2])
      expect(h.extractMin()).toBe(1)
      expect(h.extractMin()).toBe(2)
      expect(h.extractMin()).toBe(3)
      expect(h.extractMin()).toBe(4)
      expect(h.extractMin()).toBe(5)
    })

    it('should handle already sorted array', () => {
      const h = MinHeap.fromArray([1, 2, 3, 4, 5])
      expect(h.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle reverse sorted array', () => {
      const h = MinHeap.fromArray([5, 4, 3, 2, 1])
      expect(h.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle duplicates', () => {
      const h = MinHeap.fromArray([3, 1, 2, 1, 3, 2])
      expect(h.size).toBe(6)
      expect(h.extractMin()).toBe(1)
      expect(h.extractMin()).toBe(1)
      expect(h.extractMin()).toBe(2)
      expect(h.extractMin()).toBe(2)
      expect(h.extractMin()).toBe(3)
      expect(h.extractMin()).toBe(3)
    })
  })

  describe('heapify', () => {
    it('should sort an empty array', () => {
      const arr: number[] = []
      const result = MinHeap.heapify(arr)
      expect(result).toEqual([])
    })

    it('should sort a single element array', () => {
      const arr = [5]
      const result = MinHeap.heapify(arr)
      expect(result).toEqual([5])
    })

    it('should sort an array in ascending order', () => {
      const arr = [5, 3, 1, 4, 2]
      const result = MinHeap.heapify(arr)
      expect(result).toEqual([1, 2, 3, 4, 5])
    })

    it('should sort in-place', () => {
      const arr = [5, 3, 1, 4, 2]
      const result = MinHeap.heapify(arr)
      expect(result).toBe(arr)
    })

    it('should handle already sorted array', () => {
      const arr = [1, 2, 3, 4, 5]
      expect(MinHeap.heapify(arr)).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle reverse sorted array', () => {
      const arr = [5, 4, 3, 2, 1]
      expect(MinHeap.heapify(arr)).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle duplicates', () => {
      const arr = [3, 1, 2, 1, 3]
      expect(MinHeap.heapify(arr)).toEqual([1, 1, 2, 3, 3])
    })

    it('should handle negative values', () => {
      const arr = [-3, -1, -7, -5]
      expect(MinHeap.heapify(arr)).toEqual([-7, -5, -3, -1])
    })

    it('should work with custom comparator', () => {
      const arr = [1, 2, 3, 4, 5]
      const result = MinHeap.heapify(arr, (a, b) => b - a)
      expect(result).toEqual([5, 4, 3, 2, 1])
    })

    it('should handle string arrays', () => {
      const arr = ['cherry', 'apple', 'banana']
      const result = MinHeap.heapify(arr, (a, b) => a.localeCompare(b))
      expect(result).toEqual(['apple', 'banana', 'cherry'])
    })

    it('should handle two-element array', () => {
      const arr = [2, 1]
      expect(MinHeap.heapify(arr)).toEqual([1, 2])
    })
  })

  describe('size property', () => {
    it('should track size correctly through operations', () => {
      expect(heap.size).toBe(0)
      heap.insert(1)
      expect(heap.size).toBe(1)
      heap.insert(2)
      heap.insert(3)
      expect(heap.size).toBe(3)
      heap.extractMin()
      expect(heap.size).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('should handle interleaved insert and extract', () => {
      heap.insert(5)
      expect(heap.extractMin()).toBe(5)
      heap.insert(3)
      heap.insert(7)
      expect(heap.extractMin()).toBe(3)
      heap.insert(1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(7)
    })

    it('should handle many duplicates', () => {
      for (let i = 0; i < 10; i++) {
        heap.insert(5)
      }
      expect(heap.size).toBe(10)
      for (let i = 0; i < 10; i++) {
        expect(heap.extractMin()).toBe(5)
      }
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle insert after extractMin empties heap', () => {
      heap.insert(1)
      heap.extractMin()
      expect(heap.isEmpty()).toBe(true)
      heap.insert(2)
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(2)
    })

    it('should handle negative infinity', () => {
      heap.insert(Infinity)
      heap.insert(-Infinity)
      heap.insert(0)
      expect(heap.extractMin()).toBe(-Infinity)
      expect(heap.extractMin()).toBe(0)
      expect(heap.extractMin()).toBe(Infinity)
    })

    it('should handle alternating insert extractMin', () => {
      heap.insert(5)
      expect(heap.extractMin()).toBe(5)
      heap.insert(3)
      expect(heap.extractMin()).toBe(3)
      heap.insert(7)
      expect(heap.extractMin()).toBe(7)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle extractMin after merge', () => {
      heap.insert(3)
      heap.insert(1)
      const other = new MinHeap<number>()
      other.insert(2)
      other.insert(4)
      heap.merge(other)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(2)
      expect(heap.extractMin()).toBe(3)
      expect(heap.extractMin()).toBe(4)
    })

    it('should handle clear after merge', () => {
      heap.insert(1)
      const other = new MinHeap<number>()
      other.insert(2)
      heap.merge(other)
      heap.clear()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle multiple merges', () => {
      heap.insert(5)
      for (let i = 0; i < 5; i++) {
        const other = new MinHeap<number>()
        other.insert(i * 2)
        other.insert(i * 2 + 1)
        heap.merge(other)
      }
      expect(heap.size).toBe(11)
    })

    it('should handle merge after extractMin', () => {
      heap.insert(1)
      heap.insert(5)
      heap.extractMin()
      const other = new MinHeap<number>()
      other.insert(2)
      other.insert(3)
      heap.merge(other)
      expect(heap.toArray()).toEqual([2, 3, 5])
    })

    it('should handle fromArray then merge', () => {
      const h1 = MinHeap.fromArray([5, 3, 1])
      const h2 = MinHeap.fromArray([6, 4, 2])
      h1.merge(h2)
      expect(h1.toArray()).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('should handle replace then extractMin', () => {
      heap.insert(1)
      heap.insert(3)
      heap.insert(5)
      heap.replace(2)
      expect(heap.extractMin()).toBe(2)
      expect(heap.extractMin()).toBe(3)
      expect(heap.extractMin()).toBe(5)
    })

    it('should handle delete after replace', () => {
      heap.insert(1)
      heap.insert(3)
      heap.insert(5)
      heap.replace(2)
      heap.delete(3)
      expect(heap.toArray()).toEqual([2, 5])
    })

    it('should handle clone after partial extraction', () => {
      for (let i = 0; i < 10; i++) {
        heap.insert(i)
      }
      for (let i = 0; i < 5; i++) {
        heap.extractMin()
      }
      const cloned = heap.clone()
      expect(cloned.size).toBe(5)
      expect(cloned.peek()).toBe(5)
    })

    it('should handle toArray after delete', () => {
      heap.insert(10)
      heap.insert(5)
      heap.insert(15)
      heap.delete(10)
      expect(heap.toArray()).toEqual([5, 15])
    })

    it('should handle toArray after replace', () => {
      heap.insert(10)
      heap.insert(5)
      heap.insert(15)
      heap.replace(2)
      expect(heap.toArray()).toEqual([2, 10, 15])
    })

    it('should handle forEach after operations', () => {
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.delete(5)
      const items: number[] = []
      heap.forEach((v) => items.push(v))
      expect(items.length).toBe(2)
    })

    it('should handle contains after delete', () => {
      heap.insert(5)
      heap.insert(3)
      heap.delete(5)
      expect(heap.contains(5)).toBe(false)
      expect(heap.contains(3)).toBe(true)
    })

    it('should handle contains after replace', () => {
      heap.insert(1)
      heap.insert(3)
      heap.replace(2)
      expect(heap.contains(1)).toBe(false)
      expect(heap.contains(2)).toBe(true)
    })
  })

  describe('large datasets', () => {
    it('should handle 100 elements in sorted order', () => {
      for (let i = 0; i < 100; i++) {
        heap.insert(i)
      }
      for (let i = 0; i < 100; i++) {
        expect(heap.extractMin()).toBe(i)
      }
    })

    it('should handle 100 elements in reverse order', () => {
      for (let i = 99; i >= 0; i--) {
        heap.insert(i)
      }
      for (let i = 0; i < 100; i++) {
        expect(heap.extractMin()).toBe(i)
      }
    })

    it('should handle 1000 elements', () => {
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

    it('should handle 5000 elements', () => {
      for (let i = 5000; i >= 1; i--) {
        heap.insert(i)
      }
      for (let i = 1; i <= 5000; i++) {
        expect(heap.extractMin()).toBe(i)
      }
    })

    it('should handle fromArray with 1000 elements', () => {
      const arr: number[] = []
      for (let i = 0; i < 1000; i++) {
        arr.push(Math.floor(Math.random() * 10000))
      }
      const h = MinHeap.fromArray(arr)
      const sorted = [...arr].sort((a, b) => a - b)
      for (let i = 0; i < 1000; i++) {
        expect(h.extractMin()).toBe(sorted[i])
      }
    })

    it('should handle heapify with 1000 elements', () => {
      const arr: number[] = []
      for (let i = 0; i < 1000; i++) {
        arr.push(Math.floor(Math.random() * 10000))
      }
      const result = MinHeap.heapify(arr)
      for (let i = 1; i < result.length; i++) {
        expect(result[i]!).toBeGreaterThanOrEqual(result[i - 1]!)
      }
    })

    it('should handle stress test with 1000+ mixed operations', () => {
      for (let i = 0; i < 500; i++) {
        heap.insert(Math.floor(Math.random() * 10000))
      }
      for (let i = 0; i < 250; i++) {
        heap.extractMin()
        heap.insert(Math.floor(Math.random() * 10000))
      }
      expect(heap.size).toBe(500)
      let prev = heap.extractMin()!
      for (let i = 1; i < 500; i++) {
        const curr = heap.extractMin()!
        expect(curr).toBeGreaterThanOrEqual(prev)
        prev = curr
      }
    })
  })

  describe('custom objects', () => {
    it('should work with objects using custom comparator', () => {
      interface Item {
        priority: number
        name: string
      }
      const h = new MinHeap<Item>((a, b) => a.priority - b.priority)
      h.insert({ priority: 3, name: 'c' })
      h.insert({ priority: 1, name: 'a' })
      h.insert({ priority: 2, name: 'b' })
      expect(h.peek()!.name).toBe('a')
      expect(h.extractMin()!.name).toBe('a')
      expect(h.extractMin()!.name).toBe('b')
      expect(h.extractMin()!.name).toBe('c')
    })

    it('should work with string values', () => {
      const h = new MinHeap<string>((a, b) => a.localeCompare(b))
      h.insert('delta')
      h.insert('alpha')
      h.insert('charlie')
      h.insert('bravo')
      expect(h.extractMin()).toBe('alpha')
      expect(h.extractMin()).toBe('bravo')
      expect(h.extractMin()).toBe('charlie')
      expect(h.extractMin()).toBe('delta')
    })

    it('should work with date values', () => {
      const h = new MinHeap<Date>((a, b) => a.getTime() - b.getTime())
      const d1 = new Date(2023, 0, 1)
      const d2 = new Date(2023, 5, 15)
      const d3 = new Date(2023, 2, 10)
      h.insert(d2)
      h.insert(d1)
      h.insert(d3)
      expect(h.extractMin()).toBe(d1)
      expect(h.extractMin()).toBe(d3)
      expect(h.extractMin()).toBe(d2)
    })
  })

  describe('performance', () => {
    it('should handle sequential insertions efficiently', () => {
      const start = performance.now()
      for (let i = 0; i < 10000; i++) {
        heap.insert(i)
      }
      const insertTime = performance.now() - start
      expect(heap.size).toBe(10000)
      expect(insertTime).toBeLessThan(1000)
    })

    it('should handle sequential extractions efficiently', () => {
      for (let i = 0; i < 10000; i++) {
        heap.insert(i)
      }
      const start = performance.now()
      for (let i = 0; i < 10000; i++) {
        heap.extractMin()
      }
      const extractTime = performance.now() - start
      expect(heap.isEmpty()).toBe(true)
      expect(extractTime).toBeLessThan(5000)
    })

    it('should handle mixed operations efficiently', () => {
      for (let i = 0; i < 5000; i++) {
        heap.insert(Math.floor(Math.random() * 10000))
      }
      for (let i = 0; i < 2500; i++) {
        heap.extractMin()
        heap.insert(Math.floor(Math.random() * 10000))
      }
      expect(heap.size).toBe(5000)
    })
  })

  describe('exports', () => {
    it('should export DEFAULT_COMPARE', () => {
      expect(DEFAULT_COMPARE(1, 2)).toBeLessThan(0)
      expect(DEFAULT_COMPARE(2, 1)).toBeGreaterThan(0)
      expect(DEFAULT_COMPARE(1, 1)).toBe(0)
    })
  })

  describe('additional edge cases', () => {
    it('should handle replace with value same as old min', () => {
      heap.insert(1)
      heap.insert(3)
      heap.insert(5)
      expect(heap.replace(1)).toBe(1)
      expect(heap.peek()).toBe(1)
    })

    it('should handle delete all elements one by one', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.delete(2)
      heap.delete(1)
      heap.delete(3)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle insert after clear after many operations', () => {
      for (let i = 0; i < 100; i++) {
        heap.insert(i)
      }
      for (let i = 0; i < 50; i++) {
        heap.extractMin()
      }
      heap.clear()
      heap.insert(42)
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(42)
    })

    it('should handle contains on large heap', () => {
      for (let i = 0; i < 1000; i++) {
        heap.insert(i)
      }
      expect(heap.contains(0)).toBe(true)
      expect(heap.contains(999)).toBe(true)
      expect(heap.contains(500)).toBe(true)
      expect(heap.contains(1000)).toBe(false)
      expect(heap.contains(-1)).toBe(false)
    })

    it('should handle clone of large heap', () => {
      for (let i = 0; i < 100; i++) {
        heap.insert(i)
      }
      const cloned = heap.clone()
      expect(cloned.size).toBe(100)
      expect(cloned.peek()).toBe(0)
      for (let i = 0; i < 100; i++) {
        expect(cloned.extractMin()).toBe(i)
      }
    })

    it('should handle iterator on large heap', () => {
      for (let i = 0; i < 50; i++) {
        heap.insert(i)
      }
      const arr = [...heap]
      expect(arr.length).toBe(50)
      for (let i = 0; i < 50; i++) {
        expect(arr[i]).toBe(i)
      }
    })

    it('should handle heapify with two elements', () => {
      const arr = [2, 1]
      expect(MinHeap.heapify(arr)).toEqual([1, 2])
    })

    it('should handle heapify with identical elements', () => {
      const arr = [5, 5, 5, 5, 5]
      expect(MinHeap.heapify(arr)).toEqual([5, 5, 5, 5, 5])
    })

    it('should handle delete of value that appears only once among duplicates', () => {
      heap.insert(5)
      heap.insert(5)
      heap.insert(5)
      heap.delete(5)
      expect(heap.size).toBe(2)
      expect(heap.peek()).toBe(5)
    })

    it('should handle replace after delete', () => {
      heap.insert(1)
      heap.insert(3)
      heap.insert(5)
      heap.delete(3)
      expect(heap.replace(0)).toBe(1)
      expect(heap.peek()).toBe(0)
    })

    it('should handle merge with identical elements', () => {
      heap.insert(5)
      heap.insert(5)
      const other = new MinHeap<number>()
      other.insert(5)
      other.insert(5)
      heap.merge(other)
      expect(heap.size).toBe(4)
      expect(heap.peek()).toBe(5)
    })

    it('should handle toArray after merge', () => {
      heap.insert(1)
      heap.insert(3)
      const other = new MinHeap<number>()
      other.insert(2)
      other.insert(4)
      heap.merge(other)
      expect(heap.toArray()).toEqual([1, 2, 3, 4])
    })
  })
})
