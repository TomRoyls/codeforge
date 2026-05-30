import { describe, it, expect } from 'vitest'
import { VanEmdeBoas } from '../src/utils/van-emde-boas.js'

describe('VanEmdeBoas', () => {
  describe('constructor', () => {
    it('creates with power-of-2 universe', () => {
      const veb = new VanEmdeBoas(16)
      expect(veb.universeSize).toBe(16)
      expect(veb.isEmpty()).toBe(true)
    })

    it('throws for non-power-of-2', () => {
      expect(() => new VanEmdeBoas(3)).toThrow(RangeError)
      expect(() => new VanEmdeBoas(5)).toThrow(RangeError)
    })

    it('throws for size < 2', () => {
      expect(() => new VanEmdeBoas(1)).toThrow(RangeError)
      expect(() => new VanEmdeBoas(0)).toThrow(RangeError)
    })

    it('handles minimum size of 2', () => {
      const veb = new VanEmdeBoas(2)
      expect(veb.universeSize).toBe(2)
    })
  })

  describe('insert and contains', () => {
    it('inserts and finds a value', () => {
      const veb = new VanEmdeBoas(16)
      veb.insert(5)
      expect(veb.contains(5)).toBe(true)
      expect(veb.has(5)).toBe(true)
    })

    it('does not find uninserted value', () => {
      const veb = new VanEmdeBoas(16)
      veb.insert(5)
      expect(veb.contains(3)).toBe(false)
    })

    it('handles duplicate insert', () => {
      const veb = new VanEmdeBoas(16)
      veb.insert(5)
      veb.insert(5)
      expect(veb.size).toBe(1)
    })

    it('inserts multiple values', () => {
      const veb = new VanEmdeBoas(16)
      for (let i = 0; i < 16; i++) veb.insert(i)
      expect(veb.size).toBe(16)
      for (let i = 0; i < 16; i++) {
        expect(veb.contains(i)).toBe(true)
      }
    })

    it('rejects values outside universe', () => {
      const veb = new VanEmdeBoas(16)
      veb.insert(-1)
      veb.insert(16)
      expect(veb.size).toBe(0)
    })
  })

  describe('min / max', () => {
    it('returns undefined for empty', () => {
      const veb = new VanEmdeBoas(16)
      expect(veb.min()).toBeUndefined()
      expect(veb.max()).toBeUndefined()
    })

    it('tracks min and max', () => {
      const veb = new VanEmdeBoas(16)
      veb.insert(5)
      veb.insert(10)
      veb.insert(3)
      expect(veb.min()).toBe(3)
      expect(veb.max()).toBe(10)
    })
  })

  describe('delete', () => {
    it('deletes a value', () => {
      const veb = new VanEmdeBoas(16)
      veb.insert(5)
      veb.delete(5)
      expect(veb.contains(5)).toBe(false)
      expect(veb.size).toBe(0)
      expect(veb.isEmpty()).toBe(true)
    })

    it('does nothing for missing value', () => {
      const veb = new VanEmdeBoas(16)
      veb.insert(5)
      veb.delete(3)
      expect(veb.size).toBe(1)
    })

    it('updates min/max after deletion', () => {
      const veb = new VanEmdeBoas(16)
      veb.insert(3)
      veb.insert(7)
      veb.insert(10)
      veb.delete(3)
      expect(veb.min()).toBe(7)
      veb.delete(10)
      expect(veb.max()).toBe(7)
    })

    it('handles delete all', () => {
      const veb = new VanEmdeBoas(16)
      veb.insert(5)
      veb.insert(10)
      veb.delete(5)
      veb.delete(10)
      expect(veb.isEmpty()).toBe(true)
    })
  })

  describe('successor', () => {
    it('finds successor', () => {
      const veb = new VanEmdeBoas(16)
      veb.insert(3)
      veb.insert(7)
      veb.insert(12)
      expect(veb.successor(3)).toBe(7)
      expect(veb.successor(7)).toBe(12)
    })

    it('returns undefined if no successor', () => {
      const veb = new VanEmdeBoas(16)
      veb.insert(10)
      expect(veb.successor(10)).toBeUndefined()
    })

    it('returns undefined for empty', () => {
      expect(new VanEmdeBoas(16).successor(5)).toBeUndefined()
    })
  })

  describe('predecessor', () => {
    it('finds predecessor', () => {
      const veb = new VanEmdeBoas(16)
      veb.insert(3)
      veb.insert(7)
      veb.insert(12)
      expect(veb.predecessor(7)).toBe(3)
      expect(veb.predecessor(12)).toBe(7)
    })

    it('returns undefined if no predecessor', () => {
      const veb = new VanEmdeBoas(16)
      veb.insert(5)
      expect(veb.predecessor(5)).toBeUndefined()
    })
  })

  describe('clear', () => {
    it('clears all values', () => {
      const veb = new VanEmdeBoas(16)
      veb.insert(5)
      veb.insert(10)
      veb.clear()
      expect(veb.isEmpty()).toBe(true)
      expect(veb.size).toBe(0)
    })
  })

  describe('base case (universe=2)', () => {
    it('handles universe size 2', () => {
      const veb = new VanEmdeBoas(2)
      veb.insert(0)
      veb.insert(1)
      expect(veb.min()).toBe(0)
      expect(veb.max()).toBe(1)
      expect(veb.size).toBe(2)
    })

    it('deletes from base case', () => {
      const veb = new VanEmdeBoas(2)
      veb.insert(0)
      veb.insert(1)
      veb.delete(0)
      expect(veb.min()).toBe(1)
      expect(veb.max()).toBe(1)
    })
  })

  describe('larger universe', () => {
    it('handles universe size 256', () => {
      const veb = new VanEmdeBoas(256)
      veb.insert(0)
      veb.insert(100)
      veb.insert(255)
      expect(veb.min()).toBe(0)
      expect(veb.max()).toBe(255)
      expect(veb.successor(0)).toBe(100)
      expect(veb.predecessor(255)).toBe(100)
    })
  })
})
