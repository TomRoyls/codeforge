import { describe, expect, it } from 'vitest'
import { PolynomialRollingHash } from '../../src/utils/polynomial-rolling-hash.js'

describe('PolynomialRollingHash', () => {
  describe('hash', () => {
    it('hashes a string', () => {
      const h = PolynomialRollingHash.hash('hello')
      expect(h > 0n).toBe(true)
    })

    it('same string same hash', () => {
      expect(PolynomialRollingHash.hash('abc')).toBe(PolynomialRollingHash.hash('abc'))
    })

    it('different strings different hash', () => {
      expect(PolynomialRollingHash.hash('abc')).not.toBe(PolynomialRollingHash.hash('def'))
    })

    it('hashes empty string to 0', () => {
      expect(PolynomialRollingHash.hash('')).toBe(0n)
    })

    it('hashes single character', () => {
      const h = PolynomialRollingHash.hash('a')
      expect(h > 0n).toBe(true)
      expect(typeof h).toBe('bigint')
    })

    it('returns bigint', () => {
      const h = PolynomialRollingHash.hash('test')
      expect(typeof h).toBe('bigint')
    })

    it('is deterministic', () => {
      const h1 = PolynomialRollingHash.hash('deterministic')
      const h2 = PolynomialRollingHash.hash('deterministic')
      expect(h1).toBe(h2)
    })

    it('handles long strings', () => {
      const s = 'a'.repeat(10000)
      expect(PolynomialRollingHash.hash(s) > 0n).toBe(true)
    })

    it('handles special characters', () => {
      const h = PolynomialRollingHash.hash('!@#$%^&*()')
      expect(typeof h).toBe('bigint')
    })

    it('handles unicode', () => {
      const h = PolynomialRollingHash.hash('café 日本語')
      expect(typeof h).toBe('bigint')
    })

    it('order matters: abc != bca', () => {
      expect(PolynomialRollingHash.hash('abc')).not.toBe(PolynomialRollingHash.hash('bca'))
    })

    it('a differs from aa', () => {
      expect(PolynomialRollingHash.hash('a')).not.toBe(PolynomialRollingHash.hash('aa'))
    })

    it('hashes numeric string', () => {
      const h = PolynomialRollingHash.hash('12345')
      expect(h > 0n).toBe(true)
    })

    it('handles whitespace', () => {
      expect(PolynomialRollingHash.hash(' ')).not.toBe(PolynomialRollingHash.hash(''))
      expect(PolynomialRollingHash.hash('\t')).not.toBe(PolynomialRollingHash.hash(''))
    })

    it('repeated calls produce same result', () => {
      const results = Array.from({ length: 10 }, () => PolynomialRollingHash.hash('consistent'))
      expect(new Set(results).size).toBe(1)
    })
  })

  describe('hashArray', () => {
    it('hashes an array', () => {
      const h = PolynomialRollingHash.hashArray([1, 2, 3])
      expect(h > 0n).toBe(true)
    })

    it('same array same hash', () => {
      expect(PolynomialRollingHash.hashArray([1, 2, 3])).toBe(PolynomialRollingHash.hashArray([1, 2, 3]))
    })

    it('different arrays different hash', () => {
      expect(PolynomialRollingHash.hashArray([1, 2, 3])).not.toBe(PolynomialRollingHash.hashArray([3, 2, 1]))
    })

    it('empty array hash is 0', () => {
      expect(PolynomialRollingHash.hashArray([])).toBe(0n)
    })

    it('single element array', () => {
      const h = PolynomialRollingHash.hashArray([42])
      expect(h > 0n).toBe(true)
    })

    it('returns bigint', () => {
      const h = PolynomialRollingHash.hashArray([1])
      expect(typeof h).toBe('bigint')
    })

    it('order matters', () => {
      expect(PolynomialRollingHash.hashArray([1, 2])).not.toBe(PolynomialRollingHash.hashArray([2, 1]))
    })

    it('handles zero values', () => {
      const h = PolynomialRollingHash.hashArray([0, 0, 0])
      expect(typeof h).toBe('bigint')
    })

    it('handles negative values', () => {
      const h = PolynomialRollingHash.hashArray([-1, -2, -3])
      expect(typeof h).toBe('bigint')
    })

    it('handles large values', () => {
      const h = PolynomialRollingHash.hashArray([1000000, 2000000])
      expect(typeof h).toBe('bigint')
    })

    it('is deterministic', () => {
      const arr = [5, 10, 15, 20]
      const h1 = PolynomialRollingHash.hashArray(arr)
      const h2 = PolynomialRollingHash.hashArray(arr)
      expect(h1).toBe(h2)
    })
  })

  describe('areEqual', () => {
    it('returns true for same strings', () => {
      expect(PolynomialRollingHash.areEqual('test', 'test')).toBe(true)
    })

    it('returns false for different strings', () => {
      expect(PolynomialRollingHash.areEqual('abc', 'def')).toBe(false)
    })

    it('returns false for different lengths', () => {
      expect(PolynomialRollingHash.areEqual('ab', 'abc')).toBe(false)
    })

    it('returns true for empty strings', () => {
      expect(PolynomialRollingHash.areEqual('', '')).toBe(true)
    })

    it('returns false for empty vs non-empty', () => {
      expect(PolynomialRollingHash.areEqual('', 'a')).toBe(false)
    })

    it('case sensitive', () => {
      expect(PolynomialRollingHash.areEqual('ABC', 'abc')).toBe(false)
    })

    it('returns true for identical special chars', () => {
      expect(PolynomialRollingHash.areEqual('!@#', '!@#')).toBe(true)
    })

    it('returns false for single char difference', () => {
      expect(PolynomialRollingHash.areEqual('abc', 'abd')).toBe(false)
    })

    it('works with whitespace strings', () => {
      expect(PolynomialRollingHash.areEqual('  ', '  ')).toBe(true)
      expect(PolynomialRollingHash.areEqual(' ', '  ')).toBe(false)
    })
  })

  describe('hash vs hashArray consistency', () => {
    it('hash and hashArray produce bigint results', () => {
      expect(typeof PolynomialRollingHash.hash('test')).toBe('bigint')
      expect(typeof PolynomialRollingHash.hashArray([1, 2])).toBe('bigint')
    })

    it('areEqual agrees with direct hash comparison', () => {
      const s1 = 'hello'
      const s2 = 'hello'
      const s3 = 'world'
      expect(PolynomialRollingHash.areEqual(s1, s2)).toBe(
        PolynomialRollingHash.hash(s1) === PolynomialRollingHash.hash(s2),
      )
      expect(PolynomialRollingHash.areEqual(s1, s3)).toBe(
        PolynomialRollingHash.hash(s1) === PolynomialRollingHash.hash(s3),
      )
    })
  })
})
