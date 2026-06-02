import { describe, it, expect } from 'vitest'
import { MergeSortedIterators } from '../../src/utils/merge-sorted-iterators.js'

describe('MergeSortedIterators', () => {
  it('creates from empty iterators', () => {
    const it1 = [][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1])
    expect(merger.activeSources).toBe(0)
  })

  it('creates from single iterator', () => {
    const it1 = [1, 2, 3][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1])
    expect(merger.activeSources).toBe(1)
  })

  it('creates from multiple iterators', () => {
    const it1 = [1, 3, 5][Symbol.iterator]()
    const it2 = [2, 4, 6][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1, it2])
    expect(merger.activeSources).toBe(2)
  })

  it('iterates over single source', () => {
    const it1 = [1, 2, 3][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1])
    const result = merger.toArray()
    expect(result).toEqual([1, 2, 3])
  })

  it('merges two sorted arrays', () => {
    const it1 = [1, 3, 5][Symbol.iterator]()
    const it2 = [2, 4, 6][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1, it2])
    const result = merger.toArray()
    expect(result).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('handles arrays with different lengths', () => {
    const it1 = [1, 2][Symbol.iterator]()
    const it2 = [3, 4, 5, 6][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1, it2])
    const result = merger.toArray()
    expect(result).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('handles duplicate values', () => {
    const it1 = [1, 2, 2][Symbol.iterator]()
    const it2 = [1, 2, 3][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1, it2])
    const result = merger.toArray()
    expect(result).toEqual([1, 1, 2, 2, 2, 3])
  })

  it('handles single element arrays', () => {
    const it1 = [1][Symbol.iterator]()
    const it2 = [2][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1, it2])
    const result = merger.toArray()
    expect(result).toEqual([1, 2])
  })

  it('handles empty array in merge', () => {
    const it1 = [][Symbol.iterator]()
    const it2 = [1, 2, 3][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1, it2])
    const result = merger.toArray()
    expect(result).toEqual([1, 2, 3])
  })

  it('supports for...of iteration', () => {
    const it1 = [1, 3, 5][Symbol.iterator]()
    const it2 = [2, 4, 6][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1, it2])
    const result = []
    for (const value of merger) {
      result.push(value)
    }
    expect(result).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('next returns correct iterator results', () => {
    const it1 = [1, 3][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1])
    const first = merger.next()
    expect(first.done).toBe(false)
    expect(first.value).toBe(1)
    const second = merger.next()
    expect(second.done).toBe(false)
    expect(second.value).toBe(3)
    const third = merger.next()
    expect(third.done).toBe(true)
  })

  it('uses custom compare function', () => {
    const it1 = [5, 3, 1][Symbol.iterator]()
    const it2 = [6, 4, 2][Symbol.iterator]()
    const compare = (a: number, b: number) => b - a
    const merger = new MergeSortedIterators([it1, it2], compare)
    const result = merger.toArray()
    expect(result).toEqual([6, 5, 4, 3, 2, 1])
  })

  it('fromArrays creates merger from arrays', () => {
    const merger = MergeSortedIterators.fromArrays([[1, 3], [2, 4]])
    const result = merger.toArray()
    expect(result).toEqual([1, 2, 3, 4])
  })

  it('fromArrays with empty arrays', () => {
    const merger = MergeSortedIterators.fromArrays([[], [1, 2], []])
    const result = merger.toArray()
    expect(result).toEqual([1, 2])
  })

  it('merge static method merges two iterables', () => {
    const result = MergeSortedIterators.merge([1, 3, 5], [2, 4, 6])
    expect(result).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('merge with custom compare function', () => {
    const compare = (a: number, b: number) => b - a
    const result = MergeSortedIterators.merge([3, 1], [4, 2], compare)
    expect(result).toEqual([4, 3, 2, 1])
  })

  it('handles string values with default compare', () => {
    const it1 = ['a', 'c'][Symbol.iterator]()
    const it2 = ['b', 'd'][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1, it2])
    const result = merger.toArray()
    expect(result).toEqual(['a', 'b', 'c', 'd'])
  })

  it('handles negative numbers', () => {
    const it1 = [-3, -1][Symbol.iterator]()
    const it2 = [-2, 0][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1, it2])
    const result = merger.toArray()
    expect(result).toEqual([-3, -2, -1, 0])
  })

  it('handles floating point numbers', () => {
    const it1 = [1.1, 2.2][Symbol.iterator]()
    const it2 = [1.5, 3.0][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1, it2])
    const result = merger.toArray()
    expect(result).toEqual([1.1, 1.5, 2.2, 3.0])
  })

  it('empty iterators produce empty result', () => {
    const it1 = [][Symbol.iterator]()
    const it2 = [][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1, it2])
    expect(merger.toArray()).toEqual([])
  })
})