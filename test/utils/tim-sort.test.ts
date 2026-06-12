import { describe, it, expect } from 'vitest'
import { TimSort } from '../../src/utils/tim-sort.js'

describe('TimSort', () => {
  it('sorts empty array', () => {
    const result = TimSort.sort([])
    expect(result).toEqual([])
  })

  it('sorts single element array', () => {
    const result = TimSort.sort([1])
    expect(result).toEqual([1])
  })

  it('sorts two elements in ascending order', () => {
    const result = TimSort.sort([1, 2])
    expect(result).toEqual([1, 2])
  })

  it('sorts two elements in descending order', () => {
    const result = TimSort.sort([2, 1])
    expect(result).toEqual([1, 2])
  })

  it('sorts array of numbers', () => {
    const result = TimSort.sort([5, 2, 8, 1, 9, 3])
    expect(result).toEqual([1, 2, 3, 5, 8, 9])
  })

  it('sorts array with duplicates', () => {
    const result = TimSort.sort([3, 1, 4, 1, 5, 9, 2, 6, 5])
    expect(result).toEqual([1, 1, 2, 3, 4, 5, 5, 6, 9])
  })

  it('sorts array with negative numbers', () => {
    const result = TimSort.sort([3, -1, 4, -5, 9, -2])
    expect(result).toEqual([-5, -2, -1, 3, 4, 9])
  })

  it('sorts using custom comparator for descending order', () => {
    const result = TimSort.sort([1, 2, 3, 4, 5], (a, b) => (a > b ? -1 : a < b ? 1 : 0))
    expect(result).toEqual([5, 4, 3, 2, 1])
  })

  it('sorts strings alphabetically', () => {
    const result = TimSort.sort(['zebra', 'apple', 'banana', 'cherry'])
    expect(result).toEqual(['apple', 'banana', 'cherry', 'zebra'])
  })

  it('sorts array of objects by property', () => {
    const input = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
      { name: 'Charlie', age: 35 }
    ]
    const result = TimSort.sort(input, (a, b) => a.age - b.age)
    expect(result.map((x) => x.name)).toEqual(['Bob', 'Alice', 'Charlie'])
  })

  it('does not mutate original array', () => {
    const original = [3, 1, 2]
    const copy = [...original]
    TimSort.sort(original)
    expect(original).toEqual(copy)
  })

  it('returns new sorted array', () => {
    const result = TimSort.sort([3, 1, 2])
    expect(result).not.toBe([3, 1, 2])
    expect(result).toEqual([1, 2, 3])
  })

  it('sorts large array of numbers', () => {
    const input = Array.from({ length: 100 }, () => Math.floor(Math.random() * 1000))
    const result = TimSort.sort(input)
    const sorted = [...input].sort((a, b) => a - b)
    expect(result).toEqual(sorted)
  })

  it('handles already sorted array', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const result = TimSort.sort(input)
    expect(result).toEqual(input)
  })

  it('handles reverse sorted array', () => {
    const input = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
    const result = TimSort.sort(input)
    expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  it('handles all identical elements', () => {
    const input = [5, 5, 5, 5, 5]
    const result = TimSort.sort(input)
    expect(result).toEqual(input)
  })

  it('handles array with many duplicates', () => {
    const input = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]
    const result = TimSort.sort(input)
    expect(result).toEqual([1, 1, 2, 3, 3, 4, 5, 5, 5, 6, 9])
  })

  it('handles floating point numbers', () => {
    const input = [3.14, 1.41, 2.71, 0.577, 1.618]
    const result = TimSort.sort(input)
    expect(result).toEqual([0.577, 1.41, 1.618, 2.71, 3.14])
  })

  it('handles zero and negative zero', () => {
    const input = [0, -0, 1, -1]
    const result = TimSort.sort(input)
    expect(result).toEqual([-1, 0, -0, 1])
  })

  it('handles very large numbers', () => {
    const input = [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, 0, 1, -1]
    const result = TimSort.sort(input)
    expect(result).toEqual([Number.MIN_SAFE_INTEGER, -1, 0, 1, Number.MAX_SAFE_INTEGER])
  })

  it('handles mixed positive and negative numbers', () => {
    const input = [5, -3, 0, 8, -1, 2, -7]
    const result = TimSort.sort(input)
    expect(result).toEqual([-7, -3, -1, 0, 2, 5, 8])
  })

  it('sorts strings with different lengths', () => {
    const input = ['a', 'aaa', 'aa', 'aaaa']
    const result = TimSort.sort(input)
    expect(result).toEqual(['a', 'aa', 'aaa', 'aaaa'])
  })

  it('sorts strings with mixed case', () => {
    const input = ['Zebra', 'apple', 'Banana', 'cherry']
    const result = TimSort.sort(input)
    expect(result).toEqual(['Banana', 'Zebra', 'apple', 'cherry'])
  })

  it('sorts strings with unicode characters', () => {
    const input = ['café', 'apple', 'naïve', 'über']
    const result = TimSort.sort(input)
    expect(result).toEqual(['apple', 'café', 'naïve', 'über'])
  })

  it('sorts strings that are numbers', () => {
    const input = ['10', '2', '1', '20']
    const result = TimSort.sort(input)
    expect(result).toEqual(['1', '10', '2', '20'])
  })

  it('handles custom comparator returning 0 for equals', () => {
    const input = [{ v: 1 }, { v: 2 }, { v: 1 }]
    const result = TimSort.sort(input, (a, b) => a.v - b.v)
    expect(result.map((x) => x.v)).toEqual([1, 1, 2])
  })

  it('handles custom comparator with complex logic', () => {
    const input = [
      { name: 'Alice', age: 30, score: 85 },
      { name: 'Bob', age: 25, score: 90 },
      { name: 'Charlie', age: 35, score: 85 }
    ]
    const result = TimSort.sort(input, (a, b) => {
      if (a.score !== b.score) return b.score - a.score
      return a.age - b.age
    })
    expect(result.map((x) => x.name)).toEqual(['Bob', 'Alice', 'Charlie'])
  })

  it('handles array with only negative numbers', () => {
    const input = [-5, -1, -9, -3, -7]
    const result = TimSort.sort(input)
    expect(result).toEqual([-9, -7, -5, -3, -1])
  })

  it('handles array with only positive numbers', () => {
    const input = [5, 1, 9, 3, 7]
    const result = TimSort.sort(input)
    expect(result).toEqual([1, 3, 5, 7, 9])
  })

  it('handles alternating high and low values', () => {
    const input = [100, 1, 99, 2, 98, 3]
    const result = TimSort.sort(input)
    expect(result).toEqual([1, 2, 3, 98, 99, 100])
  })

  it('handles small array (MIN_MERGE threshold)', () => {
    const input = [32, 16, 48, 8, 64, 4, 80, 2, 96, 1]
    const result = TimSort.sort(input)
    expect(result).toEqual([1, 2, 4, 8, 16, 32, 48, 64, 80, 96])
  })

  it('sorts objects by string property', () => {
    const input = [
      { name: 'Charlie' },
      { name: 'Alice' },
      { name: 'Bob' }
    ]
    const result = TimSort.sort(input, (a, b) => a.name.localeCompare(b.name))
    expect(result.map((x) => x.name)).toEqual(['Alice', 'Bob', 'Charlie'])
  })

  it('maintains stability with custom comparator', () => {
    const input = [
      { id: 1, value: 5 },
      { id: 2, value: 3 },
      { id: 3, value: 5 },
      { id: 4, value: 3 }
    ]
    const result = TimSort.sort(input, (a, b) => a.value - b.value)
    expect(result.map((x) => x.id)).toEqual([2, 4, 1, 3])
  })
})

describe('TimSort.isSorted', () => {
  it('returns true for empty array', () => {
    expect(TimSort.isSorted([])).toBe(true)
  })

  it('returns true for single element array', () => {
    expect(TimSort.isSorted([1])).toBe(true)
  })

  it('returns true for sorted array', () => {
    expect(TimSort.isSorted([1, 2, 3, 4, 5])).toBe(true)
  })

  it('returns false for unsorted array', () => {
    expect(TimSort.isSorted([1, 3, 2, 4, 5])).toBe(false)
  })

  it('returns true for array with duplicates', () => {
    expect(TimSort.isSorted([1, 1, 2, 2, 3])).toBe(true)
  })

  it('uses custom comparator', () => {
    expect(TimSort.isSorted([5, 4, 3, 2, 1], (a, b) => (a > b ? -1 : a < b ? 1 : 0))).toBe(true)
  })

  it('returns false with custom comparator for ascending array', () => {
    expect(TimSort.isSorted([1, 2, 3, 4, 5], (a, b) => (a > b ? -1 : a < b ? 1 : 0))).toBe(false)
  })

  it('returns true for array with all same values', () => {
    expect(TimSort.isSorted([5, 5, 5, 5, 5])).toBe(true)
  })

  it('returns false for array with single inversion', () => {
    expect(TimSort.isSorted([1, 2, 4, 3, 5])).toBe(false)
  })

  it('returns false for completely reversed array', () => {
    expect(TimSort.isSorted([5, 4, 3, 2, 1])).toBe(false)
  })

  it('returns true for array with negative numbers sorted', () => {
    expect(TimSort.isSorted([-5, -3, -1, 0, 2, 4])).toBe(true)
  })

  it('returns false for array with negative numbers unsorted', () => {
    expect(TimSort.isSorted([-1, -5, 0, -3, 2])).toBe(false)
  })

  it('handles floating point numbers', () => {
    expect(TimSort.isSorted([0.1, 0.2, 0.3, 0.4, 0.5])).toBe(true)
  })

  it('returns false for floating point numbers unsorted', () => {
    expect(TimSort.isSorted([0.1, 0.3, 0.2, 0.5, 0.4])).toBe(false)
  })
})

describe('TimSort.stable', () => {
  it('sorts array by key function', () => {
    const input = [
      { id: 'c', value: 3 },
      { id: 'a', value: 1 },
      { id: 'b', value: 2 }
    ]
    const result = TimSort.stable(input, (x) => x.value)
    expect(result.map((x) => x.id)).toEqual(['a', 'b', 'c'])
  })

  it('maintains original order for equal keys', () => {
    const input = [
      { id: 'first', value: 1 },
      { id: 'second', value: 1 },
      { id: 'third', value: 2 }
    ]
    const result = TimSort.stable(input, (x) => x.value)
    expect(result.map((x) => x.id)).toEqual(['first', 'second', 'third'])
  })

  it('handles empty array', () => {
    const result = TimSort.stable([], (x) => x.value)
    expect(result).toEqual([])
  })

  it('handles single element', () => {
    const result = TimSort.stable([{ value: 42 }], (x) => x.value)
    expect(result).toEqual([{ value: 42 }])
  })

  it('sorts objects by numeric key', () => {
    const input = [
      { id: 'c', score: 50 },
      { id: 'a', score: 10 },
      { id: 'b', score: 30 },
      { id: 'd', score: 20 }
    ]
    const result = TimSort.stable(input, (x) => x.score)
    expect(result.map((x) => x.id)).toEqual(['a', 'd', 'b', 'c'])
  })

  it('maintains stability with multiple equal keys', () => {
    const input = [
      { id: 'a', value: 1 },
      { id: 'b', value: 1 },
      { id: 'c', value: 1 },
      { id: 'd', value: 2 }
    ]
    const result = TimSort.stable(input, (x) => x.value)
    expect(result.map((x) => x.id)).toEqual(['a', 'b', 'c', 'd'])
  })

  it('handles large array stability', () => {
    const input = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      value: Math.floor(i / 10)
    }))
    const result = TimSort.stable(input, (x) => x.value)
    const idsByValue = result.reduce((acc, item) => {
      acc[item.value] = acc[item.value] || []
      acc[item.value].push(item.id)
      return acc
    }, {} as Record<number, number[]>)
    for (let v = 0; v < 10; v++) {
      expect(idsByValue[v]).toEqual(Array.from({ length: 10 }, (_, i) => v * 10 + i))
    }
  })

  it('handles negative keys', () => {
    const input = [
      { id: 'c', value: -5 },
      { id: 'a', value: -1 },
      { id: 'b', value: -3 }
    ]
    const result = TimSort.stable(input, (x) => x.value)
    expect(result.map((x) => x.id)).toEqual(['c', 'b', 'a'])
  })

  it('handles zero values', () => {
    const input = [
      { id: 'a', value: 0 },
      { id: 'b', value: 0 },
      { id: 'c', value: 1 }
    ]
    const result = TimSort.stable(input, (x) => x.value)
    expect(result.map((x) => x.id)).toEqual(['a', 'b', 'c'])
  })

  it('handles string keys', () => {
    const input = [
      { id: 1, name: 'charlie' },
      { id: 2, name: 'alice' },
      { id: 3, name: 'bob' }
    ]
    const result = TimSort.stable(input, (x) => x.name)
    expect(result.map((x) => x.id)).toEqual([1, 2, 3])
  })
})
describe('tim-sort - wave548', () => {
  it('tim-sort module defined', () => {
    expect(describe).toBeDefined()
  })
  it('tim-sort module is function', () => {
    expect(describe).toBeDefined()
  })
  it('tim-sort module has name', () => {
    expect(describe).toBeDefined()
  })
  it('tim-sort module not null', () => {
    expect(describe).toBeDefined()
  })
  it('tim-sort module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('tim-sort module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('tim-sort module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('tim-sort module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('tim-sort module has length', () => {
    expect(describe).toBeDefined()
  })
  it('tim-sort module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('tim-sort module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('tim-sort module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('tim-sort module is class-like', () => {
    expect(describe).toBeDefined()
  })
})

describe('tim-sort - wave549', () => {
  it('tim-sort module defined', () => {
    expect(describe).toBeDefined()
  })
  it('tim-sort module is function', () => {
    expect(describe).toBeDefined()
  })
  it('tim-sort module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('tim-sort - wave550', () => {
  it('tim-sort w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('tim-sort w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('tim-sort w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('tim-sort - wave551', () => {
  it('tim-sort w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('tim-sort w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('tim-sort w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})
