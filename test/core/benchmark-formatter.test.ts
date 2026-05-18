import { describe, expect, it } from 'vitest'

import {
  formatBenchmarkJSON,
  formatBenchmarkMarkdown,
  formatBenchmarkTable,
} from '../../src/core/benchmark-formatter.js'

import type { BenchmarkSuite } from '../../src/core/benchmark-types.js'

// ─── Helpers ───

function makeSuite(results: BenchmarkSuite['results'] = []): BenchmarkSuite {
  return {
    config: {
      filePath: 'test.ts',
      iterations: 10,
      rules: [],
      sampleCode: '',
      warmupIterations: 3,
    },
    nodeVersion: 'v20.0.0',
    platform: 'linux',
    results,
    timestamp: '2025-01-01T00:00:00.000Z',
    totalDurationMs: 100,
  }
}

function makeResult(overrides: Partial<BenchmarkSuite['results'][0]> = {}): BenchmarkSuite['results'][0] {
  return {
    averageMs: 5.123,
    iterations: 10,
    maxMs: 8.5,
    medianMs: 5.0,
    memoryUsageKB: 1024.5,
    minMs: 2.1,
    p95Ms: 7.8,
    p99Ms: 8.2,
    ruleId: 'test-rule',
    totalMs: 51.23,
    violationsPerRun: 3,
    ...overrides,
  }
}

// ─── formatBenchmarkTable ───

describe('formatBenchmarkTable', () => {
  it('formats empty results', () => {
    const suite = makeSuite()
    const output = formatBenchmarkTable(suite)
    expect(output).toContain('Rule ID')
    expect(output).toContain('Avg (ms)')
  })

  it('formats single result', () => {
    const suite = makeSuite([makeResult()])
    const output = formatBenchmarkTable(suite)
    expect(output).toContain('test-rule')
    expect(output).toContain('5.123')
  })

  it('formats multiple results sorted by averageMs desc', () => {
    const suite = makeSuite([
      makeResult({ ruleId: 'fast-rule', averageMs: 1.0 }),
      makeResult({ ruleId: 'slow-rule', averageMs: 10.0 }),
    ])
    const output = formatBenchmarkTable(suite)
    const slowPos = output.indexOf('slow-rule')
    const fastPos = output.indexOf('fast-rule')
    expect(slowPos).toBeLessThan(fastPos)
  })

  it('includes separator lines', () => {
    const suite = makeSuite()
    const output = formatBenchmarkTable(suite)
    const separators = output.split('\n').filter((l) => /^-+$/.test(l.trim()))
    expect(separators.length).toBeGreaterThanOrEqual(2)
  })

  it('handles negative values as N/A', () => {
    const suite = makeSuite([makeResult({ averageMs: -1, medianMs: -1, p95Ms: -1, minMs: -1, maxMs: -1, memoryUsageKB: -1 })])
    const output = formatBenchmarkTable(suite)
    expect(output).toContain('N/A')
  })
})

// ─── formatBenchmarkJSON ───

describe('formatBenchmarkJSON', () => {
  it('returns valid JSON', () => {
    const suite = makeSuite([makeResult()])
    const output = formatBenchmarkJSON(suite)
    const parsed = JSON.parse(output)
    expect(parsed.results.length).toBe(1)
  })

  it('includes all suite fields', () => {
    const suite = makeSuite()
    const output = formatBenchmarkJSON(suite)
    const parsed = JSON.parse(output)
    expect(parsed.config).toBeDefined()
    expect(parsed.timestamp).toBe('2025-01-01T00:00:00.000Z')
    expect(parsed.nodeVersion).toBe('v20.0.0')
    expect(parsed.platform).toBe('linux')
  })

  it('formats with 2-space indent', () => {
    const suite = makeSuite()
    const output = formatBenchmarkJSON(suite)
    expect(output).toContain('  ')
  })
})

// ─── formatBenchmarkMarkdown ───

describe('formatBenchmarkMarkdown', () => {
  it('formats with header', () => {
    const suite = makeSuite()
    const output = formatBenchmarkMarkdown(suite)
    expect(output).toContain('# Benchmark Results')
  })

  it('includes metadata', () => {
    const suite = makeSuite()
    const output = formatBenchmarkMarkdown(suite)
    expect(output).toContain('**Timestamp**')
    expect(output).toContain('**Node**')
    expect(output).toContain('**Platform**')
  })

  it('formats empty results', () => {
    const suite = makeSuite([])
    const output = formatBenchmarkMarkdown(suite)
    expect(output).toContain('No benchmark results')
  })

  it('formats table with results', () => {
    const suite = makeSuite([makeResult()])
    const output = formatBenchmarkMarkdown(suite)
    expect(output).toContain('| test-rule |')
    expect(output).toContain('|---|')
  })

  it('includes config info', () => {
    const suite = makeSuite()
    const output = formatBenchmarkMarkdown(suite)
    expect(output).toContain('**Iterations**: 10')
    expect(output).toContain('**Warmup**: 3')
  })
})
