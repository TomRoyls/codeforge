import { describe, it, expect } from 'vitest'
import { FenwickTree } from '../src/utils/fenwick-tree.js'

// ─── Constructor ───

describe('FenwickTree', () => {
  it('creates with size', () => {
    const ft = new FenwickTree(10)
    expect(ft.size).toBe(10)
  })

  it('creates with size 0', () => {
    const ft = new FenwickTree(0)
    expect(ft.size).toBe(0)
  })

  it('throws on negative size', () => {
    expect(() => new FenwickTree(-1)).toThrow(RangeError)
  })

  // ─── Update ───

  it('update sets value at index', () => {
    const ft = new FenwickTree(5)
    ft.update(0, 10)
    expect(ft.pointQuery(0)).toBe(10)
  })

  it('update accumulates', () => {
    const ft = new FenwickTree(5)
    ft.update(2, 5)
    ft.update(2, 3)
    expect(ft.pointQuery(2)).toBe(8)
  })

  it('update throws on out of bounds', () => {
    const ft = new FenwickTree(5)
    expect(() => ft.update(-1, 1)).toThrow(RangeError)
    expect(() => ft.update(5, 1)).toThrow(RangeError)
  })

  // ─── Query (prefix sum) ───

  it('query returns prefix sum', () => {
    const ft = FenwickTree.fromArray([1, 2, 3, 4, 5])
    expect(ft.query(0)).toBe(1)
    expect(ft.query(1)).toBe(3)
    expect(ft.query(2)).toBe(6)
    expect(ft.query(3)).toBe(10)
    expect(ft.query(4)).toBe(15)
  })

  it('query on negative returns 0', () => {
    const ft = FenwickTree.fromArray([1, 2, 3])
    expect(ft.query(-1)).toBe(0)
  })

  it('query clamps to last index', () => {
    const ft = FenwickTree.fromArray([1, 2, 3])
    expect(ft.query(100)).toBe(6)
  })

  it('query on empty tree', () => {
    const ft = new FenwickTree(0)
    expect(ft.query(0)).toBe(0)
  })

  // ─── RangeQuery ───

  it('rangeQuery returns sum in range', () => {
    const ft = FenwickTree.fromArray([1, 2, 3, 4, 5])
    expect(ft.rangeQuery(0, 4)).toBe(15)
    expect(ft.rangeQuery(1, 3)).toBe(9)
    expect(ft.rangeQuery(2, 2)).toBe(3)
  })

  it('rangeQuery with from > to returns 0', () => {
    const ft = FenwickTree.fromArray([1, 2, 3])
    expect(ft.rangeQuery(2, 1)).toBe(0)
  })

  it('rangeQuery from 0', () => {
    const ft = FenwickTree.fromArray([10, 20, 30])
    expect(ft.rangeQuery(0, 1)).toBe(30)
  })

  // ─── PointQuery ───

  it('pointQuery returns single value', () => {
    const ft = FenwickTree.fromArray([5, 10, 15])
    expect(ft.pointQuery(0)).toBe(5)
    expect(ft.pointQuery(1)).toBe(10)
    expect(ft.pointQuery(2)).toBe(15)
  })

  it('pointQuery throws on out of bounds', () => {
    const ft = new FenwickTree(3)
    expect(() => ft.pointQuery(-1)).toThrow(RangeError)
    expect(() => ft.pointQuery(3)).toThrow(RangeError)
  })

  // ─── ToArray ───

  it('toArray returns all values', () => {
    const ft = FenwickTree.fromArray([3, 1, 4, 1, 5])
    expect(ft.toArray()).toEqual([3, 1, 4, 1, 5])
  })

  it('toArray on empty returns []', () => {
    const ft = new FenwickTree(0)
    expect(ft.toArray()).toEqual([])
  })

  // ─── Reset ───

  it('reset clears all values', () => {
    const ft = FenwickTree.fromArray([1, 2, 3])
    ft.reset()
    expect(ft.toArray()).toEqual([0, 0, 0])
    expect(ft.query(2)).toBe(0)
  })

  // ─── Clone ───

  it('clone preserves state', () => {
    const ft = FenwickTree.fromArray([1, 2, 3])
    const cl = ft.clone()
    expect(cl.toArray()).toEqual([1, 2, 3])
  })

  it('clone is independent', () => {
    const ft = FenwickTree.fromArray([1, 2, 3])
    const cl = ft.clone()
    cl.update(0, 100)
    expect(ft.pointQuery(0)).toBe(1)
    expect(cl.pointQuery(0)).toBe(101)
  })

  // ─── FromArray ───

  it('fromArray creates tree', () => {
    const ft = FenwickTree.fromArray([10, 20, 30])
    expect(ft.size).toBe(3)
    expect(ft.query(2)).toBe(60)
  })

  it('fromArray with empty array', () => {
    const ft = FenwickTree.fromArray([])
    expect(ft.size).toBe(0)
  })

  // ─── Large tree ───

  it('handles 100-element tree', () => {
    const values = Array.from({ length: 100 }, (_, i) => i + 1)
    const ft = FenwickTree.fromArray(values)
    expect(ft.query(99)).toBe(5050)
    expect(ft.rangeQuery(9, 19)).toBe(
      values.slice(9, 20).reduce((a, b) => a + b, 0),
    )
  })

  // ─── Negative values ───

  it('handles negative deltas', () => {
    const ft = FenwickTree.fromArray([10, 20, 30])
    ft.update(1, -5)
    expect(ft.pointQuery(1)).toBe(15)
    expect(ft.query(2)).toBe(55)
  })

  it('handles all negative values', () => {
    const ft = new FenwickTree(3)
    ft.update(0, -5)
    ft.update(1, -10)
    ft.update(2, -3)
    expect(ft.toArray()).toEqual([-5, -10, -3])
    expect(ft.query(2)).toBe(-18)
  })
})
