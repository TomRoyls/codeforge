export interface BenchmarkCase {
  name: string
  fn: () => unknown
  iterations: number
}

export interface BenchmarkResult {
  name: string
  iterations: number
  totalTime: number
  avgTime: number
  minTime: number
  maxTime: number
  medianTime: number
  opsPerSecond: number
  standardDeviation: number
}

export interface BenchmarkSuite {
  name: string
  cases: BenchmarkCase[]
}

export interface ComparisonResult {
  baseline: BenchmarkResult
  current: BenchmarkResult
  regression: boolean
  changePercent: number
  verdict: 'improvement' | 'regression' | 'unchanged'
}

export interface BenchmarkConfig {
  warmupIterations: number
  defaultIterations: number
  regressionThreshold: number
  collectMemory: boolean
}

export const DEFAULT_BENCHMARK_CONFIG: BenchmarkConfig = {
  warmupIterations: 10,
  defaultIterations: 100,
  regressionThreshold: 10,
  collectMemory: false,
}
