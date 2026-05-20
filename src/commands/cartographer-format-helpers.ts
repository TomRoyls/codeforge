import chalk from 'chalk'

import type { CartographerResult, CartographerStats, MapRegion, Territory } from './cartographer-helpers.js'

// ─── Biome Colors ─────────────────────────────────────────────────────────────

/**
 * Get chalk color function for a biome.
 *
 * @example
 * getBiomeColor('mountain')('text')
 */
export function getBiomeColor(biome: string): (text: string) => string {
  switch (biome) {
    case 'desert': return chalk.rgb(237, 177, 32)
    case 'forest': return chalk.rgb(34, 139, 34)
    case 'mountain': return chalk.rgb(139, 90, 43)
    case 'oasis': return chalk.rgb(0, 191, 255)
    case 'plains': return chalk.rgb(124, 179, 66)
    default: return chalk.white
  }
}

/**
 * Get biome symbol for ASCII map.
 *
 * @example
 * getBiomeSymbol('mountain')
 */
export function getBiomeSymbol(biome: string): string {
  switch (biome) {
    case 'desert': return '~'
    case 'forest': return '♣'
    case 'mountain': return '▲'
    case 'oasis': return '◆'
    case 'plains': return '·'
    default: return '?'
  }
}

// ─── ASCII Map ────────────────────────────────────────────────────────────────

/**
 * Format territory ASCII map.
 *
 * @example
 * formatTerritoryMap(territories)
 */
export function formatTerritoryMap(territories: Territory[]): string {
  if (territories.length === 0) return chalk.gray('  No territories to map')

  const lines: string[] = []
  lines.push(chalk.bold('  Territory Map'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  const cols = Math.min(6, territories.length)
  const rows = Math.ceil(territories.length / cols)

  for (let r = 0; r < rows; r++) {
    let rowStr = '  '
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c
      if (idx < territories.length) {
        const t = territories[idx]!
        const sym = getBiomeSymbol(t.biome)
        const color = getBiomeColor(t.biome)
        const elev = t.elevation >= 50 ? '^' : ' '
        rowStr += color(`${sym}${elev} `)
      }
    }
    lines.push(rowStr)
  }

  lines.push('')
  return lines.join('\n')
}

// ─── Elevation Profile ────────────────────────────────────────────────────────

/**
 * Format elevation profile chart.
 *
 * @example
 * formatElevationProfile(territories)
 */
export function formatElevationProfile(territories: Territory[]): string {
  if (territories.length === 0) return chalk.gray('  No elevation data')

  const lines: string[] = []
  lines.push(chalk.bold('  Elevation Profile'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  const sorted = [...territories].sort((a, b) => b.elevation - a.elevation).slice(0, 10)

  for (const t of sorted) {
    const barLen = Math.max(1, Math.round(t.elevation / 5))
    const bar = '█'.repeat(barLen)
    const color = t.elevation > 70 ? chalk.rgb(220, 50, 50) : t.elevation > 40 ? chalk.rgb(255, 165, 0) : chalk.rgb(50, 205, 50)
    const label = t.name.length > 15 ? t.name.substring(0, 12) + '...' : t.name.padEnd(15)
    lines.push(`  ${label} ${color(bar)} ${t.elevation}`)
  }

  lines.push('')
  return lines.join('\n')
}

// ─── Biome Distribution ───────────────────────────────────────────────────────

/**
 * Format biome distribution chart.
 *
 * @example
 * formatBiomeDistribution(territories)
 */
export function formatBiomeDistribution(territories: Territory[]): string {
  if (territories.length === 0) return chalk.gray('  No biome data')

  const lines: string[] = []
  lines.push(chalk.bold('  Biome Distribution'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  const counts: Record<string, number> = {}
  for (const t of territories) {
    counts[t.biome] = (counts[t.biome] ?? 0) + 1
  }

  const biomes = ['forest', 'plains', 'mountain', 'desert', 'oasis']
  for (const biome of biomes) {
    const count = counts[biome] ?? 0
    if (count === 0) continue
    const bar = getBiomeSymbol(biome).repeat(Math.max(1, count))
    const color = getBiomeColor(biome)
    lines.push(`  ${biome.padEnd(10)} ${color(bar)} ${count}`)
  }

  lines.push('')
  return lines.join('\n')
}

// ─── Region Overview ──────────────────────────────────────────────────────────

/**
 * Format region overview.
 *
 * @example
 * formatRegionOverview(regions)
 */
export function formatRegionOverview(regions: MapRegion[]): string {
  if (regions.length === 0) return chalk.gray('  No regions')

  const lines: string[] = []
  lines.push(chalk.bold('  Regions'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  for (const r of regions) {
    const color = getBiomeColor(r.biome)
    lines.push(`  ${color(r.name.padEnd(20))} ${r.territories.length} territories, ${r.totalArea} lines, elev ${r.avgElevation}`)
  }

  lines.push('')
  return lines.join('\n')
}

// ─── Legend ────────────────────────────────────────────────────────────────────

/**
 * Format legend.
 *
 * @example
 * formatLegend(legend)
 */
export function formatLegend(legend: Record<string, string>): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Legend'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  for (const [biome, desc] of Object.entries(legend)) {
    const sym = getBiomeSymbol(biome)
    const color = getBiomeColor(biome)
    lines.push(`  ${color(sym)} ${biome.padEnd(10)} ${desc}`)
  }

  lines.push('')
  return lines.join('\n')
}

// ─── Stats ────────────────────────────────────────────────────────────────────

/**
 * Format stats summary.
 *
 * @example
 * formatCartographerStats(stats)
 */
export function formatCartographerStats(stats: CartographerStats): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Map Statistics'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))
  lines.push(`  Territories    ${stats.totalTerritories}`)
  lines.push(`  Regions        ${stats.totalRegions}`)
  lines.push(`  Total Area     ${stats.totalArea} lines`)
  lines.push(`  Avg Elevation  ${stats.avgElevation}`)
  lines.push(`  Highest Peak   ${stats.highestPeak}`)
  lines.push(`  Largest        ${stats.largestTerritory}`)
  lines.push(`  Most Connected ${stats.mostConnected}`)
  lines.push(`  Rivers         ${stats.totalRivers}`)
  lines.push(`  Completeness   ${stats.mapCompleteness}%`)

  lines.push('')
  return lines.join('\n')
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatCartographerRecommendations(recs)
 */
export function formatCartographerRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.gray('  No recommendations')

  const lines: string[] = []
  lines.push(chalk.bold('  Recommendations'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  for (let i = 0; i < recs.length; i++) {
    lines.push(`  ${i + 1}. ${recs[i]}`)
  }

  lines.push('')
  return lines.join('\n')
}

// ─── Table Output ─────────────────────────────────────────────────────────────

/**
 * Format full cartographer table output.
 *
 * @example
 * formatCartographerTable(result)
 */
export function formatCartographerTable(result: CartographerResult): string {
  const parts: string[] = []
  parts.push(chalk.bold.rgb(0, 191, 255)('\n  Code Cartographer — Codebase Map\n'))
  parts.push(formatTerritoryMap(result.territories))
  parts.push(formatElevationProfile(result.territories))
  parts.push(formatBiomeDistribution(result.territories))
  parts.push(formatRegionOverview(result.regions))
  parts.push(formatLegend(result.legend))
  parts.push(formatCartographerStats(result.stats))
  parts.push(formatCartographerRecommendations(result.recommendations))
  return parts.join('\n')
}

// ─── JSON Output ──────────────────────────────────────────────────────────────

/**
 * Format cartographer result as JSON.
 *
 * @example
 * formatCartographerJSON(result)
 */
export function formatCartographerJSON(result: CartographerResult): string {
  return JSON.stringify(result, null, 2)
}
