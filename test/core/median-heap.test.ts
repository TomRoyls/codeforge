import { describe, it, expect } from 'vitest'
import { MedianHeap } from '../../src/core/median-heap/index.js'
import type { MedianHeapOptions } from '../../src/core/median-heap/index.js'

const stringComparator = (a: string, b: string): number => a.localeCompare(b)

function bruteMedian(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 1) return sorted[mid]!
  return (sorted[mid - 1]! + sorted[mid]!) / 2
}

describe('MedianHeap', () => {
  describe('constructor', () => {
    it('creates empty heap with defaults', () => {
      const heap = new MedianHeap()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('creates heap with no options', () => {
      const heap = new MedianHeap<number>()
      expect(heap.size).toBe(0)
    })

    it('creates heap with empty options', () => {
      const heap = new MedianHeap<number>({})
      expect(heap.size).toBe(0)
    })

    it('creates heap with custom comparator', () => {
      const heap = new MedianHeap<string>({ comparator: stringComparator })
      heap.insert('c')
      heap.insert('a')
      heap.insert('b')
      expect(heap.median()).toBe('b')
    })

    it('creates heap with number comparator', () => {
      const comp = (a: number, b: number) => a - b
      const heap = new MedianHeap<number>({ comparator: comp })
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      expect(heap.median()).toBe(5)
    })
  })

  describe('insert', () => {
    it('inserts single element', () => {
      const heap = new MedianHeap()
      heap.insert(5)
      expect(heap.size).toBe(1)
      expect(heap.isEmpty()).toBe(false)
    })

    it('inserts two elements', () => {
      const heap = new MedianHeap()
      heap.insert(3)
      heap.insert(7)
      expect(heap.size).toBe(2)
    })

    it('inserts three elements', () => {
      const heap = new MedianHeap()
      heap.insert(3)
      heap.insert(7)
      heap.insert(5)
      expect(heap.size).toBe(3)
    })

    it('inserts duplicate values', () => {
      const heap = new MedianHeap()
      heap.insert(5)
      heap.insert(5)
      heap.insert(5)
      expect(heap.size).toBe(3)
      expect(heap.median()).toBe(5)
    })

    it('inserts values in ascending order', () => {
      const heap = new MedianHeap()
      for (let i = 1; i <= 10; i++) heap.insert(i)
      expect(heap.size).toBe(10)
    })

    it('inserts values in descending order', () => {
      const heap = new MedianHeap()
      for (let i = 10; i >= 1; i--) heap.insert(i)
      expect(heap.size).toBe(10)
    })

    it('inserts negative values', () => {
      const heap = new MedianHeap()
      heap.insert(-5)
      heap.insert(-3)
      heap.insert(-7)
      expect(heap.median()).toBe(-5)
    })

    it('inserts zero', () => {
      const heap = new MedianHeap()
      heap.insert(0)
      expect(heap.median()).toBe(0)
    })

    it('inserts mixed positive and negative', () => {
      const heap = new MedianHeap()
      heap.insert(-1)
      heap.insert(1)
      expect(heap.median()).toBe(0)
    })

    it('inserts floating point values', () => {
      const heap = new MedianHeap()
      heap.insert(1.5)
      heap.insert(2.5)
      heap.insert(3.5)
      expect(heap.median()).toBe(2.5)
    })

    it('inserts many elements maintaining correct median', () => {
      const heap = new MedianHeap()
      const values = [5, 3, 8, 1, 9, 2, 7, 4, 6]
      for (const v of values) heap.insert(v)
      expect(heap.median()).toBe(5)
    })
  })

  describe('median', () => {
    it('throws on empty heap', () => {
      const heap = new MedianHeap()
      expect(() => heap.median()).toThrow('Heap is empty')
    })

    it('returns single element', () => {
      const heap = new MedianHeap()
      heap.insert(5)
      expect(heap.median()).toBe(5)
    })

    it('returns average of two elements', () => {
      const heap = new MedianHeap()
      heap.insert(3)
      heap.insert(7)
      expect(heap.median()).toBe(5)
    })

    it('returns middle of three elements (odd)', () => {
      const heap = new MedianHeap()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      expect(heap.median()).toBe(2)
    })

    it('returns average for four elements (even)', () => {
      const heap = new MedianHeap()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.insert(4)
      expect(heap.median()).toBe(2.5)
    })

    it('returns correct median for 1..9', () => {
      const heap = new MedianHeap()
      for (let i = 1; i <= 9; i++) heap.insert(i)
      expect(heap.median()).toBe(5)
    })

    it('returns correct median for 1..10', () => {
      const heap = new MedianHeap()
      for (let i = 1; i <= 10; i++) heap.insert(i)
      expect(heap.median()).toBe(5.5)
    })

    it('returns correct median after reverse insert', () => {
      const heap = new MedianHeap()
      for (let i = 9; i >= 1; i--) heap.insert(i)
      expect(heap.median()).toBe(5)
    })

    it('returns correct median with duplicates', () => {
      const heap = new MedianHeap()
      heap.insert(2)
      heap.insert(2)
      heap.insert(2)
      expect(heap.median()).toBe(2)
    })

    it('handles median with negative numbers', () => {
      const heap = new MedianHeap()
      heap.insert(-3)
      heap.insert(-1)
      heap.insert(-5)
      heap.insert(-2)
      expect(heap.median()).toBe(-2.5)
    })

    it('handles median with large dataset', () => {
      const heap = new MedianHeap()
      for (let i = 1; i <= 1001; i++) heap.insert(i)
      expect(heap.median()).toBe(501)
    })

    it('handles median with even large dataset', () => {
      const heap = new MedianHeap()
      for (let i = 1; i <= 1000; i++) heap.insert(i)
      expect(heap.median()).toBe(500.5)
    })

    it('correctly tracks median across sequential inserts', () => {
      const heap = new MedianHeap()
      const values = [5, 3, 8, 1, 9, 2, 7, 4, 6]
      const medians: number[] = []
      for (const v of values) {
        heap.insert(v)
        medians.push(heap.median())
      }
      expect(medians).toEqual([5, 4, 5, 4, 5, 4, 5, 4.5, 5])
    })
  })

  describe('remove', () => {
    it('returns false on empty heap', () => {
      const heap = new MedianHeap()
      expect(heap.remove(5)).toBe(false)
    })

    it('removes single element', () => {
      const heap = new MedianHeap()
      heap.insert(5)
      expect(heap.remove(5)).toBe(true)
      expect(heap.size).toBe(0)
    })

    it('returns false when value not found', () => {
      const heap = new MedianHeap()
      heap.insert(5)
      expect(heap.remove(3)).toBe(false)
      expect(heap.size).toBe(1)
    })

    it('removes element from lower half', () => {
      const heap = new MedianHeap()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      expect(heap.remove(1)).toBe(true)
      expect(heap.size).toBe(2)
    })

    it('removes element from upper half', () => {
      const heap = new MedianHeap()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      expect(heap.remove(3)).toBe(true)
      expect(heap.size).toBe(2)
    })

    it('removes median element', () => {
      const heap = new MedianHeap()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      expect(heap.remove(2)).toBe(true)
      expect(heap.size).toBe(2)
    })

    it('maintains correct median after removal', () => {
      const heap = new MedianHeap()
      for (let i = 1; i <= 5; i++) heap.insert(i)
      heap.remove(3)
      expect(heap.median()).toBe(3)
    })

    it('removes only first occurrence of duplicates', () => {
      const heap = new MedianHeap()
      heap.insert(5)
      heap.insert(5)
      heap.insert(5)
      expect(heap.remove(5)).toBe(true)
      expect(heap.size).toBe(2)
    })

    it('handles removal and reinsertion', () => {
      const heap = new MedianHeap()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.remove(2)
      heap.insert(4)
      expect(heap.size).toBe(3)
    })

    it('correctly rebalances after removal', () => {
      const heap = new MedianHeap()
      for (let i = 1; i <= 7; i++) heap.insert(i)
      heap.remove(1)
      expect(heap.size).toBe(6)
      expect(heap.median()).toBe(4.5)
    })

    it('removes from front-loaded heap', () => {
      const heap = new MedianHeap()
      heap.insert(1)
      heap.insert(3)
      heap.insert(5)
      heap.insert(7)
      heap.remove(7)
      expect(heap.median()).toBe(3)
    })

    it('removes last remaining element', () => {
      const heap = new MedianHeap()
      heap.insert(42)
      expect(heap.remove(42)).toBe(true)
      expect(heap.isEmpty()).toBe(true)
    })
  })

  describe('size', () => {
    it('returns 0 for empty heap', () => {
      const heap = new MedianHeap()
      expect(heap.size).toBe(0)
    })

    it('returns correct size after inserts', () => {
      const heap = new MedianHeap()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      expect(heap.size).toBe(3)
    })

    it('returns correct size after removal', () => {
      const heap = new MedianHeap()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.remove(2)
      expect(heap.size).toBe(2)
    })

    it('returns correct size after clear', () => {
      const heap = new MedianHeap()
      heap.insert(1)
      heap.insert(2)
      heap.clear()
      expect(heap.size).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('returns true for empty heap', () => {
      const heap = new MedianHeap()
      expect(heap.isEmpty()).toBe(true)
    })

    it('returns false after insert', () => {
      const heap = new MedianHeap()
      heap.insert(1)
      expect(heap.isEmpty()).toBe(false)
    })

    it('returns true after removing all elements', () => {
      const heap = new MedianHeap()
      heap.insert(1)
      heap.remove(1)
      expect(heap.isEmpty()).toBe(true)
    })

    it('returns true after clear', () => {
      const heap = new MedianHeap()
      heap.insert(1)
      heap.insert(2)
      heap.clear()
      expect(heap.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears empty heap', () => {
      const heap = new MedianHeap()
      heap.clear()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('clears non-empty heap', () => {
      const heap = new MedianHeap()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.clear()
      expect(heap.size).toBe(0)
    })

    it('allows inserts after clear', () => {
      const heap = new MedianHeap()
      heap.insert(1)
      heap.clear()
      heap.insert(2)
      expect(heap.size).toBe(1)
      expect(heap.median()).toBe(2)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty heap', () => {
      const heap = new MedianHeap()
      expect(heap.toArray()).toEqual([])
    })

    it('returns single element', () => {
      const heap = new MedianHeap()
      heap.insert(5)
      expect(heap.toArray()).toEqual([5])
    })

    it('returns sorted elements', () => {
      const heap = new MedianHeap()
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      expect(heap.toArray()).toEqual([1, 2, 3])
    })

    it('returns correct array after removal', () => {
      const heap = new MedianHeap()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.remove(2)
      const arr = heap.toArray()
      expect(arr).toEqual([1, 3])
    })

    it('does not mutate heap', () => {
      const heap = new MedianHeap()
      heap.insert(1)
      heap.insert(2)
      const arr = heap.toArray()
      arr.push(3)
      expect(heap.size).toBe(2)
    })

    it('returns all duplicates', () => {
      const heap = new MedianHeap()
      heap.insert(5)
      heap.insert(5)
      heap.insert(5)
      expect(heap.toArray()).toEqual([5, 5, 5])
    })
  })

  describe('clone', () => {
    it('clones empty heap', () => {
      const heap = new MedianHeap()
      const cloned = heap.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('clones heap with elements', () => {
      const heap = new MedianHeap()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      const cloned = heap.clone()
      expect(cloned.size).toBe(3)
      expect(cloned.median()).toBe(2)
    })

    it('clone is independent of original', () => {
      const heap = new MedianHeap()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      const cloned = heap.clone()
      cloned.insert(4)
      expect(heap.size).toBe(3)
      expect(cloned.size).toBe(4)
    })

    it('clone preserves comparator', () => {
      const heap = new MedianHeap<string>({ comparator: stringComparator })
      heap.insert('b')
      heap.insert('a')
      heap.insert('c')
      const cloned = heap.clone()
      expect(cloned.median()).toBe('b')
    })

    it('modifying clone does not affect original', () => {
      const heap = new MedianHeap()
      heap.insert(1)
      heap.insert(2)
      const cloned = heap.clone()
      cloned.remove(1)
      expect(heap.size).toBe(2)
      expect(cloned.size).toBe(1)
    })
  })

  describe('fromArray', () => {
    it('creates heap from empty array', () => {
      const heap = MedianHeap.fromArray([])
      expect(heap.size).toBe(0)
    })

    it('creates heap from single element array', () => {
      const heap = MedianHeap.fromArray([5])
      expect(heap.size).toBe(1)
      expect(heap.median()).toBe(5)
    })

    it('creates heap from sorted array', () => {
      const heap = MedianHeap.fromArray([1, 2, 3, 4, 5])
      expect(heap.median()).toBe(3)
    })

    it('creates heap from reverse sorted array', () => {
      const heap = MedianHeap.fromArray([5, 4, 3, 2, 1])
      expect(heap.median()).toBe(3)
    })

    it('creates heap with custom comparator', () => {
      const heap = MedianHeap.fromArray(['c', 'a', 'b'], {
        comparator: stringComparator,
      })
      expect(heap.median()).toBe('b')
    })

    it('creates heap from random array', () => {
      const heap = MedianHeap.fromArray([3, 1, 4, 1, 5, 9, 2, 6])
      expect(heap.size).toBe(8)
    })

    it('does not mutate input array', () => {
      const arr = [3, 1, 2]
      const copy = [...arr]
      MedianHeap.fromArray(arr)
      expect(arr).toEqual(copy)
    })
  })

  describe('forEach', () => {
    it('iterates empty heap', () => {
      const heap = new MedianHeap()
      const items: number[] = []
      heap.forEach((v) => items.push(v))
      expect(items).toEqual([])
    })

    it('iterates single element', () => {
      const heap = new MedianHeap()
      heap.insert(5)
      const items: number[] = []
      heap.forEach((v) => items.push(v))
      expect(items).toEqual([5])
    })

    it('iterates multiple elements in sorted order', () => {
      const heap = new MedianHeap()
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      const items: number[] = []
      heap.forEach((v) => items.push(v))
      expect(items).toEqual([1, 2, 3])
    })

    it('provides correct index', () => {
      const heap = new MedianHeap()
      heap.insert(10)
      heap.insert(20)
      heap.insert(30)
      const indices: number[] = []
      heap.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('iterates with duplicates', () => {
      const heap = new MedianHeap()
      heap.insert(5)
      heap.insert(5)
      heap.insert(5)
      const items: number[] = []
      heap.forEach((v) => items.push(v))
      expect(items).toEqual([5, 5, 5])
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates empty heap', () => {
      const heap = new MedianHeap()
      const items = [...heap]
      expect(items).toEqual([])
    })

    it('iterates single element', () => {
      const heap = new MedianHeap()
      heap.insert(5)
      expect([...heap]).toEqual([5])
    })

    it('iterates multiple elements sorted', () => {
      const heap = new MedianHeap()
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      expect([...heap]).toEqual([1, 2, 3])
    })

    it('works with for...of', () => {
      const heap = new MedianHeap()
      heap.insert(2)
      heap.insert(1)
      heap.insert(3)
      const items: number[] = []
      for (const v of heap) {
        items.push(v)
      }
      expect(items).toEqual([1, 2, 3])
    })

    it('works with spread and destructuring', () => {
      const heap = MedianHeap.fromArray([3, 1, 2])
      const [first, ...rest] = heap
      expect(first).toBe(1)
      expect(rest).toEqual([2, 3])
    })
  })

  describe('contains', () => {
    it('returns false on empty heap', () => {
      const heap = new MedianHeap()
      expect(heap.contains(5)).toBe(false)
    })

    it('returns true when value exists', () => {
      const heap = new MedianHeap()
      heap.insert(5)
      expect(heap.contains(5)).toBe(true)
    })

    it('returns false when value does not exist', () => {
      const heap = new MedianHeap()
      heap.insert(5)
      expect(heap.contains(3)).toBe(false)
    })

    it('finds values in lower half', () => {
      const heap = new MedianHeap()
      for (let i = 1; i <= 10; i++) heap.insert(i)
      expect(heap.contains(1)).toBe(true)
      expect(heap.contains(2)).toBe(true)
    })

    it('finds values in upper half', () => {
      const heap = new MedianHeap()
      for (let i = 1; i <= 10; i++) heap.insert(i)
      expect(heap.contains(9)).toBe(true)
      expect(heap.contains(10)).toBe(true)
    })

    it('finds duplicate values', () => {
      const heap = new MedianHeap()
      heap.insert(5)
      heap.insert(5)
      heap.remove(5)
      expect(heap.contains(5)).toBe(true)
    })

    it('returns false after removal', () => {
      const heap = new MedianHeap()
      heap.insert(5)
      heap.remove(5)
      expect(heap.contains(5)).toBe(false)
    })
  })

  describe('min', () => {
    it('throws on empty heap', () => {
      const heap = new MedianHeap()
      expect(() => heap.min()).toThrow('Heap is empty')
    })

    it('returns single element', () => {
      const heap = new MedianHeap()
      heap.insert(5)
      expect(heap.min()).toBe(5)
    })

    it('returns minimum of multiple elements', () => {
      const heap = new MedianHeap()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      expect(heap.min()).toBe(3)
    })

    it('returns minimum after removal', () => {
      const heap = new MedianHeap()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.remove(1)
      expect(heap.min()).toBe(2)
    })

    it('returns negative minimum', () => {
      const heap = new MedianHeap()
      heap.insert(-5)
      heap.insert(-3)
      heap.insert(-1)
      expect(heap.min()).toBe(-5)
    })

    it('handles mixed signs', () => {
      const heap = new MedianHeap()
      heap.insert(-1)
      heap.insert(0)
      heap.insert(1)
      expect(heap.min()).toBe(-1)
    })
  })

  describe('max', () => {
    it('throws on empty heap', () => {
      const heap = new MedianHeap()
      expect(() => heap.max()).toThrow('Heap is empty')
    })

    it('returns single element', () => {
      const heap = new MedianHeap()
      heap.insert(5)
      expect(heap.max()).toBe(5)
    })

    it('returns maximum of multiple elements', () => {
      const heap = new MedianHeap()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      expect(heap.max()).toBe(7)
    })

    it('returns maximum after removal', () => {
      const heap = new MedianHeap()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.remove(3)
      expect(heap.max()).toBe(2)
    })

    it('returns negative maximum', () => {
      const heap = new MedianHeap()
      heap.insert(-5)
      heap.insert(-3)
      heap.insert(-1)
      expect(heap.max()).toBe(-1)
    })

    it('handles mixed signs', () => {
      const heap = new MedianHeap()
      heap.insert(-1)
      heap.insert(0)
      heap.insert(1)
      expect(heap.max()).toBe(1)
    })
  })

  describe('lowerMedian', () => {
    it('throws on empty heap', () => {
      const heap = new MedianHeap()
      expect(() => heap.lowerMedian()).toThrow('Heap is empty')
    })

    it('returns single element', () => {
      const heap = new MedianHeap()
      heap.insert(5)
      expect(heap.lowerMedian()).toBe(5)
    })

    it('returns lower of two elements', () => {
      const heap = new MedianHeap()
      heap.insert(3)
      heap.insert(7)
      expect(heap.lowerMedian()).toBe(3)
    })

    it('returns middle of odd count', () => {
      const heap = new MedianHeap()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      expect(heap.lowerMedian()).toBe(2)
    })

    it('returns lower middle of even count', () => {
      const heap = new MedianHeap()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.insert(4)
      expect(heap.lowerMedian()).toBe(2)
    })

    it('returns correct lower median for 1..10', () => {
      const heap = new MedianHeap()
      for (let i = 1; i <= 10; i++) heap.insert(i)
      expect(heap.lowerMedian()).toBe(5)
    })
  })

  describe('upperMedian', () => {
    it('throws on empty heap', () => {
      const heap = new MedianHeap()
      expect(() => heap.upperMedian()).toThrow('Heap is empty')
    })

    it('returns single element', () => {
      const heap = new MedianHeap()
      heap.insert(5)
      expect(heap.upperMedian()).toBe(5)
    })

    it('returns upper of two elements', () => {
      const heap = new MedianHeap()
      heap.insert(3)
      heap.insert(7)
      expect(heap.upperMedian()).toBe(7)
    })

    it('returns middle of odd count', () => {
      const heap = new MedianHeap()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      expect(heap.upperMedian()).toBe(2)
    })

    it('returns upper middle of even count', () => {
      const heap = new MedianHeap()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.insert(4)
      expect(heap.upperMedian()).toBe(3)
    })

    it('returns correct upper median for 1..10', () => {
      const heap = new MedianHeap()
      for (let i = 1; i <= 10; i++) heap.insert(i)
      expect(heap.upperMedian()).toBe(6)
    })
  })

  describe('custom comparator', () => {
    it('works with string values', () => {
      const heap = new MedianHeap<string>({ comparator: stringComparator })
      heap.insert('cherry')
      heap.insert('apple')
      heap.insert('banana')
      expect(heap.median()).toBe('banana')
    })

    it('works with descending comparator', () => {
      const descComp = (a: number, b: number) => b - a
      const heap = new MedianHeap({ comparator: descComp })
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      expect(heap.median()).toBe(2)
    })

    it('works with object comparator', () => {
      interface Item {
        val: number
      }
      const comp = (a: Item, b: Item) => a.val - b.val
      const heap = new MedianHeap<Item>({ comparator: comp })
      heap.insert({ val: 3 })
      heap.insert({ val: 1 })
      heap.insert({ val: 2 })
      expect(heap.median()).toEqual({ val: 2 })
    })
  })

  describe('rebalancing', () => {
    it('maintains balance after sequential inserts', () => {
      const heap = new MedianHeap()
      for (let i = 0; i < 100; i++) heap.insert(i)
      expect(heap.size).toBe(100)
      expect(heap.median()).toBe(49.5)
    })

    it('maintains balance after reverse inserts', () => {
      const heap = new MedianHeap()
      for (let i = 99; i >= 0; i--) heap.insert(i)
      expect(heap.size).toBe(100)
      expect(heap.median()).toBe(49.5)
    })

    it('maintains balance after alternating inserts', () => {
      const heap = new MedianHeap()
      for (let i = 0; i < 50; i++) {
        heap.insert(i)
        heap.insert(99 - i)
      }
      expect(heap.size).toBe(100)
      expect(heap.median()).toBe(49.5)
    })

    it('maintains balance after removals', () => {
      const heap = new MedianHeap()
      for (let i = 1; i <= 11; i++) heap.insert(i)
      for (let i = 1; i <= 5; i++) heap.remove(i)
      expect(heap.size).toBe(6)
      expect(heap.median()).toBe(8.5)
    })
  })

  describe('edge cases', () => {
    it('handles single element operations', () => {
      const heap = new MedianHeap()
      heap.insert(42)
      expect(heap.median()).toBe(42)
      expect(heap.lowerMedian()).toBe(42)
      expect(heap.upperMedian()).toBe(42)
      expect(heap.min()).toBe(42)
      expect(heap.max()).toBe(42)
    })

    it('handles two element operations', () => {
      const heap = new MedianHeap()
      heap.insert(1)
      heap.insert(3)
      expect(heap.median()).toBe(2)
      expect(heap.lowerMedian()).toBe(1)
      expect(heap.upperMedian()).toBe(3)
      expect(heap.min()).toBe(1)
      expect(heap.max()).toBe(3)
    })

    it('handles very large numbers', () => {
      const heap = new MedianHeap()
      heap.insert(Number.MAX_SAFE_INTEGER - 2)
      heap.insert(Number.MAX_SAFE_INTEGER - 1)
      heap.insert(Number.MAX_SAFE_INTEGER)
      expect(heap.median()).toBe(Number.MAX_SAFE_INTEGER - 1)
    })

    it('handles very small numbers', () => {
      const heap = new MedianHeap()
      heap.insert(Number.MIN_SAFE_INTEGER + 2)
      heap.insert(Number.MIN_SAFE_INTEGER + 1)
      heap.insert(Number.MIN_SAFE_INTEGER)
      expect(heap.median()).toBe(Number.MIN_SAFE_INTEGER + 1)
    })

    it('handles repeated clear and insert', () => {
      const heap = new MedianHeap()
      for (let round = 0; round < 5; round++) {
        heap.insert(round)
        heap.insert(round + 10)
        expect(heap.size).toBe(2)
        heap.clear()
        expect(heap.size).toBe(0)
      }
    })

    it('handles removing all elements one by one', () => {
      const heap = new MedianHeap()
      for (let i = 1; i <= 5; i++) heap.insert(i)
      for (let i = 1; i <= 5; i++) {
        expect(heap.remove(i)).toBe(true)
      }
      expect(heap.isEmpty()).toBe(true)
    })

    it('handles insert after removing all', () => {
      const heap = new MedianHeap()
      heap.insert(1)
      heap.insert(2)
      heap.remove(1)
      heap.remove(2)
      heap.insert(3)
      expect(heap.size).toBe(1)
      expect(heap.median()).toBe(3)
    })

    it('handles many duplicate values', () => {
      const heap = new MedianHeap()
      for (let i = 0; i < 100; i++) heap.insert(42)
      expect(heap.median()).toBe(42)
      expect(heap.size).toBe(100)
    })

    it('handles alternating high and low values', () => {
      const heap = new MedianHeap()
      for (let i = 0; i < 50; i++) {
        heap.insert(1000 + i)
        heap.insert(i)
      }
      expect(heap.size).toBe(100)
    })
  })

  describe('correctness against brute force', () => {
    it('matches brute force for random inserts', () => {
      const heap = new MedianHeap()
      const values: number[] = []
      for (let i = 0; i < 50; i++) {
        const v = Math.floor(Math.random() * 100)
        values.push(v)
        heap.insert(v)
        expect(heap.median()).toBeCloseTo(bruteMedian(values))
      }
    })

    it('matches brute force for inserts and removes', () => {
      const heap = new MedianHeap()
      const values: number[] = [5, 3, 8, 1, 9, 2, 7, 4, 6]
      for (const v of values) heap.insert(v)
      expect(heap.median()).toBeCloseTo(bruteMedian(values))
      heap.remove(5)
      const afterRemove = values.filter((v) => v !== 5)
      expect(heap.median()).toBeCloseTo(bruteMedian(afterRemove))
    })
  })

  describe('type safety', () => {
    it('exports MedianHeapOptions type', () => {
      const options: MedianHeapOptions<number> = { comparator: (a, b) => a - b }
      const heap = new MedianHeap(options)
      heap.insert(1)
      expect(heap.size).toBe(1)
    })

    it('works with default number type', () => {
      const heap = new MedianHeap()
      heap.insert(1)
      heap.insert(2)
      const m: number = heap.median()
      expect(m).toBe(1.5)
    })

    it('works with explicit generic type', () => {
      const heap = new MedianHeap<number>()
      heap.insert(42)
      expect(heap.median()).toBe(42)
    })
  })

  describe('stress tests', () => {
    it('handles 10000 inserts', () => {
      const heap = new MedianHeap()
      for (let i = 0; i < 10000; i++) heap.insert(i)
      expect(heap.size).toBe(10000)
      expect(heap.median()).toBe(4999.5)
    })

    it('handles random operations', () => {
      const heap = new MedianHeap()
      const seed = [7, 2, 9, 4, 6, 1, 8, 3, 5, 10]
      for (const v of seed) heap.insert(v)
      expect(heap.size).toBe(10)
      heap.remove(5)
      heap.remove(10)
      expect(heap.size).toBe(8)
      expect(heap.median()).toBeCloseTo(bruteMedian([7, 2, 9, 4, 6, 1, 8, 3]))
    })

    it('handles clone of large heap', () => {
      const heap = new MedianHeap()
      for (let i = 0; i < 1000; i++) heap.insert(i)
      const cloned = heap.clone()
      expect(cloned.size).toBe(1000)
      expect(cloned.median()).toBe(499.5)
    })

    it('handles fromArray with large dataset', () => {
      const arr = Array.from({ length: 1000 }, (_, i) => i)
      const heap = MedianHeap.fromArray(arr)
      expect(heap.size).toBe(1000)
      expect(heap.median()).toBe(499.5)
    })
  })

  describe('integration', () => {
    it('supports full lifecycle', () => {
      const heap = new MedianHeap()
      expect(heap.isEmpty()).toBe(true)

      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      expect(heap.size).toBe(3)
      expect(heap.median()).toBe(5)

      const cloned = heap.clone()
      expect(cloned.median()).toBe(5)

      heap.remove(5)
      expect(heap.size).toBe(2)
      expect(heap.median()).toBe(5)

      heap.clear()
      expect(heap.isEmpty()).toBe(true)
      expect(cloned.size).toBe(3)
    })

    it('supports mixed operations', () => {
      const heap = MedianHeap.fromArray([10, 20, 30, 40, 50])
      expect(heap.median()).toBe(30)
      expect(heap.contains(30)).toBe(true)
      heap.remove(30)
      expect(heap.contains(30)).toBe(false)
      expect(heap.median()).toBe(30)
      heap.insert(25)
      heap.insert(35)
      expect(heap.size).toBe(6)
      expect(heap.lowerMedian()).toBe(25)
      expect(heap.upperMedian()).toBe(35)
    })

    it('supports iteration after modifications', () => {
      const heap = MedianHeap.fromArray([5, 3, 7, 1, 9])
      heap.remove(5)
      const arr = [...heap]
      expect(arr).toEqual([1, 3, 7, 9])
    })

    it('supports forEach after modifications', () => {
      const heap = MedianHeap.fromArray([5, 3, 7, 1, 9])
      heap.remove(5)
      const items: number[] = []
      heap.forEach((v) => items.push(v))
      expect(items).toEqual([1, 3, 7, 9])
    })

    it('min and max across operations', () => {
      const heap = new MedianHeap()
      heap.insert(10)
      heap.insert(5)
      heap.insert(15)
      heap.insert(3)
      heap.insert(20)
      expect(heap.min()).toBe(3)
      expect(heap.max()).toBe(20)
      heap.remove(3)
      expect(heap.min()).toBe(5)
      heap.remove(20)
      expect(heap.max()).toBe(15)
    })
  })

  describe('lowerMedian and upperMedian consistency', () => {
    it('lowerMedian <= median <= upperMedian for odd count', () => {
      const heap = MedianHeap.fromArray([1, 2, 3])
      expect(heap.lowerMedian()).toBe(2)
      expect(heap.upperMedian()).toBe(2)
      expect(heap.median()).toBe(2)
    })

    it('lowerMedian <= median <= upperMedian for even count', () => {
      const heap = MedianHeap.fromArray([1, 2, 3, 4])
      expect(heap.lowerMedian()).toBe(2)
      expect(heap.upperMedian()).toBe(3)
      expect(heap.median()).toBe(2.5)
    })

    it('lowerMedian equals upperMedian for single element', () => {
      const heap = new MedianHeap()
      heap.insert(42)
      expect(heap.lowerMedian()).toBe(heap.upperMedian())
    })
  })

  describe('toArray consistency', () => {
    it('toArray matches iterator output', () => {
      const heap = MedianHeap.fromArray([3, 1, 4, 1, 5, 9, 2])
      expect(heap.toArray()).toEqual([...heap])
    })

    it('toArray matches forEach output', () => {
      const heap = MedianHeap.fromArray([3, 1, 4, 1, 5])
      const viaForEach: number[] = []
      heap.forEach((v) => viaForEach.push(v))
      expect(heap.toArray()).toEqual(viaForEach)
    })

    it('toArray length matches size', () => {
      const heap = MedianHeap.fromArray([3, 1, 4, 1, 5, 9])
      expect(heap.toArray().length).toBe(heap.size)
    })
  })
})
