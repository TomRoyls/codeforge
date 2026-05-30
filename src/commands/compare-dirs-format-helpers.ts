import chalk from 'chalk'

import type { DirComparison, FileDiff } from './compare-dirs-helpers.js'
import { formatBytesCompact as formatBytes, padRight, padLeft } from '../utils/format-utils.js'

// ─── Utility ──────────────────────────────────────────────

// ─── Diff formatting ──────────────────────────────────────

/**
 * Format a numeric diff value with color.
 *
 * @example
 * ```ts
 * formatDiff(5)   // green "+5"
 * formatDiff(-3)  // red "-3"
 * formatDiff(0)   // dim "0"
 * ```
 */
export function formatDiff(value: number): string {
  if (value > 0) return chalk.green(`+${value}`)
  if (value < 0) return chalk.red(String(value))
  return chalk.dim('0')
}

// ─── Similarity bar ───────────────────────────────────────

/**
 * Format similarity score as a colored bar.
 *
 * @example
 * ```ts
 * formatSimilarity(100) // green filled bar
 * formatSimilarity(50)  // yellow half bar
 * formatSimilarity(0)   // red empty bar
 * ```
 */
export function formatSimilarity(score: number): string {
  const barWidth = 20
  const filled = Math.round((score / 100) * barWidth)
  const empty = barWidth - filled

  const filledBar = '█'.repeat(filled)
  const emptyBar = '░'.repeat(empty)

  let color: (s: string) => string
  if (score >= 80) {
    color = chalk.green
  } else if (score >= 50) {
    color = chalk.yellow
  } else {
    color = chalk.red
  }

  return `${color(filledBar)}${chalk.dim(emptyBar)} ${color(`${score}%`)}`
}

// ─── Table formatting ─────────────────────────────────────

/**
 * Format a DirComparison result as a table with chalk colors.
 *
 * @example
 * ```ts
 * const output = formatComparisonTable(result, false)
 * console.log(output)
 * ```
 */
export function formatComparisonTable(result: DirComparison, verbose: boolean): string {
  const lines: string[] = [chalk.bold('\n📁 Directory Comparison Report'), '']

  // ─── Summary
  lines.push(chalk.bold('Similarity: ') + formatSimilarity(result.similarity))
  lines.push(
    `${chalk.cyan(result.dir1.path)} vs ${chalk.cyan(result.dir2.path)}`,
  )
  lines.push('')

  // ─── Files only in dir1
  if (result.onlyInDir1.length > 0) {
    lines.push(chalk.red.bold(`Only in ${result.dir1.path} (${result.onlyInDir1.length}):`))
    for (const f of result.onlyInDir1) {
      lines.push(`  ${chalk.red('- ' + f)}`)
    }
    lines.push('')
  }

  // ─── Files only in dir2
  if (result.onlyInDir2.length > 0) {
    lines.push(chalk.green.bold(`Only in ${result.dir2.path} (${result.onlyInDir2.length}):`))
    for (const f of result.onlyInDir2) {
      lines.push(`  ${chalk.green('+ ' + f)}`)
    }
    lines.push('')
  }

  // ─── Modified files table
  if (result.modified.length > 0) {
    lines.push(chalk.yellow.bold(`Modified files (${result.modified.length}):`))
    lines.push('')

    const colFile = Math.max(20, ...result.modified.map((d) => d.relativePath.length))
    const colStatus = 10
    const colSize = 12
    const colLines = 12

    lines.push(
      chalk.cyan(padRight('File', colFile)) +
        '  ' +
        chalk.cyan(padLeft('Status', colStatus)) +
        '  ' +
        chalk.cyan(padLeft('Size Diff', colSize)) +
        '  ' +
        chalk.cyan(padLeft('Lines Diff', colLines)),
    )
    lines.push(chalk.dim('─'.repeat(colFile + colStatus + colSize + colLines + 6)))

    for (const diff of result.modified) {
      const sizeStr = formatSizeDiff(diff.sizeDiff)
      const linesStr = formatDiff(diff.linesDiff)

      lines.push(
        padRight(diff.relativePath, colFile) +
          '  ' +
          padLeft(diff.status, colStatus) +
          '  ' +
          padLeft(sizeStr, colSize) +
          '  ' +
          padLeft(linesStr, colLines),
      )
    }
    lines.push('')
  }

  // ─── Stats summary
  const s = result.stats
  lines.push(chalk.bold('Stats:'))
  lines.push(`  Total files: ${s.totalFilesDir1} vs ${s.totalFilesDir2}`)
  lines.push(`  Unique to dir1: ${chalk.red(String(s.uniqueToDir1))}`)
  lines.push(`  Unique to dir2: ${chalk.green(String(s.uniqueToDir2))}`)
  lines.push(`  Common files: ${s.common}`)
  lines.push(`  Identical: ${chalk.green(String(s.identical))}`)
  lines.push(`  Modified: ${chalk.yellow(String(s.modified))}`)
  lines.push(`  Added lines: ${chalk.green(`+${s.addedLines}`)}`)
  lines.push(`  Removed lines: ${chalk.red(`-${s.removedLines}`)}`)
  lines.push(`  Size difference: ${formatBytes(s.sizeDifference)}`)

  if (verbose && result.common.length > 0) {
    lines.push('')
    lines.push(chalk.bold('All common files:'))
    for (const f of result.common) {
      const diff = result.modified.find((d) => d.relativePath === f)
      if (diff) {
        lines.push(`  ${chalk.yellow('M')} ${f}`)
      } else {
        lines.push(`  ${chalk.green('=')} ${f}`)
      }
    }
  }

  return lines.join('\n')
}

function formatSizeDiff(bytes: number): string {
  if (bytes > 0) return chalk.green(`+${bytes}B`)
  if (bytes < 0) return chalk.red(`${bytes}B`)
  return chalk.dim('0B')
}

// ─── JSON formatting ──────────────────────────────────────

/**
 * Format a DirComparison result as JSON.
 *
 * @example
 * ```ts
 * const json = formatComparisonJson(result)
 * console.log(json)
 * ```
 */
export function formatComparisonJson(result: DirComparison): string {
  const serializable = {
    common: result.common,
    dir1: {
      path: result.dir1.path,
      totalFiles: result.dir1.totalFiles,
      totalLines: result.dir1.totalLines,
      totalSize: result.dir1.totalSize,
    },
    dir2: {
      path: result.dir2.path,
      totalFiles: result.dir2.totalFiles,
      totalLines: result.dir2.totalLines,
      totalSize: result.dir2.totalSize,
    },
    modified: result.modified.map((d: FileDiff) => ({
      dir1Lines: d.dir1Lines,
      dir1Size: d.dir1Size,
      dir2Lines: d.dir2Lines,
      dir2Size: d.dir2Size,
      linesDiff: d.linesDiff,
      relativePath: d.relativePath,
      sizeDiff: d.sizeDiff,
      status: d.status,
    })),
    onlyInDir1: result.onlyInDir1,
    onlyInDir2: result.onlyInDir2,
    sameCount: result.sameCount,
    similarity: result.similarity,
    stats: result.stats,
  }

  return JSON.stringify(serializable, null, 2)
}
