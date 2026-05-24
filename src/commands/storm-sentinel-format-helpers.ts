// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { SentinelWatch, SentinelOutpost, StormSentinelResult } from './storm-sentinel-helpers.js'

// ─── Color Palette (storm sentinel — dark blue/purple/electric) ────
const high = chalk.rgb(100, 180, 255)
const midHigh = chalk.rgb(80, 150, 230)
const mid = chalk.rgb(60, 120, 200)
const lowMid = chalk.rgb(50, 100, 170)
const low = chalk.rgb(40, 80, 140)

const best = chalk.rgb(130, 200, 255).bold
const good = chalk.rgb(100, 175, 245)
const okay = chalk.rgb(75, 145, 220)
const poor = chalk.rgb(55, 115, 190)
const worst = chalk.rgb(40, 90, 160)

const heading = chalk.rgb(120, 195, 255).bold
const label = chalk.rgb(90, 165, 240)
const dim = chalk.rgb(70, 130, 200)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // electric blue
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
 * colorGrade('perfect-sentinel') // best (bold electric)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'all-seeing-eye': best, 'early-warning': best, 'instant-ground': best,
    'unshakeable-tower': best, 'eternal-sentinel': best, 'perfect-sentinel': best,
    'fortress-watch': best, 'impregnable-watch': best, 'sentinel-supreme': best,

    'watchful-tower': good, 'proper-alert': good, 'fast-response': good,
    'storm-proof': good, 'watchful-guardian': good, 'storm-tower': good,
    'strong-network': good, 'watch-commander': good,

    'proper-lookout': okay, 'decent-warning': okay, 'proper-handling': okay,
    'proper-endurance': okay, 'proper-protector': okay, 'proper-watchtower': okay,
    'decent-coverage': okay, 'sentinel-network': okay, 'skilled-guard': okay,

    'sleeping-guard': poor, 'reactive-only': poor, 'slow-reaction': poor,
    'storm-damaged': poor, 'drowsy-watchman': poor, 'weathered-post': poor,
    'weak-outpost': poor, 'proper-outpost': poor, 'apprentice': poor,

    'blind-spot': worst, 'no-warning': worst, 'delayed-response': worst,
    'collapsing-tower': worst, 'absent-guard': worst, 'fallen-tower': worst,
    'fallen-sentry': worst, 'lone-tower': worst, 'novice': worst,

    'no-watch': worst, 'no-alert': worst, 'no-response': worst,
    'no-endurance': worst, 'no-guard': worst, 'rubble': worst,
    'no-outpost': worst, 'void': worst, 'deserter': worst,
    'abandoned-post': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Watch Formatting ──────────────────────────────────────────────

/**
 * Format a single watch for display
 * @example
 * formatWatchTable(watch) // colored watch info
 */
export function formatWatchTable(watch: SentinelWatch): string {
  const parts = [
    `${label('File:')} ${dim(watch.file)}`,
    `${label('Watchfulness:')} ${colorScore(watch.watchfulness)} ${colorGrade(watch.observing.grade)}`,
    `${label('Storm Warning:')} ${colorScore(watch.stormWarning)} ${colorGrade(watch.warning.warning)}`,
    `${label('Lightning Response:')} ${colorScore(watch.lightningResponse)} ${colorGrade(watch.responding.lightning)}`,
    `${label('Thunder Resilience:')} ${colorScore(watch.thunderResilience)} ${colorGrade(watch.enduring.thunder)}`,
    `${label('Guardian Vigilance:')} ${colorScore(watch.guardianVigilance)} ${colorGrade(watch.guarding.guardian)}`,
    `${label('Score:')} ${colorScore(watch.qualityScore)} ${colorGrade(watch.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format watches as summary table
 * @example
 * formatWatchesTable(watches) // multi-line table
 */
export function formatWatchesTable(watches: SentinelWatch[]): string {
  if (watches.length === 0) return dim('No sentinel watches found')
  const header = heading('Storm Sentinel Analysis')
  const rows = watches.map(w => formatWatchTable(w))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Outpost Formatting ────────────────────────────────────────────

/**
 * Format a single outpost for display
 * @example
 * formatOutpostTable(outpost) // colored outpost info
 */
export function formatOutpostTable(outpost: SentinelOutpost): string {
  const parts = [
    `${label('Outpost:')} ${dim(outpost.directory)}`,
    `${label('Type:')} ${colorGrade(outpost.outpostType)}`,
    `${label('Condition:')} ${colorGrade(outpost.condition)}`,
    `${label('Watches:')} ${String(outpost.watches.length)}`,
    `${label('Avg Watchfulness:')} ${colorScore(outpost.avgWatchfulness)}`,
    `${label('Avg Response:')} ${colorScore(outpost.avgResponse)}`,
    `${label('Avg Vigilance:')} ${colorScore(outpost.avgVigilance)}`,
    `${label('Perfect Sentinels:')} ${String(outpost.perfectSentinelCount)}`,
    `${label('Rubble:')} ${String(outpost.rubbleCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all outposts as summary
 * @example
 * formatOutpostsTable(outposts) // multi-line summary
 */
export function formatOutpostsTable(outposts: SentinelOutpost[]): string {
  if (outposts.length === 0) return dim('No sentinel outposts found')
  const header = heading('Sentinel Outposts')
  const rows = outposts.map(o => formatOutpostTable(o))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ──────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: StormSentinelResult['stats']): string {
  const parts = [
    heading('Storm Sentinel Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Outposts:')} ${String(stats.totalOutposts)}`,
    `${label('Avg Watchfulness:')} ${colorScore(stats.avgWatchfulness)}`,
    `${label('Avg Storm Warning:')} ${colorScore(stats.avgStormWarning)}`,
    `${label('Avg Lightning Response:')} ${colorScore(stats.avgLightningResponse)}`,
    `${label('Avg Thunder Resilience:')} ${colorScore(stats.avgThunderResilience)}`,
    `${label('Avg Guardian Vigilance:')} ${colorScore(stats.avgGuardianVigilance)}`,
    `${label('Perfect Sentinel:')} ${String(stats.perfectSentinelCount)}`,
    `${label('Storm Tower:')} ${String(stats.stormTowerCount)}`,
    `${label('Proper Watchtower:')} ${String(stats.properWatchtowerCount)}`,
    `${label('Weathered Post:')} ${String(stats.weatheredPostCount)}`,
    `${label('Fallen Tower:')} ${String(stats.fallenTowerCount)}`,
    `${label('Rubble:')} ${String(stats.rubbleCount)}`,
    `${label('High Watch:')} ${String(stats.hasHighWatchCount)}`,
    `${label('High Warning:')} ${String(stats.hasHighWarningCount)}`,
    `${label('High Response:')} ${String(stats.hasHighResponseCount)}`,
    `${label('High Resilience:')} ${String(stats.hasHighResilienceCount)}`,
    `${label('High Vigilance:')} ${String(stats.hasHighVigilanceCount)}`,
    `${label('Overall Protection:')} ${colorScore(stats.overallProtection)}`,
    `${label('Commander Grade:')} ${colorGrade(stats.commanderGrade)}`,
    `${label('Best Watch:')} ${stats.bestWatch}`,
    `${label('Most Watchful:')} ${stats.mostWatchful}`,
    `${label('Best Warning:')} ${stats.bestWarning}`,
    `${label('Fastest Response:')} ${stats.fastestResponse}`,
    `${label('Most Vigilant:')} ${stats.mostVigilant}`,
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
  const items = recommendations.map(r => `${dim('\u26A1')} ${r}`)
  return `${header}\n${items.join('\n')}`
}

// ─── Full Result Formatting ────────────────────────────────────────

/**
 * Format complete result as table
 * @example
 * formatResultTable(result) // full colored output
 */
export function formatResultTable(result: StormSentinelResult): string {
  const sections = [
    formatWatchesTable(result.watches),
    '',
    formatOutpostsTable(result.outposts),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Network')} ${label('Vigilant:')} ${result.network.isVigilant ? high('Yes') : low('No')} ${label('Overall Protection:')} ${colorScore(result.network.overallProtection)}`,
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
export function formatResultJson(result: StormSentinelResult): string {
  return JSON.stringify(result, null, 2)
}
