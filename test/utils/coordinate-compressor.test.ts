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

  it('indexOf returns -1 for absent value', () => {
    const cc = new CoordinateCompressor([1, 3, 5])
    expect(cc.indexOf(2)).toBe(-1)
  })

  it('roundtrip compress/decompress preserves value', () => {
    const values = [100, 200, 300, 400, 500]
    const cc = new CoordinateCompressor(values)
    for (const v of values) {
      expect(cc.decompress(cc.compress(v))).toBe(v)
    }
  })
})
