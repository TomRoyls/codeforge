import { describe, expect, it } from 'vitest'
import { BoyerMooreVote } from '../../src/utils/boyer-moore-vote.js'

describe('BoyerMooreVote', () => {
  describe('findMajority', () => {
    it('finds majority element', () => {
      expect(BoyerMooreVote.findMajority([3, 2, 3])).toBe(3)
    })

    it('finds majority in longer array', () => {
      expect(BoyerMooreVote.findMajority([2, 2, 1, 1, 1, 2, 2])).toBe(2)
    })

    it('returns null when no majority', () => {
      expect(BoyerMooreVote.findMajority([1, 2, 3])).toBeNull()
    })

    it('handles single element', () => {
      expect(BoyerMooreVote.findMajority([42])).toBe(42)
    })

    it('handles empty array', () => {
      expect(BoyerMooreVote.findMajority([])).toBeNull()
    })

    it('handles all same elements', () => {
      expect(BoyerMooreVote.findMajority([5, 5, 5, 5])).toBe(5)
    })

    it('handles two elements', () => {
      expect(BoyerMooreVote.findMajority([1, 1])).toBe(1)
      expect(BoyerMooreVote.findMajority([1, 2])).toBeNull()
    })

    it('handles strings', () => {
      expect(BoyerMooreVote.findMajority(['a', 'b', 'a', 'a'])).toBe('a')
    })

    it('handles exactly half', () => {
      expect(BoyerMooreVote.findMajority([1, 2, 1, 2])).toBeNull()
    })

    it('handles majority by one', () => {
      expect(BoyerMooreVote.findMajority([1, 1, 1, 2, 2])).toBe(1)
    })
  })

  describe('findMajorityIndex', () => {
    it('returns index of majority', () => {
      expect(BoyerMooreVote.findMajorityIndex([3, 2, 3])).toBeGreaterThanOrEqual(0)
    })

    it('returns -1 for no majority', () => {
      expect(BoyerMooreVote.findMajorityIndex([1, 2, 3])).toBe(-1)
    })

    it('returns -1 for empty', () => {
      expect(BoyerMooreVote.findMajorityIndex([])).toBe(-1)
    })
  })

  describe('findAllFrequent', () => {
    it('finds elements appearing more than n/k times', () => {
      const result = BoyerMooreVote.findAllFrequent([1, 1, 1, 2, 2, 3], 3)
      expect(result).toContain(1)
    })

    it('returns empty for uniform distribution', () => {
      expect(BoyerMooreVote.findAllFrequent([1, 2, 3, 4], 2)).toEqual([])
    })

    it('finds all majority elements with k=2', () => {
      const result = BoyerMooreVote.findAllFrequent([1, 1, 1, 2, 2, 3, 3], 2)
      expect(result).toContain(1)
    })

    it('handles empty array', () => {
      expect(BoyerMooreVote.findAllFrequent([], 2)).toEqual([])
    })

    it('finds majority in single element', () => {
      expect(BoyerMooreVote.findMajority([5])).toBe(5)
    })

    it('returns null for no majority', () => {
      expect(BoyerMooreVote.findMajority([1, 2, 3])).toBeNull()
    })

    it('finds majority in single element', () => {
      expect(BoyerMooreVote.findMajority([1])).toBe(1)
    })

    it('returns null when no majority', () => {
    expect(BoyerMooreVote.findMajority([1, 2, 3])).toBeNull()
  })

  it('finds majority in single element array', () => {
    expect(BoyerMooreVote.findMajority([42])).toBe(42)
  })
})
})
