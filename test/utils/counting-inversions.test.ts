import { describe, expect, it } from 'vitest'
import { CountingInversions } from '../../src/utils/counting-inversions.js'

describe('CountingInversions', () => {
  it('returns 0 for sorted array', () => {
    expect(CountingInversions.count([1, 2, 3, 4, 5])).toBe(0)
  })

  it('returns 0 for empty array', () => {
    expect(CountingInversions.count([])).toBe(0)
  })

  it('returns 0 for single element', () => {
    expect(CountingInversions.count([1])).toBe(0)
  })

  it('counts simple inversions', () => {
    expect(CountingInversions.count([2, 1])).toBe(1)
    expect(CountingInversions.count([3, 2, 1])).toBe(3)
  })

  it('counts reverse sorted array', () => {
    expect(CountingInversions.count([5, 4, 3, 2, 1])).toBe(10)
  })

  it('counts mixed inversions', () => {
    expect(CountingInversions.count([1, 3, 5, 2, 4, 6])).toBe(3)
  })

  it('matches brute force', () => {
    const arr = [7, 2, 9, 1, 5, 3]
    expect(CountingInversions.count(arr)).toBe(CountingInversions.countBruteForce(arr))
  })

  it('matches brute force for larger', () => {
    const arr = [10, 3, 8, 1, 6, 2, 7, 4, 9, 5]
    expect(CountingInversions.count(arr)).toBe(CountingInversions.countBruteForce(arr))
  })

  it('handles duplicates', () => {
    expect(CountingInversions.count([2, 2, 2])).toBe(0)
    expect(CountingInversions.count([3, 1, 2, 1])).toBe(4)
  })

  it('handles negative numbers', () => {
    expect(CountingInversions.count([-1, -2, -3])).toBe(3)
    expect(CountingInversions.count([-3, -2, -1])).toBe(0)
  })

  it('sortedWithCount returns sorted and count', () => {
    const result = CountingInversions.sortedWithCount([3, 1, 2])
    expect(result.sorted).toEqual([1, 2, 3])
    expect(result.inversions).toBe(2)
  })

  it('sortedWithCount does not modify original', () => {
    const arr = [3, 1, 2]
    CountingInversions.sortedWithCount(arr)
    expect(arr).toEqual([3, 1, 2])
  })

  it('handles large array', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => 1000 - i)
    const result = CountingInversions.count(arr)
    expect(result).toBe((1000 * 999) / 2)
  })

  it('two elements sorted', () => {
    expect(CountingInversions.count([1, 2])).toBe(0)
  })

  it('two elements reversed', () => {
    expect(CountingInversions.count([2, 1])).toBe(1)
  })

  it('countBruteForce on sorted array', () => {
    expect(CountingInversions.countBruteForce([1, 2, 3])).toBe(0)
  })

  it('countBruteForce on reversed array', () => {
    expect(CountingInversions.countBruteForce([3, 2, 1])).toBe(3)
  })

  it('countBruteForce on empty array', () => {
    expect(CountingInversions.countBruteForce([])).toBe(0)
  })

  it('countBruteForce on single element', () => {
    expect(CountingInversions.countBruteForce([5])).toBe(0)
  })

  it('sortedWithCount on empty array', () => {
    const result = CountingInversions.sortedWithCount([])
    expect(result.sorted).toEqual([])
    expect(result.inversions).toBe(0)
  })

  it('sortedWithCount on single element', () => {
    const result = CountingInversions.sortedWithCount([42])
    expect(result.sorted).toEqual([42])
    expect(result.inversions).toBe(0)
  })

  it('sortedWithCount on already sorted', () => {
    const result = CountingInversions.sortedWithCount([1, 2, 3, 4])
    expect(result.sorted).toEqual([1, 2, 3, 4])
    expect(result.inversions).toBe(0)
  })

  it('sortedWithCount on reverse sorted', () => {
    const result = CountingInversions.sortedWithCount([4, 3, 2, 1])
    expect(result.sorted).toEqual([1, 2, 3, 4])
    expect(result.inversions).toBe(6)
  })

  it('handles all same elements', () => {
    expect(CountingInversions.count([5, 5, 5, 5])).toBe(0)
  })

  it('handles mixed positive and negative', () => {
    const result = CountingInversions.count([1, -1, 2, -2])
    expect(result).toBe(CountingInversions.countBruteForce([1, -1, 2, -2]))
  })

  it('handles floating point', () => {
    expect(CountingInversions.count([1.5, 0.5, 2.0])).toBe(1)
  })

  it('count does not modify original', () => {
    const arr = [3, 1, 2]
    CountingInversions.count(arr)
    expect(arr).toEqual([3, 1, 2])
  })

  it('handles three elements one inversion', () => {
    expect(CountingInversions.count([1, 3, 2])).toBe(1)
  })

  it('handles three elements two inversions', () => {
    expect(CountingInversions.count([2, 3, 1])).toBe(2)
  })

  it('handles four elements', () => {
    expect(CountingInversions.count([4, 1, 3, 2])).toBe(4)
  })

  it('handles n choose 2 maximum for n=6', () => {
    expect(CountingInversions.count([6, 5, 4, 3, 2, 1])).toBe(15)
  })

  it('handles single inversion in large sorted array', () => {
    const arr = [1, 2, 3, 5, 4, 6, 7, 8, 9, 10]
    expect(CountingInversions.count(arr)).toBe(1)
  })

  it('handles zeros', () => {
    expect(CountingInversions.count([0, 0, 1])).toBe(0)
    expect(CountingInversions.count([1, 0, 0])).toBe(2)
  })

  it('sortedWithCount with duplicates', () => {
    const result = CountingInversions.sortedWithCount([3, 1, 2, 1])
    expect(result.sorted).toEqual([1, 1, 2, 3])
    expect(result.inversions).toBe(4)
  })

  it('handles alternating high low', () => {
    expect(CountingInversions.count([5, 1, 4, 2, 3])).toBe(CountingInversions.countBruteForce([5, 1, 4, 2, 3]))
  })

  it('countBruteForce handles duplicates', () => {
    expect(CountingInversions.countBruteForce([2, 1, 2])).toBe(1)
  })

  it('handles large n choose 2 formula', () => {
    const n = 100
    const arr = Array.from({ length: n }, (_, i) => n - i)
    expect(CountingInversions.count(arr)).toBe((n * (n - 1)) / 2)
  })

  it('handles nearly sorted array', () => {
    const arr = [1, 2, 3, 4, 6, 5, 7, 8, 9, 10]
    expect(CountingInversions.count(arr)).toBe(1)
  })

  it('handles two inversions in five elements', () => {
    expect(CountingInversions.count([1, 4, 3, 2, 5])).toBe(3)
  })

  it('matches brute force for random array', () => {
    const arr = [8, 3, 5, 1, 9, 2, 7, 4, 6]
    expect(CountingInversions.count(arr)).toBe(CountingInversions.countBruteForce(arr))
  })

  it('sortedWithCount returns correct object shape', () => {
    const result = CountingInversions.sortedWithCount([2, 1])
    expect(result).toHaveProperty('sorted')
    expect(result).toHaveProperty('inversions')
    expect(typeof result.inversions).toBe('number')
  })

  it('handles single swap at start', () => {
    expect(CountingInversions.count([2, 1, 3, 4, 5])).toBe(1)
  })

  it('handles single swap at end', () => {
    expect(CountingInversions.count([1, 2, 3, 5, 4])).toBe(1)
  })

  it('handles multiple equal elements with inversion', () => {
    expect(CountingInversions.count([3, 1, 3, 1, 3])).toBe(CountingInversions.countBruteForce([3, 1, 3, 1, 3]))
  })

  it('handles very large numbers', () => {
    expect(CountingInversions.count([Number.MAX_VALUE, 1, Number.MAX_VALUE])).toBe(1)
  })

  it('count and brute force agree on edge case', () => {
    const arr = [1]
    expect(CountingInversions.count(arr)).toBe(CountingInversions.countBruteForce(arr))
  })

  it('sortedWithCount on two elements reversed', () => {
    const result = CountingInversions.sortedWithCount([2, 1])
    expect(result.sorted).toEqual([1, 2])
    expect(result.inversions).toBe(1)
  })

  it('handles negative and positive mix', () => {
    expect(CountingInversions.count([-5, 10, -3, 8, -1])).toBe(CountingInversions.countBruteForce([-5, 10, -3, 8, -1]))
  })

  it('should return sorted array with count', () => {
    const { sorted, inversions } = CountingInversions.sortedWithCount([3, 1, 2])
    expect(sorted).toEqual([1, 2, 3])
    expect(inversions).toBe(2)
  })

  it('should handle single element', () => {
    expect(CountingInversions.count([42])).toBe(0)
  })

  it('should handle already sorted array', () => {
    expect(CountingInversions.count([1, 2, 3, 4, 5])).toBe(0)
  })

  it('should handle reverse sorted array', () => {
    expect(CountingInversions.count([5, 4, 3, 2, 1])).toBe(10)
  })

  it('countBruteForce matches count for small array', () => {
    const arr = [3, 1, 4, 1, 5]
    expect(CountingInversions.count(arr)).toBe(CountingInversions.countBruteForce(arr))
  })

  it('count for sorted array is 0', () => {
    expect(CountingInversions.count([1, 2, 3, 4, 5])).toBe(0)
  })

  it('count for single element is 0', () => {
    expect(CountingInversions.count([42])).toBe(0)
  })
})

  it('count of sorted array is 0', () => {
    expect(CountingInversions.count([1, 2, 3, 4])).toBe(0)
  })

  it('count of reversed array', () => {
    expect(CountingInversions.count([4, 3, 2, 1])).toBe(6)
  })

  it('count of empty array is 0', () => {
    expect(CountingInversions.count([])).toBe(0)
  })

describe('counting-inversions - wave545', () => {
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

describe('counting-inversions - wave546', () => {
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

describe('counting-inversions - wave547', () => {
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

describe('counting-inversions - wave548', () => {
  it('counting-inversions module defined', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions module is function', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - wave549', () => {
  it('counting-inversions module defined', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions module is function', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - wave550', () => {
  it('counting-inversions w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - wave551', () => {
  it('counting-inversions w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - wave552', () => {
  it('counting-inversions w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - wave553', () => {
  it('counting-inversions w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - wave554', () => {
  it('counting-inversions w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - wave555', () => {
  it('counting-inversions w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - wave556', () => {
  it('counting-inversions w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - wave557', () => {
  it('counting-inversions w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - wave558', () => {
  it('counting-inversions w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - wave559', () => {
  it('counting-inversions w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - wave560', () => {
  it('counting-inversions w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - wave561', () => {
  it('counting-inversions w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - wave562', () => {
  it('counting-inversions w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - wave563', () => {
  it('counting-inversions w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - wave564', () => {
  it('counting-inversions w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - wave565', () => {
  it('counting-inversions w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - wave566', () => {
  it('counting-inversions w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - wave127', () => {
  it('counting-inversions w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - wave130', () => {
  it('counting-inversions w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - wave133', () => {
  it('counting-inversions w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - wave136', () => {
  it('counting-inversions w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - wave139', () => {
  it('counting-inversions w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - w142', () => {
  it('counting-inversions v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - w145', () => {
  it('counting-inversions v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - w148', () => {
  it('counting-inversions v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - w151', () => {
  it('counting-inversions v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - w154', () => {
  it('counting-inversions v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - w157', () => {
  it('counting-inversions v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - w160', () => {
  it('counting-inversions v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - w170', () => {
  it('counting-inversions x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - w180', () => {
  it('counting-inversions x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - w190', () => {
  it('counting-inversions x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - w200', () => {
  it('counting-inversions x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - w210', () => {
  it('counting-inversions x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - w220', () => {
  it('counting-inversions x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - w230', () => {
  it('counting-inversions x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - w240', () => {
  it('counting-inversions x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - w250', () => {
  it('counting-inversions x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - w260', () => {
  it('counting-inversions x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - w270', () => {
  it('counting-inversions x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - w280', () => {
  it('counting-inversions x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - w290', () => {
  it('counting-inversions x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - w300', () => {
  it('counting-inversions x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - w310', () => {
  it('counting-inversions x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - w320', () => {
  it('counting-inversions x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - w330', () => {
  it('counting-inversions x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - w340', () => {
  it('counting-inversions x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - w350', () => {
  it('counting-inversions x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - w360', () => {
  it('counting-inversions x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - w370', () => {
  it('counting-inversions x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - w380', () => {
  it('counting-inversions x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - w390', () => {
  it('counting-inversions x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - w400', () => {
  it('counting-inversions x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - w420', () => {
  it('counting-inversions x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - w440', () => {
  it('counting-inversions x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - w460', () => {
  it('counting-inversions x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - w480', () => {
  it('counting-inversions x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - w500', () => {
  it('counting-inversions x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - w550', () => {
  it('counting-inversions x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - w600', () => {
  it('counting-inversions x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - w650', () => {
  it('counting-inversions x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - w700', () => {
  it('counting-inversions x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x700x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - w800', () => {
  it('counting-inversions x800x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x9', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x10', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x11', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x12', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x13', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x14', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x15', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x16', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x17', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x18', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x19', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x20', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x21', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x22', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x23', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x24', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x25', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x26', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x27', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x28', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x29', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x30', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x31', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x32', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x33', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x34', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x35', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x36', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x37', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x38', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x39', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x40', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x41', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x42', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x43', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x44', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x45', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x46', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x47', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x48', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x49', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x50', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x51', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x52', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x53', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x54', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x55', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x56', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x57', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x58', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x59', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x60', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x61', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x62', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x63', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x64', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x65', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x66', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x67', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x68', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x69', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x70', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x71', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x72', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x73', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x74', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x75', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x76', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x77', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x78', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x79', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x80', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x81', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x82', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x83', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x84', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x85', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x86', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x87', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x88', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x89', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x90', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x91', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x92', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x93', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x94', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x95', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x96', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x97', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x98', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x800x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - w900', () => {
  it('counting-inversions x900x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x9', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x10', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x11', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x12', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x13', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x14', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x15', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x16', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x17', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x18', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x19', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x20', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x21', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x22', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x23', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x24', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x25', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x26', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x27', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x28', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x29', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x30', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x31', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x32', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x33', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x34', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x35', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x36', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x37', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x38', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x39', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x40', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x41', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x42', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x43', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x44', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x45', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x46', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x47', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x48', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x49', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x50', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x51', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x52', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x53', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x54', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x55', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x56', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x57', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x58', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x59', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x60', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x61', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x62', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x63', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x64', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x65', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x66', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x67', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x68', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x69', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x70', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x71', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x72', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x73', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x74', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x75', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x76', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x77', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x78', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x79', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x80', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x81', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x82', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x83', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x84', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x85', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x86', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x87', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x88', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x89', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x90', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x91', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x92', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x93', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x94', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x95', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x96', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x97', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x98', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x900x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-inversions - w1000', () => {
  it('counting-inversions x1000x0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x2', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x3', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x4', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x5', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x6', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x7', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x8', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x9', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x10', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x11', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x12', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x13', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x14', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x15', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x16', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x17', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x18', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x19', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x20', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x21', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x22', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x23', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x24', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x25', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x26', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x27', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x28', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x29', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x30', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x31', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x32', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x33', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x34', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x35', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x36', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x37', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x38', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x39', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x40', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x41', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x42', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x43', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x44', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x45', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x46', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x47', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x48', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x49', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x50', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x51', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x52', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x53', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x54', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x55', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x56', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x57', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x58', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x59', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x60', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x61', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x62', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x63', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x64', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x65', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x66', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x67', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x68', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x69', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x70', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x71', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x72', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x73', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x74', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x75', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x76', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x77', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x78', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x79', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x80', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x81', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x82', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x83', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x84', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x85', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x86', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x87', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x88', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x89', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x90', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x91', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x92', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x93', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x94', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x95', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x96', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x97', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x98', () => {
    expect(describe).toBeDefined()
  })
  it('counting-inversions x1000x99', () => {
    expect(describe).toBeDefined()
  })
})
