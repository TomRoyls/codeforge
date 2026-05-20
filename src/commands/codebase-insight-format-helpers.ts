import chalk from 'chalk'

import type { Correlation, Dimension, Insight, InsightCategory, InsightStats, CodebaseInsightResult } from './codebase-insight-helpers.js'

// ─── Category Display ──────────────────────────────────────────────────────────

const categoryIcon: Record<InsightCategory, string> = {
  surprising: '\u{1F9E0}',
  'hidden-pattern': '\u{1F50D}',
  correlation: '\u{1F4CA}',
  paradox: '\u{1F300}',
  opportunity: '\u{1F680}',
  warning: '\u26A0\uFE0F',
}

const categoryColor: Record<InsightCategory, (s: string) => string> = {
  surprising: (s: string) => chalk.rgb(255, 165, 0)(s),
  'hidden-pattern': (s: string) => chalk.rgb(100, 149, 237)(s),
  correlation: (s: string) => chalk.rgb(50, 205, 50)(s),
  paradox: (s: string) => chalk.rgb(186, 85, 211)(s),
  opportunity: (s: string) => chalk.rgb(0, 206, 209)(s),
  warning: (s: string) => chalk.rgb(255, 50, 50)(s),
}

function buildBar(value: number, width = 10): string {
  const filled = Math.round(value / (100 / width))
  const empty = width - filled
  return '\u2588'.repeat(Math.max(filled, 0)) + '\u2591'.repeat(Math.max(empty, 0))
}

// ─── Insight Cards ─────────────────────────────────────────────────────────────

/**
 * Format insight cards.
 *
 * @example
 * formatInsightCards(insights)
 */
export function formatInsightCards(insights: Insight[]): string {
  if (insights.length === 0) return '  No insights discovered\n'

  const lines: string[] = []
  lines.push('  ────────────────────────────────────────────────────')
  lines.push('  Insight Cards')
  lines.push('  ────────────────────────────────────────────────────')

  for (const insight of insights.slice(0, 10)) {
    const icon = categoryIcon[insight.category] ?? '\u{1F4CB}'
    const color = categoryColor[insight.category] ?? chalk.white
    const confBar = buildBar(insight.confidence)
    const impactBar = buildBar(insight.impact)

    lines.push(`  ${icon} ${chalk.bold(insight.title)}`)
    lines.push(`    ${color(insight.category)} | confidence: ${confBar} ${insight.confidence}% | impact: ${impactBar} ${insight.impact}%`)
    lines.push(`    ${insight.description}`)
    for (const ev of insight.evidence.slice(0, 3)) {
      lines.push(`    \u2022 ${ev}`)
    }
    for (const action of insight.actionItems.slice(0, 2)) {
      lines.push(`    \u2192 ${action}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

// ─── Correlation Matrix ────────────────────────────────────────────────────────

/**
 * Format correlation findings.
 *
 * @example
 * formatCorrelations(correlations)
 */
export function formatCorrelations(correlations: Correlation[]): string {
  if (correlations.length === 0) return '  No correlations found\n'

  const lines: string[] = []
  lines.push('  ────────────────────────────────────────────────────')
  lines.push('  Correlations')
  lines.push('  ────────────────────────────────────────────────────')

  for (const c of correlations) {
    const strength = Math.abs(c.strength)
    const color = strength >= 70 ? chalk.rgb(50, 205, 50) : strength >= 40 ? chalk.rgb(255, 180, 0) : chalk.rgb(180, 180, 180)
    const marker = c.surprising ? ' \u{1F9E0}' : ''
    lines.push(`  ${color(`${c.dimensionA.padEnd(15)} \u2194 ${c.dimensionB.padEnd(15)} ${c.strength >= 0 ? '+' : ''}${c.strength}%`)}${marker}`)
  }

  return lines.join('\n')
}

// ─── Dimension Radar ───────────────────────────────────────────────────────────

/**
 * Format dimension overview.
 *
 * @example
 * formatDimensions(dimensions)
 */
export function formatDimensions(dimensions: Dimension[]): string {
  if (dimensions.length === 0) return '  No dimensions measured\n'

  const lines: string[] = []
  lines.push('  ────────────────────────────────────────────────────')
  lines.push('  Dimension Radar')
  lines.push('  ────────────────────────────────────────────────────')

  for (const dim of dimensions) {
    const bar = buildBar(dim.value)
    const color = dim.value >= 60 ? chalk.rgb(50, 205, 50) : dim.value >= 30 ? chalk.rgb(255, 180, 0) : chalk.rgb(255, 50, 50)
    lines.push(`  ${dim.name.padEnd(15)} ${color(`${bar} ${dim.value}%`)}`)
  }

  return lines.join('\n')
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

/**
 * Format insight stats.
 *
 * @example
 * formatInsightStats(stats)
 */
export function formatInsightStats(stats: InsightStats): string {
  const bar = buildBar(stats.wisdomScore)
  const wisdomColor = stats.wisdomScore >= 60 ? chalk.rgb(50, 205, 50) : stats.wisdomScore >= 30 ? chalk.rgb(255, 180, 0) : chalk.rgb(255, 50, 50)

  const lines: string[] = []
  lines.push('  ────────────────────────────────────────────────────')
  lines.push('  Insight Stats')
  lines.push('  ────────────────────────────────────────────────────')
  lines.push(`  Total Insights:      ${stats.totalInsights}`)
  lines.push(`  Surprising:          ${stats.surprisingCount}`)
  lines.push(`  Hidden Patterns:     ${stats.hiddenPatternCount}`)
  lines.push(`  Correlations:        ${stats.correlationCount}`)
  lines.push(`  Strong Correlations: ${stats.strongCorrelations}`)
  lines.push(`  Wisdom Score:        ${wisdomColor(`${bar} ${stats.wisdomScore}%`)}`)
  lines.push(`  Deepest Insight:     ${stats.deepestInsight}`)
  lines.push(`  Blind Spots:         ${stats.blindSpots}`)
  return lines.join('\n')
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatInsightRecommendations(recs)
 */
export function formatInsightRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return '  No recommendations\n'

  const lines: string[] = []
  lines.push('  ────────────────────────────────────────────────────')
  lines.push('  Recommendations')
  lines.push('  ────────────────────────────────────────────────────')

  for (let i = 0; i < recommendations.length; i++) {
    lines.push(`  ${i + 1}. ${recommendations[i]}`)
  }

  return lines.join('\n')
}

// ─── Full Table ────────────────────────────────────────────────────────────────

/**
 * Format complete insight result as table.
 *
 * @example
 * formatInsightTable(result)
 */
export function formatInsightTable(result: CodebaseInsightResult): string {
  const parts: string[] = []
  parts.push(formatInsightCards(result.insights))
  parts.push('')
  parts.push(formatCorrelations(result.correlations))
  parts.push('')
  parts.push(formatDimensions(result.dimensions))
  parts.push('')
  parts.push(formatInsightStats(result.stats))
  parts.push('')
  parts.push(formatInsightRecommendations(result.recommendations))
  return parts.join('\n')
}

// ─── JSON ──────────────────────────────────────────────────────────────────────

/**
 * Format insight result as JSON.
 *
 * @example
 * formatInsightJSON(result)
 */
export function formatInsightJSON(result: CodebaseInsightResult): string {
  const serializable = {
    ...result,
    dimensions: result.dimensions.map((d) => ({
      name: d.name,
      value: d.value,
      files: Object.fromEntries(d.files),
    })),
  }
  return JSON.stringify(serializable, null, 2)
}
