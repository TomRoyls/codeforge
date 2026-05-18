import { describe, it, expect } from 'vitest'
import { SkylineSet2 } from '../../src/core/skyline-set-2/index.js'

// ─── Constructor ───

describe('SkylineSet2', () => {
  describe('constructor', () => {
    it('creates an empty skyline set', () => {
      const ss = new SkylineSet2<string>(2)
      expect(ss.size()).toBe(0)
      expect(ss.items()).toEqual([])
    })

    it('creates with different dimension counts', () => {
      const ss1 = new SkylineSet2<string>(1)
      const ss3 = new SkylineSet2<string>(3)
      expect(ss1.size()).toBe(0)
      expect(ss3.size()).toBe(0)
    })
  })

  // ─── Add ───

  describe('add', () => {
    it('adds first item to empty set', () => {
      const ss = new SkylineSet2<string>(2)
      expect(ss.add('A', [5, 3])).toBe(true)
      expect(ss.size()).toBe(1)
      expect(ss.has('A')).toBe(true)
    })

    it('rejects item with wrong dimension count', () => {
      const ss = new SkylineSet2<string>(2)
      expect(ss.add('A', [1, 2, 3])).toBe(false)
      expect(ss.size()).toBe(0)
    })

    it('adds non-dominated item', () => {
      const ss = new SkylineSet2<string>(2)
      ss.add('A', [5, 1])
      expect(ss.add('B', [1, 5])).toBe(true)
      expect(ss.size()).toBe(2)
    })

    it('rejects dominated item', () => {
      const ss = new SkylineSet2<string>(2)
      ss.add('A', [5, 5])
      expect(ss.add('B', [3, 3])).toBe(false)
      expect(ss.size()).toBe(1)
      expect(ss.has('B')).toBe(false)
    })

    it('removes dominated items when adding dominator', () => {
      const ss = new SkylineSet2<string>(2)
      ss.add('A', [3, 3])
      ss.add('B', [1, 5])
      expect(ss.add('C', [5, 4])).toBe(true)
      expect(ss.has('A')).toBe(false)
      expect(ss.has('B')).toBe(true)
      expect(ss.has('C')).toBe(true)
    })

    it('handles single dimension', () => {
      const ss = new SkylineSet2<number>(1)
      ss.add(1, [10])
      expect(ss.add(2, [5])).toBe(false)
      expect(ss.add(3, [15])).toBe(true)
      expect(ss.size()).toBe(1)
      expect(ss.has(3)).toBe(true)
    })
  })

  // ─── Has ───

  describe('has', () => {
    it('returns false for empty set', () => {
      const ss = new SkylineSet2<string>(2)
      expect(ss.has('missing')).toBe(false)
    })

    it('returns true for existing item', () => {
      const ss = new SkylineSet2<string>(2)
      ss.add('A', [1, 2])
      expect(ss.has('A')).toBe(true)
    })

    it('returns false after item dominated and removed', () => {
      const ss = new SkylineSet2<string>(2)
      ss.add('A', [2, 2])
      ss.add('B', [4, 4])
      expect(ss.has('A')).toBe(false)
    })
  })

  // ─── Remove ───

  describe('remove', () => {
    it('removes an existing item', () => {
      const ss = new SkylineSet2<string>(2)
      ss.add('A', [1, 2])
      expect(ss.remove('A')).toBe(true)
      expect(ss.has('A')).toBe(false)
      expect(ss.size()).toBe(0)
    })

    it('returns false for missing item', () => {
      const ss = new SkylineSet2<string>(2)
      expect(ss.remove('ghost')).toBe(false)
    })
  })

  // ─── Size ───

  describe('size', () => {
    it('tracks size correctly', () => {
      const ss = new SkylineSet2<string>(2)
      expect(ss.size()).toBe(0)
      ss.add('A', [1, 2])
      expect(ss.size()).toBe(1)
      ss.add('B', [5, 1])
      expect(ss.size()).toBe(2)
      ss.remove('A')
      expect(ss.size()).toBe(1)
    })
  })

  // ─── Clear ───

  describe('clear', () => {
    it('clears all items', () => {
      const ss = new SkylineSet2<string>(2)
      ss.add('A', [1, 5])
      ss.add('B', [5, 1])
      ss.clear()
      expect(ss.size()).toBe(0)
      expect(ss.items()).toEqual([])
    })

    it('set is reusable after clear', () => {
      const ss = new SkylineSet2<string>(2)
      ss.add('A', [1, 1])
      ss.clear()
      ss.add('B', [2, 2])
      expect(ss.size()).toBe(1)
      expect(ss.has('B')).toBe(true)
    })
  })

  // ─── Items ───

  describe('items', () => {
    it('returns items with scores', () => {
      const ss = new SkylineSet2<string>(2)
      ss.add('A', [3, 1])
      ss.add('B', [1, 3])
      const items = ss.items()
      expect(items).toHaveLength(2)
      const names = items.map(i => i.item)
      expect(names).toContain('A')
      expect(names).toContain('B')
    })

    it('returns a copy', () => {
      const ss = new SkylineSet2<string>(2)
      ss.add('A', [1, 1])
      const items = ss.items()
      items.push({ item: 'fake', scores: [0, 0] })
      expect(ss.size()).toBe(1)
    })
  })

  // ─── Dominates ───

  describe('dominates', () => {
    it('returns true when s1 dominates s2', () => {
      const ss = new SkylineSet2<string>(2)
      expect(ss.dominates([5, 5], [3, 3])).toBe(true)
    })

    it('returns false when scores are equal', () => {
      const ss = new SkylineSet2<string>(2)
      expect(ss.dominates([3, 3], [3, 3])).toBe(false)
    })

    it('returns false when s1 has one lower score', () => {
      const ss = new SkylineSet2<string>(2)
      expect(ss.dominates([5, 2], [3, 3])).toBe(false)
    })

    it('returns true for single dimension domination', () => {
      const ss = new SkylineSet2<string>(1)
      expect(ss.dominates([5], [3])).toBe(true)
      expect(ss.dominates([3], [5])).toBe(false)
    })

    it('returns false for different dimension lengths', () => {
      const ss = new SkylineSet2<string>(2)
      expect(ss.dominates([1, 2], [1, 2, 3])).toBe(false)
    })

    it('handles three dimensions', () => {
      const ss = new SkylineSet2<string>(3)
      expect(ss.dominates([5, 5, 5], [3, 3, 3])).toBe(true)
      expect(ss.dominates([5, 2, 5], [3, 3, 3])).toBe(false)
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('handles Pareto frontier correctly', () => {
      const ss = new SkylineSet2<string>(2)
      ss.add('A', [1, 10])
      ss.add('B', [5, 5])
      ss.add('C', [10, 1])
      expect(ss.size()).toBe(3)
      expect(ss.has('A')).toBe(true)
      expect(ss.has('B')).toBe(true)
      expect(ss.has('C')).toBe(true)
    })

    it('single item dominates all others', () => {
      const ss = new SkylineSet2<string>(2)
      ss.add('weak', [2, 2])
      ss.add('weak2', [3, 1])
      expect(ss.add('strong', [10, 10])).toBe(true)
      expect(ss.has('weak')).toBe(false)
      expect(ss.has('weak2')).toBe(false)
      expect(ss.has('strong')).toBe(true)
    })

    it('zero scores', () => {
      const ss = new SkylineSet2<string>(2)
      expect(ss.add('A', [0, 0])).toBe(true)
      expect(ss.add('B', [1, 0])).toBe(true)
      expect(ss.has('A')).toBe(false)
    })

    it('negative scores', () => {
      const ss = new SkylineSet2<string>(2)
      ss.add('A', [-1, 5])
      ss.add('B', [5, -1])
      expect(ss.size()).toBe(2)
      expect(ss.add('C', [0, 0])).toBe(true)
    })

    it('add after remove allows re-adding dominated item', () => {
      const ss = new SkylineSet2<string>(2)
      ss.add('A', [5, 5])
      expect(ss.add('B', [3, 3])).toBe(false)
      ss.remove('A')
      expect(ss.add('B', [3, 3])).toBe(true)
    })
  })
})
