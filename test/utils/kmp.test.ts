import { describe, expect, it } from 'vitest'
import { KMP } from '../../src/utils/kmp.js'

describe('KMP', () => {
  describe('buildTable', () => {
    it('builds prefix table for simple pattern', () => {
      expect(KMP.buildTable('ABCDABD')).toEqual([0, 0, 0, 0, 1, 2, 0])
    })

    it('handles single character', () => {
      expect(KMP.buildTable('A')).toEqual([0])
    })

    it('handles repeated characters', () => {
      expect(KMP.buildTable('AAA')).toEqual([0, 1, 2])
    })

    it('handles no prefix overlap', () => {
      expect(KMP.buildTable('ABC')).toEqual([0, 0, 0])
    })
  })

  describe('search', () => {
    it('finds all occurrences', () => {
      expect(KMP.search('ABABDABACDABABCABAB', 'ABABCABAB')).toEqual([10])
    })

    it('finds multiple occurrences', () => {
      expect(KMP.search('AAAAA', 'AA')).toEqual([0, 1, 2, 3])
    })

    it('finds pattern at beginning', () => {
      expect(KMP.search('ABCDEFG', 'ABC')).toEqual([0])
    })

    it('finds pattern at end', () => {
      expect(KMP.search('ABCDEFG', 'EFG')).toEqual([4])
    })

    it('returns empty for no match', () => {
      expect(KMP.search('ABCDEFG', 'XYZ')).toEqual([])
    })

    it('handles empty pattern', () => {
      expect(KMP.search('ABC', '')).toEqual([])
    })

    it('handles pattern longer than text', () => {
      expect(KMP.search('AB', 'ABCDEF')).toEqual([])
    })

    it('handles single character search', () => {
      expect(KMP.search('ABCABC', 'C')).toEqual([2, 5])
    })

    it('handles exact match', () => {
      expect(KMP.search('ABC', 'ABC')).toEqual([0])
    })
  })

  describe('contains', () => {
    it('returns true when found', () => {
      expect(KMP.contains('hello world', 'world')).toBe(true)
    })

    it('returns false when not found', () => {
      expect(KMP.contains('hello world', 'xyz')).toBe(false)
    })
  })

  describe('countOccurrences', () => {
    it('counts overlapping occurrences', () => {
      expect(KMP.countOccurrences('AAAA', 'AA')).toBe(3)
    })

    it('counts non-overlapping', () => {
      expect(KMP.countOccurrences('ABABAB', 'AB')).toBe(3)
    })

    it('returns 0 for no match', () => {
      expect(KMP.countOccurrences('ABC', 'XYZ')).toBe(0)
    })
  })

  describe('findAllOverlapping', () => {
    it('returns matching substrings', () => {
      expect(KMP.findAllOverlapping('ABCABC', 'ABC')).toEqual(['ABC', 'ABC'])
    })

    it('returns empty for no match', () => {
      expect(KMP.findAllOverlapping('ABC', 'XYZ')).toEqual([])
    })

    it('finds single match', () => {
      expect(KMP.search('xabcy', 'abc')).toEqual([1])
    })
  })

  it('no match returns empty', () => {
    expect(KMP.search('abcdef', 'xyz')).toEqual([])
  })

  it('finds pattern at start', () => {
    expect(KMP.search('abcdef', 'abc')).toEqual([0])
  })

  it('finds no match returns empty', () => {
    expect(KMP.search('abcdef', 'xyz')).toEqual([])
  })
})
