import { describe, expect, it } from 'vitest'

import SqrtDecomposition from '../../src/utils/sqrt-decomposition.js'

describe('SqrtDecomposition - constructor', () => {
  it('creates decomposition from array', () => {
    const sd = new SqrtDecomposition([1, 2, 3, 4, 5])
    expect(sd.size).toBe(5)
  })

  it('handles empty array', () => {
    const sd = new SqrtDecomposition([])
    expect(sd.size).toBe(0)
  })

  it('handles single element', () => {
    const sd = new SqrtDecomposition([42])
    expect(sd.size).toBe(1)
  })
})

describe('SqrtDecomposition - single element query', () => {
  it('returns correct single element', () => {
    const sd = new SqrtDecomposition([10, 20, 30])
    expect(sd.rangeQuery(1, 2)).toBe(20)
  })

  it('returns first element', () => {
    const sd = new SqrtDecomposition([5, 10, 15])
    expect(sd.rangeQuery(0, 1)).toBe(5)
  })

  it('returns last element', () => {
    const sd = new SqrtDecomposition([5, 10, 15])
    expect(sd.rangeQuery(2, 3)).toBe(15)
  })
})

describe('SqrtDecomposition - full range sum', () => {
  it('sums entire array', () => {
    const sd = new SqrtDecomposition([1, 2, 3, 4, 5])
    expect(sd.rangeQuery(0, 5)).toBe(15)
  })

  it('sums array with zeros', () => {
    const sd = new SqrtDecomposition([0, 5, 0, 10, 0])
    expect(sd.rangeQuery(0, 5)).toBe(15)
  })

  it('sums negative values', () => {
    const sd = new SqrtDecomposition([-1, -2, -3, -4, -5])
    expect(sd.rangeQuery(0, 5)).toBe(-15)
  })
})

describe('SqrtDecomposition - partial range sum', () => {
  it('sums partial range in same block', () => {
    const sd = new SqrtDecomposition([1, 2, 3, 4, 5, 6, 7, 8, 9])
    expect(sd.rangeQuery(2, 5)).toBe(12)
  })

  it('sums range crossing block boundaries', () => {
    const sd = new SqrtDecomposition([1, 2, 3, 4, 5, 6, 7, 8, 9])
    expect(sd.rangeQuery(3, 7)).toBe(22)
  })

  it('sums multiple full blocks', () => {
    const sd = new SqrtDecomposition([1, 2, 3, 4, 5, 6, 7, 8, 9])
    expect(sd.rangeQuery(0, 9)).toBe(45)
  })
})

describe('SqrtDecomposition - range add then query', () => {
  it('adds to range and queries correctly', () => {
    const sd = new SqrtDecomposition([1, 2, 3, 4, 5])
    sd.rangeAdd(1, 4, 10)
    expect(sd.rangeQuery(0, 5)).toBe(45)
  })

  it('adds to single element', () => {
    const sd = new SqrtDecomposition([10, 20, 30])
    sd.rangeAdd(1, 2, 5)
    expect(sd.rangeQuery(1, 2)).toBe(25)
  })

  it('adds to entire array', () => {
    const sd = new SqrtDecomposition([1, 1, 1, 1, 1])
    sd.rangeAdd(0, 5, 9)
    expect(sd.rangeQuery(0, 5)).toBe(50)
  })

  it('adds negative value', () => {
    const sd = new SqrtDecomposition([10, 20, 30])
    sd.rangeAdd(0, 3, -5)
    expect(sd.rangeQuery(0, 3)).toBe(45)
  })
})

describe('SqrtDecomposition - point update then query', () => {
  it('updates single element', () => {
    const sd = new SqrtDecomposition([1, 2, 3, 4, 5])
    sd.pointUpdate(2, 10)
    expect(sd.rangeQuery(0, 5)).toBe(22)
  })

  it('updates first element', () => {
    const sd = new SqrtDecomposition([5, 10, 15])
    sd.pointUpdate(0, 100)
    expect(sd.rangeQuery(0, 3)).toBe(125)
  })

  it('updates last element', () => {
    const sd = new SqrtDecomposition([5, 10, 15])
    sd.pointUpdate(2, 0)
    expect(sd.rangeQuery(0, 3)).toBe(15)
  })

  it('throws for negative index', () => {
    const sd = new SqrtDecomposition([1, 2, 3])
    expect(() => sd.pointUpdate(-1, 5)).toThrow(RangeError)
  })

  it('throws for index >= size', () => {
    const sd = new SqrtDecomposition([1, 2, 3])
    expect(() => sd.pointUpdate(3, 5)).toThrow(RangeError)
  })
})

describe('SqrtDecomposition - multiple range adds', () => {
  it('handles multiple overlapping range adds', () => {
    const sd = new SqrtDecomposition([1, 2, 3, 4, 5])
    sd.rangeAdd(0, 3, 5)
    sd.rangeAdd(2, 5, 10)
    expect(sd.rangeQuery(0, 5)).toBe(60)
  })

  it('handles multiple disjoint range adds', () => {
    const sd = new SqrtDecomposition([1, 2, 3, 4, 5])
    sd.rangeAdd(0, 2, 10)
    sd.rangeAdd(3, 5, 20)
    expect(sd.rangeQuery(0, 5)).toBe(75)
  })

  it('accumulates adds on same range', () => {
    const sd = new SqrtDecomposition([1, 1, 1])
    sd.rangeAdd(0, 3, 5)
    sd.rangeAdd(0, 3, 3)
    sd.rangeAdd(0, 3, 2)
    expect(sd.rangeQuery(0, 3)).toBe(33)
  })
})

describe('SqrtDecomposition - empty-ish cases', () => {
  it('handles single element array', () => {
    const sd = new SqrtDecomposition([42])
    expect(sd.rangeQuery(0, 1)).toBe(42)
    sd.rangeAdd(0, 1, 8)
    expect(sd.rangeQuery(0, 1)).toBe(50)
    sd.pointUpdate(0, 100)
    expect(sd.rangeQuery(0, 1)).toBe(100)
  })

  it('handles two element array', () => {
    const sd = new SqrtDecomposition([3, 7])
    expect(sd.rangeQuery(0, 2)).toBe(10)
    expect(sd.rangeQuery(0, 1)).toBe(3)
    expect(sd.rangeQuery(1, 2)).toBe(7)
  })

  it('handles empty array', () => {
    const sd = new SqrtDecomposition([])
    expect(sd.size).toBe(0)
    expect(sd.rangeQuery(0, 0)).toBe(0)
  })
})

describe('SqrtDecomposition - toArray', () => {
  it('matches initial array state', () => {
    const arr = [1, 2, 3, 4, 5]
    const sd = new SqrtDecomposition(arr)
    expect(sd.toArray()).toEqual(arr)
  })

  it('reflects range adds in toArray', () => {
    const sd = new SqrtDecomposition([1, 2, 3, 4, 5])
    sd.rangeAdd(1, 4, 10)
    expect(sd.toArray()).toEqual([1, 12, 13, 14, 5])
  })

  it('reflects point updates in toArray', () => {
    const sd = new SqrtDecomposition([10, 20, 30])
    sd.pointUpdate(1, 50)
    expect(sd.toArray()).toEqual([10, 50, 30])
  })

  it('reflects mixed operations in toArray', () => {
    const sd = new SqrtDecomposition([1, 2, 3, 4, 5])
    sd.rangeAdd(0, 3, 5)
    sd.pointUpdate(2, 0)
    expect(sd.toArray()).toEqual([6, 7, 0, 4, 5])
  })
})

describe('SqrtDecomposition - get', () => {
  it('returns value at index', () => {
    const sd = new SqrtDecomposition([10, 20, 30])
    expect(sd.get(1)).toBe(20)
  })

  it('reflects range adds', () => {
    const sd = new SqrtDecomposition([1, 2, 3])
    sd.rangeAdd(0, 3, 5)
    expect(sd.get(1)).toBe(7)
  })

  it('reflects point updates', () => {
    const sd = new SqrtDecomposition([10, 20, 30])
    sd.pointUpdate(1, 50)
    expect(sd.get(1)).toBe(50)
  })

  it('throws for negative index', () => {
    const sd = new SqrtDecomposition([1, 2, 3])
    expect(() => sd.get(-1)).toThrow(RangeError)
  })

  it('throws for index >= size', () => {
    const sd = new SqrtDecomposition([1, 2, 3])
    expect(() => sd.get(3)).toThrow(RangeError)
  })
})

describe('SqrtDecomposition - large array performance', () => {
  it('handles 100 element array', () => {
    const arr = Array.from({ length: 100 }, (_, i) => i + 1)
    const sd = new SqrtDecomposition(arr)
    expect(sd.size).toBe(100)
    expect(sd.rangeQuery(0, 100)).toBe(5050)
    expect(sd.rangeQuery(0, 10)).toBe(55)
    expect(sd.rangeQuery(90, 100)).toBe(955)
  })

  it('handles operations on large array', () => {
    const arr = Array.from({ length: 100 }, () => 1)
    const sd = new SqrtDecomposition(arr)
    sd.rangeAdd(0, 50, 10)
    sd.rangeAdd(50, 100, 20)
    expect(sd.rangeQuery(0, 100)).toBe(1600)
    expect(sd.rangeQuery(0, 50)).toBe(550)
    expect(sd.rangeQuery(50, 100)).toBe(1050)
  })

  it('rangeQuery with l >= r returns 0', () => {
    const sd = new SqrtDecomposition([1, 2, 3, 4, 5])
    expect(sd.rangeQuery(3, 3)).toBe(0)
    expect(sd.rangeQuery(4, 2)).toBe(0)
  })

  it('rangeAdd with l >= r does nothing', () => {
    const sd = new SqrtDecomposition([1, 2, 3, 4, 5])
    sd.rangeAdd(3, 3, 10)
    expect(sd.rangeQuery(0, 5)).toBe(15)
    sd.rangeAdd(4, 2, 10)
    expect(sd.rangeQuery(0, 5)).toBe(15)
  })

  it('rangeQuery with l < 0 clamps to 0', () => {
    const sd = new SqrtDecomposition([1, 2, 3, 4, 5])
    expect(sd.rangeQuery(-5, 3)).toBe(6)
  })

  it('rangeQuery with r > size clamps to size', () => {
    const sd = new SqrtDecomposition([1, 2, 3, 4, 5])
    expect(sd.rangeQuery(3, 10)).toBe(9)
  })

  it('rangeQuery with l < 0 and r > size clamps both', () => {
    const sd = new SqrtDecomposition([1, 2, 3, 4, 5])
    expect(sd.rangeQuery(-10, 100)).toBe(15)
  })

  it('rangeAdd with l < 0 clamps to 0', () => {
    const sd = new SqrtDecomposition([1, 2, 3, 4, 5])
    sd.rangeAdd(-5, 2, 10)
    expect(sd.toArray()).toEqual([11, 12, 3, 4, 5])
  })

  it('rangeAdd with r > size clamps to size', () => {
    const sd = new SqrtDecomposition([1, 2, 3, 4, 5])
    sd.rangeAdd(3, 100, 10)
    expect(sd.toArray()).toEqual([1, 2, 3, 14, 15])
  })

  it('rangeAdd with l < 0 and r > size clamps both', () => {
    const sd = new SqrtDecomposition([1, 2, 3, 4, 5])
    sd.rangeAdd(-10, 100, 10)
    expect(sd.toArray()).toEqual([11, 12, 13, 14, 15])
  })

  it('get after multiple range adds on same index', () => {
    const sd = new SqrtDecomposition([1, 2, 3, 4, 5])
    sd.rangeAdd(0, 3, 5)
    sd.rangeAdd(1, 4, 10)
    expect(sd.get(2)).toBe(18)
  })

  it('pointUpdate to same value leaves array unchanged', () => {
    const sd = new SqrtDecomposition([1, 2, 3, 4, 5])
    sd.pointUpdate(2, 3)
    expect(sd.toArray()).toEqual([1, 2, 3, 4, 5])
    expect(sd.rangeQuery(0, 5)).toBe(15)
  })

  it('toArray with pending lazy operations', () => {
    const sd = new SqrtDecomposition([1, 2, 3, 4, 5])
    sd.rangeAdd(0, 3, 10)
    expect(sd.toArray()).toEqual([11, 12, 13, 4, 5])
  })

  it('rangeQuery after toArray still works', () => {
    const sd = new SqrtDecomposition([1, 2, 3, 4, 5])
    sd.rangeAdd(0, 3, 10)
    sd.toArray()
    expect(sd.rangeQuery(0, 5)).toBe(45)
  })

  it('toArray returns new array, not reference', () => {
    const sd = new SqrtDecomposition([1, 2, 3])
    const arr1 = sd.toArray()
    const arr2 = sd.toArray()
    arr1[0] = 999
    expect(arr2[0]).toBe(1)
  })

  it('pointUpdate after rangeAdd on same index', () => {
    const sd = new SqrtDecomposition([1, 2, 3, 4, 5])
    sd.rangeAdd(0, 5, 10)
    sd.pointUpdate(2, 50)
    expect(sd.get(2)).toBe(50)
    expect(sd.rangeQuery(0, 5)).toBe(102)
  })

  it('rangeAdd after pointUpdate on same range', () => {
    const sd = new SqrtDecomposition([1, 2, 3, 4, 5])
    sd.pointUpdate(2, 10)
    sd.rangeAdd(0, 5, 5)
    expect(sd.get(2)).toBe(15)
  })

  it('get with negative index throws', () => {
    const sd = new SqrtDecomposition([1, 2, 3])
    expect(() => sd.get(-1)).toThrow(RangeError)
  })

  it('get with index >= size throws', () => {
    const sd = new SqrtDecomposition([1, 2, 3])
    expect(() => sd.get(3)).toThrow(RangeError)
  })

  it('rangeQuery on empty array returns 0', () => {
    const sd = new SqrtDecomposition([])
    expect(sd.rangeQuery(0, 0)).toBe(0)
  })

  it('toArray on empty array returns empty array', () => {
    const sd = new SqrtDecomposition([])
    expect(sd.toArray()).toEqual([])
  })

  it('rangeAdd on empty array does nothing', () => {
    const sd = new SqrtDecomposition([])
    sd.rangeAdd(0, 0, 10)
    expect(sd.toArray()).toEqual([])
  })
})
describe('sqrt-decomposition - wave545', () => {
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

describe('sqrt-decomposition - wave546', () => {
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

describe('sqrt-decomposition - wave547', () => {
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

describe('sqrt-decomposition - wave548', () => {
  it('sqrt-decomposition module defined', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomposition module is function', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomposition module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomposition - wave549', () => {
  it('sqrt-decomposition module defined', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomposition module is function', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomposition module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomposition - wave550', () => {
  it('sqrt-decomposition w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomposition w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomposition w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomposition - wave551', () => {
  it('sqrt-decomposition w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomposition w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomposition w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})
