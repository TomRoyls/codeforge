// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { PlatinumJewel, PlatinumThrone, PlatinumCrownResult } from './platinum-crown-helpers.js'

// ─── Color Palette (platinum crown — silver/platinum/royal purple) ──
const high = chalk.rgb(230, 230, 245)
const midHigh = chalk.rgb(200, 200, 225)
const mid = chalk.rgb(170, 170, 200)
const lowMid = chalk.rgb(140, 140, 175)
const low = chalk.rgb(110, 110, 150)

const best = chalk.rgb(245, 240, 255).bold
const good = chalk.rgb(220, 215, 240)
const okay = chalk.rgb(190, 185, 215)
const poor = chalk.rgb(155, 150, 185)
const worst = chalk.rgb(125, 120, 155)

const heading = chalk.rgb(235, 230, 255).bold
const label = chalk.rgb(210, 205, 240)
const dim = chalk.rgb(175, 170, 210)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // platinum silver
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
 * colorGrade('imperial-crown') // best (bold platinum)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'flawless-platinum': best, 'imperial-seal': best, 'master-jeweler': best,
    'indestructible': best, 'eternal-dynasty': best, 'imperial-crown': best,
    'grand-throne': best, 'golden-age': best, 'emperor': best,

    'pure-metal': good, 'royal-decree': good, 'expert-setting': good,
    'resilient-band': good, 'century-reign': good, 'royal-tiara': good,
    'royal-court': good, 'prosperous-reign': good, 'king': good,

    'proper-alloy': okay, 'proper-authority': okay, 'proper-mount': okay,
    'proper-circlet': okay, 'proper-rule': okay,
    'proper-hall': okay, 'stable-kingdom': okay, 'duke': okay,

    'tarnished-silver': poor, 'weak-command': poor, 'loose-gem': poor,
    'bent-wire': poor, 'brief-era': poor, 'metal-band': poor,
    'small-room': poor, 'declining-realm': poor, 'baron': poor,

    'corroded-bronze': worst, 'empty-title': worst, 'fallen-jewel': worst,
    'broken-ring': worst, 'passing-moment': worst, 'rusty-ring': worst,
    'hut': worst, 'fallen-empire': worst, 'knight': worst,

    'no-purity': worst, 'no-authority': worst, 'no-setting': worst,
    'no-circlet': worst, 'no-reign': worst, 'scrap': worst,
    'no-throne': worst, 'void': worst, 'peasant': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Jewel Formatting ──────────────────────────────────────────────

/**
 * Format a single platinum jewel for display
 * @example
 * formatJewelTable(jewel) // colored jewel info
 */
export function formatJewelTable(jewel: PlatinumJewel): string {
  const parts = [
    `${label('File:')} ${dim(jewel.file)}`,
    `${label('Royal Purity:')} ${colorScore(jewel.royalPurity)} ${colorGrade(jewel.purifying.crown)}`,
    `${label('Crest Authority:')} ${colorScore(jewel.crestAuthority)} ${colorGrade(jewel.commanding.crest)}`,
    `${label('Jewel Precision:')} ${colorScore(jewel.jewelPrecision)} ${colorGrade(jewel.setting.setting)}`,
    `${label('Circlet Resilience:')} ${colorScore(jewel.circletResilience)} ${colorGrade(jewel.enduring.circlet)}`,
    `${label('Reign Endurance:')} ${colorScore(jewel.reignEndurance)} ${colorGrade(jewel.reigning.reign)}`,
    `${label('Score:')} ${colorScore(jewel.qualityScore)} ${colorGrade(jewel.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format jewels as summary table
 * @example
 * formatJewelsTable(jewels) // multi-line table
 */
export function formatJewelsTable(jewels: PlatinumJewel[]): string {
  if (jewels.length === 0) return dim('No platinum jewels found')
  const header = heading('Platinum Jewel Analysis')
  const rows = jewels.map(j => formatJewelTable(j))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Throne Formatting ─────────────────────────────────────────────

/**
 * Format a single platinum throne for display
 * @example
 * formatThroneTable(throne) // colored throne info
 */
export function formatThroneTable(throne: PlatinumThrone): string {
  const parts = [
    `${label('Throne:')} ${dim(throne.directory)}`,
    `${label('Type:')} ${colorGrade(throne.throneType)}`,
    `${label('Condition:')} ${colorGrade(throne.condition)}`,
    `${label('Jewels:')} ${String(throne.jewels.length)}`,
    `${label('Avg Purity:')} ${colorScore(throne.avgPurity)}`,
    `${label('Avg Authority:')} ${colorScore(throne.avgAuthority)}`,
    `${label('Avg Endurance:')} ${colorScore(throne.avgEndurance)}`,
    `${label('Imperial Crowns:')} ${String(throne.imperialCrownCount)}`,
    `${label('Scrap:')} ${String(throne.scrapCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all platinum thrones as summary
 * @example
 * formatThronesTable(thrones) // multi-line summary
 */
export function formatThronesTable(thrones: PlatinumThrone[]): string {
  if (thrones.length === 0) return dim('No platinum thrones found')
  const header = heading('Platinum Thrones')
  const rows = thrones.map(t => formatThroneTable(t))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ──────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: PlatinumCrownResult['stats']): string {
  const parts = [
    heading('Platinum Crown Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Thrones:')} ${String(stats.totalThrones)}`,
    `${label('Avg Royal Purity:')} ${colorScore(stats.avgRoyalPurity)}`,
    `${label('Avg Crest Authority:')} ${colorScore(stats.avgCrestAuthority)}`,
    `${label('Avg Jewel Precision:')} ${colorScore(stats.avgJewelPrecision)}`,
    `${label('Avg Circlet Resilience:')} ${colorScore(stats.avgCircletResilience)}`,
    `${label('Avg Reign Endurance:')} ${colorScore(stats.avgReignEndurance)}`,
    `${label('Imperial Crown:')} ${String(stats.imperialCrownCount)}`,
    `${label('Royal Tiara:')} ${String(stats.royalTiaraCount)}`,
    `${label('Proper Circlet:')} ${String(stats.properCircletCount)}`,
    `${label('Metal Band:')} ${String(stats.metalBandCount)}`,
    `${label('Rusty Ring:')} ${String(stats.rustyRingCount)}`,
    `${label('Scrap:')} ${String(stats.scrapCount)}`,
    `${label('High Purity:')} ${String(stats.hasHighPurityCount)}`,
    `${label('High Authority:')} ${String(stats.hasHighAuthorityCount)}`,
    `${label('High Precision:')} ${String(stats.hasHighPrecisionCount)}`,
    `${label('High Resilience:')} ${String(stats.hasHighResilienceCount)}`,
    `${label('High Endurance:')} ${String(stats.hasHighEnduranceCount)}`,
    `${label('Overall Sovereignty:')} ${colorScore(stats.overallSovereignty)}`,
    `${label('Monarch Grade:')} ${colorGrade(stats.monarchGrade)}`,
    `${label('Best Jewel:')} ${stats.bestJewel}`,
    `${label('Purest:')} ${stats.purest}`,
    `${label('Most Authoritative:')} ${stats.mostAuthoritative}`,
    `${label('Most Precise:')} ${stats.mostPrecise}`,
    `${label('Most Enduring:')} ${stats.mostEnduring}`,
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
  const items = recommendations.map(r => `${dim('\u2655')} ${r}`)
  return `${header}\n${items.join('\n')}`
}

// ─── Full Result Formatting ────────────────────────────────────────

/**
 * Format complete result as table
 * @example
 * formatResultTable(result) // full colored output
 */
export function formatResultTable(result: PlatinumCrownResult): string {
  const sections = [
    formatJewelsTable(result.jewels),
    '',
    formatThronesTable(result.thrones),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Kingdom')} ${label('Imperial:')} ${result.kingdom.isImperial ? high('Yes') : low('No')} ${label('Overall Sovereignty:')} ${colorScore(result.kingdom.overallSovereignty)}`,
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
export function formatResultJson(result: PlatinumCrownResult): string {
  return JSON.stringify(result, null, 2)
}
