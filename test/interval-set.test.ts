import { IntervalSet } from '../src/core/interval-set/index.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('IntervalSet', () => {
  describe('constructor', () => {
    it('creates an empty set', () => {
      const set = new IntervalSet()
      expect(set.size).toBe(0)
      expect(set.isEmpty()).toBe(true)
    })
  })

  // ─── Add ────────────────────────────────────────────────────────────────

  describe('add', () => {
    it('adds a single interval', () => {
      const set = new IntervalSet()
      set.add(1, 5)
      expect(set.size).toBe(1)
      expect(set.has(3)).toBe(true)
    })

    it('merges overlapping intervals', () => {
      const set = new IntervalSet()
      set.add(1, 4)
      set.add(3, 6)
      expect(set.size).toBe(1)
      expect(set.intervals[0]).toEqual({ start: 1, end: 6 })
    })

    it('merges adjacent intervals', () => {
      const set = new IntervalSet()
      set.add(1, 3)
      set.add(3, 5)
      expect(set.size).toBe(1)
    })

    it('keeps non-overlapping intervals separate', () => {
      const set = new IntervalSet()
      set.add(1, 3)
      set.add(5, 7)
      expect(set.size).toBe(2)
    })

    it('ignores invalid intervals where start >= end', () => {
      const set = new IntervalSet()
      set.add(5, 3)
      expect(set.size).toBe(0)
    })
  })

  // ─── Remove ─────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('removes a portion of an interval', () => {
      const set = new IntervalSet()
      set.add(1, 10)
      set.remove(4, 7)
      expect(set.size).toBe(2)
      expect(set.has(2)).toBe(true)
      expect(set.has(5)).toBe(false)
      expect(set.has(8)).toBe(true)
    })

    it('removes entire interval', () => {
      const set = new IntervalSet()
      set.add(1, 5)
      set.remove(1, 5)
      expect(set.size).toBe(0)
    })

    it('does nothing for non-overlapping removal', () => {
      const set = new IntervalSet()
      set.add(1, 5)
      set.remove(10, 15)
      expect(set.size).toBe(1)
    })
  })

  // ─── Has / Contains / Overlaps ──────────────────────────────────────────

  describe('has, hasInterval, contains, overlaps', () => {
    it('has checks point membership', () => {
      const set = new IntervalSet()
      set.add(1, 5)
      expect(set.has(3)).toBe(true)
      expect(set.has(5)).toBe(false)
      expect(set.has(0)).toBe(false)
    })

    it('hasInterval checks exact interval', () => {
      const set = new IntervalSet()
      set.add(1, 5)
      expect(set.hasInterval(1, 5)).toBe(true)
      expect(set.hasInterval(1, 4)).toBe(false)
    })

    it('contains checks full containment', () => {
      const set = new IntervalSet()
      set.add(1, 10)
      expect(set.contains(2, 8)).toBe(true)
      expect(set.contains(2, 12)).toBe(false)
    })

    it('overlaps checks partial overlap', () => {
      const set = new IntervalSet()
      set.add(3, 7)
      expect(set.overlaps(5, 10)).toBe(true)
      expect(set.overlaps(1, 4)).toBe(true)
      expect(set.overlaps(8, 12)).toBe(false)
    })
  })

  // ─── Set Operations ────────────────────────────────────────────────────

  describe('set operations', () => {
    it('union merges two sets', () => {
      const a = new IntervalSet()
      a.add(1, 4)
      const b = new IntervalSet()
      b.add(3, 7)
      const u = a.union(b)
      expect(u.size).toBe(1)
      expect(u.intervals[0]).toEqual({ start: 1, end: 7 })
    })

    it('intersection returns overlapping parts', () => {
      const a = new IntervalSet()
      a.add(1, 5)
      const b = new IntervalSet()
      b.add(3, 8)
      const i = a.intersection(b)
      expect(i.size).toBe(1)
      expect(i.intervals[0]).toEqual({ start: 3, end: 5 })
    })

    it('difference removes intervals', () => {
      const a = new IntervalSet()
      a.add(1, 10)
      const b = new IntervalSet()
      b.add(3, 7)
      const d = a.difference(b)
      expect(d.size).toBe(2)
    })

    it('complement returns gaps', () => {
      const set = new IntervalSet()
      set.add(3, 7)
      const comp = set.complement(0, 10)
      expect(comp.size).toBe(2)
      expect(comp.has(1)).toBe(true)
      expect(comp.has(5)).toBe(false)
      expect(comp.has(9)).toBe(true)
    })
  })

  // ─── Length / Min / Max ─────────────────────────────────────────────────

  describe('length, min, max', () => {
    it('calculates total length', () => {
      const set = new IntervalSet()
      set.add(1, 5)
      set.add(10, 15)
      expect(set.length).toBe(9)
    })

    it('min and max return bounds', () => {
      const set = new IntervalSet()
      set.add(3, 7)
      set.add(10, 15)
      expect(set.min()).toBe(3)
      expect(set.max()).toBe(15)
    })

    it('min and max return undefined for empty set', () => {
      const set = new IntervalSet()
      expect(set.min()).toBe(undefined)
      expect(set.max()).toBe(undefined)
    })
  })

  // ─── Gaps ───────────────────────────────────────────────────────────────

  describe('gaps and gap', () => {
    it('gaps returns all gaps', () => {
      const set = new IntervalSet()
      set.add(2, 4)
      set.add(7, 9)
      const gaps = set.gaps(0, 12)
      expect(gaps.length).toBe(3)
    })

    it('gap returns largest gap', () => {
      const set = new IntervalSet()
      set.add(1, 3)
      set.add(8, 10)
      const g = set.gap(0, 15)
      expect(g).toBeDefined()
      expect(g!.start).toBe(3)
      expect(g!.end).toBe(8)
    })

    it('gap returns undefined when fully covered', () => {
      const set = new IntervalSet()
      set.add(0, 10)
      expect(set.gap(0, 10)).toBe(undefined)
    })
  })

  // ─── Iteration / Utility ────────────────────────────────────────────────

  describe('iteration and utility', () => {
    it('forEach iterates intervals', () => {
      const set = new IntervalSet()
      set.add(1, 3)
      set.add(5, 7)
      const collected: number[] = []
      set.forEach((iv) => collected.push(iv.start))
      expect(collected).toEqual([1, 5])
    })

    it('toArray returns copy', () => {
      const set = new IntervalSet()
      set.add(1, 5)
      const arr = set.toArray()
      expect(arr.length).toBe(1)
      arr[0]!.start = 99
      expect(set.intervals[0]!.start).toBe(1)
    })

    it('clear empties the set', () => {
      const set = new IntervalSet()
      set.add(1, 5)
      set.clear()
      expect(set.size).toBe(0)
    })

    it('Symbol.iterator works', () => {
      const set = new IntervalSet()
      set.add(1, 3)
      set.add(5, 7)
      const arr = [...set]
      expect(arr.length).toBe(2)
    })

    it('static from creates set from tuples', () => {
      const set = IntervalSet.from([[1, 5], [3, 8]])
      expect(set.size).toBe(1)
      expect(set.intervals[0]).toEqual({ start: 1, end: 8 })
    })
  })
})
