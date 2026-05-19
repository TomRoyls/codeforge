import chalk from 'chalk'

import type { BaselineComparison, BaselineDiff, BaselineMetrics } from './baseline-helpers.js'

// ─── Status Icon ────────────────────────────────────────

/**
 * @example
 * const icon = statusIcon('improved')
 * console.log(icon)
 */
export function statusIcon(status: string): string {
  if (status === 'improved') return chalk.green('↑')
  if (status === 'regressed') return chalk.red('↓')
  if (status === 'new') return chalk.cyan('+')
  return chalk.gray('·')
}

// ─── Format Delta ───────────────────────────────────────

/**
 * @example
 * const text = formatDelta(12.5, 'improved')
 * console.log(text)
 */
export function formatDelta(deltaPercent: number, status: string): string {
  const sign = deltaPercent > 0 ? '+' : ''
  const text = `${sign}${deltaPercent}%`
  if (status === 'improved') return chalk.green(text)
  if (status === 'regressed') return chalk.red(text)
  return chalk.gray(text)
}

// ─── Format Diff Table ──────────────────────────────────

/**
 * @example
 * const text = formatDiffTable(diffs)
 * console.log(text)
 */
export function formatDiffTable(diffs: BaselineDiff[]): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Metric Diffs'))
  lines.push(chalk.gray('  ──────────────────────────────────────────────────────'))
  lines.push(`  ${chalk.bold('Metric'.padEnd(22))} ${chalk.bold('Baseline'.padStart(10))} ${chalk.bold('Current'.padStart(10))} ${chalk.bold('Delta'.padStart(10))} ${chalk.bold('Status')}`)

  for (const d of diffs) {
    const icon = statusIcon(d.status)
    const delta = formatDelta(d.deltaPercent, d.status)
    lines.push(`  ${d.metric.padEnd(22)} ${String(d.baseline).padStart(10)} ${String(d.current).padStart(10)} ${delta.padStart(19)} ${icon} ${d.status}`)
  }

  return lines.join('\n')
}

// ─── Format Metrics ─────────────────────────────────────

/**
 * @example
 * const text = formatBaselineMetrics(metrics)
 * console.log(text)
 */
export function formatBaselineMetrics(metrics: BaselineMetrics): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.bold(`  Baseline: ${metrics.name}`))
  lines.push(chalk.gray('  ──────────────────────────────────────────────────────'))
  lines.push(`  ${chalk.cyan('Timestamp:')}        ${metrics.timestamp}`)
  lines.push(`  ${chalk.cyan('Total Files:')}       ${metrics.totalFiles}`)
  lines.push(`  ${chalk.cyan('Total Lines:')}       ${metrics.totalLines}`)
  lines.push(`  ${chalk.cyan('Code Lines:')}        ${metrics.codeLines}`)
  lines.push(`  ${chalk.cyan('Source Files:')}      ${metrics.sourceFiles}`)
  lines.push(`  ${chalk.cyan('Test Files:')}        ${metrics.testFiles}`)
  lines.push(`  ${chalk.cyan('Avg Complexity:')}    ${metrics.avgComplexity}`)
  lines.push(`  ${chalk.cyan('Avg Func Length:')}   ${metrics.avgFunctionLength}`)
  lines.push(`  ${chalk.cyan('TODOs:')}             ${metrics.todoCount}`)
  lines.push(`  ${chalk.cyan('FIXMEs:')}            ${metrics.fixmeCount}`)
  lines.push(`  ${chalk.cyan('Security Issues:')}   ${metrics.securityIssues}`)
  lines.push(`  ${chalk.cyan('Dead Code Items:')}   ${metrics.deadCodeItems}`)

  const langEntries = Object.entries(metrics.languages)
  if (langEntries.length > 0) {
    lines.push('')
    lines.push(chalk.bold('  Languages'))
    lines.push(chalk.gray('  ──────────────────────────────────────────────────────'))
    for (const [lang, count] of langEntries) {
      lines.push(`  ${lang.padEnd(20)} ${count}`)
    }
  }

  if (metrics.topFiles.length > 0) {
    lines.push('')
    lines.push(chalk.bold('  Top Files'))
    lines.push(chalk.gray('  ──────────────────────────────────────────────────────'))
    for (const tf of metrics.topFiles) {
      lines.push(`  ${tf.file.padEnd(40)} ${tf.lines} lines`)
    }
  }

  return lines.join('\n')
}

// ─── Format Comparison ──────────────────────────────────

/**
 * @example
 * const text = formatComparison(comparison)
 * console.log(text)
 */
export function formatComparison(comparison: BaselineComparison): string {
  const parts: string[] = []

  parts.push('')
  parts.push(chalk.bold('  Baseline Comparison'))
  parts.push(chalk.gray('  ══════════════════════════════════════════════════════'))
  parts.push(`  ${chalk.cyan('Baseline:')}  ${comparison.baselineName} (${comparison.baselineTimestamp})`)
  parts.push(`  ${chalk.cyan('Current:')}   ${comparison.currentTimestamp}`)

  const overallIcon = comparison.overallStatus === 'improved'
    ? chalk.green('↑')
    : comparison.overallStatus === 'regressed'
      ? chalk.red('↓')
      : chalk.gray('·')

  parts.push(`  ${chalk.cyan('Overall:')}   ${overallIcon} ${comparison.overallStatus}`)
  parts.push(`  ${chalk.cyan('Health Δ:')}  ${comparison.healthDelta > 0 ? chalk.green(`+${comparison.healthDelta}`) : comparison.healthDelta < 0 ? chalk.red(String(comparison.healthDelta)) : chalk.gray('0')}`)
  parts.push('')

  parts.push(formatDiffTable(comparison.diffs))

  if (comparison.regressions.length > 0) {
    parts.push('')
    parts.push(chalk.bold('  Regressions'))
    parts.push(chalk.gray('  ──────────────────────────────────────────────────────'))
    for (const r of comparison.regressions) {
      const delta = formatDelta(r.deltaPercent, 'regressed')
      parts.push(`  ${chalk.red('↓')} ${r.metric}: ${r.baseline} → ${r.current} (${delta})`)
    }
  }

  if (comparison.improvements.length > 0) {
    parts.push('')
    parts.push(chalk.bold('  Improvements'))
    parts.push(chalk.gray('  ──────────────────────────────────────────────────────'))
    for (const imp of comparison.improvements) {
      const delta = formatDelta(imp.deltaPercent, 'improved')
      parts.push(`  ${chalk.green('↑')} ${imp.metric}: ${imp.baseline} → ${imp.current} (${delta})`)
    }
  }

  parts.push('')
  return parts.join('\n')
}

// ─── Format JSON ────────────────────────────────────────

/**
 * @example
 * const json = formatBaselineJson(metrics)
 * console.log(json.length)
 */
export function formatBaselineJson(data: BaselineMetrics | BaselineComparison): string {
  return JSON.stringify(data, null, 2)
}
