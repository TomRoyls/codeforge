import { describe, it, expect } from 'vitest'
import { FlashSort2 } from '../src/core/flash-sort-2/index.js'

describe('FlashSort2 - sort', () => {
  it('sorts empty array', () => {
    const sorter = new FlashSort2<number>()
    expect(sorter.sort([])).toEqual([])
  })

  it('sorts single element array', () => {
    const sorter = new FlashSort2<number>()
    expect(sorter.sort([1])).toEqual([1])
  })

  it('sorts two element array', () => {
    const sorter = new FlashSort2<number>()
    expect(sorter.sort([2, 1])).toEqual([1, 2])
  })

  it('sorts already sorted array', () => {
    const sorter = new FlashSort2<number>()
    expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
  })

  it('sorts reverse sorted array', () => {
    const sorter = new FlashSort2<number>()
    expect(sorter.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
  })

  it('sorts random array', () => {
    const sorter = new FlashSort2<number>()
    expect(sorter.sort([3, 1, 4, 1, 5, 9, 2, 6, 5, 3])).toEqual([1, 1, 2, 3, 3, 4, 5, 5, 6, 9])
  })

  it('sorts array with duplicates', () => {
    const sorter = new FlashSort2<number>()
    expect(sorter.sort([3, 1, 2, 1, 3, 2])).toEqual([1, 1, 2, 2, 3, 3])
  })

  it('sorts array with negative numbers', () => {
    const sorter = new FlashSort2<number>()
    expect(sorter.sort([-3, -1, -4, -1, -5, -9])).toEqual([-9, -5, -4, -3, -1, -1])
  })

  it('sorts array with mixed positive and negative numbers', () => {
    const sorter = new FlashSort2<number>()
    expect(sorter.sort([3, -1, 4, -1, 5, -9])).toEqual([-9, -1, -1, 3, 4, 5])
  })

  it('sorts array with floating point', () => {
    const sorter = new FlashSort2<number>()
    expect(sorter.sort([3.14, 1.41, 2.71, 0.5, 1.73])).toEqual([0.5, 1.41, 1.73, 2.71, 3.14])
  })

  it('sorts array with custom comparator (descending)', () => {
    const sorter = new FlashSort2<number>((a, b) => b - a)
    expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([5, 4, 3, 2, 1])
  })

  it('sorts large array', () => {
    const sorter = new FlashSort2<number>()
    const largeArray = Array.from({ length: 10000 }, () => Math.floor(Math.random() * 10000))
    const sorted = sorter.sort(largeArray)
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i]!).toBeLessThanOrEqual(sorted[i + 1]!)
    }
  })
  it('should handle sortInPlace', () => {
    const sorter = new FlashSort2<number>()
    const arr = [5, 3, 1, 4, 2]
    sorter.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })
})

describe('FlashSort2 - sortInPlace', () => {
  it('sorts empty array in place', () => {
    const sorter = new FlashSort2<number>()
    const arr: number[] = []
    sorter.sortInPlace(arr)
    expect(arr).toEqual([])
  })

  it('sorts single element array in place', () => {
    const sorter = new FlashSort2<number>()
    const arr = [1]
    sorter.sortInPlace(arr)
    expect(arr).toEqual([1])
  })

  it('sorts array in place', () => {
    const sorter = new FlashSort2<number>()
    const arr = [3, 1, 4, 1, 5]
    sorter.sortInPlace(arr)
    expect(arr).toEqual([1, 1, 3, 4, 5])
  })

  it('sorts already sorted array in place', () => {
    const sorter = new FlashSort2<number>()
    const arr = [1, 2, 3, 4, 5]
    sorter.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  it('sorts reverse sorted array in place', () => {
    const sorter = new FlashSort2<number>()
    const arr = [5, 4, 3, 2, 1]
    sorter.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  it('sorts array with duplicates in place', () => {
    const sorter = new FlashSort2<number>()
    const arr = [3, 1, 2, 1, 3, 2]
    sorter.sortInPlace(arr)
    expect(arr).toEqual([1, 1, 2, 2, 3, 3])
  })

  it('sorts array with negative numbers in place', () => {
    const sorter = new FlashSort2<number>()
    const arr = [-3, -1, -4, -1, -5, -9]
    sorter.sortInPlace(arr)
    expect(arr).toEqual([-9, -5, -4, -3, -1, -1])
  })
  it('should handle sortInPlace', () => {
    const sorter = new FlashSort2<number>()
    const arr = [5, 3, 1, 4, 2]
    sorter.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })
})

describe('FlashSort2 - immutability', () => {
  it('sort does not modify original array', () => {
    const sorter = new FlashSort2<number>()
    const input = [3, 1, 4, 1, 5]
    const original = [...input]
    sorter.sort(input)
    expect(input).toEqual(original)
  })

  it('sortInPlace modifies original array', () => {
    const sorter = new FlashSort2<number>()
    const arr = [3, 1, 4, 1, 5]
    const original = [...arr]
    sorter.sortInPlace(arr)
    expect(arr).not.toEqual(original)
    expect(arr).toEqual([1, 1, 3, 4, 5])
  })
  it('should handle sortInPlace', () => {
    const sorter = new FlashSort2<number>()
    const arr = [5, 3, 1, 4, 2]
    sorter.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })
})

describe('FlashSort2 - edge cases', () => {
  it('handles array with all same elements', () => {
    const sorter = new FlashSort2<number>()
    expect(sorter.sort([5, 5, 5, 5, 5])).toEqual([5, 5, 5, 5, 5])
  })

  it('handles array with zeros', () => {
    const sorter = new FlashSort2<number>()
    const arr = [0, -1, 1, 0, -0]
    const result = sorter.sort(arr)
    expect(result[0]).toBe(-1)
    expect(result[result.length - 1]).toBe(1)
  })

  it('handles array with large numbers', () => {
    const sorter = new FlashSort2<number>()
    expect(sorter.sort([1000000, 1, 999999, 0, -1])).toEqual([-1, 0, 1, 999999, 1000000])
  })

  it('handles array with strings', () => {
    const sorter = new FlashSort2<string>()
    expect(sorter.sort(['banana', 'apple', 'cherry', 'date'])).toEqual(['apple', 'banana', 'cherry', 'date'])
  })

  it('handles two-element reverse', () => {
    const sorter = new FlashSort2<number>()
    const arr = [10, 1]
    sorter.sortInPlace(arr)
    expect(arr).toEqual([1, 10])
  })

  it('handles sortInPlace with custom comparator descending', () => {
    const sorter = new FlashSort2<number>((a, b) => b - a)
    const arr = [1, 2, 3, 4, 5]
    sorter.sortInPlace(arr)
    expect(arr).toEqual([5, 4, 3, 2, 1])
  })

  it('handles array of identical elements', () => {
    const sorter = new FlashSort2<number>()
    const arr = [7, 7, 7, 7]
    sorter.sortInPlace(arr)
    expect(arr).toEqual([7, 7, 7, 7])
  })

  it('handles sort returning new array', () => {
    const sorter = new FlashSort2<number>()
    const input = [5, 3, 1, 4, 2]
    const result = sorter.sort(input)
    expect(result).toEqual([1, 2, 3, 4, 5])
    expect(input).toEqual([5, 3, 1, 4, 2])
  })

  it('handles empty array', () => {
    const sorter = new FlashSort2<number>()
    expect(sorter.sort([])).toEqual([])
  })

  it('handles single element array', () => {
    const sorter = new FlashSort2<number>()
    expect(sorter.sort([42])).toEqual([42])
  })

  it('handles already sorted array', () => {
    const sorter = new FlashSort2<number>()
    expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
  })

  it('handles reverse sorted array', () => {
    const sorter = new FlashSort2<number>()
    expect(sorter.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
  })

  it('handles sortInPlace', () => {
    const sorter = new FlashSort2<number>()
    const arr = [5, 3, 1, 4, 2]
    sorter.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  it('handles duplicate elements', () => {
    const sorter = new FlashSort2<number>()
    expect(sorter.sort([3, 1, 2, 1, 3])).toEqual([1, 1, 2, 3, 3])
  })

  it('handles empty array', () => {
    const sorter = new FlashSort2<number>()
    expect(sorter.sort([])).toEqual([])
  })

  it('handles single element', () => {
    const sorter = new FlashSort2<number>()
    expect(sorter.sort([42])).toEqual([42])
  })

  it('handles reverse sorted', () => {
    const sorter = new FlashSort2<number>()
    expect(sorter.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
  })

  it('handles already sorted', () => {
    const sorter = new FlashSort2<number>()
    expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
  })

  it('handles empty array', () => {
    const sorter = new FlashSort2<number>()
    expect(sorter.sort([])).toEqual([])
  })

  it('handles sortInPlace', () => {
    const sorter = new FlashSort2<number>()
    const arr = [5, 3, 1, 4, 2]
    sorter.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  it('handles custom comparator', () => {
    const sorter = new FlashSort2<number>((a, b) => b - a)
    expect(sorter.sort([3, 1, 4, 1, 5])).toEqual([5, 4, 3, 1, 1])
  })
  it('should handle sortInPlace', () => {
    const sorter = new FlashSort2<number>()
    const arr = [5, 3, 1, 4, 2]
    sorter.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })
  it('should handle empty array', () => {
    const sorter = new FlashSort2()
    expect(sorter.sort([])).toEqual([])
  })
})
