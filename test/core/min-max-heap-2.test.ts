import { describe, it, expect } from 'vitest'
import { MinMaxHeap } from '../../src/core/min-max-heap-2/index.js'

describe('MinMaxHeap', () => {
  describe('constructor', () => {
    it('creates empty heap', () => {
      const h = new MinMaxHeap<number>()
      expect(h.size).toBe(0)
      expect(h.isEmpty()).toBe(true)
    })

    it('creates with custom comparator', () => {
      const h = new MinMaxHeap<number>({ comparator: (a, b) => b - a })
      h.push(1)
      h.push(2)
      h.push(3)
      expect(h.peekMin()).toBe(3)
      expect(h.peekMax()).toBe(1)
    })

    it('creates with default comparator (ascending)', () => {
      const h = new MinMaxHeap<number>()
      h.push(3)
      h.push(1)
      h.push(2)
      expect(h.peekMin()).toBe(1)
      expect(h.peekMax()).toBe(3)
    })
  })

  describe('push', () => {
    it('adds single element', () => {
      const h = new MinMaxHeap<number>()
      h.push(5)
      expect(h.size).toBe(1)
      expect(h.isEmpty()).toBe(false)
    })

    it('adds multiple elements', () => {
      const h = new MinMaxHeap<number>()
      h.push(5)
      h.push(3)
      h.push(7)
      expect(h.size).toBe(3)
    })

    it('maintains min at root after pushes', () => {
      const h = new MinMaxHeap<number>()
      h.push(10)
      h.push(5)
      h.push(15)
      h.push(3)
      h.push(20)
      expect(h.peekMin()).toBe(3)
    })

    it('maintains max on max levels after pushes', () => {
      const h = new MinMaxHeap<number>()
      h.push(10)
      h.push(5)
      h.push(15)
      h.push(3)
      h.push(20)
      expect(h.peekMax()).toBe(20)
    })

    it('handles equal elements', () => {
      const h = new MinMaxHeap<number>()
      h.push(5)
      h.push(5)
      h.push(5)
      expect(h.peekMin()).toBe(5)
      expect(h.peekMax()).toBe(5)
      expect(h.size).toBe(3)
    })
  })

  describe('peekMin', () => {
    it('returns undefined on empty heap', () => {
      const h = new MinMaxHeap<number>()
      expect(h.peekMin()).toBeUndefined()
    })

    it('returns single element', () => {
      const h = new MinMaxHeap<number>()
      h.push(42)
      expect(h.peekMin()).toBe(42)
    })

    it('returns minimum without removing', () => {
      const h = new MinMaxHeap<number>()
      h.push(10)
      h.push(5)
      h.push(15)
      expect(h.peekMin()).toBe(5)
      expect(h.size).toBe(3)
    })

    it('does not modify heap', () => {
      const h = new MinMaxHeap<number>()
      h.push(1)
      h.push(2)
      h.push(3)
      const before = h.size
      h.peekMin()
      expect(h.size).toBe(before)
    })
  })

  describe('peekMax', () => {
    it('returns undefined on empty heap', () => {
      const h = new MinMaxHeap<number>()
      expect(h.peekMax()).toBeUndefined()
    })

    it('returns single element', () => {
      const h = new MinMaxHeap<number>()
      h.push(42)
      expect(h.peekMax()).toBe(42)
    })

    it('returns maximum without removing', () => {
      const h = new MinMaxHeap<number>()
      h.push(10)
      h.push(5)
      h.push(15)
      expect(h.peekMax()).toBe(15)
      expect(h.size).toBe(3)
    })

    it('does not modify heap', () => {
      const h = new MinMaxHeap<number>()
      h.push(1)
      h.push(2)
      h.push(3)
      const before = h.size
      h.peekMax()
      expect(h.size).toBe(before)
    })
  })

  describe('popMin', () => {
    it('returns undefined on empty heap', () => {
      const h = new MinMaxHeap<number>()
      expect(h.popMin()).toBeUndefined()
    })

    it('removes and returns single element', () => {
      const h = new MinMaxHeap<number>()
      h.push(42)
      expect(h.popMin()).toBe(42)
      expect(h.size).toBe(0)
    })

    it('removes elements in ascending order', () => {
      const h = new MinMaxHeap<number>()
      h.push(5)
      h.push(3)
      h.push(7)
      h.push(1)
      h.push(9)
      const result: number[] = []
      while (!h.isEmpty()) {
        result.push(h.popMin()!)
      }
      expect(result).toEqual([1, 3, 5, 7, 9])
    })

    it('maintains heap property after removal', () => {
      const h = new MinMaxHeap<number>()
      h.push(10)
      h.push(5)
      h.push(15)
      h.push(3)
      h.push(20)
      h.popMin()
      expect(h.peekMin()).toBe(5)
      expect(h.peekMax()).toBe(20)
    })

    it('handles duplicates', () => {
      const h = new MinMaxHeap<number>()
      h.push(5)
      h.push(5)
      h.push(3)
      h.push(3)
      expect(h.popMin()).toBe(3)
      expect(h.popMin()).toBe(3)
      expect(h.popMin()).toBe(5)
      expect(h.popMin()).toBe(5)
    })
  })

  describe('popMax', () => {
    it('returns undefined on empty heap', () => {
      const h = new MinMaxHeap<number>()
      expect(h.popMax()).toBeUndefined()
    })

    it('removes and returns single element', () => {
      const h = new MinMaxHeap<number>()
      h.push(42)
      expect(h.popMax()).toBe(42)
      expect(h.size).toBe(0)
    })

    it('removes elements in descending order', () => {
      const h = new MinMaxHeap<number>()
      h.push(5)
      h.push(3)
      h.push(7)
      h.push(1)
      h.push(9)
      const result: number[] = []
      while (!h.isEmpty()) {
        result.push(h.popMax()!)
      }
      expect(result).toEqual([9, 7, 5, 3, 1])
    })

    it('maintains heap property after removal', () => {
      const h = new MinMaxHeap<number>()
      h.push(10)
      h.push(5)
      h.push(15)
      h.push(3)
      h.push(20)
      h.popMax()
      expect(h.peekMin()).toBe(3)
      expect(h.peekMax()).toBe(15)
    })

    it('handles duplicates', () => {
      const h = new MinMaxHeap<number>()
      h.push(5)
      h.push(5)
      h.push(7)
      h.push(7)
      expect(h.popMax()).toBe(7)
      expect(h.popMax()).toBe(7)
      expect(h.popMax()).toBe(5)
      expect(h.popMax()).toBe(5)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new heap', () => {
      const h = new MinMaxHeap<number>()
      expect(h.isEmpty()).toBe(true)
    })

    it('returns false after push', () => {
      const h = new MinMaxHeap<number>()
      h.push(1)
      expect(h.isEmpty()).toBe(false)
    })

    it('returns true after all elements popped', () => {
      const h = new MinMaxHeap<number>()
      h.push(1)
      h.popMin()
      expect(h.isEmpty()).toBe(true)
    })
  })

  describe('size', () => {
    it('returns 0 for new heap', () => {
      const h = new MinMaxHeap<number>()
      expect(h.size).toBe(0)
    })

    it('increments on push', () => {
      const h = new MinMaxHeap<number>()
      h.push(1)
      h.push(2)
      h.push(3)
      expect(h.size).toBe(3)
    })

    it('decrements on popMin', () => {
      const h = new MinMaxHeap<number>()
      h.push(1)
      h.push(2)
      h.popMin()
      expect(h.size).toBe(1)
    })

    it('decrements on popMax', () => {
      const h = new MinMaxHeap<number>()
      h.push(1)
      h.push(2)
      h.popMax()
      expect(h.size).toBe(1)
    })
  })

  describe('clear', () => {
    it('clears empty heap', () => {
      const h = new MinMaxHeap<number>()
      h.clear()
      expect(h.size).toBe(0)
      expect(h.isEmpty()).toBe(true)
    })

    it('clears populated heap', () => {
      const h = new MinMaxHeap<number>()
      h.push(1)
      h.push(2)
      h.push(3)
      h.clear()
      expect(h.size).toBe(0)
      expect(h.isEmpty()).toBe(true)
      expect(h.toArray()).toEqual([])
    })

    it('allows reuse after clear', () => {
      const h = new MinMaxHeap<number>()
      h.push(1)
      h.clear()
      h.push(2)
      expect(h.peekMin()).toBe(2)
      expect(h.size).toBe(1)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty heap', () => {
      const h = new MinMaxHeap<number>()
      expect(h.toArray()).toEqual([])
    })

    it('returns internal array representation', () => {
      const h = new MinMaxHeap<number>()
      h.push(1)
      expect(h.toArray()).toEqual([1])
    })

    it('returns copy of internal array', () => {
      const h = new MinMaxHeap<number>()
      h.push(1)
      h.push(2)
      const arr = h.toArray()
      arr.push(999)
      expect(h.size).toBe(2)
    })
  })

  describe('contains', () => {
    it('returns false on empty heap', () => {
      const h = new MinMaxHeap<number>()
      expect(h.contains(1)).toBe(false)
    })

    it('returns true when element exists', () => {
      const h = new MinMaxHeap<number>()
      h.push(5)
      h.push(3)
      h.push(7)
      expect(h.contains(5)).toBe(true)
      expect(h.contains(3)).toBe(true)
      expect(h.contains(7)).toBe(true)
    })

    it('returns false when element does not exist', () => {
      const h = new MinMaxHeap<number>()
      h.push(5)
      h.push(3)
      expect(h.contains(99)).toBe(false)
    })

    it('uses comparator for equality', () => {
      const h = new MinMaxHeap<string>()
      h.push('hello')
      h.push('world')
      expect(h.contains('hello')).toBe(true)
      expect(h.contains('HELLO')).toBe(false)
    })
  })

  describe('remove', () => {
    it('returns false on empty heap', () => {
      const h = new MinMaxHeap<number>()
      expect(h.remove(1)).toBe(false)
    })

    it('removes existing element', () => {
      const h = new MinMaxHeap<number>()
      h.push(5)
      h.push(3)
      h.push(7)
      expect(h.remove(5)).toBe(true)
      expect(h.size).toBe(2)
      expect(h.contains(5)).toBe(false)
    })

    it('returns false for non-existent element', () => {
      const h = new MinMaxHeap<number>()
      h.push(5)
      h.push(3)
      expect(h.remove(99)).toBe(false)
      expect(h.size).toBe(2)
    })

    it('removes min element', () => {
      const h = new MinMaxHeap<number>()
      h.push(5)
      h.push(3)
      h.push(7)
      expect(h.remove(3)).toBe(true)
      expect(h.peekMin()).toBe(5)
    })

    it('removes max element', () => {
      const h = new MinMaxHeap<number>()
      h.push(5)
      h.push(3)
      h.push(7)
      expect(h.remove(7)).toBe(true)
      expect(h.peekMax()).toBe(5)
    })

    it('removes only first occurrence of duplicate', () => {
      const h = new MinMaxHeap<number>()
      h.push(5)
      h.push(5)
      expect(h.remove(5)).toBe(true)
      expect(h.size).toBe(1)
      expect(h.contains(5)).toBe(true)
    })

    it('removes single element leaving empty heap', () => {
      const h = new MinMaxHeap<number>()
      h.push(42)
      expect(h.remove(42)).toBe(true)
      expect(h.isEmpty()).toBe(true)
    })

    it('maintains heap property after removal', () => {
      const h = new MinMaxHeap<number>()
      h.push(10)
      h.push(5)
      h.push(15)
      h.push(3)
      h.push(20)
      h.push(8)
      h.remove(10)
      const sorted: number[] = []
      while (!h.isEmpty()) sorted.push(h.popMin()!)
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i]!).toBeGreaterThanOrEqual(sorted[i - 1]!)
      }
    })
  })

  describe('static from', () => {
    it('creates heap from array', () => {
      const h = MinMaxHeap.from([5, 3, 7, 1, 9])
      expect(h.size).toBe(5)
      expect(h.peekMin()).toBe(1)
      expect(h.peekMax()).toBe(9)
    })

    it('creates heap from empty array', () => {
      const h = MinMaxHeap.from([])
      expect(h.size).toBe(0)
      expect(h.isEmpty()).toBe(true)
    })

    it('creates heap with custom comparator', () => {
      const h = MinMaxHeap.from([5, 3, 7], { comparator: (a, b) => b - a })
      expect(h.peekMin()).toBe(7)
      expect(h.peekMax()).toBe(3)
    })

    it('creates independent heap from array', () => {
      const arr = [1, 2, 3]
      const h = MinMaxHeap.from(arr)
      arr.push(4)
      expect(h.size).toBe(3)
    })

    it('handles single element array', () => {
      const h = MinMaxHeap.from([42])
      expect(h.peekMin()).toBe(42)
      expect(h.peekMax()).toBe(42)
    })
  })

  describe('edge cases', () => {
    it('handles single element', () => {
      const h = new MinMaxHeap<number>()
      h.push(1)
      expect(h.peekMin()).toBe(1)
      expect(h.peekMax()).toBe(1)
      expect(h.popMin()).toBe(1)
      expect(h.isEmpty()).toBe(true)
    })

    it('handles two elements', () => {
      const h = new MinMaxHeap<number>()
      h.push(5)
      h.push(3)
      expect(h.peekMin()).toBe(3)
      expect(h.peekMax()).toBe(5)
    })

    it('handles three elements', () => {
      const h = new MinMaxHeap<number>()
      h.push(5)
      h.push(3)
      h.push(7)
      expect(h.peekMin()).toBe(3)
      expect(h.peekMax()).toBe(7)
    })

    it('handles four elements', () => {
      const h = new MinMaxHeap<number>()
      h.push(5)
      h.push(3)
      h.push(7)
      h.push(1)
      expect(h.peekMin()).toBe(1)
      expect(h.peekMax()).toBe(7)
    })

    it('handles five elements', () => {
      const h = new MinMaxHeap<number>()
      h.push(5)
      h.push(3)
      h.push(7)
      h.push(1)
      h.push(9)
      expect(h.peekMin()).toBe(1)
      expect(h.peekMax()).toBe(9)
    })

    it('handles negative numbers', () => {
      const h = new MinMaxHeap<number>()
      h.push(-5)
      h.push(-3)
      h.push(-7)
      h.push(-1)
      expect(h.peekMin()).toBe(-7)
      expect(h.peekMax()).toBe(-1)
    })

    it('handles mixed positive and negative', () => {
      const h = new MinMaxHeap<number>()
      h.push(-5)
      h.push(3)
      h.push(-7)
      h.push(1)
      expect(h.peekMin()).toBe(-7)
      expect(h.peekMax()).toBe(3)
    })

    it('handles zero', () => {
      const h = new MinMaxHeap<number>()
      h.push(0)
      h.push(-1)
      h.push(1)
      expect(h.peekMin()).toBe(-1)
      expect(h.peekMax()).toBe(1)
    })

    it('handles floating point numbers', () => {
      const h = new MinMaxHeap<number>()
      h.push(1.5)
      h.push(0.3)
      h.push(2.7)
      expect(h.peekMin()).toBe(0.3)
      expect(h.peekMax()).toBe(2.7)
    })

    it('handles all identical elements', () => {
      const h = new MinMaxHeap<number>()
      for (let i = 0; i < 10; i++) h.push(42)
      expect(h.peekMin()).toBe(42)
      expect(h.peekMax()).toBe(42)
      for (let i = 0; i < 10; i++) {
        expect(h.popMin()).toBe(42)
      }
    })
  })

  describe('duplicates', () => {
    it('handles duplicate min values', () => {
      const h = new MinMaxHeap<number>()
      h.push(1)
      h.push(1)
      h.push(5)
      expect(h.popMin()).toBe(1)
      expect(h.popMin()).toBe(1)
      expect(h.popMin()).toBe(5)
    })

    it('handles duplicate max values', () => {
      const h = new MinMaxHeap<number>()
      h.push(5)
      h.push(5)
      h.push(1)
      expect(h.popMax()).toBe(5)
      expect(h.popMax()).toBe(5)
      expect(h.popMax()).toBe(1)
    })

    it('handles all duplicates', () => {
      const h = new MinMaxHeap<number>()
      h.push(3)
      h.push(3)
      h.push(3)
      expect(h.size).toBe(3)
      expect(h.popMin()).toBe(3)
      expect(h.popMax()).toBe(3)
      expect(h.popMin()).toBe(3)
    })
  })

  describe('large batches', () => {
    it('handles 100 elements in sorted order via popMin', () => {
      const h = new MinMaxHeap<number>()
      for (let i = 0; i < 100; i++) h.push(i)
      const result: number[] = []
      while (!h.isEmpty()) result.push(h.popMin()!)
      for (let i = 0; i < 100; i++) {
        expect(result[i]).toBe(i)
      }
    })

    it('handles 100 elements in reverse sorted order via popMax', () => {
      const h = new MinMaxHeap<number>()
      for (let i = 0; i < 100; i++) h.push(i)
      const result: number[] = []
      while (!h.isEmpty()) result.push(h.popMax()!)
      for (let i = 0; i < 100; i++) {
        expect(result[i]).toBe(99 - i)
      }
    })

    it('handles 1000 elements', () => {
      const h = new MinMaxHeap<number>()
      for (let i = 0; i < 1000; i++) h.push(Math.random())
      let prev = h.popMin()!
      while (!h.isEmpty()) {
        const curr = h.popMin()!
        expect(curr).toBeGreaterThanOrEqual(prev)
        prev = curr
      }
    })

    it('handles reverse-inserted elements', () => {
      const h = new MinMaxHeap<number>()
      for (let i = 100; i >= 0; i--) h.push(i)
      expect(h.peekMin()).toBe(0)
      expect(h.peekMax()).toBe(100)
      const result: number[] = []
      while (!h.isEmpty()) result.push(h.popMin()!)
      for (let i = 0; i <= 100; i++) {
        expect(result[i]).toBe(i)
      }
    })

    it('handles random order elements', () => {
      const h = new MinMaxHeap<number>()
      const arr = Array.from({ length: 100 }, (_, i) => i)
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j]!, arr[i]!]
      }
      for (const v of arr) h.push(v)
      const result: number[] = []
      while (!h.isEmpty()) result.push(h.popMin()!)
      expect(result).toEqual(Array.from({ length: 100 }, (_, i) => i))
    })
  })

  describe('mixed popMin and popMax', () => {
    it('alternating pops maintain correctness', () => {
      const h = new MinMaxHeap<number>()
      for (let i = 1; i <= 10; i++) h.push(i)
      const result: number[] = []
      while (!h.isEmpty()) {
        result.push(h.popMin()!)
        if (!h.isEmpty()) result.push(h.popMax()!)
      }
      expect(result).toEqual([1, 10, 2, 9, 3, 8, 4, 7, 5, 6])
    })

    it('popMax then popMin alternately', () => {
      const h = new MinMaxHeap<number>()
      for (let i = 1; i <= 6; i++) h.push(i)
      expect(h.popMax()).toBe(6)
      expect(h.popMin()).toBe(1)
      expect(h.popMax()).toBe(5)
      expect(h.popMin()).toBe(2)
      expect(h.popMax()).toBe(4)
      expect(h.popMin()).toBe(3)
    })
  })

  describe('string elements', () => {
    it('works with string values', () => {
      const h = new MinMaxHeap<string>()
      h.push('cherry')
      h.push('apple')
      h.push('banana')
      expect(h.peekMin()).toBe('apple')
      expect(h.peekMax()).toBe('cherry')
    })

    it('sorts strings correctly', () => {
      const h = MinMaxHeap.from(['delta', 'alpha', 'charlie', 'bravo'])
      expect(h.popMin()).toBe('alpha')
      expect(h.popMin()).toBe('bravo')
      expect(h.popMin()).toBe('charlie')
      expect(h.popMin()).toBe('delta')
    })
  })

  describe('object elements with custom comparator', () => {
    it('works with objects', () => {
      const h = new MinMaxHeap<{ priority: number }>({
        comparator: (a, b) => a.priority - b.priority
      })
      h.push({ priority: 3 })
      h.push({ priority: 1 })
      h.push({ priority: 2 })
      expect(h.peekMin()!.priority).toBe(1)
      expect(h.peekMax()!.priority).toBe(3)
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const h = MinMaxHeap.from([5, 3, 7, 1, 9])
      const c = h.clone()
      expect(c.size).toBe(h.size)
      expect(c.peekMin()).toBe(h.peekMin())
      expect(c.peekMax()).toBe(h.peekMax())
      h.popMin()
      expect(c.size).toBe(5)
      expect(h.size).toBe(4)
    })

    it('clones empty heap', () => {
      const h = new MinMaxHeap<number>()
      const c = h.clone()
      expect(c.isEmpty()).toBe(true)
    })
  })

  describe('merge', () => {
    it('merges two heaps', () => {
      const h1 = MinMaxHeap.from([1, 3, 5])
      const h2 = MinMaxHeap.from([2, 4, 6])
      h1.merge(h2)
      expect(h1.size).toBe(6)
      expect(h1.peekMin()).toBe(1)
      expect(h1.peekMax()).toBe(6)
    })

    it('merges with empty heap', () => {
      const h1 = MinMaxHeap.from([1, 2, 3])
      const h2 = new MinMaxHeap<number>()
      h1.merge(h2)
      expect(h1.size).toBe(3)
    })

    it('merges into empty heap', () => {
      const h1 = new MinMaxHeap<number>()
      const h2 = MinMaxHeap.from([1, 2, 3])
      h1.merge(h2)
      expect(h1.size).toBe(3)
    })
  })

  describe('stats', () => {
    it('returns correct stats for empty heap', () => {
      const h = new MinMaxHeap<number>()
      expect(h.stats()).toEqual({ size: 0, height: 0 })
    })

    it('returns correct stats for single element', () => {
      const h = new MinMaxHeap<number>()
      h.push(1)
      expect(h.stats()).toEqual({ size: 1, height: 1 })
    })

    it('returns correct stats for multiple elements', () => {
      const h = MinMaxHeap.from([1, 2, 3, 4, 5, 6, 7])
      const s = h.stats()
      expect(s.size).toBe(7)
      expect(s.height).toBe(3)
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates over all elements', () => {
      const h = MinMaxHeap.from([3, 1, 2])
      const result: number[] = []
      for (const v of h) result.push(v)
      expect(result.length).toBe(3)
      expect(result.sort()).toEqual([1, 2, 3])
    })

    it('works with spread operator', () => {
      const h = MinMaxHeap.from([3, 1, 2])
      expect([...h].sort()).toEqual([1, 2, 3])
    })

    it('iterates empty heap', () => {
      const h = new MinMaxHeap<number>()
      const result: number[] = []
      for (const v of h) result.push(v)
      expect(result).toEqual([])
    })
  })

  describe('containsWith', () => {
    it('returns false on empty heap', () => {
      const h = new MinMaxHeap<number>()
      expect(h.containsWith((v) => v > 5)).toBe(false)
    })

    it('returns true when match found', () => {
      const h = MinMaxHeap.from([1, 2, 3])
      expect(h.containsWith((v) => v === 2)).toBe(true)
    })

    it('returns false when no match', () => {
      const h = MinMaxHeap.from([1, 2, 3])
      expect(h.containsWith((v) => v > 10)).toBe(false)
    })
  })

  describe('removeFirst', () => {
    it('returns false on empty heap', () => {
      const h = new MinMaxHeap<number>()
      expect(h.removeFirst((v) => v > 5)).toBe(false)
    })

    it('removes first matching element', () => {
      const h = MinMaxHeap.from([5, 3, 7, 1])
      expect(h.removeFirst((v) => v === 7)).toBe(true)
      expect(h.size).toBe(3)
      expect(h.peekMax()).toBe(5)
    })

    it('returns false when no match', () => {
      const h = MinMaxHeap.from([1, 2, 3])
      expect(h.removeFirst((v) => v > 10)).toBe(false)
      expect(h.size).toBe(3)
    })
  })

  describe('heap property validation', () => {
    it('maintains min-max heap invariant after many operations', () => {
      const h = new MinMaxHeap<number>()
      const values = [50, 30, 70, 10, 90, 20, 80, 40, 60]
      for (const v of values) h.push(v)
      while (!h.isEmpty()) {
        const min = h.peekMin()!
        const max = h.peekMax()!
        expect(min).toBeLessThanOrEqual(max)
        h.popMin()
      }
    })

    it('maintains invariant with alternating push and pop', () => {
      const h = new MinMaxHeap<number>()
      h.push(5)
      h.push(3)
      h.popMin()
      h.push(7)
      h.push(1)
      h.popMax()
      h.push(9)
      h.push(2)
      const sorted: number[] = []
      while (!h.isEmpty()) sorted.push(h.popMin()!)
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i]!).toBeGreaterThanOrEqual(sorted[i - 1]!)
      }
    })

    it('handles remove then push sequence', () => {
      const h = MinMaxHeap.from([10, 20, 30, 40, 50])
      h.remove(30)
      h.push(25)
      h.push(35)
      const sorted: number[] = []
      while (!h.isEmpty()) sorted.push(h.popMin()!)
      expect(sorted).toEqual([10, 20, 25, 35, 40, 50])
    })
  })

  describe('interleaved operations', () => {
    it('push and popMin interleaved', () => {
      const h = new MinMaxHeap<number>()
      h.push(5)
      h.push(3)
      expect(h.popMin()).toBe(3)
      h.push(1)
      h.push(7)
      expect(h.popMin()).toBe(1)
      expect(h.popMin()).toBe(5)
      expect(h.popMin()).toBe(7)
      expect(h.isEmpty()).toBe(true)
    })

    it('push and popMax interleaved', () => {
      const h = new MinMaxHeap<number>()
      h.push(5)
      h.push(3)
      expect(h.popMax()).toBe(5)
      h.push(7)
      h.push(1)
      expect(h.popMax()).toBe(7)
      expect(h.popMax()).toBe(3)
      expect(h.popMax()).toBe(1)
      expect(h.isEmpty()).toBe(true)
    })

    it('clear and reuse multiple times', () => {
      const h = new MinMaxHeap<number>()
      for (let round = 0; round < 3; round++) {
        for (let i = 0; i < 10; i++) h.push(i * (round + 1))
        expect(h.size).toBe(10)
        h.clear()
        expect(h.isEmpty()).toBe(true)
      }
    })
  })

  describe('descending comparator', () => {
    it('treats larger values as "min"', () => {
      const h = new MinMaxHeap<number>({ comparator: (a, b) => b - a })
      h.push(1)
      h.push(5)
      h.push(3)
      expect(h.peekMin()).toBe(5)
      expect(h.peekMax()).toBe(1)
    })

    it('popMin removes largest', () => {
      const h = new MinMaxHeap<number>({ comparator: (a, b) => b - a })
      h.push(1)
      h.push(5)
      h.push(3)
      expect(h.popMin()).toBe(5)
      expect(h.popMin()).toBe(3)
      expect(h.popMin()).toBe(1)
    })

    it('popMax removes smallest', () => {
      const h = new MinMaxHeap<number>({ comparator: (a, b) => b - a })
      h.push(1)
      h.push(5)
      h.push(3)
      expect(h.popMax()).toBe(1)
      expect(h.popMax()).toBe(3)
      expect(h.popMax()).toBe(5)
    })
  })
})
