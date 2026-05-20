import chalk from 'chalk'

import type {
  DecoderResult,
  DecoderStats,
  ReadabilityDimensions,
  ReadabilityIssue,
  ReadabilityScore,
} from './decoder-helpers.js'

// ─── Grade Colors ─────────────────────────────────────────────────────────────

const GRADE_COLORS: Record<string, (t: string) => string> = {
  A: chalk.green,
  B: chalk.rgb(76, 175, 80),
  C: chalk.rgb(255, 193, 7),
  D: chalk.rgb(255, 152, 0),
  F: chalk.rgb(244, 67, 54),
}

/**
 * Get grade color function.
 *
 * @example
 * getGradeColor('A')
 */
export function getGradeColor(grade: string): (t: string) => string {
  return GRADE_COLORS[grade] ?? chalk.white
}

/**
 * Format grade badge.
 *
 * @example
 * formatGradeBadge('A')
 */
export function formatGradeBadge(grade: string): string {
  const fn = getGradeColor(grade)
  return fn(`[${grade}]`)
}

// ─── Readability Meter ────────────────────────────────────────────────────────

/**
 * Format readability meter.
 *
 * @example
 * formatReadabilityMeter(85)
 */
export function formatReadabilityMeter(score: number): string {
  const filled = Math.round(score / 5)
  const empty = 20 - filled
  let colorFn: (t: string) => string
  if (score >= 80) colorFn = chalk.green
  else if (score >= 60) colorFn = chalk.rgb(255, 193, 7)
  else colorFn = chalk.rgb(244, 67, 54)
  const bar = colorFn('█'.repeat(Math.max(filled, 0)) + '░'.repeat(Math.max(empty, 0)))
  return `${bar} ${score}/100`
}

// ─── Dimension Radar ──────────────────────────────────────────────────────────

/**
 * Format dimension radar as ASCII bars.
 *
 * @example
 * formatDimensionRadar(dimensions)
 */
export function formatDimensionRadar(dimensions: ReadabilityDimensions): string {
  const lines: string[] = []
  const dimEntries: [string, number][] = [
    ['Naming', dimensions.naming],
    ['Structure', dimensions.structure],
    ['Cognitive', dimensions.cognitive],
    ['Docs', dimensions.documentation],
    ['Consistency', dimensions.consistency],
    ['Simplicity', dimensions.simplicity],
  ]

  for (const [label, value] of dimEntries) {
    const barLen = Math.round(value / 5)
    const empty = 20 - barLen
    let colorFn: (t: string) => string
    if (value >= 80) colorFn = chalk.green
    else if (value >= 60) colorFn = chalk.rgb(255, 193, 7)
    else colorFn = chalk.rgb(244, 67, 54)
    const bar = colorFn('█'.repeat(Math.max(barLen, 0)) + '░'.repeat(Math.max(empty, 0)))
    lines.push(`  ${label.padEnd(12)} ${bar} ${String(value).padStart(3)}`)
  }

  return lines.join('\n')
}

// ─── Severity Badge ───────────────────────────────────────────────────────────

/**
 * Format severity badge.
 *
 * @example
 * formatSeverityBadge('high')
 */
export function formatSeverityBadge(severity: ReadabilityIssue['severity']): string {
  const colors: Record<string, (t: string) => string> = {
    low: chalk.rgb(158, 158, 158),
    medium: chalk.rgb(255, 193, 7),
    high: chalk.rgb(244, 67, 54),
  }
  const fn = colors[severity] ?? chalk.white
  return fn(`[${severity.toUpperCase()}]`)
}

// ─── Score Table ──────────────────────────────────────────────────────────────

/**
 * Format score table.
 *
 * @example
 * formatScoreTable(scores)
 */
export function formatScoreTable(scores: ReadabilityScore[]): string {
  if (scores.length === 0) return chalk.dim('  No files scored.')
  const lines: string[] = []
  lines.push(chalk.bold('  Readability Scores:'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────────────────'))
  lines.push(chalk.gray('  File                         Grade  Score  Naming  Struct  Cogn   Docs  Const  Simpl'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────────────────'))

  const sorted = [...scores].sort((a, b) => a.overall - b.overall)
  for (const s of sorted) {
    const badge = formatGradeBadge(s.grade)
    const name = s.file.length > 28 ? '...' + s.file.slice(-25) : s.file
    lines.push(
      `  ${name.padEnd(29)} ${badge}  ${String(s.overall).padStart(3)}    ${String(s.dimensions.naming).padStart(3)}    ${String(s.dimensions.structure).padStart(3)}    ${String(s.dimensions.cognitive).padStart(3)}    ${String(s.dimensions.documentation).padStart(3)}    ${String(s.dimensions.consistency).padStart(3)}    ${String(s.dimensions.simplicity).padStart(3)}`,
    )
  }

  lines.push(chalk.gray('  ────────────────────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Issue List ───────────────────────────────────────────────────────────────

/**
 * Format issues list.
 *
 * @example
 * formatIssueList(issues)
 */
export function formatIssueList(issues: ReadabilityIssue[]): string {
  if (issues.length === 0) return chalk.dim('  No readability issues found.')
  const lines: string[] = []
  lines.push(chalk.bold('  Issues:'))
  lines.push(chalk.gray('  ───────────────────────────────────────────────────'))

  const sorted = [...issues].sort((a, b) => {
    const sevOrder = { high: 0, medium: 1, low: 2 }
    return (sevOrder[a.severity] ?? 2) - (sevOrder[b.severity] ?? 2)
  })

  const shown = sorted.slice(0, 20)
  for (const issue of shown) {
    const badge = formatSeverityBadge(issue.severity)
    lines.push(`  ${badge} ${issue.file}:${issue.line}`)
    lines.push(`    ${issue.dimension}: ${issue.message}`)
    lines.push(`    ${chalk.dim(`→ ${issue.suggestion}`)}`)
  }

  if (sorted.length > 20) {
    lines.push(chalk.dim(`  ... and ${sorted.length - 20} more issues`))
  }

  lines.push(chalk.gray('  ───────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Grade Distribution ───────────────────────────────────────────────────────

/**
 * Format grade distribution chart.
 *
 * @example
 * formatGradeDistribution({ A: 3, B: 5, C: 2 })
 */
export function formatGradeDistribution(distribution: Record<string, number>): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Grade Distribution:'))
  lines.push(chalk.gray('  ──────────────────────────'))

  const grades = ['A', 'B', 'C', 'D', 'F']
  const maxCount = Math.max(...Object.values(distribution), 1)

  for (const grade of grades) {
    const count = distribution[grade] ?? 0
    const barLen = Math.round((count / maxCount) * 20)
    const fn = getGradeColor(grade)
    const bar = fn('█'.repeat(Math.max(barLen, 0)))
    lines.push(`  ${fn(grade)}  ${bar} ${count}`)
  }

  lines.push(chalk.gray('  ──────────────────────────'))
  return lines.join('\n')
}

// ─── Stats ────────────────────────────────────────────────────────────────────

/**
 * Format decoder stats.
 *
 * @example
 * formatDecoderStats(stats)
 */
export function formatDecoderStats(stats: DecoderStats): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Decoder Stats:'))
  lines.push(chalk.gray('  ──────────────────────────────────────────'))
  lines.push(`  Average readability: ${formatReadabilityMeter(stats.averageReadability)}`)
  lines.push(`  Weakest dimension: ${chalk.rgb(244, 67, 54)(stats.weakestDimension)}`)
  lines.push(`  Strongest dimension: ${chalk.green(stats.strongestDimension)}`)
  if (stats.mostReadableFile) {
    lines.push(`  Most readable: ${chalk.green(stats.mostReadableFile)}`)
  }
  if (stats.leastReadableFile) {
    lines.push(`  Least readable: ${chalk.rgb(244, 67, 54)(stats.leastReadableFile)}`)
  }
  lines.push(`  Total issues: ${stats.totalIssues} (${stats.highSeverityIssues} high severity)`)
  const trendColors: Record<string, (t: string) => string> = {
    improving: chalk.green,
    stable: chalk.rgb(255, 193, 7),
    declining: chalk.rgb(244, 67, 54),
  }
  const trendFn = trendColors[stats.readabilityTrend] ?? chalk.white
  lines.push(`  Trend: ${trendFn(stats.readabilityTrend)}`)
  lines.push(chalk.gray('  ──────────────────────────────────────────'))
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
 * Format full decoder table.
 *
 * @example
 * formatDecoderTable(result)
 */
export function formatDecoderTable(result: DecoderResult): string {
  const sections: string[] = []
  sections.push('')
  sections.push(chalk.bold('  Code Readability Decoder\n'))
  sections.push(formatReadabilityMeter(result.stats.averageReadability))
  sections.push('')
  sections.push(formatScoreTable(result.scores))
  sections.push('')
  sections.push(formatGradeDistribution(result.stats.gradeDistribution))
  sections.push('')

  if (result.scores.length > 0) {
    sections.push(chalk.bold('  Dimension Overview (average):'))
    sections.push(formatDimensionRadar({
      naming: Math.round(result.scores.reduce((s, sc) => s + sc.dimensions.naming, 0) / result.scores.length),
      structure: Math.round(result.scores.reduce((s, sc) => s + sc.dimensions.structure, 0) / result.scores.length),
      cognitive: Math.round(result.scores.reduce((s, sc) => s + sc.dimensions.cognitive, 0) / result.scores.length),
      documentation: Math.round(result.scores.reduce((s, sc) => s + sc.dimensions.documentation, 0) / result.scores.length),
      consistency: Math.round(result.scores.reduce((s, sc) => s + sc.dimensions.consistency, 0) / result.scores.length),
      simplicity: Math.round(result.scores.reduce((s, sc) => s + sc.dimensions.simplicity, 0) / result.scores.length),
    }))
    sections.push('')
  }

  const allIssues = result.scores.flatMap((s) => s.issues)
  sections.push(formatIssueList(allIssues))
  sections.push('')
  sections.push(formatDecoderStats(result.stats))
  sections.push('')
  sections.push(formatRecommendations(result.recommendations))
  sections.push('')
  return sections.join('\n')
}

/**
 * Format decoder result as JSON.
 *
 * @example
 * formatDecoderJSON(result)
 */
export function formatDecoderJSON(result: DecoderResult): string {
  return JSON.stringify(result, null, 2)
}
