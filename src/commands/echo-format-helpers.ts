import chalk from 'chalk'

import type { Echo, EchoResult, EchoStats } from './echo-helpers.js'

// ─── Category Colors ─────────────────────────────────────────────────────────

const CATEGORY_COLORS = {
  boilerplate: (t: string) => chalk.rgb(158, 158, 158)(t),
  'error-handling': (t: string) => chalk.rgb(244, 67, 54)(t),
  validation: (t: string) => chalk.rgb(255, 152, 0)(t),
  configuration: (t: string) => chalk.rgb(33, 150, 243)(t),
  pattern: (t: string) => chalk.rgb(156, 39, 176)(t),
} as const

/**
 * Get category color function.
 *
 * @example
 * getCategoryColor('boilerplate')
 */
export function getCategoryColor(category: Echo['category']): (t: string) => string {
  return CATEGORY_COLORS[category] ?? chalk.white
}

/**
 * Get type icon.
 *
 * @example
 * getTypeIcon('exact')
 */
export function getTypeIcon(type: Echo['type']): string {
  if (type === 'exact') return chalk.red('⟐')
  if (type === 'structural') return chalk.yellow('≈')
  return chalk.blue('~')
}

// ─── Density Meter ────────────────────────────────────────────────────────────

/**
 * Format echo density meter.
 *
 * @example
 * formatDensityMeter(45)
 */
export function formatDensityMeter(density: number): string {
  const filled = Math.round(density / 5)
  const empty = 20 - filled
  let colorFn: (t: string) => string
  if (density <= 10) colorFn = chalk.green
  else if (density <= 30) colorFn = chalk.rgb(255, 193, 7)
  else colorFn = chalk.rgb(244, 67, 54)
  const bar = colorFn('█'.repeat(Math.max(filled, 0)) + '░'.repeat(Math.max(empty, 0)))
  return `  Density: ${bar} ${density}%`
}

// ─── Echo Row ─────────────────────────────────────────────────────────────────

/**
 * Format a single echo row for table display.
 *
 * @example
 * formatEchoRow(echo)
 */
export function formatEchoRow(echo: Echo): string {
  const icon = getTypeIcon(echo.type)
  const categoryFn = getCategoryColor(echo.category)
  const extractTag = echo.extractable ? chalk.green('✓') : chalk.dim('✗')
  const count = String(echo.count).padStart(3)
  const sim = `${echo.similarity}%`.padStart(4)
  const save = `${echo.estimatedSavings} lines`

  return `  ${icon} ${echo.pattern.slice(0, 35).padEnd(35)} ×${count} Sim:${sim} ${categoryFn(echo.category.padEnd(15))} Save:${save.padStart(8)} ${extractTag}`
}

// ─── Echo Table ───────────────────────────────────────────────────────────────

/**
 * Format the echoes table.
 *
 * @example
 * formatEchoTable(echoes)
 */
export function formatEchoTable(echoes: Echo[]): string {
  if (echoes.length === 0) return chalk.dim('  No echoes detected.')
  const lines: string[] = []
  lines.push(chalk.bold('  Echo Analysis:'))
  lines.push(chalk.gray('  ──────────────────────────────────────────────────────────────────────────────'))
  lines.push(chalk.gray('  Icon  Pattern                 Count  Sim    Category        Savings  Ext'))
  lines.push(chalk.gray('  ──────────────────────────────────────────────────────────────────────────────'))

  const sorted = [...echoes].sort((a, b) => b.estimatedSavings - a.estimatedSavings)
  for (const echo of sorted.slice(0, 30)) {
    lines.push(formatEchoRow(echo))
  }

  if (sorted.length > 30) {
    lines.push(chalk.dim(`  ... and ${sorted.length - 30} more echoes`))
  }

  lines.push(chalk.gray('  ──────────────────────────────────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Stats ────────────────────────────────────────────────────────────────────

/**
 * Format echo stats.
 *
 * @example
 * formatEchoStats(stats)
 */
export function formatEchoStats(stats: EchoStats): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Stats:'))
  lines.push(chalk.gray('  ──────────────────────────────────────────────────────────────'))
  lines.push(`  Total echoes: ${stats.totalEchoes} | Exact: ${stats.exactDuplicates} | Structural/Semantic: ${stats.structuralSimilarities}`)
  lines.push(`  Repeated lines: ${stats.totalRepetition} | Savings potential: ${stats.estimatedSavings} lines`)
  if (stats.mostCommonEcho) {
    lines.push(`  Most common: "${truncate(stats.mostCommonEcho, 50)}"`)
  }
  if (stats.mostExpensiveEcho) {
    lines.push(`  Most expensive: "${truncate(stats.mostExpensiveEcho, 50)}"`)
  }
  lines.push(chalk.gray('  ──────────────────────────────────────────────────────────────'))
  return lines.join('\n')
}

function truncate(s: string, maxLen: number): string {
  return s.length > maxLen ? s.slice(0, maxLen) + '...' : s
}

// ─── Occurrences ──────────────────────────────────────────────────────────────

/**
 * Format occurrence details.
 *
 * @example
 * formatOccurrences(echo)
 */
export function formatOccurrences(echo: Echo): string {
  if (echo.occurrences.length === 0) return ''
  const lines: string[] = []
  lines.push(chalk.bold(`  Occurrences (${echo.count}):`))
  lines.push(chalk.gray('  ───────────────────────────────────────────────────'))

  const shown = echo.occurrences.slice(0, 10)
  for (const occ of shown) {
    lines.push(`  ${chalk.cyan(occ.file)}:${occ.lineStart}-${occ.lineEnd} in ${chalk.dim(occ.context)}`)
  }
  if (echo.occurrences.length > 10) {
    lines.push(chalk.dim(`  ... and ${echo.occurrences.length - 10} more`))
  }

  lines.push(chalk.gray('  ───────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatRecommendations(recs)
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.dim('  No recommendations.')
  const lines: string[] = []
  lines.push(chalk.bold('  Recommendations:'))
  lines.push(chalk.gray('  ───────────────────────────────────────────────────'))
  for (let i = 0; i < recs.length; i++) {
    lines.push(`  ${i + 1}. ${recs[i]}`)
  }
  lines.push(chalk.gray('  ───────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Full Output ──────────────────────────────────────────────────────────────

/**
 * Format the full echo result as table.
 *
 * @example
 * formatEchoTableFull(result)
 */
export function formatEchoTableFull(result: EchoResult): string {
  const sections: string[] = []
  sections.push('')
  sections.push(chalk.bold('  Code Echo Analysis\n'))
  sections.push(formatDensityMeter(result.stats.echoDensity))
  sections.push('')
  sections.push(formatEchoTable(result.echoes))
  sections.push('')
  sections.push(formatEchoStats(result.stats))
  sections.push('')
  sections.push(formatRecommendations(result.recommendations))
  sections.push('')
  return sections.join('\n')
}

/**
 * Format echo result as JSON.
 *
 * @example
 * formatEchoJSON(result)
 */
export function formatEchoJSON(result: EchoResult): string {
  return JSON.stringify(result, null, 2)
}
