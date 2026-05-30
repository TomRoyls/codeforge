import { describe, it, expect } from 'vitest'
import { clamp, clampPercent, clamp01, roundTo } from '../src/utils/math-helpers.js'

describe('math-helpers', () => {
  describe('clamp', () => {
    it('returns value within range', () => {
      expect(clamp(5, 0, 10)).toBe(5)
    })

    it('clamps to min', () => {
      expect(clamp(-5, 0, 10)).toBe(0)
    })

    it('clamps to max', () => {
      expect(clamp(15, 0, 10)).toBe(10)
    })

    it('handles negative range', () => {
      expect(clamp(0, -10, -5)).toBe(-5)
    })

    it('handles equal min/max', () => {
      expect(clamp(100, 5, 5)).toBe(5)
    })
  })

  describe('clampPercent', () => {
    it('returns value within 0-100', () => {
      expect(clampPercent(50)).toBe(50)
    })

    it('clamps negative to 0', () => {
      expect(clampPercent(-10)).toBe(0)
    })

    it('clamps over 100', () => {
      expect(clampPercent(150)).toBe(100)
    })

    it('handles boundary values', () => {
      expect(clampPercent(0)).toBe(0)
      expect(clampPercent(100)).toBe(100)
    })
  })

  describe('clamp01', () => {
    it('returns value within 0-1', () => {
      expect(clamp01(0.5)).toBe(0.5)
    })

    it('clamps negative to 0', () => {
      expect(clamp01(-0.5)).toBe(0)
    })

    it('clamps over 1', () => {
      expect(clamp01(1.5)).toBe(1)
    })

    it('handles boundary values', () => {
      expect(clamp01(0)).toBe(0)
      expect(clamp01(1)).toBe(1)
    })
  })

  describe('roundTo', () => {
    it('rounds to 2 decimals', () => {
      expect(roundTo(3.14159, 2)).toBe(3.14)
    })

    it('rounds to 0 decimals', () => {
      expect(roundTo(3.7, 0)).toBe(4)
    })

    it('rounds to 4 decimals', () => {
      expect(roundTo(3.14159265, 4)).toBe(3.1416)
    })

    it('handles negative decimals', () => {
      expect(roundTo(1234, -2)).toBe(1200)
    })

    it('handles zero', () => {
      expect(roundTo(0, 2)).toBe(0)
    })

    it('handles negative numbers', () => {
      expect(roundTo(-3.146, 2)).toBe(-3.15)
    })
  })
})
