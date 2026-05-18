import { describe, expect, it } from 'vitest'

import { calculateBackoff, calculateUniformBackoff, type JitterType } from '../src/utils/backoff.js'

// ─── calculateUniformBackoff ──────────────────────────
describe('calculateUniformBackoff', () => {
  it('returns base delay for attempt 0', () => {
    expect(calculateUniformBackoff(0, 100)).toBe(100)
  })

  it('doubles for each attempt', () => {
    expect(calculateUniformBackoff(1, 100)).toBe(200)
    expect(calculateUniformBackoff(2, 100)).toBe(400)
    expect(calculateUniformBackoff(3, 100)).toBe(800)
  })

  it('respects maxDelayMs', () => {
    expect(calculateUniformBackoff(10, 100, 1000)).toBe(1000)
  })
})

// ─── calculateBackoff with jitter ─────────────────────
describe('calculateBackoff', () => {
  it('throws on negative attempt', () => {
    expect(() => calculateBackoff(-1, 100)).toThrow(RangeError)
  })

  it('throws on baseDelayMs < 1', () => {
    expect(() => calculateBackoff(0, 0)).toThrow(RangeError)
  })

  it('full jitter returns value in [0, exponentialDelay]', () => {
    for (let i = 0; i < 50; i++) {
      const val = calculateBackoff(2, 100, 30000, 'full')
      expect(val).toBeGreaterThanOrEqual(0)
      expect(val).toBeLessThanOrEqual(400)
    }
  })

  it('equal jitter returns value in [exp/2, exp]', () => {
    for (let i = 0; i < 50; i++) {
      const val = calculateBackoff(2, 100, 30000, 'equal')
      expect(val).toBeGreaterThanOrEqual(200)
      expect(val).toBeLessThanOrEqual(400)
    }
  })

  it('decorrelating jitter returns non-negative value', () => {
    for (let i = 0; i < 50; i++) {
      const val = calculateBackoff(1, 100, 30000, 'decorrelating')
      expect(val).toBeGreaterThanOrEqual(0)
      expect(val).toBeLessThanOrEqual(30000)
    }
  })

  it('respects maxDelayMs cap', () => {
    const val = calculateBackoff(20, 100, 500, 'full')
    expect(val).toBeLessThanOrEqual(500)
  })
})
