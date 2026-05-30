export interface BenchmarkResult {
  name: string
  iterations: number
  totalMs: number
  opsPerSec: number
  avgNs: number
}

export interface BenchmarkSuite {
  name: string
  results: BenchmarkResult[]
}

export function bench(
  name: string,
  fn: () => void,
  iterations: number = 100000,
): BenchmarkResult {
  const start = performance.now()
  for (let i = 0; i < iterations; i++) {
    fn()
  }
  const totalMs = performance.now() - start
  const opsPerSec = (iterations / totalMs) * 1000
  const avgNs = (totalMs * 1e6) / iterations

  return { name, iterations, totalMs, avgNs, opsPerSec }
}

export function benchAsync(
  name: string,
  fn: () => Promise<void>,
  iterations: number = 10000,
): Promise<BenchmarkResult> {
  let resolved = 0
  const start = performance.now()

  return new Promise((resolve) => {
    for (let i = 0; i < iterations; i++) {
      fn().then(() => {
        resolved++
        if (resolved === iterations) {
          const totalMs = performance.now() - start
          resolve({
            avgNs: (totalMs * 1e6) / iterations,
            iterations,
            name,
            opsPerSec: (iterations / totalMs) * 1000,
            totalMs,
          })
        }
      })
    }
  })
}

export function compareBenchmarks(results: BenchmarkResult[]): BenchmarkSuite {
  return { name: 'comparison', results: results.sort((a, b) => a.avgNs - b.avgNs) }
}

export function formatResult(result: BenchmarkResult): string {
  const ops = result.opsPerSec > 1e6
    ? `${(result.opsPerSec / 1e6).toFixed(2)}M`
    : result.opsPerSec > 1e3
      ? `${(result.opsPerSec / 1e3).toFixed(2)}K`
      : result.opsPerSec.toFixed(0)
  return `${result.name}: ${ops} ops/s (${result.avgNs.toFixed(0)} ns/op)`
}

export function formatSuite(suite: BenchmarkSuite): string {
  const lines = [`\n=== ${suite.name} ===`]
  const fastest = suite.results[0]
  for (const r of suite.results) {
    const ratio = fastest ? (r.avgNs / fastest.avgNs).toFixed(2) : '1.00'
    lines.push(`  ${formatResult(r)} [${ratio}x]`)
  }
  return lines.join('\n')
}
