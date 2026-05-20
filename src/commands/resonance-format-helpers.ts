import chalk from 'chalk'

import type { Frequency, Resonance, ResonanceProfile, ResonanceResult, ResonanceStats, Tuning } from './resonance-helpers.js'

// ─── Frequency Spectrum ────────────────────────────────────────────────────────

/**
 * Format a frequency spectrum chart.
 *
 * @example
 * formatFrequencySpectrum(freqs) // => '  arrow-function ██████ 45'
 */
export function formatFrequencySpectrum(frequencies: Frequency[]): string {
  if (frequencies.length === 0) return chalk.gray('  No patterns detected')

  const sorted = [...frequencies].sort((a, b) => b.occurrences - a.occurrences)
  const maxOcc = Math.max(...sorted.map(f => f.occurrences), 1)
  const barMax = 25

  const catColors: Record<string, (s: string) => string> = {
    async: chalk.rgb(255, 215, 0),
    error: chalk.rgb(255, 99, 71),
    export: chalk.rgb(100, 149, 237),
    import: chalk.rgb(144, 238, 144),
    naming: chalk.rgb(255, 182, 193),
    structural: chalk.rgb(173, 216, 230),
    style: chalk.rgb(218, 112, 214),
    typing: chalk.rgb(60, 179, 113),
  }

  const lines: string[] = [
    '',
    chalk.bold('  Frequency Spectrum:'),
    chalk.gray('  ' + '─'.repeat(55)),
  ]

  for (const f of sorted.slice(0, 15)) {
    const barLen = Math.round((f.occurrences / maxOcc) * barMax)
    const bar = '█'.repeat(barLen)
    const color = catColors[f.category] ?? chalk.white
    lines.push(`  ${f.pattern.padEnd(22)} ${color(bar)} ${f.occurrences} (${f.category})`)
  }

  if (sorted.length > 15) {
    lines.push(chalk.gray(`  ... and ${sorted.length - 15} more patterns`))
  }

  return lines.join('\n')
}

// ─── Resonance Matrix ──────────────────────────────────────────────────────────

/**
 * Format resonances grouped by type.
 *
 * @example
 * formatResonanceMatrix(resonances) // => grouped display
 */
export function formatResonanceMatrix(resonances: Resonance[]): string {
  if (resonances.length === 0) return chalk.gray('  No resonances detected')

  const typeColors: Record<string, (s: string) => string> = {
    constructive: chalk.rgb(60, 179, 113),
    destructive: chalk.rgb(255, 99, 71),
    dissonant: chalk.rgb(255, 165, 0),
    harmonic: chalk.rgb(100, 149, 237),
  }

  const lines: string[] = [
    '',
    chalk.bold('  Resonance Matrix:'),
    chalk.gray('  ' + '─'.repeat(60)),
  ]

  for (const type of ['constructive', 'destructive', 'harmonic', 'dissonant'] as const) {
    const filtered = resonances.filter(r => r.type === type)
    if (filtered.length === 0) continue
    const color = typeColors[type] ?? chalk.white
    lines.push(`  ${color(`${type.toUpperCase()} (${filtered.length})`)}`)
    for (const r of filtered) {
      lines.push(`    ${r.patterns.join(' + ')} — ${r.description}`)
      lines.push(chalk.gray(`      strength: ${r.strength} | files: ${r.files.length}`))
    }
  }

  return lines.join('\n')
}

// ─── Profile Badges ────────────────────────────────────────────────────────────

/**
 * Format profile tuning badges.
 *
 * @example
 * formatProfileBadges(profiles) // => '  app.ts [well-tuned] score: 85'
 */
export function formatProfileBadges(profiles: ResonanceProfile[]): string {
  if (profiles.length === 0) return chalk.gray('  No profiles')

  const tuningColors: Record<Tuning, (s: string) => string> = {
    cacophonous: chalk.rgb(255, 99, 71),
    dissonant: chalk.rgb(255, 165, 0),
    'slightly-off': chalk.rgb(255, 215, 0),
    'well-tuned': chalk.rgb(60, 179, 113),
  }

  const sorted = [...profiles].sort((a, b) => b.resonanceScore - a.resonanceScore)
  const lines: string[] = [
    '',
    chalk.bold('  File Profiles:'),
    chalk.gray('  ' + '─'.repeat(70)),
  ]

  for (const p of sorted) {
    const name = p.file.length > 30 ? '...' + p.file.slice(-27) : p.file
    const color = tuningColors[p.tuning] ?? chalk.white
    lines.push(`  ${name.padEnd(33)} ${color(`[${p.tuning}]`)}  score: ${p.resonanceScore}  interference: ${p.interference}%`)
  }

  return lines.join('\n')
}

// ─── Interference Meter ────────────────────────────────────────────────────────

/**
 * Format interference meter.
 *
 * @example
 * formatInterferenceMeter(75) // => '  ███████████████░░░░░ 75% constructive'
 */
export function formatInterferenceMeter(interference: number): string {
  const filled = Math.round(interference / 5)
  const empty = 20 - filled
  const bar = '█'.repeat(filled) + '░'.repeat(empty)
  const color = interference >= 70 ? chalk.rgb(60, 179, 113) : interference >= 40 ? chalk.rgb(255, 215, 0) : chalk.rgb(255, 99, 71)

  return [
    '',
    chalk.bold('  Interference Balance:'),
    chalk.gray('  ' + '─'.repeat(40)),
    `  ${color(bar)} ${interference}% constructive`,
  ].join('\n')
}

// ─── Stats Summary ─────────────────────────────────────────────────────────────

/**
 * Format resonance stats.
 *
 * @example
 * formatResonanceStats(stats) // => summary
 */
export function formatResonanceStats(stats: ResonanceStats): string {
  const lines: string[] = [
    '',
    chalk.bold('  Statistics:'),
    chalk.gray('  ' + '─'.repeat(55)),
    `  Patterns Detected:      ${stats.totalFrequencies}`,
    `  Constructive:           ${chalk.rgb(60, 179, 113)(String(stats.constructiveResonances))}  |  Destructive: ${chalk.rgb(255, 99, 71)(String(stats.destructiveResonances))}`,
    `  Avg Resonance Score:    ${stats.avgResonanceScore}  |  Avg Interference: ${stats.avgInterference}%`,
    `  Dominant Pattern:       ${stats.dominantFrequency}`,
    `  Rarest Pattern:         ${stats.rarestFrequency}`,
    `  Most Harmonious:        ${chalk.rgb(60, 179, 113)(stats.mostHarmoniousFile)}`,
    `  Most Dissonant:         ${chalk.rgb(255, 99, 71)(stats.mostDissonantFile)}`,
    `  Overall Harmony:        ${stats.overallHarmony}/100`,
    `  Signal/Noise Ratio:     ${stats.signalToNoiseRatio}`,
  ]
  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Format resonance recommendations.
 *
 * @example
 * formatResonanceRecommendations(recs) // => list
 */
export function formatResonanceRecommendations(recs: string[]): string {
  if (recs.length === 0) return ''
  const lines: string[] = [
    '',
    chalk.bold('  Recommendations:'),
    chalk.gray('  ' + '─'.repeat(50)),
  ]
  for (const r of recs) {
    lines.push(`  ${chalk.rgb(255, 215, 0)('→')} ${r}`)
  }
  return lines.join('\n')
}

// ─── Full Table Output ─────────────────────────────────────────────────────────

/**
 * Format full resonance result as table.
 *
 * @example
 * formatResonanceTable(result) // => complete formatted output
 */
export function formatResonanceTable(result: ResonanceResult): string {
  const sections: string[] = []

  sections.push(chalk.bold.rgb(100, 149, 237)('\n  Resonance Analysis\n'))
  sections.push(formatFrequencySpectrum(result.frequencies))
  sections.push(formatResonanceMatrix(result.resonances))
  sections.push(formatProfileBadges(result.profiles))
  sections.push(formatInterferenceMeter(result.stats.avgInterference))
  sections.push(formatResonanceStats(result.stats))
  sections.push(formatResonanceRecommendations(result.recommendations))

  return sections.join('\n')
}

// ─── JSON Output ───────────────────────────────────────────────────────────────

/**
 * Format resonance result as JSON.
 *
 * @example
 * formatResonanceJson(result) // => '{"frequencies":[...],...}'
 */
export function formatResonanceJson(result: ResonanceResult): string {
  return JSON.stringify(result, null, 2)
}
