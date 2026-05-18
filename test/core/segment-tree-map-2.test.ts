import { describe, it, expect } from 'vitest'
import { SegmentTreeMap2 } from '../../src/core/segment-tree-map-2/index.js'

describe('SegmentTreeMap2', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('should create a tree with the given size', () => {
      const st = new SegmentTreeMap2(5)
      expect(st.size).toBe(5)
      expect(st.isEmpty()).toBe(false)
    })

    it('should create a tree of size 1', () => {
      const st = new SegmentTreeMap2(1)
      expect(st.size).toBe(1)
    })

    it('should create an empty tree with size 0', () => {
      const st = new SegmentTreeMap2(0)
      expect(st.size).toBe(0)
      expect(st.isEmpty()).toBe(true)
    })

    it('should initialize all values to 0', () => {
      const st = new SegmentTreeMap2(5)
      expect(st.toArray()).toEqual([0, 0, 0, 0, 0])
    })
  })

  // ─── set ───
  describe('set', () => {
    it('should set a value at a given index', () => {
      const st = new SegmentTreeMap2(5)
      st.set(2, 10)
      expect(st.get(2)).toBe(10)
    })

    it('should set values at all indices', () => {
      const st = new SegmentTreeMap2(3)
      st.set(0, 1)
      st.set(1, 2)
      st.set(2, 3)
      expect(st.toArray()).toEqual([1, 2, 3])
    })

    it('should overwrite a previous value', () => {
      const st = new SegmentTreeMap2(3)
      st.set(1, 10)
      st.set(1, 20)
      expect(st.get(1)).toBe(20)
    })

    it('should set a negative value', () => {
      const st = new SegmentTreeMap2(3)
      st.set(0, -5)
      expect(st.get(0)).toBe(-5)
    })

    it('should set zero', () => {
      const st = new SegmentTreeMap2(3)
      st.set(1, 42)
      st.set(1, 0)
      expect(st.get(1)).toBe(0)
    })

    it('should ignore out-of-bounds negative index', () => {
      const st = new SegmentTreeMap2(3)
      st.set(-1, 10)
      expect(st.get(-1)).toBe(0)
    })

    it('should ignore out-of-bounds index equal to size', () => {
      const st = new SegmentTreeMap2(3)
      st.set(3, 10)
      expect(st.toArray()).toEqual([0, 0, 0])
    })
  })

  // ─── get ───
  describe('get', () => {
    it('should return 0 for unset index', () => {
      const st = new SegmentTreeMap2(5)
      expect(st.get(3)).toBe(0)
    })

    it('should return the value after set', () => {
      const st = new SegmentTreeMap2(5)
      st.set(3, 42)
      expect(st.get(3)).toBe(42)
    })

    it('should return 0 for negative index', () => {
      const st = new SegmentTreeMap2(5)
      expect(st.get(-1)).toBe(0)
    })

    it('should return 0 for out-of-bounds index', () => {
      const st = new SegmentTreeMap2(5)
      expect(st.get(5)).toBe(0)
      expect(st.get(100)).toBe(0)
    })
  })

  // ─── queryRange ───
  describe('queryRange', () => {
    it('should return sum of a range', () => {
      const st = new SegmentTreeMap2(5)
      st.set(0, 1)
      st.set(1, 2)
      st.set(2, 3)
      st.set(3, 4)
      st.set(4, 5)
      expect(st.queryRange(0, 4)).toBe(15)
    })

    it('should return sum of a sub-range', () => {
      const st = new SegmentTreeMap2(5)
      st.set(0, 1)
      st.set(1, 2)
      st.set(2, 3)
      st.set(3, 4)
      st.set(4, 5)
      expect(st.queryRange(1, 3)).toBe(9)
    })

    it('should return single element value', () => {
      const st = new SegmentTreeMap2(5)
      st.set(2, 42)
      expect(st.queryRange(2, 2)).toBe(42)
    })

    it('should return 0 for all-unset range', () => {
      const st = new SegmentTreeMap2(5)
      expect(st.queryRange(0, 4)).toBe(0)
    })

    it('should return 0 for invalid range (left > right)', () => {
      const st = new SegmentTreeMap2(5)
      st.set(0, 10)
      expect(st.queryRange(3, 1)).toBe(0)
    })

    it('should return 0 for negative left', () => {
      const st = new SegmentTreeMap2(5)
      expect(st.queryRange(-1, 3)).toBe(0)
    })

    it('should return 0 for right >= size', () => {
      const st = new SegmentTreeMap2(5)
      expect(st.queryRange(0, 5)).toBe(0)
    })

    it('should handle negative values in range', () => {
      const st = new SegmentTreeMap2(3)
      st.set(0, -5)
      st.set(1, 10)
      st.set(2, -3)
      expect(st.queryRange(0, 2)).toBe(2)
    })
  })

  // ─── updateRange ───
  describe('updateRange', () => {
    it('should add delta to a single element', () => {
      const st = new SegmentTreeMap2(5)
      st.set(2, 10)
      st.updateRange(2, 2, 5)
      expect(st.get(2)).toBe(15)
    })

    it('should add delta to a range', () => {
      const st = new SegmentTreeMap2(5)
      st.set(0, 1)
      st.set(1, 2)
      st.set(2, 3)
      st.set(3, 4)
      st.set(4, 5)
      st.updateRange(1, 3, 10)
      expect(st.toArray()).toEqual([1, 12, 13, 14, 5])
    })

    it('should add delta to the entire range', () => {
      const st = new SegmentTreeMap2(3)
      st.set(0, 1)
      st.set(1, 2)
      st.set(2, 3)
      st.updateRange(0, 2, 5)
      expect(st.toArray()).toEqual([6, 7, 8])
    })

    it('should add a negative delta', () => {
      const st = new SegmentTreeMap2(3)
      st.set(0, 10)
      st.set(1, 20)
      st.set(2, 30)
      st.updateRange(0, 2, -5)
      expect(st.toArray()).toEqual([5, 15, 25])
    })

    it('should handle multiple range updates', () => {
      const st = new SegmentTreeMap2(5)
      st.updateRange(0, 4, 1)
      st.updateRange(1, 3, 2)
      expect(st.toArray()).toEqual([1, 3, 3, 3, 1])
    })

    it('should ignore invalid range (left > right)', () => {
      const st = new SegmentTreeMap2(3)
      st.set(0, 5)
      st.updateRange(2, 1, 10)
      expect(st.toArray()).toEqual([5, 0, 0])
    })

    it('should ignore out-of-bounds range', () => {
      const st = new SegmentTreeMap2(3)
      st.updateRange(-1, 2, 10)
      expect(st.toArray()).toEqual([0, 0, 0])
    })

    it('should reflect updateRange in queryRange', () => {
      const st = new SegmentTreeMap2(5)
      st.set(0, 1)
      st.set(1, 2)
      st.set(2, 3)
      st.set(3, 4)
      st.set(4, 5)
      st.updateRange(1, 3, 10)
      expect(st.queryRange(0, 4)).toBe(45)
    })
  })

  // ─── size ───
  describe('size', () => {
    it('should return the constructor size', () => {
      const st = new SegmentTreeMap2(10)
      expect(st.size).toBe(10)
    })
  })

  // ─── isEmpty ───
  describe('isEmpty', () => {
    it('should return true for size 0', () => {
      const st = new SegmentTreeMap2(0)
      expect(st.isEmpty()).toBe(true)
    })

    it('should return false for size > 0', () => {
      const st = new SegmentTreeMap2(1)
      expect(st.isEmpty()).toBe(false)
    })
  })

  // ─── toArray ───
  describe('toArray', () => {
    it('should return empty array for size 0', () => {
      const st = new SegmentTreeMap2(0)
      expect(st.toArray()).toEqual([])
    })

    it('should return all zeros initially', () => {
      const st = new SegmentTreeMap2(4)
      expect(st.toArray()).toEqual([0, 0, 0, 0])
    })

    it('should reflect set values', () => {
      const st = new SegmentTreeMap2(3)
      st.set(0, 10)
      st.set(2, 30)
      expect(st.toArray()).toEqual([10, 0, 30])
    })

    it('should reflect range updates', () => {
      const st = new SegmentTreeMap2(4)
      st.updateRange(0, 3, 5)
      expect(st.toArray()).toEqual([5, 5, 5, 5])
    })
  })

  // ─── Combined Operations ───
  describe('combined operations', () => {
    it('should handle set followed by updateRange', () => {
      const st = new SegmentTreeMap2(5)
      st.set(0, 1)
      st.set(1, 2)
      st.set(2, 3)
      st.set(3, 4)
      st.set(4, 5)
      st.updateRange(1, 3, 10)
      expect(st.get(1)).toBe(12)
      expect(st.get(3)).toBe(14)
      expect(st.get(4)).toBe(5)
    })

    it('should handle updateRange followed by set', () => {
      const st = new SegmentTreeMap2(3)
      st.updateRange(0, 2, 10)
      st.set(1, 0)
      expect(st.toArray()).toEqual([10, 0, 10])
    })

    it('should handle set after get after updateRange', () => {
      const st = new SegmentTreeMap2(4)
      st.set(0, 5)
      st.updateRange(0, 3, 2)
      expect(st.get(0)).toBe(7)
      st.set(0, 100)
      expect(st.get(0)).toBe(100)
      expect(st.queryRange(0, 3)).toBe(100 + 2 + 2 + 2)
    })
  })
})
