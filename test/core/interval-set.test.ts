import { describe, it, expect } from 'vitest'
import { IntervalSet } from '../../src/core/interval-set/index.js'

function iv(start: number, end: number) {
  return { start, end }
}

describe('IntervalSet', () => {
  describe('constructor', () => {
    it('creates empty set', () => {
      const s = new IntervalSet<number>()
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('accepts custom comparator', () => {
      const s = new IntervalSet<number>({ compare: (a, b) => b - a })
      s.add(10, 5)
      expect(s.size).toBe(1)
    })

    it('accepts custom distance function', () => {
      const s = new IntervalSet<number>({ distance: () => 42 })
      s.add(0, 10)
      expect(s.length).toBe(42)
    })

    it('works with default comparator for numbers', () => {
      const s = new IntervalSet<number>()
      s.add(1, 5)
      s.add(10, 15)
      expect(s.size).toBe(2)
    })

    it('accepts custom comparator for strings', () => {
      const s = new IntervalSet<string>({
        compare: (a, b) => a.localeCompare(b),
        distance: (a, b) => b.charCodeAt(0) - a.charCodeAt(0),
      })
      s.add('a', 'd')
      s.add('f', 'h')
      expect(s.size).toBe(2)
      expect(s.has('b')).toBe(true)
    })
  })

  describe('add', () => {
    it('adds single interval', () => {
      const s = new IntervalSet<number>()
      s.add(0, 10)
      expect(s.size).toBe(1)
      expect(s.isEmpty()).toBe(false)
    })

    it('adds two non-overlapping intervals', () => {
      const s = new IntervalSet<number>()
      s.add(0, 5)
      s.add(10, 15)
      expect(s.size).toBe(2)
    })

    it('merges overlapping intervals', () => {
      const s = new IntervalSet<number>()
      s.add(0, 10)
      s.add(5, 15)
      expect(s.size).toBe(1)
      expect(s.toArray()).toEqual([iv(0, 15)])
    })

    it('merges touching intervals', () => {
      const s = new IntervalSet<number>()
      s.add(0, 5)
      s.add(5, 10)
      expect(s.size).toBe(1)
      expect(s.toArray()).toEqual([iv(0, 10)])
    })

    it('merges when new interval is inside existing', () => {
      const s = new IntervalSet<number>()
      s.add(0, 20)
      s.add(5, 10)
      expect(s.size).toBe(1)
      expect(s.toArray()).toEqual([iv(0, 20)])
    })

    it('merges when existing is inside new', () => {
      const s = new IntervalSet<number>()
      s.add(5, 10)
      s.add(0, 20)
      expect(s.size).toBe(1)
      expect(s.toArray()).toEqual([iv(0, 20)])
    })

    it('merges multiple intervals in one add', () => {
      const s = new IntervalSet<number>()
      s.add(0, 5)
      s.add(10, 15)
      s.add(20, 25)
      s.add(3, 22)
      expect(s.size).toBe(1)
      expect(s.toArray()).toEqual([iv(0, 25)])
    })

    it('adds before all existing', () => {
      const s = new IntervalSet<number>()
      s.add(10, 20)
      s.add(0, 5)
      expect(s.toArray()).toEqual([iv(0, 5), iv(10, 20)])
    })

    it('adds after all existing', () => {
      const s = new IntervalSet<number>()
      s.add(0, 5)
      s.add(10, 20)
      expect(s.toArray()).toEqual([iv(0, 5), iv(10, 20)])
    })

    it('no-ops for start >= end', () => {
      const s = new IntervalSet<number>()
      s.add(5, 5)
      expect(s.size).toBe(0)
      s.add(10, 5)
      expect(s.size).toBe(0)
    })

    it('handles negative intervals', () => {
      const s = new IntervalSet<number>()
      s.add(-10, -5)
      expect(s.size).toBe(1)
      expect(s.toArray()).toEqual([iv(-10, -5)])
    })

    it('returns void', () => {
      const s = new IntervalSet<number>()
      expect(s.add(0, 10)).toBeUndefined()
    })

    it('handles fractional numbers', () => {
      const s = new IntervalSet<number>()
      s.add(1.5, 3.7)
      expect(s.size).toBe(1)
      expect(s.toArray()).toEqual([iv(1.5, 3.7)])
    })

    it('merges bridging interval between two', () => {
      const s = new IntervalSet<number>()
      s.add(0, 5)
      s.add(10, 15)
      s.add(5, 10)
      expect(s.size).toBe(1)
      expect(s.toArray()).toEqual([iv(0, 15)])
    })

    it('overlaps left edge', () => {
      const s = new IntervalSet<number>()
      s.add(5, 15)
      s.add(0, 8)
      expect(s.toArray()).toEqual([iv(0, 15)])
    })

    it('overlaps right edge', () => {
      const s = new IntervalSet<number>()
      s.add(5, 15)
      s.add(12, 20)
      expect(s.toArray()).toEqual([iv(5, 20)])
    })

    it('handles add same interval twice', () => {
      const s = new IntervalSet<number>()
      s.add(0, 10)
      s.add(0, 10)
      expect(s.size).toBe(1)
      expect(s.toArray()).toEqual([iv(0, 10)])
    })

    it('handles add with exact adjacency on both sides', () => {
      const s = new IntervalSet<number>()
      s.add(0, 5)
      s.add(15, 20)
      s.add(5, 15)
      expect(s.size).toBe(1)
      expect(s.toArray()).toEqual([iv(0, 20)])
    })

    it('merges three intervals into one', () => {
      const s = new IntervalSet<number>()
      s.add(0, 5)
      s.add(3, 8)
      s.add(6, 12)
      expect(s.size).toBe(1)
      expect(s.toArray()).toEqual([iv(0, 12)])
    })

    it('handles interval touching on left', () => {
      const s = new IntervalSet<number>()
      s.add(5, 10)
      s.add(0, 5)
      expect(s.toArray()).toEqual([iv(0, 10)])
    })

    it('handles interval touching on right', () => {
      const s = new IntervalSet<number>()
      s.add(0, 5)
      s.add(5, 10)
      expect(s.toArray()).toEqual([iv(0, 10)])
    })
  })

  describe('remove', () => {
    it('removes nothing from empty set', () => {
      const s = new IntervalSet<number>()
      s.remove(0, 10)
      expect(s.isEmpty()).toBe(true)
    })

    it('removes entire interval', () => {
      const s = new IntervalSet<number>()
      s.add(0, 10)
      s.remove(0, 10)
      expect(s.isEmpty()).toBe(true)
    })

    it('splits interval creating two', () => {
      const s = new IntervalSet<number>()
      s.add(0, 20)
      s.remove(5, 15)
      expect(s.size).toBe(2)
      expect(s.toArray()).toEqual([iv(0, 5), iv(15, 20)])
    })

    it('removes left portion', () => {
      const s = new IntervalSet<number>()
      s.add(5, 20)
      s.remove(0, 10)
      expect(s.toArray()).toEqual([iv(10, 20)])
    })

    it('removes right portion', () => {
      const s = new IntervalSet<number>()
      s.add(5, 20)
      s.remove(15, 25)
      expect(s.toArray()).toEqual([iv(5, 15)])
    })

    it('removes across multiple intervals', () => {
      const s = new IntervalSet<number>()
      s.add(0, 5)
      s.add(10, 15)
      s.add(20, 25)
      s.remove(3, 22)
      expect(s.toArray()).toEqual([iv(0, 3), iv(22, 25)])
    })

    it('no-ops for non-overlapping', () => {
      const s = new IntervalSet<number>()
      s.add(10, 20)
      s.remove(0, 5)
      expect(s.size).toBe(1)
      expect(s.toArray()).toEqual([iv(10, 20)])
    })

    it('no-ops for start >= end', () => {
      const s = new IntervalSet<number>()
      s.add(0, 10)
      s.remove(5, 5)
      expect(s.size).toBe(1)
    })

    it('returns void', () => {
      const s = new IntervalSet<number>()
      s.add(0, 10)
      expect(s.remove(0, 10)).toBeUndefined()
    })

    it('handles negative numbers', () => {
      const s = new IntervalSet<number>()
      s.add(-20, 20)
      s.remove(-10, 10)
      expect(s.toArray()).toEqual([iv(-20, -10), iv(10, 20)])
    })

    it('splits at boundary', () => {
      const s = new IntervalSet<number>()
      s.add(0, 30)
      s.remove(10, 20)
      expect(s.toArray()).toEqual([iv(0, 10), iv(20, 30)])
    })

    it('removes on boundary exactly', () => {
      const s = new IntervalSet<number>()
      s.add(0, 10)
      s.add(20, 30)
      s.remove(10, 20)
      expect(s.toArray()).toEqual([iv(0, 10), iv(20, 30)])
    })

    it('handles remove larger than existing', () => {
      const s = new IntervalSet<number>()
      s.add(5, 10)
      s.remove(0, 20)
      expect(s.isEmpty()).toBe(true)
    })

    it('handles remove touching boundary left', () => {
      const s = new IntervalSet<number>()
      s.add(5, 15)
      s.remove(0, 5)
      expect(s.toArray()).toEqual([iv(5, 15)])
    })

    it('handles remove touching boundary right', () => {
      const s = new IntervalSet<number>()
      s.add(5, 15)
      s.remove(15, 20)
      expect(s.toArray()).toEqual([iv(5, 15)])
    })
  })

  describe('has', () => {
    it('returns true for point inside interval', () => {
      const s = IntervalSet.from([[5, 15]])
      expect(s.has(10)).toBe(true)
    })

    it('returns true for point at start boundary', () => {
      const s = IntervalSet.from([[5, 15]])
      expect(s.has(5)).toBe(true)
    })

    it('returns false for point at end boundary', () => {
      const s = IntervalSet.from([[5, 15]])
      expect(s.has(15)).toBe(false)
    })

    it('returns false for point in gap', () => {
      const s = IntervalSet.from([[5, 15], [25, 35]])
      expect(s.has(20)).toBe(false)
    })

    it('returns false for point before all', () => {
      const s = IntervalSet.from([[5, 15]])
      expect(s.has(0)).toBe(false)
    })

    it('returns false for point after all', () => {
      const s = IntervalSet.from([[5, 15]])
      expect(s.has(100)).toBe(false)
    })

    it('returns false for empty set', () => {
      const s = new IntervalSet<number>()
      expect(s.has(5)).toBe(false)
    })

    it('finds point in second interval', () => {
      const s = IntervalSet.from([[5, 15], [25, 35]])
      expect(s.has(30)).toBe(true)
    })

    it('handles merged intervals', () => {
      const s = new IntervalSet<number>()
      s.add(0, 5)
      s.add(10, 15)
      s.add(5, 10)
      expect(s.has(7)).toBe(true)
    })
  })

  describe('hasInterval', () => {
    it('returns true for exact match', () => {
      const s = IntervalSet.from([[0, 20]])
      expect(s.hasInterval(0, 20)).toBe(true)
    })

    it('returns false for sub-interval', () => {
      const s = IntervalSet.from([[0, 20]])
      expect(s.hasInterval(5, 15)).toBe(false)
    })

    it('returns false for interval spanning gap', () => {
      const s = IntervalSet.from([[0, 10], [20, 30]])
      expect(s.hasInterval(5, 25)).toBe(false)
    })

    it('returns false for interval outside', () => {
      const s = IntervalSet.from([[0, 10]])
      expect(s.hasInterval(15, 25)).toBe(false)
    })

    it('returns false for empty set', () => {
      const s = new IntervalSet<number>()
      expect(s.hasInterval(0, 10)).toBe(false)
    })

    it('returns true for second interval match', () => {
      const s = IntervalSet.from([[0, 10], [20, 30]])
      expect(s.hasInterval(20, 30)).toBe(true)
    })

    it('returns false for partial match on start', () => {
      const s = IntervalSet.from([[0, 10]])
      expect(s.hasInterval(0, 5)).toBe(false)
    })

    it('returns false for partial match on end', () => {
      const s = IntervalSet.from([[0, 10]])
      expect(s.hasInterval(5, 10)).toBe(false)
    })
  })

  describe('contains', () => {
    it('returns true for sub-interval', () => {
      const s = IntervalSet.from([[0, 20]])
      expect(s.contains(5, 15)).toBe(true)
    })

    it('returns true for exact interval', () => {
      const s = IntervalSet.from([[0, 20]])
      expect(s.contains(0, 20)).toBe(true)
    })

    it('returns false for interval spanning gap', () => {
      const s = IntervalSet.from([[0, 10], [20, 30]])
      expect(s.contains(5, 25)).toBe(false)
    })

    it('returns false for interval outside', () => {
      const s = IntervalSet.from([[5, 15]])
      expect(s.contains(0, 10)).toBe(false)
    })

    it('returns false for empty set', () => {
      const s = new IntervalSet<number>()
      expect(s.contains(0, 10)).toBe(false)
    })

    it('returns false when start is in gap', () => {
      const s = IntervalSet.from([[0, 10], [20, 30]])
      expect(s.contains(15, 25)).toBe(false)
    })

    it('returns false for zero-length interval', () => {
      const s = IntervalSet.from([[5, 15]])
      expect(s.contains(10, 10)).toBe(false)
    })

    it('returns false when end exceeds interval', () => {
      const s = IntervalSet.from([[5, 15]])
      expect(s.contains(5, 20)).toBe(false)
    })
  })

  describe('overlaps', () => {
    it('returns true for overlapping', () => {
      const s = IntervalSet.from([[5, 15]])
      expect(s.overlaps(10, 20)).toBe(true)
    })

    it('returns true for interval inside', () => {
      const s = IntervalSet.from([[5, 15]])
      expect(s.overlaps(7, 13)).toBe(true)
    })

    it('returns false for touching at start', () => {
      const s = IntervalSet.from([[5, 15]])
      expect(s.overlaps(0, 5)).toBe(false)
    })

    it('returns false for touching at end', () => {
      const s = IntervalSet.from([[5, 15]])
      expect(s.overlaps(15, 20)).toBe(false)
    })

    it('returns false for non-overlapping', () => {
      const s = IntervalSet.from([[5, 15], [25, 35]])
      expect(s.overlaps(16, 24)).toBe(false)
    })

    it('returns false for empty set', () => {
      const s = new IntervalSet<number>()
      expect(s.overlaps(0, 10)).toBe(false)
    })

    it('returns true for spanning multiple', () => {
      const s = IntervalSet.from([[5, 15], [25, 35]])
      expect(s.overlaps(0, 50)).toBe(true)
    })

    it('returns true for touching left boundary', () => {
      const s = IntervalSet.from([[5, 15]])
      expect(s.overlaps(4, 6)).toBe(true)
    })

    it('returns true for touching right boundary', () => {
      const s = IntervalSet.from([[5, 15]])
      expect(s.overlaps(14, 16)).toBe(true)
    })

    it('returns false for interval after all', () => {
      const s = IntervalSet.from([[5, 15]])
      expect(s.overlaps(20, 30)).toBe(false)
    })

    it('returns false for interval before all', () => {
      const s = IntervalSet.from([[5, 15]])
      expect(s.overlaps(0, 4)).toBe(false)
    })
  })

  describe('size', () => {
    it('returns 0 for empty set', () => {
      const s = new IntervalSet<number>()
      expect(s.size).toBe(0)
    })

    it('returns 1 for single interval', () => {
      const s = IntervalSet.from([[0, 10]])
      expect(s.size).toBe(1)
    })

    it('reflects merges', () => {
      const s = new IntervalSet<number>()
      s.add(0, 5)
      s.add(3, 10)
      expect(s.size).toBe(1)
    })

    it('reflects splits from remove', () => {
      const s = new IntervalSet<number>()
      s.add(0, 20)
      s.remove(10, 15)
      expect(s.size).toBe(2)
    })

    it('tracks multiple disjoint intervals', () => {
      const s = IntervalSet.from([[0, 5], [10, 15], [20, 25]])
      expect(s.size).toBe(3)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new set', () => {
      const s = new IntervalSet<number>()
      expect(s.isEmpty()).toBe(true)
    })

    it('returns false after add', () => {
      const s = IntervalSet.from([[0, 10]])
      expect(s.isEmpty()).toBe(false)
    })

    it('returns true after removing all', () => {
      const s = new IntervalSet<number>()
      s.add(0, 10)
      s.remove(0, 10)
      expect(s.isEmpty()).toBe(true)
    })

    it('returns true after clear', () => {
      const s = IntervalSet.from([[0, 10]])
      s.clear()
      expect(s.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears all intervals', () => {
      const s = IntervalSet.from([[0, 10], [20, 30]])
      s.clear()
      expect(s.isEmpty()).toBe(true)
      expect(s.size).toBe(0)
    })

    it('is safe on empty set', () => {
      const s = new IntervalSet<number>()
      s.clear()
      expect(s.isEmpty()).toBe(true)
    })

    it('returns void', () => {
      const s = new IntervalSet<number>()
      expect(s.clear()).toBeUndefined()
    })

    it('allows adding after clear', () => {
      const s = IntervalSet.from([[0, 10]])
      s.clear()
      s.add(5, 15)
      expect(s.size).toBe(1)
    })
  })

  describe('intervals', () => {
    it('returns empty array for empty set', () => {
      const s = new IntervalSet<number>()
      expect(s.intervals).toEqual([])
    })

    it('returns copies not references', () => {
      const s = IntervalSet.from([[0, 10]])
      const arr = s.intervals
      arr[0]!.start = 99
      expect(s.intervals[0]!.start).toBe(0)
    })

    it('returns all intervals', () => {
      const s = IntervalSet.from([[0, 5], [10, 15]])
      expect(s.intervals).toEqual([iv(0, 5), iv(10, 15)])
    })

    it('returns new array each call', () => {
      const s = IntervalSet.from([[0, 10]])
      const a = s.intervals
      const b = s.intervals
      expect(a).not.toBe(b)
    })
  })

  describe('union', () => {
    it('returns empty union of two empty sets', () => {
      const a = new IntervalSet<number>()
      const b = new IntervalSet<number>()
      expect(a.union(b).isEmpty()).toBe(true)
    })

    it('returns copy when other is empty', () => {
      const a = IntervalSet.from([[0, 10]])
      const b = new IntervalSet<number>()
      expect(a.union(b).toArray()).toEqual([iv(0, 10)])
    })

    it('merges overlapping from both', () => {
      const a = IntervalSet.from([[0, 10]])
      const b = IntervalSet.from([[5, 20]])
      expect(a.union(b).toArray()).toEqual([iv(0, 20)])
    })

    it('combines disjoint', () => {
      const a = IntervalSet.from([[0, 5]])
      const b = IntervalSet.from([[10, 15]])
      expect(a.union(b).toArray()).toEqual([iv(0, 5), iv(10, 15)])
    })

    it('does not modify originals', () => {
      const a = IntervalSet.from([[0, 5]])
      const b = IntervalSet.from([[10, 15]])
      a.union(b)
      expect(a.toArray()).toEqual([iv(0, 5)])
      expect(b.toArray()).toEqual([iv(10, 15)])
    })

    it('handles complex merge', () => {
      const a = IntervalSet.from([[0, 5], [15, 20]])
      const b = IntervalSet.from([[3, 18]])
      expect(a.union(b).toArray()).toEqual([iv(0, 20)])
    })

    it('handles identical sets', () => {
      const a = IntervalSet.from([[0, 10]])
      const b = IntervalSet.from([[0, 10]])
      expect(a.union(b).toArray()).toEqual([iv(0, 10)])
    })

    it('handles multiple intervals from both', () => {
      const a = IntervalSet.from([[0, 5], [20, 25]])
      const b = IntervalSet.from([[10, 15], [30, 35]])
      const result = a.union(b)
      expect(result.size).toBe(4)
    })
  })

  describe('intersection', () => {
    it('returns empty for non-overlapping', () => {
      const a = IntervalSet.from([[0, 10]])
      const b = IntervalSet.from([[20, 30]])
      expect(a.intersection(b).isEmpty()).toBe(true)
    })

    it('returns overlap', () => {
      const a = IntervalSet.from([[0, 15]])
      const b = IntervalSet.from([[10, 25]])
      expect(a.intersection(b).toArray()).toEqual([iv(10, 15)])
    })

    it('returns empty when one is empty', () => {
      const a = IntervalSet.from([[0, 10]])
      const b = new IntervalSet<number>()
      expect(a.intersection(b).isEmpty()).toBe(true)
    })

    it('handles multiple intersections', () => {
      const a = IntervalSet.from([[0, 10], [20, 30]])
      const b = IntervalSet.from([[5, 25]])
      expect(a.intersection(b).toArray()).toEqual([iv(5, 10), iv(20, 25)])
    })

    it('does not modify originals', () => {
      const a = IntervalSet.from([[0, 10]])
      const b = IntervalSet.from([[5, 15]])
      a.intersection(b)
      expect(a.toArray()).toEqual([iv(0, 10)])
      expect(b.toArray()).toEqual([iv(5, 15)])
    })

    it('handles identical sets', () => {
      const a = IntervalSet.from([[0, 10], [20, 30]])
      const b = IntervalSet.from([[0, 10], [20, 30]])
      expect(a.intersection(b).toArray()).toEqual([iv(0, 10), iv(20, 30)])
    })

    it('handles partial overlap with multiple', () => {
      const a = IntervalSet.from([[0, 5], [10, 15], [20, 25]])
      const b = IntervalSet.from([[3, 22]])
      expect(a.intersection(b).toArray()).toEqual([iv(3, 5), iv(10, 15), iv(20, 22)])
    })

    it('returns empty for both empty', () => {
      const a = new IntervalSet<number>()
      const b = new IntervalSet<number>()
      expect(a.intersection(b).isEmpty()).toBe(true)
    })
  })

  describe('difference', () => {
    it('returns copy when other is empty', () => {
      const a = IntervalSet.from([[0, 10]])
      const b = new IntervalSet<number>()
      expect(a.difference(b).toArray()).toEqual([iv(0, 10)])
    })

    it('returns empty when subtracting self', () => {
      const a = IntervalSet.from([[0, 10]])
      expect(a.difference(a).isEmpty()).toBe(true)
    })

    it('removes overlapping portion', () => {
      const a = IntervalSet.from([[0, 20]])
      const b = IntervalSet.from([[5, 15]])
      expect(a.difference(b).toArray()).toEqual([iv(0, 5), iv(15, 20)])
    })

    it('removes entire interval', () => {
      const a = IntervalSet.from([[0, 10], [20, 30]])
      const b = IntervalSet.from([[0, 10]])
      expect(a.difference(b).toArray()).toEqual([iv(20, 30)])
    })

    it('does not modify originals', () => {
      const a = IntervalSet.from([[0, 10]])
      const b = IntervalSet.from([[5, 15]])
      a.difference(b)
      expect(a.toArray()).toEqual([iv(0, 10)])
      expect(b.toArray()).toEqual([iv(5, 15)])
    })

    it('handles multiple removals', () => {
      const a = IntervalSet.from([[0, 30]])
      const b = IntervalSet.from([[5, 10], [20, 25]])
      expect(a.difference(b).toArray()).toEqual([iv(0, 5), iv(10, 20), iv(25, 30)])
    })

    it('handles disjoint sets', () => {
      const a = IntervalSet.from([[0, 10]])
      const b = IntervalSet.from([[20, 30]])
      expect(a.difference(b).toArray()).toEqual([iv(0, 10)])
    })

    it('handles empty self', () => {
      const a = new IntervalSet<number>()
      const b = IntervalSet.from([[0, 10]])
      expect(a.difference(b).isEmpty()).toBe(true)
    })
  })

  describe('complement', () => {
    it('returns full range for empty set', () => {
      const s = new IntervalSet<number>()
      expect(s.complement(0, 20).toArray()).toEqual([iv(0, 20)])
    })

    it('returns nothing when set covers full range', () => {
      const s = IntervalSet.from([[0, 20]])
      expect(s.complement(0, 20).isEmpty()).toBe(true)
    })

    it('returns gaps', () => {
      const s = IntervalSet.from([[5, 15]])
      expect(s.complement(0, 20).toArray()).toEqual([iv(0, 5), iv(15, 20)])
    })

    it('handles interval extending beyond min', () => {
      const s = IntervalSet.from([[-5, 10]])
      expect(s.complement(0, 20).toArray()).toEqual([iv(10, 20)])
    })

    it('handles interval extending beyond max', () => {
      const s = IntervalSet.from([[5, 25]])
      expect(s.complement(0, 20).toArray()).toEqual([iv(0, 5)])
    })

    it('handles multiple intervals', () => {
      const s = IntervalSet.from([[2, 5], [8, 12]])
      expect(s.complement(0, 20).toArray()).toEqual([iv(0, 2), iv(5, 8), iv(12, 20)])
    })

    it('handles interval covering entire range', () => {
      const s = IntervalSet.from([[-10, 30]])
      expect(s.complement(0, 20).isEmpty()).toBe(true)
    })

    it('does not modify original', () => {
      const s = IntervalSet.from([[5, 15]])
      s.complement(0, 20)
      expect(s.toArray()).toEqual([iv(5, 15)])
    })
  })

  describe('length', () => {
    it('returns 0 for empty set', () => {
      const s = new IntervalSet<number>()
      expect(s.length).toBe(0)
    })

    it('returns length of single interval', () => {
      const s = IntervalSet.from([[0, 10]])
      expect(s.length).toBe(10)
    })

    it('returns sum of multiple', () => {
      const s = IntervalSet.from([[0, 5], [10, 20]])
      expect(s.length).toBe(15)
    })

    it('handles merged intervals', () => {
      const s = new IntervalSet<number>()
      s.add(0, 10)
      s.add(5, 15)
      expect(s.length).toBe(15)
    })

    it('updates after remove', () => {
      const s = new IntervalSet<number>()
      s.add(0, 20)
      s.remove(5, 10)
      expect(s.length).toBe(15)
    })

    it('handles fractional precision', () => {
      const s = IntervalSet.from([[0.1, 0.5]])
      expect(s.length).toBeCloseTo(0.4)
    })

    it('handles large numbers', () => {
      const s = IntervalSet.from([[0, 1000000]])
      expect(s.length).toBe(1000000)
    })
  })

  describe('forEach', () => {
    it('does not call for empty set', () => {
      const s = new IntervalSet<number>()
      const items: Interval<number>[] = []
      s.forEach((iv) => items.push(iv))
      expect(items).toEqual([])
    })

    it('iterates in order', () => {
      const s = IntervalSet.from([[10, 20], [0, 5]])
      const items: Interval<number>[] = []
      s.forEach((iv) => items.push(iv))
      expect(items).toEqual([iv(0, 5), iv(10, 20)])
    })

    it('provides correct index', () => {
      const s = IntervalSet.from([[0, 5], [10, 15]])
      const indices: number[] = []
      s.forEach((_iv, i) => indices.push(i))
      expect(indices).toEqual([0, 1])
    })

    it('returns void', () => {
      const s = IntervalSet.from([[0, 10]])
      expect(s.forEach(() => {})).toBeUndefined()
    })

    it('provides copies of intervals', () => {
      const s = IntervalSet.from([[0, 10]])
      s.forEach((interval) => {
        interval.start = 99
      })
      expect(s.toArray()[0]!.start).toBe(0)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty set', () => {
      const s = new IntervalSet<number>()
      expect(s.toArray()).toEqual([])
    })

    it('returns single interval', () => {
      const s = IntervalSet.from([[0, 10]])
      expect(s.toArray()).toEqual([iv(0, 10)])
    })

    it('returns sorted non-overlapping', () => {
      const s = new IntervalSet<number>()
      s.add(10, 20)
      s.add(0, 5)
      expect(s.toArray()).toEqual([iv(0, 5), iv(10, 20)])
    })

    it('returns copy not reference', () => {
      const s = IntervalSet.from([[0, 10]])
      const arr = s.toArray()
      arr.push({ start: 20, end: 30 })
      expect(s.size).toBe(1)
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates empty set', () => {
      const s = new IntervalSet<number>()
      const result = [...s]
      expect(result).toEqual([])
    })

    it('iterates single interval', () => {
      const s = IntervalSet.from([[0, 10]])
      const result = [...s]
      expect(result).toEqual([iv(0, 10)])
    })

    it('iterates multiple intervals in order', () => {
      const s = IntervalSet.from([[10, 20], [0, 5]])
      const result = [...s]
      expect(result).toEqual([iv(0, 5), iv(10, 20)])
    })

    it('works with for-of', () => {
      const s = IntervalSet.from([[0, 5], [10, 15]])
      const starts: number[] = []
      for (const interval of s) {
        starts.push(interval.start)
      }
      expect(starts).toEqual([0, 10])
    })

    it('provides copies', () => {
      const s = IntervalSet.from([[0, 10]])
      for (const interval of s) {
        interval.start = 99
      }
      expect(s.toArray()[0]!.start).toBe(0)
    })
  })

  describe('min', () => {
    it('returns undefined for empty set', () => {
      const s = new IntervalSet<number>()
      expect(s.min()).toBeUndefined()
    })

    it('returns start of first interval', () => {
      const s = IntervalSet.from([[5, 10]])
      expect(s.min()).toBe(5)
    })

    it('returns smallest start', () => {
      const s = IntervalSet.from([[10, 20], [0, 5]])
      expect(s.min()).toBe(0)
    })

    it('handles negative numbers', () => {
      const s = IntervalSet.from([[-10, 10]])
      expect(s.min()).toBe(-10)
    })

    it('updates after add', () => {
      const s = IntervalSet.from([[5, 10]])
      s.add(0, 3)
      expect(s.min()).toBe(0)
    })

    it('updates after remove', () => {
      const s = IntervalSet.from([[0, 5], [10, 15]])
      s.remove(0, 5)
      expect(s.min()).toBe(10)
    })
  })

  describe('max', () => {
    it('returns undefined for empty set', () => {
      const s = new IntervalSet<number>()
      expect(s.max()).toBeUndefined()
    })

    it('returns end of last interval', () => {
      const s = IntervalSet.from([[5, 10]])
      expect(s.max()).toBe(10)
    })

    it('returns largest end', () => {
      const s = IntervalSet.from([[0, 5], [10, 20]])
      expect(s.max()).toBe(20)
    })

    it('handles large numbers', () => {
      const s = IntervalSet.from([[0, 1000000]])
      expect(s.max()).toBe(1000000)
    })

    it('updates after add', () => {
      const s = IntervalSet.from([[0, 5]])
      s.add(10, 20)
      expect(s.max()).toBe(20)
    })

    it('updates after remove', () => {
      const s = IntervalSet.from([[0, 5], [10, 20]])
      s.remove(10, 20)
      expect(s.max()).toBe(5)
    })
  })

  describe('gap', () => {
    it('returns undefined when no gaps', () => {
      const s = IntervalSet.from([[0, 20]])
      expect(s.gap(0, 20)).toBeUndefined()
    })

    it('returns full range for empty set', () => {
      const s = new IntervalSet<number>()
      expect(s.gap(0, 20)).toEqual(iv(0, 20))
    })

    it('returns largest gap', () => {
      const s = IntervalSet.from([[5, 10], [25, 30]])
      expect(s.gap(0, 40)).toEqual(iv(10, 25))
    })

    it('returns gap before first interval', () => {
      const s = IntervalSet.from([[10, 20]])
      expect(s.gap(0, 30)).toEqual(iv(0, 10))
    })

    it('returns gap after last interval', () => {
      const s = IntervalSet.from([[0, 10]])
      expect(s.gap(0, 30)).toEqual(iv(10, 30))
    })

    it('handles equal-sized gaps returning first', () => {
      const s = IntervalSet.from([[10, 15]])
      const g = s.gap(0, 25)
      expect(g!.start).toBe(0)
      expect(g!.end).toBe(10)
    })

    it('returns undefined when range is fully covered', () => {
      const s = IntervalSet.from([[0, 100]])
      expect(s.gap(10, 20)).toBeUndefined()
    })

    it('handles multiple small gaps', () => {
      const s = IntervalSet.from([[0, 2], [5, 7], [12, 14]])
      expect(s.gap(0, 20)).toEqual(iv(14, 20))
    })
  })

  describe('gaps', () => {
    it('returns empty when no gaps', () => {
      const s = IntervalSet.from([[0, 20]])
      expect(s.gaps(0, 20)).toEqual([])
    })

    it('returns full range for empty set', () => {
      const s = new IntervalSet<number>()
      expect(s.gaps(0, 20)).toEqual([iv(0, 20)])
    })

    it('returns gaps between intervals', () => {
      const s = IntervalSet.from([[2, 5], [8, 12]])
      expect(s.gaps(0, 20)).toEqual([iv(0, 2), iv(5, 8), iv(12, 20)])
    })

    it('clamps to range start', () => {
      const s = IntervalSet.from([[10, 20]])
      expect(s.gaps(5, 25)).toEqual([iv(5, 10), iv(20, 25)])
    })

    it('handles range inside interval', () => {
      const s = IntervalSet.from([[0, 20]])
      expect(s.gaps(5, 15)).toEqual([])
    })

    it('handles range before first interval', () => {
      const s = IntervalSet.from([[10, 20]])
      expect(s.gaps(0, 5)).toEqual([iv(0, 5)])
    })

    it('handles range after last interval', () => {
      const s = IntervalSet.from([[0, 10]])
      expect(s.gaps(15, 25)).toEqual([iv(15, 25)])
    })

    it('returns multiple gaps', () => {
      const s = IntervalSet.from([[5, 10], [20, 25]])
      expect(s.gaps(0, 30)).toEqual([iv(0, 5), iv(10, 20), iv(25, 30)])
    })
  })

  describe('static from', () => {
    it('creates set from array', () => {
      const s = IntervalSet.from([[0, 5], [10, 15]])
      expect(s.size).toBe(2)
    })

    it('merges overlapping', () => {
      const s = IntervalSet.from([[0, 10], [5, 15]])
      expect(s.size).toBe(1)
      expect(s.toArray()).toEqual([iv(0, 15)])
    })

    it('handles empty array', () => {
      const s = IntervalSet.from([])
      expect(s.isEmpty()).toBe(true)
    })

    it('handles single interval', () => {
      const s = IntervalSet.from([[0, 10]])
      expect(s.toArray()).toEqual([iv(0, 10)])
    })

    it('handles unsorted input', () => {
      const s = IntervalSet.from([[20, 30], [0, 10]])
      expect(s.toArray()).toEqual([iv(0, 10), iv(20, 30)])
    })

    it('accepts options', () => {
      const s = IntervalSet.from(
        [['b', 'e'], ['a', 'c']],
        { compare: (a: string, b: string) => a.localeCompare(b), distance: (a: string, b: string) => b.charCodeAt(0) - a.charCodeAt(0) },
      )
      expect(s.size).toBe(1)
      expect(s.has('c')).toBe(true)
    })
  })

  describe('custom comparator', () => {
    it('works with reverse comparator', () => {
      const s = new IntervalSet<number>({ compare: (a, b) => b - a })
      s.add(10, 5)
      s.add(3, 0)
      expect(s.size).toBe(2)
    })

    it('works with string endpoints', () => {
      const s = new IntervalSet<string>({
        compare: (a, b) => a.localeCompare(b),
        distance: (a, b) => b.charCodeAt(0) - a.charCodeAt(0),
      })
      s.add('a', 'f')
      s.add('d', 'k')
      expect(s.size).toBe(1)
      expect(s.has('c')).toBe(true)
      expect(s.has('g')).toBe(true)
      expect(s.has('l')).toBe(false)
    })

    it('uses custom distance for length', () => {
      const s = new IntervalSet<string>({
        compare: (a: string, b: string) => a.localeCompare(b),
        distance: (a: string, b: string) => a.charCodeAt(0) - b.charCodeAt(0),
      })
      s.add('a', 'd')
      expect(s.length).toBe(3)
    })

    it('works with date timestamps', () => {
      const s = new IntervalSet<number>()
      s.add(1000, 2000)
      s.add(1500, 3000)
      expect(s.size).toBe(1)
      expect(s.length).toBe(2000)
    })
  })

  describe('edge cases', () => {
    it('handles add-remove-add cycle', () => {
      const s = new IntervalSet<number>()
      s.add(0, 20)
      s.remove(5, 15)
      expect(s.size).toBe(2)
      s.add(3, 17)
      expect(s.size).toBe(1)
      expect(s.toArray()).toEqual([iv(0, 20)])
    })

    it('handles many small intervals merging', () => {
      const s = new IntervalSet<number>()
      for (let i = 0; i < 10; i++) {
        s.add(i * 2, i * 2 + 1)
      }
      expect(s.size).toBe(10)
      s.add(0, 20)
      expect(s.size).toBe(1)
    })

    it('handles set operations chaining', () => {
      const a = IntervalSet.from([[0, 10], [20, 30]])
      const b = IntervalSet.from([[5, 25]])
      const result = a.union(b).difference(a).intersection(b)
      expect(result.toArray()).toEqual([iv(10, 20)])
    })

    it('handles negative ranges', () => {
      const s = IntervalSet.from([[-20, -10], [-5, 5]])
      expect(s.length).toBe(20)
      expect(s.has(-15)).toBe(true)
      expect(s.has(0)).toBe(true)
      expect(s.has(-7)).toBe(false)
    })

    it('handles large numbers', () => {
      const s = IntervalSet.from([[Number.MAX_SAFE_INTEGER - 100, Number.MAX_SAFE_INTEGER]])
      expect(s.length).toBe(100)
      expect(s.has(Number.MAX_SAFE_INTEGER - 50)).toBe(true)
    })

    it('maintains invariants after many operations', () => {
      const rng = (seed: number) => () => {
        seed = (seed * 16807) % 2147483647
        return (seed - 1) / 2147483646
      }
      const rand = rng(42)
      const s = new IntervalSet<number>()
      for (let i = 0; i < 50; i++) {
        const a = Math.floor(rand() * 100)
        const b = Math.floor(rand() * 100)
        const lo = Math.min(a, b)
        const hi = Math.max(a, b)
        if (lo === hi) continue
        if (i % 2 === 0) {
          s.add(lo, hi)
        } else {
          s.remove(lo, hi)
        }
      }
      const intervals = s.toArray()
      for (let i = 1; i < intervals.length; i++) {
        expect(intervals[i]!.start).toBeGreaterThanOrEqual(intervals[i - 1]!.end)
      }
    })

    it('handles remove that creates many small intervals', () => {
      const s = new IntervalSet<number>()
      s.add(0, 100)
      for (let i = 10; i < 90; i += 10) {
        s.remove(i, i + 5)
      }
      expect(s.size).toBeGreaterThanOrEqual(1)
    })
  })

  describe('large sets', () => {
    it('handles 10000 non-overlapping intervals', () => {
      const s = new IntervalSet<number>()
      for (let i = 0; i < 10000; i++) {
        s.add(i * 3, i * 3 + 1)
      }
      expect(s.size).toBe(10000)
      expect(s.length).toBe(10000)
    })

    it('handles merging 10000 intervals into one', () => {
      const s = new IntervalSet<number>()
      for (let i = 0; i < 10000; i++) {
        s.add(i, i + 1)
      }
      expect(s.size).toBe(1)
      expect(s.toArray()).toEqual([iv(0, 10000)])
    })

    it('handles removing from large set', () => {
      const s = new IntervalSet<number>()
      s.add(0, 100000)
      s.remove(50000, 60000)
      expect(s.size).toBe(2)
      expect(s.toArray()).toEqual([iv(0, 50000), iv(60000, 100000)])
    })

    it('handles has on large set', () => {
      const s = new IntervalSet<number>()
      for (let i = 0; i < 10000; i++) {
        s.add(i * 3, i * 3 + 1)
      }
      expect(s.has(0)).toBe(true)
      expect(s.has(1)).toBe(false)
      expect(s.has(29997)).toBe(true)
      expect(s.has(29998)).toBe(false)
    })

    it('handles union of large sets', () => {
      const a = new IntervalSet<number>()
      for (let i = 0; i < 5000; i++) {
        a.add(i * 4, i * 4 + 1)
      }
      const b = new IntervalSet<number>()
      for (let i = 0; i < 5000; i++) {
        b.add(i * 4 + 2, i * 4 + 3)
      }
      const result = a.union(b)
      expect(result.size).toBe(10000)
    })

    it('handles intersection of large sets', () => {
      const a = new IntervalSet<number>()
      for (let i = 0; i < 10000; i++) {
        a.add(i, i + 1)
      }
      const b = IntervalSet.from([[5000, 8000]])
      const result = a.intersection(b)
      expect(result.toArray()).toEqual([iv(5000, 8000)])
    })
  })
})
