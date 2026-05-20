import chalk from 'chalk'

import type { AnatomyResult, AnatomyStats, BodySystem, Organ, VitalSigns } from './anatomy-helpers.js'

// ─── System Health Meters ──────────────────────────────────────────────────────

/**
 * Format body system health meters.
 *
 * @example
 * formatSystemMeters(systems)
 */
export function formatSystemMeters(systems: BodySystem[]): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 150, 136)('\n  Body Systems'))
  lines.push(chalk.gray('  ─'.repeat(50)))

  for (const system of systems) {
    const fill = Math.round(system.health / 5)
    const bar = '█'.repeat(fill) + '░'.repeat(20 - fill)
    const color = system.health >= 80 ? chalk.rgb(76, 175, 80) : system.health >= 60 ? chalk.rgb(255, 193, 7) : system.health >= 40 ? chalk.rgb(255, 152, 0) : chalk.rgb(244, 67, 54)
    const statusIcon = statusIconFor(system.status)
    lines.push(`  ${statusIcon} ${system.name.padEnd(15)} ${color(bar)} ${system.health}%  (${system.organs.length} organs)`)
    lines.push(chalk.gray(`    ${system.diagnosis}`))
  }

  return lines.join('\n')
}

function statusIconFor(s: string): string {
  switch (s) {
    case 'healthy': return chalk.rgb(76, 175, 80)('♥')
    case 'minor-issues': return chalk.rgb(255, 193, 7)('⚠')
    case 'moderate-issues': return chalk.rgb(255, 152, 0)('⚑')
    case 'critical-issues': return chalk.rgb(244, 67, 54)('✗')
    default: return chalk.gray('?')
  }
}

// ─── Organ Table ───────────────────────────────────────────────────────────────

/**
 * Format organ health table.
 *
 * @example
 * formatOrganTable(organs)
 */
export function formatOrganTable(organs: Organ[]): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 150, 136)('\n  Organ Health'))
  lines.push(chalk.gray('  ─'.repeat(60)))

  if (organs.length === 0) {
    lines.push(chalk.gray('  No organs found'))
    return lines.join('\n')
  }

  const sorted = [...organs].sort((a, b) => a.health - b.health)
  for (const organ of sorted.slice(0, 20)) {
    const icon = organ.health >= 80 ? chalk.rgb(76, 175, 80)('●') : organ.health >= 50 ? chalk.rgb(255, 193, 7)('◐') : chalk.rgb(244, 67, 54)('✗')
    const sys = chalk.gray(`[${organ.system.slice(0, 3).toUpperCase()}]`)
    lines.push(`  ${icon} ${organ.name.padEnd(30).slice(0, 30)} ${sys} hp:${String(organ.health).padStart(3)} vit:${String(organ.vitality).padStart(3)} sz:${String(organ.size).padStart(4)}`)
    if (organ.issues.length > 0) {
      lines.push(chalk.gray(`    issues: ${organ.issues.join(', ')}`))
    }
  }

  if (organs.length > 20) {
    lines.push(chalk.gray(`  ... and ${organs.length - 20} more organs`))
  }

  return lines.join('\n')
}

// ─── Vital Signs Monitor ───────────────────────────────────────────────────────

/**
 * Format vital signs monitor.
 *
 * @example
 * formatVitalSignsMonitor(vitalSigns)
 */
export function formatVitalSignsMonitor(vs: VitalSigns): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 150, 136)('\n  Vital Signs'))
  lines.push(chalk.gray('  ─'.repeat(40)))

  const hrColor = vs.heartRate > 100 ? chalk.rgb(244, 67, 54) : vs.heartRate > 60 ? chalk.rgb(255, 193, 7) : chalk.rgb(76, 175, 80)
  lines.push(`  ♥ Heart Rate:     ${hrColor(String(vs.heartRate))} bpm`)

  const bpColor = vs.bloodPressure === 'critical' ? chalk.rgb(244, 67, 54) : vs.bloodPressure === 'high' ? chalk.rgb(255, 193, 7) : chalk.rgb(76, 175, 80)
  lines.push(`  🩸 Blood Pressure: ${bpColor(vs.bloodPressure)}`)

  const tempColor = vs.bodyTemp > 70 ? chalk.rgb(244, 67, 54) : vs.bodyTemp > 40 ? chalk.rgb(255, 193, 7) : chalk.rgb(76, 175, 80)
  lines.push(`  🌡 Body Temp:      ${tempColor(vs.bodyTemp + '°')}`)

  lines.push(`  🫁 Respiratory:    ${vs.respiratory} lines/breath`)
  lines.push(`  ⚡ Reflexes:       ${vs.reflexes}%`)
  lines.push(`  🛡 Immunity:       ${vs.immunity}%`)

  return lines.join('\n')
}

// ─── Stats Summary ─────────────────────────────────────────────────────────────

/**
 * Format anatomy statistics.
 *
 * @example
 * formatAnatomyStats(stats)
 */
export function formatAnatomyStats(stats: AnatomyStats): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 150, 136)('\n  Anatomy Summary'))
  lines.push(chalk.gray('  ─'.repeat(40)))
  lines.push(`  Organs: ${stats.totalOrgans}  Healthy Systems: ${stats.healthySystems}  Critical: ${stats.criticalSystems}`)
  lines.push(`  Avg System Health: ${stats.avgSystemHealth}%  Overall: ${stats.overallHealth}%`)
  lines.push(`  Largest: ${stats.largestOrgan}  Smallest: ${stats.smallestOrgan}`)
  lines.push(`  Most Vital: ${stats.mostVital}  Weakest: ${stats.weakestOrgan}`)
  lines.push(`  BMI (lines/file): ${stats.bodyMassIndex}`)
  lines.push(`  Life Expectancy: ${stats.lifeExpectancy}`)
  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatAnatomyRecommendations(['Rest and recover'])
 */
export function formatAnatomyRecommendations(recs: string[]): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 150, 136)('\n  Recommendations'))
  lines.push(chalk.gray('  ─'.repeat(50)))
  for (const rec of recs) {
    lines.push(`  → ${rec}`)
  }
  return lines.join('\n')
}

// ─── JSON Format ───────────────────────────────────────────────────────────────

/**
 * Format as JSON.
 *
 * @example
 * formatAnatomyJson(result)
 */
export function formatAnatomyJson(result: AnatomyResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Format ──────────────────────────────────────────────────────────────

/**
 * Format as table.
 *
 * @example
 * formatAnatomyTable(result)
 */
export function formatAnatomyTable(result: AnatomyResult): string {
  const parts: string[] = []
  const allOrgans = result.systems.flatMap((s) => s.organs)
  parts.push(formatSystemMeters(result.systems))
  parts.push(formatOrganTable(allOrgans))
  parts.push(formatVitalSignsMonitor(result.vitalSigns))
  parts.push(formatAnatomyStats(result.stats))
  parts.push(formatAnatomyRecommendations(result.recommendations))
  return parts.join('\n')
}
