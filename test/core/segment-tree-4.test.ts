import { describe, it, expect } from 'vitest'
import { SegmentTree } from '../../src/core/segment-tree-4/index.js'

describe('SegmentTree', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('should create a tree from a single-element array', () => {
      const st = new SegmentTree([5])
      expect(st.getSize()).toBe(1)
      expect(st.rangeSum(0, 0)).toBe(5)
    })

    it('should create a tree from a multi-element array', () => {
      const st = new SegmentTree([1, 2, 3, 4, 5])
      expect(st.getSize()).toBe(5)
      expect(st.rangeSum(0, 4)).toBe(15)
    })

    it('should not mutate the input array', () => {
      const original = [3, 1, 4, 1, 5]
      const copy = [...original]
      new SegmentTree(original)
      expect(original).toEqual(copy)
    })
  })

  // ─── rangeSum ───
  describe('rangeSum', () => {
    it('should return the element value for a single-element query', () => {
      const st = new SegmentTree([1, 2, 3, 4, 5])
      expect(st.rangeSum(2, 2)).toBe(3)
    })

    it('should return the sum of the entire range', () => {
      const st = new SegmentTree([1, 2, 3, 4, 5])
      expect(st.rangeSum(0, 4)).toBe(15)
    })

    it('should return the sum of a sub-range', () => {
      const st = new SegmentTree([1, 2, 3, 4, 5])
      expect(st.rangeSum(1, 3)).toBe(9)
    })

    it('should handle negative numbers', () => {
      const st = new SegmentTree([-3, -1, 0, 2, 5])
      expect(st.rangeSum(0, 4)).toBe(3)
      expect(st.rangeSum(0, 1)).toBe(-4)
    })

    it('should handle all negative numbers', () => {
      const st = new SegmentTree([-5, -3, -1])
      expect(st.rangeSum(0, 2)).toBe(-9)
    })

    it('should handle zeros', () => {
      const st = new SegmentTree([0, 0, 0, 0])
      expect(st.rangeSum(0, 3)).toBe(0)
    })
  })

  // ─── rangeMin ───
  describe('rangeMin', () => {
    it('should return the element value for a single-element query', () => {
      const st = new SegmentTree([3, 1, 4, 1, 5])
      expect(st.rangeMin(2, 2)).toBe(4)
    })

    it('should return the minimum of the entire range', () => {
      const st = new SegmentTree([3, 1, 4, 1, 5])
      expect(st.rangeMin(0, 4)).toBe(1)
    })

    it('should return the minimum of a sub-range', () => {
      const st = new SegmentTree([3, 1, 4, 1, 5])
      expect(st.rangeMin(2, 4)).toBe(1)
    })

    it('should handle negative numbers', () => {
      const st = new SegmentTree([-3, -1, -4, -1, -5])
      expect(st.rangeMin(0, 4)).toBe(-5)
    })
  })

  // ─── rangeMax ───
  describe('rangeMax', () => {
    it('should return the element value for a single-element query', () => {
      const st = new SegmentTree([3, 1, 4, 1, 5])
      expect(st.rangeMax(0, 0)).toBe(3)
    })

    it('should return the maximum of the entire range', () => {
      const st = new SegmentTree([3, 1, 4, 1, 5])
      expect(st.rangeMax(0, 4)).toBe(5)
    })

    it('should return the maximum of a sub-range', () => {
      const st = new SegmentTree([3, 1, 4, 1, 5])
      expect(st.rangeMax(0, 2)).toBe(4)
    })

    it('should handle negative numbers', () => {
      const st = new SegmentTree([-3, -1, -4, -1, -5])
      expect(st.rangeMax(0, 4)).toBe(-1)
    })
  })

  // ─── update ───
  describe('update', () => {
    it('should update a single element', () => {
      const st = new SegmentTree([1, 2, 3, 4, 5])
      st.update(2, 10)
      expect(st.rangeSum(0, 4)).toBe(22)
      expect(st.rangeSum(2, 2)).toBe(10)
    })

    it('should update the first element', () => {
      const st = new SegmentTree([1, 2, 3])
      st.update(0, 100)
      expect(st.rangeSum(0, 0)).toBe(100)
      expect(st.toArray()).toEqual([100, 2, 3])
    })

    it('should update the last element', () => {
      const st = new SegmentTree([1, 2, 3])
      st.update(2, 100)
      expect(st.rangeSum(2, 2)).toBe(100)
      expect(st.toArray()).toEqual([1, 2, 100])
    })

    it('should update to a negative value', () => {
      const st = new SegmentTree([1, 2, 3])
      st.update(1, -5)
      expect(st.rangeSum(0, 2)).toBe(-1)
      expect(st.rangeMin(0, 2)).toBe(-5)
    })

    it('should update to zero', () => {
      const st = new SegmentTree([1, 2, 3])
      st.update(1, 0)
      expect(st.toArray()).toEqual([1, 0, 3])
    })

    it('should reflect update in rangeMin and rangeMax', () => {
      const st = new SegmentTree([1, 2, 3, 4, 5])
      st.update(0, 10)
      expect(st.rangeMax(0, 4)).toBe(10)
      st.update(4, -1)
      expect(st.rangeMin(0, 4)).toBe(-1)
    })
  })

  // ─── rangeAdd ───
  describe('rangeAdd', () => {
    it('should add a value to a single element', () => {
      const st = new SegmentTree([1, 2, 3, 4, 5])
      st.rangeAdd(2, 2, 10)
      expect(st.rangeSum(2, 2)).toBe(13)
    })

    it('should add a value to a range of elements', () => {
      const st = new SegmentTree([1, 2, 3, 4, 5])
      st.rangeAdd(1, 3, 5)
      expect(st.toArray()).toEqual([1, 7, 8, 9, 5])
    })

    it('should add to the entire range', () => {
      const st = new SegmentTree([1, 2, 3])
      st.rangeAdd(0, 2, 10)
      expect(st.toArray()).toEqual([11, 12, 13])
    })

    it('should add a negative value', () => {
      const st = new SegmentTree([5, 10, 15])
      st.rangeAdd(0, 2, -3)
      expect(st.toArray()).toEqual([2, 7, 12])
    })

    it('should work with multiple range adds', () => {
      const st = new SegmentTree([1, 2, 3, 4, 5])
      st.rangeAdd(0, 4, 1)
      st.rangeAdd(1, 3, 2)
      expect(st.toArray()).toEqual([2, 5, 6, 7, 6])
    })

    it('should reflect rangeAdd in rangeMin and rangeMax', () => {
      const st = new SegmentTree([1, 2, 3])
      st.rangeAdd(0, 2, 10)
      expect(st.rangeMin(0, 2)).toBe(11)
      expect(st.rangeMax(0, 2)).toBe(13)
    })
  })

  // ─── getSize ───
  describe('getSize', () => {
    it('should return the correct size for single element', () => {
      const st = new SegmentTree([42])
      expect(st.getSize()).toBe(1)
    })

    it('should return the correct size for multiple elements', () => {
      const st = new SegmentTree([1, 2, 3, 4, 5, 6])
      expect(st.getSize()).toBe(6)
    })
  })

  // ─── toArray ───
  describe('toArray', () => {
    it('should return the original array values', () => {
      const st = new SegmentTree([1, 2, 3, 4, 5])
      expect(st.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('should reflect updates', () => {
      const st = new SegmentTree([1, 2, 3])
      st.update(1, 10)
      expect(st.toArray()).toEqual([1, 10, 3])
    })

    it('should reflect range adds', () => {
      const st = new SegmentTree([1, 2, 3])
      st.rangeAdd(0, 2, 5)
      expect(st.toArray()).toEqual([6, 7, 8])
    })

    it('should return a single-element array', () => {
      const st = new SegmentTree([42])
      expect(st.toArray()).toEqual([42])
    })
  })

  // ─── getTimeComplexity ───
  describe('getTimeComplexity', () => {
    it('should return O(log n)', () => {
      const st = new SegmentTree([1, 2, 3])
      expect(st.getTimeComplexity()).toBe('O(log n)')
    })
  })

  // ─── Combined Operations ───
  describe('combined operations', () => {
    it('should handle update followed by rangeAdd', () => {
      const st = new SegmentTree([1, 2, 3, 4, 5])
      st.update(2, 10)
      st.rangeAdd(1, 3, 5)
      expect(st.rangeSum(1, 3)).toBe(7 + 15 + 9)
      expect(st.toArray()).toEqual([1, 7, 15, 9, 5])
    })

    it('should handle rangeAdd followed by update', () => {
      const st = new SegmentTree([1, 2, 3, 4, 5])
      st.rangeAdd(0, 4, 10)
      st.update(2, 0)
      expect(st.toArray()).toEqual([11, 12, 0, 14, 15])
    })

    it('should handle duplicates correctly', () => {
      const st = new SegmentTree([2, 2, 2, 2])
      expect(st.rangeSum(0, 3)).toBe(8)
      expect(st.rangeMin(0, 3)).toBe(2)
      expect(st.rangeMax(0, 3)).toBe(2)
    })
  })
})
