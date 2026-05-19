import chalk from 'chalk'

import type { EmojiResult } from './emoji-helpers.js'

// ─── Helpers ────────────────────────────────────────────

function padRight(str: string, len: number): string {
  if (str.length >= len) return str
  return str + ' '.repeat(len - str.length)
}

function padLeft(str: string, len: number): string {
  if (str.length >= len) return str
  return ' '.repeat(len - str.length) + str
}

// ─── Table formatting ───────────────────────────────────

/**
 * Format emoji analysis results as a colorized table.
 *
 * @example
 * const output = formatEmojiTable(result, false)
 * // Contains header, table rows, category breakdown
 */
export function formatEmojiTable(result: EmojiResult, verbose: boolean): string {
  const { stats, byCategory, topEmoji, totalEmojis, uniqueEmojis, filesWithEmojis, matches } = result
  const lines: string[] = [chalk.bold('\n🔍 Emoji Analysis Report'), '']

  lines.push(`  Total emojis found: ${chalk.bold(String(totalEmojis))}`)
  lines.push(`  Unique emojis:      ${chalk.bold(String(uniqueEmojis))}`)
  lines.push(`  Files with emojis:  ${chalk.bold(String(filesWithEmojis))}`)
  lines.push('')

  if (stats.length === 0) {
    lines.push(chalk.dim('  No emojis found.'))
    return lines.join('\n')
  }

  if (topEmoji) {
    lines.push(`  ${chalk.yellow('Top emoji:')} ${topEmoji.emoji} ${chalk.dim(topEmoji.name)} (${topEmoji.count}x)`)
    lines.push('')
  }

  const colWidths = {
    category: Math.max(12, ...stats.map((s) => s.category.length)),
    count: Math.max(6, ...stats.map((s) => String(s.count).length)),
    emoji: 4,
    files: Math.max(6, ...stats.map((s) => String(s.files.length).length)),
    name: Math.max(12, ...stats.map((s) => s.name.length)),
  }

  const header =
    chalk.cyan(padRight('Emoji', colWidths.emoji)) +
    '  ' +
    chalk.cyan(padRight('Name', colWidths.name)) +
    '  ' +
    chalk.cyan(padLeft('Count', colWidths.count)) +
    '  ' +
    chalk.cyan(padRight('Category', colWidths.category)) +
    '  ' +
    chalk.cyan(padLeft('Files', colWidths.files))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const stat of stats) {
    const row =
      padRight(stat.emoji, colWidths.emoji) +
      '  ' +
      padRight(stat.name, colWidths.name) +
      '  ' +
      padLeft(String(stat.count), colWidths.count) +
      '  ' +
      padRight(stat.category, colWidths.category) +
      '  ' +
      padLeft(String(stat.files.length), colWidths.files)
    lines.push(row)
  }

  lines.push(chalk.dim('─'.repeat(header.length)))

  if (byCategory.length > 0) {
    lines.push('')
    lines.push(chalk.bold('  Category Breakdown:'))
    for (const cat of byCategory) {
      lines.push(`    ${chalk.green(cat.category)}: ${cat.count}`)
    }
  }

  if (verbose && matches.length > 0) {
    lines.push('')
    lines.push(chalk.bold('  Per-File Locations:'))
    lines.push('')

    const fileGroups = new Map<string, typeof matches>()
    for (const m of matches) {
      const existing = fileGroups.get(m.filePath)
      if (existing) {
        existing.push(m)
      } else {
        fileGroups.set(m.filePath, [m])
      }
    }

    for (const [filePath, fileMatches] of fileGroups) {
      lines.push(`  ${chalk.cyan(filePath)}:`)
      for (const fm of fileMatches) {
        lines.push(`    L${fm.line}:${fm.column} ${fm.emoji} ${chalk.dim(fm.name)} — ${chalk.dim(fm.context)}`)
      }
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
 * Format emoji analysis results as CSV.
 *
 * @example
 * const csv = formatEmojiCsv(result)
 * // "Emoji,Name,Count,Category,Files"
 */
export function formatEmojiCsv(result: EmojiResult): string {
  const headers = ['Emoji', 'Name', 'Count', 'Category', 'Files']
  const rows: string[] = [headers.join(',')]

  for (const stat of result.stats) {
    rows.push(
      [
        escapeCsv(stat.emoji),
        escapeCsv(stat.name),
        String(stat.count),
        escapeCsv(stat.category),
        String(stat.files.length),
      ].join(','),
    )
  }

  return rows.join('\n')
}

// ─── JSON formatting ────────────────────────────────────

/**
 * Format emoji analysis results as pretty-printed JSON.
 *
 * @example
 * const json = formatEmojiJson(result)
 * // JSON.parse(json).totalEmojis
 */
export function formatEmojiJson(result: EmojiResult): string {
  return JSON.stringify(result, null, 2)
}
