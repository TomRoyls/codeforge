import { describe, expect, it } from 'vitest'
import { KnuthMorrisPratt } from '../../src/utils/knuth-morris-pratt.js'

describe('KnuthMorrisPratt', () => {
  describe('search', () => {
    it('finds all occurrences of pattern', () => {
      expect(KnuthMorrisPratt.search('abababab', 'ab')).toEqual([0, 2, 4, 6])
    })

    it('finds single occurrence', () => {
      expect(KnuthMorrisPratt.search('hello world', 'world')).toEqual([6])
    })

    it('returns empty for no match', () => {
      expect(KnuthMorrisPratt.search('hello world', 'xyz')).toEqual([])
    })

    it('returns empty for empty pattern', () => {
      expect(KnuthMorrisPratt.search('hello', '')).toEqual([])
    })

    it('returns empty when text shorter than pattern', () => {
      expect(KnuthMorrisPratt.search('hi', 'hello')).toEqual([])
    })

    it('handles overlapping patterns', () => {
      expect(KnuthMorrisPratt.search('aaa', 'aa')).toEqual([0, 1])
    })

    it('handles pattern at end', () => {
      expect(KnuthMorrisPratt.search('abcdef', 'def')).toEqual([3])
    })

    it('handles pattern at start', () => {
      expect(KnuthMorrisPratt.search('abcdef', 'abc')).toEqual([0])
    })

    it('handles empty text', () => {
      expect(KnuthMorrisPratt.search('', 'abc')).toEqual([])
    })

    it('handles both empty', () => {
      expect(KnuthMorrisPratt.search('', '')).toEqual([])
    })

    it('single char text matches', () => {
      expect(KnuthMorrisPratt.search('a', 'a')).toEqual([0])
    })

    it('single char text no match', () => {
      expect(KnuthMorrisPratt.search('a', 'b')).toEqual([])
    })

    it('handles special characters', () => {
      expect(KnuthMorrisPratt.search('a!@#b!@#c', '!@#')).toEqual([1, 5])
    })

    it('handles unicode', () => {
      expect(KnuthMorrisPratt.search('日本語日本', '日本')).toEqual([0, 3])
    })

    it('handles whitespace pattern', () => {
      expect(KnuthMorrisPratt.search('a b c d', ' ')).toEqual([1, 3, 5])
    })

    it('finds repeated single char', () => {
      expect(KnuthMorrisPratt.search('aaaaa', 'a')).toEqual([0, 1, 2, 3, 4])
    })
  })

  describe('buildLPS', () => {
    it('computes correct table for ABABCABAB', () => {
      expect(KnuthMorrisPratt.buildLPS('ABABCABAB')).toEqual([0, 0, 1, 2, 0, 1, 2, 3, 4])
    })

    it('all same chars', () => {
      expect(KnuthMorrisPratt.buildLPS('aaaa')).toEqual([0, 1, 2, 3])
    })

    it('no repeats', () => {
      expect(KnuthMorrisPratt.buildLPS('abcd')).toEqual([0, 0, 0, 0])
    })

    it('single char', () => {
      expect(KnuthMorrisPratt.buildLPS('a')).toEqual([0])
    })

    it('two same chars', () => {
      expect(KnuthMorrisPratt.buildLPS('aa')).toEqual([0, 1])
    })

    it('two different chars', () => {
      expect(KnuthMorrisPratt.buildLPS('ab')).toEqual([0, 0])
    })

    it('empty string returns empty', () => {
      expect(KnuthMorrisPratt.buildLPS('')).toEqual([])
    })

    it('prefix that is also suffix', () => {
      expect(KnuthMorrisPratt.buildLPS('abcabc')).toEqual([0, 0, 0, 1, 2, 3])
    })
  })

  describe('contains', () => {
    it('returns true for match', () => {
      expect(KnuthMorrisPratt.contains('hello world', 'world')).toBe(true)
    })

    it('returns false for no match', () => {
      expect(KnuthMorrisPratt.contains('hello world', 'xyz')).toBe(false)
    })

    it('returns true for match at start', () => {
      expect(KnuthMorrisPratt.contains('abcdef', 'abc')).toBe(true)
    })

    it('returns true for match at end', () => {
      expect(KnuthMorrisPratt.contains('abcdef', 'def')).toBe(true)
    })

    it('returns false for empty pattern', () => {
      expect(KnuthMorrisPratt.contains('hello', '')).toBe(false)
    })

    it('returns true for entire text match', () => {
      expect(KnuthMorrisPratt.contains('hello', 'hello')).toBe(true)
    })
  })

  describe('countOccurrences', () => {
    it('counts correctly', () => {
      expect(KnuthMorrisPratt.countOccurrences('ababab', 'ab')).toBe(3)
    })

    it('returns 0 for no match', () => {
      expect(KnuthMorrisPratt.countOccurrences('abcdef', 'xyz')).toBe(0)
    })

    it('counts overlapping', () => {
      expect(KnuthMorrisPratt.countOccurrences('aaa', 'aa')).toBe(2)
    })

    it('returns 0 for empty pattern', () => {
      expect(KnuthMorrisPratt.countOccurrences('hello', '')).toBe(0)
    })

    it('counts single char occurrences', () => {
      expect(KnuthMorrisPratt.countOccurrences('abcabc', 'a')).toBe(2)
    })
  })

  describe('firstOccurrence', () => {
    it('returns index of first match', () => {
      expect(KnuthMorrisPratt.firstOccurrence('hello world', 'world')).toBe(6)
    })

    it('returns -1 for no match', () => {
      expect(KnuthMorrisPratt.firstOccurrence('hello', 'xyz')).toBe(-1)
    })

    it('returns 0 for match at start', () => {
      expect(KnuthMorrisPratt.firstOccurrence('abcdef', 'abc')).toBe(0)
    })

    it('returns -1 for empty pattern', () => {
      expect(KnuthMorrisPratt.firstOccurrence('hello', '')).toBe(-1)
    })

    it('returns correct index for repeated pattern', () => {
      expect(KnuthMorrisPratt.firstOccurrence('ababab', 'bab')).toBe(1)
    })
  })
})
