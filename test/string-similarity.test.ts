import { describe, expect, it } from 'vitest'

import { findClosestMatch, levenshteinDistance, similarityScore } from '../src/utils/string-similarity.js'

// ─── levenshteinDistance ───────────────────────────────
describe('levenshteinDistance', () => {
  it('returns 0 for identical strings', () => {
    expect(levenshteinDistance('hello', 'hello')).toBe(0)
  })

  it('returns length of other for empty string', () => {
    expect(levenshteinDistance('', 'abc')).toBe(3)
    expect(levenshteinDistance('abc', '')).toBe(3)
  })

  it('returns 0 for two empty strings', () => {
    expect(levenshteinDistance('', '')).toBe(0)
  })

  it('computes single insertion', () => {
    expect(levenshteinDistance('abc', 'abcd')).toBe(1)
  })

  it('computes single deletion', () => {
    expect(levenshteinDistance('abcd', 'abc')).toBe(1)
  })

  it('computes single substitution', () => {
    expect(levenshteinDistance('cat', 'bat')).toBe(1)
  })

  it('computes multiple edits', () => {
    expect(levenshteinDistance('kitten', 'sitting')).toBe(3)
  })

  it('computes completely different strings', () => {
    expect(levenshteinDistance('abc', 'xyz')).toBe(3)
  })

  it('handles transposition as two edits', () => {
    expect(levenshteinDistance('ab', 'ba')).toBe(2)
  })
})

// ─── similarityScore ──────────────────────────────────
describe('similarityScore', () => {
  it('returns 1 for identical strings', () => {
    expect(similarityScore('hello', 'hello')).toBe(1)
  })

  it('returns 1 for two empty strings', () => {
    expect(similarityScore('', '')).toBe(1)
  })

  it('returns 0 for completely different strings', () => {
    expect(similarityScore('abc', 'xyz')).toBe(0)
  })

  it('returns fractional score for partial match', () => {
    const score = similarityScore('hello', 'hallo')
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThan(1)
  })

  it('is symmetric', () => {
    expect(similarityScore('abc', 'abcd')).toBe(similarityScore('abcd', 'abc'))
  })
})

// ─── findClosestMatch ─────────────────────────────────
describe('findClosestMatch', () => {
  const candidates = ['apple', 'banana', 'cherry', 'apricot']

  it('finds exact match', () => {
    expect(findClosestMatch('banana', candidates)).toBe('banana')
  })

  it('finds close match', () => {
    expect(findClosestMatch('aple', candidates)).toBe('apple')
  })

  it('returns null for no match above threshold', () => {
    expect(findClosestMatch('zzzzz', candidates)).toBeNull()
  })

  it('returns null for empty candidates', () => {
    expect(findClosestMatch('test', [])).toBeNull()
  })

  it('respects custom minScore', () => {
    expect(findClosestMatch('aple', candidates, 0.99)).toBeNull()
  })

  it('is case insensitive', () => {
    expect(findClosestMatch('BANANA', candidates)).toBe('banana')
  })
})
