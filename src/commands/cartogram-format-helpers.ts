import chalk from 'chalk'

import type { CartogramResult, CartogramStats, CartogramView, ComparisonView, Region } from './cartogram-helpers.js'

// ─── ASCII Cartogram ──────────────────────────────────────────────────────────

/**
 * Format ASCII cartogram blocks.
 *
 * @example
 * formatCartogramBlocks(view)
 */
export function formatCartogramBlocks(view: CartogramView): string {
  if (view.regions.length === 0) return chalk.gray('  No regions')

  const lines: string[] = []
  lines.push(chalk.bold(`  ${view.name}`))
  lines.push(chalk.gray(`  ${view.description}`))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  for (const r of view.regions) {
    const color = r.color === 'bright'
      ? chalk.rgb(220, 50, 50)
      : r.color === 'medium'
        ? chalk.rgb(255, 165, 0)
        : chalk.rgb(100, 200, 100)

    const bar = '█'.repeat(r.area)
    lines.push(`  ${chalk.dim(r.name.padEnd(25))} ${color(bar)} ${r.value} (${r.percentage}%)`)
  }

  const distColor = view.distribution === 'extreme'
    ? chalk.rgb(220, 50, 50)
    : view.distribution === 'concentrated'
      ? chalk.rgb(255, 165, 0)
      : chalk.rgb(100, 200, 100)

  lines.push(`  ${chalk.dim('Distribution:')} ${distColor(view.distribution)}`)
  lines.push('')
  return lines.join('\n')
}

// ─── All Views ────────────────────────────────────────────────────────────────

/**
 * Format all cartogram views.
 *
 * @example
 * formatAllViews(views)
 */
export function formatAllViews(views: CartogramView[]): string {
  return views.map((v) => formatCartogramBlocks(v)).join('\n')
}

// ─── Comparison Table ─────────────────────────────────────────────────────────

/**
 * Format comparison table.
 *
 * @example
 * formatComparisonTable(comparison)
 */
export function formatComparisonTable(comparison: ComparisonView[]): string {
  if (comparison.length === 0) return chalk.gray('  No comparison data')

  const lines: string[] = []
  lines.push(chalk.bold('  Region Comparison'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  for (const c of comparison) {
    lines.push(`  ${chalk.bold(c.region)}`)
    lines.push(`    Dominant: ${chalk.rgb(100, 200, 100)(c.dominant)}  Weakest: ${chalk.rgb(220, 50, 50)(c.weakest)}`)

    const entries = Object.entries(c.metrics).sort(([, a], [, b]) => b - a)
    for (const [key, val] of entries) {
      lines.push(`    ${chalk.dim(key.padEnd(20))} ${val}`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

// ─── Balance Meter ─────────────────────────────────────────────────────────────

/**
 * Format balance meter.
 *
 * @example
 * formatBalanceMeter(75)
 */
export function formatBalanceMeter(balance: number): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Codebase Balance'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  const filled = Math.round(balance / 5)
  const empty = 20 - filled
  const bar = '█'.repeat(filled) + '░'.repeat(empty)
  const color = balance > 70
    ? chalk.rgb(50, 205, 50)
    : balance > 40
      ? chalk.rgb(255, 165, 0)
      : chalk.rgb(220, 50, 50)

  lines.push(`  ${color(bar)} ${balance}/100`)
  lines.push('')
  return lines.join('\n')
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

/**
 * Format cartogram stats.
 *
 * @example
 * formatCartogramStats(stats)
 */
export function formatCartogramStats(stats: CartogramStats): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Cartogram Stats'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))
  lines.push(`  Regions:            ${stats.regionCount}`)
  lines.push(`  Views:              ${stats.viewCount}`)
  lines.push(`  Most balanced:      ${stats.mostBalancedRegion}`)
  lines.push(`  Least balanced:     ${stats.leastBalancedRegion}`)
  lines.push(`  Overall balance:    ${stats.overallBalance}/100`)
  lines.push(`  Dominant region:    ${stats.dominantRegion}`)
  lines.push(`  Smallest region:    ${stats.smallestRegion}`)
  lines.push('')
  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatRecommendations(['Split region X'])
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.gray('  No recommendations')

  const lines: string[] = []
  lines.push(chalk.bold('  Recommendations'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  for (let i = 0; i < recs.length; i++) {
    lines.push(`  ${chalk.bold(`${i + 1}.`)} ${recs[i]}`)
  }

  lines.push('')
  return lines.join('\n')
}

// ─── Region Overview ───────────────────────────────────────────────────────────

/**
 * Format region overview.
 *
 * @example
 * formatRegionOverview(regions)
 */
export function formatRegionOverview(regions: Region[]): string {
  if (regions.length === 0) return chalk.gray('  No regions')

  const lines: string[] = []
  lines.push(chalk.bold('  Regions'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  for (const r of regions) {
    lines.push(`  ${chalk.bold(r.name)} ${chalk.dim(`(${r.files.length} files)`)}`)
    lines.push(`    LoC: ${r.metrics.linesOfCode}  Complexity: ${r.metrics.complexity}  Functions: ${r.metrics.functionCount}`)
    lines.push(`    Tests: ${r.metrics.testCount}  Dependencies: ${r.metrics.dependencyCount}  Exports: ${r.metrics.exportCount}`)
    const riskColor = r.metrics.bugRiskScore > 60 ? chalk.rgb(220, 50, 50) : r.metrics.bugRiskScore > 30 ? chalk.rgb(255, 165, 0) : chalk.rgb(100, 200, 100)
    lines.push(`    Bug Risk: ${riskColor(String(r.metrics.bugRiskScore))}/100`)
  }

  lines.push('')
  return lines.join('\n')
}

// ─── Full Table ────────────────────────────────────────────────────────────────

/**
 * Format full cartogram table.
 *
 * @example
 * formatCartogramTable(result)
 */
export function formatCartogramTable(result: CartogramResult): string {
  const parts: string[] = []
  parts.push(formatRegionOverview(result.regions))
  parts.push(formatAllViews(result.views))
  parts.push(formatComparisonTable(result.comparison))
  parts.push(formatBalanceMeter(result.stats.overallBalance))
  parts.push(formatCartogramStats(result.stats))
  parts.push(formatRecommendations(result.recommendations))
  return parts.join('\n')
}

// ─── JSON ──────────────────────────────────────────────────────────────────────

/**
 * Format cartogram result as JSON.
 *
 * @example
 * formatCartogramJSON(result)
 */
export function formatCartogramJSON(result: CartogramResult): string {
  return JSON.stringify(result, null, 2)
}
