import chalk from 'chalk'

import type { ValidationResult } from './validate-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Utility ──────────────────────────────────────────────

// ─── Severity formatting ──────────────────────────────────

/**
 * Format a severity label with color.
 *
 * @example
 * ```ts
 * formatSeverity('error') // red "ERROR"
 * formatSeverity('warning') // yellow "WARN"
 * ```
 */
export function formatSeverity(severity: string): string {
  if (severity === 'error') return chalk.red('ERROR')
  return chalk.yellow('WARN')
}

// ─── Table formatting ─────────────────────────────────────

/**
 * Format a ValidationResult as a colored table report.
 *
 * @example
 * ```ts
 * const output = formatValidationTable(result, false)
 * console.log(output)
 * ```
 */
export function formatValidationTable(result: ValidationResult, verbose: boolean): string {
  const lines: string[] = [chalk.bold('\n✅ Validation Report'), '']

  // ─── Summary
  const { stats } = result
  lines.push(
    `Total: ${stats.total} | ${chalk.red(`${stats.errors} errors`)} | ${chalk.yellow(`${stats.warnings} warnings`)}`,
  )
  lines.push('')

  // ─── Rule breakdown
  if (Object.keys(stats.byRule).length > 0) {
    lines.push(chalk.bold('By Rule:'))
    const ruleEntries = Object.entries(stats.byRule).sort((a, b) => b[1] - a[1])
    for (const [rule, count] of ruleEntries) {
      const v = result.violations.find((vi) => vi.rule === rule)
      const sev = v ? formatSeverity(v.severity) : ''
      lines.push(`  ${sev} ${padRight(rule, 25)} ${count}`)
    }
    lines.push('')
  }

  // ─── Violations table
  if (result.violations.length > 0) {
    lines.push(chalk.bold('Violations:'))
    lines.push('')

    const colFile = Math.max(20, ...result.violations.map((v) => v.file.length))
    const colLine = 6
    const colSev = 8
    const colRule = 25
    const colMsg = 40

    lines.push(
      chalk.cyan(padRight('File', colFile)) +
        ' ' +
        chalk.cyan(padLeft('Line', colLine)) +
        ' ' +
        chalk.cyan(padLeft('Sev', colSev)) +
        ' ' +
        chalk.cyan(padRight('Rule', colRule)) +
        ' ' +
        chalk.cyan(padRight('Message', colMsg)),
    )
    lines.push(chalk.dim('─'.repeat(colFile + colLine + colSev + colRule + colMsg + 4)))

    const shown = verbose ? result.violations : result.violations.slice(0, 50)
    for (const v of shown) {
      lines.push(
        padRight(v.file, colFile) +
          ' ' +
          padLeft(String(v.line), colLine) +
          ' ' +
          padLeft(formatSeverity(v.severity), colSev) +
          ' ' +
          padRight(v.rule, colRule) +
          ' ' +
          padRight(v.message, colMsg),
      )
    }

    if (!verbose && result.violations.length > 50) {
      lines.push(chalk.dim(`  ... and ${result.violations.length - 50} more`))
    }
    lines.push('')
  }

  // ─── Verbose: fix suggestions
  if (verbose) {
    const withFixes = result.violations.filter((v) => v.fix !== null)
    if (withFixes.length > 0) {
      lines.push(chalk.bold('Fix Suggestions:'))
      lines.push('')
      for (const v of withFixes.slice(0, 20)) {
        lines.push(`  ${chalk.cyan(v.file)}:${v.line} ${chalk.dim(`[${v.rule}]`)} → ${v.fix}`)
      }
      lines.push('')
    }
  }

  return lines.join('\n')
}

// ─── JSON formatting ──────────────────────────────────────

/**
 * Format a ValidationResult as JSON.
 *
 * @example
 * ```ts
 * const json = formatValidationJson(result)
 * console.log(json)
 * ```
 */
export function formatValidationJson(result: ValidationResult): string {
  return JSON.stringify(result, null, 2)
}
