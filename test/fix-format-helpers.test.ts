import { describe, it, expect } from 'vitest'
import {
  printSummary,
  outputFixResults,
  aggregateResults,
} from '../src/commands/fix-format-helpers.js'
import type { FileFixResult, FixFlags, FixSummary } from '../src/commands/fix-helpers.js'

function makeFlags(overrides: Partial<FixFlags> = {}): FixFlags {
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

function makeSummary(overrides: Partial<FixSummary> = {}): FixSummary {
  return {
    filesModified: ['src/a.ts'],
    filesUnchanged: ['src/b.ts'],
    totalFixesApplied: 3,
    totalFixesSkipped: 0,
    ...overrides,
  }
}

function makeResult(overrides: Partial<FileFixResult> = {}): FileFixResult {
  return {
    conflicts: [],
    file: 'src/a.ts',
    fixesApplied: 2,
    fixesSkipped: 0,
    status: 'processed',
    ...overrides,
  }
}

// ─── printSummary ──────────────────────────────────────
describe('printSummary', () => {
  it('includes Fix Summary header', () => {
    const lines = printSummary(makeSummary(), makeFlags())
    const output = lines.join('\n')
    expect(output).toContain('Fix Summary')
  })

  it('shows fixes applied count', () => {
    const lines = printSummary(makeSummary({ totalFixesApplied: 5 }), makeFlags())
    const output = lines.join('\n')
    expect(output).toContain('5')
  })

  it('shows dry run mode when enabled', () => {
    const lines = printSummary(makeSummary(), makeFlags({ 'dry-run': true }))
    const output = lines.join('\n')
    expect(output).toContain('Dry run')
  })

  it('hides dry run mode when disabled', () => {
    const lines = printSummary(makeSummary(), makeFlags({ 'dry-run': false }))
    const output = lines.join('\n')
    expect(output).not.toContain('Dry run')
  })

  it('shows files modified count when not dry run', () => {
    const lines = printSummary(
      makeSummary({ filesModified: ['a.ts', 'b.ts'] }),
      makeFlags({ 'dry-run': false }),
    )
    const output = lines.join('\n')
    expect(output).toContain('Files modified')
    expect(output).toContain('2')
  })

  it('shows files unchanged when not dry run', () => {
    const lines = printSummary(
      makeSummary({ filesUnchanged: ['c.ts'] }),
      makeFlags({ 'dry-run': false }),
    )
    const output = lines.join('\n')
    expect(output).toContain('Files unchanged')
  })

  it('shows "would be modified" in dry run with fixes', () => {
    const lines = printSummary(
      makeSummary({ totalFixesApplied: 2, filesModified: ['a.ts'] }),
      makeFlags({ 'dry-run': true }),
    )
    const output = lines.join('\n')
    expect(output).toContain('would be modified')
  })

  it('shows no violations message when nothing applied', () => {
    const lines = printSummary(
      makeSummary({ totalFixesApplied: 0, totalFixesSkipped: 0 }),
      makeFlags(),
    )
    const output = lines.join('\n')
    expect(output).toContain('No violations found')
  })

  it('shows fixes applied message when fixes exist', () => {
    const lines = printSummary(
      makeSummary({ totalFixesApplied: 3 }),
      makeFlags({ 'dry-run': false }),
    )
    const output = lines.join('\n')
    expect(output).toContain('Fixes applied successfully')
  })

  it('shows skipped count when > 0', () => {
    const lines = printSummary(
      makeSummary({ totalFixesSkipped: 2 }),
      makeFlags(),
    )
    const output = lines.join('\n')
    expect(output).toContain('Fixes skipped')
    expect(output).toContain('conflicts')
  })

  it('hides skipped count when 0', () => {
    const lines = printSummary(
      makeSummary({ totalFixesSkipped: 0 }),
      makeFlags(),
    )
    const output = lines.join('\n')
    expect(output).not.toContain('Fixes skipped')
  })
})

// ─── outputFixResults ──────────────────────────────────
describe('outputFixResults', () => {
  it('returns JSON output in CI mode', () => {
    const result = outputFixResults(makeSummary(), makeFlags({ ci: true }), true)
    expect(result.jsonOutput).toBeDefined()
    const parsed = JSON.parse(result.jsonOutput!)
    expect(parsed).toHaveProperty('summary')
    expect(parsed).toHaveProperty('filesModified')
    expect(parsed).toHaveProperty('filesUnchanged')
    expect(parsed).toHaveProperty('dryRun')
  })

  it('returns summary lines in non-CI mode', () => {
    const result = outputFixResults(makeSummary(), makeFlags(), false)
    expect(result.jsonOutput).toBeUndefined()
    expect(result.summaryLines.length).toBeGreaterThan(0)
  })

  it('includes dryRun flag in CI JSON output', () => {
    const result = outputFixResults(makeSummary(), makeFlags({ 'dry-run': true }), true)
    const parsed = JSON.parse(result.jsonOutput!)
    expect(parsed.dryRun).toBe(true)
  })

  it('includes fix counts in CI JSON output', () => {
    const result = outputFixResults(
      makeSummary({ totalFixesApplied: 5, totalFixesSkipped: 1 }),
      makeFlags(),
      true,
    )
    const parsed = JSON.parse(result.jsonOutput!)
    expect(parsed.summary.fixesApplied).toBe(5)
    expect(parsed.summary.fixesSkipped).toBe(1)
  })

  it('returns empty summary lines in CI mode', () => {
    const result = outputFixResults(makeSummary(), makeFlags(), true)
    expect(result.summaryLines).toEqual([])
  })
})

// ─── aggregateResults ──────────────────────────────────
describe('aggregateResults', () => {
  it('counts total fixes applied from processed results', () => {
    const results = [
      makeResult({ fixesApplied: 2, status: 'processed' }),
      makeResult({ fixesApplied: 3, status: 'processed', file: 'b.ts' }),
    ]
    const { summary } = aggregateResults(results, makeFlags())
    expect(summary.totalFixesApplied).toBe(5)
  })

  it('counts total fixes skipped', () => {
    const results = [
      makeResult({ fixesSkipped: 1, status: 'processed' }),
      makeResult({ fixesSkipped: 2, status: 'processed', file: 'b.ts' }),
    ]
    const { summary } = aggregateResults(results, makeFlags())
    expect(summary.totalFixesSkipped).toBe(3)
  })

  it('collects modified files when not dry-run', () => {
    const results = [
      makeResult({ fixesApplied: 2, file: 'a.ts', status: 'processed' }),
      makeResult({ fixesApplied: 0, file: 'b.ts', status: 'processed' }),
    ]
    const { summary } = aggregateResults(results, makeFlags({ 'dry-run': false }))
    expect(summary.filesModified).toEqual(['a.ts'])
  })

  it('does not add modified files in dry-run mode', () => {
    const results = [
      makeResult({ fixesApplied: 2, file: 'a.ts', status: 'processed' }),
    ]
    const { summary } = aggregateResults(results, makeFlags({ 'dry-run': true }))
    expect(summary.filesModified).toEqual([])
  })

  it('collects unchanged files', () => {
    const results = [
      makeResult({ status: 'unchanged', file: 'a.ts' }),
    ]
    const { summary } = aggregateResults(results, makeFlags())
    expect(summary.filesUnchanged).toEqual(['a.ts'])
  })

  it('logs error messages for error status', () => {
    const results = [
      makeResult({ status: 'error', error: 'parse failed', file: 'bad.ts' }),
    ]
    const { logLines } = aggregateResults(results, makeFlags())
    const output = logLines.join('\n')
    expect(output).toContain('bad.ts')
    expect(output).toContain('parse failed')
  })

  it('logs verbose fix messages in non-dry-run mode', () => {
    const results = [
      makeResult({ fixesApplied: 3, file: 'a.ts', status: 'processed' }),
    ]
    const { logLines } = aggregateResults(results, makeFlags({ verbose: true, 'dry-run': false }))
    const output = logLines.join('\n')
    expect(output).toContain('Fixed 3 violation(s) in a.ts')
  })

  it('logs verbose dry-run messages', () => {
    const results = [
      makeResult({ fixesApplied: 2, file: 'a.ts', status: 'processed' }),
    ]
    const { logLines } = aggregateResults(results, makeFlags({ verbose: true, 'dry-run': true }))
    const output = logLines.join('\n')
    expect(output).toContain('Would fix 2 violation(s) in a.ts')
  })

  it('logs conflict messages when verbose', () => {
    const results = [
      makeResult({
        conflicts: [{ conflictingRule: 'rule-b', ruleId: 'rule-a' }],
        file: 'a.ts',
        status: 'processed',
      }),
    ]
    const { logLines } = aggregateResults(results, makeFlags({ verbose: true }))
    const output = logLines.join('\n')
    expect(output).toContain('rule-a')
    expect(output).toContain('rule-b')
    expect(output).toContain('conflicts')
  })

  it('handles empty results array', () => {
    const { summary, logLines } = aggregateResults([], makeFlags())
    expect(summary.totalFixesApplied).toBe(0)
    expect(summary.totalFixesSkipped).toBe(0)
    expect(summary.filesModified).toEqual([])
    expect(summary.filesUnchanged).toEqual([])
    expect(logLines).toEqual([])
  })

  it('does not log verbose messages when verbose is false', () => {
    const results = [
      makeResult({ fixesApplied: 3, file: 'a.ts', status: 'processed' }),
    ]
    const { logLines } = aggregateResults(results, makeFlags({ verbose: false }))
    expect(logLines).toEqual([])
  })
})
