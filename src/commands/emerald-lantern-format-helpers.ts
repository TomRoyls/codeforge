// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { EmeraldFlame, LanternHall, EmeraldLanternResult } from './emerald-lantern-helpers.js'

// ─── Color Palette (emerald lantern — green/emerald/jade) ──────────
const high = chalk.rgb(0, 200, 100)
const midHigh = chalk.rgb(0, 175, 85)
const mid = chalk.rgb(0, 150, 70)
const lowMid = chalk.rgb(0, 125, 55)
const low = chalk.rgb(0, 100, 40)

const best = chalk.rgb(50, 255, 130).bold
const good = chalk.rgb(0, 200, 100)
const okay = chalk.rgb(0, 165, 75)
const poor = chalk.rgb(0, 120, 50)
const worst = chalk.rgb(0, 80, 30)

const heading = chalk.rgb(30, 210, 110).bold
const label = chalk.rgb(15, 185, 95)
const dim = chalk.rgb(10, 155, 75)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // emerald green
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
 * colorGrade('legendary-lantern') // best (bold emerald)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'beacon-light': best, 'flawless-emerald': best, 'eternal-flame': best,
    'pure-signal': best, 'lighthouse-beam': best, 'legendary-lantern': best,
    'grand-hall': best, 'illuminated-palace': best, 'light-keeper': best,

    'bright-lantern': good, 'clear-lens': good, 'steady-burn': good,
    'clean-filter': good, 'far-reaching': good, 'emerald-beacon': good,
    'lantern-gallery': good, 'bright-gallery': good, 'lantern-master': good,

    'proper-glow': okay, 'proper-transparency': okay, 'proper-flicker': okay,
    'proper-filtration': okay, 'proper-spread': okay, 'proper-lamp': okay,
    'proper-corridor': okay, 'decent-hallway': okay, 'skilled-illuminator': okay,

    'dim-light': poor, 'cloudy-glass': poor, 'unsteady-flame': poor,
    'noisy-filter': poor, 'short-range': poor, 'rusty-lantern': poor,
    'dim-passageway': poor, 'dim-corridor': poor, 'apprentice': poor,

    'flickering-candle': worst, 'cracked-lens': worst, 'dying-ember': worst,
    'clogged-lens': worst, 'dim-corner': worst, 'cracked-glass': worst,
    'dark-alley': worst, 'dark-tunnel': worst, 'novice': worst,

    'dark': worst, 'opaque': worst, 'no-flame': worst,
    'no-filter': worst, 'no-reach': worst, 'extinguished': worst,
    'no-hall': worst, 'void': worst, 'dark-dweller': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Flame Formatting ──────────────────────────────────────────────

/**
 * Format a single flame for display
 * @example
 * formatFlameTable(flame) // colored flame info
 */
export function formatFlameTable(flame: EmeraldFlame): string {
  const parts = [
    `${label('File:')} ${dim(flame.file)}`,
    `${label('Illumination Quality:')} ${colorScore(flame.illuminationQuality)} ${colorGrade(flame.brightening.grade)}`,
    `${label('Lens Clarity:')} ${colorScore(flame.lensClarity)} ${colorGrade(flame.clarifying.lens)}`,
    `${label('Flame Stability:')} ${colorScore(flame.flameStability)} ${colorGrade(flame.stabilizing.flame)}`,
    `${label('Emerald Filtration:')} ${colorScore(flame.emeraldFiltration)} ${colorGrade(flame.filtering.emerald)}`,
    `${label('Light Reach:')} ${colorScore(flame.lightReach)} ${colorGrade(flame.reaching.light)}`,
    `${label('Score:')} ${colorScore(flame.qualityScore)} ${colorGrade(flame.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format flames as summary table
 * @example
 * formatFlamesTable(flames) // multi-line table
 */
export function formatFlamesTable(flames: EmeraldFlame[]): string {
  if (flames.length === 0) return dim('No emerald flames found')
  const header = heading('Emerald Lantern Analysis')
  const rows = flames.map(f => formatFlameTable(f))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Hall Formatting ───────────────────────────────────────────────

/**
 * Format a hall for display
 * @example
 * formatHallTable(hall) // colored hall info
 */
export function formatHallTable(hall: LanternHall): string {
  const parts = [
    `${label('Hall:')} ${dim(hall.directory)}`,
    `${label('Type:')} ${colorGrade(hall.hallType)}`,
    `${label('Condition:')} ${colorGrade(hall.condition)}`,
    `${label('Flames:')} ${String(hall.flames.length)}`,
    `${label('Avg Illumination:')} ${colorScore(hall.avgIllumination)}`,
    `${label('Avg Clarity:')} ${colorScore(hall.avgClarity)}`,
    `${label('Avg Stability:')} ${colorScore(hall.avgStability)}`,
    `${label('Legendary Lanterns:')} ${String(hall.legendaryLanternCount)}`,
    `${label('Extinguished:')} ${String(hall.extinguishedCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all halls as summary
 * @example
 * formatHallsTable(halls) // multi-line summary
 */
export function formatHallsTable(halls: LanternHall[]): string {
  if (halls.length === 0) return dim('No lantern halls found')
  const header = heading('Lantern Halls')
  const rows = halls.map(h => formatHallTable(h))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ──────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: EmeraldLanternResult['stats']): string {
  const parts = [
    heading('Emerald Lantern Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Halls:')} ${String(stats.totalHalls)}`,
    `${label('Avg Illumination Quality:')} ${colorScore(stats.avgIlluminationQuality)}`,
    `${label('Avg Lens Clarity:')} ${colorScore(stats.avgLensClarity)}`,
    `${label('Avg Flame Stability:')} ${colorScore(stats.avgFlameStability)}`,
    `${label('Avg Emerald Filtration:')} ${colorScore(stats.avgEmeraldFiltration)}`,
    `${label('Avg Light Reach:')} ${colorScore(stats.avgLightReach)}`,
    `${label('Legendary Lantern:')} ${String(stats.legendaryLanternCount)}`,
    `${label('Emerald Beacon:')} ${String(stats.emeraldBeaconCount)}`,
    `${label('Proper Lamp:')} ${String(stats.properLampCount)}`,
    `${label('Rusty Lantern:')} ${String(stats.rustyLanternCount)}`,
    `${label('Cracked Glass:')} ${String(stats.crackedGlassCount)}`,
    `${label('Extinguished:')} ${String(stats.extinguishedCount)}`,
    `${label('High Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('High Clarity:')} ${String(stats.hasHighClarityCount)}`,
    `${label('High Stability:')} ${String(stats.hasHighStabilityCount)}`,
    `${label('High Filtration:')} ${String(stats.hasHighFiltrationCount)}`,
    `${label('High Reach:')} ${String(stats.hasHighReachCount)}`,
    `${label('Overall Brilliance:')} ${colorScore(stats.overallBrilliance)}`,
    `${label('Keeper Grade:')} ${colorGrade(stats.keeperGrade)}`,
    `${label('Best Flame:')} ${stats.bestFlame}`,
    `${label('Brightest:')} ${stats.brightest}`,
    `${label('Clearest:')} ${stats.clearest}`,
    `${label('Most Stable:')} ${stats.mostStable}`,
    `${label('Farthest Reach:')} ${stats.farthestReach}`,
  ]
  return parts.join('\n')
}

// ─── Recommendation Formatting ─────────────────────────────────────

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

// ─── Full Result Formatting ────────────────────────────────────────

/**
 * Format complete result as table
 * @example
 * formatResultTable(result) // full colored output
 */
export function formatResultTable(result: EmeraldLanternResult): string {
  const sections = [
    formatFlamesTable(result.flames),
    '',
    formatHallsTable(result.halls),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Light')} ${label('Bright:')} ${result.light.isBright ? high('Yes') : low('No')} ${label('Overall Brilliance:')} ${colorScore(result.light.overallBrilliance)}`,
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
export function formatResultJson(result: EmeraldLanternResult): string {
  return JSON.stringify(result, null, 2)
}
