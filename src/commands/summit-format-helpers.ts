import chalk from 'chalk'

import type { Camp, Expedition, Peak, PeakClassification, SummitStats, SummitResult } from './summit-helpers.js'

// ─── Classification Display ────────────────────────────────────────────────────

const classIcon: Record<PeakClassification, string> = {
  valley: '\u{1F3D4}\uFE0F',
  foothill: '\u26F0\uFE0F',
  ridge: '\u{1F69B}',
  peak: '\u{1F3D4}\uFE0F',
  summit: '\u{1F3D5}\uFE0F',
}

const classColor: Record<PeakClassification, (s: string) => string> = {
  valley: (s: string) => chalk.rgb(139, 119, 101)(s),
  foothill: (s: string) => chalk.rgb(160, 140, 120)(s),
  ridge: (s: string) => chalk.rgb(100, 180, 100)(s),
  peak: (s: string) => chalk.rgb(50, 205, 50)(s),
  summit: (s: string) => chalk.rgb(255, 215, 0)(s),
}

function buildBar(value: number, width = 10): string {
  const filled = Math.round(value / (100 / width))
  const empty = width - filled
  return '\u2588'.repeat(Math.max(filled, 0)) + '\u2591'.repeat(Math.max(empty, 0))
}

// ─── Mountain Profile ──────────────────────────────────────────────────────────

/**
 * Format ASCII mountain profile.
 *
 * @example
 * formatMountainProfile(peaks)
 */
export function formatMountainProfile(peaks: Peak[]): string {
  if (peaks.length === 0) return '  No peaks to chart\n'

  const sorted = [...peaks].sort((a, b) => a.elevation - b.elevation)
  const lines: string[] = []
  lines.push('  ────────────────────────────────────────────────────')
  lines.push('  Elevation Profile')
  lines.push('  ────────────────────────────────────────────────────')

  for (const p of sorted) {
    const bar = buildBar(p.elevation, 20)
    const icon = classIcon[p.classification] ?? '\u{1F4CB}'
    const color = classColor[p.classification] ?? chalk.white
    lines.push(`  ${icon} ${color(`${bar} ${p.elevation}%`.padEnd(30))} ${p.file}`)
  }

  return lines.join('\n')
}

// ─── Peak Table ────────────────────────────────────────────────────────────────

/**
 * Format peak details.
 *
 * @example
 * formatPeakTable(peaks)
 */
export function formatPeakTable(peaks: Peak[]): string {
  if (peaks.length === 0) return '  No peaks found\n'

  const lines: string[] = []
  lines.push('  ────────────────────────────────────────────────────')
  lines.push('  Peak Details')
  lines.push('  ────────────────────────────────────────────────────')

  const sorted = [...peaks].sort((a, b) => b.elevation - a.elevation)
  for (const p of sorted.slice(0, 15)) {
    const icon = classIcon[p.classification] ?? '\u{1F4CB}'
    const color = classColor[p.classification] ?? chalk.white
    lines.push(`  ${icon} ${chalk.bold(p.file)}`)
    lines.push(`    Elevation: ${p.elevation}% | Difficulty: ${p.difficulty}% | Oxygen: ${p.oxygen}% | View: ${p.view}%`)
    lines.push(`    Equipment: ${p.equipment}% | Weather: ${p.weather} | Class: ${color(p.classification)}`)
  }

  return lines.join('\n')
}

// ─── Camp Distribution ─────────────────────────────────────────────────────────

/**
 * Format camp distribution.
 *
 * @example
 * formatCampDistribution(camps)
 */
export function formatCampDistribution(camps: Camp[]): string {
  const lines: string[] = []
  lines.push('  ────────────────────────────────────────────────────')
  lines.push('  Camp Distribution')
  lines.push('  ────────────────────────────────────────────────────')

  for (const camp of camps) {
    const bar = buildBar(camp.files.length > 0 ? camp.elevation : 0, 20)
    const count = camp.files.length
    lines.push(`  ${camp.type.padEnd(10)} ${bar} ${camp.elevation}% (${count} file${count !== 1 ? 's' : ''})`)
    if (count > 0 && count <= 5) {
      lines.push(`    ${camp.files.join(', ')}`)
    } else if (count > 5) {
      lines.push(`    ${camp.files.slice(0, 3).join(', ')}, +${count - 3} more`)
    }
  }

  return lines.join('\n')
}

// ─── Route Suggestions ─────────────────────────────────────────────────────────

/**
 * Format route suggestions.
 *
 * @example
 * formatRouteSuggestions(routes)
 */
export function formatRouteSuggestions(routes: SummitResult['expedition']['routes']): string {
  if (routes.length === 0) return '  No routes planned\n'

  const diffColor: Record<string, (s: string) => string> = {
    easy: (s: string) => chalk.rgb(100, 200, 100)(s),
    moderate: (s: string) => chalk.rgb(255, 180, 0)(s),
    challenging: (s: string) => chalk.rgb(255, 100, 50)(s),
    extreme: (s: string) => chalk.rgb(255, 50, 50)(s),
  }

  const lines: string[] = []
  lines.push('  ────────────────────────────────────────────────────')
  lines.push('  Route Suggestions')
  lines.push('  ────────────────────────────────────────────────────')

  for (const r of routes) {
    const color = diffColor[r.difficulty] ?? chalk.white
    lines.push(`  ${color(`[${r.difficulty.toUpperCase()}]`)} ${r.from} \u2192 ${r.to}`)
    for (const imp of r.improvements) {
      lines.push(`    \u2022 ${imp}`)
    }
  }

  return lines.join('\n')
}

// ─── Meters ────────────────────────────────────────────────────────────────────

/**
 * Format oxygen/equipment meters.
 *
 * @example
 * formatMeters(stats)
 */
export function formatMeters(stats: SummitStats): string {
  const lines: string[] = []
  lines.push('  ────────────────────────────────────────────────────')
  lines.push('  Conditions')
  lines.push('  ────────────────────────────────────────────────────')

  const oxyColor = stats.oxygenDeprivation < 30 ? chalk.rgb(50, 205, 50) : stats.oxygenDeprivation < 60 ? chalk.rgb(255, 180, 0) : chalk.rgb(255, 50, 50)
  const equipColor = stats.equipmentGaps < 30 ? chalk.rgb(50, 205, 50) : stats.equipmentGaps < 60 ? chalk.rgb(255, 180, 0) : chalk.rgb(255, 50, 50)
  const trailColor = stats.trailCondition >= 60 ? chalk.rgb(50, 205, 50) : stats.trailCondition >= 30 ? chalk.rgb(255, 180, 0) : chalk.rgb(255, 50, 50)

  lines.push(`  Oxygen Deprivation:  ${oxyColor(`${stats.oxygenDeprivation}% of files low on docs`)}`)
  lines.push(`  Equipment Gaps:      ${equipColor(`${stats.equipmentGaps}% of files lack test gear`)}`)
  lines.push(`  Trail Condition:     ${trailColor(`${buildBar(stats.trailCondition)} ${stats.trailCondition}%`)}`)

  return lines.join('\n')
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

/**
 * Format summit stats.
 *
 * @example
 * formatSummitStats(stats)
 */
export function formatSummitStats(stats: SummitStats): string {
  const lines: string[] = []
  lines.push('  ────────────────────────────────────────────────────')
  lines.push('  Summit Stats')
  lines.push('  ────────────────────────────────────────────────────')
  lines.push(`  Total Peaks:       ${stats.totalPeaks}`)
  lines.push(`  Summit Files:      ${stats.summitCount}`)
  lines.push(`  Valley Files:      ${stats.valleyCount}`)
  lines.push(`  Average Elevation: ${stats.avgElevation}%`)
  lines.push(`  Highest Peak:      ${stats.highestPeak}`)
  lines.push(`  Deepest Valley:    ${stats.deepestValley}`)
  return lines.join('\n')
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Format summit recommendations.
 *
 * @example
 * formatSummitRecommendations(recs)
 */
export function formatSummitRecommendations(recommendations: string[]): string {
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
 * Format complete summit result as table.
 *
 * @example
 * formatSummitTable(result)
 */
export function formatSummitTable(result: SummitResult): string {
  const parts: string[] = []
  parts.push(`  \u{1F3D5}\uFE0F ${chalk.bold('Summit Analysis')}`)
  parts.push('')
  parts.push(formatMountainProfile(result.peaks))
  parts.push('')
  parts.push(formatPeakTable(result.peaks))
  parts.push('')
  parts.push(formatCampDistribution(result.expedition.camps))
  parts.push('')
  parts.push(formatRouteSuggestions(result.expedition.routes))
  parts.push('')
  parts.push(formatMeters(result.stats))
  parts.push('')
  parts.push(formatSummitStats(result.stats))
  parts.push('')
  parts.push(formatSummitRecommendations(result.recommendations))
  return parts.join('\n')
}

// ─── JSON ──────────────────────────────────────────────────────────────────────

/**
 * Format summit result as JSON.
 *
 * @example
 * formatSummitJSON(result)
 */
export function formatSummitJSON(result: SummitResult): string {
  return JSON.stringify(result, null, 2)
}
