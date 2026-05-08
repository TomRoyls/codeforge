import type { BenchmarkConfig, BenchmarkCase, BenchmarkResult, BenchmarkSuite, ComparisonResult } from './types.js'
import { DEFAULT_BENCHMARK_CONFIG } from './types.js'
import { BenchmarkRunner } from './benchmark-runner.js'

export class PerfBenchmark {
  private config: BenchmarkConfig
  private runner: BenchmarkRunner
  private results: Map<string, BenchmarkResult> = new Map()

  constructor(config: Partial<BenchmarkConfig> = {}) {
    this.config = { ...DEFAULT_BENCHMARK_CONFIG, ...config }
    this.runner = new BenchmarkRunner()
  }

  benchmark(name: string, fn: () => unknown, iterations?: number): BenchmarkResult {
    const iter = iterations ?? this.config.defaultIterations
    const benchCase: BenchmarkCase = { name, fn, iterations: iter }
    const result = this.runner.runBenchmark(benchCase)
    this.results.set(name, result)
    return result
  }

  compareWithBaseline(name: string, currentResult: BenchmarkResult): ComparisonResult {
    const baseline = this.results.get(name)
    if (!baseline) {
      throw new Error(`No baseline result found for: ${name}`)
    }
    return this.runner.compare(baseline, currentResult, this.config.regressionThreshold)
  }

  runSuite(suite: BenchmarkSuite): BenchmarkResult[] {
    return this.runner.runSuite(suite)
  }

  getResult(name: string): BenchmarkResult | undefined {
    return this.results.get(name)
  }

  getAllResults(): BenchmarkResult[] {
    return Array.from(this.results.values())
  }

  detectRegressions(threshold?: number): ComparisonResult[] {
    const allResults = this.getAllResults()
    const regressions: ComparisonResult[] = []

    for (let i = 0; i < allResults.length; i++) {
      for (let j = i + 1; j < allResults.length; j++) {
        const a = allResults[i]!
        const b = allResults[j]!
        const comparison = this.runner.compare(a, b, threshold ?? this.config.regressionThreshold)
        if (comparison.regression) {
          regressions.push(comparison)
        }
      }
    }

    return regressions
  }

  getFastest(results?: BenchmarkResult[]): BenchmarkResult | undefined {
    const list = results ?? this.getAllResults()
    if (list.length === 0) return undefined
    return list.reduce((best, curr) => (curr.avgTime < best.avgTime ? curr : best))
  }

  getSlowest(results?: BenchmarkResult[]): BenchmarkResult | undefined {
    const list = results ?? this.getAllResults()
    if (list.length === 0) return undefined
    return list.reduce((worst, curr) => (curr.avgTime > worst.avgTime ? curr : worst))
  }

  getConfig(): BenchmarkConfig {
    return { ...this.config }
  }
}
