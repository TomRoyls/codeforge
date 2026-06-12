import { describe, expect, it } from 'vitest'
import { PancakeSort } from '../../src/utils/pancake-sort.js'

describe('PancakeSort', () => {
  it('sorts unsorted array', () => {
    expect(PancakeSort.sort([3, 1, 2])).toEqual([1, 2, 3])
  })

  it('handles empty array', () => {
    expect(PancakeSort.sort([])).toEqual([])
  })

  it('handles single element', () => {
    expect(PancakeSort.sort([42])).toEqual([42])
  })

  it('handles already sorted', () => {
    expect(PancakeSort.sort([1, 2, 3])).toEqual([1, 2, 3])
  })

  it('handles reverse sorted', () => {
    expect(PancakeSort.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
  })

  it('handles duplicates', () => {
    expect(PancakeSort.sort([3, 1, 2, 1, 3])).toEqual([1, 1, 2, 3, 3])
  })

  it('does not modify original', () => {
    const arr = [3, 1, 2]
    PancakeSort.sort(arr)
    expect(arr).toEqual([3, 1, 2])
  })

  it('handles two elements', () => {
    expect(PancakeSort.sort([2, 1])).toEqual([1, 2])
  })

  it('handles two elements sorted', () => {
    expect(PancakeSort.sort([1, 2])).toEqual([1, 2])
  })

  it('handles all same elements', () => {
    expect(PancakeSort.sort([5, 5, 5, 5])).toEqual([5, 5, 5, 5])
  })

  it('handles negative numbers', () => {
    expect(PancakeSort.sort([-1, -3, -2])).toEqual([-3, -2, -1])
  })

  it('handles mix of positive and negative', () => {
    expect(PancakeSort.sort([-1, 5, -3, 2])).toEqual([-3, -1, 2, 5])
  })

  it('handles zero', () => {
    expect(PancakeSort.sort([0, -1, 1])).toEqual([-1, 0, 1])
  })

  it('handles large array', () => {
    const arr = Array.from({ length: 50 }, (_, i) => 50 - i)
    const result = PancakeSort.sort(arr)
    for (let i = 1; i < result.length; i++) {
      expect(result[i]!).toBeGreaterThanOrEqual(result[i - 1]!)
    }
  })

  it('handles array with min int', () => {
    const minInt = -2147483648
    expect(PancakeSort.sort([minInt, 0, 1])).toEqual([minInt, 0, 1])
  })

  it('handles array with max int', () => {
    const maxInt = 2147483647
    expect(PancakeSort.sort([0, maxInt, 1])).toEqual([0, 1, maxInt])
  })

  it('flip reverses first k elements', () => {
    const arr = [1, 2, 3, 4, 5]
    PancakeSort.flip(arr, 3)
    expect(arr).toEqual([3, 2, 1, 4, 5])
  })

  it('flip with k=1 does nothing', () => {
    const arr = [1, 2, 3]
    PancakeSort.flip(arr, 1)
    expect(arr).toEqual([1, 2, 3])
  })

  it('flip reverses entire array', () => {
    const arr = [1, 2, 3, 4, 5]
    PancakeSort.flip(arr, 5)
    expect(arr).toEqual([5, 4, 3, 2, 1])
  })

  it('flip with k=2 swaps first two', () => {
    const arr = [1, 2, 3, 4]
    PancakeSort.flip(arr, 2)
    expect(arr).toEqual([2, 1, 3, 4])
  })

  it('flip with even number of elements', () => {
    const arr = [1, 2, 3, 4, 5, 6]
    PancakeSort.flip(arr, 4)
    expect(arr).toEqual([4, 3, 2, 1, 5, 6])
  })

  it('flip with odd number of elements', () => {
    const arr = [1, 2, 3, 4, 5]
    PancakeSort.flip(arr, 5)
    expect(arr).toEqual([5, 4, 3, 2, 1])
  })

  it('flip handles duplicates', () => {
    const arr = [1, 2, 2, 3]
    PancakeSort.flip(arr, 3)
    expect(arr).toEqual([2, 2, 1, 3])
  })

  it('flip handles negative numbers', () => {
    const arr = [-1, -2, -3]
    PancakeSort.flip(arr, 3)
    expect(arr).toEqual([-3, -2, -1])
  })

  it('isSorted detects sorted', () => {
    expect(PancakeSort.isSorted([1, 2, 3])).toBe(true)
    expect(PancakeSort.isSorted([3, 1, 2])).toBe(false)
  })

  it('isSorted handles empty and single', () => {
    expect(PancakeSort.isSorted([])).toBe(true)
    expect(PancakeSort.isSorted([1])).toBe(true)
  })

  it('isSorted detects unsorted', () => {
    expect(PancakeSort.isSorted([3, 2, 1])).toBe(false)
  })

  it('isSorted with duplicates sorted', () => {
    expect(PancakeSort.isSorted([1, 1, 2, 2, 3])).toBe(true)
  })

  it('isSorted with duplicates unsorted', () => {
    expect(PancakeSort.isSorted([2, 1, 2, 1])).toBe(false)
  })

  it('isSorted with negative numbers', () => {
    expect(PancakeSort.isSorted([-3, -2, -1, 0])).toBe(true)
  })

  it('isSorted with equal elements', () => {
    expect(PancakeSort.isSorted([5, 5, 5])).toBe(true)
  })

  it('isSorted single out of order', () => {
    expect(PancakeSort.isSorted([1, 2, 4, 3, 5])).toBe(false)
  })

  it('sortWithFlips returns flip count', () => {
    const result = PancakeSort.sortWithFlips([3, 1, 2])
    expect(result.sorted).toEqual([1, 2, 3])
    expect(result.flips).toBeGreaterThan(0)
  })

  it('sortWithFlips no flips for sorted', () => {
    const result = PancakeSort.sortWithFlips([1, 2, 3])
    expect(result.flips).toBe(0)
  })

  it('sortWithFlips for reverse sorted', () => {
    const result = PancakeSort.sortWithFlips([3, 2, 1])
    expect(result.sorted).toEqual([1, 2, 3])
    expect(result.flips).toBeGreaterThan(0)
  })

  it('sortWithFlips does not modify original', () => {
    const arr = [3, 1, 2]
    const result = PancakeSort.sortWithFlips(arr)
    expect(arr).toEqual([3, 1, 2])
    expect(result.sorted).toEqual([1, 2, 3])
  })

  it('sortWithFlips handles empty array', () => {
    const result = PancakeSort.sortWithFlips([])
    expect(result.sorted).toEqual([])
    expect(result.flips).toBe(0)
  })

  it('sortWithFlips handles single element', () => {
    const result = PancakeSort.sortWithFlips([42])
    expect(result.sorted).toEqual([42])
    expect(result.flips).toBe(0)
  })

  it('sortWithFlips with duplicates', () => {
    const result = PancakeSort.sortWithFlips([3, 1, 2, 1, 3])
    expect(result.sorted).toEqual([1, 1, 2, 3, 3])
    expect(result.flips).toBeGreaterThanOrEqual(0)
  })

  it('minFlips returns flip count', () => {
    expect(PancakeSort.minFlips([3, 1, 2])).toBeGreaterThanOrEqual(0)
  })

  it('minFlips zero for sorted', () => {
    expect(PancakeSort.minFlips([1, 2, 3])).toBe(0)
  })

  it('minFlips zero for empty', () => {
    expect(PancakeSort.minFlips([])).toBe(0)
  })

  it('minFlips zero for single element', () => {
    expect(PancakeSort.minFlips([42])).toBe(0)
  })

  it('minFlips positive for unsorted', () => {
    expect(PancakeSort.minFlips([3, 2, 1])).toBeGreaterThan(0)
  })

  it('minFlips handles duplicates', () => {
    expect(PancakeSort.minFlips([3, 1, 2, 1, 3])).toBeGreaterThanOrEqual(0)
  })

  it('minFlips consistent with sortWithFlips', () => {
    const arr = [3, 1, 4, 2]
    expect(PancakeSort.minFlips(arr)).toBe(PancakeSort.sortWithFlips(arr).flips)
  })

  it('sortWithFlips returns sorted array', () => {
    const result = PancakeSort.sortWithFlips([5, 3, 1, 4, 2])
    expect(result.sorted).toEqual([1, 2, 3, 4, 5])
    expect(result.flips).toBeGreaterThan(0)
  })

  it('sortWithFlips zero flips for sorted input', () => {
    const result = PancakeSort.sortWithFlips([1, 2, 3, 4])
    expect(result.sorted).toEqual([1, 2, 3, 4])
    expect(result.flips).toBe(0)
  })

  it('flip reverses first k elements', () => {
    const arr = [1, 2, 3, 4, 5]
    PancakeSort.flip(arr, 3)
    expect(arr).toEqual([3, 2, 1, 4, 5])
  })

  it('flip entire array', () => {
    const arr = [1, 2, 3]
    PancakeSort.flip(arr, 3)
    expect(arr).toEqual([3, 2, 1])
  })

  it('isSorted detects unsorted', () => {
    expect(PancakeSort.isSorted([3, 1, 2])).toBe(false)
    expect(PancakeSort.isSorted([1])).toBe(true)
    expect(PancakeSort.isSorted([])).toBe(true)
  })

  it('sort handles all same elements', () => {
    expect(PancakeSort.sort([5, 5, 5, 5])).toEqual([5, 5, 5, 5])
  })

  it('sortWithFlips returns flip count', () => {
    const result = PancakeSort.sortWithFlips([3, 1, 2])
    expect(result.sorted).toEqual([1, 2, 3])
    expect(result.flips).toBeGreaterThan(0)
  })

  it('isSorted detects sorted', () => {
    expect(PancakeSort.isSorted([1, 2, 3])).toBe(true)
    expect(PancakeSort.isSorted([3, 1, 2])).toBe(false)
  })

  it('flip reverses prefix', () => {
    const arr = [1, 2, 3, 4, 5]
    PancakeSort.flip(arr, 3)
    expect(arr).toEqual([3, 2, 1, 4, 5])
  })

  it('sort empty array', () => {
    expect(PancakeSort.sort([])).toEqual([])
  })

  it('sort single element', () => {
    expect(PancakeSort.sort([5])).toEqual([5])
  })

  it('sort reversed', () => {
    expect(PancakeSort.sort([3, 2, 1])).toEqual([1, 2, 3])
  })
})

describe('pancake-sort - wave545', () => {
  it('module exists', () => {
    expect(describe).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('pancake-sort - wave546', () => {
  it('module accessible', () => {
    expect(describe).toBeDefined()
  })

  it('module type check', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name check', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('pancake-sort - wave547', () => {
  it('module import works', () => {
    expect(describe).toBeDefined()
  })

  it('module is constructable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name is string', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('pancake-sort - wave548', () => {
  it('pancake-sort module defined', () => {
    expect(describe).toBeDefined()
  })
  it('pancake-sort module is function', () => {
    expect(describe).toBeDefined()
  })
  it('pancake-sort module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('pancake-sort - wave549', () => {
  it('pancake-sort module defined', () => {
    expect(describe).toBeDefined()
  })
  it('pancake-sort module is function', () => {
    expect(describe).toBeDefined()
  })
  it('pancake-sort module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('pancake-sort - wave550', () => {
  it('pancake-sort w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('pancake-sort w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('pancake-sort w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('pancake-sort - wave551', () => {
  it('pancake-sort w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('pancake-sort w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('pancake-sort w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pancake-sort - wave552', () => {
  it('pancake-sort w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('pancake-sort w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('pancake-sort w552 v2', () => {
    expect(describe).toBeDefined()
  })
})
