import { describe, it, expect } from 'vitest'
import { KWayMerge } from '../../src/core/k-way-merge/k-way-merge.js'

describe('KWayMerge', () => {
  describe('merge 2 sorted arrays', () => {
    it('merges two non-overlapping sorted arrays', () => {
      const result = KWayMerge.merge([[1, 3, 5], [2, 4, 6]])
      expect(result).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('merges two overlapping sorted arrays', () => {
      const result = KWayMerge.merge([[1, 3, 5], [2, 3, 4]])
      expect(result).toEqual([1, 2, 3, 3, 4, 5])
    })

    it('merges two arrays where all elements of first are smaller', () => {
      const result = KWayMerge.merge([[1, 2, 3], [4, 5, 6]])
      expect(result).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('merges two arrays where all elements of second are smaller', () => {
      const result = KWayMerge.merge([[4, 5, 6], [1, 2, 3]])
      expect(result).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('merges two identical arrays', () => {
      const result = KWayMerge.merge([[1, 2, 3], [1, 2, 3]])
      expect(result).toEqual([1, 1, 2, 2, 3, 3])
    })
  })

  describe('merge 3+ sorted arrays', () => {
    it('merges three sorted arrays', () => {
      const result = KWayMerge.merge([[1, 4, 7], [2, 5, 8], [3, 6, 9]])
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('merges four sorted arrays', () => {
      const result = KWayMerge.merge([[1, 5], [2, 6], [3, 7], [4, 8]])
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    })

    it('merges five sorted arrays', () => {
      const result = KWayMerge.merge([[1], [2], [3], [4], [5]])
      expect(result).toEqual([1, 2, 3, 4, 5])
    })

    it('merges three arrays with varying content', () => {
      const result = KWayMerge.merge([[1, 10, 20], [5, 15], [3, 12, 18]])
      expect(result).toEqual([1, 3, 5, 10, 12, 15, 18, 20])
    })
  })

  describe('merge with custom comparator (descending)', () => {
    it('merges in descending order', () => {
      const result = KWayMerge.merge(
        [[5, 3, 1], [6, 4, 2]],
        (a, b) => b - a
      )
      expect(result).toEqual([6, 5, 4, 3, 2, 1])
    })

    it('merges three arrays in descending order', () => {
      const result = KWayMerge.merge(
        [[9, 7, 5], [8, 6, 4], [10, 3, 1]],
        (a, b) => b - a
      )
      expect(result).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 1])
    })

    it('merges with custom object comparator', () => {
      const sources = [
        [{ age: 10 }, { age: 30 }],
        [{ age: 5 }, { age: 20 }],
      ]
      const result = KWayMerge.merge(
        sources,
        (a, b) => a.age - b.age
      )
      expect(result.map(r => r.age)).toEqual([5, 10, 20, 30])
    })

    it('merges strings with custom comparator', () => {
      const result = KWayMerge.merge(
        [['apple', 'cherry'], ['banana', 'date']],
        (a, b) => a.localeCompare(b)
      )
      expect(result).toEqual(['apple', 'banana', 'cherry', 'date'])
    })
  })

  describe('merge empty arrays', () => {
    it('returns empty array when all sources are empty', () => {
      const result = KWayMerge.merge([[], [], []])
      expect(result).toEqual([])
    })

    it('ignores empty arrays in the mix', () => {
      const result = KWayMerge.merge([[], [1, 2, 3], []])
      expect(result).toEqual([1, 2, 3])
    })

    it('returns empty for no sources', () => {
      const result = KWayMerge.merge([])
      expect(result).toEqual([])
    })

    it('handles empty array between non-empty arrays', () => {
      const result = KWayMerge.merge([[1, 4], [], [2, 3]])
      expect(result).toEqual([1, 2, 3, 4])
    })
  })

  describe('merge single array', () => {
    it('returns copy of single sorted array', () => {
      const result = KWayMerge.merge([[1, 2, 3, 4, 5]])
      expect(result).toEqual([1, 2, 3, 4, 5])
    })

    it('handles single element array', () => {
      const result = KWayMerge.merge([[42]])
      expect(result).toEqual([42])
    })

    it('handles single empty array', () => {
      const result = KWayMerge.merge([[]])
      expect(result).toEqual([])
    })
  })

  describe('merge arrays with duplicates', () => {
    it('preserves all duplicates across sources', () => {
      const result = KWayMerge.merge([[1, 1, 1], [1, 1, 1]])
      expect(result).toEqual([1, 1, 1, 1, 1, 1])
    })

    it('handles duplicates within a single source', () => {
      const result = KWayMerge.merge([[1, 2, 2, 3], [2, 3, 4]])
      expect(result).toEqual([1, 2, 2, 2, 3, 3, 4])
    })

    it('handles all identical elements', () => {
      const result = KWayMerge.merge([[5, 5], [5, 5], [5]])
      expect(result).toEqual([5, 5, 5, 5, 5])
    })

    it('handles duplicates with negative numbers', () => {
      const result = KWayMerge.merge([[-1, 0, 0, 1], [-1, 1, 1]])
      expect(result).toEqual([-1, -1, 0, 0, 1, 1, 1])
    })
  })

  describe('merge arrays of different lengths', () => {
    it('handles one long and one short array', () => {
      const result = KWayMerge.merge([[1, 2, 3, 4, 5], [10]])
      expect(result).toEqual([1, 2, 3, 4, 5, 10])
    })

    it('handles many single element arrays', () => {
      const result = KWayMerge.merge([[5], [1], [3], [2], [4]])
      expect(result).toEqual([1, 2, 3, 4, 5])
    })

    it('handles mix of lengths', () => {
      const result = KWayMerge.merge([[1, 2], [3, 4, 5, 6], [7]])
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7])
    })

    it('handles one empty and one non-empty', () => {
      const result = KWayMerge.merge([[], [1, 2, 3]])
      expect(result).toEqual([1, 2, 3])
    })
  })

  describe('iterator protocol', () => {
    it('implements Symbol.iterator', () => {
      const merger = new KWayMerge([[1, 2], [3, 4]])
      const result = [...merger]
      expect(result).toEqual([1, 2, 3, 4])
    })

    it('returns done after consuming all elements', () => {
      const merger = new KWayMerge([[1], [2]])
      merger.next()
      merger.next()
      expect(merger.next().done).toBe(true)
    })

    it('can iterate manually with next()', () => {
      const merger = new KWayMerge([[1, 3], [2, 4]])
      expect(merger.next().value).toBe(1)
      expect(merger.next().value).toBe(2)
      expect(merger.next().value).toBe(3)
      expect(merger.next().value).toBe(4)
      expect(merger.next().done).toBe(true)
    })

    it('done property reflects iteration state', () => {
      const merger = new KWayMerge([[1], [2]])
      expect(merger.done).toBe(false)
      merger.next()
      expect(merger.done).toBe(false)
      merger.next()
      expect(merger.done).toBe(true)
    })

    it('done is true for empty sources from start', () => {
      const merger = new KWayMerge([[], []])
      expect(merger.done).toBe(true)
    })

    it('calling next after done returns done', () => {
      const merger = new KWayMerge([[1]])
      merger.next()
      const result = merger.next()
      expect(result.done).toBe(true)
      expect(result.value).toBeUndefined()
    })

    it('works with for...of loop', () => {
      const merger = new KWayMerge([[1, 4], [2, 5], [3, 6]])
      const collected: number[] = []
      for (const val of merger) {
        collected.push(val)
      }
      expect(collected).toEqual([1, 2, 3, 4, 5, 6])
    })
  })

  describe('toArray', () => {
    it('returns all merged elements', () => {
      const merger = new KWayMerge([[1, 3], [2, 4]])
      expect(merger.toArray()).toEqual([1, 2, 3, 4])
    })

    it('returns empty array for empty sources', () => {
      const merger = new KWayMerge([[]])
      expect(merger.toArray()).toEqual([])
    })

    it('exhausts the iterator', () => {
      const merger = new KWayMerge([[1, 2], [3]])
      merger.toArray()
      expect(merger.done).toBe(true)
    })
  })

  describe('merge method', () => {
    it('merge() returns same as toArray()', () => {
      const merger = new KWayMerge([[1, 3], [2, 4]])
      expect(merger.merge()).toEqual([1, 2, 3, 4])
    })

    it('merge() exhausts the iterator', () => {
      const merger = new KWayMerge([[1], [2]])
      merger.merge()
      expect(merger.done).toBe(true)
    })
  })

  describe('drain', () => {
    it('drains all elements when no count given', () => {
      const merger = new KWayMerge([[1, 3, 5], [2, 4, 6]])
      expect(merger.drain()).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('drains specified number of elements', () => {
      const merger = new KWayMerge([[1, 3, 5], [2, 4, 6]])
      expect(merger.drain(3)).toEqual([1, 2, 3])
    })

    it('drains one element at a time', () => {
      const merger = new KWayMerge([[1, 3], [2, 4]])
      expect(merger.drain(1)).toEqual([1])
      expect(merger.drain(1)).toEqual([2])
      expect(merger.drain(1)).toEqual([3])
      expect(merger.drain(1)).toEqual([4])
      expect(merger.drain(1)).toEqual([])
    })

    it('drains remaining elements when count exceeds available', () => {
      const merger = new KWayMerge([[1, 2], [3]])
      expect(merger.drain(100)).toEqual([1, 2, 3])
    })

    it('drain with zero returns empty array', () => {
      const merger = new KWayMerge([[1, 2], [3]])
      expect(merger.drain(0)).toEqual([])
    })

    it('can drain in batches', () => {
      const merger = new KWayMerge([[1, 2, 3, 4, 5], [6, 7, 8]])
      const batch1 = merger.drain(3)
      const batch2 = merger.drain(3)
      const batch3 = merger.drain(3)
      expect(batch1).toEqual([1, 2, 3])
      expect(batch2).toEqual([4, 5, 6])
      expect(batch3).toEqual([7, 8])
    })
  })

  describe('peek', () => {
    it('returns the next element without consuming it', () => {
      const merger = new KWayMerge([[1, 3], [2, 4]])
      expect(merger.peek()).toBe(1)
      expect(merger.peek()).toBe(1)
    })

    it('returns undefined when no elements remain', () => {
      const merger = new KWayMerge([[1]])
      merger.next()
      expect(merger.peek()).toBeUndefined()
    })

    it('returns undefined for empty sources', () => {
      const merger = new KWayMerge([[], []])
      expect(merger.peek()).toBeUndefined()
    })

    it('updates after consuming an element', () => {
      const merger = new KWayMerge([[1, 3], [2, 4]])
      expect(merger.peek()).toBe(1)
      merger.next()
      expect(merger.peek()).toBe(2)
    })
  })

  describe('sourceCount', () => {
    it('returns the number of sources', () => {
      const merger = new KWayMerge([[1], [2], [3]])
      expect(merger.sourceCount).toBe(3)
    })

    it('returns 0 for no sources', () => {
      const merger = new KWayMerge([])
      expect(merger.sourceCount).toBe(0)
    })

    it('returns 1 for single source', () => {
      const merger = new KWayMerge([[1, 2, 3]])
      expect(merger.sourceCount).toBe(1)
    })

    it('counts empty sources', () => {
      const merger = new KWayMerge([[], [], []])
      expect(merger.sourceCount).toBe(3)
    })
  })

  describe('reset', () => {
    it('allows re-iteration after reset', () => {
      const merger = new KWayMerge([[1, 3], [2, 4]])
      expect(merger.toArray()).toEqual([1, 2, 3, 4])
      expect(merger.done).toBe(true)
      merger.reset()
      expect(merger.done).toBe(false)
      expect(merger.toArray()).toEqual([1, 2, 3, 4])
    })

    it('allows partial iteration then reset', () => {
      const merger = new KWayMerge([[1, 3], [2, 4]])
      merger.next()
      merger.next()
      merger.reset()
      expect(merger.next().value).toBe(1)
      expect(merger.next().value).toBe(2)
    })

    it('reset on fresh instance is safe', () => {
      const merger = new KWayMerge([[1, 2], [3, 4]])
      merger.reset()
      expect(merger.toArray()).toEqual([1, 2, 3, 4])
    })

    it('reset preserves source data', () => {
      const merger = new KWayMerge([[1, 2], [3, 4]])
      merger.toArray()
      merger.reset()
      merger.toArray()
      merger.reset()
      expect(merger.toArray()).toEqual([1, 2, 3, 4])
    })
  })

  describe('large merge', () => {
    it('merges 100 arrays of 100 elements each', () => {
      const sources: number[][] = []
      for (let i = 0; i < 100; i++) {
        const arr: number[] = []
        for (let j = 0; j < 100; j++) {
          arr.push(i * 100 + j)
        }
        sources.push(arr)
      }
      const result = KWayMerge.merge(sources)
      expect(result).toHaveLength(10000)
      for (let i = 0; i < 10000; i++) {
        expect(result[i]).toBe(i)
      }
    })

    it('merges interleaved arrays correctly', () => {
      const sources = [
        Array.from({ length: 100 }, (_, i) => i * 3),
        Array.from({ length: 100 }, (_, i) => i * 3 + 1),
        Array.from({ length: 100 }, (_, i) => i * 3 + 2),
      ]
      const result = KWayMerge.merge(sources)
      expect(result).toHaveLength(300)
      for (let i = 0; i < 300; i++) {
        expect(result[i]).toBe(i)
      }
    })

    it('handles merging with drain for large datasets', () => {
      const sources = Array.from({ length: 50 }, (_, i) =>
        Array.from({ length: 50 }, (_, j) => i * 50 + j)
      )
      const merger = new KWayMerge(sources)
      const batch1 = merger.drain(500)
      const batch2 = merger.drain(500)
      const batch3 = merger.drain(500)
      const batch4 = merger.drain(500)
      const batch5 = merger.drain(500)
      expect(batch1.length).toBe(500)
      expect(batch2.length).toBe(500)
      expect(batch3.length).toBe(500)
      expect(batch4.length).toBe(500)
      expect(batch5.length).toBe(500)
      const all = [...batch1, ...batch2, ...batch3, ...batch4, ...batch5]
      expect(all).toHaveLength(2500)
      for (let i = 0; i < 2500; i++) {
        expect(all[i]).toBe(i)
      }
    })
  })

  describe('stability', () => {
    it('preserves source order for equal elements', () => {
      const sources: { val: number; src: number }[][] = [
        [{ val: 1, src: 0 }],
        [{ val: 1, src: 1 }],
      ]
      const result = KWayMerge.merge(
        sources,
        (a, b) => a.val - b.val
      )
      expect(result[0]!.src).toBe(0)
      expect(result[1]!.src).toBe(1)
    })

    it('preserves source order with multiple equal elements', () => {
      const sources: { val: number; src: number }[][] = [
        [{ val: 1, src: 0 }, { val: 1, src: 0 }],
        [{ val: 1, src: 1 }, { val: 1, src: 1 }],
      ]
      const result = KWayMerge.merge(
        sources,
        (a, b) => a.val - b.val
      )
      expect(result.map(r => r.src)).toEqual([0, 0, 1, 1])
    })

    it('preserves order across three sources', () => {
      const sources: { val: number; src: number }[][] = [
        [{ val: 1, src: 0 }],
        [{ val: 1, src: 1 }],
        [{ val: 1, src: 2 }],
      ]
      const result = KWayMerge.merge(
        sources,
        (a, b) => a.val - b.val
      )
      expect(result.map(r => r.src)).toEqual([0, 1, 2])
    })
  })

  describe('all empty sources', () => {
    it('handles all empty arrays', () => {
      const merger = new KWayMerge([[], [], []])
      expect(merger.done).toBe(true)
      expect(merger.toArray()).toEqual([])
    })

    it('handles empty sources array', () => {
      const merger = new KWayMerge([])
      expect(merger.done).toBe(true)
      expect(merger.sourceCount).toBe(0)
    })

    it('peek returns undefined for all empty', () => {
      const merger = new KWayMerge([[], []])
      expect(merger.peek()).toBeUndefined()
    })

    it('next returns done for all empty', () => {
      const merger = new KWayMerge([[], []])
      expect(merger.next().done).toBe(true)
    })

    it('drain returns empty for all empty', () => {
      const merger = new KWayMerge([[], []])
      expect(merger.drain(5)).toEqual([])
    })
  })

  describe('single element sources', () => {
    it('merges single elements from each source', () => {
      const result = KWayMerge.merge([[3], [1], [2]])
      expect(result).toEqual([1, 2, 3])
    })

    it('handles single element with custom comparator', () => {
      const result = KWayMerge.merge([[3], [1], [2]], (a, b) => b - a)
      expect(result).toEqual([3, 2, 1])
    })

    it('peek on single elements', () => {
      const merger = new KWayMerge([[5], [3], [1]])
      expect(merger.peek()).toBe(1)
    })

    it('iterator on single elements', () => {
      const merger = new KWayMerge([[5], [3], [1]])
      const result = [...merger]
      expect(result).toEqual([1, 3, 5])
    })
  })

  describe('merge with negative numbers', () => {
    it('merges arrays with negative numbers', () => {
      const result = KWayMerge.merge([[-5, -1, 3], [-3, 0, 2]])
      expect(result).toEqual([-5, -3, -1, 0, 2, 3])
    })

    it('merges all negative numbers', () => {
      const result = KWayMerge.merge([[-10, -5], [-8, -3]])
      expect(result).toEqual([-10, -8, -5, -3])
    })

    it('handles mix of negative and positive', () => {
      const result = KWayMerge.merge([[-1, 1], [0]])
      expect(result).toEqual([-1, 0, 1])
    })

    it('handles negative numbers with duplicates', () => {
      const result = KWayMerge.merge([[-1, 0, 1], [-1, 0, 1]])
      expect(result).toEqual([-1, -1, 0, 0, 1, 1])
    })

    it('handles large negative numbers', () => {
      const result = KWayMerge.merge([[-1000000, 0], [-500000, 500000]])
      expect(result).toEqual([-1000000, -500000, 0, 500000])
    })
  })

  describe('static merge method', () => {
    it('static merge works with no comparator', () => {
      expect(KWayMerge.merge([[1, 3], [2, 4]])).toEqual([1, 2, 3, 4])
    })

    it('static merge works with comparator', () => {
      expect(KWayMerge.merge([[3, 1], [4, 2]], (a, b) => b - a)).toEqual([4, 3, 2, 1])
    })

    it('static merge with empty', () => {
      expect(KWayMerge.merge([])).toEqual([])
    })

    it('static merge with single source', () => {
      expect(KWayMerge.merge([[1, 2, 3]])).toEqual([1, 2, 3])
    })
  })

  describe('constructor isolation', () => {
    it('does not mutate input arrays', () => {
      const a = [1, 3, 5]
      const b = [2, 4, 6]
      const originalA = [...a]
      const originalB = [...b]
      const merger = new KWayMerge([a, b])
      merger.toArray()
      expect(a).toEqual(originalA)
      expect(b).toEqual(originalB)
    })

    it('produces independent copies on reset', () => {
      const merger = new KWayMerge([[1, 2], [3, 4]])
      const first = merger.toArray()
      merger.reset()
      const second = merger.toArray()
      expect(first).toEqual(second)
      expect(first).not.toBe(second)
    })
  })

  describe('edge cases', () => {
    it('handles strings', () => {
      const result = KWayMerge.merge([['a', 'c'], ['b', 'd']])
      expect(result).toEqual(['a', 'b', 'c', 'd'])
    })

    it('handles dates', () => {
      const d1 = new Date(2020, 0, 1)
      const d2 = new Date(2021, 0, 1)
      const d3 = new Date(2022, 0, 1)
      const d4 = new Date(2023, 0, 1)
      const result = KWayMerge.merge(
        [[d1, d3], [d2, d4]],
        (a, b) => a.getTime() - b.getTime()
      )
      expect(result).toEqual([d1, d2, d3, d4])
    })

    it('handles boolean-like numbers', () => {
      const result = KWayMerge.merge([[0, 1], [0, 1]])
      expect(result).toEqual([0, 0, 1, 1])
    })

    it('handles very large numbers', () => {
      const result = KWayMerge.merge([[Number.MAX_SAFE_INTEGER - 2], [Number.MAX_SAFE_INTEGER]])
      expect(result).toEqual([Number.MAX_SAFE_INTEGER - 2, Number.MAX_SAFE_INTEGER])
    })

    it('handles very small numbers', () => {
      const result = KWayMerge.merge([[Number.MIN_SAFE_INTEGER], [Number.MIN_SAFE_INTEGER + 1]])
      expect(result).toEqual([Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER + 1])
    })

    it('handles floats', () => {
      const result = KWayMerge.merge([[0.1, 0.3], [0.2, 0.4]])
      expect(result).toEqual([0.1, 0.2, 0.3, 0.4])
    })

    it('handles objects with comparator', () => {
      const obj1 = { x: 1 }
      const obj2 = { x: 2 }
      const obj3 = { x: 3 }
      const result = KWayMerge.merge(
        [[obj1, obj3], [obj2]],
        (a, b) => a.x - b.x
      )
      expect(result).toEqual([obj1, obj2, obj3])
    })
  })

  describe('iterator + drain interaction', () => {
    it('can use drain after partial iteration', () => {
      const merger = new KWayMerge([[1, 3, 5], [2, 4, 6]])
      merger.next()
      merger.next()
      const rest = merger.drain()
      expect(rest).toEqual([3, 4, 5, 6])
    })

    it('can use iterator after drain', () => {
      const merger = new KWayMerge([[1, 3, 5], [2, 4, 6]])
      merger.drain(2)
      const rest = [...merger]
      expect(rest).toEqual([3, 4, 5, 6])
    })

    it('peek after drain is correct', () => {
      const merger = new KWayMerge([[1, 3, 5], [2, 4, 6]])
      merger.drain(2)
      expect(merger.peek()).toBe(3)
    })
  })

  describe('additional coverage', () => {
    it('merges 10 sorted arrays', () => {
      const sources = Array.from({ length: 10 }, (_, i) =>
        Array.from({ length: 10 }, (_, j) => i * 10 + j)
      )
      const result = KWayMerge.merge(sources)
      expect(result).toHaveLength(100)
      for (let i = 0; i < 100; i++) {
        expect(result[i]).toBe(i)
      }
    })

    it('handles descending with all equal elements', () => {
      const result = KWayMerge.merge([[1, 1], [1, 1]], (a, b) => b - a)
      expect(result).toEqual([1, 1, 1, 1])
    })

    it('handles alternating small and large sources', () => {
      const result = KWayMerge.merge([[1, 100], [50], [25, 75]])
      expect(result).toEqual([1, 25, 50, 75, 100])
    })

    it('sourceCount after reset unchanged', () => {
      const merger = new KWayMerge([[1], [2], [3]])
      expect(merger.sourceCount).toBe(3)
      merger.reset()
      expect(merger.sourceCount).toBe(3)
    })

    it('multiple resets in sequence', () => {
      const merger = new KWayMerge([[1, 2], [3, 4]])
      for (let i = 0; i < 5; i++) {
        expect(merger.toArray()).toEqual([1, 2, 3, 4])
        merger.reset()
      }
    })

    it('drain after full consumption returns empty', () => {
      const merger = new KWayMerge([[1, 2], [3]])
      merger.toArray()
      expect(merger.drain()).toEqual([])
    })

    it('next after full consumption returns done', () => {
      const merger = new KWayMerge([[1]])
      merger.next()
      const result = merger.next()
      expect(result.done).toBe(true)
      expect(result.value).toBeUndefined()
    })

    it('merges arrays with single zero', () => {
      const result = KWayMerge.merge([[0], [0]])
      expect(result).toEqual([0, 0])
    })

    it('handles deeply interleaved sources', () => {
      const sources = Array.from({ length: 7 }, (_, i) =>
        Array.from({ length: 3 }, (_, j) => i + j * 7)
      )
      const result = KWayMerge.merge(sources)
      expect(result).toHaveLength(21)
      for (let i = 0; i < 21; i++) {
        expect(result[i]).toBe(i)
      }
    })
  })
})
