import chalk from 'chalk'

import type {
  OverallClarity,
  PrismaticResult,
  PrismaticStats,
  RefractionPoint,
  SpectralBand,
  SpectralFile,
} from './prismatic-helpers.js'

// ─── Color Maps ────────────────────────────────────────────────────────────────

const CLARITY_COLOR: Record<string, (s: string) => string> = {
  ultraviolet: chalk.rgb(138, 43, 226),
  blue: chalk.rgb(100, 149, 237),
  green: chalk.rgb(72, 199, 142),
  yellow: chalk.rgb(200, 200, 80),
  orange: chalk.rgb(220, 150, 80),
  red: chalk.rgb(220, 80, 80),
  infrared: chalk.rgb(180, 60, 60),
}

const CONCERN_COLOR: Record<string, (s: string) => string> = {
  io: chalk.rgb(148, 103, 189),
  config: chalk.rgb(75, 0, 130),
  error: chalk.rgb(100, 149, 237),
  validation: chalk.rgb(0, 206, 209),
  logic: chalk.rgb(72, 199, 142),
  data: chalk.rgb(200, 200, 80),
  auth: chalk.rgb(255, 165, 0),
  logging: chalk.rgb(255, 99, 71),
  ui: chalk.rgb(220, 80, 80),
  testing: chalk.rgb(178, 34, 34),
}

/**
 * Format overall clarity with color.
 *
 * @example
 * formatClarity('ultraviolet') // => colored string
 */
export function formatClarity(clarity: OverallClarity): string {
  const color = CLARITY_COLOR[clarity] ?? ((s: string) => s)
  return color(clarity)
}

/**
 * Format concern name with color.
 *
 * @example
 * formatConcern('io') // => colored string
 */
export function formatConcern(concern: string): string {
  const color = CONCERN_COLOR[concern] ?? ((s: string) => s)
  return color(concern)
}

/**
 * Format separation gauge.
 *
 * @example
 * formatSeparationGauge(75) // => '███████████████░░░░░ 75%'
 */
export function formatSeparationGauge(value: number, width: number = 20): string {
  const filled = Math.round((value / 100) * width)
  const empty = width - filled
  const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(empty)
  const color = value >= 80 ? chalk.rgb(72, 199, 142) : value >= 50 ? chalk.rgb(200, 180, 80) : chalk.rgb(220, 80, 80)
  return color(`${bar} ${value}%`)
}

/**
 * Format severity badge.
 *
 * @example
 * formatSeverityBadge('severe-mix') // => 'severe-mix'
 */
export function formatSeverityBadge(severity: string): string {
  const colors: Record<string, (s: string) => string> = {
    clean: chalk.rgb(72, 199, 142),
    'minor-mix': chalk.rgb(200, 200, 80),
    'moderate-mix': chalk.rgb(220, 150, 80),
    'severe-mix': chalk.rgb(220, 80, 80),
  }
  return (colors[severity] ?? ((s: string) => s))(severity)
}

// ─── Spectrum Visualization ────────────────────────────────────────────────────

/**
 * Format spectral bands.
 *
 * @example
 * formatSpectrumBands(bands) // => band list
 */
export function formatSpectrumBands(bands: SpectralBand[]): string {
  const header = chalk.bold('Spectral Bands')
  const separator = '\u2500'.repeat(65)

  if (bands.length === 0) {
    return `${header}\n${separator}\nNo concerns detected.`
  }

  const lines = [header, separator]

  for (const band of bands) {
    const c = formatConcern(band.concern)
    lines.push(`${c.padEnd(15)} ${band.wavelength}nm  ${band.color.padEnd(12)} intensity:${band.intensity}  purity:${band.purity}  files:${band.files.length}`)
    if (band.overlapWith.length > 0) {
      lines.push(`  overlaps: ${band.overlapWith.map(formatConcern).join(', ')}`)
    }
  }

  return lines.join('\n')
}

// ─── Refraction Points ─────────────────────────────────────────────────────────

/**
 * Format refraction points.
 *
 * @example
 * formatRefractionPoints(points) // => point list
 */
export function formatRefractionPoints(points: RefractionPoint[]): string {
  const header = chalk.bold('Refraction Points')
  const separator = '\u2500'.repeat(60)

  if (points.length === 0) {
    return `${header}\n${separator}\n${chalk.rgb(72, 199, 142)('No concern mixing detected. Clean spectrum!')}`
  }

  const lines = [header, separator]

  for (const p of points) {
    const sev = formatSeverityBadge(p.severity)
    lines.push(`${sev.padEnd(15)} ${chalk.gray(p.file)}:${p.line}`)
    lines.push(`  ${p.description}`)
  }

  return lines.join('\n')
}

// ─── File Analysis ─────────────────────────────────────────────────────────────

/**
 * Format file spectral analysis.
 *
 * @example
 * formatFileAnalysis(files) // => file list
 */
export function formatFileAnalysis(files: SpectralFile[]): string {
  const header = chalk.bold('File Spectral Analysis')
  const separator = '\u2500'.repeat(70)

  if (files.length === 0) {
    return `${header}\n${separator}\nNo files analyzed.`
  }

  const lines = [header, separator]

  for (const f of files) {
    const purityTag = f.isMonochromatic ? chalk.rgb(72, 199, 142)('mono') : chalk.rgb(220, 150, 80)('poly')
    lines.push(`${chalk.cyan(f.file.padEnd(30))} ${purityTag}  sep:${f.separationScore}  purity:${f.spectralPurity}  errors:${f.refractionErrors}`)
    if (f.spectrum.length > 0) {
      lines.push(`  dominant: ${formatConcern(f.dominantConcern)}  secondary: [${f.secondaryConcerns.map(formatConcern).join(', ')}]`)
    }
  }

  return lines.join('\n')
}

// ─── Stats Summary ─────────────────────────────────────────────────────────────

/**
 * Format prismatic stats summary.
 *
 * @example
 * formatPrismaticStats(stats) // => summary string
 */
export function formatPrismaticStats(stats: PrismaticStats): string {
  const header = chalk.bold('Prismatic Analysis')
  const separator = '\u2500'.repeat(50)

  const lines = [
    header,
    separator,
    `Bands:          ${stats.totalBands} concerns detected`,
    `Files:          ${stats.monochromaticFiles} monochromatic, ${stats.polychromaticFiles} polychromatic`,
    `Refractions:    ${stats.totalRefractionPoints} (clean:${stats.cleanPoints} minor:${stats.minorMixPoints} moderate:${stats.moderateMixPoints} severe:${stats.severeMixPoints})`,
    separator,
    `Separation:     ${formatSeparationGauge(stats.separationIndex, 15)}`,
    `Purity:         ${formatSeparationGauge(stats.avgSpectralPurity, 15)}`,
    `Overlap:        ${formatSeparationGauge(stats.concernOverlap, 15)}`,
    `Completeness:   ${formatSeparationGauge(stats.spectrumCompleteness, 15)}`,
    separator,
    `Dominant:       ${formatConcern(stats.dominantConcern)}`,
    `Most Mixed:     ${stats.mostMixedFile || 'N/A'}`,
    `Purest:         ${stats.purestFile || 'N/A'}`,
    `Clarity:        ${formatClarity(stats.overallClarity)}`,
  ]

  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatRecommendations(['Fix X']) // => list string
 */
export function formatRecommendations(recommendations: string[]): string {
  const header = chalk.bold('Recommendations')
  const separator = '\u2500'.repeat(50)

  if (recommendations.length === 0) {
    return `${header}\n${separator}\nNo recommendations. Clean spectrum!`
  }

  const lines = [header, separator]
  for (let i = 0; i < recommendations.length; i++) {
    lines.push(`${i + 1}. ${recommendations[i]}`)
  }

  return lines.join('\n')
}

// ─── Full Table ────────────────────────────────────────────────────────────────

/**
 * Format full prismatic table output.
 *
 * @example
 * formatPrismaticTable(result) // => full table string
 */
export function formatPrismaticTable(result: PrismaticResult): string {
  return [
    formatPrismaticStats(result.stats),
    '',
    formatSpectrumBands(result.bands),
    '',
    formatFileAnalysis(result.files),
    '',
    formatRefractionPoints(result.refractionPoints),
    '',
    formatRecommendations(result.recommendations),
  ].join('\n')
}

// ─── JSON ──────────────────────────────────────────────────────────────────────

/**
 * Format prismatic result as JSON.
 *
 * @example
 * formatPrismaticJson(result) // => JSON string
 */
export function formatPrismaticJson(result: PrismaticResult): string {
  return JSON.stringify(result, null, 2)
}
