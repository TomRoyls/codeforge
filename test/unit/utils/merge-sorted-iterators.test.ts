import { describe, expect, it } from 'vitest'
import { MergeSortedIterators } from '../../../src/utils/merge-sorted-iterators.js'

describe('MergeSortedIterators', () => {
  describe('constructor', () => {
    it('handles empty sources', () => {
      const merger = new MergeSortedIterators<number>([])
      expect(merger.activeSources).toBe(0)
    })

    it('handles single source with one element', () => {
      const source = [1][Symbol.iterator]()
      const merger = new MergeSortedIterators([source])
      expect(merger.activeSources).toBe(1)
    })

    it('handles single source with multiple elements', () => {
      const source = [1, 2, 3][Symbol.iterator]()
      const merger = new MergeSortedIterators([source])
      expect(merger.activeSources).toBe(1)
    })

    it('handles multiple sources with single elements each', () => {
      const source1 = [1][Symbol.iterator]()
      const source2 = [2][Symbol.iterator]()
      const source3 = [3][Symbol.iterator]()
      const merger = new MergeSortedIterators([source1, source2, source3])
      expect(merger.activeSources).toBe(3)
    })

    it('handles multiple sources with multiple elements', () => {
      const source1 = [1, 4, 7][Symbol.iterator]()
      const source2 = [2, 5, 8][Symbol.iterator]()
      const source3 = [3, 6, 9][Symbol.iterator]()
      const merger = new MergeSortedIterators([source1, source2, source3])
      expect(merger.activeSources).toBe(3)
    })

    it('accepts custom comparator for descending order', () => {
      const source1 = [3, 2, 1][Symbol.iterator]()
      const source2 = [6, 5, 4][Symbol.iterator]()
      const merger = new MergeSortedIterators([source1, source2], (a, b) => (a > b ? -1 : a < b ? 1 : 0))
      expect(merger.toArray()).toEqual([6, 5, 4, 3, 2, 1])
    })

    it('filters out empty sources', () => {
      const source1 = [][Symbol.iterator]()
      const source2 = [1][Symbol.iterator]()
      const source3 = [][Symbol.iterator]()
      const merger = new MergeSortedIterators([source1, source2, source3])
      expect(merger.activeSources).toBe(1)
    })
  })

  describe('next()', () => {
    it('returns done: true when no sources', () => {
      const merger = new MergeSortedIterators<number>([])
      const result = merger.next()
      expect(result).toEqual({ done: true, value: undefined })
    })

    it('returns done: true after exhausting all sources', () => {
      const source = [1][Symbol.iterator]()
      const merger = new MergeSortedIterators([source])
      merger.next()
      const result = merger.next()
      expect(result).toEqual({ done: true, value: undefined })
    })

    it('returns IteratorResult with done: false and value when elements remain', () => {
      const source = [1, 2, 3][Symbol.iterator]()
      const merger = new MergeSortedIterators([source])
      const result = merger.next()
      expect(result.done).toBe(false)
      expect(result.value).toBe(1)
    })

    it('returns values in sorted order', () => {
      const source1 = [1, 4][Symbol.iterator]()
      const source2 = [2, 5][Symbol.iterator]()
      const source3 = [3, 6][Symbol.iterator]()
      const merger = new MergeSortedIterators([source1, source2, source3])
      const values: number[] = []
      let result = merger.next()
      while (!result.done) {
        values.push(result.value)
        result = merger.next()
      }
      expect(values).toEqual([1, 2, 3, 4, 5, 6])
    })
  })

  describe('Symbol.iterator', () => {
    it('allows for...of iteration', () => {
      const source1 = [1, 3][Symbol.iterator]()
      const source2 = [2, 4][Symbol.iterator]()
      const merger = new MergeSortedIterators([source1, source2])
      const values: number[] = []
      for (const value of merger) {
        values.push(value)
      }
      expect(values).toEqual([1, 2, 3, 4])
    })

    it('works with spread operator', () => {
      const source1 = [1, 3][Symbol.iterator]()
      const source2 = [2, 4][Symbol.iterator]()
      const merger = new MergeSortedIterators([source1, source2])
      const values = [...merger]
      expect(values).toEqual([1, 2, 3, 4])
    })

    it('can be used with Array.from', () => {
      const source1 = [1, 3][Symbol.iterator]()
      const source2 = [2, 4][Symbol.iterator]()
      const merger = new MergeSortedIterators([source1, source2])
      const values = Array.from(merger)
      expect(values).toEqual([1, 2, 3, 4])
    })

    it('handles empty merger', () => {
      const merger = new MergeSortedIterators<number>([])
      const values: number[] = []
      for (const value of merger) {
        values.push(value)
      }
      expect(values).toEqual([])
    })
  })

  describe('toArray()', () => {
    it('returns empty array when no sources', () => {
      const merger = new MergeSortedIterators<number>([])
      expect(merger.toArray()).toEqual([])
    })

    it('returns single element array when single source has one element', () => {
      const source = [1][Symbol.iterator]()
      const merger = new MergeSortedIterators([source])
      expect(merger.toArray()).toEqual([1])
    })

    it('returns merged sorted array from multiple sources', () => {
      const source1 = [1, 4, 7][Symbol.iterator]()
      const source2 = [2, 5, 8][Symbol.iterator]()
      const source3 = [3, 6, 9][Symbol.iterator]()
      const merger = new MergeSortedIterators([source1, source2, source3])
      expect(merger.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('works with custom comparator', () => {
      const source1 = [3, 2, 1][Symbol.iterator]()
      const source2 = [6, 5, 4][Symbol.iterator]()
      const merger = new MergeSortedIterators([source1, source2], (a, b) => (a > b ? -1 : a < b ? 1 : 0))
      expect(merger.toArray()).toEqual([6, 5, 4, 3, 2, 1])
    })

    it('handles sources of different lengths', () => {
      const source1 = [1, 10][Symbol.iterator]()
      const source2 = [2, 3, 4, 5][Symbol.iterator]()
      const source3 = [6][Symbol.iterator]()
      const merger = new MergeSortedIterators([source1, source2, source3])
      expect(merger.toArray()).toEqual([1, 2, 3, 4, 5, 6, 10])
    })
  })

  describe('activeSources property', () => {
    it('returns 0 when no sources', () => {
      const merger = new MergeSortedIterators<number>([])
      expect(merger.activeSources).toBe(0)
    })

    it('returns correct count of non-empty sources', () => {
      const source1 = [1][Symbol.iterator]()
      const source2 = [2][Symbol.iterator]()
      const source3 = [][Symbol.iterator]()
      const merger = new MergeSortedIterators([source1, source2, source3])
      expect(merger.activeSources).toBe(2)
    })

    it('decreases as sources are exhausted', () => {
      const source1 = [1][Symbol.iterator]()
      const source2 = [2][Symbol.iterator]()
      const merger = new MergeSortedIterators([source1, source2])
      expect(merger.activeSources).toBe(2)
      merger.next()
      expect(merger.activeSources).toBe(1)
      merger.next()
      expect(merger.activeSources).toBe(0)
    })
  })

  describe('static fromArrays', () => {
    it('handles empty arrays array', () => {
      const merger = MergeSortedIterators.fromArrays<number>([])
      expect(merger.toArray()).toEqual([])
    })

    it('handles single array with elements', () => {
      const merger = MergeSortedIterators.fromArrays([[1, 2, 3]])
      expect(merger.toArray()).toEqual([1, 2, 3])
    })

    it('handles multiple arrays', () => {
      const merger = MergeSortedIterators.fromArrays([
        [1, 4],
        [2, 5],
        [3, 6],
      ])
      expect(merger.toArray()).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('handles arrays with custom comparator', () => {
      const merger = MergeSortedIterators.fromArrays([[3, 2, 1], [6, 5, 4]], (a, b) => (a > b ? -1 : a < b ? 1 : 0))
      expect(merger.toArray()).toEqual([6, 5, 4, 3, 2, 1])
    })

    it('handles arrays with duplicate values', () => {
      const merger = MergeSortedIterators.fromArrays([[1, 1, 2], [1, 2, 2]])
      expect(merger.toArray()).toEqual([1, 1, 1, 2, 2, 2])
    })
  })

  describe('static merge', () => {
    it('merges two empty iterables', () => {
      const result = MergeSortedIterators.merge([], [])
      expect(result).toEqual([])
    })

    it('merges one empty and one non-empty iterable', () => {
      const result = MergeSortedIterators.merge([], [1, 2, 3])
      expect(result).toEqual([1, 2, 3])
    })

    it('merges two non-empty iterables', () => {
      const result = MergeSortedIterators.merge([1, 3, 5], [2, 4, 6])
      expect(result).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('merges with custom comparator', () => {
      const result = MergeSortedIterators.merge([3, 2, 1], [6, 5, 4], (a, b) => (a > b ? -1 : a < b ? 1 : 0))
      expect(result).toEqual([6, 5, 4, 3, 2, 1])
    })

    it('handles duplicate values across sources', () => {
      const result = MergeSortedIterators.merge([1, 1, 2], [1, 2, 2])
      expect(result).toEqual([1, 1, 1, 2, 2, 2])
    })

    it('handles sources with overlapping ranges', () => {
      const result = MergeSortedIterators.merge([1, 3, 5, 7], [3, 5, 7, 9])
      expect(result).toEqual([1, 3, 3, 5, 5, 7, 7, 9])
    })

    it('handles sources with non-overlapping ranges', () => {
      const result = MergeSortedIterators.merge([1, 2, 3], [10, 20, 30])
      expect(result).toEqual([1, 2, 3, 10, 20, 30])
    })

    it('handles large merge (10 sources, 100 elements each)', () => {
      const sources: number[][] = []
      for (let i = 0; i < 10; i++) {
        sources.push(Array.from({ length: 100 }, (_, j) => j * 10 + i))
      }
      const merger = MergeSortedIterators.fromArrays(sources)
      const result = merger.toArray()
      expect(result.length).toBe(1000)
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i]).toBeLessThanOrEqual(result[i + 1])
      }
    })
  })
})