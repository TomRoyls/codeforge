import { describe, it, expect } from 'vitest'
import { CubeSort2 } from '../../src/core/cube-sort-2/index.js'

// ─── Constructor ───

describe('CubeSort2 - Constructor', () => {
  it('should create instance with default cube size', () => {
    const sorter = new CubeSort2()
    expect(sorter).toBeDefined()
  })

  it('should create instance with custom cube size', () => {
    const sorter = new CubeSort2(10)
    expect(sorter).toBeDefined()
  })

  it('should create instance with custom comparator', () => {
    const sorter = new CubeSort2(5, (a, b) => (a as number) - (b as number))
    expect(sorter).toBeDefined()
  })

  it('should create instance with cube size 1', () => {
    const sorter = new CubeSort2(1)
    const result = sorter.sort([3, 1, 2])
    expect(result).toEqual([1, 2, 3])
  })

  it('should create instance with large cube size exceeding array length', () => {
    const sorter = new CubeSort2(1000)
    const result = sorter.sort([3, 1, 2])
    expect(result).toEqual([1, 2, 3])
  })
})

// ─── sort ───

describe('CubeSort2 - sort', () => {
  it('should sort an empty array', () => {
    const sorter = new CubeSort2()
    expect(sorter.sort([])).toEqual([])
  })

  it('should sort a single element array', () => {
    const sorter = new CubeSort2()
    expect(sorter.sort([5])).toEqual([5])
  })

  it('should sort a sorted array', () => {
    const sorter = new CubeSort2()
    expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
  })

  it('should sort a reverse sorted array', () => {
    const sorter = new CubeSort2()
    expect(sorter.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
  })

  it('should sort with duplicate values', () => {
    const sorter = new CubeSort2()
    expect(sorter.sort([3, 1, 2, 1, 3])).toEqual([1, 1, 2, 3, 3])
  })

  it('should sort with negative numbers', () => {
    const sorter = new CubeSort2()
    expect(sorter.sort([-1, -5, 3, -2, 0])).toEqual([-5, -2, -1, 0, 3])
  })

  it('should not mutate the original array', () => {
    const sorter = new CubeSort2()
    const original = [3, 1, 2]
    const result = sorter.sort(original)
    expect(result).toEqual([1, 2, 3])
    expect(original).toEqual([3, 1, 2])
  })

  it('should sort two elements', () => {
    const sorter = new CubeSort2()
    expect(sorter.sort([2, 1])).toEqual([1, 2])
  })

  it('should sort with all identical elements', () => {
    const sorter = new CubeSort2()
    expect(sorter.sort([7, 7, 7, 7])).toEqual([7, 7, 7, 7])
  })

  it('should sort large array correctly', () => {
    const sorter = new CubeSort2(10)
    const arr = Array.from({ length: 100 }, () => Math.floor(Math.random() * 1000))
    const result = sorter.sort(arr)
    for (let i = 1; i < result.length; i++) {
      expect(result[i]).toBeGreaterThanOrEqual(result[i - 1]!)
    }
  })

  it('should sort with descending comparator', () => {
    const sorter = new CubeSort2(10, (a, b) => (b as number) - (a as number))
    const result = sorter.sort([3, 1, 4, 1, 5])
    expect(result).toEqual([5, 4, 3, 1, 1])
  })

  it('should sort strings with default comparator', () => {
    const sorter = new CubeSort2()
    const result = sorter.sort(['banana', 'apple', 'cherry'])
    expect(result).toEqual(['apple', 'banana', 'cherry'])
  })
})

// ─── sortInPlace ───

describe('CubeSort2 - sortInPlace', () => {
  it('should sort array in place', () => {
    const sorter = new CubeSort2()
    const arr = [3, 1, 2]
    sorter.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3])
  })

  it('should handle empty array', () => {
    const sorter = new CubeSort2()
    const arr: number[] = []
    sorter.sortInPlace(arr)
    expect(arr).toEqual([])
  })

  it('should handle single element', () => {
    const sorter = new CubeSort2()
    const arr = [42]
    sorter.sortInPlace(arr)
    expect(arr).toEqual([42])
  })

  it('should sort with small cube size', () => {
    const sorter = new CubeSort2(2)
    const arr = [5, 3, 1, 4, 2]
    sorter.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  it('should sort reverse array in place', () => {
    const sorter = new CubeSort2()
    const arr = [5, 4, 3, 2, 1]
    sorter.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  it('should sort with duplicates in place', () => {
    const sorter = new CubeSort2()
    const arr = [2, 2, 1, 1, 3, 3]
    sorter.sortInPlace(arr)
    expect(arr).toEqual([1, 1, 2, 2, 3, 3])
  })
})
