// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { PhoenixEmber, PhoenixNest, EmberPhoenixResult } from './ember-phoenix-helpers.js'

// ─── Color Palette ─────────────────────────────────────────────────
const high = chalk.rgb(255, 100, 50)
const midHigh = chalk.rgb(255, 165, 0)
const mid = chalk.rgb(220, 120, 20)
const lowMid = chalk.rgb(180, 80, 10)
const low = chalk.rgb(100, 50, 20)

const best = chalk.rgb(255, 80, 30).bold
const good = chalk.rgb(255, 140, 0)
const okay = chalk.rgb(220, 120, 20)
const poor = chalk.rgb(180, 80, 10)
const worst = chalk.rgb(80, 40, 20)

const heading = chalk.rgb(255, 100, 50).bold
const label = chalk.rgb(255, 165, 0)
const dim = chalk.rgb(160, 140, 120)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // fiery orange
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
 * colorGrade('legendary-phoenix') // best (fiery bold)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, typeof best> = {
    'legendary-phoenix': best, 'ancient-wisdom': best, 'white-flame': best,
    'majestic-wings': best, 'immortal': best, 'immortal-phoenix': best,
    'golden-nest': best, 'eternal-flame': best, 'phoenix-lord': best,

    'rising-phoenix': good, 'sage-knowledge': good, 'golden-fire': good,
    'broad-wings': good, 'fast-revival': good, 'rising-flame': good,
    'proper-nest': good, 'burning-bright': good, 'fire-keeper': good,

    'reborn-bird': okay, 'proper-learning': okay, 'proper-blaze': okay,
    'proper-span': okay, 'proper-recovery': okay, 'steady-glow': okay,
    'twig-nest': okay, 'flame-guardian': okay,

    'struggling-chick': poor, 'shallow-wisdom': poor, 'smoky-fire': poor,
    'narrow-wings': poor, 'slow-revival': poor, 'flickering': poor,
    'ground-nest': poor, 'fading-light': poor, 'ember-tender': poor,

    'sinking-ash': worst, 'unlearned': worst, 'dying-ember': worst,
    'clipped-wings': worst, 'near-death': worst,
    'ash-pile': worst, 'dying-embers': worst, 'ash-collector': worst,

    'extinguished': worst, 'ignorant': worst, 'cold-ash': worst,
    'broken-wings': worst, 'terminal': worst,
    'empty-hearth': worst, 'fire-extinguisher': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Ember Formatting ──────────────────────────────────────────────

/**
 * Format a single ember for display
 * @example
 * formatEmberTable(ember) // colored ember info
 */
export function formatEmberTable(ember: PhoenixEmber): string {
  const parts = [
    `${label('File:')} ${dim(ember.file)}`,
    `${label('Rebirth Quality:')} ${colorScore(ember.rebirthQuality)} ${colorGrade(ember.rebirthing.grade)}`,
    `${label('Ash Wisdom:')} ${colorScore(ember.ashWisdom)} ${colorGrade(ember.learning.insight)}`,
    `${label('Flame Purity:')} ${colorScore(ember.flamePurity)} ${colorGrade(ember.purifying.flame)}`,
    `${label('Wing Span:')} ${colorScore(ember.wingSpan)} ${colorGrade(ember.spreading.wings)}`,
    `${label('Resurrection Potential:')} ${colorScore(ember.resurrectionPotential)} ${colorGrade(ember.resurrecting.capacity)}`,
    `${label('Score:')} ${colorScore(ember.qualityScore)} ${colorGrade(ember.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format embers as summary table
 * @example
 * formatEmbersTable(embers) // multi-line table
 */
export function formatEmbersTable(embers: PhoenixEmber[]): string {
  if (embers.length === 0) return dim('No phoenix embers found')
  const header = heading('Phoenix Ember Analysis')
  const rows = embers.map(e => formatEmberTable(e))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Nest Formatting ───────────────────────────────────────────────

/**
 * Format a nest for display
 * @example
 * formatNestTable(nest) // colored nest info
 */
export function formatNestTable(nest: PhoenixNest): string {
  const parts = [
    `${label('Nest:')} ${dim(nest.directory)}`,
    `${label('Type:')} ${colorGrade(nest.nestType)}`,
    `${label('Condition:')} ${colorGrade(nest.condition)}`,
    `${label('Embers:')} ${String(nest.embers.length)}`,
    `${label('Avg Rebirth:')} ${colorScore(nest.avgRebirth)}`,
    `${label('Avg Wisdom:')} ${colorScore(nest.avgWisdom)}`,
    `${label('Avg Purity:')} ${colorScore(nest.avgPurity)}`,
    `${label('Immortal Phoenixes:')} ${String(nest.immortalPhoenixCount)}`,
    `${label('Cold Ash:')} ${String(nest.coldAshCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all nests as summary
 * @example
 * formatNestsTable(nests) // multi-line nest summary
 */
export function formatNestsTable(nests: PhoenixNest[]): string {
  if (nests.length === 0) return dim('No phoenix nests found')
  const header = heading('Phoenix Nest Analysis')
  const rows = nests.map(n => formatNestTable(n))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ──────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: EmberPhoenixResult['stats']): string {
  const parts = [
    heading('Flame Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Nests:')} ${String(stats.totalNests)}`,
    `${label('Avg Rebirth Quality:')} ${colorScore(stats.avgRebirthQuality)}`,
    `${label('Avg Ash Wisdom:')} ${colorScore(stats.avgAshWisdom)}`,
    `${label('Avg Flame Purity:')} ${colorScore(stats.avgFlamePurity)}`,
    `${label('Avg Wing Span:')} ${colorScore(stats.avgWingSpan)}`,
    `${label('Avg Resurrection Potential:')} ${colorScore(stats.avgResurrectionPotential)}`,
    `${label('Immortal Phoenixes:')} ${String(stats.immortalPhoenixCount)}`,
    `${label('Rising Flames:')} ${String(stats.risingFlameCount)}`,
    `${label('Steady Glows:')} ${String(stats.steadyGlowCount)}`,
    `${label('Flickering:')} ${String(stats.flickeringCount)}`,
    `${label('Dying Embers:')} ${String(stats.dyingEmberCount)}`,
    `${label('Cold Ash:')} ${String(stats.coldAshCount)}`,
    `${label('High Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('High Wisdom:')} ${String(stats.hasHighWisdomCount)}`,
    `${label('High Purity:')} ${String(stats.hasHighPurityCount)}`,
    `${label('High Span:')} ${String(stats.hasHighSpanCount)}`,
    `${label('High Potential:')} ${String(stats.hasHighPotentialCount)}`,
    `${label('Overall Resilience:')} ${colorScore(stats.overallResilience)}`,
    `${label('Keeper Grade:')} ${colorGrade(stats.keeperGrade)}`,
    `${label('Best Ember:')} ${stats.bestEmber}`,
    `${label('Most Reborn:')} ${stats.mostReborn}`,
    `${label('Wisest:')} ${stats.wisest}`,
    `${label('Purest:')} ${stats.purest}`,
    `${label('Broadest:')} ${stats.broadest}`,
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
export function formatResultTable(result: EmberPhoenixResult): string {
  const sections = [
    formatEmbersTable(result.embers),
    '',
    formatNestsTable(result.nests),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Flame')} ${label('Burning:')} ${result.flame.isBurning ? high('Yes') : low('No')} ${label('Overall Resilience:')} ${colorScore(result.flame.overallResilience)}`,
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
export function formatResultJson(result: EmberPhoenixResult): string {
  return JSON.stringify(result, null, 2)
}
