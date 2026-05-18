import { describe, it, expect } from 'vitest'
import {
  buildWatcherConfig,
  countBySeverity,
  formatFileResult,
  formatStartupMessage,
  getRelativePath,
  resolveRequestedRules,
  type WatcherConfig,
} from '../src/commands/watch-helpers.js'
import type { RuleViolation } from '../src/ast/visitor.js'

function makeViolation(overrides: Partial<RuleViolation> = {}): RuleViolation {
  return {
    filePath: 'src/test.ts',
    message: 'test violation',
    range: {
      end: { column: 10, line: 1 },
      start: { column: 0, line: 1 },
    },
    ruleId: 'no-eval',
    severity: 'error',
    ...overrides,
  } as RuleViolation
}

// ─── resolveRequestedRules ───────────────────────────
describe('resolveRequestedRules', () => {
  it('returns undefined for undefined input', () => {
    expect(resolveRequestedRules(undefined)).toBeUndefined()
  })

  it('returns undefined for empty string', () => {
    expect(resolveRequestedRules('')).toBeUndefined()
  })

  it('splits comma-separated rules', () => {
    expect(resolveRequestedRules('no-eval,prefer-const')).toEqual(['no-eval', 'prefer-const'])
  })

  it('trims whitespace around rules', () => {
    expect(resolveRequestedRules(' no-eval , prefer-const ')).toEqual(['no-eval', 'prefer-const'])
  })

  it('handles single rule', () => {
    expect(resolveRequestedRules('no-eval')).toEqual(['no-eval'])
  })
})

// ─── countBySeverity ─────────────────────────────────
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
    const violations = [makeViolation({ severity: 'info' })]
    const result = countBySeverity(violations)

    expect(result.errors).toBe(0)
    expect(result.warnings).toBe(0)
  })
})

// ─── getRelativePath ─────────────────────────────────
describe('getRelativePath', () => {
  it('replaces cwd prefix with dot', () => {
    expect(getRelativePath('/project/src/file.ts', '/project')).toBe('src/file.ts')
  })

  it('does not strip ./ prefix from result', () => {
    expect(getRelativePath('/project/src/file.ts', '/project')).toBe('src/file.ts')
  })
})

// ─── buildWatcherConfig ──────────────────────────────
describe('buildWatcherConfig', () => {
  it('returns default config when no options provided', () => {
    const config = buildWatcherConfig({})

    expect(config.debounceMs).toBe(300)
    expect(config.extensions.length).toBeGreaterThan(0)
    expect(config.ignorePatterns).toEqual([])
  })

  it('uses provided debounce value', () => {
    const config = buildWatcherConfig({ debounceMs: 500 })

    expect(config.debounceMs).toBe(500)
  })

  it('uses provided ignore patterns', () => {
    const config = buildWatcherConfig({ ignorePatterns: ['node_modules/**'] })

    expect(config.ignorePatterns).toEqual(['node_modules/**'])
  })

  it('includes common file extensions', () => {
    const config = buildWatcherConfig({})

    expect(config.extensions).toContain('.ts')
    expect(config.extensions).toContain('.tsx')
    expect(config.extensions).toContain('.js')
    expect(config.extensions).toContain('.jsx')
  })
})

// ─── formatStartupMessage ────────────────────────────
describe('formatStartupMessage', () => {
  it('logs watcher startup info with patterns and debounce', () => {
    const logged: string[] = []
    formatStartupMessage(['**/*.ts'], 300, (m) => logged.push(m))

    expect(logged.some((l) => l.includes('**/*.ts'))).toBe(true)
    expect(logged.some((l) => l.includes('300ms'))).toBe(true)
    expect(logged.some((l) => l.includes('Ctrl+C'))).toBe(true)
  })

  it('shows "current directory" when no patterns', () => {
    const logged: string[] = []
    formatStartupMessage([], 300, (m) => logged.push(m))

    expect(logged.some((l) => l.includes('current directory'))).toBe(true)
  })
})

// ─── formatFileResult ────────────────────────────────
describe('formatFileResult', () => {
  it('shows checkmark when no violations', () => {
    const logged: string[] = []
    formatFileResult('/project/src/clean.ts', [], '/project', (m) => logged.push(m))

    expect(logged.some((l) => l.includes('✓'))).toBe(true)
    expect(logged.some((l) => l.includes('clean.ts'))).toBe(true)
  })

  it('shows warning with error/warning counts', () => {
    const logged: string[] = []
    const violations = [
      makeViolation({ severity: 'error' }),
      makeViolation({ severity: 'warning' }),
    ]

    formatFileResult('/project/src/file.ts', violations, '/project', (m) => logged.push(m))

    expect(logged.some((l) => l.includes('1 error'))).toBe(true)
    expect(logged.some((l) => l.includes('1 warning'))).toBe(true)
  })

  it('shows individual violation details', () => {
    const logged: string[] = []
    const violations = [makeViolation({ ruleId: 'no-eval', message: 'eval is evil' })]

    formatFileResult('/project/src/file.ts', violations, '/project', (m) => logged.push(m))

    expect(logged.some((l) => l.includes('no-eval'))).toBe(true)
  })

  it('truncates violations beyond MAX_VIOLATIONS_TO_DISPLAY', () => {
    const logged: string[] = []
    const violations = Array.from({ length: 5 }, (_, i) =>
      makeViolation({ ruleId: `rule-${i}` }),
    )

    formatFileResult('/project/src/file.ts', violations, '/project', (m) => logged.push(m))

    expect(logged.some((l) => l.includes('more'))).toBe(true)
  })
})
