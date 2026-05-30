// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { NeonPrayer, TempleGrid, NeonTempleResult } from './neon-temple-helpers.js'

// ─── Color Palette (neon temple — cyan/magenta/electric blue) ──────
const high = chalk.rgb(0, 255, 255)
const midHigh = chalk.rgb(0, 220, 240)
const mid = chalk.rgb(0, 185, 225)
const lowMid = chalk.rgb(0, 150, 210)
const low = chalk.rgb(0, 115, 195)

const best = chalk.rgb(100, 255, 255).bold
const good = chalk.rgb(0, 255, 255)
const okay = chalk.rgb(0, 200, 230)
const poor = chalk.rgb(200, 0, 255)
const worst = chalk.rgb(100, 0, 150)

const heading = chalk.rgb(0, 255, 200).bold
const label = chalk.rgb(0, 200, 220)
const dim = chalk.rgb(0, 150, 180)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // cyan
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
 * colorGrade('divine-neon') // best (bold cyan)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'blinding-light': best, 'electric-energy': best, 'steady-beam': best,
    'divine-message': best, 'fusion-reactor': best, 'divine-neon': best,
    'neon-megachurch': best, 'neon-paradise': best, 'high-priest': best,

    'bright-neon': good, 'vibrant-pulse': good, 'consistent-glow': good,
    'clear-prayer': good, 'efficient-grid': good, 'radiant-temple': good,
    'glowing-temple': good, 'glowing-city': good, 'temple-guardian': good,

    'proper-glow': okay, 'proper-hum': okay, 'proper-light': okay,
    'proper-intent': okay, 'proper-power': okay, 'proper-shrine': okay,
    'decent-temple': okay, 'skilled-acolyte': okay,

    'dim-bulb': poor, 'dull-buzz': poor, 'flickering': poor,
    'mumbled-words': poor, 'wasteful-bulb': poor, 'dim-sanctuary': poor,
    'small-alter': poor, 'dim-block': poor, 'apprentice': poor,

    'flickering-neon': worst, 'flatline': worst, 'intermittent': worst,
    'silent-worship': worst, 'draining-circuit': worst, 'dark-chapel': worst,
    'dim-corner': worst, 'dark-alley': worst, 'novice': worst,

    'dark': worst, 'no-pulse': worst, 'no-prayer': worst,
    'no-power': worst, 'abandoned': worst, 'no-grid': worst,
    'void': worst, 'unbeliever': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Prayer Formatting ─────────────────────────────────────────────

/**
 * Format a single prayer for display
 * @example
 * formatPrayerTable(prayer) // colored prayer info
 */
export function formatPrayerTable(prayer: NeonPrayer): string {
  const parts = [
    `${label('File:')} ${dim(prayer.file)}`,
    `${label('Luminosity Quality:')} ${colorScore(prayer.luminosityQuality)} ${colorGrade(prayer.illuminating.grade)}`,
    `${label('Structure Vibrancy:')} ${colorScore(prayer.structureVibrancy)} ${colorGrade(prayer.vibrating.vibration)}`,
    `${label('Glow Consistency:')} ${colorScore(prayer.glowConsistency)} ${colorGrade(prayer.glowing.glow)}`,
    `${label('Prayer Clarity:')} ${colorScore(prayer.prayerClarity)} ${colorGrade(prayer.expressing.prayer)}`,
    `${label('Energy Efficiency:')} ${colorScore(prayer.energyEfficiency)} ${colorGrade(prayer.powering.energy)}`,
    `${label('Score:')} ${colorScore(prayer.qualityScore)} ${colorGrade(prayer.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format prayers as summary table
 * @example
 * formatPrayersTable(prayers) // multi-line table
 */
export function formatPrayersTable(prayers: NeonPrayer[]): string {
  if (prayers.length === 0) return dim('No neon prayers found')
  const header = heading('Neon Temple Analysis')
  const rows = prayers.map(p => formatPrayerTable(p))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Grid Formatting ───────────────────────────────────────────────

/**
 * Format a grid for display
 * @example
 * formatGridTable(grid) // colored grid info
 */
export function formatGridTable(grid: TempleGrid): string {
  const parts = [
    `${label('Grid:')} ${dim(grid.directory)}`,
    `${label('Type:')} ${colorGrade(grid.gridType)}`,
    `${label('Condition:')} ${colorGrade(grid.condition)}`,
    `${label('Prayers:')} ${String(grid.prayers.length)}`,
    `${label('Avg Luminosity:')} ${colorScore(grid.avgLuminosity)}`,
    `${label('Avg Consistency:')} ${colorScore(grid.avgConsistency)}`,
    `${label('Avg Efficiency:')} ${colorScore(grid.avgEfficiency)}`,
    `${label('Divine Neon:')} ${String(grid.divineNeonCount)}`,
    `${label('Abandoned:')} ${String(grid.abandonedCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all grids as summary
 * @example
 * formatGridsTable(grids) // multi-line summary
 */
export function formatGridsTable(grids: TempleGrid[]): string {
  if (grids.length === 0) return dim('No temple grids found')
  const header = heading('Temple Grids')
  const rows = grids.map(g => formatGridTable(g))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: NeonTempleResult['stats']): string {
  const parts = [
    heading('Neon Temple Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Grids:')} ${String(stats.totalGrids)}`,
    `${label('Avg Luminosity Quality:')} ${colorScore(stats.avgLuminosityQuality)}`,
    `${label('Avg Structure Vibrancy:')} ${colorScore(stats.avgStructureVibrancy)}`,
    `${label('Avg Glow Consistency:')} ${colorScore(stats.avgGlowConsistency)}`,
    `${label('Avg Prayer Clarity:')} ${colorScore(stats.avgPrayerClarity)}`,
    `${label('Avg Energy Efficiency:')} ${colorScore(stats.avgEnergyEfficiency)}`,
    `${label('Divine Neon:')} ${String(stats.divineNeonCount)}`,
    `${label('Radiant Temple:')} ${String(stats.radiantTempleCount)}`,
    `${label('Proper Shrine:')} ${String(stats.properShrineCount)}`,
    `${label('Dim Sanctuary:')} ${String(stats.dimSanctuaryCount)}`,
    `${label('Dark Chapel:')} ${String(stats.darkChapelCount)}`,
    `${label('Abandoned:')} ${String(stats.abandonedCount)}`,
    `${label('High Luminosity:')} ${String(stats.hasHighLuminosityCount)}`,
    `${label('High Vibrancy:')} ${String(stats.hasHighVibrancyCount)}`,
    `${label('High Consistency:')} ${String(stats.hasHighConsistencyCount)}`,
    `${label('High Clarity:')} ${String(stats.hasHighClarityCount)}`,
    `${label('High Efficiency:')} ${String(stats.hasHighEfficiencyCount)}`,
    `${label('Overall Brilliance:')} ${colorScore(stats.overallBrilliance)}`,
    `${label('Priest Grade:')} ${colorGrade(stats.priestGrade)}`,
    `${label('Best Prayer:')} ${stats.bestPrayer}`,
    `${label('Brightest:')} ${stats.brightest}`,
    `${label('Most Vibrant:')} ${stats.mostVibrant}`,
    `${label('Most Consistent:')} ${stats.mostConsistent}`,
    `${label('Most Efficient:')} ${stats.mostEfficient}`,
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
export function formatResultTable(result: NeonTempleResult): string {
  const sections = [
    formatPrayersTable(result.prayers),
    '',
    formatGridsTable(result.grids),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('City Summary')} ${label('Radiant:')} ${result.city.isRadiant ? high('Yes') : low('No')} ${label('Overall Brilliance:')} ${colorScore(result.city.overallBrilliance)}`,
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
export function formatResultJson(result: NeonTempleResult): string {
  return JSON.stringify(result, null, 2)
}
