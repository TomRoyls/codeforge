import { describe, it, expect } from 'vitest'
import { levenshteinDistance, similarityScore, findClosestMatch, findClosestMatches } from '../../src/utils/string-similarity.js'

// ─── levenshteinDistance ──────────────────────────────────
describe('levenshteinDistance', () => {
  it('returns 0 for identical strings', () => {
    expect(levenshteinDistance('hello', 'hello')).toBe(0)
  })

  it('returns length for empty string comparison', () => {
    expect(levenshteinDistance('', 'abc')).toBe(3)
    expect(levenshteinDistance('abc', '')).toBe(3)
  })

  it('returns 0 for two empty strings', () => {
    expect(levenshteinDistance('', '')).toBe(0)
  })

  it('computes single character insertion', () => {
    expect(levenshteinDistance('cat', 'cats')).toBe(1)
  })

  it('computes single character deletion', () => {
    expect(levenshteinDistance('cats', 'cat')).toBe(1)
  })

  it('computes single character substitution', () => {
    expect(levenshteinDistance('cat', 'bat')).toBe(1)
  })

  it('computes multi-edit distance', () => {
    expect(levenshteinDistance('kitten', 'sitting')).toBe(3)
    expect(levenshteinDistance('saturday', 'sunday')).toBe(3)
  })

  it('handles completely different strings', () => {
    expect(levenshteinDistance('abc', 'xyz')).toBe(3)
  })
})

// ─── similarityScore ──────────────────────────────────────
describe('similarityScore', () => {
  it('returns 1 for identical strings', () => {
    expect(similarityScore('hello', 'hello')).toBe(1)
  })

  it('returns 1 for two empty strings', () => {
    expect(similarityScore('', '')).toBe(1)
  })

  it('returns 0 for completely different strings of same length', () => {
    expect(similarityScore('abc', 'xyz')).toBe(0)
  })

  it('returns partial score for similar strings', () => {
    const score = similarityScore('hello', 'hallo')
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThan(1)
  })
})

// ─── findClosestMatch ─────────────────────────────────────
describe('findClosestMatch', () => {
  it('finds exact match', () => {
    expect(findClosestMatch('hello', ['hello', 'world'])).toBe('hello')
  })

  it('finds closest fuzzy match', () => {
    expect(findClosestMatch('helo', ['hello', 'world'])).toBe('hello')
  })

  it('returns null for empty candidates', () => {
    expect(findClosestMatch('test', [])).toBeNull()
  })

  it('returns null when no match exceeds minScore', () => {
    expect(findClosestMatch('xyz', ['abc', 'def'], 0.9)).toBeNull()
  })

  it('is case-insensitive', () => {
    expect(findClosestMatch('HELLO', ['hello', 'world'])).toBe('hello')
  })
})

// ─── findClosestMatches ──────────────────────────────────

describe('findClosestMatches', () => {
  it('returns empty array for empty candidates', () => {
    expect(findClosestMatches('test', [])).toEqual([])
  })

  it('returns scored matches sorted by score descending', () => {
    const results = findClosestMatches('helo', ['hello', 'help', 'world'])
    expect(results.length).toBeGreaterThan(0)
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1]!.score).toBeGreaterThanOrEqual(results[i]!.score)
    }
  })

  it('filters by minScore', () => {
    const results = findClosestMatches('xyz', ['abc', 'def'], { minScore: 0.9 })
    expect(results).toEqual([])
  })

  it('respects limit option', () => {
    const candidates = ['a', 'ab', 'abc', 'abcd', 'abcde', 'abcdef']
    const results = findClosestMatches('a', candidates, { limit: 3 })
    expect(results.length).toBeLessThanOrEqual(3)
  })

  it('defaults limit to 5', () => {
    const candidates = Array.from({ length: 20 }, (_, i) => `test${i}`)
    const results = findClosestMatches('test', candidates)
    expect(results.length).toBeLessThanOrEqual(5)
  })

  it('includes exact match at top', () => {
    const results = findClosestMatches('hello', ['world', 'hello', 'help'])
    expect(results[0]?.candidate).toBe('hello')
    expect(results[0]?.score).toBe(1)
  })

  it('is case-insensitive', () => {
    const results = findClosestMatches('HELLO', ['hello', 'world'])
    expect(results[0]?.candidate).toBe('hello')
  })

  it('each result has candidate and score properties', () => {
    const results = findClosestMatches('test', ['test', 'best'])
    for (const r of results) {
      expect(r).toHaveProperty('candidate')
      expect(r).toHaveProperty('score')
      expect(typeof r.candidate).toBe('string')
      expect(typeof r.score).toBe('number')
    }
  })

  it('returns only matches above default minScore 0.3', () => {
    const results = findClosestMatches('zzz', ['aaa', 'bbb', 'ccc'])
    expect(results.every((r) => r.score >= 0.3)).toBe(true)
  })
})
