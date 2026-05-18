import { describe, expect, it } from 'vitest'

import type { FileFixResult, FixFlags, FixSummary } from '../../src/commands/fix-helpers.js'

import {
  aggregateResults,
  outputFixResults,
  printSummary,
} from '../../src/commands/fix-format-helpers.js'

// ─── Helpers ───

function makeFixSummary(overrides: Partial<FixSummary> = {}): FixSummary {
  return {
    filesModified: [],
    filesUnchanged: [],
    totalFixesApplied: 0,
    totalFixesSkipped: 0,
    ...overrides,
  }
}

function makeFixFlags(overrides: Partial<FixFlags> = {}): FixFlags {
  return {
    ci: false,
    concurrency: 4,
    config: undefined,
    'dry-run': false,
    rules: undefined,
    'safe-only': false,
    verbose: false,
    ...overrides,
  }
}

function makeFileFixResult(overrides: Partial<FileFixResult> = {}): FileFixResult {
  return {
    conflicts: [],
    file: 'test.ts',
    fixesApplied: 0,
    fixesSkipped: 0,
    status: 'unchanged',
    ...overrides,
  }
}

// ─── printSummary ───

describe('printSummary', () => {
  it('shows no violations message when no fixes', () => {
    const lines = printSummary(makeFixSummary(), makeFixFlags())
    const text = lines.join(' ')
    expect(text).toContain('No violations found')
  })

  it('shows fixes applied count', () => {
    const lines = printSummary(makeFixSummary({ totalFixesApplied: 5 }), makeFixFlags())
    const text = lines.join(' ')
    expect(text).toContain('5')
  })

  it('shows fixes skipped when > 0', () => {
    const lines = printSummary(
      makeFixSummary({ totalFixesSkipped: 3 }),
      makeFixFlags(),
    )
    const text = lines.join(' ')
    expect(text).toContain('3')
  })

  it('shows dry run mode when flag set', () => {
    const lines = printSummary(makeFixSummary(), makeFixFlags({ 'dry-run': true }))
    const text = lines.join(' ')
    expect(text).toContain('Dry run')
  })

  it('shows success message when fixes applied and not dry-run', () => {
    const lines = printSummary(
      makeFixSummary({ totalFixesApplied: 1 }),
      makeFixFlags(),
    )
    const text = lines.join(' ')
    expect(text).toContain('successfully')
  })
})

// ─── outputFixResults ───

describe('outputFixResults', () => {
  it('returns JSON output in CI mode', () => {
    const result = outputFixResults(makeFixSummary(), makeFixFlags(), true)
    expect(result.jsonOutput).toBeDefined()
    const parsed = JSON.parse(result.jsonOutput!)
    expect(parsed.summary).toBeDefined()
    expect(result.summaryLines).toEqual([])
  })

  it('returns summary lines in non-CI mode', () => {
    const result = outputFixResults(makeFixSummary(), makeFixFlags(), false)
    expect(result.jsonOutput).toBeUndefined()
    expect(result.summaryLines.length).toBeGreaterThan(0)
  })
})

// ─── aggregateResults ───

describe('aggregateResults', () => {
  it('counts fixes from processed results', () => {
    const results = [
      makeFileFixResult({ status: 'processed', fixesApplied: 3, fixesSkipped: 1 }),
    ]
    const { summary } = aggregateResults(results, makeFixFlags())
    expect(summary.totalFixesApplied).toBe(3)
    expect(summary.totalFixesSkipped).toBe(1)
  })

  it('tracks modified files', () => {
    const results = [
      makeFileFixResult({ status: 'processed', file: 'a.ts', fixesApplied: 1 }),
      makeFileFixResult({ status: 'processed', file: 'b.ts', fixesApplied: 0 }),
    ]
    const { summary } = aggregateResults(results, makeFixFlags())
    expect(summary.filesModified).toContain('a.ts')
    expect(summary.filesModified).not.toContain('b.ts')
  })

  it('tracks unchanged files', () => {
    const results = [
      makeFileFixResult({ status: 'unchanged', file: 'c.ts' }),
    ]
    const { summary } = aggregateResults(results, makeFixFlags())
    expect(summary.filesUnchanged).toContain('c.ts')
  })

  it('logs errors for error results', () => {
    const results = [
      makeFileFixResult({ status: 'error', file: 'bad.ts', error: 'oops' }),
    ]
    const { logLines } = aggregateResults(results, makeFixFlags())
    expect(logLines.some((l) => l.includes('bad.ts'))).toBe(true)
  })

  it('aggregates multiple results', () => {
    const results = [
      makeFileFixResult({ status: 'processed', fixesApplied: 2 }),
      makeFileFixResult({ status: 'processed', fixesApplied: 3 }),
    ]
    const { summary } = aggregateResults(results, makeFixFlags())
    expect(summary.totalFixesApplied).toBe(5)
  })

  it('shows verbose output when flag set', () => {
    const results = [
      makeFileFixResult({
        status: 'processed',
        file: 'a.ts',
        fixesApplied: 1,
        conflicts: [{ conflictingRule: 'rule-b', ruleId: 'rule-a' }],
      }),
    ]
    const { logLines } = aggregateResults(results, makeFixFlags({ verbose: true }))
    expect(logLines.some((l) => l.includes('a.ts'))).toBe(true)
  })

  it('dry-run mode shows "would fix" messages when verbose', () => {
    const results = [
      makeFileFixResult({ status: 'processed', file: 'a.ts', fixesApplied: 1 }),
    ]
    const { logLines } = aggregateResults(results, makeFixFlags({ 'dry-run': true, verbose: true }))
    expect(logLines.some((l) => l.includes('Would fix'))).toBe(true)
  })
})
