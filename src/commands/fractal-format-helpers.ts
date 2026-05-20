import chalk from 'chalk'

import type {
  DimensionInterpretation,
  FileQuality,
  FractalDimension,
  FractalFile,
  FractalLevel,
  FractalOverallQuality,
  FractalPattern,
  FractalResult,
  FractalStats,
} from './fractal-helpers.js'

// ─── Color Maps ────────────────────────────────────────────────────────────────

const QUALITY_COLOR: Record<FractalOverallQuality, (s: string) => string> = {
  crystalline: chalk.rgb(72, 199, 142),
  organized: chalk.rgb(100, 200, 180),
  branching: chalk.rgb(200, 200, 80),
  organic: chalk.rgb(220, 150, 80),
  chaotic: chalk.rgb(220, 80, 80),
}

const FILE_QUALITY_COLOR: Record<FileQuality, (s: string) => string> = {
  mandelbrot: chalk.rgb(255, 215, 0),
  sierpinski: chalk.rgb(72, 199, 142),
  koch: chalk.rgb(100, 149, 237),
  tree: chalk.rgb(220, 150, 80),
  random: chalk.rgb(220, 80, 80),
}

const DIM_COLOR: Record<DimensionInterpretation, (s: string) => string> = {
  simple: chalk.rgb(100, 200, 180),
  moderate: chalk.rgb(100, 149, 237),
  complex: chalk.rgb(220, 150, 80),
  chaotic: chalk.rgb(220, 80, 80),
}

// ─── Label Formatters ──────────────────────────────────────────────────────────

/**
 * Format overall quality label.
 *
 * @example
 * formatQualityLabel('crystalline') // => colored string
 */
export function formatQualityLabel(quality: FractalOverallQuality): string {
  return (QUALITY_COLOR[quality] ?? ((s: string) => s))(quality)
}

/**
 * Format file quality label.
 *
 * @example
 * formatFileQualityLabel('mandelbrot') // => colored string
 */
export function formatFileQualityLabel(quality: FileQuality): string {
  return (FILE_QUALITY_COLOR[quality] ?? ((s: string) => s))(quality)
}

/**
 * Format dimension interpretation label.
 *
 * @example
 * formatDimensionLabel('moderate') // => colored string
 */
export function formatDimensionLabel(interp: DimensionInterpretation): string {
  return (DIM_COLOR[interp] ?? ((s: string) => s))(interp)
}

// ─── Gauge ─────────────────────────────────────────────────────────────────────

/**
 * Format a self-similarity gauge.
 *
 * @example
 * formatSimilarityGauge(75) // => gauge string
 */
export function formatSimilarityGauge(value: number, width: number = 20): string {
  const filled = Math.round((value / 100) * width)
  const empty = width - filled
  const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(empty)
  const color = value >= 70 ? chalk.rgb(72, 199, 142) : value >= 40 ? chalk.rgb(200, 180, 80) : chalk.rgb(220, 80, 80)
  return color(`${bar} ${value}`)
}

// ─── Patterns ──────────────────────────────────────────────────────────────────

/**
 * Format fractal patterns.
 *
 * @example
 * formatPatterns(patterns) // => pattern list
 */
export function formatPatterns(patterns: FractalPattern[]): string {
  const header = chalk.bold('Fractal Patterns')
  const separator = '\u2500'.repeat(75)

  if (patterns.length === 0) {
    return `${header}\n${separator}\nNo patterns detected.`
  }

  const lines = [header, separator]
  for (const p of patterns) {
    const similar = p.isSelfSimilar ? chalk.rgb(72, 199, 142)(' \u27F3') : ''
    lines.push(`${chalk.cyan(p.name.padEnd(25))} ${p.scale.padEnd(10)} occ:${p.occurrences}  con:${p.consistency}%${similar}`)
  }

  return lines.join('\n')
}

// ─── Levels ────────────────────────────────────────────────────────────────────

/**
 * Format fractal levels.
 *
 * @example
 * formatLevels(levels) // => level hierarchy
 */
export function formatLevels(levels: FractalLevel[]): string {
  const header = chalk.bold('Fractal Levels')
  const separator = '\u2500'.repeat(65)

  if (levels.length === 0) {
    return `${header}\n${separator}\nNo levels detected.`
  }

  const lines = [header, separator]
  for (const l of levels) {
    lines.push(`${l.scale.padEnd(12)} nodes:${l.nodes}  complexity:${l.avgComplexity}  patterns:${l.patternCount}  sim:${l.selfSimilarityScore}%`)
    lines.push(`  dominant: ${l.dominantPattern}`)
  }

  return lines.join('\n')
}

// ─── Dimension ─────────────────────────────────────────────────────────────────

/**
 * Format fractal dimension.
 *
 * @example
 * formatDimension(dimension) // => dimension report
 */
export function formatDimension(dim: FractalDimension): string {
  const label = formatDimensionLabel(dim.interpretation)
  return `Dimension: ${dim.dimension.toFixed(2)} (${label})\n  ${dim.description}`
}

// ─── Files ─────────────────────────────────────────────────────────────────────

/**
 * Format fractal file analysis.
 *
 * @example
 * formatFiles(files) // => file table
 */
export function formatFiles(files: FractalFile[]): string {
  const header = chalk.bold('Fractal File Analysis')
  const separator = '\u2500'.repeat(80)

  if (files.length === 0) {
    return `${header}\n${separator}\nNo files analyzed.`
  }

  const lines = [header, separator]
  for (const f of files) {
    const quality = formatFileQualityLabel(f.quality)
    lines.push(`${chalk.cyan(f.file.padEnd(35))} ${quality.padEnd(12)} sim:${f.selfSimilarity}%  depth:${f.fractalDepth}`)
    if (f.functionPatterns.length > 0) {
      lines.push(`  fn-patterns: ${f.functionPatterns.map(p => p.name).join(', ')}`)
    }
    if (f.classPatterns.length > 0) {
      lines.push(`  cls-patterns: ${f.classPatterns.map(p => p.name).join(', ')}`)
    }
  }

  return lines.join('\n')
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

/**
 * Format fractal stats summary.
 *
 * @example
 * formatFractalStats(stats) // => stats summary
 */
export function formatFractalStats(stats: FractalStats): string {
  const header = chalk.bold('Fractal Analysis')
  const separator = '\u2500'.repeat(55)
  const quality = formatQualityLabel(stats.fractalQuality)

  return [
    header,
    separator,
    `Patterns:         ${stats.totalPatterns} (self-similar:${stats.selfSimilarPatterns})`,
    `Avg Consistency:  ${stats.avgConsistency}%`,
    `Avg Similarity:   ${stats.avgSelfSimilarity}%`,
    `Fractal Dim:      ${stats.fractalDimension.toFixed(2)}`,
    `Max Depth:        ${stats.maxFractalDepth}`,
    `Scale Invariant:  ${stats.scaleInvariantCount}`,
    `Files:            mandelbrot:${stats.mandelbrotFiles} random:${stats.randomFiles}`,
    separator,
    `Self-Similarity:  ${formatSimilarityGauge(stats.overallSelfSimilarity, 15)}`,
    `Iteration Score:  ${formatSimilarityGauge(stats.iterationScore, 15)}`,
    separator,
    `Quality:          ${quality}`,
  ].join('\n')
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
    return `${header}\n${separator}\nNo recommendations. Beautiful fractal structure!`
  }

  const lines = [header, separator]
  for (let i = 0; i < recommendations.length; i++) {
    lines.push(`${i + 1}. ${recommendations[i]}`)
  }

  return lines.join('\n')
}

// ─── Full Table ────────────────────────────────────────────────────────────────

/**
 * Format full fractal table output.
 *
 * @example
 * formatFractalTable(result) // => full table string
 */
export function formatFractalTable(result: FractalResult): string {
  return [
    formatFractalStats(result.stats),
    '',
    formatDimension(result.dimension),
    '',
    formatLevels(result.levels),
    '',
    formatPatterns(result.patterns),
    '',
    formatFiles(result.files),
    '',
    formatRecommendations(result.recommendations),
  ].join('\n')
}

// ─── JSON ──────────────────────────────────────────────────────────────────────

/**
 * Format fractal result as JSON.
 *
 * @example
 * formatFractalJson(result) // => JSON string
 */
export function formatFractalJson(result: FractalResult): string {
  return JSON.stringify(result, null, 2)
}
