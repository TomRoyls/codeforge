// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { WindCurrent, WindField, ZephyrWindResult } from './zephyr-wind-helpers.js'

// ─── Color Palette (zephyr breeze) ────────────────────────────────
const high = chalk.rgb(100, 200, 240)
const midHigh = chalk.rgb(80, 180, 220)
const mid = chalk.rgb(60, 160, 200)
const lowMid = chalk.rgb(40, 140, 180)
const low = chalk.rgb(20, 120, 160)

const best = chalk.rgb(120, 220, 255).bold
const good = chalk.rgb(100, 200, 240)
const okay = chalk.rgb(80, 180, 220)
const poor = chalk.rgb(60, 160, 200)
const worst = chalk.rgb(40, 140, 180)

const heading = chalk.rgb(140, 230, 255).bold
const label = chalk.rgb(110, 210, 240)
const dim = chalk.rgb(80, 140, 160)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // bright breeze
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
 * colorGrade('gentle-zephyr') // best (bold cyan)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'feather-light': best, 'true-north': best, 'storm-proof': best,
    'swift-courier': best, 'spring-breeze': best, 'gentle-zephyr': best,
    'trade-winds': best, 'perfect-sailing': best, 'master-sailor': best,

    'gentle-breeze': good, 'clear-heading': good, 'wind-resistant': good,
    'proper-carrier': good, 'fresh-air': good, 'proper-breeze': good,
    'prevailing-westerly': good, 'fair-winds': good, 'wind-reader': good,

    'proper-draft': okay, 'proper-flow': okay, 'proper-anchor': okay,
    'decent-transport': okay, 'proper-atmosphere': okay, 'fair-wind': okay,
    'proper-belt': okay, 'decent-breeze': okay, 'skilled-helmsman': okay,

    'heavy-air': poor, 'cross-current': poor, 'blown-about': poor,
    'slow-delivery': poor, 'stuffy-room': poor, 'stiff-breeze': poor,
    'local-breeze': poor, 'headwind': poor, 'deck-hand': poor,

    'stagnant': worst, 'lost-direction': worst, 'toppled': worst,
    'lost-cargo': worst, 'stale-air': worst, 'gale-force': worst,
    'still-air': worst, 'doldrums': worst, 'novice': worst,

    'lead-weight': worst, 'spinning': worst, 'swept-away': worst,
    'no-carriage': worst, 'vacuum': worst, 'dead-calm': worst,
    'no-wind': worst, 'beached': worst, 'landlubber': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Current Formatting ───────────────────────────────────────────

/**
 * Format a single wind current for display
 * @example
 * formatCurrentTable(current) // colored current info
 */
export function formatCurrentTable(current: WindCurrent): string {
  const parts = [
    `${label('File:')} ${dim(current.file)}`,
    `${label('Breeze Lightness:')} ${colorScore(current.breezeLightness)} ${colorGrade(current.lightening.grade)}`,
    `${label('Current Direction:')} ${colorScore(current.currentDirection)} ${colorGrade(current.directing.current)}`,
    `${label('Gust Resilience:')} ${colorScore(current.gustResilience)} ${colorGrade(current.resisting.gust)}`,
    `${label('Breeze Carriage:')} ${colorScore(current.breezeCarriage)} ${colorGrade(current.carrying.carriage)}`,
    `${label('Atmosphere Quality:')} ${colorScore(current.atmosphereQuality)} ${colorGrade(current.surrounding.atmosphere)}`,
    `${label('Score:')} ${colorScore(current.qualityScore)} ${colorGrade(current.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format currents as summary table
 * @example
 * formatCurrentsTable(currents) // multi-line table
 */
export function formatCurrentsTable(currents: WindCurrent[]): string {
  if (currents.length === 0) return dim('No wind currents found')
  const header = heading('Zephyr Wind Analysis')
  const rows = currents.map(c => formatCurrentTable(c))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Field Formatting ─────────────────────────────────────────────

/**
 * Format a field for display
 * @example
 * formatFieldTable(field) // colored field info
 */
export function formatFieldTable(field: WindField): string {
  const parts = [
    `${label('Field:')} ${dim(field.directory)}`,
    `${label('Type:')} ${colorGrade(field.fieldType)}`,
    `${label('Condition:')} ${colorGrade(field.condition)}`,
    `${label('Currents:')} ${String(field.currents.length)}`,
    `${label('Avg Lightness:')} ${colorScore(field.avgLightness)}`,
    `${label('Avg Direction:')} ${colorScore(field.avgDirection)}`,
    `${label('Avg Resilience:')} ${colorScore(field.avgResilience)}`,
    `${label('Gentle Zephyrs:')} ${String(field.gentleZephyrCount)}`,
    `${label('Dead Calms:')} ${String(field.deadCalmCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all fields as summary
 * @example
 * formatFieldsTable(fields) // multi-line field summary
 */
export function formatFieldsTable(fields: WindField[]): string {
  if (fields.length === 0) return dim('No wind fields found')
  const header = heading('Zephyr Wind Fields')
  const rows = fields.map(f => formatFieldTable(f))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: ZephyrWindResult['stats']): string {
  const parts = [
    heading('Zephyr Wind Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Fields:')} ${String(stats.totalFields)}`,
    `${label('Avg Breeze Lightness:')} ${colorScore(stats.avgBreezeLightness)}`,
    `${label('Avg Current Direction:')} ${colorScore(stats.avgCurrentDirection)}`,
    `${label('Avg Gust Resilience:')} ${colorScore(stats.avgGustResilience)}`,
    `${label('Avg Breeze Carriage:')} ${colorScore(stats.avgBreezeCarriage)}`,
    `${label('Avg Atmosphere Quality:')} ${colorScore(stats.avgAtmosphereQuality)}`,
    `${label('Gentle Zephyrs:')} ${String(stats.gentleZephyrCount)}`,
    `${label('Proper Breezes:')} ${String(stats.properBreezeCount)}`,
    `${label('Fair Winds:')} ${String(stats.fairWindCount)}`,
    `${label('Stiff Breezes:')} ${String(stats.stiffBreezeCount)}`,
    `${label('Gale Forces:')} ${String(stats.galeForceCount)}`,
    `${label('Dead Calms:')} ${String(stats.deadCalmCount)}`,
    `${label('High Lightness:')} ${String(stats.hasHighLightnessCount)}`,
    `${label('High Direction:')} ${String(stats.hasHighDirectionCount)}`,
    `${label('High Resilience:')} ${String(stats.hasHighResilienceCount)}`,
    `${label('High Carriage:')} ${String(stats.hasHighQualityCount)}`,
    `${label('High Atmosphere:')} ${String(stats.hasHighAtmosphereCount)}`,
    `${label('Overall Freshness:')} ${colorScore(stats.overallFreshness)}`,
    `${label('Pilot Grade:')} ${colorGrade(stats.pilotGrade)}`,
    `${label('Best Current:')} ${stats.bestCurrent}`,
    `${label('Lightest:')} ${stats.lightest}`,
    `${label('Clearest Direction:')} ${stats.clearestDirection}`,
    `${label('Most Resilient:')} ${stats.mostResilient}`,
    `${label('Best Carrier:')} ${stats.bestCarrier}`,
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
export function formatResultTable(result: ZephyrWindResult): string {
  const sections = [
    formatCurrentsTable(result.currents),
    '',
    formatFieldsTable(result.fields),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Sky')} ${label('Blowing:')} ${result.sky.isBlowing ? high('Yes') : low('No')} ${label('Overall Freshness:')} ${colorScore(result.sky.overallFreshness)}`,
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
export function formatResultJson(result: ZephyrWindResult): string {
  return JSON.stringify(result, null, 2)
}
