import { describe, it, expect, beforeEach } from 'vitest'
import { SlidingWindowMax } from '../../src/core/sliding-window-max/sliding-window-max.js'

describe('SlidingWindowMax', () => {
  describe('constructor', () => {
    it('should create instance with valid windowSize', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      expect(sw.size).toBe(0)
      expect(sw.isFull).toBe(false)
    })

    it('should create instance with windowSize 1', () => {
      const sw = new SlidingWindowMax({ windowSize: 1 })
      expect(sw.size).toBe(0)
    })

    it('should create instance with large windowSize', () => {
      const sw = new SlidingWindowMax({ windowSize: 1000000 })
      expect(sw.size).toBe(0)
    })

    it('should throw RangeError for windowSize 0', () => {
      expect(() => new SlidingWindowMax({ windowSize: 0 })).toThrow(RangeError)
    })

    it('should throw RangeError for negative windowSize', () => {
      expect(() => new SlidingWindowMax({ windowSize: -1 })).toThrow(RangeError)
    })

    it('should throw RangeError for fractional windowSize', () => {
      expect(() => new SlidingWindowMax({ windowSize: 2.5 })).toThrow(RangeError)
    })

    it('should throw RangeError for NaN windowSize', () => {
      expect(() => new SlidingWindowMax({ windowSize: NaN })).toThrow(RangeError)
    })

    it('should throw RangeError for Infinity windowSize', () => {
      expect(() => new SlidingWindowMax({ windowSize: Infinity })).toThrow(RangeError)
    })

    it('should accept windowSize of exactly 1', () => {
      const sw = new SlidingWindowMax({ windowSize: 1 })
      sw.push(42)
      expect(sw.isFull).toBe(true)
    })
  })

  describe('push', () => {
    let sw: SlidingWindowMax

    beforeEach(() => {
      sw = new SlidingWindowMax({ windowSize: 3 })
    })

    it('should accept a single push', () => {
      sw.push(1)
      expect(sw.size).toBe(1)
    })

    it('should track multiple pushes', () => {
      sw.push(1)
      sw.push(2)
      sw.push(3)
      expect(sw.size).toBe(3)
    })

    it('should slide window after exceeding windowSize', () => {
      sw.push(1)
      sw.push(2)
      sw.push(3)
      sw.push(4)
      expect(sw.size).toBe(3)
      expect(sw.toArray()).toEqual([2, 3, 4])
    })

    it('should slide window correctly with many pushes', () => {
      sw.push(1)
      sw.push(2)
      sw.push(3)
      sw.push(4)
      sw.push(5)
      expect(sw.size).toBe(3)
      expect(sw.toArray()).toEqual([3, 4, 5])
    })

    it('should handle pushing zero', () => {
      sw.push(0)
      expect(sw.max()).toBe(0)
      expect(sw.getMin()).toBe(0)
    })

    it('should handle pushing negative numbers', () => {
      sw.push(-5)
      sw.push(-3)
      sw.push(-1)
      expect(sw.max()).toBe(-1)
      expect(sw.getMin()).toBe(-5)
    })

    it('should handle pushing duplicate values', () => {
      sw.push(5)
      sw.push(5)
      sw.push(5)
      expect(sw.max()).toBe(5)
      expect(sw.getMin()).toBe(5)
    })

    it('should increment pushCount on each push', () => {
      sw.push(1)
      sw.push(2)
      sw.push(3)
      expect(sw.stats().pushCount).toBe(3)
    })

    it('should increment pushCount even when window slides', () => {
      sw.push(1)
      sw.push(2)
      sw.push(3)
      sw.push(4)
      sw.push(5)
      expect(sw.stats().pushCount).toBe(5)
    })
  })

  describe('max', () => {
    let sw: SlidingWindowMax

    beforeEach(() => {
      sw = new SlidingWindowMax({ windowSize: 3 })
    })

    it('should return undefined on empty window', () => {
      expect(sw.max()).toBeUndefined()
    })

    it('should return the single element after one push', () => {
      sw.push(5)
      expect(sw.max()).toBe(5)
    })

    it('should return max of two elements', () => {
      sw.push(3)
      sw.push(7)
      expect(sw.max()).toBe(7)
    })

    it('should return max of full window', () => {
      sw.push(1)
      sw.push(5)
      sw.push(3)
      expect(sw.max()).toBe(5)
    })

    it('should update max after window slides', () => {
      sw.push(5)
      sw.push(1)
      sw.push(3)
      sw.push(2)
      expect(sw.max()).toBe(3)
    })

    it('should return max when max element slides out', () => {
      sw.push(9)
      sw.push(1)
      sw.push(2)
      sw.push(3)
      expect(sw.max()).toBe(3)
    })

    it('should handle max with duplicate maximums', () => {
      sw.push(5)
      sw.push(5)
      sw.push(3)
      expect(sw.max()).toBe(5)
    })

    it('should handle max when duplicate max slides out partially', () => {
      sw.push(5)
      sw.push(5)
      sw.push(1)
      sw.push(3)
      expect(sw.max()).toBe(5)
    })

    it('should return correct max for LeetCode 239 example', () => {
      const sw2 = new SlidingWindowMax({ windowSize: 3 })
      const arr = [1, 3, -1, -3, 5, 3, 6, 7]
      const results: (number | undefined)[] = []
      for (const v of arr) {
        sw2.push(v)
        if (sw2.isFull) results.push(sw2.max())
      }
      expect(results).toEqual([3, 3, 5, 5, 6, 7])
    })

    it('should handle max with all same values', () => {
      sw.push(4)
      sw.push(4)
      sw.push(4)
      expect(sw.max()).toBe(4)
    })

    it('should handle max with strictly increasing values', () => {
      sw.push(1)
      sw.push(2)
      sw.push(3)
      expect(sw.max()).toBe(3)
    })

    it('should handle max with strictly decreasing values', () => {
      sw.push(3)
      sw.push(2)
      sw.push(1)
      expect(sw.max()).toBe(3)
    })

    it('should handle max with negative numbers', () => {
      sw.push(-3)
      sw.push(-1)
      sw.push(-5)
      expect(sw.max()).toBe(-1)
    })

    it('should handle max with mixed positive and negative', () => {
      sw.push(-5)
      sw.push(3)
      sw.push(-1)
      expect(sw.max()).toBe(3)
    })
  })

  describe('getMin', () => {
    let sw: SlidingWindowMax

    beforeEach(() => {
      sw = new SlidingWindowMax({ windowSize: 3 })
    })

    it('should return undefined on empty window', () => {
      expect(sw.getMin()).toBeUndefined()
    })

    it('should return the single element after one push', () => {
      sw.push(5)
      expect(sw.getMin()).toBe(5)
    })

    it('should return min of two elements', () => {
      sw.push(3)
      sw.push(7)
      expect(sw.getMin()).toBe(3)
    })

    it('should return min of full window', () => {
      sw.push(1)
      sw.push(5)
      sw.push(3)
      expect(sw.getMin()).toBe(1)
    })

    it('should update min after window slides', () => {
      sw.push(1)
      sw.push(5)
      sw.push(3)
      sw.push(4)
      expect(sw.getMin()).toBe(3)
    })

    it('should return min when min element slides out', () => {
      sw.push(1)
      sw.push(9)
      sw.push(2)
      sw.push(3)
      expect(sw.getMin()).toBe(2)
    })

    it('should handle min with duplicate minimums', () => {
      sw.push(1)
      sw.push(1)
      sw.push(3)
      expect(sw.getMin()).toBe(1)
    })

    it('should handle min with all same values', () => {
      sw.push(4)
      sw.push(4)
      sw.push(4)
      expect(sw.getMin()).toBe(4)
    })

    it('should handle min with strictly increasing values', () => {
      sw.push(1)
      sw.push(2)
      sw.push(3)
      expect(sw.getMin()).toBe(1)
    })

    it('should handle min with strictly decreasing values', () => {
      sw.push(3)
      sw.push(2)
      sw.push(1)
      expect(sw.getMin()).toBe(1)
    })

    it('should handle min with negative numbers', () => {
      sw.push(-3)
      sw.push(-1)
      sw.push(-5)
      expect(sw.getMin()).toBe(-5)
    })

    it('should handle min with mixed positive and negative', () => {
      sw.push(-5)
      sw.push(3)
      sw.push(-1)
      expect(sw.getMin()).toBe(-5)
    })

    it('should track min correctly for LeetCode-style input', () => {
      const sw2 = new SlidingWindowMax({ windowSize: 3 })
      const arr = [1, 3, -1, -3, 5, 3, 6, 7]
      const results: (number | undefined)[] = []
      for (const v of arr) {
        sw2.push(v)
        if (sw2.isFull) results.push(sw2.getMin())
      }
      expect(results).toEqual([-1, -3, -3, -3, 3, 3])
    })
  })

  describe('getWindow', () => {
    let sw: SlidingWindowMax

    beforeEach(() => {
      sw = new SlidingWindowMax({ windowSize: 3 })
    })

    it('should return empty array when no elements pushed', () => {
      expect(sw.getWindow()).toEqual([])
    })

    it('should return partial window before full', () => {
      sw.push(1)
      sw.push(2)
      expect(sw.getWindow()).toEqual([1, 2])
    })

    it('should return full window', () => {
      sw.push(1)
      sw.push(2)
      sw.push(3)
      expect(sw.getWindow()).toEqual([1, 2, 3])
    })

    it('should return slid window after exceeding windowSize', () => {
      sw.push(1)
      sw.push(2)
      sw.push(3)
      sw.push(4)
      expect(sw.getWindow()).toEqual([2, 3, 4])
    })

    it('should return a copy that does not affect internal state', () => {
      sw.push(1)
      sw.push(2)
      const arr = sw.getWindow()
      arr.push(99)
      expect(sw.getWindow()).toEqual([1, 2])
    })
  })

  describe('size', () => {
    it('should be 0 initially', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      expect(sw.size).toBe(0)
    })

    it('should increase with each push until window is full', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(1)
      expect(sw.size).toBe(1)
      sw.push(2)
      expect(sw.size).toBe(2)
      sw.push(3)
      expect(sw.size).toBe(3)
    })

    it('should stay at windowSize after window is full', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      sw.push(4)
      expect(sw.size).toBe(3)
    })

    it('should be 0 after clear', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(1)
      sw.push(2)
      sw.clear()
      expect(sw.size).toBe(0)
    })
  })

  describe('isFull', () => {
    it('should be false initially', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      expect(sw.isFull).toBe(false)
    })

    it('should be false with partial window', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(1)
      expect(sw.isFull).toBe(false)
    })

    it('should be true when window is exactly full', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      expect(sw.isFull).toBe(true)
    })

    it('should stay true after window slides', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      sw.push(4)
      expect(sw.isFull).toBe(true)
    })

    it('should be false after clear', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      sw.clear()
      expect(sw.isFull).toBe(false)
    })

    it('should be true immediately for windowSize 1 after one push', () => {
      const sw = new SlidingWindowMax({ windowSize: 1 })
      expect(sw.isFull).toBe(false)
      sw.push(1)
      expect(sw.isFull).toBe(true)
    })
  })

  describe('clear', () => {
    it('should reset size to 0', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      sw.clear()
      expect(sw.size).toBe(0)
    })

    it('should reset isFull to false', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      sw.clear()
      expect(sw.isFull).toBe(false)
    })

    it('should reset max to undefined', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(5)
      sw.clear()
      expect(sw.max()).toBeUndefined()
    })

    it('should reset getMin to undefined', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(5)
      sw.clear()
      expect(sw.getMin()).toBeUndefined()
    })

    it('should reset getWindow to empty array', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(1)
      sw.push(2)
      sw.clear()
      expect(sw.getWindow()).toEqual([])
    })

    it('should be safe to call on empty window', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.clear()
      expect(sw.size).toBe(0)
    })

    it('should be safe to call clear twice', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(1)
      sw.clear()
      sw.clear()
      expect(sw.size).toBe(0)
    })

    it('should allow reuse after clear', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(10)
      sw.push(20)
      sw.clear()
      sw.push(5)
      sw.push(3)
      sw.push(8)
      expect(sw.max()).toBe(8)
      expect(sw.getMin()).toBe(3)
      expect(sw.size).toBe(3)
    })

    it('should preserve pushCount after clear', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(1)
      sw.push(2)
      sw.clear()
      expect(sw.stats().pushCount).toBe(2)
    })
  })

  describe('forEach', () => {
    let sw: SlidingWindowMax

    beforeEach(() => {
      sw = new SlidingWindowMax({ windowSize: 3 })
    })

    it('should iterate over empty window without calling callback', () => {
      const items: number[] = []
      sw.forEach((v) => items.push(v))
      expect(items).toEqual([])
    })

    it('should iterate over partial window', () => {
      sw.push(1)
      sw.push(2)
      const items: number[] = []
      sw.forEach((v) => items.push(v))
      expect(items).toEqual([1, 2])
    })

    it('should iterate over full window', () => {
      sw.push(1)
      sw.push(2)
      sw.push(3)
      const items: number[] = []
      sw.forEach((v) => items.push(v))
      expect(items).toEqual([1, 2, 3])
    })

    it('should provide correct indices', () => {
      sw.push(10)
      sw.push(20)
      sw.push(30)
      const indices: number[] = []
      sw.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('should iterate over slid window', () => {
      sw.push(1)
      sw.push(2)
      sw.push(3)
      sw.push(4)
      const items: number[] = []
      sw.forEach((v) => items.push(v))
      expect(items).toEqual([2, 3, 4])
    })
  })

  describe('toArray', () => {
    let sw: SlidingWindowMax

    beforeEach(() => {
      sw = new SlidingWindowMax({ windowSize: 3 })
    })

    it('should return empty array for empty window', () => {
      expect(sw.toArray()).toEqual([])
    })

    it('should return elements in order', () => {
      sw.push(1)
      sw.push(2)
      sw.push(3)
      expect(sw.toArray()).toEqual([1, 2, 3])
    })

    it('should return a copy', () => {
      sw.push(1)
      sw.push(2)
      const arr = sw.toArray()
      arr.push(99)
      expect(sw.toArray()).toEqual([1, 2])
    })

    it('should return slid window contents', () => {
      sw.push(1)
      sw.push(2)
      sw.push(3)
      sw.push(4)
      expect(sw.toArray()).toEqual([2, 3, 4])
    })
  })

  describe('stats', () => {
    let sw: SlidingWindowMax

    beforeEach(() => {
      sw = new SlidingWindowMax({ windowSize: 3 })
    })

    it('should return correct stats for empty window', () => {
      const s = sw.stats()
      expect(s.windowSize).toBe(3)
      expect(s.currentSize).toBe(0)
      expect(s.currentMax).toBeUndefined()
      expect(s.currentMin).toBeUndefined()
      expect(s.pushCount).toBe(0)
    })

    it('should return correct stats for partial window', () => {
      sw.push(5)
      sw.push(3)
      const s = sw.stats()
      expect(s.windowSize).toBe(3)
      expect(s.currentSize).toBe(2)
      expect(s.currentMax).toBe(5)
      expect(s.currentMin).toBe(3)
      expect(s.pushCount).toBe(2)
    })

    it('should return correct stats for full window', () => {
      sw.push(1)
      sw.push(5)
      sw.push(3)
      const s = sw.stats()
      expect(s.windowSize).toBe(3)
      expect(s.currentSize).toBe(3)
      expect(s.currentMax).toBe(5)
      expect(s.currentMin).toBe(1)
      expect(s.pushCount).toBe(3)
    })

    it('should return correct stats after sliding', () => {
      sw.push(10)
      sw.push(5)
      sw.push(8)
      sw.push(3)
      sw.push(7)
      const s = sw.stats()
      expect(s.windowSize).toBe(3)
      expect(s.currentSize).toBe(3)
      expect(s.currentMax).toBe(8)
      expect(s.currentMin).toBe(3)
      expect(s.pushCount).toBe(5)
    })

    it('should reflect windowSize from constructor', () => {
      const sw2 = new SlidingWindowMax({ windowSize: 10 })
      expect(sw2.stats().windowSize).toBe(10)
    })

    it('should track pushCount correctly through sliding', () => {
      for (let i = 0; i < 100; i++) {
        sw.push(i)
      }
      expect(sw.stats().pushCount).toBe(100)
      expect(sw.stats().currentSize).toBe(3)
    })
  })

  describe('window size 1', () => {
    let sw: SlidingWindowMax

    beforeEach(() => {
      sw = new SlidingWindowMax({ windowSize: 1 })
    })

    it('should report max as the single pushed value', () => {
      sw.push(42)
      expect(sw.max()).toBe(42)
    })

    it('should report min as the single pushed value', () => {
      sw.push(42)
      expect(sw.getMin()).toBe(42)
    })

    it('should always be full after first push', () => {
      sw.push(1)
      expect(sw.isFull).toBe(true)
    })

    it('should replace value on each push', () => {
      sw.push(1)
      sw.push(2)
      sw.push(3)
      expect(sw.getWindow()).toEqual([3])
      expect(sw.max()).toBe(3)
      expect(sw.getMin()).toBe(3)
    })

    it('should maintain size of 1', () => {
      sw.push(1)
      sw.push(2)
      sw.push(3)
      expect(sw.size).toBe(1)
    })

    it('should produce same values as input for max stream', () => {
      const input = [5, 3, 8, 1, 9, 2]
      const results: number[] = []
      for (const v of input) {
        sw.push(v)
        results.push(sw.max()!)
      }
      expect(results).toEqual(input)
    })
  })

  describe('all same values', () => {
    it('should return same value for max and min', () => {
      const sw = new SlidingWindowMax({ windowSize: 5 })
      for (let i = 0; i < 10; i++) {
        sw.push(7)
      }
      expect(sw.max()).toBe(7)
      expect(sw.getMin()).toBe(7)
      expect(sw.size).toBe(5)
    })

    it('should handle sliding with all same values', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      for (let i = 0; i < 5; i++) {
        sw.push(4)
        expect(sw.max()).toBe(4)
        expect(sw.getMin()).toBe(4)
      }
    })
  })

  describe('strictly increasing values', () => {
    it('should track max correctly with windowSize 3', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      const results: number[] = []
      for (let i = 1; i <= 6; i++) {
        sw.push(i)
        if (sw.isFull) results.push(sw.max()!)
      }
      expect(results).toEqual([3, 4, 5, 6])
    })

    it('should track min correctly with windowSize 3', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      const results: number[] = []
      for (let i = 1; i <= 6; i++) {
        sw.push(i)
        if (sw.isFull) results.push(sw.getMin()!)
      }
      expect(results).toEqual([1, 2, 3, 4])
    })
  })

  describe('strictly decreasing values', () => {
    it('should track max correctly with windowSize 3', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      const results: number[] = []
      for (let i = 6; i >= 1; i--) {
        sw.push(i)
        if (sw.isFull) results.push(sw.max()!)
      }
      expect(results).toEqual([6, 5, 4, 3])
    })

    it('should track min correctly with windowSize 3', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      const results: number[] = []
      for (let i = 6; i >= 1; i--) {
        sw.push(i)
        if (sw.isFull) results.push(sw.getMin()!)
      }
      expect(results).toEqual([4, 3, 2, 1])
    })
  })

  describe('negative numbers', () => {
    it('should handle all negative values', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(-5)
      sw.push(-3)
      sw.push(-8)
      expect(sw.max()).toBe(-3)
      expect(sw.getMin()).toBe(-8)
    })

    it('should handle mixed negative and positive', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(-5)
      sw.push(3)
      sw.push(-1)
      expect(sw.max()).toBe(3)
      expect(sw.getMin()).toBe(-5)
    })

    it('should handle sliding with negative numbers', () => {
      const sw = new SlidingWindowMax({ windowSize: 2 })
      sw.push(-5)
      sw.push(-3)
      sw.push(-1)
      sw.push(-7)
      expect(sw.max()).toBe(-1)
      expect(sw.getMin()).toBe(-7)
      expect(sw.getWindow()).toEqual([-1, -7])
    })

    it('should handle zero boundary', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(-1)
      sw.push(0)
      sw.push(1)
      expect(sw.max()).toBe(1)
      expect(sw.getMin()).toBe(-1)
    })
  })

  describe('large windows', () => {
    it('should handle windowSize of 100', () => {
      const sw = new SlidingWindowMax({ windowSize: 100 })
      for (let i = 0; i < 150; i++) {
        sw.push(i)
      }
      expect(sw.size).toBe(100)
      expect(sw.max()).toBe(149)
      expect(sw.getMin()).toBe(50)
    })

    it('should handle many pushes with small window', () => {
      const sw = new SlidingWindowMax({ windowSize: 5 })
      for (let i = 0; i < 1000; i++) {
        sw.push(i % 100)
      }
      expect(sw.size).toBe(5)
      expect(sw.stats().pushCount).toBe(1000)
    })

    it('should handle window equal to number of pushes', () => {
      const sw = new SlidingWindowMax({ windowSize: 50 })
      for (let i = 0; i < 50; i++) {
        sw.push(i)
      }
      expect(sw.isFull).toBe(true)
      expect(sw.max()).toBe(49)
      expect(sw.getMin()).toBe(0)
    })
  })

  describe('integration - sliding window max stream', () => {
    it('should match brute force for random data', () => {
      const arr = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9]
      const k = 4
      const sw = new SlidingWindowMax({ windowSize: k })
      const results: number[] = []
      for (const v of arr) {
        sw.push(v)
        if (sw.isFull) results.push(sw.max()!)
      }
      const bruteForce: number[] = []
      for (let i = 0; i <= arr.length - k; i++) {
        let max = arr[i]!
        for (let j = i + 1; j < i + k; j++) {
          if (arr[j]! > max) max = arr[j]!
        }
        bruteForce.push(max)
      }
      expect(results).toEqual(bruteForce)
    })

    it('should match brute force for min', () => {
      const arr = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9]
      const k = 4
      const sw = new SlidingWindowMax({ windowSize: k })
      const results: number[] = []
      for (const v of arr) {
        sw.push(v)
        if (sw.isFull) results.push(sw.getMin()!)
      }
      const bruteForce: number[] = []
      for (let i = 0; i <= arr.length - k; i++) {
        let min = arr[i]!
        for (let j = i + 1; j < i + k; j++) {
          if (arr[j]! < min) min = arr[j]!
        }
        bruteForce.push(min)
      }
      expect(results).toEqual(bruteForce)
    })

    it('should handle alternating high-low pattern', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(10)
      sw.push(1)
      sw.push(10)
      expect(sw.max()).toBe(10)
      expect(sw.getMin()).toBe(1)
      sw.push(1)
      expect(sw.max()).toBe(10)
      expect(sw.getMin()).toBe(1)
      sw.push(10)
      expect(sw.max()).toBe(10)
      expect(sw.getMin()).toBe(1)
    })

    it('should handle peak at center of window', () => {
      const sw = new SlidingWindowMax({ windowSize: 5 })
      sw.push(1)
      sw.push(2)
      sw.push(100)
      sw.push(2)
      sw.push(1)
      expect(sw.max()).toBe(100)
      expect(sw.getMin()).toBe(1)
    })

    it('should handle peak sliding out', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(1)
      sw.push(100)
      sw.push(1)
      expect(sw.max()).toBe(100)
      sw.push(2)
      expect(sw.max()).toBe(100)
      sw.push(3)
      expect(sw.max()).toBe(3)
    })
  })

  describe('clear and reuse', () => {
    it('should work correctly after clear and reuse', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(10)
      sw.push(20)
      sw.push(30)
      sw.clear()
      sw.push(5)
      sw.push(3)
      expect(sw.max()).toBe(5)
      expect(sw.getMin()).toBe(3)
      expect(sw.size).toBe(2)
    })

    it('should handle multiple clear cycles', () => {
      const sw = new SlidingWindowMax({ windowSize: 2 })
      sw.push(1)
      sw.push(2)
      expect(sw.max()).toBe(2)
      sw.clear()
      sw.push(10)
      sw.push(20)
      expect(sw.max()).toBe(20)
      sw.clear()
      sw.push(-1)
      sw.push(-5)
      expect(sw.max()).toBe(-1)
    })
  })

  describe('edge cases', () => {
    it('should handle push of Infinity', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(1)
      sw.push(Infinity)
      sw.push(3)
      expect(sw.max()).toBe(Infinity)
      expect(sw.getMin()).toBe(1)
    })

    it('should handle push of -Infinity', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(-Infinity)
      sw.push(3)
      sw.push(5)
      expect(sw.max()).toBe(5)
      expect(sw.getMin()).toBe(-Infinity)
    })

    it('should handle very small decimal values', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(0.001)
      sw.push(0.002)
      sw.push(0.0015)
      expect(sw.max()).toBe(0.002)
      expect(sw.getMin()).toBe(0.001)
    })

    it('should handle large values', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(Number.MAX_SAFE_INTEGER)
      sw.push(Number.MIN_SAFE_INTEGER)
      sw.push(0)
      expect(sw.max()).toBe(Number.MAX_SAFE_INTEGER)
      expect(sw.getMin()).toBe(Number.MIN_SAFE_INTEGER)
    })

    it('should handle windowSize 2 correctly', () => {
      const sw = new SlidingWindowMax({ windowSize: 2 })
      sw.push(1)
      expect(sw.isFull).toBe(false)
      sw.push(2)
      expect(sw.isFull).toBe(true)
      expect(sw.max()).toBe(2)
      expect(sw.getMin()).toBe(1)
      sw.push(0)
      expect(sw.max()).toBe(2)
      expect(sw.getMin()).toBe(0)
    })

    it('should handle rapid push and max calls', () => {
      const sw = new SlidingWindowMax({ windowSize: 3 })
      sw.push(5)
      expect(sw.max()).toBe(5)
      sw.push(3)
      expect(sw.max()).toBe(5)
      sw.push(7)
      expect(sw.max()).toBe(7)
      sw.push(1)
      expect(sw.max()).toBe(7)
      sw.push(2)
      expect(sw.max()).toBe(7)
      sw.push(9)
      expect(sw.max()).toBe(9)
    })
  })

  describe('stress tests', () => {
    it('should handle 10000 pushes', () => {
      const sw = new SlidingWindowMax({ windowSize: 100 })
      for (let i = 0; i < 10000; i++) {
        sw.push(i)
      }
      expect(sw.size).toBe(100)
      expect(sw.max()).toBe(9999)
      expect(sw.getMin()).toBe(9900)
    })

    it('should handle 10000 pushes with random values', () => {
      const sw = new SlidingWindowMax({ windowSize: 50 })
      const values: number[] = []
      for (let i = 0; i < 1000; i++) {
        const v = Math.floor(Math.random() * 10000)
        values.push(v)
        sw.push(v)
      }
      const window = sw.getWindow()
      expect(window.length).toBe(50)
      const expectedMax = Math.max(...window)
      const expectedMin = Math.min(...window)
      expect(sw.max()).toBe(expectedMax)
      expect(sw.getMin()).toBe(expectedMin)
    })

    it('should match brute force for 1000 random values', () => {
      const k = 10
      const arr = Array.from({ length: 200 }, () => Math.floor(Math.random() * 1000))
      const sw = new SlidingWindowMax({ windowSize: k })
      const maxResults: number[] = []
      const minResults: number[] = []
      for (const v of arr) {
        sw.push(v)
        if (sw.isFull) {
          maxResults.push(sw.max()!)
          minResults.push(sw.getMin()!)
        }
      }
      for (let i = 0; i < maxResults.length; i++) {
        let max = -Infinity
        let min = Infinity
        for (let j = i; j < i + k; j++) {
          const v = arr[j]!
          if (v > max) max = v
          if (v < min) min = v
        }
        expect(maxResults[i]).toBe(max)
        expect(minResults[i]).toBe(min)
      }
    })

    it('should handle many equal values with occasional spikes', () => {
      const sw = new SlidingWindowMax({ windowSize: 5 })
      for (let i = 0; i < 100; i++) {
        sw.push(i % 20 === 0 ? 100 : 1)
      }
      expect(sw.size).toBe(5)
      expect(sw.stats().pushCount).toBe(100)
    })
  })

  describe('type exports', () => {
    it('should export types from main module', async () => {
      const mod = await import('../../src/core/sliding-window-max/sliding-window-max.js')
      expect(mod.SlidingWindowMax).toBeDefined()
    })
  })
})
