import { describe, expect, it } from 'vitest'
import { SuffixArray } from '../../../src/core/suffix-array/suffix-array.js'

describe('SuffixArray', () => {
  describe('construction', () => {
    it('constructs with empty string', () => {
      const sa = new SuffixArray('')
      expect(sa.length()).toBe(0)
      expect(sa.isEmpty()).toBe(true)
      expect(sa.getArray()).toEqual([])
    })

    it('constructs with single character', () => {
      const sa = new SuffixArray('a')
      expect(sa.length()).toBe(1)
      expect(sa.isEmpty()).toBe(false)
      expect(sa.getArray()).toEqual([0])
      expect(sa.getText()).toBe('a')
    })

    it('constructs with simple string', () => {
      const sa = new SuffixArray('banana')
      expect(sa.length()).toBe(6)
      expect(sa.isEmpty()).toBe(false)
      expect(sa.getArray().length).toBe(6)
    })

    it('constructs with repeated characters', () => {
      const sa = new SuffixArray('aaaa')
      expect(sa.length()).toBe(4)
      expect(sa.getArray().length).toBe(4)
    })

    it('constructs with case insensitive option', () => {
      const sa = new SuffixArray('AbC', { caseSensitive: false })
      expect(sa.getText()).toBe('AbC')
    })

    it('constructs with case sensitive option', () => {
      const sa = new SuffixArray('AbC', { caseSensitive: true })
      expect(sa.getText()).toBe('AbC')
    })

    it('constructs with long string', () => {
      const sa = new SuffixArray('abcdefghijklmnopqrstuvwxyz')
      expect(sa.length()).toBe(26)
      expect(sa.isEmpty()).toBe(false)
    })
  })

  describe('search', () => {
    it('returns empty array for empty pattern', () => {
      const sa = new SuffixArray('banana')
      expect(sa.search('')).toEqual([])
    })

    it('finds single occurrence', () => {
      const sa = new SuffixArray('banana')
      const results = sa.search('ana')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds multiple occurrences', () => {
      const sa = new SuffixArray('banana')
      const results = sa.search('a')
      expect(results.length).toBe(3)
    })

    it('returns empty for non-existent pattern', () => {
      const sa = new SuffixArray('banana')
      expect(sa.search('xyz')).toEqual([])
    })

    it('finds pattern longer than text', () => {
      const sa = new SuffixArray('hi')
      expect(sa.search('hello')).toEqual([])
    })

    it('finds pattern at beginning', () => {
      const sa = new SuffixArray('banana')
      const results = sa.search('b')
      expect(results).toContain(0)
    })

    it('finds pattern at end', () => {
      const sa = new SuffixArray('banana')
      const results = sa.search('a')
      expect(results).toContain(5)
    })

    it('finds full text', () => {
      const sa = new SuffixArray('test')
      const results = sa.search('test')
      expect(results).toEqual([0])
    })

    it('handles case sensitive search', () => {
      const sa = new SuffixArray('AbC', { caseSensitive: true })
      expect(sa.search('a')).toEqual([])
      expect(sa.search('A')).toContain(0)
    })

    it('handles case insensitive search', () => {
      const sa = new SuffixArray('AbC', { caseSensitive: false })
      expect(sa.search('a')).toContain(0)
    })
  })

  describe('contains', () => {
    it('returns false for empty pattern', () => {
      const sa = new SuffixArray('banana')
      expect(sa.contains('')).toBe(false)
    })

    it('returns true for existing pattern', () => {
      const sa = new SuffixArray('banana')
      expect(sa.contains('ana')).toBe(true)
    })

    it('returns false for non-existent pattern', () => {
      const sa = new SuffixArray('banana')
      expect(sa.contains('xyz')).toBe(false)
    })

    it('returns true for single character', () => {
      const sa = new SuffixArray('banana')
      expect(sa.contains('b')).toBe(true)
    })

    it('returns false for pattern longer than text', () => {
      const sa = new SuffixArray('hi')
      expect(sa.contains('hello')).toBe(false)
    })
  })

  describe('count', () => {
    it('returns 0 for empty pattern', () => {
      const sa = new SuffixArray('banana')
      expect(sa.count('')).toBe(0)
    })

    it('counts single occurrence', () => {
      const sa = new SuffixArray('banana')
      expect(sa.count('n')).toBe(2)
    })

    it('counts multiple occurrences', () => {
      const sa = new SuffixArray('banana')
      expect(sa.count('a')).toBe(3)
    })

    it('counts all occurrences of repeated character', () => {
      const sa = new SuffixArray('aaaa')
      expect(sa.count('a')).toBe(4)
    })

    it('returns 0 for non-existent pattern', () => {
      const sa = new SuffixArray('banana')
      expect(sa.count('xyz')).toBe(0)
    })
  })

  describe('longestCommonPrefix', () => {
    it('returns empty array for empty string', () => {
      const sa = new SuffixArray('')
      expect(sa.longestCommonPrefix()).toEqual([])
    })

    it('returns array with correct length', () => {
      const sa = new SuffixArray('banana')
      const lcp = sa.longestCommonPrefix()
      expect(lcp.length).toBe(6)
    })

    it('first element is always 0', () => {
      const sa = new SuffixArray('banana')
      const lcp = sa.longestCommonPrefix()
      expect(lcp[0]).toBe(0)
    })

    it('handles single character', () => {
      const sa = new SuffixArray('a')
      const lcp = sa.longestCommonPrefix()
      expect(lcp).toEqual([0])
    })

    it('computes LCP for repeated characters', () => {
      const sa = new SuffixArray('aaaa')
      const lcp = sa.longestCommonPrefix()
      expect(lcp.length).toBe(4)
    })
  })

  describe('longestRepeatedSubstring', () => {
    it('returns empty string for empty text', () => {
      const sa = new SuffixArray('')
      expect(sa.longestRepeatedSubstring()).toBe('')
    })

    it('returns empty string for single character', () => {
      const sa = new SuffixArray('a')
      expect(sa.longestRepeatedSubstring()).toBe('')
    })

    it('returns empty string for unique characters', () => {
      const sa = new SuffixArray('abcd')
      expect(sa.longestRepeatedSubstring()).toBe('')
    })

    it('finds repeated substring', () => {
      const sa = new SuffixArray('banana')
      const lrs = sa.longestRepeatedSubstring()
      expect(lrs.length).toBeGreaterThan(0)
    })

    it('finds longest repeated substring for repeats', () => {
      const sa = new SuffixArray('ababa')
      const lrs = sa.longestRepeatedSubstring()
      expect(lrs.length).toBeGreaterThan(0)
    })
  })

  describe('getSuffix', () => {
    it('returns correct suffix', () => {
      const sa = new SuffixArray('banana')
      const arr = sa.getArray()
      const suffixStart = arr[0]!
      expect(sa.getSuffix(0)).toBe(sa.getText().slice(suffixStart))
    })

    it('returns suffix for last index', () => {
      const sa = new SuffixArray('test')
      const arr = sa.getArray()
      const suffixStart = arr[arr.length - 1]!
      expect(sa.getSuffix(arr.length - 1)).toBe(sa.getText().slice(suffixStart))
    })

    it('throws for negative index', () => {
      const sa = new SuffixArray('test')
      expect(() => sa.getSuffix(-1)).toThrow(RangeError)
    })

    it('throws for out of bounds index', () => {
      const sa = new SuffixArray('test')
      expect(() => sa.getSuffix(10)).toThrow(RangeError)
    })

    it('handles empty array', () => {
      const sa = new SuffixArray('')
      expect(() => sa.getSuffix(0)).toThrow(RangeError)
    })
  })

  describe('getArray', () => {
    it('returns copy of suffix array', () => {
      const sa = new SuffixArray('banana')
      const arr1 = sa.getArray()
      const arr2 = sa.getArray()
      expect(arr1).toEqual(arr2)
      expect(arr1).not.toBe(arr2)
    })

    it('returns empty array for empty text', () => {
      const sa = new SuffixArray('')
      expect(sa.getArray()).toEqual([])
    })

    it('returns array of correct length', () => {
      const sa = new SuffixArray('test')
      const arr = sa.getArray()
      expect(arr.length).toBe(4)
    })
  })

  describe('length', () => {
    it('returns 0 for empty string', () => {
      const sa = new SuffixArray('')
      expect(sa.length()).toBe(0)
    })

    it('returns length of text', () => {
      const sa = new SuffixArray('banana')
      expect(sa.length()).toBe(6)
    })

    it('returns 1 for single character', () => {
      const sa = new SuffixArray('a')
      expect(sa.length()).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('returns true for empty string', () => {
      const sa = new SuffixArray('')
      expect(sa.isEmpty()).toBe(true)
    })

    it('returns false for non-empty string', () => {
      const sa = new SuffixArray('a')
      expect(sa.isEmpty()).toBe(false)
    })

    it('returns false for longer string', () => {
      const sa = new SuffixArray('banana')
      expect(sa.isEmpty()).toBe(false)
    })
  })

  describe('getText', () => {
    it('returns original text', () => {
      const sa = new SuffixArray('banana')
      expect(sa.getText()).toBe('banana')
    })

    it('returns empty string for empty input', () => {
      const sa = new SuffixArray('')
      expect(sa.getText()).toBe('')
    })

    it('preserves original case', () => {
      const sa = new SuffixArray('AbCdEf')
      expect(sa.getText()).toBe('AbCdEf')
    })
  })
})