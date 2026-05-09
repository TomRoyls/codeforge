import { describe, it, expect } from 'vitest'
import { SegmentTreeLazy } from '../../src/core/segment-tree-lazy/segment-tree-lazy.js'
import { DEFAULT_SEGMENT_TREE_LAZY_OPTIONS, SUM_OPTIONS, MIN_OPTIONS, MAX_OPTIONS } from '../../src/core/segment-tree-lazy/types.js'
import type { SegmentTreeLazyOptions } from '../../src/core/segment-tree-lazy/types.js'

describe('SegmentTreeLazy', () => {
  describe('constructor', () => {
    it('should create with data array', () => {
      const st = new SegmentTreeLazy([1, 2, 3])
      expect(st.size()).toBe(3)
    })

    it('should create with empty array', () => {
      const st = new SegmentTreeLazy([])
      expect(st.size()).toBe(0)
    })

    it('should create with single element', () => {
      const st = new SegmentTreeLazy([42])
      expect(st.size()).toBe(1)
      expect(st.get(0)).toBe(42)
    })

    it('should accept custom combine function', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4], {
        identity: 0,
        combine: (a, b) => a * b,
      })
      expect(st.query(0, 3)).toBe(24)
    })

    it('should use default sum options when no options provided', () => {
      const st = new SegmentTreeLazy([1, 2, 3])
      expect(st.query(0, 2)).toBe(6)
    })

    it('should accept partial options with identity only', () => {
      const st = new SegmentTreeLazy([1, 2, 3], { identity: 0 })
      expect(st.query(0, 2)).toBe(6)
    })
  })

  describe('static factory methods', () => {
    it('createSum should create sum tree', () => {
      const st = SegmentTreeLazy.createSum([1, 2, 3, 4, 5])
      expect(st.query(0, 4)).toBe(15)
    })

    it('createMin should create min tree', () => {
      const st = SegmentTreeLazy.createMin([5, 3, 8, 1, 9])
      expect(st.query(0, 4)).toBe(1)
    })

    it('createMax should create max tree', () => {
      const st = SegmentTreeLazy.createMax([5, 3, 8, 1, 9])
      expect(st.query(0, 4)).toBe(9)
    })

    it('createSum with empty array', () => {
      const st = SegmentTreeLazy.createSum([])
      expect(st.size()).toBe(0)
    })

    it('createMin with single element', () => {
      const st = SegmentTreeLazy.createMin([7])
      expect(st.query(0, 0)).toBe(7)
    })

    it('createMax with single element', () => {
      const st = SegmentTreeLazy.createMax([7])
      expect(st.query(0, 0)).toBe(7)
    })
  })

  describe('update (point)', () => {
    it('should update first element', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      st.update(0, 10)
      expect(st.get(0)).toBe(10)
    })

    it('should update last element', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      st.update(4, 50)
      expect(st.get(4)).toBe(50)
    })

    it('should update middle element', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      st.update(2, 30)
      expect(st.get(2)).toBe(30)
    })

    it('should update single element tree', () => {
      const st = new SegmentTreeLazy([1])
      st.update(0, 99)
      expect(st.get(0)).toBe(99)
    })

    it('should update to negative value', () => {
      const st = new SegmentTreeLazy([1, 2, 3])
      st.update(1, -5)
      expect(st.get(1)).toBe(-5)
    })

    it('should update to zero', () => {
      const st = new SegmentTreeLazy([1, 2, 3])
      st.update(0, 0)
      expect(st.get(0)).toBe(0)
    })

    it('should update to floating point', () => {
      const st = new SegmentTreeLazy([1, 2, 3])
      st.update(0, 1.5)
      expect(st.get(0)).toBeCloseTo(1.5)
    })

    it('should throw for negative index', () => {
      const st = new SegmentTreeLazy([1, 2, 3])
      expect(() => st.update(-1, 5)).toThrow(RangeError)
    })

    it('should throw for index >= size', () => {
      const st = new SegmentTreeLazy([1, 2, 3])
      expect(() => st.update(3, 5)).toThrow(RangeError)
    })

    it('should throw for empty tree', () => {
      const st = new SegmentTreeLazy([])
      expect(() => st.update(0, 5)).toThrow(RangeError)
    })

    it('should reflect in range query after update', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      st.update(2, 100)
      expect(st.query(1, 3)).toBe(106)
    })

    it('should handle multiple sequential updates', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      st.update(0, 10)
      st.update(2, 30)
      st.update(4, 50)
      expect(st.query(0, 4)).toBe(96)
    })

    it('should return void', () => {
      const st = new SegmentTreeLazy([1])
      expect(st.update(0, 5)).toBeUndefined()
    })
  })

  describe('query (range)', () => {
    it('should query entire range', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      expect(st.query(0, 4)).toBe(15)
    })

    it('should query single element', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      expect(st.query(0, 0)).toBe(1)
      expect(st.query(2, 2)).toBe(3)
      expect(st.query(4, 4)).toBe(5)
    })

    it('should query partial range from start', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      expect(st.query(0, 2)).toBe(6)
    })

    it('should query partial range to end', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      expect(st.query(2, 4)).toBe(12)
    })

    it('should query middle range', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      expect(st.query(1, 3)).toBe(9)
    })

    it('should query two adjacent elements', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      expect(st.query(1, 2)).toBe(5)
    })

    it('should return identity for empty tree', () => {
      const st = new SegmentTreeLazy([])
      expect(st.query(0, 0)).toBe(0)
    })

    it('should throw for negative left index', () => {
      const st = new SegmentTreeLazy([1, 2, 3])
      expect(() => st.query(-1, 2)).toThrow(RangeError)
    })

    it('should throw for right index >= size', () => {
      const st = new SegmentTreeLazy([1, 2, 3])
      expect(() => st.query(0, 3)).toThrow(RangeError)
    })

    it('should throw when left > right', () => {
      const st = new SegmentTreeLazy([1, 2, 3])
      expect(() => st.query(2, 1)).toThrow(RangeError)
    })

    it('should handle negative values', () => {
      const st = new SegmentTreeLazy([-1, -2, -3, -4])
      expect(st.query(0, 3)).toBe(-10)
    })

    it('should handle mixed positive and negative values', () => {
      const st = new SegmentTreeLazy([5, -3, 2, -1, 4])
      expect(st.query(0, 4)).toBe(7)
    })

    it('should handle floating point values', () => {
      const st = new SegmentTreeLazy([1.5, 2.5, 3.0])
      expect(st.query(0, 2)).toBeCloseTo(7.0)
    })

    it('should handle sequential range queries', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5, 6, 7, 8])
      expect(st.query(0, 1)).toBe(3)
      expect(st.query(2, 3)).toBe(7)
      expect(st.query(4, 5)).toBe(11)
      expect(st.query(6, 7)).toBe(15)
    })

    it('should handle overlapping range queries', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      expect(st.query(0, 3)).toBe(10)
      expect(st.query(1, 4)).toBe(14)
      expect(st.query(2, 4)).toBe(12)
    })
  })

  describe('rangeAdd', () => {
    it('should add to entire range', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      st.rangeAdd(0, 4, 10)
      expect(st.toArray()).toEqual([11, 12, 13, 14, 15])
    })

    it('should add to partial range from start', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      st.rangeAdd(0, 2, 5)
      expect(st.toArray()).toEqual([6, 7, 8, 4, 5])
    })

    it('should add to partial range to end', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      st.rangeAdd(2, 4, 3)
      expect(st.toArray()).toEqual([1, 2, 6, 7, 8])
    })

    it('should add to single element', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      st.rangeAdd(2, 2, 100)
      expect(st.get(2)).toBe(103)
      expect(st.toArray()).toEqual([1, 2, 103, 4, 5])
    })

    it('should add zero (no-op)', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      st.rangeAdd(0, 4, 0)
      expect(st.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('should add negative value', () => {
      const st = new SegmentTreeLazy([10, 20, 30, 40, 50])
      st.rangeAdd(0, 4, -5)
      expect(st.toArray()).toEqual([5, 15, 25, 35, 45])
    })

    it('should add to middle range', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      st.rangeAdd(1, 3, 10)
      expect(st.toArray()).toEqual([1, 12, 13, 14, 5])
    })

    it('should reflect in range query after add', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      st.rangeAdd(0, 4, 10)
      expect(st.query(0, 4)).toBe(65)
    })

    it('should handle multiple sequential range adds', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      st.rangeAdd(0, 4, 1)
      st.rangeAdd(0, 4, 2)
      st.rangeAdd(0, 4, 3)
      expect(st.toArray()).toEqual([7, 8, 9, 10, 11])
    })

    it('should handle overlapping range adds', () => {
      const st = new SegmentTreeLazy([0, 0, 0, 0, 0])
      st.rangeAdd(0, 3, 1)
      st.rangeAdd(2, 4, 2)
      expect(st.toArray()).toEqual([1, 1, 3, 3, 2])
    })

    it('should throw for invalid range', () => {
      const st = new SegmentTreeLazy([1, 2, 3])
      expect(() => st.rangeAdd(-1, 2, 1)).toThrow(RangeError)
      expect(() => st.rangeAdd(0, 3, 1)).toThrow(RangeError)
      expect(() => st.rangeAdd(2, 1, 1)).toThrow(RangeError)
    })

    it('should return void', () => {
      const st = new SegmentTreeLazy([1])
      expect(st.rangeAdd(0, 0, 5)).toBeUndefined()
    })

    it('should be no-op on empty tree', () => {
      const st = new SegmentTreeLazy([])
      expect(st.rangeAdd(0, 0, 5)).toBeUndefined()
    })

    it('should handle add on two element tree', () => {
      const st = new SegmentTreeLazy([10, 20])
      st.rangeAdd(0, 1, 5)
      expect(st.toArray()).toEqual([15, 25])
    })

    it('should handle add after point update', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      st.update(2, 100)
      st.rangeAdd(0, 4, 1)
      expect(st.toArray()).toEqual([2, 3, 101, 5, 6])
    })
  })

  describe('rangeSet', () => {
    it('should set entire range', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      st.rangeSet(0, 4, 0)
      expect(st.toArray()).toEqual([0, 0, 0, 0, 0])
    })

    it('should set partial range from start', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      st.rangeSet(0, 2, 10)
      expect(st.toArray()).toEqual([10, 10, 10, 4, 5])
    })

    it('should set partial range to end', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      st.rangeSet(2, 4, 7)
      expect(st.toArray()).toEqual([1, 2, 7, 7, 7])
    })

    it('should set single element', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      st.rangeSet(2, 2, 99)
      expect(st.toArray()).toEqual([1, 2, 99, 4, 5])
    })

    it('should set to negative value', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      st.rangeSet(0, 4, -1)
      expect(st.toArray()).toEqual([-1, -1, -1, -1, -1])
    })

    it('should set to zero', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      st.rangeSet(1, 3, 0)
      expect(st.toArray()).toEqual([1, 0, 0, 0, 5])
    })

    it('should reflect in range query after set', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      st.rangeSet(0, 4, 3)
      expect(st.query(0, 4)).toBe(15)
    })

    it('should throw for invalid range', () => {
      const st = new SegmentTreeLazy([1, 2, 3])
      expect(() => st.rangeSet(-1, 2, 1)).toThrow(RangeError)
      expect(() => st.rangeSet(0, 3, 1)).toThrow(RangeError)
      expect(() => st.rangeSet(2, 1, 1)).toThrow(RangeError)
    })

    it('should return void', () => {
      const st = new SegmentTreeLazy([1])
      expect(st.rangeSet(0, 0, 5)).toBeUndefined()
    })

    it('should be no-op on empty tree', () => {
      const st = new SegmentTreeLazy([])
      expect(st.rangeSet(0, 0, 5)).toBeUndefined()
    })

    it('should handle set on two element tree', () => {
      const st = new SegmentTreeLazy([10, 20])
      st.rangeSet(0, 1, 5)
      expect(st.toArray()).toEqual([5, 5])
    })

    it('should override previous range add', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      st.rangeAdd(0, 4, 10)
      st.rangeSet(0, 4, 0)
      expect(st.toArray()).toEqual([0, 0, 0, 0, 0])
    })

    it('should be overridden by later range add', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      st.rangeSet(0, 4, 10)
      st.rangeAdd(0, 4, 5)
      expect(st.toArray()).toEqual([15, 15, 15, 15, 15])
    })
  })

  describe('rangeAdd then rangeSet interaction', () => {
    it('should handle add then set on overlapping ranges', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      st.rangeAdd(0, 2, 10)
      st.rangeSet(1, 4, 0)
      expect(st.toArray()).toEqual([11, 0, 0, 0, 0])
    })

    it('should handle set then add on overlapping ranges', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      st.rangeSet(0, 2, 10)
      st.rangeAdd(1, 4, 5)
      expect(st.toArray()).toEqual([10, 15, 15, 9, 10])
    })

    it('should handle set then set', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      st.rangeSet(0, 4, 10)
      st.rangeSet(1, 3, 20)
      expect(st.toArray()).toEqual([10, 20, 20, 20, 10])
    })

    it('should handle add then add then set', () => {
      const st = new SegmentTreeLazy([0, 0, 0, 0, 0])
      st.rangeAdd(0, 4, 1)
      st.rangeAdd(0, 4, 2)
      st.rangeSet(2, 4, 0)
      expect(st.toArray()).toEqual([3, 3, 0, 0, 0])
    })
  })

  describe('get', () => {
    it('should get first element', () => {
      const st = new SegmentTreeLazy([10, 20, 30])
      expect(st.get(0)).toBe(10)
    })

    it('should get last element', () => {
      const st = new SegmentTreeLazy([10, 20, 30])
      expect(st.get(2)).toBe(30)
    })

    it('should get middle element', () => {
      const st = new SegmentTreeLazy([10, 20, 30])
      expect(st.get(1)).toBe(20)
    })

    it('should throw for negative index', () => {
      const st = new SegmentTreeLazy([1, 2, 3])
      expect(() => st.get(-1)).toThrow(RangeError)
    })

    it('should throw for index >= size', () => {
      const st = new SegmentTreeLazy([1, 2, 3])
      expect(() => st.get(3)).toThrow(RangeError)
    })

    it('should reflect point update', () => {
      const st = new SegmentTreeLazy([1, 2, 3])
      st.update(1, 99)
      expect(st.get(1)).toBe(99)
    })

    it('should reflect range add', () => {
      const st = new SegmentTreeLazy([1, 2, 3])
      st.rangeAdd(0, 2, 10)
      expect(st.get(1)).toBe(12)
    })

    it('should reflect range set', () => {
      const st = new SegmentTreeLazy([1, 2, 3])
      st.rangeSet(0, 2, 7)
      expect(st.get(1)).toBe(7)
    })
  })

  describe('size', () => {
    it('should return 0 for empty tree', () => {
      const st = new SegmentTreeLazy([])
      expect(st.size()).toBe(0)
    })

    it('should return correct size after construction', () => {
      const st = new SegmentTreeLazy([1, 2, 3])
      expect(st.size()).toBe(3)
    })

    it('should return 1 for single element', () => {
      const st = new SegmentTreeLazy([1])
      expect(st.size()).toBe(1)
    })

    it('should return correct size for large array', () => {
      const st = new SegmentTreeLazy(Array.from({ length: 1000 }, (_, i) => i))
      expect(st.size()).toBe(1000)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty tree', () => {
      const st = new SegmentTreeLazy([])
      expect(st.toArray()).toEqual([])
    })

    it('should return copy of data', () => {
      const st = new SegmentTreeLazy([1, 2, 3])
      const arr = st.toArray()
      expect(arr).toEqual([1, 2, 3])
      arr[0] = 999
      expect(st.get(0)).toBe(1)
    })

    it('should reflect point updates', () => {
      const st = new SegmentTreeLazy([1, 2, 3])
      st.update(1, 99)
      expect(st.toArray()).toEqual([1, 99, 3])
    })

    it('should reflect range adds', () => {
      const st = new SegmentTreeLazy([1, 2, 3])
      st.rangeAdd(0, 2, 5)
      expect(st.toArray()).toEqual([6, 7, 8])
    })

    it('should reflect range sets', () => {
      const st = new SegmentTreeLazy([1, 2, 3])
      st.rangeSet(0, 2, 10)
      expect(st.toArray()).toEqual([10, 10, 10])
    })

    it('should reflect mixed operations', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      st.rangeAdd(0, 4, 1)
      st.rangeSet(1, 3, 0)
      st.update(4, 100)
      expect(st.toArray()).toEqual([2, 0, 0, 0, 100])
    })
  })

  describe('clone', () => {
    it('should create independent copy', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      const cloned = st.clone()
      expect(cloned.toArray()).toEqual([1, 2, 3, 4, 5])
      expect(cloned.size()).toBe(5)
    })

    it('should be independent from original after update', () => {
      const st = new SegmentTreeLazy([1, 2, 3])
      const cloned = st.clone()
      st.update(0, 99)
      expect(st.get(0)).toBe(99)
      expect(cloned.get(0)).toBe(1)
    })

    it('should be independent from original after rangeAdd', () => {
      const st = new SegmentTreeLazy([1, 2, 3])
      const cloned = st.clone()
      st.rangeAdd(0, 2, 10)
      expect(st.toArray()).toEqual([11, 12, 13])
      expect(cloned.toArray()).toEqual([1, 2, 3])
    })

    it('should be independent from original after rangeSet', () => {
      const st = new SegmentTreeLazy([1, 2, 3])
      const cloned = st.clone()
      st.rangeSet(0, 2, 0)
      expect(st.toArray()).toEqual([0, 0, 0])
      expect(cloned.toArray()).toEqual([1, 2, 3])
    })

    it('should clone empty tree', () => {
      const st = new SegmentTreeLazy([])
      const cloned = st.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.toArray()).toEqual([])
    })

    it('should preserve query behavior', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      const cloned = st.clone()
      expect(cloned.query(0, 4)).toBe(st.query(0, 4))
      expect(cloned.query(1, 3)).toBe(st.query(1, 3))
    })

    it('should preserve combine function from min tree', () => {
      const st = SegmentTreeLazy.createMin([5, 3, 8, 1, 9])
      const cloned = st.clone()
      cloned.rangeAdd(0, 4, 1)
      expect(cloned.query(0, 4)).toBe(2)
      expect(st.query(0, 4)).toBe(1)
    })

    it('should preserve combine function from max tree', () => {
      const st = SegmentTreeLazy.createMax([5, 3, 8, 1, 9])
      const cloned = st.clone()
      cloned.rangeAdd(0, 4, 1)
      expect(cloned.query(0, 4)).toBe(10)
      expect(st.query(0, 4)).toBe(9)
    })
  })

  describe('createSum specific', () => {
    it('should compute correct sum after multiple adds', () => {
      const st = SegmentTreeLazy.createSum([0, 0, 0, 0, 0])
      st.rangeAdd(0, 4, 1)
      st.rangeAdd(0, 2, 2)
      st.rangeAdd(3, 4, 3)
      expect(st.toArray()).toEqual([3, 3, 3, 4, 4])
      expect(st.query(0, 4)).toBe(17)
    })

    it('should compute correct sum after set and add', () => {
      const st = SegmentTreeLazy.createSum([1, 2, 3, 4, 5])
      st.rangeSet(0, 2, 0)
      st.rangeAdd(0, 4, 1)
      expect(st.toArray()).toEqual([1, 1, 1, 5, 6])
      expect(st.query(0, 4)).toBe(14)
    })

    it('should handle sum with floating point', () => {
      const st = SegmentTreeLazy.createSum([1.1, 2.2, 3.3])
      st.rangeAdd(0, 2, 0.1)
      expect(st.query(0, 2)).toBeCloseTo(6.9)
    })
  })

  describe('createMin specific', () => {
    it('should find min after range add', () => {
      const st = SegmentTreeLazy.createMin([5, 3, 8, 1, 9])
      st.rangeAdd(0, 4, 10)
      expect(st.query(0, 4)).toBe(11)
      expect(st.toArray()).toEqual([15, 13, 18, 11, 19])
    })

    it('should find min after range set', () => {
      const st = SegmentTreeLazy.createMin([5, 3, 8, 1, 9])
      st.rangeSet(0, 4, 5)
      expect(st.query(0, 4)).toBe(5)
    })

    it('should find min after point update', () => {
      const st = SegmentTreeLazy.createMin([5, 3, 8, 1, 9])
      st.update(3, 100)
      expect(st.query(0, 4)).toBe(3)
    })

    it('should find min in subrange', () => {
      const st = SegmentTreeLazy.createMin([5, 3, 8, 1, 9])
      st.rangeAdd(0, 4, 1)
      expect(st.query(0, 2)).toBe(4)
      expect(st.query(3, 4)).toBe(2)
    })

    it('should handle min after set then add', () => {
      const st = SegmentTreeLazy.createMin([5, 3, 8, 1, 9])
      st.rangeSet(0, 4, 10)
      st.rangeAdd(0, 4, -5)
      expect(st.query(0, 4)).toBe(5)
    })

    it('should return identity for empty tree query', () => {
      const st = SegmentTreeLazy.createMin([])
      expect(st.query(0, 0)).toBe(Infinity)
    })
  })

  describe('createMax specific', () => {
    it('should find max after range add', () => {
      const st = SegmentTreeLazy.createMax([5, 3, 8, 1, 9])
      st.rangeAdd(0, 4, 10)
      expect(st.query(0, 4)).toBe(19)
    })

    it('should find max after range set', () => {
      const st = SegmentTreeLazy.createMax([5, 3, 8, 1, 9])
      st.rangeSet(0, 4, 5)
      expect(st.query(0, 4)).toBe(5)
    })

    it('should find max after point update', () => {
      const st = SegmentTreeLazy.createMax([5, 3, 8, 1, 9])
      st.update(0, 100)
      expect(st.query(0, 4)).toBe(100)
    })

    it('should find max in subrange', () => {
      const st = SegmentTreeLazy.createMax([5, 3, 8, 1, 9])
      st.rangeAdd(0, 4, 1)
      expect(st.query(0, 2)).toBe(9)
      expect(st.query(3, 4)).toBe(10)
    })

    it('should handle max after set then add', () => {
      const st = SegmentTreeLazy.createMax([5, 3, 8, 1, 9])
      st.rangeSet(0, 4, 10)
      st.rangeAdd(0, 4, 5)
      expect(st.query(0, 4)).toBe(15)
    })

    it('should return identity for empty tree query', () => {
      const st = SegmentTreeLazy.createMax([])
      expect(st.query(0, 0)).toBe(-Infinity)
    })
  })

  describe('edge cases', () => {
    it('should handle power-of-two sized arrays', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4])
      st.rangeAdd(0, 3, 1)
      expect(st.toArray()).toEqual([2, 3, 4, 5])
    })

    it('should handle non-power-of-two sized arrays', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5, 6, 7])
      st.rangeAdd(0, 6, 1)
      expect(st.toArray()).toEqual([2, 3, 4, 5, 6, 7, 8])
    })

    it('should handle single element with rangeAdd', () => {
      const st = new SegmentTreeLazy([5])
      st.rangeAdd(0, 0, 10)
      expect(st.get(0)).toBe(15)
    })

    it('should handle single element with rangeSet', () => {
      const st = new SegmentTreeLazy([5])
      st.rangeSet(0, 0, 10)
      expect(st.get(0)).toBe(10)
    })

    it('should handle two elements with rangeAdd', () => {
      const st = new SegmentTreeLazy([1, 2])
      st.rangeAdd(0, 1, 5)
      expect(st.toArray()).toEqual([6, 7])
    })

    it('should handle two elements with rangeSet', () => {
      const st = new SegmentTreeLazy([1, 2])
      st.rangeSet(0, 1, 5)
      expect(st.toArray()).toEqual([5, 5])
    })

    it('should handle all identical values', () => {
      const st = new SegmentTreeLazy([7, 7, 7, 7, 7])
      st.rangeAdd(0, 4, 3)
      expect(st.toArray()).toEqual([10, 10, 10, 10, 10])
    })

    it('should handle all zeros', () => {
      const st = new SegmentTreeLazy([0, 0, 0, 0])
      st.rangeAdd(0, 3, 5)
      expect(st.toArray()).toEqual([5, 5, 5, 5])
    })

    it('should handle very large numbers', () => {
      const st = new SegmentTreeLazy([Number.MAX_SAFE_INTEGER, 0, Number.MAX_SAFE_INTEGER])
      expect(st.query(0, 2)).toBe(2 * Number.MAX_SAFE_INTEGER)
    })

    it('should handle very small numbers', () => {
      const st = new SegmentTreeLazy([Number.MIN_SAFE_INTEGER, 0, Number.MIN_SAFE_INTEGER])
      expect(st.query(0, 2)).toBe(2 * Number.MIN_SAFE_INTEGER)
    })

    it('should handle point update after lazy operations', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      st.rangeAdd(0, 4, 10)
      st.update(2, 0)
      expect(st.toArray()).toEqual([11, 12, 0, 14, 15])
    })

    it('should handle query after lazy operations', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      st.rangeAdd(0, 2, 5)
      expect(st.query(0, 4)).toBe(6 + 7 + 8 + 4 + 5)
    })

    it('should handle get after multiple lazy ops', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      st.rangeAdd(0, 4, 1)
      st.rangeSet(1, 3, 0)
      st.rangeAdd(0, 4, 2)
      expect(st.get(0)).toBe(4)
      expect(st.get(1)).toBe(2)
      expect(st.get(2)).toBe(2)
      expect(st.get(3)).toBe(2)
      expect(st.get(4)).toBe(8)
    })
  })

  describe('large arrays', () => {
    it('should handle 1000 elements with rangeAdd', () => {
      const data = Array.from({ length: 1000 }, (_, i) => i + 1)
      const st = SegmentTreeLazy.createSum(data)
      st.rangeAdd(0, 999, 1)
      expect(st.query(0, 999)).toBe(500500 + 1000)
    })

    it('should handle 1000 elements with rangeSet', () => {
      const data = Array.from({ length: 1000 }, (_, i) => i + 1)
      const st = SegmentTreeLazy.createSum(data)
      st.rangeSet(0, 999, 1)
      expect(st.query(0, 999)).toBe(1000)
    })

    it('should handle alternating updates and queries on large array', () => {
      const data = Array.from({ length: 100 }, (_, i) => i + 1)
      const st = new SegmentTreeLazy(data)
      for (let i = 0; i < 50; i++) {
        st.update(i, i * 10)
      }
      expect(st.get(0)).toBe(0)
      expect(st.get(49)).toBe(490)
      expect(st.get(50)).toBe(51)
    })

    it('should handle range queries on large array', () => {
      const data = Array.from({ length: 1000 }, (_, i) => i + 1)
      const st = new SegmentTreeLazy(data)
      expect(st.query(100, 199)).toBe(15050)
    })

    it('should handle many range adds', () => {
      const st = SegmentTreeLazy.createSum(Array(100).fill(0))
      for (let i = 0; i < 50; i++) {
        st.rangeAdd(i, i + 50, 1)
      }
      expect(st.query(0, 99)).toBe(2550)
    })

    it('should handle partial range operations on large array', () => {
      const data = Array.from({ length: 1000 }, (_, i) => i + 1)
      const st = new SegmentTreeLazy(data)
      st.rangeAdd(100, 199, 10)
      expect(st.query(100, 199)).toBe(15050 + 1000)
      expect(st.query(0, 99)).toBe(5050)
      expect(st.query(200, 999)).toBe(480400)
    })
  })

  describe('combined operations', () => {
    it('should handle update then rangeAdd then query', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      st.update(2, 10)
      st.rangeAdd(0, 4, 5)
      expect(st.query(0, 4)).toBe(6 + 7 + 15 + 9 + 10)
    })

    it('should handle rangeSet then update then rangeAdd', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      st.rangeSet(0, 4, 0)
      st.update(2, 10)
      st.rangeAdd(0, 4, 1)
      expect(st.toArray()).toEqual([1, 1, 11, 1, 1])
    })

    it('should handle multiple range sets and adds interleaved', () => {
      const st = new SegmentTreeLazy([0, 0, 0, 0, 0])
      st.rangeAdd(0, 4, 1)
      st.rangeSet(1, 3, 10)
      st.rangeAdd(0, 4, 2)
      st.rangeSet(0, 1, 0)
      expect(st.toArray()).toEqual([0, 0, 12, 12, 3])
    })

    it('should maintain consistency with min tree', () => {
      const st = SegmentTreeLazy.createMin([10, 20, 30, 40, 50])
      st.rangeAdd(0, 4, -5)
      expect(st.query(0, 4)).toBe(5)
      st.rangeSet(2, 4, 1)
      expect(st.query(0, 4)).toBe(1)
      st.update(0, -10)
      expect(st.query(0, 4)).toBe(-10)
    })

    it('should maintain consistency with max tree', () => {
      const st = SegmentTreeLazy.createMax([10, 20, 30, 40, 50])
      st.rangeAdd(0, 4, 5)
      expect(st.query(0, 4)).toBe(55)
      st.rangeSet(2, 4, 1)
      expect(st.query(0, 4)).toBe(25)
      st.update(0, 100)
      expect(st.query(0, 4)).toBe(100)
    })

    it('should handle clone after operations', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      st.rangeAdd(0, 4, 10)
      const cloned = st.clone()
      expect(cloned.toArray()).toEqual([11, 12, 13, 14, 15])
      st.update(0, 0)
      expect(cloned.get(0)).toBe(11)
      expect(st.get(0)).toBe(0)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_SEGMENT_TREE_LAZY_OPTIONS', () => {
      expect(DEFAULT_SEGMENT_TREE_LAZY_OPTIONS.identity).toBe(0)
      expect(DEFAULT_SEGMENT_TREE_LAZY_OPTIONS.combine(1, 2)).toBe(3)
    })

    it('should export SUM_OPTIONS', () => {
      expect(SUM_OPTIONS.identity).toBe(0)
      expect(SUM_OPTIONS.combine(5, 3)).toBe(8)
    })

    it('should export MIN_OPTIONS', () => {
      expect(MIN_OPTIONS.identity).toBe(Infinity)
      expect(MIN_OPTIONS.combine(5, 3)).toBe(3)
    })

    it('should export MAX_OPTIONS', () => {
      expect(MAX_OPTIONS.identity).toBe(-Infinity)
      expect(MAX_OPTIONS.combine(5, 3)).toBe(5)
    })

    it('should support SegmentTreeLazyOptions interface', () => {
      const opts: SegmentTreeLazyOptions = { identity: 1, combine: (a, b) => a * b }
      expect(opts.identity).toBe(1)
      expect(opts.combine(3, 4)).toBe(12)
    })
  })

  describe('custom combine function', () => {
    it('should support multiply combine', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5], {
        identity: 1,
        combine: (a, b) => a * b,
      })
      expect(st.query(0, 4)).toBe(120)
      st.update(2, 10)
      expect(st.query(0, 4)).toBe(400)
    })

    it('should support custom XOR combine', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5], {
        identity: 0,
        combine: (a, b) => a ^ b,
      })
      expect(st.query(0, 4)).toBe(1 ^ 2 ^ 3 ^ 4 ^ 5)
    })

    it('should support custom max combine', () => {
      const st = new SegmentTreeLazy([3, 1, 4, 1, 5], {
        identity: -Infinity,
        combine: (a, b) => Math.max(a, b),
      })
      expect(st.query(0, 4)).toBe(5)
      st.update(1, 10)
      expect(st.query(0, 4)).toBe(10)
    })
  })

  describe('lazy propagation correctness', () => {
    it('should propagate lazily on query after rangeAdd', () => {
      const st = new SegmentTreeLazy([0, 0, 0, 0, 0, 0, 0, 0])
      st.rangeAdd(0, 7, 1)
      st.rangeAdd(0, 3, 1)
      expect(st.query(0, 3)).toBe(8)
      expect(st.query(4, 7)).toBe(4)
    })

    it('should propagate lazily on get after rangeAdd', () => {
      const st = new SegmentTreeLazy([0, 0, 0, 0, 0, 0, 0, 0])
      st.rangeAdd(0, 7, 5)
      st.rangeAdd(4, 7, 3)
      expect(st.get(0)).toBe(5)
      expect(st.get(7)).toBe(8)
    })

    it('should propagate lazily on update after rangeAdd', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      st.rangeAdd(0, 4, 10)
      st.update(2, 100)
      expect(st.toArray()).toEqual([11, 12, 100, 14, 15])
    })

    it('should handle rangeSet that splits existing lazy', () => {
      const st = new SegmentTreeLazy([0, 0, 0, 0, 0, 0, 0, 0])
      st.rangeAdd(0, 7, 5)
      st.rangeSet(2, 5, 0)
      expect(st.toArray()).toEqual([5, 5, 0, 0, 0, 0, 5, 5])
    })

    it('should handle nested lazy propagation', () => {
      const st = new SegmentTreeLazy([0, 0, 0, 0, 0, 0, 0, 0])
      st.rangeAdd(0, 7, 1)
      st.rangeAdd(0, 3, 1)
      st.rangeAdd(0, 1, 1)
      expect(st.toArray()).toEqual([3, 3, 2, 2, 1, 1, 1, 1])
    })

    it('should handle rangeSet overriding pending rangeAdd', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      st.rangeAdd(0, 4, 10)
      st.rangeSet(0, 4, 0)
      expect(st.toArray()).toEqual([0, 0, 0, 0, 0])
    })

    it('should handle point update within rangeSet region', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      st.rangeSet(0, 4, 10)
      st.update(2, 99)
      expect(st.toArray()).toEqual([10, 10, 99, 10, 10])
    })

    it('should handle multiple partial overlapping operations', () => {
      const st = new SegmentTreeLazy([0, 0, 0, 0, 0, 0])
      st.rangeAdd(0, 5, 1)
      st.rangeAdd(2, 4, 2)
      st.rangeSet(3, 5, 0)
      st.rangeAdd(1, 3, 5)
      expect(st.toArray()).toEqual([1, 6, 8, 5, 0, 0])
    })
  })

  describe('min tree with lazy propagation', () => {
    it('should handle rangeAdd on min tree', () => {
      const st = SegmentTreeLazy.createMin([5, 3, 8, 1, 9])
      st.rangeAdd(0, 4, 10)
      expect(st.query(0, 4)).toBe(11)
      expect(st.query(0, 2)).toBe(13)
    })

    it('should handle rangeSet on min tree', () => {
      const st = SegmentTreeLazy.createMin([5, 3, 8, 1, 9])
      st.rangeSet(0, 4, 5)
      expect(st.query(0, 4)).toBe(5)
    })

    it('should handle partial rangeSet on min tree', () => {
      const st = SegmentTreeLazy.createMin([5, 3, 8, 1, 9])
      st.rangeSet(0, 2, 2)
      expect(st.query(0, 4)).toBe(1)
      expect(st.query(0, 2)).toBe(2)
    })

    it('should handle point update after rangeAdd on min tree', () => {
      const st = SegmentTreeLazy.createMin([5, 3, 8, 1, 9])
      st.rangeAdd(0, 4, 1)
      st.update(3, 0)
      expect(st.query(0, 4)).toBe(0)
    })
  })

  describe('max tree with lazy propagation', () => {
    it('should handle rangeAdd on max tree', () => {
      const st = SegmentTreeLazy.createMax([5, 3, 8, 1, 9])
      st.rangeAdd(0, 4, 10)
      expect(st.query(0, 4)).toBe(19)
      expect(st.query(0, 2)).toBe(18)
    })

    it('should handle rangeSet on max tree', () => {
      const st = SegmentTreeLazy.createMax([5, 3, 8, 1, 9])
      st.rangeSet(0, 4, 5)
      expect(st.query(0, 4)).toBe(5)
    })

    it('should handle partial rangeSet on max tree', () => {
      const st = SegmentTreeLazy.createMax([5, 3, 8, 1, 9])
      st.rangeSet(3, 4, 20)
      expect(st.query(0, 4)).toBe(20)
      expect(st.query(0, 2)).toBe(8)
    })

    it('should handle point update after rangeAdd on max tree', () => {
      const st = SegmentTreeLazy.createMax([5, 3, 8, 1, 9])
      st.rangeAdd(0, 4, 1)
      st.update(0, 100)
      expect(st.query(0, 4)).toBe(100)
    })
  })

  describe('stress-like tests', () => {
    it('should handle alternating add and set on same range', () => {
      const st = new SegmentTreeLazy([0, 0, 0, 0, 0])
      for (let i = 0; i < 10; i++) {
        st.rangeAdd(0, 4, 1)
      }
      st.rangeSet(0, 4, 0)
      for (let i = 0; i < 5; i++) {
        st.rangeAdd(0, 4, 2)
      }
      expect(st.toArray()).toEqual([10, 10, 10, 10, 10])
    })

    it('should handle many interleaved operations', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5, 6, 7, 8])
      st.rangeAdd(0, 3, 1)
      st.rangeSet(4, 7, 0)
      st.update(0, 10)
      st.rangeAdd(0, 7, 2)
      st.rangeSet(2, 5, 1)
      expect(st.get(0)).toBe(12)
      expect(st.get(1)).toBe(5)
      expect(st.get(2)).toBe(1)
      expect(st.get(3)).toBe(1)
      expect(st.get(4)).toBe(1)
      expect(st.get(5)).toBe(1)
      expect(st.get(6)).toBe(2)
      expect(st.get(7)).toBe(2)
    })

    it('should handle range add on non-power-of-two boundary', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5, 6, 7])
      st.rangeAdd(0, 6, 1)
      st.rangeAdd(1, 5, 2)
      st.rangeAdd(3, 3, 10)
      expect(st.toArray()).toEqual([2, 5, 6, 17, 8, 9, 8])
    })

    it('should handle clone then modify both', () => {
      const st = new SegmentTreeLazy([1, 2, 3, 4, 5])
      const cloned = st.clone()
      st.rangeAdd(0, 2, 10)
      cloned.rangeSet(3, 4, 0)
      expect(st.toArray()).toEqual([11, 12, 13, 4, 5])
      expect(cloned.toArray()).toEqual([1, 2, 3, 0, 0])
    })
  })
})
