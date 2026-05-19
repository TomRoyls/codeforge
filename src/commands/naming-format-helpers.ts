import chalk from 'chalk'

import type { NamingResult } from './naming-helpers.js'

// ─── Table formatting ───────────────────────────────────

function padRight(str: string, len: number): string {
  if (str.length >= len) return str
  return str + ' '.repeat(len - str.length)
}

function padLeft(str: string, len: number): string {
  if (str.length >= len) return str
  return ' '.repeat(len - str.length) + str
}

function formatConsistencyBar(percentage: number): string {
  const filled = Math.round(percentage / 5)
  const empty = 20 - filled
  const bar = '█'.repeat(filled) + '░'.repeat(empty)
  const color = percentage >= 80 ? chalk.green : percentage >= 50 ? chalk.yellow : chalk.red
  return color(bar)
}

/**
 * Format naming results as a colorized table.
 *
 * @example
 * formatNamingTable(result, false) // returns string with colored output
 * formatNamingTable(result, true)  // includes detailed issue list
 */
export function formatNamingTable(result: NamingResult, verbose: boolean): string {
  const { consistency, dominantConvention, fileNaming, issues, stats, totalItems } = result
  const lines: string[] = [chalk.bold('\n📋 Naming Convention Report'), '']

  // ─── Consistency score ─────────────────────────────
  const consistencyColor = consistency >= 80 ? chalk.green : consistency >= 50 ? chalk.yellow : chalk.red
  lines.push(`Consistency: ${consistencyColor(`${consistency}%`)} ${formatConsistencyBar(consistency)}`)
  lines.push(`Dominant convention: ${chalk.cyan(dominantConvention)} (${totalItems} items analyzed)`)
  lines.push('')

  // ─── Convention distribution ───────────────────────
  if (stats.length > 0) {
    const colWidths = {
      convention: Math.max(18, ...stats.map((s) => s.convention.length)),
      count: Math.max(7, ...stats.map((s) => String(s.count).length)),
      percentage: 10,
      types: 40,
    }

    const header =
      chalk.cyan(padRight('Convention', colWidths.convention)) +
      '  ' +
      chalk.cyan(padLeft('Count', colWidths.count)) +
      '  ' +
      chalk.cyan(padLeft('Pct', colWidths.percentage)) +
      '  ' +
      chalk.cyan('Top Types')
    lines.push(header)
    lines.push(chalk.dim('─'.repeat(80)))

    for (const stat of stats) {
      const topTypes = stat.byType
        .slice(0, 3)
        .map((t) => `${t.type}(${t.count})`)
        .join(', ')
      const row =
        padRight(stat.convention, colWidths.convention) +
        '  ' +
        padLeft(String(stat.count), colWidths.count) +
        '  ' +
        padLeft(`${stat.percentage}%`, colWidths.percentage) +
        '  ' +
        chalk.dim(topTypes)
      lines.push(row)
    }

    lines.push('')
  }

  // ─── File naming ───────────────────────────────────
  if (fileNaming.length > 0) {
    lines.push(chalk.bold('File Naming:'))
    const conventionGroups = new Map<string, number>()
    for (const f of fileNaming) {
      const count = conventionGroups.get(f.convention) ?? 0
      conventionGroups.set(f.convention, count + 1)
    }
    for (const [convention, count] of conventionGroups) {
      lines.push(`  ${chalk.cyan(convention)}: ${count} files`)
    }
    lines.push('')
  }

  // ─── Issues ────────────────────────────────────────
  if (issues.length > 0 && (verbose || issues.length <= 10)) {
    lines.push(chalk.bold(`Issues (${issues.length}):`))
    lines.push('')

    const maxNameLen = Math.max(10, ...issues.map((i) => i.name.length))
    const maxFileLen = Math.max(10, ...issues.map((i) => i.filePath.length))

    for (const item of issues) {
      for (const issue of item.issues) {
        const severityIcon =
          issue.severity === 'error' ? chalk.red('✗') : issue.severity === 'warn' ? chalk.yellow('⚠') : chalk.blue('ℹ')
        const line =
          `${severityIcon} ${padRight(item.name, maxNameLen)}  ${chalk.dim(padRight(`${item.filePath}:${item.line}`, maxFileLen))}  ${issue.message}`
        lines.push(line)
      }
    }
    lines.push('')
  } else if (issues.length > 10 && !verbose) {
    lines.push(chalk.yellow(`${issues.length} naming issues found. Use --verbose to see details.`))
    lines.push('')
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
 * Format naming results as CSV.
 *
 * @example
 * formatNamingCsv(result) // "Convention,Count,Percentage,..."
 */
export function formatNamingCsv(result: NamingResult): string {
  const rows: string[] = []

  // Convention stats
  rows.push('Convention,Count,Percentage,Top Types')
  for (const stat of result.stats) {
    const topTypes = stat.byType
      .slice(0, 3)
      .map((t) => `${t.type}:${t.count}`)
      .join('; ')
    rows.push(
      [
        escapeCsv(stat.convention),
        String(stat.count),
        `${stat.percentage}%`,
        escapeCsv(topTypes),
      ].join(','),
    )
  }

  rows.push('')

  // Issues
  if (result.issues.length > 0) {
    rows.push('Name,File,Line,Issue Type,Severity,Message')
    for (const item of result.issues) {
      for (const issue of item.issues) {
        rows.push(
          [
            escapeCsv(item.name),
            escapeCsv(item.filePath),
            String(item.line),
            issue.type,
            issue.severity,
            escapeCsv(issue.message),
          ].join(','),
        )
      }
    }
  }

  return rows.join('\n')
}

// ─── JSON formatting ────────────────────────────────────

/**
 * Format naming results as JSON.
 *
 * @example
 * formatNamingJson(result) // '{"consistency": 85, "dominantConvention": "camelCase", ...}'
 */
export function formatNamingJson(result: NamingResult): string {
  return JSON.stringify(result, null, 2)
}
