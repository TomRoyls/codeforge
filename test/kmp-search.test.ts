import { describe, it, expect } from 'vitest'
import { KMPSearch } from '../src/core/kmp-search/index.js'

describe('KMPSearch', () => {
  describe('constructor', () => {
    it('should create instance with pattern', () => {
      const kmp = new KMPSearch('abc')
      expect(kmp).toBeDefined()
    })

    it('should handle empty pattern', () => {
      const kmp = new KMPSearch('')
      expect(kmp).toBeDefined()
    })

    it('should handle single character pattern', () => {
      const kmp = new KMPSearch('a')
      expect(kmp).toBeDefined()
    })

    it('should handle pattern with repeated characters', () => {
      const kmp = new KMPSearch('aaa')
      expect(kmp).toBeDefined()
    })

    it('should handle pattern with special characters', () => {
      const kmp = new KMPSearch('a-b-c')
      expect(kmp).toBeDefined()
    })

    it('should handle pattern with spaces', () => {
      const kmp = new KMPSearch('hello world')
      expect(kmp).toBeDefined()
    })
  })

  describe('search', () => {
    it('should find single match at start', () => {
      const kmp = new KMPSearch('abc')
      const result = kmp.search('abcdef')
      expect(result).toEqual([0])
    })

    it('should find single match in middle', () => {
      const kmp = new KMPSearch('abc')
      const result = kmp.search('xyzabcdef')
      expect(result).toEqual([3])
    })

    it('should find single match at end', () => {
      const kmp = new KMPSearch('abc')
      const result = kmp.search('xyzabc')
      expect(result).toEqual([3])
    })

    it('should find multiple non-overlapping matches', () => {
      const kmp = new KMPSearch('abc')
      const result = kmp.search('abcxyzabc')
      expect(result).toEqual([0, 6])
    })

    it('should find overlapping matches', () => {
      const kmp = new KMPSearch('aa')
      const result = kmp.search('aaaa')
      expect(result).toEqual([0, 1, 2])
    })

    it('should return empty array when no match', () => {
      const kmp = new KMPSearch('abc')
      const result = kmp.search('xyz')
      expect(result).toEqual([])
    })

    it('should handle empty pattern matching all positions', () => {
      const kmp = new KMPSearch('')
      const result = kmp.search('abc')
      expect(result).toEqual([0, 1, 2, 3])
    })

    it('should handle empty text with non-empty pattern', () => {
      const kmp = new KMPSearch('abc')
      const result = kmp.search('')
      expect(result).toEqual([])
    })

    it('should handle empty text with empty pattern', () => {
      const kmp = new KMPSearch('')
      const result = kmp.search('')
      expect(result).toEqual([0])
    })

    it('should handle pattern longer than text', () => {
      const kmp = new KMPSearch('abcdef')
      const result = kmp.search('abc')
      expect(result).toEqual([])
    })

    it('should handle pattern equal to text', () => {
      const kmp = new KMPSearch('abc')
      const result = kmp.search('abc')
      expect(result).toEqual([0])
    })

    it('should handle single character pattern', () => {
      const kmp = new KMPSearch('a')
      const result = kmp.search('banana')
      expect(result).toEqual([1, 3, 5])
    })

    it('should handle pattern with repeated characters', () => {
      const kmp = new KMPSearch('aaa')
      const result = kmp.search('aaaaa')
      expect(result).toEqual([0, 1, 2])
    })

    it('should handle case sensitivity', () => {
      const kmp = new KMPSearch('ABC')
      const result = kmp.search('abcABCabc')
      expect(result).toEqual([3])
    })

    it('should handle pattern with special characters', () => {
      const kmp = new KMPSearch('a-b')
      const result = kmp.search('x a-b y a-b z')
      expect(result).toEqual([2, 8])
    })

    it('should handle unicode characters', () => {
      const kmp = new KMPSearch('café')
      const result = kmp.search('I love café café')
      expect(result).toEqual([7, 12])
    })

    it('should handle newlines', () => {
      const kmp = new KMPSearch('test')
      const result = kmp.search('line1\ntest\nline3')
      expect(result).toEqual([6])
    })

    it('should handle tabs', () => {
      const kmp = new KMPSearch('test')
      const result = kmp.search('\ttest\t')
      expect(result).toEqual([1])
    })

    it('should handle numbers in pattern', () => {
      const kmp = new KMPSearch('123')
      const result = kmp.search('abc123def123ghi')
      expect(result).toEqual([3, 9])
    })
  })

  describe('contains', () => {
    it('should return true when pattern exists', () => {
      const kmp = new KMPSearch('abc')
      expect(kmp.contains('xyzabcdef')).toBe(true)
    })

    it('should return false when pattern does not exist', () => {
      const kmp = new KMPSearch('abc')
      expect(kmp.contains('xyz')).toBe(false)
    })

    it('should return true for pattern at start', () => {
      const kmp = new KMPSearch('abc')
      expect(kmp.contains('abcdef')).toBe(true)
    })

    it('should return true for pattern at end', () => {
      const kmp = new KMPSearch('abc')
      expect(kmp.contains('xyzabc')).toBe(true)
    })

    it('should return true for empty pattern', () => {
      const kmp = new KMPSearch('')
      expect(kmp.contains('abc')).toBe(true)
    })

    it('should return false for empty text', () => {
      const kmp = new KMPSearch('abc')
      expect(kmp.contains('')).toBe(false)
    })

    it('should return true for empty pattern and empty text', () => {
      const kmp = new KMPSearch('')
      expect(kmp.contains('')).toBe(true)
    })

    it('should handle single character pattern', () => {
      const kmp = new KMPSearch('a')
      expect(kmp.contains('banana')).toBe(true)
      expect(kmp.contains('xyz')).toBe(false)
    })

    it('should handle case sensitivity', () => {
      const kmp = new KMPSearch('ABC')
      expect(kmp.contains('abc')).toBe(false)
      expect(kmp.contains('ABC')).toBe(true)
    })

    it('should handle unicode characters', () => {
      const kmp = new KMPSearch('café')
      expect(kmp.contains('I love café')).toBe(true)
    })
  })

  describe('count', () => {
    it('should return 0 for no matches', () => {
      const kmp = new KMPSearch('abc')
      expect(kmp.count('xyz')).toBe(0)
    })

    it('should return 1 for single match', () => {
      const kmp = new KMPSearch('abc')
      expect(kmp.count('xyzabcdef')).toBe(1)
    })

    it('should return count for multiple matches', () => {
      const kmp = new KMPSearch('abc')
      expect(kmp.count('abcabcabc')).toBe(3)
    })

    it('should count overlapping matches', () => {
      const kmp = new KMPSearch('aa')
      expect(kmp.count('aaaa')).toBe(3)
    })

    it('should return length for empty pattern', () => {
      const kmp = new KMPSearch('')
      expect(kmp.count('abc')).toBe(4)
    })

    it('should return 0 for empty text', () => {
      const kmp = new KMPSearch('abc')
      expect(kmp.count('')).toBe(0)
    })

    it('should return 1 for pattern equal to text', () => {
      const kmp = new KMPSearch('abc')
      expect(kmp.count('abc')).toBe(1)
    })

    it('should handle single character pattern', () => {
      const kmp = new KMPSearch('a')
      expect(kmp.count('banana')).toBe(3)
    })

    it('should handle repeated characters in pattern', () => {
      const kmp = new KMPSearch('aaa')
      expect(kmp.count('aaaaa')).toBe(3)
    })
  })

  describe('first', () => {
    it('should return position of first match', () => {
      const kmp = new KMPSearch('abc')
      expect(kmp.first('xyzabcdef')).toBe(3)
    })

    it('should return 0 for match at start', () => {
      const kmp = new KMPSearch('abc')
      expect(kmp.first('abcdef')).toBe(0)
    })

    it('should return -1 for no match', () => {
      const kmp = new KMPSearch('abc')
      expect(kmp.first('xyz')).toBe(-1)
    })

    it('should return 0 for empty pattern', () => {
      const kmp = new KMPSearch('')
      expect(kmp.first('abc')).toBe(0)
    })

    it('should return -1 for empty text', () => {
      const kmp = new KMPSearch('abc')
      expect(kmp.first('')).toBe(-1)
    })

    it('should return 0 for empty pattern and empty text', () => {
      const kmp = new KMPSearch('')
      expect(kmp.first('')).toBe(0)
    })

    it('should find first among multiple matches', () => {
      const kmp = new KMPSearch('abc')
      expect(kmp.first('abcxyzabc')).toBe(0)
    })

    it('should handle single character pattern', () => {
      const kmp = new KMPSearch('a')
      expect(kmp.first('banana')).toBe(1)
    })

    it('should handle case sensitivity', () => {
      const kmp = new KMPSearch('ABC')
      expect(kmp.first('abcABCabc')).toBe(3)
    })
  })

  describe('static search', () => {
    it('should find single match', () => {
      const result = KMPSearch.search('abcdef', 'abc')
      expect(result).toEqual([0])
    })

    it('should find multiple matches', () => {
      const result = KMPSearch.search('abcabc', 'abc')
      expect(result).toEqual([0, 3])
    })

    it('should return empty array for no match', () => {
      const result = KMPSearch.search('xyz', 'abc')
      expect(result).toEqual([])
    })

    it('should handle empty pattern', () => {
      const result = KMPSearch.search('abc', '')
      expect(result).toEqual([0, 1, 2, 3])
    })

    it('should handle empty text', () => {
      const result = KMPSearch.search('', 'abc')
      expect(result).toEqual([])
    })

    it('should handle empty text and empty pattern', () => {
      const result = KMPSearch.search('', '')
      expect(result).toEqual([0])
    })

    it('should find overlapping matches', () => {
      const result = KMPSearch.search('aaaa', 'aa')
      expect(result).toEqual([0, 1, 2])
    })

    it('should handle case sensitivity', () => {
      const result = KMPSearch.search('abcABC', 'ABC')
      expect(result).toEqual([3])
    })

    it('should handle unicode characters', () => {
      const result = KMPSearch.search('cafécafé', 'café')
      expect(result).toEqual([0, 4])
    })

    it('should handle pattern longer than text', () => {
      const result = KMPSearch.search('abc', 'abcdef')
      expect(result).toEqual([])
    })
  })

  describe('static buildLPS', () => {
    it('should build LPS for single character', () => {
      const result = KMPSearch.buildLPS('a')
      expect(result).toEqual([0])
    })

    it('should build LPS for string with no repeating prefix', () => {
      const result = KMPSearch.buildLPS('abc')
      expect(result).toEqual([0, 0, 0])
    })

    it('should build LPS for string with repeating characters', () => {
      const result = KMPSearch.buildLPS('aaaa')
      expect(result).toEqual([0, 1, 2, 3])
    })

    it('should build LPS for string with partial matches', () => {
      const result = KMPSearch.buildLPS('abab')
      expect(result).toEqual([0, 0, 1, 2])
    })

    it('should build LPS for string with complex pattern', () => {
      const result = KMPSearch.buildLPS('aabaaba')
      expect(result).toEqual([0, 1, 0, 1, 2, 3, 4])
    })

    it('should build LPS for string with prefix-suffix match', () => {
      const result = KMPSearch.buildLPS('abcabcabc')
      expect(result).toEqual([0, 0, 0, 1, 2, 3, 4, 5, 6])
    })

    it('should build LPS for string with no proper prefix-suffix', () => {
      const result = KMPSearch.buildLPS('abcd')
      expect(result).toEqual([0, 0, 0, 0])
    })

    it('should build LPS for alternating pattern', () => {
      const result = KMPSearch.buildLPS('ababa')
      expect(result).toEqual([0, 0, 1, 2, 3])
    })

    it('should build LPS for empty string', () => {
      const result = KMPSearch.buildLPS('')
      expect(result).toEqual([])
    })

    it('should build LPS for two characters', () => {
      const result = KMPSearch.buildLPS('ab')
      expect(result).toEqual([0, 0])
    })

    it('should build LPS for two identical characters', () => {
      const result = KMPSearch.buildLPS('aa')
      expect(result).toEqual([0, 1])
    })

    it('should build LPS for string with single repeated character', () => {
      const result = KMPSearch.buildLPS('aabaa')
      expect(result).toEqual([0, 1, 0, 1, 2])
    })
  })

  describe('edge cases', () => {
    it('should handle very long text', () => {
      const kmp = new KMPSearch('test')
      const longText = 'a'.repeat(10000) + 'test' + 'b'.repeat(10000)
      const result = kmp.search(longText)
      expect(result).toEqual([10000])
    })

    it('should handle very long pattern', () => {
      const longPattern = 'a'.repeat(1000)
      const kmp = new KMPSearch(longPattern)
      const text = 'x' + longPattern + 'y'
      const result = kmp.search(text)
      expect(result).toEqual([1])
    })

    it('should handle pattern matching entire text', () => {
      const kmp = new KMPSearch('abc')
      expect(kmp.search('abc')).toEqual([0])
      expect(kmp.contains('abc')).toBe(true)
      expect(kmp.count('abc')).toBe(1)
      expect(kmp.first('abc')).toBe(0)
    })

    it('should handle text shorter than pattern', () => {
      const kmp = new KMPSearch('abcdef')
      expect(kmp.search('abc')).toEqual([])
      expect(kmp.contains('abc')).toBe(false)
      expect(kmp.count('abc')).toBe(0)
      expect(kmp.first('abc')).toBe(-1)
    })

    it('should handle pattern with only special characters', () => {
      const kmp = new KMPSearch('!!!')
      const text = 'x!!!y!!!z'
      expect(kmp.search(text)).toEqual([1, 5])
    })

    it('should handle whitespace pattern', () => {
      const kmp = new KMPSearch('  ')
      const text = 'a  b  c'
      expect(kmp.search(text)).toEqual([1, 4])
    })
  })

  describe('integration tests', () => {
    it('should handle complex search scenario', () => {
      const kmp = new KMPSearch('abc')
      const text = 'xyz abc def abc ghi abc'

      expect(kmp.search(text)).toEqual([4, 12, 20])
      expect(kmp.contains(text)).toBe(true)
      expect(kmp.count(text)).toBe(3)
      expect(kmp.first(text)).toBe(4)
    })

    it('should handle multiple instances with various methods', () => {
      const kmp1 = new KMPSearch('abc')
      const kmp2 = new KMPSearch('xyz')

      const text = 'abc xyz abc'

      expect(kmp1.search(text)).toEqual([0, 8])
      expect(kmp2.search(text)).toEqual([4])
      expect(kmp1.count(text)).toBe(2)
      expect(kmp2.count(text)).toBe(1)
    })

    it('should maintain correct state across searches', () => {
      const kmp = new KMPSearch('abc')

      expect(kmp.search('abc')).toEqual([0])
      expect(kmp.search('xyz')).toEqual([])
      expect(kmp.search('abcabc')).toEqual([0, 3])
      expect(kmp.search('')).toEqual([])
    })

    it('should work with static and instance methods consistently', () => {
      const pattern = 'abc'
      const text = 'xyz abc def'

      const instanceResult = new KMPSearch(pattern).search(text)
      const staticResult = KMPSearch.search(text, pattern)

      expect(instanceResult).toEqual(staticResult)
    })
  })

  describe('performance characteristics', () => {
    it('should handle pattern with many repeats efficiently', () => {
      const kmp = new KMPSearch('a'.repeat(100))
      const text = 'b'.repeat(1000) + 'a'.repeat(100) + 'c'.repeat(1000)
      const result = kmp.search(text)
      expect(result).toEqual([1000])
    })

    it('should handle text with many potential matches efficiently', () => {
      const kmp = new KMPSearch('aba')
      const text = 'aba'.repeat(1000)
      const result = kmp.search(text)
      expect(result.length).toBe(1000)
    })
  })
})