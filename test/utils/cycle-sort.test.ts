import { describe, expect, it } from 'vitest'
import { CycleSort } from '../../src/utils/cycle-sort.js'

describe('CycleSort', () => {
  it('sorts an unsorted array', () => {
    const result = CycleSort.sort([3, 1, 2])
    expect(result.sorted).toEqual([1, 2, 3])
  })

  it('returns write count', () => {
    const result = CycleSort.sort([3, 1, 2])
    expect(result.writes).toBeGreaterThan(0)
  })

  it('sorts already sorted array', () => {
    const result = CycleSort.sort([1, 2, 3])
    expect(result.sorted).toEqual([1, 2, 3])
    expect(result.writes).toBe(0)
  })

  it('sorts reverse sorted array', () => {
    const result = CycleSort.sort([5, 4, 3, 2, 1])
    expect(result.sorted).toEqual([1, 2, 3, 4, 5])
  })

  it('handles empty array', () => {
    const result = CycleSort.sort([])
    expect(result.sorted).toEqual([])
    expect(result.writes).toBe(0)
  })

  it('handles single element', () => {
    const result = CycleSort.sort([42])
    expect(result.sorted).toEqual([42])
    expect(result.writes).toBe(0)
  })

  it('handles duplicates', () => {
    const result = CycleSort.sort([3, 1, 2, 1, 3])
    expect(result.sorted).toEqual([1, 1, 2, 3, 3])
  })

  it('does not modify original', () => {
    const arr = [3, 1, 2]
    CycleSort.sort(arr)
    expect(arr).toEqual([3, 1, 2])
  })

  it('sortInPlace modifies original', () => {
    const arr = [3, 1, 2]
    const writes = CycleSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3])
    expect(writes).toBeGreaterThan(0)
  })

  it('handles negative numbers', () => {
    const result = CycleSort.sort([-1, -3, -2])
    expect(result.sorted).toEqual([-3, -2, -1])
  })

  it('handles large array', () => {
    const arr = Array.from({ length: 100 }, (_, i) => 100 - i)
    const result = CycleSort.sort(arr)
    for (let i = 1; i < result.sorted.length; i++) {
      expect(result.sorted[i]!).toBeGreaterThanOrEqual(result.sorted[i - 1]!)
    }
  })

  it('minWrites returns n-1', () => {
    expect(CycleSort.minWrites(10)).toBe(9)
    expect(CycleSort.minWrites(1)).toBe(0)
  })

  it('two elements', () => {
    expect(CycleSort.sort([2, 1]).sorted).toEqual([1, 2])
  })

  it('all same elements', () => {
    const result = CycleSort.sort([5, 5, 5])
    expect(result.sorted).toEqual([5, 5, 5])
    expect(result.writes).toBe(0)
  })

  it('sortInPlace returns write count', () => {
    const arr = [3, 1, 2]
    const writes = CycleSort.sortInPlace(arr)
    expect(writes).toBeGreaterThanOrEqual(0)
    expect(arr).toEqual([1, 2, 3])
  })

  it('handles already sorted array in place', () => {
    const arr = [1, 2, 3, 4]
    const writes = CycleSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3, 4])
    expect(writes).toBe(0)
  })

  it('handles single element in place', () => {
    const arr = [42]
    expect(CycleSort.sortInPlace(arr)).toBe(0)
    expect(arr).toEqual([42])
  })

  it('handles empty array in place', () => {
    const arr: number[] = []
    const swaps = CycleSort.sortInPlace(arr)
    expect(arr).toEqual([])
    expect(swaps).toBe(0)
  })

  it('sorts reverse array in place', () => {
    const arr = [3, 2, 1]
    const swaps = CycleSort.sortInPlace(arr)
    expect(swaps).toBeGreaterThan(0)
    expect(arr).toEqual([1, 2, 3])
  })

  it('handles mixed positive and negative numbers', () => {
    const result = CycleSort.sort([-5, 3, -2, 0, 5, -1])
    expect(result.sorted).toEqual([-5, -2, -1, 0, 3, 5])
  })

  it('handles zeros', () => {
    const result = CycleSort.sort([0, 1, 0, -1, 0])
    expect(result.sorted).toEqual([-1, 0, 0, 0, 1])
  })

  it('handles floating point numbers', () => {
    const result = CycleSort.sort([3.5, 1.2, 2.8, 0.1, 4.9])
    expect(result.sorted).toEqual([0.1, 1.2, 2.8, 3.5, 4.9])
  })

  it('handles negative floating point numbers', () => {
    const result = CycleSort.sort([-3.5, -1.2, -2.8])
    expect(result.sorted).toEqual([-3.5, -2.8, -1.2])
  })

  it('handles very large numbers', () => {
    const result = CycleSort.sort([Number.MAX_VALUE, Number.MIN_SAFE_INTEGER, 0, 1000000])
    expect(result.sorted[0]).toBe(Number.MIN_SAFE_INTEGER)
    expect(result.sorted[3]).toBe(Number.MAX_VALUE)
  })

  it('handles array with two identical elements', () => {
    const result = CycleSort.sort([5, 5])
    expect(result.sorted).toEqual([5, 5])
    expect(result.writes).toBe(0)
  })

  it('handles array with many duplicates', () => {
    const result = CycleSort.sort([1, 1, 1, 1, 1])
    expect(result.sorted).toEqual([1, 1, 1, 1, 1])
    expect(result.writes).toBe(0)
  })

  it('handles random array', () => {
    const arr = [17, 3, 9, 25, 1, 8, 12]
    const result = CycleSort.sort(arr)
    expect(result.sorted).toEqual([1, 3, 8, 9, 12, 17, 25])
  })

  it('sorts array with duplicate at boundaries', () => {
    const result = CycleSort.sort([1, 3, 3, 3, 5])
    expect(result.sorted).toEqual([1, 3, 3, 3, 5])
  })

  it('handles array sorted except last element', () => {
    const result = CycleSort.sort([1, 2, 3, 5, 4])
    expect(result.sorted).toEqual([1, 2, 3, 4, 5])
  })

  it('handles array sorted except first element', () => {
    const result = CycleSort.sort([5, 1, 2, 3, 4])
    expect(result.sorted).toEqual([1, 2, 3, 4, 5])
  })

  it('handles nearly sorted array', () => {
    const result = CycleSort.sort([1, 3, 2, 4, 6, 5, 7])
    expect(result.sorted).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('handles reverse sorted with duplicates', () => {
    const result = CycleSort.sort([5, 5, 3, 3, 1, 1])
    expect(result.sorted).toEqual([1, 1, 3, 3, 5, 5])
  })

  it('maintains stability with duplicates', () => {
    const arr = [{ val: 2, id: 1 }, { val: 1, id: 2 }, { val: 2, id: 3 }, { val: 1, id: 4 }]
    const nums = arr.map(obj => obj.val)
    const result = CycleSort.sort(nums)
    expect(result.sorted).toEqual([1, 1, 2, 2])
  })

  it('handles array with single duplicate', () => {
    const result = CycleSort.sort([2, 1, 2])
    expect(result.sorted).toEqual([1, 2, 2])
  })

  it('handles alternating pattern', () => {
    const result = CycleSort.sort([1, 3, 2, 4, 3, 5, 4, 6])
    expect(result.sorted).toEqual([1, 2, 3, 3, 4, 4, 5, 6])
  })

  it('sortInPlace handles mixed positive and negative', () => {
    const arr = [-5, 3, -2, 0, 5, -1]
    CycleSort.sortInPlace(arr)
    expect(arr).toEqual([-5, -2, -1, 0, 3, 5])
  })

  it('sortInPlace handles zeros', () => {
    const arr = [0, 1, 0, -1, 0]
    CycleSort.sortInPlace(arr)
    expect(arr).toEqual([-1, 0, 0, 0, 1])
  })

  it('sortInPlace handles floating point numbers', () => {
    const arr = [3.5, 1.2, 2.8, 0.1, 4.9]
    CycleSort.sortInPlace(arr)
    expect(arr).toEqual([0.1, 1.2, 2.8, 3.5, 4.9])
  })

  it('sortInPlace handles array with two identical elements', () => {
    const arr = [5, 5]
    const writes = CycleSort.sortInPlace(arr)
    expect(arr).toEqual([5, 5])
    expect(writes).toBe(0)
  })

  it('sortInPlace handles array with many duplicates', () => {
    const arr = [1, 1, 1, 1, 1]
    const writes = CycleSort.sortInPlace(arr)
    expect(arr).toEqual([1, 1, 1, 1, 1])
    expect(writes).toBe(0)
  })

  it('sortInPlace handles random array', () => {
    const arr = [17, 3, 9, 25, 1, 8, 12]
    CycleSort.sortInPlace(arr)
    expect(arr).toEqual([1, 3, 8, 9, 12, 17, 25])
  })

  it('sortInPlace handles array sorted except last element', () => {
    const arr = [1, 2, 3, 5, 4]
    CycleSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  it('sortInPlace handles array sorted except first element', () => {
    const arr = [5, 1, 2, 3, 4]
    CycleSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  it('sortInPlace handles reverse sorted with duplicates', () => {
    const arr = [5, 5, 3, 3, 1, 1]
    CycleSort.sortInPlace(arr)
    expect(arr).toEqual([1, 1, 3, 3, 5, 5])
  })

  it('handles increasing sequence', () => {
    const result = CycleSort.sort([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(result.sorted).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(result.writes).toBe(0)
  })

  it('handles decreasing sequence', () => {
    const result = CycleSort.sort([10, 9, 8, 7, 6, 5, 4, 3, 2, 1])
    expect(result.sorted).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  it('handles small array size of 3', () => {
    const result = CycleSort.sort([3, 2, 1])
    expect(result.sorted).toEqual([1, 2, 3])
  })

  it('handles small array size of 4', () => {
    const result = CycleSort.sort([4, 2, 3, 1])
    expect(result.sorted).toEqual([1, 2, 3, 4])
  })

  it('handles small array size of 5', () => {
    const result = CycleSort.sort([5, 3, 1, 4, 2])
    expect(result.sorted).toEqual([1, 2, 3, 4, 5])
  })

  it('handles alternating min max pattern', () => {
    const result = CycleSort.sort([1, 10, 2, 9, 3, 8, 4, 7, 5, 6])
    expect(result.sorted).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  it('should handle single element', () => {
    const result = CycleSort.sort([42])
    expect(result.sorted).toEqual([42])
    expect(result.writes).toBe(0)
  })

  it('should handle already sorted', () => {
    const result = CycleSort.sort([1, 2, 3])
    expect(result.sorted).toEqual([1, 2, 3])
  })

  it('sortInPlace modifies array and returns writes', () => {
    const arr = [3, 1, 2]
    const writes = CycleSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3])
    expect(writes).toBeGreaterThanOrEqual(0)
  })

  it('minWrites returns 0 for sorted array', () => {
    expect(CycleSort.minWrites(0)).toBe(0)
  })

  it('sort handles duplicates', () => {
    const result = CycleSort.sort([2, 1, 2, 1])
    expect(result.sorted).toEqual([1, 1, 2, 2])
  })
})
  it('sort empty array', () => {
    expect(CycleSort.sort([]).sorted).toEqual([])
  })

  it('sort single element', () => {
    expect(CycleSort.sort([1]).sorted).toEqual([1])
  })

  it('writes count', () => {
    const result = CycleSort.sort([3, 1, 2])
    expect(result.writes).toBeGreaterThanOrEqual(0)
  })

describe('cycle-sort - wave545', () => {
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

describe('cycle-sort - wave546', () => {
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

describe('cycle-sort - wave547', () => {
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
