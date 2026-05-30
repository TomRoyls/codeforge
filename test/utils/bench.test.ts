import { describe, it, expect } from 'vitest'
import { bench, benchAsync, compareBenchmarks, formatResult, formatSuite } from '../../src/utils/bench.js'

describe('bench', () => {
  it('returns result with correct name', () => {
    const result = bench('test-operation', () => {}, 100)

    expect(result.name).toBe('test-operation')
  })

  it('executes function for specified iterations', () => {
    let count = 0

    const result = bench('counter', () => {
      count++
    }, 50)

    expect(count).toBe(50)
    expect(result.iterations).toBe(50)
  })

  it('measures execution time', () => {
    const result = bench('empty', () => {}, 100)

    expect(result.totalMs).toBeGreaterThanOrEqual(0)
    expect(typeof result.totalMs).toBe('number')
  })

  it('calculates operations per second', () => {
    const result = bench('test', () => {}, 100)

    expect(result.opsPerSec).toBeGreaterThan(0)
    expect(typeof result.opsPerSec).toBe('number')
  })

  it('calculates average nanoseconds per operation', () => {
    const result = bench('test', () => {}, 100)

    expect(result.avgNs).toBeGreaterThanOrEqual(0)
    expect(typeof result.avgNs).toBe('number')
  })

  it('uses default iterations when not specified', () => {
    let count = 0

    const result = bench('default', () => {
      count++
    })

    expect(count).toBe(100000)
    expect(result.iterations).toBe(100000)
  })

  it('benchmarks complex operations', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i)

    const result = bench('array-reduce', () => {
      arr.reduce((sum, val) => sum + val, 0)
    }, 1000)

    expect(result.iterations).toBe(1000)
    expect(result.totalMs).toBeGreaterThan(0)
  })

  it('benchAsync returns promise with correct name', async () => {
    const result = await benchAsync('async-test', async () => {}, 10)

    expect(result.name).toBe('async-test')
  })

  it('benchAsync executes function for specified iterations', async () => {
    let count = 0

    const result = await benchAsync('async-counter', async () => {
      count++
    }, 20)

    expect(count).toBe(20)
    expect(result.iterations).toBe(20)
  })

  it('benchAsync uses default iterations when not specified', async () => {
    let count = 0

    const result = await benchAsync('async-default', async () => {
      count++
    })

    expect(count).toBe(10000)
    expect(result.iterations).toBe(10000)
  })

  it('benchAsync measures execution time', async () => {
    const result = await benchAsync('async-timer', async () => {
      await new Promise((resolve) => setTimeout(resolve, 1))
    }, 5)

    expect(result.totalMs).toBeGreaterThanOrEqual(0)
    expect(typeof result.totalMs).toBe('number')
  })

  it('benchAsync calculates operations per second', async () => {
    const result = await benchAsync('async-ops', async () => {}, 10)

    expect(result.opsPerSec).toBeGreaterThan(0)
    expect(typeof result.opsPerSec).toBe('number')
  })

  it('benchAsync calculates average nanoseconds per operation', async () => {
    const result = await benchAsync('async-avg', async () => {}, 10)

    expect(result.avgNs).toBeGreaterThanOrEqual(0)
    expect(typeof result.avgNs).toBe('number')
  })

  it('compareBenchmarks sorts results by average time', () => {
    const result1 = bench('slow', () => {
      for (let i = 0; i < 10000; i++) {}
    }, 100)

    const result2 = bench('fast', () => {}, 100)

    const suite = compareBenchmarks([result1, result2])

    expect(suite.name).toBe('comparison')
    expect(suite.results).toHaveLength(2)
    expect(suite.results[0]!.avgNs).toBeLessThanOrEqual(suite.results[1]!.avgNs)
  })

  it('compareBenchmarks handles single result', () => {
    const result = bench('single', () => {}, 100)
    const suite = compareBenchmarks([result])

    expect(suite.results).toHaveLength(1)
    expect(suite.results[0]!.name).toBe('single')
  })

  it('compareBenchmarks handles empty array', () => {
    const suite = compareBenchmarks([])

    expect(suite.results).toHaveLength(0)
  })

  it('formatResult formats operations per second in millions', () => {
    const result: ReturnType<typeof bench> = {
      name: 'fast-op',
      iterations: 1000000,
      totalMs: 100,
      opsPerSec: 10000000,
      avgNs: 100,
    }

    const formatted = formatResult(result)

    expect(formatted).toContain('10.00M ops/s')
  })

  it('formatResult formats operations per second in thousands', () => {
    const result: ReturnType<typeof bench> = {
      name: 'medium-op',
      iterations: 10000,
      totalMs: 1000,
      opsPerSec: 10000,
      avgNs: 100000,
    }

    const formatted = formatResult(result)

    expect(formatted).toContain('10.00K ops/s')
  })

  it('formatResult formats operations per second as whole number', () => {
    const result: ReturnType<typeof bench> = {
      name: 'slow-op',
      iterations: 100,
      totalMs: 1000,
      opsPerSec: 100,
      avgNs: 10000000,
    }

    const formatted = formatResult(result)

    expect(formatted).toContain('100 ops/s')
  })

  it('formatResult includes name and nanoseconds', () => {
    const result: ReturnType<typeof bench> = {
      name: 'test-op',
      iterations: 1000,
      totalMs: 100,
      opsPerSec: 10000,
      avgNs: 10000,
    }

    const formatted = formatResult(result)

    expect(formatted).toContain('test-op:')
    expect(formatted).toContain('10000 ns/op')
  })

  it('formatSuite includes suite name header', () => {
    const result1: ReturnType<typeof bench> = {
      name: 'op1',
      iterations: 1000,
      totalMs: 100,
      opsPerSec: 10000,
      avgNs: 10000,
    }

    const suite = compareBenchmarks([result1])
    const formatted = formatSuite(suite)

    expect(formatted).toContain('=== comparison ===')
  })

  it('formatSuite formats all results', () => {
    const result1: ReturnType<typeof bench> = {
      name: 'fast',
      iterations: 1000,
      totalMs: 100,
      opsPerSec: 10000,
      avgNs: 10000,
    }

    const result2: ReturnType<typeof bench> = {
      name: 'slow',
      iterations: 1000,
      totalMs: 200,
      opsPerSec: 5000,
      avgNs: 20000,
    }

    const suite = compareBenchmarks([result1, result2])
    const formatted = formatSuite(suite)

    expect(formatted).toContain('fast:')
    expect(formatted).toContain('slow:')
  })

  it('formatSuite shows ratio to fastest', () => {
    const result1: ReturnType<typeof bench> = {
      name: 'fast',
      iterations: 1000,
      totalMs: 100,
      opsPerSec: 10000,
      avgNs: 10000,
    }

    const result2: ReturnType<typeof bench> = {
      name: 'slow',
      iterations: 1000,
      totalMs: 200,
      opsPerSec: 5000,
      avgNs: 20000,
    }

    const suite = compareBenchmarks([result1, result2])
    const formatted = formatSuite(suite)

    expect(formatted).toContain('[1.00x]')
    expect(formatted).toContain('[2.00x]')
  })
})