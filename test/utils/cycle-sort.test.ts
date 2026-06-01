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

  it('handles already sorted array', () => {
    const arr = [1, 2, 3, 4]
    const writes = CycleSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3, 4])
    expect(writes).toBe(0)
  })

  it('handles single element', () => {
    const arr = [42]
    expect(CycleSort.sortInPlace(arr)).toBe(0)
    expect(arr).toEqual([42])
  })
})
