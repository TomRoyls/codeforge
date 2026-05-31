import { describe, expect, it } from 'vitest'
import { BoyerMooreExtended } from '../../src/utils/boyer-moore-extended.js'

describe('BoyerMooreExtended', () => {
  it('finds all occurrences', () => {
    expect(BoyerMooreExtended.search('abcabcabc', 'abc')).toEqual([0, 3, 6])
  })

  it('finds single occurrence', () => {
    expect(BoyerMooreExtended.search('abcdef', 'cde')).toEqual([2])
  })

  it('handles no match', () => {
    expect(BoyerMooreExtended.search('abcdef', 'xyz')).toEqual([])
  })

  it('handles empty pattern', () => {
    expect(BoyerMooreExtended.search('abc', '')).toEqual([])
  })

  it('handles overlapping matches', () => {
    const result = BoyerMooreExtended.search('aaaa', 'aa')
    expect(result).toContain(0)
    expect(result.length).toBeGreaterThanOrEqual(2)
  })

  it('handles pattern longer than text', () => {
    expect(BoyerMooreExtended.search('ab', 'abcdef')).toEqual([])
  })

  it('handles single char pattern', () => {
    expect(BoyerMooreExtended.search('abcabc', 'a')).toEqual([0, 3])
  })

  it('handles pattern at end', () => {
    expect(BoyerMooreExtended.search('abcdef', 'def')).toEqual([3])
  })

  it('handles pattern at start', () => {
    expect(BoyerMooreExtended.search('abcdef', 'abc')).toEqual([0])
  })

  it('handles repeated pattern', () => {
    expect(BoyerMooreExtended.search('abababab', 'abab')).toEqual([0, 2, 4])
  })

  it('handles single char text', () => {
    expect(BoyerMooreExtended.search('a', 'a')).toEqual([0])
    expect(BoyerMooreExtended.search('a', 'b')).toEqual([])
  })

  it('handles unicode pattern', () => {
    expect(BoyerMooreExtended.search('café café', 'café')).toEqual([0, 5])
  })

  it('handles empty text', () => {
    expect(BoyerMooreExtended.search('', 'a')).toEqual([])
  })
})
