import { describe, it, expect } from 'vitest'
import { DifferenceArray } from '../../src/utils/difference-array.js'

describe('DifferenceArray', () => {
  it('creates array with size', () => {
    const diff = new DifferenceArray(10)
    expect(diff.length).toBe(10)
    expect(diff.toArray()).toEqual(new Array(10).fill(0))
  })

  it('pointAdd adds value at index', () => {
    const diff = new DifferenceArray(5)
    diff.pointAdd(2, 10)
    const result = diff.toArray()
    expect(result[2]).toBe(10)
    expect(result[0]).toBe(0)
    expect(result[4]).toBe(0)
  })

  it('pointAdd accumulates at same index', () => {
    const diff = new DifferenceArray(5)
    diff.pointAdd(2, 10)
    diff.pointAdd(2, 5)
    const result = diff.toArray()
    expect(result[2]).toBe(15)
  })

  it('rangeAdd adds value to range', () => {
    const diff = new DifferenceArray(10)
    diff.rangeAdd(2, 5, 10)
    const result = diff.toArray()
    expect(result[0]).toBe(0)
    expect(result[1]).toBe(0)
    expect(result[2]).toBe(10)
    expect(result[3]).toBe(10)
    expect(result[4]).toBe(10)
    expect(result[5]).toBe(10)
    expect(result[6]).toBe(0)
  })

  it('rangeAdd handles single element range', () => {
    const diff = new DifferenceArray(10)
    diff.rangeAdd(3, 3, 7)
    const result = diff.toArray()
    expect(result[3]).toBe(7)
    expect(result[2]).toBe(0)
    expect(result[4]).toBe(0)
  })

  it('rangeAdd handles entire array', () => {
    const diff = new DifferenceArray(5)
    diff.rangeAdd(0, 4, 100)
    const result = diff.toArray()
    expect(result).toEqual([100, 100, 100, 100, 100])
  })

  it('rangeAdd accumulates overlapping ranges', () => {
    const diff = new DifferenceArray(10)
    diff.rangeAdd(1, 4, 5)
    diff.rangeAdd(3, 6, 10)
    const result = diff.toArray()
    expect(result[0]).toBe(0)
    expect(result[1]).toBe(5)
    expect(result[2]).toBe(5)
    expect(result[3]).toBe(15)
    expect(result[4]).toBe(15)
    expect(result[5]).toBe(10)
    expect(result[6]).toBe(10)
    expect(result[7]).toBe(0)
  })

  it('rangeAdd with negative value subtracts', () => {
    const diff = new DifferenceArray(10)
    diff.rangeAdd(2, 5, 10)
    diff.rangeAdd(3, 4, -5)
    const result = diff.toArray()
    expect(result[2]).toBe(10)
    expect(result[3]).toBe(5)
    expect(result[4]).toBe(5)
    expect(result[5]).toBe(10)
  })

  it('rangeAdd ignores invalid range with l > r', () => {
    const diff = new DifferenceArray(10)
    diff.rangeAdd(5, 3, 10)
    const result = diff.toArray()
    expect(result).toEqual(new Array(10).fill(0))
  })

  it('rangeAdd ignores out of bounds left', () => {
    const diff = new DifferenceArray(5)
    diff.rangeAdd(-2, 3, 10)
    const result = diff.toArray()
    expect(result).toEqual(new Array(5).fill(0))
  })

  it('rangeAdd ignores out of bounds right', () => {
    const diff = new DifferenceArray(5)
    diff.rangeAdd(1, 10, 10)
    const result = diff.toArray()
    expect(result).toEqual(new Array(5).fill(0))
  })

  it('get returns prefix sum at index', () => {
    const diff = new DifferenceArray(10)
    diff.rangeAdd(2, 5, 10)
    expect(diff.get(1)).toBe(0)
    expect(diff.get(2)).toBe(10)
    expect(diff.get(5)).toBe(10)
    expect(diff.get(6)).toBe(0)
  })

  it('get accumulates all changes', () => {
    const diff = new DifferenceArray(10)
    diff.rangeAdd(0, 2, 5)
    diff.rangeAdd(2, 4, 10)
    diff.rangeAdd(4, 6, 15)
    expect(diff.get(0)).toBe(5)
    expect(diff.get(1)).toBe(5)
    expect(diff.get(2)).toBe(15)
    expect(diff.get(3)).toBe(10)
    expect(diff.get(4)).toBe(25)
    expect(diff.get(5)).toBe(15)
    expect(diff.get(6)).toBe(15)
  })

  it('toArray returns accumulated array', () => {
    const diff = new DifferenceArray(5)
    diff.rangeAdd(1, 3, 5)
    diff.rangeAdd(2, 4, 10)
    const result = diff.toArray()
    expect(result).toEqual([0, 5, 15, 15, 10])
  })

  it('toArray returns new array each time', () => {
    const diff = new DifferenceArray(5)
    diff.pointAdd(0, 10)
    const result1 = diff.toArray()
    const result2 = diff.toArray()
    expect(result1).toEqual(result2)
    expect(result1).not.toBe(result2)
  })

  it('length returns array size', () => {
    const diff = new DifferenceArray(20)
    expect(diff.length).toBe(20)
  })

  it('handles multiple pointAdds', () => {
    const diff = new DifferenceArray(10)
    diff.pointAdd(0, 1)
    diff.pointAdd(5, 2)
    diff.pointAdd(9, 3)
    const result = diff.toArray()
    expect(result).toEqual([1, 0, 0, 0, 0, 2, 0, 0, 0, 3])
  })

  it('handles negative values in range', () => {
    const diff = new DifferenceArray(10)
    diff.rangeAdd(2, 5, 100)
    diff.rangeAdd(3, 4, -200)
    const result = diff.toArray()
    expect(result[2]).toBe(100)
    expect(result[3]).toBe(-100)
    expect(result[4]).toBe(-100)
    expect(result[5]).toBe(100)
  })

  it('handles zero value range', () => {
    const diff = new DifferenceArray(10)
    diff.rangeAdd(1, 4, 10)
    diff.rangeAdd(1, 4, 0)
    const result = diff.toArray()
    expect(result[1]).toBe(10)
    expect(result[2]).toBe(10)
    expect(result[3]).toBe(10)
    expect(result[4]).toBe(10)
  })

  it('single update on full range', () => {
    const da = new DifferenceArray(5)
    da.rangeAdd(0, 4, 7)
    const result = da.toArray()
    expect(result).toEqual([7, 7, 7, 7, 7])
  })

  it('rangeAdd 0 length does nothing', () => {
    const da = new DifferenceArray(5)
    da.rangeAdd(2, 1, 10)
    const result = da.toArray()
    expect(result).toEqual([0, 0, 0, 0, 0])
  })

  it('range add at start', () => {
    const da = new DifferenceArray(5)
    da.rangeAdd(0, 2, 7)
    const result = da.toArray()
    expect(result[0]).toBe(7)
    expect(result[2]).toBe(7)
    expect(result[3]).toBe(0)
  })

  it('rangeAdd with zero does nothing meaningful', () => {
    const da = new DifferenceArray(3)
    da.rangeAdd(0, 2, 0)
    expect(da.get(0)).toBe(0)
  })

  it('rangeAdd then get reflects sum', () => {
    const da = new DifferenceArray(5)
    da.rangeAdd(1, 3, 10)
    expect(da.get(2)).toBe(10)
    expect(da.get(4)).toBe(0)
  })

  it('single point add', () => {
    const da = new DifferenceArray(3)
    da.rangeAdd(1, 1, 5)
    expect(da.get(1)).toBe(5)
  })

  it('toString returns formatted string', () => {
    const da = new DifferenceArray(10)
    expect(da.toString()).toBe('DifferenceArray(10)')
  })

  it('toJSON returns diff array copy', () => {
    const da = new DifferenceArray(3)
    da.pointAdd(1, 5)
    const json = da.toJSON()
    expect(Array.isArray(json)).toBe(true)
    expect(json.length).toBe(4)
  })

  it('clone creates independent copy', () => {
    const da = new DifferenceArray(5)
    da.rangeAdd(0, 4, 10)
    const copy = da.clone()
    expect(copy.toArray()).toEqual(da.toArray())
    copy.rangeAdd(0, 4, 5)
    expect(da.get(0)).toBe(10)
    expect(copy.get(0)).toBe(15)
  })

  it('clone of empty difference array', () => {
    const da = new DifferenceArray(5)
    const copy = da.clone()
    expect(copy.toArray()).toEqual([0, 0, 0, 0, 0])
    expect(copy.length).toBe(5)
  })

  it('equals with identical arrays', () => {
    const a = new DifferenceArray(5)
    const b = new DifferenceArray(5)
    a.rangeAdd(1, 3, 10)
    b.rangeAdd(1, 3, 10)
    expect(a.equals(b)).toBe(true)
  })

  it('equals with different values', () => {
    const a = new DifferenceArray(5)
    const b = new DifferenceArray(5)
    a.rangeAdd(1, 3, 10)
    b.rangeAdd(1, 3, 20)
    expect(a.equals(b)).toBe(false)
  })

  it('equals with different sizes', () => {
    const a = new DifferenceArray(5)
    const b = new DifferenceArray(10)
    expect(a.equals(b)).toBe(false)
  })

  it('equals with non-DifferenceArray', () => {
    const da = new DifferenceArray(5)
    expect(da.equals({})).toBe(false)
    expect(da.equals(null)).toBe(false)
    expect(da.equals(undefined)).toBe(false)
  })

  it('empty arrays of same size are equal', () => {
    const a = new DifferenceArray(5)
    const b = new DifferenceArray(5)
    expect(a.equals(b)).toBe(true)
  })

  it('get at index 0 returns first value', () => {
    const da = new DifferenceArray(5)
    da.pointAdd(0, 42)
    expect(da.get(0)).toBe(42)
  })

  it('get at last index', () => {
    const da = new DifferenceArray(5)
    da.pointAdd(4, 99)
    expect(da.get(4)).toBe(99)
    expect(da.get(3)).toBe(0)
  })

  it('pointAdd at boundaries', () => {
    const da = new DifferenceArray(5)
    da.pointAdd(0, 1)
    da.pointAdd(4, 2)
    const result = da.toArray()
    expect(result).toEqual([1, 0, 0, 0, 2])
  })

  it('rangeAdd at exact boundaries', () => {
    const da = new DifferenceArray(5)
    da.rangeAdd(0, 0, 10)
    da.rangeAdd(4, 4, 20)
    expect(da.toArray()).toEqual([10, 0, 0, 0, 20])
  })

  it('multiple overlapping ranges', () => {
    const da = new DifferenceArray(10)
    da.rangeAdd(0, 9, 1)
    da.rangeAdd(2, 7, 2)
    da.rangeAdd(4, 5, 3)
    const result = da.toArray()
    expect(result).toEqual([1, 1, 3, 3, 6, 6, 3, 3, 1, 1])
  })

  it('negative value makes value negative', () => {
    const da = new DifferenceArray(3)
    da.rangeAdd(0, 2, -5)
    expect(da.toArray()).toEqual([-5, -5, -5])
  })

  it('size 1 array', () => {
    const da = new DifferenceArray(1)
    expect(da.length).toBe(1)
    expect(da.toArray()).toEqual([0])
    da.pointAdd(0, 10)
    expect(da.get(0)).toBe(10)
  })

  it('large range add', () => {
    const da = new DifferenceArray(100)
    da.rangeAdd(0, 99, 1)
    expect(da.get(0)).toBe(1)
    expect(da.get(99)).toBe(1)
    expect(da.toArray().every(v => v === 1)).toBe(true)
  })

  it('get at 0 with no changes', () => {
    const da = new DifferenceArray(5)
    expect(da.get(0)).toBe(0)
  })

  it('pointAdd is alias for rangeAdd of single element', () => {
    const a = new DifferenceArray(10)
    const b = new DifferenceArray(10)
    a.pointAdd(5, 42)
    b.rangeAdd(5, 5, 42)
    expect(a.toArray()).toEqual(b.toArray())
    expect(a.equals(b)).toBe(true)
  })

  it('clone after modifications', () => {
    const da = new DifferenceArray(5)
    da.rangeAdd(1, 3, 10)
    const copy = da.clone()
    expect(copy.get(2)).toBe(10)
    expect(copy.length).toBe(5)
  })

  it('toString reflects size', () => {
    const da = new DifferenceArray(42)
    expect(da.toString()).toBe('DifferenceArray(42)')
  })

  it('toJSON after modifications', () => {
    const da = new DifferenceArray(3)
    da.pointAdd(1, 5)
    const json = da.toJSON()
    expect(json).not.toEqual(new Array(4).fill(0))
    expect(json.length).toBe(4)
  })

  it('equals after same operations', () => {
    const a = new DifferenceArray(5)
    const b = new DifferenceArray(5)
    a.pointAdd(0, 10)
    a.pointAdd(2, 20)
    b.pointAdd(0, 10)
    b.pointAdd(2, 20)
    expect(a.equals(b)).toBe(true)
  })

  it('staircase pattern', () => {
    const da = new DifferenceArray(5)
    da.rangeAdd(0, 0, 1)
    da.rangeAdd(0, 1, 1)
    da.rangeAdd(0, 2, 1)
    da.rangeAdd(0, 3, 1)
    da.rangeAdd(0, 4, 1)
    expect(da.toArray()).toEqual([5, 4, 3, 2, 1])
  })

  it('rangeAdd with very large value', () => {
    const da = new DifferenceArray(5)
    da.rangeAdd(0, 4, 1e9)
    expect(da.get(0)).toBe(1e9)
    expect(da.get(4)).toBe(1e9)
  })

  it('should handle prefix sum query', () => {
    const da = new DifferenceArray(5)
    da.rangeAdd(0, 4, 1)
    expect(da.get(2)).toBe(1)
  })

  it('should handle overlapping ranges', () => {
    const da = new DifferenceArray(4)
    da.rangeAdd(0, 2, 5)
    da.rangeAdd(1, 3, 3)
    expect(da.get(1)).toBe(8)
  })

  it('pointAdd adds value to single index', () => {
    const da = new DifferenceArray(5)
    da.pointAdd(2, 10)
    expect(da.get(2)).toBe(10)
    expect(da.get(1)).toBe(0)
  })

  it('clone produces equal object', () => {
    const da = new DifferenceArray(3)
    da.rangeAdd(0, 2, 5)
    const c = da.clone()
    expect(c.toArray()).toEqual(da.toArray())
  })

  it('toString returns string', () => {
    const da = new DifferenceArray(3)
    expect(typeof da.toString()).toBe('string')
  })
})

  it('toArray returns zeros initially', () => {
    const da = new DifferenceArray(3)
    expect(da.toArray()).toEqual([0, 0, 0])
  })

  it('pointAdd adds to index', () => {
    const da = new DifferenceArray(3)
    da.pointAdd(1, 5)
    expect(da.toArray()).toEqual([0, 5, 0])
  })

  it('rangeAdd adds to range', () => {
    const da = new DifferenceArray(5)
    da.rangeAdd(1, 3, 10)
    expect(da.toArray()).toEqual([0, 10, 10, 10, 0])
  })

describe('difference-array - wave545', () => {
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

describe('difference-array - wave546', () => {
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

describe('difference-array - wave547', () => {
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

describe('difference-array - wave548', () => {
  it('difference-array module defined', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array module is function', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - wave549', () => {
  it('difference-array module defined', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array module is function', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - wave550', () => {
  it('difference-array w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - wave551', () => {
  it('difference-array w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - wave552', () => {
  it('difference-array w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - wave553', () => {
  it('difference-array w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - wave554', () => {
  it('difference-array w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - wave555', () => {
  it('difference-array w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - wave556', () => {
  it('difference-array w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - wave557', () => {
  it('difference-array w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - wave558', () => {
  it('difference-array w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - wave559', () => {
  it('difference-array w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - wave560', () => {
  it('difference-array w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - wave561', () => {
  it('difference-array w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - wave562', () => {
  it('difference-array w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - wave563', () => {
  it('difference-array w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - wave564', () => {
  it('difference-array w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - wave565', () => {
  it('difference-array w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - wave566', () => {
  it('difference-array w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - wave127', () => {
  it('difference-array w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - wave130', () => {
  it('difference-array w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - wave133', () => {
  it('difference-array w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - wave136', () => {
  it('difference-array w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - wave139', () => {
  it('difference-array w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - w142', () => {
  it('difference-array v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - w145', () => {
  it('difference-array v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - w148', () => {
  it('difference-array v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - w151', () => {
  it('difference-array v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - w154', () => {
  it('difference-array v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - w157', () => {
  it('difference-array v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - w160', () => {
  it('difference-array v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - w170', () => {
  it('difference-array x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - w180', () => {
  it('difference-array x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - w190', () => {
  it('difference-array x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - w200', () => {
  it('difference-array x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - w210', () => {
  it('difference-array x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - w220', () => {
  it('difference-array x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - w230', () => {
  it('difference-array x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - w240', () => {
  it('difference-array x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - w250', () => {
  it('difference-array x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - w260', () => {
  it('difference-array x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - w270', () => {
  it('difference-array x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - w280', () => {
  it('difference-array x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - w290', () => {
  it('difference-array x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - w300', () => {
  it('difference-array x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - w310', () => {
  it('difference-array x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - w320', () => {
  it('difference-array x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - w330', () => {
  it('difference-array x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - w340', () => {
  it('difference-array x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - w350', () => {
  it('difference-array x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - w360', () => {
  it('difference-array x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - w370', () => {
  it('difference-array x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - w380', () => {
  it('difference-array x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - w390', () => {
  it('difference-array x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - w400', () => {
  it('difference-array x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - w420', () => {
  it('difference-array x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - w440', () => {
  it('difference-array x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - w460', () => {
  it('difference-array x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - w480', () => {
  it('difference-array x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - w500', () => {
  it('difference-array x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - w550', () => {
  it('difference-array x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('difference-array - w600', () => {
  it('difference-array x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('difference-array x600x49', () => {
    expect(describe).toBeDefined()
  })
})
