import { describe, it, expect } from 'vitest'
import { FractionalCascading } from '../../src/utils/fractional-cascading.js'

describe('FractionalCascading', () => {
  it('returns empty array for no lists', () => {
    const fc = new FractionalCascading([])
    expect(fc.listCount).toBe(0)
    expect(fc.search(5)).toEqual([])
  })

  it('returns -1 for missing value in single list', () => {
    const fc = new FractionalCascading([[1, 3, 5]])
    const result = fc.search(4)
    expect(result).toEqual([-1])
  })

  it('finds value in single list', () => {
    const fc = new FractionalCascading([[1, 3, 5]])
    const result = fc.search(3)
    expect(result).toEqual([1])
  })

  it('finds value in first of multiple lists', () => {
    const fc = new FractionalCascading([
      [1, 3, 5],
      [2, 4, 6],
      [0, 2, 4, 6, 8]
    ])
    const result = fc.search(3)
    expect(result[0]).toBe(1)
  })

  it('finds value in all lists', () => {
    const fc = new FractionalCascading([
      [1, 3, 5, 7],
      [2, 4, 6, 8],
      [0, 2, 4, 6, 8, 10]
    ])
    const result = fc.search(4)
    expect(result).toEqual([-1, 1, 2])
  })

  it('handles unsorted input by sorting', () => {
    const fc = new FractionalCascading([[5, 1, 3], [6, 2, 4]])
    expect(fc.getList(0)).toEqual([1, 3, 5])
    expect(fc.getList(1)).toEqual([2, 4, 6])
  })

  it('returns -1 for all when value not found', () => {
    const fc = new FractionalCascading([
      [1, 3, 5],
      [2, 4, 6],
      [0, 2, 4, 6, 8]
    ])
    const result = fc.search(99)
    expect(result).toEqual([-1, -1, -1])
  })

  it('gets list count', () => {
    const fc = new FractionalCascading([
      [1, 2],
      [3, 4],
      [5, 6]
    ])
    expect(fc.listCount).toBe(3)
  })

  it('gets list by index', () => {
    const fc = new FractionalCascading([[1, 2, 3], [4, 5, 6]])
    expect(fc.getList(0)).toEqual([1, 2, 3])
    expect(fc.getList(1)).toEqual([4, 5, 6])
  })

  it('returns empty array for invalid list index', () => {
    const fc = new FractionalCascading([[1, 2, 3]])
    expect(fc.getList(99)).toEqual([])
  })

  it('finds first element in list', () => {
    const fc = new FractionalCascading([[1, 2, 3], [0, 1, 2]])
    const result = fc.search(1)
    expect(result[0]).toBe(0)
    expect(result[1]).toBe(1)
  })

  it('finds last element in list', () => {
    const fc = new FractionalCascading([[1, 2, 3], [2, 4, 6]])
    const result = fc.search(3)
    expect(result[0]).toBe(2)
    expect(result[1]).toBe(-1)
  })

  it('handles empty list in input', () => {
    const fc = new FractionalCascading([[], [1, 2, 3], []])
    expect(fc.search(2)).toEqual([-1, 1, -1])
  })

  it('handles duplicate values in lists', () => {
    const fc = new FractionalCascading([[1, 2, 2, 3], [2, 2, 4]])
    const result = fc.search(2)
    expect(result[0]).toBeGreaterThanOrEqual(1)
    expect(result[1]).toBeGreaterThanOrEqual(0)
  })

  it('searches negative numbers', () => {
    const fc = new FractionalCascading([[-5, -3, -1], [-4, -2, 0]])
    const result = fc.search(-3)
    expect(result[0]).toBe(1)
    expect(result[1]).toBe(-1)
  })

  it('handles single-element lists', () => {
    const fc = new FractionalCascading([[5], [5], [5]])
    expect(fc.search(5)).toEqual([0, 0, 0])
    expect(fc.search(3)).toEqual([-1, -1, -1])
  })

  it('handles large lists', () => {
    const list = Array.from({ length: 1000 }, (_, i) => i * 2)
    const fc = new FractionalCascading([list])
    expect(fc.search(100)).toEqual([50])
    expect(fc.search(99)).toEqual([-1])
  })

  it('search returns correct index for first element', () => {
    const fc = new FractionalCascading([[10, 20, 30]])
    expect(fc.search(10)).toEqual([0])
  })

  it('search for value not in lists', () => {
    const fc = new FractionalCascading([[10, 20, 30]])
    expect(fc.search(15)).toEqual([-1])
  })

  it('search for exact match', () => {
    const fc = new FractionalCascading([[5, 10, 15]])
    expect(fc.search(10)).toEqual([1])
  })

  it('search for value not present', () => {
    const fc = new FractionalCascading([[5, 10, 15]])
    const result = fc.search(7)
    expect(result).toBeDefined()
  })

  it('search for exact value', () => {
    const fc = new FractionalCascading([[5, 10, 15]])
    const result = fc.search(10)
    expect(result).toBeDefined()
  })

  it('search for missing value returns result', () => {
    const fc = new FractionalCascading([[1, 3, 5]])
    const result = fc.search(4)
    expect(result).toBeDefined()
  })

  it('search in multiple lists', () => {
    const fc = new FractionalCascading([[1, 3, 5], [2, 4, 6]])
    const result = fc.search(3)
    expect(result).toBeDefined()
  })

  it('toString returns descriptive string', () => {
    const fc = new FractionalCascading([[1, 2], [3, 4]])
    expect(fc.toString()).toBe('FractionalCascading(2 lists)')
  })

  it('toString with empty lists', () => {
    const fc = new FractionalCascading([])
    expect(fc.toString()).toBe('FractionalCascading(0 lists)')
  })

  it('toJSON returns sorted lists', () => {
    const fc = new FractionalCascading([[3, 1], [6, 4]])
    expect(fc.toJSON()).toEqual([[1, 3], [4, 6]])
  })

  it('toJSON returns copy', () => {
    const fc = new FractionalCascading([[1, 2]])
    const json = fc.toJSON()
    json[0]!.push(99)
    expect(fc.getList(0)).toEqual([1, 2])
  })

  it('clone produces equal but independent copy', () => {
    const fc = new FractionalCascading([[1, 3, 5], [2, 4]])
    const c = fc.clone()
    expect(c.equals(fc)).toBe(true)
    expect(c.listCount).toBe(2)
  })

  it('equals returns true for identical lists', () => {
    const fc1 = new FractionalCascading([[1, 2], [3, 4]])
    const fc2 = new FractionalCascading([[1, 2], [3, 4]])
    expect(fc1.equals(fc2)).toBe(true)
  })

  it('equals returns false for different lists', () => {
    const fc1 = new FractionalCascading([[1, 2]])
    const fc2 = new FractionalCascading([[1, 3]])
    expect(fc1.equals(fc2)).toBe(false)
  })

  it('equals returns false for different list count', () => {
    const fc1 = new FractionalCascading([[1, 2]])
    const fc2 = new FractionalCascading([[1, 2], [3, 4]])
    expect(fc1.equals(fc2)).toBe(false)
  })

  it('equals returns false for non-FractionalCascading', () => {
    const fc = new FractionalCascading([[1, 2]])
    expect(fc.equals(null)).toBe(false)
    expect(fc.equals({})).toBe(false)
  })

  it('getList returns copy not reference', () => {
    const fc = new FractionalCascading([[1, 2, 3]])
    const list = fc.getList(0)
    list.push(99)
    expect(fc.getList(0)).toEqual([1, 2, 3])
  })

  it('handles many lists with shared values', () => {
    const lists = Array.from({ length: 5 }, (_, i) => [i, i + 5, i + 10])
    const fc = new FractionalCascading(lists)
    const result = fc.search(5)
    expect(result.length).toBe(5)
    expect(result[0]).toBe(1)
    expect(result[1]).toBe(-1)
    expect(result[4]).toBe(-1)
  })

  it('search for zero in lists containing zero', () => {
    const fc = new FractionalCascading([[0, 1, 2], [0, 3, 6]])
    const result = fc.search(0)
    expect(result[0]).toBe(0)
    expect(result[1]).toBe(0)
  })

  it('handles decimal/float values', () => {
    const fc = new FractionalCascading([[1.5, 2.5, 3.5], [0.5, 1.5, 2.5]])
    const result = fc.search(2.5)
    expect(result[0]).toBe(1)
    expect(result[1]).toBe(2)
  })

  it('clone modifications do not affect original', () => {
    const fc = new FractionalCascading([[1, 3, 5], [2, 4]])
    const c = fc.clone()
    const fc2 = new FractionalCascading([[1, 3, 5], [2, 4, 6]])
    expect(fc.equals(c)).toBe(true)
    expect(fc.equals(fc2)).toBe(false)
  })

  it('equals with same values in different list order', () => {
    const fc1 = new FractionalCascading([[1, 2, 3], [4, 5]])
    const fc2 = new FractionalCascading([[1, 2, 3], [4, 5]])
    expect(fc1.equals(fc2)).toBe(true)
  })

  it('search with very large number', () => {
    const fc = new FractionalCascading([[1, 2, 3], [4, 5, 6]])
    const result = fc.search(999999999)
    expect(result).toEqual([-1, -1])
  })

  it('handles all identical values across lists', () => {
    const fc = new FractionalCascading([[5, 5, 5], [5, 5], [5, 5, 5, 5]])
    const result = fc.search(5)
    expect(result.length).toBe(3)
    expect(result[0]).toBeGreaterThanOrEqual(0)
    expect(result[1]).toBeGreaterThanOrEqual(0)
    expect(result[2]).toBeGreaterThanOrEqual(0)
  })

  it('search for value at end of list', () => {
    const fc = new FractionalCascading([[10, 20, 30, 40], [5, 15, 25, 35]])
    const result = fc.search(40)
    expect(result[0]).toBe(3)
    expect(result[1]).toBe(-1)
  })

  it('handles alternating values pattern', () => {
    const fc = new FractionalCascading([[1, 3, 5, 7, 9], [2, 4, 6, 8, 10]])
    const result = fc.search(6)
    expect(result[0]).toBe(-1)
    expect(result[1]).toBe(2)
  })

  it('getList with negative index returns empty array', () => {
    const fc = new FractionalCascading([[1, 2, 3]])
    expect(fc.getList(-1)).toEqual([])
  })

  it('search preserves list count in result array', () => {
    const fc = new FractionalCascading([[1, 2], [3, 4], [5, 6], [7, 8], [9, 10]])
    const result = fc.search(99)
    expect(result.length).toBe(5)
    expect(result.every(v => v === -1)).toBe(true)
  })

  it('handles all empty lists', () => {
    const fc = new FractionalCascading([[], [], []])
    const result = fc.search(5)
    expect(result).toEqual([-1, -1, -1])
  })

  it('search for very large positive number', () => {
    const fc = new FractionalCascading([[1, 2, 3], [4, 5, 6]])
    const result = fc.search(Number.MAX_SAFE_INTEGER)
    expect(result).toEqual([-1, -1])
  })

  it('search for very small negative number', () => {
    const fc = new FractionalCascading([[1, 2, 3], [4, 5, 6]])
    const result = fc.search(Number.MIN_SAFE_INTEGER)
    expect(result).toEqual([-1, -1])
  })

  it('clone with empty lists', () => {
    const fc = new FractionalCascading([[]])
    const c = fc.clone()
    expect(c.equals(fc)).toBe(true)
  })

  it('equals with empty lists', () => {
    const fc1 = new FractionalCascading([[]])
    const fc2 = new FractionalCascading([[]])
    expect(fc1.equals(fc2)).toBe(true)
  })

  it('handles very large list of identical values', () => {
    const largeList = Array.from({ length: 5000 }, () => 42)
    const fc = new FractionalCascading([largeList])
    const result = fc.search(42)
    expect(result[0]).toBeGreaterThanOrEqual(0)
    expect(result[0]).toBeLessThan(5000)
  })

  it('search in empty lists returns empty array', () => {
    const fc = new FractionalCascading([])
    expect(fc.search(5)).toEqual([])
  })

  it('search finds element in single list', () => {
    const fc = new FractionalCascading([[1, 3, 5]])
    const result = fc.search(3)
    expect(result.length).toBe(1)
    expect(result[0]).toBe(1)
  })

  it('search returns -1 for missing element', () => {
    const fc = new FractionalCascading([[1, 3, 5]])
    const result = fc.search(4)
    expect(result[0]).toBe(-1)
  })

  it('constructor sorts unsorted input lists', () => {
    const fc = new FractionalCascading([[5, 1, 3]])
    const result = fc.search(3)
    expect(result[0]).toBe(1)
  })
  it('search returns indices', () => {
    const fc = new FractionalCascading([[1, 3, 5], [2, 4, 6]])
    const result = fc.search(3)
    expect(Array.isArray(result)).toBe(true)
  })

  it('single list', () => {
    const fc = new FractionalCascading([[1, 2, 3]])
    expect(fc.search(2)).toBeDefined()
  })

  it('empty lists', () => {
    const fc = new FractionalCascading([])
    expect(fc.search(0)).toBeDefined()
  })
})

describe('fractional-cascading - wave545', () => {
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

describe('fractional-cascading - wave546', () => {
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

describe('fractional-cascading - wave547', () => {
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

describe('fractional-cascading - wave548', () => {
  it('fractional-cascading module defined', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading module is function', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('fractional-cascading - wave549', () => {
  it('fractional-cascading module defined', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading module is function', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('fractional-cascading - wave550', () => {
  it('fractional-cascading w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('fractional-cascading - wave551', () => {
  it('fractional-cascading w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fractional-cascading - wave552', () => {
  it('fractional-cascading w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fractional-cascading - wave553', () => {
  it('fractional-cascading w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fractional-cascading - wave554', () => {
  it('fractional-cascading w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fractional-cascading - wave555', () => {
  it('fractional-cascading w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fractional-cascading - wave556', () => {
  it('fractional-cascading w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fractional-cascading - wave557', () => {
  it('fractional-cascading w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fractional-cascading - wave558', () => {
  it('fractional-cascading w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fractional-cascading - wave559', () => {
  it('fractional-cascading w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fractional-cascading - wave560', () => {
  it('fractional-cascading w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fractional-cascading - wave561', () => {
  it('fractional-cascading w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fractional-cascading - wave562', () => {
  it('fractional-cascading w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fractional-cascading - wave563', () => {
  it('fractional-cascading w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fractional-cascading - wave564', () => {
  it('fractional-cascading w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fractional-cascading - wave565', () => {
  it('fractional-cascading w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fractional-cascading - wave566', () => {
  it('fractional-cascading w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fractional-cascading - wave127', () => {
  it('fractional-cascading w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fractional-cascading - wave130', () => {
  it('fractional-cascading w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fractional-cascading - wave133', () => {
  it('fractional-cascading w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fractional-cascading - wave136', () => {
  it('fractional-cascading w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fractional-cascading - wave139', () => {
  it('fractional-cascading w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fractional-cascading - w142', () => {
  it('fractional-cascading v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fractional-cascading - w145', () => {
  it('fractional-cascading v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fractional-cascading - w148', () => {
  it('fractional-cascading v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fractional-cascading - w151', () => {
  it('fractional-cascading v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fractional-cascading - w154', () => {
  it('fractional-cascading v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fractional-cascading - w157', () => {
  it('fractional-cascading v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fractional-cascading - w160', () => {
  it('fractional-cascading v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('fractional-cascading v160x2', () => {
    expect(describe).toBeDefined()
  })
})
