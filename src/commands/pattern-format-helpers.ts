import chalk from 'chalk'

import type { PatternResult } from './pattern-helpers.js'

// ─── Table formatting ───────────────────────────────────

function padRight(str: string, len: number): string {
  if (str.length >= len) return str
  return str + ' '.repeat(len - str.length)
}

function padLeft(str: string, len: number): string {
  if (str.length >= len) return str
  return ' '.repeat(len - str.length) + str
}

function categoryColor(category: string, text: string): string {
  switch (category) {
    case 'design':
      return chalk.green(text)
    case 'anti':
      return chalk.red(text)
    case 'idiom':
      return chalk.blue(text)
    default:
      return text
  }
}

function confidenceBar(confidence: number): string {
  const filled = Math.round(confidence * 5)
  const empty = 5 - filled
  const bar = '█'.repeat(filled) + '░'.repeat(empty)
  return `${bar} ${(confidence * 100).toFixed(0)}%`
}

export function formatPatternTable(result: PatternResult, verbose: boolean): string {
  const { patterns, summary } = result
  const lines: string[] = [chalk.bold('\n Pattern Detection Report'), '']

  // ─── Summary counts ───────────────────────────────────
  lines.push(chalk.bold('Summary:'))
  lines.push(`  ${chalk.green(`Design Patterns: ${result.designPatterns}`)}`)
  lines.push(`  ${chalk.red(`Anti-Patterns: ${result.antiPatterns}`)}`)
  lines.push(`  ${chalk.blue(`Idioms: ${result.idioms}`)}`)
  lines.push(`  Total: ${result.totalPatterns}`)
  lines.push('')

  if (summary.length > 0) {
    lines.push(chalk.bold('Pattern Summary:'))
    for (const s of summary) {
      lines.push(
        `  ${categoryColor(s.category, s.name)} (${s.category}): ${s.count} occurrence${s.count > 1 ? 's' : ''} in ${s.files.length} file${s.files.length > 1 ? 's' : ''} — avg confidence ${(s.avgConfidence * 100).toFixed(0)}%`,
      )
    }
    lines.push('')
  }

  // ─── Detailed table ──────────────────────────────────
  if (patterns.length > 0) {
    const colWidths = {
      category: Math.max(8, ...patterns.map((p) => p.category.length)),
      confidence: 12,
      file: Math.max(10, ...patterns.map((p) => p.filePath.length)),
      line: 4,
      pattern: Math.max(10, ...patterns.map((p) => p.name.length)),
    }

    const header =
      chalk.cyan(padRight('Pattern', colWidths.pattern)) +
      '  ' +
      chalk.cyan(padRight('Category', colWidths.category)) +
      '  ' +
      chalk.cyan(padRight('File', colWidths.file)) +
      '  ' +
      chalk.cyan(padLeft('Line', colWidths.line)) +
      '  ' +
      chalk.cyan('Confidence')

    lines.push(header)
    lines.push(chalk.dim('─'.repeat(header.length)))

    for (const p of patterns) {
      const catDisplay = categoryColor(p.category, padRight(p.category, colWidths.category))
      const row =
        padRight(p.name, colWidths.pattern) +
        '  ' +
        catDisplay +
        '  ' +
        padRight(p.filePath, colWidths.file) +
        '  ' +
        padLeft(String(p.line), colWidths.line) +
        '  ' +
        confidenceBar(p.confidence)
      lines.push(row)
    }

    lines.push(chalk.dim('─'.repeat(header.length)))
  }

  if (verbose && patterns.length > 0) {
    lines.push('')
    lines.push(chalk.bold('Detailed Findings:'))
    lines.push('')
    for (const p of patterns) {
      lines.push(`  ${categoryColor(p.category, `[${p.category.toUpperCase()}]`)} ${chalk.bold(p.name)} — ${p.filePath}:${p.line}`)
      lines.push(`    ${chalk.dim(p.description)}`)
      lines.push(`    ${chalk.dim(p.snippet)}`)
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

export function formatPatternCsv(result: PatternResult): string {
  const headers = ['Pattern', 'Category', 'File', 'Line', 'Confidence', 'Description']
  const rows: string[] = [headers.join(',')]

  for (const p of result.patterns) {
    rows.push(
      [
        escapeCsv(p.name),
        escapeCsv(p.category),
        escapeCsv(p.filePath),
        String(p.line),
        String(p.confidence),
        escapeCsv(p.description),
      ].join(','),
    )
  }

  rows.push('')
  rows.push(`Design Patterns,${result.designPatterns}`)
  rows.push(`Anti-Patterns,${result.antiPatterns}`)
  rows.push(`Idioms,${result.idioms}`)
  rows.push(`Total,${result.totalPatterns}`)

  return rows.join('\n')
}

// ─── JSON formatting ────────────────────────────────────

export function formatPatternJson(result: PatternResult): string {
  return JSON.stringify(result, null, 2)
}
