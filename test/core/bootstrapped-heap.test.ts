import { describe, it, expect } from 'vitest'
import { BootstrappedHeap } from '../../src/core/bootstrapped-heap/index.js'
import type { BootstrappedHeapNode } from '../../src/core/bootstrapped-heap/types.js'

describe('BootstrappedHeap', () => {
  describe('constructor', () => {
    it('creates an empty heap with default comparator', () => {
      const heap = new BootstrappedHeap()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty).toBe(true)
    })

    it('creates a heap with custom comparator', () => {
      const heap = new BootstrappedHeap<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      expect(heap.size).toBe(0)
    })

    it('creates a max-heap with reverse comparator', () => {
      const heap = new BootstrappedHeap<number>({
        comparator: (a, b) => b - a,
      })
      heap.insert(1)
      heap.insert(5)
      heap.insert(3)
      expect(heap.peek()).toBe(5)
    })

    it('works without options argument', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(42)
      expect(heap.size).toBe(1)
    })
  })

  describe('insert', () => {
    it('inserts a single element', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(10)
      expect(heap.size).toBe(1)
      expect(heap.isEmpty).toBe(false)
    })

    it('inserts multiple elements', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(10)
      heap.insert(20)
      heap.insert(5)
      expect(heap.size).toBe(3)
    })

    it('returns a node reference', () => {
      const heap = new BootstrappedHeap<number>()
      const node = heap.insert(10)
      expect(node).toBeDefined()
      expect(node.value).toBe(10)
    })

    it('updates min on insert of smaller value', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(10)
      heap.insert(5)
      expect(heap.peek()).toBe(5)
    })

    it('does not update min on insert of larger value', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(5)
      heap.insert(10)
      expect(heap.peek()).toBe(5)
    })

    it('handles duplicate values', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(5)
      heap.insert(5)
      heap.insert(5)
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(5)
    })

    it('handles negative numbers', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(-10)
      heap.insert(-5)
      heap.insert(-20)
      expect(heap.peek()).toBe(-20)
    })

    it('handles zero', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(0)
      heap.insert(1)
      heap.insert(-1)
      expect(heap.peek()).toBe(-1)
    })

    it('handles floating point numbers', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(3.14)
      heap.insert(2.71)
      heap.insert(1.41)
      expect(heap.peek()).toBe(1.41)
    })

    it('inserts elements in ascending order', () => {
      const heap = new BootstrappedHeap<number>()
      for (let i = 0; i < 10; i++) {
        heap.insert(i)
      }
      expect(heap.size).toBe(10)
      expect(heap.peek()).toBe(0)
    })

    it('inserts elements in descending order', () => {
      const heap = new BootstrappedHeap<number>()
      for (let i = 9; i >= 0; i--) {
        heap.insert(i)
      }
      expect(heap.size).toBe(10)
      expect(heap.peek()).toBe(0)
    })

    it('inserts many elements', () => {
      const heap = new BootstrappedHeap<number>()
      for (let i = 0; i < 100; i++) {
        heap.insert(i)
      }
      expect(heap.size).toBe(100)
      expect(heap.peek()).toBe(0)
    })
  })

  describe('extractMin', () => {
    it('throws on empty heap', () => {
      const heap = new BootstrappedHeap<number>()
      expect(() => heap.extractMin()).toThrow('Heap is empty')
    })

    it('extracts single element', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(10)
      expect(heap.extractMin()).toBe(10)
      expect(heap.size).toBe(0)
    })

    it('extracts elements in sorted order', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(2)
      expect(heap.extractMin()).toBe(3)
    })

    it('handles duplicate values', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(5)
      heap.insert(5)
      heap.insert(5)
      expect(heap.extractMin()).toBe(5)
      expect(heap.extractMin()).toBe(5)
      expect(heap.extractMin()).toBe(5)
      expect(heap.isEmpty).toBe(true)
    })

    it('extracts from heap with many elements', () => {
      const heap = new BootstrappedHeap<number>()
      for (let i = 99; i >= 0; i--) {
        heap.insert(i)
      }
      for (let i = 0; i < 100; i++) {
        expect(heap.extractMin()).toBe(i)
      }
      expect(heap.isEmpty).toBe(true)
    })

    it('handles interleaved insert and extract', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(5)
      heap.insert(3)
      expect(heap.extractMin()).toBe(3)
      heap.insert(1)
      heap.insert(4)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(4)
      expect(heap.extractMin()).toBe(5)
    })

    it('handles negative numbers', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(-3)
      heap.insert(-1)
      heap.insert(-2)
      expect(heap.extractMin()).toBe(-3)
      expect(heap.extractMin()).toBe(-2)
      expect(heap.extractMin()).toBe(-1)
    })

    it('handles floating point extraction', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(3.14)
      heap.insert(1.41)
      heap.insert(2.71)
      expect(heap.extractMin()).toBe(1.41)
      expect(heap.extractMin()).toBe(2.71)
      expect(heap.extractMin()).toBe(3.14)
    })

    it('maintains heap property after extraction', () => {
      const heap = new BootstrappedHeap<number>()
      const values = [5, 3, 7, 1, 4, 6, 2, 8]
      for (const v of values) {
        heap.insert(v)
      }
      const sorted = values.slice().sort((a, b) => a - b)
      for (const expected of sorted) {
        expect(heap.extractMin()).toBe(expected)
      }
    })
  })

  describe('peek', () => {
    it('throws on empty heap', () => {
      const heap = new BootstrappedHeap<number>()
      expect(() => heap.peek()).toThrow('Heap is empty')
    })

    it('returns minimum element', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      expect(heap.peek()).toBe(3)
    })

    it('does not remove element', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(5)
      heap.peek()
      expect(heap.size).toBe(1)
    })

    it('returns same element on repeated calls', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(5)
      expect(heap.peek()).toBe(5)
      expect(heap.peek()).toBe(5)
      expect(heap.peek()).toBe(5)
    })

    it('updates after extraction', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.extractMin()
      expect(heap.peek()).toBe(2)
    })
  })

  describe('merge', () => {
    it('merges two empty heaps', () => {
      const a = new BootstrappedHeap<number>()
      const b = new BootstrappedHeap<number>()
      a.merge(b)
      expect(a.size).toBe(0)
      expect(b.size).toBe(0)
    })

    it('merges empty into non-empty', () => {
      const a = new BootstrappedHeap<number>()
      const b = new BootstrappedHeap<number>()
      a.insert(1)
      a.merge(b)
      expect(a.size).toBe(1)
    })

    it('merges non-empty into empty', () => {
      const a = new BootstrappedHeap<number>()
      const b = new BootstrappedHeap<number>()
      b.insert(1)
      a.merge(b)
      expect(a.size).toBe(1)
      expect(a.peek()).toBe(1)
      expect(b.size).toBe(0)
    })

    it('merges two non-empty heaps', () => {
      const a = new BootstrappedHeap<number>()
      const b = new BootstrappedHeap<number>()
      a.insert(1)
      a.insert(3)
      b.insert(2)
      b.insert(4)
      a.merge(b)
      expect(a.size).toBe(4)
      expect(a.extractMin()).toBe(1)
      expect(a.extractMin()).toBe(2)
      expect(a.extractMin()).toBe(3)
      expect(a.extractMin()).toBe(4)
    })

    it('clears the merged heap', () => {
      const a = new BootstrappedHeap<number>()
      const b = new BootstrappedHeap<number>()
      b.insert(1)
      b.insert(2)
      a.merge(b)
      expect(b.size).toBe(0)
      expect(b.isEmpty).toBe(true)
    })

    it('handles merging with itself gracefully', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.merge(heap)
      expect(heap.size).toBe(2)
    })

    it('preserves sorted order after merge', () => {
      const a = new BootstrappedHeap<number>()
      const b = new BootstrappedHeap<number>()
      for (let i = 0; i < 10; i++) a.insert(i * 2)
      for (let i = 0; i < 10; i++) b.insert(i * 2 + 1)
      a.merge(b)
      expect(a.size).toBe(20)
      for (let i = 0; i < 20; i++) {
        expect(a.extractMin()).toBe(i)
      }
    })

    it('merges heaps with overlapping values', () => {
      const a = new BootstrappedHeap<number>()
      const b = new BootstrappedHeap<number>()
      a.insert(1)
      a.insert(3)
      b.insert(1)
      b.insert(3)
      a.merge(b)
      expect(a.size).toBe(4)
      expect(a.extractMin()).toBe(1)
      expect(a.extractMin()).toBe(1)
      expect(a.extractMin()).toBe(3)
      expect(a.extractMin()).toBe(3)
    })

    it('merges large heaps', () => {
      const a = new BootstrappedHeap<number>()
      const b = new BootstrappedHeap<number>()
      for (let i = 0; i < 50; i++) a.insert(i)
      for (let i = 50; i < 100; i++) b.insert(i)
      a.merge(b)
      expect(a.size).toBe(100)
      expect(a.peek()).toBe(0)
    })
  })

  describe('decreaseKey', () => {
    it('throws on empty heap', () => {
      const heap = new BootstrappedHeap<number>()
      const node: BootstrappedHeapNode<number> = { value: 1, id: 0, tree: null }
      expect(() => heap.decreaseKey(node, 0)).toThrow('Heap is empty')
    })

    it('throws when new value is greater', () => {
      const heap = new BootstrappedHeap<number>()
      const node = heap.insert(5)
      expect(() => heap.decreaseKey(node, 10)).toThrow(
        'New value is greater than current value'
      )
    })

    it('decreases key to same value', () => {
      const heap = new BootstrappedHeap<number>()
      const node = heap.insert(5)
      heap.decreaseKey(node, 5)
      expect(node.value).toBe(5)
    })

    it('decreases key to smaller value', () => {
      const heap = new BootstrappedHeap<number>()
      const node = heap.insert(5)
      heap.decreaseKey(node, 1)
      expect(node.value).toBe(1)
    })

    it('decreased key affects peek', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(10)
      const node = heap.insert(5)
      heap.decreaseKey(node, 1)
      expect(heap.peek()).toBe(1)
    })

    it('decreases key with custom comparator', () => {
      const heap = new BootstrappedHeap<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      const node = heap.insert('banana')
      heap.decreaseKey(node, 'apple')
      expect(node.value).toBe('apple')
    })
  })

  describe('delete', () => {
    it('throws on empty heap', () => {
      const heap = new BootstrappedHeap<number>()
      const node: BootstrappedHeapNode<number> = { value: 1, id: 0, tree: null }
      expect(() => heap.delete(node)).toThrow('Heap is empty')
    })

    it('deletes a single element', () => {
      const heap = new BootstrappedHeap<number>()
      const node = heap.insert(5)
      heap.delete(node)
      expect(heap.size).toBe(0)
      expect(heap.isEmpty).toBe(true)
    })

    it('deletes a specific element from heap', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(1)
      const node = heap.insert(2)
      heap.insert(3)
      heap.delete(node)
      expect(heap.size).toBe(2)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(3)
    })

    it('deletes minimum element', () => {
      const heap = new BootstrappedHeap<number>()
      const node = heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.delete(node)
      expect(heap.peek()).toBe(2)
    })

    it('deletes with node having no tree reference', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(1)
      const orphanNode: BootstrappedHeapNode<number> = { value: 99, id: 999, tree: null }
      heap.delete(orphanNode)
      expect(heap.size).toBe(1)
    })
  })

  describe('size and isEmpty', () => {
    it('tracks size correctly', () => {
      const heap = new BootstrappedHeap<number>()
      expect(heap.size).toBe(0)
      heap.insert(1)
      expect(heap.size).toBe(1)
      heap.insert(2)
      expect(heap.size).toBe(2)
      heap.extractMin()
      expect(heap.size).toBe(1)
    })

    it('isEmpty reflects state', () => {
      const heap = new BootstrappedHeap<number>()
      expect(heap.isEmpty).toBe(true)
      heap.insert(1)
      expect(heap.isEmpty).toBe(false)
      heap.extractMin()
      expect(heap.isEmpty).toBe(true)
    })

    it('size is correct after many operations', () => {
      const heap = new BootstrappedHeap<number>()
      for (let i = 0; i < 50; i++) heap.insert(i)
      expect(heap.size).toBe(50)
      for (let i = 0; i < 25; i++) heap.extractMin()
      expect(heap.size).toBe(25)
    })
  })

  describe('clear', () => {
    it('clears an empty heap', () => {
      const heap = new BootstrappedHeap<number>()
      heap.clear()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty).toBe(true)
    })

    it('clears a non-empty heap', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.clear()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty).toBe(true)
    })

    it('allows operations after clear', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(1)
      heap.clear()
      heap.insert(2)
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(2)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty heap', () => {
      const heap = new BootstrappedHeap<number>()
      expect(heap.toArray()).toEqual([])
    })

    it('returns array with single element', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(1)
      expect(heap.toArray()).toEqual([1])
    })

    it('returns all elements', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      const arr = heap.toArray()
      expect(arr.length).toBe(3)
      expect(arr).toContain(1)
      expect(arr).toContain(2)
      expect(arr).toContain(3)
    })

    it('does not modify heap', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.toArray()
      expect(heap.size).toBe(2)
    })
  })

  describe('toSortedArray', () => {
    it('returns empty array for empty heap', () => {
      const heap = new BootstrappedHeap<number>()
      expect(heap.toSortedArray()).toEqual([])
    })

    it('returns sorted array', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      expect(heap.toSortedArray()).toEqual([1, 2, 3])
    })

    it('does not modify heap', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      heap.toSortedArray()
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(1)
    })

    it('sorts many elements', () => {
      const heap = new BootstrappedHeap<number>()
      const values = [5, 3, 8, 1, 9, 2, 7, 4, 6]
      for (const v of values) heap.insert(v)
      expect(heap.toSortedArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })
  })

  describe('contains', () => {
    it('returns false for empty heap', () => {
      const heap = new BootstrappedHeap<number>()
      expect(heap.contains(1)).toBe(false)
    })

    it('returns true for existing value', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(5)
      expect(heap.contains(5)).toBe(true)
    })

    it('returns false for non-existing value', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(5)
      expect(heap.contains(10)).toBe(false)
    })

    it('finds values in multi-element heap', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      expect(heap.contains(1)).toBe(true)
      expect(heap.contains(2)).toBe(true)
      expect(heap.contains(3)).toBe(true)
      expect(heap.contains(4)).toBe(false)
    })
  })

  describe('clone', () => {
    it('clones an empty heap', () => {
      const heap = new BootstrappedHeap<number>()
      const cloned = heap.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty).toBe(true)
    })

    it('clones a non-empty heap', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      const cloned = heap.clone()
      expect(cloned.size).toBe(3)
      expect(cloned.peek()).toBe(1)
    })

    it('clone is independent', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(1)
      heap.insert(2)
      const cloned = heap.clone()
      cloned.extractMin()
      expect(heap.size).toBe(2)
      expect(cloned.size).toBe(1)
    })
  })

  describe('fromArray', () => {
    it('creates heap from empty array', () => {
      const heap = BootstrappedHeap.fromArray([])
      expect(heap.size).toBe(0)
    })

    it('creates heap from single element array', () => {
      const heap = BootstrappedHeap.fromArray([5])
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(5)
    })

    it('creates heap from multiple elements', () => {
      const heap = BootstrappedHeap.fromArray([3, 1, 2])
      expect(heap.size).toBe(3)
      expect(heap.toSortedArray()).toEqual([1, 2, 3])
    })

    it('creates heap with options', () => {
      const heap = BootstrappedHeap.fromArray([1, 2, 3], {
        comparator: (a, b) => b - a,
      })
      expect(heap.peek()).toBe(3)
    })
  })

  describe('static merge', () => {
    it('merges two heaps immutably', () => {
      const a = new BootstrappedHeap<number>()
      const b = new BootstrappedHeap<number>()
      a.insert(1)
      b.insert(2)
      const result = BootstrappedHeap.merge(a, b)
      expect(result.size).toBe(2)
      expect(a.size).toBe(1)
      expect(b.size).toBe(1)
    })

    it('merges empty heaps', () => {
      const a = new BootstrappedHeap<number>()
      const b = new BootstrappedHeap<number>()
      const result = BootstrappedHeap.merge(a, b)
      expect(result.size).toBe(0)
    })

    it('produces correct sorted output', () => {
      const a = new BootstrappedHeap<number>()
      const b = new BootstrappedHeap<number>()
      a.insert(1)
      a.insert(4)
      b.insert(2)
      b.insert(3)
      const result = BootstrappedHeap.merge(a, b)
      expect(result.toSortedArray()).toEqual([1, 2, 3, 4])
    })
  })

  describe('forEach', () => {
    it('iterates over empty heap', () => {
      const heap = new BootstrappedHeap<number>()
      const items: number[] = []
      heap.forEach((v) => items.push(v))
      expect(items).toEqual([])
    })

    it('iterates over all elements', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      const items: number[] = []
      heap.forEach((v) => items.push(v))
      expect(items.length).toBe(3)
    })

    it('does not modify heap', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.forEach(() => {})
      expect(heap.size).toBe(2)
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates over empty heap', () => {
      const heap = new BootstrappedHeap<number>()
      const items = [...heap]
      expect(items).toEqual([])
    })

    it('iterates over all elements', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      const items = [...heap]
      expect(items.length).toBe(3)
    })

    it('works with for...of', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(10)
      heap.insert(20)
      let sum = 0
      for (const item of heap) {
        sum += item
      }
      expect(sum).toBe(30)
    })
  })

  describe('generics', () => {
    it('works with strings', () => {
      const heap = new BootstrappedHeap<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      heap.insert('cherry')
      heap.insert('apple')
      heap.insert('banana')
      expect(heap.extractMin()).toBe('apple')
      expect(heap.extractMin()).toBe('banana')
      expect(heap.extractMin()).toBe('cherry')
    })

    it('works with objects', () => {
      interface Item {
        priority: number
        name: string
      }
      const heap = new BootstrappedHeap<Item>({
        comparator: (a, b) => a.priority - b.priority,
      })
      heap.insert({ priority: 3, name: 'low' })
      heap.insert({ priority: 1, name: 'high' })
      heap.insert({ priority: 2, name: 'medium' })
      expect(heap.extractMin().name).toBe('high')
      expect(heap.extractMin().name).toBe('medium')
      expect(heap.extractMin().name).toBe('low')
    })

    it('works with dates', () => {
      const heap = new BootstrappedHeap<Date>({
        comparator: (a, b) => a.getTime() - b.getTime(),
      })
      const d1 = new Date(2023, 0, 1)
      const d2 = new Date(2023, 0, 3)
      const d3 = new Date(2023, 0, 2)
      heap.insert(d1)
      heap.insert(d2)
      heap.insert(d3)
      expect(heap.extractMin()).toBe(d1)
      expect(heap.extractMin()).toBe(d3)
      expect(heap.extractMin()).toBe(d2)
    })

    it('works with custom types', () => {
      type Pair = [number, string]
      const heap = new BootstrappedHeap<Pair>({
        comparator: (a, b) => a[0] - b[0],
      })
      heap.insert([3, 'three'])
      heap.insert([1, 'one'])
      heap.insert([2, 'two'])
      expect(heap.extractMin()).toEqual([1, 'one'])
    })
  })

  describe('stress tests', () => {
    it('handles large number of insertions and extractions', () => {
      const heap = new BootstrappedHeap<number>()
      const n = 200
      for (let i = n - 1; i >= 0; i--) {
        heap.insert(i)
      }
      for (let i = 0; i < n; i++) {
        expect(heap.extractMin()).toBe(i)
      }
      expect(heap.isEmpty).toBe(true)
    })

    it('handles random insertions', () => {
      const heap = new BootstrappedHeap<number>()
      const values: number[] = []
      for (let i = 0; i < 100; i++) {
        const v = Math.floor(Math.random() * 1000)
        values.push(v)
        heap.insert(v)
      }
      values.sort((a, b) => a - b)
      for (const expected of values) {
        expect(heap.extractMin()).toBe(expected)
      }
    })

    it('handles alternating insert and extract', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(5)
      heap.insert(3)
      expect(heap.extractMin()).toBe(3)
      heap.insert(1)
      expect(heap.extractMin()).toBe(1)
      heap.insert(4)
      heap.insert(2)
      expect(heap.extractMin()).toBe(2)
      expect(heap.extractMin()).toBe(4)
      expect(heap.extractMin()).toBe(5)
    })

    it('handles merge followed by extraction', () => {
      const a = new BootstrappedHeap<number>()
      const b = new BootstrappedHeap<number>()
      for (let i = 0; i < 50; i++) a.insert(i * 2)
      for (let i = 0; i < 50; i++) b.insert(i * 2 + 1)
      a.merge(b)
      for (let i = 0; i < 100; i++) {
        expect(a.extractMin()).toBe(i)
      }
    })

    it('handles clear and reuse', () => {
      const heap = new BootstrappedHeap<number>()
      for (let i = 0; i < 50; i++) heap.insert(i)
      heap.clear()
      expect(heap.isEmpty).toBe(true)
      heap.insert(100)
      expect(heap.peek()).toBe(100)
      expect(heap.size).toBe(1)
    })

    it('handles repeated clone operations', () => {
      const heap = new BootstrappedHeap<number>()
      for (let i = 0; i < 20; i++) heap.insert(i)
      const c1 = heap.clone()
      const c2 = c1.clone()
      expect(c2.size).toBe(20)
      expect(c2.peek()).toBe(0)
    })

    it('handles fromArray with sorted input', () => {
      const heap = BootstrappedHeap.fromArray(
        Array.from({ length: 50 }, (_, i) => i)
      )
      expect(heap.size).toBe(50)
      expect(heap.toSortedArray()).toEqual(
        Array.from({ length: 50 }, (_, i) => i)
      )
    })

    it('handles fromArray with reverse sorted input', () => {
      const heap = BootstrappedHeap.fromArray(
        Array.from({ length: 50 }, (_, i) => 49 - i)
      )
      expect(heap.size).toBe(50)
      expect(heap.peek()).toBe(0)
    })

    it('handles decreaseKey on multiple nodes', () => {
      const heap = new BootstrappedHeap<number>()
      const n1 = heap.insert(10)
      const n2 = heap.insert(20)
      const n3 = heap.insert(30)
      heap.decreaseKey(n3, 1)
      expect(heap.peek()).toBe(1)
      heap.decreaseKey(n2, 5)
      heap.decreaseKey(n1, 3)
      expect(heap.toSortedArray()).toEqual([1, 3, 5])
    })
  })

  describe('edge cases', () => {
    it('handles single element heap operations', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(42)
      expect(heap.peek()).toBe(42)
      expect(heap.toArray()).toEqual([42])
      expect(heap.toSortedArray()).toEqual([42])
      expect(heap.contains(42)).toBe(true)
      expect(heap.contains(1)).toBe(false)
      expect(heap.extractMin()).toBe(42)
      expect(heap.isEmpty).toBe(true)
    })

    it('handles two element heap', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(2)
      heap.insert(1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(2)
    })

    it('handles equal elements', () => {
      const heap = new BootstrappedHeap<number>()
      for (let i = 0; i < 10; i++) heap.insert(5)
      expect(heap.size).toBe(10)
      for (let i = 0; i < 10; i++) {
        expect(heap.extractMin()).toBe(5)
      }
    })

    it('handles very large values', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(Number.MAX_SAFE_INTEGER)
      heap.insert(Number.MIN_SAFE_INTEGER)
      heap.insert(0)
      expect(heap.extractMin()).toBe(Number.MIN_SAFE_INTEGER)
      expect(heap.extractMin()).toBe(0)
      expect(heap.extractMin()).toBe(Number.MAX_SAFE_INTEGER)
    })

    it('handles Infinity', () => {
      const heap = new BootstrappedHeap<number>()
      heap.insert(Infinity)
      heap.insert(-Infinity)
      heap.insert(0)
      expect(heap.extractMin()).toBe(-Infinity)
      expect(heap.extractMin()).toBe(0)
      expect(heap.extractMin()).toBe(Infinity)
    })

    it('handles merge of large then extract all', () => {
      const a = new BootstrappedHeap<number>()
      const b = new BootstrappedHeap<number>()
      for (let i = 0; i < 100; i++) {
        if (i % 2 === 0) a.insert(i)
        else b.insert(i)
      }
      a.merge(b)
      expect(a.size).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(a.extractMin()).toBe(i)
      }
    })

    it('handles multiple merges sequentially', () => {
      const main = new BootstrappedHeap<number>()
      for (let round = 0; round < 5; round++) {
        const other = new BootstrappedHeap<number>()
        for (let i = 0; i < 10; i++) {
          other.insert(round * 10 + i)
        }
        main.merge(other)
      }
      expect(main.size).toBe(50)
      for (let i = 0; i < 50; i++) {
        expect(main.extractMin()).toBe(i)
      }
    })
  })
})
