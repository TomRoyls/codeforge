import { describe, it, expect, beforeEach } from 'vitest'
import { WeirdHeap, DEFAULT_WEIRD_HEAP_OPTIONS } from '../../src/core/weird-heap/index.js'
import type { WeirdHeapOptions, WeirdHeapNode } from '../../src/core/weird-heap/index.js'

describe('WeirdHeap', () => {
  let heap: WeirdHeap<number>

  beforeEach(() => {
    heap = new WeirdHeap<number>()
  })

  describe('constructor', () => {
    it('should create an empty heap', () => {
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should accept empty options', () => {
      const h = new WeirdHeap<number>({})
      expect(h.size()).toBe(0)
    })

    it('should accept custom comparator', () => {
      const h = new WeirdHeap<number>({
        comparator: (a, b) => (a as number) - (b as number),
      })
      h.insert(5)
      h.insert(3)
      h.insert(7)
      expect(h.peek()).toBe(3)
    })

    it('should accept partial options', () => {
      const h = new WeirdHeap<number>({ comparator: undefined })
      h.insert(1)
      expect(h.peek()).toBe(1)
    })

    it('should use default comparator when none provided', () => {
      heap.insert(10)
      heap.insert(5)
      heap.insert(20)
      expect(heap.peek()).toBe(5)
    })

    it('should work with DEFAULT_WEIRD_HEAP_OPTIONS', () => {
      expect(DEFAULT_WEIRD_HEAP_OPTIONS).toEqual({})
    })
  })

  describe('insert', () => {
    it('should insert a single element', () => {
      heap.insert(1)
      expect(heap.size()).toBe(1)
      expect(heap.isEmpty()).toBe(false)
    })

    it('should insert multiple elements', () => {
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      expect(heap.size()).toBe(3)
    })

    it('should maintain min at root after inserts', () => {
      heap.insert(10)
      heap.insert(5)
      heap.insert(15)
      heap.insert(1)
      heap.insert(20)
      expect(heap.peek()).toBe(1)
    })

    it('should handle duplicate values', () => {
      heap.insert(5)
      heap.insert(5)
      heap.insert(5)
      expect(heap.size()).toBe(3)
      expect(heap.peek()).toBe(5)
    })

    it('should handle negative numbers', () => {
      heap.insert(-5)
      heap.insert(-10)
      heap.insert(0)
      heap.insert(5)
      expect(heap.peek()).toBe(-10)
    })

    it('should handle inserting zero', () => {
      heap.insert(0)
      expect(heap.peek()).toBe(0)
      expect(heap.size()).toBe(1)
    })

    it('should handle reverse sorted insertion', () => {
      for (let i = 10; i >= 1; i--) {
        heap.insert(i)
      }
      expect(heap.peek()).toBe(1)
      expect(heap.size()).toBe(10)
    })

    it('should handle already sorted insertion', () => {
      for (let i = 1; i <= 10; i++) {
        heap.insert(i)
      }
      expect(heap.peek()).toBe(1)
      expect(heap.size()).toBe(10)
    })

    it('should insert many elements', () => {
      for (let i = 0; i < 100; i++) {
        heap.insert(i)
      }
      expect(heap.size()).toBe(100)
      expect(heap.peek()).toBe(0)
    })
  })

  describe('peek', () => {
    it('should return undefined on empty heap', () => {
      expect(heap.peek()).toBeUndefined()
    })

    it('should return the minimum element', () => {
      heap.insert(10)
      heap.insert(5)
      heap.insert(15)
      expect(heap.peek()).toBe(5)
    })

    it('should not remove the element', () => {
      heap.insert(5)
      heap.peek()
      expect(heap.size()).toBe(1)
      expect(heap.peek()).toBe(5)
    })

    it('should update when new min is inserted', () => {
      heap.insert(10)
      expect(heap.peek()).toBe(10)
      heap.insert(5)
      expect(heap.peek()).toBe(5)
      heap.insert(1)
      expect(heap.peek()).toBe(1)
    })
  })

  describe('extractMin', () => {
    it('should return undefined on empty heap', () => {
      expect(heap.extractMin()).toBeUndefined()
    })

    it('should extract the single element', () => {
      heap.insert(42)
      expect(heap.extractMin()).toBe(42)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should extract elements in sorted order', () => {
      const values = [5, 3, 7, 1, 9, 2, 8, 4, 6]
      for (const v of values) {
        heap.insert(v)
      }
      const sorted = values.slice().sort((a, b) => a - b)
      for (const expected of sorted) {
        expect(heap.extractMin()).toBe(expected)
      }
      expect(heap.isEmpty()).toBe(true)
    })

    it('should decrease size on each extraction', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      expect(heap.size()).toBe(3)
      heap.extractMin()
      expect(heap.size()).toBe(2)
      heap.extractMin()
      expect(heap.size()).toBe(1)
      heap.extractMin()
      expect(heap.size()).toBe(0)
    })

    it('should handle many extractions', () => {
      for (let i = 50; i >= 0; i--) {
        heap.insert(i)
      }
      for (let i = 0; i <= 50; i++) {
        expect(heap.extractMin()).toBe(i)
      }
    })

    it('should handle duplicate values correctly', () => {
      heap.insert(5)
      heap.insert(3)
      heap.insert(5)
      heap.insert(3)
      expect(heap.extractMin()).toBe(3)
      expect(heap.extractMin()).toBe(3)
      expect(heap.extractMin()).toBe(5)
      expect(heap.extractMin()).toBe(5)
    })
  })

  describe('merge', () => {
    it('should merge two empty heaps', () => {
      const other = new WeirdHeap<number>()
      heap.merge(other)
      expect(heap.size()).toBe(0)
      expect(other.size()).toBe(0)
    })

    it('should merge into empty heap', () => {
      const other = new WeirdHeap<number>()
      other.insert(1)
      other.insert(2)
      heap.merge(other)
      expect(heap.size()).toBe(2)
      expect(other.size()).toBe(0)
    })

    it('should merge empty heap into non-empty', () => {
      heap.insert(1)
      const other = new WeirdHeap<number>()
      heap.merge(other)
      expect(heap.size()).toBe(1)
    })

    it('should merge two non-empty heaps', () => {
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      const other = new WeirdHeap<number>()
      other.insert(2)
      other.insert(8)
      other.insert(1)
      heap.merge(other)
      expect(heap.size()).toBe(6)
      expect(heap.peek()).toBe(1)
      expect(other.isEmpty()).toBe(true)
    })

    it('should clear the other heap after merge', () => {
      const other = new WeirdHeap<number>()
      other.insert(1)
      other.insert(2)
      heap.merge(other)
      expect(other.isEmpty()).toBe(true)
      expect(other.peek()).toBeUndefined()
    })

    it('should preserve ordering after merge', () => {
      for (let i = 10; i < 20; i++) heap.insert(i)
      const other = new WeirdHeap<number>()
      for (let i = 0; i < 10; i++) other.insert(i)
      heap.merge(other)
      for (let i = 0; i < 20; i++) {
        expect(heap.extractMin()).toBe(i)
      }
    })

    it('should merge heaps with same values', () => {
      heap.insert(1)
      heap.insert(2)
      const other = new WeirdHeap<number>()
      other.insert(1)
      other.insert(2)
      heap.merge(other)
      expect(heap.size()).toBe(4)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(2)
      expect(heap.extractMin()).toBe(2)
    })
  })

  describe('size', () => {
    it('should return 0 for empty heap', () => {
      expect(heap.size()).toBe(0)
    })

    it('should track size after inserts', () => {
      heap.insert(1)
      expect(heap.size()).toBe(1)
      heap.insert(2)
      expect(heap.size()).toBe(2)
      heap.insert(3)
      expect(heap.size()).toBe(3)
    })

    it('should track size after extractions', () => {
      heap.insert(1)
      heap.insert(2)
      heap.extractMin()
      expect(heap.size()).toBe(1)
    })

    it('should track size after clear', () => {
      heap.insert(1)
      heap.insert(2)
      heap.clear()
      expect(heap.size()).toBe(0)
    })

    it('should track size after merge', () => {
      heap.insert(1)
      const other = new WeirdHeap<number>()
      other.insert(2)
      other.insert(3)
      heap.merge(other)
      expect(heap.size()).toBe(3)
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
    it('should clear empty heap without error', () => {
      heap.clear()
      expect(heap.isEmpty()).toBe(true)
    })

    it('should clear heap with elements', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.clear()
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
      expect(heap.peek()).toBeUndefined()
    })

    it('should allow operations after clear', () => {
      heap.insert(1)
      heap.clear()
      heap.insert(2)
      expect(heap.peek()).toBe(2)
      expect(heap.size()).toBe(1)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty heap', () => {
      expect(heap.toArray()).toEqual([])
    })

    it('should return all elements for single element', () => {
      heap.insert(1)
      expect(heap.toArray()).toEqual([1])
    })

    it('should return all elements', () => {
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      const arr = heap.toArray()
      expect(arr.length).toBe(3)
      expect(arr).toContain(5)
      expect(arr).toContain(3)
      expect(arr).toContain(7)
    })

    it('should not modify heap', () => {
      heap.insert(1)
      heap.insert(2)
      heap.toArray()
      expect(heap.size()).toBe(2)
      expect(heap.peek()).toBe(1)
    })

    it('should return all elements after many operations', () => {
      for (let i = 0; i < 20; i++) {
        heap.insert(i)
      }
      const arr = heap.toArray()
      expect(arr.length).toBe(20)
    })
  })

  describe('contains', () => {
    it('should return false for empty heap', () => {
      expect(heap.contains(1)).toBe(false)
    })

    it('should find existing element', () => {
      heap.insert(5)
      expect(heap.contains(5)).toBe(true)
    })

    it('should not find missing element', () => {
      heap.insert(5)
      expect(heap.contains(3)).toBe(false)
    })

    it('should find elements after multiple inserts', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      expect(heap.contains(1)).toBe(true)
      expect(heap.contains(2)).toBe(true)
      expect(heap.contains(3)).toBe(true)
      expect(heap.contains(4)).toBe(false)
    })

    it('should handle duplicates', () => {
      heap.insert(5)
      heap.insert(5)
      expect(heap.contains(5)).toBe(true)
    })

    it('should not find after extraction', () => {
      heap.insert(5)
      heap.insert(3)
      heap.extractMin()
      expect(heap.contains(3)).toBe(false)
      expect(heap.contains(5)).toBe(true)
    })
  })

  describe('clone', () => {
    it('should clone empty heap', () => {
      const cloned = heap.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should clone heap with elements', () => {
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      const cloned = heap.clone()
      expect(cloned.size()).toBe(3)
      expect(cloned.peek()).toBe(3)
    })

    it('should create independent copy', () => {
      heap.insert(5)
      heap.insert(3)
      const cloned = heap.clone()
      cloned.insert(1)
      expect(heap.size()).toBe(2)
      expect(cloned.size()).toBe(3)
    })

    it('should not affect original when extracting from clone', () => {
      heap.insert(5)
      heap.insert(3)
      const cloned = heap.clone()
      cloned.extractMin()
      expect(heap.size()).toBe(2)
      expect(cloned.size()).toBe(1)
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
      for (let i = 0; i < 20; i++) {
        heap.insert(i)
      }
      expect(heap.isValid()).toBe(true)
    })

    it('should remain valid after extractMin', () => {
      for (let i = 0; i < 10; i++) {
        heap.insert(i)
      }
      heap.extractMin()
      expect(heap.isValid()).toBe(true)
    })

    it('should remain valid after merge', () => {
      heap.insert(5)
      heap.insert(3)
      const other = new WeirdHeap<number>()
      other.insert(2)
      other.insert(7)
      heap.merge(other)
      expect(heap.isValid()).toBe(true)
    })

    it('should remain valid after decreaseKey', () => {
      heap.insert(10)
      heap.insert(20)
      heap.insert(30)
      heap.decreaseKey(20, 5)
      expect(heap.isValid()).toBe(true)
    })
  })

  describe('decreaseKey', () => {
    it('should return false when value not found', () => {
      expect(heap.decreaseKey(5, 1)).toBe(false)
    })

    it('should return false when new value is greater', () => {
      heap.insert(5)
      expect(heap.decreaseKey(5, 10)).toBe(false)
    })

    it('should decrease key of existing element', () => {
      heap.insert(10)
      heap.insert(20)
      heap.insert(30)
      expect(heap.decreaseKey(30, 1)).toBe(true)
      expect(heap.peek()).toBe(1)
    })

    it('should return true on successful decrease', () => {
      heap.insert(10)
      heap.insert(20)
      expect(heap.decreaseKey(20, 5)).toBe(true)
    })

    it('should not affect size', () => {
      heap.insert(10)
      heap.insert(20)
      heap.decreaseKey(20, 5)
      expect(heap.size()).toBe(2)
    })

    it('should handle decrease to same value', () => {
      heap.insert(10)
      expect(heap.decreaseKey(10, 10)).toBe(true)
    })

    it('should handle multiple decreaseKey operations', () => {
      heap.insert(10)
      heap.insert(20)
      heap.insert(30)
      heap.decreaseKey(30, 5)
      heap.decreaseKey(20, 3)
      expect(heap.peek()).toBe(3)
      expect(heap.extractMin()).toBe(3)
      expect(heap.extractMin()).toBe(5)
    })
  })

  describe('delete', () => {
    it('should return false for non-existent value', () => {
      expect(heap.delete(5)).toBe(false)
    })

    it('should delete existing element', () => {
      heap.insert(10)
      heap.insert(20)
      heap.insert(30)
      expect(heap.delete(20)).toBe(true)
      expect(heap.size()).toBe(2)
      expect(heap.contains(20)).toBe(false)
    })

    it('should delete min element', () => {
      heap.insert(10)
      heap.insert(20)
      heap.insert(30)
      expect(heap.delete(10)).toBe(true)
      expect(heap.peek()).toBe(20)
    })

    it('should delete max element', () => {
      heap.insert(10)
      heap.insert(20)
      heap.insert(30)
      expect(heap.delete(30)).toBe(true)
      expect(heap.peek()).toBe(10)
    })

    it('should delete only element', () => {
      heap.insert(42)
      expect(heap.delete(42)).toBe(true)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle delete and subsequent operations', () => {
      heap.insert(10)
      heap.insert(20)
      heap.insert(30)
      heap.delete(20)
      expect(heap.extractMin()).toBe(10)
      expect(heap.extractMin()).toBe(30)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should decrease size after delete', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.delete(2)
      expect(heap.size()).toBe(2)
    })
  })

  describe('custom comparator', () => {
    it('should work with reverse order comparator', () => {
      const h = new WeirdHeap<number>({
        comparator: (a, b) => (b as number) - (a as number),
      })
      h.insert(1)
      h.insert(5)
      h.insert(3)
      expect(h.peek()).toBe(5)
    })

    it('should work with string values', () => {
      const h = new WeirdHeap<string>({
        comparator: (a, b) => (a as string).localeCompare(b as string),
      })
      h.insert('cherry')
      h.insert('apple')
      h.insert('banana')
      expect(h.peek()).toBe('apple')
      expect(h.extractMin()).toBe('apple')
      expect(h.extractMin()).toBe('banana')
    })

    it('should work with object values', () => {
      interface Item {
        priority: number
        name: string
      }
      const h = new WeirdHeap<Item>({
        comparator: (a, b) =>
          (a as Item).priority - (b as Item).priority,
      })
      h.insert({ priority: 3, name: 'low' })
      h.insert({ priority: 1, name: 'high' })
      h.insert({ priority: 2, name: 'medium' })
      expect(h.peek()?.name).toBe('high')
    })

    it('should extract in comparator order', () => {
      const h = new WeirdHeap<number>({
        comparator: (a, b) => (b as number) - (a as number),
      })
      for (let i = 1; i <= 5; i++) h.insert(i)
      expect(h.extractMin()).toBe(5)
      expect(h.extractMin()).toBe(4)
      expect(h.extractMin()).toBe(3)
      expect(h.extractMin()).toBe(2)
      expect(h.extractMin()).toBe(1)
    })
  })

  describe('stress tests', () => {
    it('should handle large number of inserts and extracts', () => {
      const n = 200
      for (let i = n; i >= 1; i--) {
        heap.insert(i)
      }
      expect(heap.size()).toBe(n)
      for (let i = 1; i <= n; i++) {
        expect(heap.extractMin()).toBe(i)
      }
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle alternating insert and extract', () => {
      heap.insert(5)
      expect(heap.extractMin()).toBe(5)
      heap.insert(3)
      heap.insert(7)
      expect(heap.extractMin()).toBe(3)
      heap.insert(1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(7)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle random order inserts', () => {
      const values = [42, 17, 83, 5, 91, 23, 67, 34, 56, 11]
      for (const v of values) {
        heap.insert(v)
      }
      const sorted = values.slice().sort((a, b) => a - b)
      for (const expected of sorted) {
        expect(heap.extractMin()).toBe(expected)
      }
    })

    it('should handle merge then extract', () => {
      for (let i = 5; i <= 10; i++) heap.insert(i)
      const other = new WeirdHeap<number>()
      for (let i = 0; i < 5; i++) other.insert(i)
      heap.merge(other)
      for (let i = 0; i <= 10; i++) {
        expect(heap.extractMin()).toBe(i)
      }
    })

    it('should handle multiple merges', () => {
      for (let i = 0; i < 5; i++) heap.insert(i)
      const other1 = new WeirdHeap<number>()
      for (let i = 5; i < 10; i++) other1.insert(i)
      const other2 = new WeirdHeap<number>()
      for (let i = 10; i < 15; i++) other2.insert(i)
      heap.merge(other1)
      heap.merge(other2)
      expect(heap.size()).toBe(15)
      for (let i = 0; i < 15; i++) {
        expect(heap.extractMin()).toBe(i)
      }
    })

    it('should handle decreaseKey stress', () => {
      for (let i = 0; i < 20; i++) {
        heap.insert(i * 10)
      }
      for (let i = 19; i >= 0; i--) {
        heap.decreaseKey(i * 10, i)
      }
      for (let i = 0; i < 20; i++) {
        expect(heap.extractMin()).toBe(i)
      }
    })

    it('should handle delete stress', () => {
      for (let i = 0; i < 20; i++) {
        heap.insert(i)
      }
      for (let i = 0; i < 20; i += 2) {
        heap.delete(i)
      }
      expect(heap.size()).toBe(10)
      for (let i = 1; i < 20; i += 2) {
        expect(heap.extractMin()).toBe(i)
      }
    })
  })

  describe('edge cases', () => {
    it('should handle single element lifecycle', () => {
      heap.insert(1)
      expect(heap.size()).toBe(1)
      expect(heap.isEmpty()).toBe(false)
      expect(heap.peek()).toBe(1)
      expect(heap.contains(1)).toBe(true)
      expect(heap.isValid()).toBe(true)
      expect(heap.extractMin()).toBe(1)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle insert after full extraction', () => {
      heap.insert(1)
      heap.extractMin()
      heap.insert(2)
      expect(heap.peek()).toBe(2)
    })

    it('should handle clear and reuse', () => {
      for (let i = 0; i < 10; i++) heap.insert(i)
      heap.clear()
      expect(heap.isEmpty()).toBe(true)
      heap.insert(42)
      expect(heap.peek()).toBe(42)
    })

    it('should handle merge then clear', () => {
      const other = new WeirdHeap<number>()
      other.insert(1)
      heap.merge(other)
      heap.clear()
      expect(heap.isEmpty()).toBe(true)
      expect(other.isEmpty()).toBe(true)
    })

    it('should handle toArray on large heap', () => {
      for (let i = 0; i < 50; i++) heap.insert(i)
      const arr = heap.toArray()
      expect(arr.length).toBe(50)
    })

    it('should handle decreaseKey on min element', () => {
      heap.insert(5)
      heap.insert(10)
      heap.insert(15)
      heap.decreaseKey(5, 1)
      expect(heap.peek()).toBe(1)
    })

    it('should handle delete on last element', () => {
      heap.insert(1)
      heap.insert(2)
      heap.delete(2)
      expect(heap.size()).toBe(1)
      expect(heap.peek()).toBe(1)
    })

    it('should handle negative values throughout', () => {
      heap.insert(-10)
      heap.insert(-5)
      heap.insert(-20)
      expect(heap.peek()).toBe(-20)
      expect(heap.extractMin()).toBe(-20)
      expect(heap.extractMin()).toBe(-10)
      expect(heap.extractMin()).toBe(-5)
    })

    it('should handle floating point values', () => {
      const h = new WeirdHeap<number>()
      h.insert(1.5)
      h.insert(0.5)
      h.insert(2.5)
      expect(h.peek()).toBe(0.5)
      expect(h.extractMin()).toBe(0.5)
      expect(h.extractMin()).toBe(1.5)
      expect(h.extractMin()).toBe(2.5)
    })

    it('should handle merge of equal-size heaps', () => {
      for (let i = 0; i < 5; i++) heap.insert(i)
      const other = new WeirdHeap<number>()
      for (let i = 5; i < 10; i++) other.insert(i)
      heap.merge(other)
      expect(heap.size()).toBe(10)
      expect(heap.peek()).toBe(0)
    })

    it('should handle clone of empty heap operations', () => {
      const cloned = heap.clone()
      cloned.insert(1)
      expect(heap.isEmpty()).toBe(true)
      expect(cloned.size()).toBe(1)
    })
  })

  describe('type exports', () => {
    it('should export types correctly', () => {
      const opts: WeirdHeapOptions = {}
      expect(opts).toBeDefined()

      const node: WeirdHeapNode<number> = {
        value: 1,
        rank: 0,
        parent: null,
        child: null,
        sibling: null,
        weird: false,
      }
      expect(node.value).toBe(1)
      expect(node.rank).toBe(0)
      expect(node.weird).toBe(false)
    })

    it('should export WeirdHeapNode with all fields', () => {
      const child: WeirdHeapNode<string> = {
        value: 'child',
        rank: 0,
        parent: null,
        child: null,
        sibling: null,
        weird: false,
      }
      const parent: WeirdHeapNode<string> = {
        value: 'parent',
        rank: 1,
        parent: null,
        child,
        sibling: null,
        weird: true,
      }
      child.parent = parent
      expect(parent.child).toBe(child)
      expect(child.parent).toBe(parent)
      expect(parent.weird).toBe(true)
    })
  })

  describe('comprehensive ordering', () => {
    it('should maintain heap property through mixed operations', () => {
      heap.insert(50)
      heap.insert(30)
      heap.insert(70)
      heap.insert(10)
      heap.insert(90)
      heap.extractMin()
      heap.insert(20)
      heap.insert(5)
      heap.extractMin()
      expect(heap.isValid()).toBe(true)

      const remaining: number[] = []
      while (!heap.isEmpty()) {
        remaining.push(heap.extractMin()!)
      }
      for (let i = 1; i < remaining.length; i++) {
        expect(remaining[i - 1]).toBeLessThanOrEqual(remaining[i])
      }
    })

    it('should sort correctly after many merges', () => {
      const heaps: WeirdHeap<number>[] = []
      for (let h = 0; h < 5; h++) {
        const wh = new WeirdHeap<number>()
        for (let i = 0; i < 10; i++) {
          wh.insert(h * 10 + i)
        }
        heaps.push(wh)
      }
      for (const wh of heaps) {
        heap.merge(wh)
      }
      expect(heap.size()).toBe(50)
      for (let i = 0; i < 50; i++) {
        expect(heap.extractMin()).toBe(i)
      }
    })

    it('should handle interleaved decrease and extract', () => {
      heap.insert(100)
      heap.insert(200)
      heap.insert(300)
      heap.decreaseKey(300, 50)
      expect(heap.extractMin()).toBe(50)
      heap.decreaseKey(200, 75)
      expect(heap.extractMin()).toBe(75)
      expect(heap.extractMin()).toBe(100)
    })
  })
})
