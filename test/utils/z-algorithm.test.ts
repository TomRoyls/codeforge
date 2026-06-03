import { describe, expect, it } from 'vitest'
import { ZAlgorithm } from '../../src/utils/z-algorithm.js'

describe('ZAlgorithm', () => {
  it('computes z-function for simple string', () => {
    const z = ZAlgorithm.zFunction('aabcaab')
    expect(z[0]).toBe(7)
    expect(z[1]).toBe(1)
    expect(z[4]).toBe(3)
  })

  it('finds all occurrences', () => {
    const result = ZAlgorithm.search('abcabcabc', 'abc')
    expect(result).toEqual([0, 3, 6])
  })

  it('handles pattern not found', () => {
    expect(ZAlgorithm.search('abcdef', 'xyz')).toEqual([])
  })

  it('handles empty pattern', () => {
    expect(ZAlgorithm.search('abc', '')).toEqual([])
  })

  it('handles empty text', () => {
    expect(ZAlgorithm.search('', 'abc')).toEqual([])
  })

  it('contains returns correct boolean', () => {
    expect(ZAlgorithm.contains('hello world', 'world')).toBe(true)
    expect(ZAlgorithm.contains('hello world', 'xyz')).toBe(false)
  })

  it('countOccurrences is correct', () => {
    expect(ZAlgorithm.countOccurrences('aaa', 'a')).toBe(3)
    expect(ZAlgorithm.countOccurrences('aaa', 'aa')).toBe(2)
  })

  it('longestPrefixSuffix for no overlap', () => {
    expect(ZAlgorithm.longestPrefixSuffix('abc')).toBe(0)
  })

  it('longestPrefixSuffix for overlap', () => {
    expect(ZAlgorithm.longestPrefixSuffix('abab')).toBe(2)
  })

  it('longestPrefixSuffix for all same', () => {
    expect(ZAlgorithm.longestPrefixSuffix('aaa')).toBe(2)
  })

  it('handles single character', () => {
    expect(ZAlgorithm.search('a', 'a')).toEqual([0])
  })

  it('handles z-function for empty string', () => {
    expect(ZAlgorithm.zFunction('')).toEqual([])
  })

  it('distinctSubstringCount for simple string', () => {
    const count = ZAlgorithm.distinctSubstringCount('aab')
    expect(count).toBeGreaterThan(0)
  })

  it('search for pattern in itself', () => {
    expect(ZAlgorithm.search('abc', 'abc')).toEqual([0])
  })

  it('handles overlapping pattern matches', () => {
    expect(ZAlgorithm.search('aaa', 'aa')).toEqual([0, 1])
  })

  it('zFunction for single character', () => {
    expect(ZAlgorithm.zFunction('a')).toEqual([1])
  })

  it('search finds pattern', () => {
    expect(ZAlgorithm.search('abcabc', 'abc')).toEqual([0, 3])
  })

  it('search empty pattern returns empty', () => {
    expect(ZAlgorithm.search('abc', '')).toEqual([])
  })

  it('search finds match at start', () => {
    expect(ZAlgorithm.search('abcdef', 'abc')).toEqual([0])
  })

  it('search finds multiple matches', () => {
    expect(ZAlgorithm.search('abcabc', 'abc')).toEqual([0, 3])
  })

  it('no match returns empty', () => {
    expect(ZAlgorithm.search('abcdef', 'xyz')).toEqual([])
  })

  it('finds pattern at start', () => {
    expect(ZAlgorithm.search('abcdef', 'abc')).toEqual([0])
  })

  it('no match returns empty', () => {
    expect(ZAlgorithm.search('abcdef', 'xyz')).toEqual([])
  })
})
