import { describe, it, expect } from 'vitest'
import { XorFilter } from '../../src/core/xor-filter/index.js'
import type { SerializedXorFilter } from '../../src/core/xor-filter/types.js'

describe('XorFilter', () => {
  describe('constructor', () => {
    it('creates filter with empty elements', () => {
      const f = new XorFilter([])
      expect(f.size).toBe(0)
    })

    it('creates filter with single element', () => {
      const f = new XorFilter(['a'])
      expect(f.size).toBe(1)
    })

    it('creates filter with multiple elements', () => {
      const f = new XorFilter(['a', 'b', 'c'])
      expect(f.size).toBe(3)
    })

    it('creates filter with custom seed', () => {
      const f = new XorFilter(['x', 'y'], { seed: 42 })
      expect(f.size).toBe(2)
      expect(f.has('x')).toBe(true)
      expect(f.has('y')).toBe(true)
    })

    it('creates filter with custom hash function', () => {
      let callCount = 0
      const customHash = (el: string, seed: number): number => {
        callCount++
        let h = 0x811c9dc5 ^ seed
        for (let i = 0; i < el.length; i++) {
          h ^= el.charCodeAt(i)
          h = Math.imul(h, 0x01000193)
        }
        return h >>> 0
      }
      const f = new XorFilter(['test'], { hashFunction: customHash })
      expect(f.size).toBe(1)
      expect(callCount).toBeGreaterThan(0)
      expect(f.has('test')).toBe(true)
    })

    it('creates filter with large number of elements', () => {
      const keys = Array.from({ length: 10000 }, (_, i) => `key-${i}`)
      const f = new XorFilter(keys)
      expect(f.size).toBe(10000)
    })

    it('deduplicates input elements', () => {
      const f = new XorFilter(['a', 'a', 'b', 'b', 'c'])
      expect(f.size).toBe(3)
    })

    it('handles special characters', () => {
      const f = new XorFilter(['hello\nworld', 'path/to/file', 'tab\there'])
      expect(f.size).toBe(3)
    })

    it('handles unicode strings', () => {
      const f = new XorFilter(['日本語', '🎉🚀', 'café'])
      expect(f.size).toBe(3)
    })

    it('handles empty string as element', () => {
      const f = new XorFilter([''])
      expect(f.size).toBe(1)
      expect(f.has('')).toBe(true)
    })

    it('handles very long strings', () => {
      const longStr = 'x'.repeat(10000)
      const f = new XorFilter([longStr])
      expect(f.size).toBe(1)
    })

    it('handles numeric strings', () => {
      const f = new XorFilter(['1', '2', '3', '4', '5'])
      expect(f.size).toBe(5)
    })

    it('handles all duplicates input', () => {
      const f = new XorFilter(['same', 'same', 'same'])
      expect(f.size).toBe(1)
    })

    it('creates with seed 0 by default', () => {
      const f1 = new XorFilter(['a', 'b'])
      const f2 = new XorFilter(['a', 'b'], { seed: 0 })
      expect(f1.equals(f2)).toBe(true)
    })

    it('creates with large seed', () => {
      const f = new XorFilter(['a', 'b'], { seed: 999999 })
      expect(f.size).toBe(2)
      expect(f.has('a')).toBe(true)
      expect(f.has('b')).toBe(true)
    })
  })

  describe('has', () => {
    it('returns true for element in filter', () => {
      const f = new XorFilter(['hello'])
      expect(f.has('hello')).toBe(true)
    })

    it('returns false for element not in filter', () => {
      const f = new XorFilter(['hello'])
      expect(f.has('world')).toBe(false)
    })

    it('returns false for empty filter', () => {
      const f = new XorFilter([])
      expect(f.has('anything')).toBe(false)
    })

    it('returns true for all inserted elements', () => {
      const keys = ['apple', 'banana', 'cherry', 'date', 'elderberry']
      const f = new XorFilter(keys)
      for (const key of keys) {
        expect(f.has(key)).toBe(true)
      }
    })

    it('handles empty string element', () => {
      const f = new XorFilter([''])
      expect(f.has('')).toBe(true)
      expect(f.has('a')).toBe(false)
    })

    it('handles unicode elements', () => {
      const f = new XorFilter(['日本語', '中文', 'العربية'])
      expect(f.has('日本語')).toBe(true)
      expect(f.has('中文')).toBe(true)
      expect(f.has('English')).toBe(false)
    })

    it('is case sensitive', () => {
      const f = new XorFilter(['Hello'])
      expect(f.has('Hello')).toBe(true)
      expect(f.has('hello')).toBe(false)
      expect(f.has('HELLO')).toBe(false)
    })

    it('handles numeric string elements', () => {
      const f = new XorFilter(['123', '456', '789'])
      expect(f.has('123')).toBe(true)
      expect(f.has('999')).toBe(false)
    })

    it('handles whitespace-only elements', () => {
      const f = new XorFilter(['   ', '\t', '\n'])
      expect(f.has('   ')).toBe(true)
      expect(f.has('\t')).toBe(true)
      expect(f.has('\n')).toBe(true)
    })

    it('returns consistent results across multiple calls', () => {
      const f = new XorFilter(['stable'])
      expect(f.has('stable')).toBe(true)
      expect(f.has('stable')).toBe(true)
      expect(f.has('stable')).toBe(true)
    })

    it('handles keys with null characters', () => {
      const f = new XorFilter(['before\0after'])
      expect(f.has('before\0after')).toBe(true)
      expect(f.has('before')).toBe(false)
    })

    it('handles mixed unicode content', () => {
      const f = new XorFilter(['hello世界🎉'])
      expect(f.has('hello世界🎉')).toBe(true)
      expect(f.has('hello世界')).toBe(false)
    })

    it('handles very long string element', () => {
      const longStr = 'a'.repeat(10000)
      const f = new XorFilter([longStr])
      expect(f.has(longStr)).toBe(true)
      expect(f.has('a'.repeat(9999))).toBe(false)
    })

    it('returns false for empty filter on any query', () => {
      const f = new XorFilter([])
      expect(f.has('')).toBe(false)
      expect(f.has('a')).toBe(false)
      expect(f.has('日本語')).toBe(false)
    })

    it('handles elements differing by one character', () => {
      const f = new XorFilter(['abc', 'abd', 'abe'])
      expect(f.has('abc')).toBe(true)
      expect(f.has('abd')).toBe(true)
      expect(f.has('abe')).toBe(true)
      expect(f.has('abf')).toBe(false)
    })
  })

  describe('mightContain', () => {
    it('returns same as has for present element', () => {
      const f = new XorFilter(['test'])
      expect(f.mightContain('test')).toBe(f.has('test'))
      expect(f.mightContain('test')).toBe(true)
    })

    it('returns same as has for absent element', () => {
      const f = new XorFilter(['test'])
      expect(f.mightContain('missing')).toBe(f.has('missing'))
      expect(f.mightContain('missing')).toBe(false)
    })

    it('returns false for empty filter', () => {
      const f = new XorFilter([])
      expect(f.mightContain('anything')).toBe(false)
    })

    it('works correctly for multiple elements', () => {
      const keys = ['alpha', 'beta', 'gamma']
      const f = new XorFilter(keys)
      for (const key of keys) {
        expect(f.mightContain(key)).toBe(true)
      }
      expect(f.mightContain('delta')).toBe(false)
    })

    it('handles unicode in mightContain', () => {
      const f = new XorFilter(['日本語'])
      expect(f.mightContain('日本語')).toBe(true)
      expect(f.mightContain('English')).toBe(false)
    })
  })

  describe('size', () => {
    it('returns 0 for empty filter', () => {
      const f = new XorFilter([])
      expect(f.size).toBe(0)
    })

    it('returns 1 for single element', () => {
      const f = new XorFilter(['a'])
      expect(f.size).toBe(1)
    })

    it('returns count for multiple elements', () => {
      const f = new XorFilter(['a', 'b', 'c', 'd'])
      expect(f.size).toBe(4)
    })

    it('returns count after deduplication', () => {
      const f = new XorFilter(['x', 'x', 'y', 'y', 'z'])
      expect(f.size).toBe(3)
    })

    it('returns correct count for large input', () => {
      const keys = Array.from({ length: 5000 }, (_, i) => `k-${i}`)
      const f = new XorFilter(keys)
      expect(f.size).toBe(5000)
    })
  })

  describe('capacity', () => {
    it('equals size for empty filter', () => {
      const f = new XorFilter([])
      expect(f.capacity).toBe(0)
    })

    it('equals size for single element', () => {
      const f = new XorFilter(['a'])
      expect(f.capacity).toBe(1)
    })

    it('equals size for multiple elements', () => {
      const f = new XorFilter(['a', 'b', 'c'])
      expect(f.capacity).toBe(3)
    })

    it('equals size for deduplicated input', () => {
      const f = new XorFilter(['a', 'a', 'b'])
      expect(f.capacity).toBe(2)
    })

    it('same as size property', () => {
      const f = new XorFilter(['x', 'y', 'z'])
      expect(f.capacity).toBe(f.size)
    })
  })

  describe('fingerprintCount', () => {
    it('returns 3 for empty filter', () => {
      const f = new XorFilter([])
      expect(f.fingerprintCount).toBe(3)
    })

    it('returns value greater than 0 for non-empty filter', () => {
      const f = new XorFilter(['a'])
      expect(f.fingerprintCount).toBeGreaterThan(0)
    })

    it('is a multiple of 3', () => {
      const f = new XorFilter(['a', 'b', 'c'])
      expect(f.fingerprintCount % 3).toBe(0)
    })

    it('increases with more elements', () => {
      const f1 = new XorFilter(['a'])
      const f2 = new XorFilter(Array.from({ length: 1000 }, (_, i) => `k-${i}`))
      expect(f2.fingerprintCount).toBeGreaterThan(f1.fingerprintCount)
    })

    it('is proportional to element count', () => {
      const f = new XorFilter(Array.from({ length: 100 }, (_, i) => `k-${i}`))
      expect(f.fingerprintCount).toBeGreaterThan(100)
    })
  })

  describe('falsePositiveRate', () => {
    it('returns 1/256', () => {
      const f = new XorFilter(['a', 'b', 'c'])
      expect(f.falsePositiveRate).toBe(1 / 256)
    })

    it('is approximately 0.0039', () => {
      const f = new XorFilter(['a'])
      expect(f.falsePositiveRate).toBeCloseTo(0.00390625, 6)
    })

    it('is constant regardless of size', () => {
      const f1 = new XorFilter(['a'])
      const f2 = new XorFilter(Array.from({ length: 1000 }, (_, i) => `k-${i}`))
      expect(f1.falsePositiveRate).toBe(f2.falsePositiveRate)
    })

    it('is less than 0.01', () => {
      const f = new XorFilter(['a', 'b'])
      expect(f.falsePositiveRate).toBeLessThan(0.01)
    })

    it('is greater than 0', () => {
      const f = new XorFilter(['a'])
      expect(f.falsePositiveRate).toBeGreaterThan(0)
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const f = new XorFilter(['a', 'b', 'c'])
      const c = f.clone()
      expect(c).not.toBe(f)
      expect(c).toBeInstanceOf(XorFilter)
    })

    it('equals original', () => {
      const f = new XorFilter(['a', 'b', 'c'])
      const c = f.clone()
      expect(c.equals(f)).toBe(true)
    })

    it('preserves membership queries', () => {
      const keys = ['alpha', 'beta', 'gamma']
      const f = new XorFilter(keys)
      const c = f.clone()
      for (const key of keys) {
        expect(c.has(key)).toBe(true)
      }
    })

    it('preserves size', () => {
      const f = new XorFilter(['x', 'y', 'z'])
      const c = f.clone()
      expect(c.size).toBe(f.size)
    })

    it('preserves capacity', () => {
      const f = new XorFilter(['a', 'b'])
      const c = f.clone()
      expect(c.capacity).toBe(f.capacity)
    })

    it('preserves fingerprintCount', () => {
      const f = new XorFilter(['a', 'b', 'c'])
      const c = f.clone()
      expect(c.fingerprintCount).toBe(f.fingerprintCount)
    })

    it('returns false for missing keys in clone', () => {
      const f = new XorFilter(['present'])
      const c = f.clone()
      expect(c.has('absent')).toBe(false)
    })

    it('handles cloning empty filter', () => {
      const f = new XorFilter([])
      const c = f.clone()
      expect(c.size).toBe(0)
      expect(c.has('anything')).toBe(false)
    })

    it('clone of clone works', () => {
      const f = new XorFilter(['a', 'b'])
      const c1 = f.clone()
      const c2 = c1.clone()
      expect(c2.equals(f)).toBe(true)
      expect(c2.has('a')).toBe(true)
      expect(c2.has('b')).toBe(true)
    })

    it('clone preserves falsePositiveRate', () => {
      const f = new XorFilter(['a', 'b', 'c'])
      const c = f.clone()
      expect(c.falsePositiveRate).toBe(f.falsePositiveRate)
    })
  })

  describe('serialize', () => {
    it('serializes to correct format', () => {
      const f = new XorFilter(['a', 'b', 'c'])
      const data = f.serialize()
      expect(data).toHaveProperty('size')
      expect(data).toHaveProperty('segmentSize')
      expect(data).toHaveProperty('fingerprintCount')
      expect(data).toHaveProperty('seed')
      expect(data).toHaveProperty('fingerprints')
      expect(data).toHaveProperty('elements')
    })

    it('includes correct size', () => {
      const f = new XorFilter(['a', 'b', 'c'])
      const data = f.serialize()
      expect(data.size).toBe(3)
    })

    it('includes all fingerprints', () => {
      const f = new XorFilter(['a', 'b'])
      const data = f.serialize()
      expect(data.fingerprints.length).toBe(f.fingerprintCount)
    })

    it('includes elements', () => {
      const f = new XorFilter(['x', 'y'])
      const data = f.serialize()
      expect(data.elements).toEqual(['x', 'y'])
    })

    it('includes seed', () => {
      const f = new XorFilter(['a'], { seed: 42 })
      const data = f.serialize()
      expect(typeof data.seed).toBe('number')
    })

    it('serializes empty filter', () => {
      const f = new XorFilter([])
      const data = f.serialize()
      expect(data.size).toBe(0)
      expect(data.fingerprints.length).toBe(3)
    })
  })

  describe('deserialize', () => {
    it('roundtrip serialize/deserialize', () => {
      const original = new XorFilter(['a', 'b', 'c'])
      const data = original.serialize()
      const restored = XorFilter.deserialize(data)
      expect(restored.has('a')).toBe(true)
      expect(restored.has('b')).toBe(true)
      expect(restored.has('c')).toBe(true)
      expect(restored.has('d')).toBe(false)
    })

    it('deserialized filter equals original', () => {
      const original = new XorFilter(['x', 'y', 'z'])
      const data = original.serialize()
      const restored = XorFilter.deserialize(data)
      expect(restored.equals(original)).toBe(true)
    })

    it('deserialized filter has same has() behavior', () => {
      const keys = ['alpha', 'beta', 'gamma']
      const original = new XorFilter(keys)
      const data = original.serialize()
      const restored = XorFilter.deserialize(data)
      for (const key of keys) {
        expect(restored.has(key)).toBe(original.has(key))
      }
    })

    it('deserialize with custom hash function', () => {
      const customHash = (el: string, seed: number): number => {
        let h = 0x811c9dc5 ^ seed
        for (let i = 0; i < el.length; i++) {
          h ^= el.charCodeAt(i)
          h = Math.imul(h, 0x01000193)
        }
        return h >>> 0
      }
      const original = new XorFilter(['test'], { hashFunction: customHash })
      const data = original.serialize()
      const restored = XorFilter.deserialize(data, customHash)
      expect(restored.has('test')).toBe(true)
    })

    it('deserialize empty filter', () => {
      const original = new XorFilter([])
      const data = original.serialize()
      const restored = XorFilter.deserialize(data)
      expect(restored.size).toBe(0)
      expect(restored.has('anything')).toBe(false)
    })

    it('deserialize preserves size', () => {
      const original = new XorFilter(['a', 'b', 'c', 'd', 'e'])
      const data = original.serialize()
      const restored = XorFilter.deserialize(data)
      expect(restored.size).toBe(5)
    })

    it('deserialize preserves seed', () => {
      const original = new XorFilter(['a'], { seed: 42 })
      const data = original.serialize()
      const restored = XorFilter.deserialize(data)
      expect(data.seed).toBe(original.serialize().seed)
    })

    it('deserialize preserves fingerprintCount', () => {
      const original = new XorFilter(['a', 'b', 'c'])
      const data = original.serialize()
      const restored = XorFilter.deserialize(data)
      expect(restored.fingerprintCount).toBe(original.fingerprintCount)
    })

    it('deserialize large filter', () => {
      const keys = Array.from({ length: 1000 }, (_, i) => `key-${i}`)
      const original = new XorFilter(keys)
      const data = original.serialize()
      const restored = XorFilter.deserialize(data)
      for (const key of keys) {
        expect(restored.has(key)).toBe(true)
      }
    })

    it('deserialize from manually constructed data', () => {
      const original = new XorFilter(['a', 'b'])
      const data: SerializedXorFilter = original.serialize()
      const restored = XorFilter.deserialize(data)
      expect(restored.has('a')).toBe(true)
      expect(restored.has('b')).toBe(true)
    })
  })

  describe('from', () => {
    it('creates filter from array', () => {
      const f = XorFilter.from(['a', 'b', 'c'])
      expect(f).toBeInstanceOf(XorFilter)
      expect(f.size).toBe(3)
    })

    it('equivalent to constructor', () => {
      const keys = ['x', 'y', 'z']
      const f1 = new XorFilter(keys)
      const f2 = XorFilter.from(keys)
      expect(f1.equals(f2)).toBe(true)
    })

    it('with options', () => {
      const f = XorFilter.from(['a', 'b'], { seed: 99 })
      expect(f.size).toBe(2)
      expect(f.has('a')).toBe(true)
      expect(f.has('b')).toBe(true)
    })

    it('from empty array', () => {
      const f = XorFilter.from([])
      expect(f.size).toBe(0)
    })

    it('from single element', () => {
      const f = XorFilter.from(['solo'])
      expect(f.size).toBe(1)
      expect(f.has('solo')).toBe(true)
    })
  })

  describe('equals', () => {
    it('filter equals itself', () => {
      const f = new XorFilter(['a', 'b'])
      expect(f.equals(f)).toBe(true)
    })

    it('filter equals clone', () => {
      const f = new XorFilter(['a', 'b', 'c'])
      expect(f.equals(f.clone())).toBe(true)
    })

    it('filter equals deserialized', () => {
      const f = new XorFilter(['x', 'y'])
      const data = f.serialize()
      const restored = XorFilter.deserialize(data)
      expect(f.equals(restored)).toBe(true)
    })

    it('same elements same options equal', () => {
      const f1 = new XorFilter(['a', 'b', 'c'])
      const f2 = new XorFilter(['a', 'b', 'c'])
      expect(f1.equals(f2)).toBe(true)
    })

    it('different elements not equal', () => {
      const f1 = new XorFilter(['a', 'b'])
      const f2 = new XorFilter(['c', 'd'])
      expect(f1.equals(f2)).toBe(false)
    })

    it('different seed not equal', () => {
      const f1 = new XorFilter(['a', 'b'], { seed: 1 })
      const f2 = new XorFilter(['a', 'b'], { seed: 2 })
      expect(f1.equals(f2)).toBe(false)
    })

    it('empty filters equal', () => {
      const f1 = new XorFilter([])
      const f2 = new XorFilter([])
      expect(f1.equals(f2)).toBe(true)
    })

    it('different sizes not equal', () => {
      const f1 = new XorFilter(['a'])
      const f2 = new XorFilter(['a', 'b'])
      expect(f1.equals(f2)).toBe(false)
    })

    it('equals is symmetric', () => {
      const f1 = new XorFilter(['a', 'b'])
      const f2 = f1.clone()
      expect(f1.equals(f2)).toBe(f2.equals(f1))
    })

    it('returns false for filter with different fingerprints', () => {
      const f1 = new XorFilter(['a'])
      const f2 = new XorFilter(['b'])
      expect(f1.equals(f2)).toBe(false)
    })
  })

  describe('no false negatives', () => {
    it('never returns false for added elements', () => {
      const keys = ['alpha', 'beta', 'gamma', 'delta', 'epsilon']
      const f = new XorFilter(keys)
      for (const key of keys) {
        expect(f.has(key)).toBe(true)
      }
    })

    it('no false negatives for 100 elements', () => {
      const keys = Array.from({ length: 100 }, (_, i) => `key-${i}`)
      const f = new XorFilter(keys)
      for (const key of keys) {
        expect(f.has(key)).toBe(true)
      }
    })

    it('no false negatives for 1000 elements', () => {
      const keys = Array.from({ length: 1000 }, (_, i) => `key-${i}`)
      const f = new XorFilter(keys)
      for (const key of keys) {
        expect(f.has(key)).toBe(true)
      }
    })

    it('no false negatives for unicode elements', () => {
      const keys = ['日本', '中国', '한국', 'India', '🇺🇸', '🇬🇧']
      const f = new XorFilter(keys)
      for (const key of keys) {
        expect(f.has(key)).toBe(true)
      }
    })

    it('no false negatives after clone', () => {
      const keys = ['a', 'b', 'c', 'd', 'e']
      const f = new XorFilter(keys)
      const c = f.clone()
      for (const key of keys) {
        expect(c.has(key)).toBe(true)
      }
    })
  })

  describe('false positive rate measurement', () => {
    it('measured FPR close to theoretical for moderate filter', () => {
      const keys = Array.from({ length: 1000 }, (_, i) => `key-${i}`)
      const f = new XorFilter(keys)
      let falsePositives = 0
      const trials = 10000
      for (let i = 0; i < trials; i++) {
        if (f.has(`not-present-${i}`)) falsePositives++
      }
      const rate = falsePositives / trials
      expect(rate).toBeLessThan(0.05)
    })

    it('measured FPR close to theoretical for small filter', () => {
      const keys = Array.from({ length: 100 }, (_, i) => `key-${i}`)
      const f = new XorFilter(keys)
      let falsePositives = 0
      const trials = 10000
      for (let i = 0; i < trials; i++) {
        if (f.has(`missing-${i}`)) falsePositives++
      }
      const rate = falsePositives / trials
      expect(rate).toBeLessThan(0.05)
    })

    it('measured FPR for 100 elements', () => {
      const keys = Array.from({ length: 100 }, (_, i) => `k-${i}`)
      const f = new XorFilter(keys)
      let fp = 0
      for (let i = 0; i < 10000; i++) {
        if (f.has(`absent-${i}`)) fp++
      }
      expect(fp / 10000).toBeLessThan(0.1)
    })

    it('measured FPR for 1000 elements', () => {
      const keys = Array.from({ length: 1000 }, (_, i) => `k-${i}`)
      const f = new XorFilter(keys)
      let fp = 0
      for (let i = 0; i < 10000; i++) {
        if (f.has(`other-${i}`)) fp++
      }
      expect(fp / 10000).toBeLessThan(0.1)
    })

    it('empty filter returns no false positives', () => {
      const f = new XorFilter([])
      let positives = 0
      for (let i = 0; i < 1000; i++) {
        if (f.has(`test-${i}`)) positives++
      }
      expect(positives).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('handles identical element repeated', () => {
      const f = new XorFilter(['dup', 'dup'])
      expect(f.size).toBe(1)
      expect(f.has('dup')).toBe(true)
    })

    it('handles two elements', () => {
      const f = new XorFilter(['a', 'b'])
      expect(f.has('a')).toBe(true)
      expect(f.has('b')).toBe(true)
    })

    it('very large filter 10000 elements', () => {
      const keys = Array.from({ length: 10000 }, (_, i) => `k-${i}`)
      const f = new XorFilter(keys)
      expect(f.has('k-0')).toBe(true)
      expect(f.has('k-9999')).toBe(true)
    })

    it('handles single character elements', () => {
      const f = new XorFilter(['a', 'b', 'c', 'd', 'e'])
      for (const ch of ['a', 'b', 'c', 'd', 'e']) {
        expect(f.has(ch)).toBe(true)
      }
      expect(f.has('f')).toBe(false)
    })

    it('handles elements with backslashes', () => {
      const f = new XorFilter(['path\\to\\file', 'C:\\Users'])
      expect(f.has('path\\to\\file')).toBe(true)
      expect(f.has('C:\\Users')).toBe(true)
    })

    it('handles elements with newlines and tabs', () => {
      const f = new XorFilter(['line1\nline2', 'col1\tcol2'])
      expect(f.has('line1\nline2')).toBe(true)
      expect(f.has('col1\tcol2')).toBe(true)
    })

    it('handles emoji elements', () => {
      const f = new XorFilter(['😀', '🎉', '🚀', '❤️'])
      expect(f.has('😀')).toBe(true)
      expect(f.has('🎉')).toBe(true)
      expect(f.has('👍')).toBe(false)
    })

    it('handles URL elements', () => {
      const f = new XorFilter(['https://example.com', 'http://test.org/path?q=1'])
      expect(f.has('https://example.com')).toBe(true)
      expect(f.has('http://test.org/path?q=1')).toBe(true)
    })

    it('handles JSON-like elements', () => {
      const f = new XorFilter(['{"key":"value"}', '[1,2,3]'])
      expect(f.has('{"key":"value"}')).toBe(true)
      expect(f.has('[1,2,3]')).toBe(true)
    })

    it('handles elements that are substrings of each other', () => {
      const f = new XorFilter(['a', 'ab', 'abc', 'abcd'])
      expect(f.has('a')).toBe(true)
      expect(f.has('ab')).toBe(true)
      expect(f.has('abc')).toBe(true)
      expect(f.has('abcd')).toBe(true)
      expect(f.has('abcde')).toBe(false)
    })

    it('handles UUID-like elements', () => {
      const keys = [
        '550e8400-e29b-41d4-a716-446655440000',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      ]
      const f = new XorFilter(keys)
      for (const key of keys) {
        expect(f.has(key)).toBe(true)
      }
      expect(f.has('00000000-0000-0000-0000-000000000000')).toBe(false)
    })

    it('handles email-like elements', () => {
      const f = new XorFilter(['user@example.com', 'admin@test.org'])
      expect(f.has('user@example.com')).toBe(true)
      expect(f.has('unknown@nowhere.com')).toBe(false)
    })

    it('handles file path elements', () => {
      const f = new XorFilter(['/usr/bin/node', '/home/user/file.txt'])
      expect(f.has('/usr/bin/node')).toBe(true)
      expect(f.has('/home/user/file.txt')).toBe(true)
    })

    it('handles elements with common prefixes', () => {
      const keys = Array.from({ length: 1000 }, (_, i) => `/api/v1/resource/${i}`)
      const f = new XorFilter(keys)
      expect(f.has('/api/v1/resource/0')).toBe(true)
      expect(f.has('/api/v1/resource/999')).toBe(true)
      expect(f.has('/api/v1/resource/1000')).toBe(false)
    })

    it('handles deduplicated elements correctly', () => {
      const f1 = new XorFilter(['a', 'b', 'c'])
      const f2 = new XorFilter(['a', 'a', 'b', 'b', 'c', 'c'])
      expect(f1.has('a')).toBe(true)
      expect(f2.has('a')).toBe(true)
      expect(f1.has('d')).toBe(false)
      expect(f2.has('d')).toBe(false)
    })
  })
})
