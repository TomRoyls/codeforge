import { describe, it, expect } from 'vitest'

import { colorMessage, displayResults, getStatusSymbol } from '../src/commands/doctor-format-helpers.js'
import type { CheckResult, DoctorResult } from '../src/commands/doctor-helpers.js'

// ─── colorMessage ──────────────────────────────────────
describe('colorMessage', () => {
  it('returns message unchanged for ok status', () => {
    const result = colorMessage('ok', 'Node.js is installed')
    expect(result).toBe('Node.js is installed')
  })

  it('returns colored message for error status', () => {
    const result = colorMessage('error', 'Missing config')
    expect(result).toContain('Missing config')
  })

  it('returns colored message for warning status', () => {
    const result = colorMessage('warning', 'Outdated version')
    expect(result).toContain('Outdated version')
  })
})

// ─── getStatusSymbol ───────────────────────────────────
describe('getStatusSymbol', () => {
  it('returns green checkmark for ok', () => {
    const result = getStatusSymbol('ok')
    expect(result).toContain('✓')
  })

  it('returns red cross for error', () => {
    const result = getStatusSymbol('error')
    expect(result).toContain('✗')
  })

  it('returns yellow warning for warning', () => {
    const result = getStatusSymbol('warning')
    expect(result).toContain('⚠')
  })
})

// ─── displayResults ────────────────────────────────────
describe('displayResults', () => {
  function makeDoctorResult(overrides?: Partial<DoctorResult>): DoctorResult {
    return {
      checks: [],
      errors: 0,
      passed: true,
      warnings: 0,
      ...overrides,
    }
  }

  it('returns "All checks passed!" for zero errors and warnings', () => {
    const result = displayResults(makeDoctorResult(), false)
    expect(result.some((l) => l.includes('All checks passed!'))).toBe(true)
  })

  it('shows error count when errors > 0', () => {
    const result = displayResults(
      makeDoctorResult({ errors: 2, warnings: 1, passed: false }),
      false,
    )
    expect(result.some((l) => l.includes('2 error(s)') && l.includes('1 warning(s)'))).toBe(true)
  })

  it('shows warning count with singular "warning" for 1 warning', () => {
    const result = displayResults(
      makeDoctorResult({ warnings: 1 }),
      false,
    )
    expect(result.some((l) => l.includes('1 warning'))).toBe(true)
  })

  it('shows warning count with plural "warnings" for multiple warnings', () => {
    const result = displayResults(
      makeDoctorResult({ warnings: 3 }),
      false,
    )
    expect(result.some((l) => l.includes('3 warnings'))).toBe(true)
  })

  it('formats each check with symbol and message', () => {
    const checks: CheckResult[] = [
      { message: 'Node.js found', status: 'ok' },
      { message: 'Config missing', status: 'error', details: 'Run codeforge init' },
    ]
    const result = displayResults(makeDoctorResult({ checks, errors: 1, passed: false }), false)
    expect(result.some((l) => l.includes('Node.js found'))).toBe(true)
    expect(result.some((l) => l.includes('Config missing'))).toBe(true)
  })

  it('excludes details when verbose is false', () => {
    const checks: CheckResult[] = [
      { message: 'Check', status: 'warning', details: 'Detail info' },
    ]
    const result = displayResults(
      makeDoctorResult({ checks, warnings: 1 }),
      false,
    )
    expect(result.some((l) => l.includes('Detail info'))).toBe(false)
  })

  it('includes details when verbose is true', () => {
    const checks: CheckResult[] = [
      { message: 'Check', status: 'warning', details: 'Detail info' },
    ]
    const result = displayResults(
      makeDoctorResult({ checks, warnings: 1 }),
      true,
    )
    expect(result.some((l) => l.includes('Detail info'))).toBe(true)
  })

  it('skips details when check has no details field', () => {
    const checks: CheckResult[] = [
      { message: 'Check without details', status: 'ok' },
    ]
    const result = displayResults(makeDoctorResult({ checks }), true)
    expect(result.some((l) => l.includes('Check without details'))).toBe(true)
  })

  it('includes a blank line before the summary', () => {
    const result = displayResults(makeDoctorResult(), false)
    const lastLineBeforeSummary = result[result.length - 2]
    expect(lastLineBeforeSummary).toBe('')
  })

  it('handles empty checks array', () => {
    const result = displayResults(makeDoctorResult(), false)
    expect(result.some((l) => l.includes('All checks passed!'))).toBe(true)
  })

  it('handles mixed check statuses', () => {
    const checks: CheckResult[] = [
      { message: 'OK check', status: 'ok' },
      { message: 'Warning check', status: 'warning' },
      { message: 'Error check', status: 'error' },
    ]
    const result = displayResults(
      makeDoctorResult({ checks, errors: 1, warnings: 1, passed: false }),
      false,
    )
    expect(result.some((l) => l.includes('OK check'))).toBe(true)
    expect(result.some((l) => l.includes('Warning check'))).toBe(true)
    expect(result.some((l) => l.includes('Error check'))).toBe(true)
  })
})
