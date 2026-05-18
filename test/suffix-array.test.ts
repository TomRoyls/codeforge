import { beforeEach, describe, expect, it } from 'vitest'
import { SuffixArray } from '../src/utils/suffix-array.js'

describe('SuffixArray', () => {
  let sa: SuffixArray

  // ─── constructor ───

  describe('constructor', () => {
    it('should build from a string', () => {
      const s = new SuffixArray('banana')
      expect(s.length).toBe(6)
    })
  })

  // ─── length ───

  describe('length', () => {
    it('should return text length', () => {
      sa = new SuffixArray('banana')
      expect(sa.length).toBe(6)
    })
  })

  // ─── index ───

  describe('index', () => {
    beforeEach(() => {
      sa = new SuffixArray('banana')
    })

    it('should return starting position of i-th smallest suffix', () => {
      // Sorted suffixes of "banana": a, ana, anana, banana, na, nana
      // Indices:                    5, 3,   1,     0,      4,  2
      expect(sa.index(0)).toBe(5)
      expect(sa.index(1)).toBe(3)
      expect(sa.index(2)).toBe(1)
      expect(sa.index(3)).toBe(0)
      expect(sa.index(4)).toBe(4)
      expect(sa.index(5)).toBe(2)
    })

    it('should throw RangeError for out of bounds', () => {
      expect(() => sa.index(-1)).toThrow(RangeError)
      expect(() => sa.index(6)).toThrow(RangeError)
      expect(() => sa.index(100)).toThrow(RangeError)
    })
  })

  // ─── toArray ───

  describe('toArray', () => {
    it('should return all indices in sorted suffix order', () => {
      sa = new SuffixArray('banana')
      expect(sa.toArray()).toEqual([5, 3, 1, 0, 4, 2])
    })
  })

  // ─── lcp ───

  describe('lcp', () => {
    it('should return correct LCP values for "banana"', () => {
      sa = new SuffixArray('banana')
      // Sorted: a(5), ana(3), anana(1), banana(0), na(4), nana(2)
      // LCP:    0,     1,      3,        0,         2,     2
      expect(sa.lcp(0)).toBe(0)
      expect(sa.lcp(1)).toBe(1) // a vs ana -> 1
      expect(sa.lcp(2)).toBe(3) // ana vs anana -> 3
      expect(sa.lcp(3)).toBe(0) // anana vs banana -> 0
      expect(sa.lcp(4)).toBe(0)
      expect(sa.lcp(5)).toBe(2)
    })
  })

  // ─── search ───

  describe('search', () => {
    beforeEach(() => {
      sa = new SuffixArray('banana')
    })

    it('should find all occurrences of a pattern', () => {
      expect(sa.search('ana')).toEqual([1, 3])
      expect(sa.search('na')).toEqual([2, 4])
      expect(sa.search('ban')).toEqual([0])
      expect(sa.search('a')).toEqual([1, 3, 5])
    })

    it('should return empty array when no match', () => {
      expect(sa.search('xyz')).toEqual([])
      expect(sa.search('banana split')).toEqual([])
    })
  })

  // ─── contains ───

  describe('contains', () => {
    beforeEach(() => {
      sa = new SuffixArray('banana')
    })

    it('should return true when pattern exists', () => {
      expect(sa.contains('ana')).toBe(true)
      expect(sa.contains('ban')).toBe(true)
      expect(sa.contains('na')).toBe(true)
    })

    it('should return false when pattern does not exist', () => {
      expect(sa.contains('xyz')).toBe(false)
      expect(sa.contains('apple')).toBe(false)
    })
  })

  // ─── longestRepeatedSubstring ───

  describe('longestRepeatedSubstring', () => {
    it('should return the longest repeated substring', () => {
      sa = new SuffixArray('banana')
      expect(sa.longestRepeatedSubstring()).toBe('ana')
    })

    it('should return empty string when no repeated substring', () => {
      sa = new SuffixArray('abcdef')
      expect(sa.longestRepeatedSubstring()).toBe('')
    })
  })

  // ─── empty string ───

  describe('empty string', () => {
    beforeEach(() => {
      sa = new SuffixArray('')
    })

    it('should handle empty string gracefully', () => {
      expect(sa.length).toBe(0)
      expect(sa.toArray()).toEqual([])
      expect(sa.search('a')).toEqual([])
      expect(sa.contains('a')).toBe(false)
      expect(sa.longestRepeatedSubstring()).toBe('')
    })

    it('should throw RangeError for index on empty', () => {
      expect(() => sa.index(0)).toThrow(RangeError)
    })

    it('should throw RangeError for lcp on empty', () => {
      expect(() => sa.lcp(0)).toThrow(RangeError)
    })
  })

  // ─── single character ───

  describe('single character', () => {
    beforeEach(() => {
      sa = new SuffixArray('a')
    })

    it('should work correctly', () => {
      expect(sa.length).toBe(1)
      expect(sa.toArray()).toEqual([0])
      expect(sa.index(0)).toBe(0)
      expect(sa.lcp(0)).toBe(0)
      expect(sa.search('a')).toEqual([0])
      expect(sa.contains('a')).toBe(true)
      expect(sa.longestRepeatedSubstring()).toBe('')
    })
  })

  // ─── text getter ───

  describe('text getter', () => {
    it('should return original text', () => {
      sa = new SuffixArray('hello world')
      expect(sa.text).toBe('hello world')
    })
  })
})
