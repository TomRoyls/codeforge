import { describe, expect, it } from 'vitest'
import { LCS } from '../../src/utils/lcs.js'

describe('LCS', () => {
  describe('length', () => {
    it('returns 0 for no common chars', () => {
      expect(LCS.length('abc', 'xyz')).toBe(0)
    })

    it('returns length for identical strings', () => {
      expect(LCS.length('abc', 'abc')).toBe(3)
    })

    it('returns 0 for empty strings', () => {
      expect(LCS.length('', '')).toBe(0)
      expect(LCS.length('abc', '')).toBe(0)
      expect(LCS.length('', 'abc')).toBe(0)
    })

    it('computes classic LCS', () => {
      expect(LCS.length('ABCBDAB', 'BDCAB')).toBe(4)
    })

    it('handles single common char', () => {
      expect(LCS.length('abc', 'cde')).toBe(1)
    })
  })

  describe('solve', () => {
    it('returns empty for no common chars', () => {
      expect(LCS.solve('abc', 'xyz')).toBe('')
    })

    it('returns full string for identical', () => {
      expect(LCS.solve('abc', 'abc')).toBe('abc')
    })

    it('solves classic LCS', () => {
      const result = LCS.solve('ABCBDAB', 'BDCAB')
      expect(result.length).toBe(4)
      expect(result).toBe('BDAB')
    })

    it('returns empty for empty inputs', () => {
      expect(LCS.solve('', 'abc')).toBe('')
      expect(LCS.solve('abc', '')).toBe('')
    })

    it('handles single char match', () => {
      expect(LCS.solve('a', 'a')).toBe('a')
      expect(LCS.solve('a', 'b')).toBe('')
    })
  })

  describe('solveArray', () => {
    it('finds LCS of number arrays', () => {
      const result = LCS.solveArray([1, 2, 3, 4], [2, 4, 3])
      expect(result.length).toBe(2)
      expect(LCS.solveArray([1, 2, 3], [1, 2, 3])).toEqual([1, 2, 3])
    })

    it('returns empty for no match', () => {
      expect(LCS.solveArray([1, 2], [3, 4])).toEqual([])
    })

    it('handles identical arrays', () => {
      expect(LCS.solveArray([1, 2, 3], [1, 2, 3])).toEqual([1, 2, 3])
    })

    it('handles empty arrays', () => {
      expect(LCS.solveArray([], [1, 2])).toEqual([])
    })
  })

  describe('similarity', () => {
    it('returns 1 for identical', () => {
      expect(LCS.similarity('abc', 'abc')).toBe(1)
    })

    it('returns 0 for no match', () => {
      expect(LCS.similarity('abc', 'xyz')).toBe(0)
    })

    it('returns 1 for both empty', () => {
      expect(LCS.similarity('', '')).toBe(1)
    })

    it('returns fraction for partial', () => {
      const sim = LCS.similarity('abc', 'adc')
      expect(sim).toBeGreaterThan(0)
      expect(sim).toBeLessThanOrEqual(1)
    })

    it('similarity of same string is 1', () => {
      expect(LCS.similarity('abc', 'abc')).toBe(1)
    })
  })

  it('length of empty strings is 0', () => {
    expect(LCS.length('', '')).toBe(0)
  })

  it('length of abc and abc is 3', () => {
    expect(LCS.length('abc', 'abc')).toBe(3)
  })

  it('length of empty strings is 0', () => {
    expect(LCS.length('', '')).toBe(0)
  })

  it('identical strings have full length', () => {
    expect(LCS.length('abc', 'abc')).toBe(3)
  })

  it('completely different strings have 0 LCS', () => {
    expect(LCS.length('abc', 'xyz')).toBe(0)
  })
})
