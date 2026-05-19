import chalk from 'chalk'

import type { HealthAction, HealthDimension, HealthReport } from './health-dashboard-helpers.js'

// ─── Grade Coloring ─────────────────────────────────────

/**
 * @example
 * const colored = colorGrade('A')
 * console.log(colored)
 */
export function colorGrade(grade: string): string {
  switch (grade) {
    case 'A': return chalk.green.bold(grade)
    case 'B': return chalk.cyan.bold(grade)
    case 'C': return chalk.rgb(255, 165, 0).bold(grade)
    case 'D': return chalk.rgb(255, 100, 50).bold(grade)
    case 'F': return chalk.red.bold(grade)
    default: return grade
  }
}

// ─── Format Dimension ───────────────────────────────────

/**
 * @example
 * const lines = formatDimension(dim)
 * console.log(lines.join('\n'))
 */
export function formatDimension(dim: HealthDimension): string[] {
  const lines: string[] = []
  const gradeStr = colorGrade(dim.grade)
  const scoreStr = `${dim.score}%`.padStart(4)
  const bar = buildScoreBar(dim.score, 20)

  lines.push(`  ${dim.name.padEnd(15)} ${bar} ${scoreStr} ${gradeStr}`)

  for (const finding of dim.findings) {
    lines.push(`    ${chalk.gray('•')} ${chalk.gray(finding)}`)
  }

  return lines
}

// ─── Build Score Bar ────────────────────────────────────

/**
 * @example
 * const bar = buildScoreBar(75, 10)
 * console.log(bar)
 */
export function buildScoreBar(score: number, width: number = 20): string {
  const filled = Math.round((score / 100) * width)
  const empty = width - filled

  if (score >= 90) return chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty))
  if (score >= 70) return chalk.cyan('█'.repeat(filled)) + chalk.gray('░'.repeat(empty))
  if (score >= 50) return chalk.rgb(255, 165, 0)('█'.repeat(filled)) + chalk.gray('░'.repeat(empty))
  return chalk.red('█'.repeat(filled)) + chalk.gray('░'.repeat(empty))
}

// ─── Format Priority Actions ────────────────────────────

/**
 * @example
 * const lines = formatActions(actions)
 * console.log(lines.join('\n'))
 */
export function formatActions(actions: HealthAction[]): string[] {
  const lines: string[] = []

  lines.push(chalk.bold('  Priority Actions'))
  lines.push(chalk.gray('  ──────────────────────────────────────'))

  for (const action of actions) {
    const effortColor =
      action.effort === 'low' ? chalk.green :
      action.effort === 'medium' ? chalk.rgb(255, 165, 0) :
      chalk.red

    lines.push(
      `  ${chalk.bold(`#${action.priority}`)} [${chalk.cyan(action.dimension)}] ${action.action}`,
    )
    lines.push(
      `     ${chalk.gray('Impact:')} ${action.impact} ${chalk.gray('Effort:')} ${effortColor(action.effort)}`,
    )
  }

  return lines
}

// ─── Format Health Report ───────────────────────────────

/**
 * @example
 * const text = formatHealthReport(report)
 * console.log(text)
 */
export function formatHealthReport(report: HealthReport): string {
  const parts: string[] = []

  parts.push('')
  parts.push(chalk.bold('  Project Health Dashboard'))
  parts.push(chalk.gray('  ══════════════════════════════════════'))

  const overallGrade = colorGrade(report.grade)
  const overallBar = buildScoreBar(report.overall, 30)
  parts.push(
    `  Overall: ${overallBar} ${chalk.bold(`${report.overall}%`)} ${overallGrade}`,
  )
  parts.push('')

  parts.push(chalk.bold('  Dimensions'))
  parts.push(chalk.gray('  ──────────────────────────────────────'))

  for (const dim of report.dimensions) {
    parts.push(...formatDimension(dim))
  }

  if (report.highlights.length > 0) {
    parts.push('')
    parts.push(chalk.bold('  Strengths'))
    parts.push(chalk.gray('  ──────────────────────────────────────'))
    for (const h of report.highlights) {
      parts.push(`  ${chalk.green('✓')} ${h}`)
    }
  }

  if (report.concerns.length > 0) {
    parts.push('')
    parts.push(chalk.bold('  Concerns'))
    parts.push(chalk.gray('  ──────────────────────────────────────'))
    for (const c of report.concerns) {
      parts.push(`  ${chalk.red('!')} ${c}`)
    }
  }

  if (report.actions.length > 0) {
    parts.push('')
    parts.push(...formatActions(report.actions))
  }

  parts.push('')
  return parts.join('\n')
}

// ─── Format Health JSON ─────────────────────────────────

/**
 * @example
 * const json = formatHealthJson(report)
 * console.log(json)
 */
export function formatHealthJson(report: HealthReport): string {
  return JSON.stringify(
    {
      concerns: report.concerns,
      dimensions: report.dimensions.map((d) => ({
        findings: d.findings,
        grade: d.grade,
        name: d.name,
        score: d.score,
        suggestions: d.suggestions,
        weight: d.weight,
      })),
      grade: report.grade,
      highlights: report.highlights,
      overall: report.overall,
      topActions: report.actions.slice(0, 5),
    },
    null,
    2,
  )
}
