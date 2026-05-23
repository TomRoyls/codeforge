// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { AmberResin, AmberCollection, AmberAmberResult } from './amber-amber-helpers.js'

// ─── Color Palette (amber) ─────────────────────────────────────────
const high = chalk.rgb(255, 191, 0)
const midHigh = chalk.rgb(230, 170, 20)
const mid = chalk.rgb(200, 150, 30)
const lowMid = chalk.rgb(170, 120, 30)
const low = chalk.rgb(140, 100, 30)

const best = chalk.rgb(255, 210, 60).bold
const good = chalk.rgb(240, 190, 50)
const okay = chalk.rgb(210, 165, 40)
const poor = chalk.rgb(170, 130, 35)
const worst = chalk.rgb(130, 95, 30)

const heading = chalk.rgb(250, 200, 55).bold
const label = chalk.rgb(230, 180, 45)
const dim = chalk.rgb(150, 165, 175)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // amber gold
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
 * colorGrade('museum-piece') // best (bold amber)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, string> = {
    'perfect-preservation': best, 'perfect-trap': best, 'crystal-clear': best,
    'ancient-wisdom': best, 'unbreakable-amber': best, 'museum-piece': best,
    'museum-collection': best, 'pristine-collection': best, 'master-curator': best,

    'well-preserved': good, 'well-captured': good, 'golden-clear': good,
    'well-aged': good, 'tough-resin': good, 'fine-amber': good,
    'jewelry-box': good, 'well-curated': good, 'amber-expert': good,

    'proper-state': okay, 'proper-encapsulation': okay, 'proper-transparency': okay,
    'proper-maturity': okay, 'proper-hardness': okay, 'proper-resin': okay,
    'proper-display': okay, 'decent-display': okay, 'skilled-collector': okay,

    'degrading': poor, 'partially-exposed': poor, 'cloudy': poor,
    'immature': poor, 'brittle-resin': poor, 'cloudy-amber': poor,
    'drawer-find': poor, 'dusty-shelf': poor, 'apprentice': poor,

    'decaying': worst, 'escaped': worst, 'opaque': worst,
    'green': worst, 'cracking': worst, 'cracked-resin': worst,
    'beach-pebble': worst, 'forgotten-box': worst, 'novice': worst,

    'fossilized': worst, 'no-trap': worst, 'dark-amber': worst,
    'fresh-sap': worst, 'shattered': worst, 'dust': worst,
    'no-amber': worst, 'empty': worst, 'fossil-fuel': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Resin Formatting ─────────────────────────────────────────────

/**
 * Format a single resin for display
 * @example
 * formatResinTable(resin) // colored resin info
 */
export function formatResinTable(resin: AmberResin): string {
  const parts = [
    `${label('File:')} ${dim(resin.file)}`,
    `${label('Preservation:')} ${colorScore(resin.preservationQuality)} ${colorGrade(resin.preserving.grade)}`,
    `${label('Inclusion:')} ${colorScore(resin.inclusionQuality)} ${colorGrade(resin.encapsulating.inclusion)}`,
    `${label('Transparency:')} ${colorScore(resin.transparency)} ${colorGrade(resin.clarifying.clarity)}`,
    `${label('Age Wisdom:')} ${colorScore(resin.ageWisdom)} ${colorGrade(resin.maturing.age)}`,
    `${label('Fracture Resistance:')} ${colorScore(resin.fractureResistance)} ${colorGrade(resin.resisting.fracture)}`,
    `${label('Score:')} ${colorScore(resin.qualityScore)} ${colorGrade(resin.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format resins as summary table
 * @example
 * formatResinsTable(resins) // multi-line table
 */
export function formatResinsTable(resins: AmberResin[]): string {
  if (resins.length === 0) return dim('No amber resins found')
  const header = heading('Amber Resin Analysis')
  const rows = resins.map(r => formatResinTable(r))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Collection Formatting ────────────────────────────────────────

/**
 * Format a collection for display
 * @example
 * formatCollectionTable(collection) // colored collection info
 */
export function formatCollectionTable(collection: AmberCollection): string {
  const parts = [
    `${label('Collection:')} ${dim(collection.directory)}`,
    `${label('Type:')} ${colorGrade(collection.collectionType)}`,
    `${label('Condition:')} ${colorGrade(collection.condition)}`,
    `${label('Resins:')} ${String(collection.resins.length)}`,
    `${label('Avg Preservation:')} ${colorScore(collection.avgPreservation)}`,
    `${label('Avg Transparency:')} ${colorScore(collection.avgTransparency)}`,
    `${label('Avg Resistance:')} ${colorScore(collection.avgResistance)}`,
    `${label('Museum Pieces:')} ${String(collection.museumPieceCount)}`,
    `${label('Dust:')} ${String(collection.dustCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all collections as summary
 * @example
 * formatCollectionsTable(collections) // multi-line collection summary
 */
export function formatCollectionsTable(collections: AmberCollection[]): string {
  if (collections.length === 0) return dim('No amber collections found')
  const header = heading('Amber Collection Analysis')
  const rows = collections.map(c => formatCollectionTable(c))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: AmberAmberResult['stats']): string {
  const parts = [
    heading('Amber Amber Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Collections:')} ${String(stats.totalCollections)}`,
    `${label('Avg Preservation:')} ${colorScore(stats.avgPreservationQuality)}`,
    `${label('Avg Inclusion:')} ${colorScore(stats.avgInclusionQuality)}`,
    `${label('Avg Transparency:')} ${colorScore(stats.avgTransparency)}`,
    `${label('Avg Age Wisdom:')} ${colorScore(stats.avgAgeWisdom)}`,
    `${label('Avg Fracture Resistance:')} ${colorScore(stats.avgFractureResistance)}`,
    `${label('Museum Piece:')} ${String(stats.museumPieceCount)}`,
    `${label('Fine Amber:')} ${String(stats.fineAmberCount)}`,
    `${label('Proper Resin:')} ${String(stats.properResinCount)}`,
    `${label('Cloudy Amber:')} ${String(stats.cloudyAmberCount)}`,
    `${label('Cracked Resin:')} ${String(stats.crackedResinCount)}`,
    `${label('Dust:')} ${String(stats.dustCount)}`,
    `${label('High Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('High Encapsulation:')} ${String(stats.hasHighEncapsulationCount)}`,
    `${label('High Transparency:')} ${String(stats.hasHighTransparencyCount)}`,
    `${label('High Wisdom:')} ${String(stats.hasHighWisdomCount)}`,
    `${label('High Resistance:')} ${String(stats.hasHighResistanceCount)}`,
    `${label('Overall Preservation:')} ${colorScore(stats.overallPreservation)}`,
    `${label('Curator Grade:')} ${colorGrade(stats.curatorGrade)}`,
    `${label('Best Resin:')} ${stats.bestResin}`,
    `${label('Best Preserved:')} ${stats.bestPreserved}`,
    `${label('Best Encapsulated:')} ${stats.bestEncapsulated}`,
    `${label('Most Transparent:')} ${stats.mostTransparent}`,
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
export function formatResultTable(result: AmberAmberResult): string {
  const sections = [
    formatResinsTable(result.resins),
    '',
    formatCollectionsTable(result.collections),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Museum')} ${label('Preserved:')} ${result.museum.isPreserved ? high('Yes') : low('No')} ${label('Overall Preservation:')} ${colorScore(result.museum.overallPreservation)}`,
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
export function formatResultJson(result: AmberAmberResult): string {
  return JSON.stringify(result, null, 2)
}
