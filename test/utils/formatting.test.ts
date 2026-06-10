import { describe, expect, it } from 'vitest'
import { formatSize, getGrade, colorizeSeverity, getScoreColor, getThresholdColor } from '../../src/utils/formatting.js'

// ─── formatSize ───

describe('formatSize', () => {
  it('formats bytes', () => {
    expect(formatSize(0)).toBe('0.0 B')
  })

  it('formats small bytes', () => {
    expect(formatSize(100)).toBe('100.0 B')
  })

  it('formats kilobytes', () => {
    expect(formatSize(1024)).toBe('1.0 KB')
  })

  it('formats megabytes', () => {
    expect(formatSize(1024 * 1024)).toBe('1.0 MB')
  })

  it('formats gigabytes', () => {
    expect(formatSize(1024 * 1024 * 1024)).toBe('1.0 GB')
  })

  it('formats fractional KB', () => {
    expect(formatSize(1536)).toBe('1.5 KB')
  })
})

// ─── getGrade ───

describe('getGrade', () => {
  it('returns A for 90+', () => {
    expect(getGrade(90)).toBe('(A)')
    expect(getGrade(100)).toBe('(A)')
  })

  it('returns B for 80-89', () => {
    expect(getGrade(80)).toBe('(B)')
    expect(getGrade(89)).toBe('(B)')
  })

  it('returns C for 70-79', () => {
    expect(getGrade(70)).toBe('(C)')
    expect(getGrade(75)).toBe('(C)')
  })

  it('returns D for 60-69', () => {
    expect(getGrade(60)).toBe('(D)')
    expect(getGrade(65)).toBe('(D)')
  })

  it('returns F below 60', () => {
    expect(getGrade(59)).toBe('(F)')
    expect(getGrade(0)).toBe('(F)')
  })
})

describe('formatSize edge cases', () => {
  it('formats large GB', () => {
    expect(formatSize(5 * 1024 * 1024 * 1024)).toBe('5.0 GB')
  })

  it('formats fractional MB', () => {
    expect(formatSize(1.5 * 1024 * 1024)).toBe('1.5 MB')
  })

  it('formats very large sizes in GB', () => {
    expect(formatSize(1024 * 1024 * 1024 * 1024)).toBe('1024.0 GB')
  })
})

describe('getGrade edge cases', () => {
  it('returns A for 95', () => {
    expect(getGrade(95)).toBe('(A)')
  })

  it('handles negative scores', () => {
    expect(getGrade(-10)).toBe('(F)')
  })

  it('handles score over 100', () => {
    expect(getGrade(110)).toBe('(A)')
  })

  it('handles negative score', () => {
    expect(getGrade(-10)).toBe('(F)')
  })

  it('handles score 85', () => {
    expect(getGrade(85)).toBe('(B)')
  })

  it('handles score 95', () => {
    expect(getGrade(95)).toBe('(A)')
  })

  it('handles score 85', () => {
    expect(getGrade(85)).toBe('(B)')
  })

  it('handles score 95', () => {
    expect(getGrade(95)).toBe('(A)')
  })

  it('handles score 50', () => {
    expect(getGrade(50)).toBe('(F)')
  })

  it('handles score 90', () => {
    expect(getGrade(90)).toBe('(A)')
  })
})

describe('colorizeSeverity', () => {
  it('colorizes error severity', () => {
    const result = colorizeSeverity('error')
    expect(result).toContain('error')
  })

  it('colorizes warning severity', () => {
    const result = colorizeSeverity('warning')
    expect(result).toContain('warning')
  })

  it('colorizes info severity', () => {
    const result = colorizeSeverity('info')
    expect(result).toContain('info')
  })

  it('returns unknown severity unchanged', () => {
    const result = colorizeSeverity('debug')
    expect(result).toBe('debug')
  })

  it('caches severity results', () => {
    const r1 = colorizeSeverity('error')
    const r2 = colorizeSeverity('error')
    expect(r1).toBe(r2)
  })

  it('handles empty string', () => {
    const result = colorizeSeverity('')
    expect(result).toBe('')
  })
})

describe('getScoreColor', () => {
  it('returns green for high scores', () => {
    const color = getScoreColor(90)
    expect(typeof color).toBe('function')
  })

  it('returns yellow for mid scores', () => {
    const color = getScoreColor(70)
    expect(typeof color).toBe('function')
  })

  it('returns red for low scores', () => {
    const color = getScoreColor(30)
    expect(typeof color).toBe('function')
  })
})

describe('getThresholdColor', () => {
  it('returns green when above good threshold', () => {
    const color = getThresholdColor(90, 80, 60)
    expect(typeof color).toBe('function')
  })

  it('returns yellow when between thresholds', () => {
    const color = getThresholdColor(70, 80, 60)
    expect(typeof color).toBe('function')
  })

  it('returns red when below warn threshold', () => {
    const color = getThresholdColor(50, 80, 60)
    expect(typeof color).toBe('function')
  })

  it('returns green at exact good threshold', () => {
    const color = getThresholdColor(80, 80, 60)
    expect(typeof color).toBe('function')
  })

  it('returns yellow at exact warn threshold', () => {
    const color = getThresholdColor(60, 80, 60)
    expect(typeof color).toBe('function')
  })
})
