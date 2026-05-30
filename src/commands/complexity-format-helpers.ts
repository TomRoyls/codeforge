import chalk from 'chalk'

import type { ComplexityResult, RiskLevel } from './complexity-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Risk coloring ─────────────────────────────────────

/**
 * Returns the chalk color function for a given risk level.
 *
 * @param level - The risk level
 * @returns A chalk styling function
 *
 * @example
 * getRiskColor('low')('safe')       // green text
 * getRiskColor('very-high')('!!!')  // bold red text
 */
export function getRiskColor(level: RiskLevel): (text: string) => string {
  switch (level) {
    case 'low': return chalk.green
    case 'medium': return chalk.yellow
    case 'high': return chalk.red
    case 'very-high': return chalk.bold.red
  }
}

// ─── Table formatting ───────────────────────────────────

/**
 * Formats complexity results as a colorized table.
 *
 * @param result - The ComplexityResult to format
 * @returns Formatted table string with chalk colors
 *
 * @example
 * formatComplexityTable(result)  // colored terminal output
 */
export function formatComplexityTable(result: ComplexityResult): string {
  const { functions, totalFunctions, averageComplexity, byRiskLevel, byFile } = result
  const lines: string[] = [chalk.bold('\n📊 Complexity Analysis'), '']

  if (functions.length === 0) {
    lines.push(chalk.dim('No functions found.'))
    return lines.join('\n')
  }

  const colWidths = {
    complexity: Math.max(10, ...functions.map((f) => String(f.complexity).length)),
    file: Math.max(12, ...functions.map((f) => f.filePath.length)),
    func: Math.max(8, ...functions.map((f) => f.name.length)),
    line: 6,
    loc: 6,
    params: 6,
    risk: 10,
  }

  const header =
    chalk.cyan(padRight('Function', colWidths.func)) +
    '  ' +
    chalk.cyan(padRight('File', colWidths.file)) +
    '  ' +
    chalk.cyan(padLeft('Line', colWidths.line)) +
    '  ' +
    chalk.cyan(padLeft('Complexity', colWidths.complexity)) +
    '  ' +
    chalk.cyan(padLeft('Risk', colWidths.risk)) +
    '  ' +
    chalk.cyan(padLeft('Params', colWidths.params)) +
    '  ' +
    chalk.cyan(padLeft('LOC', colWidths.loc))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const fn of functions) {
    const riskColor = getRiskColor(fn.riskLevel)
    const row =
      padRight(fn.name, colWidths.func) +
      '  ' +
      padRight(fn.filePath, colWidths.file) +
      '  ' +
      padLeft(String(fn.startLine), colWidths.line) +
      '  ' +
      riskColor(padLeft(String(fn.complexity), colWidths.complexity)) +
      '  ' +
      riskColor(padLeft(fn.riskLevel, colWidths.risk)) +
      '  ' +
      padLeft(String(fn.params), colWidths.params) +
      '  ' +
      padLeft(String(fn.linesOfCode), colWidths.loc)
    lines.push(row)
  }

  lines.push(chalk.dim('─'.repeat(header.length)))

  // Summary
  lines.push('')
  lines.push(chalk.bold('Summary:'))
  lines.push(`  Total functions: ${totalFunctions}`)
  lines.push(`  Average complexity: ${averageComplexity.toFixed(1)}`)
  lines.push('')

  lines.push(chalk.dim('Risk distribution:'))
  for (const { level, count } of byRiskLevel) {
    const colorFn = getRiskColor(level as RiskLevel)
    lines.push(`  ${colorFn(`${level}: ${count}`)}`)
  }

  // Top 10 most complex files
  if (byFile.length > 0) {
    lines.push('')
    lines.push(chalk.bold('Top files by complexity:'))
    const topFiles = byFile.slice(0, 10)
    for (const entry of topFiles) {
      lines.push(`  ${chalk.cyan(entry.file)} — complexity: ${entry.complexity}, functions: ${entry.functions}`)
    }
  }

  return lines.join('\n')
}

// ─── CSV formatting ─────────────────────────────────────

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/**
 * Formats complexity results as CSV.
 *
 * @param result - The ComplexityResult to format
 * @returns CSV string
 *
 * @example
 * formatComplexityCsv(result)  // 'Function,File,Line,...'
 */
export function formatComplexityCsv(result: ComplexityResult): string {
  const headers = ['Function', 'File', 'Line', 'Complexity', 'Risk', 'Params', 'LOC']
  const rows: string[] = [headers.join(',')]

  for (const fn of result.functions) {
    rows.push(
      [
        escapeCsv(fn.name),
        escapeCsv(fn.filePath),
        String(fn.startLine),
        String(fn.complexity),
        fn.riskLevel,
        String(fn.params),
        String(fn.linesOfCode),
      ].join(','),
    )
  }

  return rows.join('\n')
}

// ─── JSON formatting ────────────────────────────────────

/**
 * Formats complexity results as pretty-printed JSON.
 *
 * @param result - The ComplexityResult to format
 * @returns JSON string
 *
 * @example
 * formatComplexityJson(result)  // '{ "files": [...], "functions": [...] }'
 */
export function formatComplexityJson(result: ComplexityResult): string {
  return JSON.stringify(result, null, 2)
}
