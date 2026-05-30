import chalk from 'chalk'

import type { DepthLayer, ParallaxResult, ParallaxStats } from './parallax-helpers.js'

// ─── Perspective Panel ─────────────────────────────────────────────────────────

/**
 * Format a single perspective panel for display.
 *
 * @example
 * formatPerspectivePanel(perspective) // => '  NEAR VIEW (function-level)...'
 */
export function formatPerspectivePanel(perspective: { depth: string; description: string; observations: Array<{ significance: string; subject: string; detail: string }>; metrics: Record<string, number> }): string {
  const depthColors: Record<string, (s: string) => string> = {
    far: chalk.rgb(100, 149, 237),
    mid: chalk.rgb(144, 238, 144),
    near: chalk.rgb(255, 182, 193),
  }
  const color = depthColors[perspective.depth] ?? chalk.white
  const label = perspective.depth.toUpperCase()

  const lines: string[] = [
    color(`  ${label} VIEW (${perspective.description})`),
    chalk.gray('  ' + '─'.repeat(50)),
  ]

  const sigColors: Record<string, (s: string) => string> = {
    major: chalk.rgb(255, 99, 71),
    minor: chalk.rgb(173, 216, 230),
    notable: chalk.rgb(255, 215, 0),
  }

  for (const obs of perspective.observations.slice(0, 8)) {
    const sigColor = sigColors[obs.significance] ?? chalk.white
    lines.push(`  ${sigColor('●')} ${obs.subject}: ${obs.detail}`)
  }

  if (perspective.observations.length > 8) {
    lines.push(chalk.gray(`  ... and ${perspective.observations.length - 8} more`))
  }

  const metricEntries = Object.entries(perspective.metrics)
  if (metricEntries.length > 0) {
    lines.push('')
    lines.push(chalk.gray('  Metrics:'))
    for (const [k, v] of metricEntries) {
      lines.push(`    ${chalk.cyan(k)}: ${v}`)
    }
  }

  return lines.join('\n')
}

// ─── Depth Layer Table ─────────────────────────────────────────────────────────

/**
 * Format depth layers as a table.
 *
 * @example
 * formatDepthLayerTable(layers) // => '  File          Near  Mid  Far  Score  Category'
 */
export function formatDepthLayerTable(layers: DepthLayer[]): string {
  if (layers.length === 0) return chalk.gray('  No files analyzed')

  const sorted = [...layers].sort((a, b) => b.parallaxScore - a.parallaxScore)
  const lines: string[] = [
    '',
    chalk.bold('  Depth Layers:'),
    chalk.gray('  ' + '─'.repeat(80)),
    `  ${chalk.bold('File').padEnd(35)} ${chalk.bold('Near').padEnd(7)} ${chalk.bold('Mid').padEnd(7)} ${chalk.bold('Far').padEnd(7)} ${chalk.bold('Score').padEnd(7)} ${chalk.bold('Category')}`,
    chalk.gray('  ' + '─'.repeat(80)),
  ]

  const catColors: Record<string, (s: string) => string> = {
    abyssal: chalk.rgb(138, 43, 226),
    deep: chalk.rgb(30, 144, 255),
    moderate: chalk.rgb(60, 179, 113),
    shallow: chalk.rgb(255, 165, 0),
  }

  for (const l of sorted) {
    const name = l.file.length > 33 ? '...' + l.file.slice(-30) : l.file
    const catColor = catColors[l.depthCategory] ?? chalk.white
    lines.push(
      `  ${name.padEnd(35)} ${String(l.nearDepth).padEnd(7)} ${String(l.midDepth).padEnd(7)} ${String(l.farDepth).padEnd(7)} ${String(l.parallaxScore).padEnd(7)} ${catColor(l.depthCategory)}`,
    )
  }

  return lines.join('\n')
}

// ─── Depth Histogram ───────────────────────────────────────────────────────────

/**
 * Format a text-based depth histogram.
 *
 * @example
 * formatDepthHistogram(layers) // => '  Shallow: ████████ 8'
 */
export function formatDepthHistogram(layers: DepthLayer[]): string {
  const counts: Record<string, number> = { shallow: 0, moderate: 0, deep: 0, abyssal: 0 }
  for (const l of layers) counts[l.depthCategory] = (counts[l.depthCategory] ?? 0) + 1

  const maxCount = Math.max(...Object.values(counts), 1)
  const barMax = 20

  const catColors: Record<string, (s: string) => string> = {
    abyssal: chalk.rgb(138, 43, 226),
    deep: chalk.rgb(30, 144, 255),
    moderate: chalk.rgb(60, 179, 113),
    shallow: chalk.rgb(255, 165, 0),
  }

  const lines: string[] = [
    '',
    chalk.bold('  Depth Distribution:'),
    chalk.gray('  ' + '─'.repeat(40)),
  ]

  for (const cat of ['shallow', 'moderate', 'deep', 'abyssal'] as const) {
    const count = counts[cat]
    const barLen = Math.round(((count ?? 0) / maxCount) * barMax)
    const bar = '█'.repeat(barLen)
    const color = catColors[cat]
    lines.push(`  ${cat.padEnd(10)} ${(color ?? ((t: string) => t))(bar)} ${count ?? 0}`)
  }

  return lines.join('\n')
}

// ─── Agreement Meter ───────────────────────────────────────────────────────────

/**
 * Format a perspective agreement meter.
 *
 * @example
 * formatAgreementMeter(75) // => '  Agreement: ███████████████░░░░░ 75/100'
 */
export function formatAgreementMeter(agreement: number): string {
  const filled = Math.round(agreement / 5)
  const empty = 20 - filled
  const bar = '█'.repeat(filled) + '░'.repeat(empty)

  const color = agreement >= 75 ? chalk.rgb(60, 179, 113) : agreement >= 50 ? chalk.rgb(255, 215, 0) : chalk.rgb(255, 99, 71)

  return [
    '',
    chalk.bold('  Perspective Agreement:'),
    chalk.gray('  ' + '─'.repeat(40)),
    `  ${color(bar)} ${agreement}/100`,
  ].join('\n')
}

// ─── Stats Summary ─────────────────────────────────────────────────────────────

/**
 * Format stats summary.
 *
 * @example
 * formatParallaxStats(stats) // => '  Files: 10 | Avg Parallax: 58...'
 */
export function formatParallaxStats(stats: ParallaxStats): string {
  const lines: string[] = [
    '',
    chalk.bold('  Statistics:'),
    chalk.gray('  ' + '─'.repeat(60)),
    `  Total Files:      ${stats.totalFiles}`,
    `  Shallow:          ${chalk.rgb(255, 165, 0)(String(stats.shallowCount))}  |  Deep: ${chalk.rgb(30, 144, 255)(String(stats.deepCount))}`,
    `  Avg Parallax:     ${stats.avgParallax}  |  Overall Depth: ${stats.overallDepth}`,
    `  Avg Near:         ${stats.avgNear}  |  Avg Mid: ${stats.avgMid}  |  Avg Far: ${stats.avgFar}`,
    `  Deepest:          ${chalk.rgb(138, 43, 226)(stats.deepestFile)}`,
    `  Shallowest:       ${chalk.rgb(255, 165, 0)(stats.shallowestFile)}`,
  ]
  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Format recommendations list.
 *
 * @example
 * formatParallaxRecommendations(['Add detail...']) // => '  Recommendations:\n  → Add detail...'
 */
export function formatParallaxRecommendations(recs: string[]): string {
  if (recs.length === 0) return ''
  const lines: string[] = [
    '',
    chalk.bold('  Recommendations:'),
    chalk.gray('  ' + '─'.repeat(50)),
  ]
  for (const r of recs) {
    lines.push(`  ${chalk.rgb(255, 215, 0)('→')} ${r}`)
  }
  return lines.join('\n')
}

// ─── Full Table Output ─────────────────────────────────────────────────────────

/**
 * Format the full parallax result as a table.
 *
 * @example
 * formatParallaxTable(result) // => multi-line formatted output
 */
export function formatParallaxTable(result: ParallaxResult): string {
  const sections: string[] = []

  sections.push(chalk.bold.rgb(100, 149, 237)('\n  Parallax Depth Analysis\n'))

  for (const p of result.perspectives) {
    sections.push(formatPerspectivePanel(p))
  }

  sections.push(formatDepthLayerTable(result.layers))
  sections.push(formatDepthHistogram(result.layers))
  sections.push(formatAgreementMeter(result.stats.perspectiveAgreement))
  sections.push(formatParallaxStats(result.stats))
  sections.push(formatParallaxRecommendations(result.recommendations))

  return sections.join('\n')
}

// ─── JSON Output ───────────────────────────────────────────────────────────────

/**
 * Format the parallax result as JSON.
 *
 * @example
 * formatParallaxJson(result) // => '{"perspectives":[...],...}'
 */
export function formatParallaxJson(result: ParallaxResult): string {
  return JSON.stringify(result, null, 2)
}
