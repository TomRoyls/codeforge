import { describe, expect, it } from 'vitest'
import { EditDistance } from '../../src/utils/edit-distance.js'

describe('EditDistance', () => {
  describe('levenshtein', () => {
    it('returns 0 for identical strings', () => {
      expect(EditDistance.levenshtein('hello', 'hello')).toBe(0)
    })

    it('returns length for empty vs non-empty', () => {
      expect(EditDistance.levenshtein('', 'abc')).toBe(3)
      expect(EditDistance.levenshtein('abc', '')).toBe(3)
    })

    it('returns 0 for both empty', () => {
      expect(EditDistance.levenshtein('', '')).toBe(0)
    })

    it('computes insertion distance', () => {
      expect(EditDistance.levenshtein('abc', 'abcd')).toBe(1)
    })

    it('computes deletion distance', () => {
      expect(EditDistance.levenshtein('abcd', 'abc')).toBe(1)
    })

    it('computes substitution distance', () => {
      expect(EditDistance.levenshtein('abc', 'axc')).toBe(1)
    })

    it('computes kitten to sitting', () => {
      expect(EditDistance.levenshtein('kitten', 'sitting')).toBe(3)
    })

    it('computes saturday to sunday', () => {
      expect(EditDistance.levenshtein('saturday', 'sunday')).toBe(3)
    })

    it('handles single character', () => {
      expect(EditDistance.levenshtein('a', 'b')).toBe(1)
      expect(EditDistance.levenshtein('a', 'a')).toBe(0)
    })
  })

  describe('damerauLevenshtein', () => {
    it('handles transposition', () => {
      expect(EditDistance.damerauLevenshtein('ab', 'ba')).toBe(1)
      expect(EditDistance.levenshtein('ab', 'ba')).toBe(2)
    })

    it('returns 0 for identical', () => {
      expect(EditDistance.damerauLevenshtein('test', 'test')).toBe(0)
    })

    it('handles empty strings', () => {
      expect(EditDistance.damerauLevenshtein('', '')).toBe(0)
      expect(EditDistance.damerauLevenshtein('abc', '')).toBe(3)
    })

    it('computes mixed operations', () => {
      expect(EditDistance.damerauLevenshtein('ca', 'abc')).toBe(3)
    })
  })

  describe('hamming', () => {
    it('computes bit differences', () => {
      expect(EditDistance.hamming('0000', '1111')).toBe(4)
    })

    it('returns 0 for identical', () => {
      expect(EditDistance.hamming('abc', 'abc')).toBe(0)
    })

    it('counts single difference', () => {
      expect(EditDistance.hamming('abc', 'axc')).toBe(1)
    })

    it('throws for different lengths', () => {
      expect(() => EditDistance.hamming('ab', 'abc')).toThrow()
    })
  })

  describe('normalizedLevenshtein', () => {
    it('returns 1 for identical', () => {
      expect(EditDistance.normalizedLevenshtein('abc', 'abc')).toBe(1)
    })

    it('returns 0 for completely different', () => {
      expect(EditDistance.normalizedLevenshtein('abc', 'xyz')).toBe(0)
    })

    it('returns 1 for both empty', () => {
      expect(EditDistance.normalizedLevenshtein('', '')).toBe(1)
    })

    it('returns fraction for partial match', () => {
      const sim = EditDistance.normalizedLevenshtein('abc', 'abd')
      expect(sim).toBeGreaterThan(0)
      expect(sim).toBeLessThan(1)
    })
  })

  it('distance from empty string is length', () => {
    expect(EditDistance.levenshtein('', 'abc')).toBe(3)
  })

  it('identical strings have distance 0', () => {
    expect(EditDistance.levenshtein('abc', 'abc')).toBe(0)
  })

  it('empty strings have distance 0', () => {
    expect(EditDistance.levenshtein('', '')).toBe(0)
  })
})
