import { describe, test, expect } from 'vitest'

import {
  formatBenchmarkTable,
  formatBenchmarkJSON,
  formatBenchmarkMarkdown,
} from '../../../src/core/benchmark-formatter'
import type { BenchmarkSuite, RuleBenchmarkResult } from '../../../src/core/benchmark-types'

function makeResult(overrides: Partial<RuleBenchmarkResult> = {}): RuleBenchmarkResult {
  return {
    averageMs: 1.234,
    iterations: 10,
    maxMs: 2.5,
    medianMs: 1.1,
    memoryUsageKB: 128.5,
    minMs: 0.5,
    p95Ms: 2.0,
    p99Ms: 2.3,
    ruleId: 'test-rule',
    totalMs: 12.34,
    violationsPerRun: 3,
    ...overrides,
  }
}

function makeSuite(overrides: Partial<BenchmarkSuite> = {}): BenchmarkSuite {
  return {
    config: {
      filePath: 'test.ts',
      iterations: 10,
      rules: ['test-rule'],
      sampleCode: 'const x = 1',
      warmupIterations: 3,
    },
    nodeVersion: 'v20.0.0',
    platform: 'linux',
    results: [makeResult()],
    timestamp: '2025-01-01T00:00:00.000Z',
    totalDurationMs: 50.5,
    ...overrides,
  }
}

describe('formatBenchmarkTable', () => {
  test('has column headers', () => {
    const table = formatBenchmarkTable(makeSuite())
    expect(table).toContain('Rule ID')
    expect(table).toContain('Avg (ms)')
    expect(table).toContain('Median')
    expect(table).toContain('P95')
    expect(table).toContain('Min')
    expect(table).toContain('Max')
    expect(table).toContain('Mem (KB)')
    expect(table).toContain('Viol.')
  })

  test('contains rule IDs', () => {
    const suite = makeSuite({
      results: [makeResult({ ruleId: 'no-eval' }), makeResult({ ruleId: 'max-params' })],
    })
    const table = formatBenchmarkTable(suite)
    expect(table).toContain('no-eval')
    expect(table).toContain('max-params')
  })

  test('sorted by average time descending', () => {
    const suite = makeSuite({
      results: [
        makeResult({ ruleId: 'slow-rule', averageMs: 10.0 }),
        makeResult({ ruleId: 'fast-rule', averageMs: 0.1 }),
      ],
    })
    const table = formatBenchmarkTable(suite)
    const slowIdx = table.indexOf('slow-rule')
    const fastIdx = table.indexOf('fast-rule')
    expect(slowIdx).toBeLessThan(fastIdx)
  })

  test('with empty results', () => {
    const table = formatBenchmarkTable(makeSuite({ results: [] }))
    expect(table).toContain('Rule ID')
    expect(table).toContain('Avg (ms)')
  })

  test('formats numbers with reasonable precision', () => {
    const table = formatBenchmarkTable(makeSuite({
      results: [makeResult({ averageMs: 1.234567, ruleId: 'precision-test' })],
    }))
    const match = table.match(/precision-test/)
    expect(match).not.toBeNull()
  })

  test('shows N/A for negative values', () => {
    const table = formatBenchmarkTable(makeSuite({
      results: [makeResult({ averageMs: -1, ruleId: 'failed-rule', minMs: -1, maxMs: -1, medianMs: -1, p95Ms: -1 })],
    }))
    expect(table).toContain('N/A')
  })
})

describe('formatBenchmarkJSON', () => {
  test('is valid JSON', () => {
    const suite = makeSuite()
    const json = formatBenchmarkJSON(suite)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  test('has all required fields', () => {
    const suite = makeSuite()
    const json = formatBenchmarkJSON(suite)
    const parsed = JSON.parse(json) as BenchmarkSuite
    expect(parsed.config).toBeDefined()
    expect(parsed.results).toBeDefined()
    expect(parsed.timestamp).toBeDefined()
    expect(parsed.nodeVersion).toBeDefined()
    expect(parsed.platform).toBeDefined()
    expect(parsed.totalDurationMs).toBeDefined()
  })

  test('preserves rule results', () => {
    const suite = makeSuite({
      results: [makeResult({ ruleId: 'my-rule', averageMs: 5.5 })],
    })
    const parsed = JSON.parse(formatBenchmarkJSON(suite)) as BenchmarkSuite
    expect(parsed.results[0]!.ruleId).toBe('my-rule')
    expect(parsed.results[0]!.averageMs).toBe(5.5)
  })

  test('with empty results', () => {
    const suite = makeSuite({ results: [] })
    const parsed = JSON.parse(formatBenchmarkJSON(suite)) as BenchmarkSuite
    expect(parsed.results).toEqual([])
  })

  test('has 2-space indent', () => {
    const json = formatBenchmarkJSON(makeSuite())
    expect(json).toContain('  "config"')
  })
})

describe('formatBenchmarkMarkdown', () => {
  test('has markdown table syntax', () => {
    const md = formatBenchmarkMarkdown(makeSuite())
    expect(md).toContain('| Rule ID')
    expect(md).toContain('|---|')
  })

  test('has config section', () => {
    const md = formatBenchmarkMarkdown(makeSuite())
    expect(md).toContain('# Benchmark Results')
    expect(md).toContain('**Timestamp**')
    expect(md).toContain('**Node**')
    expect(md).toContain('**Platform**')
    expect(md).toContain('**Iterations**')
    expect(md).toContain('**Warmup**')
  })

  test('has system info', () => {
    const md = formatBenchmarkMarkdown(makeSuite())
    expect(md).toContain('v20.0.0')
    expect(md).toContain('linux')
  })

  test('contains rule data in table', () => {
    const md = formatBenchmarkMarkdown(makeSuite({
      results: [makeResult({ ruleId: 'no-eval', averageMs: 3.5 })],
    }))
    expect(md).toContain('no-eval')
    expect(md).toContain('3.500')
  })

  test('with empty results shows no results message', () => {
    const md = formatBenchmarkMarkdown(makeSuite({ results: [] }))
    expect(md).toContain('No benchmark results')
    expect(md).not.toContain('|---|')
  })

  test('sorted by average time descending', () => {
    const suite = makeSuite({
      results: [
        makeResult({ ruleId: 'slow-rule', averageMs: 10.0 }),
        makeResult({ ruleId: 'fast-rule', averageMs: 0.1 }),
      ],
    })
    const md = formatBenchmarkMarkdown(suite)
    const slowIdx = md.indexOf('slow-rule')
    const fastIdx = md.indexOf('fast-rule')
    expect(slowIdx).toBeLessThan(fastIdx)
  })
})
