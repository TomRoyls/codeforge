import { describe, it, expect } from 'vitest'
import { DiffArray } from '../../src/core/diff-array/index.js'

describe('DiffArray', () => {
  describe('constructor', () => {
    it('creates array with size 0', () => {
      const da = new DiffArray(0)
      expect(da.size).toBe(0)
    })

    it('creates array with size 5', () => {
      const da = new DiffArray(5)
      expect(da.size).toBe(5)
    })

    it('creates array with size 1', () => {
      const da = new DiffArray(1)
      expect(da.size).toBe(1)
    })

    it('creates array with large size', () => {
      const da = new DiffArray(10000)
      expect(da.size).toBe(10000)
    })

    it('initializes all values to 0', () => {
      const da = new DiffArray(5)
      expect(da.toArray()).toEqual([0, 0, 0, 0, 0])
    })

    it('throws on negative size', () => {
      expect(() => new DiffArray(-1)).toThrow(RangeError)
    })

    it('throws on non-integer size', () => {
      expect(() => new DiffArray(3.5)).toThrow(RangeError)
    })

    it('throws on NaN size', () => {
      expect(() => new DiffArray(NaN)).toThrow(RangeError)
    })

    it('throws on Infinity size', () => {
      expect(() => new DiffArray(Infinity)).toThrow(RangeError)
    })

    it('throws on -Infinity size', () => {
      expect(() => new DiffArray(-Infinity)).toThrow(RangeError)
    })
  })

  describe('size', () => {
    it('returns correct size for empty array', () => {
      const da = new DiffArray(0)
      expect(da.size).toBe(0)
    })

    it('returns correct size after construction', () => {
      const da = new DiffArray(10)
      expect(da.size).toBe(10)
    })

    it('returns updated size after push', () => {
      const da = new DiffArray(3)
      da.push(1)
      expect(da.size).toBe(4)
    })

    it('returns updated size after multiple pushes', () => {
      const da = new DiffArray(2)
      da.push(1)
      da.push(2)
      da.push(3)
      expect(da.size).toBe(5)
    })

    it('returns updated size after pop', () => {
      const da = new DiffArray(3)
      da.pop()
      expect(da.size).toBe(2)
    })
  })

  describe('isEmpty', () => {
    it('returns true for size 0', () => {
      const da = new DiffArray(0)
      expect(da.isEmpty).toBe(true)
    })

    it('returns false for size 1', () => {
      const da = new DiffArray(1)
      expect(da.isEmpty).toBe(false)
    })

    it('returns false for size 5', () => {
      const da = new DiffArray(5)
      expect(da.isEmpty).toBe(false)
    })

    it('returns true after popping all elements', () => {
      const da = new DiffArray(2)
      da.pop()
      da.pop()
      expect(da.isEmpty).toBe(true)
    })
  })

  describe('rangeAdd', () => {
    it('adds delta to single element range', () => {
      const da = new DiffArray(5)
      da.rangeAdd(2, 2, 10)
      expect(da.toArray()).toEqual([0, 0, 10, 0, 0])
    })

    it('adds delta to full range', () => {
      const da = new DiffArray(5)
      da.rangeAdd(0, 4, 3)
      expect(da.toArray()).toEqual([3, 3, 3, 3, 3])
    })

    it('adds delta to partial range', () => {
      const da = new DiffArray(6)
      da.rangeAdd(1, 3, 5)
      expect(da.toArray()).toEqual([0, 5, 5, 5, 0, 0])
    })

    it('adds negative delta', () => {
      const da = new DiffArray(4)
      da.rangeAdd(0, 3, -7)
      expect(da.toArray()).toEqual([-7, -7, -7, -7])
    })

    it('adds zero delta (no change)', () => {
      const da = new DiffArray(3)
      da.rangeAdd(0, 2, 0)
      expect(da.toArray()).toEqual([0, 0, 0])
    })

    it('accumulates multiple range adds', () => {
      const da = new DiffArray(5)
      da.rangeAdd(0, 2, 1)
      da.rangeAdd(1, 4, 2)
      expect(da.toArray()).toEqual([1, 3, 3, 2, 2])
    })

    it('handles overlapping ranges', () => {
      const da = new DiffArray(5)
      da.rangeAdd(0, 4, 10)
      da.rangeAdd(1, 3, 5)
      da.rangeAdd(2, 2, 3)
      expect(da.toArray()).toEqual([10, 15, 18, 15, 10])
    })

    it('handles add from index 0', () => {
      const da = new DiffArray(4)
      da.rangeAdd(0, 1, 100)
      expect(da.toArray()).toEqual([100, 100, 0, 0])
    })

    it('handles add to last index', () => {
      const da = new DiffArray(4)
      da.rangeAdd(3, 3, 50)
      expect(da.toArray()).toEqual([0, 0, 0, 50])
    })

    it('throws on from < 0', () => {
      const da = new DiffArray(3)
      expect(() => da.rangeAdd(-1, 2, 1)).toThrow(RangeError)
    })

    it('throws on to >= size', () => {
      const da = new DiffArray(3)
      expect(() => da.rangeAdd(0, 3, 1)).toThrow(RangeError)
    })

    it('throws on from > to', () => {
      const da = new DiffArray(5)
      expect(() => da.rangeAdd(3, 1, 1)).toThrow(RangeError)
    })

    it('throws on from >= size', () => {
      const da = new DiffArray(3)
      expect(() => da.rangeAdd(5, 5, 1)).toThrow(RangeError)
    })
  })

  describe('pointQuery', () => {
    it('returns 0 for untouched array', () => {
      const da = new DiffArray(5)
      expect(da.pointQuery(0)).toBe(0)
    })

    it('returns value after rangeAdd', () => {
      const da = new DiffArray(5)
      da.rangeAdd(0, 4, 10)
      expect(da.pointQuery(2)).toBe(10)
    })

    it('returns accumulated value', () => {
      const da = new DiffArray(5)
      da.rangeAdd(0, 2, 5)
      da.rangeAdd(2, 4, 3)
      expect(da.pointQuery(2)).toBe(8)
    })

    it('returns value outside any range', () => {
      const da = new DiffArray(5)
      da.rangeAdd(0, 1, 10)
      expect(da.pointQuery(4)).toBe(0)
    })

    it('returns negative value', () => {
      const da = new DiffArray(3)
      da.rangeAdd(0, 2, -5)
      expect(da.pointQuery(1)).toBe(-5)
    })

    it('throws on negative index', () => {
      const da = new DiffArray(3)
      expect(() => da.pointQuery(-1)).toThrow(RangeError)
    })

    it('throws on index >= size', () => {
      const da = new DiffArray(3)
      expect(() => da.pointQuery(3)).toThrow(RangeError)
    })

    it('handles first index', () => {
      const da = new DiffArray(5)
      da.rangeAdd(0, 0, 42)
      expect(da.pointQuery(0)).toBe(42)
    })

    it('handles last index', () => {
      const da = new DiffArray(5)
      da.rangeAdd(4, 4, 99)
      expect(da.pointQuery(4)).toBe(99)
    })
  })

  describe('rangeQuery', () => {
    it('returns sum of range', () => {
      const da = new DiffArray(5)
      da.rangeAdd(0, 4, 1)
      expect(da.rangeQuery(0, 4)).toBe(5)
    })

    it('returns 0 for untouched range', () => {
      const da = new DiffArray(5)
      expect(da.rangeQuery(0, 4)).toBe(0)
    })

    it('returns partial range sum', () => {
      const da = new DiffArray(6)
      da.rangeAdd(1, 3, 5)
      expect(da.rangeQuery(1, 3)).toBe(15)
    })

    it('returns single element sum', () => {
      const da = new DiffArray(5)
      da.rangeAdd(2, 2, 10)
      expect(da.rangeQuery(2, 2)).toBe(10)
    })

    it('handles negative values', () => {
      const da = new DiffArray(3)
      da.rangeAdd(0, 2, -4)
      expect(da.rangeQuery(0, 2)).toBe(-12)
    })

    it('throws on from > to', () => {
      const da = new DiffArray(5)
      expect(() => da.rangeQuery(3, 1)).toThrow(RangeError)
    })

    it('throws on out of bounds', () => {
      const da = new DiffArray(3)
      expect(() => da.rangeQuery(0, 5)).toThrow(RangeError)
    })

    it('throws on negative indices', () => {
      const da = new DiffArray(3)
      expect(() => da.rangeQuery(-1, 2)).toThrow(RangeError)
    })

    it('computes sum with mixed values', () => {
      const da = new DiffArray(5)
      da.rangeAdd(0, 4, 3)
      da.rangeAdd(1, 2, -1)
      expect(da.toArray()).toEqual([3, 2, 2, 3, 3])
      expect(da.rangeQuery(0, 4)).toBe(13)
    })
  })

  describe('get', () => {
    it('returns 0 for untouched index', () => {
      const da = new DiffArray(5)
      expect(da.get(0)).toBe(0)
    })

    it('returns value after set', () => {
      const da = new DiffArray(5)
      da.set(2, 42)
      expect(da.get(2)).toBe(42)
    })

    it('returns value after rangeAdd', () => {
      const da = new DiffArray(5)
      da.rangeAdd(0, 4, 7)
      expect(da.get(3)).toBe(7)
    })

    it('throws on out of bounds', () => {
      const da = new DiffArray(3)
      expect(() => da.get(5)).toThrow(RangeError)
    })
  })

  describe('set', () => {
    it('sets value at index', () => {
      const da = new DiffArray(5)
      da.set(0, 10)
      expect(da.get(0)).toBe(10)
    })

    it('overwrites existing value', () => {
      const da = new DiffArray(5)
      da.set(0, 10)
      da.set(0, 20)
      expect(da.get(0)).toBe(20)
    })

    it('does not affect other indices', () => {
      const da = new DiffArray(5)
      da.set(2, 100)
      expect(da.get(1)).toBe(0)
      expect(da.get(3)).toBe(0)
    })

    it('sets negative value', () => {
      const da = new DiffArray(3)
      da.set(1, -50)
      expect(da.get(1)).toBe(-50)
    })

    it('sets value to 0', () => {
      const da = new DiffArray(3)
      da.set(1, 10)
      da.set(1, 0)
      expect(da.get(1)).toBe(0)
    })

    it('works after rangeAdd', () => {
      const da = new DiffArray(5)
      da.rangeAdd(0, 4, 5)
      da.set(2, 100)
      expect(da.toArray()).toEqual([5, 5, 100, 5, 5])
    })

    it('throws on negative index', () => {
      const da = new DiffArray(3)
      expect(() => da.set(-1, 5)).toThrow(RangeError)
    })

    it('throws on index >= size', () => {
      const da = new DiffArray(3)
      expect(() => da.set(3, 5)).toThrow(RangeError)
    })

    it('preserves rangeAdd effects on other indices', () => {
      const da = new DiffArray(5)
      da.rangeAdd(0, 4, 10)
      da.set(2, 0)
      expect(da.get(0)).toBe(10)
      expect(da.get(1)).toBe(10)
      expect(da.get(3)).toBe(10)
      expect(da.get(4)).toBe(10)
    })
  })

  describe('clear', () => {
    it('resets all values to 0', () => {
      const da = new DiffArray(5)
      da.rangeAdd(0, 4, 10)
      da.clear()
      expect(da.toArray()).toEqual([0, 0, 0, 0, 0])
    })

    it('clears after set operations', () => {
      const da = new DiffArray(3)
      da.set(0, 5)
      da.set(1, 10)
      da.set(2, 15)
      da.clear()
      expect(da.toArray()).toEqual([0, 0, 0])
    })

    it('preserves size after clear', () => {
      const da = new DiffArray(5)
      da.rangeAdd(0, 4, 100)
      da.clear()
      expect(da.size).toBe(5)
    })

    it('allows operations after clear', () => {
      const da = new DiffArray(3)
      da.rangeAdd(0, 2, 10)
      da.clear()
      da.rangeAdd(0, 2, 5)
      expect(da.toArray()).toEqual([5, 5, 5])
    })

    it('clears empty array without error', () => {
      const da = new DiffArray(0)
      expect(() => da.clear()).not.toThrow()
    })

    it('clears size-1 array', () => {
      const da = new DiffArray(1)
      da.set(0, 42)
      da.clear()
      expect(da.get(0)).toBe(0)
    })
  })

  describe('toArray', () => {
    it('returns copy of array', () => {
      const da = new DiffArray(3)
      const arr = da.toArray()
      expect(arr).toEqual([0, 0, 0])
      arr[0] = 999
      expect(da.get(0)).toBe(0)
    })

    it('returns values after rangeAdd', () => {
      const da = new DiffArray(4)
      da.rangeAdd(0, 3, 7)
      expect(da.toArray()).toEqual([7, 7, 7, 7])
    })

    it('returns values after mixed ops', () => {
      const da = new DiffArray(3)
      da.set(0, 1)
      da.rangeAdd(1, 2, 2)
      expect(da.toArray()).toEqual([1, 2, 2])
    })

    it('returns empty array for size 0', () => {
      const da = new DiffArray(0)
      expect(da.toArray()).toEqual([])
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const da = new DiffArray(3)
      da.rangeAdd(0, 2, 10)
      const cloned = da.clone()
      expect(cloned.toArray()).toEqual([10, 10, 10])
      da.rangeAdd(0, 2, 5)
      expect(cloned.toArray()).toEqual([10, 10, 10])
    })

    it('preserves size', () => {
      const da = new DiffArray(5)
      expect(da.clone().size).toBe(5)
    })

    it('modifying clone does not affect original', () => {
      const da = new DiffArray(3)
      da.set(0, 10)
      const cloned = da.clone()
      cloned.set(0, 20)
      expect(da.get(0)).toBe(10)
      expect(cloned.get(0)).toBe(20)
    })

    it('clones empty array', () => {
      const da = new DiffArray(0)
      const cloned = da.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty).toBe(true)
    })

    it('clones array with negative values', () => {
      const da = new DiffArray(3)
      da.rangeAdd(0, 2, -5)
      const cloned = da.clone()
      expect(cloned.toArray()).toEqual([-5, -5, -5])
    })

    it('clone after set operations', () => {
      const da = new DiffArray(4)
      da.set(0, 1)
      da.set(1, 2)
      da.set(2, 3)
      da.set(3, 4)
      const cloned = da.clone()
      expect(cloned.toArray()).toEqual([1, 2, 3, 4])
    })
  })

  describe('push', () => {
    it('adds element to empty array', () => {
      const da = new DiffArray(0)
      da.push(5)
      expect(da.size).toBe(1)
      expect(da.get(0)).toBe(5)
    })

    it('adds element to non-empty array', () => {
      const da = new DiffArray(2)
      da.set(0, 1)
      da.set(1, 2)
      da.push(3)
      expect(da.size).toBe(3)
      expect(da.get(2)).toBe(3)
    })

    it('returns new size', () => {
      const da = new DiffArray(2)
      expect(da.push(10)).toBe(3)
    })

    it('pushes multiple elements', () => {
      const da = new DiffArray(0)
      da.push(1)
      da.push(2)
      da.push(3)
      expect(da.toArray()).toEqual([1, 2, 3])
    })

    it('pushes negative values', () => {
      const da = new DiffArray(1)
      da.set(0, 5)
      da.push(-3)
      expect(da.toArray()).toEqual([5, -3])
    })

    it('pushes zero', () => {
      const da = new DiffArray(1)
      da.set(0, 10)
      da.push(0)
      expect(da.toArray()).toEqual([10, 0])
    })

    it('push preserves existing values', () => {
      const da = new DiffArray(2)
      da.set(0, 100)
      da.set(1, 200)
      da.push(300)
      expect(da.get(0)).toBe(100)
      expect(da.get(1)).toBe(200)
      expect(da.get(2)).toBe(300)
    })
  })

  describe('pop', () => {
    it('returns undefined for empty array', () => {
      const da = new DiffArray(0)
      expect(da.pop()).toBeUndefined()
    })

    it('removes and returns last element', () => {
      const da = new DiffArray(3)
      da.set(0, 1)
      da.set(1, 2)
      da.set(2, 3)
      expect(da.pop()).toBe(3)
      expect(da.size).toBe(2)
    })

    it('pops all elements', () => {
      const da = new DiffArray(2)
      da.set(0, 10)
      da.set(1, 20)
      expect(da.pop()).toBe(20)
      expect(da.pop()).toBe(10)
      expect(da.size).toBe(0)
      expect(da.isEmpty).toBe(true)
    })

    it('returns value from rangeAdd', () => {
      const da = new DiffArray(3)
      da.rangeAdd(0, 2, 5)
      expect(da.pop()).toBe(5)
    })

    it('allows push after pop', () => {
      const da = new DiffArray(2)
      da.set(0, 1)
      da.set(1, 2)
      da.pop()
      da.push(99)
      expect(da.toArray()).toEqual([1, 99])
    })
  })

  describe('static fromArray', () => {
    it('creates from empty array', () => {
      const da = DiffArray.fromArray([])
      expect(da.size).toBe(0)
      expect(da.isEmpty).toBe(true)
    })

    it('creates from number array', () => {
      const da = DiffArray.fromArray([1, 2, 3, 4, 5])
      expect(da.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('creates from single element', () => {
      const da = DiffArray.fromArray([42])
      expect(da.get(0)).toBe(42)
    })

    it('creates from array with zeros', () => {
      const da = DiffArray.fromArray([0, 0, 0])
      expect(da.toArray()).toEqual([0, 0, 0])
    })

    it('creates from array with negatives', () => {
      const da = DiffArray.fromArray([-1, -2, -3])
      expect(da.toArray()).toEqual([-1, -2, -3])
    })

    it('allows rangeAdd after fromArray', () => {
      const da = DiffArray.fromArray([1, 2, 3])
      da.rangeAdd(0, 2, 10)
      expect(da.toArray()).toEqual([11, 12, 13])
    })

    it('allows set after fromArray', () => {
      const da = DiffArray.fromArray([1, 2, 3])
      da.set(1, 99)
      expect(da.toArray()).toEqual([1, 99, 3])
    })

    it('creates independent copy', () => {
      const arr = [1, 2, 3]
      const da = DiffArray.fromArray(arr)
      arr[0] = 999
      expect(da.get(0)).toBe(1)
    })
  })

  describe('forEach', () => {
    it('iterates over all elements', () => {
      const da = new DiffArray(3)
      da.set(0, 10)
      da.set(1, 20)
      da.set(2, 30)
      const result: number[] = []
      da.forEach((v) => result.push(v))
      expect(result).toEqual([10, 20, 30])
    })

    it('provides correct indices', () => {
      const da = new DiffArray(3)
      const indices: number[] = []
      da.forEach((_, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('does nothing for empty array', () => {
      const da = new DiffArray(0)
      let count = 0
      da.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('iterates after rangeAdd', () => {
      const da = new DiffArray(3)
      da.rangeAdd(0, 2, 5)
      const result: number[] = []
      da.forEach((v) => result.push(v))
      expect(result).toEqual([5, 5, 5])
    })

    it('iterates after clear', () => {
      const da = new DiffArray(2)
      da.rangeAdd(0, 1, 10)
      da.clear()
      const result: number[] = []
      da.forEach((v) => result.push(v))
      expect(result).toEqual([0, 0])
    })
  })

  describe('Symbol.iterator', () => {
    it('is iterable', () => {
      const da = new DiffArray(3)
      da.set(0, 1)
      da.set(1, 2)
      da.set(2, 3)
      expect([...da]).toEqual([1, 2, 3])
    })

    it('works with for...of', () => {
      const da = new DiffArray(3)
      da.rangeAdd(0, 2, 7)
      const result: number[] = []
      for (const v of da) {
        result.push(v)
      }
      expect(result).toEqual([7, 7, 7])
    })

    it('works with empty array', () => {
      const da = new DiffArray(0)
      expect([...da]).toEqual([])
    })

    it('works with Array.from', () => {
      const da = new DiffArray(3)
      da.set(0, 10)
      da.set(1, 20)
      da.set(2, 30)
      expect(Array.from(da)).toEqual([10, 20, 30])
    })
  })

  describe('rebuild', () => {
    it('rebuilds without error', () => {
      const da = new DiffArray(5)
      da.rangeAdd(0, 4, 10)
      expect(() => da.rebuild()).not.toThrow()
    })

    it('rebuild makes subsequent queries work', () => {
      const da = new DiffArray(3)
      da.rangeAdd(0, 2, 5)
      da.rebuild()
      expect(da.get(0)).toBe(5)
    })
  })

  describe('snapshot', () => {
    it('returns current state as array', () => {
      const da = new DiffArray(4)
      da.rangeAdd(0, 3, 3)
      expect(da.snapshot()).toEqual([3, 3, 3, 3])
    })

    it('returns copy', () => {
      const da = new DiffArray(3)
      da.rangeAdd(0, 2, 10)
      const snap = da.snapshot()
      snap[0] = 999
      expect(da.get(0)).toBe(10)
    })

    it('reflects set operations', () => {
      const da = new DiffArray(3)
      da.set(0, 1)
      da.set(1, 2)
      da.set(2, 3)
      expect(da.snapshot()).toEqual([1, 2, 3])
    })

    it('returns empty for empty array', () => {
      const da = new DiffArray(0)
      expect(da.snapshot()).toEqual([])
    })

    it('reflects mixed operations', () => {
      const da = new DiffArray(5)
      da.rangeAdd(0, 4, 10)
      da.set(2, 50)
      expect(da.snapshot()).toEqual([10, 10, 50, 10, 10])
    })
  })

  describe('integration', () => {
    it('handles complex sequence of operations', () => {
      const da = new DiffArray(10)
      da.rangeAdd(0, 9, 1)
      da.rangeAdd(3, 7, 2)
      da.set(5, 100)
      da.rangeAdd(0, 2, -1)
      expect(da.toArray()).toEqual([0, 0, 0, 3, 3, 100, 3, 3, 1, 1])
    })

    it('handles fromArray then operations', () => {
      const da = DiffArray.fromArray([10, 20, 30, 40, 50])
      da.rangeAdd(1, 3, 5)
      expect(da.toArray()).toEqual([10, 25, 35, 45, 50])
    })

    it('handles clone after operations', () => {
      const da = new DiffArray(3)
      da.rangeAdd(0, 2, 10)
      da.set(1, 50)
      const cloned = da.clone()
      expect(cloned.toArray()).toEqual([10, 50, 10])
    })

    it('handles clear and reuse', () => {
      const da = new DiffArray(5)
      da.rangeAdd(0, 4, 100)
      da.clear()
      da.rangeAdd(2, 4, 7)
      expect(da.toArray()).toEqual([0, 0, 7, 7, 7])
    })

    it('handles push and rangeAdd', () => {
      const da = new DiffArray(2)
      da.set(0, 1)
      da.set(1, 2)
      da.push(3)
      da.push(4)
      da.rangeAdd(0, 3, 10)
      expect(da.toArray()).toEqual([11, 12, 13, 14])
    })

    it('handles pop and rangeAdd', () => {
      const da = new DiffArray(5)
      da.rangeAdd(0, 4, 5)
      da.pop()
      expect(da.toArray()).toEqual([5, 5, 5, 5])
    })

    it('stress test with many range adds', () => {
      const da = new DiffArray(100)
      for (let i = 0; i < 50; i++) {
        da.rangeAdd(i, i + 49, 1)
      }
      expect(da.pointQuery(49)).toBe(50)
      expect(da.pointQuery(0)).toBe(1)
    })

    it('snapshot after many operations', () => {
      const da = DiffArray.fromArray([0, 0, 0, 0, 0])
      da.rangeAdd(0, 4, 1)
      da.rangeAdd(1, 3, 2)
      da.set(2, 99)
      da.push(10)
      const snap = da.snapshot()
      expect(snap).toEqual([1, 3, 99, 3, 1, 10])
    })

    it('fromArray with subsequent push/pop', () => {
      const da = DiffArray.fromArray([1, 2, 3])
      da.push(4)
      expect(da.pop()).toBe(4)
      expect(da.toArray()).toEqual([1, 2, 3])
    })

    it('iterator after complex operations', () => {
      const da = DiffArray.fromArray([0, 0, 0])
      da.rangeAdd(0, 2, 5)
      da.set(1, 20)
      expect([...da]).toEqual([5, 20, 5])
    })

    it('forEach after push', () => {
      const da = DiffArray.fromArray([1, 2])
      da.push(3)
      const result: number[] = []
      da.forEach((v) => result.push(v))
      expect(result).toEqual([1, 2, 3])
    })

    it('clone after push', () => {
      const da = DiffArray.fromArray([1])
      da.push(2)
      const cloned = da.clone()
      expect(cloned.toArray()).toEqual([1, 2])
      expect(cloned.size).toBe(2)
    })

    it('multiple clears', () => {
      const da = new DiffArray(3)
      da.rangeAdd(0, 2, 5)
      da.clear()
      da.rangeAdd(0, 2, 10)
      da.clear()
      expect(da.toArray()).toEqual([0, 0, 0])
    })

    it('rangeQuery after set and rangeAdd', () => {
      const da = new DiffArray(5)
      da.rangeAdd(0, 4, 1)
      da.set(2, 10)
      expect(da.rangeQuery(0, 4)).toBe(14)
      expect(da.rangeQuery(2, 2)).toBe(10)
    })
  })

  describe('edge cases', () => {
    it('handles very large rangeAdd delta', () => {
      const da = new DiffArray(3)
      da.rangeAdd(0, 2, 1e15)
      expect(da.get(1)).toBe(1e15)
    })

    it('handles very small negative delta', () => {
      const da = new DiffArray(3)
      da.rangeAdd(0, 2, -1e15)
      expect(da.get(1)).toBe(-1e15)
    })

    it('handles alternating set and rangeAdd', () => {
      const da = new DiffArray(5)
      da.set(0, 5)
      da.rangeAdd(0, 4, 1)
      da.set(1, 10)
      da.rangeAdd(1, 3, 2)
      da.set(4, 0)
      expect(da.toArray()).toEqual([6, 12, 3, 3, 0])
    })

    it('handles size 1 array fully', () => {
      const da = new DiffArray(1)
      da.rangeAdd(0, 0, 5)
      expect(da.get(0)).toBe(5)
      da.set(0, 10)
      expect(da.get(0)).toBe(10)
      expect(da.toArray()).toEqual([10])
      expect(da.snapshot()).toEqual([10])
    })

    it('handles float deltas', () => {
      const da = new DiffArray(3)
      da.rangeAdd(0, 2, 0.5)
      expect(da.get(0)).toBeCloseTo(0.5)
      expect(da.get(1)).toBeCloseTo(0.5)
    })

    it('handles push on fromArray result', () => {
      const da = DiffArray.fromArray([1, 2, 3])
      da.push(4)
      da.push(5)
      expect(da.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('handles multiple pops below zero', () => {
      const da = new DiffArray(1)
      expect(da.pop()).toBe(0)
      expect(da.pop()).toBeUndefined()
      expect(da.isEmpty).toBe(true)
    })

    it('clone does not share state after rangeAdd', () => {
      const da = new DiffArray(3)
      const cloned = da.clone()
      da.rangeAdd(0, 2, 100)
      expect(cloned.toArray()).toEqual([0, 0, 0])
      expect(da.toArray()).toEqual([100, 100, 100])
    })

    it('clear after push', () => {
      const da = new DiffArray(2)
      da.push(3)
      da.clear()
      expect(da.toArray()).toEqual([0, 0, 0])
    })

    it('fromArray empty then push', () => {
      const da = DiffArray.fromArray([])
      da.push(42)
      expect(da.toArray()).toEqual([42])
      expect(da.size).toBe(1)
    })
  })
})
