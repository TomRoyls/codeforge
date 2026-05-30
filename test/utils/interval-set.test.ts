import { describe, it, expect } from 'vitest'
import { IntervalSet, type ContinuousInterval } from '../../src/utils/interval-set.js'

function ci(low: number, high: number, lowKind: 'open' | 'closed' = 'closed', highKind: 'open' | 'closed' = 'closed'): ContinuousInterval {
  return { low, high, lowKind, highKind }
}

describe('IntervalSet', () => {
  describe('add', () => {
    it('adds a single closed interval', () => {
      const set = new IntervalSet()
      set.add(ci(0, 10))
      expect(set.size).toBe(1)
      expect(set.getIntervals()).toEqual([ci(0, 10)])
    })

    it('adds non-overlapping intervals in sorted order', () => {
      const set = new IntervalSet()
      set.add(ci(5, 10))
      set.add(ci(0, 3))
      expect(set.size).toBe(2)
      expect(set.getIntervals()).toEqual([ci(0, 3), ci(5, 10)])
    })

    it('merges overlapping intervals', () => {
      const set = new IntervalSet()
      set.add(ci(0, 5))
      set.add(ci(3, 10))
      expect(set.size).toBe(1)
      expect(set.getIntervals()).toEqual([ci(0, 10)])
    })

    it('merges touching closed intervals', () => {
      const set = new IntervalSet()
      set.add(ci(0, 5))
      set.add(ci(5, 10))
      expect(set.size).toBe(1)
      expect(set.getIntervals()).toEqual([ci(0, 10)])
    })

    it('does not merge touching open intervals', () => {
      const set = new IntervalSet()
      set.add(ci(0, 5, 'closed', 'open'))
      set.add(ci(5, 10, 'open', 'closed'))
      expect(set.size).toBe(2)
    })

    it('merges interval that absorbs multiple existing', () => {
      const set = new IntervalSet()
      set.add(ci(0, 2))
      set.add(ci(5, 7))
      set.add(ci(10, 12))
      set.add(ci(1, 11))
      expect(set.size).toBe(1)
      expect(set.getIntervals()).toEqual([ci(0, 12)])
    })

    it('handles open interval at low end', () => {
      const set = new IntervalSet()
      set.add(ci(0, 10, 'open', 'closed'))
      expect(set.contains(0)).toBe(false)
      expect(set.contains(5)).toBe(true)
      expect(set.contains(10)).toBe(true)
    })

    it('handles open interval at high end', () => {
      const set = new IntervalSet()
      set.add(ci(0, 10, 'closed', 'open'))
      expect(set.contains(0)).toBe(true)
      expect(set.contains(10)).toBe(false)
      expect(set.contains(5)).toBe(true)
    })

    it('ignores invalid intervals', () => {
      const set = new IntervalSet()
      set.add(ci(10, 5))
      expect(set.size).toBe(0)
    })

    it('ignores degenerate open interval', () => {
      const set = new IntervalSet()
      set.add({ low: 5, high: 5, lowKind: 'open', highKind: 'closed' })
      expect(set.size).toBe(0)
    })
  })

  describe('remove', () => {
    it('removes an interval splitting existing one', () => {
      const set = new IntervalSet()
      set.add(ci(0, 10))
      set.remove(ci(4, 6))
      expect(set.size).toBe(2)
      expect(set.getIntervals()).toEqual([ci(0, 4, 'closed', 'open'), ci(6, 10, 'open', 'closed')])
    })

    it('removes entire interval', () => {
      const set = new IntervalSet()
      set.add(ci(0, 10))
      set.remove(ci(0, 10))
      expect(set.size).toBe(0)
    })

    it('removes from start of interval', () => {
      const set = new IntervalSet()
      set.add(ci(0, 10))
      set.remove(ci(0, 5))
      expect(set.size).toBe(1)
      expect(set.getIntervals()).toEqual([ci(5, 10, 'open', 'closed')])
    })

    it('removes from end of interval', () => {
      const set = new IntervalSet()
      set.add(ci(0, 10))
      set.remove(ci(5, 10))
      expect(set.size).toBe(1)
      expect(set.getIntervals()).toEqual([ci(0, 5, 'closed', 'open')])
    })

    it('removes across multiple intervals', () => {
      const set = new IntervalSet()
      set.add(ci(0, 3))
      set.add(ci(5, 8))
      set.add(ci(10, 13))
      set.remove(ci(2, 11))
      expect(set.size).toBe(2)
      expect(set.getIntervals()).toEqual([ci(0, 2, 'closed', 'open'), ci(11, 13, 'open', 'closed')])
    })
  })

  describe('contains', () => {
    it('returns true for point inside closed interval', () => {
      const set = new IntervalSet()
      set.add(ci(0, 10))
      expect(set.contains(5)).toBe(true)
    })

    it('returns true for endpoints of closed interval', () => {
      const set = new IntervalSet()
      set.add(ci(0, 10))
      expect(set.contains(0)).toBe(true)
      expect(set.contains(10)).toBe(true)
    })

    it('returns false for point outside', () => {
      const set = new IntervalSet()
      set.add(ci(0, 10))
      expect(set.contains(-1)).toBe(false)
      expect(set.contains(11)).toBe(false)
    })

    it('respects open boundary semantics', () => {
      const set = new IntervalSet()
      set.add(ci(0, 10, 'open', 'open'))
      expect(set.contains(0)).toBe(false)
      expect(set.contains(10)).toBe(false)
      expect(set.contains(5)).toBe(true)
    })
  })

  describe('overlaps', () => {
    it('detects overlapping intervals', () => {
      const set = new IntervalSet()
      set.add(ci(0, 10))
      expect(set.overlaps(ci(5, 15))).toBe(true)
    })

    it('detects non-overlapping intervals', () => {
      const set = new IntervalSet()
      set.add(ci(0, 10))
      expect(set.overlaps(ci(15, 20))).toBe(false)
    })
  })

  describe('set operations', () => {
    it('computes union of two sets', () => {
      const a = new IntervalSet()
      a.add(ci(0, 5))
      a.add(ci(10, 15))
      const b = new IntervalSet()
      b.add(ci(3, 12))
      const result = a.union(b)
      expect(result.size).toBe(1)
      expect(result.getIntervals()).toEqual([ci(0, 15)])
    })

    it('computes intersection of two sets', () => {
      const a = new IntervalSet()
      a.add(ci(0, 10))
      const b = new IntervalSet()
      b.add(ci(5, 15))
      const result = a.intersection(b)
      expect(result.size).toBe(1)
      expect(result.getIntervals()).toEqual([ci(5, 10)])
    })

    it('computes difference of two sets', () => {
      const a = new IntervalSet()
      a.add(ci(0, 10))
      const b = new IntervalSet()
      b.add(ci(3, 7))
      const result = a.difference(b)
      expect(result.size).toBe(2)
    })

    it('computes complement', () => {
      const set = new IntervalSet()
      set.add(ci(2, 5))
      set.add(ci(8, 10))
      const comp = set.complement(0, 12)
      expect(comp.getIntervals().length).toBe(3)
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const set = new IntervalSet()
      set.add(ci(0, 10))
      const copy = set.clone()
      copy.remove(ci(3, 7))
      expect(set.size).toBe(1)
      expect(copy.size).toBe(2)
    })
  })

  describe('getTotalSpan', () => {
    it('computes span from first to last', () => {
      const set = new IntervalSet()
      set.add(ci(0, 5))
      set.add(ci(10, 20))
      expect(set.getTotalSpan()).toBe(20)
    })

    it('returns 0 for empty set', () => {
      const set = new IntervalSet()
      expect(set.getTotalSpan()).toBe(0)
    })
  })

  describe('isEmpty / clear', () => {
    it('isEmpty returns true for empty set', () => {
      const set = new IntervalSet()
      expect(set.isEmpty).toBe(true)
    })

    it('clear removes all intervals', () => {
      const set = new IntervalSet()
      set.add(ci(0, 10))
      set.clear()
      expect(set.isEmpty).toBe(true)
    })
  })

  describe('getMin / getMax', () => {
    it('returns min and max bounds', () => {
      const set = new IntervalSet()
      set.add(ci(2, 5))
      set.add(ci(10, 20))
      expect(set.getMin()).toBe(2)
      expect(set.getMax()).toBe(20)
    })

    it('returns undefined for empty set', () => {
      const set = new IntervalSet()
      expect(set.getMin()).toBe(undefined)
      expect(set.getMax()).toBe(undefined)
    })
  })

  describe('forEach', () => {
    it('iterates over intervals', () => {
      const set = new IntervalSet()
      set.add(ci(0, 5))
      set.add(ci(10, 15))
      const result: ContinuousInterval[] = []
      set.forEach((iv) => result.push(iv))
      expect(result.length).toBe(2)
      expect(result[0]!.low).toBe(0)
      expect(result[1]!.low).toBe(10)
    })
  })
})
