// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { BambooCane, BambooGrove, BambooFlexResult } from './bamboo-flex-helpers.js'

// ─── Color Palette ─────────────────────────────────────────────────
const high = chalk.rgb(100, 180, 80)
const midHigh = chalk.rgb(80, 150, 65)
const mid = chalk.rgb(60, 120, 50)
const lowMid = chalk.rgb(45, 90, 40)
const low = chalk.rgb(30, 60, 25)

const best = chalk.rgb(140, 210, 100).bold
const good = chalk.rgb(110, 180, 85)
const okay = chalk.rgb(80, 150, 65)
const poor = chalk.rgb(55, 110, 50)
const worst = chalk.rgb(30, 70, 30)

const heading = chalk.rgb(100, 190, 80).bold
const label = chalk.rgb(85, 160, 70)
const dim = chalk.rgb(140, 155, 140)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // bamboo green
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
 * colorGrade('iron-bamboo') // best (bold green)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, string> = {
    'supple-reed': best, 'iron-knot': best, 'perfectly-hollow': best,
    'rocket-growth': best, 'typhoon-proof': best, 'iron-bamboo': best,
    'ancient-grove': best, 'lush-grove': best, 'zen-master': best,

    'flexible-cane': good, 'strong-joint': good, 'efficient-core': good,
    'rapid-sprout': good, 'storm-resistant': good, 'strong-cane': good,
    'mature-forest': good, 'healthy-forest': good, 'expert-gardener': good,

    'proper-bend': okay, 'proper-knot': okay, 'proper-center': okay,
    'steady-growth': okay, 'proper-shelter': okay, 'proper-bamboo': okay,
    'growing-grove': okay, 'decent-grove': okay, 'skilled-cultivator': okay,

    'stiff-cane': poor, 'loose-joint': poor, 'solid-center': poor,
    'slow-grow': poor, 'wind-damaged': poor, 'green-shoot': poor,
    'bamboo-patch': poor, 'struggling-patch': poor, 'apprentice': poor,

    'brittle-stick': worst, 'weak-bond': worst, 'dense-core': worst,
    'dormant': worst, 'blown-over': worst, 'wilted-cane': worst,
    'scattered-shoots': worst, 'withered-grove': worst, 'novice': worst,

    'frozen-pole': worst, 'broken-cane': worst, 'lead-weight': worst,
    'dead-bamboo': worst, 'uprooted': worst, 'dead-stalk': worst,
    'barren-ground': worst, 'dead-land': worst, 'lumberjack': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Cane Formatting ───────────────────────────────────────────────

/**
 * Format a single cane for display
 * @example
 * formatCaneTable(cane) // colored cane info
 */
export function formatCaneTable(cane: BambooCane): string {
  const parts = [
    `${label('File:')} ${dim(cane.file)}`,
    `${label('Flexibility:')} ${colorScore(cane.flexibility)} ${colorGrade(cane.bending.grade)}`,
    `${label('Knot Strength:')} ${colorScore(cane.knotStrength)} ${colorGrade(cane.knotting.knot)}`,
    `${label('Hollow Efficiency:')} ${colorScore(cane.hollowEfficiency)} ${colorGrade(cane.hollowing.core)}`,
    `${label('Growth Speed:')} ${colorScore(cane.growthSpeed)} ${colorGrade(cane.growing.growth)}`,
    `${label('Wind Resistance:')} ${colorScore(cane.windResistance)} ${colorGrade(cane.resisting.resilience)}`,
    `${label('Score:')} ${colorScore(cane.qualityScore)} ${colorGrade(cane.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format canes as summary table
 * @example
 * formatCanesTable(canes) // multi-line table
 */
export function formatCanesTable(canes: BambooCane[]): string {
  if (canes.length === 0) return dim('No bamboo canes found')
  const header = heading('Bamboo Flex Analysis')
  const rows = canes.map(c => formatCaneTable(c))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Grove Formatting ──────────────────────────────────────────────

/**
 * Format a grove for display
 * @example
 * formatGroveTable(grove) // colored grove info
 */
export function formatGroveTable(grove: BambooGrove): string {
  const parts = [
    `${label('Grove:')} ${dim(grove.directory)}`,
    `${label('Type:')} ${colorGrade(grove.groveType)}`,
    `${label('Condition:')} ${colorGrade(grove.condition)}`,
    `${label('Canes:')} ${String(grove.canes.length)}`,
    `${label('Avg Flexibility:')} ${colorScore(grove.avgFlexibility)}`,
    `${label('Avg Strength:')} ${colorScore(grove.avgStrength)}`,
    `${label('Avg Efficiency:')} ${colorScore(grove.avgEfficiency)}`,
    `${label('Iron Bamboo:')} ${String(grove.ironBambooCount)}`,
    `${label('Dead Stalks:')} ${String(grove.deadStalkCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all groves as summary
 * @example
 * formatGrovesTable(groves) // multi-line grove summary
 */
export function formatGrovesTable(groves: BambooGrove[]): string {
  if (groves.length === 0) return dim('No bamboo groves found')
  const header = heading('Bamboo Grove Analysis')
  const rows = groves.map(g => formatGroveTable(g))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ──────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: BambooFlexResult['stats']): string {
  const parts = [
    heading('Forest Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Groves:')} ${String(stats.totalGroves)}`,
    `${label('Avg Flexibility:')} ${colorScore(stats.avgFlexibility)}`,
    `${label('Avg Knot Strength:')} ${colorScore(stats.avgKnotStrength)}`,
    `${label('Avg Hollow Efficiency:')} ${colorScore(stats.avgHollowEfficiency)}`,
    `${label('Avg Growth Speed:')} ${colorScore(stats.avgGrowthSpeed)}`,
    `${label('Avg Wind Resistance:')} ${colorScore(stats.avgWindResistance)}`,
    `${label('Iron Bamboo:')} ${String(stats.ironBambooCount)}`,
    `${label('Strong Canes:')} ${String(stats.strongCaneCount)}`,
    `${label('Proper Bamboo:')} ${String(stats.properBambooCount)}`,
    `${label('Green Shoots:')} ${String(stats.greenShootCount)}`,
    `${label('Wilted Canes:')} ${String(stats.wiltedCaneCount)}`,
    `${label('Dead Stalks:')} ${String(stats.deadStalkCount)}`,
    `${label('High Flexibility:')} ${String(stats.hasHighFlexibilityCount)}`,
    `${label('High Strength:')} ${String(stats.hasHighStrengthCount)}`,
    `${label('High Efficiency:')} ${String(stats.hasHighEfficiencyCount)}`,
    `${label('High Speed:')} ${String(stats.hasHighSpeedCount)}`,
    `${label('High Wind Resistance:')} ${String(stats.hasHighWindResistanceCount)}`,
    `${label('Overall Vitality:')} ${colorScore(stats.overallVitality)}`,
    `${label('Gardener Grade:')} ${colorGrade(stats.gardenerGrade)}`,
    `${label('Best Cane:')} ${stats.bestCane}`,
    `${label('Most Flexible:')} ${stats.mostFlexible}`,
    `${label('Strongest:')} ${stats.strongest}`,
    `${label('Most Efficient:')} ${stats.mostEfficient}`,
    `${label('Fastest Growing:')} ${stats.fastestGrowing}`,
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
export function formatResultTable(result: BambooFlexResult): string {
  const sections = [
    formatCanesTable(result.canes),
    '',
    formatGrovesTable(result.groves),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Forest')} ${label('Resilient:')} ${result.forest.isResilient ? high('Yes') : low('No')} ${label('Overall Vitality:')} ${colorScore(result.forest.overallVitality)}`,
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
export function formatResultJson(result: BambooFlexResult): string {
  return JSON.stringify(result, null, 2)
}
