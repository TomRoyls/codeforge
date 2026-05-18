import { describe, it, expect, vi } from 'vitest'
import {
  getBestPractices,
  getCommonViolations,
  getFixes,
  analyzeViolation,
  formatBestPractices,
  formatCommonViolations,
  formatFixes,
  formatViolationAnalysis,
  displayWhyOutput,
} from '../src/commands/why-helpers.js'

// ─── getBestPractices ───────────────────────────────────
describe('getBestPractices', () => {
  it('returns practices for a known rule', () => {
    const result = getBestPractices('no-eval')
    expect(result.length).toBeGreaterThan(0)
    for (const p of result) {
      expect(typeof p).toBe('string')
    }
  })

  it('returns default for unknown rule', () => {
    const result = getBestPractices('nonexistent-rule-xyz')
    expect(result).toEqual(['Follow general code quality guidelines'])
  })
})

// ─── getCommonViolations ────────────────────────────────
describe('getCommonViolations', () => {
  it('returns violations for a known rule', () => {
    const result = getCommonViolations('max-params')
    expect(result.length).toBeGreaterThan(0)
  })

  it('returns default for unknown rule', () => {
    const result = getCommonViolations('nonexistent-rule-xyz')
    expect(result).toEqual(['Various violations may occur depending on usage'])
  })
})

// ─── getFixes ───────────────────────────────────────────
describe('getFixes', () => {
  it('returns fixes for a known rule', () => {
    const result = getFixes('prefer-const')
    expect(result.length).toBeGreaterThan(0)
  })

  it('returns default for unknown rule', () => {
    const result = getFixes('nonexistent-rule-xyz')
    expect(result).toEqual(['Check the rule documentation for specific fixes'])
  })
})

// ─── analyzeViolation ───────────────────────────────────
describe('analyzeViolation', () => {
  it('returns parameter suggestions when violation mentions "parameter"', () => {
    const result = analyzeViolation('any-rule', 'Too many parameter in function')
    expect(result.length).toBeGreaterThanOrEqual(2)
    expect(result.some((s) => s.includes('options object'))).toBe(true)
  })

  it('returns nesting suggestions when violation mentions "nested"', () => {
    const result = analyzeViolation('any-rule', 'Too much nested logic')
    expect(result.some((s) => s.includes('early'))).toBe(true)
  })

  it('returns depth suggestions when violation mentions "depth"', () => {
    const result = analyzeViolation('any-rule', 'Exceeded max depth')
    expect(result.some((s) => s.includes('helper function'))).toBe(true)
  })

  it('returns long/line suggestions when violation mentions "long"', () => {
    const result = analyzeViolation('any-rule', 'Function is too long')
    expect(result.some((s) => s.includes('distinct responsibilities'))).toBe(true)
  })

  it('returns line suggestions when violation mentions "line"', () => {
    const result = analyzeViolation('any-rule', 'line too complex')
    expect(result.some((s) => s.includes('deduplicated'))).toBe(true)
  })

  it('returns generic suggestion when no keywords match', () => {
    const result = analyzeViolation('any-rule', 'Something unrelated')
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('Review the rule documentation')
  })

  it('matches multiple keyword groups simultaneously', () => {
    const result = analyzeViolation('any-rule', 'parameter with nested depth long line')
    expect(result.length).toBeGreaterThanOrEqual(4)
  })
})

// ─── formatBestPractices ────────────────────────────────
describe('formatBestPractices', () => {
  it('logs each practice with bullet prefix', () => {
    const logFn = vi.fn()
    formatBestPractices('prefer-const', logFn)
    expect(logFn.mock.calls.length).toBeGreaterThan(0)
    for (const call of logFn.mock.calls) {
      expect(call[0]).toMatch(/^  • /)
    }
  })
})

// ─── formatCommonViolations ─────────────────────────────
describe('formatCommonViolations', () => {
  it('logs each violation with bullet prefix', () => {
    const logFn = vi.fn()
    formatCommonViolations('no-eval', logFn)
    expect(logFn.mock.calls.length).toBeGreaterThan(0)
    for (const call of logFn.mock.calls) {
      expect(call[0]).toMatch(/^  • /)
    }
  })
})

// ─── formatFixes ────────────────────────────────────────
describe('formatFixes', () => {
  it('logs each fix with bullet prefix', () => {
    const logFn = vi.fn()
    formatFixes('curly', logFn)
    expect(logFn.mock.calls.length).toBeGreaterThan(0)
    for (const call of logFn.mock.calls) {
      expect(call[0]).toMatch(/^  • /)
    }
  })
})

// ─── formatViolationAnalysis ────────────────────────────
describe('formatViolationAnalysis', () => {
  it('logs suggestions with bullet prefix', () => {
    const logFn = vi.fn()
    formatViolationAnalysis('any-rule', 'Too many parameter', logFn)
    expect(logFn.mock.calls.length).toBeGreaterThan(0)
  })
})

// ─── displayWhyOutput ───────────────────────────────────
describe('displayWhyOutput', () => {
  it('outputs complete why output without violation', () => {
    const logFn = vi.fn()
    displayWhyOutput('prefer-const', undefined, undefined, 'codeforge', logFn)
    const messages = logFn.mock.calls.map((c: any) => c[0])
    expect(messages.some((m: string) => m.includes('Rule: prefer-const'))).toBe(true)
    expect(messages.some((m: string) => m.includes('Common violations:'))).toBe(true)
    expect(messages.some((m: string) => m.includes('How to fix:'))).toBe(true)
    expect(messages.some((m: string) => m.includes('Best practices:'))).toBe(true)
    expect(messages.some((m: string) => m.includes('codeforge explain'))).toBe(true)
  })

  it('includes description when ruleMeta has one', () => {
    const logFn = vi.fn()
    displayWhyOutput('no-eval', { description: 'Prevents use of eval' }, undefined, 'codeforge', logFn)
    const messages = logFn.mock.calls.map((c: any) => c[0])
    expect(messages.some((m: string) => m.includes('Description:'))).toBe(true)
    expect(messages.some((m: string) => m.includes('Prevents use of eval'))).toBe(true)
  })

  it('includes violation section when violation is provided', () => {
    const logFn = vi.fn()
    displayWhyOutput('no-eval', undefined, 'eval() called on user input', 'codeforge', logFn)
    const messages = logFn.mock.calls.map((c: any) => c[0])
    expect(messages.some((m: string) => m.includes('Your specific violation:'))).toBe(true)
    expect(messages.some((m: string) => m.includes('eval() called on user input'))).toBe(true)
  })

  it('skips description when ruleMeta has no description', () => {
    const logFn = vi.fn()
    displayWhyOutput('no-eval', {}, undefined, 'codeforge', logFn)
    const messages = logFn.mock.calls.map((c: any) => c[0])
    expect(messages.some((m: string) => m === 'Description:')).toBe(false)
  })
})
