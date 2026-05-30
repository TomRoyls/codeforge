import { describe, expect, it } from 'vitest'
import { LineSweep } from '../../src/utils/line-sweep.js'

describe('LineSweep', () => {
  describe('countOverlappingIntervals', () => {
    it('returns 0 for no intervals', () => {
      expect(LineSweep.countOverlappingIntervals([])).toBe(0)
    })

    it('returns 1 for single interval', () => {
      expect(LineSweep.countOverlappingIntervals([{ start: 0, end: 5 }])).toBe(1)
    })

    it('counts overlapping intervals', () => {
      expect(LineSweep.countOverlappingIntervals([
        { start: 0, end: 5 },
        { start: 3, end: 8 },
      ])).toBe(2)
    })

    it('counts triple overlap', () => {
      expect(LineSweep.countOverlappingIntervals([
        { start: 0, end: 10 },
        { start: 3, end: 7 },
        { start: 5, end: 12 },
      ])).toBe(3)
    })

    it('returns 1 for non-overlapping', () => {
      expect(LineSweep.countOverlappingIntervals([
        { start: 0, end: 3 },
        { start: 5, end: 8 },
      ])).toBe(1)
    })

    it('handles touching intervals', () => {
      expect(LineSweep.countOverlappingIntervals([
        { start: 0, end: 5 },
        { start: 6, end: 10 },
      ])).toBe(1)
    })
  })

  describe('findOverlapPoints', () => {
    it('returns map of overlap counts at each point', () => {
      const result = LineSweep.findOverlapPoints([
        { start: 0, end: 5 },
        { start: 3, end: 8 },
      ])
      expect(result.size).toBeGreaterThan(0)
    })

    it('returns empty map for no intervals', () => {
      expect(LineSweep.findOverlapPoints([]).size).toBe(0)
    })
  })

  describe('mergeIntervals', () => {
    it('merges overlapping intervals', () => {
      const result = LineSweep.mergeIntervals([
        { start: 1, end: 3 },
        { start: 2, end: 6 },
        { start: 8, end: 10 },
      ])
      expect(result).toEqual([{ start: 1, end: 6 }, { start: 8, end: 10 }])
    })

    it('returns single interval unchanged', () => {
      expect(LineSweep.mergeIntervals([{ start: 1, end: 5 }])).toEqual([{ start: 1, end: 5 }])
    })

    it('returns empty for empty input', () => {
      expect(LineSweep.mergeIntervals([])).toEqual([])
    })

    it('does not merge non-overlapping', () => {
      const result = LineSweep.mergeIntervals([
        { start: 1, end: 3 },
        { start: 5, end: 7 },
      ])
      expect(result).toEqual([{ start: 1, end: 3 }, { start: 5, end: 7 }])
    })

    it('merges touching intervals', () => {
      const result = LineSweep.mergeIntervals([
        { start: 1, end: 3 },
        { start: 4, end: 6 },
      ])
      expect(result.length).toBe(2)
    })

    it('merges contained intervals', () => {
      const result = LineSweep.mergeIntervals([
        { start: 1, end: 10 },
        { start: 3, end: 5 },
      ])
      expect(result).toEqual([{ start: 1, end: 10 }])
    })
  })

  describe('totalCoveredLength', () => {
    it('computes covered length', () => {
      expect(LineSweep.totalCoveredLength([{ start: 0, end: 5 }])).toBe(6)
    })

    it('handles overlapping intervals', () => {
      expect(LineSweep.totalCoveredLength([
        { start: 0, end: 5 },
        { start: 3, end: 8 },
      ])).toBe(9)
    })

    it('returns 0 for empty', () => {
      expect(LineSweep.totalCoveredLength([])).toBe(0)
    })
  })
})
