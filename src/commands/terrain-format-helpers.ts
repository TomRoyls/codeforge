import chalk from 'chalk'

import {
  type DangerLevel,
  type TerrainFeature,
  type TerrainResult,
  type TerrainStats,
  type TerrainTile,
  type TerrainType,
} from './terrain-helpers.js'

// ─── Color Map ────────────────────────────────────────────────────────────────

const TERRAIN_SHADE: Record<TerrainType, (t: string) => string> = {
  mountain: (t) => chalk.rgb(139, 69, 19)(t),
  hill: (t) => chalk.rgb(34, 139, 34)(t),
  plain: (t) => chalk.rgb(144, 238, 144)(t),
  valley: (t) => chalk.rgb(135, 206, 235)(t),
}

const DANGER_COLOR: Record<DangerLevel, (t: string) => string> = {
  safe: (t) => chalk.rgb(76, 175, 80)(t),
  caution: (t) => chalk.rgb(255, 193, 7)(t),
  dangerous: (t) => chalk.rgb(255, 87, 34)(t),
  extreme: (t) => chalk.rgb(244, 67, 54)(t),
}

const ELEVATION_CHARS = ['░', '▒', '▓', '█']

/**
 * Get terrain shade function.
 *
 * @example
 * getTerrainShade('mountain')
 */
export function getTerrainShade(type: TerrainType): (t: string) => string {
  return TERRAIN_SHADE[type] ?? chalk.white
}

/**
 * Get danger color function.
 *
 * @example
 * getDangerColor('extreme')
 */
export function getDangerColor(level: DangerLevel): (t: string) => string {
  return DANGER_COLOR[level] ?? chalk.white
}

/**
 * Get elevation character for ASCII map.
 *
 * @example
 * getElevationChar(80)
 */
export function getElevationChar(elevation: number): string {
  if (elevation >= 75) return ELEVATION_CHARS[3]!
  if (elevation >= 50) return ELEVATION_CHARS[2]!
  if (elevation >= 25) return ELEVATION_CHARS[1]!
  return ELEVATION_CHARS[0]!
}

// ─── Tile Formatting ──────────────────────────────────────────────────────────

/**
 * Format a single tile for display.
 *
 * @example
 * formatTile(tile)
 */
export function formatTile(tile: TerrainTile): string {
  const shade = getTerrainShade(tile.terrain)
  const elevChar = getElevationChar(tile.elevation)
  const dangerFn = getDangerColor(computeDangerDisplay(tile))
  const elevBar = shade(elevChar.repeat(Math.max(Math.round(tile.elevation / 5), 1)))

  return `  ${tile.file.padEnd(30)} ${elevBar} E:${String(tile.elevation).padStart(3)} A:${String(tile.area).padStart(5)} T:${String(tile.temperature).padStart(3)} V:${String(tile.vegetation).padStart(3)} W:${String(tile.water).padStart(3)} ${dangerFn(tile.terrain)}`
}

function computeDangerDisplay(tile: TerrainTile): DangerLevel {
  if (tile.elevation >= 70 && tile.water <= 20) return 'extreme'
  if (tile.elevation >= 60 && tile.water <= 30) return 'dangerous'
  if (tile.elevation >= 40 && tile.water <= 40) return 'caution'
  if (tile.elevation >= 50 && tile.vegetation <= 15) return 'caution'
  return 'safe'
}

/**
 * Format the ASCII terrain map grid.
 *
 * @example
 * formatTerrainMap(tiles)
 */
export function formatTerrainMap(tiles: TerrainTile[]): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Terrain Map:'))
  lines.push(chalk.gray('  ─────────────────────────────────────────────────────────────────────'))

  const sorted = [...tiles].sort((a, b) => b.elevation - a.elevation)
  for (const tile of sorted.slice(0, 30)) {
    lines.push(formatTile(tile))
  }

  if (sorted.length > 30) {
    lines.push(chalk.dim(`  ... and ${sorted.length - 30} more tiles`))
  }

  lines.push(chalk.gray('  ─────────────────────────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Feature Formatting ───────────────────────────────────────────────────────

/**
 * Format a terrain feature.
 *
 * @example
 * formatFeature(feature)
 */
export function formatFeature(feature: TerrainFeature): string {
  const dangerFn = getDangerColor(feature.dangerLevel)
  const icon = getFeatureIcon(feature.type)
  return `  ${icon} ${chalk.bold(feature.name)} — Elevation: ${feature.elevation}, Area: ${feature.area} lines, ${dangerFn(feature.dangerLevel)}`
}

function getFeatureIcon(type: string): string {
  const icons: Record<string, string> = {
    mountain: '⛰️',
    hill: '🏔️',
    plain: ' Meadow',
    valley: ' Valley',
    cliff: ' Cliff',
    plateau: ' Plateau',
    canyon: ' Canyon',
    ridge: ' Ridge',
  }
  return icons[type] ?? '○'
}

/**
 * Format all features.
 *
 * @example
 * formatFeatures(features)
 */
export function formatFeatures(features: TerrainFeature[]): string {
  if (features.length === 0) return chalk.dim('  No significant terrain features detected.')
  const lines: string[] = []
  lines.push(chalk.bold('  Features:'))
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  for (const f of features) {
    lines.push(formatFeature(f))
    lines.push(chalk.dim(`    ${f.description}`))
  }
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Stats Formatting ─────────────────────────────────────────────────────────

/**
 * Format terrain stats.
 *
 * @example
 * formatTerrainStats(stats)
 */
export function formatTerrainStats(stats: TerrainStats): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Stats:'))
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  lines.push(`  Files: ${stats.totalFiles} | Elevation: ${stats.minElevation}-${stats.maxElevation} (avg ${stats.averageElevation})`)
  lines.push(`  Mountains: ${stats.mountains} | Valleys: ${stats.valleys} | Plains: ${stats.plains}`)
  lines.push(`  Danger zones: ${stats.dangerZones} | Avg temp: ${stats.averageTemperature} | Vegetation: ${stats.averageVegetation} | Water: ${stats.averageWater}`)
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Legend Formatting ────────────────────────────────────────────────────────

/**
 * Format the legend.
 *
 * @example
 * formatLegend(legend)
 */
export function formatLegend(legend: string[]): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Legend:'))
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  for (const entry of legend) {
    lines.push(`  ${entry}`)
  }
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
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
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  for (let i = 0; i < recs.length; i++) {
    lines.push(`  ${i + 1}. ${recs[i]}`)
  }
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Full Table ───────────────────────────────────────────────────────────────

/**
 * Format the full terrain result as table.
 *
 * @example
 * formatTerrainTable(result)
 */
export function formatTerrainTable(result: TerrainResult): string {
  const sections: string[] = []
  sections.push('')
  sections.push(chalk.bold('  Codebase Terrain Map\n'))
  sections.push(formatTerrainMap(result.tiles))
  sections.push('')
  sections.push(formatFeatures(result.features))
  sections.push('')
  sections.push(formatTerrainStats(result.stats))
  sections.push('')
  sections.push(formatLegend(result.legend))
  sections.push('')
  sections.push(formatRecommendations(result.recommendations))
  sections.push('')
  return sections.join('\n')
}

// ─── JSON ─────────────────────────────────────────────────────────────────────

/**
 * Format terrain result as JSON.
 *
 * @example
 * formatTerrainJSON(result)
 */
export function formatTerrainJSON(result: TerrainResult): string {
  return JSON.stringify(result, null, 2)
}
