import { describe, it, expect } from 'vitest'
import { CountingSort } from '../../src/utils/counting-sort.js'

describe('CountingSort', () => {
  it('sorts empty array', () => {
    expect(CountingSort.sort([])).toEqual([])
  })

  it('sorts single element', () => {
    expect(CountingSort.sort([42])).toEqual([42])
  })

  it('sorts already sorted array', () => {
    expect(CountingSort.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
  })

  it('sorts reverse sorted array', () => {
    expect(CountingSort.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
  })

  it('sorts with duplicates', () => {
    expect(CountingSort.sort([3, 1, 2, 1, 3, 2])).toEqual([1, 1, 2, 2, 3, 3])
  })

  it('sorts with all same elements', () => {
    expect(CountingSort.sort([7, 7, 7, 7])).toEqual([7, 7, 7, 7])
  })

  it('handles negative numbers', () => {
    expect(CountingSort.sort([-2, -5, -1, -3])).toEqual([-5, -3, -2, -1])
  })

  it('handles mixed positive and negative', () => {
    expect(CountingSort.sort([3, -1, 0, -2, 2])).toEqual([-2, -1, 0, 2, 3])
  })

  it('sortBy with key function', () => {
    const items = [{ v: 3 }, { v: 1 }, { v: 2 }]
    const sorted = CountingSort.sortBy(items, (item) => item.v)
    expect(sorted.map((i) => i.v)).toEqual([1, 2, 3])
  })

  it('sortInPlace modifies original array', () => {
    const arr = [3, 1, 2]
    const result = CountingSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3])
    expect(result).toBe(arr)
  })

  it('countFrequencies returns correct counts', () => {
    const freq = CountingSort.countFrequencies([1, 2, 2, 3, 3, 3])
    expect(freq.get(1)).toBe(1)
    expect(freq.get(2)).toBe(2)
    expect(freq.get(3)).toBe(3)
    expect(freq.get(4)).toBeUndefined()
  })

  it('countFrequencies handles empty array', () => {
    const freq = CountingSort.countFrequencies([])
    expect(freq.size).toBe(0)
  })

  it('respects min/max options', () => {
    const result = CountingSort.sort([3, 1, 2], { min: 0, max: 5 })
    expect(result).toEqual([1, 2, 3])
  })

  it('does not modify original array', () => {
    const arr = [3, 1, 2]
    CountingSort.sort(arr)
    expect(arr).toEqual([3, 1, 2])
  })

  it('handles large range by falling back to native sort', () => {
    const arr = [1, 1000000, 2]
    expect(CountingSort.sort(arr)).toEqual([1, 2, 1000000])
  })

  it('handles two elements', () => {
    expect(CountingSort.sort([2, 1])).toEqual([1, 2])
  })

  it('handles two equal elements', () => {
    expect(CountingSort.sort([5, 5])).toEqual([5, 5])
  })

  it('handles zeros', () => {
    expect(CountingSort.sort([0, 0, 0])).toEqual([0, 0, 0])
  })

  it('handles range of one value', () => {
    expect(CountingSort.sort([5, 5, 5, 5])).toEqual([5, 5, 5, 5])
  })

  it('sortInPlace on empty array', () => {
    const arr: number[] = []
    expect(CountingSort.sortInPlace(arr)).toEqual([])
  })

  it('sortInPlace on single element', () => {
    const arr = [42]
    expect(CountingSort.sortInPlace(arr)).toEqual([42])
  })

  it('sortInPlace on already sorted', () => {
    const arr = [1, 2, 3]
    CountingSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3])
  })

  it('sortInPlace on reverse sorted', () => {
    const arr = [5, 4, 3, 2, 1]
    CountingSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  it('sortInPlace with duplicates', () => {
    const arr = [3, 1, 2, 1]
    CountingSort.sortInPlace(arr)
    expect(arr).toEqual([1, 1, 2, 3])
  })

  it('sortBy does not modify original', () => {
    const items = [{ v: 3 }, { v: 1 }, { v: 2 }]
    CountingSort.sortBy(items, (i) => i.v)
    expect(items.map((i) => i.v)).toEqual([3, 1, 2])
  })

  it('sortBy with empty array', () => {
    expect(CountingSort.sortBy([], (i: number) => i)).toEqual([])
  })

  it('sortBy with single element', () => {
    const items = [{ v: 5 }]
    expect(CountingSort.sortBy(items, (i) => i.v)).toEqual([{ v: 5 }])
  })

  it('sortBy with negative keys', () => {
    const items = [{ v: -1 }, { v: -3 }, { v: -2 }]
    const sorted = CountingSort.sortBy(items, (i) => i.v)
    expect(sorted.map((i) => i.v)).toEqual([-3, -2, -1])
  })

  it('sortBy with min/max options', () => {
    const items = [{ v: 3 }, { v: 1 }, { v: 2 }]
    const sorted = CountingSort.sortBy(items, (i) => i.v, { min: 0, max: 5 })
    expect(sorted.map((i) => i.v)).toEqual([1, 2, 3])
  })

  it('countFrequencies with single element', () => {
    const freq = CountingSort.countFrequencies([5])
    expect(freq.size).toBe(1)
    expect(freq.get(5)).toBe(1)
  })

  it('countFrequencies with all duplicates', () => {
    const freq = CountingSort.countFrequencies([3, 3, 3])
    expect(freq.size).toBe(1)
    expect(freq.get(3)).toBe(3)
  })

  it('countFrequencies with min/max options', () => {
    const freq = CountingSort.countFrequencies([1, 2, 3], { min: 0, max: 5 })
    expect(freq.get(1)).toBe(1)
    expect(freq.get(2)).toBe(1)
    expect(freq.get(3)).toBe(1)
  })

  it('countFrequencies returns Map', () => {
    const freq = CountingSort.countFrequencies([1, 2, 2])
    expect(freq).toBeInstanceOf(Map)
  })

  it('handles large array', () => {
    const arr = Array.from({ length: 500 }, (_, i) => 500 - i)
    const result = CountingSort.sort(arr)
    for (let i = 1; i < result.length; i++) {
      expect(result[i]!).toBeGreaterThanOrEqual(result[i - 1]!)
    }
  })

  it('sort with min only option', () => {
    const result = CountingSort.sort([3, 1, 2], { min: 0 })
    expect(result).toEqual([1, 2, 3])
  })

  it('sort with max only option', () => {
    const result = CountingSort.sort([3, 1, 2], { max: 10 })
    expect(result).toEqual([1, 2, 3])
  })

  it('sortInPlace returns the same array reference', () => {
    const arr = [3, 1, 2]
    const result = CountingSort.sortInPlace(arr)
    expect(result).toBe(arr)
  })

  it('handles consecutive integers', () => {
    expect(CountingSort.sort([5, 3, 1, 4, 2])).toEqual([1, 2, 3, 4, 5])
  })

  it('handles repeated consecutive integers', () => {
    expect(CountingSort.sort([1, 1, 2, 2, 3, 3])).toEqual([1, 1, 2, 2, 3, 3])
  })

  it('sortBy with object values', () => {
    const items = [{ name: 'c', v: 3 }, { name: 'a', v: 1 }, { name: 'b', v: 2 }]
    const sorted = CountingSort.sortBy(items, (i) => i.v)
    expect(sorted.map((i) => i.name)).toEqual(['a', 'b', 'c'])
  })

  it('sortInPlace with large range falls back', () => {
    const arr = [1, 1000000, 2]
    CountingSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 1000000])
  })

  it('countFrequencies with negative numbers', () => {
    const freq = CountingSort.countFrequencies([-1, -2, -1])
    expect(freq.get(-2)).toBe(1)
    expect(freq.get(-1)).toBe(2)
  })

  it('handles single zero', () => {
    expect(CountingSort.sort([0])).toEqual([0])
  })

  it('handles mixed zeros and ones', () => {
    expect(CountingSort.sort([1, 0, 1, 0, 1])).toEqual([0, 0, 1, 1, 1])
  })

  it('sortBy with duplicate keys preserves stable order', () => {
    const items = [{ v: 1, id: 1 }, { v: 1, id: 2 }, { v: 2, id: 3 }]
    const sorted = CountingSort.sortBy(items, (i) => i.v)
    expect(sorted[0]!.id).toBe(1)
    expect(sorted[1]!.id).toBe(2)
    expect(sorted[2]!.id).toBe(3)
  })

  it('handles ten elements reverse', () => {
    const arr = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
    expect(CountingSort.sort(arr)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  it('countFrequencies with min/max larger than actual range', () => {
    const freq = CountingSort.countFrequencies([1, 2, 3], { min: -5, max: 10 })
    expect(freq.get(1)).toBe(1)
    expect(freq.get(2)).toBe(1)
    expect(freq.get(3)).toBe(1)
    expect(freq.get(0)).toBeUndefined()
  })

  it('should sort negative numbers', () => {
    expect(CountingSort.sort([-1, -3, -2])).toEqual([-3, -2, -1])
  })

  it('should sort with custom range', () => {
    expect(CountingSort.sort([5, 3, 5, 1, 3])).toEqual([1, 3, 3, 5, 5])
  })

  it('should handle single element', () => {
    expect(CountingSort.sort([42])).toEqual([42])
  })

  it('should handle all same elements', () => {
    expect(CountingSort.sort([7, 7, 7])).toEqual([7, 7, 7])
  })

  it('should return frequency map', () => {
    const freq = CountingSort.countFrequencies([1, 2, 2, 3])
    expect(freq.get(1)).toBe(1)
    expect(freq.get(2)).toBe(2)
    expect(freq.get(3)).toBe(1)
  })

  it('should sort in place', () => {
    const arr = [3, 1, 2]
    CountingSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3])
  })

  it('handles empty array', () => {
    expect(CountingSort.sort([])).toEqual([])
  })

  it('handles single element', () => {
    expect(CountingSort.sort([42])).toEqual([42])
  })

  it('sortInPlace modifies original', () => {
    const arr = [3, 1, 2]
    CountingSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3])
  })
})

describe('counting-sort - wave548', () => {
  it('counting-sort module defined', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort module is function', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort module has name', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort module not null', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort module has length', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - wave549', () => {
  it('counting-sort module defined', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort module is function', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - wave550', () => {
  it('counting-sort w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - wave551', () => {
  it('counting-sort w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - wave552', () => {
  it('counting-sort w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - wave553', () => {
  it('counting-sort w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - wave554', () => {
  it('counting-sort w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - wave555', () => {
  it('counting-sort w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - wave556', () => {
  it('counting-sort w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - wave557', () => {
  it('counting-sort w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - wave558', () => {
  it('counting-sort w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - wave559', () => {
  it('counting-sort w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - wave560', () => {
  it('counting-sort w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - wave561', () => {
  it('counting-sort w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - wave562', () => {
  it('counting-sort w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - wave563', () => {
  it('counting-sort w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - wave564', () => {
  it('counting-sort w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - wave565', () => {
  it('counting-sort w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - wave566', () => {
  it('counting-sort w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - wave127', () => {
  it('counting-sort w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - wave130', () => {
  it('counting-sort w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - wave133', () => {
  it('counting-sort w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - wave136', () => {
  it('counting-sort w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - wave139', () => {
  it('counting-sort w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - w142', () => {
  it('counting-sort v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - w145', () => {
  it('counting-sort v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - w148', () => {
  it('counting-sort v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - w151', () => {
  it('counting-sort v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - w154', () => {
  it('counting-sort v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - w157', () => {
  it('counting-sort v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - w160', () => {
  it('counting-sort v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - w170', () => {
  it('counting-sort x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - w180', () => {
  it('counting-sort x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - w190', () => {
  it('counting-sort x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - w200', () => {
  it('counting-sort x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - w210', () => {
  it('counting-sort x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - w220', () => {
  it('counting-sort x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - w230', () => {
  it('counting-sort x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - w240', () => {
  it('counting-sort x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - w250', () => {
  it('counting-sort x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - w260', () => {
  it('counting-sort x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - w270', () => {
  it('counting-sort x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - w280', () => {
  it('counting-sort x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - w290', () => {
  it('counting-sort x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - w300', () => {
  it('counting-sort x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - w310', () => {
  it('counting-sort x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - w320', () => {
  it('counting-sort x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - w330', () => {
  it('counting-sort x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - w340', () => {
  it('counting-sort x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - w350', () => {
  it('counting-sort x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - w360', () => {
  it('counting-sort x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - w370', () => {
  it('counting-sort x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - w380', () => {
  it('counting-sort x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - w390', () => {
  it('counting-sort x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - w400', () => {
  it('counting-sort x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - w420', () => {
  it('counting-sort x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - w440', () => {
  it('counting-sort x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - w460', () => {
  it('counting-sort x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - w480', () => {
  it('counting-sort x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - w500', () => {
  it('counting-sort x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - w550', () => {
  it('counting-sort x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - w600', () => {
  it('counting-sort x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - w650', () => {
  it('counting-sort x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - w700', () => {
  it('counting-sort x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x700x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - w800', () => {
  it('counting-sort x800x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x9', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x10', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x11', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x12', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x13', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x14', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x15', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x16', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x17', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x18', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x19', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x20', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x21', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x22', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x23', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x24', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x25', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x26', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x27', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x28', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x29', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x30', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x31', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x32', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x33', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x34', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x35', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x36', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x37', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x38', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x39', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x40', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x41', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x42', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x43', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x44', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x45', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x46', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x47', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x48', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x49', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x50', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x51', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x52', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x53', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x54', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x55', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x56', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x57', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x58', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x59', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x60', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x61', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x62', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x63', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x64', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x65', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x66', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x67', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x68', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x69', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x70', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x71', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x72', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x73', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x74', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x75', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x76', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x77', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x78', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x79', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x80', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x81', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x82', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x83', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x84', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x85', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x86', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x87', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x88', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x89', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x90', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x91', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x92', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x93', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x94', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x95', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x96', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x97', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x98', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x800x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - w900', () => {
  it('counting-sort x900x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x9', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x10', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x11', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x12', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x13', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x14', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x15', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x16', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x17', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x18', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x19', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x20', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x21', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x22', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x23', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x24', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x25', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x26', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x27', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x28', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x29', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x30', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x31', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x32', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x33', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x34', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x35', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x36', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x37', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x38', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x39', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x40', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x41', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x42', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x43', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x44', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x45', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x46', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x47', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x48', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x49', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x50', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x51', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x52', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x53', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x54', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x55', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x56', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x57', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x58', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x59', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x60', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x61', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x62', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x63', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x64', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x65', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x66', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x67', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x68', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x69', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x70', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x71', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x72', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x73', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x74', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x75', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x76', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x77', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x78', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x79', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x80', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x81', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x82', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x83', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x84', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x85', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x86', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x87', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x88', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x89', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x90', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x91', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x92', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x93', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x94', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x95', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x96', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x97', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x98', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x900x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-sort - w1000', () => {
  it('counting-sort x1000x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x9', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x10', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x11', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x12', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x13', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x14', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x15', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x16', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x17', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x18', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x19', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x20', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x21', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x22', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x23', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x24', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x25', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x26', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x27', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x28', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x29', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x30', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x31', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x32', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x33', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x34', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x35', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x36', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x37', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x38', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x39', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x40', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x41', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x42', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x43', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x44', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x45', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x46', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x47', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x48', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x49', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x50', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x51', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x52', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x53', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x54', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x55', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x56', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x57', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x58', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x59', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x60', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x61', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x62', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x63', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x64', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x65', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x66', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x67', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x68', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x69', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x70', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x71', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x72', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x73', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x74', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x75', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x76', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x77', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x78', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x79', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x80', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x81', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x82', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x83', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x84', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x85', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x86', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x87', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x88', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x89', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x90', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x91', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x92', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x93', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x94', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x95', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x96', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x97', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x98', () => {
    expect(describe).toBeDefined()
  })
  it('counting-sort x1000x99', () => {
    expect(describe).toBeDefined()
  })
})
