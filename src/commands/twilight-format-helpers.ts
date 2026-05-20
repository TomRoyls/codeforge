import chalk from 'chalk'

import type { Boundary, TwilightResult, TwilightStats, TwilightZone } from './twilight-helpers.js'

// ─── Category Colors ─────────────────────────────────────────────────────────

const ZONE_COLORS = {
  bridge: (t: string) => chalk.rgb(255, 152, 0)(t),
  shared: (t: string) => chalk.rgb(33, 150, 243)(t),
  orphan: (t: string) => chalk.rgb(158, 158, 158)(t),
  chimera: (t: string) => chalk.rgb(156, 39, 176)(t),
  leaky: (t: string) => chalk.rgb(244, 67, 54)(t),
} as const

const ZONE_ICONS = {
  bridge: '🌉',
  shared: '🔗',
  orphan: '🏝️',
  chimera: '🧩',
  leaky: '💧',
} as const

/**
 * Get zone category color.
 *
 * @example
 * getZoneColor('bridge')
 */
export function getZoneColor(category: TwilightZone['category']): (t: string) => string {
  return ZONE_COLORS[category] ?? chalk.white
}

/**
 * Get zone icon.
 *
 * @example
 * getZoneIcon('bridge')
 */
export function getZoneIcon(category: TwilightZone['category']): string {
  return ZONE_ICONS[category] ?? '?'
}

// ─── Coupling Meter ───────────────────────────────────────────────────────────

/**
 * Format coupling meter.
 *
 * @example
 * formatCouplingMeter(75)
 */
export function formatCouplingMeter(coupling: number): string {
  const filled = Math.round(coupling / 5)
  const empty = 20 - filled
  let colorFn: (t: string) => string
  if (coupling <= 30) colorFn = chalk.green
  else if (coupling <= 60) colorFn = chalk.rgb(255, 193, 7)
  else colorFn = chalk.rgb(244, 67, 54)
  const bar = colorFn('█'.repeat(Math.max(filled, 0)) + '░'.repeat(Math.max(empty, 0)))
  return `  Avg Coupling: ${bar} ${coupling}%`
}

// ─── Zone Row ─────────────────────────────────────────────────────────────────

/**
 * Format a zone row.
 *
 * @example
 * formatZoneRow(zone)
 */
export function formatZoneRow(zone: TwilightZone): string {
  const icon = getZoneIcon(zone.category)
  const colorFn = getZoneColor(zone.category)
  const coupling = `${zone.couplingScore}%`.padStart(4)
  const modCount = String(zone.modules.length).padStart(2)
  return `  ${icon} ${zone.file.padEnd(40)} ${colorFn(zone.category.padEnd(8))} Mods:${modCount} Bound:${String(zone.boundaryCount).padStart(3)} Coupling:${coupling}`
}

// ─── Zone Table ───────────────────────────────────────────────────────────────

/**
 * Format the zone table.
 *
 * @example
 * formatZoneTable(zones)
 */
export function formatZoneTable(zones: TwilightZone[]): string {
  if (zones.length === 0) return chalk.dim('  No twilight zones detected.')
  const lines: string[] = []
  lines.push(chalk.bold('  Twilight Zones:'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────────────────────────────────'))
  lines.push(chalk.gray('  Icon  File                                     Category  Mods  Bound  Coupling'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────────────────────────────────'))

  const sorted = [...zones].sort((a, b) => b.couplingScore - a.couplingScore)
  for (const zone of sorted) {
    lines.push(formatZoneRow(zone))
  }

  lines.push(chalk.gray('  ────────────────────────────────────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Boundary Graph ───────────────────────────────────────────────────────────

/**
 * Format ASCII boundary graph.
 *
 * @example
 * formatBoundaryGraph(boundaries)
 */
export function formatBoundaryGraph(boundaries: Boundary[]): string {
  if (boundaries.length === 0) return chalk.dim('  No boundaries detected.')

  const modulePairs = new Map<string, { count: number; strength: number }>()
  for (const b of boundaries) {
    const fromMod = b.from.includes('/') ? b.from.split('/').slice(0, -1).join('/') : '<root>'
    const toMod = b.to.includes('/') ? b.to.split('/').slice(0, -1).join('/') : '<root>'
    if (fromMod === toMod) continue
    const key = [fromMod, toMod].sort().join(' ↔ ')
    const existing = modulePairs.get(key)
    if (existing) {
      existing.count++
      existing.strength = Math.max(existing.strength, b.strength)
    } else {
      modulePairs.set(key, { count: 1, strength: b.strength })
    }
  }

  const lines: string[] = []
  lines.push(chalk.bold('  Boundary Graph:'))
  lines.push(chalk.gray('  ──────────────────────────────────────────────────────────────'))

  const sorted = [...modulePairs.entries()].sort((a, b) => b[1].count - a[1].count)
  for (const [pair, info] of sorted.slice(0, 20)) {
    const bar = '█'.repeat(Math.min(Math.round(info.strength / 10), 10))
    const colorFn = info.strength >= 70 ? chalk.red : info.strength >= 40 ? chalk.yellow : chalk.green
    lines.push(`  ${pair.padEnd(45)} ×${String(info.count).padStart(3)} ${colorFn(bar)}`)
  }

  if (sorted.length > 20) {
    lines.push(chalk.dim(`  ... and ${sorted.length - 20} more`))
  }

  lines.push(chalk.gray('  ──────────────────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Circular Warnings ────────────────────────────────────────────────────────

/**
 * Format circular dependency warnings.
 *
 * @example
 * formatCircularWarnings(boundaries)
 */
export function formatCircularWarnings(boundaries: Boundary[]): string {
  const circular = boundaries.filter((b) => b.type === 'circular')
  if (circular.length === 0) return ''
  const lines: string[] = []
  lines.push(chalk.bold(chalk.red('  Circular Dependencies:')))
  lines.push(chalk.gray('  ───────────────────────────────────────────────────'))
  for (const c of circular) {
    lines.push(chalk.red(`  ⚠ ${c.from} ↔ ${c.to}`))
  }
  lines.push(chalk.gray('  ───────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Stats ────────────────────────────────────────────────────────────────────

/**
 * Format twilight stats.
 *
 * @example
 * formatTwilightStats(stats)
 */
export function formatTwilightStats(stats: TwilightStats): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Stats:'))
  lines.push(chalk.gray('  ──────────────────────────────────────────────────────────────'))
  lines.push(`  Zones: ${stats.totalZones} | Bridges: ${stats.bridgeCount} | Shared: ${stats.sharedCount} | Orphans: ${stats.orphanCount} | Chimeras: ${stats.chimeraCount} | Leaky: ${stats.leakyCount}`)
  lines.push(`  Modules: ${stats.moduleCount} | Boundaries: ${stats.boundaryCount} | Circular: ${stats.circularDependencies}`)
  lines.push(`  Avg Coupling: ${stats.avgCoupling}%`)
  if (stats.strongestBoundary) {
    lines.push(`  Strongest: ${stats.strongestBoundary}`)
  }
  lines.push(chalk.gray('  ──────────────────────────────────────────────────────────────'))
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
 * Format the full twilight result as table.
 *
 * @example
 * formatTwilightTable(result)
 */
export function formatTwilightTable(result: TwilightResult): string {
  const sections: string[] = []
  sections.push('')
  sections.push(chalk.bold('  Code Twilight Zone Analysis\n'))
  sections.push(formatCouplingMeter(result.stats.avgCoupling))
  sections.push('')
  sections.push(formatZoneTable(result.zones))
  sections.push('')
  sections.push(formatBoundaryGraph(result.boundaries))
  sections.push('')

  const circWarn = formatCircularWarnings(result.boundaries)
  if (circWarn) {
    sections.push(circWarn)
    sections.push('')
  }

  sections.push(formatTwilightStats(result.stats))
  sections.push('')
  sections.push(formatRecommendations(result.recommendations))
  sections.push('')
  return sections.join('\n')
}

/**
 * Format twilight result as JSON.
 *
 * @example
 * formatTwilightJSON(result)
 */
export function formatTwilightJSON(result: TwilightResult): string {
  return JSON.stringify(result, null, 2)
}
