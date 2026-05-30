import { describe, it, expect } from 'vitest'
import {
  groupBy,
  chunk,
  unique,
  uniqueBy,
  partition,
  zip,
  shuffle,
  last,
  first,
  isEmpty,
  sortedBy,
  sortedByDesc,
  flatMap,
  tally,
  sum,
  average,
} from '../src/utils/array-helpers.js'

describe('array-helpers', () => {
  describe('groupBy', () => {
    it('groups items by key', () => {
      const result = groupBy([1, 2, 3, 4, 5], (n) => (n % 2 === 0 ? 'even' : 'odd'))
      expect(result.get('odd')).toEqual([1, 3, 5])
      expect(result.get('even')).toEqual([2, 4])
    })

    it('returns empty map for empty iterable', () => {
      expect(groupBy([], () => 'a')).toEqual(new Map())
    })

    it('groups by numeric key', () => {
      const result = groupBy(['a', 'bb', 'ccc'], (s) => s.length)
      expect(result.get(1)).toEqual(['a'])
      expect(result.get(2)).toEqual(['bb'])
      expect(result.get(3)).toEqual(['ccc'])
    })
  })

  describe('chunk', () => {
    it('splits into chunks of given size', () => {
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
    })

    it('returns single chunk when size < 1', () => {
      expect(chunk([1, 2, 3], 0)).toEqual([[1, 2, 3]])
      expect(chunk([1, 2, 3], -1)).toEqual([[1, 2, 3]])
    })

    it('returns empty array for empty input', () => {
      expect(chunk([], 3)).toEqual([])
    })

    it('handles exact division', () => {
      expect(chunk([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]])
    })

    it('handles size larger than array', () => {
      expect(chunk([1, 2], 10)).toEqual([[1, 2]])
    })
  })

  describe('unique', () => {
    it('removes duplicates', () => {
      expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3])
    })

    it('preserves order', () => {
      expect(unique([3, 1, 2, 1, 3])).toEqual([3, 1, 2])
    })

    it('handles empty iterable', () => {
      expect(unique([])).toEqual([])
    })

    it('handles strings', () => {
      expect(unique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c'])
    })
  })

  describe('uniqueBy', () => {
    it('deduplicates by key function', () => {
      const items = [{ id: 1, v: 'a' }, { id: 2, v: 'b' }, { id: 1, v: 'c' }]
      const result = uniqueBy(items, (x) => x.id)
      expect(result).toEqual([{ id: 1, v: 'a' }, { id: 2, v: 'b' }])
    })

    it('keeps first occurrence', () => {
      const result = uniqueBy([1, 2, 3, 2, 1], (x) => x)
      expect(result).toEqual([1, 2, 3])
    })
  })

  describe('partition', () => {
    it('splits into matching and non-matching', () => {
      const [even, odd] = partition([1, 2, 3, 4, 5], (n) => n % 2 === 0)
      expect(even).toEqual([2, 4])
      expect(odd).toEqual([1, 3, 5])
    })

    it('handles all matching', () => {
      const [yes, no] = partition([2, 4, 6], (n) => n % 2 === 0)
      expect(yes).toEqual([2, 4, 6])
      expect(no).toEqual([])
    })

    it('handles none matching', () => {
      const [yes, no] = partition([1, 3, 5], (n) => n % 2 === 0)
      expect(yes).toEqual([])
      expect(no).toEqual([1, 3, 5])
    })

    it('handles empty array', () => {
      const [yes, no] = partition([], () => true)
      expect(yes).toEqual([])
      expect(no).toEqual([])
    })
  })

  describe('zip', () => {
    it('zips two equal-length arrays', () => {
      expect(zip([1, 2, 3], ['a', 'b', 'c'])).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
    })

    it('truncates to shorter array', () => {
      expect(zip([1, 2, 3], ['a', 'b'])).toEqual([[1, 'a'], [2, 'b']])
      expect(zip([1], ['a', 'b', 'c'])).toEqual([[1, 'a']])
    })

    it('handles empty arrays', () => {
      expect(zip([], [])).toEqual([])
      expect(zip([1], [])).toEqual([])
      expect(zip([], ['a'])).toEqual([])
    })
  })

  describe('shuffle', () => {
    it('returns array with same elements', () => {
      const arr = [1, 2, 3, 4, 5]
      const shuffled = shuffle(arr)
      expect(shuffled.sort()).toEqual([1, 2, 3, 4, 5])
    })

    it('does not mutate original', () => {
      const arr = [1, 2, 3]
      shuffle(arr)
      expect(arr).toEqual([1, 2, 3])
    })

    it('handles empty array', () => {
      expect(shuffle([])).toEqual([])
    })

    it('handles single element', () => {
      expect(shuffle([42])).toEqual([42])
    })
  })

  describe('last', () => {
    it('returns last element', () => {
      expect(last([1, 2, 3])).toBe(3)
    })

    it('returns undefined for empty', () => {
      expect(last([])).toBeUndefined()
    })

    it('returns single element', () => {
      expect(last([42])).toBe(42)
    })
  })

  describe('first', () => {
    it('returns first element', () => {
      expect(first([1, 2, 3])).toBe(1)
    })

    it('returns undefined for empty', () => {
      expect(first([])).toBeUndefined()
    })
  })

  describe('isEmpty', () => {
    it('returns true for empty array', () => {
      expect(isEmpty([])).toBe(true)
    })

    it('returns false for non-empty array', () => {
      expect(isEmpty([1])).toBe(false)
    })
  })

  describe('sortedBy', () => {
    it('sorts ascending by key', () => {
      const items = [{ n: 3 }, { n: 1 }, { n: 2 }]
      expect(sortedBy(items, (x) => x.n)).toEqual([{ n: 1 }, { n: 2 }, { n: 3 }])
    })

    it('does not mutate original', () => {
      const items = [3, 1, 2]
      sortedBy(items, (x) => x)
      expect(items).toEqual([3, 1, 2])
    })

    it('handles empty array', () => {
      expect(sortedBy([], (x) => x)).toEqual([])
    })
  })

  describe('sortedByDesc', () => {
    it('sorts descending by key', () => {
      const items = [{ n: 1 }, { n: 3 }, { n: 2 }]
      expect(sortedByDesc(items, (x) => x.n)).toEqual([{ n: 3 }, { n: 2 }, { n: 1 }])
    })
  })

  describe('flatMap', () => {
    it('flattens mapped results', () => {
      expect(flatMap([1, 2, 3], (n) => [n, n * 10])).toEqual([1, 10, 2, 20, 3, 30])
    })

    it('handles empty arrays from mapper', () => {
      expect(flatMap([1, 2, 3], () => [])).toEqual([])
    })

    it('handles empty input', () => {
      expect(flatMap([], (n) => [n])).toEqual([])
    })
  })

  describe('tally', () => {
    it('counts occurrences', () => {
      expect(tally(['a', 'b', 'a', 'c', 'a', 'b'])).toEqual(
        new Map([['a', 3], ['b', 2], ['c', 1]]),
      )
    })

    it('returns empty map for empty iterable', () => {
      expect(tally([])).toEqual(new Map())
    })

    it('handles numbers', () => {
      expect(tally([1, 2, 1, 1])).toEqual(new Map([[1, 3], [2, 1]]))
    })
  })

  describe('sum', () => {
    it('sums numbers', () => {
      expect(sum([1, 2, 3, 4])).toBe(10)
    })

    it('returns 0 for empty iterable', () => {
      expect(sum([])).toBe(0)
    })

    it('handles negative numbers', () => {
      expect(sum([-1, 2, -3, 4])).toBe(2)
    })
  })

  describe('average', () => {
    it('computes mean', () => {
      expect(average([1, 2, 3, 4, 5])).toBe(3)
    })

    it('returns 0 for empty iterable', () => {
      expect(average([])).toBe(0)
    })

    it('handles single value', () => {
      expect(average([42])).toBe(42)
    })

    it('handles fractional results', () => {
      expect(average([1, 2])).toBe(1.5)
    })
  })
})
