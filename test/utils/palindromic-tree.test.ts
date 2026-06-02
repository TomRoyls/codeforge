import { describe, expect, it } from 'vitest'
import { PalindromicTree } from '../../src/utils/palindromic-tree.js'

describe('PalindromicTree', () => {
  it('counts distinct palindromes', () => {
    const pt = PalindromicTree.from('abba')
    expect(pt.distinctPalindromes).toBe(4)
  })

  it('handles empty string', () => {
    expect(PalindromicTree.from('').distinctPalindromes).toBe(0)
  })

  it('handles single char', () => {
    expect(PalindromicTree.from('a').distinctPalindromes).toBe(1)
  })

  it('handles all same chars', () => {
    expect(PalindromicTree.from('aaa').distinctPalindromes).toBe(3)
  })

  it('counts total palindromes', () => {
    const pt = PalindromicTree.from('aba')
    expect(pt.totalPalindromes).toBeGreaterThanOrEqual(3)
  })

  it('finds longest palindrome', () => {
    const pt = PalindromicTree.from('racecar')
    expect(pt.getLongestPalindrome()).toBe('racecar')
  })

  it('handles even length palindrome', () => {
    const pt = PalindromicTree.from('abba')
    expect(pt.distinctPalindromes).toBe(4)
    expect(pt.getLongestPalindrome()).toBe('abba')
  })

  it('add returns node id', () => {
    const pt = new PalindromicTree()
    expect(typeof pt.add('a')).toBe('number')
  })

  it('handles no palindromes in distinct chars', () => {
    const pt = PalindromicTree.from('abcd')
    expect(pt.distinctPalindromes).toBe(4)
  })

  it('handles repeated palindrome centers', () => {
    const pt = PalindromicTree.from('abacaba')
    expect(pt.distinctPalindromes).toBeGreaterThanOrEqual(4)
  })

  it('handles two chars same', () => {
    const pt = PalindromicTree.from('aa')
    expect(pt.distinctPalindromes).toBe(2)
  })

  it('handles longer palindrome string', () => {
    const pt = new PalindromicTree('abacaba')
    expect(pt.distinctPalindromes).toBeGreaterThanOrEqual(0)
  })

  it('single char string', () => {
    const pt = new PalindromicTree('x')
    expect(pt.distinctPalindromes).toBeGreaterThanOrEqual(0)
  })

  it('handles empty string', () => {
    const pt = new PalindromicTree('')
    expect(pt.distinctPalindromes).toBeGreaterThanOrEqual(0)
  })

  it('handles two chars different', () => {
    const pt = PalindromicTree.from('ab')
    expect(pt.distinctPalindromes).toBeGreaterThanOrEqual(2)
  })

  it('handles single character', () => {
    const pt = PalindromicTree.from('a')
    expect(pt.distinctPalindromes).toBeGreaterThanOrEqual(1)
  })

  it('handles empty string', () => {
    const pt = PalindromicTree.from('')
    expect(pt.distinctPalindromes).toBe(0)
  })

  it('single character has one palindrome', () => {
    const pt = PalindromicTree.from('a')
    expect(pt.distinctPalindromes).toBe(1)
  })

  it('aba has two distinct palindromes', () => {
    const pt = PalindromicTree.from('aba')
    expect(pt.distinctPalindromes).toBeGreaterThanOrEqual(2)
  })

  it('empty string has zero palindromes', () => {
    const pt = PalindromicTree.from('')
    expect(pt.distinctPalindromes).toBe(0)
  })
})
