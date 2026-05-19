import chalk from 'chalk'

import type { BundleSizeResult, FileBundleInfo } from './bundlesize-helpers.js'

// ─── Helpers ────────────────────────────────────────────

function padRight(str: string, len: number): string {
  if (str.length >= len) return str
  return str + ' '.repeat(len - str.length)
}

function padLeft(str: string, len: number): string {
  if (str.length >= len) return str
  return ' '.repeat(len - str.length) + str
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

/**
 * Color-size a byte value: green <5KB, yellow 5-20KB, red >20KB.
 *
 * @example
 * ```ts
 * const colored = colorSize(3000)
 * // green-tinted string
 * ```
 */
export function colorSize(bytes: number): string {
  const text = formatBytes(bytes)
  if (bytes < 5 * 1024) return chalk.green(text)
  if (bytes < 20 * 1024) return chalk.yellow(text)
  return chalk.red(text)
}

/**
 * Generate an ASCII bar proportional to size relative to max.
 *
 * @example
 * ```ts
 * const bar = sizeBar(50, 100, 20)
 * // '██████████          '
 * ```
 */
export function sizeBar(value: number, max: number, width: number): string {
  if (max === 0) return ' '.repeat(width)
  const filled = Math.round((value / max) * width)
  const clamped = Math.min(filled, width)
  return '█'.repeat(clamped) + ' '.repeat(width - clamped)
}

// ─── Table formatting ───────────────────────────────────

/**
 * Format bundle size results as an ASCII table with color-coded sizes.
 *
 * @example
 * ```ts
 * const table = formatBundleSizeTable(result, false)
 * table // contains header, rows, totals
 * ```
 */
export function formatBundleSizeTable(result: BundleSizeResult, verbose: boolean): string {
  const { analysis, suggestions } = result
  const lines: string[] = [chalk.bold('\n📦 Bundle Size Report'), '']

  const files = analysis.largestFiles.length > 0 ? analysis.largestFiles : analysis.files
  const maxGzipped = Math.max(...files.map((f) => f.estimatedGzipped), 1)

  const colFile = Math.max(30, ...files.map((f) => f.file.length))
  const colRaw = 10
  const colMin = 10
  const colGzip = 10
  const barWidth = 20

  const header =
    chalk.cyan(padRight('File', colFile)) + '  ' +
    chalk.cyan(padLeft('Raw', colRaw)) + '  ' +
    chalk.cyan(padLeft('Minified', colMin)) + '  ' +
    chalk.cyan(padLeft('Gzipped', colGzip)) + '  ' +
    chalk.cyan('Size Bar')

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const file of files) {
    const bar = sizeBar(file.estimatedGzipped, maxGzipped, barWidth)
    const row =
      padRight(file.file, colFile) + '  ' +
      padLeft(formatBytes(file.rawSize), colRaw) + '  ' +
      padLeft(formatBytes(file.estimatedMinified), colMin) + '  ' +
      colorSize(file.estimatedGzipped) + '  ' +
      chalk.dim(bar)
    lines.push(row)
  }

  lines.push(chalk.dim('─'.repeat(header.length)))

  const totalRow =
    chalk.bold(padRight('Total', colFile)) + '  ' +
    chalk.bold(padLeft(formatBytes(analysis.totalRaw), colRaw)) + '  ' +
    chalk.bold(padLeft(formatBytes(analysis.totalMinified), colMin)) + '  ' +
    chalk.bold(padLeft(formatBytes(analysis.totalGzipped), colGzip))
  lines.push(totalRow)

  if (verbose && analysis.heavyImports.length > 0) {
    lines.push('')
    lines.push(chalk.bold('Heavy Imports:'))
    for (const imp of analysis.heavyImports.slice(0, 10)) {
      lines.push(
        `  ${chalk.yellow(imp.importPath)} — ${imp.occurrenceCount} file(s), ~${formatBytes(imp.estimatedSize)} each`,
      )
    }
  }

  if (suggestions.length > 0) {
    lines.push('')
    lines.push(chalk.bold('Suggestions:'))
    for (const suggestion of suggestions) {
      const effortLabel = effortColor(suggestion.effort)(`[${suggestion.effort}]`)
      lines.push(
        `  ${effortLabel} ${suggestion.type}: ${suggestion.description} (~${formatBytes(suggestion.estimatedSaving)} saving)`,
      )
    }
  }

  return lines.join('\n')
}

function effortColor(effort: string): (text: string) => string {
  switch (effort) {
    case 'low': return chalk.green
    case 'medium': return chalk.yellow
    case 'high': return chalk.red
    default: return chalk.dim
  }
}

// ─── JSON formatting ────────────────────────────────────

/**
 * Format bundle size results as JSON.
 *
 * @example
 * ```ts
 * const json = formatBundleSizeJson(result)
 * JSON.parse(json) // valid
 * ```
 */
export function formatBundleSizeJson(result: BundleSizeResult): string {
  return JSON.stringify(result, null, 2)
}
