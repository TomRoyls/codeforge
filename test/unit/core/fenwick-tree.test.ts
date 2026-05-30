import { describe, expect, it } from 'vitest'
import { FenwickTree } from '../../../src/core/fenwick-tree/fenwick-tree.js'

describe('FenwickTree', () => {
  it('should construct without size', () => {
    const tree = new FenwickTree()
    expect(tree.isEmpty()).toBe(true)
    expect(tree.size()).toBe(0)
  })

  it('should construct with size', () => {
    const tree = new FenwickTree(5)
    expect(tree.isEmpty()).toBe(false)
    expect(tree.size()).toBe(5)
  })

  it('should construct with custom defaultValue', () => {
    const tree = new FenwickTree(3, { defaultValue: 10 })
    const data = tree.getData()
    expect(data).toEqual([10, 10, 10])
  })

  it('should build from data', () => {
    const tree = new FenwickTree()
    tree.build([1, 2, 3, 4, 5])
    expect(tree.size()).toBe(5)
    expect(tree.isEmpty()).toBe(false)
  })

  it('should build from empty array', () => {
    const tree = new FenwickTree()
    tree.build([])
    expect(tree.isEmpty()).toBe(true)
    expect(tree.size()).toBe(0)
  })

  it('should build from single element', () => {
    const tree = new FenwickTree()
    tree.build([42])
    expect(tree.size()).toBe(1)
    expect(tree.get(0)).toBe(42)
    expect(tree.totalSum()).toBe(42)
  })

  it('should calculate prefix sum', () => {
    const tree = new FenwickTree()
    tree.build([1, 2, 3, 4, 5])
    expect(tree.prefixSum(0)).toBe(1)
    expect(tree.prefixSum(2)).toBe(6)
    expect(tree.prefixSum(4)).toBe(15)
  })

  it('should return 0 for prefix sum on empty tree', () => {
    const tree = new FenwickTree()
    expect(tree.prefixSum(0)).toBe(0)
  })

  it('should return 0 for prefix sum with negative index', () => {
    const tree = new FenwickTree()
    tree.build([1, 2, 3])
    expect(tree.prefixSum(-1)).toBe(0)
    expect(tree.prefixSum(-5)).toBe(0)
  })

  it('should clamp prefix sum index', () => {
    const tree = new FenwickTree()
    tree.build([1, 2, 3])
    expect(tree.prefixSum(5)).toBe(6)
    expect(tree.prefixSum(100)).toBe(6)
  })

  it('should calculate range sum', () => {
    const tree = new FenwickTree()
    tree.build([1, 2, 3, 4, 5])
    expect(tree.rangeSum(0, 4)).toBe(15)
    expect(tree.rangeSum(1, 3)).toBe(9)
    expect(tree.rangeSum(2, 4)).toBe(12)
  })

  it('should return 0 for invalid range', () => {
    const tree = new FenwickTree()
    tree.build([1, 2, 3])
    expect(tree.rangeSum(3, 0)).toBe(0)
    expect(tree.rangeSum(5, 2)).toBe(0)
  })

  it('should handle range sum with start <= 0', () => {
    const tree = new FenwickTree()
    tree.build([1, 2, 3, 4])
    expect(tree.rangeSum(0, 2)).toBe(6)
    expect(tree.rangeSum(-1, 2)).toBe(6)
  })

  it('should get element', () => {
    const tree = new FenwickTree()
    tree.build([10, 20, 30, 40, 50])
    expect(tree.get(0)).toBe(10)
    expect(tree.get(2)).toBe(30)
    expect(tree.get(4)).toBe(50)
  })

  it('should throw on get out of bounds', () => {
    const tree = new FenwickTree()
    tree.build([1, 2, 3])
    expect(() => tree.get(-1)).toThrow(RangeError)
    expect(() => tree.get(3)).toThrow(RangeError)
  })

  it('should update element', () => {
    const tree = new FenwickTree()
    tree.build([1, 2, 3, 4, 5])
    tree.update(2, 5)
    expect(tree.get(2)).toBe(8)
    expect(tree.totalSum()).toBe(20)
  })

  it('should throw on update out of bounds', () => {
    const tree = new FenwickTree()
    tree.build([1, 2, 3])
    expect(() => tree.update(-1, 10)).toThrow(RangeError)
    expect(() => tree.update(3, 10)).toThrow(RangeError)
  })

  it('should set element', () => {
    const tree = new FenwickTree()
    tree.build([1, 2, 3, 4, 5])
    tree.set(2, 10)
    expect(tree.get(2)).toBe(10)
    expect(tree.totalSum()).toBe(22)
  })

  it('should handle multiple updates', () => {
    const tree = new FenwickTree()
    tree.build([1, 1, 1, 1, 1])
    tree.update(0, 1)
    tree.update(1, 2)
    tree.update(2, 3)
    tree.update(3, 4)
    tree.update(4, 5)
    expect(tree.totalSum()).toBe(20)
  })

  it('should return size', () => {
    const tree = new FenwickTree()
    expect(tree.size()).toBe(0)
    tree.build([1, 2, 3, 4, 5])
    expect(tree.size()).toBe(5)
  })

  it('should check empty', () => {
    const tree = new FenwickTree()
    expect(tree.isEmpty()).toBe(true)
    tree.build([1, 2, 3])
    expect(tree.isEmpty()).toBe(false)
  })

  it('should clear tree', () => {
    const tree = new FenwickTree()
    tree.build([1, 2, 3, 4, 5])
    tree.clear()
    expect(tree.isEmpty()).toBe(true)
    expect(tree.size()).toBe(0)
  })

  it('should get data copy', () => {
    const tree = new FenwickTree()
    tree.build([1, 2, 3, 4, 5])
    const data = tree.getData()
    expect(data).toEqual([1, 2, 3, 4, 5])
    expect(data).not.toBe(tree.getData())
  })

  it('should calculate total sum', () => {
    const tree = new FenwickTree()
    tree.build([1, 2, 3, 4, 5])
    expect(tree.totalSum()).toBe(15)
  })

  it('should find kth element', () => {
    const tree = new FenwickTree()
    tree.build([1, 2, 3, 4, 5])
    expect(tree.findKth(1)).toBe(0)
    expect(tree.findKth(3)).toBe(1)
    expect(tree.findKth(6)).toBe(2)
    expect(tree.findKth(10)).toBe(3)
    expect(tree.findKth(15)).toBe(4)
  })

  it('should throw on findKth with empty tree', () => {
    const tree = new FenwickTree()
    expect(() => tree.findKth(1)).toThrow('Tree is empty')
  })

  it('should throw on findKth with k < 1', () => {
    const tree = new FenwickTree()
    tree.build([1, 2, 3])
    expect(() => tree.findKth(0)).toThrow(RangeError)
    expect(() => tree.findKth(-1)).toThrow(RangeError)
  })

  it('should throw on findKth when k exceeds total sum', () => {
    const tree = new FenwickTree()
    tree.build([1, 2, 3])
    expect(() => tree.findKth(100)).toThrow('k exceeds total sum')
  })

  it('should handle negative numbers', () => {
    const tree = new FenwickTree()
    tree.build([-1, -2, 3, -4, 5])
    expect(tree.totalSum()).toBe(1)
    expect(tree.prefixSum(3)).toBe(-4)
    expect(tree.rangeSum(1, 3)).toBe(-3)
  })

  it('should handle zeros', () => {
    const tree = new FenwickTree()
    tree.build([0, 0, 0, 1, 0])
    expect(tree.totalSum()).toBe(1)
    expect(tree.prefixSum(3)).toBe(1)
    expect(tree.get(3)).toBe(1)
  })

  it('should handle large values', () => {
    const tree = new FenwickTree()
    tree.build([1000000, 2000000, 3000000])
    expect(tree.totalSum()).toBe(6000000)
    expect(tree.get(1)).toBe(2000000)
  })

  it('should rebuild correctly', () => {
    const tree = new FenwickTree()
    tree.build([1, 2, 3])
    expect(tree.totalSum()).toBe(6)
    tree.build([4, 5, 6, 7])
    expect(tree.totalSum()).toBe(22)
  })

  it('should handle update with negative delta', () => {
    const tree = new FenwickTree()
    tree.build([10, 20, 30])
    tree.update(1, -5)
    expect(tree.get(1)).toBe(15)
    expect(tree.totalSum()).toBe(55)
  })

  it('should handle set to same value', () => {
    const tree = new FenwickTree()
    tree.build([1, 2, 3])
    tree.set(1, 2)
    expect(tree.get(1)).toBe(2)
    expect(tree.totalSum()).toBe(6)
  })
})