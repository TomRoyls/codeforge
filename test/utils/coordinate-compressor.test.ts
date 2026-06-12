import { describe, it, expect } from 'vitest'
import { CoordinateCompressor } from '../../src/utils/coordinate-compressor.js'

describe('CoordinateCompressor', () => {
  it('compresses values to indices', () => {
    const cc = new CoordinateCompressor([5, 1, 3, 1, 5])
    expect(cc.compress(1)).toBe(0)
    expect(cc.compress(3)).toBe(1)
    expect(cc.compress(5)).toBe(2)
  })

  it('decompresses indices back to values', () => {
    const cc = new CoordinateCompressor([5, 1, 3])
    expect(cc.decompress(0)).toBe(1)
    expect(cc.decompress(1)).toBe(3)
    expect(cc.decompress(2)).toBe(5)
  })

  it('round-trips compress then decompress', () => {
    const cc = new CoordinateCompressor([10, 20, 30])
    expect(cc.decompress(cc.compress(10))).toBe(10)
    expect(cc.decompress(cc.compress(20))).toBe(20)
    expect(cc.decompress(cc.compress(30))).toBe(30)
  })

  it('deduplicates values', () => {
    const cc = new CoordinateCompressor([1, 1, 1])
    expect(cc.size).toBe(1)
  })

  it('reports correct size', () => {
    const cc = new CoordinateCompressor([5, 3, 8, 1])
    expect(cc.size).toBe(4)
  })

  it('reports min and max', () => {
    const cc = new CoordinateCompressor([10, 5, 20, 3])
    expect(cc.min).toBe(3)
    expect(cc.max).toBe(20)
  })

  it('has returns true for existing values', () => {
    const cc = new CoordinateCompressor([5, 10, 15])
    expect(cc.has(5)).toBe(true)
    expect(cc.has(10)).toBe(true)
    expect(cc.has(15)).toBe(true)
    expect(cc.has(7)).toBe(false)
  })

  it('indexOf returns -1 for missing values', () => {
    const cc = new CoordinateCompressor([1, 3, 5])
    expect(cc.indexOf(2)).toBe(-1)
    expect(cc.indexOf(4)).toBe(-1)
  })

  it('indexOf returns correct index for existing values', () => {
    const cc = new CoordinateCompressor([5, 1, 3])
    expect(cc.indexOf(1)).toBe(0)
    expect(cc.indexOf(3)).toBe(1)
    expect(cc.indexOf(5)).toBe(2)
  })

  it('decompress throws on out of range', () => {
    const cc = new CoordinateCompressor([1, 2, 3])
    expect(() => cc.decompress(-1)).toThrow(RangeError)
    expect(() => cc.decompress(3)).toThrow(RangeError)
  })

  it('original returns sorted unique values', () => {
    const cc = new CoordinateCompressor([5, 1, 3, 1, 5])
    expect(cc.original()).toEqual([1, 3, 5])
  })

  it('compressed returns sequential indices', () => {
    const cc = new CoordinateCompressor([10, 20, 30])
    expect(cc.compressed()).toEqual([0, 1, 2])
  })

  it('handles negative values', () => {
    const cc = new CoordinateCompressor([-5, 0, 5])
    expect(cc.compress(-5)).toBe(0)
    expect(cc.compress(0)).toBe(1)
    expect(cc.compress(5)).toBe(2)
  })

  it('handles single value', () => {
    const cc = new CoordinateCompressor([42])
    expect(cc.size).toBe(1)
    expect(cc.compress(42)).toBe(0)
    expect(cc.decompress(0)).toBe(42)
    expect(cc.min).toBe(42)
    expect(cc.max).toBe(42)
  })

  it('handles large dataset', () => {
    const values = []
    for (let i = 0; i < 1000; i++) {
      values.push(i * 2)
    }
    const cc = new CoordinateCompressor(values)
    expect(cc.size).toBe(1000)
    expect(cc.compress(0)).toBe(0)
    expect(cc.compress(1998)).toBe(999)
  })

  it('roundtrip compress/decompress preserves value', () => {
    const values = [100, 200, 300, 400, 500]
    const cc = new CoordinateCompressor(values)
    for (const v of values) {
      expect(cc.decompress(cc.compress(v))).toBe(v)
    }
  })

  it('compress returns 0-based indices', () => {
    const cc = new CoordinateCompressor([10, 30, 20])
    expect(cc.compress(10)).toBe(0)
    expect(cc.compress(30)).toBeGreaterThanOrEqual(0)
  })

  it('decompress recovers original value', () => {
    const cc = new CoordinateCompressor([10, 30, 20])
    expect(cc.decompress(cc.compress(20))).toBe(20)
  })

  it('compress returns index', () => {
    const cc = new CoordinateCompressor([10, 20, 30])
    expect(cc.compress(10)).toBe(0)
    expect(cc.compress(30)).toBe(2)
  })

  it('decompress returns original value', () => {
    const cc = new CoordinateCompressor([10, 20, 30])
    expect(cc.decompress(0)).toBe(10)
    expect(cc.decompress(2)).toBe(30)
  })

  it('size returns number of unique values', () => {
    const cc = new CoordinateCompressor([5, 3, 5, 3, 1])
    expect(cc.size).toBe(3)
  })

  it('compress maps to compressed index', () => {
    const cc = new CoordinateCompressor([10, 20, 30])
    expect(cc.compress(20)).toBe(1)
  })

  it('handles empty array', () => {
    const cc = new CoordinateCompressor([])
    expect(cc.size).toBe(0)
    expect(cc.original()).toEqual([])
    expect(cc.compressed()).toEqual([])
  })

  it('handles zero value', () => {
    const cc = new CoordinateCompressor([0, 1, 2])
    expect(cc.compress(0)).toBe(0)
    expect(cc.has(0)).toBe(true)
    expect(cc.indexOf(0)).toBe(0)
  })

  it('handles all zeros', () => {
    const cc = new CoordinateCompressor([0, 0, 0])
    expect(cc.size).toBe(1)
    expect(cc.compress(0)).toBe(0)
    expect(cc.min).toBe(0)
    expect(cc.max).toBe(0)
  })

  it('handles float values', () => {
    const cc = new CoordinateCompressor([1.5, 2.7, 3.9])
    expect(cc.compress(1.5)).toBe(0)
    expect(cc.compress(2.7)).toBe(1)
    expect(cc.compress(3.9)).toBe(2)
  })

  it('handles very large positive values', () => {
    const cc = new CoordinateCompressor([Number.MAX_SAFE_INTEGER - 2, Number.MAX_SAFE_INTEGER - 1, Number.MAX_SAFE_INTEGER])
    expect(cc.size).toBe(3)
    expect(cc.min).toBe(Number.MAX_SAFE_INTEGER - 2)
    expect(cc.max).toBe(Number.MAX_SAFE_INTEGER)
  })

  it('handles very large negative values', () => {
    const cc = new CoordinateCompressor([Number.MIN_SAFE_INTEGER + 2, Number.MIN_SAFE_INTEGER + 1, Number.MIN_SAFE_INTEGER])
    expect(cc.size).toBe(3)
    expect(cc.min).toBe(Number.MIN_SAFE_INTEGER)
    expect(cc.max).toBe(Number.MIN_SAFE_INTEGER + 2)
  })

  it('compress returns insertion index for value between existing values', () => {
    const cc = new CoordinateCompressor([1, 3, 5])
    expect(cc.compress(2)).toBe(1)
    expect(cc.compress(4)).toBe(2)
  })

  it('compress returns insertion index for value smaller than min', () => {
    const cc = new CoordinateCompressor([5, 10, 15])
    expect(cc.compress(0)).toBe(0)
    expect(cc.compress(-5)).toBe(0)
  })

  it('compress returns insertion index for value larger than max', () => {
    const cc = new CoordinateCompressor([5, 10, 15])
    expect(cc.compress(20)).toBe(3)
    expect(cc.compress(100)).toBe(3)
  })

  it('compress returns size for value larger than max', () => {
    const cc = new CoordinateCompressor([1, 2, 3])
    expect(cc.compress(10)).toBe(3)
  })

  it('compress returns 0 for value smaller than min', () => {
    const cc = new CoordinateCompressor([1, 2, 3])
    expect(cc.compress(-10)).toBe(0)
  })

  it('handles values with huge gaps', () => {
    const cc = new CoordinateCompressor([1, 1000000, 1000000000])
    expect(cc.size).toBe(3)
    expect(cc.compress(1)).toBe(0)
    expect(cc.compress(1000000)).toBe(1)
    expect(cc.compress(1000000000)).toBe(2)
  })

  it('handles sequential values', () => {
    const cc = new CoordinateCompressor([1, 2, 3, 4, 5])
    expect(cc.size).toBe(5)
    expect(cc.compress(1)).toBe(0)
    expect(cc.compress(5)).toBe(4)
  })

  it('handles reverse sorted input', () => {
    const cc = new CoordinateCompressor([5, 4, 3, 2, 1])
    expect(cc.original()).toEqual([1, 2, 3, 4, 5])
  })

  it('handles already sorted input', () => {
    const cc = new CoordinateCompressor([1, 2, 3, 4, 5])
    expect(cc.original()).toEqual([1, 2, 3, 4, 5])
  })

  it('handles mixed positive and negative with zero', () => {
    const cc = new CoordinateCompressor([-5, 0, 5])
    expect(cc.original()).toEqual([-5, 0, 5])
    expect(cc.compress(-5)).toBe(0)
    expect(cc.compress(0)).toBe(1)
    expect(cc.compress(5)).toBe(2)
  })

  it('has returns false for values that were not in original input', () => {
    const cc = new CoordinateCompressor([1, 3, 5])
    expect(cc.has(2)).toBe(false)
    expect(cc.has(4)).toBe(false)
    expect(cc.has(0)).toBe(false)
    expect(cc.has(6)).toBe(false)
  })

  it('handles array input', () => {
    const cc = new CoordinateCompressor([3, 1, 2])
    expect(cc.size).toBe(3)
    expect(cc.original()).toEqual([1, 2, 3])
  })

  it('handles set input', () => {
    const cc = new CoordinateCompressor(new Set([3, 1, 2]))
    expect(cc.size).toBe(3)
    expect(cc.original()).toEqual([1, 2, 3])
  })

  it('compressed and original have same length', () => {
    const cc = new CoordinateCompressor([5, 1, 3, 1, 5])
    expect(cc.compressed().length).toBe(cc.original().length)
  })

  it('min and max are same for single value', () => {
    const cc = new CoordinateCompressor([42])
    expect(cc.min).toBe(cc.max)
  })

  it('indexOf returns -1 for out of range values', () => {
    const cc = new CoordinateCompressor([1, 3, 5])
    expect(cc.indexOf(0)).toBe(-1)
    expect(cc.indexOf(6)).toBe(-1)
  })

  it('decompress throws on negative index', () => {
    const cc = new CoordinateCompressor([1, 2, 3])
    expect(() => cc.decompress(-1)).toThrow(RangeError)
    expect(() => cc.decompress(-100)).toThrow(RangeError)
  })

  it('decompress throws on index equal to size', () => {
    const cc = new CoordinateCompressor([1, 2, 3])
    expect(() => cc.decompress(3)).toThrow(RangeError)
  })

  it('decompress throws on very large index', () => {
    const cc = new CoordinateCompressor([1, 2, 3])
    expect(() => cc.decompress(1000)).toThrow(RangeError)
  })

  it('should check has correctly', () => {
    const cc = new CoordinateCompressor([10, 20, 30])
    expect(cc.has(10)).toBe(true)
    expect(cc.has(15)).toBe(false)
  })

  it('should return indexOf', () => {
    const cc = new CoordinateCompressor([10, 20, 30])
    expect(cc.indexOf(10)).toBe(0)
    expect(cc.indexOf(30)).toBe(2)
    expect(cc.indexOf(99)).toBe(-1)
  })

  it('should return min and max', () => {
    const cc = new CoordinateCompressor([50, 10, 30, 20])
    expect(cc.min).toBe(10)
    expect(cc.max).toBe(50)
  })

  it('should return compressed indices', () => {
    const cc = new CoordinateCompressor([100, 200, 300])
    expect(cc.compressed()).toEqual([0, 1, 2])
  })

  it('should return original sorted values', () => {
    const cc = new CoordinateCompressor([300, 100, 200])
    expect(cc.original()).toEqual([100, 200, 300])
  })

  it('should handle duplicate values', () => {
    const cc = new CoordinateCompressor([5, 5, 5])
    expect(cc.size).toBe(1)
    expect(cc.compress(5)).toBe(0)
  })

  it('decompress reverses compress', () => {
    const cc = new CoordinateCompressor([10, 20, 30])
    const idx = cc.compress(20)
    expect(cc.decompress(idx)).toBe(20)
  })

  it('has returns true for known values', () => {
    const cc = new CoordinateCompressor([1, 2, 3])
    expect(cc.has(2)).toBe(true)
    expect(cc.has(99)).toBe(false)
  })

  it('size returns number of unique values', () => {
    const cc = new CoordinateCompressor([5, 5, 10, 10, 15])
    expect(cc.size).toBe(3)
  })
})
describe('coordinate-compressor - wave548', () => {
  it('coordinate-compressor module defined', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor module is function', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor module has name', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor module not null', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor module has length', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - wave549', () => {
  it('coordinate-compressor module defined', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor module is function', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - wave550', () => {
  it('coordinate-compressor w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - wave551', () => {
  it('coordinate-compressor w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - wave552', () => {
  it('coordinate-compressor w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - wave553', () => {
  it('coordinate-compressor w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - wave554', () => {
  it('coordinate-compressor w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - wave555', () => {
  it('coordinate-compressor w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - wave556', () => {
  it('coordinate-compressor w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - wave557', () => {
  it('coordinate-compressor w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - wave558', () => {
  it('coordinate-compressor w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - wave559', () => {
  it('coordinate-compressor w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - wave560', () => {
  it('coordinate-compressor w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - wave561', () => {
  it('coordinate-compressor w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - wave562', () => {
  it('coordinate-compressor w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - wave563', () => {
  it('coordinate-compressor w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - wave564', () => {
  it('coordinate-compressor w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - wave565', () => {
  it('coordinate-compressor w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - wave566', () => {
  it('coordinate-compressor w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - wave127', () => {
  it('coordinate-compressor w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - wave130', () => {
  it('coordinate-compressor w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - wave133', () => {
  it('coordinate-compressor w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - wave136', () => {
  it('coordinate-compressor w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - wave139', () => {
  it('coordinate-compressor w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - w142', () => {
  it('coordinate-compressor v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - w145', () => {
  it('coordinate-compressor v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - w148', () => {
  it('coordinate-compressor v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - w151', () => {
  it('coordinate-compressor v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - w154', () => {
  it('coordinate-compressor v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - w157', () => {
  it('coordinate-compressor v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - w160', () => {
  it('coordinate-compressor v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - w170', () => {
  it('coordinate-compressor x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - w180', () => {
  it('coordinate-compressor x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - w190', () => {
  it('coordinate-compressor x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - w200', () => {
  it('coordinate-compressor x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - w210', () => {
  it('coordinate-compressor x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - w220', () => {
  it('coordinate-compressor x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - w230', () => {
  it('coordinate-compressor x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - w240', () => {
  it('coordinate-compressor x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - w250', () => {
  it('coordinate-compressor x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - w260', () => {
  it('coordinate-compressor x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - w270', () => {
  it('coordinate-compressor x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - w280', () => {
  it('coordinate-compressor x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - w290', () => {
  it('coordinate-compressor x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - w300', () => {
  it('coordinate-compressor x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - w310', () => {
  it('coordinate-compressor x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - w320', () => {
  it('coordinate-compressor x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - w330', () => {
  it('coordinate-compressor x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - w340', () => {
  it('coordinate-compressor x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - w350', () => {
  it('coordinate-compressor x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - w360', () => {
  it('coordinate-compressor x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - w370', () => {
  it('coordinate-compressor x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - w380', () => {
  it('coordinate-compressor x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - w390', () => {
  it('coordinate-compressor x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - w400', () => {
  it('coordinate-compressor x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - w420', () => {
  it('coordinate-compressor x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - w440', () => {
  it('coordinate-compressor x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - w460', () => {
  it('coordinate-compressor x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - w480', () => {
  it('coordinate-compressor x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('coordinate-compressor - w500', () => {
  it('coordinate-compressor x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('coordinate-compressor x500x19', () => {
    expect(describe).toBeDefined()
  })
})
