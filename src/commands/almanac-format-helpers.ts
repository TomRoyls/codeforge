import chalk from 'chalk'

import type {
  AlmanacResult,
  AlmanacStats,
  Prediction,
  Rhythm,
  Season,
} from './almanac-helpers.js'
import { DAY_NAMES, MONTH_NAMES, formatHour } from './almanac-helpers.js'

// ─── Season Colors ────────────────────────────────────────────────────────────

const SEASON_TYPE_COLORS: Record<string, (t: string) => string> = {
  harvest: (t) => chalk.rgb(255, 193, 7)(t),
  fallow: (t) => chalk.rgb(158, 158, 158)(t),
  planting: (t) => chalk.rgb(76, 175, 80)(t),
  storage: (t) => chalk.rgb(33, 150, 243)(t),
}

/**
 * Get season type color function.
 *
 * @example
 * getSeasonColor('harvest')
 */
export function getSeasonColor(type: string): (t: string) => string {
  return SEASON_TYPE_COLORS[type] ?? chalk.white
}

/**
 * Extract season type from season name.
 *
 * @example
 * extractSeasonType('Summer Harvest Season')
 */
export function extractSeasonType(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes('harvest')) return 'harvest'
  if (lower.includes('fallow')) return 'fallow'
  if (lower.includes('planting')) return 'planting'
  if (lower.includes('storage')) return 'storage'
  return 'fallow'
}

// ─── Action Badge ─────────────────────────────────────────────────────────────

const ACTION_COLORS: Record<string, (t: string) => string> = {
  feature: (t) => chalk.rgb(76, 175, 80)(t),
  fix: (t) => chalk.rgb(244, 67, 54)(t),
  refactor: (t) => chalk.rgb(255, 152, 0)(t),
  test: (t) => chalk.rgb(33, 150, 243)(t),
  docs: (t) => chalk.rgb(121, 85, 72)(t),
  chore: (t) => chalk.rgb(158, 158, 158)(t),
}

/**
 * Format action badge.
 *
 * @example
 * formatActionBadge('feature')
 */
export function formatActionBadge(action: string): string {
  const fn = ACTION_COLORS[action] ?? chalk.white
  return fn(`[${action.toUpperCase()}]`)
}

// ─── Confidence Meter ─────────────────────────────────────────────────────────

/**
 * Format confidence meter.
 *
 * @example
 * formatConfidenceMeter(75)
 */
export function formatConfidenceMeter(confidence: number): string {
  const filled = Math.round(confidence / 5)
  const empty = 20 - filled
  let colorFn: (t: string) => string
  if (confidence >= 70) colorFn = chalk.green
  else if (confidence >= 40) colorFn = chalk.rgb(255, 193, 7)
  else colorFn = chalk.rgb(244, 67, 54)
  const bar = colorFn('█'.repeat(Math.max(filled, 0)) + '░'.repeat(Math.max(empty, 0)))
  return `${bar} ${confidence}%`
}

// ─── Activity Heat Map ────────────────────────────────────────────────────────

/**
 * Format monthly activity map.
 *
 * @example
 * formatActivityMap(commitsByMonth)
 */
export function formatActivityMap(commitsByMonth: number[]): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Monthly Activity Map:'))
  lines.push(chalk.gray('  ──────────────────────────────────────'))

  const max = Math.max(...commitsByMonth, 1)

  for (let m = 0; m < 12; m++) {
    const count = commitsByMonth[m] ?? 0
    const barLen = Math.round((count / max) * 25)
    let barColor: (t: string) => string
    if (count >= max * 0.75) barColor = chalk.rgb(76, 175, 80)
    else if (count >= max * 0.5) barColor = chalk.rgb(255, 193, 7)
    else if (count >= max * 0.25) barColor = chalk.rgb(255, 152, 0)
    else barColor = chalk.rgb(244, 67, 54)

    const label = MONTH_NAMES[m]!.padEnd(10)
    const bar = barColor('█'.repeat(Math.max(barLen, 0)))
    lines.push(`  ${label} ${bar} ${String(count).padStart(4)}`)
  }

  lines.push(chalk.gray('  ──────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Weekly Rhythm Chart ──────────────────────────────────────────────────────

/**
 * Format weekly rhythm chart.
 *
 * @example
 * formatWeeklyChart(commitsByDayOfWeek)
 */
export function formatWeeklyChart(commitsByDayOfWeek: number[]): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Weekly Rhythm:'))
  lines.push(chalk.gray('  ──────────────────────────────────────'))

  const max = Math.max(...commitsByDayOfWeek, 1)

  for (let d = 0; d < 7; d++) {
    const count = commitsByDayOfWeek[d] ?? 0
    const barLen = Math.round((count / max) * 20)
    const bar = chalk.cyan('█'.repeat(Math.max(barLen, 0)))
    const label = DAY_NAMES[d]!.slice(0, 3).padEnd(4)
    lines.push(`  ${label} ${bar} ${count}`)
  }

  lines.push(chalk.gray('  ──────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Hourly Rhythm Chart ──────────────────────────────────────────────────────

/**
 * Format hourly rhythm chart.
 *
 * @example
 * formatHourlyChart(commitsByHour)
 */
export function formatHourlyChart(commitsByHour: number[]): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Daily Rhythm:'))
  lines.push(chalk.gray('  ──────────────────────────────────────'))

  const max = Math.max(...commitsByHour, 1)

  for (let h = 0; h < 24; h++) {
    const count = commitsByHour[h] ?? 0
    const barLen = Math.round((count / max) * 20)
    const bar = chalk.magenta('█'.repeat(Math.max(barLen, 0)))
    const hourLabel = formatHour(h).padStart(5)
    lines.push(`  ${hourLabel} ${bar} ${count}`)
  }

  lines.push(chalk.gray('  ──────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Season Table ─────────────────────────────────────────────────────────────

/**
 * Format season table.
 *
 * @example
 * formatSeasonTable(seasons)
 */
export function formatSeasonTable(seasons: Season[]): string {
  if (seasons.length === 0) return chalk.dim('  No seasons detected.')
  const lines: string[] = []
  lines.push(chalk.bold('  Development Seasons:'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────────────────'))

  for (const season of seasons) {
    const type = extractSeasonType(season.name)
    const colorFn = getSeasonColor(type)
    const badge = formatActionBadge(season.dominantAction)
    const monthLabels = season.months.map((m) => MONTH_NAMES[m]!.slice(0, 3)).join(', ')
    lines.push(`  ${colorFn(season.name.padEnd(30))} ${badge}`)
    lines.push(`    Months: ${monthLabels} | Commits: ${season.commitCount} | Avg changes: ${season.avgChangesPerCommit}`)
    if (season.characteristics.length > 0) {
      lines.push(`    ${chalk.dim(season.characteristics.join(' · '))}`)
    }
  }

  lines.push(chalk.gray('  ────────────────────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Rhythm Summary ───────────────────────────────────────────────────────────

/**
 * Format rhythm summary.
 *
 * @example
 * formatRhythmSummary(rhythms)
 */
export function formatRhythmSummary(rhythms: Rhythm[]): string {
  if (rhythms.length === 0) return chalk.dim('  No rhythms detected.')
  const lines: string[] = []
  lines.push(chalk.bold('  Development Rhythms:'))
  lines.push(chalk.gray('  ───────────────────────────────────────────────────'))

  const typeLabels: Record<string, string> = {
    daily: '⏰',
    weekly: '📅',
    monthly: '🗓️',
    quarterly: '📊',
  }

  for (const rhythm of rhythms) {
    const icon = typeLabels[rhythm.type] ?? '•'
    lines.push(`  ${icon} ${rhythm.type.padEnd(10)} ${formatConfidenceMeter(rhythm.consistency)}`)
    lines.push(`    ${rhythm.description}`)
  }

  lines.push(chalk.gray('  ───────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Prediction Cards ─────────────────────────────────────────────────────────

/**
 * Format prediction cards.
 *
 * @example
 * formatPredictionCards(predictions)
 */
export function formatPredictionCards(predictions: Prediction[]): string {
  if (predictions.length === 0) return chalk.dim('  No predictions available.')
  const lines: string[] = []
  lines.push(chalk.bold('  Predictions:'))
  lines.push(chalk.gray('  ───────────────────────────────────────────────────'))

  for (const pred of predictions) {
    const confColor = pred.confidence >= 70 ? chalk.green : pred.confidence >= 40 ? chalk.yellow : chalk.dim
    lines.push(`  ${chalk.cyan(`[${pred.category.padEnd(12)}]`)} ${confColor(`${pred.confidence}%`)}`)
    lines.push(`    ${pred.prediction}`)
    lines.push(`    ${chalk.dim(`Based on: ${pred.basedOn}`)}`)
  }

  lines.push(chalk.gray('  ───────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Stats ────────────────────────────────────────────────────────────────────

/**
 * Format almanac stats.
 *
 * @example
 * formatAlmanacStats(stats)
 */
export function formatAlmanacStats(stats: AlmanacStats): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Almanac Stats:'))
  lines.push(chalk.gray('  ──────────────────────────────────────'))
  lines.push(`  Total commits: ${stats.totalCommits}`)
  lines.push(`  Most active day: ${chalk.green(stats.mostActiveDay)}`)
  lines.push(`  Peak hour: ${chalk.green(stats.mostActiveHour)}`)
  lines.push(`  Most active month: ${chalk.green(stats.mostActiveMonth)}`)
  lines.push(`  Avg commits/day: ${stats.avgCommitsPerDay}`)
  lines.push(`  Busiest season: ${chalk.rgb(255, 193, 7)(stats.busiestSeason)}`)
  lines.push(`  Quietest season: ${chalk.rgb(158, 158, 158)(stats.quietestSeason)}`)
  lines.push(chalk.gray('  ──────────────────────────────────────'))
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
 * Format full almanac table.
 *
 * @example
 * formatAlmanacTable(result)
 */
export function formatAlmanacTable(result: AlmanacResult): string {
  const sections: string[] = []
  sections.push('')
  sections.push(chalk.bold('  Code Almanac — Seasonal Development Patterns\n'))
  sections.push(formatActivityMap(result.stats.commitsByMonth))
  sections.push('')
  sections.push(formatSeasonTable(result.seasons))
  sections.push('')
  sections.push(formatWeeklyChart(result.stats.commitsByDayOfWeek))
  sections.push('')
  sections.push(formatHourlyChart(result.stats.commitsByHour))
  sections.push('')
  sections.push(formatRhythmSummary(result.rhythms))
  sections.push('')
  sections.push(formatPredictionCards(result.predictions))
  sections.push('')
  sections.push(formatAlmanacStats(result.stats))
  sections.push('')
  sections.push(formatRecommendations(result.recommendations))
  sections.push('')
  return sections.join('\n')
}

/**
 * Format almanac as JSON.
 *
 * @example
 * formatAlmanacJSON(result)
 */
export function formatAlmanacJSON(result: AlmanacResult): string {
  return JSON.stringify(result, null, 2)
}
