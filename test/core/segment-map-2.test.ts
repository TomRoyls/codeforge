import { describe, it, expect } from 'vitest'
import { SegmentMap2 } from '../../src/core/segment-map-2/index.js'

describe('SegmentMap2', () => {

  // ─── Constructor / Initial state ───

  describe('initial state', () => {
    it('should start empty', () => {
      const map = new SegmentMap2<string>()
      expect(map.size).toBe(0)
    })

    it('should return undefined for get on empty map', () => {
      const map = new SegmentMap2<string>()
      expect(map.get(5)).toBeUndefined()
    })

    it('should return empty array for getRange on empty map', () => {
      const map = new SegmentMap2<string>()
      expect(map.getRange(0, 10)).toEqual([])
    })
  })

  // ─── set ───

  describe('set', () => {
    it('should insert a single segment', () => {
      const map = new SegmentMap2<string>()
      map.set(0, 5, 'a')
      expect(map.size).toBe(1)
    })

    it('should ignore segments where start >= end', () => {
      const map = new SegmentMap2<string>()
      map.set(5, 5, 'a')
      expect(map.size).toBe(0)
      map.set(6, 3, 'b')
      expect(map.size).toBe(0)
    })

    it('should store multiple non-overlapping segments', () => {
      const map = new SegmentMap2<string>()
      map.set(0, 5, 'a')
      map.set(10, 15, 'b')
      map.set(20, 25, 'c')
      expect(map.size).toBe(3)
    })

    it('should handle overlapping set by replacing', () => {
      const map = new SegmentMap2<string>()
      map.set(0, 10, 'a')
      map.set(3, 7, 'b')
      expect(map.get(5)).toBe('b')
    })

    it('should handle single-point-width segment', () => {
      const map = new SegmentMap2<string>()
      map.set(0, 1, 'x')
      expect(map.get(0)).toBe('x')
      expect(map.get(1)).toBeUndefined()
    })
  })

  // ─── get ───

  describe('get', () => {
    it('should return value for point within segment', () => {
      const map = new SegmentMap2<string>()
      map.set(0, 10, 'a')
      expect(map.get(0)).toBe('a')
      expect(map.get(5)).toBe('a')
      expect(map.get(9)).toBe('a')
    })

    it('should return undefined for point outside all segments', () => {
      const map = new SegmentMap2<string>()
      map.set(0, 10, 'a')
      expect(map.get(10)).toBeUndefined()
      expect(map.get(-1)).toBeUndefined()
      expect(map.get(100)).toBeUndefined()
    })

    it('should find value in correct segment among multiple', () => {
      const map = new SegmentMap2<string>()
      map.set(0, 5, 'a')
      map.set(10, 15, 'b')
      expect(map.get(2)).toBe('a')
      expect(map.get(12)).toBe('b')
      expect(map.get(7)).toBeUndefined()
    })

    it('should use half-open interval [start, end)', () => {
      const map = new SegmentMap2<string>()
      map.set(0, 5, 'a')
      expect(map.get(0)).toBe('a')
      expect(map.get(4)).toBe('a')
      expect(map.get(5)).toBeUndefined()
    })
  })

  // ─── getRange ───

  describe('getRange', () => {
    it('should return segments overlapping with range', () => {
      const map = new SegmentMap2<string>()
      map.set(0, 10, 'a')
      map.set(20, 30, 'b')
      const result = map.getRange(5, 25)
      expect(result).toHaveLength(2)
      expect(result[0]!.value).toBe('a')
      expect(result[1]!.value).toBe('b')
    })

    it('should return empty array when no segments overlap', () => {
      const map = new SegmentMap2<string>()
      map.set(0, 5, 'a')
      map.set(10, 15, 'b')
      expect(map.getRange(6, 9)).toEqual([])
    })

    it('should return segment that fully contains the range', () => {
      const map = new SegmentMap2<string>()
      map.set(0, 100, 'big')
      const result = map.getRange(20, 30)
      expect(result).toHaveLength(1)
      expect(result[0]!.value).toBe('big')
    })
  })

  // ─── delete ───

  describe('delete', () => {
    it('should remove a segment', () => {
      const map = new SegmentMap2<string>()
      map.set(0, 10, 'a')
      map.delete(0, 10)
      expect(map.get(5)).toBeUndefined()
    })

    it('should split a segment when deleting middle portion', () => {
      const map = new SegmentMap2<string>()
      map.set(0, 20, 'a')
      map.delete(5, 15)
      expect(map.get(2)).toBe('a')
      expect(map.get(10)).toBeUndefined()
      expect(map.get(17)).toBe('a')
    })

    it('should trim a segment from the left', () => {
      const map = new SegmentMap2<string>()
      map.set(0, 10, 'a')
      map.delete(0, 5)
      expect(map.get(2)).toBeUndefined()
      expect(map.get(7)).toBe('a')
    })

    it('should trim a segment from the right', () => {
      const map = new SegmentMap2<string>()
      map.set(0, 10, 'a')
      map.delete(5, 10)
      expect(map.get(3)).toBe('a')
      expect(map.get(7)).toBeUndefined()
    })

    it('should handle delete on empty map', () => {
      const map = new SegmentMap2<string>()
      map.delete(0, 10)
      expect(map.size).toBe(0)
    })

    it('should handle delete with no overlapping segments', () => {
      const map = new SegmentMap2<string>()
      map.set(0, 5, 'a')
      map.delete(10, 20)
      expect(map.size).toBe(1)
      expect(map.get(2)).toBe('a')
    })

    it('should remove multiple overlapping segments', () => {
      const map = new SegmentMap2<string>()
      map.set(0, 5, 'a')
      map.set(5, 10, 'b')
      map.set(10, 15, 'c')
      map.delete(3, 12)
      expect(map.get(1)).toBe('a')
      expect(map.get(4)).toBeUndefined()
      expect(map.get(7)).toBeUndefined()
      expect(map.get(13)).toBe('c')
    })
  })

  // ─── clear ───

  describe('clear', () => {
    it('should clear all segments', () => {
      const map = new SegmentMap2<string>()
      map.set(0, 10, 'a')
      map.set(20, 30, 'b')
      map.clear()
      expect(map.size).toBe(0)
      expect(map.get(5)).toBeUndefined()
    })

    it('should allow set after clear', () => {
      const map = new SegmentMap2<string>()
      map.set(0, 10, 'a')
      map.clear()
      map.set(5, 15, 'b')
      expect(map.get(7)).toBe('b')
      expect(map.size).toBe(1)
    })
  })

  // ─── size ───

  describe('size', () => {
    it('should track size correctly', () => {
      const map = new SegmentMap2<string>()
      expect(map.size).toBe(0)
      map.set(0, 5, 'a')
      expect(map.size).toBe(1)
      map.set(10, 15, 'b')
      expect(map.size).toBe(2)
    })

    it('should update size after delete', () => {
      const map = new SegmentMap2<string>()
      map.set(0, 5, 'a')
      map.set(10, 15, 'b')
      map.delete(0, 5)
      expect(map.size).toBe(1)
    })
  })

  // ─── Edge cases ───

  describe('edge cases', () => {
    it('should handle negative ranges', () => {
      const map = new SegmentMap2<string>()
      map.set(-10, -5, 'neg')
      expect(map.get(-7)).toBe('neg')
      expect(map.get(-3)).toBeUndefined()
    })

    it('should handle adjacent non-overlapping segments', () => {
      const map = new SegmentMap2<string>()
      map.set(0, 5, 'a')
      map.set(5, 10, 'b')
      expect(map.get(4)).toBe('a')
      expect(map.get(5)).toBe('b')
      expect(map.size).toBe(2)
    })

    it('should handle overwrite with overlapping set', () => {
      const map = new SegmentMap2<string>()
      map.set(0, 10, 'old')
      map.set(0, 10, 'new')
      expect(map.get(5)).toBe('new')
    })

    it('should handle numeric values', () => {
      const map = new SegmentMap2<number>()
      map.set(0, 5, 100)
      map.set(10, 15, 200)
      expect(map.get(2)).toBe(100)
      expect(map.get(12)).toBe(200)
    })
  })
})
