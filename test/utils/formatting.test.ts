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
