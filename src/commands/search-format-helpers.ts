import chalk from 'chalk'

import type { SearchResult } from './search-helpers.js'
import { getMatchMarkers } from './search-helpers.js'

// ─── Text formatting ───────────────────────────────────

export interface FormatTextOptions {
  filesWithMatchesOnly: boolean
}

/**
 * Format search results as colorized grep-like output.
 */
export function formatSearchText(result: SearchResult, options: FormatTextOptions): string {
  const lines: string[] = []

  if (options.filesWithMatchesOnly) {
    for (const file of result.files) {
      lines.push(file.relativePath)
    }
    return lines.join('\n')
  }

  for (const file of result.files) {
    lines.push(chalk.bold.cyan(file.relativePath))

    for (const match of file.matches) {
      for (const ctxLine of match.context.before) {
        lines.push(chalk.dim(`  ${ctxLine}`))
      }

      const highlightedText = highlightLine(match.text, match.column, result.pattern, options)
      lines.push(chalk.dim(`  ${match.line}:${match.column} | `) + highlightedText)

      for (const ctxLine of match.context.after) {
        lines.push(chalk.dim(`  ${ctxLine}`))
      }
    }

    lines.push('')
  }

  lines.push(`Found ${result.totalMatches} matches in ${result.filesWithMatches} files`)

  return lines.join('\n')
}

function highlightLine(text: string, _column: number, pattern: string, _options: FormatTextOptions): string {
  try {
    const regex = new RegExp(pattern, 'gi')
    regex.lastIndex = 0
    const match = regex.exec(text)

    if (match && match.index !== undefined) {
      const start = match.index
      const end = start + match[0].length
      const markers = getMatchMarkers()
      const marked = text.slice(0, start) + markers.start + text.slice(start, end) + markers.end + text.slice(end)
      return applyChalkHighlight(marked)
    }
  } catch {
    // Regex failure: return unhighlighted text
  }

  return text
}

function applyChalkHighlight(text: string): string {
  const markers = getMatchMarkers()
  const parts = text.split(markers.start)
  const result: string[] = []

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i] as string
    const endIdx = part.indexOf(markers.end)
    if (endIdx !== -1) {
      const highlighted = part.slice(0, endIdx)
      const rest = part.slice(endIdx + markers.end.length)
      result.push(chalk.bold.red(highlighted) + rest)
    } else {
      result.push(part)
    }
  }

  return result.join('')
}

// ─── CSV formatting ─────────────────────────────────────

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/**
 * Format search results as CSV.
 */
export function formatSearchCsv(result: SearchResult): string {
  const headers = ['File', 'Line', 'Column', 'Match Text']
  const rows: string[] = [headers.join(',')]

  for (const file of result.files) {
    for (const match of file.matches) {
      rows.push(
        [
          escapeCsv(file.relativePath),
          String(match.line),
          String(match.column),
          escapeCsv(match.text.trim()),
        ].join(','),
      )
    }
  }

  return rows.join('\n')
}

// ─── JSON formatting ────────────────────────────────────

/**
 * Format search results as pretty-printed JSON.
 */
export function formatSearchJson(result: SearchResult): string {
  return JSON.stringify(result, null, 2)
}
