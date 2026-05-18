import { describe, it, expect } from 'vitest'
import { GitLabReporter } from '../../src/reporters/gitlab-reporter.js'
import type { Violation } from '../../src/reporters/types.js'

// ─── Helpers ──────────────────────────────────────────

function makeViolation(overrides: Partial<Violation> = {}): Violation {
  return {
    column: 10,
    filePath: 'src/index.ts',
    line: 5,
    message: 'Unexpected console statement',
    ruleId: 'no-console',
    severity: 'error',
    ...overrides,
  }
}

// ─── GitLabReporter.name ──────────────────────────────

describe('GitLabReporter', () => {
  it('has name "gitlab"', () => {
    const reporter = new GitLabReporter()
    expect(reporter.name).toBe('gitlab')
  })

  // ─── format ─────────────────────────────────────────

  it('format() produces valid JSON with required fields', () => {
    const reporter = new GitLabReporter()
    const violation = makeViolation()
    const raw = reporter.format(violation)
    const parsed = JSON.parse(raw)

    expect(parsed).toHaveProperty('description')
    expect(parsed).toHaveProperty('fingerprint')
    expect(parsed).toHaveProperty('location')
    expect(parsed).toHaveProperty('severity')
    expect(parsed.location).toHaveProperty('path')
    expect(parsed.location).toHaveProperty('lines')
    expect(parsed.location.lines).toHaveProperty('begin')
    expect(parsed.description).toBe('Unexpected console statement')
    expect(parsed.location.path).toBe('src/index.ts')
    expect(parsed.location.lines.begin).toBe(5)
  })

  // ─── severity mapping ───────────────────────────────

  it('maps error severity to "major"', () => {
    const reporter = new GitLabReporter()
    const violation = makeViolation({ severity: 'error' })
    const parsed = JSON.parse(reporter.format(violation))
    expect(parsed.severity).toBe('major')
  })

  it('maps warning severity to "minor"', () => {
    const reporter = new GitLabReporter()
    const violation = makeViolation({ severity: 'warning' })
    const parsed = JSON.parse(reporter.format(violation))
    expect(parsed.severity).toBe('minor')
  })

  it('maps info severity to "info"', () => {
    const reporter = new GitLabReporter()
    const violation = makeViolation({ severity: 'info' })
    const parsed = JSON.parse(reporter.format(violation))
    expect(parsed.severity).toBe('info')
  })

  // ─── fingerprint ────────────────────────────────────

  it('produces a deterministic MD5 hex fingerprint', () => {
    const reporter = new GitLabReporter()
    const violation = makeViolation()
    const first = JSON.parse(reporter.format(violation))
    const second = JSON.parse(reporter.format(violation))
    expect(first.fingerprint).toBe(second.fingerprint)
    expect(first.fingerprint).toMatch(/^[0-9a-f]{32}$/)
  })

  it('produces different fingerprints for different violations', () => {
    const reporter = new GitLabReporter()
    const a = makeViolation({ ruleId: 'no-console' })
    const b = makeViolation({ ruleId: 'prefer-const' })
    const fpA = JSON.parse(reporter.format(a)).fingerprint
    const fpB = JSON.parse(reporter.format(b)).fingerprint
    expect(fpA).not.toBe(fpB)
  })

  // ─── source (content.body) ──────────────────────────

  it('format() with source includes content.body', () => {
    const reporter = new GitLabReporter()
    const violation = makeViolation({ source: 'console.log("x")' })
    const parsed = JSON.parse(reporter.format(violation))
    expect(parsed.content).toBeDefined()
    expect(parsed.content.body).toBe('console.log("x")')
  })

  it('format() without source omits content', () => {
    const reporter = new GitLabReporter()
    const violation = makeViolation()
    const parsed = JSON.parse(reporter.format(violation))
    expect(parsed.content).toBeUndefined()
  })
})
