import { describe, it, expect } from 'vitest'
import { XorFilter } from '../../src/core/xor-filter/xor-filter.js'
import { DEFAULT_XOR_FILTER_CONFIG } from '../../src/core/xor-filter/types.js'
import type { XorFilterConfig } from '../../src/core/xor-filter/types.js'

describe('XorFilter', () => {
  describe('constructor', () => {
    it('should create a filter from a set of keys', () => {
      const filter = new XorFilter(['a', 'b', 'c'])
      expect(filter.getSize()).toBe(3)
    })

    it('should create a filter from an empty array', () => {
      const filter = new XorFilter([])
      expect(filter.getSize()).toBe(0)
    })

    it('should create a filter from a single key', () => {
      const filter = new XorFilter(['only'])
      expect(filter.getSize()).toBe(1)
    })

    it('should deduplicate keys', () => {
      const filter = new XorFilter(['a', 'a', 'b', 'b', 'c'])
      expect(filter.getSize()).toBe(3)
    })

    it('should handle keys with unicode characters', () => {
      const filter = new XorFilter(['日本語', '🎉🚀', 'café'])
      expect(filter.getSize()).toBe(3)
    })

    it('should handle empty string as a key', () => {
      const filter = new XorFilter([''])
      expect(filter.getSize()).toBe(1)
    })

    it('should handle very long strings as keys', () => {
      const longStr = 'x'.repeat(10000)
      const filter = new XorFilter([longStr])
      expect(filter.getSize()).toBe(1)
    })

    it('should handle keys with special characters', () => {
      const filter = new XorFilter(['hello\nworld', 'path/to/file', 'tab\there'])
      expect(filter.getSize()).toBe(3)
    })

    it('should handle a large number of keys', () => {
      const keys = Array.from({ length: 10000 }, (_, i) => `key-${i}`)
      const filter = new XorFilter(keys)
      expect(filter.getSize()).toBe(10000)
    })

    it('should handle keys that are all duplicates', () => {
      const filter = new XorFilter(['same', 'same', 'same'])
      expect(filter.getSize()).toBe(1)
    })
  })

  describe('has', () => {
    it('should return true for a key that was added', () => {
      const filter = new XorFilter(['hello'])
      expect(filter.has('hello')).toBe(true)
    })

    it('should return false for a key that was not added', () => {
      const filter = new XorFilter(['hello'])
      expect(filter.has('world')).toBe(false)
    })

    it('should return false for an empty filter', () => {
      const filter = new XorFilter([])
      expect(filter.has('anything')).toBe(false)
    })

    it('should find all added keys', () => {
      const keys = ['apple', 'banana', 'cherry', 'date', 'elderberry']
      const filter = new XorFilter(keys)
      for (const key of keys) {
        expect(filter.has(key)).toBe(true)
      }
    })

    it('should return false for keys not in the filter', () => {
      const filter = new XorFilter(['a', 'b', 'c'])
      expect(filter.has('d')).toBe(false)
      expect(filter.has('e')).toBe(false)
    })

    it('should handle empty string key', () => {
      const filter = new XorFilter([''])
      expect(filter.has('')).toBe(true)
      expect(filter.has('a')).toBe(false)
    })

    it('should handle unicode keys', () => {
      const filter = new XorFilter(['日本語', '中文', 'العربية'])
      expect(filter.has('日本語')).toBe(true)
      expect(filter.has('中文')).toBe(true)
      expect(filter.has('English')).toBe(false)
    })

    it('should be case-sensitive', () => {
      const filter = new XorFilter(['Hello'])
      expect(filter.has('Hello')).toBe(true)
      expect(filter.has('hello')).toBe(false)
      expect(filter.has('HELLO')).toBe(false)
    })

    it('should handle numeric string keys', () => {
      const filter = new XorFilter(['123', '456', '789'])
      expect(filter.has('123')).toBe(true)
      expect(filter.has('999')).toBe(false)
    })

    it('should handle whitespace-only keys', () => {
      const filter = new XorFilter(['   ', '\t', '\n'])
      expect(filter.has('   ')).toBe(true)
      expect(filter.has('\t')).toBe(true)
      expect(filter.has('\n')).toBe(true)
    })

    it('should return consistent results across multiple calls', () => {
      const filter = new XorFilter(['stable'])
      const r1 = filter.has('stable')
      const r2 = filter.has('stable')
      const r3 = filter.has('stable')
      expect(r1).toBe(true)
      expect(r2).toBe(true)
      expect(r3).toBe(true)
    })

    it('should handle keys with null characters', () => {
      const filter = new XorFilter(['before\0after'])
      expect(filter.has('before\0after')).toBe(true)
      expect(filter.has('before')).toBe(false)
    })

    it('should handle mixed unicode content', () => {
      const filter = new XorFilter(['hello世界🎉'])
      expect(filter.has('hello世界🎉')).toBe(true)
      expect(filter.has('hello世界')).toBe(false)
    })

    it('should handle very long string key', () => {
      const longStr = 'a'.repeat(10000)
      const filter = new XorFilter([longStr])
      expect(filter.has(longStr)).toBe(true)
      expect(filter.has('a'.repeat(9999))).toBe(false)
    })

    it('should return false for empty filter on any query', () => {
      const filter = new XorFilter([])
      expect(filter.has('')).toBe(false)
      expect(filter.has('a')).toBe(false)
      expect(filter.has('日本語')).toBe(false)
    })
  })

  describe('contains', () => {
    it('should return the same result as has for an added key', () => {
      const filter = new XorFilter(['test'])
      expect(filter.contains('test')).toBe(filter.has('test'))
      expect(filter.contains('test')).toBe(true)
    })

    it('should return the same result as has for a missing key', () => {
      const filter = new XorFilter(['test'])
      expect(filter.contains('missing')).toBe(filter.has('missing'))
      expect(filter.contains('missing')).toBe(false)
    })

    it('should return false for empty filter', () => {
      const filter = new XorFilter([])
      expect(filter.contains('anything')).toBe(false)
    })

    it('should work as an alias for has with multiple keys', () => {
      const keys = ['alpha', 'beta', 'gamma']
      const filter = new XorFilter(keys)
      for (const key of keys) {
        expect(filter.contains(key)).toBe(filter.has(key))
      }
    })

    it('should work as an alias for has with unicode', () => {
      const filter = new XorFilter(['日本語'])
      expect(filter.contains('日本語')).toBe(filter.has('日本語'))
    })

    it('should work as an alias for has with empty string', () => {
      const filter = new XorFilter([''])
      expect(filter.contains('')).toBe(filter.has(''))
    })

    it('should work as an alias for has with special characters', () => {
      const filter = new XorFilter(['hello\nworld'])
      expect(filter.contains('hello\nworld')).toBe(filter.has('hello\nworld'))
    })

    it('should work as an alias for has with case sensitivity', () => {
      const filter = new XorFilter(['Case'])
      expect(filter.contains('case')).toBe(filter.has('case'))
      expect(filter.contains('Case')).toBe(filter.has('Case'))
    })
  })

  describe('getHashFunctions', () => {
    it('should return 3 for default config', () => {
      const filter = new XorFilter(['a'])
      expect(filter.getHashFunctions()).toBe(3)
    })

    it('should return the same value for empty filter', () => {
      const filter = new XorFilter([])
      expect(filter.getHashFunctions()).toBe(3)
    })

    it('should return the same value for large filter', () => {
      const keys = Array.from({ length: 1000 }, (_, i) => `key-${i}`)
      const filter = new XorFilter(keys)
      expect(filter.getHashFunctions()).toBe(3)
    })
  })

  describe('getSize', () => {
    it('should return 0 for empty filter', () => {
      const filter = new XorFilter([])
      expect(filter.getSize()).toBe(0)
    })

    it('should return 1 for single key', () => {
      const filter = new XorFilter(['a'])
      expect(filter.getSize()).toBe(1)
    })

    it('should return the count of unique keys', () => {
      const filter = new XorFilter(['a', 'b', 'c'])
      expect(filter.getSize()).toBe(3)
    })

    it('should deduplicate before counting', () => {
      const filter = new XorFilter(['x', 'x', 'y', 'y', 'z'])
      expect(filter.getSize()).toBe(3)
    })

    it('should return correct count for large sets', () => {
      const keys = Array.from({ length: 5000 }, (_, i) => `k-${i}`)
      const filter = new XorFilter(keys)
      expect(filter.getSize()).toBe(5000)
    })
  })

  describe('getCapacity', () => {
    it('should return capacity in bits for empty filter', () => {
      const filter = new XorFilter([])
      expect(filter.getCapacity()).toBe(3 * 8)
    })

    it('should return capacity in bits for single key', () => {
      const filter = new XorFilter(['a'])
      expect(filter.getCapacity()).toBeGreaterThan(0)
      expect(filter.getCapacity() % 8).toBe(0)
    })

    it('should be proportional to number of keys', () => {
      const small = new XorFilter(['a'])
      const large = new XorFilter(Array.from({ length: 1000 }, (_, i) => `k-${i}`))
      expect(large.getCapacity()).toBeGreaterThan(small.getCapacity())
    })

    it('should always be a multiple of 8', () => {
      const filter = new XorFilter(['a', 'b', 'c', 'd', 'e'])
      expect(filter.getCapacity() % 8).toBe(0)
    })

    it('should be larger than the number of keys * 8', () => {
      const keys = Array.from({ length: 100 }, (_, i) => `k-${i}`)
      const filter = new XorFilter(keys)
      expect(filter.getCapacity()).toBeGreaterThan(keys.length * 8)
    })
  })

  describe('getFingerprints', () => {
    it('should return a Uint8Array', () => {
      const filter = new XorFilter(['a', 'b', 'c'])
      expect(filter.getFingerprints()).toBeInstanceOf(Uint8Array)
    })

    it('should return a copy not a reference', () => {
      const filter = new XorFilter(['a', 'b', 'c'])
      const fp1 = filter.getFingerprints()
      const original = fp1[0]
      fp1[0] = 255
      const fp2 = filter.getFingerprints()
      expect(fp2[0]).toBe(original)
    })

    it('should have non-zero values after construction', () => {
      const filter = new XorFilter(['test-key-1', 'test-key-2', 'test-key-3'])
      const fp = filter.getFingerprints()
      const hasNonZero = Array.from(fp).some(v => v !== 0)
      expect(hasNonZero).toBe(true)
    })

    it('should have correct length', () => {
      const filter = new XorFilter(['a', 'b'])
      const fp = filter.getFingerprints()
      expect(fp.length).toBe(filter.getCapacity() / 8)
    })

    it('should return all zeros for empty filter', () => {
      const filter = new XorFilter([])
      const fp = filter.getFingerprints()
      for (let i = 0; i < fp.length; i++) {
        expect(fp[i]).toBe(0)
      }
    })
  })

  describe('clone', () => {
    it('should return a new XorFilter instance', () => {
      const filter = new XorFilter(['a', 'b', 'c'])
      const cloned = filter.clone()
      expect(cloned).toBeInstanceOf(XorFilter)
      expect(cloned).not.toBe(filter)
    })

    it('should preserve membership queries', () => {
      const keys = ['alpha', 'beta', 'gamma']
      const filter = new XorFilter(keys)
      const cloned = filter.clone()
      for (const key of keys) {
        expect(cloned.has(key)).toBe(true)
      }
    })

    it('should preserve size', () => {
      const filter = new XorFilter(['x', 'y', 'z'])
      const cloned = filter.clone()
      expect(cloned.getSize()).toBe(filter.getSize())
    })

    it('should preserve capacity', () => {
      const filter = new XorFilter(['a', 'b'])
      const cloned = filter.clone()
      expect(cloned.getCapacity()).toBe(filter.getCapacity())
    })

    it('should preserve fingerprint data independently', () => {
      const filter = new XorFilter(['test'])
      const cloned = filter.clone()
      const originalFp = filter.getFingerprints()
      const clonedFp = cloned.getFingerprints()
      expect(clonedFp.length).toBe(originalFp.length)
      for (let i = 0; i < originalFp.length; i++) {
        expect(clonedFp[i]).toBe(originalFp[i])
      }
    })

    it('should return false for missing keys in clone', () => {
      const filter = new XorFilter(['present'])
      const cloned = filter.clone()
      expect(cloned.has('absent')).toBe(false)
    })

    it('should handle cloning an empty filter', () => {
      const filter = new XorFilter([])
      const cloned = filter.clone()
      expect(cloned.getSize()).toBe(0)
      expect(cloned.has('anything')).toBe(false)
    })

    it('should handle cloning a single-key filter', () => {
      const filter = new XorFilter(['only'])
      const cloned = filter.clone()
      expect(cloned.has('only')).toBe(true)
      expect(cloned.getSize()).toBe(1)
    })

    it('should not affect original when clone is garbage collected', () => {
      const filter = new XorFilter(['key'])
      filter.clone()
      expect(filter.has('key')).toBe(true)
    })

    it('should preserve hash function count', () => {
      const filter = new XorFilter(['a'])
      const cloned = filter.clone()
      expect(cloned.getHashFunctions()).toBe(filter.getHashFunctions())
    })
  })

  describe('fromArray', () => {
    it('should create a filter from an array of keys', () => {
      const filter = XorFilter.fromArray(['a', 'b', 'c'])
      expect(filter).toBeInstanceOf(XorFilter)
      expect(filter.getSize()).toBe(3)
    })

    it('should create a filter from an empty array', () => {
      const filter = XorFilter.fromArray([])
      expect(filter.getSize()).toBe(0)
    })

    it('should produce equivalent results to constructor', () => {
      const keys = ['x', 'y', 'z']
      const f1 = new XorFilter(keys)
      const f2 = XorFilter.fromArray(keys)
      for (const key of keys) {
        expect(f1.has(key)).toBe(f2.has(key))
      }
    })

    it('should handle a single key', () => {
      const filter = XorFilter.fromArray(['solo'])
      expect(filter.has('solo')).toBe(true)
      expect(filter.getSize()).toBe(1)
    })

    it('should handle duplicates', () => {
      const filter = XorFilter.fromArray(['dup', 'dup', 'dup'])
      expect(filter.getSize()).toBe(1)
      expect(filter.has('dup')).toBe(true)
    })
  })

  describe('getExpectedSize', () => {
    it('should return a positive number for positive input', () => {
      expect(XorFilter.getExpectedSize(100)).toBeGreaterThan(0)
    })

    it('should return filter size in bits', () => {
      const size = XorFilter.getExpectedSize(1000)
      expect(size % 8).toBe(0)
    })

    it('should increase with more keys', () => {
      const s1 = XorFilter.getExpectedSize(100)
      const s2 = XorFilter.getExpectedSize(1000)
      const s3 = XorFilter.getExpectedSize(10000)
      expect(s2).toBeGreaterThan(s1)
      expect(s3).toBeGreaterThan(s2)
    })

    it('should return approximately 1.23 * n + 32 bits scaled', () => {
      const n = 1000
      const expectedBytes = Math.ceil(n * 1.23) + 32
      const expectedBits = expectedBytes * 8
      expect(XorFilter.getExpectedSize(n)).toBe(expectedBits)
    })

    it('should return 256 bits for 0 keys', () => {
      expect(XorFilter.getExpectedSize(0)).toBe(32 * 8)
    })
  })

  describe('no false negatives', () => {
    it('should never return false for added keys', () => {
      const keys = ['alpha', 'beta', 'gamma', 'delta', 'epsilon']
      const filter = new XorFilter(keys)
      for (const key of keys) {
        expect(filter.has(key)).toBe(true)
      }
    })

    it('should have no false negatives for 100 keys', () => {
      const keys = Array.from({ length: 100 }, (_, i) => `key-${i}`)
      const filter = new XorFilter(keys)
      for (const key of keys) {
        expect(filter.has(key)).toBe(true)
      }
    })

    it('should have no false negatives for 1000 keys', () => {
      const keys = Array.from({ length: 1000 }, (_, i) => `key-${i}`)
      const filter = new XorFilter(keys)
      for (const key of keys) {
        expect(filter.has(key)).toBe(true)
      }
    })

    it('should have no false negatives for unicode keys', () => {
      const keys = ['日本', '中国', '한국', 'India', '🇺🇸', '🇬🇧']
      const filter = new XorFilter(keys)
      for (const key of keys) {
        expect(filter.has(key)).toBe(true)
      }
    })

    it('should have no false negatives after clone', () => {
      const keys = ['a', 'b', 'c', 'd', 'e']
      const filter = new XorFilter(keys)
      const cloned = filter.clone()
      for (const key of keys) {
        expect(cloned.has(key)).toBe(true)
      }
    })
  })

  describe('false positive rate', () => {
    it('should have a low false positive rate for moderate sets', () => {
      const keys = Array.from({ length: 1000 }, (_, i) => `key-${i}`)
      const filter = new XorFilter(keys)
      let falsePositives = 0
      const trials = 10000
      for (let i = 0; i < trials; i++) {
        if (filter.has(`not-present-${i}`)) {
          falsePositives++
        }
      }
      const rate = falsePositives / trials
      expect(rate).toBeLessThan(0.05)
    })

    it('should have a reasonable false positive rate for small sets', () => {
      const keys = Array.from({ length: 100 }, (_, i) => `key-${i}`)
      const filter = new XorFilter(keys)
      let falsePositives = 0
      const trials = 10000
      for (let i = 0; i < trials; i++) {
        if (filter.has(`missing-${i}`)) {
          falsePositives++
        }
      }
      const rate = falsePositives / trials
      expect(rate).toBeLessThan(0.05)
    })

    it('should not have excessive false positives for large sets', () => {
      const keys = Array.from({ length: 5000 }, (_, i) => `key-${i}`)
      const filter = new XorFilter(keys)
      let falsePositives = 0
      const trials = 10000
      for (let i = 0; i < trials; i++) {
        if (filter.has(`absent-${i}`)) {
          falsePositives++
        }
      }
      const rate = falsePositives / trials
      expect(rate).toBeLessThan(0.1)
    })

    it('should return mostly false for empty filter queries', () => {
      const filter = new XorFilter([])
      let positives = 0
      for (let i = 0; i < 1000; i++) {
        if (filter.has(`test-${i}`)) {
          positives++
        }
      }
      expect(positives).toBe(0)
    })

    it('should produce binary output for membership queries', () => {
      const filter = new XorFilter(['included'])
      expect(typeof filter.has('included')).toBe('boolean')
      expect(typeof filter.has('excluded')).toBe('boolean')
    })
  })

  describe('large datasets', () => {
    it('should handle 10000 keys with no false negatives', () => {
      const keys = Array.from({ length: 10000 }, (_, i) => `k-${i}`)
      const filter = new XorFilter(keys)
      for (let i = 0; i < 100; i++) {
        const idx = Math.floor(Math.random() * 10000)
        expect(filter.has(`k-${idx}`)).toBe(true)
      }
    })

    it('should handle 10000 keys and find first and last', () => {
      const keys = Array.from({ length: 10000 }, (_, i) => `k-${i}`)
      const filter = new XorFilter(keys)
      expect(filter.has('k-0')).toBe(true)
      expect(filter.has('k-9999')).toBe(true)
    })

    it('should handle construction of large unique key set', () => {
      const keys = Array.from({ length: 5000 }, (_, i) => `unique-${i}`)
      const start = performance.now()
      const filter = new XorFilter(keys)
      const elapsed = performance.now() - start
      expect(filter.getSize()).toBe(5000)
      expect(elapsed).toBeLessThan(30000)
    })

    it('should handle rapid sequential queries', () => {
      const keys = Array.from({ length: 1000 }, (_, i) => `q-${i}`)
      const filter = new XorFilter(keys)
      for (let i = 0; i < 1000; i++) {
        expect(filter.has(`q-${i}`)).toBe(true)
      }
    })

    it('should handle keys with common prefixes', () => {
      const keys = Array.from({ length: 1000 }, (_, i) => `/api/v1/resource/${i}`)
      const filter = new XorFilter(keys)
      expect(filter.has('/api/v1/resource/0')).toBe(true)
      expect(filter.has('/api/v1/resource/999')).toBe(true)
      expect(filter.has('/api/v1/resource/1000')).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle numeric string keys', () => {
      const filter = new XorFilter(['0', '1', '2', '3', '4'])
      expect(filter.has('0')).toBe(true)
      expect(filter.has('4')).toBe(true)
      expect(filter.has('5')).toBe(false)
    })

    it('should handle keys that differ by one character', () => {
      const filter = new XorFilter(['abc', 'abd', 'abe'])
      expect(filter.has('abc')).toBe(true)
      expect(filter.has('abd')).toBe(true)
      expect(filter.has('abe')).toBe(true)
      expect(filter.has('abf')).toBe(false)
    })

    it('should handle keys that are substrings of each other', () => {
      const filter = new XorFilter(['a', 'ab', 'abc', 'abcd'])
      expect(filter.has('a')).toBe(true)
      expect(filter.has('ab')).toBe(true)
      expect(filter.has('abc')).toBe(true)
      expect(filter.has('abcd')).toBe(true)
      expect(filter.has('abcde')).toBe(false)
    })

    it('should handle single character keys', () => {
      const filter = new XorFilter(['a', 'b', 'c', 'd', 'e'])
      for (const ch of ['a', 'b', 'c', 'd', 'e']) {
        expect(filter.has(ch)).toBe(true)
      }
      expect(filter.has('f')).toBe(false)
    })

    it('should handle keys with only whitespace differences', () => {
      const filter = new XorFilter([' ', '  ', '   '])
      expect(filter.has(' ')).toBe(true)
      expect(filter.has('  ')).toBe(true)
      expect(filter.has('   ')).toBe(true)
    })

    it('should handle keys with backslashes', () => {
      const filter = new XorFilter(['path\\to\\file', 'C:\\Users'])
      expect(filter.has('path\\to\\file')).toBe(true)
      expect(filter.has('C:\\Users')).toBe(true)
    })

    it('should handle very short and very long keys together', () => {
      const longKey = 'x'.repeat(10000)
      const filter = new XorFilter(['a', longKey])
      expect(filter.has('a')).toBe(true)
      expect(filter.has(longKey)).toBe(true)
    })

    it('should handle keys with newlines and tabs', () => {
      const filter = new XorFilter(['line1\nline2', 'col1\tcol2'])
      expect(filter.has('line1\nline2')).toBe(true)
      expect(filter.has('col1\tcol2')).toBe(true)
    })

    it('should handle emoji keys', () => {
      const filter = new XorFilter(['😀', '🎉', '🚀', '❤️'])
      expect(filter.has('😀')).toBe(true)
      expect(filter.has('🎉')).toBe(true)
      expect(filter.has('👍')).toBe(false)
    })

    it('should handle keys that look like JSON', () => {
      const filter = new XorFilter(['{"key":"value"}', '[1,2,3]'])
      expect(filter.has('{"key":"value"}')).toBe(true)
      expect(filter.has('[1,2,3]')).toBe(true)
    })

    it('should handle URL keys', () => {
      const filter = new XorFilter(['https://example.com', 'http://test.org/path?q=1'])
      expect(filter.has('https://example.com')).toBe(true)
      expect(filter.has('http://test.org/path?q=1')).toBe(true)
    })

    it('should handle file path keys', () => {
      const filter = new XorFilter(['/usr/bin/node', '/home/user/file.txt'])
      expect(filter.has('/usr/bin/node')).toBe(true)
      expect(filter.has('/home/user/file.txt')).toBe(true)
    })

    it('should handle keys with repeated patterns', () => {
      const filter = new XorFilter(['abcabc', 'abcabcabc', 'xyzxyz'])
      expect(filter.has('abcabc')).toBe(true)
      expect(filter.has('abcabcabc')).toBe(true)
      expect(filter.has('xyzxyz')).toBe(true)
    })

    it('should handle keys that are hash-like strings', () => {
      const filter = new XorFilter(['a1b2c3d4e5f6', 'sha256:abcdef123456'])
      expect(filter.has('a1b2c3d4e5f6')).toBe(true)
      expect(filter.has('sha256:abcdef123456')).toBe(true)
    })

    it('should handle keys with null bytes', () => {
      const filter = new XorFilter(['a\0b', '\0start', 'end\0'])
      expect(filter.has('a\0b')).toBe(true)
      expect(filter.has('\0start')).toBe(true)
      expect(filter.has('end\0')).toBe(true)
    })
  })

  describe('immutability', () => {
    it('should not allow modification via getFingerprints return value', () => {
      const filter = new XorFilter(['test'])
      const fp = filter.getFingerprints()
      const original = new Uint8Array(fp)
      fp[0] = 255
      fp[1] = 255
      const fpAfter = filter.getFingerprints()
      expect(fpAfter[0]).toBe(original[0])
      expect(fpAfter[1]).toBe(original[1])
    })

    it('should produce independent results after fingerprint modification attempt', () => {
      const filter = new XorFilter(['key1', 'key2'])
      const result1 = filter.has('key1')
      const fp = filter.getFingerprints()
      fp.fill(0)
      const result2 = filter.has('key1')
      expect(result1).toBe(result2)
    })

    it('should keep clone independent from original', () => {
      const filter = new XorFilter(['shared'])
      const cloned = filter.clone()
      const originalFp = filter.getFingerprints()
      const clonedFp = cloned.getFingerprints()
      clonedFp.fill(0xFF)
      const afterFp = filter.getFingerprints()
      for (let i = 0; i < originalFp.length; i++) {
        expect(afterFp[i]).toBe(originalFp[i])
      }
    })

    it('should keep original independent from clone modifications', () => {
      const filter = new XorFilter(['original'])
      const cloned = filter.clone()
      expect(cloned.has('original')).toBe(true)
      expect(filter.has('original')).toBe(true)
    })

    it('should not be affected by external Uint8Array changes', () => {
      const filter = new XorFilter(['stable'])
      const before = filter.has('stable')
      const external = filter.getFingerprints()
      external[0] = 0
      const after = filter.has('stable')
      expect(before).toBe(after)
    })
  })

  describe('hash distribution', () => {
    it('should produce different filters for different key sets', () => {
      const f1 = new XorFilter(['aaa'])
      const f2 = new XorFilter(['bbb'])
      const fp1 = f1.getFingerprints()
      const fp2 = f2.getFingerprints()
      let differ = false
      for (let i = 0; i < fp1.length; i++) {
        if (fp1[i] !== fp2[i]) {
          differ = true
          break
        }
      }
      expect(differ).toBe(true)
    })

    it('should produce consistent results for same key set', () => {
      const keys = ['alpha', 'beta', 'gamma']
      const f1 = new XorFilter(keys)
      const f2 = new XorFilter(keys)
      for (const key of keys) {
        expect(f1.has(key)).toBe(f2.has(key))
      }
    })

    it('should produce identical fingerprints for same key set', () => {
      const keys = ['x', 'y', 'z']
      const f1 = new XorFilter(keys)
      const f2 = new XorFilter(keys)
      const fp1 = f1.getFingerprints()
      const fp2 = f2.getFingerprints()
      expect(fp1.length).toBe(fp2.length)
      for (let i = 0; i < fp1.length; i++) {
        expect(fp1[i]).toBe(fp2[i])
      }
    })

    it('should distribute fingerprints across the array', () => {
      const keys = Array.from({ length: 100 }, (_, i) => `key-${i}`)
      const filter = new XorFilter(keys)
      const fp = filter.getFingerprints()
      let nonZero = 0
      for (let i = 0; i < fp.length; i++) {
        if (fp[i] !== 0) nonZero++
      }
      expect(nonZero).toBeGreaterThan(0)
    })

    it('should handle similar keys with distinct fingerprints', () => {
      const keys = ['key-001', 'key-002', 'key-003', 'key-004', 'key-005']
      const filter = new XorFilter(keys)
      for (const key of keys) {
        expect(filter.has(key)).toBe(true)
      }
    })
  })

  describe('deduplication', () => {
    it('should treat duplicate keys as a single entry', () => {
      const filter = new XorFilter(['dup', 'dup'])
      expect(filter.getSize()).toBe(1)
    })

    it('should correctly query deduplicated keys', () => {
      const filter = new XorFilter(['a', 'a', 'b', 'b', 'c'])
      expect(filter.has('a')).toBe(true)
      expect(filter.has('b')).toBe(true)
      expect(filter.has('c')).toBe(true)
    })

    it('should handle all identical keys', () => {
      const filter = new XorFilter(['same', 'same', 'same', 'same'])
      expect(filter.getSize()).toBe(1)
      expect(filter.has('same')).toBe(true)
    })

    it('should produce same result with or without duplicates', () => {
      const f1 = new XorFilter(['a', 'b', 'c'])
      const f2 = new XorFilter(['a', 'a', 'b', 'b', 'c', 'c'])
      expect(f1.has('a')).toBe(true)
      expect(f2.has('a')).toBe(true)
      expect(f1.has('d')).toBe(false)
      expect(f2.has('d')).toBe(false)
    })

    it('should handle deduplication of many keys', () => {
      const keys = Array.from({ length: 1000 }, () => 'same')
      const filter = new XorFilter(keys)
      expect(filter.getSize()).toBe(1)
    })
  })

  describe('space efficiency', () => {
    it('should use less space than a bloom filter at comparable false positive rate', () => {
      const n = 10000
      const keys = Array.from({ length: n }, (_, i) => `key-${i}`)
      const filter = new XorFilter(keys)
      const xorBitsPerKey = filter.getCapacity() / n
      const bloomBitsPerKey = Math.ceil(-((n * Math.log(0.001)) / Math.pow(Math.log(2), 2))) / n
      expect(xorBitsPerKey).toBeLessThan(bloomBitsPerKey)
    })

    it('should use approximately 1.23 * n * 8 bits per key', () => {
      const n = 1000
      const keys = Array.from({ length: n }, (_, i) => `key-${i}`)
      const filter = new XorFilter(keys)
      const bitsPerKey = filter.getCapacity() / n
      expect(bitsPerKey).toBeGreaterThan(8)
      expect(bitsPerKey).toBeLessThan(15)
    })

    it('should have constant overhead', () => {
      const f1 = new XorFilter(Array.from({ length: 100 }, (_, i) => `k-${i}`))
      const f2 = new XorFilter(Array.from({ length: 10000 }, (_, i) => `k-${i}`))
      const ratio1 = f1.getCapacity() / f1.getSize()
      const ratio2 = f2.getCapacity() / f2.getSize()
      expect(Math.abs(ratio1 - ratio2)).toBeLessThan(5)
    })

    it('should use fewer bits than storing raw keys', () => {
      const keys = Array.from({ length: 100 }, (_, i) => `key-${i}`)
      const filter = new XorFilter(keys)
      const rawBits = keys.reduce((sum, k) => sum + k.length * 8, 0)
      expect(filter.getCapacity()).toBeLessThan(rawBits)
    })

    it('should have compact fingerprint storage', () => {
      const keys = Array.from({ length: 100 }, (_, i) => `key-${i}`)
      const filter = new XorFilter(keys)
      const bytesPerKey = filter.getFingerprints().length / filter.getSize()
      expect(bytesPerKey).toBeLessThan(2)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_XOR_FILTER_CONFIG', () => {
      expect(DEFAULT_XOR_FILTER_CONFIG.hashFunctions).toBe(3)
      expect(DEFAULT_XOR_FILTER_CONFIG.blockCount).toBe(3)
      expect(DEFAULT_XOR_FILTER_CONFIG.sizeMultiplier).toBe(1.23)
    })

    it('should support XorFilterConfig interface', () => {
      const config: XorFilterConfig = {
        hashFunctions: 3,
        blockCount: 3,
        sizeMultiplier: 1.5,
      }
      expect(config.hashFunctions).toBe(3)
      expect(config.sizeMultiplier).toBe(1.5)
    })

    it('should support XorFilterConfig with default values', () => {
      const config: XorFilterConfig = { ...DEFAULT_XOR_FILTER_CONFIG }
      expect(config.hashFunctions).toBe(DEFAULT_XOR_FILTER_CONFIG.hashFunctions)
    })
  })

  describe('consistency and correctness', () => {
    it('should return same results across multiple query rounds', () => {
      const keys = ['k1', 'k2', 'k3']
      const filter = new XorFilter(keys)
      for (let round = 0; round < 5; round++) {
        for (const key of keys) {
          expect(filter.has(key)).toBe(true)
        }
      }
    })

    it('should produce stable construction for identical inputs', () => {
      const keys = ['a', 'b', 'c', 'd', 'e']
      const filters = Array.from({ length: 5 }, () => new XorFilter(keys))
      const fp0 = filters[0].getFingerprints()
      for (let f = 1; f < filters.length; f++) {
        const fp = filters[f].getFingerprints()
        for (let i = 0; i < fp0.length; i++) {
          expect(fp[i]).toBe(fp0[i])
        }
      }
    })

    it('should handle sequential numeric keys', () => {
      const keys = Array.from({ length: 500 }, (_, i) => String(i))
      const filter = new XorFilter(keys)
      for (let i = 0; i < 500; i++) {
        expect(filter.has(String(i))).toBe(true)
      }
    })

    it('should handle UUID-like keys', () => {
      const keys = [
        '550e8400-e29b-41d4-a716-446655440000',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
      ]
      const filter = new XorFilter(keys)
      for (const key of keys) {
        expect(filter.has(key)).toBe(true)
      }
      expect(filter.has('00000000-0000-0000-0000-000000000000')).toBe(false)
    })

    it('should handle email-like keys', () => {
      const keys = ['user@example.com', 'admin@test.org', 'dev@company.io']
      const filter = new XorFilter(keys)
      expect(filter.has('user@example.com')).toBe(true)
      expect(filter.has('unknown@nowhere.com')).toBe(false)
    })
  })
})
