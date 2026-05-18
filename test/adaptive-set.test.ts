import { AdaptiveSet } from '../src/core/adaptive-set/adaptive-set.js'
import type { AdaptiveSetOptions } from '../src/core/adaptive-set/adaptive-set.js'

// Helper: create a set filled with N sequential numbers
function filledSet(n: number, thresholds?: { sorted?: number; hashed?: number }): AdaptiveSet<number> {
  const s = new AdaptiveSet<number>(thresholds)
  for (let i = 0; i < n; i++) s.add(i)
  return s
}

describe('AdaptiveSet', () => {
  // ─── Constructor & defaults ───────────────────────────────────
  describe('constructor', () => {
    it('creates an empty set with default thresholds', () => {
      const s = new AdaptiveSet<number>()
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
      expect(s.mode).toBe('array')
    })

    it('accepts custom thresholds via first argument', () => {
      const s = new AdaptiveSet<number>({ sorted: 4, hashed: 8 })
      expect(s.mode).toBe('array')
    })

    it('accepts thresholds via options.threshold', () => {
      const s = new AdaptiveSet<number>(undefined, { threshold: { sorted: 5, hashed: 10 } })
      expect(s.mode).toBe('array')
    })

    it('prefers first-argument thresholds over options.threshold', () => {
      const s = new AdaptiveSet<number>({ sorted: 3 }, { threshold: { sorted: 99, hashed: 999 } })
      s.add(1).add(2).add(3)
      expect(s.mode).toBe('sorted')
    })
  })

  // ─── add / has / delete basics ────────────────────────────────
  describe('basic operations', () => {
    it('add returns the set for chaining', () => {
      const s = new AdaptiveSet<number>()
      const result = s.add(1)
      expect(result).toBe(s)
    })

    it('has returns false for missing values', () => {
      const s = new AdaptiveSet<number>()
      expect(s.has(42)).toBe(false)
    })

    it('has returns true after add', () => {
      const s = new AdaptiveSet<number>()
      s.add(42)
      expect(s.has(42)).toBe(true)
    })

    it('add ignores duplicates', () => {
      const s = new AdaptiveSet<number>()
      s.add(1).add(1).add(1)
      expect(s.size).toBe(1)
    })

    it('delete returns false for missing values', () => {
      const s = new AdaptiveSet<number>()
      expect(s.delete(99)).toBe(false)
    })

    it('delete removes an element and returns true', () => {
      const s = new AdaptiveSet<number>()
      s.add(10)
      expect(s.delete(10)).toBe(true)
      expect(s.has(10)).toBe(false)
      expect(s.size).toBe(0)
    })

    it('size getter works', () => {
      const s = new AdaptiveSet<number>()
      expect(s.size).toBe(0)
      s.add(1).add(2).add(3)
      expect(s.size).toBe(3)
    })

    it('isEmpty returns true when empty, false otherwise', () => {
      const s = new AdaptiveSet<number>()
      expect(s.isEmpty()).toBe(true)
      s.add(1)
      expect(s.isEmpty()).toBe(false)
    })
  })

  // ─── clear ────────────────────────────────────────────────────
  describe('clear', () => {
    it('removes all elements and resets mode to array', () => {
      const s = filledSet(20)
      expect(s.mode).toBe('sorted')
      s.clear()
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
      expect(s.mode).toBe('array')
    })

    it('clear on an already-empty set is safe', () => {
      const s = new AdaptiveSet<number>()
      s.clear()
      expect(s.size).toBe(0)
    })
  })

  // ─── Mode transitions ─────────────────────────────────────────
  describe('mode transitions', () => {
    it('stays in array mode below sorted threshold', () => {
      const s = filledSet(15, { sorted: 16, hashed: 256 })
      expect(s.mode).toBe('array')
    })

    it('upgrades to sorted at sorted threshold', () => {
      const s = filledSet(16, { sorted: 16, hashed: 256 })
      expect(s.mode).toBe('sorted')
    })

    it('upgrades to hashed at hashed threshold', () => {
      const s = filledSet(256, { sorted: 16, hashed: 256 })
      expect(s.mode).toBe('hashed')
    })

    it('skips sorted and goes directly to hashed when adding enough at once', () => {
      const s = filledSet(10, { sorted: 5, hashed: 10 })
      expect(s.mode).toBe('hashed')
    })

    it('downgrades from sorted to array when elements drop below threshold', () => {
      const s = filledSet(16, { sorted: 16, hashed: 256 })
      expect(s.mode).toBe('sorted')
      for (let i = 0; i < 16; i++) s.delete(i)
      expect(s.mode).toBe('array')
      expect(s.size).toBe(0)
    })

    it('does NOT downgrade from hashed to sorted', () => {
      const s = filledSet(256, { sorted: 16, hashed: 256 })
      expect(s.mode).toBe('hashed')
      for (let i = 0; i < 256; i++) s.delete(i)
      expect(s.size).toBe(0)
      expect(s.mode).toBe('hashed')
    })
  })

  // ─── toArray / values / iteration ─────────────────────────────
  describe('iteration', () => {
    it('toArray returns a copy of elements', () => {
      const s = new AdaptiveSet<number>()
      s.add(1).add(2).add(3)
      const arr = s.toArray()
      expect(arr.sort()).toEqual([1, 2, 3])
      arr.push(999)
      expect(s.size).toBe(3)
    })

    it('values() is an alias for toArray()', () => {
      const s = new AdaptiveSet<string>()
      s.add('a').add('b')
      expect(s.values().sort()).toEqual(['a', 'b'])
    })

    it('forEach iterates all elements', () => {
      const s = new AdaptiveSet<number>()
      s.add(10).add(20).add(30)
      const collected: number[] = []
      s.forEach((v, v2, set) => {
        collected.push(v)
        expect(v).toBe(v2)
        expect(set).toBe(s)
      })
      expect(collected.sort()).toEqual([10, 20, 30])
    })

    it('Symbol.iterator works with for-of', () => {
      const s = new AdaptiveSet<number>()
      s.add(1).add(2)
      const collected: number[] = []
      for (const v of s) collected.push(v)
      expect(collected.sort()).toEqual([1, 2])
    })
  })

  // ─── Set operations ───────────────────────────────────────────
  describe('set operations', () => {
    it('union combines two sets', () => {
      const a = new AdaptiveSet<number>()
      a.add(1).add(2).add(3)
      const b = new AdaptiveSet<number>()
      b.add(3).add(4).add(5)
      const u = a.union(b)
      expect(u.toArray().sort()).toEqual([1, 2, 3, 4, 5])
    })

    it('union preserves uniqueness', () => {
      const a = new AdaptiveSet<number>()
      a.add(1).add(2)
      const b = new AdaptiveSet<number>()
      b.add(2).add(1)
      expect(a.union(b).toArray().sort()).toEqual([1, 2])
    })

    it('intersection returns common elements', () => {
      const a = new AdaptiveSet<number>()
      a.add(1).add(2).add(3)
      const b = new AdaptiveSet<number>()
      b.add(2).add(3).add(4)
      const inter = a.intersection(b)
      expect(inter.toArray().sort()).toEqual([2, 3])
    })

    it('intersection of disjoint sets is empty', () => {
      const a = new AdaptiveSet<number>()
      a.add(1).add(2)
      const b = new AdaptiveSet<number>()
      b.add(3).add(4)
      expect(a.intersection(b).toArray()).toEqual([])
    })

    it('difference returns elements in a but not b', () => {
      const a = new AdaptiveSet<number>()
      a.add(1).add(2).add(3)
      const b = new AdaptiveSet<number>()
      b.add(2).add(4)
      expect(a.difference(b).toArray().sort()).toEqual([1, 3])
    })

    it('isSubsetOf returns true for subsets', () => {
      const a = new AdaptiveSet<number>()
      a.add(1).add(2)
      const b = new AdaptiveSet<number>()
      b.add(1).add(2).add(3)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('isSubsetOf returns false for non-subsets', () => {
      const a = new AdaptiveSet<number>()
      a.add(1).add(2).add(3)
      const b = new AdaptiveSet<number>()
      b.add(1).add(2)
      expect(a.isSubsetOf(b)).toBe(false)
    })

    it('isSubsetOf returns true for identical sets', () => {
      const a = new AdaptiveSet<number>()
      a.add(1).add(2)
      const b = new AdaptiveSet<number>()
      b.add(1).add(2)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('isSupersetOf returns true for supersets', () => {
      const a = new AdaptiveSet<number>()
      a.add(1).add(2).add(3)
      const b = new AdaptiveSet<number>()
      b.add(1).add(2)
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('isSupersetOf returns false for non-supersets', () => {
      const a = new AdaptiveSet<number>()
      a.add(1)
      const b = new AdaptiveSet<number>()
      b.add(1).add(2)
      expect(a.isSupersetOf(b)).toBe(false)
    })

    it('equals returns true for identical sets', () => {
      const a = new AdaptiveSet<number>()
      a.add(1).add(2).add(3)
      const b = new AdaptiveSet<number>()
      b.add(3).add(2).add(1)
      expect(a.equals(b)).toBe(true)
    })

    it('equals returns false for different sizes', () => {
      const a = new AdaptiveSet<number>()
      a.add(1).add(2)
      const b = new AdaptiveSet<number>()
      b.add(1)
      expect(a.equals(b)).toBe(false)
    })

    it('equals returns false when elements differ', () => {
      const a = new AdaptiveSet<number>()
      a.add(1).add(2)
      const b = new AdaptiveSet<number>()
      b.add(2).add(3)
      expect(a.equals(b)).toBe(false)
    })
  })

  // ─── Functional operations ────────────────────────────────────
  describe('functional operations', () => {
    it('map transforms elements', () => {
      const s = new AdaptiveSet<number>()
      s.add(1).add(2).add(3)
      const mapped = s.map((v) => v * 10)
      expect(mapped.toArray().sort()).toEqual([10, 20, 30])
    })

    it('map can change type', () => {
      const s = new AdaptiveSet<number>()
      s.add(1).add(2)
      const mapped = s.map((v) => `item-${v}`)
      expect(mapped.toArray().sort()).toEqual(['item-1', 'item-2'])
    })

    it('filter returns matching elements', () => {
      const s = new AdaptiveSet<number>()
      s.add(1).add(2).add(3).add(4)
      const filtered = s.filter((v) => v % 2 === 0)
      expect(filtered.toArray().sort()).toEqual([2, 4])
    })

    it('filter on empty set returns empty set', () => {
      const s = new AdaptiveSet<number>()
      expect(s.filter((v) => v > 0).size).toBe(0)
    })

    it('some returns true if any element matches', () => {
      const s = new AdaptiveSet<number>()
      s.add(1).add(2).add(3)
      expect(s.some((v) => v === 2)).toBe(true)
    })

    it('some returns false if no element matches', () => {
      const s = new AdaptiveSet<number>()
      s.add(1).add(2)
      expect(s.some((v) => v === 99)).toBe(false)
    })

    it('some returns false for empty set', () => {
      const s = new AdaptiveSet<number>()
      expect(s.some(() => true)).toBe(false)
    })

    it('every returns true if all elements match', () => {
      const s = new AdaptiveSet<number>()
      s.add(2).add(4).add(6)
      expect(s.every((v) => v % 2 === 0)).toBe(true)
    })

    it('every returns false if some element does not match', () => {
      const s = new AdaptiveSet<number>()
      s.add(2).add(3).add(6)
      expect(s.every((v) => v % 2 === 0)).toBe(false)
    })

    it('every returns true for empty set (vacuous truth)', () => {
      const s = new AdaptiveSet<number>()
      expect(s.every(() => false)).toBe(true)
    })
  })

  // ─── min / max ────────────────────────────────────────────────
  describe('min and max', () => {
    it('min returns undefined for empty set', () => {
      const s = new AdaptiveSet<number>()
      expect(s.min).toBeUndefined()
    })

    it('max returns undefined for empty set', () => {
      const s = new AdaptiveSet<number>()
      expect(s.max).toBeUndefined()
    })

    it('min returns smallest element', () => {
      const s = new AdaptiveSet<number>()
      s.add(5).add(1).add(3)
      expect(s.min).toBe(1)
    })

    it('max returns largest element', () => {
      const s = new AdaptiveSet<number>()
      s.add(5).add(1).add(3)
      expect(s.max).toBe(5)
    })

    it('min and max work with single element', () => {
      const s = new AdaptiveSet<number>()
      s.add(42)
      expect(s.min).toBe(42)
      expect(s.max).toBe(42)
    })

    it('min and max work in sorted mode', () => {
      const s = filledSet(20, { sorted: 16, hashed: 256 })
      expect(s.min).toBe(0)
      expect(s.max).toBe(19)
    })

    it('min and max work in hashed mode', () => {
      const s = filledSet(300, { sorted: 16, hashed: 256 })
      expect(s.min).toBe(0)
      expect(s.max).toBe(299)
    })
  })

  // ─── NaN handling ─────────────────────────────────────────────
  describe('NaN handling', () => {
    it('can add and detect NaN', () => {
      const s = new AdaptiveSet<number>()
      s.add(NaN)
      expect(s.has(NaN)).toBe(true)
      expect(s.size).toBe(1)
    })

    it('does not duplicate NaN', () => {
      const s = new AdaptiveSet<number>()
      s.add(NaN).add(NaN).add(NaN)
      expect(s.size).toBe(1)
    })

    it('can delete NaN', () => {
      const s = new AdaptiveSet<number>()
      s.add(NaN)
      expect(s.delete(NaN)).toBe(true)
      expect(s.has(NaN)).toBe(false)
    })

    it('NaN works in sorted mode', () => {
      const s = new AdaptiveSet<number>({ sorted: 2, hashed: 10 })
      s.add(1).add(NaN).add(3)
      expect(s.mode).toBe('sorted')
      expect(s.has(NaN)).toBe(true)
    })

    it('NaN works in hashed mode', () => {
      const s = new AdaptiveSet<number>({ sorted: 2, hashed: 4 })
      s.add(1).add(2).add(3).add(NaN)
      expect(s.mode).toBe('hashed')
      expect(s.has(NaN)).toBe(true)
    })
  })

  // ─── String elements ──────────────────────────────────────────
  describe('string elements', () => {
    it('works with string elements', () => {
      const s = new AdaptiveSet<string>()
      s.add('hello').add('world').add('hello')
      expect(s.size).toBe(2)
      expect(s.has('hello')).toBe(true)
      expect(s.has('world')).toBe(true)
      expect(s.has('missing')).toBe(false)
    })

    it('sorted mode sorts strings lexicographically', () => {
      const s = new AdaptiveSet<string>({ sorted: 2, hashed: 100 })
      s.add('cherry').add('apple').add('banana')
      expect(s.mode).toBe('sorted')
      expect(s.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('min/max works with strings', () => {
      const s = new AdaptiveSet<string>()
      s.add('cherry').add('apple').add('banana')
      expect(s.min).toBe('apple')
      expect(s.max).toBe('cherry')
    })
  })

  // ─── Edge cases ───────────────────────────────────────────────
  describe('edge cases', () => {
    it('handles negative numbers', () => {
      const s = new AdaptiveSet<number>()
      s.add(-5).add(-1).add(0).add(3)
      expect(s.min).toBe(-5)
      expect(s.max).toBe(3)
    })

    it('handles zero correctly', () => {
      const s = new AdaptiveSet<number>()
      s.add(0)
      expect(s.has(0)).toBe(true)
      expect(s.size).toBe(1)
    })

    it('operations on empty sets', () => {
      const a = new AdaptiveSet<number>()
      const b = new AdaptiveSet<number>()
      expect(a.union(b).size).toBe(0)
      expect(a.intersection(b).size).toBe(0)
      expect(a.difference(b).size).toBe(0)
      expect(a.isSubsetOf(b)).toBe(true)
      expect(a.isSupersetOf(b)).toBe(true)
      expect(a.equals(b)).toBe(true)
    })

    it('set operations across different modes', () => {
      const small = new AdaptiveSet<number>({ sorted: 16, hashed: 256 })
      small.add(1).add(2)
      expect(small.mode).toBe('array')

      const large = filledSet(300, { sorted: 16, hashed: 256 })
      expect(large.mode).toBe('hashed')

      const diff = large.difference(small)
      expect(diff.has(1)).toBe(false)
      expect(diff.has(2)).toBe(false)
      expect(diff.has(3)).toBe(true)
      expect(diff.size).toBe(298)
    })

    it('add/delete/add cycle preserves correctness', () => {
      const s = new AdaptiveSet<number>()
      s.add(1).add(2).add(3)
      s.delete(2)
      s.add(2)
      expect(s.size).toBe(3)
      expect(s.has(1)).toBe(true)
      expect(s.has(2)).toBe(true)
      expect(s.has(3)).toBe(true)
    })

    it('set operations preserve thresholds', () => {
      const s = new AdaptiveSet<number>({ sorted: 4, hashed: 8 })
      s.add(1).add(2)
      const result = s.map((v) => v * 2)
      for (let i = 0; i < 10; i++) result.add(i)
      expect(result.mode).toBe('hashed')
    })

    it('forEach on empty set does nothing', () => {
      const s = new AdaptiveSet<number>()
      let calls = 0
      s.forEach(() => { calls++ })
      expect(calls).toBe(0)
    })

    it('toArray in sorted mode returns sorted order', () => {
      const s = new AdaptiveSet<number>({ sorted: 3, hashed: 100 })
      s.add(5).add(1).add(3)
      expect(s.mode).toBe('sorted')
      expect(s.toArray()).toEqual([1, 3, 5])
    })
  })
})
