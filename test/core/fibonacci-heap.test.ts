import { describe, it, expect, beforeEach } from 'vitest'
import { FibonacciHeap, DEFAULT_FIBONACCIHEAP_OPTIONS } from '../../src/core/fibonacci-heap/fibonacci-heap.js'
import type { FibonacciHeapOptions, FibNode } from '../../src/core/fibonacci-heap/fibonacci-heap.js'

describe('FibonacciHeap', () => {
  let heap: FibonacciHeap<number>

  beforeEach(() => {
    heap = new FibonacciHeap<number>()
  })

  describe('constructor', () => {
    it('should create an empty heap', () => {
      const h = new FibonacciHeap<number>()
      expect(h.size()).toBe(0)
      expect(h.isEmpty()).toBe(true)
    })

    it('should accept empty options', () => {
      const h = new FibonacciHeap<number>({})
      expect(h.size()).toBe(0)
    })

    it('should accept undefined options', () => {
      const h = new FibonacciHeap<number>(undefined)
      expect(h.size()).toBe(0)
    })
  })

  describe('insert', () => {
    it('should add a single element', () => {
      heap.insert(5, 5)
      expect(heap.size()).toBe(1)
      expect(heap.isEmpty()).toBe(false)
    })

    it('should add multiple elements', () => {
      heap.insert(3, 3)
      heap.insert(1, 1)
      heap.insert(4, 4)
      expect(heap.size()).toBe(3)
    })

    it('should maintain min on insert', () => {
      heap.insert(5, 5)
      heap.insert(3, 3)
      heap.insert(7, 7)
      heap.insert(1, 1)
      expect(heap.getMin()?.key).toBe(1)
    })

    it('should handle negative keys', () => {
      heap.insert(-5, -5)
      heap.insert(-10, -10)
      heap.insert(3, 3)
      expect(heap.getMin()?.key).toBe(-10)
    })

    it('should handle zero key', () => {
      heap.insert(0, 0)
      expect(heap.getMin()?.key).toBe(0)
    })

    it('should handle duplicate keys', () => {
      heap.insert(5, 1)
      heap.insert(5, 2)
      heap.insert(5, 3)
      expect(heap.size()).toBe(3)
      expect(heap.getMin()?.key).toBe(5)
    })

    it('should handle floating point keys', () => {
      heap.insert(3.14, 1)
      heap.insert(2.71, 2)
      expect(heap.getMin()?.key).toBeCloseTo(2.71)
    })

    it('should update size correctly', () => {
      for (let i = 0; i < 100; i++) {
        heap.insert(i, i)
      }
      expect(heap.size()).toBe(100)
    })
  })

  describe('extractMin', () => {
    it('should return undefined on empty heap', () => {
      expect(heap.extractMin()).toBeUndefined()
    })

    it('should extract single element', () => {
      heap.insert(1, 10)
      const result = heap.extractMin()
      expect(result).toEqual({ key: 1, value: 10 })
      expect(heap.size()).toBe(0)
    })

    it('should extract min from two elements', () => {
      heap.insert(5, 5)
      heap.insert(3, 3)
      expect(heap.extractMin()?.key).toBe(3)
      expect(heap.extractMin()?.key).toBe(5)
    })

    it('should extract in sorted order', () => {
      const keys = [5, 3, 7, 1, 4, 6, 2, 8]
      for (const k of keys) {
        heap.insert(k, k)
      }
      const extracted: number[] = []
      while (!heap.isEmpty()) {
        extracted.push(heap.extractMin()!.key)
      }
      expect(extracted).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    })

    it('should handle consolidation after extract', () => {
      for (let i = 10; i >= 1; i--) {
        heap.insert(i, i)
      }
      expect(heap.extractMin()?.key).toBe(1)
      expect(heap.getMin()?.key).toBe(2)
    })

    it('should extract all elements correctly', () => {
      heap.insert(3, 3)
      heap.insert(1, 1)
      heap.insert(2, 2)
      expect(heap.extractMin()?.key).toBe(1)
      expect(heap.extractMin()?.key).toBe(2)
      expect(heap.extractMin()?.key).toBe(3)
      expect(heap.extractMin()).toBeUndefined()
    })

    it('should return correct key-value pair', () => {
      heap.insert(42, 'hello')
      expect(heap.extractMin()).toEqual({ key: 42, value: 'hello' })
    })

    it('should update size after extraction', () => {
      heap.insert(1, 1)
      heap.insert(2, 2)
      heap.insert(3, 3)
      heap.extractMin()
      expect(heap.size()).toBe(2)
      heap.extractMin()
      expect(heap.size()).toBe(1)
    })

    it('should handle extract after many inserts', () => {
      for (let i = 50; i >= 1; i--) {
        heap.insert(i, i)
      }
      for (let i = 1; i <= 50; i++) {
        expect(heap.extractMin()?.key).toBe(i)
      }
    })

    it('should handle alternating insert and extract', () => {
      heap.insert(5, 5)
      heap.insert(3, 3)
      expect(heap.extractMin()?.key).toBe(3)
      heap.insert(1, 1)
      expect(heap.extractMin()?.key).toBe(1)
      expect(heap.extractMin()?.key).toBe(5)
    })

    it('should handle duplicate key extraction', () => {
      heap.insert(1, 'a')
      heap.insert(1, 'b')
      heap.insert(1, 'c')
      const results: string[] = []
      while (!heap.isEmpty()) {
        results.push(heap.extractMin()!.value)
      }
      expect(results.sort()).toEqual(['a', 'b', 'c'])
    })

    it('should return undefined when heap becomes empty', () => {
      heap.insert(1, 1)
      heap.extractMin()
      expect(heap.extractMin()).toBeUndefined()
    })
  })

  describe('getMin', () => {
    it('should return undefined on empty heap', () => {
      expect(heap.getMin()).toBeUndefined()
    })

    it('should return min element without removing', () => {
      heap.insert(5, 5)
      heap.insert(3, 3)
      heap.insert(7, 7)
      expect(heap.getMin()?.key).toBe(3)
      expect(heap.size()).toBe(3)
    })

    it('should update after insert', () => {
      heap.insert(10, 10)
      expect(heap.getMin()?.key).toBe(10)
      heap.insert(5, 5)
      expect(heap.getMin()?.key).toBe(5)
    })

    it('should update after extractMin', () => {
      heap.insert(1, 1)
      heap.insert(2, 2)
      heap.insert(3, 3)
      heap.extractMin()
      expect(heap.getMin()?.key).toBe(2)
    })

    it('should return same element on repeated calls', () => {
      heap.insert(5, 5)
      expect(heap.getMin()).toEqual(heap.getMin())
    })

    it('should handle single element', () => {
      heap.insert(42, 42)
      expect(heap.getMin()).toEqual({ key: 42, value: 42 })
    })
  })

  describe('size', () => {
    it('should return 0 on empty heap', () => {
      expect(heap.size()).toBe(0)
    })

    it('should return 1 after single insert', () => {
      heap.insert(1, 1)
      expect(heap.size()).toBe(1)
    })

    it('should return correct size after multiple inserts', () => {
      heap.insert(1, 1)
      heap.insert(2, 2)
      heap.insert(3, 3)
      expect(heap.size()).toBe(3)
    })

    it('should decrease after extractMin', () => {
      heap.insert(1, 1)
      heap.insert(2, 2)
      heap.extractMin()
      expect(heap.size()).toBe(1)
    })

    it('should return 0 after clear', () => {
      heap.insert(1, 1)
      heap.insert(2, 2)
      heap.clear()
      expect(heap.size()).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('should return true on new heap', () => {
      expect(heap.isEmpty()).toBe(true)
    })

    it('should return false after insert', () => {
      heap.insert(1, 1)
      expect(heap.isEmpty()).toBe(false)
    })

    it('should return true after all elements extracted', () => {
      heap.insert(1, 1)
      heap.insert(2, 2)
      heap.extractMin()
      heap.extractMin()
      expect(heap.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      heap.insert(1, 1)
      heap.clear()
      expect(heap.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should empty non-empty heap', () => {
      heap.insert(1, 1)
      heap.insert(2, 2)
      heap.insert(3, 3)
      heap.clear()
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should clear heap with one element', () => {
      heap.insert(1, 1)
      heap.clear()
      expect(heap.size()).toBe(0)
    })

    it('should allow reuse after clear', () => {
      heap.insert(1, 1)
      heap.clear()
      heap.insert(5, 5)
      expect(heap.size()).toBe(1)
      expect(heap.getMin()?.key).toBe(5)
    })

    it('should handle clear on already empty heap', () => {
      heap.clear()
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })
  })

  describe('decreaseKey', () => {
    it('should decrease key of root node', () => {
      heap.insert(5, 5)
      heap.insert(3, 3)
      const result = heap.decreaseKey({ key: 5, value: 5 }, 1)
      expect(result).toBe(true)
      expect(heap.getMin()?.key).toBe(1)
    })

    it('should return false for key increase', () => {
      heap.insert(3, 3)
      const result = heap.decreaseKey({ key: 3, value: 3 }, 10)
      expect(result).toBe(false)
    })

    it('should return false for non-existent node', () => {
      heap.insert(3, 3)
      const result = heap.decreaseKey({ key: 99, value: 99 }, 1)
      expect(result).toBe(false)
    })

    it('should return true on success', () => {
      heap.insert(5, 5)
      expect(heap.decreaseKey({ key: 5, value: 5 }, 2)).toBe(true)
    })

    it('should update min after decrease', () => {
      heap.insert(10, 10)
      heap.insert(20, 20)
      heap.decreaseKey({ key: 20, value: 20 }, 5)
      expect(heap.getMin()?.key).toBe(5)
    })

    it('should trigger cut from parent', () => {
      for (let i = 1; i <= 10; i++) {
        heap.insert(i, i)
      }
      heap.extractMin()
      heap.decreaseKey({ key: 10, value: 10 }, 0)
      expect(heap.getMin()?.key).toBe(0)
    })

    it('should trigger cascading cut', () => {
      for (let i = 1; i <= 15; i++) {
        heap.insert(i, i)
      }
      for (let i = 0; i < 5; i++) {
        heap.extractMin()
      }
      heap.decreaseKey({ key: 15, value: 15 }, 0)
      expect(heap.getMin()?.key).toBe(0)
    })

    it('should handle decrease of non-min root', () => {
      heap.insert(1, 1)
      heap.insert(5, 5)
      heap.insert(3, 3)
      heap.decreaseKey({ key: 5, value: 5 }, 2)
      expect(heap.getMin()?.key).toBe(1)
    })

    it('should handle multiple decreases', () => {
      heap.insert(10, 10)
      heap.insert(20, 20)
      heap.decreaseKey({ key: 10, value: 10 }, 5)
      heap.decreaseKey({ key: 20, value: 20 }, 3)
      expect(heap.extractMin()?.key).toBe(3)
      expect(heap.extractMin()?.key).toBe(5)
    })

    it('should handle decrease after merge', () => {
      heap.insert(10, 10)
      const other = new FibonacciHeap<number>()
      other.insert(20, 20)
      heap.merge(other)
      heap.decreaseKey({ key: 20, value: 20 }, 1)
      expect(heap.getMin()?.key).toBe(1)
    })
  })

  describe('delete', () => {
    it('should delete existing key', () => {
      heap.insert(5, 5)
      heap.insert(3, 3)
      expect(heap.delete(5)).toBe(true)
      expect(heap.size()).toBe(1)
    })

    it('should return false for non-existent key', () => {
      heap.insert(1, 1)
      expect(heap.delete(99)).toBe(false)
    })

    it('should update size after delete', () => {
      heap.insert(1, 1)
      heap.insert(2, 2)
      heap.insert(3, 3)
      heap.delete(2)
      expect(heap.size()).toBe(2)
    })

    it('should delete min element', () => {
      heap.insert(1, 1)
      heap.insert(2, 2)
      heap.insert(3, 3)
      heap.delete(1)
      expect(heap.getMin()?.key).toBe(2)
    })

    it('should handle delete of only element', () => {
      heap.insert(42, 42)
      expect(heap.delete(42)).toBe(true)
      expect(heap.isEmpty()).toBe(true)
      expect(heap.getMin()).toBeUndefined()
    })

    it('should handle multiple deletes', () => {
      heap.insert(1, 1)
      heap.insert(2, 2)
      heap.insert(3, 3)
      heap.insert(4, 4)
      heap.delete(2)
      heap.delete(4)
      expect(heap.size()).toBe(2)
      expect(heap.extractMin()?.key).toBe(1)
      expect(heap.extractMin()?.key).toBe(3)
    })

    it('should handle delete after decrease', () => {
      heap.insert(10, 10)
      heap.insert(20, 20)
      heap.decreaseKey({ key: 20, value: 20 }, 5)
      heap.delete(10)
      expect(heap.getMin()?.key).toBe(5)
    })

    it('should handle delete triggering consolidation', () => {
      for (let i = 1; i <= 20; i++) {
        heap.insert(i, i)
      }
      heap.extractMin()
      heap.delete(10)
      expect(heap.size()).toBe(18)
      expect(heap.getMin()?.key).toBe(2)
    })

    it('should return false on empty heap', () => {
      expect(heap.delete(1)).toBe(false)
    })
  })

  describe('merge', () => {
    it('should merge two non-empty heaps', () => {
      heap.insert(5, 5)
      heap.insert(10, 10)
      const other = new FibonacciHeap<number>()
      other.insert(3, 3)
      other.insert(7, 7)
      heap.merge(other)
      expect(heap.size()).toBe(4)
      expect(heap.getMin()?.key).toBe(3)
    })

    it('should merge empty with non-empty', () => {
      const other = new FibonacciHeap<number>()
      other.insert(1, 1)
      heap.merge(other)
      expect(heap.size()).toBe(1)
      expect(heap.getMin()?.key).toBe(1)
    })

    it('should merge non-empty with empty', () => {
      heap.insert(1, 1)
      const other = new FibonacciHeap<number>()
      heap.merge(other)
      expect(heap.size()).toBe(1)
    })

    it('should merge two empty heaps', () => {
      const other = new FibonacciHeap<number>()
      heap.merge(other)
      expect(heap.size()).toBe(0)
    })

    it('should clear source heap after merge', () => {
      heap.insert(1, 1)
      const other = new FibonacciHeap<number>()
      other.insert(2, 2)
      other.insert(3, 3)
      heap.merge(other)
      expect(other.size()).toBe(0)
      expect(other.isEmpty()).toBe(true)
    })

    it('should update size after merge', () => {
      for (let i = 0; i < 5; i++) heap.insert(i, i)
      const other = new FibonacciHeap<number>()
      for (let i = 5; i < 10; i++) other.insert(i, i)
      heap.merge(other)
      expect(heap.size()).toBe(10)
    })

    it('should update min after merge', () => {
      heap.insert(10, 10)
      const other = new FibonacciHeap<number>()
      other.insert(1, 1)
      heap.merge(other)
      expect(heap.getMin()?.key).toBe(1)
    })

    it('should handle merge with equal mins', () => {
      heap.insert(1, 'a')
      const other = new FibonacciHeap<string>()
      other.insert(1, 'b')
      heap.merge(other)
      expect(heap.size()).toBe(2)
      expect(heap.getMin()?.key).toBe(1)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty heap', () => {
      expect(heap.toArray()).toEqual([])
    })

    it('should return all elements', () => {
      heap.insert(1, 1)
      heap.insert(2, 2)
      heap.insert(3, 3)
      const arr = heap.toArray()
      expect(arr.length).toBe(3)
    })

    it('should return correct count after operations', () => {
      heap.insert(1, 1)
      heap.insert(2, 2)
      heap.insert(3, 3)
      heap.extractMin()
      expect(heap.toArray().length).toBe(2)
    })

    it('should return new array each call', () => {
      heap.insert(1, 1)
      const a = heap.toArray()
      const b = heap.toArray()
      expect(a).not.toBe(b)
    })

    it('should return all elements after merge', () => {
      heap.insert(1, 1)
      const other = new FibonacciHeap<number>()
      other.insert(2, 2)
      heap.merge(other)
      expect(heap.toArray().length).toBe(2)
    })
  })

  describe('forEach', () => {
    it('should not call callback on empty heap', () => {
      let callCount = 0
      heap.forEach(() => { callCount++ })
      expect(callCount).toBe(0)
    })

    it('should iterate all elements', () => {
      heap.insert(1, 1)
      heap.insert(2, 2)
      heap.insert(3, 3)
      let count = 0
      heap.forEach(() => { count++ })
      expect(count).toBe(3)
    })

    it('should provide correct key and value', () => {
      heap.insert(42, 'hello')
      heap.forEach((key, value) => {
        expect(key).toBe(42)
        expect(value).toBe('hello')
      })
    })

    it('should iterate after extractMin', () => {
      heap.insert(1, 1)
      heap.insert(2, 2)
      heap.insert(3, 3)
      heap.extractMin()
      let count = 0
      heap.forEach(() => { count++ })
      expect(count).toBe(2)
    })

    it('should iterate after merge', () => {
      heap.insert(1, 1)
      const other = new FibonacciHeap<number>()
      other.insert(2, 2)
      heap.merge(other)
      const keys: number[] = []
      heap.forEach((key) => { keys.push(key) })
      expect(keys.length).toBe(2)
    })
  })

  describe('consolidation', () => {
    it('should consolidate trees of same degree', () => {
      for (let i = 1; i <= 8; i++) {
        heap.insert(i, i)
      }
      expect(heap.extractMin()?.key).toBe(1)
      expect(heap.size()).toBe(7)
      expect(heap.getMin()?.key).toBe(2)
    })

    it('should handle consolidation after many inserts', () => {
      for (let i = 100; i >= 1; i--) {
        heap.insert(i, i)
      }
      for (let i = 1; i <= 100; i++) {
        expect(heap.extractMin()?.key).toBe(i)
      }
    })

    it('should produce correct extraction order after consolidate', () => {
      const keys = [7, 3, 9, 1, 5, 2, 8, 4, 6]
      for (const k of keys) {
        heap.insert(k, k)
      }
      for (let i = 1; i <= 9; i++) {
        expect(heap.extractMin()?.key).toBe(i)
      }
    })

    it('should maintain heap order with repeated extract', () => {
      for (let i = 0; i < 20; i++) {
        heap.insert(Math.floor(Math.random() * 1000), i)
      }
      let prev = -1
      while (!heap.isEmpty()) {
        const curr = heap.extractMin()!.key
        expect(curr).toBeGreaterThanOrEqual(prev)
        prev = curr
      }
    })

    it('should handle consolidation with single element', () => {
      heap.insert(1, 1)
      expect(heap.extractMin()?.key).toBe(1)
      expect(heap.isEmpty()).toBe(true)
    })
  })

  describe('cascading cut', () => {
    it('should mark parent after child cut', () => {
      for (let i = 1; i <= 10; i++) {
        heap.insert(i, i)
      }
      heap.extractMin()
      heap.decreaseKey({ key: 10, value: 10 }, 0)
      expect(heap.getMin()?.key).toBe(0)
    })

    it('should handle deep cascade', () => {
      for (let i = 1; i <= 20; i++) {
        heap.insert(i, i)
      }
      for (let i = 0; i < 5; i++) {
        heap.extractMin()
      }
      heap.decreaseKey({ key: 20, value: 20 }, -1)
      expect(heap.getMin()?.key).toBe(-1)
    })

    it('should handle multiple cascading cuts', () => {
      for (let i = 1; i <= 15; i++) {
        heap.insert(i, i)
      }
      heap.extractMin()
      heap.decreaseKey({ key: 14, value: 14 }, 0)
      heap.decreaseKey({ key: 15, value: 15 }, -1)
      expect(heap.getMin()?.key).toBe(-1)
    })

    it('should reset mark when moved to root', () => {
      for (let i = 1; i <= 10; i++) {
        heap.insert(i, i)
      }
      heap.extractMin()
      heap.decreaseKey({ key: 10, value: 10 }, 0)
      expect(heap.extractMin()?.key).toBe(0)
    })

    it('should handle cut of marked node', () => {
      for (let i = 1; i <= 20; i++) {
        heap.insert(i, i)
      }
      for (let i = 0; i < 3; i++) {
        heap.extractMin()
      }
      heap.decreaseKey({ key: 18, value: 18 }, -5)
      expect(heap.getMin()?.key).toBe(-5)
    })
  })

  describe('edge cases', () => {
    it('should handle string values', () => {
      const h = new FibonacciHeap<string>()
      h.insert(2, 'b')
      h.insert(1, 'a')
      h.insert(3, 'c')
      expect(h.extractMin()?.value).toBe('a')
      expect(h.extractMin()?.value).toBe('b')
      expect(h.extractMin()?.value).toBe('c')
    })

    it('should handle object values', () => {
      const h = new FibonacciHeap<{ id: number }>()
      h.insert(2, { id: 2 })
      h.insert(1, { id: 1 })
      expect(h.extractMin()?.value).toEqual({ id: 1 })
    })

    it('should handle large number of operations', () => {
      for (let i = 500; i >= 1; i--) {
        heap.insert(i, i)
      }
      for (let i = 1; i <= 500; i++) {
        expect(heap.extractMin()?.key).toBe(i)
      }
    })

    it('should handle interleaved operations', () => {
      heap.insert(5, 5)
      heap.insert(3, 3)
      heap.extractMin()
      heap.insert(1, 1)
      heap.insert(7, 7)
      heap.delete(5)
      expect(heap.extractMin()?.key).toBe(1)
      expect(heap.extractMin()?.key).toBe(7)
    })

    it('should handle decreaseKey to same value', () => {
      heap.insert(5, 5)
      const result = heap.decreaseKey({ key: 5, value: 5 }, 5)
      expect(result).toBe(true)
      expect(heap.getMin()?.key).toBe(5)
    })

    it('should handle decreaseKey to equal with current min', () => {
      heap.insert(1, 1)
      heap.insert(5, 5)
      heap.decreaseKey({ key: 5, value: 5 }, 1)
      expect(heap.getMin()?.key).toBe(1)
    })

    it('should handle negative keys extraction', () => {
      heap.insert(-3, -3)
      heap.insert(-1, -1)
      heap.insert(-5, -5)
      expect(heap.extractMin()?.key).toBe(-5)
      expect(heap.extractMin()?.key).toBe(-3)
      expect(heap.extractMin()?.key).toBe(-1)
    })
  })

  describe('exports', () => {
    it('should export DEFAULT_FIBONACCIHEAP_OPTIONS', () => {
      expect(DEFAULT_FIBONACCIHEAP_OPTIONS).toEqual({})
    })

    it('should export FibonacciHeapOptions type', () => {
      const opts: FibonacciHeapOptions = {}
      expect(opts).toBeDefined()
    })

    it('should allow typed node reference', () => {
      const node: FibNode<number> = {
        key: 1,
        value: 1,
        degree: 0,
        marked: false,
        parent: null,
        child: null,
        left: null!,
        right: null!,
      }
      node.left = node
      node.right = node
      expect(node.key).toBe(1)
    })
  })
})
