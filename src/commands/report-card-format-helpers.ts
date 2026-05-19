import chalk from 'chalk'
import {
  type Grade,
  type ReportCard,
  type ReportCardResult,
  type ReportCardStats,
  type Subject,
} from './report-card-helpers.js'

// ─── Grade Formatting ─────────────────────────────────────────────────────────

const GRADE_COLORS: Record<string, (t: string) => string> = {
  'A+': (t) => chalk.rgb(76, 175, 80)(t),
  'A': (t) => chalk.rgb(76, 175, 80)(t),
  'B+': (t) => chalk.rgb(139, 195, 74)(t),
  'B': (t) => chalk.rgb(139, 195, 74)(t),
  'C+': (t) => chalk.rgb(255, 193, 7)(t),
  'C': (t) => chalk.rgb(255, 193, 7)(t),
  'D': (t) => chalk.rgb(255, 152, 0)(t),
  'F': (t) => chalk.rgb(244, 67, 54)(t),
}

/**
 * Format a grade with color.
 *
 * @example
 * formatGrade('A+')
 */
export function formatGrade(grade: Grade): string {
  const colorFn = GRADE_COLORS[grade] ?? chalk.white
  return colorFn(grade.padEnd(2))
}

/**
 * Format GPA with color.
 *
 * @example
 * formatGPA(3.5)
 */
export function formatGPA(gpa: number): string {
  let colorFn: (t: string) => string
  if (gpa >= 3.5) colorFn = chalk.rgb(76, 175, 80)
  else if (gpa >= 2.5) colorFn = chalk.rgb(255, 193, 7)
  else colorFn = chalk.rgb(244, 67, 54)
  return colorFn(gpa.toFixed(2))
}

// ─── Score Bar ────────────────────────────────────────────────────────────────

/**
 * Render a score bar 0-100.
 *
 * @example
 * formatScoreBar(85)
 */
export function formatScoreBar(score: number): string {
  const filled = Math.round(score / 5)
  const empty = 20 - filled
  let colorFn: (t: string) => string
  if (score >= 80) colorFn = chalk.rgb(76, 175, 80)
  else if (score >= 60) colorFn = chalk.rgb(255, 193, 7)
  else colorFn = chalk.rgb(244, 67, 54)
  return colorFn('█'.repeat(Math.max(filled, 0)) + '░'.repeat(Math.max(empty, 0)))
}

// ─── Subject Row ──────────────────────────────────────────────────────────────

/**
 * Format a subject row for the report card table.
 *
 * @example
 * formatSubjectRow(subject)
 */
export function formatSubjectRow(subject: Subject): string {
  const grade = formatGrade(subject.grade)
  const bar = formatScoreBar(subject.score)
  return `  ${subject.icon} ${subject.name.padEnd(25)} ${grade}  ${bar} ${subject.score}`
}

// ─── Honors & Warnings ────────────────────────────────────────────────────────

/**
 * Format honors list.
 *
 * @example
 * formatHonors(["Dean's List: Documentation"])
 */
export function formatHonors(honors: string[]): string {
  if (honors.length === 0) return chalk.dim('  No honors this term.')
  const lines: string[] = []
  lines.push(chalk.bold(chalk.rgb(76, 175, 80)('  Honors:')))
  for (const h of honors) {
    lines.push(chalk.rgb(76, 175, 80)(`    ★ ${h}`))
  }
  return lines.join('\n')
}

/**
 * Format warnings list.
 *
 * @example
 * formatWarnings(['Academic Probation: Testing'])
 */
export function formatWarnings(warnings: string[]): string {
  if (warnings.length === 0) return chalk.dim('  No warnings this term.')
  const lines: string[] = []
  lines.push(chalk.bold(chalk.rgb(244, 67, 54)('  Warnings:')))
  for (const w of warnings) {
    lines.push(chalk.rgb(244, 67, 54)(`    ⚠ ${w}`))
  }
  return lines.join('\n')
}

// ─── Stats Summary ────────────────────────────────────────────────────────────

/**
 * Format report card stats.
 *
 * @example
 * formatStatsSummary(stats)
 */
export function formatStatsSummary(stats: ReportCardStats): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Statistics:'))
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  lines.push(`  Subjects: ${stats.totalSubjects}`)
  lines.push(`  Average Score: ${stats.averageScore}`)
  lines.push(`  Above 80: ${stats.subjectsAbove80} | Below 50: ${stats.subjectsBelow50}`)
  lines.push(`  Highest: ${stats.highestSubject}`)
  lines.push(`  Lowest: ${stats.lowestSubject}`)
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  return lines.join('\n')
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
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  for (let i = 0; i < recs.length; i++) {
    lines.push(`  ${i + 1}. ${recs[i]}`)
  }
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Full Report Card Table ───────────────────────────────────────────────────

/**
 * Format the full report card as a table.
 *
 * @example
 * formatReportCardTable(result)
 */
export function formatReportCardTable(result: ReportCardResult): string {
  const card = result.card
  const sections: string[] = []

  sections.push('')
  sections.push(chalk.bold('  ╔══════════════════════════════════════════════════════╗'))
  sections.push(chalk.bold('  ║') + chalk.bold('           PROJECT REPORT CARD              ') + chalk.bold('║'))
  sections.push(chalk.bold('  ╠══════════════════════════════════════════════════════╣'))
  sections.push(chalk.bold('  ║') + `  Student: ${chalk.bold(card.studentName)}`.padEnd(55) + chalk.bold('║'))
  sections.push(chalk.bold('  ║') + `  Date:    ${card.date}`.padEnd(55) + chalk.bold('║'))
  sections.push(chalk.bold('  ╠══════════════════════════════════════════════════════╣'))
  sections.push(chalk.bold('  ║') + `  Subject                    Grade  Score             ` + chalk.bold('║'))
  sections.push(chalk.bold('  ╠══════════════════════════════════════════════════════╣'))

  for (const subject of card.subjects) {
    const row = formatSubjectRow(subject)
    sections.push(chalk.bold('  ║') + row.substring(0, 54).padEnd(55) + chalk.bold('║'))
  }

  sections.push(chalk.bold('  ╠══════════════════════════════════════════════════════╣'))
  const overallGrade = formatGrade(card.overallGrade as Grade)
  sections.push(chalk.bold('  ║') + `  Overall: ${overallGrade}  GPA: ${formatGPA(card.gpa)}  Score: ${card.overallScore}`.padEnd(55) + chalk.bold('║'))
  sections.push(chalk.bold('  ╠══════════════════════════════════════════════════════╣'))

  sections.push('')
  sections.push(formatHonors(card.honors))
  sections.push('')
  sections.push(formatWarnings(card.warnings))
  sections.push('')
  sections.push(chalk.bold('  Teacher Summary:'))
  sections.push(chalk.gray('  ─────────────────────────────────────────────────'))
  sections.push(`  ${card.summary}`)
  sections.push(chalk.gray('  ─────────────────────────────────────────────────'))
  sections.push('')
  sections.push(formatStatsSummary(result.stats))
  sections.push('')
  sections.push(formatRecommendations(result.recommendations))
  sections.push(chalk.bold('  ╚══════════════════════════════════════════════════════╝'))
  sections.push('')

  return sections.join('\n')
}

// ─── JSON Format ──────────────────────────────────────────────────────────────

/**
 * Format report card as JSON string.
 *
 * @example
 * formatReportCardJSON(result)
 */
export function formatReportCardJSON(result: ReportCardResult): string {
  return JSON.stringify(result, null, 2)
}
