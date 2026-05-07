import { describe, test, expect, vi, beforeEach } from 'vitest'

import { BenchmarkRunner } from '../../../src/core/benchmark-runner'
import { DEFAULT_BENCHMARK_CONFIG } from '../../../src/core/benchmark-types'
import type { BenchmarkConfig, RuleBenchmarkResult, BenchmarkSuite } from '../../../src/core/benchmark-types'

describe('BenchmarkRunner', () => {
  describe('constructor and getConfig', () => {
    test('uses default config when no config provided', () => {
      const runner = new BenchmarkRunner()
      const config = runner.getConfig()
      expect(config.iterations).toBe(DEFAULT_BENCHMARK_CONFIG.iterations)
      expect(config.warmupIterations).toBe(DEFAULT_BENCHMARK_CONFIG.warmupIterations)
      expect(config.filePath).toBe(DEFAULT_BENCHMARK_CONFIG.filePath)
      expect(config.sampleCode).toBe(DEFAULT_BENCHMARK_CONFIG.sampleCode)
    })

    test('merges partial config with defaults', () => {
      const runner = new BenchmarkRunner({ iterations: 50 })
      const config = runner.getConfig()
      expect(config.iterations).toBe(50)
      expect(config.warmupIterations).toBe(DEFAULT_BENCHMARK_CONFIG.warmupIterations)
    })

    test('overrides all defaults with custom config', () => {
      const custom: BenchmarkConfig = {
        filePath: 'custom.ts',
        iterations: 100,
        rules: ['no-eval'],
        sampleCode: 'const x = 1',
        warmupIterations: 5,
      }
      const runner = new BenchmarkRunner(custom)
      const config = runner.getConfig()
      expect(config).toEqual(custom)
    })

    test('getConfig returns a copy', () => {
      const runner = new BenchmarkRunner()
      const config1 = runner.getConfig()
      config1.iterations = 999
      const config2 = runner.getConfig()
      expect(config2.iterations).not.toBe(999)
    })
  })

  describe('runRule', () => {
    test('returns result with error markers for unknown rule', async () => {
      const runner = new BenchmarkRunner({ rules: ['nonexistent-rule-xyz'] })
      const result = await runner.runRule('nonexistent-rule-xyz')
      expect(result.ruleId).toBe('nonexistent-rule-xyz')
      expect(result.totalMs).toBe(-1)
      expect(result.averageMs).toBe(-1)
      expect(result.minMs).toBe(-1)
      expect(result.maxMs).toBe(-1)
      expect(result.medianMs).toBe(-1)
      expect(result.p95Ms).toBe(-1)
      expect(result.p99Ms).toBe(-1)
      expect(result.violationsPerRun).toBe(0)
    })

    test('returns result with correct iterations count for unknown rule', async () => {
      const runner = new BenchmarkRunner({ iterations: 7 })
      const result = await runner.runRule('nonexistent-rule')
      expect(result.iterations).toBe(7)
    })

    test('returns valid result structure for existing rule', async () => {
      const runner = new BenchmarkRunner({
        iterations: 3,
        warmupIterations: 1,
        rules: ['max-params'],
      })
      const result = await runner.runRule('max-params')
      expect(result.ruleId).toBe('max-params')
      expect(result.iterations).toBe(3)
      expect(typeof result.totalMs).toBe('number')
      expect(typeof result.averageMs).toBe('number')
      expect(typeof result.medianMs).toBe('number')
      expect(typeof result.minMs).toBe('number')
      expect(typeof result.maxMs).toBe('number')
      expect(typeof result.p95Ms).toBe('number')
      expect(typeof result.p99Ms).toBe('number')
      expect(typeof result.memoryUsageKB).toBe('number')
      expect(typeof result.violationsPerRun).toBe('number')
    })

    test('averageMs is non-negative for valid rules', async () => {
      const runner = new BenchmarkRunner({
        iterations: 3,
        warmupIterations: 1,
        rules: ['max-params'],
      })
      const result = await runner.runRule('max-params')
      expect(result.averageMs).toBeGreaterThanOrEqual(0)
    })

    test('minMs <= medianMs <= maxMs', async () => {
      const runner = new BenchmarkRunner({
        iterations: 10,
        warmupIterations: 2,
        rules: ['max-params'],
      })
      const result = await runner.runRule('max-params')
      expect(result.minMs).toBeLessThanOrEqual(result.medianMs)
      expect(result.medianMs).toBeLessThanOrEqual(result.maxMs)
    })

    test('totalMs equals sum of individual timings', async () => {
      const runner = new BenchmarkRunner({
        iterations: 5,
        warmupIterations: 1,
        rules: ['max-params'],
      })
      const result = await runner.runRule('max-params')
      expect(result.totalMs).toBeGreaterThanOrEqual(0)
      expect(result.averageMs).toBeCloseTo(result.totalMs / result.iterations, 10)
    })

    test('p95Ms is between min and max', async () => {
      const runner = new BenchmarkRunner({
        iterations: 20,
        warmupIterations: 2,
        rules: ['max-params'],
      })
      const result = await runner.runRule('max-params')
      expect(result.p95Ms).toBeGreaterThanOrEqual(result.minMs)
      expect(result.p95Ms).toBeLessThanOrEqual(result.maxMs)
    })

    test('p99Ms is between min and max', async () => {
      const runner = new BenchmarkRunner({
        iterations: 20,
        warmupIterations: 2,
        rules: ['max-params'],
      })
      const result = await runner.runRule('max-params')
      expect(result.p99Ms).toBeGreaterThanOrEqual(result.minMs)
      expect(result.p99Ms).toBeLessThanOrEqual(result.maxMs)
    })

    test('iterations match config', async () => {
      const runner = new BenchmarkRunner({
        iterations: 7,
        warmupIterations: 1,
        rules: ['max-params'],
      })
      const result = await runner.runRule('max-params')
      expect(result.iterations).toBe(7)
    })

    test('memoryUsageKB is non-negative', async () => {
      const runner = new BenchmarkRunner({
        iterations: 3,
        warmupIterations: 1,
        rules: ['max-params'],
      })
      const result = await runner.runRule('max-params')
      expect(result.memoryUsageKB).toBeGreaterThanOrEqual(0)
    })

    test('handles rule that fails to load gracefully', async () => {
      const runner = new BenchmarkRunner({ rules: ['will-fail'] })
      const result = await runner.runRule('will-fail')
      expect(result.totalMs).toBe(-1)
      expect(result.ruleId).toBe('will-fail')
    })
  })

  describe('runAll', () => {
    test('returns empty results for empty rules list', async () => {
      const runner = new BenchmarkRunner({ rules: [] })
      const suite = await runner.runAll()
      expect(suite.results).toEqual([])
      expect(suite.totalDurationMs).toBeGreaterThanOrEqual(0)
    })

    test('returns suite with results for valid rules', async () => {
      const runner = new BenchmarkRunner({
        iterations: 3,
        warmupIterations: 1,
        rules: ['max-params', 'max-depth'],
      })
      const suite = await runner.runAll()
      expect(suite.results.length).toBe(2)
      expect(suite.results[0]!.ruleId).toBe('max-params')
      expect(suite.results[1]!.ruleId).toBe('max-depth')
    })

    test('suite has ISO 8601 timestamp', async () => {
      const runner = new BenchmarkRunner({ rules: [] })
      const suite = await runner.runAll()
      expect(suite.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/)
      expect(new Date(suite.timestamp).getTime()).not.toBeNaN()
    })

    test('suite has nodeVersion', async () => {
      const runner = new BenchmarkRunner({ rules: [] })
      const suite = await runner.runAll()
      expect(suite.nodeVersion).toBe(process.version)
    })

    test('suite has platform', async () => {
      const runner = new BenchmarkRunner({ rules: [] })
      const suite = await runner.runAll()
      expect(suite.platform).toBe(process.platform)
    })

    test('suite contains config snapshot', async () => {
      const runner = new BenchmarkRunner({ iterations: 5, rules: ['no-eval'] })
      const suite = await runner.runAll()
      expect(suite.config.iterations).toBe(5)
      expect(suite.config.rules).toEqual(['no-eval'])
    })

    test('totalDurationMs is non-negative', async () => {
      const runner = new BenchmarkRunner({
        iterations: 2,
        warmupIterations: 1,
        rules: ['max-params'],
      })
      const suite = await runner.runAll()
      expect(suite.totalDurationMs).toBeGreaterThanOrEqual(0)
    })

    test('mixed valid and invalid rules', async () => {
      const runner = new BenchmarkRunner({
        iterations: 3,
        warmupIterations: 1,
        rules: ['max-params', 'nonexistent-rule', 'max-depth'],
      })
      const suite = await runner.runAll()
      expect(suite.results.length).toBe(3)
      expect(suite.results[0]!.ruleId).toBe('max-params')
      expect(suite.results[0]!.totalMs).toBeGreaterThanOrEqual(0)
      expect(suite.results[1]!.ruleId).toBe('nonexistent-rule')
      expect(suite.results[1]!.totalMs).toBe(-1)
      expect(suite.results[2]!.ruleId).toBe('max-depth')
      expect(suite.results[2]!.totalMs).toBeGreaterThanOrEqual(0)
    })

    test('warmup iterations do not affect result count', async () => {
      const runner = new BenchmarkRunner({
        iterations: 5,
        warmupIterations: 10,
        rules: ['max-params'],
      })
      const suite = await runner.runAll()
      expect(suite.results[0]!.iterations).toBe(5)
    })

    test('with custom sample code', async () => {
      const runner = new BenchmarkRunner({
        iterations: 3,
        warmupIterations: 1,
        rules: ['max-params'],
        sampleCode: 'function hello() { return 42; }',
      })
      const suite = await runner.runAll()
      expect(suite.config.sampleCode).toBe('function hello() { return 42; }')
      expect(suite.results[0]!.iterations).toBe(3)
    })
  })
})
