import { describe, expect, it } from 'vitest'
import { formatTime, formatTimeSeconds, formatPercentage, countSeverities, formatNumber, formatBytes, formatBytesCompact, formatDuration, padRight, padLeft } from '../../src/utils/format-utils.js'

// ─── formatTime ───

describe('formatTime', () => {
  it('formats milliseconds below threshold', () => {
    expect(formatTime(500)).toBe('500ms')
  })

  it('formats zero ms', () => {
    expect(formatTime(0)).toBe('0ms')
  })

  it('formats seconds at threshold', () => {
    expect(formatTime(1000)).toBe('1.00s')
  })

  it('formats large milliseconds', () => {
    expect(formatTime(2500)).toBe('2.50s')
  })
})

// ─── formatTimeSeconds ───

describe('formatTimeSeconds', () => {
  it('formats ms to seconds', () => {
    expect(formatTimeSeconds(1234)).toBe('1.234')
  })

  it('respects decimals parameter', () => {
    expect(formatTimeSeconds(1234, 1)).toBe('1.2')
  })

  it('formats zero', () => {
    expect(formatTimeSeconds(0)).toBe('0.000')
  })
})

// ─── formatPercentage ───

describe('formatPercentage', () => {
  it('formats percentage with default decimals', () => {
    expect(formatPercentage(85.567)).toBe('85.6%')
  })

  it('formats with custom decimals', () => {
    expect(formatPercentage(85.567, 2)).toBe('85.57%')
  })

  it('formats zero', () => {
    expect(formatPercentage(0)).toBe('0.0%')
  })

  it('formats 100', () => {
    expect(formatPercentage(100)).toBe('100.0%')
  })
})

// ─── countSeverities ───

describe('countSeverities', () => {
  it('counts empty array', () => {
    expect(countSeverities([])).toEqual({ error: 0, info: 0, warning: 0 })
  })

  it('counts mixed severities', () => {
    const violations = [
      { severity: 'error' as const },
      { severity: 'warning' as const },
      { severity: 'error' as const },
      { severity: 'info' as const },
    ]
    expect(countSeverities(violations)).toEqual({ error: 2, info: 1, warning: 1 })
  })

  it('counts only errors', () => {
    const violations = [
      { severity: 'error' as const },
      { severity: 'error' as const },
    ]
    expect(countSeverities(violations)).toEqual({ error: 2, info: 0, warning: 0 })
  })
})

// ─── formatNumber ───

describe('formatNumber', () => {
  it('formats single digit numbers', () => {
    expect(formatNumber(0)).toBe('0')
    expect(formatNumber(5)).toBe('5')
    expect(formatNumber(9)).toBe('9')
  })

  it('formats two digit numbers without separator', () => {
    expect(formatNumber(42)).toBe('42')
    expect(formatNumber(99)).toBe('99')
  })

  it('formats three digit numbers without separator', () => {
    expect(formatNumber(100)).toBe('100')
    expect(formatNumber(999)).toBe('999')
  })

  it('formats thousands with comma', () => {
    expect(formatNumber(1000)).toBe('1,000')
    expect(formatNumber(1234)).toBe('1,234')
  })

  it('formats millions with commas', () => {
    expect(formatNumber(1000000)).toBe('1,000,000')
    expect(formatNumber(1234567)).toBe('1,234,567')
  })

  it('formats billions with commas', () => {
    expect(formatNumber(1000000000)).toBe('1,000,000,000')
  })

  it('preserves decimal places', () => {
    expect(formatNumber(1234.5)).toBe('1,234.5')
    expect(formatNumber(1234.567)).toBe('1,234.567')
  })

  it('handles negative numbers', () => {
    expect(formatNumber(-1234)).toBe('-1,234')
    expect(formatNumber(-1000000)).toBe('-1,000,000')
  })

  it('handles Infinity', () => {
    expect(formatNumber(Infinity)).toBe('Infinity')
    expect(formatNumber(-Infinity)).toBe('-Infinity')
  })

  it('handles NaN', () => {
    expect(formatNumber(NaN)).toBe('NaN')
  })
})

describe('formatBytes', () => {
  it('formats zero bytes', () => {
    expect(formatBytes(0)).toBe('0.0 B')
  })

  it('formats bytes', () => {
    expect(formatBytes(100)).toBe('100.0 B')
  })

  it('formats kilobytes', () => {
    expect(formatBytes(1024)).toBe('1.0 KB')
  })

  it('formats megabytes', () => {
    expect(formatBytes(1024 * 1024)).toBe('1.0 MB')
  })

  it('formats gigabytes', () => {
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1.0 GB')
  })

  it('formats terabytes', () => {
    expect(formatBytes(1024 ** 4)).toBe('1.0 TB')
  })

  it('respects decimals parameter', () => {
    expect(formatBytes(1536, 2)).toBe('1.50 KB')
  })

  it('formats fractional KB', () => {
    expect(formatBytes(1536)).toBe('1.5 KB')
  })
})

describe('formatBytesCompact', () => {
  it('formats bytes under 1KB', () => {
    expect(formatBytesCompact(500)).toBe('500B')
  })

  it('formats 0 bytes', () => {
    expect(formatBytesCompact(0)).toBe('0B')
  })

  it('formats kilobytes', () => {
    expect(formatBytesCompact(2048)).toBe('2.0KB')
  })

  it('formats megabytes', () => {
    expect(formatBytesCompact(2 * 1024 * 1024)).toBe('2.0MB')
  })

  it('formats large MB', () => {
    expect(formatBytesCompact(100 * 1024 * 1024)).toBe('100.0MB')
  })
})

describe('formatDuration', () => {
  it('formats milliseconds', () => {
    expect(formatDuration(500)).toBe('500ms')
  })

  it('formats zero', () => {
    expect(formatDuration(0)).toBe('0ms')
  })

  it('formats seconds', () => {
    expect(formatDuration(2500)).toBe('2.5s')
  })

  it('formats exactly one second', () => {
    expect(formatDuration(1000)).toBe('1.0s')
  })

  it('formats minutes and seconds', () => {
    expect(formatDuration(125000)).toBe('2m 5s')
  })

  it('formats exactly one minute', () => {
    expect(formatDuration(60000)).toBe('1m 0s')
  })

  it('formats large duration', () => {
    expect(formatDuration(3661000)).toBe('61m 1s')
  })
})

describe('padRight', () => {
  it('pads string to target length', () => {
    expect(padRight('hi', 5)).toBe('hi   ')
  })

  it('returns unchanged if already long enough', () => {
    expect(padRight('hello', 3)).toBe('hello')
  })

  it('returns unchanged if exactly target length', () => {
    expect(padRight('abc', 3)).toBe('abc')
  })

  it('pads empty string', () => {
    expect(padRight('', 4)).toBe('    ')
  })
})

describe('padLeft', () => {
  it('pads string to target length', () => {
    expect(padLeft('hi', 5)).toBe('   hi')
  })

  it('returns unchanged if already long enough', () => {
    expect(padLeft('hello', 3)).toBe('hello')
  })

  it('returns unchanged if exactly target length', () => {
    expect(padLeft('abc', 3)).toBe('abc')
  })

  it('pads empty string', () => {
    expect(padLeft('', 4)).toBe('    ')
  })

  it('padRight pads with spaces', () => {
    expect(padRight('hi', 5)).toBe('hi   ')
  })

  it('formatBytesCompact for small values', () => {
    expect(formatBytesCompact(500)).toBe('500B')
  })

  it('formatDuration for milliseconds', () => {
    expect(typeof formatDuration(1500)).toBe('string')
  })
})
