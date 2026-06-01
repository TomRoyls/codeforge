import { describe, expect, it } from 'vitest'
import { SuffixAutomatonLight } from '../../src/utils/suffix-automaton-light.js'

describe('SuffixAutomatonLight', () => {
  it('contains substring', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('abcbc')
    expect(sa.contains('abc')).toBe(true)
    expect(sa.contains('bc')).toBe(true)
    expect(sa.contains('xyz')).toBe(false)
  })

  it('handles empty string', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('')
    expect(sa.contains('')).toBe(true)
  })

  it('handles single char', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('a')
    expect(sa.contains('a')).toBe(true)
    expect(sa.contains('b')).toBe(false)
  })

  it('finds LCS', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('abcdef')
    expect(sa.longestCommonSubstring('cdefg')).toBe(4)
  })

  it('finds LCS no common', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('abc')
    expect(sa.longestCommonSubstring('xyz')).toBe(0)
  })

  it('counts distinct substrings', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('aaa')
    expect(sa.countDistinctSubstrings()).toBe(3)
  })

  it('counts distinct substrings of abc', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('abc')
    expect(sa.countDistinctSubstrings()).toBe(6)
  })

  it('tracks state count', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('abc')
    expect(sa.stateCount).toBeGreaterThan(1)
  })

  it('handles repeated pattern', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('ababab')
    expect(sa.contains('ab')).toBe(true)
    expect(sa.contains('aba')).toBe(true)
    expect(sa.contains('bab')).toBe(true)
    expect(sa.contains('abc')).toBe(false)
  })

  it('handles palindrome string', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('racecar')
    expect(sa.contains('race')).toBe(true)
    expect(sa.contains('car')).toBe(true)
    expect(sa.contains('ecar')).toBe(true)
  })

  it('handles single character', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('a')
    expect(sa.contains('a')).toBe(true)
    expect(sa.contains('b')).toBe(false)
  })

  it('handles all same characters', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('aaaa')
    expect(sa.contains('a')).toBe(true)
    expect(sa.contains('aa')).toBe(true)
    expect(sa.contains('aaaa')).toBe(true)
  })

  it('handles empty string', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('')
    expect(sa.contains('a')).toBe(false)
  })

  it('handles ab string', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('ab')
    expect(sa.contains('a')).toBe(true)
    expect(sa.contains('b')).toBe(true)
    expect(sa.contains('ab')).toBe(true)
    expect(sa.contains('ba')).toBe(false)
  })

  it('handles abc string', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('abc')
    expect(sa.contains('abc')).toBe(true)
    expect(sa.contains('bc')).toBe(true)
    expect(sa.contains('c')).toBe(true)
    expect(sa.contains('ac')).toBe(false)
  })

  it('handles single character', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('x')
    expect(sa.contains('x')).toBe(true)
    expect(sa.contains('y')).toBe(false)
  })

  it('handles empty string', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('')
    expect(sa.contains('')).toBe(true)
  })

  it('contains single char after build', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('a')
    expect(sa.contains('a')).toBe(true)
    expect(sa.contains('b')).toBe(false)
  })
})
