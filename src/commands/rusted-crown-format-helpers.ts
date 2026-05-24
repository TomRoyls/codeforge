// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { CrownJewel, RoyalCourt, RustedCrownResult } from './rusted-crown-helpers.js'

// ─── Color Palette (rusted crown — gold/copper/bronze) ─────────────
const high = chalk.rgb(218, 165, 32)
const midHigh = chalk.rgb(200, 145, 25)
const mid = chalk.rgb(180, 125, 20)
const lowMid = chalk.rgb(160, 105, 15)
const low = chalk.rgb(140, 85, 10)

const best = chalk.rgb(255, 215, 0).bold
const good = chalk.rgb(218, 165, 32)
const okay = chalk.rgb(192, 140, 25)
const poor = chalk.rgb(160, 100, 15)
const worst = chalk.rgb(120, 70, 10)

const heading = chalk.rgb(210, 155, 30).bold
const label = chalk.rgb(195, 140, 28)
const dim = chalk.rgb(170, 115, 20)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // gold
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
 * colorGrade('golden-crown') // best (bold gold)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'ancient-sovereign': best, 'stainless-steel': best, 'pure-gold': best,
    'eternal-kingdom': best, 'ready-to-crown': best, 'golden-crown': best,
    'grand-palace': best, 'imperial-palace': best, 'emperor': best,

    'elder-king': good, 'rust-resistant': good, 'silver-lining': good,
    'stable-reign': good, 'heir-apparent': good, 'silver-diadem': good,
    'royal-court': good, 'king': good,

    'proper-wisdom': okay, 'proper-coating': okay, 'proper-gilt': okay,
    'proper-rule': okay, 'proper-succession': okay, 'proper-tiara': okay,
    'proper-hall': okay, 'decent-hall': okay, 'duke': okay,

    'young-ruler': poor, 'surface-rust': poor, 'worn-gold': poor,
    'turbulent-era': poor, 'uncertain-succession': poor, 'rusted-circlet': poor,
    'small-throne': poor, 'humble-throne': poor, 'baron': poor,

    'naive-heir': worst, 'deep-corrosion': worst, 'tarnished': worst,
    'collapsing-reign': worst, 'no-heir': worst, 'broken-crown': worst,
    'ruined-castle': worst, 'ruin': worst, 'knight': worst,

    'no-wisdom': worst, 'dissolved': worst, 'no-gilding': worst,
    'no-reign': worst, 'no-throne': worst, 'scrap-metal': worst,
    'no-court': worst, 'void': worst, 'peasant': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Jewel Formatting ─────────────────────────────────────────────

/**
 * Format a single jewel for display
 * @example
 * formatJewelTable(jewel) // colored jewel info
 */
export function formatJewelTable(jewel: CrownJewel): string {
  const parts = [
    `${label('File:')} ${dim(jewel.file)}`,
    `${label('Legacy Wisdom:')} ${colorScore(jewel.legacyWisdom)} ${colorGrade(jewel.remembering.grade)}`,
    `${label('Corrosion Resistance:')} ${colorScore(jewel.corrosionResistance)} ${colorGrade(jewel.resisting.corrosion)}`,
    `${label('Gilded Quality:')} ${colorScore(jewel.gildedQuality)} ${colorGrade(jewel.gleaming.gilding)}`,
    `${label('Reign Stability:')} ${colorScore(jewel.reignStability)} ${colorGrade(jewel.stabilizing.reign)}`,
    `${label('Coronation Readiness:')} ${colorScore(jewel.coronationReadiness)} ${colorGrade(jewel.preparing.coronation)}`,
    `${label('Score:')} ${colorScore(jewel.qualityScore)} ${colorGrade(jewel.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format jewels as summary table
 * @example
 * formatJewelsTable(jewels) // multi-line table
 */
export function formatJewelsTable(jewels: CrownJewel[]): string {
  if (jewels.length === 0) return dim('No crown jewels found')
  const header = heading('Rusted Crown Analysis')
  const rows = jewels.map(j => formatJewelTable(j))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Court Formatting ─────────────────────────────────────────────

/**
 * Format a court for display
 * @example
 * formatCourtTable(court) // colored court info
 */
export function formatCourtTable(court: RoyalCourt): string {
  const parts = [
    `${label('Court:')} ${dim(court.directory)}`,
    `${label('Type:')} ${colorGrade(court.courtType)}`,
    `${label('Condition:')} ${colorGrade(court.condition)}`,
    `${label('Jewels:')} ${String(court.jewels.length)}`,
    `${label('Avg Wisdom:')} ${colorScore(court.avgWisdom)}`,
    `${label('Avg Stability:')} ${colorScore(court.avgStability)}`,
    `${label('Avg Readiness:')} ${colorScore(court.avgReadiness)}`,
    `${label('Golden Crowns:')} ${String(court.goldenCrownCount)}`,
    `${label('Scrap Metal:')} ${String(court.scrapMetalCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all courts as summary
 * @example
 * formatCourtsTable(courts) // multi-line summary
 */
export function formatCourtsTable(courts: RoyalCourt[]): string {
  if (courts.length === 0) return dim('No royal courts found')
  const header = heading('Royal Courts')
  const rows = courts.map(c => formatCourtTable(c))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: RustedCrownResult['stats']): string {
  const parts = [
    heading('Rusted Crown Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Courts:')} ${String(stats.totalCourts)}`,
    `${label('Avg Legacy Wisdom:')} ${colorScore(stats.avgLegacyWisdom)}`,
    `${label('Avg Corrosion Resistance:')} ${colorScore(stats.avgCorrosionResistance)}`,
    `${label('Avg Gilded Quality:')} ${colorScore(stats.avgGildedQuality)}`,
    `${label('Avg Reign Stability:')} ${colorScore(stats.avgReignStability)}`,
    `${label('Avg Coronation Readiness:')} ${colorScore(stats.avgCoronationReadiness)}`,
    `${label('Golden Crown:')} ${String(stats.goldenCrownCount)}`,
    `${label('Silver Diadem:')} ${String(stats.silverDiademCount)}`,
    `${label('Proper Tiara:')} ${String(stats.properTiaraCount)}`,
    `${label('Rusted Circlet:')} ${String(stats.rustedCircletCount)}`,
    `${label('Broken Crown:')} ${String(stats.brokenCrownCount)}`,
    `${label('Scrap Metal:')} ${String(stats.scrapMetalCount)}`,
    `${label('High Wisdom:')} ${String(stats.hasHighWisdomCount)}`,
    `${label('High Resistance:')} ${String(stats.hasHighResistanceCount)}`,
    `${label('High Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('High Stability:')} ${String(stats.hasHighStabilityCount)}`,
    `${label('High Readiness:')} ${String(stats.hasHighReadinessCount)}`,
    `${label('Overall Sovereignty:')} ${colorScore(stats.overallSovereignty)}`,
    `${label('Monarch Grade:')} ${colorGrade(stats.monarchGrade)}`,
    `${label('Best Jewel:')} ${stats.bestJewel}`,
    `${label('Wisest:')} ${stats.wisest}`,
    `${label('Most Resistant:')} ${stats.mostResistant}`,
    `${label('Highest Quality:')} ${stats.highestQuality}`,
    `${label('Most Stable:')} ${stats.mostStable}`,
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
export function formatResultTable(result: RustedCrownResult): string {
  const sections = [
    formatJewelsTable(result.jewels),
    '',
    formatCourtsTable(result.courts),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Kingdom')} ${label('Sovereign:')} ${result.kingdom.isSovereign ? high('Yes') : low('No')} ${label('Overall Sovereignty:')} ${colorScore(result.kingdom.overallSovereignty)}`,
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
export function formatResultJson(result: RustedCrownResult): string {
  return JSON.stringify(result, null, 2)
}
