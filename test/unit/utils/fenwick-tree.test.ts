import { describe, expect, it } from 'vitest'
import { FenwickTree } from '../../../src/utils/fenwick-tree.js'

describe('FenwickTree', () => {
  it('should create tree with given size', () => {
    const ft = new FenwickTree(10)
    expect(ft.size).toBe(10)
  })

  it('should initialize all values to zero', () => {
    const ft = new FenwickTree(5)
    expect(ft.query(4)).toBe(0)
    expect(ft.pointQuery(0)).toBe(0)
    expect(ft.pointQuery(4)).toBe(0)
  })

  it('should create tree with zero size', () => {
    const ft = new FenwickTree(0)
    expect(ft.size).toBe(0)
  })

  it('should throw RangeError for negative size', () => {
    expect(() => new FenwickTree(-1)).toThrow(RangeError)
  })

  it('should update single element', () => {
    const ft = new FenwickTree(5)
    ft.update(2, 5)
    expect(ft.pointQuery(2)).toBe(5)
  })

  it('should query prefix sum correctly', () => {
    const ft = new FenwickTree(5)
    ft.update(0, 1)
    ft.update(1, 2)
    ft.update(2, 3)
    expect(ft.query(0)).toBe(1)
    expect(ft.query(1)).toBe(3)
    expect(ft.query(2)).toBe(6)
  })

  it('should query range sum correctly', () => {
    const ft = new FenwickTree(5)
    ft.update(0, 1)
    ft.update(1, 2)
    ft.update(2, 3)
    ft.update(3, 4)
    ft.update(4, 5)
    expect(ft.rangeQuery(1, 3)).toBe(9)
    expect(ft.rangeQuery(0, 2)).toBe(6)
    expect(ft.rangeQuery(2, 4)).toBe(12)
  })

  it('should query single element via rangeQuery', () => {
    const ft = new FenwickTree(5)
    ft.update(0, 1)
    ft.update(1, 2)
    ft.update(2, 3)
    expect(ft.rangeQuery(0, 0)).toBe(1)
    expect(ft.rangeQuery(1, 1)).toBe(2)
    expect(ft.rangeQuery(2, 2)).toBe(3)
  })

  it('should query single element via pointQuery', () => {
    const ft = new FenwickTree(5)
    ft.update(0, 1)
    ft.update(1, 2)
    ft.update(2, 3)
    expect(ft.pointQuery(0)).toBe(1)
    expect(ft.pointQuery(1)).toBe(2)
    expect(ft.pointQuery(2)).toBe(3)
  })

  it('should handle multiple updates to same index', () => {
    const ft = new FenwickTree(5)
    ft.update(0, 1)
    ft.update(0, 2)
    ft.update(0, 3)
    expect(ft.pointQuery(0)).toBe(6)
  })

  it('should convert to array', () => {
    const ft = new FenwickTree(5)
    ft.update(0, 1)
    ft.update(1, 2)
    ft.update(2, 3)
    ft.update(3, 4)
    ft.update(4, 5)
    const arr = ft.toArray()
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  it('should reset all values to zero', () => {
    const ft = new FenwickTree(5)
    ft.update(0, 1)
    ft.update(1, 2)
    ft.update(2, 3)
    ft.reset()
    expect(ft.pointQuery(0)).toBe(0)
    expect(ft.pointQuery(1)).toBe(0)
    expect(ft.pointQuery(2)).toBe(0)
  })

  it('should return zero for negative index query', () => {
    const ft = new FenwickTree(5)
    ft.update(0, 5)
    expect(ft.query(-1)).toBe(0)
  })

  it('should clamp index to size-1 in query', () => {
    const ft = new FenwickTree(5)
    ft.update(0, 1)
    ft.update(1, 2)
    ft.update(2, 3)
    ft.update(3, 4)
    ft.update(4, 5)
    expect(ft.query(10)).toBe(15)
  })

  it('should throw RangeError for negative index in update', () => {
    const ft = new FenwickTree(5)
    expect(() => ft.update(-1, 1)).toThrow(RangeError)
  })

  it('should throw RangeError for out of bounds index in update', () => {
    const ft = new FenwickTree(5)
    expect(() => ft.update(5, 1)).toThrow(RangeError)
  })

  it('should throw RangeError for negative index in pointQuery', () => {
    const ft = new FenwickTree(5)
    expect(() => ft.pointQuery(-1)).toThrow(RangeError)
  })

  it('should throw RangeError for out of bounds index in pointQuery', () => {
    const ft = new FenwickTree(5)
    expect(() => ft.pointQuery(5)).toThrow(RangeError)
  })

  it('should handle boundary case with size 1', () => {
    const ft = new FenwickTree(1)
    ft.update(0, 42)
    expect(ft.pointQuery(0)).toBe(42)
    expect(ft.query(0)).toBe(42)
  })

  it('should handle negative delta in update', () => {
    const ft = new FenwickTree(5)
    ft.update(0, 10)
    ft.update(0, -3)
    expect(ft.pointQuery(0)).toBe(7)
  })

  it('should handle zero delta in update', () => {
    const ft = new FenwickTree(5)
    ft.update(0, 5)
    ft.update(0, 0)
    expect(ft.pointQuery(0)).toBe(5)
  })

  it('should return zero for range query with from > to', () => {
    const ft = new FenwickTree(5)
    ft.update(0, 1)
    ft.update(1, 2)
    expect(ft.rangeQuery(2, 1)).toBe(0)
  })

  it('should handle range query from 0', () => {
    const ft = new FenwickTree(5)
    ft.update(0, 1)
    ft.update(1, 2)
    ft.update(2, 3)
    expect(ft.rangeQuery(0, 1)).toBe(3)
  })

  it('should handle range query to end', () => {
    const ft = new FenwickTree(5)
    ft.update(0, 1)
    ft.update(1, 2)
    ft.update(2, 3)
    ft.update(3, 4)
    ft.update(4, 5)
    expect(ft.rangeQuery(2, 4)).toBe(12)
  })

  it('should clone tree', () => {
    const ft = new FenwickTree(5)
    ft.update(0, 1)
    ft.update(1, 2)
    ft.update(2, 3)
    const clone = ft.clone()
    expect(clone.size).toBe(5)
    expect(clone.pointQuery(0)).toBe(1)
    expect(clone.pointQuery(1)).toBe(2)
    expect(clone.pointQuery(2)).toBe(3)
  })

  it('should create from array', () => {
    const ft = FenwickTree.fromArray([1, 2, 3, 4, 5])
    expect(ft.size).toBe(5)
    expect(ft.pointQuery(0)).toBe(1)
    expect(ft.pointQuery(4)).toBe(5)
    expect(ft.query(4)).toBe(15)
  })

  it('should create from empty array', () => {
    const ft = FenwickTree.fromArray([])
    expect(ft.size).toBe(0)
  })

  it('should handle complex operations', () => {
    const ft = new FenwickTree(10)
    ft.update(0, 5)
    ft.update(2, 3)
    ft.update(5, 7)
    ft.update(8, 2)
    expect(ft.query(9)).toBe(17)
    expect(ft.rangeQuery(1, 7)).toBe(10)
  })

  it('should maintain correctness after many updates', () => {
    const ft = new FenwickTree(100)
    for (let i = 0; i < 100; i++) {
      ft.update(i, i + 1)
    }
    expect(ft.query(99)).toBe(5050)
    expect(ft.rangeQuery(10, 20)).toBe(176)
  })
})