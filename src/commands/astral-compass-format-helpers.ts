// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { StarPoint, StarSystem, AstralCompassResult } from './astral-compass-helpers.js'

// ─── Color Palette (astral compass — deep blue/indigo/silver) ─────
const high = chalk.rgb(100, 149, 237)
const midHigh = chalk.rgb(130, 150, 220)
const mid = chalk.rgb(160, 160, 200)
const lowMid = chalk.rgb(180, 170, 190)
const low = chalk.rgb(200, 180, 170)

const best = chalk.rgb(120, 160, 255).bold
const good = chalk.rgb(140, 170, 245)
const okay = chalk.rgb(165, 175, 225)
const poor = chalk.rgb(185, 180, 200)
const worst = chalk.rgb(200, 190, 185)

const heading = chalk.rgb(110, 155, 250).bold
const label = chalk.rgb(150, 170, 240)
const dim = chalk.rgb(160, 165, 185)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // bright blue
 */
export function colorScore(score: number): string {
  if (score >= 80) return high(String(score))
  if (score >= 60) return midHigh(String(score))
  if (score >= 40) return mid(String(score))
  if (score >= 20) return lowMid(String(score))
  return low(String(score))
}

/**
 * Color a grade/tier string by quality
 * @example
 * colorGrade('pole-star') // best (bold blue)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'crystal-chart': best, 'great-dipper': best, 'galactic-core': best,
    'perfect-orbit': best, 'true-north': best, 'pole-star': best,
    'galaxy-core': best, 'brilliant-cosmos': best, 'grand-astronomer': best,

    'clear-sky': good, 'orion-belt': good, 'star-system': good,
    'stable-orbit': good, 'steady-bearings': good, 'bright-star': good,
    'star-cluster': good, 'starlit-sky': good, 'star-captain': good,

    'proper-bearings': okay, 'proper-stars': okay, 'proper-orbit': okay,
    'proper-path': okay, 'proper-aim': okay, 'proper-star': okay,
    'proper-system': okay, 'decent-constellation': okay, 'skilled-navigator': okay,

    'cloudy-night': poor, 'scattered-lights': poor, 'drifting-asteroids': poor,
    'elliptical-drift': poor, 'drifting-compass': poor, 'dim-star': poor,
    'binary-system': poor, 'dim-nebula': poor, 'apprentice': poor,

    'lost-at-sea': worst, 'random-dots': worst, 'space-debris': worst,
    'collision-course': worst, 'lost-direction': worst, 'dark-matter': worst,
    'rogue-planet': worst, 'dark-void': worst, 'novice': worst,

    'no-navigation': worst, 'no-pattern': worst, 'no-organization': worst,
    'chaotic-orbit': worst, 'no-north': worst, 'void': worst,
    'no-system': worst, 'landlubber': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Point Formatting ─────────────────────────────────────────────

/**
 * Format a single star point for display
 * @example
 * formatPointTable(point) // colored point info
 */
export function formatPointTable(point: StarPoint): string {
  const parts = [
    `${label('File:')} ${dim(point.file)}`,
    `${label('Navigation Clarity:')} ${colorScore(point.navigationClarity)} ${colorGrade(point.navigating.grade)}`,
    `${label('Constellation Structure:')} ${colorScore(point.constellationStructure)} ${colorGrade(point.patterning.constellation)}`,
    `${label('Stellar Organization:')} ${colorScore(point.stellarOrganization)} ${colorGrade(point.organizing.stellar)}`,
    `${label('Orbit Harmony:')} ${colorScore(point.orbitHarmony)} ${colorGrade(point.harmonizing.orbit)}`,
    `${label('North Star Alignment:')} ${colorScore(point.northStarAlignment)} ${colorGrade(point.aligning.northStar)}`,
    `${label('Score:')} ${colorScore(point.qualityScore)} ${colorGrade(point.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format star points as summary table
 * @example
 * formatPointsTable(points) // multi-line table
 */
export function formatPointsTable(points: StarPoint[]): string {
  if (points.length === 0) return dim('No star points found')
  const header = heading('Astral Compass Analysis')
  const rows = points.map(p => formatPointTable(p))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── System Formatting ────────────────────────────────────────────

/**
 * Format a star system for display
 * @example
 * formatSystemTable(system) // colored system info
 */
export function formatSystemTable(system: StarSystem): string {
  const parts = [
    `${label('System:')} ${dim(system.directory)}`,
    `${label('Type:')} ${colorGrade(system.systemType)}`,
    `${label('Condition:')} ${colorGrade(system.condition)}`,
    `${label('Points:')} ${String(system.points.length)}`,
    `${label('Avg Navigation:')} ${colorScore(system.avgNavigation)}`,
    `${label('Avg Organization:')} ${colorScore(system.avgOrganization)}`,
    `${label('Avg Alignment:')} ${colorScore(system.avgAlignment)}`,
    `${label('Pole Stars:')} ${String(system.poleStarCount)}`,
    `${label('Voids:')} ${String(system.voidCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all systems as summary
 * @example
 * formatSystemsTable(systems) // multi-line system summary
 */
export function formatSystemsTable(systems: StarSystem[]): string {
  if (systems.length === 0) return dim('No star systems found')
  const header = heading('Star Systems')
  const rows = systems.map(s => formatSystemTable(s))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: AstralCompassResult['stats']): string {
  const parts = [
    heading('Astral Compass Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Systems:')} ${String(stats.totalSystems)}`,
    `${label('Avg Navigation Clarity:')} ${colorScore(stats.avgNavigationClarity)}`,
    `${label('Avg Constellation Structure:')} ${colorScore(stats.avgConstellationStructure)}`,
    `${label('Avg Stellar Organization:')} ${colorScore(stats.avgStellarOrganization)}`,
    `${label('Avg Orbit Harmony:')} ${colorScore(stats.avgOrbitHarmony)}`,
    `${label('Avg North Star Alignment:')} ${colorScore(stats.avgNorthStarAlignment)}`,
    `${label('Pole Stars:')} ${String(stats.poleStarCount)}`,
    `${label('Bright Stars:')} ${String(stats.brightStarCount)}`,
    `${label('Proper Stars:')} ${String(stats.properStarCount)}`,
    `${label('Dim Stars:')} ${String(stats.dimStarCount)}`,
    `${label('Dark Matter:')} ${String(stats.darkMatterCount)}`,
    `${label('Voids:')} ${String(stats.voidCount)}`,
    `${label('High Clarity:')} ${String(stats.hasHighClarityCount)}`,
    `${label('High Structure:')} ${String(stats.hasHighStructureCount)}`,
    `${label('High Organization:')} ${String(stats.hasHighOrganizationCount)}`,
    `${label('High Harmony:')} ${String(stats.hasHighHarmonyCount)}`,
    `${label('High Alignment:')} ${String(stats.hasHighAlignmentCount)}`,
    `${label('Overall Clarity:')} ${colorScore(stats.overallClarity)}`,
    `${label('Navigator Grade:')} ${colorGrade(stats.navigatorGrade)}`,
    `${label('Best Point:')} ${stats.bestPoint}`,
    `${label('Clearest:')} ${stats.clearest}`,
    `${label('Most Structured:')} ${stats.mostStructured}`,
    `${label('Most Organized:')} ${stats.mostOrganized}`,
    `${label('Most Harmonious:')} ${stats.mostHarmonious}`,
  ]
  return parts.join('\n')
}

// ─── Recommendation Formatting ────────────────────────────────────

/**
 * Format recommendations as list
 * @example
 * formatRecommendations(recs) // bullet list
 */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return dim('No recommendations')
  const header = heading('Recommendations')
  const items = recommendations.map(r => `${dim('\u2022')} ${r}`)
  return `${header}\n${items.join('\n')}`
}

// ─── Full Result Formatting ───────────────────────────────────────

/**
 * Format complete result as table
 * @example
 * formatResultTable(result) // full colored output
 */
export function formatResultTable(result: AstralCompassResult): string {
  const sections = [
    formatPointsTable(result.points),
    '',
    formatSystemsTable(result.systems),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Cosmos')} ${label('Aligned:')} ${result.cosmos.isAligned ? high('Yes') : low('No')} ${label('Overall Clarity:')} ${colorScore(result.cosmos.overallClarity)}`,
    '',
    formatRecommendations(result.recommendations),
  ]
  return sections.join('\n')
}

/**
 * Format complete result as JSON
 * @example
 * formatResultJson(result) // JSON string
 */
export function formatResultJson(result: AstralCompassResult): string {
  return JSON.stringify(result, null, 2)
}
