import { describe, it, expect } from 'vitest'
import type { FileFixResult, FixFlags, FixSummary } from '../src/commands/fix-helpers.js'

// Note: fix-helpers.ts has heavy dependencies (Parser, RuleRegistry, file system).
// We test the re-exports and focus on the types/integration points we can verify
// without mocking the entire infrastructure.

// ─── Type Exports ──────────────────────────────────────
describe('fix-helpers type exports', () => {
  it('FileFixResult type is usable', () => {
    const result: FileFixResult = {
      conflicts: [],
      file: 'test.ts',
      fixesApplied: 0,
      fixesSkipped: 0,
      status: 'unchanged',
    }
    expect(result.file).toBe('test.ts')
    expect(result.status).toBe('unchanged')
    expect(result.fixesApplied).toBe(0)
  })

  it('FileFixResult supports error status', () => {
    const result: FileFixResult = {
      conflicts: [],
      error: 'something failed',
      file: 'bad.ts',
      fixesApplied: 0,
      fixesSkipped: 0,
      status: 'error',
    }
    expect(result.error).toBe('something failed')
    expect(result.status).toBe('error')
  })

  it('FileFixResult supports processed status with conflicts', () => {
    const result: FileFixResult = {
      conflicts: [{ conflictingRule: 'rule-b', ruleId: 'rule-a' }],
      file: 'test.ts',
      fixesApplied: 3,
      fixesSkipped: 1,
      status: 'processed',
    }
    expect(result.conflicts).toHaveLength(1)
    expect(result.fixesApplied).toBe(3)
    expect(result.fixesSkipped).toBe(1)
  })

  it('FixFlags type is usable', () => {
    const flags: FixFlags = {
      ci: true,
      concurrency: 8,
      config: '.codeforgerc.json',
      'dry-run': true,
      rules: 'no-eval,prefer-const',
      'safe-only': true,
      verbose: true,
    }
    expect(flags.ci).toBe(true)
    expect(flags.concurrency).toBe(8)
    expect(flags['dry-run']).toBe(true)
    expect(flags['safe-only']).toBe(true)
  })

  it('FixFlags with minimal values', () => {
    const flags: FixFlags = {
      ci: false,
      concurrency: 4,
      config: undefined,
      'dry-run': false,
      rules: undefined,
      'safe-only': false,
      verbose: false,
    }
    expect(flags.ci).toBe(false)
    expect(flags.config).toBeUndefined()
    expect(flags.rules).toBeUndefined()
  })

  it('FixSummary type is usable', () => {
    const summary: FixSummary = {
      filesModified: ['a.ts', 'b.ts'],
      filesUnchanged: ['c.ts'],
      totalFixesApplied: 5,
      totalFixesSkipped: 1,
    }
    expect(summary.filesModified).toHaveLength(2)
    expect(summary.filesUnchanged).toHaveLength(1)
    expect(summary.totalFixesApplied).toBe(5)
    expect(summary.totalFixesSkipped).toBe(1)
  })
})

// ─── Re-exports from fix-format-helpers ────────────────
describe('fix-helpers re-exports', () => {
  it('re-exports aggregateResults', async () => {
    const mod = await import('../src/commands/fix-helpers.js')
    expect(mod.aggregateResults).toBeDefined()
    expect(typeof mod.aggregateResults).toBe('function')
  })

  it('re-exports outputFixResults', async () => {
    const mod = await import('../src/commands/fix-helpers.js')
    expect(mod.outputFixResults).toBeDefined()
    expect(typeof mod.outputFixResults).toBe('function')
  })

  it('re-exports printSummary', async () => {
    const mod = await import('../src/commands/fix-helpers.js')
    expect(mod.printSummary).toBeDefined()
    expect(typeof mod.printSummary).toBe('function')
  })
})
