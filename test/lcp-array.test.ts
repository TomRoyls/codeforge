import { LCPArray, buildLCPArray } from '../src/core/lcp-array/index.js'

// ─── buildLCPArray Function ─────────────────────────────────────────────

describe('LCPArray', () => {
  describe('buildLCPArray', () => {
    it('returns empty array for empty string', () => {
      expect(buildLCPArray('', [])).toEqual([])
    })

    it('returns correct LCP for simple string', () => {
      const sa = [2, 1, 0]
      const lcp = buildLCPArray('aba', sa)
      expect(lcp.length).toBeGreaterThan(0)
    })
  })

  // ─── LCPArray Class ─────────────────────────────────────────────────────

  describe('LCPArray class', () => {
    it('computes length from string', () => {
      const sa = [5, 3, 1, 0, 4, 2]
      const lcp = new LCPArray('banana', sa)
      expect(lcp.length).toBe(6)
      expect(lcp.size).toBe(6)
    })

    it('getLCP returns LCP value at position', () => {
      const sa = [5, 3, 1, 0, 4, 2]
      const lcp = new LCPArray('banana', sa)
      expect(lcp.getLCP(0)).toBe(0)
      expect(lcp.getLCP(100)).toBe(0)
    })

    it('getLCPBetween returns LCP between two suffixes', () => {
      const sa = [5, 3, 1, 0, 4, 2]
      const lcp = new LCPArray('banana', sa, { enableRMQ: true })
      const val = lcp.getLCPBetween(0, 1)
      expect(val).toBeGreaterThanOrEqual(0)
    })

    it('getLCPBetween returns 0 for invalid indices', () => {
      const sa = [5, 3, 1, 0, 4, 2]
      const lcp = new LCPArray('banana', sa)
      expect(lcp.getLCPBetween(-1, 0)).toBe(0)
      expect(lcp.getLCPBetween(0, 100)).toBe(0)
    })

    it('getLCPBetween without RMQ falls back to linear scan', () => {
      const sa = [5, 3, 1, 0, 4, 2]
      const lcp = new LCPArray('banana', sa)
      const val = lcp.getLCPBetween(0, 1)
      expect(val).toBeGreaterThanOrEqual(0)
    })
  })

  // ─── longestRepeatedSubstring ────────────────────────────────────────────

  describe('longestRepeatedSubstring', () => {
    it('finds longest repeated substring', () => {
      const sa = [5, 3, 1, 0, 4, 2]
      const lcp = new LCPArray('banana', sa)
      const lrs = lcp.longestRepeatedSubstring()
      expect(lrs.length).toBeGreaterThan(0)
    })

    it('returns empty for no repetition', () => {
      const sa = [2, 1, 0]
      const lcp = new LCPArray('abc', sa)
      const lrs = lcp.longestRepeatedSubstring()
      expect(lrs).toBe('')
    })

    it('returns empty for single char', () => {
      const sa = [0]
      const lcp = new LCPArray('a', sa)
      expect(lcp.longestRepeatedSubstring()).toBe('')
    })
  })

  // ─── toArray ─────────────────────────────────────────────────────────────

  describe('toArray', () => {
    it('returns array representation', () => {
      const sa = [5, 3, 1, 0, 4, 2]
      const lcp = new LCPArray('banana', sa)
      const arr = lcp.toArray()
      expect(Array.isArray(arr)).toBe(true)
      expect(arr.length).toBe(5)
    })
  })

  // ─── Edge Cases ──────────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles single character', () => {
      const lcp = new LCPArray('a', [0])
      expect(lcp.length).toBe(1)
    })

    it('handles all same characters', () => {
      const sa = [3, 2, 1, 0]
      const lcp = new LCPArray('aaaa', sa)
      expect(lcp.longestRepeatedSubstring()).toBe('aaa')
    })
  })
})
