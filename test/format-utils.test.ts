import { describe, it, expect } from 'vitest'
import { formatTime, formatTimeSeconds, formatPercentage, countSeverities } from '../src/utils/format-utils.js'

// ─── formatTime ───────────────────────────────────────
describe('formatTime', () => {
  it('formats milliseconds under threshold', () => {
    expect(formatTime(100)).toBe('100ms')
  })

  it('formats zero', () => {
    expect(formatTime(0)).toBe('0ms')
  })

  it('formats seconds above threshold', () => {
    expect(formatTime(2000)).toBe('2.00s')
  })

  it('formats exactly 1000ms as seconds', () => {
    expect(formatTime(1000)).toBe('1.00s')
  })

  it('formats 500ms as milliseconds', () => {
    expect(formatTime(500)).toBe('500ms')
  })

  it('formats 1500ms as seconds', () => {
    expect(formatTime(1500)).toBe('1.50s')
  })

  it('formats 50ms as milliseconds', () => {
    expect(formatTime(50)).toBe('50ms')
  })

  it('formats 999ms as milliseconds', () => {
    expect(formatTime(999)).toBe('999ms')
  })
})

// ─── formatTimeSeconds ────────────────────────────────
describe('formatTimeSeconds', () => {
  it('formats milliseconds as seconds with default decimals', () => {
    expect(formatTimeSeconds(1000)).toBe('1.000')
  })

  it('formats 500ms', () => {
    expect(formatTimeSeconds(500)).toBe('0.500')
  })

  it('respects custom decimal count', () => {
    expect(formatTimeSeconds(1234, 1)).toBe('1.2')
  })

  it('formats 0ms', () => {
    expect(formatTimeSeconds(0)).toBe('0.000')
  })

  it('formats with 0 decimals', () => {
    expect(formatTimeSeconds(5000, 0)).toBe('5')
  })
})

// ─── formatPercentage ─────────────────────────────────
describe('formatPercentage', () => {
  it('formats with default decimals', () => {
    expect(formatPercentage(50)).toBe('50.0%')
  })

  it('formats 100%', () => {
    expect(formatPercentage(100)).toBe('100.0%')
  })

  it('formats 0%', () => {
    expect(formatPercentage(0)).toBe('0.0%')
  })

  it('formats with custom decimals', () => {
    expect(formatPercentage(33.333, 2)).toBe('33.33%')
  })

  it('formats small values', () => {
    expect(formatPercentage(0.1)).toBe('0.1%')
  })

  it('formats with 0 decimals', () => {
    expect(formatPercentage(99.9, 0)).toBe('100%')
  })
})

// ─── countSeverities ──────────────────────────────────
describe('countSeverities', () => {
  it('returns zeros for empty array', () => {
    expect(countSeverities([])).toEqual({ error: 0, info: 0, warning: 0 })
  })

  it('counts errors', () => {
    const violations = [{ severity: 'error' as const }, { severity: 'error' as const }]
    expect(countSeverities(violations)).toEqual({ error: 2, info: 0, warning: 0 })
  })

  it('counts warnings', () => {
    const violations = [{ severity: 'warning' as const }]
    expect(countSeverities(violations)).toEqual({ error: 0, info: 0, warning: 1 })
  })

  it('counts info', () => {
    const violations = [{ severity: 'info' as const }]
    expect(countSeverities(violations)).toEqual({ error: 0, info: 1, warning: 0 })
  })

  it('counts mixed severities', () => {
    const violations = [
      { severity: 'error' as const },
      { severity: 'warning' as const },
      { severity: 'info' as const },
      { severity: 'error' as const },
      { severity: 'warning' as const },
    ]
    expect(countSeverities(violations)).toEqual({ error: 2, info: 1, warning: 2 })
  })
})
