import chalk from 'chalk'

import type { DirOwnership, FileOwnership, OwnershipResult, OwnerInfo } from './ownership-helpers.js'

// ─── Utility ──────────────────────────────────────────────

function padRight(str: string, len: number): string {
  if (str.length >= len) return str
  return str + ' '.repeat(len - str.length)
}

function padLeft(str: string, len: number): string {
  if (str.length >= len) return str
  return ' '.repeat(len - str.length) + str
}

// ─── Percentage formatting ────────────────────────────────

/**
 * Format a percentage value with color based on concentration level.
 *
 * @example
 * ```ts
 * formatOwnershipPercent(95) // red (high concentration)
 * formatOwnershipPercent(30) // green (shared ownership)
 * ```
 */
export function formatOwnershipPercent(pct: number): string {
  if (pct >= 80) return chalk.red(`${pct}%`)
  if (pct >= 50) return chalk.yellow(`${pct}%`)
  return chalk.green(`${pct}%`)
}

// ─── Bus factor formatting ────────────────────────────────

/**
 * Format bus factor with risk-colored warning.
 *
 * @example
 * ```ts
 * formatBusFactor(1) // red "⚠ BUS FACTOR: 1"
 * formatBusFactor(5) // green "BUS FACTOR: 5"
 * ```
 */
export function formatBusFactor(factor: number): string {
  if (factor <= 1) return chalk.bold.red(`⚠ BUS FACTOR: ${factor} (CRITICAL)`)
  if (factor <= 2) return chalk.bold.yellow(`⚠ BUS FACTOR: ${factor} (LOW)`)
  return chalk.bold.green(`BUS FACTOR: ${factor}`)
}

// ─── Table formatting ─────────────────────────────────────

/**
 * Format a complete OwnershipResult as a table report.
 *
 * @example
 * ```ts
 * const output = formatOwnershipTable(result, false)
 * console.log(output)
 * ```
 */
export function formatOwnershipTable(result: OwnershipResult, verbose: boolean): string {
  const lines: string[] = [chalk.bold('\n👥 Code Ownership Report'), '']

  // ─── Bus factor
  lines.push(formatBusFactor(result.busFactor))
  lines.push('')

  // ─── Knowledge monopolies
  if (result.knowledgeMonopolies.length > 0) {
    lines.push(chalk.bold.red('Knowledge Monopolies (single owner >80%):'))
    for (const mono of result.knowledgeMonopolies) {
      lines.push(`  ${chalk.red('●')} ${mono}`)
    }
    lines.push('')
  }

  // ─── Owner summary table
  if (result.owners.length > 0) {
    lines.push(chalk.bold('Top Owners:'))
    lines.push('')

    const colName = Math.max(15, ...result.owners.map((o) => o.name.length))
    const colLines = 10
    const colFiles = 8
    const colPct = 8

    lines.push(
      chalk.cyan(padRight('Name', colName)) +
        '  ' +
        chalk.cyan(padLeft('Lines', colLines)) +
        '  ' +
        chalk.cyan(padLeft('Files', colFiles)) +
        '  ' +
        chalk.cyan(padLeft('Own %', colPct)),
    )
    lines.push(chalk.dim('─'.repeat(colName + colLines + colFiles + colPct + 6)))

    for (const owner of result.owners) {
      lines.push(
        padRight(owner.name, colName) +
          '  ' +
          padLeft(String(owner.linesOwned), colLines) +
          '  ' +
          padLeft(String(owner.filesOwned), colFiles) +
          '  ' +
          padLeft(formatOwnershipPercent(owner.percentage), colPct),
      )
    }
    lines.push('')
  }

  // ─── Directory ownership
  if (result.dirs.length > 0) {
    lines.push(chalk.bold('Directory Ownership:'))
    lines.push('')

    for (const dir of result.dirs) {
      const topOwners = dir.owners.slice(0, 3)
      const ownerStr = topOwners
        .map((o) => `${o.name} ${formatOwnershipPercent(o.percentage)}`)
        .join(', ')
      lines.push(`  ${chalk.cyan(dir.dir)} → ${ownerStr} (${dir.files} files, ${dir.lines} lines)`)
    }
    lines.push('')
  }

  // ─── Verbose: per-file ownership
  if (verbose && result.files.length > 0) {
    lines.push(chalk.bold('File Ownership:'))
    lines.push('')

    for (const file of result.files) {
      const ownerStr = file.owners
        .slice(0, 3)
        .map((o) => `${o.name} ${formatOwnershipPercent(o.percentage)}`)
        .join(', ')
      lines.push(`  ${chalk.cyan(file.file)} → ${ownerStr}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

// ─── JSON formatting ──────────────────────────────────────

/**
 * Format an OwnershipResult as JSON.
 *
 * @example
 * ```ts
 * const json = formatOwnershipJson(result)
 * console.log(json)
 * ```
 */
export function formatOwnershipJson(result: OwnershipResult): string {
  return JSON.stringify(result, null, 2)
}
