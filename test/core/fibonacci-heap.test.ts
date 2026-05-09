import { describe, it, expect, beforeEach } from 'vitest'
import { FibonacciHeap } from '../../src/core/fibonacci-heap/fibonacci-heap.js'
import { DEFAULT_COMPARE } from '../../src/core/fibonacci-heap/types.js'
import type { CompareFunction, FibonacciNode } from '../../src/core/fibonacci-heap/types.js'

describe('FibonacciHeap', () => {
  let heap: FibonacciHeap<number>

  beforeEach(() => {
    heap = new FibonacciHeap<number>()
  })

  describe('constructor', () => {
    it('should create an empty heap with default comparator', () => {
      const h = new FibonacciHeap<number>()
      expect(h.size).toBe(0)
      expect(h.isEmpty()).toBe(true)
    })

    it('should accept a custom comparator', () => {
      const h = new FibonacciHeap<number>((a, b) => b - a)
      h.insert(3)
      h.insert(1)
      h.insert(2)
      expect(h.peek()).toBe(3)
    })

    it('should create a heap with no arguments', () => {
      const h = new FibonacciHeap()
      expect(h.size).toBe(0)
    })

    it('should work with string comparator', () => {
      const h = new FibonacciHeap<string>((a, b) => a.localeCompare(b))
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

    it('should return a FibonacciNode', () => {
      const node = heap.insert(5)
      expect(node).toBeDefined()
      expect(node.value).toBe(5)
      expect(node.degree).toBe(0)
      expect(node.marked).toBe(false)
      expect(node.parent).toBeNull()
      expect(node.child).toBeNull()
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
  })

  describe('decreaseKey', () => {
    it('should decrease the key of a node', () => {
      const node5 = heap.insert(5)
      heap.insert(10)
      heap.decreaseKey(node5, 2)
      expect(heap.peek()).toBe(2)
    })

    it('should throw error when increasing key', () => {
      const node = heap.insert(5)
      expect(() => heap.decreaseKey(node, 10)).toThrow('New value is greater than current value')
    })

    it('should maintain heap property after decreaseKey', () => {
      const node5 = heap.insert(5)
      heap.insert(10)
      heap.insert(3)
      heap.decreaseKey(node5, 1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(3)
      expect(heap.extractMin()).toBe(10)
    })

    it('should handle decreaseKey to same value', () => {
      const node = heap.insert(5)
      heap.insert(10)
      heap.decreaseKey(node, 5)
      expect(heap.peek()).toBe(5)
    })

    it('should work with negative values', () => {
      const node = heap.insert(5)
      heap.decreaseKey(node, -10)
      expect(heap.peek()).toBe(-10)
    })

    it('should handle cascading cuts', () => {
      const node1 = heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.insert(4)
      const node5 = heap.insert(5)
      heap.extractMin()
      heap.decreaseKey(node5, 0)
      expect(heap.peek()).toBe(0)
    })

    it('should update min pointer when decreased value is new min', () => {
      heap.insert(10)
      const node = heap.insert(20)
      heap.insert(5)
      heap.decreaseKey(node, 1)
      expect(heap.peek()).toBe(1)
    })

    it('should handle decreaseKey on root node', () => {
      const node = heap.insert(10)
      heap.insert(5)
      heap.decreaseKey(node, 1)
      expect(heap.peek()).toBe(1)
    })

    it('should handle multiple decreaseKey operations', () => {
      const nodes: FibonacciNode<number>[] = []
      for (let i = 0; i < 10; i++) {
        nodes.push(heap.insert(i * 10))
      }
      heap.extractMin()
      heap.decreaseKey(nodes[5]!, 0)
      expect(heap.peek()).toBe(0)
      heap.decreaseKey(nodes[3]!, -1)
      expect(heap.peek()).toBe(-1)
    })
  })

  describe('delete', () => {
    it('should delete a specific node', () => {
      const node5 = heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.delete(node5)
      expect(heap.size).toBe(2)
      expect(heap.extractMin()).toBe(3)
      expect(heap.extractMin()).toBe(7)
    })

    it('should delete the min node', () => {
      const node3 = heap.insert(3)
      heap.insert(5)
      heap.insert(7)
      heap.delete(node3)
      expect(heap.peek()).toBe(5)
      expect(heap.size).toBe(2)
    })

    it('should handle deleting the only element', () => {
      const node = heap.insert(5)
      heap.delete(node)
      expect(heap.isEmpty()).toBe(true)
      expect(heap.size).toBe(0)
    })

    it('should handle deleting multiple nodes', () => {
      const n1 = heap.insert(1)
      const n2 = heap.insert(2)
      const n3 = heap.insert(3)
      const n4 = heap.insert(4)
      heap.delete(n3)
      heap.delete(n1)
      expect(heap.size).toBe(2)
      expect(heap.peek()).toBe(2)
    })

    it('should maintain heap property after deletion', () => {
      const n1 = heap.insert(10)
      const n2 = heap.insert(20)
      const n3 = heap.insert(30)
      const n4 = heap.insert(40)
      heap.delete(n2)
      expect(heap.extractMin()).toBe(10)
      expect(heap.extractMin()).toBe(30)
      expect(heap.extractMin()).toBe(40)
    })

    it('should delete from middle of heap', () => {
      const nodes: FibonacciNode<number>[] = []
      for (let i = 0; i < 5; i++) {
        nodes.push(heap.insert(i * 10))
      }
      heap.delete(nodes[2]!)
      expect(heap.toArray()).toEqual([0, 10, 30, 40])
    })

    it('should delete and allow reinsert', () => {
      const node = heap.insert(5)
      heap.insert(10)
      heap.insert(3)
      heap.delete(node)
      heap.insert(5)
      expect(heap.toArray()).toEqual([3, 5, 10])
    })

    it('should handle delete followed by extractMin', () => {
      const n1 = heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.delete(n1)
      expect(heap.extractMin()).toBe(2)
      expect(heap.extractMin()).toBe(3)
    })
  })

  describe('merge', () => {
    it('should merge two non-empty heaps', () => {
      heap.insert(1)
      heap.insert(3)
      const other = new FibonacciHeap<number>()
      other.insert(2)
      other.insert(4)
      heap.merge(other)
      expect(heap.size).toBe(4)
      expect(other.size).toBe(0)
      expect(other.isEmpty()).toBe(true)
    })

    it('should merge into empty heap', () => {
      const other = new FibonacciHeap<number>()
      other.insert(1)
      other.insert(2)
      heap.merge(other)
      expect(heap.size).toBe(2)
      expect(heap.peek()).toBe(1)
    })

    it('should merge empty heap into non-empty', () => {
      heap.insert(1)
      heap.insert(2)
      const other = new FibonacciHeap<number>()
      heap.merge(other)
      expect(heap.size).toBe(2)
      expect(heap.peek()).toBe(1)
    })

    it('should merge two empty heaps', () => {
      const other = new FibonacciHeap<number>()
      heap.merge(other)
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should maintain sorted order after merge', () => {
      heap.insert(1)
      heap.insert(5)
      const other = new FibonacciHeap<number>()
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
      const other = new FibonacciHeap<number>()
      other.insert(2)
      other.insert(3)
      heap.merge(other)
      expect(other.peek()).toBeUndefined()
    })

    it('should update min to smallest from both heaps', () => {
      heap.insert(10)
      heap.insert(20)
      const other = new FibonacciHeap<number>()
      other.insert(5)
      other.insert(15)
      heap.merge(other)
      expect(heap.peek()).toBe(5)
    })

    it('should merge heaps with overlapping ranges', () => {
      heap.insert(1)
      heap.insert(4)
      heap.insert(7)
      const other = new FibonacciHeap<number>()
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
      const h2 = new FibonacciHeap<number>()
      h2.insert(3)
      h2.insert(8)
      const h3 = new FibonacciHeap<number>()
      h3.insert(2)
      h3.insert(5)
      heap.merge(h2)
      heap.merge(h3)
      expect(heap.toArray()).toEqual([1, 2, 3, 5, 6, 8])
    })

    it('should handle merge with same comparator', () => {
      const cmp: CompareFunction<number> = (a, b) => a - b
      const h1 = new FibonacciHeap<number>(cmp)
      const h2 = new FibonacciHeap<number>(cmp)
      h1.insert(1)
      h2.insert(2)
      h1.merge(h2)
      expect(h1.peek()).toBe(1)
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
      const h = new FibonacciHeap<number>((a, b) => b - a)
      h.insert(1)
      h.insert(2)
      h.insert(3)
      const cloned = h.clone()
      expect(cloned.peek()).toBe(3)
      expect(cloned.extractMin()).toBe(3)
    })

    it('should preserve heap structure in clone', () => {
      for (let i = 0; i < 20; i++) {
        heap.insert(i)
      }
      for (let i = 0; i < 10; i++) {
        heap.extractMin()
      }
      const cloned = heap.clone()
      expect(cloned.size).toBe(10)
      for (let i = 10; i < 20; i++) {
        expect(cloned.extractMin()).toBe(i)
      }
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
  })

  describe('fromArray', () => {
    it('should create heap from empty array', () => {
      const h = FibonacciHeap.fromArray([])
      expect(h.size).toBe(0)
      expect(h.isEmpty()).toBe(true)
    })

    it('should create heap from single element', () => {
      const h = FibonacciHeap.fromArray([5])
      expect(h.size).toBe(1)
      expect(h.peek()).toBe(5)
    })

    it('should create heap from multiple elements', () => {
      const h = FibonacciHeap.fromArray([5, 3, 1, 4, 2])
      expect(h.size).toBe(5)
      expect(h.peek()).toBe(1)
    })

    it('should create heap with custom comparator', () => {
      const h = FibonacciHeap.fromArray([1, 2, 3], (a, b) => b - a)
      expect(h.peek()).toBe(3)
    })

    it('should extract elements in sorted order', () => {
      const h = FibonacciHeap.fromArray([5, 3, 1, 4, 2])
      expect(h.extractMin()).toBe(1)
      expect(h.extractMin()).toBe(2)
      expect(h.extractMin()).toBe(3)
      expect(h.extractMin()).toBe(4)
      expect(h.extractMin()).toBe(5)
    })

    it('should handle already sorted array', () => {
      const h = FibonacciHeap.fromArray([1, 2, 3, 4, 5])
      expect(h.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle reverse sorted array', () => {
      const h = FibonacciHeap.fromArray([5, 4, 3, 2, 1])
      expect(h.toArray()).toEqual([1, 2, 3, 4, 5])
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
      const h = FibonacciHeap.fromArray(arr)
      const sorted = arr.sort((a, b) => a - b)
      for (let i = 0; i < 1000; i++) {
        expect(h.extractMin()).toBe(sorted[i])
      }
    })
  })

  describe('custom objects', () => {
    it('should work with objects using custom comparator', () => {
      interface Item {
        priority: number
        name: string
      }
      const h = new FibonacciHeap<Item>((a, b) => a.priority - b.priority)
      h.insert({ priority: 3, name: 'c' })
      h.insert({ priority: 1, name: 'a' })
      h.insert({ priority: 2, name: 'b' })
      expect(h.peek()!.name).toBe('a')
      expect(h.extractMin()!.name).toBe('a')
      expect(h.extractMin()!.name).toBe('b')
      expect(h.extractMin()!.name).toBe('c')
    })

    it('should work with string values', () => {
      const h = new FibonacciHeap<string>((a, b) => a.localeCompare(b))
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
      const h = new FibonacciHeap<Date>((a, b) => a.getTime() - b.getTime())
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

  describe('amortized behavior', () => {
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

  describe('node properties', () => {
    it('should set node properties correctly after insert', () => {
      const node = heap.insert(5)
      expect(node.value).toBe(5)
      expect(node.degree).toBe(0)
      expect(node.marked).toBe(false)
      expect(node.parent).toBeNull()
      expect(node.child).toBeNull()
      expect(node.left).toBe(node)
      expect(node.right).toBe(node)
    })

    it('should have circular links in root list', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      expect(heap.size).toBe(3)
    })
  })

  describe('stress test with decreaseKey and delete', () => {
    it('should handle interleaved decreaseKey and extractMin', () => {
      const nodes: FibonacciNode<number>[] = []
      for (let i = 0; i < 20; i++) {
        nodes.push(heap.insert(i * 5))
      }
      heap.decreaseKey(nodes[10]!, 1)
      expect(heap.peek()).toBe(0)
      heap.extractMin()
      heap.decreaseKey(nodes[15]!, 2)
      expect(heap.peek()).toBe(1)
    })
  })

  describe('additional edge cases', () => {
    it('should handle extractMin after merge', () => {
      heap.insert(3)
      heap.insert(1)
      const other = new FibonacciHeap<number>()
      other.insert(2)
      other.insert(4)
      heap.merge(other)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(2)
      expect(heap.extractMin()).toBe(3)
      expect(heap.extractMin()).toBe(4)
    })

    it('should handle decreaseKey after merge', () => {
      const node = heap.insert(10)
      heap.insert(5)
      const other = new FibonacciHeap<number>()
      other.insert(3)
      other.insert(7)
      heap.merge(other)
      heap.decreaseKey(node, 1)
      expect(heap.peek()).toBe(1)
    })

    it('should handle delete after merge', () => {
      const node10 = heap.insert(10)
      heap.insert(5)
      const other = new FibonacciHeap<number>()
      other.insert(3)
      other.insert(7)
      heap.merge(other)
      heap.delete(node10)
      expect(heap.toArray()).toEqual([3, 5, 7])
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

    it('should handle fromArray with duplicates', () => {
      const h = FibonacciHeap.fromArray([3, 1, 2, 1, 3, 2])
      expect(h.size).toBe(6)
      expect(h.extractMin()).toBe(1)
      expect(h.extractMin()).toBe(1)
      expect(h.extractMin()).toBe(2)
      expect(h.extractMin()).toBe(2)
      expect(h.extractMin()).toBe(3)
      expect(h.extractMin()).toBe(3)
    })

    it('should handle iterator with single element', () => {
      heap.insert(42)
      expect([...heap]).toEqual([42])
    })

    it('should handle clear after merge', () => {
      heap.insert(1)
      const other = new FibonacciHeap<number>()
      other.insert(2)
      heap.merge(other)
      heap.clear()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle toArray after decreaseKey', () => {
      const node = heap.insert(10)
      heap.insert(5)
      heap.insert(15)
      heap.decreaseKey(node, 2)
      expect(heap.toArray()).toEqual([2, 5, 15])
    })

    it('should handle toArray after delete', () => {
      const node10 = heap.insert(10)
      heap.insert(5)
      heap.insert(15)
      heap.delete(node10)
      expect(heap.toArray()).toEqual([5, 15])
    })

    it('should handle multiple merges', () => {
      heap.insert(5)
      for (let i = 0; i < 5; i++) {
        const other = new FibonacciHeap<number>()
        other.insert(i * 2)
        other.insert(i * 2 + 1)
        heap.merge(other)
      }
      expect(heap.size).toBe(11)
    })

    it('should handle negative infinity', () => {
      heap.insert(Infinity)
      heap.insert(-Infinity)
      heap.insert(0)
      expect(heap.extractMin()).toBe(-Infinity)
      expect(heap.extractMin()).toBe(0)
      expect(heap.extractMin()).toBe(Infinity)
    })

    it('should handle NaN comparison gracefully', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(2)
      expect(heap.extractMin()).toBe(3)
    })

    it('should handle decreaseKey to minimum possible value', () => {
      const node = heap.insert(100)
      heap.insert(50)
      heap.insert(75)
      heap.decreaseKey(node, Number.MIN_SAFE_INTEGER)
      expect(heap.peek()).toBe(Number.MIN_SAFE_INTEGER)
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

    it('should handle merge after extractMin', () => {
      heap.insert(1)
      heap.insert(5)
      heap.extractMin()
      const other = new FibonacciHeap<number>()
      other.insert(2)
      other.insert(3)
      heap.merge(other)
      expect(heap.toArray()).toEqual([2, 3, 5])
    })

    it('should handle size after failed delete operations', () => {
      const n1 = heap.insert(1)
      const n2 = heap.insert(2)
      heap.delete(n1)
      expect(heap.size).toBe(1)
      heap.delete(n2)
      expect(heap.size).toBe(0)
    })

    it('should handle decreaseKey on newly inserted node', () => {
      const node = heap.insert(10)
      heap.insert(5)
      heap.decreaseKey(node, 3)
      expect(heap.peek()).toBe(3)
    })

    it('should handle extractMin consolidating many trees', () => {
      for (let i = 1; i <= 16; i++) {
        heap.insert(i)
      }
      for (let i = 1; i <= 16; i++) {
        expect(heap.extractMin()).toBe(i)
      }
    })

    it('should handle fromArray then merge', () => {
      const h1 = FibonacciHeap.fromArray([5, 3, 1])
      const h2 = FibonacciHeap.fromArray([6, 4, 2])
      h1.merge(h2)
      expect(h1.toArray()).toEqual([1, 2, 3, 4, 5, 6])
    })
  })
})
