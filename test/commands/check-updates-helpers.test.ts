import { describe, expect, it } from 'vitest'

import {
  buildJsonResult,
  createAuditError,
  createFixSecurityError,
  createOutdatedError,
  createUpdateError,
  formatJsonOutput,
  parseAuditOutput,
  parseNpmOutput,
  type OutdatedPackage,
  type AuditMetadata,
} from '../../src/commands/check-updates-helpers.js'

// ─── parseNpmOutput ───

describe('parseNpmOutput', () => {
  it('returns empty array for empty/whitespace input', () => {
    expect(parseNpmOutput('')).toEqual([])
    expect(parseNpmOutput('   ')).toEqual([])
  })

  it('parses valid npm outdated output', () => {
    const stdout = JSON.stringify({
      lodash: { current: '4.17.0', dependent: 'my-project', latest: '4.17.21', wanted: '4.17.21' },
      chalk: { current: '4.0.0', dependent: 'my-project', latest: '5.3.0', wanted: '4.1.0' },
    })
    const result = parseNpmOutput(stdout)
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('lodash')
    expect(result[0].current).toBe('4.17.0')
    expect(result[1].name).toBe('chalk')
  })

  it('handles single package', () => {
    const stdout = JSON.stringify({
      express: { current: '4.18.0', dependent: 'app', latest: '4.18.2', wanted: '4.18.2' },
    })
    const result = parseNpmOutput(stdout)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('express')
  })
})

// ─── parseAuditOutput ───

describe('parseAuditOutput', () => {
  it('parses valid audit output', () => {
    const stdout = JSON.stringify({
      metadata: {
        vulnerabilities: { critical: 1, high: 2, info: 0, low: 3, moderate: 1, total: 7 },
      },
    })
    const result = parseAuditOutput(stdout)
    expect(result.vulnerabilities.total).toBe(7)
    expect(result.vulnerabilities.critical).toBe(1)
  })

  it('throws on invalid format missing metadata', () => {
    const stdout = JSON.stringify({ something: 'else' })
    expect(() => parseAuditOutput(stdout)).toThrow()
  })

  it('throws on missing vulnerabilities', () => {
    const stdout = JSON.stringify({ metadata: {} })
    expect(() => parseAuditOutput(stdout)).toThrow()
  })
})

// ─── buildJsonResult ───

describe('buildJsonResult', () => {
  it('builds result with no errors', () => {
    const outdated: OutdatedPackage[] = []
    const result = buildJsonResult(outdated, null, null, null)
    expect(result.error).toBeNull()
    expect(result.outdated).toEqual([])
    expect(result.security).toBeNull()
  })

  it('combines multiple errors', () => {
    const result = buildJsonResult([], null, 'err1', 'err2')
    expect(result.error).toBe('err1; err2')
  })

  it('uses only security error when no outdated error', () => {
    const result = buildJsonResult([], null, null, 'sec err')
    expect(result.error).toBe('sec err')
  })

  it('includes vulnerability data', () => {
    const vulns: AuditMetadata['vulnerabilities'] = {
      critical: 0, high: 1, info: 0, low: 0, moderate: 0, total: 1,
    }
    const result = buildJsonResult([], vulns, null, null)
    expect(result.security).toBe(vulns)
  })
})

// ─── formatJsonOutput ───

describe('formatJsonOutput', () => {
  it('produces valid JSON', () => {
    const result = formatJsonOutput({ error: null, outdated: [], security: null })
    const parsed = JSON.parse(result)
    expect(parsed.error).toBeNull()
  })

  it('pretty prints with 2-space indent', () => {
    const result = formatJsonOutput({ error: null, outdated: [], security: null })
    expect(result).toContain('  ')
  })
})

// ─── Error constructors ───

describe('error constructors', () => {
  it('createOutdatedError creates SystemError', () => {
    const err = createOutdatedError(new Error('npm failed'))
    expect(err.message).toContain('outdated')
  })

  it('createAuditError creates SystemError', () => {
    const err = createAuditError(new Error('audit failed'))
    expect(err.message).toContain('security audit')
  })

  it('createUpdateError creates SystemError', () => {
    const err = createUpdateError(new Error('update failed'))
    expect(err.message).toContain('update')
  })

  it('createFixSecurityError creates SystemError', () => {
    const err = createFixSecurityError(new Error('fix failed'))
    expect(err.message).toContain('fix')
  })
})
