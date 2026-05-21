import chalk from 'chalk'
import type { PrismSpectrumResult, SpectralBand, SpectrumReading, FullSpectrum } from './prism-spectrum-helpers.js'

// ─── Color Utilities ─────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function classColor(c: string): string {
  switch (c) {
    case 'ultraviolet': return chalk.rgb(148, 0, 211)(c)
    case 'violet': return chalk.rgb(138, 43, 226)(c)
    case 'blue': return chalk.blue(c)
    case 'cyan': return chalk.cyan(c)
    case 'green': return chalk.green(c)
    case 'yellow': return chalk.yellow(c)
    case 'orange': return chalk.rgb(255, 165, 0)(c)
    case 'red': return chalk.red(c)
    case 'infrared': return chalk.rgb(139, 0, 0)(c)
    case 'white-light': return chalk.white(c)
    default: return chalk.dim(c)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'monochromatic': return chalk.rgb(255, 215, 0)(g)
    case 'narrow-band': return chalk.green(g)
    case 'broad-band': return chalk.blue(g)
    case 'wide-band': return chalk.yellow(g)
    case 'full-spectrum': return chalk.rgb(255, 165, 0)(g)
    case 'white-noise': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

function healthColor(h: string): string {
  switch (h) {
    case 'clean-rainbow': return chalk.green(h)
    case 'clear': return chalk.blue(h)
    case 'hazy': return chalk.yellow(h)
    case 'muddy': return chalk.rgb(255, 165, 0)(h)
    case 'chaotic': return chalk.red(h)
    case 'white-noise': return chalk.rgb(139, 0, 0)(h)
    default: return chalk.dim(h)
  }
}

function specGradeColor(g: string): string {
  switch (g) {
    case 'master-optician': return chalk.rgb(255, 215, 0)(g)
    case 'optician': return chalk.green(g)
    case 'physicist': return chalk.blue(g)
    case 'student': return chalk.yellow(g)
    case 'colorblind': return chalk.rgb(255, 165, 0)(g)
    case 'blind': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

// ─── Band Formatting ─────────────────────────────────────────────────────────

function formatBand(b: SpectralBand, verbose: boolean): string {
  const markers: string[] = []
  if (b.isWhiteLight) markers.push(chalk.white('WL'))
  if (b.isMonochromatic) markers.push(chalk.green('MC'))
  if (b.purityGrade === 'white-noise') markers.push(chalk.red('WN'))
  const marker = markers.length > 0 ? markers.join(',') : ' '

  const line = ` ${marker} ${chalk.bold(b.file)} ${classColor(b.spectralClass)} ${gradeColor(b.purityGrade)} purity:${scoreColor(b.spectralPurity)} concerns:${b.concernCount} peak:${scoreColor(b.peakIntensity)}`

  if (!verbose) return line

  const details = [line]
  const spec = b.spectrum
  const active = Object.entries(spec).filter(([, v]) => v > 0).map(([k, v]) => `${k}:${v}`)
  details.push(`    dominant:${b.dominantConcerns.join(',')} overlap:${b.overlap} dispersion:${b.dispersion} bandwidth:${b.bandwidth}`)
  if (active.length > 0) details.push(`    spectrum: ${active.join(' ')}`)
  if (b.crossContamination.totalCrossContamination > 0) {
    details.push(`    cross-contamination: ${b.crossContamination.totalCrossContamination}`)
  }
  return details.join('\n')
}

// ─── Reading Formatting ──────────────────────────────────────────────────────

function formatReading(r: SpectrumReading, verbose: boolean): string {
  const line = `  ${chalk.bold(r.directory)} ${healthColor(r.spectrumHealth)} purity:${scoreColor(r.avgPurity)} separation:${scoreColor(r.separationQuality)} bands:${r.bands.length}`

  if (!verbose) return line
  const details = [line]
  details.push(`    overlap:${r.avgOverlap} dispersion:${r.avgDispersion} mono:${r.monochromaticCount} white:${r.whiteLightCount} dominant:${r.dominantConcern}`)
  return details.join('\n')
}

// ─── Full Spectrum Formatting ────────────────────────────────────────────────

function formatFullSpectrum(fs: FullSpectrum): string {
  return [
    `  Concerns: ${fs.totalConcerns} | Purity: ${scoreColor(fs.avgPurity)} | Overlap: ${scoreColor(fs.avgOverlap)} | Dispersion: ${scoreColor(fs.avgDispersion)}`,
    `  Mono: ${chalk.green(String(fs.monochromaticFiles))} | White: ${chalk.red(String(fs.whiteLightFiles))} | Contamination: ${chalk.yellow(String(fs.totalCrossContamination))} | Separation: ${scoreColor(fs.overallSeparation)} | Well: ${fs.isWellSeparated ? chalk.green('yes') : chalk.red('no')}`,
  ].join('\n')
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format prism spectrum result as a table
 * @example
 * formatPrismSpectrumTable(result, false) // string
 */
export function formatPrismSpectrumTable(result: PrismSpectrumResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🌈 Prism Spectrum - Concern Separation Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('📊 Spectral Bands'))
  if (result.bands.length === 0) {
    lines.push(chalk.dim('  No bands detected.'))
  } else {
    const display = verbose ? result.bands : result.bands.slice(0, 15)
    for (const b of display) {
      lines.push(formatBand(b, verbose))
    }
    if (!verbose && result.bands.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.bands.length - 15} more`))
    }
  }
  lines.push('')

  if (result.readings.length > 0) {
    lines.push(chalk.bold('🔭 Spectrum Readings'))
    for (const r of result.readings) {
      lines.push(formatReading(r, verbose))
    }
    lines.push('')
  }

  lines.push(chalk.bold('🌠 Full Spectrum'))
  lines.push(formatFullSpectrum(result.fullSpectrum))
  lines.push('')

  lines.push(chalk.bold('📈 Statistics'))
  const s = result.stats
  lines.push(`  Grade: ${specGradeColor(s.spectroscopistGrade)} | Purest: ${chalk.green(s.purestFile)} | Contaminated: ${chalk.red(s.mostContaminated)}`)
  lines.push(`  Mono: ${chalk.green(s.mostMonochromatic)} | WhiteLight: ${chalk.red(s.mostWhiteLight)} | Clean: ${chalk.blue(s.cleanestReading)} | Dirty: ${chalk.yellow(s.dirtiestReading)}`)

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('💡 Recommendations'))
    for (const rec of result.recommendations) {
      lines.push(`  - ${rec}`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

// ─── JSON Formatter ──────────────────────────────────────────────────────────

/**
 * Format prism spectrum result as JSON
 * @example
 * formatPrismSpectrumJson(result) // string
 */
export function formatPrismSpectrumJson(result: PrismSpectrumResult): string {
  return JSON.stringify(result, null, 2)
}
