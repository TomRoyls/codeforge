import { describe, it, expect } from 'vitest'
import { bench, formatResult, formatSuite, compareBenchmarks } from '../src/utils/bench.js'

describe('bench', () => {
  it('measures function performance', () => {
    const result = bench('test', () => {}, 1000)
    expect(result.name).toBe('test')
    expect(result.iterations).toBe(1000)
    expect(result.totalMs).toBeGreaterThanOrEqual(0)
    expect(result.opsPerSec).toBeGreaterThan(0)
    expect(result.avgNs).toBeGreaterThanOrEqual(0)
  })

  it('uses default iterations', () => {
    const result = bench('default', () => {})
    expect(result.iterations).toBe(100000)
  })
})

describe('formatResult', () => {
  it('formats ops in millions', () => {
    const result = formatResult({ avgNs: 1, iterations: 1000, name: 'fast', opsPerSec: 2000000, totalMs: 1 })
    expect(result).toContain('2.00M')
  })

  it('formats ops in thousands', () => {
    const result = formatResult({ avgNs: 100, iterations: 1000, name: 'mid', opsPerSec: 5000, totalMs: 1 })
    expect(result).toContain('5.00K')
  })

  it('formats small ops', () => {
    const result = formatResult({ avgNs: 100000, iterations: 10, name: 'slow', opsPerSec: 50, totalMs: 1 })
    expect(result).toContain('50')
    expect(result).toContain('ns/op')
  })
})

describe('compareBenchmarks', () => {
  it('sorts by avgNs ascending', () => {
    const suite = compareBenchmarks([
      { avgNs: 200, iterations: 100, name: 'slow', opsPerSec: 5000, totalMs: 20 },
      { avgNs: 50, iterations: 100, name: 'fast', opsPerSec: 20000, totalMs: 5 },
    ])
    expect(suite.results[0]!.name).toBe('fast')
    expect(suite.results[1]!.name).toBe('slow')
  })
})

describe('formatSuite', () => {
  it('formats suite with header', () => {
    const str = formatSuite({
      name: 'test',
      results: [{ avgNs: 100, iterations: 100, name: 'a', opsPerSec: 10000, totalMs: 10 }],
    })
    expect(str).toContain('test')
    expect(str).toContain('a:')
  })
})
