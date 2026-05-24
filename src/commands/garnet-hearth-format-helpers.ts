// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { GarnetEmber, GarnetHearth, GarnetHearthResult } from './garnet-hearth-helpers.js'

// ─── Color Palette (garnet deep red) ───────────────────────────────
const high = chalk.rgb(200, 60, 60)
const midHigh = chalk.rgb(185, 55, 55)
const mid = chalk.rgb(165, 45, 45)
const lowMid = chalk.rgb(145, 40, 40)
const low = chalk.rgb(125, 35, 35)

const best = chalk.rgb(220, 70, 70).bold
const good = chalk.rgb(205, 65, 65)
const okay = chalk.rgb(185, 55, 55)
const poor = chalk.rgb(165, 45, 45)
const worst = chalk.rgb(145, 35, 35)

const heading = chalk.rgb(230, 80, 80).bold
const label = chalk.rgb(215, 70, 70)
const dim = chalk.rgb(140, 100, 100)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // deep crimson
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
 * colorGrade('pyrope-treasure') // best (bold red)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'blazing-ember': best, 'dodecahedron-perfect': best, 'deep-crimson': best,
    'deep-devotion': best, 'bedrock-root': best, 'pyrope-treasure': best,
    'great-fireplace': best, 'blazing-hearth': best, 'hearth-master': best,

    'warm-glow': good, 'strong-crystal': good, 'warm-red': good,
    'strong-commitment': good, 'deep-grounded': good, 'almandine-gem': good,
    'proper-hearth': good, 'warm-fire': good, 'fire-keeper': good,

    'proper-fire': okay, 'proper-gem': okay, 'proper-garnet': okay,
    'proper-dedication': okay, 'proper-foundation': okay, 'proper-garnet': okay,
    'forge-fire': okay, 'steady-glow': okay, 'skilled-tender': okay,

    'cool-flame': poor, 'soft-crystal': poor, 'brownish-red': poor,
    'casual-effort': poor, 'shallow-root': poor, 'andradite': poor,
    'camp-fire': poor, 'dying-embers': poor, 'apprentice': poor,

    'dying-spark': worst, 'brittle-stone': worst, 'cool-red': worst,
    'half-hearted': worst, 'floating': worst, 'grossular-pebble': worst,
    'candle-flame': worst, 'cold-ashes': worst, 'novice': worst,

    'cold-ash': worst, 'crumbled': worst, 'colorless': worst,
    'abandoned': worst, 'no-ground': worst, 'sand': worst,
    'no-fire': worst, 'extinguished': worst, 'ice-cold': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Ember Formatting ──────────────────────────────────────────────

/**
 * Format a single ember for display
 * @example
 * formatEmberTable(ember) // colored ember info
 */
export function formatEmberTable(ember: GarnetEmber): string {
  const parts = [
    `${label('File:')} ${dim(ember.file)}`,
    `${label('Fire:')} ${colorScore(ember.innerFire)} ${colorGrade(ember.firing.grade)}`,
    `${label('Strength:')} ${colorScore(ember.crystalStrength)} ${colorGrade(ember.strengthening.crystal)}`,
    `${label('Warmth:')} ${colorScore(ember.colorWarmth)} ${colorGrade(ember.warming.color)}`,
    `${label('Commitment:')} ${colorScore(ember.commitmentDepth)} ${colorGrade(ember.committing.commitment)}`,
    `${label('Grounding:')} ${colorScore(ember.rootGrounding)} ${colorGrade(ember.grounding.foundation)}`,
    `${label('Score:')} ${colorScore(ember.qualityScore)} ${colorGrade(ember.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format embers as summary table
 * @example
 * formatEmbersTable(embers) // multi-line table
 */
export function formatEmbersTable(embers: GarnetEmber[]): string {
  if (embers.length === 0) return dim('No garnet embers found')
  const header = heading('Garnet Hearth Analysis')
  const rows = embers.map(e => formatEmberTable(e))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Hearth Formatting ─────────────────────────────────────────────

/**
 * Format a hearth for display
 * @example
 * formatHearthTable(hearth) // colored hearth info
 */
export function formatHearthTable(hearth: GarnetHearth): string {
  const parts = [
    `${label('Hearth:')} ${dim(hearth.directory)}`,
    `${label('Type:')} ${colorGrade(hearth.hearthType)}`,
    `${label('Condition:')} ${colorGrade(hearth.condition)}`,
    `${label('Embers:')} ${String(hearth.embers.length)}`,
    `${label('Avg Fire:')} ${colorScore(hearth.avgFire)}`,
    `${label('Avg Strength:')} ${colorScore(hearth.avgStrength)}`,
    `${label('Avg Warmth:')} ${colorScore(hearth.avgWarmth)}`,
    `${label('Pyrope Treasures:')} ${String(hearth.pyropeTreasureCount)}`,
    `${label('Sand:')} ${String(hearth.sandCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all hearths as summary
 * @example
 * formatHearthsTable(hearths) // multi-line hearth summary
 */
export function formatHearthsTable(hearths: GarnetHearth[]): string {
  if (hearths.length === 0) return dim('No garnet hearths found')
  const header = heading('Garnet Hearth Analysis')
  const rows = hearths.map(h => formatHearthTable(h))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: GarnetHearthResult['stats']): string {
  const parts = [
    heading('Garnet Hearth Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Hearths:')} ${String(stats.totalHearths)}`,
    `${label('Avg Inner Fire:')} ${colorScore(stats.avgInnerFire)}`,
    `${label('Avg Crystal Strength:')} ${colorScore(stats.avgCrystalStrength)}`,
    `${label('Avg Color Warmth:')} ${colorScore(stats.avgColorWarmth)}`,
    `${label('Avg Commitment Depth:')} ${colorScore(stats.avgCommitmentDepth)}`,
    `${label('Avg Root Grounding:')} ${colorScore(stats.avgRootGrounding)}`,
    `${label('Pyrope Treasures:')} ${String(stats.pyropeTreasureCount)}`,
    `${label('Almandine Gems:')} ${String(stats.almandineGemCount)}`,
    `${label('Proper Garnets:')} ${String(stats.properGarnetCount)}`,
    `${label('Andradite:')} ${String(stats.andraditeCount)}`,
    `${label('Grossular Pebbles:')} ${String(stats.grossularPebbleCount)}`,
    `${label('Sand:')} ${String(stats.sandCount)}`,
    `${label('High Fire:')} ${String(stats.hasHighFireCount)}`,
    `${label('High Strength:')} ${String(stats.hasHighStrengthCount)}`,
    `${label('High Warmth:')} ${String(stats.hasHighWarmthCount)}`,
    `${label('High Depth:')} ${String(stats.hasHighDepthCount)}`,
    `${label('High Root:')} ${String(stats.hasHighRootCount)}`,
    `${label('Overall Warmth:')} ${colorScore(stats.overallWarmth)}`,
    `${label('Keeper Grade:')} ${colorGrade(stats.keeperGrade)}`,
    `${label('Best Ember:')} ${stats.bestEmber}`,
    `${label('Most Fiery:')} ${stats.mostFiery}`,
    `${label('Strongest:')} ${stats.strongest}`,
    `${label('Warmest:')} ${stats.warmest}`,
    `${label('Most Committed:')} ${stats.mostCommitted}`,
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
export function formatResultTable(result: GarnetHearthResult): string {
  const sections = [
    formatEmbersTable(result.embers),
    '',
    formatHearthsTable(result.hearths),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Home')} ${label('Warm:')} ${result.home.isWarm ? high('Yes') : low('No')} ${label('Overall Warmth:')} ${colorScore(result.home.overallWarmth)}`,
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
export function formatResultJson(result: GarnetHearthResult): string {
  return JSON.stringify(result, null, 2)
}
