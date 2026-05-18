import { describe, it, expect } from 'vitest'
import { DisjointIntervalSet } from '../src/utils/disjoint-interval-set.js'

describe('DisjointIntervalSet', () => {
  describe('add', () => {
    it('adds a single interval', () => {
      const s = new DisjointIntervalSet()
      s.add(0, 10)
      expect(s.size).toBe(1)
      expect(s.getIntervals()).toEqual([{ start: 0, end: 10 }])
    })

    it('merges adjacent intervals', () => {
      const s = new DisjointIntervalSet()
      s.add(0, 5)
      s.add(6, 10)
      expect(s.size).toBe(1)
      expect(s.getIntervals()).toEqual([{ start: 0, end: 10 }])
    })

    it('merges overlapping intervals', () => {
      const s = new DisjointIntervalSet()
      s.add(0, 10)
      s.add(5, 15)
      expect(s.size).toBe(1)
      expect(s.getIntervals()).toEqual([{ start: 0, end: 15 }])
    })

    it('keeps disjoint intervals separate', () => {
      const s = new DisjointIntervalSet()
      s.add(0, 5)
      s.add(10, 15)
      expect(s.size).toBe(2)
    })

    it('merges interval that bridges two existing', () => {
      const s = new DisjointIntervalSet()
      s.add(0, 5)
      s.add(15, 20)
      s.add(3, 18)
      expect(s.size).toBe(1)
      expect(s.getIntervals()).toEqual([{ start: 0, end: 20 }])
    })

    it('inserts in sorted order', () => {
      const s = new DisjointIntervalSet()
      s.add(20, 25)
      s.add(0, 5)
      s.add(10, 15)
      const ivs = s.getIntervals()
      expect(ivs[0]!.start).toBe(0)
      expect(ivs[1]!.start).toBe(10)
      expect(ivs[2]!.start).toBe(20)
    })

    it('throws when start > end', () => {
      expect(() => new DisjointIntervalSet().add(10, 5)).toThrow(RangeError)
    })

    it('handles single-point intervals', () => {
      const s = new DisjointIntervalSet()
      s.add(5, 5)
      expect(s.getIntervals()).toEqual([{ start: 5, end: 5 }])
    })
  })

  describe('remove', () => {
    it('splits an interval', () => {
      const s = new DisjointIntervalSet()
      s.add(0, 20)
      s.remove(8, 12)
      expect(s.getIntervals()).toEqual([{ start: 0, end: 7 }, { start: 13, end: 20 }])
    })

    it('trims from left', () => {
      const s = new DisjointIntervalSet()
      s.add(0, 20)
      s.remove(0, 5)
      expect(s.getIntervals()).toEqual([{ start: 6, end: 20 }])
    })

    it('trims from right', () => {
      const s = new DisjointIntervalSet()
      s.add(0, 20)
      s.remove(15, 20)
      expect(s.getIntervals()).toEqual([{ start: 0, end: 14 }])
    })

    it('removes entire interval', () => {
      const s = new DisjointIntervalSet()
      s.add(0, 10)
      s.remove(0, 10)
      expect(s.isEmpty).toBe(true)
    })

    it('removes spanning multiple intervals', () => {
      const s = new DisjointIntervalSet()
      s.add(0, 5)
      s.add(10, 15)
      s.add(20, 25)
      s.remove(3, 22)
      expect(s.getIntervals()).toEqual([{ start: 0, end: 2 }, { start: 23, end: 25 }])
    })

    it('no-op when no overlap', () => {
      const s = new DisjointIntervalSet()
      s.add(0, 10)
      s.remove(15, 20)
      expect(s.size).toBe(1)
    })
  })

  describe('contains', () => {
    it('returns true for point in interval', () => {
      const s = new DisjointIntervalSet()
      s.add(5, 10)
      expect(s.contains(5)).toBe(true)
      expect(s.contains(10)).toBe(true)
      expect(s.contains(7)).toBe(true)
    })

    it('returns false for point outside', () => {
      const s = new DisjointIntervalSet()
      s.add(5, 10)
      expect(s.contains(4)).toBe(false)
      expect(s.contains(11)).toBe(false)
    })

    it('returns false for empty set', () => {
      expect(new DisjointIntervalSet().contains(0)).toBe(false)
    })
  })

  describe('containsInterval', () => {
    it('returns true when fully contained', () => {
      const s = new DisjointIntervalSet()
      s.add(0, 20)
      expect(s.containsInterval(5, 10)).toBe(true)
    })

    it('returns false when partially outside', () => {
      const s = new DisjointIntervalSet()
      s.add(5, 10)
      expect(s.containsInterval(0, 15)).toBe(false)
    })
  })

  describe('overlaps', () => {
    it('returns true for partial overlap', () => {
      const s = new DisjointIntervalSet()
      s.add(5, 10)
      expect(s.overlaps(8, 15)).toBe(true)
    })

    it('returns false for no overlap', () => {
      const s = new DisjointIntervalSet()
      s.add(5, 10)
      expect(s.overlaps(0, 4)).toBe(false)
      expect(s.overlaps(11, 20)).toBe(false)
    })
  })

  describe('findContaining', () => {
    it('returns containing interval', () => {
      const s = new DisjointIntervalSet()
      s.add(5, 10)
      expect(s.findContaining(7)).toEqual({ start: 5, end: 10 })
    })

    it('returns undefined when not contained', () => {
      const s = new DisjointIntervalSet()
      s.add(5, 10)
      expect(s.findContaining(3)).toBeUndefined()
    })
  })

  describe('getTotalCovered', () => {
    it('sums all interval lengths', () => {
      const s = new DisjointIntervalSet()
      s.add(0, 9)
      s.add(20, 29)
      expect(s.getTotalCovered()).toBe(20)
    })

    it('returns 0 for empty set', () => {
      expect(new DisjointIntervalSet().getTotalCovered()).toBe(0)
    })
  })

  describe('getMin / getMax', () => {
    it('returns min and max', () => {
      const s = new DisjointIntervalSet()
      s.add(5, 10)
      s.add(20, 30)
      expect(s.getMin()).toBe(5)
      expect(s.getMax()).toBe(30)
    })

    it('returns undefined for empty', () => {
      expect(new DisjointIntervalSet().getMin()).toBeUndefined()
      expect(new DisjointIntervalSet().getMax()).toBeUndefined()
    })
  })

  describe('clear', () => {
    it('removes all intervals', () => {
      const s = new DisjointIntervalSet()
      s.add(0, 10)
      s.clear()
      expect(s.isEmpty).toBe(true)
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const s = new DisjointIntervalSet()
      s.add(0, 10)
      const c = s.clone()
      c.add(20, 30)
      expect(s.size).toBe(1)
      expect(c.size).toBe(2)
    })
  })

  describe('union', () => {
    it('combines two sets', () => {
      const a = new DisjointIntervalSet()
      a.add(0, 5)
      const b = new DisjointIntervalSet()
      b.add(10, 15)
      const u = a.union(b)
      expect(u.size).toBe(2)
      expect(u.contains(3)).toBe(true)
      expect(u.contains(12)).toBe(true)
    })
  })

  describe('intersection', () => {
    it('finds overlapping parts', () => {
      const a = new DisjointIntervalSet()
      a.add(0, 10)
      const b = new DisjointIntervalSet()
      b.add(5, 15)
      const i = a.intersection(b)
      expect(i.getIntervals()).toEqual([{ start: 5, end: 10 }])
    })

    it('returns empty for disjoint sets', () => {
      const a = new DisjointIntervalSet()
      a.add(0, 5)
      const b = new DisjointIntervalSet()
      b.add(10, 15)
      expect(a.intersection(b).isEmpty).toBe(true)
    })
  })

  describe('difference', () => {
    it('removes other intervals', () => {
      const a = new DisjointIntervalSet()
      a.add(0, 20)
      const b = new DisjointIntervalSet()
      b.add(5, 10)
      const d = a.difference(b)
      expect(d.getIntervals()).toEqual([{ start: 0, end: 4 }, { start: 11, end: 20 }])
    })
  })

  describe('forEach', () => {
    it('iterates intervals', () => {
      const s = new DisjointIntervalSet()
      s.add(0, 5)
      s.add(10, 15)
      const collected: Interval[] = []
      s.forEach((iv) => collected.push(iv))
      expect(collected.length).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('handles negative intervals', () => {
      const s = new DisjointIntervalSet()
      s.add(-10, -1)
      expect(s.contains(-5)).toBe(true)
      expect(s.contains(0)).toBe(false)
    })

    it('handles large values', () => {
      const s = new DisjointIntervalSet()
      s.add(0, 1000000)
      s.remove(500000, 500000)
      expect(s.size).toBe(2)
    })

    it('add-remove-add cycle', () => {
      const s = new DisjointIntervalSet()
      s.add(0, 20)
      s.remove(5, 15)
      s.add(3, 17)
      expect(s.size).toBe(1)
      expect(s.getIntervals()).toEqual([{ start: 0, end: 20 }])
    })

    it('many small intervals', () => {
      const s = new DisjointIntervalSet()
      for (let i = 0; i < 100; i++) {
        s.add(i * 10, i * 10 + 4)
      }
      expect(s.size).toBe(100)
    })
  })
})

type Interval = import('../src/utils/disjoint-interval-set.js').Interval
