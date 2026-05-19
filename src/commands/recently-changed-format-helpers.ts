import chalk from 'chalk'

import type { RecentResult } from './recently-changed-helpers.js'

// ─── Date coloring ──────────────────────────────────────

function colorizeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  const formatted = date.toISOString().split('T')[0] ?? dateStr

  if (diffDays < 1) {
    return chalk.green(formatted)
  }
  if (diffDays < 7) {
    return chalk.yellow(formatted)
  }
  return chalk.dim(formatted)
}

// ─── Table formatting ───────────────────────────────────

/**
 * Format recent changes as a colorized table.
 *
 * @example
 * formatRecentTable(result, false)
 */
export function formatRecentTable(result: RecentResult, verbose: boolean): string {
  const { files, since, branch, totalScanned } = result
  const lines: string[] = [
    chalk.bold('\n📋 Recently Changed Files'),
    chalk.dim(`Branch: ${branch || 'unknown'}`),
    chalk.dim(`Since: ${since}`),
    chalk.dim(`Files scanned: ${totalScanned}`),
  ]

  if (files.length === 0) {
    lines.push('')
    lines.push(chalk.dim('No recently changed files found.'))
    return lines.join('\n')
  }

  lines.push('')
  lines.push(chalk.dim('Recent changes:'))

  for (const file of files) {
    const dateCol = colorizeDate(file.modifiedDate)
    const fileCol = chalk.cyan(file.relativePath)
    const authorCol = file.author ? chalk.white(file.author.padEnd(16, ' ').slice(0, 16)) : chalk.dim('unknown'.padEnd(16, ' ').slice(0, 16))
    const changesCol = `${chalk.green(`+${file.linesAdded}`)} ${chalk.red(`-${file.linesDeleted}`)}`

    let row = `  ${dateCol}  ${fileCol}  ${authorCol}  ${changesCol}`
    if (verbose && file.summary) {
      row += `  ${chalk.dim(file.summary)}`
    }
    lines.push(row)
  }

  return lines.join('\n')
}

// ─── CSV formatting ─────────────────────────────────────

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/**
 * Format recent changes as CSV.
 *
 * @example
 * formatRecentCsv(result, false)
 */
export function formatRecentCsv(result: RecentResult, verbose: boolean): string {
  const headers = ['Date', 'File', 'Author', 'LinesAdded', 'LinesDeleted']
  if (verbose) {
    headers.push('Summary')
  }

  const rows = result.files.map((file) => {
    const cols = [
      new Date(file.modifiedDate).toISOString().split('T')[0] ?? '',
      escapeCsv(file.relativePath),
      escapeCsv(file.author),
      String(file.linesAdded),
      String(file.linesDeleted),
    ]
    if (verbose) {
      cols.push(escapeCsv(file.summary))
    }
    return cols.join(',')
  })

  return [headers.join(','), ...rows].join('\n')
}

// ─── JSON formatting ────────────────────────────────────

/**
 * Format recent changes as pretty-printed JSON.
 *
 * @example
 * formatRecentJson(result)
 */
export function formatRecentJson(result: RecentResult): string {
  const serializable = {
    branch: result.branch,
    files: result.files.map((f) => ({
      author: f.author,
      commit: f.commit,
      filePath: f.filePath,
      linesAdded: f.linesAdded,
      linesDeleted: f.linesDeleted,
      modifiedDate: f.modifiedDate,
      relativePath: f.relativePath,
      summary: f.summary,
    })),
    since: result.since,
    totalScanned: result.totalScanned,
  }
  return JSON.stringify(serializable, null, 2)
}
