import { describe, it, expect } from 'vitest'
import { DoubleEndedPQ } from '../../src/core/double-ended-pq/index.js'

describe('DoubleEndedPQ', () => {
  describe('constructor', () => {
    it('creates empty queue with default comparator', () => {
      const pq = new DoubleEndedPQ()
      expect(pq.size()).toBe(0)
      expect(pq.isEmpty()).toBe(true)
    })

    it('creates queue with custom comparator', () => {
      const pq = new DoubleEndedPQ<number>({ comparator: (a, b) => b - a })
      expect(pq.size()).toBe(0)
    })

    it('creates queue with string comparator', () => {
      const pq = new DoubleEndedPQ<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      expect(pq.size()).toBe(0)
    })

    it('creates queue with object comparator', () => {
      const pq = new DoubleEndedPQ<{ priority: number }>({
        comparator: (a, b) => a.priority - b.priority,
      })
      expect(pq.size()).toBe(0)
    })
  })

  describe('push', () => {
    it('pushes a single item', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(5)
      expect(pq.size()).toBe(1)
      expect(pq.isEmpty()).toBe(false)
    })

    it('pushes multiple items', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(3)
      pq.push(1)
      pq.push(4)
      pq.push(1)
      pq.push(5)
      expect(pq.size()).toBe(5)
    })

    it('maintains min at root after pushes', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(5)
      pq.push(3)
      pq.push(1)
      expect(pq.peekMin()).toBe(1)
    })

    it('maintains max accessible after pushes', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(1)
      pq.push(5)
      pq.push(3)
      expect(pq.peekMax()).toBe(5)
    })

    it('handles duplicate values', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(3)
      pq.push(3)
      pq.push(3)
      expect(pq.size()).toBe(3)
      expect(pq.peekMin()).toBe(3)
      expect(pq.peekMax()).toBe(3)
    })

    it('pushes negative numbers', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(-5)
      pq.push(-1)
      pq.push(-3)
      expect(pq.peekMin()).toBe(-5)
      expect(pq.peekMax()).toBe(-1)
    })

    it('pushes zero', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(0)
      expect(pq.peekMin()).toBe(0)
      expect(pq.peekMax()).toBe(0)
    })

    it('handles ascending order push', () => {
      const pq = new DoubleEndedPQ<number>()
      for (let i = 1; i <= 10; i++) pq.push(i)
      expect(pq.peekMin()).toBe(1)
      expect(pq.peekMax()).toBe(10)
    })

    it('handles descending order push', () => {
      const pq = new DoubleEndedPQ<number>()
      for (let i = 10; i >= 1; i--) pq.push(i)
      expect(pq.peekMin()).toBe(1)
      expect(pq.peekMax()).toBe(10)
    })

    it('handles strings with custom comparator', () => {
      const pq = new DoubleEndedPQ<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      pq.push('cherry')
      pq.push('apple')
      pq.push('banana')
      expect(pq.peekMin()).toBe('apple')
      expect(pq.peekMax()).toBe('cherry')
    })
  })

  describe('peekMin', () => {
    it('returns the minimum element', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(5)
      pq.push(3)
      pq.push(1)
      pq.push(4)
      expect(pq.peekMin()).toBe(1)
    })

    it('does not remove the element', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(3)
      pq.push(1)
      pq.push(2)
      pq.peekMin()
      expect(pq.size()).toBe(3)
    })

    it('returns same min on repeated calls', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(5)
      pq.push(1)
      pq.push(3)
      expect(pq.peekMin()).toBe(1)
      expect(pq.peekMin()).toBe(1)
      expect(pq.peekMin()).toBe(1)
    })

    it('throws on empty queue', () => {
      const pq = new DoubleEndedPQ<number>()
      expect(() => pq.peekMin()).toThrow('DoubleEndedPQ is empty')
    })

    it('returns correct min after many pushes', () => {
      const pq = new DoubleEndedPQ<number>()
      for (let i = 100; i >= 1; i--) pq.push(i)
      expect(pq.peekMin()).toBe(1)
    })
  })

  describe('peekMax', () => {
    it('returns the maximum element', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(1)
      pq.push(5)
      pq.push(3)
      expect(pq.peekMax()).toBe(5)
    })

    it('does not remove the element', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(3)
      pq.push(1)
      pq.push(5)
      pq.peekMax()
      expect(pq.size()).toBe(3)
    })

    it('returns same max on repeated calls', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(5)
      pq.push(1)
      pq.push(3)
      expect(pq.peekMax()).toBe(5)
      expect(pq.peekMax()).toBe(5)
      expect(pq.peekMax()).toBe(5)
    })

    it('throws on empty queue', () => {
      const pq = new DoubleEndedPQ<number>()
      expect(() => pq.peekMax()).toThrow('DoubleEndedPQ is empty')
    })

    it('returns correct max after many pushes', () => {
      const pq = new DoubleEndedPQ<number>()
      for (let i = 1; i <= 100; i++) pq.push(i)
      expect(pq.peekMax()).toBe(100)
    })
  })

  describe('popMin', () => {
    it('removes and returns the minimum', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(3)
      pq.push(1)
      pq.push(2)
      expect(pq.popMin()).toBe(1)
      expect(pq.size()).toBe(2)
    })

    it('removes elements in ascending order', () => {
      const pq = new DoubleEndedPQ<number>()
      const items = [5, 3, 1, 4, 2]
      for (const item of items) pq.push(item)
      const sorted: number[] = []
      while (!pq.isEmpty()) sorted.push(pq.popMin())
      expect(sorted).toEqual([1, 2, 3, 4, 5])
    })

    it('handles single element', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(42)
      expect(pq.popMin()).toBe(42)
      expect(pq.isEmpty()).toBe(true)
    })

    it('handles two elements', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(5)
      pq.push(1)
      expect(pq.popMin()).toBe(1)
      expect(pq.popMin()).toBe(5)
    })

    it('throws on empty queue', () => {
      const pq = new DoubleEndedPQ<number>()
      expect(() => pq.popMin()).toThrow('DoubleEndedPQ is empty')
    })

    it('handles duplicates correctly', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(3)
      pq.push(1)
      pq.push(1)
      pq.push(3)
      expect(pq.popMin()).toBe(1)
      expect(pq.popMin()).toBe(1)
      expect(pq.popMin()).toBe(3)
      expect(pq.popMin()).toBe(3)
    })

    it('handles negative numbers', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(-1)
      pq.push(-5)
      pq.push(-3)
      expect(pq.popMin()).toBe(-5)
      expect(pq.popMin()).toBe(-3)
      expect(pq.popMin()).toBe(-1)
    })
  })

  describe('popMax', () => {
    it('removes and returns the maximum', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(1)
      pq.push(5)
      pq.push(3)
      expect(pq.popMax()).toBe(5)
      expect(pq.size()).toBe(2)
    })

    it('removes elements in descending order', () => {
      const pq = new DoubleEndedPQ<number>()
      const items = [5, 3, 1, 4, 2]
      for (const item of items) pq.push(item)
      const sorted: number[] = []
      while (!pq.isEmpty()) sorted.push(pq.popMax())
      expect(sorted).toEqual([5, 4, 3, 2, 1])
    })

    it('handles single element', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(42)
      expect(pq.popMax()).toBe(42)
      expect(pq.isEmpty()).toBe(true)
    })

    it('handles two elements', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(1)
      pq.push(5)
      expect(pq.popMax()).toBe(5)
      expect(pq.popMax()).toBe(1)
    })

    it('throws on empty queue', () => {
      const pq = new DoubleEndedPQ<number>()
      expect(() => pq.popMax()).toThrow('DoubleEndedPQ is empty')
    })

    it('handles duplicates correctly', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(3)
      pq.push(1)
      pq.push(1)
      pq.push(3)
      expect(pq.popMax()).toBe(3)
      expect(pq.popMax()).toBe(3)
      expect(pq.popMax()).toBe(1)
      expect(pq.popMax()).toBe(1)
    })

    it('handles negative numbers', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(-1)
      pq.push(-5)
      pq.push(-3)
      expect(pq.popMax()).toBe(-1)
      expect(pq.popMax()).toBe(-3)
      expect(pq.popMax()).toBe(-5)
    })
  })

  describe('size and isEmpty', () => {
    it('returns 0 for empty queue', () => {
      const pq = new DoubleEndedPQ<number>()
      expect(pq.size()).toBe(0)
    })

    it('returns correct size after pushes', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(1)
      pq.push(2)
      pq.push(3)
      expect(pq.size()).toBe(3)
    })

    it('returns correct size after pops', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(1)
      pq.push(2)
      pq.push(3)
      pq.popMin()
      expect(pq.size()).toBe(2)
      pq.popMax()
      expect(pq.size()).toBe(1)
    })

    it('isEmpty returns true when empty', () => {
      const pq = new DoubleEndedPQ<number>()
      expect(pq.isEmpty()).toBe(true)
    })

    it('isEmpty returns false when not empty', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(1)
      expect(pq.isEmpty()).toBe(false)
    })

    it('isEmpty returns true after clearing all elements', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(1)
      pq.push(2)
      pq.push(3)
      pq.popMin()
      pq.popMin()
      pq.popMin()
      expect(pq.isEmpty()).toBe(true)
    })

    it('tracks size correctly through interleaved operations', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(1)
      expect(pq.size()).toBe(1)
      pq.push(2)
      expect(pq.size()).toBe(2)
      pq.popMin()
      expect(pq.size()).toBe(1)
      pq.push(3)
      expect(pq.size()).toBe(2)
      pq.popMax()
      expect(pq.size()).toBe(1)
    })
  })

  describe('clear', () => {
    it('clears all elements', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(1)
      pq.push(2)
      pq.push(3)
      pq.clear()
      expect(pq.size()).toBe(0)
      expect(pq.isEmpty()).toBe(true)
    })

    it('clear on empty queue is no-op', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.clear()
      expect(pq.size()).toBe(0)
      expect(pq.isEmpty()).toBe(true)
    })

    it('queue is usable after clear', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(1)
      pq.push(2)
      pq.clear()
      pq.push(3)
      pq.push(4)
      expect(pq.size()).toBe(2)
      expect(pq.peekMin()).toBe(3)
      expect(pq.peekMax()).toBe(4)
    })

    it('can push same elements after clear', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(5)
      pq.push(3)
      pq.clear()
      pq.push(5)
      pq.push(3)
      expect(pq.popMin()).toBe(3)
      expect(pq.popMax()).toBe(5)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty queue', () => {
      const pq = new DoubleEndedPQ<number>()
      expect(pq.toArray()).toEqual([])
    })

    it('returns heap array (not necessarily sorted)', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(3)
      pq.push(1)
      pq.push(2)
      const arr = pq.toArray()
      expect(arr.length).toBe(3)
      expect(arr).toContain(1)
      expect(arr).toContain(2)
      expect(arr).toContain(3)
    })

    it('returns copy of heap (not reference)', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(1)
      pq.push(2)
      const arr = pq.toArray()
      arr[0] = 999
      expect(pq.toArray()[0]).not.toBe(999)
    })

    it('does not modify queue', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(1)
      pq.push(2)
      pq.push(3)
      pq.toArray()
      expect(pq.size()).toBe(3)
    })
  })

  describe('toSortedArray', () => {
    it('returns empty array for empty queue', () => {
      const pq = new DoubleEndedPQ<number>()
      expect(pq.toSortedArray()).toEqual([])
    })

    it('returns sorted array', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(5)
      pq.push(3)
      pq.push(1)
      pq.push(4)
      pq.push(2)
      expect(pq.toSortedArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('does not modify queue', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(3)
      pq.push(1)
      pq.push(2)
      pq.toSortedArray()
      expect(pq.size()).toBe(3)
    })

    it('handles single element', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(42)
      expect(pq.toSortedArray()).toEqual([42])
    })

    it('handles already sorted input', () => {
      const pq = new DoubleEndedPQ<number>()
      for (let i = 1; i <= 5; i++) pq.push(i)
      expect(pq.toSortedArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('handles reverse sorted input', () => {
      const pq = new DoubleEndedPQ<number>()
      for (let i = 5; i >= 1; i--) pq.push(i)
      expect(pq.toSortedArray()).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('contains', () => {
    it('returns false for empty queue', () => {
      const pq = new DoubleEndedPQ<number>()
      expect(pq.contains(1)).toBe(false)
    })

    it('returns true for existing element', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(3)
      pq.push(1)
      pq.push(2)
      expect(pq.contains(1)).toBe(true)
      expect(pq.contains(2)).toBe(true)
      expect(pq.contains(3)).toBe(true)
    })

    it('returns false for missing element', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(1)
      pq.push(2)
      pq.push(3)
      expect(pq.contains(4)).toBe(false)
      expect(pq.contains(0)).toBe(false)
    })

    it('finds duplicates', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(3)
      pq.push(3)
      expect(pq.contains(3)).toBe(true)
    })

    it('works after removal', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(1)
      pq.push(2)
      pq.push(3)
      pq.popMin()
      expect(pq.contains(1)).toBe(false)
      expect(pq.contains(2)).toBe(true)
      expect(pq.contains(3)).toBe(true)
    })

    it('works with strings using custom comparator', () => {
      const pq = new DoubleEndedPQ<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      pq.push('apple')
      pq.push('banana')
      expect(pq.contains('apple')).toBe(true)
      expect(pq.contains('cherry')).toBe(false)
    })
  })

  describe('remove', () => {
    it('removes an existing element', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(1)
      pq.push(2)
      pq.push(3)
      expect(pq.remove(2)).toBe(true)
      expect(pq.size()).toBe(2)
      expect(pq.contains(2)).toBe(false)
    })

    it('returns false for missing element', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(1)
      pq.push(2)
      expect(pq.remove(3)).toBe(false)
      expect(pq.size()).toBe(2)
    })

    it('returns false on empty queue', () => {
      const pq = new DoubleEndedPQ<number>()
      expect(pq.remove(1)).toBe(false)
    })

    it('removes min element', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(3)
      pq.push(1)
      pq.push(2)
      expect(pq.remove(1)).toBe(true)
      expect(pq.peekMin()).toBe(2)
    })

    it('removes max element', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(1)
      pq.push(3)
      pq.push(2)
      expect(pq.remove(3)).toBe(true)
      expect(pq.peekMax()).toBe(2)
    })

    it('removes first occurrence of duplicate', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(3)
      pq.push(3)
      expect(pq.remove(3)).toBe(true)
      expect(pq.size()).toBe(1)
      expect(pq.contains(3)).toBe(true)
    })

    it('maintains heap property after removal', () => {
      const pq = new DoubleEndedPQ<number>()
      for (let i = 1; i <= 10; i++) pq.push(i)
      pq.remove(5)
      pq.remove(3)
      pq.remove(7)
      const sorted: number[] = []
      while (!pq.isEmpty()) sorted.push(pq.popMin())
      expect(sorted).toEqual([1, 2, 4, 6, 8, 9, 10])
    })

    it('removes from queue with single element', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(42)
      expect(pq.remove(42)).toBe(true)
      expect(pq.isEmpty()).toBe(true)
    })

    it('removes and then can continue using queue', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(5)
      pq.push(3)
      pq.push(7)
      pq.remove(5)
      pq.push(1)
      pq.push(9)
      expect(pq.peekMin()).toBe(1)
      expect(pq.peekMax()).toBe(9)
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(1)
      pq.push(2)
      pq.push(3)
      const cloned = pq.clone()
      expect(cloned.size()).toBe(3)
      expect(cloned.peekMin()).toBe(1)
      expect(cloned.peekMax()).toBe(3)
    })

    it('clone is independent from original', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(1)
      pq.push(2)
      pq.push(3)
      const cloned = pq.clone()
      cloned.popMin()
      expect(pq.size()).toBe(3)
      expect(cloned.size()).toBe(2)
    })

    it('clone of empty queue is empty', () => {
      const pq = new DoubleEndedPQ<number>()
      const cloned = pq.clone()
      expect(cloned.isEmpty()).toBe(true)
    })

    it('clone preserves comparator', () => {
      const pq = new DoubleEndedPQ<number>({ comparator: (a, b) => b - a })
      pq.push(1)
      pq.push(3)
      pq.push(5)
      const cloned = pq.clone()
      expect(cloned.peekMin()).toBe(5)
      expect(cloned.peekMax()).toBe(1)
    })

    it('clone of clone works', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(1)
      pq.push(2)
      const cloned = pq.clone()
      const cloned2 = cloned.clone()
      expect(cloned2.size()).toBe(2)
      cloned2.popMin()
      expect(cloned.size()).toBe(2)
    })
  })

  describe('fromArray', () => {
    it('creates queue from array', () => {
      const pq = DoubleEndedPQ.fromArray([3, 1, 4, 1, 5])
      expect(pq.size()).toBe(5)
      expect(pq.peekMin()).toBe(1)
      expect(pq.peekMax()).toBe(5)
    })

    it('creates queue from empty array', () => {
      const pq = DoubleEndedPQ.fromArray<number>([])
      expect(pq.isEmpty()).toBe(true)
    })

    it('creates queue with custom comparator', () => {
      const pq = DoubleEndedPQ.fromArray([1, 3, 5], {
        comparator: (a, b) => b - a,
      })
      expect(pq.peekMin()).toBe(5)
      expect(pq.peekMax()).toBe(1)
    })

    it('creates queue from single element array', () => {
      const pq = DoubleEndedPQ.fromArray([42])
      expect(pq.size()).toBe(1)
      expect(pq.peekMin()).toBe(42)
      expect(pq.peekMax()).toBe(42)
    })

    it('creates queue from sorted array', () => {
      const pq = DoubleEndedPQ.fromArray([1, 2, 3, 4, 5])
      expect(pq.peekMin()).toBe(1)
      expect(pq.peekMax()).toBe(5)
    })

    it('creates queue from reverse sorted array', () => {
      const pq = DoubleEndedPQ.fromArray([5, 4, 3, 2, 1])
      expect(pq.peekMin()).toBe(1)
      expect(pq.peekMax()).toBe(5)
    })

    it('creates queue from strings', () => {
      const pq = DoubleEndedPQ.fromArray(['banana', 'apple', 'cherry'], {
        comparator: (a, b) => a.localeCompare(b),
      })
      expect(pq.peekMin()).toBe('apple')
      expect(pq.peekMax()).toBe('cherry')
    })

    it('does not modify original array', () => {
      const arr = [3, 1, 2]
      DoubleEndedPQ.fromArray(arr)
      expect(arr).toEqual([3, 1, 2])
    })
  })

  describe('forEach', () => {
    it('iterates over all elements', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(1)
      pq.push(2)
      pq.push(3)
      const items: number[] = []
      pq.forEach((item) => items.push(item))
      expect(items.length).toBe(3)
    })

    it('does nothing on empty queue', () => {
      const pq = new DoubleEndedPQ<number>()
      let count = 0
      pq.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('visits all elements exactly once', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(1)
      pq.push(2)
      pq.push(2)
      pq.push(3)
      const counts = new Map<number, number>()
      pq.forEach((item) => {
        counts.set(item, (counts.get(item) ?? 0) + 1)
      })
      expect(counts.get(1)).toBe(1)
      expect(counts.get(2)).toBe(2)
      expect(counts.get(3)).toBe(1)
    })

    it('works with string elements', () => {
      const pq = new DoubleEndedPQ<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      pq.push('a')
      pq.push('b')
      pq.push('c')
      const items: string[] = []
      pq.forEach((item) => items.push(item))
      expect(items.length).toBe(3)
      expect(items).toContain('a')
      expect(items).toContain('b')
      expect(items).toContain('c')
    })
  })

  describe('Symbol.iterator', () => {
    it('is iterable', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(1)
      pq.push(2)
      pq.push(3)
      const items: number[] = []
      for (const item of pq) {
        items.push(item)
      }
      expect(items.length).toBe(3)
    })

    it('works with spread operator', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(1)
      pq.push(2)
      pq.push(3)
      const items = [...pq]
      expect(items.length).toBe(3)
    })

    it('works with empty queue', () => {
      const pq = new DoubleEndedPQ<number>()
      const items = [...pq]
      expect(items).toEqual([])
    })

    it('works with Array.from', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(1)
      pq.push(2)
      pq.push(3)
      const items = Array.from(pq)
      expect(items.length).toBe(3)
    })

    it('can be used in destructuring', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(1)
      pq.push(2)
      const [first] = pq
      expect(typeof first).toBe('number')
    })
  })

  describe('custom comparator', () => {
    it('supports reverse order', () => {
      const pq = new DoubleEndedPQ<number>({ comparator: (a, b) => b - a })
      pq.push(1)
      pq.push(3)
      pq.push(5)
      expect(pq.peekMin()).toBe(5)
      expect(pq.peekMax()).toBe(1)
    })

    it('supports object comparison by property', () => {
      const pq = new DoubleEndedPQ<{ val: number }>({
        comparator: (a, b) => a.val - b.val,
      })
      pq.push({ val: 3 })
      pq.push({ val: 1 })
      pq.push({ val: 2 })
      expect(pq.peekMin().val).toBe(1)
      expect(pq.peekMax().val).toBe(3)
    })

    it('supports string locale comparison', () => {
      const pq = new DoubleEndedPQ<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      pq.push('zebra')
      pq.push('apple')
      pq.push('mango')
      expect(pq.peekMin()).toBe('apple')
      expect(pq.peekMax()).toBe('zebra')
    })

    it('supports absolute value comparison', () => {
      const pq = new DoubleEndedPQ<number>({
        comparator: (a, b) => Math.abs(a) - Math.abs(b),
      })
      pq.push(-5)
      pq.push(3)
      pq.push(-1)
      expect(pq.peekMin()).toBe(-1)
      expect(pq.peekMax()).toBe(-5)
    })

    it('popMin/popMax work correctly with custom comparator', () => {
      const pq = new DoubleEndedPQ<number>({ comparator: (a, b) => b - a })
      pq.push(1)
      pq.push(2)
      pq.push(3)
      expect(pq.popMin()).toBe(3)
      expect(pq.popMax()).toBe(1)
    })

    it('toSortedArray uses custom comparator', () => {
      const pq = new DoubleEndedPQ<number>({ comparator: (a, b) => b - a })
      pq.push(1)
      pq.push(3)
      pq.push(2)
      expect(pq.toSortedArray()).toEqual([3, 2, 1])
    })
  })

  describe('interleaved min/max pops', () => {
    it('alternates popMin and popMax correctly', () => {
      const pq = new DoubleEndedPQ<number>()
      const items = [5, 3, 1, 4, 2, 6]
      for (const item of items) pq.push(item)
      expect(pq.popMin()).toBe(1)
      expect(pq.popMax()).toBe(6)
      expect(pq.popMin()).toBe(2)
      expect(pq.popMax()).toBe(5)
      expect(pq.popMin()).toBe(3)
      expect(pq.popMax()).toBe(4)
    })

    it('handles alternating pops with repeated pushes', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(5)
      pq.push(1)
      pq.push(3)
      expect(pq.popMin()).toBe(1)
      pq.push(0)
      expect(pq.popMin()).toBe(0)
      expect(pq.popMax()).toBe(5)
      pq.push(7)
      expect(pq.popMax()).toBe(7)
      expect(pq.popMin()).toBe(3)
    })

    it('handles all popMax then all popMin', () => {
      const pq = new DoubleEndedPQ<number>()
      for (let i = 1; i <= 5; i++) pq.push(i)
      expect(pq.popMax()).toBe(5)
      expect(pq.popMax()).toBe(4)
      expect(pq.popMin()).toBe(1)
      expect(pq.popMin()).toBe(2)
      expect(pq.popMin()).toBe(3)
    })

    it('maintains heap integrity through complex interleaving', () => {
      const pq = new DoubleEndedPQ<number>()
      for (let i = 10; i <= 100; i += 10) pq.push(i)
      expect(pq.popMin()).toBe(10)
      expect(pq.popMax()).toBe(100)
      pq.push(5)
      pq.push(105)
      expect(pq.peekMin()).toBe(5)
      expect(pq.peekMax()).toBe(105)
      expect(pq.popMin()).toBe(5)
      expect(pq.popMax()).toBe(105)
    })
  })

  describe('edge cases', () => {
    it('handles large number of elements', () => {
      const pq = new DoubleEndedPQ<number>()
      for (let i = 1; i <= 1000; i++) pq.push(i)
      expect(pq.size()).toBe(1000)
      expect(pq.peekMin()).toBe(1)
      expect(pq.peekMax()).toBe(1000)
    })

    it('sorts large dataset correctly via popMin', () => {
      const pq = new DoubleEndedPQ<number>()
      for (let i = 100; i >= 1; i--) pq.push(i)
      for (let i = 1; i <= 100; i++) {
        expect(pq.popMin()).toBe(i)
      }
    })

    it('sorts large dataset correctly via popMax', () => {
      const pq = new DoubleEndedPQ<number>()
      for (let i = 1; i <= 100; i++) pq.push(i)
      for (let i = 100; i >= 1; i--) {
        expect(pq.popMax()).toBe(i)
      }
    })

    it('handles 1000 random elements', () => {
      const pq = new DoubleEndedPQ<number>()
      const values: number[] = []
      for (let i = 0; i < 1000; i++) {
        const val = Math.floor(Math.random() * 10000)
        values.push(val)
        pq.push(val)
      }
      values.sort((a, b) => a - b)
      for (const val of values) {
        expect(pq.popMin()).toBe(val)
      }
    })

    it('handles floating point numbers', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(1.5)
      pq.push(0.3)
      pq.push(2.7)
      expect(pq.peekMin()).toBe(0.3)
      expect(pq.peekMax()).toBe(2.7)
    })

    it('handles very large numbers', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(Number.MAX_SAFE_INTEGER)
      pq.push(Number.MIN_SAFE_INTEGER)
      pq.push(0)
      expect(pq.peekMin()).toBe(Number.MIN_SAFE_INTEGER)
      expect(pq.peekMax()).toBe(Number.MAX_SAFE_INTEGER)
    })

    it('handles all same values', () => {
      const pq = new DoubleEndedPQ<number>()
      for (let i = 0; i < 10; i++) pq.push(42)
      expect(pq.peekMin()).toBe(42)
      expect(pq.peekMax()).toBe(42)
      for (let i = 0; i < 10; i++) {
        expect(pq.popMin()).toBe(42)
      }
      expect(pq.isEmpty()).toBe(true)
    })

    it('handles remove on single element', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(42)
      expect(pq.remove(42)).toBe(true)
      expect(pq.isEmpty()).toBe(true)
    })

    it('handles remove element not in queue', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(1)
      pq.push(2)
      pq.push(3)
      expect(pq.remove(99)).toBe(false)
      expect(pq.size()).toBe(3)
    })

    it('handles sequential push-pop operations', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(1)
      expect(pq.popMin()).toBe(1)
      pq.push(2)
      expect(pq.popMax()).toBe(2)
      pq.push(3)
      expect(pq.popMin()).toBe(3)
    })
  })

  describe('mixed operations', () => {
    it('push, remove, and pop operations combined', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(10)
      pq.push(20)
      pq.push(30)
      pq.remove(20)
      expect(pq.size()).toBe(2)
      expect(pq.popMin()).toBe(10)
      expect(pq.popMax()).toBe(30)
    })

    it('fromArray, clone, and remove combined', () => {
      const pq = DoubleEndedPQ.fromArray([5, 3, 1, 4, 2])
      const cloned = pq.clone()
      cloned.remove(3)
      expect(pq.size()).toBe(5)
      expect(cloned.size()).toBe(4)
      expect(cloned.contains(3)).toBe(false)
    })

    it('iterator after modifications', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(1)
      pq.push(2)
      pq.push(3)
      pq.remove(2)
      const items = [...pq]
      expect(items.length).toBe(2)
      expect(items).toContain(1)
      expect(items).toContain(3)
    })

    it('forEach after clear and refill', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(1)
      pq.push(2)
      pq.clear()
      pq.push(3)
      pq.push(4)
      const items: number[] = []
      pq.forEach((item) => items.push(item))
      expect(items.length).toBe(2)
    })

    it('toArray snapshot at different states', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(3)
      pq.push(1)
      pq.push(2)
      const arr1 = pq.toArray()
      pq.popMin()
      const arr2 = pq.toArray()
      expect(arr1.length).toBe(3)
      expect(arr2.length).toBe(2)
    })

    it('toSortedArray after partial removal', () => {
      const pq = new DoubleEndedPQ<number>()
      for (let i = 1; i <= 5; i++) pq.push(i)
      pq.remove(3)
      expect(pq.toSortedArray()).toEqual([1, 2, 4, 5])
    })

    it('contains after multiple operations', () => {
      const pq = new DoubleEndedPQ<number>()
      pq.push(1)
      pq.push(2)
      pq.push(3)
      pq.push(4)
      pq.popMax()
      pq.remove(2)
      expect(pq.contains(1)).toBe(true)
      expect(pq.contains(2)).toBe(false)
      expect(pq.contains(3)).toBe(true)
      expect(pq.contains(4)).toBe(false)
    })

    it('large dataset with mixed operations', () => {
      const pq = new DoubleEndedPQ<number>()
      for (let i = 1; i <= 50; i++) pq.push(i)
      for (let i = 0; i < 10; i++) pq.popMin()
      for (let i = 0; i < 10; i++) pq.popMax()
      expect(pq.size()).toBe(30)
      expect(pq.peekMin()).toBe(11)
      expect(pq.peekMax()).toBe(40)
    })

    it('clear and reuse with fromArray', () => {
      const pq = DoubleEndedPQ.fromArray([5, 3, 1])
      pq.clear()
      expect(pq.isEmpty()).toBe(true)
      pq.push(10)
      pq.push(20)
      expect(pq.peekMin()).toBe(10)
      expect(pq.peekMax()).toBe(20)
    })

    it('clone maintains heap integrity through pops', () => {
      const pq = DoubleEndedPQ.fromArray([8, 3, 10, 1, 6])
      const cloned = pq.clone()
      const sortedOriginal: number[] = []
      while (!pq.isEmpty()) sortedOriginal.push(pq.popMin())
      const sortedClone: number[] = []
      while (!cloned.isEmpty()) sortedClone.push(cloned.popMin())
      expect(sortedOriginal).toEqual(sortedClone)
      expect(sortedOriginal).toEqual([1, 3, 6, 8, 10])
    })

    it('remove all elements one by one', () => {
      const pq = new DoubleEndedPQ<number>()
      for (let i = 1; i <= 10; i++) pq.push(i)
      for (let i = 1; i <= 10; i++) {
        expect(pq.remove(i)).toBe(true)
      }
      expect(pq.isEmpty()).toBe(true)
    })

    it('remove elements in reverse order', () => {
      const pq = new DoubleEndedPQ<number>()
      for (let i = 1; i <= 10; i++) pq.push(i)
      for (let i = 10; i >= 1; i--) {
        expect(pq.remove(i)).toBe(true)
      }
      expect(pq.isEmpty()).toBe(true)
    })
  })

  describe('heap property verification', () => {
    it('maintains min-max heap property for small dataset', () => {
      const pq = new DoubleEndedPQ<number>()
      const items = [4, 2, 6, 1, 3, 5, 7]
      for (const item of items) pq.push(item)
      for (let i = 1; i <= 7; i++) {
        expect(pq.popMin()).toBe(i)
      }
    })

    it('maintains min-max heap property after removals', () => {
      const pq = new DoubleEndedPQ<number>()
      for (let i = 1; i <= 20; i++) pq.push(i)
      pq.remove(5)
      pq.remove(10)
      pq.remove(15)
      const sorted = pq.toSortedArray()
      expect(sorted).toEqual([1, 2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 16, 17, 18, 19, 20])
    })

    it('stress test: push and pop all via popMin', () => {
      const pq = new DoubleEndedPQ<number>()
      const n = 500
      const shuffled = Array.from({ length: n }, (_, i) => i + 1)
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]!] = [shuffled[j]!, shuffled[i]!]
      }
      for (const val of shuffled) pq.push(val)
      for (let i = 1; i <= n; i++) {
        expect(pq.popMin()).toBe(i)
      }
    })

    it('stress test: push and pop all via popMax', () => {
      const pq = new DoubleEndedPQ<number>()
      const n = 500
      const shuffled = Array.from({ length: n }, (_, i) => i + 1)
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]!] = [shuffled[j]!, shuffled[i]!]
      }
      for (const val of shuffled) pq.push(val)
      for (let i = n; i >= 1; i--) {
        expect(pq.popMax()).toBe(i)
      }
    })

    it('stress test: interleaved popMin and popMax', () => {
      const pq = new DoubleEndedPQ<number>()
      const n = 200
      for (let i = 1; i <= n; i++) pq.push(i)
      let lo = 1
      let hi = n
      let turn = true
      while (!pq.isEmpty()) {
        if (turn) {
          expect(pq.popMin()).toBe(lo++)
        } else {
          expect(pq.popMax()).toBe(hi--)
        }
        turn = !turn
      }
    })
  })
})
