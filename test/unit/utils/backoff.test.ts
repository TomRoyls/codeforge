import { describe, expect, it } from 'vitest'

import { calculateBackoff, calculateUniformBackoff } from '../../../src/utils/backoff.js'

describe('calculateBackoff', () => {
  it('validates attempt >= 0', () => {
    expect(() => calculateBackoff(-1, 100)).toThrow(RangeError)
  })

  it('validates baseDelayMs >= 1', () => {
    expect(() => calculateBackoff(0, 0)).toThrow(RangeError)
  })

  it('validates maxDelayMs >= baseDelayMs', () => {
    expect(() => calculateBackoff(0, 100, 50)).toThrow(RangeError)
  })

  it('returns a number within valid range for full jitter', () => {
    const result = calculateBackoff(0, 100, 10000, 'full')
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('increases delay with higher attempts for full jitter', () => {
    const results = Array.from({ length: 100 }, () => calculateBackoff(5, 100, 30000, 'full'))
    const maxResult = Math.max(...results)
    expect(maxResult).toBeGreaterThan(100)
  })

  it('respects maxDelayMs cap', () => {
    for (let i = 0; i < 50; i++) {
      const result = calculateBackoff(20, 100, 500, 'full')
      expect(result).toBeLessThanOrEqual(500)
    }
  })

  it('returns a number for equal jitter', () => {
    const result = calculateBackoff(0, 100, 10000, 'equal')
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('returns a number for decorrelating jitter', () => {
    const result = calculateBackoff(0, 100, 10000, 'decorrelating')
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(10000)
  })

  it('attempt 0 with baseDelayMs returns non-negative for all jitter types', () => {
    for (const jitter of ['full', 'equal', 'decorrelating'] as const) {
      const result = calculateBackoff(0, 100, 30000, jitter)
      expect(result).toBeGreaterThanOrEqual(0)
    }
  })
})

describe('calculateUniformBackoff', () => {
  it('returns baseDelayMs for attempt 0', () => {
    expect(calculateUniformBackoff(0, 100)).toBe(100)
  })

  it('doubles delay for each attempt', () => {
    expect(calculateUniformBackoff(1, 100)).toBe(200)
    expect(calculateUniformBackoff(2, 100)).toBe(400)
    expect(calculateUniformBackoff(3, 100)).toBe(800)
  })

  it('respects maxDelayMs', () => {
    expect(calculateUniformBackoff(10, 100, 1000)).toBe(1000)
  })

  it('handles baseDelayMs = 1', () => {
    expect(calculateUniformBackoff(0, 1)).toBe(1)
    expect(calculateUniformBackoff(10, 1)).toBe(1024)
  })
})
