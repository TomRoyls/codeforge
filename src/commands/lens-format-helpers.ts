import chalk from 'chalk'

import type { LensResult, LensStats, LensView } from './lens-helpers.js'

// ─── Lens Selector ─────────────────────────────────────────────────────────────

/**
 * Format lens selector.
 *
 * @example
 * formatLensSelector(views)
 */
export function formatLensSelector(views: LensView[]): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Lens Selector'))
  lines.push(chalk.gray('  ─'.repeat(40)))

  for (const view of views) {
    const avg = String(view.avgScore).padStart(3)
    const dist = view.distribution.padEnd(8)
    const bar = '█'.repeat(Math.round(view.avgScore / 5))
    lines.push(`  ${chalk.bold(view.lens.name.padEnd(14))} avg:${avg}  ${chalk.rgb(0, 188, 212)(bar.padEnd(20))} ${chalk.gray(dist)}`)
    lines.push(chalk.gray(`    focus: ${view.lens.focus}`))
  }

  return lines.join('\n')
}

// ─── Focus Results Table ───────────────────────────────────────────────────────

/**
 * Format focus results for a single lens.
 *
 * @example
 * formatFocusResults(view)
 */
export function formatFocusResults(view: LensView): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)(`\n  ${view.lens.name} Lens Results`))
  lines.push(chalk.gray('  ─'.repeat(60)))
  lines.push(chalk.gray('  File                          Score  Rank  Sharpness'))
  lines.push(chalk.gray('  ' + '─'.repeat(58)))

  const sorted = [...view.results].sort((a, b) => b.score - a.score)
  for (const r of sorted.slice(0, 15)) {
    const file = r.file.padEnd(28).slice(0, 28)
    const score = String(r.score).padStart(5)
    const rank = String(r.rank).padStart(4)
    const sharp = String(r.sharpness).padStart(10)
    const scoreColor = r.score >= 70 ? chalk.rgb(76, 175, 80) : r.score >= 40 ? chalk.rgb(255, 193, 7) : chalk.rgb(244, 67, 54)
    lines.push(`  ${file} ${scoreColor(score)} ${rank} ${sharp}`)
    if (r.highlights.length > 0) {
      lines.push(chalk.gray(`    highlights: ${r.highlights.join(', ')}`))
    }
  }

  if (view.results.length > 15) {
    lines.push(chalk.gray(`  ... and ${view.results.length - 15} more`))
  }

  return lines.join('\n')
}

// ─── Top/Bottom Focus ──────────────────────────────────────────────────────────

/**
 * Format top and bottom focus files.
 *
 * @example
 * formatTopBottom(view)
 */
export function formatTopBottom(view: LensView): string {
  const lines: string[] = []

  if (view.topFocus.length > 0) {
    lines.push(chalk.rgb(76, 175, 80)(`  Top ${view.lens.name}:`))
    for (const f of view.topFocus) {
      lines.push(chalk.rgb(76, 175, 80)(`    ✓ ${f}`))
    }
  }

  if (view.bottomFocus.length > 0) {
    lines.push(chalk.rgb(244, 67, 54)(`  Bottom ${view.lens.name}:`))
    for (const f of view.bottomFocus) {
      lines.push(chalk.rgb(244, 67, 54)(`    ✗ ${f}`))
    }
  }

  return lines.join('\n')
}

// ─── Distribution Chart ────────────────────────────────────────────────────────

/**
 * Format ASCII distribution chart.
 *
 * @example
 * formatDistributionChart([10, 20, 30, 40, 50])
 */
export function formatDistributionChart(scores: number[]): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Score Distribution'))
  lines.push(chalk.gray('  ─'.repeat(40)))

  const buckets: string[] = ['0-19', '20-39', '40-59', '60-79', '80-100']
  const counts = [0, 0, 0, 0, 0]
  for (const s of scores) {
    const idx = Math.min(4, Math.floor(s / 20))
    counts[idx] = (counts[idx] ?? 0) + 1
  }

  const maxCount = Math.max(...counts, 1)
  for (let i = 0; i < 5; i++) {
    const label = (buckets[i] ?? '').padEnd(7)
    const barLen = Math.round(((counts[i] ?? 0) / maxCount) * 20)
    const bar = '█'.repeat(barLen)
    const count = String(counts[i]).padStart(3)
    lines.push(`  ${label} ${chalk.rgb(0, 188, 212)(bar)} ${count}`)
  }

  return lines.join('\n')
}

// ─── Clarity Meter ─────────────────────────────────────────────────────────────

/**
 * Format clarity meter.
 *
 * @example
 * formatClarityMeter(75)
 */
export function formatClarityMeter(clarity: number): string {
  const filled = Math.round(clarity / 5)
  const bar = '█'.repeat(filled) + '░'.repeat(20 - filled)
  const color = clarity >= 70 ? chalk.rgb(76, 175, 80) : clarity >= 40 ? chalk.rgb(255, 193, 7) : chalk.rgb(244, 67, 54)
  return `  Clarity: ${color(bar)} ${clarity}%`
}

// ─── Consistency/Polarization ──────────────────────────────────────────────────

/**
 * Format consistency and polarization indicators.
 *
 * @example
 * formatConsistencyPolarization(stats)
 */
export function formatConsistencyPolarization(stats: LensStats): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Consistency & Polarization'))
  lines.push(chalk.gray('  ─'.repeat(40)))
  lines.push(`  Most Consistent:  ${chalk.rgb(76, 175, 80)(stats.mostConsistent || 'N/A')}`)
  lines.push(`  Most Polarizing:  ${chalk.rgb(244, 67, 54)(stats.mostPolarizing || 'N/A')}`)
  lines.push(`  Best Overall:     ${chalk.rgb(33, 150, 243)(stats.bestOverallFile || 'N/A')}`)
  lines.push(`  Worst Overall:    ${chalk.rgb(255, 152, 0)(stats.worstOverallFile || 'N/A')}`)
  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatLensRecommendations(['Improve testing'])
 */
export function formatLensRecommendations(recs: string[]): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Recommendations'))
  lines.push(chalk.gray('  ─'.repeat(50)))
  for (const rec of recs) {
    lines.push(`  → ${rec}`)
  }
  return lines.join('\n')
}

// ─── JSON Format ───────────────────────────────────────────────────────────────

/**
 * Format lens result as JSON.
 *
 * @example
 * formatLensJson(result)
 */
export function formatLensJson(result: LensResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Format ──────────────────────────────────────────────────────────────

/**
 * Format lens result as table.
 *
 * @example
 * formatLensTable(result)
 */
export function formatLensTable(result: LensResult): string {
  const parts: string[] = []

  parts.push(formatLensSelector(result.views))

  for (const view of result.views) {
    parts.push(formatFocusResults(view))
  }

  const allScores = result.views.flatMap((v) => v.results.map((r) => r.score))
  parts.push(formatDistributionChart(allScores))
  parts.push(formatClarityMeter(result.stats.overallClarity))
  parts.push(formatConsistencyPolarization(result.stats))
  parts.push(formatLensRecommendations(result.recommendations))

  return parts.join('\n')
}
