import { describe, it, expect } from 'vitest'
import { SparseBitSet } from '../../../src/utils/sparse-bitset.js'

describe('SparseBitSet', () => {
  describe('set and get', () => {
    it('sets and gets bits', () => {
      const bs = new SparseBitSet()
      bs.set(5)
      expect(bs.get(5)).toBe(true)
      expect(bs.get(4)).toBe(false)
    })

    it('handles index 0', () => {
      const bs = new SparseBitSet()
      bs.set(0)
      expect(bs.get(0)).toBe(true)
    })

    it('handles large indices', () => {
      const bs = new SparseBitSet()
      bs.set(1000000)
      expect(bs.get(1000000)).toBe(true)
      expect(bs.get(999999)).toBe(false)
    })

    it('rejects negative indices', () => {
      const bs = new SparseBitSet()
      bs.set(-1)
      expect(bs.get(-1)).toBe(false)
    })

    it('does not double count', () => {
      const bs = new SparseBitSet()
      bs.set(5)
      bs.set(5)
      expect(bs.size).toBe(1)
    })
  })

  describe('clear', () => {
    it('clears a bit', () => {
      const bs = new SparseBitSet()
      bs.set(5)
      bs.clear(5)
      expect(bs.get(5)).toBe(false)
      expect(bs.size).toBe(0)
    })

    it('clearing unset bit is no-op', () => {
      const bs = new SparseBitSet()
      bs.set(5)
      bs.clear(10)
      expect(bs.size).toBe(1)
    })
  })

  describe('flip', () => {
    it('flips bits', () => {
      const bs = new SparseBitSet()
      bs.flip(5)
      expect(bs.get(5)).toBe(true)
      bs.flip(5)
      expect(bs.get(5)).toBe(false)
    })
  })

  describe('and', () => {
    it('computes intersection', () => {
      const a = new SparseBitSet()
      a.set(1); a.set(3); a.set(5)
      const b = new SparseBitSet()
      b.set(3); b.set(5); b.set(7)
      a.and(b)
      expect(a.get(1)).toBe(false)
      expect(a.get(3)).toBe(true)
      expect(a.get(5)).toBe(true)
      expect(a.get(7)).toBe(false)
    })
  })

  describe('or', () => {
    it('computes union', () => {
      const a = new SparseBitSet()
      a.set(1); a.set(3)
      const b = new SparseBitSet()
      b.set(5); b.set(7)
      a.or(b)
      expect(a.toArray().sort((x, y) => x - y)).toEqual([1, 3, 5, 7])
    })
  })

  describe('xor', () => {
    it('computes symmetric difference', () => {
      const a = new SparseBitSet()
      a.set(1); a.set(3); a.set(5)
      const b = new SparseBitSet()
      b.set(3); b.set(5); b.set(7)
      a.xor(b)
      expect(a.toArray().sort((x, y) => x - y)).toEqual([1, 7])
    })
  })

  describe('nextSetBit', () => {
    it('finds next set bit', () => {
      const bs = new SparseBitSet()
      bs.set(5); bs.set(10); bs.set(15)
      expect(bs.nextSetBit(0)).toBe(5)
      expect(bs.nextSetBit(6)).toBe(10)
      expect(bs.nextSetBit(11)).toBe(15)
    })

    it('returns -1 when no more bits', () => {
      const bs = new SparseBitSet()
      bs.set(5)
      expect(bs.nextSetBit(6)).toBe(-1)
    })
  })

  describe('toArray', () => {
    it('returns all set indices', () => {
      const bs = new SparseBitSet()
      bs.set(100); bs.set(5); bs.set(50)
      expect(bs.toArray().sort((x, y) => x - y)).toEqual([5, 50, 100])
    })

    it('returns empty for empty set', () => {
      const bs = new SparseBitSet()
      expect(bs.toArray()).toEqual([])
    })
  })

  describe('memory efficiency', () => {
    it('uses few chunks for sparse data', () => {
      const bs = new SparseBitSet()
      bs.set(0)
      bs.set(1000000)
      expect(bs.memoryChunks).toBe(2)
    })

    it('uses many chunks for dense data', () => {
      const bs = new SparseBitSet()
      for (let i = 0; i < 100; i++) bs.set(i)
      expect(bs.memoryChunks).toBe(4)
    })
  })

  describe('isEmpty', () => {
    it('returns true for empty', () => {
      const bs = new SparseBitSet()
      expect(bs.isEmpty).toBe(true)
    })

    it('returns false after set', () => {
      const bs = new SparseBitSet()
      bs.set(1)
      expect(bs.isEmpty).toBe(false)
    })
  })

  describe('stress', () => {
    it('handles many operations', () => {
      const bs = new SparseBitSet()
      for (let i = 0; i < 1000; i++) bs.set(i * 7)
      expect(bs.size).toBe(1000)
      for (let i = 0; i < 500; i++) bs.clear(i * 7)
      expect(bs.size).toBe(500)
    })
  })
})
