import chalk from 'chalk'

import type { ConstellationGroup, ConstellationMapResult, ConstellationMapStats, NavigationPath, Star, StarConnection } from './constellation-map-helpers.js'

// ─── Spectral Legend ────────────────────────────────────────────────────────────

/**
 * Format spectral class legend.
 *
 * @example
 * formatSpectralLegend()
 */
export function formatSpectralLegend(): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Spectral Classes'))
  lines.push(chalk.gray('  ─'.repeat(30)))
  lines.push(`  ${chalk.rgb(100, 149, 237)('O')} Core infrastructure`)
  lines.push(`  ${chalk.rgb(155, 176, 237)('B')} Command files`)
  lines.push(`  ${chalk.rgb(255, 255, 255)('A')} Helper/utility files`)
  lines.push(`  ${chalk.rgb(255, 255, 200)('F')} Test files`)
  lines.push(`  ${chalk.rgb(255, 255, 100)('G')} Config files`)
  lines.push(`  ${chalk.rgb(255, 200, 100)('K')} Type definition files`)
  lines.push(`  ${chalk.rgb(255, 100, 100)('M')} Format helper files`)
  return lines.join('\n')
}

// ─── Star Chart ────────────────────────────────────────────────────────────────

/**
 * Format ASCII star chart.
 *
 * @example
 * formatStarChart(stars)
 */
export function formatStarChart(stars: Star[]): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Star Chart'))
  lines.push(chalk.gray('  ─'.repeat(50)))

  if (stars.length === 0) {
    lines.push(chalk.gray('  No stars visible'))
    return lines.join('\n')
  }

  const sorted = [...stars].sort((a, b) => b.brightness - a.brightness)
  for (const star of sorted.slice(0, 20)) {
    const icon = brightnessIcon(star.brightness)
    const cls = spectralColor(star.spectralClass)
    const bright = String(star.brightness).padStart(3)
    const mag = String(star.magnitude).padStart(3)
    const connCount = String(star.connections.length).padStart(2)
    lines.push(`  ${icon} ${star.name.padEnd(24).slice(0, 24)} ${cls(star.spectralClass)}  bright:${bright}  mag:${mag}  conn:${connCount}`)
  }

  if (stars.length > 20) {
    lines.push(chalk.gray(`  ... and ${stars.length - 20} more stars`))
  }

  return lines.join('\n')
}

function brightnessIcon(b: number): string {
  if (b >= 80) return chalk.rgb(255, 255, 200)('★')
  if (b >= 50) return chalk.rgb(200, 200, 150)('☆')
  if (b >= 20) return chalk.rgb(150, 150, 150)('·')
  return chalk.rgb(100, 100, 100)('⋅')
}

function spectralColor(cls: string): (s: string) => string {
  switch (cls) {
    case 'O': return chalk.rgb(100, 149, 237)
    case 'B': return chalk.rgb(155, 176, 237)
    case 'A': return chalk.rgb(255, 255, 255)
    case 'F': return chalk.rgb(255, 255, 200)
    case 'G': return chalk.rgb(255, 255, 100)
    case 'K': return chalk.rgb(255, 200, 100)
    case 'M': return chalk.rgb(255, 100, 100)
    default: return chalk.gray
  }
}

// ─── Constellation Table ───────────────────────────────────────────────────────

/**
 * Format constellation table.
 *
 * @example
 * formatConstellationTable(constellations)
 */
export function formatConstellationTable(constellations: ConstellationGroup[]): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Constellations'))
  lines.push(chalk.gray('  ─'.repeat(50)))

  if (constellations.length === 0) {
    lines.push(chalk.gray('  No constellations found'))
    return lines.join('\n')
  }

  for (const c of constellations) {
    lines.push(`  ${chalk.bold(c.name.padEnd(20))} (${c.stars.length} stars)  coherence:${c.coherence}%  bright:${c.totalBrightness}`)
    lines.push(chalk.gray(`    ${c.description}`))
    lines.push(chalk.gray(`    brightest: ${c.brightest}`))
  }

  return lines.join('\n')
}

// ─── Navigation Paths ──────────────────────────────────────────────────────────

/**
 * Format navigation paths.
 *
 * @example
 * formatNavigationPaths(paths)
 */
export function formatNavigationPaths(paths: NavigationPath[]): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Navigation Paths'))
  lines.push(chalk.gray('  ─'.repeat(50)))

  if (paths.length === 0) {
    lines.push(chalk.gray('  No paths computed'))
    return lines.join('\n')
  }

  for (const p of paths.slice(0, 10)) {
    const arrow = chalk.rgb(0, 188, 212)('→')
    const pathStr = p.path.join(` ${arrow} `)
    lines.push(`  ${arrow} ${p.from} → ${p.to}  (${p.distance} hops, difficulty:${p.difficulty})`)
    lines.push(chalk.gray(`    via: ${pathStr}`))
  }

  return lines.join('\n')
}

// ─── Orphan List ───────────────────────────────────────────────────────────────

/**
 * Format orphan stars list.
 *
 * @example
 * formatOrphanList(['isolated.ts'])
 */
export function formatOrphanList(orphans: string[]): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(255, 193, 7)('\n  Orphan Stars'))
  lines.push(chalk.gray('  ─'.repeat(30)))

  if (orphans.length === 0) {
    lines.push(chalk.rgb(76, 175, 80)('  ✓ No orphan stars'))
    return lines.join('\n')
  }

  for (const o of orphans) {
    lines.push(`  ⋅ ${o}`)
  }

  return lines.join('\n')
}

// ─── Chart Coverage ────────────────────────────────────────────────────────────

/**
 * Format chart coverage meter.
 *
 * @example
 * formatChartCoverage(85)
 */
export function formatChartCoverage(coverage: number): string {
  const filled = Math.round(coverage / 5)
  const bar = '█'.repeat(filled) + '░'.repeat(20 - filled)
  const color = coverage >= 80 ? chalk.rgb(76, 175, 80) : coverage >= 50 ? chalk.rgb(255, 193, 7) : chalk.rgb(244, 67, 54)
  return `  Coverage: ${color(bar)} ${coverage}%`
}

// ─── Stats Summary ─────────────────────────────────────────────────────────────

/**
 * Format stats summary.
 *
 * @example
 * formatStatsSummary(stats)
 */
export function formatStatsSummary(stats: ConstellationMapStats): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Chart Statistics'))
  lines.push(chalk.gray('  ─'.repeat(40)))
  lines.push(`  Stars: ${stats.totalStars}  Constellations: ${stats.totalConstellations}  Connections: ${stats.totalConnections}`)
  lines.push(`  Brightest: ${stats.brightestStar}  Dimmest: ${stats.dimmestStar}`)
  lines.push(`  Avg Brightness: ${stats.avgBrightness}  Avg Magnitude: ${stats.avgMagnitude}`)
  lines.push(`  Orphans: ${stats.orphanStars}`)
  lines.push(formatChartCoverage(stats.chartCoverage))
  lines.push(`  Navigability: ${stats.navigability}%`)
  lines.push(`  Largest: ${stats.largestConstellation}  Smallest: ${stats.smallestConstellation}`)
  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatMapRecommendations(['Connect orphans'])
 */
export function formatMapRecommendations(recs: string[]): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Recommendations'))
  lines.push(chalk.gray('  ─'.repeat(50)))
  for (const rec of recs) {
    lines.push(`  → ${rec}`)
  }
  return lines.join('\n')
}

// ─── JSON Format ───────────────────────────────────────────────────────────────

/**
 * Format as JSON.
 *
 * @example
 * formatConstellationMapJson(result)
 */
export function formatConstellationMapJson(result: ConstellationMapResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Format ──────────────────────────────────────────────────────────────

/**
 * Format as table.
 *
 * @example
 * formatConstellationMapTable(result)
 */
export function formatConstellationMapTable(result: ConstellationMapResult): string {
  const parts: string[] = []
  parts.push(formatSpectralLegend())
  parts.push(formatStarChart(result.stars))
  parts.push(formatConstellationTable(result.constellations))
  parts.push(formatNavigationPaths(result.paths))
  parts.push(formatOrphanList(result.stats.orphanStars > 0 ? ['(see stats)'] : []))
  parts.push(formatStatsSummary(result.stats))
  parts.push(formatMapRecommendations(result.recommendations))
  return parts.join('\n')
}
