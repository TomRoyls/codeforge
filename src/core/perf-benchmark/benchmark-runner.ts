import type { BenchmarkCase, BenchmarkResult, BenchmarkSuite, ComparisonResult } from './types.js'

const now: () => number =
  typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? () => performance.now()
    : () => Date.now()

export class BenchmarkRunner {
  runBenchmark(benchCase: BenchmarkCase): BenchmarkResult {
    const iterations = benchCase.iterations
    const times: number[] = []

    for (let i = 0; i < iterations; i++) {
      const start = now()
      benchCase.fn()
      const end = now()
      times.push(end - start)
    }

    const stats = BenchmarkRunner.computeStats(times)

    return {
      name: benchCase.name,
      iterations,
      totalTime: stats.sum,
      avgTime: stats.avg,
      minTime: stats.min,
      maxTime: stats.max,
      medianTime: stats.median,
      opsPerSecond: stats.avg > 0 ? 1000 / stats.avg : 0,
      standardDeviation: stats.stddev,
    }
  }

  runSuite(suite: BenchmarkSuite): BenchmarkResult[] {
    return suite.cases.map((c) => this.runBenchmark(c))
  }

  compare(baseline: BenchmarkResult, current: BenchmarkResult, threshold: number = 10): ComparisonResult {
    const changePercent =
      baseline.avgTime !== 0 ? ((current.avgTime - baseline.avgTime) / baseline.avgTime) * 100 : 0

    let verdict: ComparisonResult['verdict']
    let regression: boolean

    if (changePercent > threshold) {
      verdict = 'regression'
      regression = true
    } else if (changePercent < -threshold) {
      verdict = 'improvement'
      regression = false
    } else {
      verdict = 'unchanged'
      regression = false
    }

    return {
      baseline,
      current,
      regression,
      changePercent,
      verdict,
    }
  }

  static computeStats(times: number[]): {
    min: number
    max: number
    avg: number
    median: number
    stddev: number
    sum: number
  } {
    if (times.length === 0) {
      return { min: 0, max: 0, avg: 0, median: 0, stddev: 0, sum: 0 }
    }

    let sum = 0
    let min = times[0]!
    let max = times[0]!
    for (let i = 0; i < times.length; i++) {
      const t = times[i]!
      sum += t
      if (t < min) min = t
      if (t > max) max = t
    }
    const avg = sum / times.length

    const sorted = [...times].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    const median =
      sorted.length % 2 !== 0 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2

    const variance =
      times.length > 1
        ? times.reduce((acc, t) => acc + (t - avg) ** 2, 0) / times.length
        : 0
    const stddev = Math.sqrt(variance)

    return { min, max, avg, median, stddev, sum }
  }
}
