import chalk from 'chalk'

import type { Finding, KaleidoscopeResult, KaleidoscopeStats, LensView } from './kaleidoscope-helpers.js'

// ─── Lens Color Helpers ────────────────────────────────────────────────────────

function lensColor(color: string): (s: string) => string {
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)
  return (s: string) => chalk.rgb(r, g, b)(s)
}

function buildBar(value: number, width = 10): string {
  const filled = Math.round(value / (100 / width))
  const empty = width - filled
  return '\u2588'.repeat(Math.max(filled, 0)) + '\u2591'.repeat(Math.max(empty, 0))
}

const typeIcon: Record<string, string> = {
  pattern: '\u{1F504}',
  anomaly: '\u26A0\uFE0F',
  trend: '\u{1F4C8}',
  insight: '\u{1F4A1}',
}

// ─── Single Lens View ──────────────────────────────────────────────────────────

/**
 * Format a single lens view.
 *
 * @example
 * formatLensView(view)
 */
export function formatLensView(view: LensView): string {
  const lines: string[] = []
  const color = lensColor(view.lens.color)

  lines.push(`  ${color(`\u{1F52D} ${view.lens.name} Lens`)} \u2014 ${view.lens.description}`)
  lines.push(`  Focus: ${view.lens.focus}`)
  lines.push(`  Pattern: ${chalk.bold(view.pattern)}`)
  lines.push(`  Symmetry: ${buildBar(view.symmetry)} ${view.symmetry}%`)
  lines.push(`  Beauty:   ${buildBar(view.beauty)} ${view.beauty}%`)

  if (view.findings.length > 0) {
    lines.push('  Findings:')
    for (const f of view.findings.slice(0, 5)) {
      const icon = typeIcon[f.type] ?? '\u2022'
      lines.push(`    ${icon} [${f.type}] ${f.description} (${f.significance}%)`)
      if (f.files.length > 0 && f.files.length <= 3) {
        lines.push(`       Files: ${f.files.join(', ')}`)
      } else if (f.files.length > 3) {
        lines.push(`       Files: ${f.files.slice(0, 3).join(', ')}, +${f.files.length - 3} more`)
      }
    }
  }

  return lines.join('\n')
}

// ─── All Views ─────────────────────────────────────────────────────────────────

/**
 * Format all lens views.
 *
 * @example
 * formatAllViews(views)
 */
export function formatAllViews(views: LensView[]): string {
  if (views.length === 0) return '  No lens views available\n'

  const parts: string[] = []
  for (const view of views) {
    parts.push(formatLensView(view))
    parts.push('')
  }

  return parts.join('\n')
}

// ─── Anomaly Highlights ────────────────────────────────────────────────────────

/**
 * Format anomaly highlights across all views.
 *
 * @example
 * formatAnomalyHighlights(views)
 */
export function formatAnomalyHighlights(views: LensView[]): string {
  const allAnomalies: { lens: string; finding: Finding }[] = []
  for (const view of views) {
    for (const f of view.findings) {
      if (f.type === 'anomaly') allAnomalies.push({ lens: view.lens.name, finding: f })
    }
  }

  if (allAnomalies.length === 0) return '  No anomalies detected\n'

  const lines: string[] = []
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push('  Anomaly Highlights')
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')

  const sorted = [...allAnomalies].sort((a, b) => b.finding.significance - a.finding.significance)
  for (const { lens, finding } of sorted.slice(0, 8)) {
    lines.push(`  \u26A0\uFE0F [${lens}] ${finding.description}`)
    if (finding.files.length > 0) {
      lines.push(`     Affected: ${finding.files.slice(0, 3).join(', ')}`)
    }
  }

  return lines.join('\n')
}

// ─── Pattern Gallery ───────────────────────────────────────────────────────────

/**
 * Format pattern gallery showing patterns from each lens.
 *
 * @example
 * formatPatternGallery(views)
 */
export function formatPatternGallery(views: LensView[]): string {
  if (views.length === 0) return '  No patterns detected\n'

  const lines: string[] = []
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push('  Pattern Gallery')
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')

  for (const view of views) {
    const color = lensColor(view.lens.color)
    lines.push(`  ${color(view.lens.name.padEnd(14))} \u2192 ${chalk.bold(view.pattern)}`)
  }

  return lines.join('\n')
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

/**
 * Format kaleidoscope stats.
 *
 * @example
 * formatKaleidoscopeStats(stats)
 */
export function formatKaleidoscopeStats(stats: KaleidoscopeStats): string {
  const lines: string[] = []
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push('  Kaleidoscope Stats')
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push(`  Total Lenses:        ${stats.totalLenses}`)
  lines.push(`  Total Findings:      ${stats.totalFindings}`)
  lines.push(`  Avg Symmetry:        ${buildBar(stats.avgSymmetry)} ${stats.avgSymmetry}%`)
  lines.push(`  Avg Beauty:          ${buildBar(stats.avgBeauty)} ${stats.avgBeauty}%`)
  lines.push(`  Most Beautiful:      ${chalk.rgb(255, 215, 0)(stats.mostBeautifulLens)}`)
  lines.push(`  Most Chaotic:        ${chalk.rgb(255, 100, 100)(stats.mostChaoticLens)}`)
  lines.push(`  Patterns:            ${stats.patternCount}`)
  lines.push(`  Anomalies:           ${stats.anomalyCount}`)
  lines.push(`  Overall Harmony:     ${buildBar(stats.overallHarmony)} ${stats.overallHarmony}%`)
  lines.push(`  Dominant Pattern:    ${chalk.bold(stats.dominantPattern)}`)
  return lines.join('\n')
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Format kaleidoscope recommendations.
 *
 * @example
 * formatKaleidoscopeRecommendations(recs)
 */
export function formatKaleidoscopeRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return '  No recommendations\n'

  const lines: string[] = []
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push('  Recommendations')
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')

  for (let i = 0; i < recommendations.length; i++) {
    lines.push(`  ${i + 1}. ${recommendations[i]}`)
  }

  return lines.join('\n')
}

// ─── Full Table ────────────────────────────────────────────────────────────────

/**
 * Format complete kaleidoscope result as table.
 *
 * @example
 * formatKaleidoscopeTable(result)
 */
export function formatKaleidoscopeTable(result: KaleidoscopeResult): string {
  const parts: string[] = []
  parts.push(`  \u{1F52D} ${chalk.bold('Kaleidoscope Analysis')} \u2014 ${result.rotation} unique pattern${result.rotation !== 1 ? 's' : ''} found`)
  parts.push('')
  parts.push(formatAllViews(result.views))
  parts.push(formatPatternGallery(result.views))
  parts.push('')
  parts.push(formatAnomalyHighlights(result.views))
  parts.push('')
  parts.push(formatKaleidoscopeStats(result.stats))
  parts.push('')
  parts.push(formatKaleidoscopeRecommendations(result.recommendations))
  return parts.join('\n')
}

// ─── JSON ──────────────────────────────────────────────────────────────────────

/**
 * Format kaleidoscope result as JSON.
 *
 * @example
 * formatKaleidoscopeJSON(result)
 */
export function formatKaleidoscopeJSON(result: KaleidoscopeResult): string {
  return JSON.stringify(result, null, 2)
}
