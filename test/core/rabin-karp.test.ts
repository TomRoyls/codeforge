import { describe, it, expect } from 'vitest'
import { RabinKarp } from '../../src/core/rabin-karp/rabin-karp.js'
import { DEFAULT_RABIN_KARP_OPTIONS } from '../../src/core/rabin-karp/types.js'
import type { RabinKarpOptions } from '../../src/core/rabin-karp/types.js'

describe('RabinKarp', () => {
  describe('constructor', () => {
    it('should create instance with a pattern', () => {
      const rk = new RabinKarp('abc')
      expect(rk.getPattern()).toBe('abc')
    })

    it('should create instance with empty pattern', () => {
      const rk = new RabinKarp('')
      expect(rk.getPattern()).toBe('')
    })

    it('should create instance with single character pattern', () => {
      const rk = new RabinKarp('a')
      expect(rk.getPattern()).toBe('a')
    })

    it('should create instance with custom base', () => {
      const rk = new RabinKarp('abc', 128)
      expect(rk.getPattern()).toBe('abc')
    })

    it('should create instance with custom modulus', () => {
      const rk = new RabinKarp('abc', 256, 1009)
      expect(rk.getPattern()).toBe('abc')
    })

    it('should create instance with custom base and modulus', () => {
      const rk = new RabinKarp('test', 31, 997)
      expect(rk.getPattern()).toBe('test')
    })

    it('should use default base when not specified', () => {
      expect(DEFAULT_RABIN_KARP_OPTIONS.base).toBe(256)
    })

    it('should use default modulus when not specified', () => {
      expect(DEFAULT_RABIN_KARP_OPTIONS.modulus).toBe(101)
    })

    it('should create instance with long pattern', () => {
      const pattern = 'abcdefghij'
      const rk = new RabinKarp(pattern)
      expect(rk.getPattern()).toBe(pattern)
    })
  })

  describe('getHash', () => {
    it('should return a number for the pattern hash', () => {
      const rk = new RabinKarp('abc')
      expect(typeof rk.getHash()).toBe('number')
    })

    it('should return 0 for empty pattern', () => {
      const rk = new RabinKarp('')
      expect(rk.getHash()).toBe(0)
    })

    it('should return consistent hash for same pattern', () => {
      const rk1 = new RabinKarp('test')
      const rk2 = new RabinKarp('test')
      expect(rk1.getHash()).toBe(rk2.getHash())
    })

    it('should return different hashes for different patterns', () => {
      const rk1 = new RabinKarp('abc')
      const rk2 = new RabinKarp('xyz')
      expect(rk1.getHash()).not.toBe(rk2.getHash())
    })

    it('should return hash within modulus range', () => {
      const rk = new RabinKarp('hello')
      expect(rk.getHash()).toBeGreaterThanOrEqual(0)
      expect(rk.getHash()).toBeLessThan(101)
    })

    it('should compute hash correctly for single character', () => {
      const rk = new RabinKarp('a')
      expect(rk.getHash()).toBe(97 % 101)
    })

    it('should compute hash correctly with custom modulus', () => {
      const rk = new RabinKarp('a', 256, 1009)
      expect(rk.getHash()).toBe(97 % 1009)
    })
  })

  describe('search', () => {
    it('should find pattern at the beginning', () => {
      const rk = new RabinKarp('abc')
      expect(rk.search('abcdef')).toBe(0)
    })

    it('should find pattern in the middle', () => {
      const rk = new RabinKarp('cde')
      expect(rk.search('abcdef')).toBe(2)
    })

    it('should find pattern at the end', () => {
      const rk = new RabinKarp('def')
      expect(rk.search('abcdef')).toBe(3)
    })

    it('should return -1 when pattern not found', () => {
      const rk = new RabinKarp('xyz')
      expect(rk.search('abcdef')).toBe(-1)
    })

    it('should find single character pattern', () => {
      const rk = new RabinKarp('c')
      expect(rk.search('abcdef')).toBe(2)
    })

    it('should find pattern that equals the text', () => {
      const rk = new RabinKarp('abc')
      expect(rk.search('abc')).toBe(0)
    })

    it('should return -1 when text is shorter than pattern', () => {
      const rk = new RabinKarp('abcdef')
      expect(rk.search('abc')).toBe(-1)
    })

    it('should return 0 when pattern is empty', () => {
      const rk = new RabinKarp('')
      expect(rk.search('abc')).toBe(0)
    })

    it('should return -1 when text is empty and pattern is not', () => {
      const rk = new RabinKarp('abc')
      expect(rk.search('')).toBe(-1)
    })

    it('should return 0 when both text and pattern are empty', () => {
      const rk = new RabinKarp('')
      expect(rk.search('')).toBe(0)
    })

    it('should find repeated pattern at first occurrence', () => {
      const rk = new RabinKarp('abc')
      expect(rk.search('abcabc')).toBe(0)
    })

    it('should handle pattern with repeated characters', () => {
      const rk = new RabinKarp('aaa')
      expect(rk.search('baaab')).toBe(1)
    })

    it('should find pattern in text with all same characters', () => {
      const rk = new RabinKarp('aa')
      expect(rk.search('aaaa')).toBe(0)
    })

    it('should handle unicode characters', () => {
      const rk = new RabinKarp('世界')
      expect(rk.search('你好世界')).toBe(2)
    })

    it('should handle emoji patterns', () => {
      const rk = new RabinKarp('🎯')
      expect(rk.search('🎯🎯🎯')).toBe(0)
    })

    it('should return -1 for pattern longer than text', () => {
      const rk = new RabinKarp('abcdefg')
      expect(rk.search('abc')).toBe(-1)
    })

    it('should handle single char text and single char pattern', () => {
      const rk = new RabinKarp('a')
      expect(rk.search('a')).toBe(0)
      expect(rk.search('b')).toBe(-1)
    })

    it('should find overlapping potential match correctly', () => {
      const rk = new RabinKarp('aba')
      expect(rk.search('ababa')).toBe(0)
    })

    it('should handle case sensitivity (case sensitive by default)', () => {
      const rk = new RabinKarp('Hello')
      expect(rk.search('hello')).toBe(-1)
      expect(rk.search('Hello')).toBe(0)
    })

    it('should find pattern after mismatched characters', () => {
      const rk = new RabinKarp('test')
      expect(rk.search('tsttsttest')).toBe(6)
    })

    it('should handle digits in pattern', () => {
      const rk = new RabinKarp('123')
      expect(rk.search('abc123def')).toBe(3)
    })

    it('should find pattern with special characters', () => {
      const rk = new RabinKarp('[abc]')
      expect(rk.search('x[abc]y')).toBe(1)
    })

    it('should handle whitespace patterns', () => {
      const rk = new RabinKarp(' ')
      expect(rk.search('hello world')).toBe(5)
    })

    it('should handle tab characters', () => {
      const rk = new RabinKarp('\t')
      expect(rk.search('hello\tworld')).toBe(5)
    })

    it('should handle newline characters', () => {
      const rk = new RabinKarp('\n')
      expect(rk.search('hello\nworld')).toBe(5)
    })
  })

  describe('searchAll', () => {
    it('should find all occurrences', () => {
      const rk = new RabinKarp('ab')
      expect(rk.searchAll('ababab')).toEqual([0, 2, 4])
    })

    it('should return empty array when no matches', () => {
      const rk = new RabinKarp('xyz')
      expect(rk.searchAll('abcdef')).toEqual([])
    })

    it('should return single match', () => {
      const rk = new RabinKarp('abc')
      expect(rk.searchAll('xabcx')).toEqual([1])
    })

    it('should return all positions for single character pattern', () => {
      const rk = new RabinKarp('a')
      expect(rk.searchAll('abacaba')).toEqual([0, 2, 4, 6])
    })

    it('should handle empty pattern by returning all positions', () => {
      const rk = new RabinKarp('')
      expect(rk.searchAll('abc')).toEqual([0, 1, 2, 3])
    })

    it('should return empty array for empty text with non-empty pattern', () => {
      const rk = new RabinKarp('abc')
      expect(rk.searchAll('')).toEqual([])
    })

    it('should return all indices for empty pattern and empty text', () => {
      const rk = new RabinKarp('')
      expect(rk.searchAll('')).toEqual([0])
    })

    it('should find overlapping occurrences', () => {
      const rk = new RabinKarp('aaa')
      expect(rk.searchAll('aaaaaa')).toEqual([0, 1, 2, 3])
    })

    it('should handle pattern equal to text', () => {
      const rk = new RabinKarp('abc')
      expect(rk.searchAll('abc')).toEqual([0])
    })

    it('should find occurrences at beginning and end', () => {
      const rk = new RabinKarp('abc')
      expect(rk.searchAll('abcxxxabc')).toEqual([0, 6])
    })

    it('should return empty array when text shorter than pattern', () => {
      const rk = new RabinKarp('abcdef')
      expect(rk.searchAll('abc')).toEqual([])
    })

    it('should handle repeated full matches', () => {
      const rk = new RabinKarp('abc')
      expect(rk.searchAll('abcabcabc')).toEqual([0, 3, 6])
    })

    it('should work with unicode characters', () => {
      const rk = new RabinKarp('世')
      expect(rk.searchAll('世界世界')).toEqual([0, 2])
    })
  })

  describe('count', () => {
    it('should count zero occurrences', () => {
      const rk = new RabinKarp('xyz')
      expect(rk.count('abcdef')).toBe(0)
    })

    it('should count single occurrence', () => {
      const rk = new RabinKarp('abc')
      expect(rk.count('xabcx')).toBe(1)
    })

    it('should count multiple occurrences', () => {
      const rk = new RabinKarp('ab')
      expect(rk.count('ababab')).toBe(3)
    })

    it('should count occurrences in text equal to pattern', () => {
      const rk = new RabinKarp('abc')
      expect(rk.count('abc')).toBe(1)
    })

    it('should return 0 for empty text', () => {
      const rk = new RabinKarp('abc')
      expect(rk.count('')).toBe(0)
    })

    it('should count with empty pattern', () => {
      const rk = new RabinKarp('')
      expect(rk.count('abc')).toBe(4)
    })

    it('should count with empty pattern and empty text', () => {
      const rk = new RabinKarp('')
      expect(rk.count('')).toBe(1)
    })

    it('should count overlapping occurrences', () => {
      const rk = new RabinKarp('aa')
      expect(rk.count('aaaa')).toBe(3)
    })
  })

  describe('contains', () => {
    it('should return true when pattern is found', () => {
      const rk = new RabinKarp('abc')
      expect(rk.contains('xabcx')).toBe(true)
    })

    it('should return false when pattern is not found', () => {
      const rk = new RabinKarp('xyz')
      expect(rk.contains('abcdef')).toBe(false)
    })

    it('should return true for empty pattern', () => {
      const rk = new RabinKarp('')
      expect(rk.contains('anything')).toBe(true)
    })

    it('should return false for empty text with non-empty pattern', () => {
      const rk = new RabinKarp('abc')
      expect(rk.contains('')).toBe(false)
    })

    it('should return true for empty pattern and empty text', () => {
      const rk = new RabinKarp('')
      expect(rk.contains('')).toBe(true)
    })

    it('should return true when pattern is at the beginning', () => {
      const rk = new RabinKarp('abc')
      expect(rk.contains('abcdef')).toBe(true)
    })

    it('should return true when pattern is at the end', () => {
      const rk = new RabinKarp('def')
      expect(rk.contains('abcdef')).toBe(true)
    })
  })

  describe('getPattern', () => {
    it('should return the pattern', () => {
      const rk = new RabinKarp('test')
      expect(rk.getPattern()).toBe('test')
    })

    it('should return empty string for empty pattern', () => {
      const rk = new RabinKarp('')
      expect(rk.getPattern()).toBe('')
    })

    it('should return pattern with special characters', () => {
      const rk = new RabinKarp('a*b+c?d')
      expect(rk.getPattern()).toBe('a*b+c?d')
    })
  })

  describe('setPattern', () => {
    it('should update the pattern', () => {
      const rk = new RabinKarp('abc')
      rk.setPattern('xyz')
      expect(rk.getPattern()).toBe('xyz')
    })

    it('should search with the new pattern', () => {
      const rk = new RabinKarp('abc')
      rk.setPattern('def')
      expect(rk.search('abcdef')).toBe(3)
    })

    it('should no longer find old pattern after update', () => {
      const rk = new RabinKarp('abc')
      rk.setPattern('xyz')
      expect(rk.search('abcdef')).toBe(-1)
    })

    it('should handle setting to empty pattern', () => {
      const rk = new RabinKarp('abc')
      rk.setPattern('')
      expect(rk.search('anything')).toBe(0)
    })

    it('should handle setting pattern multiple times', () => {
      const rk = new RabinKarp('a')
      rk.setPattern('b')
      rk.setPattern('c')
      expect(rk.getPattern()).toBe('c')
      expect(rk.search('abc')).toBe(2)
    })

    it('should update hash when pattern changes', () => {
      const rk = new RabinKarp('abc')
      const hash1 = rk.getHash()
      rk.setPattern('xyz')
      const hash2 = rk.getHash()
      expect(hash1).not.toBe(hash2)
    })

    it('should find correctly after pattern change', () => {
      const rk = new RabinKarp('a')
      expect(rk.search('abc')).toBe(0)
      rk.setPattern('b')
      expect(rk.search('abc')).toBe(1)
      rk.setPattern('c')
      expect(rk.search('abc')).toBe(2)
    })

    it('should count correctly after pattern change', () => {
      const rk = new RabinKarp('a')
      expect(rk.count('aaa')).toBe(3)
      rk.setPattern('aa')
      expect(rk.count('aaa')).toBe(2)
    })
  })

  describe('static search', () => {
    it('should find pattern in text', () => {
      expect(RabinKarp.search('hello world', 'world')).toBe(6)
    })

    it('should return -1 when not found', () => {
      expect(RabinKarp.search('hello', 'world')).toBe(-1)
    })

    it('should find at beginning', () => {
      expect(RabinKarp.search('abcdef', 'abc')).toBe(0)
    })

    it('should find at end', () => {
      expect(RabinKarp.search('abcdef', 'def')).toBe(3)
    })

    it('should handle empty pattern', () => {
      expect(RabinKarp.search('abc', '')).toBe(0)
    })

    it('should handle empty text', () => {
      expect(RabinKarp.search('', 'abc')).toBe(-1)
    })

    it('should handle empty text and empty pattern', () => {
      expect(RabinKarp.search('', '')).toBe(0)
    })
  })

  describe('static searchAll', () => {
    it('should find all occurrences', () => {
      expect(RabinKarp.searchAll('ababab', 'ab')).toEqual([0, 2, 4])
    })

    it('should return empty array when not found', () => {
      expect(RabinKarp.searchAll('abcdef', 'xyz')).toEqual([])
    })

    it('should return single match', () => {
      expect(RabinKarp.searchAll('abcdef', 'cde')).toEqual([2])
    })

    it('should handle empty pattern', () => {
      expect(RabinKarp.searchAll('abc', '')).toEqual([0, 1, 2, 3])
    })

    it('should handle empty text and empty pattern', () => {
      expect(RabinKarp.searchAll('', '')).toEqual([0])
    })

    it('should find overlapping occurrences', () => {
      expect(RabinKarp.searchAll('aaaa', 'aa')).toEqual([0, 1, 2])
    })
  })

  describe('static count', () => {
    it('should count occurrences', () => {
      expect(RabinKarp.count('abcabc', 'abc')).toBe(2)
    })

    it('should return 0 when not found', () => {
      expect(RabinKarp.count('abcdef', 'xyz')).toBe(0)
    })

    it('should count single occurrence', () => {
      expect(RabinKarp.count('hello world', 'world')).toBe(1)
    })

    it('should handle empty pattern', () => {
      expect(RabinKarp.count('abc', '')).toBe(4)
    })

    it('should handle empty text and empty pattern', () => {
      expect(RabinKarp.count('', '')).toBe(1)
    })

    it('should count overlapping occurrences', () => {
      expect(RabinKarp.count('aaaa', 'aa')).toBe(3)
    })
  })

  describe('static contains', () => {
    it('should return true when found', () => {
      expect(RabinKarp.contains('hello world', 'world')).toBe(true)
    })

    it('should return false when not found', () => {
      expect(RabinKarp.contains('hello', 'world')).toBe(false)
    })

    it('should return true for empty pattern', () => {
      expect(RabinKarp.contains('anything', '')).toBe(true)
    })

    it('should return false for empty text with non-empty pattern', () => {
      expect(RabinKarp.contains('', 'abc')).toBe(false)
    })

    it('should return true for empty text and empty pattern', () => {
      expect(RabinKarp.contains('', '')).toBe(true)
    })
  })

  describe('static multiSearch', () => {
    it('should find multiple patterns', () => {
      const result = RabinKarp.multiSearch('abcabc', ['ab', 'bc'])
      expect(result.get('ab')).toEqual([0, 3])
      expect(result.get('bc')).toEqual([1, 4])
    })

    it('should return empty arrays for non-matching patterns', () => {
      const result = RabinKarp.multiSearch('abcdef', ['xy', 'zz'])
      expect(result.get('xy')).toEqual([])
      expect(result.get('zz')).toEqual([])
    })

    it('should handle single pattern', () => {
      const result = RabinKarp.multiSearch('abcabc', ['abc'])
      expect(result.get('abc')).toEqual([0, 3])
    })

    it('should handle empty patterns array', () => {
      const result = RabinKarp.multiSearch('abc', [])
      expect(result.size).toBe(0)
    })

    it('should handle empty text', () => {
      const result = RabinKarp.multiSearch('', ['abc'])
      expect(result.get('abc')).toEqual([])
    })

    it('should handle empty pattern in multi-search', () => {
      const result = RabinKarp.multiSearch('abc', [''])
      expect(result.get('')).toEqual([0, 1, 2, 3])
    })

    it('should handle patterns of different lengths', () => {
      const result = RabinKarp.multiSearch('abcdef', ['abc', 'ef', 'd'])
      expect(result.get('abc')).toEqual([0])
      expect(result.get('ef')).toEqual([4])
      expect(result.get('d')).toEqual([3])
    })

    it('should handle duplicate patterns', () => {
      const result = RabinKarp.multiSearch('abc', ['a', 'a'])
      expect(result.get('a')!.length).toBeGreaterThanOrEqual(1)
      expect(result.get('a')).toContain(0)
    })

    it('should find overlapping occurrences in multi-search', () => {
      const result = RabinKarp.multiSearch('aaaa', ['aa'])
      expect(result.get('aa')).toEqual([0, 1, 2])
    })

    it('should handle multiple patterns with same length', () => {
      const result = RabinKarp.multiSearch('abcdef', ['abc', 'def', 'ghi'])
      expect(result.get('abc')).toEqual([0])
      expect(result.get('def')).toEqual([3])
      expect(result.get('ghi')).toEqual([])
    })

    it('should accept custom base and modulus', () => {
      const result = RabinKarp.multiSearch('abcabc', ['ab', 'bc'], 31, 997)
      expect(result.get('ab')).toEqual([0, 3])
      expect(result.get('bc')).toEqual([1, 4])
    })

    it('should handle unicode in multi-search', () => {
      const result = RabinKarp.multiSearch('你好世界你好', ['你好', '世界'])
      expect(result.get('你好')).toEqual([0, 4])
      expect(result.get('世界')).toEqual([2])
    })

    it('should handle pattern not found in text', () => {
      const result = RabinKarp.multiSearch('abc', ['xyz'])
      expect(result.get('xyz')).toEqual([])
    })
  })

  describe('static rollingHash', () => {
    it('should return a number', () => {
      expect(typeof RabinKarp.rollingHash('abc')).toBe('number')
    })

    it('should return 0 for empty string', () => {
      expect(RabinKarp.rollingHash('')).toBe(0)
    })

    it('should return consistent hash for same string', () => {
      const hash1 = RabinKarp.rollingHash('test')
      const hash2 = RabinKarp.rollingHash('test')
      expect(hash1).toBe(hash2)
    })

    it('should return different hashes for different strings', () => {
      const hash1 = RabinKarp.rollingHash('abc')
      const hash2 = RabinKarp.rollingHash('xyz')
      expect(hash1).not.toBe(hash2)
    })

    it('should return hash within modulus range', () => {
      const hash = RabinKarp.rollingHash('hello world')
      expect(hash).toBeGreaterThanOrEqual(0)
      expect(hash).toBeLessThan(101)
    })

    it('should accept custom base', () => {
      const hash = RabinKarp.rollingHash('abc', 31)
      expect(typeof hash).toBe('number')
    })

    it('should accept custom modulus', () => {
      const hash = RabinKarp.rollingHash('abc', 256, 1009)
      expect(hash).toBeGreaterThanOrEqual(0)
      expect(hash).toBeLessThan(1009)
    })

    it('should match instance getHash for same params', () => {
      const rk = new RabinKarp('test')
      const staticHash = RabinKarp.rollingHash('test')
      expect(rk.getHash()).toBe(staticHash)
    })

    it('should compute hash for single character', () => {
      expect(RabinKarp.rollingHash('a')).toBe(97 % 101)
    })

    it('should compute hash with custom base and modulus', () => {
      const expected = ((0 * 31 + 97) % 997)
      expect(RabinKarp.rollingHash('a', 31, 997)).toBe(expected)
    })
  })

  describe('algorithm correctness', () => {
    it('should correctly find pattern using rolling hash', () => {
      const rk = new RabinKarp('needle')
      expect(rk.search('findinganeedle')).toBe(8)
    })

    it('should handle pattern with no repeating characters', () => {
      const rk = new RabinKarp('abcdef')
      expect(rk.search('xyzabcdefxyz')).toBe(3)
    })

    it('should handle pattern with all same characters', () => {
      const rk = new RabinKarp('aaaa')
      expect(rk.search('baaaab')).toBe(1)
    })

    it('should handle text with all same characters except pattern', () => {
      const rk = new RabinKarp('ab')
      expect(rk.search('aaaaabaaaa')).toBe(4)
    })

    it('should handle worst case scenario with repeated chars', () => {
      const rk = new RabinKarp('aaaab')
      expect(rk.search('aaaaaaaaaaaaaab')).toBe(10)
    })

    it('should handle large jump from mismatched characters', () => {
      const rk = new RabinKarp('abc')
      expect(rk.search('zzzzzzzzabc')).toBe(8)
    })

    it('should find pattern after multiple mismatches', () => {
      const rk = new RabinKarp('test')
      expect(rk.search('tsttsttest')).toBe(6)
    })

    it('should correctly use custom base and modulus', () => {
      const rk = new RabinKarp('world', 31, 997)
      expect(rk.search('hello world')).toBe(6)
    })

    it('should work with base 2', () => {
      const rk = new RabinKarp('abc', 2, 101)
      expect(rk.search('xabcx')).toBe(1)
    })

    it('should work with large modulus', () => {
      const rk = new RabinKarp('abc', 256, 1000000007)
      expect(rk.search('abcdef')).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('should handle pattern with dots', () => {
      const rk = new RabinKarp('a.b')
      expect(rk.search('xa.by')).toBe(1)
    })

    it('should handle pattern with asterisks', () => {
      const rk = new RabinKarp('a*b')
      expect(rk.search('xa*by')).toBe(1)
    })

    it('should handle pattern with parentheses', () => {
      const rk = new RabinKarp('(test)')
      expect(rk.search('a(test)b')).toBe(1)
    })

    it('should handle pattern with braces', () => {
      const rk = new RabinKarp('{key}')
      expect(rk.search('x{key}y')).toBe(1)
    })

    it('should handle pattern with backslash', () => {
      const rk = new RabinKarp('\\n')
      expect(rk.search('a\\nb')).toBe(1)
    })

    it('should handle pattern with plus sign', () => {
      const rk = new RabinKarp('a+b')
      expect(rk.search('xa+by')).toBe(1)
    })

    it('should handle pattern with question mark', () => {
      const rk = new RabinKarp('a?b')
      expect(rk.search('xa?by')).toBe(1)
    })

    it('should handle pattern with dollar sign', () => {
      const rk = new RabinKarp('$100')
      expect(rk.search('price$100')).toBe(5)
    })

    it('should handle pattern with caret', () => {
      const rk = new RabinKarp('^start')
      expect(rk.search('a^startb')).toBe(1)
    })

    it('should handle pattern with pipe', () => {
      const rk = new RabinKarp('a|b')
      expect(rk.search('xa|by')).toBe(1)
    })

    it('should handle mixed whitespace', () => {
      const rk = new RabinKarp(' \t\n')
      expect(rk.search('a \t\nb')).toBe(1)
    })

    it('should handle very long text', () => {
      const text = 'a'.repeat(1000) + 'b'
      const rk = new RabinKarp('b')
      expect(rk.search(text)).toBe(1000)
    })

    it('should handle very long pattern', () => {
      const pattern = 'a'.repeat(100) + 'b'
      const text = 'x'.repeat(50) + pattern + 'x'.repeat(50)
      const rk = new RabinKarp(pattern)
      expect(rk.search(text)).toBe(50)
    })

    it('should handle text consisting of pattern repeated', () => {
      const rk = new RabinKarp('abc')
      expect(rk.searchAll('abcabcabcabc')).toEqual([0, 3, 6, 9])
    })

    it('should handle pattern with only one unique character', () => {
      const rk = new RabinKarp('aaa')
      expect(rk.searchAll('aaaaa')).toEqual([0, 1, 2])
    })

    it('should handle two-character pattern efficiently', () => {
      const rk = new RabinKarp('ab')
      expect(rk.searchAll('abababab')).toEqual([0, 2, 4, 6])
    })

    it('should handle mixed emoji', () => {
      const rk = new RabinKarp('🎉🎊')
      expect(rk.search('hi🎉🎊bye')).toBe(2)
    })

    it('should handle japanese characters', () => {
      const rk = new RabinKarp('にち')
      expect(rk.search('こんにちはちは')).toBe(2)
    })

    it('should handle pattern with last char unique', () => {
      const rk = new RabinKarp('abcz')
      expect(rk.search('abcabcz')).toBe(3)
    })

    it('should handle pattern with first char unique', () => {
      const rk = new RabinKarp('zabc')
      expect(rk.search('abzabc')).toBe(2)
    })
  })

  describe('pattern update scenarios', () => {
    it('should work correctly after multiple pattern changes', () => {
      const rk = new RabinKarp('a')
      expect(rk.search('abc')).toBe(0)
      rk.setPattern('b')
      expect(rk.search('abc')).toBe(1)
      rk.setPattern('c')
      expect(rk.search('abc')).toBe(2)
    })

    it('should searchAll correctly after pattern change', () => {
      const rk = new RabinKarp('x')
      rk.setPattern('ab')
      expect(rk.searchAll('ababab')).toEqual([0, 2, 4])
    })

    it('should contains correctly after pattern change', () => {
      const rk = new RabinKarp('xyz')
      rk.setPattern('abc')
      expect(rk.contains('xabcx')).toBe(true)
    })

    it('should handle setting pattern to longer string', () => {
      const rk = new RabinKarp('a')
      rk.setPattern('abcdefgh')
      expect(rk.search('xyzabcdefgh')).toBe(3)
    })

    it('should handle setting pattern to shorter string', () => {
      const rk = new RabinKarp('abcdefgh')
      rk.setPattern('a')
      expect(rk.search('xyzabc')).toBe(3)
    })
  })

  describe('hash collision handling', () => {
    it('should verify matches to avoid false positives', () => {
      const rk = new RabinKarp('abc', 2, 3)
      expect(rk.search('abcdef')).toBe(0)
    })

    it('should correctly reject hash collision false matches', () => {
      const rk = new RabinKarp('ab', 2, 3)
      expect(rk.search('cd')).toBe(-1)
    })

    it('should still find real matches even with small modulus', () => {
      const rk = new RabinKarp('hello', 256, 7)
      expect(rk.search('say hello world')).toBe(4)
    })

    it('should work correctly with modulus 1', () => {
      const rk = new RabinKarp('abc', 256, 1)
      expect(rk.search('abcdef')).toBe(0)
    })

    it('should handle overlapping false positives', () => {
      const rk = new RabinKarp('ab', 2, 3)
      expect(rk.searchAll('abab')).toEqual([0, 2])
    })
  })

  describe('RabinKarpOptions type', () => {
    it('should accept full options object', () => {
      const opts: RabinKarpOptions = { base: 256, modulus: 101 }
      expect(opts.base).toBe(256)
      expect(opts.modulus).toBe(101)
    })
  })

  describe('re-exported types', () => {
    it('should export DEFAULT_RABIN_KARP_OPTIONS from module', () => {
      expect(DEFAULT_RABIN_KARP_OPTIONS).toBeDefined()
      expect(DEFAULT_RABIN_KARP_OPTIONS.base).toBe(256)
      expect(DEFAULT_RABIN_KARP_OPTIONS.modulus).toBe(101)
    })
  })

  describe('static method edge cases', () => {
    it('static searchAll with no matches', () => {
      expect(RabinKarp.searchAll('abcdef', 'zzz')).toEqual([])
    })

    it('static count with multiple matches', () => {
      expect(RabinKarp.count('abababab', 'ab')).toBe(4)
    })

    it('static contains with match at end', () => {
      expect(RabinKarp.contains('hello world', 'world')).toBe(true)
    })

    it('static contains without match', () => {
      expect(RabinKarp.contains('hello', 'world')).toBe(false)
    })

    it('static searchAll with single char pattern', () => {
      expect(RabinKarp.searchAll('aaa', 'a')).toEqual([0, 1, 2])
    })

    it('static count with empty pattern', () => {
      expect(RabinKarp.count('abc', '')).toBe(4)
    })

    it('static search with longer pattern than text', () => {
      expect(RabinKarp.search('ab', 'abcdef')).toBe(-1)
    })
  })

  describe('additional algorithm tests', () => {
    it('should handle large text with many occurrences', () => {
      const text = 'ab'.repeat(500) + 'xyz'
      const rk = new RabinKarp('xyz')
      expect(rk.search(text)).toBe(1000)
    })

    it('should handle pattern at position 0 with no prior chars', () => {
      const rk = new RabinKarp('start')
      expect(rk.search('start of something')).toBe(0)
    })

    it('should find pattern when text is exactly the pattern', () => {
      const rk = new RabinKarp('exact')
      expect(rk.search('exact')).toBe(0)
      expect(rk.count('exact')).toBe(1)
    })

    it('should handle two-character patterns', () => {
      const rk = new RabinKarp('xy')
      expect(rk.searchAll('xyxyxy')).toEqual([0, 2, 4])
    })

    it('should handle three-character patterns', () => {
      const rk = new RabinKarp('abc')
      expect(rk.searchAll('abcabc')).toEqual([0, 3])
    })

    it('should handle single-character searchAll', () => {
      const rk = new RabinKarp('a')
      expect(rk.searchAll('banana')).toEqual([1, 3, 5])
    })

    it('should return -1 for completely different strings', () => {
      const rk = new RabinKarp('zzz')
      expect(rk.search('abcabc')).toBe(-1)
    })

    it('should find pattern in long repetitive text', () => {
      const text = 'ab'.repeat(500) + 'xyz'
      const rk = new RabinKarp('xyz')
      expect(rk.search(text)).toBe(1000)
    })

    it('should correctly search after setPattern changes to longer', () => {
      const rk = new RabinKarp('ab')
      expect(rk.search('abcdef')).toBe(0)
      rk.setPattern('cdef')
      expect(rk.search('abcdef')).toBe(2)
    })

    it('should correctly search after setPattern changes to shorter', () => {
      const rk = new RabinKarp('abcdef')
      rk.setPattern('cd')
      expect(rk.search('abcdef')).toBe(2)
    })

    it('should handle multiSearch with empty text and empty pattern', () => {
      const result = RabinKarp.multiSearch('', [''])
      expect(result.get('')).toEqual([0])
    })

    it('should handle multiSearch with all patterns of same length', () => {
      const result = RabinKarp.multiSearch('aabbcc', ['aa', 'bb', 'cc', 'dd'])
      expect(result.get('aa')).toEqual([0])
      expect(result.get('bb')).toEqual([2])
      expect(result.get('cc')).toEqual([4])
      expect(result.get('dd')).toEqual([])
    })

    it('should handle rollingHash for long string', () => {
      const hash = RabinKarp.rollingHash('a'.repeat(1000))
      expect(typeof hash).toBe('number')
      expect(hash).toBeGreaterThanOrEqual(0)
    })

    it('should find pattern with custom modulus prime', () => {
      const rk = new RabinKarp('test', 256, 104729)
      expect(rk.search('this is a test string')).toBe(10)
    })

    it('should handle searchAll with all same character text and pattern', () => {
      const rk = new RabinKarp('a')
      expect(rk.searchAll('aaaaa')).toEqual([0, 1, 2, 3, 4])
    })

    it('should handle multiSearch with one pattern found and one not', () => {
      const result = RabinKarp.multiSearch('hello world', ['hello', 'xyz'])
      expect(result.get('hello')).toEqual([0])
      expect(result.get('xyz')).toEqual([])
    })
  })
})
