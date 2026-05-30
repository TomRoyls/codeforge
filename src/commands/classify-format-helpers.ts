import chalk from 'chalk'

import type { ClassCategory, ClassificationResult, ClassificationStats } from './classify-helpers.js'
import { formatBytes } from './classify-helpers.js'

// ─── categoryColor ──────────────────────────────────────

/**
 * @example
 * const c = categoryColor('source')
 * console.log(c)
 */
export function categoryColor(category: string): (t: string) => string {
  switch (category) {
    case 'source': return chalk.cyan
    case 'test': return chalk.green
    case 'config': return chalk.yellow
    case 'documentation': return chalk.blue
    case 'build': return chalk.rgb(255, 165, 0)
    case 'asset': return chalk.magenta
    case 'generated': return chalk.gray
    case 'vendor': return chalk.red
    case 'script': return chalk.rgb(255, 200, 100)
    case 'ci': return chalk.rgb(100, 200, 255)
    case 'style': return chalk.rgb(255, 100, 200)
    case 'data': return chalk.rgb(150, 255, 150)
    default: return chalk.white
  }
}

// ─── formatCategoryTable ────────────────────────────────

/**
 * @example
 * const text = formatCategoryTable(categories)
 * console.log(text.length)
 */
export function formatCategoryTable(categories: ClassCategory[]): string {
  if (categories.length === 0) return chalk.gray('No files classified')

  const lines: string[] = []
  lines.push(chalk.bold.underline('File Classification'))
  lines.push('')

  for (const cat of categories) {
    const color = categoryColor(cat.name)
    const bar = sizeBar(cat.percentage, 25)
    lines.push(`  ${cat.icon} ${color(cat.name.padEnd(14))} ${String(cat.count).padStart(5)} files  ${formatBytes(cat.totalSize).padStart(10)}  ${bar} ${cat.percentage.toFixed(1)}%`)
  }

  return lines.join('\n')
}

// ─── sizeBar ────────────────────────────────────────────

/**
 * @example
 * const bar = sizeBar(50, 20)
 * console.log(bar)
 */
export function sizeBar(pct: number, width: number): string {
  const filled = Math.round((pct / 100) * width)
  return '█'.repeat(Math.min(filled, width)) + '░'.repeat(Math.max(width - filled, 0))
}

// ─── formatFileList ─────────────────────────────────────

/**
 * @example
 * const text = formatFileList(categories)
 * console.log(text)
 */
export function formatFileList(categories: ClassCategory[]): string {
  const lines: string[] = []

  for (const cat of categories) {
    const color = categoryColor(cat.name)
    lines.push('')
    lines.push(`  ${cat.icon} ${chalk.bold(color(cat.name))} (${cat.count} files)`)
    for (const f of cat.files.slice(0, 10)) {
      const essential = f.isEssential ? chalk.yellow(' *') : ''
      lines.push(`    ${chalk.gray(f.filePath)}  ${chalk.gray(formatBytes(f.size))}${essential}`)
    }
    if (cat.files.length > 10) {
      lines.push(chalk.gray(`    ... and ${cat.files.length - 10} more`))
    }
  }

  return lines.join('\n')
}

// ─── formatStats ────────────────────────────────────────

/**
 * @example
 * const text = formatStats(stats)
 * console.log(text)
 */
export function formatStats(stats: ClassificationStats): string {
  const lines: string[] = []
  lines.push('')
  lines.push(chalk.bold.underline('Summary'))
  lines.push(`  Total files: ${stats.totalFiles}`)
  lines.push(`  Total size: ${formatBytes(stats.totalSize)}`)
  lines.push(`  Total lines: ${stats.totalLines.toLocaleString()}`)
  lines.push(`  Essential files: ${stats.essentialFiles}`)
  lines.push(`  Largest category: ${stats.largestCategory}`)
  lines.push(`  Smallest category: ${stats.smallestCategory}`)

  const counts = Object.entries(stats.categoryCounts)
  if (counts.length > 0) {
    lines.push('')
    lines.push(chalk.bold('  Category Breakdown:'))
    for (const [cat, count] of counts) {
      const color = categoryColor(cat)
      lines.push(`    ${color(cat)}: ${count}`)
    }
  }

  return lines.join('\n')
}

// ─── formatRecommendations ──────────────────────────────

/**
 * @example
 * const text = formatRecommendations(['Add tests'])
 * console.log(text)
 */
export function formatRecommendations(recs: string[]): string {
  const lines: string[] = []
  lines.push('')
  lines.push(chalk.bold.underline('Recommendations'))
  lines.push('')

  for (const r of recs) {
    lines.push(`  ${chalk.cyan('→')} ${r}`)
  }

  return lines.join('\n')
}

// ─── formatClassifyTable ────────────────────────────────

/**
 * @example
 * const text = formatClassifyTable(result)
 * console.log(text.length)
 */
export function formatClassifyTable(result: ClassificationResult): string {
  const parts: string[] = []

  parts.push(formatCategoryTable(result.categories))
  parts.push(formatFileList(result.categories))
  parts.push(formatStats(result.stats))
  parts.push(formatRecommendations(result.recommendations))
  parts.push('')

  return parts.join('\n')
}

// ─── formatClassifyJson ─────────────────────────────────

/**
 * @example
 * const json = formatClassifyJson(result)
 * console.log(JSON.parse(json).stats.totalFiles)
 */
export function formatClassifyJson(result: ClassificationResult): string {
  return JSON.stringify(result, null, 2)
}
