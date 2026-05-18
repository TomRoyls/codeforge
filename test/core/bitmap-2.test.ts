import { describe, it, expect, beforeEach } from 'vitest'
import { Bitmap2 } from '../../src/core/bitmap-2/index.js'

describe('Bitmap2', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('creates bitmap with given size', () => {
      const bm = new Bitmap2(64)
      expect(bm.size).toBe(64)
    })

    it('creates bitmap with size 0', () => {
      const bm = new Bitmap2(0)
      expect(bm.size).toBe(0)
    })

    it('throws for negative size', () => {
      expect(() => new Bitmap2(-1)).toThrow('Size must be non-negative')
    })

    it('initializes all bits to 0', () => {
      const bm = new Bitmap2(32)
      for (let i = 0; i < 32; i++) {
        expect(bm.get(i)).toBe(false)
      }
    })
  })

  // ─── set / get / clear ───
  describe('set, get, clear', () => {
    let bm: Bitmap2

    beforeEach(() => {
      bm = new Bitmap2(64)
    })

    it('sets a bit and reads it back', () => {
      bm.set(5)
      expect(bm.get(5)).toBe(true)
    })

    it('clears a set bit', () => {
      bm.set(5)
      bm.clear(5)
      expect(bm.get(5)).toBe(false)
    })

    it('clearing an unset bit is a no-op', () => {
      expect(bm.get(0)).toBe(false)
      bm.clear(0)
      expect(bm.get(0)).toBe(false)
    })

    it('throws for out-of-bounds index on get', () => {
      expect(() => bm.get(64)).toThrow('Index out of bounds')
    })

    it('throws for negative index on set', () => {
      expect(() => bm.set(-1)).toThrow('Index out of bounds')
    })

    it('handles the last valid index', () => {
      bm.set(63)
      expect(bm.get(63)).toBe(true)
    })
  })

  // ─── toggle ───
  describe('toggle', () => {
    it('toggles a bit from false to true', () => {
      const bm = new Bitmap2(16)
      const result = bm.toggle(3)
      expect(result).toBe(true)
      expect(bm.get(3)).toBe(true)
    })

    it('toggles a bit from true to false', () => {
      const bm = new Bitmap2(16)
      bm.set(3)
      const result = bm.toggle(3)
      expect(result).toBe(false)
      expect(bm.get(3)).toBe(false)
    })

    it('toggles the same bit twice returns to original', () => {
      const bm = new Bitmap2(16)
      bm.toggle(5)
      bm.toggle(5)
      expect(bm.get(5)).toBe(false)
    })
  })

  // ─── setAll / clearAll ───
  describe('setAll and clearAll', () => {
    it('sets all bits', () => {
      const bm = new Bitmap2(10)
      bm.setAll()
      expect(bm.countOnes()).toBe(10)
    })

    it('clears all bits', () => {
      const bm = new Bitmap2(10)
      bm.setAll()
      bm.clearAll()
      expect(bm.countOnes()).toBe(0)
    })

    it('setAll masks extra bits beyond size', () => {
      const bm = new Bitmap2(3)
      bm.setAll()
      expect(bm.countOnes()).toBe(3)
    })
  })

  // ─── setRange / clearRange ───
  describe('setRange and clearRange', () => {
    it('sets a range of bits', () => {
      const bm = new Bitmap2(16)
      bm.setRange(2, 6)
      expect(bm.get(1)).toBe(false)
      expect(bm.get(2)).toBe(true)
      expect(bm.get(5)).toBe(true)
      expect(bm.get(6)).toBe(false)
    })

    it('clears a range of bits', () => {
      const bm = new Bitmap2(16)
      bm.setAll()
      bm.clearRange(2, 6)
      expect(bm.get(2)).toBe(false)
      expect(bm.get(5)).toBe(false)
      expect(bm.get(1)).toBe(true)
    })

    it('throws for invalid range (start > end)', () => {
      const bm = new Bitmap2(16)
      expect(() => bm.setRange(5, 2)).toThrow('Invalid range')
    })

    it('throws for negative start', () => {
      const bm = new Bitmap2(16)
      expect(() => bm.setRange(-1, 5)).toThrow('Invalid range')
    })

    it('throws for end beyond size', () => {
      const bm = new Bitmap2(16)
      expect(() => bm.setRange(0, 17)).toThrow('Invalid range')
    })

    it('setRange with equal start and end does nothing', () => {
      const bm = new Bitmap2(16)
      bm.setRange(3, 3)
      expect(bm.countOnes()).toBe(0)
    })
  })

  // ─── countOnes / countZeros ───
  describe('countOnes and countZeros', () => {
    it('counts ones correctly', () => {
      const bm = new Bitmap2(32)
      bm.set(0)
      bm.set(15)
      bm.set(31)
      expect(bm.countOnes()).toBe(3)
    })

    it('counts zeros correctly', () => {
      const bm = new Bitmap2(32)
      bm.set(0)
      bm.set(31)
      expect(bm.countZeros()).toBe(30)
    })

    it('countOnes + countZeros equals size', () => {
      const bm = new Bitmap2(50)
      bm.set(10)
      bm.set(20)
      bm.set(30)
      expect(bm.countOnes() + bm.countZeros()).toBe(50)
    })
  })

  // ─── Bitwise operations ───
  describe('bitwise operations', () => {
    it('and returns intersection of bits', () => {
      const a = new Bitmap2(8)
      const b = new Bitmap2(8)
      a.set(0)
      a.set(1)
      a.set(2)
      b.set(1)
      b.set(2)
      b.set(3)
      const result = a.and(b)
      expect(result.get(0)).toBe(false)
      expect(result.get(1)).toBe(true)
      expect(result.get(2)).toBe(true)
      expect(result.get(3)).toBe(false)
    })

    it('or returns union of bits', () => {
      const a = new Bitmap2(8)
      const b = new Bitmap2(8)
      a.set(0)
      a.set(1)
      b.set(2)
      b.set(3)
      const result = a.or(b)
      expect(result.get(0)).toBe(true)
      expect(result.get(1)).toBe(true)
      expect(result.get(2)).toBe(true)
      expect(result.get(3)).toBe(true)
    })

    it('xor returns symmetric difference', () => {
      const a = new Bitmap2(8)
      const b = new Bitmap2(8)
      a.set(0)
      a.set(1)
      b.set(1)
      b.set(2)
      const result = a.xor(b)
      expect(result.get(0)).toBe(true)
      expect(result.get(1)).toBe(false)
      expect(result.get(2)).toBe(true)
    })

    it('not returns complement', () => {
      const bm = new Bitmap2(4)
      bm.set(1)
      const result = bm.not()
      expect(result.get(0)).toBe(true)
      expect(result.get(1)).toBe(false)
      expect(result.get(2)).toBe(true)
      expect(result.get(3)).toBe(true)
    })

    it('throws for mismatched sizes in and', () => {
      const a = new Bitmap2(8)
      const b = new Bitmap2(16)
      expect(() => a.and(b)).toThrow('Bitmaps must have the same size')
    })

    it('throws for mismatched sizes in or', () => {
      const a = new Bitmap2(8)
      const b = new Bitmap2(16)
      expect(() => a.or(b)).toThrow('Bitmaps must have the same size')
    })

    it('throws for mismatched sizes in xor', () => {
      const a = new Bitmap2(8)
      const b = new Bitmap2(16)
      expect(() => a.xor(b)).toThrow('Bitmaps must have the same size')
    })
  })

  // ─── toString / clone / equals ───
  describe('toString, clone, equals', () => {
    it('toString returns binary string', () => {
      const bm = new Bitmap2(4)
      bm.set(1)
      bm.set(3)
      expect(bm.toString()).toBe('0101')
    })

    it('clone produces an independent copy', () => {
      const bm = new Bitmap2(8)
      bm.set(3)
      const copy = bm.clone()
      expect(copy.equals(bm)).toBe(true)
      copy.clear(3)
      expect(bm.get(3)).toBe(true)
    })

    it('equals returns true for identical bitmaps', () => {
      const a = new Bitmap2(8)
      const b = new Bitmap2(8)
      a.set(2)
      b.set(2)
      expect(a.equals(b)).toBe(true)
    })

    it('equals returns false for different bitmaps', () => {
      const a = new Bitmap2(8)
      const b = new Bitmap2(8)
      a.set(2)
      expect(a.equals(b)).toBe(false)
    })

    it('equals returns false for different sizes', () => {
      const a = new Bitmap2(8)
      const b = new Bitmap2(16)
      expect(a.equals(b)).toBe(false)
    })
  })
})
