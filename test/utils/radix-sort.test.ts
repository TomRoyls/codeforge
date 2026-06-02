import { describe, it, expect } from 'vitest'
import { RadixSort } from '../../src/utils/radix-sort.js'

describe('RadixSort', () => {
  it('sorts empty array', () => {
    const result = RadixSort.sort([])
    expect(result).toEqual([])
  })

  it('sorts single element array', () => {
    const result = RadixSort.sort([5])
    expect(result).toEqual([5])
  })

  it('sorts positive numbers ascending', () => {
    const result = RadixSort.sort([3, 1, 4, 1, 5, 9, 2, 6])
    expect(result).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
  })

  it('sorts negative numbers ascending', () => {
    const result = RadixSort.sort([-5, -1, -3, -2, -4])
    expect(result).toEqual([-5, -4, -3, -2, -1])
  })

  it('sorts mixed positive and negative numbers ascending', () => {
    const result = RadixSort.sort([3, -1, 4, -5, 0, 2, -3])
    expect(result).toEqual([-5, -3, -1, 0, 2, 3, 4])
  })

  it('sorts in descending order', () => {
    const result = RadixSort.sort([3, 1, 4, 1, 5, 9, 2, 6], { ascending: false })
    expect(result).toEqual([9, 6, 5, 4, 3, 2, 1, 1])
  })

  it('returns new array, does not mutate original', () => {
    const original = [3, 1, 2]
    const result = RadixSort.sort(original)
    expect(original).toEqual([3, 1, 2])
    expect(result).toEqual([1, 2, 3])
  })

  it('handles duplicate numbers', () => {
    const result = RadixSort.sort([2, 2, 2, 1, 1, 3, 3])
    expect(result).toEqual([1, 1, 2, 2, 2, 3, 3])
  })

  it('handles large numbers', () => {
    const result = RadixSort.sort([2147483647, -2147483648, 0, 123456789])
    expect(result).toEqual([-2147483648, 0, 123456789, 2147483647])
  })

  it('sorts unsigned numbers', () => {
    const result = RadixSort.sortUnsigned([5, 3, 1, 4, 2])
    expect(result).toEqual([1, 2, 3, 4, 5])
  })

  it('sorts objects by key function ascending', () => {
    const items = [
      { name: 'alice', value: 3 },
      { name: 'bob', value: 1 },
      { name: 'charlie', value: 2 }
    ]
    const result = RadixSort.sortBy(items, (item) => item.value)
    expect(result![0]!.name).toBe('bob')
    expect(result![1]!.name).toBe('charlie')
    expect(result![2]!.name).toBe('alice')
  })

  it('sorts objects by key function descending', () => {
    const items = [
      { name: 'alice', value: 3 },
      { name: 'bob', value: 1 },
      { name: 'charlie', value: 2 }
    ]
    const result = RadixSort.sortBy(items, (item) => item.value, { ascending: false })
    expect(result![0]!.name).toBe('alice')
    expect(result![1]!.name).toBe('charlie')
    expect(result![2]!.name).toBe('bob')
  })

  it('returns new array when sorting by key', () => {
    const items = [{ value: 3 }, { value: 1 }]
    const result = RadixSort.sortBy(items, (item) => item.value)
    expect(items).toEqual([{ value: 3 }, { value: 1 }])
    expect(result![0]!.value).toBe(1)
  })

  it('sorts in place ascending', () => {
    const arr = [3, 1, 4, 1, 5]
    const result = RadixSort.sortInPlace(arr)
    expect(result).toBe(arr)
    expect(arr).toEqual([1, 1, 3, 4, 5])
  })

  it('sorts in place descending', () => {
    const arr = [3, 1, 4, 1, 5]
    const result = RadixSort.sortInPlace(arr, { ascending: false })
    expect(result).toBe(arr)
    expect(arr).toEqual([5, 4, 3, 1, 1])
  })

  it('handles empty array for in place sort', () => {
    const arr: number[] = []
    const result = RadixSort.sortInPlace(arr)
    expect(result).toBe(arr)
    expect(arr).toEqual([])
  })

  it('handles single element for in place sort', () => {
    const arr = [5]
    const result = RadixSort.sortInPlace(arr)
    expect(result).toBe(arr)
    expect(arr).toEqual([5])
  })

  it('sortInPlace handles empty array', () => {
    const arr: number[] = []
    const result = RadixSort.sortInPlace(arr)
    expect(result).toBe(arr)
    expect(arr).toEqual([])
  })

  it('sorts negative numbers', () => {
    expect(RadixSort.sort([-3, -1, -2, 0])).toEqual([-3, -2, -1, 0])
  })
})