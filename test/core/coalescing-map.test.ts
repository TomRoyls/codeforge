import { describe, it, expect } from 'vitest'
import { CoalescingMap } from '../../src/core/coalescing-map/index.js'
import type { CoalescingMapOptions, CoalescingMapRange } from '../../src/core/coalescing-map/types.js'

describe('CoalescingMap', () => {
  describe('constructor', () => {
    it('creates empty map with no options', () => {
      const cm = new CoalescingMap<number, string>()
      expect(cm.size).toBe(0)
      expect(cm.isEmpty).toBe(true)
    })

    it('creates map with custom compare function', () => {
      const cm = new CoalescingMap<number, string>({
        compare: (a, b) => a - b,
      })
      expect(cm.size).toBe(0)
    })

    it('creates map with all custom options', () => {
      const cm = new CoalescingMap<number, string>({
        compare: (a, b) => a - b,
        predecessor: (k) => k - 1,
        successor: (k) => k + 1,
      })
      expect(cm.isEmpty).toBe(true)
    })

    it('creates map with partial options', () => {
      const cm = new CoalescingMap<number, string>({
        predecessor: (k) => k - 1,
      })
      expect(cm.isEmpty).toBe(true)
    })

    it('accepts different value types', () => {
      const cm = new CoalescingMap<number, { name: string }>()
      expect(cm.isEmpty).toBe(true)
    })
  })

  describe('set and get', () => {
    it('sets and gets a single range', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      expect(cm.get(3)).toBe('a')
    })

    it('returns undefined for key outside all ranges', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      expect(cm.get(0)).toBeUndefined()
      expect(cm.get(6)).toBeUndefined()
    })

    it('returns undefined for key in empty map', () => {
      const cm = new CoalescingMap<number, string>()
      expect(cm.get(1)).toBeUndefined()
    })

    it('gets value at range start', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      expect(cm.get(1)).toBe('a')
    })

    it('gets value at range end', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      expect(cm.get(5)).toBe('a')
    })

    it('sets multiple non-overlapping ranges', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.set(10, 15, 'b')
      expect(cm.get(3)).toBe('a')
      expect(cm.get(12)).toBe('b')
      expect(cm.get(7)).toBeUndefined()
      expect(cm.size).toBe(2)
    })

    it('overwrites range with same value exactly', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.set(1, 5, 'a')
      expect(cm.size).toBe(1)
      expect(cm.get(3)).toBe('a')
    })

    it('sets single point range', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(5, 5, 'point')
      expect(cm.get(5)).toBe('point')
      expect(cm.get(4)).toBeUndefined()
      expect(cm.get(6)).toBeUndefined()
    })

    it('does nothing when start > end', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(10, 5, 'invalid')
      expect(cm.size).toBe(0)
    })

    it('stores complex value types', () => {
      const cm = new CoalescingMap<number, { x: number; y: number }>()
      cm.set(1, 5, { x: 10, y: 20 })
      const val = cm.get(3)!
      expect(val.x).toBe(10)
      expect(val.y).toBe(20)
    })

    it('sets range with negative numbers', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(-10, -5, 'neg')
      expect(cm.get(-7)).toBe('neg')
      expect(cm.get(-4)).toBeUndefined()
    })

    it('sets range spanning negative to positive', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(-5, 5, 'span')
      expect(cm.get(-3)).toBe('span')
      expect(cm.get(0)).toBe('span')
      expect(cm.get(3)).toBe('span')
    })

    it('sets range with zero start and end', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(0, 0, 'zero')
      expect(cm.get(0)).toBe('zero')
    })

    it('gets from multiple ranges returns correct value per key', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 3, 'a')
      cm.set(5, 7, 'b')
      cm.set(9, 11, 'c')
      expect(cm.get(2)).toBe('a')
      expect(cm.get(6)).toBe('b')
      expect(cm.get(10)).toBe('c')
    })

    it('large range covers many points', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(0, 1000, 'big')
      expect(cm.get(0)).toBe('big')
      expect(cm.get(500)).toBe('big')
      expect(cm.get(1000)).toBe('big')
      expect(cm.get(1001)).toBeUndefined()
    })
  })

  describe('coalescing adjacent ranges', () => {
    it('coalesces right-adjacent same-value range', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.set(6, 10, 'a')
      expect(cm.size).toBe(1)
      expect(cm.get(3)).toBe('a')
      expect(cm.get(8)).toBe('a')
    })

    it('coalesces left-adjacent same-value range', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(6, 10, 'a')
      cm.set(1, 5, 'a')
      expect(cm.size).toBe(1)
      expect(cm.ranges()).toEqual([{ start: 1, end: 10, value: 'a' }])
    })

    it('does not coalesce adjacent different-value ranges', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.set(6, 10, 'b')
      expect(cm.size).toBe(2)
    })

    it('coalesces range that bridges two existing adjacent ranges', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.set(7, 10, 'a')
      cm.set(5, 7, 'a')
      expect(cm.size).toBe(1)
      expect(cm.ranges()).toEqual([{ start: 1, end: 10, value: 'a' }])
    })

    it('coalesces three adjacent ranges into one', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 3, 'a')
      cm.set(4, 6, 'a')
      cm.set(7, 9, 'a')
      cm.set(4, 4, 'a')
      expect(cm.size).toBe(1)
      expect(cm.ranges()).toEqual([{ start: 1, end: 9, value: 'a' }])
    })

    it('coalesces chain of adjacent ranges', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 3, 'a')
      cm.set(4, 6, 'a')
      cm.set(7, 9, 'a')
      expect(cm.size).toBe(1)
      expect(cm.ranges()).toEqual([{ start: 1, end: 9, value: 'a' }])
    })

    it('single point coalesces both sides', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 4, 'a')
      cm.set(6, 9, 'a')
      cm.set(5, 5, 'a')
      expect(cm.size).toBe(1)
      expect(cm.ranges()).toEqual([{ start: 1, end: 9, value: 'a' }])
    })

    it('coalesces when new range end is adjacent to existing start', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(10, 15, 'a')
      cm.set(5, 9, 'a')
      expect(cm.size).toBe(1)
      expect(cm.ranges()).toEqual([{ start: 5, end: 15, value: 'a' }])
    })

    it('setting adjacent point expands range left', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(5, 10, 'a')
      cm.set(4, 4, 'a')
      expect(cm.size).toBe(1)
      expect(cm.ranges()).toEqual([{ start: 4, end: 10, value: 'a' }])
    })

    it('setting adjacent point expands range right', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(5, 10, 'a')
      cm.set(11, 11, 'a')
      expect(cm.size).toBe(1)
      expect(cm.ranges()).toEqual([{ start: 5, end: 11, value: 'a' }])
    })

    it('adjacent coalescing preserves different-value gaps', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.set(6, 10, 'b')
      cm.set(11, 15, 'a')
      expect(cm.size).toBe(3)
    })

    it('coalesces only same-value adjacent ranges', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 3, 'a')
      cm.set(5, 7, 'b')
      cm.set(9, 11, 'a')
      cm.set(3, 5, 'a')
      expect(cm.size).toBe(3)
      const rs = cm.ranges().sort((a, b) => (a.start as number) - (b.start as number))
      expect(rs[0]).toEqual({ start: 1, end: 5, value: 'a' })
      expect(rs[1]).toEqual({ start: 6, end: 7, value: 'b' })
      expect(rs[2]).toEqual({ start: 9, end: 11, value: 'a' })
    })
  })

  describe('coalescing overlapping ranges', () => {
    it('coalesces overlapping same-value range', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 10, 'a')
      cm.set(5, 15, 'a')
      expect(cm.size).toBe(1)
      expect(cm.ranges()).toEqual([{ start: 1, end: 15, value: 'a' }])
    })

    it('coalesces range fully contained in existing range', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 20, 'a')
      cm.set(5, 10, 'a')
      expect(cm.size).toBe(1)
      expect(cm.ranges()).toEqual([{ start: 1, end: 20, value: 'a' }])
    })

    it('coalesces range that extends existing left', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(5, 10, 'a')
      cm.set(1, 7, 'a')
      expect(cm.size).toBe(1)
      expect(cm.ranges()).toEqual([{ start: 1, end: 10, value: 'a' }])
    })

    it('coalesces range that extends existing right', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.set(3, 10, 'a')
      expect(cm.size).toBe(1)
      expect(cm.ranges()).toEqual([{ start: 1, end: 10, value: 'a' }])
    })

    it('overlapping different-value range trims existing left', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 10, 'a')
      cm.set(8, 15, 'b')
      expect(cm.size).toBe(2)
      const rs = cm.ranges().sort((a, b) => (a.start as number) - (b.start as number))
      expect(rs[0]).toEqual({ start: 1, end: 7, value: 'a' })
      expect(rs[1]).toEqual({ start: 8, end: 15, value: 'b' })
    })

    it('overlapping different-value range trims existing right', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(5, 15, 'a')
      cm.set(1, 8, 'b')
      expect(cm.size).toBe(2)
      const rs = cm.ranges().sort((a, b) => (a.start as number) - (b.start as number))
      expect(rs[0]).toEqual({ start: 1, end: 8, value: 'b' })
      expect(rs[1]).toEqual({ start: 9, end: 15, value: 'a' })
    })

    it('different-value range fully contained splits existing', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 20, 'a')
      cm.set(5, 10, 'b')
      expect(cm.size).toBe(3)
      const rs = cm.ranges().sort((a, b) => (a.start as number) - (b.start as number))
      expect(rs[0]).toEqual({ start: 1, end: 4, value: 'a' })
      expect(rs[1]).toEqual({ start: 5, end: 10, value: 'b' })
      expect(rs[2]).toEqual({ start: 11, end: 20, value: 'a' })
    })

    it('different-value range covers existing entirely', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(5, 10, 'a')
      cm.set(1, 15, 'b')
      expect(cm.size).toBe(1)
      expect(cm.ranges()).toEqual([{ start: 1, end: 15, value: 'b' }])
    })

    it('same-value range coalesces overlapping ranges on both sides', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.set(10, 15, 'a')
      cm.set(3, 12, 'a')
      expect(cm.size).toBe(1)
      expect(cm.ranges()).toEqual([{ start: 1, end: 15, value: 'a' }])
    })

    it('overlapping at single point triggers coalescing', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.set(5, 10, 'a')
      expect(cm.size).toBe(1)
      expect(cm.ranges()).toEqual([{ start: 1, end: 10, value: 'a' }])
    })

    it('partial overlap merges into larger range', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.set(4, 8, 'a')
      expect(cm.size).toBe(1)
      expect(cm.ranges()).toEqual([{ start: 1, end: 8, value: 'a' }])
    })
  })

  describe('different value interactions', () => {
    it('set with different value trims existing range', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 20, 'a')
      cm.set(8, 12, 'b')
      expect(cm.size).toBe(3)
      expect(cm.get(7)).toBe('a')
      expect(cm.get(10)).toBe('b')
      expect(cm.get(15)).toBe('a')
    })

    it('set with different value removes middle of range', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(0, 100, 'a')
      cm.set(40, 60, 'b')
      expect(cm.size).toBe(3)
      const rs = cm.ranges().sort((a, b) => (a.start as number) - (b.start as number))
      expect(rs[0]).toEqual({ start: 0, end: 39, value: 'a' })
      expect(rs[1]).toEqual({ start: 40, end: 60, value: 'b' })
      expect(rs[2]).toEqual({ start: 61, end: 100, value: 'a' })
    })

    it('set with different value at start of range', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(10, 20, 'a')
      cm.set(5, 12, 'b')
      expect(cm.size).toBe(2)
      const rs = cm.ranges().sort((a, b) => (a.start as number) - (b.start as number))
      expect(rs[0]).toEqual({ start: 5, end: 12, value: 'b' })
      expect(rs[1]).toEqual({ start: 13, end: 20, value: 'a' })
    })

    it('set with different value at end of range', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 10, 'a')
      cm.set(8, 15, 'b')
      expect(cm.size).toBe(2)
      const rs = cm.ranges().sort((a, b) => (a.start as number) - (b.start as number))
      expect(rs[0]).toEqual({ start: 1, end: 7, value: 'a' })
      expect(rs[1]).toEqual({ start: 8, end: 15, value: 'b' })
    })

    it('multiple different-value insertions create checkerboard', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 20, 'a')
      cm.set(5, 10, 'b')
      cm.set(12, 16, 'c')
      expect(cm.size).toBe(5)
      expect(cm.get(3)).toBe('a')
      expect(cm.get(7)).toBe('b')
      expect(cm.get(11)).toBe('a')
      expect(cm.get(14)).toBe('c')
      expect(cm.get(18)).toBe('a')
    })

    it('replacing with same value coalesces fragments', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 20, 'a')
      cm.set(5, 10, 'b')
      cm.set(5, 10, 'a')
      expect(cm.size).toBe(1)
      expect(cm.ranges()).toEqual([{ start: 1, end: 20, value: 'a' }])
    })

    it('overwriting multiple ranges with one value', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.set(10, 15, 'b')
      cm.set(20, 25, 'a')
      cm.set(1, 25, 'c')
      expect(cm.size).toBe(1)
      expect(cm.ranges()).toEqual([{ start: 1, end: 25, value: 'c' }])
    })

    it('setting same range with different value replaces', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 10, 'a')
      cm.set(1, 10, 'b')
      expect(cm.size).toBe(1)
      expect(cm.ranges()).toEqual([{ start: 1, end: 10, value: 'b' }])
    })

    it('different value adjacent to same value range', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.set(6, 10, 'b')
      expect(cm.size).toBe(2)
      expect(cm.get(5)).toBe('a')
      expect(cm.get(6)).toBe('b')
    })

    it('overlapping multiple ranges with trimming', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.set(8, 12, 'b')
      cm.set(15, 20, 'c')
      cm.set(3, 18, 'x')
      expect(cm.size).toBe(3)
      const rs = cm.ranges().sort((a, b) => (a.start as number) - (b.start as number))
      expect(rs[0]).toEqual({ start: 1, end: 2, value: 'a' })
      expect(rs[1]).toEqual({ start: 3, end: 18, value: 'x' })
      expect(rs[2]).toEqual({ start: 19, end: 20, value: 'c' })
    })

    it('null and undefined values', () => {
      const cm = new CoalescingMap<number, string | null>()
      cm.set(1, 5, null)
      cm.set(6, 10, 'a')
      expect(cm.get(3)).toBe(null)
      expect(cm.get(8)).toBe('a')
    })

    it('boolean values', () => {
      const cm = new CoalescingMap<number, boolean>()
      cm.set(1, 5, true)
      cm.set(6, 10, false)
      expect(cm.get(3)).toBe(true)
      expect(cm.get(8)).toBe(false)
    })
  })

  describe('delete', () => {
    it('deletes entire range', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 10, 'a')
      cm.delete(1, 10)
      expect(cm.size).toBe(0)
      expect(cm.isEmpty).toBe(true)
    })

    it('deletes middle of range creating two ranges', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 20, 'a')
      cm.delete(8, 12)
      expect(cm.size).toBe(2)
      const rs = cm.ranges().sort((a, b) => (a.start as number) - (b.start as number))
      expect(rs[0]).toEqual({ start: 1, end: 7, value: 'a' })
      expect(rs[1]).toEqual({ start: 13, end: 20, value: 'a' })
    })

    it('deletes start of range', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 10, 'a')
      cm.delete(1, 5)
      expect(cm.size).toBe(1)
      expect(cm.ranges()).toEqual([{ start: 6, end: 10, value: 'a' }])
    })

    it('deletes end of range', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 10, 'a')
      cm.delete(6, 10)
      expect(cm.size).toBe(1)
      expect(cm.ranges()).toEqual([{ start: 1, end: 5, value: 'a' }])
    })

    it('delete on empty map is no-op', () => {
      const cm = new CoalescingMap<number, string>()
      cm.delete(1, 10)
      expect(cm.size).toBe(0)
    })

    it('delete non-overlapping range is no-op', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.delete(10, 15)
      expect(cm.size).toBe(1)
      expect(cm.get(3)).toBe('a')
    })

    it('delete with start > end is no-op', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.delete(10, 5)
      expect(cm.size).toBe(1)
    })

    it('deletes single point from range', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 10, 'a')
      cm.delete(5, 5)
      expect(cm.size).toBe(2)
      const rs = cm.ranges().sort((a, b) => (a.start as number) - (b.start as number))
      expect(rs[0]).toEqual({ start: 1, end: 4, value: 'a' })
      expect(rs[1]).toEqual({ start: 6, end: 10, value: 'a' })
    })

    it('deletes across multiple ranges', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.set(10, 15, 'b')
      cm.set(20, 25, 'c')
      cm.delete(3, 22)
      expect(cm.size).toBe(2)
      const rs = cm.ranges().sort((a, b) => (a.start as number) - (b.start as number))
      expect(rs[0]).toEqual({ start: 1, end: 2, value: 'a' })
      expect(rs[1]).toEqual({ start: 23, end: 25, value: 'c' })
    })

    it('delete removes all ranges fully covered', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(5, 10, 'a')
      cm.set(15, 20, 'b')
      cm.delete(1, 25)
      expect(cm.size).toBe(0)
    })

    it('delete exactly one range from multiple', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.set(10, 15, 'b')
      cm.set(20, 25, 'c')
      cm.delete(10, 15)
      expect(cm.size).toBe(2)
      expect(cm.get(3)).toBe('a')
      expect(cm.get(12)).toBeUndefined()
      expect(cm.get(22)).toBe('c')
    })

    it('delete partial from multiple ranges', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 10, 'a')
      cm.set(15, 20, 'b')
      cm.delete(5, 17)
      expect(cm.size).toBe(2)
      const rs = cm.ranges().sort((a, b) => (a.start as number) - (b.start as number))
      expect(rs[0]).toEqual({ start: 1, end: 4, value: 'a' })
      expect(rs[1]).toEqual({ start: 18, end: 20, value: 'b' })
    })

    it('delete then set works correctly', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 10, 'a')
      cm.delete(5, 5)
      cm.set(5, 5, 'a')
      expect(cm.size).toBe(1)
      expect(cm.ranges()).toEqual([{ start: 1, end: 10, value: 'a' }])
    })

    it('delete point at range boundary', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 10, 'a')
      cm.delete(1, 1)
      expect(cm.size).toBe(1)
      expect(cm.ranges()).toEqual([{ start: 2, end: 10, value: 'a' }])
    })

    it('delete point at range end', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 10, 'a')
      cm.delete(10, 10)
      expect(cm.size).toBe(1)
      expect(cm.ranges()).toEqual([{ start: 1, end: 9, value: 'a' }])
    })

    it('delete range extending beyond existing range', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(5, 10, 'a')
      cm.delete(1, 15)
      expect(cm.size).toBe(0)
    })

    it('delete leaves gap that does not coalesce', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 20, 'a')
      cm.delete(8, 12)
      expect(cm.get(7)).toBe('a')
      expect(cm.get(10)).toBeUndefined()
      expect(cm.get(13)).toBe('a')
    })

    it('delete between ranges is no-op', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.set(10, 15, 'b')
      cm.delete(6, 9)
      expect(cm.size).toBe(2)
    })

    it('delete single point not in any range is no-op', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.delete(10, 10)
      expect(cm.size).toBe(1)
    })

    it('multiple sequential deletes', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 20, 'a')
      cm.delete(5, 8)
      cm.delete(12, 15)
      expect(cm.size).toBe(3)
      expect(cm.get(3)).toBe('a')
      expect(cm.get(6)).toBeUndefined()
      expect(cm.get(10)).toBe('a')
      expect(cm.get(13)).toBeUndefined()
      expect(cm.get(18)).toBe('a')
    })
  })

  describe('contains', () => {
    it('returns true for key in range', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 10, 'a')
      expect(cm.contains(5)).toBe(true)
    })

    it('returns false for key outside range', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 10, 'a')
      expect(cm.contains(0)).toBe(false)
      expect(cm.contains(11)).toBe(false)
    })

    it('returns false for empty map', () => {
      const cm = new CoalescingMap<number, string>()
      expect(cm.contains(1)).toBe(false)
    })

    it('returns true at range boundaries', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 10, 'a')
      expect(cm.contains(1)).toBe(true)
      expect(cm.contains(10)).toBe(true)
    })

    it('works with multiple ranges', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.set(10, 15, 'b')
      expect(cm.contains(3)).toBe(true)
      expect(cm.contains(12)).toBe(true)
      expect(cm.contains(7)).toBe(false)
    })

    it('returns false after deletion', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 10, 'a')
      cm.delete(5, 5)
      expect(cm.contains(5)).toBe(false)
    })

    it('returns true for single point range', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(5, 5, 'a')
      expect(cm.contains(5)).toBe(true)
      expect(cm.contains(4)).toBe(false)
    })

    it('works with negative keys', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(-10, -5, 'a')
      expect(cm.contains(-7)).toBe(true)
      expect(cm.contains(-4)).toBe(false)
    })

    it('returns false for key in gap between ranges', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.set(10, 15, 'a')
      expect(cm.contains(7)).toBe(false)
    })

    it('works after clear', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 10, 'a')
      cm.clear()
      expect(cm.contains(5)).toBe(false)
    })
  })

  describe('ranges', () => {
    it('returns empty array for empty map', () => {
      const cm = new CoalescingMap<number, string>()
      expect(cm.ranges()).toEqual([])
    })

    it('returns single range', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 10, 'a')
      expect(cm.ranges()).toEqual([{ start: 1, end: 10, value: 'a' }])
    })

    it('returns multiple ranges sorted by start', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(10, 15, 'b')
      cm.set(1, 5, 'a')
      const rs = cm.ranges()
      expect(rs[0]!.start).toBe(1)
      expect(rs[1]!.start).toBe(10)
    })

    it('returns copy of ranges not internal reference', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      const rs = cm.ranges()
      rs[0]!.start = 99
      expect(cm.ranges()[0]!.start).toBe(1)
    })

    it('reflects coalesced ranges', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.set(6, 10, 'a')
      expect(cm.ranges()).toEqual([{ start: 1, end: 10, value: 'a' }])
    })

    it('reflects state after delete', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 20, 'a')
      cm.delete(8, 12)
      const rs = cm.ranges().sort((a, b) => (a.start as number) - (b.start as number))
      expect(rs).toHaveLength(2)
      expect(rs[0]).toEqual({ start: 1, end: 7, value: 'a' })
      expect(rs[1]).toEqual({ start: 13, end: 20, value: 'a' })
    })
  })

  describe('size and isEmpty', () => {
    it('size is 0 for empty map', () => {
      const cm = new CoalescingMap<number, string>()
      expect(cm.size).toBe(0)
    })

    it('isEmpty is true for empty map', () => {
      const cm = new CoalescingMap<number, string>()
      expect(cm.isEmpty).toBe(true)
    })

    it('size increments with non-coalescing sets', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      expect(cm.size).toBe(1)
      cm.set(10, 15, 'b')
      expect(cm.size).toBe(2)
    })

    it('size does not increment with coalescing sets', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.set(6, 10, 'a')
      expect(cm.size).toBe(1)
    })

    it('isEmpty is false after set', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      expect(cm.isEmpty).toBe(false)
    })

    it('size decreases on delete', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.set(10, 15, 'b')
      cm.delete(1, 5)
      expect(cm.size).toBe(1)
    })

    it('size becomes 0 after deleting all', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.delete(1, 5)
      expect(cm.size).toBe(0)
      expect(cm.isEmpty).toBe(true)
    })

    it('size increases when range splits from delete', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 20, 'a')
      cm.delete(10, 10)
      expect(cm.size).toBe(2)
    })
  })

  describe('clear', () => {
    it('clears all ranges', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.set(10, 15, 'b')
      cm.clear()
      expect(cm.size).toBe(0)
      expect(cm.isEmpty).toBe(true)
    })

    it('clear on empty map is no-op', () => {
      const cm = new CoalescingMap<number, string>()
      cm.clear()
      expect(cm.size).toBe(0)
    })

    it('get returns undefined after clear', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.clear()
      expect(cm.get(3)).toBeUndefined()
    })

    it('can set after clear', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.clear()
      cm.set(10, 15, 'b')
      expect(cm.size).toBe(1)
      expect(cm.get(12)).toBe('b')
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty map', () => {
      const cm = new CoalescingMap<number, string>()
      expect(cm.toArray()).toEqual([])
    })

    it('returns array of ranges', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.set(10, 15, 'b')
      const arr = cm.toArray()
      expect(arr).toHaveLength(2)
      expect(arr).toContainEqual({ start: 1, end: 5, value: 'a' })
      expect(arr).toContainEqual({ start: 10, end: 15, value: 'b' })
    })

    it('returns sorted by start', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(20, 25, 'c')
      cm.set(1, 5, 'a')
      cm.set(10, 15, 'b')
      const arr = cm.toArray()
      expect(arr[0]!.start).toBe(1)
      expect(arr[1]!.start).toBe(10)
      expect(arr[2]!.start).toBe(20)
    })

    it('returns copies not references', () => {
      const cm = new CoalescingMap<number, number[]>()
      cm.set(1, 5, [1, 2, 3])
      const arr = cm.toArray()
      arr[0]!.value.push(4)
      expect(cm.get(3)).toEqual([1, 2, 3, 4])
    })

    it('reflects coalesced state', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.set(6, 10, 'a')
      expect(cm.toArray()).toEqual([{ start: 1, end: 10, value: 'a' }])
    })

    it('reflects state after delete', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 10, 'a')
      cm.delete(5, 5)
      const arr = cm.toArray()
      expect(arr).toHaveLength(2)
    })
  })

  describe('forEach', () => {
    it('iterates over all ranges', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.set(10, 15, 'b')
      const result: string[] = []
      cm.forEach((start, end, value) => {
        result.push(`${start}-${end}-${value}`)
      })
      expect(result).toHaveLength(2)
      expect(result).toContain('1-5-a')
      expect(result).toContain('10-15-b')
    })

    it('does not call callback for empty map', () => {
      const cm = new CoalescingMap<number, string>()
      let called = false
      cm.forEach(() => { called = true })
      expect(called).toBe(false)
    })

    it('provides correct start, end, value', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(5, 10, 'test')
      let receivedStart: number | undefined
      let receivedEnd: number | undefined
      let receivedValue: string | undefined
      cm.forEach((start, end, value) => {
        receivedStart = start
        receivedEnd = end
        receivedValue = value
      })
      expect(receivedStart).toBe(5)
      expect(receivedEnd).toBe(10)
      expect(receivedValue).toBe('test')
    })

    it('iterates in sorted order', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(20, 25, 'c')
      cm.set(1, 5, 'a')
      cm.set(10, 15, 'b')
      const starts: number[] = []
      cm.forEach((start) => { starts.push(start as number) })
      expect(starts).toEqual([1, 10, 20])
    })

    it('iterates over coalesced ranges', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.set(6, 10, 'a')
      const result: Array<{ start: number; end: number }> = []
      cm.forEach((start, end) => {
        result.push({ start: start as number, end: end as number })
      })
      expect(result).toEqual([{ start: 1, end: 10 }])
    })

    it('works with complex value types', () => {
      const cm = new CoalescingMap<number, { x: number }>()
      cm.set(1, 5, { x: 10 })
      cm.forEach((_start, _end, value) => {
        expect(value.x).toBe(10)
      })
    })
  })

  describe('overlaps', () => {
    it('returns true when range overlaps existing', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(5, 10, 'a')
      expect(cm.overlaps(8, 15)).toBe(true)
    })

    it('returns true when range fully contains existing', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(5, 10, 'a')
      expect(cm.overlaps(1, 15)).toBe(true)
    })

    it('returns true when existing fully contains range', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 20, 'a')
      expect(cm.overlaps(5, 10)).toBe(true)
    })

    it('returns true for exact match', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(5, 10, 'a')
      expect(cm.overlaps(5, 10)).toBe(true)
    })

    it('returns true for single point overlap', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(5, 10, 'a')
      expect(cm.overlaps(10, 15)).toBe(true)
    })

    it('returns false for non-overlapping range', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(5, 10, 'a')
      expect(cm.overlaps(1, 4)).toBe(false)
      expect(cm.overlaps(11, 15)).toBe(false)
    })

    it('returns false for empty map', () => {
      const cm = new CoalescingMap<number, string>()
      expect(cm.overlaps(1, 10)).toBe(false)
    })

    it('returns false when start > end', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 10, 'a')
      expect(cm.overlaps(15, 5)).toBe(false)
    })

    it('returns true when range overlaps any of multiple ranges', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.set(10, 15, 'b')
      cm.set(20, 25, 'c')
      expect(cm.overlaps(12, 18)).toBe(true)
      expect(cm.overlaps(3, 8)).toBe(true)
      expect(cm.overlaps(22, 30)).toBe(true)
      expect(cm.overlaps(7, 9)).toBe(false)
    })

    it('returns true for touching at boundary', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(5, 10, 'a')
      expect(cm.overlaps(10, 10)).toBe(true)
    })

    it('returns false for adjacent non-overlapping', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(5, 10, 'a')
      expect(cm.overlaps(11, 15)).toBe(false)
    })

    it('checks all ranges', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 3, 'a')
      cm.set(100, 200, 'b')
      expect(cm.overlaps(50, 150)).toBe(true)
    })
  })

  describe('getRange', () => {
    it('returns range for key in range', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 10, 'a')
      expect(cm.getRange(5)).toEqual({ start: 1, end: 10, value: 'a' })
    })

    it('returns undefined for key not in range', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 10, 'a')
      expect(cm.getRange(15)).toBeUndefined()
    })

    it('returns undefined for empty map', () => {
      const cm = new CoalescingMap<number, string>()
      expect(cm.getRange(1)).toBeUndefined()
    })

    it('returns correct range from multiple ranges', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.set(10, 15, 'b')
      expect(cm.getRange(3)).toEqual({ start: 1, end: 5, value: 'a' })
      expect(cm.getRange(12)).toEqual({ start: 10, end: 15, value: 'b' })
    })

    it('returns coalesced range', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.set(6, 10, 'a')
      expect(cm.getRange(3)).toEqual({ start: 1, end: 10, value: 'a' })
    })

    it('returns copy not reference', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 10, 'a')
      const r = cm.getRange(5)!
      r.start = 99
      expect(cm.getRange(5)!.start).toBe(1)
    })

    it('works at range boundaries', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 10, 'a')
      expect(cm.getRange(1)).toEqual({ start: 1, end: 10, value: 'a' })
      expect(cm.getRange(10)).toEqual({ start: 1, end: 10, value: 'a' })
    })

    it('returns undefined in gap between ranges', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.set(10, 15, 'b')
      expect(cm.getRange(7)).toBeUndefined()
    })
  })

  describe('edge cases', () => {
    it('empty map operations are safe', () => {
      const cm = new CoalescingMap<number, string>()
      expect(cm.get(1)).toBeUndefined()
      expect(cm.contains(1)).toBe(false)
      expect(cm.overlaps(1, 10)).toBe(false)
      expect(cm.getRange(1)).toBeUndefined()
      expect(cm.ranges()).toEqual([])
      expect(cm.toArray()).toEqual([])
      cm.forEach(() => { expect.unreachable() })
      expect(cm.size).toBe(0)
      expect(cm.isEmpty).toBe(true)
    })

    it('single point range operations', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(5, 5, 'point')
      expect(cm.get(5)).toBe('point')
      expect(cm.contains(5)).toBe(true)
      expect(cm.size).toBe(1)
      cm.delete(5, 5)
      expect(cm.isEmpty).toBe(true)
    })

    it('point within large range', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(0, 10000, 'big')
      expect(cm.get(5000)).toBe('big')
      expect(cm.contains(5000)).toBe(true)
      expect(cm.getRange(5000)).toEqual({ start: 0, end: 10000, value: 'big' })
    })

    it('very large ranges', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(0, 1000000, 'huge')
      expect(cm.size).toBe(1)
      expect(cm.get(500000)).toBe('huge')
    })

    it('set-delete-set cycle', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 10, 'first')
      cm.delete(1, 10)
      cm.set(1, 10, 'second')
      expect(cm.get(5)).toBe('second')
      expect(cm.size).toBe(1)
    })

    it('many operations maintain consistency', () => {
      const cm = new CoalescingMap<number, string>()
      for (let i = 0; i < 100; i++) {
        cm.set(i * 10, i * 10 + 5, `val${i}`)
      }
      expect(cm.size).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(cm.get(i * 10 + 3)).toBe(`val${i}`)
      }
      cm.delete(0, 5)
      expect(cm.size).toBe(99)
      expect(cm.get(3)).toBeUndefined()
    })

    it('set same range multiple times', () => {
      const cm = new CoalescingMap<number, string>()
      for (let i = 0; i < 10; i++) {
        cm.set(1, 10, 'a')
      }
      expect(cm.size).toBe(1)
    })

    it('alternating set with different values', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 10, 'a')
      cm.set(1, 10, 'b')
      cm.set(1, 10, 'a')
      expect(cm.size).toBe(1)
      expect(cm.get(5)).toBe('a')
    })

    it('negative range boundaries', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(-100, -50, 'neg')
      expect(cm.get(-75)).toBe('neg')
      expect(cm.contains(-75)).toBe(true)
      expect(cm.contains(-49)).toBe(false)
    })

    it('range spanning zero', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(-5, 5, 'span')
      expect(cm.get(-5)).toBe('span')
      expect(cm.get(0)).toBe('span')
      expect(cm.get(5)).toBe('span')
      expect(cm.get(-6)).toBeUndefined()
      expect(cm.get(6)).toBeUndefined()
    })

    it('overlapping delete at exact boundaries', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 10, 'a')
      cm.delete(1, 5)
      expect(cm.get(5)).toBeUndefined()
      expect(cm.get(6)).toBe('a')
    })

    it('zero-width delete is no-op', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 10, 'a')
      cm.delete(20, 10)
      expect(cm.size).toBe(1)
    })

    it('delete entire range then verify empty', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 10, 'a')
      cm.delete(1, 10)
      expect(cm.ranges()).toEqual([])
      expect(cm.toArray()).toEqual([])
      expect(cm.get(5)).toBeUndefined()
      expect(cm.contains(5)).toBe(false)
    })

    it('large number of small ranges', () => {
      const cm = new CoalescingMap<number, string>()
      for (let i = 0; i < 50; i++) {
        cm.set(i * 3, i * 3 + 1, `v${i}`)
      }
      expect(cm.size).toBe(50)
    })
  })

  describe('Symbol.iterator', () => {
    it('is iterable with for-of', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.set(10, 15, 'b')
      const result: CoalescingMapRange<number, string>[] = []
      for (const entry of cm) {
        result.push(entry)
      }
      expect(result).toHaveLength(2)
    })

    it('works with spread operator', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      const arr = [...cm]
      expect(arr).toHaveLength(1)
      expect(arr[0]).toEqual({ start: 1, end: 5, value: 'a' })
    })

    it('works with Array.from', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(5, 10, 'test')
      const arr = Array.from(cm)
      expect(arr).toHaveLength(1)
      expect(arr[0]!.value).toBe('test')
    })

    it('yields nothing for empty map', () => {
      const cm = new CoalescingMap<number, string>()
      const arr = [...cm]
      expect(arr).toEqual([])
    })
  })

  describe('custom options', () => {
    it('uses custom compare function', () => {
      const cm = new CoalescingMap<number, string>({
        compare: (a, b) => a - b,
        predecessor: (k) => k - 1,
        successor: (k) => k + 1,
      })
      cm.set(1, 5, 'a')
      cm.set(6, 10, 'a')
      expect(cm.size).toBe(1)
    })

    it('works with string keys using custom comparator', () => {
      const cm = new CoalescingMap<string, string>({
        compare: (a, b) => a.localeCompare(b),
        predecessor: (k) => String.fromCharCode(k.charCodeAt(0) - 1),
        successor: (k) => String.fromCharCode(k.charCodeAt(0) + 1),
      })
      cm.set('a', 'c', 'range1')
      cm.set('d', 'f', 'range2')
      expect(cm.get('b')).toBe('range1')
      expect(cm.get('e')).toBe('range2')
      expect(cm.size).toBe(2)
    })

    it('custom options with coalescing', () => {
      const cm = new CoalescingMap<string, string>({
        compare: (a, b) => a.localeCompare(b),
        predecessor: (k) => String.fromCharCode(k.charCodeAt(0) - 1),
        successor: (k) => String.fromCharCode(k.charCodeAt(0) + 1),
      })
      cm.set('a', 'c', 'x')
      cm.set('d', 'f', 'x')
      expect(cm.size).toBe(1)
      expect(cm.ranges()).toEqual([{ start: 'a', end: 'f', value: 'x' }])
    })

    it('partial options use defaults for missing', () => {
      const cm = new CoalescingMap<number, string>({
        compare: (a, b) => a - b,
      })
      cm.set(1, 5, 'a')
      expect(cm.get(3)).toBe('a')
    })

    it('custom predecessor and successor for non-integer steps', () => {
      const cm = new CoalescingMap<number, string>({
        compare: (a, b) => a - b,
        predecessor: (k) => k - 0.5,
        successor: (k) => k + 0.5,
      })
      cm.set(1, 5, 'a')
      cm.set(5.5, 10, 'a')
      expect(cm.size).toBe(1)
      expect(cm.ranges()).toEqual([{ start: 1, end: 10, value: 'a' }])
    })

    it('custom options with delete trimming', () => {
      const cm = new CoalescingMap<number, string>({
        compare: (a, b) => a - b,
        predecessor: (k) => k - 1,
        successor: (k) => k + 1,
      })
      cm.set(1, 20, 'a')
      cm.delete(5, 10, )
      expect(cm.size).toBe(2)
    })
  })

  describe('coalescing chains', () => {
    it('chain of 5 adjacent same-value ranges coalesces', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 2, 'a')
      cm.set(3, 4, 'a')
      cm.set(5, 6, 'a')
      cm.set(7, 8, 'a')
      cm.set(9, 10, 'a')
      expect(cm.size).toBe(1)
      expect(cm.ranges()).toEqual([{ start: 1, end: 10, value: 'a' }])
    })

    it('bridging two separate chains', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.set(6, 10, 'a')
      cm.set(20, 25, 'a')
      cm.set(26, 30, 'a')
      cm.set(10, 21, 'a')
      expect(cm.size).toBe(1)
      expect(cm.ranges()).toEqual([{ start: 1, end: 30, value: 'a' }])
    })

    it('chain with different value in middle', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.set(6, 10, 'b')
      cm.set(11, 15, 'a')
      expect(cm.size).toBe(3)
    })

    it('replacing middle value coalesces sides', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.set(6, 10, 'b')
      cm.set(11, 15, 'a')
      cm.set(6, 10, 'a')
      expect(cm.size).toBe(1)
      expect(cm.ranges()).toEqual([{ start: 1, end: 15, value: 'a' }])
    })

    it('coalescing after deletion', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 20, 'a')
      cm.set(8, 12, 'b')
      cm.delete(8, 12)
      expect(cm.size).toBe(2)
      cm.set(8, 12, 'a')
      expect(cm.size).toBe(1)
      expect(cm.ranges()).toEqual([{ start: 1, end: 20, value: 'a' }])
    })
  })

  describe('type consistency', () => {
    it('preserves number type through operations', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 10, 'val')
      const val = cm.get(5)
      expect(typeof val).toBe('string')
    })

    it('works with object values', () => {
      interface Point { x: number; y: number }
      const cm = new CoalescingMap<number, Point>()
      cm.set(1, 5, { x: 10, y: 20 })
      const p = cm.get(3)!
      expect(p.x).toBe(10)
      expect(p.y).toBe(20)
    })

    it('works with number values', () => {
      const cm = new CoalescingMap<number, number>()
      cm.set(1, 5, 42)
      expect(cm.get(3)).toBe(42)
    })

    it('works with array values', () => {
      const cm = new CoalescingMap<number, number[]>()
      cm.set(1, 5, [1, 2, 3])
      expect(cm.get(3)).toEqual([1, 2, 3])
    })

    it('type info preserved in getRange', () => {
      const cm = new CoalescingMap<number, boolean>()
      cm.set(1, 10, true)
      const range = cm.getRange(5)!
      expect(typeof range.start).toBe('number')
      expect(typeof range.end).toBe('number')
      expect(typeof range.value).toBe('boolean')
    })
  })

  describe('additional coverage', () => {
    it('forEach after clear does nothing', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.clear()
      let called = false
      cm.forEach(() => { called = true })
      expect(called).toBe(false)
    })

    it('ranges returns stable order after modifications', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(10, 15, 'b')
      cm.set(1, 5, 'a')
      cm.set(20, 25, 'c')
      cm.delete(10, 15)
      const rs = cm.ranges()
      expect(rs[0]!.start).toBe(1)
      expect(rs[1]!.start).toBe(20)
    })

    it('toArray and ranges return equivalent data', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.set(10, 15, 'b')
      expect(cm.toArray()).toEqual(cm.ranges())
    })

    it('set with different value then set back', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 20, 'a')
      cm.set(5, 15, 'b')
      expect(cm.size).toBe(3)
      cm.set(5, 15, 'a')
      expect(cm.size).toBe(1)
      expect(cm.ranges()).toEqual([{ start: 1, end: 20, value: 'a' }])
    })

    it('delete then overlapping set', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 20, 'a')
      cm.delete(5, 10)
      cm.set(5, 10, 'a')
      expect(cm.size).toBe(1)
    })

    it('contains after multiple operations', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 20, 'a')
      cm.delete(5, 10)
      cm.set(15, 25, 'b')
      expect(cm.contains(3)).toBe(true)
      expect(cm.contains(7)).toBe(false)
      expect(cm.contains(15)).toBe(true)
      expect(cm.contains(22)).toBe(true)
      expect(cm.contains(30)).toBe(false)
    })

    it('overlaps after delete', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 20, 'a')
      cm.delete(5, 10)
      expect(cm.overlaps(1, 4)).toBe(true)
      expect(cm.overlaps(5, 10)).toBe(false)
      expect(cm.overlaps(11, 20)).toBe(true)
    })

    it('getRange after split', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 20, 'a')
      cm.delete(10, 10)
      expect(cm.getRange(5)).toEqual({ start: 1, end: 9, value: 'a' })
      expect(cm.getRange(15)).toEqual({ start: 11, end: 20, value: 'a' })
      expect(cm.getRange(10)).toBeUndefined()
    })

    it('iterator after modifications', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 10, 'a')
      cm.set(20, 30, 'b')
      cm.delete(5, 5)
      cm.set(15, 15, 'c')
      const arr = [...cm]
      expect(arr).toHaveLength(4)
    })

    it('stress test: many small ranges', () => {
      const cm = new CoalescingMap<number, string>()
      for (let i = 0; i < 100; i++) {
        cm.set(i, i, `v${i}`)
      }
      expect(cm.size).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(cm.get(i)).toBe(`v${i}`)
      }
    })

    it('stress test: coalesce all into one', () => {
      const cm = new CoalescingMap<number, string>()
      for (let i = 0; i < 100; i++) {
        cm.set(i * 2, i * 2, 'a')
      }
      expect(cm.size).toBe(100)
      cm.set(0, 199, 'a')
      expect(cm.size).toBe(1)
      expect(cm.ranges()).toEqual([{ start: 0, end: 199, value: 'a' }])
    })

    it('stress test: alternating pattern', () => {
      const cm = new CoalescingMap<number, string>()
      for (let i = 0; i < 50; i++) {
        cm.set(i * 2, i * 2, i % 2 === 0 ? 'a' : 'b')
      }
      expect(cm.size).toBe(50)
    })

    it('complex multi-value scenario', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 50, 'a')
      cm.set(10, 20, 'b')
      cm.set(30, 40, 'c')
      expect(cm.size).toBe(5)
      cm.set(5, 45, 'a')
      expect(cm.size).toBe(1)
      expect(cm.ranges()).toEqual([{ start: 1, end: 50, value: 'a' }])
    })

    it('delete exact boundaries of split range', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 20, 'a')
      cm.delete(8, 12)
      cm.delete(1, 7)
      cm.delete(13, 20)
      expect(cm.isEmpty).toBe(true)
    })

    it('set adjacent after delete creates coalescing opportunity', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 20, 'a')
      cm.delete(8, 12)
      expect(cm.size).toBe(2)
      cm.set(8, 12, 'a')
      expect(cm.size).toBe(1)
    })

    it('custom options type inference', () => {
      const opts: CoalescingMapOptions<number> = {
        compare: (a, b) => a - b,
        predecessor: (k) => k - 1,
        successor: (k) => k + 1,
      }
      const cm = new CoalescingMap<number, string>(opts)
      cm.set(1, 5, 'a')
      expect(cm.get(3)).toBe('a')
    })

    it('imported range type works', () => {
      const range: CoalescingMapRange<number, string> = {
        start: 1,
        end: 5,
        value: 'test',
      }
      expect(range.start).toBe(1)
      expect(range.end).toBe(5)
      expect(range.value).toBe('test')
    })

    it('get after coalescing and deletion', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.set(6, 10, 'a')
      cm.delete(3, 8)
      expect(cm.get(2)).toBe('a')
      expect(cm.get(5)).toBeUndefined()
      expect(cm.get(9)).toBe('a')
    })

    it('size tracks correctly through complex operations', () => {
      const cm = new CoalescingMap<number, string>()
      expect(cm.size).toBe(0)
      cm.set(1, 10, 'a')
      expect(cm.size).toBe(1)
      cm.set(5, 15, 'b')
      expect(cm.size).toBe(2)
      cm.delete(1, 2)
      expect(cm.size).toBe(2)
      cm.delete(12, 15)
      expect(cm.size).toBe(2)
      cm.set(1, 20, 'c')
      expect(cm.size).toBe(1)
      cm.clear()
      expect(cm.size).toBe(0)
    })

    it('contains edge at boundaries after delete', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 10, 'a')
      cm.delete(5, 5)
      expect(cm.contains(4)).toBe(true)
      expect(cm.contains(5)).toBe(false)
      expect(cm.contains(6)).toBe(true)
    })

    it('overlaps with multiple ranges simultaneously', () => {
      const cm = new CoalescingMap<number, string>()
      cm.set(1, 5, 'a')
      cm.set(10, 15, 'b')
      cm.set(20, 25, 'c')
      expect(cm.overlaps(3, 22)).toBe(true)
    })

    it('forEach receives all arguments correctly with object values', () => {
      const cm = new CoalescingMap<number, { id: number }>()
      cm.set(1, 5, { id: 42 })
      let receivedStart: number | undefined
      let receivedEnd: number | undefined
      let receivedValue: { id: number } | undefined
      cm.forEach((s, e, v) => {
        receivedStart = s as number
        receivedEnd = e as number
        receivedValue = v
      })
      expect(receivedStart).toBe(1)
      expect(receivedEnd).toBe(5)
      expect(receivedValue!.id).toBe(42)
    })
  })
})
