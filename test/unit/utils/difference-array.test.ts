import { describe, it, expect } from 'vitest'
import { DifferenceArray } from '../../../src/utils/difference-array.js'

describe('DifferenceArray', () => {
  describe('rangeAdd', () => {
    it('adds value to range', () => {
      const da = new DifferenceArray(10)
      da.rangeAdd(2, 5, 10)
      const result = da.toArray()
      expect(result[2]).toBe(10)
      expect(result[5]).toBe(10)
      expect(result[6]).toBe(0)
      expect(result[1]).toBe(0)
    })

    it('handles multiple range adds', () => {
      const da = new DifferenceArray(10)
      da.rangeAdd(0, 4, 1)
      da.rangeAdd(3, 7, 2)
      const result = da.toArray()
      expect(result[0]).toBe(1)
      expect(result[3]).toBe(3)
      expect(result[5]).toBe(2)
      expect(result[8]).toBe(0)
    })

    it('handles overlapping ranges', () => {
      const da = new DifferenceArray(5)
      da.rangeAdd(0, 4, 5)
      da.rangeAdd(1, 3, 10)
      da.rangeAdd(2, 2, 20)
      const result = da.toArray()
      expect(result).toEqual([5, 15, 35, 15, 5])
    })

    it('ignores invalid range', () => {
      const da = new DifferenceArray(5)
      da.rangeAdd(3, 1, 5)
      expect(da.toArray()).toEqual([0, 0, 0, 0, 0])
    })
  })

  describe('pointAdd', () => {
    it('adds to single point', () => {
      const da = new DifferenceArray(5)
      da.pointAdd(2, 42)
      expect(da.get(2)).toBe(42)
      expect(da.get(1)).toBe(0)
    })
  })

  describe('get', () => {
    it('returns value at index', () => {
      const da = new DifferenceArray(10)
      da.rangeAdd(0, 5, 3)
      expect(da.get(3)).toBe(3)
      expect(da.get(7)).toBe(0)
    })
  })

  describe('length', () => {
    it('returns array length', () => {
      const da = new DifferenceArray(100)
      expect(da.length).toBe(100)
    })
  })

  describe('edge cases', () => {
    it('handles full range add', () => {
      const da = new DifferenceArray(5)
      da.rangeAdd(0, 4, 1)
      expect(da.toArray()).toEqual([1, 1, 1, 1, 1])
    })

    it('handles negative values', () => {
      const da = new DifferenceArray(5)
      da.rangeAdd(0, 4, 10)
      da.rangeAdd(1, 3, -5)
      expect(da.toArray()).toEqual([10, 5, 5, 5, 10])
    })
  })
})
