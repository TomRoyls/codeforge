import chalk from 'chalk'

import type {
  NoiseSource,
  OverallClarity,
  SignalBand,
  SignalCategory,
  SignalFile,
  SignalResult,
  SignalStats,
} from './signal-helpers.js'

// ─── Color Maps ────────────────────────────────────────────────────────────────

const CATEGORY_COLOR: Record<SignalCategory, (s: string) => string> = {
  'high-fidelity': chalk.rgb(72, 199, 142),
  'clear': chalk.rgb(100, 200, 180),
  'moderate': chalk.rgb(200, 200, 80),
  'noisy': chalk.rgb(220, 150, 80),
  'static': chalk.rgb(220, 80, 80),
}

const CLARITY_COLOR: Record<OverallClarity, (s: string) => string> = {
  'crystal-clear': chalk.rgb(72, 199, 142),
  'clear': chalk.rgb(100, 200, 180),
  'acceptable': chalk.rgb(200, 200, 80),
  'noisy': chalk.rgb(220, 150, 80),
  'static': chalk.rgb(220, 80, 80),
}

const NOISE_TYPE_COLOR: Record<string, (s: string) => string> = {
  'boilerplate': chalk.rgb(150, 150, 170),
  'restatement-comment': chalk.rgb(180, 180, 200),
  'dead-code': chalk.rgb(220, 80, 80),
  'redundant-pattern': chalk.rgb(220, 150, 80),
  'unnecessary-complexity': chalk.rgb(200, 120, 80),
  'over-documentation': chalk.rgb(180, 160, 140),
  'debug-residue': chalk.rgb(255, 99, 71),
  'duplicate-logic': chalk.rgb(255, 165, 0),
  'import-bloat': chalk.rgb(148, 103, 189),
  'verbose-syntax': chalk.rgb(200, 200, 80),
}

const BAND_COLOR: Record<string, (s: string) => string> = {
  'logic': chalk.rgb(72, 199, 142),
  'data-definition': chalk.rgb(100, 149, 237),
  'io': chalk.rgb(255, 165, 0),
  'control-flow': chalk.rgb(138, 120, 255),
  'error-handling': chalk.rgb(220, 80, 80),
  'validation': chalk.rgb(0, 206, 209),
  'configuration': chalk.rgb(200, 200, 80),
}

/**
 * Format signal category with color.
 *
 * @example
 * formatCategoryLabel('high-fidelity') // => colored string
 */
export function formatCategoryLabel(category: SignalCategory): string {
  const color = CATEGORY_COLOR[category] ?? ((s: string) => s)
  return color(category)
}

/**
 * Format clarity label with color.
 *
 * @example
 * formatClarityLabel('crystal-clear') // => colored string
 */
export function formatClarityLabel(clarity: OverallClarity): string {
  const color = CLARITY_COLOR[clarity] ?? ((s: string) => s)
  return color(clarity)
}

/**
 * Format noise type with color.
 *
 * @example
 * formatNoiseType('debug-residue') // => colored string
 */
export function formatNoiseType(type: string): string {
  const color = NOISE_TYPE_COLOR[type] ?? ((s: string) => s)
  return color(type)
}

/**
 * Format band type with color.
 *
 * @example
 * formatBandType('logic') // => colored string
 */
export function formatBandType(type: string): string {
  const color = BAND_COLOR[type] ?? ((s: string) => s)
  return color(type)
}

// ─── Gauge ─────────────────────────────────────────────────────────────────────

/**
 * Format SNR gauge.
 *
 * @example
 * formatSNRGauge(75) // => '███████████████░░░░░ 75%'
 */
export function formatSNRGauge(value: number, width: number = 20): string {
  const filled = Math.round((value / 100) * width)
  const empty = width - filled
  const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(empty)
  const color = value >= 80 ? chalk.rgb(72, 199, 142) : value >= 50 ? chalk.rgb(200, 180, 80) : chalk.rgb(220, 80, 80)
  return color(`${bar} ${value}%`)
}

// ─── Waveform ──────────────────────────────────────────────────────────────────

/**
 * Format signal waveform visualization.
 *
 * @example
 * formatWaveform(85, 15) // => waveform string
 */
export function formatWaveform(snr: number, _noise: number): string {
  const width = 40
  const signalHeight = Math.round((snr / 100) * 8)
  const bars: string[] = []
  for (let i = 0; i < width; i++) {
    const variation = Math.sin(i * 0.3) * 2
    const h = Math.max(1, Math.min(8, signalHeight + Math.round(variation)))
    bars.push('\u2588'.repeat(h))
  }
  return chalk.rgb(72, 199, 142)(bars.join(' '))
}

// ─── Files ─────────────────────────────────────────────────────────────────────

/**
 * Format signal file list.
 *
 * @example
 * formatSignalFiles(files) // => file list
 */
export function formatSignalFiles(files: SignalFile[]): string {
  const header = chalk.bold('Signal Analysis')
  const separator = '\u2500'.repeat(80)

  if (files.length === 0) {
    return `${header}\n${separator}\nNo files analyzed.`
  }

  const lines = [header, separator]

  for (const f of files) {
    const cat = formatCategoryLabel(f.analysis.category)
    lines.push(`${chalk.cyan(f.file.padEnd(40))} ${cat.padEnd(16)} SNR:${f.analysis.snr}%  BW:${f.analysis.bandwidth}%  signal:${f.analysis.signalLines}  noise:${f.analysis.noiseLines}`)
  }

  return lines.join('\n')
}

// ─── Noise Sources ─────────────────────────────────────────────────────────────

/**
 * Format noise sources breakdown.
 *
 * @example
 * formatNoiseSources(sources) // => noise table
 */
export function formatNoiseSources(sources: NoiseSource[]): string {
  const header = chalk.bold('Noise Sources')
  const separator = '\u2500'.repeat(70)

  if (sources.length === 0) {
    return `${header}\n${separator}\n${chalk.rgb(72, 199, 142)('No noise detected. Clean signal!')}`
  }

  const lines = [header, separator]

  for (const s of sources) {
    const typeLabel = formatNoiseType(s.type)
    const fixable = s.autoFixable ? chalk.rgb(72, 199, 142)('fixable') : chalk.rgb(200, 200, 80)('manual')
    lines.push(`${typeLabel.padEnd(25)} ${String(s.lines).padStart(3)} lines (${s.percentage}%)  ${fixable}`)
    lines.push(`  ${s.description}`)
  }

  return lines.join('\n')
}

// ─── Signal Bands ──────────────────────────────────────────────────────────────

/**
 * Format signal bands spectrum.
 *
 * @example
 * formatSignalBands(bands) // => band list
 */
export function formatSignalBands(bands: SignalBand[]): string {
  const header = chalk.bold('Signal Bands')
  const separator = '\u2500'.repeat(65)

  if (bands.length === 0) {
    return `${header}\n${separator}\nNo signal bands detected.`
  }

  const lines = [header, separator]

  for (const b of bands) {
    const label = formatBandType(b.type)
    lines.push(`${label.padEnd(20)} str:${b.strength}  freq:${b.frequency}  clarity:${b.clarity}  noise:${b.noiseInterference}`)
  }

  return lines.join('\n')
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

/**
 * Format signal stats summary.
 *
 * @example
 * formatSignalStats(stats) // => stats summary
 */
export function formatSignalStats(stats: SignalStats): string {
  const header = chalk.bold('Signal Analysis Summary')
  const separator = '\u2500'.repeat(55)

  const lines = [
    header,
    separator,
    `Lines:          ${stats.totalLines} (signal:${stats.totalSignal}  noise:${stats.totalNoise})`,
    `Files:          HF:${stats.highFidelityFiles}  noisy:${stats.noisyFiles}  static:${stats.staticFiles}`,
    separator,
    `SNR:            ${formatSNRGauge(stats.overallSNR, 15)}`,
    `Bandwidth:      ${formatSNRGauge(stats.overallBandwidth, 15)}`,
    `Avg SNR:        ${stats.avgSNR}%`,
    `Clarity:        ${formatClarityLabel(stats.overallClarity)}`,
    separator,
    `Noise Sources:  ${stats.totalNoiseSources} (debug:${stats.debugResidueLines} boiler:${stats.boilerplateLines} dead:${stats.deadCodeLines} redundant:${stats.redundantLines})`,
    `Auto-fixable:   ${stats.autoFixableLines} lines  Reduction: ${stats.noiseReduction}%`,
    separator,
    `Dominant Noise: ${formatNoiseType(stats.dominantNoiseType)}`,
    `Dominant Signal:${formatBandType(stats.dominantSignalType)}`,
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
    return `${header}\n${separator}\nNo recommendations. Clean signal!`
  }

  const lines = [header, separator]
  for (let i = 0; i < recommendations.length; i++) {
    lines.push(`${i + 1}. ${recommendations[i]}`)
  }

  return lines.join('\n')
}

// ─── Full Table ────────────────────────────────────────────────────────────────

/**
 * Format full signal table output.
 *
 * @example
 * formatSignalTable(result) // => full table string
 */
export function formatSignalTable(result: SignalResult): string {
  const allSources = result.files.flatMap(f => f.analysis.noiseSources)
  const allBands = result.files.flatMap(f => f.bands)

  return [
    formatSignalStats(result.stats),
    '',
    formatWaveform(result.stats.overallSNR, result.stats.totalNoise),
    '',
    formatSignalFiles(result.files),
    '',
    formatNoiseSources(allSources),
    '',
    formatSignalBands(allBands),
    '',
    formatRecommendations(result.recommendations),
  ].join('\n')
}

// ─── JSON ──────────────────────────────────────────────────────────────────────

/**
 * Format signal result as JSON.
 *
 * @example
 * formatSignalJson(result) // => JSON string
 */
export function formatSignalJson(result: SignalResult): string {
  return JSON.stringify(result, null, 2)
}
