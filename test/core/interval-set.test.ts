import { describe, it, expect, beforeEach } from 'vitest'
import { IntervalSet } from '../../src/core/interval-set/interval-set.js'

describe('IntervalSet', () => {
  let set: IntervalSet

  beforeEach(() => {
    set = new IntervalSet()
  })

  describe('constructor', () => {
    it('should create an empty interval set', () => {
      expect(set.isEmpty()).toBe(true)
      expect(set.getCount()).toBe(0)
      expect(set.getSize()).toBe(0)
    })
  })

  describe('add', () => {
    it('should add a single interval', () => {
      set.add(0, 10)
      expect(set.getCount()).toBe(1)
      expect(set.isEmpty()).toBe(false)
    })

    it('should add two non-overlapping intervals', () => {
      set.add(0, 5)
      set.add(10, 15)
      expect(set.getCount()).toBe(2)
    })

    it('should merge overlapping intervals', () => {
      set.add(0, 10)
      set.add(5, 15)
      expect(set.getCount()).toBe(1)
      expect(set.getIntervals()).toEqual([[0, 15]])
    })

    it('should merge adjacent intervals', () => {
      set.add(0, 5)
      set.add(5, 10)
      expect(set.getCount()).toBe(1)
      expect(set.getIntervals()).toEqual([[0, 10]])
    })

    it('should merge intervals that fully contain another', () => {
      set.add(0, 20)
      set.add(5, 10)
      expect(set.getCount()).toBe(1)
      expect(set.getIntervals()).toEqual([[0, 20]])
    })

    it('should merge when new interval fully contains existing', () => {
      set.add(5, 10)
      set.add(0, 20)
      expect(set.getCount()).toBe(1)
      expect(set.getIntervals()).toEqual([[0, 20]])
    })

    it('should merge multiple intervals in one add', () => {
      set.add(0, 5)
      set.add(10, 15)
      set.add(20, 25)
      set.add(3, 22)
      expect(set.getCount()).toBe(1)
      expect(set.getIntervals()).toEqual([[0, 25]])
    })

    it('should add interval before all existing', () => {
      set.add(10, 20)
      set.add(0, 5)
      expect(set.getCount()).toBe(2)
      expect(set.getIntervals()).toEqual([[0, 5], [10, 20]])
    })

    it('should add interval after all existing', () => {
      set.add(0, 5)
      set.add(10, 20)
      expect(set.getIntervals()).toEqual([[0, 5], [10, 20]])
    })

    it('should throw for invalid interval start > end', () => {
      expect(() => set.add(10, 5)).toThrow('Invalid interval: start (10) > end (5)')
    })

    it('should allow zero-length intervals', () => {
      set.add(5, 5)
      expect(set.getCount()).toBe(1)
    })

    it('should allow negative intervals', () => {
      set.add(-10, -5)
      expect(set.getCount()).toBe(1)
      expect(set.getIntervals()).toEqual([[-10, -5]])
    })

    it('should return void', () => {
      const result = set.add(0, 10)
      expect(result).toBeUndefined()
    })

    it('should handle fractional numbers', () => {
      set.add(1.5, 3.7)
      expect(set.getCount()).toBe(1)
      expect(set.getIntervals()).toEqual([[1.5, 3.7]])
    })

    it('should merge bridging interval between two', () => {
      set.add(0, 5)
      set.add(10, 15)
      set.add(5, 10)
      expect(set.getCount()).toBe(1)
      expect(set.getIntervals()).toEqual([[0, 15]])
    })

    it('should handle add that overlaps left edge', () => {
      set.add(5, 15)
      set.add(0, 8)
      expect(set.getCount()).toBe(1)
      expect(set.getIntervals()).toEqual([[0, 15]])
    })

    it('should handle add that overlaps right edge', () => {
      set.add(5, 15)
      set.add(12, 20)
      expect(set.getCount()).toBe(1)
      expect(set.getIntervals()).toEqual([[5, 20]])
    })
  })

  describe('remove', () => {
    it('should remove nothing from empty set', () => {
      set.remove(0, 10)
      expect(set.isEmpty()).toBe(true)
    })

    it('should remove entire interval', () => {
      set.add(0, 10)
      set.remove(0, 10)
      expect(set.isEmpty()).toBe(true)
    })

    it('should remove middle of interval creating two', () => {
      set.add(0, 20)
      set.remove(5, 15)
      expect(set.getCount()).toBe(2)
      expect(set.getIntervals()).toEqual([[0, 5], [15, 20]])
    })

    it('should remove left portion of interval', () => {
      set.add(5, 20)
      set.remove(0, 10)
      expect(set.getCount()).toBe(1)
      expect(set.getIntervals()).toEqual([[10, 20]])
    })

    it('should remove right portion of interval', () => {
      set.add(5, 20)
      set.remove(15, 25)
      expect(set.getCount()).toBe(1)
      expect(set.getIntervals()).toEqual([[5, 15]])
    })

    it('should remove across multiple intervals', () => {
      set.add(0, 5)
      set.add(10, 15)
      set.add(20, 25)
      set.remove(3, 22)
      expect(set.getIntervals()).toEqual([[0, 3], [22, 25]])
    })

    it('should remove interval that does not overlap', () => {
      set.add(10, 20)
      set.remove(0, 5)
      expect(set.getCount()).toBe(1)
      expect(set.getIntervals()).toEqual([[10, 20]])
    })

    it('should throw for invalid interval start > end', () => {
      expect(() => set.remove(10, 5)).toThrow('Invalid interval: start (10) > end (5)')
    })

    it('should return void', () => {
      set.add(0, 10)
      const result = set.remove(0, 10)
      expect(result).toBeUndefined()
    })

    it('should handle zero-length remove', () => {
      set.add(0, 10)
      set.remove(5, 5)
      expect(set.getCount()).toBe(2)
      expect(set.getIntervals()).toEqual([[0, 5], [5, 10]])
    })

    it('should handle remove with negative numbers', () => {
      set.add(-20, 20)
      set.remove(-10, 10)
      expect(set.getCount()).toBe(2)
      expect(set.getIntervals()).toEqual([[-20, -10], [10, 20]])
    })
  })

  describe('contains', () => {
    beforeEach(() => {
      set.add(5, 15)
      set.add(25, 35)
    })

    it('should return true for point inside first interval', () => {
      expect(set.contains(10)).toBe(true)
    })

    it('should return true for point inside second interval', () => {
      expect(set.contains(30)).toBe(true)
    })

    it('should return true for point at start boundary', () => {
      expect(set.contains(5)).toBe(true)
    })

    it('should return true for point at end boundary', () => {
      expect(set.contains(15)).toBe(true)
    })

    it('should return false for point outside all intervals', () => {
      expect(set.contains(20)).toBe(false)
    })

    it('should return false for point before all intervals', () => {
      expect(set.contains(0)).toBe(false)
    })

    it('should return false for point after all intervals', () => {
      expect(set.contains(100)).toBe(false)
    })

    it('should return false for empty set', () => {
      const empty = new IntervalSet()
      expect(empty.contains(5)).toBe(false)
    })
  })

  describe('containsInterval', () => {
    beforeEach(() => {
      set.add(0, 20)
      set.add(30, 50)
    })

    it('should return true for interval fully inside', () => {
      expect(set.containsInterval(5, 15)).toBe(true)
    })

    it('should return true for exact match', () => {
      expect(set.containsInterval(0, 20)).toBe(true)
    })

    it('should return false for interval spanning gap', () => {
      expect(set.containsInterval(15, 35)).toBe(false)
    })

    it('should return false for interval outside', () => {
      expect(set.containsInterval(25, 28)).toBe(false)
    })

    it('should return false for partial overlap', () => {
      expect(set.containsInterval(-5, 10)).toBe(false)
    })

    it('should throw for invalid interval', () => {
      expect(() => set.containsInterval(10, 5)).toThrow('Invalid interval: start (10) > end (5)')
    })

    it('should return false for empty set', () => {
      const empty = new IntervalSet()
      expect(empty.containsInterval(0, 10)).toBe(false)
    })

    it('should return true for zero-length interval at boundary', () => {
      expect(set.containsInterval(0, 0)).toBe(true)
    })

    it('should return true for zero-length interval inside', () => {
      expect(set.containsInterval(10, 10)).toBe(true)
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

    it('should return true for interval touching start', () => {
      expect(set.overlaps(0, 5)).toBe(true)
    })

    it('should return true for interval touching end', () => {
      expect(set.overlaps(15, 20)).toBe(true)
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
  })

  describe('getIntervals', () => {
    it('should return empty array for empty set', () => {
      expect(set.getIntervals()).toEqual([])
    })

    it('should return single interval', () => {
      set.add(0, 10)
      expect(set.getIntervals()).toEqual([[0, 10]])
    })

    it('should return sorted non-overlapping intervals', () => {
      set.add(10, 20)
      set.add(0, 5)
      const result = set.getIntervals()
      expect(result).toEqual([[0, 5], [10, 20]])
      for (let i = 1; i < result.length; i++) {
        expect(result[i][0]).toBeGreaterThanOrEqual(result[i - 1][1])
      }
    })
  })

  describe('getSize', () => {
    it('should return 0 for empty set', () => {
      expect(set.getSize()).toBe(0)
    })

    it('should return length of single interval', () => {
      set.add(0, 10)
      expect(set.getSize()).toBe(10)
    })

    it('should return sum of multiple disjoint intervals', () => {
      set.add(0, 5)
      set.add(10, 20)
      expect(set.getSize()).toBe(15)
    })

    it('should handle merged intervals correctly', () => {
      set.add(0, 10)
      set.add(5, 15)
      expect(set.getSize()).toBe(15)
    })

    it('should return 0 for zero-length interval', () => {
      set.add(5, 5)
      expect(set.getSize()).toBe(0)
    })
  })

  describe('getCount', () => {
    it('should return 0 for empty set', () => {
      expect(set.getCount()).toBe(0)
    })

    it('should return 1 for single interval', () => {
      set.add(0, 10)
      expect(set.getCount()).toBe(1)
    })

    it('should reflect merges', () => {
      set.add(0, 5)
      set.add(3, 10)
      expect(set.getCount()).toBe(1)
    })

    it('should reflect splits from remove', () => {
      set.add(0, 20)
      set.remove(10, 15)
      expect(set.getCount()).toBe(2)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new set', () => {
      expect(set.isEmpty()).toBe(true)
    })

    it('should return false after add', () => {
      set.add(0, 10)
      expect(set.isEmpty()).toBe(false)
    })

    it('should return true after removing all', () => {
      set.add(0, 10)
      set.remove(0, 10)
      expect(set.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      set.add(0, 10)
      set.clear()
      expect(set.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear all intervals', () => {
      set.add(0, 10)
      set.add(20, 30)
      set.clear()
      expect(set.isEmpty()).toBe(true)
      expect(set.getCount()).toBe(0)
      expect(set.getSize()).toBe(0)
    })

    it('should be safe to call on empty set', () => {
      set.clear()
      expect(set.isEmpty()).toBe(true)
    })

    it('should return void', () => {
      expect(set.clear()).toBeUndefined()
    })
  })

  describe('intersect', () => {
    it('should return empty for non-overlapping sets', () => {
      set.add(0, 10)
      const other = new IntervalSet()
      other.add(20, 30)
      expect(set.intersect(other).isEmpty()).toBe(true)
    })

    it('should return intersection of overlapping intervals', () => {
      set.add(0, 15)
      const other = new IntervalSet()
      other.add(10, 25)
      const result = set.intersect(other)
      expect(result.getIntervals()).toEqual([[10, 15]])
    })

    it('should return empty when one set is empty', () => {
      set.add(0, 10)
      const other = new IntervalSet()
      expect(set.intersect(other).isEmpty()).toBe(true)
      expect(other.intersect(set).isEmpty()).toBe(true)
    })

    it('should handle multiple interval intersections', () => {
      set.add(0, 10)
      set.add(20, 30)
      const other = new IntervalSet()
      other.add(5, 25)
      const result = set.intersect(other)
      expect(result.getIntervals()).toEqual([[5, 10], [20, 25]])
    })

    it('should not modify original sets', () => {
      set.add(0, 10)
      const other = new IntervalSet()
      other.add(5, 15)
      set.intersect(other)
      expect(set.getIntervals()).toEqual([[0, 10]])
      expect(other.getIntervals()).toEqual([[5, 15]])
    })

    it('should handle identical sets', () => {
      set.add(0, 10)
      set.add(20, 30)
      const other = IntervalSet.fromIntervals([[0, 10], [20, 30]])
      expect(set.intersect(other).equals(set)).toBe(true)
    })

    it('should handle partial overlap with multiple intervals', () => {
      set.add(0, 5)
      set.add(10, 15)
      set.add(20, 25)
      const other = new IntervalSet()
      other.add(3, 22)
      const result = set.intersect(other)
      expect(result.getIntervals()).toEqual([[3, 5], [10, 15], [20, 22]])
    })
  })

  describe('union', () => {
    it('should return empty union of two empty sets', () => {
      const other = new IntervalSet()
      expect(set.union(other).isEmpty()).toBe(true)
    })

    it('should return copy when other is empty', () => {
      set.add(0, 10)
      const other = new IntervalSet()
      const result = set.union(other)
      expect(result.getIntervals()).toEqual([[0, 10]])
    })

    it('should merge overlapping intervals from both', () => {
      set.add(0, 10)
      const other = new IntervalSet()
      other.add(5, 20)
      const result = set.union(other)
      expect(result.getIntervals()).toEqual([[0, 20]])
    })

    it('should combine disjoint intervals', () => {
      set.add(0, 5)
      const other = new IntervalSet()
      other.add(10, 15)
      const result = set.union(other)
      expect(result.getIntervals()).toEqual([[0, 5], [10, 15]])
    })

    it('should not modify original sets', () => {
      set.add(0, 5)
      const other = new IntervalSet()
      other.add(10, 15)
      set.union(other)
      expect(set.getIntervals()).toEqual([[0, 5]])
      expect(other.getIntervals()).toEqual([[10, 15]])
    })

    it('should handle complex merge', () => {
      set.add(0, 5)
      set.add(15, 20)
      const other = new IntervalSet()
      other.add(3, 18)
      const result = set.union(other)
      expect(result.getIntervals()).toEqual([[0, 20]])
    })
  })

  describe('difference', () => {
    it('should return copy when other is empty', () => {
      set.add(0, 10)
      const other = new IntervalSet()
      expect(set.difference(other).getIntervals()).toEqual([[0, 10]])
    })

    it('should return empty when subtracting self', () => {
      set.add(0, 10)
      expect(set.difference(set).isEmpty()).toBe(true)
    })

    it('should remove overlapping portion', () => {
      set.add(0, 20)
      const other = new IntervalSet()
      other.add(5, 15)
      expect(set.difference(other).getIntervals()).toEqual([[0, 5], [15, 20]])
    })

    it('should remove entire interval', () => {
      set.add(0, 10)
      set.add(20, 30)
      const other = new IntervalSet()
      other.add(0, 10)
      expect(set.difference(other).getIntervals()).toEqual([[20, 30]])
    })

    it('should not modify original sets', () => {
      set.add(0, 10)
      const other = new IntervalSet()
      other.add(5, 15)
      set.difference(other)
      expect(set.getIntervals()).toEqual([[0, 10]])
      expect(other.getIntervals()).toEqual([[5, 15]])
    })

    it('should handle multiple removals', () => {
      set.add(0, 30)
      const other = new IntervalSet()
      other.add(5, 10)
      other.add(20, 25)
      const result = set.difference(other)
      expect(result.getIntervals()).toEqual([[0, 5], [10, 20], [25, 30]])
    })
  })

  describe('complement', () => {
    it('should return full range for empty set', () => {
      const result = set.complement(0, 100)
      expect(result.getIntervals()).toEqual([[0, 100]])
    })

    it('should return gaps between intervals', () => {
      set.add(10, 20)
      set.add(30, 40)
      const result = set.complement(0, 50)
      expect(result.getIntervals()).toEqual([[0, 10], [20, 30], [40, 50]])
    })

    it('should return nothing when set covers full range', () => {
      set.add(0, 100)
      const result = set.complement(0, 100)
      expect(result.isEmpty()).toBe(true)
    })

    it('should handle interval extending beyond min', () => {
      set.add(-10, 10)
      const result = set.complement(0, 50)
      expect(result.getIntervals()).toEqual([[10, 50]])
    })

    it('should handle interval extending beyond max', () => {
      set.add(90, 200)
      const result = set.complement(0, 100)
      expect(result.getIntervals()).toEqual([[0, 90]])
    })

    it('should handle single interval at start', () => {
      set.add(0, 10)
      const result = set.complement(0, 50)
      expect(result.getIntervals()).toEqual([[10, 50]])
    })

    it('should handle single interval at end', () => {
      set.add(40, 50)
      const result = set.complement(0, 50)
      expect(result.getIntervals()).toEqual([[0, 40]])
    })
  })

  describe('clone', () => {
    it('should return equal but independent set', () => {
      set.add(0, 10)
      set.add(20, 30)
      const cloned = set.clone()
      expect(cloned.equals(set)).toBe(true)
      cloned.add(5, 25)
      expect(set.getCount()).toBe(2)
    })

    it('should clone empty set', () => {
      const cloned = set.clone()
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should preserve all intervals', () => {
      set.add(0, 5)
      set.add(10, 15)
      set.add(20, 25)
      const cloned = set.clone()
      expect(cloned.getIntervals()).toEqual([[0, 5], [10, 15], [20, 25]])
    })
  })

  describe('equals', () => {
    it('should return true for two empty sets', () => {
      const other = new IntervalSet()
      expect(set.equals(other)).toBe(true)
    })

    it('should return true for identical sets', () => {
      set.add(0, 10)
      const other = new IntervalSet()
      other.add(0, 10)
      expect(set.equals(other)).toBe(true)
    })

    it('should return false for different counts', () => {
      set.add(0, 10)
      const other = new IntervalSet()
      expect(set.equals(other)).toBe(false)
    })

    it('should return false for different intervals', () => {
      set.add(0, 10)
      const other = new IntervalSet()
      other.add(0, 20)
      expect(set.equals(other)).toBe(false)
    })

    it('should return true for structurally identical sets', () => {
      set.add(0, 5)
      set.add(10, 15)
      const other = IntervalSet.fromIntervals([[0, 5], [10, 15]])
      expect(set.equals(other)).toBe(true)
    })

    it('should return false when second interval differs', () => {
      set.add(0, 5)
      set.add(10, 15)
      const other = IntervalSet.fromIntervals([[0, 5], [10, 20]])
      expect(set.equals(other)).toBe(false)
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

  describe('static fromIntervals', () => {
    it('should create set from array of intervals', () => {
      const result = IntervalSet.fromIntervals([[0, 5], [10, 15]])
      expect(result.getCount()).toBe(2)
    })

    it('should merge overlapping intervals', () => {
      const result = IntervalSet.fromIntervals([[0, 10], [5, 15]])
      expect(result.getCount()).toBe(1)
      expect(result.getIntervals()).toEqual([[0, 15]])
    })

    it('should handle empty array', () => {
      const result = IntervalSet.fromIntervals([])
      expect(result.isEmpty()).toBe(true)
    })

    it('should handle single interval', () => {
      const result = IntervalSet.fromIntervals([[0, 10]])
      expect(result.getIntervals()).toEqual([[0, 10]])
    })

    it('should handle unsorted input', () => {
      const result = IntervalSet.fromIntervals([[20, 30], [0, 10]])
      expect(result.getIntervals()).toEqual([[0, 10], [20, 30]])
    })
  })

  describe('complex scenarios', () => {
    it('should handle add-remove-add cycle', () => {
      set.add(0, 20)
      set.remove(5, 15)
      expect(set.getCount()).toBe(2)
      set.add(3, 17)
      expect(set.getCount()).toBe(1)
      expect(set.getIntervals()).toEqual([[0, 20]])
    })

    it('should handle many small intervals merging into one', () => {
      for (let i = 0; i < 10; i++) {
        set.add(i * 2, i * 2 + 1)
      }
      expect(set.getCount()).toBe(10)
      set.add(0, 20)
      expect(set.getCount()).toBe(1)
    })

    it('should handle remove that creates many small intervals', () => {
      set.add(0, 100)
      for (let i = 10; i < 90; i += 10) {
        set.remove(i, i + 5)
      }
      expect(set.getCount()).toBeGreaterThanOrEqual(1)
    })

    it('should handle set operations chaining', () => {
      const a = IntervalSet.fromIntervals([[0, 10], [20, 30]])
      const b = IntervalSet.fromIntervals([[5, 25]])
      const result = a.union(b).difference(a).intersect(b)
      expect(result.getIntervals()).toEqual([[10, 20]])
    })

    it('should handle complement of complex set', () => {
      set.add(10, 20)
      set.add(30, 40)
      set.add(50, 60)
      const comp = set.complement(0, 100)
      expect(comp.getIntervals()).toEqual([[0, 10], [20, 30], [40, 50], [60, 100]])
    })

    it('should handle negative ranges', () => {
      set.add(-20, -10)
      set.add(-5, 5)
      expect(set.getSize()).toBe(20)
      expect(set.contains(-15)).toBe(true)
      expect(set.contains(0)).toBe(true)
      expect(set.contains(-7)).toBe(false)
    })

    it('should handle large numbers', () => {
      set.add(Number.MAX_SAFE_INTEGER - 100, Number.MAX_SAFE_INTEGER)
      expect(set.getSize()).toBe(100)
      expect(set.contains(Number.MAX_SAFE_INTEGER - 50)).toBe(true)
    })

    it('should handle fractional precision', () => {
      set.add(0.1, 0.3)
      set.add(0.2, 0.5)
      expect(set.getCount()).toBe(1)
      expect(set.getSize()).toBeCloseTo(0.4)
    })

    it('should handle union of identical sets', () => {
      set.add(0, 10)
      const other = IntervalSet.fromIntervals([[0, 10]])
      expect(set.union(other).equals(set)).toBe(true)
    })

    it('should handle difference of disjoint sets', () => {
      set.add(0, 10)
      const other = IntervalSet.fromIntervals([[20, 30]])
      expect(set.difference(other).equals(set)).toBe(true)
    })

    it('should handle intersect of identical sets', () => {
      set.add(0, 10)
      set.add(20, 30)
      const other = IntervalSet.fromIntervals([[0, 10], [20, 30]])
      expect(set.intersect(other).equals(set)).toBe(true)
    })

    it('should handle complement then union gives full range', () => {
      set.add(10, 20)
      const comp = set.complement(0, 30)
      const full = set.union(comp)
      expect(full.getIntervals()).toEqual([[0, 30]])
    })

    it('should handle remove on boundary exactly', () => {
      set.add(0, 10)
      set.add(20, 30)
      set.remove(10, 20)
      expect(set.getIntervals()).toEqual([[0, 10], [20, 30]])
    })

    it('should handle add with exact adjacency on both sides', () => {
      set.add(0, 5)
      set.add(15, 20)
      set.add(5, 15)
      expect(set.getCount()).toBe(1)
      expect(set.getIntervals()).toEqual([[0, 20]])
    })

    it('should handle add same interval twice', () => {
      set.add(0, 10)
      set.add(0, 10)
      expect(set.getCount()).toBe(1)
      expect(set.getIntervals()).toEqual([[0, 10]])
    })

    it('should handle contains on merged intervals', () => {
      set.add(0, 5)
      set.add(10, 15)
      set.add(5, 10)
      expect(set.contains(0)).toBe(true)
      expect(set.contains(7)).toBe(true)
      expect(set.contains(15)).toBe(true)
      expect(set.contains(16)).toBe(false)
    })

    it('should handle getSize after remove', () => {
      set.add(0, 20)
      set.remove(5, 10)
      expect(set.getSize()).toBe(15)
    })

    it('should handle fromIntervals with all overlapping', () => {
      const result = IntervalSet.fromIntervals([[0, 5], [3, 8], [6, 12]])
      expect(result.getCount()).toBe(1)
      expect(result.getIntervals()).toEqual([[0, 12]])
    })

    it('should handle complement of single point', () => {
      set.add(5, 5)
      const result = set.complement(0, 10)
      expect(result.getIntervals()).toEqual([[0, 5], [5, 10]])
    })

    it('should handle equals after different construction paths', () => {
      set.add(0, 5)
      set.add(10, 15)
      const other = new IntervalSet()
      other.add(10, 15)
      other.add(0, 5)
      expect(set.equals(other)).toBe(true)
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
      const intervals = set.getIntervals()
      for (let i = 1; i < intervals.length; i++) {
        expect(intervals[i][0]).toBeGreaterThanOrEqual(intervals[i - 1][1])
      }
    })
  })
})
