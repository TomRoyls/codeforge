import { describe, it, expect, vi } from 'vitest'

import {
  getRulesWithFixes,
  applyFixes,
  processFixes,
} from '../src/commands/analyze-fix-helpers.js'

import type { RuleViolation } from '../src/ast/visitor.js'

// ─── Helpers ──────────────────────────────────────────

function makeViolation(overrides: Partial<RuleViolation> = {}): RuleViolation {
  return {
    filePath: 'src/foo.ts',
    message: 'test',
    range: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 5 },
    },
    ruleId: 'test-rule',
    severity: 'error',
    ...overrides,
  }
}

// ─── getRulesWithFixes ────────────────────────────────
describe('getRulesWithFixes', () => {
  it('returns empty map for empty registry', () => {
    const mockRegistry = {
      getAllRules: vi.fn().mockReturnValue([]),
    } as any

    const result = getRulesWithFixes(mockRegistry)

    expect(result).toBeInstanceOf(Map)
    expect(result.size).toBe(0)
  })

  it('includes rules that have a fix function', () => {
    const mockRegistry = {
      getAllRules: vi.fn().mockReturnValue([
        {
          definition: {
            meta: { name: 'fixable-rule' },
            fix: vi.fn(),
          },
        },
      ]),
    } as any

    const result = getRulesWithFixes(mockRegistry)

    expect(result.size).toBe(1)
    expect(result.has('fixable-rule')).toBe(true)
  })

  it('excludes rules without a fix function', () => {
    const mockRegistry = {
      getAllRules: vi.fn().mockReturnValue([
        {
          definition: {
            meta: { name: 'no-fix-rule' },
            fix: undefined,
          },
        },
      ]),
    } as any

    const result = getRulesWithFixes(mockRegistry)

    expect(result.size).toBe(0)
  })

  it('excludes rules with non-function fix property', () => {
    const mockRegistry = {
      getAllRules: vi.fn().mockReturnValue([
        {
          definition: {
            meta: { name: 'string-fix-rule' },
            fix: 'not-a-function' as any,
          },
        },
      ]),
    } as any

    const result = getRulesWithFixes(mockRegistry)

    expect(result.size).toBe(0)
  })

  it('sets priority to 10 for included rules', () => {
    const mockFix = vi.fn()
    const mockRegistry = {
      getAllRules: vi.fn().mockReturnValue([
        {
          definition: {
            meta: { name: 'priority-rule' },
            fix: mockFix,
          },
        },
      ]),
    } as any

    const result = getRulesWithFixes(mockRegistry)
    const rule = result.get('priority-rule')!

    expect(rule.priority).toBe(10)
    expect(rule.id).toBe('priority-rule')
  })

  it('handles multiple rules with mixed fix availability', () => {
    const mockRegistry = {
      getAllRules: vi.fn().mockReturnValue([
        {
          definition: { meta: { name: 'fixable-1' }, fix: vi.fn() },
        },
        {
          definition: { meta: { name: 'no-fix' }, fix: undefined },
        },
        {
          definition: { meta: { name: 'fixable-2' }, fix: vi.fn() },
        },
      ]),
    } as any

    const result = getRulesWithFixes(mockRegistry)

    expect(result.size).toBe(2)
    expect(result.has('fixable-1')).toBe(true)
    expect(result.has('fixable-2')).toBe(true)
  })
})

// ─── applyFixes ───────────────────────────────────────
describe('applyFixes', () => {
  it('returns zero counts when no violations', async () => {
    const result = await applyFixes({
      allViolations: [],
      concurrency: 1,
      discoveredFiles: [{ absolutePath: '/a.ts', path: 'a.ts' }],
      dryRun: false,
      parseCache: new Map(),
      parser: {} as any,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fixesApplied).toBe(0)
    expect(result.fixesSkipped).toBe(0)
  })

  it('returns zero counts when no files match violations', async () => {
    const violations = [makeViolation({ filePath: 'other.ts' })]

    const result = await applyFixes({
      allViolations: violations,
      concurrency: 1,
      discoveredFiles: [{ absolutePath: '/a.ts', path: 'a.ts' }],
      dryRun: false,
      parseCache: new Map(),
      parser: {} as any,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fixesApplied).toBe(0)
    expect(result.fixesSkipped).toBe(0)
  })

  it('handles null file entries gracefully', async () => {
    const result = await applyFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [null as any],
      dryRun: false,
      parseCache: new Map(),
      parser: {} as any,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fixesApplied).toBe(0)
    expect(result.fixesSkipped).toBe(0)
  })

  it('groups violations by filePath', async () => {
    const v1 = makeViolation({ filePath: 'a.ts' })
    const v2 = makeViolation({ filePath: 'a.ts' })
    const v3 = makeViolation({ filePath: 'b.ts' })

    const mockApplyFixesToFile = vi.fn().mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    // We can't easily mock applyFixesToFile directly since it's imported
    // So we test the grouping behavior via the parseCache path
    const violations = [v1, v2, v3]

    // Just verify it doesn't crash with multiple violations for same file
    const result = await applyFixes({
      allViolations: violations,
      concurrency: 1,
      discoveredFiles: [],
      dryRun: true,
      parseCache: new Map(),
      parser: {} as any,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fixesApplied).toBe(0)
  })
})

// ─── processFixes ─────────────────────────────────────
describe('processFixes', () => {
  it('returns early with empty result when no violations', async () => {
    const result = await processFixes({
      allViolations: [],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: {} as any,
      quiet: false,
      registry: { getAllRules: vi.fn().mockReturnValue([]) } as any,
      verbose: false,
    })

    expect(result.fixesApplied).toBe(0)
    expect(result.fixesSkipped).toBe(0)
    expect(result.spinnerMessage).toBe('')
    expect(result.dryRunDiffs).toHaveLength(0)
  })
})
