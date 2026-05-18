import { describe, expect, it } from 'vitest'
import { SuffixArray } from '../../src/utils/suffix-array.js'

// ─── Construction ───

describe('SuffixArray construction', () => {
  it('builds from string', () => {
    const sa = new SuffixArray('banana')
    expect(sa.length).toBe(6)
    expect(sa.text).toBe('banana')
  })

  it('handles empty string', () => {
    const sa = new SuffixArray('')
    expect(sa.length).toBe(0)
    expect(sa.toArray()).toEqual([])
  })

  it('handles single char', () => {
    const sa = new SuffixArray('a')
    expect(sa.toArray()).toEqual([0])
  })
})

// ─── Index & LCP ───

describe('SuffixArray index & lcp', () => {
  it('returns sorted suffix indices', () => {
    const sa = new SuffixArray('banana')
    const indices = sa.toArray()
    const suffixes = indices.map((i) => 'banana'.substring(i))
    const sorted = [...suffixes].sort()
    expect(suffixes).toEqual(sorted)
  })

  it('index returns suffix start positions', () => {
    const sa = new SuffixArray('abc')
    expect(sa.index(0)).toBe(0)
    expect(sa.index(1)).toBe(1)
    expect(sa.index(2)).toBe(2)
  })

  it('index throws on out of bounds', () => {
    const sa = new SuffixArray('abc')
    expect(() => sa.index(-1)).toThrow(RangeError)
    expect(() => sa.index(3)).toThrow(RangeError)
  })

  it('lcp array has correct lengths', () => {
    const sa = new SuffixArray('banana')
    expect(sa.lcp(0)).toBe(0)
  })

  it('lcp throws on out of bounds', () => {
    const sa = new SuffixArray('abc')
    expect(() => sa.lcp(-1)).toThrow(RangeError)
  })
})

// ─── Search ───

describe('SuffixArray search', () => {
  it('finds pattern at start', () => {
    const sa = new SuffixArray('banana')
    expect(sa.search('ban')).toEqual([0])
  })

  it('finds pattern in middle', () => {
    const sa = new SuffixArray('banana')
    expect(sa.search('nan')).toEqual([2])
  })

  it('finds multiple occurrences', () => {
    const sa = new SuffixArray('banana')
    const results = sa.search('ana')
    expect(results.sort()).toEqual([1, 3])
  })

  it('returns empty for non-existent pattern', () => {
    const sa = new SuffixArray('banana')
    expect(sa.search('xyz')).toEqual([])
  })

  it('returns empty for empty pattern', () => {
    const sa = new SuffixArray('banana')
    expect(sa.search('')).toEqual([])
  })
})

// ─── Contains ───

describe('SuffixArray contains', () => {
  it('returns true for existing pattern', () => {
    const sa = new SuffixArray('hello world')
    expect(sa.contains('world')).toBe(true)
    expect(sa.contains('hello')).toBe(true)
  })

  it('returns false for missing pattern', () => {
    const sa = new SuffixArray('hello')
    expect(sa.contains('xyz')).toBe(false)
  })
})

// ─── Longest Repeated Substring ───

describe('SuffixArray longestRepeatedSubstring', () => {
  it('finds repeated substring', () => {
    const sa = new SuffixArray('banana')
    const lrs = sa.longestRepeatedSubstring()
    expect(lrs.length).toBeGreaterThan(0)
    expect('banana'.includes(lrs)).toBe(true)
  })

  it('returns empty for no repeats', () => {
    const sa = new SuffixArray('abcdef')
    expect(sa.longestRepeatedSubstring()).toBe('')
  })

  it('returns empty for empty string', () => {
    const sa = new SuffixArray('')
    expect(sa.longestRepeatedSubstring()).toBe('')
  })

  it('finds long repeated substring', () => {
    const sa = new SuffixArray('abcabcabc')
    const lrs = sa.longestRepeatedSubstring()
    expect(lrs.length).toBeGreaterThanOrEqual(6)
  })
})
