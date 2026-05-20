import chalk from 'chalk'

import type { ConstructionReport, ForemanStats, InspectionArea, Violation } from './foreman-helpers.js'

// ─── Grade Color ──────────────────────────────────────────────────────────────

/**
 * Get color function for grade.
 *
 * @example
 * getGradeColor('A')('text')
 */
export function getGradeColor(grade: string): (text: string) => string {
  if (grade.startsWith('A')) return chalk.rgb(50, 205, 50)
  if (grade.startsWith('B')) return chalk.rgb(124, 179, 66)
  if (grade.startsWith('C')) return chalk.rgb(255, 165, 0)
  if (grade.startsWith('D')) return chalk.rgb(255, 100, 50)
  return chalk.rgb(220, 50, 50)
}

/**
 * Get color for severity.
 *
 * @example
 * getSeverityColor('critical')('text')
 */
export function getSeverityColor(severity: string): (text: string) => string {
  switch (severity) {
    case 'critical': return chalk.rgb(220, 50, 50)
    case 'major': return chalk.rgb(255, 165, 0)
    case 'minor': return chalk.rgb(255, 215, 0)
    case 'cosmetic': return chalk.rgb(169, 169, 169)
    default: return chalk.white
  }
}

// ─── Report Card ──────────────────────────────────────────────────────────────

/**
 * Format inspection report card.
 *
 * @example
 * formatReportCard(areas)
 */
export function formatReportCard(areas: InspectionArea[]): string {
  if (areas.length === 0) return chalk.gray('  No inspection data')

  const lines: string[] = []
  lines.push(chalk.bold('  Inspection Report Card'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  for (const area of areas) {
    const color = getGradeColor(area.grade)
    const barLen = Math.max(1, Math.round(area.score / 5))
    const bar = '█'.repeat(barLen)
    lines.push(`  ${area.name.padEnd(12)} ${color(bar)} ${area.score} (${area.grade})`)
  }

  lines.push('')
  return lines.join('\n')
}

// ─── Violation Table ──────────────────────────────────────────────────────────

/**
 * Format violation table.
 *
 * @example
 * formatViolationTable(violations)
 */
export function formatViolationTable(violations: Violation[]): string {
  if (violations.length === 0) return chalk.rgb(50, 205, 50)('  ✓ No violations found — clean build!')

  const lines: string[] = []
  lines.push(chalk.bold('  Violations'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  const sorted = [...violations].sort((a, b) => {
    const order: Record<string, number> = { critical: 0, major: 1, minor: 2, cosmetic: 3 }
    return (order[a.severity] ?? 4) - (order[b.severity] ?? 4)
  })

  for (const v of sorted.slice(0, 20)) {
    const color = getSeverityColor(v.severity)
    lines.push(`  ${color(v.severity.padEnd(9))} ${v.code} ${v.file}:${v.line} ${v.message}`)
  }

  if (violations.length > 20) {
    lines.push(`  ... and ${violations.length - 20} more`)
  }

  lines.push('')
  return lines.join('\n')
}

// ─── Pass Rate Meter ──────────────────────────────────────────────────────────

/**
 * Format pass rate meter.
 *
 * @example
 * formatPassRateMeter(85)
 */
export function formatPassRateMeter(passRate: number): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Pass Rate'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  const filled = Math.round(passRate / 5)
  const empty = 20 - filled
  const bar = '█'.repeat(filled) + '░'.repeat(empty)
  const color = passRate > 80 ? chalk.rgb(50, 205, 50) : passRate > 60 ? chalk.rgb(255, 165, 0) : chalk.rgb(220, 50, 50)
  lines.push(`  ${color(bar)} ${passRate}%`)

  lines.push('')
  return lines.join('\n')
}

// ─── Fix Priority Queue ───────────────────────────────────────────────────────

/**
 * Format fix priority queue.
 *
 * @example
 * formatFixQueue(violations)
 */
export function formatFixQueue(violations: Violation[]): string {
  if (violations.length === 0) return chalk.gray('  No fixes needed')

  const lines: string[] = []
  lines.push(chalk.bold('  Fix Priority Queue'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  const critical = violations.filter((v) => v.severity === 'critical')
  const major = violations.filter((v) => v.severity === 'major')

  if (critical.length > 0) {
    lines.push(chalk.rgb(220, 50, 50)(`  🔴 Critical (${critical.length} issues)`))
    for (const v of critical.slice(0, 5)) {
      lines.push(`     ${v.code}: ${v.fix}`)
    }
  }

  if (major.length > 0) {
    lines.push(chalk.rgb(255, 165, 0)(`  🟡 Major (${major.length} issues)`))
    for (const v of major.slice(0, 5)) {
      lines.push(`     ${v.code}: ${v.fix}`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

// ─── Stats ────────────────────────────────────────────────────────────────────

/**
 * Format foreman stats.
 *
 * @example
 * formatForemanStats(stats)
 */
export function formatForemanStats(stats: ForemanStats): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Build Statistics'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))
  lines.push(`  Total Violations   ${stats.totalViolations}`)
  lines.push(`  Critical           ${stats.criticalCount}`)
  lines.push(`  Major              ${stats.majorCount}`)
  lines.push(`  Minor              ${stats.minorCount}`)
  lines.push(`  Cosmetic           ${stats.cosmeticCount}`)
  lines.push(`  Pass Rate          ${stats.passRate}%`)
  lines.push(`  Building Integrity ${stats.buildingIntegrity}`)
  lines.push(`  Estimated Fix Time ${stats.estimatedFixTime}`)
  lines.push(`  Safest Area        ${stats.safestArea}`)
  lines.push(`  Riskiest Area      ${stats.riskiestArea}`)

  lines.push('')
  return lines.join('\n')
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Format foreman recommendations.
 *
 * @example
 * formatForemanRecommendations(recs)
 */
export function formatForemanRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.gray('  No recommendations')

  const lines: string[] = []
  lines.push(chalk.bold('  Recommendations'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  for (let i = 0; i < recs.length; i++) {
    lines.push(`  ${i + 1}. ${recs[i]}`)
  }

  lines.push('')
  return lines.join('\n')
}

// ─── Table Output ─────────────────────────────────────────────────────────────

/**
 * Format full foreman table output.
 *
 * @example
 * formatForemanTable(result)
 */
export function formatForemanTable(result: ConstructionReport): string {
  const parts: string[] = []
  const gradeColor = getGradeColor(result.overallGrade)
  parts.push(gradeColor(`\n  Code Foreman — Build Inspection Report\n`))
  parts.push(`  Overall Grade: ${gradeColor(result.overallGrade)} (${result.overallScore}/100)\n`)
  parts.push(formatReportCard(result.areas))
  parts.push(formatViolationTable(result.areas.flatMap((a) => a.violations)))
  parts.push(formatPassRateMeter(result.stats.passRate))
  parts.push(formatFixQueue(result.areas.flatMap((a) => a.violations)))
  parts.push(formatForemanStats(result.stats))
  parts.push(formatForemanRecommendations(result.recommendations))
  return parts.join('\n')
}

// ─── JSON Output ──────────────────────────────────────────────────────────────

/**
 * Format foreman result as JSON.
 *
 * @example
 * formatForemanJSON(result)
 */
export function formatForemanJSON(result: ConstructionReport): string {
  return JSON.stringify(result, null, 2)
}
