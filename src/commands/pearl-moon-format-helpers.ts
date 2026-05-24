// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { PearlLuster, PearlBed, PearlMoonResult } from './pearl-moon-helpers.js'

// ─── Color Palette (moonlit pearl) ─────────────────────────────────
const high = chalk.rgb(220, 230, 255)
const midHigh = chalk.rgb(195, 210, 245)
const mid = chalk.rgb(170, 190, 230)
const lowMid = chalk.rgb(145, 165, 210)
const low = chalk.rgb(120, 140, 190)

const best = chalk.rgb(235, 240, 255).bold
const good = chalk.rgb(215, 225, 250)
const okay = chalk.rgb(190, 205, 240)
const poor = chalk.rgb(165, 180, 220)
const worst = chalk.rgb(140, 155, 200)

const heading = chalk.rgb(240, 245, 255).bold
const label = chalk.rgb(220, 230, 250)
const dim = chalk.rgb(140, 155, 180)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // moonlit white
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
 * colorGrade('south-sea-treasure') // best (bold moonlight)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'mirror-luster': best, 'thick-nacre': best, 'rainbow-orient': best,
    'flawless': best, 'warm-orient': best, 'south-sea-treasure': best,
    'south-sea-bed': best, 'treasure-trove': best, 'pearl-diver-master': best,

    'excellent-shine': good, 'proper-layers': good, 'strong-iridescence': good,
    'clean-surface': good, 'proper-glow': good, 'akoya-perfect': good,
    'akoya-farm': good, 'quality-harvest': good, 'expert-diver': good,

    'proper-glow': okay, 'decent-coating': okay, 'proper-shift': okay,
    'minor-blemish': okay, 'decent-warmth': okay, 'proper-pearl': okay,
    'freshwater-bed': okay, 'decent-yield': okay, 'skilled-fisher': okay,

    'dull-luster': poor, 'thin-nacre': poor, 'slight-glow': poor,
    'spotted': poor, 'cool-tone': poor, 'freshwater-decent': poor,
    'cultured-pearl': poor, 'poor-catch': poor, 'apprentice': poor,

    'chalky': worst, 'paper-thin': worst, 'static-color': worst,
    'heavily-marked': worst, 'cold-luster': worst, 'imitation': worst,
    'river-mussel': worst, 'empty-shells': worst, 'novice': worst,

    'no-luster': worst, 'no-coating': worst, 'no-color': worst,
    'damaged': worst, 'lifeless': worst, 'sand-grain': worst,
    'no-oyster': worst, 'barren': worst, 'landlubber': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Luster Formatting ─────────────────────────────────────────────

/**
 * Format a single luster for display
 * @example
 * formatLusterTable(luster) // colored luster info
 */
export function formatLusterTable(luster: PearlLuster): string {
  const parts = [
    `${label('File:')} ${dim(luster.file)}`,
    `${label('Luster:')} ${colorScore(luster.lusterQuality)} ${colorGrade(luster.shining.grade)}`,
    `${label('Depth:')} ${colorScore(luster.nacreDepth)} ${colorGrade(luster.layering.nacre)}`,
    `${label('Iridescence:')} ${colorScore(luster.iridescenceLevel)} ${colorGrade(luster.shifting.iridescence)}`,
    `${label('Flawlessness:')} ${colorScore(luster.flawlessnessGrade)} ${colorGrade(luster.perfecting.flaw)}`,
    `${label('Warmth:')} ${colorScore(luster.orientWarmth)} ${colorGrade(luster.warming.orient)}`,
    `${label('Score:')} ${colorScore(luster.qualityScore)} ${colorGrade(luster.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format lusters as summary table
 * @example
 * formatLustersTable(lusters) // multi-line table
 */
export function formatLustersTable(lusters: PearlLuster[]): string {
  if (lusters.length === 0) return dim('No pearl lusters found')
  const header = heading('Pearl Moon Analysis')
  const rows = lusters.map(l => formatLusterTable(l))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Bed Formatting ────────────────────────────────────────────────

/**
 * Format a bed for display
 * @example
 * formatBedTable(bed) // colored bed info
 */
export function formatBedTable(bed: PearlBed): string {
  const parts = [
    `${label('Bed:')} ${dim(bed.directory)}`,
    `${label('Type:')} ${colorGrade(bed.bedType)}`,
    `${label('Condition:')} ${colorGrade(bed.condition)}`,
    `${label('Lusters:')} ${String(bed.lusters.length)}`,
    `${label('Avg Luster:')} ${colorScore(bed.avgLuster)}`,
    `${label('Avg Depth:')} ${colorScore(bed.avgDepth)}`,
    `${label('Avg Flawlessness:')} ${colorScore(bed.avgFlawlessness)}`,
    `${label('South Sea Treasures:')} ${String(bed.southSeaTreasureCount)}`,
    `${label('Sand Grains:')} ${String(bed.sandGrainCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all beds as summary
 * @example
 * formatBedsTable(beds) // multi-line bed summary
 */
export function formatBedsTable(beds: PearlBed[]): string {
  if (beds.length === 0) return dim('No pearl beds found')
  const header = heading('Pearl Bed Analysis')
  const rows = beds.map(b => formatBedTable(b))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: PearlMoonResult['stats']): string {
  const parts = [
    heading('Pearl Moon Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Beds:')} ${String(stats.totalBeds)}`,
    `${label('Avg Luster Quality:')} ${colorScore(stats.avgLusterQuality)}`,
    `${label('Avg Nacre Depth:')} ${colorScore(stats.avgNacreDepth)}`,
    `${label('Avg Iridescence Level:')} ${colorScore(stats.avgIridescenceLevel)}`,
    `${label('Avg Flawlessness Grade:')} ${colorScore(stats.avgFlawlessnessGrade)}`,
    `${label('Avg Orient Warmth:')} ${colorScore(stats.avgOrientWarmth)}`,
    `${label('South Sea Treasures:')} ${String(stats.southSeaTreasureCount)}`,
    `${label('Akoya Perfect:')} ${String(stats.akoyaPerfectCount)}`,
    `${label('Proper Pearl:')} ${String(stats.properPearlCount)}`,
    `${label('Freshwater Decent:')} ${String(stats.freshwaterDecentCount)}`,
    `${label('Imitation:')} ${String(stats.imitationCount)}`,
    `${label('Sand Grain:')} ${String(stats.sandGrainCount)}`,
    `${label('High Luster:')} ${String(stats.hasHighLusterCount)}`,
    `${label('High Depth:')} ${String(stats.hasHighDepthCount)}`,
    `${label('High Level:')} ${String(stats.hasHighLevelCount)}`,
    `${label('High Grade:')} ${String(stats.hasHighGradeCount)}`,
    `${label('High Warmth:')} ${String(stats.hasHighWarmthCount)}`,
    `${label('Overall Luminance:')} ${colorScore(stats.overallLuminance)}`,
    `${label('Diver Grade:')} ${colorGrade(stats.diverGrade)}`,
    `${label('Best Luster:')} ${stats.bestLuster}`,
    `${label('Shiniest:')} ${stats.shiniest}`,
    `${label('Deepest:')} ${stats.deepest}`,
    `${label('Most Colorful:')} ${stats.mostColorful}`,
    `${label('Warmest:')} ${stats.warmest}`,
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
export function formatResultTable(result: PearlMoonResult): string {
  const sections = [
    formatLustersTable(result.lusters),
    '',
    formatBedsTable(result.beds),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Ocean')} ${label('Luminous:')} ${result.ocean.isLuminous ? high('Yes') : low('No')} ${label('Overall Luminance:')} ${colorScore(result.ocean.overallLuminance)}`,
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
export function formatResultJson(result: PearlMoonResult): string {
  return JSON.stringify(result, null, 2)
}
