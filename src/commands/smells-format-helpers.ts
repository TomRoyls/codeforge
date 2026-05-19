import chalk from 'chalk'

import type { CodeSmell, SmellCategory, SmellsResult, SmellsStats } from './smells-helpers.js'

// ─── Severity Helpers ─────────────────────────────────────────────────────────

/**
 * Format a severity icon for display.
 *
 * @example
 * severityIcon('critical') // '✖'
 * severityIcon('warning') // '⚠'
 * severityIcon('info') // 'ℹ'
 */
export function severityIcon(severity: string): string {
  if (severity === 'critical') return chalk.red('✖')
  if (severity === 'warning') return chalk.yellow('⚠')
  return chalk.blue('ℹ')
}

/**
 * Color-code a severity label.
 *
 * @example
 * severityLabel('critical') // red 'CRITICAL'
 */
export function severityLabel(severity: string): string {
  if (severity === 'critical') return chalk.red.bold('CRITICAL')
  if (severity === 'warning') return chalk.yellow.bold('WARNING')
  return chalk.blue('INFO')
}

// ─── Table Format ─────────────────────────────────────────────────────────────

/**
 * Format a single smell row for the table.
 *
 * @example
 * formatSmellRow(smell) // '  ⚠ long-function  src/core.ts:10-80  ...'
 */
export function formatSmellRow(smell: CodeSmell): string {
  const icon = severityIcon(smell.severity)
  const type = smell.type.padEnd(22)
  const loc = `${smell.file}:${smell.lineStart}-${smell.lineEnd}`
  return `  ${icon} ${chalk.dim(type)} ${loc.padEnd(40)} ${smell.description}`
}

/**
 * Format a density meter bar.
 *
 * @example
 * formatDensityMeter(5.0) // '█████░░░░░ 5.0'
 */
export function formatDensityMeter(density: number): string {
  const maxBars = 20
  const bars = Math.min(Math.round(density), maxBars)
  const filled = '█'.repeat(bars)
  const empty = '░'.repeat(maxBars - bars)
  const color = density < 5 ? chalk.green : density < 15 ? chalk.yellow : chalk.red
  return `${color(filled)}${chalk.dim(empty)} ${density}`
}

/**
 * Format category breakdown.
 *
 * @example
 * formatCategoryBreakdown(categories) // '  size: 3 (warning) ...'
 */
export function formatCategoryBreakdown(categories: SmellCategory[]): string {
  const lines: string[] = []
  for (const cat of categories) {
    const icon = severityIcon(cat.severity)
    lines.push(`  ${icon} ${chalk.bold(cat.name.padEnd(14))} ${String(cat.count).padStart(3)} smell${cat.count !== 1 ? 's' : ' '}`)
  }
  return lines.join('\n')
}

/**
 * Format the stats summary.
 *
 * @example
 * formatStatsSummary(stats) // 'Total: 10 | Critical: 2 | ...'
 */
export function formatStatsSummary(stats: SmellsStats): string {
  const lines: string[] = []
  lines.push(`  ${chalk.dim('Total smells:')}      ${stats.totalSmells}`)
  lines.push(`  ${chalk.dim('Critical:')}         ${stats.criticalCount}`)
  lines.push(`  ${chalk.dim('Warning:')}          ${stats.warningCount}`)
  lines.push(`  ${chalk.dim('Info:')}             ${stats.infoCount}`)
  lines.push(`  ${chalk.dim('Files affected:')}   ${stats.filesAffected}`)
  lines.push(`  ${chalk.dim('Smell density:')}    ${stats.smellDensity} per 1000 lines`)
  lines.push(`  ${chalk.dim('Most common:')}      ${stats.mostCommonSmell || 'N/A'}`)
  lines.push(`  ${chalk.dim('Most affected:')}    ${stats.mostAffectedFile || 'N/A'}`)
  return lines.join('\n')
}

/**
 * Format the complete smells analysis as a table.
 *
 * @example
 * formatSmellsTable(result) // full colored terminal output
 */
export function formatSmellsTable(result: SmellsResult): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.bold.underline('Code Smell Analysis'))
  lines.push('')

  lines.push(chalk.bold('Summary:'))
  lines.push(formatStatsSummary(result.stats))
  lines.push('')

  lines.push(chalk.bold('Density Meter:'))
  lines.push(`  ${formatDensityMeter(result.stats.smellDensity)}`)
  lines.push('')

  lines.push(chalk.bold('Category Breakdown:'))
  lines.push(formatCategoryBreakdown(result.categories))
  lines.push('')

  if (result.smells.length > 0) {
    lines.push(chalk.bold('Detected Smells:'))
    for (const smell of result.smells) {
      lines.push(formatSmellRow(smell))
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.bold('Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`  ${chalk.rgb(255, 165, 0)('→')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

// ─── JSON Format ──────────────────────────────────────────────────────────────

/**
 * Format smells analysis as JSON.
 *
 * @example
 * formatSmellsJson(result) // '{"smells":[...],...}'
 */
export function formatSmellsJson(result: SmellsResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── CSV Format ───────────────────────────────────────────────────────────────

/**
 * Format smells analysis as CSV.
 *
 * @example
 * formatSmellsCsv(result) // 'type,name,file,lineStart,...'
 */
export function formatSmellsCsv(result: SmellsResult): string {
  const header = 'type,name,file,lineStart,lineEnd,severity,description,suggestion,category'
  const rows = result.smells.map((s) =>
    `"${s.type}","${s.name}","${s.file}",${s.lineStart},${s.lineEnd},"${s.severity}","${s.description}","${s.suggestion}","${s.category}"`
  )
  return [header, ...rows].join('\n')
}
