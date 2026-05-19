import chalk from 'chalk'

import type { FrequencyCategory, FrequencyResult, FrequencyStats } from './frequency-helpers.js'

// ─── formatFrequencyTable ─────────────────────────────────────────────────────

/**
 * Format top frequencies as a table.
 *
 * @example
 * formatFrequencyTable(elements, 10) // string table
 */
export function formatFrequencyTable(
  elements: { element: string; type: string; frequency: number; category: string }[],
  limit?: number,
): string {
  const max = limit ?? elements.length
  const rows = elements.slice(0, max)
  if (rows.length === 0) return 'No elements found.'

  const elemW = Math.max(4, ...rows.map((r) => r.element.length))
  const typeW = Math.max(4, ...rows.map((r) => r.type.length))
  const catW = Math.max(8, ...rows.map((r) => r.category.length))

  const header = chalk.bold(
    `  ${'Element'.padEnd(elemW)} ${'Type'.padEnd(typeW)} ${'Category'.padEnd(catW)} Freq`,
  )
  const sep = '  ' + '-'.repeat(elemW + typeW + catW + 11)
  const lines = [header, sep]

  for (const row of rows) {
    const freq = row.frequency >= 10 ? chalk.red(String(row.frequency)) : String(row.frequency)
    lines.push(
      `  ${row.element.padEnd(elemW)} ${row.type.padEnd(typeW)} ${row.category.padEnd(catW)} ${freq}`,
    )
  }

  return lines.join('\n')
}

// ─── formatCategoryBreakdown ──────────────────────────────────────────────────

/**
 * Format category summaries.
 *
 * @example
 * formatCategoryBreakdown(categories) // string
 */
export function formatCategoryBreakdown(categories: FrequencyCategory[]): string {
  if (categories.length === 0) return 'No categories found.'

  const lines: string[] = []
  for (const cat of categories) {
    lines.push(
      chalk.bold(cat.name) + chalk.gray(` (${cat.uniqueElements} unique, ${cat.totalOccurrences} total)`),
    )
    const top5 = cat.elements.slice(0, 5)
    for (const el of top5) {
      const bar = '█'.repeat(Math.min(el.frequency, 30))
      lines.push(`  ${el.element.padEnd(20)} ${chalk.cyan(bar)} ${el.frequency}`)
    }
    if (cat.elements.length > 5) {
      lines.push(chalk.gray(`  ... and ${cat.elements.length - 5} more`))
    }
  }

  return lines.join('\n')
}

// ─── formatStats ──────────────────────────────────────────────────────────────

/**
 * Format statistics summary.
 *
 * @example
 * formatStats(stats) // string
 */
export function formatStats(stats: FrequencyStats): string {
  const lines = [
    chalk.bold('Statistics'),
    `  Total elements:    ${stats.totalElements}`,
    `  Total occurrences: ${stats.totalOccurrences}`,
    `  Unique elements:   ${stats.uniqueElements}`,
    `  Average frequency: ${stats.averageFrequency}`,
    `  Most common:       ${stats.mostCommon}`,
    `  Least common:      ${stats.leastCommon}`,
    `  Diversity index:   ${stats.diversity}`,
  ]
  return lines.join('\n')
}

// ─── formatDiversityMeter ─────────────────────────────────────────────────────

/**
 * Visual diversity meter (0→1).
 *
 * @example
 * formatDiversityMeter(0.65) // string with bar
 */
export function formatDiversityMeter(diversity: number): string {
  const pct = Math.round(diversity * 100)
  const filled = Math.round(diversity * 20)
  const empty = 20 - filled
  const bar = '█'.repeat(filled) + '░'.repeat(empty)
  const color = diversity > 0.7 ? chalk.green : diversity > 0.4 ? chalk.yellow : chalk.red
  return `Diversity: ${color(bar)} ${pct}%`
}

// ─── formatRecommendations ────────────────────────────────────────────────────

/**
 * Format recommendations list.
 *
 * @example
 * formatRecommendations(['Fix X', 'Refactor Y']) // string
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.green('No recommendations.')
  const lines = [chalk.bold('Recommendations')]
  for (let i = 0; i < recs.length; i++) {
    lines.push(`  ${i + 1}. ${recs[i]}`)
  }
  return lines.join('\n')
}

// ─── formatResult ─────────────────────────────────────────────────────────────

/**
 * Format the full FrequencyResult for terminal output.
 *
 * @example
 * formatResult(result) // full output string
 */
export function formatResult(result: FrequencyResult): string {
  const sections: string[] = []

  sections.push(formatStats(result.stats))
  sections.push('')
  sections.push(formatDiversityMeter(result.stats.diversity))
  sections.push('')
  sections.push(chalk.bold('Top Frequencies'))
  sections.push(formatFrequencyTable(result.topFrequencies))
  sections.push('')
  sections.push(formatCategoryBreakdown(result.categories))
  sections.push('')
  sections.push(formatRecommendations(result.recommendations))

  return sections.join('\n')
}

// ─── formatJson ───────────────────────────────────────────────────────────────

/**
 * JSON output format.
 *
 * @example
 * formatJson(result) // JSON string
 */
export function formatJson(result: FrequencyResult): string {
  return JSON.stringify(result, null, 2)
}
