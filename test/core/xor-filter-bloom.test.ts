import { describe, it, expect } from 'vitest'
import { XorFilterBloom } from '../../src/core/xor-filter-bloom/xor-filter-bloom.js'
import { DEFAULT_XOR_FILTER_BLOOM_OPTIONS } from '../../src/core/xor-filter-bloom/types.js'
import type { XorFilterBloomOptions, XorFilterBloomData } from '../../src/core/xor-filter-bloom/types.js'

describe('XorFilterBloom', () => {
  describe('construction (from)', () => {
    it('should create a filter from an array of strings', () => {
      const filter = XorFilterBloom.from(['a', 'b', 'c'])
      expect(filter.size).toBe(3)
    })

    it('should create a filter from an empty array', () => {
      const filter = XorFilterBloom.from([])
      expect(filter.size).toBe(0)
    })

    it('should create a filter from a single item', () => {
      const filter = XorFilterBloom.from(['only'])
      expect(filter.size).toBe(1)
    })

    it('should deduplicate items', () => {
      const filter = XorFilterBloom.from(['a', 'a', 'b', 'b', 'c'])
      expect(filter.size).toBe(3)
    })

    it('should handle unicode strings', () => {
      const filter = XorFilterBloom.from(['日本語', '🎉🚀', 'café'])
      expect(filter.size).toBe(3)
    })

    it('should handle empty string as an item', () => {
      const filter = XorFilterBloom.from([''])
      expect(filter.size).toBe(1)
    })

    it('should handle very long strings', () => {
      const longStr = 'x'.repeat(10000)
      const filter = XorFilterBloom.from([longStr])
      expect(filter.size).toBe(1)
    })

    it('should handle special characters', () => {
      const filter = XorFilterBloom.from(['hello\nworld', 'path/to/file', 'tab\there'])
      expect(filter.size).toBe(3)
    })

    it('should handle a large number of items', () => {
      const items = Array.from({ length: 10000 }, (_, i) => `item-${i}`)
      const filter = XorFilterBloom.from(items)
      expect(filter.size).toBe(10000)
    })

    it('should handle all duplicate items', () => {
      const filter = XorFilterBloom.from(['same', 'same', 'same'])
      expect(filter.size).toBe(1)
    })

    it('should accept custom fingerprintBits', () => {
      const filter = XorFilterBloom.from(['a', 'b', 'c'], 4)
      expect(filter.fingerprintSize).toBe(4)
    })

    it('should use default fingerprintBits when not specified', () => {
      const filter = XorFilterBloom.from(['a', 'b', 'c'])
      expect(filter.fingerprintSize).toBe(DEFAULT_XOR_FILTER_BLOOM_OPTIONS.fingerprintBits)
    })

    it('should handle numeric string items', () => {
      const filter = XorFilterBloom.from(['123', '456', '789'])
      expect(filter.size).toBe(3)
    })

    it('should handle whitespace-only items', () => {
      const filter = XorFilterBloom.from(['   ', '\t', '\n'])
      expect(filter.size).toBe(3)
    })
  })

  describe('contains (positive)', () => {
    it('should return true for an item that was added', () => {
      const filter = XorFilterBloom.from(['hello'])
      expect(filter.contains('hello')).toBe(true)
    })

    it('should return true for all added items', () => {
      const items = ['apple', 'banana', 'cherry', 'date', 'elderberry']
      const filter = XorFilterBloom.from(items)
      for (const item of items) {
        expect(filter.contains(item)).toBe(true)
      }
    })

    it('should return true for empty string item', () => {
      const filter = XorFilterBloom.from([''])
      expect(filter.contains('')).toBe(true)
    })

    it('should return true for unicode items', () => {
      const filter = XorFilterBloom.from(['日本語', '中文', 'العربية'])
      expect(filter.contains('日本語')).toBe(true)
      expect(filter.contains('中文')).toBe(true)
      expect(filter.contains('العربية')).toBe(true)
    })

    it('should be case-sensitive', () => {
      const filter = XorFilterBloom.from(['Hello'])
      expect(filter.contains('Hello')).toBe(true)
      expect(filter.contains('hello')).toBe(false)
      expect(filter.contains('HELLO')).toBe(false)
    })

    it('should return consistent results across multiple calls', () => {
      const filter = XorFilterBloom.from(['stable'])
      expect(filter.contains('stable')).toBe(true)
      expect(filter.contains('stable')).toBe(true)
      expect(filter.contains('stable')).toBe(true)
    })

    it('should handle null characters in items', () => {
      const filter = XorFilterBloom.from(['before\0after'])
      expect(filter.contains('before\0after')).toBe(true)
      expect(filter.contains('before')).toBe(false)
    })

    it('should handle mixed unicode content', () => {
      const filter = XorFilterBloom.from(['hello世界🎉'])
      expect(filter.contains('hello世界🎉')).toBe(true)
      expect(filter.contains('hello世界')).toBe(false)
    })

    it('should handle very long string items', () => {
      const longStr = 'a'.repeat(10000)
      const filter = XorFilterBloom.from([longStr])
      expect(filter.contains(longStr)).toBe(true)
      expect(filter.contains('a'.repeat(9999))).toBe(false)
    })

    it('should return false for empty filter on any query', () => {
      const filter = XorFilterBloom.from([])
      expect(filter.contains('')).toBe(false)
      expect(filter.contains('a')).toBe(false)
      expect(filter.contains('日本語')).toBe(false)
    })

    it('should handle items with newlines and tabs', () => {
      const filter = XorFilterBloom.from(['line1\nline2', 'col1\tcol2'])
      expect(filter.contains('line1\nline2')).toBe(true)
      expect(filter.contains('col1\tcol2')).toBe(true)
    })

    it('should handle emoji items', () => {
      const filter = XorFilterBloom.from(['😀', '🎉', '🚀', '❤️'])
      expect(filter.contains('😀')).toBe(true)
      expect(filter.contains('🎉')).toBe(true)
      expect(filter.contains('👍')).toBe(false)
    })
  })

  describe('false positive rate (negative)', () => {
    it('should return false for items not in the filter', () => {
      const filter = XorFilterBloom.from(['hello'])
      expect(filter.contains('world')).toBe(false)
    })

    it('should return false for items not in multi-item filter', () => {
      const filter = XorFilterBloom.from(['a', 'b', 'c'])
      expect(filter.contains('d')).toBe(false)
      expect(filter.contains('e')).toBe(false)
    })

    it('should have a low false positive rate for moderate sets', () => {
      const items = Array.from({ length: 1000 }, (_, i) => `item-${i}`)
      const filter = XorFilterBloom.from(items)
      let falsePositives = 0
      const trials = 10000
      for (let i = 0; i < trials; i++) {
        if (filter.contains(`not-present-${i}`)) {
          falsePositives++
        }
      }
      const rate = falsePositives / trials
      expect(rate).toBeLessThan(0.05)
    })

    it('should have a reasonable false positive rate for small sets', () => {
      const items = Array.from({ length: 100 }, (_, i) => `item-${i}`)
      const filter = XorFilterBloom.from(items)
      let falsePositives = 0
      const trials = 10000
      for (let i = 0; i < trials; i++) {
        if (filter.contains(`missing-${i}`)) {
          falsePositives++
        }
      }
      const rate = falsePositives / trials
      expect(rate).toBeLessThan(0.05)
    })

    it('should not have excessive false positives for large sets', () => {
      const items = Array.from({ length: 5000 }, (_, i) => `item-${i}`)
      const filter = XorFilterBloom.from(items)
      let falsePositives = 0
      const trials = 10000
      for (let i = 0; i < trials; i++) {
        if (filter.contains(`absent-${i}`)) {
          falsePositives++
        }
      }
      const rate = falsePositives / trials
      expect(rate).toBeLessThan(0.1)
    })

    it('should return zero positives for empty filter', () => {
      const filter = XorFilterBloom.from([])
      let positives = 0
      for (let i = 0; i < 1000; i++) {
        if (filter.contains(`test-${i}`)) {
          positives++
        }
      }
      expect(positives).toBe(0)
    })

    it('should produce binary output for membership queries', () => {
      const filter = XorFilterBloom.from(['included'])
      expect(typeof filter.contains('included')).toBe('boolean')
      expect(typeof filter.contains('excluded')).toBe('boolean')
    })
  })

  describe('size', () => {
    it('should return 0 for empty filter', () => {
      const filter = XorFilterBloom.from([])
      expect(filter.size).toBe(0)
    })

    it('should return 1 for single item', () => {
      const filter = XorFilterBloom.from(['a'])
      expect(filter.size).toBe(1)
    })

    it('should return the count of unique items', () => {
      const filter = XorFilterBloom.from(['a', 'b', 'c'])
      expect(filter.size).toBe(3)
    })

    it('should deduplicate before counting', () => {
      const filter = XorFilterBloom.from(['x', 'x', 'y', 'y', 'z'])
      expect(filter.size).toBe(3)
    })

    it('should return correct count for large sets', () => {
      const items = Array.from({ length: 5000 }, (_, i) => `k-${i}`)
      const filter = XorFilterBloom.from(items)
      expect(filter.size).toBe(5000)
    })
  })

  describe('capacity', () => {
    it('should return a positive number for non-empty filter', () => {
      const filter = XorFilterBloom.from(['a', 'b', 'c'])
      expect(filter.capacity).toBeGreaterThan(0)
    })

    it('should return 3 for empty filter', () => {
      const filter = XorFilterBloom.from([])
      expect(filter.capacity).toBe(3)
    })

    it('should increase with more items', () => {
      const small = XorFilterBloom.from(['a'])
      const large = XorFilterBloom.from(Array.from({ length: 1000 }, (_, i) => `k-${i}`))
      expect(large.capacity).toBeGreaterThan(small.capacity)
    })

    it('should be approximately 1.23 * n + 32', () => {
      const n = 1000
      const filter = XorFilterBloom.from(Array.from({ length: n }, (_, i) => `k-${i}`))
      const expected = Math.ceil(n * 1.23) + 32
      expect(filter.capacity).toBe(expected)
    })
  })

  describe('falsePositiveRate', () => {
    it('should return 0 for empty filter', () => {
      const filter = XorFilterBloom.from([])
      expect(filter.falsePositiveRate).toBe(0)
    })

    it('should return 1/256 for default 8-bit fingerprints', () => {
      const filter = XorFilterBloom.from(['a', 'b', 'c'])
      expect(filter.falsePositiveRate).toBe(1 / 256)
    })

    it('should return 1/16 for 4-bit fingerprints', () => {
      const filter = XorFilterBloom.from(['a', 'b', 'c'], 4)
      expect(filter.falsePositiveRate).toBe(1 / 16)
    })

    it('should decrease with more fingerprint bits', () => {
      const f4 = XorFilterBloom.from(['a', 'b', 'c'], 4)
      const f8 = XorFilterBloom.from(['a', 'b', 'c'], 8)
      expect(f8.falsePositiveRate).toBeLessThan(f4.falsePositiveRate)
    })

    it('should be a positive number for non-empty filter', () => {
      const filter = XorFilterBloom.from(['a'])
      expect(filter.falsePositiveRate).toBeGreaterThan(0)
    })

    it('should be less than 1', () => {
      const filter = XorFilterBloom.from(['a', 'b', 'c'])
      expect(filter.falsePositiveRate).toBeLessThan(1)
    })
  })

  describe('fingerprintSize', () => {
    it('should return 8 by default', () => {
      const filter = XorFilterBloom.from(['a'])
      expect(filter.fingerprintSize).toBe(8)
    })

    it('should return custom value when specified', () => {
      const filter = XorFilterBloom.from(['a'], 4)
      expect(filter.fingerprintSize).toBe(4)
    })

    it('should return 1 for minimal fingerprint bits', () => {
      const filter = XorFilterBloom.from(['a'], 1)
      expect(filter.fingerprintSize).toBe(1)
    })
  })

  describe('serialization (toJSON/fromJSON)', () => {
    it('should serialize to JSON', () => {
      const filter = XorFilterBloom.from(['test'])
      const json = filter.toJSON()
      expect(json.fingerprints).toBeInstanceOf(Array)
      expect(json.arrayLength).toBeGreaterThan(0)
      expect(json.seed).toBeGreaterThanOrEqual(0)
      expect(json.itemCount).toBe(1)
      expect(json.fingerprintBits).toBe(8)
    })

    it('should round-trip through JSON', () => {
      const filter = XorFilterBloom.from(['hello', 'world'])
      const json = filter.toJSON()
      const restored = XorFilterBloom.fromJSON(json)
      expect(restored.contains('hello')).toBe(true)
      expect(restored.contains('world')).toBe(true)
      expect(restored.size).toBe(2)
    })

    it('should preserve capacity through serialization', () => {
      const filter = XorFilterBloom.from(['a', 'b', 'c'])
      const json = filter.toJSON()
      const restored = XorFilterBloom.fromJSON(json)
      expect(restored.capacity).toBe(filter.capacity)
    })

    it('should preserve fingerprintSize through serialization', () => {
      const filter = XorFilterBloom.from(['a', 'b'], 4)
      const json = filter.toJSON()
      const restored = XorFilterBloom.fromJSON(json)
      expect(restored.fingerprintSize).toBe(4)
    })

    it('should preserve falsePositiveRate through serialization', () => {
      const filter = XorFilterBloom.from(['a', 'b', 'c'])
      const json = filter.toJSON()
      const restored = XorFilterBloom.fromJSON(json)
      expect(restored.falsePositiveRate).toBe(filter.falsePositiveRate)
    })

    it('should handle empty filter serialization', () => {
      const filter = XorFilterBloom.from([])
      const json = filter.toJSON()
      const restored = XorFilterBloom.fromJSON(json)
      expect(restored.size).toBe(0)
      expect(restored.contains('anything')).toBe(false)
    })

    it('should handle large filter serialization', () => {
      const items = Array.from({ length: 1000 }, (_, i) => `item-${i}`)
      const filter = XorFilterBloom.from(items)
      const json = filter.toJSON()
      const restored = XorFilterBloom.fromJSON(json)
      for (const item of items) {
        expect(restored.contains(item)).toBe(true)
      }
      expect(restored.size).toBe(1000)
    })

    it('should produce valid XorFilterBloomData type', () => {
      const filter = XorFilterBloom.from(['test'])
      const json: XorFilterBloomData = filter.toJSON()
      expect(typeof json.fingerprints).toBe('object')
      expect(typeof json.arrayLength).toBe('number')
      expect(typeof json.seed).toBe('number')
      expect(typeof json.itemCount).toBe('number')
      expect(typeof json.fingerprintBits).toBe('number')
    })

    it('should preserve seed through serialization', () => {
      const filter = XorFilterBloom.from(['a', 'b'])
      const json = filter.toJSON()
      const restored = XorFilterBloom.fromJSON(json)
      expect(restored.toJSON().seed).toBe(json.seed)
    })

    it('should handle custom fingerprint bits in serialization', () => {
      const filter = XorFilterBloom.from(['a', 'b'], 6)
      const json = filter.toJSON()
      expect(json.fingerprintBits).toBe(6)
      const restored = XorFilterBloom.fromJSON(json)
      expect(restored.fingerprintSize).toBe(6)
    })
  })

  describe('edge cases', () => {
    it('should handle items that differ by one character', () => {
      const filter = XorFilterBloom.from(['abc', 'abd', 'abe'])
      expect(filter.contains('abc')).toBe(true)
      expect(filter.contains('abd')).toBe(true)
      expect(filter.contains('abe')).toBe(true)
      expect(filter.contains('abf')).toBe(false)
    })

    it('should handle items that are substrings of each other', () => {
      const filter = XorFilterBloom.from(['a', 'ab', 'abc', 'abcd'])
      expect(filter.contains('a')).toBe(true)
      expect(filter.contains('ab')).toBe(true)
      expect(filter.contains('abc')).toBe(true)
      expect(filter.contains('abcd')).toBe(true)
      expect(filter.contains('abcde')).toBe(false)
    })

    it('should handle single character items', () => {
      const filter = XorFilterBloom.from(['a', 'b', 'c', 'd', 'e'])
      for (const ch of ['a', 'b', 'c', 'd', 'e']) {
        expect(filter.contains(ch)).toBe(true)
      }
      expect(filter.contains('f')).toBe(false)
    })

    it('should handle items with only whitespace differences', () => {
      const filter = XorFilterBloom.from([' ', '  ', '   '])
      expect(filter.contains(' ')).toBe(true)
      expect(filter.contains('  ')).toBe(true)
      expect(filter.contains('   ')).toBe(true)
    })

    it('should handle backslashes in items', () => {
      const filter = XorFilterBloom.from(['path\\to\\file', 'C:\\Users'])
      expect(filter.contains('path\\to\\file')).toBe(true)
      expect(filter.contains('C:\\Users')).toBe(true)
    })

    it('should handle very short and very long items together', () => {
      const longKey = 'x'.repeat(10000)
      const filter = XorFilterBloom.from(['a', longKey])
      expect(filter.contains('a')).toBe(true)
      expect(filter.contains(longKey)).toBe(true)
    })

    it('should handle URL items', () => {
      const filter = XorFilterBloom.from(['https://example.com', 'http://test.org/path?q=1'])
      expect(filter.contains('https://example.com')).toBe(true)
      expect(filter.contains('http://test.org/path?q=1')).toBe(true)
    })

    it('should handle file path items', () => {
      const filter = XorFilterBloom.from(['/usr/bin/node', '/home/user/file.txt'])
      expect(filter.contains('/usr/bin/node')).toBe(true)
      expect(filter.contains('/home/user/file.txt')).toBe(true)
    })

    it('should handle items with repeated patterns', () => {
      const filter = XorFilterBloom.from(['abcabc', 'abcabcabc', 'xyzxyz'])
      expect(filter.contains('abcabc')).toBe(true)
      expect(filter.contains('abcabcabc')).toBe(true)
      expect(filter.contains('xyzxyz')).toBe(true)
    })

    it('should handle hash-like string items', () => {
      const filter = XorFilterBloom.from(['a1b2c3d4e5f6', 'sha256:abcdef123456'])
      expect(filter.contains('a1b2c3d4e5f6')).toBe(true)
      expect(filter.contains('sha256:abcdef123456')).toBe(true)
    })

    it('should handle items with null bytes', () => {
      const filter = XorFilterBloom.from(['a\0b', '\0start', 'end\0'])
      expect(filter.contains('a\0b')).toBe(true)
      expect(filter.contains('\0start')).toBe(true)
      expect(filter.contains('end\0')).toBe(true)
    })

    it('should handle JSON-like items', () => {
      const filter = XorFilterBloom.from(['{"key":"value"}', '[1,2,3]'])
      expect(filter.contains('{"key":"value"}')).toBe(true)
      expect(filter.contains('[1,2,3]')).toBe(true)
    })

    it('should handle email-like items', () => {
      const filter = XorFilterBloom.from(['user@example.com', 'admin@test.org'])
      expect(filter.contains('user@example.com')).toBe(true)
      expect(filter.contains('admin@test.org')).toBe(true)
      expect(filter.contains('unknown@nowhere.com')).toBe(false)
    })

    it('should handle UUID-like items', () => {
      const keys = [
        '550e8400-e29b-41d4-a716-446655440000',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      ]
      const filter = XorFilterBloom.from(keys)
      for (const key of keys) {
        expect(filter.contains(key)).toBe(true)
      }
      expect(filter.contains('00000000-0000-0000-0000-000000000000')).toBe(false)
    })
  })

  describe('no false negatives', () => {
    it('should never return false for added items', () => {
      const items = ['alpha', 'beta', 'gamma', 'delta', 'epsilon']
      const filter = XorFilterBloom.from(items)
      for (const item of items) {
        expect(filter.contains(item)).toBe(true)
      }
    })

    it('should have no false negatives for 100 items', () => {
      const items = Array.from({ length: 100 }, (_, i) => `item-${i}`)
      const filter = XorFilterBloom.from(items)
      for (const item of items) {
        expect(filter.contains(item)).toBe(true)
      }
    })

    it('should have no false negatives for 1000 items', () => {
      const items = Array.from({ length: 1000 }, (_, i) => `item-${i}`)
      const filter = XorFilterBloom.from(items)
      for (const item of items) {
        expect(filter.contains(item)).toBe(true)
      }
    })

    it('should have no false negatives for unicode items', () => {
      const items = ['日本', '中国', '한국', 'India', '🇺🇸', '🇬🇧']
      const filter = XorFilterBloom.from(items)
      for (const item of items) {
        expect(filter.contains(item)).toBe(true)
      }
    })

    it('should have no false negatives with custom fingerprint bits', () => {
      const items = Array.from({ length: 100 }, (_, i) => `item-${i}`)
      const filter = XorFilterBloom.from(items, 4)
      for (const item of items) {
        expect(filter.contains(item)).toBe(true)
      }
    })

    it('should have no false negatives for items with common prefixes', () => {
      const items = Array.from({ length: 1000 }, (_, i) => `/api/v1/resource/${i}`)
      const filter = XorFilterBloom.from(items)
      for (let i = 0; i < 1000; i++) {
        expect(filter.contains(`/api/v1/resource/${i}`)).toBe(true)
      }
    })
  })

  describe('accuracy', () => {
    it('should have observed FP rate close to theoretical for 8-bit fingerprints', () => {
      const items = Array.from({ length: 500 }, (_, i) => `item-${i}`)
      const filter = XorFilterBloom.from(items)
      let falsePositives = 0
      const trials = 50000
      for (let i = 0; i < trials; i++) {
        if (filter.contains(`fp-test-${i}`)) {
          falsePositives++
        }
      }
      const observedRate = falsePositives / trials
      expect(observedRate).toBeLessThan(0.02)
    })

    it('should have higher FP rate with fewer fingerprint bits', () => {
      const items = Array.from({ length: 100 }, (_, i) => `item-${i}`)
      const f4 = XorFilterBloom.from(items, 4)
      const f8 = XorFilterBloom.from(items, 8)
      let fp4 = 0
      let fp8 = 0
      const trials = 10000
      for (let i = 0; i < trials; i++) {
        const testKey = `accuracy-${i}`
        if (f4.contains(testKey)) fp4++
        if (f8.contains(testKey)) fp8++
      }
      expect(fp4).toBeGreaterThanOrEqual(fp8)
    })

    it('should correctly compute falsePositiveRate property', () => {
      const filter = XorFilterBloom.from(['a', 'b', 'c'], 8)
      expect(filter.falsePositiveRate).toBeCloseTo(1 / 256, 6)
    })
  })

  describe('stress', () => {
    it('should handle 10000 items with no false negatives', () => {
      const items = Array.from({ length: 10000 }, (_, i) => `k-${i}`)
      const filter = XorFilterBloom.from(items)
      for (let i = 0; i < 100; i++) {
        const idx = Math.floor(Math.random() * 10000)
        expect(filter.contains(`k-${idx}`)).toBe(true)
      }
    })

    it('should handle 10000 items and find first and last', () => {
      const items = Array.from({ length: 10000 }, (_, i) => `k-${i}`)
      const filter = XorFilterBloom.from(items)
      expect(filter.contains('k-0')).toBe(true)
      expect(filter.contains('k-9999')).toBe(true)
    })

    it('should handle construction of large unique item set', () => {
      const items = Array.from({ length: 5000 }, (_, i) => `unique-${i}`)
      const start = performance.now()
      const filter = XorFilterBloom.from(items)
      const elapsed = performance.now() - start
      expect(filter.size).toBe(5000)
      expect(elapsed).toBeLessThan(30000)
    })

    it('should handle rapid sequential queries', () => {
      const items = Array.from({ length: 1000 }, (_, i) => `q-${i}`)
      const filter = XorFilterBloom.from(items)
      for (let i = 0; i < 1000; i++) {
        expect(filter.contains(`q-${i}`)).toBe(true)
      }
    })

    it('should handle sequential numeric string items', () => {
      const items = Array.from({ length: 500 }, (_, i) => String(i))
      const filter = XorFilterBloom.from(items)
      for (let i = 0; i < 500; i++) {
        expect(filter.contains(String(i))).toBe(true)
      }
    })
  })

  describe('deduplication', () => {
    it('should treat duplicate items as a single entry', () => {
      const filter = XorFilterBloom.from(['dup', 'dup'])
      expect(filter.size).toBe(1)
    })

    it('should correctly query deduplicated items', () => {
      const filter = XorFilterBloom.from(['a', 'a', 'b', 'b', 'c'])
      expect(filter.contains('a')).toBe(true)
      expect(filter.contains('b')).toBe(true)
      expect(filter.contains('c')).toBe(true)
    })

    it('should handle all identical items', () => {
      const filter = XorFilterBloom.from(['same', 'same', 'same', 'same'])
      expect(filter.size).toBe(1)
      expect(filter.contains('same')).toBe(true)
    })

    it('should produce same result with or without duplicates', () => {
      const f1 = XorFilterBloom.from(['a', 'b', 'c'])
      const f2 = XorFilterBloom.from(['a', 'a', 'b', 'b', 'c', 'c'])
      expect(f1.contains('a')).toBe(true)
      expect(f2.contains('a')).toBe(true)
      expect(f1.contains('d')).toBe(false)
      expect(f2.contains('d')).toBe(false)
    })

    it('should handle deduplication of many identical items', () => {
      const items = Array.from({ length: 1000 }, () => 'same')
      const filter = XorFilterBloom.from(items)
      expect(filter.size).toBe(1)
    })
  })

  describe('consistency', () => {
    it('should return same results across multiple query rounds', () => {
      const items = ['k1', 'k2', 'k3']
      const filter = XorFilterBloom.from(items)
      for (let round = 0; round < 5; round++) {
        for (const item of items) {
          expect(filter.contains(item)).toBe(true)
        }
      }
    })

    it('should produce stable construction for identical inputs', () => {
      const items = ['a', 'b', 'c', 'd', 'e']
      const filters = Array.from({ length: 5 }, () => XorFilterBloom.from(items))
      for (let f = 1; f < filters.length; f++) {
        expect(filters[f].toJSON().fingerprints).toEqual(filters[0].toJSON().fingerprints)
      }
    })

    it('should produce consistent results for same item set', () => {
      const items = ['alpha', 'beta', 'gamma']
      const f1 = XorFilterBloom.from(items)
      const f2 = XorFilterBloom.from(items)
      for (const item of items) {
        expect(f1.contains(item)).toBe(f2.contains(item))
      }
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_XOR_FILTER_BLOOM_OPTIONS', () => {
      expect(DEFAULT_XOR_FILTER_BLOOM_OPTIONS.fingerprintBits).toBe(8)
    })

    it('should support XorFilterBloomOptions interface', () => {
      const opts: XorFilterBloomOptions = { fingerprintBits: 4 }
      expect(opts.fingerprintBits).toBe(4)
    })

    it('should support XorFilterBloomData interface', () => {
      const data: XorFilterBloomData = {
        fingerprints: [0, 1, 2],
        arrayLength: 3,
        seed: 0,
        itemCount: 1,
        fingerprintBits: 8,
      }
      expect(data.arrayLength).toBe(3)
      expect(data.fingerprintBits).toBe(8)
    })

    it('should support XorFilterBloomOptions with default values', () => {
      const opts: XorFilterBloomOptions = { ...DEFAULT_XOR_FILTER_BLOOM_OPTIONS }
      expect(opts.fingerprintBits).toBe(DEFAULT_XOR_FILTER_BLOOM_OPTIONS.fingerprintBits)
    })
  })

  describe('space efficiency', () => {
    it('should use approximately 1.23 * n + 32 slots', () => {
      const n = 1000
      const filter = XorFilterBloom.from(Array.from({ length: n }, (_, i) => `k-${i}`))
      const expected = Math.ceil(n * 1.23) + 32
      expect(filter.capacity).toBe(expected)
    })

    it('should use fewer bytes than storing raw items', () => {
      const items = Array.from({ length: 100 }, (_, i) => `key-${i}`)
      const filter = XorFilterBloom.from(items)
      const rawBytes = items.reduce((sum, k) => sum + k.length, 0)
      expect(filter.capacity).toBeLessThan(rawBytes)
    })

    it('should have constant overhead per item', () => {
      const f1 = XorFilterBloom.from(Array.from({ length: 100 }, (_, i) => `k-${i}`))
      const f2 = XorFilterBloom.from(Array.from({ length: 10000 }, (_, i) => `k-${i}`))
      const ratio1 = f1.capacity / f1.size
      const ratio2 = f2.capacity / f2.size
      expect(Math.abs(ratio1 - ratio2)).toBeLessThan(1)
    })

    it('should use compact fingerprint storage', () => {
      const items = Array.from({ length: 100 }, (_, i) => `k-${i}`)
      const filter = XorFilterBloom.from(items)
      const bytesPerItem = filter.capacity / filter.size
      expect(bytesPerItem).toBeLessThan(2)
    })
  })

  describe('json round-trip consistency', () => {
    it('should produce identical results after round-trip', () => {
      const items = ['alpha', 'beta', 'gamma', 'delta']
      const original = XorFilterBloom.from(items)
      const json = original.toJSON()
      const restored = XorFilterBloom.fromJSON(json)
      for (const item of items) {
        expect(restored.contains(item)).toBe(original.contains(item))
      }
    })

    it('should preserve all properties after round-trip', () => {
      const original = XorFilterBloom.from(['a', 'b', 'c'], 6)
      const json = original.toJSON()
      const restored = XorFilterBloom.fromJSON(json)
      expect(restored.size).toBe(original.size)
      expect(restored.capacity).toBe(original.capacity)
      expect(restored.fingerprintSize).toBe(original.fingerprintSize)
      expect(restored.falsePositiveRate).toBe(original.falsePositiveRate)
    })

    it('should produce identical JSON from restored filter', () => {
      const original = XorFilterBloom.from(['x', 'y', 'z'])
      const json1 = original.toJSON()
      const restored = XorFilterBloom.fromJSON(json1)
      const json2 = restored.toJSON()
      expect(json2).toEqual(json1)
    })
  })
})
