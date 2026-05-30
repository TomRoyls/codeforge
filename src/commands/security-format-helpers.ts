import chalk from 'chalk'

import type { Category, SecurityResult, Severity } from './security-helpers.js'

import { padRight } from '../utils/format-utils.js'

// ─── Helpers ─────────────────────────────────────────────

// ─── Severity formatting ────────────────────────────────

const SEVERITY_ICONS: Record<Severity, string> = {
  critical: '\u{1F534}',
  high: '\u{1F7E0}',
  low: '\u{1F535}',
  medium: '\u{1F7E1}',
}

const SEVERITY_COLORS: Record<Severity, (text: string) => string> = {
  critical: chalk.red.bold,
  high: chalk.red,
  low: chalk.blue,
  medium: chalk.yellow,
}

/**
 * Format a severity level with colored icon and label.
 *
 * @example
 * console.log(formatSeverity('critical')) // 🔴 CRITICAL (in red)
 */
export function formatSeverity(severity: Severity): string {
  const icon = SEVERITY_ICONS[severity]
  const label = severity.toUpperCase()
  return SEVERITY_COLORS[severity](`${icon} ${label}`)
}

// ─── Category formatting ────────────────────────────────

const CATEGORY_COLORS: Record<string, (text: string) => string> = {
  config: chalk.gray,
  crypto: chalk.magenta,
  dos: chalk.red,
  injection: chalk.red,
  secrets: chalk.yellow,
  xss: chalk.cyan,
}

/**
 * Format a category with a colored label.
 *
 * @example
 * console.log(formatCategory('secrets')) // colored "secrets" label
 */
export function formatCategory(category: Category): string {
  const colorFn = CATEGORY_COLORS[category] ?? chalk.white
  return colorFn(category)
}

// ─── Table formatting ───────────────────────────────────

/**
 * Format security results as a human-readable table.
 *
 * @example
 * const output = formatSecurityTable(result, true)
 */
export function formatSecurityTable(result: SecurityResult, verbose: boolean): string {
  const { findings, stats } = result
  const lines: string[] = [chalk.bold('\n🔒 Security Scan Report'), '']

  lines.push(chalk.bold('Severity Summary:'))
  lines.push(`  ${formatSeverity('critical')}: ${stats.critical}`)
  lines.push(`  ${formatSeverity('high')}: ${stats.high}`)
  lines.push(`  ${formatSeverity('medium')}: ${stats.medium}`)
  lines.push(`  ${formatSeverity('low')}: ${stats.low}`)
  lines.push(`  ${chalk.bold('Total')}: ${stats.total}`)
  lines.push('')

  if (findings.length === 0) {
    lines.push(chalk.green('No security issues found!'))
    return lines.join('\n')
  }

  const colWidths = {
    category: Math.max(10, ...findings.map((f) => f.category.length)),
    file: Math.max(20, ...findings.map((f) => `${f.file}:${f.line}`.length)),
    rule: Math.max(7, ...findings.map((f) => f.rule.length)),
    severity: 10,
    title: Math.max(10, ...findings.map((f) => f.title.length)),
  }

  const header =
    chalk.cyan(padRight('Severity', colWidths.severity)) +
    '  ' +
    chalk.cyan(padRight('Rule', colWidths.rule)) +
    '  ' +
    chalk.cyan(padRight('File:Line', colWidths.file)) +
    '  ' +
    chalk.cyan(padRight('Category', colWidths.category)) +
    '  ' +
    chalk.cyan(padRight('Title', colWidths.title))

  lines.push(header)
  lines.push(chalk.dim('\u2500'.repeat(header.length)))

  for (const finding of findings) {
    const severityLabel = `${SEVERITY_ICONS[finding.severity]} ${finding.severity.toUpperCase()}`
    const fileRef = `${finding.file}:${finding.line}`

    const row =
      SEVERITY_COLORS[finding.severity](padRight(severityLabel, colWidths.severity)) +
      '  ' +
      padRight(finding.rule, colWidths.rule) +
      '  ' +
      padRight(fileRef, colWidths.file) +
      '  ' +
      formatCategory(finding.category).padEnd(colWidths.category) +
      '  ' +
      padRight(finding.title, colWidths.title)
    lines.push(row)

    if (verbose) {
      lines.push(chalk.dim(`    Match: ${finding.match}`))
      lines.push(chalk.dim(`    Remediation: ${finding.remediation}`))
      if (finding.context) {
        lines.push(chalk.dim('    Context:'))
        for (const ctxLine of finding.context.split('\n')) {
          lines.push(chalk.dim(`      ${ctxLine}`))
        }
      }
      lines.push('')
    }
  }

  lines.push(chalk.dim('\u2500'.repeat(header.length)))
  lines.push('')

  lines.push(chalk.bold('By Category:'))
  const categories = Object.entries(stats.byCategory).sort(([, a], [, b]) => (b as number) - (a as number))
  for (const [cat, count] of categories) {
    lines.push(`  ${formatCategory(cat as Category)}: ${count}`)
  }

  return lines.join('\n')
}

// ─── JSON formatting ────────────────────────────────────

/**
 * Format security results as JSON.
 *
 * @example
 * const json = formatSecurityJson(result)
 */
export function formatSecurityJson(result: SecurityResult): string {
  return JSON.stringify(result, null, 2)
}
