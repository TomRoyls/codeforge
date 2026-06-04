import { describe, it, expect } from 'vitest'
import { TimSort } from '../../src/utils/tim-sort.js'

describe('TimSort', () => {
  it('sorts empty array', () => {
    const result = TimSort.sort([])
    expect(result).toEqual([])
  })

  it('sorts single element array', () => {
    const result = TimSort.sort([1])
    expect(result).toEqual([1])
  })

  it('sorts two elements in ascending order', () => {
    const result = TimSort.sort([1, 2])
    expect(result).toEqual([1, 2])
  })

  it('sorts two elements in descending order', () => {
    const result = TimSort.sort([2, 1])
    expect(result).toEqual([1, 2])
  })

  it('sorts array of numbers', () => {
    const result = TimSort.sort([5, 2, 8, 1, 9, 3])
    expect(result).toEqual([1, 2, 3, 5, 8, 9])
  })

  it('sorts array with duplicates', () => {
    const result = TimSort.sort([3, 1, 4, 1, 5, 9, 2, 6, 5])
    expect(result).toEqual([1, 1, 2, 3, 4, 5, 5, 6, 9])
  })

  it('sorts array with negative numbers', () => {
    const result = TimSort.sort([3, -1, 4, -5, 9, -2])
    expect(result).toEqual([-5, -2, -1, 3, 4, 9])
  })

  it('sorts using custom comparator for descending order', () => {
    const result = TimSort.sort([1, 2, 3, 4, 5], (a, b) => (a > b ? -1 : a < b ? 1 : 0))
    expect(result).toEqual([5, 4, 3, 2, 1])
  })

  it('sorts strings alphabetically', () => {
    const result = TimSort.sort(['zebra', 'apple', 'banana', 'cherry'])
    expect(result).toEqual(['apple', 'banana', 'cherry', 'zebra'])
  })

  it('sorts array of objects by property', () => {
    const input = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
      { name: 'Charlie', age: 35 }
    ]
    const result = TimSort.sort(input, (a, b) => a.age - b.age)
    expect(result.map((x) => x.name)).toEqual(['Bob', 'Alice', 'Charlie'])
  })

  it('does not mutate original array', () => {
    const original = [3, 1, 2]
    const copy = [...original]
    TimSort.sort(original)
    expect(original).toEqual(copy)
  })

  it('returns new sorted array', () => {
    const result = TimSort.sort([3, 1, 2])
    expect(result).not.toBe([3, 1, 2])
    expect(result).toEqual([1, 2, 3])
  })
})

describe('TimSort.isSorted', () => {
  it('returns true for empty array', () => {
    expect(TimSort.isSorted([])).toBe(true)
  })

  it('returns true for single element array', () => {
    expect(TimSort.isSorted([1])).toBe(true)
  })

  it('returns true for sorted array', () => {
    expect(TimSort.isSorted([1, 2, 3, 4, 5])).toBe(true)
  })

  it('returns false for unsorted array', () => {
    expect(TimSort.isSorted([1, 3, 2, 4, 5])).toBe(false)
  })

  it('returns true for array with duplicates', () => {
    expect(TimSort.isSorted([1, 1, 2, 2, 3])).toBe(true)
  })

  it('uses custom comparator', () => {
    expect(TimSort.isSorted([5, 4, 3, 2, 1], (a, b) => (a > b ? -1 : a < b ? 1 : 0))).toBe(true)
  })
})

describe('TimSort.stable', () => {
  it('sorts array by key function', () => {
    const input = [
      { id: 'c', value: 3 },
      { id: 'a', value: 1 },
      { id: 'b', value: 2 }
    ]
    const result = TimSort.stable(input, (x) => x.value)
    expect(result.map((x) => x.id)).toEqual(['a', 'b', 'c'])
  })

  it('maintains original order for equal keys', () => {
    const input = [
      { id: 'first', value: 1 },
      { id: 'second', value: 1 },
      { id: 'third', value: 2 }
    ]
    const result = TimSort.stable(input, (x) => x.value)
    expect(result.map((x) => x.id)).toEqual(['first', 'second', 'third'])
  })

  it('handles empty array', () => {
    const result = TimSort.stable([], (x) => x.value)
    expect(result).toEqual([])
  })

  it('handles single element', () => {
    const result = TimSort.stable([{ value: 1 }], (x) => x.value)
    expect(result).toEqual([{ value: 1 }])
  })

  it('handles empty array', () => {
    const result = TimSort.stable([], (x: { value: number }) => x.value)
    expect(result).toEqual([])
  })

  it('handles single element', () => {
    const result = TimSort.stable([{ value: 42 }], (x) => x.value)
    expect(result).toEqual([{ value: 42 }])
  })
})