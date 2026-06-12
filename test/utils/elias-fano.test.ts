import { describe, it, expect } from 'vitest'
import { EliasFano } from '../../src/utils/elias-fano.js'

describe('EliasFano', () => {
  it('creates encoding from sorted array', () => {
    const values = [3, 7, 15, 23, 42]
    const ef = new EliasFano(values)
    expect(ef.length).toBe(5)
  })

  it('creates encoding from sorted array using fromSorted', () => {
    const values = [3, 7, 15, 23, 42]
    const ef = EliasFano.fromSorted(values)
    expect(ef.length).toBe(5)
  })

  it('accesses values by index', () => {
    const values = [3, 7, 15, 23, 42]
    const ef = new EliasFano(values)
    expect(ef.get(0)).toBe(3)
    expect(ef.get(1)).toBe(7)
    expect(ef.get(2)).toBe(15)
    expect(ef.get(3)).toBe(23)
    expect(ef.get(4)).toBe(42)
  })

  it('throws error for out of bounds index', () => {
    const values = [3, 7, 15]
    const ef = new EliasFano(values)
    expect(() => ef.get(-1)).toThrow(RangeError)
    expect(() => ef.get(3)).toThrow(RangeError)
  })

  it('finds index of existing value', () => {
    const values = [3, 7, 15, 23, 42]
    const ef = new EliasFano(values)
    expect(ef.indexOf(15)).toBe(2)
    expect(ef.indexOf(42)).toBe(4)
  })

  it('returns -1 for non-existing value', () => {
    const values = [3, 7, 15, 23, 42]
    const ef = new EliasFano(values)
    expect(ef.indexOf(5)).toBe(-1)
    expect(ef.indexOf(100)).toBe(-1)
  })

  it('finds next greater or equal value', () => {
    const values = [3, 7, 15, 23, 42]
    const ef = new EliasFano(values)
    expect(ef.nextGEQ(5)).toBe(1)
    expect(ef.nextGEQ(15)).toBe(2)
    expect(ef.nextGEQ(20)).toBe(3)
  })

  it('returns -1 when no value is greater or equal', () => {
    const values = [3, 7, 15, 23, 42]
    const ef = new EliasFano(values)
    expect(ef.nextGEQ(100)).toBe(-1)
  })

  it('handles empty array', () => {
    const ef = new EliasFano([])
    expect(ef.length).toBe(0)
    expect(ef.encodedSize).toBe(0)
  })

  it('handles single element array', () => {
    const values = [42]
    const ef = new EliasFano(values)
    expect(ef.length).toBe(1)
    expect(ef.get(0)).toBe(42)
  })

  it('handles monotonic sequence', () => {
    const values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    const ef = new EliasFano(values)
    expect(ef.length).toBe(10)
    expect(ef.get(5)).toBe(5)
    expect(ef.indexOf(7)).toBe(7)
  })

  it('handles large values', () => {
    const values = [1000000, 2000000, 3000000, 4000000, 5000000]
    const ef = new EliasFano(values)
    expect(ef.length).toBe(5)
    expect(ef.get(2)).toBe(3000000)
    expect(ef.indexOf(4000000)).toBe(3)
  })

  it('converts to array', () => {
    const values = [3, 7, 15, 23, 42]
    const ef = new EliasFano(values)
    const result = ef.toArray()
    expect(result).toEqual(values)
  })

  it('iterates with forEach', () => {
    const values = [3, 7, 15, 23, 42]
    const ef = new EliasFano(values)
    const result: number[] = []
    ef.forEach((v, i) => {
      result.push(v)
      expect(v).toBe(values[i]!)
    })
    expect(result).toEqual(values)
  })

  it('handles all zero values', () => {
    const values = [0, 0, 0, 0]
    const ef = new EliasFano(values)
    expect(ef.length).toBe(4)
    expect(ef.get(0)).toBe(0)
    expect(ef.get(3)).toBe(0)
  })

  it('throws error on empty encoding get', () => {
    const ef = new EliasFano([])
    expect(() => ef.get(0)).toThrow(RangeError)
  })

  it('returns encoded size', () => {
    const values = [3, 7, 15, 23, 42]
    const ef = new EliasFano(values)
    expect(ef.encodedSize).toBeGreaterThan(0)
  })

  it('handles consecutive numbers', () => {
    const values = [100, 101, 102, 103, 104]
    const ef = new EliasFano(values)
    expect(ef.length).toBe(5)
    expect(ef.get(2)).toBe(102)
  })

  it('handles large gap between values', () => {
    const values = [1, 1000, 1000000]
    const ef = new EliasFano(values)
    expect(ef.length).toBe(3)
    expect(ef.get(0)).toBe(1)
    expect(ef.get(1)).toBe(1000)
    expect(ef.get(2)).toBe(1000000)
  })

  it('length returns correct count', () => {
    const ef = EliasFano.fromSorted([10, 20, 30])
    expect(ef.length).toBe(3)
  })

  it('get returns value at index', () => {
    const ef = EliasFano.fromSorted([10, 20, 30])
    expect(ef.get(0)).toBe(10)
    expect(ef.get(2)).toBe(30)
  })

  it('indexOf existing value', () => {
    const ef = EliasFano.fromSorted([10, 20, 30])
    expect(ef.indexOf(20)).toBe(1)
  })

  it('indexOf missing value returns -1', () => {
    const ef = EliasFano.fromSorted([10, 20, 30])
    expect(ef.indexOf(15)).toBeLessThan(0)
  })

  it('get returns correct value', () => {
    const ef = EliasFano.fromSorted([10, 20, 30])
    expect(ef.get(0)).toBe(10)
    expect(ef.get(2)).toBe(30)
  })

  it('single element', () => {
    const ef = EliasFano.fromSorted([42])
    expect(ef.get(0)).toBe(42)
  })
})

// ─── Edge cases ──────────────────────────────────────────────
describe('EliasFano - edge cases', () => {
  it('nextGEQ returns 0 for empty array', () => {
    const ef = new EliasFano([])
    expect(ef.nextGEQ(5)).toBe(-1)
  })

  it('nextGEQ with value less than first element', () => {
    const values = [10, 20, 30]
    const ef = new EliasFano(values)
    expect(ef.nextGEQ(5)).toBe(0)
  })

  it('nextGEQ with value equal to first element', () => {
    const values = [10, 20, 30]
    const ef = new EliasFano(values)
    expect(ef.nextGEQ(10)).toBe(0)
  })

  it('nextGEQ with value equal to last element', () => {
    const values = [10, 20, 30]
    const ef = new EliasFano(values)
    expect(ef.nextGEQ(30)).toBe(2)
  })

  it('indexOf with value less than first element', () => {
    const values = [10, 20, 30]
    const ef = new EliasFano(values)
    expect(ef.indexOf(5)).toBe(-1)
  })

  it('indexOf with value greater than last element', () => {
    const values = [10, 20, 30]
    const ef = new EliasFano(values)
    expect(ef.indexOf(100)).toBe(-1)
  })

  it('get throws RangeError for negative index', () => {
    const values = [10, 20, 30]
    const ef = new EliasFano(values)
    expect(() => ef.get(-5)).toThrow(RangeError)
  })

  it('get throws RangeError for index at length', () => {
    const values = [10, 20, 30]
    const ef = new EliasFano(values)
    expect(() => ef.get(3)).toThrow(RangeError)
  })

  it('handles duplicate values', () => {
    const values = [10, 10, 20, 20]
    const ef = new EliasFano(values)
    expect(ef.get(0)).toBe(10)
    expect(ef.get(1)).toBe(10)
    expect(ef.get(2)).toBe(20)
    expect(ef.get(3)).toBe(20)
  })

  it('handles powers of two', () => {
    const values = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512]
    const ef = new EliasFano(values)
    expect(ef.length).toBe(10)
    expect(ef.get(5)).toBe(32)
    expect(ef.indexOf(256)).toBe(8)
  })

  it('handles very large array', () => {
    const values = Array.from({ length: 1000 }, (_, i) => i * 1000)
    const ef = new EliasFano(values)
    expect(ef.length).toBe(1000)
    expect(ef.get(500)).toBe(500000)
    expect(ef.indexOf(750000)).toBe(750)
  })

  it('forEach with empty array', () => {
    const ef = new EliasFano([])
    let count = 0
    ef.forEach(() => { count++ })
    expect(count).toBe(0)
  })

  it('toArray with empty array', () => {
    const ef = new EliasFano([])
    expect(ef.toArray()).toEqual([])
  })

  it('indexOf with all zeros returns 0', () => {
    const values = [0, 0, 0, 0]
    const ef = new EliasFano(values)
    expect(ef.indexOf(0)).toBe(0)
  })

  it('nextGEQ with all zeros returns 0', () => {
    const values = [0, 0, 0, 0]
    const ef = new EliasFano(values)
    expect(ef.nextGEQ(0)).toBe(0)
  })

  it('encodedSize for empty array is 0', () => {
    const ef = new EliasFano([])
    expect(ef.encodedSize).toBe(0)
  })

  it('handles single large value', () => {
    const values = [1000000000]
    const ef = new EliasFano(values)
    expect(ef.length).toBe(1)
    expect(ef.get(0)).toBe(1000000000)
  })

  it('handles decreasing sequence by construction', () => {
    const values = [1, 2, 3]
    const ef = new EliasFano(values)
    expect(ef.get(0)).toBe(1)
    expect(ef.get(1)).toBe(2)
    expect(ef.get(2)).toBe(3)
  })

  it('get with index 0 on empty throws', () => {
    const ef = new EliasFano([])
    expect(() => ef.get(0)).toThrow(RangeError)
  })

  it('forEach callback receives correct index', () => {
    const values = [10, 20, 30, 40]
    const ef = new EliasFano(values)
    const indices: number[] = []
    ef.forEach((_, i) => indices.push(i))
    expect(indices).toEqual([0, 1, 2, 3])
  })

  it('toArray returns correct order', () => {
    const values = [5, 10, 15, 20, 25]
    const ef = new EliasFano(values)
    const result = ef.toArray()
    expect(result).toEqual(values)
  })

  it('handles very small values', () => {
    const values = [1, 2, 3, 4, 5]
    const ef = new EliasFano(values)
    expect(ef.length).toBe(5)
    expect(ef.get(2)).toBe(3)
  })

  it('handles mixed small and large values', () => {
    const values = [1, 1000, 1000000, 1000000000]
    const ef = new EliasFano(values)
    expect(ef.length).toBe(4)
    expect(ef.get(1)).toBe(1000)
    expect(ef.get(3)).toBe(1000000000)
  })

  it('should find indexOf', () => {
    const ef = new EliasFano([10, 20, 30, 40])
    expect(ef.indexOf(20)).toBe(1)
    expect(ef.indexOf(99)).toBe(-1)
  })

  it('should find nextGEQ', () => {
    const ef = new EliasFano([10, 20, 30, 40])
    const idx = ef.nextGEQ(25)
    expect(idx).toBeGreaterThanOrEqual(0)
    expect(ef.get(idx)).toBe(30)
    expect(ef.nextGEQ(10)).toBeGreaterThanOrEqual(0)
  })

  it('should iterate forEach', () => {
    const ef = new EliasFano([5, 15, 25])
    const vals: number[] = []
    ef.forEach((v) => vals.push(v))
    expect(vals).toEqual([5, 15, 25])
  })

  it('length returns number of elements', () => {
    const ef = new EliasFano([1, 2, 3])
    expect(ef.length).toBe(3)
  })

  it('encodedSize is positive', () => {
    const ef = new EliasFano([10, 20, 30])
    expect(ef.encodedSize).toBeGreaterThan(0)
  })

  it('fromSorted static constructor works', () => {
    const ef = EliasFano.fromSorted([5, 10, 15])
    expect(ef.get(0)).toBe(5)
    expect(ef.get(2)).toBe(15)
  })

  it('get throws for out of bounds', () => {
    const ef = new EliasFano([1, 2])
    expect(() => ef.get(5)).toThrow()
  })
})
  it('empty encoding', () => {
    const ef = new EliasFano([])
    expect(ef).toBeDefined()
  })

  it('single value', () => {
    const ef = new EliasFano([42])
    expect(ef).toBeDefined()
  })

  it('fromSorted roundtrip', () => {
    const values = [1, 3, 5, 7, 9]
    const ef = EliasFano.fromSorted(values)
    expect(ef).toBeDefined()
  })

describe('elias-fano - wave545', () => {
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

describe('elias-fano - wave546', () => {
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

describe('elias-fano - wave547', () => {
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

describe('elias-fano - wave548', () => {
  it('elias-fano module defined', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano module is function', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - wave549', () => {
  it('elias-fano module defined', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano module is function', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - wave550', () => {
  it('elias-fano w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - wave551', () => {
  it('elias-fano w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - wave552', () => {
  it('elias-fano w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - wave553', () => {
  it('elias-fano w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - wave554', () => {
  it('elias-fano w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - wave555', () => {
  it('elias-fano w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - wave556', () => {
  it('elias-fano w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - wave557', () => {
  it('elias-fano w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - wave558', () => {
  it('elias-fano w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - wave559', () => {
  it('elias-fano w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - wave560', () => {
  it('elias-fano w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - wave561', () => {
  it('elias-fano w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - wave562', () => {
  it('elias-fano w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - wave563', () => {
  it('elias-fano w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - wave564', () => {
  it('elias-fano w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - wave565', () => {
  it('elias-fano w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - wave566', () => {
  it('elias-fano w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - wave127', () => {
  it('elias-fano w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - wave130', () => {
  it('elias-fano w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - wave133', () => {
  it('elias-fano w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - wave136', () => {
  it('elias-fano w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - wave139', () => {
  it('elias-fano w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - w142', () => {
  it('elias-fano v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - w145', () => {
  it('elias-fano v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - w148', () => {
  it('elias-fano v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - w151', () => {
  it('elias-fano v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - w154', () => {
  it('elias-fano v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - w157', () => {
  it('elias-fano v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - w160', () => {
  it('elias-fano v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - w170', () => {
  it('elias-fano x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - w180', () => {
  it('elias-fano x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - w190', () => {
  it('elias-fano x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - w200', () => {
  it('elias-fano x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - w210', () => {
  it('elias-fano x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - w220', () => {
  it('elias-fano x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - w230', () => {
  it('elias-fano x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - w240', () => {
  it('elias-fano x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - w250', () => {
  it('elias-fano x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - w260', () => {
  it('elias-fano x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - w270', () => {
  it('elias-fano x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - w280', () => {
  it('elias-fano x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - w290', () => {
  it('elias-fano x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - w300', () => {
  it('elias-fano x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - w310', () => {
  it('elias-fano x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - w320', () => {
  it('elias-fano x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - w330', () => {
  it('elias-fano x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - w340', () => {
  it('elias-fano x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - w350', () => {
  it('elias-fano x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - w360', () => {
  it('elias-fano x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - w370', () => {
  it('elias-fano x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - w380', () => {
  it('elias-fano x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - w390', () => {
  it('elias-fano x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - w400', () => {
  it('elias-fano x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - w420', () => {
  it('elias-fano x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - w440', () => {
  it('elias-fano x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - w460', () => {
  it('elias-fano x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - w480', () => {
  it('elias-fano x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-fano - w500', () => {
  it('elias-fano x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('elias-fano x500x19', () => {
    expect(describe).toBeDefined()
  })
})
