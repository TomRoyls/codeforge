import chalk from 'chalk'

import type {
  FaultLine,
  SeismicEvent,
  SeismicResult,
  SeismicStats,
  SeismicZone,
  TectonicPlate,
  } from './seismic-helpers.js'

// ─── Event Badges ──────────────────────────────────────────────────────────────

const EVENT_SYMBOL: Record<string, string> = {
  tremor: '📳',
  earthquake: '🌋',
  aftershock: '🔄',
  foreshock: '⚠️',
  swarm: '🐝',
  silent: '🔇',
}

const RISK_COLOR: Record<string, (s: string) => string> = {
  stable: chalk.rgb(72, 199, 142),
  minor: chalk.rgb(130, 200, 130),
  moderate: chalk.rgb(200, 180, 80),
  major: chalk.rgb(220, 150, 80),
  catastrophic: chalk.rgb(220, 80, 80),
  low: chalk.rgb(72, 199, 142),
  medium: chalk.rgb(200, 180, 80),
  high: chalk.rgb(220, 150, 80),
  critical: chalk.rgb(220, 80, 80),
}

/**
 * Format event type badge.
 *
 * @example
 * formatEventBadge('earthquake') // => '🌋 earthquake'
 */
export function formatEventBadge(type: string): string {
  return `${EVENT_SYMBOL[type] ?? '📊'} ${type}`
}

/**
 * Format risk level with color.
 *
 * @example
 * formatRisk('major') // => colored 'major'
 */
export function formatRisk(risk: string): string {
  const color = RISK_COLOR[risk] ?? ((s: string) => s)
  return color(risk)
}

/**
 * Format magnitude bar.
 *
 * @example
 * formatMagnitudeBar(7.5) // => '▓▓▓▓▓▓▓░░░ M7.5'
 */
export function formatMagnitudeBar(magnitude: number, width: number = 10): string {
  const filled = Math.round((magnitude / 10) * width)
  const empty = width - filled
  const bar = '▓'.repeat(filled) + '░'.repeat(empty)
  const color = magnitude >= 7 ? chalk.rgb(220, 80, 80) : magnitude >= 4 ? chalk.rgb(200, 180, 80) : chalk.rgb(72, 199, 142)
  return color(`${bar} M${magnitude}`)
}

/**
 * Format pressure gauge.
 *
 * @example
 * formatPressureGauge(65) // => '██████████░░░░░░░░░░ 65/100'
 */
export function formatPressureGauge(pressure: number, width: number = 20): string {
  const filled = Math.round((pressure / 100) * width)
  const empty = width - filled
  const bar = '█'.repeat(filled) + '░'.repeat(empty)
  const color = pressure >= 70 ? chalk.rgb(220, 80, 80) : pressure >= 40 ? chalk.rgb(200, 180, 80) : chalk.rgb(72, 199, 142)
  return color(`${bar} ${pressure}/100`)
}

// ─── Seismograph ───────────────────────────────────────────────────────────────

/**
 * Format ASCII seismograph readout.
 *
 * @example
 * formatSeismograph(events) // => visual waveform
 */
export function formatSeismograph(events: SeismicEvent[]): string {
  if (events.length === 0) return 'No seismic activity detected'

  const lines: string[] = [chalk.bold('Seismograph Readout:')]
  for (const event of events) {
    const mag = Math.round(event.magnitude)
    const wave = '▮'.repeat(mag) + '▯'.repeat(10 - mag)
    const color = event.magnitude >= 7 ? chalk.rgb(220, 80, 80) : event.magnitude >= 4 ? chalk.rgb(200, 180, 80) : chalk.rgb(150, 150, 150)
    const badge = formatEventBadge(event.type)
    lines.push(`  ${color(wave)} M${event.magnitude} ${badge} ${event.file}`)
  }

  return lines.join('\n')
}

// ─── Fault Line Table ──────────────────────────────────────────────────────────

/**
 * Format fault lines table.
 *
 * @example
 * formatFaultLineTable(faultLines) // => table
 */
export function formatFaultLineTable(faultLines: FaultLine[]): string {
  if (faultLines.length === 0) return 'No fault lines detected'

  const header = chalk.bold('Fault Line          Activity     Avg Mag  Risk')
  const separator = '─'.repeat(58)
  const rows = faultLines.map(f => {
    const name = f.name.substring(0, 18).padEnd(18)
    const activity = f.activityLevel.padEnd(12)
    const mag = String(f.avgMagnitude).padEnd(8)
    const risk = formatRisk(f.riskLevel)
    return `${name} ${activity} ${mag} ${risk}`
  })

  return [header, separator, ...rows].join('\n')
}

// ─── Tectonic Plate Overview ────────────────────────────────────────────────────

/**
 * Format tectonic plates overview.
 *
 * @example
 * formatPlateOverview(plates) // => overview
 */
export function formatPlateOverview(plates: TectonicPlate[]): string {
  if (plates.length === 0) return 'No tectonic plates identified'

  const header = chalk.bold('Plate              Stability  Pressure  Drift       Assessment')
  const separator = '─'.repeat(72)
  const rows = plates.map(p => {
    const name = p.name.substring(0, 18).padEnd(18)
    const stability = String(p.stability).padEnd(10)
    const pressure = formatPressureGauge(p.pressureBuildup, 8)
    const drift = p.driftDirection.padEnd(10)
    const assessment = p.riskAssessment.substring(0, 20)
    return `${name} ${stability} ${pressure} ${drift} ${assessment}`
  })

  return [header, separator, ...rows].join('\n')
}

// ─── Zone Analysis ─────────────────────────────────────────────────────────────

/**
 * Format seismic zones.
 *
 * @example
 * formatZoneAnalysis(zones) // => zone analysis
 */
export function formatZoneAnalysis(zones: SeismicZone[]): string {
  if (zones.length === 0) return 'No seismic zones mapped'

  const header = chalk.bold('Zone               Magnitude  Frequency  Risk')
  const separator = '─'.repeat(60)
  const rows = zones.map(z => {
    const name = z.zone.substring(0, 18).padEnd(18)
    const mag = String(z.magnitude).padEnd(10)
    const freq = String(z.frequency).padEnd(10)
    const risk = formatRisk(z.risk)
    return `${name} ${mag} ${freq} ${risk}`
  })

  return [header, separator, ...rows].join('\n')
}

// ─── Stats Summary ─────────────────────────────────────────────────────────────

/**
 * Format seismic stats.
 *
 * @example
 * formatSeismicStats(stats) // => stats summary
 */
export function formatSeismicStats(stats: SeismicStats): string {
  const lines = [
    chalk.bold('Seismic Statistics:'),
    `  Total events: ${stats.totalEvents}`,
    `  Avg magnitude: M${stats.avgMagnitude} | Max: M${stats.maxMagnitude}`,
    `  Tremors: ${stats.tremorCount} | Earthquakes: ${stats.earthquakeCount} | Aftershocks: ${stats.aftershockCount}`,
    `  Swarms: ${stats.swarmCount} | Silent: ${stats.silentCount}`,
    `  Fault lines: ${stats.activeFaultLines} active, ${stats.hyperactiveFaultLines} hyperactive, ${stats.dormantFaultLines} dormant`,
    `  Avg plate stability: ${stats.avgPlateStability}% | High pressure plates: ${stats.highPressurePlates}`,
    `  Pressure index: ${formatPressureGauge(stats.pressureIndex)}`,
    `  Most active zone: ${stats.mostActiveZone}`,
    `  Most stable zone: ${stats.mostStableZone}`,
    `  Overall risk: ${formatRisk(stats.overallRisk)}`,
  ]
  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatRecommendations(['Fix faults']) // => bullet list
 */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.rgb(72, 199, 142)('✓ Seismic activity is minimal — codebase is stable')
  const lines = [chalk.bold('🫨 Recommendations:')]
  for (const rec of recommendations) {
    lines.push(`  • ${rec}`)
  }
  return lines.join('\n')
}

// ─── Full Table Output ─────────────────────────────────────────────────────────

/**
 * Format full seismic result as table.
 *
 * @example
 * formatSeismicTable(result, false) // => full output
 */
export function formatSeismicTable(result: SeismicResult, verbose: boolean): string {
  const sections: string[] = []

  sections.push(chalk.bold('\nSeismic Activity Analysis\n'))
  sections.push(formatSeismicStats(result.stats))
  sections.push('')

  if (result.events.length > 0) {
    sections.push(formatSeismograph(verbose ? result.events : result.events.slice(0, 20)))
    sections.push('')
  }

  if (result.faultLines.length > 0) {
    sections.push(chalk.bold('Fault Lines:'))
    sections.push(formatFaultLineTable(result.faultLines))
    sections.push('')
  }

  if (result.plates.length > 0) {
    sections.push(chalk.bold('Tectonic Plates:'))
    sections.push(formatPlateOverview(result.plates))
    sections.push('')
  }

  if (result.zones.length > 0) {
    sections.push(chalk.bold('Seismic Zones:'))
    sections.push(formatZoneAnalysis(result.zones))
    sections.push('')
  }

  sections.push(formatRecommendations(result.recommendations))

  return sections.join('\n')
}

// ─── JSON Output ───────────────────────────────────────────────────────────────

/**
 * Format seismic result as JSON.
 *
 * @example
 * formatSeismicJson(result) // => JSON string
 */
export function formatSeismicJson(result: SeismicResult): string {
  return JSON.stringify(result, null, 2)
}
