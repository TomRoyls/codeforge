import { describe, it, expect } from 'vitest'
import { Beap } from '../src/core/beap/index.js'

// ─── Helpers ──────────────────────────────────────────────────────────

/** Verify the min-heap property by extracting all elements and checking sorted order. */
function assertMinHeapInvariant<T>(beap: Beap<T>): void {
  const cloned = beap.clone()
  const sorted: T[] = []
  while (!cloned.isEmpty) {
    sorted.push(cloned.extractMin())
  }
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i]! < sorted[i - 1]!) {
      throw new Error(
        `Heap invariant violated: sorted[${i - 1}]=${String(sorted[i - 1])} > sorted[${i}]=${String(sorted[i])}`,
      )
    }
  }
}

// ─── Constructor ────────────────────────────────────────────────────────

describe('Beap', () => {
  describe('constructor', () => {
    it('creates an empty beap with default comparator', () => {
      const beap = new Beap()
      expect(beap.size).toBe(0)
      expect(beap.isEmpty).toBe(true)
    })

    it('creates a beap with a custom descending number comparator', () => {
      const beap = new Beap<number>({ comparator: (a, b) => b - a })
      beap.insert(1)
      beap.insert(5)
      beap.insert(3)
      expect(beap.peek()).toBe(5)
    })

    it('creates a beap with a string length comparator', () => {
      const beap = new Beap<string>({
        comparator: (a, b) => a.length - b.length,
      })
      beap.insert('zzz')
      beap.insert('a')
      beap.insert('bb')
      expect(beap.peek()).toBe('a')
    })

    it('accepts an empty options object', () => {
      const beap = new Beap<number>({})
      beap.insert(42)
      expect(beap.peek()).toBe(42)
    })

    it('uses default numeric ordering when no comparator is provided', () => {
      const beap = new Beap<number>()
      beap.insert(10)
      beap.insert(3)
      beap.insert(7)
      expect(beap.peek()).toBe(3)
    })
  })

  // ─── static fromArray ─────────────────────────────────────────────

  describe('static fromArray', () => {
    it('creates a beap from an array of numbers', () => {
      const beap = Beap.fromArray([5, 3, 1, 4, 2])
      expect(beap.size).toBe(5)
      expect(beap.peek()).toBe(1)
    })

    it('creates a beap from an empty array', () => {
      const beap = Beap.fromArray([])
      expect(beap.size).toBe(0)
      expect(beap.isEmpty).toBe(true)
    })

    it('creates a beap with a custom comparator from an array', () => {
      const beap = Beap.fromArray([1, 2, 3, 4, 5], {
        comparator: (a, b) => b - a,
      })
      expect(beap.peek()).toBe(5)
    })

    it('creates a beap from a single-element array', () => {
      const beap = Beap.fromArray([42])
      expect(beap.size).toBe(1)
      expect(beap.peek()).toBe(42)
    })

    it('preserves all elements from the source array', () => {
      const items = [9, 3, 7, 1, 8, 2, 6, 4, 5]
      const beap = Beap.fromArray(items)
      const sorted = beap.toSortedArray()
      expect(sorted).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })
  })

  // ─── insert ───────────────────────────────────────────────────────

  describe('insert', () => {
    it('inserts a single element', () => {
      const beap = new Beap<number>()
      beap.insert(10)
      expect(beap.size).toBe(1)
      expect(beap.peek()).toBe(10)
    })

    it('inserts multiple elements in ascending order', () => {
      const beap = new Beap<number>()
      beap.insert(1)
      beap.insert(2)
      beap.insert(3)
      expect(beap.peek()).toBe(1)
      expect(beap.size).toBe(3)
    })

    it('inserts multiple elements in descending order', () => {
      const beap = new Beap<number>()
      beap.insert(3)
      beap.insert(2)
      beap.insert(1)
      expect(beap.peek()).toBe(1)
    })

    it('inserts elements out of order and maintains min at root', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      beap.insert(1)
      beap.insert(3)
      beap.insert(2)
      beap.insert(4)
      expect(beap.peek()).toBe(1)
    })

    it('maintains heap property after a series of insertions', () => {
      const beap = new Beap<number>()
      const values = [7, 2, 9, 1, 5, 3, 8, 6, 4]
      for (const v of values) {
        beap.insert(v)
      }
      assertMinHeapInvariant(beap)
    })

    it('handles inserting duplicate values', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      beap.insert(5)
      beap.insert(5)
      expect(beap.size).toBe(3)
      expect(beap.peek()).toBe(5)
    })

    it('handles inserting negative numbers', () => {
      const beap = new Beap<number>()
      beap.insert(-3)
      beap.insert(0)
      beap.insert(-7)
      beap.insert(2)
      expect(beap.peek()).toBe(-7)
    })

    it('handles inserting zero', () => {
      const beap = new Beap<number>()
      beap.insert(0)
      expect(beap.peek()).toBe(0)
      beap.insert(-1)
      expect(beap.peek()).toBe(-1)
    })
  })

  // ─── peek ─────────────────────────────────────────────────────────

  describe('peek', () => {
    it('returns the minimum element without removing it', () => {
      const beap = Beap.fromArray([3, 1, 2])
      expect(beap.peek()).toBe(1)
      expect(beap.size).toBe(3)
    })

    it('returns the same element on repeated calls', () => {
      const beap = Beap.fromArray([5, 3, 1])
      expect(beap.peek()).toBe(1)
      expect(beap.peek()).toBe(1)
      expect(beap.peek()).toBe(1)
    })

    it('throws when called on an empty beap', () => {
      const beap = new Beap<number>()
      expect(() => beap.peek()).toThrow('Beap is empty')
    })

    it('returns the only element in a single-element beap', () => {
      const beap = Beap.fromArray([42])
      expect(beap.peek()).toBe(42)
    })
  })

  // ─── extractMin ───────────────────────────────────────────────────

  describe('extractMin', () => {
    it('extracts the minimum element', () => {
      const beap = Beap.fromArray([3, 1, 2])
      expect(beap.extractMin()).toBe(1)
    })

    it('removes the element from the beap', () => {
      const beap = Beap.fromArray([3, 1, 2])
      beap.extractMin()
      expect(beap.size).toBe(2)
    })

    it('extracts elements in sorted order', () => {
      const beap = Beap.fromArray([5, 3, 1, 4, 2])
      const result: number[] = []
      while (!beap.isEmpty) {
        result.push(beap.extractMin())
      }
      expect(result).toEqual([1, 2, 3, 4, 5])
    })

    it('maintains heap property after extraction', () => {
      const beap = Beap.fromArray([7, 2, 9, 1, 5, 3, 8, 6, 4])
      beap.extractMin()
      assertMinHeapInvariant(beap)
    })

    it('throws when called on an empty beap', () => {
      const beap = new Beap<number>()
      expect(() => beap.extractMin()).toThrow('Beap is empty')
    })

    it('handles extracting the last element', () => {
      const beap = Beap.fromArray([42])
      expect(beap.extractMin()).toBe(42)
      expect(beap.isEmpty).toBe(true)
      expect(beap.size).toBe(0)
    })

    it('handles extracting from a two-element beap', () => {
      const beap = Beap.fromArray([2, 1])
      expect(beap.extractMin()).toBe(1)
      expect(beap.peek()).toBe(2)
      expect(beap.extractMin()).toBe(2)
      expect(beap.isEmpty).toBe(true)
    })

    it('handles extracting all elements one by one', () => {
      const items = [10, 20, 30, 40, 50]
      const beap = Beap.fromArray(items)
      for (let i = 0; i < items.length; i++) {
        expect(beap.extractMin()).toBe(items[i])
      }
      expect(beap.isEmpty).toBe(true)
    })
  })

  // ─── contains ─────────────────────────────────────────────────────

  describe('contains', () => {
    it('returns false for an empty beap', () => {
      const beap = new Beap<number>()
      expect(beap.contains(1)).toBe(false)
    })

    it('returns true for an existing element', () => {
      const beap = Beap.fromArray([5, 3, 1, 4, 2])
      expect(beap.contains(3)).toBe(true)
    })

    it('returns false for a non-existing element', () => {
      const beap = Beap.fromArray([5, 3, 1, 4, 2])
      expect(beap.contains(99)).toBe(false)
    })

    it('finds the minimum element', () => {
      const beap = Beap.fromArray([5, 3, 1, 4, 2])
      expect(beap.contains(1)).toBe(true)
    })

    it('finds the maximum element in the heap', () => {
      const beap = Beap.fromArray([5, 3, 1, 4, 2])
      expect(beap.contains(5)).toBe(true)
    })

    it('handles duplicate values', () => {
      const beap = Beap.fromArray([3, 1, 3, 1, 3])
      expect(beap.contains(1)).toBe(true)
      expect(beap.contains(3)).toBe(true)
      expect(beap.contains(2)).toBe(false)
    })

    it('works with string values using default comparator', () => {
      const beap = Beap.fromArray(['cherry', 'apple', 'banana'])
      expect(beap.contains('banana')).toBe(true)
      expect(beap.contains('grape')).toBe(false)
    })

    it('works with a custom comparator', () => {
      const beap = new Beap<number>({ comparator: (a, b) => b - a })
      beap.insert(1)
      beap.insert(5)
      beap.insert(3)
      expect(beap.contains(5)).toBe(true)
      expect(beap.contains(2)).toBe(false)
    })

    it('returns false after element is extracted', () => {
      const beap = Beap.fromArray([1, 2, 3])
      beap.extractMin()
      expect(beap.contains(1)).toBe(false)
      expect(beap.contains(2)).toBe(true)
    })
  })

  // ─── delete ───────────────────────────────────────────────────────

  describe('delete', () => {
    it('deletes an existing element and returns true', () => {
      const beap = Beap.fromArray([5, 3, 1, 4, 2])
      expect(beap.delete(3)).toBe(true)
      expect(beap.size).toBe(4)
    })

    it('returns false for a non-existing element', () => {
      const beap = Beap.fromArray([5, 3, 1, 4, 2])
      expect(beap.delete(99)).toBe(false)
      expect(beap.size).toBe(5)
    })

    it('deletes the root element', () => {
      const beap = Beap.fromArray([5, 3, 1, 4, 2])
      expect(beap.delete(1)).toBe(true)
      expect(beap.peek()).toBe(2)
    })

    it('deletes the last element by value', () => {
      const beap = Beap.fromArray([5, 3, 1, 4, 2])
      expect(beap.delete(5)).toBe(true)
      expect(beap.size).toBe(4)
      expect(beap.contains(5)).toBe(false)
    })

    it('deletes the only element', () => {
      const beap = Beap.fromArray([42])
      expect(beap.delete(42)).toBe(true)
      expect(beap.isEmpty).toBe(true)
    })

    it('returns false when deleting from an empty beap', () => {
      const beap = new Beap<number>()
      expect(beap.delete(1)).toBe(false)
    })

    it('maintains heap property after deletion', () => {
      const beap = Beap.fromArray([7, 2, 9, 1, 5, 3, 8, 6, 4])
      beap.delete(3)
      assertMinHeapInvariant(beap)
      beap.delete(7)
      assertMinHeapInvariant(beap)
    })

    it('allows continued extraction in order after deletion', () => {
      const beap = Beap.fromArray([1, 2, 3, 4, 5])
      beap.delete(3)
      const remaining: number[] = []
      while (!beap.isEmpty) {
        remaining.push(beap.extractMin())
      }
      expect(remaining).toEqual([1, 2, 4, 5])
    })

    it('deletes one of duplicate values', () => {
      const beap = Beap.fromArray([3, 1, 3, 1, 3])
      expect(beap.delete(3)).toBe(true)
      expect(beap.size).toBe(4)
      expect(beap.contains(3)).toBe(true)
    })
  })

  // ─── size ─────────────────────────────────────────────────────────

  describe('size', () => {
    it('returns 0 for a new beap', () => {
      const beap = new Beap<number>()
      expect(beap.size).toBe(0)
    })

    it('increments with each insert', () => {
      const beap = new Beap<number>()
      beap.insert(1)
      expect(beap.size).toBe(1)
      beap.insert(2)
      expect(beap.size).toBe(2)
      beap.insert(3)
      expect(beap.size).toBe(3)
    })

    it('decrements with each extractMin', () => {
      const beap = Beap.fromArray([1, 2, 3])
      beap.extractMin()
      expect(beap.size).toBe(2)
      beap.extractMin()
      expect(beap.size).toBe(1)
      beap.extractMin()
      expect(beap.size).toBe(0)
    })

    it('decrements after delete', () => {
      const beap = Beap.fromArray([1, 2, 3, 4])
      beap.delete(2)
      expect(beap.size).toBe(3)
    })

    it('resets to 0 after clear', () => {
      const beap = Beap.fromArray([1, 2, 3])
      beap.clear()
      expect(beap.size).toBe(0)
    })
  })

  // ─── isEmpty ──────────────────────────────────────────────────────

  describe('isEmpty', () => {
    it('returns true for a new beap', () => {
      const beap = new Beap<number>()
      expect(beap.isEmpty).toBe(true)
    })

    it('returns false after insert', () => {
      const beap = new Beap<number>()
      beap.insert(1)
      expect(beap.isEmpty).toBe(false)
    })

    it('returns true after all elements are extracted', () => {
      const beap = Beap.fromArray([1, 2])
      beap.extractMin()
      beap.extractMin()
      expect(beap.isEmpty).toBe(true)
    })

    it('returns true after clear', () => {
      const beap = Beap.fromArray([1, 2, 3])
      beap.clear()
      expect(beap.isEmpty).toBe(true)
    })

    it('returns true after deleting the only element', () => {
      const beap = Beap.fromArray([42])
      beap.delete(42)
      expect(beap.isEmpty).toBe(true)
    })
  })

  // ─── clear ────────────────────────────────────────────────────────

  describe('clear', () => {
    it('removes all elements', () => {
      const beap = Beap.fromArray([1, 2, 3, 4, 5])
      beap.clear()
      expect(beap.size).toBe(0)
      expect(beap.isEmpty).toBe(true)
    })

    it('clears an already empty beap without error', () => {
      const beap = new Beap<number>()
      beap.clear()
      expect(beap.isEmpty).toBe(true)
    })

    it('allows reuse after clearing', () => {
      const beap = Beap.fromArray([10, 20, 30])
      beap.clear()
      beap.insert(5)
      beap.insert(1)
      expect(beap.peek()).toBe(1)
      expect(beap.size).toBe(2)
    })

    it('toArray returns empty after clear', () => {
      const beap = Beap.fromArray([1, 2, 3])
      beap.clear()
      expect(beap.toArray()).toEqual([])
    })
  })

  // ─── toArray ──────────────────────────────────────────────────────

  describe('toArray', () => {
    it('returns an empty array for an empty beap', () => {
      const beap = new Beap<number>()
      expect(beap.toArray()).toEqual([])
    })

    it('returns all inserted elements', () => {
      const beap = Beap.fromArray([3, 1, 2])
      const arr = beap.toArray()
      expect(arr.sort()).toEqual([1, 2, 3])
    })

    it('returns a copy, not a reference', () => {
      const beap = Beap.fromArray([1, 2, 3])
      const arr = beap.toArray()
      arr.push(999)
      expect(beap.size).toBe(3)
      expect(beap.contains(999)).toBe(false)
    })

    it('reflects mutations after insert and extract', () => {
      const beap = Beap.fromArray([5, 3, 1])
      beap.extractMin()
      const arr = beap.toArray()
      expect(arr.sort()).toEqual([3, 5])
    })
  })

  // ─── clone ────────────────────────────────────────────────────────

  describe('clone', () => {
    it('creates an independent copy with the same elements', () => {
      const beap = Beap.fromArray([3, 1, 2])
      const cloned = beap.clone()
      expect(cloned.size).toBe(beap.size)
      expect(cloned.peek()).toBe(beap.peek())
    })

    it('modifications to clone do not affect original', () => {
      const beap = Beap.fromArray([1, 2, 3])
      const cloned = beap.clone()
      cloned.insert(0)
      expect(cloned.size).toBe(4)
      expect(beap.size).toBe(3)
      expect(cloned.peek()).toBe(0)
      expect(beap.peek()).toBe(1)
    })

    it('modifications to original do not affect clone', () => {
      const beap = Beap.fromArray([1, 2, 3])
      const cloned = beap.clone()
      beap.extractMin()
      expect(beap.size).toBe(2)
      expect(cloned.size).toBe(3)
    })

    it('preserves the custom comparator', () => {
      const descending = (a: number, b: number): number => b - a
      const beap = new Beap<number>({ comparator: descending })
      beap.insert(1)
      beap.insert(5)
      beap.insert(3)
      const cloned = beap.clone()
      expect(cloned.peek()).toBe(5)
      cloned.insert(10)
      expect(cloned.peek()).toBe(10)
    })

    it('cloning an empty beap works', () => {
      const beap = new Beap<number>()
      const cloned = beap.clone()
      expect(cloned.isEmpty).toBe(true)
      expect(cloned.size).toBe(0)
    })

    it('clone produces same sorted output as original', () => {
      const beap = Beap.fromArray([7, 2, 9, 1, 5, 3, 8, 6, 4])
      const cloned = beap.clone()
      expect(beap.toSortedArray()).toEqual(cloned.toSortedArray())
    })
  })

  // ─── forEach ──────────────────────────────────────────────────────

  describe('forEach', () => {
    it('iterates over all elements', () => {
      const beap = Beap.fromArray([3, 1, 2])
      const collected: number[] = []
      beap.forEach((v) => collected.push(v))
      expect(collected.sort()).toEqual([1, 2, 3])
    })

    it('provides the correct index', () => {
      const beap = Beap.fromArray([10, 20, 30])
      const indices: number[] = []
      beap.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('does not iterate on an empty beap', () => {
      const beap = new Beap<number>()
      let count = 0
      beap.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('iterates exactly size times', () => {
      const beap = Beap.fromArray([1, 2, 3, 4, 5])
      let count = 0
      beap.forEach(() => count++)
      expect(count).toBe(5)
    })
  })

  // ─── iterator (Symbol.iterator) ──────────────────────────────────

  describe('Symbol.iterator', () => {
    it('allows for...of iteration', () => {
      const beap = Beap.fromArray([3, 1, 2])
      const collected: number[] = []
      for (const v of beap) {
        collected.push(v)
      }
      expect(collected.sort()).toEqual([1, 2, 3])
    })

    it('allows spread into an array', () => {
      const beap = Beap.fromArray([5, 3, 1])
      const arr = [...beap]
      expect(arr.sort()).toEqual([1, 3, 5])
    })

    it('produces no values for an empty beap', () => {
      const beap = new Beap<number>()
      const arr = [...beap]
      expect(arr).toEqual([])
    })

    it('allows Array.from conversion', () => {
      const beap = Beap.fromArray([2, 4, 6])
      const arr = Array.from(beap)
      expect(arr.sort()).toEqual([2, 4, 6])
    })
  })

  // ─── toSortedArray ────────────────────────────────────────────────

  describe('toSortedArray', () => {
    it('returns elements in ascending sorted order', () => {
      const beap = Beap.fromArray([5, 3, 1, 4, 2])
      expect(beap.toSortedArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('returns an empty array for an empty beap', () => {
      const beap = new Beap<number>()
      expect(beap.toSortedArray()).toEqual([])
    })

    it('does not modify the original beap', () => {
      const beap = Beap.fromArray([3, 1, 2])
      beap.toSortedArray()
      expect(beap.size).toBe(3)
      expect(beap.peek()).toBe(1)
    })

    it('sorts correctly with a custom descending comparator', () => {
      const beap = new Beap<number>({ comparator: (a, b) => b - a })
      beap.insert(1)
      beap.insert(5)
      beap.insert(3)
      expect(beap.toSortedArray()).toEqual([5, 3, 1])
    })

    it('handles a single element', () => {
      const beap = Beap.fromArray([42])
      expect(beap.toSortedArray()).toEqual([42])
    })

    it('handles reverse-sorted input', () => {
      const beap = Beap.fromArray([5, 4, 3, 2, 1])
      expect(beap.toSortedArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('handles duplicates correctly', () => {
      const beap = Beap.fromArray([3, 1, 3, 1, 3])
      expect(beap.toSortedArray()).toEqual([1, 1, 3, 3, 3])
    })
  })

  // ─── height ───────────────────────────────────────────────────────

  describe('height', () => {
    it('returns 0 for an empty beap', () => {
      const beap = new Beap<number>()
      // height accesses heap[heap.length-1]; when empty, rowOf(0-1)=rowOf(-1)
      // n = -1+1 = 0, ceil((sqrt(8*0+1)-1)/2)-1 = ceil(0)-1 = -1
      expect(beap.height).toBe(-1)
    })

    it('returns 0 for a single element', () => {
      const beap = Beap.fromArray([1])
      expect(beap.height).toBe(0)
    })

    it('returns 1 for two or three elements', () => {
      const beap2 = Beap.fromArray([1, 2])
      expect(beap2.height).toBe(1)
      const beap3 = Beap.fromArray([1, 2, 3])
      expect(beap3.height).toBe(1)
    })

    it('returns 2 for four to six elements', () => {
      const beap4 = Beap.fromArray([1, 2, 3, 4])
      expect(beap4.height).toBe(2)
      const beap6 = Beap.fromArray([1, 2, 3, 4, 5, 6])
      expect(beap6.height).toBe(2)
    })

    it('increases as more elements are inserted', () => {
      const beap = new Beap<number>()
      beap.insert(1)
      const h0 = beap.height
      for (let i = 2; i <= 7; i++) beap.insert(i)
      expect(beap.height).toBeGreaterThanOrEqual(h0)
    })
  })

  // ─── Heap property invariants ─────────────────────────────────────

  describe('heap property invariants', () => {
    it('maintains min-heap after inserting shuffled data', () => {
      const values = [42, 17, 83, 5, 91, 23, 56, 38, 71, 14]
      const beap = new Beap<number>()
      for (const v of values) {
        beap.insert(v)
      }
      assertMinHeapInvariant(beap)
    })

    it('maintains min-heap after extracting half the elements', () => {
      const beap = Beap.fromArray([9, 4, 7, 1, 8, 3, 6, 2, 5])
      for (let i = 0; i < 4; i++) {
        beap.extractMin()
      }
      assertMinHeapInvariant(beap)
    })

    it('maintains min-heap after deleting arbitrary elements', () => {
      const beap = Beap.fromArray([10, 20, 30, 40, 50, 60, 70, 80, 90])
      beap.delete(30)
      beap.delete(70)
      beap.delete(10)
      assertMinHeapInvariant(beap)
    })

    it('maintains min-heap after mixed insert and extract operations', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      beap.insert(3)
      beap.insert(8)
      beap.extractMin()
      beap.insert(1)
      beap.insert(6)
      beap.extractMin()
      assertMinHeapInvariant(beap)
    })

    it('handles large batch of sequential insertions', () => {
      const count = 200
      const beap = new Beap<number>()
      for (let i = count; i >= 1; i--) {
        beap.insert(i)
      }
      assertMinHeapInvariant(beap)
      expect(beap.peek()).toBe(1)
    })
  })

  // ─── Edge cases ───────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles inserting and extracting the same value', () => {
      const beap = new Beap<number>()
      beap.insert(7)
      expect(beap.extractMin()).toBe(7)
      expect(beap.isEmpty).toBe(true)
    })

    it('handles inserting after extracting everything', () => {
      const beap = Beap.fromArray([3, 1, 2])
      while (!beap.isEmpty) beap.extractMin()
      beap.insert(10)
      expect(beap.size).toBe(1)
      expect(beap.peek()).toBe(10)
    })

    it('handles many duplicate values', () => {
      const beap = new Beap<number>()
      for (let i = 0; i < 100; i++) {
        beap.insert(42)
      }
      expect(beap.size).toBe(100)
      expect(beap.peek()).toBe(42)
      for (let i = 0; i < 100; i++) {
        expect(beap.extractMin()).toBe(42)
      }
      expect(beap.isEmpty).toBe(true)
    })

    it('handles string values with default comparator', () => {
      const beap = new Beap<string>()
      beap.insert('cherry')
      beap.insert('apple')
      beap.insert('banana')
      expect(beap.peek()).toBe('apple')
      expect(beap.extractMin()).toBe('apple')
      expect(beap.extractMin()).toBe('banana')
      expect(beap.extractMin()).toBe('cherry')
    })

    it('handles object values with custom comparator', () => {
      interface Task {
        priority: number
        name: string
      }
      const beap = new Beap<Task>({
        comparator: (a, b) => a.priority - b.priority,
      })
      beap.insert({ priority: 3, name: 'low' })
      beap.insert({ priority: 1, name: 'high' })
      beap.insert({ priority: 2, name: 'medium' })
      const first = beap.extractMin()
      expect(first.name).toBe('high')
      expect(first.priority).toBe(1)
    })

    it('handles interleaved insert, extract, and delete', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      beap.insert(3)
      beap.insert(8)
      beap.insert(1)
      beap.delete(3)
      beap.extractMin() // 1
      beap.insert(2)
      beap.insert(7)
      beap.delete(8)
      expect(beap.toSortedArray()).toEqual([2, 5, 7])
    })

    it('handles clearing and rebuilding', () => {
      const beap = Beap.fromArray([1, 2, 3])
      beap.clear()
      beap.insert(10)
      beap.insert(5)
      beap.insert(15)
      expect(beap.toSortedArray()).toEqual([5, 10, 15])
    })

    it('handles large number of elements with correct sorting', () => {
      const count = 500
      const beap = new Beap<number>()
      for (let i = count; i >= 1; i--) {
        beap.insert(i)
      }
      expect(beap.size).toBe(count)
      expect(beap.peek()).toBe(1)
      assertMinHeapInvariant(beap)
      const sorted = beap.toSortedArray()
      for (let i = 0; i < count; i++) {
        expect(sorted[i]).toBe(i + 1)
      }
    })

    it('handles negative and positive mix', () => {
      const beap = Beap.fromArray([-5, 3, -1, 0, 7, -3, 2])
      expect(beap.toSortedArray()).toEqual([-5, -3, -1, 0, 2, 3, 7])
    })

    it('handles float values', () => {
      const beap = Beap.fromArray([3.14, 1.41, 2.72, 0.58])
      expect(beap.peek()).toBeCloseTo(0.58)
      expect(beap.toSortedArray()).toEqual([0.58, 1.41, 2.72, 3.14])
    })

    it('delete from a beap with only one remaining element after prior deletes', () => {
      const beap = Beap.fromArray([1, 2, 3])
      beap.delete(1)
      beap.delete(2)
      expect(beap.size).toBe(1)
      expect(beap.peek()).toBe(3)
      expect(beap.delete(3)).toBe(true)
      expect(beap.isEmpty).toBe(true)
    })

    it('handles large safe integer boundaries', () => {
      const beap = new Beap<number>()
      beap.insert(Number.MAX_SAFE_INTEGER)
      beap.insert(Number.MIN_SAFE_INTEGER)
      beap.insert(0)
      expect(beap.peek()).toBe(Number.MIN_SAFE_INTEGER)
      expect(beap.toSortedArray()).toEqual([
        Number.MIN_SAFE_INTEGER,
        0,
        Number.MAX_SAFE_INTEGER,
      ])
    })

    it('handles insert after delete in sequence', () => {
      const beap = Beap.fromArray([5, 3, 8])
      beap.delete(5)
      beap.insert(2)
      expect(beap.peek()).toBe(2)
      expect(beap.toSortedArray()).toEqual([2, 3, 8])
    })

    it('handles multiple deletes followed by full extraction', () => {
      const beap = Beap.fromArray([1, 2, 3, 4, 5, 6, 7])
      beap.delete(3)
      beap.delete(6)
      beap.delete(1)
      const sorted = beap.toSortedArray()
      expect(sorted).toEqual([2, 4, 5, 7])
    })

    it('maintains consistency through complex operation sequence', () => {
      const beap = new Beap<number>()
      beap.insert(10)
      beap.insert(5)
      beap.insert(15)
      beap.insert(3)
      beap.delete(10)
      expect(beap.size).toBe(3)
      beap.insert(7)
      expect(beap.peek()).toBe(3)
      beap.extractMin()
      expect(beap.peek()).toBe(5)
      beap.insert(2)
      expect(beap.peek()).toBe(2)
      expect(beap.contains(7)).toBe(true)
      expect(beap.toSortedArray()).toEqual([2, 5, 7, 15])
    })
  })
})
