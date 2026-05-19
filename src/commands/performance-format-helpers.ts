import chalk from 'chalk'

import type { PerfResult } from './performance-helpers.js'

// ─── Severity formatting ────────────────────────────────

/**
 * Returns a colored severity label.
 *
 * @example
 * ```ts
 * formatPerfSeverity('high')   // red "HIGH"
 * formatPerfSeverity('medium') // yellow "MED "
 * formatPerfSeverity('low')    // blue "LOW "
 * ```
 */
export function formatPerfSeverity(severity: 'high' | 'low' | 'medium'): string {
  switch (severity) {
    case 'high':
      return chalk.red('HIGH')
    case 'medium':
      return chalk.yellow('MED ')
    case 'low':
      return chalk.blue('LOW ')
  }
}

// ─── Category formatting ────────────────────────────────

/**
 * Returns a colored category label.
 *
 * @example
 * ```ts
 * formatPerfCategory('cpu') // cyan "cpu"
 * ```
 */
export function formatPerfCategory(category: string): string {
  const colorMap: Record<string, (s: string) => string> = {
    async: chalk.magenta,
    bundle: chalk.cyan,
    cpu: chalk.yellow,
    io: chalk.green,
    memory: chalk.red,
    network: chalk.blue,
  }
  const colorFn = colorMap[category] ?? chalk.white
  return colorFn(category.padEnd(8))
}

// ─── Table formatting ───────────────────────────────────

function padRight(str: string, len: number): string {
  if (str.length >= len) return str
  return str + ' '.repeat(len - str.length)
}

function padLeft(str: string, len: number): string {
  if (str.length >= len) return str
  return ' '.repeat(len - str.length) + str
}

/**
 * Formats a PerfResult as a human-readable table.
 *
 * @example
 * ```ts
 * const table = formatPerfTable(result, false)
 * ```
 */
export function formatPerfTable(result: PerfResult, verbose: boolean): string {
  const { findings, stats } = result
  const lines: string[] = [chalk.bold('\n⚡ Performance Anti-Pattern Report'), '']

  // ─── Severity summary ──────────────────────────────
  lines.push(chalk.bold('Summary:'))
  lines.push(`  Total findings: ${chalk.bold(String(stats.total))}`)
  lines.push(`  ${formatPerfSeverity('high')}: ${stats.high}  ${formatPerfSeverity('medium')}: ${stats.medium}  ${formatPerfSeverity('low')}: ${stats.low}`)
  lines.push('')

  if (findings.length === 0) {
    lines.push(chalk.green('No performance anti-patterns detected.'))
    return lines.join('\n')
  }

  // ─── Findings table ────────────────────────────────
  const colWidths = {
    category: 9,
    file: Math.max(20, ...findings.map((f) => `${f.file}:${f.line}`.length)),
    rule: 8,
    severity: 4,
    title: Math.max(10, ...findings.map((f) => f.title.length)),
  }

  const header =
    chalk.cyan(padRight('Sev', colWidths.severity)) +
    '  ' +
    chalk.cyan(padRight('Rule', colWidths.rule)) +
    '  ' +
    chalk.cyan(padRight('File:Line', colWidths.file)) +
    '  ' +
    chalk.cyan(padRight('Category', colWidths.category)) +
    '  ' +
    chalk.cyan(padLeft('Title', colWidths.title))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const f of findings) {
    const row =
      padRight(formatPerfSeverity(f.severity), colWidths.severity + 6) +
      '  ' +
      padRight(f.rule, colWidths.rule) +
      '  ' +
      padRight(`${f.file}:${f.line}`, colWidths.file) +
      '  ' +
      padRight(formatPerfCategory(f.category), colWidths.category + 6) +
      '  ' +
      f.title
    lines.push(row)
  }

  lines.push(chalk.dim('─'.repeat(header.length)))

  // ─── By-category breakdown ─────────────────────────
  lines.push('')
  lines.push(chalk.bold('By Category:'))
  for (const [cat, count] of Object.entries(stats.byCategory)) {
    lines.push(`  ${formatPerfCategory(cat)} ${count}`)
  }

  // ─── Verbose: suggestions and context ──────────────
  if (verbose && findings.length > 0) {
    lines.push('')
    lines.push(chalk.bold('Details:'))
    for (const f of findings) {
      lines.push('')
      lines.push(`  ${chalk.cyan(f.rule)} — ${f.title}`)
      lines.push(`  ${chalk.dim(`File: ${f.file}:${f.line}`)}`)
      lines.push(`  ${chalk.dim('Match:')} ${f.match}`)
      lines.push(`  ${chalk.green('Suggestion:')} ${f.suggestion}`)
      lines.push(`  ${chalk.dim('Context:')}`)
      for (const ctxLine of f.context.split('\n')) {
        lines.push(`    ${chalk.dim(ctxLine)}`)
      }
    }
  }

  return lines.join('\n')
}

// ─── JSON formatting ────────────────────────────────────

/**
 * Formats a PerfResult as a JSON string.
 *
 * @example
 * ```ts
 * const json = formatPerfJson(result)
 * ```
 */
export function formatPerfJson(result: PerfResult): string {
  return JSON.stringify(result, null, 2)
}
