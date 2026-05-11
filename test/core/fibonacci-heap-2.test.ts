import { describe, it, expect } from 'vitest'
import { FibonacciHeap } from '../../src/core/fibonacci-heap-2/index.js'
import type { FibonacciHeapNode } from '../../src/core/fibonacci-heap-2/types.js'

describe('FibonacciHeap', () => {
  describe('constructor', () => {
    it('creates an empty heap with default comparator', () => {
      const heap = new FibonacciHeap()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty).toBe(true)
    })

    it('creates a heap with custom comparator', () => {
      const heap = new FibonacciHeap<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      expect(heap.size).toBe(0)
    })

    it('creates a max-heap with reverse comparator', () => {
      const heap = new FibonacciHeap<number>({
        comparator: (a, b) => b - a,
      })
      heap.insert(1)
      heap.insert(5)
      heap.insert(3)
      expect(heap.peek()).toBe(5)
    })

    it('works without options argument', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(42)
      expect(heap.size).toBe(1)
    })
  })

  describe('insert', () => {
    it('inserts a single element', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(10)
      expect(heap.size).toBe(1)
      expect(heap.isEmpty).toBe(false)
    })

    it('inserts multiple elements', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(10)
      heap.insert(20)
      heap.insert(5)
      expect(heap.size).toBe(3)
    })

    it('updates min pointer when inserting smaller element', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(10)
      heap.insert(20)
      heap.insert(5)
      expect(heap.peek()).toBe(5)
    })

    it('returns a node with the inserted value', () => {
      const heap = new FibonacciHeap<number>()
      const node = heap.insert(42)
      expect(node.value).toBe(42)
    })

    it('inserts duplicate values', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      heap.insert(5)
      heap.insert(5)
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(5)
    })

    it('inserts negative numbers', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(-5)
      heap.insert(-10)
      heap.insert(-1)
      expect(heap.peek()).toBe(-10)
    })

    it('inserts zero', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(0)
      expect(heap.peek()).toBe(0)
    })

    it('handles many insertions', () => {
      const heap = new FibonacciHeap<number>()
      for (let i = 100; i >= 0; i--) {
        heap.insert(i)
      }
      expect(heap.size).toBe(101)
      expect(heap.peek()).toBe(0)
    })

    it('insert returns node with correct degree', () => {
      const heap = new FibonacciHeap<number>()
      const node = heap.insert(10)
      expect(node.degree).toBe(0)
    })

    it('insert returns node with no parent', () => {
      const heap = new FibonacciHeap<number>()
      const node = heap.insert(10)
      expect(node.parent).toBeNull()
    })
  })

  describe('peek', () => {
    it('returns the minimum element without removing it', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(10)
      heap.insert(5)
      heap.insert(20)
      expect(heap.peek()).toBe(5)
      expect(heap.size).toBe(3)
    })

    it('throws on empty heap', () => {
      const heap = new FibonacciHeap<number>()
      expect(() => heap.peek()).toThrow('Heap is empty')
    })

    it('returns same value on repeated calls', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(42)
      expect(heap.peek()).toBe(42)
      expect(heap.peek()).toBe(42)
      expect(heap.peek()).toBe(42)
    })

    it('returns min after many insertions', () => {
      const heap = new FibonacciHeap<number>()
      for (let i = 50; i >= 1; i--) {
        heap.insert(i)
      }
      expect(heap.peek()).toBe(1)
    })
  })

  describe('extractMin', () => {
    it('extracts the minimum element', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(10)
      heap.insert(5)
      heap.insert(20)
      expect(heap.extractMin()).toBe(5)
      expect(heap.size).toBe(2)
    })

    it('throws on empty heap', () => {
      const heap = new FibonacciHeap<number>()
      expect(() => heap.extractMin()).toThrow('Heap is empty')
    })

    it('extracts all elements in sorted order', () => {
      const heap = new FibonacciHeap<number>()
      const values = [5, 3, 7, 1, 9, 2, 8, 4, 6]
      for (const v of values) {
        heap.insert(v)
      }
      const result: number[] = []
      while (!heap.isEmpty) {
        result.push(heap.extractMin())
      }
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('handles single element extraction', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(42)
      expect(heap.extractMin()).toBe(42)
      expect(heap.isEmpty).toBe(true)
    })

    it('handles two element extraction', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(10)
      heap.insert(5)
      expect(heap.extractMin()).toBe(5)
      expect(heap.extractMin()).toBe(10)
    })

    it('handles duplicate values extraction', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      heap.insert(5)
      expect(heap.extractMin()).toBe(5)
      expect(heap.extractMin()).toBe(5)
      expect(heap.isEmpty).toBe(true)
    })

    it('handles large number of extractions', () => {
      const heap = new FibonacciHeap<number>()
      const n = 200
      for (let i = n; i >= 1; i--) {
        heap.insert(i)
      }
      for (let i = 1; i <= n; i++) {
        expect(heap.extractMin()).toBe(i)
      }
      expect(heap.isEmpty).toBe(true)
    })

    it('correctly updates min after consolidation', () => {
      const heap = new FibonacciHeap<number>()
      for (let i = 7; i >= 1; i--) {
        heap.insert(i)
      }
      expect(heap.extractMin()).toBe(1)
      expect(heap.peek()).toBe(2)
    })

    it('extracts negative numbers correctly', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(-3)
      heap.insert(-1)
      heap.insert(-10)
      expect(heap.extractMin()).toBe(-10)
      expect(heap.extractMin()).toBe(-3)
      expect(heap.extractMin()).toBe(-1)
    })
  })

  describe('decreaseKey', () => {
    it('decreases key of a node', () => {
      const heap = new FibonacciHeap<number>()
      const node = heap.insert(10)
      heap.insert(20)
      heap.decreaseKey(node, 5)
      expect(heap.peek()).toBe(5)
    })

    it('throws if new value is greater', () => {
      const heap = new FibonacciHeap<number>()
      const node = heap.insert(5)
      expect(() => heap.decreaseKey(node, 10)).toThrow(
        'New value is greater than current value'
      )
    })

    it('throws on empty heap', () => {
      const heap = new FibonacciHeap<number>()
      const node: FibonacciHeapNode<number> = {
        value: 5,
        degree: 0,
        parent: null,
        child: null,
        left: null!,
        right: null!,
        mark: false,
      }
      expect(() => heap.decreaseKey(node, 1)).toThrow('Heap is empty')
    })

    it('returns the updated node', () => {
      const heap = new FibonacciHeap<number>()
      const node = heap.insert(10)
      const result = heap.decreaseKey(node, 3)
      expect(result.value).toBe(3)
      expect(result).toBe(node)
    })

    it('updates min pointer when decreased below current min', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      const node = heap.insert(10)
      heap.decreaseKey(node, 1)
      expect(heap.peek()).toBe(1)
    })

    it('handles decreaseKey on root node', () => {
      const heap = new FibonacciHeap<number>()
      const node = heap.insert(10)
      heap.decreaseKey(node, 1)
      expect(node.value).toBe(1)
      expect(heap.peek()).toBe(1)
    })

    it('triggers cut and cascading cut', () => {
      const heap = new FibonacciHeap<number>()
      const nodes: FibonacciHeapNode<number>[] = []
      for (let i = 10; i >= 1; i--) {
        nodes.push(heap.insert(i))
      }
      heap.extractMin()
      const lastNode = nodes[nodes.length - 1]!
      heap.decreaseKey(lastNode, 0)
      expect(heap.peek()).toBe(0)
    })

    it('decreaseKey to same value is allowed', () => {
      const heap = new FibonacciHeap<number>()
      const node = heap.insert(5)
      heap.decreaseKey(node, 5)
      expect(node.value).toBe(5)
    })
  })

  describe('delete', () => {
    it('deletes a specific node', () => {
      const heap = new FibonacciHeap<number>()
      const node5 = heap.insert(5)
      heap.insert(10)
      heap.insert(15)
      heap.delete(node5)
      expect(heap.size).toBe(2)
      expect(heap.peek()).toBe(10)
    })

    it('deletes root node', () => {
      const heap = new FibonacciHeap<number>()
      const node1 = heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.delete(node1)
      expect(heap.size).toBe(2)
      expect(heap.peek()).toBe(2)
    })

    it('deletes the only node', () => {
      const heap = new FibonacciHeap<number>()
      const node = heap.insert(42)
      heap.delete(node)
      expect(heap.isEmpty).toBe(true)
    })

    it('deletes non-min node', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(1)
      const node10 = heap.insert(10)
      heap.insert(3)
      heap.delete(node10)
      expect(heap.size).toBe(2)
      expect(heap.peek()).toBe(1)
    })

    it('deletes after consolidation', () => {
      const heap = new FibonacciHeap<number>()
      const nodes: FibonacciHeapNode<number>[] = []
      for (let i = 1; i <= 10; i++) {
        nodes.push(heap.insert(i))
      }
      heap.extractMin()
      heap.delete(nodes[5]!)
      expect(heap.size).toBe(8)
    })
  })

  describe('merge', () => {
    it('merges two heaps', () => {
      const heap1 = new FibonacciHeap<number>()
      const heap2 = new FibonacciHeap<number>()
      heap1.insert(5)
      heap2.insert(3)
      heap1.merge(heap2)
      expect(heap1.size).toBe(2)
      expect(heap1.peek()).toBe(3)
    })

    it('clears the other heap after merge', () => {
      const heap1 = new FibonacciHeap<number>()
      const heap2 = new FibonacciHeap<number>()
      heap1.insert(5)
      heap2.insert(3)
      heap1.merge(heap2)
      expect(heap2.size).toBe(0)
      expect(heap2.isEmpty).toBe(true)
    })

    it('merges into empty heap', () => {
      const heap1 = new FibonacciHeap<number>()
      const heap2 = new FibonacciHeap<number>()
      heap2.insert(3)
      heap1.merge(heap2)
      expect(heap1.size).toBe(1)
      expect(heap1.peek()).toBe(3)
    })

    it('merges empty heap into non-empty', () => {
      const heap1 = new FibonacciHeap<number>()
      const heap2 = new FibonacciHeap<number>()
      heap1.insert(5)
      heap1.merge(heap2)
      expect(heap1.size).toBe(1)
      expect(heap1.peek()).toBe(5)
    })

    it('merges two empty heaps', () => {
      const heap1 = new FibonacciHeap<number>()
      const heap2 = new FibonacciHeap<number>()
      heap1.merge(heap2)
      expect(heap1.isEmpty).toBe(true)
    })

    it('handles merging with itself (no-op)', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      heap.merge(heap)
      expect(heap.size).toBe(1)
    })

    it('merges heaps with many elements', () => {
      const heap1 = new FibonacciHeap<number>()
      const heap2 = new FibonacciHeap<number>()
      for (let i = 0; i < 50; i++) {
        heap1.insert(i * 2)
        heap2.insert(i * 2 + 1)
      }
      heap1.merge(heap2)
      expect(heap1.size).toBe(100)
      expect(heap1.peek()).toBe(0)
    })

    it('maintains sorted order after merge and extractMin', () => {
      const heap1 = new FibonacciHeap<number>()
      const heap2 = new FibonacciHeap<number>()
      heap1.insert(5)
      heap1.insert(1)
      heap2.insert(3)
      heap2.insert(2)
      heap1.merge(heap2)
      expect(heap1.extractMin()).toBe(1)
      expect(heap1.extractMin()).toBe(2)
      expect(heap1.extractMin()).toBe(3)
      expect(heap1.extractMin()).toBe(5)
    })
  })

  describe('static merge', () => {
    it('creates a new merged heap without modifying originals', () => {
      const heap1 = new FibonacciHeap<number>()
      const heap2 = new FibonacciHeap<number>()
      heap1.insert(5)
      heap2.insert(3)
      const merged = FibonacciHeap.merge(heap1, heap2)
      expect(merged.size).toBe(2)
      expect(merged.peek()).toBe(3)
      expect(heap1.size).toBe(1)
      expect(heap2.size).toBe(1)
    })

    it('handles two empty heaps', () => {
      const heap1 = new FibonacciHeap<number>()
      const heap2 = new FibonacciHeap<number>()
      const merged = FibonacciHeap.merge(heap1, heap2)
      expect(merged.isEmpty).toBe(true)
    })
  })

  describe('size and isEmpty', () => {
    it('size returns 0 for empty heap', () => {
      const heap = new FibonacciHeap<number>()
      expect(heap.size).toBe(0)
    })

    it('isEmpty returns true for empty heap', () => {
      const heap = new FibonacciHeap<number>()
      expect(heap.isEmpty).toBe(true)
    })

    it('size increments on insert', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(1)
      expect(heap.size).toBe(1)
      heap.insert(2)
      expect(heap.size).toBe(2)
    })

    it('size decrements on extractMin', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.extractMin()
      expect(heap.size).toBe(1)
    })
  })

  describe('clear', () => {
    it('clears all elements', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.clear()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty).toBe(true)
    })

    it('clear on empty heap is a no-op', () => {
      const heap = new FibonacciHeap<number>()
      heap.clear()
      expect(heap.isEmpty).toBe(true)
    })

    it('allows insertions after clear', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(1)
      heap.clear()
      heap.insert(2)
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(2)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty heap', () => {
      const heap = new FibonacciHeap<number>()
      expect(heap.toArray()).toEqual([])
    })

    it('returns array with single element', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      expect(heap.toArray()).toEqual([5])
    })

    it('returns all elements', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      const arr = heap.toArray()
      expect(arr.length).toBe(3)
      expect(arr.sort((a, b) => a - b)).toEqual([1, 2, 3])
    })

    it('does not modify the heap', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.toArray()
      expect(heap.size).toBe(2)
    })
  })

  describe('toSortedArray', () => {
    it('returns sorted array', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      heap.insert(1)
      heap.insert(3)
      heap.insert(2)
      heap.insert(4)
      expect(heap.toSortedArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('returns empty array for empty heap', () => {
      const heap = new FibonacciHeap<number>()
      expect(heap.toSortedArray()).toEqual([])
    })

    it('returns single element array', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(42)
      expect(heap.toSortedArray()).toEqual([42])
    })

    it('does not modify original heap', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      const sorted = heap.toSortedArray()
      expect(sorted).toEqual([1, 2, 3])
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(1)
    })
  })

  describe('contains', () => {
    it('returns true for existing value', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      expect(heap.contains(5)).toBe(true)
    })

    it('returns false for non-existing value', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      expect(heap.contains(10)).toBe(false)
    })

    it('returns false for empty heap', () => {
      const heap = new FibonacciHeap<number>()
      expect(heap.contains(5)).toBe(false)
    })

    it('finds values after extraction', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(10)
      heap.extractMin()
      expect(heap.contains(5)).toBe(true)
      expect(heap.contains(10)).toBe(true)
      expect(heap.contains(3)).toBe(false)
    })
  })

  describe('clone', () => {
    it('clones an empty heap', () => {
      const heap = new FibonacciHeap<number>()
      const cloned = heap.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty).toBe(true)
    })

    it('clones a heap with elements', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      const cloned = heap.clone()
      expect(cloned.size).toBe(3)
      expect(cloned.toSortedArray()).toEqual([1, 2, 3])
    })

    it('modifying clone does not affect original', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(1)
      heap.insert(2)
      const cloned = heap.clone()
      cloned.extractMin()
      expect(heap.size).toBe(2)
      expect(cloned.size).toBe(1)
    })
  })

  describe('fromArray', () => {
    it('creates heap from array', () => {
      const heap = FibonacciHeap.fromArray([3, 1, 2])
      expect(heap.size).toBe(3)
      expect(heap.toSortedArray()).toEqual([1, 2, 3])
    })

    it('creates heap from empty array', () => {
      const heap = FibonacciHeap.fromArray([])
      expect(heap.isEmpty).toBe(true)
    })

    it('creates heap with custom comparator', () => {
      const heap = FibonacciHeap.fromArray([1, 2, 3], {
        comparator: (a, b) => b - a,
      })
      expect(heap.peek()).toBe(3)
    })

    it('creates heap from single element array', () => {
      const heap = FibonacciHeap.fromArray([42])
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(42)
    })
  })

  describe('forEach', () => {
    it('iterates over all elements', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      const result: number[] = []
      heap.forEach((v) => result.push(v))
      expect(result.sort((a, b) => a - b)).toEqual([1, 2, 3])
    })

    it('does nothing on empty heap', () => {
      const heap = new FibonacciHeap<number>()
      let count = 0
      heap.forEach(() => count++)
      expect(count).toBe(0)
    })
  })

  describe('iterator', () => {
    it('iterates over all elements', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      const result = [...heap]
      expect(result.sort((a, b) => a - b)).toEqual([1, 2, 3])
    })

    it('iterates over empty heap', () => {
      const heap = new FibonacciHeap<number>()
      const result = [...heap]
      expect(result).toEqual([])
    })
  })

  describe('generics', () => {
    it('works with strings', () => {
      const heap = new FibonacciHeap<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      heap.insert('banana')
      heap.insert('apple')
      heap.insert('cherry')
      expect(heap.peek()).toBe('apple')
      expect(heap.toSortedArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('works with objects via custom comparator', () => {
      interface Item {
        priority: number
        name: string
      }
      const heap = new FibonacciHeap<Item>({
        comparator: (a, b) => a.priority - b.priority,
      })
      heap.insert({ priority: 3, name: 'low' })
      heap.insert({ priority: 1, name: 'high' })
      heap.insert({ priority: 2, name: 'medium' })
      expect(heap.peek().name).toBe('high')
    })

    it('works with dates', () => {
      const heap = new FibonacciHeap<Date>({
        comparator: (a, b) => a.getTime() - b.getTime(),
      })
      const d1 = new Date(2024, 0, 1)
      const d2 = new Date(2024, 5, 15)
      const d3 = new Date(2024, 2, 10)
      heap.insert(d1)
      heap.insert(d2)
      heap.insert(d3)
      expect(heap.extractMin()).toBe(d1)
      expect(heap.extractMin()).toBe(d3)
      expect(heap.extractMin()).toBe(d2)
    })
  })

  describe('consolidation', () => {
    it('handles consolidation with many elements', () => {
      const heap = new FibonacciHeap<number>()
      for (let i = 0; i < 100; i++) {
        heap.insert(i)
      }
      expect(heap.extractMin()).toBe(0)
      expect(heap.size).toBe(99)
    })

    it('handles sequential insert then extract', () => {
      const heap = new FibonacciHeap<number>()
      for (let i = 0; i < 20; i++) {
        heap.insert(i)
      }
      for (let i = 0; i < 20; i++) {
        expect(heap.extractMin()).toBe(i)
      }
    })

    it('handles interleaved insert and extract', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      heap.insert(3)
      expect(heap.extractMin()).toBe(3)
      heap.insert(1)
      heap.insert(7)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(5)
      expect(heap.extractMin()).toBe(7)
    })
  })

  describe('decreaseKey with cascading cuts', () => {
    it('handles multiple cascading cuts', () => {
      const heap = new FibonacciHeap<number>()
      const nodes: FibonacciHeapNode<number>[] = []
      for (let i = 1; i <= 8; i++) {
        nodes.push(heap.insert(i * 10))
      }
      heap.extractMin()
      heap.decreaseKey(nodes[7]!, 1)
      expect(heap.peek()).toBe(1)
      expect(heap.toSortedArray()[0]).toBe(1)
    })

    it('cascading cut propagates to root', () => {
      const heap = new FibonacciHeap<number>()
      const nodes: FibonacciHeapNode<number>[] = []
      for (let i = 1; i <= 16; i++) {
        nodes.push(heap.insert(i))
      }
      heap.extractMin()
      const lastNode = nodes[nodes.length - 1]!
      heap.decreaseKey(lastNode, 0)
      expect(heap.peek()).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('handles alternating insert and extractMin', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      expect(heap.extractMin()).toBe(5)
      heap.insert(3)
      expect(heap.extractMin()).toBe(3)
      expect(heap.isEmpty).toBe(true)
    })

    it('handles insert after clearing all', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.extractMin()
      heap.extractMin()
      heap.insert(3)
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(3)
    })

    it('handles large dataset', () => {
      const heap = new FibonacciHeap<number>()
      const n = 500
      for (let i = n; i >= 1; i--) {
        heap.insert(i)
      }
      for (let i = 1; i <= n; i++) {
        expect(heap.extractMin()).toBe(i)
      }
    })

    it('handles reverse sorted input', () => {
      const heap = new FibonacciHeap<number>()
      for (let i = 100; i >= 1; i--) {
        heap.insert(i)
      }
      expect(heap.toSortedArray()).toEqual(
        Array.from({ length: 100 }, (_, i) => i + 1)
      )
    })

    it('handles already sorted input', () => {
      const heap = new FibonacciHeap<number>()
      for (let i = 1; i <= 50; i++) {
        heap.insert(i)
      }
      expect(heap.toSortedArray()).toEqual(
        Array.from({ length: 50 }, (_, i) => i + 1)
      )
    })

    it('handles all same values', () => {
      const heap = new FibonacciHeap<number>()
      for (let i = 0; i < 10; i++) {
        heap.insert(42)
      }
      expect(heap.size).toBe(10)
      for (let i = 0; i < 10; i++) {
        expect(heap.extractMin()).toBe(42)
      }
    })
  })

  describe('type exports', () => {
    it('exports FibonacciHeapNode type', () => {
      const heap = new FibonacciHeap<number>()
      const node: FibonacciHeapNode<number> = heap.insert(5)
      expect(node.value).toBe(5)
      expect(node.degree).toBe(0)
      expect(node.parent).toBeNull()
      expect(node.mark).toBe(false)
    })

    it('exports FibonacciHeapOptions type', () => {
      const heap = new FibonacciHeap<number>({
        comparator: (a, b) => a - b,
      })
      expect(heap).toBeDefined()
    })
  })

  describe('max-heap behavior', () => {
    it('extracts max when using reverse comparator', () => {
      const heap = new FibonacciHeap<number>({
        comparator: (a, b) => b - a,
      })
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

    it('decreaseKey works in max-heap (increase value)', () => {
      const heap = new FibonacciHeap<number>({
        comparator: (a, b) => b - a,
      })
      const node = heap.insert(3)
      heap.insert(5)
      heap.decreaseKey(node, 10)
      expect(heap.peek()).toBe(10)
    })
  })

  describe('merge then operations', () => {
    it('merge then extractMin', () => {
      const heap1 = new FibonacciHeap<number>()
      const heap2 = new FibonacciHeap<number>()
      heap1.insert(5)
      heap1.insert(10)
      heap2.insert(3)
      heap2.insert(7)
      heap1.merge(heap2)
      expect(heap1.extractMin()).toBe(3)
      expect(heap1.extractMin()).toBe(5)
      expect(heap1.extractMin()).toBe(7)
      expect(heap1.extractMin()).toBe(10)
    })

    it('merge then decreaseKey', () => {
      const heap1 = new FibonacciHeap<number>()
      const heap2 = new FibonacciHeap<number>()
      const node = heap1.insert(10)
      heap2.insert(5)
      heap1.merge(heap2)
      heap1.decreaseKey(node, 1)
      expect(heap1.peek()).toBe(1)
    })

    it('merge then delete', () => {
      const heap1 = new FibonacciHeap<number>()
      const heap2 = new FibonacciHeap<number>()
      const node5 = heap1.insert(5)
      heap2.insert(3)
      heap1.merge(heap2)
      heap1.delete(node5)
      expect(heap1.peek()).toBe(3)
    })
  })

  describe('complex scenarios', () => {
    it('Dijkstra-like usage pattern', () => {
      const heap = new FibonacciHeap<{ node: number; dist: number }>({
        comparator: (a, b) => a.dist - b.dist,
      })
      const nodeA = heap.insert({ node: 0, dist: 10 })
      const nodeB = heap.insert({ node: 1, dist: 20 })
      const nodeC = heap.insert({ node: 2, dist: 15 })
      heap.decreaseKey(nodeB, { node: 1, dist: 5 })
      heap.decreaseKey(nodeC, { node: 2, dist: 8 })
      expect(heap.extractMin().node).toBe(1)
      expect(heap.extractMin().node).toBe(2)
      expect(heap.extractMin().node).toBe(0)
    })

    it('multiple merges and operations', () => {
      const h1 = new FibonacciHeap<number>()
      const h2 = new FibonacciHeap<number>()
      const h3 = new FibonacciHeap<number>()
      h1.insert(10)
      h2.insert(5)
      h3.insert(3)
      h1.merge(h2)
      h1.merge(h3)
      expect(h1.extractMin()).toBe(3)
      expect(h1.extractMin()).toBe(5)
      expect(h1.extractMin()).toBe(10)
    })

    it('insert extract insert pattern', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5)
      heap.insert(3)
      expect(heap.extractMin()).toBe(3)
      heap.insert(1)
      heap.insert(4)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(4)
      expect(heap.extractMin()).toBe(5)
    })
  })
})
