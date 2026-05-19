import chalk from 'chalk'

import type { FileFunctionStats, FuncSizeResult, FunctionInfo, SizeCategory, SizeDistribution } from './func-size-helpers.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Color for a size category.
 *
 * @example
 * sizeCategoryColor('tiny') // green
 * sizeCategoryColor('huge') // red
 */
export function sizeCategoryColor(category: SizeCategory): string {
  switch (category) {
    case 'tiny': return chalk.green(category)
    case 'small': return chalk.cyan(category)
    case 'medium': return chalk.yellow(category)
    case 'large': return chalk.rgb(255, 165, 0)(category)
    case 'huge': return chalk.red(category)
  }
}

/**
 * Generate a horizontal ASCII bar.
 *
 * @example
 * horizontalBar(8, 20) // '████████░░░░░░░░░░░░'
 */
export function horizontalBar(value: number, max: number, width: number = 20): string {
  if (max === 0) return chalk.dim('░'.repeat(width))
  const filled = Math.round((value / max) * width)
  return chalk.green('█'.repeat(filled)) + chalk.dim('░'.repeat(width - filled))
}

// ─── Distribution Format ──────────────────────────────────────────────────────

/**
 * Format the size distribution as an ASCII histogram.
 *
 * @example
 * formatDistribution(dist) // colored histogram with stats
 */
export function formatDistribution(dist: SizeDistribution): string {
  const lines: string[] = []
  const maxCount = Math.max(dist.tiny, dist.small, dist.medium, dist.large, dist.huge, 1)

  const categories: { label: string; value: number; range: string }[] = [
    { label: 'tiny', value: dist.tiny, range: '(1-5)' },
    { label: 'small', value: dist.small, range: '(6-15)' },
    { label: 'medium', value: dist.medium, range: '(16-30)' },
    { label: 'large', value: dist.large, range: '(31-60)' },
    { label: 'huge', value: dist.huge, range: '(60+)' },
  ]

  for (const cat of categories) {
    const bar = horizontalBar(cat.value, maxCount, 25)
    const count = String(cat.value).padStart(4)
    lines.push(`  ${chalk.bold(cat.label.padEnd(8))} ${chalk.dim(cat.range.padEnd(8))} ${count} ${bar}`)
  }

  lines.push('')
  lines.push(`  ${chalk.dim('Total:')} ${dist.total}  ${chalk.dim('Avg:')} ${dist.average}  ${chalk.dim('Median:')} ${dist.median}  ${chalk.dim('P95:')} ${dist.p95}  ${chalk.dim('Max:')} ${dist.max}`)

  return lines.join('\n')
}

// ─── Function Table ───────────────────────────────────────────────────────────

/**
 * Format a single function row for oversized table.
 *
 * @example
 * formatOversizedRow(fn) // '  foo  test.ts  45 lines  medium  ...'
 */
export function formatOversizedRow(fn: FunctionInfo): string {
  const sizeStr = `${fn.lineCount} lines`
  const category = sizeCategoryColor(fn.sizeCategory)
  const asyncTag = fn.isAsync ? chalk.cyan('[async]') : ''
  const exportTag = fn.isExported ? chalk.green('[export]') : ''
  return `  ${chalk.bold(fn.name.padEnd(25))} ${chalk.dim(fn.file.padEnd(30))} ${sizeStr.padEnd(10)} ${category.padEnd(10)} ${asyncTag} ${exportTag}`
}

// ─── File Stats Format ────────────────────────────────────────────────────────

/**
 * Format file statistics table.
 *
 * @example
 * formatFileStats(stats) // colored per-file table
 */
export function formatFileStats(stats: FileFunctionStats[]): string {
  const lines: string[] = []
  for (const s of stats.slice(0, 10)) {
    const oversizedTag = s.oversizedCount > 0 ? chalk.red(`(${s.oversizedCount} oversized)`) : ''
    lines.push(`  ${chalk.dim(s.file.padEnd(35))} ${String(s.functionCount).padStart(3)} fns  avg ${String(s.averageSize).padStart(5)} lines  max ${String(s.maxSize).padStart(3)} ${oversizedTag}`)
  }
  return lines.join('\n')
}

// ─── Table Format ─────────────────────────────────────────────────────────────

/**
 * Format the complete function size analysis as a table.
 *
 * @example
 * formatFuncSizeTable(result) // full colored terminal output
 */
export function formatFuncSizeTable(result: FuncSizeResult, verbose?: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.bold.underline('Function Size Distribution'))
  lines.push('')

  lines.push(chalk.bold('Overview:'))
  lines.push(`  ${chalk.dim('Total functions:')} ${result.stats.totalFunctions}`)
  lines.push(`  ${chalk.dim('Files analyzed:')}  ${result.stats.totalFiles}`)
  lines.push(`  ${chalk.dim('Exported:')}        ${result.stats.exportedFunctions}`)
  lines.push(`  ${chalk.dim('Async:')}           ${result.stats.asyncFunctions}`)
  lines.push(`  ${chalk.dim('Avg params:')}      ${result.stats.averageParameters}`)
  lines.push('')

  lines.push(chalk.bold('Size Distribution:'))
  lines.push(formatDistribution(result.distribution))
  lines.push('')

  if (result.oversizedFunctions.length > 0) {
    lines.push(chalk.bold.red(`Oversized Functions (>${result.oversizedFunctions[0]?.lineCount ?? 0} lines):`))
    for (const fn of result.oversizedFunctions.slice(0, 20)) {
      lines.push(formatOversizedRow(fn))
    }
    lines.push('')
  }

  if (verbose && result.fileStats.length > 0) {
    lines.push(chalk.bold('Per-File Stats:'))
    lines.push(formatFileStats(result.fileStats))
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.bold('Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`  ${chalk.rgb(255, 165, 0)('→')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

// ─── JSON Format ──────────────────────────────────────────────────────────────

/**
 * Format function size analysis as JSON.
 *
 * @example
 * formatFuncSizeJson(result) // '{"functions":[...],...}'
 */
export function formatFuncSizeJson(result: FuncSizeResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── CSV Format ───────────────────────────────────────────────────────────────

/**
 * Format function size analysis as CSV.
 *
 * @example
 * formatFuncSizeCsv(result)
 * // 'name,file,lineCount,parameterCount,...'
 */
export function formatFuncSizeCsv(result: FuncSizeResult): string {
  const header = 'name,file,lineStart,lineEnd,lineCount,parameterCount,nestingDepth,complexity,isExported,isAsync,type,sizeCategory'
  const rows = result.functions.map((fn) =>
    `"${fn.name}","${fn.file}",${fn.lineStart},${fn.lineEnd},${fn.lineCount},${fn.parameterCount},${fn.nestingDepth},${fn.complexity},${fn.isExported},${fn.isAsync},"${fn.type}","${fn.sizeCategory}"`
  )
  return [header, ...rows].join('\n')
}
