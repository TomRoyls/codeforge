import { describe, it, expect } from 'vitest'
import { SegmentTree } from '../src/utils/segment-tree.js'

// ─── Constructor ───

describe('SegmentTree', () => {
  it('creates with size', () => {
    const st = new SegmentTree(10)
    expect(st.size).toBe(10)
  })

  it('creates with size 0', () => {
    const st = new SegmentTree(0)
    expect(st.size).toBe(0)
  })

  it('throws on negative size', () => {
    expect(() => new SegmentTree(-1)).toThrow(RangeError)
  })

  it('creates with custom operation (sum)', () => {
    const st = new SegmentTree(5, (a, b) => a + b, 0)
    expect(st.size).toBe(5)
  })

  it('creates with max operation', () => {
    const st = new SegmentTree(5, Math.max, -Infinity)
    expect(st.size).toBe(5)
  })

  // ─── Update ───

  it('update sets value', () => {
    const st = new SegmentTree(5)
    st.update(0, 10)
    expect(st.query(0, 0)).toBe(10)
  })

  it('update overwrites previous value', () => {
    const st = new SegmentTree(5)
    st.update(2, 10)
    st.update(2, 20)
    expect(st.query(2, 2)).toBe(20)
  })

  it('update throws on out of bounds', () => {
    const st = new SegmentTree(5)
    expect(() => st.update(-1, 1)).toThrow(RangeError)
    expect(() => st.update(5, 1)).toThrow(RangeError)
  })

  // ─── Query (min operation, default) ───

  it('range query returns minimum', () => {
    const st = SegmentTree.fromArray([5, 3, 7, 1, 4])
    expect(st.query(0, 4)).toBe(1)
    expect(st.query(0, 2)).toBe(3)
    expect(st.query(3, 4)).toBe(1)
    expect(st.query(1, 3)).toBe(1)
  })

  it('point query returns single value', () => {
    const st = SegmentTree.fromArray([10, 20, 30])
    expect(st.query(0, 0)).toBe(10)
    expect(st.query(1, 1)).toBe(20)
    expect(st.query(2, 2)).toBe(30)
  })

  it('query with from > to returns identity', () => {
    const st = SegmentTree.fromArray([1, 2, 3])
    expect(st.query(2, 1)).toBe(Infinity)
  })

  // ─── Sum operation ───

  it('sum segment tree', () => {
    const st = SegmentTree.fromArray([1, 2, 3, 4, 5], (a, b) => a + b, 0)
    expect(st.query(0, 4)).toBe(15)
    expect(st.query(1, 3)).toBe(9)
    expect(st.query(2, 2)).toBe(3)
  })

  it('sum after update', () => {
    const st = SegmentTree.fromArray([1, 2, 3, 4, 5], (a, b) => a + b, 0)
    st.update(2, 10)
    expect(st.query(0, 4)).toBe(22)
    expect(st.query(1, 3)).toBe(16)
  })

  // ─── Max operation ───

  it('max segment tree', () => {
    const st = SegmentTree.fromArray([5, 3, 8, 1, 9, 2], Math.max, -Infinity)
    expect(st.query(0, 5)).toBe(9)
    expect(st.query(0, 2)).toBe(8)
    expect(st.query(3, 5)).toBe(9)
  })

  // ─── ToArray ───

  it('toArray returns all values', () => {
    const st = SegmentTree.fromArray([3, 1, 4, 1, 5])
    expect(st.toArray()).toEqual([3, 1, 4, 1, 5])
  })

  it('toArray on empty returns []', () => {
    const st = new SegmentTree(0)
    expect(st.toArray()).toEqual([])
  })

  // ─── Reset ───

  it('reset clears all values', () => {
    const st = SegmentTree.fromArray([1, 2, 3])
    st.reset()
    expect(st.query(0, 2)).toBe(Infinity)
  })

  it('reset with sum operation', () => {
    const st = SegmentTree.fromArray([1, 2, 3], (a, b) => a + b, 0)
    st.reset()
    expect(st.query(0, 2)).toBe(0)
  })

  // ─── Clone ───

  it('clone preserves state', () => {
    const st = SegmentTree.fromArray([1, 2, 3])
    const cl = st.clone()
    expect(cl.toArray()).toEqual([1, 2, 3])
  })

  it('clone is independent', () => {
    const st = SegmentTree.fromArray([1, 2, 3])
    const cl = st.clone()
    cl.update(0, 100)
    expect(st.query(0, 0)).toBe(1)
    expect(cl.query(0, 0)).toBe(100)
  })

  // ─── FromArray ───

  it('fromArray creates tree', () => {
    const st = SegmentTree.fromArray([10, 20, 30])
    expect(st.size).toBe(3)
    expect(st.query(0, 2)).toBe(10)
  })

  it('fromArray with empty', () => {
    const st = SegmentTree.fromArray([])
    expect(st.size).toBe(0)
  })

  // ─── Large tree ───

  it('handles 100 elements', () => {
    const values = Array.from({ length: 100 }, (_, i) => i + 1)
    const st = SegmentTree.fromArray(values)
    expect(st.query(0, 99)).toBe(1)
    expect(st.query(0, 99)).toBe(1)
    st.update(0, 200)
    expect(st.query(0, 99)).toBe(2)
  })

  it('sum tree handles 100 elements', () => {
    const values = Array.from({ length: 100 }, (_, i) => i + 1)
    const st = SegmentTree.fromArray(values, (a, b) => a + b, 0)
    expect(st.query(0, 99)).toBe(5050)
    expect(st.query(9, 19)).toBe(
      values.slice(9, 20).reduce((a, b) => a + b, 0),
    )
  })

  // ─── Negative values ───

  it('handles negative values', () => {
    const st = SegmentTree.fromArray([-5, -10, -3, -8])
    expect(st.query(0, 3)).toBe(-10)
    expect(st.query(2, 3)).toBe(-8)
  })

  it('max with negatives', () => {
    const st = SegmentTree.fromArray([-5, -10, -3, -8], Math.max, -Infinity)
    expect(st.query(0, 3)).toBe(-3)
  })
})
