import type { BenchmarkSuite } from './benchmark-types.js'

/**
 * @internal
 */
function fmt(n: number, decimals = 3): string {
  if (n < 0) return 'N/A'
  return n.toFixed(decimals)
}

/**
 * @internal
 */
function pad(str: string, len: number, align: 'left' | 'right' = 'right'): string {
  if (str.length >= len) return str
  const gap = len - str.length
  return align === 'right' ? ' '.repeat(gap) + str : str + ' '.repeat(gap)
}

/**
 * @internal
 */
export function formatBenchmarkTable(suite: BenchmarkSuite): string {
  const sorted = [...suite.results].sort((a, b) => b.averageMs - a.averageMs)

  const colRule = 30
  const colNum = 12
  const colMem = 12
  const colViol = 10

  const sep = '-'.repeat(colRule + colNum * 5 + colMem + colViol + 9)
  const lines: string[] = [sep]

  const header =
    pad('Rule ID', colRule, 'left') +
    ' | ' +
    pad('Avg (ms)', colNum) +
    ' | ' +
    pad('Median', colNum) +
    ' | ' +
    pad('P95', colNum) +
    ' | ' +
    pad('Min', colNum) +
    ' | ' +
    pad('Max', colNum) +
    ' | ' +
    pad('Mem (KB)', colMem) +
    ' | ' +
    pad('Viol.', colViol)
  lines.push(header)
  lines.push(sep)

  for (const r of sorted) {
    const row =
      pad(r.ruleId, colRule, 'left') +
      ' | ' +
      pad(fmt(r.averageMs), colNum) +
      ' | ' +
      pad(fmt(r.medianMs), colNum) +
      ' | ' +
      pad(fmt(r.p95Ms), colNum) +
      ' | ' +
      pad(fmt(r.minMs), colNum) +
      ' | ' +
      pad(fmt(r.maxMs), colNum) +
      ' | ' +
      pad(fmt(r.memoryUsageKB), colMem) +
      ' | ' +
      pad(String(r.violationsPerRun), colViol)
    lines.push(row)
  }

  lines.push(sep)
  return lines.join('\n')
}

/**
 * @internal
 */
export function formatBenchmarkJSON(suite: BenchmarkSuite): string {
  return JSON.stringify(suite, null, 2)
}

/**
 * @internal
 */
export function formatBenchmarkMarkdown(suite: BenchmarkSuite): string {
  const sorted = [...suite.results].sort((a, b) => b.averageMs - a.averageMs)

  const lines: string[] = []

  lines.push('# Benchmark Results')
  lines.push('')
  lines.push(`- **Timestamp**: ${suite.timestamp}`)
  lines.push(`- **Node**: ${suite.nodeVersion}`)
  lines.push(`- **Platform**: ${suite.platform}`)
  lines.push(`- **Iterations**: ${suite.config.iterations}`)
  lines.push(`- **Warmup**: ${suite.config.warmupIterations}`)
  lines.push(`- **Total Duration**: ${fmt(suite.totalDurationMs)} ms`)
  lines.push('')

  if (sorted.length === 0) {
    lines.push('_No benchmark results._')
    return lines.join('\n')
  }

  lines.push('| Rule ID | Avg (ms) | Median (ms) | P95 (ms) | Min (ms) | Max (ms) | Mem (KB) | Viol. |')
  lines.push('|---|---|---|---|---|---|---|---|')

  for (const r of sorted) {
    lines.push(
      `| ${r.ruleId} | ${fmt(r.averageMs)} | ${fmt(r.medianMs)} | ${fmt(r.p95Ms)} | ${fmt(r.minMs)} | ${fmt(r.maxMs)} | ${fmt(r.memoryUsageKB)} | ${r.violationsPerRun} |`,
    )
  }

  return lines.join('\n')
}
