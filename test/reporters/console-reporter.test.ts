import { describe, it, expect } from 'vitest'
import type { Violation } from '../../src/reporters/types.js'

import { ConsoleReporter } from '../../src/reporters/console-reporter.js'

function makeViolation(overrides: Partial<Violation> = {}): Violation {
  return {
    column: 5,
    filePath: 'src/test.ts',
    line: 10,
    message: 'Unexpected console statement',
    ruleId: 'no-console',
    severity: 'error',
    ...overrides,
  }
}

// ─── ConsoleReporter basics ───

describe('ConsoleReporter', () => {
  it('has name "console"', () => {
    const reporter = new ConsoleReporter({ color: false })
    expect(reporter.name).toBe('console')
  })

  // ─── format (no color) ───

  describe('format (no color)', () => {
    it('formats a basic violation', () => {
      const reporter = new ConsoleReporter({ color: false })
      const result = reporter.format(makeViolation())
      expect(result).toContain('src/test.ts:10:5')
      expect(result).toContain('ERROR')
      expect(result).toContain('no-console')
      expect(result).toContain('Unexpected console statement')
    })

    it('formats warning severity', () => {
      const reporter = new ConsoleReporter({ color: false })
      const result = reporter.format(makeViolation({ severity: 'warning' }))
      expect(result).toContain('WARNING')
    })

    it('formats info severity', () => {
      const reporter = new ConsoleReporter({ color: false })
      const result = reporter.format(makeViolation({ severity: 'info' }))
      expect(result).toContain('INFO')
    })

    it('includes severity icon', () => {
      const reporter = new ConsoleReporter({ color: false })
      const errorResult = reporter.format(makeViolation({ severity: 'error' }))
      expect(errorResult).toContain('✖')
      const warnResult = reporter.format(makeViolation({ severity: 'warning' }))
      expect(warnResult).toContain('⚠')
    })
  })

  // ─── format (with color) ───

  describe('format (with color)', () => {
    it('includes ANSI codes when color enabled', () => {
      const reporter = new ConsoleReporter({ color: true })
      const result = reporter.format(makeViolation({ severity: 'error' }))
      expect(result).toContain('\u001B[')
      expect(result).toContain('src/test.ts:10:5')
    })

    it('strips to clean format without color', () => {
      const reporter = new ConsoleReporter({ color: false })
      const result = reporter.format(makeViolation())
      expect(result).not.toContain('\u001B[')
    })
  })
})
