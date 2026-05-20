import chalk from 'chalk'
import type {
  Discipline,
  DisciplineIndicator,
  PolymathFile,
  DarkAge,
  RenaissanceStats,
  RenaissanceResult,
} from './renaissance-helpers.js'

// ─── Discipline Formatting ────────────────────────────────────────────────────

/**
 * Format discipline grade with color
 * @example
 * formatDisciplineGrade('masterwork') // green 'MASTERWORK'
 */
export function formatDisciplineGrade(grade: Discipline['grade']): string {
  const colors: Record<Discipline['grade'], (s: string) => string> = {
    masterwork: chalk.green, excellent: chalk.rgb(100, 200, 100),
    good: chalk.cyan, fair: chalk.yellow, poor: chalk.rgb(255, 165, 0), neglected: chalk.red,
  }
  return colors[grade](grade.toUpperCase())
}

/**
 * Format a single discipline
 * @example
 * formatDiscipline(discipline) // '◆ architecture  85/100  MASTERWORK'
 */
export function formatDiscipline(d: Discipline): string {
  const grade = formatDisciplineGrade(d.grade)
  const bar = formatScoreBar(d.score)
  const strengths = d.strengths.length > 0 ? chalk.green(` +${d.strengths.length}`) : ''
  const weaknesses = d.weaknesses.length > 0 ? chalk.red(` -${d.weaknesses.length}`) : ''
  return `${chalk.magenta('◆')} ${chalk.bold(d.name.padEnd(16))} ${bar} ${grade.padEnd(14)} ${d.score}/100${strengths}${weaknesses}`
}

/**
 * Format a score bar
 * @example
 * formatScoreBar(75) // '███████████████░░░░░'
 */
export function formatScoreBar(score: number): string {
  const filled = Math.round(score / 5)
  const bar = '█'.repeat(filled) + '░'.repeat(20 - filled)
  if (score >= 70) return chalk.green(bar)
  if (score >= 40) return chalk.yellow(bar)
  return chalk.red(bar)
}

/**
 * Format all disciplines
 * @example
 * formatDisciplines(disciplines) // multi-line
 */
export function formatDisciplines(disciplines: Discipline[]): string {
  if (disciplines.length === 0) return chalk.gray('No disciplines evaluated.')
  return disciplines.map(formatDiscipline).join('\n')
}

// ─── Polymath File Formatting ─────────────────────────────────────────────────

/**
 * Format polymath classification with color
 * @example
 * formatClassification('polymath') // green 'POLYMATH'
 */
export function formatClassification(cls: PolymathFile['classification']): string {
  const colors: Record<PolymathFile['classification'], (s: string) => string> = {
    polymath: chalk.green, specialist: chalk.cyan,
    generalist: chalk.yellow, unbalanced: chalk.rgb(255, 165, 0), novice: chalk.red,
  }
  return colors[cls](cls.toUpperCase())
}

/**
 * Format a single polymath file
 * @example
 * formatPolymathFile(file) // '◆ src/a.ts  POLYMATH  avg: 75  balance: 90'
 */
export function formatPolymathFile(f: PolymathFile): string {
  const cls = formatClassification(f.classification)
  const renaissance = f.isRenaissance ? chalk.green('✓') : chalk.gray('✗')
  return `${chalk.magenta('◆')} ${chalk.cyan(f.file.padEnd(30))} ${cls.padEnd(14)} avg:${String(f.avgScore).padEnd(5)} bal:${f.balance}  ${renaissance}`
}

/**
 * Format polymath files section
 * @example
 * formatPolymathFiles(files) // multi-line
 */
export function formatPolymathFiles(files: PolymathFile[]): string {
  if (files.length === 0) return chalk.gray('No files evaluated.')
  return files.map(formatPolymathFile).join('\n')
}

// ─── Dark Ages Formatting ─────────────────────────────────────────────────────

/**
 * Format dark age severity with color
 * @example
 * formatSeverity('dark') // red 'DARK'
 */
export function formatSeverity(severity: DarkAge['severity']): string {
  const colors: Record<DarkAge['severity'], (s: string) => string> = {
    minor: chalk.yellow, moderate: chalk.rgb(255, 165, 0), major: chalk.red, dark: chalk.rgb(139, 0, 0),
  }
  return colors[severity](severity.toUpperCase())
}

/**
 * Format a single dark age
 * @example
 * formatDarkAge(darkAge) // '⚠ src/legacy  DARK  neglected: testing, security'
 */
export function formatDarkAge(d: DarkAge): string {
  const severity = formatSeverity(d.severity)
  return `${chalk.yellow('⚠')} ${chalk.bold(d.area.padEnd(25))} ${severity.padEnd(10)} neglected: ${d.neglectedDisciplines.join(', ')}`
}

/**
 * Format dark ages section
 * @example
 * formatDarkAges(darkAges) // multi-line
 */
export function formatDarkAges(darkAges: DarkAge[]): string {
  if (darkAges.length === 0) return chalk.green('✓ No dark age areas detected — the Renaissance is thriving!')
  return darkAges.map(formatDarkAge).join('\n')
}

// ─── Stats Formatting ─────────────────────────────────────────────────────────

/**
 * Format era with color
 * @example
 * formatEra('golden-age') // gold 'GOLDEN AGE'
 */
export function formatEra(era: RenaissanceStats['era']): string {
  const colors: Record<RenaissanceStats['era'], (s: string) => string> = {
    'golden-age': chalk.yellow, renaissance: chalk.green,
    enlightenment: chalk.cyan, medieval: chalk.yellow, 'dark-ages': chalk.red,
  }
  return colors[era](era.toUpperCase().replace('-', ' '))
}

/**
 * Format stats summary
 * @example
 * formatStats(stats) // multi-line summary
 */
export function formatStats(stats: RenaissanceStats): string {
  const lines = [
    chalk.bold('═'.repeat(50)),
    chalk.bold('       RENAISSANCE ANALYSIS SUMMARY'),
    chalk.bold('═'.repeat(50)),
    '',
    `${chalk.bold('Disciplines:')}             ${stats.totalDisciplines} (${stats.masterworkDisciplines} masterwork, ${stats.neglectedDisciplines} neglected)`,
    `${chalk.bold('Avg Discipline Score:')}    ${stats.avgDisciplineScore}`,
    `${chalk.bold('Polymath Files:')}          ${stats.polymathFiles}`,
    `${chalk.bold('Specialist Files:')}        ${stats.specialistFiles}`,
    `${chalk.bold('Novice Files:')}            ${stats.noviceFiles}`,
    '',
    `${chalk.bold('Dark Age Areas:')}          ${stats.darkAgeAreas} (${stats.majorDarkAges} major)`,
    `${chalk.bold('Avg Balance:')}             ${stats.avgBalance}`,
    `${chalk.bold('Renaissance Score:')}       ${stats.renaissanceScore}/100`,
    `${chalk.bold('Era:')}                     ${formatEra(stats.era)}`,
    '',
    `${chalk.bold('Patron Discipline:')}       ${stats.patronDiscipline}`,
    `${chalk.bold('Neglected Discipline:')}    ${stats.neglectedDiscipline}`,
    `${chalk.bold('Most Balanced:')}           ${stats.mostBalancedFile}`,
    `${chalk.bold('Least Balanced:')}          ${stats.leastBalancedFile}`,
    '',
    chalk.bold('═'.repeat(50)),
  ]
  return lines.join('\n')
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Format recommendations list
 * @example
 * formatRecommendations(recs) // numbered list
 */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.green('✓ No recommendations — the codebase is a Renaissance masterpiece!')
  return recommendations.map((r, i) => `${chalk.yellow(`${i + 1}.`)} ${r}`).join('\n')
}

// ─── Full Output ──────────────────────────────────────────────────────────────

/**
 * Format the complete renaissance result
 * @example
 * formatRenaissanceResult(result) // full formatted string
 */
export function formatRenaissanceResult(result: RenaissanceResult): string {
  const sections = [
    formatStats(result.stats),
    '',
    chalk.bold('── Disciplines ──'),
    formatDisciplines(result.disciplines),
    '',
    chalk.bold('── Files ──'),
    formatPolymathFiles(result.files),
    '',
    chalk.bold('── Dark Ages ──'),
    formatDarkAges(result.darkAges),
    '',
    chalk.bold('── Recommendations ──'),
    formatRecommendations(result.recommendations),
  ]
  return sections.join('\n')
}

/**
 * Format renaissance result as JSON string
 * @example
 * formatRenaissanceJson(result) // '{"disciplines":[...],...}'
 */
export function formatRenaissanceJson(result: RenaissanceResult): string {
  return JSON.stringify(result, null, 2)
}
