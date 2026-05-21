import chalk from 'chalk'
import type { CompassPoint, CompassRegion, CompassRoseResult } from './compass-rose-helpers.js'

// ─── Color Utilities ─────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function conditionColor(c: string): string {
  switch (c) {
    case 'true-north': return chalk.rgb(255, 215, 0)(c)
    case 'well-oriented': return chalk.green(c)
    case 'slightly-off': return chalk.blue(c)
    case 'disoriented': return chalk.yellow(c)
    case 'lost': return chalk.rgb(255, 165, 0)(c)
    case 'spinning': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function regionColor(c: string): string {
  switch (c) {
    case 'perfectly-aligned': return chalk.rgb(255, 215, 0)(c)
    case 'well-aligned': return chalk.green(c)
    case 'mostly-aligned': return chalk.blue(c)
    case 'scattered': return chalk.yellow(c)
    case 'disoriented': return chalk.rgb(255, 165, 0)(c)
    case 'chaotic': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'master-navigator': return chalk.rgb(255, 215, 0)(g)
    case 'navigator': return chalk.green(g)
    case 'pilot': return chalk.blue(g)
    case 'deckhand': return chalk.cyan(g)
    case 'castaway': return chalk.yellow(g)
    case 'shipwrecked': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

// ─── Point Formatting ────────────────────────────────────────────────────────

function formatPoint(p: CompassPoint, verbose: boolean): string {
  const line = ` ${conditionColor(p.condition)} ${chalk.bold(p.file)} ${p.cardinalDirection}(${p.heading}\u00B0) mag:${scoreColor(p.magneticNorth)} decl:${scoreColor(p.declination)} stab:${scoreColor(p.orientationStability)}`

  if (!verbose) return line
  const details = [line]
  details.push(`    cardinal: N:${scoreColor(p.cardinal.north)} S:${scoreColor(p.cardinal.south)} E:${scoreColor(p.cardinal.east)} W:${scoreColor(p.cardinal.west)} dom:${p.cardinal.dominantCardinal}`)
  details.push(`    bearing: true:${scoreColor(p.bearing.trueNorth)} mag:${scoreColor(p.bearing.magneticNorth)} dev:${p.bearing.deviation} cal:${p.bearing.isCalibrated ? chalk.green('Y') : chalk.red('N')}`)
  details.push(`    magnetism: str:${scoreColor(p.magnetism.strength)} pol:${p.magnetism.polarity} nav:${p.navigation.isNavigable ? chalk.green('Y') : chalk.red('N')}`)
  return details.join('\n')
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format compass rose result as a table
 * @example
 * formatCompassRoseTable(result, false) // string
 */
export function formatCompassRoseTable(result: CompassRoseResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🧭 Compass Rose - Directional/Orientation Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('📍 Compass Points'))
  if (result.points.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.points : result.points.slice(0, 15)
    for (const p of display) {
      lines.push(formatPoint(p, verbose))
    }
    if (!verbose && result.points.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.points.length - 15} more`))
    }
  }
  lines.push('')

  if (result.regions.length > 0) {
    lines.push(chalk.bold('🗺️  Regions'))
    for (const r of result.regions) {
      lines.push(`  ${chalk.bold(r.directory)} ${regionColor(r.condition)} mag:${scoreColor(r.avgMagneticNorth)} align:${scoreColor(r.regionAlignment)} type:${r.regionType} pts:${r.points.length}`)
    }
    lines.push('')
  }

  const h = result.hemisphere
  lines.push(chalk.bold('🌐 Hemisphere'))
  lines.push(`  MagneticNorth:${scoreColor(h.avgMagneticNorth)} Declination:${scoreColor(h.avgDeclination)} Stability:${scoreColor(h.avgStability)} Aligned:${h.isAligned ? chalk.green('YES') : chalk.red('NO')} Overall:${scoreColor(h.overallOrientation)}`)
  lines.push('')

  const s = result.stats
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(`  Grade: ${gradeColor(s.navigatorGrade)} | Orientation: ${scoreColor(s.overallOrientation)} | Files: ${s.totalFiles} | Regions: ${s.totalRegions}`)
  lines.push(`  TrueNorth:${s.trueNorthCount} Well:${s.wellOrientedCount} Disoriented:${s.disorientedCount} Lost:${s.lostCount} Spinning:${s.spinningCount}`)
  lines.push(`  Dominant: N:${s.northDominant} S:${s.southDominant} E:${s.eastDominant} W:${s.westDominant} | Attractive:${s.attractiveCount} Repulsive:${s.repulsiveCount}`)
  lines.push(`  Calibrated:${s.calibratedCount} NeedsRecal:${s.needsRecalibrationCount} Navigable:${s.navigableCount}`)
  lines.push(`  BestOriented:${chalk.green(s.bestOriented)} | MostDisoriented:${chalk.red(s.mostDisoriented)} | StrongestMag:${chalk.cyan(s.strongestMagnetism)} | MostCal:${chalk.blue(s.mostCalibrated)}`)

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
 * Format compass rose result as JSON
 * @example
 * formatCompassRoseJson(result) // string
 */
export function formatCompassRoseJson(result: CompassRoseResult): string {
  return JSON.stringify(result, null, 2)
}
