import { describe, it, expect } from 'vitest'
import { BitPackedArray } from '../src/core/bit-packed-array/bit-packed-array.js'

describe('BitPackedArray', () => {
  describe('constructor', () => {
    it('creates array with default 32 bits per element', () => {
      const a = new BitPackedArray(10)
      expect(a.length).toBe(10)
      expect(a.bitsPerElement).toBe(32)
      expect(a.maxValue).toBe(0xFFFFFFFF)
    })

    it('creates array with custom bits per element', () => {
      const a = new BitPackedArray(10, { bitsPerElement: 8 })
      expect(a.bitsPerElement).toBe(8)
      expect(a.maxValue).toBe(255)
    })

    it('creates array with 1 bit per element', () => {
      const a = new BitPackedArray(10, { bitsPerElement: 1 })
      expect(a.maxValue).toBe(1)
    })

    it('creates array with 16 bits per element', () => {
      const a = new BitPackedArray(10, { bitsPerElement: 16 })
      expect(a.maxValue).toBe(65535)
    })

    it('creates zero-length array', () => {
      const a = new BitPackedArray(0)
      expect(a.length).toBe(0)
      expect(a.byteSize).toBe(0)
    })

    it('throws on negative length', () => {
      expect(() => new BitPackedArray(-1)).toThrow(RangeError)
    })

    it('throws on non-integer length', () => {
      expect(() => new BitPackedArray(3.5)).toThrow(RangeError)
    })

    it('throws on bitsPerElement 0', () => {
      expect(() => new BitPackedArray(10, { bitsPerElement: 0 })).toThrow(RangeError)
    })

    it('throws on bitsPerElement > 32', () => {
      expect(() => new BitPackedArray(10, { bitsPerElement: 33 })).toThrow(RangeError)
    })

    it('throws on non-integer bitsPerElement', () => {
      expect(() => new BitPackedArray(10, { bitsPerElement: 3.5 })).toThrow(RangeError)
    })
  })

  describe('get and set', () => {
    it('sets and gets a value', () => {
      const a = new BitPackedArray(5)
      a.set(0, 42)
      expect(a.get(0)).toBe(42)
    })

    it('defaults to 0', () => {
      const a = new BitPackedArray(5)
      expect(a.get(0)).toBe(0)
    })

    it('handles multiple indices', () => {
      const a = new BitPackedArray(5)
      a.set(0, 10)
      a.set(2, 20)
      a.set(4, 30)
      expect(a.get(0)).toBe(10)
      expect(a.get(1)).toBe(0)
      expect(a.get(2)).toBe(20)
      expect(a.get(3)).toBe(0)
      expect(a.get(4)).toBe(30)
    })

    it('masks values to maxValue', () => {
      const a = new BitPackedArray(5, { bitsPerElement: 8 })
      a.set(0, 300)
      expect(a.get(0)).toBe(300 & 255)
    })

    it('throws on out-of-bounds get', () => {
      const a = new BitPackedArray(5)
      expect(() => a.get(-1)).toThrow(RangeError)
      expect(() => a.get(5)).toThrow(RangeError)
    })

    it('throws on out-of-bounds set', () => {
      const a = new BitPackedArray(5)
      expect(() => a.set(-1, 0)).toThrow(RangeError)
      expect(() => a.set(5, 0)).toThrow(RangeError)
    })

    it('overwrites values', () => {
      const a = new BitPackedArray(5)
      a.set(0, 10)
      a.set(0, 20)
      expect(a.get(0)).toBe(20)
    })
  })

  describe('1-bit elements', () => {
    it('stores 0 and 1', () => {
      const a = new BitPackedArray(8, { bitsPerElement: 1 })
      a.set(0, 1)
      a.set(3, 1)
      a.set(7, 1)
      expect(a.get(0)).toBe(1)
      expect(a.get(1)).toBe(0)
      expect(a.get(3)).toBe(1)
      expect(a.get(7)).toBe(1)
    })

    it('masks value 2 to 1', () => {
      const a = new BitPackedArray(4, { bitsPerElement: 1 })
      a.set(0, 2)
      expect(a.get(0)).toBe(0)
    })

    it('packs 32 elements per word', () => {
      const a = new BitPackedArray(64, { bitsPerElement: 1 })
      for (let i = 0; i < 64; i++) {
        a.set(i, i % 2)
      }
      for (let i = 0; i < 64; i++) {
        expect(a.get(i)).toBe(i % 2)
      }
    })
  })

  describe('8-bit elements', () => {
    it('stores byte values', () => {
      const a = new BitPackedArray(10, { bitsPerElement: 8 })
      a.set(0, 0)
      a.set(1, 127)
      a.set(2, 255)
      expect(a.get(0)).toBe(0)
      expect(a.get(1)).toBe(127)
      expect(a.get(2)).toBe(255)
    })

    it('handles cross-word boundary (4 per 32-bit word)', () => {
      const a = new BitPackedArray(9, { bitsPerElement: 8 })
      for (let i = 0; i < 9; i++) a.set(i, (i + 1) * 10)
      for (let i = 0; i < 9; i++) {
        expect(a.get(i)).toBe((i + 1) * 10)
      }
    })
  })

  describe('16-bit elements', () => {
    it('stores 16-bit values', () => {
      const a = new BitPackedArray(10, { bitsPerElement: 16 })
      a.set(0, 0)
      a.set(1, 32767)
      a.set(2, 65535)
      expect(a.get(0)).toBe(0)
      expect(a.get(1)).toBe(32767)
      expect(a.get(2)).toBe(65535)
    })
  })

  describe('32-bit elements', () => {
    it('stores full 32-bit values', () => {
      const a = new BitPackedArray(5)
      a.set(0, 0xFFFFFFFF)
      expect(a.get(0)).toBe(0xFFFFFFFF)
    })

    it('stores 0', () => {
      const a = new BitPackedArray(5)
      a.set(0, 0)
      expect(a.get(0)).toBe(0)
    })

    it('stores mixed values', () => {
      const a = new BitPackedArray(5)
      a.set(0, 0)
      a.set(1, 12345)
      a.set(2, 0xFFFFFFFF)
      a.set(3, 1)
      a.set(4, 999)
      expect(a.get(0)).toBe(0)
      expect(a.get(1)).toBe(12345)
      expect(a.get(2)).toBe(0xFFFFFFFF)
      expect(a.get(3)).toBe(1)
      expect(a.get(4)).toBe(999)
    })
  })

  describe('properties', () => {
    it('returns correct length', () => {
      expect(new BitPackedArray(100).length).toBe(100)
    })

    it('returns correct byteSize', () => {
      const a = new BitPackedArray(8, { bitsPerElement: 8 })
      expect(a.byteSize).toBe(8)
    })

    it('returns correct maxValue for various bit widths', () => {
      expect(new BitPackedArray(1, { bitsPerElement: 1 }).maxValue).toBe(1)
      expect(new BitPackedArray(1, { bitsPerElement: 4 }).maxValue).toBe(15)
      expect(new BitPackedArray(1, { bitsPerElement: 8 }).maxValue).toBe(255)
      expect(new BitPackedArray(1, { bitsPerElement: 16 }).maxValue).toBe(65535)
      expect(new BitPackedArray(1, { bitsPerElement: 32 }).maxValue).toBe(0xFFFFFFFF)
    })
  })

  describe('fill', () => {
    it('fills all elements', () => {
      const a = new BitPackedArray(5, { bitsPerElement: 8 })
      a.fill(42)
      for (let i = 0; i < 5; i++) {
        expect(a.get(i)).toBe(42)
      }
    })

    it('masks fill value', () => {
      const a = new BitPackedArray(5, { bitsPerElement: 8 })
      a.fill(300)
      expect(a.get(0)).toBe(300 & 255)
    })
  })

  describe('toArray', () => {
    it('returns empty for zero-length', () => {
      expect(new BitPackedArray(0).toArray()).toEqual([])
    })

    it('returns all values', () => {
      const a = new BitPackedArray(3, { bitsPerElement: 8 })
      a.set(0, 10)
      a.set(1, 20)
      a.set(2, 30)
      expect(a.toArray()).toEqual([10, 20, 30])
    })
  })

  describe('static fromArray', () => {
    it('creates from number array', () => {
      const a = BitPackedArray.fromArray([10, 20, 30], { bitsPerElement: 8 })
      expect(a.length).toBe(3)
      expect(a.toArray()).toEqual([10, 20, 30])
    })

    it('creates from empty array', () => {
      const a = BitPackedArray.fromArray([])
      expect(a.length).toBe(0)
    })

    it('uses default 32-bit', () => {
      const a = BitPackedArray.fromArray([1000])
      expect(a.bitsPerElement).toBe(32)
      expect(a.get(0)).toBe(1000)
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const a = new BitPackedArray(3, { bitsPerElement: 8 })
      a.set(0, 42)
      const c = a.clone()
      expect(c.toArray()).toEqual([42, 0, 0])
      c.set(0, 99)
      expect(a.get(0)).toBe(42)
      expect(c.get(0)).toBe(99)
    })

    it('preserves bitsPerElement', () => {
      const a = new BitPackedArray(3, { bitsPerElement: 4 })
      expect(a.clone().bitsPerElement).toBe(4)
    })
  })

  describe('forEach', () => {
    it('iterates with correct values and indices', () => {
      const a = BitPackedArray.fromArray([10, 20, 30], { bitsPerElement: 8 })
      const pairs: [number, number][] = []
      a.forEach((v, i) => pairs.push([v, i]))
      expect(pairs).toEqual([[10, 0], [20, 1], [30, 2]])
    })

    it('does not iterate on empty', () => {
      const a = new BitPackedArray(0)
      let count = 0
      a.forEach(() => count++)
      expect(count).toBe(0)
    })
  })

  describe('map', () => {
    it('transforms values', () => {
      const a = BitPackedArray.fromArray([1, 2, 3], { bitsPerElement: 8 })
      const b = a.map((v) => v * 2)
      expect(b.toArray()).toEqual([2, 4, 6])
    })

    it('does not modify original', () => {
      const a = BitPackedArray.fromArray([1, 2], { bitsPerElement: 8 })
      a.map((v) => v + 10)
      expect(a.toArray()).toEqual([1, 2])
    })
  })

  describe('reduce', () => {
    it('sums values', () => {
      const a = BitPackedArray.fromArray([1, 2, 3, 4], { bitsPerElement: 8 })
      expect(a.reduce((acc, v) => acc + v, 0)).toBe(10)
    })
  })

  describe('slice', () => {
    it('returns subset', () => {
      const a = BitPackedArray.fromArray([10, 20, 30, 40, 50], { bitsPerElement: 8 })
      const s = a.slice(1, 4)
      expect(s.toArray()).toEqual([20, 30, 40])
    })

    it('handles negative indices', () => {
      const a = BitPackedArray.fromArray([10, 20, 30], { bitsPerElement: 8 })
      expect(a.slice(-2).toArray()).toEqual([20, 30])
    })

    it('handles empty result', () => {
      const a = BitPackedArray.fromArray([10, 20], { bitsPerElement: 8 })
      expect(a.slice(5).toArray()).toEqual([])
    })
  })

  describe('indexOf / lastIndexOf / includes', () => {
    it('indexOf finds first match', () => {
      const a = BitPackedArray.fromArray([10, 20, 10], { bitsPerElement: 8 })
      expect(a.indexOf(10)).toBe(0)
      expect(a.indexOf(20)).toBe(1)
      expect(a.indexOf(99)).toBe(-1)
    })

    it('lastIndexOf finds last match', () => {
      const a = BitPackedArray.fromArray([10, 20, 10], { bitsPerElement: 8 })
      expect(a.lastIndexOf(10)).toBe(2)
      expect(a.lastIndexOf(99)).toBe(-1)
    })

    it('includes returns boolean', () => {
      const a = BitPackedArray.fromArray([10, 20], { bitsPerElement: 8 })
      expect(a.includes(10)).toBe(true)
      expect(a.includes(20)).toBe(true)
      expect(a.includes(99)).toBe(false)
    })
  })

  describe('cross-word boundary', () => {
    it('correctly handles 3-bit elements spanning words', () => {
      const a = new BitPackedArray(32, { bitsPerElement: 3 })
      for (let i = 0; i < 32; i++) {
        a.set(i, i % 7)
      }
      for (let i = 0; i < 32; i++) {
        expect(a.get(i)).toBe(i % 7)
      }
    })

    it('correctly handles 5-bit elements spanning words', () => {
      const a = new BitPackedArray(20, { bitsPerElement: 5 })
      for (let i = 0; i < 20; i++) {
        a.set(i, i * 3)
      }
      for (let i = 0; i < 20; i++) {
        expect(a.get(i)).toBe((i * 3) & 0x1F)
      }
    })

    it('correctly handles 12-bit elements', () => {
      const a = new BitPackedArray(20, { bitsPerElement: 12 })
      for (let i = 0; i < 20; i++) {
        a.set(i, i * 100)
      }
      for (let i = 0; i < 20; i++) {
        expect(a.get(i)).toBe((i * 100) & 0xFFF)
      }
    })
  })

  describe('large array', () => {
    it('handles 1000 8-bit elements', () => {
      const a = new BitPackedArray(1000, { bitsPerElement: 8 })
      for (let i = 0; i < 1000; i++) {
        a.set(i, i & 0xFF)
      }
      for (let i = 0; i < 1000; i++) {
        expect(a.get(i)).toBe(i & 0xFF)
      }
    })
  })
})
