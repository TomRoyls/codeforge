import { describe, it, expect, beforeEach } from 'vitest'
import { DeltaQueue } from '../../src/core/delta-queue/delta-queue.js'
import type { DeltaQueueOptions } from '../../src/core/delta-queue/delta-queue.js'

describe('DeltaQueue', () => {
  describe('constructor', () => {
    it('creates empty queue without capacity', () => {
      const dq = new DeltaQueue()
      expect(dq.size).toBe(0)
      expect(dq.isEmpty()).toBe(true)
    })

    it('creates queue with specified capacity', () => {
      const dq = new DeltaQueue(10)
      expect(dq.size).toBe(0)
    })

    it('accepts capacity of 0', () => {
      const dq = new DeltaQueue(0)
      expect(dq.size).toBe(0)
    })

    it('accepts capacity of 1', () => {
      const dq = new DeltaQueue(1)
      expect(dq.size).toBe(0)
    })

    it('accepts large capacity', () => {
      const dq = new DeltaQueue(1000000)
      expect(dq.size).toBe(0)
    })

    it('accepts undefined capacity', () => {
      const dq = new DeltaQueue(undefined)
      expect(dq.size).toBe(0)
    })

    it('returns empty deltas on new queue', () => {
      const dq = new DeltaQueue()
      expect(dq.deltas).toEqual([])
    })

    it('returns empty toArray on new queue', () => {
      const dq = new DeltaQueue()
      expect(dq.toArray()).toEqual([])
    })
  })

  describe('push', () => {
    it('stores first value as base delta', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      expect(dq.deltas).toEqual([10])
    })

    it('stores subsequent value as delta from previous', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      dq.push(15)
      expect(dq.deltas).toEqual([10, 5])
    })

    it('stores negative delta', () => {
      const dq = new DeltaQueue()
      dq.push(20)
      dq.push(10)
      expect(dq.deltas).toEqual([20, -10])
    })

    it('stores zero delta for same value', () => {
      const dq = new DeltaQueue()
      dq.push(5)
      dq.push(5)
      expect(dq.deltas).toEqual([5, 0])
    })

    it('increments size on each push', () => {
      const dq = new DeltaQueue()
      dq.push(1)
      expect(dq.size).toBe(1)
      dq.push(2)
      expect(dq.size).toBe(2)
      dq.push(3)
      expect(dq.size).toBe(3)
    })

    it('handles floating point values', () => {
      const dq = new DeltaQueue()
      dq.push(1.5)
      dq.push(2.5)
      expect(dq.deltas).toEqual([1.5, 1])
    })

    it('handles negative values', () => {
      const dq = new DeltaQueue()
      dq.push(-10)
      dq.push(-5)
      expect(dq.deltas).toEqual([-10, 5])
    })

    it('handles zero as first value', () => {
      const dq = new DeltaQueue()
      dq.push(0)
      dq.push(5)
      expect(dq.deltas).toEqual([0, 5])
    })

    it('handles long sequence of pushes', () => {
      const dq = new DeltaQueue()
      for (let i = 0; i < 100; i++) {
        dq.push(i)
      }
      expect(dq.size).toBe(100)
      expect(dq.peek()).toBe(99)
    })

    it('pushes alternating positive and negative deltas', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      dq.push(20)
      dq.push(5)
      dq.push(25)
      expect(dq.deltas).toEqual([10, 10, -15, 20])
    })

    it('pushes same value multiple times', () => {
      const dq = new DeltaQueue()
      dq.push(7)
      dq.push(7)
      dq.push(7)
      expect(dq.deltas).toEqual([7, 0, 0])
      expect(dq.toArray()).toEqual([7, 7, 7])
    })

    it('makes isEmpty return false after push', () => {
      const dq = new DeltaQueue()
      dq.push(1)
      expect(dq.isEmpty()).toBe(false)
    })
  })

  describe('pop', () => {
    it('returns undefined on empty queue', () => {
      const dq = new DeltaQueue()
      expect(dq.pop()).toBeUndefined()
    })

    it('returns the last pushed value', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      dq.push(20)
      expect(dq.pop()).toBe(20)
    })

    it('decrements size after pop', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      dq.push(20)
      dq.pop()
      expect(dq.size).toBe(1)
    })

    it('returns first value when only one element', () => {
      const dq = new DeltaQueue()
      dq.push(42)
      expect(dq.pop()).toBe(42)
    })

    it('empties queue after popping last element', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      dq.pop()
      expect(dq.isEmpty()).toBe(true)
    })

    it('pops all elements in LIFO order', () => {
      const dq = new DeltaQueue()
      dq.push(1)
      dq.push(2)
      dq.push(3)
      expect(dq.pop()).toBe(3)
      expect(dq.pop()).toBe(2)
      expect(dq.pop()).toBe(1)
    })

    it('returns undefined after queue is emptied', () => {
      const dq = new DeltaQueue()
      dq.push(1)
      dq.pop()
      expect(dq.pop()).toBeUndefined()
    })

    it('maintains correct deltas after pop', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      dq.push(20)
      dq.push(30)
      dq.pop()
      expect(dq.deltas).toEqual([10, 10])
    })

    it('handles pop followed by push', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      dq.push(20)
      dq.pop()
      dq.push(30)
      expect(dq.deltas).toEqual([10, 20])
      expect(dq.peek()).toBe(30)
    })

    it('handles floating point pop', () => {
      const dq = new DeltaQueue()
      dq.push(1.5)
      dq.push(3.5)
      expect(dq.pop()).toBe(3.5)
    })
  })

  describe('peek', () => {
    it('returns undefined on empty queue', () => {
      const dq = new DeltaQueue()
      expect(dq.peek()).toBeUndefined()
    })

    it('returns the last value without removing', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      dq.push(20)
      expect(dq.peek()).toBe(20)
      expect(dq.size).toBe(2)
    })

    it('returns first value when only one element', () => {
      const dq = new DeltaQueue()
      dq.push(42)
      expect(dq.peek()).toBe(42)
    })

    it('returns updated value after multiple pushes', () => {
      const dq = new DeltaQueue()
      dq.push(1)
      dq.push(2)
      dq.push(3)
      expect(dq.peek()).toBe(3)
    })

    it('returns updated value after pop', () => {
      const dq = new DeltaQueue()
      dq.push(1)
      dq.push(2)
      dq.push(3)
      dq.pop()
      expect(dq.peek()).toBe(2)
    })

    it('returns undefined after clearing', () => {
      const dq = new DeltaQueue()
      dq.push(1)
      dq.clear()
      expect(dq.peek()).toBeUndefined()
    })
  })

  describe('at', () => {
    it('returns value at index 0', () => {
      const dq = DeltaQueue.fromArray([10, 20, 30])
      expect(dq.at(0)).toBe(10)
    })

    it('returns value at last index', () => {
      const dq = DeltaQueue.fromArray([10, 20, 30])
      expect(dq.at(2)).toBe(30)
    })

    it('returns value at middle index', () => {
      const dq = DeltaQueue.fromArray([10, 20, 30])
      expect(dq.at(1)).toBe(20)
    })

    it('throws on negative index', () => {
      const dq = DeltaQueue.fromArray([10, 20])
      expect(() => dq.at(-1)).toThrow(RangeError)
    })

    it('throws on index beyond size', () => {
      const dq = DeltaQueue.fromArray([10, 20])
      expect(() => dq.at(2)).toThrow(RangeError)
    })

    it('throws on empty queue', () => {
      const dq = new DeltaQueue()
      expect(() => dq.at(0)).toThrow(RangeError)
    })

    it('reconstructs correct values with negative deltas', () => {
      const dq = DeltaQueue.fromArray([30, 20, 10])
      expect(dq.at(0)).toBe(30)
      expect(dq.at(1)).toBe(20)
      expect(dq.at(2)).toBe(10)
    })

    it('reconstructs correct values with mixed deltas', () => {
      const dq = DeltaQueue.fromArray([5, 15, 10, 25])
      expect(dq.at(0)).toBe(5)
      expect(dq.at(1)).toBe(15)
      expect(dq.at(2)).toBe(10)
      expect(dq.at(3)).toBe(25)
    })
  })

  describe('deltaAt', () => {
    it('returns base value at index 0', () => {
      const dq = DeltaQueue.fromArray([10, 20, 30])
      expect(dq.deltaAt(0)).toBe(10)
    })

    it('returns delta at index 1', () => {
      const dq = DeltaQueue.fromArray([10, 20, 30])
      expect(dq.deltaAt(1)).toBe(10)
    })

    it('returns negative delta', () => {
      const dq = DeltaQueue.fromArray([30, 20])
      expect(dq.deltaAt(1)).toBe(-10)
    })

    it('returns zero delta for same value', () => {
      const dq = DeltaQueue.fromArray([5, 5])
      expect(dq.deltaAt(1)).toBe(0)
    })

    it('throws on negative index', () => {
      const dq = DeltaQueue.fromArray([10, 20])
      expect(() => dq.deltaAt(-1)).toThrow(RangeError)
    })

    it('throws on index beyond size', () => {
      const dq = DeltaQueue.fromArray([10, 20])
      expect(() => dq.deltaAt(5)).toThrow(RangeError)
    })

    it('returns correct deltas for long sequence', () => {
      const dq = DeltaQueue.fromArray([1, 3, 6, 10, 15])
      expect(dq.deltaAt(0)).toBe(1)
      expect(dq.deltaAt(1)).toBe(2)
      expect(dq.deltaAt(2)).toBe(3)
      expect(dq.deltaAt(3)).toBe(4)
      expect(dq.deltaAt(4)).toBe(5)
    })
  })

  describe('prefixSum', () => {
    it('returns 0 on empty queue', () => {
      const dq = new DeltaQueue()
      expect(dq.prefixSum()).toBe(0)
    })

    it('returns single value as prefix sum', () => {
      const dq = DeltaQueue.fromArray([10])
      expect(dq.prefixSum()).toBe(10)
    })

    it('returns sum of all values when no index given', () => {
      const dq = DeltaQueue.fromArray([10, 20, 30])
      expect(dq.prefixSum()).toBe(60)
    })

    it('returns partial prefix sum with index', () => {
      const dq = DeltaQueue.fromArray([10, 20, 30])
      expect(dq.prefixSum(0)).toBe(10)
      expect(dq.prefixSum(1)).toBe(30)
      expect(dq.prefixSum(2)).toBe(60)
    })

    it('throws on negative index', () => {
      const dq = DeltaQueue.fromArray([10, 20])
      expect(() => dq.prefixSum(-1)).toThrow(RangeError)
    })

    it('throws on index beyond size', () => {
      const dq = DeltaQueue.fromArray([10, 20])
      expect(() => dq.prefixSum(5)).toThrow(RangeError)
    })

    it('handles negative values in prefix sum', () => {
      const dq = DeltaQueue.fromArray([10, -5, 3])
      expect(dq.prefixSum()).toBe(8)
    })

    it('handles all zeros', () => {
      const dq = DeltaQueue.fromArray([0, 0, 0])
      expect(dq.prefixSum()).toBe(0)
    })

    it('handles single element with index 0', () => {
      const dq = DeltaQueue.fromArray([42])
      expect(dq.prefixSum(0)).toBe(42)
    })

    it('uses O(1) cache after first call', () => {
      const dq = DeltaQueue.fromArray([1, 2, 3, 4, 5])
      expect(dq.prefixSum(2)).toBe(6)
      expect(dq.prefixSum(4)).toBe(15)
      expect(dq.prefixSum(0)).toBe(1)
    })
  })

  describe('rangeSum', () => {
    it('returns single element sum', () => {
      const dq = DeltaQueue.fromArray([10, 20, 30])
      expect(dq.rangeSum(0, 0)).toBe(10)
      expect(dq.rangeSum(1, 1)).toBe(20)
      expect(dq.rangeSum(2, 2)).toBe(30)
    })

    it('returns full range sum', () => {
      const dq = DeltaQueue.fromArray([10, 20, 30])
      expect(dq.rangeSum(0, 2)).toBe(60)
    })

    it('returns partial range sum', () => {
      const dq = DeltaQueue.fromArray([10, 20, 30, 40])
      expect(dq.rangeSum(1, 2)).toBe(50)
    })

    it('throws when from is negative', () => {
      const dq = DeltaQueue.fromArray([10, 20])
      expect(() => dq.rangeSum(-1, 1)).toThrow(RangeError)
    })

    it('throws when to exceeds size', () => {
      const dq = DeltaQueue.fromArray([10, 20])
      expect(() => dq.rangeSum(0, 5)).toThrow(RangeError)
    })

    it('throws when from exceeds to', () => {
      const dq = DeltaQueue.fromArray([10, 20])
      expect(() => dq.rangeSum(1, 0)).toThrow(RangeError)
    })

    it('handles range with negative values', () => {
      const dq = DeltaQueue.fromArray([10, -5, 3, -2])
      expect(dq.rangeSum(0, 3)).toBe(6)
      expect(dq.rangeSum(1, 2)).toBe(-2)
    })

    it('handles single element queue', () => {
      const dq = DeltaQueue.fromArray([42])
      expect(dq.rangeSum(0, 0)).toBe(42)
    })

    it('handles range from index 1 to end', () => {
      const dq = DeltaQueue.fromArray([5, 10, 15])
      expect(dq.rangeSum(1, 2)).toBe(25)
    })

    it('handles large range sums', () => {
      const values = Array.from({ length: 100 }, (_, i) => i + 1)
      const dq = DeltaQueue.fromArray(values)
      expect(dq.rangeSum(0, 99)).toBe(5050)
      expect(dq.rangeSum(9, 19)).toBe(165)
    })
  })

  describe('reconstruct', () => {
    it('returns empty array for empty queue', () => {
      const dq = new DeltaQueue()
      expect(dq.reconstruct()).toEqual([])
    })

    it('returns single element array', () => {
      const dq = DeltaQueue.fromArray([42])
      expect(dq.reconstruct()).toEqual([42])
    })

    it('reconstructs all values correctly', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      dq.push(20)
      dq.push(15)
      expect(dq.reconstruct()).toEqual([10, 20, 15])
    })

    it('reconstructs values with negative deltas', () => {
      const dq = DeltaQueue.fromArray([100, 80, 60, 40])
      expect(dq.reconstruct()).toEqual([100, 80, 60, 40])
    })

    it('returns copy of internal data', () => {
      const dq = DeltaQueue.fromArray([1, 2, 3])
      const arr = dq.reconstruct()
      arr.push(4)
      expect(dq.size).toBe(3)
    })
  })

  describe('size and isEmpty', () => {
    it('returns 0 for new queue', () => {
      const dq = new DeltaQueue()
      expect(dq.size).toBe(0)
    })

    it('returns true for isEmpty on new queue', () => {
      const dq = new DeltaQueue()
      expect(dq.isEmpty()).toBe(true)
    })

    it('returns correct size after pushes', () => {
      const dq = new DeltaQueue()
      dq.push(1)
      dq.push(2)
      dq.push(3)
      expect(dq.size).toBe(3)
      expect(dq.isEmpty()).toBe(false)
    })

    it('returns correct size after pops', () => {
      const dq = DeltaQueue.fromArray([1, 2, 3])
      dq.pop()
      expect(dq.size).toBe(2)
    })

    it('returns 0 after clear', () => {
      const dq = DeltaQueue.fromArray([1, 2, 3])
      dq.clear()
      expect(dq.size).toBe(0)
      expect(dq.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears empty queue without error', () => {
      const dq = new DeltaQueue()
      dq.clear()
      expect(dq.size).toBe(0)
    })

    it('clears queue with elements', () => {
      const dq = DeltaQueue.fromArray([1, 2, 3])
      dq.clear()
      expect(dq.size).toBe(0)
      expect(dq.isEmpty()).toBe(true)
    })

    it('allows push after clear', () => {
      const dq = DeltaQueue.fromArray([1, 2])
      dq.clear()
      dq.push(10)
      expect(dq.size).toBe(1)
      expect(dq.peek()).toBe(10)
    })

    it('resets deltas after clear', () => {
      const dq = DeltaQueue.fromArray([10, 20])
      dq.clear()
      expect(dq.deltas).toEqual([])
    })
  })

  describe('min', () => {
    it('returns undefined on empty queue', () => {
      const dq = new DeltaQueue()
      expect(dq.min()).toBeUndefined()
    })

    it('returns single element', () => {
      const dq = DeltaQueue.fromArray([42])
      expect(dq.min()).toBe(42)
    })

    it('returns minimum of multiple values', () => {
      const dq = DeltaQueue.fromArray([30, 10, 20])
      expect(dq.min()).toBe(10)
    })

    it('returns minimum with negative values', () => {
      const dq = DeltaQueue.fromArray([5, -3, 10, -7])
      expect(dq.min()).toBe(-7)
    })

    it('returns minimum when all equal', () => {
      const dq = DeltaQueue.fromArray([5, 5, 5])
      expect(dq.min()).toBe(5)
    })

    it('returns minimum with first value being min', () => {
      const dq = DeltaQueue.fromArray([1, 5, 10])
      expect(dq.min()).toBe(1)
    })

    it('returns minimum with last value being min', () => {
      const dq = DeltaQueue.fromArray([10, 5, 1])
      expect(dq.min()).toBe(1)
    })
  })

  describe('max', () => {
    it('returns undefined on empty queue', () => {
      const dq = new DeltaQueue()
      expect(dq.max()).toBeUndefined()
    })

    it('returns single element', () => {
      const dq = DeltaQueue.fromArray([42])
      expect(dq.max()).toBe(42)
    })

    it('returns maximum of multiple values', () => {
      const dq = DeltaQueue.fromArray([10, 30, 20])
      expect(dq.max()).toBe(30)
    })

    it('returns maximum with negative values', () => {
      const dq = DeltaQueue.fromArray([-5, -3, -10])
      expect(dq.max()).toBe(-3)
    })

    it('returns maximum when all equal', () => {
      const dq = DeltaQueue.fromArray([7, 7, 7])
      expect(dq.max()).toBe(7)
    })

    it('returns maximum with first value being max', () => {
      const dq = DeltaQueue.fromArray([100, 50, 25])
      expect(dq.max()).toBe(100)
    })

    it('returns maximum with last value being max', () => {
      const dq = DeltaQueue.fromArray([25, 50, 100])
      expect(dq.max()).toBe(100)
    })
  })

  describe('mean', () => {
    it('returns undefined on empty queue', () => {
      const dq = new DeltaQueue()
      expect(dq.mean()).toBeUndefined()
    })

    it('returns single element as mean', () => {
      const dq = DeltaQueue.fromArray([42])
      expect(dq.mean()).toBe(42)
    })

    it('returns correct mean for integers', () => {
      const dq = DeltaQueue.fromArray([10, 20, 30])
      expect(dq.mean()).toBe(20)
    })

    it('returns correct mean for non-integer result', () => {
      const dq = DeltaQueue.fromArray([10, 20])
      expect(dq.mean()).toBe(15)
    })

    it('returns correct mean with negative values', () => {
      const dq = DeltaQueue.fromArray([10, -10, 20])
      expect(dq.mean()).toBeCloseTo(6.666, 2)
    })

    it('returns 0 for all zeros', () => {
      const dq = DeltaQueue.fromArray([0, 0, 0, 0])
      expect(dq.mean()).toBe(0)
    })

    it('returns correct mean for single negative value', () => {
      const dq = DeltaQueue.fromArray([-5])
      expect(dq.mean()).toBe(-5)
    })
  })

  describe('deltas', () => {
    it('returns empty array for empty queue', () => {
      const dq = new DeltaQueue()
      expect(dq.deltas).toEqual([])
    })

    it('returns base value for single element', () => {
      const dq = DeltaQueue.fromArray([42])
      expect(dq.deltas).toEqual([42])
    })

    it('returns deltas array for multiple values', () => {
      const dq = DeltaQueue.fromArray([10, 20, 15])
      expect(dq.deltas).toEqual([10, 10, -5])
    })

    it('returns copy of internal array', () => {
      const dq = DeltaQueue.fromArray([1, 2])
      const d = dq.deltas
      d.push(999)
      expect(dq.deltas.length).toBe(2)
    })

    it('returns correct deltas after pop', () => {
      const dq = DeltaQueue.fromArray([10, 20, 30])
      dq.pop()
      expect(dq.deltas).toEqual([10, 10])
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty queue', () => {
      const dq = new DeltaQueue()
      expect(dq.toArray()).toEqual([])
    })

    it('returns all reconstructed values', () => {
      const dq = DeltaQueue.fromArray([5, 10, 7, 12])
      expect(dq.toArray()).toEqual([5, 10, 7, 12])
    })

    it('returns copy not internal reference', () => {
      const dq = DeltaQueue.fromArray([1, 2, 3])
      const arr = dq.toArray()
      arr[0] = 999
      expect(dq.at(0)).toBe(1)
    })
  })

  describe('fromArray', () => {
    it('creates queue from empty array', () => {
      const dq = DeltaQueue.fromArray([])
      expect(dq.size).toBe(0)
      expect(dq.isEmpty()).toBe(true)
    })

    it('creates queue from single element', () => {
      const dq = DeltaQueue.fromArray([42])
      expect(dq.size).toBe(1)
      expect(dq.peek()).toBe(42)
    })

    it('creates queue from multiple elements', () => {
      const dq = DeltaQueue.fromArray([10, 20, 30])
      expect(dq.size).toBe(3)
      expect(dq.toArray()).toEqual([10, 20, 30])
    })

    it('stores correct deltas', () => {
      const dq = DeltaQueue.fromArray([5, 10, 8, 12])
      expect(dq.deltas).toEqual([5, 5, -2, 4])
    })

    it('creates queue with capacity', () => {
      const dq = DeltaQueue.fromArray([1, 2, 3, 4, 5], 3)
      expect(dq.size).toBe(3)
      expect(dq.toArray()).toEqual([3, 4, 5])
    })

    it('preserves negative values', () => {
      const dq = DeltaQueue.fromArray([-5, -10, 0, 5])
      expect(dq.toArray()).toEqual([-5, -10, 0, 5])
    })

    it('preserves floating point values', () => {
      const dq = DeltaQueue.fromArray([1.1, 2.2, 3.3])
      expect(dq.toArray()).toEqual([1.1, 2.2, 3.3])
    })
  })

  describe('compress', () => {
    it('returns empty queue for empty input', () => {
      const dq = new DeltaQueue()
      const compressed = dq.compress()
      expect(compressed.size).toBe(0)
    })

    it('returns same queue for no duplicates', () => {
      const dq = DeltaQueue.fromArray([1, 2, 3, 4])
      const compressed = dq.compress()
      expect(compressed.toArray()).toEqual([1, 2, 3, 4])
    })

    it('removes consecutive duplicates', () => {
      const dq = DeltaQueue.fromArray([5, 5, 5, 10, 10, 3])
      const compressed = dq.compress()
      expect(compressed.toArray()).toEqual([5, 10, 3])
    })

    it('keeps single element unchanged', () => {
      const dq = DeltaQueue.fromArray([42])
      const compressed = dq.compress()
      expect(compressed.toArray()).toEqual([42])
    })

    it('handles all same values', () => {
      const dq = DeltaQueue.fromArray([7, 7, 7, 7, 7])
      const compressed = dq.compress()
      expect(compressed.toArray()).toEqual([7])
    })

    it('preserves original queue', () => {
      const dq = DeltaQueue.fromArray([5, 5, 10])
      dq.compress()
      expect(dq.toArray()).toEqual([5, 5, 10])
    })

    it('handles alternating duplicates', () => {
      const dq = DeltaQueue.fromArray([1, 1, 2, 2, 3, 3])
      const compressed = dq.compress()
      expect(compressed.toArray()).toEqual([1, 2, 3])
    })

    it('compresses to single unique value', () => {
      const dq = DeltaQueue.fromArray([10, 10])
      const compressed = dq.compress()
      expect(compressed.toArray()).toEqual([10])
    })

    it('handles no duplicates at all', () => {
      const dq = DeltaQueue.fromArray([1, 2, 3])
      const compressed = dq.compress()
      expect(compressed.size).toBe(3)
    })

    it('preserves capacity in compressed result', () => {
      const dq = new DeltaQueue(100)
      dq.push(5)
      dq.push(5)
      dq.push(10)
      const compressed = dq.compress()
      expect(compressed.toArray()).toEqual([5, 10])
    })
  })

  describe('capacity', () => {
    it('enforces capacity by dropping oldest', () => {
      const dq = new DeltaQueue(2)
      dq.push(10)
      dq.push(20)
      dq.push(30)
      expect(dq.size).toBe(2)
      expect(dq.toArray()).toEqual([20, 30])
    })

    it('capacity of 1 keeps only latest', () => {
      const dq = new DeltaQueue(1)
      dq.push(10)
      expect(dq.toArray()).toEqual([10])
      dq.push(20)
      expect(dq.toArray()).toEqual([20])
      dq.push(30)
      expect(dq.toArray()).toEqual([30])
    })

    it('capacity of 0 stores nothing', () => {
      const dq = new DeltaQueue(0)
      dq.push(10)
      expect(dq.size).toBe(0)
    })

    it('does not drop when under capacity', () => {
      const dq = new DeltaQueue(5)
      dq.push(1)
      dq.push(2)
      dq.push(3)
      expect(dq.size).toBe(3)
      expect(dq.toArray()).toEqual([1, 2, 3])
    })

    it('maintains correct values after overflow', () => {
      const dq = new DeltaQueue(3)
      dq.push(1)
      dq.push(2)
      dq.push(3)
      dq.push(4)
      expect(dq.toArray()).toEqual([2, 3, 4])
      expect(dq.prefixSum()).toBe(9)
    })

    it('reconstructs correctly after multiple overflows', () => {
      const dq = new DeltaQueue(2)
      dq.push(1)
      dq.push(2)
      dq.push(3)
      dq.push(4)
      dq.push(5)
      expect(dq.toArray()).toEqual([4, 5])
    })

    it('rangeSum works after overflow', () => {
      const dq = new DeltaQueue(3)
      dq.push(10)
      dq.push(20)
      dq.push(30)
      dq.push(40)
      expect(dq.rangeSum(0, 2)).toBe(90)
    })

    it('min and max work after overflow', () => {
      const dq = new DeltaQueue(3)
      dq.push(10)
      dq.push(20)
      dq.push(5)
      dq.push(30)
      expect(dq.min()).toBe(5)
      expect(dq.max()).toBe(30)
    })
  })

  describe('edge cases', () => {
    it('handles push-pop-push cycle', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      dq.pop()
      dq.push(20)
      expect(dq.size).toBe(1)
      expect(dq.peek()).toBe(20)
    })

    it('handles repeated push-pop', () => {
      const dq = new DeltaQueue()
      for (let i = 0; i < 50; i++) {
        dq.push(i)
        dq.pop()
      }
      expect(dq.size).toBe(0)
    })

    it('handles very large values', () => {
      const dq = new DeltaQueue()
      dq.push(Number.MAX_SAFE_INTEGER - 1)
      dq.push(Number.MAX_SAFE_INTEGER)
      expect(dq.at(0)).toBe(Number.MAX_SAFE_INTEGER - 1)
      expect(dq.at(1)).toBe(Number.MAX_SAFE_INTEGER)
    })

    it('handles very small values', () => {
      const dq = new DeltaQueue()
      dq.push(Number.MIN_SAFE_INTEGER + 1)
      dq.push(Number.MIN_SAFE_INTEGER)
      expect(dq.at(0)).toBe(Number.MIN_SAFE_INTEGER + 1)
      expect(dq.at(1)).toBe(Number.MIN_SAFE_INTEGER)
    })

    it('handles DeltaQueueOptions type', () => {
      const options: DeltaQueueOptions = { capacity: 5 }
      const dq = new DeltaQueue(options.capacity)
      expect(dq.size).toBe(0)
    })

    it('at and deltaAt consistent with deltas', () => {
      const dq = DeltaQueue.fromArray([3, 7, 4, 9])
      const d = dq.deltas
      for (let i = 0; i < dq.size; i++) {
        expect(dq.deltaAt(i)).toBe(d[i])
      }
    })

    it('prefixSum equals sum of toArray up to index', () => {
      const dq = DeltaQueue.fromArray([2, 4, 6, 8, 10])
      const arr = dq.toArray()
      for (let i = 0; i < dq.size; i++) {
        let expected = 0
        for (let j = 0; j <= i; j++) {
          expected += arr[j]!
        }
        expect(dq.prefixSum(i)).toBe(expected)
      }
    })

    it('rangeSum equals sum of toArray slice', () => {
      const dq = DeltaQueue.fromArray([1, 3, 5, 7, 9, 11])
      const arr = dq.toArray()
      for (let from = 0; from < dq.size; from++) {
        for (let to = from; to < dq.size; to++) {
          let expected = 0
          for (let j = from; j <= to; j++) {
            expected += arr[j]!
          }
          expect(dq.rangeSum(from, to)).toBe(expected)
        }
      }
    })

    it('mean equals sum divided by size', () => {
      const dq = DeltaQueue.fromArray([10, 20, 30, 40, 50])
      expect(dq.mean()).toBe(dq.prefixSum() / dq.size)
    })

    it('min and max match Math.min/max of toArray', () => {
      const dq = DeltaQueue.fromArray([15, 3, 27, 8, 42, 1])
      expect(dq.min()).toBe(Math.min(...dq.toArray()))
      expect(dq.max()).toBe(Math.max(...dq.toArray()))
    })
  })
})
