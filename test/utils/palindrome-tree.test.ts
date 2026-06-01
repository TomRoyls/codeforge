import { describe, expect, it } from 'vitest'
import { PalindromeTree } from '../../src/utils/palindrome-tree.js'

describe('PalindromeTree', () => {
  it('finds distinct palindromes in "abba"', () => {
    const pt = new PalindromeTree('abba')
    expect(pt.getDistinctPalindromeCount()).toBe(4)
  })

  it('finds max palindrome length in "abba"', () => {
    const pt = new PalindromeTree('abba')
    expect(pt.getMaxPalindromeLength()).toBe(4)
  })

  it('handles single character', () => {
    const pt = new PalindromeTree('a')
    expect(pt.getDistinctPalindromeCount()).toBe(1)
    expect(pt.getMaxPalindromeLength()).toBe(1)
  })

  it('handles empty string', () => {
    const pt = new PalindromeTree('')
    expect(pt.getDistinctPalindromeCount()).toBe(0)
    expect(pt.getMaxPalindromeLength()).toBe(0)
  })

  it('handles "aaa"', () => {
    const pt = new PalindromeTree('aaa')
    expect(pt.getDistinctPalindromeCount()).toBe(3)
    expect(pt.getMaxPalindromeLength()).toBe(3)
  })

  it('getPalindromeLengths returns sorted lengths', () => {
    const pt = new PalindromeTree('abba')
    const lengths = pt.getPalindromeLengths()
    expect(lengths).toEqual([1, 1, 2, 4])
  })

  it('containsPalindromeOfLength works', () => {
    const pt = new PalindromeTree('aba')
    expect(pt.containsPalindromeOfLength(1)).toBe(true)
    expect(pt.containsPalindromeOfLength(3)).toBe(true)
    expect(pt.containsPalindromeOfLength(5)).toBe(false)
  })

  it('getTotalPalindromeCount counts occurrences', () => {
    const pt = new PalindromeTree('aaa')
    expect(pt.getTotalPalindromeCount()).toBe(6)
  })

  it('handles "abc" with no palindromes > 1', () => {
    const pt = new PalindromeTree('abc')
    expect(pt.getDistinctPalindromeCount()).toBe(3)
    expect(pt.getMaxPalindromeLength()).toBe(1)
  })

  it('getNodeCount includes sentinel nodes', () => {
    const pt = new PalindromeTree('ab')
    expect(pt.getNodeCount()).toBe(4)
  })

  it('handles "abacaba"', () => {
    const pt = new PalindromeTree('abacaba')
    expect(pt.getDistinctPalindromeCount()).toBe(7)
    expect(pt.getMaxPalindromeLength()).toBe(7)
  })

  it('handles "aaaa"', () => {
    const pt = new PalindromeTree('aaaa')
    expect(pt.getDistinctPalindromeCount()).toBe(4)
    expect(pt.getMaxPalindromeLength()).toBe(4)
  })

  it('getTotalPalindromeCount for "abba"', () => {
    const pt = new PalindromeTree('abba')
    expect(pt.getTotalPalindromeCount()).toBe(6)
  })

  it('containsPalindromeOfLength for "abba"', () => {
    const pt = new PalindromeTree('abba')
    expect(pt.containsPalindromeOfLength(1)).toBe(true)
    expect(pt.containsPalindromeOfLength(2)).toBe(true)
    expect(pt.containsPalindromeOfLength(4)).toBe(true)
    expect(pt.containsPalindromeOfLength(3)).toBe(false)
  })

  it('getPalindromeLengths are sorted', () => {
    const pt = new PalindromeTree('aba')
    const lengths = pt.getPalindromeLengths()
    for (let i = 1; i < lengths.length; i++) {
      expect(lengths[i]!).toBeGreaterThanOrEqual(lengths[i - 1]!)
    }
  })

  it('handles empty string', () => {
    const pt = new PalindromeTree('')
    expect(pt.getPalindromeLengths().length).toBe(0)
  })

  it('handles single character', () => {
    const pt = new PalindromeTree('a')
    expect(pt.getPalindromeLengths()).toContain(1)
  })

  it('handles empty string', () => {
    const pt = new PalindromeTree('')
    expect(pt.getPalindromeLengths()).toEqual([])
  })
})
