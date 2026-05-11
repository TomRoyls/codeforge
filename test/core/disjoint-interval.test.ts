import { describe, it, expect } from 'vitest'
import { DisjointIntervalSet } from '../../src/core/disjoint-interval/index.js'

describe('DisjointIntervalSet', () => {
  describe('constructor', () => {
    it('creates an empty set', () => {
      const s = new DisjointIntervalSet()
      expect(s.isEmpty()).toBe(true)
      expect(s.size).toBe(0)
    })

    it('creates a set with custom comparator', () => {
      const s = new DisjointIntervalSet({ comparator: (a, b) => a - b })
      s.add(1, 5)
      expect(s.size).toBe(1)
    })

    it('accepts empty options', () => {
      const s = new DisjointIntervalSet({})
      expect(s.isEmpty()).toBe(true)
    })
  })

  describe('add', () => {
    it('adds a single interval', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 5)
      expect(s.intervals()).toEqual([[1, 5]])
    })

    it('adds non-overlapping intervals in order', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 3)
      s.add(5, 8)
      expect(s.intervals()).toEqual([
        [1, 3],
        [5, 8],
      ])
    })

    it('adds non-overlapping intervals out of order', () => {
      const s = new DisjointIntervalSet()
      s.add(5, 8)
      s.add(1, 3)
      expect(s.intervals()).toEqual([
        [1, 3],
        [5, 8],
      ])
    })

    it('merges overlapping intervals', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 5)
      s.add(3, 8)
      expect(s.intervals()).toEqual([[1, 8]])
    })

    it('merges adjacent intervals', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 3)
      s.add(3, 5)
      expect(s.intervals()).toEqual([[1, 5]])
    })

    it('merges intervals that subsume existing', () => {
      const s = new DisjointIntervalSet()
      s.add(2, 4)
      s.add(1, 8)
      expect(s.intervals()).toEqual([[1, 8]])
    })

    it('merges multiple intervals at once', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 3)
      s.add(5, 7)
      s.add(9, 11)
      s.add(2, 10)
      expect(s.intervals()).toEqual([[1, 11]])
    })

    it('ignores empty interval (from >= to)', () => {
      const s = new DisjointIntervalSet()
      s.add(5, 5)
      expect(s.isEmpty()).toBe(true)
    })

    it('ignores inverted interval', () => {
      const s = new DisjointIntervalSet()
      s.add(5, 3)
      expect(s.isEmpty()).toBe(true)
    })

    it('handles interval that touches on left', () => {
      const s = new DisjointIntervalSet()
      s.add(3, 6)
      s.add(1, 3)
      expect(s.intervals()).toEqual([[1, 6]])
    })

    it('handles interval that touches on right', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 3)
      s.add(3, 6)
      expect(s.intervals()).toEqual([[1, 6]])
    })

    it('handles interval enclosed by existing', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 10)
      s.add(3, 5)
      expect(s.intervals()).toEqual([[1, 10]])
    })

    it('handles interval overlapping on left', () => {
      const s = new DisjointIntervalSet()
      s.add(3, 7)
      s.add(1, 4)
      expect(s.intervals()).toEqual([[1, 7]])
    })

    it('handles interval overlapping on right', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 5)
      s.add(3, 8)
      expect(s.intervals()).toEqual([[1, 8]])
    })

    it('merges three adjacent intervals', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 3)
      s.add(3, 5)
      s.add(5, 7)
      expect(s.intervals()).toEqual([[1, 7]])
    })

    it('adds interval between two existing', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 3)
      s.add(7, 9)
      s.add(4, 6)
      expect(s.intervals()).toEqual([
        [1, 3],
        [4, 6],
        [7, 9],
      ])
    })

    it('adds interval that bridges two existing', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 3)
      s.add(7, 9)
      s.add(2, 8)
      expect(s.intervals()).toEqual([[1, 9]])
    })
  })

  describe('remove', () => {
    it('removes from an interval splitting it', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 10)
      s.remove(4, 6)
      expect(s.intervals()).toEqual([
        [1, 4],
        [6, 10],
      ])
    })

    it('removes the entire interval', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 5)
      s.remove(1, 5)
      expect(s.isEmpty()).toBe(true)
    })

    it('removes from left edge', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 10)
      s.remove(1, 4)
      expect(s.intervals()).toEqual([[4, 10]])
    })

    it('removes from right edge', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 10)
      s.remove(7, 10)
      expect(s.intervals()).toEqual([[1, 7]])
    })

    it('removes overlapping left', () => {
      const s = new DisjointIntervalSet()
      s.add(5, 10)
      s.remove(3, 7)
      expect(s.intervals()).toEqual([[7, 10]])
    })

    it('removes overlapping right', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 5)
      s.remove(3, 8)
      expect(s.intervals()).toEqual([[1, 3]])
    })

    it('removes spanning multiple intervals', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 3)
      s.add(5, 7)
      s.add(9, 11)
      s.remove(2, 10)
      expect(s.intervals()).toEqual([
        [1, 2],
        [10, 11],
      ])
    })

    it('removes nothing if no overlap', () => {
      const s = new DisjointIntervalSet()
      s.add(5, 10)
      s.remove(1, 3)
      expect(s.intervals()).toEqual([[5, 10]])
    })

    it('ignores empty removal (from >= to)', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 5)
      s.remove(3, 3)
      expect(s.intervals()).toEqual([[1, 5]])
    })

    it('ignores inverted removal', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 5)
      s.remove(5, 1)
      expect(s.intervals()).toEqual([[1, 5]])
    })

    it('removes subsuming all intervals', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 3)
      s.add(5, 7)
      s.remove(0, 10)
      expect(s.isEmpty()).toBe(true)
    })

    it('removes exactly matching interval', () => {
      const s = new DisjointIntervalSet()
      s.add(2, 4)
      s.add(6, 8)
      s.remove(2, 4)
      expect(s.intervals()).toEqual([[6, 8]])
    })
  })

  describe('contains', () => {
    it('returns true for point inside interval', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 5)
      expect(s.contains(3)).toBe(true)
    })

    it('returns true for left edge (from)', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 5)
      expect(s.contains(1)).toBe(true)
    })

    it('returns false for right edge (to)', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 5)
      expect(s.contains(5)).toBe(false)
    })

    it('returns false for point outside', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 5)
      expect(s.contains(0)).toBe(false)
      expect(s.contains(6)).toBe(false)
    })

    it('returns false for empty set', () => {
      const s = new DisjointIntervalSet()
      expect(s.contains(0)).toBe(false)
    })

    it('checks across multiple intervals', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 3)
      s.add(5, 7)
      expect(s.contains(2)).toBe(true)
      expect(s.contains(6)).toBe(true)
      expect(s.contains(4)).toBe(false)
    })

    it('handles negative numbers', () => {
      const s = new DisjointIntervalSet()
      s.add(-5, -1)
      expect(s.contains(-3)).toBe(true)
      expect(s.contains(0)).toBe(false)
    })
  })

  describe('containsInterval', () => {
    it('returns true when interval fully contained', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 10)
      expect(s.containsInterval(3, 7)).toBe(true)
    })

    it('returns true when interval exactly matches', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 5)
      expect(s.containsInterval(1, 5)).toBe(true)
    })

    it('returns false when interval partially overlaps', () => {
      const s = new DisjointIntervalSet()
      s.add(2, 6)
      expect(s.containsInterval(1, 5)).toBe(false)
    })

    it('returns false when interval is outside', () => {
      const s = new DisjointIntervalSet()
      s.add(2, 6)
      expect(s.containsInterval(7, 10)).toBe(false)
    })

    it('returns false for empty interval', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 5)
      expect(s.containsInterval(3, 3)).toBe(false)
    })

    it('returns false for inverted interval', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 5)
      expect(s.containsInterval(5, 1)).toBe(false)
    })

    it('returns false when spanning multiple intervals', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 3)
      s.add(5, 7)
      expect(s.containsInterval(1, 7)).toBe(false)
    })

    it('returns false for empty set', () => {
      const s = new DisjointIntervalSet()
      expect(s.containsInterval(1, 5)).toBe(false)
    })
  })

  describe('overlaps', () => {
    it('returns true for overlapping intervals', () => {
      const s = new DisjointIntervalSet()
      s.add(2, 6)
      expect(s.overlaps(4, 8)).toBe(true)
    })

    it('returns true for fully contained query', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 10)
      expect(s.overlaps(3, 5)).toBe(true)
    })

    it('returns true for fully enclosing query', () => {
      const s = new DisjointIntervalSet()
      s.add(3, 5)
      expect(s.overlaps(1, 10)).toBe(true)
    })

    it('returns false for adjacent on right', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 5)
      expect(s.overlaps(5, 8)).toBe(false)
    })

    it('returns false for adjacent on left', () => {
      const s = new DisjointIntervalSet()
      s.add(3, 7)
      expect(s.overlaps(1, 3)).toBe(false)
    })

    it('returns false for non-overlapping', () => {
      const s = new DisjointIntervalSet()
      s.add(5, 10)
      expect(s.overlaps(1, 3)).toBe(false)
    })

    it('returns false for empty interval', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 5)
      expect(s.overlaps(3, 3)).toBe(false)
    })

    it('returns false for inverted interval', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 5)
      expect(s.overlaps(5, 1)).toBe(false)
    })
  })

  describe('intervals', () => {
    it('returns copy of intervals', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 5)
      const ivs = s.intervals()
      ivs[0]![0] = 99
      expect(s.intervals()).toEqual([[1, 5]])
    })

    it('returns empty array for empty set', () => {
      const s = new DisjointIntervalSet()
      expect(s.intervals()).toEqual([])
    })
  })

  describe('size', () => {
    it('returns number of intervals', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 3)
      s.add(5, 7)
      expect(s.size).toBe(2)
    })

    it('returns 1 after merge', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 3)
      s.add(3, 5)
      expect(s.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('returns true for empty set', () => {
      const s = new DisjointIntervalSet()
      expect(s.isEmpty()).toBe(true)
    })

    it('returns false after adding', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 5)
      expect(s.isEmpty()).toBe(false)
    })

    it('returns true after removing all', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 5)
      s.remove(1, 5)
      expect(s.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears all intervals', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 5)
      s.add(7, 10)
      s.clear()
      expect(s.isEmpty()).toBe(true)
      expect(s.size).toBe(0)
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 5)
      const c = s.clone()
      c.add(7, 10)
      expect(s.size).toBe(1)
      expect(c.size).toBe(2)
    })

    it('preserves intervals', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 3)
      s.add(5, 7)
      const c = s.clone()
      expect(c.intervals()).toEqual([
        [1, 3],
        [5, 7],
      ])
    })

    it('clone of empty is empty', () => {
      const s = new DisjointIntervalSet()
      const c = s.clone()
      expect(c.isEmpty()).toBe(true)
    })
  })

  describe('union', () => {
    it('unions two disjoint sets', () => {
      const a = new DisjointIntervalSet()
      a.add(1, 3)
      const b = new DisjointIntervalSet()
      b.add(5, 7)
      const u = a.union(b)
      expect(u.intervals()).toEqual([
        [1, 3],
        [5, 7],
      ])
    })

    it('unions overlapping sets', () => {
      const a = new DisjointIntervalSet()
      a.add(1, 5)
      const b = new DisjointIntervalSet()
      b.add(3, 8)
      const u = a.union(b)
      expect(u.intervals()).toEqual([[1, 8]])
    })

    it('unions with empty set', () => {
      const a = new DisjointIntervalSet()
      a.add(1, 5)
      const b = new DisjointIntervalSet()
      const u = a.union(b)
      expect(u.intervals()).toEqual([[1, 5]])
    })

    it('empty union empty is empty', () => {
      const a = new DisjointIntervalSet()
      const b = new DisjointIntervalSet()
      const u = a.union(b)
      expect(u.isEmpty()).toBe(true)
    })

    it('does not modify original sets', () => {
      const a = new DisjointIntervalSet()
      a.add(1, 3)
      const b = new DisjointIntervalSet()
      b.add(5, 7)
      a.union(b)
      expect(a.intervals()).toEqual([[1, 3]])
      expect(b.intervals()).toEqual([[5, 7]])
    })
  })

  describe('intersect', () => {
    it('intersects overlapping intervals', () => {
      const a = new DisjointIntervalSet()
      a.add(1, 6)
      const b = new DisjointIntervalSet()
      b.add(4, 8)
      const i = a.intersect(b)
      expect(i.intervals()).toEqual([[4, 6]])
    })

    it('returns empty for non-overlapping', () => {
      const a = new DisjointIntervalSet()
      a.add(1, 3)
      const b = new DisjointIntervalSet()
      b.add(5, 7)
      const i = a.intersect(b)
      expect(i.isEmpty()).toBe(true)
    })

    it('intersects multiple intervals', () => {
      const a = new DisjointIntervalSet()
      a.add(1, 5)
      a.add(8, 12)
      const b = new DisjointIntervalSet()
      b.add(3, 10)
      const i = a.intersect(b)
      expect(i.intervals()).toEqual([
        [3, 5],
        [8, 10],
      ])
    })

    it('intersect with empty is empty', () => {
      const a = new DisjointIntervalSet()
      a.add(1, 5)
      const b = new DisjointIntervalSet()
      const i = a.intersect(b)
      expect(i.isEmpty()).toBe(true)
    })

    it('does not modify original sets', () => {
      const a = new DisjointIntervalSet()
      a.add(1, 5)
      const b = new DisjointIntervalSet()
      b.add(3, 7)
      a.intersect(b)
      expect(a.intervals()).toEqual([[1, 5]])
      expect(b.intervals()).toEqual([[3, 7]])
    })

    it('returns exact match when identical', () => {
      const a = new DisjointIntervalSet()
      a.add(1, 5)
      const b = new DisjointIntervalSet()
      b.add(1, 5)
      const i = a.intersect(b)
      expect(i.intervals()).toEqual([[1, 5]])
    })
  })

  describe('difference', () => {
    it('removes overlapping portion', () => {
      const a = new DisjointIntervalSet()
      a.add(1, 8)
      const b = new DisjointIntervalSet()
      b.add(4, 6)
      const d = a.difference(b)
      expect(d.intervals()).toEqual([
        [1, 4],
        [6, 8],
      ])
    })

    it('removes entire interval', () => {
      const a = new DisjointIntervalSet()
      a.add(2, 5)
      const b = new DisjointIntervalSet()
      b.add(1, 8)
      const d = a.difference(b)
      expect(d.isEmpty()).toBe(true)
    })

    it('returns copy when no overlap', () => {
      const a = new DisjointIntervalSet()
      a.add(1, 3)
      const b = new DisjointIntervalSet()
      b.add(5, 7)
      const d = a.difference(b)
      expect(d.intervals()).toEqual([[1, 3]])
    })

    it('does not modify original', () => {
      const a = new DisjointIntervalSet()
      a.add(1, 5)
      const b = new DisjointIntervalSet()
      b.add(2, 4)
      a.difference(b)
      expect(a.intervals()).toEqual([[1, 5]])
    })
  })

  describe('complement', () => {
    it('returns complement within range', () => {
      const s = new DisjointIntervalSet()
      s.add(3, 7)
      const c = s.complement(0, 10)
      expect(c.intervals()).toEqual([
        [0, 3],
        [7, 10],
      ])
    })

    it('returns full range for empty set', () => {
      const s = new DisjointIntervalSet()
      const c = s.complement(0, 10)
      expect(c.intervals()).toEqual([[0, 10]])
    })

    it('returns empty if interval covers range', () => {
      const s = new DisjointIntervalSet()
      s.add(0, 10)
      const c = s.complement(0, 10)
      expect(c.isEmpty()).toBe(true)
    })

    it('handles multiple gaps', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 3)
      s.add(5, 7)
      const c = s.complement(0, 10)
      expect(c.intervals()).toEqual([
        [0, 1],
        [3, 5],
        [7, 10],
      ])
    })

    it('returns empty for inverted range', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 5)
      const c = s.complement(10, 5)
      expect(c.isEmpty()).toBe(true)
    })

    it('returns empty for equal range', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 5)
      const c = s.complement(5, 5)
      expect(c.isEmpty()).toBe(true)
    })

    it('ignores intervals outside range', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 3)
      const c = s.complement(5, 10)
      expect(c.intervals()).toEqual([[5, 10]])
    })

    it('handles interval extending beyond range', () => {
      const s = new DisjointIntervalSet()
      s.add(0, 10)
      const c = s.complement(2, 8)
      expect(c.isEmpty()).toBe(true)
    })
  })

  describe('gaps', () => {
    it('returns gaps between intervals', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 3)
      s.add(5, 7)
      const g = s.gaps(0, 10)
      expect(g.intervals()).toEqual([
        [0, 1],
        [3, 5],
        [7, 10],
      ])
    })

    it('gaps alias complement', () => {
      const s = new DisjointIntervalSet()
      s.add(2, 4)
      const g = s.gaps(0, 10)
      const c = s.complement(0, 10)
      expect(g.intervals()).toEqual(c.intervals())
    })
  })

  describe('length', () => {
    it('returns total length of intervals', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 5)
      expect(s.length).toBe(4)
    })

    it('sums multiple intervals', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 3)
      s.add(5, 8)
      expect(s.length).toBe(2 + 3)
    })

    it('returns 0 for empty set', () => {
      const s = new DisjointIntervalSet()
      expect(s.length).toBe(0)
    })
  })

  describe('forEach', () => {
    it('iterates all intervals', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 3)
      s.add(5, 7)
      const result: number[][] = []
      s.forEach((from, to, idx) => {
        result.push([from, to, idx])
      })
      expect(result).toEqual([
        [1, 3, 0],
        [5, 7, 1],
      ])
    })

    it('does not call for empty set', () => {
      const s = new DisjointIntervalSet()
      let called = false
      s.forEach(() => {
        called = true
      })
      expect(called).toBe(false)
    })
  })

  describe('Symbol.iterator', () => {
    it('is iterable', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 3)
      s.add(5, 7)
      expect([...s]).toEqual([
        [1, 3],
        [5, 7],
      ])
    })

    it('works with destructuring', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 3)
      const [first] = s
      expect(first).toEqual([1, 3])
    })

    it('returns empty array for empty set', () => {
      const s = new DisjointIntervalSet()
      expect([...s]).toEqual([])
    })
  })

  describe('fromIntervals', () => {
    it('creates set from array of intervals', () => {
      const s = DisjointIntervalSet.fromIntervals([
        [1, 3],
        [5, 7],
      ])
      expect(s.intervals()).toEqual([
        [1, 3],
        [5, 7],
      ])
    })

    it('merges overlapping intervals during creation', () => {
      const s = DisjointIntervalSet.fromIntervals([
        [1, 4],
        [3, 7],
      ])
      expect(s.intervals()).toEqual([[1, 7]])
    })

    it('creates empty set from empty array', () => {
      const s = DisjointIntervalSet.fromIntervals([])
      expect(s.isEmpty()).toBe(true)
    })

    it('accepts options', () => {
      const s = DisjointIntervalSet.fromIntervals([[1, 3]], {
        comparator: (a, b) => a - b,
      })
      expect(s.intervals()).toEqual([[1, 3]])
    })
  })

  describe('min', () => {
    it('returns the minimum point', () => {
      const s = new DisjointIntervalSet()
      s.add(3, 5)
      s.add(1, 2)
      expect(s.min()).toBe(1)
    })

    it('returns undefined for empty set', () => {
      const s = new DisjointIntervalSet()
      expect(s.min()).toBeUndefined()
    })
  })

  describe('max', () => {
    it('returns the maximum point', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 3)
      s.add(5, 10)
      expect(s.max()).toBe(10)
    })

    it('returns undefined for empty set', () => {
      const s = new DisjointIntervalSet()
      expect(s.max()).toBeUndefined()
    })
  })

  describe('encloses', () => {
    it('returns true for enclosed interval', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 10)
      expect(s.encloses(3, 7)).toBe(true)
    })

    it('returns false for non-enclosed interval', () => {
      const s = new DisjointIntervalSet()
      s.add(2, 6)
      expect(s.encloses(1, 5)).toBe(false)
    })

    it('is alias for containsInterval', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 10)
      expect(s.encloses(2, 8)).toBe(s.containsInterval(2, 8))
    })
  })

  describe('equals', () => {
    it('returns true for identical sets', () => {
      const a = new DisjointIntervalSet()
      a.add(1, 3)
      a.add(5, 7)
      const b = new DisjointIntervalSet()
      b.add(1, 3)
      b.add(5, 7)
      expect(a.equals(b)).toBe(true)
    })

    it('returns false for different sets', () => {
      const a = new DisjointIntervalSet()
      a.add(1, 3)
      const b = new DisjointIntervalSet()
      b.add(1, 5)
      expect(a.equals(b)).toBe(false)
    })

    it('returns true for two empty sets', () => {
      const a = new DisjointIntervalSet()
      const b = new DisjointIntervalSet()
      expect(a.equals(b)).toBe(true)
    })

    it('returns false for different sizes', () => {
      const a = new DisjointIntervalSet()
      a.add(1, 3)
      a.add(5, 7)
      const b = new DisjointIntervalSet()
      b.add(1, 3)
      expect(a.equals(b)).toBe(false)
    })

    it('returns false when intervals differ in value', () => {
      const a = new DisjointIntervalSet()
      a.add(1, 3)
      const b = new DisjointIntervalSet()
      b.add(2, 3)
      expect(a.equals(b)).toBe(false)
    })
  })

  describe('expand', () => {
    it('adds a point-sized interval', () => {
      const s = new DisjointIntervalSet()
      s.expand(5)
      expect(s.intervals()).toEqual([[5, 6]])
    })

    it('merges with adjacent interval', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 5)
      s.expand(5)
      expect(s.intervals()).toEqual([[1, 6]])
    })

    it('merges with overlapping interval', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 5)
      s.expand(3)
      expect(s.intervals()).toEqual([[1, 5]])
    })

    it('creates separate interval when gap exists', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 3)
      s.expand(10)
      expect(s.intervals()).toEqual([
        [1, 3],
        [10, 11],
      ])
    })
  })

  describe('intersectPoint', () => {
    it('returns point when contained', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 5)
      expect(s.intersectPoint(3)).toBe(3)
    })

    it('returns undefined when not contained', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 5)
      expect(s.intersectPoint(6)).toBeUndefined()
    })

    it('returns undefined for right edge', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 5)
      expect(s.intersectPoint(5)).toBeUndefined()
    })

    it('returns point for left edge', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 5)
      expect(s.intersectPoint(1)).toBe(1)
    })

    it('returns undefined for empty set', () => {
      const s = new DisjointIntervalSet()
      expect(s.intersectPoint(0)).toBeUndefined()
    })

    it('returns point in second interval', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 3)
      s.add(5, 7)
      expect(s.intersectPoint(6)).toBe(6)
    })
  })

  describe('edge cases', () => {
    it('handles floating point intervals', () => {
      const s = new DisjointIntervalSet()
      s.add(1.5, 3.5)
      expect(s.contains(2.0)).toBe(true)
      expect(s.contains(1.5)).toBe(true)
      expect(s.contains(3.5)).toBe(false)
    })

    it('handles zero-width gaps', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 3)
      s.add(3, 5)
      expect(s.size).toBe(1)
    })

    it('handles large numbers', () => {
      const s = new DisjointIntervalSet()
      s.add(1e15, 2e15)
      expect(s.contains(1.5e15)).toBe(true)
    })

    it('handles negative intervals', () => {
      const s = new DisjointIntervalSet()
      s.add(-10, -5)
      s.add(-3, -1)
      expect(s.size).toBe(2)
      expect(s.contains(-7)).toBe(true)
    })

    it('handles add remove add cycle', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 10)
      s.remove(4, 6)
      s.add(4, 6)
      expect(s.intervals()).toEqual([[1, 10]])
    })

    it('handles many small intervals', () => {
      const s = new DisjointIntervalSet()
      for (let i = 0; i < 100; i++) {
        s.add(i * 2, i * 2 + 1)
      }
      expect(s.size).toBe(100)
      s.add(0, 200)
      expect(s.size).toBe(1)
      expect(s.intervals()).toEqual([[0, 200]])
    })

    it('handles complex merge pattern', () => {
      const s = new DisjointIntervalSet()
      s.add(10, 20)
      s.add(30, 40)
      s.add(50, 60)
      s.add(15, 55)
      expect(s.intervals()).toEqual([[10, 60]])
    })

    it('handles complex remove pattern', () => {
      const s = new DisjointIntervalSet()
      s.add(0, 100)
      s.remove(10, 20)
      s.remove(30, 40)
      s.remove(50, 60)
      expect(s.size).toBe(4)
      expect(s.intervals()).toEqual([
        [0, 10],
        [20, 30],
        [40, 50],
        [60, 100],
      ])
    })

    it('clear and reuse', () => {
      const s = new DisjointIntervalSet()
      s.add(1, 5)
      s.clear()
      s.add(10, 20)
      expect(s.intervals()).toEqual([[10, 20]])
    })

    it('union of complex sets', () => {
      const a = new DisjointIntervalSet()
      a.add(1, 3)
      a.add(7, 9)
      const b = new DisjointIntervalSet()
      b.add(2, 8)
      const u = a.union(b)
      expect(u.intervals()).toEqual([[1, 9]])
    })

    it('difference with multiple removals', () => {
      const a = new DisjointIntervalSet()
      a.add(0, 100)
      const b = new DisjointIntervalSet()
      b.add(10, 20)
      b.add(30, 40)
      b.add(50, 60)
      const d = a.difference(b)
      expect(d.intervals()).toEqual([
        [0, 10],
        [20, 30],
        [40, 50],
        [60, 100],
      ])
    })
  })
})
