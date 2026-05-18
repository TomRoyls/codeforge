import { describe, expect, it } from 'vitest'

import {
  colorMessage,
  getStatusSymbol,
  displayResults,
  type CheckResult,
  type DoctorResult,
} from '../../src/commands/doctor-format-helpers.js'

// ─── colorMessage ───

describe('colorMessage', () => {
  it('returns uncolored message for ok status', () => {
    expect(colorMessage('ok', 'all good')).toBe('all good')
  })

  it('wraps message in red for error status', () => {
    const result = colorMessage('error', 'broken')
    expect(result).toContain('broken')
  })

  it('wraps message in yellow for warning status', () => {
    const result = colorMessage('warning', 'caution')
    expect(result).toContain('caution')
  })
})

// ─── getStatusSymbol ───

describe('getStatusSymbol', () => {
  it('returns checkmark for ok', () => {
    const result = getStatusSymbol('ok')
    const stripped = result.replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped).toBe('✓')
  })

  it('returns X for error', () => {
    const result = getStatusSymbol('error')
    const stripped = result.replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped).toBe('✗')
  })

  it('returns warning for warning', () => {
    const result = getStatusSymbol('warning')
    const stripped = result.replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped).toBe('⚠')
  })
})

// ─── displayResults ───

describe('displayResults', () => {
  function makeDoctorResult(
    checks: CheckResult[],
    errors: number,
    warnings: number,
  ): DoctorResult {
    return { checks, errors, warnings } as DoctorResult
  }

  it('displays check messages', () => {
    const result = makeDoctorResult(
      [{ message: 'Config OK', name: 'config', status: 'ok' }],
      0,
      0,
    )
    const lines = displayResults(result, false)
    expect(lines.some((l) => l.includes('Config OK'))).toBe(true)
  })

  it('shows error summary when errors > 0', () => {
    const result = makeDoctorResult(
      [{ message: 'Bad', name: 'x', status: 'error' }],
      1,
      0,
    )
    const lines = displayResults(result, false)
    const text = lines.join(' ')
    expect(text).toContain('1 error')
  })

  it('shows warning summary when only warnings', () => {
    const result = makeDoctorResult(
      [{ message: 'Meh', name: 'x', status: 'warning' }],
      0,
      2,
    )
    const lines = displayResults(result, false)
    const text = lines.join(' ')
    expect(text).toContain('warning')
  })

  it('shows all passed when no errors or warnings', () => {
    const result = makeDoctorResult(
      [{ message: 'OK', name: 'x', status: 'ok' }],
      0,
      0,
    )
    const lines = displayResults(result, false)
    const text = lines.join(' ')
    expect(text).toContain('passed')
  })

  it('shows details when verbose is true', () => {
    const result = makeDoctorResult(
      [{ details: 'extra info', message: 'Check', name: 'x', status: 'ok' }],
      0,
      0,
    )
    const lines = displayResults(result, true)
    expect(lines.some((l) => l.includes('extra info'))).toBe(true)
  })

  it('hides details when verbose is false', () => {
    const result = makeDoctorResult(
      [{ details: 'extra info', message: 'Check', name: 'x', status: 'ok' }],
      0,
      0,
    )
    const lines = displayResults(result, false)
    expect(lines.every((l) => !l.includes('extra info'))).toBe(true)
  })
})
