import { describe, it, expect, beforeEach } from 'vitest'
import { MinHash } from '../../src/core/min-hash/min-hash.js'
import { DEFAULT_MINHASH_OPTIONS } from '../../src/core/min-hash/types.js'
import type { MinHashOptions, MinHashJSON } from '../../src/core/min-hash/types.js'

describe('MinHash', () => {
  let mh: MinHash

  beforeEach(() => {
    mh = new MinHash()
  })

  describe('constructor', () => {
    it('should create a MinHash with default options (128 hashes)', () => {
      const m = new MinHash()
      expect(m.numHashes).toBe(128)
      expect(m.size).toBe(0)
    })

    it('should accept positional arguments: numHashes, seed', () => {
      const m = new MinHash(64, 42)
      expect(m.numHashes).toBe(64)
    })

    it('should accept options object', () => {
      const m = new MinHash({ numHashes: 256, seed: 99 })
      expect(m.numHashes).toBe(256)
    })

    it('should accept partial options object with defaults', () => {
      const m = new MinHash({ numHashes: 32 })
      expect(m.numHashes).toBe(32)
    })

    it('should accept only seed in options', () => {
      const m = new MinHash({ seed: 12345 })
      expect(m.numHashes).toBe(128)
    })

    it('should throw for numHashes < 1', () => {
      expect(() => new MinHash(0)).toThrow(RangeError)
    })

    it('should throw for negative numHashes', () => {
      expect(() => new MinHash(-5)).toThrow(RangeError)
    })

    it('should work with numHashes = 1', () => {
      const m = new MinHash(1)
      expect(m.numHashes).toBe(1)
    })

    it('should work with large numHashes', () => {
      const m = new MinHash(1024)
      expect(m.numHashes).toBe(1024)
    })

    it('should create empty MinHash', () => {
      expect(mh.isEmpty()).toBe(true)
      expect(mh.size).toBe(0)
    })

    it('should produce different signatures for different seeds', () => {
      const m1 = new MinHash(64, 1)
      const m2 = new MinHash(64, 2)
      m1.add('test')
      m2.add('test')
      const sig1 = m1.signature()
      const sig2 = m2.signature()
      let same = 0
      for (let i = 0; i < 64; i++) {
        if (sig1[i] === sig2[i]) same++
      }
      expect(same).toBeLessThan(64)
    })
  })

  describe('add', () => {
    it('should add a single item', () => {
      mh.add('hello')
      expect(mh.size).toBe(1)
    })

    it('should add multiple different items', () => {
      mh.add('a')
      mh.add('b')
      mh.add('c')
      expect(mh.size).toBe(3)
    })

    it('should not count duplicate adds', () => {
      mh.add('test')
      mh.add('test')
      expect(mh.size).toBe(1)
    })

    it('should handle empty string', () => {
      mh.add('')
      expect(mh.size).toBe(1)
    })

    it('should handle unicode strings', () => {
      mh.add('日本語')
      mh.add('🎉🚀')
      expect(mh.size).toBe(2)
    })

    it('should handle very long strings', () => {
      mh.add('a'.repeat(10000))
      expect(mh.size).toBe(1)
    })

    it('should handle special characters', () => {
      mh.add('hello\nworld\t!')
      mh.add('path/to/file.ts')
      expect(mh.size).toBe(2)
    })

    it('should handle whitespace-only strings', () => {
      mh.add('   ')
      mh.add('\t')
      mh.add('\n')
      expect(mh.size).toBe(3)
    })

    it('should handle numeric strings', () => {
      mh.add('123')
      mh.add('456')
      expect(mh.size).toBe(2)
    })

    it('should handle strings with null characters', () => {
      mh.add('before\0after')
      expect(mh.size).toBe(1)
    })

    it('should update signature after add', () => {
      const sigBefore = mh.signature()
      mh.add('item')
      const sigAfter = mh.signature()
      let changed = false
      for (let i = 0; i < sigBefore.length; i++) {
        if (sigBefore[i] !== sigAfter[i]) changed = true
      }
      expect(changed).toBe(true)
    })
  })

  describe('addSet', () => {
    it('should add multiple items at once', () => {
      mh.addSet(['a', 'b', 'c'])
      expect(mh.size).toBe(3)
    })

    it('should handle empty array', () => {
      mh.addSet([])
      expect(mh.size).toBe(0)
    })

    it('should deduplicate items', () => {
      mh.addSet(['a', 'a', 'b'])
      expect(mh.size).toBe(2)
    })

    it('should handle large sets', () => {
      const items = Array.from({ length: 1000 }, (_, i) => `item-${i}`)
      mh.addSet(items)
      expect(mh.size).toBe(1000)
    })

    it('should work with previously added items', () => {
      mh.add('a')
      mh.addSet(['a', 'b', 'c'])
      expect(mh.size).toBe(3)
    })

    it('should handle single item array', () => {
      mh.addSet(['only'])
      expect(mh.size).toBe(1)
    })
  })

  describe('signature', () => {
    it('should return array of correct length', () => {
      const sig = mh.signature()
      expect(sig.length).toBe(128)
    })

    it('should return copy not reference', () => {
      const sig1 = mh.signature()
      const sig2 = mh.signature()
      expect(sig1).not.toBe(sig2)
      expect(sig1).toEqual(sig2)
    })

    it('should have all values within valid range for empty signature', () => {
      const sig = mh.signature()
      for (const v of sig) {
        expect(v).toBeGreaterThanOrEqual(0)
        expect(v).toBeLessThanOrEqual(2147483647)
      }
    })

    it('should change after adding items', () => {
      const empty = mh.signature()
      mh.add('item')
      const filled = mh.signature()
      let anyDifferent = false
      for (let i = 0; i < empty.length; i++) {
        if (empty[i] !== filled[i]) anyDifferent = true
      }
      expect(anyDifferent).toBe(true)
    })

    it('should produce consistent signatures for same items', () => {
      const m1 = new MinHash(64, 42)
      const m2 = new MinHash(64, 42)
      m1.addSet(['a', 'b', 'c', 'd', 'e'])
      m2.addSet(['a', 'b', 'c', 'd', 'e'])
      expect(m1.signature()).toEqual(m2.signature())
    })

    it('should produce different signatures for different items', () => {
      const m1 = new MinHash(64, 42)
      const m2 = new MinHash(64, 42)
      m1.add('aaa')
      m2.add('bbb')
      expect(m1.signature()).not.toEqual(m2.signature())
    })

    it('should match length to numHashes', () => {
      const m = new MinHash(32)
      m.add('test')
      expect(m.signature().length).toBe(32)
    })
  })

  describe('similarity', () => {
    it('should return 1 for identical sets', () => {
      const m1 = new MinHash(256, 1)
      const m2 = new MinHash(256, 1)
      m1.addSet(['a', 'b', 'c', 'd', 'e'])
      m2.addSet(['a', 'b', 'c', 'd', 'e'])
      const sim = m1.similarity(m2)
      expect(sim).toBe(1)
    })

    it('should return 0 for completely disjoint sets', () => {
      const m1 = new MinHash(256, 1)
      const m2 = new MinHash(256, 1)
      const setA = Array.from({ length: 500 }, (_, i) => `setA-${i}`)
      const setB = Array.from({ length: 500 }, (_, i) => `setB-${i}`)
      m1.addSet(setA)
      m2.addSet(setB)
      const sim = m1.similarity(m2)
      expect(sim).toBeLessThan(0.1)
    })

    it('should return ~0.5 for 50% overlap', () => {
      const m1 = new MinHash(512, 1)
      const m2 = new MinHash(512, 1)
      const shared = Array.from({ length: 500 }, (_, i) => `shared-${i}`)
      const uniqueA = Array.from({ length: 500 }, (_, i) => `uniqueA-${i}`)
      const uniqueB = Array.from({ length: 500 }, (_, i) => `uniqueB-${i}`)
      m1.addSet([...shared, ...uniqueA])
      m2.addSet([...shared, ...uniqueB])
      const sim = m1.similarity(m2)
      expect(sim).toBeGreaterThan(0.3)
      expect(sim).toBeLessThan(0.7)
    })

    it('should return 0 for two empty MinHashes', () => {
      const m1 = new MinHash()
      const m2 = new MinHash()
      expect(m1.similarity(m2)).toBe(0)
    })

    it('should return 0 when one is empty and other is not', () => {
      const m1 = new MinHash()
      const m2 = new MinHash()
      m2.add('item')
      expect(m1.similarity(m2)).toBe(0)
    })

    it('should be symmetric', () => {
      const m1 = new MinHash(256, 1)
      const m2 = new MinHash(256, 1)
      m1.addSet(['a', 'b', 'c'])
      m2.addSet(['b', 'c', 'd'])
      expect(m1.similarity(m2)).toBeCloseTo(m2.similarity(m1), 10)
    })

    it('should throw when numHashes differ', () => {
      const m1 = new MinHash(64)
      const m2 = new MinHash(128)
      expect(() => m1.similarity(m2)).toThrow('different numHashes')
    })

    it('should return value between 0 and 1', () => {
      const m1 = new MinHash(256, 1)
      const m2 = new MinHash(256, 1)
      m1.addSet(['a', 'b', 'c', 'd', 'e', 'f', 'g'])
      m2.addSet(['d', 'e', 'f', 'g', 'h', 'i', 'j'])
      const sim = m1.similarity(m2)
      expect(sim).toBeGreaterThanOrEqual(0)
      expect(sim).toBeLessThanOrEqual(1)
    })

    it('should produce higher similarity for more overlap', () => {
      const m1 = new MinHash(256, 1)
      const m2 = new MinHash(256, 1)
      const m3 = new MinHash(256, 1)
      m1.addSet(['a', 'b', 'c', 'd', 'e'])
      m2.addSet(['a', 'b', 'c', 'f', 'g'])
      m3.addSet(['x', 'y', 'z', 'f', 'g'])
      const simMore = m1.similarity(m2)
      const simLess = m1.similarity(m3)
      expect(simMore).toBeGreaterThan(simLess)
    })
  })

  describe('jaccard (static)', () => {
    it('should return 1 for identical sets', () => {
      expect(MinHash.jaccard(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe(1)
    })

    it('should return 0 for disjoint sets', () => {
      expect(MinHash.jaccard(['a', 'b'], ['c', 'd'])).toBe(0)
    })

    it('should return 0.5 for 50% overlap', () => {
      expect(MinHash.jaccard(['a', 'b'], ['b', 'c'])).toBeCloseTo(1 / 3, 10)
    })

    it('should handle empty arrays', () => {
      expect(MinHash.jaccard([], [])).toBe(1)
    })

    it('should handle one empty array', () => {
      expect(MinHash.jaccard(['a'], [])).toBe(0)
      expect(MinHash.jaccard([], ['a'])).toBe(0)
    })

    it('should deduplicate elements', () => {
      expect(MinHash.jaccard(['a', 'a', 'b'], ['a', 'b', 'b'])).toBe(1)
    })

    it('should handle single element overlap', () => {
      expect(MinHash.jaccard(['a', 'b', 'c'], ['c', 'd', 'e'])).toBeCloseTo(1 / 5, 10)
    })

    it('should be symmetric', () => {
      const a = ['x', 'y', 'z']
      const b = ['y', 'z', 'w']
      expect(MinHash.jaccard(a, b)).toBeCloseTo(MinHash.jaccard(b, a), 10)
    })

    it('should return correct value for subset', () => {
      expect(MinHash.jaccard(['a', 'b'], ['a', 'b', 'c'])).toBeCloseTo(2 / 3, 10)
    })

    it('should handle large sets', () => {
      const a = Array.from({ length: 1000 }, (_, i) => `item-${i}`)
      const b = Array.from({ length: 1000 }, (_, i) => `item-${i + 500}`)
      const j = MinHash.jaccard(a, b)
      expect(j).toBeCloseTo(500 / 1500, 5)
    })
  })

  describe('clear', () => {
    it('should clear all items', () => {
      mh.add('a')
      mh.add('b')
      mh.clear()
      expect(mh.size).toBe(0)
      expect(mh.isEmpty()).toBe(true)
    })

    it('should reset signature', () => {
      mh.add('item')
      mh.clear()
      const sig = mh.signature()
      for (const v of sig) {
        expect(v).toBe(2147483647)
      }
    })

    it('should allow adding after clear', () => {
      mh.add('first')
      mh.clear()
      mh.add('second')
      expect(mh.size).toBe(1)
    })

    it('should handle clearing empty MinHash', () => {
      mh.clear()
      expect(mh.size).toBe(0)
      expect(mh.isEmpty()).toBe(true)
    })

    it('should preserve numHashes after clear', () => {
      const m = new MinHash(64)
      m.clear()
      expect(m.numHashes).toBe(64)
    })
  })

  describe('size', () => {
    it('should return 0 for new MinHash', () => {
      expect(mh.size).toBe(0)
    })

    it('should return 1 after one add', () => {
      mh.add('item')
      expect(mh.size).toBe(1)
    })

    it('should track multiple unique adds', () => {
      mh.add('a')
      mh.add('b')
      mh.add('c')
      expect(mh.size).toBe(3)
    })

    it('should not increment for duplicates', () => {
      mh.add('test')
      mh.add('test')
      mh.add('test')
      expect(mh.size).toBe(1)
    })

    it('should reset after clear', () => {
      mh.add('test')
      mh.clear()
      expect(mh.size).toBe(0)
    })
  })

  describe('numHashes', () => {
    it('should return default 128', () => {
      expect(mh.numHashes).toBe(128)
    })

    it('should return custom value', () => {
      const m = new MinHash(64)
      expect(m.numHashes).toBe(64)
    })
  })

  describe('merge', () => {
    it('should merge two MinHashes with same parameters', () => {
      const m1 = new MinHash(128, 42)
      const m2 = new MinHash(128, 42)
      m1.add('a')
      m2.add('b')
      m1.merge(m2)
      expect(m1.size).toBe(2)
    })

    it('should compute element-wise min of signatures', () => {
      const m1 = new MinHash(128, 42)
      const m2 = new MinHash(128, 42)
      m1.add('a')
      m2.add('b')
      const sig1 = m1.signature()
      const sig2 = m2.signature()
      m1.merge(m2)
      const merged = m1.signature()
      for (let i = 0; i < 128; i++) {
        expect(merged[i]).toBe(Math.min(sig1[i]!, sig2[i]!))
      }
    })

    it('should throw on different numHashes', () => {
      const m1 = new MinHash(64)
      const m2 = new MinHash(128)
      expect(() => m1.merge(m2)).toThrow('different numHashes')
    })

    it('should throw on different seeds', () => {
      const m1 = new MinHash(64, 1)
      const m2 = new MinHash(64, 2)
      expect(() => m1.merge(m2)).toThrow('different seeds')
    })

    it('should handle merging empty MinHashes', () => {
      const m1 = new MinHash(64, 1)
      const m2 = new MinHash(64, 1)
      m1.merge(m2)
      expect(m1.size).toBe(0)
      expect(m1.isEmpty()).toBe(true)
    })

    it('should handle merging with empty MinHash', () => {
      const m1 = new MinHash(64, 1)
      const m2 = new MinHash(64, 1)
      m1.add('item')
      const sigBefore = m1.signature()
      m1.merge(m2)
      expect(m1.size).toBe(1)
      expect(m1.signature()).toEqual(sigBefore)
    })

    it('should handle merging into empty MinHash', () => {
      const m1 = new MinHash(64, 1)
      const m2 = new MinHash(64, 1)
      m2.add('item')
      m1.merge(m2)
      expect(m1.size).toBe(1)
      expect(m1.signature()).toEqual(m2.signature())
    })

    it('should handle overlapping items without double-counting', () => {
      const m1 = new MinHash(64, 1)
      const m2 = new MinHash(64, 1)
      m1.add('a')
      m1.add('b')
      m2.add('b')
      m2.add('c')
      m1.merge(m2)
      expect(m1.size).toBe(3)
    })

    it('should produce same result as adding all items directly', () => {
      const m1 = new MinHash(128, 1)
      const m2 = new MinHash(128, 1)
      const combined = new MinHash(128, 1)
      m1.addSet(['a', 'b', 'c'])
      m2.addSet(['d', 'e', 'f'])
      combined.addSet(['a', 'b', 'c', 'd', 'e', 'f'])
      m1.merge(m2)
      expect(m1.signature()).toEqual(combined.signature())
    })
  })

  describe('clone', () => {
    it('should create an independent copy', () => {
      mh.add('test')
      const cloned = mh.clone()
      expect(cloned.size).toBe(mh.size)
      expect(cloned.signature()).toEqual(mh.signature())
    })

    it('should not affect original when modified', () => {
      mh.add('shared')
      const cloned = mh.clone()
      cloned.add('new')
      expect(mh.size).toBe(1)
      expect(cloned.size).toBe(2)
    })

    it('should not affect clone when original is modified', () => {
      mh.add('shared')
      const cloned = mh.clone()
      mh.add('original-only')
      expect(cloned.size).toBe(1)
    })

    it('should preserve numHashes', () => {
      const m = new MinHash(64)
      const cloned = m.clone()
      expect(cloned.numHashes).toBe(64)
    })

    it('should clone empty MinHash', () => {
      const cloned = mh.clone()
      expect(cloned.isEmpty()).toBe(true)
      expect(cloned.size).toBe(0)
    })

    it('should produce identical signatures', () => {
      mh.addSet(['a', 'b', 'c', 'd', 'e'])
      const cloned = mh.clone()
      expect(cloned.signature()).toEqual(mh.signature())
    })
  })

  describe('batchSize', () => {
    it('should return a positive number', () => {
      expect(mh.batchSize).toBeGreaterThan(0)
    })

    it('should return larger values for more hashes', () => {
      const m1 = new MinHash(32)
      const m2 = new MinHash(256)
      expect(m2.batchSize).toBeGreaterThanOrEqual(m1.batchSize)
    })

    it('should be at least 1', () => {
      const m = new MinHash(1)
      expect(m.batchSize).toBeGreaterThanOrEqual(1)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new MinHash', () => {
      expect(mh.isEmpty()).toBe(true)
    })

    it('should return false after add', () => {
      mh.add('item')
      expect(mh.isEmpty()).toBe(false)
    })

    it('should return true after clear', () => {
      mh.add('item')
      mh.clear()
      expect(mh.isEmpty()).toBe(true)
    })
  })

  describe('toJSON / fromJSON', () => {
    it('should serialize to JSON', () => {
      mh.add('test')
      const json = mh.toJSON()
      expect(json.numHashes).toBe(128)
      expect(json.signature).toBeInstanceOf(Array)
      expect(json.size).toBe(1)
      expect(json.hashA).toBeInstanceOf(Array)
      expect(json.hashB).toBeInstanceOf(Array)
    })

    it('should round-trip through JSON', () => {
      mh.add('hello')
      mh.add('world')
      const json = mh.toJSON()
      const restored = MinHash.fromJSON(json)
      expect(restored.signature()).toEqual(mh.signature())
      expect(restored.size).toBe(2)
      expect(restored.numHashes).toBe(128)
    })

    it('should preserve signature through serialization', () => {
      mh.addSet(['a', 'b', 'c'])
      const json = mh.toJSON()
      const restored = MinHash.fromJSON(json)
      expect(restored.signature()).toEqual(mh.signature())
    })

    it('should handle empty MinHash serialization', () => {
      const json = mh.toJSON()
      const restored = MinHash.fromJSON(json)
      expect(restored.isEmpty()).toBe(true)
      expect(restored.size).toBe(0)
    })

    it('should produce valid MinHashJSON type', () => {
      mh.add('test')
      const json: MinHashJSON = mh.toJSON()
      expect(typeof json.numHashes).toBe('number')
      expect(typeof json.seed).toBe('number')
      expect(typeof json.size).toBe('number')
      expect(Array.isArray(json.signature)).toBe(true)
      expect(Array.isArray(json.hashA)).toBe(true)
      expect(Array.isArray(json.hashB)).toBe(true)
    })

    it('should allow similarity on restored MinHash', () => {
      mh.addSet(['a', 'b', 'c'])
      const json = mh.toJSON()
      const restored = MinHash.fromJSON(json)
      expect(restored.similarity(mh)).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('should handle identical items added to two MinHashes', () => {
      const m1 = new MinHash(128, 1)
      const m2 = new MinHash(128, 1)
      m1.add('same')
      m2.add('same')
      expect(m1.similarity(m2)).toBe(1)
    })

    it('should handle one empty one full', () => {
      const m1 = new MinHash(128, 1)
      const m2 = new MinHash(128, 1)
      m2.add('item')
      expect(m1.similarity(m2)).toBe(0)
    })

    it('should handle very small numHashes', () => {
      const m = new MinHash(1)
      m.add('a')
      m.add('b')
      expect(m.signature().length).toBe(1)
    })

    it('should handle adding many items', () => {
      for (let i = 0; i < 10000; i++) {
        mh.add(`item-${i}`)
      }
      expect(mh.size).toBe(10000)
    })

    it('should handle single item sets for jaccard', () => {
      expect(MinHash.jaccard(['a'], ['a'])).toBe(1)
      expect(MinHash.jaccard(['a'], ['b'])).toBe(0)
    })

    it('should handle clear followed by immediate operations', () => {
      mh.add('before')
      mh.clear()
      mh.add('after')
      expect(mh.size).toBe(1)
    })
  })

  describe('accuracy tests', () => {
    it('should estimate Jaccard within tolerance for 50% overlap', () => {
      const numHashes = 512
      const seed = 42
      const m1 = new MinHash(numHashes, seed)
      const m2 = new MinHash(numHashes, seed)
      const setA = Array.from({ length: 200 }, (_, i) => `item-${i}`)
      const setB = Array.from({ length: 200 }, (_, i) => `item-${i + 100}`)
      const exact = MinHash.jaccard(setA, setB)
      m1.addSet(setA)
      m2.addSet(setB)
      const estimated = m1.similarity(m2)
      expect(Math.abs(estimated - exact)).toBeLessThan(0.15)
    })

    it('should estimate Jaccard for 100% overlap', () => {
      const m1 = new MinHash(256, 1)
      const m2 = new MinHash(256, 1)
      const items = Array.from({ length: 100 }, (_, i) => `item-${i}`)
      m1.addSet(items)
      m2.addSet(items)
      expect(m1.similarity(m2)).toBe(1)
    })

    it('should estimate Jaccard for 0% overlap', () => {
      const m1 = new MinHash(512, 1)
      const m2 = new MinHash(512, 1)
      const setA = Array.from({ length: 500 }, (_, i) => `a-${i}`)
      const setB = Array.from({ length: 500 }, (_, i) => `b-${i}`)
      m1.addSet(setA)
      m2.addSet(setB)
      expect(m1.similarity(m2)).toBeLessThan(0.1)
    })

    it('should estimate Jaccard for 25% overlap', () => {
      const numHashes = 512
      const seed = 7
      const m1 = new MinHash(numHashes, seed)
      const m2 = new MinHash(numHashes, seed)
      const shared = Array.from({ length: 100 }, (_, i) => `shared-${i}`)
      const uniqueA = Array.from({ length: 300 }, (_, i) => `uA-${i}`)
      const uniqueB = Array.from({ length: 300 }, (_, i) => `uB-${i}`)
      m1.addSet([...shared, ...uniqueA])
      m2.addSet([...shared, ...uniqueB])
      const exact = MinHash.jaccard([...shared, ...uniqueA], [...shared, ...uniqueB])
      const estimated = m1.similarity(m2)
      expect(Math.abs(estimated - exact)).toBeLessThan(0.1)
    })

    it('should estimate Jaccard for 75% overlap', () => {
      const numHashes = 512
      const seed = 13
      const m1 = new MinHash(numHashes, seed)
      const m2 = new MinHash(numHashes, seed)
      const shared = Array.from({ length: 300 }, (_, i) => `shared-${i}`)
      const uniqueA = Array.from({ length: 100 }, (_, i) => `uA-${i}`)
      const uniqueB = Array.from({ length: 100 }, (_, i) => `uB-${i}`)
      m1.addSet([...shared, ...uniqueA])
      m2.addSet([...shared, ...uniqueB])
      const exact = MinHash.jaccard([...shared, ...uniqueA], [...shared, ...uniqueB])
      const estimated = m1.similarity(m2)
      expect(Math.abs(estimated - exact)).toBeLessThan(0.1)
    })

    it('should improve accuracy with more hashes', () => {
      const setA = Array.from({ length: 200 }, (_, i) => `item-${i}`)
      const setB = Array.from({ length: 200 }, (_, i) => `item-${i + 100}`)
      const exact = MinHash.jaccard(setA, setB)

      const m1_small = new MinHash(32, 1)
      const m2_small = new MinHash(32, 1)
      m1_small.addSet(setA)
      m2_small.addSet(setB)
      const err_small = Math.abs(m1_small.similarity(m2_small) - exact)

      const m1_large = new MinHash(512, 1)
      const m2_large = new MinHash(512, 1)
      m1_large.addSet(setA)
      m2_large.addSet(setB)
      const err_large = Math.abs(m1_large.similarity(m2_large) - exact)

      expect(err_large).toBeLessThanOrEqual(err_small + 0.05)
    })
  })

  describe('stress tests', () => {
    it('should handle 50000 items', () => {
      const m = new MinHash(128)
      for (let i = 0; i < 50000; i++) {
        m.add(`item-${i}`)
      }
      expect(m.size).toBe(50000)
    })

    it('should handle many merge operations', () => {
      const combined = new MinHash(64, 1)
      for (let i = 0; i < 10; i++) {
        const partial = new MinHash(64, 1)
        for (let j = 0; j < 100; j++) {
          partial.add(`batch-${i}-item-${j}`)
        }
        combined.merge(partial)
      }
      expect(combined.size).toBe(1000)
    })

    it('should handle many clone operations', () => {
      mh.add('test')
      for (let i = 0; i < 100; i++) {
        const cloned = mh.clone()
        expect(cloned.size).toBe(1)
      }
    })

    it('should handle rapid add and clear cycles', () => {
      for (let i = 0; i < 50; i++) {
        mh.add(`item-${i}`)
        mh.clear()
      }
      expect(mh.size).toBe(0)
    })

    it('should handle many similarity comparisons', () => {
      const m1 = new MinHash(128, 1)
      m1.addSet(Array.from({ length: 50 }, (_, i) => `item-${i}`))
      for (let i = 0; i < 100; i++) {
        const m2 = new MinHash(128, 1)
        m2.addSet(Array.from({ length: 50 }, (_, j) => `item-${j + i}`))
        const sim = m1.similarity(m2)
        expect(sim).toBeGreaterThanOrEqual(0)
        expect(sim).toBeLessThanOrEqual(1)
      }
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_MINHASH_OPTIONS', () => {
      expect(DEFAULT_MINHASH_OPTIONS.numHashes).toBe(128)
      expect(DEFAULT_MINHASH_OPTIONS.seed).toBe(0x12345678)
    })

    it('should support MinHashOptions interface', () => {
      const opts: MinHashOptions = {
        numHashes: 256,
        seed: 42,
      }
      expect(opts.numHashes).toBe(256)
      expect(opts.seed).toBe(42)
    })

    it('should support MinHashJSON interface', () => {
      const json: MinHashJSON = {
        numHashes: 64,
        seed: 1,
        signature: [1, 2, 3],
        size: 5,
        hashA: [10, 20, 30],
        hashB: [40, 50, 60],
      }
      expect(json.numHashes).toBe(64)
      expect(json.signature.length).toBe(3)
    })
  })
})
