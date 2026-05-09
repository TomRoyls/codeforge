import { describe, it, expect, beforeEach } from 'vitest'
import { MonotonicQueue } from '../../src/core/monotonic-queue/monotonic-queue.js'
import { defaultComparator } from '../../src/core/monotonic-queue/types.js'

describe('MonotonicQueue', () => {
  describe('constructor', () => {
    it('should create an empty queue with default options (decreasing)', () => {
      const q = new MonotonicQueue<number>()
      expect(q.size()).toBe(0)
      expect(q.isEmpty()).toBe(true)
      expect(q.front()).toBeUndefined()
      expect(q.back()).toBeUndefined()
    })

    it('should create a queue with increasing direction', () => {
      const q = new MonotonicQueue<number>({ direction: 'increasing' })
      expect(q.size()).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('should create a queue with decreasing direction', () => {
      const q = new MonotonicQueue<number>({ direction: 'decreasing' })
      expect(q.size()).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('should accept a custom comparator', () => {
      const q = new MonotonicQueue<string>({
        comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
      })
      expect(q.size()).toBe(0)
    })

    it('should accept both comparator and direction', () => {
      const q = new MonotonicQueue<number>({
        comparator: (a, b) => a - b,
        direction: 'increasing',
      })
      expect(q.size()).toBe(0)
    })

    it('should handle empty options object', () => {
      const q = new MonotonicQueue<number>({})
      expect(q.size()).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('should handle undefined options', () => {
      const q = new MonotonicQueue<number>(undefined)
      expect(q.size()).toBe(0)
    })
  })

  describe('push (decreasing)', () => {
    let q: MonotonicQueue<number>

    beforeEach(() => {
      q = new MonotonicQueue<number>({ direction: 'decreasing' })
    })

    it('should push a single element', () => {
      q.push(5)
      expect(q.size()).toBe(1)
      expect(q.front()).toBe(5)
      expect(q.back()).toBe(5)
    })

    it('should maintain decreasing order when pushing smaller elements', () => {
      q.push(5)
      q.push(3)
      q.push(1)
      expect(q.toArray()).toEqual([5, 3, 1])
    })

    it('should remove smaller elements when pushing larger', () => {
      q.push(3)
      q.push(1)
      q.push(5)
      expect(q.toArray()).toEqual([5])
    })

    it('should keep equal elements', () => {
      q.push(5)
      q.push(5)
      expect(q.toArray()).toEqual([5, 5])
    })

    it('should handle mixed push sequence', () => {
      q.push(1)
      q.push(3)
      q.push(2)
      q.push(4)
      expect(q.toArray()).toEqual([4])
    })

    it('should handle push after pops', () => {
      q.push(5)
      q.push(3)
      q.pop()
      q.push(4)
      expect(q.toArray()).toEqual([4])
    })

    it('should handle pushing negative numbers', () => {
      q.push(-1)
      q.push(-3)
      q.push(-2)
      expect(q.toArray()).toEqual([-1, -2])
    })

    it('should handle pushing zero', () => {
      q.push(0)
      q.push(-1)
      q.push(1)
      expect(q.toArray()).toEqual([1])
    })
  })

  describe('push (increasing)', () => {
    let q: MonotonicQueue<number>

    beforeEach(() => {
      q = new MonotonicQueue<number>({ direction: 'increasing' })
    })

    it('should push a single element', () => {
      q.push(5)
      expect(q.size()).toBe(1)
      expect(q.front()).toBe(5)
    })

    it('should maintain increasing order when pushing larger elements', () => {
      q.push(1)
      q.push(3)
      q.push(5)
      expect(q.toArray()).toEqual([1, 3, 5])
    })

    it('should remove larger elements when pushing smaller', () => {
      q.push(5)
      q.push(3)
      q.push(1)
      expect(q.toArray()).toEqual([1])
    })

    it('should keep equal elements', () => {
      q.push(3)
      q.push(3)
      expect(q.toArray()).toEqual([3, 3])
    })

    it('should handle mixed push sequence', () => {
      q.push(4)
      q.push(2)
      q.push(3)
      q.push(1)
      expect(q.toArray()).toEqual([1])
    })

    it('should handle negative numbers', () => {
      q.push(-3)
      q.push(-1)
      q.push(-2)
      expect(q.toArray()).toEqual([-3, -2])
    })
  })

  describe('pop', () => {
    it('should return undefined on empty queue', () => {
      const q = new MonotonicQueue<number>()
      expect(q.pop()).toBeUndefined()
    })

    it('should remove and return the front element', () => {
      const q = new MonotonicQueue<number>({ direction: 'decreasing' })
      q.push(5)
      q.push(3)
      expect(q.pop()).toBe(5)
      expect(q.front()).toBe(3)
    })

    it('should return undefined after all elements are popped', () => {
      const q = new MonotonicQueue<number>()
      q.push(1)
      q.pop()
      expect(q.pop()).toBeUndefined()
    })

    it('should handle multiple pops in sequence', () => {
      const q = new MonotonicQueue<number>({ direction: 'decreasing' })
      q.push(3)
      q.push(1)
      expect(q.pop()).toBe(3)
      expect(q.pop()).toBe(1)
      expect(q.pop()).toBeUndefined()
    })
  })

  describe('popIfFront', () => {
    it('should return false on empty queue', () => {
      const q = new MonotonicQueue<number>()
      expect(q.popIfFront(1)).toBe(false)
    })

    it('should pop front when it matches the value (decreasing)', () => {
      const q = new MonotonicQueue<number>({ direction: 'decreasing' })
      q.push(5)
      q.push(3)
      expect(q.popIfFront(5)).toBe(true)
      expect(q.front()).toBe(3)
    })

    it('should not pop front when it does not match', () => {
      const q = new MonotonicQueue<number>({ direction: 'decreasing' })
      q.push(5)
      q.push(3)
      expect(q.popIfFront(3)).toBe(false)
      expect(q.front()).toBe(5)
    })

    it('should handle popIfFront with equal values', () => {
      const q = new MonotonicQueue<number>({ direction: 'decreasing' })
      q.push(5)
      q.push(5)
      expect(q.popIfFront(5)).toBe(true)
      expect(q.front()).toBe(5)
      expect(q.size()).toBe(1)
    })

    it('should return false when front is undefined', () => {
      const q = new MonotonicQueue<number>()
      expect(q.popIfFront(1)).toBe(false)
    })

    it('should work with increasing direction', () => {
      const q = new MonotonicQueue<number>({ direction: 'increasing' })
      q.push(1)
      q.push(3)
      expect(q.popIfFront(1)).toBe(true)
      expect(q.front()).toBe(3)
    })

    it('should not pop with wrong value in increasing direction', () => {
      const q = new MonotonicQueue<number>({ direction: 'increasing' })
      q.push(1)
      q.push(3)
      expect(q.popIfFront(3)).toBe(false)
      expect(q.front()).toBe(1)
    })
  })

  describe('front', () => {
    it('should return undefined on empty queue', () => {
      const q = new MonotonicQueue<number>()
      expect(q.front()).toBeUndefined()
    })

    it('should return the max in decreasing mode', () => {
      const q = new MonotonicQueue<number>({ direction: 'decreasing' })
      q.push(1)
      q.push(3)
      q.push(2)
      expect(q.front()).toBe(3)
    })

    it('should return the min in increasing mode', () => {
      const q = new MonotonicQueue<number>({ direction: 'increasing' })
      q.push(3)
      q.push(1)
      q.push(2)
      expect(q.front()).toBe(1)
    })

    it('should update after pop', () => {
      const q = new MonotonicQueue<number>({ direction: 'decreasing' })
      q.push(5)
      q.push(3)
      q.pop()
      expect(q.front()).toBe(3)
    })
  })

  describe('back', () => {
    it('should return undefined on empty queue', () => {
      const q = new MonotonicQueue<number>()
      expect(q.back()).toBeUndefined()
    })

    it('should return the last element in the deque', () => {
      const q = new MonotonicQueue<number>({ direction: 'decreasing' })
      q.push(5)
      q.push(3)
      expect(q.back()).toBe(3)
    })

    it('should return the only element', () => {
      const q = new MonotonicQueue<number>()
      q.push(42)
      expect(q.back()).toBe(42)
    })

    it('should return the smallest pushed value in decreasing mode', () => {
      const q = new MonotonicQueue<number>({ direction: 'decreasing' })
      q.push(5)
      q.push(4)
      q.push(3)
      expect(q.back()).toBe(3)
    })

    it('should return the largest pushed value in increasing mode', () => {
      const q = new MonotonicQueue<number>({ direction: 'increasing' })
      q.push(1)
      q.push(2)
      q.push(3)
      expect(q.back()).toBe(3)
    })
  })

  describe('size', () => {
    it('should return 0 for empty queue', () => {
      const q = new MonotonicQueue<number>()
      expect(q.size()).toBe(0)
    })

    it('should return correct size after pushes', () => {
      const q = new MonotonicQueue<number>({ direction: 'decreasing' })
      q.push(5)
      q.push(3)
      q.push(1)
      expect(q.size()).toBe(3)
    })

    it('should return correct size after elements are evicted', () => {
      const q = new MonotonicQueue<number>({ direction: 'decreasing' })
      q.push(1)
      q.push(2)
      q.push(3)
      expect(q.size()).toBe(1)
    })

    it('should update after pop', () => {
      const q = new MonotonicQueue<number>()
      q.push(1)
      q.push(2)
      q.pop()
      expect(q.size()).toBe(0)
    })

    it('should update after clear', () => {
      const q = new MonotonicQueue<number>()
      q.push(1)
      q.push(2)
      q.clear()
      expect(q.size()).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new queue', () => {
      const q = new MonotonicQueue<number>()
      expect(q.isEmpty()).toBe(true)
    })

    it('should return false after push', () => {
      const q = new MonotonicQueue<number>()
      q.push(1)
      expect(q.isEmpty()).toBe(false)
    })

    it('should return true after clearing all elements', () => {
      const q = new MonotonicQueue<number>()
      q.push(1)
      q.push(2)
      q.clear()
      expect(q.isEmpty()).toBe(true)
    })

    it('should return true after popping all elements', () => {
      const q = new MonotonicQueue<number>()
      q.push(1)
      q.pop()
      expect(q.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear a non-empty queue', () => {
      const q = new MonotonicQueue<number>()
      q.push(1)
      q.push(2)
      q.push(3)
      q.clear()
      expect(q.size()).toBe(0)
      expect(q.isEmpty()).toBe(true)
      expect(q.front()).toBeUndefined()
      expect(q.back()).toBeUndefined()
    })

    it('should be safe to call on empty queue', () => {
      const q = new MonotonicQueue<number>()
      q.clear()
      expect(q.size()).toBe(0)
    })

    it('should allow reuse after clear', () => {
      const q = new MonotonicQueue<number>()
      q.push(1)
      q.clear()
      q.push(2)
      expect(q.size()).toBe(1)
      expect(q.front()).toBe(2)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty queue', () => {
      const q = new MonotonicQueue<number>()
      expect(q.toArray()).toEqual([])
    })

    it('should return a copy of the deque', () => {
      const q = new MonotonicQueue<number>({ direction: 'decreasing' })
      q.push(5)
      q.push(3)
      q.push(1)
      const arr = q.toArray()
      expect(arr).toEqual([5, 3, 1])
      arr.push(99)
      expect(q.size()).toBe(3)
    })

    it('should show decreasing order', () => {
      const q = new MonotonicQueue<number>({ direction: 'decreasing' })
      q.push(1)
      q.push(5)
      q.push(3)
      expect(q.toArray()).toEqual([5, 3])
    })

    it('should show increasing order', () => {
      const q = new MonotonicQueue<number>({ direction: 'increasing' })
      q.push(5)
      q.push(1)
      q.push(3)
      expect(q.toArray()).toEqual([1, 3])
    })
  })

  describe('clone', () => {
    it('should create an independent copy', () => {
      const q = new MonotonicQueue<number>({ direction: 'decreasing' })
      q.push(5)
      q.push(3)
      q.push(1)
      const c = q.clone()
      expect(c.toArray()).toEqual([5, 3, 1])
      expect(c.size()).toBe(3)
      c.pop()
      expect(q.size()).toBe(3)
    })

    it('should clone an empty queue', () => {
      const q = new MonotonicQueue<number>()
      const c = q.clone()
      expect(c.size()).toBe(0)
      expect(c.isEmpty()).toBe(true)
    })

    it('should preserve direction', () => {
      const q = new MonotonicQueue<number>({ direction: 'increasing' })
      q.push(1)
      q.push(3)
      const c = q.clone()
      c.push(0)
      expect(c.front()).toBe(0)
      expect(q.front()).toBe(1)
    })

    it('should preserve comparator', () => {
      const q = new MonotonicQueue<string>({
        comparator: (a, b) => a.length - b.length,
        direction: 'decreasing',
      })
      q.push('hi')
      q.push('hello')
      const c = q.clone()
      expect(c.front()).toBe('hello')
      c.push('world')
      expect(q.front()).toBe('hello')
    })
  })

  describe('[Symbol.iterator]', () => {
    it('should iterate over empty queue', () => {
      const q = new MonotonicQueue<number>()
      const result: number[] = []
      for (const item of q) {
        result.push(item)
      }
      expect(result).toEqual([])
    })

    it('should iterate over elements in order', () => {
      const q = new MonotonicQueue<number>({ direction: 'decreasing' })
      q.push(5)
      q.push(3)
      q.push(1)
      const result: number[] = []
      for (const item of q) {
        result.push(item)
      }
      expect(result).toEqual([5, 3, 1])
    })

    it('should work with spread operator', () => {
      const q = new MonotonicQueue<number>({ direction: 'decreasing' })
      q.push(3)
      q.push(1)
      expect([...q]).toEqual([3, 1])
    })

    it('should work with Array.from', () => {
      const q = new MonotonicQueue<number>({ direction: 'increasing' })
      q.push(1)
      q.push(3)
      expect(Array.from(q)).toEqual([1, 3])
    })
  })

  describe('custom comparator', () => {
    it('should work with string comparator', () => {
      const q = new MonotonicQueue<string>({
        comparator: (a, b) => a.localeCompare(b),
        direction: 'decreasing',
      })
      q.push('cherry')
      q.push('apple')
      q.push('banana')
      expect(q.front()).toBe('cherry')
      expect(q.toArray()).toEqual(['cherry', 'banana'])
    })

    it('should work with reverse numeric comparator', () => {
      const q = new MonotonicQueue<number>({
        comparator: (a, b) => b - a,
        direction: 'decreasing',
      })
      q.push(1)
      q.push(3)
      q.push(2)
      expect(q.front()).toBe(1)
    })

    it('should work with object comparator', () => {
      interface Item {
        priority: number
        name: string
      }
      const q = new MonotonicQueue<Item>({
        comparator: (a, b) => a.priority - b.priority,
        direction: 'decreasing',
      })
      q.push({ priority: 1, name: 'low' })
      q.push({ priority: 5, name: 'high' })
      q.push({ priority: 3, name: 'mid' })
      expect(q.front()?.name).toBe('high')
    })

    it('should work with absolute value comparator', () => {
      const q = new MonotonicQueue<number>({
        comparator: (a, b) => Math.abs(a) - Math.abs(b),
        direction: 'decreasing',
      })
      q.push(1)
      q.push(-5)
      q.push(3)
      expect(q.front()).toBe(-5)
    })
  })

  describe('slidingWindowMax', () => {
    it('should compute sliding window max', () => {
      expect(MonotonicQueue.slidingWindowMax([1, 3, -1, -3, 5, 3, 6, 7], 3)).toEqual([
        3, 3, 5, 5, 6, 7,
      ])
    })

    it('should handle window size 1', () => {
      expect(MonotonicQueue.slidingWindowMax([1, 2, 3, 4], 1)).toEqual([1, 2, 3, 4])
    })

    it('should handle window size equal to array length', () => {
      expect(MonotonicQueue.slidingWindowMax([1, 2, 3], 3)).toEqual([3])
    })

    it('should handle array with all same elements', () => {
      expect(MonotonicQueue.slidingWindowMax([5, 5, 5, 5], 2)).toEqual([5, 5, 5])
    })

    it('should handle decreasing array', () => {
      expect(MonotonicQueue.slidingWindowMax([5, 4, 3, 2, 1], 3)).toEqual([5, 4, 3])
    })

    it('should handle increasing array', () => {
      expect(MonotonicQueue.slidingWindowMax([1, 2, 3, 4, 5], 2)).toEqual([2, 3, 4, 5])
    })

    it('should handle single element array', () => {
      expect(MonotonicQueue.slidingWindowMax([42], 1)).toEqual([42])
    })

    it('should handle negative numbers', () => {
      expect(MonotonicQueue.slidingWindowMax([-1, -3, -2, -5, -4], 2)).toEqual([
        -1, -2, -2, -4,
      ])
    })

    it('should handle two elements with window 2', () => {
      expect(MonotonicQueue.slidingWindowMax([3, 1], 2)).toEqual([3])
    })

    it('should handle array with duplicates', () => {
      expect(MonotonicQueue.slidingWindowMax([1, 3, 3, 2, 1], 3)).toEqual([3, 3, 3])
    })

    it('should handle larger window', () => {
      expect(MonotonicQueue.slidingWindowMax([4, 3, 2, 1, 0, -1], 4)).toEqual([4, 3, 2])
    })

    it('should handle alternating values', () => {
      expect(MonotonicQueue.slidingWindowMax([1, 3, 1, 3, 1], 2)).toEqual([3, 3, 3, 3])
    })
  })

  describe('slidingWindowMin', () => {
    it('should compute sliding window min', () => {
      expect(MonotonicQueue.slidingWindowMin([1, 3, -1, -3, 5, 3, 6, 7], 3)).toEqual([
        -1, -3, -3, -3, 3, 3,
      ])
    })

    it('should handle window size 1', () => {
      expect(MonotonicQueue.slidingWindowMin([4, 3, 2, 1], 1)).toEqual([4, 3, 2, 1])
    })

    it('should handle window size equal to array length', () => {
      expect(MonotonicQueue.slidingWindowMin([3, 2, 1], 3)).toEqual([1])
    })

    it('should handle all same elements', () => {
      expect(MonotonicQueue.slidingWindowMin([5, 5, 5, 5], 2)).toEqual([5, 5, 5])
    })

    it('should handle decreasing array', () => {
      expect(MonotonicQueue.slidingWindowMin([5, 4, 3, 2, 1], 2)).toEqual([4, 3, 2, 1])
    })

    it('should handle increasing array', () => {
      expect(MonotonicQueue.slidingWindowMin([1, 2, 3, 4, 5], 3)).toEqual([1, 2, 3])
    })

    it('should handle single element', () => {
      expect(MonotonicQueue.slidingWindowMin([42], 1)).toEqual([42])
    })

    it('should handle negative numbers', () => {
      expect(MonotonicQueue.slidingWindowMin([-5, -3, -1, -2, -4], 2)).toEqual([
        -5, -3, -2, -4,
      ])
    })

    it('should handle two elements with window 2', () => {
      expect(MonotonicQueue.slidingWindowMin([3, 1], 2)).toEqual([1])
    })

    it('should handle duplicates', () => {
      expect(MonotonicQueue.slidingWindowMin([3, 1, 1, 2, 3], 3)).toEqual([1, 1, 1])
    })

    it('should handle larger window', () => {
      expect(MonotonicQueue.slidingWindowMin([0, 1, 2, 3, 4, 5], 4)).toEqual([0, 1, 2])
    })
  })

  describe('sliding window with strings', () => {
    it('should compute sliding window max for strings', () => {
      const result = MonotonicQueue.slidingWindowMax(
        ['a', 'c', 'b', 'd', 'a'],
        3,
      )
      expect(result).toEqual(['c', 'd', 'd'])
    })

    it('should compute sliding window min for strings', () => {
      const result = MonotonicQueue.slidingWindowMin(
        ['d', 'b', 'c', 'a', 'e'],
        3,
      )
      expect(result).toEqual(['b', 'a', 'a'])
    })
  })

  describe('sliding window integration', () => {
    it('should simulate full sliding window max workflow', () => {
      const arr = [1, 3, -1, -3, 5, 3, 6, 7]
      const k = 3
      const q = new MonotonicQueue<number>({ direction: 'decreasing' })
      const result: number[] = []
      for (let i = 0; i < arr.length; i++) {
        q.push(arr[i]!)
        if (i >= k - 1) {
          const front = q.front()
          if (front !== undefined) result.push(front)
          q.popIfFront(arr[i - k + 1]!)
        }
      }
      expect(result).toEqual([3, 3, 5, 5, 6, 7])
    })

    it('should simulate full sliding window min workflow', () => {
      const arr = [1, 3, -1, -3, 5, 3, 6, 7]
      const k = 3
      const q = new MonotonicQueue<number>({ direction: 'increasing' })
      const result: number[] = []
      for (let i = 0; i < arr.length; i++) {
        q.push(arr[i]!)
        if (i >= k - 1) {
          const front = q.front()
          if (front !== undefined) result.push(front)
          q.popIfFront(arr[i - k + 1]!)
        }
      }
      expect(result).toEqual([-1, -3, -3, -3, 3, 3])
    })
  })

  describe('edge cases', () => {
    it('should handle pushing many elements then clearing', () => {
      const q = new MonotonicQueue<number>({ direction: 'decreasing' })
      for (let i = 0; i < 100; i++) {
        q.push(i)
      }
      expect(q.size()).toBe(1)
      expect(q.front()).toBe(99)
      q.clear()
      expect(q.isEmpty()).toBe(true)
    })

    it('should handle alternating pushes in decreasing mode', () => {
      const q = new MonotonicQueue<number>({ direction: 'decreasing' })
      for (let i = 0; i < 50; i++) {
        q.push(i % 2 === 0 ? 10 : 5)
      }
      expect(q.front()).toBe(10)
      expect(q.back()).toBe(5)
    })

    it('should handle alternating pushes in increasing mode', () => {
      const q = new MonotonicQueue<number>({ direction: 'increasing' })
      for (let i = 0; i < 50; i++) {
        q.push(i % 2 === 0 ? 5 : 10)
      }
      expect(q.front()).toBe(5)
      expect(q.back()).toBe(10)
    })

    it('should handle sequential pushes then sequential pops', () => {
      const q = new MonotonicQueue<number>({ direction: 'decreasing' })
      q.push(5)
      q.push(3)
      q.push(1)
      expect(q.pop()).toBe(5)
      expect(q.pop()).toBe(3)
      expect(q.pop()).toBe(1)
      expect(q.isEmpty()).toBe(true)
    })
  })

  describe('stress tests', () => {
    it('should handle 10000 elements for sliding window max', () => {
      const arr = Array.from({ length: 10000 }, (_, i) => i)
      const result = MonotonicQueue.slidingWindowMax(arr, 100)
      expect(result.length).toBe(9901)
      expect(result[0]).toBe(99)
      expect(result[result.length - 1]).toBe(9999)
    })

    it('should handle 10000 elements for sliding window min', () => {
      const arr = Array.from({ length: 10000 }, (_, i) => 10000 - i)
      const result = MonotonicQueue.slidingWindowMin(arr, 100)
      expect(result.length).toBe(9901)
      expect(result[0]).toBe(9901)
      expect(result[result.length - 1]).toBe(1)
    })

    it('should handle 10000 random elements', () => {
      const arr = Array.from({ length: 10000 }, () => Math.floor(Math.random() * 1000))
      const k = 50
      const maxResult = MonotonicQueue.slidingWindowMax(arr, k)
      const minResult = MonotonicQueue.slidingWindowMin(arr, k)
      expect(maxResult.length).toBe(10000 - k + 1)
      expect(minResult.length).toBe(10000 - k + 1)
      for (let i = 0; i < maxResult.length; i++) {
        let max = -Infinity
        let min = Infinity
        for (let j = i; j < i + k; j++) {
          const v = arr[j]!
          if (v > max) max = v
          if (v < min) min = v
        }
        expect(maxResult[i]).toBe(max)
        expect(minResult[i]).toBe(min)
      }
    })

    it('should handle 10000 pushes and pops', () => {
      const q = new MonotonicQueue<number>({ direction: 'decreasing' })
      for (let i = 0; i < 10000; i++) {
        q.push(i)
      }
      expect(q.size()).toBe(1)
      expect(q.front()).toBe(9999)
    })

    it('should handle large window on small array', () => {
      expect(MonotonicQueue.slidingWindowMax([1, 2, 3], 5)).toEqual([])
    })

    it('should handle 10000 equal elements sliding window', () => {
      const arr = Array.from({ length: 10000 }, () => 42)
      const result = MonotonicQueue.slidingWindowMax(arr, 100)
      expect(result.length).toBe(9901)
      expect(result.every((v) => v === 42)).toBe(true)
    })
  })

  describe('defaultComparator', () => {
    it('should be exported', () => {
      expect(defaultComparator).toBeDefined()
      expect(typeof defaultComparator).toBe('function')
    })

    it('should compare numbers', () => {
      expect(defaultComparator(1, 2)).toBeLessThan(0)
      expect(defaultComparator(2, 1)).toBeGreaterThan(0)
      expect(defaultComparator(1, 1)).toBe(0)
    })

    it('should compare strings', () => {
      expect(defaultComparator('a', 'b')).toBeLessThan(0)
      expect(defaultComparator('b', 'a')).toBeGreaterThan(0)
      expect(defaultComparator('a', 'a')).toBe(0)
    })
  })

  describe('type safety', () => {
    it('should work with number type', () => {
      const q = new MonotonicQueue<number>()
      q.push(1)
      expect(q.front()).toBe(1)
    })

    it('should work with string type', () => {
      const q = new MonotonicQueue<string>()
      q.push('hello')
      expect(q.front()).toBe('hello')
    })

    it('should work with object type', () => {
      const q = new MonotonicQueue<{ val: number }>({
        comparator: (a, b) => a.val - b.val,
        direction: 'decreasing',
      })
      q.push({ val: 1 })
      q.push({ val: 3 })
      expect(q.front()?.val).toBe(3)
    })
  })

  describe('correctness verification', () => {
    it('slidingWindowMax should match brute force for small arrays', () => {
      const bruteForceMax = (arr: number[], k: number): number[] => {
        const result: number[] = []
        for (let i = 0; i <= arr.length - k; i++) {
          let max = arr[i]!
          for (let j = i + 1; j < i + k; j++) {
            if (arr[j]! > max) max = arr[j]!
          }
          result.push(max)
        }
        return result
      }
      const testCases: number[][] = [
        [1, 3, 2, 5, 4],
        [5, 4, 3, 2, 1],
        [1, 2, 3, 4, 5],
        [3, 3, 3, 3],
        [1],
        [5, 2, 5, 2, 5],
      ]
      for (const arr of testCases) {
        for (let k = 1; k <= arr.length; k++) {
          expect(MonotonicQueue.slidingWindowMax(arr, k)).toEqual(bruteForceMax(arr, k))
        }
      }
    })

    it('slidingWindowMin should match brute force for small arrays', () => {
      const bruteForceMin = (arr: number[], k: number): number[] => {
        const result: number[] = []
        for (let i = 0; i <= arr.length - k; i++) {
          let min = arr[i]!
          for (let j = i + 1; j < i + k; j++) {
            if (arr[j]! < min) min = arr[j]!
          }
          result.push(min)
        }
        return result
      }
      const testCases: number[][] = [
        [1, 3, 2, 5, 4],
        [5, 4, 3, 2, 1],
        [1, 2, 3, 4, 5],
        [3, 3, 3, 3],
        [1],
        [5, 2, 5, 2, 5],
      ]
      for (const arr of testCases) {
        for (let k = 1; k <= arr.length; k++) {
          expect(MonotonicQueue.slidingWindowMin(arr, k)).toEqual(bruteForceMin(arr, k))
        }
      }
    })

    it('should produce correct results for classic LeetCode 239 example', () => {
      expect(MonotonicQueue.slidingWindowMax([1, 3, -1, -3, 5, 3, 6, 7], 3)).toEqual([
        3, 3, 5, 5, 6, 7,
      ])
    })
  })

  describe('reusability after operations', () => {
    it('should work correctly after push-pop-push cycles', () => {
      const q = new MonotonicQueue<number>({ direction: 'decreasing' })
      q.push(5)
      q.push(3)
      q.pop()
      q.push(4)
      expect(q.toArray()).toEqual([4])
      q.push(2)
      expect(q.toArray()).toEqual([4, 2])
      q.pop()
      expect(q.toArray()).toEqual([2])
    })

    it('should work correctly after clear and reuse', () => {
      const q = new MonotonicQueue<number>({ direction: 'decreasing' })
      q.push(100)
      q.push(50)
      q.clear()
      q.push(10)
      q.push(20)
      q.push(5)
      expect(q.toArray()).toEqual([20, 5])
    })
  })
})
