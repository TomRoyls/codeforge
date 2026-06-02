import { describe, it, expect } from 'vitest'
import { MergeSortTree } from '../../src/utils/merge-sort-tree.js'

describe('MergeSortTree', () => {
  it('counts elements less than value in range', () => {
    const mst = new MergeSortTree([5, 1, 3, 2, 4])
    expect(mst.queryCountLessThan(0, 4, 3)).toBe(2)
  })

  it('counts elements in value range', () => {
    const mst = new MergeSortTree([5, 1, 3, 2, 4])
    expect(mst.queryCountInRange(0, 4, 2, 4)).toBe(3)
  })

  it('finds kth smallest in range', () => {
    const mst = new MergeSortTree([5, 1, 3, 2, 4])
    expect(mst.queryKthSmallest(0, 4, 0)).toBe(1)
    expect(mst.queryKthSmallest(0, 4, 2)).toBe(3)
    expect(mst.queryKthSmallest(0, 4, 4)).toBe(5)
  })

  it('handles single element', () => {
    const mst = new MergeSortTree([42])
    expect(mst.queryCountLessThan(0, 0, 50)).toBe(1)
    expect(mst.queryCountLessThan(0, 0, 42)).toBe(0)
    expect(mst.queryKthSmallest(0, 0, 0)).toBe(42)
  })

  it('handles full range query', () => {
    const mst = new MergeSortTree([3, 1, 4, 1, 5])
    expect(mst.queryCountLessThan(0, 4, 3)).toBe(2)
    expect(mst.queryCountLessThan(0, 4, 4)).toBe(3)
  })

  it('handles sub-range query', () => {
    const mst = new MergeSortTree([10, 20, 30, 40, 50])
    expect(mst.queryCountLessThan(1, 3, 35)).toBe(2)
  })

  it('queryCountLessThan returns 0 for empty range', () => {
    const mst = new MergeSortTree([1, 2, 3])
    expect(mst.queryCountLessThan(2, 1, 5)).toBe(0)
  })

  it('querySorted returns sorted subarray', () => {
    const mst = new MergeSortTree([5, 3, 1, 4, 2])
    expect(mst.querySorted(0, 4)).toEqual([1, 2, 3, 4, 5])
  })

  it('handles empty array', () => {
    const mst = new MergeSortTree([])
    expect(mst.queryCountLessThan(0, 0, 5)).toBe(0)
  })

  it('handles two elements', () => {
    const mst = new MergeSortTree([2, 1])
    expect(mst.querySorted(0, 1)).toEqual([1, 2])
    expect(mst.queryKthSmallest(0, 1, 0)).toBe(1)
    expect(mst.queryKthSmallest(0, 1, 1)).toBe(2)
  })

  it('queryCountInRange with no matches returns 0', () => {
    const mst = new MergeSortTree([1, 2, 3])
    expect(mst.queryCountInRange(0, 2, 10, 20)).toBe(0)
  })

  it('handles duplicate values', () => {
    const mst = new MergeSortTree([3, 3, 3])
    expect(mst.queryCountLessThan(0, 2, 3)).toBe(0)
    expect(mst.queryCountLessThan(0, 2, 4)).toBe(3)
  })

  it('handles negative values', () => {
    const mst = new MergeSortTree([-3, -1, -2])
    expect(mst.querySorted(0, 2)).toEqual([-3, -2, -1])
    expect(mst.queryCountLessThan(0, 2, -1)).toBe(2)
  })

  it('handles range query on sub-array', () => {
    const mst = new MergeSortTree([10, 20, 30, 40, 50])
    expect(mst.queryCountInRange(1, 3, 20, 40)).toBe(3)
    expect(mst.queryCountInRange(1, 3, 25, 35)).toBe(1)
  })

  it('queryKthSmallest on sub-range', () => {
    const mst = new MergeSortTree([5, 2, 8, 1, 9, 3])
    expect(mst.queryKthSmallest(1, 4, 0)).toBe(1)
    expect(mst.queryKthSmallest(1, 4, 2)).toBe(8)
  })

  it('querySorted on single element', () => {
    const mst = new MergeSortTree([7, 3, 5])
    expect(mst.querySorted(1, 1)).toEqual([3])
  })

  it('handles large array', () => {
    const arr = Array.from({ length: 100 }, (_, i) => 100 - i)
    const mst = new MergeSortTree(arr)
    expect(mst.queryKthSmallest(0, 99, 0)).toBe(1)
    expect(mst.queryKthSmallest(0, 99, 99)).toBe(100)
    expect(mst.queryCountLessThan(0, 99, 50)).toBe(49)
  })

  it('single element tree', () => {
    const mst = new MergeSortTree([42])
    expect(mst.queryKthSmallest(0, 0, 0)).toBe(42)
  })

  it('queryCountLessThan for small range', () => {
    const mst = new MergeSortTree([1, 3, 2, 3, 4])
    expect(mst.queryCountLessThan(0, 2, 3)).toBe(2)
  })

  it('queryCountLessThan returns 0 for large threshold', () => {
    const mst = new MergeSortTree([5, 10, 15])
    expect(mst.queryCountLessThan(0, 2, 0)).toBe(0)
  })
})
