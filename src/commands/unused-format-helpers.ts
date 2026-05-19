import chalk from 'chalk'

import type { ExportType, UnusedResult } from './unused-helpers.js'

// ─── Color mapping ──────────────────────────────────────

const TYPE_COLORS: Record<ExportType, (text: string) => string> = {
  class: chalk.cyan,
  const: chalk.blue,
  function: chalk.green,
  interface: chalk.yellow,
  other: chalk.gray,
  type: chalk.magenta,
}

function colorizeType(type: ExportType, text: string): string {
  const colorFn = TYPE_COLORS[type]
  return colorFn ? colorFn(text) : text
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

export function formatUnusedTable(result: UnusedResult): string {
  const { byType, totalExports, totalUnused, unused, unusedPercentage } = result
  const lines: string[] = [chalk.bold('\n🔍 Unused Export Report'), '']

  if (unused.length === 0) {
    lines.push(chalk.green('No unused exports found! All exports are used.'))
    return lines.join('\n')
  }

  const colWidths = {
    file: Math.max(12, ...unused.map((u) => u.export.filePath.length)),
    line: Math.max(4, ...unused.map((u) => String(u.export.line).length)),
    name: Math.max(4, ...unused.map((u) => u.export.name.length)),
    type: Math.max(4, ...unused.map((u) => u.export.type.length)),
  }

  const header =
    chalk.cyan(padRight('Type', colWidths.type)) +
    '  ' +
    chalk.cyan(padRight('Name', colWidths.name)) +
    '  ' +
    chalk.cyan(padRight('File', colWidths.file)) +
    '  ' +
    chalk.cyan(padLeft('Line', colWidths.line))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const item of unused) {
    const exp = item.export
    const row =
      colorizeType(exp.type, padRight(exp.type, colWidths.type)) +
      '  ' +
      padRight(exp.name, colWidths.name) +
      '  ' +
      padRight(exp.filePath, colWidths.file) +
      '  ' +
      padLeft(String(exp.line), colWidths.line)
    lines.push(row)
  }

  lines.push(chalk.dim('─'.repeat(header.length)))
  lines.push('')

  const summaryColor = unusedPercentage > 50 ? chalk.red : unusedPercentage > 25 ? chalk.yellow : chalk.green
  lines.push(summaryColor(`${totalUnused} unused exports out of ${totalExports} total (${unusedPercentage}%)`))

  if (byType.length > 0) {
    lines.push('')
    lines.push(chalk.bold('Breakdown by type:'))
    for (const bt of byType) {
      lines.push(`  ${colorizeType(bt.type as ExportType, bt.type)}: ${bt.count}`)
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

export function formatUnusedCsv(result: UnusedResult): string {
  const headers = ['Type', 'Name', 'File', 'Line', 'Usages']
  const rows: string[] = [headers.join(',')]

  for (const item of result.unused) {
    const exp = item.export
    rows.push(
      [
        escapeCsv(exp.type),
        escapeCsv(exp.name),
        escapeCsv(exp.filePath),
        String(exp.line),
        String(item.usages),
      ].join(','),
    )
  }

  return rows.join('\n')
}

// ─── JSON formatting ────────────────────────────────────

export function formatUnusedJson(result: UnusedResult): string {
  return JSON.stringify(result, null, 2)
}
