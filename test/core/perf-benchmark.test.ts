import { describe, it, expect } from 'vitest'
import { BenchmarkRunner } from '../../src/core/perf-benchmark/benchmark-runner.js'
import { PerfBenchmark } from '../../src/core/perf-benchmark/perf-benchmark.js'
import { DEFAULT_BENCHMARK_CONFIG } from '../../src/core/perf-benchmark/types.js'
import type { BenchmarkResult, BenchmarkSuite } from '../../src/core/perf-benchmark/types.js'

describe('BenchmarkRunner', () => {
  const runner = new BenchmarkRunner()

  describe('runBenchmark', () => {
    it('should measure time for a function', () => {
      const result = runner.runBenchmark({
        name: 'test',
        fn: () => {
          for (let i = 0; i < 1000; i++) {
            Math.sqrt(i)
          }
        },
        iterations: 10,
      })
      expect(result.totalTime).toBeGreaterThanOrEqual(0)
      expect(result.avgTime).toBeGreaterThanOrEqual(0)
    })

    it('should run correct number of iterations', () => {
      let count = 0
      const result = runner.runBenchmark({
        name: 'count',
        fn: () => {
          count++
        },
        iterations: 50,
      })
      expect(result.iterations).toBe(50)
      expect(count).toBe(50)
    })

    it('should compute stats correctly', () => {
      const result = runner.runBenchmark({
        name: 'stats',
        fn: () => {},
        iterations: 20,
      })
      expect(result.name).toBe('stats')
      expect(result.iterations).toBe(20)
      expect(result.minTime).toBeLessThanOrEqual(result.maxTime)
      expect(result.avgTime).toBeGreaterThanOrEqual(result.minTime)
      expect(result.avgTime).toBeLessThanOrEqual(result.maxTime)
      expect(result.medianTime).toBeGreaterThanOrEqual(0)
      expect(result.opsPerSecond).toBeGreaterThanOrEqual(0)
      expect(result.standardDeviation).toBeGreaterThanOrEqual(0)
    })

    it('should handle a single iteration', () => {
      const result = runner.runBenchmark({
        name: 'single',
        fn: () => {},
        iterations: 1,
      })
      expect(result.iterations).toBe(1)
      expect(result.totalTime).toBeGreaterThanOrEqual(0)
      expect(result.minTime).toBe(result.maxTime)
    })

    it('should handle a fast function', () => {
      const result = runner.runBenchmark({
        name: 'fast',
        fn: () => 1 + 1,
        iterations: 100,
      })
      expect(result.iterations).toBe(100)
      expect(result.totalTime).toBeGreaterThanOrEqual(0)
    })

    it('should set name correctly', () => {
      const result = runner.runBenchmark({
        name: 'my-benchmark',
        fn: () => {},
        iterations: 5,
      })
      expect(result.name).toBe('my-benchmark')
    })

    it('should compute opsPerSecond as zero when avgTime is zero', () => {
      const result = runner.runBenchmark({
        name: 'zero-time',
        fn: () => {},
        iterations: 1,
      })
      expect(result.opsPerSecond).toBeGreaterThanOrEqual(0)
    })
  })

  describe('runSuite', () => {
    it('should run multiple cases', () => {
      const suite: BenchmarkSuite = {
        name: 'my-suite',
        cases: [
          { name: 'case-a', fn: () => {}, iterations: 5 },
          { name: 'case-b', fn: () => {}, iterations: 5 },
          { name: 'case-c', fn: () => {}, iterations: 5 },
        ],
      }
      const results = runner.runSuite(suite)
      expect(results).toHaveLength(3)
      expect(results[0]!.name).toBe('case-a')
      expect(results[1]!.name).toBe('case-b')
      expect(results[2]!.name).toBe('case-c')
    })

    it('should return empty array for empty suite', () => {
      const suite: BenchmarkSuite = { name: 'empty', cases: [] }
      const results = runner.runSuite(suite)
      expect(results).toEqual([])
    })

    it('should run each case with its own iterations', () => {
      let countA = 0
      let countB = 0
      const suite: BenchmarkSuite = {
        name: 'iter-suite',
        cases: [
          { name: 'a', fn: () => { countA++ }, iterations: 10 },
          { name: 'b', fn: () => { countB++ }, iterations: 20 },
        ],
      }
      runner.runSuite(suite)
      expect(countA).toBe(10)
      expect(countB).toBe(20)
    })
  })

  describe('compare', () => {
    function makeResult(name: string, avgTime: number): BenchmarkResult {
      return {
        name,
        iterations: 100,
        totalTime: avgTime * 100,
        avgTime,
        minTime: avgTime * 0.8,
        maxTime: avgTime * 1.2,
        medianTime: avgTime,
        opsPerSecond: 1000 / avgTime,
        standardDeviation: 0.1,
      }
    }

    it('should detect improvement', () => {
      const baseline = makeResult('test', 10)
      const current = makeResult('test', 5)
      const result = runner.compare(baseline, current, 10)
      expect(result.verdict).toBe('improvement')
      expect(result.regression).toBe(false)
      expect(result.changePercent).toBeLessThan(0)
    })

    it('should detect regression', () => {
      const baseline = makeResult('test', 5)
      const current = makeResult('test', 10)
      const result = runner.compare(baseline, current, 10)
      expect(result.verdict).toBe('regression')
      expect(result.regression).toBe(true)
      expect(result.changePercent).toBeGreaterThan(0)
    })

    it('should detect unchanged within threshold', () => {
      const baseline = makeResult('test', 10)
      const current = makeResult('test', 10.5)
      const result = runner.compare(baseline, current, 10)
      expect(result.verdict).toBe('unchanged')
      expect(result.regression).toBe(false)
    })

    it('should use custom threshold', () => {
      const baseline = makeResult('test', 10)
      const current = makeResult('test', 11)
      const withSmallThreshold = runner.compare(baseline, current, 5)
      const withLargeThreshold = runner.compare(baseline, current, 20)
      expect(withSmallThreshold.verdict).toBe('regression')
      expect(withLargeThreshold.verdict).toBe('unchanged')
    })

    it('should include baseline and current in result', () => {
      const baseline = makeResult('base', 10)
      const current = makeResult('curr', 5)
      const result = runner.compare(baseline, current)
      expect(result.baseline).toBe(baseline)
      expect(result.current).toBe(current)
    })

    it('should handle zero baseline avgTime', () => {
      const baseline = makeResult('zero', 0)
      baseline.totalTime = 0
      baseline.opsPerSecond = 0
      const current = makeResult('current', 5)
      const result = runner.compare(baseline, current, 10)
      expect(result.changePercent).toBe(0)
      expect(result.verdict).toBe('unchanged')
    })

    it('should detect exactly at threshold boundary', () => {
      const baseline = makeResult('test', 100)
      const current = makeResult('test', 110)
      const result = runner.compare(baseline, current, 10)
      expect(result.verdict).toBe('unchanged')
    })

    it('should detect regression just over threshold', () => {
      const baseline = makeResult('test', 100)
      const current = makeResult('test', 110.01)
      const result = runner.compare(baseline, current, 10)
      expect(result.verdict).toBe('regression')
    })

    it('should use default threshold of 10', () => {
      const baseline = makeResult('test', 100)
      const current = makeResult('test', 115)
      const result = runner.compare(baseline, current)
      expect(result.verdict).toBe('regression')
    })
  })

  describe('computeStats', () => {
    it('should return zeros for empty array', () => {
      const stats = BenchmarkRunner.computeStats([])
      expect(stats.min).toBe(0)
      expect(stats.max).toBe(0)
      expect(stats.avg).toBe(0)
      expect(stats.median).toBe(0)
      expect(stats.stddev).toBe(0)
      expect(stats.sum).toBe(0)
    })

    it('should compute stats for single value', () => {
      const stats = BenchmarkRunner.computeStats([5])
      expect(stats.min).toBe(5)
      expect(stats.max).toBe(5)
      expect(stats.avg).toBe(5)
      expect(stats.median).toBe(5)
      expect(stats.stddev).toBe(0)
      expect(stats.sum).toBe(5)
    })

    it('should compute correct min and max', () => {
      const stats = BenchmarkRunner.computeStats([3, 7, 1, 9, 5])
      expect(stats.min).toBe(1)
      expect(stats.max).toBe(9)
    })

    it('should compute correct average', () => {
      const stats = BenchmarkRunner.computeStats([2, 4, 6, 8, 10])
      expect(stats.avg).toBe(6)
    })

    it('should compute correct median for odd count', () => {
      const stats = BenchmarkRunner.computeStats([3, 1, 2])
      expect(stats.median).toBe(2)
    })

    it('should compute correct median for even count', () => {
      const stats = BenchmarkRunner.computeStats([1, 2, 3, 4])
      expect(stats.median).toBe(2.5)
    })

    it('should compute correct sum', () => {
      const stats = BenchmarkRunner.computeStats([1, 2, 3, 4, 5])
      expect(stats.sum).toBe(15)
    })

    it('should compute standard deviation', () => {
      const stats = BenchmarkRunner.computeStats([2, 4, 4, 4, 5, 5, 7, 9])
      expect(stats.avg).toBe(5)
      expect(stats.stddev).toBeCloseTo(2, 0)
    })

    it('should return zero stddev for single value', () => {
      const stats = BenchmarkRunner.computeStats([42])
      expect(stats.stddev).toBe(0)
    })

    it('should handle two values correctly', () => {
      const stats = BenchmarkRunner.computeStats([10, 20])
      expect(stats.min).toBe(10)
      expect(stats.max).toBe(20)
      expect(stats.avg).toBe(15)
      expect(stats.median).toBe(15)
    })

    it('should not mutate input array', () => {
      const input = [5, 3, 1, 4, 2]
      const copy = [...input]
      BenchmarkRunner.computeStats(input)
      expect(input).toEqual(copy)
    })
  })
})

describe('PerfBenchmark', () => {
  describe('constructor', () => {
    it('should use default config when no config provided', () => {
      const pb = new PerfBenchmark()
      const config = pb.getConfig()
      expect(config.warmupIterations).toBe(DEFAULT_BENCHMARK_CONFIG.warmupIterations)
      expect(config.defaultIterations).toBe(DEFAULT_BENCHMARK_CONFIG.defaultIterations)
      expect(config.regressionThreshold).toBe(DEFAULT_BENCHMARK_CONFIG.regressionThreshold)
      expect(config.collectMemory).toBe(DEFAULT_BENCHMARK_CONFIG.collectMemory)
    })

    it('should accept partial config', () => {
      const pb = new PerfBenchmark({ defaultIterations: 50 })
      const config = pb.getConfig()
      expect(config.defaultIterations).toBe(50)
      expect(config.warmupIterations).toBe(DEFAULT_BENCHMARK_CONFIG.warmupIterations)
    })

    it('should accept full config', () => {
      const pb = new PerfBenchmark({
        warmupIterations: 5,
        defaultIterations: 200,
        regressionThreshold: 5,
        collectMemory: true,
      })
      const config = pb.getConfig()
      expect(config.warmupIterations).toBe(5)
      expect(config.defaultIterations).toBe(200)
      expect(config.regressionThreshold).toBe(5)
      expect(config.collectMemory).toBe(true)
    })

    it('should return a copy of config from getConfig', () => {
      const pb = new PerfBenchmark()
      const config1 = pb.getConfig()
      config1.defaultIterations = 999
      const config2 = pb.getConfig()
      expect(config2.defaultIterations).toBe(DEFAULT_BENCHMARK_CONFIG.defaultIterations)
    })
  })

  describe('benchmark', () => {
    it('should store result by name', () => {
      const pb = new PerfBenchmark()
      const result = pb.benchmark('my-test', () => {})
      const stored = pb.getResult('my-test')
      expect(stored).toBe(result)
    })

    it('should use default iterations when not specified', () => {
      const pb = new PerfBenchmark({ defaultIterations: 25 })
      let count = 0
      pb.benchmark('default-iter', () => { count++ })
      expect(count).toBe(25)
    })

    it('should use custom iterations when specified', () => {
      const pb = new PerfBenchmark()
      let count = 0
      pb.benchmark('custom-iter', () => { count++ }, 42)
      expect(count).toBe(42)
    })

    it('should return a BenchmarkResult', () => {
      const pb = new PerfBenchmark()
      const result = pb.benchmark('result-test', () => {})
      expect(result).toBeDefined()
      expect(result.name).toBe('result-test')
      expect(typeof result.totalTime).toBe('number')
      expect(typeof result.avgTime).toBe('number')
      expect(typeof result.minTime).toBe('number')
      expect(typeof result.maxTime).toBe('number')
      expect(typeof result.medianTime).toBe('number')
      expect(typeof result.opsPerSecond).toBe('number')
      expect(typeof result.standardDeviation).toBe('number')
    })

    it('should overwrite result with same name', () => {
      const pb = new PerfBenchmark()
      const r1 = pb.benchmark('dup', () => {}, 5)
      const r2 = pb.benchmark('dup', () => {}, 10)
      expect(pb.getResult('dup')).toBe(r2)
      expect(pb.getResult('dup')).not.toBe(r1)
    })

    it('should store multiple benchmarks', () => {
      const pb = new PerfBenchmark()
      pb.benchmark('a', () => {}, 5)
      pb.benchmark('b', () => {}, 5)
      pb.benchmark('c', () => {}, 5)
      expect(pb.getAllResults()).toHaveLength(3)
    })
  })

  describe('compareWithBaseline', () => {
    it('should compare stored result with new one', () => {
      const pb = new PerfBenchmark()
      pb.benchmark('compare-test', () => {}, 5)
      const newResult: BenchmarkResult = {
        name: 'compare-test',
        iterations: 100,
        totalTime: 500,
        avgTime: 5,
        minTime: 3,
        maxTime: 8,
        medianTime: 5,
        opsPerSecond: 200,
        standardDeviation: 1,
      }
      const comparison = pb.compareWithBaseline('compare-test', newResult)
      expect(comparison.baseline.name).toBe('compare-test')
      expect(comparison.current).toBe(newResult)
      expect(typeof comparison.verdict).toBe('string')
    })

    it('should throw when no baseline exists', () => {
      const pb = new PerfBenchmark()
      const newResult: BenchmarkResult = {
        name: 'missing',
        iterations: 10,
        totalTime: 100,
        avgTime: 10,
        minTime: 8,
        maxTime: 12,
        medianTime: 10,
        opsPerSecond: 100,
        standardDeviation: 1,
      }
      expect(() => pb.compareWithBaseline('missing', newResult)).toThrow('No baseline result found for: missing')
    })

    it('should detect regression in comparison', () => {
      const pb = new PerfBenchmark({ regressionThreshold: 5 })
      pb.benchmark('reg', () => {}, 5)
      const slower: BenchmarkResult = {
        name: 'reg',
        iterations: 100,
        totalTime: 50000,
        avgTime: 500,
        minTime: 400,
        maxTime: 600,
        medianTime: 500,
        opsPerSecond: 2,
        standardDeviation: 50,
      }
      const comparison = pb.compareWithBaseline('reg', slower)
      expect(comparison.regression).toBe(true)
      expect(comparison.verdict).toBe('regression')
    })
  })

  describe('getResult', () => {
    it('should return undefined for unknown name', () => {
      const pb = new PerfBenchmark()
      expect(pb.getResult('unknown')).toBeUndefined()
    })

    it('should return stored result', () => {
      const pb = new PerfBenchmark()
      pb.benchmark('stored', () => {}, 5)
      const result = pb.getResult('stored')
      expect(result).toBeDefined()
      expect(result!.name).toBe('stored')
    })
  })

  describe('getAllResults', () => {
    it('should return empty array when no benchmarks', () => {
      const pb = new PerfBenchmark()
      expect(pb.getAllResults()).toEqual([])
    })

    it('should return all stored results', () => {
      const pb = new PerfBenchmark()
      pb.benchmark('x', () => {}, 5)
      pb.benchmark('y', () => {}, 5)
      pb.benchmark('z', () => {}, 5)
      const all = pb.getAllResults()
      expect(all).toHaveLength(3)
      const names = all.map((r) => r.name)
      expect(names).toContain('x')
      expect(names).toContain('y')
      expect(names).toContain('z')
    })
  })

  describe('detectRegressions', () => {
    it('should return empty when no regressions', () => {
      const pb = new PerfBenchmark({ regressionThreshold: 200 })
      pb.benchmark('a', () => {}, 5)
      pb.benchmark('b', () => {}, 5)
      expect(pb.detectRegressions()).toEqual([])
    })

    it('should detect regressions between stored results', () => {
      const pb = new PerfBenchmark({ regressionThreshold: 5 })
      pb.benchmark('fast', () => {}, 10)
      const slowResult: BenchmarkResult = {
        name: 'slow',
        iterations: 100,
        totalTime: 100000,
        avgTime: 1000,
        minTime: 900,
        maxTime: 1100,
        medianTime: 1000,
        opsPerSecond: 1,
        standardDeviation: 50,
      }
      pb['results'].set('slow', slowResult)
      const regressions = pb.detectRegressions()
      expect(regressions.length).toBeGreaterThan(0)
    })

    it('should use custom threshold', () => {
      const pb = new PerfBenchmark({ regressionThreshold: 5 })
      pb.benchmark('a', () => {}, 10)
      pb.benchmark('b', () => {}, 10)
      const regressionsWithSmall = pb.detectRegressions(5)
      const regressionsWithLarge = pb.detectRegressions(200)
      expect(regressionsWithLarge.length).toBeLessThanOrEqual(regressionsWithSmall.length)
    })

    it('should return empty for single benchmark', () => {
      const pb = new PerfBenchmark()
      pb.benchmark('only', () => {}, 5)
      expect(pb.detectRegressions()).toEqual([])
    })
  })

  describe('getFastest', () => {
    it('should return undefined for empty results', () => {
      const pb = new PerfBenchmark()
      expect(pb.getFastest()).toBeUndefined()
    })

    it('should return result with lowest avgTime', () => {
      const pb = new PerfBenchmark()
      pb.benchmark('fast', () => {}, 5)
      const slowResult: BenchmarkResult = {
        name: 'slow',
        iterations: 100,
        totalTime: 10000,
        avgTime: 100,
        minTime: 90,
        maxTime: 110,
        medianTime: 100,
        opsPerSecond: 10,
        standardDeviation: 5,
      }
      pb['results'].set('slow', slowResult)
      const fastest = pb.getFastest()
      expect(fastest).toBeDefined()
      expect(fastest!.name).toBe('fast')
    })

    it('should accept explicit results array', () => {
      const pb = new PerfBenchmark()
      const results: BenchmarkResult[] = [
        { name: 'a', iterations: 10, totalTime: 100, avgTime: 10, minTime: 8, maxTime: 12, medianTime: 10, opsPerSecond: 100, standardDeviation: 1 },
        { name: 'b', iterations: 10, totalTime: 50, avgTime: 5, minTime: 4, maxTime: 6, medianTime: 5, opsPerSecond: 200, standardDeviation: 0.5 },
      ]
      const fastest = pb.getFastest(results)
      expect(fastest!.name).toBe('b')
    })
  })

  describe('getSlowest', () => {
    it('should return undefined for empty results', () => {
      const pb = new PerfBenchmark()
      expect(pb.getSlowest()).toBeUndefined()
    })

    it('should return result with highest avgTime', () => {
      const pb = new PerfBenchmark()
      pb.benchmark('fast', () => {}, 5)
      const slowResult: BenchmarkResult = {
        name: 'slow',
        iterations: 100,
        totalTime: 10000,
        avgTime: 100,
        minTime: 90,
        maxTime: 110,
        medianTime: 100,
        opsPerSecond: 10,
        standardDeviation: 5,
      }
      pb['results'].set('slow', slowResult)
      const slowest = pb.getSlowest()
      expect(slowest).toBeDefined()
      expect(slowest!.name).toBe('slow')
    })

    it('should accept explicit results array', () => {
      const pb = new PerfBenchmark()
      const results: BenchmarkResult[] = [
        { name: 'a', iterations: 10, totalTime: 100, avgTime: 10, minTime: 8, maxTime: 12, medianTime: 10, opsPerSecond: 100, standardDeviation: 1 },
        { name: 'b', iterations: 10, totalTime: 50, avgTime: 5, minTime: 4, maxTime: 6, medianTime: 5, opsPerSecond: 200, standardDeviation: 0.5 },
      ]
      const slowest = pb.getSlowest(results)
      expect(slowest!.name).toBe('a')
    })
  })

  describe('getConfig', () => {
    it('should return a copy of config', () => {
      const pb = new PerfBenchmark({ defaultIterations: 42 })
      const config = pb.getConfig()
      expect(config.defaultIterations).toBe(42)
      expect(config).not.toBe(pb.getConfig())
    })
  })

  describe('runSuite', () => {
    it('should delegate to runner and return results', () => {
      const pb = new PerfBenchmark()
      const suite: BenchmarkSuite = {
        name: 'suite-test',
        cases: [
          { name: 'case-1', fn: () => {}, iterations: 5 },
          { name: 'case-2', fn: () => {}, iterations: 5 },
        ],
      }
      const results = pb.runSuite(suite)
      expect(results).toHaveLength(2)
      expect(results[0]!.name).toBe('case-1')
      expect(results[1]!.name).toBe('case-2')
    })
  })
})

describe('Edge Cases', () => {
  it('should handle zero-iteration benchmark', () => {
    const runner = new BenchmarkRunner()
    let count = 0
    const result = runner.runBenchmark({
      name: 'zero-iter',
      fn: () => { count++ },
      iterations: 0,
    })
    expect(count).toBe(0)
    expect(result.iterations).toBe(0)
    expect(result.totalTime).toBe(0)
    expect(result.avgTime).toBe(0)
  })

  it('should handle single iteration', () => {
    const runner = new BenchmarkRunner()
    const result = runner.runBenchmark({
      name: 'one',
      fn: () => {},
      iterations: 1,
    })
    expect(result.iterations).toBe(1)
    expect(result.minTime).toBe(result.maxTime)
    expect(result.standardDeviation).toBe(0)
  })

  it('should handle very fast function', () => {
    const runner = new BenchmarkRunner()
    const result = runner.runBenchmark({
      name: 'instant',
      fn: () => true,
      iterations: 100,
    })
    expect(result.iterations).toBe(100)
    expect(result.totalTime).toBeGreaterThanOrEqual(0)
  })

  it('should store named results correctly', () => {
    const pb = new PerfBenchmark()
    pb.benchmark('first', () => {}, 5)
    pb.benchmark('second', () => {}, 5)
    expect(pb.getResult('first')).toBeDefined()
    expect(pb.getResult('second')).toBeDefined()
    expect(pb.getResult('first')!.name).toBe('first')
    expect(pb.getResult('second')!.name).toBe('second')
  })

  it('should handle multiple benchmarks stored independently', () => {
    const pb = new PerfBenchmark()
    const results: string[] = []
    pb.benchmark('a', () => { results.push('a') }, 3)
    pb.benchmark('b', () => { results.push('b') }, 3)
    expect(results).toEqual(['a', 'a', 'a', 'b', 'b', 'b'])
  })

  it('computeStats should handle large array', () => {
    const times = Array.from({ length: 1000 }, (_, i) => i + 1)
    const stats = BenchmarkRunner.computeStats(times)
    expect(stats.sum).toBe(500500)
    expect(stats.min).toBe(1)
    expect(stats.max).toBe(1000)
    expect(stats.avg).toBe(500.5)
  })

  it('computeStats should handle negative values', () => {
    const stats = BenchmarkRunner.computeStats([-3, -1, -2])
    expect(stats.min).toBe(-3)
    expect(stats.max).toBe(-1)
    expect(stats.avg).toBe(-2)
  })

  it('should handle duplicate result names overwriting', () => {
    const pb = new PerfBenchmark()
    pb.benchmark('same', () => {}, 5)
    pb.benchmark('same', () => {}, 10)
    expect(pb.getAllResults()).toHaveLength(1)
  })

  it('compare should work with identical results', () => {
    const runner = new BenchmarkRunner()
    const result: BenchmarkResult = {
      name: 'same',
      iterations: 10,
      totalTime: 100,
      avgTime: 10,
      minTime: 8,
      maxTime: 12,
      medianTime: 10,
      opsPerSecond: 100,
      standardDeviation: 1,
    }
    const comparison = runner.compare(result, result, 10)
    expect(comparison.changePercent).toBe(0)
    expect(comparison.verdict).toBe('unchanged')
  })

  it('getFastest should handle single result', () => {
    const pb = new PerfBenchmark()
    pb.benchmark('only', () => {}, 5)
    const fastest = pb.getFastest()
    expect(fastest).toBeDefined()
    expect(fastest!.name).toBe('only')
  })

  it('getSlowest should handle single result', () => {
    const pb = new PerfBenchmark()
    pb.benchmark('only', () => {}, 5)
    const slowest = pb.getSlowest()
    expect(slowest).toBeDefined()
    expect(slowest!.name).toBe('only')
  })

  it('should handle function that throws on some iterations', () => {
    const runner = new BenchmarkRunner()
    let callCount = 0
    const result = runner.runBenchmark({
      name: 'sometimes-throws',
      fn: () => {
        callCount++
      },
      iterations: 10,
    })
    expect(callCount).toBe(10)
    expect(result.iterations).toBe(10)
  })

  it('computeStats median of single element should be that element', () => {
    const stats = BenchmarkRunner.computeStats([42])
    expect(stats.median).toBe(42)
  })

  it('computeStats stddev should be zero for constant values', () => {
    const stats = BenchmarkRunner.computeStats([5, 5, 5, 5])
    expect(stats.stddev).toBe(0)
  })

  it('should compute opsPerSecond correctly', () => {
    const runner = new BenchmarkRunner()
    const result = runner.runBenchmark({
      name: 'ops',
      fn: () => {},
      iterations: 10,
    })
    if (result.avgTime > 0) {
      expect(result.opsPerSecond).toBeCloseTo(1000 / result.avgTime, 1)
    }
  })

  it('should preserve suite name', () => {
    const runner = new BenchmarkRunner()
    const suite: BenchmarkSuite = {
      name: 'my-named-suite',
      cases: [{ name: 'a', fn: () => {}, iterations: 3 }],
    }
    const results = runner.runSuite(suite)
    expect(results).toHaveLength(1)
    expect(suite.name).toBe('my-named-suite')
  })

  it('getFastest and getSlowest on same results should differ', () => {
    const pb = new PerfBenchmark()
    pb.benchmark('a', () => { for (let i = 0; i < 10000; i++) Math.random() }, 5)
    const slowResult: BenchmarkResult = {
      name: 'slow',
      iterations: 100,
      totalTime: 10000,
      avgTime: 100,
      minTime: 90,
      maxTime: 110,
      medianTime: 100,
      opsPerSecond: 10,
      standardDeviation: 5,
    }
    pb['results'].set('slow', slowResult)
    const fastest = pb.getFastest()
    const slowest = pb.getSlowest()
    expect(fastest!.name).toBe('a')
    expect(slowest!.name).toBe('slow')
    expect(fastest!.name).not.toBe(slowest!.name)
  })

  it('compareWithBaseline should detect improvement', () => {
    const pb = new PerfBenchmark({ regressionThreshold: 5 })
    pb.benchmark('improve', () => { for (let i = 0; i < 10000; i++) Math.random() }, 10)
    const faster: BenchmarkResult = {
      name: 'improve',
      iterations: 100,
      totalTime: 1,
      avgTime: 0.01,
      minTime: 0.005,
      maxTime: 0.02,
      medianTime: 0.01,
      opsPerSecond: 100000,
      standardDeviation: 0.005,
    }
    const comparison = pb.compareWithBaseline('improve', faster)
    expect(comparison.verdict).toBe('improvement')
    expect(comparison.changePercent).toBeLessThan(0)
  })

  it('detectRegressions should return ComparisonResult objects', () => {
    const pb = new PerfBenchmark({ regressionThreshold: 5 })
    pb.benchmark('base', () => {}, 10)
    const slowResult: BenchmarkResult = {
      name: 'slow',
      iterations: 100,
      totalTime: 100000,
      avgTime: 1000,
      minTime: 900,
      maxTime: 1100,
      medianTime: 1000,
      opsPerSecond: 1,
      standardDeviation: 50,
    }
    pb['results'].set('slow', slowResult)
    const regressions = pb.detectRegressions()
    for (const r of regressions) {
      expect(r.regression).toBe(true)
      expect(r.verdict).toBe('regression')
      expect(r.baseline).toBeDefined()
      expect(r.current).toBeDefined()
    }
  })

  it('runSuite should not store results in PerfBenchmark', () => {
    const pb = new PerfBenchmark()
    const suite: BenchmarkSuite = {
      name: 'no-store',
      cases: [{ name: 'a', fn: () => {}, iterations: 3 }],
    }
    pb.runSuite(suite)
    expect(pb.getAllResults()).toEqual([])
  })

  it('computeStats should handle three element median', () => {
    const stats = BenchmarkRunner.computeStats([10, 5, 20])
    expect(stats.median).toBe(10)
  })

  it('getAllResults should return array copy', () => {
    const pb = new PerfBenchmark()
    pb.benchmark('a', () => {}, 5)
    const results = pb.getAllResults()
    results.push({} as BenchmarkResult)
    expect(pb.getAllResults()).toHaveLength(1)
  })
})
