import chalk from 'chalk'

import type {
  ContourLine,
  DifficultyLevel,
  ElevationProfile,
  FeatureDifficulty,
  TerrainMapResult,
  TerrainMapStats,
  TerrainPoint,
  TerrainType,
  TopographicFeature,
} from './terrain-map-helpers.js'

// ─── Terrain Badges ────────────────────────────────────────────────────────────

const TERRAIN_SYMBOL: Record<TerrainType, string> = {
  peak: '⛰️',
  valley: '🌿',
  ridge: '🏔️',
  plain: '🌾',
  cliff: '🧗',
  plateau: '🪨',
  crater: '🌋',
}

const DIFFICULTY_COLOR: Record<DifficultyLevel | FeatureDifficulty, (s: string) => string> = {
  easy: chalk.rgb(72, 199, 142),
  moderate: chalk.rgb(200, 180, 80),
  challenging: chalk.rgb(220, 150, 80),
  extreme: chalk.rgb(220, 80, 80),
}

/**
 * Format terrain type badge.
 *
 * @example
 * formatTerrainBadge('peak') // => '⛰️ peak'
 */
export function formatTerrainBadge(terrain: TerrainType): string {
  return `${TERRAIN_SYMBOL[terrain]} ${terrain}`
}

/**
 * Format difficulty with color.
 *
 * @example
 * formatDifficulty('extreme') // => colored 'extreme'
 */
export function formatDifficulty(difficulty: DifficultyLevel | FeatureDifficulty): string {
  return DIFFICULTY_COLOR[difficulty](difficulty)
}

/**
 * Format elevation bar.
 *
 * @example
 * formatElevationBar(75) // => '▓▓▓▓▓▓▓░░░ 75m'
 */
export function formatElevationBar(elevation: number, width: number = 10): string {
  const filled = Math.round((elevation / 100) * width)
  const empty = width - filled
  const bar = '▓'.repeat(filled) + '░'.repeat(empty)
  const color = elevation >= 70 ? chalk.rgb(220, 80, 80) : elevation >= 40 ? chalk.rgb(200, 180, 80) : chalk.rgb(72, 199, 142)
  return color(`${bar} ${elevation}m`)
}

// ─── Contour Map ───────────────────────────────────────────────────────────────

/**
 * Format ASCII contour map.
 *
 * @example
 * formatContourMap(contours) // => visual contour representation
 */
export function formatContourMap(contours: ContourLine[]): string {
  if (contours.length === 0) return 'No contour data'

  const lines: string[] = [chalk.bold('Contour Map:')]
  for (const c of contours) {
    const marker = c.isContourInterval ? '══' : '──'
    const bar = `${marker}${'─'.repeat(Math.max(0, 20 - c.files.length))}`
    const fileCount = chalk.rgb(150, 150, 150)(`(${c.files.length} file${c.files.length !== 1 ? 's' : ''})`)
    lines.push(`  ${String(c.elevation).padStart(3)}m ${bar} ${fileCount}`)
  }

  return lines.join('\n')
}

// ─── Terrain Point Table ───────────────────────────────────────────────────────

/**
 * Format terrain point table.
 *
 * @example
 * formatTerrainPointTable(points) // => table of points
 */
export function formatTerrainPointTable(points: TerrainPoint[]): string {
  if (points.length === 0) return 'No terrain points.'

  const header = chalk.bold('File                          Elevation  Terrain  Contour')
  const separator = '─'.repeat(65)
  const rows = points.map(p => {
    const file = p.file.padEnd(28)
    const elevation = formatElevationBar(p.elevation, 5)
    const terrain = formatTerrainBadge(p.terrainType)
    const contour = `${p.contourLevel}`
    return `${file} ${elevation}  ${terrain.padEnd(12)} L${contour}`
  })

  return [header, separator, ...rows].join('\n')
}

// ─── Feature Table ─────────────────────────────────────────────────────────────

/**
 * Format topographic features table.
 *
 * @example
 * formatFeatureTable(features) // => table of features
 */
export function formatFeatureTable(features: TopographicFeature[]): string {
  if (features.length === 0) return 'No topographic features identified.'

  const header = chalk.bold('Feature                        Type              Avg Elev  Difficulty')
  const separator = '─'.repeat(75)
  const rows = features.map(f => {
    const name = f.name.substring(0, 28).padEnd(28)
    const type = f.type.padEnd(16)
    const elev = String(f.avgElevation).padEnd(9)
    const diff = formatDifficulty(f.difficulty)
    return `${name} ${type} ${elev} ${diff}`
  })

  return [header, separator, ...rows].join('\n')
}

// ─── Elevation Profile ─────────────────────────────────────────────────────────

/**
 * Format elevation profile.
 *
 * @example
 * formatElevationProfile(profile) // => visual profile
 */
export function formatElevationProfile(profile: ElevationProfile): string {
  const lines: string[] = [
    chalk.bold(`  ${profile.directory}/ (${profile.feature}, avg ${profile.avgElevation}m, gradient ${profile.gradient})`),
  ]

  for (const [file, elev] of profile.profile) {
    const filled = Math.round((elev / 100) * 30)
    const bar = '█'.repeat(filled) + '░'.repeat(30 - filled)
    const color = elev >= 70 ? chalk.rgb(220, 80, 80) : elev >= 40 ? chalk.rgb(200, 180, 80) : chalk.rgb(72, 199, 142)
    lines.push(`    ${file.padEnd(20)} ${color(bar)} ${elev}m`)
  }

  return lines.join('\n')
}

// ─── Stats Summary ─────────────────────────────────────────────────────────────

/**
 * Format terrain map stats.
 *
 * @example
 * formatTerrainMapStats(stats) // => stats summary
 */
export function formatTerrainMapStats(stats: TerrainMapStats): string {
  const lines = [
    chalk.bold('Terrain Statistics:'),
    `  Total points: ${stats.totalPoints}`,
    `  Peaks: ${stats.peakCount} | Valleys: ${stats.valleyCount}`,
    `  Avg elevation: ${stats.avgElevation}m | Range: ${stats.minElevation}m-${stats.maxElevation}m (${stats.elevationRange}m)`,
    `  Dominant terrain: ${formatTerrainBadge(stats.dominantTerrain)}`,
    `  Steepest gradient: ${stats.steepestGradient}`,
    `  Flattest area: ${stats.flattestArea}`,
    `  Contour density: ${stats.contourDensity} files/level`,
    `  Overall difficulty: ${formatDifficulty(stats.overallDifficulty)}`,
  ]
  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatRecommendations(['Simplify peaks']) // => bullet list
 */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.rgb(72, 199, 142)('✓ Terrain is navigable — no major concerns')
  const lines = [chalk.bold('🗺️ Recommendations:')]
  for (const rec of recommendations) {
    lines.push(`  • ${rec}`)
  }
  return lines.join('\n')
}

// ─── Full Table Output ─────────────────────────────────────────────────────────

/**
 * Format full terrain map result as table.
 *
 * @example
 * formatTerrainMapTable(result, false) // => full output
 */
export function formatTerrainMapTable(result: TerrainMapResult, verbose: boolean): string {
  const sections: string[] = []

  sections.push(chalk.bold('\nTopographic Terrain Map\n'))
  sections.push(formatTerrainMapStats(result.stats))
  sections.push('')

  if (result.contours.length > 0) {
    sections.push(formatContourMap(result.contours))
    sections.push('')
  }

  if (result.points.length > 0) {
    sections.push(chalk.bold('Terrain Points:'))
    sections.push(verbose ? result.points.map(p => `  ${p.file} — ${formatTerrainBadge(p.terrainType)} — ${formatElevationBar(p.elevation)}`).join('\n') : formatTerrainPointTable(result.points))
    sections.push('')
  }

  if (result.features.length > 0) {
    sections.push(chalk.bold('Topographic Features:'))
    sections.push(formatFeatureTable(result.features))
    sections.push('')
  }

  if (result.profiles.length > 0 && verbose) {
    sections.push(chalk.bold('Elevation Profiles:'))
    for (const profile of result.profiles) {
      sections.push(formatElevationProfile(profile))
    }
    sections.push('')
  }

  sections.push(formatRecommendations(result.recommendations))

  return sections.join('\n')
}

// ─── JSON Output ───────────────────────────────────────────────────────────────

/**
 * Format terrain map result as JSON.
 *
 * @example
 * formatTerrainMapJson(result) // => JSON string
 */
export function formatTerrainMapJson(result: TerrainMapResult): string {
  return JSON.stringify(result, null, 2)
}
