// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { RubyFacet, HorizonRange, RubyHorizonResult } from './ruby-horizon-helpers.js'

// ─── Color Palette (ruby horizon — ruby/crimson/amber) ─────────────
const high = chalk.rgb(220, 40, 60)
const midHigh = chalk.rgb(195, 35, 55)
const mid = chalk.rgb(170, 30, 50)
const lowMid = chalk.rgb(140, 25, 45)
const low = chalk.rgb(110, 20, 35)

const best = chalk.rgb(255, 80, 100).bold
const good = chalk.rgb(230, 55, 75)
const okay = chalk.rgb(200, 40, 60)
const poor = chalk.rgb(160, 30, 50)
const worst = chalk.rgb(120, 20, 40)

const heading = chalk.rgb(240, 60, 80).bold
const label = chalk.rgb(215, 45, 65)
const dim = chalk.rgb(180, 35, 55)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // ruby
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
 * colorGrade('master-jeweler') // best (bold ruby)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'crystal-dawn': best, 'perfect-cut': best, 'infinite-horizon': best,
    'golden-sunrise': best, 'sunset-wisdom': best, 'ruby-masterpiece': best,
    'mountain-range': best, 'majestic-panorama': best, 'master-jeweler': best,

    'clear-morning': good, 'brilliant-facet': good, 'far-reaching': good,
    'bright-dawn': good, 'evening-knowledge': good, 'gemstone-horizon': good,
    'proper-horizon': good, 'beautiful-vista': good, 'expert-gem-cutter': good,

    'proper-light': okay, 'proper-cut': okay, 'proper-vision': okay,
    'proper-morning': okay, 'proper-learning': okay, 'proper-gem': okay,
    'decent-ridge': okay, 'decent-view': okay, 'skilled-lapidary': okay,

    'hazy-dawn': poor, 'rough-facet': poor, 'short-sighted': poor,
    'dim-sunrise': poor, 'forgotten-lessons': poor, 'rough-mineral': poor,
    'small-hill': poor, 'limited-sight': poor, 'apprentice': poor,

    'foggy-morning': worst, 'uncut-stone': worst, 'tunnel-vision': worst,
    'gray-dawn': worst, 'no-learning': worst, 'dull-stone': worst,
    'flat-plain': worst, 'obscured': worst, 'novice': worst,

    'no-dawn': worst, 'no-gem': worst, 'no-vision': worst,
    'no-sunrise': worst, 'oblivion': worst, 'gravel': worst,
    'no-range': worst, 'void': worst, 'rock-smasher': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Facet Formatting ──────────────────────────────────────────────

/**
 * Format a single facet for display
 * @example
 * formatFacetTable(facet) // colored facet info
 */
export function formatFacetTable(facet: RubyFacet): string {
  const parts = [
    `${label('File:')} ${dim(facet.file)}`,
    `${label('Dawn Clarity:')} ${colorScore(facet.dawnClarity)} ${colorGrade(facet.illuminating.grade)}`,
    `${label('Gem Faceting:')} ${colorScore(facet.gemFaceting)} ${colorGrade(facet.cutting.gem)}`,
    `${label('Horizon Reach:')} ${colorScore(facet.horizonReach)} ${colorGrade(facet.reaching.horizon)}`,
    `${label('Sunrise Vitality:')} ${colorScore(facet.sunriseVitality)} ${colorGrade(facet.energizing.sunrise)}`,
    `${label('Twilight Wisdom:')} ${colorScore(facet.twilightWisdom)} ${colorGrade(facet.learning.twilight)}`,
    `${label('Score:')} ${colorScore(facet.qualityScore)} ${colorGrade(facet.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format facets as summary table
 * @example
 * formatFacetsTable(facets) // multi-line table
 */
export function formatFacetsTable(facets: RubyFacet[]): string {
  if (facets.length === 0) return dim('No ruby facets found')
  const header = heading('Ruby Horizon Analysis')
  const rows = facets.map(f => formatFacetTable(f))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Range Formatting ──────────────────────────────────────────────

/**
 * Format a range for display
 * @example
 * formatRangeTable(range) // colored range info
 */
export function formatRangeTable(range: HorizonRange): string {
  const parts = [
    `${label('Range:')} ${dim(range.directory)}`,
    `${label('Type:')} ${colorGrade(range.rangeType)}`,
    `${label('Condition:')} ${colorGrade(range.condition)}`,
    `${label('Facets:')} ${String(range.facets.length)}`,
    `${label('Avg Clarity:')} ${colorScore(range.avgClarity)}`,
    `${label('Avg Reach:')} ${colorScore(range.avgReach)}`,
    `${label('Avg Wisdom:')} ${colorScore(range.avgWisdom)}`,
    `${label('Ruby Masterpieces:')} ${String(range.rubyMasterpieceCount)}`,
    `${label('Gravel Count:')} ${String(range.gravelCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all ranges as summary
 * @example
 * formatRangesTable(ranges) // multi-line summary
 */
export function formatRangesTable(ranges: HorizonRange[]): string {
  if (ranges.length === 0) return dim('No horizon ranges found')
  const header = heading('Horizon Ranges')
  const rows = ranges.map(r => formatRangeTable(r))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ──────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: RubyHorizonResult['stats']): string {
  const parts = [
    heading('Ruby Horizon Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Ranges:')} ${String(stats.totalRanges)}`,
    `${label('Avg Dawn Clarity:')} ${colorScore(stats.avgDawnClarity)}`,
    `${label('Avg Gem Faceting:')} ${colorScore(stats.avgGemFaceting)}`,
    `${label('Avg Horizon Reach:')} ${colorScore(stats.avgHorizonReach)}`,
    `${label('Avg Sunrise Vitality:')} ${colorScore(stats.avgSunriseVitality)}`,
    `${label('Avg Twilight Wisdom:')} ${colorScore(stats.avgTwilightWisdom)}`,
    `${label('Ruby Masterpiece:')} ${String(stats.rubyMasterpieceCount)}`,
    `${label('Gemstone Horizon:')} ${String(stats.gemstoneHorizonCount)}`,
    `${label('Proper Gem:')} ${String(stats.properGemCount)}`,
    `${label('Rough Mineral:')} ${String(stats.roughMineralCount)}`,
    `${label('Dull Stone:')} ${String(stats.dullStoneCount)}`,
    `${label('Gravel:')} ${String(stats.gravelCount)}`,
    `${label('High Clarity:')} ${String(stats.hasHighClarityCount)}`,
    `${label('High Faceting:')} ${String(stats.hasHighFacetingCount)}`,
    `${label('High Reach:')} ${String(stats.hasHighReachCount)}`,
    `${label('High Vitality:')} ${String(stats.hasHighVitalityCount)}`,
    `${label('High Wisdom:')} ${String(stats.hasHighWisdomCount)}`,
    `${label('Overall Splendor:')} ${colorScore(stats.overallSplendor)}`,
    `${label('Jeweler Grade:')} ${colorGrade(stats.jewelerGrade)}`,
    `${label('Best Facet:')} ${stats.bestFacet}`,
    `${label('Clearest:')} ${stats.clearest}`,
    `${label('Best Cut:')} ${stats.bestCut}`,
    `${label('Farthest:')} ${stats.farthest}`,
    `${label('Wisest:')} ${stats.wisest}`,
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
export function formatResultTable(result: RubyHorizonResult): string {
  const sections = [
    formatFacetsTable(result.facets),
    '',
    formatRangesTable(result.ranges),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Panorama')} ${label('Majestic:')} ${result.panorama.isMajestic ? high('Yes') : low('No')} ${label('Overall Splendor:')} ${colorScore(result.panorama.overallSplendor)}`,
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
export function formatResultJson(result: RubyHorizonResult): string {
  return JSON.stringify(result, null, 2)
}
