import { describe, it, expect, beforeEach } from 'vitest'
import { MinMaxHeap } from '../../src/core/min-max-heap/min-max-heap.js'
import { DEFAULT_MINMAX_HEAP_OPTIONS } from '../../src/core/min-max-heap/types.js'
import type { HeapItem, MinMaxHeapOptions } from '../../src/core/min-max-heap/types.js'

function validateMinMaxHeap<T>(heap: MinMaxHeap<T>): boolean {
  const arr = heap.toArray()
  for (let i = 0; i < arr.length; i++) {
    const level = Math.floor(Math.log2(i + 1))
    const isMin = level % 2 === 0
    const children = [2 * i + 1, 2 * i + 2]
    for (const c of children) {
      if (c >= arr.length) continue
      const grandchildren = [2 * c + 1, 2 * c + 2]
      for (const gc of [...grandchildren, c]) {
        if (gc >= arr.length) continue
        if (isMin && arr[gc]!.priority < arr[i]!.priority) return false
        if (!isMin && arr[gc]!.priority > arr[i]!.priority) return false
      }
    }
  }
  return true
}

describe('MinMaxHeap', () => {
  let heap: MinMaxHeap<string>

  beforeEach(() => {
    heap = new MinMaxHeap<string>()
  })

  describe('constructor', () => {
    it('should create empty heap', () => {
      const h = new MinMaxHeap<number>()
      expect(h.size()).toBe(0)
      expect(h.isEmpty()).toBe(true)
    })

    it('should accept custom options', () => {
      const h = new MinMaxHeap<number>({ initialCapacity: 32 })
      expect(h.size()).toBe(0)
    })

    it('should use default options when none provided', () => {
      expect(DEFAULT_MINMAX_HEAP_OPTIONS.initialCapacity).toBe(16)
    })

    it('should accept partial options', () => {
      const h = new MinMaxHeap<string>({ initialCapacity: 8 })
      expect(h.isEmpty()).toBe(true)
    })
  })

  describe('insert', () => {
    it('should insert single element', () => {
      heap.insert(1, 'a')
      expect(heap.size()).toBe(1)
      expect(heap.getMin()).toBe('a')
      expect(heap.getMax()).toBe('a')
    })

    it('should insert multiple elements maintaining heap property', () => {
      heap.insert(5, 'e')
      heap.insert(3, 'c')
      heap.insert(7, 'g')
      heap.insert(1, 'a')
      heap.insert(9, 'i')
      expect(validateMinMaxHeap(heap)).toBe(true)
    })

    it('should handle duplicate priorities', () => {
      heap.insert(5, 'a')
      heap.insert(5, 'b')
      heap.insert(5, 'c')
      expect(heap.size()).toBe(3)
      expect(validateMinMaxHeap(heap)).toBe(true)
    })

    it('should insert in ascending order', () => {
      for (let i = 0; i < 10; i++) {
        heap.insert(i, `v${i}`)
      }
      expect(heap.getMin()).toBe('v0')
      expect(heap.getMax()).toBe('v9')
      expect(validateMinMaxHeap(heap)).toBe(true)
    })

    it('should insert in descending order', () => {
      for (let i = 9; i >= 0; i--) {
        heap.insert(i, `v${i}`)
      }
      expect(heap.getMin()).toBe('v0')
      expect(heap.getMax()).toBe('v9')
      expect(validateMinMaxHeap(heap)).toBe(true)
    })

    it('should insert negative priorities', () => {
      heap.insert(-5, 'neg')
      heap.insert(0, 'zero')
      heap.insert(5, 'pos')
      expect(heap.getMin()).toBe('neg')
      expect(heap.getMax()).toBe('pos')
    })

    it('should insert many elements', () => {
      for (let i = 0; i < 100; i++) {
        heap.insert(i, `v${i}`)
      }
      expect(heap.size()).toBe(100)
      expect(validateMinMaxHeap(heap)).toBe(true)
    })

    it('should insert with zero priority', () => {
      heap.insert(0, 'zero')
      expect(heap.getMin()).toBe('zero')
      expect(heap.getMax()).toBe('zero')
    })

    it('should insert with floating point priorities', () => {
      heap.insert(1.5, 'a')
      heap.insert(2.7, 'b')
      heap.insert(0.3, 'c')
      expect(heap.getMin()).toBe('c')
      expect(heap.getMax()).toBe('b')
    })
  })

  describe('getMin', () => {
    it('should return undefined for empty heap', () => {
      expect(heap.getMin()).toBeUndefined()
    })

    it('should return root for single element', () => {
      heap.insert(5, 'a')
      expect(heap.getMin()).toBe('a')
    })

    it('should return minimum element', () => {
      heap.insert(5, 'b')
      heap.insert(1, 'a')
      heap.insert(10, 'c')
      expect(heap.getMin()).toBe('a')
    })

    it('should not remove element', () => {
      heap.insert(1, 'a')
      heap.getMin()
      expect(heap.size()).toBe(1)
    })

    it('should update after insertions', () => {
      heap.insert(10, 'x')
      expect(heap.getMin()).toBe('x')
      heap.insert(1, 'y')
      expect(heap.getMin()).toBe('y')
      heap.insert(5, 'z')
      expect(heap.getMin()).toBe('y')
    })
  })

  describe('getMax', () => {
    it('should return undefined for empty heap', () => {
      expect(heap.getMax()).toBeUndefined()
    })

    it('should return root for single element', () => {
      heap.insert(5, 'a')
      expect(heap.getMax()).toBe('a')
    })

    it('should return maximum from two elements', () => {
      heap.insert(1, 'a')
      heap.insert(5, 'b')
      expect(heap.getMax()).toBe('b')
    })

    it('should return maximum from three or more elements', () => {
      heap.insert(5, 'mid')
      heap.insert(1, 'low')
      heap.insert(10, 'high')
      expect(heap.getMax()).toBe('high')
    })

    it('should not remove element', () => {
      heap.insert(1, 'a')
      heap.insert(5, 'b')
      heap.getMax()
      expect(heap.size()).toBe(2)
    })

    it('should return larger child when max level has two nodes', () => {
      heap.insert(1, 'a')
      heap.insert(10, 'b')
      heap.insert(5, 'c')
      expect(heap.getMax()).toBe('b')
    })
  })

  describe('extractMin', () => {
    it('should return undefined for empty heap', () => {
      expect(heap.extractMin()).toBeUndefined()
    })

    it('should extract single element', () => {
      heap.insert(1, 'a')
      expect(heap.extractMin()).toBe('a')
      expect(heap.isEmpty()).toBe(true)
    })

    it('should extract minimum element', () => {
      heap.insert(5, 'b')
      heap.insert(1, 'a')
      heap.insert(10, 'c')
      expect(heap.extractMin()).toBe('a')
    })

    it('should maintain heap property after extraction', () => {
      for (let i = 0; i < 10; i++) {
        heap.insert(i, `v${i}`)
      }
      heap.extractMin()
      expect(validateMinMaxHeap(heap)).toBe(true)
    })

    it('should extract in sorted order', () => {
      const values = [5, 3, 1, 4, 2]
      for (const v of values) {
        heap.insert(v, `v${v}`)
      }
      const extracted: string[] = []
      while (!heap.isEmpty()) {
        extracted.push(heap.extractMin()!)
      }
      expect(extracted.map(v => parseInt(v.slice(1)))).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle extract from two elements', () => {
      heap.insert(1, 'a')
      heap.insert(2, 'b')
      expect(heap.extractMin()).toBe('a')
      expect(heap.size()).toBe(1)
      expect(heap.getMin()).toBe('b')
    })

    it('should handle repeated extraction', () => {
      for (let i = 0; i < 5; i++) {
        heap.insert(i * 2, `v${i}`)
      }
      expect(heap.extractMin()).toBe('v0')
      expect(heap.extractMin()).toBe('v1')
      expect(heap.extractMin()).toBe('v2')
      expect(heap.size()).toBe(2)
    })
  })

  describe('extractMax', () => {
    it('should return undefined for empty heap', () => {
      expect(heap.extractMax()).toBeUndefined()
    })

    it('should extract single element', () => {
      heap.insert(1, 'a')
      expect(heap.extractMax()).toBe('a')
      expect(heap.isEmpty()).toBe(true)
    })

    it('should extract maximum element', () => {
      heap.insert(5, 'b')
      heap.insert(1, 'a')
      heap.insert(10, 'c')
      expect(heap.extractMax()).toBe('c')
    })

    it('should maintain heap property after extraction', () => {
      for (let i = 0; i < 10; i++) {
        heap.insert(i, `v${i}`)
      }
      heap.extractMax()
      expect(validateMinMaxHeap(heap)).toBe(true)
    })

    it('should extract in reverse sorted order', () => {
      const values = [5, 3, 1, 4, 2]
      for (const v of values) {
        heap.insert(v, `v${v}`)
      }
      const extracted: string[] = []
      while (!heap.isEmpty()) {
        extracted.push(heap.extractMax()!)
      }
      expect(extracted.map(v => parseInt(v.slice(1)))).toEqual([5, 4, 3, 2, 1])
    })

    it('should handle extract from two elements', () => {
      heap.insert(1, 'a')
      heap.insert(2, 'b')
      expect(heap.extractMax()).toBe('b')
      expect(heap.size()).toBe(1)
      expect(heap.getMax()).toBe('a')
    })

    it('should handle alternating min/max extraction', () => {
      for (let i = 1; i <= 6; i++) {
        heap.insert(i, `v${i}`)
      }
      expect(heap.extractMin()).toBe('v1')
      expect(heap.extractMax()).toBe('v6')
      expect(heap.extractMin()).toBe('v2')
      expect(heap.extractMax()).toBe('v5')
      expect(heap.size()).toBe(2)
      expect(validateMinMaxHeap(heap)).toBe(true)
    })
  })

  describe('deleteMin', () => {
    it('should return false for empty heap', () => {
      expect(heap.deleteMin()).toBe(false)
    })

    it('should delete single element', () => {
      heap.insert(1, 'a')
      expect(heap.deleteMin()).toBe(true)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should delete minimum and maintain property', () => {
      heap.insert(5, 'b')
      heap.insert(1, 'a')
      heap.insert(10, 'c')
      expect(heap.deleteMin()).toBe(true)
      expect(heap.getMin()).toBe('b')
      expect(validateMinMaxHeap(heap)).toBe(true)
    })

    it('should not return the deleted value', () => {
      heap.insert(1, 'a')
      const result = heap.deleteMin()
      expect(result).toBe(true)
    })

    it('should handle multiple deletions', () => {
      for (let i = 0; i < 5; i++) {
        heap.insert(i, `v${i}`)
      }
      heap.deleteMin()
      heap.deleteMin()
      expect(heap.size()).toBe(3)
      expect(validateMinMaxHeap(heap)).toBe(true)
    })
  })

  describe('deleteMax', () => {
    it('should return false for empty heap', () => {
      expect(heap.deleteMax()).toBe(false)
    })

    it('should delete single element', () => {
      heap.insert(1, 'a')
      expect(heap.deleteMax()).toBe(true)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should delete maximum and maintain property', () => {
      heap.insert(5, 'b')
      heap.insert(1, 'a')
      heap.insert(10, 'c')
      expect(heap.deleteMax()).toBe(true)
      expect(heap.getMax()).toBe('b')
      expect(validateMinMaxHeap(heap)).toBe(true)
    })

    it('should handle multiple deletions', () => {
      for (let i = 0; i < 5; i++) {
        heap.insert(i, `v${i}`)
      }
      heap.deleteMax()
      heap.deleteMax()
      expect(heap.size()).toBe(3)
      expect(validateMinMaxHeap(heap)).toBe(true)
    })
  })

  describe('size', () => {
    it('should return 0 for empty heap', () => {
      expect(heap.size()).toBe(0)
    })

    it('should reflect insertions', () => {
      heap.insert(1, 'a')
      expect(heap.size()).toBe(1)
      heap.insert(2, 'b')
      expect(heap.size()).toBe(2)
    })

    it('should reflect extractions', () => {
      heap.insert(1, 'a')
      heap.insert(2, 'b')
      heap.extractMin()
      expect(heap.size()).toBe(1)
    })

    it('should reflect clear', () => {
      heap.insert(1, 'a')
      heap.insert(2, 'b')
      heap.clear()
      expect(heap.size()).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new heap', () => {
      expect(heap.isEmpty()).toBe(true)
    })

    it('should return false after insert', () => {
      heap.insert(1, 'a')
      expect(heap.isEmpty()).toBe(false)
    })

    it('should return true after extracting all', () => {
      heap.insert(1, 'a')
      heap.extractMin()
      expect(heap.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      heap.insert(1, 'a')
      heap.insert(2, 'b')
      heap.clear()
      expect(heap.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear empty heap without error', () => {
      heap.clear()
      expect(heap.isEmpty()).toBe(true)
    })

    it('should clear all elements', () => {
      for (let i = 0; i < 5; i++) {
        heap.insert(i, `v${i}`)
      }
      heap.clear()
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should allow insertions after clear', () => {
      heap.insert(1, 'a')
      heap.clear()
      heap.insert(2, 'b')
      expect(heap.size()).toBe(1)
      expect(heap.getMin()).toBe('b')
    })
  })

  describe('update', () => {
    it('should return false if value not found', () => {
      heap.insert(1, 'a')
      expect(heap.update(5, 'b')).toBe(false)
    })

    it('should update priority of existing value', () => {
      heap.insert(1, 'a')
      heap.insert(5, 'b')
      heap.update(10, 'a')
      expect(heap.getMin()).toBe('b')
      expect(heap.getMax()).toBe('a')
    })

    it('should increase priority', () => {
      heap.insert(1, 'a')
      heap.insert(3, 'b')
      heap.insert(5, 'c')
      heap.update(10, 'a')
      expect(heap.getMax()).toBe('a')
      expect(validateMinMaxHeap(heap)).toBe(true)
    })

    it('should decrease priority', () => {
      heap.insert(5, 'a')
      heap.insert(3, 'b')
      heap.insert(1, 'c')
      heap.update(0, 'a')
      expect(heap.getMin()).toBe('a')
      expect(validateMinMaxHeap(heap)).toBe(true)
    })

    it('should maintain heap property after update', () => {
      for (let i = 0; i < 10; i++) {
        heap.insert(i, `v${i}`)
      }
      heap.update(100, 'v5')
      heap.update(-10, 'v8')
      expect(validateMinMaxHeap(heap)).toBe(true)
    })

    it('should handle updating to same priority', () => {
      heap.insert(5, 'a')
      heap.insert(3, 'b')
      expect(heap.update(5, 'a')).toBe(true)
      expect(validateMinMaxHeap(heap)).toBe(true)
    })
  })

  describe('has', () => {
    it('should return false for empty heap', () => {
      expect(heap.has('a')).toBe(false)
    })

    it('should return true for existing value', () => {
      heap.insert(1, 'a')
      expect(heap.has('a')).toBe(true)
    })

    it('should return false for non-existing value', () => {
      heap.insert(1, 'a')
      expect(heap.has('b')).toBe(false)
    })

    it('should find values after multiple insertions', () => {
      heap.insert(1, 'a')
      heap.insert(2, 'b')
      heap.insert(3, 'c')
      expect(heap.has('b')).toBe(true)
      expect(heap.has('c')).toBe(true)
      expect(heap.has('d')).toBe(false)
    })

    it('should not find value after extraction', () => {
      heap.insert(1, 'a')
      heap.insert(2, 'b')
      heap.extractMin()
      expect(heap.has('a')).toBe(false)
      expect(heap.has('b')).toBe(true)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty heap', () => {
      expect(heap.toArray()).toEqual([])
    })

    it('should return all elements', () => {
      heap.insert(1, 'a')
      heap.insert(2, 'b')
      const arr = heap.toArray()
      expect(arr.length).toBe(2)
    })

    it('should return copy of elements', () => {
      heap.insert(1, 'a')
      const arr = heap.toArray()
      arr[0]!.priority = 999
      expect(heap.getMin()).toBe('a')
    })

    it('should preserve priority and value', () => {
      heap.insert(5, 'x')
      heap.insert(3, 'y')
      const arr = heap.toArray()
      expect(arr.some(item => item.priority === 5 && item.value === 'x')).toBe(true)
      expect(arr.some(item => item.priority === 3 && item.value === 'y')).toBe(true)
    })
  })

  describe('fromArray', () => {
    it('should build heap from array', () => {
      heap.fromArray([
        { priority: 5, value: 'a' },
        { priority: 3, value: 'b' },
        { priority: 1, value: 'c' },
      ])
      expect(heap.size()).toBe(3)
      expect(heap.getMin()).toBe('c')
      expect(heap.getMax()).toBe('a')
    })

    it('should clear existing elements before building', () => {
      heap.insert(10, 'old')
      heap.fromArray([
        { priority: 1, value: 'new' },
      ])
      expect(heap.size()).toBe(1)
      expect(heap.getMin()).toBe('new')
    })

    it('should handle empty array', () => {
      heap.insert(1, 'a')
      heap.fromArray([])
      expect(heap.isEmpty()).toBe(true)
    })

    it('should maintain heap property', () => {
      const items = [
        { priority: 7, value: 'g' },
        { priority: 2, value: 'b' },
        { priority: 9, value: 'i' },
        { priority: 1, value: 'a' },
        { priority: 5, value: 'e' },
      ]
      heap.fromArray(items)
      expect(validateMinMaxHeap(heap)).toBe(true)
    })

    it('should handle single element', () => {
      heap.fromArray([{ priority: 1, value: 'only' }])
      expect(heap.size()).toBe(1)
      expect(heap.getMin()).toBe('only')
      expect(heap.getMax()).toBe('only')
    })
  })

  describe('merge', () => {
    it('should merge two non-empty heaps', () => {
      const other = new MinMaxHeap<string>()
      heap.insert(1, 'a')
      heap.insert(5, 'b')
      other.insert(3, 'c')
      other.insert(7, 'd')
      heap.merge(other)
      expect(heap.size()).toBe(4)
      expect(heap.getMin()).toBe('a')
      expect(heap.getMax()).toBe('d')
      expect(validateMinMaxHeap(heap)).toBe(true)
    })

    it('should merge with empty heap', () => {
      const other = new MinMaxHeap<string>()
      heap.insert(1, 'a')
      heap.merge(other)
      expect(heap.size()).toBe(1)
    })

    it('should merge into empty heap', () => {
      const other = new MinMaxHeap<string>()
      other.insert(1, 'a')
      heap.merge(other)
      expect(heap.size()).toBe(1)
      expect(heap.getMin()).toBe('a')
    })

    it('should maintain heap property after merge', () => {
      const other = new MinMaxHeap<number>()
      for (let i = 0; i < 5; i++) {
        heap.insert(i * 2, i * 2)
      }
      for (let i = 0; i < 5; i++) {
        other.insert(i * 2 + 1, i * 2 + 1)
      }
      heap.merge(other)
      expect(heap.size()).toBe(10)
      expect(validateMinMaxHeap(heap)).toBe(true)
    })

    it('should not modify source heap', () => {
      const other = new MinMaxHeap<string>()
      other.insert(1, 'x')
      other.insert(2, 'y')
      heap.merge(other)
      expect(other.size()).toBe(2)
    })
  })

  describe('heap property validation', () => {
    it('should maintain property with random insertions', () => {
      const priorities = [42, 17, 83, 5, 29, 61, 94, 12, 38, 76, 3, 55, 88, 21, 67]
      for (const p of priorities) {
        heap.insert(p, `v${p}`)
      }
      expect(validateMinMaxHeap(heap)).toBe(true)
      expect(heap.getMin()).toBe('v3')
      expect(heap.getMax()).toBe('v94')
    })

    it('should maintain property after mixed operations', () => {
      for (let i = 0; i < 20; i++) {
        heap.insert(i, `v${i}`)
      }
      heap.extractMin()
      heap.extractMax()
      heap.insert(100, 'big')
      heap.insert(-5, 'small')
      heap.update(50, 'v10')
      expect(validateMinMaxHeap(heap)).toBe(true)
    })

    it('should sort correctly via extractMin', () => {
      const input = [42, 17, 83, 5, 29]
      for (const v of input) {
        heap.insert(v, v)
      }
      const result: number[] = []
      while (!heap.isEmpty()) {
        result.push(heap.extractMin() as number)
      }
      expect(result).toEqual([5, 17, 29, 42, 83])
    })

    it('should sort correctly via extractMax', () => {
      const input = [42, 17, 83, 5, 29]
      for (const v of input) {
        heap.insert(v, v)
      }
      const result: number[] = []
      while (!heap.isEmpty()) {
        result.push(heap.extractMax() as number)
      }
      expect(result).toEqual([83, 42, 29, 17, 5])
    })

    it('should handle large number of elements', () => {
      const values = Array.from({ length: 200 }, (_, i) => i)
      for (const v of values.sort(() => Math.random() - 0.5)) {
        heap.insert(v, v)
      }
      expect(validateMinMaxHeap(heap)).toBe(true)
      expect(heap.getMin()).toBe(0)
      expect(heap.getMax()).toBe(199)
    })
  })

  describe('edge cases', () => {
    it('should handle object values', () => {
      const objHeap = new MinMaxHeap<{ id: number }>()
      const obj1 = { id: 1 }
      const obj2 = { id: 2 }
      objHeap.insert(5, obj1)
      objHeap.insert(3, obj2)
      expect(objHeap.getMin()).toBe(obj2)
      expect(objHeap.getMax()).toBe(obj1)
    })

    it('should handle null values', () => {
      const nullHeap = new MinMaxHeap<string | null>()
      nullHeap.insert(1, null)
      nullHeap.insert(2, 'a')
      expect(nullHeap.getMin()).toBeNull()
    })

    it('should handle undefined values', () => {
      const undefHeap = new MinMaxHeap<string | undefined>()
      undefHeap.insert(1, undefined)
      undefHeap.insert(2, 'a')
      expect(undefHeap.getMin()).toBeUndefined()
    })

    it('should handle numeric string values', () => {
      const numHeap = new MinMaxHeap<number>()
      numHeap.insert(100, 100)
      numHeap.insert(-100, -100)
      expect(numHeap.getMin()).toBe(-100)
      expect(numHeap.getMax()).toBe(100)
    })

    it('should handle extracting all elements one by one', () => {
      for (let i = 0; i < 15; i++) {
        heap.insert(i, `v${i}`)
      }
      for (let i = 0; i < 15; i++) {
        heap.extractMin()
      }
      expect(heap.isEmpty()).toBe(true)
      expect(heap.getMin()).toBeUndefined()
      expect(heap.getMax()).toBeUndefined()
    })

    it('should handle interleaved insert and extract', () => {
      heap.insert(5, 'a')
      expect(heap.extractMin()).toBe('a')
      heap.insert(3, 'b')
      heap.insert(7, 'c')
      expect(heap.extractMax()).toBe('c')
      expect(heap.extractMin()).toBe('b')
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle deleteMin and deleteMax on same heap', () => {
      for (let i = 1; i <= 10; i++) {
        heap.insert(i, `v${i}`)
      }
      heap.deleteMin()
      heap.deleteMax()
      expect(heap.getMin()).toBe('v2')
      expect(heap.getMax()).toBe('v9')
      expect(validateMinMaxHeap(heap)).toBe(true)
    })

    it('should handle repeated clear and insert', () => {
      for (let round = 0; round < 3; round++) {
        for (let i = 0; i < 5; i++) {
          heap.insert(i, `r${round}v${i}`)
        }
        expect(heap.size()).toBe(5)
        heap.clear()
      }
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle update on single element heap', () => {
      heap.insert(1, 'a')
      expect(heap.update(10, 'a')).toBe(true)
      expect(heap.getMin()).toBe('a')
      expect(heap.getMax()).toBe('a')
    })

    it('should handle negative priorities correctly', () => {
      heap.insert(-10, 'neg10')
      heap.insert(-5, 'neg5')
      heap.insert(0, 'zero')
      heap.insert(5, 'pos5')
      expect(heap.extractMin()).toBe('neg10')
      expect(heap.extractMax()).toBe('pos5')
      expect(validateMinMaxHeap(heap)).toBe(true)
    })
  })

  describe('re-exports', () => {
    it('should export DEFAULT_MINMAX_HEAP_OPTIONS', () => {
      expect(DEFAULT_MINMAX_HEAP_OPTIONS).toBeDefined()
      expect(DEFAULT_MINMAX_HEAP_OPTIONS.initialCapacity).toBe(16)
    })

    it('should export HeapItem type', () => {
      const item: HeapItem<string> = { priority: 1, value: 'test' }
      expect(item.priority).toBe(1)
      expect(item.value).toBe('test')
    })

    it('should export MinMaxHeapOptions type', () => {
      const opts: MinMaxHeapOptions = { initialCapacity: 32 }
      expect(opts.initialCapacity).toBe(32)
    })
  })
})
