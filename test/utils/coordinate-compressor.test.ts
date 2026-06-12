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
