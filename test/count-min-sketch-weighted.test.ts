import { describe, it, expect } from 'vitest'
import { CountMinSketchWeighted } from '../src/utils/count-min-sketch-weighted.js'

describe('CountMinSketchWeighted', () => {
  describe('constructor', () => {
    it('creates sketch with given dimensions', () => {
      const cms = new CountMinSketchWeighted(100, 5)
      expect(cms.width).toBe(100)
      expect(cms.depth).toBe(5)
      expect(cms.total).toBe(0)
    })

    it('throws for invalid dimensions', () => {
      expect(() => new CountMinSketchWeighted(0, 5)).toThrow(RangeError)
      expect(() => new CountMinSketchWeighted(100, 0)).toThrow(RangeError)
    })
  })

  describe('withAccuracy', () => {
    it('creates sketch from accuracy parameters', () => {
      const cms = CountMinSketchWeighted.withAccuracy(0.01, 0.01)
      expect(cms.width).toBeGreaterThan(0)
      expect(cms.depth).toBeGreaterThan(0)
    })

    it('throws for invalid parameters', () => {
      expect(() => CountMinSketchWeighted.withAccuracy(0, 0.01)).toThrow(RangeError)
      expect(() => CountMinSketchWeighted.withAccuracy(0.01, 0)).toThrow(RangeError)
      expect(() => CountMinSketchWeighted.withAccuracy(1, 0.01)).toThrow(RangeError)
    })
  })

  describe('add and count', () => {
    it('counts single item', () => {
      const cms = new CountMinSketchWeighted(100, 5)
      cms.add('hello')
      expect(cms.count('hello')).toBe(1)
    })

    it('counts with weight', () => {
      const cms = new CountMinSketchWeighted(100, 5)
      cms.add('hello', 10)
      expect(cms.count('hello')).toBe(10)
    })

    it('returns 0 for unseen item', () => {
      const cms = new CountMinSketchWeighted(100, 5)
      cms.add('hello')
      expect(cms.count('world')).toBe(0)
    })

    it('accumulates multiple adds', () => {
      const cms = new CountMinSketchWeighted(100, 5)
      cms.add('hello')
      cms.add('hello')
      cms.add('hello')
      expect(cms.count('hello')).toBe(3)
    })

    it('throws for negative count', () => {
      const cms = new CountMinSketchWeighted(100, 5)
      expect(() => cms.add('hello', -1)).toThrow(RangeError)
    })

    it('tracks total count', () => {
      const cms = new CountMinSketchWeighted(100, 5)
      cms.add('a', 3)
      cms.add('b', 7)
      expect(cms.total).toBe(10)
    })
  })

  describe('heavyHitters', () => {
    it('finds heavy hitters above threshold', () => {
      const cms = new CountMinSketchWeighted(1000, 5)
      cms.add('rare', 1)
      cms.add('common', 50)
      cms.add('very-common', 100)
      const hitters = cms.heavyHitters(0.1)
      expect(hitters).toContain('very-common')
      expect(hitters).toContain('common')
      expect(hitters).not.toContain('rare')
    })

    it('returns empty for threshold above all items', () => {
      const cms = new CountMinSketchWeighted(100, 5)
      cms.add('a', 5)
      cms.add('b', 5)
      const hitters = cms.heavyHitters(0.99)
      expect(hitters).toEqual([])
    })

    it('throws for invalid threshold', () => {
      const cms = new CountMinSketchWeighted(100, 5)
      expect(() => cms.heavyHitters(-0.1)).toThrow(RangeError)
      expect(() => cms.heavyHitters(1.1)).toThrow(RangeError)
    })
  })

  describe('merge', () => {
    it('merges two sketches', () => {
      const cms1 = new CountMinSketchWeighted(100, 5)
      const cms2 = new CountMinSketchWeighted(100, 5)
      cms1.add('hello', 5)
      cms2.add('hello', 3)
      cms2.add('world', 10)
      const merged = cms1.merge(cms2)
      expect(merged.total).toBe(18)
      expect(merged.count('hello')).toBeGreaterThanOrEqual(8)
    })

    it('throws for mismatched dimensions', () => {
      const cms1 = new CountMinSketchWeighted(100, 5)
      const cms2 = new CountMinSketchWeighted(200, 5)
      expect(() => cms1.merge(cms2)).toThrow()
    })
  })

  describe('errorBound and confidence', () => {
    it('returns error bound', () => {
      const cms = new CountMinSketchWeighted(100, 5)
      expect(cms.errorBound()).toBe(0)
      cms.add('item', 100)
      expect(cms.errorBound()).toBe(1)
    })

    it('returns confidence', () => {
      const cms = new CountMinSketchWeighted(100, 5)
      expect(cms.confidence()).toBeGreaterThan(0.9)
      expect(cms.confidence()).toBeLessThan(1)
    })
  })
})
