import { describe, it, expect } from 'vitest'
import { clamp, clampPercent, clamp01, roundTo } from '../../src/utils/math-helpers.js'

describe('math-helpers', () => {
  // ─── clamp ───

  describe('clamp', () => {
    it('returns value when within range', () => {
      expect(clamp(5, 0, 10)).toBe(5)
    })

    it('returns min when value is below range', () => {
      expect(clamp(-5, 0, 10)).toBe(0)
    })

    it('returns max when value is above range', () => {
      expect(clamp(15, 0, 10)).toBe(10)
    })

    it('returns value when equal to min', () => {
      expect(clamp(0, 0, 10)).toBe(0)
    })

    it('returns value when equal to max', () => {
      expect(clamp(10, 0, 10)).toBe(10)
    })

    it('works with negative ranges', () => {
      expect(clamp(-5, -10, -1)).toBe(-5)
      expect(clamp(-15, -10, -1)).toBe(-10)
      expect(clamp(0, -10, -1)).toBe(-1)
    })

    it('works with floating point values', () => {
      expect(clamp(0.5, 0, 1)).toBe(0.5)
      expect(clamp(-0.1, 0, 1)).toBe(0)
      expect(clamp(1.1, 0, 1)).toBe(1)
    })

    it('works when min equals max', () => {
      expect(clamp(5, 3, 3)).toBe(3)
      expect(clamp(1, 3, 3)).toBe(3)
    })
  })

  // ─── clampPercent ───

  describe('clampPercent', () => {
    it('returns value when within 0-100', () => {
      expect(clampPercent(50)).toBe(50)
    })

    it('returns 0 for negative values', () => {
      expect(clampPercent(-10)).toBe(0)
    })

    it('returns 100 for values above 100', () => {
      expect(clampPercent(150)).toBe(100)
    })

    it('handles edge cases', () => {
      expect(clampPercent(0)).toBe(0)
      expect(clampPercent(100)).toBe(100)
    })

    it('handles floating point', () => {
      expect(clampPercent(99.99)).toBe(99.99)
    })
  })

  // ─── clamp01 ───

  describe('clamp01', () => {
    it('returns value when within 0-1', () => {
      expect(clamp01(0.5)).toBe(0.5)
    })

    it('returns 0 for negative values', () => {
      expect(clamp01(-0.5)).toBe(0)
    })

    it('returns 1 for values above 1', () => {
      expect(clamp01(1.5)).toBe(1)
    })

    it('handles edge cases', () => {
      expect(clamp01(0)).toBe(0)
      expect(clamp01(1)).toBe(1)
    })
  })

  // ─── roundTo ───

  describe('roundTo', () => {
    it('rounds to 2 decimal places', () => {
      expect(roundTo(3.14159, 2)).toBe(3.14)
    })

    it('rounds to 0 decimal places', () => {
      expect(roundTo(3.7, 0)).toBe(4)
    })

    it('rounds to 1 decimal place', () => {
      expect(roundTo(3.45, 1)).toBe(3.5)
    })

    it('rounds to 4 decimal places', () => {
      expect(roundTo(3.14159, 4)).toBe(3.1416)
    })

    it('handles negative numbers', () => {
      expect(roundTo(-3.14159, 2)).toBe(-3.14)
    })

    it('handles already rounded values', () => {
      expect(roundTo(3.14, 2)).toBe(3.14)
    })

    it('handles zero', () => {
      expect(roundTo(0, 2)).toBe(0)
    })

    it('handles whole numbers', () => {
      expect(roundTo(5, 2)).toBe(5)
    })
  })
})
