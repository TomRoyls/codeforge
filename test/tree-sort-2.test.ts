import { describe, test, expect } from 'vitest'
import { TreeSort2 } from '../src/core/tree-sort-2/index.js'

describe('TreeSort2 - sort', () => {
  test('sorts empty array', () => {
    const sorter = new TreeSort2<number>()
    expect(sorter.sort([])).toEqual([])
  })

  test('sorts single element array', () => {
    const sorter = new TreeSort2<number>()
    expect(sorter.sort([1])).toEqual([1])
  })

  test('sorts two element array', () => {
    const sorter = new TreeSort2<number>()
    expect(sorter.sort([2, 1])).toEqual([1, 2])
  })

  test('sorts already sorted array', () => {
    const sorter = new TreeSort2<number>()
    expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
  })

  test('sorts reverse sorted array', () => {
    const sorter = new TreeSort2<number>()
    expect(sorter.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
  })

  test('sorts random array', () => {
    const sorter = new TreeSort2<number>()
    expect(sorter.sort([3, 1, 4, 1, 5, 9, 2, 6, 5, 3])).toEqual([1, 1, 2, 3, 3, 4, 5, 5, 6, 9])
  })

  test('sorts array with duplicates', () => {
    const sorter = new TreeSort2<number>()
    expect(sorter.sort([3, 1, 2, 1, 3, 2])).toEqual([1, 1, 2, 2, 3, 3])
  })

  test('sorts array with negative numbers', () => {
    const sorter = new TreeSort2<number>()
    expect(sorter.sort([-3, -1, -4, -1, -5, -9])).toEqual([-9, -5, -4, -3, -1, -1])
  })

  test('sorts array with floating point numbers', () => {
    const sorter = new TreeSort2<number>()
    expect(sorter.sort([3.14, 1.41, 2.71, 0.5, 1.73])).toEqual([0.5, 1.41, 1.73, 2.71, 3.14])
  })
})

describe('TreeSort2 - sortInPlace', () => {
  test('sorts empty array in place', () => {
    const sorter = new TreeSort2<number>()
    const arr: number[] = []
    sorter.sortInPlace(arr)
    expect(arr).toEqual([])
  })

  test('sorts single element array in place', () => {
    const sorter = new TreeSort2<number>()
    const arr = [1]
    sorter.sortInPlace(arr)
    expect(arr).toEqual([1])
  })

  test('sorts already sorted array in place', () => {
    const sorter = new TreeSort2<number>()
    const arr = [1, 2, 3, 4, 5]
    sorter.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  test('sorts reverse sorted array in place', () => {
    const sorter = new TreeSort2<number>()
    const arr = [5, 4, 3, 2, 1]
    sorter.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  test('sorts random array in place', () => {
    const sorter = new TreeSort2<number>()
    const arr = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3]
    sorter.sortInPlace(arr)
    expect(arr).toEqual([1, 1, 2, 3, 3, 4, 5, 5, 6, 9])
  })
})

describe('TreeSort2 - custom comparator', () => {
  test('sorts with descending order comparator', () => {
    const sorter = new TreeSort2<number>((a, b) => b - a)
    expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([5, 4, 3, 2, 1])
  })

  test('sorts objects with custom comparator', () => {
    const sorter = new TreeSort2<{ a: number }>((x, y) => x.a - y.a)
    const result = sorter.sort([{ a: 3 }, { a: 1 }, { a: 2 }])
    expect(result.map(x => x.a)).toEqual([1, 2, 3])
  })

  test('sorts strings with custom comparator', () => {
    const sorter = new TreeSort2<string>((a, b) => b.localeCompare(a))
    expect(sorter.sort(['apple', 'banana', 'cherry'])).toEqual(['cherry', 'banana', 'apple'])
  })
})

describe('TreeSort2 - immutability', () => {
  test('sort does not modify original array', () => {
    const input = [3, 1, 4, 1, 5]
    const sorter = new TreeSort2<number>()
    const result = sorter.sort(input)
    expect(input).toEqual([3, 1, 4, 1, 5])
    expect(result).toEqual([1, 1, 3, 4, 5])
  })
})

describe('TreeSort2 - edge cases', () => {
  test('handles array with all same elements', () => {
    const sorter = new TreeSort2<number>()
    expect(sorter.sort([5, 5, 5, 5, 5])).toEqual([5, 5, 5, 5, 5])
  })

  test('handles array with zeros', () => {
    const sorter = new TreeSort2<number>()
    const result = sorter.sort([0, -1, 1, 0, -0])
    expect(result[0]).toBe(-1)
    expect(result[result.length - 1]).toBe(1)
    expect(result.slice(1, result.length - 1).every(v => v === 0 || Object.is(v, -0))).toBe(true)
  })

  test('handles large array', () => {
    const sorter = new TreeSort2<number>()
    const largeArray = Array.from({ length: 10000 }, () => Math.floor(Math.random() * 100))
    const sorted = sorter.sort(largeArray)
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i]!).toBeLessThanOrEqual(sorted[i + 1]!)
    }
  })

  test('handles array with many duplicates', () => {
    const sorter = new TreeSort2<number>()
    const result = sorter.sort([1, 1, 1, 1, 2, 2, 2, 3, 3])
    expect(result).toEqual([1, 1, 1, 1, 2, 2, 2, 3, 3])
  })
})
