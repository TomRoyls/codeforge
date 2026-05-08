import type { BenchmarkConfig, BenchmarkSuite, RuleBenchmarkResult } from './benchmark-types.js'

import { DEFAULT_BENCHMARK_CONFIG } from './benchmark-types.js'

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0
  const index = Math.ceil((p / 100) * sorted.length) - 1
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))]!
}

function median(sorted: number[]): number {
  if (sorted.length === 0) return 0
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1]! + sorted[mid]!) / 2
  }
  return sorted[mid]!
}

/**
 * @stable
 */
export class BenchmarkRunner {
  private readonly config: BenchmarkConfig

  constructor(config?: Partial<BenchmarkConfig>) {
    this.config = { ...DEFAULT_BENCHMARK_CONFIG, ...config }
  }

  getConfig(): BenchmarkConfig {
    return { ...this.config }
  }

  async runAll(): Promise<BenchmarkSuite> {
    const suiteStart = process.hrtime.bigint()
    const results: RuleBenchmarkResult[] = []

    for (const ruleId of this.config.rules) {
      const result = await this.runRule(ruleId)
      results.push(result)
    }

    const suiteEnd = process.hrtime.bigint()

    return {
      config: this.getConfig(),
      nodeVersion: process.version,
      platform: process.platform,
      results,
      timestamp: new Date().toISOString(),
      totalDurationMs: Number(suiteEnd - suiteStart) / 1_000_000,
    }
  }

  async runRule(ruleId: string): Promise<RuleBenchmarkResult> {
    const { RULE_MODULES } = await import('../rules/rule-module-registry.js')
    const loader = RULE_MODULES[ruleId]

    if (!loader) {
      return {
        averageMs: -1,
        iterations: this.config.iterations,
        maxMs: -1,
        medianMs: -1,
        memoryUsageKB: 0,
        minMs: -1,
        p95Ms: -1,
        p99Ms: -1,
        ruleId,
        totalMs: -1,
        violationsPerRun: 0,
      }
    }

    let ruleModule: Record<string, unknown>
    try {
      ruleModule = await loader()
    } catch {
      return {
        averageMs: -1,
        iterations: this.config.iterations,
        maxMs: -1,
        medianMs: -1,
        memoryUsageKB: 0,
        minMs: -1,
        p95Ms: -1,
        p99Ms: -1,
        ruleId,
        totalMs: -1,
        violationsPerRun: 0,
      }
    }

    const ruleDef = ruleModule[ruleId] as
      | { create: (opts: Record<string, unknown>) => { onComplete?: () => unknown[]; visitor: unknown } }
      | undefined

    if (!ruleDef) {
      return {
        averageMs: -1,
        iterations: this.config.iterations,
        maxMs: -1,
        medianMs: -1,
        memoryUsageKB: 0,
        minMs: -1,
        p95Ms: -1,
        p99Ms: -1,
        ruleId,
        totalMs: -1,
        violationsPerRun: 0,
      }
    }

    for (let i = 0; i < this.config.warmupIterations; i++) {
      ruleDef.create({})
    }

    const timings: number[] = []
    let violationsPerRun = 0
    const memBefore = process.memoryUsage().rss

    for (let i = 0; i < this.config.iterations; i++) {
      const start = process.hrtime.bigint()
      const ctx = ruleDef.create({})
      const end = process.hrtime.bigint()

      const elapsed = Number(end - start) / 1_000_000
      timings.push(elapsed)

      if (ctx.onComplete) {
        const violations = ctx.onComplete()
        if (i === 0) {
          violationsPerRun = violations.length
        }
      }
    }

    const memAfter = process.memoryUsage().rss
    const sorted = [...timings].sort((a, b) => a - b)
    const totalMs = timings.reduce((sum, t) => sum + t, 0)

    return {
      averageMs: totalMs / timings.length,
      iterations: this.config.iterations,
      maxMs: sorted[sorted.length - 1] ?? 0,
      medianMs: median(sorted),
      memoryUsageKB: Math.max(0, (memAfter - memBefore) / 1024),
      minMs: sorted[0] ?? 0,
      p95Ms: percentile(sorted, 95),
      p99Ms: percentile(sorted, 99),
      ruleId,
      totalMs,
      violationsPerRun,
    }
  }
}
