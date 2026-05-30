import { describe, test, expect } from 'vitest'
import { clamp, clampPercent, clamp01, roundTo } from '../../../src/utils/math-helpers.js'

describe('clamp', () => {
  test('clamps value within range', () => {
    expect(clamp(50, 0, 100)).toBe(50)
  })

  test('returns min when value is below min', () => {
    expect(clamp(-10, 0, 100)).toBe(0)
    expect(clamp(-50, 0, 100)).toBe(0)
  })

  test('returns max when value is above max', () => {
    expect(clamp(150, 0, 100)).toBe(100)
    expect(clamp(200, 0, 100)).toBe(100)
  })

  test('returns min when value equals min', () => {
    expect(clamp(0, 0, 100)).toBe(0)
  })

  test('returns max when value equals max', () => {
    expect(clamp(100, 0, 100)).toBe(100)
  })

  test('handles min equals max', () => {
    expect(clamp(5, 10, 10)).toBe(10)
    expect(clamp(10, 10, 10)).toBe(10)
    expect(clamp(15, 10, 10)).toBe(10)
  })

  test('handles negative ranges', () => {
    expect(clamp(0, -50, -10)).toBe(-10)
    expect(clamp(-30, -50, -10)).toBe(-30)
    expect(clamp(-100, -50, -10)).toBe(-50)
  })

  test('handles decimal values', () => {
    expect(clamp(0.5, 0, 1)).toBe(0.5)
    expect(clamp(1.5, 0, 1)).toBe(1)
    expect(clamp(-0.5, 0, 1)).toBe(0)
  })

  test('handles mixed positive and negative ranges', () => {
    expect(clamp(0, -100, 100)).toBe(0)
    expect(clamp(50, -100, 100)).toBe(50)
    expect(clamp(-50, -100, 100)).toBe(-50)
    expect(clamp(150, -100, 100)).toBe(100)
    expect(clamp(-150, -100, 100)).toBe(-100)
  })

  test('handles very large values', () => {
    expect(clamp(1_000_000, 0, 100)).toBe(100)
    expect(clamp(-1_000_000, 0, 100)).toBe(0)
  })

  test('handles very small decimal values', () => {
    expect(clamp(0.0001, 0, 0.001)).toBe(0.0001)
    expect(clamp(0.002, 0, 0.001)).toBe(0.001)
  })
})

describe('clampPercent', () => {
  test('clamps 50 to 50', () => {
    expect(clampPercent(50)).toBe(50)
  })

  test('clamps 0 to 0', () => {
    expect(clampPercent(0)).toBe(0)
  })

  test('clamps 100 to 100', () => {
    expect(clampPercent(100)).toBe(100)
  })

  test('clamps -10 to 0', () => {
    expect(clampPercent(-10)).toBe(0)
  })

  test('clamps 110 to 100', () => {
    expect(clampPercent(110)).toBe(100)
  })

  test('clamps negative values to 0', () => {
    expect(clampPercent(-1)).toBe(0)
    expect(clampPercent(-50)).toBe(0)
    expect(clampPercent(-100)).toBe(0)
  })

  test('clamps values above 100 to 100', () => {
    expect(clampPercent(101)).toBe(100)
    expect(clampPercent(150)).toBe(100)
    expect(clampPercent(200)).toBe(100)
  })

  test('handles decimal values', () => {
    expect(clampPercent(50.5)).toBe(50.5)
    expect(clampPercent(99.9)).toBe(99.9)
    expect(clampPercent(0.1)).toBe(0.1)
  })

  test('handles edge case decimal clamping', () => {
    expect(clampPercent(100.1)).toBe(100)
    expect(clampPercent(-0.1)).toBe(0)
  })

  test('handles very large positive values', () => {
    expect(clampPercent(1_000_000)).toBe(100)
  })

  test('handles very large negative values', () => {
    expect(clampPercent(-1_000_000)).toBe(0)
  })
})

describe('clamp01', () => {
  test('clamps 0.5 to 0.5', () => {
    expect(clamp01(0.5)).toBe(0.5)
  })

  test('clamps 0 to 0', () => {
    expect(clamp01(0)).toBe(0)
  })

  test('clamps 1 to 1', () => {
    expect(clamp01(1)).toBe(1)
  })

  test('clamps -0.5 to 0', () => {
    expect(clamp01(-0.5)).toBe(0)
  })

  test('clamps 1.5 to 1', () => {
    expect(clamp01(1.5)).toBe(1)
  })

  test('clamps negative values to 0', () => {
    expect(clamp01(-0.1)).toBe(0)
    expect(clamp01(-0.5)).toBe(0)
    expect(clamp01(-1)).toBe(0)
    expect(clamp01(-10)).toBe(0)
  })

  test('clamps values above 1 to 1', () => {
    expect(clamp01(1.1)).toBe(1)
    expect(clamp01(1.5)).toBe(1)
    expect(clamp01(2)).toBe(1)
    expect(clamp01(10)).toBe(1)
  })

  test('handles small decimal values', () => {
    expect(clamp01(0.001)).toBe(0.001)
    expect(clamp01(0.01)).toBe(0.01)
    expect(clamp01(0.1)).toBe(0.1)
  })

  test('handles decimal values close to boundaries', () => {
    expect(clamp01(0.999)).toBe(0.999)
    expect(clamp01(0.001)).toBe(0.001)
    expect(clamp01(1.001)).toBe(1)
    expect(clamp01(-0.001)).toBe(0)
  })

  test('handles very small positive values', () => {
    expect(clamp01(0.0001)).toBe(0.0001)
  })

  test('handles extremely large values', () => {
    expect(clamp01(1_000_000)).toBe(1)
  })

  test('handles extremely negative values', () => {
    expect(clamp01(-1_000_000)).toBe(0)
  })
})

describe('roundTo', () => {
  test('rounds to 0 decimals (integer)', () => {
    expect(roundTo(3.14159, 0)).toBe(3)
    expect(roundTo(3.5, 0)).toBe(4)
    expect(roundTo(3.499, 0)).toBe(3)
  })

  test('rounds to 1 decimal place', () => {
    expect(roundTo(3.14159, 1)).toBe(3.1)
    expect(roundTo(3.15, 1)).toBe(3.2)
    expect(roundTo(3.149, 1)).toBe(3.1)
  })

  test('rounds to 2 decimal places', () => {
    expect(roundTo(3.14159, 2)).toBe(3.14)
    expect(roundTo(3.145, 2)).toBe(3.15)
    expect(roundTo(3.1449, 2)).toBe(3.14)
  })

  test('rounds to 3 decimal places', () => {
    expect(roundTo(3.14159, 3)).toBe(3.142)
    expect(roundTo(3.1415, 3)).toBe(3.142)
    expect(roundTo(3.1414, 3)).toBe(3.141)
  })

  test('handles negative decimals (rounds to larger units)', () => {
    expect(roundTo(123, -1)).toBe(120)
    expect(roundTo(125, -1)).toBe(130)
    expect(roundTo(1234, -2)).toBe(1200)
    expect(roundTo(1250, -2)).toBe(1300)
  })

  test('handles negative numbers', () => {
    expect(roundTo(-3.14159, 2)).toBe(-3.14)
    expect(roundTo(-3.5, 0)).toBe(-3)
    expect(roundTo(-3.4, 0)).toBe(-3)
  })

  test('handles zero', () => {
    expect(roundTo(0, 0)).toBe(0)
    expect(roundTo(0, 2)).toBe(0)
    expect(roundTo(0, -1)).toBe(0)
  })

  test('handles rounding at exactly 5', () => {
    expect(roundTo(2.5, 0)).toBe(3)
    expect(roundTo(1.25, 1)).toBe(1.3)
    expect(roundTo(1.125, 2)).toBe(1.13)
  })

  test('handles very small decimal precision', () => {
    expect(roundTo(0.123456789, 5)).toBe(0.12346)
  })

  test('handles very large numbers', () => {
    expect(roundTo(1234567.89, 0)).toBe(1234568)
    expect(roundTo(1234567.89, 2)).toBe(1234567.89)
  })

  test('handles very large negative decimals', () => {
    expect(roundTo(12345, -3)).toBe(12000)
    expect(roundTo(15500, -3)).toBe(16000)
  })

  test('handles values that become zero with high precision', () => {
    expect(roundTo(0.0001, 3)).toBe(0)
    expect(roundTo(0.0009, 3)).toBe(0.001)
  })

  test('rounds to 4 decimal places', () => {
    expect(roundTo(3.14159, 4)).toBe(3.1416)
    expect(roundTo(3.14154, 4)).toBe(3.1415)
  })

  test('rounds to 5 decimal places', () => {
    expect(roundTo(3.141592, 5)).toBe(3.14159)
    expect(roundTo(3.141593, 5)).toBe(3.14159)
  })

  test('handles floating point precision edge cases', () => {
    expect(roundTo(0.1 + 0.2, 1)).toBe(0.3)
    expect(roundTo(1.005, 2)).toBe(1.0)
  })

  test('rounds numbers just above threshold', () => {
    expect(roundTo(3.9999, 3)).toBe(4)
    expect(roundTo(3.99949, 3)).toBe(3.999)
  })

  test('rounds numbers just below threshold', () => {
    expect(roundTo(3.0001, 3)).toBe(3)
    expect(roundTo(3.00051, 3)).toBe(3.001)
  })
})