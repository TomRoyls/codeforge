import { describe, it, expect } from 'vitest'
import {
  type BenchmarkResult,
  formatResultRow,
  formatResultsTable,
  formatSummary,
  printResults,
} from '../src/commands/benchmark-helpers.js'

const makeResult = (overrides: Partial<BenchmarkResult> = {}): BenchmarkResult => ({
  avgTime: 5.123,
  maxTime: 8.0,
  minTime: 3.0,
  ruleId: 'no-eval',
  runCount: 3,
  totalTime: 15.369,
  ...overrides,
})

// ─── formatResultRow ─────────────────────────────────
describe('formatResultRow', () => {
  it('formats a result row with rule ID and timing columns', () => {
    const result = makeResult()
    const row = formatResultRow(result)

    expect(row).toContain('no-eval')
    expect(row.length).toBeGreaterThan(10)
  })

  it('pads the rule ID to a fixed width', () => {
    const result = makeResult({ ruleId: 'x' })
    const row = formatResultRow(result)

    expect(row.startsWith('x' + ' '.repeat(39))).toBe(true)
  })
})

// ─── formatResultsTable ──────────────────────────────
describe('formatResultsTable', () => {
  it('includes header with column names', () => {
    const lines = formatResultsTable([makeResult()], 10)

    expect(lines.some((l) => l.includes('Avg (ms)'))).toBe(true)
    expect(lines.some((l) => l.includes('Rule ID'))).toBe(true)
  })

  it('respects topCount parameter', () => {
    const results = Array.from({ length: 5 }, (_, i) => makeResult({ ruleId: `rule-${i}` }))
    const lines = formatResultsTable(results, 2)

    const dataLines = lines.filter((l) => l.includes('rule-'))
    expect(dataLines.length).toBe(2)
  })

  it('includes all results when topCount exceeds result count', () => {
    const results = [makeResult({ ruleId: 'a' }), makeResult({ ruleId: 'b' })]
    const lines = formatResultsTable(results, 10)

    const dataLines = lines.filter((l) => l.includes('rule') || l.includes('a') || l.includes('b'))
    expect(dataLines.length).toBeGreaterThanOrEqual(2)
  })

  it('shows separator line', () => {
    const lines = formatResultsTable([makeResult()], 10)

    expect(lines.some((l) => l.includes('---'))).toBe(true)
  })
})

// ─── formatSummary ───────────────────────────────────
describe('formatSummary', () => {
  it('shows total rules and total time', () => {
    const results = [makeResult()]
    const lines = formatSummary(results)

    expect(lines.some((l) => l.includes('Total rules'))).toBe(true)
    expect(lines.some((l) => l.includes('Total time'))).toBe(true)
  })

  it('shows slowest and fastest rule', () => {
    const results = [
      makeResult({ ruleId: 'slow-rule', avgTime: 100 }),
      makeResult({ ruleId: 'fast-rule', avgTime: 1 }),
    ]
    const lines = formatSummary(results)

    expect(lines.some((l) => l.includes('slow-rule'))).toBe(true)
    expect(lines.some((l) => l.includes('fast-rule'))).toBe(true)
  })

  it('handles empty results', () => {
    const lines = formatSummary([])

    expect(lines.some((l) => l.includes('Total rules benchmarked: 0'))).toBe(true)
  })

  it('calculates total time from all results', () => {
    const results = [
      makeResult({ totalTime: 10 }),
      makeResult({ totalTime: 20 }),
    ]
    const lines = formatSummary(results)

    expect(lines.some((l) => l.includes('30.00ms'))).toBe(true)
  })
})

// ─── printResults ────────────────────────────────────
describe('printResults', () => {
  it('combines table and summary output', () => {
    const results = [makeResult()]
    const lines = printResults(results, 10)

    expect(lines.some((l) => l.includes('Rule ID'))).toBe(true)
    expect(lines.some((l) => l.includes('Summary'))).toBe(true)
  })

  it('is equivalent to formatResultsTable + formatSummary', () => {
    const results = [makeResult()]
    const expected = [...formatResultsTable(results, 10), ...formatSummary(results)]
    const actual = printResults(results, 10)

    expect(actual).toEqual(expected)
  })
})
