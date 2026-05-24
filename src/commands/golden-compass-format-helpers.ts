// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { GoldenNeedle, CompassGuild, GoldenCompassResult } from './golden-compass-helpers.js'

// ─── Color Palette (golden compass — gold/amber/warm) ──────────────
const high = chalk.rgb(255, 215, 0)
const midHigh = chalk.rgb(230, 180, 30)
const mid = chalk.rgb(200, 160, 40)
const lowMid = chalk.rgb(170, 140, 50)
const low = chalk.rgb(140, 120, 60)

const best = chalk.rgb(255, 223, 0).bold
const good = chalk.rgb(240, 200, 40)
const okay = chalk.rgb(210, 175, 55)
const poor = chalk.rgb(180, 150, 60)
const worst = chalk.rgb(150, 125, 65)

const heading = chalk.rgb(255, 210, 0).bold
const label = chalk.rgb(220, 185, 30)
const dim = chalk.rgb(180, 155, 50)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // bright gold
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
 * colorGrade('golden-instrument') // best (bold gold)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'pure-gold': best, 'true-north': best, 'wise-guide': best,
    'golden-rule': best, 'unwavering-gold': best, 'golden-instrument': best,
    'master-guild': best, 'institution-of-truth': best, 'truth-seeker': best,

    'clear-truth': good, 'honest-bearing': good, 'helpful-signs': good,
    'virtuous-design': good, 'steady-needle': good, 'brass-compass': good,
    'proper-school': good, 'honorable-guild': good, 'golden-scholar': good,

    'proper-morality': okay, 'proper-aim': okay, 'proper-direction': okay,
    'proper-principles': okay, 'proper-conviction': okay, 'proper-tool': okay,
    'decent-academy': okay, 'decent-school': okay, 'skilled-reader': okay,

    'gray-area': poor, 'approximate-truth': poor, 'confusing-map': poor,
    'flexible-morals': poor, 'wavering-needle': poor, 'rusty-compass': poor,
    'small-shop': poor, 'shady-shop': poor, 'apprentice': poor,

    'deceptive': worst, 'false-bearing': worst, 'misleading-signs': worst,
    'no-principles': worst, 'spinning-compass': worst, 'broken-device': worst,
    'street-corner': worst, 'abandoned': worst, 'novice': worst,

    'no-clarity': worst, 'no-truth': worst, 'no-guidance': worst,
    'no-virtue': worst, 'no-conviction': worst, 'paperweight': worst,
    'no-guild': worst, 'void': worst, 'deceiver': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Needle Formatting ─────────────────────────────────────────────

/**
 * Format a single needle for display
 * @example
 * formatNeedleTable(needle) // colored needle info
 */
export function formatNeedleTable(needle: GoldenNeedle): string {
  const parts = [
    `${label('File:')} ${dim(needle.file)}`,
    `${label('Moral Clarity:')} ${colorScore(needle.moralClarity)} ${colorGrade(needle.revealing.grade)}`,
    `${label('Bearing Truth:')} ${colorScore(needle.bearingTruth)} ${colorGrade(needle.aligning.bearing)}`,
    `${label('Navigation Wisdom:')} ${colorScore(needle.navigationWisdom)} ${colorGrade(needle.guiding.navigation)}`,
    `${label('Cardinal Virtue:')} ${colorScore(needle.cardinalVirtue)} ${colorGrade(needle.virtueing.cardinal)}`,
    `${label('Needle Conviction:')} ${colorScore(needle.needleConviction)} ${colorGrade(needle.convicting.needle)}`,
    `${label('Score:')} ${colorScore(needle.qualityScore)} ${colorGrade(needle.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format needles as summary table
 * @example
 * formatNeedlesTable(needles) // multi-line table
 */
export function formatNeedlesTable(needles: GoldenNeedle[]): string {
  if (needles.length === 0) return dim('No golden needles found')
  const header = heading('Golden Compass Analysis')
  const rows = needles.map(n => formatNeedleTable(n))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Guild Formatting ──────────────────────────────────────────────

/**
 * Format a single guild for display
 * @example
 * formatGuildTable(guild) // colored guild info
 */
export function formatGuildTable(guild: CompassGuild): string {
  const parts = [
    `${label('Guild:')} ${dim(guild.directory)}`,
    `${label('Type:')} ${colorGrade(guild.guildType)}`,
    `${label('Condition:')} ${colorGrade(guild.condition)}`,
    `${label('Needles:')} ${String(guild.needles.length)}`,
    `${label('Avg Clarity:')} ${colorScore(guild.avgClarity)}`,
    `${label('Avg Truth:')} ${colorScore(guild.avgTruth)}`,
    `${label('Avg Conviction:')} ${colorScore(guild.avgConviction)}`,
    `${label('Golden Instruments:')} ${String(guild.goldenInstrumentCount)}`,
    `${label('Paperweights:')} ${String(guild.paperweightCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all guilds as summary
 * @example
 * formatGuildsTable(guilds) // multi-line summary
 */
export function formatGuildsTable(guilds: CompassGuild[]): string {
  if (guilds.length === 0) return dim('No compass guilds found')
  const header = heading('Compass Guilds')
  const rows = guilds.map(g => formatGuildTable(g))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ──────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: GoldenCompassResult['stats']): string {
  const parts = [
    heading('Golden Compass Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Guilds:')} ${String(stats.totalGuilds)}`,
    `${label('Avg Moral Clarity:')} ${colorScore(stats.avgMoralClarity)}`,
    `${label('Avg Bearing Truth:')} ${colorScore(stats.avgBearingTruth)}`,
    `${label('Avg Navigation Wisdom:')} ${colorScore(stats.avgNavigationWisdom)}`,
    `${label('Avg Cardinal Virtue:')} ${colorScore(stats.avgCardinalVirtue)}`,
    `${label('Avg Needle Conviction:')} ${colorScore(stats.avgNeedleConviction)}`,
    `${label('Golden Instrument:')} ${String(stats.goldenInstrumentCount)}`,
    `${label('Brass Compass:')} ${String(stats.brassCompassCount)}`,
    `${label('Proper Tool:')} ${String(stats.properToolCount)}`,
    `${label('Rusty Compass:')} ${String(stats.rustyCompassCount)}`,
    `${label('Broken Device:')} ${String(stats.brokenDeviceCount)}`,
    `${label('Paperweight:')} ${String(stats.paperweightCount)}`,
    `${label('High Clarity:')} ${String(stats.hasHighClarityCount)}`,
    `${label('High Truth:')} ${String(stats.hasHighTruthCount)}`,
    `${label('High Wisdom:')} ${String(stats.hasHighWisdomCount)}`,
    `${label('High Virtue:')} ${String(stats.hasHighVirtueCount)}`,
    `${label('High Conviction:')} ${String(stats.hasHighConvictionCount)}`,
    `${label('Overall Virtue:')} ${colorScore(stats.overallVirtue)}`,
    `${label('Scholar Grade:')} ${colorGrade(stats.scholarGrade)}`,
    `${label('Best Needle:')} ${stats.bestNeedle}`,
    `${label('Most Clear:')} ${stats.mostClear}`,
    `${label('Most Truthful:')} ${stats.mostTruthful}`,
    `${label('Wisest:')} ${stats.wisest}`,
    `${label('Most Virtuous:')} ${stats.mostVirtuous}`,
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
export function formatResultTable(result: GoldenCompassResult): string {
  const sections = [
    formatNeedlesTable(result.needles),
    '',
    formatGuildsTable(result.guilds),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Truth')} ${label('Truthful:')} ${result.truth.isTruthful ? high('Yes') : low('No')} ${label('Virtue:')} ${colorScore(result.truth.overallVirtue)}`,
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
export function formatResultJson(result: GoldenCompassResult): string {
  return JSON.stringify(result, null, 2)
}
