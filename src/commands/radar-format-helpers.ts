import chalk from 'chalk'
import type { RadarChart, RadarDimension, RadarStats, RadarResult } from './radar-helpers.js'

// ─── gradeColor ───────────────────────────────────────────────────────────────

/**
 * Colorize grade string.
 *
 * @example
 * gradeColor('A') // chalk.green('A')
 */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'A': return chalk.green(grade)
    case 'B': return chalk.blue(grade)
    case 'C': return chalk.yellow(grade)
    case 'D': return chalk.rgb(255, 165, 0)(grade)
    case 'F': return chalk.red(grade)
    default: return grade
  }
}

// ─── scoreBar ─────────────────────────────────────────────────────────────────

/**
 * Render 20-char score bar.
 *
 * @example
 * scoreBar(75) // '███████████████     '
 */
export function scoreBar(score: number): string {
  const filled = Math.round((score / 100) * 20)
  const empty = 20 - filled
  const bar = '█'.repeat(filled) + '░'.repeat(empty)
  if (score >= 80) return chalk.green(bar)
  if (score >= 65) return chalk.yellow(bar)
  if (score >= 50) return chalk.rgb(255, 165, 0)(bar)
  return chalk.red(bar)
}

// ─── formatDimensionTable ─────────────────────────────────────────────────────

/**
 * Format dimensions as scored table.
 *
 * @example
 * formatDimensionTable(dimensions) // tabular string
 */
export function formatDimensionTable(dimensions: RadarDimension[]): string {
  if (dimensions.length === 0) return '  (no dimensions)'

  const header = chalk.bold('  Dimension          Score  Bar                      Grade  Weight')
  const sep = chalk.gray('  ' + '─'.repeat(80))
  const rows = dimensions.map((d) => {
    const bar = scoreBar(d.score)
    return `  ${d.name.padEnd(19)} ${String(d.score).padStart(5)}  ${bar}  ${gradeColor(d.grade).padEnd(6)}  ${d.weight.toFixed(1)}`
  })

  return [header, sep, ...rows].join('\n')
}

// ─── formatRadarChart ─────────────────────────────────────────────────────────

/**
 * Format ASCII art chart lines.
 *
 * @example
 * formatRadarChart(asciiArt) // joined chart string
 */
export function formatRadarChart(asciiArt: string[]): string {
  return asciiArt.join('\n')
}

// ─── formatShape ──────────────────────────────────────────────────────────────

/**
 * Describe chart shape.
 *
 * @example
 * formatShape('balanced') // 'balanced — scores are evenly distributed'
 */
export function formatShape(shape: string): string {
  switch (shape) {
    case 'balanced': return `${chalk.green('balanced')} — scores are evenly distributed`
    case 'peaked': return `${chalk.cyan('peaked')} — one dimension dominates`
    case 'valleyed': return `${chalk.yellow('valleyed')} — one dimension is notably weak`
    case 'irregular': return `${chalk.red('irregular')} — scores vary significantly`
    default: return shape
  }
}

// ─── formatStrengthsWeaknesses ────────────────────────────────────────────────

/**
 * Format strengths and weaknesses.
 *
 * @example
 * formatStrengthsWeaknesses(chart) // 'Strengths: ...'
 */
export function formatStrengthsWeaknesses(chart: RadarChart): string {
  const str = chart.strengths.map((s) => chalk.green(s)).join(', ')
  const weak = chart.weaknesses.map((w) => chalk.red(w)).join(', ')
  return `${chalk.bold('Strengths:')} ${str}\n${chalk.bold('Weaknesses:')} ${weak}`
}

// ─── formatStats ──────────────────────────────────────────────────────────────

/**
 * Format stats summary.
 *
 * @example
 * formatStats(stats) // stat lines
 */
export function formatStats(stats: RadarStats): string {
  return [
    `${chalk.bold('Dimensions:')}        ${stats.totalDimensions}`,
    `${chalk.bold('Above 80:')}           ${stats.dimensionsAbove80}`,
    `${chalk.bold('Below 50:')}           ${stats.dimensionsBelow50}`,
    `${chalk.bold('Std Deviation:')}      ${stats.standardDeviation}`,
    `${chalk.bold('Balance Score:')}      ${stats.balanceScore}/100`,
  ].join('\n')
}

// ─── formatRecommendations ────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatRecommendations(recs) // bullet list
 */
export function formatRecommendations(recs: string[]): string {
  return recs.map((r) => `  ${chalk.yellow('•')} ${r}`).join('\n')
}

// ─── formatRadarOutput ────────────────────────────────────────────────────────

/**
 * Format full radar result for terminal.
 *
 * @example
 * formatRadarOutput(result) // full output string
 */
export function formatRadarOutput(result: RadarResult): string {
  const sections: string[] = []
  const chart = result.chart

  sections.push(chalk.bold.cyan('\n🎯 Overall Score'))
  sections.push(`  ${chalk.bold(String(chart.overall))}/100 ${gradeColor(chart.overallGrade)}`)

  sections.push(chalk.bold.cyan('\n📊 ASCII Radar Chart'))
  sections.push(formatRadarChart(result.asciiArt))

  sections.push(chalk.bold.cyan('\n📐 Dimension Scores'))
  sections.push(formatDimensionTable(chart.dimensions))

  sections.push(chalk.bold.cyan('\n🔺 Shape Analysis'))
  sections.push(`  ${formatShape(chart.shape)}`)

  sections.push(chalk.bold.cyan('\n💪 Strengths & Weaknesses'))
  sections.push(formatStrengthsWeaknesses(chart))

  sections.push(chalk.bold.cyan('\n📈 Statistics'))
  sections.push(formatStats(result.stats))

  sections.push(chalk.bold.cyan('\n💡 Recommendations'))
  sections.push(formatRecommendations(result.recommendations))

  return sections.join('\n')
}

// ─── formatRadarJson ──────────────────────────────────────────────────────────

/**
 * Format radar result as JSON.
 *
 * @example
 * formatRadarJson(result) // JSON string
 */
export function formatRadarJson(result: RadarResult): string {
  const serializable = {
    overall: result.chart.overall,
    overallGrade: result.chart.overallGrade,
    shape: result.chart.shape,
    strengths: result.chart.strengths,
    weaknesses: result.chart.weaknesses,
    dimensions: result.chart.dimensions.map((d) => ({
      name: d.name, score: d.score, grade: d.grade, weight: d.weight, findings: d.findings,
    })),
    stats: result.stats,
    recommendations: result.recommendations,
  }
  return JSON.stringify(serializable, null, 2)
}
