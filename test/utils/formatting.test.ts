import { describe, expect, it } from 'vitest'
import { formatSize, getGrade } from '../../src/utils/formatting.js'

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
})
