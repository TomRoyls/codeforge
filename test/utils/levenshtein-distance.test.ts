import { describe, expect, it } from 'vitest'
import { LevenshteinDistance } from '../../src/utils/levenshtein-distance.js'

describe('LevenshteinDistance', () => {
  it('computes distance between identical strings', () => {
    expect(LevenshteinDistance.distance('hello', 'hello')).toBe(0)
  })

  it('computes distance from empty string', () => {
    expect(LevenshteinDistance.distance('', 'abc')).toBe(3)
    expect(LevenshteinDistance.distance('abc', '')).toBe(3)
  })

  it('computes distance between empty strings', () => {
    expect(LevenshteinDistance.distance('', '')).toBe(0)
  })

  it('computes distance with single substitution', () => {
    expect(LevenshteinDistance.distance('cat', 'bat')).toBe(1)
  })

  it('computes distance with insertion', () => {
    expect(LevenshteinDistance.distance('cat', 'cats')).toBe(1)
  })

  it('computes distance with deletion', () => {
    expect(LevenshteinDistance.distance('cats', 'cat')).toBe(1)
  })

  it('computes kitten to sitting', () => {
    expect(LevenshteinDistance.distance('kitten', 'sitting')).toBe(3)
  })

  it('computes saturday to sunday', () => {
    expect(LevenshteinDistance.distance('saturday', 'sunday')).toBe(3)
  })

  it('distanceOptimized matches distance', () => {
    const pairs = [['kitten', 'sitting'], ['abc', ''], ['', 'xyz'], ['hello', 'world']]
    for (const [a, b] of pairs) {
      expect(LevenshteinDistance.distanceOptimized(a, b)).toBe(LevenshteinDistance.distance(a, b))
    }
  })

  it('similarity of identical strings is 1', () => {
    expect(LevenshteinDistance.similarity('abc', 'abc')).toBe(1)
  })

  it('similarity of completely different strings is 0', () => {
    expect(LevenshteinDistance.similarity('abc', 'xyz')).toBe(0)
  })

  it('similarity of empty strings is 1', () => {
    expect(LevenshteinDistance.similarity('', '')).toBe(1)
  })

  it('normalizedDistance between 0 and 1', () => {
    const d = LevenshteinDistance.normalizedDistance('kitten', 'sitting')
    expect(d).toBeGreaterThan(0)
    expect(d).toBeLessThanOrEqual(1)
  })

  it('findClosest returns best match', () => {
    expect(LevenshteinDistance.findClosest('hello', ['hallo', 'world', 'help'])).toBe('hallo')
  })

  it('findClosest returns null for empty candidates', () => {
    expect(LevenshteinDistance.findClosest('hello', [])).toBeNull()
  })

  it('editOperations returns correct ops for substitution', () => {
    const ops = LevenshteinDistance.editOperations('cat', 'bat')
    const replaces = ops.filter(o => o.type === 'replace')
    expect(replaces.length).toBe(1)
  })

  it('editOperations returns match for identical', () => {
    const ops = LevenshteinDistance.editOperations('ab', 'ab')
    expect(ops.every(o => o.type === 'match')).toBe(true)
  })

  it('distance for empty strings is 0', () => {
    expect(LevenshteinDistance.distance('', '')).toBe(0)
  })

  it('distance for single char substitution', () => {
    expect(LevenshteinDistance.distance('a', 'b')).toBe(1)
  })

  it('distance for identical strings is 0', () => {
    expect(LevenshteinDistance.distance('hello', 'hello')).toBe(0)
  })

  it('distance for completely different is max length', () => {
    expect(LevenshteinDistance.distance('abc', 'xyz')).toBe(3)
  })

  it('distance for identical is 0', () => {
    expect(LevenshteinDistance.distance('abc', 'abc')).toBe(0)
  })

  it('distance for empty strings is 0', () => {
    expect(LevenshteinDistance.distance('', '')).toBe(0)
  })
})
