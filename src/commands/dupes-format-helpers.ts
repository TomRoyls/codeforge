import chalk from 'chalk'

import { formatNumber, formatPercentage } from '../utils/format-utils.js'
import type { DupesResult } from './dupes-helpers.js'

// ─── Table formatting ───────────────────────────────────

export function formatDupesTable(result: DupesResult, verbose: boolean): string {
  const { duplicateGroups, duplicateLines, duplicatePercentage, totalFiles, totalBlocks } = result
  const lines: string[] = [
    chalk.bold(`\n📋 Duplicate Code Report`),
    chalk.dim(`Files scanned: ${formatNumber(totalFiles)}`),
    chalk.dim(`Blocks analyzed: ${formatNumber(totalBlocks)}`),
  ]

  if (duplicateGroups.length === 0) {
    lines.push('')
    lines.push(chalk.green('No duplicate code blocks found.'))
    return lines.join('\n')
  }

  lines.push('')

  for (let i = 0; i < duplicateGroups.length; i++) {
    const group = duplicateGroups[i]!
    const similarityPct = Math.round(group.similarity * 100)

    let similarityColor: (text: string) => string
    if (similarityPct > 95) {
      similarityColor = chalk.red
    } else if (similarityPct >= 80) {
      similarityColor = chalk.yellow
    } else {
      similarityColor = chalk.green
    }

    lines.push(
      similarityColor(
        `Group ${i + 1}: ${similarityPct}% similar (${formatNumber(group.lines)} lines × ${formatNumber(group.blocks.length)} occurrences)`,
      ),
    )

    for (const block of group.blocks) {
      lines.push(
        `  ${chalk.cyan(block.filePath)} ${chalk.dim(`(lines ${block.startLine}-${block.endLine})`)}`,
      )

      if (verbose) {
        const previewLines = block.content.split('\n').slice(0, 3)
        for (const previewLine of previewLines) {
          lines.push(chalk.dim(`    | ${previewLine}`))
        }
      }
    }

    lines.push('')
  }

  lines.push(chalk.bold('Summary:'))
  lines.push(
    `  Duplicate lines: ${chalk.yellow(formatNumber(duplicateLines))} (${formatPercentage(duplicatePercentage)})`,
  )
  lines.push(`  Duplicate groups: ${chalk.yellow(formatNumber(duplicateGroups.length))}`)

  return lines.join('\n')
}

// ─── CSV formatting ─────────────────────────────────────

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function formatDupesCsv(result: DupesResult): string {
  const headers = ['File1', 'Line1', 'File2', 'Line2', 'Similarity', 'Lines']
  const rows: string[] = [headers.join(',')]

  for (const group of result.duplicateGroups) {
    for (let i = 0; i < group.blocks.length; i++) {
      for (let j = i + 1; j < group.blocks.length; j++) {
        const a = group.blocks[i]!
        const b = group.blocks[j]!
        rows.push(
          [
            escapeCsv(a.filePath),
            `${a.startLine}-${a.endLine}`,
            escapeCsv(b.filePath),
            `${b.startLine}-${b.endLine}`,
            String(Math.round(group.similarity * 100)),
            String(group.lines),
          ].join(','),
        )
      }
    }
  }

  return rows.join('\n')
}

// ─── JSON formatting ────────────────────────────────────

export function formatDupesJson(result: DupesResult): string {
  return JSON.stringify(result, null, 2)
}
