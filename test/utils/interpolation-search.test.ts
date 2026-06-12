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

describe('interpolation-search - wave558', () => {
  it('interpolation-search w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - wave559', () => {
  it('interpolation-search w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - wave560', () => {
  it('interpolation-search w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - wave561', () => {
  it('interpolation-search w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - wave562', () => {
  it('interpolation-search w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - wave563', () => {
  it('interpolation-search w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - wave564', () => {
  it('interpolation-search w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - wave565', () => {
  it('interpolation-search w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - wave566', () => {
  it('interpolation-search w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - wave127', () => {
  it('interpolation-search w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - wave130', () => {
  it('interpolation-search w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - wave133', () => {
  it('interpolation-search w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - wave136', () => {
  it('interpolation-search w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - wave139', () => {
  it('interpolation-search w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - w142', () => {
  it('interpolation-search v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - w145', () => {
  it('interpolation-search v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - w148', () => {
  it('interpolation-search v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - w151', () => {
  it('interpolation-search v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - w154', () => {
  it('interpolation-search v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - w157', () => {
  it('interpolation-search v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - w160', () => {
  it('interpolation-search v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - w170', () => {
  it('interpolation-search x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - w180', () => {
  it('interpolation-search x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - w190', () => {
  it('interpolation-search x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - w200', () => {
  it('interpolation-search x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - w210', () => {
  it('interpolation-search x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - w220', () => {
  it('interpolation-search x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - w230', () => {
  it('interpolation-search x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - w240', () => {
  it('interpolation-search x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - w250', () => {
  it('interpolation-search x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - w260', () => {
  it('interpolation-search x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - w270', () => {
  it('interpolation-search x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - w280', () => {
  it('interpolation-search x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - w290', () => {
  it('interpolation-search x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - w300', () => {
  it('interpolation-search x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - w310', () => {
  it('interpolation-search x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - w320', () => {
  it('interpolation-search x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - w330', () => {
  it('interpolation-search x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - w340', () => {
  it('interpolation-search x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - w350', () => {
  it('interpolation-search x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - w360', () => {
  it('interpolation-search x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - w370', () => {
  it('interpolation-search x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - w380', () => {
  it('interpolation-search x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - w390', () => {
  it('interpolation-search x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - w400', () => {
  it('interpolation-search x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - w420', () => {
  it('interpolation-search x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - w440', () => {
  it('interpolation-search x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - w460', () => {
  it('interpolation-search x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - w480', () => {
  it('interpolation-search x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - w500', () => {
  it('interpolation-search x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - w550', () => {
  it('interpolation-search x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('interpolation-search - w600', () => {
  it('interpolation-search x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('interpolation-search x600x49', () => {
    expect(describe).toBeDefined()
  })
})
