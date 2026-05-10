import { describe, it, expect, beforeEach } from 'vitest'
import { VectorHeap } from '../../src/core/vector-heap/vector-heap.js'
import { DEFAULT_VECTOR_HEAP_OPTIONS } from '../../src/core/vector-heap/types.js'
import type { VectorHeapOptions, VectorHeapStatistics } from '../../src/core/vector-heap/types.js'

function isMinHeapOrdered<T>(heap: VectorHeap<T>, arity: number = 4): boolean {
  const arr = heap.toArray()
  for (let i = 0; i < arr.length; i++) {
    for (let c = 1; c <= arity; c++) {
      const childIdx = arity * i + c
      if (childIdx < arr.length && arr[i]! > arr[childIdx]!) {
        return false
      }
    }
  }
  return true
}

describe('VectorHeap', () => {
  describe('constructor', () => {
    it('should create a heap with default options', () => {
      const heap = new VectorHeap<number>()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should accept custom arity', () => {
      const heap = new VectorHeap<number>({ arity: 2 })
      heap.push(3)
      heap.push(1)
      heap.push(2)
      expect(heap.peek()).toBe(1)
    })

    it('should accept custom comparator', () => {
      const heap = new VectorHeap<number>({
        comparator: (a, b) => b - a,
      })
      heap.push(1)
      heap.push(3)
      heap.push(2)
      expect(heap.peek()).toBe(3)
    })

    it('should accept both arity and comparator', () => {
      const heap = new VectorHeap<number>({ arity: 3, comparator: (a, b) => b - a })
      heap.push(1)
      heap.push(5)
      heap.push(3)
      expect(heap.peek()).toBe(5)
    })

    it('should accept empty options object', () => {
      const heap = new VectorHeap<number>({})
      heap.push(5)
      expect(heap.peek()).toBe(5)
    })

    it('should default to arity 4', () => {
      expect(DEFAULT_VECTOR_HEAP_OPTIONS.arity).toBe(4)
    })
  })

  describe('push', () => {
    let heap: VectorHeap<number>

    beforeEach(() => {
      heap = new VectorHeap<number>()
    })

    it('should add a single element', () => {
      heap.push(5)
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(5)
    })

    it('should add multiple elements', () => {
      heap.push(3)
      heap.push(1)
      heap.push(4)
      expect(heap.size).toBe(3)
    })

    it('should maintain min-heap property', () => {
      heap.push(5)
      heap.push(3)
      heap.push(7)
      heap.push(1)
      expect(heap.peek()).toBe(1)
    })

    it('should handle duplicate values', () => {
      heap.push(5)
      heap.push(5)
      heap.push(5)
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(5)
    })

    it('should handle zero', () => {
      heap.push(0)
      heap.push(-1)
      heap.push(1)
      expect(heap.peek()).toBe(-1)
    })

    it('should handle negative numbers', () => {
      heap.push(-5)
      heap.push(-10)
      heap.push(-3)
      expect(heap.peek()).toBe(-10)
    })

    it('should work with arity 2 (binary heap)', () => {
      const h = new VectorHeap<number>({ arity: 2 })
      h.push(5)
      h.push(3)
      h.push(7)
      h.push(1)
      h.push(4)
      expect(h.peek()).toBe(1)
      expect(isMinHeapOrdered(h, 2)).toBe(true)
    })

    it('should work with arity 8', () => {
      const h = new VectorHeap<number>({ arity: 8 })
      for (let i = 20; i >= 1; i--) {
        h.push(i)
      }
      expect(h.peek()).toBe(1)
      expect(isMinHeapOrdered(h, 8)).toBe(true)
    })

    it('should increment push statistics', () => {
      heap.push(1)
      heap.push(2)
      heap.push(3)
      expect(heap.getStatistics().pushes).toBe(3)
    })

    it('should handle large number of pushes', () => {
      for (let i = 1000; i >= 1; i--) {
        heap.push(i)
      }
      expect(heap.size).toBe(1000)
      expect(heap.peek()).toBe(1)
    })
  })

  describe('pop', () => {
    let heap: VectorHeap<number>

    beforeEach(() => {
      heap = new VectorHeap<number>()
    })

    it('should return undefined from empty heap', () => {
      expect(heap.pop()).toBeUndefined()
    })

    it('should remove and return the minimum element', () => {
      heap.push(3)
      heap.push(1)
      heap.push(2)
      expect(heap.pop()).toBe(1)
      expect(heap.size).toBe(2)
    })

    it('should return elements in sorted order', () => {
      heap.push(5)
      heap.push(3)
      heap.push(1)
      heap.push(4)
      heap.push(2)
      expect(heap.pop()).toBe(1)
      expect(heap.pop()).toBe(2)
      expect(heap.pop()).toBe(3)
      expect(heap.pop()).toBe(4)
      expect(heap.pop()).toBe(5)
    })

    it('should handle popping last element', () => {
      heap.push(42)
      expect(heap.pop()).toBe(42)
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle duplicate values', () => {
      heap.push(5)
      heap.push(5)
      expect(heap.pop()).toBe(5)
      expect(heap.pop()).toBe(5)
    })

    it('should increment pop statistics', () => {
      heap.push(1)
      heap.push(2)
      heap.pop()
      heap.pop()
      expect(heap.getStatistics().pops).toBe(2)
    })

    it('should not increment pop stats on empty pop', () => {
      heap.pop()
      expect(heap.getStatistics().pops).toBe(0)
    })

    it('should maintain heap property after pops', () => {
      for (let i = 10; i >= 1; i--) {
        heap.push(i)
      }
      for (let i = 1; i <= 5; i++) {
        expect(heap.pop()).toBe(i)
      }
      expect(heap.peek()).toBe(6)
      expect(heap.size).toBe(5)
    })
  })

  describe('peek', () => {
    let heap: VectorHeap<number>

    beforeEach(() => {
      heap = new VectorHeap<number>()
    })

    it('should return undefined from empty heap', () => {
      expect(heap.peek()).toBeUndefined()
    })

    it('should return the minimum element without removing it', () => {
      heap.push(3)
      heap.push(1)
      heap.push(2)
      expect(heap.peek()).toBe(1)
      expect(heap.size).toBe(3)
    })

    it('should return the same element on repeated calls', () => {
      heap.push(5)
      expect(heap.peek()).toBe(5)
      expect(heap.peek()).toBe(5)
      expect(heap.peek()).toBe(5)
    })

    it('should update after pop', () => {
      heap.push(3)
      heap.push(1)
      heap.push(2)
      heap.pop()
      expect(heap.peek()).toBe(2)
    })
  })

  describe('pushPop', () => {
    let heap: VectorHeap<number>

    beforeEach(() => {
      heap = new VectorHeap<number>()
    })

    it('should return value when heap is empty', () => {
      expect(heap.pushPop(5)).toBe(5)
      expect(heap.size).toBe(0)
    })

    it('should return value when it is smaller than min', () => {
      heap.push(10)
      heap.push(20)
      expect(heap.pushPop(5)).toBe(5)
      expect(heap.peek()).toBe(10)
    })

    it('should return value when equal to min', () => {
      heap.push(10)
      expect(heap.pushPop(10)).toBe(10)
    })

    it('should replace min and return old min when value is larger', () => {
      heap.push(10)
      heap.push(20)
      expect(heap.pushPop(15)).toBe(10)
      expect(heap.peek()).toBe(15)
    })

    it('should maintain heap property', () => {
      heap.push(10)
      heap.push(30)
      heap.push(20)
      heap.pushPop(25)
      const sorted: number[] = []
      while (!heap.isEmpty()) {
        sorted.push(heap.pop()!)
      }
      expect(sorted).toEqual([20, 25, 30])
    })

    it('should update push and pop statistics when swap occurs', () => {
      heap.push(10)
      heap.pushPop(20)
      expect(heap.getStatistics().pops).toBe(1)
      expect(heap.getStatistics().pushes).toBe(2)
    })
  })

  describe('replace', () => {
    let heap: VectorHeap<number>

    beforeEach(() => {
      heap = new VectorHeap<number>()
    })

    it('should return undefined from empty heap', () => {
      expect(heap.replace(5)).toBeUndefined()
    })

    it('should replace the root and return old root', () => {
      heap.push(10)
      heap.push(20)
      heap.push(30)
      expect(heap.replace(5)).toBe(10)
      expect(heap.peek()).toBe(5)
    })

    it('should replace with larger value and re-heapify', () => {
      heap.push(10)
      heap.push(20)
      heap.push(30)
      heap.replace(25)
      expect(heap.peek()).toBe(20)
    })

    it('should maintain heap property after replace', () => {
      heap.push(1)
      heap.push(2)
      heap.push(3)
      heap.push(4)
      heap.replace(0)
      const sorted: number[] = []
      while (!heap.isEmpty()) {
        sorted.push(heap.pop()!)
      }
      expect(sorted).toEqual([0, 2, 3, 4])
    })

    it('should maintain size after replace', () => {
      heap.push(1)
      heap.push(2)
      heap.push(3)
      heap.replace(10)
      expect(heap.size).toBe(3)
    })
  })

  describe('heapify', () => {
    let heap: VectorHeap<number>

    beforeEach(() => {
      heap = new VectorHeap<number>()
    })

    it('should create a valid heap from an array', () => {
      heap.heapify([5, 3, 1, 4, 2])
      expect(heap.peek()).toBe(1)
    })

    it('should handle empty array', () => {
      heap.heapify([])
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle single element array', () => {
      heap.heapify([42])
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(42)
    })

    it('should handle already sorted array', () => {
      heap.heapify([1, 2, 3, 4, 5])
      expect(heap.peek()).toBe(1)
    })

    it('should handle reverse sorted array', () => {
      heap.heapify([5, 4, 3, 2, 1])
      expect(heap.peek()).toBe(1)
    })

    it('should produce correctly ordered pops', () => {
      heap.heapify([5, 3, 1, 4, 2])
      const sorted: number[] = []
      while (!heap.isEmpty()) {
        sorted.push(heap.pop()!)
      }
      expect(sorted).toEqual([1, 2, 3, 4, 5])
    })

    it('should replace existing heap data', () => {
      heap.push(100)
      heap.push(200)
      heap.heapify([5, 3, 1])
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(1)
    })

    it('should increment heapify statistics', () => {
      heap.heapify([3, 1, 2])
      expect(heap.getStatistics().heapifies).toBe(1)
    })

    it('should work with arity 2', () => {
      const h = new VectorHeap<number>({ arity: 2 })
      h.heapify([9, 8, 7, 6, 5, 4, 3, 2, 1])
      expect(h.peek()).toBe(1)
      const sorted: number[] = []
      while (!h.isEmpty()) {
        sorted.push(h.pop()!)
      }
      expect(sorted).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('should work with arity 3', () => {
      const h = new VectorHeap<number>({ arity: 3 })
      h.heapify([9, 8, 7, 6, 5, 4, 3, 2, 1])
      expect(h.peek()).toBe(1)
    })

    it('should work with large array', () => {
      const arr = Array.from({ length: 1000 }, (_, i) => 1000 - i)
      heap.heapify(arr)
      expect(heap.peek()).toBe(1)
      expect(heap.size).toBe(1000)
    })

    it('should handle array with duplicates', () => {
      heap.heapify([3, 1, 2, 1, 3])
      expect(heap.peek()).toBe(1)
    })
  })

  describe('merge', () => {
    let heap: VectorHeap<number>

    beforeEach(() => {
      heap = new VectorHeap<number>()
    })

    it('should merge two heaps', () => {
      heap.push(1)
      heap.push(3)
      const other = new VectorHeap<number>()
      other.push(2)
      other.push(4)
      heap.merge(other)
      expect(heap.size).toBe(4)
      expect(heap.peek()).toBe(1)
    })

    it('should merge into empty heap', () => {
      const other = new VectorHeap<number>()
      other.push(1)
      other.push(2)
      heap.merge(other)
      expect(heap.size).toBe(2)
      expect(heap.peek()).toBe(1)
    })

    it('should merge empty heap into non-empty', () => {
      heap.push(1)
      heap.push(2)
      const other = new VectorHeap<number>()
      heap.merge(other)
      expect(heap.size).toBe(2)
    })

    it('should produce sorted output after merge', () => {
      heap.push(1)
      heap.push(5)
      const other = new VectorHeap<number>()
      other.push(2)
      other.push(3)
      other.push(4)
      heap.merge(other)
      const sorted: number[] = []
      while (!heap.isEmpty()) {
        sorted.push(heap.pop()!)
      }
      expect(sorted).toEqual([1, 2, 3, 4, 5])
    })

    it('should increment merge statistics', () => {
      heap.merge(new VectorHeap<number>())
      expect(heap.getStatistics().merges).toBe(1)
    })

    it('should not modify the other heap', () => {
      const other = new VectorHeap<number>()
      other.push(1)
      other.push(2)
      heap.push(3)
      heap.merge(other)
      expect(other.size).toBe(2)
      expect(other.peek()).toBe(1)
    })
  })

  describe('size', () => {
    it('should return 0 for empty heap', () => {
      const heap = new VectorHeap<number>()
      expect(heap.size).toBe(0)
    })

    it('should reflect number of elements', () => {
      const heap = new VectorHeap<number>()
      heap.push(1)
      heap.push(2)
      heap.push(3)
      expect(heap.size).toBe(3)
    })

    it('should update after pop', () => {
      const heap = new VectorHeap<number>()
      heap.push(1)
      heap.push(2)
      heap.pop()
      expect(heap.size).toBe(1)
    })

    it('should update after clear', () => {
      const heap = new VectorHeap<number>()
      heap.push(1)
      heap.push(2)
      heap.clear()
      expect(heap.size).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new heap', () => {
      expect(new VectorHeap<number>().isEmpty()).toBe(true)
    })

    it('should return false after push', () => {
      const heap = new VectorHeap<number>()
      heap.push(1)
      expect(heap.isEmpty()).toBe(false)
    })

    it('should return true after popping all elements', () => {
      const heap = new VectorHeap<number>()
      heap.push(1)
      heap.pop()
      expect(heap.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      const heap = new VectorHeap<number>()
      heap.push(1)
      heap.push(2)
      heap.clear()
      expect(heap.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should remove all elements', () => {
      const heap = new VectorHeap<number>()
      heap.push(1)
      heap.push(2)
      heap.push(3)
      heap.clear()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should work on already empty heap', () => {
      const heap = new VectorHeap<number>()
      heap.clear()
      expect(heap.size).toBe(0)
    })

    it('should allow push after clear', () => {
      const heap = new VectorHeap<number>()
      heap.push(1)
      heap.clear()
      heap.push(2)
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(2)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty heap', () => {
      const heap = new VectorHeap<number>()
      expect(heap.toArray()).toEqual([])
    })

    it('should return array of all elements', () => {
      const heap = new VectorHeap<number>()
      heap.push(1)
      heap.push(2)
      heap.push(3)
      const arr = heap.toArray()
      expect(arr.length).toBe(3)
      expect(arr).toContain(1)
      expect(arr).toContain(2)
      expect(arr).toContain(3)
    })

    it('should return a copy, not internal array', () => {
      const heap = new VectorHeap<number>()
      heap.push(1)
      heap.push(2)
      const arr = heap.toArray()
      arr.push(999)
      expect(heap.size).toBe(2)
    })
  })

  describe('contains', () => {
    let heap: VectorHeap<number>

    beforeEach(() => {
      heap = new VectorHeap<number>()
      heap.push(10)
      heap.push(20)
      heap.push(30)
    })

    it('should return true for existing value', () => {
      expect(heap.contains(10)).toBe(true)
      expect(heap.contains(20)).toBe(true)
      expect(heap.contains(30)).toBe(true)
    })

    it('should return false for non-existing value', () => {
      expect(heap.contains(999)).toBe(false)
    })

    it('should return false for empty heap', () => {
      const empty = new VectorHeap<number>()
      expect(empty.contains(1)).toBe(false)
    })

    it('should work with custom comparator', () => {
      const h = new VectorHeap<string>({
        comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
      })
      h.push('Hello')
      expect(h.contains('hello')).toBe(true)
      expect(h.contains('HELLO')).toBe(true)
      expect(h.contains('world')).toBe(false)
    })
  })

  describe('update', () => {
    let heap: VectorHeap<number>

    beforeEach(() => {
      heap = new VectorHeap<number>()
      heap.push(10)
      heap.push(20)
      heap.push(30)
    })

    it('should update an existing value', () => {
      expect(heap.update(20, 5)).toBe(true)
      expect(heap.peek()).toBe(5)
    })

    it('should return false for non-existing value', () => {
      expect(heap.update(999, 1)).toBe(false)
    })

    it('should update to larger value', () => {
      expect(heap.update(10, 40)).toBe(true)
      expect(heap.contains(10)).toBe(false)
      expect(heap.contains(40)).toBe(true)
    })

    it('should update to smaller value', () => {
      heap.update(30, 1)
      expect(heap.peek()).toBe(1)
    })

    it('should maintain heap property after update', () => {
      heap.update(20, 25)
      const sorted: number[] = []
      while (!heap.isEmpty()) {
        sorted.push(heap.pop()!)
      }
      expect(sorted).toEqual([10, 25, 30])
    })

    it('should increment update statistics', () => {
      heap.update(20, 5)
      expect(heap.getStatistics().updates).toBe(1)
    })

    it('should not increment stats on failed update', () => {
      heap.update(999, 1)
      expect(heap.getStatistics().updates).toBe(0)
    })

    it('should handle update on single element heap', () => {
      const h = new VectorHeap<number>()
      h.push(5)
      h.update(5, 10)
      expect(h.peek()).toBe(10)
      expect(h.size).toBe(1)
    })
  })

  describe('remove', () => {
    let heap: VectorHeap<number>

    beforeEach(() => {
      heap = new VectorHeap<number>()
      heap.push(10)
      heap.push(20)
      heap.push(30)
    })

    it('should remove an existing value', () => {
      expect(heap.remove(20)).toBe(true)
      expect(heap.size).toBe(2)
      expect(heap.contains(20)).toBe(false)
    })

    it('should return false for non-existing value', () => {
      expect(heap.remove(999)).toBe(false)
      expect(heap.size).toBe(3)
    })

    it('should remove the root element', () => {
      expect(heap.remove(10)).toBe(true)
      expect(heap.peek()).toBe(20)
    })

    it('should remove the last element', () => {
      expect(heap.remove(30)).toBe(true)
      expect(heap.size).toBe(2)
    })

    it('should maintain heap property after remove', () => {
      heap.remove(20)
      const sorted: number[] = []
      while (!heap.isEmpty()) {
        sorted.push(heap.pop()!)
      }
      expect(sorted).toEqual([10, 30])
    })

    it('should increment remove statistics', () => {
      heap.remove(20)
      expect(heap.getStatistics().removes).toBe(1)
    })

    it('should not increment stats on failed remove', () => {
      heap.remove(999)
      expect(heap.getStatistics().removes).toBe(0)
    })

    it('should handle remove from single element heap', () => {
      const h = new VectorHeap<number>()
      h.push(5)
      expect(h.remove(5)).toBe(true)
      expect(h.isEmpty()).toBe(true)
    })
  })

  describe('forEach', () => {
    it('should iterate over all elements', () => {
      const heap = new VectorHeap<number>()
      heap.push(1)
      heap.push(2)
      heap.push(3)
      const values: number[] = []
      heap.forEach((v) => values.push(v))
      expect(values.length).toBe(3)
      expect(values).toContain(1)
      expect(values).toContain(2)
      expect(values).toContain(3)
    })

    it('should provide correct indices', () => {
      const heap = new VectorHeap<number>()
      heap.push(10)
      heap.push(20)
      heap.push(30)
      const indices: number[] = []
      heap.forEach((_, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('should not iterate on empty heap', () => {
      const heap = new VectorHeap<number>()
      let count = 0
      heap.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('should iterate in heap order (not sorted)', () => {
      const heap = new VectorHeap<number>()
      heap.push(3)
      heap.push(1)
      heap.push(2)
      const values: number[] = []
      heap.forEach((v) => values.push(v))
      expect(values.length).toBe(3)
    })
  })

  describe('Symbol.iterator', () => {
    it('should be iterable', () => {
      const heap = new VectorHeap<number>()
      heap.push(1)
      heap.push(2)
      heap.push(3)
      const values = [...heap]
      expect(values.length).toBe(3)
    })

    it('should work with for...of', () => {
      const heap = new VectorHeap<number>()
      heap.push(10)
      heap.push(20)
      const values: number[] = []
      for (const v of heap) {
        values.push(v)
      }
      expect(values.length).toBe(2)
    })

    it('should work on empty heap', () => {
      const heap = new VectorHeap<number>()
      const values = [...heap]
      expect(values).toEqual([])
    })

    it('should spread into array', () => {
      const heap = new VectorHeap<number>()
      heap.push(1)
      heap.push(2)
      heap.push(3)
      expect([...heap].length).toBe(3)
    })
  })

  describe('getStatistics', () => {
    it('should return initial statistics', () => {
      const heap = new VectorHeap<number>()
      const stats = heap.getStatistics()
      expect(stats.pushes).toBe(0)
      expect(stats.pops).toBe(0)
      expect(stats.heapifies).toBe(0)
      expect(stats.merges).toBe(0)
      expect(stats.updates).toBe(0)
      expect(stats.removes).toBe(0)
      expect(stats.siftUps).toBe(0)
      expect(stats.siftDowns).toBe(0)
    })

    it('should track all statistics', () => {
      const heap = new VectorHeap<number>()
      heap.push(10)
      heap.push(20)
      heap.push(30)
      heap.pop()
      heap.heapify([5, 3, 1])
      const other = new VectorHeap<number>()
      other.push(4)
      heap.merge(other)
      heap.update(3, 2)
      heap.remove(5)

      const stats = heap.getStatistics()
      expect(stats.pushes).toBe(4)
      expect(stats.pops).toBe(1)
      expect(stats.heapifies).toBe(1)
      expect(stats.merges).toBe(1)
      expect(stats.updates).toBe(1)
      expect(stats.removes).toBe(1)
      expect(stats.siftUps).toBeGreaterThan(0)
      expect(stats.siftDowns).toBeGreaterThan(0)
    })

    it('should return a copy of statistics', () => {
      const heap = new VectorHeap<number>()
      heap.push(1)
      const stats1 = heap.getStatistics()
      stats1.pushes = 999
      const stats2 = heap.getStatistics()
      expect(stats2.pushes).toBe(1)
    })
  })

  describe('max-heap mode', () => {
    it('should work as a max-heap', () => {
      const heap = new VectorHeap<number>({ comparator: (a, b) => b - a })
      heap.push(1)
      heap.push(5)
      heap.push(3)
      expect(heap.peek()).toBe(5)
    })

    it('should pop in descending order', () => {
      const heap = new VectorHeap<number>({ comparator: (a, b) => b - a })
      heap.push(1)
      heap.push(5)
      heap.push(3)
      heap.push(2)
      heap.push(4)
      expect(heap.pop()).toBe(5)
      expect(heap.pop()).toBe(4)
      expect(heap.pop()).toBe(3)
      expect(heap.pop()).toBe(2)
      expect(heap.pop()).toBe(1)
    })

    it('should work with heapify in max-heap mode', () => {
      const heap = new VectorHeap<number>({ comparator: (a, b) => b - a })
      heap.heapify([1, 2, 3, 4, 5])
      expect(heap.peek()).toBe(5)
    })

    it('should work with pushPop in max-heap mode', () => {
      const heap = new VectorHeap<number>({ comparator: (a, b) => b - a })
      heap.push(10)
      heap.push(20)
      expect(heap.pushPop(5)).toBe(20)
      expect(heap.pushPop(25)).toBe(25)
    })
  })

  describe('different arities', () => {
    it('should work with arity 2 (binary heap)', () => {
      const heap = new VectorHeap<number>({ arity: 2 })
      for (let i = 100; i >= 1; i--) {
        heap.push(i)
      }
      for (let i = 1; i <= 100; i++) {
        expect(heap.pop()).toBe(i)
      }
    })

    it('should work with arity 3', () => {
      const heap = new VectorHeap<number>({ arity: 3 })
      for (let i = 100; i >= 1; i--) {
        heap.push(i)
      }
      for (let i = 1; i <= 100; i++) {
        expect(heap.pop()).toBe(i)
      }
    })

    it('should work with arity 4 (default)', () => {
      const heap = new VectorHeap<number>({ arity: 4 })
      for (let i = 100; i >= 1; i--) {
        heap.push(i)
      }
      for (let i = 1; i <= 100; i++) {
        expect(heap.pop()).toBe(i)
      }
    })

    it('should work with arity 5', () => {
      const heap = new VectorHeap<number>({ arity: 5 })
      for (let i = 100; i >= 1; i--) {
        heap.push(i)
      }
      for (let i = 1; i <= 100; i++) {
        expect(heap.pop()).toBe(i)
      }
    })

    it('should work with arity 8', () => {
      const heap = new VectorHeap<number>({ arity: 8 })
      for (let i = 100; i >= 1; i--) {
        heap.push(i)
      }
      for (let i = 1; i <= 100; i++) {
        expect(heap.pop()).toBe(i)
      }
    })

    it('should work with arity 16', () => {
      const heap = new VectorHeap<number>({ arity: 16 })
      for (let i = 100; i >= 1; i--) {
        heap.push(i)
      }
      for (let i = 1; i <= 100; i++) {
        expect(heap.pop()).toBe(i)
      }
    })
  })

  describe('string type', () => {
    it('should work with strings', () => {
      const heap = new VectorHeap<string>()
      heap.push('cherry')
      heap.push('apple')
      heap.push('banana')
      expect(heap.peek()).toBe('apple')
      expect(heap.pop()).toBe('apple')
      expect(heap.pop()).toBe('banana')
    })

    it('should work with custom string comparator', () => {
      const heap = new VectorHeap<string>({
        comparator: (a, b) => b.localeCompare(a),
      })
      heap.push('apple')
      heap.push('banana')
      heap.push('cherry')
      expect(heap.peek()).toBe('cherry')
    })
  })

  describe('object type', () => {
    it('should work with objects using custom comparator', () => {
      interface Item {
        priority: number
        name: string
      }
      const heap = new VectorHeap<Item>({
        comparator: (a, b) => a.priority - b.priority,
      })
      heap.push({ priority: 3, name: 'low' })
      heap.push({ priority: 1, name: 'high' })
      heap.push({ priority: 2, name: 'medium' })
      expect(heap.peek()!.name).toBe('high')
    })
  })

  describe('edge cases', () => {
    it('should handle single element operations', () => {
      const heap = new VectorHeap<number>()
      heap.push(42)
      expect(heap.peek()).toBe(42)
      expect(heap.pop()).toBe(42)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle two elements', () => {
      const heap = new VectorHeap<number>()
      heap.push(2)
      heap.push(1)
      expect(heap.pop()).toBe(1)
      expect(heap.pop()).toBe(2)
    })

    it('should handle many duplicate values', () => {
      const heap = new VectorHeap<number>()
      for (let i = 0; i < 100; i++) {
        heap.push(5)
      }
      expect(heap.size).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(heap.pop()).toBe(5)
      }
    })

    it('should handle clear and reuse', () => {
      const heap = new VectorHeap<number>()
      heap.push(1)
      heap.push(2)
      heap.clear()
      heap.push(3)
      heap.push(4)
      expect(heap.size).toBe(2)
      expect(heap.peek()).toBe(3)
    })

    it('should handle heapify on existing heap', () => {
      const heap = new VectorHeap<number>()
      heap.push(100)
      heap.push(200)
      heap.heapify([5, 3, 1, 4, 2])
      expect(heap.size).toBe(5)
      expect(heap.peek()).toBe(1)
    })

    it('should handle consecutive pushPop operations', () => {
      const heap = new VectorHeap<number>()
      heap.push(10)
      expect(heap.pushPop(5)).toBe(5)
      expect(heap.pushPop(20)).toBe(10)
      expect(heap.pushPop(15)).toBe(15)
      expect(heap.pushPop(3)).toBe(3)
      expect(heap.peek()).toBe(20)
    })

    it('should handle statistics not affected by clear', () => {
      const heap = new VectorHeap<number>()
      heap.push(1)
      heap.push(2)
      heap.clear()
      expect(heap.getStatistics().pushes).toBe(2)
    })

    it('should handle replace on heap with one element', () => {
      const heap = new VectorHeap<number>()
      heap.push(10)
      expect(heap.replace(5)).toBe(10)
      expect(heap.peek()).toBe(5)
      expect(heap.size).toBe(1)
    })

    it('should handle remove on heap with one element', () => {
      const heap = new VectorHeap<number>()
      heap.push(10)
      expect(heap.remove(10)).toBe(true)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle update on root element', () => {
      const heap = new VectorHeap<number>()
      heap.push(1)
      heap.push(10)
      heap.push(20)
      heap.update(1, 30)
      expect(heap.peek()).toBe(10)
    })

    it('should handle update on leaf element', () => {
      const heap = new VectorHeap<number>()
      heap.push(10)
      heap.push(20)
      heap.push(30)
      heap.update(30, 5)
      expect(heap.peek()).toBe(5)
    })
  })

  describe('exports', () => {
    it('should export DEFAULT_VECTOR_HEAP_OPTIONS', () => {
      expect(DEFAULT_VECTOR_HEAP_OPTIONS).toBeDefined()
      expect(DEFAULT_VECTOR_HEAP_OPTIONS.arity).toBe(4)
    })

    it('should export types correctly', () => {
      const options: VectorHeapOptions<number> = {
        arity: 4,
        comparator: (a, b) => a - b,
      }
      expect(options.arity).toBe(4)

      const stats: VectorHeapStatistics = {
        pushes: 0,
        pops: 0,
        heapifies: 0,
        merges: 0,
        updates: 0,
        removes: 0,
        siftUps: 0,
        siftDowns: 0,
      }
      expect(stats.pushes).toBe(0)
    })
  })

  describe('stress test', () => {
    it('should handle 10000 elements', () => {
      const heap = new VectorHeap<number>({ arity: 4 })
      for (let i = 10000; i >= 1; i--) {
        heap.push(i)
      }
      expect(heap.peek()).toBe(1)
      for (let i = 1; i <= 10000; i++) {
        expect(heap.pop()).toBe(i)
      }
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle random insertions', () => {
      const heap = new VectorHeap<number>({ arity: 4 })
      const values: number[] = []
      for (let i = 0; i < 500; i++) {
        const v = Math.floor(Math.random() * 1000)
        values.push(v)
        heap.push(v)
      }
      values.sort((a, b) => a - b)
      for (const v of values) {
        expect(heap.pop()).toBe(v)
      }
    })

    it('should handle mixed operations', () => {
      const heap = new VectorHeap<number>({ arity: 4 })
      const reference: number[] = []

      for (let i = 0; i < 200; i++) {
        const op = Math.floor(Math.random() * 3)
        if (op === 0 || reference.length === 0) {
          const v = Math.floor(Math.random() * 100)
          heap.push(v)
          reference.push(v)
          reference.sort((a, b) => a - b)
        } else if (op === 1) {
          const popped = heap.pop()
          const expected = reference.shift()
          expect(popped).toBe(expected)
        } else {
          const v = Math.floor(Math.random() * 100)
          heap.push(v)
          reference.push(v)
          reference.sort((a, b) => a - b)
        }
      }

      while (reference.length > 0) {
        expect(heap.pop()).toBe(reference.shift())
      }
    })
  })
})
