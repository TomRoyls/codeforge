import chalk from 'chalk'

import type {
  CompassReading,
  CompassRoseResult,
  CompassRoseStats,
  Direction,
  FlowVector,
} from './compass-rose-helpers.js'

// ─── Compass Rose ASCII ────────────────────────────────────────────────────────

/**
 * Format compass rose ASCII diagram.
 *
 * @example
 * formatCompassRoseDiagram({ N: 5, E: 3, S: 8, W: 2 })
 */
export function formatCompassRoseDiagram(dirCounts: Record<string, number>): string {
  const lines: string[] = []
  const max = Math.max(...Object.values(dirCounts), 1)

  const n = Math.round((dirCounts['N'] || 0) / max * 5)
  const ne = Math.round((dirCounts['NE'] || 0) / max * 3)
  const e = Math.round((dirCounts['E'] || 0) / max * 5)
  const se = Math.round((dirCounts['SE'] || 0) / max * 3)
  const s = Math.round((dirCounts['S'] || 0) / max * 5)
  const sw = Math.round((dirCounts['SW'] || 0) / max * 3)
  const w = Math.round((dirCounts['W'] || 0) / max * 5)
  const nw = Math.round((dirCounts['NW'] || 0) / max * 3)

  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Compass Rose'))
  lines.push(chalk.gray('  ─'.repeat(30)))
  lines.push(`         ${chalk.rgb(0, 150, 136)('N')}`)
  lines.push(`      ${bar(nw)} ${bar(n)} ${bar(ne)}`)
  lines.push(`    NW ┌─────────┐ NE`)
  lines.push(`  ${bar(w)} W │    ✦    │ E ${bar(e)}`)
  lines.push(`    SW └─────────┘ SE`)
  lines.push(`      ${bar(sw)} ${bar(s)} ${bar(se)}`)
  lines.push(`         ${chalk.rgb(244, 67, 54)('S')}`)

  return lines.join('\n')
}

function bar(level: number): string {
  const filled = '█'.repeat(Math.max(level, 0))
  return chalk.rgb(0, 188, 212)(filled) + chalk.gray('░'.repeat(Math.max(5 - level, 0)))
}

// ─── Direction Distribution ────────────────────────────────────────────────────

/**
 * Format direction distribution table.
 *
 * @example
 * formatDirectionDistribution(directions)
 */
export function formatDirectionDistribution(directions: Direction[]): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Direction Distribution'))
  lines.push(chalk.gray('  ─'.repeat(50)))

  for (const dir of directions) {
    const name = dir.name.padEnd(3)
    const count = String(dir.files.length).padStart(3)
    const strength = String(dir.strength).padStart(3) + '%'
    const barChars = '█'.repeat(Math.round(dir.strength / 5))
    lines.push(`  ${chalk.bold(name)} ${chalk.rgb(0, 188, 212)(barChars.padEnd(20))} files:${count}  str:${strength}`)
    lines.push(chalk.gray(`      ${dir.description}`))
  }

  return lines.join('\n')
}

// ─── Flow Arrows ───────────────────────────────────────────────────────────────

/**
 * Format flow arrows.
 *
 * @example
 * formatFlowArrows(flows)
 */
export function formatFlowArrows(flows: FlowVector[]): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Flow Arrows'))
  lines.push(chalk.gray('  ─'.repeat(50)))

  if (flows.length === 0) {
    lines.push(chalk.gray('  No flows detected'))
    return lines.join('\n')
  }

  const sorted = [...flows].sort((a, b) => b.magnitude - a.magnitude)
  for (const flow of sorted.slice(0, 15)) {
    const arrow = chalk.rgb(0, 188, 212)('──▶')
    const mag = String(flow.magnitude).padStart(3)
    const type = chalk.gray(`[${flow.type}]`)
    lines.push(`  ${flow.from} ${arrow} ${flow.to}  mag:${mag} ${type}`)
  }

  if (flows.length > 15) {
    lines.push(chalk.gray(`  ... and ${flows.length - 15} more flows`))
  }

  return lines.join('\n')
}

// ─── Heading Table ─────────────────────────────────────────────────────────────

/**
 * Format heading table.
 *
 * @example
 * formatHeadingTable(readings)
 */
export function formatHeadingTable(readings: CompassReading[]): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Heading Table'))
  lines.push(chalk.gray('  ─'.repeat(70)))

  lines.push(chalk.gray('  File                          Bearing  Dir   Abs  Impl  Exp  Con  Drift'))
  lines.push(chalk.gray('  ' + '─'.repeat(68)))

  const sorted = [...readings].sort((a, b) => a.heading.bearing - b.heading.bearing)
  for (const r of sorted.slice(0, 20)) {
    const h = r.heading
    const file = r.file.padEnd(28).slice(0, 28)
    const bearing = String(Math.round(h.bearing)).padStart(6)
    const dir = h.cardinalDirection.padEnd(5)
    const abs = String(h.abstraction).padStart(3)
    const impl = String(h.implementation).padStart(4)
    const exp = String(h.expansion).padStart(3)
    const con = String(h.consolidation).padStart(3)
    const drift = String(Math.round(r.drift)).padStart(5)

    lines.push(`  ${file} ${bearing}  ${dir} ${abs}  ${impl}  ${exp}  ${con}  ${drift}`)
  }

  if (readings.length > 20) {
    lines.push(chalk.gray(`  ... and ${readings.length - 20} more`))
  }

  return lines.join('\n')
}

// ─── Drift Indicators ──────────────────────────────────────────────────────────

/**
 * Format drift indicators.
 *
 * @example
 * formatDriftIndicators(readings)
 */
export function formatDriftIndicators(readings: CompassReading[]): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Drift Indicators'))
  lines.push(chalk.gray('  ─'.repeat(50)))

  const highDrift = readings.filter((r) => r.drift > 60).sort((a, b) => b.drift - a.drift)
  if (highDrift.length === 0) {
    lines.push(chalk.rgb(76, 175, 80)('  ✓ All files well-aligned'))
    return lines.join('\n')
  }

  for (const r of highDrift.slice(0, 10)) {
    const driftStr = String(Math.round(r.drift)).padStart(3)
    const warning = r.drift > 90 ? chalk.rgb(244, 67, 54)('⚠') : chalk.rgb(255, 193, 7)('△')
    lines.push(`  ${warning} ${r.file.padEnd(30)} drift: ${driftStr}°  heading: ${r.heading.cardinalDirection}`)
  }

  return lines.join('\n')
}

// ─── Magnetic North ────────────────────────────────────────────────────────────

/**
 * Format magnetic north marker.
 *
 * @example
 * formatMagneticNorth(stats)
 */
export function formatMagneticNorth(stats: CompassRoseStats): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Magnetic North'))
  lines.push(chalk.gray('  ─'.repeat(30)))
  lines.push(`  ✦ ${chalk.bold(stats.magneticNorth || 'N/A')}`)
  lines.push(`    Consistency: ${formatMeter(stats.consistency)}`)
  lines.push(`    Navigability: ${formatMeter(stats.navigability)}`)
  lines.push(`    Avg Bearing: ${Math.round(stats.avgBearing)}°`)
  lines.push(`    Dominant Direction: ${stats.dominantDirection}`)

  return lines.join('\n')
}

function formatMeter(value: number): string {
  const filled = Math.round(value / 5)
  const bar = '█'.repeat(filled) + '░'.repeat(20 - filled)
  const color = value >= 70 ? chalk.rgb(76, 175, 80) : value >= 40 ? chalk.rgb(255, 193, 7) : chalk.rgb(244, 67, 54)
  return `${color(bar)} ${value}%`
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatRecommendations(['Add more types'])
 */
export function formatRecommendations(recs: string[]): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Recommendations'))
  lines.push(chalk.gray('  ─'.repeat(50)))

  for (const rec of recs) {
    lines.push(`  → ${rec}`)
  }

  return lines.join('\n')
}

// ─── JSON Format ───────────────────────────────────────────────────────────────

/**
 * Format compass rose result as JSON.
 *
 * @example
 * formatCompassRoseJson(result)
 */
export function formatCompassRoseJson(result: CompassRoseResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Format ──────────────────────────────────────────────────────────────

/**
 * Format compass rose result as table.
 *
 * @example
 * formatCompassRoseTable(result)
 */
export function formatCompassRoseTable(result: CompassRoseResult): string {
  const dirCounts: Record<string, number> = {}
  for (const dir of result.directions) {
    dirCounts[dir.name] = dir.files.length
  }

  const parts: string[] = []
  parts.push(formatCompassRoseDiagram(dirCounts))
  parts.push(formatDirectionDistribution(result.directions))
  parts.push(formatFlowArrows(result.flows))
  parts.push(formatHeadingTable(result.readings))
  parts.push(formatDriftIndicators(result.readings))
  parts.push(formatMagneticNorth(result.stats))
  parts.push(formatRecommendations(result.recommendations))

  return parts.join('\n')
}
