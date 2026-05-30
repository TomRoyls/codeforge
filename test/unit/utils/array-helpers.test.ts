import { describe, test, expect } from 'vitest'
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
} from '../../../src/utils/array-helpers.js'

describe('groupBy', () => {
  test('groups items by string key function', () => {
    const items = [
      { type: 'a', value: 1 },
      { type: 'b', value: 2 },
      { type: 'a', value: 3 },
    ]
    const result = groupBy(items, (item) => item.type)
    expect(result.get('a')).toEqual([{ type: 'a', value: 1 }, { type: 'a', value: 3 }])
    expect(result.get('b')).toEqual([{ type: 'b', value: 2 }])
  })

  test('groups items by number key function', () => {
    const items = [
      { id: 1, name: 'first' },
      { id: 2, name: 'second' },
      { id: 1, name: 'first-duplicate' },
    ]
    const result = groupBy(items, (item) => item.id)
    expect(result.get(1)).toEqual([{ id: 1, name: 'first' }, { id: 1, name: 'first-duplicate' }])
    expect(result.get(2)).toEqual([{ id: 2, name: 'second' }])
  })

  test('handles empty iterable', () => {
    const result = groupBy([], (item) => item)
    expect(result.size).toBe(0)
  })

  test('handles single item', () => {
    const result = groupBy([42], (n) => n)
    expect(result.size).toBe(1)
    expect(result.get(42)).toEqual([42])
  })

  test('preserves order within groups', () => {
    const items = [
      { category: 'x', order: 1 },
      { category: 'y', order: 2 },
      { category: 'x', order: 3 },
    ]
    const result = groupBy(items, (item) => item.category)
    expect(result.get('x')).toEqual([
      { category: 'x', order: 1 },
      { category: 'x', order: 3 },
    ])
  })
})

describe('chunk', () => {
  test('chunks array into groups of specified size', () => {
    const result = chunk([1, 2, 3, 4, 5, 6], 2)
    expect(result).toEqual([[1, 2], [3, 4], [5, 6]])
  })

  test('handles empty array', () => {
    const result = chunk([], 3)
    expect(result).toEqual([])
  })

  test('handles single element', () => {
    const result = chunk([1], 5)
    expect(result).toEqual([[1]])
  })

  test('handles size larger than array', () => {
    const result = chunk([1, 2, 3], 10)
    expect(result).toEqual([[1, 2, 3]])
  })

  test('returns entire array as single chunk when size < 1', () => {
    const result = chunk([1, 2, 3], 0)
    expect(result).toEqual([[1, 2, 3]])
  })

  test('returns entire array as single chunk when size is negative', () => {
    const result = chunk([1, 2, 3], -1)
    expect(result).toEqual([[1, 2, 3]])
  })

  test('handles uneven chunk size', () => {
    const result = chunk([1, 2, 3, 4, 5], 2)
    expect(result).toEqual([[1, 2], [3, 4], [5]])
  })

  test('handles size of 1', () => {
    const result = chunk([1, 2, 3], 1)
    expect(result).toEqual([[1], [2], [3]])
  })
})

describe('unique', () => {
  test('removes duplicate values', () => {
    const result = unique([1, 2, 2, 3, 3, 3])
    expect(result).toEqual([1, 2, 3])
  })

  test('handles empty array', () => {
    const result = unique([])
    expect(result).toEqual([])
  })

  test('handles array with no duplicates', () => {
    const result = unique([1, 2, 3])
    expect(result).toEqual([1, 2, 3])
  })

  test('handles all same values', () => {
    const result = unique([5, 5, 5, 5])
    expect(result).toEqual([5])
  })

  test('works with strings', () => {
    const result = unique(['a', 'b', 'a', 'c', 'b'])
    expect(result).toEqual(['a', 'b', 'c'])
  })

  test('preserves first occurrence order', () => {
    const result = unique([3, 1, 2, 1, 3, 2])
    expect(result).toEqual([3, 1, 2])
  })
})

describe('uniqueBy', () => {
  test('removes duplicates based on key function', () => {
    const items = [
      { id: 1, value: 'first' },
      { id: 2, value: 'second' },
      { id: 1, value: 'first-duplicate' },
    ]
    const result = uniqueBy(items, (item) => item.id)
    expect(result).toEqual([
      { id: 1, value: 'first' },
      { id: 2, value: 'second' },
    ])
  })

  test('handles empty iterable', () => {
    const result = uniqueBy([], (item) => item)
    expect(result).toEqual([])
  })

  test('handles single element', () => {
    const result = uniqueBy([{ id: 1 }], (item) => item.id)
    expect(result).toEqual([{ id: 1 }])
  })

  test('handles items with no duplicates', () => {
    const items = [
      { id: 1, name: 'a' },
      { id: 2, name: 'b' },
      { id: 3, name: 'c' },
    ]
    const result = uniqueBy(items, (item) => item.id)
    expect(result).toEqual(items)
  })

  test('preserves first occurrence', () => {
    const items = [
      { id: 1, order: 1 },
      { id: 1, order: 2 },
      { id: 1, order: 3 },
    ]
    const result = uniqueBy(items, (item) => item.id)
    expect(result).toEqual([{ id: 1, order: 1 }])
  })

  test('works with different key types', () => {
    const items = [
      { key: 'a', val: 1 },
      { key: 'b', val: 2 },
      { key: 'a', val: 3 },
    ]
    const result = uniqueBy(items, (item) => item.key)
    expect(result).toEqual([
      { key: 'a', val: 1 },
      { key: 'b', val: 2 },
    ])
  })
})

describe('partition', () => {
  test('splits array based on predicate', () => {
    const result = partition([1, 2, 3, 4, 5], (n) => n % 2 === 0)
    expect(result[0]).toEqual([2, 4])
    expect(result[1]).toEqual([1, 3, 5])
  })

  test('handles empty array', () => {
    const result = partition([], (n) => n > 0)
    expect(result).toEqual([[], []])
  })

  test('handles all items matching predicate', () => {
    const result = partition([1, 2, 3], (n) => n > 0)
    expect(result[0]).toEqual([1, 2, 3])
    expect(result[1]).toEqual([])
  })

  test('handles no items matching predicate', () => {
    const result = partition([1, 2, 3], (n) => n > 10)
    expect(result[0]).toEqual([])
    expect(result[1]).toEqual([1, 2, 3])
  })

  test('preserves original order', () => {
    const result = partition([1, 2, 3, 4, 5], (n) => n % 2 === 0)
    expect(result[0]).toEqual([2, 4])
    expect(result[1]).toEqual([1, 3, 5])
  })
})

describe('zip', () => {
  test('pairs elements from two arrays', () => {
    const result = zip([1, 2, 3], ['a', 'b', 'c'])
    expect(result).toEqual([
      [1, 'a'],
      [2, 'b'],
      [3, 'c'],
    ])
  })

  test('truncates to shorter array when lengths differ', () => {
    const result = zip([1, 2, 3, 4], ['a', 'b'])
    expect(result).toEqual([
      [1, 'a'],
      [2, 'b'],
    ])
  })

  test('handles empty arrays', () => {
    const result = zip([], [])
    expect(result).toEqual([])
  })

  test('handles one empty array', () => {
    const result = zip([1, 2], [])
    expect(result).toEqual([])
  })

  test('handles single element arrays', () => {
    const result = zip([1], ['a'])
    expect(result).toEqual([[1, 'a']])
  })

  test('preserves type information', () => {
    const result = zip([1, 2], ['a', 'b'])
    const [first, second] = result[0]
    expect(typeof first).toBe('number')
    expect(typeof second).toBe('string')
  })
})

describe('shuffle', () => {
  test('returns new array with same elements', () => {
    const input = [1, 2, 3, 4, 5]
    const result = shuffle(input)
    expect(result).not.toBe(input)
    expect(result.sort()).toEqual(input)
    expect(result.length).toBe(input.length)
  })

  test('contains all original elements', () => {
    const input = [1, 2, 3, 4, 5]
    const result = shuffle(input)
    expect(new Set(result)).toEqual(new Set(input))
  })

  test('handles empty array', () => {
    const result = shuffle([])
    expect(result).toEqual([])
  })

  test('handles single element', () => {
    const result = shuffle([1])
    expect(result).toEqual([1])
  })

  test('handles duplicates correctly', () => {
    const input = [1, 1, 2, 2, 3, 3]
    const result = shuffle(input)
    expect(result.length).toBe(input.length)
    expect(result.sort()).toEqual(input)
  })
})

describe('last', () => {
  test('returns last element of array', () => {
    expect(last([1, 2, 3])).toBe(3)
  })

  test('returns undefined for empty array', () => {
    expect(last([])).toBeUndefined()
  })

  test('handles single element array', () => {
    expect(last([42])).toBe(42)
  })

  test('handles array with one element', () => {
    expect(last([1])).toBe(1)
  })

  test('returns last element with different types', () => {
    expect(last(['a', 'b', 'c'])).toBe('c')
    expect(last([{ x: 1 }, { y: 2 }])).toEqual({ y: 2 })
  })
})

describe('first', () => {
  test('returns first element of array', () => {
    expect(first([1, 2, 3])).toBe(1)
  })

  test('returns undefined for empty array', () => {
    expect(first([])).toBeUndefined()
  })

  test('handles single element array', () => {
    expect(first([42])).toBe(42)
  })

  test('returns first element with different types', () => {
    expect(first(['a', 'b', 'c'])).toBe('a')
    expect(first([{ x: 1 }, { y: 2 }])).toEqual({ x: 1 })
  })
})

describe('isEmpty', () => {
  test('returns true for empty array', () => {
    expect(isEmpty([])).toBe(true)
  })

  test('returns false for non-empty array', () => {
    expect(isEmpty([1])).toBe(false)
    expect(isEmpty([1, 2, 3])).toBe(false)
  })

  test('handles arrays with different types', () => {
    expect(isEmpty(['a'])).toBe(false)
    expect(isEmpty([null])).toBe(false)
    expect(isEmpty([undefined])).toBe(false)
  })
})

describe('sortedBy', () => {
  test('sorts array by numeric key in ascending order', () => {
    const items = [
      { value: 3 },
      { value: 1 },
      { value: 2 },
    ]
    const result = sortedBy(items, (item) => item.value)
    expect(result).toEqual([
      { value: 1 },
      { value: 2 },
      { value: 3 },
    ])
  })

  test('returns new array without modifying original', () => {
    const items = [
      { value: 3 },
      { value: 1 },
      { value: 2 },
    ]
    const result = sortedBy(items, (item) => item.value)
    expect(result).not.toBe(items)
    expect(items).toEqual([
      { value: 3 },
      { value: 1 },
      { value: 2 },
    ])
  })

  test('handles empty array', () => {
    const result = sortedBy([], (item) => item.value)
    expect(result).toEqual([])
  })

  test('handles single element', () => {
    const result = sortedBy([{ value: 1 }], (item) => item.value)
    expect(result).toEqual([{ value: 1 }])
  })

  test('handles already sorted array', () => {
    const items = [
      { value: 1 },
      { value: 2 },
      { value: 3 },
    ]
    const result = sortedBy(items, (item) => item.value)
    expect(result).toEqual(items)
  })

  test('handles duplicate keys', () => {
    const items = [
      { value: 2, name: 'first' },
      { value: 1, name: 'second' },
      { value: 2, name: 'third' },
    ]
    const result = sortedBy(items, (item) => item.value)
    expect(result).toEqual([
      { value: 1, name: 'second' },
      { value: 2, name: 'first' },
      { value: 2, name: 'third' },
    ])
  })
})

describe('sortedByDesc', () => {
  test('sorts array by numeric key in descending order', () => {
    const items = [
      { value: 1 },
      { value: 3 },
      { value: 2 },
    ]
    const result = sortedByDesc(items, (item) => item.value)
    expect(result).toEqual([
      { value: 3 },
      { value: 2 },
      { value: 1 },
    ])
  })

  test('returns new array without modifying original', () => {
    const items = [
      { value: 1 },
      { value: 3 },
      { value: 2 },
    ]
    const result = sortedByDesc(items, (item) => item.value)
    expect(result).not.toBe(items)
    expect(items).toEqual([
      { value: 1 },
      { value: 3 },
      { value: 2 },
    ])
  })

  test('handles empty array', () => {
    const result = sortedByDesc([], (item) => item.value)
    expect(result).toEqual([])
  })

  test('handles single element', () => {
    const result = sortedByDesc([{ value: 1 }], (item) => item.value)
    expect(result).toEqual([{ value: 1 }])
  })

  test('handles already sorted descending array', () => {
    const items = [
      { value: 3 },
      { value: 2 },
      { value: 1 },
    ]
    const result = sortedByDesc(items, (item) => item.value)
    expect(result).toEqual(items)
  })
})

describe('flatMap', () => {
  test('flattens mapped arrays', () => {
    const items = [1, 2, 3]
    const result = flatMap(items, (n) => [n, n * 2])
    expect(result).toEqual([1, 2, 2, 4, 3, 6])
  })

  test('handles empty array', () => {
    const result = flatMap([], (n) => [n, n * 2])
    expect(result).toEqual([])
  })

  test('handles single element', () => {
    const result = flatMap([1], (n) => [n, n * 2])
    expect(result).toEqual([1, 2])
  })

  test('handles mapping to empty arrays', () => {
    const result = flatMap([1, 2, 3], (n) => [])
    expect(result).toEqual([])
  })

  test('handles mapping to arrays of different lengths', () => {
    const items = [1, 2, 3]
    const result = flatMap(items, (n) => Array(n).fill(n))
    expect(result).toEqual([1, 2, 2, 3, 3, 3])
  })

  test('preserves order', () => {
    const items = [1, 2, 3]
    const result = flatMap(items, (n) => [{ x: n }])
    expect(result).toEqual([
      { x: 1 },
      { x: 2 },
      { x: 3 },
    ])
  })
})

describe('tally', () => {
  test('counts occurrences of each item', () => {
    const result = tally([1, 2, 2, 3, 3, 3])
    expect(result.get(1)).toBe(1)
    expect(result.get(2)).toBe(2)
    expect(result.get(3)).toBe(3)
  })

  test('handles empty iterable', () => {
    const result = tally([])
    expect(result.size).toBe(0)
  })

  test('handles single element', () => {
    const result = tally([42])
    expect(result.get(42)).toBe(1)
    expect(result.size).toBe(1)
  })

  test('counts strings correctly', () => {
    const result = tally(['a', 'b', 'a', 'c', 'b', 'a'])
    expect(result.get('a')).toBe(3)
    expect(result.get('b')).toBe(2)
    expect(result.get('c')).toBe(1)
  })

  test('handles objects as keys', () => {
    const obj1 = { id: 1 }
    const obj2 = { id: 2 }
    const result = tally([obj1, obj2, obj1])
    expect(result.get(obj1)).toBe(2)
    expect(result.get(obj2)).toBe(1)
  })

  test('handles Set as iterable', () => {
    const result = tally(new Set([1, 2, 2, 3]))
    expect(result.get(1)).toBe(1)
    expect(result.get(2)).toBe(1)
    expect(result.get(3)).toBe(1)
  })
})

describe('sum', () => {
  test('sums all numbers in array', () => {
    expect(sum([1, 2, 3, 4, 5])).toBe(15)
  })

  test('returns 0 for empty iterable', () => {
    expect(sum([])).toBe(0)
  })

  test('handles single element', () => {
    expect(sum([42])).toBe(42)
  })

  test('handles negative numbers', () => {
    expect(sum([1, -2, 3, -4])).toBe(-2)
  })

  test('handles decimal numbers', () => {
    expect(sum([1.5, 2.5, 3])).toBe(7)
  })

  test('handles Set as iterable', () => {
    expect(sum(new Set([1, 2, 3]))).toBe(6)
  })

  test('handles zeros', () => {
    expect(sum([0, 0, 0])).toBe(0)
  })
})

describe('average', () => {
  test('calculates arithmetic mean', () => {
    expect(average([1, 2, 3, 4, 5])).toBe(3)
  })

  test('returns 0 for empty iterable', () => {
    expect(average([])).toBe(0)
  })

  test('handles single element', () => {
    expect(average([42])).toBe(42)
  })

  test('handles negative numbers', () => {
    expect(average([-2, 0, 2])).toBe(0)
  })

  test('handles decimal numbers', () => {
    expect(average([1.5, 2.5, 3])).toBe(2.3333333333333335)
  })

  test('handles Set as iterable', () => {
    expect(average(new Set([1, 2, 3]))).toBe(2)
  })

  test('handles identical numbers', () => {
    expect(average([5, 5, 5, 5])).toBe(5)
  })
})