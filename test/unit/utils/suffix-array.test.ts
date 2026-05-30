import { describe, expect, it } from 'vitest'
import { SuffixArray } from '../../../src/utils/suffix-array.js'

describe('SuffixArray', () => {
  it('constructs from text', () => {
    const sa = new SuffixArray('banana')
    expect(sa.text).toBe('banana')
    expect(sa.length).toBe(6)
  })

  it('handles empty string', () => {
    const sa = new SuffixArray('')
    expect(sa.length).toBe(0)
    expect(sa.toArray()).toEqual([])
  })

  it('handles single character', () => {
    const sa = new SuffixArray('a')
    expect(sa.length).toBe(1)
    expect(sa.index(0)).toBe(0)
  })

  it('returns correct suffix array indices', () => {
    const sa = new SuffixArray('banana')
    const indices = sa.toArray()
    const suffixes = indices.map((i) => 'banana'.substring(i))
    const sorted = [...suffixes].sort()
    expect(suffixes).toEqual(sorted)
  })

  it('index throws for out of bounds', () => {
    const sa = new SuffixArray('abc')
    expect(() => sa.index(-1)).toThrow(RangeError)
    expect(() => sa.index(3)).toThrow(RangeError)
  })

  it('lcp returns values for valid indices', () => {
    const sa = new SuffixArray('banana')
    expect(sa.lcp(0)).toBeGreaterThanOrEqual(0)
  })

  it('lcp throws for out of bounds', () => {
    const sa = new SuffixArray('abc')
    expect(() => sa.lcp(-1)).toThrow(RangeError)
  })

  it('search finds existing pattern', () => {
    const sa = new SuffixArray('banana')
    const positions = sa.search('ana')
    expect(positions.length).toBeGreaterThan(0)
    expect(positions).toContain(1)
    expect(positions).toContain(3)
  })

  it('search returns empty for non-existing pattern', () => {
    const sa = new SuffixArray('banana')
    expect(sa.search('xyz')).toEqual([])
  })

  it('search returns empty for empty pattern', () => {
    const sa = new SuffixArray('banana')
    expect(sa.search('')).toEqual([])
  })

  it('contains returns true for existing pattern', () => {
    const sa = new SuffixArray('banana')
    expect(sa.contains('ana')).toBe(true)
    expect(sa.contains('ban')).toBe(true)
    expect(sa.contains('na')).toBe(true)
  })

  it('contains returns false for non-existing pattern', () => {
    const sa = new SuffixArray('banana')
    expect(sa.contains('xyz')).toBe(false)
  })

  it('longestRepeatedSubstring finds repeated substring', () => {
    const sa = new SuffixArray('banana')
    const lrs = sa.longestRepeatedSubstring()
    expect(lrs.length).toBeGreaterThan(0)
  })

  it('longestRepeatedSubstring returns empty for unique string', () => {
    const sa = new SuffixArray('abcdef')
    expect(sa.longestRepeatedSubstring()).toBe('')
  })

  it('longestRepeatedSubstring returns empty for empty string', () => {
    const sa = new SuffixArray('')
    expect(sa.longestRepeatedSubstring()).toBe('')
  })

  it('search finds single character', () => {
    const sa = new SuffixArray('abcabc')
    const positions = sa.search('a')
    expect(positions).toEqual([0, 3])
  })

  it('search finds entire string', () => {
    const sa = new SuffixArray('banana')
    expect(sa.search('banana')).toEqual([0])
  })

  it('toArray returns all indices', () => {
    const sa = new SuffixArray('abc')
    expect(sa.toArray().length).toBe(3)
    expect(sa.toArray().sort((a, b) => a - b)).toEqual([0, 1, 2])
  })

  it('handles repeated characters', () => {
    const sa = new SuffixArray('aaaa')
    expect(sa.search('aa').length).toBeGreaterThan(0)
    expect(sa.contains('aaa')).toBe(true)
  })

  it('search is case sensitive', () => {
    const sa = new SuffixArray('Banana')
    expect(sa.contains('Ban')).toBe(true)
    expect(sa.contains('ban')).toBe(false)
  })

  it('lcp values are correct for known string', () => {
    const sa = new SuffixArray('abab')
    const indices = sa.toArray()
    const suffixes = indices.map((i) => 'abab'.substring(i))
    for (let i = 1; i < suffixes.length; i++) {
      let expected = 0
      while (
        expected < suffixes[i]!.length &&
        expected < suffixes[i - 1]!.length &&
        suffixes[i]![expected] === suffixes[i - 1]![expected]
      ) {
        expected++
      }
      expect(sa.lcp(i)).toBe(expected)
    }
  })

  it('handles text with special characters', () => {
    const sa = new SuffixArray('a.b.c')
    expect(sa.contains('a.b')).toBe(true)
    expect(sa.contains('.c')).toBe(true)
  })

  it('search returns sorted positions', () => {
    const sa = new SuffixArray('abcabc')
    const positions = sa.search('abc')
    for (let i = 1; i < positions.length; i++) {
      expect(positions[i]!).toBeGreaterThan(positions[i - 1]!)
    }
  })

  it('suffix array indices are valid', () => {
    const text = 'mississippi'
    const sa = new SuffixArray(text)
    const indices = sa.toArray()
    for (const idx of indices) {
      expect(idx).toBeGreaterThanOrEqual(0)
      expect(idx).toBeLessThan(text.length)
    }
  })

  it('search finds all occurrences in mississippi', () => {
    const sa = new SuffixArray('mississippi')
    expect(sa.search('iss').length).toBe(2)
    expect(sa.search('ssi').length).toBe(2)
    expect(sa.search('i').length).toBe(4)
  })
})
