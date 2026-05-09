import { describe, it, expect } from 'vitest'
import { PalindromicTree } from '../../src/core/palindromic-tree/palindromic-tree.js'

describe('PalindromicTree', () => {
  describe('constructor', () => {
    it('should create empty tree when no argument', () => {
      const pt = new PalindromicTree()
      expect(pt.getLength()).toBe(0)
      expect(pt.countDistinctPalindromes()).toBe(0)
    })

    it('should create tree from string', () => {
      const pt = new PalindromicTree('aba')
      expect(pt.getLength()).toBe(3)
    })

    it('should create tree from empty string', () => {
      const pt = new PalindromicTree('')
      expect(pt.getLength()).toBe(0)
      expect(pt.countDistinctPalindromes()).toBe(0)
    })

    it('should create tree from single character', () => {
      const pt = new PalindromicTree('a')
      expect(pt.getLength()).toBe(1)
      expect(pt.countDistinctPalindromes()).toBe(1)
    })

    it('should handle undefined argument', () => {
      const pt = new PalindromicTree(undefined)
      expect(pt.getLength()).toBe(0)
    })

    it('should handle two identical characters', () => {
      const pt = new PalindromicTree('aa')
      expect(pt.countDistinctPalindromes()).toBe(2)
    })

    it('should handle three identical characters', () => {
      const pt = new PalindromicTree('aaa')
      expect(pt.countDistinctPalindromes()).toBe(3)
    })
  })

  describe('addChar', () => {
    it('should add single character', () => {
      const pt = new PalindromicTree()
      pt.addChar('a')
      expect(pt.getLength()).toBe(1)
      expect(pt.countDistinctPalindromes()).toBe(1)
    })

    it('should add characters one by one', () => {
      const pt = new PalindromicTree()
      pt.addChar('a')
      pt.addChar('b')
      pt.addChar('a')
      expect(pt.getLength()).toBe(3)
      expect(pt.countDistinctPalindromes()).toBe(3)
    })

    it('should detect palindrome "aa" when adding two same chars', () => {
      const pt = new PalindromicTree()
      pt.addChar('a')
      pt.addChar('a')
      expect(pt.containsPalindrome('a')).toBe(true)
      expect(pt.containsPalindrome('aa')).toBe(true)
    })

    it('should detect growing palindromes with repeated chars', () => {
      const pt = new PalindromicTree()
      pt.addChar('a')
      pt.addChar('a')
      pt.addChar('a')
      expect(pt.containsPalindrome('a')).toBe(true)
      expect(pt.containsPalindrome('aa')).toBe(true)
      expect(pt.containsPalindrome('aaa')).toBe(true)
    })

    it('should add characters after initial construction', () => {
      const pt = new PalindromicTree('ab')
      pt.addChar('a')
      expect(pt.containsPalindrome('aba')).toBe(true)
    })

    it('should handle mixed characters', () => {
      const pt = new PalindromicTree()
      pt.addChar('a')
      pt.addChar('b')
      pt.addChar('c')
      expect(pt.countDistinctPalindromes()).toBe(3)
    })

    it('should correctly handle "abba"', () => {
      const pt = new PalindromicTree()
      pt.addChar('a')
      pt.addChar('b')
      pt.addChar('b')
      pt.addChar('a')
      expect(pt.containsPalindrome('a')).toBe(true)
      expect(pt.containsPalindrome('b')).toBe(true)
      expect(pt.containsPalindrome('bb')).toBe(true)
      expect(pt.containsPalindrome('abba')).toBe(true)
    })

    it('should handle digit characters', () => {
      const pt = new PalindromicTree()
      pt.addChar('1')
      pt.addChar('2')
      pt.addChar('1')
      expect(pt.containsPalindrome('121')).toBe(true)
    })

    it('should handle special characters', () => {
      const pt = new PalindromicTree()
      pt.addChar('!')
      pt.addChar('!')
      expect(pt.containsPalindrome('!!')).toBe(true)
    })
  })

  describe('build', () => {
    it('should build from a string', () => {
      const pt = new PalindromicTree()
      pt.build('abcba')
      expect(pt.containsPalindrome('a')).toBe(true)
      expect(pt.containsPalindrome('b')).toBe(true)
      expect(pt.containsPalindrome('c')).toBe(true)
      expect(pt.containsPalindrome('bcb')).toBe(true)
      expect(pt.containsPalindrome('abcba')).toBe(true)
    })

    it('should build from empty string', () => {
      const pt = new PalindromicTree()
      pt.build('')
      expect(pt.getLength()).toBe(0)
    })

    it('should build incrementally with multiple build calls', () => {
      const pt = new PalindromicTree()
      pt.build('ab')
      pt.build('a')
      expect(pt.containsPalindrome('aba')).toBe(true)
      expect(pt.getLength()).toBe(3)
    })

    it('should build "abacaba" correctly', () => {
      const pt = new PalindromicTree()
      pt.build('abacaba')
      expect(pt.countDistinctPalindromes()).toBe(7)
    })

    it('should build "aaaa" correctly', () => {
      const pt = new PalindromicTree()
      pt.build('aaaa')
      expect(pt.countDistinctPalindromes()).toBe(4)
    })

    it('should build "abacdfgdcaba"', () => {
      const pt = new PalindromicTree()
      pt.build('abacdfgdcaba')
      expect(pt.containsPalindrome('aba')).toBe(true)
      expect(pt.containsPalindrome('aba')).toBe(true)
      expect(pt.containsPalindrome('g')).toBe(true)
    })
  })

  describe('containsPalindrome', () => {
    it('should return false for empty string', () => {
      const pt = new PalindromicTree('aba')
      expect(pt.containsPalindrome('')).toBe(false)
    })

    it('should return true for existing single-char palindrome', () => {
      const pt = new PalindromicTree('abc')
      expect(pt.containsPalindrome('a')).toBe(true)
      expect(pt.containsPalindrome('b')).toBe(true)
      expect(pt.containsPalindrome('c')).toBe(true)
    })

    it('should return false for non-palindromic substring', () => {
      const pt = new PalindromicTree('abc')
      expect(pt.containsPalindrome('ab')).toBe(false)
      expect(pt.containsPalindrome('bc')).toBe(false)
      expect(pt.containsPalindrome('abc')).toBe(false)
    })

    it('should find all palindromes in "aba"', () => {
      const pt = new PalindromicTree('aba')
      expect(pt.containsPalindrome('a')).toBe(true)
      expect(pt.containsPalindrome('b')).toBe(true)
      expect(pt.containsPalindrome('aba')).toBe(true)
    })

    it('should find nested palindromes', () => {
      const pt = new PalindromicTree('ababa')
      expect(pt.containsPalindrome('a')).toBe(true)
      expect(pt.containsPalindrome('b')).toBe(true)
      expect(pt.containsPalindrome('aba')).toBe(true)
      expect(pt.containsPalindrome('bab')).toBe(true)
      expect(pt.containsPalindrome('ababa')).toBe(true)
    })

    it('should return false for non-existent palindrome', () => {
      const pt = new PalindromicTree('abc')
      expect(pt.containsPalindrome('xyz')).toBe(false)
    })

    it('should find palindrome in "racecar"', () => {
      const pt = new PalindromicTree('racecar')
      expect(pt.containsPalindrome('racecar')).toBe(true)
      expect(pt.containsPalindrome('aceca')).toBe(true)
      expect(pt.containsPalindrome('cec')).toBe(true)
    })

    it('should work on empty tree', () => {
      const pt = new PalindromicTree()
      expect(pt.containsPalindrome('a')).toBe(false)
    })
  })

  describe('countDistinctPalindromes', () => {
    it('should return 0 for empty tree', () => {
      const pt = new PalindromicTree()
      expect(pt.countDistinctPalindromes()).toBe(0)
    })

    it('should return 1 for single character', () => {
      const pt = new PalindromicTree('a')
      expect(pt.countDistinctPalindromes()).toBe(1)
    })

    it('should count distinct palindromes in "aba"', () => {
      const pt = new PalindromicTree('aba')
      expect(pt.countDistinctPalindromes()).toBe(3)
    })

    it('should count distinct palindromes in "abba"', () => {
      const pt = new PalindromicTree('abba')
      expect(pt.countDistinctPalindromes()).toBe(4)
    })

    it('should count distinct palindromes in "aaaa"', () => {
      const pt = new PalindromicTree('aaaa')
      expect(pt.countDistinctPalindromes()).toBe(4)
    })

    it('should count distinct palindromes in "abc"', () => {
      const pt = new PalindromicTree('abc')
      expect(pt.countDistinctPalindromes()).toBe(3)
    })

    it('should count distinct palindromes in "abacaba"', () => {
      const pt = new PalindromicTree('abacaba')
      expect(pt.countDistinctPalindromes()).toBe(7)
    })

    it('should count distinct palindromes in "abab"', () => {
      const pt = new PalindromicTree('abab')
      expect(pt.countDistinctPalindromes()).toBe(4)
    })

    it('should handle "abcddcba"', () => {
      const pt = new PalindromicTree('abcddcba')
      expect(pt.countDistinctPalindromes()).toBe(8)
    })
  })

  describe('getAllPalindromes', () => {
    it('should return empty array for empty tree', () => {
      const pt = new PalindromicTree()
      expect(pt.getAllPalindromes()).toEqual([])
    })

    it('should return single palindrome for single char', () => {
      const pt = new PalindromicTree('a')
      expect(pt.getAllPalindromes()).toEqual(['a'])
    })

    it('should return all distinct palindromes for "aba"', () => {
      const pt = new PalindromicTree('aba')
      const pals = pt.getAllPalindromes()
      expect(pals).toHaveLength(3)
      expect(pals).toContain('a')
      expect(pals).toContain('b')
      expect(pals).toContain('aba')
    })

    it('should return all distinct palindromes for "abba"', () => {
      const pt = new PalindromicTree('abba')
      const pals = pt.getAllPalindromes()
      expect(pals).toHaveLength(4)
      expect(pals).toContain('a')
      expect(pals).toContain('b')
      expect(pals).toContain('bb')
      expect(pals).toContain('abba')
    })

    it('should return all palindromes for "aaaa"', () => {
      const pt = new PalindromicTree('aaaa')
      const pals = pt.getAllPalindromes()
      expect(pals).toHaveLength(4)
      expect(pals).toContain('a')
      expect(pals).toContain('aa')
      expect(pals).toContain('aaa')
      expect(pals).toContain('aaaa')
    })

    it('should return correct palindromes for "abc"', () => {
      const pt = new PalindromicTree('abc')
      const pals = pt.getAllPalindromes()
      expect(pals).toHaveLength(3)
      expect(pals).toContain('a')
      expect(pals).toContain('b')
      expect(pals).toContain('c')
    })
  })

  describe('getLongestPalindrome', () => {
    it('should return empty string for empty tree', () => {
      const pt = new PalindromicTree()
      expect(pt.getLongestPalindrome()).toBe('')
    })

    it('should return single char for single char input', () => {
      const pt = new PalindromicTree('a')
      expect(pt.getLongestPalindrome()).toBe('a')
    })

    it('should return longest palindrome for "aba"', () => {
      const pt = new PalindromicTree('aba')
      expect(pt.getLongestPalindrome()).toBe('aba')
    })

    it('should return longest palindrome for "abacaba"', () => {
      const pt = new PalindromicTree('abacaba')
      expect(pt.getLongestPalindrome()).toBe('abacaba')
    })

    it('should return longest palindrome for "abba"', () => {
      const pt = new PalindromicTree('abba')
      expect(pt.getLongestPalindrome()).toBe('abba')
    })

    it('should return longest palindrome for "aaaa"', () => {
      const pt = new PalindromicTree('aaaa')
      expect(pt.getLongestPalindrome()).toBe('aaaa')
    })

    it('should return longest palindrome for "abc"', () => {
      const pt = new PalindromicTree('abc')
      const longest = pt.getLongestPalindrome()
      expect(longest.length).toBe(1)
    })

    it('should return longest palindrome for "racecar"', () => {
      const pt = new PalindromicTree('racecar')
      expect(pt.getLongestPalindrome()).toBe('racecar')
    })

    it('should return longest for "abcbaxyz"', () => {
      const pt = new PalindromicTree('abcbaxyz')
      expect(pt.getLongestPalindrome()).toBe('abcba')
    })
  })

  describe('countOccurrences', () => {
    it('should return 0 for empty string', () => {
      const pt = new PalindromicTree('aba')
      expect(pt.countOccurrences('')).toBe(0)
    })

    it('should return 0 for non-existent palindrome', () => {
      const pt = new PalindromicTree('aba')
      expect(pt.countOccurrences('xyz')).toBe(0)
    })

    it('should count single char occurrences', () => {
      const pt = new PalindromicTree('aba')
      expect(pt.countOccurrences('a')).toBe(2)
      expect(pt.countOccurrences('b')).toBe(1)
    })

    it('should count occurrences of longer palindromes', () => {
      const pt = new PalindromicTree('aba')
      expect(pt.countOccurrences('aba')).toBe(1)
    })

    it('should count overlapping occurrences', () => {
      const pt = new PalindromicTree('aaa')
      expect(pt.countOccurrences('a')).toBe(3)
      expect(pt.countOccurrences('aa')).toBe(2)
      expect(pt.countOccurrences('aaa')).toBe(1)
    })

    it('should count occurrences in "ababa"', () => {
      const pt = new PalindromicTree('ababa')
      expect(pt.countOccurrences('a')).toBe(3)
      expect(pt.countOccurrences('b')).toBe(2)
      expect(pt.countOccurrences('aba')).toBe(2)
      expect(pt.countOccurrences('bab')).toBe(1)
      expect(pt.countOccurrences('ababa')).toBe(1)
    })

    it('should return 0 for non-palindromic string', () => {
      const pt = new PalindromicTree('aba')
      expect(pt.countOccurrences('ab')).toBe(0)
    })

    it('should handle empty tree', () => {
      const pt = new PalindromicTree()
      expect(pt.countOccurrences('a')).toBe(0)
    })

    it('should count occurrences in "abacaba"', () => {
      const pt = new PalindromicTree('abacaba')
      expect(pt.countOccurrences('a')).toBe(4)
      expect(pt.countOccurrences('b')).toBe(2)
      expect(pt.countOccurrences('c')).toBe(1)
    })
  })

  describe('getTotalPalindromicSubstrings', () => {
    it('should return 0 for empty tree', () => {
      const pt = new PalindromicTree()
      expect(pt.getTotalPalindromicSubstrings()).toBe(0)
    })

    it('should return 1 for single character', () => {
      const pt = new PalindromicTree('a')
      expect(pt.getTotalPalindromicSubstrings()).toBe(1)
    })

    it('should count all palindromic substrings in "aba"', () => {
      const pt = new PalindromicTree('aba')
      expect(pt.getTotalPalindromicSubstrings()).toBe(4)
    })

    it('should count all palindromic substrings in "aaa"', () => {
      const pt = new PalindromicTree('aaa')
      expect(pt.getTotalPalindromicSubstrings()).toBe(6)
    })

    it('should count all palindromic substrings in "abba"', () => {
      const pt = new PalindromicTree('abba')
      expect(pt.getTotalPalindromicSubstrings()).toBe(6)
    })

    it('should count all palindromic substrings in "abc"', () => {
      const pt = new PalindromicTree('abc')
      expect(pt.getTotalPalindromicSubstrings()).toBe(3)
    })

    it('should count all palindromic substrings in "ababa"', () => {
      const pt = new PalindromicTree('ababa')
      expect(pt.getTotalPalindromicSubstrings()).toBe(9)
    })

    it('should count for "aaaa"', () => {
      const pt = new PalindromicTree('aaaa')
      expect(pt.getTotalPalindromicSubstrings()).toBe(10)
    })

    it('should count for "abacaba"', () => {
      const pt = new PalindromicTree('abacaba')
      expect(pt.getTotalPalindromicSubstrings()).toBe(12)
    })
  })

  describe('getLength', () => {
    it('should return 0 for empty tree', () => {
      const pt = new PalindromicTree()
      expect(pt.getLength()).toBe(0)
    })

    it('should return length of built string', () => {
      const pt = new PalindromicTree('abcdef')
      expect(pt.getLength()).toBe(6)
    })

    it('should increase with addChar', () => {
      const pt = new PalindromicTree()
      pt.addChar('a')
      expect(pt.getLength()).toBe(1)
      pt.addChar('b')
      expect(pt.getLength()).toBe(2)
      pt.addChar('c')
      expect(pt.getLength()).toBe(3)
    })

    it('should increase with build', () => {
      const pt = new PalindromicTree('ab')
      expect(pt.getLength()).toBe(2)
      pt.build('cd')
      expect(pt.getLength()).toBe(4)
    })
  })

  describe('clone', () => {
    it('should create independent copy', () => {
      const pt = new PalindromicTree('aba')
      const cloned = pt.clone()
      expect(cloned.getLength()).toBe(3)
      expect(cloned.countDistinctPalindromes()).toBe(3)
    })

    it('should not affect original when modified', () => {
      const pt = new PalindromicTree('aba')
      const cloned = pt.clone()
      cloned.addChar('b')
      expect(pt.getLength()).toBe(3)
      expect(cloned.getLength()).toBe(4)
    })

    it('should preserve all palindromes', () => {
      const pt = new PalindromicTree('ababa')
      const cloned = pt.clone()
      expect(cloned.containsPalindrome('a')).toBe(true)
      expect(cloned.containsPalindrome('b')).toBe(true)
      expect(cloned.containsPalindrome('aba')).toBe(true)
      expect(cloned.containsPalindrome('bab')).toBe(true)
      expect(cloned.containsPalindrome('ababa')).toBe(true)
    })

    it('should clone empty tree', () => {
      const pt = new PalindromicTree()
      const cloned = pt.clone()
      expect(cloned.getLength()).toBe(0)
      expect(cloned.countDistinctPalindromes()).toBe(0)
    })

    it('should preserve total palindromic substrings count', () => {
      const pt = new PalindromicTree('aaa')
      const cloned = pt.clone()
      expect(cloned.getTotalPalindromicSubstrings()).toBe(pt.getTotalPalindromicSubstrings())
    })

    it('should preserve longest palindrome', () => {
      const pt = new PalindromicTree('racecar')
      const cloned = pt.clone()
      expect(cloned.getLongestPalindrome()).toBe(pt.getLongestPalindrome())
    })

    it('should deep clone node transitions', () => {
      const pt = new PalindromicTree('ab')
      const cloned = pt.clone()
      cloned.addChar('a')
      expect(pt.containsPalindrome('aba')).toBe(false)
      expect(cloned.containsPalindrome('aba')).toBe(true)
    })
  })

  describe('clear', () => {
    it('should reset tree to empty state', () => {
      const pt = new PalindromicTree('aba')
      pt.clear()
      expect(pt.getLength()).toBe(0)
      expect(pt.countDistinctPalindromes()).toBe(0)
      expect(pt.getAllPalindromes()).toEqual([])
    })

    it('should reset total palindromic substrings', () => {
      const pt = new PalindromicTree('aaa')
      expect(pt.getTotalPalindromicSubstrings()).toBeGreaterThan(0)
      pt.clear()
      expect(pt.getTotalPalindromicSubstrings()).toBe(0)
    })

    it('should allow building again after clear', () => {
      const pt = new PalindromicTree('aba')
      pt.clear()
      pt.build('cdc')
      expect(pt.containsPalindrome('c')).toBe(true)
      expect(pt.containsPalindrome('d')).toBe(true)
      expect(pt.containsPalindrome('cdc')).toBe(true)
      expect(pt.getLength()).toBe(3)
    })

    it('should reset longest palindrome', () => {
      const pt = new PalindromicTree('racecar')
      pt.clear()
      expect(pt.getLongestPalindrome()).toBe('')
    })

    it('should allow addChar after clear', () => {
      const pt = new PalindromicTree('abc')
      pt.clear()
      pt.addChar('x')
      expect(pt.getLength()).toBe(1)
      expect(pt.containsPalindrome('x')).toBe(true)
    })

    it('should handle multiple clear calls', () => {
      const pt = new PalindromicTree('aba')
      pt.clear()
      pt.clear()
      expect(pt.getLength()).toBe(0)
    })
  })

  describe('complex strings', () => {
    it('should handle "abcddcba"', () => {
      const pt = new PalindromicTree('abcddcba')
      expect(pt.containsPalindrome('a')).toBe(true)
      expect(pt.containsPalindrome('b')).toBe(true)
      expect(pt.containsPalindrome('c')).toBe(true)
      expect(pt.containsPalindrome('d')).toBe(true)
      expect(pt.containsPalindrome('dd')).toBe(true)
      expect(pt.containsPalindrome('cddc')).toBe(true)
      expect(pt.containsPalindrome('bcddcb')).toBe(true)
      expect(pt.containsPalindrome('abcddcba')).toBe(true)
    })

    it('should handle "malayalam"', () => {
      const pt = new PalindromicTree('malayalam')
      expect(pt.getLongestPalindrome()).toBe('malayalam')
    })

    it('should handle string with no multi-char palindromes', () => {
      const pt = new PalindromicTree('abcdef')
      expect(pt.countDistinctPalindromes()).toBe(6)
      expect(pt.getLongestPalindrome().length).toBe(1)
    })

    it('should handle "aabaa"', () => {
      const pt = new PalindromicTree('aabaa')
      expect(pt.containsPalindrome('a')).toBe(true)
      expect(pt.containsPalindrome('aa')).toBe(true)
      expect(pt.containsPalindrome('aba')).toBe(true)
      expect(pt.containsPalindrome('aabaa')).toBe(true)
    })

    it('should handle "xabay"', () => {
      const pt = new PalindromicTree('xabay')
      expect(pt.containsPalindrome('aba')).toBe(true)
      expect(pt.getLongestPalindrome()).toBe('aba')
    })

    it('should handle "abcaacba"', () => {
      const pt = new PalindromicTree('abcaacba')
      expect(pt.containsPalindrome('a')).toBe(true)
      expect(pt.containsPalindrome('b')).toBe(true)
      expect(pt.containsPalindrome('c')).toBe(true)
      expect(pt.containsPalindrome('aa')).toBe(true)
    })

    it('should handle "banana"', () => {
      const pt = new PalindromicTree('banana')
      expect(pt.containsPalindrome('a')).toBe(true)
      expect(pt.containsPalindrome('n')).toBe(true)
      expect(pt.containsPalindrome('ana')).toBe(true)
      expect(pt.containsPalindrome('anana')).toBe(true)
    })

    it('should handle "mississippi"', () => {
      const pt = new PalindromicTree('mississippi')
      expect(pt.containsPalindrome('i')).toBe(true)
      expect(pt.containsPalindrome('s')).toBe(true)
      expect(pt.containsPalindrome('p')).toBe(true)
      expect(pt.containsPalindrome('m')).toBe(true)
      expect(pt.containsPalindrome('issi')).toBe(true)
    })

    it('should handle palindrome with spaces', () => {
      const pt = new PalindromicTree('a a')
      expect(pt.containsPalindrome('a')).toBe(true)
      expect(pt.containsPalindrome(' ')).toBe(true)
    })
  })

  describe('case sensitivity', () => {
    it('should be case sensitive by default', () => {
      const pt = new PalindromicTree('Aa')
      expect(pt.containsPalindrome('A')).toBe(true)
      expect(pt.containsPalindrome('a')).toBe(true)
      expect(pt.containsPalindrome('Aa')).toBe(false)
    })

    it('should be case insensitive when option set', () => {
      const pt = new PalindromicTree('Aa', { caseSensitive: false })
      expect(pt.containsPalindrome('a')).toBe(true)
      expect(pt.containsPalindrome('aa')).toBe(true)
    })

    it('should handle mixed case with case insensitive', () => {
      const pt = new PalindromicTree('AbA', { caseSensitive: false })
      expect(pt.containsPalindrome('aba')).toBe(true)
    })

    it('should distinguish cases when case sensitive', () => {
      const pt = new PalindromicTree('AbA', { caseSensitive: true })
      expect(pt.containsPalindrome('A')).toBe(true)
      expect(pt.containsPalindrome('b')).toBe(true)
      expect(pt.containsPalindrome('AbA')).toBe(true)
      expect(pt.containsPalindrome('aba')).toBe(false)
    })
  })

  describe('incremental building', () => {
    it('should produce same result regardless of build method', () => {
      const pt1 = new PalindromicTree('abcba')
      const pt2 = new PalindromicTree()
      pt2.build('abcba')
      const pt3 = new PalindromicTree()
      pt3.addChar('a')
      pt3.addChar('b')
      pt3.addChar('c')
      pt3.addChar('b')
      pt3.addChar('a')

      expect(pt1.countDistinctPalindromes()).toBe(pt2.countDistinctPalindromes())
      expect(pt2.countDistinctPalindromes()).toBe(pt3.countDistinctPalindromes())
      expect(pt1.getLongestPalindrome()).toBe(pt2.getLongestPalindrome())
      expect(pt2.getLongestPalindrome()).toBe(pt3.getLongestPalindrome())
    })

    it('should support multiple build calls', () => {
      const pt = new PalindromicTree()
      pt.build('aba')
      expect(pt.containsPalindrome('aba')).toBe(true)
      pt.build('cdc')
      expect(pt.containsPalindrome('cdc')).toBe(true)
      expect(pt.containsPalindrome('aba')).toBe(true)
    })

    it('should mix addChar and build', () => {
      const pt = new PalindromicTree()
      pt.addChar('a')
      pt.build('ba')
      expect(pt.containsPalindrome('aba')).toBe(true)
      expect(pt.getLength()).toBe(3)
    })
  })

  describe('edge cases', () => {
    it('should handle single repeated character of length 10', () => {
      const pt = new PalindromicTree('aaaaaaaaaa')
      expect(pt.countDistinctPalindromes()).toBe(10)
      expect(pt.getLongestPalindrome()).toBe('aaaaaaaaaa')
    })

    it('should handle all same characters palindrome', () => {
      const pt = new PalindromicTree('zzzz')
      expect(pt.countDistinctPalindromes()).toBe(4)
      expect(pt.getTotalPalindromicSubstrings()).toBe(10)
    })

    it('should handle alternating characters "abababab"', () => {
      const pt = new PalindromicTree('abababab')
      expect(pt.containsPalindrome('a')).toBe(true)
      expect(pt.containsPalindrome('b')).toBe(true)
      expect(pt.containsPalindrome('aba')).toBe(true)
      expect(pt.containsPalindrome('bab')).toBe(true)
    })

    it('should handle "xabax"', () => {
      const pt = new PalindromicTree('xabax')
      expect(pt.getLongestPalindrome()).toBe('xabax')
    })

    it('should handle string where entire string is palindrome', () => {
      const pt = new PalindromicTree('level')
      expect(pt.getLongestPalindrome()).toBe('level')
    })

    it('should handle string with all distinct characters', () => {
      const pt = new PalindromicTree('abcdefg')
      expect(pt.countDistinctPalindromes()).toBe(7)
    })

    it('should count occurrences correctly after clone', () => {
      const pt = new PalindromicTree('aaa')
      const cloned = pt.clone()
      expect(cloned.countOccurrences('a')).toBe(3)
      expect(cloned.countOccurrences('aa')).toBe(2)
      expect(cloned.countOccurrences('aaa')).toBe(1)
    })

    it('should handle unicode characters', () => {
      const pt = new PalindromicTree()
      pt.addChar('ñ')
      pt.addChar('ö')
      pt.addChar('ñ')
      expect(pt.containsPalindrome('ñ')).toBe(true)
      expect(pt.containsPalindrome('ö')).toBe(true)
      expect(pt.containsPalindrome('ñöñ')).toBe(true)
    })

    it('should handle emoji characters', () => {
      const pt = new PalindromicTree()
      pt.addChar('🎉')
      pt.addChar('🔥')
      pt.addChar('🎉')
      expect(pt.containsPalindrome('🎉')).toBe(true)
      expect(pt.containsPalindrome('🔥')).toBe(true)
      expect(pt.containsPalindrome('🎉🔥🎉')).toBe(true)
    })
  })

  describe('verification against brute force', () => {
    function bruteForceDistinctPalindromes(text: string): Set<string> {
      const palindromes = new Set<string>()
      for (let i = 0; i < text.length; i++) {
        for (let j = i + 1; j <= text.length; j++) {
          const sub = text.slice(i, j)
          if (sub === sub.split('').reverse().join('')) {
            palindromes.add(sub)
          }
        }
      }
      return palindromes
    }

    it('should match brute force for "aba"', () => {
      const bf = bruteForceDistinctPalindromes('aba')
      const pt = new PalindromicTree('aba')
      expect(pt.countDistinctPalindromes()).toBe(bf.size)
      for (const p of bf) {
        expect(pt.containsPalindrome(p)).toBe(true)
      }
    })

    it('should match brute force for "ababa"', () => {
      const bf = bruteForceDistinctPalindromes('ababa')
      const pt = new PalindromicTree('ababa')
      expect(pt.countDistinctPalindromes()).toBe(bf.size)
      for (const p of bf) {
        expect(pt.containsPalindrome(p)).toBe(true)
      }
    })

    it('should match brute force for "aaaa"', () => {
      const bf = bruteForceDistinctPalindromes('aaaa')
      const pt = new PalindromicTree('aaaa')
      expect(pt.countDistinctPalindromes()).toBe(bf.size)
      for (const p of bf) {
        expect(pt.containsPalindrome(p)).toBe(true)
      }
    })

    it('should match brute force for "abba"', () => {
      const bf = bruteForceDistinctPalindromes('abba')
      const pt = new PalindromicTree('abba')
      expect(pt.countDistinctPalindromes()).toBe(bf.size)
      for (const p of bf) {
        expect(pt.containsPalindrome(p)).toBe(true)
      }
    })

    it('should match brute force for "abcba"', () => {
      const bf = bruteForceDistinctPalindromes('abcba')
      const pt = new PalindromicTree('abcba')
      expect(pt.countDistinctPalindromes()).toBe(bf.size)
      for (const p of bf) {
        expect(pt.containsPalindrome(p)).toBe(true)
      }
    })

    it('should match brute force for "abcddcba"', () => {
      const bf = bruteForceDistinctPalindromes('abcddcba')
      const pt = new PalindromicTree('abcddcba')
      expect(pt.countDistinctPalindromes()).toBe(bf.size)
      for (const p of bf) {
        expect(pt.containsPalindrome(p)).toBe(true)
      }
    })

    it('should match brute force for "banana"', () => {
      const bf = bruteForceDistinctPalindromes('banana')
      const pt = new PalindromicTree('banana')
      expect(pt.countDistinctPalindromes()).toBe(bf.size)
      for (const p of bf) {
        expect(pt.containsPalindrome(p)).toBe(true)
      }
    })
  })
})
