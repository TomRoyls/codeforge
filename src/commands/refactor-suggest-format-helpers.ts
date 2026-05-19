import chalk from 'chalk'

import type { RefactorResult, RefactorSuggestion } from './refactor-suggest-helpers.js'

// ─── Color helpers ──────────────────────────────────────

function severityLabel(s: RefactorSuggestion['severity']): string {
  switch (s) {
    case 'high': return chalk.red('HIGH')
    case 'medium': return chalk.rgb(255, 165, 0)('MED ')
    case 'low': return chalk.green('LOW ')
  }
}

function impactLabel(i: RefactorSuggestion['impact']): string {
  switch (i) {
    case 'high': return chalk.red('●')
    case 'medium': return chalk.rgb(255, 165, 0)('●')
    case 'low': return chalk.green('●')
  }
}

// ─── formatRefactorTable ────────────────────────────────

/**
 * Format refactoring results as a colored table.
 *
 * @example
 * ```ts
 * const output = formatRefactorTable(result, false)
 * ```
 */
export function formatRefactorTable(result: RefactorResult, verbose: boolean): string {
  const lines: string[] = []
  const { suggestions, stats } = result

  lines.push('')
  lines.push(chalk.bold('  Refactoring Suggestions'))
  lines.push(chalk.gray('  ───────────────────────────────────'))
  lines.push('')

  lines.push(`  Total:     ${chalk.white(String(stats.total))}`)
  lines.push(`  High:      ${chalk.red(String(stats.bySeverity.high ?? 0))}`)
  lines.push(`  Medium:    ${chalk.rgb(255, 165, 0)(String(stats.bySeverity.medium ?? 0))}`)
  lines.push(`  Low:       ${chalk.green(String(stats.bySeverity.low ?? 0))}`)
  lines.push(`  Est. Effort: ${chalk.cyan(`${stats.totalEffort}h`)}`)
  lines.push('')

  if (Object.keys(stats.byCategory).length > 0) {
    lines.push(chalk.bold('  By Category'))
    lines.push(chalk.gray('  ───────────────────────────────────'))
    for (const [cat, count] of Object.entries(stats.byCategory)) {
      lines.push(`  ${chalk.white(cat.padEnd(15))} ${chalk.cyan(String(count))}`)
    }
    lines.push('')
  }

  if (suggestions.length > 0) {
    lines.push(chalk.bold('  Suggestions'))
    lines.push(chalk.gray('  ───────────────────────────────────'))
    const limit = verbose ? suggestions.length : Math.min(suggestions.length, 20)
    for (const s of suggestions.slice(0, limit)) {
      lines.push(`  ${severityLabel(s.severity)} ${impactLabel(s.impact)} ${chalk.white(s.type.padEnd(24))} ${chalk.gray(s.file)}:${s.line}`)
      lines.push(`      ${chalk.gray(s.description)}`)
      if (verbose) {
        lines.push(`      ${chalk.yellow('Current:')} ${s.currentCode.split('\n')[0]}`)
        lines.push(`      ${chalk.green('Suggest:')} ${s.suggestedCode.split('\n')[0]}`)
      }
    }
    if (suggestions.length > limit) {
      lines.push(chalk.gray(`  ... and ${suggestions.length - limit} more`))
    }
    lines.push('')
  }

  if (Object.keys(stats.byType).length > 0) {
    lines.push(chalk.bold('  By Type'))
    lines.push(chalk.gray('  ───────────────────────────────────'))
    for (const [type, count] of Object.entries(stats.byType)) {
      lines.push(`  ${chalk.white(type.padEnd(26))} ${chalk.cyan(String(count))}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

// ─── formatRefactorJson ─────────────────────────────────

/**
 * Format refactoring results as JSON.
 *
 * @example
 * ```ts
 * const json = formatRefactorJson(result)
 * ```
 */
export function formatRefactorJson(result: RefactorResult): string {
  return JSON.stringify(result, null, 2)
}
