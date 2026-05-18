import { describe, expect, it } from 'vitest'

import { analyzeViolation, getBestPractices, getCommonViolations, getFixes } from '../../src/commands/why-helpers.js'

// ─── analyzeViolation ───

describe('analyzeViolation', () => {
  it('returns suggestions for parameter-related violations', () => {
    const result = analyzeViolation('max-params', 'Too many parameter')
    expect(result.length).toBeGreaterThan(0)
    expect(result.some((s) => s.toLowerCase().includes('parameter') || s.toLowerCase().includes('options'))).toBe(true)
  })

  it('returns suggestions for nested/depth violations', () => {
    const result = analyzeViolation('max-depth', 'Too much nesting depth')
    expect(result.some((s) => s.toLowerCase().includes('nest') || s.toLowerCase().includes('return'))).toBe(true)
  })

  it('returns suggestions for long/line violations', () => {
    const result = analyzeViolation('max-lines', 'Function too long')
    expect(result.some((s) => s.toLowerCase().includes('extract') || s.toLowerCase().includes('function'))).toBe(true)
  })

  it('returns default suggestion for unknown violations', () => {
    const result = analyzeViolation('unknown-rule', 'something generic')
    expect(result.length).toBeGreaterThan(0)
  })
})

// ─── getBestPractices ───

describe('getBestPractices', () => {
  it('returns an array for any rule id', () => {
    const result = getBestPractices('nonexistent-rule')
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
  })
})

// ─── getCommonViolations ───

describe('getCommonViolations', () => {
  it('returns an array for any rule id', () => {
    const result = getCommonViolations('nonexistent-rule')
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
  })
})

// ─── getFixes ───

describe('getFixes', () => {
  it('returns an array for any rule id', () => {
    const result = getFixes('nonexistent-rule')
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
  })
})
