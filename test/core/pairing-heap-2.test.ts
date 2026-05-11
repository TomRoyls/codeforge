import { describe, it, expect } from 'vitest'
import { PairingHeap2 } from '../../src/core/pairing-heap-2/index.js'
import type { Comparator, PairingHeap2Node } from '../../src/core/pairing-heap-2/types.js'

const reverseComparator: Comparator<number> = (a, b) => b - a
const stringComparator: Comparator<string> = (a, b) => a.localeCompare(b)
const absComparator: Comparator<number> = (a, b) => Math.abs(a) - Math.abs(b)

describe('PairingHeap2', () => {
  describe('constructor', () => {
    it('creates empty heap with no arguments', () => {
      const heap = new PairingHeap2<number>()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty).toBe(true)
    })

    it('creates empty heap with empty options', () => {
      const heap = new PairingHeap2<number>({})
      expect(heap.size).toBe(0)
      expect(heap.isEmpty).toBe(true)
    })

    it('creates heap with custom comparator', () => {
      const heap = new PairingHeap2<number>({ comparator: reverseComparator })
      heap.insert(1)
      heap.insert(5)
      heap.insert(3)
      expect(heap.peek()).toBe(5)
    })

    it('creates heap with default comparator', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      expect(heap.peek()).toBe(1)
    })
  })

  describe('push / insert', () => {
    it('insert returns a node handle', () => {
      const heap = new PairingHeap2<number>()
      const node = heap.insert(5)
      expect(node).toBeDefined()
      expect(node.value).toBe(5)
    })

    it('push returns a node handle', () => {
      const heap = new PairingHeap2<number>()
      const node = heap.push(5)
      expect(node).toBeDefined()
      expect(node.value).toBe(5)
    })

    it('push and insert are aliases', () => {
      const heap = new PairingHeap2<number>()
      const n1 = heap.push(1)
      const n2 = heap.insert(2)
      expect(n1.value).toBe(1)
      expect(n2.value).toBe(2)
      expect(heap.size).toBe(2)
    })

    it('inserts into empty heap', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(5)
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(5)
    })

    it('inserts smaller element as new root', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(10)
      heap.insert(5)
      expect(heap.peek()).toBe(5)
    })

    it('inserts larger element', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(1)
      heap.insert(100)
      expect(heap.peek()).toBe(1)
      expect(heap.size).toBe(2)
    })

    it('inserts duplicate elements', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(1)
      heap.insert(1)
      expect(heap.size).toBe(2)
    })

    it('inserts many elements', () => {
      const heap = new PairingHeap2<number>()
      for (let i = 50; i >= 0; i--) {
        heap.insert(i)
      }
      expect(heap.size).toBe(51)
      expect(heap.peek()).toBe(0)
    })

    it('inserts negative numbers', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(-5)
      heap.insert(-10)
      heap.insert(-1)
      expect(heap.peek()).toBe(-10)
    })

    it('inserts zero', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(0)
      heap.insert(1)
      heap.insert(-1)
      expect(heap.peek()).toBe(-1)
    })

    it('handles floating point numbers', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(3.14)
      heap.insert(1.41)
      heap.insert(2.72)
      expect(heap.peek()).toBeCloseTo(1.41)
    })

    it('handles string values', () => {
      const heap = new PairingHeap2<string>()
      heap.insert('cherry')
      heap.insert('apple')
      heap.insert('banana')
      expect(heap.peek()).toBe('apple')
    })
  })

  describe('pop', () => {
    it('throws on empty heap', () => {
      const heap = new PairingHeap2<number>()
      expect(() => heap.pop()).toThrow('pop called on empty heap')
    })

    it('pops single element', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(42)
      expect(heap.pop()).toBe(42)
      expect(heap.size).toBe(0)
      expect(heap.isEmpty).toBe(true)
    })

    it('pops elements in sorted order', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(1)
      heap.insert(4)
      heap.insert(2)
      const result: number[] = []
      while (!heap.isEmpty) {
        result.push(heap.pop())
      }
      expect(result).toEqual([1, 2, 3, 4, 5])
    })

    it('updates size after pop', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      expect(heap.size).toBe(3)
      heap.pop()
      expect(heap.size).toBe(2)
      heap.pop()
      expect(heap.size).toBe(1)
      heap.pop()
      expect(heap.size).toBe(0)
    })

    it('pops duplicate values correctly', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(2)
      heap.insert(1)
      heap.insert(2)
      heap.insert(1)
      expect(heap.pop()).toBe(1)
      expect(heap.pop()).toBe(1)
      expect(heap.pop()).toBe(2)
      expect(heap.pop()).toBe(2)
    })

    it('pops from large heap in order', () => {
      const heap = new PairingHeap2<number>()
      for (let i = 50; i >= 0; i--) {
        heap.insert(i)
      }
      for (let i = 0; i <= 50; i++) {
        expect(heap.pop()).toBe(i)
      }
    })

    it('works with custom comparator (max heap)', () => {
      const heap = new PairingHeap2<number>({ comparator: reverseComparator })
      heap.insert(1)
      heap.insert(5)
      heap.insert(3)
      expect(heap.pop()).toBe(5)
      expect(heap.pop()).toBe(3)
      expect(heap.pop()).toBe(1)
    })

    it('heap sort produces correct result', () => {
      const input = [42, 17, 23, 8, 91, 55, 3, 66, 1, 34]
      const heap = new PairingHeap2<number>()
      for (const v of input) heap.insert(v)
      const sorted: number[] = []
      while (!heap.isEmpty) sorted.push(heap.pop())
      expect(sorted).toEqual([...input].sort((a, b) => a - b))
    })
  })

  describe('peek', () => {
    it('throws on empty heap', () => {
      const heap = new PairingHeap2<number>()
      expect(() => heap.peek()).toThrow('peek called on empty heap')
    })

    it('returns minimum element', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(1)
      expect(heap.peek()).toBe(1)
    })

    it('does not remove element', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(1)
      heap.insert(2)
      heap.peek()
      expect(heap.size).toBe(2)
      expect(heap.peek()).toBe(1)
    })

    it('returns updated min after pop', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.pop()
      expect(heap.peek()).toBe(2)
    })

    it('returns updated min after insert of smaller element', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(5)
      heap.insert(10)
      heap.insert(1)
      expect(heap.peek()).toBe(1)
    })

    it('returns same min after insert of larger element', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(1)
      heap.insert(100)
      expect(heap.peek()).toBe(1)
    })
  })

  describe('size', () => {
    it('returns 0 for empty heap', () => {
      const heap = new PairingHeap2<number>()
      expect(heap.size).toBe(0)
    })

    it('returns correct size after inserts', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(1)
      expect(heap.size).toBe(1)
      heap.insert(2)
      expect(heap.size).toBe(2)
      heap.insert(3)
      expect(heap.size).toBe(3)
    })

    it('returns correct size after pops', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.pop()
      expect(heap.size).toBe(2)
      heap.pop()
      expect(heap.size).toBe(1)
    })

    it('returns 0 after clear', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(1)
      heap.insert(2)
      heap.clear()
      expect(heap.size).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new heap', () => {
      const heap = new PairingHeap2<number>()
      expect(heap.isEmpty).toBe(true)
    })

    it('returns false after insert', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(1)
      expect(heap.isEmpty).toBe(false)
    })

    it('returns true after popping all elements', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(1)
      heap.insert(2)
      heap.pop()
      heap.pop()
      expect(heap.isEmpty).toBe(true)
    })

    it('returns true after clear', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(1)
      heap.clear()
      expect(heap.isEmpty).toBe(true)
    })

    it('returns false after clear and insert', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(1)
      heap.clear()
      heap.insert(1)
      expect(heap.isEmpty).toBe(false)
    })
  })

  describe('clear', () => {
    it('clears empty heap without error', () => {
      const heap = new PairingHeap2<number>()
      heap.clear()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty).toBe(true)
    })

    it('clears non-empty heap', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.clear()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty).toBe(true)
    })

    it('allows operations after clear', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(1)
      heap.clear()
      heap.insert(10)
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(10)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty heap', () => {
      const heap = new PairingHeap2<number>()
      expect(heap.toArray()).toEqual([])
    })

    it('returns single element', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(42)
      expect(heap.toArray()).toEqual([42])
    })

    it('returns elements in sorted order', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(1)
      heap.insert(4)
      heap.insert(2)
      expect(heap.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('does not modify the heap', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      heap.toArray()
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(1)
    })

    it('handles duplicates', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(3)
      heap.insert(1)
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      expect(heap.toArray()).toEqual([1, 1, 2, 3, 3])
    })
  })

  describe('clone', () => {
    it('clones empty heap', () => {
      const heap = new PairingHeap2<number>()
      const cloned = heap.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty).toBe(true)
    })

    it('clones non-empty heap', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(1)
      const cloned = heap.clone()
      expect(cloned.size).toBe(3)
      expect(cloned.peek()).toBe(1)
    })

    it('returns independent copy', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      const cloned = heap.clone()
      heap.pop()
      expect(heap.size).toBe(2)
      expect(cloned.size).toBe(3)
    })

    it('cloned heap has same elements', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(1)
      heap.insert(4)
      heap.insert(2)
      const cloned = heap.clone()
      expect(cloned.toArray()).toEqual(heap.toArray())
    })

    it('preserves comparator in clone', () => {
      const heap = new PairingHeap2<number>({ comparator: reverseComparator })
      heap.insert(1)
      heap.insert(5)
      heap.insert(3)
      const cloned = heap.clone()
      expect(cloned.peek()).toBe(5)
      expect(cloned.toArray()).toEqual([5, 3, 1])
    })
  })

  describe('fromArray', () => {
    it('creates heap from array', () => {
      const heap = PairingHeap2.fromArray([5, 3, 1, 4, 2])
      expect(heap.size).toBe(5)
      expect(heap.peek()).toBe(1)
    })

    it('creates heap from empty array', () => {
      const heap = PairingHeap2.fromArray<number>([])
      expect(heap.size).toBe(0)
    })

    it('creates heap with custom comparator', () => {
      const heap = PairingHeap2.fromArray([1, 2, 3, 4, 5], { comparator: reverseComparator })
      expect(heap.peek()).toBe(5)
    })

    it('created heap produces correct sorted output', () => {
      const heap = PairingHeap2.fromArray([5, 3, 1, 4, 2])
      expect(heap.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('handles single element array', () => {
      const heap = PairingHeap2.fromArray([42])
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(42)
    })
  })

  describe('merge', () => {
    it('merges into empty heap', () => {
      const a = new PairingHeap2<number>()
      const b = new PairingHeap2<number>()
      b.insert(1)
      b.insert(2)
      b.insert(3)
      a.merge(b)
      expect(a.size).toBe(3)
      expect(a.peek()).toBe(1)
    })

    it('merges empty into non-empty', () => {
      const a = new PairingHeap2<number>()
      a.insert(1)
      const b = new PairingHeap2<number>()
      a.merge(b)
      expect(a.size).toBe(1)
      expect(a.peek()).toBe(1)
    })

    it('merges two non-empty heaps', () => {
      const a = new PairingHeap2<number>()
      a.insert(1)
      a.insert(3)
      a.insert(5)
      const b = new PairingHeap2<number>()
      b.insert(2)
      b.insert(4)
      b.insert(6)
      a.merge(b)
      expect(a.size).toBe(6)
      expect(a.toArray()).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('is destructive for other heap', () => {
      const a = new PairingHeap2<number>()
      a.insert(1)
      const b = new PairingHeap2<number>()
      b.insert(2)
      a.merge(b)
      expect(b.size).toBe(0)
      expect(b.isEmpty).toBe(true)
    })

    it('handles merging with itself (no-op)', () => {
      const a = new PairingHeap2<number>()
      a.insert(1)
      a.insert(2)
      a.merge(a)
      expect(a.size).toBe(2)
    })

    it('merge followed by pop produces correct order', () => {
      const a = new PairingHeap2<number>()
      a.insert(4)
      a.insert(1)
      a.insert(7)
      const b = new PairingHeap2<number>()
      b.insert(3)
      b.insert(6)
      b.insert(2)
      a.merge(b)
      const result: number[] = []
      while (!a.isEmpty) result.push(a.pop())
      expect(result).toEqual([1, 2, 3, 4, 6, 7])
    })

    it('merges large heaps', () => {
      const a = new PairingHeap2<number>()
      for (let i = 0; i < 50; i++) a.insert(i * 2)
      const b = new PairingHeap2<number>()
      for (let i = 0; i < 50; i++) b.insert(i * 2 + 1)
      a.merge(b)
      expect(a.size).toBe(100)
      expect(a.peek()).toBe(0)
      for (let i = 0; i < 100; i++) {
        expect(a.pop()).toBe(i)
      }
    })
  })

  describe('decreaseKey', () => {
    it('decreases key of node', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(1)
      heap.insert(3)
      const node = heap.insert(5)
      heap.decreaseKey(node, 0)
      expect(heap.peek()).toBe(0)
    })

    it('decreases key to same value', () => {
      const heap = new PairingHeap2<number>()
      const node = heap.insert(3)
      heap.decreaseKey(node, 3)
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(3)
    })

    it('throws when new value is greater', () => {
      const heap = new PairingHeap2<number>()
      const node = heap.insert(1)
      expect(() => heap.decreaseKey(node, 5)).toThrow('New value is greater than current value')
    })

    it('maintains correct size after decrease', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(1)
      heap.insert(3)
      const node = heap.insert(5)
      heap.decreaseKey(node, 0)
      expect(heap.size).toBe(3)
    })

    it('produces correct sorted output after decrease', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(1)
      heap.insert(3)
      const node = heap.insert(5)
      heap.insert(2)
      heap.insert(4)
      heap.decreaseKey(node, 0)
      expect(heap.toArray()).toEqual([0, 1, 2, 3, 4])
    })

    it('decreaseKey on root node', () => {
      const heap = new PairingHeap2<number>()
      const root = heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.decreaseKey(root, 0)
      expect(heap.peek()).toBe(0)
    })

    it('multiple decreaseKey operations', () => {
      const heap = new PairingHeap2<number>()
      const n1 = heap.insert(10)
      const n2 = heap.insert(20)
      const n3 = heap.insert(30)
      heap.decreaseKey(n3, 1)
      heap.decreaseKey(n2, 2)
      heap.decreaseKey(n1, 3)
      expect(heap.toArray()).toEqual([1, 2, 3])
    })

    it('decreaseKey after merge', () => {
      const a = new PairingHeap2<number>()
      const node = a.insert(10)
      a.insert(5)
      const b = new PairingHeap2<number>()
      b.insert(3)
      b.insert(7)
      a.merge(b)
      heap_decreaseKey_after_merge_helper(a, node)
    })

    it('decreaseKey handle from another heap after merge works', () => {
      const a = new PairingHeap2<number>()
      a.insert(1)
      const b = new PairingHeap2<number>()
      const nodeB = b.insert(10)
      b.insert(5)
      a.merge(b)
      a.decreaseKey(nodeB, 0)
      expect(a.peek()).toBe(0)
    })
  })

  describe('delete', () => {
    it('deletes a specific node', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(1)
      const node = heap.insert(3)
      heap.insert(5)
      heap.delete(node)
      expect(heap.size).toBe(2)
      expect(heap.toArray()).toEqual([1, 5])
    })

    it('deletes root node', () => {
      const heap = new PairingHeap2<number>()
      const root = heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.delete(root)
      expect(heap.size).toBe(2)
      expect(heap.peek()).toBe(2)
    })

    it('deletes only element', () => {
      const heap = new PairingHeap2<number>()
      const node = heap.insert(42)
      heap.delete(node)
      expect(heap.isEmpty).toBe(true)
      expect(heap.size).toBe(0)
    })

    it('deletes multiple nodes', () => {
      const heap = new PairingHeap2<number>()
      const n1 = heap.insert(1)
      const n2 = heap.insert(2)
      const n3 = heap.insert(3)
      const n4 = heap.insert(4)
      const n5 = heap.insert(5)
      heap.delete(n3)
      heap.delete(n1)
      expect(heap.size).toBe(3)
      expect(heap.toArray()).toEqual([2, 4, 5])
      heap.delete(n5)
      expect(heap.size).toBe(2)
      expect(heap.toArray()).toEqual([2, 4])
    })

    it('delete on empty heap does nothing', () => {
      const heap = new PairingHeap2<number>()
      const node: PairingHeap2Node<number> = { value: 1, child: null, sibling: null, prev: null }
      heap.delete(node)
      expect(heap.size).toBe(0)
    })
  })

  describe('contains', () => {
    it('returns false for empty heap', () => {
      const heap = new PairingHeap2<number>()
      const node: PairingHeap2Node<number> = { value: 1, child: null, sibling: null, prev: null }
      expect(heap.contains(node)).toBe(false)
    })

    it('returns true for node in heap', () => {
      const heap = new PairingHeap2<number>()
      const node = heap.insert(5)
      expect(heap.contains(node)).toBe(true)
    })

    it('returns true for root node', () => {
      const heap = new PairingHeap2<number>()
      const root = heap.insert(1)
      expect(heap.contains(root)).toBe(true)
    })

    it('returns false for node from another heap', () => {
      const a = new PairingHeap2<number>()
      a.insert(1)
      const b = new PairingHeap2<number>()
      const nodeB = b.insert(2)
      expect(a.contains(nodeB)).toBe(false)
    })

    it('returns false after node deleted', () => {
      const heap = new PairingHeap2<number>()
      const node = heap.insert(5)
      heap.insert(1)
      heap.delete(node)
      expect(heap.contains(node)).toBe(false)
    })

    it('returns false after clear', () => {
      const heap = new PairingHeap2<number>()
      const node = heap.insert(5)
      heap.clear()
      expect(heap.contains(node)).toBe(false)
    })

    it('returns false after node popped', () => {
      const heap = new PairingHeap2<number>()
      const node = heap.insert(1)
      heap.pop()
      expect(heap.contains(node)).toBe(false)
    })

    it('returns true for node after merge', () => {
      const a = new PairingHeap2<number>()
      a.insert(1)
      const b = new PairingHeap2<number>()
      const nodeB = b.insert(2)
      a.merge(b)
      expect(a.contains(nodeB)).toBe(true)
    })
  })

  describe('update', () => {
    it('updates to smaller value', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(1)
      const node = heap.insert(5)
      heap.update(node, 0)
      expect(heap.peek()).toBe(0)
    })

    it('updates to larger value', () => {
      const heap = new PairingHeap2<number>()
      const node = heap.insert(1)
      heap.insert(3)
      heap.insert(5)
      heap.update(node, 10)
      expect(heap.peek()).toBe(3)
    })

    it('updates to same value', () => {
      const heap = new PairingHeap2<number>()
      const node = heap.insert(3)
      heap.update(node, 3)
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(3)
    })

    it('maintains correct size after update', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(1)
      const node = heap.insert(5)
      heap.insert(3)
      heap.update(node, 0)
      expect(heap.size).toBe(3)
    })
  })

  describe('isValid', () => {
    it('empty heap is valid', () => {
      const heap = new PairingHeap2<number>()
      expect(heap.isValid()).toBe(true)
    })

    it('single element heap is valid', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(1)
      expect(heap.isValid()).toBe(true)
    })

    it('heap after construction is valid', () => {
      const heap = PairingHeap2.fromArray([5, 3, 7, 1, 4, 6, 2])
      expect(heap.isValid()).toBe(true)
    })

    it('heap after inserts is valid', () => {
      const heap = new PairingHeap2<number>()
      for (let i = 10; i >= 1; i--) heap.insert(i)
      expect(heap.isValid()).toBe(true)
    })

    it('heap after pops is valid', () => {
      const heap = PairingHeap2.fromArray([5, 3, 7, 1, 4, 6, 2])
      for (let i = 0; i < 5; i++) {
        heap.pop()
        expect(heap.isValid()).toBe(true)
      }
    })
  })

  describe('forEach', () => {
    it('does not call callback on empty heap', () => {
      const heap = new PairingHeap2<number>()
      let count = 0
      heap.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('calls callback for each element', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      let count = 0
      heap.forEach(() => { count++ })
      expect(count).toBe(3)
    })

    it('provides correct index', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      const indices: number[] = []
      heap.forEach((_, idx) => { indices.push(idx) })
      expect(indices).toEqual([0, 1, 2])
    })

    it('provides correct values in order', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      const values: number[] = []
      heap.forEach((v) => { values.push(v) })
      expect(values).toEqual([1, 2, 3])
    })

    it('does not modify heap', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(1)
      heap.insert(2)
      heap.forEach(() => {})
      expect(heap.size).toBe(2)
      expect(heap.peek()).toBe(1)
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates over empty heap', () => {
      const heap = new PairingHeap2<number>()
      expect([...heap]).toEqual([])
    })

    it('iterates in sorted order', () => {
      const heap = PairingHeap2.fromArray([5, 3, 1, 4, 2])
      expect([...heap]).toEqual([1, 2, 3, 4, 5])
    })

    it('does not modify heap', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      ;[...heap]
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(1)
    })

    it('works with for...of', () => {
      const heap = PairingHeap2.fromArray([3, 1, 2])
      const result: number[] = []
      for (const val of heap) result.push(val)
      expect(result).toEqual([1, 2, 3])
    })

    it('can be used multiple times', () => {
      const heap = PairingHeap2.fromArray([3, 1, 2])
      expect([...heap]).toEqual([1, 2, 3])
      expect([...heap]).toEqual([1, 2, 3])
    })
  })

  describe('pushPop', () => {
    it('returns pushed value when heap is empty', () => {
      const heap = new PairingHeap2<number>()
      expect(heap.pushPop(5)).toBe(5)
      expect(heap.isEmpty).toBe(true)
    })

    it('pushes then pops minimum', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(3)
      heap.insert(1)
      heap.insert(5)
      expect(heap.pushPop(2)).toBe(1)
      expect(heap.size).toBe(3)
    })

    it('returns new value if it is minimum', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(5)
      heap.insert(10)
      expect(heap.pushPop(1)).toBe(1)
    })

    it('maintains heap property', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(3)
      heap.insert(1)
      heap.insert(5)
      heap.pushPop(2)
      expect(heap.isValid()).toBe(true)
    })

    it('does not change size', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(1)
      heap.insert(2)
      heap.pushPop(3)
      expect(heap.size).toBe(2)
    })
  })

  describe('replacePeek', () => {
    it('throws on empty heap', () => {
      const heap = new PairingHeap2<number>()
      expect(() => heap.replacePeek(5)).toThrow('replacePeek called on empty heap')
    })

    it('replaces root with smaller value', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(1)
      const old = heap.replacePeek(0)
      expect(old).toBe(1)
      expect(heap.peek()).toBe(0)
    })

    it('replaces root with larger value', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(1)
      const old = heap.replacePeek(10)
      expect(old).toBe(1)
      expect(heap.peek()).toBe(3)
    })

    it('maintains correct size', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(1)
      heap.replacePeek(2)
      expect(heap.size).toBe(3)
    })

    it('maintains heap property', () => {
      const heap = PairingHeap2.fromArray([5, 3, 7, 1, 4, 6, 2])
      heap.replacePeek(10)
      expect(heap.isValid()).toBe(true)
    })

    it('returns correct sorted output after replace', () => {
      const heap = PairingHeap2.fromArray([5, 3, 1, 4, 2])
      heap.replacePeek(0)
      expect(heap.toArray()).toEqual([0, 2, 3, 4, 5])
    })
  })

  describe('decreaseKeyOrDefault', () => {
    it('decreases key and returns true on success', () => {
      const heap = new PairingHeap2<number>()
      const node = heap.insert(5)
      expect(heap.decreaseKeyOrDefault(node, 1)).toBe(true)
      expect(heap.peek()).toBe(1)
    })

    it('returns false when new value is greater', () => {
      const heap = new PairingHeap2<number>()
      const node = heap.insert(5)
      expect(heap.decreaseKeyOrDefault(node, 10)).toBe(false)
      expect(heap.peek()).toBe(5)
    })

    it('returns false when node not in heap', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(1)
      const orphan: PairingHeap2Node<number> = { value: 5, child: null, sibling: null, prev: null }
      expect(heap.decreaseKeyOrDefault(orphan, 1)).toBe(false)
    })

    it('returns false on empty heap', () => {
      const heap = new PairingHeap2<number>()
      const node: PairingHeap2Node<number> = { value: 5, child: null, sibling: null, prev: null }
      expect(heap.decreaseKeyOrDefault(node, 1)).toBe(false)
    })
  })

  describe('custom comparator', () => {
    it('works as max heap with reverse comparator', () => {
      const heap = new PairingHeap2<number>({ comparator: reverseComparator })
      heap.insert(1)
      heap.insert(5)
      heap.insert(3)
      heap.insert(2)
      heap.insert(4)
      expect(heap.toArray()).toEqual([5, 4, 3, 2, 1])
    })

    it('works with absolute value comparator', () => {
      const heap = new PairingHeap2<number>({ comparator: absComparator })
      heap.insert(-5)
      heap.insert(3)
      heap.insert(-1)
      heap.insert(4)
      heap.insert(-2)
      expect(heap.pop()).toBe(-1)
      expect(heap.pop()).toBe(-2)
      expect(heap.pop()).toBe(3)
    })

    it('works with string comparator', () => {
      const heap = new PairingHeap2<string>({ comparator: stringComparator })
      heap.insert('cherry')
      heap.insert('apple')
      heap.insert('banana')
      expect(heap.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('works with object comparator', () => {
      interface Item { priority: number; name: string }
      const cmp: Comparator<Item> = (a, b) => a.priority - b.priority
      const heap = new PairingHeap2<Item>({ comparator: cmp })
      heap.insert({ priority: 3, name: 'low' })
      heap.insert({ priority: 1, name: 'high' })
      heap.insert({ priority: 2, name: 'medium' })
      expect(heap.pop().name).toBe('high')
      expect(heap.pop().name).toBe('medium')
      expect(heap.pop().name).toBe('low')
    })
  })

  describe('edge cases', () => {
    it('handles alternating insert and pop', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(5)
      heap.insert(3)
      expect(heap.pop()).toBe(3)
      heap.insert(1)
      heap.insert(7)
      expect(heap.pop()).toBe(1)
      expect(heap.pop()).toBe(5)
      expect(heap.pop()).toBe(7)
      expect(heap.isEmpty).toBe(true)
    })

    it('handles large number of elements', () => {
      const heap = new PairingHeap2<number>()
      for (let i = 1000; i >= 0; i--) heap.insert(i)
      expect(heap.size).toBe(1001)
      expect(heap.peek()).toBe(0)
      expect(heap.pop()).toBe(0)
      expect(heap.peek()).toBe(1)
    })

    it('handles sorted input', () => {
      const heap = PairingHeap2.fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      expect(heap.isValid()).toBe(true)
      expect(heap.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('handles reverse sorted input', () => {
      const heap = PairingHeap2.fromArray([10, 9, 8, 7, 6, 5, 4, 3, 2, 1])
      expect(heap.isValid()).toBe(true)
      expect(heap.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('handles same element repeated', () => {
      const heap = PairingHeap2.fromArray([5, 5, 5, 5, 5])
      expect(heap.size).toBe(5)
      expect(heap.toArray()).toEqual([5, 5, 5, 5, 5])
    })

    it('handles negative numbers', () => {
      const heap = PairingHeap2.fromArray([-5, -1, -3, -2, -4])
      expect(heap.toArray()).toEqual([-5, -4, -3, -2, -1])
    })

    it('handles mixed positive and negative', () => {
      const heap = PairingHeap2.fromArray([-3, 5, -1, 2, 0, -4, 3])
      expect(heap.toArray()).toEqual([-4, -3, -1, 0, 2, 3, 5])
    })

    it('handles clear and rebuild', () => {
      const heap = PairingHeap2.fromArray([5, 3, 1, 4, 2])
      heap.clear()
      expect(heap.isEmpty).toBe(true)
      heap.insert(10)
      heap.insert(20)
      heap.insert(30)
      expect(heap.toArray()).toEqual([10, 20, 30])
    })

    it('handles chaining operations', () => {
      const heap = new PairingHeap2<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      const min1 = heap.pop()
      heap.insert(1)
      heap.insert(6)
      const min2 = heap.pop()
      expect(min1).toBe(3)
      expect(min2).toBe(1)
      expect(heap.toArray()).toEqual([5, 6, 7])
    })

    it('clone followed by operations on original', () => {
      const heap = PairingHeap2.fromArray([1, 2, 3, 4, 5])
      const cloned = heap.clone()
      heap.pop()
      heap.insert(0)
      expect(cloned.toArray()).toEqual([1, 2, 3, 4, 5])
      expect(heap.toArray()).toEqual([0, 2, 3, 4, 5])
    })

    it('decreaseKey after merge on merged node', () => {
      const a = new PairingHeap2<number>()
      a.insert(1)
      const b = new PairingHeap2<number>()
      const nodeB = b.insert(10)
      b.insert(5)
      a.merge(b)
      a.decreaseKey(nodeB, 0)
      expect(a.peek()).toBe(0)
      expect(a.toArray()).toEqual([0, 1, 5])
    })

    it('delete after merge', () => {
      const a = new PairingHeap2<number>()
      a.insert(1)
      a.insert(5)
      const b = new PairingHeap2<number>()
      const nodeB = b.insert(3)
      b.insert(7)
      a.merge(b)
      a.delete(nodeB)
      expect(a.toArray()).toEqual([1, 5, 7])
    })

    it('multiple merges', () => {
      const a = new PairingHeap2<number>()
      a.insert(1)
      const b = new PairingHeap2<number>()
      b.insert(2)
      const c = new PairingHeap2<number>()
      c.insert(0)
      a.merge(b)
      a.merge(c)
      expect(a.toArray()).toEqual([0, 1, 2])
    })

    it('handles merge with two empty heaps', () => {
      const a = new PairingHeap2<number>()
      const b = new PairingHeap2<number>()
      a.merge(b)
      expect(a.size).toBe(0)
      expect(a.isEmpty).toBe(true)
    })

    it('insert after merge', () => {
      const a = new PairingHeap2<number>()
      a.insert(3)
      const b = new PairingHeap2<number>()
      b.insert(1)
      a.merge(b)
      a.insert(0)
      expect(a.peek()).toBe(0)
      expect(a.toArray()).toEqual([0, 1, 3])
    })

    it('pushPop with many elements', () => {
      const heap = new PairingHeap2<number>()
      for (let i = 10; i >= 1; i--) heap.insert(i)
      const result = heap.pushPop(0)
      expect(result).toBe(0)
      expect(heap.size).toBe(10)
    })

    it('replacePeek with same value', () => {
      const heap = PairingHeap2.fromArray([1, 2, 3])
      const old = heap.replacePeek(1)
      expect(old).toBe(1)
      expect(heap.peek()).toBe(1)
    })

    it('handles 500 elements', () => {
      const heap = new PairingHeap2<number>()
      for (let i = 500; i >= 0; i--) heap.insert(i)
      expect(heap.size).toBe(501)
      for (let i = 0; i <= 500; i++) {
        expect(heap.pop()).toBe(i)
      }
      expect(heap.isEmpty).toBe(true)
    })

    it('handles random input sorted correctly', () => {
      const input = Array.from({ length: 100 }, () => Math.floor(Math.random() * 1000))
      const heap = PairingHeap2.fromArray(input)
      const sorted = heap.toArray()
      expect(sorted).toEqual([...input].sort((a, b) => a - b))
    })

    it('decreaseKey preserves all elements', () => {
      const heap = new PairingHeap2<number>()
      const nodes: PairingHeap2Node<number>[] = []
      for (let i = 1; i <= 10; i++) {
        nodes.push(heap.insert(i * 10))
      }
      heap.decreaseKey(nodes[9]!, 1)
      expect(heap.size).toBe(10)
      expect(heap.toArray().length).toBe(10)
    })
  })
})

function heap_decreaseKey_after_merge_helper(heap: PairingHeap2<number>, node: PairingHeap2Node<number>): void {
  heap.decreaseKey(node, 1)
  expect(heap.peek()).toBe(1)
}
