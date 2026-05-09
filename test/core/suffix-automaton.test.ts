import { describe, it, expect } from 'vitest'
import { SuffixAutomaton } from '../../src/core/suffix-automaton/suffix-automaton.js'
import type { SAMState } from '../../src/core/suffix-automaton/types.js'

describe('SuffixAutomaton', () => {
  describe('constructor', () => {
    it('should create empty automaton with no argument', () => {
      const sam = new SuffixAutomaton()
      expect(sam.length()).toBe(0)
    })

    it('should build from initial string', () => {
      const sam = new SuffixAutomaton('abc')
      expect(sam.length()).toBe(3)
    })

    it('should handle empty string', () => {
      const sam = new SuffixAutomaton('')
      expect(sam.length()).toBe(0)
    })

    it('should handle single character', () => {
      const sam = new SuffixAutomaton('a')
      expect(sam.length()).toBe(1)
    })

    it('should handle undefined argument', () => {
      const sam = new SuffixAutomaton(undefined)
      expect(sam.length()).toBe(0)
    })

    it('should handle repeated characters', () => {
      const sam = new SuffixAutomaton('aaaa')
      expect(sam.length()).toBe(4)
    })

    it('should handle long string', () => {
      const sam = new SuffixAutomaton('abcdefghijklmnopqrstuvwxyz')
      expect(sam.length()).toBe(26)
    })

    it('should build working automaton from initial string', () => {
      const sam = new SuffixAutomaton('abc')
      expect(sam.contains('abc')).toBe(true)
      expect(sam.contains('ab')).toBe(true)
      expect(sam.contains('bc')).toBe(true)
    })
  })

  describe('addChar', () => {
    it('should add a single character', () => {
      const sam = new SuffixAutomaton()
      sam.addChar('a')
      expect(sam.length()).toBe(1)
    })

    it('should add multiple characters sequentially', () => {
      const sam = new SuffixAutomaton()
      sam.addChar('a')
      sam.addChar('b')
      sam.addChar('c')
      expect(sam.length()).toBe(3)
      expect(sam.contains('abc')).toBe(true)
      expect(sam.contains('ab')).toBe(true)
      expect(sam.contains('bc')).toBe(true)
    })

    it('should handle adding same character repeatedly', () => {
      const sam = new SuffixAutomaton()
      sam.addChar('a')
      sam.addChar('a')
      sam.addChar('a')
      expect(sam.length()).toBe(3)
      expect(sam.contains('aaa')).toBe(true)
      expect(sam.contains('aa')).toBe(true)
    })

    it('should add characters after initial string', () => {
      const sam = new SuffixAutomaton('ab')
      sam.addChar('c')
      expect(sam.length()).toBe(3)
      expect(sam.contains('abc')).toBe(true)
    })

    it('should handle special characters', () => {
      const sam = new SuffixAutomaton()
      sam.addChar('$')
      sam.addChar('#')
      expect(sam.contains('$#')).toBe(true)
    })

    it('should handle unicode characters', () => {
      const sam = new SuffixAutomaton()
      sam.addChar('日')
      sam.addChar('本')
      expect(sam.length()).toBe(2)
      expect(sam.contains('日本')).toBe(true)
    })

    it('should maintain correct structure after many additions', () => {
      const sam = new SuffixAutomaton()
      for (let i = 0; i < 10; i++) {
        sam.addChar(String.fromCharCode(97 + i))
      }
      expect(sam.length()).toBe(10)
      expect(sam.contains('abcdefghij')).toBe(true)
    })
  })

  describe('addString', () => {
    it('should add an empty string', () => {
      const sam = new SuffixAutomaton('abc')
      sam.addString('')
      expect(sam.length()).toBe(3)
    })

    it('should add a string to empty automaton', () => {
      const sam = new SuffixAutomaton()
      sam.addString('hello')
      expect(sam.length()).toBe(5)
      expect(sam.contains('hello')).toBe(true)
    })

    it('should append string to existing automaton', () => {
      const sam = new SuffixAutomaton('abc')
      sam.addString('def')
      expect(sam.length()).toBe(6)
      expect(sam.contains('abcdef')).toBe(true)
      expect(sam.contains('abc')).toBe(true)
      expect(sam.contains('def')).toBe(true)
    })

    it('should handle adding same string twice', () => {
      const sam = new SuffixAutomaton('abc')
      sam.addString('abc')
      expect(sam.length()).toBe(6)
      expect(sam.contains('abcabc')).toBe(true)
    })

    it('should add single char string', () => {
      const sam = new SuffixAutomaton()
      sam.addString('x')
      expect(sam.length()).toBe(1)
      expect(sam.contains('x')).toBe(true)
    })

    it('should chain addString calls', () => {
      const sam = new SuffixAutomaton()
      sam.addString('ab')
      sam.addString('cd')
      sam.addString('ef')
      expect(sam.length()).toBe(6)
      expect(sam.contains('abcdef')).toBe(true)
    })
  })

  describe('contains', () => {
    it('should return true for empty substring', () => {
      const sam = new SuffixAutomaton('abc')
      expect(sam.contains('')).toBe(true)
    })

    it('should return true for single character that exists', () => {
      const sam = new SuffixAutomaton('abc')
      expect(sam.contains('a')).toBe(true)
      expect(sam.contains('b')).toBe(true)
      expect(sam.contains('c')).toBe(true)
    })

    it('should return false for character that does not exist', () => {
      const sam = new SuffixAutomaton('abc')
      expect(sam.contains('d')).toBe(false)
      expect(sam.contains('z')).toBe(false)
    })

    it('should find all substrings of "abc"', () => {
      const sam = new SuffixAutomaton('abc')
      expect(sam.contains('a')).toBe(true)
      expect(sam.contains('b')).toBe(true)
      expect(sam.contains('c')).toBe(true)
      expect(sam.contains('ab')).toBe(true)
      expect(sam.contains('bc')).toBe(true)
      expect(sam.contains('abc')).toBe(true)
    })

    it('should return false for substrings that dont exist', () => {
      const sam = new SuffixAutomaton('abc')
      expect(sam.contains('ac')).toBe(false)
      expect(sam.contains('ba')).toBe(false)
      expect(sam.contains('cb')).toBe(false)
      expect(sam.contains('abcd')).toBe(false)
    })

    it('should return false for substring longer than text', () => {
      const sam = new SuffixAutomaton('ab')
      expect(sam.contains('abc')).toBe(false)
    })

    it('should work with empty automaton', () => {
      const sam = new SuffixAutomaton()
      expect(sam.contains('')).toBe(true)
      expect(sam.contains('a')).toBe(false)
    })

    it('should find repeated substrings', () => {
      const sam = new SuffixAutomaton('abab')
      expect(sam.contains('ab')).toBe(true)
      expect(sam.contains('aba')).toBe(true)
      expect(sam.contains('bab')).toBe(true)
      expect(sam.contains('abab')).toBe(true)
    })

    it('should handle single character string', () => {
      const sam = new SuffixAutomaton('x')
      expect(sam.contains('x')).toBe(true)
      expect(sam.contains('')).toBe(true)
      expect(sam.contains('y')).toBe(false)
    })

    it('should handle all same characters', () => {
      const sam = new SuffixAutomaton('aaaa')
      expect(sam.contains('a')).toBe(true)
      expect(sam.contains('aa')).toBe(true)
      expect(sam.contains('aaa')).toBe(true)
      expect(sam.contains('aaaa')).toBe(true)
      expect(sam.contains('aaaaa')).toBe(false)
    })

    it('should handle prefix', () => {
      const sam = new SuffixAutomaton('banana')
      expect(sam.contains('ban')).toBe(true)
      expect(sam.contains('bana')).toBe(true)
    })

    it('should handle suffix', () => {
      const sam = new SuffixAutomaton('banana')
      expect(sam.contains('nana')).toBe(true)
      expect(sam.contains('ana')).toBe(true)
    })

    it('should handle middle substring', () => {
      const sam = new SuffixAutomaton('banana')
      expect(sam.contains('nan')).toBe(true)
      expect(sam.contains('an')).toBe(true)
    })
  })

  describe('countOccurrences', () => {
    it('should return 0 for empty substring', () => {
      const sam = new SuffixAutomaton('abc')
      expect(sam.countOccurrences('')).toBe(0)
    })

    it('should count single character occurrences', () => {
      const sam = new SuffixAutomaton('abac')
      expect(sam.countOccurrences('a')).toBe(2)
      expect(sam.countOccurrences('b')).toBe(1)
      expect(sam.countOccurrences('c')).toBe(1)
    })

    it('should count substring occurrences in "abab"', () => {
      const sam = new SuffixAutomaton('abab')
      expect(sam.countOccurrences('ab')).toBe(2)
      expect(sam.countOccurrences('ba')).toBe(1)
      expect(sam.countOccurrences('aba')).toBe(1)
      expect(sam.countOccurrences('bab')).toBe(1)
      expect(sam.countOccurrences('abab')).toBe(1)
    })

    it('should return 0 for non-existent substring', () => {
      const sam = new SuffixAutomaton('abc')
      expect(sam.countOccurrences('d')).toBe(0)
      expect(sam.countOccurrences('ac')).toBe(0)
    })

    it('should count in repeated character string', () => {
      const sam = new SuffixAutomaton('aaaa')
      expect(sam.countOccurrences('a')).toBe(4)
      expect(sam.countOccurrences('aa')).toBe(3)
      expect(sam.countOccurrences('aaa')).toBe(2)
      expect(sam.countOccurrences('aaaa')).toBe(1)
    })

    it('should return 0 for empty automaton', () => {
      const sam = new SuffixAutomaton()
      expect(sam.countOccurrences('a')).toBe(0)
    })

    it('should handle substring longer than text', () => {
      const sam = new SuffixAutomaton('ab')
      expect(sam.countOccurrences('abc')).toBe(0)
    })

    it('should count overlapping occurrences', () => {
      const sam = new SuffixAutomaton('aaa')
      expect(sam.countOccurrences('aa')).toBe(2)
      expect(sam.countOccurrences('a')).toBe(3)
    })

    it('should count in palindrome', () => {
      const sam = new SuffixAutomaton('abaaba')
      expect(sam.countOccurrences('aba')).toBe(2)
      expect(sam.countOccurrences('ba')).toBe(2)
    })

    it('should count full string occurrence', () => {
      const sam = new SuffixAutomaton('abcdef')
      expect(sam.countOccurrences('abcdef')).toBe(1)
    })

    it('should count single character string', () => {
      const sam = new SuffixAutomaton('a')
      expect(sam.countOccurrences('a')).toBe(1)
      expect(sam.countOccurrences('b')).toBe(0)
    })

    it('should count in repeated pattern', () => {
      const sam = new SuffixAutomaton('abcabcabc')
      expect(sam.countOccurrences('abc')).toBe(3)
      expect(sam.countOccurrences('bc')).toBe(3)
      expect(sam.countOccurrences('cab')).toBe(2)
    })
  })

  describe('longestCommonSubstring', () => {
    it('should return empty for empty automaton', () => {
      const sam = new SuffixAutomaton()
      expect(sam.longestCommonSubstring('abc')).toBe('')
    })

    it('should return empty for empty other string', () => {
      const sam = new SuffixAutomaton('abc')
      expect(sam.longestCommonSubstring('')).toBe('')
    })

    it('should find LCS of identical strings', () => {
      const sam = new SuffixAutomaton('abcdef')
      expect(sam.longestCommonSubstring('abcdef')).toBe('abcdef')
    })

    it('should find LCS with no common substring', () => {
      const sam = new SuffixAutomaton('abc')
      expect(sam.longestCommonSubstring('xyz')).toBe('')
    })

    it('should find LCS of partial match', () => {
      const sam = new SuffixAutomaton('abcdef')
      expect(sam.longestCommonSubstring('xyzdef')).toBe('def')
    })

    it('should find LCS at the beginning', () => {
      const sam = new SuffixAutomaton('abcdef')
      expect(sam.longestCommonSubstring('abcxyz')).toBe('abc')
    })

    it('should find LCS in the middle', () => {
      const sam = new SuffixAutomaton('abcdef')
      const lcs = sam.longestCommonSubstring('xcdyez')
      expect(lcs).toBe('cd')
    })

    it('should handle single common character', () => {
      const sam = new SuffixAutomaton('abc')
      expect(sam.longestCommonSubstring('xby')).toBe('b')
    })

    it('should handle repeated characters', () => {
      const sam = new SuffixAutomaton('aabaa')
      const lcs = sam.longestCommonSubstring('baab')
      expect(lcs.length).toBe(3)
    })

    it('should handle both empty', () => {
      const sam = new SuffixAutomaton()
      expect(sam.longestCommonSubstring('')).toBe('')
    })

    it('should find single character LCS', () => {
      const sam = new SuffixAutomaton('abc')
      expect(sam.longestCommonSubstring('cde')).toBe('c')
    })

    it('should find LCS at end of both strings', () => {
      const sam = new SuffixAutomaton('hello')
      expect(sam.longestCommonSubstring('jello')).toBe('ello')
    })

    it('should handle case sensitivity', () => {
      const sam = new SuffixAutomaton('Hello')
      expect(sam.longestCommonSubstring('hello')).toBe('ello')
    })

    it('should find LCS between overlapping strings', () => {
      const sam = new SuffixAutomaton('ababab')
      const lcs = sam.longestCommonSubstring('bababa')
      expect(lcs.length).toBe(5)
    })

    it('should handle LCS for mississippi', () => {
      const sam = new SuffixAutomaton('mississippi')
      expect(sam.longestCommonSubstring('miss')).toBe('miss')
    })
  })

  describe('distinctSubstrings', () => {
    it('should return 0 for empty string', () => {
      const sam = new SuffixAutomaton()
      expect(sam.distinctSubstrings()).toBe(0)
    })

    it('should return 1 for single character', () => {
      const sam = new SuffixAutomaton('a')
      expect(sam.distinctSubstrings()).toBe(1)
    })

    it('should count distinct substrings of "ab"', () => {
      const sam = new SuffixAutomaton('ab')
      expect(sam.distinctSubstrings()).toBe(3)
    })

    it('should count distinct substrings of "abc"', () => {
      const sam = new SuffixAutomaton('abc')
      expect(sam.distinctSubstrings()).toBe(6)
    })

    it('should count distinct substrings of repeated chars', () => {
      const sam = new SuffixAutomaton('aaa')
      expect(sam.distinctSubstrings()).toBe(3)
    })

    it('should count distinct substrings of "abab"', () => {
      const sam = new SuffixAutomaton('abab')
      expect(sam.distinctSubstrings()).toBe(7)
    })

    it('should count distinct substrings of "aaaa"', () => {
      const sam = new SuffixAutomaton('aaaa')
      expect(sam.distinctSubstrings()).toBe(4)
    })

    it('should count distinct substrings of all distinct chars', () => {
      const sam = new SuffixAutomaton('abcd')
      expect(sam.distinctSubstrings()).toBe(10)
    })

    it('should count after adding chars', () => {
      const sam = new SuffixAutomaton()
      sam.addChar('a')
      expect(sam.distinctSubstrings()).toBe(1)
      sam.addChar('b')
      expect(sam.distinctSubstrings()).toBe(3)
    })

    it('should return n*(n+1)/2 for all unique characters', () => {
      const sam = new SuffixAutomaton('abcdef')
      const n = 6
      expect(sam.distinctSubstrings()).toBe((n * (n + 1)) / 2)
    })

    it('should count distinct substrings of "aab"', () => {
      const sam = new SuffixAutomaton('aab')
      expect(sam.distinctSubstrings()).toBe(5)
    })

    it('should count distinct substrings of "aba"', () => {
      const sam = new SuffixAutomaton('aba')
      expect(sam.distinctSubstrings()).toBe(5)
    })

    it('should count distinct substrings of "aa"', () => {
      const sam = new SuffixAutomaton('aa')
      expect(sam.distinctSubstrings()).toBe(2)
    })
  })

  describe('totalSubstrings', () => {
    it('should return 0 for empty string', () => {
      const sam = new SuffixAutomaton()
      expect(sam.totalSubstrings()).toBe(0)
    })

    it('should return 1 for single character', () => {
      const sam = new SuffixAutomaton('a')
      expect(sam.totalSubstrings()).toBe(1)
    })

    it('should return 3 for "ab"', () => {
      const sam = new SuffixAutomaton('ab')
      expect(sam.totalSubstrings()).toBe(3)
    })

    it('should return 6 for "abc"', () => {
      const sam = new SuffixAutomaton('abc')
      expect(sam.totalSubstrings()).toBe(6)
    })

    it('should return 10 for "abcd"', () => {
      const sam = new SuffixAutomaton('abcd')
      expect(sam.totalSubstrings()).toBe(10)
    })

    it('should return n*(n+1)/2 for any string', () => {
      const sam = new SuffixAutomaton('abcdef')
      expect(sam.totalSubstrings()).toBe(21)
    })

    it('should handle repeated characters', () => {
      const sam = new SuffixAutomaton('aaaa')
      expect(sam.totalSubstrings()).toBe(10)
    })

    it('should update after addChar', () => {
      const sam = new SuffixAutomaton('ab')
      expect(sam.totalSubstrings()).toBe(3)
      sam.addChar('c')
      expect(sam.totalSubstrings()).toBe(6)
    })

    it('should update after addString', () => {
      const sam = new SuffixAutomaton('ab')
      sam.addString('cd')
      expect(sam.totalSubstrings()).toBe(10)
    })
  })

  describe('longestSubstring', () => {
    it('should return empty for empty automaton', () => {
      const sam = new SuffixAutomaton()
      expect(sam.longestSubstring()).toBe('')
    })

    it('should return empty for single character', () => {
      const sam = new SuffixAutomaton('a')
      expect(sam.longestSubstring()).toBe('')
    })

    it('should find longest repeated in repeated chars', () => {
      const sam = new SuffixAutomaton('aaaa')
      expect(sam.longestSubstring()).toBe('aaa')
    })

    it('should find longest repeated in "abab"', () => {
      const sam = new SuffixAutomaton('abab')
      const result = sam.longestSubstring()
      expect(result.length).toBe(2)
      expect(sam.countOccurrences(result)).toBeGreaterThanOrEqual(2)
    })

    it('should return empty for all distinct chars', () => {
      const sam = new SuffixAutomaton('abcd')
      expect(sam.longestSubstring()).toBe('')
    })

    it('should find repeated in "abcab"', () => {
      const sam = new SuffixAutomaton('abcab')
      const result = sam.longestSubstring()
      expect(result).toBe('ab')
    })

    it('should return empty for two different chars', () => {
      const sam = new SuffixAutomaton('ab')
      expect(sam.longestSubstring()).toBe('')
    })

    it('should find in "banana"', () => {
      const sam = new SuffixAutomaton('banana')
      const result = sam.longestSubstring()
      expect(result).toBe('ana')
    })

    it('should find in overlapping pattern', () => {
      const sam = new SuffixAutomaton('abcabc')
      const result = sam.longestSubstring()
      expect(result.length).toBe(3)
      expect(['abc', 'bca', 'cab']).toContain(result)
    })

    it('should find longest repeated in repeated pattern', () => {
      const sam = new SuffixAutomaton('abcababcab')
      const result = sam.longestSubstring()
      expect(result.length).toBeGreaterThanOrEqual(2)
      expect(sam.countOccurrences(result)).toBeGreaterThanOrEqual(2)
    })
  })

  describe('length', () => {
    it('should return 0 for empty automaton', () => {
      const sam = new SuffixAutomaton()
      expect(sam.length()).toBe(0)
    })

    it('should return string length', () => {
      const sam = new SuffixAutomaton('hello')
      expect(sam.length()).toBe(5)
    })

    it('should update after addChar', () => {
      const sam = new SuffixAutomaton('ab')
      sam.addChar('c')
      expect(sam.length()).toBe(3)
    })

    it('should update after addString', () => {
      const sam = new SuffixAutomaton('ab')
      sam.addString('cd')
      expect(sam.length()).toBe(4)
    })
  })

  describe('clone', () => {
    it('should create independent copy', () => {
      const sam = new SuffixAutomaton('abc')
      const cloned = sam.clone()
      expect(cloned.length()).toBe(3)
      expect(cloned.contains('abc')).toBe(true)
    })

    it('should not affect original when modified', () => {
      const sam = new SuffixAutomaton('abc')
      const cloned = sam.clone()
      cloned.addChar('d')
      expect(sam.length()).toBe(3)
      expect(cloned.length()).toBe(4)
    })

    it('should not affect clone when original is modified', () => {
      const sam = new SuffixAutomaton('abc')
      const cloned = sam.clone()
      sam.addChar('d')
      expect(cloned.length()).toBe(3)
      expect(sam.length()).toBe(4)
    })

    it('should clone empty automaton', () => {
      const sam = new SuffixAutomaton()
      const cloned = sam.clone()
      expect(cloned.length()).toBe(0)
    })

    it('should preserve contains results', () => {
      const sam = new SuffixAutomaton('abcdef')
      const cloned = sam.clone()
      expect(cloned.contains('cde')).toBe(true)
      expect(cloned.contains('xyz')).toBe(false)
    })

    it('should preserve countOccurrences results', () => {
      const sam = new SuffixAutomaton('abab')
      const cloned = sam.clone()
      expect(cloned.countOccurrences('ab')).toBe(2)
    })

    it('should preserve distinctSubstrings count', () => {
      const sam = new SuffixAutomaton('abc')
      const cloned = sam.clone()
      expect(cloned.distinctSubstrings()).toBe(6)
    })

    it('should handle clone of clone', () => {
      const sam = new SuffixAutomaton('test')
      const c1 = sam.clone()
      const c2 = c1.clone()
      expect(c2.contains('test')).toBe(true)
      expect(c2.length()).toBe(4)
    })

    it('should handle multiple clones', () => {
      const sam = new SuffixAutomaton('abc')
      const c1 = sam.clone()
      const c2 = sam.clone()
      c1.addChar('d')
      c2.addString('ef')
      expect(sam.length()).toBe(3)
      expect(c1.length()).toBe(4)
      expect(c2.length()).toBe(5)
    })

    it('should preserve occurrence counts after clone', () => {
      const sam = new SuffixAutomaton('abcabc')
      const r1 = sam.countOccurrences('abc')
      const cloned = sam.clone()
      const r2 = cloned.countOccurrences('abc')
      expect(r1).toBe(r2)
      expect(r1).toBe(2)
    })
  })

  describe('reset', () => {
    it('should reset to empty state', () => {
      const sam = new SuffixAutomaton('abc')
      sam.reset()
      expect(sam.length()).toBe(0)
    })

    it('should allow rebuilding after reset', () => {
      const sam = new SuffixAutomaton('abc')
      sam.reset()
      sam.addString('xyz')
      expect(sam.length()).toBe(3)
      expect(sam.contains('xyz')).toBe(true)
      expect(sam.contains('abc')).toBe(false)
    })

    it('should work on already empty automaton', () => {
      const sam = new SuffixAutomaton()
      sam.reset()
      expect(sam.length()).toBe(0)
    })

    it('should clear contains results', () => {
      const sam = new SuffixAutomaton('abc')
      sam.reset()
      expect(sam.contains('abc')).toBe(false)
      expect(sam.contains('a')).toBe(false)
    })

    it('should clear countOccurrences results', () => {
      const sam = new SuffixAutomaton('abab')
      sam.reset()
      expect(sam.countOccurrences('ab')).toBe(0)
    })

    it('should clear distinctSubstrings count', () => {
      const sam = new SuffixAutomaton('abc')
      sam.reset()
      expect(sam.distinctSubstrings()).toBe(0)
    })

    it('should clear totalSubstrings count', () => {
      const sam = new SuffixAutomaton('abc')
      sam.reset()
      expect(sam.totalSubstrings()).toBe(0)
    })

    it('should allow multiple reset cycles', () => {
      const sam = new SuffixAutomaton()
      sam.addString('abc')
      sam.reset()
      sam.addString('def')
      expect(sam.length()).toBe(3)
      sam.reset()
      sam.addString('ghi')
      expect(sam.length()).toBe(3)
      expect(sam.contains('ghi')).toBe(true)
    })

    it('should clear longestSubstring', () => {
      const sam = new SuffixAutomaton('aaaa')
      sam.reset()
      expect(sam.longestSubstring()).toBe('')
    })
  })

  describe('palindrome strings', () => {
    it('should handle "aba"', () => {
      const sam = new SuffixAutomaton('aba')
      expect(sam.contains('aba')).toBe(true)
      expect(sam.contains('ba')).toBe(true)
      expect(sam.contains('ab')).toBe(true)
      expect(sam.countOccurrences('a')).toBe(2)
      expect(sam.countOccurrences('b')).toBe(1)
      expect(sam.countOccurrences('aba')).toBe(1)
    })

    it('should handle "racecar"', () => {
      const sam = new SuffixAutomaton('racecar')
      expect(sam.contains('racecar')).toBe(true)
      expect(sam.contains('ace')).toBe(true)
      expect(sam.contains('car')).toBe(true)
      expect(sam.countOccurrences('r')).toBe(2)
      expect(sam.countOccurrences('a')).toBe(2)
      expect(sam.countOccurrences('c')).toBe(2)
    })

    it('should handle "abba"', () => {
      const sam = new SuffixAutomaton('abba')
      expect(sam.contains('abba')).toBe(true)
      expect(sam.countOccurrences('a')).toBe(2)
      expect(sam.countOccurrences('b')).toBe(2)
      expect(sam.countOccurrences('bb')).toBe(1)
      expect(sam.countOccurrences('ab')).toBe(1)
      expect(sam.countOccurrences('ba')).toBe(1)
    })

    it('should handle "abcba"', () => {
      const sam = new SuffixAutomaton('abcba')
      expect(sam.contains('abcba')).toBe(true)
      expect(sam.contains('bcb')).toBe(true)
      expect(sam.contains('abc')).toBe(true)
      expect(sam.contains('cba')).toBe(true)
    })

    it('should handle LCS with palindrome', () => {
      const sam = new SuffixAutomaton('racecar')
      expect(sam.longestCommonSubstring('car')).toBe('car')
    })
  })

  describe('random strings', () => {
    it('should handle string with mixed case', () => {
      const sam = new SuffixAutomaton('aAbB')
      expect(sam.contains('aA')).toBe(true)
      expect(sam.contains('Ab')).toBe(true)
      expect(sam.contains('bB')).toBe(true)
    })

    it('should handle numeric string', () => {
      const sam = new SuffixAutomaton('123123')
      expect(sam.contains('123')).toBe(true)
      expect(sam.countOccurrences('123')).toBe(2)
      expect(sam.countOccurrences('23')).toBe(2)
      expect(sam.countOccurrences('12')).toBe(2)
    })

    it('should handle string with spaces', () => {
      const sam = new SuffixAutomaton('a b c')
      expect(sam.contains(' ')).toBe(true)
      expect(sam.contains('a b')).toBe(true)
      expect(sam.countOccurrences(' ')).toBe(2)
    })

    it('should correctly count distinct substrings for "abcabc"', () => {
      const sam = new SuffixAutomaton('abcabc')
      expect(sam.distinctSubstrings()).toBe(15)
    })

    it('should handle "xabax"', () => {
      const sam = new SuffixAutomaton('xabax')
      expect(sam.contains('aba')).toBe(true)
      expect(sam.contains('xabax')).toBe(true)
      expect(sam.countOccurrences('a')).toBe(2)
      expect(sam.countOccurrences('x')).toBe(2)
    })

    it('should handle string with special characters', () => {
      const sam = new SuffixAutomaton('a!b@c#')
      expect(sam.contains('!b@')).toBe(true)
      expect(sam.contains('b@c')).toBe(true)
    })

    it('should handle string with newlines', () => {
      const sam = new SuffixAutomaton('line1\nline2\nline3')
      expect(sam.contains('line')).toBe(true)
      expect(sam.contains('\n')).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle very long repeated string', () => {
      const str = 'ab'.repeat(50)
      const sam = new SuffixAutomaton(str)
      expect(sam.contains('ab')).toBe(true)
      expect(sam.countOccurrences('ab')).toBe(50)
      expect(sam.length()).toBe(100)
    })

    it('should handle alternating pattern', () => {
      const sam = new SuffixAutomaton('abababab')
      expect(sam.countOccurrences('ab')).toBe(4)
      expect(sam.countOccurrences('ba')).toBe(3)
      expect(sam.countOccurrences('abab')).toBe(3)
    })

    it('should handle single repeated character', () => {
      const sam = new SuffixAutomaton('zzzzz')
      expect(sam.countOccurrences('z')).toBe(5)
      expect(sam.countOccurrences('zz')).toBe(4)
      expect(sam.countOccurrences('zzz')).toBe(3)
    })

    it('should handle LCS with itself', () => {
      const sam = new SuffixAutomaton('abcdef')
      expect(sam.longestCommonSubstring('abcdef')).toBe('abcdef')
    })

    it('should handle clone after multiple operations', () => {
      const sam = new SuffixAutomaton('ab')
      sam.addString('cd')
      sam.addChar('e')
      const cloned = sam.clone()
      expect(cloned.length()).toBe(5)
      expect(cloned.contains('abcde')).toBe(true)
      expect(cloned.contains('cd')).toBe(true)
    })

    it('should handle reset and reuse', () => {
      const sam = new SuffixAutomaton('abc')
      expect(sam.countOccurrences('a')).toBe(1)
      sam.reset()
      sam.addString('aaa')
      expect(sam.countOccurrences('a')).toBe(3)
      expect(sam.countOccurrences('aa')).toBe(2)
    })

    it('should handle longestSubstring after reset', () => {
      const sam = new SuffixAutomaton('abc')
      sam.reset()
      sam.addString('abcabc')
      const result = sam.longestSubstring()
      expect(result.length).toBeGreaterThanOrEqual(3)
    })

    it('should handle LCS between related strings', () => {
      const sam = new SuffixAutomaton('abcdef')
      expect(sam.longestCommonSubstring('abcfef')).toBe('abc')
    })

    it('should handle longestCommonSubstring with repeated chars', () => {
      const sam = new SuffixAutomaton('xyzabcabcxyz')
      expect(sam.longestCommonSubstring('abc')).toBe('abc')
    })

    it('should handle totalSubstrings after reset', () => {
      const sam = new SuffixAutomaton('abc')
      expect(sam.totalSubstrings()).toBe(6)
      sam.reset()
      expect(sam.totalSubstrings()).toBe(0)
      sam.addString('ab')
      expect(sam.totalSubstrings()).toBe(3)
    })

    it('should handle 500 same character', () => {
      const text = 'a'.repeat(500)
      const sam = new SuffixAutomaton(text)
      expect(sam.length()).toBe(500)
      expect(sam.distinctSubstrings()).toBe(500)
    })

    it('should handle LCS with long strings', () => {
      const sam = new SuffixAutomaton('abcdefghij'.repeat(10))
      expect(sam.longestCommonSubstring('xyzabcdefghijxyz')).toBe('abcdefghij')
    })
  })

  describe('comprehensive integration', () => {
    it('should work with "mississippi"', () => {
      const sam = new SuffixAutomaton('mississippi')
      expect(sam.contains('miss')).toBe(true)
      expect(sam.contains('issi')).toBe(true)
      expect(sam.contains('ppi')).toBe(true)
      expect(sam.contains('mississippi')).toBe(true)
      expect(sam.contains('mssi')).toBe(false)
      expect(sam.countOccurrences('i')).toBe(4)
      expect(sam.countOccurrences('s')).toBe(4)
      expect(sam.countOccurrences('p')).toBe(2)
      expect(sam.countOccurrences('ss')).toBe(2)
      expect(sam.countOccurrences('iss')).toBe(2)
      expect(sam.countOccurrences('issi')).toBe(2)
      expect(sam.countOccurrences('si')).toBe(2)
    })

    it('should work with "abacaba"', () => {
      const sam = new SuffixAutomaton('abacaba')
      expect(sam.contains('aba')).toBe(true)
      expect(sam.countOccurrences('a')).toBe(4)
      expect(sam.countOccurrences('b')).toBe(2)
      expect(sam.countOccurrences('c')).toBe(1)
      expect(sam.countOccurrences('aba')).toBe(2)
      expect(sam.distinctSubstrings()).toBe(21)
    })

    it('should work with "abcababcab"', () => {
      const sam = new SuffixAutomaton('abcababcab')
      expect(sam.countOccurrences('ab')).toBe(4)
      expect(sam.countOccurrences('cab')).toBe(2)
      expect(sam.countOccurrences('abc')).toBe(2)
      expect(sam.contains('abcababcab')).toBe(true)
    })

    it('should verify distinctSubstrings formula', () => {
      const strings = ['a', 'ab', 'abc', 'abcd', 'aa', 'aaa', 'aba', 'abab']
      const expected = [1, 3, 6, 10, 2, 3, 5, 7]
      for (let i = 0; i < strings.length; i++) {
        const sam = new SuffixAutomaton(strings[i]!)
        expect(sam.distinctSubstrings()).toBe(expected[i]!)
      }
    })

    it('should handle LCS for various pairs', () => {
      const pairs: [string, string, string][] = [
        ['abcdef', 'defghi', 'def'],
        ['hello', 'world', 'l'],
        ['abc', 'abc', 'abc'],
        ['xyz', 'abc', ''],
      ]
      for (const [s, t, expected] of pairs) {
        const sam = new SuffixAutomaton(s)
        const lcs = sam.longestCommonSubstring(t)
        if (expected.length > 0) {
          expect(lcs.length).toBe(expected.length)
        } else {
          expect(lcs).toBe('')
        }
      }
    })

    it('should handle unicode characters', () => {
      const sam = new SuffixAutomaton('café')
      expect(sam.contains('café')).toBe(true)
      expect(sam.contains('caf')).toBe(true)
    })
  })

  describe('type exports', () => {
    it('should export SAMState interface', () => {
      const state: SAMState = {
        length: 5,
        link: -1,
        transitions: new Map<string, number>(),
        occurrences: 1,
        firstPos: 4,
        isCloned: false,
      }
      expect(state.length).toBe(5)
      expect(state.transitions).toBeInstanceOf(Map)
      expect(state.isCloned).toBe(false)
    })

    it('should allow SAMState with transitions', () => {
      const state: SAMState = {
        length: 3,
        link: 0,
        transitions: new Map([['a', 1], ['b', 2]]),
        occurrences: 2,
        firstPos: 2,
        isCloned: true,
      }
      expect(state.transitions.get('a')).toBe(1)
      expect(state.transitions.get('b')).toBe(2)
    })
  })
})
