import chalk from 'chalk'
import {
  type QuarantineItem,
  type QuarantineResult,
  type QuarantineStats,
  type QuarantineZone,
  type RiskLevel,
  type ZoneStatus,
} from './quarantine-helpers.js'

// ─── Risk Level Formatting ────────────────────────────────────────────────────

const RISK_LABEL: Record<RiskLevel, (t: string) => string> = {
  low: (t) => chalk.rgb(76, 175, 80)(t),
  medium: (t) => chalk.rgb(255, 193, 7)(t),
  high: (t) => chalk.rgb(255, 152, 0)(t),
  critical: (t) => chalk.rgb(244, 67, 54)(t),
}

const RISK_ICON: Record<RiskLevel, string> = {
  low: '●',
  medium: '◐',
  high: '◑',
  critical: '⛔',
}

const STATUS_LABEL: Record<ZoneStatus, (t: string) => string> = {
  safe: (t) => chalk.rgb(76, 175, 80)(t),
  watch: (t) => chalk.rgb(255, 193, 7)(t),
  quarantine: (t) => chalk.rgb(255, 152, 0)(t),
  isolate: (t) => chalk.rgb(244, 67, 54)(t),
}

/**
 * Format risk level with icon and color.
 *
 * @example
 * formatRiskLevel('critical')
 */
export function formatRiskLevel(level: RiskLevel): string {
  const icon = RISK_ICON[level] ?? '○'
  const colorFn = RISK_LABEL[level] ?? chalk.white
  return colorFn(`${icon} ${level.toUpperCase()}`)
}

/**
 * Format zone status with color.
 *
 * @example
 * formatZoneStatus('quarantine')
 */
export function formatZoneStatus(status: ZoneStatus): string {
  const colorFn = STATUS_LABEL[status] ?? chalk.white
  return colorFn(status.toUpperCase())
}

// ─── Risk Distribution ────────────────────────────────────────────────────────

/**
 * Format risk level distribution bar.
 *
 * @example
 * formatRiskDistribution(stats)
 */
export function formatRiskDistribution(stats: QuarantineStats): string {
  const total = stats.totalItems || 1
  const critW = Math.round((stats.criticalCount / total) * 20)
  const highW = Math.round((stats.highCount / total) * 20)
  const medW = Math.round((stats.mediumCount / total) * 20)
  const lowW = 20 - critW - highW - medW

  const bar =
    chalk.rgb(244, 67, 54)('█'.repeat(Math.max(critW, 0))) +
    chalk.rgb(255, 152, 0)('█'.repeat(Math.max(highW, 0))) +
    chalk.rgb(255, 193, 7)('█'.repeat(Math.max(medW, 0))) +
    chalk.rgb(76, 175, 80)('█'.repeat(Math.max(lowW, 0)))

  return `  Risk: ${bar} ${stats.totalItems} items`
}

// ─── Zone Card ────────────────────────────────────────────────────────────────

/**
 * Format a single quarantine zone card.
 *
 * @example
 * formatZoneCard(zone)
 */
export function formatZoneCard(zone: QuarantineZone): string {
  const lines: string[] = []
  const statusStr = formatZoneStatus(zone.status)
  lines.push(chalk.bold(`  ${statusStr} ${zone.name} (score: ${zone.riskScore})`))
  lines.push(chalk.gray(`    ${zone.description}`))

  for (const item of zone.items.slice(0, 5)) {
    const level = formatRiskLevel(item.riskLevel)
    lines.push(`    ${level} L${item.line}: ${chalk.dim(item.code.substring(0, 50))}`)
    lines.push(chalk.dim(`      → ${item.suggestion}`))
  }

  if (zone.items.length > 5) {
    lines.push(chalk.dim(`    ... and ${zone.items.length - 5} more item(s)`))
  }

  return lines.join('\n')
}

// ─── Items Table ──────────────────────────────────────────────────────────────

/**
 * Format all quarantine items as a table.
 *
 * @example
 * formatItemsTable(items)
 */
export function formatItemsTable(items: QuarantineItem[]): string {
  if (items.length === 0) return chalk.dim('  No quarantine items found.')

  const lines: string[] = []
  lines.push(chalk.bold('  Quarantine Items:'))
  lines.push(chalk.gray('  ─────────────────────────────────────────────────────────────'))
  lines.push(chalk.gray('  File                 Line  Risk       Type              Reason'))
  lines.push(chalk.gray('  ─────────────────────────────────────────────────────────────'))

  for (const item of items.slice(0, 30)) {
    const file = item.file.padEnd(20)
    const line = String(item.line).padEnd(5)
    const level = formatRiskLevel(item.riskLevel)
    const riskType = item.riskType.padEnd(17)
    const reason = item.reason.substring(0, 30)
    lines.push(`  ${file} ${line} ${level} ${riskType} ${reason}`)
  }

  if (items.length > 30) {
    lines.push(chalk.dim(`  ... and ${items.length - 30} more item(s)`))
  }

  lines.push(chalk.gray('  ─────────────────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Stats Summary ────────────────────────────────────────────────────────────

/**
 * Format quarantine stats summary.
 *
 * @example
 * formatStatsSummary(stats)
 */
export function formatStatsSummary(stats: QuarantineStats): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Quarantine Stats:'))
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  lines.push(`  Total items: ${stats.totalItems}`)
  lines.push(`  Critical: ${stats.criticalCount} | High: ${stats.highCount} | Medium: ${stats.mediumCount} | Low: ${stats.lowCount}`)
  lines.push(formatRiskDistribution(stats))
  lines.push(`  Zones: ${stats.safeZones} safe | ${stats.watchZones} watch | ${stats.quarantineZones} quarantine | ${stats.isolateZones} isolate`)
  lines.push(`  Average risk score: ${stats.averageRiskScore}`)
  lines.push(`  Total dependents: ${stats.totalDependents}`)
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Format recommendations list.
 *
 * @example
 * formatRecommendations(recs)
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.dim('  No recommendations.')

  const lines: string[] = []
  lines.push(chalk.bold('  Recommendations:'))
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  for (let i = 0; i < recs.length; i++) {
    lines.push(`  ${i + 1}. ${recs[i]}`)
  }
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Full Table Format ────────────────────────────────────────────────────────

/**
 * Format the full quarantine result as a table.
 *
 * @example
 * formatQuarantineTable(result)
 */
export function formatQuarantineTable(result: QuarantineResult): string {
  const sections: string[] = []
  sections.push(chalk.bold('\n  Quarantine Analysis\n'))

  if (result.zones.length > 0) {
    sections.push(chalk.bold('  Quarantine Zones:'))
    sections.push(chalk.gray('  ─────────────────────────────────────────────────'))
    for (const zone of result.zones) {
      sections.push(formatZoneCard(zone))
      sections.push('')
    }
  }

  sections.push(formatItemsTable(result.items))
  sections.push('')
  sections.push(formatStatsSummary(result.stats))
  sections.push('')
  sections.push(formatRecommendations(result.recommendations))
  return sections.join('\n')
}

// ─── JSON Format ──────────────────────────────────────────────────────────────

/**
 * Format quarantine result as JSON string.
 *
 * @example
 * formatQuarantineJSON(result)
 */
export function formatQuarantineJSON(result: QuarantineResult): string {
  return JSON.stringify(result, null, 2)
}
