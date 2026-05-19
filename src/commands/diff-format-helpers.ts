import chalk from 'chalk'

import type { DiffResult, FileDiff } from './diff-helpers.js'

// ─── Utility ────────────────────────────────────────────

function padRight(str: string, len: number): string {
  if (str.length >= len) return str
  return str + ' '.repeat(len - str.length)
}

function padLeft(str: string, len: number): string {
  if (str.length >= len) return str
  return ' '.repeat(len - str.length) + str
}

// ─── Status and risk formatting ─────────────────────────

const STATUS_ICONS: Record<string, string> = {
  added: chalk.green('A'),
  deleted: chalk.red('D'),
  modified: chalk.yellow('M'),
  renamed: chalk.blue('R'),
}

function formatStatusIcon(status: string): string {
  return STATUS_ICONS[status] ?? chalk.gray('?')
}

function formatRiskBadge(level: string): string {
  switch (level) {
    case 'high': return chalk.red('high')
    case 'medium': return chalk.yellow('medium')
    case 'low': return chalk.green('low')
    default: return chalk.gray(level)
  }
}

// ─── Table formatting ───────────────────────────────────

/**
 * Format a DiffResult as a colorized table for terminal output.
 *
 * @example
 * ```ts
 * const output = formatDiffTable(result, false, false)
 * console.log(output)
 * ```
 */
export function formatDiffTable(
  result: DiffResult,
  stat: boolean = false,
  verbose: boolean = false,
): string {
  const { files, summary } = result
  const lines: string[] = [chalk.bold('\n📊 Diff Analysis Report'), '']

  lines.push(chalk.gray(`Comparing: ${result.baseCommit} → ${result.headCommit}`))
  lines.push('')

  lines.push(chalk.bold('Summary:'))
  lines.push(`  Files changed:    ${summary.totalFiles}`)
  lines.push(`  Additions:        ${chalk.green(`+${summary.totalAdditions}`)}`)
  lines.push(`  Deletions:        ${chalk.red(`-${summary.totalDeletions}`)}`)
  lines.push(`  Net lines:        ${summary.netLines >= 0 ? chalk.green(`+${summary.netLines}`) : chalk.red(String(summary.netLines))}`)

  if (stat) {
    lines.push('')
    if (summary.byStatus.length > 0) {
      lines.push(chalk.gray('By status:'))
      for (const { status, count } of summary.byStatus) {
        lines.push(`  ${formatStatusIcon(status)} ${status}: ${count}`)
      }
    }

    if (summary.byExtension.length > 0) {
      lines.push('')
      lines.push(chalk.gray('By extension:'))
      for (const ext of summary.byExtension) {
        lines.push(`  ${ext.ext}: ${ext.files} files, +${ext.additions}/-${ext.deletions}`)
      }
    }

    return lines.join('\n')
  }

  lines.push('')

  if (files.length > 0) {
    const colFile = Math.max(20, ...files.map((f) => f.filePath.length))
    const colChange = 14

    const header =
      chalk.cyan(padRight('File', colFile)) +
      '  ' +
      chalk.cyan(padLeft('Status', 6)) +
      '  ' +
      chalk.cyan(padLeft('+/-', colChange)) +
      '  ' +
      chalk.cyan(padLeft('Risk', 6))

    lines.push(header)
    lines.push(chalk.dim('─'.repeat(header.length)))

    for (const file of files) {
      const changeStr = `${chalk.green(`+${file.additions}`)}/${chalk.red(`-${file.deletions}`)}`
      const row =
        padRight(file.filePath, colFile) +
        '  ' +
        padLeft(formatStatusIcon(file.status), 6) +
        '  ' +
        padLeft(changeStr, colChange) +
        '  ' +
        padLeft(formatRiskBadge(file.riskLevel), 6)
      lines.push(row)

      if (verbose && file.lines.length > 0) {
        for (const line of file.lines) {
          if (line.type === 'added') {
            lines.push(`    ${chalk.green('+')} ${line.content}`)
          } else if (line.type === 'removed') {
            lines.push(`    ${chalk.red('-')} ${line.content}`)
          }
        }
        lines.push('')
      }

      if (file.riskReasons.length > 0 && !verbose) {
        lines.push(chalk.gray(`      ↳ ${file.riskReasons.join(', ')}`))
      }
    }

    lines.push(chalk.dim('─'.repeat(header.length)))
  }

  if (summary.highRiskFiles.length > 0) {
    lines.push('')
    lines.push(chalk.red.bold('⚠ High Risk Files:'))
    for (const f of summary.highRiskFiles) {
      lines.push(`  ${chalk.red('●')} ${f.filePath} — ${f.riskReasons.join(', ')}`)
    }
  }

  return lines.join('\n')
}

// ─── JSON formatting ────────────────────────────────────

/**
 * Format a DiffResult as JSON.
 *
 * @example
 * ```ts
 * const json = formatDiffJson(result)
 * console.log(json)
 * ```
 */
export function formatDiffJson(result: DiffResult): string {
  return JSON.stringify(result, null, 2)
}
