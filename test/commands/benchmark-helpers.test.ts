import { describe, expect, it } from 'vitest'

import {
  type BenchmarkResult,
  formatResultRow,
  formatResultsTable,
  formatSummary,
  printResults,
} from '../../src/commands/benchmark-helpers.js'

const stripAnsi = (s: string): string => s.replace(/\x1b\[[0-9;]*m/g, '')

const makeResult = (overrides: Partial<BenchmarkResult> = {}): BenchmarkResult => ({
  avgTime: 10.123,
  maxTime: 15.456,
  minTime: 5.789,
  ruleId: 'test-rule',
  runCount: 3,
  totalTime: 30.46,
  ...overrides,
})

// ─── formatResultRow ───

describe('formatResultRow', () => {
  it('formats a single result row with padded fields', () => {
    const result = makeResult()
    const row = formatResultRow(result)
    expect(row).toContain('test-rule')
    expect(row.length).toBeGreaterThan(40)
  })

  it('pads ruleId to 40 characters', () => {
    const result = makeResult({ ruleId: 'short' })
    const row = formatResultRow(result)
    expect(row.substring(0, 40)).toContain('short')
    expect(row.substring(0, 40).trimEnd()).toBe('short')
  })

  it('includes avgTime with correct decimal precision', () => {
    const result = makeResult({ avgTime: 12.3456 })
    const row = formatResultRow(result)
    expect(row).toContain('12.346')
  })

  it('includes minTime formatted', () => {
    const result = makeResult({ minTime: 1.234 })
    const row = formatResultRow(result)
    expect(row).toContain('1.234')
  })

  it('includes maxTime formatted', () => {
    const result = makeResult({ maxTime: 99.876 })
    const row = formatResultRow(result)
    expect(row).toContain('99.876')
  })

  it('includes totalTime with 2 decimal places', () => {
    const result = makeResult({ totalTime: 123.4 })
    const row = formatResultRow(result)
    expect(row).toContain('123.40')
  })

  it('handles zero values', () => {
    const result = makeResult({ avgTime: 0, minTime: 0, maxTime: 0, totalTime: 0 })
    const row = formatResultRow(result)
    expect(row).toContain('0.000')
    expect(row).toContain('0.00')
  })

  it('handles large values', () => {
    const result = makeResult({ avgTime: 9999.999, totalTime: 99999.99 })
    const row = formatResultRow(result)
    expect(row).toContain('9999.999')
    expect(row).toContain('99999.99')
  })
})

// ─── formatResultsTable ───

describe('formatResultsTable', () => {
  const results: BenchmarkResult[] = [
    makeResult({ ruleId: 'rule-a', avgTime: 10.5 }),
    makeResult({ ruleId: 'rule-b', avgTime: 5.2 }),
    makeResult({ ruleId: 'rule-c', avgTime: 200.0 }),
  ]

  it('returns header, separator, and formatted rows', () => {
    const lines = formatResultsTable(results, 10)
    expect(lines.length).toBeGreaterThanOrEqual(5)
  })

  it('starts with a bold "Results" header line', () => {
    const lines = formatResultsTable(results, 10)
    expect(stripAnsi(lines[0]!)).toContain('Results (sorted by average time):')
  })

  it('contains column headers', () => {
    const lines = formatResultsTable(results, 10)
    const headerLine = stripAnsi(lines[2]!)
    expect(headerLine).toContain('Rule ID')
    expect(headerLine).toContain('Avg (ms)')
    expect(headerLine).toContain('Min (ms)')
    expect(headerLine).toContain('Max (ms)')
    expect(headerLine).toContain('Total (ms)')
  })

  it('contains a separator line', () => {
    const lines = formatResultsTable(results, 10)
    const separator = stripAnsi(lines[3]!)
    expect(separator).toMatch(/^-+$/)
  })

  it('limits output to topCount results', () => {
    const lines = formatResultsTable(results, 2)
    const dataLines = lines.slice(4)
    expect(dataLines).toHaveLength(2)
  })

  it('shows all results when topCount exceeds array length', () => {
    const lines = formatResultsTable(results, 100)
    const dataLines = lines.slice(4)
    expect(dataLines).toHaveLength(3)
  })

  it('outputs a row for very slow rules', () => {
    const slowResults = [makeResult({ ruleId: 'very-slow', avgTime: 150 })]
    const lines = formatResultsTable(slowResults, 10)
    const dataLine = lines[4]!
    expect(stripAnsi(dataLine)).toContain('very-slow')
    expect(stripAnsi(dataLine)).toContain('150.000')
  })

  it('outputs a row for slow rules', () => {
    const slowResults = [makeResult({ ruleId: 'slow', avgTime: 75 })]
    const lines = formatResultsTable(slowResults, 10)
    const dataLine = lines[4]!
    expect(stripAnsi(dataLine)).toContain('slow')
    expect(stripAnsi(dataLine)).toContain('75.000')
  })

  it('does not color fast rules', () => {
    const fastResults = [makeResult({ ruleId: 'fast', avgTime: 5 })]
    const lines = formatResultsTable(fastResults, 10)
    const dataLine = lines[4]!
    expect(dataLine).not.toContain('\x1b[')
  })

  it('handles empty results array', () => {
    const lines = formatResultsTable([], 10)
    expect(lines.length).toBe(4)
    const dataLines = lines.slice(4)
    expect(dataLines).toHaveLength(0)
  })
})

// ─── formatSummary ───

describe('formatSummary', () => {
  it('shows total rules benchmarked', () => {
    const results = [makeResult({ ruleId: 'r1' }), makeResult({ ruleId: 'r2' })]
    const lines = formatSummary(results)
    const joined = lines.map(stripAnsi).join('\n')
    expect(joined).toContain('Total rules benchmarked: 2')
  })

  it('shows total time', () => {
    const results = [makeResult({ totalTime: 10 }), makeResult({ totalTime: 20 })]
    const lines = formatSummary(results)
    const joined = lines.map(stripAnsi).join('\n')
    expect(joined).toContain('Total time: 30.00ms')
  })

  it('shows slowest rule', () => {
    const results = [
      makeResult({ ruleId: 'slowest-rule', avgTime: 100 }),
      makeResult({ ruleId: 'fastest-rule', avgTime: 1 }),
    ]
    const lines = formatSummary(results)
    const joined = lines.map(stripAnsi).join('\n')
    expect(joined).toContain('Slowest rule: slowest-rule (100.000ms avg)')
  })

  it('shows fastest rule', () => {
    const results = [
      makeResult({ ruleId: 'slow-rule', avgTime: 50 }),
      makeResult({ ruleId: 'fast-rule', avgTime: 0.5 }),
    ]
    const lines = formatSummary(results)
    const joined = lines.map(stripAnsi).join('\n')
    expect(joined).toContain('Fastest rule: fast-rule (0.500ms avg)')
  })

  it('handles empty results with count 0 and total time 0ms', () => {
    const lines = formatSummary([])
    const joined = lines.map(stripAnsi).join('\n')
    expect(joined).toContain('Total rules benchmarked: 0')
    expect(joined).toContain('Total time: 0.00ms')
  })

  it('does not show slowest/fastest for empty results', () => {
    const lines = formatSummary([])
    const joined = lines.map(stripAnsi).join('\n')
    expect(joined).not.toContain('Slowest rule:')
    expect(joined).not.toContain('Fastest rule:')
  })

  it('handles single result where slowest equals fastest', () => {
    const results = [makeResult({ ruleId: 'only-rule', avgTime: 42 })]
    const lines = formatSummary(results)
    const joined = lines.map(stripAnsi).join('\n')
    expect(joined).toContain('Slowest rule: only-rule (42.000ms avg)')
    expect(joined).toContain('Fastest rule: only-rule (42.000ms avg)')
  })

  it('includes a "Summary:" label', () => {
    const lines = formatSummary([makeResult()])
    const summaryLine = lines.find((l) => stripAnsi(l).includes('Summary:'))
    expect(summaryLine).toBeDefined()
  })
})

// ─── printResults ───

describe('printResults', () => {
  it('combines formatResultsTable and formatSummary', () => {
    const results = [makeResult({ ruleId: 'test' })]
    const tableLines = formatResultsTable(results, 10)
    const summaryLines = formatSummary(results)
    const combined = printResults(results, 10)
    expect(combined).toEqual([...tableLines, ...summaryLines])
  })

  it('includes both table headers and summary', () => {
    const results = [makeResult()]
    const lines = printResults(results, 10)
    const joined = lines.map(stripAnsi).join('\n')
    expect(joined).toContain('Results (sorted by average time):')
    expect(joined).toContain('Summary:')
  })

  it('respects topCount parameter', () => {
    const results = [
      makeResult({ ruleId: 'r1' }),
      makeResult({ ruleId: 'r2' }),
      makeResult({ ruleId: 'r3' }),
    ]
    const lines = printResults(results, 1)
    const tableOnly = formatResultsTable(results, 1)
    const tableDataLines = tableOnly.slice(4)
    expect(tableDataLines).toHaveLength(1)
    expect(stripAnsi(tableDataLines[0]!)).toContain('r1')
  })
})
