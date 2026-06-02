import { describe, expect, it } from 'vitest'
import { LongestCommonSubstring } from '../../src/utils/longest-common-substring.js'

describe('LongestCommonSubstring', () => {
  it('finds common substring', () => {
    expect(LongestCommonSubstring.find('abcdef', 'zcdem')).toBe('cde')
  })

  it('handles no common substring', () => {
    expect(LongestCommonSubstring.find('abc', 'xyz')).toBe('')
  })

  it('handles identical strings', () => {
    expect(LongestCommonSubstring.find('hello', 'hello')).toBe('hello')
  })

  it('handles empty string', () => {
    expect(LongestCommonSubstring.find('', 'abc')).toBe('')
    expect(LongestCommonSubstring.find('abc', '')).toBe('')
  })

  it('handles both empty', () => {
    expect(LongestCommonSubstring.find('', '')).toBe('')
  })

  it('handles single char match', () => {
    expect(LongestCommonSubstring.find('abc', 'cde')).toBe('c')
  })

  it('findLength returns correct length', () => {
    expect(LongestCommonSubstring.findLength('abcdef', 'zcdem')).toBe(3)
  })

  it('findLength for no match', () => {
    expect(LongestCommonSubstring.findLength('abc', 'xyz')).toBe(0)
  })

  it('findAll returns all longest substrings', () => {
    const results = LongestCommonSubstring.findAll('ABAB', 'BABA')
    expect(results).toContain('BAB')
    expect(results).toContain('ABA')
  })

  it('findAll for no match', () => {
    expect(LongestCommonSubstring.findAll('abc', 'xyz')).toEqual([])
  })

  it('ofMany finds common across multiple strings', () => {
    expect(LongestCommonSubstring.ofMany(['abcde', 'xcdef', 'cdefg'])).toBe('cde')
  })

  it('ofMany handles empty array', () => {
    expect(LongestCommonSubstring.ofMany([])).toBe('')
  })

  it('ofMany handles single string', () => {
    expect(LongestCommonSubstring.ofMany(['hello'])).toBe('hello')
  })

  it('handles repeated characters', () => {
    expect(LongestCommonSubstring.find('aab', 'baa')).toBe('aa')
  })

  it('handles substring at beginning', () => {
    expect(LongestCommonSubstring.find('abcxyz', 'abc')).toBe('abc')
  })

  it('handles substring at end', () => {
    expect(LongestCommonSubstring.find('xyzabc', 'abc')).toBe('abc')
  })

  it('handles identical strings', () => {
    expect(LongestCommonSubstring.find('hello', 'hello')).toBe('hello')
  })

  it('handles no common substring', () => {
    expect(LongestCommonSubstring.find('abc', 'xyz')).toBe('')
  })

  it('finds common substring at start', () => {
    expect(LongestCommonSubstring.find('abcdef', 'abcxyz')).toBe('abc')
  })
})
