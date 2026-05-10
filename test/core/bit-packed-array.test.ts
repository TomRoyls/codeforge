import { describe, it, expect } from 'vitest'
import { BitPackedArray } from '../../src/core/bit-packed-array/bit-packed-array.js'
import type { BitPackedArrayOptions } from '../../src/core/bit-packed-array/bit-packed-array.js'

describe('BitPackedArray', () => {
  describe('constructor', () => {
    it('creates array with default 32 bits per element', () => {
      const arr = new BitPackedArray(10)
      expect(arr.length).toBe(10)
      expect(arr.bitsPerElement).toBe(32)
      expect(arr.maxValue).toBe(0xFFFFFFFF)
    })

    it('creates array with 1 bit per element', () => {
      const arr = new BitPackedArray(100, { bitsPerElement: 1 })
      expect(arr.length).toBe(100)
      expect(arr.bitsPerElement).toBe(1)
      expect(arr.maxValue).toBe(1)
    })

    it('creates array with 2 bits per element', () => {
      const arr = new BitPackedArray(50, { bitsPerElement: 2 })
      expect(arr.bitsPerElement).toBe(2)
      expect(arr.maxValue).toBe(3)
    })

    it('creates array with 4 bits per element', () => {
      const arr = new BitPackedArray(20, { bitsPerElement: 4 })
      expect(arr.bitsPerElement).toBe(4)
      expect(arr.maxValue).toBe(15)
    })

    it('creates array with 8 bits per element', () => {
      const arr = new BitPackedArray(10, { bitsPerElement: 8 })
      expect(arr.bitsPerElement).toBe(8)
      expect(arr.maxValue).toBe(255)
    })

    it('creates array with 16 bits per element', () => {
      const arr = new BitPackedArray(5, { bitsPerElement: 16 })
      expect(arr.bitsPerElement).toBe(16)
      expect(arr.maxValue).toBe(65535)
    })

    it('creates array with 32 bits per element', () => {
      const arr = new BitPackedArray(5, { bitsPerElement: 32 })
      expect(arr.bitsPerElement).toBe(32)
      expect(arr.maxValue).toBe(0xFFFFFFFF)
    })

    it('creates empty array with length 0', () => {
      const arr = new BitPackedArray(0)
      expect(arr.length).toBe(0)
    })

    it('creates empty array with 0 length and custom bits', () => {
      const arr = new BitPackedArray(0, { bitsPerElement: 4 })
      expect(arr.length).toBe(0)
      expect(arr.bitsPerElement).toBe(4)
    })

    it('throws on negative length', () => {
      expect(() => new BitPackedArray(-1)).toThrow(RangeError)
    })

    it('throws on non-integer length', () => {
      expect(() => new BitPackedArray(1.5)).toThrow(RangeError)
    })

    it('throws on bitsPerElement 0', () => {
      expect(() => new BitPackedArray(10, { bitsPerElement: 0 })).toThrow(RangeError)
    })

    it('throws on bitsPerElement 33', () => {
      expect(() => new BitPackedArray(10, { bitsPerElement: 33 })).toThrow(RangeError)
    })

    it('throws on non-integer bitsPerElement', () => {
      expect(() => new BitPackedArray(10, { bitsPerElement: 2.5 })).toThrow(RangeError)
    })

    it('throws on negative bitsPerElement', () => {
      expect(() => new BitPackedArray(10, { bitsPerElement: -1 })).toThrow(RangeError)
    })

    it('initializes all values to 0', () => {
      const arr = new BitPackedArray(10, { bitsPerElement: 4 })
      for (let i = 0; i < 10; i++) {
        expect(arr.get(i)).toBe(0)
      }
    })
  })

  describe('get and set', () => {
    it('sets and gets a value at index 0', () => {
      const arr = new BitPackedArray(5, { bitsPerElement: 8 })
      arr.set(0, 42)
      expect(arr.get(0)).toBe(42)
    })

    it('sets and gets a value at last index', () => {
      const arr = new BitPackedArray(5, { bitsPerElement: 8 })
      arr.set(4, 200)
      expect(arr.get(4)).toBe(200)
    })

    it('sets and gets multiple values', () => {
      const arr = new BitPackedArray(5, { bitsPerElement: 8 })
      arr.set(0, 10)
      arr.set(1, 20)
      arr.set(2, 30)
      arr.set(3, 40)
      arr.set(4, 50)
      expect(arr.toArray()).toEqual([10, 20, 30, 40, 50])
    })

    it('overwrites existing value', () => {
      const arr = new BitPackedArray(3, { bitsPerElement: 8 })
      arr.set(1, 100)
      expect(arr.get(1)).toBe(100)
      arr.set(1, 200)
      expect(arr.get(1)).toBe(200)
    })

    it('get throws on negative index', () => {
      const arr = new BitPackedArray(5, { bitsPerElement: 8 })
      expect(() => arr.get(-1)).toThrow(RangeError)
    })

    it('get throws on index equal to length', () => {
      const arr = new BitPackedArray(5, { bitsPerElement: 8 })
      expect(() => arr.get(5)).toThrow(RangeError)
    })

    it('get throws on index beyond length', () => {
      const arr = new BitPackedArray(5, { bitsPerElement: 8 })
      expect(() => arr.get(100)).toThrow(RangeError)
    })

    it('set throws on negative index', () => {
      const arr = new BitPackedArray(5, { bitsPerElement: 8 })
      expect(() => arr.set(-1, 0)).toThrow(RangeError)
    })

    it('set throws on index equal to length', () => {
      const arr = new BitPackedArray(5, { bitsPerElement: 8 })
      expect(() => arr.set(5, 0)).toThrow(RangeError)
    })

    it('set throws on index beyond length', () => {
      const arr = new BitPackedArray(5, { bitsPerElement: 8 })
      expect(() => arr.set(100, 0)).toThrow(RangeError)
    })
  })

  describe('1-bit (boolean array)', () => {
    it('stores 0s and 1s', () => {
      const arr = new BitPackedArray(8, { bitsPerElement: 1 })
      arr.set(0, 1)
      arr.set(1, 0)
      arr.set(2, 1)
      arr.set(3, 1)
      arr.set(4, 0)
      arr.set(5, 0)
      arr.set(6, 1)
      arr.set(7, 0)
      expect(arr.toArray()).toEqual([1, 0, 1, 1, 0, 0, 1, 0])
    })

    it('max value is 1', () => {
      const arr = new BitPackedArray(4, { bitsPerElement: 1 })
      expect(arr.maxValue).toBe(1)
    })

    it('truncates values above 1', () => {
      const arr = new BitPackedArray(4, { bitsPerElement: 1 })
      arr.set(0, 5)
      expect(arr.get(0)).toBe(1)
    })

    it('packs 32 elements into one Uint32', () => {
      const arr = new BitPackedArray(32, { bitsPerElement: 1 })
      expect(arr.byteSize).toBe(4)
    })

    it('stores alternating pattern in 64 elements', () => {
      const arr = new BitPackedArray(64, { bitsPerElement: 1 })
      for (let i = 0; i < 64; i++) {
        arr.set(i, i % 2)
      }
      for (let i = 0; i < 64; i++) {
        expect(arr.get(i)).toBe(i % 2)
      }
    })

    it('stores all 1s in 64 elements', () => {
      const arr = new BitPackedArray(64, { bitsPerElement: 1 })
      for (let i = 0; i < 64; i++) {
        arr.set(i, 1)
      }
      for (let i = 0; i < 64; i++) {
        expect(arr.get(i)).toBe(1)
      }
    })
  })

  describe('2-bit (quaternary)', () => {
    it('stores values 0-3', () => {
      const arr = new BitPackedArray(4, { bitsPerElement: 2 })
      arr.set(0, 0)
      arr.set(1, 1)
      arr.set(2, 2)
      arr.set(3, 3)
      expect(arr.toArray()).toEqual([0, 1, 2, 3])
    })

    it('max value is 3', () => {
      const arr = new BitPackedArray(4, { bitsPerElement: 2 })
      expect(arr.maxValue).toBe(3)
    })

    it('truncates values above 3', () => {
      const arr = new BitPackedArray(4, { bitsPerElement: 2 })
      arr.set(0, 10)
      expect(arr.get(0)).toBe(2)
    })

    it('packs 16 elements into one Uint32', () => {
      const arr = new BitPackedArray(16, { bitsPerElement: 2 })
      expect(arr.byteSize).toBe(4)
    })

    it('stores pattern across word boundary (16 elements)', () => {
      const arr = new BitPackedArray(16, { bitsPerElement: 2 })
      const pattern = [0, 1, 2, 3, 3, 2, 1, 0, 0, 3, 1, 2, 2, 1, 3, 0]
      for (let i = 0; i < 16; i++) {
        arr.set(i, pattern[i]!)
      }
      expect(arr.toArray()).toEqual(pattern)
    })

    it('stores pattern across multiple words', () => {
      const arr = new BitPackedArray(20, { bitsPerElement: 2 })
      for (let i = 0; i < 20; i++) {
        arr.set(i, i % 4)
      }
      for (let i = 0; i < 20; i++) {
        expect(arr.get(i)).toBe(i % 4)
      }
    })
  })

  describe('4-bit', () => {
    it('stores values 0-15', () => {
      const arr = new BitPackedArray(16, { bitsPerElement: 4 })
      for (let i = 0; i < 16; i++) {
        arr.set(i, i)
      }
      for (let i = 0; i < 16; i++) {
        expect(arr.get(i)).toBe(i)
      }
    })

    it('max value is 15', () => {
      const arr = new BitPackedArray(4, { bitsPerElement: 4 })
      expect(arr.maxValue).toBe(15)
    })

    it('packs 8 elements into one Uint32', () => {
      const arr = new BitPackedArray(8, { bitsPerElement: 4 })
      expect(arr.byteSize).toBe(4)
    })

    it('truncates values above 15', () => {
      const arr = new BitPackedArray(4, { bitsPerElement: 4 })
      arr.set(0, 255)
      expect(arr.get(0)).toBe(15)
    })

    it('correctly stores max value 15', () => {
      const arr = new BitPackedArray(5, { bitsPerElement: 4 })
      arr.set(2, 15)
      expect(arr.get(2)).toBe(15)
    })
  })

  describe('8-bit (byte array)', () => {
    it('stores values 0-255', () => {
      const arr = new BitPackedArray(4, { bitsPerElement: 8 })
      arr.set(0, 0)
      arr.set(1, 127)
      arr.set(2, 200)
      arr.set(3, 255)
      expect(arr.toArray()).toEqual([0, 127, 200, 255])
    })

    it('max value is 255', () => {
      const arr = new BitPackedArray(4, { bitsPerElement: 8 })
      expect(arr.maxValue).toBe(255)
    })

    it('packs 4 elements into one Uint32', () => {
      const arr = new BitPackedArray(4, { bitsPerElement: 8 })
      expect(arr.byteSize).toBe(4)
    })

    it('truncates values above 255', () => {
      const arr = new BitPackedArray(4, { bitsPerElement: 8 })
      arr.set(0, 300)
      expect(arr.get(0)).toBe(44)
    })

    it('stores full range 0-255 sequentially', () => {
      const arr = new BitPackedArray(256, { bitsPerElement: 8 })
      for (let i = 0; i < 256; i++) {
        arr.set(i, i)
      }
      for (let i = 0; i < 256; i++) {
        expect(arr.get(i)).toBe(i)
      }
    })
  })

  describe('16-bit', () => {
    it('stores values 0-65535', () => {
      const arr = new BitPackedArray(3, { bitsPerElement: 16 })
      arr.set(0, 0)
      arr.set(1, 32768)
      arr.set(2, 65535)
      expect(arr.toArray()).toEqual([0, 32768, 65535])
    })

    it('max value is 65535', () => {
      const arr = new BitPackedArray(3, { bitsPerElement: 16 })
      expect(arr.maxValue).toBe(65535)
    })

    it('packs 2 elements into one Uint32', () => {
      const arr = new BitPackedArray(2, { bitsPerElement: 16 })
      expect(arr.byteSize).toBe(4)
    })

    it('truncates values above 65535', () => {
      const arr = new BitPackedArray(3, { bitsPerElement: 16 })
      arr.set(0, 70000)
      expect(arr.get(0)).toBe(70000 & 0xFFFF)
    })

    it('stores values across word boundary', () => {
      const arr = new BitPackedArray(5, { bitsPerElement: 16 })
      const values = [1000, 2000, 3000, 4000, 5000]
      for (let i = 0; i < 5; i++) {
        arr.set(i, values[i]!)
      }
      expect(arr.toArray()).toEqual(values)
    })
  })

  describe('32-bit', () => {
    it('stores 32-bit unsigned values', () => {
      const arr = new BitPackedArray(3, { bitsPerElement: 32 })
      arr.set(0, 0)
      arr.set(1, 0x80000000)
      arr.set(2, 0xFFFFFFFF)
      expect(arr.get(0)).toBe(0)
      expect(arr.get(1)).toBe(0x80000000)
      expect(arr.get(2)).toBe(0xFFFFFFFF)
    })

    it('max value is 0xFFFFFFFF', () => {
      const arr = new BitPackedArray(3, { bitsPerElement: 32 })
      expect(arr.maxValue).toBe(0xFFFFFFFF)
    })

    it('each element takes one Uint32', () => {
      const arr = new BitPackedArray(3, { bitsPerElement: 32 })
      expect(arr.byteSize).toBe(12)
    })

    it('truncates values above 32-bit range', () => {
      const arr = new BitPackedArray(3, { bitsPerElement: 32 })
      arr.set(0, 0x1FFFFFFFF)
      expect(arr.get(0)).toBe(0xFFFFFFFF)
    })
  })

  describe('maxValue', () => {
    it('returns correct maxValue for 1 bit', () => {
      expect(new BitPackedArray(1, { bitsPerElement: 1 }).maxValue).toBe(1)
    })

    it('returns correct maxValue for 2 bits', () => {
      expect(new BitPackedArray(1, { bitsPerElement: 2 }).maxValue).toBe(3)
    })

    it('returns correct maxValue for 4 bits', () => {
      expect(new BitPackedArray(1, { bitsPerElement: 4 }).maxValue).toBe(15)
    })

    it('returns correct maxValue for 8 bits', () => {
      expect(new BitPackedArray(1, { bitsPerElement: 8 }).maxValue).toBe(255)
    })

    it('returns correct maxValue for 16 bits', () => {
      expect(new BitPackedArray(1, { bitsPerElement: 16 }).maxValue).toBe(65535)
    })

    it('returns correct maxValue for 32 bits', () => {
      expect(new BitPackedArray(1, { bitsPerElement: 32 }).maxValue).toBe(0xFFFFFFFF)
    })

    it('returns correct maxValue for 3 bits', () => {
      expect(new BitPackedArray(1, { bitsPerElement: 3 }).maxValue).toBe(7)
    })

    it('returns correct maxValue for 5 bits', () => {
      expect(new BitPackedArray(1, { bitsPerElement: 5 }).maxValue).toBe(31)
    })

    it('returns correct maxValue for 7 bits', () => {
      expect(new BitPackedArray(1, { bitsPerElement: 7 }).maxValue).toBe(127)
    })

    it('returns correct maxValue for 12 bits', () => {
      expect(new BitPackedArray(1, { bitsPerElement: 12 }).maxValue).toBe(4095)
    })
  })

  describe('fill', () => {
    it('fills entire array with a value', () => {
      const arr = new BitPackedArray(5, { bitsPerElement: 8 })
      arr.fill(42)
      expect(arr.toArray()).toEqual([42, 42, 42, 42, 42])
    })

    it('fills with max value', () => {
      const arr = new BitPackedArray(4, { bitsPerElement: 4 })
      arr.fill(15)
      expect(arr.toArray()).toEqual([15, 15, 15, 15])
    })

    it('fills with 0', () => {
      const arr = new BitPackedArray(5, { bitsPerElement: 8 })
      arr.set(0, 100)
      arr.fill(0)
      expect(arr.toArray()).toEqual([0, 0, 0, 0, 0])
    })

    it('truncates fill value to max', () => {
      const arr = new BitPackedArray(4, { bitsPerElement: 4 })
      arr.fill(255)
      expect(arr.toArray()).toEqual([15, 15, 15, 15])
    })

    it('fills empty array without error', () => {
      const arr = new BitPackedArray(0, { bitsPerElement: 8 })
      expect(() => arr.fill(42)).not.toThrow()
    })
  })

  describe('toArray', () => {
    it('returns empty array for length 0', () => {
      const arr = new BitPackedArray(0, { bitsPerElement: 8 })
      expect(arr.toArray()).toEqual([])
    })

    it('returns all zeros for new array', () => {
      const arr = new BitPackedArray(5, { bitsPerElement: 8 })
      expect(arr.toArray()).toEqual([0, 0, 0, 0, 0])
    })

    it('returns set values', () => {
      const arr = new BitPackedArray(3, { bitsPerElement: 8 })
      arr.set(0, 10)
      arr.set(1, 20)
      arr.set(2, 30)
      expect(arr.toArray()).toEqual([10, 20, 30])
    })
  })

  describe('fromArray', () => {
    it('creates array from number array', () => {
      const arr = BitPackedArray.fromArray([10, 20, 30, 40])
      expect(arr.length).toBe(4)
      expect(arr.toArray()).toEqual([10, 20, 30, 40])
    })

    it('creates array with custom bitsPerElement', () => {
      const arr = BitPackedArray.fromArray([1, 2, 3], { bitsPerElement: 4 })
      expect(arr.bitsPerElement).toBe(4)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('creates empty array from empty input', () => {
      const arr = BitPackedArray.fromArray([])
      expect(arr.length).toBe(0)
    })

    it('truncates values that exceed max', () => {
      const arr = BitPackedArray.fromArray([100, 200, 300], { bitsPerElement: 8 })
      expect(arr.toArray()).toEqual([100, 200, 44])
    })

    it('preserves all values within range', () => {
      const values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
      const arr = BitPackedArray.fromArray(values, { bitsPerElement: 4 })
      expect(arr.toArray()).toEqual(values)
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const arr = new BitPackedArray(4, { bitsPerElement: 8 })
      arr.set(0, 42)
      arr.set(1, 100)
      const clone = arr.clone()
      expect(clone.toArray()).toEqual(arr.toArray())
      expect(clone.length).toBe(arr.length)
      expect(clone.bitsPerElement).toBe(arr.bitsPerElement)
    })

    it('modifying clone does not affect original', () => {
      const arr = new BitPackedArray(4, { bitsPerElement: 8 })
      arr.set(0, 42)
      const clone = arr.clone()
      clone.set(0, 99)
      expect(arr.get(0)).toBe(42)
      expect(clone.get(0)).toBe(99)
    })

    it('modifying original does not affect clone', () => {
      const arr = new BitPackedArray(4, { bitsPerElement: 8 })
      arr.set(0, 42)
      const clone = arr.clone()
      arr.set(0, 99)
      expect(clone.get(0)).toBe(42)
      expect(arr.get(0)).toBe(99)
    })

    it('clones empty array', () => {
      const arr = new BitPackedArray(0, { bitsPerElement: 8 })
      const clone = arr.clone()
      expect(clone.length).toBe(0)
    })
  })

  describe('forEach', () => {
    it('iterates all elements with correct values', () => {
      const arr = BitPackedArray.fromArray([10, 20, 30], { bitsPerElement: 8 })
      const collected: number[] = []
      arr.forEach((v) => collected.push(v))
      expect(collected).toEqual([10, 20, 30])
    })

    it('provides correct indices', () => {
      const arr = BitPackedArray.fromArray([5, 10, 15], { bitsPerElement: 8 })
      const indices: number[] = []
      arr.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('does not call callback for empty array', () => {
      const arr = new BitPackedArray(0, { bitsPerElement: 8 })
      let count = 0
      arr.forEach(() => { count++ })
      expect(count).toBe(0)
    })
  })

  describe('map', () => {
    it('maps values to new array', () => {
      const arr = BitPackedArray.fromArray([1, 2, 3], { bitsPerElement: 8 })
      const result = arr.map((v) => v * 2)
      expect(result.toArray()).toEqual([2, 4, 6])
    })

    it('receives correct indices', () => {
      const arr = BitPackedArray.fromArray([10, 20, 30], { bitsPerElement: 8 })
      const result = arr.map((_v, i) => i)
      expect(result.toArray()).toEqual([0, 1, 2])
    })

    it('returns array with same length and bitsPerElement', () => {
      const arr = new BitPackedArray(5, { bitsPerElement: 4 })
      const result = arr.map((v) => v)
      expect(result.length).toBe(5)
      expect(result.bitsPerElement).toBe(4)
    })

    it('truncates mapped values that exceed max', () => {
      const arr = BitPackedArray.fromArray([1, 2, 3], { bitsPerElement: 4 })
      const result = arr.map(() => 255)
      expect(result.toArray()).toEqual([15, 15, 15])
    })

    it('does not modify original', () => {
      const arr = BitPackedArray.fromArray([1, 2, 3], { bitsPerElement: 8 })
      arr.map(() => 99)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('reduce', () => {
    it('sums all values', () => {
      const arr = BitPackedArray.fromArray([1, 2, 3, 4], { bitsPerElement: 8 })
      const sum = arr.reduce((acc, v) => acc + v, 0)
      expect(sum).toBe(10)
    })

    it('receives correct indices', () => {
      const arr = BitPackedArray.fromArray([10, 20, 30], { bitsPerElement: 8 })
      const result = arr.reduce((acc, _v, i) => acc + i, 0)
      expect(result).toBe(3)
    })

    it('returns initial for empty array', () => {
      const arr = new BitPackedArray(0, { bitsPerElement: 8 })
      expect(arr.reduce((acc, v) => acc + v, 42)).toBe(42)
    })

    it('finds max value', () => {
      const arr = BitPackedArray.fromArray([3, 7, 2, 9, 1], { bitsPerElement: 8 })
      const max = arr.reduce((acc, v) => v > acc ? v : acc, 0)
      expect(max).toBe(9)
    })
  })

  describe('slice', () => {
    it('slices entire array', () => {
      const arr = BitPackedArray.fromArray([1, 2, 3, 4, 5], { bitsPerElement: 8 })
      const result = arr.slice(0)
      expect(result.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('slices from start index', () => {
      const arr = BitPackedArray.fromArray([1, 2, 3, 4, 5], { bitsPerElement: 8 })
      const result = arr.slice(2)
      expect(result.toArray()).toEqual([3, 4, 5])
    })

    it('slices with start and end', () => {
      const arr = BitPackedArray.fromArray([1, 2, 3, 4, 5], { bitsPerElement: 8 })
      const result = arr.slice(1, 4)
      expect(result.toArray()).toEqual([2, 3, 4])
    })

    it('slices with negative start', () => {
      const arr = BitPackedArray.fromArray([1, 2, 3, 4, 5], { bitsPerElement: 8 })
      const result = arr.slice(-2)
      expect(result.toArray()).toEqual([4, 5])
    })

    it('slices with negative end', () => {
      const arr = BitPackedArray.fromArray([1, 2, 3, 4, 5], { bitsPerElement: 8 })
      const result = arr.slice(1, -1)
      expect(result.toArray()).toEqual([2, 3, 4])
    })

    it('returns empty slice for non-overlapping range', () => {
      const arr = BitPackedArray.fromArray([1, 2, 3], { bitsPerElement: 8 })
      const result = arr.slice(5, 10)
      expect(result.length).toBe(0)
    })

    it('preserves bitsPerElement', () => {
      const arr = new BitPackedArray(10, { bitsPerElement: 4 })
      const result = arr.slice(0, 3)
      expect(result.bitsPerElement).toBe(4)
    })

    it('handles start beyond length', () => {
      const arr = BitPackedArray.fromArray([1, 2, 3], { bitsPerElement: 8 })
      const result = arr.slice(10)
      expect(result.length).toBe(0)
    })

    it('clamps end to length', () => {
      const arr = BitPackedArray.fromArray([1, 2, 3], { bitsPerElement: 8 })
      const result = arr.slice(1, 100)
      expect(result.toArray()).toEqual([2, 3])
    })

    it('handles both negative start and end', () => {
      const arr = BitPackedArray.fromArray([1, 2, 3, 4, 5], { bitsPerElement: 8 })
      const result = arr.slice(-4, -1)
      expect(result.toArray()).toEqual([2, 3, 4])
    })
  })

  describe('indexOf', () => {
    it('finds first occurrence', () => {
      const arr = BitPackedArray.fromArray([1, 2, 3, 2, 1], { bitsPerElement: 8 })
      expect(arr.indexOf(2)).toBe(1)
    })

    it('returns -1 when not found', () => {
      const arr = BitPackedArray.fromArray([1, 2, 3], { bitsPerElement: 8 })
      expect(arr.indexOf(99)).toBe(-1)
    })

    it('finds value at index 0', () => {
      const arr = BitPackedArray.fromArray([42, 1, 2], { bitsPerElement: 8 })
      expect(arr.indexOf(42)).toBe(0)
    })

    it('finds value at last index', () => {
      const arr = BitPackedArray.fromArray([1, 2, 42], { bitsPerElement: 8 })
      expect(arr.indexOf(42)).toBe(2)
    })

    it('returns -1 for empty array', () => {
      const arr = new BitPackedArray(0, { bitsPerElement: 8 })
      expect(arr.indexOf(0)).toBe(-1)
    })

    it('finds 0 in array of zeros', () => {
      const arr = new BitPackedArray(5, { bitsPerElement: 8 })
      expect(arr.indexOf(0)).toBe(0)
    })
  })

  describe('lastIndexOf', () => {
    it('finds last occurrence', () => {
      const arr = BitPackedArray.fromArray([1, 2, 3, 2, 1], { bitsPerElement: 8 })
      expect(arr.lastIndexOf(2)).toBe(3)
    })

    it('returns -1 when not found', () => {
      const arr = BitPackedArray.fromArray([1, 2, 3], { bitsPerElement: 8 })
      expect(arr.lastIndexOf(99)).toBe(-1)
    })

    it('finds value at last index', () => {
      const arr = BitPackedArray.fromArray([1, 2, 42], { bitsPerElement: 8 })
      expect(arr.lastIndexOf(42)).toBe(2)
    })

    it('returns -1 for empty array', () => {
      const arr = new BitPackedArray(0, { bitsPerElement: 8 })
      expect(arr.lastIndexOf(0)).toBe(-1)
    })

    it('finds same element when only one exists', () => {
      const arr = BitPackedArray.fromArray([1, 2, 3], { bitsPerElement: 8 })
      expect(arr.lastIndexOf(2)).toBe(1)
      expect(arr.indexOf(2)).toBe(1)
    })
  })

  describe('includes', () => {
    it('returns true when value exists', () => {
      const arr = BitPackedArray.fromArray([1, 2, 3], { bitsPerElement: 8 })
      expect(arr.includes(2)).toBe(true)
    })

    it('returns false when value does not exist', () => {
      const arr = BitPackedArray.fromArray([1, 2, 3], { bitsPerElement: 8 })
      expect(arr.includes(99)).toBe(false)
    })

    it('returns false for empty array', () => {
      const arr = new BitPackedArray(0, { bitsPerElement: 8 })
      expect(arr.includes(0)).toBe(false)
    })

    it('finds 0 in uninitialized array', () => {
      const arr = new BitPackedArray(5, { bitsPerElement: 8 })
      expect(arr.includes(0)).toBe(true)
    })

    it('finds max value', () => {
      const arr = new BitPackedArray(3, { bitsPerElement: 4 })
      arr.set(1, 15)
      expect(arr.includes(15)).toBe(true)
    })
  })

  describe('byteSize', () => {
    it('returns 0 for empty array', () => {
      const arr = new BitPackedArray(0, { bitsPerElement: 8 })
      expect(arr.byteSize).toBe(0)
    })

    it('returns correct size for 1-bit array', () => {
      const arr = new BitPackedArray(32, { bitsPerElement: 1 })
      expect(arr.byteSize).toBe(4)
    })

    it('returns correct size for 1-bit array with extra element', () => {
      const arr = new BitPackedArray(33, { bitsPerElement: 1 })
      expect(arr.byteSize).toBe(8)
    })

    it('returns correct size for 2-bit array', () => {
      const arr = new BitPackedArray(16, { bitsPerElement: 2 })
      expect(arr.byteSize).toBe(4)
    })

    it('returns correct size for 4-bit array', () => {
      const arr = new BitPackedArray(8, { bitsPerElement: 4 })
      expect(arr.byteSize).toBe(4)
    })

    it('returns correct size for 8-bit array', () => {
      const arr = new BitPackedArray(4, { bitsPerElement: 8 })
      expect(arr.byteSize).toBe(4)
    })

    it('returns correct size for 16-bit array', () => {
      const arr = new BitPackedArray(2, { bitsPerElement: 16 })
      expect(arr.byteSize).toBe(4)
    })

    it('returns correct size for 32-bit array', () => {
      const arr = new BitPackedArray(3, { bitsPerElement: 32 })
      expect(arr.byteSize).toBe(12)
    })

    it('returns correct size for 3-bit array (non-power-of-2)', () => {
      const arr = new BitPackedArray(10, { bitsPerElement: 3 })
      expect(arr.byteSize).toBe(4)
    })

    it('returns correct size for 5-bit array', () => {
      const arr = new BitPackedArray(7, { bitsPerElement: 5 })
      expect(arr.byteSize).toBe(8)
    })
  })

  describe('edge cases', () => {
    it('handles setting 0 when max value is larger', () => {
      const arr = new BitPackedArray(5, { bitsPerElement: 8 })
      arr.fill(255)
      arr.set(2, 0)
      expect(arr.get(2)).toBe(0)
    })

    it('handles overflow truncation correctly for 1-bit', () => {
      const arr = new BitPackedArray(4, { bitsPerElement: 1 })
      arr.set(0, 0xFFFFFFFF)
      expect(arr.get(0)).toBe(1)
    })

    it('handles overflow truncation for 4-bit', () => {
      const arr = new BitPackedArray(4, { bitsPerElement: 4 })
      arr.set(0, 0xFFFF)
      expect(arr.get(0)).toBe(15)
    })

    it('handles setting same value multiple times', () => {
      const arr = new BitPackedArray(3, { bitsPerElement: 8 })
      arr.set(1, 42)
      arr.set(1, 42)
      arr.set(1, 42)
      expect(arr.get(1)).toBe(42)
    })

    it('handles single element array', () => {
      const arr = new BitPackedArray(1, { bitsPerElement: 8 })
      arr.set(0, 123)
      expect(arr.get(0)).toBe(123)
      expect(arr.length).toBe(1)
    })

    it('handles single element with 1 bit', () => {
      const arr = new BitPackedArray(1, { bitsPerElement: 1 })
      arr.set(0, 1)
      expect(arr.get(0)).toBe(1)
    })

    it('handles negative input value by truncating', () => {
      const arr = new BitPackedArray(3, { bitsPerElement: 8 })
      arr.set(0, -1)
      expect(arr.get(0)).toBe(255)
    })

    it('handles negative input for 1-bit', () => {
      const arr = new BitPackedArray(3, { bitsPerElement: 1 })
      arr.set(0, -1)
      expect(arr.get(0)).toBe(1)
    })

    it('handles 3-bit elements (non-power-of-2)', () => {
      const arr = new BitPackedArray(8, { bitsPerElement: 3 })
      for (let i = 0; i < 8; i++) {
        arr.set(i, i)
      }
      for (let i = 0; i < 8; i++) {
        expect(arr.get(i)).toBe(i)
      }
    })

    it('handles 5-bit elements (non-power-of-2)', () => {
      const arr = new BitPackedArray(10, { bitsPerElement: 5 })
      const values = [0, 15, 31, 7, 20, 25, 10, 5, 30, 1]
      for (let i = 0; i < 10; i++) {
        arr.set(i, values[i]!)
      }
      expect(arr.toArray()).toEqual(values)
    })

    it('handles 7-bit elements', () => {
      const arr = new BitPackedArray(6, { bitsPerElement: 7 })
      const values = [0, 64, 127, 50, 100, 77]
      for (let i = 0; i < 6; i++) {
        arr.set(i, values[i]!)
      }
      expect(arr.toArray()).toEqual(values)
    })

    it('handles 12-bit elements', () => {
      const arr = new BitPackedArray(5, { bitsPerElement: 12 })
      const values = [0, 1000, 2048, 4095, 3333]
      for (let i = 0; i < 5; i++) {
        arr.set(i, values[i]!)
      }
      expect(arr.toArray()).toEqual(values)
    })

    it('handles 24-bit elements', () => {
      const arr = new BitPackedArray(4, { bitsPerElement: 24 })
      const values = [0, 0xFFFFFF, 0x800000, 1234567]
      for (let i = 0; i < 4; i++) {
        arr.set(i, values[i]!)
      }
      expect(arr.toArray()).toEqual(values)
    })
  })

  describe('large arrays (10000+ elements)', () => {
    it('handles 10000 elements with 1 bit', () => {
      const arr = new BitPackedArray(10000, { bitsPerElement: 1 })
      for (let i = 0; i < 10000; i++) {
        arr.set(i, i % 2)
      }
      for (let i = 0; i < 10000; i++) {
        expect(arr.get(i)).toBe(i % 2)
      }
    })

    it('handles 10000 elements with 4 bits', () => {
      const arr = new BitPackedArray(10000, { bitsPerElement: 4 })
      for (let i = 0; i < 10000; i++) {
        arr.set(i, i % 16)
      }
      for (let i = 0; i < 10000; i++) {
        expect(arr.get(i)).toBe(i % 16)
      }
    })

    it('handles 10000 elements with 8 bits', () => {
      const arr = new BitPackedArray(10000, { bitsPerElement: 8 })
      for (let i = 0; i < 10000; i++) {
        arr.set(i, i % 256)
      }
      for (let i = 0; i < 10000; i++) {
        expect(arr.get(i)).toBe(i % 256)
      }
    })

    it('handles 10000 elements with 16 bits', () => {
      const arr = new BitPackedArray(10000, { bitsPerElement: 16 })
      for (let i = 0; i < 10000; i++) {
        arr.set(i, i)
      }
      for (let i = 0; i < 10000; i++) {
        expect(arr.get(i)).toBe(i)
      }
    })

    it('fill works on 10000 elements', () => {
      const arr = new BitPackedArray(10000, { bitsPerElement: 4 })
      arr.fill(7)
      for (let i = 0; i < 10000; i++) {
        expect(arr.get(i)).toBe(7)
      }
    })

    it('forEach iterates 10000 elements', () => {
      const arr = new BitPackedArray(10000, { bitsPerElement: 8 })
      arr.fill(42)
      let count = 0
      arr.forEach(() => { count++ })
      expect(count).toBe(10000)
    })

    it('reduce sums 10000 elements', () => {
      const arr = new BitPackedArray(10000, { bitsPerElement: 8 })
      arr.fill(1)
      const sum = arr.reduce((acc, v) => acc + v, 0)
      expect(sum).toBe(10000)
    })

    it('indexOf finds value in large array', () => {
      const arr = new BitPackedArray(10000, { bitsPerElement: 8 })
      arr.fill(0)
      arr.set(9999, 42)
      expect(arr.indexOf(42)).toBe(9999)
    })

    it('lastIndexOf finds value in large array', () => {
      const arr = new BitPackedArray(10000, { bitsPerElement: 8 })
      arr.fill(42)
      arr.set(0, 0)
      expect(arr.lastIndexOf(0)).toBe(0)
    })

    it('includes works on large array', () => {
      const arr = new BitPackedArray(10000, { bitsPerElement: 8 })
      arr.fill(0)
      arr.set(5000, 99)
      expect(arr.includes(99)).toBe(true)
      expect(arr.includes(100)).toBe(false)
    })

    it('map works on large array', () => {
      const arr = new BitPackedArray(1000, { bitsPerElement: 8 })
      for (let i = 0; i < 1000; i++) {
        arr.set(i, 1)
      }
      const result = arr.map((v) => v * 2)
      expect(result.get(500)).toBe(2)
    })

    it('slice works on large array', () => {
      const arr = new BitPackedArray(10000, { bitsPerElement: 8 })
      for (let i = 0; i < 10000; i++) {
        arr.set(i, i % 256)
      }
      const result = arr.slice(5000, 5010)
      expect(result.length).toBe(10)
      for (let i = 0; i < 10; i++) {
        expect(result.get(i)).toBe((5000 + i) % 256)
      }
    })
  })

  describe('word boundary crossing', () => {
    it('3-bit element crossing word boundary', () => {
      const arr = new BitPackedArray(11, { bitsPerElement: 3 })
      const values = [0, 1, 2, 3, 4, 5, 6, 7, 7, 6, 5]
      for (let i = 0; i < 11; i++) {
        arr.set(i, values[i]!)
      }
      expect(arr.toArray()).toEqual(values)
    })

    it('5-bit element crossing word boundary', () => {
      const arr = new BitPackedArray(7, { bitsPerElement: 5 })
      const values = [31, 0, 15, 7, 25, 10, 20]
      for (let i = 0; i < 7; i++) {
        arr.set(i, values[i]!)
      }
      expect(arr.toArray()).toEqual(values)
    })

    it('13-bit element crossing word boundary', () => {
      const arr = new BitPackedArray(5, { bitsPerElement: 13 })
      const values = [0, 4095, 1000, 8191, 5555]
      for (let i = 0; i < 5; i++) {
        arr.set(i, values[i]!)
      }
      expect(arr.toArray()).toEqual(values)
    })

    it('16-bit element crossing word boundary', () => {
      const arr = new BitPackedArray(3, { bitsPerElement: 16 })
      const values = [65535, 0, 32768]
      for (let i = 0; i < 3; i++) {
        arr.set(i, values[i]!)
      }
      expect(arr.toArray()).toEqual(values)
    })

    it('overwriting element crossing boundary preserves neighbors', () => {
      const arr = new BitPackedArray(12, { bitsPerElement: 3 })
      const values = [1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4]
      for (let i = 0; i < 12; i++) {
        arr.set(i, values[i]!)
      }
      arr.set(10, 6)
      expect(arr.get(9)).toBe(2)
      expect(arr.get(10)).toBe(6)
      expect(arr.get(11)).toBe(4)
    })
  })

  describe('memory efficiency', () => {
    it('1-bit array uses 8x less memory than 8-bit', () => {
      const arr1bit = new BitPackedArray(32, { bitsPerElement: 1 })
      const arr8bit = new BitPackedArray(32, { bitsPerElement: 8 })
      expect(arr1bit.byteSize).toBe(4)
      expect(arr8bit.byteSize).toBe(32)
      expect(arr8bit.byteSize / arr1bit.byteSize).toBe(8)
    })

    it('4-bit array uses 2x less memory than 8-bit', () => {
      const arr4bit = new BitPackedArray(8, { bitsPerElement: 4 })
      const arr8bit = new BitPackedArray(8, { bitsPerElement: 8 })
      expect(arr4bit.byteSize).toBe(4)
      expect(arr8bit.byteSize).toBe(8)
    })

    it('2-bit array uses 4x less memory than 8-bit', () => {
      const arr2bit = new BitPackedArray(16, { bitsPerElement: 2 })
      const arr8bit = new BitPackedArray(16, { bitsPerElement: 8 })
      expect(arr2bit.byteSize).toBe(4)
      expect(arr8bit.byteSize).toBe(16)
    })
  })

  describe('type export', () => {
    it('exports BitPackedArrayOptions type', () => {
      const opts: BitPackedArrayOptions = { bitsPerElement: 8 }
      const arr = new BitPackedArray(5, opts)
      expect(arr.bitsPerElement).toBe(8)
    })
  })
})
