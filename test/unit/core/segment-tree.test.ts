import { describe, expect, it } from 'vitest'
import { SegmentTree } from '../../../src/core/segment-tree/segment-tree.js'

describe('SegmentTree', () => {
  it('should construct with default options', () => {
    const tree = new SegmentTree()
    expect(tree.isEmpty()).toBe(true)
  })

  it('should construct with custom defaultValue', () => {
    const tree = new SegmentTree({ defaultValue: 5 })
    tree.build([1, 2, 3])
    expect(tree.queryAll()).toBe(6)
  })

  it('should build from data', () => {
    const tree = new SegmentTree()
    tree.build([1, 2, 3, 4, 5])
    expect(tree.size()).toBe(5)
    expect(tree.isEmpty()).toBe(false)
  })

  it('should build from empty array', () => {
    const tree = new SegmentTree()
    tree.build([])
    expect(tree.isEmpty()).toBe(true)
    expect(tree.size()).toBe(0)
  })

  it('should build from single element', () => {
    const tree = new SegmentTree()
    tree.build([42])
    expect(tree.size()).toBe(1)
    expect(tree.get(0)).toBe(42)
    expect(tree.queryAll()).toBe(42)
  })

  it('should return default value for query on empty tree', () => {
    const tree = new SegmentTree({ defaultValue: 0 })
    expect(tree.query(0, 0)).toBe(0)
  })

  it('should query single element', () => {
    const tree = new SegmentTree()
    tree.build([1, 2, 3, 4, 5])
    expect(tree.query(0, 0)).toBe(1)
    expect(tree.query(2, 2)).toBe(3)
    expect(tree.query(4, 4)).toBe(5)
  })

  it('should query range', () => {
    const tree = new SegmentTree()
    tree.build([1, 2, 3, 4, 5])
    expect(tree.query(0, 4)).toBe(15)
    expect(tree.query(1, 3)).toBe(9)
    expect(tree.query(2, 4)).toBe(12)
  })

  it('should query full range', () => {
    const tree = new SegmentTree()
    tree.build([10, 20, 30, 40, 50])
    expect(tree.queryAll()).toBe(150)
  })

  it('should update single element', () => {
    const tree = new SegmentTree()
    tree.build([1, 2, 3, 4, 5])
    tree.update(2, 10)
    expect(tree.get(2)).toBe(10)
    expect(tree.queryAll()).toBe(22)
  })

  it('should update and query correctly', () => {
    const tree = new SegmentTree()
    tree.build([1, 2, 3, 4, 5])
    tree.update(0, 10)
    tree.update(4, 15)
    expect(tree.query(0, 2)).toBe(15)
    expect(tree.query(3, 4)).toBe(19)
    expect(tree.queryAll()).toBe(34)
  })

  it('should throw on update out of bounds', () => {
    const tree = new SegmentTree()
    tree.build([1, 2, 3])
    expect(() => tree.update(-1, 10)).toThrow(RangeError)
    expect(() => tree.update(3, 10)).toThrow(RangeError)
  })

  it('should throw on query out of bounds', () => {
    const tree = new SegmentTree()
    tree.build([1, 2, 3])
    expect(() => tree.query(-1, 2)).toThrow(RangeError)
    expect(() => tree.query(0, 3)).toThrow(RangeError)
    expect(() => tree.query(2, 0)).toThrow(RangeError)
  })

  it('should throw on get out of bounds', () => {
    const tree = new SegmentTree()
    tree.build([1, 2, 3])
    expect(() => tree.get(-1)).toThrow(RangeError)
    expect(() => tree.get(3)).toThrow(RangeError)
  })

  it('should get element', () => {
    const tree = new SegmentTree()
    tree.build([10, 20, 30, 40, 50])
    expect(tree.get(0)).toBe(10)
    expect(tree.get(2)).toBe(30)
    expect(tree.get(4)).toBe(50)
  })

  it('should return size', () => {
    const tree = new SegmentTree()
    expect(tree.size()).toBe(0)
    tree.build([1, 2, 3, 4, 5])
    expect(tree.size()).toBe(5)
  })

  it('should check empty', () => {
    const tree = new SegmentTree()
    expect(tree.isEmpty()).toBe(true)
    tree.build([1, 2, 3])
    expect(tree.isEmpty()).toBe(false)
  })

  it('should clear tree', () => {
    const tree = new SegmentTree()
    tree.build([1, 2, 3, 4, 5])
    tree.clear()
    expect(tree.isEmpty()).toBe(true)
    expect(tree.size()).toBe(0)
  })

  it('should get data copy', () => {
    const tree = new SegmentTree()
    tree.build([1, 2, 3, 4, 5])
    const data = tree.getData()
    expect(data).toEqual([1, 2, 3, 4, 5])
    expect(data).not.toBe(tree.getData())
  })

  it('should get range min', () => {
    const tree = new SegmentTree()
    tree.build([5, 2, 8, 1, 9, 3])
    expect(tree.getRangeMin(0, 5)).toBe(1)
    expect(tree.getRangeMin(0, 2)).toBe(2)
    expect(tree.getRangeMin(3, 5)).toBe(1)
    expect(tree.getRangeMin(1, 4)).toBe(1)
  })

  it('should get range max', () => {
    const tree = new SegmentTree()
    tree.build([5, 2, 8, 1, 9, 3])
    expect(tree.getRangeMax(0, 5)).toBe(9)
    expect(tree.getRangeMax(0, 2)).toBe(8)
    expect(tree.getRangeMax(3, 5)).toBe(9)
    expect(tree.getRangeMax(1, 4)).toBe(9)
  })

  it('should get range sum', () => {
    const tree = new SegmentTree()
    tree.build([1, 2, 3, 4, 5])
    expect(tree.getRangeSum(0, 4)).toBe(15)
    expect(tree.getRangeSum(1, 3)).toBe(9)
  })

  it('should handle negative numbers', () => {
    const tree = new SegmentTree()
    tree.build([-1, -2, 3, -4, 5])
    expect(tree.queryAll()).toBe(1)
    expect(tree.getRangeMin(0, 4)).toBe(-4)
    expect(tree.getRangeMax(0, 4)).toBe(5)
  })

  it('should handle zeros', () => {
    const tree = new SegmentTree()
    tree.build([0, 0, 0, 1, 0])
    expect(tree.queryAll()).toBe(1)
    expect(tree.getRangeMin(0, 4)).toBe(0)
    expect(tree.getRangeMax(0, 4)).toBe(1)
  })

  it('should handle large values', () => {
    const tree = new SegmentTree()
    tree.build([1000000, 2000000, 3000000])
    expect(tree.queryAll()).toBe(6000000)
    expect(tree.get(1)).toBe(2000000)
  })

  it('should rebuild correctly', () => {
    const tree = new SegmentTree()
    tree.build([1, 2, 3])
    expect(tree.queryAll()).toBe(6)
    tree.build([4, 5, 6, 7])
    expect(tree.queryAll()).toBe(22)
  })

  it('should handle multiple updates', () => {
    const tree = new SegmentTree()
    tree.build([1, 1, 1, 1, 1])
    tree.update(0, 2)
    tree.update(1, 3)
    tree.update(2, 4)
    tree.update(3, 5)
    tree.update(4, 6)
    expect(tree.queryAll()).toBe(20)
  })
})