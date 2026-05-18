import { describe, it, expect } from 'vitest'
import { CatMap2 } from '../../src/core/cat-map-2/index.js'

describe('CatMap2', () => {

  // ─── Constructor ───

  describe('constructor', () => {
    it('should create from pairs', () => {
      const cm = new CatMap2<number>([[1, 2], [3, 4]])
      expect(cm.size()).toBe(2)
    })

    it('should create empty map from empty pairs', () => {
      const cm = new CatMap2<number>([])
      expect(cm.size()).toBe(0)
      expect(cm.isEmpty()).toBe(true)
    })
  })

  // ─── Apply ───

  describe('apply', () => {
    it('should map a value to its pair', () => {
      const cm = new CatMap2([['a', 'b']] as [string, string][])
      expect(cm.apply('a')).toBe('b')
    })

    it('should return undefined for unmapped value', () => {
      const cm = new CatMap2([['a', 'b']] as [string, string][])
      expect(cm.apply('z')).toBeUndefined()
    })

    it('should handle numeric mapping', () => {
      const cm = new CatMap2<number>([[1, 10], [2, 20]])
      expect(cm.apply(1)).toBe(10)
      expect(cm.apply(2)).toBe(20)
    })
  })

  // ─── Invert ───

  describe('invert', () => {
    it('should return the inverse mapping', () => {
      const cm = new CatMap2([['a', 'b']] as [string, string][])
      expect(cm.invert('b')).toBe('a')
    })

    it('should return undefined for non-image value', () => {
      const cm = new CatMap2([['a', 'b']] as [string, string][])
      expect(cm.invert('z')).toBeUndefined()
    })

    it('should handle multiple pairs', () => {
      const cm = new CatMap2<number>([[1, 2], [3, 4]])
      expect(cm.invert(2)).toBe(1)
      expect(cm.invert(4)).toBe(3)
    })
  })

  // ─── Has ───

  describe('has', () => {
    it('should return true for values in domain', () => {
      const cm = new CatMap2<number>([[1, 2]])
      expect(cm.has(1)).toBe(true)
      expect(cm.has(2)).toBe(true)
    })

    it('should return false for values not in domain', () => {
      const cm = new CatMap2<number>([[1, 2]])
      expect(cm.has(3)).toBe(false)
    })
  })

  // ─── GetDomain ───

  describe('getDomain', () => {
    it('should return all unique values from both sides', () => {
      const cm = new CatMap2<number>([[1, 2], [3, 4]])
      const domain = cm.getDomain()
      expect(domain.sort()).toEqual([1, 2, 3, 4])
    })

    it('should deduplicate shared values', () => {
      const cm = new CatMap2<number>([[1, 1], [2, 3]])
      const domain = cm.getDomain().sort()
      expect(domain).toEqual([1, 2, 3])
    })
  })

  // ─── Size & IsEmpty ───

  describe('size and isEmpty', () => {
    it('should report correct size', () => {
      const cm = new CatMap2<number>([[1, 2], [3, 4], [5, 6]])
      expect(cm.size()).toBe(3)
    })

    it('should report empty for no pairs', () => {
      const cm = new CatMap2<number>([])
      expect(cm.isEmpty()).toBe(true)
      expect(cm.size()).toBe(0)
    })

    it('should report non-empty for pairs', () => {
      const cm = new CatMap2<number>([[1, 2]])
      expect(cm.isEmpty()).toBe(false)
    })
  })

  // ─── Compose ───

  describe('compose', () => {
    it('should compose two maps', () => {
      const f = new CatMap2<number>([[1, 2], [3, 4]])
      const g = new CatMap2<number>([[2, 5], [4, 6]])
      const composed = f.compose(g)
      expect(composed.apply(1)).toBe(5)
      expect(composed.apply(3)).toBe(6)
    })

    it('should skip pairs where second map has no mapping', () => {
      const f = new CatMap2<number>([[1, 2], [3, 99]])
      const g = new CatMap2<number>([[2, 5]])
      const composed = f.compose(g)
      expect(composed.apply(1)).toBe(5)
      expect(composed.apply(3)).toBeUndefined()
      expect(composed.size()).toBe(1)
    })

    it('should return empty when no overlapping', () => {
      const f = new CatMap2<number>([[1, 2]])
      const g = new CatMap2<number>([[99, 100]])
      const composed = f.compose(g)
      expect(composed.size()).toBe(0)
    })
  })

  // ─── IsPermutation ───

  describe('isPermutation', () => {
    it('should return true for a bijective map', () => {
      const cm = new CatMap2<number>([[1, 2], [3, 4]])
      expect(cm.isPermutation()).toBe(true)
    })

    it('should return false for non-injective map', () => {
      const cm = new CatMap2<number>([[1, 2], [3, 2]])
      expect(cm.isPermutation()).toBe(false)
    })

    it('should return false for empty map', () => {
      const cm = new CatMap2<number>([])
      expect(cm.isPermutation()).toBe(false)
    })

    it('should return true for identity map', () => {
      const cm = new CatMap2<number>([[1, 1], [2, 2]])
      expect(cm.isPermutation()).toBe(true)
    })
  })

  // ─── IsIdentity ───

  describe('isIdentity', () => {
    it('should return true for identity mapping', () => {
      const cm = new CatMap2<number>([[1, 1], [2, 2]])
      expect(cm.isIdentity()).toBe(true)
    })

    it('should return false for non-identity mapping', () => {
      const cm = new CatMap2<number>([[1, 2]])
      expect(cm.isIdentity()).toBe(false)
    })

    it('should return false for empty map', () => {
      const cm = new CatMap2<number>([])
      expect(cm.isIdentity()).toBe(false)
    })

    it('should return false for partially identity', () => {
      const cm = new CatMap2<number>([[1, 1], [2, 3]])
      expect(cm.isIdentity()).toBe(false)
    })
  })

  // ─── GetPairs ───

  describe('getPairs', () => {
    it('should return all pairs', () => {
      const cm = new CatMap2<number>([[1, 2], [3, 4]])
      const pairs = cm.getPairs()
      expect(pairs).toEqual([[1, 2], [3, 4]])
    })

    it('should return empty for empty map', () => {
      const cm = new CatMap2<number>([])
      expect(cm.getPairs()).toEqual([])
    })
  })

  // ─── Power ───

  describe('power', () => {
    it('should return identity-equivalent for power 1', () => {
      const cm = new CatMap2<number>([[1, 2], [2, 3]])
      const p1 = cm.power(1)
      expect(p1.apply(1)).toBe(2)
      expect(p1.apply(2)).toBe(3)
    })

    it('should compose with itself for power 2', () => {
      const cm = new CatMap2<number>([[1, 2], [2, 3]])
      const p2 = cm.power(2)
      expect(p2.apply(1)).toBe(3)
    })

    it('should return empty map for power 0', () => {
      const cm = new CatMap2<number>([[1, 2]])
      const p0 = cm.power(0)
      expect(p0.size()).toBe(0)
    })

    it('should return empty map for negative power', () => {
      const cm = new CatMap2<number>([[1, 2]])
      const pn = cm.power(-1)
      expect(pn.size()).toBe(0)
    })

    it('should handle power greater than reachable chain', () => {
      const cm = new CatMap2<number>([[1, 2], [2, 3]])
      const p3 = cm.power(3)
      expect(p3.size()).toBe(0)
    })
  })
})
