import { describe, test, expect } from 'vitest'
import {
  formatTime,
  formatPercentage,
  formatTimeSeconds,
  countSeverities,
  formatBytes,
  formatDuration,
} from '../../../src/utils/format-utils.js'

describe('format-utils', () => {
  describe('formatTime', () => {
    test('should format milliseconds less than 1000', () => {
      expect(formatTime(0)).toBe('0ms')
      expect(formatTime(100)).toBe('100ms')
      expect(formatTime(500)).toBe('500ms')
      expect(formatTime(999)).toBe('999ms')
    })

    test('should format milliseconds as seconds when >= 1000', () => {
      expect(formatTime(1000)).toBe('1.00s')
      expect(formatTime(1500)).toBe('1.50s')
      expect(formatTime(1234)).toBe('1.23s')
      expect(formatTime(60000)).toBe('60.00s')
    })

    test('should format small positive values correctly', () => {
      expect(formatTime(1)).toBe('1ms')
      expect(formatTime(10)).toBe('10ms')
    })

    test('should handle exactly the threshold boundary', () => {
      expect(formatTime(999)).toBe('999ms')
      expect(formatTime(1000)).toBe('1.00s')
    })

    test('should format large second values', () => {
      expect(formatTime(3600000)).toBe('3600.00s')
      expect(formatTime(10000)).toBe('10.00s')
    })

    test('should handle fractional milliseconds in second range', () => {
      expect(formatTime(1234)).toBe('1.23s')
      expect(formatTime(1001)).toBe('1.00s')
      expect(formatTime(1999)).toBe('2.00s')
      expect(formatTime(5555)).toBe('5.55s')
    })

    test('should return string type for all outputs', () => {
      expect(typeof formatTime(0)).toBe('string')
      expect(typeof formatTime(1000)).toBe('string')
    })

    test('should handle negative values', () => {
      expect(formatTime(-1)).toBe('-1ms')
      expect(formatTime(-500)).toBe('-500ms')
      expect(formatTime(-999)).toBe('-999ms')
      expect(formatTime(-1000)).toBe('-1000ms')
      expect(formatTime(-1500)).toBe('-1500ms')
      expect(formatTime(-5000)).toBe('-5000ms')
    })

    test('should handle NaN', () => {
      expect(formatTime(NaN)).toBe('NaNs')
    })

    test('should handle Infinity', () => {
      expect(formatTime(Infinity)).toBe('Infinitys')
      expect(formatTime(-Infinity)).toBe('-Infinityms')
    })

    test('should handle very large numbers', () => {
      expect(formatTime(86400000)).toBe('86400.00s')
      expect(formatTime(999999999)).toBe('1000000.00s')
    })

    test('should handle fractional millisecond values below threshold', () => {
      expect(formatTime(0.5)).toBe('0.5ms')
      expect(formatTime(0.001)).toBe('0.001ms')
      expect(formatTime(99.999)).toBe('99.999ms')
    })

    test('should handle TIME_FORMAT_THRESHOLD_MS boundary precisely', () => {
      expect(formatTime(999)).toBe('999ms')
      expect(formatTime(1000)).toBe('1.00s')
      expect(formatTime(1001)).toBe('1.00s')
      expect(formatTime(999.999)).toBe('999.999ms')
    })

    test('should handle threshold minus one', () => {
      expect(formatTime(999)).toBe('999ms')
    })

    test('should handle exactly threshold value', () => {
      expect(formatTime(1000)).toBe('1.00s')
    })
  })

  describe('formatTimeSeconds', () => {
    test('should format milliseconds as seconds with default 3 decimals', () => {
      expect(formatTimeSeconds(1000)).toBe('1.000')
      expect(formatTimeSeconds(1500)).toBe('1.500')
      expect(formatTimeSeconds(0)).toBe('0.000')
    })

    test('should format with custom decimal places', () => {
      expect(formatTimeSeconds(1234, 0)).toBe('1')
      expect(formatTimeSeconds(1234, 1)).toBe('1.2')
      expect(formatTimeSeconds(1234, 2)).toBe('1.23')
      expect(formatTimeSeconds(1234, 5)).toBe('1.23400')
    })

    test('should handle zero milliseconds', () => {
      expect(formatTimeSeconds(0)).toBe('0.000')
      expect(formatTimeSeconds(0, 0)).toBe('0')
      expect(formatTimeSeconds(0, 6)).toBe('0.000000')
    })

    test('should handle large values', () => {
      expect(formatTimeSeconds(60000)).toBe('60.000')
      expect(formatTimeSeconds(3600000)).toBe('3600.000')
    })

    test('should handle small fractional values', () => {
      expect(formatTimeSeconds(1)).toBe('0.001')
      expect(formatTimeSeconds(500)).toBe('0.500')
      expect(formatTimeSeconds(999)).toBe('0.999')
    })

    test('should return string type', () => {
      expect(typeof formatTimeSeconds(1000)).toBe('string')
    })

    test('should handle negative values', () => {
      expect(formatTimeSeconds(-1000)).toBe('-1.000')
      expect(formatTimeSeconds(-500)).toBe('-0.500')
      expect(formatTimeSeconds(-1)).toBe('-0.001')
    })

    test('should handle NaN', () => {
      expect(formatTimeSeconds(NaN)).toBe('NaN')
    })

    test('should handle Infinity', () => {
      expect(formatTimeSeconds(Infinity)).toBe('Infinity')
      expect(formatTimeSeconds(-Infinity)).toBe('-Infinity')
    })

    test('should handle decimals = 0', () => {
      expect(formatTimeSeconds(1234, 0)).toBe('1')
      expect(formatTimeSeconds(500, 0)).toBe('1')
      expect(formatTimeSeconds(999, 0)).toBe('1')
      expect(formatTimeSeconds(1, 0)).toBe('0')
    })

    test('should handle very large decimals', () => {
      expect(formatTimeSeconds(1234, 10)).toBe('1.2340000000')
      expect(formatTimeSeconds(1, 8)).toBe('0.00100000')
    })

    test('should handle negative decimals (throws RangeError)', () => {
      expect(() => formatTimeSeconds(1234, -1)).toThrow(RangeError)
    })

    test('should handle very large millisecond values', () => {
      expect(formatTimeSeconds(86400000, 3)).toBe('86400.000')
      expect(formatTimeSeconds(3600000, 2)).toBe('3600.00')
    })
  })

  describe('formatPercentage', () => {
    test('should format percentage with default decimals', () => {
      expect(formatPercentage(50)).toBe('50.0%')
      expect(formatPercentage(33.333)).toBe('33.3%')
      expect(formatPercentage(100)).toBe('100.0%')
    })

    test('should format percentage with custom decimals', () => {
      expect(formatPercentage(33.333, 2)).toBe('33.33%')
      expect(formatPercentage(50, 0)).toBe('50%')
      expect(formatPercentage(99.999, 3)).toBe('99.999%')
    })

    test('should format zero percent', () => {
      expect(formatPercentage(0)).toBe('0.0%')
      expect(formatPercentage(0, 0)).toBe('0%')
    })

    test('should format negative values', () => {
      expect(formatPercentage(-5)).toBe('-5.0%')
      expect(formatPercentage(-33.333)).toBe('-33.3%')
      expect(formatPercentage(-0.1, 2)).toBe('-0.10%')
    })

    test('should format values over 100%', () => {
      expect(formatPercentage(150)).toBe('150.0%')
      expect(formatPercentage(999.99, 2)).toBe('999.99%')
    })

    test('should handle very small decimal values', () => {
      expect(formatPercentage(0.001)).toBe('0.0%')
      expect(formatPercentage(0.001, 3)).toBe('0.001%')
    })

    test('should always include the percent sign', () => {
      expect(formatPercentage(50)).toContain('%')
      expect(formatPercentage(0)).toContain('%')
      expect(formatPercentage(-10)).toContain('%')
    })

    test('should handle NaN', () => {
      expect(formatPercentage(NaN)).toBe('NaN%')
      expect(formatPercentage(NaN, 2)).toBe('NaN%')
    })

    test('should handle Infinity', () => {
      expect(formatPercentage(Infinity)).toBe('Infinity%')
      expect(formatPercentage(-Infinity)).toBe('-Infinity%')
    })

    test('should handle negative decimals (throws RangeError)', () => {
      expect(() => formatPercentage(50, -1)).toThrow(RangeError)
    })

    test('should handle very small positive values', () => {
      expect(formatPercentage(0.0001)).toBe('0.0%')
      expect(formatPercentage(0.0001, 4)).toBe('0.0001%')
    })

    test('should handle very large values', () => {
      expect(formatPercentage(10000)).toBe('10000.0%')
      expect(formatPercentage(100000, 0)).toBe('100000%')
    })

    test('should handle MAX_SAFE_INTEGER', () => {
      expect(formatPercentage(Number.MAX_SAFE_INTEGER)).toBe(
        `${Number.MAX_SAFE_INTEGER.toFixed(1)}%`,
      )
    })

    test('should always return string type', () => {
      expect(typeof formatPercentage(50)).toBe('string')
      expect(typeof formatPercentage(0)).toBe('string')
      expect(typeof formatPercentage(-10)).toBe('string')
    })

    test('should handle rounding at boundaries', () => {
      expect(formatPercentage(9.999, 2)).toBe('10.00%')
      expect(formatPercentage(99.9999, 3)).toBe('100.000%')
    })

    test('should handle exactly 100 percent', () => {
      expect(formatPercentage(100)).toBe('100.0%')
      expect(formatPercentage(100, 0)).toBe('100%')
      expect(formatPercentage(100, 2)).toBe('100.00%')
    })
  })

  describe('countSeverities', () => {
    test('should return zero counts for empty array', () => {
      expect(countSeverities([])).toEqual({ error: 0, info: 0, warning: 0 })
    })

    test('should count each severity type correctly', () => {
      const violations = [
        { severity: 'error' as const },
        { severity: 'error' as const },
        { severity: 'warning' as const },
        { severity: 'info' as const },
      ]
      expect(countSeverities(violations)).toEqual({ error: 2, info: 1, warning: 1 })
    })

    test('should count only errors', () => {
      const violations = [
        { severity: 'error' as const },
        { severity: 'error' as const },
        { severity: 'error' as const },
      ]
      expect(countSeverities(violations)).toEqual({ error: 3, info: 0, warning: 0 })
    })

    test('should count only warnings', () => {
      const violations = [{ severity: 'warning' as const }, { severity: 'warning' as const }]
      expect(countSeverities(violations)).toEqual({ error: 0, info: 0, warning: 2 })
    })

    test('should count only info', () => {
      const violations = [
        { severity: 'info' as const },
        { severity: 'info' as const },
        { severity: 'info' as const },
        { severity: 'info' as const },
      ]
      expect(countSeverities(violations)).toEqual({ error: 0, info: 4, warning: 0 })
    })

    test('should handle mixed severities with many items', () => {
      const violations = [
        { severity: 'error' as const },
        { severity: 'info' as const },
        { severity: 'warning' as const },
        { severity: 'error' as const },
        { severity: 'info' as const },
        { severity: 'warning' as const },
        { severity: 'error' as const },
      ]
      expect(countSeverities(violations)).toEqual({ error: 3, info: 2, warning: 2 })
    })

    test('should return a fresh object not shared between calls', () => {
      const result1 = countSeverities([])
      const result2 = countSeverities([])
      expect(result1).toEqual(result2)
      expect(result1).not.toBe(result2)
    })

    test('should handle single item arrays', () => {
      expect(countSeverities([{ severity: 'error' }])).toEqual({ error: 1, info: 0, warning: 0 })
      expect(countSeverities([{ severity: 'warning' }])).toEqual({ error: 0, info: 0, warning: 1 })
      expect(countSeverities([{ severity: 'info' }])).toEqual({ error: 0, info: 1, warning: 0 })
    })

    test('should handle large arrays of 1000+ items', () => {
      const violations = Array.from({ length: 1000 }, (_, i) => ({
        severity: (['error', 'info', 'warning'] as const)[i % 3],
      }))
      const result = countSeverities(violations)
      expect(result.error).toBe(334)
      expect(result.info).toBe(333)
      expect(result.warning).toBe(333)
    })

    test('should handle large array of all same severity', () => {
      const errors = Array.from({ length: 2000 }, () => ({
        severity: 'error' as const,
      }))
      expect(countSeverities(errors)).toEqual({ error: 2000, info: 0, warning: 0 })
    })

    test('should ignore extra properties on violation objects', () => {
      const violations = [
        { severity: 'error' as const, message: 'test', file: 'a.ts' },
        { severity: 'warning' as const, rule: 'no-console', line: 10 },
      ]
      expect(countSeverities(violations as any)).toEqual({ error: 1, info: 0, warning: 1 })
    })

    test('should return exactly 3 keys in the result object', () => {
      const result = countSeverities([])
      expect(Object.keys(result)).toHaveLength(3)
      expect(Object.keys(result).sort()).toEqual(['error', 'info', 'warning'])
    })

    test('should return correct keys for non-empty arrays', () => {
      const result = countSeverities([{ severity: 'error' as const }])
      expect(Object.keys(result)).toHaveLength(3)
      expect(result).toHaveProperty('error')
      expect(result).toHaveProperty('info')
      expect(result).toHaveProperty('warning')
    })

    test('should handle alternating severity pattern', () => {
      const violations = [
        { severity: 'error' as const },
        { severity: 'warning' as const },
        { severity: 'info' as const },
        { severity: 'error' as const },
        { severity: 'warning' as const },
        { severity: 'info' as const },
      ]
      expect(countSeverities(violations)).toEqual({ error: 2, info: 2, warning: 2 })
    })

    test('should handle all errors with no warnings or info', () => {
      const violations = [
        { severity: 'error' as const },
        { severity: 'error' as const },
        { severity: 'error' as const },
        { severity: 'error' as const },
        { severity: 'error' as const },
      ]
      const result = countSeverities(violations)
      expect(result.error).toBe(5)
      expect(result.warning).toBe(0)
      expect(result.info).toBe(0)
    })

    test('should produce consistent results for the same input', () => {
      const violations = [
        { severity: 'error' as const },
        { severity: 'warning' as const },
        { severity: 'info' as const },
      ]
      const result1 = countSeverities(violations)
      const result2 = countSeverities(violations)
      expect(result1).toEqual(result2)
    })

    test('should handle mixed severities with uneven distribution', () => {
      const violations = [
        { severity: 'error' as const },
        { severity: 'error' as const },
        { severity: 'error' as const },
        { severity: 'info' as const },
      ]
      expect(countSeverities(violations)).toEqual({ error: 3, info: 1, warning: 0 })
    })
  })

  describe('return type verification', () => {
    test('formatTime always returns a string', () => {
      expect(typeof formatTime(0)).toBe('string')
      expect(typeof formatTime(1000)).toBe('string')
      expect(typeof formatTime(-1)).toBe('string')
      expect(typeof formatTime(NaN)).toBe('string')
      expect(typeof formatTime(Infinity)).toBe('string')
    })

    test('formatTimeSeconds always returns a string', () => {
      expect(typeof formatTimeSeconds(0)).toBe('string')
      expect(typeof formatTimeSeconds(1000)).toBe('string')
      expect(typeof formatTimeSeconds(-500)).toBe('string')
      expect(typeof formatTimeSeconds(NaN)).toBe('string')
      expect(typeof formatTimeSeconds(Infinity)).toBe('string')
    })

    test('formatPercentage always returns a string', () => {
      expect(typeof formatPercentage(0)).toBe('string')
      expect(typeof formatPercentage(100)).toBe('string')
      expect(typeof formatPercentage(-50)).toBe('string')
      expect(typeof formatPercentage(NaN)).toBe('string')
      expect(typeof formatPercentage(Infinity)).toBe('string')
    })

    test('countSeverities always returns an object with numeric values', () => {
      const result = countSeverities([])
      expect(typeof result.error).toBe('number')
      expect(typeof result.info).toBe('number')
      expect(typeof result.warning).toBe('number')
    })
  })

  describe('formatTime additional edge cases', () => {
    test('should format Number.MAX_VALUE', () => {
      const result = formatTime(Number.MAX_VALUE)
      expect(result).toContain('s')
    })

    test('should format Number.MIN_VALUE', () => {
      expect(formatTime(Number.MIN_VALUE)).toBe(`${Number.MIN_VALUE}ms`)
    })

    test('should format Number.EPSILON', () => {
      expect(formatTime(Number.EPSILON)).toBe(`${Number.EPSILON}ms`)
    })

    test('should format 0.1 + 0.2 floating point', () => {
      const result = formatTime(0.1 + 0.2)
      expect(result).toBe('0.30000000000000004ms')
    })

    test('should handle fractional values just above threshold', () => {
      expect(formatTime(1000.001)).toBe('1.00s')
      expect(formatTime(1000.5)).toBe('1.00s')
      expect(formatTime(1000.999)).toBe('1.00s')
    })
  })

  describe('formatTimeSeconds additional edge cases', () => {
    test('should handle Number.MAX_SAFE_INTEGER', () => {
      const result = formatTimeSeconds(Number.MAX_SAFE_INTEGER)
      expect(result).toBe(`${(Number.MAX_SAFE_INTEGER / 1000).toFixed(3)}`)
    })

    test('should handle decimals = 100 (maximum allowed)', () => {
      const result = formatTimeSeconds(1234, 100)
      expect(result.startsWith('1.23399')).toBe(true)
      expect(result.length).toBeGreaterThan(10)
    })

    test('should handle decimals > 100 (throws RangeError)', () => {
      expect(() => formatTimeSeconds(1234, 101)).toThrow(RangeError)
    })

    test('should handle sub-millisecond values', () => {
      expect(formatTimeSeconds(0.1)).toBe('0.000')
      expect(formatTimeSeconds(0.001, 6)).toBe('0.000001')
    })
  })

  describe('formatPercentage additional edge cases', () => {
    test('should handle decimals = 100 (maximum allowed)', () => {
      const result = formatPercentage(50.123456, 100)
      expect(result.startsWith('50.1234')).toBe(true)
      expect(result).toContain('%')
    })

    test('should handle decimals > 100 (throws RangeError)', () => {
      expect(() => formatPercentage(50, 101)).toThrow(RangeError)
    })

    test('should handle Number.MAX_SAFE_INTEGER', () => {
      const result = formatPercentage(Number.MAX_SAFE_INTEGER)
      expect(result).toBe(`${Number.MAX_SAFE_INTEGER.toFixed(1)}%`)
    })

    test('should handle negative zero', () => {
      expect(formatPercentage(-0)).toBe('0.0%')
    })

    test('should preserve precision with many decimal places', () => {
      expect(formatPercentage(33.333333, 6)).toBe('33.333333%')
      expect(formatPercentage(99.999999, 6)).toBe('99.999999%')
    })

    test('should handle very small negative values', () => {
      expect(formatPercentage(-0.001)).toBe('-0.0%')
      expect(formatPercentage(-0.001, 4)).toBe('-0.0010%')
    })
  })

  describe('formatTime round-trip consistency', () => {
    test('formatTime and formatTimeSeconds agree on seconds output', () => {
      const ms = 5678
      const timeStr = formatTime(ms)
      const secStr = formatTimeSeconds(ms, 2)
      expect(timeStr).toBe(`${secStr}s`)
    })
  })

  describe('countSeverities additional scenarios', () => {
    test('handles large violation arrays', () => {
      const violations = Array.from({ length: 1000 }, (_, i) => ({
        severity: (['error', 'warning', 'info'] as const)[i % 3],
      }))
      const counts = countSeverities(violations)
      expect(counts.error).toBe(Math.ceil(1000 / 3))
      expect(counts.warning).toBe(Math.floor(1000 / 3))
      expect(counts.info + counts.error + counts.warning).toBe(1000)
    })

    test('all-same-severity arrays', () => {
      const allErrors = Array.from({ length: 50 }, () => ({ severity: 'error' as const }))
      expect(countSeverities(allErrors)).toEqual({ error: 50, warning: 0, info: 0 })

      const allWarnings = Array.from({ length: 30 }, () => ({ severity: 'warning' as const }))
      expect(countSeverities(allWarnings)).toEqual({ error: 0, warning: 30, info: 0 })

      const allInfo = Array.from({ length: 20 }, () => ({ severity: 'info' as const }))
      expect(countSeverities(allInfo)).toEqual({ error: 0, warning: 0, info: 20 })
    })
  })

  describe('formatPercentage decimal variations', () => {
    test('decimals=0 produces integer output', () => {
      expect(formatPercentage(99.9, 0)).toBe('100%')
      expect(formatPercentage(33.3, 0)).toBe('33%')
    })

    test('decimals=2 produces two decimal places', () => {
      expect(formatPercentage(33.333, 2)).toBe('33.33%')
      expect(formatPercentage(100, 2)).toBe('100.00%')
    })

    test('decimals=5 produces five decimal places', () => {
      expect(formatPercentage(1.23456, 5)).toBe('1.23456%')
    })
  })

  describe('formatTimeSeconds negative and boundary values', () => {
    test('handles negative milliseconds', () => {
      expect(formatTimeSeconds(-1000)).toBe('-1.000')
      expect(formatTimeSeconds(-1)).toBe('-0.001')
    })

    test('handles zero with various decimal counts', () => {
      expect(formatTimeSeconds(0, 0)).toBe('0')
      expect(formatTimeSeconds(0, 1)).toBe('0.0')
      expect(formatTimeSeconds(0, 5)).toBe('0.00000')
    })

    test('decimals=0 omits decimal point', () => {
      expect(formatTimeSeconds(1234, 0)).toBe('1')
      expect(formatTimeSeconds(999, 0)).toBe('1')
    })
  })

  describe('formatTime negative values', () => {
    test('formats negative milliseconds', () => {
      expect(formatTime(-1)).toBe('-1ms')
      expect(formatTime(-500)).toBe('-500ms')
      expect(formatTime(-999)).toBe('-999ms')
    })

    test('formats large negative values as milliseconds', () => {
      expect(formatTime(-1000)).toBe('-1000ms')
      expect(formatTime(-5678)).toBe('-5678ms')
    })
  })

  describe('formatTimeSeconds edge cases', () => {
    test('should handle negative zero', () => {
      expect(formatTimeSeconds(-0)).toBe('0.000')
      expect(formatTimeSeconds(-0, 0)).toBe('0')
    })

    test('should handle negative values with custom decimals', () => {
      expect(formatTimeSeconds(-1234, 2)).toBe('-1.23')
      expect(formatTimeSeconds(-1, 6)).toBe('-0.001000')
      expect(formatTimeSeconds(-999, 1)).toBe('-1.0')
    })
  })

  describe('formatPercentage edge cases', () => {
    test('should handle decimals=0 with negative values', () => {
      expect(formatPercentage(-0.5, 0)).toBe('-1%')
      expect(formatPercentage(-9.9, 0)).toBe('-10%')
      expect(formatPercentage(-99.999, 0)).toBe('-100%')
    })

    test('should handle negative zero with various decimals', () => {
      expect(formatPercentage(-0, 0)).toBe('0%')
      expect(formatPercentage(-0, 2)).toBe('0.00%')
      expect(formatPercentage(-0, 5)).toBe('0.00000%')
    })
  })

  describe('formatTime rounding at exact boundaries', () => {
    test('should correctly round values near 10-second mark', () => {
      expect(formatTime(9999)).toBe('10.00s')
      expect(formatTime(9994)).toBe('9.99s')
      expect(formatTime(9985)).toBe('9.98s')
    })
  })

  describe('countSeverities result immutability', () => {
    test('mutating returned object does not affect future calls', () => {
      const result = countSeverities([{ severity: 'error' as const }])
      result.error = 999
      const result2 = countSeverities([{ severity: 'error' as const }])
      expect(result2.error).toBe(1)
    })
  })

  describe('countSeverities edge cases', () => {
    test('handles empty violations array', () => {
      const result = countSeverities([])
      expect(result).toEqual({ error: 0, info: 0, warning: 0 })
    })

    test('counts all error severities', () => {
      const result = countSeverities([
        { severity: 'error' as const },
        { severity: 'error' as const },
        { severity: 'error' as const },
      ])
      expect(result.error).toBe(3)
      expect(result.info).toBe(0)
      expect(result.warning).toBe(0)
    })

    test('counts mixed severities correctly', () => {
      const result = countSeverities([
        { severity: 'error' as const },
        { severity: 'warning' as const },
        { severity: 'info' as const },
        { severity: 'error' as const },
        { severity: 'warning' as const },
      ])
      expect(result).toEqual({ error: 2, info: 1, warning: 2 })
    })

    test('returns fresh object each call', () => {
      const r1 = countSeverities([])
      const r2 = countSeverities([])
      expect(r1).not.toBe(r2)
    })
  })

  describe('formatTime boundary values', () => {
    test('returns milliseconds for exactly 999ms', () => {
      expect(formatTime(999)).toBe('999ms')
    })

    test('returns seconds for exactly 1000ms', () => {
      expect(formatTime(1000)).toBe('1.00s')
    })

    test('handles zero', () => {
      expect(formatTime(0)).toBe('0ms')
    })

    test('handles very large values', () => {
      expect(formatTime(3600000)).toBe('3600.00s')
    })

    test('handles fractional milliseconds', () => {
      expect(formatTime(0.5)).toBe('0.5ms')
    })
  })

  describe('formatPercentage additional coverage', () => {
    test('handles 100 percent', () => {
      expect(formatPercentage(100)).toBe('100.0%')
    })

    test('handles 0 percent', () => {
      expect(formatPercentage(0)).toBe('0.0%')
    })

    test('handles negative percentages', () => {
      expect(formatPercentage(-50.5)).toBe('-50.5%')
    })

    test('respects decimals=2', () => {
      expect(formatPercentage(33.333, 2)).toBe('33.33%')
    })

    test('respects decimals=0', () => {
      expect(formatPercentage(99.9, 0)).toBe('100%')
    })
  })

  describe('formatTimeSeconds additional coverage', () => {
    test('handles zero', () => {
      expect(formatTimeSeconds(0)).toBe('0.000')
    })

    test('handles 1000ms = 1 second', () => {
      expect(formatTimeSeconds(1000)).toBe('1.000')
    })

    test('handles 60000ms = 60 seconds', () => {
      expect(formatTimeSeconds(60000)).toBe('60.000')
    })

    test('custom decimals=5', () => {
      expect(formatTimeSeconds(1234, 5)).toBe('1.23400')
    })
  })

  describe('formatTime unit suffix verification', () => {
    test('ms suffix for values below threshold', () => {
      expect(formatTime(0).endsWith('ms')).toBe(true)
      expect(formatTime(1).endsWith('ms')).toBe(true)
      expect(formatTime(500).endsWith('ms')).toBe(true)
      expect(formatTime(998).endsWith('ms')).toBe(true)
      expect(formatTime(999).endsWith('ms')).toBe(true)
    })

    test('s suffix for values at or above threshold', () => {
      expect(formatTime(1000).endsWith('s')).toBe(true)
      expect(formatTime(2000).endsWith('s')).toBe(true)
      expect(formatTime(10000).endsWith('s')).toBe(true)
    })

    test('ms output does not end with s unit', () => {
      const msResult = formatTime(500)
      expect(msResult).toBe('500ms')
      expect(msResult.endsWith('s') && !msResult.endsWith('ms')).toBe(false)
    })
  })

  describe('formatTime exact output values', () => {
    test('correct output for every integer 0 through 9', () => {
      for (let i = 0; i < 10; i++) {
        expect(formatTime(i)).toBe(`${i}ms`)
      }
    })

    test('correct output for multiples of 100 below threshold', () => {
      expect(formatTime(100)).toBe('100ms')
      expect(formatTime(200)).toBe('200ms')
      expect(formatTime(300)).toBe('300ms')
      expect(formatTime(400)).toBe('400ms')
      expect(formatTime(500)).toBe('500ms')
      expect(formatTime(600)).toBe('600ms')
      expect(formatTime(700)).toBe('700ms')
      expect(formatTime(800)).toBe('800ms')
      expect(formatTime(900)).toBe('900ms')
    })

    test('correct output for multiples of 1000 above threshold', () => {
      expect(formatTime(1000)).toBe('1.00s')
      expect(formatTime(2000)).toBe('2.00s')
      expect(formatTime(3000)).toBe('3.00s')
      expect(formatTime(4000)).toBe('4.00s')
      expect(formatTime(5000)).toBe('5.00s')
      expect(formatTime(10000)).toBe('10.00s')
      expect(formatTime(60000)).toBe('60.00s')
    })

    test('exact output for common benchmark times', () => {
      expect(formatTime(123)).toBe('123ms')
      expect(formatTime(456)).toBe('456ms')
      expect(formatTime(789)).toBe('789ms')
      expect(formatTime(1234)).toBe('1.23s')
      expect(formatTime(2345)).toBe('2.35s')
      expect(formatTime(3456)).toBe('3.46s')
    })

    test('exact output for second boundary with rounding', () => {
      expect(formatTime(1500)).toBe('1.50s')
      expect(formatTime(2500)).toBe('2.50s')
      expect(formatTime(5500)).toBe('5.50s')
      expect(formatTime(10500)).toBe('10.50s')
    })
  })

  describe('formatTime floating point edge cases', () => {
    test('handles 0.1 floating point', () => {
      expect(formatTime(0.1)).toBe('0.1ms')
    })

    test('handles 0.01', () => {
      expect(formatTime(0.01)).toBe('0.01ms')
    })

    test('handles 0.001', () => {
      expect(formatTime(0.001)).toBe('0.001ms')
    })

    test('handles values that are sums of floats', () => {
      expect(formatTime(0.1 + 0.2)).toBe('0.30000000000000004ms')
    })

    test('handles 999.5 below threshold stays ms', () => {
      expect(formatTime(999.5)).toBe('999.5ms')
    })

    test('handles 999.9 below threshold stays ms', () => {
      expect(formatTime(999.9)).toBe('999.9ms')
    })

    test('handles 1000.1 above threshold goes to seconds', () => {
      expect(formatTime(1000.1)).toBe('1.00s')
    })

    test('handles 1000.9 above threshold goes to seconds', () => {
      expect(formatTime(1000.9)).toBe('1.00s')
    })
  })

  describe('formatTime negative value comprehensive', () => {
    test('negative zero formats as ms', () => {
      expect(formatTime(-0)).toBe('0ms')
    })

    test('negative 0.5', () => {
      expect(formatTime(-0.5)).toBe('-0.5ms')
    })

    test('negative 0.1', () => {
      expect(formatTime(-0.1)).toBe('-0.1ms')
    })

    test('negative 500.5', () => {
      expect(formatTime(-500.5)).toBe('-500.5ms')
    })

    test('negative values always use ms suffix', () => {
      expect(formatTime(-1).endsWith('ms')).toBe(true)
      expect(formatTime(-100).endsWith('ms')).toBe(true)
      expect(formatTime(-500).endsWith('ms')).toBe(true)
      expect(formatTime(-999).endsWith('ms')).toBe(true)
      expect(formatTime(-1000).endsWith('ms')).toBe(true)
      expect(formatTime(-9999).endsWith('ms')).toBe(true)
    })

    test('negative Number.MIN_VALUE', () => {
      expect(formatTime(-Number.MIN_VALUE)).toBe(`${-Number.MIN_VALUE}ms`)
    })

    test('negative Number.EPSILON', () => {
      expect(formatTime(-Number.EPSILON)).toBe(`${-Number.EPSILON}ms`)
    })
  })

  describe('formatTime special numeric values', () => {
    test('Number.MAX_SAFE_INTEGER in seconds', () => {
      const result = formatTime(Number.MAX_SAFE_INTEGER)
      expect(result).toContain('s')
      expect(result.endsWith('s')).toBe(true)
    })

    test('positive Infinity always in seconds', () => {
      expect(formatTime(Infinity)).toBe('Infinitys')
    })

    test('negative Infinity always in milliseconds', () => {
      expect(formatTime(-Infinity)).toBe('-Infinityms')
    })

    test('NaN results in NaNs', () => {
      expect(formatTime(NaN)).toBe('NaNs')
    })

    test('NaN is treated as above threshold', () => {
      expect(formatTime(NaN)).toBe('NaNs')
    })
  })

  describe('formatTimeSeconds output format verification', () => {
    test('default decimals produces exactly 3 decimal places', () => {
      expect(formatTimeSeconds(1000)).toBe('1.000')
      expect(formatTimeSeconds(1)).toBe('0.001')
      expect(formatTimeSeconds(12345)).toBe('12.345')
    })

    test('decimals=1 produces exactly 1 decimal place', () => {
      expect(formatTimeSeconds(1000, 1)).toBe('1.0')
      expect(formatTimeSeconds(1500, 1)).toBe('1.5')
      expect(formatTimeSeconds(1234, 1)).toBe('1.2')
    })

    test('decimals=4 produces exactly 4 decimal places', () => {
      expect(formatTimeSeconds(1234, 4)).toBe('1.2340')
      expect(formatTimeSeconds(1, 4)).toBe('0.0010')
    })

    test('output never contains unit suffixes', () => {
      expect(formatTimeSeconds(1000)).not.toContain('ms')
      expect(formatTimeSeconds(1000)).not.toContain('s')
      expect(formatTimeSeconds(100)).not.toContain('ms')
    })
  })

  describe('formatTimeSeconds rounding behavior', () => {
    test('rounds 0.5ms to correct decimal places', () => {
      expect(formatTimeSeconds(0.5, 3)).toBe('0.001')
      expect(formatTimeSeconds(0.5, 4)).toBe('0.0005')
    })

    test('rounds 0.4ms correctly', () => {
      expect(formatTimeSeconds(0.4, 3)).toBe('0.000')
      expect(formatTimeSeconds(0.4, 4)).toBe('0.0004')
    })

    test('rounds up at midpoint', () => {
      expect(formatTimeSeconds(1555, 1)).toBe('1.6')
      expect(formatTimeSeconds(1550, 1)).toBe('1.6')
    })

    test('rounds down correctly', () => {
      expect(formatTimeSeconds(1549, 1)).toBe('1.5')
      expect(formatTimeSeconds(1544, 1)).toBe('1.5')
    })

    test('rounding with decimals=2', () => {
      expect(formatTimeSeconds(1235, 2)).toBe('1.24')
      expect(formatTimeSeconds(1234, 2)).toBe('1.23')
      expect(formatTimeSeconds(1236, 2)).toBe('1.24')
    })
  })

  describe('formatTimeSeconds common time conversions', () => {
    test('1 second = 1000ms', () => {
      expect(formatTimeSeconds(1000, 3)).toBe('1.000')
    })

    test('1 minute = 60000ms', () => {
      expect(formatTimeSeconds(60000, 3)).toBe('60.000')
    })

    test('1 hour = 3600000ms', () => {
      expect(formatTimeSeconds(3600000, 3)).toBe('3600.000')
    })

    test('1 day = 86400000ms', () => {
      expect(formatTimeSeconds(86400000, 3)).toBe('86400.000')
    })

    test('500ms = 0.5 seconds', () => {
      expect(formatTimeSeconds(500, 1)).toBe('0.5')
    })

    test('250ms = 0.25 seconds', () => {
      expect(formatTimeSeconds(250, 2)).toBe('0.25')
    })

    test('100ms = 0.1 seconds', () => {
      expect(formatTimeSeconds(100, 1)).toBe('0.1')
    })

    test('10ms = 0.01 seconds', () => {
      expect(formatTimeSeconds(10, 2)).toBe('0.01')
    })

    test('1ms = 0.001 seconds', () => {
      expect(formatTimeSeconds(1, 3)).toBe('0.001')
    })
  })

  describe('formatTimeSeconds negative value comprehensive', () => {
    test('negative 2000ms = -2 seconds', () => {
      expect(formatTimeSeconds(-2000, 3)).toBe('-2.000')
    })

    test('negative 500ms with decimals=1', () => {
      expect(formatTimeSeconds(-500, 1)).toBe('-0.5')
    })

    test('negative 100ms with decimals=2', () => {
      expect(formatTimeSeconds(-100, 2)).toBe('-0.10')
    })

    test('negative value rounding', () => {
      expect(formatTimeSeconds(-1234, 1)).toBe('-1.2')
      expect(formatTimeSeconds(-1555, 1)).toBe('-1.6')
    })

    test('negative zero', () => {
      expect(formatTimeSeconds(-0, 0)).toBe('0')
      expect(formatTimeSeconds(-0, 3)).toBe('0.000')
    })
  })

  describe('formatPercentage output format structure', () => {
    test('always ends with percent sign', () => {
      expect(formatPercentage(50).endsWith('%')).toBe(true)
      expect(formatPercentage(0).endsWith('%')).toBe(true)
      expect(formatPercentage(-50).endsWith('%')).toBe(true)
      expect(formatPercentage(100).endsWith('%')).toBe(true)
      expect(formatPercentage(0.001, 3).endsWith('%')).toBe(true)
    })

    test('contains exactly one percent sign', () => {
      expect(formatPercentage(50).split('%').length).toBe(2)
      expect(formatPercentage(0).split('%').length).toBe(2)
    })

    test('never contains ms or s units', () => {
      expect(formatPercentage(50)).not.toContain('ms')
      expect(formatPercentage(50)).not.toContain('s')
    })

    test('decimals=0 produces no decimal point', () => {
      expect(formatPercentage(50, 0)).toBe('50%')
      expect(formatPercentage(33, 0)).toBe('33%')
      expect(formatPercentage(100, 0)).toBe('100%')
    })

    test('decimals=1 produces one decimal place', () => {
      expect(formatPercentage(50, 1)).toBe('50.0%')
      expect(formatPercentage(33.3, 1)).toBe('33.3%')
    })

    test('decimals=3 produces three decimal places', () => {
      expect(formatPercentage(50, 3)).toBe('50.000%')
      expect(formatPercentage(33.333, 3)).toBe('33.333%')
    })
  })

  describe('formatPercentage rounding comprehensive', () => {
    test('rounds 99.95 to 100.0 with decimals=1', () => {
      expect(formatPercentage(99.95, 1)).toBe('100.0%')
    })

    test('rounds 33.35 to 33.4 with decimals=1', () => {
      expect(formatPercentage(33.35, 1)).toBe('33.4%')
    })

    test('rounds 66.65 to 66.7 with decimals=1', () => {
      expect(formatPercentage(66.65, 1)).toBe('66.7%')
    })

    test('does not round down prematurely', () => {
      expect(formatPercentage(99.94, 1)).toBe('99.9%')
      expect(formatPercentage(33.34, 1)).toBe('33.3%')
    })

    test('rounds at decimals=0 correctly', () => {
      expect(formatPercentage(0.5, 0)).toBe('1%')
      expect(formatPercentage(0.4, 0)).toBe('0%')
      expect(formatPercentage(99.5, 0)).toBe('100%')
      expect(formatPercentage(99.4, 0)).toBe('99%')
    })

    test('rounding with decimals=4', () => {
      expect(formatPercentage(33.33335, 4)).toBe('33.3334%')
      expect(formatPercentage(33.33334, 4)).toBe('33.3333%')
    })
  })

  describe('formatPercentage common percentage values', () => {
    test('0% values', () => {
      expect(formatPercentage(0, 0)).toBe('0%')
      expect(formatPercentage(0, 1)).toBe('0.0%')
      expect(formatPercentage(0, 2)).toBe('0.00%')
    })

    test('25% values', () => {
      expect(formatPercentage(25, 0)).toBe('25%')
      expect(formatPercentage(25, 1)).toBe('25.0%')
    })

    test('50% values', () => {
      expect(formatPercentage(50, 0)).toBe('50%')
      expect(formatPercentage(50, 1)).toBe('50.0%')
    })

    test('75% values', () => {
      expect(formatPercentage(75, 0)).toBe('75%')
      expect(formatPercentage(75, 1)).toBe('75.0%')
    })

    test('100% values', () => {
      expect(formatPercentage(100, 0)).toBe('100%')
      expect(formatPercentage(100, 1)).toBe('100.0%')
      expect(formatPercentage(100, 2)).toBe('100.00%')
    })

    test('1/3 approximation', () => {
      expect(formatPercentage(100 / 3, 2)).toBe('33.33%')
    })

    test('2/3 approximation', () => {
      expect(formatPercentage(200 / 3, 2)).toBe('66.67%')
    })
  })

  describe('formatPercentage large and extreme values', () => {
    test('values over 1000%', () => {
      expect(formatPercentage(1500, 0)).toBe('1500%')
      expect(formatPercentage(2500.5, 1)).toBe('2500.5%')
    })

    test('very large percentage', () => {
      expect(formatPercentage(999999, 0)).toBe('999999%')
    })

    test('negative large percentage', () => {
      expect(formatPercentage(-500, 0)).toBe('-500%')
      expect(formatPercentage(-999.9, 1)).toBe('-999.9%')
    })
  })

  describe('formatPercentage negative value comprehensive', () => {
    test('small negative values', () => {
      expect(formatPercentage(-0.1, 1)).toBe('-0.1%')
      expect(formatPercentage(-0.01, 2)).toBe('-0.01%')
    })

    test('negative values with decimals=0', () => {
      expect(formatPercentage(-0.5, 0)).toBe('-1%')
      expect(formatPercentage(-0.4, 0)).toBe('-0%')
      expect(formatPercentage(-10, 0)).toBe('-10%')
    })

    test('negative values with decimals=3', () => {
      expect(formatPercentage(-33.333, 3)).toBe('-33.333%')
      expect(formatPercentage(-0.001, 3)).toBe('-0.001%')
    })

    test('negative zero always positive', () => {
      expect(formatPercentage(-0, 0)).toBe('0%')
      expect(formatPercentage(-0, 1)).toBe('0.0%')
      expect(formatPercentage(-0, 2)).toBe('0.00%')
    })
  })

  describe('countSeverities single violation scenarios', () => {
    test('single error', () => {
      expect(countSeverities([{ severity: 'error' }])).toEqual({
        error: 1,
        info: 0,
        warning: 0,
      })
    })

    test('single warning', () => {
      expect(countSeverities([{ severity: 'warning' }])).toEqual({
        error: 0,
        info: 0,
        warning: 1,
      })
    })

    test('single info', () => {
      expect(countSeverities([{ severity: 'info' }])).toEqual({
        error: 0,
        info: 1,
        warning: 0,
      })
    })
  })

  describe('countSeverities result properties', () => {
    test('all values are non-negative integers', () => {
      const result = countSeverities([
        { severity: 'error' as const },
        { severity: 'warning' as const },
        { severity: 'info' as const },
      ])
      expect(Number.isInteger(result.error)).toBe(true)
      expect(Number.isInteger(result.info)).toBe(true)
      expect(Number.isInteger(result.warning)).toBe(true)
      expect(result.error).toBeGreaterThanOrEqual(0)
      expect(result.info).toBeGreaterThanOrEqual(0)
      expect(result.warning).toBeGreaterThanOrEqual(0)
    })

    test('total equals input length', () => {
      const violations = [
        { severity: 'error' as const },
        { severity: 'warning' as const },
        { severity: 'info' as const },
        { severity: 'error' as const },
        { severity: 'info' as const },
      ]
      const result = countSeverities(violations)
      expect(result.error + result.info + result.warning).toBe(violations.length)
    })

    test('total equals zero for empty input', () => {
      const result = countSeverities([])
      expect(result.error + result.info + result.warning).toBe(0)
    })
  })

  describe('countSeverities ordering and patterns', () => {
    test('all errors first then warnings then info', () => {
      const violations = [
        { severity: 'error' as const },
        { severity: 'error' as const },
        { severity: 'warning' as const },
        { severity: 'info' as const },
      ]
      expect(countSeverities(violations)).toEqual({ error: 2, info: 1, warning: 1 })
    })

    test('reversed order', () => {
      const violations = [
        { severity: 'info' as const },
        { severity: 'warning' as const },
        { severity: 'error' as const },
      ]
      expect(countSeverities(violations)).toEqual({ error: 1, info: 1, warning: 1 })
    })

    test('repeating pattern of 3', () => {
      const violations = Array.from({ length: 9 }, (_, i) => ({
        severity: (['error', 'warning', 'info'] as const)[i % 3],
      }))
      expect(countSeverities(violations)).toEqual({ error: 3, info: 3, warning: 3 })
    })

    test('one of each severity exactly once', () => {
      const violations = [
        { severity: 'error' as const },
        { severity: 'warning' as const },
        { severity: 'info' as const },
      ]
      expect(countSeverities(violations)).toEqual({ error: 1, info: 1, warning: 1 })
    })

    test('two of each severity', () => {
      const violations = [
        { severity: 'error' as const },
        { severity: 'error' as const },
        { severity: 'warning' as const },
        { severity: 'warning' as const },
        { severity: 'info' as const },
        { severity: 'info' as const },
      ]
      expect(countSeverities(violations)).toEqual({ error: 2, info: 2, warning: 2 })
    })
  })

  describe('countSeverities violation objects with extra fields', () => {
    test('objects with message field', () => {
      const violations = [
        { severity: 'error' as const, message: 'Unexpected token' },
        { severity: 'warning' as const, message: 'Unused variable' },
      ]
      expect(countSeverities(violations as any)).toEqual({ error: 1, info: 0, warning: 1 })
    })

    test('objects with file and line fields', () => {
      const violations = [
        { severity: 'error' as const, file: 'index.ts', line: 42 },
        { severity: 'error' as const, file: 'app.ts', line: 10 },
        { severity: 'info' as const, file: 'utils.ts', line: 5 },
      ]
      expect(countSeverities(violations as any)).toEqual({ error: 2, info: 1, warning: 0 })
    })

    test('objects with rule and suggestion fields', () => {
      const violations = [
        { severity: 'warning' as const, rule: 'no-console', suggestion: 'Use logger' },
        { severity: 'warning' as const, rule: 'prefer-const', suggestion: 'Use const' },
      ]
      expect(countSeverities(violations as any)).toEqual({ error: 0, info: 0, warning: 2 })
    })

    test('objects with many extra fields', () => {
      const violations = [
        {
          severity: 'error' as const,
          message: 'err',
          file: 'a.ts',
          line: 1,
          column: 1,
          rule: 'rule1',
          fix: null,
        },
      ]
      expect(countSeverities(violations as any)).toEqual({ error: 1, info: 0, warning: 0 })
    })
  })

  describe('cross-function consistency', () => {
    test('formatTime and formatTimeSeconds produce consistent second values', () => {
      const ms = 5000
      const timeStr = formatTime(ms)
      const secStr = formatTimeSeconds(ms, 2)
      expect(timeStr).toBe(`${secStr}s`)
    })

    test('formatTime and formatTimeSeconds agree for 2345ms', () => {
      expect(formatTime(2345)).toBe(`${formatTimeSeconds(2345, 2)}s`)
    })

    test('formatTime and formatTimeSeconds agree for 9999ms', () => {
      expect(formatTime(9999)).toBe(`${formatTimeSeconds(9999, 2)}s`)
    })

    test('all format functions return string type for same input', () => {
      const val = 1500
      expect(typeof formatTime(val)).toBe('string')
      expect(typeof formatTimeSeconds(val)).toBe('string')
      expect(typeof formatPercentage(val)).toBe('string')
    })

    test('all format functions handle zero', () => {
      expect(typeof formatTime(0)).toBe('string')
      expect(typeof formatTimeSeconds(0)).toBe('string')
      expect(typeof formatPercentage(0)).toBe('string')
    })

    test('all format functions handle NaN', () => {
      expect(typeof formatTime(NaN)).toBe('string')
      expect(typeof formatTimeSeconds(NaN)).toBe('string')
      expect(typeof formatPercentage(NaN)).toBe('string')
    })
  })

  describe('formatTime specific millisecond values', () => {
    test('123ms', () => {
      expect(formatTime(123)).toBe('123ms')
    })

    test('456ms', () => {
      expect(formatTime(456)).toBe('456ms')
    })

    test('789ms', () => {
      expect(formatTime(789)).toBe('789ms')
    })

    test('1ms', () => {
      expect(formatTime(1)).toBe('1ms')
    })

    test('10ms', () => {
      expect(formatTime(10)).toBe('10ms')
    })

    test('100ms', () => {
      expect(formatTime(100)).toBe('100ms')
    })
  })

  describe('formatTime specific second values', () => {
    test('1.5 seconds', () => {
      expect(formatTime(1500)).toBe('1.50s')
    })

    test('2.5 seconds', () => {
      expect(formatTime(2500)).toBe('2.50s')
    })

    test('5 seconds', () => {
      expect(formatTime(5000)).toBe('5.00s')
    })

    test('10 seconds', () => {
      expect(formatTime(10000)).toBe('10.00s')
    })

    test('30 seconds', () => {
      expect(formatTime(30000)).toBe('30.00s')
    })

    test('45 seconds', () => {
      expect(formatTime(45000)).toBe('45.00s')
    })

    test('90 seconds', () => {
      expect(formatTime(90000)).toBe('90.00s')
    })

    test('120 seconds', () => {
      expect(formatTime(120000)).toBe('120.00s')
    })

    test('300 seconds', () => {
      expect(formatTime(300000)).toBe('300.00s')
    })
  })

  describe('formatTimeSeconds specific decimal outputs', () => {
    test('1ms = 0.001 seconds', () => {
      expect(formatTimeSeconds(1)).toBe('0.001')
    })

    test('10ms = 0.01 seconds', () => {
      expect(formatTimeSeconds(10)).toBe('0.010')
    })

    test('100ms = 0.1 seconds', () => {
      expect(formatTimeSeconds(100)).toBe('0.100')
    })

    test('7ms = 0.007 seconds', () => {
      expect(formatTimeSeconds(7)).toBe('0.007')
    })

    test('77ms = 0.077 seconds', () => {
      expect(formatTimeSeconds(77)).toBe('0.077')
    })

    test('777ms = 0.777 seconds', () => {
      expect(formatTimeSeconds(777)).toBe('0.777')
    })

    test('7777ms = 7.777 seconds', () => {
      expect(formatTimeSeconds(7777)).toBe('7.777')
    })

    test('77777ms = 77.777 seconds', () => {
      expect(formatTimeSeconds(77777)).toBe('77.777')
    })
  })

  describe('formatPercentage specific decimal edge cases', () => {
    test('exactly 0.5 with various decimals', () => {
      expect(formatPercentage(0.5, 0)).toBe('1%')
      expect(formatPercentage(0.5, 1)).toBe('0.5%')
      expect(formatPercentage(0.5, 2)).toBe('0.50%')
      expect(formatPercentage(0.5, 3)).toBe('0.500%')
    })

    test('exactly 99.5 with various decimals', () => {
      expect(formatPercentage(99.5, 0)).toBe('100%')
      expect(formatPercentage(99.5, 1)).toBe('99.5%')
      expect(formatPercentage(99.5, 2)).toBe('99.50%')
    })

    test('pi percentage', () => {
      expect(formatPercentage(Math.PI, 4)).toBe(`${Math.PI.toFixed(4)}%`)
    })

    test('e percentage', () => {
      expect(formatPercentage(Math.E, 4)).toBe(`${Math.E.toFixed(4)}%`)
    })
  })

  describe('formatBytes', () => {
    test('formats 0 bytes', () => {
      expect(formatBytes(0)).toBe('0.0 B')
    })

    test('formats bytes under 1KB', () => {
      expect(formatBytes(100)).toBe('100.0 B')
      expect(formatBytes(512)).toBe('512.0 B')
      expect(formatBytes(1023)).toBe('1023.0 B')
    })

    test('formats kilobytes', () => {
      expect(formatBytes(1024)).toBe('1.0 KB')
      expect(formatBytes(1536)).toBe('1.5 KB')
      expect(formatBytes(5120)).toBe('5.0 KB')
    })

    test('formats megabytes', () => {
      expect(formatBytes(1048576)).toBe('1.0 MB')
      expect(formatBytes(5242880)).toBe('5.0 MB')
    })

    test('formats gigabytes', () => {
      expect(formatBytes(1073741824)).toBe('1.0 GB')
    })

    test('formats terabytes', () => {
      expect(formatBytes(1099511627776)).toBe('1.0 TB')
    })

    test('respects custom decimals', () => {
      expect(formatBytes(1536, 0)).toBe('2 KB')
      expect(formatBytes(1536, 2)).toBe('1.50 KB')
      expect(formatBytes(1536, 3)).toBe('1.500 KB')
    })

    test('handles 0 with custom decimals', () => {
      expect(formatBytes(0, 0)).toBe('0 B')
      expect(formatBytes(0, 2)).toBe('0.00 B')
    })

    test('returns string type', () => {
      expect(typeof formatBytes(0)).toBe('string')
      expect(typeof formatBytes(1024)).toBe('string')
    })
  })

  describe('formatDuration', () => {
    test('formats milliseconds under 1 second', () => {
      expect(formatDuration(0)).toBe('0ms')
      expect(formatDuration(100)).toBe('100ms')
      expect(formatDuration(500)).toBe('500ms')
      expect(formatDuration(999)).toBe('999ms')
    })

    test('formats seconds', () => {
      expect(formatDuration(1000)).toBe('1.0s')
      expect(formatDuration(5000)).toBe('5.0s')
      expect(formatDuration(30000)).toBe('30.0s')
      expect(formatDuration(59999)).toBe('60.0s')
    })

    test('formats minutes and seconds', () => {
      expect(formatDuration(60000)).toBe('1m 0s')
      expect(formatDuration(90000)).toBe('1m 30s')
      expect(formatDuration(120000)).toBe('2m 0s')
      expect(formatDuration(3661000)).toBe('61m 1s')
    })

    test('returns string type', () => {
      expect(typeof formatDuration(0)).toBe('string')
      expect(typeof formatDuration(1000)).toBe('string')
      expect(typeof formatDuration(60000)).toBe('string')
    })
  })
})
