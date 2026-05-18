import { describe, it, expect } from 'vitest'
import { TreeSort2 } from '../../src/core/tree-sort-2/index.js'

// ─── Constructor ───

describe('TreeSort2 constructor', () => {
  it('creates instance with default comparator', () => {
    const sorter = new TreeSort2<number>()
    expect(sorter.sort([3, 1, 2])).toEqual([1, 2, 3])
  })

  it('accepts a custom comparator', () => {
    const reverseCmp = (a: number, b: number) => b - a
    const sorter = new TreeSort2<number>(reverseCmp)
    expect(sorter.sort([1, 2, 3])).toEqual([3, 2, 1])
  })
})

// ─── sort ───

describe('TreeSort2 sort', () => {
  it('sorts an empty array', () => {
    const sorter = new TreeSort2<number>()
    expect(sorter.sort([])).toEqual([])
  })

  it('sorts a single-element array', () => {
    const sorter = new TreeSort2<number>()
    expect(sorter.sort([42])).toEqual([42])
  })

  it('sorts already sorted array', () => {
    const sorter = new TreeSort2<number>()
    expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
  })

  it('sorts reverse sorted array', () => {
    const sorter = new TreeSort2<number>()
    expect(sorter.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
  })

  it('sorts random order array', () => {
    const sorter = new TreeSort2<number>()
    expect(sorter.sort([3, 1, 4, 1, 5, 9, 2, 6])).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
  })

  it('does not mutate the original array', () => {
    const sorter = new TreeSort2<number>()
    const original = [3, 1, 2]
    const result = sorter.sort(original)
    expect(result).toEqual([1, 2, 3])
    expect(original).toEqual([3, 1, 2])
  })

  it('handles duplicate elements', () => {
    const sorter = new TreeSort2<number>()
    expect(sorter.sort([5, 5, 5, 5])).toEqual([5, 5, 5, 5])
  })

  it('handles negative numbers', () => {
    const sorter = new TreeSort2<number>()
    expect(sorter.sort([-3, 0, -1, 2, -5])).toEqual([-5, -3, -1, 0, 2])
  })

  it('handles string arrays', () => {
    const sorter = new TreeSort2<string>()
    expect(sorter.sort(['banana', 'apple', 'cherry'])).toEqual(['apple', 'banana', 'cherry'])
  })

  it('handles two-element array', () => {
    const sorter = new TreeSort2<number>()
    expect(sorter.sort([2, 1])).toEqual([1, 2])
  })

  it('handles two equal elements', () => {
    const sorter = new TreeSort2<number>()
    expect(sorter.sort([7, 7])).toEqual([7, 7])
  })
})

// ─── sortInPlace ───

describe('TreeSort2 sortInPlace', () => {
  it('sorts empty array in place', () => {
    const sorter = new TreeSort2<number>()
    const arr: number[] = []
    sorter.sortInPlace(arr)
    expect(arr).toEqual([])
  })

  it('sorts single-element array in place', () => {
    const sorter = new TreeSort2<number>()
    const arr = [42]
    sorter.sortInPlace(arr)
    expect(arr).toEqual([42])
  })

  it('sorts and mutates the original array', () => {
    const sorter = new TreeSort2<number>()
    const arr = [3, 1, 4, 1, 5, 9, 2, 6]
    sorter.sortInPlace(arr)
    expect(arr).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
  })

  it('handles already sorted array', () => {
    const sorter = new TreeSort2<number>()
    const arr = [1, 2, 3]
    sorter.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3])
  })

  it('handles reverse sorted array', () => {
    const sorter = new TreeSort2<number>()
    const arr = [5, 4, 3, 2, 1]
    sorter.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  it('handles negative numbers', () => {
    const sorter = new TreeSort2<number>()
    const arr = [-3, 0, -1, 2, -5]
    sorter.sortInPlace(arr)
    expect(arr).toEqual([-5, -3, -1, 0, 2])
  })

  it('handles duplicate elements', () => {
    const sorter = new TreeSort2<number>()
    const arr = [3, 1, 1, 3, 2]
    sorter.sortInPlace(arr)
    expect(arr).toEqual([1, 1, 2, 3, 3])
  })

  it('handles string arrays', () => {
    const sorter = new TreeSort2<string>()
    const arr = ['cherry', 'apple', 'banana']
    sorter.sortInPlace(arr)
    expect(arr).toEqual(['apple', 'banana', 'cherry'])
  })
})

// ─── Custom Comparator ───

describe('TreeSort2 custom comparator', () => {
  it('sorts objects by property', () => {
    const sorter = new TreeSort2<{ age: number }>((a, b) => a.age - b.age)
    const input = [{ age: 30 }, { age: 10 }, { age: 20 }]
    const result = sorter.sort(input)
    expect(result).toEqual([{ age: 10 }, { age: 20 }, { age: 30 }])
  })

  it('sorts in descending order with reverse comparator', () => {
    const sorter = new TreeSort2<number>((a, b) => b - a)
    expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([5, 4, 3, 2, 1])
  })
})

// ─── Edge Cases ───

describe('TreeSort2 edge cases', () => {
  it('handles shuffled array', () => {
    const sorter = new TreeSort2<number>()
    const arr = [5, 2, 8, 1, 9, 3, 7, 4, 6, 10]
    const result = sorter.sort(arr)
    expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  it('handles array of all identical elements', () => {
    const sorter = new TreeSort2<number>()
    const arr = [7, 7, 7, 7, 7, 7]
    expect(sorter.sort(arr)).toEqual([7, 7, 7, 7, 7, 7])
  })

  it('handles array with floating point numbers', () => {
    const sorter = new TreeSort2<number>()
    const arr = [1.5, -2.3, 0, 3.14, -0.001]
    expect(sorter.sort(arr)).toEqual([-2.3, -0.001, 0, 1.5, 3.14])
  })

  it('sort returns a new array', () => {
    const sorter = new TreeSort2<number>()
    const arr = [2, 1]
    const result = sorter.sort(arr)
    expect(result).not.toBe(arr)
  })
})
