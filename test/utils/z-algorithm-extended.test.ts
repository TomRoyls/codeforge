import { describe, expect, it } from 'vitest'
import { ZAlgorithmExtended } from '../../src/utils/z-algorithm-extended.js'

describe('ZAlgorithmExtended', () => {
  it('finds all occurrences', () => {
    expect(ZAlgorithmExtended.search('abcabcabc', 'abc')).toEqual([0, 3, 6])
  })

  it('finds single occurrence', () => {
    expect(ZAlgorithmExtended.search('abcdef', 'cde')).toEqual([2])
  })

  it('handles no match', () => {
    expect(ZAlgorithmExtended.search('abcdef', 'xyz')).toEqual([])
  })

  it('handles empty pattern', () => {
    expect(ZAlgorithmExtended.search('abc', '')).toEqual([])
  })

  it('handles overlapping matches', () => {
    expect(ZAlgorithmExtended.search('aaaa', 'aa')).toEqual([0, 1, 2])
  })

  it('computes z array', () => {
    const z = ZAlgorithmExtended.zArray('aabcaab')
    expect(z[0]).toBe(7)
    expect(z[1]).toBe(1)
    expect(z[4]).toBe(3)
  })

  it('computes longest prefix suffix', () => {
    expect(ZAlgorithmExtended.longestPrefixSuffix('abcabc')).toBe(3)
    expect(ZAlgorithmExtended.longestPrefixSuffix('aaaa')).toBe(3)
  })

  it('longest prefix suffix no overlap', () => {
    expect(ZAlgorithmExtended.longestPrefixSuffix('abc')).toBe(0)
  })

  it('handles single char pattern', () => {
    expect(ZAlgorithmExtended.search('aaa', 'a')).toEqual([0, 1, 2])
  })

  it('handles pattern at end', () => {
    expect(ZAlgorithmExtended.search('abcdef', 'def')).toEqual([3])
  })

  it('handles repeated pattern', () => {
    expect(ZAlgorithmExtended.search('abababab', 'abab')).toEqual([0, 2, 4])
  })

  it('handles DNA pattern', () => {
    expect(ZAlgorithmExtended.search('ATCGATCGATCG', 'ATCG')).toEqual([0, 4, 8])
  })

  it('handles empty text', () => {
    expect(ZAlgorithmExtended.search('', 'abc')).toEqual([])
  })

  it('handles pattern longer than text', () => {
    expect(ZAlgorithmExtended.search('ab', 'abcdef')).toEqual([])
  })

  it('handles repeated single character', () => {
    expect(ZAlgorithmExtended.search('aaaa', 'a')).toEqual([0, 1, 2, 3])
  })

  it('handles empty pattern', () => {
    expect(ZAlgorithmExtended.search('abc', '')).toEqual([])
  })

  it('finds single match', () => {
    expect(ZAlgorithmExtended.search('hello world', 'world')).toEqual([6])
  })

  it('finds no match', () => {
    expect(ZAlgorithmExtended.search('hello', 'xyz')).toEqual([])
  })

  it('finds match at start', () => {
    expect(ZAlgorithmExtended.search('abcdef', 'abc')).toEqual([0])
  })

  it('finds multiple matches', () => {
    expect(ZAlgorithmExtended.search('abcabc', 'abc')).toEqual([0, 3])
  })

  it('no match returns empty', () => {
    expect(ZAlgorithmExtended.search('abcdef', 'xyz')).toEqual([])
  })

  it('finds pattern at start', () => {
    expect(ZAlgorithmExtended.search('abcdef', 'abc')).toEqual([0])
  })

  it('no match returns empty', () => {
    expect(ZAlgorithmExtended.search('abcdef', 'xyz')).toEqual([])
  })

  it('search finds match at start', () => {
    expect(ZAlgorithmExtended.search('abcdef', 'abc')).toEqual([0])
  })
})
