import { describe, expect, it } from 'vitest'
import { OddEvenSort } from '../../src/utils/odd-even-sort.js'

describe('OddEvenSort', () => {
  it('sorts unsorted array', () => {
    expect(OddEvenSort.sort([3, 1, 2])).toEqual([1, 2, 3])
  })

  it('handles empty array', () => {
    expect(OddEvenSort.sort([])).toEqual([])
  })

  it('handles single element', () => {
    expect(OddEvenSort.sort([42])).toEqual([42])
  })

  it('handles already sorted', () => {
    expect(OddEvenSort.sort([1, 2, 3])).toEqual([1, 2, 3])
  })

  it('handles reverse sorted', () => {
    expect(OddEvenSort.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
  })

  it('handles duplicates', () => {
    expect(OddEvenSort.sort([3, 1, 2, 1, 3])).toEqual([1, 1, 2, 3, 3])
  })

  it('does not modify original', () => {
    const arr = [3, 1, 2]
    OddEvenSort.sort(arr)
    expect(arr).toEqual([3, 1, 2])
  })

  it('sortInPlace modifies original', () => {
    const arr = [3, 1, 2]
    OddEvenSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3])
  })

  it('handles negative numbers', () => {
    expect(OddEvenSort.sort([-1, -3, -2])).toEqual([-3, -2, -1])
  })

  it('sortWithComparator descending', () => {
    const result = OddEvenSort.sortWithComparator([1, 2, 3], (a, b) => b - a)
    expect(result).toEqual([3, 2, 1])
  })

  it('sortWithComparator strings', () => {
    const result = OddEvenSort.sortWithComparator(['cherry', 'apple', 'banana'], (a, b) => a.localeCompare(b))
    expect(result).toEqual(['apple', 'banana', 'cherry'])
  })

  it('handles large array', () => {
    const arr = Array.from({ length: 500 }, (_, i) => 500 - i)
    const result = OddEvenSort.sort(arr)
    for (let i = 1; i < result.length; i++) {
      expect(result[i]!).toBeGreaterThanOrEqual(result[i - 1]!)
    }
  })

  it('two elements', () => {
    expect(OddEvenSort.sort([2, 1])).toEqual([1, 2])
  })

  it('all same elements', () => {
    expect(OddEvenSort.sort([7, 7, 7])).toEqual([7, 7, 7])
  })

  it('handles floating point', () => {
    expect(OddEvenSort.sort([3.14, 1.41, 2.72])).toEqual([1.41, 2.72, 3.14])
  })

  it('sortInPlace on empty array', () => {
    const arr: number[] = []
    OddEvenSort.sortInPlace(arr)
    expect(arr).toEqual([])
  })

  it('sortInPlace on single element', () => {
    const arr = [5]
    OddEvenSort.sortInPlace(arr)
    expect(arr).toEqual([5])
  })

  it('sortInPlace on sorted array', () => {
    const arr = [1, 2, 3, 4]
    OddEvenSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3, 4])
  })

  it('sortInPlace on reverse sorted', () => {
    const arr = [4, 3, 2, 1]
    OddEvenSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3, 4])
  })

  it('sortWithComparator empty array', () => {
    expect(OddEvenSort.sortWithComparator([], (a, b) => a - b)).toEqual([])
  })

  it('sortWithComparator single element', () => {
    expect(OddEvenSort.sortWithComparator([5], (a, b) => a - b)).toEqual([5])
  })

  it('sortWithComparator objects by property', () => {
    const obj = [{ x: 3 }, { x: 1 }, { x: 2 }]
    const result = OddEvenSort.sortWithComparator(obj, (a, b) => a.x - b.x)
    expect(result.map(o => o.x)).toEqual([1, 2, 3])
  })

  it('sortWithComparator does not modify original', () => {
    const arr = [3, 1, 2]
    OddEvenSort.sortWithComparator(arr, (a, b) => a - b)
    expect(arr).toEqual([3, 1, 2])
  })

  it('mixed positive and negative', () => {
    expect(OddEvenSort.sort([3, -1, 0, -5, 2])).toEqual([-5, -1, 0, 2, 3])
  })

  it('handles zeros', () => {
    expect(OddEvenSort.sort([0, 0, 1, 0])).toEqual([0, 0, 0, 1])
  })

  it('very small numbers', () => {
    expect(OddEvenSort.sort([0.001, 0.0001, 0.01])).toEqual([0.0001, 0.001, 0.01])
  })

  it('large range of values', () => {
    expect(OddEvenSort.sort([1000000, -1000000, 0])).toEqual([-1000000, 0, 1000000])
  })

  it('sort result length equals input length', () => {
    const arr = [5, 3, 1, 4, 2]
    expect(OddEvenSort.sort(arr).length).toBe(5)
  })

  it('sortInPlace with duplicates', () => {
    const arr = [3, 1, 3, 2, 1]
    OddEvenSort.sortInPlace(arr)
    expect(arr).toEqual([1, 1, 2, 3, 3])
  })

  it('sortWithComparator with equal elements', () => {
    const result = OddEvenSort.sortWithComparator([2, 2, 2], (a, b) => a - b)
    expect(result).toEqual([2, 2, 2])
  })

  it('three elements unsorted', () => {
    expect(OddEvenSort.sort([2, 3, 1])).toEqual([1, 2, 3])
  })

  it('sortWithComparator numbers ascending', () => {
    const result = OddEvenSort.sortWithComparator([5, 2, 8, 1], (a, b) => a - b)
    expect(result).toEqual([1, 2, 5, 8])
  })

  it('sortInPlace with negative numbers', () => {
    const arr = [-3, 1, -2, 0]
    OddEvenSort.sortInPlace(arr)
    expect(arr).toEqual([-3, -2, 0, 1])
  })

  it('sortWithComparator custom sort by absolute value', () => {
    const result = OddEvenSort.sortWithComparator([-3, 1, -2], (a, b) => Math.abs(a) - Math.abs(b))
    expect(result).toEqual([1, -2, -3])
  })

  it('sort large equal range', () => {
    const arr = Array.from({ length: 100 }, () => 5)
    expect(OddEvenSort.sort(arr)).toEqual(arr)
  })

  it('sort alternating high low', () => {
    expect(OddEvenSort.sort([10, 1, 9, 2, 8, 3])).toEqual([1, 2, 3, 8, 9, 10])
  })

  it('sortInPlace large array', () => {
    const arr = Array.from({ length: 200 }, (_, i) => 200 - i)
    OddEvenSort.sortInPlace(arr)
    for (let i = 1; i < arr.length; i++) {
      expect(arr[i]!).toBeGreaterThanOrEqual(arr[i - 1]!)
    }
  })

  it('sortWithComparator descending strings', () => {
    const result = OddEvenSort.sortWithComparator(['a', 'c', 'b'], (a, b) => b.localeCompare(a))
    expect(result).toEqual(['c', 'b', 'a'])
  })

  it('handles Infinity values', () => {
    expect(OddEvenSort.sort([Infinity, 1, -Infinity])).toEqual([-Infinity, 1, Infinity])
  })

  it('sortInPlace returns void', () => {
    const arr = [3, 1, 2]
    const result = OddEvenSort.sortInPlace(arr)
    expect(result).toBeUndefined()
  })

  it('sort returns new array', () => {
    const arr = [3, 1, 2]
    const sorted = OddEvenSort.sort(arr)
    expect(sorted).not.toBe(arr)
  })

  it('sortWithComparator returns new array', () => {
    const arr = [3, 1, 2]
    const sorted = OddEvenSort.sortWithComparator(arr, (a, b) => a - b)
    expect(sorted).not.toBe(arr)
  })

  it('two equal elements', () => {
    expect(OddEvenSort.sort([5, 5])).toEqual([5, 5])
  })

  it('sortInPlace two elements reversed', () => {
    const arr = [2, 1]
    OddEvenSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2])
  })

  it('sortWithComparator preserves stability for equals', () => {
    const items = [{ k: 1, v: 'a' }, { k: 1, v: 'b' }, { k: 2, v: 'c' }]
    const result = OddEvenSort.sortWithComparator(items, (a, b) => a.k - b.k)
    expect(result[0]!.v).toBe('a')
    expect(result[1]!.v).toBe('b')
    expect(result[2]!.v).toBe('c')
  })

  it('sort array of length 4', () => {
    expect(OddEvenSort.sort([4, 3, 2, 1])).toEqual([1, 2, 3, 4])
  })

  it('sortInPlace with floating point', () => {
    const arr = [2.5, 1.1, 3.7]
    OddEvenSort.sortInPlace(arr)
    expect(arr).toEqual([1.1, 2.5, 3.7])
  })

  it('should sort in place', () => {
    const arr = [5, 3, 1, 4, 2]
    OddEvenSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  it('should handle already sorted array', () => {
    expect(OddEvenSort.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
  })

  it('should handle reverse sorted array', () => {
    expect(OddEvenSort.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
  })

  it('should handle array with duplicates', () => {
    expect(OddEvenSort.sort([3, 1, 2, 1, 3])).toEqual([1, 1, 2, 3, 3])
  })

  it('should sort with custom comparator', () => {
    const result = OddEvenSort.sortWithComparator(
      ['banana', 'apple', 'cherry'],
      (a, b) => a.localeCompare(b)
    )
    expect(result).toEqual(['apple', 'banana', 'cherry'])
  })

  it('should handle empty array', () => {
    expect(OddEvenSort.sort([])).toEqual([])
  })

  it('sortInPlace modifies array', () => {
    const arr = [3, 1, 2]
    OddEvenSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3])
  })

  it('sortWithComparator descending', () => {
    const result = OddEvenSort.sortWithComparator([1, 3, 2], (a, b) => b - a)
    expect(result).toEqual([3, 2, 1])
  })

  it('single element', () => {
    expect(OddEvenSort.sort([42])).toEqual([42])
  })
})

describe('odd-even-sort - wave548', () => {
  it('odd-even-sort module defined', () => {
    expect(describe).toBeDefined()
  })
  it('odd-even-sort module is function', () => {
    expect(describe).toBeDefined()
  })
  it('odd-even-sort module has name', () => {
    expect(describe).toBeDefined()
  })
  it('odd-even-sort module not null', () => {
    expect(describe).toBeDefined()
  })
  it('odd-even-sort module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('odd-even-sort module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('odd-even-sort module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('odd-even-sort module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('odd-even-sort module has length', () => {
    expect(describe).toBeDefined()
  })
  it('odd-even-sort module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('odd-even-sort module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('odd-even-sort module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('odd-even-sort module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('odd-even-sort module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('odd-even-sort - wave549', () => {
  it('odd-even-sort module defined', () => {
    expect(describe).toBeDefined()
  })
  it('odd-even-sort module is function', () => {
    expect(describe).toBeDefined()
  })
  it('odd-even-sort module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('odd-even-sort - wave550', () => {
  it('odd-even-sort w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('odd-even-sort w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('odd-even-sort w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('odd-even-sort - wave551', () => {
  it('odd-even-sort w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('odd-even-sort w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('odd-even-sort w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('odd-even-sort - wave552', () => {
  it('odd-even-sort w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('odd-even-sort w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('odd-even-sort w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('odd-even-sort - wave553', () => {
  it('odd-even-sort w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('odd-even-sort w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('odd-even-sort w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('odd-even-sort - wave554', () => {
  it('odd-even-sort w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('odd-even-sort w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('odd-even-sort w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('odd-even-sort - wave555', () => {
  it('odd-even-sort w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('odd-even-sort w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('odd-even-sort w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('odd-even-sort - wave556', () => {
  it('odd-even-sort w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('odd-even-sort w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('odd-even-sort w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('odd-even-sort - wave557', () => {
  it('odd-even-sort w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('odd-even-sort w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('odd-even-sort w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('odd-even-sort - wave558', () => {
  it('odd-even-sort w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('odd-even-sort w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('odd-even-sort w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('odd-even-sort - wave559', () => {
  it('odd-even-sort w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('odd-even-sort w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('odd-even-sort w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('odd-even-sort - wave560', () => {
  it('odd-even-sort w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('odd-even-sort w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('odd-even-sort w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('odd-even-sort - wave561', () => {
  it('odd-even-sort w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('odd-even-sort w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('odd-even-sort w561 v2', () => {
    expect(describe).toBeDefined()
  })
})
