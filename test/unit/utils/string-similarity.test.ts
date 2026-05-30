import { describe, test, expect } from 'vitest'
import {
  levenshteinDistance,
  similarityScore,
  findClosestMatch,
  findClosestMatches,
  type ScoredMatch,
} from '../../../src/utils/string-similarity.js'

describe('levenshteinDistance', () => {
  test('returns 0 for identical strings', () => {
    expect(levenshteinDistance('hello', 'hello')).toBe(0)
    expect(levenshteinDistance('test', 'test')).toBe(0)
    expect(levenshteinDistance('world', 'world')).toBe(0)
  })

  test('returns length when one string is empty', () => {
    expect(levenshteinDistance('', 'hello')).toBe(5)
    expect(levenshteinDistance('world', '')).toBe(5)
    expect(levenshteinDistance('', '')).toBe(0)
  })

  test('calculates distance for single character differences', () => {
    expect(levenshteinDistance('hello', 'helo')).toBe(1)
    expect(levenshteinDistance('test', 'tast')).toBe(1)
    expect(levenshteinDistance('cat', 'bat')).toBe(1)
  })

  test('calculates distance for multiple character differences', () => {
    expect(levenshteinDistance('hello', 'hallo')).toBe(1)
    expect(levenshteinDistance('kitten', 'sitting')).toBe(3)
    expect(levenshteinDistance('book', 'back')).toBe(2)
  })

  test('handles complete mismatch', () => {
    expect(levenshteinDistance('abc', 'xyz')).toBe(3)
    expect(levenshteinDistance('hello', 'world')).toBe(4)
    expect(levenshteinDistance('test', 'data')).toBe(4)
  })

  test('calculates correct distance for insertions', () => {
    expect(levenshteinDistance('cat', 'cats')).toBe(1)
    expect(levenshteinDistance('dog', 'dogs')).toBe(1)
  })

  test('calculates correct distance for deletions', () => {
    expect(levenshteinDistance('cats', 'cat')).toBe(1)
    expect(levenshteinDistance('dogs', 'dog')).toBe(1)
  })

  test('calculates correct distance for substitutions', () => {
    expect(levenshteinDistance('cat', 'bat')).toBe(1)
    expect(levenshteinDistance('dog', 'log')).toBe(1)
  })
})

describe('similarityScore', () => {
  test('returns 1 for identical strings', () => {
    expect(similarityScore('hello', 'hello')).toBe(1)
    expect(similarityScore('test', 'test')).toBe(1)
  })

  test('returns 1 for empty strings', () => {
    expect(similarityScore('', '')).toBe(1)
  })

  test('returns 0 for complete mismatch', () => {
    expect(similarityScore('abc', 'xyz')).toBeCloseTo(0)
    expect(similarityScore('hello', 'world')).toBeCloseTo(0.2)
  })

  test('calculates score for partial matches', () => {
    expect(similarityScore('hello', 'helo')).toBe(0.8)
    expect(similarityScore('kitten', 'sitting')).toBe(0.5714285714285714)
    expect(similarityScore('test', 'tast')).toBe(0.75)
  })

  test('handles single character strings', () => {
    expect(similarityScore('a', 'a')).toBe(1)
    expect(similarityScore('a', 'b')).toBe(0)
  })

  test('returns score between 0 and 1', () => {
    expect(similarityScore('hello', 'hallo')).toBeGreaterThanOrEqual(0)
    expect(similarityScore('hello', 'hallo')).toBeLessThanOrEqual(1)
  })
})

describe('findClosestMatch', () => {
  test('returns exact match when present', () => {
    expect(findClosestMatch('hello', ['hello', 'world', 'test'])).toBe('hello')
    expect(findClosestMatch('test', ['one', 'two', 'test'])).toBe('test')
  })

  test('returns closest match above threshold', () => {
    expect(findClosestMatch('helo', ['hello', 'hell', 'help'])).toBe('hello')
    expect(findClosestMatch('tast', ['test', 'taste', 'task'])).toBe('taste')
  })

  test('returns null when no match above threshold', () => {
    expect(findClosestMatch('abc', ['xyz', 'def', 'ghi'])).toBeNull()
    expect(findClosestMatch('hello', ['world', 'data', 'code'])).toBeNull()
  })

  test('returns null for empty candidates', () => {
    expect(findClosestMatch('hello', [])).toBeNull()
    expect(findClosestMatch('test', [])).toBeNull()
  })

  test('uses default minScore of 0.3', () => {
    expect(findClosestMatch('hello', ['hell', 'hallo', 'helo'])).not.toBeNull()
    expect(findClosestMatch('xyz', ['abc', 'def'])).toBeNull()
  })

  test('respects custom minScore', () => {
    expect(findClosestMatch('helo', ['hello', 'hell'], 0.7)).toBe('hello')
    expect(findClosestMatch('helo', ['hello', 'hell'], 0.9)).toBeNull()
    expect(findClosestMatch('helo', ['hello', 'hell'], 1)).toBeNull()
  })

  test('is case insensitive', () => {
    expect(findClosestMatch('HELLO', ['hello', 'world'])).toBe('hello')
    expect(findClosestMatch('Hello', ['HELLO', 'world'])).toBe('HELLO')
    expect(findClosestMatch('hello', ['HELLO', 'WORLD'])).toBe('HELLO')
  })

  test('returns first match when scores are equal', () => {
    const result = findClosestMatch('test', ['test1', 'test2'])
    expect(result).toBe('test1')
  })
})

describe('findClosestMatches', () => {
  test('returns multiple results sorted by score', () => {
    const results = findClosestMatches('hello', ['hello', 'hell', 'help', 'hallo'])
    expect(results).toHaveLength(4)
    expect(results[0].candidate).toBe('hello')
    expect(results[0].score).toBe(1)
    expect(results[1].candidate).toBe('hell')
    expect(results[1].score).toBeCloseTo(0.8)
  })

  test('applies limit to results', () => {
    const results = findClosestMatches('hello', ['hello', 'hell', 'help', 'hallo', 'helo'], { limit: 2 })
    expect(results).toHaveLength(2)
    expect(results[0].candidate).toBe('hello')
    expect(results[1].candidate).toBe('hell')
  })

  test('filters results below minScore', () => {
    const results = findClosestMatches('hello', ['hello', 'world', 'test', 'data'], { minScore: 0.8 })
    expect(results).toHaveLength(1)
    expect(results[0].candidate).toBe('hello')
  })

  test('scores matches correctly', () => {
    const results = findClosestMatches('helo', ['hello', 'hell', 'help'])
    expect(results[0].score).toBeCloseTo(0.8)
    expect(results[1].score).toBeCloseTo(0.75)
    expect(results[2].score).toBeCloseTo(0.75)
  })

  test('returns empty array for empty candidates', () => {
    expect(findClosestMatches('hello', [])).toEqual([])
    expect(findClosestMatches('test', [])).toEqual([])
  })

  test('uses default limit of 5', () => {
    const candidates = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
    const results = findClosestMatches('a', candidates)
    expect(results.length).toBeLessThanOrEqual(5)
  })

  test('uses default minScore of 0.3', () => {
    const results = findClosestMatches('hello', ['h', 'he', 'hel', 'hell', 'hello'])
    expect(results.length).toBeGreaterThan(0)
  })

  test('is case insensitive', () => {
    const results = findClosestMatches('HELLO', ['hello', 'HELLO', 'hElLo'])
    expect(results).toHaveLength(3)
    expect(results.every((r) => r.score)).toBe(true)
  })

  test('returns results as ScoredMatch objects', () => {
    const results = findClosestMatches('hello', ['hello', 'hell'])
    expect(results[0]).toHaveProperty('candidate')
    expect(results[0]).toHaveProperty('score')
    expect(results[0].candidate).toBe('hello')
    expect(typeof results[0].score).toBe('number')
  })

  test('handles all results below minScore', () => {
    const results = findClosestMatches('hello', ['world', 'data', 'code'], { minScore: 0.8 })
    expect(results).toEqual([])
  })

  test('respects both limit and minScore', () => {
    const candidates = ['hello', 'hell', 'help', 'hallo', 'helo', 'hel', 'he', 'h']
    const results = findClosestMatches('hello', candidates, { limit: 3, minScore: 0.5 })
    expect(results.length).toBeLessThanOrEqual(3)
    expect(results.every((r) => r.score >= 0.5)).toBe(true)
  })
})