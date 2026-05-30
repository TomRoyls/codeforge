import chalk from 'chalk'

import type { LanguagesResult } from './languages-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Helpers ────────────────────────────────────────────

function langColor(color: string): (text: string) => string {
  switch (color) {
    case 'blue': return chalk.blue
    case 'cyan': return chalk.cyan
    case 'green': return chalk.green
    case 'magenta': return chalk.magenta
    case 'orange': return chalk.rgb(255, 165, 0)
    case 'pink': return chalk.rgb(255, 105, 180)
    case 'purple': return chalk.rgb(128, 0, 128)
    case 'red': return chalk.red
    case 'yellow': return chalk.yellow
    default: return chalk.white
  }
}

/**
 * Generate an ASCII bar proportional to percentage.
 *
 * @example
 * ```ts
 * const bar = percentageBar(75, 30)
 * // '██████████████████████                '
 * ```
 */
export function percentageBar(pct: number, width: number): string {
  const filled = Math.round((pct / 100) * width)
  const clamped = Math.min(filled, width)
  return '█'.repeat(clamped) + '░'.repeat(width - clamped)
}

/**
 * Format languages result as a colored ASCII table with bar chart.
 *
 * @example
 * ```ts
 * const output = formatLanguagesTable(result, false)
 * output // contains language names and bar chart
 * ```
 */
export function formatLanguagesTable(result: LanguagesResult, verbose: boolean): string {
  const { stats, tooling } = result
  const lines: string[] = [chalk.bold('\n🌐 Language Breakdown'), '']

  if (stats.languages.length === 0) {
    lines.push(chalk.dim('No source files found.'))
    return lines.join('\n')
  }

  const barWidth = 20
  const colLang = Math.max(14, ...stats.languages.map((l) => l.name.length))
  const colFiles = 7
  const colCode = 8
  const colPct = 5

  const header =
    chalk.cyan(padRight('Language', colLang)) + '  ' +
    chalk.cyan(padLeft('Files', colFiles)) + '  ' +
    chalk.cyan(padLeft('Code', colCode)) + '  ' +
    chalk.cyan(padLeft('%', colPct)) + '  ' +
    chalk.cyan('Bar')

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const lang of stats.languages) {
    const color = langColor(lang.color)
    const bar = percentageBar(lang.percentage, barWidth)
    const row =
      color(padRight(lang.name, colLang)) + '  ' +
      padLeft(String(lang.files), colFiles) + '  ' +
      padLeft(String(lang.codeLines), colCode) + '  ' +
      padLeft(String(lang.percentage), colPct) + '% ' +
      bar
    lines.push(row)

    if (verbose) {
      lines.push(chalk.dim(`    total: ${lang.totalLines}, comments: ${lang.commentLines}, blank: ${lang.blankLines}, avg: ${lang.avgFileSize} lines/file`))
    }
  }

  lines.push('')
  lines.push(`  ${chalk.bold('Total:')} ${stats.totalFiles} files, ${stats.totalCodeLines} code lines`)
  lines.push(`  ${chalk.bold('Primary:')} ${langColor(stats.languages[0]?.color ?? 'white')(stats.primaryLanguage)}`)

  if (stats.polyglot) {
    lines.push(`  ${chalk.yellow('Polyglot project')} — ${stats.languages.filter((l) => l.percentage >= 1).length} significant languages`)
  }

  if (tooling.length > 0) {
    lines.push('')
    lines.push(chalk.bold('Suggested Tooling'))
    for (const t of tooling) {
      lines.push(`  ${chalk.cyan(t.language)}: ${t.tools.join(', ')}`)
      lines.push(chalk.dim(`    ${t.reason}`))
    }
  }

  return lines.join('\n')
}

/**
 * Format languages result as JSON.
 *
 * @example
 * ```ts
 * const json = formatLanguagesJson(result)
 * JSON.parse(json) // valid
 * ```
 */
export function formatLanguagesJson(result: LanguagesResult): string {
  return JSON.stringify(result, null, 2)
}
