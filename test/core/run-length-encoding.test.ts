import { describe, it, expect, beforeEach } from 'vitest'
import { RLE } from '../../src/core/run-length-encoding/run-length-encoding.js'
import type { Run } from '../../src/core/run-length-encoding/types.js'

describe('RLE', () => {
  let rle: RLE<number>

  beforeEach(() => {
    rle = new RLE<number>()
  })

  describe('constructor', () => {
    it('should create an empty RLE instance', () => {
      const r = new RLE<number>()
      expect(r.getRuns()).toEqual([])
      expect(r.getLength()).toBe(0)
    })

    it('should support generic type parameter', () => {
      const strRle = new RLE<string>()
      expect(strRle.getRuns()).toEqual([])
    })

    it('should support object type parameter', () => {
      const objRle = new RLE<{ id: number }>()
      expect(objRle.getRuns()).toEqual([])
    })

    it('should default to unknown type', () => {
      const defaultRle = new RLE()
      expect(defaultRle.getRuns()).toEqual([])
    })
  })

  describe('encode', () => {
    it('should encode an empty array', () => {
      expect(rle.encode([])).toEqual([])
    })

    it('should encode a single element', () => {
      expect(rle.encode([5])).toEqual([{ value: 5, count: 1 }])
    })

    it('should encode consecutive identical elements', () => {
      expect(rle.encode([1, 1, 1, 1])).toEqual([{ value: 1, count: 4 }])
    })

    it('should encode alternating elements', () => {
      expect(rle.encode([1, 2, 1, 2])).toEqual([
        { value: 1, count: 1 },
        { value: 2, count: 1 },
        { value: 1, count: 1 },
        { value: 2, count: 1 },
      ])
    })

    it('should encode mixed runs', () => {
      expect(rle.encode([1, 1, 2, 2, 2, 3])).toEqual([
        { value: 1, count: 2 },
        { value: 2, count: 3 },
        { value: 3, count: 1 },
      ])
    })

    it('should encode all same elements for max compression', () => {
      const data = Array(100).fill(7)
      const runs = rle.encode(data)
      expect(runs).toEqual([{ value: 7, count: 100 }])
    })

    it('should encode alternating elements for worst compression', () => {
      const data = [1, 2, 1, 2, 1, 2]
      const runs = rle.encode(data)
      expect(runs.length).toBe(6)
    })

    it('should encode string arrays', () => {
      const strRle = new RLE<string>()
      const runs = strRle.encode(['a', 'a', 'b', 'c', 'c', 'c'])
      expect(runs).toEqual([
        { value: 'a', count: 2 },
        { value: 'b', count: 1 },
        { value: 'c', count: 3 },
      ])
    })

    it('should encode boolean arrays', () => {
      const boolRle = new RLE<boolean>()
      const runs = boolRle.encode([true, true, false, false, true])
      expect(runs).toEqual([
        { value: true, count: 2 },
        { value: false, count: 2 },
        { value: true, count: 1 },
      ])
    })

    it('should encode arrays with null values', () => {
      const nullRle = new RLE<number | null>()
      const runs = nullRle.encode([null, null, 1, null])
      expect(runs).toEqual([
        { value: null, count: 2 },
        { value: 1, count: 1 },
        { value: null, count: 1 },
      ])
    })

    it('should encode arrays with zero values', () => {
      expect(rle.encode([0, 0, 0, 1, 0])).toEqual([
        { value: 0, count: 3 },
        { value: 1, count: 1 },
        { value: 0, count: 1 },
      ])
    })

    it('should encode negative numbers', () => {
      expect(rle.encode([-1, -1, -2])).toEqual([
        { value: -1, count: 2 },
        { value: -2, count: 1 },
      ])
    })

    it('should encode floating point numbers', () => {
      expect(rle.encode([1.5, 1.5, 2.5])).toEqual([
        { value: 1.5, count: 2 },
        { value: 2.5, count: 1 },
      ])
    })

    it('should encode object arrays by reference', () => {
      const obj = { id: 1 }
      const objRle = new RLE<{ id: number }>()
      const runs = objRle.encode([obj, obj, obj])
      expect(runs).toEqual([{ value: obj, count: 3 }])
    })

    it('should store encoded runs internally', () => {
      rle.encode([1, 1, 2])
      expect(rle.getRuns()).toEqual([
        { value: 1, count: 2 },
        { value: 2, count: 1 },
      ])
    })

    it('should replace previous encoding on subsequent calls', () => {
      rle.encode([1, 1, 1])
      rle.encode([2, 2])
      expect(rle.getRuns()).toEqual([{ value: 2, count: 2 }])
    })

    it('should return a copy of runs', () => {
      const runs = rle.encode([1, 1])
      runs[0]!.count = 99
      expect(rle.getRuns()[0]!.count).toBe(2)
    })
  })

  describe('decode', () => {
    it('should decode empty runs', () => {
      expect(rle.decode([])).toEqual([])
    })

    it('should decode a single run', () => {
      expect(rle.decode([{ value: 5, count: 3 }])).toEqual([5, 5, 5])
    })

    it('should decode multiple runs', () => {
      const runs: Run<number>[] = [
        { value: 1, count: 2 },
        { value: 2, count: 3 },
        { value: 3, count: 1 },
      ]
      expect(rle.decode(runs)).toEqual([1, 1, 2, 2, 2, 3])
    })

    it('should decode single-element runs', () => {
      const runs: Run<number>[] = [
        { value: 1, count: 1 },
        { value: 2, count: 1 },
      ]
      expect(rle.decode(runs)).toEqual([1, 2])
    })

    it('should decode string runs', () => {
      const strRle = new RLE<string>()
      const runs: Run<string>[] = [
        { value: 'a', count: 3 },
        { value: 'b', count: 2 },
      ]
      expect(strRle.decode(runs)).toEqual(['a', 'a', 'a', 'b', 'b'])
    })

    it('should decode runs with count of 0', () => {
      const runs: Run<number>[] = [
        { value: 1, count: 0 },
        { value: 2, count: 2 },
      ]
      expect(rle.decode(runs)).toEqual([2, 2])
    })

    it('should store decoded runs internally', () => {
      rle.decode([{ value: 1, count: 2 }])
      expect(rle.getRuns()).toEqual([{ value: 1, count: 2 }])
    })

    it('should roundtrip encode/decode', () => {
      const original = [1, 1, 1, 2, 2, 3, 4, 4, 4, 4]
      const runs = rle.encode(original)
      const rle2 = new RLE<number>()
      const decoded = rle2.decode(runs)
      expect(decoded).toEqual(original)
    })

    it('should roundtrip encode/decode with strings', () => {
      const strRle = new RLE<string>()
      const original = ['x', 'x', 'y', 'z', 'z', 'z']
      const runs = strRle.encode(original)
      const rle2 = new RLE<string>()
      const decoded = rle2.decode(runs)
      expect(decoded).toEqual(original)
    })
  })

  describe('encodeString', () => {
    it('should encode an empty string', () => {
      expect(RLE.encodeString('')).toBe('')
    })

    it('should encode a single character', () => {
      expect(RLE.encodeString('A')).toBe('[1]A')
    })

    it('should encode repeated characters', () => {
      expect(RLE.encodeString('AAAA')).toBe('[4]A')
    })

    it('should encode mixed characters', () => {
      expect(RLE.encodeString('AABBC')).toBe('[2]A[2]B[1]C')
    })

    it('should encode a string with no repeats', () => {
      expect(RLE.encodeString('ABC')).toBe('[1]A[1]B[1]C')
    })

    it('should encode all same characters', () => {
      expect(RLE.encodeString('ZZZZZZ')).toBe('[6]Z')
    })

    it('should encode a long repeated string', () => {
      const str = 'A'.repeat(100)
      expect(RLE.encodeString(str)).toBe('[100]A')
    })

    it('should encode strings with spaces', () => {
      expect(RLE.encodeString('A   B')).toBe('[1]A[3] [1]B')
    })

    it('should encode strings with special characters', () => {
      expect(RLE.encodeString('!!!')).toBe('[3]!')
    })
  })

  describe('decodeString', () => {
    it('should decode an empty string', () => {
      expect(RLE.decodeString('')).toBe('')
    })

    it('should decode a single character encoding', () => {
      expect(RLE.decodeString('[1]A')).toBe('A')
    })

    it('should decode repeated characters', () => {
      expect(RLE.decodeString('[4]A')).toBe('AAAA')
    })

    it('should decode mixed characters', () => {
      expect(RLE.decodeString('[2]A[2]B[1]C')).toBe('AABBC')
    })

    it('should decode a long repeated encoding', () => {
      expect(RLE.decodeString('[100]A')).toBe('A'.repeat(100))
    })

    it('should decode strings with spaces', () => {
      expect(RLE.decodeString('[1]A[3] [1]B')).toBe('A   B')
    })

    it('should roundtrip string encode/decode', () => {
      const original = 'AAABBBCCD'
      const encoded = RLE.encodeString(original)
      const decoded = RLE.decodeString(encoded)
      expect(decoded).toBe(original)
    })

    it('should roundtrip complex string', () => {
      const original = 'A quick brown fox'
      const encoded = RLE.encodeString(original)
      const decoded = RLE.decodeString(encoded)
      expect(decoded).toBe(original)
    })

    it('should roundtrip single character', () => {
      const encoded = RLE.encodeString('X')
      expect(RLE.decodeString(encoded)).toBe('X')
    })
  })

  describe('encodeBytes', () => {
    it('should encode empty byte array', () => {
      expect(RLE.encodeBytes([])).toEqual([])
    })

    it('should encode single byte', () => {
      expect(RLE.encodeBytes([255])).toEqual([{ value: 255, count: 1 }])
    })

    it('should encode repeated bytes', () => {
      expect(RLE.encodeBytes([0, 0, 0, 0])).toEqual([{ value: 0, count: 4 }])
    })

    it('should encode mixed byte runs', () => {
      expect(RLE.encodeBytes([1, 1, 2, 2, 2, 3])).toEqual([
        { value: 1, count: 2 },
        { value: 2, count: 3 },
        { value: 3, count: 1 },
      ])
    })

    it('should encode byte sequence with no repeats', () => {
      const data = [1, 2, 3, 4, 5]
      const runs = RLE.encodeBytes(data)
      expect(runs.length).toBe(5)
      expect(runs.every(r => r.count === 1)).toBe(true)
    })

    it('should encode all zero bytes', () => {
      const data = Array(50).fill(0)
      expect(RLE.encodeBytes(data)).toEqual([{ value: 0, count: 50 }])
    })

    it('should encode max byte values', () => {
      expect(RLE.encodeBytes([255, 255, 254])).toEqual([
        { value: 255, count: 2 },
        { value: 254, count: 1 },
      ])
    })
  })

  describe('decodeBytes', () => {
    it('should decode empty runs', () => {
      expect(RLE.decodeBytes([])).toEqual([])
    })

    it('should decode single run', () => {
      expect(RLE.decodeBytes([{ value: 42, count: 3 }])).toEqual([42, 42, 42])
    })

    it('should decode multiple runs', () => {
      const runs = [
        { value: 1, count: 2 },
        { value: 2, count: 3 },
      ]
      expect(RLE.decodeBytes(runs)).toEqual([1, 1, 2, 2, 2])
    })

    it('should roundtrip byte encode/decode', () => {
      const original = [0, 0, 0, 1, 1, 255, 255, 255, 255]
      const encoded = RLE.encodeBytes(original)
      const decoded = RLE.decodeBytes(encoded)
      expect(decoded).toEqual(original)
    })

    it('should roundtrip byte array with no repeats', () => {
      const original = [1, 2, 3, 4, 5, 6, 7, 8]
      const encoded = RLE.encodeBytes(original)
      const decoded = RLE.decodeBytes(encoded)
      expect(decoded).toEqual(original)
    })
  })

  describe('getRuns', () => {
    it('should return empty array before encoding', () => {
      expect(rle.getRuns()).toEqual([])
    })

    it('should return the run representation', () => {
      rle.encode([1, 1, 2, 3, 3])
      expect(rle.getRuns()).toEqual([
        { value: 1, count: 2 },
        { value: 2, count: 1 },
        { value: 3, count: 2 },
      ])
    })

    it('should return a copy of runs', () => {
      rle.encode([1, 1])
      const runs = rle.getRuns()
      runs[0]!.count = 999
      expect(rle.getRuns()[0]!.count).toBe(2)
    })

    it('should reflect state after decode', () => {
      rle.decode([{ value: 5, count: 3 }])
      expect(rle.getRuns()).toEqual([{ value: 5, count: 3 }])
    })
  })

  describe('getLength', () => {
    it('should return 0 for empty encoding', () => {
      expect(rle.getLength()).toBe(0)
    })

    it('should return the total decoded length', () => {
      rle.encode([1, 1, 2, 3, 3, 3])
      expect(rle.getLength()).toBe(6)
    })

    it('should return correct length for single run', () => {
      rle.encode([5, 5, 5])
      expect(rle.getLength()).toBe(3)
    })

    it('should return correct length after decode', () => {
      rle.decode([{ value: 1, count: 10 }])
      expect(rle.getLength()).toBe(10)
    })

    it('should return 0 after encoding empty array', () => {
      rle.encode([])
      expect(rle.getLength()).toBe(0)
    })

    it('should handle large lengths', () => {
      rle.encode(Array(10000).fill(1))
      expect(rle.getLength()).toBe(10000)
    })
  })

  describe('getElementAt', () => {
    beforeEach(() => {
      rle.encode([1, 1, 2, 2, 2, 3])
    })

    it('should return element at valid index', () => {
      expect(rle.getElementAt(0)).toBe(1)
      expect(rle.getElementAt(1)).toBe(1)
      expect(rle.getElementAt(2)).toBe(2)
      expect(rle.getElementAt(5)).toBe(3)
    })

    it('should return undefined for negative index', () => {
      expect(rle.getElementAt(-1)).toBeUndefined()
    })

    it('should return undefined for index >= length', () => {
      expect(rle.getElementAt(6)).toBeUndefined()
    })

    it('should return undefined for empty encoding', () => {
      const empty = new RLE<number>()
      expect(empty.getElementAt(0)).toBeUndefined()
    })

    it('should return correct element at run boundaries', () => {
      expect(rle.getElementAt(1)).toBe(1)
      expect(rle.getElementAt(2)).toBe(2)
      expect(rle.getElementAt(4)).toBe(2)
      expect(rle.getElementAt(5)).toBe(3)
    })

    it('should work with single-element encoding', () => {
      const single = new RLE<number>()
      single.encode([42])
      expect(single.getElementAt(0)).toBe(42)
      expect(single.getElementAt(1)).toBeUndefined()
    })

    it('should work with large runs', () => {
      const big = new RLE<number>()
      big.encode(Array(1000).fill(7))
      expect(big.getElementAt(0)).toBe(7)
      expect(big.getElementAt(500)).toBe(7)
      expect(big.getElementAt(999)).toBe(7)
      expect(big.getElementAt(1000)).toBeUndefined()
    })
  })

  describe('getRunAt', () => {
    beforeEach(() => {
      rle.encode([1, 1, 2, 2, 2, 3])
    })

    it('should return the run containing the index', () => {
      expect(rle.getRunAt(0)).toEqual({ value: 1, count: 2 })
      expect(rle.getRunAt(1)).toEqual({ value: 1, count: 2 })
      expect(rle.getRunAt(2)).toEqual({ value: 2, count: 3 })
    })

    it('should return undefined for negative index', () => {
      expect(rle.getRunAt(-1)).toBeUndefined()
    })

    it('should return undefined for out of range index', () => {
      expect(rle.getRunAt(6)).toBeUndefined()
    })

    it('should return undefined for empty encoding', () => {
      const empty = new RLE<number>()
      expect(empty.getRunAt(0)).toBeUndefined()
    })

    it('should return a copy of the run', () => {
      const run = rle.getRunAt(0)!
      run.count = 999
      expect(rle.getRunAt(0)!.count).toBe(2)
    })

    it('should return last run for last index', () => {
      expect(rle.getRunAt(5)).toEqual({ value: 3, count: 1 })
    })
  })

  describe('slice', () => {
    beforeEach(() => {
      rle.encode([1, 1, 2, 2, 2, 3, 4, 4])
    })

    it('should slice within a single run', () => {
      expect(rle.slice(0, 2)).toEqual([1, 1])
    })

    it('should slice across multiple runs', () => {
      expect(rle.slice(1, 4)).toEqual([1, 2, 2])
    })

    it('should slice from beginning', () => {
      expect(rle.slice(0, 3)).toEqual([1, 1, 2])
    })

    it('should slice to end', () => {
      expect(rle.slice(5, 8)).toEqual([3, 4, 4])
    })

    it('should return empty array for invalid range', () => {
      expect(rle.slice(5, 3)).toEqual([])
    })

    it('should return empty array for out of range', () => {
      expect(rle.slice(10, 15)).toEqual([])
    })

    it('should handle negative start by clamping to 0', () => {
      expect(rle.slice(-2, 2)).toEqual([1, 1])
    })

    it('should handle end beyond length', () => {
      expect(rle.slice(6, 100)).toEqual([4, 4])
    })

    it('should return empty array for empty encoding', () => {
      const empty = new RLE<number>()
      expect(empty.slice(0, 5)).toEqual([])
    })

    it('should slice a single element', () => {
      expect(rle.slice(2, 3)).toEqual([2])
    })

    it('should slice entire data', () => {
      expect(rle.slice(0, 8)).toEqual([1, 1, 2, 2, 2, 3, 4, 4])
    })

    it('should not decompress fully', () => {
      const big = new RLE<number>()
      big.encode(Array(10000).fill(5))
      const sliced = big.slice(100, 105)
      expect(sliced).toEqual([5, 5, 5, 5, 5])
    })

    it('should slice within large runs correctly', () => {
      const big = new RLE<number>()
      big.encode([...Array(100).fill(1), ...Array(100).fill(2)])
      expect(big.slice(95, 105)).toEqual([1, 1, 1, 1, 1, 2, 2, 2, 2, 2])
    })
  })

  describe('compressRatio', () => {
    it('should return 1 for empty encoding', () => {
      expect(rle.compressRatio()).toBe(1)
    })

    it('should return ratio > 1 for compressible data', () => {
      rle.encode([1, 1, 1, 1, 1, 1])
      expect(rle.compressRatio()).toBe(3)
    })

    it('should return ratio < 1 for incompressible data', () => {
      rle.encode([1, 2, 3, 4])
      expect(rle.compressRatio()).toBe(0.5)
    })

    it('should return ratio = 1 for break-even data', () => {
      rle.encode([1, 1, 2, 2])
      expect(rle.compressRatio()).toBe(1)
    })

    it('should return high ratio for highly compressible data', () => {
      rle.encode(Array(100).fill(5))
      expect(rle.compressRatio()).toBe(50)
    })

    it('should calculate ratio after decode', () => {
      rle.decode([{ value: 1, count: 10 }])
      expect(rle.compressRatio()).toBe(5)
    })

    it('should return correct ratio for single element', () => {
      rle.encode([42])
      expect(rle.compressRatio()).toBe(0.5)
    })
  })

  describe('isCompressed', () => {
    it('should return false for empty encoding', () => {
      expect(rle.isCompressed()).toBe(false)
    })

    it('should return true for compressible data', () => {
      rle.encode([1, 1, 1, 1, 1])
      expect(rle.isCompressed()).toBe(true)
    })

    it('should return false for incompressible data', () => {
      rle.encode([1, 2, 3])
      expect(rle.isCompressed()).toBe(false)
    })

    it('should return false for break-even data', () => {
      rle.encode([1, 1])
      expect(rle.isCompressed()).toBe(false)
    })

    it('should return true for highly compressible data', () => {
      rle.encode(Array(100).fill(1))
      expect(rle.isCompressed()).toBe(true)
    })

    it('should return false for alternating data', () => {
      rle.encode([1, 2, 1, 2, 1, 2])
      expect(rle.isCompressed()).toBe(false)
    })
  })

  describe('concat', () => {
    it('should concat two non-overlapping RLEs', () => {
      rle.encode([1, 1, 2])
      const other = new RLE<number>()
      other.encode([3, 3])
      const result = rle.concat(other)
      expect(result.getRuns()).toEqual([
        { value: 1, count: 2 },
        { value: 2, count: 1 },
        { value: 3, count: 2 },
      ])
    })

    it('should merge adjacent runs with same value', () => {
      rle.encode([1, 1, 2])
      const other = new RLE<number>()
      other.encode([2, 2, 3])
      const result = rle.concat(other)
      expect(result.getRuns()).toEqual([
        { value: 1, count: 2 },
        { value: 2, count: 3 },
        { value: 3, count: 1 },
      ])
    })

    it('should concat empty RLE with non-empty', () => {
      const empty = new RLE<number>()
      rle.encode([1, 2])
      const result = empty.concat(rle)
      expect(result.getRuns()).toEqual([
        { value: 1, count: 1 },
        { value: 2, count: 1 },
      ])
    })

    it('should concat non-empty RLE with empty', () => {
      rle.encode([1, 2])
      const empty = new RLE<number>()
      const result = rle.concat(empty)
      expect(result.getRuns()).toEqual([
        { value: 1, count: 1 },
        { value: 2, count: 1 },
      ])
    })

    it('should concat two empty RLEs', () => {
      const empty1 = new RLE<number>()
      const empty2 = new RLE<number>()
      const result = empty1.concat(empty2)
      expect(result.getRuns()).toEqual([])
    })

    it('should not modify original RLEs', () => {
      rle.encode([1, 1])
      const other = new RLE<number>()
      other.encode([2, 2])
      rle.concat(other)
      expect(rle.getRuns()).toEqual([{ value: 1, count: 2 }])
      expect(other.getRuns()).toEqual([{ value: 2, count: 2 }])
    })

    it('should return a new RLE instance', () => {
      rle.encode([1])
      const other = new RLE<number>()
      other.encode([2])
      const result = rle.concat(other)
      expect(result).not.toBe(rle)
      expect(result).not.toBe(other)
    })

    it('should compute correct total length', () => {
      rle.encode([1, 1, 1])
      const other = new RLE<number>()
      other.encode([2, 2])
      const result = rle.concat(other)
      expect(result.getLength()).toBe(5)
    })

    it('should handle merging single-element runs', () => {
      rle.encode([5])
      const other = new RLE<number>()
      other.encode([5, 5])
      const result = rle.concat(other)
      expect(result.getRuns()).toEqual([{ value: 5, count: 3 }])
    })

    it('should work with string type', () => {
      const str1 = new RLE<string>()
      str1.encode(['a', 'a'])
      const str2 = new RLE<string>()
      str2.encode(['b', 'b'])
      const result = str1.concat(str2)
      expect(result.getRuns()).toEqual([
        { value: 'a', count: 2 },
        { value: 'b', count: 2 },
      ])
    })
  })

  describe('iterator', () => {
    it('should iterate over empty encoding', () => {
      const runs: Run<number>[] = []
      for (const run of rle) {
        runs.push(run)
      }
      expect(runs).toEqual([])
    })

    it('should iterate over runs', () => {
      rle.encode([1, 1, 2, 3, 3])
      const runs: Run<number>[] = []
      for (const run of rle) {
        runs.push(run)
      }
      expect(runs).toEqual([
        { value: 1, count: 2 },
        { value: 2, count: 1 },
        { value: 3, count: 2 },
      ])
    })

    it('should work with spread operator', () => {
      rle.encode([1, 1, 2])
      const runs = [...rle]
      expect(runs).toEqual([
        { value: 1, count: 2 },
        { value: 2, count: 1 },
      ])
    })

    it('should return copies of runs', () => {
      rle.encode([1, 1])
      const runs = [...rle]
      runs[0]!.count = 999
      expect(rle.getRuns()[0]!.count).toBe(2)
    })

    it('should work with Array.from', () => {
      rle.encode([1, 2, 2])
      const runs = Array.from(rle)
      expect(runs).toEqual([
        { value: 1, count: 1 },
        { value: 2, count: 2 },
      ])
    })

    it('should work with for...of after decode', () => {
      rle.decode([{ value: 5, count: 3 }])
      const runs = [...rle]
      expect(runs).toEqual([{ value: 5, count: 3 }])
    })
  })

  describe('numeric data', () => {
    it('should handle integer arrays', () => {
      const data = [1, 1, 2, 3, 3, 3, 4]
      const runs = rle.encode(data)
      expect(rle.decode(runs)).toEqual(data)
    })

    it('should handle float arrays', () => {
      const floatRle = new RLE<number>()
      const data = [1.1, 1.1, 2.2, 3.3, 3.3]
      const runs = floatRle.encode(data)
      const rle2 = new RLE<number>()
      expect(rle2.decode(runs)).toEqual(data)
    })

    it('should handle negative number arrays', () => {
      const data = [-1, -1, -2, -2, -2, 0]
      const runs = rle.encode(data)
      const rle2 = new RLE<number>()
      expect(rle2.decode(runs)).toEqual(data)
    })

    it('should handle binary data (0s and 1s)', () => {
      const data = [0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1]
      const runs = rle.encode(data)
      const rle2 = new RLE<number>()
      expect(rle2.decode(runs)).toEqual(data)
    })

    it('should handle monotonic sequences', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const runs = rle.encode(data)
      expect(runs.length).toBe(10)
      expect(runs.every(r => r.count === 1)).toBe(true)
    })
  })

  describe('large inputs', () => {
    it('should handle large uniform array', () => {
      const data = Array(100000).fill(42)
      const runs = rle.encode(data)
      expect(runs).toEqual([{ value: 42, count: 100000 }])
    })

    it('should handle large alternating array', () => {
      const data: number[] = []
      for (let i = 0; i < 1000; i++) {
        data.push(i % 2)
      }
      const runs = rle.encode(data)
      expect(runs.length).toBe(1000)
      expect(rle.getLength()).toBe(1000)
    })

    it('should handle large mixed array', () => {
      const data: number[] = []
      for (let i = 0; i < 10000; i++) {
        if (i < 3000) data.push(1)
        else if (i < 7000) data.push(2)
        else data.push(3)
      }
      const runs = rle.encode(data)
      expect(runs).toEqual([
        { value: 1, count: 3000 },
        { value: 2, count: 4000 },
        { value: 3, count: 3000 },
      ])
    })

    it('should decode large runs efficiently', () => {
      rle.encode(Array(50000).fill(7))
      const rle2 = new RLE<number>()
      const decoded = rle2.decode([{ value: 7, count: 50000 }])
      expect(decoded.length).toBe(50000)
    })

    it('should slice large data efficiently', () => {
      rle.encode(Array(100000).fill(1))
      expect(rle.slice(99990, 99995)).toEqual([1, 1, 1, 1, 1])
    })
  })

  describe('edge cases', () => {
    it('should handle encode then getLength', () => {
      rle.encode([1, 2, 3])
      expect(rle.getLength()).toBe(3)
    })

    it('should handle multiple encode calls', () => {
      rle.encode([1, 1])
      expect(rle.getLength()).toBe(2)
      rle.encode([2, 2, 2])
      expect(rle.getLength()).toBe(3)
    })

    it('should handle decode after encode', () => {
      rle.encode([1, 1, 2])
      const decoded = rle.decode([{ value: 3, count: 5 }])
      expect(decoded).toEqual([3, 3, 3, 3, 3])
      expect(rle.getLength()).toBe(5)
    })

    it('should handle empty then non-empty encoding', () => {
      rle.encode([])
      expect(rle.getLength()).toBe(0)
      rle.encode([1])
      expect(rle.getLength()).toBe(1)
    })

    it('should handle getElementAt on run boundaries for long runs', () => {
      rle.encode([1, 1, 1, 2, 2])
      expect(rle.getElementAt(2)).toBe(1)
      expect(rle.getElementAt(3)).toBe(2)
    })

    it('should handle slice on single element encoding', () => {
      rle.encode([42])
      expect(rle.slice(0, 1)).toEqual([42])
      expect(rle.slice(0, 0)).toEqual([])
    })

    it('should handle compressRatio with exact break-even', () => {
      rle.encode([1, 1, 2, 2])
      expect(rle.compressRatio()).toBe(1)
      expect(rle.isCompressed()).toBe(false)
    })

    it('should handle getElementAt on large encoding', () => {
      const big = new RLE<number>()
      big.encode([...Array(1000).fill(0), ...Array(1000).fill(1)])
      expect(big.getElementAt(999)).toBe(0)
      expect(big.getElementAt(1000)).toBe(1)
    })

    it('should handle concat with itself', () => {
      rle.encode([1, 1, 2])
      const result = rle.concat(rle)
      expect(result.getRuns()).toEqual([
        { value: 1, count: 2 },
        { value: 2, count: 1 },
        { value: 1, count: 2 },
        { value: 2, count: 1 },
      ])
      expect(result.getLength()).toBe(6)
    })

    it('should merge runs when concat with itself and last matches first', () => {
      rle.encode([1, 1, 1])
      const result = rle.concat(rle)
      expect(result.getRuns()).toEqual([{ value: 1, count: 6 }])
    })

    it('should handle string with all same characters', () => {
      const str = 'x'.repeat(50)
      const encoded = RLE.encodeString(str)
      expect(RLE.decodeString(encoded)).toBe(str)
    })

    it('should handle encodeBytes with alternating pattern', () => {
      const data = [0, 1, 0, 1, 0, 1]
      const runs = RLE.encodeBytes(data)
      expect(runs.length).toBe(6)
      expect(RLE.decodeBytes(runs)).toEqual(data)
    })

    it('should handle getRunAt for single element runs', () => {
      rle.encode([1, 2, 3])
      expect(rle.getRunAt(0)).toEqual({ value: 1, count: 1 })
      expect(rle.getRunAt(1)).toEqual({ value: 2, count: 1 })
      expect(rle.getRunAt(2)).toEqual({ value: 3, count: 1 })
    })
  })

  describe('type exports', () => {
    it('should export Run type', () => {
      const run: Run<number> = { value: 1, count: 5 }
      expect(run.value).toBe(1)
      expect(run.count).toBe(5)
    })

    it('should export Run type with string', () => {
      const run: Run<string> = { value: 'test', count: 3 }
      expect(run.value).toBe('test')
      expect(run.count).toBe(3)
    })

    it('should support RLE with different types', () => {
      const numRle = new RLE<number>()
      numRle.encode([1, 1, 2])
      expect(numRle.getRuns().length).toBe(2)

      const strRle = new RLE<string>()
      strRle.encode(['a', 'b', 'b'])
      expect(strRle.getRuns().length).toBe(2)
    })
  })
})
