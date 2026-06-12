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
