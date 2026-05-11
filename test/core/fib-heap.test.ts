import { describe, it, expect } from 'vitest'
import { FibHeap } from '../../src/core/fib-heap/index.js'
import type { FibHeapNode } from '../../src/core/fib-heap/types.js'

describe('FibHeap', () => {
  describe('constructor', () => {
    it('creates an empty heap with default comparator', () => {
      const heap = new FibHeap()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty).toBe(true)
    })

    it('creates a heap with custom comparator', () => {
      const heap = new FibHeap<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      expect(heap.size).toBe(0)
    })

    it('creates a max-heap with reverse comparator', () => {
      const heap = new FibHeap<number>({
        comparator: (a, b) => b - a,
      })
      heap.insert(1)
      heap.insert(5)
      heap.insert(3)
      expect(heap.peek()).toBe(5)
    })

    it('works without options argument', () => {
      const heap = new FibHeap<number>()
      heap.insert(42)
      expect(heap.size).toBe(1)
    })
  })

  describe('insert', () => {
    it('inserts a single element', () => {
      const heap = new FibHeap<number>()
      heap.insert(10)
      expect(heap.size).toBe(1)
      expect(heap.isEmpty).toBe(false)
    })

    it('inserts multiple elements', () => {
      const heap = new FibHeap<number>()
      heap.insert(10)
      heap.insert(20)
      heap.insert(5)
      expect(heap.size).toBe(3)
    })

    it('returns a node reference', () => {
      const heap = new FibHeap<number>()
      const node = heap.insert(10)
      expect(node).toBeDefined()
      expect(node.value).toBe(10)
    })

    it('updates min on insert of smaller value', () => {
      const heap = new FibHeap<number>()
      heap.insert(10)
      heap.insert(5)
      expect(heap.peek()).toBe(5)
    })

    it('does not update min on insert of larger value', () => {
      const heap = new FibHeap<number>()
      heap.insert(5)
      heap.insert(10)
      expect(heap.peek()).toBe(5)
    })

    it('handles duplicate values', () => {
      const heap = new FibHeap<number>()
      heap.insert(5)
      heap.insert(5)
      heap.insert(5)
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(5)
    })

    it('handles negative numbers', () => {
      const heap = new FibHeap<number>()
      heap.insert(-5)
      heap.insert(-10)
      heap.insert(0)
      expect(heap.peek()).toBe(-10)
    })

    it('handles zero', () => {
      const heap = new FibHeap<number>()
      heap.insert(0)
      expect(heap.peek()).toBe(0)
    })

    it('handles strings with custom comparator', () => {
      const heap = new FibHeap<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      heap.insert('banana')
      heap.insert('apple')
      heap.insert('cherry')
      expect(heap.peek()).toBe('apple')
    })

    it('handles many insertions', () => {
      const heap = new FibHeap<number>()
      for (let i = 100; i >= 0; i--) {
        heap.insert(i)
      }
      expect(heap.size).toBe(101)
      expect(heap.peek()).toBe(0)
    })
  })

  describe('extractMin', () => {
    it('extracts the only element', () => {
      const heap = new FibHeap<number>()
      heap.insert(10)
      expect(heap.extractMin()).toBe(10)
      expect(heap.size).toBe(0)
    })

    it('extracts elements in sorted order', () => {
      const heap = new FibHeap<number>()
      heap.insert(30)
      heap.insert(10)
      heap.insert(20)
      expect(heap.extractMin()).toBe(10)
      expect(heap.extractMin()).toBe(20)
      expect(heap.extractMin()).toBe(30)
    })

    it('handles duplicates', () => {
      const heap = new FibHeap<number>()
      heap.insert(5)
      heap.insert(5)
      heap.insert(3)
      expect(heap.extractMin()).toBe(3)
      expect(heap.extractMin()).toBe(5)
      expect(heap.extractMin()).toBe(5)
    })

    it('throws on empty heap', () => {
      const heap = new FibHeap<number>()
      expect(() => heap.extractMin()).toThrow('Heap is empty')
    })

    it('consolidates trees after extraction', () => {
      const heap = new FibHeap<number>()
      for (let i = 0; i < 10; i++) {
        heap.insert(i)
      }
      for (let i = 0; i < 10; i++) {
        expect(heap.extractMin()).toBe(i)
      }
    })

    it('handles extraction that triggers cascading restructure', () => {
      const heap = new FibHeap<number>()
      for (let i = 100; i >= 1; i--) {
        heap.insert(i)
      }
      expect(heap.extractMin()).toBe(1)
      expect(heap.peek()).toBe(2)
    })

    it('extracts all elements leaving empty heap', () => {
      const heap = new FibHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.extractMin()
      heap.extractMin()
      heap.extractMin()
      expect(heap.isEmpty).toBe(true)
    })

    it('handles interleaved insert and extract', () => {
      const heap = new FibHeap<number>()
      heap.insert(5)
      heap.insert(3)
      expect(heap.extractMin()).toBe(3)
      heap.insert(1)
      heap.insert(4)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(4)
      expect(heap.extractMin()).toBe(5)
    })

    it('works with string comparator', () => {
      const heap = new FibHeap<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      heap.insert('cherry')
      heap.insert('apple')
      heap.insert('banana')
      expect(heap.extractMin()).toBe('apple')
      expect(heap.extractMin()).toBe('banana')
      expect(heap.extractMin()).toBe('cherry')
    })

    it('handles large number of extractions', () => {
      const heap = new FibHeap<number>()
      for (let i = 0; i < 50; i++) {
        heap.insert(i)
      }
      for (let i = 0; i < 50; i++) {
        expect(heap.extractMin()).toBe(i)
      }
    })
  })

  describe('peek', () => {
    it('returns min without removing it', () => {
      const heap = new FibHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      expect(heap.peek()).toBe(3)
      expect(heap.size).toBe(3)
    })

    it('throws on empty heap', () => {
      const heap = new FibHeap<number>()
      expect(() => heap.peek()).toThrow('Heap is empty')
    })

    it('returns updated min after insert', () => {
      const heap = new FibHeap<number>()
      heap.insert(10)
      expect(heap.peek()).toBe(10)
      heap.insert(5)
      expect(heap.peek()).toBe(5)
    })

    it('does not change after multiple peeks', () => {
      const heap = new FibHeap<number>()
      heap.insert(42)
      expect(heap.peek()).toBe(42)
      expect(heap.peek()).toBe(42)
      expect(heap.peek()).toBe(42)
      expect(heap.size).toBe(1)
    })
  })

  describe('decreaseKey', () => {
    it('decreases key of a node', () => {
      const heap = new FibHeap<number>()
      heap.insert(5)
      const node = heap.insert(10)
      heap.decreaseKey(node, 3)
      expect(heap.peek()).toBe(3)
    })

    it('returns the modified node', () => {
      const heap = new FibHeap<number>()
      const node = heap.insert(10)
      const result = heap.decreaseKey(node, 5)
      expect(result).toBe(node)
      expect(result.value).toBe(5)
    })

    it('handles decreaseKey on root node', () => {
      const heap = new FibHeap<number>()
      const node = heap.insert(10)
      heap.decreaseKey(node, 5)
      expect(node.value).toBe(5)
    })

    it('throws if new value is greater than current', () => {
      const heap = new FibHeap<number>()
      const node = heap.insert(5)
      expect(() => heap.decreaseKey(node, 10)).toThrow(
        'New value is greater than current value'
      )
    })

    it('allows decreaseKey to same value', () => {
      const heap = new FibHeap<number>()
      const node = heap.insert(5)
      heap.decreaseKey(node, 5)
      expect(node.value).toBe(5)
    })

    it('triggers cut and cascading cut', () => {
      const heap = new FibHeap<number>()
      const nodes: FibHeapNode<number>[] = []
      for (let i = 1; i <= 7; i++) {
        nodes.push(heap.insert(i))
      }
      heap.extractMin()
      heap.decreaseKey(nodes[6]!, 0)
      expect(heap.peek()).toBe(0)
    })

    it('handles multiple decreaseKey operations', () => {
      const heap = new FibHeap<number>()
      const node = heap.insert(100)
      heap.insert(50)
      heap.decreaseKey(node, 40)
      expect(heap.peek()).toBe(40)
      heap.decreaseKey(node, 10)
      expect(heap.peek()).toBe(10)
    })

    it('works with string comparator', () => {
      const heap = new FibHeap<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      const node = heap.insert('zzz')
      heap.insert('aaa')
      heap.decreaseKey(node, '000')
      expect(heap.peek()).toBe('000')
    })

    it('updates min when decreased below current min', () => {
      const heap = new FibHeap<number>()
      heap.insert(5)
      const node = heap.insert(10)
      heap.decreaseKey(node, 2)
      expect(heap.peek()).toBe(2)
    })

    it('does not update min when decreased above current min', () => {
      const heap = new FibHeap<number>()
      heap.insert(1)
      const node = heap.insert(10)
      heap.decreaseKey(node, 5)
      expect(heap.peek()).toBe(1)
    })

    it('throws on empty heap', () => {
      const heap = new FibHeap<number>()
      const node: FibHeapNode<number> = {
        value: 5,
        degree: 0,
        parent: null,
        child: null,
        left: null!,
        right: null!,
        mark: false,
      }
      expect(() => heap.decreaseKey(node, 3)).toThrow('Heap is empty')
    })
  })

  describe('delete', () => {
    it('deletes a specific node', () => {
      const heap = new FibHeap<number>()
      const node = heap.insert(10)
      heap.insert(5)
      heap.insert(15)
      heap.delete(node)
      expect(heap.size).toBe(2)
      expect(heap.peek()).toBe(5)
    })

    it('deletes the min node', () => {
      const heap = new FibHeap<number>()
      const node = heap.insert(1)
      heap.insert(5)
      heap.insert(3)
      heap.delete(node)
      expect(heap.peek()).toBe(3)
    })

    it('deletes the only node', () => {
      const heap = new FibHeap<number>()
      const node = heap.insert(42)
      heap.delete(node)
      expect(heap.isEmpty).toBe(true)
    })

    it('handles deletion of child nodes', () => {
      const heap = new FibHeap<number>()
      const nodes: FibHeapNode<number>[] = []
      for (let i = 0; i < 10; i++) {
        nodes.push(heap.insert(i))
      }
      heap.extractMin()
      heap.delete(nodes[5]!)
      expect(heap.size).toBe(8)
    })

    it('decreases size correctly', () => {
      const heap = new FibHeap<number>()
      const n1 = heap.insert(10)
      const n2 = heap.insert(20)
      const n3 = heap.insert(30)
      heap.delete(n1)
      expect(heap.size).toBe(2)
      heap.delete(n2)
      expect(heap.size).toBe(1)
      heap.delete(n3)
      expect(heap.size).toBe(0)
    })
  })

  describe('merge', () => {
    it('merges two non-empty heaps', () => {
      const h1 = new FibHeap<number>()
      h1.insert(10)
      h1.insert(20)
      const h2 = new FibHeap<number>()
      h2.insert(5)
      h2.insert(15)
      h1.merge(h2)
      expect(h1.size).toBe(4)
      expect(h1.peek()).toBe(5)
    })

    it('merges into empty heap', () => {
      const h1 = new FibHeap<number>()
      const h2 = new FibHeap<number>()
      h2.insert(5)
      h1.merge(h2)
      expect(h1.size).toBe(1)
      expect(h1.peek()).toBe(5)
    })

    it('merges empty heap into non-empty', () => {
      const h1 = new FibHeap<number>()
      h1.insert(5)
      const h2 = new FibHeap<number>()
      h1.merge(h2)
      expect(h1.size).toBe(1)
      expect(h1.peek()).toBe(5)
    })

    it('merges two empty heaps', () => {
      const h1 = new FibHeap<number>()
      const h2 = new FibHeap<number>()
      h1.merge(h2)
      expect(h1.size).toBe(0)
    })

    it('does not merge with itself', () => {
      const heap = new FibHeap<number>()
      heap.insert(5)
      heap.merge(heap)
      expect(heap.size).toBe(1)
    })

    it('clears the other heap after merge', () => {
      const h1 = new FibHeap<number>()
      const h2 = new FibHeap<number>()
      h2.insert(5)
      h2.insert(10)
      h1.merge(h2)
      expect(h2.size).toBe(0)
      expect(h2.isEmpty).toBe(true)
    })

    it('maintains correct min after merge', () => {
      const h1 = new FibHeap<number>()
      h1.insert(100)
      const h2 = new FibHeap<number>()
      h2.insert(1)
      h1.merge(h2)
      expect(h1.peek()).toBe(1)
    })

    it('extracts in order after merge', () => {
      const h1 = new FibHeap<number>()
      h1.insert(10)
      h1.insert(30)
      const h2 = new FibHeap<number>()
      h2.insert(20)
      h2.insert(5)
      h1.merge(h2)
      expect(h1.extractMin()).toBe(5)
      expect(h1.extractMin()).toBe(10)
      expect(h1.extractMin()).toBe(20)
      expect(h1.extractMin()).toBe(30)
    })
  })

  describe('size and isEmpty', () => {
    it('returns 0 for empty heap', () => {
      const heap = new FibHeap<number>()
      expect(heap.size).toBe(0)
    })

    it('returns true for isEmpty on new heap', () => {
      const heap = new FibHeap<number>()
      expect(heap.isEmpty).toBe(true)
    })

    it('returns false for isEmpty after insert', () => {
      const heap = new FibHeap<number>()
      heap.insert(1)
      expect(heap.isEmpty).toBe(false)
    })

    it('returns true for isEmpty after all extractions', () => {
      const heap = new FibHeap<number>()
      heap.insert(1)
      heap.extractMin()
      expect(heap.isEmpty).toBe(true)
    })

    it('tracks size correctly through operations', () => {
      const heap = new FibHeap<number>()
      heap.insert(1)
      heap.insert(2)
      expect(heap.size).toBe(2)
      heap.extractMin()
      expect(heap.size).toBe(1)
      heap.insert(3)
      expect(heap.size).toBe(2)
    })
  })

  describe('clear', () => {
    it('clears a non-empty heap', () => {
      const heap = new FibHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.clear()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty).toBe(true)
    })

    it('clears an empty heap', () => {
      const heap = new FibHeap<number>()
      heap.clear()
      expect(heap.size).toBe(0)
    })

    it('allows operations after clear', () => {
      const heap = new FibHeap<number>()
      heap.insert(10)
      heap.clear()
      heap.insert(5)
      expect(heap.peek()).toBe(5)
      expect(heap.size).toBe(1)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty heap', () => {
      const heap = new FibHeap<number>()
      expect(heap.toArray()).toEqual([])
    })

    it('returns all elements for non-empty heap', () => {
      const heap = new FibHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      const arr = heap.toArray()
      expect(arr.length).toBe(3)
      expect(arr).toContain(1)
      expect(arr).toContain(2)
      expect(arr).toContain(3)
    })

    it('does not modify the heap', () => {
      const heap = new FibHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.toArray()
      expect(heap.size).toBe(2)
    })
  })

  describe('contains', () => {
    it('returns false for empty heap', () => {
      const heap = new FibHeap<number>()
      expect(heap.contains(5)).toBe(false)
    })

    it('returns true for existing value', () => {
      const heap = new FibHeap<number>()
      heap.insert(5)
      expect(heap.contains(5)).toBe(true)
    })

    it('returns false for non-existing value', () => {
      const heap = new FibHeap<number>()
      heap.insert(5)
      expect(heap.contains(10)).toBe(false)
    })

    it('finds values in child trees', () => {
      const heap = new FibHeap<number>()
      for (let i = 0; i < 20; i++) {
        heap.insert(i)
      }
      heap.extractMin()
      expect(heap.contains(10)).toBe(true)
      expect(heap.contains(0)).toBe(false)
    })

    it('handles duplicate values', () => {
      const heap = new FibHeap<number>()
      heap.insert(5)
      heap.insert(5)
      expect(heap.contains(5)).toBe(true)
    })
  })

  describe('clone', () => {
    it('clones an empty heap', () => {
      const heap = new FibHeap<number>()
      const cloned = heap.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty).toBe(true)
    })

    it('clones a non-empty heap', () => {
      const heap = new FibHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      const cloned = heap.clone()
      expect(cloned.size).toBe(3)
      expect(cloned.peek()).toBe(1)
    })

    it('clones with same comparator', () => {
      const heap = new FibHeap<number>({ comparator: (a, b) => b - a })
      heap.insert(1)
      heap.insert(5)
      const cloned = heap.clone()
      expect(cloned.peek()).toBe(5)
    })

    it('does not affect original when modifying clone', () => {
      const heap = new FibHeap<number>()
      heap.insert(1)
      heap.insert(2)
      const cloned = heap.clone()
      cloned.extractMin()
      expect(heap.size).toBe(2)
      expect(cloned.size).toBe(1)
    })

    it('independent extraction on clone', () => {
      const heap = new FibHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      const cloned = heap.clone()
      expect(heap.extractMin()).toBe(1)
      expect(cloned.extractMin()).toBe(1)
      expect(heap.peek()).toBe(2)
      expect(cloned.peek()).toBe(2)
    })
  })

  describe('static fromArray', () => {
    it('creates heap from empty array', () => {
      const heap = FibHeap.fromArray([])
      expect(heap.size).toBe(0)
    })

    it('creates heap from number array', () => {
      const heap = FibHeap.fromArray([3, 1, 2])
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(1)
    })

    it('creates heap with custom comparator', () => {
      const heap = FibHeap.fromArray([1, 2, 3], {
        comparator: (a, b) => b - a,
      })
      expect(heap.peek()).toBe(3)
    })

    it('creates heap from string array', () => {
      const heap = FibHeap.fromArray(['banana', 'apple', 'cherry'], {
        comparator: (a, b) => a.localeCompare(b),
      })
      expect(heap.peek()).toBe('apple')
    })

    it('creates heap from single element array', () => {
      const heap = FibHeap.fromArray([42])
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(42)
    })
  })

  describe('static merge', () => {
    it('merges two heaps into a new one', () => {
      const h1 = new FibHeap<number>()
      h1.insert(10)
      const h2 = new FibHeap<number>()
      h2.insert(5)
      const merged = FibHeap.merge(h1, h2)
      expect(merged.size).toBe(2)
      expect(merged.peek()).toBe(5)
    })

    it('does not modify original heaps', () => {
      const h1 = new FibHeap<number>()
      h1.insert(10)
      const h2 = new FibHeap<number>()
      h2.insert(5)
      FibHeap.merge(h1, h2)
      expect(h1.size).toBe(1)
      expect(h2.size).toBe(1)
    })

    it('merges empty heaps', () => {
      const h1 = new FibHeap<number>()
      const h2 = new FibHeap<number>()
      const merged = FibHeap.merge(h1, h2)
      expect(merged.size).toBe(0)
    })

    it('merges with one empty heap', () => {
      const h1 = new FibHeap<number>()
      h1.insert(1)
      h1.insert(2)
      const h2 = new FibHeap<number>()
      const merged = FibHeap.merge(h1, h2)
      expect(merged.size).toBe(2)
    })
  })

  describe('forEach', () => {
    it('does nothing on empty heap', () => {
      const heap = new FibHeap<number>()
      let count = 0
      heap.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('iterates over all elements', () => {
      const heap = new FibHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      const values: number[] = []
      heap.forEach((v) => values.push(v))
      expect(values.length).toBe(3)
    })

    it('provides each value to callback', () => {
      const heap = new FibHeap<number>()
      heap.insert(10)
      heap.insert(20)
      const values: number[] = []
      heap.forEach((v) => values.push(v))
      expect(values).toContain(10)
      expect(values).toContain(20)
    })
  })

  describe('Symbol.iterator', () => {
    it('returns empty iterator for empty heap', () => {
      const heap = new FibHeap<number>()
      const result = [...heap]
      expect(result).toEqual([])
    })

    it('iterates over all elements', () => {
      const heap = new FibHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      const result = [...heap]
      expect(result.length).toBe(3)
    })

    it('works with for...of', () => {
      const heap = new FibHeap<number>()
      heap.insert(10)
      heap.insert(20)
      const values: number[] = []
      for (const v of heap) {
        values.push(v)
      }
      expect(values.length).toBe(2)
    })
  })

  describe('toSortedArray', () => {
    it('returns empty array for empty heap', () => {
      const heap = new FibHeap<number>()
      expect(heap.toSortedArray()).toEqual([])
    })

    it('returns sorted elements', () => {
      const heap = new FibHeap<number>()
      heap.insert(30)
      heap.insert(10)
      heap.insert(20)
      expect(heap.toSortedArray()).toEqual([10, 20, 30])
    })

    it('handles reverse order input', () => {
      const heap = new FibHeap<number>()
      for (let i = 10; i >= 0; i--) {
        heap.insert(i)
      }
      expect(heap.toSortedArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('does not modify the original heap', () => {
      const heap = new FibHeap<number>()
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      heap.toSortedArray()
      expect(heap.size).toBe(3)
    })

    it('handles single element', () => {
      const heap = new FibHeap<number>()
      heap.insert(42)
      expect(heap.toSortedArray()).toEqual([42])
    })

    it('handles duplicates', () => {
      const heap = new FibHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(5)
      heap.insert(3)
      expect(heap.toSortedArray()).toEqual([3, 3, 5, 5])
    })
  })

  describe('consolidation', () => {
    it('handles consolidation of many trees', () => {
      const heap = new FibHeap<number>()
      for (let i = 0; i < 16; i++) {
        heap.insert(i)
      }
      for (let i = 0; i < 16; i++) {
        expect(heap.extractMin()).toBe(i)
      }
    })

    it('handles consolidation after decreaseKey', () => {
      const heap = new FibHeap<number>()
      const nodes: FibHeapNode<number>[] = []
      for (let i = 0; i < 20; i++) {
        nodes.push(heap.insert(i * 10))
      }
      heap.extractMin()
      heap.decreaseKey(nodes[10]!, 1)
      expect(heap.extractMin()).toBe(1)
    })
  })

  describe('cascading cuts', () => {
    it('performs cascading cuts correctly', () => {
      const heap = new FibHeap<number>()
      const nodes: FibHeapNode<number>[] = []
      for (let i = 1; i <= 7; i++) {
        nodes.push(heap.insert(i))
      }
      heap.extractMin()
      heap.decreaseKey(nodes[5]!, 0)
      expect(heap.peek()).toBe(0)
    })

    it('marks parent after first child cut', () => {
      const heap = new FibHeap<number>()
      const nodes: FibHeapNode<number>[] = []
      for (let i = 0; i < 10; i++) {
        nodes.push(heap.insert(i))
      }
      heap.extractMin()
      heap.decreaseKey(nodes[8]!, -1)
      expect(heap.peek()).toBe(-1)
    })

    it('cascading cut propagates up the tree', () => {
      const heap = new FibHeap<number>()
      const nodes: FibHeapNode<number>[] = []
      for (let i = 1; i <= 15; i++) {
        nodes.push(heap.insert(i))
      }
      heap.extractMin()
      heap.decreaseKey(nodes[14]!, 0)
      expect(heap.peek()).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('handles insert after extractMin leaves heap empty', () => {
      const heap = new FibHeap<number>()
      heap.insert(1)
      heap.extractMin()
      heap.insert(2)
      expect(heap.peek()).toBe(2)
    })

    it('handles many interleaved operations', () => {
      const heap = new FibHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      expect(heap.extractMin()).toBe(3)
      heap.insert(1)
      heap.insert(4)
      expect(heap.extractMin()).toBe(1)
      heap.insert(2)
      expect(heap.extractMin()).toBe(2)
      expect(heap.extractMin()).toBe(4)
      expect(heap.extractMin()).toBe(5)
      expect(heap.extractMin()).toBe(7)
      expect(heap.isEmpty).toBe(true)
    })

    it('handles objects with custom comparator', () => {
      interface Item {
        priority: number
        name: string
      }
      const heap = new FibHeap<Item>({
        comparator: (a, b) => a.priority - b.priority,
      })
      heap.insert({ priority: 3, name: 'c' })
      heap.insert({ priority: 1, name: 'a' })
      heap.insert({ priority: 2, name: 'b' })
      expect(heap.extractMin().name).toBe('a')
      expect(heap.extractMin().name).toBe('b')
      expect(heap.extractMin().name).toBe('c')
    })

    it('handles single element delete and re-insert', () => {
      const heap = new FibHeap<number>()
      const node = heap.insert(5)
      heap.delete(node)
      expect(heap.isEmpty).toBe(true)
      heap.insert(10)
      expect(heap.peek()).toBe(10)
    })

    it('handles merge then extract', () => {
      const h1 = new FibHeap<number>()
      h1.insert(10)
      const h2 = new FibHeap<number>()
      h2.insert(5)
      h2.insert(15)
      h1.merge(h2)
      expect(h1.extractMin()).toBe(5)
      expect(h1.extractMin()).toBe(10)
      expect(h1.extractMin()).toBe(15)
    })

    it('handles clear and reuse', () => {
      const heap = new FibHeap<number>()
      for (let i = 0; i < 10; i++) {
        heap.insert(i)
      }
      heap.clear()
      expect(heap.isEmpty).toBe(true)
      heap.insert(100)
      expect(heap.peek()).toBe(100)
    })

    it('handles stress test with many operations', () => {
      const heap = new FibHeap<number>()
      const nodes: FibHeapNode<number>[] = []
      for (let i = 100; i >= 1; i--) {
        nodes.push(heap.insert(i))
      }
      for (let i = 1; i <= 100; i++) {
        expect(heap.extractMin()).toBe(i)
      }
    })

    it('handles decreaseKey after multiple extractions', () => {
      const heap = new FibHeap<number>()
      const nodes: FibHeapNode<number>[] = []
      for (let i = 0; i < 20; i++) {
        nodes.push(heap.insert(i * 5))
      }
      heap.extractMin()
      heap.extractMin()
      heap.decreaseKey(nodes[15]!, 1)
      expect(heap.peek()).toBe(1)
    })

    it('handles delete of non-min node after consolidation', () => {
      const heap = new FibHeap<number>()
      const nodes: FibHeapNode<number>[] = []
      for (let i = 0; i < 10; i++) {
        nodes.push(heap.insert(i))
      }
      heap.extractMin()
      heap.delete(nodes[5]!)
      const remaining = heap.toSortedArray()
      expect(remaining).not.toContain(5)
      expect(remaining).not.toContain(0)
    })

    it('handles heap with floating point numbers', () => {
      const heap = new FibHeap<number>()
      heap.insert(3.14)
      heap.insert(2.71)
      heap.insert(1.41)
      expect(heap.extractMin()).toBe(1.41)
      expect(heap.extractMin()).toBe(2.71)
      expect(heap.extractMin()).toBe(3.14)
    })

    it('handles max-heap operations', () => {
      const heap = new FibHeap<number>({ comparator: (a, b) => b - a })
      heap.insert(1)
      heap.insert(5)
      heap.insert(3)
      expect(heap.extractMin()).toBe(5)
      expect(heap.extractMin()).toBe(3)
      expect(heap.extractMin()).toBe(1)
    })

    it('handles toSortedArray on large heap', () => {
      const heap = new FibHeap<number>()
      const values = [50, 30, 70, 10, 40, 60, 80, 20, 90]
      for (const v of values) {
        heap.insert(v)
      }
      expect(heap.toSortedArray()).toEqual([
        10, 20, 30, 40, 50, 60, 70, 80, 90,
      ])
    })

    it('handles fromArray with already sorted input', () => {
      const heap = FibHeap.fromArray([1, 2, 3, 4, 5])
      expect(heap.toSortedArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('handles fromArray with reverse sorted input', () => {
      const heap = FibHeap.fromArray([5, 4, 3, 2, 1])
      expect(heap.toSortedArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('handles decreaseKey maintaining heap property', () => {
      const heap = new FibHeap<number>()
      const nodes: FibHeapNode<number>[] = []
      for (let i = 10; i < 20; i++) {
        nodes.push(heap.insert(i))
      }
      heap.decreaseKey(nodes[4]!, 1)
      heap.decreaseKey(nodes[7]!, 2)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(2)
    })

    it('handles merge of large heaps', () => {
      const h1 = new FibHeap<number>()
      for (let i = 0; i < 50; i++) {
        h1.insert(i * 2)
      }
      const h2 = new FibHeap<number>()
      for (let i = 0; i < 50; i++) {
        h2.insert(i * 2 + 1)
      }
      h1.merge(h2)
      expect(h1.size).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(h1.extractMin()).toBe(i)
      }
    })

    it('handles static merge of large heaps', () => {
      const h1 = FibHeap.fromArray(Array.from({ length: 50 }, (_, i) => i * 2))
      const h2 = FibHeap.fromArray(
        Array.from({ length: 50 }, (_, i) => i * 2 + 1)
      )
      const merged = FibHeap.merge(h1, h2)
      expect(merged.size).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(merged.extractMin()).toBe(i)
      }
    })

    it('clone handles decreaseKey independently', () => {
      const heap = new FibHeap<number>()
      const node = heap.insert(100)
      heap.insert(50)
      const cloned = heap.clone()
      expect(cloned.peek()).toBe(50)
    })

    it('handles forEach after extraction', () => {
      const heap = new FibHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.extractMin()
      const values: number[] = []
      heap.forEach((v) => values.push(v))
      expect(values.length).toBe(2)
      expect(values).toContain(2)
      expect(values).toContain(3)
    })

    it('handles contains after extraction', () => {
      const heap = new FibHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.extractMin()
      expect(heap.contains(1)).toBe(false)
      expect(heap.contains(2)).toBe(true)
      expect(heap.contains(3)).toBe(true)
    })

    it('handles toArray after merge', () => {
      const h1 = new FibHeap<number>()
      h1.insert(1)
      h1.insert(3)
      const h2 = new FibHeap<number>()
      h2.insert(2)
      h2.insert(4)
      h1.merge(h2)
      const arr = h1.toArray()
      expect(arr.length).toBe(4)
    })

    it('handles multiple merges', () => {
      const heap = new FibHeap<number>()
      heap.insert(5)
      for (let i = 0; i < 5; i++) {
        const other = new FibHeap<number>()
        other.insert(i)
        heap.merge(other)
      }
      expect(heap.size).toBe(6)
      expect(heap.extractMin()).toBe(0)
    })
  })

  describe('FibHeapNode properties', () => {
    it('inserted node has correct initial properties', () => {
      const heap = new FibHeap<number>()
      const node = heap.insert(42)
      expect(node.value).toBe(42)
      expect(node.degree).toBe(0)
      expect(node.parent).toBeNull()
      expect(node.child).toBeNull()
      expect(node.mark).toBe(false)
    })

    it('nodes in circular list are linked', () => {
      const heap = new FibHeap<number>()
      const n1 = heap.insert(1)
      const n2 = heap.insert(2)
      expect(n1.right).toBe(n2)
      expect(n2.left).toBe(n1)
    })

    it('single node points to itself', () => {
      const heap = new FibHeap<number>()
      const node = heap.insert(1)
      expect(node.left).toBe(node)
      expect(node.right).toBe(node)
    })
  })
})
