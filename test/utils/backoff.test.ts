import { describe, it, expect } from 'vitest'
import { calculateBackoff, calculateUniformBackoff, type JitterType } from '../../src/utils/backoff.js'

// ─── calculateUniformBackoff ──────────────────────────────
describe('calculateUniformBackoff', () => {
  it('returns base delay for attempt 0', () => {
    expect(calculateUniformBackoff(0, 100)).toBe(100)
  })

  it('doubles delay for each attempt', () => {
    expect(calculateUniformBackoff(1, 100)).toBe(200)
    expect(calculateUniformBackoff(2, 100)).toBe(400)
    expect(calculateUniformBackoff(3, 100)).toBe(800)
  })

  it('caps at maxDelayMs', () => {
    expect(calculateUniformBackoff(10, 100, 500)).toBe(500)
  })

  it('uses default maxDelayMs of 30000', () => {
    const result = calculateUniformBackoff(20, 100)
    expect(result).toBe(30000)
  })

  it('handles baseDelayMs of 1', () => {
    expect(calculateUniformBackoff(0, 1)).toBe(1)
    expect(calculateUniformBackoff(5, 1)).toBe(32)
  })
})

// ─── calculateBackoff - validation ────────────────────────
describe('calculateBackoff - validation', () => {
  it('throws on negative attempt', () => {
    expect(() => calculateBackoff(-1, 100)).toThrow(RangeError)
  })

  it('throws on baseDelayMs < 1', () => {
    expect(() => calculateBackoff(0, 0)).toThrow(RangeError)
  })

  it('throws when maxDelayMs < baseDelayMs', () => {
    expect(() => calculateBackoff(0, 200, 100)).toThrow(RangeError)
  })
})

// ─── calculateBackoff - full jitter ───────────────────────
describe('calculateBackoff - full jitter', () => {
  it('returns a value between 0 and exponential delay', () => {
    for (let i = 0; i < 20; i++) {
      const result = calculateBackoff(2, 100, 30000, 'full')
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThanOrEqual(400)
    }
  })
})

// ─── calculateBackoff - equal jitter ──────────────────────
describe('calculateBackoff - equal jitter', () => {
  it('returns a value between half and full exponential delay', () => {
    for (let i = 0; i < 20; i++) {
      const result = calculateBackoff(2, 100, 30000, 'equal')
      expect(result).toBeGreaterThanOrEqual(200)
      expect(result).toBeLessThanOrEqual(400)
    }
  })
})

// ─── calculateBackoff - decorrelating jitter ──────────────
describe('calculateBackoff - decorrelating jitter', () => {
  it('returns a value capped at maxDelayMs', () => {
    for (let i = 0; i < 20; i++) {
      const result = calculateBackoff(2, 100, 30000, 'decorrelating')
      expect(result).toBeLessThanOrEqual(30000)
      expect(result).toBeGreaterThanOrEqual(0)
    }
  })

  it('uses decorrelating as default jitter type', () => {
    const results = new Set<number>()
    for (let i = 0; i < 50; i++) {
      results.add(calculateBackoff(0, 100))
    }
    expect(results.size).toBeGreaterThan(1)
  })
})

// ─── calculateBackoff - edge cases ────────────────────────
describe('calculateBackoff - edge cases', () => {
  it('respects maxDelayMs cap for high attempts', () => {
    const result = calculateBackoff(100, 100, 1000, 'full')
    expect(result).toBeLessThanOrEqual(1000)
  })

  it('handles all jitter types at attempt 0', () => {
    const types: JitterType[] = ['full', 'equal', 'decorrelating']
    for (const j of types) {
      const result = calculateBackoff(0, 100, 30000, j)
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThanOrEqual(30000)
    }
  })

  it('calculateUniformBackoff handles large base delay', () => {
    expect(calculateUniformBackoff(0, 10000)).toBe(10000)
    expect(calculateUniformBackoff(1, 10000)).toBe(20000)
  })

  it('calculateUniformBackoff caps correctly', () => {
    expect(calculateUniformBackoff(100, 1, 1000)).toBe(1000)
  })

  it('full jitter with base delay 1', () => {
    for (let i = 0; i < 20; i++) {
      const result = calculateBackoff(5, 1, 30000, 'full')
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThanOrEqual(64)
    }
  })

  it('equal jitter with attempt 0', () => {
    for (let i = 0; i < 20; i++) {
      const result = calculateBackoff(0, 100, 30000, 'equal')
      expect(result).toBeGreaterThanOrEqual(50)
      expect(result).toBeLessThanOrEqual(100)
    }
  })

  it('decorrelating jitter with large attempt', () => {
    for (let i = 0; i < 20; i++) {
      const result = calculateBackoff(50, 100, 5000, 'decorrelating')
      expect(result).toBeLessThanOrEqual(5000)
    }
  })

  it('calculateUniformBackoff with maxDelayMs equal to baseDelayMs', () => {
    expect(calculateUniformBackoff(0, 100, 100)).toBe(100)
    expect(calculateUniformBackoff(1, 100, 100)).toBe(100)
  })

  it('calculateBackoff with higher attempt gives larger delay', () => {
    const b0 = calculateBackoff(0, 100, 10000)
    const b3 = calculateBackoff(3, 100, 10000)
    expect(b3).toBeGreaterThanOrEqual(b0)
  })

  it('calculateBackoff respects maxDelay', () => {
    const result = calculateBackoff(100, 100, 1000)
    expect(result).toBeLessThanOrEqual(1000)
  })

  it('calculateBackoff returns at least baseDelay', () => {
    const result = calculateBackoff(5, 100, 1000)
    expect(result).toBeGreaterThanOrEqual(100)
  })

  it('calculateBackoff respects maxDelay', () => {
    const result = calculateBackoff(100, 100, 1000)
    expect(result).toBeLessThanOrEqual(1000)
  })
})
