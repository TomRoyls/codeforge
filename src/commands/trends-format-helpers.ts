import chalk from 'chalk'

import type { FileChurn, PeriodData, TrendsResult } from './trends-helpers.js'

// ─── Sparkline ──────────────────────────────────────────

const SPARKLINE_CHARS = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█']

/**
 * Convert an array of numbers to a Unicode sparkline string.
 * @example
 * formatSparkline([1, 2, 3, 4, 5], 5) // '▁▂▃▄▅'
 */
export function formatSparkline(values: number[], max?: number): string {
  if (values.length === 0) return ''

  const maxVal = max ?? Math.max(...values, 1)

  return values
    .map((v) => {
      if (maxVal === 0) return SPARKLINE_CHARS[0]
      const normalized = v / maxVal
      const index = Math.min(Math.floor(normalized * SPARKLINE_CHARS.length), SPARKLINE_CHARS.length - 1)
      return SPARKLINE_CHARS[Math.max(0, index)]
    })
    .join('')
}

// ─── Growth rate formatting ──────────────────────────────

/**
 * Format a growth rate with a colorized arrow indicator.
 * @example
 * formatGrowthRate(15.5)  // green with ↑
 * formatGrowthRate(-10)   // red with ↓
 * formatGrowthRate(0)     // yellow with →
 */
export function formatGrowthRate(rate: number): string {
  if (rate > 0) {
    return chalk.green(`↑ +${rate.toFixed(1)}%`)
  }
  if (rate < 0) {
    return chalk.red(`↓ ${rate.toFixed(1)}%`)
  }
  return chalk.yellow('→ 0.0%')
}

// ─── Padding helpers ────────────────────────────────────

function padRight(str: string, len: number): string {
  if (str.length >= len) return str
  return str + ' '.repeat(len - str.length)
}

function padLeft(str: string, len: number): string {
  if (str.length >= len) return str
  return ' '.repeat(len - str.length) + str
}

// ─── Table formatting ───────────────────────────────────

export function formatTrendsTable(result: TrendsResult, verbose: boolean): string {
  const { periods, fileChurn, summary } = result
  const lines: string[] = [chalk.bold('\n📈 Code Trends Report'), '']

  if (periods.length === 0) {
    lines.push(chalk.dim('No git history found for the specified range.'))
    return lines.join('\n')
  }

  const colWidths = {
    commits: Math.max(8, ...periods.map((p) => String(p.commits).length)),
    contributors: Math.max(12, ...periods.map((p) => String(p.contributors).length)),
    files: Math.max(7, ...periods.map((p) => String(p.filesChanged).length)),
    net: Math.max(8, ...periods.map((p) => String(p.netLines).length)),
    period: Math.max(12, ...periods.map((p) => p.period.length)),
    plus: Math.max(8, ...periods.map((p) => String(p.linesAdded).length)),
    minus: Math.max(8, ...periods.map((p) => String(p.linesDeleted).length)),
  }

  const header =
    chalk.cyan(padRight('Period', colWidths.period)) +
    '  ' +
    chalk.cyan(padLeft('Commits', colWidths.commits)) +
    '  ' +
    chalk.cyan(padLeft('Lines +', colWidths.plus)) +
    '  ' +
    chalk.cyan(padLeft('Lines -', colWidths.minus)) +
    '  ' +
    chalk.cyan(padLeft('Net', colWidths.net)) +
    '  ' +
    chalk.cyan(padLeft('Files', colWidths.files)) +
    '  ' +
    chalk.cyan(padLeft('Contributors', colWidths.contributors))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const p of periods) {
    const netStr = p.netLines >= 0 ? chalk.green(`+${p.netLines}`) : chalk.red(String(p.netLines))
    const row =
      padRight(p.period, colWidths.period) +
      '  ' +
      padLeft(String(p.commits), colWidths.commits) +
      '  ' +
      padLeft(String(p.linesAdded), colWidths.plus) +
      '  ' +
      padLeft(String(p.linesDeleted), colWidths.minus) +
      '  ' +
      padLeft(netStr, colWidths.net + (p.netLines >= 0 ? 0 : 0)) +
      '  ' +
      padLeft(String(p.filesChanged), colWidths.files) +
      '  ' +
      padLeft(String(p.contributors), colWidths.contributors)
    lines.push(row)
  }

  lines.push(chalk.dim('─'.repeat(header.length)))

  const maxCommits = Math.max(...periods.map((p) => p.commits), 1)
  const sparkline = formatSparkline(periods.map((p) => p.commits), maxCommits)
  lines.push('')
  lines.push(chalk.bold('Activity Sparkline: ') + sparkline)
  lines.push(chalk.dim(`  ${periods[0]?.period} → ${periods[periods.length - 1]?.period}`))

  if (verbose || fileChurn.length > 0) {
    lines.push('')
    lines.push(chalk.bold('Top Churn Files:'))
    lines.push('')

    const churnColWidths = {
      added: Math.max(8, ...fileChurn.map((f) => String(f.linesAdded).length)),
      changes: Math.max(9, ...fileChurn.map((f) => String(f.totalChanges).length)),
      churn: Math.max(12, ...fileChurn.map((f) => String(f.churnScore).length)),
      deleted: Math.max(9, ...fileChurn.map((f) => String(f.linesDeleted).length)),
      file: Math.max(20, ...fileChurn.map((f) => f.filePath.length)),
    }

    const churnHeader =
      chalk.cyan(padRight('File', churnColWidths.file)) +
      '  ' +
      chalk.cyan(padLeft('Changes', churnColWidths.changes)) +
      '  ' +
      chalk.cyan(padLeft('Added', churnColWidths.added)) +
      '  ' +
      chalk.cyan(padLeft('Deleted', churnColWidths.deleted)) +
      '  ' +
      chalk.cyan(padLeft('Churn Score', churnColWidths.churn))

    lines.push(churnHeader)
    lines.push(chalk.dim('─'.repeat(churnHeader.length)))

    for (const f of fileChurn) {
      const row =
        padRight(f.filePath, churnColWidths.file) +
        '  ' +
        padLeft(String(f.totalChanges), churnColWidths.changes) +
        '  ' +
        padLeft(String(f.linesAdded), churnColWidths.added) +
        '  ' +
        padLeft(String(f.linesDeleted), churnColWidths.deleted) +
        '  ' +
        padLeft(String(f.churnScore), churnColWidths.churn)
      lines.push(row)
    }
  }

  lines.push('')
  lines.push(chalk.bold('Summary:'))
  lines.push(`  Total Periods: ${summary.totalPeriods}`)
  lines.push(`  Total Commits: ${summary.totalCommits}`)
  lines.push(`  Total Lines Added: ${chalk.green(String(summary.totalLinesAdded))}`)
  lines.push(`  Total Lines Deleted: ${chalk.red(String(summary.totalLinesDeleted))}`)
  lines.push(`  Avg Commits/Period: ${summary.averageCommitsPerPeriod}`)
  lines.push(`  Avg Lines/Period: ${summary.averageLinesPerPeriod}`)

  if (summary.peakPeriod) {
    lines.push(`  Peak Period: ${summary.peakPeriod.period} (${summary.peakPeriod.commits} commits)`)
  }

  lines.push(`  Growth Rate: ${formatGrowthRate(summary.growthRate)}`)

  return lines.join('\n')
}

// ─── CSV formatting ─────────────────────────────────────

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function formatTrendsCsv(result: TrendsResult): string {
  const rows: string[] = []

  rows.push('# Period Data')
  rows.push('Period,Commits,Lines Added,Lines Deleted,Net Lines,Files Changed,Contributors')

  for (const p of result.periods) {
    rows.push(
      [
        escapeCsv(p.period),
        String(p.commits),
        String(p.linesAdded),
        String(p.linesDeleted),
        String(p.netLines),
        String(p.filesChanged),
        String(p.contributors),
      ].join(','),
    )
  }

  rows.push('')
  rows.push('# File Churn')
  rows.push('File,Changes,Added,Deleted,Churn Score,Periods Active')

  for (const f of result.fileChurn) {
    rows.push(
      [
        escapeCsv(f.filePath),
        String(f.totalChanges),
        String(f.linesAdded),
        String(f.linesDeleted),
        String(f.churnScore),
        String(f.periodsActive),
      ].join(','),
    )
  }

  return rows.join('\n')
}

// ─── JSON formatting ────────────────────────────────────

export function formatTrendsJson(result: TrendsResult): string {
  return JSON.stringify(result, null, 2)
}
