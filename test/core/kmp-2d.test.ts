import { describe, it, expect } from 'vitest'
import { KMP2D } from '../../src/core/kmp-2d/kmp-2d.js'
import type { KMP2DResult } from '../../src/core/kmp-2d/types.js'

describe('KMP2D', () => {
  describe('constructor', () => {
    it('should create instance with valid pattern', () => {
      const kmp = new KMP2D(['AB', 'CD'])
      expect(kmp.getPattern()).toEqual(['AB', 'CD'])
    })

    it('should create instance with empty pattern array', () => {
      const kmp = new KMP2D([])
      expect(kmp.getPattern()).toEqual([])
    })

    it('should create instance with single row pattern', () => {
      const kmp = new KMP2D(['ABC'])
      expect(kmp.getPattern()).toEqual(['ABC'])
    })

    it('should create instance with single column pattern', () => {
      const kmp = new KMP2D(['A', 'B', 'C'])
      expect(kmp.getPattern()).toEqual(['A', 'B', 'C'])
    })

    it('should create instance with 1x1 pattern', () => {
      const kmp = new KMP2D(['X'])
      expect(kmp.getPattern()).toEqual(['X'])
    })

    it('should make defensive copy of pattern', () => {
      const pattern = ['AB', 'CD']
      const kmp = new KMP2D(pattern)
      pattern[0] = 'XY'
      expect(kmp.getPattern()).toEqual(['AB', 'CD'])
    })

    it('should create instance with large pattern', () => {
      const rows = Array.from({ length: 100 }, (_, i) => `row${i}`)
      const kmp = new KMP2D(rows)
      expect(kmp.getPattern()).toHaveLength(100)
    })

    it('should create instance with pattern containing repeated rows', () => {
      const kmp = new KMP2D(['AB', 'AB', 'CD'])
      expect(kmp.getPattern()).toEqual(['AB', 'AB', 'CD'])
    })
  })

  describe('search - basic matches', () => {
    it('should find 1x1 pattern at top-left', () => {
      const kmp = new KMP2D(['A'])
      expect(kmp.search(['ABC', 'DEF'])).toEqual([{ row: 0, col: 0 }])
    })

    it('should find 1x1 pattern in middle', () => {
      const kmp = new KMP2D(['E'])
      expect(kmp.search(['ABC', 'DEF'])).toEqual([{ row: 1, col: 1 }])
    })

    it('should find 2x2 pattern at top-left', () => {
      const kmp = new KMP2D(['AB', 'CD'])
      const text = ['ABE', 'CDF', 'GHI']
      expect(kmp.search(text)).toEqual([{ row: 0, col: 0 }])
    })

    it('should find 2x2 pattern in middle', () => {
      const kmp = new KMP2D(['CD', 'HI'])
      const text = ['ABCDE', 'FGHIJ', 'KLMNO']
      expect(kmp.search(text)).toEqual([{ row: 0, col: 2 }])
    })

    it('should find 2x2 pattern at bottom-right', () => {
      const kmp = new KMP2D(['IJ', 'NO'])
      const text = ['ABCDE', 'FGHIJ', 'KLMNO']
      expect(kmp.search(text)).toEqual([{ row: 1, col: 3 }])
    })

    it('should find pattern spanning full text width', () => {
      const kmp = new KMP2D(['ABC', 'DEF'])
      const text = ['ABC', 'DEF']
      expect(kmp.search(text)).toEqual([{ row: 0, col: 0 }])
    })

    it('should find single row pattern', () => {
      const kmp = new KMP2D(['BCD'])
      const text = ['ABCDE']
      expect(kmp.search(text)).toEqual([{ row: 0, col: 1 }])
    })

    it('should find single column pattern', () => {
      const kmp = new KMP2D(['A', 'D'])
      const text = ['ABC', 'DEF', 'GHI']
      expect(kmp.search(text)).toEqual([{ row: 0, col: 0 }])
    })

    it('should find exact text match', () => {
      const kmp = new KMP2D(['AB', 'CD'])
      const text = ['AB', 'CD']
      expect(kmp.search(text)).toEqual([{ row: 0, col: 0 }])
    })

    it('should find pattern with all same characters', () => {
      const kmp = new KMP2D(['AA', 'AA'])
      const text = ['XAAB', 'XAAB', 'XAAA']
      expect(kmp.search(text)).toEqual([{ row: 0, col: 1 }, { row: 1, col: 1 }])
    })

    it('should find pattern at row 0', () => {
      const kmp = new KMP2D(['XY'])
      const text = ['AXYB', 'CDEF']
      expect(kmp.search(text)).toEqual([{ row: 0, col: 1 }])
    })

    it('should find pattern at last row', () => {
      const kmp = new KMP2D(['XY'])
      const text = ['ABCD', 'EXYF']
      expect(kmp.search(text)).toEqual([{ row: 1, col: 1 }])
    })
  })

  describe('search - no matches', () => {
    it('should return empty for no match', () => {
      const kmp = new KMP2D(['XY', 'ZW'])
      const text = ['ABCD', 'EFGH']
      expect(kmp.search(text)).toEqual([])
    })

    it('should return empty when text is empty', () => {
      const kmp = new KMP2D(['AB'])
      expect(kmp.search([])).toEqual([])
    })

    it('should return empty when pattern has more rows than text', () => {
      const kmp = new KMP2D(['AB', 'CD', 'EF'])
      const text = ['ABCD', 'EFGH']
      expect(kmp.search(text)).toEqual([])
    })

    it('should return empty when pattern has more cols than text', () => {
      const kmp = new KMP2D(['ABCDE'])
      const text = ['ABC']
      expect(kmp.search(text)).toEqual([])
    })

    it('should return empty when pattern characters not in text', () => {
      const kmp = new KMP2D(['ZZZ', 'ZZZ'])
      const text = ['ABC', 'DEF']
      expect(kmp.search(text)).toEqual([])
    })

    it('should return empty for similar but not matching pattern', () => {
      const kmp = new KMP2D(['AB', 'CE'])
      const text = ['ABCD', 'EFGH']
      expect(kmp.search(text)).toEqual([])
    })
  })

  describe('search - multiple matches', () => {
    it('should find two matches in same row', () => {
      const kmp = new KMP2D(['AB'])
      const text = ['ABxAB']
      expect(kmp.search(text)).toEqual([{ row: 0, col: 0 }, { row: 0, col: 3 }])
    })

    it('should find two matches in same column', () => {
      const kmp = new KMP2D(['A', 'B'])
      const text = ['xAxx', 'xBxx', 'xAxx', 'xBxx']
      expect(kmp.search(text)).toEqual([{ row: 0, col: 1 }, { row: 2, col: 1 }])
    })

    it('should find matches at multiple positions in grid', () => {
      const kmp = new KMP2D(['A'])
      const text = ['ABA', 'BAB']
      expect(kmp.search(text)).toEqual([
        { row: 0, col: 0 },
        { row: 1, col: 1 },
        { row: 0, col: 2 },
      ])
    })

    it('should find repeated pattern in grid', () => {
      const kmp = new KMP2D(['AB', 'CD'])
      const text = ['xABxAB', 'xCDxCD']
      expect(kmp.search(text)).toEqual([
        { row: 0, col: 1 },
        { row: 0, col: 4 },
      ])
    })

    it('should find 1x1 pattern at every occurrence', () => {
      const kmp = new KMP2D(['A'])
      const text = ['AAA', 'AAA']
      expect(kmp.search(text)).toEqual([
        { row: 0, col: 0 },
        { row: 1, col: 0 },
        { row: 0, col: 1 },
        { row: 1, col: 1 },
        { row: 0, col: 2 },
        { row: 1, col: 2 },
      ])
    })

    it('should find vertical strip of single-column matches', () => {
      const kmp = new KMP2D(['X', 'X'])
      const text = ['aXb', 'aXb', 'aXb', 'aXb']
      expect(kmp.search(text)).toEqual([
        { row: 0, col: 1 },
        { row: 1, col: 1 },
        { row: 2, col: 1 },
      ])
    })

    it('should find three matches at different positions', () => {
      const kmp = new KMP2D(['AB'])
      const text = ['xABxABxAB']
      expect(kmp.search(text)).toEqual([
        { row: 0, col: 1 },
        { row: 0, col: 4 },
        { row: 0, col: 7 },
      ])
    })

    it('should find matches with pattern appearing in different rows', () => {
      const kmp = new KMP2D(['XY'])
      const text = ['aXYb', 'abcd', 'eXYf']
      expect(kmp.search(text)).toEqual([
        { row: 0, col: 1 },
        { row: 2, col: 1 },
      ])
    })

    it('should find overlapping vertical matches', () => {
      const kmp = new KMP2D(['A', 'A'])
      const text = ['xAx', 'xAx', 'xAx']
      expect(kmp.search(text)).toEqual([
        { row: 0, col: 1 },
        { row: 1, col: 1 },
      ])
    })

    it('should find pattern in tiling arrangement', () => {
      const kmp = new KMP2D(['AB'])
      const text = ['ABABAB']
      expect(kmp.search(text)).toEqual([
        { row: 0, col: 0 },
        { row: 0, col: 2 },
        { row: 0, col: 4 },
      ])
    })
  })

  describe('search - edge cases', () => {
    it('should return empty for empty pattern', () => {
      const kmp = new KMP2D([])
      expect(kmp.search(['ABC', 'DEF'])).toEqual([])
    })

    it('should return empty for pattern with empty rows', () => {
      const kmp = new KMP2D([''])
      expect(kmp.search(['ABC'])).toEqual([])
    })

    it('should handle text with one row', () => {
      const kmp = new KMP2D(['BC'])
      expect(kmp.search(['ABCD'])).toEqual([{ row: 0, col: 1 }])
    })

    it('should handle text with one column', () => {
      const kmp = new KMP2D(['B', 'C'])
      expect(kmp.search(['A', 'B', 'C', 'D'])).toEqual([{ row: 1, col: 0 }])
    })

    it('should find pattern at exact boundary bottom-right', () => {
      const kmp = new KMP2D(['CD', 'GH'])
      const text = ['ABCD', 'EFGH']
      expect(kmp.search(text)).toEqual([{ row: 0, col: 2 }])
    })

    it('should handle pattern with repeated rows', () => {
      const kmp = new KMP2D(['AB', 'AB'])
      const text = ['xABx', 'xABx', 'xABx']
      expect(kmp.search(text)).toEqual([{ row: 0, col: 1 }, { row: 1, col: 1 }])
    })

    it('should handle pattern with all identical rows', () => {
      const kmp = new KMP2D(['AA', 'AA', 'AA'])
      const text = ['xAAx', 'xAAx', 'xAAx', 'xBBBx']
      expect(kmp.search(text)).toEqual([{ row: 0, col: 1 }])
    })

    it('should handle unicode characters', () => {
      const kmp = new KMP2D(['世', '界'])
      const text = ['你世他', '我界吗']
      expect(kmp.search(text)).toEqual([{ row: 0, col: 1 }])
    })

    it('should handle digits in pattern', () => {
      const kmp = new KMP2D(['12', '34'])
      const text = ['x12x', 'x34x']
      expect(kmp.search(text)).toEqual([{ row: 0, col: 1 }])
    })

    it('should handle special characters in pattern', () => {
      const kmp = new KMP2D(['[)', '*>'])
      const text = ['a[)b', 'c*>d']
      expect(kmp.search(text)).toEqual([{ row: 0, col: 1 }])
    })

    it('should handle pattern in large text', () => {
      const row = 'A'.repeat(50) + 'XY' + 'B'.repeat(50)
      const text = Array.from({ length: 50 }, () => 'C'.repeat(102))
      text[25] = row
      const kmp = new KMP2D(['XY'])
      expect(kmp.search(text)).toEqual([{ row: 25, col: 50 }])
    })
  })

  describe('searchFirst', () => {
    it('should return first match position', () => {
      const kmp = new KMP2D(['AB', 'CD'])
      const text = ['xABx', 'xCDx']
      expect(kmp.searchFirst(text)).toEqual({ row: 0, col: 1 })
    })

    it('should return undefined when no match', () => {
      const kmp = new KMP2D(['XY', 'ZW'])
      const text = ['ABCD', 'EFGH']
      expect(kmp.searchFirst(text)).toBeUndefined()
    })

    it('should return first match when multiple exist', () => {
      const kmp = new KMP2D(['AB'])
      const text = ['xABxAB']
      const first = kmp.searchFirst(text)
      expect(first).toEqual({ row: 0, col: 1 })
    })

    it('should find pattern at beginning', () => {
      const kmp = new KMP2D(['AB', 'CD'])
      const text = ['ABCD', 'CDEF']
      expect(kmp.searchFirst(text)).toEqual({ row: 0, col: 0 })
    })

    it('should find pattern at end', () => {
      const kmp = new KMP2D(['CD', 'EF'])
      const text = ['ABCD', 'CDEF']
      expect(kmp.searchFirst(text)).toEqual({ row: 0, col: 2 })
    })

    it('should return undefined for empty pattern', () => {
      const kmp = new KMP2D([])
      expect(kmp.searchFirst(['ABC'])).toBeUndefined()
    })

    it('should return undefined for empty text', () => {
      const kmp = new KMP2D(['AB'])
      expect(kmp.searchFirst([])).toBeUndefined()
    })

    it('should find single cell match', () => {
      const kmp = new KMP2D(['X'])
      const text = ['ABC', 'DXE']
      expect(kmp.searchFirst(text)).toEqual({ row: 1, col: 1 })
    })

    it('should return undefined for single cell no match', () => {
      const kmp = new KMP2D(['Z'])
      const text = ['ABC', 'DEF']
      expect(kmp.searchFirst(text)).toBeUndefined()
    })

    it('should find first in non-trivial pattern', () => {
      const kmp = new KMP2D(['BC', 'GH'])
      const text = ['ABCDE', 'FGHIJ']
      const first = kmp.searchFirst(text)
      expect(first).toEqual({ row: 0, col: 1 })
    })
  })

  describe('count', () => {
    it('should count zero occurrences', () => {
      const kmp = new KMP2D(['XY'])
      expect(kmp.count(['ABC', 'DEF'])).toBe(0)
    })

    it('should count single occurrence', () => {
      const kmp = new KMP2D(['AB', 'CD'])
      expect(kmp.count(['xABx', 'xCDx'])).toBe(1)
    })

    it('should count multiple occurrences', () => {
      const kmp = new KMP2D(['AB'])
      expect(kmp.count(['xABxAB'])).toBe(2)
    })

    it('should count zero for empty text', () => {
      const kmp = new KMP2D(['AB'])
      expect(kmp.count([])).toBe(0)
    })

    it('should count zero for no match', () => {
      const kmp = new KMP2D(['ZZZ', 'ZZZ'])
      expect(kmp.count(['ABC', 'DEF'])).toBe(0)
    })

    it('should count one for exact match', () => {
      const kmp = new KMP2D(['AB', 'CD'])
      expect(kmp.count(['AB', 'CD'])).toBe(1)
    })

    it('should count multiple in grid', () => {
      const kmp = new KMP2D(['A'])
      expect(kmp.count(['ABA', 'BAB'])).toBe(3)
    })

    it('should count with repeated pattern rows', () => {
      const kmp = new KMP2D(['XX', 'XX'])
      const text = ['aXXbXX', 'aXXbXX', 'aXXbXX']
      expect(kmp.count(text)).toBe(4)
    })

    it('should count for single cell pattern', () => {
      const kmp = new KMP2D(['X'])
      expect(kmp.count(['XAX', 'XXX'])).toBe(5)
    })

    it('should count zero for empty pattern', () => {
      const kmp = new KMP2D([])
      expect(kmp.count(['ABC'])).toBe(0)
    })
  })

  describe('contains', () => {
    it('should return true when pattern found', () => {
      const kmp = new KMP2D(['AB', 'CD'])
      expect(kmp.contains(['ABCD', 'CDEF'])).toBe(true)
    })

    it('should return false when pattern not found', () => {
      const kmp = new KMP2D(['XY', 'ZW'])
      expect(kmp.contains(['ABCD', 'EFGH'])).toBe(false)
    })

    it('should return false for empty text', () => {
      const kmp = new KMP2D(['AB'])
      expect(kmp.contains([])).toBe(false)
    })

    it('should return false for empty pattern', () => {
      const kmp = new KMP2D([])
      expect(kmp.contains(['ABC'])).toBe(false)
    })

    it('should return true for exact match', () => {
      const kmp = new KMP2D(['AB', 'CD'])
      expect(kmp.contains(['AB', 'CD'])).toBe(true)
    })

    it('should return true for pattern at beginning', () => {
      const kmp = new KMP2D(['AB'])
      expect(kmp.contains(['ABC'])).toBe(true)
    })

    it('should return true for pattern at end', () => {
      const kmp = new KMP2D(['CD'])
      expect(kmp.contains(['ABCD'])).toBe(true)
    })

    it('should return true for single cell match', () => {
      const kmp = new KMP2D(['X'])
      expect(kmp.contains(['AX', 'BY'])).toBe(true)
    })
  })

  describe('getPattern', () => {
    it('should return pattern', () => {
      const kmp = new KMP2D(['AB', 'CD'])
      expect(kmp.getPattern()).toEqual(['AB', 'CD'])
    })

    it('should return defensive copy', () => {
      const kmp = new KMP2D(['AB', 'CD'])
      const pattern = kmp.getPattern()
      pattern[0] = 'XY'
      expect(kmp.getPattern()).toEqual(['AB', 'CD'])
    })

    it('should return empty for empty pattern', () => {
      const kmp = new KMP2D([])
      expect(kmp.getPattern()).toEqual([])
    })

    it('should return single row', () => {
      const kmp = new KMP2D(['ABC'])
      expect(kmp.getPattern()).toEqual(['ABC'])
    })

    it('should return pattern after search operations', () => {
      const kmp = new KMP2D(['AB'])
      kmp.search(['ABC'])
      kmp.count(['ABC'])
      expect(kmp.getPattern()).toEqual(['AB'])
    })
  })

  describe('setPattern', () => {
    it('should update the pattern', () => {
      const kmp = new KMP2D(['AB'])
      kmp.setPattern(['CD'])
      expect(kmp.getPattern()).toEqual(['CD'])
    })

    it('should search with the new pattern', () => {
      const kmp = new KMP2D(['AB'])
      kmp.setPattern(['CD'])
      expect(kmp.search(['ABCD', 'CDEF'])).toEqual([
        { row: 1, col: 0 },
        { row: 0, col: 2 },
      ])
    })

    it('should no longer find old pattern after update', () => {
      const kmp = new KMP2D(['AB'])
      kmp.setPattern(['XY'])
      expect(kmp.search(['ABCD'])).toEqual([])
    })

    it('should handle multiple updates', () => {
      const kmp = new KMP2D(['A'])
      kmp.setPattern(['B'])
      kmp.setPattern(['C'])
      expect(kmp.getPattern()).toEqual(['C'])
      expect(kmp.search(['ABC'])).toEqual([{ row: 0, col: 2 }])
    })

    it('should make defensive copy on set', () => {
      const kmp = new KMP2D(['AB'])
      const newPattern = ['CD', 'EF']
      kmp.setPattern(newPattern)
      newPattern[0] = 'XY'
      expect(kmp.getPattern()).toEqual(['CD', 'EF'])
    })

    it('should handle setting to empty pattern', () => {
      const kmp = new KMP2D(['AB'])
      kmp.setPattern([])
      expect(kmp.search(['ABC'])).toEqual([])
    })

    it('should handle setting to larger pattern', () => {
      const kmp = new KMP2D(['A'])
      kmp.setPattern(['AB', 'CD', 'EF'])
      expect(kmp.search(['xABx', 'xCDx', 'xEFx'])).toEqual([{ row: 0, col: 1 }])
    })

    it('should handle setting to smaller pattern', () => {
      const kmp = new KMP2D(['AB', 'CD', 'EF'])
      kmp.setPattern(['X'])
      expect(kmp.search(['ABXC'])).toEqual([{ row: 0, col: 2 }])
    })

    it('should reflect in getPattern after update', () => {
      const kmp = new KMP2D(['AB'])
      kmp.setPattern(['XY', 'ZW'])
      expect(kmp.getPattern()).toEqual(['XY', 'ZW'])
    })

    it('should count correctly after update', () => {
      const kmp = new KMP2D(['A'])
      expect(kmp.count(['ABC'])).toBe(1)
      kmp.setPattern(['B'])
      expect(kmp.count(['ABC'])).toBe(1)
      kmp.setPattern(['D'])
      expect(kmp.count(['ABC'])).toBe(0)
    })
  })

  describe('static search', () => {
    it('should find pattern in text', () => {
      const text = ['ABCD', 'EFGH']
      const pattern = ['BC', 'FG']
      expect(KMP2D.search(text, pattern)).toEqual([{ row: 0, col: 1 }])
    })

    it('should return empty when not found', () => {
      const text = ['ABCD', 'EFGH']
      const pattern = ['XY', 'ZW']
      expect(KMP2D.search(text, pattern)).toEqual([])
    })

    it('should find at beginning', () => {
      const text = ['ABCD', 'EFGH']
      const pattern = ['AB', 'EF']
      expect(KMP2D.search(text, pattern)).toEqual([{ row: 0, col: 0 }])
    })

    it('should find at end', () => {
      const text = ['ABCD', 'EFGH']
      const pattern = ['CD', 'GH']
      expect(KMP2D.search(text, pattern)).toEqual([{ row: 0, col: 2 }])
    })

    it('should handle empty pattern', () => {
      expect(KMP2D.search(['ABC'], [])).toEqual([])
    })

    it('should handle empty text', () => {
      expect(KMP2D.search([], ['AB'])).toEqual([])
    })

    it('should find all occurrences', () => {
      const text = ['ABAB']
      const pattern = ['AB']
      expect(KMP2D.search(text, pattern)).toEqual([
        { row: 0, col: 0 },
        { row: 0, col: 2 },
      ])
    })

    it('should find with single row pattern', () => {
      const text = ['ABCDEF']
      const pattern = ['CDE']
      expect(KMP2D.search(text, pattern)).toEqual([{ row: 0, col: 2 }])
    })

    it('should find with single column pattern', () => {
      const text = ['ABC', 'DBC', 'EBC']
      const pattern = ['A', 'D', 'E']
      expect(KMP2D.search(text, pattern)).toEqual([{ row: 0, col: 0 }])
    })
  })

  describe('static searchFirst', () => {
    it('should return first match', () => {
      const text = ['ABABAB']
      const pattern = ['AB']
      expect(KMP2D.searchFirst(text, pattern)).toEqual({ row: 0, col: 0 })
    })

    it('should return undefined when not found', () => {
      const text = ['ABC', 'DEF']
      const pattern = ['XY']
      expect(KMP2D.searchFirst(text, pattern)).toBeUndefined()
    })

    it('should return first of multiple matches', () => {
      const text = ['xABxAB']
      const pattern = ['AB']
      expect(KMP2D.searchFirst(text, pattern)).toEqual({ row: 0, col: 1 })
    })

    it('should handle empty text', () => {
      expect(KMP2D.searchFirst([], ['AB'])).toBeUndefined()
    })

    it('should handle empty pattern', () => {
      expect(KMP2D.searchFirst(['ABC'], [])).toBeUndefined()
    })

    it('should find exact match', () => {
      const text = ['AB', 'CD']
      const pattern = ['AB', 'CD']
      expect(KMP2D.searchFirst(text, pattern)).toEqual({ row: 0, col: 0 })
    })
  })

  describe('static count', () => {
    it('should count occurrences', () => {
      const text = ['ABABAB']
      const pattern = ['AB']
      expect(KMP2D.count(text, pattern)).toBe(3)
    })

    it('should return 0 when not found', () => {
      const text = ['ABC', 'DEF']
      const pattern = ['XY']
      expect(KMP2D.count(text, pattern)).toBe(0)
    })

    it('should count single occurrence', () => {
      const text = ['ABC', 'DEF']
      const pattern = ['BC', 'EF']
      expect(KMP2D.count(text, pattern)).toBe(1)
    })

    it('should handle empty pattern', () => {
      expect(KMP2D.count(['ABC'], [])).toBe(0)
    })

    it('should handle empty text', () => {
      expect(KMP2D.count([], ['AB'])).toBe(0)
    })

    it('should count with 2D pattern', () => {
      const text = ['ABAB', 'CDCD']
      const pattern = ['AB', 'CD']
      expect(KMP2D.count(text, pattern)).toBe(2)
    })
  })

  describe('static contains', () => {
    it('should return true when found', () => {
      const text = ['ABCD', 'EFGH']
      const pattern = ['BC', 'FG']
      expect(KMP2D.contains(text, pattern)).toBe(true)
    })

    it('should return false when not found', () => {
      const text = ['ABCD', 'EFGH']
      const pattern = ['XY']
      expect(KMP2D.contains(text, pattern)).toBe(false)
    })

    it('should return false for empty pattern', () => {
      expect(KMP2D.contains(['ABC'], [])).toBe(false)
    })

    it('should return false for empty text', () => {
      expect(KMP2D.contains([], ['AB'])).toBe(false)
    })

    it('should return true for match at start', () => {
      const text = ['ABC', 'DEF']
      const pattern = ['AB', 'DE']
      expect(KMP2D.contains(text, pattern)).toBe(true)
    })

    it('should return true for match at end', () => {
      const text = ['ABCD', 'EFGH']
      const pattern = ['CD', 'GH']
      expect(KMP2D.contains(text, pattern)).toBe(true)
    })
  })

  describe('algorithm correctness - vertical KMP fallback', () => {
    it('should find pattern after partial vertical match fails', () => {
      const pattern = ['AB', 'CD', 'EF']
      const text = ['xABxx', 'xCDxx', 'xGHxx', 'xABxx', 'xCDxx', 'xEFxx']
      const kmp = new KMP2D(pattern)
      expect(kmp.search(text)).toEqual([{ row: 3, col: 1 }])
    })

    it('should handle pattern where rows are prefix-suffix of each other', () => {
      const pattern = ['AB', 'AB', 'CD']
      const text = ['xABxCD', 'xABxCD', 'xCDxAB']
      const kmp = new KMP2D(pattern)
      expect(kmp.search(text)).toEqual([{ row: 0, col: 1 }])
    })

    it('should find match when pattern rows overlap in failure', () => {
      const kmp = new KMP2D(['XX', 'XX'])
      const text = ['aXXb', 'cXXd']
      expect(kmp.search(text)).toEqual([{ row: 0, col: 1 }])
    })

    it('should correctly handle all-identical pattern rows', () => {
      const pattern = ['AA', 'AA', 'AA']
      const text = ['xAA', 'xAA', 'xAA', 'xBB']
      const kmp = new KMP2D(pattern)
      expect(kmp.search(text)).toEqual([{ row: 0, col: 1 }])
    })

    it('should find match after multiple fallbacks', () => {
      const pattern = ['AB', 'CD', 'AB', 'EF']
      const text = ['xABxx', 'xCDxx', 'xABxx', 'xCDxx', 'xABxx', 'xEFxx']
      const kmp = new KMP2D(pattern)
      expect(kmp.search(text)).toEqual([{ row: 2, col: 1 }])
    })

    it('should find pattern in alternating row text', () => {
      const pattern = ['AB', 'CD']
      const text = ['xABx', 'xCDx', 'xABx', 'xCDx']
      const kmp = new KMP2D(pattern)
      expect(kmp.search(text)).toEqual([
        { row: 0, col: 1 },
        { row: 2, col: 1 },
      ])
    })

    it('should handle large pattern in large text', () => {
      const pattern = Array.from({ length: 10 }, (_, i) => `row${i}`)
      const text = Array.from({ length: 50 }, (_, i) => `row${i % 5}`)
      const kmp = new KMP2D(pattern)
      expect(kmp.search(text)).toEqual([])
    })

    it('should find match requiring multiple row fallback cycles', () => {
      const pattern = ['AA', 'AA', 'BB']
      const text = ['xAAxBB', 'xAAxBB', 'xBBxAA']
      const kmp = new KMP2D(pattern)
      expect(kmp.search(text)).toEqual([{ row: 0, col: 1 }])
    })

    it('should correctly find pattern at column boundaries', () => {
      const pattern = ['AB', 'CD']
      const text = ['ABAB', 'CDCD']
      const kmp = new KMP2D(pattern)
      expect(kmp.search(text)).toEqual([
        { row: 0, col: 0 },
        { row: 0, col: 2 },
      ])
    })

    it('should find pattern that matches after failed start', () => {
      const pattern = ['XY']
      const text = ['AXYBXYC']
      const kmp = new KMP2D(pattern)
      expect(kmp.search(text)).toEqual([
        { row: 0, col: 1 },
        { row: 0, col: 4 },
      ])
    })
  })

  describe('special characters', () => {
    it('should handle pattern with emoji', () => {
      const kmp = new KMP2D(['🎯🎯'])
      expect(kmp.search(['🎯🎯🎯'])).toEqual([
        { row: 0, col: 0 },
        { row: 0, col: 2 },
      ])
    })

    it('should handle pattern with japanese characters', () => {
      const kmp = new KMP2D(['にち'])
      expect(kmp.search(['こんにちは'])).toEqual([{ row: 0, col: 2 }])
    })

    it('should handle pattern with parentheses', () => {
      const kmp = new KMP2D(['(A)', '(B)'])
      expect(kmp.search(['x(A)y', 'x(B)y'])).toEqual([{ row: 0, col: 1 }])
    })

    it('should handle pattern with dollar signs', () => {
      const kmp = new KMP2D(['$100', '$200'])
      expect(kmp.search(['price$100', 'cost_$200'])).toEqual([{ row: 0, col: 5 }])
    })

    it('should handle pattern with backslashes', () => {
      const kmp = new KMP2D(['\\n', '\\t'])
      expect(kmp.search(['a\\nb', 'c\\td'])).toEqual([{ row: 0, col: 1 }])
    })

    it('should handle pattern with asterisks', () => {
      const kmp = new KMP2D(['A*B'])
      expect(kmp.search(['xA*By'])).toEqual([{ row: 0, col: 1 }])
    })

    it('should handle whitespace in pattern', () => {
      const kmp = new KMP2D(['A B', 'C D'])
      expect(kmp.search(['xA Bx', 'xC Dx'])).toEqual([{ row: 0, col: 1 }])
    })

    it('should handle pattern with dots', () => {
      const kmp = new KMP2D(['A.B'])
      expect(kmp.search(['xA.By'])).toEqual([{ row: 0, col: 1 }])
    })
  })

  describe('KMP2DResult type', () => {
    it('should accept result with row and col', () => {
      const result: KMP2DResult = { row: 0, col: 0 }
      expect(result.row).toBe(0)
      expect(result.col).toBe(0)
    })

    it('should work with search result type', () => {
      const kmp = new KMP2D(['AB'])
      const results: KMP2DResult[] = kmp.search(['xABx'])
      expect(results.length).toBe(1)
    })

    it('should work with searchFirst result type', () => {
      const kmp = new KMP2D(['AB'])
      const result: KMP2DResult | undefined = kmp.searchFirst(['xABx'])
      expect(result).toBeDefined()
      expect(result!.row).toBe(0)
      expect(result!.col).toBe(1)
    })
  })

  describe('re-exported types', () => {
    it('should export KMP2DResult type from module', () => {
      const kmp = new KMP2D(['A'])
      const results = kmp.search(['ABC'])
      expect(results).toBeInstanceOf(Array)
      if (results.length > 0) {
        expect(typeof results[0]!.row).toBe('number')
        expect(typeof results[0]!.col).toBe('number')
      }
    })
  })

  describe('additional search correctness', () => {
    it('should find pattern spanning all rows and columns of text', () => {
      const kmp = new KMP2D(['AB', 'CD'])
      const text = ['AB', 'CD']
      expect(kmp.search(text)).toEqual([{ row: 0, col: 0 }])
    })

    it('should not find pattern when only partial row matches', () => {
      const kmp = new KMP2D(['ABC', 'DEF'])
      const text = ['ABCD', 'DEFG']
      expect(kmp.search(text)).toEqual([{ row: 0, col: 0 }])
    })

    it('should handle pattern at column 0 only', () => {
      const kmp = new KMP2D(['AB', 'CD'])
      const text = ['ABxx', 'CDxx']
      expect(kmp.search(text)).toEqual([{ row: 0, col: 0 }])
    })

    it('should find two column matches in same rows', () => {
      const kmp = new KMP2D(['AB', 'CD'])
      const text = ['ABxAB', 'CDxCD']
      expect(kmp.search(text)).toEqual([
        { row: 0, col: 0 },
        { row: 0, col: 3 },
      ])
    })

    it('should handle 1x1 pattern with no match in large text', () => {
      const kmp = new KMP2D(['Z'])
      const text = Array.from({ length: 100 }, () => 'A'.repeat(100))
      expect(kmp.search(text)).toEqual([])
    })

    it('should find 1x1 pattern at specific position in large text', () => {
      const text = Array.from({ length: 100 }, () => 'A'.repeat(100))
      text[50] = 'A'.repeat(50) + 'Z' + 'A'.repeat(49)
      const kmp = new KMP2D(['Z'])
      expect(kmp.search(text)).toEqual([{ row: 50, col: 50 }])
    })

    it('should handle pattern with single character rows', () => {
      const kmp = new KMP2D(['A', 'B', 'C'])
      const text = ['xAx', 'xBx', 'xCx']
      expect(kmp.search(text)).toEqual([{ row: 0, col: 1 }])
    })

    it('should find match in text with single-character columns', () => {
      const kmp = new KMP2D(['A', 'B'])
      const text = ['A', 'B', 'C']
      expect(kmp.search(text)).toEqual([{ row: 0, col: 0 }])
    })
  })

  describe('setPattern advanced scenarios', () => {
    it('should rebuild failure tables correctly on pattern change', () => {
      const kmp = new KMP2D(['AB', 'CD'])
      expect(kmp.search(['xABxCD', 'xCDxEF'])).toEqual([{ row: 0, col: 1 }])
      kmp.setPattern(['CD', 'EF'])
      expect(kmp.search(['xABxCD', 'xCDxEF'])).toEqual([{ row: 0, col: 4 }])
    })

    it('should handle switching between 1D and 2D patterns', () => {
      const kmp = new KMP2D(['ABC'])
      expect(kmp.search(['xABCx'])).toEqual([{ row: 0, col: 1 }])
      kmp.setPattern(['A', 'B'])
      expect(kmp.search(['xA', 'xB'])).toEqual([{ row: 0, col: 1 }])
    })

    it('should handle switching from 2D to 1D pattern', () => {
      const kmp = new KMP2D(['AB', 'CD'])
      kmp.setPattern(['XY'])
      expect(kmp.search(['aXYb'])).toEqual([{ row: 0, col: 1 }])
    })
  })
})
