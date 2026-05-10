import { describe, it, expect, beforeEach } from 'vitest'
import { IntervalSet } from '../../src/core/interval-set/interval-set.js'

describe('IntervalSet', () => {
  let set: IntervalSet

  beforeEach(() => {
    set = new IntervalSet()
  })

  describe('constructor', () => {
    it('should create an empty interval set', () => {
      expect(set.isEmpty).toBe(true)
      expect(set.size).toBe(0)
      expect(set.totalCovered).toBe(0)
    })
  })

  describe('add', () => {
    it('should add a single interval', () => {
      set.add(0, 10)
      expect(set.size).toBe(1)
      expect(set.isEmpty).toBe(false)
    })

    it('should add two non-overlapping intervals', () => {
      set.add(0, 5)
      set.add(10, 15)
      expect(set.size).toBe(2)
    })

    it('should merge overlapping intervals', () => {
      set.add(0, 10)
      set.add(5, 15)
      expect(set.size).toBe(1)
      expect(set.toArray()).toEqual([[0, 15]])
    })

    it('should merge adjacent intervals', () => {
      set.add(0, 5)
      set.add(5, 10)
      expect(set.size).toBe(1)
      expect(set.toArray()).toEqual([[0, 10]])
    })

    it('should merge intervals that fully contain another', () => {
      set.add(0, 20)
      set.add(5, 10)
      expect(set.size).toBe(1)
      expect(set.toArray()).toEqual([[0, 20]])
    })

    it('should merge when new interval fully contains existing', () => {
      set.add(5, 10)
      set.add(0, 20)
      expect(set.size).toBe(1)
      expect(set.toArray()).toEqual([[0, 20]])
    })

    it('should merge multiple intervals in one add', () => {
      set.add(0, 5)
      set.add(10, 15)
      set.add(20, 25)
      set.add(3, 22)
      expect(set.size).toBe(1)
      expect(set.toArray()).toEqual([[0, 25]])
    })

    it('should add interval before all existing', () => {
      set.add(10, 20)
      set.add(0, 5)
      expect(set.size).toBe(2)
      expect(set.toArray()).toEqual([[0, 5], [10, 20]])
    })

    it('should add interval after all existing', () => {
      set.add(0, 5)
      set.add(10, 20)
      expect(set.toArray()).toEqual([[0, 5], [10, 20]])
    })

    it('should throw for invalid interval start > end', () => {
      expect(() => set.add(10, 5)).toThrow('Invalid interval: start (10) > end (5)')
    })

    it('should allow zero-length intervals', () => {
      set.add(5, 5)
      expect(set.size).toBe(1)
    })

    it('should allow negative intervals', () => {
      set.add(-10, -5)
      expect(set.size).toBe(1)
      expect(set.toArray()).toEqual([[-10, -5]])
    })

    it('should return void', () => {
      const result = set.add(0, 10)
      expect(result).toBeUndefined()
    })

    it('should handle fractional numbers', () => {
      set.add(1.5, 3.7)
      expect(set.size).toBe(1)
      expect(set.toArray()).toEqual([[1.5, 3.7]])
    })

    it('should merge bridging interval between two', () => {
      set.add(0, 5)
      set.add(10, 15)
      set.add(5, 10)
      expect(set.size).toBe(1)
      expect(set.toArray()).toEqual([[0, 15]])
    })

    it('should handle add that overlaps left edge', () => {
      set.add(5, 15)
      set.add(0, 8)
      expect(set.size).toBe(1)
      expect(set.toArray()).toEqual([[0, 15]])
    })

    it('should handle add that overlaps right edge', () => {
      set.add(5, 15)
      set.add(12, 20)
      expect(set.size).toBe(1)
      expect(set.toArray()).toEqual([[5, 20]])
    })
  })

  describe('remove', () => {
    it('should remove nothing from empty set', () => {
      set.remove(0, 10)
      expect(set.isEmpty).toBe(true)
    })

    it('should remove entire interval', () => {
      set.add(0, 10)
      set.remove(0, 10)
      expect(set.isEmpty).toBe(true)
    })

    it('should remove middle of interval creating two', () => {
      set.add(0, 20)
      set.remove(5, 15)
      expect(set.size).toBe(2)
      expect(set.toArray()).toEqual([[0, 5], [15, 20]])
    })

    it('should remove left portion of interval', () => {
      set.add(5, 20)
      set.remove(0, 10)
      expect(set.size).toBe(1)
      expect(set.toArray()).toEqual([[10, 20]])
    })

    it('should remove right portion of interval', () => {
      set.add(5, 20)
      set.remove(15, 25)
      expect(set.size).toBe(1)
      expect(set.toArray()).toEqual([[5, 15]])
    })

    it('should remove across multiple intervals', () => {
      set.add(0, 5)
      set.add(10, 15)
      set.add(20, 25)
      set.remove(3, 22)
      expect(set.toArray()).toEqual([[0, 3], [22, 25]])
    })

    it('should remove interval that does not overlap', () => {
      set.add(10, 20)
      set.remove(0, 5)
      expect(set.size).toBe(1)
      expect(set.toArray()).toEqual([[10, 20]])
    })

    it('should throw for invalid interval start > end', () => {
      expect(() => set.remove(10, 5)).toThrow('Invalid interval: start (10) > end (5)')
    })

    it('should return void', () => {
      set.add(0, 10)
      const result = set.remove(0, 10)
      expect(result).toBeUndefined()
    })

    it('should handle zero-length remove as no-op', () => {
      set.add(0, 10)
      set.remove(5, 5)
      expect(set.size).toBe(1)
      expect(set.toArray()).toEqual([[0, 10]])
    })

    it('should handle remove with negative numbers', () => {
      set.add(-20, 20)
      set.remove(-10, 10)
      expect(set.size).toBe(2)
      expect(set.toArray()).toEqual([[-20, -10], [10, 20]])
    })

    it('should split interval at boundary', () => {
      set.add(0, 30)
      set.remove(10, 20)
      expect(set.toArray()).toEqual([[0, 10], [20, 30]])
    })
  })

  describe('has', () => {
    beforeEach(() => {
      set.add(5, 15)
      set.add(25, 35)
    })

    it('should return true for point inside first interval', () => {
      expect(set.has(10)).toBe(true)
    })

    it('should return true for point inside second interval', () => {
      expect(set.has(30)).toBe(true)
    })

    it('should return true for point at start boundary', () => {
      expect(set.has(5)).toBe(true)
    })

    it('should return false for point at end boundary (exclusive)', () => {
      expect(set.has(15)).toBe(false)
    })

    it('should return false for point outside all intervals', () => {
      expect(set.has(20)).toBe(false)
    })

    it('should return false for point before all intervals', () => {
      expect(set.has(0)).toBe(false)
    })

    it('should return false for point after all intervals', () => {
      expect(set.has(100)).toBe(false)
    })

    it('should return false for empty set', () => {
      const empty = new IntervalSet()
      expect(empty.has(5)).toBe(false)
    })
  })

  describe('hasInterval', () => {
    beforeEach(() => {
      set.add(0, 20)
      set.add(30, 50)
    })

    it('should return true for interval fully inside', () => {
      expect(set.hasInterval(5, 15)).toBe(true)
    })

    it('should return true for exact match', () => {
      expect(set.hasInterval(0, 20)).toBe(true)
    })

    it('should return false for interval spanning gap', () => {
      expect(set.hasInterval(15, 35)).toBe(false)
    })

    it('should return false for interval outside', () => {
      expect(set.hasInterval(25, 28)).toBe(false)
    })

    it('should return false for partial overlap', () => {
      expect(set.hasInterval(-5, 10)).toBe(false)
    })

    it('should throw for invalid interval', () => {
      expect(() => set.hasInterval(10, 5)).toThrow('Invalid interval: start (10) > end (5)')
    })

    it('should return false for empty set', () => {
      const empty = new IntervalSet()
      expect(empty.hasInterval(0, 10)).toBe(false)
    })

    it('should return true for zero-length interval inside', () => {
      expect(set.hasInterval(10, 10)).toBe(true)
    })

    it('should return false for zero-length interval outside', () => {
      expect(set.hasInterval(25, 25)).toBe(false)
    })
  })

  describe('overlaps', () => {
    beforeEach(() => {
      set.add(5, 15)
      set.add(25, 35)
    })

    it('should return true for overlapping interval', () => {
      expect(set.overlaps(10, 20)).toBe(true)
    })

    it('should return true for interval fully inside', () => {
      expect(set.overlaps(7, 13)).toBe(true)
    })

    it('should return false for adjacent at start (non-overlapping)', () => {
      expect(set.overlaps(0, 5)).toBe(false)
    })

    it('should return false for adjacent at end (non-overlapping)', () => {
      expect(set.overlaps(15, 20)).toBe(false)
    })

    it('should return false for non-overlapping interval', () => {
      expect(set.overlaps(16, 24)).toBe(false)
    })

    it('should return false for interval before all', () => {
      expect(set.overlaps(0, 4)).toBe(false)
    })

    it('should return false for interval after all', () => {
      expect(set.overlaps(36, 50)).toBe(false)
    })

    it('should throw for invalid interval', () => {
      expect(() => set.overlaps(10, 5)).toThrow('Invalid interval: start (10) > end (5)')
    })

    it('should return false for empty set', () => {
      const empty = new IntervalSet()
      expect(empty.overlaps(0, 10)).toBe(false)
    })

    it('should return true for interval spanning multiple', () => {
      expect(set.overlaps(0, 50)).toBe(true)
    })

    it('should return true for interval touching left boundary', () => {
      expect(set.overlaps(4, 6)).toBe(true)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new set', () => {
      expect(set.isEmpty).toBe(true)
    })

    it('should return false after add', () => {
      set.add(0, 10)
      expect(set.isEmpty).toBe(false)
    })

    it('should return true after removing all', () => {
      set.add(0, 10)
      set.remove(0, 10)
      expect(set.isEmpty).toBe(true)
    })

    it('should return true after clear', () => {
      set.add(0, 10)
      set.clear()
      expect(set.isEmpty).toBe(true)
    })
  })

  describe('size', () => {
    it('should return 0 for empty set', () => {
      expect(set.size).toBe(0)
    })

    it('should return 1 for single interval', () => {
      set.add(0, 10)
      expect(set.size).toBe(1)
    })

    it('should reflect merges', () => {
      set.add(0, 5)
      set.add(3, 10)
      expect(set.size).toBe(1)
    })

    it('should reflect splits from remove', () => {
      set.add(0, 20)
      set.remove(10, 15)
      expect(set.size).toBe(2)
    })

    it('should track multiple disjoint intervals', () => {
      set.add(0, 5)
      set.add(10, 15)
      set.add(20, 25)
      expect(set.size).toBe(3)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty set', () => {
      expect(set.toArray()).toEqual([])
    })

    it('should return single interval', () => {
      set.add(0, 10)
      expect(set.toArray()).toEqual([[0, 10]])
    })

    it('should return sorted non-overlapping intervals', () => {
      set.add(10, 20)
      set.add(0, 5)
      const result = set.toArray()
      expect(result).toEqual([[0, 5], [10, 20]])
    })

    it('should return copy not internal reference', () => {
      set.add(0, 10)
      const arr = set.toArray()
      arr.push([20, 30])
      expect(set.size).toBe(1)
    })
  })

  describe('forEach', () => {
    it('should not call callback for empty set', () => {
      const items: [number, number][] = []
      set.forEach((s, e) => items.push([s, e]))
      expect(items).toEqual([])
    })

    it('should iterate all intervals in order', () => {
      set.add(10, 20)
      set.add(0, 5)
      const items: [number, number][] = []
      set.forEach((s, e) => items.push([s, e]))
      expect(items).toEqual([[0, 5], [10, 20]])
    })

    it('should provide correct start and end', () => {
      set.add(5, 15)
      set.forEach((s, e) => {
        expect(s).toBe(5)
        expect(e).toBe(15)
      })
    })

    it('should return void', () => {
      set.add(0, 10)
      const result = set.forEach(() => {})
      expect(result).toBeUndefined()
    })
  })

  describe('clear', () => {
    it('should clear all intervals', () => {
      set.add(0, 10)
      set.add(20, 30)
      set.clear()
      expect(set.isEmpty).toBe(true)
      expect(set.size).toBe(0)
      expect(set.totalCovered).toBe(0)
    })

    it('should be safe to call on empty set', () => {
      set.clear()
      expect(set.isEmpty).toBe(true)
    })

    it('should return void', () => {
      expect(set.clear()).toBeUndefined()
    })
  })

  describe('clone', () => {
    it('should return equal but independent set', () => {
      set.add(0, 10)
      set.add(20, 30)
      const cloned = set.clone()
      expect(cloned.toArray()).toEqual(set.toArray())
      cloned.add(5, 25)
      expect(set.size).toBe(2)
    })

    it('should clone empty set', () => {
      const cloned = set.clone()
      expect(cloned.isEmpty).toBe(true)
    })

    it('should preserve all intervals', () => {
      set.add(0, 5)
      set.add(10, 15)
      set.add(20, 25)
      const cloned = set.clone()
      expect(cloned.toArray()).toEqual([[0, 5], [10, 15], [20, 25]])
    })
  })

  describe('static from', () => {
    it('should create set from array of intervals', () => {
      const result = IntervalSet.from([[0, 5], [10, 15]])
      expect(result.size).toBe(2)
    })

    it('should merge overlapping intervals', () => {
      const result = IntervalSet.from([[0, 10], [5, 15]])
      expect(result.size).toBe(1)
      expect(result.toArray()).toEqual([[0, 15]])
    })

    it('should handle empty array', () => {
      const result = IntervalSet.from([])
      expect(result.isEmpty).toBe(true)
    })

    it('should handle single interval', () => {
      const result = IntervalSet.from([[0, 10]])
      expect(result.toArray()).toEqual([[0, 10]])
    })

    it('should handle unsorted input', () => {
      const result = IntervalSet.from([[20, 30], [0, 10]])
      expect(result.toArray()).toEqual([[0, 10], [20, 30]])
    })
  })

  describe('union', () => {
    it('should return empty union of two empty sets', () => {
      const other = new IntervalSet()
      expect(set.union(other).isEmpty).toBe(true)
    })

    it('should return copy when other is empty', () => {
      set.add(0, 10)
      const other = new IntervalSet()
      const result = set.union(other)
      expect(result.toArray()).toEqual([[0, 10]])
    })

    it('should merge overlapping intervals from both', () => {
      set.add(0, 10)
      const other = new IntervalSet()
      other.add(5, 20)
      const result = set.union(other)
      expect(result.toArray()).toEqual([[0, 20]])
    })

    it('should combine disjoint intervals', () => {
      set.add(0, 5)
      const other = new IntervalSet()
      other.add(10, 15)
      const result = set.union(other)
      expect(result.toArray()).toEqual([[0, 5], [10, 15]])
    })

    it('should not modify original sets', () => {
      set.add(0, 5)
      const other = new IntervalSet()
      other.add(10, 15)
      set.union(other)
      expect(set.toArray()).toEqual([[0, 5]])
      expect(other.toArray()).toEqual([[10, 15]])
    })

    it('should handle complex merge', () => {
      set.add(0, 5)
      set.add(15, 20)
      const other = new IntervalSet()
      other.add(3, 18)
      const result = set.union(other)
      expect(result.toArray()).toEqual([[0, 20]])
    })

    it('should handle union of identical sets', () => {
      set.add(0, 10)
      const other = IntervalSet.from([[0, 10]])
      expect(set.union(other).toArray()).toEqual([[0, 10]])
    })
  })

  describe('intersection', () => {
    it('should return empty for non-overlapping sets', () => {
      set.add(0, 10)
      const other = new IntervalSet()
      other.add(20, 30)
      expect(set.intersection(other).isEmpty).toBe(true)
    })

    it('should return intersection of overlapping intervals', () => {
      set.add(0, 15)
      const other = new IntervalSet()
      other.add(10, 25)
      const result = set.intersection(other)
      expect(result.toArray()).toEqual([[10, 15]])
    })

    it('should return empty when one set is empty', () => {
      set.add(0, 10)
      const other = new IntervalSet()
      expect(set.intersection(other).isEmpty).toBe(true)
      expect(other.intersection(set).isEmpty).toBe(true)
    })

    it('should handle multiple interval intersections', () => {
      set.add(0, 10)
      set.add(20, 30)
      const other = new IntervalSet()
      other.add(5, 25)
      const result = set.intersection(other)
      expect(result.toArray()).toEqual([[5, 10], [20, 25]])
    })

    it('should not modify original sets', () => {
      set.add(0, 10)
      const other = new IntervalSet()
      other.add(5, 15)
      set.intersection(other)
      expect(set.toArray()).toEqual([[0, 10]])
      expect(other.toArray()).toEqual([[5, 15]])
    })

    it('should handle identical sets', () => {
      set.add(0, 10)
      set.add(20, 30)
      const other = IntervalSet.from([[0, 10], [20, 30]])
      expect(set.intersection(other).toArray()).toEqual([[0, 10], [20, 30]])
    })

    it('should handle partial overlap with multiple intervals', () => {
      set.add(0, 5)
      set.add(10, 15)
      set.add(20, 25)
      const other = new IntervalSet()
      other.add(3, 22)
      const result = set.intersection(other)
      expect(result.toArray()).toEqual([[3, 5], [10, 15], [20, 22]])
    })
  })

  describe('difference', () => {
    it('should return copy when other is empty', () => {
      set.add(0, 10)
      const other = new IntervalSet()
      expect(set.difference(other).toArray()).toEqual([[0, 10]])
    })

    it('should return empty when subtracting self', () => {
      set.add(0, 10)
      expect(set.difference(set).isEmpty).toBe(true)
    })

    it('should remove overlapping portion', () => {
      set.add(0, 20)
      const other = new IntervalSet()
      other.add(5, 15)
      expect(set.difference(other).toArray()).toEqual([[0, 5], [15, 20]])
    })

    it('should remove entire interval', () => {
      set.add(0, 10)
      set.add(20, 30)
      const other = new IntervalSet()
      other.add(0, 10)
      expect(set.difference(other).toArray()).toEqual([[20, 30]])
    })

    it('should not modify original sets', () => {
      set.add(0, 10)
      const other = new IntervalSet()
      other.add(5, 15)
      set.difference(other)
      expect(set.toArray()).toEqual([[0, 10]])
      expect(other.toArray()).toEqual([[5, 15]])
    })

    it('should handle multiple removals', () => {
      set.add(0, 30)
      const other = new IntervalSet()
      other.add(5, 10)
      other.add(20, 25)
      const result = set.difference(other)
      expect(result.toArray()).toEqual([[0, 5], [10, 20], [25, 30]])
    })

    it('should handle difference of disjoint sets', () => {
      set.add(0, 10)
      const other = IntervalSet.from([[20, 30]])
      expect(set.difference(other).toArray()).toEqual([[0, 10]])
    })
  })

  describe('symmetricDifference', () => {
    it('should return empty for identical sets', () => {
      set.add(0, 10)
      expect(set.symmetricDifference(set).isEmpty).toBe(true)
    })

    it('should return union for disjoint sets', () => {
      set.add(0, 10)
      const other = new IntervalSet()
      other.add(20, 30)
      const result = set.symmetricDifference(other)
      expect(result.toArray()).toEqual([[0, 10], [20, 30]])
    })

    it('should remove overlap', () => {
      set.add(0, 15)
      const other = new IntervalSet()
      other.add(10, 25)
      const result = set.symmetricDifference(other)
      expect(result.toArray()).toEqual([[0, 10], [15, 25]])
    })

    it('should not modify original sets', () => {
      set.add(0, 10)
      const other = new IntervalSet()
      other.add(5, 15)
      set.symmetricDifference(other)
      expect(set.toArray()).toEqual([[0, 10]])
      expect(other.toArray()).toEqual([[5, 15]])
    })

    it('should handle empty both', () => {
      const other = new IntervalSet()
      expect(set.symmetricDifference(other).isEmpty).toBe(true)
    })

    it('should return copy when other is empty', () => {
      set.add(0, 10)
      const other = new IntervalSet()
      expect(set.symmetricDifference(other).toArray()).toEqual([[0, 10]])
    })

    it('should return copy when self is empty', () => {
      const other = new IntervalSet()
      other.add(0, 10)
      expect(set.symmetricDifference(other).toArray()).toEqual([[0, 10]])
    })

    it('should handle one fully containing the other', () => {
      set.add(0, 20)
      const other = new IntervalSet()
      other.add(5, 15)
      const result = set.symmetricDifference(other)
      expect(result.toArray()).toEqual([[0, 5], [15, 20]])
    })

    it('should handle multiple intervals', () => {
      set.add(0, 10)
      set.add(20, 30)
      const other = new IntervalSet()
      other.add(5, 25)
      const result = set.symmetricDifference(other)
      expect(result.toArray()).toEqual([[0, 5], [10, 20], [25, 30]])
    })
  })

  describe('min', () => {
    it('should return undefined for empty set', () => {
      expect(set.min).toBeUndefined()
    })

    it('should return start of first interval', () => {
      set.add(5, 10)
      expect(set.min).toBe(5)
    })

    it('should return smallest start', () => {
      set.add(10, 20)
      set.add(0, 5)
      expect(set.min).toBe(0)
    })

    it('should handle negative numbers', () => {
      set.add(-10, 10)
      expect(set.min).toBe(-10)
    })
  })

  describe('max', () => {
    it('should return undefined for empty set', () => {
      expect(set.max).toBeUndefined()
    })

    it('should return end of last interval', () => {
      set.add(5, 10)
      expect(set.max).toBe(10)
    })

    it('should return largest end', () => {
      set.add(0, 5)
      set.add(10, 20)
      expect(set.max).toBe(20)
    })

    it('should handle large numbers', () => {
      set.add(0, 1000000)
      expect(set.max).toBe(1000000)
    })
  })

  describe('totalCovered', () => {
    it('should return 0 for empty set', () => {
      expect(set.totalCovered).toBe(0)
    })

    it('should return length of single interval', () => {
      set.add(0, 10)
      expect(set.totalCovered).toBe(10)
    })

    it('should return sum of multiple disjoint intervals', () => {
      set.add(0, 5)
      set.add(10, 20)
      expect(set.totalCovered).toBe(15)
    })

    it('should handle merged intervals correctly', () => {
      set.add(0, 10)
      set.add(5, 15)
      expect(set.totalCovered).toBe(15)
    })

    it('should return 0 for zero-length interval', () => {
      set.add(5, 5)
      expect(set.totalCovered).toBe(0)
    })

    it('should update after remove', () => {
      set.add(0, 20)
      set.remove(5, 10)
      expect(set.totalCovered).toBe(15)
    })

    it('should handle fractional precision', () => {
      set.add(0.1, 0.3)
      set.add(0.2, 0.5)
      expect(set.totalCovered).toBeCloseTo(0.4)
    })
  })

  describe('stats', () => {
    it('should return empty stats for empty set', () => {
      const s = set.stats
      expect(s.intervalCount).toBe(0)
      expect(s.totalCovered).toBe(0)
      expect(s.min).toBeUndefined()
      expect(s.max).toBeUndefined()
      expect(s.largestInterval).toBeUndefined()
      expect(s.smallestInterval).toBeUndefined()
      expect(s.averageIntervalSize).toBe(0)
    })

    it('should return stats for single interval', () => {
      set.add(5, 15)
      const s = set.stats
      expect(s.intervalCount).toBe(1)
      expect(s.totalCovered).toBe(10)
      expect(s.min).toBe(5)
      expect(s.max).toBe(15)
      expect(s.largestInterval).toEqual([5, 15])
      expect(s.smallestInterval).toEqual([5, 15])
      expect(s.averageIntervalSize).toBe(10)
    })

    it('should return stats for multiple intervals', () => {
      set.add(0, 10)
      set.add(20, 30)
      set.add(40, 60)
      const s = set.stats
      expect(s.intervalCount).toBe(3)
      expect(s.totalCovered).toBe(40)
      expect(s.min).toBe(0)
      expect(s.max).toBe(60)
      expect(s.largestInterval).toEqual([40, 60])
      expect(s.smallestInterval).toEqual([0, 10])
      expect(s.averageIntervalSize).toBeCloseTo(40 / 3)
    })

    it('should handle zero-length intervals in stats', () => {
      set.add(5, 5)
      set.add(10, 20)
      const s = set.stats
      expect(s.smallestInterval).toEqual([5, 5])
      expect(s.largestInterval).toEqual([10, 20])
    })
  })

  describe('edge cases', () => {
    it('should handle add-remove-add cycle', () => {
      set.add(0, 20)
      set.remove(5, 15)
      expect(set.size).toBe(2)
      set.add(3, 17)
      expect(set.size).toBe(1)
      expect(set.toArray()).toEqual([[0, 20]])
    })

    it('should handle many small intervals merging into one', () => {
      for (let i = 0; i < 10; i++) {
        set.add(i * 2, i * 2 + 1)
      }
      expect(set.size).toBe(10)
      set.add(0, 20)
      expect(set.size).toBe(1)
    })

    it('should handle remove that creates many small intervals', () => {
      set.add(0, 100)
      for (let i = 10; i < 90; i += 10) {
        set.remove(i, i + 5)
      }
      expect(set.size).toBeGreaterThanOrEqual(1)
    })

    it('should handle set operations chaining', () => {
      const a = IntervalSet.from([[0, 10], [20, 30]])
      const b = IntervalSet.from([[5, 25]])
      const result = a.union(b).difference(a).intersection(b)
      expect(result.toArray()).toEqual([[10, 20]])
    })

    it('should handle negative ranges', () => {
      set.add(-20, -10)
      set.add(-5, 5)
      expect(set.totalCovered).toBe(20)
      expect(set.has(-15)).toBe(true)
      expect(set.has(0)).toBe(true)
      expect(set.has(-7)).toBe(false)
    })

    it('should handle large numbers', () => {
      set.add(Number.MAX_SAFE_INTEGER - 100, Number.MAX_SAFE_INTEGER)
      expect(set.totalCovered).toBe(100)
      expect(set.has(Number.MAX_SAFE_INTEGER - 50)).toBe(true)
    })

    it('should handle fractional precision', () => {
      set.add(0.1, 0.3)
      set.add(0.2, 0.5)
      expect(set.size).toBe(1)
      expect(set.totalCovered).toBeCloseTo(0.4)
    })

    it('should handle add same interval twice', () => {
      set.add(0, 10)
      set.add(0, 10)
      expect(set.size).toBe(1)
      expect(set.toArray()).toEqual([[0, 10]])
    })

    it('should handle has on merged intervals', () => {
      set.add(0, 5)
      set.add(10, 15)
      set.add(5, 10)
      expect(set.has(0)).toBe(true)
      expect(set.has(7)).toBe(true)
      expect(set.has(14)).toBe(true)
      expect(set.has(15)).toBe(false)
    })

    it('should handle fromIntervals with all overlapping', () => {
      const result = IntervalSet.from([[0, 5], [3, 8], [6, 12]])
      expect(result.size).toBe(1)
      expect(result.toArray()).toEqual([[0, 12]])
    })

    it('should handle remove on boundary exactly', () => {
      set.add(0, 10)
      set.add(20, 30)
      set.remove(10, 20)
      expect(set.toArray()).toEqual([[0, 10], [20, 30]])
    })

    it('should handle add with exact adjacency on both sides', () => {
      set.add(0, 5)
      set.add(15, 20)
      set.add(5, 15)
      expect(set.size).toBe(1)
      expect(set.toArray()).toEqual([[0, 20]])
    })

    it('should handle totalCovered after remove', () => {
      set.add(0, 20)
      set.remove(5, 10)
      expect(set.totalCovered).toBe(15)
    })

    it('should maintain invariants after many operations', () => {
      const rng = (seed: number) => () => {
        seed = (seed * 16807) % 2147483647
        return (seed - 1) / 2147483646
      }
      const rand = rng(42)
      for (let i = 0; i < 50; i++) {
        const a = Math.floor(rand() * 100)
        const b = Math.floor(rand() * 100)
        const lo = Math.min(a, b)
        const hi = Math.max(a, b)
        if (i % 2 === 0) {
          set.add(lo, hi)
        } else {
          set.remove(lo, hi)
        }
      }
      const intervals = set.toArray()
      for (let i = 1; i < intervals.length; i++) {
        expect(intervals[i]![0]).toBeGreaterThanOrEqual(intervals[i - 1]![1])
      }
    })

    it('should handle zero-length interval at start of range', () => {
      set.add(5, 5)
      set.add(5, 10)
      expect(set.size).toBe(1)
      expect(set.toArray()).toEqual([[5, 10]])
    })

    it('should handle zero-length interval at end of range', () => {
      set.add(5, 10)
      set.add(10, 10)
      expect(set.size).toBe(1)
      expect(set.toArray()).toEqual([[5, 10]])
    })
  })

  describe('large sets', () => {
    it('should handle 10000 non-overlapping intervals', () => {
      for (let i = 0; i < 10000; i++) {
        set.add(i * 3, i * 3 + 1)
      }
      expect(set.size).toBe(10000)
      expect(set.totalCovered).toBe(10000)
    })

    it('should handle merging 10000 intervals into one', () => {
      for (let i = 0; i < 10000; i++) {
        set.add(i, i + 1)
      }
      expect(set.size).toBe(1)
      expect(set.toArray()).toEqual([[0, 10000]])
    })

    it('should handle removing from large set', () => {
      set.add(0, 100000)
      set.remove(50000, 60000)
      expect(set.size).toBe(2)
      expect(set.toArray()).toEqual([[0, 50000], [60000, 100000]])
    })

    it('should handle has on large set efficiently', () => {
      for (let i = 0; i < 10000; i++) {
        set.add(i * 3, i * 3 + 1)
      }
      expect(set.has(0)).toBe(true)
      expect(set.has(1)).toBe(false)
      expect(set.has(29997)).toBe(true)
      expect(set.has(29998)).toBe(false)
    })

    it('should handle union of large sets', () => {
      for (let i = 0; i < 5000; i++) {
        set.add(i * 4, i * 4 + 1)
      }
      const other = new IntervalSet()
      for (let i = 0; i < 5000; i++) {
        other.add(i * 4 + 2, i * 4 + 3)
      }
      const result = set.union(other)
      expect(result.size).toBe(10000)
    })

    it('should handle intersection of large sets', () => {
      for (let i = 0; i < 10000; i++) {
        set.add(i, i + 1)
      }
      const other = IntervalSet.from([[5000, 8000]])
      const result = set.intersection(other)
      expect(result.toArray()).toEqual([[5000, 8000]])
    })

    it('should handle symmetricDifference of large sets', () => {
      for (let i = 0; i < 10000; i++) {
        set.add(i, i + 1)
      }
      const other = IntervalSet.from([[0, 10000]])
      const result = set.symmetricDifference(other)
      expect(result.isEmpty).toBe(true)
    })
  })
})
