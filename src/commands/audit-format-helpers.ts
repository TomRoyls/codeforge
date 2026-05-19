import chalk from 'chalk'

import type { AuditDimension, AuditFinding, AuditResult, AuditStats, AuditSummary } from './audit-helpers.js'

// ─── formatGradeBadge ─────────────────────────────────────────────────────────

/**
 * Format an ASCII grade badge.
 *
 * @example
 * formatGradeBadge('A', 95) // '[ A ] 95/100'
 */
export function formatGradeBadge(grade: string, score: number): string {
  const color = grade === 'A' ? chalk.green : grade === 'B' ? chalk.blue : grade === 'C' ? chalk.yellow : grade === 'D' ? chalk.rgb(255, 165, 0) : chalk.red
  return color(`[ ${grade} ]`) + ` ${score}/100`
}

// ─── formatDimensionGrid ──────────────────────────────────────────────────────

/**
 * Format dimensions as a scorecard grid.
 *
 * @example
 * formatDimensionGrid(dimensions) // ASCII grid
 */
export function formatDimensionGrid(dimensions: AuditDimension[]): string {
  const lines: string[] = []
  lines.push(chalk.bold('╔══════════════════════════════════════════════════════╗'))
  lines.push(chalk.bold('║') + chalk.bold('          CODEBASE AUDIT SCORECARD              ') + chalk.bold('║'))
  lines.push(chalk.bold('╠══════════════════════════════════════════════════════╣'))
  lines.push(chalk.bold('║') + ' Dimension          Grade  Score  Weight           ' + chalk.bold('║'))
  lines.push(chalk.bold('╟──────────────────────────────────────────────────────╢'))

  for (const dim of dimensions) {
    const name = dim.name.padEnd(14)
    const grade = formatGradeBadge(dim.grade, dim.score)
    const weight = `(${dim.weight}%)`
    const row = `║ ${name}  ${grade}  ${weight}`.padEnd(55) + '║'
    lines.push(row)
  }

  lines.push(chalk.bold('╚══════════════════════════════════════════════════════╝'))
  return lines.join('\n')
}

// ─── formatOverallGrade ───────────────────────────────────────────────────────

/**
 * Format the overall grade with large ASCII display.
 *
 * @example
 * formatOverallGrade(85, 'B') // large grade display
 */
export function formatOverallGrade(score: number, grade: string): string {
  const color = grade === 'A' ? chalk.green : grade === 'B' ? chalk.blue : grade === 'C' ? chalk.yellow : grade === 'D' ? chalk.rgb(255, 165, 0) : chalk.red
  const lines = [
    '',
    chalk.bold('  ┌────────────────────────────┐'),
    chalk.bold('  │') + chalk.bold('   OVERALL GRADE              ') + chalk.bold('│'),
    chalk.bold('  │') + color(`       ${grade}    `) + chalk.bold('│'),
    chalk.bold('  │') + `   Score: ${score}/100     ` + chalk.bold('│'),
    chalk.bold('  └────────────────────────────┘'),
    '',
  ]
  return lines.join('\n')
}

// ─── formatFindingsSummary ────────────────────────────────────────────────────

/**
 * Format finding counts by severity.
 *
 * @example
 * formatFindingsSummary(stats) // 'Errors: 2 | Warnings: 5 | Info: 10'
 */
export function formatFindingsSummary(stats: AuditStats): string {
  const lines = [
    chalk.bold('Findings Summary'),
    `  ${chalk.red('Errors:')}   ${stats.errorCount}`,
    `  ${chalk.yellow('Warnings:')} ${stats.warningCount}`,
    `  ${chalk.blue('Info:')}     ${stats.infoCount}`,
    `  ${chalk.bold('Total:')}    ${stats.totalFindings}`,
  ]
  return lines.join('\n')
}

// ─── formatFindingsTable ──────────────────────────────────────────────────────

/**
 * Format detailed findings as a table.
 *
 * @example
 * formatFindingsTable(findings) // severity table
 */
export function formatFindingsTable(findings: AuditFinding[]): string {
  if (findings.length === 0) return chalk.green('  No findings — codebase looks clean!')

  const sorted = [...findings].sort((a, b) => {
    const sev = { error: 0, warning: 1, info: 2 }
    return (sev[a.severity] ?? 2) - (sev[b.severity] ?? 2)
  })

  const lines: string[] = [chalk.bold('Detailed Findings')]
  let count = 0
  for (const f of sorted) {
    if (count >= 30) {
      lines.push(chalk.gray(`  ... and ${sorted.length - count} more findings`))
      break
    }
    const sevIcon = f.severity === 'error' ? chalk.red('✗') : f.severity === 'warning' ? chalk.yellow('⚠') : chalk.blue('ℹ')
    const loc = f.file ? `${f.file}:${f.line}` : 'general'
    lines.push(`  ${sevIcon} [${f.dimension}] ${f.message}`)
    lines.push(chalk.gray(`     ${loc} — ${f.suggestion}`))
    count++
  }

  return lines.join('\n')
}

// ─── formatConcernsAndStrengths ────────────────────────────────────────────────

/**
 * Format top concerns and strengths.
 *
 * @example
 * formatConcernsAndStrengths(summary) // concerns/strengths sections
 */
export function formatConcernsAndStrengths(summary: AuditSummary): string {
  const lines: string[] = []

  if (summary.topConcerns.length > 0) {
    lines.push(chalk.bold.red('Top Concerns'))
    for (let i = 0; i < summary.topConcerns.length; i++) {
      lines.push(`  ${i + 1}. ${summary.topConcerns[i]}`)
    }
    lines.push('')
  }

  if (summary.topStrengths.length > 0) {
    lines.push(chalk.bold.green('Top Strengths'))
    for (let i = 0; i < summary.topStrengths.length; i++) {
      lines.push(`  ${i + 1}. ${summary.topStrengths[i]}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

// ─── formatEffortEstimate ─────────────────────────────────────────────────────

/**
 * Format effort estimate section.
 *
 * @example
 * formatEffortEstimate('~2 hours') // effort section
 */
export function formatEffortEstimate(effort: string): string {
  return `${chalk.bold('Estimated Effort')}\n  ${effort} to address all findings`
}

// ─── formatRecommendations ────────────────────────────────────────────────────

/**
 * Format recommendations section.
 *
 * @example
 * formatRecommendations(['Fix X', 'Improve Y']) // numbered list
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.green('No recommendations needed.')
  const lines = [chalk.bold('Recommendations')]
  for (let i = 0; i < recs.length; i++) {
    lines.push(`  ${i + 1}. ${recs[i]}`)
  }
  return lines.join('\n')
}

// ─── formatStats ──────────────────────────────────────────────────────────────

/**
 * Format audit statistics.
 *
 * @example
 * formatStats(stats) // stats section
 */
export function formatStats(stats: AuditStats): string {
  const lines = [
    chalk.bold('Audit Statistics'),
    `  Files analyzed:      ${stats.totalFiles}`,
    `  Total lines:         ${stats.totalLines}`,
    `  Total findings:      ${stats.totalFindings}`,
    `  Dimensions assessed: ${stats.dimensionsAssessed}`,
    `  Audit timestamp:     ${stats.auditTimestamp}`,
  ]
  return lines.join('\n')
}

// ─── formatResult ─────────────────────────────────────────────────────────────

/**
 * Format the full AuditResult for terminal output.
 *
 * @example
 * formatResult(result) // full professional report
 */
export function formatResult(result: AuditResult): string {
  const sections: string[] = []

  sections.push(formatDimensionGrid(result.summary.dimensions))
  sections.push(formatOverallGrade(result.summary.overall, result.summary.overallGrade))
  sections.push(formatFindingsSummary(result.stats))
  sections.push('')
  sections.push(formatConcernsAndStrengths(result.summary))
  sections.push(formatEffortEstimate(result.summary.estimatedEffort))
  sections.push('')
  sections.push(formatFindingsTable(result.findings))
  sections.push('')
  sections.push(formatRecommendations(result.recommendations))
  sections.push('')
  sections.push(formatStats(result.stats))

  return sections.join('\n')
}

// ─── formatJson ───────────────────────────────────────────────────────────────

/**
 * JSON output format.
 *
 * @example
 * formatJson(result) // JSON string
 */
export function formatJson(result: AuditResult): string {
  return JSON.stringify(result, null, 2)
}
