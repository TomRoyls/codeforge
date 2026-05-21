import chalk from 'chalk'
import type { LighthouseLensResult, LensReading, CoastalStation, LighthouseLensStats } from './lighthouse-lens-helpers.js'

// ─── Color Helpers ──────────────────────────────────────

/**
 * Colorize a numeric score
 * @example
 * scoreColor(85) // green bold
 */
export function scoreColor(score: number): string {
  if (score >= 70) return chalk.bold.green(String(score))
  if (score >= 40) return chalk.yellow(String(score))
  return chalk.red(String(score))
}

/**
 * Colorize beam type
 * @example
 * beamTypeColor('fresnel') // green bold
 */
export function beamTypeColor(type: string): string {
  if (type === 'fresnel') return chalk.bold.green(type)
  if (type === 'parabolic') return chalk.green(type)
  if (type === 'LED') return chalk.cyan(type)
  if (type === 'halogen') return chalk.yellow(type)
  if (type === 'oil-lamp') return chalk.rgb(200, 130, 50)(type)
  return chalk.gray(type)
}

/**
 * Colorize condition
 * @example
 * conditionColor('pharos-of-alexandria') // green bold
 */
export function conditionColor(condition: string): string {
  if (condition === 'pharos-of-alexandria') return chalk.bold.green(condition)
  if (condition === 'modern-automated') return chalk.green(condition)
  if (condition === 'classic-fresnel') return chalk.cyan(condition)
  if (condition === 'solar-powered') return chalk.yellow(condition)
  if (condition === 'decommissioned') return chalk.rgb(200, 130, 50)(condition)
  return chalk.gray(condition)
}

/**
 * Colorize lens material
 * @example
 * materialColor('crystal') // magenta bold
 */
export function materialColor(material: string): string {
  if (material === 'crystal') return chalk.bold.magenta(material)
  if (material === 'glass') return chalk.magenta(material)
  if (material === 'polycarbonate') return chalk.cyan(material)
  if (material === 'plastic') return chalk.green(material)
  if (material === 'cloudy') return chalk.yellow(material)
  return chalk.gray(material)
}

/**
 * Colorize rotation pattern
 * @example
 * patternColor('quick-flashing') // cyan
 */
export function patternColor(pattern: string): string {
  const colors: Record<string, (s: string) => string> = {
    'quick-flashing': chalk.bold.cyan, rotating: chalk.cyan, flashing: chalk.green,
    'group-flashing': chalk.yellow, occulting: chalk.rgb(200, 130, 50), fixed: chalk.gray,
  }
  return (colors[pattern] ?? chalk.white)(pattern)
}

/**
 * Colorize visibility condition
 * @example
 * visConditionColor('excellent') // green bold
 */
export function visConditionColor(condition: string): string {
  if (condition === 'excellent') return chalk.bold.green(condition)
  if (condition === 'good') return chalk.green(condition)
  if (condition === 'moderate') return chalk.cyan(condition)
  if (condition === 'poor') return chalk.yellow(condition)
  if (condition === 'minimal') return chalk.rgb(200, 130, 50)(condition)
  return chalk.gray(condition)
}

/**
 * Colorize warning type
 * @example
 * warningTypeColor('fog-horn') // red bold
 */
export function warningTypeColor(type: string): string {
  if (type === 'fog-horn') return chalk.bold.red(type)
  if (type === 'radio-beacon') return chalk.green(type)
  if (type === 'racon') return chalk.cyan(type)
  if (type === 'bell') return chalk.yellow(type)
  if (type === 'whistle') return chalk.rgb(200, 130, 50)(type)
  return chalk.gray(type)
}

/**
 * Colorize keeper grade
 * @example
 * keeperGradeColor('head-keeper') // green bold
 */
export function keeperGradeColor(grade: string): string {
  if (grade === 'head-keeper') return chalk.bold.green(grade)
  if (grade === 'principal-keeper') return chalk.green(grade)
  if (grade === 'assistant-keeper') return chalk.cyan(grade)
  if (grade === 'lamplighter') return chalk.yellow(grade)
  if (grade === 'watchman') return chalk.rgb(200, 130, 50)(grade)
  return chalk.red(grade)
}

/**
 * Colorize station condition
 * @example
 * stationCondColor('coast-guard-standard') // green bold
 */
export function stationCondColor(condition: string): string {
  if (condition === 'coast-guard-standard') return chalk.bold.green(condition)
  if (condition === 'well-maintained') return chalk.green(condition)
  if (condition === 'functional') return chalk.cyan(condition)
  if (condition === 'aging') return chalk.yellow(condition)
  if (condition === 'dilapidated') return chalk.rgb(200, 130, 50)(condition)
  return chalk.gray(condition)
}

// ─── Reading Formatting ─────────────────────────────────

/**
 * Format a single lens reading
 * @example
 * formatReading(reading, false) // colored output
 */
export function formatReading(reading: LensReading, verbose: boolean): string {
  const lines: string[] = []
  const score = scoreColor(reading.qualityScore)
  const cond = conditionColor(reading.condition)
  lines.push(`  ${chalk.white(reading.file)} ${beamTypeColor(reading.beam.type)} ${score} ${cond}`)

  if (verbose) {
    lines.push(`    Beam: intensity=${scoreColor(reading.beamIntensity)} ${beamTypeColor(reading.beam.type)} bright=${reading.beam.isBright} darkSpots=${reading.beam.darkSpotCount}`)
    lines.push(`    Lens: quality=${scoreColor(reading.lensQuality)} ${materialColor(reading.lens.material)} crystal=${reading.lens.isCrystal} defects=${reading.lens.defectCount}`)
    lines.push(`    Focal: precision=${scoreColor(reading.focalPrecision)} focus=${reading.focal.hasSharpFocus} aberration=${reading.focal.hasAberration}`)
    lines.push(`    Rotation: speed=${scoreColor(reading.rotationSpeed)} ${patternColor(reading.rotation.pattern)} reliable=${reading.rotation.isReliable}`)
    lines.push(`    Visibility: range=${scoreColor(reading.visibilityRange)} ${visConditionColor(reading.visibility.condition)} longRange=${reading.visibility.hasLongRange}`)
    lines.push(`    Warning: system=${scoreColor(reading.warningSystem)} ${warningTypeColor(reading.warning.type)} collision=${reading.warning.hasCollisionAvoidance}`)
  }

  return lines.join('\n')
}

// ─── Station Formatting ─────────────────────────────────

/**
 * Format a coastal station
 * @example
 * formatStation(station, false) // colored output
 */
export function formatStation(station: CoastalStation, verbose: boolean): string {
  const lines: string[] = []
  const beam = scoreColor(station.avgBeamIntensity)
  const cond = stationCondColor(station.condition)

  lines.push(`  ${chalk.white(station.directory)} beam=${beam} lens=${scoreColor(station.avgLensQuality)} ${cond}`)
  lines.push(`    type=${station.stationType} readings=${station.readings.length} pharos=${station.pharosCount} shipwreck=${station.shipwreckCount}`)

  if (verbose) {
    for (const reading of station.readings) {
      lines.push(formatReading(reading, false))
    }
  }

  return lines.join('\n')
}

// ─── Stats Formatting ───────────────────────────────────

/**
 * Format stats summary
 * @example
 * formatStats(stats) // multi-line stats
 */
export function formatStats(stats: LighthouseLensStats): string {
  const lines: string[] = []
  lines.push(`  ${chalk.bold('Files')}: ${stats.totalFiles}  ${chalk.bold('Stations')}: ${stats.totalStations}`)
  lines.push(`  ${chalk.bold('Avg Beam')}: ${scoreColor(stats.avgBeamIntensity)}  ${chalk.bold('Avg Lens')}: ${scoreColor(stats.avgLensQuality)}`)
  lines.push(`  ${chalk.bold('Avg Focal')}: ${scoreColor(stats.avgFocalPrecision)}  ${chalk.bold('Avg Rotation')}: ${scoreColor(stats.avgRotationSpeed)}`)
  lines.push(`  ${chalk.bold('Avg Visibility')}: ${scoreColor(stats.avgVisibilityRange)}  ${chalk.bold('Avg Warning')}: ${scoreColor(stats.avgWarningSystem)}`)
  lines.push(`  ${chalk.bold('Overall')}: ${scoreColor(stats.overallIllumination)}  ${chalk.bold('Grade')}: ${keeperGradeColor(stats.keeperGrade)}`)

  lines.push(`  ${chalk.bold('Conditions')}: pharos=${stats.pharosCount} modern=${stats.modernAutomatedCount} classic=${stats.classicFresnelCount} solar=${stats.solarPoweredCount} decom=${stats.decommissionedCount} ship=${stats.shipwreckCount}`)

  lines.push(`  ${chalk.bold('Best Reading')}: ${stats.bestReading}`)
  lines.push(`  ${chalk.bold('Brightest Beam')}: ${stats.brightestBeam}`)
  lines.push(`  ${chalk.bold('Clearest Lens')}: ${stats.clearestLens}`)
  lines.push(`  ${chalk.bold('Sharpest Focus')}: ${stats.sharpestFocus}`)
  lines.push(`  ${chalk.bold('Best Warning')}: ${stats.bestWarning}`)

  return lines.join('\n')
}

// ─── Table Formatter ────────────────────────────────────

/**
 * Format result as colored table
 * @example
 * formatLighthouseLensTable(result, false) // colored output
 */
export function formatLighthouseLensTable(result: LighthouseLensResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.bold.blue('🔦 Lighthouse Lens Analysis'))
  lines.push('═'.repeat(50))

  lines.push('')
  lines.push(chalk.bold('💡 Lens Readings'))
  for (const reading of result.readings) {
    lines.push(formatReading(reading, verbose))
  }

  lines.push('')
  lines.push(chalk.bold('🏠 Coastal Stations'))
  for (const station of result.stations) {
    lines.push(formatStation(station, verbose))
  }

  lines.push('')
  lines.push(chalk.bold('📊 Statistics'))
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

// ─── JSON Formatter ─────────────────────────────────────

/**
 * Format result as JSON
 * @example
 * formatLighthouseLensJson(result) // JSON string
 */
export function formatLighthouseLensJson(result: LighthouseLensResult): string {
  return JSON.stringify(result, null, 2)
}
