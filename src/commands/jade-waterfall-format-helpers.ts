// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { WaterDrop, WaterfallTerrace, JadeWaterfallResult } from './jade-waterfall-helpers.js'

// ─── Color Palette (jade waterfall — jade/teal/cyan) ──────────────
const high = chalk.rgb(0, 200, 150)
const midHigh = chalk.rgb(0, 175, 130)
const mid = chalk.rgb(0, 150, 110)
const lowMid = chalk.rgb(0, 125, 90)
const low = chalk.rgb(0, 100, 70)

const best = chalk.rgb(50, 255, 180).bold
const good = chalk.rgb(0, 220, 150)
const okay = chalk.rgb(0, 185, 125)
const poor = chalk.rgb(0, 140, 95)
const worst = chalk.rgb(0, 95, 60)

const heading = chalk.rgb(30, 220, 160).bold
const label = chalk.rgb(15, 195, 140)
const dim = chalk.rgb(10, 165, 115)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // jade
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
 * colorGrade('water-master') // best (bold jade)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'silk-waterfall': best, 'crystal-steps': best, 'deep-jade-pool': best,
    'ancient-moss': best, 'crystal-mist': best, 'jade-masterpiece': best,
    'grand-waterfall': best, 'magnificent-falls': best, 'water-master': best,

    'graceful-cascade': good, 'clear-terraces': good, 'proper-depth': good,
    'thriving-green': good, 'clear-vapor': good, 'emerald-falls': good,
    'terraced-falls': good, 'beautiful-cascade': good, 'river-guardian': good,

    'proper-flow': okay, 'proper-cascade': okay, 'decent-pond': okay,
    'proper-growth': okay, 'proper-transparency': okay, 'proper-waterfall': okay,
    'proper-cascade': okay, 'decent-waterfall': okay, 'skilled-steward': okay,

    'turbulent-rapids': poor, 'murky-drops': poor, 'shallow-puddle': poor,
    'wilting-fern': poor, 'foggy-haze': poor, 'trickling-stream': poor,
    'small-rapids': poor, 'modest-stream': poor, 'apprentice': poor,

    'blocked-stream': worst, 'muddy-slide': worst, 'surface-drip': worst,
    'dead-lichen': worst, 'dense-fog': worst, 'dry-bed': worst,
    'drip-trickle': worst, 'dry-cliff': worst, 'novice': worst,

    'no-flow': worst, 'no-cascade': worst, 'no-pool': worst,
    'no-growth': worst, 'opaque': worst, 'drought': worst,
    'no-terrace': worst, 'void': worst, 'drought-bringer': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Drop Formatting ──────────────────────────────────────────────

/**
 * Format a single drop for display
 * @example
 * formatDropTable(drop) // colored drop info
 */
export function formatDropTable(drop: WaterDrop): string {
  const parts = [
    `${label('File:')} ${dim(drop.file)}`,
    `${label('Flow Grace:')} ${colorScore(drop.flowGrace)} ${colorGrade(drop.flowing.grade)}`,
    `${label('Cascade Clarity:')} ${colorScore(drop.cascadeClarity)} ${colorGrade(drop.cascading.cascade)}`,
    `${label('Pool Depth:')} ${colorScore(drop.poolDepth)} ${colorGrade(drop.gathering.pool)}`,
    `${label('Moss Resilience:')} ${colorScore(drop.mossResilience)} ${colorGrade(drop.thriving.moss)}`,
    `${label('Mist Clarity:')} ${colorScore(drop.mistClarity)} ${colorGrade(drop.clarifying.mist)}`,
    `${label('Score:')} ${colorScore(drop.qualityScore)} ${colorGrade(drop.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format drops as summary table
 * @example
 * formatDropsTable(drops) // multi-line table
 */
export function formatDropsTable(drops: WaterDrop[]): string {
  if (drops.length === 0) return dim('No water drops found')
  const header = heading('Jade Waterfall Analysis')
  const rows = drops.map(d => formatDropTable(d))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Terrace Formatting ───────────────────────────────────────────

/**
 * Format a terrace for display
 * @example
 * formatTerraceTable(terrace) // colored terrace info
 */
export function formatTerraceTable(terrace: WaterfallTerrace): string {
  const parts = [
    `${label('Terrace:')} ${dim(terrace.directory)}`,
    `${label('Type:')} ${colorGrade(terrace.terraceType)}`,
    `${label('Condition:')} ${colorGrade(terrace.condition)}`,
    `${label('Drops:')} ${String(terrace.drops.length)}`,
    `${label('Avg Grace:')} ${colorScore(terrace.avgGrace)}`,
    `${label('Avg Depth:')} ${colorScore(terrace.avgDepth)}`,
    `${label('Avg Clarity:')} ${colorScore(terrace.avgClarity)}`,
    `${label('Jade Masterpieces:')} ${String(terrace.jadeMasterpieceCount)}`,
    `${label('Drought Count:')} ${String(terrace.droughtCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all terraces as summary
 * @example
 * formatTerracesTable(terraces) // multi-line summary
 */
export function formatTerracesTable(terraces: WaterfallTerrace[]): string {
  if (terraces.length === 0) return dim('No waterfall terraces found')
  const header = heading('Waterfall Terraces')
  const rows = terraces.map(t => formatTerraceTable(t))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ──────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: JadeWaterfallResult['stats']): string {
  const parts = [
    heading('Jade Waterfall Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Terraces:')} ${String(stats.totalTerraces)}`,
    `${label('Avg Flow Grace:')} ${colorScore(stats.avgFlowGrace)}`,
    `${label('Avg Cascade Clarity:')} ${colorScore(stats.avgCascadeClarity)}`,
    `${label('Avg Pool Depth:')} ${colorScore(stats.avgPoolDepth)}`,
    `${label('Avg Moss Resilience:')} ${colorScore(stats.avgMossResilience)}`,
    `${label('Avg Mist Clarity:')} ${colorScore(stats.avgMistClarity)}`,
    `${label('Jade Masterpiece:')} ${String(stats.jadeMasterpieceCount)}`,
    `${label('Emerald Falls:')} ${String(stats.emeraldFallsCount)}`,
    `${label('Proper Waterfall:')} ${String(stats.properWaterfallCount)}`,
    `${label('Trickling Stream:')} ${String(stats.tricklingStreamCount)}`,
    `${label('Dry Bed:')} ${String(stats.dryBedCount)}`,
    `${label('Drought:')} ${String(stats.droughtCount)}`,
    `${label('High Grace:')} ${String(stats.hasHighGraceCount)}`,
    `${label('High Clarity:')} ${String(stats.hasHighClarityCount)}`,
    `${label('High Depth:')} ${String(stats.hasHighDepthCount)}`,
    `${label('High Resilience:')} ${String(stats.hasHighResilienceCount)}`,
    `${label('High Mist Clarity:')} ${String(stats.hasHighMistClarityCount)}`,
    `${label('Overall Serenity:')} ${colorScore(stats.overallSerenity)}`,
    `${label('Keeper Grade:')} ${colorGrade(stats.keeperGrade)}`,
    `${label('Best Drop:')} ${stats.bestDrop}`,
    `${label('Most Graceful:')} ${stats.mostGraceful}`,
    `${label('Clearest Cascade:')} ${stats.clearestCascade}`,
    `${label('Deepest:')} ${stats.deepest}`,
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
export function formatResultTable(result: JadeWaterfallResult): string {
  const sections = [
    formatDropsTable(result.drops),
    '',
    formatTerracesTable(result.terraces),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('River')} ${label('Flowing:')} ${result.river.isFlowing ? high('Yes') : low('No')} ${label('Overall Serenity:')} ${colorScore(result.river.overallSerenity)}`,
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
export function formatResultJson(result: JadeWaterfallResult): string {
  return JSON.stringify(result, null, 2)
}
