import chalk from 'chalk'

import type { SuggestionsResult } from './suggestions-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Utilities ──────────────────────────────────────────

// ─── Severity formatting ────────────────────────────────

const SEVERITY_COLORS: Record<string, (text: string) => string> = {
  high: chalk.red,
  low: chalk.green,
  medium: chalk.yellow,
}

function formatSeverity(severity: string): string {
  const colorFn = SEVERITY_COLORS[severity]
  return colorFn ? colorFn(severity.toUpperCase()) : severity
}

// ─── Category icons ─────────────────────────────────────

const CATEGORY_ICONS: Record<string, string> = {
  maintenance: '\u{1F527}', // 🔧
  performance: '\u26A1', // ⚡
  quality: '\u{1F50D}', // 🔍
  security: '\u{1F512}', // 🔒
  style: '\u{1F3A8}', // 🎨
}

function formatCategory(category: string): string {
  const icon = CATEGORY_ICONS[category] ?? ''
  return `${icon} ${category}`
}

// ─── Table formatting ───────────────────────────────────

/**
 * Format suggestions as a colorized table.
 *
 * @example
 * formatSuggestionsTable(result, false)
 * // => "📋 Suggestions Report\n..."
 *
 * @param result - The aggregated suggestions result
 * @param verbose - Whether to show detailed output
 * @returns Formatted table string
 */
export function formatSuggestionsTable(result: SuggestionsResult, verbose: boolean): string {
  const { suggestions, totalFound, byCategory, bySeverity } = result
  const lines: string[] = [chalk.bold('\n📋 Suggestions Report'), '']

  // Summary
  lines.push(chalk.bold('Summary:'))
  lines.push(`  Total suggestions: ${chalk.bold(String(totalFound))}`)

  if (byCategory.length > 0) {
    const categoryStr = byCategory.map((c) => `${formatCategory(c.category)}: ${c.count}`).join(', ')
    lines.push(`  By category: ${categoryStr}`)
  }

  if (bySeverity.length > 0) {
    const severityStr = bySeverity.map((s) => `${formatSeverity(s.severity)}: ${s.count}`).join(', ')
    lines.push(`  By severity: ${severityStr}`)
  }

  if (suggestions.length === 0) {
    lines.push('')
    lines.push(chalk.green('No suggestions found. Your code looks great!'))
    return lines.join('\n')
  }

  // Table
  lines.push('')
  const colWidths = {
    category: 16,
    file: Math.max(15, ...suggestions.map((s) => s.filePath.length)),
    line: 6,
    rule: 18,
    severity: 8,
    title: 40,
  }

  const header =
    chalk.cyan(padRight('Severity', colWidths.severity)) +
    '  ' +
    chalk.cyan(padRight('Category', colWidths.category)) +
    '  ' +
    chalk.cyan(padRight('Rule', colWidths.rule)) +
    '  ' +
    chalk.cyan(padRight('File', colWidths.file)) +
    '  ' +
    chalk.cyan(padLeft('Line', colWidths.line)) +
    '  ' +
    chalk.cyan(padRight('Title', colWidths.title))

  lines.push(header)
  lines.push(chalk.dim('\u2500'.repeat(header.length)))

  for (const s of suggestions) {
    const row =
      padRight(formatSeverity(s.severity), colWidths.severity) +
      '  ' +
      padRight(formatCategory(s.category), colWidths.category) +
      '  ' +
      padRight(s.rule, colWidths.rule) +
      '  ' +
      padRight(s.filePath, colWidths.file) +
      '  ' +
      padLeft(String(s.line), colWidths.line) +
      '  ' +
      padRight(s.title, colWidths.title)
    lines.push(row)

    if (verbose) {
      lines.push(chalk.dim(`    Description: ${s.description}`))
      lines.push(chalk.dim(`    Suggestion:  ${s.suggestion}`))
    }
  }

  return lines.join('\n')
}

// ─── JSON formatting ────────────────────────────────────

/**
 * Format suggestions as pretty-printed JSON.
 *
 * @example
 * formatSuggestionsJson(result)
 * // => '{"suggestions": [...], "totalFound": 5, ...}'
 *
 * @param result - The aggregated suggestions result
 * @returns Pretty-printed JSON string
 */
export function formatSuggestionsJson(result: SuggestionsResult): string {
  return JSON.stringify(result, null, 2)
}
