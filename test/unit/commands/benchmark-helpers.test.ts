import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import chalk from 'chalk'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { Project, type SourceFile } from 'ts-morph'

import {
  benchmarkRule,
  formatResultRow,
  formatResultsTable,
  formatSummary,
  getRulesToBenchmark,
  printResults,
  writeResults,
  type BenchmarkResult,
  type ParseCache,
} from '../../../src/commands/benchmark-helpers.js'

// Force chalk to output colors in tests
chalk.level = 1

// ============================================================================
// Factory Helpers
// ============================================================================

const makeBenchmarkResult = (overrides: Partial<BenchmarkResult> = {}): BenchmarkResult => ({
  avgTime: 10.123,
  maxTime: 15.456,
  minTime: 5.789,
  ruleId: 'test-rule',
  runCount: 3,
  totalTime: 30.369,
  ...overrides,
})

// ============================================================================
// BenchmarkResult Interface
// ============================================================================

describe('BenchmarkResult interface', () => {
  test('has required fields', () => {
    const result: BenchmarkResult = {
      avgTime: 1.0,
      maxTime: 2.0,
      minTime: 0.5,
      ruleId: 'my-rule',
      runCount: 5,
      totalTime: 5.0,
    }
    expect(result.avgTime).toBe(1.0)
    expect(result.maxTime).toBe(2.0)
    expect(result.minTime).toBe(0.5)
    expect(result.ruleId).toBe('my-rule')
    expect(result.runCount).toBe(5)
    expect(result.totalTime).toBe(5.0)
  })

  test('fields are numeric except ruleId', () => {
    const result = makeBenchmarkResult()
    expect(typeof result.avgTime).toBe('number')
    expect(typeof result.maxTime).toBe('number')
    expect(typeof result.minTime).toBe('number')
    expect(typeof result.ruleId).toBe('string')
    expect(typeof result.runCount).toBe('number')
    expect(typeof result.totalTime).toBe('number')
  })

  test('can hold zero values', () => {
    const result = makeBenchmarkResult({
      avgTime: 0,
      maxTime: 0,
      minTime: 0,
      totalTime: 0,
      runCount: 0,
    })
    expect(result.avgTime).toBe(0)
    expect(result.maxTime).toBe(0)
    expect(result.minTime).toBe(0)
    expect(result.totalTime).toBe(0)
    expect(result.runCount).toBe(0)
  })

  test('can hold very small decimal values', () => {
    const result = makeBenchmarkResult({
      avgTime: 0.000001,
      maxTime: 0.000002,
      minTime: 0.0000005,
      totalTime: 0.000003,
    })
    expect(result.avgTime).toBe(0.000001)
    expect(result.maxTime).toBe(0.000002)
    expect(result.minTime).toBe(0.0000005)
    expect(result.totalTime).toBe(0.000003)
  })

  test('can hold large values', () => {
    const result = makeBenchmarkResult({
      avgTime: 999999.999,
      maxTime: 1000000.0,
      minTime: 999998.5,
      totalTime: 9999999.99,
      runCount: 1000000,
    })
    expect(result.avgTime).toBe(999999.999)
    expect(result.runCount).toBe(1000000)
  })

  test('ruleId can be empty string', () => {
    const result = makeBenchmarkResult({ ruleId: '' })
    expect(result.ruleId).toBe('')
  })

  test('ruleId can contain hyphens and underscores', () => {
    const result = makeBenchmarkResult({ ruleId: 'my-cool_rule-v2' })
    expect(result.ruleId).toBe('my-cool_rule-v2')
  })

  test('runCount is an integer', () => {
    const result = makeBenchmarkResult({ runCount: 42 })
    expect(Number.isInteger(result.runCount)).toBe(true)
  })
})

// ============================================================================
// formatResultRow
// ============================================================================

describe('formatResultRow', () => {
  test('formats a basic result row', () => {
    const result = makeBenchmarkResult({
      avgTime: 10.123,
      minTime: 5.456,
      maxTime: 15.789,
      totalTime: 30.369,
      ruleId: 'test-rule',
    })
    const row = formatResultRow(result)
    expect(row).toContain('test-rule')
    expect(row).toContain('10.123')
    expect(row).toContain('5.456')
    expect(row).toContain('15.789')
    expect(row).toContain('30.37')
  })

  test('pads ruleId to 40 characters', () => {
    const result = makeBenchmarkResult({ ruleId: 'short' })
    const row = formatResultRow(result)
    const ruleIdPart = row.slice(0, 40)
    expect(ruleIdPart.trim()).toBe('short')
    expect(ruleIdPart).toHaveLength(40)
  })

  test('ruleId exactly 40 characters is not truncated', () => {
    const ruleId = 'a'.repeat(40)
    const result = makeBenchmarkResult({ ruleId })
    const row = formatResultRow(result)
    expect(row.slice(0, 40)).toBe(ruleId)
  })

  test('ruleId longer than 40 characters overflows', () => {
    const ruleId = 'a'.repeat(50)
    const result = makeBenchmarkResult({ ruleId })
    const row = formatResultRow(result)
    expect(row.slice(0, 50)).toContain(ruleId)
  })

  test('formats zero times correctly', () => {
    const result = makeBenchmarkResult({
      avgTime: 0,
      minTime: 0,
      maxTime: 0,
      totalTime: 0,
    })
    const row = formatResultRow(result)
    expect(row).toContain('0.000')
  })

  test('formats very small times with 3 decimal precision', () => {
    const result = makeBenchmarkResult({
      avgTime: 0.001,
      minTime: 0.0,
      maxTime: 0.002,
      totalTime: 0.003,
    })
    const row = formatResultRow(result)
    expect(row).toContain('0.001')
  })

  test('formats large times correctly', () => {
    const result = makeBenchmarkResult({
      avgTime: 9999.999,
      minTime: 5000.0,
      maxTime: 15000.0,
      totalTime: 30000.0,
    })
    const row = formatResultRow(result)
    expect(row).toContain('9999.999')
    expect(row).toContain('5000.000')
    expect(row).toContain('15000.000')
    expect(row).toContain('30000.00')
  })

  test('totalTime uses 2 decimal places', () => {
    const result = makeBenchmarkResult({ totalTime: 123.456789 })
    const row = formatResultRow(result)
    expect(row).toContain('123.46')
  })

  test('avgTime uses 3 decimal places', () => {
    const result = makeBenchmarkResult({ avgTime: 1.2345 })
    const row = formatResultRow(result)
    expect(row).toContain('1.234')
  })

  test('minTime uses 3 decimal places', () => {
    const result = makeBenchmarkResult({ minTime: 2.3456 })
    const row = formatResultRow(result)
    expect(row).toContain('2.346')
  })

  test('maxTime uses 3 decimal places', () => {
    const result = makeBenchmarkResult({ maxTime: 3.4567 })
    const row = formatResultRow(result)
    expect(row).toContain('3.457')
  })

  test('returns a string', () => {
    const result = makeBenchmarkResult()
    expect(typeof formatResultRow(result)).toBe('string')
  })

  test('does not contain newline', () => {
    const result = makeBenchmarkResult()
    const row = formatResultRow(result)
    expect(row).not.toContain('\n')
  })

  test('handles negative avgTime', () => {
    const result = makeBenchmarkResult({ avgTime: -5.0 })
    const row = formatResultRow(result)
    expect(row).toContain('-5.000')
  })

  test('handles fractional totalTime rounding', () => {
    const result = makeBenchmarkResult({ totalTime: 99.999 })
    const row = formatResultRow(result)
    expect(row).toContain('100.00')
  })

  test('handles single-character ruleId', () => {
    const result = makeBenchmarkResult({ ruleId: 'x' })
    const row = formatResultRow(result)
    expect(row.slice(0, 40).trim()).toBe('x')
  })

  test('handles numeric-looking ruleId', () => {
    const result = makeBenchmarkResult({ ruleId: 'rule-123-v2' })
    const row = formatResultRow(result)
    expect(row).toContain('rule-123-v2')
  })

  test('metric fields are right-aligned with padStart', () => {
    const result = makeBenchmarkResult({ avgTime: 1.0, minTime: 1.0, maxTime: 1.0, totalTime: 1.0 })
    const row = formatResultRow(result)
    // After 40-char ruleId, the avg time column starts
    const afterRuleId = row.slice(40)
    expect(afterRuleId.startsWith(' ')).toBe(true)
  })

  test('consistent output for same input', () => {
    const result = makeBenchmarkResult()
    const row1 = formatResultRow(result)
    const row2 = formatResultRow(result)
    expect(row1).toBe(row2)
  })

  test('handles very large totalTime', () => {
    const result = makeBenchmarkResult({ totalTime: 99999999.99 })
    const row = formatResultRow(result)
    expect(row).toContain('99999999.99')
  })

  test('handles avgTime with many decimal places', () => {
    const result = makeBenchmarkResult({ avgTime: 1.123456789 })
    const row = formatResultRow(result)
    // toFixed(3) should round to 1.123
    expect(row).toContain('1.123')
  })

  test('handles empty ruleId', () => {
    const result = makeBenchmarkResult({ ruleId: '' })
    const row = formatResultRow(result)
    expect(row.slice(0, 40)).toBe(' '.repeat(40))
  })

  test('handles ruleId with spaces', () => {
    const result = makeBenchmarkResult({ ruleId: 'my rule' })
    const row = formatResultRow(result)
    expect(row.slice(0, 40).trim()).toBe('my rule')
  })

  test('handles runCount of 1', () => {
    const result = makeBenchmarkResult({ runCount: 1, totalTime: 5.0, avgTime: 5.0 })
    const row = formatResultRow(result)
    expect(row).toContain('5.000')
  })
})

// ============================================================================
// formatResultsTable
// ============================================================================

describe('formatResultsTable', () => {
  test('returns array of strings', () => {
    const results = [makeBenchmarkResult()]
    const lines = formatResultsTable(results, 10)
    expect(Array.isArray(lines)).toBe(true)
    for (const line of lines) {
      expect(typeof line).toBe('string')
    }
  })

  test('includes header with "Results (sorted by average time)"', () => {
    const results = [makeBenchmarkResult()]
    const lines = formatResultsTable(results, 10)
    const joined = lines.join('\n')
    expect(joined).toContain('Results (sorted by average time)')
  })

  test('includes column headers', () => {
    const results = [makeBenchmarkResult()]
    const lines = formatResultsTable(results, 10)
    const joined = lines.join('\n')
    expect(joined).toContain('Rule ID')
    expect(joined).toContain('Avg (ms)')
    expect(joined).toContain('Min (ms)')
    expect(joined).toContain('Max (ms)')
    expect(joined).toContain('Total (ms)')
  })

  test('includes separator line', () => {
    const results = [makeBenchmarkResult()]
    const lines = formatResultsTable(results, 10)
    const joined = lines.join('\n')
    expect(joined).toContain('---')
  })

  test('shows single result', () => {
    const result = makeBenchmarkResult({ ruleId: 'my-rule' })
    const lines = formatResultsTable([result], 10)
    const joined = lines.join('\n')
    expect(joined).toContain('my-rule')
  })

  test('shows multiple results', () => {
    const results = [
      makeBenchmarkResult({ ruleId: 'rule-a' }),
      makeBenchmarkResult({ ruleId: 'rule-b' }),
      makeBenchmarkResult({ ruleId: 'rule-c' }),
    ]
    const lines = formatResultsTable(results, 10)
    const joined = lines.join('\n')
    expect(joined).toContain('rule-a')
    expect(joined).toContain('rule-b')
    expect(joined).toContain('rule-c')
  })

  test('respects topCount to limit displayed results', () => {
    const results = [
      makeBenchmarkResult({ ruleId: 'rule-1' }),
      makeBenchmarkResult({ ruleId: 'rule-2' }),
      makeBenchmarkResult({ ruleId: 'rule-3' }),
      makeBenchmarkResult({ ruleId: 'rule-4' }),
      makeBenchmarkResult({ ruleId: 'rule-5' }),
    ]
    const lines = formatResultsTable(results, 2)
    const joined = lines.join('\n')
    expect(joined).toContain('rule-1')
    expect(joined).toContain('rule-2')
    expect(joined).not.toContain('rule-3')
    expect(joined).not.toContain('rule-4')
    expect(joined).not.toContain('rule-5')
  })

  test('topCount larger than results shows all results', () => {
    const results = [
      makeBenchmarkResult({ ruleId: 'rule-a' }),
      makeBenchmarkResult({ ruleId: 'rule-b' }),
    ]
    const lines = formatResultsTable(results, 100)
    const joined = lines.join('\n')
    expect(joined).toContain('rule-a')
    expect(joined).toContain('rule-b')
  })

  test('topCount of 0 shows no result rows', () => {
    const results = [makeBenchmarkResult({ ruleId: 'rule-a' })]
    const lines = formatResultsTable(results, 0)
    const joined = lines.join('\n')
    expect(joined).not.toContain('rule-a')
  })

  test('topCount of 1 shows only first result', () => {
    const results = [
      makeBenchmarkResult({ ruleId: 'rule-a' }),
      makeBenchmarkResult({ ruleId: 'rule-b' }),
    ]
    const lines = formatResultsTable(results, 1)
    const joined = lines.join('\n')
    expect(joined).toContain('rule-a')
    expect(joined).not.toContain('rule-b')
  })

  test('empty results array produces header but no result rows', () => {
    const lines = formatResultsTable([], 10)
    const joined = lines.join('\n')
    expect(joined).toContain('Results (sorted by average time)')
    expect(joined).toContain('Rule ID')
  })

  test('slow results (avgTime > 50ms) are yellow', () => {
    const result = makeBenchmarkResult({ avgTime: 75.0, ruleId: 'slow-rule' })
    const lines = formatResultsTable([result], 10)
    const joined = lines.join('\n')
    expect(joined).toContain('slow-rule')
    const ruleLine = lines.find((l) => l.includes('slow-rule') && l.includes('75.000'))
    expect(ruleLine).toBeDefined()
    expect(ruleLine!.includes('\x1b')).toBe(true)
  })

  test('very slow results (avgTime > 100ms) are red', () => {
    const result = makeBenchmarkResult({ avgTime: 150.0, ruleId: 'vslow-rule' })
    const lines = formatResultsTable([result], 10)
    const joined = lines.join('\n')
    expect(joined).toContain('vslow-rule')
    const ruleLine = lines.find((l) => l.includes('vslow-rule') && l.includes('150.000'))
    expect(ruleLine).toBeDefined()
    expect(ruleLine!.includes('\x1b')).toBe(true)
  })

  test('fast results (avgTime <= 50ms) have no color', () => {
    const result = makeBenchmarkResult({ avgTime: 10.0, ruleId: 'fast-rule' })
    const lines = formatResultsTable([result], 10)
    const ruleLine = lines.find((l) => l.includes('fast-rule') && l.includes('10.000'))
    expect(ruleLine).toBeDefined()
    expect(ruleLine!.includes('\x1b')).toBe(false)
  })

  test('boundary: avgTime exactly 50ms is not colored', () => {
    const result = makeBenchmarkResult({ avgTime: 50.0, ruleId: 'boundary-50' })
    const lines = formatResultsTable([result], 10)
    const ruleLine = lines.find((l) => l.includes('boundary-50') && l.includes('50.000'))
    expect(ruleLine).toBeDefined()
    expect(ruleLine!.includes('\x1b')).toBe(false)
  })

  test('boundary: avgTime 50.001ms is yellow (slow)', () => {
    const result = makeBenchmarkResult({ avgTime: 50.001, ruleId: 'slow-50' })
    const lines = formatResultsTable([result], 10)
    const ruleLine = lines.find((l) => l.includes('slow-50') && l.includes('50.001'))
    expect(ruleLine).toBeDefined()
    expect(ruleLine!.includes('\x1b')).toBe(true)
  })

  test('boundary: avgTime exactly 100ms is yellow (slow, not very slow)', () => {
    const result = makeBenchmarkResult({ avgTime: 100.0, ruleId: 'boundary-100' })
    const lines = formatResultsTable([result], 10)
    const ruleLine = lines.find((l) => l.includes('boundary-100') && l.includes('100.000'))
    expect(ruleLine).toBeDefined()
    expect(ruleLine!.includes('\x1b')).toBe(true)
  })

  test('boundary: avgTime 100.001ms is red (very slow)', () => {
    const result = makeBenchmarkResult({ avgTime: 100.001, ruleId: 'vslow-100' })
    const lines = formatResultsTable([result], 10)
    const ruleLine = lines.find((l) => l.includes('vslow-100') && l.includes('100.001'))
    expect(ruleLine).toBeDefined()
    expect(ruleLine!.includes('\x1b')).toBe(true)
  })

  test('first line is bold header', () => {
    const lines = formatResultsTable([makeBenchmarkResult()], 10)
    expect(lines[0]).toContain('Results (sorted by average time)')
  })

  test('second line is empty string', () => {
    const lines = formatResultsTable([makeBenchmarkResult()], 10)
    expect(lines[1]).toBe('')
  })

  test('header line contains Rule ID column', () => {
    const lines = formatResultsTable([makeBenchmarkResult()], 10)
    expect(lines[2]).toContain('Rule ID')
  })

  test('separator line follows header', () => {
    const lines = formatResultsTable([makeBenchmarkResult()], 10)
    expect(lines[3]).toContain('---')
  })

  test('result rows come after separator', () => {
    const lines = formatResultsTable([makeBenchmarkResult({ ruleId: 'test-rule' })], 10)
    const resultLine = lines.find((l) => l.includes('test-rule') && l.includes('10.123'))
    expect(resultLine).toBeDefined()
  })

  test('mixed fast and slow results have correct colors', () => {
    const results = [
      makeBenchmarkResult({
        avgTime: 150.0,
        maxTime: 150.0,
        minTime: 150.0,
        totalTime: 150.0,
        ruleId: 'very-slow',
      }),
      makeBenchmarkResult({
        avgTime: 75.0,
        maxTime: 75.0,
        minTime: 75.0,
        totalTime: 75.0,
        ruleId: 'slower',
      }),
      makeBenchmarkResult({
        avgTime: 10.0,
        maxTime: 10.0,
        minTime: 10.0,
        totalTime: 10.0,
        ruleId: 'faster',
      }),
    ]
    const lines = formatResultsTable(results, 10)

    const verySlowLine = lines.find((l) => l.includes('very-slow') && l.includes('150.000'))
    const slowLine = lines.find((l) => l.includes('slower') && l.includes('75.000'))
    const fastLine = lines.find((l) => l.includes('faster') && l.includes('10.000'))

    expect(verySlowLine!.includes('\x1b')).toBe(true)
    expect(slowLine!.includes('\x1b')).toBe(true)
    expect(fastLine!.includes('\x1b')).toBe(false)
  })

  test('preserves order of results', () => {
    const results = [
      makeBenchmarkResult({ ruleId: 'alpha' }),
      makeBenchmarkResult({ ruleId: 'beta' }),
      makeBenchmarkResult({ ruleId: 'gamma' }),
    ]
    const lines = formatResultsTable(results, 10)
    const joined = lines.join('\n')
    const alphaIdx = joined.indexOf('alpha')
    const betaIdx = joined.indexOf('beta')
    const gammaIdx = joined.indexOf('gamma')
    expect(alphaIdx).toBeLessThan(betaIdx)
    expect(betaIdx).toBeLessThan(gammaIdx)
  })

  test('handles topCount exactly equal to results length', () => {
    const results = [makeBenchmarkResult({ ruleId: 'a' }), makeBenchmarkResult({ ruleId: 'b' })]
    const lines = formatResultsTable(results, 2)
    const joined = lines.join('\n')
    expect(joined).toContain('a')
    expect(joined).toContain('b')
  })

  test('handles single result with topCount 1', () => {
    const results = [makeBenchmarkResult({ ruleId: 'only-rule' })]
    const lines = formatResultsTable(results, 1)
    const joined = lines.join('\n')
    expect(joined).toContain('only-rule')
  })

  test('handles large number of results', () => {
    const results = Array.from({ length: 50 }, (_, i) =>
      makeBenchmarkResult({ ruleId: `rule-${i}` }),
    )
    const lines = formatResultsTable(results, 20)
    // Should only show top 20
    const joined = lines.join('\n')
    expect(joined).toContain('rule-0')
    expect(joined).toContain('rule-19')
    expect(joined).not.toContain('rule-20')
  })

  test('separator has correct width (90 chars)', () => {
    const lines = formatResultsTable([makeBenchmarkResult()], 10)
    const separatorLine = lines[3]
    expect(separatorLine).toContain('-')
    const stripped = separatorLine.replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped).toBe('-'.repeat(90))
  })
})

// ============================================================================
// formatSummary
// ============================================================================

describe('formatSummary', () => {
  test('returns array of strings', () => {
    const lines = formatSummary([makeBenchmarkResult()])
    expect(Array.isArray(lines)).toBe(true)
    for (const line of lines) {
      expect(typeof line).toBe('string')
    }
  })

  test('includes Summary header', () => {
    const lines = formatSummary([makeBenchmarkResult()])
    const joined = lines.join('\n')
    expect(joined).toContain('Summary:')
  })

  test('includes total rules benchmarked count', () => {
    const results = [makeBenchmarkResult(), makeBenchmarkResult(), makeBenchmarkResult()]
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('Total rules benchmarked: 3')
  })

  test('includes total time', () => {
    const results = [
      makeBenchmarkResult({ totalTime: 10.5 }),
      makeBenchmarkResult({ totalTime: 20.3 }),
    ]
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('Total time: 30.80ms')
  })

  test('shows slowest rule from first result', () => {
    const results = [
      makeBenchmarkResult({ ruleId: 'slowest-rule', avgTime: 100.0 }),
      makeBenchmarkResult({ ruleId: 'faster-rule', avgTime: 50.0 }),
    ]
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('Slowest rule: slowest-rule')
    expect(joined).toContain('100.000ms avg')
  })

  test('shows fastest rule from last result', () => {
    const results = [
      makeBenchmarkResult({ ruleId: 'slowest-rule', avgTime: 100.0 }),
      makeBenchmarkResult({ ruleId: 'fastest-rule', avgTime: 1.0 }),
    ]
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('Fastest rule: fastest-rule')
    expect(joined).toContain('1.000ms avg')
  })

  test('empty results shows summary without slowest/fastest', () => {
    const lines = formatSummary([])
    const joined = lines.join('\n')
    expect(joined).toContain('Total rules benchmarked: 0')
    expect(joined).toContain('Total time: 0.00ms')
    expect(joined).not.toContain('Slowest rule:')
    expect(joined).not.toContain('Fastest rule:')
  })

  test('single result: slowest and fastest are same', () => {
    const results = [makeBenchmarkResult({ ruleId: 'only-rule', avgTime: 42.5 })]
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('Slowest rule: only-rule')
    expect(joined).toContain('Fastest rule: only-rule')
    expect(joined).toContain('42.500ms avg')
  })

  test('total time sums correctly for multiple results', () => {
    const results = [
      makeBenchmarkResult({ totalTime: 100.0 }),
      makeBenchmarkResult({ totalTime: 200.0 }),
      makeBenchmarkResult({ totalTime: 300.0 }),
    ]
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('600.00ms')
  })

  test('total time with zero results is 0.00ms', () => {
    const lines = formatSummary([])
    const joined = lines.join('\n')
    expect(joined).toContain('Total time: 0.00ms')
  })

  test('first line is empty', () => {
    const lines = formatSummary([makeBenchmarkResult()])
    expect(lines[0]).toBe('')
  })

  test('second line is cyan Summary header', () => {
    const lines = formatSummary([makeBenchmarkResult()])
    expect(lines[1]).toContain('Summary:')
  })

  test('handles fractional total time rounding', () => {
    const results = [
      makeBenchmarkResult({ totalTime: 33.333 }),
      makeBenchmarkResult({ totalTime: 66.667 }),
    ]
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('100.00ms')
  })

  test('handles many results', () => {
    const results = Array.from({ length: 100 }, (_, i) =>
      makeBenchmarkResult({ ruleId: `rule-${i}`, totalTime: 1.0 }),
    )
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('Total rules benchmarked: 100')
    expect(joined).toContain('100.00ms')
  })

  test('slowest/fastest avgTime uses 3 decimal precision', () => {
    const results = [
      makeBenchmarkResult({ ruleId: 'slow', avgTime: 123.4567 }),
      makeBenchmarkResult({ ruleId: 'fast', avgTime: 1.234 }),
    ]
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('123.457ms avg')
    expect(joined).toContain('1.234ms avg')
  })

  test('Summary header is cyan colored', () => {
    const lines = formatSummary([makeBenchmarkResult()])
    // chalk.cyan adds ANSI codes
    expect(lines[1]).toContain('Summary:')
    expect(lines[1]).toContain('\x1b')
  })

  test('handles results with all same times', () => {
    const results = [
      makeBenchmarkResult({ ruleId: 'rule-a', avgTime: 50.0, totalTime: 50.0 }),
      makeBenchmarkResult({ ruleId: 'rule-b', avgTime: 50.0, totalTime: 50.0 }),
    ]
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('100.00ms')
    expect(joined).toContain('Slowest rule: rule-a')
    expect(joined).toContain('Fastest rule: rule-b')
  })

  test('handles results with zero total time', () => {
    const results = [
      makeBenchmarkResult({ ruleId: 'rule-a', totalTime: 0 }),
      makeBenchmarkResult({ ruleId: 'rule-b', totalTime: 0 }),
    ]
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('Total time: 0.00ms')
  })

  test('total rules benchmarked matches array length', () => {
    const lengths = [1, 5, 10, 25]
    for (const len of lengths) {
      const results = Array.from({ length: len }, () => makeBenchmarkResult())
      const lines = formatSummary(results)
      const joined = lines.join('\n')
      expect(joined).toContain(`Total rules benchmarked: ${len}`)
    }
  })
})

// ============================================================================
// printResults
// ============================================================================

describe('printResults', () => {
  test('returns array of strings', () => {
    const results = [makeBenchmarkResult()]
    const lines = printResults(results, 10)
    expect(Array.isArray(lines)).toBe(true)
  })

  test('combines table and summary', () => {
    const results = [makeBenchmarkResult({ ruleId: 'my-rule' })]
    const lines = printResults(results, 10)
    const joined = lines.join('\n')
    expect(joined).toContain('Results (sorted by average time)')
    expect(joined).toContain('my-rule')
    expect(joined).toContain('Summary:')
    expect(joined).toContain('Total rules benchmarked')
  })

  test('table content appears before summary content', () => {
    const results = [makeBenchmarkResult({ ruleId: 'table-rule' })]
    const lines = printResults(results, 10)
    const joined = lines.join('\n')
    const tableIdx = joined.indexOf('Results (sorted by average time)')
    const summaryIdx = joined.indexOf('Summary:')
    expect(tableIdx).toBeLessThan(summaryIdx)
  })

  test('with empty results still shows both sections', () => {
    const lines = printResults([], 10)
    const joined = lines.join('\n')
    expect(joined).toContain('Results (sorted by average time)')
    expect(joined).toContain('Summary:')
    expect(joined).toContain('Total rules benchmarked: 0')
  })

  test('respects topCount for table but shows all in summary', () => {
    const results = Array.from({ length: 5 }, (_, i) =>
      makeBenchmarkResult({ ruleId: `rule-${i}` }),
    )
    const lines = printResults(results, 2)
    const joined = lines.join('\n')
    expect(joined).toContain('rule-0')
    expect(joined).toContain('rule-1')
    expect(joined).not.toContain('rule-2')
    // Summary still counts all 5
    expect(joined).toContain('Total rules benchmarked: 5')
  })

  test('summary follows table rows', () => {
    const results = [makeBenchmarkResult({ ruleId: 'test-rule' })]
    const tableLines = formatResultsTable(results, 10)
    const summaryLines = formatSummary(results)
    const printLines = printResults(results, 10)
    expect(printLines).toHaveLength(tableLines.length + summaryLines.length)
  })

  test('output is concatenation of formatResultsTable and formatSummary', () => {
    const results = [makeBenchmarkResult()]
    const topCount = 5
    const expected = [...formatResultsTable(results, topCount), ...formatSummary(results)]
    const actual = printResults(results, topCount)
    expect(actual).toEqual(expected)
  })

  test('handles single result with topCount 1', () => {
    const results = [makeBenchmarkResult({ ruleId: 'only' })]
    const lines = printResults(results, 1)
    const joined = lines.join('\n')
    expect(joined).toContain('only')
    expect(joined).toContain('Summary:')
  })

  test('handles multiple results', () => {
    const results = [
      makeBenchmarkResult({ ruleId: 'a' }),
      makeBenchmarkResult({ ruleId: 'b' }),
      makeBenchmarkResult({ ruleId: 'c' }),
    ]
    const lines = printResults(results, 10)
    const joined = lines.join('\n')
    expect(joined).toContain('Total rules benchmarked: 3')
  })

  test('preserves color coding from table', () => {
    const results = [
      makeBenchmarkResult({
        avgTime: 150.0,
        maxTime: 150.0,
        minTime: 150.0,
        totalTime: 150.0,
        ruleId: 'very-slow',
      }),
    ]
    const lines = printResults(results, 10)
    const ruleLine = lines.find((l) => l.includes('very-slow') && l.includes('150.000'))
    expect(ruleLine).toBeDefined()
    expect(ruleLine!.includes('\x1b')).toBe(true)
  })
})

// ============================================================================
// writeResults
// ============================================================================

describe('writeResults', () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = join(tmpdir(), `benchmark-test-${Date.now()}-${Math.random().toString(36).slice(2)}`)
    await mkdir(tempDir, { recursive: true })
  })

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true })
  })

  test('writes results to JSON file', async () => {
    const results = [makeBenchmarkResult({ ruleId: 'test-rule' })]
    const outputPath = join(tempDir, 'results.json')
    await writeResults(results, outputPath)

    const content = await import('node:fs/promises').then((fs) => fs.readFile(outputPath, 'utf-8'))
    const parsed = JSON.parse(content)
    expect(parsed).toHaveLength(1)
    expect(parsed[0].ruleId).toBe('test-rule')
  })

  test('writes valid JSON with 2-space indentation', async () => {
    const results = [makeBenchmarkResult()]
    const outputPath = join(tempDir, 'formatted.json')
    await writeResults(results, outputPath)

    const content = await import('node:fs/promises').then((fs) => fs.readFile(outputPath, 'utf-8'))
    expect(content).toContain('\n  ')
    // Verify it parses without error
    expect(() => JSON.parse(content)).not.toThrow()
  })

  test('writes all BenchmarkResult fields', async () => {
    const results = [
      makeBenchmarkResult({
        avgTime: 10.5,
        maxTime: 20.0,
        minTime: 5.0,
        ruleId: 'full-rule',
        runCount: 3,
        totalTime: 31.5,
      }),
    ]
    const outputPath = join(tempDir, 'full.json')
    await writeResults(results, outputPath)

    const content = await import('node:fs/promises').then((fs) => fs.readFile(outputPath, 'utf-8'))
    const parsed = JSON.parse(content)
    expect(parsed[0]).toEqual({
      avgTime: 10.5,
      maxTime: 20.0,
      minTime: 5.0,
      ruleId: 'full-rule',
      runCount: 3,
      totalTime: 31.5,
    })
  })

  test('writes empty array', async () => {
    const outputPath = join(tempDir, 'empty.json')
    await writeResults([], outputPath)

    const content = await import('node:fs/promises').then((fs) => fs.readFile(outputPath, 'utf-8'))
    const parsed = JSON.parse(content)
    expect(parsed).toEqual([])
  })

  test('writes multiple results', async () => {
    const results = [
      makeBenchmarkResult({ ruleId: 'rule-a' }),
      makeBenchmarkResult({ ruleId: 'rule-b' }),
      makeBenchmarkResult({ ruleId: 'rule-c' }),
    ]
    const outputPath = join(tempDir, 'multi.json')
    await writeResults(results, outputPath)

    const content = await import('node:fs/promises').then((fs) => fs.readFile(outputPath, 'utf-8'))
    const parsed = JSON.parse(content)
    expect(parsed).toHaveLength(3)
    expect(parsed.map((r: { ruleId: string }) => r.ruleId)).toEqual(['rule-a', 'rule-b', 'rule-c'])
  })

  test('overwrites existing file', async () => {
    const outputPath = join(tempDir, 'overwrite.json')
    await writeFile(outputPath, 'old content')

    const results = [makeBenchmarkResult({ ruleId: 'new-rule' })]
    await writeResults(results, outputPath)

    const content = await import('node:fs/promises').then((fs) => fs.readFile(outputPath, 'utf-8'))
    const parsed = JSON.parse(content)
    expect(parsed[0].ruleId).toBe('new-rule')
  })

  test('preserves numeric precision', async () => {
    const results = [
      makeBenchmarkResult({
        avgTime: 10.123456,
        maxTime: 20.999999,
        minTime: 0.000001,
        totalTime: 30.123456,
      }),
    ]
    const outputPath = join(tempDir, 'precision.json')
    await writeResults(results, outputPath)

    const content = await import('node:fs/promises').then((fs) => fs.readFile(outputPath, 'utf-8'))
    const parsed = JSON.parse(content)
    expect(parsed[0].avgTime).toBe(10.123456)
    expect(parsed[0].maxTime).toBe(20.999999)
    expect(parsed[0].minTime).toBe(0.000001)
    expect(parsed[0].totalTime).toBe(30.123456)
  })

  test('creates file at nested path', async () => {
    const nestedDir = join(tempDir, 'nested', 'deep')
    await mkdir(nestedDir, { recursive: true })
    const outputPath = join(nestedDir, 'results.json')

    const results = [makeBenchmarkResult()]
    await writeResults(results, outputPath)

    const content = await import('node:fs/promises').then((fs) => fs.readFile(outputPath, 'utf-8'))
    expect(() => JSON.parse(content)).not.toThrow()
  })

  test('handles results with zero values', async () => {
    const results = [
      makeBenchmarkResult({
        avgTime: 0,
        maxTime: 0,
        minTime: 0,
        totalTime: 0,
        runCount: 0,
        ruleId: 'zero-rule',
      }),
    ]
    const outputPath = join(tempDir, 'zero.json')
    await writeResults(results, outputPath)

    const content = await import('node:fs/promises').then((fs) => fs.readFile(outputPath, 'utf-8'))
    const parsed = JSON.parse(content)
    expect(parsed[0].avgTime).toBe(0)
    expect(parsed[0].runCount).toBe(0)
  })

  test('handles large number of results', async () => {
    const results = Array.from({ length: 100 }, (_, i) =>
      makeBenchmarkResult({ ruleId: `rule-${i}` }),
    )
    const outputPath = join(tempDir, 'large.json')
    await writeResults(results, outputPath)

    const content = await import('node:fs/promises').then((fs) => fs.readFile(outputPath, 'utf-8'))
    const parsed = JSON.parse(content)
    expect(parsed).toHaveLength(100)
  })
})

// ============================================================================
// benchmarkRule
// ============================================================================

describe('benchmarkRule', () => {
  function createTestSourceFile(): SourceFile {
    const project = new Project({ useInMemoryFileSystem: true })
    return project.createSourceFile('test.ts', 'const x = 1')
  }

  test('returns a BenchmarkResult', async () => {
    const sf = createTestSourceFile()
    const parseCache: ParseCache = new Map([['test.ts', { sourceFile: sf }]])
    const mockRuleDef: import('../../../src/rules/types.js').RuleDefinition = {
      create: () => ({
        visitor: {},
        onComplete: () => [],
      }),
      defaultOptions: {},
      meta: {
        category: 'patterns',
        description: 'Test rule',
        name: 'test-rule',
        recommended: false,
      },
    }

    const result = await benchmarkRule('test-rule', mockRuleDef, parseCache, 1)

    expect(result).toHaveProperty('avgTime')
    expect(result).toHaveProperty('maxTime')
    expect(result).toHaveProperty('minTime')
    expect(result).toHaveProperty('ruleId')
    expect(result).toHaveProperty('runCount')
    expect(result).toHaveProperty('totalTime')
  })

  test('returns correct ruleId', async () => {
    const sf = createTestSourceFile()
    const parseCache: ParseCache = new Map([['test.ts', { sourceFile: sf }]])
    const mockRuleDef: import('../../../src/rules/types.js').RuleDefinition = {
      create: () => ({ visitor: {}, onComplete: () => [] }),
      defaultOptions: {},
      meta: { category: 'patterns', description: 'Test', name: 'test-rule', recommended: false },
    }

    const result = await benchmarkRule('my-special-rule', mockRuleDef, parseCache, 1)
    expect(result.ruleId).toBe('my-special-rule')
  })

  test('returns correct runCount', async () => {
    const sf = createTestSourceFile()
    const parseCache: ParseCache = new Map([['test.ts', { sourceFile: sf }]])
    const mockRuleDef: import('../../../src/rules/types.js').RuleDefinition = {
      create: () => ({ visitor: {}, onComplete: () => [] }),
      defaultOptions: {},
      meta: { category: 'patterns', description: 'Test', name: 'test-rule', recommended: false },
    }

    const result = await benchmarkRule('test-rule', mockRuleDef, parseCache, 5)
    expect(result.runCount).toBe(5)
  })

  test('returns correct runCount for single iteration', async () => {
    const sf = createTestSourceFile()
    const parseCache: ParseCache = new Map([['test.ts', { sourceFile: sf }]])
    const mockRuleDef: import('../../../src/rules/types.js').RuleDefinition = {
      create: () => ({ visitor: {}, onComplete: () => [] }),
      defaultOptions: {},
      meta: { category: 'patterns', description: 'Test', name: 'test-rule', recommended: false },
    }

    const result = await benchmarkRule('test-rule', mockRuleDef, parseCache, 1)
    expect(result.runCount).toBe(1)
  })

  test('avgTime is totalTime / runCount', async () => {
    const sf = createTestSourceFile()
    const parseCache: ParseCache = new Map([['test.ts', { sourceFile: sf }]])
    const mockRuleDef: import('../../../src/rules/types.js').RuleDefinition = {
      create: () => ({ visitor: {}, onComplete: () => [] }),
      defaultOptions: {},
      meta: { category: 'patterns', description: 'Test', name: 'test-rule', recommended: false },
    }

    const result = await benchmarkRule('test-rule', mockRuleDef, parseCache, 3)
    expect(result.avgTime).toBeCloseTo(result.totalTime / result.runCount, 10)
  })

  test('minTime <= avgTime <= maxTime', async () => {
    const sf = createTestSourceFile()
    const parseCache: ParseCache = new Map([['test.ts', { sourceFile: sf }]])
    const mockRuleDef: import('../../../src/rules/types.js').RuleDefinition = {
      create: () => ({ visitor: {}, onComplete: () => [] }),
      defaultOptions: {},
      meta: { category: 'patterns', description: 'Test', name: 'test-rule', recommended: false },
    }

    const result = await benchmarkRule('test-rule', mockRuleDef, parseCache, 5)
    expect(result.minTime).toBeLessThanOrEqual(result.avgTime)
    expect(result.avgTime).toBeLessThanOrEqual(result.maxTime)
  })

  test('handles empty parseCache', async () => {
    const parseCache: ParseCache = new Map()
    const mockRuleDef: import('../../../src/rules/types.js').RuleDefinition = {
      create: () => ({ visitor: {}, onComplete: () => [] }),
      defaultOptions: {},
      meta: { category: 'patterns', description: 'Test', name: 'test-rule', recommended: false },
    }

    const result = await benchmarkRule('test-rule', mockRuleDef, parseCache, 3)
    expect(result.ruleId).toBe('test-rule')
    expect(result.runCount).toBe(3)
    expect(result.totalTime).toBeGreaterThanOrEqual(0)
  })

  test('handles multiple files in parseCache', async () => {
    const sf1 = createTestSourceFile()
    const sf2 = createTestSourceFile()
    const sf3 = createTestSourceFile()
    const parseCache: ParseCache = new Map([
      ['file1.ts', { sourceFile: sf1 }],
      ['file2.ts', { sourceFile: sf2 }],
      ['file3.ts', { sourceFile: sf3 }],
    ])
    const mockRuleDef: import('../../../src/rules/types.js').RuleDefinition = {
      create: () => ({ visitor: {}, onComplete: () => [] }),
      defaultOptions: {},
      meta: { category: 'patterns', description: 'Test', name: 'test-rule', recommended: false },
    }

    const result = await benchmarkRule('test-rule', mockRuleDef, parseCache, 2)
    expect(result.ruleId).toBe('test-rule')
    expect(result.runCount).toBe(2)
  })

  test('all times are non-negative', async () => {
    const sf = createTestSourceFile()
    const parseCache: ParseCache = new Map([['test.ts', { sourceFile: sf }]])
    const mockRuleDef: import('../../../src/rules/types.js').RuleDefinition = {
      create: () => ({ visitor: {}, onComplete: () => [] }),
      defaultOptions: {},
      meta: { category: 'patterns', description: 'Test', name: 'test-rule', recommended: false },
    }

    const result = await benchmarkRule('test-rule', mockRuleDef, parseCache, 3)
    expect(result.minTime).toBeGreaterThanOrEqual(0)
    expect(result.maxTime).toBeGreaterThanOrEqual(0)
    expect(result.avgTime).toBeGreaterThanOrEqual(0)
    expect(result.totalTime).toBeGreaterThanOrEqual(0)
  })

  test('returns Promise that resolves to BenchmarkResult', async () => {
    const sf = createTestSourceFile()
    const parseCache: ParseCache = new Map([['test.ts', { sourceFile: sf }]])
    const mockRuleDef: import('../../../src/rules/types.js').RuleDefinition = {
      create: () => ({ visitor: {}, onComplete: () => [] }),
      defaultOptions: {},
      meta: { category: 'patterns', description: 'Test', name: 'test-rule', recommended: false },
    }

    const promise = benchmarkRule('test-rule', mockRuleDef, parseCache, 1)
    expect(promise).toBeInstanceOf(Promise)
    const result = await promise
    expect(result.ruleId).toBe('test-rule')
  })

  test('works with 10 iterations', async () => {
    const sf = createTestSourceFile()
    const parseCache: ParseCache = new Map([['test.ts', { sourceFile: sf }]])
    const mockRuleDef: import('../../../src/rules/types.js').RuleDefinition = {
      create: () => ({ visitor: {}, onComplete: () => [] }),
      defaultOptions: {},
      meta: { category: 'patterns', description: 'Test', name: 'test-rule', recommended: false },
    }

    const result = await benchmarkRule('test-rule', mockRuleDef, parseCache, 10)
    expect(result.runCount).toBe(10)
  })
})

// ============================================================================
// getRulesToBenchmark
// ============================================================================

describe('getRulesToBenchmark', () => {
  test('returns all rules when requestedRules is undefined', async () => {
    const result = await getRulesToBenchmark(undefined)
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
  })

  test('returns all rules when requestedRules is empty array', async () => {
    const result = await getRulesToBenchmark([])
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
  })

  test('filters to requested rules', async () => {
    // Get all rules first to find a valid rule ID
    const allRules = await getRulesToBenchmark(undefined)
    expect(allRules.length).toBeGreaterThan(0)

    const firstRuleId = allRules[0]![0]
    const result = await getRulesToBenchmark([firstRuleId])
    expect(result).toHaveLength(1)
    expect(result[0]![0]).toBe(firstRuleId)
  })

  test('returns empty array for non-existent rule', async () => {
    const result = await getRulesToBenchmark(['non-existent-rule-xyz-123'])
    expect(result).toHaveLength(0)
  })

  test('returns entries as [string, RuleDefinition] tuples', async () => {
    const result = await getRulesToBenchmark(undefined)
    for (const [ruleId, ruleDef] of result) {
      expect(typeof ruleId).toBe('string')
      expect(ruleDef).toHaveProperty('create')
      expect(ruleDef).toHaveProperty('meta')
      expect(ruleDef).toHaveProperty('defaultOptions')
    }
  })

  test('returns multiple matching rules when multiple requested', async () => {
    const allRules = await getRulesToBenchmark(undefined)
    if (allRules.length >= 2) {
      const ruleId1 = allRules[0]![0]
      const ruleId2 = allRules[1]![0]
      const result = await getRulesToBenchmark([ruleId1, ruleId2])
      expect(result).toHaveLength(2)
      const resultIds = result.map(([id]) => id)
      expect(resultIds).toContain(ruleId1)
      expect(resultIds).toContain(ruleId2)
    }
  })

  test('handles single rule request', async () => {
    const allRules = await getRulesToBenchmark(undefined)
    const firstRuleId = allRules[0]![0]
    const result = await getRulesToBenchmark([firstRuleId])
    expect(result).toHaveLength(1)
  })

  test('requested rules that exist are exact matches', async () => {
    const allRules = await getRulesToBenchmark(undefined)
    const firstRuleId = allRules[0]![0]
    const result = await getRulesToBenchmark([firstRuleId])
    expect(result[0]![0]).toBe(firstRuleId)
  })

  test('does not match partial rule names', async () => {
    const allRules = await getRulesToBenchmark(undefined)
    const firstRuleId = allRules[0]![0]
    // Use first half of the rule name as partial match
    const partial = firstRuleId.slice(0, Math.max(1, Math.floor(firstRuleId.length / 2)))
    const result = await getRulesToBenchmark([partial])
    // Should not match unless the partial happens to be a full rule name
    const matchCount = result.filter(([id]) => id === partial).length
    // Only if partial is coincidentally a real rule name
    const isPartialARealRule = allRules.some(([id]) => id === partial)
    expect(matchCount).toBe(isPartialARealRule ? 1 : 0)
  })

  test('returns promise', () => {
    const promise = getRulesToBenchmark(undefined)
    expect(promise).toBeInstanceOf(Promise)
  })

  test('results are sorted by insertion order of loadAllRules', async () => {
    const result1 = await getRulesToBenchmark(undefined)
    const result2 = await getRulesToBenchmark(undefined)
    const ids1 = result1.map(([id]) => id)
    const ids2 = result2.map(([id]) => id)
    expect(ids1).toEqual(ids2)
  })

  test('all rules have valid RuleDefinition structure', async () => {
    const result = await getRulesToBenchmark(undefined)
    for (const [ruleId, ruleDef] of result) {
      expect(typeof ruleDef.create).toBe('function')
      expect(ruleDef.meta).toBeDefined()
      expect(ruleDef.meta.name).toBeDefined()
      expect(ruleDef.meta.description).toBeDefined()
    }
  })

  test('filtering with mix of existing and non-existing rules', async () => {
    const allRules = await getRulesToBenchmark(undefined)
    const firstRuleId = allRules[0]![0]
    const result = await getRulesToBenchmark([firstRuleId, 'does-not-exist'])
    expect(result).toHaveLength(1)
    expect(result[0]![0]).toBe(firstRuleId)
  })
})

// ============================================================================
// Integration: formatResultRow within formatResultsTable
// ============================================================================

describe('formatResultRow integration with formatResultsTable', () => {
  test('formatResultsTable uses formatResultRow for each result', () => {
    const result = makeBenchmarkResult({
      ruleId: 'integration-rule',
      avgTime: 42.5,
      minTime: 40.0,
      maxTime: 45.0,
      totalTime: 127.5,
    })
    const lines = formatResultsTable([result], 10)
    const resultLine = lines.find((l) => l.includes('integration-rule') && l.includes('42.500'))
    expect(resultLine).toBeDefined()

    const rawRow = resultLine!.replace(/\x1b\[[0-9;]*m/g, '')
    expect(rawRow).toBe(formatResultRow(result))
  })

  test('table rows maintain formatResultRow output structure', () => {
    const results = [
      makeBenchmarkResult({
        ruleId: 'rule-a',
        avgTime: 1.0,
        minTime: 0.5,
        maxTime: 1.5,
        totalTime: 3.0,
      }),
      makeBenchmarkResult({
        ruleId: 'rule-b',
        avgTime: 2.0,
        minTime: 1.0,
        maxTime: 3.0,
        totalTime: 6.0,
      }),
    ]
    const lines = formatResultsTable(results, 10)

    for (const result of results) {
      const resultLine = lines.find(
        (l) => l.includes(result.ruleId) && l.includes(result.avgTime.toFixed(3)),
      )
      expect(resultLine).toBeDefined()
      const rawLine = resultLine!.replace(/\x1b\[[0-9;]*m/g, '')
      expect(rawLine).toBe(formatResultRow(result))
    }
  })
})

// ============================================================================
// Edge Cases: Combined Functions
// ============================================================================

describe('edge cases', () => {
  test('formatResultRow with NaN avgTime', () => {
    const result = makeBenchmarkResult({ avgTime: NaN })
    const row = formatResultRow(result)
    expect(row).toContain('NaN')
  })

  test('formatResultRow with Infinity avgTime', () => {
    const result = makeBenchmarkResult({ avgTime: Infinity })
    const row = formatResultRow(result)
    expect(row).toContain('Infinity')
  })

  test('formatSummary with single element correctly identifies slowest and fastest', () => {
    const result = makeBenchmarkResult({ ruleId: 'sole-rule', avgTime: 77.777 })
    const lines = formatSummary([result])
    const joined = lines.join('\n')
    expect(joined).toContain('Slowest rule: sole-rule (77.777ms avg)')
    expect(joined).toContain('Fastest rule: sole-rule (77.777ms avg)')
  })

  test('printResults with large topCount and small array', () => {
    const results = [makeBenchmarkResult()]
    const lines = printResults(results, 999999)
    const joined = lines.join('\n')
    expect(joined).toContain('test-rule')
  })

  test('formatResultsTable with all very slow results', () => {
    const results = Array.from({ length: 5 }, (_, i) =>
      makeBenchmarkResult({
        avgTime: 200.0,
        maxTime: 200.0,
        minTime: 200.0,
        totalTime: 200.0,
        ruleId: `vslow-${i}`,
      }),
    )
    const lines = formatResultsTable(results, 10)
    const resultLines = lines.filter((l) => l.includes('vslow-') && l.includes('200.000'))
    for (const line of resultLines) {
      expect(line.includes('\x1b')).toBe(true)
    }
  })

  test('formatResultsTable with all fast results', () => {
    const results = Array.from({ length: 5 }, (_, i) =>
      makeBenchmarkResult({ avgTime: 1.0, ruleId: `fast-${i}` }),
    )
    const lines = formatResultsTable(results, 10)
    const resultLines = lines.slice(4)
    for (const line of resultLines) {
      expect(line.includes('\x1b')).toBe(false)
    }
  })

  test('formatResultsTable with mix of speeds', () => {
    const results = [
      makeBenchmarkResult({
        avgTime: 200.0,
        maxTime: 200.0,
        minTime: 200.0,
        totalTime: 200.0,
        ruleId: 'red-rule',
      }),
      makeBenchmarkResult({
        avgTime: 75.0,
        maxTime: 75.0,
        minTime: 75.0,
        totalTime: 75.0,
        ruleId: 'yellow-rule',
      }),
      makeBenchmarkResult({
        avgTime: 10.0,
        maxTime: 10.0,
        minTime: 10.0,
        totalTime: 10.0,
        ruleId: 'plain-rule',
      }),
    ]
    const lines = formatResultsTable(results, 10)

    const redLine = lines.find((l) => l.includes('red-rule') && l.includes('200.000'))
    const yellowLine = lines.find((l) => l.includes('yellow-rule') && l.includes('75.000'))
    const noneLine = lines.find((l) => l.includes('plain-rule') && l.includes('10.000'))

    expect(redLine!.includes('\x1b')).toBe(true)
    expect(yellowLine!.includes('\x1b')).toBe(true)
    expect(noneLine!.includes('\x1b')).toBe(false)
  })

  test('writeResults then read back matches original', async () => {
    const tempDir = join(tmpdir(), `bench-verify-${Date.now()}`)
    await mkdir(tempDir, { recursive: true })

    try {
      const original = [
        makeBenchmarkResult({
          ruleId: 'a',
          avgTime: 1.111,
          minTime: 0.5,
          maxTime: 2.0,
          totalTime: 3.333,
          runCount: 3,
        }),
        makeBenchmarkResult({
          ruleId: 'b',
          avgTime: 4.444,
          minTime: 3.0,
          maxTime: 6.0,
          totalTime: 13.332,
          runCount: 3,
        }),
      ]
      const outputPath = join(tempDir, 'verify.json')
      await writeResults(original, outputPath)

      const content = await import('node:fs/promises').then((fs) =>
        fs.readFile(outputPath, 'utf-8'),
      )
      const parsed = JSON.parse(content)
      expect(parsed).toEqual(original)
    } finally {
      await rm(tempDir, { recursive: true, force: true })
    }
  })

  test('formatResultRow produces consistent width for different ruleId lengths', () => {
    const short = formatResultRow(makeBenchmarkResult({ ruleId: 'a' }))
    const long = formatResultRow(makeBenchmarkResult({ ruleId: 'a'.repeat(30) }))
    // Both should have the same total width since ruleId is padded to 40
    // The numeric parts after the first 40 chars should be the same length
    expect(short.slice(40)).toBe(long.slice(40))
  })

  test('formatSummary handles total time with high precision', () => {
    const results = [
      makeBenchmarkResult({ totalTime: 0.1 }),
      makeBenchmarkResult({ totalTime: 0.2 }),
    ]
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('0.30ms')
  })

  test('formatResultsTable with negative topCount shows no results', () => {
    const results = [makeBenchmarkResult({ ruleId: 'test' })]
    const lines = formatResultsTable(results, -1)
    const joined = lines.join('\n')
    // slice(0, -1) returns empty array, so no results shown
    expect(joined).not.toContain('test')
  })

  test('printResults output can be joined with newlines', () => {
    const results = [makeBenchmarkResult()]
    const lines = printResults(results, 10)
    const joined = lines.join('\n')
    expect(typeof joined).toBe('string')
    expect(joined.length).toBeGreaterThan(0)
  })
})

// ============================================================================
// Color Threshold Verification
// ============================================================================

describe('color thresholds', () => {
  test('avgTime of 49.999 is not colored', () => {
    const result = makeBenchmarkResult({ avgTime: 49.999, ruleId: 'just-under' })
    const lines = formatResultsTable([result], 10)
    const line = lines.find((l) => l.includes('just-under'))
    expect(line!.includes('\x1b')).toBe(false)
  })

  test('avgTime of 50.001 is yellow', () => {
    const result = makeBenchmarkResult({
      avgTime: 50.001,
      maxTime: 50.001,
      minTime: 50.001,
      totalTime: 50.001,
      ruleId: 'just-over-slow',
    })
    const lines = formatResultsTable([result], 10)
    const line = lines.find((l) => l.includes('just-over-slow') && l.includes('50.001'))
    expect(line).toBeDefined()
    expect(line!.includes('\x1b')).toBe(true)
    const yellowVersion = chalk.yellow(formatResultRow(result))
    expect(line).toBe(yellowVersion)
  })

  test('avgTime of 99.999 is yellow', () => {
    const result = makeBenchmarkResult({
      avgTime: 99.999,
      maxTime: 99.999,
      minTime: 99.999,
      totalTime: 99.999,
      ruleId: 'just-under-vslow',
    })
    const lines = formatResultsTable([result], 10)
    const line = lines.find((l) => l.includes('just-under-vslow') && l.includes('99.999'))
    expect(line).toBeDefined()
    expect(line!.includes('\x1b')).toBe(true)
    const yellowVersion = chalk.yellow(formatResultRow(result))
    expect(line).toBe(yellowVersion)
  })

  test('avgTime of 100.001 is red', () => {
    const result = makeBenchmarkResult({
      avgTime: 100.001,
      maxTime: 100.001,
      minTime: 100.001,
      totalTime: 100.001,
      ruleId: 'just-over-vslow',
    })
    const lines = formatResultsTable([result], 10)
    const line = lines.find((l) => l.includes('just-over-vslow') && l.includes('100.001'))
    expect(line).toBeDefined()
    expect(line!.includes('\x1b')).toBe(true)
    const redVersion = chalk.red(formatResultRow(result))
    expect(line).toBe(redVersion)
  })

  test('avgTime of 1.0 is not colored', () => {
    const result = makeBenchmarkResult({ avgTime: 1.0, ruleId: 'fast' })
    const lines = formatResultsTable([result], 10)
    const line = lines.find((l) => l.includes('fast'))
    expect(line!.includes('\x1b')).toBe(false)
  })

  test('avgTime of 25.0 is not colored', () => {
    const result = makeBenchmarkResult({ avgTime: 25.0, ruleId: 'medium' })
    const lines = formatResultsTable([result], 10)
    const line = lines.find((l) => l.includes('medium'))
    expect(line!.includes('\x1b')).toBe(false)
  })

  test('avgTime of 75.0 is yellow', () => {
    const result = makeBenchmarkResult({
      avgTime: 75.0,
      maxTime: 75.0,
      minTime: 75.0,
      totalTime: 75.0,
      ruleId: 'slow-ish',
    })
    const lines = formatResultsTable([result], 10)
    const line = lines.find((l) => l.includes('slow-ish') && l.includes('75.000'))
    expect(line).toBeDefined()
    const yellowVersion = chalk.yellow(formatResultRow(result))
    expect(line).toBe(yellowVersion)
  })

  test('avgTime of 500.0 is red', () => {
    const result = makeBenchmarkResult({
      avgTime: 500.0,
      maxTime: 500.0,
      minTime: 500.0,
      totalTime: 500.0,
      ruleId: 'super-slow',
    })
    const lines = formatResultsTable([result], 10)
    const line = lines.find((l) => l.includes('super-slow') && l.includes('500.000'))
    expect(line).toBeDefined()
    const redVersion = chalk.red(formatResultRow(result))
    expect(line).toBe(redVersion)
  })
})

// ============================================================================
// Formatting Precision
// ============================================================================

describe('formatting precision', () => {
  test('avgTime toFixed(3) rounds correctly', () => {
    const result = makeBenchmarkResult({ avgTime: 1.2344 })
    const row = formatResultRow(result)
    expect(row).toContain('1.234')
  })

  test('avgTime toFixed(3) rounds up correctly', () => {
    const result = makeBenchmarkResult({ avgTime: 1.2346 })
    const row = formatResultRow(result)
    expect(row).toContain('1.235')
  })

  test('totalTime toFixed(2) rounds correctly', () => {
    const result = makeBenchmarkResult({ totalTime: 1.234 })
    const row = formatResultRow(result)
    expect(row).toContain('1.23')
  })

  test('totalTime toFixed(2) rounds up correctly', () => {
    const result = makeBenchmarkResult({ totalTime: 1.235 })
    const row = formatResultRow(result)
    expect(row).toContain('1.24')
  })

  test('minTime toFixed(3) for very small values', () => {
    const result = makeBenchmarkResult({ minTime: 0.0001 })
    const row = formatResultRow(result)
    expect(row).toContain('0.000')
  })

  test('maxTime toFixed(3) for integer values', () => {
    const result = makeBenchmarkResult({ maxTime: 5 })
    const row = formatResultRow(result)
    expect(row).toContain('5.000')
  })

  test('summary avgTime uses 3 decimal precision', () => {
    const results = [
      makeBenchmarkResult({ ruleId: 'a', avgTime: 1.1111 }),
      makeBenchmarkResult({ ruleId: 'b', avgTime: 2.2222 }),
    ]
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('1.111ms avg')
    expect(joined).toContain('2.222ms avg')
  })

  test('summary totalTime uses 2 decimal precision', () => {
    const results = [makeBenchmarkResult({ totalTime: 99.999 })]
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('100.00ms')
  })

  test('formatResultRow handles whole number times', () => {
    const result = makeBenchmarkResult({
      avgTime: 10,
      minTime: 5,
      maxTime: 15,
      totalTime: 30,
    })
    const row = formatResultRow(result)
    expect(row).toContain('10.000')
    expect(row).toContain('5.000')
    expect(row).toContain('15.000')
    expect(row).toContain('30.00')
  })
})

// ============================================================================
// Additional formatResultRow Tests
// ============================================================================

describe('formatResultRow additional', () => {
  test('handles avgTime with exactly 3 decimal places', () => {
    const result = makeBenchmarkResult({ avgTime: 1.123 })
    const row = formatResultRow(result)
    expect(row).toContain('1.123')
  })

  test('handles avgTime with more than 3 decimal places truncated', () => {
    const result = makeBenchmarkResult({ avgTime: 1.1239 })
    const row = formatResultRow(result)
    expect(row).toContain('1.124')
  })

  test('handles negative minTime', () => {
    const result = makeBenchmarkResult({ minTime: -1.0 })
    const row = formatResultRow(result)
    expect(row).toContain('-1.000')
  })

  test('handles negative maxTime', () => {
    const result = makeBenchmarkResult({ maxTime: -0.5 })
    const row = formatResultRow(result)
    expect(row).toContain('-0.500')
  })

  test('handles ruleId with special regex characters', () => {
    const result = makeBenchmarkResult({ ruleId: 'rule[0-9]+' })
    const row = formatResultRow(result)
    expect(row).toContain('rule[0-9]+')
  })

  test('handles ruleId with dots', () => {
    const result = makeBenchmarkResult({ ruleId: 'my.rule.name' })
    const row = formatResultRow(result)
    expect(row).toContain('my.rule.name')
  })

  test('handles very small totalTime', () => {
    const result = makeBenchmarkResult({ totalTime: 0.001 })
    const row = formatResultRow(result)
    expect(row).toContain('0.00')
  })

  test('handles avgTime of 0.001', () => {
    const result = makeBenchmarkResult({ avgTime: 0.001 })
    const row = formatResultRow(result)
    expect(row).toContain('0.001')
  })

  test('output contains all four metric columns', () => {
    const result = makeBenchmarkResult({ avgTime: 1.1, minTime: 2.2, maxTime: 3.3, totalTime: 4.4 })
    const row = formatResultRow(result)
    expect(row).toContain('1.100')
    expect(row).toContain('2.200')
    expect(row).toContain('3.300')
    expect(row).toContain('4.40')
  })

  test('metric fields are padded with spaces', () => {
    const result = makeBenchmarkResult({ avgTime: 1, minTime: 1, maxTime: 1, totalTime: 1 })
    const row = formatResultRow(result)
    expect(row).toContain('       1.000')
    expect(row).toContain('         1.00')
  })
})

// ============================================================================
// Additional formatResultsTable Tests
// ============================================================================

describe('formatResultsTable additional', () => {
  test('header line contains all column names', () => {
    const lines = formatResultsTable([makeBenchmarkResult()], 10)
    const headerLine = lines.find((l) => l.includes('Rule ID'))
    expect(headerLine).toBeDefined()
    expect(headerLine!.includes('\x1b')).toBe(true)
  })

  test('empty line separates header from columns', () => {
    const lines = formatResultsTable([makeBenchmarkResult()], 10)
    expect(lines[1]).toBe('')
  })

  test('results with same avgTime appear in order', () => {
    const results = [
      makeBenchmarkResult({ ruleId: 'first', avgTime: 50.0 }),
      makeBenchmarkResult({ ruleId: 'second', avgTime: 50.0 }),
    ]
    const lines = formatResultsTable(results, 10)
    const joined = lines.join('\n')
    expect(joined.indexOf('first')).toBeLessThan(joined.indexOf('second'))
  })

  test('topCount larger than results shows all without error', () => {
    const results = [makeBenchmarkResult({ ruleId: 'a' })]
    const lines = formatResultsTable(results, 1000)
    const joined = lines.join('\n')
    expect(joined).toContain('a')
  })

  test('header has gray color', () => {
    const lines = formatResultsTable([makeBenchmarkResult()], 10)
    const headerLine = lines[2]
    expect(headerLine.includes('\x1b')).toBe(true)
  })

  test('separator has gray color', () => {
    const lines = formatResultsTable([makeBenchmarkResult()], 10)
    const separatorLine = lines[3]
    expect(separatorLine.includes('\x1b')).toBe(true)
  })

  test('handles result at exact slow threshold boundary', () => {
    const result = makeBenchmarkResult({
      avgTime: 50.0000001,
      maxTime: 50,
      minTime: 50,
      totalTime: 50,
      ruleId: 'boundary-test',
    })
    const lines = formatResultsTable([result], 10)
    const ruleLine = lines.find((l) => l.includes('boundary-test'))
    expect(ruleLine!.includes('\x1b')).toBe(true)
  })

  test('handles result just below slow threshold', () => {
    const result = makeBenchmarkResult({
      avgTime: 49.9999999,
      maxTime: 50,
      minTime: 50,
      totalTime: 50,
      ruleId: 'just-below',
    })
    const lines = formatResultsTable([result], 10)
    const ruleLine = lines.find((l) => l.includes('just-below'))
    expect(ruleLine!.includes('\x1b')).toBe(false)
  })
})

// ============================================================================
// Additional formatSummary Tests
// ============================================================================

describe('formatSummary additional', () => {
  test('first line is always empty string', () => {
    expect(formatSummary([makeBenchmarkResult()])[0]).toBe('')
    expect(formatSummary([])[0]).toBe('')
    expect(formatSummary([makeBenchmarkResult(), makeBenchmarkResult()])[0]).toBe('')
  })

  test('contains "Total rules benchmarked" with count', () => {
    const results = Array.from({ length: 7 }, () => makeBenchmarkResult())
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toMatch(/Total rules benchmarked: 7/)
  })

  test('handles results with very large totalTime', () => {
    const results = [makeBenchmarkResult({ totalTime: 999999.99 })]
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('999999.99ms')
  })

  test('slowest rule is first element', () => {
    const results = [
      makeBenchmarkResult({ ruleId: 'z-slowest', avgTime: 999 }),
      makeBenchmarkResult({ ruleId: 'a-fastest', avgTime: 0.001 }),
    ]
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('Slowest rule: z-slowest')
  })

  test('fastest rule is last element', () => {
    const results = [
      makeBenchmarkResult({ ruleId: 'z-slowest', avgTime: 999 }),
      makeBenchmarkResult({ ruleId: 'a-fastest', avgTime: 0.001 }),
    ]
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('Fastest rule: a-fastest')
  })

  test('total time is sum of all result totalTimes', () => {
    const results = [
      makeBenchmarkResult({ totalTime: 10.1 }),
      makeBenchmarkResult({ totalTime: 20.2 }),
      makeBenchmarkResult({ totalTime: 30.3 }),
    ]
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('60.60ms')
  })
})

// ============================================================================
// Additional printResults Tests
// ============================================================================

describe('printResults additional', () => {
  test('contains both table and summary markers', () => {
    const results = [makeBenchmarkResult()]
    const lines = printResults(results, 10)
    const joined = lines.join('\n')
    expect(joined).toContain('Results (sorted by average time)')
    expect(joined).toContain('Summary:')
  })

  test('empty results show both table header and zero summary', () => {
    const lines = printResults([], 10)
    const joined = lines.join('\n')
    expect(joined).toContain('Results (sorted by average time)')
    expect(joined).toContain('Total rules benchmarked: 0')
  })

  test('output lines count matches table + summary', () => {
    const results = [makeBenchmarkResult()]
    const tableLines = formatResultsTable(results, 10)
    const summaryLines = formatSummary(results)
    const printLines = printResults(results, 10)
    expect(printLines.length).toBe(tableLines.length + summaryLines.length)
  })

  test('handles topCount 0 correctly', () => {
    const results = [makeBenchmarkResult({ ruleId: 'hidden' })]
    const lines = printResults(results, 0)
    const tableLines = formatResultsTable(results, 0)
    const tableJoined = tableLines.join('\n')
    expect(tableJoined).not.toContain('hidden')
    expect(lines.join('\n')).toContain('Summary:')
  })

  test('shows correct total count regardless of topCount', () => {
    const results = Array.from({ length: 10 }, (_, i) =>
      makeBenchmarkResult({ ruleId: `rule-${i}` }),
    )
    const lines = printResults(results, 3)
    const joined = lines.join('\n')
    expect(joined).toContain('Total rules benchmarked: 10')
  })
})

// ============================================================================
// Additional writeResults Tests
// ============================================================================

describe('writeResults additional', () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = join(
      tmpdir(),
      `bench-additional-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    )
    await mkdir(tempDir, { recursive: true })
  })

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true })
  })

  test('JSON output has correct structure for each result', async () => {
    const results = [
      makeBenchmarkResult({
        avgTime: 1.23,
        maxTime: 2.34,
        minTime: 0.12,
        ruleId: 'struct-test',
        runCount: 5,
        totalTime: 6.15,
      }),
    ]
    const outputPath = join(tempDir, 'struct.json')
    await writeResults(results, outputPath)

    const content = await import('node:fs/promises').then((fs) => fs.readFile(outputPath, 'utf-8'))
    const parsed = JSON.parse(content)
    const entry = parsed[0]
    expect(Object.keys(entry).sort()).toEqual(
      ['avgTime', 'maxTime', 'minTime', 'ruleId', 'runCount', 'totalTime'].sort(),
    )
  })

  test('can write to file multiple times', async () => {
    const outputPath = join(tempDir, 'multi-write.json')
    await writeResults([makeBenchmarkResult({ ruleId: 'first' })], outputPath)
    await writeResults([makeBenchmarkResult({ ruleId: 'second' })], outputPath)

    const content = await import('node:fs/promises').then((fs) => fs.readFile(outputPath, 'utf-8'))
    const parsed = JSON.parse(content)
    expect(parsed[0].ruleId).toBe('second')
  })

  test('handles results with runCount of 1', async () => {
    const results = [makeBenchmarkResult({ runCount: 1 })]
    const outputPath = join(tempDir, 'single-run.json')
    await writeResults(results, outputPath)

    const content = await import('node:fs/promises').then((fs) => fs.readFile(outputPath, 'utf-8'))
    const parsed = JSON.parse(content)
    expect(parsed[0].runCount).toBe(1)
  })

  test('handles results with large runCount', async () => {
    const results = [makeBenchmarkResult({ runCount: 1000000 })]
    const outputPath = join(tempDir, 'large-run.json')
    await writeResults(results, outputPath)

    const content = await import('node:fs/promises').then((fs) => fs.readFile(outputPath, 'utf-8'))
    const parsed = JSON.parse(content)
    expect(parsed[0].runCount).toBe(1000000)
  })

  test('handles results with negative times', async () => {
    const results = [
      makeBenchmarkResult({ avgTime: -1.5, maxTime: -0.5, minTime: -2.5, totalTime: -4.5 }),
    ]
    const outputPath = join(tempDir, 'negative.json')
    await writeResults(results, outputPath)

    const content = await import('node:fs/promises').then((fs) => fs.readFile(outputPath, 'utf-8'))
    const parsed = JSON.parse(content)
    expect(parsed[0].avgTime).toBe(-1.5)
    expect(parsed[0].minTime).toBe(-2.5)
  })
})

// ============================================================================
// Additional Edge Cases
// ============================================================================

describe('additional edge cases', () => {
  test('formatResultRow with NaN totalTime', () => {
    const result = makeBenchmarkResult({ totalTime: NaN })
    const row = formatResultRow(result)
    expect(row).toContain('NaN')
  })

  test('formatResultRow with Infinity minTime', () => {
    const result = makeBenchmarkResult({ minTime: Infinity })
    const row = formatResultRow(result)
    expect(row).toContain('Infinity')
  })

  test('formatResultRow with -Infinity maxTime', () => {
    const result = makeBenchmarkResult({ maxTime: -Infinity })
    const row = formatResultRow(result)
    expect(row).toContain('-Infinity')
  })

  test('formatResultsTable with NaN avgTime does not get colored', () => {
    const result = makeBenchmarkResult({ avgTime: NaN, ruleId: 'nan-rule' })
    const lines = formatResultsTable([result], 10)
    const ruleLine = lines.find((l) => l.includes('nan-rule'))
    expect(ruleLine).toBeDefined()
    expect(ruleLine!.includes('\x1b')).toBe(false)
  })

  test('formatSummary with NaN totalTime', () => {
    const results = [makeBenchmarkResult({ totalTime: NaN })]
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('NaN')
  })

  test('formatResultRow with very long ruleId overflows column', () => {
    const ruleId = 'x'.repeat(100)
    const result = makeBenchmarkResult({ ruleId })
    const row = formatResultRow(result)
    expect(row.slice(0, 100)).toContain(ruleId)
  })

  test('formatResultsTable returns at least 4 lines for header', () => {
    const lines = formatResultsTable([], 10)
    expect(lines.length).toBeGreaterThanOrEqual(4)
  })

  test('formatSummary returns at least 3 lines', () => {
    const lines = formatSummary([makeBenchmarkResult()])
    expect(lines.length).toBeGreaterThanOrEqual(3)
  })

  test('printResults always has more lines than either sub-function', () => {
    const results = [makeBenchmarkResult()]
    const printLines = printResults(results, 10)
    const tableLines = formatResultsTable(results, 10)
    const summaryLines = formatSummary(results)
    expect(printLines.length).toBeGreaterThan(tableLines.length)
    expect(printLines.length).toBeGreaterThan(summaryLines.length)
  })

  test('formatResultRow output is deterministic', () => {
    const result = makeBenchmarkResult({
      avgTime: 5.5,
      minTime: 3.3,
      maxTime: 7.7,
      totalTime: 16.5,
      ruleId: 'deterministic',
    })
    const row1 = formatResultRow(result)
    const row2 = formatResultRow(result)
    expect(row1).toBe(row2)
  })

  test('formatResultsTable with same-ruleId results shows both', () => {
    const results = [
      makeBenchmarkResult({ ruleId: 'dup-rule', avgTime: 10.0 }),
      makeBenchmarkResult({ ruleId: 'dup-rule', avgTime: 20.0 }),
    ]
    const lines = formatResultsTable(results, 10)
    const joined = lines.join('\n')
    const count = (joined.match(/dup-rule/g) || []).length
    expect(count).toBeGreaterThanOrEqual(2)
  })

  test('formatSummary with identical results shows same slowest and fastest', () => {
    const results = [
      makeBenchmarkResult({ ruleId: 'same-a', avgTime: 5.0 }),
      makeBenchmarkResult({ ruleId: 'same-b', avgTime: 5.0 }),
    ]
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('Slowest rule: same-a')
    expect(joined).toContain('Fastest rule: same-b')
  })
})
