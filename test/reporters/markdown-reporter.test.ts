import { describe, it, expect } from 'vitest'
import type { Violation } from '../../src/reporters/types.js'

import { MarkdownReporter } from '../../src/reporters/markdown-reporter.js'

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

// ─── MarkdownReporter.name ───

describe('MarkdownReporter', () => {
  it('has name "markdown"', () => {
    const reporter = new MarkdownReporter()
    expect(reporter.name).toBe('markdown')
  })

  // ─── format ───

  describe('format', () => {
    it('formats a basic violation', () => {
      const reporter = new MarkdownReporter()
      const result = reporter.format(makeViolation())
      expect(result).toContain('no-console')
      expect(result).toContain('src/test.ts')
      expect(result).toContain('10')
      expect(result).toContain('5')
      expect(result).toContain('Unexpected console statement')
    })

    it('includes severity badge', () => {
      const reporter = new MarkdownReporter()
      const errorResult = reporter.format(makeViolation({ severity: 'error' }))
      expect(errorResult).toContain('🔴')
      const warningResult = reporter.format(makeViolation({ severity: 'warning' }))
      expect(warningResult).toContain('🟡')
      const infoResult = reporter.format(makeViolation({ severity: 'info' }))
      expect(infoResult).toContain('🔵')
    })

    it('includes source snippet when source is provided', () => {
      const reporter = new MarkdownReporter()
      const result = reporter.format(
        makeViolation({
          line: 2,
          source: 'line1\nconsole.log("hello")\nline3\nline4\nline5',
        }),
      )
      expect(result).toContain('```')
    })

    it('includes suggestion when provided', () => {
      const reporter = new MarkdownReporter()
      const result = reporter.format(
        makeViolation({ suggestion: 'Remove the console statement' }),
      )
      expect(result).toContain('Suggestion')
      expect(result).toContain('Remove the console statement')
    })

    it('escapes markdown in message', () => {
      const reporter = new MarkdownReporter()
      const result = reporter.format(makeViolation({ message: 'Use `const` instead' }))
      expect(result).toContain('Use')
    })

    it('formats without source or suggestion', () => {
      const reporter = new MarkdownReporter()
      const result = reporter.format(makeViolation())
      expect(result).not.toContain('```')
      expect(result).not.toContain('Suggestion')
    })
  })
})
