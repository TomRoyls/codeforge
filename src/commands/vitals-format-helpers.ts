import chalk from 'chalk'

import type { OrganReport, Symptom, VitalsResult, VitalsStats, VitalSign } from './vitals-helpers.js'

// ─── Status Colors ────────────────────────────────────────────────────────────

const statusColor = {
  critical: (s: string) => chalk.rgb(255, 50, 50)(s),
  warning: (s: string) => chalk.rgb(255, 180, 0)(s),
  normal: (s: string) => chalk.rgb(50, 205, 50)(s),
  excellent: (s: string) => chalk.rgb(0, 200, 255)(s),
} as const

const severityColor = {
  mild: (s: string) => chalk.rgb(100, 200, 100)(s),
  moderate: (s: string) => chalk.rgb(255, 180, 0)(s),
  severe: (s: string) => chalk.rgb(255, 100, 50)(s),
  critical: (s: string) => chalk.rgb(255, 50, 50)(s),
} as const

const prognosisColor = {
  excellent: (s: string) => chalk.rgb(0, 200, 255)(s),
  good: (s: string) => chalk.rgb(50, 205, 50)(s),
  fair: (s: string) => chalk.rgb(255, 180, 0)(s),
  poor: (s: string) => chalk.rgb(255, 100, 50)(s),
  critical: (s: string) => chalk.rgb(255, 50, 50)(s),
} as const

// ─── Vital Signs Monitor ──────────────────────────────────────────────────────

/**
 * Format vital signs as an ASCII monitor display.
 *
 * @example
 * formatVitalSignsMonitor(vitals)
 */
export function formatVitalSignsMonitor(vitals: VitalSign[]): string {
  if (vitals.length === 0) return '  No vital signs to display\n'

  const lines: string[] = []
  lines.push('  ╔══════════════════════════════════════════════════════════╗')
  lines.push('  ║              CODEBASE VITAL SIGNS MONITOR               ║')
  lines.push('  ╠══════════════════════════════════════════════════════════╣')

  for (const v of vitals) {
    const color = statusColor[v.status] ?? chalk.white
    const bar = buildHealthBar(v.status)
    const namePad = v.name.padEnd(25)
    const valueStr = `${v.value} ${v.unit}`.padEnd(12)
    lines.push(`  ║  ${color(namePad)} ${color(valueStr)} ${bar}  ║`)
  }

  lines.push('  ╚══════════════════════════════════════════════════════════╝')
  return lines.join('\n')
}

function buildHealthBar(status: VitalSign['status']): string {
  const barMap: Record<string, string> = {
    excellent: '████████ OK',
    normal: '██████░░ OK',
    warning: '████░░░░ ⚠ ',
    critical: '██░░░░░░ ‼ ',
  }
  return barMap[status] ?? '██████░░ ??'
}

// ─── Organ Health Chart ───────────────────────────────────────────────────────

/**
 * Format organ reports as a health chart.
 *
 * @example
 * formatOrganHealthChart(organs)
 */
export function formatOrganHealthChart(organs: OrganReport[]): string {
  if (organs.length === 0) return '  No organs to examine\n'

  const lines: string[] = []
  lines.push('  ────────────────────────────────────────────────────')
  lines.push('  Organ Health Chart')
  lines.push('  ────────────────────────────────────────────────────')

  for (const o of organs) {
    const color = prognosisColor[o.prognosis] ?? chalk.white
    const healthBar = buildPercentageBar(o.health)
    lines.push(`  ${chalk.bold(o.organ.padEnd(20))} ${color(healthBar)} ${o.health}%`)
    lines.push(`    Prognosis: ${color(o.prognosis)} — ${o.diagnosis}`)
  }

  return lines.join('\n')
}

function buildPercentageBar(health: number): string {
  const filled = Math.round(health / 10)
  const empty = 10 - filled
  return '█'.repeat(Math.max(filled, 0)) + '░'.repeat(Math.max(empty, 0))
}

// ─── Symptom List ─────────────────────────────────────────────────────────────

/**
 * Format symptoms with treatments.
 *
 * @example
 * formatSymptomList(symptoms)
 */
export function formatSymptomList(symptoms: Symptom[]): string {
  if (symptoms.length === 0) return '  No symptoms detected\n'

  const lines: string[] = []
  lines.push('  ────────────────────────────────────────────────────')
  lines.push('  Symptoms & Treatments')
  lines.push('  ────────────────────────────────────────────────────')

  for (let i = 0; i < symptoms.length; i++) {
    const s = symptoms[i]!
    const color = severityColor[s.severity] ?? chalk.white
    lines.push(`  ${i + 1}. ${color(`[${s.severity.toUpperCase()}]`)} ${s.file}:${s.line}`)
    lines.push(`     Vital: ${s.vital}`)
    lines.push(`     Symptom: ${s.symptom}`)
    lines.push(`     Treatment: ${s.treatment}`)
  }

  return lines.join('\n')
}

// ─── Overall Health Meter ─────────────────────────────────────────────────────

/**
 * Format the overall health meter.
 *
 * @example
 * formatOverallHealthMeter(85)
 */
export function formatOverallHealthMeter(health: number): string {
  const color = health >= 80 ? chalk.rgb(50, 205, 50) : health >= 60 ? chalk.rgb(255, 180, 0) : health >= 40 ? chalk.rgb(255, 100, 50) : chalk.rgb(255, 50, 50)
  const filled = Math.round(health / 5)
  const empty = 20 - filled
  const bar = '█'.repeat(Math.max(filled, 0)) + '░'.repeat(Math.max(empty, 0))

  const lines: string[] = []
  lines.push('  ────────────────────────────────────────────────────')
  lines.push(`  Overall Health: ${color(`${bar} ${health}%`)}`)
  lines.push('  ────────────────────────────────────────────────────')
  return lines.join('\n')
}

// ─── Stats Display ────────────────────────────────────────────────────────────

/**
 * Format vitals stats.
 *
 * @example
 * formatVitalsStats(stats)
 */
export function formatVitalsStats(stats: VitalsStats): string {
  const triageColor = stats.triageLevel === 'emergency' ? chalk.rgb(255, 50, 50) : stats.triageLevel === 'urgent' ? chalk.rgb(255, 180, 0) : chalk.rgb(50, 205, 50)
  const lines: string[] = []
  lines.push('  ────────────────────────────────────────────────────')
  lines.push('  Medical Summary')
  lines.push('  ────────────────────────────────────────────────────')
  lines.push(`  Overall Health:     ${stats.overallHealth}%`)
  lines.push(`  Diagnosis:          ${stats.diagnosis}`)
  lines.push(`  Triage Level:       ${triageColor(stats.triageLevel.toUpperCase())}`)
  lines.push(`  Critical Vitals:    ${stats.criticalVitals}`)
  lines.push(`  Warning Vitals:     ${stats.warningVitals}`)
  lines.push(`  Normal Vitals:      ${stats.normalVitals}`)
  lines.push(`  Excellent Vitals:   ${stats.excellentVitals}`)
  lines.push(`  Patient Age:        ${stats.patientAge} days`)
  lines.push(`  Last Checkup:       ${stats.lastCheckup}`)
  return lines.join('\n')
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatRecommendations(['Take vitals daily'])
 */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return '  No recommendations\n'

  const lines: string[] = []
  lines.push('  ────────────────────────────────────────────────────')
  lines.push('  Recommendations')
  lines.push('  ────────────────────────────────────────────────────')

  for (let i = 0; i < recommendations.length; i++) {
    lines.push(`  ${i + 1}. ${recommendations[i]}`)
  }

  return lines.join('\n')
}

// ─── Full Table ───────────────────────────────────────────────────────────────

/**
 * Format complete vitals result as table.
 *
 * @example
 * formatVitalsTable(result)
 */
export function formatVitalsTable(result: VitalsResult): string {
  const parts: string[] = []
  parts.push(formatVitalSignsMonitor(result.vitals))
  parts.push('')
  parts.push(formatOrganHealthChart(result.organs))
  parts.push('')
  parts.push(formatSymptomList(result.symptoms))
  parts.push('')
  parts.push(formatOverallHealthMeter(result.stats.overallHealth))
  parts.push('')
  parts.push(formatVitalsStats(result.stats))
  parts.push('')
  parts.push(formatRecommendations(result.recommendations))
  return parts.join('\n')
}

// ─── JSON ─────────────────────────────────────────────────────────────────────

/**
 * Format vitals result as JSON.
 *
 * @example
 * formatVitalsJSON(result)
 */
export function formatVitalsJSON(result: VitalsResult): string {
  return JSON.stringify(result, null, 2)
}
