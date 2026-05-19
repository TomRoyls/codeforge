import chalk from 'chalk'

import type { FileReview, ReviewFinding, ReviewResult, ReviewStats } from './review-helpers.js'

// ─── Severity Icons ───────────────────────────────────────────────────────────

const SEVERITY_ICONS: Record<string, string> = {
  error: chalk.rgb(255, 80, 80)('✕'),
  warning: chalk.rgb(255, 200, 50)('⚠'),
  info: chalk.rgb(100, 180, 255)('ℹ'),
}

const GRADE_COLORS: Record<string, (s: string) => string> = {
  A: chalk.rgb(80, 255, 120),
  B: chalk.rgb(150, 255, 80),
  C: chalk.rgb(255, 255, 80),
  D: chalk.rgb(255, 180, 50),
  F: chalk.rgb(255, 80, 80),
}

// ─── Format Findings Table ────────────────────────────────────────────────────

/**
 * Format review findings as a table.
 *
 * @example
 * formatFindingsTable(findings) // formatted string
 */
export function formatFindingsTable(findings: ReviewFinding[]): string {
  if (findings.length === 0) return chalk.rgb(80, 255, 120)('  No findings. Code looks clean!')

  const lines: string[] = [chalk.bold('\n  Code Review Findings\n')]

  for (const f of findings) {
    const icon = SEVERITY_ICONS[f.severity] ?? '?'
    const loc = chalk.rgb(150, 150, 150)(`${f.file}:${f.line}:${f.column}`)
    const sev = chalk.rgb(f.severity === 'error' ? 255 : f.severity === 'warning' ? 200 : 100, f.severity === 'error' ? 80 : f.severity === 'warning' ? 50 : 180, f.severity === 'error' ? 80 : f.severity === 'warning' ? 50 : 255)(f.severity.toUpperCase().padEnd(7))
    lines.push(`  ${icon} ${sev} ${loc}`)
    lines.push(`    ${f.message}`)
    lines.push(`    ${chalk.rgb(120, 180, 120)(`→ ${f.suggestion}`)}`)
  }

  return lines.join('\n')
}

// ─── Format File Grades ───────────────────────────────────────────────────────

/**
 * Format per-file grades.
 *
 * @example
 * formatFileGrades(fileReviews) // formatted string
 */
export function formatFileGrades(files: FileReview[]): string {
  if (files.length === 0) return ''

  const lines: string[] = [chalk.bold('\n  File Grades\n')]
  const maxFileLen = Math.max(...files.map((f) => f.file.length), 10)

  for (const fr of files) {
    const gradeColor = GRADE_COLORS[fr.grade] ?? chalk.white
    const grade = gradeColor(`  ${fr.grade}  `)
    const density = fr.findingDensity.toFixed(1)
    const file = chalk.white(fr.file.padEnd(maxFileLen))
    const score = chalk.rgb(150, 150, 150)(`${String(fr.score).padStart(3)}/100`)
    const dens = chalk.rgb(150, 150, 150)(`density: ${density}`)
    lines.push(`  ${grade} ${file} ${score} ${dens}`)
  }

  return lines.join('\n')
}

// ─── Format Category Breakdown ────────────────────────────────────────────────

/**
 * Format category breakdown chart.
 *
 * @example
 * formatCategoryBreakdown({ style: 5, complexity: 3 }) // formatted string
 */
export function formatCategoryBreakdown(breakdown: Record<string, number>): string {
  const entries = Object.entries(breakdown).sort((a, b) => b[1] - a[1])
  if (entries.length === 0) return ''

  const lines: string[] = [chalk.bold('\n  Category Breakdown\n')]
  const maxCount = Math.max(...entries.map((e) => e[1]), 1)

  for (const [category, count] of entries) {
    const barWidth = Math.max(1, Math.round((count / maxCount) * 20))
    const bar = '█'.repeat(barWidth)
    const cat = category.padEnd(16)
    lines.push(`  ${chalk.rgb(100, 180, 255)(cat)} ${chalk.rgb(80, 200, 150)(bar)} ${count}`)
  }

  return lines.join('\n')
}

// ─── Format Top Issues ────────────────────────────────────────────────────────

/**
 * Format top issues priority list.
 *
 * @example
 * formatTopIssues(topIssues) // formatted string
 */
export function formatTopIssues(issues: ReviewFinding[]): string {
  if (issues.length === 0) return ''

  const lines: string[] = [chalk.bold('\n  Top Issues\n')]

  for (let i = 0; i < issues.length; i++) {
    const f = issues[i]!
    const icon = SEVERITY_ICONS[f.severity] ?? '?'
    const num = chalk.rgb(150, 150, 150)(`#${i + 1}`.padEnd(3))
    lines.push(`  ${num} ${icon} ${f.message}`)
    lines.push(`      ${chalk.rgb(150, 150, 150)(`${f.file}:${f.line}`)} [${f.rule}] [${f.effort}]`)
  }

  return lines.join('\n')
}

// ─── Format Stats Line ────────────────────────────────────────────────────────

/**
 * Format review stats summary.
 *
 * @example
 * formatStatsLine(stats) // 'Files: 10 | Findings: 5 | Score: 85/100'
 */
export function formatStatsLine(stats: ReviewStats): string {
  const gradeColor = GRADE_COLORS[stats.overallGrade] ?? chalk.white
  return [
    `Files: ${stats.totalFiles}`,
    `Findings: ${stats.totalFindings}`,
    `Errors: ${stats.errorCount}`,
    `Warnings: ${stats.warningCount}`,
    `Score: ${stats.averageScore}/100`,
    `Grade: ${gradeColor(stats.overallGrade)}`,
    `Fix Time: ${stats.estimatedFixTime}`,
  ].join(' | ')
}

// ─── Format Recommendations ───────────────────────────────────────────────────

/**
 * Format recommendations list.
 *
 * @example
 * formatRecommendations(['Fix 3 errors']) // formatted string
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return ''
  const lines: string[] = [chalk.bold('\n  Recommendations\n')]
  for (const r of recs) {
    lines.push(`  ${chalk.rgb(255, 200, 50)('→')} ${r}`)
  }
  return lines.join('\n')
}

// ─── Format Review Result Table ───────────────────────────────────────────────

/**
 * Format the full review result.
 *
 * @example
 * formatReviewResultTable(result, false) // complete formatted output
 */
export function formatReviewResultTable(result: ReviewResult, verbose: boolean): string {
  const parts: string[] = []

  parts.push(formatStatsLine(result.stats))
  parts.push(formatFileGrades(result.files))

  if (verbose) {
    parts.push(formatFindingsTable(result.findings))
  } else {
    parts.push(formatTopIssues(result.topIssues))
  }

  parts.push(formatCategoryBreakdown(result.categoryBreakdown))
  parts.push(formatRecommendations(result.recommendations))

  return parts.join('\n')
}

// ─── Format Review JSON ───────────────────────────────────────────────────────

/**
 * Format review result as JSON.
 *
 * @example
 * formatReviewJson(result) // JSON string
 */
export function formatReviewJson(result: ReviewResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Format Review CSV ────────────────────────────────────────────────────────

/**
 * Format review findings as CSV.
 *
 * @example
 * formatReviewCsv(result) // CSV string
 */
export function formatReviewCsv(result: ReviewResult): string {
  const header = 'file,line,column,severity,rule,category,message,effort'
  const rows = result.findings.map((f) =>
    [
      f.file,
      f.line,
      f.column,
      f.severity,
      f.rule,
      f.category,
      `"${f.message.replace(/"/g, '""')}"`,
      f.effort,
    ].join(','),
  )
  return [header, ...rows].join('\n')
}
