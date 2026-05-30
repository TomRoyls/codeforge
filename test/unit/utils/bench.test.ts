import { describe, expect, it } from 'vitest'
import { bench, benchAsync, compareBenchmarks, formatResult, formatSuite } from '../../../src/utils/bench.js'

describe('bench', () => {
  it('returns benchmark result with correct shape', () => {
    const result = bench('test', () => {}, 1000)
    expect(result.name).toBe('test')
    expect(result.iterations).toBe(1000)
    expect(result.totalMs).toBeGreaterThanOrEqual(0)
    expect(result.opsPerSec).toBeGreaterThanOrEqual(0)
    expect(result.avgNs).toBeGreaterThanOrEqual(0)
  })

  it('uses default iterations when not specified', () => {
    const result = bench('default', () => {})
    expect(result.iterations).toBe(100000)
  })

  it('measures actual work', () => {
    const result = bench('work', () => {
      let sum = 0
      for (let i = 0; i < 100; i++) sum += i
    }, 1000)
    expect(result.totalMs).toBeGreaterThanOrEqual(0)
    expect(result.opsPerSec).toBeGreaterThanOrEqual(0)
  })

  it('returns different results for different functions', () => {
    const fast = bench('fast', () => {}, 1000)
    const slow = bench('slow', () => {
      let s = 0
      for (let i = 0; i < 10000; i++) s += i
    }, 1000)
    expect(slow.avgNs).toBeGreaterThan(fast.avgNs)
  })

  it('handles zero iterations gracefully', () => {
    const result = bench('zero', () => {}, 0)
    expect(result.iterations).toBe(0)
    expect(result.totalMs).toBeGreaterThanOrEqual(0)
  })
})

describe('benchAsync', () => {
  it('returns async benchmark result', async () => {
    const result = await benchAsync('async-test', async () => {}, 100)
    expect(result.name).toBe('async-test')
    expect(result.iterations).toBe(100)
    expect(result.totalMs).toBeGreaterThanOrEqual(0)
  })

  it('uses default iterations when not specified', async () => {
    const result = await benchAsync('default', async () => {})
    expect(result.iterations).toBe(10000)
  })

  it('measures async work', async () => {
    const result = await benchAsync('async-work', async () => {
      await new Promise((r) => setTimeout(r, 0))
    }, 50)
    expect(result.totalMs).toBeGreaterThan(0)
  })
})

describe('compareBenchmarks', () => {
  it('sorts results by avgNs ascending', () => {
    const results = [
      { name: 'slow', iterations: 100, totalMs: 10, opsPerSec: 10000, avgNs: 100000 },
      { name: 'fast', iterations: 100, totalMs: 1, opsPerSec: 100000, avgNs: 10000 },
    ]
    const suite = compareBenchmarks(results)
    expect(suite.name).toBe('comparison')
    expect(suite.results[0]!.name).toBe('fast')
    expect(suite.results[1]!.name).toBe('slow')
  })

  it('returns BenchmarkSuite with name', () => {
    const suite = compareBenchmarks([])
    expect(suite.name).toBe('comparison')
    expect(suite.results).toEqual([])
  })
})

describe('formatResult', () => {
  it('formats millions of ops', () => {
    const result = formatResult({
      name: 'test',
      iterations: 100000,
      totalMs: 10,
      opsPerSec: 10000000,
      avgNs: 100,
    })
    expect(result).toContain('10.00M')
    expect(result).toContain('test')
    expect(result).toContain('ns/op')
  })

  it('formats thousands of ops', () => {
    const result = formatResult({
      name: 'test',
      iterations: 1000,
      totalMs: 100,
      opsPerSec: 10000,
      avgNs: 100000,
    })
    expect(result).toContain('10.00K')
  })

  it('formats regular ops', () => {
    const result = formatResult({
      name: 'test',
      iterations: 10,
      totalMs: 1000,
      opsPerSec: 10,
      avgNs: 100000000,
    })
    expect(result).toContain('10')
    expect(result).not.toContain('K')
    expect(result).not.toContain('M')
  })
})

describe('formatSuite', () => {
  it('formats suite with header and results', () => {
    const suite = formatSuite({
      name: 'test-suite',
      results: [
        { name: 'fast', iterations: 100, totalMs: 1, opsPerSec: 100000, avgNs: 10000 },
        { name: 'slow', iterations: 100, totalMs: 10, opsPerSec: 10000, avgNs: 100000 },
      ],
    })
    expect(suite).toContain('test-suite')
    expect(suite).toContain('fast')
    expect(suite).toContain('slow')
    expect(suite).toContain('1.00x')
    expect(suite).toContain('10.00x')
  })

  it('handles empty results', () => {
    const suite = formatSuite({ name: 'empty', results: [] })
    expect(suite).toContain('empty')
  })
})
