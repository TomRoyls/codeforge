import { describe, it, expect } from 'vitest'
import { SuffixAutomaton } from '../../src/core/suffix-automaton/suffix-automaton.js'
import type { SAMState, SAMMatchResult } from '../../src/core/suffix-automaton/types.js'

describe('SuffixAutomaton', () => {
  describe('constructor', () => {
    it('should create empty automaton when no argument', () => {
      const sam = new SuffixAutomaton()
      expect(sam.getLength()).toBe(0)
    })

    it('should create automaton from string', () => {
      const sam = new SuffixAutomaton('abc')
      expect(sam.getLength()).toBe(3)
    })

    it('should create automaton from empty string', () => {
      const sam = new SuffixAutomaton('')
      expect(sam.getLength()).toBe(0)
    })

    it('should create automaton from single character', () => {
      const sam = new SuffixAutomaton('a')
      expect(sam.getLength()).toBe(1)
    })

    it('should handle undefined argument', () => {
      const sam = new SuffixAutomaton(undefined)
      expect(sam.getLength()).toBe(0)
    })

    it('should create automaton from multi-character string', () => {
      const sam = new SuffixAutomaton('banana')
      expect(sam.getLength()).toBe(6)
    })
  })

  describe('extend', () => {
    it('should extend empty automaton with one character', () => {
      const sam = new SuffixAutomaton()
      sam.extend('a')
      expect(sam.getLength()).toBe(1)
      expect(sam.contains('a')).toBe(true)
    })

    it('should extend character by character', () => {
      const sam = new SuffixAutomaton()
      sam.extend('a')
      sam.extend('b')
      sam.extend('c')
      expect(sam.getLength()).toBe(3)
      expect(sam.contains('abc')).toBe(true)
      expect(sam.contains('ab')).toBe(true)
      expect(sam.contains('bc')).toBe(true)
    })

    it('should build correct automaton for repeated characters', () => {
      const sam = new SuffixAutomaton()
      sam.extend('a')
      sam.extend('a')
      sam.extend('a')
      expect(sam.contains('a')).toBe(true)
      expect(sam.contains('aa')).toBe(true)
      expect(sam.contains('aaa')).toBe(true)
    })

    it('should handle extending after initial construction', () => {
      const sam = new SuffixAutomaton('ab')
      sam.extend('c')
      expect(sam.getLength()).toBe(3)
      expect(sam.contains('abc')).toBe(true)
    })

    it('should build character by character for "abab"', () => {
      const sam = new SuffixAutomaton()
      for (const ch of 'abab') {
        sam.extend(ch)
      }
      expect(sam.contains('ab')).toBe(true)
      expect(sam.contains('ba')).toBe(true)
      expect(sam.contains('aba')).toBe(true)
      expect(sam.contains('bab')).toBe(true)
      expect(sam.contains('abab')).toBe(true)
    })

    it('should handle single character extend', () => {
      const sam = new SuffixAutomaton()
      sam.extend('x')
      expect(sam.getLength()).toBe(1)
      expect(sam.getAlphabetSize()).toBe(1)
    })

    it('should track alphabet correctly during extend', () => {
      const sam = new SuffixAutomaton()
      sam.extend('a')
      sam.extend('b')
      sam.extend('c')
      expect(sam.getAlphabetSize()).toBe(3)
    })

    it('should not increase alphabet size for duplicate characters', () => {
      const sam = new SuffixAutomaton()
      sam.extend('a')
      sam.extend('a')
      sam.extend('a')
      expect(sam.getAlphabetSize()).toBe(1)
    })
  })

  describe('build', () => {
    it('should build from string replacing existing', () => {
      const sam = new SuffixAutomaton('abc')
      sam.build('xyz')
      expect(sam.getLength()).toBe(3)
      expect(sam.contains('xyz')).toBe(true)
      expect(sam.contains('abc')).toBe(false)
    })

    it('should build from empty string', () => {
      const sam = new SuffixAutomaton('abc')
      sam.build('')
      expect(sam.getLength()).toBe(0)
    })

    it('should build from single character', () => {
      const sam = new SuffixAutomaton()
      sam.build('a')
      expect(sam.getLength()).toBe(1)
      expect(sam.contains('a')).toBe(true)
    })

    it('should build from long string', () => {
      const sam = new SuffixAutomaton()
      sam.build('abcdefghijklmnopqrstuvwxyz')
      expect(sam.getLength()).toBe(26)
      expect(sam.contains('mnop')).toBe(true)
    })

    it('should replace previous automaton completely', () => {
      const sam = new SuffixAutomaton('banana')
      expect(sam.contains('banana')).toBe(true)
      sam.build('apple')
      expect(sam.contains('apple')).toBe(true)
      expect(sam.contains('banana')).toBe(false)
      expect(sam.contains('ban')).toBe(false)
    })

    it('should reset alphabet on build', () => {
      const sam = new SuffixAutomaton('abc')
      expect(sam.getAlphabetSize()).toBe(3)
      sam.build('xx')
      expect(sam.getAlphabetSize()).toBe(1)
    })
  })

  describe('contains', () => {
    it('should return true for existing substring', () => {
      const sam = new SuffixAutomaton('banana')
      expect(sam.contains('ana')).toBe(true)
    })

    it('should return true for entire string', () => {
      const sam = new SuffixAutomaton('banana')
      expect(sam.contains('banana')).toBe(true)
    })

    it('should return true for single character', () => {
      const sam = new SuffixAutomaton('banana')
      expect(sam.contains('b')).toBe(true)
      expect(sam.contains('a')).toBe(true)
      expect(sam.contains('n')).toBe(true)
    })

    it('should return false for non-existent substring', () => {
      const sam = new SuffixAutomaton('banana')
      expect(sam.contains('xyz')).toBe(false)
    })

    it('should return false for character not in text', () => {
      const sam = new SuffixAutomaton('banana')
      expect(sam.contains('z')).toBe(false)
    })

    it('should return true for empty substring', () => {
      const sam = new SuffixAutomaton('banana')
      expect(sam.contains('')).toBe(true)
    })

    it('should return false for substring longer than text', () => {
      const sam = new SuffixAutomaton('ab')
      expect(sam.contains('abc')).toBe(false)
    })

    it('should return true for prefix', () => {
      const sam = new SuffixAutomaton('banana')
      expect(sam.contains('ban')).toBe(true)
      expect(sam.contains('bana')).toBe(true)
    })

    it('should return true for suffix', () => {
      const sam = new SuffixAutomaton('banana')
      expect(sam.contains('nana')).toBe(true)
      expect(sam.contains('ana')).toBe(true)
    })

    it('should return true for middle substring', () => {
      const sam = new SuffixAutomaton('banana')
      expect(sam.contains('nan')).toBe(true)
      expect(sam.contains('an')).toBe(true)
    })

    it('should return false on empty automaton for non-empty substring', () => {
      const sam = new SuffixAutomaton()
      expect(sam.contains('a')).toBe(false)
    })

    it('should return true on empty automaton for empty substring', () => {
      const sam = new SuffixAutomaton()
      expect(sam.contains('')).toBe(true)
    })

    it('should handle repeated characters', () => {
      const sam = new SuffixAutomaton('aaaa')
      expect(sam.contains('a')).toBe(true)
      expect(sam.contains('aa')).toBe(true)
      expect(sam.contains('aaa')).toBe(true)
      expect(sam.contains('aaaa')).toBe(true)
      expect(sam.contains('aaaaa')).toBe(false)
    })
  })

  describe('longestCommonSubstring', () => {
    it('should find LCS of two strings', () => {
      const sam = new SuffixAutomaton('abcdef')
      expect(sam.longestCommonSubstring('xyzabc')).toBe('abc')
    })

    it('should find LCS when other is identical', () => {
      const sam = new SuffixAutomaton('banana')
      expect(sam.longestCommonSubstring('banana')).toBe('banana')
    })

    it('should return empty for no common substring', () => {
      const sam = new SuffixAutomaton('abc')
      expect(sam.longestCommonSubstring('xyz')).toBe('')
    })

    it('should return empty for empty other string', () => {
      const sam = new SuffixAutomaton('abc')
      expect(sam.longestCommonSubstring('')).toBe('')
    })

    it('should return empty on empty automaton', () => {
      const sam = new SuffixAutomaton()
      expect(sam.longestCommonSubstring('abc')).toBe('')
    })

    it('should find single character LCS', () => {
      const sam = new SuffixAutomaton('abc')
      expect(sam.longestCommonSubstring('cde')).toBe('c')
    })

    it('should find LCS in middle of strings', () => {
      const sam = new SuffixAutomaton('abcdefgh')
      const lcs = sam.longestCommonSubstring('xyzdefuvw')
      expect(lcs).toBe('def')
    })

    it('should find LCS at end of both strings', () => {
      const sam = new SuffixAutomaton('hello')
      expect(sam.longestCommonSubstring('jello')).toBe('ello')
    })

    it('should find LCS at start of both strings', () => {
      const sam = new SuffixAutomaton('abcdef')
      expect(sam.longestCommonSubstring('abcxyz')).toBe('abc')
    })

    it('should handle repeated characters in LCS', () => {
      const sam = new SuffixAutomaton('aabaa')
      const lcs = sam.longestCommonSubstring('aab')
      expect(lcs).toBe('aab')
    })

    it('should handle single character strings', () => {
      const sam = new SuffixAutomaton('a')
      expect(sam.longestCommonSubstring('a')).toBe('a')
      expect(sam.longestCommonSubstring('b')).toBe('')
    })

    it('should find LCS between overlapping strings', () => {
      const sam = new SuffixAutomaton('ababab')
      const lcs = sam.longestCommonSubstring('bababa')
      expect(lcs.length).toBe(5)
      expect('ababab'.includes(lcs)).toBe(true)
      expect('bababa'.includes(lcs)).toBe(true)
    })

    it('should find LCS for mississippi', () => {
      const sam = new SuffixAutomaton('mississippi')
      expect(sam.longestCommonSubstring('miss')).toBe('miss')
    })

    it('should handle case sensitivity', () => {
      const sam = new SuffixAutomaton('Hello')
      expect(sam.longestCommonSubstring('hello')).toBe('ello')
    })
  })

  describe('countDistinctSubstrings', () => {
    it('should count distinct substrings for abc', () => {
      const sam = new SuffixAutomaton('abc')
      expect(sam.countDistinctSubstrings()).toBe(6)
    })

    it('should count distinct substrings for single character', () => {
      const sam = new SuffixAutomaton('a')
      expect(sam.countDistinctSubstrings()).toBe(1)
    })

    it('should return 0 for empty string', () => {
      const sam = new SuffixAutomaton('')
      expect(sam.countDistinctSubstrings()).toBe(0)
    })

    it('should count distinct substrings for repeated characters', () => {
      const sam = new SuffixAutomaton('aaa')
      expect(sam.countDistinctSubstrings()).toBe(3)
    })

    it('should count distinct substrings for abab', () => {
      const sam = new SuffixAutomaton('abab')
      expect(sam.countDistinctSubstrings()).toBe(7)
    })

    it('should count distinct substrings for banana', () => {
      const sam = new SuffixAutomaton('banana')
      expect(sam.countDistinctSubstrings()).toBe(15)
    })

    it('should count for two characters', () => {
      const sam = new SuffixAutomaton('ab')
      expect(sam.countDistinctSubstrings()).toBe(3)
    })

    it('should count for aa', () => {
      const sam = new SuffixAutomaton('aa')
      expect(sam.countDistinctSubstrings()).toBe(2)
    })

    it('should handle all unique characters', () => {
      const sam = new SuffixAutomaton('abcdef')
      const n = 6
      expect(sam.countDistinctSubstrings()).toBe((n * (n + 1)) / 2)
    })
  })

  describe('countOccurrences', () => {
    it('should count single occurrence', () => {
      const sam = new SuffixAutomaton('banana')
      expect(sam.countOccurrences('ban')).toBe(1)
    })

    it('should count multiple occurrences', () => {
      const sam = new SuffixAutomaton('banana')
      expect(sam.countOccurrences('ana')).toBe(2)
    })

    it('should count single character occurrences', () => {
      const sam = new SuffixAutomaton('banana')
      expect(sam.countOccurrences('a')).toBe(3)
      expect(sam.countOccurrences('n')).toBe(2)
      expect(sam.countOccurrences('b')).toBe(1)
    })

    it('should return 0 for non-existent substring', () => {
      const sam = new SuffixAutomaton('banana')
      expect(sam.countOccurrences('xyz')).toBe(0)
    })

    it('should return 0 for empty substring', () => {
      const sam = new SuffixAutomaton('banana')
      expect(sam.countOccurrences('')).toBe(0)
    })

    it('should return 0 on empty automaton', () => {
      const sam = new SuffixAutomaton()
      expect(sam.countOccurrences('a')).toBe(0)
    })

    it('should count entire string', () => {
      const sam = new SuffixAutomaton('banana')
      expect(sam.countOccurrences('banana')).toBe(1)
    })

    it('should count overlapping occurrences', () => {
      const sam = new SuffixAutomaton('aaaa')
      expect(sam.countOccurrences('a')).toBe(4)
      expect(sam.countOccurrences('aa')).toBe(3)
      expect(sam.countOccurrences('aaa')).toBe(2)
      expect(sam.countOccurrences('aaaa')).toBe(1)
    })

    it('should return 0 for substring longer than text', () => {
      const sam = new SuffixAutomaton('ab')
      expect(sam.countOccurrences('abc')).toBe(0)
    })

    it('should count in repeated pattern strings', () => {
      const sam = new SuffixAutomaton('abcabcabc')
      expect(sam.countOccurrences('abc')).toBe(3)
      expect(sam.countOccurrences('bc')).toBe(3)
      expect(sam.countOccurrences('cab')).toBe(2)
    })

    it('should handle single character string', () => {
      const sam = new SuffixAutomaton('a')
      expect(sam.countOccurrences('a')).toBe(1)
      expect(sam.countOccurrences('b')).toBe(0)
    })
  })

  describe('longestSubstringEndingAt', () => {
    it('should return empty for out of bounds negative', () => {
      const sam = new SuffixAutomaton('banana')
      expect(sam.longestSubstringEndingAt(-1)).toBe('')
    })

    it('should return empty for out of bounds positive', () => {
      const sam = new SuffixAutomaton('banana')
      expect(sam.longestSubstringEndingAt(6)).toBe('')
    })

    it('should return empty for unique characters', () => {
      const sam = new SuffixAutomaton('abcdef')
      expect(sam.longestSubstringEndingAt(3)).toBe('')
    })

    it('should return empty on empty automaton', () => {
      const sam = new SuffixAutomaton()
      expect(sam.longestSubstringEndingAt(0)).toBe('')
    })

    it('should find repeated substring ending at position', () => {
      const sam = new SuffixAutomaton('abab')
      const result = sam.longestSubstringEndingAt(3)
      expect(result.length).toBeGreaterThan(0)
      expect('abab'.includes(result)).toBe(true)
    })

    it('should handle single character', () => {
      const sam = new SuffixAutomaton('a')
      expect(sam.longestSubstringEndingAt(0)).toBe('')
    })

    it('should handle repeated characters', () => {
      const sam = new SuffixAutomaton('aaaa')
      const result = sam.longestSubstringEndingAt(3)
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('getLength', () => {
    it('should return 0 for empty automaton', () => {
      const sam = new SuffixAutomaton()
      expect(sam.getLength()).toBe(0)
    })

    it('should return correct length', () => {
      const sam = new SuffixAutomaton('hello')
      expect(sam.getLength()).toBe(5)
    })

    it('should return 0 for empty string input', () => {
      const sam = new SuffixAutomaton('')
      expect(sam.getLength()).toBe(0)
    })

    it('should return 1 for single character', () => {
      const sam = new SuffixAutomaton('x')
      expect(sam.getLength()).toBe(1)
    })

    it('should update after extend', () => {
      const sam = new SuffixAutomaton('ab')
      sam.extend('c')
      expect(sam.getLength()).toBe(3)
    })

    it('should update after build', () => {
      const sam = new SuffixAutomaton('abc')
      sam.build('xy')
      expect(sam.getLength()).toBe(2)
    })
  })

  describe('getAlphabetSize', () => {
    it('should return 0 for empty automaton', () => {
      const sam = new SuffixAutomaton()
      expect(sam.getAlphabetSize()).toBe(0)
    })

    it('should return 1 for single character', () => {
      const sam = new SuffixAutomaton('a')
      expect(sam.getAlphabetSize()).toBe(1)
    })

    it('should count distinct characters', () => {
      const sam = new SuffixAutomaton('abc')
      expect(sam.getAlphabetSize()).toBe(3)
    })

    it('should deduplicate characters', () => {
      const sam = new SuffixAutomaton('banana')
      expect(sam.getAlphabetSize()).toBe(3)
    })

    it('should return 1 for all same characters', () => {
      const sam = new SuffixAutomaton('aaaa')
      expect(sam.getAlphabetSize()).toBe(1)
    })

    it('should return 0 for empty string', () => {
      const sam = new SuffixAutomaton('')
      expect(sam.getAlphabetSize()).toBe(0)
    })

    it('should update on extend', () => {
      const sam = new SuffixAutomaton('ab')
      sam.extend('c')
      expect(sam.getAlphabetSize()).toBe(3)
    })

    it('should reset on build', () => {
      const sam = new SuffixAutomaton('abc')
      sam.build('xx')
      expect(sam.getAlphabetSize()).toBe(1)
    })
  })

  describe('clone', () => {
    it('should create independent copy', () => {
      const sam = new SuffixAutomaton('banana')
      const copy = sam.clone()
      expect(copy.getLength()).toBe(6)
      expect(copy.contains('banana')).toBe(true)
    })

    it('should not affect original after clone modification', () => {
      const sam = new SuffixAutomaton('abc')
      const copy = sam.clone()
      copy.build('xyz')
      expect(sam.contains('abc')).toBe(true)
      expect(copy.contains('abc')).toBe(false)
      expect(copy.contains('xyz')).toBe(true)
    })

    it('should preserve alphabet size', () => {
      const sam = new SuffixAutomaton('banana')
      const copy = sam.clone()
      expect(copy.getAlphabetSize()).toBe(sam.getAlphabetSize())
    })

    it('should preserve length', () => {
      const sam = new SuffixAutomaton('hello world')
      const copy = sam.clone()
      expect(copy.getLength()).toBe(sam.getLength())
    })

    it('should clone empty automaton', () => {
      const sam = new SuffixAutomaton()
      const copy = sam.clone()
      expect(copy.getLength()).toBe(0)
      expect(copy.getAlphabetSize()).toBe(0)
    })

    it('should preserve contains results', () => {
      const sam = new SuffixAutomaton('abab')
      const copy = sam.clone()
      expect(copy.contains('ab')).toBe(true)
      expect(copy.contains('ba')).toBe(true)
      expect(copy.contains('aba')).toBe(true)
      expect(copy.contains('xyz')).toBe(false)
    })

    it('should preserve distinct substring count', () => {
      const sam = new SuffixAutomaton('abc')
      const copy = sam.clone()
      expect(copy.countDistinctSubstrings()).toBe(sam.countDistinctSubstrings())
    })

    it('should handle clone of clone', () => {
      const sam = new SuffixAutomaton('test')
      const copy1 = sam.clone()
      const copy2 = copy1.clone()
      expect(copy2.contains('test')).toBe(true)
      expect(copy2.getLength()).toBe(4)
    })
  })

  describe('empty string', () => {
    it('should handle contains on empty', () => {
      const sam = new SuffixAutomaton('')
      expect(sam.contains('')).toBe(true)
      expect(sam.contains('a')).toBe(false)
    })

    it('should handle countOccurrences on empty', () => {
      const sam = new SuffixAutomaton('')
      expect(sam.countOccurrences('')).toBe(0)
      expect(sam.countOccurrences('a')).toBe(0)
    })

    it('should handle countDistinctSubstrings on empty', () => {
      const sam = new SuffixAutomaton('')
      expect(sam.countDistinctSubstrings()).toBe(0)
    })

    it('should handle longestCommonSubstring on empty', () => {
      const sam = new SuffixAutomaton('')
      expect(sam.longestCommonSubstring('abc')).toBe('')
    })

    it('should handle getLength on empty', () => {
      const sam = new SuffixAutomaton('')
      expect(sam.getLength()).toBe(0)
    })

    it('should handle getAlphabetSize on empty', () => {
      const sam = new SuffixAutomaton('')
      expect(sam.getAlphabetSize()).toBe(0)
    })
  })

  describe('single character', () => {
    it('should handle contains', () => {
      const sam = new SuffixAutomaton('a')
      expect(sam.contains('a')).toBe(true)
      expect(sam.contains('b')).toBe(false)
      expect(sam.contains('')).toBe(true)
    })

    it('should handle countDistinctSubstrings', () => {
      const sam = new SuffixAutomaton('a')
      expect(sam.countDistinctSubstrings()).toBe(1)
    })

    it('should handle countOccurrences', () => {
      const sam = new SuffixAutomaton('a')
      expect(sam.countOccurrences('a')).toBe(1)
      expect(sam.countOccurrences('b')).toBe(0)
    })

    it('should handle longestCommonSubstring', () => {
      const sam = new SuffixAutomaton('a')
      expect(sam.longestCommonSubstring('a')).toBe('a')
      expect(sam.longestCommonSubstring('b')).toBe('')
    })

    it('should handle LCS with longer string', () => {
      const sam = new SuffixAutomaton('a')
      expect(sam.longestCommonSubstring('abc')).toBe('a')
    })

    it('should handle getLength', () => {
      const sam = new SuffixAutomaton('a')
      expect(sam.getLength()).toBe(1)
    })

    it('should handle getAlphabetSize', () => {
      const sam = new SuffixAutomaton('a')
      expect(sam.getAlphabetSize()).toBe(1)
    })

    it('should handle clone', () => {
      const sam = new SuffixAutomaton('a')
      const copy = sam.clone()
      expect(copy.contains('a')).toBe(true)
      expect(copy.getLength()).toBe(1)
    })
  })

  describe('repeated characters', () => {
    it('should handle aaaa', () => {
      const sam = new SuffixAutomaton('aaaa')
      expect(sam.contains('a')).toBe(true)
      expect(sam.contains('aa')).toBe(true)
      expect(sam.contains('aaa')).toBe(true)
      expect(sam.contains('aaaa')).toBe(true)
      expect(sam.contains('aaaaa')).toBe(false)
    })

    it('should count distinct substrings in aaaa', () => {
      const sam = new SuffixAutomaton('aaaa')
      expect(sam.countDistinctSubstrings()).toBe(4)
    })

    it('should count occurrences in aaaa', () => {
      const sam = new SuffixAutomaton('aaaa')
      expect(sam.countOccurrences('a')).toBe(4)
      expect(sam.countOccurrences('aa')).toBe(3)
      expect(sam.countOccurrences('aaa')).toBe(2)
      expect(sam.countOccurrences('aaaa')).toBe(1)
    })

    it('should handle aaaaa', () => {
      const sam = new SuffixAutomaton('aaaaa')
      expect(sam.countDistinctSubstrings()).toBe(5)
      expect(sam.countOccurrences('aa')).toBe(4)
    })
  })

  describe('palindrome strings', () => {
    it('should handle racecar', () => {
      const sam = new SuffixAutomaton('racecar')
      expect(sam.contains('racecar')).toBe(true)
      expect(sam.contains('ace')).toBe(true)
      expect(sam.contains('cec')).toBe(true)
      expect(sam.contains('race')).toBe(true)
      expect(sam.contains('car')).toBe(true)
    })

    it('should handle aba', () => {
      const sam = new SuffixAutomaton('aba')
      expect(sam.contains('aba')).toBe(true)
      expect(sam.contains('ba')).toBe(true)
      expect(sam.contains('ab')).toBe(true)
      expect(sam.countDistinctSubstrings()).toBe(5)
    })

    it('should handle abba', () => {
      const sam = new SuffixAutomaton('abba')
      expect(sam.contains('abba')).toBe(true)
      expect(sam.contains('bb')).toBe(true)
      expect(sam.contains('abb')).toBe(true)
      expect(sam.contains('bba')).toBe(true)
    })

    it('should handle abcba', () => {
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

  describe('long strings', () => {
    it('should handle 100 character string', () => {
      const text = 'abc'.repeat(34)
      const sam = new SuffixAutomaton(text)
      expect(sam.getLength()).toBe(102)
      expect(sam.contains('abc')).toBe(true)
    })

    it('should handle 1000 character string', () => {
      const text = 'ab'.repeat(500)
      const sam = new SuffixAutomaton(text)
      expect(sam.getLength()).toBe(1000)
      expect(sam.contains('ab')).toBe(true)
      expect(sam.countOccurrences('ab')).toBe(500)
    })

    it('should handle 500 same character', () => {
      const text = 'a'.repeat(500)
      const sam = new SuffixAutomaton(text)
      expect(sam.getLength()).toBe(500)
      expect(sam.countDistinctSubstrings()).toBe(500)
    })

    it('should handle LCS with long strings', () => {
      const sam = new SuffixAutomaton('abcdefghij'.repeat(10))
      expect(sam.longestCommonSubstring('xyzabcdefghijxyz')).toBe('abcdefghij')
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

    it('should export SAMMatchResult interface', () => {
      const result: SAMMatchResult = {
        substring: 'abc',
        position: 0,
      }
      expect(result.substring).toBe('abc')
      expect(result.position).toBe(0)
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

  describe('edge cases', () => {
    it('should handle string with spaces', () => {
      const sam = new SuffixAutomaton('hello world')
      expect(sam.contains('hello')).toBe(true)
      expect(sam.contains('world')).toBe(true)
      expect(sam.contains('lo w')).toBe(true)
      expect(sam.contains(' ')).toBe(true)
    })

    it('should handle string with special characters', () => {
      const sam = new SuffixAutomaton('a!b@c#')
      expect(sam.contains('!b@')).toBe(true)
      expect(sam.contains('b@c')).toBe(true)
    })

    it('should handle string with numbers', () => {
      const sam = new SuffixAutomaton('abc123abc')
      expect(sam.contains('abc')).toBe(true)
      expect(sam.contains('123')).toBe(true)
      expect(sam.countOccurrences('abc')).toBe(2)
    })

    it('should handle unicode characters', () => {
      const sam = new SuffixAutomaton('café')
      expect(sam.contains('café')).toBe(true)
      expect(sam.contains('caf')).toBe(true)
      expect(sam.getLength()).toBe(4)
    })

    it('should handle two character string', () => {
      const sam = new SuffixAutomaton('ab')
      expect(sam.getLength()).toBe(2)
      expect(sam.contains('a')).toBe(true)
      expect(sam.contains('b')).toBe(true)
      expect(sam.contains('ab')).toBe(true)
      expect(sam.contains('c')).toBe(false)
      expect(sam.countDistinctSubstrings()).toBe(3)
    })

    it('should handle string with newlines', () => {
      const sam = new SuffixAutomaton('line1\nline2\nline3')
      expect(sam.contains('line')).toBe(true)
      expect(sam.contains('\n')).toBe(true)
    })

    it('should handle string where all characters are the same', () => {
      const sam = new SuffixAutomaton('zzzzz')
      expect(sam.countOccurrences('z')).toBe(5)
      expect(sam.countOccurrences('zz')).toBe(4)
      expect(sam.countOccurrences('zzz')).toBe(3)
    })

    it('should handle abcabcab pattern', () => {
      const sam = new SuffixAutomaton('abcabcab')
      expect(sam.contains('abc')).toBe(true)
      expect(sam.countOccurrences('abc')).toBe(2)
      expect(sam.contains('cab')).toBe(true)
      expect(sam.countOccurrences('cab')).toBe(2)
    })

    it('should handle mississippi', () => {
      const sam = new SuffixAutomaton('mississippi')
      expect(sam.contains('miss')).toBe(true)
      expect(sam.contains('issi')).toBe(true)
      expect(sam.contains('ppi')).toBe(true)
      expect(sam.countOccurrences('iss')).toBe(2)
      expect(sam.countOccurrences('i')).toBe(4)
      expect(sam.countOccurrences('s')).toBe(4)
      expect(sam.countOccurrences('p')).toBe(2)
    })

    it('should handle build after extend', () => {
      const sam = new SuffixAutomaton()
      sam.extend('a')
      sam.build('xyz')
      expect(sam.contains('a')).toBe(false)
      expect(sam.contains('xyz')).toBe(true)
    })

    it('should handle multiple builds', () => {
      const sam = new SuffixAutomaton('aaa')
      sam.build('bbb')
      sam.build('ccc')
      expect(sam.contains('aaa')).toBe(false)
      expect(sam.contains('bbb')).toBe(false)
      expect(sam.contains('ccc')).toBe(true)
    })

    it('should correctly count LCS for abcdefgh vs xdefy', () => {
      const sam = new SuffixAutomaton('abcdefgh')
      expect(sam.longestCommonSubstring('xdefy')).toBe('def')
    })
  })
})
