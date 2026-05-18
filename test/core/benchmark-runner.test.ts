import { describe, expect, it } from 'vitest'

import { BenchmarkRunner } from '../../src/core/benchmark-runner.js'

// ─── BenchmarkRunner ───

describe('BenchmarkRunner', () => {
  it('constructs with default config', () => {
    const runner = new BenchmarkRunner()
    const config = runner.getConfig()
    expect(config.iterations).toBe(10)
    expect(config.warmupIterations).toBe(3)
    expect(config.rules).toEqual([])
    expect(config.filePath).toBe('benchmark-sample.ts')
  })

  it('constructs with custom config', () => {
    const runner = new BenchmarkRunner({
      iterations: 5,
      warmupIterations: 1,
      rules: ['no-eval', 'max-params'],
      filePath: 'custom.ts',
      sampleCode: 'const x = 1',
    })
    const config = runner.getConfig()
    expect(config.iterations).toBe(5)
    expect(config.warmupIterations).toBe(1)
    expect(config.rules).toEqual(['no-eval', 'max-params'])
    expect(config.filePath).toBe('custom.ts')
    expect(config.sampleCode).toBe('const x = 1')
  })

  it('getConfig returns a copy', () => {
    const runner = new BenchmarkRunner({ rules: ['no-eval'] })
    const a = runner.getConfig()
    const b = runner.getConfig()
    expect(a).toEqual(b)
    expect(a).not.toBe(b)
  })

  it('runRule returns error result for unknown rule', async () => {
    const runner = new BenchmarkRunner({ rules: ['nonexistent-rule-xyz'] })
    const result = await runner.runRule('nonexistent-rule-xyz')
    expect(result.ruleId).toBe('nonexistent-rule-xyz')
    expect(result.averageMs).toBe(-1)
    expect(result.minMs).toBe(-1)
    expect(result.maxMs).toBe(-1)
    expect(result.medianMs).toBe(-1)
    expect(result.p95Ms).toBe(-1)
    expect(result.p99Ms).toBe(-1)
    expect(result.totalMs).toBe(-1)
    expect(result.violationsPerRun).toBe(0)
    expect(result.memoryUsageKB).toBe(0)
  })

  it('runAll returns suite with metadata', async () => {
    const runner = new BenchmarkRunner({ rules: ['nonexistent-rule-xyz'] })
    const suite = await runner.runAll()
    expect(suite.results).toHaveLength(1)
    expect(suite.nodeVersion).toBe(process.version)
    expect(suite.platform).toBe(process.platform)
    expect(suite.timestamp).toBeTruthy()
    expect(typeof suite.totalDurationMs).toBe('number')
    expect(suite.totalDurationMs).toBeGreaterThanOrEqual(0)
    expect(suite.config.rules).toEqual(['nonexistent-rule-xyz'])
  })

  it('runAll with empty rules returns empty results', async () => {
    const runner = new BenchmarkRunner({ rules: [] })
    const suite = await runner.runAll()
    expect(suite.results).toEqual([])
    expect(suite.totalDurationMs).toBeGreaterThanOrEqual(0)
  })

  it('default config is merged with partial overrides', () => {
    const runner = new BenchmarkRunner({ iterations: 20 })
    const config = runner.getConfig()
    expect(config.iterations).toBe(20)
    expect(config.warmupIterations).toBe(3)
    expect(config.filePath).toBe('benchmark-sample.ts')
  })
})
