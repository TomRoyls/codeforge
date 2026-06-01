import { describe, expect, it } from 'vitest'
import { Eertree } from '../../src/utils/eertree.js'

describe('Eertree', () => {
  it('detects palindromes in string', () => {
    const tree = Eertree.build('abba')
    expect(tree.nodeCount).toBeGreaterThan(0)
  })

  it('handles single character', () => {
    const tree = Eertree.build('a')
    expect(tree.nodeCount).toBe(1)
  })

  it('handles empty string', () => {
    const tree = Eertree.build('')
    expect(tree.nodeCount).toBe(0)
  })

  it('detects all single chars', () => {
    const tree = Eertree.build('abc')
    expect(tree.nodeCount).toBe(3)
  })

  it('detects repeated palindrome', () => {
    const tree = Eertree.build('aaa')
    expect(tree.nodeCount).toBe(3)
  })

  it('hasPalindrome returns true for existing', () => {
    const tree = Eertree.build('aba')
    expect(tree.hasPalindrome('a')).toBe(true)
    expect(tree.hasPalindrome('b')).toBe(true)
    expect(tree.hasPalindrome('aba')).toBe(true)
  })

  it('hasPalindrome returns false for missing', () => {
    const tree = Eertree.build('abc')
    expect(tree.hasPalindrome('abc')).toBe(false)
  })

  it('handles even-length palindrome', () => {
    const tree = Eertree.build('abba')
    expect(tree.hasPalindrome('abba')).toBe(true)
    expect(tree.hasPalindrome('bb')).toBe(true)
  })

  it('handles long palindrome', () => {
    const tree = Eertree.build('racecar')
    expect(tree.hasPalindrome('racecar')).toBe(true)
    expect(tree.hasPalindrome('cec')).toBe(true)
  })

  it('addChar returns node id', () => {
    const tree = new Eertree()
    const n1 = tree.addChar('a')
    const n2 = tree.addChar('b')
    expect(typeof n1).toBe('number')
    expect(typeof n2).toBe('number')
  })

  it('getPalindromes returns palindromes', () => {
    const tree = Eertree.build('aa')
    const pals = tree.getPalindromes()
    expect(pals.length).toBeGreaterThan(0)
  })

  it('handles long palindrome', () => {
    const tree = Eertree.build('abacaba')
    const pals = tree.getPalindromes()
    expect(pals.length).toBeGreaterThanOrEqual(4)
  })

  it('single char has palindrome', () => {
    const tree = Eertree.build('x')
    expect(tree.getPalindromes().length).toBeGreaterThanOrEqual(1)
  })

  it('handles empty string', () => {
    const tree = Eertree.build('')
    expect(tree.getPalindromes().length).toBe(0)
  })

  it('handles repeated characters', () => {
    const tree = Eertree.build('aaa')
    const pals = tree.getPalindromes()
    expect(pals.length).toBeGreaterThanOrEqual(2)
    expect(tree.hasPalindrome('a')).toBe(true)
    expect(tree.hasPalindrome('aa')).toBe(true)
  })

  it('handles empty string', () => {
    const tree = Eertree.build('')
    expect(tree.getPalindromes().length).toBe(0)
  })
})
