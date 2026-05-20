import chalk from 'chalk'
import type { CompassNeedleResult, FileDrift, DriftDimension, DriftZone, CompassNeedleStats } from './compass-needle-helpers.js'

// ─── Color Utilities ───────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function trendColor(t: string): string {
  if (t === 'improving') return chalk.green(t)
  if (t === 'stable') return chalk.blue(t)
  if (t === 'degrading') return chalk.yellow(t)
  return chalk.red(t)
}

function directionColor(d: string): string {
  if (d === 'northward') return chalk.green(d)
  if (d === 'eastward') return chalk.blue(d)
  if (d === 'stable') return chalk.dim(d)
  if (d === 'westward') return chalk.yellow(d)
  return chalk.red(d)
}

function fileClassColor(c: string): string {
  if (c === 'beacon') return chalk.green(c)
  if (c === 'steady') return chalk.blue(c)
  if (c === 'drifter') return chalk.cyan(c)
  if (c === 'adrift') return chalk.yellow(c)
  return chalk.red(c)
}

function healthColor(h: string): string {
  if (h === 'ascending') return chalk.green(h)
  if (h === 'stable-good') return chalk.blue(h)
  if (h === 'stable-fair') return chalk.dim(h)
  if (h === 'declining') return chalk.yellow(h)
  return chalk.red(h)
}

function headingColor(h: string): string {
  if (h === 'true-north') return chalk.cyan(h)
  if (h === 'northward') return chalk.green(h)
  if (h === 'eastward') return chalk.blue(h)
  if (h === 'stable') return chalk.dim(h)
  if (h === 'southward') return chalk.yellow(h)
  return chalk.red(h)
}

function gradeColor(g: string): string {
  if (g === 'on-course') return chalk.green(g)
  if (g === 'mostly-on-course') return chalk.blue(g)
  if (g === 'drifting') return chalk.yellow(g)
  if (g === 'off-course') return chalk.rgb(255, 165, 0)(g)
  return chalk.red(g)
}

// ─── Dimension Formatting ──────────────────────────────────────────────────

function formatDimension(d: DriftDimension): string {
  return `  ${chalk.bold(d.dimension)} ${trendColor(d.trend)} score:${scoreColor(d.currentScore)} dir:${d.direction > 0 ? chalk.green(String(d.direction)) : d.direction < 0 ? chalk.red(String(d.direction)) : chalk.dim('0')} vel:${d.velocity}`
}

// ─── File Formatting ───────────────────────────────────────────────────────

function formatFile(f: FileDrift): string {
  return `  ${chalk.bold(f.file)} ${directionColor(f.driftDirection)} drift:${scoreColor(f.overallDrift + 50)} ${fileClassColor(f.classification)} worst:${chalk.dim(f.largestDrift)}`
}

// ─── Zone Formatting ───────────────────────────────────────────────────────

function formatZone(z: DriftZone): string {
  return `  ${chalk.bold(z.directory)} ${healthColor(z.health)} avg:${scoreColor(z.avgDrift + 50)} files:${z.fileCount} +${z.improvingFiles} -${z.degradingFiles} ~${z.stableFiles}`
}

// ─── Stats Formatting ──────────────────────────────────────────────────────

function formatStats(stats: CompassNeedleStats): string {
  return [
    `  Heading: ${headingColor(stats.compassHeading)} | Grade: ${gradeColor(stats.navigationGrade)} | Drift: ${scoreColor(stats.overallDrift + 50)} | Velocity: ${stats.driftVelocity}`,
    `  Dimensions: ${stats.totalDimensions} (Improving: ${chalk.green(String(stats.improvingDimensions))} Stable: ${chalk.blue(String(stats.stableDimensions))} Degrading: ${chalk.red(String(stats.degradingDimensions))})`,
    `  Files: ${stats.totalFiles} (Beacon: ${chalk.green(String(stats.beaconFiles))} Sinking: ${chalk.red(String(stats.sinkingFiles))} Adrift: ${chalk.yellow(String(stats.adriftFiles))})`,
    `  Zones: ${stats.totalZones} (Ascending: ${chalk.green(String(stats.ascendingZones))} Declining: ${chalk.red(String(stats.decliningZones))})`,
    `  Strongest Improvement: ${chalk.green(stats.strongestImprovement)} | Strongest Degradation: ${stats.strongestDegradation ? chalk.red(stats.strongestDegradation) : chalk.dim('none')}`,
  ].join('\n')
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/**
 * Format compass needle result as a table
 * @example
 * formatCompassNeedleTable(result, false) // string
 */
export function formatCompassNeedleTable(result: CompassNeedleResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🧭 Compass Needle - Code Directional Drift Analysis\n'))
  lines.push(chalk.bold('═'.repeat(50)))
  lines.push('')

  lines.push(chalk.bold('📊 Dimensions'))
  for (const d of result.dimensions) {
    lines.push(formatDimension(d))
  }
  lines.push('')

  lines.push(chalk.bold('📁 File Drift'))
  if (result.files.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.files : result.files.slice(0, 15)
    for (const f of display) {
      lines.push(formatFile(f))
    }
    if (!verbose && result.files.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.files.length - 15} more`))
    }
  }
  lines.push('')

  if (result.zones.length > 0) {
    lines.push(chalk.bold('🗺️ Zones'))
    for (const z of result.zones) {
      lines.push(formatZone(z))
    }
    lines.push('')
  }

  lines.push(chalk.bold('📈 Summary'))
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

// ─── JSON Formatter ────────────────────────────────────────────────────────

/**
 * Format compass needle result as JSON
 * @example
 * formatCompassNeedleJson(result) // string
 */
export function formatCompassNeedleJson(result: CompassNeedleResult): string {
  return JSON.stringify(result, null, 2)
}
