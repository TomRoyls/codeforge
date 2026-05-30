import chalk from 'chalk'

import type { CountResult } from './count-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Table formatting ───────────────────────────────────

export function formatCountTable(result: CountResult, verbose: boolean): string {
  const { languages, totals, fileBreakdown } = result
  const lines: string[] = [chalk.bold('\n📋 Line Count Report'), '']

  const colWidths = {
    blank: Math.max(10, ...languages.map((l) => String(l.blank).length), String(totals.blank).length),
    code: Math.max(10, ...languages.map((l) => String(l.code).length), String(totals.code).length),
    comment: Math.max(10, ...languages.map((l) => String(l.comment).length), String(totals.comment).length),
    files: Math.max(7, ...languages.map((l) => String(l.files).length), String(totals.files).length),
    language: Math.max(12, ...languages.map((l) => l.language.length), 'Total'.length),
    total: Math.max(10, ...languages.map((l) => String(l.total).length), String(totals.total).length),
  }

  const header =
    chalk.cyan(padRight('Language', colWidths.language)) +
    '  ' +
    chalk.cyan(padLeft('Files', colWidths.files)) +
    '  ' +
    chalk.cyan(padLeft('Code', colWidths.code)) +
    '  ' +
    chalk.cyan(padLeft('Comment', colWidths.comment)) +
    '  ' +
    chalk.cyan(padLeft('Blank', colWidths.blank)) +
    '  ' +
    chalk.cyan(padLeft('Total', colWidths.total))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const lang of languages) {
    const row =
      padRight(lang.language, colWidths.language) +
      '  ' +
      padLeft(String(lang.files), colWidths.files) +
      '  ' +
      padLeft(String(lang.code), colWidths.code) +
      '  ' +
      padLeft(String(lang.comment), colWidths.comment) +
      '  ' +
      padLeft(String(lang.blank), colWidths.blank) +
      '  ' +
      padLeft(String(lang.total), colWidths.total)
    lines.push(row)
  }

  lines.push(chalk.dim('─'.repeat(header.length)))

  const totalRow =
    chalk.bold(padRight('Total', colWidths.language)) +
    '  ' +
    chalk.bold(padLeft(String(totals.files), colWidths.files)) +
    '  ' +
    chalk.bold(padLeft(String(totals.code), colWidths.code)) +
    '  ' +
    chalk.bold(padLeft(String(totals.comment), colWidths.comment)) +
    '  ' +
    chalk.bold(padLeft(String(totals.blank), colWidths.blank)) +
    '  ' +
    chalk.bold(padLeft(String(totals.total), colWidths.total))
  lines.push(totalRow)

  if (verbose && fileBreakdown && fileBreakdown.length > 0) {
    lines.push('')
    lines.push(chalk.bold('Per-File Breakdown:'))
    lines.push('')

    for (const file of fileBreakdown) {
      lines.push(
        `  ${chalk.cyan(file.filePath)} (${file.language}): ${file.code} code, ${file.comment} comment, ${file.blank} blank`,
      )
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

export function formatCountCsv(result: CountResult): string {
  const headers = ['Language', 'Files', 'Code', 'Comment', 'Blank', 'Total']
  const rows: string[] = [headers.join(',')]

  for (const lang of result.languages) {
    rows.push(
      [
        escapeCsv(lang.language),
        String(lang.files),
        String(lang.code),
        String(lang.comment),
        String(lang.blank),
        String(lang.total),
      ].join(','),
    )
  }

  rows.push(
    [
      escapeCsv('Total'),
      String(result.totals.files),
      String(result.totals.code),
      String(result.totals.comment),
      String(result.totals.blank),
      String(result.totals.total),
    ].join(','),
  )

  return rows.join('\n')
}

// ─── JSON formatting ────────────────────────────────────

export function formatCountJson(result: CountResult): string {
  return JSON.stringify(result, null, 2)
}
