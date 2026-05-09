import { describe, it, expect, beforeEach } from 'vitest'
import { MonotonicStack } from '../../src/core/monotonic-stack/monotonic-stack.js'
import { defaultComparator } from '../../src/core/monotonic-stack/types.js'
import type { MonotonicStackOptions, MonotonicStackStats } from '../../src/core/monotonic-stack/types.js'

describe('MonotonicStack', () => {
  describe('constructor', () => {
    it('should create an empty stack with default mode (increasing)', () => {
      const s = new MonotonicStack<number>()
      expect(s.size()).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('should create a stack with increasing mode', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      expect(s.size()).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('should create a stack with decreasing mode', () => {
      const s = new MonotonicStack<number>({ mode: 'decreasing' })
      expect(s.size()).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('should accept a custom comparator', () => {
      const s = new MonotonicStack<string>({
        comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
      })
      expect(s.size()).toBe(0)
    })

    it('should accept both comparator and mode', () => {
      const s = new MonotonicStack<number>({
        comparator: (a, b) => a - b,
        mode: 'decreasing',
      })
      expect(s.size()).toBe(0)
    })

    it('should handle empty options object', () => {
      const s = new MonotonicStack<number>({})
      expect(s.size()).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('should handle undefined options', () => {
      const s = new MonotonicStack<number>(undefined)
      expect(s.size()).toBe(0)
    })
  })

  describe('push (increasing mode)', () => {
    let s: MonotonicStack<number>

    beforeEach(() => {
      s = new MonotonicStack<number>({ mode: 'increasing' })
    })

    it('should push a single element', () => {
      s.push(5)
      expect(s.size()).toBe(1)
      expect(s.peek()).toBe(5)
    })

    it('should push elements in increasing order', () => {
      s.push(1)
      s.push(2)
      s.push(3)
      expect(s.toArray()).toEqual([1, 2, 3])
    })

    it('should pop elements that violate increasing order', () => {
      s.push(1)
      s.push(2)
      s.push(5)
      const popped = s.push(3)
      expect(s.toArray()).toEqual([1, 2, 3])
      expect(popped).toEqual([5])
    })

    it('should pop all larger elements when pushing a small value', () => {
      s.push(5)
      s.push(3)
      s.push(1)
      const popped = s.push(0)
      expect(s.toArray()).toEqual([0])
      expect(popped).toEqual([1])
    })

    it('should push equal elements without popping', () => {
      s.push(3)
      s.push(3)
      s.push(3)
      expect(s.toArray()).toEqual([3, 3, 3])
    })

    it('should return empty array when no elements are popped', () => {
      s.push(1)
      const popped = s.push(2)
      expect(popped).toEqual([])
    })

    it('should handle push after pops', () => {
      s.push(1)
      s.push(3)
      s.push(2)
      expect(s.toArray()).toEqual([1, 2])
      s.push(5)
      expect(s.toArray()).toEqual([1, 2, 5])
    })
  })

  describe('push (decreasing mode)', () => {
    let s: MonotonicStack<number>

    beforeEach(() => {
      s = new MonotonicStack<number>({ mode: 'decreasing' })
    })

    it('should push a single element', () => {
      s.push(5)
      expect(s.size()).toBe(1)
      expect(s.peek()).toBe(5)
    })

    it('should push elements in decreasing order', () => {
      s.push(3)
      s.push(2)
      s.push(1)
      expect(s.toArray()).toEqual([3, 2, 1])
    })

    it('should pop elements that violate decreasing order', () => {
      s.push(5)
      s.push(3)
      const popped = s.push(4)
      expect(s.toArray()).toEqual([5, 4])
      expect(popped).toEqual([3])
    })

    it('should pop all smaller elements when pushing a large value', () => {
      s.push(3)
      s.push(2)
      s.push(1)
      const popped = s.push(4)
      expect(s.toArray()).toEqual([4])
      expect(popped).toEqual([1, 2, 3])
    })

    it('should keep smaller elements in decreasing stack', () => {
      s.push(3)
      s.push(2)
      s.push(1)
      const popped = s.push(0)
      expect(s.toArray()).toEqual([3, 2, 1, 0])
      expect(popped).toEqual([])
    })

    it('should keep smaller elements in decreasing stack', () => {
      s.push(3)
      s.push(2)
      s.push(1)
      const popped = s.push(0)
      expect(s.toArray()).toEqual([3, 2, 1, 0])
      expect(popped).toEqual([])
    })

    it('should push equal elements without popping', () => {
      s.push(3)
      s.push(3)
      s.push(3)
      expect(s.toArray()).toEqual([3, 3, 3])
    })

    it('should return empty array when no elements are popped', () => {
      s.push(3)
      const popped = s.push(2)
      expect(popped).toEqual([])
    })

    it('should handle push after pops', () => {
      s.push(5)
      s.push(3)
      s.push(4)
      expect(s.toArray()).toEqual([5, 4])
      s.push(6)
      expect(s.toArray()).toEqual([6])
    })
  })

  describe('push returning popped elements', () => {
    it('should return popped elements in LIFO order', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      s.push(1)
      s.push(2)
      s.push(5)
      const popped = s.push(3)
      expect(popped).toEqual([5])
    })

    it('should return empty array on first push', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      const popped = s.push(5)
      expect(popped).toEqual([])
    })

    it('should return empty array when pushing to empty stack', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      s.push(5)
      s.pop()
      const popped = s.push(10)
      expect(popped).toEqual([])
    })
  })

  describe('pop', () => {
    it('should pop the top element', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      s.push(1)
      s.push(2)
      expect(s.pop()).toBe(2)
      expect(s.toArray()).toEqual([1])
    })

    it('should return undefined when popping empty stack', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      expect(s.pop()).toBeUndefined()
    })

    it('should pop all elements', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      s.push(1)
      s.push(2)
      expect(s.pop()).toBe(2)
      expect(s.pop()).toBe(1)
      expect(s.pop()).toBeUndefined()
    })

    it('should update size after pop', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      s.push(1)
      s.push(2)
      s.pop()
      expect(s.size()).toBe(1)
    })
  })

  describe('peek', () => {
    it('should return the top element without removing it', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      s.push(1)
      s.push(2)
      expect(s.peek()).toBe(2)
      expect(s.size()).toBe(2)
    })

    it('should return undefined for empty stack', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      expect(s.peek()).toBeUndefined()
    })

    it('should return the only element', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      s.push(42)
      expect(s.peek()).toBe(42)
    })
  })

  describe('size', () => {
    it('should return 0 for empty stack', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      expect(s.size()).toBe(0)
    })

    it('should return correct size after pushes', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      s.push(1)
      s.push(2)
      s.push(3)
      expect(s.size()).toBe(3)
    })

    it('should return correct size after push with pops', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      s.push(1)
      s.push(3)
      s.push(2)
      expect(s.size()).toBe(2)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty stack', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      expect(s.isEmpty()).toBe(true)
    })

    it('should return false after push', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      s.push(1)
      expect(s.isEmpty()).toBe(false)
    })

    it('should return true after all elements popped', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      s.push(1)
      s.pop()
      expect(s.isEmpty()).toBe(true)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty stack', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      expect(s.toArray()).toEqual([])
    })

    it('should return elements in stack order (bottom to top)', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      s.push(1)
      s.push(2)
      s.push(3)
      expect(s.toArray()).toEqual([1, 2, 3])
    })

    it('should return a copy of the stack', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      s.push(1)
      s.push(2)
      const arr = s.toArray()
      arr.push(100)
      expect(s.size()).toBe(2)
    })
  })

  describe('clear', () => {
    it('should clear all elements', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      s.push(1)
      s.push(2)
      s.push(3)
      s.clear()
      expect(s.size()).toBe(0)
      expect(s.isEmpty()).toBe(true)
      expect(s.toArray()).toEqual([])
    })

    it('should work on already empty stack', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      s.clear()
      expect(s.size()).toBe(0)
    })

    it('should allow push after clear', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      s.push(1)
      s.clear()
      s.push(2)
      expect(s.size()).toBe(1)
      expect(s.peek()).toBe(2)
    })
  })

  describe('clone', () => {
    it('should create an independent copy', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      s.push(1)
      s.push(2)
      const c = s.clone()
      expect(c.toArray()).toEqual([1, 2])
      expect(c.size()).toBe(2)
      c.push(3)
      expect(s.size()).toBe(2)
      expect(c.size()).toBe(3)
    })

    it('should preserve mode', () => {
      const s = new MonotonicStack<number>({ mode: 'decreasing' })
      s.push(3)
      s.push(2)
      const c = s.clone()
      c.push(4)
      expect(c.toArray()).toEqual([4])
    })

    it('should preserve comparator', () => {
      const s = new MonotonicStack<string>({
        comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
        mode: 'increasing',
      })
      s.push('a')
      s.push('B')
      const c = s.clone()
      c.push('c')
      expect(c.toArray()).toEqual(['a', 'B', 'c'])
    })

    it('should clone an empty stack', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      const c = s.clone()
      expect(c.isEmpty()).toBe(true)
      expect(c.size()).toBe(0)
    })

    it('should preserve stats counters', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      s.push(5)
      s.push(3)
      s.push(4)
      const c = s.clone()
      const stats = c.stats()
      expect(stats.totalPushed).toBe(3)
      expect(stats.totalPopped).toBe(1)
    })
  })

  describe('from (static factory)', () => {
    it('should create a stack from an array (increasing)', () => {
      const s = MonotonicStack.from([1, 2, 3, 4, 5])
      expect(s.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('should create a stack from an array (decreasing)', () => {
      const s = MonotonicStack.from([5, 4, 3, 2, 1], { mode: 'decreasing' })
      expect(s.toArray()).toEqual([5, 4, 3, 2, 1])
    })

    it('should handle array with violations (increasing)', () => {
      const s = MonotonicStack.from([3, 1, 4, 1, 5])
      expect(s.toArray()).toEqual([1, 1, 5])
    })

    it('should handle array with violations (decreasing)', () => {
      const s = MonotonicStack.from([5, 3, 4, 2, 1], { mode: 'decreasing' })
      expect(s.toArray()).toEqual([5, 4, 2, 1])
    })

    it('should handle empty array', () => {
      const s = MonotonicStack.from([])
      expect(s.isEmpty()).toBe(true)
    })

    it('should handle single element array', () => {
      const s = MonotonicStack.from([42])
      expect(s.size()).toBe(1)
      expect(s.peek()).toBe(42)
    })

    it('should use custom comparator', () => {
      const s = MonotonicStack.from(['A', 'b', 'C', 'd'], {
        comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
      })
      expect(s.toArray()).toEqual(['A', 'b', 'C', 'd'])
    })
  })

  describe('stats', () => {
    it('should return initial stats', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      const stats = s.stats()
      expect(stats.size).toBe(0)
      expect(stats.isEmpty).toBe(true)
      expect(stats.mode).toBe('increasing')
      expect(stats.totalPushed).toBe(0)
      expect(stats.totalPopped).toBe(0)
    })

    it('should track total pushed', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      s.push(1)
      s.push(2)
      s.push(3)
      expect(s.stats().totalPushed).toBe(3)
    })

    it('should track total popped from monotonic violations', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      s.push(3)
      s.push(1)
      s.push(4)
      expect(s.stats().totalPopped).toBe(1)
    })

    it('should track total popped from explicit pop calls', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      s.push(1)
      s.push(2)
      s.pop()
      expect(s.stats().totalPopped).toBe(1)
    })

    it('should track combined pops', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      s.push(3)
      s.push(1)
      s.push(4)
      s.pop()
      expect(s.stats().totalPopped).toBe(2)
    })

    it('should reflect current size', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      s.push(1)
      s.push(2)
      expect(s.stats().size).toBe(2)
      expect(s.stats().isEmpty).toBe(false)
    })

    it('should reflect mode', () => {
      const s = new MonotonicStack<number>({ mode: 'decreasing' })
      expect(s.stats().mode).toBe('decreasing')
    })

    it('should track pushed correctly across clear', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      s.push(1)
      s.push(2)
      s.clear()
      s.push(3)
      expect(s.stats().totalPushed).toBe(3)
    })
  })

  describe('nextGreater', () => {
    it('should find next greater elements', () => {
      expect(MonotonicStack.nextGreater([4, 5, 2, 25])).toEqual([5, 25, 25, undefined])
    })

    it('should return undefined when no greater element exists', () => {
      expect(MonotonicStack.nextGreater([5, 4, 3, 2, 1])).toEqual([undefined, undefined, undefined, undefined, undefined])
    })

    it('should handle all same elements', () => {
      expect(MonotonicStack.nextGreater([3, 3, 3])).toEqual([undefined, undefined, undefined])
    })

    it('should handle empty array', () => {
      expect(MonotonicStack.nextGreater([])).toEqual([])
    })

    it('should handle single element', () => {
      expect(MonotonicStack.nextGreater([1])).toEqual([undefined])
    })

    it('should handle strictly increasing input', () => {
      expect(MonotonicStack.nextGreater([1, 2, 3, 4])).toEqual([2, 3, 4, undefined])
    })

    it('should handle strictly decreasing input', () => {
      expect(MonotonicStack.nextGreater([4, 3, 2, 1])).toEqual([undefined, undefined, undefined, undefined])
    })

    it('should handle negative numbers', () => {
      expect(MonotonicStack.nextGreater([-3, -1, -2, 0])).toEqual([-1, 0, 0, undefined])
    })

    it('should work with custom comparator', () => {
      expect(MonotonicStack.nextGreater(['a', 'c', 'b', 'd'])).toEqual(['c', 'd', 'd', undefined])
    })

    it('should handle two elements', () => {
      expect(MonotonicStack.nextGreater([2, 1])).toEqual([undefined, undefined])
      expect(MonotonicStack.nextGreater([1, 2])).toEqual([2, undefined])
    })
  })

  describe('nextSmaller', () => {
    it('should find next smaller elements', () => {
      expect(MonotonicStack.nextSmaller([4, 5, 2, 25])).toEqual([2, 2, undefined, undefined])
    })

    it('should return undefined when no smaller element exists', () => {
      expect(MonotonicStack.nextSmaller([1, 2, 3, 4, 5])).toEqual([undefined, undefined, undefined, undefined, undefined])
    })

    it('should handle all same elements', () => {
      expect(MonotonicStack.nextSmaller([3, 3, 3])).toEqual([undefined, undefined, undefined])
    })

    it('should handle empty array', () => {
      expect(MonotonicStack.nextSmaller([])).toEqual([])
    })

    it('should handle single element', () => {
      expect(MonotonicStack.nextSmaller([1])).toEqual([undefined])
    })

    it('should handle strictly decreasing input', () => {
      expect(MonotonicStack.nextSmaller([4, 3, 2, 1])).toEqual([3, 2, 1, undefined])
    })

    it('should handle strictly increasing input', () => {
      expect(MonotonicStack.nextSmaller([1, 2, 3, 4])).toEqual([undefined, undefined, undefined, undefined])
    })

    it('should handle negative numbers', () => {
      expect(MonotonicStack.nextSmaller([-1, -3, -2, -4])).toEqual([-3, -4, -4, undefined])
    })

    it('should handle two elements', () => {
      expect(MonotonicStack.nextSmaller([2, 1])).toEqual([1, undefined])
      expect(MonotonicStack.nextSmaller([1, 2])).toEqual([undefined, undefined])
    })
  })

  describe('previousGreater', () => {
    it('should find previous greater elements', () => {
      expect(MonotonicStack.previousGreater([4, 5, 2, 25])).toEqual([undefined, undefined, 5, undefined])
    })

    it('should return undefined when no previous greater exists', () => {
      expect(MonotonicStack.previousGreater([1, 2, 3, 4, 5])).toEqual([undefined, undefined, undefined, undefined, undefined])
    })

    it('should handle all same elements', () => {
      expect(MonotonicStack.previousGreater([3, 3, 3])).toEqual([undefined, undefined, undefined])
    })

    it('should handle empty array', () => {
      expect(MonotonicStack.previousGreater([])).toEqual([])
    })

    it('should handle single element', () => {
      expect(MonotonicStack.previousGreater([1])).toEqual([undefined])
    })

    it('should handle strictly decreasing input', () => {
      expect(MonotonicStack.previousGreater([5, 4, 3, 2])).toEqual([undefined, 5, 4, 3])
    })

    it('should handle negative numbers', () => {
      expect(MonotonicStack.previousGreater([-1, -3, -2, 0])).toEqual([undefined, -1, -1, undefined])
    })

    it('should handle two elements', () => {
      expect(MonotonicStack.previousGreater([1, 2])).toEqual([undefined, undefined])
      expect(MonotonicStack.previousGreater([2, 1])).toEqual([undefined, 2])
    })
  })

  describe('previousSmaller', () => {
    it('should find previous smaller elements', () => {
      expect(MonotonicStack.previousSmaller([4, 5, 2, 25])).toEqual([undefined, 4, undefined, 2])
    })

    it('should return undefined when no previous smaller exists', () => {
      expect(MonotonicStack.previousSmaller([5, 4, 3, 2, 1])).toEqual([undefined, undefined, undefined, undefined, undefined])
    })

    it('should handle all same elements', () => {
      expect(MonotonicStack.previousSmaller([3, 3, 3])).toEqual([undefined, undefined, undefined])
    })

    it('should handle empty array', () => {
      expect(MonotonicStack.previousSmaller([])).toEqual([])
    })

    it('should handle single element', () => {
      expect(MonotonicStack.previousSmaller([1])).toEqual([undefined])
    })

    it('should handle strictly increasing input', () => {
      expect(MonotonicStack.previousSmaller([1, 2, 3, 4])).toEqual([undefined, 1, 2, 3])
    })

    it('should handle negative numbers', () => {
      expect(MonotonicStack.previousSmaller([-3, -1, -2, 0])).toEqual([undefined, -3, -3, -2])
    })

    it('should handle two elements', () => {
      expect(MonotonicStack.previousSmaller([2, 1])).toEqual([undefined, undefined])
      expect(MonotonicStack.previousSmaller([1, 2])).toEqual([undefined, 1])
    })
  })

  describe('largestRectangleInHistogram', () => {
    it('should find largest rectangle in basic histogram', () => {
      expect(MonotonicStack.largestRectangleInHistogram([2, 1, 5, 6, 2, 3])).toBe(10)
    })

    it('should handle empty array', () => {
      expect(MonotonicStack.largestRectangleInHistogram([])).toBe(0)
    })

    it('should handle single element', () => {
      expect(MonotonicStack.largestRectangleInHistogram([5])).toBe(5)
    })

    it('should handle all same heights', () => {
      expect(MonotonicStack.largestRectangleInHistogram([3, 3, 3, 3])).toBe(12)
    })

    it('should handle strictly increasing heights', () => {
      expect(MonotonicStack.largestRectangleInHistogram([1, 2, 3, 4])).toBe(6)
    })

    it('should handle strictly decreasing heights', () => {
      expect(MonotonicStack.largestRectangleInHistogram([4, 3, 2, 1])).toBe(6)
    })

    it('should handle heights with zeros', () => {
      expect(MonotonicStack.largestRectangleInHistogram([0, 2, 0])).toBe(2)
    })

    it('should handle all zeros', () => {
      expect(MonotonicStack.largestRectangleInHistogram([0, 0, 0])).toBe(0)
    })

    it('should handle two elements', () => {
      expect(MonotonicStack.largestRectangleInHistogram([2, 4])).toBe(4)
      expect(MonotonicStack.largestRectangleInHistogram([4, 2])).toBe(4)
    })

    it('should handle single height histogram', () => {
      expect(MonotonicStack.largestRectangleInHistogram([5, 5, 5, 5, 5])).toBe(25)
    })

    it('should handle classic leetcode example', () => {
      expect(MonotonicStack.largestRectangleInHistogram([6, 2, 5, 4, 5, 1, 6])).toBe(12)
    })

    it('should handle alternating heights', () => {
      expect(MonotonicStack.largestRectangleInHistogram([1, 3, 1, 3, 1])).toBe(5)
    })
  })

  describe('edge cases', () => {
    it('should handle empty stack operations', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      expect(s.pop()).toBeUndefined()
      expect(s.peek()).toBeUndefined()
      expect(s.size()).toBe(0)
      expect(s.isEmpty()).toBe(true)
      expect(s.toArray()).toEqual([])
    })

    it('should handle single element', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      s.push(42)
      expect(s.peek()).toBe(42)
      expect(s.size()).toBe(1)
      expect(s.toArray()).toEqual([42])
      s.pop()
      expect(s.isEmpty()).toBe(true)
    })

    it('should handle all same values (increasing)', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      for (let i = 0; i < 5; i++) s.push(7)
      expect(s.toArray()).toEqual([7, 7, 7, 7, 7])
      expect(s.size()).toBe(5)
    })

    it('should handle all same values (decreasing)', () => {
      const s = new MonotonicStack<number>({ mode: 'decreasing' })
      for (let i = 0; i < 5; i++) s.push(7)
      expect(s.toArray()).toEqual([7, 7, 7, 7, 7])
      expect(s.size()).toBe(5)
    })

    it('should handle strictly increasing input (increasing mode)', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      s.push(1)
      s.push(2)
      s.push(3)
      s.push(4)
      s.push(5)
      expect(s.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle strictly decreasing input (increasing mode)', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      s.push(5)
      s.push(4)
      s.push(3)
      s.push(2)
      s.push(1)
      expect(s.toArray()).toEqual([1])
    })

    it('should handle strictly decreasing input (decreasing mode)', () => {
      const s = new MonotonicStack<number>({ mode: 'decreasing' })
      s.push(5)
      s.push(4)
      s.push(3)
      s.push(2)
      s.push(1)
      expect(s.toArray()).toEqual([5, 4, 3, 2, 1])
    })

    it('should handle strictly increasing input (decreasing mode)', () => {
      const s = new MonotonicStack<number>({ mode: 'decreasing' })
      s.push(1)
      s.push(2)
      s.push(3)
      s.push(4)
      s.push(5)
      expect(s.toArray()).toEqual([5])
    })

    it('should handle negative numbers (increasing)', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      s.push(-3)
      s.push(-1)
      s.push(-2)
      s.push(0)
      expect(s.toArray()).toEqual([-3, -2, 0])
    })

    it('should handle negative numbers (decreasing)', () => {
      const s = new MonotonicStack<number>({ mode: 'decreasing' })
      s.push(-1)
      s.push(-3)
      s.push(-2)
      s.push(0)
      expect(s.toArray()).toEqual([0])
    })

    it('should handle zero values', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      s.push(0)
      s.push(0)
      s.push(0)
      expect(s.toArray()).toEqual([0, 0, 0])
    })

    it('should handle floating point numbers', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      s.push(1.5)
      s.push(2.7)
      s.push(1.1)
      s.push(3.0)
      expect(s.toArray()).toEqual([1.1, 3.0])
    })

    it('should handle strings with default comparator', () => {
      const s = new MonotonicStack<string>({ mode: 'increasing' })
      s.push('banana')
      s.push('apple')
      s.push('cherry')
      expect(s.toArray()).toEqual(['apple', 'cherry'])
    })
  })

  describe('large inputs', () => {
    it('should handle 10000 elements (increasing mode)', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      for (let i = 0; i < 10000; i++) {
        s.push(i)
      }
      expect(s.size()).toBe(10000)
      expect(s.peek()).toBe(9999)
    })

    it('should handle 10000 elements (decreasing mode)', () => {
      const s = new MonotonicStack<number>({ mode: 'decreasing' })
      for (let i = 0; i < 10000; i++) {
        s.push(i)
      }
      expect(s.size()).toBe(1)
      expect(s.peek()).toBe(9999)
    })

    it('should handle 10000 same elements', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      for (let i = 0; i < 10000; i++) {
        s.push(42)
      }
      expect(s.size()).toBe(10000)
    })

    it('should handle 10000 nextGreater', () => {
      const arr = Array.from({ length: 10000 }, (_, i) => i)
      const result = MonotonicStack.nextGreater(arr)
      expect(result.length).toBe(10000)
      expect(result[0]).toBe(1)
      expect(result[9998]).toBe(9999)
      expect(result[9999]).toBeUndefined()
    })

    it('should handle 10000 largestRectangleInHistogram', () => {
      const heights = Array.from({ length: 10000 }, (_, i) => i + 1)
      const result = MonotonicStack.largestRectangleInHistogram(heights)
      expect(result).toBeGreaterThan(0)
    })

    it('should handle alternating values (increasing)', () => {
      const s = new MonotonicStack<number>({ mode: 'increasing' })
      for (let i = 0; i < 10000; i++) {
        s.push(i % 2 === 0 ? 1 : 2)
      }
      expect(s.size()).toBe(5001)
    })
  })

  describe('defaultComparator', () => {
    it('should be exported from types', () => {
      expect(defaultComparator).toBeDefined()
      expect(typeof defaultComparator).toBe('function')
    })

    it('should compare numbers correctly', () => {
      expect(defaultComparator(1, 2)).toBe(-1)
      expect(defaultComparator(2, 1)).toBe(1)
      expect(defaultComparator(1, 1)).toBe(0)
    })

    it('should compare strings correctly', () => {
      expect(defaultComparator('a', 'b')).toBe(-1)
      expect(defaultComparator('b', 'a')).toBe(1)
      expect(defaultComparator('a', 'a')).toBe(0)
    })
  })

  describe('type exports', () => {
    it('should export MonotonicStackOptions type', () => {
      const opts: MonotonicStackOptions<number> = { mode: 'increasing' }
      expect(opts.mode).toBe('increasing')
    })

    it('should export MonotonicStackStats type', () => {
      const stats: MonotonicStackStats = {
        size: 0,
        isEmpty: true,
        mode: 'increasing',
        totalPushed: 0,
        totalPopped: 0,
      }
      expect(stats.mode).toBe('increasing')
    })
  })
})
