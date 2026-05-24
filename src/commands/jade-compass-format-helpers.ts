// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { JadeNeedle, CompassRose, JadeCompassResult } from './jade-compass-helpers.js'

// ─── Color Palette (jade compass — jade green/gold) ────────────────
const high = chalk.rgb(0, 168, 107)
const midHigh = chalk.rgb(30, 148, 100)
const mid = chalk.rgb(60, 130, 95)
const lowMid = chalk.rgb(90, 115, 85)
const low = chalk.rgb(75, 100, 75)

const best = chalk.rgb(0, 200, 120).bold
const good = chalk.rgb(40, 180, 110)
const okay = chalk.rgb(80, 160, 105)
const poor = chalk.rgb(120, 140, 95)
const worst = chalk.rgb(100, 120, 85)

const heading = chalk.rgb(0, 190, 115).bold
const label = chalk.rgb(40, 170, 110)
const dim = chalk.rgb(80, 140, 95)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // bright jade
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
 * colorGrade('master-compass') // best (bold jade)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'true-north': best, 'laser-precision': best, 'charted-waters': best,
    'perfect-balance': best, 'rock-steady': best, 'master-compass': best,
    'grand-compass-rose': best, 'navigation-masterpiece': best, 'grand-navigator': best,

    'clear-bearing': good, 'accurate-bearing': good, 'clear-map': good,
    'proper-equilibrium': good, 'stable-compass': good, 'jade-sextant': good,
    'proper-rose': good, 'reliable-compass': good, 'sea-captain': good,

    'proper-direction': okay, 'proper-aim': okay, 'proper-chart': okay,
    'decent-balance': okay, 'proper-needle': okay, 'proper-compass': okay,
    'decent-cardinal': okay, 'decent-guide': okay, 'skilled-pilot': okay,

    'vague-heading': poor, 'approximate-heading': poor, 'foggy-route': poor,
    'tilted-compass': poor, 'wavering-needle': poor, 'rusty-needle': poor,
    'simple-arrow': poor, 'unreliable-needle': poor, 'apprentice': poor,

    'lost-direction': worst, 'drifting-bearing': worst, 'uncharted-territory': worst,
    'unbalanced': worst, 'spinning-compass': worst, 'broken-compass': worst,
    'scratched-circle': worst, 'broken-device': worst, 'novice': worst,

    'no-direction': worst, 'no-bearing': worst, 'no-map': worst,
    'no-balance': worst, 'no-needle': worst, 'stone': worst,
    'no-rose': worst, 'void': worst, 'lost-wanderer': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Needle Formatting ─────────────────────────────────────────────

/**
 * Format a single needle for display
 * @example
 * formatNeedleTable(needle) // colored needle info
 */
export function formatNeedleTable(needle: JadeNeedle): string {
  const parts = [
    `${label('File:')} ${dim(needle.file)}`,
    `${label('Directional Clarity:')} ${colorScore(needle.directionalClarity)} ${colorGrade(needle.orienting.grade)}`,
    `${label('Bearing Accuracy:')} ${colorScore(needle.bearingAccuracy)} ${colorGrade(needle.calibrating.bearing)}`,
    `${label('Navigation Quality:')} ${colorScore(needle.navigationQuality)} ${colorGrade(needle.navigating.navigation)}`,
    `${label('Cardinal Balance:')} ${colorScore(needle.cardinalBalance)} ${colorGrade(needle.balancing.cardinal)}`,
    `${label('Needle Steadiness:')} ${colorScore(needle.needleSteadiness)} ${colorGrade(needle.steadying.needle)}`,
    `${label('Score:')} ${colorScore(needle.qualityScore)} ${colorGrade(needle.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format needles as summary table
 * @example
 * formatNeedlesTable(needles) // multi-line table
 */
export function formatNeedlesTable(needles: JadeNeedle[]): string {
  if (needles.length === 0) return dim('No jade needles found')
  const header = heading('Jade Compass Analysis')
  const rows = needles.map(n => formatNeedleTable(n))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Rose Formatting ───────────────────────────────────────────────

/**
 * Format a single rose for display
 * @example
 * formatRoseTable(rose) // colored rose info
 */
export function formatRoseTable(rose: CompassRose): string {
  const parts = [
    `${label('Rose:')} ${dim(rose.directory)}`,
    `${label('Type:')} ${colorGrade(rose.roseType)}`,
    `${label('Condition:')} ${colorGrade(rose.condition)}`,
    `${label('Needles:')} ${String(rose.needles.length)}`,
    `${label('Avg Clarity:')} ${colorScore(rose.avgClarity)}`,
    `${label('Avg Balance:')} ${colorScore(rose.avgBalance)}`,
    `${label('Avg Steadiness:')} ${colorScore(rose.avgSteadiness)}`,
    `${label('Master Compasses:')} ${String(rose.masterCompassCount)}`,
    `${label('Stones:')} ${String(rose.stoneCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all roses as summary
 * @example
 * formatRosesTable(roses) // multi-line summary
 */
export function formatRosesTable(roses: CompassRose[]): string {
  if (roses.length === 0) return dim('No compass roses found')
  const header = heading('Compass Roses')
  const rows = roses.map(r => formatRoseTable(r))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ──────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: JadeCompassResult['stats']): string {
  const parts = [
    heading('Jade Compass Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Roses:')} ${String(stats.totalRoses)}`,
    `${label('Avg Directional Clarity:')} ${colorScore(stats.avgDirectionalClarity)}`,
    `${label('Avg Bearing Accuracy:')} ${colorScore(stats.avgBearingAccuracy)}`,
    `${label('Avg Navigation Quality:')} ${colorScore(stats.avgNavigationQuality)}`,
    `${label('Avg Cardinal Balance:')} ${colorScore(stats.avgCardinalBalance)}`,
    `${label('Avg Needle Steadiness:')} ${colorScore(stats.avgNeedleSteadiness)}`,
    `${label('Master Compass:')} ${String(stats.masterCompassCount)}`,
    `${label('Jade Sextant:')} ${String(stats.jadeSextantCount)}`,
    `${label('Proper Compass:')} ${String(stats.properCompassCount)}`,
    `${label('Rusty Needle:')} ${String(stats.rustyNeedleCount)}`,
    `${label('Broken Compass:')} ${String(stats.brokenCompassCount)}`,
    `${label('Stone:')} ${String(stats.stoneCount)}`,
    `${label('High Clarity:')} ${String(stats.hasHighClarityCount)}`,
    `${label('High Accuracy:')} ${String(stats.hasHighAccuracyCount)}`,
    `${label('High Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('High Balance:')} ${String(stats.hasHighBalanceCount)}`,
    `${label('High Steadiness:')} ${String(stats.hasHighSteadinessCount)}`,
    `${label('Overall Navigation:')} ${colorScore(stats.overallNavigation)}`,
    `${label('Navigator Grade:')} ${colorGrade(stats.navigatorGrade)}`,
    `${label('Best Needle:')} ${stats.bestNeedle}`,
    `${label('Clearest Direction:')} ${stats.clearestDirection}`,
    `${label('Most Accurate:')} ${stats.mostAccurate}`,
    `${label('Most Navigable:')} ${stats.mostNavigable}`,
    `${label('Most Balanced:')} ${stats.mostBalanced}`,
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
export function formatResultTable(result: JadeCompassResult): string {
  const sections = [
    formatNeedlesTable(result.needles),
    '',
    formatRosesTable(result.roses),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Fleet')} ${label('True North:')} ${result.fleet.isTrueNorth ? high('Yes') : low('No')} ${label('Navigation:')} ${colorScore(result.fleet.overallNavigation)}`,
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
export function formatResultJson(result: JadeCompassResult): string {
  return JSON.stringify(result, null, 2)
}
