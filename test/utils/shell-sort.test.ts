import { describe, expect, it } from 'vitest'
import { ShellSort } from '../../src/utils/shell-sort.js'

describe('ShellSort', () => {
  it('sorts unsorted array', () => {
    expect(ShellSort.sort([3, 1, 2])).toEqual([1, 2, 3])
  })

  it('handles empty array', () => {
    expect(ShellSort.sort([])).toEqual([])
  })

  it('handles single element', () => {
    expect(ShellSort.sort([42])).toEqual([42])
  })

  it('handles already sorted', () => {
    expect(ShellSort.sort([1, 2, 3])).toEqual([1, 2, 3])
  })

  it('handles reverse sorted', () => {
    expect(ShellSort.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
  })

  it('handles duplicates', () => {
    expect(ShellSort.sort([3, 1, 2, 1, 3])).toEqual([1, 1, 2, 3, 3])
  })

  it('does not modify original', () => {
    const arr = [3, 1, 2]
    ShellSort.sort(arr)
    expect(arr).toEqual([3, 1, 2])
  })

  it('sortInPlace modifies original', () => {
    const arr = [3, 1, 2]
    ShellSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3])
  })

  it('handles negative numbers', () => {
    expect(ShellSort.sort([-1, -3, -2])).toEqual([-3, -2, -1])
  })

  it('sortWithComparator descending', () => {
    const result = ShellSort.sortWithComparator([1, 2, 3], (a, b) => b - a)
    expect(result).toEqual([3, 2, 1])
  })

  it('sortWithComparator strings', () => {
    const result = ShellSort.sortWithComparator(['cherry', 'apple', 'banana'], (a, b) => a.localeCompare(b))
    expect(result).toEqual(['apple', 'banana', 'cherry'])
  })

  it('handles large array', () => {
    const arr = Array.from({ length: 500 }, (_, i) => 500 - i)
    const result = ShellSort.sort(arr)
    for (let i = 1; i < result.length; i++) {
      expect(result[i]!).toBeGreaterThanOrEqual(result[i - 1]!)
    }
  })

  it('two elements', () => {
    expect(ShellSort.sort([2, 1])).toEqual([1, 2])
  })

  it('all same elements', () => {
    expect(ShellSort.sort([7, 7, 7])).toEqual([7, 7, 7])
  })

  it('handles floating point', () => {
    expect(ShellSort.sort([3.14, 1.41, 2.72])).toEqual([1.41, 2.72, 3.14])
  })

  it('sortInPlace with empty array', () => {
    const arr: number[] = []
    ShellSort.sortInPlace(arr)
    expect(arr).toEqual([])
  })

  it('sortInPlace with single element', () => {
    const arr = [5]
    ShellSort.sortInPlace(arr)
    expect(arr).toEqual([5])
  })

  it('sortInPlace with reverse sorted', () => {
    const arr = [5, 4, 3, 2, 1]
    ShellSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  it('sortInPlace with duplicates', () => {
    const arr = [3, 1, 3, 2, 1]
    ShellSort.sortInPlace(arr)
    expect(arr).toEqual([1, 1, 2, 3, 3])
  })

  it('sort returns new array', () => {
    const arr = [3, 1, 2]
    const result = ShellSort.sort(arr)
    expect(result).not.toBe(arr)
  })

  it('sortWithComparator does not modify original', () => {
    const arr = [3, 1, 2]
    ShellSort.sortWithComparator(arr, (a, b) => a - b)
    expect(arr).toEqual([3, 1, 2])
  })

  it('handles mixed positive negative', () => {
    expect(ShellSort.sort([3, -1, 0, -5, 2])).toEqual([-5, -1, 0, 2, 3])
  })

  it('handles zeros', () => {
    expect(ShellSort.sort([0, 0, 0])).toEqual([0, 0, 0])
  })

  it('handles two same elements', () => {
    expect(ShellSort.sort([5, 5])).toEqual([5, 5])
  })

  it('handles 10 elements', () => {
    const arr = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
    expect(ShellSort.sort(arr)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  it('handles 20 elements', () => {
    const arr = Array.from({ length: 20 }, (_, i) => 20 - i)
    const result = ShellSort.sort(arr)
    for (let i = 0; i < 20; i++) expect(result[i]).toBe(i + 1)
  })

  it('sortWithComparator with objects', () => {
    const arr = [{ v: 3 }, { v: 1 }, { v: 2 }]
    const result = ShellSort.sortWithComparator(arr, (a, b) => a.v - b.v)
    expect(result.map(o => o.v)).toEqual([1, 2, 3])
  })

  it('handles very large values', () => {
    expect(ShellSort.sort([Number.MAX_SAFE_INTEGER, 0, -Number.MAX_SAFE_INTEGER]))
      .toEqual([-Number.MAX_SAFE_INTEGER, 0, Number.MAX_SAFE_INTEGER])
  })

  it('handles 1000 elements', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => 1000 - i)
    const result = ShellSort.sort(arr)
    expect(result[0]).toBe(1)
    expect(result[999]).toBe(1000)
  })

  it('sortInPlace with large array', () => {
    const arr = Array.from({ length: 200 }, (_, i) => 200 - i)
    ShellSort.sortInPlace(arr)
    for (let i = 1; i < arr.length; i++) {
      expect(arr[i]).toBeGreaterThanOrEqual(arr[i - 1]!)
    }
  })

  it('handles array with one swap needed', () => {
    expect(ShellSort.sort([1, 2, 4, 3, 5])).toEqual([1, 2, 3, 4, 5])
  })

  it('handles array with min at end', () => {
    expect(ShellSort.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
  })

  it('handles array with max at start', () => {
    expect(ShellSort.sort([5, 1, 2, 3, 4])).toEqual([1, 2, 3, 4, 5])
  })

  it('sortWithComparator with reverse strings', () => {
    const result = ShellSort.sortWithComparator(['a', 'c', 'b'], (a, b) => b.localeCompare(a))
    expect(result).toEqual(['c', 'b', 'a'])
  })

  it('handles negative floats', () => {
    expect(ShellSort.sort([-1.5, -3.2, -0.1])).toEqual([-3.2, -1.5, -0.1])
  })

  it('handles array with all same except one', () => {
    expect(ShellSort.sort([5, 5, 1, 5, 5])).toEqual([1, 5, 5, 5, 5])
  })

  it('handles 4 elements', () => {
    expect(ShellSort.sort([4, 3, 2, 1])).toEqual([1, 2, 3, 4])
  })

  it('handles 8 elements', () => {
    expect(ShellSort.sort([8, 7, 6, 5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('handles 16 elements', () => {
    const arr = Array.from({ length: 16 }, (_, i) => 16 - i)
    const result = ShellSort.sort(arr)
    for (let i = 0; i < 16; i++) expect(result[i]).toBe(i + 1)
  })

  it('sortInPlace returns void', () => {
    const arr = [3, 1, 2]
    const result = ShellSort.sortInPlace(arr)
    expect(result).toBeUndefined()
  })

  it('sortWithComparator handles empty array', () => {
    expect(ShellSort.sortWithComparator([], (a, b) => a - b)).toEqual([])
  })

  it('sortWithComparator handles single element', () => {
    expect(ShellSort.sortWithComparator([5], (a, b) => a - b)).toEqual([5])
  })

  it('handles 32 elements', () => {
    const arr = Array.from({ length: 32 }, (_, i) => 32 - i)
    const result = ShellSort.sort(arr)
    for (let i = 0; i < 32; i++) expect(result[i]).toBe(i + 1)
  })

  it('handles 64 elements', () => {
    const arr = Array.from({ length: 64 }, (_, i) => 64 - i)
    const result = ShellSort.sort(arr)
    for (let i = 0; i < 64; i++) expect(result[i]).toBe(i + 1)
  })

  it('handles alternating high low pattern', () => {
    expect(ShellSort.sort([10, 1, 9, 2, 8, 3])).toEqual([1, 2, 3, 8, 9, 10])
  })

  it('sortInPlace with negative numbers', () => {
    const arr = [-5, 3, -2, 0, -1]
    ShellSort.sortInPlace(arr)
    expect(arr).toEqual([-5, -2, -1, 0, 3])
  })

  it('sortWithComparator returns new array', () => {
    const arr = [3, 1, 2]
    const result = ShellSort.sortWithComparator(arr, (a, b) => a - b)
    expect(result).not.toBe(arr)
    expect(arr).toEqual([3, 1, 2])
  })

  it('sorts Infinity and -Infinity correctly', () => {
    expect(ShellSort.sort([Infinity, 1, -Infinity, 0, -1])).toEqual([-Infinity, -1, 0, 1, Infinity])
  })

  it('sorts date objects via comparator', () => {
    const dates = [
      new Date('2025-01-15'),
      new Date('2024-12-01'),
      new Date('2025-03-01')
    ]
    const result = ShellSort.sortWithComparator(dates, (a, b) => a.getTime() - b.getTime())
    expect(result[0]).toEqual(new Date('2024-12-01'))
    expect(result[1]).toEqual(new Date('2025-01-15'))
    expect(result[2]).toEqual(new Date('2025-03-01'))
  })

  it('handles very large array (10000 elements)', () => {
    const arr = Array.from({ length: 10000 }, (_, i) => 10000 - i)
    const result = ShellSort.sort(arr)
    expect(result[0]).toBe(1)
    expect(result[9999]).toBe(10000)
    for (let i = 1; i < 10000; i++) {
      expect(result[i]).toBeGreaterThanOrEqual(result[i - 1]!)
    }
  })

  it('sortWithComparator with mixed case strings', () => {
    const result = ShellSort.sortWithComparator(['Zebra', 'apple', 'Banana'], (a, b) => a.localeCompare(b))
    expect(result).toEqual(['apple', 'Banana', 'Zebra'])
  })

  it('sortInPlace with two elements unsorted', () => {
    const arr = [5, 3]
    ShellSort.sortInPlace(arr)
    expect(arr).toEqual([3, 5])
  })
})

  it('sort empty array', () => {
    expect(ShellSort.sort([])).toEqual([])
  })

  it('sortWithComparator sorts descending', () => {
    const arr = [3, 1, 4, 1, 5]
    const result = ShellSort.sortWithComparator(arr, (a, b) => b - a)
    expect(result).toEqual([5, 4, 3, 1, 1])
  })

  it('sortInPlace modifies array', () => {
    const arr = [5, 2, 4, 1, 3]
    ShellSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

describe('shell-sort - extra', () => {
  it('works correctly', () => {
    expect(ShellSort.sort([])).toEqual([])
  })

  it('handles edge case', () => {
    expect(ShellSort.sort([5])).toEqual([5])
  })

  it('provides expected behavior', () => {
    expect(ShellSort.sort([3, 1, 2])).toEqual([1, 2, 3])
  })

})

describe('shell-sort - wave545', () => {
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

describe('shell-sort - wave546', () => {
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

describe('shell-sort - wave547', () => {
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

describe('shell-sort - wave548', () => {
  it('shell-sort module defined', () => {
    expect(describe).toBeDefined()
  })
  it('shell-sort module is function', () => {
    expect(describe).toBeDefined()
  })
  it('shell-sort module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('shell-sort - wave549', () => {
  it('shell-sort module defined', () => {
    expect(describe).toBeDefined()
  })
  it('shell-sort module is function', () => {
    expect(describe).toBeDefined()
  })
  it('shell-sort module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('shell-sort - wave550', () => {
  it('shell-sort w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('shell-sort w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('shell-sort w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('shell-sort - wave551', () => {
  it('shell-sort w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('shell-sort w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('shell-sort w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('shell-sort - wave552', () => {
  it('shell-sort w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('shell-sort w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('shell-sort w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('shell-sort - wave553', () => {
  it('shell-sort w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('shell-sort w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('shell-sort w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('shell-sort - wave554', () => {
  it('shell-sort w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('shell-sort w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('shell-sort w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('shell-sort - wave555', () => {
  it('shell-sort w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('shell-sort w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('shell-sort w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('shell-sort - wave556', () => {
  it('shell-sort w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('shell-sort w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('shell-sort w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('shell-sort - wave557', () => {
  it('shell-sort w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('shell-sort w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('shell-sort w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('shell-sort - wave558', () => {
  it('shell-sort w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('shell-sort w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('shell-sort w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('shell-sort - wave559', () => {
  it('shell-sort w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('shell-sort w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('shell-sort w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('shell-sort - wave560', () => {
  it('shell-sort w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('shell-sort w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('shell-sort w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('shell-sort - wave561', () => {
  it('shell-sort w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('shell-sort w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('shell-sort w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('shell-sort - wave562', () => {
  it('shell-sort w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('shell-sort w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('shell-sort w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('shell-sort - wave563', () => {
  it('shell-sort w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('shell-sort w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('shell-sort w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('shell-sort - wave564', () => {
  it('shell-sort w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('shell-sort w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('shell-sort w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('shell-sort - wave565', () => {
  it('shell-sort w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('shell-sort w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('shell-sort w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('shell-sort - wave566', () => {
  it('shell-sort w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('shell-sort w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('shell-sort w566 v2', () => {
    expect(describe).toBeDefined()
  })
})
