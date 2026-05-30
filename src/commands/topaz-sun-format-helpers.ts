// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { TopazRay, TopazDeposit, TopazSunResult } from './topaz-sun-helpers.js'

// ─── Color Palette (golden topaz) ──────────────────────────────────
const high = chalk.rgb(255, 200, 60)
const midHigh = chalk.rgb(240, 180, 50)
const mid = chalk.rgb(225, 160, 40)
const lowMid = chalk.rgb(205, 140, 30)
const low = chalk.rgb(185, 120, 20)

const best = chalk.rgb(255, 215, 80).bold
const good = chalk.rgb(250, 200, 70)
const okay = chalk.rgb(235, 175, 55)
const poor = chalk.rgb(215, 150, 40)
const worst = chalk.rgb(195, 125, 25)

const heading = chalk.rgb(255, 220, 90).bold
const label = chalk.rgb(245, 205, 75)
const dim = chalk.rgb(155, 135, 105)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // bright golden
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
 * colorGrade('imperial-topaz') // best (bold gold)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'golden-sun': best, 'topaz-grade': best, 'flawless-crystal': best,
    'imperial-topaz': best, 'double-refraction': best,
    'brazilian-mine': best, 'golden-vein': best, 'master-lapidary': best,

    'warm-amber': good, 'proper-hard': good, 'clear-topaz': good,
    'golden-yellow': good, 'proper-birefringence': good, 'golden-gem': good,
    'ural-mountains': good, 'rich-seam': good, 'gem-expert': good,

    'proper-glow': okay, 'good-strength': okay, 'proper-clarity': okay,
    'proper-amber': okay, 'multi-angle': okay, 'proper-topaz': okay,
    'proper-deposit': okay, 'decent-yield': okay, 'skilled-cutter': okay,

    'cool-light': poor, 'medium-strength': poor, 'included': poor,
    'pale-yellow': poor, 'single-angle': poor, 'smoky-quartz': poor,
    'alluvial': poor, 'low-grade': poor, 'appraiser': poor,

    'dim-glow': worst, 'soft-stone': worst, 'cloudy': worst,
    'faded': worst, 'flat-view': worst, 'pebble': worst,
    'surface-find': worst, 'exhausted': worst, 'novice': worst,

    'dark': worst, 'crumbly': worst, 'opaque': worst,
    'colorless': worst, 'no-depth': worst, 'sand': worst,
    'no-deposit': worst, 'barren': worst, 'rock-hound': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Ray Formatting ────────────────────────────────────────────────

/**
 * Format a single ray for display
 * @example
 * formatRayTable(ray) // colored ray info
 */
export function formatRayTable(ray: TopazRay): string {
  const parts = [
    `${label('File:')} ${dim(ray.file)}`,
    `${label('Warmth:')} ${colorScore(ray.warmthGlow)} ${colorGrade(ray.glowing.grade)}`,
    `${label('Strength:')} ${colorScore(ray.hardnessStrength)} ${colorGrade(ray.strengthening.hardness)}`,
    `${label('Clarity:')} ${colorScore(ray.crystalClarity)} ${colorGrade(ray.clarifying.crystal)}`,
    `${label('Vibrancy:')} ${colorScore(ray.colorVibrancy)} ${colorGrade(ray.vibranting.color)}`,
    `${label('Refraction:')} ${colorScore(ray.dualRefraction)} ${colorGrade(ray.refracting.refraction)}`,
    `${label('Score:')} ${colorScore(ray.qualityScore)} ${colorGrade(ray.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format rays as summary table
 * @example
 * formatRaysTable(rays) // multi-line table
 */
export function formatRaysTable(rays: TopazRay[]): string {
  if (rays.length === 0) return dim('No topaz rays found')
  const header = heading('Topaz Sun Analysis')
  const rows = rays.map(r => formatRayTable(r))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Deposit Formatting ────────────────────────────────────────────

/**
 * Format a deposit for display
 * @example
 * formatDepositTable(deposit) // colored deposit info
 */
export function formatDepositTable(deposit: TopazDeposit): string {
  const parts = [
    `${label('Deposit:')} ${dim(deposit.directory)}`,
    `${label('Type:')} ${colorGrade(deposit.depositType)}`,
    `${label('Condition:')} ${colorGrade(deposit.condition)}`,
    `${label('Rays:')} ${String(deposit.rays.length)}`,
    `${label('Avg Warmth:')} ${colorScore(deposit.avgWarmth)}`,
    `${label('Avg Strength:')} ${colorScore(deposit.avgStrength)}`,
    `${label('Avg Clarity:')} ${colorScore(deposit.avgClarity)}`,
    `${label('Imperial Topaz:')} ${String(deposit.imperialTopazCount)}`,
    `${label('Sand:')} ${String(deposit.sandCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all deposits as summary
 * @example
 * formatDepositsTable(deposits) // multi-line deposit summary
 */
export function formatDepositsTable(deposits: TopazDeposit[]): string {
  if (deposits.length === 0) return dim('No topaz deposits found')
  const header = heading('Topaz Deposit Analysis')
  const rows = deposits.map(d => formatDepositTable(d))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: TopazSunResult['stats']): string {
  const parts = [
    heading('Topaz Sun Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Deposits:')} ${String(stats.totalDeposits)}`,
    `${label('Avg Warmth Glow:')} ${colorScore(stats.avgWarmthGlow)}`,
    `${label('Avg Hardness Strength:')} ${colorScore(stats.avgHardnessStrength)}`,
    `${label('Avg Crystal Clarity:')} ${colorScore(stats.avgCrystalClarity)}`,
    `${label('Avg Color Vibrancy:')} ${colorScore(stats.avgColorVibrancy)}`,
    `${label('Avg Dual Refraction:')} ${colorScore(stats.avgDualRefraction)}`,
    `${label('Imperial Topaz:')} ${String(stats.imperialTopazCount)}`,
    `${label('Golden Gem:')} ${String(stats.goldenGemCount)}`,
    `${label('Proper Topaz:')} ${String(stats.properTopazCount)}`,
    `${label('Smoky Quartz:')} ${String(stats.smokyQuartzCount)}`,
    `${label('Pebble:')} ${String(stats.pebbleCount)}`,
    `${label('Sand:')} ${String(stats.sandCount)}`,
    `${label('High Warmth:')} ${String(stats.hasHighWarmthCount)}`,
    `${label('High Strength:')} ${String(stats.hasHighStrengthCount)}`,
    `${label('High Clarity:')} ${String(stats.hasHighClarityCount)}`,
    `${label('High Vibrancy:')} ${String(stats.hasHighVibrancyCount)}`,
    `${label('High Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('Overall Brilliance:')} ${colorScore(stats.overallBrilliance)}`,
    `${label('Jeweler Grade:')} ${colorGrade(stats.jewelerGrade)}`,
    `${label('Best Ray:')} ${stats.bestRay}`,
    `${label('Warmest:')} ${stats.warmest}`,
    `${label('Strongest:')} ${stats.strongest}`,
    `${label('Clearest:')} ${stats.clearest}`,
    `${label('Most Vibrant:')} ${stats.mostVibrant}`,
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
export function formatResultTable(result: TopazSunResult): string {
  const sections = [
    formatRaysTable(result.rays),
    '',
    formatDepositsTable(result.deposits),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Sunshine')} ${label('Golden:')} ${result.sunshine.isGolden ? high('Yes') : low('No')} ${label('Overall Brilliance:')} ${colorScore(result.sunshine.overallBrilliance)}`,
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
export function formatResultJson(result: TopazSunResult): string {
  return JSON.stringify(result, null, 2)
}
