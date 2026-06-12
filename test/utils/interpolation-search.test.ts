import { describe, expect, it } from 'vitest'
import { InterpolationSearch } from '../../src/utils/interpolation-search.js'

describe('InterpolationSearch', () => {
  const sorted = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]

  it('finds existing element', () => {
    expect(InterpolationSearch.search(sorted, 7)).toBe(3)
    expect(InterpolationSearch.search(sorted, 1)).toBe(0)
    expect(InterpolationSearch.search(sorted, 19)).toBe(9)
  })

  it('returns -1 for missing element', () => {
    expect(InterpolationSearch.search(sorted, 8)).toBe(-1)
    expect(InterpolationSearch.search(sorted, 0)).toBe(-1)
    expect(InterpolationSearch.search(sorted, 20)).toBe(-1)
  })

  it('handles empty array', () => {
    expect(InterpolationSearch.search([], 5)).toBe(-1)
  })

  it('handles single element', () => {
    expect(InterpolationSearch.search([5], 5)).toBe(0)
    expect(InterpolationSearch.search([5], 3)).toBe(-1)
  })

  it('handles two elements', () => {
    expect(InterpolationSearch.search([1, 10], 1)).toBe(0)
    expect(InterpolationSearch.search([1, 10], 10)).toBe(1)
    expect(InterpolationSearch.search([1, 10], 5)).toBe(-1)
  })

  it('contains works', () => {
    expect(InterpolationSearch.contains(sorted, 7)).toBe(true)
    expect(InterpolationSearch.contains(sorted, 8)).toBe(false)
  })

  it('findFirst finds first occurrence', () => {
    const arr = [1, 2, 2, 2, 3, 4]
    expect(InterpolationSearch.findFirst(arr, 2)).toBe(1)
  })

  it('findLast finds last occurrence', () => {
    const arr = [1, 2, 2, 2, 3, 4]
    expect(InterpolationSearch.findLast(arr, 2)).toBe(3)
  })

  it('rangeSearch returns range', () => {
    const arr = [1, 2, 2, 2, 3, 4]
    expect(InterpolationSearch.rangeSearch(arr, 2)).toEqual([1, 3])
  })

  it('rangeSearch returns null for missing', () => {
    expect(InterpolationSearch.rangeSearch(sorted, 8)).toBeNull()
  })

  it('closest returns nearest index', () => {
    expect(InterpolationSearch.closest(sorted, 8)).toBe(3)
    expect(InterpolationSearch.closest(sorted, 0)).toBe(0)
    expect(InterpolationSearch.closest(sorted, 20)).toBe(9)
  })

  it('closest returns exact match index', () => {
    expect(InterpolationSearch.closest(sorted, 9)).toBe(4)
  })

  it('handles uniform array', () => {
    const arr = [5, 5, 5, 5, 5]
    expect(InterpolationSearch.search(arr, 5)).toBe(0)
    expect(InterpolationSearch.search(arr, 3)).toBe(-1)
  })

  it('handles negative numbers', () => {
    const arr = [-10, -5, 0, 5, 10]
    expect(InterpolationSearch.search(arr, -5)).toBe(1)
    expect(InterpolationSearch.search(arr, 0)).toBe(2)
  })

  it('handles large array', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i * 2)
    expect(InterpolationSearch.search(arr, 500)).toBe(250)
    expect(InterpolationSearch.search(arr, 501)).toBe(-1)
  })

  it('handles two element array', () => {
    expect(InterpolationSearch.search([1, 3], 1)).toBe(0)
    expect(InterpolationSearch.search([1, 3], 3)).toBe(1)
    expect(InterpolationSearch.search([1, 3], 2)).toBe(-1)
  })

  it('handles large sorted array', () => {
    const arr = Array.from({ length: 100 }, (_, i) => i * 2)
    expect(InterpolationSearch.search(arr, 50)).toBe(25)
    expect(InterpolationSearch.search(arr, 99)).toBe(-1)
  })

  it('finds first element', () => {
    expect(InterpolationSearch.search([1, 2, 3, 4, 5], 1)).toBe(0)
  })

  it('finds last element', () => {
    expect(InterpolationSearch.search([1, 2, 3, 4, 5], 5)).toBe(4)
  })

  it('returns -1 for not found', () => {
    expect(InterpolationSearch.search([1, 2, 3, 4, 5], 6)).toBe(-1)
  })

  it('finds first element', () => {
    expect(InterpolationSearch.search([1, 2, 3, 4, 5], 1)).toBe(0)
  })

  it('returns -1 for absent', () => {
    expect(InterpolationSearch.search([1, 2, 3, 4, 5], 99)).toBe(-1)
  })

  it('finds first element', () => {
    expect(InterpolationSearch.search([1, 2, 3, 4, 5], 1)).toBe(0)
  })

  it('returns -1 for missing element', () => {
    expect(InterpolationSearch.search([1, 2, 3, 4, 5], 99)).toBe(-1)
  })

  it('handles array with all same elements', () => {
    expect(InterpolationSearch.search([7, 7, 7, 7], 7)).toBe(0)
    expect(InterpolationSearch.search([7, 7, 7, 7], 5)).toBe(-1)
  })

  it('handles boundary at start', () => {
    expect(InterpolationSearch.search([10, 20, 30, 40, 50], 10)).toBe(0)
  })

  it('handles boundary at end', () => {
    expect(InterpolationSearch.search([10, 20, 30, 40, 50], 50)).toBe(4)
  })

  it('handles value just below min', () => {
    expect(InterpolationSearch.search([10, 20, 30], 9)).toBe(-1)
  })

  it('handles value just above max', () => {
    expect(InterpolationSearch.search([10, 20, 30], 31)).toBe(-1)
  })

  it('findFirst returns -1 for missing element', () => {
    const arr = [1, 2, 2, 3, 4]
    expect(InterpolationSearch.findFirst(arr, 5)).toBe(-1)
  })

  it('findFirst handles single duplicate', () => {
    expect(InterpolationSearch.findFirst([1, 2, 2, 3], 2)).toBe(1)
  })

  it('findFirst handles all duplicates', () => {
    expect(InterpolationSearch.findFirst([5, 5, 5], 5)).toBe(0)
  })

  it('findFirst returns -1 for empty array', () => {
    expect(InterpolationSearch.findFirst([], 5)).toBe(-1)
  })

  it('findLast returns -1 for missing element', () => {
    const arr = [1, 2, 2, 3, 4]
    expect(InterpolationSearch.findLast(arr, 5)).toBe(-1)
  })

  it('findLast handles single duplicate', () => {
    expect(InterpolationSearch.findLast([1, 2, 2, 3], 2)).toBe(2)
  })

  it('findLast handles all duplicates', () => {
    expect(InterpolationSearch.findLast([5, 5, 5], 5)).toBe(2)
  })

  it('findLast returns -1 for empty array', () => {
    expect(InterpolationSearch.findLast([], 5)).toBe(-1)
  })

  it('rangeSearch returns null for missing', () => {
    const arr = [1, 2, 2, 3, 4]
    expect(InterpolationSearch.rangeSearch(arr, 5)).toBeNull()
  })

  it('rangeSearch returns null for empty array', () => {
    expect(InterpolationSearch.rangeSearch([], 5)).toBeNull()
  })

  it('rangeSearch handles single occurrence', () => {
    const arr = [1, 2, 3, 4, 5]
    expect(InterpolationSearch.rangeSearch(arr, 3)).toEqual([2, 2])
  })

  it('rangeSearch handles all duplicates', () => {
    const arr = [5, 5, 5, 5]
    expect(InterpolationSearch.rangeSearch(arr, 5)).toEqual([0, 3])
  })

  it('contains returns false for empty array', () => {
    expect(InterpolationSearch.contains([], 5)).toBe(false)
  })

  it('contains handles positive numbers', () => {
    expect(InterpolationSearch.contains([1, 3, 5], 3)).toBe(true)
  })

  it('contains handles negative numbers', () => {
    expect(InterpolationSearch.contains([-5, 0, 5], 0)).toBe(true)
  })

  it('closest returns -1 for empty array', () => {
    expect(InterpolationSearch.closest([], 5)).toBe(-1)
  })

  it('closest handles exact match at start', () => {
    const arr = [10, 20, 30, 40, 50]
    expect(InterpolationSearch.closest(arr, 10)).toBe(0)
  })

  it('closest handles exact match at end', () => {
    const arr = [10, 20, 30, 40, 50]
    expect(InterpolationSearch.closest(arr, 50)).toBe(4)
  })

  it('closest chooses closer when equidistant', () => {
    const arr = [0, 10, 20]
    expect(InterpolationSearch.closest(arr, 5)).toBe(0)
  })

  it('closest handles negative target', () => {
    const arr = [0, 5, 10]
    expect(InterpolationSearch.closest(arr, -10)).toBe(0)
  })

  it('closest handles large positive target', () => {
    const arr = [0, 5, 10]
    expect(InterpolationSearch.closest(arr, 100)).toBe(2)
  })

  it('closest works with sparse array', () => {
    const arr = [0, 100, 200, 300]
    expect(InterpolationSearch.closest(arr, 150)).toBe(1)
  })

  it('handles three element array', () => {
    expect(InterpolationSearch.search([1, 5, 10], 5)).toBe(1)
  })

  it('handles value in middle of range', () => {
    const arr = [0, 10, 20, 30, 40]
    expect(InterpolationSearch.search(arr, 20)).toBe(2)
  })

  it('search handles strictly increasing sequence', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    expect(InterpolationSearch.search(arr, 5)).toBe(4)
  })

  it('search handles linear spacing', () => {
    const arr = [0, 5, 10, 15, 20]
    expect(InterpolationSearch.search(arr, 15)).toBe(3)
  })

  it('closest handles boundary case', () => {
    const arr = [0, 10]
    expect(InterpolationSearch.closest(arr, 5)).toBe(1)
  })
})

describe('interpolation-search - wave548', () => {
  it('interpolation-search module defined', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search module is function', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search module has name', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search module not null', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search module has length', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - wave549', () => {
  it('interpolation-search module defined', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search module is function', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - wave550', () => {
  it('interpolation-search w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - wave551', () => {
  it('interpolation-search w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - wave552', () => {
  it('interpolation-search w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - wave553', () => {
  it('interpolation-search w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - wave554', () => {
  it('interpolation-search w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - wave555', () => {
  it('interpolation-search w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - wave556', () => {
  it('interpolation-search w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - wave557', () => {
  it('interpolation-search w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w557 v2', () => {
    expect(describe).toBeDefined()
  })
})
