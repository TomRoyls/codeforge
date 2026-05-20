import chalk from 'chalk'

import type { Measurement, SamplerResult, SamplerStats, SampleResult as SResult } from './sampler-helpers.js'

// ─── Sampling Summary ─────────────────────────────────────────────────────────

/**
 * Format sampling summary.
 *
 * @example
 * formatSamplingSummary(sample, stats)
 */
export function formatSamplingSummary(sample: { files: string[]; size: number; method: string; seed: number }, stats: SamplerStats): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Sampling Summary'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))
  lines.push(`  Method:             ${sample.method}`)
  lines.push(`  Seed:               ${sample.seed}`)
  lines.push(`  Population:         ${stats.populationSize} files`)
  lines.push(`  Sample size:        ${stats.sampleSize} files`)
  lines.push(`  Sampling rate:      ${stats.samplingRate}%`)
  lines.push(`  Measurements:       ${stats.measurementsCount}`)
  lines.push(`  High confidence:    ${stats.estimatesWithHighConfidence}/${stats.measurementsCount}`)
  lines.push(`  Overall confidence: ${stats.overallConfidence}%`)
  lines.push('')
  return lines.join('\n')
}

// ─── Measurements Table ────────────────────────────────────────────────────────

/**
 * Format measurements table.
 *
 * @example
 * formatMeasurementsTable(measurements)
 */
export function formatMeasurementsTable(measurements: Measurement[]): string {
  if (measurements.length === 0) return chalk.gray('  No measurements')

  const lines: string[] = []
  lines.push(chalk.bold('  Measurement Statistics'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  for (const m of measurements) {
    lines.push(`  ${chalk.bold(m.name)}`)
    lines.push(`    Mean: ${m.mean.toFixed(1)}  Median: ${m.median.toFixed(1)}  StdDev: ${m.stddev.toFixed(1)}`)
    lines.push(`    Min: ${m.min}  Max: ${m.max}  Range: ${m.max - m.min}`)
    lines.push(`    P25: ${m.p25.toFixed(1)}  P75: ${m.p75.toFixed(1)}  P95: ${m.p95.toFixed(1)}`)
    lines.push(`    95% CI: [${m.confidenceInterval[0].toFixed(1)}, ${m.confidenceInterval[1].toFixed(1)}]`)
  }

  lines.push('')
  return lines.join('\n')
}

// ─── Distribution Histogram ───────────────────────────────────────────────────

/**
 * Format ASCII distribution histogram.
 *
 * @example
 * formatHistogram(measurements[0])
 */
export function formatHistogram(measurement: Measurement): string {
  const lines: string[] = []
  lines.push(chalk.bold(`  Distribution: ${measurement.name}`))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  if (measurement.values.length === 0) {
    lines.push(chalk.gray('  No data'))
    lines.push('')
    return lines.join('\n')
  }

  const bins = 10
  const range = measurement.max - measurement.min || 1
  const binWidth = range / bins
  const counts = new Array(bins).fill(0)

  for (const v of measurement.values) {
    const idx = Math.min(Math.floor((v - measurement.min) / binWidth), bins - 1)
    counts[idx]++
  }

  const maxCount = Math.max(...counts, 1)

  for (let i = 0; i < bins; i++) {
    const barLen = Math.round((counts[i]! / maxCount) * 30)
    const bar = '█'.repeat(barLen)
    const lo = (measurement.min + i * binWidth).toFixed(0)
    const hi = (measurement.min + (i + 1) * binWidth).toFixed(0)
    lines.push(`  ${lo.padStart(5)}-${hi.padEnd(5)} ${chalk.rgb(100, 200, 100)(bar)} ${counts[i]}`)
  }

  lines.push('')
  return lines.join('\n')
}

// ─── Population Estimates ─────────────────────────────────────────────────────

/**
 * Format population estimates.
 *
 * @example
 * formatEstimates(estimates)
 */
export function formatEstimates(estimates: SResult[]): string {
  if (estimates.length === 0) return chalk.gray('  No estimates')

  const lines: string[] = []
  lines.push(chalk.bold('  Population Estimates'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  for (const e of estimates) {
    const confColor = e.error <= e.populationEstimate * 0.3 || e.populationEstimate === 0
      ? chalk.rgb(100, 200, 100)
      : chalk.rgb(255, 165, 0)

    lines.push(`  ${chalk.bold(e.measurement)}`)
    lines.push(`    Sample mean: ${e.sampleMean.toFixed(1)}  Population est: ${e.populationEstimate}`)
    lines.push(`    95% CI: [${e.confidenceInterval[0]}, ${e.confidenceInterval[1]}]  MoE: ${confColor(String(e.error))}`)
  }

  lines.push('')
  return lines.join('\n')
}

// ─── Confidence Indicators ─────────────────────────────────────────────────────

/**
 * Format confidence indicators.
 *
 * @example
 * formatConfidenceIndicators(estimates)
 */
export function formatConfidenceIndicators(estimates: SResult[]): string {
  if (estimates.length === 0) return chalk.gray('  No confidence data')

  const lines: string[] = []
  lines.push(chalk.bold('  Confidence Indicators'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  for (const e of estimates) {
    const ratio = e.populationEstimate > 0 ? e.error / e.populationEstimate : 0
    const bars = Math.max(1, Math.round((1 - Math.min(1, ratio)) * 20))
    const bar = '█'.repeat(bars) + '░'.repeat(20 - bars)
    const color = ratio < 0.1 ? chalk.rgb(50, 205, 50) : ratio < 0.3 ? chalk.rgb(255, 200, 50) : chalk.rgb(220, 50, 50)
    lines.push(`  ${chalk.dim(e.measurement.padEnd(20))} ${color(bar)} ${e.confidence}%`)
  }

  lines.push('')
  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatRecommendations(['Increase sample size'])
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.gray('  No recommendations')

  const lines: string[] = []
  lines.push(chalk.bold('  Recommendations'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  for (let i = 0; i < recs.length; i++) {
    lines.push(`  ${chalk.bold(`${i + 1}.`)} ${recs[i]}`)
  }

  lines.push('')
  return lines.join('\n')
}

// ─── Full Table ────────────────────────────────────────────────────────────────

/**
 * Format full sampler table.
 *
 * @example
 * formatSamplerTable(result)
 */
export function formatSamplerTable(result: SamplerResult): string {
  const parts: string[] = []
  parts.push(formatSamplingSummary(result.sample, result.stats))
  parts.push(formatMeasurementsTable(result.measurements))
  for (const m of result.measurements.slice(0, 3)) {
    parts.push(formatHistogram(m))
  }
  parts.push(formatEstimates(result.estimates))
  parts.push(formatConfidenceIndicators(result.estimates))
  parts.push(formatRecommendations(result.recommendations))
  return parts.join('\n')
}

// ─── JSON ──────────────────────────────────────────────────────────────────────

/**
 * Format sampler result as JSON.
 *
 * @example
 * formatSamplerJSON(result)
 */
export function formatSamplerJSON(result: SamplerResult): string {
  return JSON.stringify(result, null, 2)
}
