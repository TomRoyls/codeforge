import chalk from 'chalk'

import type { TodoListResult, TodoPriority } from './todo-list-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Helpers ────────────────────────────────────────────

/**
 * Color-code a priority label: high=red, medium=yellow, low=green.
 *
 * @example
 * ```ts
 * const colored = formatPriority('high')
 * colored // red-tinted 'HIGH'
 * ```
 */
export function formatPriority(priority: TodoPriority): string {
  switch (priority) {
    case 'high': return chalk.red('HIGH')
    case 'medium': return chalk.yellow('MED ')
    case 'low': return chalk.green('LOW ')
  }
}

/**
 * Format TODO list as a color-coded console table.
 *
 * @example
 * ```ts
 * const output = formatTodoListTable(result, false)
 * output // contains priority-colored rows
 * ```
 */
export function formatTodoListTable(result: TodoListResult, verbose: boolean): string {
  const { items, stats } = result
  const lines: string[] = [chalk.bold('\n📋 TODO List'), '']

  if (items.length === 0) {
    lines.push(chalk.green('No TODOs found — clean codebase!'))
    return lines.join('\n')
  }

  const colFile = Math.max(20, ...items.map((i) => i.file.length))
  const colLine = 5
  const colType = 9
  const colPrio = 5

  const header =
    chalk.cyan(padRight('File', colFile)) + ' ' +
    chalk.cyan(padLeft('Ln', colLine)) + ' ' +
    chalk.cyan(padRight('Type', colType)) + ' ' +
    chalk.cyan(padLeft('Prio', colPrio)) + '  ' +
    chalk.cyan('Text')

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const item of items) {
    const prio = formatPriority(item.priority)
    const typeLabel = formatType(item.type)
    const row =
      padRight(item.file, colFile) + ' ' +
      padLeft(String(item.line), colLine) + ' ' +
      typeLabel + ' ' +
      prio + '  ' +
      truncate(item.text, 60)
    lines.push(row)

    if (verbose) {
      if (item.assignee) lines.push(chalk.dim(`    @${item.assignee}`))
      if (item.tags.length > 0) lines.push(chalk.dim(`    tags: ${item.tags.join(', ')}`))
      if (item.category) lines.push(chalk.dim(`    [${item.category}]`))
      if (item.context.length > 0) {
        lines.push(chalk.dim('    context:'))
        for (const ctx of item.context) {
          lines.push(chalk.dim(`      ${ctx.trim()}`))
        }
      }
    }
  }

  lines.push('')
  lines.push(chalk.bold('Summary'))
  lines.push(`  Total: ${stats.total}`)
  lines.push(`  By type: ${formatRecord(stats.byType)}`)
  lines.push(`  By priority: ${formatRecord(stats.byPriority)}`)

  const assignees = Object.entries(stats.byAssignee)
  if (assignees.length > 0 && assignees.some(([, c]) => c > 0)) {
    lines.push(`  By assignee: ${formatRecord(stats.byAssignee)}`)
  }

  return lines.join('\n')
}

function formatType(type: string): string {
  switch (type) {
    case 'TODO': return chalk.blue(padRight('TODO', 9))
    case 'FIXME': return chalk.red(padRight('FIXME', 9))
    case 'HACK': return chalk.rgb(255, 165, 0)(padRight('HACK', 9))
    case 'XXX': return chalk.magenta(padRight('XXX', 9))
    case 'NOTE': return chalk.cyan(padRight('NOTE', 9))
    case 'OPTIMIZE': return chalk.yellow(padRight('OPT', 9))
    default: return padRight(type, 9)
  }
}

function formatRecord(rec: Record<string, number>): string {
  return Object.entries(rec)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ')
}

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str
  return str.slice(0, maxLen - 3) + '...'
}

/**
 * Format TODO list as JSON.
 *
 * @example
 * ```ts
 * const json = formatTodoListJson(result)
 * JSON.parse(json) // valid
 * ```
 */
export function formatTodoListJson(result: TodoListResult): string {
  return JSON.stringify(result, null, 2)
}
