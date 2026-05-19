import chalk from 'chalk'

import { formatNumber } from '../utils/format-utils.js'
import type { TodoResult } from './todos-helpers.js'

function colorForPriority(priority: 'high' | 'medium' | 'low'): typeof chalk {
  switch (priority) {
    case 'high': {
      return chalk.red
    }
    case 'medium': {
      return chalk.yellow
    }
    default: {
      return chalk.green
    }
  }
}

export function formatTodoTable(result: TodoResult): string {
  const { comments, summary } = result
  const lines: string[] = [
    chalk.bold('\n📋 TODO Comments Report\n'),
    chalk.dim('Summary:'),
    `  Total comments: ${formatNumber(summary.total)}`,
  ]

  const typeEntries = Object.entries(summary.byType)
  if (typeEntries.length > 0) {
    lines.push('')
    lines.push(chalk.dim('By type:'))
    for (const [type, count] of typeEntries) {
      lines.push(`  ${chalk.bold(type)}: ${count}`)
    }
  }

  const priorityEntries = Object.entries(summary.byPriority).filter(([, v]) => v > 0)
  if (priorityEntries.length > 0) {
    lines.push('')
    lines.push(chalk.dim('By priority:'))
    for (const [priority, count] of priorityEntries) {
      const colorFn = colorForPriority(priority as 'high' | 'medium' | 'low')
      lines.push(`  ${colorFn.bold(priority)}: ${count}`)
    }
  }

  if (comments.length === 0) {
    lines.push('')
    lines.push(chalk.dim('No TODO comments found.'))
    return lines.join('\n')
  }

  const files = Array.from(new Set(comments.map((c) => c.file))).sort()
  lines.push('')
  lines.push(chalk.dim('Comments:'))
  for (const file of files) {
    const fileComments = comments.filter((c) => c.file === file)
    lines.push(`  ${chalk.cyan(file)}`)
    for (const comment of fileComments) {
      const colorFn = colorForPriority(comment.priority)
      const authorStr = comment.author ? chalk.dim(` [${comment.author}]`) : ''
      lines.push(
        `    ${chalk.gray(`L${comment.line}`)} ${colorFn.bold(comment.type)}${authorStr} ${comment.text}`,
      )
    }
  }

  return lines.join('\n')
}

export function formatTodoCsv(result: TodoResult): string {
  const headers = ['Type', 'Priority', 'File', 'Line', 'Author', 'Text']
  const rows = result.comments.map((c) => [
    c.type,
    c.priority,
    c.file,
    c.line.toString(),
    c.author ?? '',
    `"${c.text.replace(/"/g, '""')}"`,
  ])
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
}

export function formatTodoOutput(result: TodoResult, format: string): string {
  if (format === 'csv') {
    return formatTodoCsv(result)
  }
  return formatTodoTable(result)
}
