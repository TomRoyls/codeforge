import { describe, it, expect } from 'vitest'
import { CircularSuffixArray } from '../../../src/utils/circular-suffix-array.js'

describe('CircularSuffixArray', () => {
  describe('construction', () => {
    it('creates suffix array for string', () => {
      const csa = new CircularSuffixArray('abcd')
      expect(csa.length).toBe(4)
    })

    it('handles empty string', () => {
      const csa = new CircularSuffixArray('')
      expect(csa.length).toBe(0)
    })

    it('handles single character', () => {
      const csa = new CircularSuffixArray('a')
      expect(csa.indices).toEqual([0])
    })
  })

  describe('index', () => {
    it('returns sorted suffix indices', () => {
      const csa = new CircularSuffixArray('banana')
      expect(csa.index(0)).toBe(5)
    })

    it('returns all indices', () => {
      const csa = new CircularSuffixArray('abc')
      const all = new Set(csa.indices)
      expect(all.size).toBe(3)
    })
  })

  describe('rank', () => {
    it('finds rank of suffix', () => {
      const csa = new CircularSuffixArray('abcd')
      for (let i = 0; i < 4; i++) {
        expect(csa.rank(csa.index(i))).toBe(i)
      }
    })
  })

  describe('first and last', () => {
    it('returns first and last indices', () => {
      const csa = new CircularSuffixArray('abcd')
      expect(csa.first()).toBe(0)
      expect(csa.last()).toBe(3)
    })
  })

  describe('sorted order', () => {
    it('sorts by circular suffix', () => {
      const csa = new CircularSuffixArray('cab')
      expect(csa.indices).toEqual([1, 2, 0])
    })
  })
})
