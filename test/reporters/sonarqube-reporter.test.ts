import { describe, it, expect } from 'vitest'
import { SonarQubeReporter } from '../../src/reporters/sonarqube-reporter.js'
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

// ─── SonarQubeReporter.name ───────────────────────────

describe('SonarQubeReporter', () => {
  it('has name "sonarqube"', () => {
    const reporter = new SonarQubeReporter()
    expect(reporter.name).toBe('sonarqube')
  })

  // ─── format ─────────────────────────────────────────

  it('format() produces valid JSON with required SonarQube fields', () => {
    const reporter = new SonarQubeReporter()
    const violation = makeViolation()
    const raw = reporter.format(violation)
    const parsed = JSON.parse(raw)

    expect(parsed.engineId).toBe('CodeForge')
    expect(parsed.ruleId).toBe('no-console')
    expect(parsed.primaryLocation.filePath).toBe('src/index.ts')
    expect(parsed.primaryLocation.message).toBe('Unexpected console statement')
    expect(parsed.primaryLocation.textRange).toBeDefined()
    expect(parsed.primaryLocation.textRange.startLine).toBe(5)
    expect(parsed.primaryLocation.textRange.startColumn).toBe(9)
    expect(parsed.primaryLocation.textRange.endLine).toBe(5)
    expect(parsed.primaryLocation.textRange.endColumn).toBe(9)
    expect(parsed.severity).toBeDefined()
    expect(parsed.type).toBeDefined()
  })

  // ─── severity mapping ───────────────────────────────

  it('maps error severity to "CRITICAL"', () => {
    const reporter = new SonarQubeReporter()
    const violation = makeViolation({ severity: 'error' })
    const parsed = JSON.parse(reporter.format(violation))
    expect(parsed.severity).toBe('CRITICAL')
  })

  it('maps warning severity to "MAJOR"', () => {
    const reporter = new SonarQubeReporter()
    const violation = makeViolation({ severity: 'warning' })
    const parsed = JSON.parse(reporter.format(violation))
    expect(parsed.severity).toBe('MAJOR')
  })

  it('maps info severity to "MINOR"', () => {
    const reporter = new SonarQubeReporter()
    const violation = makeViolation({ severity: 'info' })
    const parsed = JSON.parse(reporter.format(violation))
    expect(parsed.severity).toBe('MINOR')
  })

  // ─── type mapping ───────────────────────────────────

  it('maps error type to "BUG"', () => {
    const reporter = new SonarQubeReporter()
    const violation = makeViolation({ severity: 'error' })
    const parsed = JSON.parse(reporter.format(violation))
    expect(parsed.type).toBe('BUG')
  })

  it('maps warning type to "CODE_SMELL"', () => {
    const reporter = new SonarQubeReporter()
    const violation = makeViolation({ severity: 'warning' })
    const parsed = JSON.parse(reporter.format(violation))
    expect(parsed.type).toBe('CODE_SMELL')
  })

  it('maps info type to "CODE_SMELL"', () => {
    const reporter = new SonarQubeReporter()
    const violation = makeViolation({ severity: 'info' })
    const parsed = JSON.parse(reporter.format(violation))
    expect(parsed.type).toBe('CODE_SMELL')
  })

  // ─── columns are 0-indexed ──────────────────────────

  it('converts 1-indexed column to 0-indexed startColumn', () => {
    const reporter = new SonarQubeReporter()
    const violation = makeViolation({ column: 10 })
    const parsed = JSON.parse(reporter.format(violation))
    expect(parsed.primaryLocation.textRange.startColumn).toBe(9)
  })

  it('converts endColumn to 0-indexed when provided', () => {
    const reporter = new SonarQubeReporter()
    const violation = makeViolation({ column: 5, endColumn: 15 })
    const parsed = JSON.parse(reporter.format(violation))
    expect(parsed.primaryLocation.textRange.startColumn).toBe(4)
    expect(parsed.primaryLocation.textRange.endColumn).toBe(14)
  })

  it('falls back to column (0-indexed) when endColumn is omitted', () => {
    const reporter = new SonarQubeReporter()
    const violation = makeViolation({ column: 7 })
    const parsed = JSON.parse(reporter.format(violation))
    expect(parsed.primaryLocation.textRange.endColumn).toBe(6)
  })

  it('falls back to line when endLine is omitted', () => {
    const reporter = new SonarQubeReporter()
    const violation = makeViolation({ line: 42 })
    const parsed = JSON.parse(reporter.format(violation))
    expect(parsed.primaryLocation.textRange.endLine).toBe(42)
  })
})
