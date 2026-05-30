import { describe, expect, it } from 'vitest'
import { SegmentTree } from '../../../src/utils/segment-tree.js'

describe('SegmentTree', () => {
  it('constructor creates tree with default min operation', () => {
    const tree = new SegmentTree(10)
    expect(tree.size).toBe(10)
  })

  it('constructor creates tree with sum operation', () => {
    const tree = new SegmentTree(10, (a, b) => a + b, 0)
    expect(tree.size).toBe(10)
  })

  it('constructor creates tree with max operation', () => {
    const tree = new SegmentTree(10, Math.max, -Infinity)
    expect(tree.size).toBe(10)
  })

  it('constructor throws for negative size', () => {
    expect(() => new SegmentTree(-1)).toThrow(RangeError)
  })

  it('constructor accepts zero size', () => {
    const tree = new SegmentTree(0)
    expect(tree.size).toBe(0)
  })

  it('update sets value at index', () => {
    const tree = new SegmentTree(5)
    tree.update(0, 10)
    expect(tree.query(0, 0)).toBe(10)
  })

  it('update overwrites existing value', () => {
    const tree = new SegmentTree(5)
    tree.update(0, 10)
    tree.update(0, 20)
    expect(tree.query(0, 0)).toBe(20)
  })

  it('update throws for negative index', () => {
    const tree = new SegmentTree(5)
    expect(() => tree.update(-1, 10)).toThrow(RangeError)
  })

  it('update throws for index out of bounds', () => {
    const tree = new SegmentTree(5)
    expect(() => tree.update(5, 10)).toThrow(RangeError)
  })

  it('query returns identity for empty tree', () => {
    const tree = new SegmentTree(5)
    expect(tree.query(0, 4)).toBe(Infinity)
  })

  it('query returns single value', () => {
    const tree = new SegmentTree(5)
    tree.update(2, 42)
    expect(tree.query(2, 2)).toBe(42)
  })

  it('query returns min over range with default operation', () => {
    const tree = new SegmentTree(5)
    tree.update(0, 10)
    tree.update(1, 5)
    tree.update(2, 15)
    tree.update(3, 3)
    tree.update(4, 8)
    expect(tree.query(0, 4)).toBe(3)
  })

  it('query returns sum over range with sum operation', () => {
    const tree = new SegmentTree(5, (a, b) => a + b, 0)
    tree.update(0, 1)
    tree.update(1, 2)
    tree.update(2, 3)
    tree.update(3, 4)
    tree.update(4, 5)
    expect(tree.query(0, 4)).toBe(15)
  })

  it('query returns max over range with max operation', () => {
    const tree = new SegmentTree(5, Math.max, -Infinity)
    tree.update(0, 10)
    tree.update(1, 5)
    tree.update(2, 15)
    tree.update(3, 3)
    tree.update(4, 8)
    expect(tree.query(0, 4)).toBe(15)
  })

  it('query returns identity for inverted range', () => {
    const tree = new SegmentTree(5)
    tree.update(0, 10)
    expect(tree.query(4, 0)).toBe(Infinity)
  })

  it('query clamps from to valid range', () => {
    const tree = new SegmentTree(5)
    tree.update(0, 10)
    tree.update(4, 20)
    expect(tree.query(-1, 5)).toBe(10)
  })

  it('query handles from greater than tree size', () => {
    const tree = new SegmentTree(5)
    tree.update(0, 10)
    expect(tree.query(10, 15)).toBe(Infinity)
  })

  it('query handles to less than zero', () => {
    const tree = new SegmentTree(5)
    tree.update(0, 10)
    expect(tree.query(-5, -2)).toBe(Infinity)
  })

  it('size getter returns tree size', () => {
    const tree = new SegmentTree(100)
    expect(tree.size).toBe(100)
  })

  it('toArray returns all values', () => {
    const tree = new SegmentTree(5)
    tree.update(0, 10)
    tree.update(1, 20)
    tree.update(2, 30)
    tree.update(3, 40)
    tree.update(4, 50)
    expect(tree.toArray()).toEqual([10, 20, 30, 40, 50])
  })

  it('toArray returns identity for unset values', () => {
    const tree = new SegmentTree(3)
    tree.update(1, 10)
    expect(tree.toArray()).toEqual([Infinity, 10, Infinity])
  })

  it('toArray returns empty array for zero size tree', () => {
    const tree = new SegmentTree(0)
    expect(tree.toArray()).toEqual([])
  })

  it('fromArray creates tree from array', () => {
    const tree = SegmentTree.fromArray([1, 2, 3, 4, 5])
    expect(tree.size).toBe(5)
    expect(tree.query(0, 4)).toBe(1)
  })

  it('fromArray with sum operation', () => {
    const tree = SegmentTree.fromArray([1, 2, 3, 4, 5], (a, b) => a + b, 0)
    expect(tree.query(0, 4)).toBe(15)
  })

  it('reset clears all values', () => {
    const tree = new SegmentTree(5)
    tree.update(0, 10)
    tree.update(1, 20)
    tree.reset()
    expect(tree.query(0, 4)).toBe(Infinity)
  })

  it('clone creates independent copy', () => {
    const tree = new SegmentTree(5)
    tree.update(0, 10)
    tree.update(1, 20)
    const clone = tree.clone()
    clone.update(0, 100)
    expect(tree.query(0, 0)).toBe(10)
    expect(clone.query(0, 0)).toBe(100)
  })

  it('clone preserves tree size', () => {
    const tree = new SegmentTree(10)
    const clone = tree.clone()
    expect(clone.size).toBe(10)
  })

  it('clone preserves operation and identity', () => {
    const tree = new SegmentTree(5, (a, b) => a + b, 0)
    tree.update(0, 10)
    tree.update(1, 20)
    const clone = tree.clone()
    expect(clone.query(0, 1)).toBe(30)
  })

  it('multiple updates followed by query', () => {
    const tree = new SegmentTree(5)
    tree.update(0, 100)
    tree.update(0, 1)
    tree.update(1, 2)
    tree.update(2, 3)
    tree.update(3, 4)
    tree.update(4, 5)
    expect(tree.query(0, 4)).toBe(1)
  })
})