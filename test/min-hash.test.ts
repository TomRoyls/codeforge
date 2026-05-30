import { describe, it, expect } from 'vitest'
import { MinHash } from '../src/utils/min-hash.js'

describe('MinHash', () => {
  describe('constructor', () => {
    it('creates with default numHashes', () => {
      const mh = new MinHash()
      expect(mh.numHashes).toBe(128)
    })

    it('creates with custom numHashes and seed', () => {
      const mh = new MinHash(64, 42)
      expect(mh.numHashes).toBe(64)
    })

    it('throws for numHashes < 1', () => {
      expect(() => new MinHash(0)).toThrow(RangeError)
      expect(() => new MinHash(-1)).toThrow(RangeError)
    })
  })

  describe('add and addBatch', () => {
    it('adds elements and updates signature', () => {
      const mh = new MinHash(32)
      mh.add('hello')
      const sig = mh.signature
      expect(sig.length).toBe(32)
      expect(sig.some(v => v !== Infinity)).toBe(true)
    })

    it('addBatch adds multiple elements', () => {
      const mh = new MinHash(32)
      mh.addBatch(['a', 'b', 'c'])
      expect(mh.signature.some(v => v !== Infinity)).toBe(true)
    })
  })

  describe('similarity', () => {
    it('returns ~1 for identical sets', () => {
      const a = new MinHash(128, 0)
      const b = new MinHash(128, 0)
      const items = ['apple', 'banana', 'cherry', 'date']
      for (const item of items) {
        a.add(item)
        b.add(item)
      }
      expect(a.similarity(b)).toBeGreaterThan(0.9)
    })

    it('returns ~0 for disjoint sets', () => {
      const a = new MinHash(128, 0)
      const b = new MinHash(128, 0)
      for (let i = 0; i < 100; i++) a.add(`setA-${i}`)
      for (let i = 0; i < 100; i++) b.add(`setB-${i}`)
      expect(a.similarity(b)).toBeLessThan(0.3)
    })

    it('throws for different numHashes', () => {
      const a = new MinHash(64)
      const b = new MinHash(128)
      expect(() => a.similarity(b)).toThrow()
    })

    it('returns intermediate similarity for partial overlap', () => {
      const a = new MinHash(256, 0)
      const b = new MinHash(256, 0)
      for (let i = 0; i < 100; i++) {
        a.add(`shared-${i}`)
        b.add(`shared-${i}`)
      }
      for (let i = 0; i < 100; i++) a.add(`only-a-${i}`)
      for (let i = 0; i < 100; i++) b.add(`only-b-${i}`)
      const sim = a.similarity(b)
      expect(sim).toBeGreaterThan(0.15)
      expect(sim).toBeLessThan(0.65)
    })
  })

  describe('jaccardEstimate', () => {
    it('returns 0 for empty', () => {
      expect(new MinHash().jaccardEstimate()).toBe(0)
    })

    it('returns positive value after adding data', () => {
      const mh = new MinHash(64)
      mh.addBatch(['x', 'y', 'z'])
      expect(mh.jaccardEstimate()).toBeGreaterThan(0)
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const mh = new MinHash(32)
      mh.add('hello')
      const copy = mh.clone()
      copy.add('world')
      expect(mh.signature).not.toEqual(copy.signature)
    })
  })

  describe('merge', () => {
    it('merges two minhashes', () => {
      const a = new MinHash(64, 0)
      const b = new MinHash(64, 0)
      a.add('apple')
      b.add('banana')
      a.merge(b)
      expect(a.signature.every((v, i) => v <= b.signature[i]!)).toBe(true)
    })

    it('throws for different numHashes', () => {
      const a = new MinHash(32)
      const b = new MinHash(64)
      expect(() => a.merge(b)).toThrow()
    })
  })

  describe('static estimateJaccard', () => {
    it('estimates Jaccard for identical sets', () => {
      const set = new Set(['a', 'b', 'c'])
      expect(MinHash.estimateJaccard(set, set)).toBeGreaterThan(0.8)
    })

    it('estimates Jaccard for disjoint sets', () => {
      const a = new Set(Array.from({ length: 100 }, (_, i) => `a-${i}`))
      const b = new Set(Array.from({ length: 100 }, (_, i) => `b-${i}`))
      expect(MinHash.estimateJaccard(a, b)).toBeLessThan(0.2)
    })
  })

  describe('size', () => {
    it('returns 0 for empty', () => {
      expect(new MinHash().size).toBe(0)
    })

    it('returns positive after adding', () => {
      const mh = new MinHash(64)
      mh.addBatch(Array.from({ length: 50 }, (_, i) => `item-${i}`))
      expect(mh.size).toBeGreaterThan(0)
    })
  })
})
