import { describe, it, expect } from 'vitest'
import { RadixMap2 } from '../../src/core/radix-map-2/index.js'

describe('RadixMap2', () => {
  describe('constructor', () => {
    it('creates empty map', () => {
      const rm = new RadixMap2<number>()
      expect(rm.size).toBe(0)
      expect(rm.isEmpty()).toBe(true)
    })
  })

  // ─── set / get / has ───

  describe('set / get / has', () => {
    it('sets and gets a value', () => {
      const rm = new RadixMap2<string>()
      rm.set(5, 'five')
      expect(rm.get(5)).toBe('five')
      expect(rm.has(5)).toBe(true)
    })

    it('returns undefined for missing key', () => {
      const rm = new RadixMap2<number>()
      expect(rm.get(42)).toBeUndefined()
      expect(rm.has(42)).toBe(false)
    })

    it('overwrites existing key', () => {
      const rm = new RadixMap2<number>()
      rm.set(5, 10)
      rm.set(5, 20)
      expect(rm.get(5)).toBe(20)
      expect(rm.size).toBe(1)
    })

    it('stores multiple keys', () => {
      const rm = new RadixMap2<number>()
      rm.set(1, 10)
      rm.set(2, 20)
      rm.set(3, 30)
      expect(rm.size).toBe(3)
    })

    it('handles key 0', () => {
      const rm = new RadixMap2<string>()
      rm.set(0, 'zero')
      expect(rm.get(0)).toBe('zero')
    })
  })

  // ─── delete ───

  describe('delete', () => {
    it('deletes existing key', () => {
      const rm = new RadixMap2<number>()
      rm.set(5, 50)
      expect(rm.delete(5)).toBe(true)
      expect(rm.has(5)).toBe(false)
      expect(rm.size).toBe(0)
    })

    it('returns false for missing key', () => {
      const rm = new RadixMap2<number>()
      expect(rm.delete(99)).toBe(false)
    })

    it('deletes from middle of sorted entries', () => {
      const rm = new RadixMap2<number>()
      rm.set(1, 10)
      rm.set(3, 30)
      rm.set(5, 50)
      rm.delete(3)
      expect(rm.size).toBe(2)
      expect(rm.has(3)).toBe(false)
      expect(rm.get(1)).toBe(10)
      expect(rm.get(5)).toBe(50)
    })
  })

  // ─── min / max ───

  describe('min / max', () => {
    it('returns undefined for empty map', () => {
      const rm = new RadixMap2<number>()
      expect(rm.min()).toBeUndefined()
      expect(rm.max()).toBeUndefined()
    })

    it('returns min and max for positive keys', () => {
      const rm = new RadixMap2<number>()
      rm.set(10, 'a')
      rm.set(5, 'b')
      rm.set(20, 'c')
      expect(rm.min()).toBe(5)
      expect(rm.max()).toBe(20)
    })

    it('handles negative keys', () => {
      const rm = new RadixMap2<number>()
      rm.set(-5, 'a')
      rm.set(5, 'b')
      rm.set(-1, 'c')
      expect(rm.min()).toBe(-5)
      expect(rm.max()).toBe(5)
    })
  })

  // ─── keys / values / entries ───

  describe('keys / values / entries', () => {
    it('returns empty for empty map', () => {
      const rm = new RadixMap2<number>()
      expect(rm.keys()).toEqual([])
      expect(rm.values()).toEqual([])
      expect(rm.entries()).toEqual([])
    })

    it('returns keys in sorted order', () => {
      const rm = new RadixMap2<string>()
      rm.set(30, 'c')
      rm.set(10, 'a')
      rm.set(20, 'b')
      expect(rm.keys()).toEqual([10, 20, 30])
    })

    it('returns values in key order', () => {
      const rm = new RadixMap2<string>()
      rm.set(30, 'c')
      rm.set(10, 'a')
      rm.set(20, 'b')
      expect(rm.values()).toEqual(['a', 'b', 'c'])
    })

    it('returns entries in key order', () => {
      const rm = new RadixMap2<string>()
      rm.set(30, 'c')
      rm.set(10, 'a')
      rm.set(20, 'b')
      expect(rm.entries()).toEqual([[10, 'a'], [20, 'b'], [30, 'c']])
    })
  })

  // ─── sorting with negatives ───

  describe('negative key sorting', () => {
    it('sorts negative and positive keys correctly', () => {
      const rm = new RadixMap2<string>()
      rm.set(5, 'pos')
      rm.set(-3, 'neg3')
      rm.set(-10, 'neg10')
      rm.set(1, 'one')
      expect(rm.keys()).toEqual([-10, -3, 1, 5])
    })

    it('handles all negative keys', () => {
      const rm = new RadixMap2<string>()
      rm.set(-1, 'a')
      rm.set(-5, 'b')
      rm.set(-3, 'c')
      expect(rm.keys()).toEqual([-5, -3, -1])
    })
  })

  // ─── clear ───

  describe('clear', () => {
    it('clears all entries', () => {
      const rm = new RadixMap2<number>()
      rm.set(1, 10)
      rm.set(2, 20)
      rm.clear()
      expect(rm.size).toBe(0)
      expect(rm.isEmpty()).toBe(true)
      expect(rm.keys()).toEqual([])
    })
  })

  // ─── edge cases ───

  describe('edge cases', () => {
    it('handles single element', () => {
      const rm = new RadixMap2<number>()
      rm.set(42, 100)
      expect(rm.size).toBe(1)
      expect(rm.min()).toBe(42)
      expect(rm.max()).toBe(42)
      expect(rm.get(42)).toBe(100)
    })

    it('handles duplicate insert with different values', () => {
      const rm = new RadixMap2<number>()
      rm.set(5, 1)
      rm.set(5, 2)
      rm.set(5, 3)
      expect(rm.size).toBe(1)
      expect(rm.get(5)).toBe(3)
    })

    it('handles large keys', () => {
      const rm = new RadixMap2<string>()
      rm.set(1000000, 'big')
      rm.set(1, 'small')
      expect(rm.keys()).toEqual([1, 1000000])
    })
  })
})
