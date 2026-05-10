import { describe, it, expect, beforeEach } from 'vitest'
import { DeltaArray } from '../../src/core/delta-array/delta-array.js'
import type { DeltaArrayOptions } from '../../src/core/delta-array/delta-array.js'

describe('DeltaArray', () => {
  describe('constructor', () => {
    it('creates empty array with no arguments', () => {
      const da = new DeltaArray()
      expect(da.length).toBe(0)
      expect(da.toArray()).toEqual([])
    })

    it('creates array with initial values', () => {
      const da = new DeltaArray([10, 20, 30])
      expect(da.length).toBe(3)
      expect(da.toArray()).toEqual([10, 20, 30])
    })

    it('creates empty array with empty initial values', () => {
      const da = new DeltaArray([])
      expect(da.length).toBe(0)
    })

    it('uses default base of 0', () => {
      const da = new DeltaArray([5, 10, 15])
      expect(da.getDeltas()).toEqual([5, 5, 5])
    })

    it('accepts custom base value', () => {
      const da = new DeltaArray([10, 20, 30], { base: 5 })
      expect(da.getDeltas()).toEqual([5, 10, 10])
      expect(da.toArray()).toEqual([10, 20, 30])
    })

    it('accepts base of 0 explicitly', () => {
      const da = new DeltaArray([3, 6, 9], { base: 0 })
      expect(da.getDeltas()).toEqual([3, 3, 3])
    })

    it('accepts negative base', () => {
      const da = new DeltaArray([0, 5, 10], { base: -10 })
      expect(da.getDeltas()).toEqual([10, 5, 5])
      expect(da.toArray()).toEqual([0, 5, 10])
    })

    it('accepts undefined initial values with options', () => {
      const da = new DeltaArray(undefined, { base: 100 })
      expect(da.length).toBe(0)
    })

    it('handles single element', () => {
      const da = new DeltaArray([42])
      expect(da.length).toBe(1)
      expect(da.get(0)).toBe(42)
    })

    it('handles large initial values', () => {
      const vals = [1e15, 1e15 + 1, 1e15 + 2]
      const da = new DeltaArray(vals)
      expect(da.toArray()).toEqual(vals)
    })
  })

  describe('get', () => {
    it('returns value at index', () => {
      const da = new DeltaArray([10, 20, 30, 40, 50])
      expect(da.get(0)).toBe(10)
      expect(da.get(1)).toBe(20)
      expect(da.get(4)).toBe(50)
    })

    it('throws on negative index', () => {
      const da = new DeltaArray([1, 2, 3])
      expect(() => da.get(-1)).toThrow(RangeError)
    })

    it('throws on index equal to length', () => {
      const da = new DeltaArray([1, 2, 3])
      expect(() => da.get(3)).toThrow(RangeError)
    })

    it('throws on index beyond length', () => {
      const da = new DeltaArray([1, 2, 3])
      expect(() => da.get(100)).toThrow(RangeError)
    })

    it('throws on empty array', () => {
      const da = new DeltaArray()
      expect(() => da.get(0)).toThrow(RangeError)
    })

    it('returns correct values with custom base', () => {
      const da = new DeltaArray([5, 10, 15], { base: 5 })
      expect(da.get(0)).toBe(5)
      expect(da.get(1)).toBe(10)
      expect(da.get(2)).toBe(15)
    })

    it('returns correct values after set operations', () => {
      const da = new DeltaArray([10, 20, 30])
      da.set(1, 25)
      expect(da.get(0)).toBe(10)
      expect(da.get(1)).toBe(25)
      expect(da.get(2)).toBe(30)
    })

    it('returns negative values correctly', () => {
      const da = new DeltaArray([-5, -3, -1, 0, 1])
      expect(da.get(0)).toBe(-5)
      expect(da.get(2)).toBe(-1)
      expect(da.get(4)).toBe(1)
    })

    it('returns zero values correctly', () => {
      const da = new DeltaArray([0, 0, 0])
      expect(da.get(0)).toBe(0)
      expect(da.get(1)).toBe(0)
      expect(da.get(2)).toBe(0)
    })
  })

  describe('set', () => {
    it('sets value at index', () => {
      const da = new DeltaArray([10, 20, 30])
      da.set(1, 25)
      expect(da.get(1)).toBe(25)
    })

    it('does not affect other elements', () => {
      const da = new DeltaArray([10, 20, 30, 40])
      da.set(2, 100)
      expect(da.get(0)).toBe(10)
      expect(da.get(1)).toBe(20)
      expect(da.get(2)).toBe(100)
      expect(da.get(3)).toBe(40)
    })

    it('sets first element', () => {
      const da = new DeltaArray([10, 20, 30])
      da.set(0, 5)
      expect(da.get(0)).toBe(5)
      expect(da.get(1)).toBe(20)
      expect(da.get(2)).toBe(30)
    })

    it('sets last element', () => {
      const da = new DeltaArray([10, 20, 30])
      da.set(2, 50)
      expect(da.get(0)).toBe(10)
      expect(da.get(1)).toBe(20)
      expect(da.get(2)).toBe(50)
    })

    it('throws on negative index', () => {
      const da = new DeltaArray([1, 2, 3])
      expect(() => da.set(-1, 5)).toThrow(RangeError)
    })

    it('throws on index beyond length', () => {
      const da = new DeltaArray([1, 2, 3])
      expect(() => da.set(3, 5)).toThrow(RangeError)
    })

    it('handles setting to negative value', () => {
      const da = new DeltaArray([10, 20, 30])
      da.set(1, -5)
      expect(da.get(1)).toBe(-5)
      expect(da.get(2)).toBe(30)
    })

    it('handles setting to zero', () => {
      const da = new DeltaArray([10, 20, 30])
      da.set(1, 0)
      expect(da.get(1)).toBe(0)
    })

    it('handles multiple sequential sets', () => {
      const da = new DeltaArray([1, 2, 3, 4, 5])
      da.set(0, 10)
      da.set(2, 30)
      da.set(4, 50)
      expect(da.toArray()).toEqual([10, 2, 30, 4, 50])
    })

    it('handles setting same value', () => {
      const da = new DeltaArray([10, 20, 30])
      da.set(1, 20)
      expect(da.toArray()).toEqual([10, 20, 30])
    })
  })

  describe('push', () => {
    it('adds element to empty array', () => {
      const da = new DeltaArray()
      da.push(42)
      expect(da.length).toBe(1)
      expect(da.get(0)).toBe(42)
    })

    it('adds element to non-empty array', () => {
      const da = new DeltaArray([10, 20])
      da.push(30)
      expect(da.length).toBe(3)
      expect(da.get(2)).toBe(30)
    })

    it('preserves existing elements', () => {
      const da = new DeltaArray([10, 20, 30])
      da.push(40)
      expect(da.toArray()).toEqual([10, 20, 30, 40])
    })

    it('pushes negative value', () => {
      const da = new DeltaArray([10])
      da.push(-5)
      expect(da.get(1)).toBe(-5)
    })

    it('pushes zero value', () => {
      const da = new DeltaArray([10])
      da.push(0)
      expect(da.get(1)).toBe(0)
    })

    it('pushes with custom base', () => {
      const da = new DeltaArray([15], { base: 10 })
      da.push(20)
      expect(da.toArray()).toEqual([15, 20])
    })

    it('pushes to empty array with custom base', () => {
      const da = new DeltaArray(undefined, { base: 100 })
      da.push(110)
      expect(da.getDeltas()).toEqual([10])
      expect(da.get(0)).toBe(110)
    })

    it('handles many pushes', () => {
      const da = new DeltaArray()
      for (let i = 0; i < 100; i++) {
        da.push(i * 2)
      }
      expect(da.length).toBe(100)
      expect(da.get(99)).toBe(198)
    })
  })

  describe('pop', () => {
    it('returns undefined on empty array', () => {
      const da = new DeltaArray()
      expect(da.pop()).toBeUndefined()
    })

    it('returns last element', () => {
      const da = new DeltaArray([10, 20, 30])
      expect(da.pop()).toBe(30)
    })

    it('removes last element', () => {
      const da = new DeltaArray([10, 20, 30])
      da.pop()
      expect(da.length).toBe(2)
      expect(da.toArray()).toEqual([10, 20])
    })

    it('pops all elements', () => {
      const da = new DeltaArray([1, 2])
      expect(da.pop()).toBe(2)
      expect(da.pop()).toBe(1)
      expect(da.pop()).toBeUndefined()
      expect(da.length).toBe(0)
    })

    it('pops from single element array', () => {
      const da = new DeltaArray([42])
      expect(da.pop()).toBe(42)
      expect(da.length).toBe(0)
    })

    it('preserves remaining elements after pop', () => {
      const da = new DeltaArray([10, 20, 30, 40, 50])
      da.pop()
      da.pop()
      expect(da.toArray()).toEqual([10, 20, 30])
    })

    it('allows push after pop', () => {
      const da = new DeltaArray([10, 20])
      da.pop()
      da.push(25)
      expect(da.toArray()).toEqual([10, 25])
    })

    it('returns correct values after set and pop', () => {
      const da = new DeltaArray([10, 20, 30])
      da.set(2, 99)
      expect(da.pop()).toBe(99)
      expect(da.toArray()).toEqual([10, 20])
    })
  })

  describe('length', () => {
    it('returns 0 for empty array', () => {
      const da = new DeltaArray()
      expect(da.length).toBe(0)
    })

    it('returns correct length after init', () => {
      const da = new DeltaArray([1, 2, 3, 4, 5])
      expect(da.length).toBe(5)
    })

    it('updates after push', () => {
      const da = new DeltaArray()
      da.push(1)
      expect(da.length).toBe(1)
      da.push(2)
      expect(da.length).toBe(2)
    })

    it('updates after pop', () => {
      const da = new DeltaArray([1, 2, 3])
      da.pop()
      expect(da.length).toBe(2)
    })

    it('updates after clear', () => {
      const da = new DeltaArray([1, 2, 3])
      da.clear()
      expect(da.length).toBe(0)
    })
  })

  describe('clear', () => {
    it('clears empty array without error', () => {
      const da = new DeltaArray()
      da.clear()
      expect(da.length).toBe(0)
    })

    it('clears non-empty array', () => {
      const da = new DeltaArray([1, 2, 3])
      da.clear()
      expect(da.length).toBe(0)
      expect(da.toArray()).toEqual([])
    })

    it('allows operations after clear', () => {
      const da = new DeltaArray([1, 2, 3])
      da.clear()
      da.push(10)
      expect(da.length).toBe(1)
      expect(da.get(0)).toBe(10)
    })

    it('does not affect base', () => {
      const da = new DeltaArray([10, 20], { base: 5 })
      da.clear()
      da.push(15)
      expect(da.getDeltas()).toEqual([10])
    })

    it('allows multiple clears', () => {
      const da = new DeltaArray([1, 2, 3])
      da.clear()
      da.clear()
      expect(da.length).toBe(0)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty DeltaArray', () => {
      const da = new DeltaArray()
      expect(da.toArray()).toEqual([])
    })

    it('returns copy of values', () => {
      const da = new DeltaArray([1, 2, 3])
      const arr = da.toArray()
      expect(arr).toEqual([1, 2, 3])
      arr[0] = 999
      expect(da.get(0)).toBe(1)
    })

    it('reflects set operations', () => {
      const da = new DeltaArray([10, 20, 30])
      da.set(1, 25)
      expect(da.toArray()).toEqual([10, 25, 30])
    })

    it('reflects push operations', () => {
      const da = new DeltaArray([1, 2])
      da.push(3)
      expect(da.toArray()).toEqual([1, 2, 3])
    })

    it('reflects pop operations', () => {
      const da = new DeltaArray([1, 2, 3])
      da.pop()
      expect(da.toArray()).toEqual([1, 2])
    })

    it('works with negative values', () => {
      const da = new DeltaArray([-5, -3, -1, 0, 1])
      expect(da.toArray()).toEqual([-5, -3, -1, 0, 1])
    })

    it('works with large values', () => {
      const da = new DeltaArray([Number.MAX_SAFE_INTEGER - 2, Number.MAX_SAFE_INTEGER - 1, Number.MAX_SAFE_INTEGER])
      const arr = da.toArray()
      expect(arr[0]).toBe(Number.MAX_SAFE_INTEGER - 2)
      expect(arr[2]).toBe(Number.MAX_SAFE_INTEGER)
    })

    it('works with custom base', () => {
      const da = new DeltaArray([10, 20], { base: 5 })
      expect(da.toArray()).toEqual([10, 20])
    })
  })

  describe('getDeltas', () => {
    it('returns empty deltas for empty array', () => {
      const da = new DeltaArray()
      expect(da.getDeltas()).toEqual([])
    })

    it('returns correct deltas for constant sequence', () => {
      const da = new DeltaArray([5, 10, 15, 20])
      expect(da.getDeltas()).toEqual([5, 5, 5, 5])
    })

    it('returns correct deltas for varying sequence', () => {
      const da = new DeltaArray([10, 7, 12, 5])
      expect(da.getDeltas()).toEqual([10, -3, 5, -7])
    })

    it('returns copy of deltas', () => {
      const da = new DeltaArray([1, 2, 3])
      const deltas = da.getDeltas()
      deltas[0] = 999
      expect(da.getDelta(0)).toBe(1)
    })

    it('reflects set operations on deltas', () => {
      const da = new DeltaArray([10, 20, 30])
      da.set(1, 25)
      const deltas = da.getDeltas()
      expect(deltas[0]).toBe(10)
      expect(deltas[1]).toBe(15)
      expect(deltas[2]).toBe(5)
    })

    it('works with custom base', () => {
      const da = new DeltaArray([10, 20], { base: 5 })
      expect(da.getDeltas()).toEqual([5, 10])
    })

    it('works with negative base', () => {
      const da = new DeltaArray([0, 5], { base: -5 })
      expect(da.getDeltas()).toEqual([5, 5])
    })

    it('handles single element', () => {
      const da = new DeltaArray([42])
      expect(da.getDeltas()).toEqual([42])
    })
  })

  describe('getDelta', () => {
    it('returns delta at index', () => {
      const da = new DeltaArray([10, 7, 12])
      expect(da.getDelta(0)).toBe(10)
      expect(da.getDelta(1)).toBe(-3)
      expect(da.getDelta(2)).toBe(5)
    })

    it('throws on negative index', () => {
      const da = new DeltaArray([1, 2, 3])
      expect(() => da.getDelta(-1)).toThrow(RangeError)
    })

    it('throws on index beyond length', () => {
      const da = new DeltaArray([1, 2, 3])
      expect(() => da.getDelta(3)).toThrow(RangeError)
    })

    it('throws on empty array', () => {
      const da = new DeltaArray()
      expect(() => da.getDelta(0)).toThrow(RangeError)
    })

    it('returns delta with custom base', () => {
      const da = new DeltaArray([15], { base: 10 })
      expect(da.getDelta(0)).toBe(5)
    })

    it('returns zero delta for same consecutive values', () => {
      const da = new DeltaArray([5, 5, 5])
      expect(da.getDelta(0)).toBe(5)
      expect(da.getDelta(1)).toBe(0)
      expect(da.getDelta(2)).toBe(0)
    })

    it('returns correct delta after set', () => {
      const da = new DeltaArray([10, 20, 30])
      da.set(1, 25)
      expect(da.getDelta(0)).toBe(10)
      expect(da.getDelta(1)).toBe(15)
      expect(da.getDelta(2)).toBe(5)
    })

    it('returns correct delta after push', () => {
      const da = new DeltaArray([10, 20])
      da.push(35)
      expect(da.getDelta(2)).toBe(15)
    })
  })

  describe('getPrefixSum', () => {
    it('returns prefix sum at index', () => {
      const da = new DeltaArray([10, 20, 30])
      expect(da.getPrefixSum(0)).toBe(10)
      expect(da.getPrefixSum(1)).toBe(20)
      expect(da.getPrefixSum(2)).toBe(30)
    })

    it('returns prefix sum with custom base', () => {
      const da = new DeltaArray([15, 25], { base: 10 })
      expect(da.getPrefixSum(0)).toBe(5)
      expect(da.getPrefixSum(1)).toBe(15)
    })

    it('throws on negative index', () => {
      const da = new DeltaArray([1, 2, 3])
      expect(() => da.getPrefixSum(-1)).toThrow(RangeError)
    })

    it('throws on index beyond length', () => {
      const da = new DeltaArray([1, 2, 3])
      expect(() => da.getPrefixSum(3)).toThrow(RangeError)
    })

    it('throws on empty array', () => {
      const da = new DeltaArray()
      expect(() => da.getPrefixSum(0)).toThrow(RangeError)
    })

    it('works with decreasing values', () => {
      const da = new DeltaArray([30, 20, 10])
      expect(da.getPrefixSum(0)).toBe(30)
      expect(da.getPrefixSum(1)).toBe(20)
      expect(da.getPrefixSum(2)).toBe(10)
    })

    it('works after set', () => {
      const da = new DeltaArray([10, 20, 30])
      da.set(1, 25)
      expect(da.getPrefixSum(0)).toBe(10)
      expect(da.getPrefixSum(1)).toBe(25)
      expect(da.getPrefixSum(2)).toBe(30)
    })

    it('works with negative values', () => {
      const da = new DeltaArray([-5, -3, 1])
      expect(da.getPrefixSum(0)).toBe(-5)
      expect(da.getPrefixSum(1)).toBe(-3)
      expect(da.getPrefixSum(2)).toBe(1)
    })
  })

  describe('compress', () => {
    it('does nothing on empty array', () => {
      const da = new DeltaArray()
      da.compress()
      expect(da.length).toBe(0)
      expect(da.toArray()).toEqual([])
    })

    it('reduces delta magnitudes for constant sequence', () => {
      const da = new DeltaArray([100, 101, 102, 103])
      const beforeMaxDelta = Math.max(...da.getDeltas().map(Math.abs))
      da.compress()
      const afterMaxDelta = Math.max(...da.getDeltas().map(Math.abs))
      expect(afterMaxDelta).toBeLessThanOrEqual(beforeMaxDelta)
    })

    it('preserves values after compress', () => {
      const da = new DeltaArray([10, 20, 30, 40, 50])
      const original = da.toArray()
      da.compress()
      expect(da.toArray()).toEqual(original)
    })

    it('preserves values after compress with custom base', () => {
      const da = new DeltaArray([10, 20, 30], { base: 5 })
      const original = da.toArray()
      da.compress()
      expect(da.toArray()).toEqual(original)
    })

    it('reduces first delta magnitude', () => {
      const da = new DeltaArray([100, 101, 102])
      const beforeFirst = Math.abs(da.getDelta(0))
      da.compress()
      const afterFirst = Math.abs(da.getDelta(0))
      expect(afterFirst).toBeLessThanOrEqual(beforeFirst)
    })

    it('works with single element', () => {
      const da = new DeltaArray([42])
      da.compress()
      expect(da.toArray()).toEqual([42])
      expect(da.length).toBe(1)
    })

    it('works after set operations', () => {
      const da = new DeltaArray([10, 20, 30])
      da.set(0, 100)
      da.compress()
      expect(da.toArray()).toEqual([100, 20, 30])
    })

    it('works with negative values', () => {
      const da = new DeltaArray([-100, -50, 0, 50, 100])
      const original = da.toArray()
      da.compress()
      expect(da.toArray()).toEqual(original)
    })
  })

  describe('slice', () => {
    it('returns sliced DeltaArray', () => {
      const da = new DeltaArray([10, 20, 30, 40, 50])
      const sliced = da.slice(1, 4)
      expect(sliced.toArray()).toEqual([20, 30, 40])
    })

    it('returns sliced from start index to end', () => {
      const da = new DeltaArray([10, 20, 30, 40, 50])
      const sliced = da.slice(2)
      expect(sliced.toArray()).toEqual([30, 40, 50])
    })

    it('returns full copy with no arguments', () => {
      const da = new DeltaArray([10, 20, 30])
      const sliced = da.slice(0)
      expect(sliced.toArray()).toEqual([10, 20, 30])
    })

    it('returns empty slice for out of range', () => {
      const da = new DeltaArray([10, 20, 30])
      const sliced = da.slice(5, 10)
      expect(sliced.toArray()).toEqual([])
      expect(sliced.length).toBe(0)
    })

    it('preserves base in sliced array', () => {
      const da = new DeltaArray([10, 20, 30], { base: 5 })
      const sliced = da.slice(1, 3)
      expect(sliced.getDeltas()).toEqual([15, 10])
    })

    it('slice does not affect original', () => {
      const da = new DeltaArray([10, 20, 30])
      const sliced = da.slice(0, 2)
      sliced.set(0, 999)
      expect(da.get(0)).toBe(10)
    })

    it('handles negative-like slice ranges gracefully', () => {
      const da = new DeltaArray([10, 20, 30])
      const sliced = da.slice(0, 3)
      expect(sliced.toArray()).toEqual([10, 20, 30])
    })

    it('handles single element slice', () => {
      const da = new DeltaArray([10, 20, 30])
      const sliced = da.slice(1, 2)
      expect(sliced.toArray()).toEqual([20])
      expect(sliced.length).toBe(1)
    })
  })

  describe('map', () => {
    it('maps values with function', () => {
      const da = new DeltaArray([1, 2, 3])
      const mapped = da.map((v) => v * 2)
      expect(mapped.toArray()).toEqual([2, 4, 6])
    })

    it('provides index to callback', () => {
      const da = new DeltaArray([10, 20, 30])
      const mapped = da.map((v, i) => v + i)
      expect(mapped.toArray()).toEqual([10, 21, 32])
    })

    it('returns new DeltaArray', () => {
      const da = new DeltaArray([1, 2, 3])
      const mapped = da.map((v) => v + 1)
      expect(mapped).toBeInstanceOf(DeltaArray)
      expect(mapped).not.toBe(da)
    })

    it('does not modify original', () => {
      const da = new DeltaArray([1, 2, 3])
      da.map((v) => v * 10)
      expect(da.toArray()).toEqual([1, 2, 3])
    })

    it('handles empty array', () => {
      const da = new DeltaArray()
      const mapped = da.map((v) => v * 2)
      expect(mapped.toArray()).toEqual([])
    })

    it('handles negative mapping', () => {
      const da = new DeltaArray([1, -2, 3])
      const mapped = da.map((v) => -v)
      expect(mapped.toArray()).toEqual([-1, 2, -3])
    })
  })

  describe('forEach', () => {
    it('iterates over all values', () => {
      const da = new DeltaArray([10, 20, 30])
      const collected: number[] = []
      da.forEach((v) => collected.push(v))
      expect(collected).toEqual([10, 20, 30])
    })

    it('provides index to callback', () => {
      const da = new DeltaArray([10, 20, 30])
      const indices: number[] = []
      da.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('does nothing on empty array', () => {
      const da = new DeltaArray()
      let count = 0
      da.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('iterates in order', () => {
      const da = new DeltaArray([5, 3, 1])
      const order: number[] = []
      da.forEach((v) => order.push(v))
      expect(order).toEqual([5, 3, 1])
    })

    it('iterates after set', () => {
      const da = new DeltaArray([10, 20, 30])
      da.set(1, 25)
      const collected: number[] = []
      da.forEach((v) => collected.push(v))
      expect(collected).toEqual([10, 25, 30])
    })
  })

  describe('reduce', () => {
    it('sums all values', () => {
      const da = new DeltaArray([1, 2, 3, 4, 5])
      const sum = da.reduce((acc, v) => acc + v, 0)
      expect(sum).toBe(15)
    })

    it('provides index to callback', () => {
      const da = new DeltaArray([10, 20, 30])
      const result = da.reduce((acc, _v, i) => acc + i, 0)
      expect(result).toBe(3)
    })

    it('returns initial value for empty array', () => {
      const da = new DeltaArray()
      const result = da.reduce((acc, v) => acc + v, 42)
      expect(result).toBe(42)
    })

    it('finds maximum', () => {
      const da = new DeltaArray([3, 7, 2, 9, 4])
      const max = da.reduce((acc, v) => Math.max(acc, v), -Infinity)
      expect(max).toBe(9)
    })

    it('concatenates values as strings', () => {
      const da = new DeltaArray([1, 2, 3])
      const result = da.reduce((acc, v, _i) => acc + String(v), '')
      expect(result).toBe('123')
    })

    it('works after set operations', () => {
      const da = new DeltaArray([10, 20, 30])
      da.set(1, 25)
      const sum = da.reduce((acc, v) => acc + v, 0)
      expect(sum).toBe(65)
    })
  })

  describe('empty array operations', () => {
    it('toArray returns empty', () => {
      const da = new DeltaArray()
      expect(da.toArray()).toEqual([])
    })

    it('getDeltas returns empty', () => {
      const da = new DeltaArray()
      expect(da.getDeltas()).toEqual([])
    })

    it('pop returns undefined', () => {
      const da = new DeltaArray()
      expect(da.pop()).toBeUndefined()
    })

    it('length is 0', () => {
      const da = new DeltaArray()
      expect(da.length).toBe(0)
    })

    it('forEach does nothing', () => {
      const da = new DeltaArray()
      let count = 0
      da.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('reduce returns initial', () => {
      const da = new DeltaArray()
      expect(da.reduce((a, b) => a + b, 0)).toBe(0)
    })

    it('map returns empty', () => {
      const da = new DeltaArray()
      expect(da.map((v) => v).toArray()).toEqual([])
    })

    it('clear does nothing', () => {
      const da = new DeltaArray()
      da.clear()
      expect(da.length).toBe(0)
    })

    it('compress does nothing', () => {
      const da = new DeltaArray()
      da.compress()
      expect(da.length).toBe(0)
    })
  })

  describe('single element', () => {
    it('stores and retrieves single element', () => {
      const da = new DeltaArray([42])
      expect(da.get(0)).toBe(42)
      expect(da.length).toBe(1)
    })

    it('sets single element', () => {
      const da = new DeltaArray([42])
      da.set(0, 99)
      expect(da.get(0)).toBe(99)
    })

    it('pops single element', () => {
      const da = new DeltaArray([42])
      expect(da.pop()).toBe(42)
      expect(da.length).toBe(0)
    })

    it('pushes to single element', () => {
      const da = new DeltaArray([10])
      da.push(20)
      expect(da.toArray()).toEqual([10, 20])
    })

    it('compresses single element', () => {
      const da = new DeltaArray([42])
      da.compress()
      expect(da.get(0)).toBe(42)
    })

    it('slices single element', () => {
      const da = new DeltaArray([10, 20, 30])
      const sliced = da.slice(1, 2)
      expect(sliced.toArray()).toEqual([20])
      expect(sliced.length).toBe(1)
    })

    it('maps single element', () => {
      const da = new DeltaArray([5])
      const mapped = da.map((v) => v * 3)
      expect(mapped.toArray()).toEqual([15])
    })

    it('reduces single element', () => {
      const da = new DeltaArray([5])
      expect(da.reduce((acc, v) => acc + v, 0)).toBe(5)
    })

    it('forEach on single element', () => {
      const da = new DeltaArray([7])
      let value = 0
      da.forEach((v) => { value = v })
      expect(value).toBe(7)
    })
  })

  describe('large scale operations', () => {
    it('handles 10000 elements', () => {
      const vals = Array.from({ length: 10000 }, (_, i) => i)
      const da = new DeltaArray(vals)
      expect(da.length).toBe(10000)
      expect(da.get(0)).toBe(0)
      expect(da.get(9999)).toBe(9999)
    })

    it('handles 10000 pushes', () => {
      const da = new DeltaArray()
      for (let i = 0; i < 10000; i++) {
        da.push(i)
      }
      expect(da.length).toBe(10000)
      expect(da.toArray()[9999]).toBe(9999)
    })

    it('handles 10000 element toArray', () => {
      const vals = Array.from({ length: 10000 }, (_, i) => i * 2)
      const da = new DeltaArray(vals)
      const arr = da.toArray()
      expect(arr.length).toBe(10000)
      expect(arr[0]).toBe(0)
      expect(arr[5000]).toBe(10000)
    })

    it('handles getDeltas on 10000 elements', () => {
      const vals = Array.from({ length: 10000 }, (_, i) => i)
      const da = new DeltaArray(vals)
      const deltas = da.getDeltas()
      expect(deltas.length).toBe(10000)
      expect(deltas[0]).toBe(0)
      expect(deltas[1]).toBe(1)
    })

    it('handles reduce on 10000 elements', () => {
      const vals = Array.from({ length: 10000 }, (_, i) => i)
      const da = new DeltaArray(vals)
      const sum = da.reduce((acc, v) => acc + v, 0)
      expect(sum).toBe(49995000)
    })

    it('handles set on large array', () => {
      const vals = Array.from({ length: 10000 }, (_, i) => i)
      const da = new DeltaArray(vals)
      da.set(5000, 999)
      expect(da.get(5000)).toBe(999)
      expect(da.get(5001)).toBe(5001)
    })

    it('handles forEach on 10000 elements', () => {
      const da = new DeltaArray(Array.from({ length: 10000 }, (_, i) => i))
      let count = 0
      da.forEach(() => count++)
      expect(count).toBe(10000)
    })

    it('handles map on large array', () => {
      const da = new DeltaArray(Array.from({ length: 1000 }, (_, i) => i))
      const mapped = da.map((v) => v * 2)
      expect(mapped.length).toBe(1000)
      expect(mapped.get(999)).toBe(1998)
    })
  })

  describe('negative values', () => {
    it('stores negative values', () => {
      const da = new DeltaArray([-10, -20, -30])
      expect(da.toArray()).toEqual([-10, -20, -30])
    })

    it('stores mixed positive and negative', () => {
      const da = new DeltaArray([-5, 0, 5, -3, 10])
      expect(da.toArray()).toEqual([-5, 0, 5, -3, 10])
    })

    it('pushes negative values', () => {
      const da = new DeltaArray()
      da.push(-10)
      da.push(-5)
      da.push(0)
      expect(da.toArray()).toEqual([-10, -5, 0])
    })

    it('sets to negative values', () => {
      const da = new DeltaArray([10, 20, 30])
      da.set(1, -100)
      expect(da.get(1)).toBe(-100)
      expect(da.get(2)).toBe(30)
    })

    it('handles negative deltas correctly', () => {
      const da = new DeltaArray([100, 50, 0, -50])
      expect(da.getDeltas()).toEqual([100, -50, -50, -50])
    })

    it('handles all zeros', () => {
      const da = new DeltaArray([0, 0, 0, 0])
      expect(da.getDeltas()).toEqual([0, 0, 0, 0])
      expect(da.toArray()).toEqual([0, 0, 0, 0])
    })

    it('handles negative base', () => {
      const da = new DeltaArray([0, 10], { base: -100 })
      expect(da.getDeltas()).toEqual([100, 10])
      expect(da.toArray()).toEqual([0, 10])
    })
  })

  describe('large values', () => {
    it('handles Number.MAX_SAFE_INTEGER', () => {
      const da = new DeltaArray([Number.MAX_SAFE_INTEGER])
      expect(da.get(0)).toBe(Number.MAX_SAFE_INTEGER)
    })

    it('handles Number.MIN_SAFE_INTEGER', () => {
      const da = new DeltaArray([Number.MIN_SAFE_INTEGER])
      expect(da.get(0)).toBe(Number.MIN_SAFE_INTEGER)
    })

    it('handles very small fractional deltas', () => {
      const da = new DeltaArray([0, 0.001, 0.002, 0.003])
      expect(da.get(1)).toBeCloseTo(0.001)
      expect(da.get(3)).toBeCloseTo(0.003)
    })

    it('handles large base with small values', () => {
      const da = new DeltaArray([1, 2, 3], { base: 1e15 })
      expect(da.toArray()).toEqual([1, 2, 3])
    })

    it('handles alternating large and small values', () => {
      const da = new DeltaArray([1e15, 1, 1e15, 1])
      expect(da.toArray()).toEqual([1e15, 1, 1e15, 1])
    })
  })

  describe('base value customization', () => {
    it('base affects delta encoding but not values', () => {
      const da1 = new DeltaArray([10, 20, 30], { base: 0 })
      const da2 = new DeltaArray([10, 20, 30], { base: 10 })
      expect(da1.toArray()).toEqual(da2.toArray())
      expect(da1.getDeltas()).not.toEqual(da2.getDeltas())
    })

    it('base of 0 is default', () => {
      const da1 = new DeltaArray([10, 20])
      const da2 = new DeltaArray([10, 20], { base: 0 })
      expect(da1.getDeltas()).toEqual(da2.getDeltas())
    })

    it('large positive base', () => {
      const da = new DeltaArray([100, 200], { base: 1e10 })
      expect(da.getDeltas()).toEqual([100 - 1e10, 100])
      expect(da.toArray()).toEqual([100, 200])
    })

    it('base persists through operations', () => {
      const da = new DeltaArray([10], { base: 5 })
      da.push(20)
      expect(da.getDelta(0)).toBe(5)
      expect(da.getDelta(1)).toBe(10)
    })

    it('compress updates base', () => {
      const da = new DeltaArray([100, 200, 300], { base: 0 })
      da.compress()
      expect(da.toArray()).toEqual([100, 200, 300])
    })
  })

  describe('delta encoding correctness', () => {
    it('values[i] = base + sum(deltas[0..i])', () => {
      const da = new DeltaArray([10, 20, 30, 40, 50], { base: 5 })
      const deltas = da.getDeltas()
      let running = 5
      for (let i = 0; i < deltas.length; i++) {
        running += deltas[i]!
        expect(running).toBe(da.get(i))
      }
    })

    it('correct deltas after push', () => {
      const da = new DeltaArray()
      da.push(10)
      da.push(15)
      da.push(25)
      expect(da.getDeltas()).toEqual([10, 5, 10])
    })

    it('correct deltas after set', () => {
      const da = new DeltaArray([10, 20, 30])
      da.set(1, 25)
      const deltas = da.getDeltas()
      expect(deltas[0] + 0).toBe(10)
      let sum = deltas[0]!
      expect(sum).toBe(10)
      sum += deltas[1]!
      expect(sum).toBe(25)
      sum += deltas[2]!
      expect(sum).toBe(30)
    })

    it('correct deltas after pop', () => {
      const da = new DeltaArray([10, 20, 30, 40])
      da.pop()
      const deltas = da.getDeltas()
      let sum = 0
      for (const d of deltas) sum += d
      expect(sum).toBe(30)
    })

    it('prefix sum equals sum of deltas', () => {
      const da = new DeltaArray([3, 7, 2, 9])
      const deltas = da.getDeltas()
      for (let i = 0; i < da.length; i++) {
        let manualSum = 0
        for (let j = 0; j <= i; j++) manualSum += deltas[j]!
        expect(da.getPrefixSum(i)).toBe(manualSum)
      }
    })

    it('getPrefixSum plus base equals get', () => {
      const da = new DeltaArray([10, 20, 30], { base: 5 })
      for (let i = 0; i < da.length; i++) {
        expect(da.get(i)).toBe(5 + da.getPrefixSum(i))
      }
    })
  })
})
