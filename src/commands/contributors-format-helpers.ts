import chalk from 'chalk'

import type { ContributorsResult } from './contributors-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Padding helpers ────────────────────────────────────

// ─── formatCommitBar ────────────────────────────────────

/**
 * Generate an inline text bar chart for commit counts.
 *
 * @example
 * ```ts
 * formatCommitBar(50, 100, 20) // '██████████░░░░░░░░░░'
 * formatCommitBar(100, 100, 20) // '████████████████████'
 * formatCommitBar(0, 100, 20) // '░░░░░░░░░░░░░░░░░░░░'
 * ```
 *
 * @param commits - Number of commits for this contributor
 * @param maxCommits - Maximum commits across all contributors
 * @param width - Bar width in characters (default 20)
 * @returns String bar using █ and ░ characters
 */
export function formatCommitBar(commits: number, maxCommits: number, width = 20): string {
  if (maxCommits === 0) return '░'.repeat(width)

  const filled = Math.round((commits / maxCommits) * width)
  const clampedFilled = Math.min(filled, width)
  return '█'.repeat(clampedFilled) + '░'.repeat(width - clampedFilled)
}

// ─── formatContributorsTable ────────────────────────────

/**
 * Format contributor results as a colorized table with optional verbose and by-file views.
 *
 * @example
 * ```ts
 * const table = formatContributorsTable(result, false, false)
 * ```
 */
export function formatContributorsTable(result: ContributorsResult, verbose: boolean, byFile: boolean): string {
  const { contributors, totalCommits, dateRange, busFactor, byFile: fileData } = result
  const lines: string[] = [chalk.bold('\n👥 Contributor Report'), '']

  if (contributors.length === 0) {
    lines.push(chalk.dim('No contributors found.'))
    return lines.join('\n')
  }

  const maxCommits = Math.max(...contributors.map((c) => c.commits))

  const colWidths = {
    activeDays: Math.max(7, ...contributors.map((c) => String(c.activeDays).length)),
    commits: Math.max(7, ...contributors.map((c) => String(c.commits).length), String(totalCommits).length),
    files: Math.max(6, ...contributors.map((c) => String(c.filesTouched).length)),
    linesAdded: Math.max(8, ...contributors.map((c) => String(c.linesAdded).length)),
    linesDeleted: Math.max(8, ...contributors.map((c) => String(c.linesDeleted).length)),
    name: Math.max(12, ...contributors.map((c) => c.name.length)),
    rank: 3,
  }

  const header =
    chalk.cyan(padRight('#', colWidths.rank)) +
    '  ' +
    chalk.cyan(padRight('Contributor', colWidths.name)) +
    '  ' +
    chalk.cyan(padLeft('Commits', colWidths.commits)) +
    '  ' +
    chalk.cyan(padLeft('Lines +', colWidths.linesAdded)) +
    '  ' +
    chalk.cyan(padLeft('Lines -', colWidths.linesDeleted)) +
    '  ' +
    chalk.cyan(padLeft('Files', colWidths.files)) +
    '  ' +
    chalk.cyan(padLeft('Days', colWidths.activeDays)) +
    '  ' +
    chalk.cyan('Bar')

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (let i = 0; i < contributors.length; i++) {
    const c = contributors[i]!
    const bar = formatCommitBar(c.commits, maxCommits)
    const rank = String(i + 1)

    const row =
      padRight(rank, colWidths.rank) +
      '  ' +
      padRight(c.name, colWidths.name) +
      '  ' +
      padLeft(String(c.commits), colWidths.commits) +
      '  ' +
      chalk.green(padLeft(String(c.linesAdded), colWidths.linesAdded)) +
      '  ' +
      chalk.red(padLeft(String(c.linesDeleted), colWidths.linesDeleted)) +
      '  ' +
      padLeft(String(c.filesTouched), colWidths.files) +
      '  ' +
      padLeft(String(c.activeDays), colWidths.activeDays) +
      '  ' +
      chalk.yellow(bar)

    lines.push(row)

    if (verbose && c.firstCommit && c.lastCommit) {
      lines.push(
        chalk.dim(
          `${' '.repeat(colWidths.rank + 2)}first: ${c.firstCommit.slice(0, 10)}  last: ${c.lastCommit.slice(0, 10)}`,
        ),
      )
    }
  }

  lines.push(chalk.dim('─'.repeat(header.length)))
  lines.push('')

  const summaryParts = [
    `${chalk.bold('Total commits:')} ${totalCommits}`,
    `${chalk.bold('Lines added:')} ${chalk.green(String(result.totalLinesAdded))}`,
    `${chalk.bold('Lines deleted:')} ${chalk.red(String(result.totalLinesDeleted))}`,
  ]
  lines.push(summaryParts.join('  '))

  if (dateRange.first && dateRange.last) {
    lines.push(
      `${chalk.bold('Date range:')} ${dateRange.first.slice(0, 10)} → ${dateRange.last.slice(0, 10)}`,
    )
  }

  lines.push(`${chalk.bold('Bus factor:')} ${busFactor === 1 ? chalk.red(String(busFactor)) : chalk.yellow(String(busFactor))}`)

  if (byFile && fileData.length > 0) {
    lines.push('')
    lines.push(chalk.bold('Per-File Contributors (top files by contributor count):'))
    lines.push('')

    const topFiles = fileData.slice(0, 20)
    for (const file of topFiles) {
      lines.push(`  ${chalk.cyan(file.filePath)} (${file.contributors.length} contributors)`)
      for (const fc of file.contributors.slice(0, 5)) {
        lines.push(chalk.dim(`    ${fc.name}: ${fc.commits} commits`))
      }
      if (file.contributors.length > 5) {
        lines.push(chalk.dim(`    ... and ${file.contributors.length - 5} more`))
      }
    }
  }

  return lines.join('\n')
}

// ─── formatContributorsCsv ──────────────────────────────

/**
 * Format contributor results as CSV.
 *
 * @example
 * ```ts
 * const csv = formatContributorsCsv(result)
 * ```
 */
export function formatContributorsCsv(result: ContributorsResult): string {
  const headers = ['Name', 'Email', 'Commits', 'Lines Added', 'Lines Deleted', 'Files Touched', 'Active Days', 'First Commit', 'Last Commit']
  const rows: string[] = [headers.join(',')]

  for (const c of result.contributors) {
    rows.push(
      [
        escapeCsv(c.name),
        escapeCsv(c.email),
        String(c.commits),
        String(c.linesAdded),
        String(c.linesDeleted),
        String(c.filesTouched),
        String(c.activeDays),
        c.firstCommit,
        c.lastCommit,
      ].join(','),
    )
  }

  return rows.join('\n')
}

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

// ─── formatContributorsJson ─────────────────────────────

/**
 * Format contributor results as pretty-printed JSON.
 *
 * @example
 * ```ts
 * const json = formatContributorsJson(result)
 * ```
 */
export function formatContributorsJson(result: ContributorsResult): string {
  return JSON.stringify(result, null, 2)
}
