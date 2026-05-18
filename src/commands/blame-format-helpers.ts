import chalk from 'chalk'

import { formatNumber, formatPercentage } from '../utils/format-utils.js'
import type { BlameResult } from './blame-helpers.js'

// ─── Table formatting ───────────────────────────────────

export function formatBlameTable(
  result: BlameResult,
  verbose: boolean,
  showSummary: boolean,
): string {
  const { file, branch, totalLines, lines, authors } = result
  const lines_: string[] = [
    chalk.bold(`\n📋 Git Blame Report: ${file}`),
    chalk.dim(`Branch: ${branch || 'unknown'}`),
    chalk.dim(`Total lines: ${formatNumber(totalLines)}`),
  ]

  if (lines.length === 0) {
    lines_.push('')
    lines_.push(chalk.dim('No blame information available.'))
    return lines_.join('\n')
  }

  lines_.push('')
  lines_.push(chalk.dim('Blame lines:'))

  const commitWidth = verbose ? 40 : 8

  for (const blameLine of lines) {
    const commitDisplay = blameLine.commit.padEnd(commitWidth).slice(0, commitWidth)
    const lineNum = String(blameLine.line).padStart(4, ' ')
    let row = `  ${chalk.gray(lineNum)}  ${chalk.cyan(blameLine.author.padEnd(16, ' ').slice(0, 16))}  ${chalk.dim(blameLine.date)}  ${chalk.yellow(commitDisplay)}`
    if (showSummary) {
      row += `  ${chalk.dim(blameLine.summary)}`
    }
    lines_.push(row)
  }

  lines_.push('')
  lines_.push(chalk.bold('Author Summary:'))
  const sortedAuthors = Array.from(authors.entries()).sort((a, b) => b[1].lines - a[1].lines)
  for (const [author, stats] of sortedAuthors) {
    const bar = '█'.repeat(Math.max(1, Math.round(stats.percentage / 5)))
    lines_.push(
      `  ${chalk.cyan(author.padEnd(16, ' ').slice(0, 16))}  ${chalk.bold(formatNumber(stats.lines))} lines (${formatPercentage(stats.percentage)}) ${chalk.green(bar)}`,
    )
  }

  return lines_.join('\n')
}

// ─── CSV formatting ─────────────────────────────────────

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function formatBlameCsv(result: BlameResult, showSummary: boolean): string {
  const headers = ['Line', 'Author', 'Date', 'Commit']
  if (showSummary) {
    headers.push('Summary')
  }

  const rows = result.lines.map((line) => {
    const cols = [
      String(line.line),
      escapeCsv(line.author),
      line.date,
      line.commit,
    ]
    if (showSummary) {
      cols.push(escapeCsv(line.summary))
    }
    return cols.join(',')
  })

  return [headers.join(','), ...rows].join('\n')
}

// ─── JSON formatting ────────────────────────────────────

export function formatBlameJson(result: BlameResult): string {
  const authorList: Array<{ lines: number; name: string; percentage: number }> = []
  result.authors.forEach((stats, name) => {
    authorList.push({
      lines: stats.lines,
      name,
      percentage: Math.round(stats.percentage * 10) / 10,
    })
  })

  const serializable = {
    authors: authorList,
    branch: result.branch,
    file: result.file,
    lines: result.lines,
    totalLines: result.totalLines,
  }
  return JSON.stringify(serializable, null, 2)
}
