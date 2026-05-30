import { describe, it, expect } from 'vitest'
import { EliasFano } from '../../../src/utils/elias-fano.js'

describe('EliasFano', () => {
  describe('empty', () => {
    it('handles empty array', () => {
      const ef = new EliasFano([])
      expect(ef.length).toBe(0)
      expect(ef.toArray()).toEqual([])
    })
  })

  describe('single element', () => {
    it('encodes single zero', () => {
      const ef = new EliasFano([0])
      expect(ef.length).toBe(1)
      expect(ef.get(0)).toBe(0)
    })

    it('encodes single value', () => {
      const ef = new EliasFano([42])
      expect(ef.length).toBe(1)
      expect(ef.get(0)).toBe(42)
    })
  })

  describe('basic encoding', () => {
    it('encodes consecutive values', () => {
      const ef = new EliasFano([0, 1, 2, 3, 4])
      expect(ef.toArray()).toEqual([0, 1, 2, 3, 4])
    })

    it('encodes spaced values', () => {
      const ef = new EliasFano([10, 20, 30, 40, 50])
      expect(ef.toArray()).toEqual([10, 20, 30, 40, 50])
    })

    it('encodes large values', () => {
      const ef = new EliasFano([100, 200, 500, 1000])
      expect(ef.toArray()).toEqual([100, 200, 500, 1000])
    })

    it('encodes all zeros', () => {
      const ef = new EliasFano([0, 0, 0, 0])
      expect(ef.toArray()).toEqual([0, 0, 0, 0])
    })
  })

  describe('get', () => {
    it('throws on out of bounds', () => {
      const ef = new EliasFano([1, 2, 3])
      expect(() => ef.get(-1)).toThrow(RangeError)
      expect(() => ef.get(3)).toThrow(RangeError)
    })

    it('returns correct values by index', () => {
      const ef = new EliasFano([5, 10, 15, 20])
      expect(ef.get(0)).toBe(5)
      expect(ef.get(1)).toBe(10)
      expect(ef.get(2)).toBe(15)
      expect(ef.get(3)).toBe(20)
    })
  })

  describe('fromSorted', () => {
    it('creates from sorted array', () => {
      const ef = EliasFano.fromSorted([1, 3, 5, 7, 9])
      expect(ef.toArray()).toEqual([1, 3, 5, 7, 9])
    })
  })

  describe('indexOf', () => {
    it('finds existing value', () => {
      const ef = new EliasFano([10, 20, 30, 40])
      expect(ef.indexOf(10)).toBe(0)
      expect(ef.indexOf(20)).toBe(1)
      expect(ef.indexOf(40)).toBe(3)
    })

    it('returns -1 for missing value', () => {
      const ef = new EliasFano([10, 20, 30])
      expect(ef.indexOf(15)).toBe(-1)
    })

    it('handles empty', () => {
      const ef = new EliasFano([])
      expect(ef.indexOf(1)).toBe(-1)
    })
  })

  describe('nextGEQ', () => {
    it('finds next greater or equal', () => {
      const ef = new EliasFano([10, 20, 30, 40, 50])
      expect(ef.nextGEQ(10)).toBe(0)
      expect(ef.nextGEQ(25)).toBe(2)
      expect(ef.nextGEQ(50)).toBe(4)
    })

    it('returns -1 if no value >= target', () => {
      const ef = new EliasFano([10, 20, 30])
      expect(ef.nextGEQ(40)).toBe(-1)
    })
  })

  describe('forEach', () => {
    it('iterates all values', () => {
      const ef = new EliasFano([5, 10, 15])
      const collected: number[] = []
      ef.forEach((v) => collected.push(v))
      expect(collected).toEqual([5, 10, 15])
    })
  })

  describe('encodedSize', () => {
    it('reports non-zero size', () => {
      const ef = new EliasFano([1, 2, 3, 4, 5])
      expect(ef.encodedSize).toBeGreaterThan(0)
    })
  })

  describe('larger sequences', () => {
    it('roundtrips 100 values', () => {
      const values = Array.from({ length: 100 }, (_, i) => i * 10)
      const ef = new EliasFano(values)
      expect(ef.toArray()).toEqual(values)
      expect(ef.length).toBe(100)
    })

    it('roundtrips sparse values', () => {
      const values = [0, 100, 500, 1000, 5000, 10000]
      const ef = new EliasFano(values)
      expect(ef.toArray()).toEqual(values)
    })
  })
})
