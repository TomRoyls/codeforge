import { describe, expect, it } from 'vitest'
import { DisjointIntervalSet } from '../../../src/utils/disjoint-interval-set.js'

describe('DisjointIntervalSet', () => {
  describe('add', () => {
    it('throws RangeError when start > end', () => {
      const set = new DisjointIntervalSet()
      expect(() => set.add(10, 5)).toThrow(RangeError)
    })

    it('adds single interval to empty set', () => {
      const set = new DisjointIntervalSet()
      set.add(1, 5)
      expect(set.size).toBe(1)
      expect(set.getIntervals()).toEqual([{ start: 1, end: 5 }])
    })

    it('merges overlapping intervals', () => {
      const set = new DisjointIntervalSet()
      set.add(1, 5)
      set.add(3, 8)
      expect(set.size).toBe(1)
      expect(set.getIntervals()).toEqual([{ start: 1, end: 8 }])
    })

    it('merges adjacent intervals', () => {
      const set = new DisjointIntervalSet()
      set.add(1, 5)
      set.add(6, 10)
      expect(set.size).toBe(1)
      expect(set.getIntervals()).toEqual([{ start: 1, end: 10 }])
    })

    it('keeps non-overlapping intervals separate', () => {
      const set = new DisjointIntervalSet()
      set.add(1, 5)
      set.add(10, 15)
      expect(set.size).toBe(2)
      expect(set.getIntervals()).toEqual([{ start: 1, end: 5 }, { start: 10, end: 15 }])
    })

    it('merges interval in the middle', () => {
      const set = new DisjointIntervalSet()
      set.add(1, 5)
      set.add(8, 12)
      set.add(4, 9)
      expect(set.size).toBe(1)
      expect(set.getIntervals()).toEqual([{ start: 1, end: 12 }])
    })

    it('adds interval before existing intervals', () => {
      const set = new DisjointIntervalSet()
      set.add(10, 15)
      set.add(1, 5)
      expect(set.size).toBe(2)
      expect(set.getIntervals()).toEqual([{ start: 1, end: 5 }, { start: 10, end: 15 }])
    })

    it('adds interval after existing intervals', () => {
      const set = new DisjointIntervalSet()
      set.add(1, 5)
      set.add(10, 15)
      expect(set.size).toBe(2)
      expect(set.getIntervals()).toEqual([{ start: 1, end: 5 }, { start: 10, end: 15 }])
    })
  })

  describe('remove', () => {
    it('does nothing when start > end', () => {
      const set = new DisjointIntervalSet()
      set.add(1, 10)
      set.remove(10, 5)
      expect(set.getIntervals()).toEqual([{ start: 1, end: 10 }])
    })

    it('removes entire interval', () => {
      const set = new DisjointIntervalSet()
      set.add(1, 10)
      set.remove(1, 10)
      expect(set.size).toBe(0)
    })

    it('removes middle of interval, splitting into two', () => {
      const set = new DisjointIntervalSet()
      set.add(1, 10)
      set.remove(4, 7)
      expect(set.size).toBe(2)
      expect(set.getIntervals()).toEqual([{ start: 1, end: 3 }, { start: 8, end: 10 }])
    })

    it('removes start of interval', () => {
      const set = new DisjointIntervalSet()
      set.add(1, 10)
      set.remove(1, 5)
      expect(set.size).toBe(1)
      expect(set.getIntervals()).toEqual([{ start: 6, end: 10 }])
    })

    it('removes end of interval', () => {
      const set = new DisjointIntervalSet()
      set.add(1, 10)
      set.remove(6, 10)
      expect(set.size).toBe(1)
      expect(set.getIntervals()).toEqual([{ start: 1, end: 5 }])
    })

    it('removes from multiple intervals', () => {
      const set = new DisjointIntervalSet()
      set.add(1, 5)
      set.add(10, 15)
      set.add(20, 25)
      set.remove(3, 12)
      expect(set.size).toBe(3)
      expect(set.getIntervals()).toEqual([{ start: 1, end: 2 }, { start: 13, end: 15 }, { start: 20, end: 25 }])
    })

    it('does nothing when removal range has no overlap', () => {
      const set = new DisjointIntervalSet()
      set.add(1, 5)
      set.add(10, 15)
      set.remove(7, 9)
      expect(set.size).toBe(2)
      expect(set.getIntervals()).toEqual([{ start: 1, end: 5 }, { start: 10, end: 15 }])
    })
  })

  describe('contains', () => {
    it('returns false for empty set', () => {
      const set = new DisjointIntervalSet()
      expect(set.contains(5)).toBe(false)
    })

    it('returns true when point is in interval', () => {
      const set = new DisjointIntervalSet()
      set.add(1, 10)
      expect(set.contains(5)).toBe(true)
    })

    it('returns false when point is not in interval', () => {
      const set = new DisjointIntervalSet()
      set.add(1, 10)
      expect(set.contains(15)).toBe(false)
    })

    it('works with multiple intervals using binary search', () => {
      const set = new DisjointIntervalSet()
      for (let i = 0; i < 10; i++) {
        set.add(i * 10, i * 10 + 5)
      }
      expect(set.contains(25)).toBe(true)
      expect(set.contains(27)).toBe(false)
    })
  })

  describe('containsInterval', () => {
    it('returns false for empty set', () => {
      const set = new DisjointIntervalSet()
      expect(set.containsInterval(1, 5)).toBe(false)
    })

    it('returns true when interval is fully contained', () => {
      const set = new DisjointIntervalSet()
      set.add(1, 10)
      expect(set.containsInterval(3, 7)).toBe(true)
    })

    it('returns false when interval is not fully contained', () => {
      const set = new DisjointIntervalSet()
      set.add(1, 10)
      expect(set.containsInterval(3, 15)).toBe(false)
    })

    it('returns true when interval equals existing interval', () => {
      const set = new DisjointIntervalSet()
      set.add(1, 10)
      expect(set.containsInterval(1, 10)).toBe(true)
    })
  })

  describe('overlaps', () => {
    it('returns false for empty set', () => {
      const set = new DisjointIntervalSet()
      expect(set.overlaps(1, 5)).toBe(false)
    })

    it('returns true when intervals overlap', () => {
      const set = new DisjointIntervalSet()
      set.add(1, 10)
      expect(set.overlaps(5, 15)).toBe(true)
    })

    it('returns true when intervals are adjacent', () => {
      const set = new DisjointIntervalSet()
      set.add(1, 10)
      expect(set.overlaps(10, 15)).toBe(true)
    })

    it('returns false when intervals do not overlap', () => {
      const set = new DisjointIntervalSet()
      set.add(1, 10)
      expect(set.overlaps(15, 20)).toBe(false)
    })
  })

  describe('findContaining', () => {
    it('returns undefined for empty set', () => {
      const set = new DisjointIntervalSet()
      expect(set.findContaining(5)).toBeUndefined()
    })

    it('returns interval containing point', () => {
      const set = new DisjointIntervalSet()
      set.add(1, 10)
      const result = set.findContaining(5)
      expect(result).toEqual({ start: 1, end: 10 })
    })

    it('returns undefined when point not in any interval', () => {
      const set = new DisjointIntervalSet()
      set.add(1, 10)
      expect(set.findContaining(15)).toBeUndefined()
    })

    it('works with many intervals using binary search', () => {
      const set = new DisjointIntervalSet()
      for (let i = 0; i < 10; i++) {
        set.add(i * 10, i * 10 + 5)
      }
      const result = set.findContaining(25)
      expect(result).toEqual({ start: 20, end: 25 })
    })
  })

  describe('size', () => {
    it('returns 0 for empty set', () => {
      const set = new DisjointIntervalSet()
      expect(set.size).toBe(0)
    })

    it('returns number of intervals', () => {
      const set = new DisjointIntervalSet()
      set.add(1, 5)
      set.add(10, 15)
      expect(set.size).toBe(2)
    })

    it('updates after add merges intervals', () => {
      const set = new DisjointIntervalSet()
      set.add(1, 5)
      set.add(3, 10)
      expect(set.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('returns true for empty set', () => {
      const set = new DisjointIntervalSet()
      expect(set.isEmpty).toBe(true)
    })

    it('returns false when set has intervals', () => {
      const set = new DisjointIntervalSet()
      set.add(1, 5)
      expect(set.isEmpty).toBe(false)
    })

    it('returns true after clear', () => {
      const set = new DisjointIntervalSet()
      set.add(1, 5)
      set.clear()
      expect(set.isEmpty).toBe(true)
    })
  })

  describe('getTotalCovered', () => {
    it('returns 0 for empty set', () => {
      const set = new DisjointIntervalSet()
      expect(set.getTotalCovered()).toBe(0)
    })

    it('returns sum of interval lengths', () => {
      const set = new DisjointIntervalSet()
      set.add(1, 3)
      set.add(10, 12)
      expect(set.getTotalCovered()).toBe(6)
    })

    it('returns 1 for single point interval', () => {
      const set = new DisjointIntervalSet()
      set.add(5, 5)
      expect(set.getTotalCovered()).toBe(1)
    })
  })

  describe('getIntervals', () => {
    it('returns empty array for empty set', () => {
      const set = new DisjointIntervalSet()
      expect(set.getIntervals()).toEqual([])
    })

    it('returns copy of intervals', () => {
      const set = new DisjointIntervalSet()
      set.add(1, 5)
      const intervals = set.getIntervals()
      intervals.push({ start: 10, end: 15 })
      expect(set.size).toBe(1)
    })

    it('returns all intervals', () => {
      const set = new DisjointIntervalSet()
      set.add(1, 5)
      set.add(10, 15)
      expect(set.getIntervals()).toEqual([{ start: 1, end: 5 }, { start: 10, end: 15 }])
    })
  })

  describe('getMin', () => {
    it('returns undefined for empty set', () => {
      const set = new DisjointIntervalSet()
      expect(set.getMin()).toBeUndefined()
    })

    it('returns minimum start value', () => {
      const set = new DisjointIntervalSet()
      set.add(10, 15)
      set.add(1, 5)
      expect(set.getMin()).toBe(1)
    })
  })

  describe('getMax', () => {
    it('returns undefined for empty set', () => {
      const set = new DisjointIntervalSet()
      expect(set.getMax()).toBeUndefined()
    })

    it('returns maximum end value', () => {
      const set = new DisjointIntervalSet()
      set.add(1, 5)
      set.add(10, 15)
      expect(set.getMax()).toBe(15)
    })
  })

  describe('clear', () => {
    it('removes all intervals', () => {
      const set = new DisjointIntervalSet()
      set.add(1, 5)
      set.add(10, 15)
      set.clear()
      expect(set.size).toBe(0)
      expect(set.isEmpty).toBe(true)
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const set = new DisjointIntervalSet()
      set.add(1, 5)
      const clone = set.clone()
      clone.add(10, 15)
      expect(set.size).toBe(1)
      expect(clone.size).toBe(2)
    })

    it('copies all intervals', () => {
      const set = new DisjointIntervalSet()
      set.add(1, 5)
      set.add(10, 15)
      const clone = set.clone()
      expect(clone.getIntervals()).toEqual([{ start: 1, end: 5 }, { start: 10, end: 15 }])
    })
  })

  describe('union', () => {
    it('returns union of two sets', () => {
      const set1 = new DisjointIntervalSet()
      set1.add(1, 5)
      const set2 = new DisjointIntervalSet()
      set2.add(10, 15)
      const result = set1.union(set2)
      expect(result.getIntervals()).toEqual([{ start: 1, end: 5 }, { start: 10, end: 15 }])
    })

    it('merges overlapping intervals in union', () => {
      const set1 = new DisjointIntervalSet()
      set1.add(1, 10)
      const set2 = new DisjointIntervalSet()
      set2.add(5, 15)
      const result = set1.union(set2)
      expect(result.getIntervals()).toEqual([{ start: 1, end: 15 }])
    })

    it('returns copy when union with empty set', () => {
      const set1 = new DisjointIntervalSet()
      set1.add(1, 5)
      const set2 = new DisjointIntervalSet()
      const result = set1.union(set2)
      expect(result.getIntervals()).toEqual([{ start: 1, end: 5 }])
    })
  })

  describe('intersection', () => {
    it('returns intersection of two sets', () => {
      const set1 = new DisjointIntervalSet()
      set1.add(1, 10)
      const set2 = new DisjointIntervalSet()
      set2.add(5, 15)
      const result = set1.intersection(set2)
      expect(result.getIntervals()).toEqual([{ start: 5, end: 10 }])
    })

    it('returns empty set when no intersection', () => {
      const set1 = new DisjointIntervalSet()
      set1.add(1, 5)
      const set2 = new DisjointIntervalSet()
      set2.add(10, 15)
      const result = set1.intersection(set2)
      expect(result.isEmpty).toBe(true)
    })

    it('returns empty set when intersecting with empty set', () => {
      const set1 = new DisjointIntervalSet()
      set1.add(1, 5)
      const set2 = new DisjointIntervalSet()
      const result = set1.intersection(set2)
      expect(result.isEmpty).toBe(true)
    })

    it('returns multiple intersections', () => {
      const set1 = new DisjointIntervalSet()
      set1.add(1, 5)
      set1.add(10, 15)
      const set2 = new DisjointIntervalSet()
      set2.add(3, 12)
      const result = set1.intersection(set2)
      expect(result.getIntervals()).toEqual([{ start: 3, end: 5 }, { start: 10, end: 12 }])
    })
  })

  describe('difference', () => {
    it('returns difference of two sets', () => {
      const set1 = new DisjointIntervalSet()
      set1.add(1, 10)
      const set2 = new DisjointIntervalSet()
      set2.add(5, 15)
      const result = set1.difference(set2)
      expect(result.getIntervals()).toEqual([{ start: 1, end: 4 }])
    })

    it('returns copy when difference with empty set', () => {
      const set1 = new DisjointIntervalSet()
      set1.add(1, 5)
      const set2 = new DisjointIntervalSet()
      const result = set1.difference(set2)
      expect(result.getIntervals()).toEqual([{ start: 1, end: 5 }])
    })

    it('returns empty set when subtracting superset', () => {
      const set1 = new DisjointIntervalSet()
      set1.add(5, 10)
      const set2 = new DisjointIntervalSet()
      set2.add(1, 15)
      const result = set1.difference(set2)
      expect(result.isEmpty).toBe(true)
    })
  })

  describe('forEach', () => {
    it('iterates over all intervals', () => {
      const set = new DisjointIntervalSet()
      set.add(1, 5)
      set.add(10, 15)
      const intervals: Array<{ start: number; end: number }> = []
      set.forEach((iv, i) => {
        intervals.push(iv)
      })
      expect(intervals).toEqual([{ start: 1, end: 5 }, { start: 10, end: 15 }])
    })

    it('passes correct index', () => {
      const set = new DisjointIntervalSet()
      set.add(1, 5)
      set.add(10, 15)
      const indices: number[] = []
      set.forEach((iv, i) => {
        indices.push(i)
      })
      expect(indices).toEqual([0, 1])
    })

    it('does nothing for empty set', () => {
      const set = new DisjointIntervalSet()
      let called = false
      set.forEach(() => {
        called = true
      })
      expect(called).toBe(false)
    })
  })
})