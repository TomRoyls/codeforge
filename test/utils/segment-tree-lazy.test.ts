import { describe, it, expect } from 'vitest'
import { LazySegmentTree } from '../../src/utils/segment-tree-lazy.js'

describe('LazySegmentTree', () => {
  it('constructs with empty array', () => {
    const tree = new LazySegmentTree([])
    expect(tree.length).toBe(0)
  })

  it('constructs with single element', () => {
    const tree = new LazySegmentTree([5])
    expect(tree.length).toBe(1)
    expect(tree.rangeQuery(0, 0)).toBe(5)
  })

  it('constructs with multiple elements', () => {
    const tree = new LazySegmentTree([1, 2, 3, 4, 5])
    expect(tree.length).toBe(5)
    expect(tree.rangeQuery(0, 4)).toBe(15)
  })

  it('queries single element correctly', () => {
    const tree = new LazySegmentTree([10, 20, 30, 40])
    expect(tree.rangeQuery(0, 0)).toBe(10)
    expect(tree.rangeQuery(2, 2)).toBe(30)
    expect(tree.rangeQuery(3, 3)).toBe(40)
  })

  it('queries range correctly', () => {
    const tree = new LazySegmentTree([1, 2, 3, 4, 5])
    expect(tree.rangeQuery(0, 2)).toBe(6)
    expect(tree.rangeQuery(1, 3)).toBe(9)
    expect(tree.rangeQuery(2, 4)).toBe(12)
  })

  it('updates single point correctly', () => {
    const tree = new LazySegmentTree([1, 2, 3, 4, 5])
    tree.pointUpdate(2, 10)
    expect(tree.rangeQuery(2, 2)).toBe(13)
    expect(tree.rangeQuery(0, 4)).toBe(25)
  })

  it('updates range correctly', () => {
    const tree = new LazySegmentTree([1, 2, 3, 4, 5])
    tree.rangeUpdate(1, 3, 5)
    expect(tree.rangeQuery(0, 0)).toBe(1)
    expect(tree.rangeQuery(1, 1)).toBe(7)
    expect(tree.rangeQuery(2, 2)).toBe(8)
    expect(tree.rangeQuery(3, 3)).toBe(9)
    expect(tree.rangeQuery(4, 4)).toBe(5)
  })

  it('handles multiple lazy updates', () => {
    const tree = new LazySegmentTree([0, 0, 0, 0, 0])
    tree.rangeUpdate(0, 4, 5)
    tree.rangeUpdate(1, 3, 3)
    tree.rangeUpdate(2, 2, 10)
    expect(tree.rangeQuery(0, 0)).toBe(5)
    expect(tree.rangeQuery(1, 1)).toBe(8)
    expect(tree.rangeQuery(2, 2)).toBe(18)
    expect(tree.rangeQuery(3, 3)).toBe(8)
    expect(tree.rangeQuery(4, 4)).toBe(5)
  })

  it('performs point query correctly', () => {
    const tree = new LazySegmentTree([10, 20, 30, 40])
    expect(tree.pointQuery(0)).toBe(10)
    expect(tree.pointQuery(3)).toBe(40)
  })

  it('handles negative values', () => {
    const tree = new LazySegmentTree([-1, -2, -3, -4])
    expect(tree.rangeQuery(0, 3)).toBe(-10)
    tree.rangeUpdate(0, 3, 5)
    expect(tree.rangeQuery(0, 3)).toBe(10)
  })

  it('handles zero updates', () => {
    const tree = new LazySegmentTree([1, 2, 3, 4])
    tree.rangeUpdate(0, 3, 0)
    expect(tree.rangeQuery(0, 3)).toBe(10)
  })

  it('handles large values', () => {
    const tree = new LazySegmentTree([1000000, 2000000, 3000000])
    expect(tree.rangeQuery(0, 2)).toBe(6000000)
    tree.rangeUpdate(0, 2, 1000000)
    expect(tree.rangeQuery(0, 2)).toBe(9000000)
  })

  it('handles mixed updates and queries', () => {
    const tree = new LazySegmentTree([1, 1, 1, 1, 1])
    tree.rangeUpdate(0, 2, 2)
    expect(tree.rangeQuery(0, 4)).toBe(11)
    tree.rangeUpdate(2, 4, 3)
    expect(tree.rangeQuery(0, 4)).toBe(20)
    tree.pointUpdate(1, -5)
    expect(tree.rangeQuery(0, 4)).toBe(15)
  })

  it('handles power-of-2 sized array', () => {
    const tree = new LazySegmentTree([1, 2, 3, 4, 5, 6, 7, 8])
    expect(tree.rangeQuery(0, 7)).toBe(36)
    expect(tree.rangeQuery(4, 7)).toBe(26)
  })

  it('range update then point query', () => {
    const tree = new LazySegmentTree([0, 0, 0, 0])
    tree.rangeUpdate(1, 2, 7)
    expect(tree.pointQuery(0)).toBe(0)
    expect(tree.pointQuery(1)).toBe(7)
    expect(tree.pointQuery(2)).toBe(7)
    expect(tree.pointQuery(3)).toBe(0)
  })

  it('overlapping range updates accumulate', () => {
    const tree = new LazySegmentTree([0, 0, 0, 0, 0])
    tree.rangeUpdate(0, 4, 1)
    tree.rangeUpdate(2, 4, 2)
    expect(tree.rangeQuery(0, 4)).toBe(11)
  })

  it('single element tree', () => {
    const tree = new LazySegmentTree([42])
    expect(tree.rangeQuery(0, 0)).toBe(42)
    tree.rangeUpdate(0, 0, 10)
    expect(tree.pointQuery(0)).toBe(52)
  })

  it('range update then range query', () => {
    const tree = new LazySegmentTree([0, 0, 0, 0, 0])
    tree.rangeUpdate(0, 4, 3)
    expect(tree.rangeQuery(0, 4)).toBe(15)
  })

  it('single element tree', () => {
    const tree = new LazySegmentTree([5])
    expect(tree.rangeQuery(0, 0)).toBe(5)
  })

  it('rangeUpdate adds value', () => {
    const tree = new LazySegmentTree([1, 2, 3])
    tree.rangeUpdate(0, 2, 10)
    expect(tree.rangeQuery(0, 2)).toBe(36)
  })

  it('single element update and query', () => {
    const tree = new LazySegmentTree([5])
    expect(tree.rangeQuery(0, 0)).toBe(5)
  })

  it('range update changes query result', () => {
    const tree = new LazySegmentTree([1, 2, 3])
    tree.rangeUpdate(0, 2, 10)
    expect(tree.rangeQuery(0, 2)).toBeGreaterThanOrEqual(10)
  })
})