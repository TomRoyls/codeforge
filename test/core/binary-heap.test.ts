import { describe, it, expect, beforeEach } from 'vitest'
import { BinaryHeap } from '../../src/core/binary-heap/binary-heap.js'
import { DEFAULT_HEAP_OPTIONS } from '../../src/core/binary-heap/types.js'
import type { HeapOptions } from '../../src/core/binary-heap/types.js'

describe('BinaryHeap', () => {
  let heap: BinaryHeap<number>

  beforeEach(() => {
    heap = new BinaryHeap<number>()
  })

  describe('constructor', () => {
    it('should create a heap with default options', () => {
      const h = new BinaryHeap<number>()
      expect(h.size()).toBe(0)
      expect(h.isEmpty()).toBe(true)
    })

    it('should accept min comparator option', () => {
      const h = new BinaryHeap<number>({ comparator: 'min' })
      h.insert(3)
      h.insert(1)
      h.insert(2)
      expect(h.peek()).toBe(1)
    })

    it('should accept max comparator option', () => {
      const h = new BinaryHeap<number>({ comparator: 'max' })
      h.insert(1)
      h.insert(3)
      h.insert(2)
      expect(h.peek()).toBe(3)
    })

    it('should accept partial options', () => {
      const h = new BinaryHeap<number>({ comparator: 'max' })
      expect(h.size()).toBe(0)
    })
  })

  describe('insert', () => {
    it('should add a single element', () => {
      heap.insert(5)
      expect(heap.size()).toBe(1)
    })

    it('should add multiple elements', () => {
      heap.insert(3)
      heap.insert(1)
      heap.insert(4)
      expect(heap.size()).toBe(3)
    })

    it('should maintain min-heap property on insert', () => {
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.insert(1)
      expect(heap.peek()).toBe(1)
    })

    it('should maintain max-heap property on insert', () => {
      const h = new BinaryHeap<number>({ comparator: 'max' })
      h.insert(1)
      h.insert(5)
      h.insert(3)
      h.insert(7)
      expect(h.peek()).toBe(7)
    })

    it('should handle duplicate values', () => {
      heap.insert(5)
      heap.insert(5)
      heap.insert(5)
      expect(heap.size()).toBe(3)
      expect(heap.peek()).toBe(5)
    })

    it('should handle insert of zero', () => {
      heap.insert(0)
      expect(heap.peek()).toBe(0)
    })

    it('should handle negative numbers', () => {
      heap.insert(-3)
      heap.insert(-1)
      heap.insert(-5)
      expect(heap.peek()).toBe(-5)
    })

    it('should maintain heap property with many inserts', () => {
      for (let i = 100; i >= 1; i--) {
        heap.insert(i)
      }
      expect(heap.peek()).toBe(1)
    })
  })

  describe('extract', () => {
    it('should return undefined on empty heap', () => {
      expect(heap.extract()).toBeUndefined()
    })

    it('should extract the only element', () => {
      heap.insert(5)
      expect(heap.extract()).toBe(5)
      expect(heap.size()).toBe(0)
    })

    it('should extract elements in ascending order from min-heap', () => {
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      expect(heap.extract()).toBe(1)
      expect(heap.extract()).toBe(2)
      expect(heap.extract()).toBe(3)
    })

    it('should extract elements in descending order from max-heap', () => {
      const h = new BinaryHeap<number>({ comparator: 'max' })
      h.insert(1)
      h.insert(3)
      h.insert(2)
      expect(h.extract()).toBe(3)
      expect(h.extract()).toBe(2)
      expect(h.extract()).toBe(1)
    })

    it('should maintain heap property after extract', () => {
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.insert(1)
      heap.insert(4)
      heap.extract()
      expect(heap.peek()).toBe(3)
    })

    it('should handle extracting all elements', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.extract()
      heap.extract()
      heap.extract()
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle duplicate values on extract', () => {
      heap.insert(3)
      heap.insert(3)
      heap.insert(1)
      expect(heap.extract()).toBe(1)
      expect(heap.extract()).toBe(3)
      expect(heap.extract()).toBe(3)
    })

    it('should sort correctly with many elements', () => {
      const values = [9, 4, 7, 1, 3, 8, 5, 2, 6]
      for (const v of values) {
        heap.insert(v)
      }
      const sorted: number[] = []
      while (!heap.isEmpty()) {
        sorted.push(heap.extract()!)
      }
      expect(sorted).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })
  })

  describe('peek', () => {
    it('should return undefined on empty heap', () => {
      expect(heap.peek()).toBeUndefined()
    })

    it('should return the minimum element in min-heap', () => {
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      expect(heap.peek()).toBe(3)
    })

    it('should return the maximum element in max-heap', () => {
      const h = new BinaryHeap<number>({ comparator: 'max' })
      h.insert(5)
      h.insert(3)
      h.insert(7)
      expect(h.peek()).toBe(7)
    })

    it('should not remove the element', () => {
      heap.insert(5)
      heap.peek()
      expect(heap.size()).toBe(1)
    })

    it('should return the same element on repeated peeks', () => {
      heap.insert(5)
      expect(heap.peek()).toBe(5)
      expect(heap.peek()).toBe(5)
      expect(heap.peek()).toBe(5)
    })
  })

  describe('size', () => {
    it('should return 0 for empty heap', () => {
      expect(heap.size()).toBe(0)
    })

    it('should return correct size after inserts', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      expect(heap.size()).toBe(3)
    })

    it('should return correct size after extracts', () => {
      heap.insert(1)
      heap.insert(2)
      heap.extract()
      expect(heap.size()).toBe(1)
    })

    it('should return correct size after clear', () => {
      heap.insert(1)
      heap.insert(2)
      heap.clear()
      expect(heap.size()).toBe(0)
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
      heap.extract()
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
    it('should remove all elements', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.clear()
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should work on empty heap', () => {
      heap.clear()
      expect(heap.size()).toBe(0)
    })

    it('should allow inserts after clear', () => {
      heap.insert(1)
      heap.clear()
      heap.insert(2)
      expect(heap.size()).toBe(1)
      expect(heap.peek()).toBe(2)
    })
  })

  describe('contains', () => {
    it('should return false on empty heap', () => {
      expect(heap.contains(1)).toBe(false)
    })

    it('should return true if value exists', () => {
      heap.insert(5)
      expect(heap.contains(5)).toBe(true)
    })

    it('should return false if value does not exist', () => {
      heap.insert(5)
      expect(heap.contains(3)).toBe(false)
    })

    it('should find values after multiple inserts', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      expect(heap.contains(2)).toBe(true)
    })

    it('should not find values after extract', () => {
      heap.insert(1)
      heap.insert(2)
      heap.extract()
      expect(heap.contains(1)).toBe(false)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty heap', () => {
      expect(heap.toArray()).toEqual([])
    })

    it('should return sorted array from min-heap', () => {
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      expect(heap.toArray()).toEqual([1, 2, 3])
    })

    it('should return sorted array from max-heap', () => {
      const h = new BinaryHeap<number>({ comparator: 'max' })
      h.insert(1)
      h.insert(3)
      h.insert(2)
      expect(h.toArray()).toEqual([3, 2, 1])
    })

    it('should not modify the original heap', () => {
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      heap.toArray()
      expect(heap.size()).toBe(3)
      expect(heap.peek()).toBe(1)
    })

    it('should handle single element', () => {
      heap.insert(5)
      expect(heap.toArray()).toEqual([5])
    })
  })

  describe('fromArray', () => {
    it('should build a heap from an array', () => {
      heap.fromArray([3, 1, 4, 1, 5, 9, 2, 6])
      expect(heap.size()).toBe(8)
      expect(heap.peek()).toBe(1)
    })

    it('should handle empty array', () => {
      heap.fromArray([])
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle single element array', () => {
      heap.fromArray([42])
      expect(heap.size()).toBe(1)
      expect(heap.peek()).toBe(42)
    })

    it('should replace existing elements', () => {
      heap.insert(100)
      heap.insert(200)
      heap.fromArray([1, 2, 3])
      expect(heap.size()).toBe(3)
      expect(heap.peek()).toBe(1)
    })

    it('should produce valid sorted output', () => {
      heap.fromArray([9, 4, 7, 1, 3, 8, 5, 2, 6])
      const sorted: number[] = []
      while (!heap.isEmpty()) {
        sorted.push(heap.extract()!)
      }
      expect(sorted).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('should build a valid max-heap from array', () => {
      const h = new BinaryHeap<number>({ comparator: 'max' })
      h.fromArray([3, 1, 4, 1, 5, 9, 2, 6])
      expect(h.peek()).toBe(9)
    })

    it('should handle array with all equal elements', () => {
      heap.fromArray([5, 5, 5, 5])
      expect(heap.size()).toBe(4)
      expect(heap.peek()).toBe(5)
    })

    it('should handle already sorted array', () => {
      heap.fromArray([1, 2, 3, 4, 5])
      expect(heap.peek()).toBe(1)
      expect(heap.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle reverse sorted array', () => {
      heap.fromArray([5, 4, 3, 2, 1])
      expect(heap.peek()).toBe(1)
      expect(heap.toArray()).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('merge', () => {
    it('should merge two heaps', () => {
      heap.insert(1)
      heap.insert(3)
      const other = new BinaryHeap<number>()
      other.insert(2)
      other.insert(4)
      heap.merge(other)
      expect(heap.size()).toBe(4)
      expect(heap.peek()).toBe(1)
    })

    it('should merge with empty heap', () => {
      heap.insert(1)
      heap.insert(2)
      const other = new BinaryHeap<number>()
      heap.merge(other)
      expect(heap.size()).toBe(2)
    })

    it('should merge into empty heap', () => {
      const other = new BinaryHeap<number>()
      other.insert(1)
      other.insert(2)
      heap.merge(other)
      expect(heap.size()).toBe(2)
    })

    it('should merge two empty heaps', () => {
      const other = new BinaryHeap<number>()
      heap.merge(other)
      expect(heap.size()).toBe(0)
    })

    it('should maintain heap property after merge', () => {
      heap.insert(5)
      heap.insert(1)
      const other = new BinaryHeap<number>()
      other.insert(3)
      other.insert(2)
      other.insert(4)
      heap.merge(other)
      const sorted: number[] = []
      while (!heap.isEmpty()) {
        sorted.push(heap.extract()!)
      }
      expect(sorted).toEqual([1, 2, 3, 4, 5])
    })

    it('should not modify the source heap', () => {
      const other = new BinaryHeap<number>()
      other.insert(1)
      other.insert(2)
      heap.merge(other)
      expect(other.size()).toBe(2)
    })
  })

  describe('update', () => {
    it('should update a value and maintain heap property', () => {
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      expect(heap.update(5, 1)).toBe(true)
      expect(heap.peek()).toBe(1)
    })

    it('should return false if value not found', () => {
      heap.insert(1)
      heap.insert(2)
      expect(heap.update(99, 0)).toBe(false)
    })

    it('should handle update on empty heap', () => {
      expect(heap.update(1, 2)).toBe(false)
    })

    it('should bubble up when decreasing value in min-heap', () => {
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.update(7, 1)
      expect(heap.peek()).toBe(1)
    })

    it('should sink down when increasing value in min-heap', () => {
      heap.insert(1)
      heap.insert(3)
      heap.insert(5)
      heap.update(1, 10)
      expect(heap.peek()).toBe(3)
    })

    it('should handle update in max-heap', () => {
      const h = new BinaryHeap<number>({ comparator: 'max' })
      h.insert(1)
      h.insert(3)
      h.insert(5)
      h.update(1, 10)
      expect(h.peek()).toBe(10)
    })

    it('should update the correct element', () => {
      heap.insert(1)
      heap.insert(5)
      heap.insert(3)
      heap.update(5, 0)
      expect(heap.peek()).toBe(0)
      expect(heap.size()).toBe(3)
    })
  })

  describe('delete', () => {
    it('should delete a value from the heap', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      expect(heap.delete(2)).toBe(true)
      expect(heap.size()).toBe(2)
    })

    it('should return false if value not found', () => {
      heap.insert(1)
      heap.insert(2)
      expect(heap.delete(99)).toBe(false)
    })

    it('should handle delete on empty heap', () => {
      expect(heap.delete(1)).toBe(false)
    })

    it('should maintain heap property after delete', () => {
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.insert(1)
      heap.insert(4)
      heap.delete(1)
      expect(heap.peek()).toBe(3)
    })

    it('should handle deleting the root', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.delete(1)
      expect(heap.peek()).toBe(2)
    })

    it('should handle deleting the last element', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.delete(3)
      expect(heap.size()).toBe(2)
      expect(heap.peek()).toBe(1)
    })

    it('should handle deleting the only element', () => {
      heap.insert(1)
      heap.delete(1)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should maintain correct order after multiple deletes', () => {
      heap.fromArray([5, 3, 7, 1, 4, 6, 2])
      heap.delete(7)
      heap.delete(6)
      const sorted: number[] = []
      while (!heap.isEmpty()) {
        sorted.push(heap.extract()!)
      }
      expect(sorted).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('forEach', () => {
    it('should iterate over all elements', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      const values: number[] = []
      heap.forEach((v) => values.push(v))
      expect(values.length).toBe(3)
    })

    it('should provide correct index', () => {
      heap.insert(10)
      heap.insert(20)
      heap.insert(30)
      const indices: number[] = []
      heap.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('should work on empty heap', () => {
      let count = 0
      heap.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('should iterate in heap-internal order', () => {
      heap.fromArray([1, 2, 3])
      const values: number[] = []
      heap.forEach((v) => values.push(v))
      expect(values).toContain(1)
      expect(values).toContain(2)
      expect(values).toContain(3)
    })
  })

  describe('heapify', () => {
    it('should re-heapify after manual modification', () => {
      heap.fromArray([5, 3, 7, 1, 4])
      heap.heapify()
      expect(heap.peek()).toBe(1)
    })

    it('should handle empty heap', () => {
      heap.heapify()
      expect(heap.size()).toBe(0)
    })

    it('should handle single element', () => {
      heap.insert(1)
      heap.heapify()
      expect(heap.peek()).toBe(1)
    })

    it('should produce valid sorted output after heapify', () => {
      heap.fromArray([9, 4, 7, 1, 3, 8, 5, 2, 6])
      heap.heapify()
      const sorted: number[] = []
      while (!heap.isEmpty()) {
        sorted.push(heap.extract()!)
      }
      expect(sorted).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })
  })

  describe('DEFAULT_HEAP_OPTIONS', () => {
    it('should have min as default comparator', () => {
      expect(DEFAULT_HEAP_OPTIONS.comparator).toBe('min')
    })
  })

  describe('type exports', () => {
    it('should export HeapOptions type', () => {
      const opts: HeapOptions = { comparator: 'min' }
      expect(opts.comparator).toBe('min')
    })
  })

  describe('string values', () => {
    it('should work with string values in min-heap', () => {
      const h = new BinaryHeap<string>()
      h.insert('cherry')
      h.insert('apple')
      h.insert('banana')
      expect(h.peek()).toBe('apple')
      expect(h.extract()).toBe('apple')
      expect(h.extract()).toBe('banana')
      expect(h.extract()).toBe('cherry')
    })

    it('should work with string values in max-heap', () => {
      const h = new BinaryHeap<string>({ comparator: 'max' })
      h.insert('apple')
      h.insert('cherry')
      h.insert('banana')
      expect(h.peek()).toBe('cherry')
    })
  })

  describe('edge cases', () => {
    it('should handle large number of elements', () => {
      const n = 1000
      for (let i = n; i >= 1; i--) {
        heap.insert(i)
      }
      expect(heap.peek()).toBe(1)
      for (let i = 1; i <= n; i++) {
        expect(heap.extract()).toBe(i)
      }
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle alternating insert and extract', () => {
      heap.insert(5)
      expect(heap.extract()).toBe(5)
      heap.insert(3)
      heap.insert(7)
      expect(heap.extract()).toBe(3)
      expect(heap.extract()).toBe(7)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle fromArray then extract all', () => {
      heap.fromArray([5, 3, 1, 4, 2])
      const sorted: number[] = []
      while (!heap.isEmpty()) {
        sorted.push(heap.extract()!)
      }
      expect(sorted).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle merge then extract all', () => {
      heap.fromArray([5, 1])
      const other = new BinaryHeap<number>()
      other.fromArray([3, 2, 4])
      heap.merge(other)
      const sorted: number[] = []
      while (!heap.isEmpty()) {
        sorted.push(heap.extract()!)
      }
      expect(sorted).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle update after fromArray', () => {
      heap.fromArray([5, 3, 7])
      heap.update(7, 0)
      expect(heap.peek()).toBe(0)
    })

    it('should handle delete after merge', () => {
      heap.fromArray([1, 3])
      const other = new BinaryHeap<number>()
      other.fromArray([2, 4])
      heap.merge(other)
      heap.delete(1)
      expect(heap.peek()).toBe(2)
    })

    it('should handle contains after fromArray', () => {
      heap.fromArray([5, 3, 1, 4, 2])
      expect(heap.contains(3)).toBe(true)
      expect(heap.contains(99)).toBe(false)
    })

    it('should handle forEach after clear and reinsert', () => {
      heap.insert(1)
      heap.clear()
      heap.insert(2)
      heap.insert(3)
      const values: number[] = []
      heap.forEach((v) => values.push(v))
      expect(values.length).toBe(2)
    })
  })
})
