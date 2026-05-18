import { describe, it, expect, vi } from 'vitest'

import {
  formatResultRow,
  formatResultsTable,
  formatSummary,
  printResults,
  getRulesToBenchmark,
} from '../src/commands/benchmark-helpers.js'

vi.mock('../src/rules/lazy-loader.js', () => ({
  lazyRuleLoader: {
    loadAllRules: vi.fn().mockResolvedValue({
      'rule-a': { meta: { name: 'rule-a' } },
      'rule-b': { meta: { name: 'rule-b' } },
    }),
  },
}))

import type { BenchmarkResult } from '../src/commands/benchmark-helpers.js'

// ─── Helpers ──────────────────────────────────────────

function makeResult(overrides: Partial<BenchmarkResult> = {}): BenchmarkResult {
  return {
    avgTime: 10.123,
    maxTime: 15.456,
    minTime: 5.789,
    ruleId: 'test-rule',
    runCount: 3,
    totalTime: 30.456,
    ...overrides,
  }
}

// ─── formatResultRow ──────────────────────────────────
describe('formatResultRow', () => {
  it('formats a single result row with proper padding', () => {
    const result = makeResult()
    const row = formatResultRow(result)

    expect(row).toContain('test-rule')
    expect(row).toContain('10.123')
    expect(row).toContain('5.789')
    expect(row).toContain('15.456')
    expect(row).toContain('30.46')
  })

  it('pads rule ID to 40 characters', () => {
    const result = makeResult({ ruleId: 'short' })
    const row = formatResultRow(result)

    expect(row.startsWith('short')).toBe(true)
    // The ruleId is padded to 40 chars
    const ruleIdPart = row.slice(0, 40)
    expect(ruleIdPart.trim()).toBe('short')
  })

  it('handles long rule IDs', () => {
    const result = makeResult({ ruleId: 'a-very-long-rule-id-that-might-overflow-padding' })
    const row = formatResultRow(result)

    expect(row).toContain('a-very-long-rule-id-that-might-overflow-padding')
  })

  it('handles very small times', () => {
    const result = makeResult({ avgTime: 0.001, minTime: 0.001, maxTime: 0.001, totalTime: 0.003 })
    const row = formatResultRow(result)

    expect(row).toContain('0.001')
  })

  it('handles zero times', () => {
    const result = makeResult({ avgTime: 0, minTime: 0, maxTime: 0, totalTime: 0 })
    const row = formatResultRow(result)

    expect(row).toContain('0.000')
  })
})

// ─── formatResultsTable ───────────────────────────────
describe('formatResultsTable', () => {
  it('returns header lines', () => {
    const results = [makeResult()]
    const lines = formatResultsTable(results, 10)

    expect(lines.length).toBeGreaterThan(3)
    // Should contain header row elements
    const headerLine = lines.find((l) => l.includes('Avg (ms)'))
    expect(headerLine).toBeDefined()
  })

  it('limits results to topCount', () => {
    const results = Array.from({ length: 10 }, (_, i) =>
      makeResult({ ruleId: `rule-${i}`, avgTime: 100 - i * 10 }),
    )
    const lines = formatResultsTable(results, 3)

    // Should only include 3 rule rows (plus header lines)
    const ruleLines = lines.filter((l) => l.includes('rule-'))
    expect(ruleLines.length).toBeLessThanOrEqual(3)
  })

  it('handles empty results', () => {
    const lines = formatResultsTable([], 10)

    // Should still have header
    expect(lines.length).toBeGreaterThan(0)
  })

  it('colorizes slow rules', () => {
    const slowResult = makeResult({ avgTime: 150, ruleId: 'slow-rule' })
    const lines = formatResultsTable([slowResult], 10)

    // Should include the rule name (chalk codes are embedded)
    const ruleLine = lines.find((l) => l.includes('slow-rule'))
    expect(ruleLine).toBeDefined()
  })

  it('handles single result', () => {
    const lines = formatResultsTable([makeResult()], 1)

    expect(lines.length).toBeGreaterThan(0)
  })
})

// ─── formatSummary ────────────────────────────────────
describe('formatSummary', () => {
  it('produces summary with total rules and time', () => {
    const results = [makeResult(), makeResult({ ruleId: 'other', totalTime: 20 })]
    const lines = formatSummary(results)

    expect(lines).toContain('  Total rules benchmarked: 2')
    expect(lines.some((l) => l.includes('Total time:'))).toBe(true)
  })

  it('shows slowest and fastest rules', () => {
    const results = [
      makeResult({ ruleId: 'slowest', avgTime: 100 }),
      makeResult({ ruleId: 'fastest', avgTime: 1 }),
    ]
    const lines = formatSummary(results)

    expect(lines.some((l) => l.includes('Slowest rule: slowest'))).toBe(true)
    expect(lines.some((l) => l.includes('Fastest rule: fastest'))).toBe(true)
  })

  it('handles empty results gracefully', () => {
    const lines = formatSummary([])

    expect(lines).toContain('  Total rules benchmarked: 0')
    expect(lines.some((l) => l.includes('Total time:'))).toBe(true)
    // Should not show slowest/fastest when empty
    expect(lines.some((l) => l.includes('Slowest rule:'))).toBe(false)
  })

  it('handles single result (slowest = fastest)', () => {
    const results = [makeResult({ ruleId: 'only-rule' })]
    const lines = formatSummary(results)

    expect(lines.some((l) => l.includes('Slowest rule: only-rule'))).toBe(true)
    expect(lines.some((l) => l.includes('Fastest rule: only-rule'))).toBe(true)
  })
})

// ─── printResults ─────────────────────────────────────
describe('printResults', () => {
  it('combines table and summary', () => {
    const results = [makeResult()]
    const lines = printResults(results, 10)

    // Should have table header and summary
    expect(lines.some((l) => l.includes('Avg (ms)'))).toBe(true)
    expect(lines.some((l) => l.includes('Total rules benchmarked:'))).toBe(true)
  })

  it('returns combined output from formatResultsTable and formatSummary', () => {
    const results = [makeResult({ ruleId: 'combined-test' })]
    const lines = printResults(results, 10)

    expect(lines.length).toBeGreaterThan(5)
  })
})

// ─── getRulesToBenchmark ──────────────────────────────
describe('getRulesToBenchmark', () => {
  it('returns all rules when no specific rules requested', async () => {
    const result = await getRulesToBenchmark(undefined)

    expect(result).toHaveLength(2)
  })

  it('filters to requested rules only', async () => {
    const result = await getRulesToBenchmark(['rule-a'])

    expect(result).toHaveLength(1)
    expect(result[0][0]).toBe('rule-a')
  })

  it('returns empty when requested rules do not match', async () => {
    const result = await getRulesToBenchmark(['nonexistent'])

    expect(result).toHaveLength(0)
  })

  it('returns all rules when requested list is empty', async () => {
    const result = await getRulesToBenchmark([])

    expect(result).toHaveLength(2)
  })
})
