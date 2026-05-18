import { describe, it, expect } from 'vitest'

import Doctor from '../src/commands/doctor.js'
import {
  colorMessage,
  displayResults,
  getStatusSymbol,
  type DoctorResult,
} from '../src/commands/doctor-helpers.js'

// ─── Static metadata ────────────────────────────────────
describe('Doctor command - static metadata', () => {
  it('has a description', () => {
    expect(Doctor.description).toBe('Diagnose configuration and environment issues')
  })

  it('has examples array', () => {
    expect(Array.isArray(Doctor.examples)).toBe(true)
    expect(Doctor.examples.length).toBeGreaterThanOrEqual(3)
  })

  it('has json and verbose flags', () => {
    expect(Doctor.flags.json).toBeDefined()
    expect(Doctor.flags.json.char).toBe('j')
    expect(Doctor.flags.verbose).toBeDefined()
    expect(Doctor.flags.verbose.char).toBe('v')
  })
})

// ─── Class structure ─────────────────────────────────────
describe('Doctor command - class structure', () => {
  it('exports a default class', () => {
    expect(Doctor).toBeDefined()
    expect(typeof Doctor).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Doctor.prototype.run).toBe('function')
  })
})

// ─── colorMessage helper ─────────────────────────────────
describe('Doctor command - colorMessage helper', () => {
  it('returns uncolored message for ok status', () => {
    expect(colorMessage('ok', 'all good')).toBe('all good')
  })

  it('returns red message for error status', () => {
    const result = colorMessage('error', 'broken')
    expect(result).toContain('broken')
  })

  it('returns yellow message for warning status', () => {
    const result = colorMessage('warning', 'caution')
    expect(result).toContain('caution')
  })
})

// ─── getStatusSymbol helper ──────────────────────────────
describe('Doctor command - getStatusSymbol helper', () => {
  it('returns checkmark for ok', () => {
    const result = getStatusSymbol('ok')
    expect(result).toContain('✓')
  })

  it('returns x for error', () => {
    const result = getStatusSymbol('error')
    expect(result).toContain('✗')
  })

  it('returns warning for warning', () => {
    const result = getStatusSymbol('warning')
    expect(result).toContain('⚠')
  })
})

// ─── displayResults helper ───────────────────────────────
describe('Doctor command - displayResults helper', () => {
  it('displays all checks', () => {
    const results: DoctorResult = {
      checks: [
        { message: 'check 1', status: 'ok' },
        { message: 'check 2', status: 'warning' },
      ],
      errors: 0,
      passed: true,
      warnings: 1,
    }
    const lines = displayResults(results, false)
    expect(lines.some(l => l.includes('check 1'))).toBe(true)
    expect(lines.some(l => l.includes('check 2'))).toBe(true)
  })

  it('shows success message when passed with no warnings', () => {
    const results: DoctorResult = {
      checks: [{ message: 'ok', status: 'ok' }],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    expect(lines.some(l => l.includes('All checks passed'))).toBe(true)
  })

  it('shows error count when errors present', () => {
    const results: DoctorResult = {
      checks: [{ message: 'fail', status: 'error' }],
      errors: 1,
      passed: false,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    expect(lines.some(l => l.includes('1 error'))).toBe(true)
  })

  it('shows verbose details when verbose is true', () => {
    const results: DoctorResult = {
      checks: [{ message: 'check', status: 'ok', details: 'extra info' }],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const verboseLines = displayResults(results, true)
    const nonVerboseLines = displayResults(results, false)
    expect(verboseLines.some(l => l.includes('extra info'))).toBe(true)
    expect(nonVerboseLines.some(l => l.includes('extra info'))).toBe(false)
  })
})
