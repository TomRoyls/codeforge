import { describe, it, expect } from 'vitest'
import {
  fibonacciSearch,
  fibonacciSearchFirst,
  fibonacciSearchLast,
  fibonacciInsertIndex,
  fibonacciSearchRange,
  fibonacciSearchBy,
  isSorted,
  fibonacciSearchClosest,
  DEFAULT_COMPARE,
} from '../../src/core/fibonacci-search/fibonacci-search.js'
import type { CompareFn } from '../../src/core/fibonacci-search/fibonacci-search.js'

describe('fibonacciSearch', () => {
  it('returns -1 for empty array', () => {
    expect(fibonacciSearch([], 5)).toBe(-1)
  })

  it('finds element in single-element array', () => {
    expect(fibonacciSearch([5], 5)).toBe(0)
  })

  it('returns -1 for single-element array when not found', () => {
    expect(fibonacciSearch([3], 5)).toBe(-1)
  })

  it('finds first element in two-element array', () => {
    expect(fibonacciSearch([1, 3], 1)).toBe(0)
  })

  it('finds second element in two-element array', () => {
    expect(fibonacciSearch([1, 3], 3)).toBe(1)
  })

  it('returns -1 in two-element array when not found', () => {
    expect(fibonacciSearch([1, 3], 2)).toBe(-1)
  })

  it('finds element at beginning of array', () => {
    expect(fibonacciSearch([1, 2, 3, 4, 5], 1)).toBe(0)
  })

  it('finds element at end of array', () => {
    expect(fibonacciSearch([1, 2, 3, 4, 5], 5)).toBe(4)
  })

  it('finds element in middle of array', () => {
    expect(fibonacciSearch([1, 2, 3, 4, 5], 3)).toBe(2)
  })

  it('returns -1 when target is less than all elements', () => {
    expect(fibonacciSearch([10, 20, 30], 5)).toBe(-1)
  })

  it('returns -1 when target is greater than all elements', () => {
    expect(fibonacciSearch([10, 20, 30], 40)).toBe(-1)
  })

  it('finds element in array with duplicates', () => {
    const result = fibonacciSearch([1, 2, 2, 2, 3], 2)
    expect(result).toBeGreaterThanOrEqual(1)
    expect(result).toBeLessThanOrEqual(3)
  })

  it('works with negative numbers', () => {
    expect(fibonacciSearch([-5, -3, -1, 0, 2], -3)).toBe(1)
  })

  it('works with large arrays', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i * 2)
    expect(fibonacciSearch(arr, 500)).toBe(250)
  })

  it('returns -1 for target not in large array', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i * 2)
    expect(fibonacciSearch(arr, 501)).toBe(-1)
  })

  it('finds element at index 0 in large array', () => {
    const arr = Array.from({ length: 100 }, (_, i) => i)
    expect(fibonacciSearch(arr, 0)).toBe(0)
  })

  it('finds last element in large array', () => {
    const arr = Array.from({ length: 100 }, (_, i) => i)
    expect(fibonacciSearch(arr, 99)).toBe(99)
  })

  it('uses custom compare function', () => {
    const arr = [{ v: 1 }, { v: 3 }, { v: 5 }]
    const cmp = (a: { v: number }, b: { v: number }) => a.v - b.v
    expect(fibonacciSearch(arr, { v: 3 }, cmp)).toBe(1)
  })

  it('works with string comparison', () => {
    const arr = ['apple', 'banana', 'cherry', 'date']
    expect(fibonacciSearch(arr, 'cherry')).toBe(2)
  })

  it('returns -1 for missing string', () => {
    const arr = ['apple', 'banana', 'cherry']
    expect(fibonacciSearch(arr, 'grape')).toBe(-1)
  })

  it('handles array of size 3', () => {
    expect(fibonacciSearch([1, 2, 3], 2)).toBe(1)
  })

  it('handles array of size 8', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8]
    expect(fibonacciSearch(arr, 6)).toBe(5)
  })

  it('handles array of size 13 (fibonacci number)', () => {
    const arr = Array.from({ length: 13 }, (_, i) => i + 1)
    expect(fibonacciSearch(arr, 7)).toBe(6)
  })

  it('handles all identical elements', () => {
    const result = fibonacciSearch([5, 5, 5, 5, 5], 5)
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(4)
  })

  it('handles descending custom compare', () => {
    const arr = [10, 8, 6, 4, 2]
    const descCmp = (a: number, b: number) => b - a
    expect(fibonacciSearch(arr, 6, descCmp)).toBe(2)
  })

  it('finds element in size-4 array', () => {
    expect(fibonacciSearch([1, 2, 3, 4], 1)).toBe(0)
  })

  it('finds element in size-6 array', () => {
    expect(fibonacciSearch([1, 2, 3, 4, 5, 6], 4)).toBe(3)
  })

  it('finds element in size-7 array', () => {
    expect(fibonacciSearch([1, 2, 3, 4, 5, 6, 7], 5)).toBe(4)
  })

  it('works with array of size 21 (fibonacci)', () => {
    const arr = Array.from({ length: 21 }, (_, i) => i * 3)
    expect(fibonacciSearch(arr, 30)).toBe(10)
  })
})

describe('fibonacciSearchFirst', () => {
  it('returns -1 for empty array', () => {
    expect(fibonacciSearchFirst([], 5)).toBe(-1)
  })

  it('finds element in single-element array', () => {
    expect(fibonacciSearchFirst([5], 5)).toBe(0)
  })

  it('finds first occurrence with duplicates', () => {
    expect(fibonacciSearchFirst([1, 2, 2, 2, 3], 2)).toBe(1)
  })

  it('finds first occurrence when all elements are the same', () => {
    expect(fibonacciSearchFirst([5, 5, 5, 5], 5)).toBe(0)
  })

  it('returns -1 when target not found', () => {
    expect(fibonacciSearchFirst([1, 2, 3, 4, 5], 6)).toBe(-1)
  })

  it('finds first element', () => {
    expect(fibonacciSearchFirst([1, 2, 3], 1)).toBe(0)
  })

  it('finds last element', () => {
    expect(fibonacciSearchFirst([1, 2, 3], 3)).toBe(2)
  })

  it('finds first of two-element duplicate block', () => {
    expect(fibonacciSearchFirst([1, 3, 3, 5], 3)).toBe(1)
  })

  it('finds first in array with many duplicates', () => {
    expect(fibonacciSearchFirst([1, 1, 1, 1, 2, 2, 2, 3, 3], 2)).toBe(4)
  })

  it('works with custom compare', () => {
    const arr = [{ v: 1 }, { v: 2 }, { v: 2 }, { v: 3 }]
    const cmp = (a: { v: number }, b: { v: number }) => a.v - b.v
    expect(fibonacciSearchFirst(arr, { v: 2 }, cmp)).toBe(1)
  })

  it('handles duplicates at start', () => {
    expect(fibonacciSearchFirst([2, 2, 2, 3, 4], 2)).toBe(0)
  })

  it('handles duplicates at end', () => {
    expect(fibonacciSearchFirst([1, 2, 3, 3, 3], 3)).toBe(2)
  })

  it('handles single duplicate pair', () => {
    expect(fibonacciSearchFirst([1, 2, 3, 3, 4], 3)).toBe(2)
  })

  it('returns first when no duplicates', () => {
    expect(fibonacciSearchFirst([1, 3, 5, 7, 9], 5)).toBe(2)
  })
})

describe('fibonacciSearchLast', () => {
  it('returns -1 for empty array', () => {
    expect(fibonacciSearchLast([], 5)).toBe(-1)
  })

  it('finds element in single-element array', () => {
    expect(fibonacciSearchLast([5], 5)).toBe(0)
  })

  it('finds last occurrence with duplicates', () => {
    expect(fibonacciSearchLast([1, 2, 2, 2, 3], 2)).toBe(3)
  })

  it('finds last occurrence when all elements are the same', () => {
    expect(fibonacciSearchLast([5, 5, 5, 5], 5)).toBe(3)
  })

  it('returns -1 when target not found', () => {
    expect(fibonacciSearchLast([1, 2, 3, 4, 5], 6)).toBe(-1)
  })

  it('finds last of two-element duplicate block', () => {
    expect(fibonacciSearchLast([1, 3, 3, 5], 3)).toBe(2)
  })

  it('finds last in array with many duplicates', () => {
    expect(fibonacciSearchLast([1, 1, 1, 1, 2, 2, 2, 3, 3], 2)).toBe(6)
  })

  it('works with custom compare', () => {
    const arr = [{ v: 1 }, { v: 2 }, { v: 2 }, { v: 3 }]
    const cmp = (a: { v: number }, b: { v: number }) => a.v - b.v
    expect(fibonacciSearchLast(arr, { v: 2 }, cmp)).toBe(2)
  })

  it('handles duplicates at start', () => {
    expect(fibonacciSearchLast([2, 2, 2, 3, 4], 2)).toBe(2)
  })

  it('handles duplicates at end', () => {
    expect(fibonacciSearchLast([1, 2, 3, 3, 3], 3)).toBe(4)
  })

  it('returns correct index when no duplicates', () => {
    expect(fibonacciSearchLast([1, 3, 5, 7, 9], 5)).toBe(2)
  })

  it('handles large block of duplicates', () => {
    const arr = [1, 2, 2, 2, 2, 2, 2, 2, 2, 3]
    expect(fibonacciSearchLast(arr, 2)).toBe(8)
  })
})

describe('fibonacciInsertIndex', () => {
  it('returns 0 for empty array', () => {
    expect(fibonacciInsertIndex([], 5)).toBe(0)
  })

  it('returns 0 when target is less than all elements', () => {
    expect(fibonacciInsertIndex([10, 20, 30], 5)).toBe(0)
  })

  it('returns length when target is greater than all elements', () => {
    expect(fibonacciInsertIndex([10, 20, 30], 40)).toBe(3)
  })

  it('returns index of existing element', () => {
    expect(fibonacciInsertIndex([1, 2, 3, 4, 5], 3)).toBe(2)
  })

  it('returns correct index for value between elements', () => {
    expect(fibonacciInsertIndex([1, 3, 5, 7], 4)).toBe(2)
  })

  it('returns 0 for target less than first', () => {
    expect(fibonacciInsertIndex([5, 10, 15], 1)).toBe(0)
  })

  it('returns length for target greater than last', () => {
    expect(fibonacciInsertIndex([5, 10, 15], 20)).toBe(3)
  })

  it('returns first index for duplicates', () => {
    expect(fibonacciInsertIndex([1, 2, 2, 2, 3], 2)).toBe(1)
  })

  it('works with single-element array - existing', () => {
    expect(fibonacciInsertIndex([5], 5)).toBe(0)
  })

  it('works with single-element array - smaller', () => {
    expect(fibonacciInsertIndex([5], 3)).toBe(0)
  })

  it('works with single-element array - larger', () => {
    expect(fibonacciInsertIndex([5], 7)).toBe(1)
  })

  it('works with custom compare', () => {
    const arr = [{ v: 1 }, { v: 3 }, { v: 5 }]
    const cmp = (a: { v: number }, b: { v: number }) => a.v - b.v
    expect(fibonacciInsertIndex(arr, { v: 4 }, cmp)).toBe(2)
  })

  it('handles insert at beginning', () => {
    expect(fibonacciInsertIndex([10, 20, 30], 5)).toBe(0)
  })

  it('handles insert at end', () => {
    expect(fibonacciInsertIndex([10, 20, 30], 35)).toBe(3)
  })

  it('handles insert in middle', () => {
    expect(fibonacciInsertIndex([1, 3, 5, 7, 9], 6)).toBe(3)
  })

  it('handles negative numbers', () => {
    expect(fibonacciInsertIndex([-10, -5, 0, 5, 10], -3)).toBe(2)
  })
})

describe('fibonacciSearchRange', () => {
  it('returns [-1, -1] for empty array', () => {
    expect(fibonacciSearchRange([], 5)).toEqual([-1, -1])
  })

  it('returns [0, 0] for single matching element', () => {
    expect(fibonacciSearchRange([5], 5)).toEqual([0, 0])
  })

  it('returns [-1, -1] when not found', () => {
    expect(fibonacciSearchRange([1, 2, 3], 5)).toEqual([-1, -1])
  })

  it('returns correct range for duplicates', () => {
    expect(fibonacciSearchRange([1, 2, 2, 2, 3], 2)).toEqual([1, 3])
  })

  it('returns [n, n] for single occurrence', () => {
    expect(fibonacciSearchRange([1, 2, 3], 2)).toEqual([1, 1])
  })

  it('returns correct range when all elements match', () => {
    expect(fibonacciSearchRange([5, 5, 5, 5], 5)).toEqual([0, 3])
  })

  it('returns correct range at beginning', () => {
    expect(fibonacciSearchRange([2, 2, 3, 4, 5], 2)).toEqual([0, 1])
  })

  it('returns correct range at end', () => {
    expect(fibonacciSearchRange([1, 2, 3, 4, 4], 4)).toEqual([3, 4])
  })

  it('works with custom compare', () => {
    const arr = [{ v: 1 }, { v: 2 }, { v: 2 }, { v: 3 }]
    const cmp = (a: { v: number }, b: { v: number }) => a.v - b.v
    expect(fibonacciSearchRange(arr, { v: 2 }, cmp)).toEqual([1, 2])
  })

  it('returns [-1, -1] for value between elements', () => {
    expect(fibonacciSearchRange([1, 3, 5], 2)).toEqual([-1, -1])
  })
})

describe('fibonacciSearchBy', () => {
  it('returns -1 for empty array', () => {
    expect(fibonacciSearchBy([], 5, (x: number) => x)).toBe(-1)
  })

  it('finds element by key', () => {
    const arr = [{ name: 'a', id: 1 }, { name: 'b', id: 2 }, { name: 'c', id: 3 }]
    expect(fibonacciSearchBy(arr, 2, (item) => item.id)).toBe(1)
  })

  it('returns -1 when key not found', () => {
    const arr = [{ name: 'a', id: 1 }, { name: 'b', id: 3 }]
    expect(fibonacciSearchBy(arr, 2, (item) => item.id)).toBe(-1)
  })

  it('works with string keys', () => {
    const arr = [{ name: 'apple' }, { name: 'banana' }, { name: 'cherry' }]
    expect(fibonacciSearchBy(arr, 'banana', (item) => item.name)).toBe(1)
  })

  it('finds first element by key', () => {
    const arr = [{ v: 10 }, { v: 20 }, { v: 30 }]
    expect(fibonacciSearchBy(arr, 10, (item) => item.v)).toBe(0)
  })

  it('finds last element by key', () => {
    const arr = [{ v: 10 }, { v: 20 }, { v: 30 }]
    expect(fibonacciSearchBy(arr, 30, (item) => item.v)).toBe(2)
  })

  it('uses custom compare', () => {
    const arr = [{ v: 'a' }, { v: 'b' }, { v: 'c' }]
    const cmp = (a: string, b: string) => a.localeCompare(b)
    expect(fibonacciSearchBy(arr, 'b', (item) => item.v, cmp)).toBe(1)
  })

  it('handles single-element array', () => {
    expect(fibonacciSearchBy([{ v: 5 }], 5, (item) => item.v)).toBe(0)
  })

  it('handles single-element not found', () => {
    expect(fibonacciSearchBy([{ v: 5 }], 3, (item) => item.v)).toBe(-1)
  })

  it('works with numeric key function', () => {
    const arr = [10, 20, 30, 40, 50]
    expect(fibonacciSearchBy(arr, 30, (x) => x)).toBe(2)
  })

  it('handles large array with key function', () => {
    const arr = Array.from({ length: 100 }, (_, i) => ({ id: i * 2 }))
    expect(fibonacciSearchBy(arr, 100, (item) => item.id)).toBe(50)
  })

  it('returns -1 for missing key in large array', () => {
    const arr = Array.from({ length: 100 }, (_, i) => ({ id: i * 2 }))
    expect(fibonacciSearchBy(arr, 101, (item) => item.id)).toBe(-1)
  })
})

describe('isSorted', () => {
  it('returns true for empty array', () => {
    expect(isSorted([])).toBe(true)
  })

  it('returns true for single-element array', () => {
    expect(isSorted([1])).toBe(true)
  })

  it('returns true for sorted array', () => {
    expect(isSorted([1, 2, 3, 4, 5])).toBe(true)
  })

  it('returns false for unsorted array', () => {
    expect(isSorted([3, 1, 2])).toBe(false)
  })

  it('returns true for array with equal adjacent elements', () => {
    expect(isSorted([1, 2, 2, 3])).toBe(true)
  })

  it('returns true for all same elements', () => {
    expect(isSorted([5, 5, 5, 5])).toBe(true)
  })

  it('returns false for descending array with default compare', () => {
    expect(isSorted([5, 4, 3, 2, 1])).toBe(false)
  })

  it('returns true for descending array with descending compare', () => {
    expect(isSorted([5, 4, 3, 2, 1], (a, b) => b - a)).toBe(true)
  })

  it('works with custom compare', () => {
    const arr = [{ v: 1 }, { v: 2 }, { v: 3 }]
    const cmp = (a: { v: number }, b: { v: number }) => a.v - b.v
    expect(isSorted(arr, cmp)).toBe(true)
  })

  it('detects unsorted with custom compare', () => {
    const arr = [{ v: 3 }, { v: 1 }, { v: 2 }]
    const cmp = (a: { v: number }, b: { v: number }) => a.v - b.v
    expect(isSorted(arr, cmp)).toBe(false)
  })

  it('returns true for two-element sorted array', () => {
    expect(isSorted([1, 2])).toBe(true)
  })

  it('returns false for two-element unsorted array', () => {
    expect(isSorted([2, 1])).toBe(false)
  })

  it('works with string arrays', () => {
    expect(isSorted(['a', 'b', 'c'])).toBe(true)
  })

  it('detects unsorted string arrays', () => {
    expect(isSorted(['c', 'a', 'b'])).toBe(false)
  })

  it('works with negative numbers', () => {
    expect(isSorted([-5, -3, -1, 0, 2])).toBe(true)
  })
})

describe('fibonacciSearchClosest', () => {
  it('returns -1 for empty array', () => {
    expect(fibonacciSearchClosest([], 5)).toBe(-1)
  })

  it('returns 0 for single-element array', () => {
    expect(fibonacciSearchClosest([5], 5)).toBe(0)
  })

  it('returns 0 for single-element array with different target', () => {
    expect(fibonacciSearchClosest([5], 3)).toBe(0)
  })

  it('returns exact match when found', () => {
    expect(fibonacciSearchClosest([1, 3, 5, 7, 9], 5)).toBe(2)
  })

  it('returns closest element when not found', () => {
    const cmp = (a: number, b: number) => a - b
    const result = fibonacciSearchClosest([1, 4, 7, 10], 5, cmp)
    expect(result).toBe(1)
  })

  it('returns lower index when equidistant', () => {
    const cmp = (a: number, b: number) => a - b
    const result = fibonacciSearchClosest([1, 3, 7, 9], 5, cmp)
    expect(result).toBe(1)
  })

  it('returns first element when target is less than all', () => {
    const cmp = (a: number, b: number) => a - b
    expect(fibonacciSearchClosest([10, 20, 30], 5, cmp)).toBe(0)
  })

  it('returns last element when target is greater than all', () => {
    const cmp = (a: number, b: number) => a - b
    expect(fibonacciSearchClosest([10, 20, 30], 40, cmp)).toBe(2)
  })

  it('works with custom compare', () => {
    const arr = [{ v: 1 }, { v: 4 }, { v: 7 }]
    const cmp = (a: { v: number }, b: { v: number }) => a.v - b.v
    expect(fibonacciSearchClosest(arr, { v: 5 }, cmp)).toBe(1)
  })

  it('finds closest in two-element array', () => {
    const cmp = (a: number, b: number) => a - b
    expect(fibonacciSearchClosest([1, 10], 8, cmp)).toBe(1)
  })

  it('finds closest in two-element array - lower', () => {
    const cmp = (a: number, b: number) => a - b
    expect(fibonacciSearchClosest([1, 10], 3, cmp)).toBe(0)
  })

  it('works with negative numbers', () => {
    const cmp = (a: number, b: number) => a - b
    const result = fibonacciSearchClosest([-10, -5, 0, 5, 10], -3, cmp)
    expect(result).toBe(1)
  })

  it('returns exact match at start', () => {
    expect(fibonacciSearchClosest([1, 5, 9], 1)).toBe(0)
  })

  it('returns exact match at end', () => {
    expect(fibonacciSearchClosest([1, 5, 9], 9)).toBe(2)
  })

  it('works with large array', () => {
    const cmp = (a: number, b: number) => a - b
    const arr = Array.from({ length: 100 }, (_, i) => i * 3)
    expect(fibonacciSearchClosest(arr, 50, cmp)).toBe(17)
  })
})

describe('DEFAULT_COMPARE', () => {
  it('returns -1 when a < b', () => {
    expect(DEFAULT_COMPARE(1, 2)).toBe(-1)
  })

  it('returns 1 when a > b', () => {
    expect(DEFAULT_COMPARE(2, 1)).toBe(1)
  })

  it('returns 0 when a equals b', () => {
    expect(DEFAULT_COMPARE(5, 5)).toBe(0)
  })

  it('works with strings', () => {
    expect(DEFAULT_COMPARE('a', 'b')).toBe(-1)
  })
})

describe('fibonacciSearch edge cases', () => {
  it('handles array size equal to fibonacci number 1', () => {
    expect(fibonacciSearch([1], 1)).toBe(0)
  })

  it('handles array size equal to fibonacci number 2', () => {
    expect(fibonacciSearch([1, 2], 1)).toBe(0)
  })

  it('handles array size equal to fibonacci number 3', () => {
    expect(fibonacciSearch([1, 2, 3], 2)).toBe(1)
  })

  it('handles array size equal to fibonacci number 5', () => {
    expect(fibonacciSearch([1, 2, 3, 4, 5], 3)).toBe(2)
  })

  it('handles array size equal to fibonacci number 8', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8]
    expect(fibonacciSearch(arr, 5)).toBe(4)
  })

  it('handles array size one less than fibonacci number', () => {
    const arr = [1, 2, 3, 4]
    expect(fibonacciSearch(arr, 3)).toBe(2)
  })

  it('handles array size one more than fibonacci number', () => {
    const arr = [1, 2, 3, 4, 5, 6]
    expect(fibonacciSearch(arr, 4)).toBe(3)
  })

  it('handles floating point numbers', () => {
    expect(fibonacciSearch([1.1, 2.2, 3.3, 4.4], 3.3)).toBe(2)
  })

  it('handles zero', () => {
    expect(fibonacciSearch([0, 1, 2, 3], 0)).toBe(0)
  })

  it('handles all zeros', () => {
    const result = fibonacciSearch([0, 0, 0, 0], 0)
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(3)
  })

  it('fibonacciSearchFirst with all same returns 0', () => {
    expect(fibonacciSearchFirst([7, 7, 7, 7, 7], 7)).toBe(0)
  })

  it('fibonacciSearchLast with all same returns last', () => {
    expect(fibonacciSearchLast([7, 7, 7, 7, 7], 7)).toBe(4)
  })

  it('fibonacciSearchRange with single occurrence returns [i, i]', () => {
    expect(fibonacciSearchRange([1, 2, 3], 2)).toEqual([1, 1])
  })

  it('fibonacciInsertIndex with duplicate target returns first index', () => {
    expect(fibonacciInsertIndex([1, 2, 2, 2, 3], 2)).toBe(1)
  })

  it('fibonacciSearchClosest returns exact match over nearby', () => {
    expect(fibonacciSearchClosest([1, 5, 10], 5)).toBe(1)
  })

  it('fibonacciSearchBy works with complex objects', () => {
    interface Item {
      data: { score: number }
    }
    const arr: Item[] = [
      { data: { score: 10 } },
      { data: { score: 20 } },
      { data: { score: 30 } },
    ]
    expect(fibonacciSearchBy(arr, 20, (item) => item.data.score)).toBe(1)
  })

  it('handles descending sorted array with reverse compare', () => {
    const arr = [100, 80, 60, 40, 20]
    const cmp: CompareFn<number> = (a, b) => b - a
    expect(isSorted(arr, cmp)).toBe(true)
    expect(fibonacciSearch(arr, 60, cmp)).toBe(2)
  })

  it('handles repeated search operations consistently', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    for (let i = 0; i < 10; i++) {
      expect(fibonacciSearch(arr, i + 1)).toBe(i)
    }
  })

  it('fibonacciSearchClosest with adjacent equal distance prefers lower', () => {
    const result = fibonacciSearchClosest([0, 10], 5)
    expect(result).toBe(0)
  })

  it('handles large duplicate ranges', () => {
    const arr = Array.from({ length: 50 }, () => 42)
    expect(fibonacciSearchFirst(arr, 42)).toBe(0)
    expect(fibonacciSearchLast(arr, 42)).toBe(49)
    expect(fibonacciSearchRange(arr, 42)).toEqual([0, 49])
  })

  it('fibonacciSearchBy returns first match with duplicates', () => {
    const arr = [{ v: 2 }, { v: 2 }, { v: 2 }]
    const result = fibonacciSearchBy(arr, 2, (item) => item.v)
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(2)
  })

  it('isSorted handles large sorted arrays', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i)
    expect(isSorted(arr)).toBe(true)
  })

  it('isSorted detects single violation', () => {
    const arr = Array.from({ length: 100 }, (_, i) => i)
    arr[50] = 0
    expect(isSorted(arr)).toBe(false)
  })

  it('fibonacciInsertIndex for value between two elements', () => {
    expect(fibonacciInsertIndex([1, 5], 3)).toBe(1)
  })

  it('handles array of size 34 (fibonacci)', () => {
    const arr = Array.from({ length: 34 }, (_, i) => i)
    expect(fibonacciSearch(arr, 33)).toBe(33)
    expect(fibonacciSearch(arr, 0)).toBe(0)
    expect(fibonacciSearch(arr, 17)).toBe(17)
  })

  it('fibonacciSearchClosest with single value', () => {
    expect(fibonacciSearchClosest([100], 1)).toBe(0)
    expect(fibonacciSearchClosest([100], 200)).toBe(0)
  })

  it('fibonacciSearchRange with empty result', () => {
    expect(fibonacciSearchRange([1, 3, 5], 2)).toEqual([-1, -1])
  })

  it('works with array of size 2 edge cases', () => {
    expect(fibonacciSearchFirst([1, 2], 1)).toBe(0)
    expect(fibonacciSearchFirst([1, 2], 2)).toBe(1)
    expect(fibonacciSearchLast([1, 2], 1)).toBe(0)
    expect(fibonacciSearchLast([1, 2], 2)).toBe(1)
  })

  it('fibonacciInsertIndex handles empty array', () => {
    expect(fibonacciInsertIndex([], 42)).toBe(0)
  })

  it('fibonacciSearchFirst and Last with no duplicates agree', () => {
    const arr = [1, 3, 5, 7, 9]
    const first = fibonacciSearchFirst(arr, 5)
    const last = fibonacciSearchLast(arr, 5)
    expect(first).toBe(last)
    expect(first).toBe(2)
  })

  it('fibonacciSearchClosest prefers exact match', () => {
    const arr = [1, 4, 5, 6, 9]
    expect(fibonacciSearchClosest(arr, 5)).toBe(2)
  })
})
