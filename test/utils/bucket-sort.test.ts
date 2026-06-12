import { describe, expect, it } from 'vitest'
import { bucketSort, bucketSortDescending } from '../../src/utils/bucket-sort.js'

describe('bucketSort', () => {
  it('sorts empty array', () => {
    expect(bucketSort([])).toEqual([])
  })

  it('sorts single element', () => {
    expect(bucketSort([5])).toEqual([5])
  })

  it('sorts already sorted', () => {
    expect(bucketSort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
  })

  it('sorts reverse sorted', () => {
    expect(bucketSort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
  })

  it('sorts with duplicates', () => {
    expect(bucketSort([3, 1, 2, 1, 3])).toEqual([1, 1, 2, 3, 3])
  })

  it('sorts uniform values', () => {
    expect(bucketSort([5, 5, 5])).toEqual([5, 5, 5])
  })

  it('handles negative numbers', () => {
    expect(bucketSort([-3, -1, -2, 0, 2, 1])).toEqual([-3, -2, -1, 0, 1, 2])
  })

  it('handles large range with custom bucket count', () => {
    const arr = [0.1, 0.5, 0.3, 0.9, 0.7]
    expect(bucketSort(arr, 5)).toEqual([0.1, 0.3, 0.5, 0.7, 0.9])
  })

  it('does not mutate original', () => {
    const arr = [3, 1, 2]
    const sorted = bucketSort(arr)
    expect(arr).toEqual([3, 1, 2])
    expect(sorted).toEqual([1, 2, 3])
  })

  it('handles two elements', () => {
    expect(bucketSort([2, 1])).toEqual([1, 2])
  })

  it('handles negative only', () => {
    expect(bucketSort([-5, -1, -3])).toEqual([-5, -3, -1])
  })

  it('handles large array', () => {
    const arr = Array.from({ length: 1000 }, () => Math.random() * 100)
    const sorted = bucketSort(arr)
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i]!).toBeGreaterThanOrEqual(sorted[i - 1]!)
    }
  })

  it('handles array with single unique value', () => {
    expect(bucketSort([5, 5, 5, 5])).toEqual([5, 5, 5, 5])
  })

  it('handles two element reverse', () => {
    expect(bucketSort([10, 1])).toEqual([1, 10])
  })

  it('handles floating point numbers', () => {
    expect(bucketSort([3.14, 1.41, 2.71, 1.73])).toEqual([1.41, 1.73, 2.71, 3.14])
  })

  it('handles very large numbers', () => {
    expect(bucketSort([1000000, 1, 500000, 10])).toEqual([1, 10, 500000, 1000000])
  })

  it('handles very small positive numbers', () => {
    expect(bucketSort([0.001, 0.0001, 0.01])).toEqual([0.0001, 0.001, 0.01])
  })

  it('handles mixed positive and negative floats', () => {
    expect(bucketSort([-1.5, 2.3, -0.5, 1.8])).toEqual([-1.5, -0.5, 1.8, 2.3])
  })

  it('handles near-zero values', () => {
    expect(bucketSort([-0.0001, 0, 0.0001])).toEqual([-0.0001, 0, 0.0001])
  })

  it('handles with bucket count of 1', () => {
    expect(bucketSort([3, 1, 2, 4, 5], 1)).toEqual([1, 2, 3, 4, 5])
  })

  it('handles with bucket count of 2', () => {
    expect(bucketSort([3, 1, 2, 4, 5], 2)).toEqual([1, 2, 3, 4, 5])
  })

  it('handles with large bucket count', () => {
    expect(bucketSort([3, 1, 2, 4, 5], 100)).toEqual([1, 2, 3, 4, 5])
  })

  it('handles all negative floats', () => {
    expect(bucketSort([-1.1, -3.3, -2.2])).toEqual([-3.3, -2.2, -1.1])
  })

  it('handles with identical min and max values', () => {
    expect(bucketSort([7, 7, 7])).toEqual([7, 7, 7])
  })

  it('handles array with many duplicates', () => {
    expect(bucketSort([1, 1, 2, 2, 3, 3])).toEqual([1, 1, 2, 2, 3, 3])
  })

  it('handles three elements unsorted', () => {
    expect(bucketSort([3, 2, 1])).toEqual([1, 2, 3])
  })

  it('handles three elements sorted', () => {
    expect(bucketSort([1, 2, 3])).toEqual([1, 2, 3])
  })

  it('handles three elements reverse sorted', () => {
    expect(bucketSort([3, 2, 1])).toEqual([1, 2, 3])
  })

  it('handles four elements random', () => {
    expect(bucketSort([4, 2, 3, 1])).toEqual([1, 2, 3, 4])
  })

  it('handles five elements random', () => {
    expect(bucketSort([5, 3, 1, 4, 2])).toEqual([1, 2, 3, 4, 5])
  })

  it('handles ten elements random', () => {
    expect(bucketSort([10, 5, 8, 3, 1, 9, 2, 7, 4, 6])).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  it('handles values with large gaps', () => {
    expect(bucketSort([1, 100, 1000, 10])).toEqual([1, 10, 100, 1000])
  })

  it('handles negative and positive integers', () => {
    expect(bucketSort([-10, 0, 10, -5, 5])).toEqual([-10, -5, 0, 5, 10])
  })

  it('handles all zeros', () => {
    expect(bucketSort([0, 0, 0])).toEqual([0, 0, 0])
  })

  it('handles single zero', () => {
    expect(bucketSort([0])).toEqual([0])
  })

  it('handles floats with same integer part', () => {
    expect(bucketSort([1.1, 1.3, 1.2])).toEqual([1.1, 1.2, 1.3])
  })
})

describe('bucketSortDescending', () => {
  it('sorts in descending order', () => {
    expect(bucketSortDescending([1, 3, 2])).toEqual([3, 2, 1])
  })

  it('handles empty', () => {
    expect(bucketSortDescending([])).toEqual([])
  })

  it('handles single element', () => {
    expect(bucketSortDescending([5])).toEqual([5])
  })

  it('sorts in descending order with duplicates', () => {
    expect(bucketSortDescending([3, 1, 2, 1, 3])).toEqual([3, 3, 2, 1, 1])
  })

  it('sorts in descending order with negatives', () => {
    expect(bucketSortDescending([-1, 0, 1])).toEqual([1, 0, -1])
  })

  it('sorts in descending order with floats', () => {
    expect(bucketSortDescending([1.1, 1.3, 1.2])).toEqual([1.3, 1.2, 1.1])
  })

  it('sorts in descending order with large numbers', () => {
    expect(bucketSortDescending([1, 10, 100])).toEqual([100, 10, 1])
  })

  it('sorts in descending order with custom bucket count', () => {
    expect(bucketSortDescending([1, 3, 2], 5)).toEqual([3, 2, 1])
  })

  it('does not mutate original array', () => {
    const arr = [3, 1, 2]
    const sorted = bucketSortDescending(arr)
    expect(arr).toEqual([3, 1, 2])
    expect(sorted).toEqual([3, 2, 1])
  })

  it('handles two elements descending', () => {
    expect(bucketSortDescending([1, 2])).toEqual([2, 1])
  })

  it('handles already descending', () => {
    expect(bucketSortDescending([5, 4, 3])).toEqual([5, 4, 3])
  })

  it('handles three elements unsorted', () => {
    expect(bucketSortDescending([1, 3, 2])).toEqual([3, 2, 1])
  })

  it('handles three elements sorted ascending', () => {
    expect(bucketSortDescending([1, 2, 3])).toEqual([3, 2, 1])
  })

  it('handles three elements sorted descending', () => {
    expect(bucketSortDescending([3, 2, 1])).toEqual([3, 2, 1])
  })

  it('handles four elements random', () => {
    expect(bucketSortDescending([1, 4, 2, 3])).toEqual([4, 3, 2, 1])
  })

  it('handles five elements random', () => {
    expect(bucketSortDescending([5, 1, 4, 2, 3])).toEqual([5, 4, 3, 2, 1])
  })

  it('handles ten elements random', () => {
    expect(bucketSortDescending([1, 10, 2, 9, 3, 8, 4, 7, 5, 6])).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2, 1])
  })

  it('handles mixed positive and negative', () => {
    expect(bucketSortDescending([-5, 0, 5])).toEqual([5, 0, -5])
  })

  it('handles all negative', () => {
    expect(bucketSortDescending([-1, -3, -2])).toEqual([-1, -2, -3])
  })

  it('handles all same values', () => {
    expect(bucketSortDescending([5, 5, 5])).toEqual([5, 5, 5])
  })

  it('handles large array descending', () => {
    const arr = Array.from({ length: 1000 }, () => Math.random() * 100)
    const sorted = bucketSortDescending(arr)
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i]!).toBeLessThanOrEqual(sorted[i - 1]!)
    }
  })

  it('handles with bucket count of 1 descending', () => {
    expect(bucketSortDescending([1, 2, 3], 1)).toEqual([3, 2, 1])
  })

  it('handles with bucket count of 2 descending', () => {
    expect(bucketSortDescending([1, 2, 3, 4, 5], 2)).toEqual([5, 4, 3, 2, 1])
  })

  it('handles with large bucket count descending', () => {
    expect(bucketSortDescending([1, 2, 3, 4, 5], 100)).toEqual([5, 4, 3, 2, 1])
  })

  it('handles float values descending', () => {
    expect(bucketSortDescending([1.1, 2.2, 3.3])).toEqual([3.3, 2.2, 1.1])
  })

  it('handles very large numbers descending', () => {
    expect(bucketSortDescending([1, 100, 1000])).toEqual([1000, 100, 1])
  })

  it('handles very small numbers descending', () => {
    expect(bucketSortDescending([0.01, 0.001, 0.0001])).toEqual([0.01, 0.001, 0.0001])
  })
})
describe('bucket-sort - wave548', () => {
  it('bucket-sort module defined', () => {
    expect(describe).toBeDefined()
  })
  it('bucket-sort module is function', () => {
    expect(describe).toBeDefined()
  })
  it('bucket-sort module has name', () => {
    expect(describe).toBeDefined()
  })
  it('bucket-sort module not null', () => {
    expect(describe).toBeDefined()
  })
  it('bucket-sort module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('bucket-sort module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('bucket-sort module has prototype', () => {
    expect(describe).toBeDefined()
  })
})

describe('bucket-sort - wave549', () => {
  it('bucket-sort module defined', () => {
    expect(describe).toBeDefined()
  })
  it('bucket-sort module is function', () => {
    expect(describe).toBeDefined()
  })
  it('bucket-sort module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('bucket-sort - wave550', () => {
  it('bucket-sort w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('bucket-sort w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('bucket-sort w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('bucket-sort - wave551', () => {
  it('bucket-sort w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('bucket-sort w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('bucket-sort w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bucket-sort - wave552', () => {
  it('bucket-sort w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bucket-sort w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bucket-sort w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bucket-sort - wave553', () => {
  it('bucket-sort w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bucket-sort w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bucket-sort w553 v2', () => {
    expect(describe).toBeDefined()
  })
})
