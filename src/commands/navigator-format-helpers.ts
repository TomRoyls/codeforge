import chalk from 'chalk'

import type {
  NavigationMap,
  NavigationNode,
  NavigatorResult,
  NavigatorStats,
  WayfindingScore,
} from './navigator-helpers.js'

// ─── Classification Colors ────────────────────────────────────────────────────

/**
 * Get node type color.
 *
 * @example
 * getNodeTypeColor('highway')
 */
export function getNodeTypeColor(type: string): (t: string) => string {
  const colors: Record<string, (t: string) => string> = {
    entry: chalk.rgb(76, 175, 80),
    deadEnd: chalk.rgb(244, 67, 54),
    highway: chalk.rgb(255, 193, 7),
    island: chalk.rgb(158, 158, 158),
    normal: chalk.white,
  }
  return colors[type] ?? chalk.white
}

/**
 * Format node type badge.
 *
 * @example
 * formatNodeTypeBadge(node)
 */
export function formatNodeTypeBadge(node: NavigationNode): string {
  if (node.isIsland) return getNodeTypeColor('island')('[ISLAND]')
  if (node.isEntryPoint) return getNodeTypeColor('entry')('[ENTRY]')
  if (node.isDeadEnd) return getNodeTypeColor('deadEnd')('[DEAD END]')
  if (node.isHighway) return getNodeTypeColor('highway')('[HIGHWAY]')
  return chalk.dim('[NODE]')
}

// ─── Complexity Meter ─────────────────────────────────────────────────────────

/**
 * Format complexity meter.
 *
 * @example
 * formatComplexityMeter(45)
 */
export function formatComplexityMeter(complexity: number): string {
  const filled = Math.round(complexity / 5)
  const empty = 20 - filled
  let colorFn: (t: string) => string
  if (complexity >= 70) colorFn = chalk.rgb(244, 67, 54)
  else if (complexity >= 40) colorFn = chalk.rgb(255, 193, 7)
  else colorFn = chalk.rgb(76, 175, 80)
  const bar = colorFn('█'.repeat(Math.max(filled, 0)) + '░'.repeat(Math.max(empty, 0)))
  return `${bar} ${complexity}/100`
}

// ─── Node Table ───────────────────────────────────────────────────────────────

/**
 * Format node classification table.
 *
 * @example
 * formatNodeTable(nodes)
 */
export function formatNodeTable(nodes: NavigationNode[]): string {
  if (nodes.length === 0) return chalk.dim('  No files analyzed.')
  const lines: string[] = []
  lines.push(chalk.bold('  Navigation Nodes:'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────────────────────'))
  lines.push(chalk.gray('  File                            Type        Imports  ImportedBy  Depth'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────────────────────'))

  const sorted = [...nodes].sort((a, b) => a.depth - b.depth)
  for (const node of sorted) {
    const badge = formatNodeTypeBadge(node)
    const name = node.file.length > 30 ? '...' + node.file.slice(-27) : node.file
    lines.push(`  ${name.padEnd(31)} ${badge}  ${String(node.imports).padStart(4)}    ${String(node.importedBy).padStart(4)}       ${node.depth}`)
  }

  lines.push(chalk.gray('  ────────────────────────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Depth Visualization ──────────────────────────────────────────────────────

/**
 * Format depth distribution chart.
 *
 * @example
 * formatDepthChart(nodes)
 */
export function formatDepthChart(nodes: NavigationNode[]): string {
  if (nodes.length === 0) return chalk.dim('  No depth data.')

  const depthCounts = new Map<number, number>()
  for (const node of nodes) {
    depthCounts.set(node.depth, (depthCounts.get(node.depth) ?? 0) + 1)
  }

  const maxDepth = Math.max(...depthCounts.keys())
  const maxCount = Math.max(...depthCounts.values(), 1)

  const lines: string[] = []
  lines.push(chalk.bold('  Depth Distribution:'))
  lines.push(chalk.gray('  ──────────────────────────'))

  for (let d = 0; d <= maxDepth; d++) {
    const count = depthCounts.get(d) ?? 0
    const barLen = Math.round((count / maxCount) * 25)
    const bar = chalk.cyan('█'.repeat(Math.max(barLen, 0)))
    lines.push(`  Depth ${String(d).padStart(2)}  ${bar} ${count}`)
  }

  lines.push(chalk.gray('  ──────────────────────────'))
  return lines.join('\n')
}

// ─── Connectivity Chart ───────────────────────────────────────────────────────

/**
 * Format connectivity chart.
 *
 * @example
 * formatConnectivityChart(nodes)
 */
export function formatConnectivityChart(nodes: NavigationNode[]): string {
  if (nodes.length === 0) return chalk.dim('  No connectivity data.')

  const sorted = [...nodes].sort((a, b) => (b.imports + b.importedBy) - (a.imports + a.importedBy))
  const maxConn = sorted[0] ? sorted[0].imports + sorted[0].importedBy : 1

  const lines: string[] = []
  lines.push(chalk.bold('  Connectivity:'))
  lines.push(chalk.gray('  ──────────────────────────────────────────'))

  const shown = sorted.slice(0, 15)
  for (const node of shown) {
    const total = node.imports + node.importedBy
    const barLen = Math.round((total / Math.max(maxConn, 1)) * 20)
    const bar = chalk.magenta('█'.repeat(Math.max(barLen, 0)))
    const name = node.file.length > 20 ? '...' + node.file.slice(-17) : node.file
    lines.push(`  ${name.padEnd(21)} ${bar} ${total}`)
  }

  if (sorted.length > 15) {
    lines.push(chalk.dim(`  ... and ${sorted.length - 15} more`))
  }

  lines.push(chalk.gray('  ──────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Wayfinding Scores ────────────────────────────────────────────────────────

/**
 * Format wayfinding scores.
 *
 * @example
 * formatWayfindingScores(wayfinding)
 */
export function formatWayfindingScores(wayfinding: WayfindingScore[]): string {
  if (wayfinding.length === 0) return chalk.dim('  No wayfinding data.')

  const lines: string[] = []
  lines.push(chalk.bold('  Wayfinding Scores:'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────'))

  const sorted = [...wayfinding].sort((a, b) => b.score - a.score)
  for (const wf of sorted) {
    const meter = formatWayfindingMeter(wf.score)
    const name = wf.file.length > 25 ? '...' + wf.file.slice(-22) : wf.file
    lines.push(`  ${name.padEnd(26)} ${meter}`)
    if (wf.issues.length > 0) {
      for (const issue of wf.issues) {
        lines.push(`    ${chalk.dim('→ ' + issue)}`)
      }
    }
  }

  lines.push(chalk.gray('  ────────────────────────────────────────────────────'))
  return lines.join('\n')
}

/**
 * Format wayfinding meter bar.
 *
 * @example
 * formatWayfindingMeter(85)
 */
export function formatWayfindingMeter(score: number): string {
  const filled = Math.round(score / 5)
  const empty = 20 - filled
  let colorFn: (t: string) => string
  if (score >= 70) colorFn = chalk.green
  else if (score >= 40) colorFn = chalk.rgb(255, 193, 7)
  else colorFn = chalk.rgb(244, 67, 54)
  return colorFn('█'.repeat(Math.max(filled, 0)) + '░'.repeat(Math.max(empty, 0))) + ` ${score}`
}

// ─── Stats ────────────────────────────────────────────────────────────────────

/**
 * Format navigator stats.
 *
 * @example
 * formatNavigatorStats(stats)
 */
export function formatNavigatorStats(stats: NavigatorStats): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Navigator Stats:'))
  lines.push(chalk.gray('  ──────────────────────────────────────────'))
  lines.push(`  Nodes: ${stats.totalNodes} | Avg connectivity: ${stats.avgConnectivity}`)
  lines.push(`  Max depth: ${stats.maxDepth} | Avg depth: ${stats.avgDepth}`)
  lines.push(`  Entry points: ${chalk.green(String(stats.entryPointCount))} | Dead ends: ${chalk.rgb(244, 67, 54)(String(stats.deadEndCount))}`)
  lines.push(`  Highways: ${chalk.rgb(255, 193, 7)(String(stats.highwayCount))} | Islands: ${chalk.dim(String(stats.islandCount))}`)
  lines.push(`  Navigation complexity: ${formatComplexityMeter(stats.navigationComplexity)}`)
  lines.push(`  Avg wayfinding: ${stats.averageWayfinding}/100`)
  if (stats.hardestToReach) lines.push(`  Hardest to reach: ${chalk.rgb(244, 67, 54)(stats.hardestToReach)}`)
  if (stats.easiestToReach) lines.push(`  Easiest to reach: ${chalk.green(stats.easiestToReach)}`)
  lines.push(chalk.gray('  ──────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatRecommendations(recs)
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.dim('  No recommendations.')
  const lines: string[] = []
  lines.push(chalk.bold('  Recommendations:'))
  lines.push(chalk.gray('  ───────────────────────────────────────────────────'))
  for (let i = 0; i < recs.length; i++) {
    lines.push(`  ${i + 1}. ${recs[i]}`)
  }
  lines.push(chalk.gray('  ───────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Full Output ──────────────────────────────────────────────────────────────

/**
 * Format full navigator table.
 *
 * @example
 * formatNavigatorTable(result)
 */
export function formatNavigatorTable(result: NavigatorResult): string {
  const sections: string[] = []
  sections.push('')
  sections.push(chalk.bold('  Code Navigator — Wayfinding Analysis\n'))
  sections.push(formatNodeTable(result.map.nodes))
  sections.push('')
  sections.push(formatDepthChart(result.map.nodes))
  sections.push('')
  sections.push(formatConnectivityChart(result.map.nodes))
  sections.push('')
  sections.push(formatWayfindingScores(result.wayfinding))
  sections.push('')
  sections.push(formatNavigatorStats(result.stats))
  sections.push('')
  sections.push(formatRecommendations(result.recommendations))
  sections.push('')
  return sections.join('\n')
}

/**
 * Format navigator result as JSON.
 *
 * @example
 * formatNavigatorJSON(result)
 */
export function formatNavigatorJSON(result: NavigatorResult): string {
  return JSON.stringify(result, null, 2)
}
