import { describe, it, expect, beforeEach } from 'vitest'
import { SegmentTree } from '../../src/core/segment-tree/segment-tree.js'
import { DEFAULT_SEGMENT_TREE_OPTIONS } from '../../src/core/segment-tree/types.js'
import type { SegmentTreeOptions } from '../../src/core/segment-tree/types.js'

describe('SegmentTree', () => {
  let st: SegmentTree

  beforeEach(() => {
    st = new SegmentTree()
  })

  describe('constructor', () => {
    it('should create an empty segment tree with default options', () => {
      const t = new SegmentTree()
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should accept custom options', () => {
      const t = new SegmentTree({ defaultValue: -1 })
      t.build([1, 2, 3])
      t.clear()
      expect(t.size()).toBe(0)
    })

    it('should use default defaultValue of 0', () => {
      expect(DEFAULT_SEGMENT_TREE_OPTIONS.defaultValue).toBe(0)
    })

    it('should accept partial options', () => {
      const t = new SegmentTree({})
      t.build([5])
      expect(t.size()).toBe(1)
    })
  })

  describe('build', () => {
    it('should build from an empty array', () => {
      st.build([])
      expect(st.size()).toBe(0)
      expect(st.isEmpty()).toBe(true)
    })

    it('should build from a single element array', () => {
      st.build([42])
      expect(st.size()).toBe(1)
      expect(st.queryAll()).toBe(42)
    })

    it('should build from multiple elements', () => {
      st.build([1, 2, 3, 4, 5])
      expect(st.size()).toBe(5)
      expect(st.queryAll()).toBe(15)
    })

    it('should build from two elements', () => {
      st.build([10, 20])
      expect(st.size()).toBe(2)
      expect(st.queryAll()).toBe(30)
    })

    it('should build from large array', () => {
      const data = Array.from({ length: 1000 }, (_, i) => i + 1)
      st.build(data)
      expect(st.size()).toBe(1000)
      expect(st.queryAll()).toBe(500500)
    })

    it('should handle negative values', () => {
      st.build([-1, -2, -3, -4])
      expect(st.queryAll()).toBe(-10)
    })

    it('should handle mixed positive and negative values', () => {
      st.build([5, -3, 2, -1, 4])
      expect(st.queryAll()).toBe(7)
    })

    it('should handle zero values', () => {
      st.build([0, 0, 0])
      expect(st.queryAll()).toBe(0)
    })

    it('should handle floating point values', () => {
      st.build([1.5, 2.5, 3.0])
      expect(st.queryAll()).toBeCloseTo(7.0)
    })

    it('should rebuild when called again', () => {
      st.build([1, 2, 3])
      expect(st.queryAll()).toBe(6)
      st.build([10, 20, 30])
      expect(st.queryAll()).toBe(60)
    })

    it('should return void', () => {
      expect(st.build([1, 2, 3])).toBeUndefined()
    })

    it('should handle power-of-two sized arrays', () => {
      st.build([1, 2, 3, 4])
      expect(st.query(0, 3)).toBe(10)
    })

    it('should handle non-power-of-two sized arrays', () => {
      st.build([1, 2, 3, 4, 5, 6, 7])
      expect(st.query(0, 6)).toBe(28)
    })
  })

  describe('query (sum)', () => {
    beforeEach(() => {
      st.build([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('should query entire range', () => {
      expect(st.query(0, 9)).toBe(55)
    })

    it('should query single element', () => {
      expect(st.query(0, 0)).toBe(1)
      expect(st.query(5, 5)).toBe(6)
      expect(st.query(9, 9)).toBe(10)
    })

    it('should query partial range from start', () => {
      expect(st.query(0, 4)).toBe(15)
    })

    it('should query partial range to end', () => {
      expect(st.query(5, 9)).toBe(40)
    })

    it('should query middle range', () => {
      expect(st.query(2, 6)).toBe(25)
    })

    it('should query two adjacent elements', () => {
      expect(st.query(3, 4)).toBe(9)
    })

    it('should return defaultValue for empty tree', () => {
      const empty = new SegmentTree()
      expect(empty.query(0, 0)).toBe(0)
    })
  })

  describe('query validation', () => {
    beforeEach(() => {
      st.build([1, 2, 3, 4, 5])
    })

    it('should throw for negative start index', () => {
      expect(() => st.query(-1, 3)).toThrow(RangeError)
    })

    it('should throw for end index beyond size', () => {
      expect(() => st.query(0, 5)).toThrow(RangeError)
    })

    it('should throw when start > end', () => {
      expect(() => st.query(3, 1)).toThrow(RangeError)
    })

    it('should throw for both indices out of bounds', () => {
      expect(() => st.query(-2, 10)).toThrow(RangeError)
    })
  })

  describe('queryAll', () => {
    it('should return sum of all elements', () => {
      st.build([1, 2, 3])
      expect(st.queryAll()).toBe(6)
    })

    it('should return defaultValue for empty tree', () => {
      expect(st.queryAll()).toBe(0)
    })

    it('should return correct sum after updates', () => {
      st.build([1, 2, 3])
      st.update(1, 10)
      expect(st.queryAll()).toBe(14)
    })
  })

  describe('update', () => {
    beforeEach(() => {
      st.build([1, 2, 3, 4, 5])
    })

    it('should update first element', () => {
      st.update(0, 10)
      expect(st.get(0)).toBe(10)
      expect(st.queryAll()).toBe(24)
    })

    it('should update last element', () => {
      st.update(4, 50)
      expect(st.get(4)).toBe(50)
      expect(st.queryAll()).toBe(60)
    })

    it('should update middle element', () => {
      st.update(2, 30)
      expect(st.get(2)).toBe(30)
      expect(st.queryAll()).toBe(42)
    })

    it('should update to negative value', () => {
      st.update(1, -5)
      expect(st.get(1)).toBe(-5)
      expect(st.queryAll()).toBe(8)
    })

    it('should update to zero', () => {
      st.update(0, 0)
      expect(st.get(0)).toBe(0)
      expect(st.queryAll()).toBe(14)
    })

    it('should update to floating point', () => {
      st.update(0, 1.5)
      expect(st.get(0)).toBeCloseTo(1.5)
    })

    it('should throw for negative index', () => {
      expect(() => st.update(-1, 5)).toThrow(RangeError)
    })

    it('should throw for index >= size', () => {
      expect(() => st.update(5, 5)).toThrow(RangeError)
    })

    it('should throw for index on empty tree', () => {
      st.clear()
      expect(() => st.update(0, 5)).toThrow(RangeError)
    })

    it('should return void', () => {
      expect(st.update(0, 99)).toBeUndefined()
    })

    it('should reflect in range queries after update', () => {
      st.update(2, 100)
      expect(st.query(1, 3)).toBe(106)
    })
  })

  describe('get', () => {
    beforeEach(() => {
      st.build([10, 20, 30, 40, 50])
    })

    it('should get first element', () => {
      expect(st.get(0)).toBe(10)
    })

    it('should get last element', () => {
      expect(st.get(4)).toBe(50)
    })

    it('should get middle element', () => {
      expect(st.get(2)).toBe(30)
    })

    it('should throw for negative index', () => {
      expect(() => st.get(-1)).toThrow(RangeError)
    })

    it('should throw for index >= size', () => {
      expect(() => st.get(5)).toThrow(RangeError)
    })

    it('should reflect updates', () => {
      st.update(2, 99)
      expect(st.get(2)).toBe(99)
    })
  })

  describe('size', () => {
    it('should return 0 for empty tree', () => {
      expect(st.size()).toBe(0)
    })

    it('should return correct size after build', () => {
      st.build([1, 2, 3])
      expect(st.size()).toBe(3)
    })

    it('should return correct size for single element', () => {
      st.build([1])
      expect(st.size()).toBe(1)
    })

    it('should return 0 after clear', () => {
      st.build([1, 2, 3])
      st.clear()
      expect(st.size()).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new tree', () => {
      expect(st.isEmpty()).toBe(true)
    })

    it('should return false after build', () => {
      st.build([1])
      expect(st.isEmpty()).toBe(false)
    })

    it('should return true after clear', () => {
      st.build([1, 2, 3])
      st.clear()
      expect(st.isEmpty()).toBe(true)
    })

    it('should return true after building empty', () => {
      st.build([])
      expect(st.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear the tree', () => {
      st.build([1, 2, 3])
      st.clear()
      expect(st.size()).toBe(0)
      expect(st.isEmpty()).toBe(true)
    })

    it('should handle clearing empty tree', () => {
      st.clear()
      expect(st.size()).toBe(0)
    })

    it('should allow rebuild after clear', () => {
      st.build([1, 2, 3])
      st.clear()
      st.build([10, 20])
      expect(st.size()).toBe(2)
      expect(st.queryAll()).toBe(30)
    })

    it('should return void', () => {
      expect(st.clear()).toBeUndefined()
    })
  })

  describe('getData', () => {
    it('should return empty array for empty tree', () => {
      expect(st.getData()).toEqual([])
    })

    it('should return copy of data', () => {
      st.build([1, 2, 3])
      const data = st.getData()
      expect(data).toEqual([1, 2, 3])
      data[0] = 999
      expect(st.get(0)).toBe(1)
    })

    it('should reflect updates', () => {
      st.build([1, 2, 3])
      st.update(1, 99)
      expect(st.getData()).toEqual([1, 99, 3])
    })

    it('should return empty after clear', () => {
      st.build([1, 2, 3])
      st.clear()
      expect(st.getData()).toEqual([])
    })
  })

  describe('getRangeMin', () => {
    beforeEach(() => {
      st.build([5, 3, 8, 1, 9, 2, 7, 4, 6])
    })

    it('should find minimum in entire range', () => {
      expect(st.getRangeMin(0, 8)).toBe(1)
    })

    it('should find minimum in partial range', () => {
      expect(st.getRangeMin(0, 3)).toBe(1)
      expect(st.getRangeMin(4, 8)).toBe(2)
    })

    it('should find minimum of single element', () => {
      expect(st.getRangeMin(2, 2)).toBe(8)
    })

    it('should find minimum of two elements', () => {
      expect(st.getRangeMin(0, 1)).toBe(3)
    })

    it('should update minimum after update', () => {
      st.update(3, 100)
      expect(st.getRangeMin(0, 8)).toBe(2)
    })

    it('should return defaultValue for empty tree', () => {
      const empty = new SegmentTree()
      expect(empty.getRangeMin(0, 0)).toBe(0)
    })

    it('should throw for invalid range', () => {
      expect(() => st.getRangeMin(-1, 3)).toThrow(RangeError)
      expect(() => st.getRangeMin(0, 9)).toThrow(RangeError)
    })
  })

  describe('getRangeMax', () => {
    beforeEach(() => {
      st.build([5, 3, 8, 1, 9, 2, 7, 4, 6])
    })

    it('should find maximum in entire range', () => {
      expect(st.getRangeMax(0, 8)).toBe(9)
    })

    it('should find maximum in partial range', () => {
      expect(st.getRangeMax(0, 3)).toBe(8)
      expect(st.getRangeMax(4, 8)).toBe(9)
    })

    it('should find maximum of single element', () => {
      expect(st.getRangeMax(2, 2)).toBe(8)
    })

    it('should find maximum of two elements', () => {
      expect(st.getRangeMax(0, 1)).toBe(5)
    })

    it('should update maximum after update', () => {
      st.update(0, 100)
      expect(st.getRangeMax(0, 8)).toBe(100)
    })

    it('should return defaultValue for empty tree', () => {
      const empty = new SegmentTree()
      expect(empty.getRangeMax(0, 0)).toBe(0)
    })

    it('should throw for invalid range', () => {
      expect(() => st.getRangeMax(-1, 3)).toThrow(RangeError)
      expect(() => st.getRangeMax(0, 9)).toThrow(RangeError)
    })
  })

  describe('getRangeSum', () => {
    beforeEach(() => {
      st.build([1, 2, 3, 4, 5])
    })

    it('should compute sum for entire range', () => {
      expect(st.getRangeSum(0, 4)).toBe(15)
    })

    it('should compute sum for partial range', () => {
      expect(st.getRangeSum(1, 3)).toBe(9)
    })

    it('should compute sum for single element', () => {
      expect(st.getRangeSum(2, 2)).toBe(3)
    })

    it('should be alias for query', () => {
      expect(st.getRangeSum(0, 4)).toBe(st.query(0, 4))
      expect(st.getRangeSum(1, 3)).toBe(st.query(1, 3))
    })
  })

  describe('combined operations', () => {
    it('should maintain consistency across multiple updates', () => {
      st.build([1, 2, 3, 4, 5])
      st.update(0, 10)
      st.update(2, 30)
      st.update(4, 50)
      expect(st.queryAll()).toBe(96)
      expect(st.getRangeMin(0, 4)).toBe(2)
      expect(st.getRangeMax(0, 4)).toBe(50)
      expect(st.getData()).toEqual([10, 2, 30, 4, 50])
    })

    it('should handle build after operations', () => {
      st.build([1, 2, 3])
      st.update(0, 100)
      st.build([10, 20, 30, 40])
      expect(st.queryAll()).toBe(100)
      expect(st.get(0)).toBe(10)
    })

    it('should support negative numbers in all operations', () => {
      st.build([-5, 10, -3, 8, -1])
      expect(st.queryAll()).toBe(9)
      expect(st.getRangeMin(0, 4)).toBe(-5)
      expect(st.getRangeMax(0, 4)).toBe(10)
      st.update(2, 20)
      expect(st.queryAll()).toBe(32)
      expect(st.getRangeMin(0, 4)).toBe(-5)
      expect(st.getRangeMax(0, 4)).toBe(20)
    })
  })

  describe('edge cases', () => {
    it('should handle array of identical values', () => {
      st.build([7, 7, 7, 7, 7])
      expect(st.queryAll()).toBe(35)
      expect(st.getRangeMin(0, 4)).toBe(7)
      expect(st.getRangeMax(0, 4)).toBe(7)
    })

    it('should handle single element', () => {
      st.build([42])
      expect(st.query(0, 0)).toBe(42)
      expect(st.getRangeMin(0, 0)).toBe(42)
      expect(st.getRangeMax(0, 0)).toBe(42)
      expect(st.getRangeSum(0, 0)).toBe(42)
      expect(st.queryAll()).toBe(42)
    })

    it('should handle two elements', () => {
      st.build([3, 7])
      expect(st.query(0, 1)).toBe(10)
      expect(st.getRangeMin(0, 1)).toBe(3)
      expect(st.getRangeMax(0, 1)).toBe(7)
    })

    it('should handle very large numbers', () => {
      st.build([Number.MAX_SAFE_INTEGER, 0, Number.MAX_SAFE_INTEGER])
      expect(st.getRangeMax(0, 2)).toBe(Number.MAX_SAFE_INTEGER)
    })

    it('should handle very small numbers', () => {
      st.build([Number.MIN_SAFE_INTEGER, 0, Number.MIN_SAFE_INTEGER])
      expect(st.getRangeMin(0, 2)).toBe(Number.MIN_SAFE_INTEGER)
    })

    it('should handle all zeros', () => {
      st.build([0, 0, 0, 0])
      expect(st.queryAll()).toBe(0)
      expect(st.getRangeMin(0, 3)).toBe(0)
      expect(st.getRangeMax(0, 3)).toBe(0)
    })
  })

  describe('large arrays', () => {
    it('should handle 1000 elements', () => {
      const data = Array.from({ length: 1000 }, (_, i) => i + 1)
      st.build(data)
      expect(st.queryAll()).toBe(500500)
      expect(st.getRangeMin(0, 999)).toBe(1)
      expect(st.getRangeMax(0, 999)).toBe(1000)
    })

    it('should handle updates on large array', () => {
      const data = Array.from({ length: 500 }, (_, i) => i + 1)
      st.build(data)
      st.update(0, 1000)
      expect(st.get(0)).toBe(1000)
      expect(st.getRangeMax(0, 499)).toBe(1000)
    })

    it('should handle range queries on large array', () => {
      const data = Array.from({ length: 1000 }, (_, i) => i + 1)
      st.build(data)
      expect(st.query(100, 199)).toBe(15050)
      expect(st.getRangeMin(100, 199)).toBe(101)
      expect(st.getRangeMax(100, 199)).toBe(200)
    })

    it('should handle alternating updates and queries', () => {
      const data = Array.from({ length: 100 }, (_, i) => i + 1)
      st.build(data)
      for (let i = 0; i < 50; i++) {
        st.update(i, i * 10)
      }
      expect(st.get(0)).toBe(0)
      expect(st.get(49)).toBe(490)
      expect(st.get(50)).toBe(51)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_SEGMENT_TREE_OPTIONS', () => {
      expect(DEFAULT_SEGMENT_TREE_OPTIONS.defaultValue).toBe(0)
    })

    it('should support SegmentTreeOptions interface', () => {
      const opts: SegmentTreeOptions = { defaultValue: 5 }
      expect(opts.defaultValue).toBe(5)
    })

    it('should use custom defaultValue', () => {
      const t = new SegmentTree({ defaultValue: -999 })
      expect(t.queryAll()).toBe(-999)
    })
  })

  describe('rebuild scenarios', () => {
    it('should rebuild from larger to smaller array', () => {
      st.build([1, 2, 3, 4, 5])
      expect(st.size()).toBe(5)
      st.build([10, 20])
      expect(st.size()).toBe(2)
      expect(st.queryAll()).toBe(30)
    })

    it('should rebuild from smaller to larger array', () => {
      st.build([1, 2])
      expect(st.size()).toBe(2)
      st.build([1, 2, 3, 4, 5, 6, 7, 8])
      expect(st.size()).toBe(8)
      expect(st.queryAll()).toBe(36)
    })

    it('should rebuild to empty', () => {
      st.build([1, 2, 3])
      st.build([])
      expect(st.size()).toBe(0)
      expect(st.isEmpty()).toBe(true)
    })
  })

  describe('min/max after updates', () => {
    beforeEach(() => {
      st.build([5, 10, 15, 20, 25])
    })

    it('should update min after lowering a value', () => {
      st.update(2, 1)
      expect(st.getRangeMin(0, 4)).toBe(1)
    })

    it('should update max after raising a value', () => {
      st.update(0, 100)
      expect(st.getRangeMax(0, 4)).toBe(100)
    })

    it('should update min after raising the minimum value', () => {
      st.update(0, 30)
      expect(st.getRangeMin(0, 4)).toBe(10)
    })

    it('should update max after lowering the maximum value', () => {
      st.update(4, 5)
      expect(st.getRangeMax(0, 4)).toBe(20)
    })

    it('should handle range-specific min/max after updates', () => {
      st.update(1, 50)
      expect(st.getRangeMin(0, 2)).toBe(5)
      expect(st.getRangeMax(0, 2)).toBe(50)
      expect(st.getRangeMin(3, 4)).toBe(20)
      expect(st.getRangeMax(3, 4)).toBe(25)
    })
  })

  describe('query precision', () => {
    it('should handle sequential range queries', () => {
      st.build([1, 2, 3, 4, 5, 6, 7, 8])
      expect(st.query(0, 1)).toBe(3)
      expect(st.query(2, 3)).toBe(7)
      expect(st.query(4, 5)).toBe(11)
      expect(st.query(6, 7)).toBe(15)
    })

    it('should handle overlapping range queries', () => {
      st.build([1, 2, 3, 4, 5])
      expect(st.query(0, 3)).toBe(10)
      expect(st.query(1, 4)).toBe(14)
      expect(st.query(2, 4)).toBe(12)
    })

    it('should handle min queries on different ranges', () => {
      st.build([8, 3, 9, 1, 5, 7, 2, 6])
      expect(st.getRangeMin(0, 3)).toBe(1)
      expect(st.getRangeMin(4, 7)).toBe(2)
      expect(st.getRangeMin(1, 2)).toBe(3)
    })

    it('should handle max queries on different ranges', () => {
      st.build([8, 3, 9, 1, 5, 7, 2, 6])
      expect(st.getRangeMax(0, 3)).toBe(9)
      expect(st.getRangeMax(4, 7)).toBe(7)
      expect(st.getRangeMax(1, 2)).toBe(9)
    })
  })
})
