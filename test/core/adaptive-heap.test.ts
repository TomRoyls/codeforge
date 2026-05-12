import { describe, it, expect } from 'vitest'
import { AdaptiveHeap } from '../../src/core/adaptive-heap/index.js'

describe('AdaptiveHeap', () => {
  describe('constructor', () => {
    it('creates empty heap', () => {
      const h = new AdaptiveHeap<number>()
      expect(h.size).toBe(0)
      expect(h.isEmpty()).toBe(true)
    })

    it('creates with custom comparator', () => {
      const h = new AdaptiveHeap<number>({ comparator: (a, b) => b - a })
      h.push(1)
      h.push(2)
      h.push(3)
      expect(h.peek()).toBe(3)
    })

    it('creates with default comparator (ascending)', () => {
      const h = new AdaptiveHeap<number>()
      h.push(3)
      h.push(1)
      h.push(2)
      expect(h.peek()).toBe(1)
    })
  })

  describe('push', () => {
    it('adds single element', () => {
      const h = new AdaptiveHeap<number>()
      h.push(5)
      expect(h.size).toBe(1)
      expect(h.isEmpty()).toBe(false)
    })

    it('adds multiple elements', () => {
      const h = new AdaptiveHeap<number>()
      h.push(5)
      h.push(3)
      h.push(7)
      expect(h.size).toBe(3)
    })

    it('maintains min at root after pushes', () => {
      const h = new AdaptiveHeap<number>()
      h.push(10)
      h.push(5)
      h.push(15)
      h.push(3)
      h.push(20)
      expect(h.peek()).toBe(3)
    })

    it('handles equal elements', () => {
      const h = new AdaptiveHeap<number>()
      h.push(5)
      h.push(5)
      h.push(5)
      expect(h.peek()).toBe(5)
      expect(h.size).toBe(3)
    })

    it('handles single element', () => {
      const h = new AdaptiveHeap<number>()
      h.push(42)
      expect(h.peek()).toBe(42)
    })
  })

  describe('peek', () => {
    it('returns undefined on empty heap', () => {
      const h = new AdaptiveHeap<number>()
      expect(h.peek()).toBeUndefined()
    })

    it('returns single element', () => {
      const h = new AdaptiveHeap<number>()
      h.push(42)
      expect(h.peek()).toBe(42)
    })

    it('returns minimum without removing', () => {
      const h = new AdaptiveHeap<number>()
      h.push(10)
      h.push(5)
      h.push(15)
      expect(h.peek()).toBe(5)
      expect(h.size).toBe(3)
    })

    it('does not modify heap', () => {
      const h = new AdaptiveHeap<number>()
      h.push(1)
      h.push(2)
      h.push(3)
      const before = h.size
      h.peek()
      expect(h.size).toBe(before)
    })

    it('returns minimum consistently', () => {
      const h = new AdaptiveHeap<number>()
      h.push(5)
      h.push(3)
      h.push(7)
      h.push(1)
      h.push(9)
      expect(h.peek()).toBe(1)
      expect(h.peek()).toBe(1)
      expect(h.peek()).toBe(1)
    })
  })

  describe('pop', () => {
    it('returns undefined on empty heap', () => {
      const h = new AdaptiveHeap<number>()
      expect(h.pop()).toBeUndefined()
    })

    it('removes and returns single element', () => {
      const h = new AdaptiveHeap<number>()
      h.push(42)
      expect(h.pop()).toBe(42)
      expect(h.size).toBe(0)
    })

    it('removes elements in ascending order', () => {
      const h = new AdaptiveHeap<number>()
      h.push(5)
      h.push(3)
      h.push(7)
      h.push(1)
      h.push(9)
      const result: number[] = []
      while (!h.isEmpty()) {
        result.push(h.pop()!)
      }
      expect(result).toEqual([1, 3, 5, 7, 9])
    })

    it('maintains heap property after removal', () => {
      const h = new AdaptiveHeap<number>()
      h.push(10)
      h.push(5)
      h.push(15)
      h.push(3)
      h.push(20)
      h.pop()
      expect(h.peek()).toBe(5)
    })

    it('handles duplicates', () => {
      const h = new AdaptiveHeap<number>()
      h.push(5)
      h.push(5)
      h.push(3)
      h.push(3)
      expect(h.pop()).toBe(3)
      expect(h.pop()).toBe(3)
      expect(h.pop()).toBe(5)
      expect(h.pop()).toBe(5)
    })

    it('drains entire heap', () => {
      const h = new AdaptiveHeap<number>()
      h.push(1)
      h.push(2)
      h.push(3)
      h.pop()
      h.pop()
      h.pop()
      expect(h.isEmpty()).toBe(true)
    })
  })

  describe('size', () => {
    it('returns 0 for new heap', () => {
      const h = new AdaptiveHeap<number>()
      expect(h.size).toBe(0)
    })

    it('increments on push', () => {
      const h = new AdaptiveHeap<number>()
      h.push(1)
      h.push(2)
      h.push(3)
      expect(h.size).toBe(3)
    })

    it('decrements on pop', () => {
      const h = new AdaptiveHeap<number>()
      h.push(1)
      h.push(2)
      h.pop()
      expect(h.size).toBe(1)
    })

    it('reflects correct size after mixed operations', () => {
      const h = new AdaptiveHeap<number>()
      h.push(1)
      h.push(2)
      h.push(3)
      h.pop()
      h.push(4)
      h.push(5)
      h.pop()
      expect(h.size).toBe(3)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new heap', () => {
      const h = new AdaptiveHeap<number>()
      expect(h.isEmpty()).toBe(true)
    })

    it('returns false after push', () => {
      const h = new AdaptiveHeap<number>()
      h.push(1)
      expect(h.isEmpty()).toBe(false)
    })

    it('returns true after all elements popped', () => {
      const h = new AdaptiveHeap<number>()
      h.push(1)
      h.pop()
      expect(h.isEmpty()).toBe(true)
    })

    it('returns true after clear', () => {
      const h = new AdaptiveHeap<number>()
      h.push(1)
      h.push(2)
      h.clear()
      expect(h.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears empty heap', () => {
      const h = new AdaptiveHeap<number>()
      h.clear()
      expect(h.size).toBe(0)
      expect(h.isEmpty()).toBe(true)
    })

    it('clears populated heap', () => {
      const h = new AdaptiveHeap<number>()
      h.push(1)
      h.push(2)
      h.push(3)
      h.clear()
      expect(h.size).toBe(0)
      expect(h.isEmpty()).toBe(true)
      expect(h.toArray()).toEqual([])
    })

    it('allows reuse after clear', () => {
      const h = new AdaptiveHeap<number>()
      h.push(1)
      h.clear()
      h.push(2)
      expect(h.peek()).toBe(2)
      expect(h.size).toBe(1)
    })

    it('resets access tracking on clear', () => {
      const h = new AdaptiveHeap<number>()
      h.push(1)
      h.peek()
      h.peek()
      h.clear()
      expect(h.stats().totalAccesses).toBe(0)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty heap', () => {
      const h = new AdaptiveHeap<number>()
      expect(h.toArray()).toEqual([])
    })

    it('returns internal array representation', () => {
      const h = new AdaptiveHeap<number>()
      h.push(1)
      expect(h.toArray()).toEqual([1])
    })

    it('returns copy of internal array', () => {
      const h = new AdaptiveHeap<number>()
      h.push(1)
      h.push(2)
      const arr = h.toArray()
      arr.push(999)
      expect(h.size).toBe(2)
    })

    it('contains all pushed elements', () => {
      const h = new AdaptiveHeap<number>()
      h.push(3)
      h.push(1)
      h.push(2)
      expect(h.toArray().sort()).toEqual([1, 2, 3])
    })
  })

  describe('contains', () => {
    it('returns false on empty heap', () => {
      const h = new AdaptiveHeap<number>()
      expect(h.contains(1)).toBe(false)
    })

    it('returns true when element exists', () => {
      const h = new AdaptiveHeap<number>()
      h.push(5)
      h.push(3)
      h.push(7)
      expect(h.contains(5)).toBe(true)
      expect(h.contains(3)).toBe(true)
      expect(h.contains(7)).toBe(true)
    })

    it('returns false when element does not exist', () => {
      const h = new AdaptiveHeap<number>()
      h.push(5)
      h.push(3)
      expect(h.contains(99)).toBe(false)
    })

    it('uses comparator for equality', () => {
      const h = new AdaptiveHeap<string>()
      h.push('hello')
      h.push('world')
      expect(h.contains('hello')).toBe(true)
      expect(h.contains('HELLO')).toBe(false)
    })

    it('finds elements in heap of one', () => {
      const h = new AdaptiveHeap<number>()
      h.push(42)
      expect(h.contains(42)).toBe(true)
    })
  })

  describe('remove', () => {
    it('returns false on empty heap', () => {
      const h = new AdaptiveHeap<number>()
      expect(h.remove(1)).toBe(false)
    })

    it('removes existing element', () => {
      const h = new AdaptiveHeap<number>()
      h.push(5)
      h.push(3)
      h.push(7)
      expect(h.remove(5)).toBe(true)
      expect(h.size).toBe(2)
      expect(h.contains(5)).toBe(false)
    })

    it('returns false for non-existent element', () => {
      const h = new AdaptiveHeap<number>()
      h.push(5)
      h.push(3)
      expect(h.remove(99)).toBe(false)
      expect(h.size).toBe(2)
    })

    it('removes min element', () => {
      const h = new AdaptiveHeap<number>()
      h.push(5)
      h.push(3)
      h.push(7)
      expect(h.remove(3)).toBe(true)
      expect(h.peek()).toBe(5)
    })

    it('removes max element', () => {
      const h = new AdaptiveHeap<number>()
      h.push(5)
      h.push(3)
      h.push(7)
      expect(h.remove(7)).toBe(true)
      const sorted: number[] = []
      while (!h.isEmpty()) sorted.push(h.pop()!)
      expect(sorted).toEqual([3, 5])
    })

    it('removes only first occurrence of duplicate', () => {
      const h = new AdaptiveHeap<number>()
      h.push(5)
      h.push(5)
      expect(h.remove(5)).toBe(true)
      expect(h.size).toBe(1)
      expect(h.contains(5)).toBe(true)
    })

    it('removes single element leaving empty heap', () => {
      const h = new AdaptiveHeap<number>()
      h.push(42)
      expect(h.remove(42)).toBe(true)
      expect(h.isEmpty()).toBe(true)
    })

    it('maintains heap property after removal', () => {
      const h = new AdaptiveHeap<number>()
      h.push(10)
      h.push(5)
      h.push(15)
      h.push(3)
      h.push(20)
      h.push(8)
      h.remove(10)
      const sorted: number[] = []
      while (!h.isEmpty()) sorted.push(h.pop()!)
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i]!).toBeGreaterThanOrEqual(sorted[i - 1]!)
      }
    })

    it('removes root element', () => {
      const h = new AdaptiveHeap<number>()
      h.push(1)
      h.push(2)
      h.push(3)
      expect(h.remove(1)).toBe(true)
      expect(h.peek()).toBe(2)
    })
  })

  describe('update', () => {
    it('returns false on empty heap', () => {
      const h = new AdaptiveHeap<number>()
      expect(h.update(1, 2)).toBe(false)
    })

    it('updates existing element', () => {
      const h = new AdaptiveHeap<number>()
      h.push(5)
      h.push(3)
      h.push(7)
      expect(h.update(5, 2)).toBe(true)
      expect(h.contains(5)).toBe(false)
      expect(h.contains(2)).toBe(true)
    })

    it('returns false for non-existent element', () => {
      const h = new AdaptiveHeap<number>()
      h.push(5)
      expect(h.update(99, 1)).toBe(false)
    })

    it('maintains heap property after update', () => {
      const h = new AdaptiveHeap<number>()
      h.push(10)
      h.push(5)
      h.push(15)
      h.update(10, 1)
      expect(h.peek()).toBe(1)
    })

    it('update to larger value reorders correctly', () => {
      const h = new AdaptiveHeap<number>()
      h.push(1)
      h.push(5)
      h.push(3)
      h.update(1, 10)
      const sorted: number[] = []
      while (!h.isEmpty()) sorted.push(h.pop()!)
      expect(sorted).toEqual([3, 5, 10])
    })

    it('preserves access count through update', () => {
      const h = new AdaptiveHeap<number>()
      h.push(5)
      h.push(3)
      h.peek()
      h.peek()
      const before = h.stats().totalAccesses
      h.update(5, 2)
      expect(h.stats().totalAccesses).toBe(before)
    })

    it('update with same value', () => {
      const h = new AdaptiveHeap<number>()
      h.push(5)
      h.push(3)
      expect(h.update(5, 5)).toBe(true)
      expect(h.contains(5)).toBe(true)
    })
  })

  describe('decreaseKey', () => {
    it('returns false on empty heap', () => {
      const h = new AdaptiveHeap<number>()
      expect(h.decreaseKey(1, 0)).toBe(false)
    })

    it('decreases key of existing element', () => {
      const h = new AdaptiveHeap<number>()
      h.push(5)
      h.push(3)
      h.push(7)
      expect(h.decreaseKey(5, 1)).toBe(true)
      expect(h.peek()).toBe(1)
    })

    it('returns false for non-existent element', () => {
      const h = new AdaptiveHeap<number>()
      h.push(5)
      expect(h.decreaseKey(99, 1)).toBe(false)
    })

    it('returns false when new value is not smaller', () => {
      const h = new AdaptiveHeap<number>()
      h.push(5)
      expect(h.decreaseKey(5, 10)).toBe(false)
    })

    it('returns false when new value equals old', () => {
      const h = new AdaptiveHeap<number>()
      h.push(5)
      expect(h.decreaseKey(5, 5)).toBe(false)
    })

    it('bubbles up after decrease', () => {
      const h = new AdaptiveHeap<number>()
      h.push(10)
      h.push(20)
      h.push(30)
      h.decreaseKey(30, 1)
      expect(h.peek()).toBe(1)
    })

    it('maintains sorted order after multiple decreases', () => {
      const h = new AdaptiveHeap<number>()
      h.push(10)
      h.push(20)
      h.push(30)
      h.decreaseKey(20, 5)
      h.decreaseKey(30, 1)
      const sorted: number[] = []
      while (!h.isEmpty()) sorted.push(h.pop()!)
      expect(sorted).toEqual([1, 5, 10])
    })
  })

  describe('increaseKey', () => {
    it('returns false on empty heap', () => {
      const h = new AdaptiveHeap<number>()
      expect(h.increaseKey(1, 2)).toBe(false)
    })

    it('increases key of existing element', () => {
      const h = new AdaptiveHeap<number>()
      h.push(5)
      h.push(3)
      h.push(7)
      expect(h.increaseKey(3, 10)).toBe(true)
      expect(h.peek()).toBe(5)
    })

    it('returns false for non-existent element', () => {
      const h = new AdaptiveHeap<number>()
      h.push(5)
      expect(h.increaseKey(99, 100)).toBe(false)
    })

    it('returns false when new value is not larger', () => {
      const h = new AdaptiveHeap<number>()
      h.push(5)
      expect(h.increaseKey(5, 1)).toBe(false)
    })

    it('returns false when new value equals old', () => {
      const h = new AdaptiveHeap<number>()
      h.push(5)
      expect(h.increaseKey(5, 5)).toBe(false)
    })

    it('trickles down after increase', () => {
      const h = new AdaptiveHeap<number>()
      h.push(1)
      h.push(2)
      h.push(3)
      h.push(4)
      h.increaseKey(1, 100)
      const sorted: number[] = []
      while (!h.isEmpty()) sorted.push(h.pop()!)
      expect(sorted).toEqual([2, 3, 4, 100])
    })

    it('maintains sorted order after multiple increases', () => {
      const h = new AdaptiveHeap<number>()
      h.push(10)
      h.push(20)
      h.push(30)
      h.increaseKey(10, 50)
      h.increaseKey(20, 60)
      const sorted: number[] = []
      while (!h.isEmpty()) sorted.push(h.pop()!)
      expect(sorted).toEqual([30, 50, 60])
    })
  })

  describe('static from', () => {
    it('creates heap from array', () => {
      const h = AdaptiveHeap.from([5, 3, 7, 1, 9])
      expect(h.size).toBe(5)
      expect(h.peek()).toBe(1)
    })

    it('creates heap from empty array', () => {
      const h = AdaptiveHeap.from([])
      expect(h.size).toBe(0)
      expect(h.isEmpty()).toBe(true)
    })

    it('creates heap with custom comparator', () => {
      const h = AdaptiveHeap.from([5, 3, 7], { comparator: (a, b) => b - a })
      expect(h.peek()).toBe(7)
    })

    it('creates independent heap from array', () => {
      const arr = [1, 2, 3]
      const h = AdaptiveHeap.from(arr)
      arr.push(4)
      expect(h.size).toBe(3)
    })

    it('handles single element array', () => {
      const h = AdaptiveHeap.from([42])
      expect(h.peek()).toBe(42)
    })

    it('preserves sorted order from already sorted array', () => {
      const h = AdaptiveHeap.from([1, 2, 3, 4, 5])
      const sorted: number[] = []
      while (!h.isEmpty()) sorted.push(h.pop()!)
      expect(sorted).toEqual([1, 2, 3, 4, 5])
    })

    it('handles reverse sorted array', () => {
      const h = AdaptiveHeap.from([5, 4, 3, 2, 1])
      const sorted: number[] = []
      while (!h.isEmpty()) sorted.push(h.pop()!)
      expect(sorted).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('edge cases', () => {
    it('handles single element', () => {
      const h = new AdaptiveHeap<number>()
      h.push(1)
      expect(h.peek()).toBe(1)
      expect(h.pop()).toBe(1)
      expect(h.isEmpty()).toBe(true)
    })

    it('handles two elements', () => {
      const h = new AdaptiveHeap<number>()
      h.push(5)
      h.push(3)
      expect(h.peek()).toBe(3)
    })

    it('handles three elements', () => {
      const h = new AdaptiveHeap<number>()
      h.push(5)
      h.push(3)
      h.push(7)
      expect(h.peek()).toBe(3)
    })

    it('handles four elements', () => {
      const h = new AdaptiveHeap<number>()
      h.push(5)
      h.push(3)
      h.push(7)
      h.push(1)
      expect(h.peek()).toBe(1)
    })

    it('handles five elements', () => {
      const h = new AdaptiveHeap<number>()
      h.push(5)
      h.push(3)
      h.push(7)
      h.push(1)
      h.push(9)
      expect(h.peek()).toBe(1)
    })

    it('handles negative numbers', () => {
      const h = new AdaptiveHeap<number>()
      h.push(-5)
      h.push(-3)
      h.push(-7)
      h.push(-1)
      expect(h.peek()).toBe(-7)
    })

    it('handles mixed positive and negative', () => {
      const h = new AdaptiveHeap<number>()
      h.push(-5)
      h.push(3)
      h.push(-7)
      h.push(1)
      expect(h.peek()).toBe(-7)
    })

    it('handles zero', () => {
      const h = new AdaptiveHeap<number>()
      h.push(0)
      h.push(-1)
      h.push(1)
      expect(h.peek()).toBe(-1)
    })

    it('handles floating point numbers', () => {
      const h = new AdaptiveHeap<number>()
      h.push(1.5)
      h.push(0.3)
      h.push(2.7)
      expect(h.peek()).toBe(0.3)
    })

    it('handles all identical elements', () => {
      const h = new AdaptiveHeap<number>()
      for (let i = 0; i < 10; i++) h.push(42)
      expect(h.peek()).toBe(42)
      for (let i = 0; i < 10; i++) {
        expect(h.pop()).toBe(42)
      }
    })
  })

  describe('duplicates', () => {
    it('handles duplicate values', () => {
      const h = new AdaptiveHeap<number>()
      h.push(1)
      h.push(1)
      h.push(5)
      expect(h.pop()).toBe(1)
      expect(h.pop()).toBe(1)
      expect(h.pop()).toBe(5)
    })

    it('handles all duplicates', () => {
      const h = new AdaptiveHeap<number>()
      h.push(3)
      h.push(3)
      h.push(3)
      expect(h.size).toBe(3)
      expect(h.pop()).toBe(3)
      expect(h.pop()).toBe(3)
      expect(h.pop()).toBe(3)
    })
  })

  describe('large batches', () => {
    it('handles 100 elements in sorted order', () => {
      const h = new AdaptiveHeap<number>()
      for (let i = 0; i < 100; i++) h.push(i)
      const result: number[] = []
      while (!h.isEmpty()) result.push(h.pop()!)
      for (let i = 0; i < 100; i++) {
        expect(result[i]).toBe(i)
      }
    })

    it('handles reverse inserted elements', () => {
      const h = new AdaptiveHeap<number>()
      for (let i = 100; i >= 0; i--) h.push(i)
      expect(h.peek()).toBe(0)
      const result: number[] = []
      while (!h.isEmpty()) result.push(h.pop()!)
      for (let i = 0; i <= 100; i++) {
        expect(result[i]).toBe(i)
      }
    })

    it('handles 1000 elements', () => {
      const h = new AdaptiveHeap<number>()
      for (let i = 0; i < 1000; i++) h.push(Math.random())
      let prev = h.pop()!
      while (!h.isEmpty()) {
        const curr = h.pop()!
        expect(curr).toBeGreaterThanOrEqual(prev)
        prev = curr
      }
    })

    it('handles random order elements', () => {
      const h = new AdaptiveHeap<number>()
      const arr = Array.from({ length: 100 }, (_, i) => i)
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j]!, arr[i]!]
      }
      for (const v of arr) h.push(v)
      const result: number[] = []
      while (!h.isEmpty()) result.push(h.pop()!)
      expect(result).toEqual(Array.from({ length: 100 }, (_, i) => i))
    })
  })

  describe('string elements', () => {
    it('works with string values', () => {
      const h = new AdaptiveHeap<string>()
      h.push('cherry')
      h.push('apple')
      h.push('banana')
      expect(h.peek()).toBe('apple')
    })

    it('sorts strings correctly', () => {
      const h = AdaptiveHeap.from(['delta', 'alpha', 'charlie', 'bravo'])
      expect(h.pop()).toBe('alpha')
      expect(h.pop()).toBe('bravo')
      expect(h.pop()).toBe('charlie')
      expect(h.pop()).toBe('delta')
    })
  })

  describe('object elements with custom comparator', () => {
    it('works with objects', () => {
      const h = new AdaptiveHeap<{ priority: number }>({
        comparator: (a, b) => a.priority - b.priority
      })
      h.push({ priority: 3 })
      h.push({ priority: 1 })
      h.push({ priority: 2 })
      expect(h.peek()!.priority).toBe(1)
    })

    it('pops objects in order', () => {
      const h = new AdaptiveHeap<{ priority: number }>({
        comparator: (a, b) => a.priority - b.priority
      })
      h.push({ priority: 3 })
      h.push({ priority: 1 })
      h.push({ priority: 2 })
      expect(h.pop()!.priority).toBe(1)
      expect(h.pop()!.priority).toBe(2)
      expect(h.pop()!.priority).toBe(3)
    })
  })

  describe('stats', () => {
    it('returns correct stats for empty heap', () => {
      const h = new AdaptiveHeap<number>()
      expect(h.stats()).toEqual({ size: 0, height: 0, totalAccesses: 0 })
    })

    it('returns correct stats for single element', () => {
      const h = new AdaptiveHeap<number>()
      h.push(1)
      const s = h.stats()
      expect(s.size).toBe(1)
      expect(s.height).toBe(1)
    })

    it('returns correct stats for multiple elements', () => {
      const h = AdaptiveHeap.from([1, 2, 3, 4, 5, 6, 7])
      const s = h.stats()
      expect(s.size).toBe(7)
      expect(s.height).toBe(3)
    })

    it('tracks total accesses', () => {
      const h = new AdaptiveHeap<number>()
      h.push(1)
      h.push(2)
      h.peek()
      h.peek()
      h.pop()
      expect(h.stats().totalAccesses).toBe(3)
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const h = AdaptiveHeap.from([5, 3, 7, 1, 9])
      const c = h.clone()
      expect(c.size).toBe(h.size)
      expect(c.peek()).toBe(h.peek())
      h.pop()
      expect(c.size).toBe(5)
      expect(h.size).toBe(4)
    })

    it('clones empty heap', () => {
      const h = new AdaptiveHeap<number>()
      const c = h.clone()
      expect(c.isEmpty()).toBe(true)
    })

    it('preserves comparator', () => {
      const h = new AdaptiveHeap<number>({ comparator: (a, b) => b - a })
      h.push(1)
      h.push(5)
      h.push(3)
      const c = h.clone()
      expect(c.peek()).toBe(5)
    })

    it('preserves access tracking', () => {
      const h = new AdaptiveHeap<number>()
      h.push(1)
      h.peek()
      h.peek()
      const c = h.clone()
      expect(c.stats().totalAccesses).toBe(2)
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates over all elements', () => {
      const h = AdaptiveHeap.from([3, 1, 2])
      const result: number[] = []
      for (const v of h) result.push(v)
      expect(result.length).toBe(3)
      expect(result.sort()).toEqual([1, 2, 3])
    })

    it('works with spread operator', () => {
      const h = AdaptiveHeap.from([3, 1, 2])
      expect([...h].sort()).toEqual([1, 2, 3])
    })

    it('iterates empty heap', () => {
      const h = new AdaptiveHeap<number>()
      const result: number[] = []
      for (const v of h) result.push(v)
      expect(result).toEqual([])
    })
  })

  describe('heap property validation', () => {
    it('maintains heap invariant after many operations', () => {
      const h = new AdaptiveHeap<number>()
      const values = [50, 30, 70, 10, 90, 20, 80, 40, 60]
      for (const v of values) h.push(v)
      while (!h.isEmpty()) {
        h.pop()
        if (!h.isEmpty()) {
          const arr = h.toArray()
          const sorted = [...arr].sort((a, b) => a - b)
          expect(h.peek()).toBe(sorted[0])
        }
      }
    })

    it('maintains invariant with alternating push and pop', () => {
      const h = new AdaptiveHeap<number>()
      h.push(5)
      h.push(3)
      h.pop()
      h.push(7)
      h.push(1)
      h.pop()
      h.push(9)
      h.push(2)
      const sorted: number[] = []
      while (!h.isEmpty()) sorted.push(h.pop()!)
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i]!).toBeGreaterThanOrEqual(sorted[i - 1]!)
      }
    })

    it('handles remove then push sequence', () => {
      const h = AdaptiveHeap.from([10, 20, 30, 40, 50])
      h.remove(30)
      h.push(25)
      h.push(35)
      const sorted: number[] = []
      while (!h.isEmpty()) sorted.push(h.pop()!)
      expect(sorted).toEqual([10, 20, 25, 35, 40, 50])
    })
  })

  describe('interleaved operations', () => {
    it('push and pop interleaved', () => {
      const h = new AdaptiveHeap<number>()
      h.push(5)
      h.push(3)
      expect(h.pop()).toBe(3)
      h.push(1)
      h.push(7)
      expect(h.pop()).toBe(1)
      expect(h.pop()).toBe(5)
      expect(h.pop()).toBe(7)
      expect(h.isEmpty()).toBe(true)
    })

    it('clear and reuse multiple times', () => {
      const h = new AdaptiveHeap<number>()
      for (let round = 0; round < 3; round++) {
        for (let i = 0; i < 10; i++) h.push(i * (round + 1))
        expect(h.size).toBe(10)
        h.clear()
        expect(h.isEmpty()).toBe(true)
      }
    })

    it('mixed update and remove', () => {
      const h = AdaptiveHeap.from([10, 20, 30, 40, 50])
      h.update(30, 5)
      h.remove(40)
      const sorted: number[] = []
      while (!h.isEmpty()) sorted.push(h.pop()!)
      expect(sorted).toEqual([5, 10, 20, 50])
    })
  })

  describe('descending comparator', () => {
    it('treats larger values as "min"', () => {
      const h = new AdaptiveHeap<number>({ comparator: (a, b) => b - a })
      h.push(1)
      h.push(5)
      h.push(3)
      expect(h.peek()).toBe(5)
    })

    it('pops in descending order', () => {
      const h = new AdaptiveHeap<number>({ comparator: (a, b) => b - a })
      h.push(1)
      h.push(5)
      h.push(3)
      expect(h.pop()).toBe(5)
      expect(h.pop()).toBe(3)
      expect(h.pop()).toBe(1)
    })

    it('decreaseKey with descending comparator', () => {
      const h = new AdaptiveHeap<number>({ comparator: (a, b) => b - a })
      h.push(1)
      h.push(5)
      h.push(3)
      h.decreaseKey(1, 0)
      expect(h.peek()).toBe(5)
    })

    it('increaseKey with descending comparator', () => {
      const h = new AdaptiveHeap<number>({ comparator: (a, b) => b - a })
      h.push(1)
      h.push(5)
      h.push(3)
      h.increaseKey(1, 0)
      expect(h.peek()).toBe(5)
    })
  })

  describe('adaptive behavior', () => {
    it('tracks access count via peek', () => {
      const h = new AdaptiveHeap<number>()
      h.push(1)
      h.push(2)
      h.push(3)
      h.peek()
      h.peek()
      expect(h.stats().totalAccesses).toBe(2)
    })

    it('tracks access count via pop', () => {
      const h = new AdaptiveHeap<number>()
      h.push(1)
      h.push(2)
      h.pop()
      expect(h.stats().totalAccesses).toBe(1)
    })

    it('peek does not change heap contents', () => {
      const h = new AdaptiveHeap<number>()
      h.push(3)
      h.push(1)
      h.push(2)
      h.peek()
      h.peek()
      h.peek()
      expect(h.size).toBe(3)
      expect(h.peek()).toBe(1)
    })

    it('access tracking resets on clear', () => {
      const h = new AdaptiveHeap<number>()
      h.push(1)
      h.peek()
      h.peek()
      h.clear()
      expect(h.stats().totalAccesses).toBe(0)
    })

    it('stats reports correct totalAccesses', () => {
      const h = new AdaptiveHeap<number>()
      h.push(10)
      h.push(20)
      h.push(30)
      h.peek()
      h.pop()
      h.peek()
      expect(h.stats().totalAccesses).toBe(3)
    })

    it('clone preserves access data', () => {
      const h = new AdaptiveHeap<number>()
      h.push(1)
      h.peek()
      h.peek()
      const c = h.clone()
      expect(c.stats().totalAccesses).toBe(2)
    })
  })

  describe('mixed key operations', () => {
    it('decreaseKey and increaseKey on same heap', () => {
      const h = AdaptiveHeap.from([10, 20, 30, 40, 50])
      h.decreaseKey(40, 5)
      h.increaseKey(10, 60)
      const sorted: number[] = []
      while (!h.isEmpty()) sorted.push(h.pop()!)
      expect(sorted).toEqual([5, 20, 30, 50, 60])
    })

    it('update followed by remove', () => {
      const h = AdaptiveHeap.from([10, 20, 30])
      h.update(20, 5)
      h.remove(5)
      const sorted: number[] = []
      while (!h.isEmpty()) sorted.push(h.pop()!)
      expect(sorted).toEqual([10, 30])
    })

    it('decreaseKey to new minimum', () => {
      const h = AdaptiveHeap.from([10, 20, 30])
      h.decreaseKey(30, 1)
      expect(h.peek()).toBe(1)
      expect(h.pop()).toBe(1)
    })

    it('increaseKey to new maximum', () => {
      const h = AdaptiveHeap.from([10, 20, 30])
      h.increaseKey(10, 100)
      const sorted: number[] = []
      while (!h.isEmpty()) sorted.push(h.pop()!)
      expect(sorted[sorted.length - 1]).toBe(100)
    })
  })

  describe('stress tests', () => {
    it('push 500 pop 500', () => {
      const h = new AdaptiveHeap<number>()
      for (let i = 500; i >= 0; i--) h.push(i)
      for (let i = 0; i <= 500; i++) {
        expect(h.pop()).toBe(i)
      }
      expect(h.isEmpty()).toBe(true)
    })

    it('mixed operations maintain correctness', () => {
      const h = new AdaptiveHeap<number>()
      const expected: number[] = []
      h.push(5)
      expected.push(5)
      h.push(3)
      expected.push(3)
      h.push(7)
      expected.push(7)
      h.remove(3)
      expected.splice(expected.indexOf(3), 1)
      h.update(5, 2)
      expected.splice(expected.indexOf(5), 1)
      expected.push(2)
      expected.sort((a, b) => a - b)
      const result: number[] = []
      while (!h.isEmpty()) result.push(h.pop()!)
      expect(result).toEqual(expected)
    })
  })
})
