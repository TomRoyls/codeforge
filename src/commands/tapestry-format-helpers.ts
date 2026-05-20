import chalk from 'chalk'

import type { TapestryResult, TapestrySection, TapestryStats, Thread, WeavingPattern } from './tapestry-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────────

const threadTypeColor: Record<string, (s: string) => string> = {
  warp: (s: string) => chalk.rgb(231, 76, 60)(s),
  weft: (s: string) => chalk.rgb(52, 152, 219)(s),
  decorative: (s: string) => chalk.rgb(39, 174, 96)(s),
  loose: (s: string) => chalk.rgb(243, 156, 18)(s),
  broken: (s: string) => chalk.rgb(149, 165, 166)(s),
}

const sectionTypeIcon: Record<string, string> = {
  foundation: '\u{1F3DB}\uFE0F',
  border: '\u{1F532}',
  motif: '\u{1F3A8}',
  filler: '\u{1F9F5}',
  patch: '\u{1FAA1}',
}

function buildBar(value: number, width = 10): string {
  const filled = Math.round(value / (100 / width))
  const empty = width - filled
  return '\u2588'.repeat(Math.max(filled, 0)) + '\u2591'.repeat(Math.max(empty, 0))
}

// ─── Tapestry Visualization ────────────────────────────────────────────────────

/**
 * Format ASCII tapestry visualization.
 *
 * @example
 * formatTapestryVisualization(threads, sections)
 */
export function formatTapestryVisualization(threads: Thread[], sections: TapestrySection[]): string {
  if (threads.length === 0) return '  No threads to visualize\n'

  const lines: string[] = []
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push('  Tapestry Weave')
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')

  for (const section of sections) {
    const icon = sectionTypeIcon[section.type] ?? '\u2022'
    lines.push(`  ${icon} ${chalk.bold(section.name)} (${section.threads.length} threads, integrity ${section.integrity}%)`)
  }

  return lines.join('\n')
}

// ─── Thread List ───────────────────────────────────────────────────────────────

/**
 * Format thread details.
 *
 * @example
 * formatThreadList(threads)
 */
export function formatThreadList(threads: Thread[]): string {
  if (threads.length === 0) return '  No threads found\n'

  const lines: string[] = []
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push('  Thread Details')
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')

  const sorted = [...threads].sort((a, b) => b.strength - a.strength)
  for (const t of sorted.slice(0, 20)) {
    const colorFn = threadTypeColor[t.type] ?? chalk.white
    lines.push(`  ${colorFn(`${t.from} \u2192 ${t.to}`)}`)
    lines.push(`    Type: ${colorFn(t.type)} | Strength: ${t.strength} | Thickness: ${t.thickness}`)
  }

  return lines.join('\n')
}

// ─── Section Breakdown ─────────────────────────────────────────────────────────

/**
 * Format section breakdown.
 *
 * @example
 * formatSectionBreakdown(sections)
 */
export function formatSectionBreakdown(sections: TapestrySection[]): string {
  if (sections.length === 0) return '  No sections found\n'

  const lines: string[] = []
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push('  Section Breakdown')
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')

  for (const sec of sections) {
    const icon = sectionTypeIcon[sec.type] ?? '\u2022'
    lines.push(`  ${icon} ${chalk.bold(sec.name)}`)
    lines.push(`    Type: ${sec.type} | Density: ${sec.density} | Integrity: ${buildBar(sec.integrity)} ${sec.integrity}% | Pattern: ${sec.pattern}`)
  }

  return lines.join('\n')
}

// ─── Weaving Patterns ──────────────────────────────────────────────────────────

/**
 * Format weaving patterns.
 *
 * @example
 * formatWeavingPatterns(patterns)
 */
export function formatWeavingPatterns(patterns: WeavingPattern[]): string {
  if (patterns.length === 0) return '  No patterns detected\n'

  const lines: string[] = []
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push('  Weaving Patterns')
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')

  for (const p of patterns) {
    lines.push(`  \u{1F4A0} ${chalk.bold(p.name)} (quality ${p.quality}%)`)
    lines.push(`    ${p.description}`)
  }

  return lines.join('\n')
}

// ─── Thread Type Distribution ──────────────────────────────────────────────────

/**
 * Format thread type distribution.
 *
 * @example
 * formatThreadDistribution(stats)
 */
export function formatThreadDistribution(stats: TapestryStats): string {
  const lines: string[] = []
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push('  Thread Distribution')
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')

  const total = stats.totalThreads || 1
  const draw = (label: string, count: number, type: string) => {
    const pct = Math.round((count / total) * 100)
    const bar = buildBar(pct, 15)
    const colorFn = threadTypeColor[type] ?? chalk.white
    lines.push(`  ${colorFn(label.padEnd(12))} ${colorFn(bar)} ${count} (${pct}%)`)
  }

  draw('Warp', stats.warpCount, 'warp')
  draw('Weft', stats.weftCount, 'weft')
  draw('Decorative', stats.totalThreads - stats.warpCount - stats.weftCount - stats.looseCount - stats.brokenCount, 'decorative')
  draw('Loose', stats.looseCount, 'loose')
  draw('Broken', stats.brokenCount, 'broken')

  return lines.join('\n')
}

// ─── Alerts ────────────────────────────────────────────────────────────────────

/**
 * Format loose and broken thread alerts.
 *
 * @example
 * formatThreadAlerts(threads)
 */
export function formatThreadAlerts(threads: Thread[]): string {
  const loose = threads.filter((t) => t.type === 'loose')
  const broken = threads.filter((t) => t.type === 'broken')

  if (loose.length === 0 && broken.length === 0) return '  No loose or broken threads\n'

  const lines: string[] = []
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push('  Thread Alerts')
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')

  for (const t of broken.slice(0, 5)) {
    lines.push(`  \u{1F4A5} BROKEN: ${t.from} \u2192 ${t.to}`)
  }
  for (const t of loose.slice(0, 5)) {
    lines.push(`  \u{1F5B5}\uFE0F LOOSE: ${t.from} \u2192 ${t.to}`)
  }

  return lines.join('\n')
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

/**
 * Format tapestry stats.
 *
 * @example
 * formatTapestryStats(stats)
 */
export function formatTapestryStats(stats: TapestryStats): string {
  const lines: string[] = []
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push('  Tapestry Stats')
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push(`  Total Threads:         ${stats.totalThreads}`)
  lines.push(`  Warp Threads:          ${stats.warpCount}`)
  lines.push(`  Weft Threads:          ${stats.weftCount}`)
  lines.push(`  Loose Threads:         ${stats.looseCount}`)
  lines.push(`  Broken Threads:        ${stats.brokenCount}`)
  lines.push(`  Sections:              ${stats.sectionCount}`)
  lines.push(`  Avg Density:           ${stats.avgDensity}`)
  lines.push(`  Avg Integrity:         ${buildBar(stats.avgIntegrity)} ${stats.avgIntegrity}%`)
  lines.push(`  Overall Integrity:     ${buildBar(stats.overallIntegrity)} ${stats.overallIntegrity}%`)
  lines.push(`  Completeness:          ${buildBar(stats.tapestryCompleteness)} ${stats.tapestryCompleteness}%`)
  lines.push(`  Dominant Pattern:      ${chalk.bold(stats.dominantPattern)}`)
  lines.push(`  Tightest Section:      ${stats.tightestSection}`)
  lines.push(`  Loosest Section:       ${stats.loosestSection}`)
  return lines.join('\n')
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Format tapestry recommendations.
 *
 * @example
 * formatTapestryRecommendations(recs)
 */
export function formatTapestryRecommendations(recommendations: string[]): string {
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
 * Format complete tapestry result as table.
 *
 * @example
 * formatTapestryTable(result)
 */
export function formatTapestryTable(result: TapestryResult): string {
  const parts: string[] = []
  parts.push(`  \u{1F9F5} ${chalk.bold('Tapestry Analysis')} \u2014 ${result.stats.totalThreads} threads across ${result.stats.sectionCount} sections`)
  parts.push('')
  parts.push(formatTapestryVisualization(result.threads, result.sections))
  parts.push('')
  parts.push(formatSectionBreakdown(result.sections))
  parts.push('')
  parts.push(formatWeavingPatterns(result.patterns))
  parts.push('')
  parts.push(formatThreadDistribution(result.stats))
  parts.push('')
  parts.push(formatThreadAlerts(result.threads))
  parts.push('')
  parts.push(formatTapestryStats(result.stats))
  parts.push('')
  parts.push(formatTapestryRecommendations(result.recommendations))
  return parts.join('\n')
}

// ─── JSON ──────────────────────────────────────────────────────────────────────

/**
 * Format tapestry result as JSON.
 *
 * @example
 * formatTapestryJSON(result)
 */
export function formatTapestryJSON(result: TapestryResult): string {
  return JSON.stringify(result, null, 2)
}
