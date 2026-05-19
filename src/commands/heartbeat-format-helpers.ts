import chalk from 'chalk'
import {
  type HeartbeatResult,
  type HeartbeatStats,
  type OverallHealth,
  type VitalSign,
  type VitalStatus,
} from './heartbeat-helpers.js'

// ─── Status Formatting ────────────────────────────────────────────────────────

const STATUS_COLOR: Record<VitalStatus, (t: string) => string> = {
  normal: (t) => chalk.rgb(76, 175, 80)(t),
  elevated: (t) => chalk.rgb(255, 193, 7)(t),
  high: (t) => chalk.rgb(255, 152, 0)(t),
  critical: (t) => chalk.rgb(244, 67, 54)(t),
}

const HEALTH_COLOR: Record<OverallHealth, (t: string) => string> = {
  excellent: (t) => chalk.rgb(76, 175, 80)(t),
  good: (t) => chalk.rgb(139, 195, 74)(t),
  fair: (t) => chalk.rgb(255, 193, 7)(t),
  poor: (t) => chalk.rgb(255, 152, 0)(t),
  critical: (t) => chalk.rgb(244, 67, 54)(t),
}

/**
 * Format vital status with color.
 *
 * @example
 * formatVitalStatus('normal')
 */
export function formatVitalStatus(status: VitalStatus): string {
  const colorFn = STATUS_COLOR[status] ?? chalk.white
  return colorFn(status.toUpperCase())
}

/**
 * Format overall health badge.
 *
 * @example
 * formatHealthBadge('good')
 */
export function formatHealthBadge(health: OverallHealth): string {
  const colorFn = HEALTH_COLOR[health] ?? chalk.white
  return colorFn(`  [ ${health.toUpperCase()} ]`)
}

// ─── Heartbeat Monitor Line ───────────────────────────────────────────────────

/**
 * Render ASCII heartbeat monitor line.
 *
 * @example
 * formatHeartbeatLine(score)
 */
export function formatHeartbeatLine(score: number): string {
  const width = 40
  const peaks = Math.max(Math.round(score / 10), 2)
  let line = ''
  for (let i = 0; i < width; i++) {
    const pos = i % Math.round(width / peaks)
    if (pos === 0) line += '▲'
    else if (pos === 1) line += '│'
    else if (pos === 3) line += '╲'
    else line += '─'
  }

  let colorFn: (t: string) => string
  if (score >= 85) colorFn = chalk.rgb(76, 175, 80)
  else if (score >= 50) colorFn = chalk.rgb(255, 193, 7)
  else colorFn = chalk.rgb(244, 67, 54)

  return colorFn(`  ♥ ${line} ♥`)
}

// ─── Vital Sign Row ───────────────────────────────────────────────────────────

/**
 * Format a vital sign row.
 *
 * @example
 * formatVitalRow(vital)
 */
export function formatVitalRow(vital: VitalSign): string {
  const status = formatVitalStatus(vital.status)
  const value = `${vital.value} ${vital.unit}`.padEnd(12)
  return `  ${vital.icon} ${vital.name.padEnd(25)} ${value} ${status}`
}

// ─── Vitals Table ─────────────────────────────────────────────────────────────

/**
 * Format all vitals as a table.
 *
 * @example
 * formatVitalsTable(vitals)
 */
export function formatVitalsTable(vitals: VitalSign[]): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Vital Signs:'))
  lines.push(chalk.gray('  ─────────────────────────────────────────────────────────────'))
  lines.push(chalk.gray('  Sign                         Value       Status'))
  lines.push(chalk.gray('  ─────────────────────────────────────────────────────────────'))
  for (const v of vitals) {
    lines.push(formatVitalRow(v))
  }
  lines.push(chalk.gray('  ─────────────────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Stats Summary ────────────────────────────────────────────────────────────

/**
 * Format heartbeat stats.
 *
 * @example
 * formatStatsSummary(stats)
 */
export function formatStatsSummary(stats: HeartbeatStats): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Stats:'))
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  lines.push(`  Total vitals: ${stats.totalVitals}`)
  lines.push(`  Normal: ${stats.normalCount} | Elevated: ${stats.elevatedCount} | High: ${stats.highCount} | Critical: ${stats.criticalCount}`)
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Prescriptions ────────────────────────────────────────────────────────────

/**
 * Format prescriptions list.
 *
 * @example
 * formatPrescriptions(prescriptions)
 */
export function formatPrescriptions(prescriptions: string[]): string {
  if (prescriptions.length === 0) return chalk.dim('  No prescriptions needed.')
  const lines: string[] = []
  lines.push(chalk.bold('  Prescriptions:'))
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  for (const p of prescriptions) {
    lines.push(`  ${p}`)
  }
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Diagnosis ────────────────────────────────────────────────────────────────

/**
 * Format diagnosis text.
 *
 * @example
 * formatDiagnosis('Patient is in good health.')
 */
export function formatDiagnosis(diagnosis: string): string {
  return `${chalk.bold('  Diagnosis:')} ${diagnosis}`
}

// ─── Full Table Format ────────────────────────────────────────────────────────

/**
 * Format the full heartbeat result.
 *
 * @example
 * formatHeartbeatTable(result)
 */
export function formatHeartbeatTable(result: HeartbeatResult): string {
  const sections: string[] = []
  sections.push('')
  sections.push(formatHeartbeatLine(result.healthScore))
  sections.push(formatHealthBadge(result.overallHealth))
  sections.push(`  Health Score: ${result.healthScore}/100`)
  sections.push('')
  sections.push(formatVitalsTable(result.vitals))
  sections.push('')
  sections.push(formatStatsSummary(result.stats))
  sections.push('')
  sections.push(formatDiagnosis(result.diagnosis))
  sections.push('')
  sections.push(formatPrescriptions(result.prescriptions))
  sections.push('')
  return sections.join('\n')
}

// ─── JSON Format ──────────────────────────────────────────────────────────────

/**
 * Format heartbeat result as JSON.
 *
 * @example
 * formatHeartbeatJSON(result)
 */
export function formatHeartbeatJSON(result: HeartbeatResult): string {
  return JSON.stringify(result, null, 2)
}
