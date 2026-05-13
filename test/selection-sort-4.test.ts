import { describe, test, expect } from 'vitest'
import { SelectionSort4 } from '../src/core/selection-sort-4/index.js'

describe('SelectionSort4 - sort', () => {
  test('sorts empty array', () => {
    const sorter = new SelectionSort4<number>([])
    expect(sorter.sort()).toEqual([])
  })

  test('sorts single element array', () => {
    const sorter = new SelectionSort4([1])
    expect(sorter.sort()).toEqual([1])
  })

  test('sorts two element array', () => {
    const sorter = new SelectionSort4([2, 1])
    expect(sorter.sort()).toEqual([1, 2])
  })

  test('sorts already sorted array', () => {
    const sorter = new SelectionSort4([1, 2, 3, 4, 5])
    expect(sorter.sort()).toEqual([1, 2, 3, 4, 5])
  })

  test('sorts reverse sorted array', () => {
    const sorter = new SelectionSort4([5, 4, 3, 2, 1])
    expect(sorter.sort()).toEqual([1, 2, 3, 4, 5])
  })

  test('sorts random array', () => {
    const sorter = new SelectionSort4([3, 1, 4, 1, 5, 9, 2, 6, 5, 3])
    expect(sorter.sort()).toEqual([1, 1, 2, 3, 3, 4, 5, 5, 6, 9])
  })

  test('sorts array with duplicates', () => {
    const sorter = new SelectionSort4([3, 1, 2, 1, 3, 2])
    expect(sorter.sort()).toEqual([1, 1, 2, 2, 3, 3])
  })

  test('sorts array with negative numbers', () => {
    const sorter = new SelectionSort4([-3, -1, -4, -1, -5, -9])
    expect(sorter.sort()).toEqual([-9, -5, -4, -3, -1, -1])
  })

  test('sorts array with mixed positive and negative numbers', () => {
    const sorter = new SelectionSort4([3, -1, 4, -1, 5, -9])
    expect(sorter.sort()).toEqual([-9, -1, -1, 3, 4, 5])
  })

  test('sorts array with strings', () => {
    const sorter = new SelectionSort4(['banana', 'apple', 'cherry', 'date'])
    expect(sorter.sort()).toEqual(['apple', 'banana', 'cherry', 'date'])
  })

  test('sorts array with custom comparator', () => {
    const sorter = new SelectionSort4(
      [{ a: 3 }, { a: 1 }, { a: 2 }],
      (x, y) => x.a - y.a
    )
    const result = sorter.sort()
    expect(result.map(x => x.a)).toEqual([1, 2, 3])
  })
})

describe('SelectionSort4 - sortDescending', () => {
  test('sorts empty array descending', () => {
    const sorter = new SelectionSort4<number>([])
    expect(sorter.sortDescending()).toEqual([])
  })

  test('sorts single element array descending', () => {
    const sorter = new SelectionSort4([1])
    expect(sorter.sortDescending()).toEqual([1])
  })

  test('sorts array in descending order', () => {
    const sorter = new SelectionSort4([1, 2, 3, 4, 5])
    expect(sorter.sortDescending()).toEqual([5, 4, 3, 2, 1])
  })

  test('sorts already descending array', () => {
    const sorter = new SelectionSort4([5, 4, 3, 2, 1])
    expect(sorter.sortDescending()).toEqual([5, 4, 3, 2, 1])
  })

  test('sorts random array descending', () => {
    const sorter = new SelectionSort4([3, 1, 4, 1, 5, 9, 2, 6])
    expect(sorter.sortDescending()).toEqual([9, 6, 5, 4, 3, 2, 1, 1])
  })
})

describe('SelectionSort4 - isSorted', () => {
  test('returns true for empty array', () => {
    const sorter = new SelectionSort4<number>([])
    expect(sorter.isSorted()).toBe(true)
  })

  test('returns true for single element array', () => {
    const sorter = new SelectionSort4([1])
    expect(sorter.isSorted()).toBe(true)
  })

  test('returns true for sorted array', () => {
    const sorter = new SelectionSort4([1, 2, 3, 4, 5])
    expect(sorter.isSorted()).toBe(true)
  })

  test('returns false for unsorted array', () => {
    const sorter = new SelectionSort4([3, 1, 4, 1, 5])
    expect(sorter.isSorted()).toBe(false)
  })

  test('returns false for reverse sorted array', () => {
    const sorter = new SelectionSort4([5, 4, 3, 2, 1])
    expect(sorter.isSorted()).toBe(false)
  })
})

describe('SelectionSort4 - partialSort', () => {
  test('returns empty array for k = 0', () => {
    const sorter = new SelectionSort4([3, 1, 4, 1, 5])
    expect(sorter.partialSort(0)).toEqual([])
  })

  test('returns empty array for negative k', () => {
    const sorter = new SelectionSort4([3, 1, 4, 1, 5])
    expect(sorter.partialSort(-1)).toEqual([])
  })

  test('returns full array for k >= length', () => {
    const sorter = new SelectionSort4([3, 1, 4, 1, 5])
    expect(sorter.partialSort(10)).toEqual([1, 1, 3, 4, 5])
  })

  test('returns first k sorted elements', () => {
    const sorter = new SelectionSort4([3, 1, 4, 1, 5, 9, 2, 6])
    const result = sorter.partialSort(3)
    expect(result).toEqual([1, 1, 2])
    expect(result.length).toBe(3)
  })

  test('returns single element for k = 1', () => {
    const sorter = new SelectionSort4([3, 1, 4, 1, 5])
    const result = sorter.partialSort(1)
    expect(result).toEqual([1])
    expect(result.length).toBe(1)
  })

  test('partial sort preserves input array', () => {
    const input = [3, 1, 4, 1, 5]
    const sorter = new SelectionSort4(input)
    sorter.partialSort(2)
    expect(input).toEqual([3, 1, 4, 1, 5])
  })
})

describe('SelectionSort4 - stableSelectionSort', () => {
  test('sorts empty array stably', () => {
    const sorter = new SelectionSort4<number>([])
    expect(sorter.stableSelectionSort()).toEqual([])
  })

  test('sorts single element array stably', () => {
    const sorter = new SelectionSort4([1])
    expect(sorter.stableSelectionSort()).toEqual([1])
  })

  test('sorts array stably with duplicates', () => {
    const input = [
      { value: 3, id: 1 },
      { value: 1, id: 2 },
      { value: 4, id: 3 },
      { value: 1, id: 4 },
      { value: 5, id: 5 },
    ]
    const sorter = new SelectionSort4(input, (a, b) => a.value - b.value)
    const result = sorter.stableSelectionSort()
    expect(result.map(x => x.value)).toEqual([1, 1, 3, 4, 5])
    expect(result.map(x => x.id)).toEqual([2, 4, 1, 3, 5])
  })

  test('sorts array with strings stably', () => {
    const input = ['banana', 'apple', 'banana', 'apple', 'cherry']
    const sorter = new SelectionSort4(input)
    const result = sorter.stableSelectionSort()
    expect(result).toEqual(['apple', 'apple', 'banana', 'banana', 'cherry'])
  })

  test('stable sort preserves relative order of equal elements', () => {
    const input = [
      { key: 2, order: 1 },
      { key: 1, order: 2 },
      { key: 2, order: 3 },
      { key: 1, order: 4 },
    ]
    const sorter = new SelectionSort4(input, (a, b) => a.key - b.key)
    const result = sorter.stableSelectionSort()
    expect(result[0].order).toBe(2)
    expect(result[1].order).toBe(4)
    expect(result[2].order).toBe(1)
    expect(result[3].order).toBe(3)
  })
})

describe('SelectionSort4 - findKthSmallest', () => {
  test('returns undefined for k < 1', () => {
    const sorter = new SelectionSort4([3, 1, 4, 1, 5])
    expect(sorter.findKthSmallest(0)).toBe(undefined)
    expect(sorter.findKthSmallest(-1)).toBe(undefined)
  })

  test('returns undefined for k > length', () => {
    const sorter = new SelectionSort4([3, 1, 4, 1, 5])
    expect(sorter.findKthSmallest(10)).toBe(undefined)
  })

  test('finds 1st smallest element', () => {
    const sorter = new SelectionSort4([3, 1, 4, 1, 5, 9, 2, 6])
    expect(sorter.findKthSmallest(1)).toBe(1)
  })

  test('finds 3rd smallest element', () => {
    const sorter = new SelectionSort4([3, 1, 4, 1, 5, 9, 2, 6])
    expect(sorter.findKthSmallest(3)).toBe(2)
  })

  test('finds last (kth) element', () => {
    const sorter = new SelectionSort4([3, 1, 4, 1, 5])
    expect(sorter.findKthSmallest(5)).toBe(5)
  })

  test('finds kth smallest with duplicates', () => {
    const sorter = new SelectionSort4([3, 1, 4, 1, 5, 9, 2, 6])
    expect(sorter.findKthSmallest(2)).toBe(1)
  })
})

describe('SelectionSort4 - findKthLargest', () => {
  test('returns undefined for k < 1', () => {
    const sorter = new SelectionSort4([3, 1, 4, 1, 5])
    expect(sorter.findKthLargest(0)).toBe(undefined)
    expect(sorter.findKthLargest(-1)).toBe(undefined)
  })

  test('returns undefined for k > length', () => {
    const sorter = new SelectionSort4([3, 1, 4, 1, 5])
    expect(sorter.findKthLargest(10)).toBe(undefined)
  })

  test('finds 1st largest element', () => {
    const sorter = new SelectionSort4([3, 1, 4, 1, 5, 9, 2, 6])
    expect(sorter.findKthLargest(1)).toBe(9)
  })

  test('finds 3rd largest element', () => {
    const sorter = new SelectionSort4([3, 1, 4, 1, 5, 9, 2, 6])
    expect(sorter.findKthLargest(3)).toBe(5)
  })

  test('finds last (kth) element', () => {
    const sorter = new SelectionSort4([3, 1, 4, 1, 5])
    expect(sorter.findKthLargest(5)).toBe(1)
  })

  test('finds kth largest with duplicates', () => {
    const sorter = new SelectionSort4([3, 1, 4, 1, 5, 9, 2, 6])
    expect(sorter.findKthLargest(2)).toBe(6)
  })
})

describe('SelectionSort4 - getTimeComplexity', () => {
  test('returns O(1) for empty array', () => {
    const sorter = new SelectionSort4<number>([])
    expect(sorter.getTimeComplexity()).toBe('O(1)')
  })

  test('returns O(1) for single element array', () => {
    const sorter = new SelectionSort4([1])
    expect(sorter.getTimeComplexity()).toBe('O(1)')
  })

  test('returns O(n²) for larger arrays', () => {
    const sorter = new SelectionSort4([3, 1, 4, 1, 5])
    expect(sorter.getTimeComplexity()).toBe('O(n²)')
  })
})

describe('SelectionSort4 - getSpaceComplexity', () => {
  test('returns O(n)', () => {
    const sorter = new SelectionSort4([3, 1, 4, 1, 5])
    expect(sorter.getSpaceComplexity()).toBe('O(n)')
  })

  test('returns O(n) for empty array', () => {
    const sorter = new SelectionSort4<number>([])
    expect(sorter.getSpaceComplexity()).toBe('O(n)')
  })

  test('returns O(n) for single element array', () => {
    const sorter = new SelectionSort4([1])
    expect(sorter.getSpaceComplexity()).toBe('O(n)')
  })
})

describe('SelectionSort4 - edge cases', () => {
  test('does not modify original array', () => {
    const input = [3, 1, 4, 1, 5]
    const sorter = new SelectionSort4(input)
    sorter.sort()
    expect(input).toEqual([3, 1, 4, 1, 5])
  })

  test('handles array with all same elements', () => {
    const sorter = new SelectionSort4([5, 5, 5, 5, 5])
    expect(sorter.sort()).toEqual([5, 5, 5, 5, 5])
  })

  test('handles large array', () => {
    const largeArray = Array.from({ length: 100 }, () => Math.floor(Math.random() * 100))
    const sorter = new SelectionSort4(largeArray)
    const sorted = sorter.sort()
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i]!).toBeLessThanOrEqual(sorted[i + 1]!)
    }
  })

  test('sortDescending does not modify original array', () => {
    const input = [1, 2, 3, 4, 5]
    const sorter = new SelectionSort4(input)
    sorter.sortDescending()
    expect(input).toEqual([1, 2, 3, 4, 5])
  })

  test('stableSelectionSort does not modify original array', () => {
    const input = [3, 1, 4, 1, 5]
    const sorter = new SelectionSort4(input)
    sorter.stableSelectionSort()
    expect(input).toEqual([3, 1, 4, 1, 5])
  })
})
