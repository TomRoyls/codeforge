import { describe, expect, it } from 'vitest'
import { PalindromeManacher } from '../../src/utils/palindrome-manacher.js'

describe('PalindromeManacher', () => {
  it('finds longest palindrome odd', () => {
    const m = new PalindromeManacher('racecar')
    expect(m.longestPalindrome()).toBe('racecar')
  })

  it('finds longest palindrome even', () => {
    const m = new PalindromeManacher('abba')
    expect(m.longestPalindrome()).toBe('abba')
  })

  it('handles single char', () => {
    const m = new PalindromeManacher('a')
    expect(m.longestPalindrome()).toBe('a')
  })

  it('handles empty string', () => {
    const m = new PalindromeManacher('')
    expect(m.longestPalindrome()).toBe('')
  })

  it('counts all palindromes', () => {
    const m = new PalindromeManacher('aaa')
    expect(m.countAllPalindromes()).toBe(6)
  })

  it('counts palindromes in abc', () => {
    const m = new PalindromeManacher('abc')
    expect(m.countAllPalindromes()).toBe(3)
  })

  it('finds palindrome in middle', () => {
    const m = new PalindromeManacher('xabay')
    expect(m.longestPalindrome()).toBe('aba')
  })

  it('checks isPalindrome', () => {
    const m = new PalindromeManacher('abacaba')
    expect(m.isPalindrome(0, 6)).toBe(true)
    expect(m.isPalindrome(0, 2)).toBe(true)
    expect(m.isPalindrome(1, 3)).toBe(false)
  })

  it('handles all same characters', () => {
    const m = new PalindromeManacher('aaaa')
    expect(m.longestPalindrome()).toBe('aaaa')
  })

  it('handles no long palindrome', () => {
    const m = new PalindromeManacher('abcdef')
    expect(m.longestPalindrome().length).toBe(1)
  })

  it('isPalindrome for even length', () => {
    const m = new PalindromeManacher('abba')
    expect(m.isPalindrome(0, 3)).toBe(true)
    expect(m.isPalindrome(0, 1)).toBe(false)
  })

  it('counts palindromes in abba', () => {
    const m = new PalindromeManacher('abba')
    expect(m.countAllPalindromes()).toBe(6)
  })

  it('handles single character', () => {
    const m = new PalindromeManacher('a')
    expect(m.isPalindrome(0, 0)).toBe(true)
    expect(m.countAllPalindromes()).toBe(1)
  })
})
