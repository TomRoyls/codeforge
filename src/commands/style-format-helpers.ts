import chalk from 'chalk'

import type { FileStyle, StyleConsistency, StyleResult } from './style-helpers.js'

// ─── Helper utilities ───────────────────────────────────

function consistencyBar(score: number): string {
  const filled = Math.round(score / 5)
  const empty = 20 - filled
  const bar = chalk.green('█'.repeat(filled)) + chalk.dim('░'.repeat(empty))
  return `${bar} ${chalk.bold(score)}%`
}

function styleLabel(value: string): string {
  if (value === 'unknown') return chalk.dim(value)
  if (value === 'mixed') return chalk.yellow(value)
  return chalk.cyan(value)
}

// ─── Table formatting ───────────────────────────────────

/**
 * Format style result as a colorized table.
 *
 * @example
 * ```ts
 * formatStyleTable(result, false)
 * formatStyleTable(result, true)
 * ```
 */
export function formatStyleTable(result: StyleResult, verbose: boolean): string {
  const lines: string[] = [chalk.bold('\n🎨 Code Style Analysis'), '']

  lines.push(chalk.bold('Dominant Style:'))
  lines.push(`  📏 Indentation:     ${styleLabel(result.dominant.indentation)}`)
  lines.push(`  💬 Quotes:          ${styleLabel(result.dominant.quotes)}`)
  lines.push(`  ;  Semicolons:      ${styleLabel(result.dominant.semicolons)}`)
  lines.push(`  📌 Trailing commas: ${styleLabel(result.dominant.trailingCommas)}`)
  lines.push(`  {} Braces:          ${styleLabel(result.dominant.braceStyle)}`)

  lines.push('')
  lines.push(chalk.bold('Consistency Scores:'))
  lines.push(formatConsistencySection(result.consistency))

  lines.push('')
  lines.push(chalk.bold('Line Length:'))
  lines.push(`  Total lines:              ${result.totalLines}`)
  lines.push(`  Avg line length:          ${result.avgLineLength}`)
  lines.push(`  Lines > 120 chars:        ${result.lineLengthViolations}`)
  lines.push(`  Violation percentage:     ${result.lineLengthViolationPercentage}%`)

  lines.push('')
  lines.push(`Files analyzed: ${chalk.bold(result.totalFiles)}`)

  if (verbose && result.files.length > 0) {
    lines.push('')
    lines.push(chalk.bold('Per-File Breakdown:'))
    lines.push('')

    for (const file of result.files) {
      lines.push(`  ${chalk.cyan(file.filePath)}`)
      lines.push(`    Indentation: ${styleLabel(file.style.indentation)}  Quotes: ${styleLabel(file.style.quotes)}  Semicolons: ${styleLabel(file.style.semicolons)}`)
      lines.push(`    Trailing commas: ${styleLabel(file.style.trailingCommas)}  Braces: ${styleLabel(file.style.braceStyle)}`)
      lines.push(`    Lines: ${file.linesAnalyzed}  Max: ${file.maxLineLength}  Avg: ${file.avgLineLength.toFixed(1)}  Long: ${file.longLines}  Consistency: ${file.consistency}%`)
    }
  }

  return lines.join('\n')
}

function formatConsistencySection(consistency: StyleConsistency): string {
  const lines: string[] = []
  lines.push(`  Indentation:     ${consistencyBar(consistency.indentation)}`)
  lines.push(`  Quotes:          ${consistencyBar(consistency.quotes)}`)
  lines.push(`  Semicolons:      ${consistencyBar(consistency.semicolons)}`)
  lines.push(`  Trailing commas: ${consistencyBar(consistency.trailingCommas)}`)
  lines.push(`  Braces:          ${consistencyBar(consistency.braceStyle)}`)
  lines.push(`  Line length:     ${consistencyBar(consistency.lineLength)}`)
  lines.push('')
  lines.push(`  Overall:         ${consistencyBar(consistency.overall)}`)
  return lines.join('\n')
}

// ─── JSON formatting ────────────────────────────────────

/**
 * Format style result as JSON.
 *
 * @example
 * ```ts
 * formatStyleJson(result)
 * ```
 */
export function formatStyleJson(result: StyleResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Verbose file table ─────────────────────────────────

/**
 * Format a single file's style for verbose output.
 *
 * @example
 * ```ts
 * formatFileStyle(file)
 * ```
 */
export function formatFileStyle(file: FileStyle): string {
  const parts = [
    `${chalk.cyan(file.filePath)}`,
    `indent=${file.style.indentation}`,
    `quotes=${file.style.quotes}`,
    `semi=${file.style.semicolons}`,
    `consistency=${file.consistency}%`,
  ]
  return parts.join(' ')
}
