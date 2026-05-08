import { describe, it, expect } from 'vitest'
import { SuffixArray } from '../../src/core/suffix-array/suffix-array.js'
import { DEFAULT_SUFFIX_ARRAY_OPTIONS } from '../../src/core/suffix-array/types.js'
import type { SuffixArrayOptions, MatchResult } from '../../src/core/suffix-array/types.js'

describe('SuffixArray', () => {
  describe('constructor', () => {
    it('should create suffix array from a string', () => {
      const sa = new SuffixArray('banana')
      expect(sa.length()).toBe(6)
    })

    it('should create suffix array from empty string', () => {
      const sa = new SuffixArray('')
      expect(sa.length()).toBe(0)
      expect(sa.isEmpty()).toBe(true)
    })

    it('should create suffix array from single character', () => {
      const sa = new SuffixArray('a')
      expect(sa.length()).toBe(1)
    })

    it('should use default options (caseSensitive: true)', () => {
      expect(DEFAULT_SUFFIX_ARRAY_OPTIONS.caseSensitive).toBe(true)
    })

    it('should accept caseSensitive: false option', () => {
      const sa = new SuffixArray('Banana', { caseSensitive: false })
      expect(sa.contains('banana')).toBe(true)
      expect(sa.contains('BANANA')).toBe(true)
    })

    it('should accept partial options', () => {
      const sa = new SuffixArray('hello', {})
      expect(sa.length()).toBe(5)
    })

    it('should be case sensitive by default', () => {
      const sa = new SuffixArray('Hello')
      expect(sa.contains('hello')).toBe(false)
      expect(sa.contains('Hello')).toBe(true)
    })
  })

  describe('getArray', () => {
    it('should return sorted suffix indices for banana', () => {
      const sa = new SuffixArray('banana')
      const arr = sa.getArray()
      expect(arr.length).toBe(6)
      const suffixes = arr.map(i => 'banana'.slice(i))
      for (let i = 1; i < suffixes.length; i++) {
        expect(suffixes[i]! >= suffixes[i - 1]!).toBe(true)
      }
    })

    it('should return empty array for empty string', () => {
      const sa = new SuffixArray('')
      expect(sa.getArray()).toEqual([])
    })

    it('should return [0] for single character', () => {
      const sa = new SuffixArray('x')
      expect(sa.getArray()).toEqual([0])
    })

    it('should return a copy of the array', () => {
      const sa = new SuffixArray('abc')
      const arr = sa.getArray()
      arr[0] = 999
      expect(sa.getArray()[0]).not.toBe(999)
    })

    it('should correctly sort identical characters', () => {
      const sa = new SuffixArray('aaaa')
      const arr = sa.getArray()
      const suffixes = arr.map(i => 'aaaa'.slice(i))
      for (let i = 1; i < suffixes.length; i++) {
        expect(suffixes[i]! >= suffixes[i - 1]!).toBe(true)
      }
    })

    it('should correctly sort reversed string', () => {
      const sa = new SuffixArray('dcba')
      expect(sa.getArray()).toEqual([3, 2, 1, 0])
    })
  })

  describe('getSuffix', () => {
    it('should return suffix at given sorted position', () => {
      const sa = new SuffixArray('banana')
      const suffixes = ['a', 'ana', 'anana', 'banana', 'na', 'nana']
      for (let i = 0; i < 6; i++) {
        expect(suffixes).toContain(sa.getSuffix(i))
      }
    })

    it('should return full text at position where suffix starts at 0', () => {
      const sa = new SuffixArray('abc')
      const suffixes = sa.getArray().map(i => sa.getSuffix(sa.getArray().indexOf(i)))
      expect(suffixes).toContain('abc')
    })

    it('should throw for negative index', () => {
      const sa = new SuffixArray('abc')
      expect(() => sa.getSuffix(-1)).toThrow(RangeError)
    })

    it('should throw for index >= length', () => {
      const sa = new SuffixArray('abc')
      expect(() => sa.getSuffix(3)).toThrow(RangeError)
    })

    it('should throw for empty string', () => {
      const sa = new SuffixArray('')
      expect(() => sa.getSuffix(0)).toThrow(RangeError)
    })

    it('should return single char suffix for last position', () => {
      const sa = new SuffixArray('abc')
      const arr = sa.getArray()
      const lastIdx = arr[arr.length - 1]!
      expect(sa.getText().slice(lastIdx)).toBe('c')
    })
  })

  describe('search', () => {
    it('should find all occurrences of a pattern', () => {
      const sa = new SuffixArray('banana')
      expect(sa.search('ana')).toEqual([1, 3])
    })

    it('should find single occurrence', () => {
      const sa = new SuffixArray('banana')
      expect(sa.search('ban')).toEqual([0])
    })

    it('should return empty for non-existent pattern', () => {
      const sa = new SuffixArray('banana')
      expect(sa.search('xyz')).toEqual([])
    })

    it('should find single character', () => {
      const sa = new SuffixArray('banana')
      expect(sa.search('b')).toEqual([0])
    })

    it('should find all occurrences of a single character', () => {
      const sa = new SuffixArray('banana')
      expect(sa.search('a')).toEqual([1, 3, 5])
    })

    it('should find pattern at the end', () => {
      const sa = new SuffixArray('banana')
      expect(sa.search('na')).toEqual([2, 4])
    })

    it('should find the entire string', () => {
      const sa = new SuffixArray('banana')
      expect(sa.search('banana')).toEqual([0])
    })

    it('should return empty for pattern longer than text', () => {
      const sa = new SuffixArray('hi')
      expect(sa.search('hello world')).toEqual([])
    })

    it('should return empty for empty pattern', () => {
      const sa = new SuffixArray('banana')
      expect(sa.search('')).toEqual([])
    })

    it('should handle overlapping matches', () => {
      const sa = new SuffixArray('aaaa')
      expect(sa.search('aa')).toEqual([0, 1, 2])
    })

    it('should find pattern in single character text', () => {
      const sa = new SuffixArray('a')
      expect(sa.search('a')).toEqual([0])
    })

    it('should not find non-matching single char', () => {
      const sa = new SuffixArray('a')
      expect(sa.search('b')).toEqual([])
    })

    it('should be case sensitive by default', () => {
      const sa = new SuffixArray('HelloWorld')
      expect(sa.search('hello')).toEqual([])
      expect(sa.search('Hello')).toEqual([0])
    })

    it('should be case insensitive when option set', () => {
      const sa = new SuffixArray('HelloWorld', { caseSensitive: false })
      expect(sa.search('hello')).toEqual([0])
      expect(sa.search('HELLO')).toEqual([0])
      expect(sa.search('world')).toEqual([5])
    })
  })

  describe('contains', () => {
    it('should return true for existing pattern', () => {
      const sa = new SuffixArray('banana')
      expect(sa.contains('ana')).toBe(true)
    })

    it('should return false for non-existent pattern', () => {
      const sa = new SuffixArray('banana')
      expect(sa.contains('xyz')).toBe(false)
    })

    it('should return true for entire string', () => {
      const sa = new SuffixArray('hello')
      expect(sa.contains('hello')).toBe(true)
    })

    it('should return false for empty pattern', () => {
      const sa = new SuffixArray('hello')
      expect(sa.contains('')).toBe(false)
    })

    it('should return true for single character', () => {
      const sa = new SuffixArray('banana')
      expect(sa.contains('b')).toBe(true)
      expect(sa.contains('n')).toBe(true)
      expect(sa.contains('a')).toBe(true)
    })

    it('should return false for character not in text', () => {
      const sa = new SuffixArray('banana')
      expect(sa.contains('z')).toBe(false)
    })

    it('should return false for pattern longer than text', () => {
      const sa = new SuffixArray('hi')
      expect(sa.contains('hello')).toBe(false)
    })
  })

  describe('count', () => {
    it('should count occurrences correctly', () => {
      const sa = new SuffixArray('banana')
      expect(sa.count('ana')).toBe(2)
      expect(sa.count('na')).toBe(2)
      expect(sa.count('a')).toBe(3)
    })

    it('should return 0 for non-existent pattern', () => {
      const sa = new SuffixArray('banana')
      expect(sa.count('xyz')).toBe(0)
    })

    it('should return 0 for empty pattern', () => {
      const sa = new SuffixArray('banana')
      expect(sa.count('')).toBe(0)
    })

    it('should return 1 for unique pattern', () => {
      const sa = new SuffixArray('banana')
      expect(sa.count('ban')).toBe(1)
    })

    it('should count overlapping matches', () => {
      const sa = new SuffixArray('aaaa')
      expect(sa.count('aa')).toBe(3)
    })

    it('should count in single character text', () => {
      const sa = new SuffixArray('a')
      expect(sa.count('a')).toBe(1)
    })

    it('should handle repeated string', () => {
      const sa = new SuffixArray('abcabcabc')
      expect(sa.count('abc')).toBe(3)
    })
  })

  describe('longestCommonPrefix', () => {
    it('should return empty array for empty string', () => {
      const sa = new SuffixArray('')
      expect(sa.longestCommonPrefix()).toEqual([])
    })

    it('should return [0] for single character', () => {
      const sa = new SuffixArray('a')
      expect(sa.longestCommonPrefix()).toEqual([0])
    })

    it('should compute LCP correctly for banana', () => {
      const sa = new SuffixArray('banana')
      const lcp = sa.longestCommonPrefix()
      expect(lcp.length).toBe(6)
      expect(lcp[0]).toBe(0)
      const maxLcp = Math.max(...lcp)
      expect(maxLcp).toBeGreaterThan(0)
    })

    it('should have first element as 0', () => {
      const sa = new SuffixArray('abcdef')
      const lcp = sa.longestCommonPrefix()
      expect(lcp[0]).toBe(0)
    })

    it('should return all zeros for unique characters', () => {
      const sa = new SuffixArray('abcdef')
      const lcp = sa.longestCommonPrefix()
      const allZero = lcp.every(v => v === 0)
      expect(allZero).toBe(true)
    })

    it('should detect common prefix between suffixes', () => {
      const sa = new SuffixArray('aabaa')
      const lcp = sa.longestCommonPrefix()
      const hasNonZero = lcp.some(v => v > 0)
      expect(hasNonZero).toBe(true)
    })

    it('should return correct LCP for identical characters', () => {
      const sa = new SuffixArray('aaaa')
      const lcp = sa.longestCommonPrefix()
      expect(lcp.length).toBe(4)
      const maxLcp = Math.max(...lcp)
      expect(maxLcp).toBe(3)
    })
  })

  describe('longestRepeatedSubstring', () => {
    it('should find longest repeated substring', () => {
      const sa = new SuffixArray('banana')
      const lrs = sa.longestRepeatedSubstring()
      expect(lrs.length).toBeGreaterThan(0)
      expect('banana'.includes(lrs)).toBe(true)
    })

    it('should return empty string for unique characters', () => {
      const sa = new SuffixArray('abcdef')
      expect(sa.longestRepeatedSubstring()).toBe('')
    })

    it('should return empty string for empty input', () => {
      const sa = new SuffixArray('')
      expect(sa.longestRepeatedSubstring()).toBe('')
    })

    it('should return empty string for single character', () => {
      const sa = new SuffixArray('a')
      expect(sa.longestRepeatedSubstring()).toBe('')
    })

    it('should find repeated single char', () => {
      const sa = new SuffixArray('abab')
      expect(sa.longestRepeatedSubstring()).toBe('ab')
    })

    it('should find longest in string with multiple repeats', () => {
      const sa = new SuffixArray('abcabcab')
      const lrs = sa.longestRepeatedSubstring()
      expect(lrs.length).toBeGreaterThanOrEqual(3)
    })

    it('should find repeated substring in all-same chars', () => {
      const sa = new SuffixArray('aaaa')
      expect(sa.longestRepeatedSubstring()).toBe('aaa')
    })

    it('should return a substring that appears at least twice', () => {
      const sa = new SuffixArray('mississippi')
      const lrs = sa.longestRepeatedSubstring()
      expect(lrs.length).toBeGreaterThan(0)
      const firstIdx = 'mississippi'.indexOf(lrs)
      const secondIdx = 'mississippi'.indexOf(lrs, firstIdx + 1)
      expect(secondIdx).toBeGreaterThan(-1)
    })
  })

  describe('getText', () => {
    it('should return the original text', () => {
      const sa = new SuffixArray('banana')
      expect(sa.getText()).toBe('banana')
    })

    it('should return empty string for empty input', () => {
      const sa = new SuffixArray('')
      expect(sa.getText()).toBe('')
    })

    it('should preserve original case', () => {
      const sa = new SuffixArray('HelloWorld', { caseSensitive: false })
      expect(sa.getText()).toBe('HelloWorld')
    })

    it('should preserve special characters', () => {
      const sa = new SuffixArray('a\nb\tc')
      expect(sa.getText()).toBe('a\nb\tc')
    })
  })

  describe('length', () => {
    it('should return text length', () => {
      const sa = new SuffixArray('banana')
      expect(sa.length()).toBe(6)
    })

    it('should return 0 for empty string', () => {
      const sa = new SuffixArray('')
      expect(sa.length()).toBe(0)
    })

    it('should return 1 for single character', () => {
      const sa = new SuffixArray('a')
      expect(sa.length()).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty string', () => {
      const sa = new SuffixArray('')
      expect(sa.isEmpty()).toBe(true)
    })

    it('should return false for non-empty string', () => {
      const sa = new SuffixArray('a')
      expect(sa.isEmpty()).toBe(false)
    })

    it('should return false for multi-char string', () => {
      const sa = new SuffixArray('abc')
      expect(sa.isEmpty()).toBe(false)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_SUFFIX_ARRAY_OPTIONS', () => {
      expect(DEFAULT_SUFFIX_ARRAY_OPTIONS.caseSensitive).toBe(true)
    })

    it('should support SuffixArrayOptions interface', () => {
      const opts: SuffixArrayOptions = { caseSensitive: false }
      expect(opts.caseSensitive).toBe(false)
    })

    it('should support MatchResult interface', () => {
      const mr: MatchResult = { index: 0, length: 5 }
      expect(mr.index).toBe(0)
      expect(mr.length).toBe(5)
    })
  })

  describe('edge cases', () => {
    it('should handle string with spaces', () => {
      const sa = new SuffixArray('hello world')
      expect(sa.contains('hello')).toBe(true)
      expect(sa.contains('world')).toBe(true)
      expect(sa.contains('lo w')).toBe(true)
    })

    it('should handle string with special characters', () => {
      const sa = new SuffixArray('a!b@c#')
      expect(sa.contains('!b@')).toBe(true)
    })

    it('should handle string with numbers', () => {
      const sa = new SuffixArray('abc123abc')
      expect(sa.count('abc')).toBe(2)
      expect(sa.contains('123')).toBe(true)
    })

    it('should handle unicode characters', () => {
      const sa = new SuffixArray('café')
      expect(sa.contains('café')).toBe(true)
      expect(sa.length()).toBe(4)
    })

    it('should handle repeated single character', () => {
      const sa = new SuffixArray('zzzzz')
      expect(sa.count('z')).toBe(5)
      expect(sa.count('zz')).toBe(4)
      expect(sa.count('zzz')).toBe(3)
    })

    it('should handle pattern matching at very start', () => {
      const sa = new SuffixArray('abcdefgh')
      expect(sa.search('abc')).toEqual([0])
    })

    it('should handle pattern matching at very end', () => {
      const sa = new SuffixArray('abcdefgh')
      expect(sa.search('fgh')).toEqual([5])
    })

    it('should handle string with newlines', () => {
      const sa = new SuffixArray('line1\nline2\nline3')
      expect(sa.count('line')).toBe(3)
      expect(sa.contains('\n')).toBe(true)
    })

    it('should handle two-character string', () => {
      const sa = new SuffixArray('ab')
      expect(sa.length()).toBe(2)
      expect(sa.contains('a')).toBe(true)
      expect(sa.contains('b')).toBe(true)
      expect(sa.contains('c')).toBe(false)
    })
  })

  describe('suffix array correctness', () => {
    it('should produce lexicographically sorted suffixes for abc', () => {
      const sa = new SuffixArray('abc')
      const arr = sa.getArray()
      const suffixes = arr.map(i => 'abc'.slice(i))
      expect(suffixes).toEqual(['abc', 'bc', 'c'])
    })

    it('should produce lexicographically sorted suffixes for cba', () => {
      const sa = new SuffixArray('cba')
      const arr = sa.getArray()
      const suffixes = arr.map(i => 'cba'.slice(i))
      expect(suffixes).toEqual(['a', 'ba', 'cba'])
    })

    it('should correctly sort suffixes with common prefixes', () => {
      const sa = new SuffixArray('abab')
      const arr = sa.getArray()
      const suffixes = arr.map(i => 'abab'.slice(i))
      for (let i = 1; i < suffixes.length; i++) {
        expect(suffixes[i]! >= suffixes[i - 1]!).toBe(true)
      }
    })

    it('should correctly handle all same characters', () => {
      const sa = new SuffixArray('bbb')
      const arr = sa.getArray()
      expect(arr).toEqual([2, 1, 0])
    })

    it('should handle long string with pattern', () => {
      const text = 'the quick brown fox jumps over the lazy dog'
      const sa = new SuffixArray(text)
      expect(sa.contains('quick')).toBe(true)
      expect(sa.contains('fox')).toBe(true)
      expect(sa.contains('lazy')).toBe(true)
      expect(sa.search('the')).toEqual([0, 31])
    })
  })

  describe('case insensitive mode', () => {
    it('should find patterns ignoring case', () => {
      const sa = new SuffixArray('Hello World', { caseSensitive: false })
      expect(sa.search('hello')).toEqual([0])
      expect(sa.search('WORLD')).toEqual([6])
      expect(sa.search('Lo w')).toEqual([3])
    })

    it('should count ignoring case', () => {
      const sa = new SuffixArray('AbCABC', { caseSensitive: false })
      expect(sa.count('abc')).toBe(2)
    })

    it('should return original text from getText', () => {
      const sa = new SuffixArray('Hello', { caseSensitive: false })
      expect(sa.getText()).toBe('Hello')
    })

    it('should handle longest repeated substring ignoring case', () => {
      const sa = new SuffixArray('aAbB', { caseSensitive: false })
      expect(sa.longestRepeatedSubstring().length).toBeGreaterThan(0)
    })

    it('should handle contains ignoring case', () => {
      const sa = new SuffixArray('JavaScript', { caseSensitive: false })
      expect(sa.contains('javascript')).toBe(true)
      expect(sa.contains('JAVASCRIPT')).toBe(true)
      expect(sa.contains('Java')).toBe(true)
    })
  })

  describe('large strings', () => {
    it('should handle 1000 character string', () => {
      const text = 'ab'.repeat(500)
      const sa = new SuffixArray(text)
      expect(sa.length()).toBe(1000)
      expect(sa.count('ab')).toBe(500)
    })

    it('should handle searching in long string', () => {
      const text = 'a'.repeat(100) + 'b' + 'a'.repeat(100)
      const sa = new SuffixArray(text)
      expect(sa.search('b')).toEqual([100])
    })

    it('should handle LCP on longer strings', () => {
      const text = 'abcabcabcabc'
      const sa = new SuffixArray(text)
      const lcp = sa.longestCommonPrefix()
      const maxLcp = Math.max(...lcp)
      expect(maxLcp).toBeGreaterThanOrEqual(6)
    })
  })
})
