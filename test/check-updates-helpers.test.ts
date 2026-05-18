import { describe, it, expect } from 'vitest'
import {
  parseNpmOutput,
  parseAuditOutput,
  formatOutdatedTable,
  formatSecuritySummary,
  buildJsonResult,
  formatJsonOutput,
  createOutdatedError,
  createAuditError,
  createUpdateError,
  createFixSecurityError,
} from '../src/commands/check-updates-helpers.js'
import { SystemError } from '../src/utils/errors.js'

// ─── parseNpmOutput ────────────────────────────────────
describe('parseNpmOutput', () => {
  it('returns empty array for empty string', () => {
    expect(parseNpmOutput('')).toEqual([])
  })

  it('returns empty array for whitespace-only string', () => {
    expect(parseNpmOutput('   ')).toEqual([])
  })

  it('parses single package', () => {
    const input = JSON.stringify({
      lodash: { current: '4.17.0', dependent: 'root', latest: '4.17.21', wanted: '4.17.21' },
    })
    const result = parseNpmOutput(input)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      name: 'lodash',
      current: '4.17.0',
      dependent: 'root',
      latest: '4.17.21',
      wanted: '4.17.21',
    })
  })

  it('parses multiple packages', () => {
    const input = JSON.stringify({
      lodash: { current: '4.17.0', dependent: 'root', latest: '4.17.21', wanted: '4.17.21' },
      express: { current: '4.18.0', dependent: 'app', latest: '4.19.0', wanted: '4.18.3' },
    })
    const result = parseNpmOutput(input)
    expect(result).toHaveLength(2)
    expect(result.map((p) => p.name)).toContain('lodash')
    expect(result.map((p) => p.name)).toContain('express')
  })

  it('throws on invalid JSON', () => {
    expect(() => parseNpmOutput('not json')).toThrow()
  })
})

// ─── parseAuditOutput ──────────────────────────────────
describe('parseAuditOutput', () => {
  it('parses valid audit output', () => {
    const input = JSON.stringify({
      metadata: {
        vulnerabilities: { critical: 1, high: 2, info: 0, low: 3, moderate: 1, total: 7 },
      },
    })
    const result = parseAuditOutput(input)
    expect(result.vulnerabilities.total).toBe(7)
    expect(result.vulnerabilities.critical).toBe(1)
    expect(result.vulnerabilities.high).toBe(2)
  })

  it('parses audit output with zero vulnerabilities', () => {
    const input = JSON.stringify({
      metadata: {
        vulnerabilities: { critical: 0, high: 0, info: 0, low: 0, moderate: 0, total: 0 },
      },
    })
    const result = parseAuditOutput(input)
    expect(result.vulnerabilities.total).toBe(0)
  })

  it('throws CLIError on missing metadata', () => {
    const input = JSON.stringify({ something: 'else' })
    expect(() => parseAuditOutput(input)).toThrow('Invalid audit response format')
  })

  it('throws CLIError on missing vulnerabilities in metadata', () => {
    const input = JSON.stringify({ metadata: {} })
    expect(() => parseAuditOutput(input)).toThrow('Invalid audit response format')
  })
})

// ─── formatOutdatedTable ───────────────────────────────
describe('formatOutdatedTable', () => {
  it('shows up-to-date message when empty', () => {
    const logs: string[] = []
    formatOutdatedTable([], (msg) => logs.push(msg))
    const output = logs.join('\n')
    expect(output).toContain('up to date')
  })

  it('shows outdated count with packages', () => {
    const logs: string[] = []
    const packages = [
      { name: 'lodash', current: '1.0.0', dependent: 'root', latest: '2.0.0', wanted: '1.1.0' },
    ]
    formatOutdatedTable(packages, (msg) => logs.push(msg))
    const output = logs.join('\n')
    expect(output).toContain('1 outdated')
    expect(output).toContain('lodash')
    expect(output).toContain('1.0.0')
    expect(output).toContain('2.0.0')
  })

  it('shows npm update hint', () => {
    const logs: string[] = []
    const packages = [
      { name: 'foo', current: '1.0.0', dependent: 'root', latest: '2.0.0', wanted: '1.1.0' },
    ]
    formatOutdatedTable(packages, (msg) => logs.push(msg))
    const output = logs.join('\n')
    expect(output).toContain('npm update')
  })

  it('displays multiple packages', () => {
    const logs: string[] = []
    const packages = [
      { name: 'foo', current: '1.0.0', dependent: 'root', latest: '2.0.0', wanted: '1.1.0' },
      { name: 'bar', current: '3.0.0', dependent: 'root', latest: '4.0.0', wanted: '3.1.0' },
    ]
    formatOutdatedTable(packages, (msg) => logs.push(msg))
    const output = logs.join('\n')
    expect(output).toContain('foo')
    expect(output).toContain('bar')
    expect(output).toContain('2 outdated')
  })
})

// ─── formatSecuritySummary ─────────────────────────────
describe('formatSecuritySummary', () => {
  it('shows clean message when no vulnerabilities', () => {
    const logs: string[] = []
    formatSecuritySummary(
      { vulnerabilities: { critical: 0, high: 0, info: 0, low: 0, moderate: 0, total: 0 } },
      (msg) => logs.push(msg),
    )
    const output = logs.join('\n')
    expect(output).toContain('No security vulnerabilities')
  })

  it('shows vulnerability count', () => {
    const logs: string[] = []
    formatSecuritySummary(
      { vulnerabilities: { critical: 1, high: 2, info: 0, low: 3, moderate: 1, total: 7 } },
      (msg) => logs.push(msg),
    )
    const output = logs.join('\n')
    expect(output).toContain('7 security vulnerabilities')
    expect(output).toContain('Critical')
    expect(output).toContain('High')
    expect(output).toContain('Moderate')
    expect(output).toContain('Low')
  })

  it('omits zero-count categories', () => {
    const logs: string[] = []
    formatSecuritySummary(
      { vulnerabilities: { critical: 1, high: 0, info: 0, low: 0, moderate: 0, total: 1 } },
      (msg) => logs.push(msg),
    )
    const output = logs.join('\n')
    expect(output).toContain('Critical')
    expect(output).not.toContain('High')
    expect(output).not.toContain('Moderate')
    expect(output).not.toContain('Low')
    expect(output).not.toContain('Info')
  })

  it('shows info category when present', () => {
    const logs: string[] = []
    formatSecuritySummary(
      { vulnerabilities: { critical: 0, high: 0, info: 5, low: 0, moderate: 0, total: 5 } },
      (msg) => logs.push(msg),
    )
    const output = logs.join('\n')
    expect(output).toContain('Info')
  })

  it('shows npm audit fix hint', () => {
    const logs: string[] = []
    formatSecuritySummary(
      { vulnerabilities: { critical: 1, high: 0, info: 0, low: 0, moderate: 0, total: 1 } },
      (msg) => logs.push(msg),
    )
    const output = logs.join('\n')
    expect(output).toContain('npm audit fix')
  })
})

// ─── buildJsonResult ───────────────────────────────────
describe('buildJsonResult', () => {
  it('builds result with no errors', () => {
    const result = buildJsonResult([], null, null, null)
    expect(result).toEqual({ error: null, outdated: [], security: null })
  })

  it('includes outdated error only', () => {
    const result = buildJsonResult([], null, 'outdated failed', null)
    expect(result.error).toBe('outdated failed')
  })

  it('includes security error only', () => {
    const result = buildJsonResult([], null, null, 'security failed')
    expect(result.error).toBe('security failed')
  })

  it('combines both errors with semicolon', () => {
    const result = buildJsonResult([], null, 'err1', 'err2')
    expect(result.error).toBe('err1; err2')
  })

  it('includes outdated and security data', () => {
    const outdated = [{ name: 'foo', current: '1.0', dependent: 'root', latest: '2.0', wanted: '1.1' }]
    const security = { critical: 0, high: 1, info: 0, low: 0, moderate: 0, total: 1 }
    const result = buildJsonResult(outdated, security, null, null)
    expect(result.outdated).toEqual(outdated)
    expect(result.security).toEqual(security)
  })
})

// ─── formatJsonOutput ──────────────────────────────────
describe('formatJsonOutput', () => {
  it('produces valid JSON', () => {
    const result = formatJsonOutput({ error: null, outdated: [], security: null })
    const parsed = JSON.parse(result)
    expect(parsed.error).toBeNull()
    expect(parsed.outdated).toEqual([])
  })

  it('pretty-prints with 2-space indent', () => {
    const result = formatJsonOutput({ error: null, outdated: [], security: null })
    expect(result).toContain('  "error"')
    expect(result).toContain('  "outdated"')
  })
})

// ─── createOutdatedError ───────────────────────────────
describe('createOutdatedError', () => {
  it('creates a SystemError with code E504', () => {
    const err = createOutdatedError(new Error('test'))
    expect(err).toBeInstanceOf(SystemError)
    expect(err.code).toBe('E504')
    expect(err.message).toContain('outdated')
  })

  it('preserves the cause', () => {
    const cause = new Error('npm failed')
    const err = createOutdatedError(cause)
    expect(err.cause).toBe(cause)
  })
})

// ─── createAuditError ──────────────────────────────────
describe('createAuditError', () => {
  it('creates a SystemError with code E505', () => {
    const err = createAuditError(new Error('test'))
    expect(err).toBeInstanceOf(SystemError)
    expect(err.code).toBe('E505')
    expect(err.message).toContain('security audit')
  })
})

// ─── createUpdateError ─────────────────────────────────
describe('createUpdateError', () => {
  it('creates a SystemError with code E506', () => {
    const err = createUpdateError(new Error('test'))
    expect(err).toBeInstanceOf(SystemError)
    expect(err.code).toBe('E506')
    expect(err.message).toContain('update dependencies')
  })
})

// ─── createFixSecurityError ────────────────────────────
describe('createFixSecurityError', () => {
  it('creates a SystemError with code E503', () => {
    const err = createFixSecurityError(new Error('test'))
    expect(err).toBeInstanceOf(SystemError)
    expect(err.code).toBe('E503')
    expect(err.message).toContain('security vulnerabilities')
  })
})
