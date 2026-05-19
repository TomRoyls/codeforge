import chalk from 'chalk'

import type { CompareResult, FileStats } from './compare-helpers.js'

// ─── Shared helpers ──────────────────────────────────────

function padRight(str: string, len: number): string {
  if (str.length >= len) return str
  return str + ' '.repeat(len - str.length)
}

function formatDiffValue(diff: number): string {
  if (diff > 0) return chalk.green(`+${diff}`)
  if (diff < 0) return chalk.red(String(diff))
  return chalk.dim('0')
}

function sectionHeader(title: string): string {
  return `\n${chalk.bold(title)}\n${chalk.dim('─'.repeat(40))}`
}

// ─── formatCompareTable ──────────────────────────────────

/**
 * Format a comparison result as a colorized table.
 *
 * @example
 * ```ts
 * const table = formatCompareTable(result, false)
 * console.log(table)
 * ```
 */
export function formatCompareTable(result: CompareResult, verbose: boolean): string {
  const lines: string[] = [
    chalk.bold('\n📊 File Comparison Report\n'),
    `${chalk.bold('File 1:')} ${chalk.cyan(result.file1.filePath)}`,
    `${chalk.bold('File 2:')} ${chalk.cyan(result.file2.filePath)}`,
    '',
    chalk.dim('Metric                  | File 1          | File 2          | Diff'),
    chalk.dim('─'.repeat(72)),
  ]

  for (const metric of result.metrics) {
    const name = padRight(metric.name, 24)
    const v1 = padRight(String(metric.file1Value), 16)
    const v2 = padRight(String(metric.file2Value), 16)
    const diffStr = formatDiffValue(Number(metric.diff))
    lines.push(`${name} | ${v1} | ${v2} | ${diffStr}`)
  }

  const similarityPct = (result.similarity * 100).toFixed(1)
  lines.push('')
  lines.push(`${chalk.bold('Similarity:')} ${chalk.yellow(similarityPct)}%`)

  if (verbose) {
    lines.push(sectionHeader('File 1 Imports'))
    appendList(lines, result.file1.imports)
    lines.push(sectionHeader('File 2 Imports'))
    appendList(lines, result.file2.imports)
    lines.push(sectionHeader('File 1 Exports'))
    appendList(lines, result.file1.exports)
    lines.push(sectionHeader('File 2 Exports'))
    appendList(lines, result.file2.exports)
    lines.push(sectionHeader('File 1 Functions'))
    appendList(lines, result.file1.functions)
    lines.push(sectionHeader('File 2 Functions'))
    appendList(lines, result.file2.functions)
  }

  return lines.join('\n')
}

function appendList(lines: string[], items: string[]): void {
  if (items.length === 0) {
    lines.push(chalk.dim('  (none)'))
    return
  }
  for (const item of items) {
    lines.push(`  ${chalk.dim('•')} ${item}`)
  }
}

// ─── formatCompareSideBySide ─────────────────────────────

/**
 * Format a comparison result as a side-by-side view.
 *
 * @example
 * ```ts
 * const view = formatCompareSideBySide(result)
 * console.log(view)
 * ```
 */
export function formatCompareSideBySide(result: CompareResult): string {
  const lines: string[] = [
    chalk.bold('\n📊 Side-by-Side Comparison\n'),
  ]

  const colWidth = 36
  const left = chalk.bold(padRight(`File 1: ${result.file1.filePath}`, colWidth))
  const right = chalk.bold(`File 2: ${result.file2.filePath}`)
  lines.push(`${left} | ${right}`)
  lines.push(chalk.dim('─'.repeat(76)))

  const statsFields: Array<{ label: string; value: (s: FileStats) => string }> = [
    { label: 'Size (bytes)', value: (s) => String(s.size) },
    { label: 'Total Lines', value: (s) => String(s.totalLines) },
    { label: 'Code Lines', value: (s) => String(s.codeLines) },
    { label: 'Blank Lines', value: (s) => String(s.blankLines) },
    { label: 'Comment Lines', value: (s) => String(s.commentLines) },
    { label: 'Imports', value: (s) => String(s.imports.length) },
    { label: 'Exports', value: (s) => String(s.exports.length) },
    { label: 'Functions', value: (s) => String(s.functions.length) },
  ]

  for (const field of statsFields) {
    const v1 = field.value(result.file1)
    const v2 = field.value(result.file2)
    const same = v1 === v2

    const leftVal = padRight(`${field.label}: ${v1}`, colWidth)
    const rightVal = same ? `${field.label}: ${v2}` : chalk.bold(`${field.label}: ${v2}`)

    lines.push(`${leftVal} | ${rightVal}`)
  }

  const similarityPct = (result.similarity * 100).toFixed(1)
  lines.push('')
  lines.push(`${chalk.bold('Similarity:')} ${chalk.yellow(similarityPct)}%`)

  return lines.join('\n')
}

// ─── formatCompareJson ───────────────────────────────────

/**
 * Format a comparison result as pretty-printed JSON.
 *
 * @example
 * ```ts
 * const json = formatCompareJson(result)
 * console.log(json)
 * ```
 */
export function formatCompareJson(result: CompareResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── formatDiffView ──────────────────────────────────────

/**
 * Show a simple diff between two file contents with context.
 *
 * Lines only in content1 are prefixed with `-` (red).
 * Lines only in content2 are prefixed with `+` (green).
 * Common lines have no prefix (dim).
 * Shows 2 lines of context around changes.
 *
 * @example
 * ```ts
 * const diff = formatDiffView(contentA, contentB, 'a.ts', 'b.ts')
 * console.log(diff)
 * ```
 */
export function formatDiffView(
  content1: string,
  content2: string,
  file1Name: string,
  file2Name: string,
): string {
  const lines1 = content1.split('\n')
  const lines2 = content2.split('\n')

  const set1Lookup = new Set(lines1.map((l) => l.trim()))
  const set2Lookup = new Set(lines2.map((l) => l.trim()))

  const allLines = new Set<string>()
  for (const l of lines1) {
    allLines.add(l.trim())
  }
  for (const l of lines2) {
    allLines.add(l.trim())
  }

  const onlyInFile1 = new Set<string>()
  for (const l of lines1) {
    const trimmed = l.trim()
    if (!set2Lookup.has(trimmed)) {
      onlyInFile1.add(trimmed)
    }
  }

  const onlyInFile2 = new Set<string>()
  for (const l of lines2) {
    const trimmed = l.trim()
    if (!set1Lookup.has(trimmed)) {
      onlyInFile2.add(trimmed)
    }
  }

  const output: string[] = [
    chalk.bold('\n📝 Diff View\n'),
    `${chalk.red(`--- ${file1Name}`)}`,
    `${chalk.green(`+++ ${file2Name}`)}`,
    '',
  ]

  const combined = Array.from(allLines)
  const contextSize = 2
  const changeIndices: number[] = []

  for (let i = 0; i < combined.length; i++) {
    const line = combined[i]!
    if (onlyInFile1.has(line) || onlyInFile2.has(line)) {
      changeIndices.push(i)
    }
  }

  const showIndices = new Set<number>()
  for (const idx of changeIndices) {
    for (let c = Math.max(0, idx - contextSize); c <= Math.min(combined.length - 1, idx + contextSize); c++) {
      showIndices.add(c)
    }
  }

  const sortedIndices = Array.from(showIndices).sort((a, b) => a - b)

  let lastIndex = -2
  for (const idx of sortedIndices) {
    if (idx > lastIndex + 1 && lastIndex >= 0) {
      output.push(chalk.dim('  ...'))
    }

    const line = combined[idx]!
    if (onlyInFile1.has(line)) {
      output.push(chalk.red(`- ${line}`))
    } else if (onlyInFile2.has(line)) {
      output.push(chalk.green(`+ ${line}`))
    } else {
      output.push(chalk.dim(`  ${line}`))
    }

    lastIndex = idx
  }

  return output.join('\n')
}
