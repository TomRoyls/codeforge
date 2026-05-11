import { describe, it, expect } from 'vitest'
import { DAryHeap } from '../../src/core/d-ary-heap/index.js'
import type { DAryHeapOptions } from '../../src/core/d-ary-heap/index.js'

const maxComparator = (a: number, b: number): number => b - a
const stringComparator = (a: string, b: string): number => a.localeCompare(b)

function isMinHeapValid(heap: DAryHeap<number>): boolean {
  const arr = heap.toArray()
  const arity = 4
  for (let i = 0; i < arr.length; i++) {
    const firstChild = arity * i + 1
    for (let c = 0; c < arity; c++) {
      const childIdx = firstChild + c
      if (childIdx < arr.length && arr[i]! > arr[childIdx]!) {
        return false
      }
    }
  }
  return true
}

function isValidForArity(heap: DAryHeap<number>, arity: number): boolean {
  const arr = heap.toArray()
  for (let i = 0; i < arr.length; i++) {
    const firstChild = arity * i + 1
    for (let c = 0; c < arity; c++) {
      const childIdx = firstChild + c
      if (childIdx < arr.length && arr[i]! > arr[childIdx]!) {
        return false
      }
    }
  }
  return true
}

describe('DAryHeap', () => {
  describe('constructor', () => {
    it('creates empty heap with defaults', () => {
      const heap = new DAryHeap()
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('creates heap with custom arity 2', () => {
      const heap = new DAryHeap<number>({ arity: 2 })
      heap.push(5)
      heap.push(3)
      heap.push(7)
      expect(heap.pop()).toBe(3)
    })

    it('creates heap with custom arity 3', () => {
      const heap = new DAryHeap<number>({ arity: 3 })
      heap.push(5)
      heap.push(3)
      heap.push(7)
      expect(heap.pop()).toBe(3)
    })

    it('creates heap with custom arity 5', () => {
      const heap = new DAryHeap<number>({ arity: 5 })
      for (let i = 10; i >= 1; i--) heap.push(i)
      expect(heap.pop()).toBe(1)
    })

    it('creates heap with custom arity 8', () => {
      const heap = new DAryHeap<number>({ arity: 8 })
      for (let i = 20; i >= 1; i--) heap.push(i)
      expect(heap.pop()).toBe(1)
    })

    it('creates heap with custom comparator (max-heap)', () => {
      const heap = new DAryHeap<number>({ comparator: maxComparator })
      heap.push(5)
      heap.push(3)
      heap.push(7)
      expect(heap.pop()).toBe(7)
    })

    it('creates heap with both arity and comparator', () => {
      const heap = new DAryHeap<number>({ arity: 3, comparator: maxComparator })
      heap.push(1)
      heap.push(5)
      heap.push(3)
      expect(heap.pop()).toBe(5)
    })

    it('creates heap with string comparator', () => {
      const heap = new DAryHeap<string>({ comparator: stringComparator })
      heap.push('cherry')
      heap.push('apple')
      heap.push('banana')
      expect(heap.pop()).toBe('apple')
    })
  })

  describe('push and pop', () => {
    it('pushes and pops a single element', () => {
      const heap = new DAryHeap<number>()
      heap.push(42)
      expect(heap.size()).toBe(1)
      expect(heap.pop()).toBe(42)
      expect(heap.size()).toBe(0)
    })

    it('maintains min-heap property with multiple pushes', () => {
      const heap = new DAryHeap<number>()
      heap.push(5)
      heap.push(3)
      heap.push(7)
      heap.push(1)
      heap.push(4)
      expect(heap.pop()).toBe(1)
      expect(heap.pop()).toBe(3)
      expect(heap.pop()).toBe(4)
      expect(heap.pop()).toBe(5)
      expect(heap.pop()).toBe(7)
    })

    it('maintains max-heap property with custom comparator', () => {
      const heap = new DAryHeap<number>({ comparator: maxComparator })
      heap.push(5)
      heap.push(3)
      heap.push(7)
      heap.push(1)
      expect(heap.pop()).toBe(7)
      expect(heap.pop()).toBe(5)
      expect(heap.pop()).toBe(3)
      expect(heap.pop()).toBe(1)
    })

    it('handles duplicate values', () => {
      const heap = new DAryHeap<number>()
      heap.push(3)
      heap.push(3)
      heap.push(3)
      expect(heap.pop()).toBe(3)
      expect(heap.pop()).toBe(3)
      expect(heap.pop()).toBe(3)
    })

    it('handles negative numbers', () => {
      const heap = new DAryHeap<number>()
      heap.push(-5)
      heap.push(3)
      heap.push(-1)
      heap.push(0)
      expect(heap.pop()).toBe(-5)
      expect(heap.pop()).toBe(-1)
      expect(heap.pop()).toBe(0)
      expect(heap.pop()).toBe(3)
    })

    it('handles floating point numbers', () => {
      const heap = new DAryHeap<number>()
      heap.push(1.5)
      heap.push(0.3)
      heap.push(2.7)
      expect(heap.pop()).toBe(0.3)
      expect(heap.pop()).toBe(1.5)
      expect(heap.pop()).toBe(2.7)
    })

    it('pops all elements in sorted order', () => {
      const heap = new DAryHeap<number>()
      const items = [9, 3, 7, 1, 8, 2, 6, 5, 4]
      for (const item of items) heap.push(item)
      const result: number[] = []
      while (!heap.isEmpty()) result.push(heap.pop())
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('throws when popping from empty heap', () => {
      const heap = new DAryHeap<number>()
      expect(() => heap.pop()).toThrow('Heap is empty')
    })

    it('pushes many elements and maintains heap property', () => {
      const heap = new DAryHeap<number>()
      for (let i = 100; i >= 1; i--) heap.push(i)
      expect(heap.size()).toBe(100)
      expect(heap.peek()).toBe(1)
      expect(isMinHeapValid(heap)).toBe(true)
    })
  })

  describe('peek', () => {
    it('returns the minimum element without removing', () => {
      const heap = new DAryHeap<number>()
      heap.push(5)
      heap.push(3)
      heap.push(7)
      expect(heap.peek()).toBe(3)
      expect(heap.size()).toBe(3)
    })

    it('returns the only element', () => {
      const heap = new DAryHeap<number>()
      heap.push(42)
      expect(heap.peek()).toBe(42)
    })

    it('throws when peeking empty heap', () => {
      const heap = new DAryHeap<number>()
      expect(() => heap.peek()).toThrow('Heap is empty')
    })

    it('updates correctly after pushes and pops', () => {
      const heap = new DAryHeap<number>()
      heap.push(10)
      heap.push(5)
      heap.push(8)
      expect(heap.peek()).toBe(5)
      heap.pop()
      expect(heap.peek()).toBe(8)
      heap.pop()
      expect(heap.peek()).toBe(10)
    })
  })

  describe('pushPop', () => {
    it('returns item when heap is empty', () => {
      const heap = new DAryHeap<number>()
      expect(heap.pushPop(5)).toBe(5)
      expect(heap.size()).toBe(1)
    })

    it('returns new item if it is less than or equal to top', () => {
      const heap = new DAryHeap<number>()
      heap.push(10)
      expect(heap.pushPop(5)).toBe(5)
      expect(heap.peek()).toBe(10)
    })

    it('returns top when new item is greater', () => {
      const heap = new DAryHeap<number>()
      heap.push(5)
      expect(heap.pushPop(10)).toBe(5)
      expect(heap.peek()).toBe(10)
    })

    it('is more efficient than separate push then pop', () => {
      const heap = new DAryHeap<number>()
      heap.push(10)
      heap.push(20)
      heap.push(30)
      const result = heap.pushPop(25)
      expect(result).toBe(10)
      expect(heap.size()).toBe(3)
    })

    it('handles equal elements', () => {
      const heap = new DAryHeap<number>()
      heap.push(5)
      expect(heap.pushPop(5)).toBe(5)
      expect(heap.size()).toBe(1)
    })

    it('works with max-heap', () => {
      const heap = new DAryHeap<number>({ comparator: maxComparator })
      heap.push(10)
      heap.push(20)
      expect(heap.pushPop(15)).toBe(20)
      expect(heap.peek()).toBe(15)
    })
  })

  describe('popPush', () => {
    it('pops top and pushes new item', () => {
      const heap = new DAryHeap<number>()
      heap.push(5)
      heap.push(10)
      const result = heap.popPush(3)
      expect(result).toBe(5)
      expect(heap.peek()).toBe(3)
    })

    it('throws on empty heap', () => {
      const heap = new DAryHeap<number>()
      expect(() => heap.popPush(5)).toThrow('Heap is empty')
    })

    it('maintains heap property after popPush', () => {
      const heap = new DAryHeap<number>()
      heap.push(10)
      heap.push(20)
      heap.push(30)
      heap.popPush(25)
      expect(heap.size()).toBe(3)
      expect(isMinHeapValid(heap)).toBe(true)
    })

    it('works when new item becomes the new top', () => {
      const heap = new DAryHeap<number>()
      heap.push(10)
      heap.push(20)
      const result = heap.popPush(5)
      expect(result).toBe(10)
      expect(heap.peek()).toBe(5)
    })
  })

  describe('replace', () => {
    it('behaves same as popPush', () => {
      const heap = new DAryHeap<number>()
      heap.push(5)
      heap.push(10)
      const result = heap.replace(3)
      expect(result).toBe(5)
      expect(heap.peek()).toBe(3)
    })

    it('throws on empty heap', () => {
      const heap = new DAryHeap<number>()
      expect(() => heap.replace(5)).toThrow('Heap is empty')
    })

    it('maintains heap property', () => {
      const heap = new DAryHeap<number>()
      for (let i = 1; i <= 10; i++) heap.push(i)
      heap.replace(0)
      expect(heap.peek()).toBe(0)
      expect(isMinHeapValid(heap)).toBe(true)
    })
  })

  describe('size and isEmpty', () => {
    it('returns 0 for empty heap', () => {
      const heap = new DAryHeap<number>()
      expect(heap.size()).toBe(0)
    })

    it('returns correct size after pushes', () => {
      const heap = new DAryHeap<number>()
      heap.push(1)
      heap.push(2)
      heap.push(3)
      expect(heap.size()).toBe(3)
    })

    it('returns correct size after pops', () => {
      const heap = new DAryHeap<number>()
      heap.push(1)
      heap.push(2)
      heap.push(3)
      heap.pop()
      expect(heap.size()).toBe(2)
    })

    it('isEmpty returns true for new heap', () => {
      const heap = new DAryHeap<number>()
      expect(heap.isEmpty()).toBe(true)
    })

    it('isEmpty returns false after push', () => {
      const heap = new DAryHeap<number>()
      heap.push(1)
      expect(heap.isEmpty()).toBe(false)
    })

    it('isEmpty returns true after popping all elements', () => {
      const heap = new DAryHeap<number>()
      heap.push(1)
      heap.push(2)
      heap.pop()
      heap.pop()
      expect(heap.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears all elements', () => {
      const heap = new DAryHeap<number>()
      heap.push(1)
      heap.push(2)
      heap.push(3)
      heap.clear()
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('allows operations after clear', () => {
      const heap = new DAryHeap<number>()
      heap.push(1)
      heap.clear()
      heap.push(5)
      expect(heap.size()).toBe(1)
      expect(heap.peek()).toBe(5)
    })

    it('clear on empty heap is no-op', () => {
      const heap = new DAryHeap<number>()
      heap.clear()
      expect(heap.size()).toBe(0)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty heap', () => {
      const heap = new DAryHeap<number>()
      expect(heap.toArray()).toEqual([])
    })

    it('returns heap-ordered array', () => {
      const heap = new DAryHeap<number>()
      heap.push(5)
      heap.push(3)
      heap.push(7)
      const arr = heap.toArray()
      expect(arr.length).toBe(3)
      expect(arr[0]).toBe(3)
    })

    it('returns a copy, not internal array', () => {
      const heap = new DAryHeap<number>()
      heap.push(1)
      const arr = heap.toArray()
      arr[0] = 999
      expect(heap.peek()).toBe(1)
    })
  })

  describe('toSortedArray', () => {
    it('returns empty array for empty heap', () => {
      const heap = new DAryHeap<number>()
      expect(heap.toSortedArray()).toEqual([])
    })

    it('returns sorted array (ascending for min-heap)', () => {
      const heap = new DAryHeap<number>()
      heap.push(5)
      heap.push(3)
      heap.push(7)
      heap.push(1)
      heap.push(4)
      expect(heap.toSortedArray()).toEqual([1, 3, 4, 5, 7])
    })

    it('returns sorted array (descending for max-heap)', () => {
      const heap = new DAryHeap<number>({ comparator: maxComparator })
      heap.push(5)
      heap.push(3)
      heap.push(7)
      heap.push(1)
      expect(heap.toSortedArray()).toEqual([7, 5, 3, 1])
    })

    it('does not modify the heap', () => {
      const heap = new DAryHeap<number>()
      heap.push(5)
      heap.push(3)
      heap.push(7)
      heap.toSortedArray()
      expect(heap.size()).toBe(3)
      expect(heap.peek()).toBe(3)
    })
  })

  describe('contains', () => {
    it('returns false for empty heap', () => {
      const heap = new DAryHeap<number>()
      expect(heap.contains(1)).toBe(false)
    })

    it('returns true when item exists', () => {
      const heap = new DAryHeap<number>()
      heap.push(5)
      heap.push(3)
      heap.push(7)
      expect(heap.contains(5)).toBe(true)
      expect(heap.contains(3)).toBe(true)
      expect(heap.contains(7)).toBe(true)
    })

    it('returns false when item does not exist', () => {
      const heap = new DAryHeap<number>()
      heap.push(5)
      heap.push(3)
      expect(heap.contains(7)).toBe(false)
    })

    it('works with strings', () => {
      const heap = new DAryHeap<string>({ comparator: stringComparator })
      heap.push('hello')
      heap.push('world')
      expect(heap.contains('hello')).toBe(true)
      expect(heap.contains('world')).toBe(true)
      expect(heap.contains('foo')).toBe(false)
    })

    it('works after removal', () => {
      const heap = new DAryHeap<number>()
      heap.push(5)
      heap.push(3)
      heap.remove(5)
      expect(heap.contains(5)).toBe(false)
      expect(heap.contains(3)).toBe(true)
    })
  })

  describe('remove', () => {
    it('removes a specific item', () => {
      const heap = new DAryHeap<number>()
      heap.push(5)
      heap.push(3)
      heap.push(7)
      expect(heap.remove(5)).toBe(true)
      expect(heap.contains(5)).toBe(false)
      expect(heap.size()).toBe(2)
    })

    it('returns false if item not found', () => {
      const heap = new DAryHeap<number>()
      heap.push(5)
      expect(heap.remove(3)).toBe(false)
      expect(heap.size()).toBe(1)
    })

    it('removes the top element', () => {
      const heap = new DAryHeap<number>()
      heap.push(5)
      heap.push(3)
      heap.push(7)
      expect(heap.remove(3)).toBe(true)
      expect(heap.peek()).toBe(5)
    })

    it('removes the last element', () => {
      const heap = new DAryHeap<number>()
      heap.push(1)
      heap.push(2)
      heap.push(3)
      expect(heap.remove(3)).toBe(true)
      expect(heap.size()).toBe(2)
      expect(isMinHeapValid(heap)).toBe(true)
    })

    it('removes middle element and maintains heap property', () => {
      const heap = new DAryHeap<number>()
      for (let i = 1; i <= 10; i++) heap.push(i)
      heap.remove(5)
      expect(heap.size()).toBe(9)
      expect(heap.contains(5)).toBe(false)
      expect(isMinHeapValid(heap)).toBe(true)
    })

    it('returns false on empty heap', () => {
      const heap = new DAryHeap<number>()
      expect(heap.remove(1)).toBe(false)
    })

    it('removes from heap with single element', () => {
      const heap = new DAryHeap<number>()
      heap.push(42)
      expect(heap.remove(42)).toBe(true)
      expect(heap.isEmpty()).toBe(true)
    })
  })

  describe('update', () => {
    it('updates an item to a lower value', () => {
      const heap = new DAryHeap<number>()
      heap.push(5)
      heap.push(10)
      heap.push(15)
      expect(heap.update(10, 2)).toBe(true)
      expect(heap.peek()).toBe(2)
    })

    it('updates an item to a higher value', () => {
      const heap = new DAryHeap<number>()
      heap.push(5)
      heap.push(10)
      heap.push(15)
      expect(heap.update(10, 20)).toBe(true)
      expect(heap.contains(20)).toBe(true)
      expect(heap.contains(10)).toBe(false)
      expect(isMinHeapValid(heap)).toBe(true)
    })

    it('returns false if item not found', () => {
      const heap = new DAryHeap<number>()
      heap.push(5)
      expect(heap.update(3, 7)).toBe(false)
    })

    it('maintains heap property after update', () => {
      const heap = new DAryHeap<number>()
      for (let i = 1; i <= 10; i++) heap.push(i)
      heap.update(5, 0)
      expect(heap.peek()).toBe(0)
      expect(isMinHeapValid(heap)).toBe(true)
    })

    it('updates the top element', () => {
      const heap = new DAryHeap<number>()
      heap.push(5)
      heap.push(10)
      expect(heap.update(5, 1)).toBe(true)
      expect(heap.peek()).toBe(1)
    })

    it('works with max-heap', () => {
      const heap = new DAryHeap<number>({ comparator: maxComparator })
      heap.push(5)
      heap.push(10)
      heap.update(5, 20)
      expect(heap.peek()).toBe(20)
    })
  })

  describe('merge', () => {
    it('merges two heaps', () => {
      const heap1 = new DAryHeap<number>()
      heap1.push(5)
      heap1.push(3)
      const heap2 = new DAryHeap<number>()
      heap2.push(7)
      heap2.push(1)
      heap1.merge(heap2)
      expect(heap1.size()).toBe(4)
      expect(heap1.toSortedArray()).toEqual([1, 3, 5, 7])
    })

    it('merging empty heap is no-op', () => {
      const heap = new DAryHeap<number>()
      heap.push(5)
      heap.merge(new DAryHeap<number>())
      expect(heap.size()).toBe(1)
    })

    it('merging into empty heap', () => {
      const heap1 = new DAryHeap<number>()
      const heap2 = new DAryHeap<number>()
      heap2.push(1)
      heap2.push(2)
      heap1.merge(heap2)
      expect(heap1.size()).toBe(2)
      expect(heap1.peek()).toBe(1)
    })

    it('does not modify the other heap', () => {
      const heap1 = new DAryHeap<number>()
      heap1.push(1)
      const heap2 = new DAryHeap<number>()
      heap2.push(2)
      heap2.push(3)
      heap1.merge(heap2)
      expect(heap2.size()).toBe(2)
    })

    it('maintains heap property after merge', () => {
      const heap1 = new DAryHeap<number>()
      for (let i = 1; i <= 5; i++) heap1.push(i * 2)
      const heap2 = new DAryHeap<number>()
      for (let i = 1; i <= 5; i++) heap2.push(i * 2 - 1)
      heap1.merge(heap2)
      expect(isMinHeapValid(heap1)).toBe(true)
      expect(heap1.size()).toBe(10)
    })
  })

  describe('clone', () => {
    it('creates an independent copy', () => {
      const heap = new DAryHeap<number>()
      heap.push(5)
      heap.push(3)
      heap.push(7)
      const cloned = heap.clone()
      expect(cloned.size()).toBe(3)
      expect(cloned.peek()).toBe(3)
      heap.pop()
      expect(cloned.size()).toBe(3)
    })

    it('cloned heap has same elements', () => {
      const heap = new DAryHeap<number>()
      heap.push(5)
      heap.push(3)
      heap.push(7)
      const cloned = heap.clone()
      expect(cloned.toArray().sort((a, b) => a - b)).toEqual(
        heap.toArray().sort((a, b) => a - b)
      )
    })

    it('clone preserves comparator', () => {
      const heap = new DAryHeap<number>({ comparator: maxComparator })
      heap.push(1)
      heap.push(5)
      heap.push(3)
      const cloned = heap.clone()
      expect(cloned.pop()).toBe(5)
    })

    it('clone preserves arity', () => {
      const heap = new DAryHeap<number>({ arity: 3 })
      heap.push(1)
      heap.push(2)
      const cloned = heap.clone()
      expect(cloned.toArray()).toEqual(heap.toArray())
    })

    it('clone of empty heap', () => {
      const heap = new DAryHeap<number>()
      const cloned = heap.clone()
      expect(cloned.isEmpty()).toBe(true)
    })
  })

  describe('fromArray', () => {
    it('creates heap from array', () => {
      const heap = DAryHeap.fromArray([5, 3, 7, 1, 4])
      expect(heap.size()).toBe(5)
      expect(heap.peek()).toBe(1)
    })

    it('creates heap from empty array', () => {
      const heap = DAryHeap.fromArray<number>([])
      expect(heap.isEmpty()).toBe(true)
    })

    it('creates heap with custom arity', () => {
      const heap = DAryHeap.fromArray([5, 3, 7, 1, 4], { arity: 2 })
      expect(heap.toSortedArray()).toEqual([1, 3, 4, 5, 7])
    })

    it('creates heap with custom comparator', () => {
      const heap = DAryHeap.fromArray([5, 3, 7, 1, 4], {
        comparator: maxComparator,
      })
      expect(heap.peek()).toBe(7)
    })

    it('creates heap with both arity and comparator', () => {
      const heap = DAryHeap.fromArray([5, 3, 7, 1, 4], {
        arity: 3,
        comparator: maxComparator,
      })
      expect(heap.toSortedArray()).toEqual([7, 5, 4, 3, 1])
    })

    it('does not modify the original array', () => {
      const arr = [5, 3, 7]
      DAryHeap.fromArray(arr)
      expect(arr).toEqual([5, 3, 7])
    })

    it('heapifies correctly with many elements', () => {
      const arr = Array.from({ length: 50 }, (_, i) => 50 - i)
      const heap = DAryHeap.fromArray(arr)
      expect(heap.peek()).toBe(1)
      expect(isMinHeapValid(heap)).toBe(true)
    })
  })

  describe('forEach', () => {
    it('iterates over all elements', () => {
      const heap = new DAryHeap<number>()
      heap.push(5)
      heap.push(3)
      heap.push(7)
      const items: number[] = []
      heap.forEach((item) => items.push(item))
      expect(items.length).toBe(3)
    })

    it('provides correct indices', () => {
      const heap = new DAryHeap<number>()
      heap.push(5)
      heap.push(3)
      heap.push(7)
      const indices: number[] = []
      heap.forEach((_item, index) => indices.push(index))
      expect(indices).toEqual([0, 1, 2])
    })

    it('does nothing on empty heap', () => {
      const heap = new DAryHeap<number>()
      let count = 0
      heap.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('iterates in heap order', () => {
      const heap = new DAryHeap<number>()
      heap.push(5)
      heap.push(3)
      heap.push(7)
      const arr = heap.toArray()
      const items: number[] = []
      heap.forEach((item) => items.push(item))
      expect(items).toEqual(arr)
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates over all elements', () => {
      const heap = new DAryHeap<number>()
      heap.push(5)
      heap.push(3)
      heap.push(7)
      const items: number[] = []
      for (const item of heap) items.push(item)
      expect(items.length).toBe(3)
    })

    it('works with spread operator', () => {
      const heap = new DAryHeap<number>()
      heap.push(5)
      heap.push(3)
      heap.push(7)
      const items = [...heap]
      expect(items.length).toBe(3)
    })

    it('works with Array.from', () => {
      const heap = new DAryHeap<number>()
      heap.push(5)
      heap.push(3)
      heap.push(7)
      const items = Array.from(heap)
      expect(items.length).toBe(3)
    })

    it('handles empty heap', () => {
      const heap = new DAryHeap<number>()
      const items: number[] = []
      for (const item of heap) items.push(item)
      expect(items).toEqual([])
    })
  })

  describe('arity variations', () => {
    it.each([2, 3, 4, 5, 8] as const)('works with arity %d', (arity) => {
      const heap = new DAryHeap<number>({ arity })
      for (let i = 20; i >= 1; i--) heap.push(i)
      const sorted = heap.toSortedArray()
      expect(sorted).toEqual(Array.from({ length: 20 }, (_, i) => i + 1))
    })

    it('arity 2 (binary heap) works correctly', () => {
      const heap = new DAryHeap<number>({ arity: 2 })
      const items = [10, 20, 5, 15, 25, 30, 3, 8]
      for (const item of items) heap.push(item)
      expect(heap.pop()).toBe(3)
      expect(heap.pop()).toBe(5)
      expect(heap.pop()).toBe(8)
      expect(heap.pop()).toBe(10)
    })

    it('arity 3 works correctly', () => {
      const heap = new DAryHeap<number>({ arity: 3 })
      const items = [10, 20, 5, 15, 25, 30, 3, 8]
      for (const item of items) heap.push(item)
      while (!heap.isEmpty()) {
        const top = heap.peek()
        const popped = heap.pop()
        expect(top).toBe(popped)
      }
    })
  })

  describe('edge cases', () => {
    it('handles single element operations', () => {
      const heap = new DAryHeap<number>()
      heap.push(1)
      expect(heap.peek()).toBe(1)
      expect(heap.pop()).toBe(1)
      expect(heap.isEmpty()).toBe(true)
    })

    it('handles alternating push and pop', () => {
      const heap = new DAryHeap<number>()
      heap.push(5)
      expect(heap.pop()).toBe(5)
      heap.push(3)
      heap.push(7)
      expect(heap.pop()).toBe(3)
      heap.push(1)
      expect(heap.pop()).toBe(1)
      expect(heap.pop()).toBe(7)
      expect(heap.isEmpty()).toBe(true)
    })

    it('handles push after all pops', () => {
      const heap = new DAryHeap<number>()
      heap.push(1)
      heap.push(2)
      heap.pop()
      heap.pop()
      heap.push(3)
      expect(heap.size()).toBe(1)
      expect(heap.peek()).toBe(3)
    })

    it('handles large number of elements', () => {
      const heap = new DAryHeap<number>()
      const n = 1000
      for (let i = n; i >= 1; i--) heap.push(i)
      expect(heap.size()).toBe(n)
      for (let i = 1; i <= n; i++) {
        expect(heap.pop()).toBe(i)
      }
    })

    it('handles elements in reverse sorted order', () => {
      const heap = new DAryHeap<number>()
      for (let i = 100; i >= 1; i--) heap.push(i)
      for (let i = 1; i <= 100; i++) {
        expect(heap.pop()).toBe(i)
      }
    })

    it('handles elements already in sorted order', () => {
      const heap = new DAryHeap<number>()
      for (let i = 1; i <= 100; i++) heap.push(i)
      for (let i = 1; i <= 100; i++) {
        expect(heap.pop()).toBe(i)
      }
    })

    it('handles identical elements', () => {
      const heap = new DAryHeap<number>()
      for (let i = 0; i < 50; i++) heap.push(42)
      expect(heap.size()).toBe(50)
      for (let i = 0; i < 50; i++) {
        expect(heap.pop()).toBe(42)
      }
    })

    it('handles zero values', () => {
      const heap = new DAryHeap<number>()
      heap.push(0)
      heap.push(-1)
      heap.push(1)
      expect(heap.toSortedArray()).toEqual([-1, 0, 1])
    })

    it('handles very large values', () => {
      const heap = new DAryHeap<number>()
      heap.push(Number.MAX_VALUE)
      heap.push(Number.MIN_VALUE)
      heap.push(0)
      expect(heap.pop()).toBe(0)
      expect(heap.pop()).toBe(Number.MIN_VALUE)
      expect(heap.pop()).toBe(Number.MAX_VALUE)
    })
  })

  describe('interleaved operations', () => {
    it('mix of push, pop, peek, remove, update', () => {
      const heap = new DAryHeap<number>()
      heap.push(10)
      heap.push(5)
      heap.push(15)
      expect(heap.peek()).toBe(5)
      heap.update(5, 20)
      expect(heap.peek()).toBe(10)
      heap.remove(15)
      expect(heap.size()).toBe(2)
      expect(heap.pop()).toBe(10)
      expect(heap.pop()).toBe(20)
    })

    it('interleaved pushPop and replace', () => {
      const heap = new DAryHeap<number>()
      heap.push(10)
      heap.push(20)
      expect(heap.pushPop(5)).toBe(5)
      expect(heap.replace(15)).toBe(10)
      expect(heap.toSortedArray()).toEqual([15, 20])
    })

    it('merge then remove then update', () => {
      const heap1 = new DAryHeap<number>()
      heap1.push(10)
      heap1.push(30)
      const heap2 = new DAryHeap<number>()
      heap2.push(20)
      heap2.push(5)
      heap1.merge(heap2)
      heap1.remove(20)
      heap1.update(30, 1)
      expect(heap1.toSortedArray()).toEqual([1, 5, 10])
    })

    it('fromArray then modify then clone', () => {
      const heap = DAryHeap.fromArray([10, 20, 5, 15])
      heap.push(3)
      heap.remove(20)
      const cloned = heap.clone()
      heap.pop()
      expect(cloned.size()).toBe(4)
      expect(heap.size()).toBe(3)
    })

    it('stress test with random operations', () => {
      const heap = new DAryHeap<number>()
      const values: number[] = []
      for (let i = 0; i < 100; i++) {
        const val = Math.floor(Math.random() * 1000)
        heap.push(val)
        values.push(val)
      }
      values.sort((a, b) => a - b)
      for (let i = 0; i < 100; i++) {
        expect(heap.pop()).toBe(values[i])
      }
    })
  })

  describe('custom objects', () => {
    it('works with objects using custom comparator', () => {
      interface Item {
        priority: number
        name: string
      }
      const heap = new DAryHeap<Item>({
        comparator: (a, b) => a.priority - b.priority,
      })
      heap.push({ priority: 3, name: 'c' })
      heap.push({ priority: 1, name: 'a' })
      heap.push({ priority: 2, name: 'b' })
      expect(heap.pop()!.name).toBe('a')
      expect(heap.pop()!.name).toBe('b')
      expect(heap.pop()!.name).toBe('c')
    })
  })

  describe('DAryHeapOptions export', () => {
    it('can use DAryHeapOptions type', () => {
      const options: DAryHeapOptions<number> = {
        arity: 3,
        comparator: maxComparator,
      }
      const heap = new DAryHeap<number>(options)
      heap.push(1)
      heap.push(2)
      expect(heap.pop()).toBe(2)
    })
  })

  describe('additional arity tests', () => {
    it('arity 2 with many random elements', () => {
      const heap = new DAryHeap<number>({ arity: 2 })
      const vals = [42, 17, 83, 5, 29, 61, 11, 73, 38, 96]
      for (const v of vals) heap.push(v)
      const sorted = heap.toSortedArray()
      expect(sorted).toEqual([...vals].sort((a, b) => a - b))
    })

    it('arity 5 with fromArray', () => {
      const arr = [50, 30, 70, 10, 90, 20, 80, 40, 60]
      const heap = DAryHeap.fromArray(arr, { arity: 5 })
      expect(heap.toSortedArray()).toEqual([...arr].sort((a, b) => a - b))
    })

    it('arity 8 heap property maintained after remove', () => {
      const heap = new DAryHeap<number>({ arity: 8 })
      for (let i = 1; i <= 50; i++) heap.push(i)
      heap.remove(25)
      heap.remove(10)
      heap.remove(40)
      expect(heap.size()).toBe(47)
      expect(isValidForArity(heap, 8)).toBe(true)
    })

    it('arity 4 default is correct', () => {
      const heap = new DAryHeap<number>()
      const arr = [10, 5, 15, 3, 7, 12, 20]
      for (const v of arr) heap.push(v)
      const internal = heap.toArray()
      for (let i = 0; i < internal.length; i++) {
        for (let c = 1; c <= 4; c++) {
          const childIdx = 4 * i + c
          if (childIdx < internal.length) {
            expect(internal[i]! <= internal[childIdx]!).toBe(true)
          }
        }
      }
    })

    it('arity 3 update maintains property', () => {
      const heap = new DAryHeap<number>({ arity: 3 })
      for (let i = 1; i <= 20; i++) heap.push(i)
      heap.update(10, 0)
      expect(heap.peek()).toBe(0)
      heap.update(1, 100)
      expect(isMinHeapValid(heap)).toBe(true)
    })
  })

  describe('additional pushPop/popPush/replace tests', () => {
    it('pushPop on single-element heap returns smaller', () => {
      const heap = new DAryHeap<number>()
      heap.push(10)
      expect(heap.pushPop(5)).toBe(5)
      expect(heap.peek()).toBe(10)
    })

    it('pushPop on single-element heap returns top for larger', () => {
      const heap = new DAryHeap<number>()
      heap.push(10)
      expect(heap.pushPop(15)).toBe(10)
      expect(heap.peek()).toBe(15)
    })

    it('popPush maintains size', () => {
      const heap = new DAryHeap<number>()
      for (let i = 1; i <= 5; i++) heap.push(i)
      const sizeBefore = heap.size()
      heap.popPush(0)
      expect(heap.size()).toBe(sizeBefore)
    })

    it('replace and popPush give same result', () => {
      const h1 = new DAryHeap<number>()
      const h2 = new DAryHeap<number>()
      for (const v of [5, 3, 7, 1, 4]) {
        h1.push(v)
        h2.push(v)
      }
      expect(h1.replace(0)).toBe(h2.popPush(0))
      expect(h1.toArray().sort()).toEqual(h2.toArray().sort())
    })

    it('pushPop with equal elements on multi-element heap', () => {
      const heap = new DAryHeap<number>()
      heap.push(5)
      heap.push(5)
      heap.push(5)
      expect(heap.pushPop(5)).toBe(5)
      expect(heap.size()).toBe(3)
    })
  })

  describe('additional edge cases', () => {
    it('clear and rebuild', () => {
      const heap = new DAryHeap<number>()
      for (let i = 1; i <= 10; i++) heap.push(i)
      heap.clear()
      for (let i = 10; i >= 1; i--) heap.push(i)
      expect(heap.toSortedArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('remove then push maintains property', () => {
      const heap = new DAryHeap<number>()
      for (let i = 1; i <= 10; i++) heap.push(i)
      heap.remove(3)
      heap.push(0)
      expect(heap.peek()).toBe(0)
      expect(isMinHeapValid(heap)).toBe(true)
    })

    it('fromArray with single element', () => {
      const heap = DAryHeap.fromArray([42])
      expect(heap.size()).toBe(1)
      expect(heap.peek()).toBe(42)
    })

    it('fromArray with two elements', () => {
      const heap = DAryHeap.fromArray([5, 1])
      expect(heap.peek()).toBe(1)
      expect(heap.toSortedArray()).toEqual([1, 5])
    })

    it('merge heaps with different arity uses receiver arity', () => {
      const h1 = new DAryHeap<number>({ arity: 2 })
      h1.push(10)
      h1.push(20)
      const h2 = new DAryHeap<number>({ arity: 8 })
      h2.push(5)
      h2.push(15)
      h1.merge(h2)
      expect(h1.toSortedArray()).toEqual([5, 10, 15, 20])
    })

    it('clone then modify both independently', () => {
      const heap = new DAryHeap<number>()
      heap.push(1)
      heap.push(2)
      heap.push(3)
      const cloned = heap.clone()
      heap.push(0)
      cloned.push(4)
      expect(heap.size()).toBe(4)
      expect(cloned.size()).toBe(4)
      expect(heap.peek()).toBe(0)
      expect(cloned.peek()).toBe(1)
    })

    it('contains with custom comparator uses comparator equality', () => {
      const heap = new DAryHeap<number>({ comparator: (a, b) => a - b })
      heap.push(5)
      heap.push(10)
      expect(heap.contains(5)).toBe(true)
      expect(heap.contains(10)).toBe(true)
      expect(heap.contains(3)).toBe(false)
    })

    it('forEach on single-element heap', () => {
      const heap = new DAryHeap<number>()
      heap.push(42)
      const items: number[] = []
      heap.forEach((item) => items.push(item))
      expect(items).toEqual([42])
    })

    it('iterator exhaustion', () => {
      const heap = new DAryHeap<number>()
      heap.push(1)
      const iter = heap[Symbol.iterator]()
      expect(iter.next()).toEqual({ value: 1, done: false })
      expect(iter.next().done).toBe(true)
      expect(iter.next().done).toBe(true)
    })

    it('large dataset with fromArray', () => {
      const arr = Array.from({ length: 500 }, (_, i) => 500 - i)
      const heap = DAryHeap.fromArray(arr)
      expect(heap.size()).toBe(500)
      for (let i = 1; i <= 500; i++) {
        expect(heap.pop()).toBe(i)
      }
    })

    it('multiple merges', () => {
      const heap = new DAryHeap<number>()
      heap.push(10)
      const h2 = new DAryHeap<number>()
      h2.push(5)
      const h3 = new DAryHeap<number>()
      h3.push(15)
      heap.merge(h2)
      heap.merge(h3)
      expect(heap.toSortedArray()).toEqual([5, 10, 15])
    })

    it('update non-existent item returns false', () => {
      const heap = new DAryHeap<number>()
      heap.push(1)
      heap.push(2)
      expect(heap.update(99, 0)).toBe(false)
      expect(heap.size()).toBe(2)
    })

    it('toSortedArray on single element', () => {
      const heap = new DAryHeap<number>()
      heap.push(42)
      expect(heap.toSortedArray()).toEqual([42])
    })

    it('pushPop followed by pop', () => {
      const heap = new DAryHeap<number>()
      heap.push(10)
      heap.push(20)
      heap.pushPop(5)
      expect(heap.pop()).toBe(10)
      expect(heap.pop()).toBe(20)
    })

    it('string heap full cycle', () => {
      const heap = new DAryHeap<string>({ comparator: stringComparator })
      heap.push('delta')
      heap.push('alpha')
      heap.push('charlie')
      heap.push('bravo')
      expect(heap.toSortedArray()).toEqual(['alpha', 'bravo', 'charlie', 'delta'])
      expect(heap.contains('charlie')).toBe(true)
      heap.remove('bravo')
      expect(heap.toSortedArray()).toEqual(['alpha', 'charlie', 'delta'])
    })
  })
})
