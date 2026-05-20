import chalk from 'chalk'
import type { KaleidoscopePrismResult, LightRay, LightSpectrum, KaleidoscopePrismStats } from './kaleidoscope-prism-helpers.js'

// ─── Color Utilities ────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function wavelengthColor(w: string): string {
  switch (w) {
    case 'red': return chalk.red(w)
    case 'orange': return chalk.rgb(255, 165, 0)(w)
    case 'yellow': return chalk.yellow(w)
    case 'green': return chalk.green(w)
    case 'blue': return chalk.blue(w)
    case 'indigo': return chalk.magenta(w)
    case 'violet': return chalk.cyan(w)
    default: return chalk.dim(w)
  }
}

function lightTypeColor(t: string): string {
  if (t === 'laser') return chalk.green(t)
  if (t === 'focused') return chalk.blue(t)
  if (t === 'diffuse') return chalk.cyan(t)
  if (t === 'scattered') return chalk.yellow(t)
  if (t === 'dim') return chalk.rgb(255, 165, 0)(t)
  return chalk.red(t)
}

function classificationColor(c: string): string {
  if (c === 'crystal') return chalk.rgb(255, 215, 0)(c)
  if (c === 'glass') return chalk.green(c)
  if (c === 'prism') return chalk.magenta(c)
  if (c === 'lens') return chalk.blue(c)
  if (c === 'mirror') return chalk.cyan(c)
  if (c === 'fog') return chalk.yellow(c)
  return chalk.red(c)
}

function healthColor(h: string): string {
  if (h === 'brilliant') return chalk.rgb(255, 215, 0)(h)
  if (h === 'clear') return chalk.green(h)
  if (h === 'hazy') return chalk.blue(h)
  if (h === 'cloudy') return chalk.yellow(h)
  if (h === 'foggy') return chalk.rgb(255, 165, 0)(h)
  return chalk.red(h)
}

function gradeColor(g: string): string {
  if (g === 'diamond') return chalk.rgb(255, 215, 0)(g)
  if (g === 'crystal') return chalk.green(g)
  if (g === 'glass') return chalk.blue(g)
  if (g === 'plastic') return chalk.yellow(g)
  if (g === 'muddy') return chalk.rgb(255, 165, 0)(g)
  return chalk.red(g)
}

// ─── Ray Formatting ──────────────────────────────────────────────────────────

function formatRay(r: LightRay, verbose: boolean): string {
  const markers: string[] = []
  if (r.isUltraviolet) markers.push(chalk.magenta('[UV]'))
  if (r.isInfrared) markers.push(chalk.red('[IR]'))
  if (r.isMonochromatic) markers.push(chalk.green('[mono]'))

  const line = `  ${chalk.bold(r.file)} clarity:${scoreColor(r.clarity)} lum:${scoreColor(r.luminosity)} refr:${scoreColor(r.refractionIndex)} disp:${scoreColor(100 - r.dispersion)} focal:${scoreColor(r.focalPower)} ${lightTypeColor(r.lightType)} ${classificationColor(r.classification)} ${wavelengthColor(r.dominantWavelength)}${markers.length > 0 ? ' ' + markers.join(' ') : ''}`

  if (!verbose) return line

  const details = [line]
  const sp = r.spectrum
  details.push(`    R:${sp.red} O:${sp.orange} Y:${sp.yellow} G:${sp.green} B:${sp.blue} I:${sp.indigo} V:${sp.violet} bw:${r.bandwidth}`)
  if (r.reflections.length > 0) details.push(`    reflections: ${r.reflections.join(', ')}`)
  return details.join('\n')
}

// ─── Spectrum Formatting ─────────────────────────────────────────────────────

function formatSpectrum(s: LightSpectrum, verbose: boolean): string {
  const line = `  ${chalk.bold(s.directory)} clarity:${scoreColor(s.avgClarity)} lum:${scoreColor(s.avgLuminosity)} spread:${scoreColor(s.spectralSpread)} balance:${scoreColor(s.lightBalance)} ${healthColor(s.opticalHealth)} rays:${s.rays.length} ${wavelengthColor(s.dominantWavelength)}`

  if (!verbose) return line
  const details = [line]
  details.push(`    dead:${s.deadZoneCount} hot:${s.hotSpotCount} refr:${s.totalRefractions} refl:${s.totalReflections} abs:${s.totalAbsorptions} emit:${s.totalEmissions}`)
  return details.join('\n')
}

// ─── Stats Formatting ────────────────────────────────────────────────────────

function formatStats(stats: KaleidoscopePrismStats): string {
  return [
    `  Optical Grade: ${gradeColor(stats.opticalGrade)} | Clarity: ${scoreColor(stats.overallClarity)} | Dominant: ${wavelengthColor(stats.dominantWavelength)}`,
    `  Files: ${stats.totalFiles} | Spectra: ${stats.totalSpectra}`,
    `  Avg Clarity: ${scoreColor(stats.avgClarity)} | Luminosity: ${scoreColor(stats.avgLuminosity)} | Refraction: ${scoreColor(stats.avgRefractionIndex)} | Dispersion: ${scoreColor(100 - stats.avgDispersion)} | Focal: ${scoreColor(stats.avgFocalPower)}`,
    `  Crystal: ${chalk.rgb(255, 215, 0)(String(stats.crystalFiles))} | Opaque: ${chalk.red(String(stats.opaqueFiles))} | Laser: ${chalk.green(String(stats.laserFiles))} | Dark: ${chalk.red(String(stats.darkFiles))}`,
    `  Mono: ${stats.monochromaticFiles} | Poly: ${stats.polychromaticFiles} | UV: ${stats.ultravioletFiles} | IR: ${stats.infraredFiles}`,
    `  Dead Zones: ${chalk.red(String(stats.deadZones))} | Hot Spots: ${chalk.yellow(String(stats.hotSpots))} | Balance: ${scoreColor(stats.lightBalance)}`,
    `  Brightest: ${chalk.green(stats.brightestFile)} | Darkest: ${chalk.red(stats.darkestFile)}`,
  ].join('\n')
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format kaleidoscope-prism result as a table
 * @example
 * formatKaleidoscopePrismTable(result, false) // string
 */
export function formatKaleidoscopePrismTable(result: KaleidoscopePrismResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🌈 Kaleidoscope Prism - Code Light Refraction Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('🔦 Light Rays'))
  if (result.rays.length === 0) {
    lines.push(chalk.dim('  No rays detected.'))
  } else {
    const display = verbose ? result.rays : result.rays.slice(0, 15)
    for (const r of display) {
      lines.push(formatRay(r, verbose))
    }
    if (!verbose && result.rays.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.rays.length - 15} more`))
    }
  }
  lines.push('')

  if (result.spectra.length > 0) {
    lines.push(chalk.bold('📊 Light Spectra'))
    for (const s of result.spectra) {
      lines.push(formatSpectrum(s, verbose))
    }
    lines.push('')
  }

  lines.push(chalk.bold('📈 Statistics'))
  lines.push(formatStats(result.stats))

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('💡 Recommendations'))
    for (const rec of result.recommendations) {
      lines.push(`  • ${rec}`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

// ─── JSON Formatter ──────────────────────────────────────────────────────────

/**
 * Format kaleidoscope-prism result as JSON
 * @example
 * formatKaleidoscopePrismJson(result) // string
 */
export function formatKaleidoscopePrismJson(result: KaleidoscopePrismResult): string {
  return JSON.stringify(result, null, 2)
}
