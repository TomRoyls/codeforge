import chalk from 'chalk'

import type { MaintainResult } from './maintain-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Helpers ────────────────────────────────────────────

/**
 * Format a maintainability index score with color.
 * >80 = green, 60-80 = yellow, <60 = red.
 *
 * @example
 * ```ts
 * formatMI(85) // green "85"
 * formatMI(50) // red "50"
 * ```
 */
export function formatMI(score: number): string {
  const str = String(score)
  if (score > 80) return chalk.green(str)
  if (score >= 60) return chalk.yellow(str)
  return chalk.red(str)
}

/**
 * Format an impact label with color.
 *
 * @example
 * ```ts
 * formatImpact('high') // red "HIGH"
 * formatImpact('low') // green "LOW"
 * ```
 */
export function formatImpact(impact: 'low' | 'medium' | 'high'): string {
  switch (impact) {
    case 'high': return chalk.red('HIGH')
    case 'medium': return chalk.yellow('MED ')
    case 'low': return chalk.green('LOW ')
  }
}

function formatGrade(grade: string): string {
  switch (grade) {
    case 'A': return chalk.green.bold('A')
    case 'B': return chalk.cyan.bold('B')
    case 'C': return chalk.yellow.bold('C')
    case 'D': return chalk.red.bold('D')
    case 'F': return chalk.red.bold.bgWhite('F')
    default: return grade
  }
}

// ─── Table formatting ───────────────────────────────────

/**
 * Format maintainability results as a table.
 *
 * @example
 * ```ts
 * const output = formatMaintainTable(result, false)
 * ```
 */
export function formatMaintainTable(result: MaintainResult, verbose: boolean): string {
  const { files, stats, overallScore, grade } = result
  const lines: string[] = [chalk.bold('\n🔧 Maintainability Report'), '']

  lines.push(`Overall Score: ${formatMI(overallScore)} ${chalk.dim('/ 100')} Grade: ${formatGrade(grade)}`)
  lines.push('')
  lines.push(`Files: ${stats.totalFiles}  Functions: ${stats.totalFunctions}  Avg MI: ${formatMI(Math.round(stats.avgMaintainability))}  Avg Complexity: ${stats.avgComplexity.toFixed(1)}`)
  lines.push(`High-Risk Files: ${chalk.red(String(stats.highRiskFiles))}  Avg Lines/Function: ${stats.avgLinesPerFunction.toFixed(1)}`)
  lines.push('')

  if (files.length > 0) {
    const colWidths = {
      avgComplexity: Math.max(14, ...files.map((f) => f.avgComplexity.toFixed(1).length)),
      filePath: Math.max(12, ...files.map((f) => f.filePath.length)),
      functions: Math.max(10, ...files.map((f) => String(f.functions.length).length)),
      issues: Math.max(7, ...files.map((f) => String(f.issues.length).length)),
      mi: Math.max(3, ...files.map((f) => String(f.maintainabilityIndex).length)),
    }

    const header =
      chalk.cyan(padRight('File', colWidths.filePath)) +
      '  ' +
      chalk.cyan(padLeft('MI', colWidths.mi)) +
      '  ' +
      chalk.cyan(padLeft('Avg Complexity', colWidths.avgComplexity)) +
      '  ' +
      chalk.cyan(padLeft('Functions', colWidths.functions)) +
      '  ' +
      chalk.cyan(padLeft('Issues', colWidths.issues))

    lines.push(header)
    lines.push(chalk.dim('─'.repeat(header.length)))

    for (const file of files) {
      const row =
        padRight(file.filePath, colWidths.filePath) +
        '  ' +
        padLeft(formatMI(file.maintainabilityIndex), colWidths.mi) +
        '  ' +
        padLeft(file.avgComplexity.toFixed(1), colWidths.avgComplexity) +
        '  ' +
        padLeft(String(file.functions.length), colWidths.functions) +
        '  ' +
        padLeft(String(file.issues.length + file.suggestions.length), colWidths.issues)
      lines.push(row)
    }

    lines.push(chalk.dim('─'.repeat(header.length)))
  }

  if (stats.suggestions.length > 0) {
    lines.push('')
    lines.push(chalk.bold('Top Refactoring Suggestions:'))
    lines.push('')

    const topSuggestions = stats.suggestions.slice(0, 10)
    for (const sug of topSuggestions) {
      lines.push(`  ${formatImpact(sug.impact)} ${chalk.dim(`[${sug.type}]`)} ${sug.file}:${sug.line}`)
      lines.push(`       ${sug.description}`)
    }

    if (stats.suggestions.length > 10) {
      lines.push(chalk.dim(`  ... and ${stats.suggestions.length - 10} more`))
    }
  }

  if (verbose && files.length > 0) {
    lines.push('')
    lines.push(chalk.bold('Per-Function Breakdown:'))
    lines.push('')

    for (const file of files) {
      if (file.functions.length === 0) continue
      lines.push(chalk.cyan(`  ${file.filePath}:`))
      for (const fn of file.functions) {
        const fnIssues = fn.issues.length > 0
          ? chalk.red(` (${fn.issues.join(', ')})`)
          : ''
        lines.push(`    ${padRight(fn.name, 30)} MI:${formatMI(fn.maintainabilityIndex).padStart(4)}  CC:${String(fn.cyclomaticComplexity).padStart(3)}  Lines:${String(fn.linesOfCode).padStart(4)}  Nest:${String(fn.nestingDepth).padStart(3)}${fnIssues}`)
      }
    }
  }

  return lines.join('\n')
}

// ─── JSON formatting ────────────────────────────────────

/**
 * Format maintainability results as JSON.
 *
 * @example
 * ```ts
 * const json = formatMaintainJson(result)
 * const parsed = JSON.parse(json)
 * ```
 */
export function formatMaintainJson(result: MaintainResult): string {
  return JSON.stringify(result, null, 2)
}
