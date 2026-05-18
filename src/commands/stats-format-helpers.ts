import chalk from 'chalk'

import type { StatsResult } from './stats-helpers.js'
import { formatNumber } from '../utils/format-utils.js'

export function formatCsv(stats: StatsResult): string {
  const headers = ['File', 'LOC', 'Complexity', 'Size (bytes)', 'Type']
  const rows = stats.files.map((f) => [
    f.name,
    f.loc.toString(),
    f.complexity.toString(),
    f.size.toString(),
    f.type,
  ])
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
}

export function formatTable(stats: StatsResult, top: number): string {
  const { summary } = stats

  const lines = [
    chalk.bold('\n📊 Codebase Statistics\n'),
    chalk.dim('Summary:'),
    `  Total files: ${summary.files}`,
    `  Lines of code: ${formatNumber(summary.loc)}`,
    `  Total complexity: ${formatNumber(summary.complexity)}`,
    `  Blank lines: ${formatNumber(summary.blankLines)}`,
    `  Comment lines: ${formatNumber(summary.commentLines)}`,
    '',
    chalk.dim('Code structures:'),
    `  Classes: ${summary.classes}`,
    `  Functions: ${summary.functions}`,
    `  Methods: ${summary.methods}`,
    `  Interfaces: ${summary.interfaces}`,
    `  Type aliases: ${summary.typeAliases}`,
    `  Enums: ${summary.enums}`,
    '',
    chalk.dim('File Types:'),
    ...Object.entries(stats.fileTypes).map(([ext, count]) => `  ${ext}: ${count}`),
    '',
    chalk.dim(`Top ${top} Largest Files:`),
    ...stats.files
      .slice(0, top)
      .flatMap((file) => [
        `  ${file.name}`,
        `    LOC: ${file.loc}, Complexity: ${file.complexity}, Size: ${file.size} bytes`,
      ]),
  ]

  return lines.join('\n')
}

export function formatOutput(stats: StatsResult, format: string, top: number): string {
  if (format === 'csv') {
    return formatCsv(stats)
  }

  return formatTable(stats, top)
}
