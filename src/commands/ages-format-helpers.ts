import chalk from 'chalk'

import type { AgesResult, FileAge } from './ages-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Utilities ───────────────────────────────────────────

// ─── Age formatting ──────────────────────────────────────

/**
 * Format age in days as a human-readable string.
 * @example
 * formatAge(3)   // '3 days'
 * formatAge(15)  // '2 weeks'
 * formatAge(90)  // '3 months'
 * formatAge(400) // '1 year'
 */
export function formatAge(days: number): string {
  if (days < 0) days = 0
  if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'}`
  if (days < 30) {
    const weeks = Math.floor(days / 7)
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`
  }
  if (days < 365) {
    const months = Math.floor(days / 30)
    return `${months} ${months === 1 ? 'month' : 'months'}`
  }
  const years = Math.floor(days / 365)
  return `${years} ${years === 1 ? 'year' : 'years'}`
}

/**
 * Get the chalk color function for an age category.
 * @example
 * getAgeColor('fresh')  // chalk.green
 * getAgeColor('ancient') // chalk.red
 */
export function getAgeColor(category: string): (text: string) => string {
  switch (category) {
    case 'fresh':
      return chalk.green
    case 'recent':
      return chalk.blue
    case 'stable':
      return chalk.white
    case 'stale':
      return chalk.yellow
    case 'ancient':
      return chalk.red
    default:
      return chalk.white
  }
}

// ─── Table formatting ────────────────────────────────────

/**
 * Format ages result as a colorized table.
 * @example
 * const output = formatAgesTable(result, false)
 */
export function formatAgesTable(result: AgesResult, verbose: boolean): string {
  const { files, stats, staleFiles, highChurnFiles } = result
  const lines: string[] = [chalk.bold('\n📋 File Age Analysis'), '']

  // Stats summary
  lines.push(chalk.bold('Summary:'))
  lines.push(`  Total files: ${stats.totalFiles}`)
  lines.push(`  Average age: ${formatAge(Math.round(stats.averageAge))}`)
  lines.push(`  Median age: ${formatAge(Math.round(stats.medianAge))}`)
  lines.push('')

  lines.push(chalk.bold('Category Distribution:'))
  lines.push(`  ${chalk.green('Fresh')} (< 7 days): ${stats.freshCount}`)
  lines.push(`  ${chalk.blue('Recent')} (7-30 days): ${stats.recentCount}`)
  lines.push(`  ${chalk.white('Stable')} (31-90 days): ${stats.stableCount}`)
  lines.push(`  ${chalk.yellow('Stale')} (91-365 days): ${stats.staleCount}`)
  lines.push(`  ${chalk.red('Ancient')} (> 365 days): ${stats.ancientCount}`)

  // Stale files warning
  if (staleFiles.length > 0) {
    lines.push('')
    lines.push(chalk.yellow.bold(`⚠ ${staleFiles.length} stale file${staleFiles.length === 1 ? '' : 's'} detected`))
  }

  // File table
  if (files.length > 0) {
    lines.push('')
    lines.push(chalk.bold('Files:'))
    lines.push('')

    const colWidths = computeTableWidths(files)

    const header =
      chalk.cyan(padRight('File', colWidths.file)) +
      '  ' +
      chalk.cyan(padLeft('Age', colWidths.age)) +
      '  ' +
      chalk.cyan(padLeft('Category', colWidths.category)) +
      '  ' +
      chalk.cyan(padLeft('Changes', colWidths.changes)) +
      '  ' +
      chalk.cyan(padLeft('Last Modified', colWidths.lastModified))

    lines.push(header)
    lines.push(chalk.dim('─'.repeat(header.length)))

    for (const file of files) {
      const colorFn = getAgeColor(file.ageCategory)
      const ageStr = formatAge(file.ageInDays)
      const dateStr = file.lastModified.split('T')[0] ?? file.lastModified

      let row =
        padRight(file.relativePath, colWidths.file) +
        '  ' +
        padLeft(ageStr, colWidths.age) +
        '  ' +
        colorFn(padLeft(file.ageCategory, colWidths.category)) +
        '  ' +
        padLeft(String(file.totalChanges), colWidths.changes) +
        '  ' +
        padLeft(dateStr, colWidths.lastModified)

      if (verbose && file.authors.length > 0) {
        row += chalk.dim(` (${file.authors.join(', ')})`)
      }

      lines.push(row)
    }
  }

  // High-churn section
  if (highChurnFiles.length > 0) {
    lines.push('')
    lines.push(chalk.bold('🔥 High Churn Files (most changes):'))
    for (const file of highChurnFiles.slice(0, 5)) {
      const colorFn = getAgeColor(file.ageCategory)
      lines.push(`  ${file.relativePath}: ${file.totalChanges} changes ${colorFn(`(${file.ageCategory})`)}`)
    }
  }

  return lines.join('\n')
}

interface TableWidths {
  file: number
  age: number
  category: number
  changes: number
  lastModified: number
}

function computeTableWidths(files: FileAge[]): TableWidths {
  const filePaths = files.map((f) => f.relativePath)
  const ages = files.map((f) => formatAge(f.ageInDays))
  const categories = files.map((f) => f.ageCategory)
  const changes = files.map((f) => String(f.totalChanges))
  const dates = files.map((f) => f.lastModified.split('T')[0] ?? f.lastModified)

  const fileCol = Math.max(20, ...filePaths.map((f) => f.length))
  const ageCol = Math.max(8, ...ages.map((a) => a.length))
  const catCol = Math.max(8, ...categories.map((c) => c.length))
  const changeCol = Math.max(8, ...changes.map((c) => c.length))
  const dateCol = Math.max(12, ...dates.map((d) => d.length))

  return {
    age: ageCol,
    category: catCol,
    changes: changeCol,
    file: Math.min(fileCol, 60),
    lastModified: dateCol,
  }
}

// ─── CSV formatting ──────────────────────────────────────

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/**
 * Format ages result as CSV.
 * @example
 * const csv = formatAgesCsv(result)
 */
export function formatAgesCsv(result: AgesResult): string {
  const headers = [
    'File',
    'Age (days)',
    'Category',
    'Changes',
    'Last Modified',
    'Authors',
    'Lines Added',
    'Lines Deleted',
  ]
  const rows: string[] = [headers.join(',')]

  for (const file of result.files) {
    rows.push(
      [
        escapeCsv(file.relativePath),
        String(file.ageInDays),
        file.ageCategory,
        String(file.totalChanges),
        file.lastModified,
        escapeCsv(file.authors.join('; ')),
        String(file.linesAdded),
        String(file.linesDeleted),
      ].join(','),
    )
  }

  return rows.join('\n')
}

// ─── JSON formatting ────────────────────────────────────

/**
 * Format ages result as JSON.
 * @example
 * const json = formatAgesJson(result)
 */
export function formatAgesJson(result: AgesResult): string {
  return JSON.stringify(result, null, 2)
}
