import { describe, it, expect } from 'vitest'

import {
  resolveRequestedRules,
  countBySeverity,
  getRelativePath,
  buildWatcherConfig,
  formatStartupMessage,
  formatFileResult,
  MAX_VIOLATIONS_TO_DISPLAY,
} from '../src/commands/watch-helpers.js'

import type { RuleViolation } from '../src/ast/visitor.js'

// ─── Helpers ──────────────────────────────────────────

function makeViolation(overrides: Partial<RuleViolation> = {}): RuleViolation {
  return {
    filePath: 'src/foo.ts',
    message: 'test violation',
    range: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 5 },
    },
    ruleId: 'test-rule',
    severity: 'error',
    ...overrides,
  }
}

// ─── resolveRequestedRules ────────────────────────────
describe('resolveRequestedRules', () => {
  it('returns undefined for undefined input', () => {
    expect(resolveRequestedRules(undefined)).toBeUndefined()
  })

  it('splits comma-separated rules', () => {
    expect(resolveRequestedRules('no-console,no-debugger')).toEqual(['no-console', 'no-debugger'])
  })

  it('trims whitespace from rules', () => {
    expect(resolveRequestedRules(' no-console , no-debugger ')).toEqual(['no-console', 'no-debugger'])
  })

  it('handles single rule', () => {
    expect(resolveRequestedRules('no-console')).toEqual(['no-console'])
  })

  it('returns undefined for empty string', () => {
    expect(resolveRequestedRules('')).toBeUndefined()
  })
})

// ─── countBySeverity ──────────────────────────────────
describe('countBySeverity', () => {
  it('counts errors and warnings', () => {
    const violations = [
      makeViolation({ severity: 'error' }),
      makeViolation({ severity: 'error' }),
      makeViolation({ severity: 'warning' }),
    ]

    const result = countBySeverity(violations)

    expect(result.errors).toBe(2)
    expect(result.warnings).toBe(1)
  })

  it('returns zeros for empty array', () => {
    const result = countBySeverity([])

    expect(result.errors).toBe(0)
    expect(result.warnings).toBe(0)
  })

  it('ignores info severity', () => {
    const violations = [
      makeViolation({ severity: 'info' }),
      makeViolation({ severity: 'info' }),
    ]

    const result = countBySeverity(violations)

    expect(result.errors).toBe(0)
    expect(result.warnings).toBe(0)
  })

  it('handles mixed severities', () => {
    const violations = [
      makeViolation({ severity: 'error' }),
      makeViolation({ severity: 'warning' }),
      makeViolation({ severity: 'info' }),
    ]

    const result = countBySeverity(violations)

    expect(result.errors).toBe(1)
    expect(result.warnings).toBe(1)
  })
})

// ─── getRelativePath ──────────────────────────────────
describe('getRelativePath', () => {
  it('replaces cwd with dot', () => {
    expect(getRelativePath('/project/src/foo.ts', '/project')).toBe('src/foo.ts')
  })

  it('strips leading ./', () => {
    expect(getRelativePath('/project/src/foo.ts', '/project')).toBe('src/foo.ts')
  })

  it('handles file at root', () => {
    expect(getRelativePath('/project/foo.ts', '/project')).toBe('foo.ts')
  })

  it('handles same path as cwd', () => {
    expect(getRelativePath('/project', '/project')).toBe('.')
  })

  it('handles nested paths', () => {
    expect(getRelativePath('/project/src/utils/helper.ts', '/project')).toBe('src/utils/helper.ts')
  })
})

// ─── buildWatcherConfig ───────────────────────────────
describe('buildWatcherConfig', () => {
  it('returns default config for empty options', () => {
    const config = buildWatcherConfig({})

    expect(config.debounceMs).toBe(300)
    expect(config.extensions).toEqual(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'])
    expect(config.ignorePatterns).toEqual([])
  })

  it('uses provided debounce', () => {
    const config = buildWatcherConfig({ debounceMs: 500 })

    expect(config.debounceMs).toBe(500)
  })

  it('uses provided ignore patterns', () => {
    const config = buildWatcherConfig({ ignorePatterns: ['dist/**', 'coverage/**'] })

    expect(config.ignorePatterns).toEqual(['dist/**', 'coverage/**'])
  })

  it('uses defaults when options are undefined', () => {
    const config = buildWatcherConfig({ debounceMs: undefined, ignorePatterns: undefined })

    expect(config.debounceMs).toBe(300)
    expect(config.ignorePatterns).toEqual([])
  })

  it('uses defaults when called with no options object', () => {
    const config = buildWatcherConfig({})

    expect(config.debounceMs).toBe(300)
    expect(config.extensions).toContain('.ts')
    expect(config.extensions).toContain('.tsx')
    expect(config.extensions).toContain('.js')
  })
})

// ─── formatStartupMessage ─────────────────────────────
describe('formatStartupMessage', () => {
  it('logs startup message with patterns and debounce', () => {
    const messages: string[] = []
    const logFn = (msg: string) => messages.push(msg)

    formatStartupMessage(['src/**/*.ts'], 300, logFn)

    expect(messages.some((m) => m.includes('Starting file watcher'))).toBe(true)
    expect(messages.some((m) => m.includes('src/**/*.ts'))).toBe(true)
    expect(messages.some((m) => m.includes('300ms'))).toBe(true)
    expect(messages.some((m) => m.includes('Ctrl+C'))).toBe(true)
  })

  it('shows "current directory" when no patterns', () => {
    const messages: string[] = []
    const logFn = (msg: string) => messages.push(msg)

    formatStartupMessage([], 300, logFn)

    expect(messages.some((m) => m.includes('current directory'))).toBe(true)
  })

  it('joins multiple patterns with comma', () => {
    const messages: string[] = []
    const logFn = (msg: string) => messages.push(msg)

    formatStartupMessage(['src/**/*.ts', 'lib/**/*.js'], 500, logFn)

    expect(messages.some((m) => m.includes('src/**/*.ts, lib/**/*.js'))).toBe(true)
    expect(messages.some((m) => m.includes('500ms'))).toBe(true)
  })
})

// ─── formatFileResult ─────────────────────────────────
describe('formatFileResult', () => {
  it('shows checkmark for clean file', () => {
    const messages: string[] = []
    const logFn = (msg: string) => messages.push(msg)

    formatFileResult('/project/src/clean.ts', [], '/project', logFn)

    expect(messages).toHaveLength(1)
    expect(messages[0]).toContain('✓')
    expect(messages[0]).toContain('src/clean.ts')
  })

  it('shows warning for file with violations', () => {
    const messages: string[] = []
    const logFn = (msg: string) => messages.push(msg)

    formatFileResult(
      '/project/src/foo.ts',
      [makeViolation({ severity: 'error' })],
      '/project',
      logFn,
    )

    expect(messages.some((m) => m.includes('⚠'))).toBe(true)
    expect(messages.some((m) => m.includes('1 error(s)'))).toBe(true)
  })

  it('shows individual violations up to max display limit', () => {
    const messages: string[] = []
    const logFn = (msg: string) => messages.push(msg)

    const violations = Array.from({ length: 5 }, (_, i) =>
      makeViolation({
        ruleId: `rule-${i}`,
        message: `message-${i}`,
        severity: 'error',
        range: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 5 } },
      }),
    )

    formatFileResult('/project/src/foo.ts', violations, '/project', logFn)

    // Should show MAX_VIOLATIONS_TO_DISPLAY violations + "and X more" message
    const violationLines = messages.filter((m) => m.includes('rule-'))
    expect(violationLines.length).toBe(MAX_VIOLATIONS_TO_DISPLAY)
    expect(messages.some((m) => m.includes('and 2 more'))).toBe(true)
  })

  it('shows all violations when count is within limit', () => {
    const messages: string[] = []
    const logFn = (msg: string) => messages.push(msg)

    const violations = [
      makeViolation({ ruleId: 'rule-a' }),
      makeViolation({ ruleId: 'rule-b' }),
    ]

    formatFileResult('/project/src/foo.ts', violations, '/project', logFn)

    expect(messages.some((m) => m.includes('rule-a'))).toBe(true)
    expect(messages.some((m) => m.includes('rule-b'))).toBe(true)
    expect(messages.some((m) => m.includes('more'))).toBe(false)
  })

  it('uses relative path in output', () => {
    const messages: string[] = []
    const logFn = (msg: string) => messages.push(msg)

    formatFileResult('/project/src/deep/file.ts', [], '/project', logFn)

    expect(messages[0]).toContain('src/deep/file.ts')
    expect(messages[0]).not.toContain('/project')
  })

  it('counts errors and warnings separately', () => {
    const messages: string[] = []
    const logFn = (msg: string) => messages.push(msg)

    formatFileResult(
      '/project/src/foo.ts',
      [
        makeViolation({ severity: 'error' }),
        makeViolation({ severity: 'warning' }),
        makeViolation({ severity: 'warning' }),
      ],
      '/project',
      logFn,
    )

    expect(messages.some((m) => m.includes('1 error(s)'))).toBe(true)
    expect(messages.some((m) => m.includes('2 warning(s)'))).toBe(true)
  })
})

// ─── MAX_VIOLATIONS_TO_DISPLAY ────────────────────────
describe('MAX_VIOLATIONS_TO_DISPLAY', () => {
  it('is 3', () => {
    expect(MAX_VIOLATIONS_TO_DISPLAY).toBe(3)
  })
})
