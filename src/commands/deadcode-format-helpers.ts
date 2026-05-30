import chalk from 'chalk'

import type { DeadCodeItem, DeadCodeResult } from './deadcode-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Color helpers ────────────────────────────────────────

/**
 * Returns the chalk color function for a confidence level.
 *
 * @example
 * ```ts
 * const colorFn = getConfidenceColor(90) // chalk.red
 * const colorFn2 = getConfidenceColor(60) // chalk.yellow
 * ```
 */
export function getConfidenceColor(confidence: number): (text: string) => string {
  if (confidence >= 80) return chalk.red
  if (confidence >= 50) return chalk.yellow
  return chalk.blue
}

/**
 * Returns an icon for a dead code type.
 *
 * @example
 * ```ts
 * getDeadCodeIcon('unused-export') // '📤'
 * getDeadCodeIcon('unreachable')   // '🚫'
 * ```
 */
export function getDeadCodeIcon(type: DeadCodeItem['type']): string {
  const icons: Record<DeadCodeItem['type'], string> = {
    'dead-branch': '🔀',
    'shadowed-decl': '👥',
    'unreachable': '🚫',
    'unreferenced-fn': '🔍',
    'unused-export': '📤',
    'unused-param': '🔕',
    'unused-var': '🗑️',
  }
  return icons[type] ?? '⚠️'
}

// ─── Table formatting ─────────────────────────────────────

/**
 * Format dead code results as a colored table.
 *
 * @example
 * ```ts
 * const output = formatDeadCodeTable(result, false)
 * console.log(output)
 * ```
 */
export function formatDeadCodeTable(result: DeadCodeResult, verbose: boolean): string {
  const { items, stats } = result
  const lines: string[] = [chalk.bold('\n🔍 Dead Code Analysis Report'), '']

  // Stats summary
  lines.push(chalk.bold('Summary:'))
  lines.push(`  Total issues:     ${chalk.bold(String(stats.totalIssues))}`)
  lines.push(`  High confidence:  ${chalk.red(String(stats.highConfidence))} (≥80)`)
  lines.push(`  Medium confidence: ${chalk.yellow(String(stats.mediumConfidence))} (50-79)`)
  lines.push(`  Low confidence:   ${chalk.blue(String(stats.lowConfidence))} (<50)`)
  lines.push(`  Estimated dead lines: ${chalk.bold(String(stats.estimatedLines))}`)
  lines.push('')

  if (items.length === 0) {
    lines.push(chalk.green('✅ No dead code detected!'))
    return lines.join('\n')
  }

  // Table header
  const colWidths = {
    confidence: 12,
    file: Math.max(12, ...items.map((i) => i.file.length)),
    line: Math.max(4, ...items.map((i) => String(i.line).length)),
    name: Math.max(8, ...items.map((i) => i.name.length)),
    reason: Math.max(10, ...items.map((i) => i.reason.length)),
    type: Math.max(10, ...items.map((i) => i.type.length)),
  }

  const header =
    chalk.cyan(padRight('File', colWidths.file)) +
    '  ' +
    chalk.cyan(padLeft('Line', colWidths.line)) +
    '  ' +
    chalk.cyan(padRight('Type', colWidths.type)) +
    '  ' +
    chalk.cyan(padRight('Name', colWidths.name)) +
    '  ' +
    chalk.cyan(padLeft('Confidence', colWidths.confidence)) +
    '  ' +
    chalk.cyan(padRight('Reason', colWidths.reason))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const item of items) {
    const icon = getDeadCodeIcon(item.type)
    const colorFn = getConfidenceColor(item.confidence)

    const row =
      padRight(item.file, colWidths.file) +
      '  ' +
      padLeft(String(item.line), colWidths.line) +
      '  ' +
      padRight(`${icon} ${item.type}`, colWidths.type) +
      '  ' +
      padRight(item.name, colWidths.name) +
      '  ' +
      colorFn(padLeft(`${item.confidence}%`, colWidths.confidence)) +
      '  ' +
      padRight(item.reason.slice(0, 60), colWidths.reason)

    lines.push(row)

    if (verbose) {
      lines.push(chalk.dim(`    Context: ${item.context.split('\n')[0] ?? ''}`))
    }
  }

  lines.push(chalk.dim('─'.repeat(header.length)))

  // Type breakdown
  if (Object.keys(stats.byType).length > 0) {
    lines.push('')
    lines.push(chalk.bold('Issues by type:'))
    for (const [type, count] of Object.entries(stats.byType)) {
      const icon = getDeadCodeIcon(type as DeadCodeItem['type'])
      lines.push(`  ${icon} ${type}: ${count}`)
    }
  }

  return lines.join('\n')
}

// ─── JSON formatting ──────────────────────────────────────

/**
 * Format dead code results as JSON.
 *
 * @example
 * ```ts
 * const json = formatDeadCodeJson(result)
 * JSON.parse(json) // valid
 * ```
 */
export function formatDeadCodeJson(result: DeadCodeResult): string {
  return JSON.stringify(result, null, 2)
}
