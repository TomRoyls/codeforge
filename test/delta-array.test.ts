import { DeltaArray } from '../src/core/delta-array/delta-array.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('DeltaArray', () => {
  describe('constructor', () => {
    it('creates an empty array with no arguments', () => {
      const da = new DeltaArray()
      expect(da.length).toBe(0)
    })

    it('creates an empty array with empty initialValues', () => {
      const da = new DeltaArray([])
      expect(da.length).toBe(0)
    })

    it('creates an array from initialValues', () => {
      const da = new DeltaArray([10, 20, 30])
      expect(da.length).toBe(3)
      expect(da.toArray()).toEqual([10, 20, 30])
    })

    it('creates an array with custom base', () => {
      const da = new DeltaArray([10, 20, 30], { base: 5 })
      expect(da.toArray()).toEqual([10, 20, 30])
    })

    it('creates an array with base 0 by default', () => {
      const da = new DeltaArray([5, 10, 15])
      expect(da.toArray()).toEqual([5, 10, 15])
    })

    it('creates from a single-element array', () => {
      const da = new DeltaArray([42])
      expect(da.length).toBe(1)
      expect(da.get(0)).toBe(42)
    })

    it('creates with negative values', () => {
      const da = new DeltaArray([-5, -3, -1])
      expect(da.toArray()).toEqual([-5, -3, -1])
    })

    it('creates with mixed positive and negative values', () => {
      const da = new DeltaArray([10, -5, 20, -3])
      expect(da.toArray()).toEqual([10, -5, 20, -3])
    })

    it('creates with duplicate values', () => {
      const da = new DeltaArray([5, 5, 5])
      expect(da.toArray()).toEqual([5, 5, 5])
    })

    it('creates with decreasing values', () => {
      const da = new DeltaArray([30, 20, 10])
      expect(da.toArray()).toEqual([30, 20, 10])
    })

    it('creates with floating-point values', () => {
      const da = new DeltaArray([1.5, 2.7, 3.9])
      expect(da.toArray()).toEqual([1.5, 2.7, 3.9])
    })

    it('creates with custom base and initialValues', () => {
      const da = new DeltaArray([100, 200, 300], { base: 50 })
      expect(da.get(0)).toBe(100)
      expect(da.get(1)).toBe(200)
      expect(da.get(2)).toBe(300)
    })

    it('handles zero as base', () => {
      const da = new DeltaArray([3, 6, 9], { base: 0 })
      expect(da.toArray()).toEqual([3, 6, 9])
    })

    it('handles negative base', () => {
      const da = new DeltaArray([0, 5, 10], { base: -10 })
      expect(da.toArray()).toEqual([0, 5, 10])
    })
  })

  // ─── get ──────────────────────────────────────────────────────────────

  describe('get', () => {
    it('returns element at valid index', () => {
      const da = new DeltaArray([10, 20, 30])
      expect(da.get(0)).toBe(10)
      expect(da.get(1)).toBe(20)
      expect(da.get(2)).toBe(30)
    })

    it('throws RangeError for negative index', () => {
      const da = new DeltaArray([1, 2, 3])
      expect(() => da.get(-1)).toThrow(RangeError)
    })

    it('throws RangeError for index equal to length', () => {
      const da = new DeltaArray([1, 2, 3])
      expect(() => da.get(3)).toThrow(RangeError)
    })

    it('throws RangeError for index beyond length', () => {
      const da = new DeltaArray([1, 2, 3])
      expect(() => da.get(100)).toThrow(RangeError)
    })

    it('throws RangeError on empty array', () => {
      const da = new DeltaArray()
      expect(() => da.get(0)).toThrow(RangeError)
    })

    it('returns correct values after set', () => {
      const da = new DeltaArray([1, 2, 3])
      da.set(1, 99)
      expect(da.get(0)).toBe(1)
      expect(da.get(1)).toBe(99)
      expect(da.get(2)).toBe(3)
    })

    it('returns correct values with custom base', () => {
      const da = new DeltaArray([10, 20, 30], { base: 7 })
      expect(da.get(0)).toBe(10)
      expect(da.get(1)).toBe(20)
      expect(da.get(2)).toBe(30)
    })
  })

  // ─── set ──────────────────────────────────────────────────────────────

  describe('set', () => {
    it('sets a value at a valid index', () => {
      const da = new DeltaArray([1, 2, 3])
      da.set(1, 99)
      expect(da.get(1)).toBe(99)
    })

    it('preserves other values when setting one', () => {
      const da = new DeltaArray([10, 20, 30, 40])
      da.set(2, 999)
      expect(da.get(0)).toBe(10)
      expect(da.get(1)).toBe(20)
      expect(da.get(2)).toBe(999)
      expect(da.get(3)).toBe(40)
    })

    it('sets the first element', () => {
      const da = new DeltaArray([1, 2, 3])
      da.set(0, 100)
      expect(da.get(0)).toBe(100)
      expect(da.get(1)).toBe(2)
      expect(da.get(2)).toBe(3)
    })

    it('sets the last element', () => {
      const da = new DeltaArray([1, 2, 3])
      da.set(2, 300)
      expect(da.get(0)).toBe(1)
      expect(da.get(1)).toBe(2)
      expect(da.get(2)).toBe(300)
    })

    it('sets to a negative value', () => {
      const da = new DeltaArray([10, 20, 30])
      da.set(1, -50)
      expect(da.get(1)).toBe(-50)
      expect(da.get(2)).toBe(30)
    })

    it('throws RangeError for negative index', () => {
      const da = new DeltaArray([1, 2, 3])
      expect(() => da.set(-1, 0)).toThrow(RangeError)
    })

    it('throws RangeError for out-of-bounds index', () => {
      const da = new DeltaArray([1, 2, 3])
      expect(() => da.set(3, 0)).toThrow(RangeError)
    })

    it('throws RangeError on empty array', () => {
      const da = new DeltaArray()
      expect(() => da.set(0, 1)).toThrow(RangeError)
    })

    it('sets same value (no-op semantically)', () => {
      const da = new DeltaArray([5, 10, 15])
      da.set(1, 10)
      expect(da.toArray()).toEqual([5, 10, 15])
    })

    it('sets multiple values sequentially', () => {
      const da = new DeltaArray([1, 2, 3, 4])
      da.set(0, 10)
      da.set(1, 20)
      da.set(2, 30)
      da.set(3, 40)
      expect(da.toArray()).toEqual([10, 20, 30, 40])
    })
  })

  // ─── push ─────────────────────────────────────────────────────────────

  describe('push', () => {
    it('pushes a value to an empty array', () => {
      const da = new DeltaArray()
      da.push(42)
      expect(da.length).toBe(1)
      expect(da.get(0)).toBe(42)
    })

    it('pushes multiple values', () => {
      const da = new DeltaArray()
      da.push(10)
      da.push(20)
      da.push(30)
      expect(da.length).toBe(3)
      expect(da.toArray()).toEqual([10, 20, 30])
    })

    it('pushes after construction with values', () => {
      const da = new DeltaArray([1, 2])
      da.push(3)
      expect(da.toArray()).toEqual([1, 2, 3])
    })

    it('pushes a negative value', () => {
      const da = new DeltaArray()
      da.push(-10)
      expect(da.get(0)).toBe(-10)
    })

    it('pushes zero', () => {
      const da = new DeltaArray([5, 10])
      da.push(0)
      expect(da.toArray()).toEqual([5, 10, 0])
    })

    it('pushes with custom base', () => {
      const da = new DeltaArray([10, 20], { base: 5 })
      da.push(30)
      expect(da.toArray()).toEqual([10, 20, 30])
    })
  })

  // ─── pop ──────────────────────────────────────────────────────────────

  describe('pop', () => {
    it('returns undefined on empty array', () => {
      const da = new DeltaArray()
      expect(da.pop()).toBeUndefined()
    })

    it('returns and removes the last element', () => {
      const da = new DeltaArray([10, 20, 30])
      expect(da.pop()).toBe(30)
      expect(da.length).toBe(2)
      expect(da.toArray()).toEqual([10, 20])
    })

    it('pops all elements', () => {
      const da = new DeltaArray([1, 2, 3])
      expect(da.pop()).toBe(3)
      expect(da.pop()).toBe(2)
      expect(da.pop()).toBe(1)
      expect(da.pop()).toBeUndefined()
      expect(da.length).toBe(0)
    })

    it('pops from single-element array', () => {
      const da = new DeltaArray([42])
      expect(da.pop()).toBe(42)
      expect(da.length).toBe(0)
    })

    it('push after pop works correctly', () => {
      const da = new DeltaArray([10, 20, 30])
      da.pop()
      da.push(40)
      expect(da.toArray()).toEqual([10, 20, 40])
    })
  })

  // ─── length ───────────────────────────────────────────────────────────

  describe('length', () => {
    it('returns 0 for empty array', () => {
      const da = new DeltaArray()
      expect(da.length).toBe(0)
    })

    it('returns correct length after construction', () => {
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

  // ─── clear ────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('clears an empty array', () => {
      const da = new DeltaArray()
      da.clear()
      expect(da.length).toBe(0)
    })

    it('clears a populated array', () => {
      const da = new DeltaArray([1, 2, 3])
      da.clear()
      expect(da.length).toBe(0)
      expect(da.toArray()).toEqual([])
    })

    it('allows operations after clear', () => {
      const da = new DeltaArray([1, 2, 3])
      da.clear()
      da.push(99)
      expect(da.length).toBe(1)
      expect(da.get(0)).toBe(99)
    })
  })

  // ─── toArray ──────────────────────────────────────────────────────────

  describe('toArray', () => {
    it('returns empty array for empty DeltaArray', () => {
      const da = new DeltaArray()
      expect(da.toArray()).toEqual([])
    })

    it('returns all values', () => {
      const da = new DeltaArray([10, 20, 30])
      expect(da.toArray()).toEqual([10, 20, 30])
    })

    it('returns a new array each time', () => {
      const da = new DeltaArray([1, 2])
      const a = da.toArray()
      const b = da.toArray()
      expect(a).toEqual(b)
      expect(a).not.toBe(b)
    })

    it('reflects changes after set', () => {
      const da = new DeltaArray([1, 2, 3])
      da.set(1, 99)
      expect(da.toArray()).toEqual([1, 99, 3])
    })

    it('reflects changes after push and pop', () => {
      const da = new DeltaArray([1, 2])
      da.push(3)
      da.pop()
      expect(da.toArray()).toEqual([1, 2])
    })
  })

  // ─── getDeltas ────────────────────────────────────────────────────────

  describe('getDeltas', () => {
    it('returns empty array for empty DeltaArray', () => {
      const da = new DeltaArray()
      expect(da.getDeltas()).toEqual([])
    })

    it('returns the internal delta values', () => {
      const da = new DeltaArray([10, 20, 30])
      expect(da.getDeltas()).toEqual([10, 10, 10])
    })

    it('returns a copy of deltas', () => {
      const da = new DeltaArray([1, 2, 3])
      const d = da.getDeltas()
      d[0] = 999
      expect(da.getDeltas()[0]).not.toBe(999)
    })

    it('returns correct deltas for non-uniform values', () => {
      const da = new DeltaArray([5, 15, 12])
      expect(da.getDeltas()).toEqual([5, 10, -3])
    })

    it('returns correct deltas with custom base', () => {
      const da = new DeltaArray([10, 20, 30], { base: 5 })
      expect(da.getDeltas()).toEqual([5, 10, 10])
    })
  })

  // ─── getDelta ─────────────────────────────────────────────────────────

  describe('getDelta', () => {
    it('returns delta at valid index', () => {
      const da = new DeltaArray([10, 20, 30])
      expect(da.getDelta(0)).toBe(10)
      expect(da.getDelta(1)).toBe(10)
      expect(da.getDelta(2)).toBe(10)
    })

    it('throws RangeError for negative index', () => {
      const da = new DeltaArray([1, 2, 3])
      expect(() => da.getDelta(-1)).toThrow(RangeError)
    })

    it('throws RangeError for out-of-bounds index', () => {
      const da = new DeltaArray([1, 2, 3])
      expect(() => da.getDelta(3)).toThrow(RangeError)
    })

    it('throws RangeError on empty array', () => {
      const da = new DeltaArray()
      expect(() => da.getDelta(0)).toThrow(RangeError)
    })
  })

  // ─── getPrefixSum ─────────────────────────────────────────────────────

  describe('getPrefixSum', () => {
    it('returns prefix sum at index 0', () => {
      const da = new DeltaArray([10, 20, 30])
      expect(da.getPrefixSum(0)).toBe(10)
    })

    it('returns cumulative prefix sum', () => {
      const da = new DeltaArray([10, 20, 30])
      expect(da.getPrefixSum(1)).toBe(20)
      expect(da.getPrefixSum(2)).toBe(30)
    })

    it('returns prefix sum with custom base', () => {
      const da = new DeltaArray([10, 20, 30], { base: 5 })
      expect(da.getPrefixSum(0)).toBe(5)
      expect(da.getPrefixSum(1)).toBe(15)
      expect(da.getPrefixSum(2)).toBe(25)
    })

    it('throws RangeError for negative index', () => {
      const da = new DeltaArray([1, 2, 3])
      expect(() => da.getPrefixSum(-1)).toThrow(RangeError)
    })

    it('throws RangeError for out-of-bounds index', () => {
      const da = new DeltaArray([1, 2, 3])
      expect(() => da.getPrefixSum(3)).toThrow(RangeError)
    })

    it('throws RangeError on empty array', () => {
      const da = new DeltaArray()
      expect(() => da.getPrefixSum(0)).toThrow(RangeError)
    })
  })

  // ─── compress ─────────────────────────────────────────────────────────

  describe('compress', () => {
    it('does nothing on empty array', () => {
      const da = new DeltaArray()
      da.compress()
      expect(da.length).toBe(0)
    })

    it('preserves values after compress', () => {
      const da = new DeltaArray([10, 20, 30])
      da.compress()
      expect(da.toArray()).toEqual([10, 20, 30])
    })

    it('preserves values for single element', () => {
      const da = new DeltaArray([42])
      da.compress()
      expect(da.get(0)).toBe(42)
    })

    it('preserves values with mixed deltas', () => {
      const da = new DeltaArray([5, 15, 12])
      da.compress()
      expect(da.toArray()).toEqual([5, 15, 12])
    })

    it('preserves values after set then compress', () => {
      const da = new DeltaArray([10, 20, 30])
      da.set(1, 99)
      da.compress()
      expect(da.toArray()).toEqual([10, 99, 30])
    })

    it('updates the internal base', () => {
      const da = new DeltaArray([10, 20, 30])
      da.compress()
      expect(da.getDelta(0)).not.toBe(10)
      expect(da.toArray()).toEqual([10, 20, 30])
    })

    it('compress with negative values', () => {
      const da = new DeltaArray([-10, -5, 0, 5])
      da.compress()
      expect(da.toArray()).toEqual([-10, -5, 0, 5])
    })
  })

  // ─── slice ────────────────────────────────────────────────────────────

  describe('slice', () => {
    it('returns a new DeltaArray with sliced values', () => {
      const da = new DeltaArray([10, 20, 30, 40, 50])
      const sliced = da.slice(1, 4)
      expect(sliced.toArray()).toEqual([20, 30, 40])
    })

    it('slices from start to end when no end provided', () => {
      const da = new DeltaArray([10, 20, 30, 40])
      const sliced = da.slice(2)
      expect(sliced.toArray()).toEqual([30, 40])
    })

    it('returns full copy with no arguments', () => {
      const da = new DeltaArray([1, 2, 3])
      const sliced = da.slice(0)
      expect(sliced.toArray()).toEqual([1, 2, 3])
    })

    it('returns empty DeltaArray when start >= end', () => {
      const da = new DeltaArray([1, 2, 3])
      const sliced = da.slice(2, 2)
      expect(sliced.length).toBe(0)
    })

    it('preserves base in sliced result', () => {
      const da = new DeltaArray([10, 20, 30], { base: 5 })
      const sliced = da.slice(0, 2)
      expect(sliced.toArray()).toEqual([10, 20])
    })

    it('does not modify the original', () => {
      const da = new DeltaArray([1, 2, 3, 4])
      da.slice(1, 3)
      expect(da.toArray()).toEqual([1, 2, 3, 4])
    })
  })

  // ─── map ──────────────────────────────────────────────────────────────

  describe('map', () => {
    it('transforms all values', () => {
      const da = new DeltaArray([1, 2, 3])
      const mapped = da.map((v) => v * 10)
      expect(mapped.toArray()).toEqual([10, 20, 30])
    })

    it('provides correct indices', () => {
      const da = new DeltaArray([10, 20, 30])
      const mapped = da.map((v, i) => v + i)
      expect(mapped.toArray()).toEqual([10, 21, 32])
    })

    it('returns empty DeltaArray from empty input', () => {
      const da = new DeltaArray()
      const mapped = da.map((v) => v)
      expect(mapped.length).toBe(0)
    })

    it('does not modify the original', () => {
      const da = new DeltaArray([1, 2, 3])
      da.map((v) => v * 2)
      expect(da.toArray()).toEqual([1, 2, 3])
    })

    it('maps to negative values', () => {
      const da = new DeltaArray([1, 2, 3])
      const mapped = da.map((v) => -v)
      expect(mapped.toArray()).toEqual([-1, -2, -3])
    })
  })

  // ─── forEach ──────────────────────────────────────────────────────────

  describe('forEach', () => {
    it('iterates over all elements with correct values and indices', () => {
      const da = new DeltaArray([10, 20, 30])
      const results: Array<{ value: number; index: number }> = []
      da.forEach((value, index) => {
        results.push({ value, index })
      })
      expect(results).toEqual([
        { value: 10, index: 0 },
        { value: 20, index: 1 },
        { value: 30, index: 2 },
      ])
    })

    it('does not call callback on empty array', () => {
      const da = new DeltaArray()
      let callCount = 0
      da.forEach(() => {
        callCount++
      })
      expect(callCount).toBe(0)
    })

    it('iterates correctly after set', () => {
      const da = new DeltaArray([1, 2, 3])
      da.set(1, 99)
      const values: number[] = []
      da.forEach((v) => values.push(v))
      expect(values).toEqual([1, 99, 3])
    })
  })

  // ─── reduce ───────────────────────────────────────────────────────────

  describe('reduce', () => {
    it('reduces to a sum', () => {
      const da = new DeltaArray([1, 2, 3, 4])
      expect(da.reduce((acc, v) => acc + v, 0)).toBe(10)
    })

    it('returns initial value for empty array', () => {
      const da = new DeltaArray()
      expect(da.reduce((acc, v) => acc + v, 42)).toBe(42)
    })

    it('reduces to product', () => {
      const da = new DeltaArray([2, 3, 4])
      expect(da.reduce((acc, v) => acc * v, 1)).toBe(24)
    })

    it('provides correct indices', () => {
      const da = new DeltaArray([10, 20, 30])
      const result = da.reduce((acc, v, i) => acc + i, 0)
      expect(result).toBe(3)
    })

    it('works with single element', () => {
      const da = new DeltaArray([5])
      expect(da.reduce((acc, v) => acc + v, 0)).toBe(5)
    })
  })

  // ─── Edge Cases ───────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles large number of elements', () => {
      const values = Array.from({ length: 1000 }, (_, i) => i * 2)
      const da = new DeltaArray(values)
      expect(da.length).toBe(1000)
      expect(da.get(0)).toBe(0)
      expect(da.get(500)).toBe(1000)
      expect(da.get(999)).toBe(1998)
    })

    it('handles constant values (zero deltas)', () => {
      const da = new DeltaArray([7, 7, 7, 7])
      expect(da.getDeltas()).toEqual([7, 0, 0, 0])
      expect(da.toArray()).toEqual([7, 7, 7, 7])
    })

    it('handles alternating values', () => {
      const da = new DeltaArray([1, -1, 1, -1])
      expect(da.toArray()).toEqual([1, -1, 1, -1])
    })

    it('set then get round-trip', () => {
      const da = new DeltaArray([0, 0, 0, 0, 0])
      da.set(2, 50)
      da.set(4, 100)
      expect(da.get(0)).toBe(0)
      expect(da.get(1)).toBe(0)
      expect(da.get(2)).toBe(50)
      expect(da.get(3)).toBe(0)
      expect(da.get(4)).toBe(100)
    })

    it('push and pop interleave', () => {
      const da = new DeltaArray()
      da.push(10)
      da.push(20)
      da.pop()
      da.push(30)
      da.push(40)
      da.pop()
      expect(da.toArray()).toEqual([10, 30])
    })

    it('clear then rebuild', () => {
      const da = new DeltaArray([1, 2, 3])
      da.clear()
      da.push(100)
      da.push(200)
      expect(da.toArray()).toEqual([100, 200])
    })

    it('map then reduce chain', () => {
      const da = new DeltaArray([1, 2, 3])
      const result = da.map((v) => v * 2).reduce((sum, v) => sum + v, 0)
      expect(result).toBe(12)
    })

    it('slice then toArray', () => {
      const da = new DeltaArray([10, 20, 30, 40, 50])
      const sliced = da.slice(1, 4)
      expect(sliced.toArray()).toEqual([20, 30, 40])
      expect(sliced.length).toBe(3)
    })

    it('compress preserves values after multiple sets', () => {
      const da = new DeltaArray([0, 0, 0])
      da.set(0, 10)
      da.set(1, 20)
      da.set(2, 30)
      da.compress()
      expect(da.toArray()).toEqual([10, 20, 30])
    })

    it('handles very small floating-point values', () => {
      const da = new DeltaArray([0.1, 0.2, 0.3])
      expect(Math.abs(da.get(0) - 0.1)).toBeLessThan(1e-10)
      expect(Math.abs(da.get(1) - 0.2)).toBeLessThan(1e-10)
      expect(Math.abs(da.get(2) - 0.3)).toBeLessThan(1e-10)
    })

    it('large positive and negative deltas', () => {
      const da = new DeltaArray([1000000, -1000000, 1000000])
      expect(da.toArray()).toEqual([1000000, -1000000, 1000000])
    })

    it('forEach after compress', () => {
      const da = new DeltaArray([5, 15, 12])
      da.compress()
      const values: number[] = []
      da.forEach((v) => values.push(v))
      expect(values).toEqual([5, 15, 12])
    })

    it('reduce after map', () => {
      const da = new DeltaArray([1, 2, 3])
      const mapped = da.map((v) => v + 1)
      const sum = mapped.reduce((acc, v) => acc + v, 0)
      expect(sum).toBe(9)
    })

    it('getDelta after set reflects adjusted delta', () => {
      const da = new DeltaArray([10, 20, 30])
      da.set(1, 50)
      expect(da.get(1)).toBe(50)
      expect(da.get(2)).toBe(30)
    })

    it('single element array operations', () => {
      const da = new DeltaArray([42])
      expect(da.get(0)).toBe(42)
      da.set(0, 100)
      expect(da.get(0)).toBe(100)
      expect(da.pop()).toBe(100)
      expect(da.length).toBe(0)
      da.push(99)
      expect(da.get(0)).toBe(99)
    })

    it('multiple compresses preserve data', () => {
      const da = new DeltaArray([10, 20, 30])
      da.compress()
      da.compress()
      da.compress()
      expect(da.toArray()).toEqual([10, 20, 30])
    })
  })
})
