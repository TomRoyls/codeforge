// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { FernFrond, FernGrove, SilverFernResult } from './silver-fern-helpers.js'

// ─── Color Palette (silver fern — silver/green/white) ─────────────
const high = chalk.rgb(180, 230, 180)
const midHigh = chalk.rgb(170, 210, 175)
const mid = chalk.rgb(160, 195, 170)
const lowMid = chalk.rgb(175, 175, 165)
const low = chalk.rgb(190, 170, 155)

const best = chalk.rgb(200, 245, 210).bold
const good = chalk.rgb(180, 230, 195)
const okay = chalk.rgb(165, 210, 180)
const poor = chalk.rgb(185, 180, 165)
const worst = chalk.rgb(195, 175, 160)

const heading = chalk.rgb(190, 240, 205).bold
const label = chalk.rgb(175, 220, 190)
const dim = chalk.rgb(165, 175, 170)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // silver-green
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
 * colorGrade('silver-koru') // best (bold green)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'ancient-fern': best, 'koru-masterpiece': best, 'wind-carried': best,
    'deep-network': best, 'golden-spiral': best, 'silver-koru': best,
    'ancient-forest': best, 'primeval-forest': best, 'master-botanist': best,

    'hardy-survivor': good, 'elegant-unfurl': good, 'wide-spread': good,
    'strong-rhizome': good, 'proper-fractal': good, 'lush-frond': good,
    'silver-grove': good, 'lush-rainforest': good, 'expert-horticulturist': good,

    'proper-resilience': okay, 'proper-frond': okay, 'proper-distribution': okay,
    'proper-roots': okay, 'self-similar': okay, 'proper-fern': okay,
    'proper-fernery': okay, 'decent-grove': okay, 'skilled-gardener': okay,

    'fragile-frond': poor, 'curled-leaf': poor, 'limited-range': poor,
    'shallow-roots': poor, 'partial-pattern': poor, 'wilted-frond': poor,
    'small-patch': poor, 'sparse-patch': poor, 'apprentice': poor,

    'wilting-leaf': worst, 'wilted-frond': worst, 'dropped-locally': worst,
    'surface-root': worst, 'irregular': worst, 'brown-leaf': worst,
    'single-frond': worst, 'barren-ground': worst, 'novice': worst,

    'dead-frond': worst, 'no-frond': worst, 'no-spore': worst,
    'no-rhizome': worst, 'no-pattern': worst, 'dead-spore': worst,
    'no-grove': worst, 'void': worst, 'withered': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Frond Formatting ─────────────────────────────────────────────

/**
 * Format a single frond for display
 * @example
 * formatFrondTable(frond) // colored frond info
 */
export function formatFrondTable(frond: FernFrond): string {
  const parts = [
    `${label('File:')} ${dim(frond.file)}`,
    `${label('Resilience Nature:')} ${colorScore(frond.resilienceNature)} ${colorGrade(frond.enduring.grade)}`,
    `${label('Frond Elegance:')} ${colorScore(frond.frondElegance)} ${colorGrade(frond.unfurling.frond)}`,
    `${label('Spore Distribution:')} ${colorScore(frond.sporeDistribution)} ${colorGrade(frond.dispersing.spore)}`,
    `${label('Rhizome Depth:')} ${colorScore(frond.rhizomeDepth)} ${colorGrade(frond.rooting.rhizome)}`,
    `${label('Fractal Pattern:')} ${colorScore(frond.fractalPattern)} ${colorGrade(frond.spiraling.fractal)}`,
    `${label('Score:')} ${colorScore(frond.qualityScore)} ${colorGrade(frond.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format fronds as summary table
 * @example
 * formatFrondsTable(fronds) // multi-line table
 */
export function formatFrondsTable(fronds: FernFrond[]): string {
  if (fronds.length === 0) return dim('No fern fronds found')
  const header = heading('Silver Fern Analysis')
  const rows = fronds.map(f => formatFrondTable(f))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Grove Formatting ─────────────────────────────────────────────

/**
 * Format a grove for display
 * @example
 * formatGroveTable(grove) // colored grove info
 */
export function formatGroveTable(grove: FernGrove): string {
  const parts = [
    `${label('Grove:')} ${dim(grove.directory)}`,
    `${label('Type:')} ${colorGrade(grove.groveType)}`,
    `${label('Condition:')} ${colorGrade(grove.condition)}`,
    `${label('Fronds:')} ${String(grove.fronds.length)}`,
    `${label('Avg Resilience:')} ${colorScore(grove.avgResilience)}`,
    `${label('Avg Elegance:')} ${colorScore(grove.avgElegance)}`,
    `${label('Avg Pattern:')} ${colorScore(grove.avgPattern)}`,
    `${label('Silver Koru:')} ${String(grove.silverKoruCount)}`,
    `${label('Dead Spores:')} ${String(grove.deadSporeCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all groves as summary
 * @example
 * formatGrovesTable(groves) // multi-line summary
 */
export function formatGrovesTable(groves: FernGrove[]): string {
  if (groves.length === 0) return dim('No fern groves found')
  const header = heading('Fern Groves')
  const rows = groves.map(g => formatGroveTable(g))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: SilverFernResult['stats']): string {
  const parts = [
    heading('Silver Fern Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Groves:')} ${String(stats.totalGroves)}`,
    `${label('Avg Resilience Nature:')} ${colorScore(stats.avgResilienceNature)}`,
    `${label('Avg Frond Elegance:')} ${colorScore(stats.avgFrondElegance)}`,
    `${label('Avg Spore Distribution:')} ${colorScore(stats.avgSporeDistribution)}`,
    `${label('Avg Rhizome Depth:')} ${colorScore(stats.avgRhizomeDepth)}`,
    `${label('Avg Fractal Pattern:')} ${colorScore(stats.avgFractalPattern)}`,
    `${label('Silver Koru:')} ${String(stats.silverKoruCount)}`,
    `${label('Lush Fronds:')} ${String(stats.lushFrondCount)}`,
    `${label('Proper Ferns:')} ${String(stats.properFernCount)}`,
    `${label('Wilted Fronds:')} ${String(stats.wiltedFrondCount)}`,
    `${label('Brown Leaves:')} ${String(stats.brownLeafCount)}`,
    `${label('Dead Spores:')} ${String(stats.deadSporeCount)}`,
    `${label('High Resilience:')} ${String(stats.hasHighResilienceCount)}`,
    `${label('High Elegance:')} ${String(stats.hasHighEleganceCount)}`,
    `${label('High Distribution:')} ${String(stats.hasHighDistributionCount)}`,
    `${label('High Depth:')} ${String(stats.hasHighDepthCount)}`,
    `${label('High Pattern:')} ${String(stats.hasHighPatternCount)}`,
    `${label('Overall Verdure:')} ${colorScore(stats.overallVerdure)}`,
    `${label('Botanist Grade:')} ${colorGrade(stats.botanistGrade)}`,
    `${label('Best Frond:')} ${stats.bestFrond}`,
    `${label('Most Resilient:')} ${stats.mostResilient}`,
    `${label('Most Elegant:')} ${stats.mostElegant}`,
    `${label('Best Distributed:')} ${stats.bestDistributed}`,
    `${label('Deepest Rooted:')} ${stats.deepestRooted}`,
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
export function formatResultTable(result: SilverFernResult): string {
  const sections = [
    formatFrondsTable(result.fronds),
    '',
    formatGrovesTable(result.groves),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Forest')} ${label('Lush:')} ${result.forest.isLush ? high('Yes') : low('No')} ${label('Overall Verdure:')} ${colorScore(result.forest.overallVerdure)}`,
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
export function formatResultJson(result: SilverFernResult): string {
  return JSON.stringify(result, null, 2)
}
