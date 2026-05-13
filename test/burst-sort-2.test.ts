import { describe, test, expect } from 'vitest'
import { BurstSort2 } from '../src/core/burst-sort-2/index.js'

describe('BurstSort2 - sort', () => {
  test('sorts empty array', () => {
    const sorter = new BurstSort2<number>([])
    expect(sorter.sort()).toEqual([])
  })

  test('sorts single element array', () => {
    const sorter = new BurstSort2([1])
    expect(sorter.sort()).toEqual([1])
  })

  test('sorts two element array', () => {
    const sorter = new BurstSort2([2, 1])
    expect(sorter.sort()).toEqual([1, 2])
  })

  test('sorts already sorted array', () => {
    const sorter = new BurstSort2([1, 2, 3, 4, 5])
    expect(sorter.sort()).toEqual([1, 2, 3, 4, 5])
  })

  test('sorts reverse sorted array', () => {
    const sorter = new BurstSort2([5, 4, 3, 2, 1])
    expect(sorter.sort()).toEqual([1, 2, 3, 4, 5])
  })

  test('sorts random array', () => {
    const sorter = new BurstSort2([3, 1, 4, 1, 5, 9, 2, 6, 5, 3])
    expect(sorter.sort()).toEqual([1, 1, 2, 3, 3, 4, 5, 5, 6, 9])
  })

  test('sorts array with duplicates', () => {
    const sorter = new BurstSort2([3, 1, 2, 1, 3, 2])
    expect(sorter.sort()).toEqual([1, 1, 2, 2, 3, 3])
  })

  test('sorts array with negative numbers', () => {
    const sorter = new BurstSort2([-3, -1, -4, -1, -5, -9])
    expect(sorter.sort()).toEqual([-9, -5, -4, -3, -1, -1])
  })

  test('sorts array with mixed positive and negative numbers', () => {
    const sorter = new BurstSort2([3, -1, 4, -1, 5, -9])
    expect(sorter.sort()).toEqual([-9, -1, -1, 3, 4, 5])
  })

  test('sorts array with strings', () => {
    const sorter = new BurstSort2(['banana', 'apple', 'cherry', 'date'])
    expect(sorter.sort()).toEqual(['apple', 'banana', 'cherry', 'date'])
  })

  test('sorts array with all same elements', () => {
    const sorter = new BurstSort2([5, 5, 5, 5, 5])
    expect(sorter.sort()).toEqual([5, 5, 5, 5, 5])
  })

  test('sorts array with custom comparator', () => {
    const sorter = new BurstSort2(
      [{ a: 3 }, { a: 1 }, { a: 2 }],
      (x, y) => x.a - y.a
    )
    const result = sorter.sort()
    expect(result.map(x => x.a)).toEqual([1, 2, 3])
  })
})

describe('BurstSort2 - sortInPlace', () => {
  test('sorts empty array in place', () => {
    const arr: number[] = []
    const sorter = new BurstSort2(arr)
    sorter.sortInPlace(arr)
    expect(arr).toEqual([])
  })

  test('sorts single element array in place', () => {
    const arr = [1]
    const sorter = new BurstSort2(arr)
    sorter.sortInPlace(arr)
    expect(arr).toEqual([1])
  })

  test('sorts two element array in place', () => {
    const arr = [2, 1]
    const sorter = new BurstSort2(arr)
    sorter.sortInPlace(arr)
    expect(arr).toEqual([1, 2])
  })

  test('sorts already sorted array in place', () => {
    const arr = [1, 2, 3, 4, 5]
    const sorter = new BurstSort2(arr)
    sorter.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  test('sorts reverse sorted array in place', () => {
    const arr = [5, 4, 3, 2, 1]
    const sorter = new BurstSort2(arr)
    sorter.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  test('sorts random array in place', () => {
    const arr = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3]
    const sorter = new BurstSort2(arr)
    sorter.sortInPlace(arr)
    expect(arr).toEqual([1, 1, 2, 3, 3, 4, 5, 5, 6, 9])
  })

  test('sorts array with duplicates in place', () => {
    const arr = [3, 1, 2, 1, 3, 2]
    const sorter = new BurstSort2(arr)
    sorter.sortInPlace(arr)
    expect(arr).toEqual([1, 1, 2, 2, 3, 3])
  })

  test('sorts array with negative numbers in place', () => {
    const arr = [-3, -1, -4, -1, -5, -9]
    const sorter = new BurstSort2(arr)
    sorter.sortInPlace(arr)
    expect(arr).toEqual([-9, -5, -4, -3, -1, -1])
  })

  test('sorts array with strings in place', () => {
    const arr = ['banana', 'apple', 'cherry', 'date']
    const sorter = new BurstSort2(arr)
    sorter.sortInPlace(arr)
    expect(arr).toEqual(['apple', 'banana', 'cherry', 'date'])
  })
})

describe('BurstSort2 - immutability', () => {
  test('sort does not modify original array', () => {
    const input = [3, 1, 4, 1, 5]
    const sorter = new BurstSort2(input)
    sorter.sort()
    expect(input).toEqual([3, 1, 4, 1, 5])
  })

  test('sortInPlace modifies array', () => {
    const input = [3, 1, 4, 1, 5]
    const sorter = new BurstSort2(input)
    sorter.sortInPlace(input)
    expect(input).toEqual([1, 1, 3, 4, 5])
  })
})

describe('BurstSort2 - edge cases', () => {
  test('handles array with all same elements', () => {
    const sorter = new BurstSort2([5, 5, 5, 5, 5])
    expect(sorter.sort()).toEqual([5, 5, 5, 5, 5])
  })

  test('handles array with zeros', () => {
    const sorter = new BurstSort2([0, -1, 1, 0, -0])
    const result = sorter.sort()
    expect(result[0]).toBe(-1)
    expect(result[result.length - 1]).toBe(1)
  })

  test('handles array with large numbers', () => {
    const sorter = new BurstSort2([1000000, 1, 999999, 0, -1])
    expect(sorter.sort()).toEqual([-1, 0, 1, 999999, 1000000])
  })

  test('handles array with floating point numbers', () => {
    const sorter = new BurstSort2([3.14, 1.41, 2.71, 0.5, 1.73])
    expect(sorter.sort()).toEqual([0.5, 1.41, 1.73, 2.71, 3.14])
  })

  test('handles large array', () => {
    const largeArray = Array.from({ length: 10000 }, () => Math.floor(Math.random() * 10000))
    const sorter = new BurstSort2(largeArray)
    const sorted = sorter.sort()
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i]!).toBeLessThanOrEqual(sorted[i + 1]!)
    }
  })

  test('handles array with mixed case strings', () => {
    const sorter = new BurstSort2(['Apple', 'banana', 'Cherry', 'date', 'Elderberry'])
    expect(sorter.sort()).toEqual(['Apple', 'Cherry', 'Elderberry', 'banana', 'date'])
  })
})
