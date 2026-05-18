import { describe, expect, it } from 'vitest'

import {
  buildWatcherConfig,
  countBySeverity,
  getRelativePath,
  MAX_VIOLATIONS_TO_DISPLAY,
  resolveRequestedRules,
} from '../../src/commands/watch-helpers.js'
import type { RuleViolation } from '../../src/ast/visitor.js'

// ─── resolveRequestedRules ───

describe('resolveRequestedRules', () => {
  it('returns undefined for undefined input', () => {
    expect(resolveRequestedRules(undefined)).toBeUndefined()
  })

  it('splits comma-separated rules', () => {
    expect(resolveRequestedRules('a,b,c')).toEqual(['a', 'b', 'c'])
  })

  it('trims whitespace from rules', () => {
    expect(resolveRequestedRules(' a , b , c ')).toEqual(['a', 'b', 'c'])
  })

  it('handles single rule', () => {
    expect(resolveRequestedRules('no-eval')).toEqual(['no-eval'])
  })
})

// ─── countBySeverity ───

describe('countBySeverity', () => {
  it('counts errors and warnings', () => {
    const violations = [
      { severity: 'error' } as RuleViolation,
      { severity: 'warning' } as RuleViolation,
      { severity: 'error' } as RuleViolation,
      { severity: 'info' } as RuleViolation,
    ]
    const result = countBySeverity(violations)
    expect(result.errors).toBe(2)
    expect(result.warnings).toBe(1)
  })

  it('returns zeros for empty array', () => {
    expect(countBySeverity([])).toEqual({ errors: 0, warnings: 0 })
  })
})

// ─── getRelativePath ───

describe('getRelativePath', () => {
  it('replaces cwd with dot', () => {
    expect(getRelativePath('/project/src/file.ts', '/project')).toBe('src/file.ts')
  })

  it('handles path equal to cwd', () => {
    expect(getRelativePath('/project', '/project')).toBe('.')
  })

  it('handles path with trailing slash in cwd', () => {
    const result = getRelativePath('/project/src/file.ts', '/project')
    expect(result).not.toContain('/project')
  })
})

// ─── buildWatcherConfig ───

describe('buildWatcherConfig', () => {
  it('returns defaults', () => {
    const config = buildWatcherConfig({})
    expect(config.debounceMs).toBeGreaterThan(0)
    expect(config.extensions.length).toBeGreaterThan(0)
    expect(config.ignorePatterns).toEqual([])
  })

  it('uses custom debounce', () => {
    const config = buildWatcherConfig({ debounceMs: 500 })
    expect(config.debounceMs).toBe(500)
  })

  it('uses custom ignore patterns', () => {
    const config = buildWatcherConfig({ ignorePatterns: ['**/test/**'] })
    expect(config.ignorePatterns).toContain('**/test/**')
  })

  it('includes common TS/JS extensions', () => {
    const config = buildWatcherConfig({})
    expect(config.extensions).toContain('.ts')
    expect(config.extensions).toContain('.tsx')
    expect(config.extensions).toContain('.js')
  })
})

// ─── MAX_VIOLATIONS_TO_DISPLAY ───

describe('MAX_VIOLATIONS_TO_DISPLAY', () => {
  it('is a small positive number', () => {
    expect(MAX_VIOLATIONS_TO_DISPLAY).toBeGreaterThan(0)
    expect(MAX_VIOLATIONS_TO_DISPLAY).toBeLessThanOrEqual(10)
  })
})
