import chalk from 'chalk'

import type { TopResult } from './top-helpers.js'

// ─── Table formatting ───────────────────────────────────

function padRight(str: string, len: number): string {
  if (str.length >= len) return str
  return str + ' '.repeat(len - str.length)
}

function padLeft(str: string, len: number): string {
  if (str.length >= len) return str
  return ' '.repeat(len - str.length) + str
}

function rankColor(rank: number): (str: string) => string {
  if (rank === 1) return chalk.hex('#FFD700')
  if (rank === 2) return chalk.hex('#C0C0C0')
  if (rank === 3) return chalk.hex('#CD7F32')
  return (s: string) => s
}

function metricValue(result: TopResult, rank: number): number {
  const file = result.files[rank - 1]
  if (!file) return 0
  switch (result.metric) {
    case 'size':
      return file.size
    case 'lines':
      return file.lines
    case 'complexity':
      return file.complexity
    case 'todos':
      return file.todos
    default:
      return file.size
  }
}

/**
 * Format a TopResult as a colorized table.
 *
 * @example
 * ```ts
 * const table = formatTopTable(result)
 * console.log(table)
 * ```
 */
export function formatTopTable(result: TopResult): string {
  const { files, metric, totalCount, totalAnalyzed } = result
  const lines: string[] = [chalk.bold(`\n🏆 Top ${files.length} of ${totalCount} files by ${metric}`), '']

  if (files.length === 0) {
    lines.push(chalk.dim('No files found.'))
    return lines.join('\n')
  }

  const colWidths = {
    file: Math.max(20, ...files.map((f) => f.relativePath.length)),
    lines: Math.max(7, ...files.map((f) => String(f.lines).length)),
    metricValue: Math.max(8, ...files.map((_, i) => String(metricValue(result, i + 1)).length)),
    rank: Math.max(4, String(files.length).length),
    size: Math.max(8, ...files.map((f) => String(f.size).length)),
  }

  const header =
    chalk.cyan(padRight('Rank', colWidths.rank)) +
    '  ' +
    chalk.cyan(padRight('File', colWidths.file)) +
    '  ' +
    chalk.cyan(padLeft('Metric Value', colWidths.metricValue)) +
    '  ' +
    chalk.cyan(padLeft('Size', colWidths.size)) +
    '  ' +
    chalk.cyan(padLeft('Lines', colWidths.lines))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    const rank = i + 1
    const colorize = rankColor(rank)
    const value = metricValue(result, rank)

    const row =
      colorize(padLeft(String(rank), colWidths.rank)) +
      '  ' +
      chalk.dim(padRight(file.relativePath, colWidths.file)) +
      '  ' +
      chalk.bold(padLeft(String(value), colWidths.metricValue)) +
      '  ' +
      padLeft(String(file.size), colWidths.size) +
      '  ' +
      padLeft(String(file.lines), colWidths.lines)
    lines.push(row)
  }

  lines.push(chalk.dim('─'.repeat(header.length)))
  lines.push(chalk.dim(`Analyzed ${totalAnalyzed} files`))

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
 * Format a TopResult as CSV.
 *
 * @example
 * ```ts
 * const csv = formatTopCsv(result)
 * ```
 */
export function formatTopCsv(result: TopResult): string {
  const headers = ['Rank', 'File', 'Value', 'Size', 'Lines', 'Extension']
  const rows: string[] = [headers.join(',')]

  for (let i = 0; i < result.files.length; i++) {
    const file = result.files[i]!
    const rank = i + 1
    const value = metricValue(result, rank)
    rows.push(
      [
        String(rank),
        escapeCsv(file.relativePath),
        String(value),
        String(file.size),
        String(file.lines),
        escapeCsv(file.extension),
      ].join(','),
    )
  }

  return rows.join('\n')
}

// ─── JSON formatting ────────────────────────────────────

/**
 * Format a TopResult as pretty-printed JSON.
 *
 * @example
 * ```ts
 * const json = formatTopJson(result)
 * ```
 */
export function formatTopJson(result: TopResult): string {
  return JSON.stringify(result, null, 2)
}
