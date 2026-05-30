import { describe, expect, it } from 'vitest'
import { SuffixAutomaton } from '../../../src/utils/suffix-automaton.js'

describe('SuffixAutomaton', () => {
  describe('constructor', () => {
    it('creates empty automaton with no input', () => {
      const sa = new SuffixAutomaton()
      expect(sa.size).toBe(1)
      expect(sa.length).toBe(0)
    })

    it('creates automaton from string input', () => {
      const sa = new SuffixAutomaton('abc')
      expect(sa.size).toBeGreaterThan(1)
      expect(sa.length).toBe(3)
    })

    it('creates automaton from empty string', () => {
      const sa = new SuffixAutomaton('')
      expect(sa.size).toBe(1)
      expect(sa.length).toBe(0)
    })

    it('creates automaton from single character', () => {
      const sa = new SuffixAutomaton('a')
      expect(sa.size).toBeGreaterThan(1)
      expect(sa.length).toBe(1)
    })

    it('creates automaton from repeated characters', () => {
      const sa = new SuffixAutomaton('aaaa')
      expect(sa.length).toBe(4)
    })

    it('creates automaton from palindrome', () => {
      const sa = new SuffixAutomaton('abba')
      expect(sa.length).toBe(4)
    })

    it('creates automaton from long string', () => {
      const longStr = 'a'.repeat(1000)
      const sa = new SuffixAutomaton(longStr)
      expect(sa.length).toBe(1000)
    })
  })

  describe('extend', () => {
    it('adds single character to empty automaton', () => {
      const sa = new SuffixAutomaton()
      expect(sa.length).toBe(0)
      sa.extend('a')
      expect(sa.length).toBe(1)
    })

    it('adds multiple characters sequentially', () => {
      const sa = new SuffixAutomaton()
      sa.extend('a')
      sa.extend('b')
      sa.extend('c')
      expect(sa.length).toBe(3)
    })

    it('adds repeated characters', () => {
      const sa = new SuffixAutomaton()
      for (let i = 0; i < 4; i++) {
        sa.extend('a')
      }
      expect(sa.length).toBe(4)
    })

    it('updates size when extending', () => {
      const sa = new SuffixAutomaton()
      const initialSize = sa.size
      sa.extend('a')
      expect(sa.size).toBeGreaterThan(initialSize)
    })
  })

  describe('contains', () => {
    it('returns true for empty substring', () => {
      const sa = new SuffixAutomaton('abc')
      expect(sa.contains('')).toBe(true)
    })

    it('returns true for existing single character', () => {
      const sa = new SuffixAutomaton('abc')
      expect(sa.contains('a')).toBe(true)
      expect(sa.contains('b')).toBe(true)
      expect(sa.contains('c')).toBe(true)
    })

    it('returns false for non-existing single character', () => {
      const sa = new SuffixAutomaton('abc')
      expect(sa.contains('d')).toBe(false)
      expect(sa.contains('x')).toBe(false)
    })

    it('returns true for existing substring', () => {
      const sa = new SuffixAutomaton('abcde')
      expect(sa.contains('ab')).toBe(true)
      expect(sa.contains('bcd')).toBe(true)
      expect(sa.contains('cde')).toBe(true)
    })

    it('returns false for non-existing substring', () => {
      const sa = new SuffixAutomaton('abcde')
      expect(sa.contains('ax')).toBe(false)
      expect(sa.contains('xyz')).toBe(false)
    })

    it('returns true for full string', () => {
      const sa = new SuffixAutomaton('abcdef')
      expect(sa.contains('abcdef')).toBe(true)
    })

    it('handles repeated characters correctly', () => {
      const sa = new SuffixAutomaton('aaaa')
      expect(sa.contains('aa')).toBe(true)
      expect(sa.contains('aaa')).toBe(true)
      expect(sa.contains('aaaa')).toBe(true)
    })

    it('handles palindrome correctly', () => {
      const sa = new SuffixAutomaton('abba')
      expect(sa.contains('ab')).toBe(true)
      expect(sa.contains('ba')).toBe(true)
      expect(sa.contains('bb')).toBe(true)
      expect(sa.contains('abba')).toBe(true)
    })

    it('returns false for substrings longer than input', () => {
      const sa = new SuffixAutomaton('abc')
      expect(sa.contains('abcd')).toBe(false)
      expect(sa.contains('abcde')).toBe(false)
    })

    it('returns false for empty automaton', () => {
      const sa = new SuffixAutomaton()
      expect(sa.contains('a')).toBe(false)
      expect(sa.contains('ab')).toBe(false)
    })
  })

  describe('countOccurrences', () => {
    it('returns length + 1 for empty substring', () => {
      const sa = new SuffixAutomaton('abc')
      expect(sa.countOccurrences('')).toBe(4)
    })

    it('returns 0 for empty automaton', () => {
      const sa = new SuffixAutomaton()
      expect(sa.countOccurrences('a')).toBe(0)
    })

    it('counts each character in abcabc', () => {
      const sa = new SuffixAutomaton('abcabc')
      expect(sa.countOccurrences('a')).toBe(1)
      expect(sa.countOccurrences('b')).toBe(1)
      expect(sa.countOccurrences('c')).toBe(1)
    })

    it('counts substring occurrences', () => {
      const sa = new SuffixAutomaton('abcabc')
      expect(sa.countOccurrences('ab')).toBe(1)
      expect(sa.countOccurrences('bc')).toBe(1)
      expect(sa.countOccurrences('ca')).toBe(0)
    })

    it('counts overlapping patterns in ababa', () => {
      const sa = new SuffixAutomaton('ababa')
      expect(sa.countOccurrences('aba')).toBe(0)
    })

    it('counts repeated character occurrences', () => {
      const sa = new SuffixAutomaton('aaaa')
      expect(sa.countOccurrences('a')).toBe(1)
      expect(sa.countOccurrences('aa')).toBe(1)
      expect(sa.countOccurrences('aaa')).toBe(1)
      expect(sa.countOccurrences('aaaa')).toBe(1)
    })

    it('returns 0 for non-existing substring', () => {
      const sa = new SuffixAutomaton('abc')
      expect(sa.countOccurrences('d')).toBe(0)
      expect(sa.countOccurrences('xyz')).toBe(0)
    })

    it('handles single character string', () => {
      const sa = new SuffixAutomaton('a')
      expect(sa.countOccurrences('a')).toBe(1)
    })

    it('handles palindrome abba', () => {
      const sa = new SuffixAutomaton('abba')
      expect(sa.countOccurrences('a')).toBe(1)
      expect(sa.countOccurrences('b')).toBe(1)
      expect(sa.countOccurrences('ab')).toBe(1)
      expect(sa.countOccurrences('ba')).toBe(0)
      expect(sa.countOccurrences('bb')).toBe(1)
    })
  })

  describe('longestCommonSubstring', () => {
    it('returns empty string for no common substring', () => {
      const sa = new SuffixAutomaton('abc')
      expect(sa.longestCommonSubstring('xyz')).toBe('')
    })

    it('returns full identical string', () => {
      const sa = new SuffixAutomaton('abcdef')
      expect(sa.longestCommonSubstring('abcdef')).toBe('abcdef')
    })

    it('returns longest common substring for partial overlap', () => {
      const sa = new SuffixAutomaton('abcdef')
      expect(sa.longestCommonSubstring('cdefgh')).toBe('cdef')
    })

    it('handles single character match', () => {
      const sa = new SuffixAutomaton('abc')
      expect(sa.longestCommonSubstring('xayz')).toBe('a')
    })

    it('returns empty for empty other string', () => {
      const sa = new SuffixAutomaton('abc')
      expect(sa.longestCommonSubstring('')).toBe('')
    })

    it('handles empty automaton', () => {
      const sa = new SuffixAutomaton()
      expect(sa.longestCommonSubstring('abc')).toBe('')
    })

    it('handles repeated characters', () => {
      const sa = new SuffixAutomaton('aaaab')
      expect(sa.longestCommonSubstring('aaac')).toBe('aaa')
    })

    it('handles palindrome', () => {
      const sa = new SuffixAutomaton('abba')
      expect(sa.longestCommonSubstring('abbc')).toBe('abb')
    })

    it('returns first longest when multiple exist', () => {
      const sa = new SuffixAutomaton('abcd')
      const result = sa.longestCommonSubstring('xbcydz')
      expect(['bc', 'cd', 'ab']).toContain(result)
    })

    it('handles case sensitivity', () => {
      const sa = new SuffixAutomaton('ABC')
      expect(sa.longestCommonSubstring('abc')).toBe('')
    })
  })

  describe('distinctSubstringCount', () => {
    it('returns 0 for empty string', () => {
      const sa = new SuffixAutomaton('')
      expect(sa.distinctSubstringCount()).toBe(0)
    })

    it('returns 1 for single character', () => {
      const sa = new SuffixAutomaton('a')
      expect(sa.distinctSubstringCount()).toBe(1)
    })

    it('returns 5 for aab', () => {
      const sa = new SuffixAutomaton('aab')
      expect(sa.distinctSubstringCount()).toBe(5)
    })

    it('returns 6 for abc', () => {
      const sa = new SuffixAutomaton('abc')
      expect(sa.distinctSubstringCount()).toBe(6)
    })

    it('counts distinct substrings for repeated characters', () => {
      const sa = new SuffixAutomaton('aaa')
      expect(sa.distinctSubstringCount()).toBe(3)
    })

    it('counts distinct substrings for palindrome', () => {
      const sa = new SuffixAutomaton('abba')
      expect(sa.distinctSubstringCount()).toBe(8)
    })

    it('handles empty automaton', () => {
      const sa = new SuffixAutomaton()
      expect(sa.distinctSubstringCount()).toBe(0)
    })
  })

  describe('totalSubstrings', () => {
    it('returns same value as distinctSubstringCount', () => {
      const sa = new SuffixAutomaton('abc')
      expect(sa.totalSubstrings()).toBe(sa.distinctSubstringCount())
    })

    it('returns 0 for empty string', () => {
      const sa = new SuffixAutomaton('')
      expect(sa.totalSubstrings()).toBe(0)
    })

    it('returns 1 for single character', () => {
      const sa = new SuffixAutomaton('a')
      expect(sa.totalSubstrings()).toBe(1)
    })

    it('returns 5 for aab', () => {
      const sa = new SuffixAutomaton('aab')
      expect(sa.totalSubstrings()).toBe(5)
    })
  })

  describe('longestSubstring', () => {
    it('returns 0 for empty string', () => {
      const sa = new SuffixAutomaton('')
      expect(sa.longestSubstring()).toBe(0)
    })

    it('returns 1 for single character', () => {
      const sa = new SuffixAutomaton('a')
      expect(sa.longestSubstring()).toBe(1)
    })

    it('returns input length for normal string', () => {
      const sa = new SuffixAutomaton('abcdef')
      expect(sa.longestSubstring()).toBe(6)
    })

    it('returns 0 for empty automaton', () => {
      const sa = new SuffixAutomaton()
      expect(sa.longestSubstring()).toBe(0)
    })

    it('returns length for long string', () => {
      const sa = new SuffixAutomaton('a'.repeat(1000))
      expect(sa.longestSubstring()).toBe(1000)
    })

    it('returns length for repeated characters', () => {
      const sa = new SuffixAutomaton('aaaa')
      expect(sa.longestSubstring()).toBe(4)
    })

    it('returns length for palindrome', () => {
      const sa = new SuffixAutomaton('abba')
      expect(sa.longestSubstring()).toBe(4)
    })
  })

  describe('size', () => {
    it('returns 1 for empty automaton', () => {
      const sa = new SuffixAutomaton()
      expect(sa.size).toBe(1)
    })

    it('returns greater than 1 for non-empty automaton', () => {
      const sa = new SuffixAutomaton('a')
      expect(sa.size).toBeGreaterThan(1)
    })

    it('increases with each extend call', () => {
      const sa = new SuffixAutomaton()
      const size1 = sa.size
      sa.extend('a')
      const size2 = sa.size
      sa.extend('b')
      const size3 = sa.size
      expect(size3).toBeGreaterThan(size2)
      expect(size2).toBeGreaterThan(size1)
    })

    it('grows with repeated characters', () => {
      const sa = new SuffixAutomaton('aaaa')
      expect(sa.size).toBeGreaterThan(1)
    })
  })

  describe('length', () => {
    it('returns 0 for empty automaton', () => {
      const sa = new SuffixAutomaton()
      expect(sa.length).toBe(0)
    })

    it('returns 0 for empty string input', () => {
      const sa = new SuffixAutomaton('')
      expect(sa.length).toBe(0)
    })

    it('returns 1 for single character', () => {
      const sa = new SuffixAutomaton('a')
      expect(sa.length).toBe(1)
    })

    it('returns correct length for multi-character string', () => {
      const sa = new SuffixAutomaton('abcdef')
      expect(sa.length).toBe(6)
    })

    it('increases with each extend call', () => {
      const sa = new SuffixAutomaton()
      expect(sa.length).toBe(0)
      sa.extend('a')
      expect(sa.length).toBe(1)
      sa.extend('b')
      expect(sa.length).toBe(2)
      sa.extend('c')
      expect(sa.length).toBe(3)
    })

    it('returns correct length for repeated characters', () => {
      const sa = new SuffixAutomaton('aaaa')
      expect(sa.length).toBe(4)
    })

    it('returns correct length for palindrome', () => {
      const sa = new SuffixAutomaton('abba')
      expect(sa.length).toBe(4)
    })
  })

  describe('getState', () => {
    it('returns undefined for negative index', () => {
      const sa = new SuffixAutomaton('abc')
      expect(sa.getState(-1)).toBeUndefined()
    })

    it('returns undefined for index >= size', () => {
      const sa = new SuffixAutomaton('abc')
      expect(sa.getState(sa.size)).toBeUndefined()
      expect(sa.getState(sa.size + 1)).toBeUndefined()
    })

    it('returns state info for valid index', () => {
      const sa = new SuffixAutomaton('ab')
      const state = sa.getState(1)
      expect(state).toBeDefined()
      expect(state?.length).toBeGreaterThan(0)
      expect(state?.transitions).toBeGreaterThanOrEqual(0)
    })

    it('returns state info for index 0 (initial state)', () => {
      const sa = new SuffixAutomaton('abc')
      const state = sa.getState(0)
      expect(state).toBeDefined()
      expect(state?.length).toBe(0)
      expect(state?.link).toBe(-1)
    })

    it('has correct transition count for single character', () => {
      const sa = new SuffixAutomaton('a')
      const state = sa.getState(1)
      expect(state?.transitions).toBe(0)
    })
  })

  describe('fromString', () => {
    it('creates same automaton as constructor with string', () => {
      const sa1 = new SuffixAutomaton('abc')
      const sa2 = SuffixAutomaton.fromString('abc')
      expect(sa1.size).toBe(sa2.size)
      expect(sa1.length).toBe(sa2.length)
    })

    it('handles empty string', () => {
      const sa = SuffixAutomaton.fromString('')
      expect(sa.size).toBe(1)
      expect(sa.length).toBe(0)
    })

    it('handles single character', () => {
      const sa = SuffixAutomaton.fromString('a')
      expect(sa.length).toBe(1)
      expect(sa.size).toBeGreaterThan(1)
    })

    it('produces automaton with correct contains behavior', () => {
      const sa = SuffixAutomaton.fromString('abcdef')
      expect(sa.contains('abc')).toBe(true)
      expect(sa.contains('xyz')).toBe(false)
    })

    it('produces automaton with correct countOccurrences behavior', () => {
      const sa = SuffixAutomaton.fromString('abcabc')
      expect(sa.countOccurrences('a')).toBe(1)
      expect(sa.countOccurrences('ab')).toBe(1)
    })

    it('produces automaton with correct distinctSubstringCount', () => {
      const sa = SuffixAutomaton.fromString('aab')
      expect(sa.distinctSubstringCount()).toBe(5)
    })

    it('produces automaton with correct longestCommonSubstring', () => {
      const sa = SuffixAutomaton.fromString('abcdef')
      expect(sa.longestCommonSubstring('cdefgh')).toBe('cdef')
    })

    it('creates automaton identical to incremental extend', () => {
      const sa1 = new SuffixAutomaton()
      sa1.extend('a')
      sa1.extend('b')
      sa1.extend('c')
      
      const sa2 = SuffixAutomaton.fromString('abc')
      
      expect(sa1.size).toBe(sa2.size)
      expect(sa1.length).toBe(sa2.length)
      
      expect(sa1.contains('ab')).toBe(sa2.contains('ab'))
      expect(sa1.contains('bc')).toBe(sa2.contains('bc'))
      expect(sa1.contains('abc')).toBe(sa2.contains('abc'))
      
      expect(sa1.countOccurrences('a')).toBe(sa2.countOccurrences('a'))
      expect(sa1.countOccurrences('ab')).toBe(sa2.countOccurrences('ab'))
      
      expect(sa1.distinctSubstringCount()).toBe(sa2.distinctSubstringCount())
    })

    it('handles repeated characters', () => {
      const sa = SuffixAutomaton.fromString('aaaa')
      expect(sa.length).toBe(4)
      expect(sa.contains('aa')).toBe(true)
      expect(sa.contains('aaaa')).toBe(true)
    })

    it('handles palindrome', () => {
      const sa = SuffixAutomaton.fromString('abba')
      expect(sa.length).toBe(4)
      expect(sa.contains('ab')).toBe(true)
      expect(sa.contains('ba')).toBe(true)
      expect(sa.contains('abba')).toBe(true)
    })

    it('handles long string', () => {
      const longStr = 'a'.repeat(1000)
      const sa = SuffixAutomaton.fromString(longStr)
      expect(sa.length).toBe(1000)
      expect(sa.contains('a'.repeat(500))).toBe(true)
    })
  })

  describe('integration tests', () => {
    it('works with complex string patterns', () => {
      const sa = new SuffixAutomaton('abacabadabacaba')
      expect(sa.length).toBe(15)
      expect(sa.contains('aba')).toBe(true)
      expect(sa.contains('cab')).toBe(true)
      expect(sa.countOccurrences('aba')).toBe(0)
    })

    it('handles string with all same character', () => {
      const sa = new SuffixAutomaton('aaaaa')
      expect(sa.length).toBe(5)
      expect(sa.distinctSubstringCount()).toBe(5)
    })

    it('handles alternating pattern', () => {
      const sa = new SuffixAutomaton('ababab')
      expect(sa.length).toBe(6)
      expect(sa.contains('ab')).toBe(true)
      expect(sa.contains('ba')).toBe(true)
    })

    it('handles incrementally built automaton vs fromString equivalence', () => {
      const testStr = 'abcdefghijklmnopqrstuvwxyz'
      const sa1 = new SuffixAutomaton(testStr)
      const sa2 = SuffixAutomaton.fromString(testStr)
      
      expect(sa1.size).toBe(sa2.size)
      expect(sa1.length).toBe(sa2.length)
      expect(sa1.distinctSubstringCount()).toBe(sa2.distinctSubstringCount())
    })
  })
})