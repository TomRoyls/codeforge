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
})
