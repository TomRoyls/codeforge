import { describe, it, expect } from 'vitest'
import { SlidingWindowMax } from '../../src/core/sliding-window-max/index.js'
import type { SlidingWindowMaxOptions } from '../../src/core/sliding-window-max/types.js'

describe('SlidingWindowMax', () => {
  describe('constructor', () => {
    it('creates instance with default options', () => {
      const sw = new SlidingWindowMax()
      expect(sw.size).toBe(0)
      expect(sw.isEmpty).toBe(true)
      expect(sw.windowSize).toBe(Infinity)
    })

    it('creates instance with windowSize option', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      expect(sw.size).toBe(0)
      expect(sw.isEmpty).toBe(true)
      expect(sw.windowSize).toBe(3)
    })

    it('creates instance with custom comparator', () => {
      const sw = new SlidingWindowMax<number>({
        windowSize: 3,
        comparator: (a, b) => a - b,
      })
      expect(sw.size).toBe(0)
    })

    it('creates instance with windowSize 1', () => {
      const sw = new SlidingWindowMax({ windowSize: 1 })
      expect(sw.windowSize).toBe(1)
    })

    it('creates instance with large windowSize', () => {
      const sw = new SlidingWindowMax({ windowSize: 10000 })
      expect(sw.windowSize).toBe(10000)
    })

    it('throws on windowSize 0', () => {
      expect(() => new SlidingWindowMax({ windowSize: 0 })).toThrow(RangeError)
    })

    it('throws on negative windowSize', () => {
      expect(() => new SlidingWindowMax({ windowSize: -1 })).toThrow(RangeError)
    })
  })

  describe('push', () => {
    it('pushes a single value', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(5)
      expect(sw.size).toBe(1)
      expect(sw.isEmpty).toBe(false)
    })

    it('pushes multiple values within window', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      expect(sw.size).toBe(3)
    })

    it('evicts oldest element when window is full', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      sw.push(4)
      expect(sw.size).toBe(3)
      expect(sw.toArray()).toEqual([2, 3, 4])
    })

    it('maintains correct window after multiple evictions', () => {
      const sw = new SlidingWindowMax({ windowSize: 2 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      sw.push(4)
      sw.push(5)
      expect(sw.size).toBe(2)
      expect(sw.toArray()).toEqual([4, 5])
    })

    it('handles pushing equal values', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(5)
      sw.push(5)
      sw.push(5)
      expect(sw.max()).toBe(5)
      expect(sw.min()).toBe(5)
    })

    it('handles pushing values with no windowSize limit', () => {
      const sw = new SlidingWindowMax()
      for (let i = 0; i < 100; i++) {
        sw.push(i)
      }
      expect(sw.size).toBe(100)
    })
  })

  describe('max', () => {
    it('returns undefined when empty', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      expect(sw.max()).toBeUndefined()
    })

    it('returns single element', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(5)
      expect(sw.max()).toBe(5)
    })

    it('returns max of multiple elements', () => {
      const sw = new SlidingWindowMax({ windowSize: 5 })
      sw.push(1)
      sw.push(5)
      sw.push(3)
      expect(sw.max()).toBe(5)
    })

    it('updates max after eviction of max element', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(10)
      sw.push(2)
      sw.push(3)
      expect(sw.max()).toBe(10)
      sw.push(4)
      expect(sw.max()).toBe(4)
    })

    it('handles descending sequence', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(5)
      sw.push(4)
      sw.push(3)
      expect(sw.max()).toBe(5)
      sw.push(2)
      expect(sw.max()).toBe(4)
      sw.push(1)
      expect(sw.max()).toBe(3)
    })

    it('handles ascending sequence', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      expect(sw.max()).toBe(3)
      sw.push(4)
      expect(sw.max()).toBe(4)
    })

    it('handles negative numbers', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(-5)
      sw.push(-2)
      sw.push(-8)
      expect(sw.max()).toBe(-2)
    })

    it('handles mixed positive and negative', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(-3)
      sw.push(0)
      sw.push(5)
      expect(sw.max()).toBe(5)
    })
  })

  describe('min', () => {
    it('returns undefined when empty', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      expect(sw.min()).toBeUndefined()
    })

    it('returns single element', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(5)
      expect(sw.min()).toBe(5)
    })

    it('returns min of multiple elements', () => {
      const sw = new SlidingWindowMax({ windowSize: 5 })
      sw.push(3)
      sw.push(1)
      sw.push(5)
      expect(sw.min()).toBe(1)
    })

    it('updates min after eviction of min element', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(1)
      sw.push(5)
      sw.push(3)
      expect(sw.min()).toBe(1)
      sw.push(4)
      expect(sw.min()).toBe(3)
    })

    it('handles descending sequence', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(5)
      sw.push(4)
      sw.push(3)
      expect(sw.min()).toBe(3)
    })

    it('handles ascending sequence', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      expect(sw.min()).toBe(1)
      sw.push(4)
      expect(sw.min()).toBe(2)
    })

    it('handles negative numbers', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(-5)
      sw.push(-2)
      sw.push(-8)
      expect(sw.min()).toBe(-8)
    })
  })

  describe('top', () => {
    it('is alias for max', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(3)
      sw.push(7)
      sw.push(1)
      expect(sw.top()).toBe(sw.max())
      expect(sw.top()).toBe(7)
    })

    it('returns undefined when empty', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      expect(sw.top()).toBeUndefined()
    })
  })

  describe('size and isEmpty', () => {
    it('size is 0 for empty window', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      expect(sw.size).toBe(0)
    })

    it('isEmpty is true for empty window', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      expect(sw.isEmpty).toBe(true)
    })

    it('size tracks number of elements', () => {
      const sw = new SlidingWindowMax({ windowSize: 5 })
      sw.push(1)
      expect(sw.size).toBe(1)
      sw.push(2)
      expect(sw.size).toBe(2)
      sw.push(3)
      expect(sw.size).toBe(3)
    })

    it('size does not exceed windowSize', () => {
      const sw = new SlidingWindowMax({ windowSize: 2 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      expect(sw.size).toBe(2)
    })
  })

  describe('windowSize getter', () => {
    it('returns configured window size', () => {
      const sw = new SlidingWindowMax({ windowSize: 5 })
      expect(sw.windowSize).toBe(5)
    })

    it('returns Infinity when no windowSize specified', () => {
      const sw = new SlidingWindowMax()
      expect(sw.windowSize).toBe(Infinity)
    })
  })

  describe('clear', () => {
    it('clears all elements', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      sw.clear()
      expect(sw.size).toBe(0)
      expect(sw.isEmpty).toBe(true)
      expect(sw.max()).toBeUndefined()
      expect(sw.min()).toBeUndefined()
    })

    it('allows pushing after clear', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(1)
      sw.push(2)
      sw.clear()
      sw.push(10)
      expect(sw.size).toBe(1)
      expect(sw.max()).toBe(10)
    })

    it('clear preserves windowSize', () => {
      const sw = new SlidingWindowMax({ windowSize: 5 })
      sw.push(1)
      sw.clear()
      expect(sw.windowSize).toBe(5)
    })
  })

  describe('reset', () => {
    it('clears all elements and resets push index', () => {
      const sw = new SlidingWindowMax({ windowSize: 2 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      sw.reset()
      expect(sw.size).toBe(0)
      expect(sw.isEmpty).toBe(true)
    })

    it('allows fresh start after reset', () => {
      const sw = new SlidingWindowMax({ windowSize: 2 })
      sw.push(100)
      sw.push(200)
      sw.push(300)
      sw.reset()
      sw.push(1)
      sw.push(2)
      expect(sw.toArray()).toEqual([1, 2])
      expect(sw.max()).toBe(2)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty window', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      expect(sw.toArray()).toEqual([])
    })

    it('returns current window contents', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      expect(sw.toArray()).toEqual([1, 2, 3])
    })

    it('returns only windowed elements after eviction', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      sw.push(4)
      expect(sw.toArray()).toEqual([2, 3, 4])
    })

    it('returns a copy not a reference', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(1)
      sw.push(2)
      const arr = sw.toArray()
      arr.push(999)
      expect(sw.size).toBe(2)
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      const copy = sw.clone()
      expect(copy.toArray()).toEqual([1, 2, 3])
      expect(copy.max()).toBe(3)
      expect(copy.min()).toBe(1)
    })

    it('clone is independent from original', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(1)
      sw.push(2)
      const copy = sw.clone()
      sw.push(100)
      expect(sw.max()).toBe(100)
      expect(copy.max()).toBe(2)
    })

    it('clone preserves windowSize', () => {
      const sw = new SlidingWindowMax({ windowSize: 5 })
      sw.push(1)
      const copy = sw.clone()
      expect(copy.windowSize).toBe(5)
    })

    it('clone preserves comparator', () => {
      const sw = new SlidingWindowMax<string>({
        windowSize: 3,
        comparator: (a, b) => b.localeCompare(a),
      })
      sw.push('a')
      sw.push('b')
      const copy = sw.clone()
      expect(copy.max()).toBe('a')
    })
  })

  describe('fromArray', () => {
    it('creates instance from array', () => {
      const sw = SlidingWindowMax.fromArray([1, 2, 3, 4, 5], { windowSize: 3 })
      expect(sw.size).toBe(3)
      expect(sw.max()).toBe(5)
    })

    it('creates instance with default options', () => {
      const sw = SlidingWindowMax.fromArray([1, 2, 3])
      expect(sw.size).toBe(3)
    })

    it('handles empty array', () => {
      const sw = SlidingWindowMax.fromArray([], { windowSize: 3 })
      expect(sw.size).toBe(0)
      expect(sw.isEmpty).toBe(true)
    })

    it('handles single element array', () => {
      const sw = SlidingWindowMax.fromArray([42], { windowSize: 3 })
      expect(sw.size).toBe(1)
      expect(sw.max()).toBe(42)
    })

    it('handles array smaller than windowSize', () => {
      const sw = SlidingWindowMax.fromArray([1, 2], { windowSize: 10 })
      expect(sw.size).toBe(2)
      expect(sw.max()).toBe(2)
    })

    it('computes all maxima correctly', () => {
      const sw = SlidingWindowMax.fromArray([1, 3, -1, -3, 5, 3, 6, 7], { windowSize: 3 })
      expect(sw.toArray()).toEqual([3, 6, 7])
      expect(sw.max()).toBe(7)
    })
  })

  describe('allMaxima', () => {
    it('returns empty array for empty window', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      expect(sw.allMaxima()).toEqual([])
    })

    it('computes all sliding window maxima', () => {
      const sw = SlidingWindowMax.fromArray([1, 3, -1, -3, 5, 3, 6, 7], { windowSize: 3 })
      const result = sw.allMaxima()
      expect(result).toEqual([3, 3, 5, 5, 6, 7])
    })

    it('handles window size equal to array length', () => {
      const sw = SlidingWindowMax.fromArray([1, 3, 2], { windowSize: 3 })
      expect(sw.allMaxima()).toEqual([3])
    })

    it('handles window size 1', () => {
      const sw = SlidingWindowMax.fromArray([1, 3, 2, 5, 4], { windowSize: 1 })
      expect(sw.allMaxima()).toEqual([1, 3, 2, 5, 4])
    })

    it('handles array smaller than window', () => {
      const sw = SlidingWindowMax.fromArray([3, 1, 2], { windowSize: 5 })
      expect(sw.allMaxima()).toEqual([3])
    })

    it('handles decreasing sequence', () => {
      const sw = SlidingWindowMax.fromArray([5, 4, 3, 2, 1], { windowSize: 3 })
      expect(sw.allMaxima()).toEqual([5, 4, 3])
    })

    it('handles increasing sequence', () => {
      const sw = SlidingWindowMax.fromArray([1, 2, 3, 4, 5], { windowSize: 3 })
      expect(sw.allMaxima()).toEqual([3, 4, 5])
    })
  })

  describe('forEach', () => {
    it('iterates over all elements', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      const collected: number[] = []
      sw.forEach((v) => collected.push(v))
      expect(collected).toEqual([1, 2, 3])
    })

    it('provides correct indices', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(10)
      sw.push(20)
      sw.push(30)
      const indices: number[] = []
      sw.forEach((_, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('does not iterate on empty window', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      let count = 0
      sw.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('iterates windowed elements after eviction', () => {
      const sw = new SlidingWindowMax({ windowSize: 2 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      const collected: number[] = []
      sw.forEach((v) => collected.push(v))
      expect(collected).toEqual([2, 3])
    })
  })

  describe('Symbol.iterator', () => {
    it('is iterable', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      expect([...sw]).toEqual([1, 2, 3])
    })

    it('works with for-of', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(10)
      sw.push(20)
      const result: number[] = []
      for (const val of sw) {
        result.push(val)
      }
      expect(result).toEqual([10, 20])
    })

    it('returns empty iterator for empty window', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      expect([...sw]).toEqual([])
    })
  })

  describe('first and last', () => {
    it('first returns undefined when empty', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      expect(sw.first()).toBeUndefined()
    })

    it('last returns undefined when empty', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      expect(sw.last()).toBeUndefined()
    })

    it('first returns oldest element in window', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      expect(sw.first()).toBe(1)
    })

    it('last returns newest element in window', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      expect(sw.last()).toBe(3)
    })

    it('first updates after eviction', () => {
      const sw = new SlidingWindowMax({ windowSize: 2 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      expect(sw.first()).toBe(2)
      expect(sw.last()).toBe(3)
    })
  })

  describe('pushAll', () => {
    it('pushes multiple values', () => {
      const sw = new SlidingWindowMax({ windowSize: 5 })
      sw.pushAll([1, 2, 3, 4, 5])
      expect(sw.size).toBe(5)
      expect(sw.max()).toBe(5)
    })

    it('handles empty iterable', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.pushAll([])
      expect(sw.size).toBe(0)
    })

    it('evicts correctly with pushAll', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.pushAll([1, 2, 3, 4, 5])
      expect(sw.size).toBe(3)
      expect(sw.toArray()).toEqual([3, 4, 5])
    })

    it('works with generator', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      function* gen() {
        yield 10
        yield 20
        yield 30
      }
      sw.pushAll(gen())
      expect(sw.size).toBe(3)
      expect(sw.max()).toBe(30)
    })
  })

  describe('custom comparator', () => {
    it('works with string comparator', () => {
      const sw = new SlidingWindowMax<string>({
        windowSize: 3,
        comparator: (a, b) => a.localeCompare(b),
      })
      sw.push('banana')
      sw.push('apple')
      sw.push('cherry')
      expect(sw.max()).toBe('cherry')
      expect(sw.min()).toBe('apple')
    })

    it('works with reverse comparator for min-focused', () => {
      const sw = new SlidingWindowMax<number>({
        windowSize: 3,
        comparator: (a, b) => b - a,
      })
      sw.push(1)
      sw.push(5)
      sw.push(3)
      expect(sw.max()).toBe(1)
      expect(sw.min()).toBe(5)
    })

    it('works with object comparator', () => {
      interface Item {
        priority: number
        name: string
      }
      const sw = new SlidingWindowMax<Item>({
        windowSize: 3,
        comparator: (a, b) => a.priority - b.priority,
      })
      sw.push({ priority: 1, name: 'low' })
      sw.push({ priority: 5, name: 'high' })
      sw.push({ priority: 3, name: 'mid' })
      expect(sw.max()!.name).toBe('high')
      expect(sw.min()!.name).toBe('low')
    })

    it('works with absolute value comparator', () => {
      const sw = new SlidingWindowMax<number>({
        windowSize: 3,
        comparator: (a, b) => Math.abs(a) - Math.abs(b),
      })
      sw.push(-5)
      sw.push(3)
      sw.push(-2)
      expect(sw.max()).toBe(-5)
      expect(sw.min()).toBe(-2)
    })
  })

  describe('edge cases', () => {
    it('handles windowSize of 1', () => {
      const sw = new SlidingWindowMax({ windowSize: 1 })
      sw.push(5)
      expect(sw.max()).toBe(5)
      expect(sw.min()).toBe(5)
      sw.push(3)
      expect(sw.max()).toBe(3)
      expect(sw.toArray()).toEqual([3])
    })

    it('handles single element', () => {
      const sw = new SlidingWindowMax({ windowSize: 5 })
      sw.push(42)
      expect(sw.max()).toBe(42)
      expect(sw.min()).toBe(42)
      expect(sw.first()).toBe(42)
      expect(sw.last()).toBe(42)
      expect(sw.size).toBe(1)
    })

    it('handles all same values', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(7)
      sw.push(7)
      sw.push(7)
      expect(sw.max()).toBe(7)
      expect(sw.min()).toBe(7)
      sw.push(7)
      expect(sw.max()).toBe(7)
    })

    it('handles Infinity values', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(1)
      sw.push(Infinity)
      sw.push(3)
      expect(sw.max()).toBe(Infinity)
      expect(sw.min()).toBe(1)
    })

    it('handles -Infinity values', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(-Infinity)
      sw.push(2)
      sw.push(3)
      expect(sw.max()).toBe(3)
      expect(sw.min()).toBe(-Infinity)
    })

    it('handles zero values', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(0)
      sw.push(-1)
      sw.push(1)
      expect(sw.max()).toBe(1)
      expect(sw.min()).toBe(-1)
    })
  })

  describe('large inputs', () => {
    it('handles large number of pushes', () => {
      const sw = new SlidingWindowMax({ windowSize: 100 })
      for (let i = 0; i < 10000; i++) {
        sw.push(i)
      }
      expect(sw.size).toBe(100)
      expect(sw.max()).toBe(9999)
      expect(sw.min()).toBe(9900)
    })

    it('handles large array in fromArray', () => {
      const arr = Array.from({ length: 10000 }, (_, i) => i)
      const sw = SlidingWindowMax.fromArray(arr, { windowSize: 500 })
      expect(sw.size).toBe(500)
      expect(sw.max()).toBe(9999)
    })

    it('handles alternating high and low values', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      for (let i = 0; i < 1000; i++) {
        sw.push(i % 2 === 0 ? 100 : 1)
      }
      expect(sw.max()).toBe(100)
      expect(sw.min()).toBe(1)
    })
  })

  describe('window eviction behavior', () => {
    it('correctly evicts and updates max', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(10)
      sw.push(20)
      sw.push(30)
      expect(sw.max()).toBe(30)
      sw.push(5)
      expect(sw.max()).toBe(30)
      sw.push(1)
      expect(sw.max()).toBe(30)
      sw.push(40)
      expect(sw.max()).toBe(40)
    })

    it('correctly evicts and updates min', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(30)
      sw.push(20)
      sw.push(10)
      expect(sw.min()).toBe(10)
      sw.push(5)
      expect(sw.min()).toBe(5)
      sw.push(100)
      expect(sw.min()).toBe(5)
      sw.push(50)
      expect(sw.min()).toBe(5)
      sw.push(1)
      expect(sw.min()).toBe(1)
    })

    it('handles complex eviction pattern', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(1)
      sw.push(3)
      sw.push(2)
      expect(sw.toArray()).toEqual([1, 3, 2])
      expect(sw.max()).toBe(3)

      sw.push(1)
      expect(sw.toArray()).toEqual([3, 2, 1])
      expect(sw.max()).toBe(3)

      sw.push(4)
      expect(sw.toArray()).toEqual([2, 1, 4])
      expect(sw.max()).toBe(4)

      sw.push(0)
      expect(sw.toArray()).toEqual([1, 4, 0])
      expect(sw.max()).toBe(4)
      expect(sw.min()).toBe(0)
    })

    it('window never exceeds windowSize', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      for (let i = 0; i < 50; i++) {
        sw.push(i)
        expect(sw.size).toBeLessThanOrEqual(3)
      }
    })
  })

  describe('classic sliding window max examples', () => {
    it('solves LeetCode 239 example', () => {
      const arr = [1, 3, -1, -3, 5, 3, 6, 7]
      const sw = SlidingWindowMax.fromArray(arr, { windowSize: 3 })
      expect(sw.allMaxima()).toEqual([3, 3, 5, 5, 6, 7])
    })

    it('handles monotonically decreasing input', () => {
      const sw = SlidingWindowMax.fromArray([9, 8, 7, 6, 5, 4, 3, 2, 1], { windowSize: 3 })
      expect(sw.allMaxima()).toEqual([9, 8, 7, 6, 5, 4, 3])
    })

    it('handles monotonically increasing input', () => {
      const sw = SlidingWindowMax.fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9], { windowSize: 3 })
      expect(sw.allMaxima()).toEqual([3, 4, 5, 6, 7, 8, 9])
    })

    it('handles single element arrays', () => {
      const sw = SlidingWindowMax.fromArray([5], { windowSize: 1 })
      expect(sw.allMaxima()).toEqual([5])
    })

    it('handles duplicate max values across windows', () => {
      const sw = SlidingWindowMax.fromArray([4, 4, 4, 4], { windowSize: 2 })
      expect(sw.allMaxima()).toEqual([4, 4, 4])
    })
  })

  describe('integration', () => {
    it('push, clear, push again works correctly', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(10)
      sw.push(20)
      sw.clear()
      expect(sw.isEmpty).toBe(true)
      sw.push(1)
      sw.push(2)
      sw.push(3)
      expect(sw.max()).toBe(3)
      expect(sw.toArray()).toEqual([1, 2, 3])
    })

    it('clone after eviction has correct state', () => {
      const sw = new SlidingWindowMax({ windowSize: 2 })
      sw.push(10)
      sw.push(20)
      sw.push(30)
      const copy = sw.clone()
      expect(copy.toArray()).toEqual([20, 30])
      expect(copy.max()).toBe(30)
      expect(copy.min()).toBe(20)
    })

    it('forEach after eviction iterates correct elements', () => {
      const sw = new SlidingWindowMax({ windowSize: 2 })
      sw.push(10)
      sw.push(20)
      sw.push(30)
      const items: number[] = []
      sw.forEach((v) => items.push(v))
      expect(items).toEqual([20, 30])
    })

    it('iterator after eviction yields correct elements', () => {
      const sw = new SlidingWindowMax({ windowSize: 2 })
      sw.push(10)
      sw.push(20)
      sw.push(30)
      expect([...sw]).toEqual([20, 30])
    })

    it('allMaxima after reset works from scratch', () => {
      const sw = new SlidingWindowMax({ windowSize: 2 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      sw.reset()
      sw.pushAll([10, 20, 30, 40])
      expect(sw.size).toBe(2)
      expect(sw.max()).toBe(40)
    })

    it('fromArray with custom comparator works', () => {
      const sw = SlidingWindowMax.fromArray(['z', 'a', 'm', 'b'], {
        windowSize: 2,
        comparator: (a, b) => a.localeCompare(b),
      })
      expect(sw.max()).toBe('m')
      expect(sw.min()).toBe('b')
    })

    it('pushAll after partial fill works', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(1)
      sw.pushAll([2, 3, 4])
      expect(sw.size).toBe(3)
      expect(sw.toArray()).toEqual([2, 3, 4])
      expect(sw.max()).toBe(4)
    })
  })

  describe('additional coverage', () => {
    it('clear does not reset history for allMaxima', () => {
      const sw = new SlidingWindowMax({ windowSize: 2 })
      sw.pushAll([1, 2, 3])
      sw.clear()
      expect(sw.allMaxima()).toEqual([2, 3])
    })

    it('reset clears history for allMaxima', () => {
      const sw = new SlidingWindowMax({ windowSize: 2 })
      sw.pushAll([1, 2, 3])
      sw.reset()
      sw.pushAll([10, 20])
      expect(sw.allMaxima()).toEqual([20])
    })

    it('clone includes history for allMaxima', () => {
      const sw = new SlidingWindowMax({ windowSize: 2 })
      sw.pushAll([5, 3, 8, 1])
      const copy = sw.clone()
      expect(copy.allMaxima()).toEqual([5, 8, 8])
    })

    it('handles floating point values', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(1.5)
      sw.push(2.7)
      sw.push(0.3)
      expect(sw.max()).toBe(2.7)
      expect(sw.min()).toBe(0.3)
    })

    it('handles NaN in window', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(1)
      sw.push(NaN)
      sw.push(3)
      expect(sw.size).toBe(3)
    })

    it('allMaxima with single value in history', () => {
      const sw = new SlidingWindowMax({ windowSize: 5 })
      sw.push(42)
      expect(sw.allMaxima()).toEqual([42])
    })

    it('allMaxima returns empty for no windowSize', () => {
      const sw = new SlidingWindowMax()
      sw.pushAll([1, 2, 3])
      expect(sw.allMaxima()).toEqual([])
    })

    it('multiple clear and push cycles', () => {
      const sw = new SlidingWindowMax({ windowSize: 2 })
      sw.push(1)
      sw.push(2)
      sw.clear()
      sw.push(10)
      sw.clear()
      sw.push(100)
      sw.push(200)
      expect(sw.max()).toBe(200)
      expect(sw.size).toBe(2)
    })

    it('fromArray with only windowSize option', () => {
      const sw = SlidingWindowMax.fromArray([5, 2, 8, 1, 9], { windowSize: 3 })
      expect(sw.max()).toBe(9)
      expect(sw.size).toBe(3)
      expect(sw.toArray()).toEqual([8, 1, 9])
    })

    it('fromArray with only comparator option', () => {
      const sw = SlidingWindowMax.fromArray([5, 2, 8], {
        comparator: (a, b) => a - b,
      })
      expect(sw.size).toBe(3)
      expect(sw.max()).toBe(8)
    })

    it('first and last with single element', () => {
      const sw = new SlidingWindowMax({ windowSize: 5 })
      sw.push(99)
      expect(sw.first()).toBe(99)
      expect(sw.last()).toBe(99)
    })

    it('iterator works with spread in array context', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.pushAll([10, 20, 30])
      const [a, b, c] = sw
      expect(a).toBe(10)
      expect(b).toBe(20)
      expect(c).toBe(30)
    })

    it('forEach callback receives value and index', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.pushAll([10, 20, 30])
      const results: [number, number][] = []
      sw.forEach((v, i) => results.push([v, i]))
      expect(results).toEqual([[10, 0], [20, 1], [30, 2]])
    })

    it('top updates correctly with window sliding', () => {
      const sw = new SlidingWindowMax({ windowSize: 2 })
      sw.push(5)
      expect(sw.top()).toBe(5)
      sw.push(10)
      expect(sw.top()).toBe(10)
      sw.push(3)
      expect(sw.top()).toBe(10)
      sw.push(1)
      expect(sw.top()).toBe(3)
    })
  })
})
