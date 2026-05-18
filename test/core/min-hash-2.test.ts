import { describe, it, expect } from 'vitest'
import { MinHash2 } from '../../src/core/min-hash-2/index.js'

describe('MinHash2', () => {
  // ─── Constructor ───

  describe('constructor', () => {
    it('creates instance with default parameters', () => {
      const mh = new MinHash2()
      expect(mh.size()).toBe(0)
    })

    it('creates instance with custom numHashes', () => {
      const mh = new MinHash2(256)
      expect(mh.size()).toBe(0)
      expect(mh.getSignature().length).toBe(256)
    })

    it('creates instance with custom seed', () => {
      const mh = new MinHash2(64, 123)
      expect(mh.size()).toBe(0)
    })

    it('initializes signature with Infinity values', () => {
      const mh = new MinHash2(10)
      const sig = mh.getSignature()
      expect(sig.length).toBe(10)
      for (const val of sig) {
        expect(val).toBe(Infinity)
      }
    })

    it('creates with small numHashes', () => {
      const mh = new MinHash2(1)
      expect(mh.getSignature().length).toBe(1)
    })

    it('creates with large numHashes', () => {
      const mh = new MinHash2(1024)
      expect(mh.getSignature().length).toBe(1024)
    })
  })

  // ─── Add ───

  describe('add', () => {
    it('adds a single item', () => {
      const mh = new MinHash2(64)
      mh.add('hello')
      expect(mh.size()).toBe(1)
    })

    it('adds multiple different items', () => {
      const mh = new MinHash2(64)
      mh.add('a')
      mh.add('b')
      mh.add('c')
      expect(mh.size()).toBe(3)
    })

    it('ignores duplicate items', () => {
      const mh = new MinHash2(64)
      mh.add('same')
      mh.add('same')
      mh.add('same')
      expect(mh.size()).toBe(1)
    })

    it('updates signature after add', () => {
      const mh = new MinHash2(64)
      const sigBefore = [...mh.getSignature()]
      mh.add('test')
      const sigAfter = mh.getSignature()
      let changed = false
      for (let i = 0; i < sigBefore.length; i++) {
        if (sigBefore[i] !== sigAfter[i]) changed = true
      }
      expect(changed).toBe(true)
    })

    it('handles empty string', () => {
      const mh = new MinHash2(64)
      mh.add('')
      expect(mh.size()).toBe(1)
    })

    it('handles unicode strings', () => {
      const mh = new MinHash2(64)
      mh.add('你好')
      mh.add('🎉')
      expect(mh.size()).toBe(2)
    })

    it('handles long strings', () => {
      const mh = new MinHash2(64)
      mh.add('x'.repeat(10000))
      expect(mh.size()).toBe(1)
    })
  })

  // ─── AddAll ───

  describe('addAll', () => {
    it('adds multiple items at once', () => {
      const mh = new MinHash2(64)
      mh.addAll(['a', 'b', 'c'])
      expect(mh.size()).toBe(3)
    })

    it('handles empty array', () => {
      const mh = new MinHash2(64)
      mh.addAll([])
      expect(mh.size()).toBe(0)
    })

    it('deduplicates in addAll', () => {
      const mh = new MinHash2(64)
      mh.addAll(['x', 'x', 'y'])
      expect(mh.size()).toBe(2)
    })

    it('addAll then add same item does not increase size', () => {
      const mh = new MinHash2(64)
      mh.addAll(['a', 'b'])
      mh.add('a')
      expect(mh.size()).toBe(2)
    })
  })

  // ─── Similarity ───

  describe('similarity', () => {
    it('returns 1 for identical sets', () => {
      const mh1 = new MinHash2(128, 42)
      const mh2 = new MinHash2(128, 42)
      mh1.addAll(['a', 'b', 'c'])
      mh2.addAll(['a', 'b', 'c'])
      expect(mh1.similarity(mh2)).toBe(1)
    })

    it('returns 0 for disjoint sets with high probability', () => {
      const mh1 = new MinHash2(256, 42)
      const mh2 = new MinHash2(256, 42)
      for (let i = 0; i < 100; i++) mh1.add(`set1_${i}`)
      for (let i = 0; i < 100; i++) mh2.add(`set2_${i}`)
      expect(mh1.similarity(mh2)).toBeLessThan(0.3)
    })

    it('returns intermediate similarity for overlapping sets', () => {
      const mh1 = new MinHash2(256, 42)
      const mh2 = new MinHash2(256, 42)
      for (let i = 0; i < 100; i++) {
        mh1.add(`shared_${i}`)
        mh1.add(`only1_${i}`)
        mh2.add(`shared_${i}`)
        mh2.add(`only2_${i}`)
      }
      const sim = mh1.similarity(mh2)
      expect(sim).toBeGreaterThan(0)
      expect(sim).toBeLessThan(1)
    })

    it('throws on different numHashes', () => {
      const mh1 = new MinHash2(64)
      const mh2 = new MinHash2(128)
      expect(() => mh1.similarity(mh2)).toThrow('MinHash instances must have same number of hashes')
    })

    it('similarity is symmetric', () => {
      const mh1 = new MinHash2(128, 42)
      const mh2 = new MinHash2(128, 42)
      mh1.addAll(['x', 'y', 'z'])
      mh2.addAll(['y', 'z', 'w'])
      expect(mh1.similarity(mh2)).toBeCloseTo(mh2.similarity(mh1))
    })

    it('returns 1 for empty signatures with same config', () => {
      const mh1 = new MinHash2(64, 42)
      const mh2 = new MinHash2(64, 42)
      expect(mh1.similarity(mh2)).toBe(1)
    })
  })

  // ─── Size ───

  describe('size', () => {
    it('returns 0 for empty set', () => {
      const mh = new MinHash2()
      expect(mh.size()).toBe(0)
    })

    it('increments with each unique add', () => {
      const mh = new MinHash2()
      mh.add('a')
      expect(mh.size()).toBe(1)
      mh.add('b')
      expect(mh.size()).toBe(2)
    })

    it('does not increment for duplicate add', () => {
      const mh = new MinHash2()
      mh.add('a')
      mh.add('a')
      expect(mh.size()).toBe(1)
    })
  })

  // ─── Clear ───

  describe('clear', () => {
    it('clears all items', () => {
      const mh = new MinHash2(64)
      mh.addAll(['a', 'b', 'c'])
      mh.clear()
      expect(mh.size()).toBe(0)
    })

    it('resets signature to Infinity', () => {
      const mh = new MinHash2(10)
      mh.add('test')
      mh.clear()
      const sig = mh.getSignature()
      for (const val of sig) {
        expect(val).toBe(Infinity)
      }
    })

    it('allows add after clear', () => {
      const mh = new MinHash2(64)
      mh.add('before')
      mh.clear()
      mh.add('after')
      expect(mh.size()).toBe(1)
    })
  })

  // ─── GetSignature ───

  describe('getSignature', () => {
    it('returns array of correct length', () => {
      const mh = new MinHash2(50)
      expect(mh.getSignature().length).toBe(50)
    })

    it('signature values change after adding items', () => {
      const mh = new MinHash2(64)
      const sigBefore = [...mh.getSignature()]
      mh.add('item')
      const sigAfter = mh.getSignature()
      let finiteCount = 0
      for (const v of sigAfter) {
        if (v < Infinity) finiteCount++
      }
      expect(finiteCount).toBeGreaterThan(0)
    })

    it('returns a reference to the signature array', () => {
      const mh = new MinHash2(10)
      const sig1 = mh.getSignature()
      const sig2 = mh.getSignature()
      expect(sig1).toBe(sig2)
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('handles many unique items', () => {
      const mh = new MinHash2(128)
      for (let i = 0; i < 500; i++) {
        mh.add(`item_${i}`)
      }
      expect(mh.size()).toBe(500)
    })

    it('handles special characters in items', () => {
      const mh = new MinHash2(64)
      mh.add('!@#$%^&*()')
      mh.add('\n\t\r')
      mh.add('\0')
      expect(mh.size()).toBe(3)
    })

    it('similarity between large identical sets', () => {
      const mh1 = new MinHash2(256, 42)
      const mh2 = new MinHash2(256, 42)
      for (let i = 0; i < 200; i++) {
        mh1.add(`el_${i}`)
        mh2.add(`el_${i}`)
      }
      expect(mh1.similarity(mh2)).toBe(1)
    })

    it('clear and re-populate preserves accuracy', () => {
      const mh = new MinHash2(128, 42)
      for (let i = 0; i < 50; i++) mh.add(`old_${i}`)
      mh.clear()
      const mh2 = new MinHash2(128, 42)
      for (let i = 0; i < 50; i++) {
        mh.add(`new_${i}`)
        mh2.add(`new_${i}`)
      }
      expect(mh.similarity(mh2)).toBe(1)
    })
  })
})
