import { describe, expect, it } from 'vitest'
import { PrefixFunction } from '../../src/utils/prefix-function.js'

describe('PrefixFunction', () => {
  it('computes prefix function for "aabaaab"', () => {
    const pi = PrefixFunction.compute('aabaaab')
    expect(pi).toEqual([0, 1, 0, 1, 2, 2, 3])
  })

  it('computes for empty string', () => {
    expect(PrefixFunction.compute('')).toEqual([])
  })

  it('computes for single char', () => {
    expect(PrefixFunction.compute('a')).toEqual([0])
  })

  it('computes for all same chars', () => {
    expect(PrefixFunction.compute('aaaa')).toEqual([0, 1, 2, 3])
  })

  it('computes for no prefix-suffix', () => {
    expect(PrefixFunction.compute('abcd')).toEqual([0, 0, 0, 0])
  })

  it('search finds pattern occurrences', () => {
    expect(PrefixFunction.search('abcabcabc', 'abc')).toEqual([0, 3, 6])
  })

  it('search returns empty for no matches', () => {
    expect(PrefixFunction.search('abcdef', 'xyz')).toEqual([])
  })

  it('search returns empty for empty pattern', () => {
    expect(PrefixFunction.search('abc', '')).toEqual([])
  })

  it('search handles overlapping matches', () => {
    expect(PrefixFunction.search('aaa', 'aa')).toEqual([0, 1])
  })

  it('countOccurrences works', () => {
    expect(PrefixFunction.countOccurrences('abababab', 'aba')).toBe(3)
  })

  it('isPeriodic detects period', () => {
    expect(PrefixFunction.isPeriodic('ababab', 2)).toBe(true)
    expect(PrefixFunction.isPeriodic('abcabc', 3)).toBe(true)
    expect(PrefixFunction.isPeriodic('abcab', 3)).toBe(false)
  })

  it('smallestPeriod works', () => {
    expect(PrefixFunction.smallestPeriod('ababab')).toBe(2)
    expect(PrefixFunction.smallestPeriod('abcabc')).toBe(3)
    expect(PrefixFunction.smallestPeriod('abcdef')).toBe(6)
  })

  it('smallestPeriod for empty', () => {
    expect(PrefixFunction.smallestPeriod('')).toBe(0)
  })

  it('longestPrefixSuffix works', () => {
    expect(PrefixFunction.longestPrefixSuffix('aabaaab')).toBe(3)
    expect(PrefixFunction.longestPrefixSuffix('abcd')).toBe(0)
    expect(PrefixFunction.longestPrefixSuffix('abcabc')).toBe(3)
  })

  it('longestPrefixSuffix for empty', () => {
    expect(PrefixFunction.longestPrefixSuffix('')).toBe(0)
  })

  it('search for single char pattern', () => {
    expect(PrefixFunction.search('abcabc', 'a')).toEqual([0, 3])
  })

  it('compute handles repeating pattern', () => {
    expect(PrefixFunction.compute('aabaab')).toEqual([0, 1, 0, 1, 2, 3])
  })
})
