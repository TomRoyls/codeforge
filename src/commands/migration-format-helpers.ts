import chalk from 'chalk'

import type { MigrationProgress, MigrationResult, MigrationStats } from './migration-helpers.js'

// ─── Progress Bar ───────────────────────────────────────

/**
 * @example
 * const bar = buildProgressBar(75, 20)
 * console.log(bar)
 */
export function buildProgressBar(percentage: number, width: number = 20): string {
  const filled = Math.round((percentage / 100) * width)
  const empty = width - filled

  const filledChar = '█'
  const emptyChar = '░'

  if (percentage >= 100) {
    return chalk.green(filledChar.repeat(filled) + emptyChar.repeat(empty))
  }
  if (percentage >= 50) {
    return chalk.rgb(255, 165, 0)(filledChar.repeat(filled)) + chalk.gray(emptyChar.repeat(empty))
  }
  return chalk.red(filledChar.repeat(filled)) + chalk.gray(emptyChar.repeat(empty))
}

// ─── Format Progress ────────────────────────────────────

/**
 * @example
 * const lines = formatProgressLines(progress)
 * console.log(lines.join('\n'))
 */
export function formatProgressLines(patterns: MigrationProgress[]): string[] {
  const lines: string[] = []

  const sorted = [...patterns].sort((a, b) => {
    const severityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 }
    const sa = severityOrder[a.severity] ?? 1
    const sb = severityOrder[b.severity] ?? 1
    return sa - sb
  })

  for (const p of sorted) {
    const bar = buildProgressBar(p.percentage)
    const status =
      p.percentage >= 100
        ? chalk.green('✓')
        : p.percentage > 0
          ? chalk.rgb(255, 165, 0)('○')
          : chalk.red('✗')
    const label = chalk.bold(p.name.padEnd(30))
    const count = chalk.gray(`(${p.totalOccurrences} in ${p.files} files)`)
    const pct = chalk.white(`${p.percentage}%`.padStart(4))

    lines.push(`  ${status} ${label} ${bar} ${pct} ${count}`)
  }

  return lines
}

// ─── Format Stats ───────────────────────────────────────

/**
 * @example
 * const text = formatMigrationStats(stats)
 * console.log(text)
 */
export function formatMigrationStats(stats: MigrationStats): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.bold('  Migration Statistics'))
  lines.push(chalk.gray('  ───────────────────'))

  lines.push(
    `  ${chalk.green('Completed:')}   ${stats.completedMigrations}/${stats.totalMigrations}`,
  )
  lines.push(
    `  ${chalk.rgb(255, 165, 0)('In Progress:')}  ${stats.inProgressMigrations}/${stats.totalMigrations}`,
  )
  lines.push(
    `  ${chalk.red('Not Started:')}  ${stats.notStartedMigrations}/${stats.totalMigrations}`,
  )

  lines.push('')
  lines.push(chalk.bold('  By Category'))

  for (const [cat, count] of Object.entries(stats.byCategory)) {
    lines.push(`    ${chalk.cyan(cat.padEnd(10))} ${count} occurrences`)
  }

  return lines.join('\n')
}

// ─── Format Overall Progress ────────────────────────────

/**
 * @example
 * const text = formatOverallProgress(75)
 * console.log(text)
 */
export function formatOverallProgress(percentage: number): string {
  const bar = buildProgressBar(percentage, 40)
  const label =
    percentage >= 100
      ? chalk.green.bold('COMPLETE')
      : percentage >= 50
        ? chalk.rgb(255, 165, 0).bold('IN PROGRESS')
        : chalk.red.bold('NEEDS WORK')

  return `\n  Overall Migration Progress ${bar} ${chalk.bold(`${percentage}%`)} ${label}\n`
}

// ─── Table Format ───────────────────────────────────────

/**
 * @example
 * const table = formatMigrationTable(result)
 * console.log(table)
 */
export function formatMigrationTable(result: MigrationResult): string {
  const parts: string[] = []

  parts.push(formatOverallProgress(result.overallProgress))

  parts.push(chalk.bold('  Migration Patterns'))
  parts.push(chalk.gray('  ──────────────────────────────────────────────────────────'))

  const progressLines = formatProgressLines(result.patterns)
  parts.push(progressLines.join('\n'))

  parts.push(formatMigrationStats(result.stats))

  return parts.join('\n')
}

// ─── JSON Format ────────────────────────────────────────

/**
 * @example
 * const json = formatMigrationJson(result)
 * console.log(json)
 */
export function formatMigrationJson(result: MigrationResult): string {
  return JSON.stringify(
    {
      overallProgress: result.overallProgress,
      patterns: result.patterns,
      stats: result.stats,
    },
    null,
    2,
  )
}
