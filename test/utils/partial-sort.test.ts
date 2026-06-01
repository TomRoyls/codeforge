import { describe, expect, it } from 'vitest'
import { PartialSort } from '../../src/utils/partial-sort.js'

describe('PartialSort', () => {
  it('smallestK returns k smallest sorted', () => {
    expect(PartialSort.smallestK([5, 3, 1, 4, 2], 3)).toEqual([1, 2, 3])
  })

  it('smallestK with k=1', () => {
    expect(PartialSort.smallestK([5, 3, 1, 4, 2], 1)).toEqual([1])
  })

  it('smallestK with k=0', () => {
    expect(PartialSort.smallestK([1, 2, 3], 0)).toEqual([])
  })

  it('smallestK with k >= length', () => {
    expect(PartialSort.smallestK([3, 1, 2], 5)).toEqual([1, 2, 3])
  })

  it('largestK returns k largest sorted descending', () => {
    expect(PartialSort.largestK([5, 3, 1, 4, 2], 3)).toEqual([5, 4, 3])
  })

  it('largestK with k=1', () => {
    expect(PartialSort.largestK([5, 3, 1, 4, 2], 1)).toEqual([5])
  })

  it('largestK with k=0', () => {
    expect(PartialSort.largestK([1, 2, 3], 0)).toEqual([])
  })

  it('largestK with k >= length', () => {
    expect(PartialSort.largestK([3, 1, 2], 5)).toEqual([3, 2, 1])
  })

  it('does not modify original', () => {
    const arr = [3, 1, 2]
    PartialSort.smallestK(arr, 2)
    expect(arr).toEqual([3, 1, 2])
  })

  it('handles duplicates', () => {
    expect(PartialSort.smallestK([3, 1, 1, 2], 2)).toEqual([1, 1])
  })

  it('handles negative numbers', () => {
    expect(PartialSort.smallestK([-1, -3, -2], 2)).toEqual([-3, -2])
  })

  it('partitionPoint works', () => {
    const arr = [1, 2, 3, 4, 5]
    expect(PartialSort.partitionPoint(arr, x => x < 3)).toBe(2)
  })

  it('partitionPoint with all true', () => {
    expect(PartialSort.partitionPoint([1, 2, 3], () => true)).toBe(3)
  })

  it('partitionPoint with all false', () => {
    expect(PartialSort.partitionPoint([1, 2, 3], () => false)).toBe(0)
  })

  it('partitionPoint with empty array', () => {
    expect(PartialSort.partitionPoint([], () => true)).toBe(0)
  })

  it('partitionPoint finds first false', () => {
    expect(PartialSort.partitionPoint([1, 2, 3, 4, 5], (x) => x < 3)).toBe(2)
  })

  it('smallestK returns correct elements', () => {
    const result = PartialSort.smallestK([5, 3, 1, 4, 2], 3)
    expect(result.sort()).toEqual([1, 2, 3])
  })
})
