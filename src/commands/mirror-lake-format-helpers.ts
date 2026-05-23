// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { LakeReflection, LakeSystem, MirrorLakeResult } from './mirror-lake-helpers.js'

// ─── Color Palette ─────────────────────────────────────────────────
const high = chalk.rgb(120, 200, 255)
const midHigh = chalk.rgb(100, 175, 235)
const mid = chalk.rgb(80, 150, 210)
const lowMid = chalk.rgb(60, 125, 185)
const low = chalk.rgb(40, 100, 160)

const best = chalk.rgb(150, 220, 255).bold
const good = chalk.rgb(130, 200, 245)
const okay = chalk.rgb(110, 180, 230)
const poor = chalk.rgb(90, 155, 210)
const worst = chalk.rgb(70, 130, 185)

const heading = chalk.rgb(140, 215, 255).bold
const label = chalk.rgb(110, 185, 240)
const dim = chalk.rgb(150, 165, 175)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // lake blue
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
 * colorGrade('mountain-lake') // best (bold blue)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, string> = {
    'perfect-mirror': best, 'glass-surface': best, 'crystal-clear': best, 'instant-calm': best, 'pristine-ecosystem': best,
    'mountain-lake': best, 'great-lake': best, 'pristine-waters': best, 'lake-guardian': best,

    'clear-reflection': good, 'calm-waters': good, 'clear-water': good, 'quick-recovery': good, 'healthy-balance': good,
    'clear-pond': good, 'mountain-lake-system': good, 'healthy-lake': good, 'master-angler': good,

    'proper-image': okay, 'gentle-ripple': okay, 'proper-clarity': okay, 'proper-recovery': okay, 'proper-harmony': okay,
    'proper-lake': okay, 'forest-pond': okay, 'decent-pond': okay, 'skilled-ranger': okay,

    'distorted': poor, 'choppy': poor, 'murky': poor, 'slow-settle': poor, 'stressed-system': poor,
    'murky-pool': poor, 'garden-pool': poor, 'murky-pool-condition': poor, 'fisherman': poor,

    'rippled': worst, 'rough-waters': worst, 'cloudy': worst, 'persistent-ripple': worst, 'imbalanced': worst,
    'stagnant-water': worst, 'puddle': worst, 'stagnant': worst, 'tourist': worst,

    'opaque': worst, 'stormy': worst, 'opaque-depth': worst, 'permanent-wave': worst, 'dead-water': worst,
    'dry-bed': worst, 'no-water': worst, 'dried-up': worst, 'polluter': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Reflection Formatting ────────────────────────────────────────

/**
 * Format a single reflection for display
 * @example
 * formatReflectionTable(reflection) // colored reflection info
 */
export function formatReflectionTable(reflection: LakeReflection): string {
  const parts = [
    `${label('File:')} ${dim(reflection.file)}`,
    `${label('Reflection Quality:')} ${colorScore(reflection.reflectionQuality)} ${colorGrade(reflection.reflecting.grade)}`,
    `${label('Surface Calm:')} ${colorScore(reflection.surfaceCalm)} ${colorGrade(reflection.calming.surface)}`,
    `${label('Depth Clarity:')} ${colorScore(reflection.depthClarity)} ${colorGrade(reflection.clarifying.depth)}`,
    `${label('Ripple Resilience:')} ${colorScore(reflection.rippleResilience)} ${colorGrade(reflection.rippling.recovery)}`,
    `${label('Ecosystem Balance:')} ${colorScore(reflection.ecosystemBalance)} ${colorGrade(reflection.balancing.ecosystem)}`,
    `${label('Score:')} ${colorScore(reflection.qualityScore)} ${colorGrade(reflection.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format reflections as summary table
 * @example
 * formatReflectionsTable(reflections) // multi-line table
 */
export function formatReflectionsTable(reflections: LakeReflection[]): string {
  if (reflections.length === 0) return dim('No lake reflections found')
  const header = heading('Mirror Lake Reflection Analysis')
  const rows = reflections.map(r => formatReflectionTable(r))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Lake System Formatting ──────────────────────────────────────

/**
 * Format a lake system for display
 * @example
 * formatLakeTable(lake) // colored lake info
 */
export function formatLakeTable(lake: LakeSystem): string {
  const parts = [
    `${label('Lake:')} ${dim(lake.directory)}`,
    `${label('Type:')} ${colorGrade(lake.lakeType)}`,
    `${label('Condition:')} ${colorGrade(lake.condition)}`,
    `${label('Reflections:')} ${String(lake.reflections.length)}`,
    `${label('Avg Calm:')} ${colorScore(lake.avgCalm)}`,
    `${label('Avg Clarity:')} ${colorScore(lake.avgClarity)}`,
    `${label('Avg Balance:')} ${colorScore(lake.avgBalance)}`,
    `${label('Mountain Lake:')} ${String(lake.mountainLakeCount)}`,
    `${label('Dry Bed:')} ${String(lake.dryBedCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all lakes as summary
 * @example
 * formatLakesTable(lakes) // multi-line lake summary
 */
export function formatLakesTable(lakes: LakeSystem[]): string {
  if (lakes.length === 0) return dim('No lake systems found')
  const header = heading('Lake System Analysis')
  const rows = lakes.map(l => formatLakeTable(l))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ──────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: MirrorLakeResult['stats']): string {
  const parts = [
    heading('Mirror Lake Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Lakes:')} ${String(stats.totalLakes)}`,
    `${label('Avg Reflection Quality:')} ${colorScore(stats.avgReflectionQuality)}`,
    `${label('Avg Surface Calm:')} ${colorScore(stats.avgSurfaceCalm)}`,
    `${label('Avg Depth Clarity:')} ${colorScore(stats.avgDepthClarity)}`,
    `${label('Avg Ripple Resilience:')} ${colorScore(stats.avgRippleResilience)}`,
    `${label('Avg Ecosystem Balance:')} ${colorScore(stats.avgEcosystemBalance)}`,
    `${label('Mountain Lake:')} ${String(stats.mountainLakeCount)}`,
    `${label('Clear Pond:')} ${String(stats.clearPondCount)}`,
    `${label('Proper Lake:')} ${String(stats.properLakeCount)}`,
    `${label('Murky Pool:')} ${String(stats.murkyPoolCount)}`,
    `${label('Stagnant Water:')} ${String(stats.stagnantWaterCount)}`,
    `${label('Dry Bed:')} ${String(stats.dryBedCount)}`,
    `${label('High Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('High Calm:')} ${String(stats.hasHighCalmCount)}`,
    `${label('High Clarity:')} ${String(stats.hasHighClarityCount)}`,
    `${label('High Resilience:')} ${String(stats.hasHighResilienceCount)}`,
    `${label('High Balance:')} ${String(stats.hasHighBalanceCount)}`,
    `${label('Overall Serenity:')} ${colorScore(stats.overallSerenity)}`,
    `${label('Keeper Grade:')} ${colorGrade(stats.keeperGrade)}`,
    `${label('Best Reflection:')} ${stats.bestReflection}`,
    `${label('Most Reflective:')} ${stats.mostReflective}`,
    `${label('Calmest:')} ${stats.calmest}`,
    `${label('Clearest:')} ${stats.clearest}`,
    `${label('Most Resilient:')} ${stats.mostResilient}`,
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
export function formatResultTable(result: MirrorLakeResult): string {
  const sections = [
    formatReflectionsTable(result.reflections),
    '',
    formatLakesTable(result.lakes),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Watershed')} ${label('Clear:')} ${result.watershed.isClear ? high('Yes') : low('No')} ${label('Overall Serenity:')} ${colorScore(result.watershed.overallSerenity)}`,
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
export function formatResultJson(result: MirrorLakeResult): string {
  return JSON.stringify(result, null, 2)
}
