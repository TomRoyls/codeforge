import chalk from 'chalk'

import type { BundleNode, BundleVisualization, BundleVizStats, SizeBucket, TreemapBlock } from './bundle-visualizer-helpers.js'
import { formatBytes } from './bundle-visualizer-helpers.js'

// ─── blockChar ──────────────────────────────────────────

/**
 * @example
 * const ch = blockChar('red')
 * console.log(ch)
 */
export function blockChar(color: string): string {
  switch (color) {
    case 'red': return '██'
    case 'yellow': return '▓▓'
    case 'cyan': return '▒▒'
    case 'magenta': return '░░'
    default: return '··'
  }
}

// ─── renderTreemap ──────────────────────────────────────

/**
 * @example
 * const lines = renderTreemap(viz)
 * console.log(lines.length)
 */
export function renderTreemap(viz: BundleVisualization): string[] {
  const { layout } = viz
  const lines: string[] = []

  for (let row = 0; row < layout.height; row++) {
    let line = ''
    for (let col = 0; col < layout.width; col++) {
      const block = findBlock(layout.blocks, col, row)
      if (block) {
        line += chalkBlock(block.color, blockChar(block.color))
      } else {
        line += ' '
      }
    }
    lines.push(line)
  }

  return lines
}

function findBlock(blocks: TreemapBlock[], col: number, row: number): TreemapBlock | undefined {
  for (const b of blocks) {
    if (col >= b.x && col < b.x + b.width && row >= b.y && row < b.y + b.height) {
      return b
    }
  }
  return undefined
}

function chalkBlock(color: string, ch: string): string {
  switch (color) {
    case 'red': return chalk.red(ch)
    case 'yellow': return chalk.rgb(255, 165, 0)(ch)
    case 'cyan': return chalk.cyan(ch)
    case 'green': return chalk.green(ch)
    case 'magenta': return chalk.magenta(ch)
    case 'blue': return chalk.blue(ch)
    default: return chalk.gray(ch)
  }
}

// ─── formatTopFiles ─────────────────────────────────────

/**
 * @example
 * const text = formatTopFiles(topFiles)
 * console.log(text)
 */
export function formatTopFiles(topFiles: BundleNode[]): string {
  if (topFiles.length === 0) return chalk.gray('No files found')

  const lines: string[] = []
  lines.push('')
  lines.push(chalk.bold.underline('Top Files by Size'))
  lines.push('')

  const maxNameLen = Math.max(...topFiles.map((f) => f.name.length), 10)

  for (const file of topFiles) {
    const bar = sizeBar(file.percentage, 20)
    lines.push(
      `  ${chalk.bold(file.name.padEnd(maxNameLen))}  ${formatBytes(file.rawSize).padStart(10)}  ${bar}  ${file.percentage.toFixed(1)}%`,
    )
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

// ─── formatDistribution ─────────────────────────────────

/**
 * @example
 * const text = formatDistribution(buckets)
 * console.log(text)
 */
export function formatDistribution(buckets: SizeBucket[]): string {
  const lines: string[] = []
  lines.push('')
  lines.push(chalk.bold.underline('Size Distribution'))
  lines.push('')

  const maxCount = Math.max(...buckets.map((b) => b.count), 1)
  for (const bucket of buckets) {
    const barWidth = Math.round((bucket.count / maxCount) * 30)
    const bar = '█'.repeat(barWidth)
    lines.push(`  ${bucket.range.padEnd(10)} ${chalk.cyan(bar)} ${bucket.count}`)
  }

  return lines.join('\n')
}

// ─── formatVizStats ─────────────────────────────────────

/**
 * @example
 * const text = formatVizStats(stats)
 * console.log(text)
 */
export function formatVizStats(stats: BundleVizStats): string {
  const lines: string[] = []
  lines.push('')
  lines.push(chalk.bold.underline('Stats'))
  lines.push(`  Total size:      ${formatBytes(stats.totalSize)}`)
  lines.push(`  Minified (est):  ${formatBytes(stats.totalMinified)}`)
  lines.push(`  Gzipped (est):   ${formatBytes(stats.totalGzipped)}`)
  lines.push(`  Files:           ${stats.fileCount}`)
  lines.push(`  Directories:     ${stats.dirCount}`)
  lines.push(`  Avg file size:   ${formatBytes(stats.avgFileSize)}`)
  if (stats.largestFile) {
    lines.push(`  Largest file:    ${stats.largestFile.name} (${formatBytes(stats.largestFile.rawSize)})`)
  }
  if (stats.smallestFile) {
    lines.push(`  Smallest file:   ${stats.smallestFile.name} (${formatBytes(stats.smallestFile.rawSize)})`)
  }
  return lines.join('\n')
}

// ─── formatBundleTable ──────────────────────────────────

/**
 * @example
 * const text = formatBundleTable(viz)
 * console.log(text.length)
 */
export function formatBundleTable(viz: BundleVisualization): string {
  const parts: string[] = []

  const treemap = renderTreemap(viz)
  parts.push(treemap.join('\n'))

  parts.push(formatTopFiles(viz.topFiles))
  parts.push(formatDistribution(viz.stats.sizeDistribution))
  parts.push(formatVizStats(viz.stats))
  parts.push('')

  return parts.join('\n')
}

// ─── formatBundleJson ───────────────────────────────────

/**
 * @example
 * const json = formatBundleJson(viz)
 * console.log(JSON.parse(json).stats.fileCount)
 */
export function formatBundleJson(viz: BundleVisualization): string {
  return JSON.stringify(viz, null, 2)
}
