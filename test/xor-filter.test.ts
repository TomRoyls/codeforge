import { describe, it, expect } from 'vitest'
import { XorFilter } from '../src/core/xor-filter/index.js'
import type { HashFunction } from '../src/core/xor-filter/types.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('XorFilter', () => {
  describe('constructor', () => {
    it('creates filter from array of strings', () => {
      const f = new XorFilter(['apple', 'banana', 'cherry'])
      expect(f.size).toBe(3)
    })

    it('deduplicates input elements', () => {
      const f = new XorFilter(['a', 'b', 'a', 'b'])
      expect(f.size).toBe(2)
    })

    it('handles empty array', () => {
      const f = new XorFilter([])
      expect(f.size).toBe(0)
    })

    it('handles single element', () => {
      const f = new XorFilter(['solo'])
      expect(f.has('solo')).toBe(true)
      expect(f.size).toBe(1)
    })

    it('accepts custom seed', () => {
      const f = new XorFilter(['x', 'y', 'z'], { seed: 42 })
      expect(f.has('x')).toBe(true)
      expect(f.has('y')).toBe(true)
    })
  })

  // ─── has / mightContain ───────────────────────────────────────────────

  describe('has', () => {
    it('returns true for all inserted elements', () => {
      const items = ['alpha', 'beta', 'gamma', 'delta']
      const f = new XorFilter(items)
      for (const item of items) {
        expect(f.has(item)).toBe(true)
      }
    })

    it('returns false for empty filter on any query', () => {
      const f = new XorFilter([])
      expect(f.has('anything')).toBe(false)
    })
  })

  describe('mightContain', () => {
    it('returns true for inserted elements', () => {
      const f = new XorFilter(['foo', 'bar'])
      expect(f.mightContain('foo')).toBe(true)
    })
  })

  // ─── size / capacity / fingerprintCount ───────────────────────────────

  describe('properties', () => {
    it('size returns number of unique elements', () => {
      const f = new XorFilter(['a', 'b', 'c', 'd', 'e'])
      expect(f.size).toBe(5)
    })

    it('capacity equals size', () => {
      const f = new XorFilter(['x', 'y'])
      expect(f.capacity).toBe(2)
    })

    it('fingerprintCount is greater than zero for non-empty', () => {
      const f = new XorFilter(['test'])
      expect(f.fingerprintCount).toBeGreaterThan(0)
    })

    it('falsePositiveRate is 1/256', () => {
      const f = new XorFilter(['a'])
      expect(f.falsePositiveRate).toBeCloseTo(1 / 256)
    })
  })

  // ─── clone ────────────────────────────────────────────────────────────

  describe('clone', () => {
    it('produces an independent copy', () => {
      const f = new XorFilter(['a', 'b', 'c'])
      const c = f.clone()
      expect(c.size).toBe(3)
      expect(c.has('a')).toBe(true)
      expect(c.equals(f)).toBe(true)
    })
  })

  // ─── serialize / deserialize ──────────────────────────────────────────

  describe('serialize and deserialize', () => {
    it('round-trips through serialize/deserialize', () => {
      const original = new XorFilter(['hello', 'world', 'test'])
      const data = original.serialize()
      const restored = XorFilter.deserialize(data)
      expect(restored.size).toBe(3)
      expect(restored.has('hello')).toBe(true)
      expect(restored.has('world')).toBe(true)
      expect(restored.has('test')).toBe(true)
    })

    it('deserialize preserves fingerprint data', () => {
      const f1 = new XorFilter(['x', 'y', 'z'])
      const data = f1.serialize()
      const f2 = XorFilter.deserialize(data)
      expect(f2.equals(f1)).toBe(true)
    })

    it('works with custom hash function', () => {
      const customHash: HashFunction = (el: string, seed: number) => {
        let h = seed
        for (let i = 0; i < el.length; i++) {
          h = ((h << 5) - h + el.charCodeAt(i)) | 0
        }
        return h >>> 0
      }
      const f1 = new XorFilter(['a', 'b'], { hashFunction: customHash })
      const data = f1.serialize()
      const f2 = XorFilter.deserialize(data, customHash)
      expect(f2.has('a')).toBe(true)
      expect(f2.has('b')).toBe(true)
    })
  })

  // ─── from ─────────────────────────────────────────────────────────────

  describe('from', () => {
    it('static from creates a filter', () => {
      const f = XorFilter.from(['p', 'q', 'r'])
      expect(f.size).toBe(3)
      expect(f.has('p')).toBe(true)
    })
  })

  // ─── equals ───────────────────────────────────────────────────────────

  describe('equals', () => {
    it('same elements produce equal filters with same seed', () => {
      const f1 = new XorFilter(['a', 'b'], { seed: 0 })
      const f2 = new XorFilter(['a', 'b'], { seed: 0 })
      expect(f1.equals(f2)).toBe(true)
    })

    it('different elements produce different filters', () => {
      const f1 = new XorFilter(['a'])
      const f2 = new XorFilter(['b'])
      expect(f1.equals(f2)).toBe(false)
    })
  })

  // ─── false positive behavior ──────────────────────────────────────────

  describe('false positive rate', () => {
    it('has low false positive rate for non-member queries', () => {
      const elements = Array.from({ length: 100 }, (_, i) => `elem_${i}`)
      const f = new XorFilter(elements)
      let falsePositives = 0
      for (let i = 200; i < 400; i++) {
        if (f.has(`elem_${i}`)) falsePositives++
      }
      expect(falsePositives).toBeLessThan(10)
    })
  })
})
