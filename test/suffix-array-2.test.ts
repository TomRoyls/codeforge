import { describe, expect, it } from 'vitest'

import { SuffixArray2 } from '../src/core/suffix-array-2/index.js'

// ─── Construction ──────────────────────────────────────
describe('SuffixArray2 construction', () => {
  it('creates from string', () => {
    const sa = new SuffixArray2('banana')
    expect(sa.size).toBe(6)
    expect(sa.isEmpty()).toBe(false)
  })

  it('creates from empty string', () => {
    const sa = new SuffixArray2('')
    expect(sa.size).toBe(0)
    expect(sa.isEmpty()).toBe(true)
    expect(sa.toArray()).toEqual([])
  })
})

// ─── Search ────────────────────────────────────────────
describe('SuffixArray2 search', () => {
  it('finds pattern occurrences', () => {
    const sa = new SuffixArray2('banana')
    expect(sa.search('ana')).toEqual([1, 3])
  })

  it('finds single character', () => {
    const sa = new SuffixArray2('banana')
    expect(sa.search('b')).toEqual([0])
  })

  it('returns empty for non-existent pattern', () => {
    const sa = new SuffixArray2('banana')
    expect(sa.search('xyz')).toEqual([])
  })

  it('returns empty for empty pattern', () => {
    const sa = new SuffixArray2('banana')
    expect(sa.search('')).toEqual([])
  })

  it('searches on empty string', () => {
    const sa = new SuffixArray2('')
    expect(sa.search('a')).toEqual([])
  })
})

// ─── Contains ──────────────────────────────────────────
describe('SuffixArray2 contains', () => {
  it('returns true for existing pattern', () => {
    const sa = new SuffixArray2('banana')
    expect(sa.contains('ana')).toBe(true)
  })

  it('returns false for missing pattern', () => {
    const sa = new SuffixArray2('banana')
    expect(sa.contains('xyz')).toBe(false)
  })

  it('returns true for empty pattern', () => {
    const sa = new SuffixArray2('banana')
    expect(sa.contains('')).toBe(true)
  })
})

// ─── LongestCommonPrefix ──────────────────────────────
describe('SuffixArray2 longestCommonPrefix', () => {
  it('returns LCP between adjacent suffixes', () => {
    const sa = new SuffixArray2('banana')
    const lcp0 = sa.longestCommonPrefix(0)
    expect(typeof lcp0).toBe('number')
  })

  it('returns 0 for out-of-bounds index', () => {
    const sa = new SuffixArray2('banana')
    expect(sa.longestCommonPrefix(-1)).toBe(0)
    expect(sa.longestCommonPrefix(10)).toBe(0)
  })

  it('returns 0 for last index', () => {
    const sa = new SuffixArray2('banana')
    expect(sa.longestCommonPrefix(5)).toBe(0)
  })
})

// ─── ToArray ───────────────────────────────────────────
describe('SuffixArray2 toArray', () => {
  it('returns suffix array indices', () => {
    const sa = new SuffixArray2('banana')
    const arr = sa.toArray()
    expect(arr).toHaveLength(6)
    expect(arr.sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5])
  })
})

// ─── Substring ─────────────────────────────────────────
describe('SuffixArray2 substring', () => {
  it('returns suffix at index', () => {
    const sa = new SuffixArray2('banana')
    const suffix = sa.substring(0)
    expect(typeof suffix).toBe('string')
    expect(suffix.length).toBeGreaterThan(0)
  })

  it('returns empty for out-of-bounds', () => {
    const sa = new SuffixArray2('banana')
    expect(sa.substring(-1)).toBe('')
    expect(sa.substring(99)).toBe('')
  })
})

// ─── Size ──────────────────────────────────────────────
describe('SuffixArray2 size', () => {
  it('returns string length', () => {
    const sa = new SuffixArray2('hello')
    expect(sa.size).toBe(5)
  })
})
