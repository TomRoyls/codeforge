// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { PhoenixEmber, PhoenixFlock, StormPhoenixResult } from './storm-phoenix-helpers.js'

// ─── Color Palette (storm phoenix — orange/amber) ─────────────────
const high = chalk.rgb(255, 140, 50)
const midHigh = chalk.rgb(240, 120, 60)
const mid = chalk.rgb(220, 100, 70)
const lowMid = chalk.rgb(200, 85, 80)
const low = chalk.rgb(180, 70, 90)

const best = chalk.rgb(255, 160, 40).bold
const good = chalk.rgb(245, 135, 50)
const okay = chalk.rgb(225, 110, 65)
const poor = chalk.rgb(200, 90, 80)
const worst = chalk.rgb(175, 75, 95)

const heading = chalk.rgb(255, 130, 30).bold
const label = chalk.rgb(240, 115, 55)
const dim = chalk.rgb(190, 150, 130)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // amber
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
 * colorGrade('mythical-phoenix') // best (bold amber)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'divine-rebirth': best, 'impervious-shield': best, 'ancient-wisdom': best,
    'lightning-fast': best, 'phoenix-ascension': best, 'mythical-phoenix': best,
    'eternal-flock': best, 'legendary-sky': best, 'phoenix-lord': best,

    'graceful-renewal': good, 'storm-proof': good, 'experienced-flame': good,
    'quick-adapt': good, 'ash-to-beauty': good, 'soaring-bird': good,
    'storm-riders': good, 'storm-survivors': good, 'storm-rider': good,

    'proper-rebirth': okay, 'weather-resistant': okay, 'proper-glow': okay,
    'proper-flex': okay, 'proper-transform': okay, 'proper-fledgling': okay,
    'proper-flock': okay, 'decent-flight': okay, 'skilled-flyer': okay,

    'struggling-revival': poor, 'storm-vulnerable': poor, 'dying-ember': poor,
    'slow-response': poor, 'partial-conversion': poor, 'wounded-bird': poor,
    'scattered-feathers': poor, 'grounded': poor, 'apprentice': poor,

    'failed-resurrection': worst, 'easily-damaged': worst, 'cold-ash': worst,
    'rigid-body': worst, 'wasted-ash': worst, 'fallen-phoenix': worst,
    'fallen-flock': worst, 'extinguished': worst, 'novice': worst,

    'ashes-only': worst, 'no-protection': worst, 'no-wisdom': worst,
    'petrified': worst, 'no-transformation': worst, 'egg': worst,
    'no-flock': worst, 'void': worst, 'flightless': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Ember Formatting ─────────────────────────────────────────────

/**
 * Format a single ember for display
 * @example
 * formatEmberTable(ember) // colored ember info
 */
export function formatEmberTable(ember: PhoenixEmber): string {
  const parts = [
    `${label('File:')} ${dim(ember.file)}`,
    `${label('Rebirth Quality:')} ${colorScore(ember.rebirthQuality)} ${colorGrade(ember.rebirthing.grade)}`,
    `${label('Storm Resilience:')} ${colorScore(ember.stormResilience)} ${colorGrade(ember.weathering.storm)}`,
    `${label('Ember Wisdom:')} ${colorScore(ember.emberWisdom)} ${colorGrade(ember.learning.ember)}`,
    `${label('Lightning Adaptation:')} ${colorScore(ember.lightningAdaptation)} ${colorGrade(ember.adapting.lightning)}`,
    `${label('Ash Transformation:')} ${colorScore(ember.ashTransformation)} ${colorGrade(ember.transforming.ash)}`,
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
  const header = heading('Storm Phoenix Analysis')
  const rows = embers.map(e => formatEmberTable(e))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Flock Formatting ─────────────────────────────────────────────

/**
 * Format a flock for display
 * @example
 * formatFlockTable(flock) // colored flock info
 */
export function formatFlockTable(flock: PhoenixFlock): string {
  const parts = [
    `${label('Flock:')} ${dim(flock.directory)}`,
    `${label('Type:')} ${colorGrade(flock.flockType)}`,
    `${label('Condition:')} ${colorGrade(flock.condition)}`,
    `${label('Embers:')} ${String(flock.embers.length)}`,
    `${label('Avg Rebirth:')} ${colorScore(flock.avgRebirth)}`,
    `${label('Avg Resilience:')} ${colorScore(flock.avgResilience)}`,
    `${label('Avg Adaptation:')} ${colorScore(flock.avgAdaptation)}`,
    `${label('Mythical Phoenixes:')} ${String(flock.mythicalPhoenixCount)}`,
    `${label('Eggs:')} ${String(flock.eggCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all flocks as summary
 * @example
 * formatFlocksTable(flocks) // multi-line flock summary
 */
export function formatFlocksTable(flocks: PhoenixFlock[]): string {
  if (flocks.length === 0) return dim('No phoenix flocks found')
  const header = heading('Phoenix Flocks')
  const rows = flocks.map(f => formatFlockTable(f))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: StormPhoenixResult['stats']): string {
  const parts = [
    heading('Storm Phoenix Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Flocks:')} ${String(stats.totalFlocks)}`,
    `${label('Avg Rebirth Quality:')} ${colorScore(stats.avgRebirthQuality)}`,
    `${label('Avg Storm Resilience:')} ${colorScore(stats.avgStormResilience)}`,
    `${label('Avg Ember Wisdom:')} ${colorScore(stats.avgEmberWisdom)}`,
    `${label('Avg Lightning Adaptation:')} ${colorScore(stats.avgLightningAdaptation)}`,
    `${label('Avg Ash Transformation:')} ${colorScore(stats.avgAshTransformation)}`,
    `${label('Mythical Phoenixes:')} ${String(stats.mythicalPhoenixCount)}`,
    `${label('Soaring Birds:')} ${String(stats.soaringBirdCount)}`,
    `${label('Proper Fledglings:')} ${String(stats.properFledglingCount)}`,
    `${label('Wounded Birds:')} ${String(stats.woundedBirdCount)}`,
    `${label('Fallen Phoenixes:')} ${String(stats.fallenPhoenixCount)}`,
    `${label('Eggs:')} ${String(stats.eggCount)}`,
    `${label('High Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('High Resilience:')} ${String(stats.hasHighResilienceCount)}`,
    `${label('High Wisdom:')} ${String(stats.hasHighWisdomCount)}`,
    `${label('High Adaptation:')} ${String(stats.hasHighAdaptationCount)}`,
    `${label('High Transformation:')} ${String(stats.hasHighTransformationCount)}`,
    `${label('Overall Power:')} ${colorScore(stats.overallPower)}`,
    `${label('Aviator Grade:')} ${colorGrade(stats.aviatorGrade)}`,
    `${label('Best Ember:')} ${stats.bestEmber}`,
    `${label('Best Rebirth:')} ${stats.bestRebirth}`,
    `${label('Most Resilient:')} ${stats.mostResilient}`,
    `${label('Wisest:')} ${stats.wisest}`,
    `${label('Most Adaptive:')} ${stats.mostAdaptive}`,
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
export function formatResultTable(result: StormPhoenixResult): string {
  const sections = [
    formatEmbersTable(result.embers),
    '',
    formatFlocksTable(result.flocks),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Storm')} ${label('Legendary:')} ${result.storm.isLegendary ? high('Yes') : low('No')} ${label('Overall Power:')} ${colorScore(result.storm.overallPower)}`,
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
export function formatResultJson(result: StormPhoenixResult): string {
  return JSON.stringify(result, null, 2)
}
