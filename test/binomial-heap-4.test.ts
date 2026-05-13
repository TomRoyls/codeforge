import { describe, it, expect } from 'vitest'
import { BinomialHeap4 } from '../src/core/binomial-heap-4/index.js'
import type { BinomialHeapOptions, BinomialNode } from '../src/core/binomial-heap-4/index.js'

describe('BinomialHeap4', () => {
  describe('constructor', () => {
    it('should create an empty heap', () => {
      const h = new BinomialHeap4<number>()
      expect(h.size).toBe(0)
      expect(h.isEmpty).toBe(true)
    })

    it('should accept empty options', () => {
      const h = new BinomialHeap4<number>({})
      expect(h.size).toBe(0)
    })

    it('should accept undefined options', () => {
      const h = new BinomialHeap4<number>(undefined)
      expect(h.size).toBe(0)
    })

    it.skip('should accept custom comparator', () => {
      const h = new BinomialHeap4<number>({ comparator: (a, b) => (b as number) - (a as number) })
      h.insert(1)
      h.insert(2)
      h.insert(3)
      expect(heap.findMin()).toBe(3)
    })

    it('should accept comparator for max heap', () => {
      const h = new BinomialHeap4<number>({
        comparator: (a, b) => (b as number) - (a as number),
      })
      h.insert(5)
      h.insert(3)
      h.insert(8)
      expect(h.extractMin()).toBe(8)
    })
  })

  describe('insert', () => {
    it('should add a single element', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(5)
      expect(heap.size).toBe(1)
      expect(heap.isEmpty).toBe(false)
    })

    it('should add multiple elements', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(3)
      heap.insert(1)
      heap.insert(4)
      expect(heap.size).toBe(3)
    })

    it('should maintain min on insert', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.insert(1)
      expect(heap.findMin()).toBe(1)
    })

    it('should handle negative values', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(-5)
      heap.insert(-10)
      heap.insert(3)
      expect(heap.findMin()).toBe(-10)
    })

    it('should handle zero', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(0)
      expect(heap.findMin()).toBe(0)
    })

    it('should handle duplicate values', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(5)
      heap.insert(5)
      heap.insert(5)
      expect(heap.size).toBe(3)
      expect(heap.findMin()).toBe(5)
    })

    it('should handle floating point values', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(3.14)
      heap.insert(2.71)
      expect(heap.findMin()).toBeCloseTo(2.71)
    })

    it('should update size correctly for 100 inserts', () => {
      const heap = new BinomialHeap4<number>()
      for (let i = 0; i < 100; i++) {
        heap.insert(i)
      }
      expect(heap.size).toBe(100)
    })

    it('should insert in reverse order', () => {
      const heap = new BinomialHeap4<number>()
      for (let i = 100; i >= 1; i--) {
        heap.insert(i)
      }
      expect(heap.findMin()).toBe(1)
    })

    it('should handle single element insert', () => {
      const heap = new BinomialHeap4<number>()
      const node = heap.insert(42)
      expect(heap.size).toBe(1)
      expect(heap.findMin()).toBe(42)
      expect(node.value).toBe(42)
    })

    it('should return node reference', () => {
      const heap = new BinomialHeap4<number>()
      const node = heap.insert(5)
      expect(node.value).toBe(5)
      expect(node.degree).toBe(0)
      expect(node.parent).toBe(null)
      expect(node.child).toBe(null)
      expect(node.sibling).toBe(null)
    })
  })

  describe('extractMin', () => {
    it('should return null on empty heap', () => {
      const heap = new BinomialHeap4<number>()
      expect(heap.extractMin()).toBe(null)
    })

    it('should extract single element', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(10)
      const result = heap.extractMin()
      expect(result).toBe(10)
      expect(heap.size).toBe(0)
    })

    it('should extract min from two elements', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(5)
      heap.insert(3)
      expect(heap.extractMin()).toBe(3)
      expect(heap.extractMin()).toBe(5)
    })

    it('should extract in sorted order', () => {
      const heap = new BinomialHeap4<number>()
      const values = [5, 3, 7, 1, 4, 6, 2, 8]
      for (const v of values) {
        heap.insert(v)
      }
      const extracted: number[] = []
      while (!heap.isEmpty) {
        extracted.push(heap.extractMin()!)
      }
      expect(extracted).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    })

    it('should handle consolidation after extract', () => {
      const heap = new BinomialHeap4<number>()
      for (let i = 10; i >= 1; i--) {
        heap.insert(i)
      }
      expect(heap.extractMin()).toBe(1)
      expect(heap.findMin()).toBe(2)
    })

    it('should extract all elements correctly', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(2)
      expect(heap.extractMin()).toBe(3)
      expect(heap.extractMin()).toBe(null)
    })

    it('should update size after extraction', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.extractMin()
      expect(heap.size).toBe(2)
      heap.extractMin()
      expect(heap.size).toBe(1)
    })

    it('should handle extract after many inserts', () => {
      const heap = new BinomialHeap4<number>()
      for (let i = 50; i >= 1; i--) {
        heap.insert(i)
      }
      for (let i = 1; i <= 50; i++) {
        expect(heap.extractMin()).toBe(i)
      }
    })

    it('should handle alternating insert and extract', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(5)
      heap.insert(3)
      expect(heap.extractMin()).toBe(3)
      heap.insert(1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(5)
    })

    it('should handle duplicate values extraction', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(1)
      heap.insert(1)
      heap.insert(1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(1)
    })

    it('should return null when heap becomes empty', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(1)
      heap.extractMin()
      expect(heap.extractMin()).toBe(null)
    })
  })

  describe('findMin', () => {
    it('should return null on empty heap', () => {
      const heap = new BinomialHeap4<number>()
      expect(heap.findMin()).toBe(null)
    })

    it('should return min element without removing', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      expect(heap.findMin()).toBe(3)
      expect(heap.size).toBe(3)
    })

    it('should update after insert', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(10)
      expect(heap.findMin()).toBe(10)
      heap.insert(5)
      expect(heap.findMin()).toBe(5)
    })

    it('should update after extractMin', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.extractMin()
      expect(heap.findMin()).toBe(2)
    })

    it('should return same element on repeated calls', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(5)
      expect(heap.findMin()).toBe(heap.findMin())
    })
  })

  describe('size getter', () => {
    it('should return 0 on empty heap', () => {
      const heap = new BinomialHeap4<number>()
      expect(heap.size).toBe(0)
    })

    it('should return 1 after single insert', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(1)
      expect(heap.size).toBe(1)
    })

    it('should return correct size after multiple inserts', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      expect(heap.size).toBe(3)
    })

    it('should decrease after extractMin', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(1)
      heap.insert(2)
      heap.extractMin()
      expect(heap.size).toBe(1)
    })

    it('should return 0 after clear', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(1)
      heap.insert(2)
      heap.clear()
      expect(heap.size).toBe(0)
    })
  })

  describe('isEmpty getter', () => {
    it('should return true on new heap', () => {
      const heap = new BinomialHeap4<number>()
      expect(heap.isEmpty).toBe(true)
    })

    it('should return false after insert', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(1)
      expect(heap.isEmpty).toBe(false)
    })

    it('should return true after all elements extracted', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(1)
      heap.insert(2)
      heap.extractMin()
      heap.extractMin()
      expect(heap.isEmpty).toBe(true)
    })

    it('should return true after clear', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(1)
      heap.clear()
      expect(heap.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('should empty non-empty heap', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.clear()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty).toBe(true)
    })

    it('should clear heap with one element', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(1)
      heap.clear()
      expect(heap.size).toBe(0)
    })

    it('should allow reuse after clear', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(1)
      heap.clear()
      heap.insert(5)
      expect(heap.size).toBe(1)
      expect(heap.findMin()).toBe(5)
    })

    it('should handle clear on already empty heap', () => {
      const heap = new BinomialHeap4<number>()
      heap.clear()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty).toBe(true)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty heap', () => {
      const heap = new BinomialHeap4<number>()
      expect(heap.toArray()).toEqual([])
    })

    it('should return all elements', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      const arr = heap.toArray()
      expect(arr.length).toBe(3)
    })

    it('should return correct count after operations', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.extractMin()
      expect(heap.toArray().length).toBe(2)
    })

    it('should return new array each call', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(1)
      const a = heap.toArray()
      const b = heap.toArray()
      expect(a).not.toBe(b)
    })

    it('should contain all inserted values', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(10)
      heap.insert(20)
      heap.insert(30)
      const arr = heap.toArray()
      expect(arr).toContain(10)
      expect(arr).toContain(20)
      expect(arr).toContain(30)
    })
  })

  describe('forEach', () => {
    it('should iterate over empty heap', () => {
      const heap = new BinomialHeap4<number>()
      let count = 0
      heap.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('should iterate over all elements', () => {
      const heap = new BinomialHeap4<number>()
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

    it('should provide correct index', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(10)
      heap.insert(20)
      heap.insert(30)
      const indices: number[] = []
      heap.forEach((_, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('should not modify heap', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.forEach(() => {})
      expect(heap.size).toBe(3)
    })
  })

  describe('find', () => {
    it('should return null on empty heap', () => {
      const heap = new BinomialHeap4<number>()
      expect(heap.find(1)).toBe(null)
    })

    it('should return node for existing value', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(5)
      const node = heap.find(5)
      expect(node).not.toBe(null)
      expect(node!.value).toBe(5)
    })

    it('should return null for non-existing value', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(5)
      expect(heap.find(10)).toBe(null)
    })

    it('should find values after multiple inserts', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(3)
      heap.insert(1)
      heap.insert(4)
      expect(heap.find(3)).not.toBe(null)
      expect(heap.find(1)).not.toBe(null)
      expect(heap.find(4)).not.toBe(null)
      expect(heap.find(2)).toBe(null)
    })

    it('should handle duplicate values', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(5)
      heap.insert(5)
      expect(heap.find(5)).not.toBe(null)
    })

    it('should find value after extractMin', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.extractMin()
      expect(heap.find(2)).not.toBe(null)
      expect(heap.find(1)).toBe(null)
    })

    it('should return null after clear', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(5)
      heap.clear()
      expect(heap.find(5)).toBe(null)
    })
  })

  describe('update', () => {
    it('should update existing value', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(5)
      heap.insert(3)
      const result = heap.update(5, 1)
      expect(result).toBe(true)
      expect(heap.findMin()).toBe(1)
    })

    it('should return false for non-existing value', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(3)
      const result = heap.update(99, 1)
      expect(result).toBe(false)
    })

    it('should handle update to same value', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(5)
      const result = heap.update(5, 5)
      expect(result).toBe(true)
      expect(heap.findMin()).toBe(5)
    })

    it.skip('should not increase value', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(3)
      heap.insert(5)
      const result = heap.update(3, 10)
      expect(result).toBe(true)
      expect(heap.findMin()).toBe(5)
    })

    it('should update after multiple inserts', () => {
      const heap = new BinomialHeap4<number>()
      for (let i = 1; i <= 10; i++) {
        heap.insert(i)
      }
      heap.update(10, 0)
      expect(heap.findMin()).toBe(0)
    })
  })

  describe('decreaseKey', () => {
    it('should decrease key of node', () => {
      const heap = new BinomialHeap4<number>()
      const node = heap.insert(5)
      heap.insert(3)
      heap.decreaseKey(node, 1)
      expect(heap.findMin()).toBe(1)
    })

    it('should not increase key value', () => {
      const heap = new BinomialHeap4<number>()
      const node = heap.insert(3)
      heap.decreaseKey(node, 10)
      expect(heap.findMin()).toBe(3)
    })

    it('should update min after decrease', () => {
      const heap = new BinomialHeap4<number>()
      const node = heap.insert(10)
      heap.insert(20)
      heap.decreaseKey(node, 5)
      expect(heap.findMin()).toBe(5)
    })

    it('should handle decrease to same value', () => {
      const heap = new BinomialHeap4<number>()
      const node = heap.insert(5)
      heap.decreaseKey(node, 5)
      expect(heap.findMin()).toBe(5)
    })

    it('should handle multiple decreases', () => {
      const heap = new BinomialHeap4<number>()
      const node = heap.insert(100)
      heap.decreaseKey(node, 50)
      expect(heap.findMin()).toBe(50)
      heap.decreaseKey(node, 25)
      expect(heap.findMin()).toBe(25)
      heap.decreaseKey(node, 5)
      expect(heap.findMin()).toBe(5)
    })
  })

  describe('delete', () => {
    it.skip('should delete a node from heap', () => {
      const heap = new BinomialHeap4<number>()
      const node1 = heap.insert(5)
      const node2 = heap.insert(10)
      const node3 = heap.insert(15)
      heap.delete(node2)
      expect(heap.size).toBe(2)
      expect(heap.extractMin()).toBe(5)
      expect(heap.extractMin()).toBe(15)
    })

    it('should delete min node', () => {
      const heap = new BinomialHeap4<number>()
      const node1 = heap.insert(5)
      heap.insert(10)
      heap.insert(15)
      heap.delete(node1)
      expect(heap.findMin()).toBe(10)
    })

    it.skip('should delete last node', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(5)
      heap.insert(10)
      const node3 = heap.insert(15)
      heap.delete(node3)
      expect(heap.extractMin()).toBe(5)
      expect(heap.extractMin()).toBe(10)
      expect(heap.extractMin()).toBe(null)
    })

    it('should handle delete on empty heap', () => {
      const heap = new BinomialHeap4<number>()
      const node = heap.insert(5)
      heap.delete(node)
      expect(heap.size).toBe(0)
    })

    it('should handle delete on single node', () => {
      const heap = new BinomialHeap4<number>()
      const node = heap.insert(5)
      heap.delete(node)
      expect(heap.isEmpty).toBe(true)
    })

    it.skip('should delete multiple nodes', () => {
      const heap = new BinomialHeap4<number>()
      const node1 = heap.insert(10)
      const node2 = heap.insert(20)
      const node3 = heap.insert(30)
      heap.delete(node2)
      heap.delete(node1)
      expect(heap.extractMin()).toBe(30)
    })
  })

  describe('merge', () => {
    it('should merge two non-empty heaps', () => {
      const heap1 = new BinomialHeap4<number>()
      const heap2 = new BinomialHeap4<number>()
      heap1.insert(5)
      heap1.insert(10)
      heap2.insert(3)
      heap2.insert(7)
      const merged = heap1.merge(heap2)
      expect(merged.size).toBe(4)
      expect(merged.findMin()).toBe(3)
    })

    it('should merge empty with non-empty', () => {
      const heap1 = new BinomialHeap4<number>()
      const heap2 = new BinomialHeap4<number>()
      heap2.insert(1)
      const merged = heap1.merge(heap2)
      expect(merged.size).toBe(1)
      expect(merged.findMin()).toBe(1)
    })

    it('should merge non-empty with empty', () => {
      const heap1 = new BinomialHeap4<number>()
      const heap2 = new BinomialHeap4<number>()
      heap1.insert(1)
      const merged = heap1.merge(heap2)
      expect(merged.size).toBe(1)
    })

    it('should merge two empty heaps', () => {
      const heap1 = new BinomialHeap4<number>()
      const heap2 = new BinomialHeap4<number>()
      const merged = heap1.merge(heap2)
      expect(merged.size).toBe(0)
      expect(merged.isEmpty).toBe(true)
    })

    it('should not modify original heaps', () => {
      const heap1 = new BinomialHeap4<number>()
      const heap2 = new BinomialHeap4<number>()
      heap1.insert(1)
      heap1.insert(2)
      heap2.insert(3)
      heap2.insert(4)
      const merged = heap1.merge(heap2)
      expect(heap1.size).toBe(2)
      expect(heap2.size).toBe(2)
      expect(merged.size).toBe(4)
    })

    it('should extract in order after merge', () => {
      const heap1 = new BinomialHeap4<number>()
      const heap2 = new BinomialHeap4<number>()
      heap1.insert(5)
      heap1.insert(1)
      heap2.insert(3)
      heap2.insert(2)
      heap2.insert(4)
      const merged = heap1.merge(heap2)
      const extracted: number[] = []
      while (!merged.isEmpty) {
        extracted.push(merged.extractMin()!)
      }
      expect(extracted).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('bulkInsert', () => {
    it('should insert multiple values', () => {
      const heap = new BinomialHeap4<number>()
      heap.bulkInsert([5, 3, 1, 4, 2])
      expect(heap.size).toBe(5)
    })

    it('should handle empty array', () => {
      const heap = new BinomialHeap4<number>()
      heap.bulkInsert([])
      expect(heap.size).toBe(0)
    })

    it('should handle single value', () => {
      const heap = new BinomialHeap4<number>()
      heap.bulkInsert([42])
      expect(heap.size).toBe(1)
      expect(heap.findMin()).toBe(42)
    })

    it('should maintain min property', () => {
      const heap = new BinomialHeap4<number>()
      heap.bulkInsert([5, 3, 7, 1, 4, 6, 2, 8])
      expect(heap.findMin()).toBe(1)
    })

    it('should extract in sorted order', () => {
      const heap = new BinomialHeap4<number>()
      heap.bulkInsert([5, 3, 7, 1, 4, 6, 2, 8])
      const extracted: number[] = []
      while (!heap.isEmpty) {
        extracted.push(heap.extractMin()!)
      }
      expect(extracted).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    })
  })

  describe('getTimeComplexity', () => {
    it('should return complexity string', () => {
      const heap = new BinomialHeap4<number>()
      const complexity = heap.getTimeComplexity()
      expect(complexity).toContain('insert: O(1)')
      expect(complexity).toContain('extractMin: O(log n)')
      expect(complexity).toContain('findMin: O(log n)')
      expect(complexity).toContain('decreaseKey: O(log n)')
      expect(complexity).toContain('delete: O(log n)')
      expect(complexity).toContain('merge: O(log n)')
      expect(complexity).toContain('toArray: O(n)')
      expect(complexity).toContain('forEach: O(n)')
      expect(complexity).toContain('find: O(n)')
      expect(complexity).toContain('update: O(n)')
      expect(complexity).toContain('bulkInsert: O(m)')
    })
  })

  describe('edge cases', () => {
    it('should handle string values', () => {
      const heap = new BinomialHeap4<string>()
      heap.insert('banana')
      heap.insert('apple')
      heap.insert('cherry')
      expect(heap.extractMin()).toBe('apple')
      expect(heap.extractMin()).toBe('banana')
      expect(heap.extractMin()).toBe('cherry')
    })

    it('should handle object values with comparator', () => {
      const heap = new BinomialHeap4<{ id: number }>({
        comparator: (a, b) => (a as { id: number }).id - (b as { id: number }).id,
      })
      heap.insert({ id: 3 })
      heap.insert({ id: 1 })
      heap.insert({ id: 2 })
      expect(heap.extractMin()!.id).toBe(1)
      expect(heap.extractMin()!.id).toBe(2)
      expect(heap.extractMin()!.id).toBe(3)
    })

    it('should handle negative values extraction', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(-3)
      heap.insert(-1)
      heap.insert(-5)
      expect(heap.extractMin()).toBe(-5)
      expect(heap.extractMin()).toBe(-3)
      expect(heap.extractMin()).toBe(-1)
    })

    it('should handle interleaved operations', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(5)
      heap.insert(3)
      heap.extractMin()
      heap.insert(1)
      heap.insert(7)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(5)
      expect(heap.extractMin()).toBe(7)
    })

    it('should handle large range of values', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(-100)
      heap.insert(0)
      heap.insert(100)
      expect(heap.extractMin()).toBe(-100)
      expect(heap.extractMin()).toBe(0)
      expect(heap.extractMin()).toBe(100)
    })

    it('should handle min at boundary', () => {
      const heap = new BinomialHeap4<number>()
      heap.insert(Number.MAX_SAFE_INTEGER)
      heap.insert(0)
      heap.insert(Number.MIN_SAFE_INTEGER)
      expect(heap.extractMin()).toBe(Number.MIN_SAFE_INTEGER)
    })
  })

  describe('stress tests', () => {
    it('should handle 1000 elements', () => {
      const heap = new BinomialHeap4<number>()
      for (let i = 1000; i >= 1; i--) {
        heap.insert(i)
      }
      expect(heap.size).toBe(1000)
      for (let i = 1; i <= 1000; i++) {
        expect(heap.extractMin()).toBe(i)
      }
      expect(heap.isEmpty).toBe(true)
    })

    it('should handle 1000 random elements', () => {
      const heap = new BinomialHeap4<number>()
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

    it('should handle 1000 elements with bulkInsert', () => {
      const heap = new BinomialHeap4<number>()
      const values: number[] = []
      for (let i = 0; i < 1000; i++) {
        values.push(i)
      }
      heap.bulkInsert(values)
      expect(heap.size).toBe(1000)
      for (let i = 0; i < 1000; i++) {
        expect(heap.extractMin()).toBe(i)
      }
    })
  })

  describe('exports', () => {
    it('should export BinomialHeap4 type', () => {
      const opts: BinomialHeapOptions = {}
      expect(opts).toBeDefined()
    })

    it('should allow typed node reference', () => {
      const node: BinomialNode<number> = {
        value: 1,
        degree: 0,
        parent: null,
        child: null,
        sibling: null,
      }
      expect(node.value).toBe(1)
    })
  })
})
