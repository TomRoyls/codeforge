// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { AmethystGem, AmethystCrown, AmethystCrownResult } from './amethyst-crown-helpers.js'

// ─── Color Palette (amethyst purple) ───────────────────────────────
const high = chalk.rgb(180, 130, 220)
const midHigh = chalk.rgb(165, 115, 205)
const mid = chalk.rgb(150, 100, 190)
const lowMid = chalk.rgb(130, 85, 170)
const low = chalk.rgb(110, 70, 150)

const best = chalk.rgb(200, 150, 240).bold
const good = chalk.rgb(185, 135, 230)
const okay = chalk.rgb(165, 115, 210)
const poor = chalk.rgb(145, 95, 190)
const worst = chalk.rgb(125, 75, 170)

const heading = chalk.rgb(210, 160, 245).bold
const label = chalk.rgb(195, 145, 235)
const dim = chalk.rgb(140, 115, 155)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // royal purple
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
 * colorGrade('crown-jewel') // best (bold purple)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'deep-purple': best, 'crystal-clear-mind': best, 'hexagonal-perfection': best,
    'royal-purple': best, 'pure-transmutation': best, 'crown-jewel': best,
    'royal-crown': best, 'imperial-regalia': best, 'emperor': best,

    'rich-violet': good, 'clear-thinking': good, 'proper-crystal': good,
    'deep-violet': good, 'clean-refactor': good, 'bishop-ring': good,
    'bishop-mitre': good, 'crown-jewels': good, 'king': good,

    'proper-amethyst': okay, 'proper-lucidity': okay, 'decent-structure': okay,
    'proper-amethyst-purple': okay, 'proper-evolution': okay, 'proper-amethyst': okay,
    'proper-tiara': okay, 'decent-collection': okay, 'prince': okay,

    'light-lavender': poor, 'foggy-logic': poor, 'poor-crystal': poor,
    'reddish-purple': poor, 'messy-transform': poor, 'rose-quartz': poor,
    'simple-band': poor, 'common-gems': poor, 'duke': poor,

    'pale-mauve': worst, 'confused': worst, 'amorphous': worst,
    'gray-purple': worst, 'corrupted': worst, 'common-quartz': worst,
    'costume-jewelry': worst, 'fakes': worst, 'knight': worst,

    'colorless': worst, 'intoxicated': worst, 'no-structure': worst,
    'no-color': worst, 'degraded': worst, 'sand': worst,
    'no-crown': worst, 'empty': worst, 'peasant': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Gem Formatting ────────────────────────────────────────────────

/**
 * Format a single gem for display
 * @example
 * formatGemTable(gem) // colored gem info
 */
export function formatGemTable(gem: AmethystGem): string {
  const parts = [
    `${label('File:')} ${dim(gem.file)}`,
    `${label('Depth:')} ${colorScore(gem.royalDepth)} ${colorGrade(gem.deepening.grade)}`,
    `${label('Clarity:')} ${colorScore(gem.soberClarity)} ${colorGrade(gem.clarifying.sobriety)}`,
    `${label('Structure:')} ${colorScore(gem.crystalStructure)} ${colorGrade(gem.structuring.crystal)}`,
    `${label('Majesty:')} ${colorScore(gem.colorMajesty)} ${colorGrade(gem.coloring.color)}`,
    `${label('Purity:')} ${colorScore(gem.transformationPurity)} ${colorGrade(gem.transforming.transformation)}`,
    `${label('Score:')} ${colorScore(gem.qualityScore)} ${colorGrade(gem.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format gems as summary table
 * @example
 * formatGemsTable(gems) // multi-line table
 */
export function formatGemsTable(gems: AmethystGem[]): string {
  if (gems.length === 0) return dim('No amethyst gems found')
  const header = heading('Amethyst Crown Analysis')
  const rows = gems.map(g => formatGemTable(g))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Crown Formatting ──────────────────────────────────────────────

/**
 * Format a crown for display
 * @example
 * formatCrownTable(crown) // colored crown info
 */
export function formatCrownTable(crown: AmethystCrown): string {
  const parts = [
    `${label('Crown:')} ${dim(crown.directory)}`,
    `${label('Type:')} ${colorGrade(crown.crownType)}`,
    `${label('Condition:')} ${colorGrade(crown.condition)}`,
    `${label('Gems:')} ${String(crown.gems.length)}`,
    `${label('Avg Depth:')} ${colorScore(crown.avgDepth)}`,
    `${label('Avg Clarity:')} ${colorScore(crown.avgClarity)}`,
    `${label('Avg Structure:')} ${colorScore(crown.avgStructure)}`,
    `${label('Crown Jewels:')} ${String(crown.crownJewelCount)}`,
    `${label('Sand:')} ${String(crown.sandCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all crowns as summary
 * @example
 * formatCrownsTable(crowns) // multi-line crown summary
 */
export function formatCrownsTable(crowns: AmethystCrown[]): string {
  if (crowns.length === 0) return dim('No amethyst crowns found')
  const header = heading('Amethyst Crown Analysis')
  const rows = crowns.map(c => formatCrownTable(c))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: AmethystCrownResult['stats']): string {
  const parts = [
    heading('Amethyst Crown Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Crowns:')} ${String(stats.totalCrowns)}`,
    `${label('Avg Royal Depth:')} ${colorScore(stats.avgRoyalDepth)}`,
    `${label('Avg Sober Clarity:')} ${colorScore(stats.avgSoberClarity)}`,
    `${label('Avg Crystal Structure:')} ${colorScore(stats.avgCrystalStructure)}`,
    `${label('Avg Color Majesty:')} ${colorScore(stats.avgColorMajesty)}`,
    `${label('Avg Transformation Purity:')} ${colorScore(stats.avgTransformationPurity)}`,
    `${label('Crown Jewels:')} ${String(stats.crownJewelCount)}`,
    `${label('Bishop Rings:')} ${String(stats.bishopRingCount)}`,
    `${label('Proper Amethyst:')} ${String(stats.properAmethystCount)}`,
    `${label('Rose Quartz:')} ${String(stats.roseQuartzCount)}`,
    `${label('Common Quartz:')} ${String(stats.commonQuartzCount)}`,
    `${label('Sand:')} ${String(stats.sandCount)}`,
    `${label('High Depth:')} ${String(stats.hasHighDepthCount)}`,
    `${label('High Clarity:')} ${String(stats.hasHighClarityCount)}`,
    `${label('High Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('High Majesty:')} ${String(stats.hasHighMajestyCount)}`,
    `${label('High Purity:')} ${String(stats.hasHighPurityCount)}`,
    `${label('Overall Majesty:')} ${colorScore(stats.overallMajesty)}`,
    `${label('Monarch Grade:')} ${colorGrade(stats.monarchGrade)}`,
    `${label('Best Gem:')} ${stats.bestGem}`,
    `${label('Wisest:')} ${stats.wisest}`,
    `${label('Clearest:')} ${stats.clearest}`,
    `${label('Best Structured:')} ${stats.bestStructured}`,
    `${label('Most Elegant:')} ${stats.mostElegant}`,
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
export function formatResultTable(result: AmethystCrownResult): string {
  const sections = [
    formatGemsTable(result.gems),
    '',
    formatCrownsTable(result.crowns),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Throne')} ${label('Royal:')} ${result.throne.isRoyal ? high('Yes') : low('No')} ${label('Overall Majesty:')} ${colorScore(result.throne.overallMajesty)}`,
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
export function formatResultJson(result: AmethystCrownResult): string {
  return JSON.stringify(result, null, 2)
}
