import chalk from 'chalk'

import type {
  SpectralAnomaly,
  SpectralLine,
  SpectrumBand,
  SpectrumResult,
  SpectrumStats,
} from './spectrometer-helpers.js'

// ─── Spectrum Chart ───────────────────────────────────────────────────────────

/**
 * Format ASCII spectrum chart.
 *
 * @example
 * formatSpectrumChart(spectrum)
 */
export function formatSpectrumChart(spectrum: SpectralLine[]): string {
  if (spectrum.length === 0) return chalk.dim('  No spectral data.')
  const lines: string[] = []
  lines.push(chalk.bold('  Spectrum Chart:'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────────'))

  const shown = spectrum.filter((l) => l.frequency > 0).slice(0, 20)
  for (const line of shown) {
    const barLen = Math.max(1, Math.round(line.intensity / 5))
    const colorFn = getBandColor(line.category)
    const bar = colorFn('█'.repeat(barLen))
    lines.push(`  ${line.name.padEnd(22)} ${bar} ${line.frequency}`)
  }

  lines.push(chalk.gray('  ────────────────────────────────────────────────────────'))
  return lines.join('\n')
}

/**
 * Get color for band category.
 *
 * @example
 * getBandColor('syntax')
 */
export function getBandColor(category: string): (t: string) => string {
  switch (category) {
    case 'syntax': return chalk.rgb(33, 150, 243)
    case 'keyword': return chalk.rgb(156, 39, 176)
    case 'pattern': return chalk.rgb(255, 152, 0)
    case 'convention': return chalk.rgb(76, 175, 80)
    case 'idiom': return chalk.rgb(0, 188, 212)
    default: return chalk.white
  }
}

// ─── Band Breakdown ───────────────────────────────────────────────────────────

/**
 * Format band breakdown.
 *
 * @example
 * formatBandBreakdown(bands)
 */
export function formatBandBreakdown(bands: SpectrumBand[]): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Band Breakdown:'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────────'))

  for (const band of bands) {
    const colorFn = getBandColor(band.lines[0]?.category ?? 'syntax')
    lines.push(`  ${colorFn(band.name.padEnd(14))} dominant: ${band.dominantLine} | intensity: ${band.totalIntensity} | ${band.lines.length} patterns`)
  }

  lines.push(chalk.gray('  ────────────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Spectral Line Table ──────────────────────────────────────────────────────

/**
 * Format spectral line table.
 *
 * @example
 * formatSpectralLineTable(spectrum)
 */
export function formatSpectralLineTable(spectrum: SpectralLine[]): string {
  if (spectrum.length === 0) return chalk.dim('  No spectral lines.')
  const lines: string[] = []
  lines.push(chalk.bold('  Spectral Lines:'))
  lines.push(chalk.gray('  ──────────────────────────────────────────────────────────────────────'))
  lines.push(chalk.gray('  Pattern                 Category      Freq  Intensity  Files'))
  lines.push(chalk.gray('  ──────────────────────────────────────────────────────────────────────'))

  for (const line of spectrum.filter((l) => l.frequency > 0).slice(0, 25)) {
    const name = line.name.length > 22 ? line.name.slice(0, 19) + '...' : line.name
    const colorFn = getBandColor(line.category)
    lines.push(`  ${name.padEnd(24)}${colorFn(line.category.padEnd(14))}${String(line.frequency).padStart(5)}  ${String(line.intensity).padStart(9)}  ${line.files.length}`)
  }

  lines.push(chalk.gray('  ──────────────────────────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Purity Meter ─────────────────────────────────────────────────────────────

/**
 * Format purity meter.
 *
 * @example
 * formatPurityMeter(85)
 */
export function formatPurityMeter(purity: number): string {
  const filled = Math.round(purity / 5)
  const empty = 20 - filled
  const colorFn = purity >= 80 ? chalk.green : purity >= 50 ? chalk.rgb(255, 193, 7) : chalk.rgb(244, 67, 54)
  return `${colorFn('█'.repeat(Math.max(filled, 0)) + '░'.repeat(Math.max(empty, 0)))} ${purity}%`
}

// ─── Stats ────────────────────────────────────────────────────────────────────

/**
 * Format spectrum stats.
 *
 * @example
 * formatSpectrumStats(stats)
 */
export function formatSpectrumStats(stats: SpectrumStats): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Spectrum Stats:'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────────'))
  lines.push(`  Total occurrences: ${stats.totalLines} | Unique patterns: ${stats.uniquePatterns}`)
  lines.push(`  Dominant: ${stats.dominantWavelength}`)
  lines.push(`  Noisiest band: ${stats.noisiestBand} | Cleanest: ${stats.cleanestBand}`)
  lines.push(`  Purity: ${formatPurityMeter(stats.spectralPurity)}`)
  lines.push(`  Entropy: ${stats.entropy} | Signal/Noise: ${stats.signalToNoise}`)
  lines.push(chalk.gray('  ────────────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Anomaly Alerts ───────────────────────────────────────────────────────────

/**
 * Format anomaly alerts.
 *
 * @example
 * formatAnomalyAlerts(anomalies)
 */
export function formatAnomalyAlerts(anomalies: SpectralAnomaly[]): string {
  if (anomalies.length === 0) return chalk.dim('  No anomalies detected.')
  const lines: string[] = []
  lines.push(chalk.bold('  Anomaly Alerts:'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────────'))

  for (const a of anomalies) {
    const icon = a.severity === 'critical' ? chalk.rgb(244, 67, 54)('⚠') : a.severity === 'warning' ? chalk.rgb(255, 193, 7)('△') : chalk.dim('ℹ')
    lines.push(`  ${icon} [${a.type}] ${a.pattern}: ${a.actual}`)
    if (a.files.length > 0) {
      lines.push(chalk.dim(`    Files: ${a.files.slice(0, 3).join(', ')}`))
    }
  }

  lines.push(chalk.gray('  ────────────────────────────────────────────────────────'))
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
  lines.push(chalk.gray('  ────────────────────────────────────────────────────────'))
  for (let i = 0; i < recs.length; i++) {
    lines.push(`  ${i + 1}. ${recs[i]}`)
  }
  lines.push(chalk.gray('  ────────────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Full Output ──────────────────────────────────────────────────────────────

/**
 * Format full spectrometer table.
 *
 * @example
 * formatSpectrumTable(result)
 */
export function formatSpectrumTable(result: SpectrumResult): string {
  const sections: string[] = []
  sections.push('')
  sections.push(chalk.bold('  Code Spectrometer — Frequency Analysis\n'))
  sections.push(formatSpectrumChart(result.spectrum))
  sections.push('')
  sections.push(formatBandBreakdown(result.bands))
  sections.push('')
  sections.push(formatSpectralLineTable(result.spectrum))
  sections.push('')
  sections.push(formatSpectrumStats(result.stats))
  sections.push('')
  sections.push(formatAnomalyAlerts(result.anomalies))
  sections.push('')
  sections.push(formatRecommendations(result.recommendations))
  sections.push('')
  return sections.join('\n')
}

/**
 * Format spectrometer result as JSON.
 *
 * @example
 * formatSpectrumJSON(result)
 */
export function formatSpectrumJSON(result: SpectrumResult): string {
  return JSON.stringify(result, null, 2)
}
