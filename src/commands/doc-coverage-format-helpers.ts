import chalk from 'chalk'

import type { DocCoverageResult, ExportItem } from './doc-coverage-helpers.js'

// ─── Coverage bar ────────────────────────────────────────

/**
 * Render an inline coverage bar.
 *
 * @example
 * formatCoverageBar(75.0, 30) // '██████████████████████░░░░░░░░'
 */
export function formatCoverageBar(percentage: number, width: number = 30): string {
  const filled = Math.round((percentage / 100) * width)
  const empty = width - filled
  const filledChar = '█'
  const emptyChar = '░'
  const bar = filledChar.repeat(filled) + emptyChar.repeat(empty)
  return getCoverageColor(percentage)(bar)
}

// ─── Coverage color ──────────────────────────────────────

/**
 * Get chalk color function based on coverage percentage.
 *
 * @example
 * getCoverageColor(30.0)('text') // chalk.red('text')
 */
export function getCoverageColor(percentage: number): (text: string) => string {
  if (percentage < 50) return chalk.red
  if (percentage < 80) return chalk.yellow
  return chalk.green
}

// ─── Table formatting ────────────────────────────────────

function padRight(str: string, len: number): string {
  if (str.length >= len) return str
  return str + ' '.repeat(len - str.length)
}

function padLeft(str: string, len: number): string {
  if (str.length >= len) return str
  return ' '.repeat(len - str.length) + str
}

function computeQualityScore(item: ExportItem): number {
  const checks = [
    item.jsDocQuality.hasDescription,
    item.jsDocQuality.hasParams,
    item.jsDocQuality.hasReturns,
    item.jsDocQuality.hasExample,
  ]
  const passed = checks.filter(Boolean).length
  return Math.round((passed / checks.length) * 100)
}

function computeFileQualityScore(items: ExportItem[]): number {
  if (items.length === 0) return 100
  const totalScore = items.reduce((sum, item) => sum + computeQualityScore(item), 0)
  return Math.round(totalScore / items.length)
}

/**
 * Format documentation coverage results as a colorized table.
 *
 * @example
 * const output = formatDocCoverageTable(result, false)
 */
export function formatDocCoverageTable(result: DocCoverageResult, byType: boolean): string {
  const lines: string[] = [chalk.bold('\n📊 Documentation Coverage Report'), '']

  if (byType && result.byType.length > 0) {
    lines.push(chalk.bold('Coverage by Type:'))
    lines.push('')

    const typeColWidths = {
      documented: Math.max(12, ...result.byType.map((t) => String(t.documented).length)),
      percentage: 10,
      total: Math.max(7, ...result.byType.map((t) => String(t.total).length)),
      type: Math.max(12, ...result.byType.map((t) => t.type.length)),
    }

    lines.push(
      chalk.cyan(padRight('Type', typeColWidths.type)) +
        '  ' +
        chalk.cyan(padLeft('Total', typeColWidths.total)) +
        '  ' +
        chalk.cyan(padLeft('Documented', typeColWidths.documented)) +
        '  ' +
        chalk.cyan(padLeft('Coverage', typeColWidths.percentage)) +
        '  ' +
        chalk.cyan('Bar'),
    )
    lines.push(chalk.dim('─'.repeat(80)))

    for (const entry of result.byType) {
      const pctStr = entry.percentage.toFixed(1) + '%'
      lines.push(
        padRight(entry.type, typeColWidths.type) +
          '  ' +
          padLeft(String(entry.total), typeColWidths.total) +
          '  ' +
          padLeft(String(entry.documented), typeColWidths.documented) +
          '  ' +
          getCoverageColor(entry.percentage)(padLeft(pctStr, typeColWidths.percentage)) +
          '  ' +
          formatCoverageBar(entry.percentage, 20),
      )
    }
    lines.push('')
  }

  lines.push(chalk.bold('Coverage by File:'))
  lines.push('')

  const fileColWidths = {
    documented: Math.max(12, ...result.byFile.map((f) => String(f.documented).length)),
    file: Math.max(20, ...result.byFile.map((f) => f.file.length)),
    percentage: 10,
    quality: 8,
    total: Math.max(7, ...result.byFile.map((f) => String(f.total).length)),
  }

  lines.push(
    chalk.cyan(padRight('File', fileColWidths.file)) +
      '  ' +
      chalk.cyan(padLeft('Total', fileColWidths.total)) +
      '  ' +
      chalk.cyan(padLeft('Documented', fileColWidths.documented)) +
      '  ' +
      chalk.cyan(padLeft('Coverage', fileColWidths.percentage)) +
      '  ' +
      chalk.cyan(padLeft('Quality', fileColWidths.quality)),
  )
  lines.push(chalk.dim('─'.repeat(90)))

  for (const fileEntry of result.byFile) {
    const pctStr = fileEntry.percentage.toFixed(1) + '%'
    const fileItem = result.files.find((f) => f.relativePath === fileEntry.file)
    const qualityScore = fileItem ? computeFileQualityScore(fileItem.exports) : 0
    lines.push(
      padRight(fileEntry.file, fileColWidths.file) +
        '  ' +
        padLeft(String(fileEntry.total), fileColWidths.total) +
        '  ' +
        padLeft(String(fileEntry.documented), fileColWidths.documented) +
        '  ' +
        getCoverageColor(fileEntry.percentage)(padLeft(pctStr, fileColWidths.percentage)) +
        '  ' +
        padLeft(qualityScore + '%', fileColWidths.quality),
    )
  }

  lines.push(chalk.dim('─'.repeat(90)))

  const overallPctStr = result.coveragePercentage.toFixed(1) + '%'
  lines.push(
    chalk.bold(padRight('Total', fileColWidths.file)) +
      '  ' +
      chalk.bold(padLeft(String(result.totalExports), fileColWidths.total)) +
      '  ' +
      chalk.bold(padLeft(String(result.documentedExports), fileColWidths.documented)) +
      '  ' +
      getCoverageColor(result.coveragePercentage)(chalk.bold(padLeft(overallPctStr, fileColWidths.percentage))) +
      '  ' +
      formatCoverageBar(result.coveragePercentage, 20),
  )

  lines.push('')

  const filesWith100 = result.byFile.filter((f) => f.percentage === 100)
  const filesWith0 = result.byFile.filter((f) => f.percentage === 0)

  lines.push(`Files with 100% coverage: ${chalk.green(String(filesWith100.length))}`)
  lines.push(`Files with 0% coverage:   ${chalk.red(String(filesWith0.length))}`)

  if (result.undocumentedItems.length > 0) {
    lines.push('')
    lines.push(chalk.bold(`Top Undocumented Items (showing ${Math.min(20, result.undocumentedItems.length)} of ${result.undocumentedItems.length}):`))
    lines.push('')
    const topUndocumented = result.undocumentedItems.slice(0, 20)
    for (const item of topUndocumented) {
      lines.push(
        `  ${chalk.red('✗')} ${chalk.white(item.name)} ${chalk.dim(`(${item.type})`)} ${chalk.dim(`${item.filePath}:${item.line}`)}`,
      )
    }
  }

  return lines.join('\n')
}

// ─── CSV formatting ──────────────────────────────────────

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/**
 * Format documentation coverage results as CSV.
 *
 * @example
 * const csv = formatDocCoverageCsv(result)
 */
export function formatDocCoverageCsv(result: DocCoverageResult): string {
  const headers = ['File', 'Total', 'Documented', 'Coverage']
  const rows: string[] = [headers.join(',')]

  for (const fileEntry of result.byFile) {
    rows.push(
      [
        escapeCsv(fileEntry.file),
        String(fileEntry.total),
        String(fileEntry.documented),
        fileEntry.percentage.toFixed(1) + '%',
      ].join(','),
    )
  }

  rows.push(
    [
      escapeCsv('Total'),
      String(result.totalExports),
      String(result.documentedExports),
      result.coveragePercentage.toFixed(1) + '%',
    ].join(','),
  )

  return rows.join('\n')
}

// ─── JSON formatting ──────────────────────────────────────

/**
 * Format documentation coverage results as JSON.
 *
 * @example
 * const json = formatDocCoverageJson(result)
 */
export function formatDocCoverageJson(result: DocCoverageResult): string {
  return JSON.stringify(result, null, 2)
}
