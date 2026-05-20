import chalk from 'chalk'

import type {
  Audit,
  DangerZone,
  LighthouseCategory,
  LighthouseResult,
  LighthouseStats,
  SafeHarbor,
} from './lighthouse-helpers.js'

// ─── Score Gauge ──────────────────────────────────────────────────────────────

/**
 * Format ASCII gauge for overall score.
 *
 * @example
 * formatScoreGauge(85)
 */
export function formatScoreGauge(score: number): string {
  let colorFn: (t: string) => string
  if (score >= 90) colorFn = chalk.green
  else if (score >= 70) colorFn = chalk.rgb(255, 193, 7)
  else if (score >= 50) colorFn = chalk.rgb(255, 152, 0)
  else colorFn = chalk.rgb(244, 67, 54)

  const filled = Math.round(score / 5)
  const empty = 20 - filled
  const bar = colorFn('█'.repeat(Math.max(filled, 0)) + '░'.repeat(Math.max(empty, 0)))
  return `${bar} ${colorFn(score + '/100')}`
}

// ─── Category Scores ──────────────────────────────────────────────────────────

/**
 * Format category scores section.
 *
 * @example
 * formatCategoryScores(categories)
 */
export function formatCategoryScores(categories: LighthouseCategory[]): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Category Scores:'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────────'))

  for (const cat of categories) {
    const scoreColor = cat.score >= 90 ? chalk.green : cat.score >= 70 ? chalk.rgb(255, 193, 7) : chalk.rgb(244, 67, 54)
    const indicator = cat.score === 100 ? chalk.green('✓') : cat.score >= 50 ? chalk.rgb(255, 193, 7)('△') : chalk.rgb(244, 67, 54)('✗')
    const passed = cat.audits.filter((a) => a.score === 1).length
    const total = cat.audits.length
    lines.push(`  ${indicator} ${cat.name.padEnd(20)} ${scoreColor(String(cat.score).padStart(3) + '/100')} (${passed}/${total} audits) weight: ${cat.weight}`)
  }

  lines.push(chalk.gray('  ────────────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Audit Details ────────────────────────────────────────────────────────────

/**
 * Format audit details.
 *
 * @example
 * formatAuditDetails(audits)
 */
export function formatAuditDetails(audits: Audit[]): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Audit Details:'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────────'))

  for (const audit of audits) {
    const pass = audit.score === 1
    const icon = pass ? chalk.green('✓') : audit.severity === 'critical' ? chalk.rgb(244, 67, 54)('✗') : chalk.rgb(255, 193, 7)('△')
    const statusText = pass ? chalk.green('PASS') : chalk.rgb(244, 67, 54)('FAIL')
    lines.push(`  ${icon} ${audit.title.padEnd(40)} ${statusText}`)
    if (!pass && audit.files.length > 0) {
      lines.push(chalk.dim(`    Files: ${audit.files.slice(0, 5).join(', ')}${audit.files.length > 5 ? ` (+${audit.files.length - 5} more)` : ''}`))
      lines.push(chalk.dim(`    Fix: ${audit.suggestion}`))
    }
  }

  lines.push(chalk.gray('  ────────────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Danger Zone Map ──────────────────────────────────────────────────────────

const DANGER_ICONS: Record<string, string> = {
  reef: '🪸',
  storm: '⛈',
  fog: '🌫',
  current: '🌀',
  shallows: '🏖',
}

/**
 * Format danger zone map.
 *
 * @example
 * formatDangerZoneMap(zones)
 */
export function formatDangerZoneMap(zones: DangerZone[]): string {
  if (zones.length === 0) return chalk.dim('  No danger zones detected — clear sailing!')

  const lines: string[] = []
  lines.push(chalk.bold('  Danger Zone Map:'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────────'))

  const grouped = new Map<string, DangerZone[]>()
  for (const zone of zones) {
    const group = grouped.get(zone.type)
    if (group) group.push(zone)
    else grouped.set(zone.type, [zone])
  }

  for (const [type, typeZones] of grouped) {
    const icon = DANGER_ICONS[type] ?? '⚠'
    const sevColor = typeZones.some((z) => z.severity === 'critical') ? chalk.rgb(244, 67, 54) : typeZones.some((z) => z.severity === 'warning') ? chalk.rgb(255, 193, 7) : chalk.dim
    lines.push(`  ${icon} ${sevColor(type.charAt(0).toUpperCase() + type.slice(1))} (${typeZones.length} issue(s))`)
    for (const z of typeZones.slice(0, 5)) {
      lines.push(chalk.dim(`    ${z.file}:${z.line} — ${z.message}`))
    }
    if (typeZones.length > 5) {
      lines.push(chalk.dim(`    ... and ${typeZones.length - 5} more`))
    }
  }

  lines.push(chalk.gray('  ────────────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Safe Harbors ─────────────────────────────────────────────────────────────

/**
 * Format safe harbors section.
 *
 * @example
 * formatSafeHarbors(harbors)
 */
export function formatSafeHarbors(harbors: SafeHarbor[]): string {
  if (harbors.length === 0) return chalk.dim('  No safe harbor patterns detected.')

  const lines: string[] = []
  lines.push(chalk.bold('  Safe Harbors:'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────────'))

  for (const harbor of harbors) {
    lines.push(chalk.green(`  ⚓ ${harbor.pattern}`))
    lines.push(chalk.dim(`    ${harbor.description} (${harbor.files.length} file(s))`))
  }

  lines.push(chalk.gray('  ────────────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Stats ────────────────────────────────────────────────────────────────────

/**
 * Format stats section.
 *
 * @example
 * formatLighthouseStats(stats)
 */
export function formatLighthouseStats(stats: LighthouseStats): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Lighthouse Stats:'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────────'))
  lines.push(`  Health Grade: ${formatGrade(stats.healthGrade)}`)
  lines.push(`  Audits: ${stats.passedAudits}/${stats.totalAudits} passed`)
  lines.push(`  Critical Issues: ${stats.criticalIssues} | Warnings: ${stats.warnings}`)
  lines.push(`  Danger Zones: ${stats.dangerZoneCount} | Safe Harbors: ${stats.safeHarborCount}`)
  lines.push(chalk.gray('  ────────────────────────────────────────────────────────'))
  return lines.join('\n')
}

/**
 * Format health grade with color.
 *
 * @example
 * formatGrade('A+')
 */
export function formatGrade(grade: string): string {
  if (grade.startsWith('A')) return chalk.green(grade)
  if (grade.startsWith('B')) return chalk.rgb(76, 175, 80)(grade)
  if (grade.startsWith('C')) return chalk.rgb(255, 193, 7)(grade)
  if (grade === 'D') return chalk.rgb(255, 152, 0)(grade)
  if (grade === 'E') return chalk.rgb(255, 87, 34)(grade)
  return chalk.rgb(244, 67, 54)(grade)
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatRecommendations(recs)
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.dim('  No recommendations.')
  const lines: string[] = []
  lines.push(chalk.bold('  Recommendations:'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────────'))
  for (let i = 0; i < recs.length; i++) {
    lines.push(`  ${i + 1}. ${recs[i]}`)
  }
  lines.push(chalk.gray('  ────────────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Full Output ──────────────────────────────────────────────────────────────

/**
 * Format full lighthouse table output.
 *
 * @example
 * formatLighthouseTable(result)
 */
export function formatLighthouseTable(result: LighthouseResult): string {
  const sections: string[] = []
  sections.push('')
  sections.push(chalk.bold('  Code Lighthouse — Health Beacon Scan\n'))
  sections.push(chalk.bold('  Overall Score:'))
  sections.push(`  ${formatScoreGauge(result.overallScore)}`)
  sections.push(`  Grade: ${formatGrade(result.stats.healthGrade)}`)
  sections.push('')
  sections.push(formatCategoryScores(result.categories))
  sections.push('')

  const allAudits = result.categories.flatMap((c) => c.audits)
  sections.push(formatAuditDetails(allAudits))
  sections.push('')
  sections.push(formatDangerZoneMap(result.dangerZones))
  sections.push('')
  sections.push(formatSafeHarbors(result.safeHarbors))
  sections.push('')
  sections.push(formatLighthouseStats(result.stats))
  sections.push('')
  sections.push(formatRecommendations(result.recommendations))
  sections.push('')
  return sections.join('\n')
}

/**
 * Format lighthouse result as JSON.
 *
 * @example
 * formatLighthouseJSON(result)
 */
export function formatLighthouseJSON(result: LighthouseResult): string {
  return JSON.stringify(result, null, 2)
}
