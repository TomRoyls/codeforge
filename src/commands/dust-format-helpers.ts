import chalk from 'chalk'

import type { CleanlinessGrade, DustCategory, DustItem, DustReport, DustResult, DustStats, DustType } from './dust-helpers.js'

// ─── Badges ───────────────────────────────────────────────────────────────────

const TYPE_ICONS: Record<DustType, string> = {
  'commented-code': '⊘',
  'unused-import': '◎',
  'dead-export': '⊘',
  'stale-todo': '⚑',
  'deprecated-pattern': '⚡',
  'leftover-debug': '🐛',
  placeholder: '☐',
  'stale-config': '⚙',
  'orphan-file': '📄',
}

const SEVERITY_COLORS: Record<string, (s: string) => string> = {
  cleanup: (s) => chalk.rgb(255, 150, 100)(s),
  warning: (s) => chalk.yellow(s),
  info: (s) => chalk.blue(s),
}

const GRADE_COLORS: Record<CleanlinessGrade, (s: string) => string> = {
  spotless: (s) => chalk.rgb(100, 255, 100)(s),
  clean: (s) => chalk.green(s),
  dusty: (s) => chalk.yellow(s),
  dirty: (s) => chalk.rgb(255, 150, 100)(s),
  cluttered: (s) => chalk.rgb(255, 80, 80)(s),
}

/**
 * Format a dust type badge.
 *
 * @example
 * dustTypeBadge('leftover-debug')
 */
export function dustTypeBadge(type: DustType): string {
  return TYPE_ICONS[type] ?? '?'
}

/**
 * Format a cleanliness grade badge.
 *
 * @example
 * gradeBadge('spotless')
 */
export function gradeBadge(grade: CleanlinessGrade): string {
  const labels: Record<CleanlinessGrade, string> = {
    spotless: 'SPOTLESS', clean: 'CLEAN', dusty: 'DUSTY', dirty: 'DIRTY', cluttered: 'CLUTTERED',
  }
  return GRADE_COLORS[grade](labels[grade])
}

// ─── Cleanliness meter ────────────────────────────────────────────────────────

/**
 * Render an ASCII cleanliness meter.
 *
 * @example
 * cleanlinessMeter(85)
 * // => '████████░░ 85'
 */
export function cleanlinessMeter(score: number): string {
  const filled = Math.round(score / 10)
  const empty = 10 - filled
  const bar = '█'.repeat(filled) + '░'.repeat(empty)
  const color = score >= 80 ? chalk.green : score >= 60 ? chalk.yellow : chalk.rgb(255, 100, 100)
  return color(`${bar} ${score}`)
}

// ─── Tables ───────────────────────────────────────────────────────────────────

/**
 * Format the dust findings table.
 *
 * @example
 * formatDustTable(items)
 */
export function formatDustTable(items: DustItem[]): string {
  if (items.length === 0) return chalk.dim('  (no dust detected)')

  const rows = items.slice(0, 50).map((item) => {
    const icon = dustTypeBadge(item.type)
    const sev = SEVERITY_COLORS[item.severity](item.severity.padEnd(7))
    return `  ${icon} ${sev} ${chalk.dim(item.file + ':' + item.line)} ${item.description}`
  })

  return rows.join('\n')
}

/**
 * Format per-file cleanliness report.
 *
 * @example
 * formatFileReports(reports)
 */
export function formatFileReports(reports: DustReport[]): string {
  if (reports.length === 0) return chalk.dim('  (no files)')

  const dusty = reports.filter((r) => r.dustCount > 0)
  if (dusty.length === 0) return chalk.green('  All files are spotless')

  const rows = dusty.map((r) => {
    const badge = gradeBadge(r.grade)
    const meter = cleanlinessMeter(r.cleanliness)
    return `  ${badge.padEnd(12)} ${meter.padEnd(20)} ${r.dustCount} dust ${chalk.dim(r.file)}`
  })

  return rows.join('\n')
}

/**
 * Format category breakdown.
 *
 * @example
 * formatCategoryBreakdown(categories)
 */
export function formatCategoryBreakdown(categories: DustCategory[]): string {
  if (categories.length === 0) return chalk.dim('  (no categories)')

  const rows = categories.map((cat) => {
    const icon = dustTypeBadge(cat.type as DustType)
    const sev = SEVERITY_COLORS[cat.severity](cat.severity)
    return `  ${icon} ${String(cat.count).padStart(3)} × ${cat.type.padEnd(20)} ${sev} — ${cat.description}`
  })

  return rows.join('\n')
}

// ─── Stats formatting ─────────────────────────────────────────────────────────

/**
 * Format the statistics summary.
 *
 * @example
 * formatDustStats(stats)
 */
export function formatDustStats(stats: DustStats): string {
  const lines = [
    chalk.bold('  Total Dust:          ') + String(stats.totalDust),
    chalk.bold('  Dusty Files:         ') + chalk.yellow(String(stats.dustyFiles)),
    chalk.bold('  Clean Files:         ') + chalk.green(String(stats.cleanFiles)),
    chalk.bold('  Avg Cleanliness:     ') + String(stats.averageCleanliness),
    chalk.bold('  Most Common Dust:    ') + stats.mostCommonDust,
    chalk.bold('  Dustiest File:       ') + stats.dustiestFile,
    chalk.bold('  Overall Cleanliness: ') + cleanlinessMeter(stats.overallCleanliness),
  ]
  return lines.join('\n')
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Format recommendations as a bullet list.
 *
 * @example
 * formatDustRecommendations(recs)
 */
export function formatDustRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('  (no recommendations)')
  return recommendations.map((r) => `  ${chalk.cyan('→')} ${r}`).join('\n')
}

// ─── Full output ──────────────────────────────────────────────────────────────

/**
 * Format the full console output.
 *
 * @example
 * formatDustOutput(result)
 */
export function formatDustOutput(result: DustResult): string {
  const sections: string[] = []

  sections.push(chalk.bold.rgb(150, 220, 255)('\n╔═ Dust Statistics ════════════════════════════════════════╗'))
  sections.push(formatDustStats(result.stats))
  sections.push('')

  if (result.categories.length > 0) {
    sections.push(chalk.bold.rgb(150, 220, 255)('╔═ Category Breakdown ════════════════════════════════════╗'))
    sections.push(formatCategoryBreakdown(result.categories))
    sections.push('')
  }

  sections.push(chalk.bold.rgb(150, 220, 255)('╔═ File Cleanliness ══════════════════════════════════════╗'))
  sections.push(formatFileReports(result.files))
  sections.push('')

  if (result.allDust.length > 0) {
    sections.push(chalk.bold.rgb(150, 220, 255)('╔═ Dust Findings ═════════════════════════════════════════╗'))
    sections.push(formatDustTable(result.allDust))
    sections.push('')
  }

  sections.push(chalk.bold.rgb(150, 220, 255)('╔═ Recommendations ══════════════════════════════════════╗'))
  sections.push(formatDustRecommendations(result.recommendations))

  return sections.join('\n')
}

/**
 * Format the result as JSON.
 *
 * @example
 * formatDustJson(result)
 */
export function formatDustJson(result: DustResult): string {
  return JSON.stringify(result, null, 2)
}
