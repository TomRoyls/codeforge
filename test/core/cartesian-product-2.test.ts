import { describe, it, expect } from 'vitest'
import { CartesianProduct2 } from '../../src/core/cartesian-product-2/index.js'

describe('CartesianProduct2', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('creates instance from arrays of sets', () => {
      const cp = new CartesianProduct2([[1, 2], ['a', 'b']])
      expect(cp.size()).toBe(4)
      expect(cp.dimensions()).toBe(2)
    })

    it('handles empty sets array', () => {
      const cp = new CartesianProduct2<number[]>([])
      expect(cp.size()).toBe(0)
      expect(cp.dimensions()).toBe(0)
    })

    it('handles single set', () => {
      const cp = new CartesianProduct2([[1, 2, 3]])
      expect(cp.size()).toBe(3)
      expect(cp.dimensions()).toBe(1)
    })

    it('handles sets containing empty array', () => {
      const cp = new CartesianProduct2([[1, 2], []])
      expect(cp.size()).toBe(0)
    })
  })

  // ─── size() ───
  describe('size', () => {
    it('returns product of set lengths', () => {
      const cp = new CartesianProduct2([[1, 2], [3, 4, 5]])
      expect(cp.size()).toBe(6)
    })

    it('returns 1 for single-element sets', () => {
      const cp = new CartesianProduct2([[1], [2]])
      expect(cp.size()).toBe(1)
    })

    it('returns 0 for empty sets array', () => {
      const cp = new CartesianProduct2([])
      expect(cp.size()).toBe(0)
    })

    it('returns 0 when any set is empty', () => {
      const cp = new CartesianProduct2([[1], [], [3]])
      expect(cp.size()).toBe(0)
    })

    it('handles three sets correctly', () => {
      const cp = new CartesianProduct2([[1, 2], [3, 4], [5, 6]])
      expect(cp.size()).toBe(8)
    })
  })

  // ─── dimensions() ───
  describe('dimensions', () => {
    it('returns number of sets', () => {
      const cp = new CartesianProduct2([[1], [2], [3], [4]])
      expect(cp.dimensions()).toBe(4)
    })

    it('returns 0 for empty sets array', () => {
      const cp = new CartesianProduct2([])
      expect(cp.dimensions()).toBe(0)
    })
  })

  // ─── at() ───
  describe('at', () => {
    it('returns element at index 0', () => {
      const cp = new CartesianProduct2([[1, 2], ['a', 'b']])
      expect(cp.at(0)).toEqual([1, 'a'])
    })

    it('returns element at last valid index', () => {
      const cp = new CartesianProduct2([[1, 2], ['a', 'b']])
      expect(cp.at(3)).toEqual([2, 'b'])
    })

    it('returns undefined for negative index', () => {
      const cp = new CartesianProduct2([[1, 2], ['a', 'b']])
      expect(cp.at(-1)).toBeUndefined()
    })

    it('returns undefined for out-of-bounds index', () => {
      const cp = new CartesianProduct2([[1, 2], ['a', 'b']])
      expect(cp.at(4)).toBeUndefined()
    })

    it('returns undefined when size is 0', () => {
      const cp = new CartesianProduct2([])
      expect(cp.at(0)).toBeUndefined()
    })

    it('returns correct elements for three-set product', () => {
      const cp = new CartesianProduct2([[1, 2], ['a', 'b'], [true, false]])
      expect(cp.size()).toBe(8)
      expect(cp.at(0)).toEqual([1, 'a', true])
      expect(cp.at(7)).toEqual([2, 'b', false])
    })

    it('enumerates all combinations for two sets of two', () => {
      const cp = new CartesianProduct2([[1, 2], ['a', 'b']])
      expect(cp.at(0)).toEqual([1, 'a'])
      expect(cp.at(1)).toEqual([2, 'a'])
      expect(cp.at(2)).toEqual([1, 'b'])
      expect(cp.at(3)).toEqual([2, 'b'])
    })
  })

  // ─── indexOf() ───
  describe('indexOf', () => {
    it('returns 0 for first element', () => {
      const cp = new CartesianProduct2([[1, 2], ['a', 'b']])
      expect(cp.indexOf([1, 'a'])).toBe(0)
    })

    it('returns correct index for last element', () => {
      const cp = new CartesianProduct2([[1, 2], ['a', 'b']])
      expect(cp.indexOf([2, 'b'])).toBe(3)
    })

    it('returns -1 for wrong-length element', () => {
      const cp = new CartesianProduct2([[1, 2], ['a', 'b']])
      expect(cp.indexOf([1])).toBe(-1)
    })

    it('returns -1 for element with value not in set', () => {
      const cp = new CartesianProduct2([[1, 2], ['a', 'b']])
      expect(cp.indexOf([3, 'a'])).toBe(-1)
    })

    it('returns -1 for element with value not in second set', () => {
      const cp = new CartesianProduct2([[1, 2], ['a', 'b']])
      expect(cp.indexOf([1, 'c'])).toBe(-1)
    })

    it('roundtrips with at()', () => {
      const cp = new CartesianProduct2([[1, 2], ['a', 'b', 'c']])
      for (let i = 0; i < cp.size(); i++) {
        const element = cp.at(i)!
        expect(cp.indexOf(element)).toBe(i)
      }
    })
  })

  // ─── has() ───
  describe('has', () => {
    it('returns true for existing combination', () => {
      const cp = new CartesianProduct2([[1, 2], ['a', 'b']])
      expect(cp.has([1, 'a'])).toBe(true)
      expect(cp.has([2, 'b'])).toBe(true)
    })

    it('returns false for non-existing combination', () => {
      const cp = new CartesianProduct2([[1, 2], ['a', 'b']])
      expect(cp.has([3, 'a'])).toBe(false)
      expect(cp.has([1, 'c'])).toBe(false)
    })

    it('returns false for wrong-length element', () => {
      const cp = new CartesianProduct2([[1, 2], ['a', 'b']])
      expect(cp.has([1])).toBe(false)
    })
  })

  // ─── toArray() ───
  describe('toArray', () => {
    it('returns all combinations', () => {
      const cp = new CartesianProduct2([[1, 2], ['a', 'b']])
      const arr = cp.toArray()
      expect(arr).toHaveLength(4)
    })

    it('returns empty array for empty sets', () => {
      const cp = new CartesianProduct2([])
      expect(cp.toArray()).toEqual([])
    })

    it('returns empty array when any set is empty', () => {
      const cp = new CartesianProduct2([[1], []])
      expect(cp.toArray()).toEqual([])
    })

    it('contains all unique combinations', () => {
      const cp = new CartesianProduct2([[1, 2], [3, 4]])
      const arr = cp.toArray()
      expect(arr).toEqual([[1, 3], [2, 3], [1, 4], [2, 4]])
    })
  })

  // ─── forEach() ───
  describe('forEach', () => {
    it('iterates over all elements with correct indices', () => {
      const cp = new CartesianProduct2([[1, 2], ['a']])
      const results: { element: number[]; index: number }[] = []
      cp.forEach((element, index) => {
        results.push({ element, index })
      })
      expect(results).toHaveLength(2)
      expect(results[0]).toEqual({ element: [1, 'a'], index: 0 })
      expect(results[1]).toEqual({ element: [2, 'a'], index: 1 })
    })

    it('does not call callback for empty product', () => {
      const cp = new CartesianProduct2([])
      let callCount = 0
      cp.forEach(() => { callCount++ })
      expect(callCount).toBe(0)
    })
  })

  // ─── Edge cases ───
  describe('edge cases', () => {
    it('handles sets with duplicates', () => {
      const cp = new CartesianProduct2([[1, 1], [2, 2]])
      expect(cp.size()).toBe(4)
      expect(cp.at(0)).toEqual([1, 2])
    })

    it('handles negative numbers', () => {
      const cp = new CartesianProduct2([[-1, -2], [3, 4]])
      expect(cp.size()).toBe(4)
      expect(cp.has([-1, 3])).toBe(true)
    })

    it('handles string sets', () => {
      const cp = new CartesianProduct2([['x', 'y'], ['z']])
      expect(cp.size()).toBe(2)
      expect(cp.at(0)).toEqual(['x', 'z'])
    })

    it('handles single-element sets', () => {
      const cp = new CartesianProduct2([[42]])
      expect(cp.size()).toBe(1)
      expect(cp.at(0)).toEqual([42])
    })
  })
})
