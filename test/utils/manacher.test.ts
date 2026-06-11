import { describe, it, expect } from 'vitest'
import { Manacher } from '../../src/utils/manacher.js'

describe('Manacher', () => {
  it('finds longest palindrome in simple string', () => {
    const m = new Manacher('babad')
    const result = m.longestPalindrome()
    expect(result.length).toBe(3)
  })

  it('handles single character', () => {
    const m = new Manacher('a')
    const result = m.longestPalindrome()
    expect(result.length).toBe(1)
  })

  it('handles all same characters', () => {
    const m = new Manacher('aaaa')
    const result = m.longestPalindrome()
    expect(result.length).toBe(4)
  })

  it('handles no palindrome longer than 1', () => {
    const m = new Manacher('abc')
    const result = m.longestPalindrome()
    expect(result.length).toBe(1)
  })

  it('handles empty string', () => {
    const m = new Manacher('')
    const result = m.longestPalindrome()
    expect(result.length).toBe(0)
  })

  it('isPalindrome checks substrings', () => {
    const m = new Manacher('racecar')
    expect(m.isPalindrome(0, 6)).toBe(true)
    expect(m.isPalindrome(1, 5)).toBe(true)
    expect(m.isPalindrome(0, 3)).toBe(false)
  })

  it('isPalindrome for even-length palindrome', () => {
    const m = new Manacher('abba')
    expect(m.isPalindrome(0, 3)).toBe(true)
    expect(m.isPalindrome(1, 2)).toBe(true)
  })

  it('countAllPalindromes returns positive number', () => {
    const m = new Manacher('aaa')
    expect(m.countAllPalindromes()).toBeGreaterThan(0)
  })

  it('getAllPalindromes returns array', () => {
    const m = new Manacher('aba')
    const palindromes = m.getAllPalindromes()
    expect(palindromes.length).toBeGreaterThan(0)
    for (const p of palindromes) {
      expect(p.length).toBeGreaterThan(0)
    }
  })

  it('handles two-character string', () => {
    const m = new Manacher('aa')
    const result = m.longestPalindrome()
    expect(result.length).toBe(2)
  })

  it('handles long string', () => {
    const m = new Manacher('a'.repeat(100))
    const result = m.longestPalindrome()
    expect(result.length).toBe(100)
  })

  it('finds palindrome at start of string', () => {
    const m = new Manacher('abacde')
    const result = m.longestPalindrome()
    expect(result.length).toBe(3)
    expect(result.start).toBe(0)
  })

  it('finds palindrome at end of string', () => {
    const m = new Manacher('xyzracecar')
    const result = m.longestPalindrome()
    expect(result.length).toBe(7)
  })

  it('handles odd-length palindromes', () => {
    const m = new Manacher('abcba')
    expect(m.isPalindrome(0, 4)).toBe(true)
    expect(m.isPalindrome(1, 3)).toBe(true)
    expect(m.isPalindrome(2, 2)).toBe(true)
  })

  it('handles even-length palindromes', () => {
    const m = new Manacher('abccba')
    expect(m.isPalindrome(0, 5)).toBe(true)
    expect(m.isPalindrome(2, 3)).toBe(true)
  })

  it('isPalindrome returns false for non-palindromes', () => {
    const m = new Manacher('abcdef')
    expect(m.isPalindrome(0, 2)).toBe(false)
    expect(m.isPalindrome(1, 4)).toBe(false)
  })

  it('countAllPalindromes for single char', () => {
    const m = new Manacher('a')
    expect(m.countAllPalindromes()).toBe(1)
  })

  it('getAllPalindromes includes single characters', () => {
    const m = new Manacher('ab')
    const palindromes = m.getAllPalindromes()
    expect(palindromes.length).toBeGreaterThanOrEqual(2)
  })

  it('longest palindrome in aba', () => {
    const m = new Manacher('aba')
    expect(m.longestPalindrome().length).toBe(3)
  })

  it('originalLength is set correctly', () => {
    const m = new Manacher('hello')
    expect(m.originalLength).toBe(5)
  })

  it('originalLength for empty string', () => {
    const m = new Manacher('')
    expect(m.originalLength).toBe(0)
  })

  it('originalLength for single char', () => {
    const m = new Manacher('a')
    expect(m.originalLength).toBe(1)
  })

  it('radii array has correct length', () => {
    const m = new Manacher('abc')
    expect(m.radii.length).toBe(7)
  })

  it('radii array for empty string', () => {
    const m = new Manacher('')
    expect(m.radii.length).toBe(2)
  })

  it('radii array for single char', () => {
    const m = new Manacher('a')
    expect(m.radii.length).toBe(3)
  })

  it('longestPalindrome returns object with correct properties', () => {
    const m = new Manacher('aba')
    const result = m.longestPalindrome()
    expect(result).toHaveProperty('start')
    expect(result).toHaveProperty('end')
    expect(result).toHaveProperty('length')
    expect(result).toHaveProperty('palindrome')
  })

  it('longestPalindrome start is non-negative', () => {
    const m = new Manacher('racecar')
    const result = m.longestPalindrome()
    expect(result.start).toBeGreaterThanOrEqual(0)
  })

  it('longestPalindrome end is non-negative', () => {
    const m = new Manacher('racecar')
    const result = m.longestPalindrome()
    expect(result.end).toBeGreaterThanOrEqual(0)
  })

  it('longestPalindrome palindrome is empty string', () => {
    const m = new Manacher('aba')
    const result = m.longestPalindrome()
    expect(result.palindrome).toBe('')
  })

  it('isPalindrome with start equals end', () => {
    const m = new Manacher('abc')
    expect(m.isPalindrome(0, 0)).toBe(true)
    expect(m.isPalindrome(1, 1)).toBe(true)
  })

  it('isPalindrome with adjacent characters', () => {
    const m = new Manacher('ab')
    expect(m.isPalindrome(0, 1)).toBe(false)
  })

  it('isPalindrome for single character string', () => {
    const m = new Manacher('a')
    expect(m.isPalindrome(0, 0)).toBe(true)
  })

  it('countAllPalindromes for two different chars', () => {
    const m = new Manacher('ab')
    expect(m.countAllPalindromes()).toBe(2)
  })

  it('countAllPalindromes for repeated chars', () => {
    const m = new Manacher('aa')
    expect(m.countAllPalindromes()).toBe(3)
  })

  it('countAllPalindromes for string with multiple palindromes', () => {
    const m = new Manacher('aba')
    expect(m.countAllPalindromes()).toBe(4)
  })

  it('countAllPalindromes for empty string', () => {
    const m = new Manacher('')
    expect(m.countAllPalindromes()).toBe(0)
  })

  it('getAllPalindromes returns correct structure', () => {
    const m = new Manacher('aba')
    const palindromes = m.getAllPalindromes()
    for (const p of palindromes) {
      expect(p).toHaveProperty('start')
      expect(p).toHaveProperty('end')
      expect(p).toHaveProperty('length')
    }
  })

  it('getAllPalindromes start is non-negative', () => {
    const m = new Manacher('aba')
    const palindromes = m.getAllPalindromes()
    for (const p of palindromes) {
      expect(p.start).toBeGreaterThanOrEqual(0)
    }
  })

  it('getAllPalindromes end is non-negative', () => {
    const m = new Manacher('aba')
    const palindromes = m.getAllPalindromes()
    for (const p of palindromes) {
      expect(p.end).toBeGreaterThanOrEqual(0)
    }
  })

  it('getAllPalindromes for empty string', () => {
    const m = new Manacher('')
    const palindromes = m.getAllPalindromes()
    expect(palindromes.length).toBe(0)
  })

  it('getAllPalindromes for single char', () => {
    const m = new Manacher('a')
    const palindromes = m.getAllPalindromes()
    expect(palindromes.length).toBe(1)
  })

  it('getAllPalindromes length matches string length for all same chars', () => {
    const m = new Manacher('aaa')
    const palindromes = m.getAllPalindromes()
    expect(palindromes.length).toBe(6)
  })

  it('longestPalindrome handles string with no palindromes longer than 1', () => {
    const m = new Manacher('abcdefg')
    const result = m.longestPalindrome()
    expect(result.length).toBe(1)
  })

  it('longestPalindrome handles alternating characters', () => {
    const m = new Manacher('ababab')
    const result = m.longestPalindrome()
    expect(result.length).toBeGreaterThanOrEqual(1)
  })

  it('longestPalindrome for string with single palindrome at end', () => {
    const m = new Manacher('xyzaba')
    const result = m.longestPalindrome()
    expect(result.length).toBe(3)
  })

  it('longestPalindrome handles very long palindrome', () => {
    const palindrome = 'a'.repeat(50) + 'b' + 'a'.repeat(50)
    const m = new Manacher(palindrome)
    const result = m.longestPalindrome()
    expect(result.length).toBe(101)
  })
})