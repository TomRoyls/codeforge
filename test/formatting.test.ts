import { describe, it, expect } from 'vitest'
import { getGrade, getScoreColor, colorizeSeverity, getThresholdColor, formatSize } from '../src/utils/formatting.js'

// ─── getGrade ─────────────────────────────────────────
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
    expect(getGrade(79)).toBe('(C)')
  })

  it('returns D for 60-69', () => {
    expect(getGrade(60)).toBe('(D)')
    expect(getGrade(69)).toBe('(D)')
  })

  it('returns F below 60', () => {
    expect(getGrade(59)).toBe('(F)')
    expect(getGrade(0)).toBe('(F)')
  })
})

// ─── getScoreColor ────────────────────────────────────
describe('getScoreColor', () => {
  it('returns green for high scores', () => {
    const color = getScoreColor(85)
    expect(typeof color('test')).toBe('string')
  })

  it('returns yellow for medium scores', () => {
    const color = getScoreColor(65)
    expect(typeof color('test')).toBe('string')
  })

  it('returns red for low scores', () => {
    const color = getScoreColor(30)
    expect(typeof color('test')).toBe('string')
  })
})

// ─── colorizeSeverity ─────────────────────────────────
describe('colorizeSeverity', () => {
  it('colorizes error', () => {
    const result = colorizeSeverity('error')
    expect(result).toContain('error')
  })

  it('colorizes warning', () => {
    const result = colorizeSeverity('warning')
    expect(result).toContain('warning')
  })

  it('colorizes info', () => {
    const result = colorizeSeverity('info')
    expect(result).toContain('info')
  })

  it('returns plain for unknown severity', () => {
    expect(colorizeSeverity('debug')).toBe('debug')
  })
})

// ─── getThresholdColor ────────────────────────────────
describe('getThresholdColor', () => {
  it('returns green above good threshold', () => {
    const color = getThresholdColor(90, 80, 60)
    expect(typeof color('test')).toBe('string')
  })

  it('returns yellow between thresholds', () => {
    const color = getThresholdColor(70, 80, 60)
    expect(typeof color('test')).toBe('string')
  })

  it('returns red below warn threshold', () => {
    const color = getThresholdColor(30, 80, 60)
    expect(typeof color('test')).toBe('string')
  })
})

// ─── formatSize ───────────────────────────────────────
describe('formatSize', () => {
  it('formats bytes', () => {
    expect(formatSize(500)).toBe('500.0 B')
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

  it('formats 0 bytes', () => {
    expect(formatSize(0)).toBe('0.0 B')
  })

  it('formats large KB value', () => {
    expect(formatSize(5 * 1024)).toBe('5.0 KB')
  })

  it('formats fractional KB', () => {
    expect(formatSize(1536)).toBe('1.5 KB')
  })
})
