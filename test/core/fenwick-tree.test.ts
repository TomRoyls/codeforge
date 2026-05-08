import { describe, it, expect, beforeEach } from 'vitest'
import { FenwickTree } from '../../src/core/fenwick-tree/fenwick-tree.js'
import { DEFAULT_FENWICK_TREE_OPTIONS } from '../../src/core/fenwick-tree/types.js'
import type { FenwickTreeOptions } from '../../src/core/fenwick-tree/types.js'

describe('FenwickTree', () => {
  let ft: FenwickTree

  beforeEach(() => {
    ft = new FenwickTree()
  })

  describe('constructor', () => {
    it('should create an empty tree with no arguments', () => {
      const t = new FenwickTree()
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should create a tree with specified size', () => {
      const t = new FenwickTree(5)
      expect(t.size()).toBe(5)
      expect(t.isEmpty()).toBe(false)
    })

    it('should create a tree with custom options', () => {
      const t = new FenwickTree(3, { defaultValue: 10 })
      expect(t.size()).toBe(3)
      expect(t.get(0)).toBe(10)
    })

    it('should use default defaultValue of 0', () => {
      const t = new FenwickTree(3)
      expect(t.get(0)).toBe(0)
    })

    it('should handle size 0', () => {
      const t = new FenwickTree(0)
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should handle negative size gracefully', () => {
      const t = new FenwickTree(-1)
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should accept partial options', () => {
      const t = new FenwickTree(undefined, {})
      expect(t.size()).toBe(0)
    })
  })

  describe('build', () => {
    it('should build from an array', () => {
      ft.build([1, 2, 3, 4, 5])
      expect(ft.size()).toBe(5)
    })

    it('should produce correct prefix sums after build', () => {
      ft.build([1, 2, 3, 4, 5])
      expect(ft.prefixSum(0)).toBe(1)
      expect(ft.prefixSum(1)).toBe(3)
      expect(ft.prefixSum(4)).toBe(15)
    })

    it('should build from an empty array', () => {
      ft.build([])
      expect(ft.size()).toBe(0)
      expect(ft.isEmpty()).toBe(true)
    })

    it('should build from a single element array', () => {
      ft.build([42])
      expect(ft.size()).toBe(1)
      expect(ft.prefixSum(0)).toBe(42)
    })

    it('should build from array of zeros', () => {
      ft.build([0, 0, 0, 0])
      expect(ft.prefixSum(3)).toBe(0)
    })

    it('should build from array with negative numbers', () => {
      ft.build([-1, 2, -3, 4])
      expect(ft.prefixSum(3)).toBe(2)
      expect(ft.prefixSum(0)).toBe(-1)
      expect(ft.prefixSum(1)).toBe(1)
    })

    it('should rebuild correctly on second call', () => {
      ft.build([1, 2, 3])
      expect(ft.totalSum()).toBe(6)
      ft.build([10, 20, 30, 40])
      expect(ft.totalSum()).toBe(100)
      expect(ft.size()).toBe(4)
    })

    it('should build from large array', () => {
      const data = Array.from({ length: 1000 }, (_, i) => i + 1)
      ft.build(data)
      expect(ft.totalSum()).toBe(500500)
    })

    it('should return void', () => {
      expect(ft.build([1, 2, 3])).toBeUndefined()
    })
  })

  describe('update', () => {
    beforeEach(() => {
      ft.build([1, 2, 3, 4, 5])
    })

    it('should add a delta to an element', () => {
      ft.update(0, 10)
      expect(ft.get(0)).toBe(11)
    })

    it('should update prefix sums correctly', () => {
      ft.update(2, 7)
      expect(ft.prefixSum(2)).toBe(13)
      expect(ft.prefixSum(4)).toBe(22)
    })

    it('should handle negative delta', () => {
      ft.update(0, -1)
      expect(ft.get(0)).toBe(0)
    })

    it('should handle zero delta', () => {
      ft.update(0, 0)
      expect(ft.get(0)).toBe(1)
    })

    it('should throw on negative index', () => {
      expect(() => ft.update(-1, 5)).toThrow(RangeError)
    })

    it('should throw on out of bounds index', () => {
      expect(() => ft.update(5, 5)).toThrow(RangeError)
    })

    it('should throw on equal to size index', () => {
      expect(() => ft.update(5, 1)).toThrow(RangeError)
    })

    it('should return void', () => {
      expect(ft.update(0, 5)).toBeUndefined()
    })

    it('should handle multiple updates', () => {
      ft.update(0, 1)
      ft.update(1, 1)
      ft.update(2, 1)
      expect(ft.prefixSum(4)).toBe(18)
    })
  })

  describe('prefixSum', () => {
    beforeEach(() => {
      ft.build([1, 2, 3, 4, 5])
    })

    it('should return correct prefix sum for index 0', () => {
      expect(ft.prefixSum(0)).toBe(1)
    })

    it('should return correct prefix sum for last index', () => {
      expect(ft.prefixSum(4)).toBe(15)
    })

    it('should return correct prefix sum for middle index', () => {
      expect(ft.prefixSum(2)).toBe(6)
    })

    it('should handle index beyond size', () => {
      expect(ft.prefixSum(100)).toBe(15)
    })

    it('should return default for negative index', () => {
      expect(ft.prefixSum(-1)).toBe(0)
    })

    it('should return default for empty tree', () => {
      const empty = new FenwickTree()
      expect(empty.prefixSum(0)).toBe(0)
    })
  })

  describe('rangeSum', () => {
    beforeEach(() => {
      ft.build([1, 2, 3, 4, 5])
    })

    it('should return correct range sum', () => {
      expect(ft.rangeSum(1, 3)).toBe(9)
    })

    it('should return correct range sum from start', () => {
      expect(ft.rangeSum(0, 4)).toBe(15)
    })

    it('should return single element when start equals end', () => {
      expect(ft.rangeSum(2, 2)).toBe(3)
    })

    it('should return default for inverted range', () => {
      expect(ft.rangeSum(3, 1)).toBe(0)
    })

    it('should return correct sum for first element', () => {
      expect(ft.rangeSum(0, 0)).toBe(1)
    })

    it('should return correct sum for last element', () => {
      expect(ft.rangeSum(4, 4)).toBe(5)
    })

    it('should return correct partial range from beginning', () => {
      expect(ft.rangeSum(0, 2)).toBe(6)
    })

    it('should return correct partial range to end', () => {
      expect(ft.rangeSum(2, 4)).toBe(12)
    })
  })

  describe('get', () => {
    beforeEach(() => {
      ft.build([10, 20, 30, 40, 50])
    })

    it('should return correct value at each index', () => {
      expect(ft.get(0)).toBe(10)
      expect(ft.get(1)).toBe(20)
      expect(ft.get(2)).toBe(30)
      expect(ft.get(3)).toBe(40)
      expect(ft.get(4)).toBe(50)
    })

    it('should throw on negative index', () => {
      expect(() => ft.get(-1)).toThrow(RangeError)
    })

    it('should throw on out of bounds index', () => {
      expect(() => ft.get(5)).toThrow(RangeError)
    })

    it('should reflect updates', () => {
      ft.update(2, 100)
      expect(ft.get(2)).toBe(130)
    })
  })

  describe('set', () => {
    beforeEach(() => {
      ft.build([1, 2, 3, 4, 5])
    })

    it('should set a value at an index', () => {
      ft.set(0, 100)
      expect(ft.get(0)).toBe(100)
    })

    it('should update prefix sums after set', () => {
      ft.set(0, 10)
      expect(ft.prefixSum(4)).toBe(24)
    })

    it('should throw on negative index', () => {
      expect(() => ft.set(-1, 5)).toThrow(RangeError)
    })

    it('should throw on out of bounds index', () => {
      expect(() => ft.set(5, 5)).toThrow(RangeError)
    })

    it('should handle setting same value', () => {
      ft.set(0, 1)
      expect(ft.get(0)).toBe(1)
    })

    it('should return void', () => {
      expect(ft.set(0, 99)).toBeUndefined()
    })

    it('should handle setting negative value', () => {
      ft.set(2, -10)
      expect(ft.get(2)).toBe(-10)
    })
  })

  describe('size', () => {
    it('should return 0 for empty tree', () => {
      expect(ft.size()).toBe(0)
    })

    it('should return correct size after build', () => {
      ft.build([1, 2, 3])
      expect(ft.size()).toBe(3)
    })

    it('should return correct size after constructor with size', () => {
      const t = new FenwickTree(10)
      expect(t.size()).toBe(10)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty tree', () => {
      expect(ft.isEmpty()).toBe(true)
    })

    it('should return false after build', () => {
      ft.build([1])
      expect(ft.isEmpty()).toBe(false)
    })

    it('should return false after constructor with size', () => {
      const t = new FenwickTree(1)
      expect(t.isEmpty()).toBe(false)
    })

    it('should return true after clear', () => {
      ft.build([1, 2, 3])
      ft.clear()
      expect(ft.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear the tree', () => {
      ft.build([1, 2, 3])
      ft.clear()
      expect(ft.size()).toBe(0)
      expect(ft.isEmpty()).toBe(true)
    })

    it('should handle clearing empty tree', () => {
      ft.clear()
      expect(ft.size()).toBe(0)
    })

    it('should allow rebuild after clear', () => {
      ft.build([1, 2, 3])
      ft.clear()
      ft.build([4, 5, 6, 7])
      expect(ft.size()).toBe(4)
      expect(ft.totalSum()).toBe(22)
    })

    it('should return void', () => {
      expect(ft.clear()).toBeUndefined()
    })
  })

  describe('getData', () => {
    it('should return empty array for empty tree', () => {
      expect(ft.getData()).toEqual([])
    })

    it('should return original data after build', () => {
      ft.build([1, 2, 3, 4, 5])
      expect(ft.getData()).toEqual([1, 2, 3, 4, 5])
    })

    it('should reflect updates', () => {
      ft.build([1, 2, 3])
      ft.update(1, 10)
      expect(ft.getData()).toEqual([1, 12, 3])
    })

    it('should reflect sets', () => {
      ft.build([1, 2, 3])
      ft.set(0, 100)
      expect(ft.getData()).toEqual([100, 2, 3])
    })
  })

  describe('totalSum', () => {
    it('should return default for empty tree', () => {
      expect(ft.totalSum()).toBe(0)
    })

    it('should return total sum after build', () => {
      ft.build([1, 2, 3, 4, 5])
      expect(ft.totalSum()).toBe(15)
    })

    it('should update after updates', () => {
      ft.build([1, 2, 3])
      ft.update(0, 10)
      expect(ft.totalSum()).toBe(16)
    })

    it('should handle single element', () => {
      ft.build([42])
      expect(ft.totalSum()).toBe(42)
    })

    it('should handle negative values', () => {
      ft.build([-1, -2, -3])
      expect(ft.totalSum()).toBe(-6)
    })
  })

  describe('findKth', () => {
    it('should find index for k=1', () => {
      ft.build([1, 2, 3, 4, 5])
      expect(ft.findKth(1)).toBe(0)
    })

    it('should find index for k=3', () => {
      ft.build([1, 2, 3, 4, 5])
      expect(ft.findKth(3)).toBe(1)
    })

    it('should find index for last position', () => {
      ft.build([1, 2, 3, 4, 5])
      expect(ft.findKth(15)).toBe(4)
    })

    it('should find index for k=6', () => {
      ft.build([1, 2, 3, 4, 5])
      expect(ft.findKth(6)).toBe(2)
    })

    it('should throw on empty tree', () => {
      expect(() => ft.findKth(1)).toThrow('Tree is empty')
    })

    it('should throw on k < 1', () => {
      ft.build([1, 2, 3])
      expect(() => ft.findKth(0)).toThrow(RangeError)
    })

    it('should throw when k exceeds total sum', () => {
      ft.build([1, 2, 3])
      expect(() => ft.findKth(7)).toThrow(RangeError)
    })

    it('should work with binary-like data', () => {
      ft.build([1, 1, 1, 1, 1])
      expect(ft.findKth(1)).toBe(0)
      expect(ft.findKth(2)).toBe(1)
      expect(ft.findKth(3)).toBe(2)
      expect(ft.findKth(4)).toBe(3)
      expect(ft.findKth(5)).toBe(4)
    })

    it('should work with varying frequencies', () => {
      ft.build([0, 0, 5, 0, 0])
      expect(ft.findKth(1)).toBe(2)
      expect(ft.findKth(5)).toBe(2)
    })

    it('should find kth after updates', () => {
      ft.build([1, 1, 1, 1, 1])
      ft.update(2, 10)
      expect(ft.findKth(5)).toBe(2)
    })
  })

  describe('custom defaultValue', () => {
    it('should use custom defaultValue in constructor', () => {
      const t = new FenwickTree(3, { defaultValue: 5 })
      expect(t.get(0)).toBe(5)
      expect(t.get(1)).toBe(5)
      expect(t.get(2)).toBe(5)
    })

    it('should use custom defaultValue in totalSum for empty', () => {
      const t = new FenwickTree(0, { defaultValue: -1 })
      expect(t.totalSum()).toBe(-1)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_FENWICK_TREE_OPTIONS', () => {
      expect(DEFAULT_FENWICK_TREE_OPTIONS.defaultValue).toBe(0)
    })

    it('should support FenwickTreeOptions interface', () => {
      const opts: FenwickTreeOptions = { defaultValue: 42 }
      expect(opts.defaultValue).toBe(42)
    })
  })

  describe('integration', () => {
    it('should handle typical prefix sum workflow', () => {
      ft.build([3, 1, 4, 1, 5, 9, 2, 6])
      expect(ft.rangeSum(0, 3)).toBe(9)
      expect(ft.rangeSum(4, 7)).toBe(22)
      ft.update(3, 10)
      expect(ft.rangeSum(0, 3)).toBe(19)
      expect(ft.totalSum()).toBe(41)
    })

    it('should handle many updates correctly', () => {
      ft.build(new Array(100).fill(0) as number[])
      for (let i = 0; i < 100; i++) {
        ft.update(i, 1)
      }
      expect(ft.totalSum()).toBe(100)
      expect(ft.prefixSum(49)).toBe(50)
    })

    it('should handle alternating build and clear', () => {
      ft.build([1, 2, 3])
      expect(ft.totalSum()).toBe(6)
      ft.clear()
      expect(ft.totalSum()).toBe(0)
      ft.build([4, 5])
      expect(ft.totalSum()).toBe(9)
    })

    it('should maintain correctness with set and get', () => {
      ft.build([0, 0, 0, 0, 0])
      ft.set(0, 10)
      ft.set(2, 30)
      ft.set(4, 50)
      expect(ft.getData()).toEqual([10, 0, 30, 0, 50])
      expect(ft.totalSum()).toBe(90)
    })

    it('should handle negative values throughout', () => {
      ft.build([-5, -3, -1, 2, 4])
      expect(ft.prefixSum(2)).toBe(-9)
      expect(ft.rangeSum(3, 4)).toBe(6)
      expect(ft.totalSum()).toBe(-3)
    })

    it('should handle large dataset efficiently', () => {
      const data = Array.from({ length: 10000 }, (_, i) => i + 1)
      ft.build(data)
      expect(ft.prefixSum(9999)).toBe(50005000)
      expect(ft.rangeSum(0, 9999)).toBe(50005000)
      expect(ft.rangeSum(100, 200)).toBe(15251)
      ft.update(5000, 1000)
      expect(ft.prefixSum(9999)).toBe(50006000)
    })

    it('should handle single element operations', () => {
      ft.build([42])
      expect(ft.get(0)).toBe(42)
      expect(ft.prefixSum(0)).toBe(42)
      expect(ft.rangeSum(0, 0)).toBe(42)
      expect(ft.totalSum()).toBe(42)
      expect(ft.getData()).toEqual([42])
      ft.set(0, 100)
      expect(ft.get(0)).toBe(100)
      ft.update(0, -50)
      expect(ft.get(0)).toBe(50)
    })
  })
})
