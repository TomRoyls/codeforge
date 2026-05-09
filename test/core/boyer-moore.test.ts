import { describe, it, expect } from 'vitest'
import { BoyerMoore } from '../../src/core/boyer-moore/boyer-moore.js'
import { DEFAULT_BOYER_MOORE_OPTIONS } from '../../src/core/boyer-moore/types.js'
import type { BoyerMooreOptions } from '../../src/core/boyer-moore/types.js'

describe('BoyerMoore', () => {
  describe('constructor', () => {
    it('should create instance with a pattern', () => {
      const bm = new BoyerMoore('abc')
      expect(bm.getPattern()).toBe('abc')
    })

    it('should create instance with empty pattern', () => {
      const bm = new BoyerMoore('')
      expect(bm.getPattern()).toBe('')
    })

    it('should create instance with single character pattern', () => {
      const bm = new BoyerMoore('a')
      expect(bm.getPattern()).toBe('a')
    })

    it('should accept caseSensitive option as true', () => {
      const bm = new BoyerMoore('abc', { caseSensitive: true })
      expect(bm.search('ABC')).toBe(-1)
    })

    it('should accept caseSensitive option as false', () => {
      const bm = new BoyerMoore('abc', { caseSensitive: false })
      expect(bm.search('ABC')).toBe(0)
    })

    it('should be case sensitive by default', () => {
      const bm = new BoyerMoore('Hello')
      expect(bm.search('hello')).toBe(-1)
      expect(bm.search('Hello')).toBe(0)
    })

    it('should use DEFAULT_BOYER_MOORE_OPTIONS', () => {
      expect(DEFAULT_BOYER_MOORE_OPTIONS.caseSensitive).toBe(true)
    })

    it('should accept partial options', () => {
      const bm = new BoyerMoore('test', {})
      expect(bm.getPattern()).toBe('test')
    })
  })

  describe('search', () => {
    it('should find pattern at the beginning', () => {
      const bm = new BoyerMoore('abc')
      expect(bm.search('abcdef')).toBe(0)
    })

    it('should find pattern in the middle', () => {
      const bm = new BoyerMoore('cde')
      expect(bm.search('abcdef')).toBe(2)
    })

    it('should find pattern at the end', () => {
      const bm = new BoyerMoore('def')
      expect(bm.search('abcdef')).toBe(3)
    })

    it('should return -1 when pattern not found', () => {
      const bm = new BoyerMoore('xyz')
      expect(bm.search('abcdef')).toBe(-1)
    })

    it('should find single character pattern', () => {
      const bm = new BoyerMoore('c')
      expect(bm.search('abcdef')).toBe(2)
    })

    it('should find pattern that equals the text', () => {
      const bm = new BoyerMoore('abc')
      expect(bm.search('abc')).toBe(0)
    })

    it('should return -1 when text is shorter than pattern', () => {
      const bm = new BoyerMoore('abcdef')
      expect(bm.search('abc')).toBe(-1)
    })

    it('should return 0 when pattern is empty', () => {
      const bm = new BoyerMoore('')
      expect(bm.search('abc')).toBe(0)
    })

    it('should return -1 when text is empty and pattern is not', () => {
      const bm = new BoyerMoore('abc')
      expect(bm.search('')).toBe(-1)
    })

    it('should return 0 when both text and pattern are empty', () => {
      const bm = new BoyerMoore('')
      expect(bm.search('')).toBe(0)
    })

    it('should find repeated pattern at first occurrence', () => {
      const bm = new BoyerMoore('abc')
      expect(bm.search('abcabc')).toBe(0)
    })

    it('should handle pattern with repeated characters', () => {
      const bm = new BoyerMoore('aaa')
      expect(bm.search('baaab')).toBe(1)
    })

    it('should find pattern in text with all same characters', () => {
      const bm = new BoyerMoore('aa')
      expect(bm.search('aaaa')).toBe(0)
    })

    it('should handle unicode characters', () => {
      const bm = new BoyerMoore('世界')
      expect(bm.search('你好世界')).toBe(2)
    })

    it('should handle emoji patterns', () => {
      const bm = new BoyerMoore('🎯')
      expect(bm.search('🎯🎯🎯')).toBe(0)
    })

    it('should find pattern with bad character shift', () => {
      const bm = new BoyerMoore('abc')
      expect(bm.search('xbcabc')).toBe(3)
    })

    it('should find pattern with good suffix shift', () => {
      const bm = new BoyerMoore('ABAB')
      expect(bm.search('ABAAABAB')).toBe(4)
    })

    it('should return -1 for pattern longer than text', () => {
      const bm = new BoyerMoore('abcdefg')
      expect(bm.search('abc')).toBe(-1)
    })

    it('should find pattern at exact length match', () => {
      const bm = new BoyerMoore('abc')
      expect(bm.search('abc')).toBe(0)
    })

    it('should handle single char text and single char pattern', () => {
      const bm = new BoyerMoore('a')
      expect(bm.search('a')).toBe(0)
      expect(bm.search('b')).toBe(-1)
    })

    it('should find overlapping potential match correctly', () => {
      const bm = new BoyerMoore('aba')
      expect(bm.search('ababa')).toBe(0)
    })
  })

  describe('search (case insensitive)', () => {
    it('should find pattern ignoring case', () => {
      const bm = new BoyerMoore('abc', { caseSensitive: false })
      expect(bm.search('ABC')).toBe(0)
    })

    it('should find pattern with mixed case', () => {
      const bm = new BoyerMoore('AbC', { caseSensitive: false })
      expect(bm.search('aBcDEF')).toBe(0)
    })

    it('should find pattern in mixed case text', () => {
      const bm = new BoyerMoore('hello', { caseSensitive: false })
      expect(bm.search('HeLLo World')).toBe(0)
    })

    it('should return -1 when pattern not found regardless of case', () => {
      const bm = new BoyerMoore('xyz', { caseSensitive: false })
      expect(bm.search('ABCDEF')).toBe(-1)
    })
  })

  describe('searchAll', () => {
    it('should find all occurrences', () => {
      const bm = new BoyerMoore('ab')
      expect(bm.searchAll('ababab')).toEqual([0, 2, 4])
    })

    it('should return empty array when no matches', () => {
      const bm = new BoyerMoore('xyz')
      expect(bm.searchAll('abcdef')).toEqual([])
    })

    it('should return single match', () => {
      const bm = new BoyerMoore('abc')
      expect(bm.searchAll('xabcx')).toEqual([1])
    })

    it('should return all positions for single character pattern', () => {
      const bm = new BoyerMoore('a')
      expect(bm.searchAll('abacaba')).toEqual([0, 2, 4, 6])
    })

    it('should handle empty pattern by returning all positions', () => {
      const bm = new BoyerMoore('')
      expect(bm.searchAll('abc')).toEqual([0, 1, 2, 3])
    })

    it('should return empty array for empty text with non-empty pattern', () => {
      const bm = new BoyerMoore('abc')
      expect(bm.searchAll('')).toEqual([])
    })

    it('should return all indices for empty pattern and empty text', () => {
      const bm = new BoyerMoore('')
      expect(bm.searchAll('')).toEqual([0])
    })

    it('should not find overlapping occurrences', () => {
      const bm = new BoyerMoore('aaa')
      expect(bm.searchAll('aaaaaa')).toEqual([0, 3])
    })

    it('should handle pattern equal to text', () => {
      const bm = new BoyerMoore('abc')
      expect(bm.searchAll('abc')).toEqual([0])
    })

    it('should find occurrences at beginning and end', () => {
      const bm = new BoyerMoore('abc')
      expect(bm.searchAll('abcxxxabc')).toEqual([0, 6])
    })

    it('should return empty array when text shorter than pattern', () => {
      const bm = new BoyerMoore('abcdef')
      expect(bm.searchAll('abc')).toEqual([])
    })

    it('should handle repeated full matches', () => {
      const bm = new BoyerMoore('abc')
      expect(bm.searchAll('abcabcabc')).toEqual([0, 3, 6])
    })

    it('should work with unicode characters', () => {
      const bm = new BoyerMoore('世')
      expect(bm.searchAll('世界世界')).toEqual([0, 2])
    })
  })

  describe('count', () => {
    it('should count zero occurrences', () => {
      const bm = new BoyerMoore('xyz')
      expect(bm.count('abcdef')).toBe(0)
    })

    it('should count single occurrence', () => {
      const bm = new BoyerMoore('abc')
      expect(bm.count('xabcx')).toBe(1)
    })

    it('should count multiple occurrences', () => {
      const bm = new BoyerMoore('ab')
      expect(bm.count('ababab')).toBe(3)
    })

    it('should count occurrences in text equal to pattern', () => {
      const bm = new BoyerMoore('abc')
      expect(bm.count('abc')).toBe(1)
    })

    it('should return 0 for empty text', () => {
      const bm = new BoyerMoore('abc')
      expect(bm.count('')).toBe(0)
    })

    it('should count with empty pattern', () => {
      const bm = new BoyerMoore('')
      expect(bm.count('abc')).toBe(4)
    })

    it('should count with empty pattern and empty text', () => {
      const bm = new BoyerMoore('')
      expect(bm.count('')).toBe(1)
    })

    it('should count non-overlapping occurrences', () => {
      const bm = new BoyerMoore('aa')
      expect(bm.count('aaaa')).toBe(2)
    })
  })

  describe('contains', () => {
    it('should return true when pattern is found', () => {
      const bm = new BoyerMoore('abc')
      expect(bm.contains('xabcx')).toBe(true)
    })

    it('should return false when pattern is not found', () => {
      const bm = new BoyerMoore('xyz')
      expect(bm.contains('abcdef')).toBe(false)
    })

    it('should return true for empty pattern', () => {
      const bm = new BoyerMoore('')
      expect(bm.contains('anything')).toBe(true)
    })

    it('should return false for empty text with non-empty pattern', () => {
      const bm = new BoyerMoore('abc')
      expect(bm.contains('')).toBe(false)
    })

    it('should return true for empty pattern and empty text', () => {
      const bm = new BoyerMoore('')
      expect(bm.contains('')).toBe(true)
    })

    it('should return true when pattern is at the beginning', () => {
      const bm = new BoyerMoore('abc')
      expect(bm.contains('abcdef')).toBe(true)
    })

    it('should return true when pattern is at the end', () => {
      const bm = new BoyerMoore('def')
      expect(bm.contains('abcdef')).toBe(true)
    })
  })

  describe('getPattern', () => {
    it('should return the pattern', () => {
      const bm = new BoyerMoore('test')
      expect(bm.getPattern()).toBe('test')
    })

    it('should return original pattern preserving case', () => {
      const bm = new BoyerMoore('TeSt', { caseSensitive: false })
      expect(bm.getPattern()).toBe('TeSt')
    })

    it('should return empty string for empty pattern', () => {
      const bm = new BoyerMoore('')
      expect(bm.getPattern()).toBe('')
    })
  })

  describe('setPattern', () => {
    it('should update the pattern', () => {
      const bm = new BoyerMoore('abc')
      bm.setPattern('xyz')
      expect(bm.getPattern()).toBe('xyz')
    })

    it('should search with the new pattern', () => {
      const bm = new BoyerMoore('abc')
      bm.setPattern('def')
      expect(bm.search('abcdef')).toBe(3)
    })

    it('should no longer find old pattern after update', () => {
      const bm = new BoyerMoore('abc')
      bm.setPattern('xyz')
      expect(bm.search('abcdef')).toBe(-1)
    })

    it('should handle setting to empty pattern', () => {
      const bm = new BoyerMoore('abc')
      bm.setPattern('')
      expect(bm.search('anything')).toBe(0)
    })

    it('should handle setting pattern multiple times', () => {
      const bm = new BoyerMoore('a')
      bm.setPattern('b')
      bm.setPattern('c')
      expect(bm.getPattern()).toBe('c')
      expect(bm.search('abc')).toBe(2)
    })

    it('should respect case sensitivity when setting new pattern', () => {
      const bm = new BoyerMoore('abc', { caseSensitive: false })
      bm.setPattern('XYZ')
      expect(bm.search('xyz')).toBe(0)
    })
  })

  describe('static search', () => {
    it('should find pattern in text', () => {
      expect(BoyerMoore.search('hello world', 'world')).toBe(6)
    })

    it('should return -1 when not found', () => {
      expect(BoyerMoore.search('hello', 'world')).toBe(-1)
    })

    it('should find at beginning', () => {
      expect(BoyerMoore.search('abcdef', 'abc')).toBe(0)
    })

    it('should find at end', () => {
      expect(BoyerMoore.search('abcdef', 'def')).toBe(3)
    })

    it('should handle empty pattern', () => {
      expect(BoyerMoore.search('abc', '')).toBe(0)
    })

    it('should handle empty text', () => {
      expect(BoyerMoore.search('', 'abc')).toBe(-1)
    })
  })

  describe('static searchAll', () => {
    it('should find all occurrences', () => {
      expect(BoyerMoore.searchAll('ababab', 'ab')).toEqual([0, 2, 4])
    })

    it('should return empty array when not found', () => {
      expect(BoyerMoore.searchAll('abcdef', 'xyz')).toEqual([])
    })

    it('should return single match', () => {
      expect(BoyerMoore.searchAll('abcdef', 'cde')).toEqual([2])
    })

    it('should handle empty pattern', () => {
      expect(BoyerMoore.searchAll('abc', '')).toEqual([0, 1, 2, 3])
    })
  })

  describe('static count', () => {
    it('should count occurrences', () => {
      expect(BoyerMoore.count('abcabc', 'abc')).toBe(2)
    })

    it('should return 0 when not found', () => {
      expect(BoyerMoore.count('abcdef', 'xyz')).toBe(0)
    })

    it('should count single occurrence', () => {
      expect(BoyerMoore.count('hello world', 'world')).toBe(1)
    })

    it('should handle empty pattern', () => {
      expect(BoyerMoore.count('abc', '')).toBe(4)
    })
  })

  describe('static contains', () => {
    it('should return true when found', () => {
      expect(BoyerMoore.contains('hello world', 'world')).toBe(true)
    })

    it('should return false when not found', () => {
      expect(BoyerMoore.contains('hello', 'world')).toBe(false)
    })

    it('should return true for empty pattern', () => {
      expect(BoyerMoore.contains('anything', '')).toBe(true)
    })
  })

  describe('algorithm correctness', () => {
    it('should correctly use bad character heuristic', () => {
      const bm = new BoyerMoore('needle')
      expect(bm.search('findinganeedle')).toBe(8)
    })

    it('should correctly use good suffix heuristic', () => {
      const bm = new BoyerMoore('anpn')
      expect(bm.search('ananpn')).toBe(2)
    })

    it('should handle pattern with no repeating characters', () => {
      const bm = new BoyerMoore('abcdef')
      expect(bm.search('xyzabcdefxyz')).toBe(3)
    })

    it('should handle pattern with all same characters', () => {
      const bm = new BoyerMoore('aaaa')
      expect(bm.search('baaaab')).toBe(1)
    })

    it('should handle text with all same characters except pattern', () => {
      const bm = new BoyerMoore('ab')
      expect(bm.search('aaaaabaaaa')).toBe(4)
    })

    it('should handle worst case scenario', () => {
      const bm = new BoyerMoore('aaaab')
      expect(bm.search('aaaaaaaaaaaaaab')).toBe(10)
    })

    it('should handle pattern longer than available characters', () => {
      const bm = new BoyerMoore('abcdef')
      expect(bm.search('abc')).toBe(-1)
    })

    it('should handle large jump from bad character', () => {
      const bm = new BoyerMoore('abc')
      expect(bm.search('zzzzzzzzabc')).toBe(8)
    })

    it('should find pattern after multiple mismatches', () => {
      const bm = new BoyerMoore('test')
      expect(bm.search('tsttsttest')).toBe(6)
    })
  })

  describe('edge cases', () => {
    it('should handle pattern with special regex characters', () => {
      const bm = new BoyerMoore('[abc]')
      expect(bm.search('x[abc]y')).toBe(1)
    })

    it('should handle pattern with dots', () => {
      const bm = new BoyerMoore('a.b')
      expect(bm.search('xa.by')).toBe(1)
    })

    it('should handle pattern with asterisks', () => {
      const bm = new BoyerMoore('a*b')
      expect(bm.search('xa*by')).toBe(1)
    })

    it('should handle whitespace patterns', () => {
      const bm = new BoyerMoore(' ')
      expect(bm.search('hello world')).toBe(5)
    })

    it('should handle tab characters', () => {
      const bm = new BoyerMoore('\t')
      expect(bm.search('hello\tworld')).toBe(5)
    })

    it('should handle newline characters', () => {
      const bm = new BoyerMoore('\n')
      expect(bm.search('hello\nworld')).toBe(5)
    })

    it('should handle mixed whitespace', () => {
      const bm = new BoyerMoore(' \t\n')
      expect(bm.search('a \t\nb')).toBe(1)
    })

    it('should handle digits in pattern', () => {
      const bm = new BoyerMoore('123')
      expect(bm.search('abc123def')).toBe(3)
    })

    it('should handle pattern with leading zeros in digit context', () => {
      const bm = new BoyerMoore('0')
      expect(bm.search('10203')).toBe(1)
    })

    it('should handle very long text', () => {
      const text = 'a'.repeat(1000) + 'b'
      const bm = new BoyerMoore('b')
      expect(bm.search(text)).toBe(1000)
    })

    it('should handle very long pattern', () => {
      const pattern = 'a'.repeat(100) + 'b'
      const text = 'x'.repeat(50) + pattern + 'x'.repeat(50)
      const bm = new BoyerMoore(pattern)
      expect(bm.search(text)).toBe(50)
    })

    it('should handle text consisting of pattern repeated', () => {
      const bm = new BoyerMoore('abc')
      expect(bm.searchAll('abcabcabcabc')).toEqual([0, 3, 6, 9])
    })

    it('should handle pattern with only one unique character', () => {
      const bm = new BoyerMoore('aaa')
      expect(bm.searchAll('aaaaa')).toEqual([0])
    })

    it('should handle two-character pattern efficiently', () => {
      const bm = new BoyerMoore('ab')
      expect(bm.searchAll('abababab')).toEqual([0, 2, 4, 6])
    })
  })

  describe('case insensitive operations', () => {
    it('should find all occurrences case insensitively', () => {
      const bm = new BoyerMoore('ab', { caseSensitive: false })
      expect(bm.searchAll('AbBaBb')).toEqual([0, 3])
    })

    it('should count case insensitively', () => {
      const bm = new BoyerMoore('test', { caseSensitive: false })
      expect(bm.count('TESTtestTeSt')).toBe(3)
    })

    it('should check contains case insensitively', () => {
      const bm = new BoyerMoore('hello', { caseSensitive: false })
      expect(bm.contains('HELLO')).toBe(true)
    })

    it('should preserve original pattern case in getPattern', () => {
      const bm = new BoyerMoore('HeLLo', { caseSensitive: false })
      expect(bm.getPattern()).toBe('HeLLo')
    })

    it('should search with updated pattern case insensitively', () => {
      const bm = new BoyerMoore('abc', { caseSensitive: false })
      bm.setPattern('XYZ')
      expect(bm.search('xyz')).toBe(0)
      expect(bm.getPattern()).toBe('XYZ')
    })
  })

  describe('pattern update scenarios', () => {
    it('should work correctly after multiple pattern changes', () => {
      const bm = new BoyerMoore('a')
      expect(bm.search('abc')).toBe(0)
      bm.setPattern('b')
      expect(bm.search('abc')).toBe(1)
      bm.setPattern('c')
      expect(bm.search('abc')).toBe(2)
    })

    it('should count correctly after pattern change', () => {
      const bm = new BoyerMoore('a')
      expect(bm.count('aaa')).toBe(3)
      bm.setPattern('aa')
      expect(bm.count('aaa')).toBe(1)
    })

    it('should searchAll correctly after pattern change', () => {
      const bm = new BoyerMoore('x')
      bm.setPattern('ab')
      expect(bm.searchAll('ababab')).toEqual([0, 2, 4])
    })

    it('should contains correctly after pattern change', () => {
      const bm = new BoyerMoore('xyz')
      bm.setPattern('abc')
      expect(bm.contains('xabcx')).toBe(true)
    })
  })

  describe('BoyerMooreOptions type', () => {
    it('should accept full options object', () => {
      const opts: BoyerMooreOptions = { caseSensitive: true }
      const bm = new BoyerMoore('test', opts)
      expect(bm.getPattern()).toBe('test')
    })
  })

  describe('re-exported types', () => {
    it('should export DEFAULT_BOYER_MOORE_OPTIONS from module', () => {
      expect(DEFAULT_BOYER_MOORE_OPTIONS).toBeDefined()
      expect(DEFAULT_BOYER_MOORE_OPTIONS.caseSensitive).toBe(true)
    })
  })

  describe('additional search correctness', () => {
    it('should find pattern after multiple bad character skips', () => {
      const bm = new BoyerMoore('world')
      expect(bm.search('xxxxxworld')).toBe(5)
    })

    it('should handle pattern at position 0 with no prior chars', () => {
      const bm = new BoyerMoore('start')
      expect(bm.search('start of something')).toBe(0)
    })

    it('should find pattern when text is exactly the pattern', () => {
      const bm = new BoyerMoore('exact')
      expect(bm.search('exact')).toBe(0)
      expect(bm.count('exact')).toBe(1)
    })

    it('should handle two-character patterns', () => {
      const bm = new BoyerMoore('xy')
      expect(bm.searchAll('xyxyxy')).toEqual([0, 2, 4])
    })

    it('should handle three-character patterns', () => {
      const bm = new BoyerMoore('abc')
      expect(bm.searchAll('abcabc')).toEqual([0, 3])
    })

    it('should handle single-character searchAll', () => {
      const bm = new BoyerMoore('a')
      expect(bm.searchAll('banana')).toEqual([1, 3, 5])
    })

    it('should return -1 for completely different strings', () => {
      const bm = new BoyerMoore('zzz')
      expect(bm.search('abcabc')).toBe(-1)
    })

    it('should find pattern in long repetitive text', () => {
      const text = 'ab'.repeat(500) + 'xyz'
      const bm = new BoyerMoore('xyz')
      expect(bm.search(text)).toBe(1000)
    })

    it('should handle pattern with last char unique', () => {
      const bm = new BoyerMoore('abcz')
      expect(bm.search('abcabcz')).toBe(3)
    })

    it('should handle pattern with first char unique', () => {
      const bm = new BoyerMoore('zabc')
      expect(bm.search('abzabc')).toBe(2)
    })

    it('should handle good suffix for ANPANMAN example', () => {
      const bm = new BoyerMoore('PAN')
      expect(bm.search('ANPANMAN')).toBe(2)
    })
  })

  describe('static method edge cases', () => {
    it('static search with empty text and empty pattern', () => {
      expect(BoyerMoore.search('', '')).toBe(0)
    })

    it('static searchAll with empty text and empty pattern', () => {
      expect(BoyerMoore.searchAll('', '')).toEqual([0])
    })

    it('static count with empty text and empty pattern', () => {
      expect(BoyerMoore.count('', '')).toBe(1)
    })

    it('static contains with empty text and empty pattern', () => {
      expect(BoyerMoore.contains('', '')).toBe(true)
    })

    it('static search with longer pattern than text', () => {
      expect(BoyerMoore.search('ab', 'abcdef')).toBe(-1)
    })

    it('static searchAll with no matches', () => {
      expect(BoyerMoore.searchAll('abcdef', 'zzz')).toEqual([])
    })

    it('static count with multiple matches', () => {
      expect(BoyerMoore.count('abababab', 'ab')).toBe(4)
    })

    it('static contains with match at end', () => {
      expect(BoyerMoore.contains('hello world', 'world')).toBe(true)
    })

    it('static contains without match', () => {
      expect(BoyerMoore.contains('hello', 'world')).toBe(false)
    })

    it('static searchAll with single char pattern', () => {
      expect(BoyerMoore.searchAll('aaa', 'a')).toEqual([0, 1, 2])
    })

    it('static count with empty pattern', () => {
      expect(BoyerMoore.count('abc', '')).toBe(4)
    })
  })

  describe('setPattern advanced', () => {
    it('should rebuild tables correctly on pattern change', () => {
      const bm = new BoyerMoore('abc')
      expect(bm.search('xyzabc')).toBe(3)
      bm.setPattern('xyz')
      expect(bm.search('xyzabc')).toBe(0)
      expect(bm.search('abc')).toBe(-1)
    })

    it('should handle setting pattern to longer string', () => {
      const bm = new BoyerMoore('a')
      bm.setPattern('abcdefgh')
      expect(bm.search('xyzabcdefgh')).toBe(3)
    })

    it('should handle setting pattern to shorter string', () => {
      const bm = new BoyerMoore('abcdefgh')
      bm.setPattern('a')
      expect(bm.search('xyzabc')).toBe(3)
    })

    it('should preserve case sensitivity option on setPattern', () => {
      const bm = new BoyerMoore('ABC', { caseSensitive: true })
      bm.setPattern('XYZ')
      expect(bm.search('xyz')).toBe(-1)
      expect(bm.search('XYZ')).toBe(0)
    })
  })

  describe('special characters and encoding', () => {
    it('should handle pattern with parentheses', () => {
      const bm = new BoyerMoore('(test)')
      expect(bm.search('a(test)b')).toBe(1)
    })

    it('should handle pattern with braces', () => {
      const bm = new BoyerMoore('{key}')
      expect(bm.search('x{key}y')).toBe(1)
    })

    it('should handle pattern with backslash', () => {
      const bm = new BoyerMoore('\\n')
      expect(bm.search('a\\nb')).toBe(1)
    })

    it('should handle pattern with plus sign', () => {
      const bm = new BoyerMoore('a+b')
      expect(bm.search('xa+by')).toBe(1)
    })

    it('should handle pattern with question mark', () => {
      const bm = new BoyerMoore('a?b')
      expect(bm.search('xa?by')).toBe(1)
    })

    it('should handle pattern with dollar sign', () => {
      const bm = new BoyerMoore('$100')
      expect(bm.search('price$100')).toBe(5)
    })

    it('should handle pattern with caret', () => {
      const bm = new BoyerMoore('^start')
      expect(bm.search('a^startb')).toBe(1)
    })

    it('should handle pattern with pipe', () => {
      const bm = new BoyerMoore('a|b')
      expect(bm.search('xa|by')).toBe(1)
    })

    it('should handle mixed emoji', () => {
      const bm = new BoyerMoore('🎉🎊')
      expect(bm.search('hi🎉🎊bye')).toBe(2)
    })

    it('should handle japanese characters', () => {
      const bm = new BoyerMoore('にち')
      expect(bm.search('こんにちはちは')).toBe(2)
    })
  })
})
