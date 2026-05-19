import chalk from 'chalk'

import type { SizeResult } from './size-helpers.js'
import { formatBytes, renderBarChart } from './size-helpers.js'

// ─── Table formatting ───────────────────────────────────

function padRight(str: string, len: number): string {
  if (str.length >= len) return str
  return str + ' '.repeat(len - str.length)
}

function padLeft(str: string, len: number): string {
  if (str.length >= len) return str
  return ' '.repeat(len - str.length) + str
}

function sizeColor(bytes: number, text: string): string {
  if (bytes >= 1024 * 1024 * 10) return chalk.red(text)
  if (bytes >= 1024 * 1024) return chalk.yellow(text)
  return chalk.green(text)
}

/**
 * @example
 * formatSizeTable(result) // => colored table with bar charts
 */
export function formatSizeTable(result: SizeResult): string {
  const { entries, totalSize, totalFiles } = result
  const lines: string[] = [chalk.bold('\n📊 Disk Usage Report'), '']

  const nameWidth = Math.max(20, ...entries.map((e) => e.name.length))
  const sizeWidth = Math.max(10, ...entries.map((e) => formatBytes(e.size).length), formatBytes(totalSize).length)
  const filesWidth = Math.max(7, ...entries.map((e) => String(e.files).length), String(totalFiles).length)
  const barWidth = 20
  const pctWidth = 8

  const header =
    chalk.cyan(padRight('Name', nameWidth)) +
    '  ' +
    chalk.cyan(padLeft('Size', sizeWidth)) +
    '  ' +
    chalk.cyan(padLeft('Files', filesWidth)) +
    '  ' +
    chalk.cyan(padRight('Bar', barWidth)) +
    '  ' +
    chalk.cyan(padLeft('%', pctWidth))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]!
    const bar = renderBarChart(entry.percentage, barWidth)
    const sizeStr = formatBytes(entry.size)
    const pctStr = `${entry.percentage.toFixed(1)}%`

    const nameStr = i === 0 ? chalk.bold(entry.name) : entry.name
    const coloredSize = sizeColor(entry.size, padLeft(sizeStr, sizeWidth))

    const row =
      padRight(nameStr, nameWidth) +
      '  ' +
      coloredSize +
      '  ' +
      padLeft(String(entry.files), filesWidth) +
      '  ' +
      chalk.dim(bar) +
      '  ' +
      padLeft(pctStr, pctWidth)
    lines.push(row)
  }

  lines.push(chalk.dim('─'.repeat(header.length)))

  const totalRow =
    chalk.bold(padRight('Total', nameWidth)) +
    '  ' +
    chalk.bold(padLeft(formatBytes(totalSize), sizeWidth)) +
    '  ' +
    chalk.bold(padLeft(String(totalFiles), filesWidth)) +
    '  ' +
    chalk.dim(' '.repeat(barWidth)) +
    '  ' +
    chalk.dim(padLeft('100.0%', pctWidth))
  lines.push(totalRow)

  lines.push('')
  lines.push(chalk.dim(`Total: ${formatBytes(totalSize)} in ${totalFiles} files`))

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
 * @example
 * formatSizeCsv(result) // => 'Name,Size,Files,Percentage\nsrc,1.0 KB,5,50.0'
 */
export function formatSizeCsv(result: SizeResult): string {
  const headers = ['Name', 'Size', 'Files', 'Percentage']
  const rows: string[] = [headers.join(',')]

  for (const entry of result.entries) {
    rows.push(
      [
        escapeCsv(entry.name),
        String(entry.size),
        String(entry.files),
        entry.percentage.toFixed(1),
      ].join(','),
    )
  }

  return rows.join('\n')
}

// ─── JSON formatting ────────────────────────────────────

/**
 * @example
 * formatSizeJson(result) // => '{ "entries": [...], "totalSize": 100, ... }'
 */
export function formatSizeJson(result: SizeResult): string {
  return JSON.stringify(result, null, 2)
}
