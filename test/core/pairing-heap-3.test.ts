import { describe, it, expect } from 'vitest'
import { PairingHeap3 } from '../../src/core/pairing-heap-3/index.js'
import type { PairingHeap3Node } from '../../src/core/pairing-heap-3/types.js'

describe('PairingHeap3', () => {
  describe('constructor', () => {
    it('creates an empty heap with default comparator', () => {
      const heap = new PairingHeap3()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty).toBe(true)
    })

    it('creates a heap with custom comparator', () => {
      const heap = new PairingHeap3<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      expect(heap.size).toBe(0)
    })

    it('creates a max-heap with reverse comparator', () => {
      const heap = new PairingHeap3<number>({
        comparator: (a, b) => b - a,
      })
      heap.insert(1)
      heap.insert(5)
      heap.insert(3)
      expect(heap.peek()).toBe(5)
    })

    it('works without options argument', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(42)
      expect(heap.size).toBe(1)
    })
  })

  describe('insert', () => {
    it('inserts a single element', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(10)
      expect(heap.size).toBe(1)
      expect(heap.isEmpty).toBe(false)
    })

    it('inserts multiple elements', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(10)
      heap.insert(20)
      heap.insert(5)
      expect(heap.size).toBe(3)
    })

    it('updates min pointer when inserting smaller element', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(10)
      heap.insert(20)
      heap.insert(5)
      expect(heap.peek()).toBe(5)
    })

    it('returns a node with the inserted value', () => {
      const heap = new PairingHeap3<number>()
      const node = heap.insert(42)
      expect(node.value).toBe(42)
    })

    it('inserts duplicate values', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(5)
      heap.insert(5)
      heap.insert(5)
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(5)
    })

    it('inserts negative numbers', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(-5)
      heap.insert(-10)
      heap.insert(-1)
      expect(heap.peek()).toBe(-10)
    })

    it('inserts zero', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(0)
      expect(heap.peek()).toBe(0)
    })

    it('handles many insertions', () => {
      const heap = new PairingHeap3<number>()
      for (let i = 100; i >= 0; i--) {
        heap.insert(i)
      }
      expect(heap.size).toBe(101)
      expect(heap.peek()).toBe(0)
    })

    it('insert returns node with null child', () => {
      const heap = new PairingHeap3<number>()
      const node = heap.insert(10)
      expect(node.child).toBeNull()
    })

    it('insert returns node with null sibling', () => {
      const heap = new PairingHeap3<number>()
      const node = heap.insert(10)
      expect(node.sibling).toBeNull()
    })

    it('inserts in ascending order', () => {
      const heap = new PairingHeap3<number>()
      for (let i = 1; i <= 50; i++) {
        heap.insert(i)
      }
      expect(heap.peek()).toBe(1)
      expect(heap.size).toBe(50)
    })
  })

  describe('peek', () => {
    it('returns the minimum element without removing it', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(10)
      heap.insert(5)
      heap.insert(20)
      expect(heap.peek()).toBe(5)
      expect(heap.size).toBe(3)
    })

    it('throws on empty heap', () => {
      const heap = new PairingHeap3<number>()
      expect(() => heap.peek()).toThrow('Heap is empty')
    })

    it('returns same value on repeated calls', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(42)
      expect(heap.peek()).toBe(42)
      expect(heap.peek()).toBe(42)
      expect(heap.peek()).toBe(42)
    })

    it('returns min after many insertions', () => {
      const heap = new PairingHeap3<number>()
      for (let i = 50; i >= 1; i--) {
        heap.insert(i)
      }
      expect(heap.peek()).toBe(1)
    })
  })

  describe('extractMin', () => {
    it('extracts the minimum element', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(10)
      heap.insert(5)
      heap.insert(20)
      expect(heap.extractMin()).toBe(5)
      expect(heap.size).toBe(2)
    })

    it('throws on empty heap', () => {
      const heap = new PairingHeap3<number>()
      expect(() => heap.extractMin()).toThrow('Heap is empty')
    })

    it('extracts all elements in sorted order', () => {
      const heap = new PairingHeap3<number>()
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
      const heap = new PairingHeap3<number>()
      heap.insert(42)
      expect(heap.extractMin()).toBe(42)
      expect(heap.isEmpty).toBe(true)
    })

    it('handles two element extraction', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(10)
      heap.insert(5)
      expect(heap.extractMin()).toBe(5)
      expect(heap.extractMin()).toBe(10)
    })

    it('handles duplicate values extraction', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(5)
      heap.insert(5)
      expect(heap.extractMin()).toBe(5)
      expect(heap.extractMin()).toBe(5)
      expect(heap.isEmpty).toBe(true)
    })

    it('handles large number of extractions', () => {
      const heap = new PairingHeap3<number>()
      const n = 200
      for (let i = n; i >= 1; i--) {
        heap.insert(i)
      }
      for (let i = 1; i <= n; i++) {
        expect(heap.extractMin()).toBe(i)
      }
      expect(heap.isEmpty).toBe(true)
    })

    it('correctly updates min after extraction', () => {
      const heap = new PairingHeap3<number>()
      for (let i = 7; i >= 1; i--) {
        heap.insert(i)
      }
      expect(heap.extractMin()).toBe(1)
      expect(heap.peek()).toBe(2)
    })

    it('extracts negative numbers correctly', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(-3)
      heap.insert(-1)
      heap.insert(-10)
      expect(heap.extractMin()).toBe(-10)
      expect(heap.extractMin()).toBe(-3)
      expect(heap.extractMin()).toBe(-1)
    })

    it('handles extractMin on heap with many children', () => {
      const heap = new PairingHeap3<number>()
      for (let i = 0; i < 50; i++) {
        heap.insert(i)
      }
      expect(heap.extractMin()).toBe(0)
      expect(heap.peek()).toBe(1)
      expect(heap.size).toBe(49)
    })
  })

  describe('decreaseKey', () => {
    it('decreases key of a node', () => {
      const heap = new PairingHeap3<number>()
      const node = heap.insert(10)
      heap.insert(20)
      heap.decreaseKey(node, 5)
      expect(heap.peek()).toBe(5)
    })

    it('throws if new value is greater', () => {
      const heap = new PairingHeap3<number>()
      const node = heap.insert(5)
      expect(() => heap.decreaseKey(node, 10)).toThrow(
        'New value is greater than current value'
      )
    })

    it('throws on empty heap', () => {
      const heap = new PairingHeap3<number>()
      const node: PairingHeap3Node<number> = {
        value: 5,
        child: null,
        sibling: null,
      }
      expect(() => heap.decreaseKey(node, 1)).toThrow('Heap is empty')
    })

    it('returns the updated node', () => {
      const heap = new PairingHeap3<number>()
      const node = heap.insert(10)
      const result = heap.decreaseKey(node, 3)
      expect(result.value).toBe(3)
      expect(result).toBe(node)
    })

    it('updates min pointer when decreased below current min', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(5)
      const node = heap.insert(10)
      heap.decreaseKey(node, 1)
      expect(heap.peek()).toBe(1)
    })

    it('handles decreaseKey on root node', () => {
      const heap = new PairingHeap3<number>()
      const node = heap.insert(10)
      heap.decreaseKey(node, 1)
      expect(node.value).toBe(1)
      expect(heap.peek()).toBe(1)
    })

    it('decreaseKey to same value is allowed', () => {
      const heap = new PairingHeap3<number>()
      const node = heap.insert(5)
      heap.decreaseKey(node, 5)
      expect(node.value).toBe(5)
    })

    it('decreaseKey on child node after extraction', () => {
      const heap = new PairingHeap3<number>()
      const nodes: PairingHeap3Node<number>[] = []
      for (let i = 10; i >= 1; i--) {
        nodes.push(heap.insert(i))
      }
      heap.extractMin()
      heap.decreaseKey(nodes[nodes.length - 1]!, 0)
      expect(heap.peek()).toBe(0)
    })

    it('decreaseKey maintains sorted order', () => {
      const heap = new PairingHeap3<number>()
      const n1 = heap.insert(10)
      heap.insert(5)
      heap.insert(15)
      heap.decreaseKey(n1, 1)
      expect(heap.toSortedArray()).toEqual([1, 5, 15])
    })
  })

  describe('delete', () => {
    it('deletes a specific node', () => {
      const heap = new PairingHeap3<number>()
      const node5 = heap.insert(5)
      heap.insert(10)
      heap.insert(15)
      heap.delete(node5)
      expect(heap.size).toBe(2)
      expect(heap.peek()).toBe(10)
    })

    it('deletes root node', () => {
      const heap = new PairingHeap3<number>()
      const node1 = heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.delete(node1)
      expect(heap.size).toBe(2)
      expect(heap.peek()).toBe(2)
    })

    it('deletes the only node', () => {
      const heap = new PairingHeap3<number>()
      const node = heap.insert(42)
      heap.delete(node)
      expect(heap.isEmpty).toBe(true)
    })

    it('deletes non-min node', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(1)
      const node10 = heap.insert(10)
      heap.insert(3)
      heap.delete(node10)
      expect(heap.size).toBe(2)
      expect(heap.peek()).toBe(1)
    })

    it('delete maintains heap order', () => {
      const heap = new PairingHeap3<number>()
      const n1 = heap.insert(1)
      const n2 = heap.insert(2)
      const n3 = heap.insert(3)
      const n4 = heap.insert(4)
      heap.delete(n2)
      expect(heap.size).toBe(3)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(3)
      expect(heap.extractMin()).toBe(4)
      void n1
      void n3
      void n4
    })

    it('deletes after extraction', () => {
      const heap = new PairingHeap3<number>()
      const nodes: PairingHeap3Node<number>[] = []
      for (let i = 1; i <= 10; i++) {
        nodes.push(heap.insert(i))
      }
      heap.extractMin()
      heap.delete(nodes[5]!)
      expect(heap.size).toBe(8)
    })

    it('delete throws on empty heap', () => {
      const heap = new PairingHeap3<number>()
      const node: PairingHeap3Node<number> = {
        value: 5,
        child: null,
        sibling: null,
      }
      expect(() => heap.delete(node)).toThrow('Heap is empty')
    })
  })

  describe('update', () => {
    it('updates a node to a smaller value via decreaseKey', () => {
      const heap = new PairingHeap3<number>()
      const node = heap.insert(10)
      heap.insert(20)
      const result = heap.update(node, 5)
      expect(result.value).toBe(5)
      expect(heap.peek()).toBe(5)
    })

    it('updates a node to a larger value via delete+insert', () => {
      const heap = new PairingHeap3<number>()
      const node = heap.insert(5)
      heap.insert(10)
      const result = heap.update(node, 20)
      expect(result.value).toBe(20)
      expect(heap.peek()).toBe(10)
    })

    it('update to same value returns same node', () => {
      const heap = new PairingHeap3<number>()
      const node = heap.insert(10)
      const result = heap.update(node, 10)
      expect(result).toBe(node)
    })

    it('update throws on empty heap', () => {
      const heap = new PairingHeap3<number>()
      const node: PairingHeap3Node<number> = {
        value: 5,
        child: null,
        sibling: null,
      }
      expect(() => heap.update(node, 1)).toThrow('Heap is empty')
    })

    it('update maintains correct size for decrease', () => {
      const heap = new PairingHeap3<number>()
      const node = heap.insert(10)
      heap.insert(5)
      heap.update(node, 3)
      expect(heap.size).toBe(2)
    })

    it('update maintains correct size for increase', () => {
      const heap = new PairingHeap3<number>()
      const node = heap.insert(5)
      heap.insert(10)
      heap.update(node, 20)
      expect(heap.size).toBe(2)
    })

    it('update correctly updates min pointer', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(10)
      const node = heap.insert(20)
      heap.update(node, 1)
      expect(heap.peek()).toBe(1)
    })

    it('update with max-heap comparator', () => {
      const heap = new PairingHeap3<number>({ comparator: (a, b) => b - a })
      const node = heap.insert(5)
      heap.insert(10)
      const result = heap.update(node, 20)
      expect(result.value).toBe(20)
      expect(heap.peek()).toBe(20)
    })
  })

  describe('merge', () => {
    it('merges two heaps', () => {
      const heap1 = new PairingHeap3<number>()
      const heap2 = new PairingHeap3<number>()
      heap1.insert(5)
      heap2.insert(3)
      heap1.merge(heap2)
      expect(heap1.size).toBe(2)
      expect(heap1.peek()).toBe(3)
    })

    it('clears the other heap after merge', () => {
      const heap1 = new PairingHeap3<number>()
      const heap2 = new PairingHeap3<number>()
      heap1.insert(5)
      heap2.insert(3)
      heap1.merge(heap2)
      expect(heap2.size).toBe(0)
      expect(heap2.isEmpty).toBe(true)
    })

    it('merges into empty heap', () => {
      const heap1 = new PairingHeap3<number>()
      const heap2 = new PairingHeap3<number>()
      heap2.insert(3)
      heap1.merge(heap2)
      expect(heap1.size).toBe(1)
      expect(heap1.peek()).toBe(3)
    })

    it('merges empty heap into non-empty', () => {
      const heap1 = new PairingHeap3<number>()
      const heap2 = new PairingHeap3<number>()
      heap1.insert(5)
      heap1.merge(heap2)
      expect(heap1.size).toBe(1)
      expect(heap1.peek()).toBe(5)
    })

    it('merges two empty heaps', () => {
      const heap1 = new PairingHeap3<number>()
      const heap2 = new PairingHeap3<number>()
      heap1.merge(heap2)
      expect(heap1.isEmpty).toBe(true)
    })

    it('handles merging with itself (no-op)', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(5)
      heap.merge(heap)
      expect(heap.size).toBe(1)
    })

    it('merges heaps with many elements', () => {
      const heap1 = new PairingHeap3<number>()
      const heap2 = new PairingHeap3<number>()
      for (let i = 0; i < 50; i++) {
        heap1.insert(i * 2)
        heap2.insert(i * 2 + 1)
      }
      heap1.merge(heap2)
      expect(heap1.size).toBe(100)
      expect(heap1.peek()).toBe(0)
    })

    it('maintains sorted order after merge and extractMin', () => {
      const heap1 = new PairingHeap3<number>()
      const heap2 = new PairingHeap3<number>()
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
      const heap1 = new PairingHeap3<number>()
      const heap2 = new PairingHeap3<number>()
      heap1.insert(5)
      heap2.insert(3)
      const merged = PairingHeap3.merge(heap1, heap2)
      expect(merged.size).toBe(2)
      expect(merged.peek()).toBe(3)
      expect(heap1.size).toBe(1)
      expect(heap2.size).toBe(1)
    })

    it('handles two empty heaps', () => {
      const heap1 = new PairingHeap3<number>()
      const heap2 = new PairingHeap3<number>()
      const merged = PairingHeap3.merge(heap1, heap2)
      expect(merged.isEmpty).toBe(true)
    })
  })

  describe('size and isEmpty', () => {
    it('size returns 0 for empty heap', () => {
      const heap = new PairingHeap3<number>()
      expect(heap.size).toBe(0)
    })

    it('isEmpty returns true for empty heap', () => {
      const heap = new PairingHeap3<number>()
      expect(heap.isEmpty).toBe(true)
    })

    it('size increments on insert', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(1)
      expect(heap.size).toBe(1)
      heap.insert(2)
      expect(heap.size).toBe(2)
    })

    it('size decrements on extractMin', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(1)
      heap.insert(2)
      heap.extractMin()
      expect(heap.size).toBe(1)
    })

    it('size decrements on delete', () => {
      const heap = new PairingHeap3<number>()
      const node = heap.insert(1)
      heap.insert(2)
      heap.delete(node)
      expect(heap.size).toBe(1)
    })
  })

  describe('clear', () => {
    it('clears all elements', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.clear()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty).toBe(true)
    })

    it('clear on empty heap is a no-op', () => {
      const heap = new PairingHeap3<number>()
      heap.clear()
      expect(heap.isEmpty).toBe(true)
    })

    it('allows insertions after clear', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(1)
      heap.clear()
      heap.insert(2)
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(2)
    })

    it('allows extractMin after clear and insert', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(1)
      heap.clear()
      heap.insert(5)
      heap.insert(3)
      expect(heap.extractMin()).toBe(3)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty heap', () => {
      const heap = new PairingHeap3<number>()
      expect(heap.toArray()).toEqual([])
    })

    it('returns array with single element', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(5)
      expect(heap.toArray()).toEqual([5])
    })

    it('returns all elements', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      const arr = heap.toArray()
      expect(arr.length).toBe(3)
      expect(arr.sort((a, b) => a - b)).toEqual([1, 2, 3])
    })

    it('does not modify the heap', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(1)
      heap.insert(2)
      heap.toArray()
      expect(heap.size).toBe(2)
    })
  })

  describe('toSortedArray', () => {
    it('returns sorted array', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(5)
      heap.insert(1)
      heap.insert(3)
      heap.insert(2)
      heap.insert(4)
      expect(heap.toSortedArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('returns empty array for empty heap', () => {
      const heap = new PairingHeap3<number>()
      expect(heap.toSortedArray()).toEqual([])
    })

    it('returns single element array', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(42)
      expect(heap.toSortedArray()).toEqual([42])
    })

    it('does not modify original heap', () => {
      const heap = new PairingHeap3<number>()
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
      const heap = new PairingHeap3<number>()
      heap.insert(5)
      expect(heap.contains(5)).toBe(true)
    })

    it('returns false for non-existing value', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(5)
      expect(heap.contains(10)).toBe(false)
    })

    it('returns false for empty heap', () => {
      const heap = new PairingHeap3<number>()
      expect(heap.contains(5)).toBe(false)
    })

    it('finds values after extraction', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(10)
      heap.extractMin()
      expect(heap.contains(5)).toBe(true)
      expect(heap.contains(10)).toBe(true)
      expect(heap.contains(3)).toBe(false)
    })

    it('finds values in deep trees', () => {
      const heap = new PairingHeap3<number>()
      for (let i = 1; i <= 16; i++) {
        heap.insert(i)
      }
      expect(heap.contains(1)).toBe(true)
      expect(heap.contains(16)).toBe(true)
      expect(heap.contains(8)).toBe(true)
      expect(heap.contains(100)).toBe(false)
    })
  })

  describe('clone', () => {
    it('clones an empty heap', () => {
      const heap = new PairingHeap3<number>()
      const cloned = heap.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty).toBe(true)
    })

    it('clones a heap with elements', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      const cloned = heap.clone()
      expect(cloned.size).toBe(3)
      expect(cloned.toSortedArray()).toEqual([1, 2, 3])
    })

    it('modifying clone does not affect original', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(1)
      heap.insert(2)
      const cloned = heap.clone()
      cloned.extractMin()
      expect(heap.size).toBe(2)
      expect(cloned.size).toBe(1)
    })

    it('clone preserves comparator', () => {
      const heap = new PairingHeap3<number>({ comparator: (a, b) => b - a })
      heap.insert(1)
      heap.insert(5)
      heap.insert(3)
      const cloned = heap.clone()
      expect(cloned.peek()).toBe(5)
    })
  })

  describe('fromArray', () => {
    it('creates heap from array', () => {
      const heap = PairingHeap3.fromArray([3, 1, 2])
      expect(heap.size).toBe(3)
      expect(heap.toSortedArray()).toEqual([1, 2, 3])
    })

    it('creates heap from empty array', () => {
      const heap = PairingHeap3.fromArray([])
      expect(heap.isEmpty).toBe(true)
    })

    it('creates heap with custom comparator', () => {
      const heap = PairingHeap3.fromArray([1, 2, 3], {
        comparator: (a, b) => b - a,
      })
      expect(heap.peek()).toBe(3)
    })

    it('creates heap from single element array', () => {
      const heap = PairingHeap3.fromArray([42])
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(42)
    })
  })

  describe('forEach', () => {
    it('iterates over all elements', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      const result: number[] = []
      heap.forEach((v) => result.push(v))
      expect(result.sort((a, b) => a - b)).toEqual([1, 2, 3])
    })

    it('does nothing on empty heap', () => {
      const heap = new PairingHeap3<number>()
      let count = 0
      heap.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('iterates all elements after merge', () => {
      const heap1 = new PairingHeap3<number>()
      const heap2 = new PairingHeap3<number>()
      heap1.insert(1)
      heap2.insert(2)
      heap1.merge(heap2)
      const result: number[] = []
      heap1.forEach((v) => result.push(v))
      expect(result.sort((a, b) => a - b)).toEqual([1, 2])
    })

    it('forEach visits correct number of elements', () => {
      const heap = new PairingHeap3<number>()
      for (let i = 0; i < 20; i++) {
        heap.insert(i)
      }
      let count = 0
      heap.forEach(() => count++)
      expect(count).toBe(20)
    })
  })

  describe('iterator', () => {
    it('iterates over all elements', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      const result = [...heap]
      expect(result.sort((a, b) => a - b)).toEqual([1, 2, 3])
    })

    it('iterates over empty heap', () => {
      const heap = new PairingHeap3<number>()
      const result = [...heap]
      expect(result).toEqual([])
    })

    it('iterator can be used with spread', () => {
      const heap = PairingHeap3.fromArray([5, 3, 1, 4, 2])
      const arr = [...heap]
      expect(arr.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('generics', () => {
    it('works with strings', () => {
      const heap = new PairingHeap3<string>({
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
      const heap = new PairingHeap3<Item>({
        comparator: (a, b) => a.priority - b.priority,
      })
      heap.insert({ priority: 3, name: 'low' })
      heap.insert({ priority: 1, name: 'high' })
      heap.insert({ priority: 2, name: 'medium' })
      expect(heap.peek().name).toBe('high')
    })

    it('works with dates', () => {
      const heap = new PairingHeap3<Date>({
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

    it('works with custom type and decreaseKey', () => {
      interface Task {
        id: number
        priority: number
      }
      const heap = new PairingHeap3<Task>({
        comparator: (a, b) => a.priority - b.priority,
      })
      const task1 = heap.insert({ id: 1, priority: 10 })
      heap.insert({ id: 2, priority: 5 })
      heap.decreaseKey(task1, { id: 1, priority: 1 })
      expect(heap.peek().id).toBe(1)
      expect(heap.peek().priority).toBe(1)
    })
  })

  describe('two-pass pairing', () => {
    it('handles extraction with many children', () => {
      const heap = new PairingHeap3<number>()
      for (let i = 0; i < 100; i++) {
        heap.insert(i)
      }
      expect(heap.extractMin()).toBe(0)
      expect(heap.size).toBe(99)
    })

    it('handles sequential insert then extract', () => {
      const heap = new PairingHeap3<number>()
      for (let i = 0; i < 20; i++) {
        heap.insert(i)
      }
      for (let i = 0; i < 20; i++) {
        expect(heap.extractMin()).toBe(i)
      }
    })

    it('handles interleaved insert and extract', () => {
      const heap = new PairingHeap3<number>()
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

  describe('edge cases', () => {
    it('handles alternating insert and extractMin', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(5)
      expect(heap.extractMin()).toBe(5)
      heap.insert(3)
      expect(heap.extractMin()).toBe(3)
      expect(heap.isEmpty).toBe(true)
    })

    it('handles insert after clearing all', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(1)
      heap.insert(2)
      heap.extractMin()
      heap.extractMin()
      heap.insert(3)
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(3)
    })

    it('handles large dataset', () => {
      const heap = new PairingHeap3<number>()
      const n = 500
      for (let i = n; i >= 1; i--) {
        heap.insert(i)
      }
      for (let i = 1; i <= n; i++) {
        expect(heap.extractMin()).toBe(i)
      }
    })

    it('handles reverse sorted input', () => {
      const heap = new PairingHeap3<number>()
      for (let i = 100; i >= 1; i--) {
        heap.insert(i)
      }
      expect(heap.toSortedArray()).toEqual(
        Array.from({ length: 100 }, (_, i) => i + 1)
      )
    })

    it('handles already sorted input', () => {
      const heap = new PairingHeap3<number>()
      for (let i = 1; i <= 50; i++) {
        heap.insert(i)
      }
      expect(heap.toSortedArray()).toEqual(
        Array.from({ length: 50 }, (_, i) => i + 1)
      )
    })

    it('handles all same values', () => {
      const heap = new PairingHeap3<number>()
      for (let i = 0; i < 10; i++) {
        heap.insert(42)
      }
      expect(heap.size).toBe(10)
      for (let i = 0; i < 10; i++) {
        expect(heap.extractMin()).toBe(42)
      }
    })

    it('handles single element insert extract insert', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(1)
      expect(heap.extractMin()).toBe(1)
      heap.insert(2)
      expect(heap.extractMin()).toBe(2)
    })

    it('handles inserting after multiple operations', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(5)
      heap.insert(3)
      heap.extractMin()
      const node1 = heap.insert(1)
      heap.insert(4)
      heap.delete(node1)
      expect(heap.size).toBe(2)
      expect(heap.peek()).toBe(4)
    })
  })

  describe('type exports', () => {
    it('exports PairingHeap3Node type', () => {
      const heap = new PairingHeap3<number>()
      const node: PairingHeap3Node<number> = heap.insert(5)
      expect(node.value).toBe(5)
      expect(node.child).toBeNull()
      expect(node.sibling).toBeNull()
    })

    it('exports PairingHeap3Options type', () => {
      const heap = new PairingHeap3<number>({
        comparator: (a, b) => a - b,
      })
      expect(heap).toBeDefined()
    })
  })

  describe('max-heap behavior', () => {
    it('extracts max when using reverse comparator', () => {
      const heap = new PairingHeap3<number>({
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
      const heap = new PairingHeap3<number>({
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
      const heap1 = new PairingHeap3<number>()
      const heap2 = new PairingHeap3<number>()
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
      const heap1 = new PairingHeap3<number>()
      const heap2 = new PairingHeap3<number>()
      const node = heap1.insert(10)
      heap2.insert(5)
      heap1.merge(heap2)
      heap1.decreaseKey(node, 1)
      expect(heap1.peek()).toBe(1)
    })

    it('merge then delete', () => {
      const heap1 = new PairingHeap3<number>()
      const heap2 = new PairingHeap3<number>()
      const node5 = heap1.insert(5)
      heap2.insert(3)
      heap1.merge(heap2)
      heap1.delete(node5)
      expect(heap1.peek()).toBe(3)
    })

    it('merge then update', () => {
      const heap1 = new PairingHeap3<number>()
      const heap2 = new PairingHeap3<number>()
      const node = heap1.insert(10)
      heap2.insert(5)
      heap1.merge(heap2)
      heap1.update(node, 1)
      expect(heap1.peek()).toBe(1)
    })
  })

  describe('complex scenarios', () => {
    it('Dijkstra-like usage pattern', () => {
      const heap = new PairingHeap3<{ node: number; dist: number }>({
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
      void nodeA
    })

    it('multiple merges and operations', () => {
      const h1 = new PairingHeap3<number>()
      const h2 = new PairingHeap3<number>()
      const h3 = new PairingHeap3<number>()
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
      const heap = new PairingHeap3<number>()
      heap.insert(5)
      heap.insert(3)
      expect(heap.extractMin()).toBe(3)
      heap.insert(1)
      heap.insert(4)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(4)
      expect(heap.extractMin()).toBe(5)
    })

    it('stress test with mixed operations', () => {
      const heap = new PairingHeap3<number>()
      const nodes: PairingHeap3Node<number>[] = []
      for (let i = 0; i < 50; i++) {
        nodes.push(heap.insert(i * 10))
      }
      heap.extractMin()
      heap.decreaseKey(nodes[49]!, 1)
      heap.delete(nodes[25]!)
      expect(heap.contains(1)).toBe(true)
      expect(heap.contains(0)).toBe(false)
      expect(heap.size).toBe(48)
    })

    it('clone then operations on clone', () => {
      const heap = new PairingHeap3<number>()
      for (let i = 1; i <= 10; i++) {
        heap.insert(i)
      }
      const cloned = heap.clone()
      cloned.extractMin()
      cloned.extractMin()
      expect(heap.size).toBe(10)
      expect(cloned.size).toBe(8)
      expect(cloned.peek()).toBe(3)
    })

    it('fromArray then mixed operations', () => {
      const heap = PairingHeap3.fromArray([5, 3, 8, 1, 9, 2])
      expect(heap.extractMin()).toBe(1)
      heap.insert(0)
      expect(heap.peek()).toBe(0)
      const sorted = heap.toSortedArray()
      expect(sorted).toEqual([0, 2, 3, 5, 8, 9])
    })

    it('clear and reuse', () => {
      const heap = new PairingHeap3<number>()
      for (let i = 0; i < 100; i++) {
        heap.insert(i)
      }
      heap.clear()
      expect(heap.isEmpty).toBe(true)
      heap.insert(50)
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(50)
    })

    it('toArray after decreaseKey', () => {
      const heap = new PairingHeap3<number>()
      const n5 = heap.insert(5)
      heap.insert(10)
      heap.insert(3)
      heap.decreaseKey(n5, 1)
      const arr = heap.toArray()
      expect(arr.sort((a, b) => a - b)).toEqual([1, 3, 10])
    })

    it('contains with custom comparator objects', () => {
      interface Point {
        x: number
        y: number
      }
      const heap = new PairingHeap3<Point>({
        comparator: (a, b) => a.x - b.x || a.y - b.y,
      })
      heap.insert({ x: 1, y: 2 })
      heap.insert({ x: 3, y: 4 })
      expect(heap.contains({ x: 1, y: 2 })).toBe(true)
      expect(heap.contains({ x: 3, y: 4 })).toBe(true)
    })

    it('update with complex objects', () => {
      interface Task {
        id: number
        priority: number
      }
      const heap = new PairingHeap3<Task>({
        comparator: (a, b) => a.priority - b.priority,
      })
      const task = heap.insert({ id: 1, priority: 10 })
      heap.insert({ id: 2, priority: 5 })
      heap.update(task, { id: 1, priority: 3 })
      expect(heap.peek().id).toBe(1)
      expect(heap.peek().priority).toBe(3)
    })

    it('handles decreasing key of deeply nested node', () => {
      const heap = new PairingHeap3<number>()
      const nodes: PairingHeap3Node<number>[] = []
      for (let i = 1; i <= 16; i++) {
        nodes.push(heap.insert(i))
      }
      heap.extractMin()
      const lastNode = nodes[nodes.length - 1]!
      heap.decreaseKey(lastNode, 0)
      expect(heap.peek()).toBe(0)
    })

    it('handles multiple decreaseKey operations', () => {
      const heap = new PairingHeap3<number>()
      const nodes: PairingHeap3Node<number>[] = []
      for (let i = 1; i <= 10; i++) {
        nodes.push(heap.insert(i))
      }
      heap.decreaseKey(nodes[9]!, 0)
      heap.decreaseKey(nodes[8]!, -1)
      expect(heap.peek()).toBe(-1)
      expect(heap.toSortedArray()[0]).toBe(-1)
    })
  })

  describe('static fromArray with operations', () => {
    it('fromArray then merge', () => {
      const a = PairingHeap3.fromArray([1, 3, 5])
      const b = PairingHeap3.fromArray([2, 4, 6])
      const merged = PairingHeap3.merge(a, b)
      expect(merged.toSortedArray()).toEqual([1, 2, 3, 4, 5, 6])
    })
  })

  describe('pairing heap structure', () => {
    it('correctly builds tree structure with inserts', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(3)
    })

    it('handles odd number of children during two-pass pairing', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(0)
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.insert(4)
      heap.extractMin()
      expect(heap.toSortedArray()).toEqual([1, 2, 3, 4])
    })

    it('handles even number of children during two-pass pairing', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(0)
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.extractMin()
      expect(heap.toSortedArray()).toEqual([1, 2, 3])
    })

    it('handles single child during two-pass pairing', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(0)
      heap.insert(1)
      heap.extractMin()
      expect(heap.peek()).toBe(1)
    })

    it('handles two children during two-pass pairing', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(0)
      heap.insert(2)
      heap.insert(1)
      heap.extractMin()
      expect(heap.toSortedArray()).toEqual([1, 2])
    })
  })
})
