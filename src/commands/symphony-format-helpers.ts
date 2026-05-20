import chalk from 'chalk'

import type { SymphonyResult, OrchestraSection, Instrument, Harmony, Dissonance, SymphonyStats, SectionType } from './symphony-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────────

const sectionTypeColor: Record<SectionType, (s: string) => string> = {
  strings: (s: string) => chalk.rgb(231, 76, 60)(s),
  woodwinds: (s: string) => chalk.rgb(52, 152, 219)(s),
  brass: (s: string) => chalk.rgb(243, 156, 18)(s),
  percussion: (s: string) => chalk.rgb(39, 174, 96)(s),
  keyboard: (s: string) => chalk.rgb(155, 89, 182)(s),
}

const sectionTypeIcon: Record<SectionType, string> = {
  strings: '\u{1F3BB}',
  woodwinds: '\u{1F3C7}',
  brass: '\u{1F3BA}',
  percussion: '\u{1F941}',
  keyboard: '\u{1F3B9}',
}

const harmonyTypeColor: Record<string, (s: string) => string> = {
  perfect: (s: string) => chalk.rgb(46, 204, 113)(s),
  major: (s: string) => chalk.rgb(52, 152, 219)(s),
  minor: (s: string) => chalk.rgb(243, 156, 18)(s),
  dissonant: (s: string) => chalk.rgb(231, 76, 60)(s),
  cacophonous: (s: string) => chalk.rgb(192, 57, 43)(s),
}

const roleColor: Record<string, (s: string) => string> = {
  lead: (s: string) => chalk.rgb(241, 196, 15)(s),
  harmony: (s: string) => chalk.rgb(52, 152, 219)(s),
  bass: (s: string) => chalk.rgb(149, 165, 166)(s),
  rhythm: (s: string) => chalk.rgb(39, 174, 96)(s),
  solo: (s: string) => chalk.rgb(231, 76, 60)(s),
}

function buildBar(value: number, width = 10): string {
  const filled = Math.round(value / (100 / width))
  const empty = width - filled
  return '\u2588'.repeat(Math.max(filled, 0)) + '\u2591'.repeat(Math.max(empty, 0))
}

// ─── Orchestra Layout ──────────────────────────────────────────────────────────

/**
 * Format orchestra section layout.
 *
 * @example
 * formatOrchestraLayout(sections)
 */
export function formatOrchestraLayout(sections: OrchestraSection[]): string {
  if (sections.length === 0) return '  No sections in the orchestra\n'

  const lines: string[] = []
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push('  Orchestra Layout')
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')

  for (const sec of sections) {
    const icon = sectionTypeIcon[sec.sectionType] ?? '\u2022'
    const colorFn = sectionTypeColor[sec.sectionType] ?? chalk.white
    lines.push(`  ${icon} ${chalk.bold(sec.name)} ${colorFn(`(${sec.sectionType})`)} \u2014 ${sec.instruments.length} instruments`)
    lines.push(`    Harmony: ${buildBar(sec.harmony)} ${sec.harmony}% | Volume: ${sec.volume.toFixed(1)} | Tuning: ${buildBar(sec.tuning)} ${sec.tuning}%`)
  }

  return lines.join('\n')
}

// ─── Instrument Details ────────────────────────────────────────────────────────

/**
 * Format instrument (file) details.
 *
 * @example
 * formatInstrumentDetails(instruments)
 */
export function formatInstrumentDetails(instruments: Instrument[]): string {
  if (instruments.length === 0) return '  No instruments found\n'

  const lines: string[] = []
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push('  Instrument Details')
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')

  const sorted = [...instruments].sort((a, b) => b.skill - a.skill)
  for (const inst of sorted.slice(0, 20)) {
    const colorFn = roleColor[inst.role] ?? chalk.white
    lines.push(`  ${colorFn(inst.file)}`)
    lines.push(`    Role: ${colorFn(inst.role)} | Skill: ${inst.skill} | Range: [${inst.range[0]}, ${inst.range[1]}] | Tuning: ${inst.tuning}`)
  }

  return lines.join('\n')
}

// ─── Harmony Map ───────────────────────────────────────────────────────────────

/**
 * Format harmony relationships between sections.
 *
 * @example
 * formatHarmonyMap(harmonies)
 */
export function formatHarmonyMap(harmonies: Harmony[]): string {
  if (harmonies.length === 0) return '  No harmonies to display\n'

  const lines: string[] = []
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push('  Harmony Map')
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')

  for (const h of harmonies) {
    const colorFn = harmonyTypeColor[h.type] ?? chalk.white
    lines.push(`  ${colorFn(`${h.between[0]} \u2194 ${h.between[1]}`)} \u2014 ${colorFn(h.type)} (${h.consonance}%)`)
  }

  return lines.join('\n')
}

// ─── Dissonance Warnings ───────────────────────────────────────────────────────

/**
 * Format dissonance warnings.
 *
 * @example
 * formatDissonanceWarnings(dissonances)
 */
export function formatDissonanceWarnings(dissonances: Dissonance[]): string {
  if (dissonances.length === 0) return '  No dissonances detected\n'

  const lines: string[] = []
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push('  Dissonance Warnings')
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')

  const severityIcon: Record<string, string> = { minor: '\u26A0\uFE0F', moderate: '\u{1F7E1}', major: '\u{1F534}' }
  for (const d of dissonances) {
    const icon = severityIcon[d.severity] ?? '\u2022'
    lines.push(`  ${icon} [${d.severity}] ${d.file}: ${d.description}`)
    lines.push(`     \u2192 ${d.resolution}`)
  }

  return lines.join('\n')
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

/**
 * Format symphony statistics.
 *
 * @example
 * formatSymphonyStats(stats)
 */
export function formatSymphonyStats(stats: SymphonyStats): string {
  const lines: string[] = []
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push('  Symphony Stats')
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push(`  Total Instruments:     ${stats.totalInstruments}`)
  lines.push(`  Sections:              ${stats.sectionCount}`)
  lines.push(`  Perfect Harmonies:     ${stats.perfectHarmonies}`)
  lines.push(`  Dissonant Pairs:       ${stats.dissonantCount}`)
  lines.push(`  Overall Harmony:       ${buildBar(stats.overallHarmony)} ${stats.overallHarmony}%`)
  lines.push(`  Orchestra Balance:     ${buildBar(stats.orchestraBalance)} ${stats.orchestraBalance}%`)
  lines.push(`  Tuning Score:          ${buildBar(stats.tuningScore)} ${stats.tuningScore}%`)
  lines.push(`  Lead Instrument:       ${chalk.bold(stats.leadInstrument)}`)
  lines.push(`  Loudest Section:       ${stats.loudestSection}`)
  lines.push(`  Quietest Section:      ${stats.quietestSection}`)
  return lines.join('\n')
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Format symphony recommendations.
 *
 * @example
 * formatSymphonyRecommendations(recs)
 */
export function formatSymphonyRecommendations(recommendations: string[]): string {
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
 * Format complete symphony result as table.
 *
 * @example
 * formatSymphonyTable(result)
 */
export function formatSymphonyTable(result: SymphonyResult): string {
  const parts: string[] = []
  parts.push(`  \u{1F3BC} ${chalk.bold('Symphony Analysis')} \u2014 ${result.stats.totalInstruments} instruments across ${result.stats.sectionCount} sections`)
  parts.push('')
  parts.push(formatOrchestraLayout(result.sections))
  parts.push('')
  parts.push(formatInstrumentDetails(result.instruments))
  parts.push('')
  parts.push(formatHarmonyMap(result.harmonies))
  parts.push('')
  parts.push(formatDissonanceWarnings(result.dissonances))
  parts.push('')
  parts.push(formatSymphonyStats(result.stats))
  parts.push('')
  parts.push(formatSymphonyRecommendations(result.recommendations))
  return parts.join('\n')
}

// ─── JSON ──────────────────────────────────────────────────────────────────────

/**
 * Format symphony result as JSON.
 *
 * @example
 * formatSymphonyJSON(result)
 */
export function formatSymphonyJSON(result: SymphonyResult): string {
  return JSON.stringify(result, null, 2)
}
