import chalk from 'chalk'

import type { HealthCheckResult } from './check-helpers.js'

// ─── Status icons ────────────────────────────────────────

/**
 * Get the icon for a check status.
 *
 * @example
 * ```ts
 * getStatusIcon('pass') // '✓'
 * getStatusIcon('warn') // '⚠'
 * getStatusIcon('fail') // '✗'
 * ```
 */
export function getStatusIcon(status: 'fail' | 'pass' | 'warn'): string {
  switch (status) {
    case 'pass':
      return '✓'
    case 'warn':
      return '⚠'
    case 'fail':
      return '✗'
  }
}

// ─── Score bar ───────────────────────────────────────────

/**
 * Render an inline score bar.
 *
 * @example
 * ```ts
 * formatScoreBar(80) // '[████████░░] 80/100'
 * ```
 */
export function formatScoreBar(score: number): string {
  const filled = Math.round((score / 100) * 10)
  const empty = 10 - filled
  const bar = '█'.repeat(filled) + '░'.repeat(empty)
  return `[${bar}] ${score}/100`
}

// ─── Table formatting ────────────────────────────────────

function colorizeStatus(status: 'fail' | 'pass' | 'warn', text: string): string {
  switch (status) {
    case 'pass':
      return chalk.green(text)
    case 'warn':
      return chalk.yellow(text)
    case 'fail':
      return chalk.red(text)
  }
}

/**
 * Format a health check result as a colorized table.
 *
 * @example
 * ```ts
 * const output = formatCheckTable(result, false)
 * console.log(output)
 * ```
 */
export function formatCheckTable(result: HealthCheckResult, verbose: boolean): string {
  const lines: string[] = [chalk.bold('\n🏥 Codebase Health Check'), '']

  // Overall score
  const overallIcon = getStatusIcon(result.overallStatus)
  const coloredBar = colorizeStatus(result.overallStatus, formatScoreBar(result.overallScore))
  lines.push(`  ${colorizeStatus(result.overallStatus, overallIcon)} Overall: ${coloredBar}`)
  lines.push(`    ${chalk.dim(result.summary)}`)
  lines.push('')

  // Each check
  for (const check of result.checks) {
    const icon = getStatusIcon(check.status)
    const coloredIcon = colorizeStatus(check.status, icon)
    const scoreStr = colorizeStatus(check.status, `${check.score}/100`)
    lines.push(`  ${coloredIcon} ${chalk.bold(check.name)}: ${scoreStr}`)
    lines.push(`    ${chalk.dim(check.message)}`)

    if (verbose && check.details.length > 0) {
      for (const detail of check.details) {
        lines.push(`      ${chalk.dim('•')} ${chalk.dim(detail)}`)
      }
    }
  }

  lines.push('')
  lines.push(
    `  ${chalk.green(`✓ ${result.passedChecks} passed`)} · ${chalk.yellow(`⚠ ${result.warnChecks} warnings`)} · ${chalk.red(`✗ ${result.failedChecks} failed`)}`,
  )

  return lines.join('\n')
}

// ─── JSON formatting ─────────────────────────────────────

/**
 * Format a health check result as JSON.
 *
 * @example
 * ```ts
 * const json = formatCheckJson(result)
 * console.log(json)
 * ```
 */
export function formatCheckJson(result: HealthCheckResult): string {
  return JSON.stringify(result, null, 2)
}
