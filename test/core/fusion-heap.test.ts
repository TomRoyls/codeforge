import { describe, it, expect, beforeEach } from 'vitest'
import { FusionHeap } from '../../src/core/fusion-heap/fusion-heap.js'
import { DEFAULT_FUSION_HEAP_OPTIONS } from '../../src/core/fusion-heap/types.js'
import type { FusionHeapOptions, FusionHeapStatistics } from '../../src/core/fusion-heap/types.js'

describe('FusionHeap', () => {
  describe('constructor', () => {
    it('should create a heap with default options', () => {
      const heap = new FusionHeap<number>()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty).toBe(true)
    })

    it('should accept custom comparator', () => {
      const heap = new FusionHeap<number>({ comparator: (a, b) => b - a })
      heap.insert(1)
      heap.insert(3)
      heap.insert(2)
      expect(heap.findMin()).toBe(3)
    })

    it('should accept empty options object', () => {
      const heap = new FusionHeap<number>({})
      heap.insert(5)
      expect(heap.findMin()).toBe(5)
    })

    it('should have default comparator for numbers', () => {
      expect(DEFAULT_FUSION_HEAP_OPTIONS.comparator(1, 2)).toBe(-1)
      expect(DEFAULT_FUSION_HEAP_OPTIONS.comparator(2, 1)).toBe(1)
      expect(DEFAULT_FUSION_HEAP_OPTIONS.comparator(1, 1)).toBe(0)
    })

    it('should start with zero statistics', () => {
      const heap = new FusionHeap<number>()
      const stats = heap.getStatistics()
      expect(stats.inserts).toBe(0)
      expect(stats.extracts).toBe(0)
      expect(stats.decreaseKeys).toBe(0)
      expect(stats.deletes).toBe(0)
      expect(stats.merges).toBe(0)
      expect(stats.consolidations).toBe(0)
      expect(stats.maxSize).toBe(0)
    })
  })

  describe('insert', () => {
    let heap: FusionHeap<number>

    beforeEach(() => {
      heap = new FusionHeap<number>()
    })

    it('should add a single element', () => {
      heap.insert(5)
      expect(heap.size).toBe(1)
      expect(heap.findMin()).toBe(5)
    })

    it('should add multiple elements', () => {
      heap.insert(3)
      heap.insert(1)
      heap.insert(4)
      expect(heap.size).toBe(3)
    })

    it('should track minimum correctly', () => {
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.insert(1)
      expect(heap.findMin()).toBe(1)
    })

    it('should handle duplicate values', () => {
      heap.insert(5)
      heap.insert(5)
      heap.insert(5)
      expect(heap.size).toBe(3)
      expect(heap.findMin()).toBe(5)
    })

    it('should handle zero', () => {
      heap.insert(0)
      heap.insert(-1)
      heap.insert(1)
      expect(heap.findMin()).toBe(-1)
    })

    it('should handle negative numbers', () => {
      heap.insert(-5)
      heap.insert(-10)
      heap.insert(-3)
      expect(heap.findMin()).toBe(-10)
    })

    it('should increment insert statistics', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      expect(heap.getStatistics().inserts).toBe(3)
    })

    it('should update maxSize statistic', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      expect(heap.getStatistics().maxSize).toBe(3)
    })

    it('should handle large number of inserts', () => {
      for (let i = 1000; i >= 1; i--) {
        heap.insert(i)
      }
      expect(heap.size).toBe(1000)
      expect(heap.findMin()).toBe(1)
    })

    it('should maintain maxSize as peak value after extracts', () => {
      for (let i = 0; i < 10; i++) heap.insert(i)
      expect(heap.getStatistics().maxSize).toBe(10)
      heap.extractMin()
      heap.extractMin()
      expect(heap.getStatistics().maxSize).toBe(10)
    })
  })

  describe('extractMin', () => {
    let heap: FusionHeap<number>

    beforeEach(() => {
      heap = new FusionHeap<number>()
    })

    it('should return undefined from empty heap', () => {
      expect(heap.extractMin()).toBeUndefined()
    })

    it('should extract the minimum element', () => {
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      expect(heap.extractMin()).toBe(1)
      expect(heap.size).toBe(2)
    })

    it('should return elements in sorted order', () => {
      heap.insert(5)
      heap.insert(3)
      heap.insert(1)
      heap.insert(4)
      heap.insert(2)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(2)
      expect(heap.extractMin()).toBe(3)
      expect(heap.extractMin()).toBe(4)
      expect(heap.extractMin()).toBe(5)
    })

    it('should handle extracting last element', () => {
      heap.insert(42)
      expect(heap.extractMin()).toBe(42)
      expect(heap.size).toBe(0)
      expect(heap.isEmpty).toBe(true)
    })

    it('should handle duplicate values', () => {
      heap.insert(5)
      heap.insert(5)
      expect(heap.extractMin()).toBe(5)
      expect(heap.extractMin()).toBe(5)
    })

    it('should increment extract statistics', () => {
      heap.insert(1)
      heap.insert(2)
      heap.extractMin()
      heap.extractMin()
      expect(heap.getStatistics().extracts).toBe(2)
    })

    it('should not increment stats on empty extract', () => {
      heap.extractMin()
      expect(heap.getStatistics().extracts).toBe(0)
    })

    it('should maintain correctness after partial extracts', () => {
      for (let i = 10; i >= 1; i--) {
        heap.insert(i)
      }
      for (let i = 1; i <= 5; i++) {
        expect(heap.extractMin()).toBe(i)
      }
      expect(heap.findMin()).toBe(6)
      expect(heap.size).toBe(5)
    })

    it('should handle extract from buffer only (below threshold)', () => {
      heap.insert(5)
      heap.insert(3)
      heap.insert(1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(3)
      expect(heap.extractMin()).toBe(5)
    })

    it('should handle alternating insert and extract', () => {
      heap.insert(5)
      expect(heap.extractMin()).toBe(5)
      heap.insert(3)
      heap.insert(1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(3)
    })

    it('should return undefined when all elements extracted', () => {
      heap.insert(1)
      heap.extractMin()
      expect(heap.extractMin()).toBeUndefined()
    })
  })

  describe('findMin', () => {
    let heap: FusionHeap<number>

    beforeEach(() => {
      heap = new FusionHeap<number>()
    })

    it('should return undefined from empty heap', () => {
      expect(heap.findMin()).toBeUndefined()
    })

    it('should return the minimum element without removing it', () => {
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      expect(heap.findMin()).toBe(1)
      expect(heap.size).toBe(3)
    })

    it('should return the same element on repeated calls', () => {
      heap.insert(5)
      expect(heap.findMin()).toBe(5)
      expect(heap.findMin()).toBe(5)
      expect(heap.findMin()).toBe(5)
    })

    it('should update after extractMin', () => {
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      heap.extractMin()
      expect(heap.findMin()).toBe(2)
    })

    it('should find minimum across heap and buffer', () => {
      heap.insert(10)
      heap.insert(20)
      heap.extractMin()
      heap.insert(1)
      heap.insert(5)
      expect(heap.findMin()).toBe(1)
    })

    it('should handle single element', () => {
      heap.insert(42)
      expect(heap.findMin()).toBe(42)
    })

    it('should return undefined after clearing all elements', () => {
      heap.insert(1)
      heap.insert(2)
      heap.extractMin()
      heap.extractMin()
      expect(heap.findMin()).toBeUndefined()
    })

    it('should work with negative numbers', () => {
      heap.insert(-10)
      heap.insert(-5)
      heap.insert(-20)
      expect(heap.findMin()).toBe(-20)
    })
  })

  describe('delete', () => {
    let heap: FusionHeap<number>

    beforeEach(() => {
      heap = new FusionHeap<number>()
      heap.insert(10)
      heap.insert(20)
      heap.insert(30)
    })

    it('should delete an existing value', () => {
      expect(heap.delete(20)).toBe(true)
      expect(heap.size).toBe(2)
      expect(heap.contains(20)).toBe(false)
    })

    it('should return false for non-existing value', () => {
      expect(heap.delete(999)).toBe(false)
      expect(heap.size).toBe(3)
    })

    it('should delete the minimum element', () => {
      expect(heap.delete(10)).toBe(true)
      expect(heap.findMin()).toBe(20)
    })

    it('should delete the maximum element', () => {
      expect(heap.delete(30)).toBe(true)
      expect(heap.size).toBe(2)
    })

    it('should maintain correct order after delete', () => {
      heap.delete(20)
      expect(heap.extractMin()).toBe(10)
      expect(heap.extractMin()).toBe(30)
    })

    it('should increment delete statistics', () => {
      heap.delete(20)
      expect(heap.getStatistics().deletes).toBe(1)
    })

    it('should not increment stats on failed delete', () => {
      heap.delete(999)
      expect(heap.getStatistics().deletes).toBe(0)
    })

    it('should handle delete from single element heap', () => {
      const h = new FusionHeap<number>()
      h.insert(5)
      expect(h.delete(5)).toBe(true)
      expect(h.isEmpty).toBe(true)
    })
  })

  describe('decreaseKey', () => {
    let heap: FusionHeap<number>

    beforeEach(() => {
      heap = new FusionHeap<number>()
      heap.insert(10)
      heap.insert(20)
      heap.insert(30)
    })

    it('should decrease a key in the heap', () => {
      expect(heap.decreaseKey(20, 5)).toBe(true)
      expect(heap.findMin()).toBe(5)
    })

    it('should return false for non-existing value', () => {
      expect(heap.decreaseKey(999, 1)).toBe(false)
    })

    it('should update the value correctly', () => {
      heap.decreaseKey(30, 1)
      expect(heap.contains(30)).toBe(false)
      expect(heap.contains(1)).toBe(true)
    })

    it('should maintain correct order after decreaseKey', () => {
      heap.decreaseKey(30, 5)
      expect(heap.extractMin()).toBe(5)
      expect(heap.extractMin()).toBe(10)
      expect(heap.extractMin()).toBe(20)
    })

    it('should increment decreaseKey statistics', () => {
      heap.decreaseKey(20, 5)
      expect(heap.getStatistics().decreaseKeys).toBe(1)
    })

    it('should not increment stats on failed decreaseKey', () => {
      heap.decreaseKey(999, 1)
      expect(heap.getStatistics().decreaseKeys).toBe(0)
    })

    it('should handle decreaseKey on root element', () => {
      heap.decreaseKey(10, 1)
      expect(heap.findMin()).toBe(1)
    })

    it('should handle decreaseKey on single element', () => {
      const h = new FusionHeap<number>()
      h.insert(10)
      h.decreaseKey(10, 5)
      expect(h.findMin()).toBe(5)
      expect(h.size).toBe(1)
    })
  })

  describe('merge', () => {
    let heap: FusionHeap<number>

    beforeEach(() => {
      heap = new FusionHeap<number>()
    })

    it('should merge two heaps', () => {
      heap.insert(1)
      heap.insert(3)
      const other = new FusionHeap<number>()
      other.insert(2)
      other.insert(4)
      heap.merge(other)
      expect(heap.size).toBe(4)
      expect(heap.findMin()).toBe(1)
    })

    it('should merge into empty heap', () => {
      const other = new FusionHeap<number>()
      other.insert(1)
      other.insert(2)
      heap.merge(other)
      expect(heap.size).toBe(2)
      expect(heap.findMin()).toBe(1)
    })

    it('should merge empty heap into non-empty', () => {
      heap.insert(1)
      heap.insert(2)
      const other = new FusionHeap<number>()
      heap.merge(other)
      expect(heap.size).toBe(2)
    })

    it('should produce sorted output after merge', () => {
      heap.insert(1)
      heap.insert(5)
      const other = new FusionHeap<number>()
      other.insert(2)
      other.insert(3)
      other.insert(4)
      heap.merge(other)
      const sorted: number[] = []
      while (!heap.isEmpty) {
        sorted.push(heap.extractMin()!)
      }
      expect(sorted).toEqual([1, 2, 3, 4, 5])
    })

    it('should increment merge statistics', () => {
      heap.merge(new FusionHeap<number>())
      expect(heap.getStatistics().merges).toBe(1)
    })

    it('should not modify the other heap', () => {
      const other = new FusionHeap<number>()
      other.insert(1)
      other.insert(2)
      heap.insert(3)
      heap.merge(other)
      expect(other.size).toBe(2)
      expect(other.findMin()).toBe(1)
    })

    it('should update maxSize after merge', () => {
      heap.insert(1)
      const other = new FusionHeap<number>()
      for (let i = 0; i < 10; i++) other.insert(i)
      heap.merge(other)
      expect(heap.getStatistics().maxSize).toBe(11)
    })

    it('should handle merging large heaps', () => {
      for (let i = 0; i < 50; i++) heap.insert(i)
      const other = new FusionHeap<number>()
      for (let i = 50; i < 100; i++) other.insert(i)
      heap.merge(other)
      expect(heap.size).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(heap.extractMin()).toBe(i)
      }
    })
  })

  describe('size getter', () => {
    it('should return 0 for empty heap', () => {
      const heap = new FusionHeap<number>()
      expect(heap.size).toBe(0)
    })

    it('should reflect number of elements', () => {
      const heap = new FusionHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      expect(heap.size).toBe(3)
    })

    it('should update after extractMin', () => {
      const heap = new FusionHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.extractMin()
      expect(heap.size).toBe(1)
    })

    it('should update after delete', () => {
      const heap = new FusionHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.delete(1)
      expect(heap.size).toBe(1)
    })

    it('should update after clear', () => {
      const heap = new FusionHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.clear()
      expect(heap.size).toBe(0)
    })
  })

  describe('isEmpty getter', () => {
    it('should return true for new heap', () => {
      expect(new FusionHeap<number>().isEmpty).toBe(true)
    })

    it('should return false after insert', () => {
      const heap = new FusionHeap<number>()
      heap.insert(1)
      expect(heap.isEmpty).toBe(false)
    })

    it('should return true after extracting all elements', () => {
      const heap = new FusionHeap<number>()
      heap.insert(1)
      heap.extractMin()
      expect(heap.isEmpty).toBe(true)
    })

    it('should return true after clearing', () => {
      const heap = new FusionHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.clear()
      expect(heap.isEmpty).toBe(true)
    })

    it('should return true after deleting all elements', () => {
      const heap = new FusionHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.delete(1)
      heap.delete(2)
      expect(heap.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('should remove all elements', () => {
      const heap = new FusionHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.clear()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty).toBe(true)
    })

    it('should work on already empty heap', () => {
      const heap = new FusionHeap<number>()
      heap.clear()
      expect(heap.size).toBe(0)
    })

    it('should allow insert after clear', () => {
      const heap = new FusionHeap<number>()
      heap.insert(1)
      heap.clear()
      heap.insert(2)
      expect(heap.size).toBe(1)
      expect(heap.findMin()).toBe(2)
    })

    it('should not reset statistics', () => {
      const heap = new FusionHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.clear()
      expect(heap.getStatistics().inserts).toBe(2)
    })
  })

  describe('contains', () => {
    let heap: FusionHeap<number>

    beforeEach(() => {
      heap = new FusionHeap<number>()
      heap.insert(10)
      heap.insert(20)
      heap.insert(30)
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
      const empty = new FusionHeap<number>()
      expect(empty.contains(1)).toBe(false)
    })

    it('should work after extractMin', () => {
      heap.extractMin()
      expect(heap.contains(10)).toBe(false)
      expect(heap.contains(20)).toBe(true)
    })

    it('should work after delete', () => {
      heap.delete(20)
      expect(heap.contains(20)).toBe(false)
    })

    it('should work with custom comparator', () => {
      const h = new FusionHeap<string>({
        comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
      })
      h.insert('Hello')
      expect(h.contains('hello')).toBe(true)
      expect(h.contains('HELLO')).toBe(true)
      expect(h.contains('world')).toBe(false)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty heap', () => {
      const heap = new FusionHeap<number>()
      expect(heap.toArray()).toEqual([])
    })

    it('should return array of all elements', () => {
      const heap = new FusionHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      const arr = heap.toArray()
      expect(arr.length).toBe(3)
      expect(arr).toContain(1)
      expect(arr).toContain(2)
      expect(arr).toContain(3)
    })

    it('should return a copy, not internal array', () => {
      const heap = new FusionHeap<number>()
      heap.insert(1)
      heap.insert(2)
      const arr = heap.toArray()
      arr.push(999)
      expect(heap.size).toBe(2)
    })

    it('should include elements from both heap and buffer', () => {
      const heap = new FusionHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      expect(heap.toArray().length).toBe(3)
    })
  })

  describe('forEach', () => {
    it('should iterate over all elements', () => {
      const heap = new FusionHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      const values: number[] = []
      heap.forEach((v) => values.push(v))
      expect(values.length).toBe(3)
      expect(values).toContain(1)
      expect(values).toContain(2)
      expect(values).toContain(3)
    })

    it('should provide correct indices', () => {
      const heap = new FusionHeap<number>()
      heap.insert(10)
      heap.insert(20)
      heap.insert(30)
      const indices: number[] = []
      heap.forEach((_, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('should not iterate on empty heap', () => {
      const heap = new FusionHeap<number>()
      let count = 0
      heap.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('should iterate in heap-buffer order', () => {
      const heap = new FusionHeap<number>()
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      const values: number[] = []
      heap.forEach((v) => values.push(v))
      expect(values.length).toBe(3)
    })
  })

  describe('Symbol.iterator', () => {
    it('should be iterable', () => {
      const heap = new FusionHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      const values = [...heap]
      expect(values.length).toBe(3)
    })

    it('should work with for...of', () => {
      const heap = new FusionHeap<number>()
      heap.insert(10)
      heap.insert(20)
      const values: number[] = []
      for (const v of heap) {
        values.push(v)
      }
      expect(values.length).toBe(2)
    })

    it('should work on empty heap', () => {
      const heap = new FusionHeap<number>()
      const values = [...heap]
      expect(values).toEqual([])
    })

    it('should spread into array', () => {
      const heap = new FusionHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      expect([...heap].length).toBe(3)
    })
  })

  describe('values', () => {
    it('should return empty array for empty heap', () => {
      const heap = new FusionHeap<number>()
      expect(heap.values()).toEqual([])
    })

    it('should return elements in sorted ascending order', () => {
      const heap = new FusionHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(1)
      heap.insert(4)
      heap.insert(2)
      expect(heap.values()).toEqual([1, 2, 3, 4, 5])
    })

    it('should return single element', () => {
      const heap = new FusionHeap<number>()
      heap.insert(42)
      expect(heap.values()).toEqual([42])
    })

    it('should handle duplicates', () => {
      const heap = new FusionHeap<number>()
      heap.insert(3)
      heap.insert(1)
      heap.insert(3)
      expect(heap.values()).toEqual([1, 3, 3])
    })

    it('should not modify the heap', () => {
      const heap = new FusionHeap<number>()
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      heap.values()
      expect(heap.size).toBe(3)
    })
  })

  describe('getStatistics', () => {
    it('should return initial statistics', () => {
      const heap = new FusionHeap<number>()
      const stats = heap.getStatistics()
      expect(stats.inserts).toBe(0)
      expect(stats.extracts).toBe(0)
      expect(stats.decreaseKeys).toBe(0)
      expect(stats.deletes).toBe(0)
      expect(stats.merges).toBe(0)
      expect(stats.consolidations).toBe(0)
      expect(stats.maxSize).toBe(0)
    })

    it('should track all operations', () => {
      const heap = new FusionHeap<number>()
      heap.insert(10)
      heap.insert(20)
      heap.insert(30)
      heap.extractMin()
      const other = new FusionHeap<number>()
      other.insert(4)
      heap.merge(other)
      heap.decreaseKey(30, 5)
      heap.delete(20)

      const stats = heap.getStatistics()
      expect(stats.inserts).toBe(4)
      expect(stats.extracts).toBe(1)
      expect(stats.merges).toBe(1)
      expect(stats.decreaseKeys).toBe(1)
      expect(stats.deletes).toBe(1)
    })

    it('should return a copy of statistics', () => {
      const heap = new FusionHeap<number>()
      heap.insert(1)
      const stats1 = heap.getStatistics()
      stats1.inserts = 999
      const stats2 = heap.getStatistics()
      expect(stats2.inserts).toBe(1)
    })

    it('should track maxSize across operations', () => {
      const heap = new FusionHeap<number>()
      for (let i = 0; i < 50; i++) heap.insert(i)
      for (let i = 0; i < 25; i++) heap.extractMin()
      expect(heap.getStatistics().maxSize).toBe(50)
    })

    it('should track consolidations', () => {
      const heap = new FusionHeap<number>()
      for (let i = 0; i < 40; i++) heap.insert(i)
      heap.extractMin()
      expect(heap.getStatistics().consolidations).toBeGreaterThanOrEqual(1)
    })
  })

  describe('toJSON and fromJSON', () => {
    it('should serialize to JSON', () => {
      const heap = new FusionHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      const json = heap.toJSON()
      expect(json.heap).toBeDefined()
      expect(json.buffer).toBeDefined()
      expect(json.size).toBe(3)
    })

    it('should deserialize from JSON', () => {
      const heap = new FusionHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(1)
      const json = heap.toJSON()
      const restored = FusionHeap.fromJSON(json)
      expect(restored.size).toBe(3)
      expect(restored.findMin()).toBe(1)
    })

    it('should round-trip correctly', () => {
      const heap = new FusionHeap<number>()
      for (let i = 10; i >= 1; i--) heap.insert(i)
      const json = heap.toJSON()
      const restored = FusionHeap.fromJSON(json)
      for (let i = 1; i <= 10; i++) {
        expect(restored.extractMin()).toBe(i)
      }
    })

    it('should handle empty heap serialization', () => {
      const heap = new FusionHeap<number>()
      const json = heap.toJSON()
      const restored = FusionHeap.fromJSON(json)
      expect(restored.size).toBe(0)
      expect(restored.isEmpty).toBe(true)
    })

    it('should accept custom comparator in fromJSON', () => {
      const heap = new FusionHeap<number>({ comparator: (a, b) => b - a })
      heap.insert(1)
      heap.insert(5)
      heap.insert(3)
      const json = heap.toJSON()
      const restored = FusionHeap.fromJSON(json, { comparator: (a, b) => b - a })
      expect(restored.extractMin()).toBe(5)
      expect(restored.extractMin()).toBe(3)
      expect(restored.extractMin()).toBe(1)
    })

    it('should produce serializable output for JSON.stringify', () => {
      const heap = new FusionHeap<number>()
      heap.insert(1)
      heap.insert(2)
      const json = JSON.stringify(heap.toJSON())
      expect(json).toContain('"heap"')
      expect(json).toContain('"buffer"')
      expect(json).toContain('"size"')
    })
  })

  describe('lazy consolidation', () => {
    it('should buffer inserts without immediate consolidation', () => {
      const heap = new FusionHeap<number>()
      for (let i = 0; i < 10; i++) heap.insert(i)
      expect(heap.getStatistics().consolidations).toBe(0)
    })

    it('should consolidate when buffer exceeds threshold', () => {
      const heap = new FusionHeap<number>()
      for (let i = 0; i < 40; i++) heap.insert(i)
      heap.extractMin()
      expect(heap.getStatistics().consolidations).toBeGreaterThanOrEqual(1)
    })

    it('should correctly extract elements after consolidation', () => {
      const heap = new FusionHeap<number>()
      for (let i = 40; i >= 1; i--) heap.insert(i)
      for (let i = 1; i <= 40; i++) {
        expect(heap.extractMin()).toBe(i)
      }
    })

    it('should handle merge triggering consolidation on next extract', () => {
      const heap = new FusionHeap<number>()
      heap.insert(1)
      const other = new FusionHeap<number>()
      for (let i = 0; i < 50; i++) other.insert(i)
      heap.merge(other)
      expect(heap.size).toBe(51)
      heap.extractMin()
      expect(heap.getStatistics().consolidations).toBeGreaterThanOrEqual(1)
    })

    it('should maintain correctness with small buffer (below threshold)', () => {
      const heap = new FusionHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(1)
      expect(heap.findMin()).toBe(1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(3)
      expect(heap.extractMin()).toBe(5)
    })

    it('should consolidate when heap is empty but buffer has items', () => {
      const heap = new FusionHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(3)
      expect(heap.extractMin()).toBe(5)
      expect(heap.isEmpty).toBe(true)
    })
  })

  describe('custom comparator', () => {
    it('should work as max-heap with reverse comparator', () => {
      const heap = new FusionHeap<number>({ comparator: (a, b) => b - a })
      heap.insert(1)
      heap.insert(5)
      heap.insert(3)
      expect(heap.findMin()).toBe(5)
    })

    it('should extract in descending order with reverse comparator', () => {
      const heap = new FusionHeap<number>({ comparator: (a, b) => b - a })
      heap.insert(1)
      heap.insert(5)
      heap.insert(3)
      heap.insert(2)
      heap.insert(4)
      expect(heap.extractMin()).toBe(5)
      expect(heap.extractMin()).toBe(4)
      expect(heap.extractMin()).toBe(3)
      expect(heap.extractMin()).toBe(2)
      expect(heap.extractMin()).toBe(1)
    })

    it('should work with string comparator', () => {
      const heap = new FusionHeap<string>()
      heap.insert('cherry')
      heap.insert('apple')
      heap.insert('banana')
      expect(heap.findMin()).toBe('apple')
    })

    it('should work with object comparator', () => {
      interface Item {
        priority: number
        name: string
      }
      const heap = new FusionHeap<Item>({
        comparator: (a, b) => a.priority - b.priority,
      })
      heap.insert({ priority: 3, name: 'low' })
      heap.insert({ priority: 1, name: 'high' })
      heap.insert({ priority: 2, name: 'medium' })
      expect(heap.findMin()!.name).toBe('high')
    })

    it('should work with custom comparator for decreaseKey', () => {
      const heap = new FusionHeap<number>({ comparator: (a, b) => b - a })
      heap.insert(10)
      heap.insert(20)
      heap.decreaseKey(10, 30)
      expect(heap.findMin()).toBe(30)
    })
  })

  describe('edge cases', () => {
    it('should handle single element operations', () => {
      const heap = new FusionHeap<number>()
      heap.insert(42)
      expect(heap.findMin()).toBe(42)
      expect(heap.extractMin()).toBe(42)
      expect(heap.isEmpty).toBe(true)
    })

    it('should handle two elements', () => {
      const heap = new FusionHeap<number>()
      heap.insert(2)
      heap.insert(1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(2)
    })

    it('should handle many duplicate values', () => {
      const heap = new FusionHeap<number>()
      for (let i = 0; i < 100; i++) heap.insert(5)
      expect(heap.size).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(heap.extractMin()).toBe(5)
      }
    })

    it('should handle clear and reuse', () => {
      const heap = new FusionHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.clear()
      heap.insert(3)
      heap.insert(4)
      expect(heap.size).toBe(2)
      expect(heap.findMin()).toBe(3)
    })

    it('should handle delete on empty heap', () => {
      const heap = new FusionHeap<number>()
      expect(heap.delete(1)).toBe(false)
    })

    it('should handle decreaseKey on empty heap', () => {
      const heap = new FusionHeap<number>()
      expect(heap.decreaseKey(1, 0)).toBe(false)
    })

    it('should handle merge with itself-like content', () => {
      const heap = new FusionHeap<number>()
      heap.insert(1)
      const other = new FusionHeap<number>()
      other.insert(1)
      heap.merge(other)
      expect(heap.size).toBe(2)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(1)
    })

    it('should handle sequential inserts and extracts', () => {
      const heap = new FusionHeap<number>()
      for (let round = 0; round < 5; round++) {
        for (let i = 10; i >= 1; i--) heap.insert(i + round * 10)
        for (let i = 1; i <= 10; i++) {
          expect(heap.extractMin()).toBe(i + round * 10)
        }
      }
      expect(heap.isEmpty).toBe(true)
    })

    it('should handle negative numbers correctly', () => {
      const heap = new FusionHeap<number>()
      heap.insert(-100)
      heap.insert(-1)
      heap.insert(0)
      heap.insert(100)
      expect(heap.values()).toEqual([-100, -1, 0, 100])
    })

    it('should handle floating point numbers', () => {
      const heap = new FusionHeap<number>()
      heap.insert(3.14)
      heap.insert(2.71)
      heap.insert(1.41)
      expect(heap.extractMin()).toBe(1.41)
      expect(heap.extractMin()).toBe(2.71)
      expect(heap.extractMin()).toBe(3.14)
    })
  })

  describe('stress test', () => {
    it('should handle 10000 elements', () => {
      const heap = new FusionHeap<number>()
      for (let i = 10000; i >= 1; i--) {
        heap.insert(i)
      }
      expect(heap.findMin()).toBe(1)
      for (let i = 1; i <= 10000; i++) {
        expect(heap.extractMin()).toBe(i)
      }
      expect(heap.isEmpty).toBe(true)
    })

    it('should handle random insertions', () => {
      const heap = new FusionHeap<number>()
      const values: number[] = []
      for (let i = 0; i < 500; i++) {
        const v = Math.floor(Math.random() * 1000)
        values.push(v)
        heap.insert(v)
      }
      values.sort((a, b) => a - b)
      for (const v of values) {
        expect(heap.extractMin()).toBe(v)
      }
    })

    it('should handle mixed operations', () => {
      const heap = new FusionHeap<number>()
      const reference: number[] = []

      for (let i = 0; i < 200; i++) {
        const op = Math.floor(Math.random() * 3)
        if (op === 0 || reference.length === 0) {
          const v = Math.floor(Math.random() * 100)
          heap.insert(v)
          reference.push(v)
          reference.sort((a, b) => a - b)
        } else if (op === 1) {
          const popped = heap.extractMin()
          const expected = reference.shift()
          expect(popped).toBe(expected)
        } else {
          const v = Math.floor(Math.random() * 100)
          heap.insert(v)
          reference.push(v)
          reference.sort((a, b) => a - b)
        }
      }

      while (reference.length > 0) {
        expect(heap.extractMin()).toBe(reference.shift())
      }
    })
  })

  describe('exports', () => {
    it('should export DEFAULT_FUSION_HEAP_OPTIONS', () => {
      expect(DEFAULT_FUSION_HEAP_OPTIONS).toBeDefined()
      expect(typeof DEFAULT_FUSION_HEAP_OPTIONS.comparator).toBe('function')
    })

    it('should export types correctly', () => {
      const options: FusionHeapOptions<number> = {
        comparator: (a, b) => a - b,
      }
      expect(typeof options.comparator).toBe('function')

      const stats: FusionHeapStatistics = {
        inserts: 0,
        extracts: 0,
        decreaseKeys: 0,
        deletes: 0,
        merges: 0,
        consolidations: 0,
        maxSize: 0,
      }
      expect(stats.inserts).toBe(0)
    })
  })
})
