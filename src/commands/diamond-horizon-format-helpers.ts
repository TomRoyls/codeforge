// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { DiamondFacet, DiamondMine, DiamondHorizonResult } from './diamond-horizon-helpers.js'

// ─── Color Palette (diamond horizon — icy blue/white/cyan) ─────────
const high = chalk.rgb(180, 230, 255)
const midHigh = chalk.rgb(150, 210, 245)
const mid = chalk.rgb(120, 190, 230)
const lowMid = chalk.rgb(90, 160, 210)
const low = chalk.rgb(60, 130, 190)

const best = chalk.rgb(220, 245, 255).bold
const good = chalk.rgb(190, 230, 250)
const okay = chalk.rgb(160, 210, 240)
const poor = chalk.rgb(130, 180, 220)
const worst = chalk.rgb(100, 150, 200)

const heading = chalk.rgb(200, 240, 255).bold
const label = chalk.rgb(170, 220, 245)
const dim = chalk.rgb(140, 190, 230)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // icy blue
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
 * colorGrade('flawless-diamond') // best (bold icy)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'flawless-diamond': best, 'ideal-cut': best, 'maximum-fire': best,
    'dazzling-brilliance': best, 'substantial-gem': best,
    'kimberley-mine': best, 'diamond-empire': best, 'master-gemologist': best,

    'internally-flawless': good, 'excellent-cut': good, 'excellent-dispersion': good,
    'bright-shine': good, 'proper-weight': good,
    'premium-shaft': good, 'rich-mine': good, 'expert-jeweler': good,

    'very-very-slight': okay, 'very-good-cut': okay, 'proper-spectrum': okay,
    'proper-glow': okay, 'decent-carat': okay,
    'proper-tunnel': okay, 'decent-shaft': okay, 'skilled-cutter': okay,

    'slightly-included': poor, 'good-cut': poor, 'limited-color': poor,
    'dim-luster': poor, 'light-weight': poor,
    'small-excavation': poor, 'played-out': poor, 'apprentice': poor,

    'included': worst, 'fair-cut': worst, 'dull-stone': worst,
    'dull-surface': worst, 'chip': worst,
    'surface-scraping': worst, 'abandoned': worst, 'novice': worst,

    'industrial-grade': worst, 'poor-cut': worst, 'no-fire': worst,
    'no-brilliance': worst, 'no-substance': worst,
    'no-mine': worst, 'void': worst, 'rock-smasher': worst,

    'premium-gem': best, 'proper-diamond': okay,
    'rough-gem': poor, 'industrial-stone': poor, 'carbon': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Facet Formatting ──────────────────────────────────────────────

/**
 * Format a single diamond facet for display
 * @example
 * formatFacetTable(facet) // colored facet info
 */
export function formatFacetTable(facet: DiamondFacet): string {
  const parts = [
    `${label('File:')} ${dim(facet.file)}`,
    `${label('Hardness Clarity:')} ${colorScore(facet.hardnessClarity)} ${colorGrade(facet.enduring.grade)}`,
    `${label('Cut Precision:')} ${colorScore(facet.cutPrecision)} ${colorGrade(facet.cutting.cut)}`,
    `${label('Fire Dispersion:')} ${colorScore(facet.fireDispersion)} ${colorGrade(facet.dispersing.fire)}`,
    `${label('Brilliance Quality:')} ${colorScore(facet.brillianceQuality)} ${colorGrade(facet.shining.shine)}`,
    `${label('Carat Substance:')} ${colorScore(facet.caratSubstance)} ${colorGrade(facet.weighing.carat)}`,
    `${label('Score:')} ${colorScore(facet.qualityScore)} ${colorGrade(facet.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format facets as summary table
 * @example
 * formatFacetsTable(facets) // multi-line table
 */
export function formatFacetsTable(facets: DiamondFacet[]): string {
  if (facets.length === 0) return dim('No diamond facets found')
  const header = heading('Diamond Facet Analysis')
  const rows = facets.map(f => formatFacetTable(f))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Mine Formatting ───────────────────────────────────────────────

/**
 * Format a single diamond mine for display
 * @example
 * formatMineTable(mine) // colored mine info
 */
export function formatMineTable(mine: DiamondMine): string {
  const parts = [
    `${label('Mine:')} ${dim(mine.directory)}`,
    `${label('Type:')} ${colorGrade(mine.mineType)}`,
    `${label('Condition:')} ${colorGrade(mine.condition)}`,
    `${label('Facets:')} ${String(mine.facets.length)}`,
    `${label('Avg Hardness:')} ${colorScore(mine.avgHardness)}`,
    `${label('Avg Precision:')} ${colorScore(mine.avgPrecision)}`,
    `${label('Avg Brilliance:')} ${colorScore(mine.avgBrilliance)}`,
    `${label('Flawless Diamonds:')} ${String(mine.flawlessDiamondCount)}`,
    `${label('Carbon Count:')} ${String(mine.carbonCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all diamond mines as summary
 * @example
 * formatMinesTable(mines) // multi-line summary
 */
export function formatMinesTable(mines: DiamondMine[]): string {
  if (mines.length === 0) return dim('No diamond mines found')
  const header = heading('Diamond Mines')
  const rows = mines.map(m => formatMineTable(m))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: DiamondHorizonResult['stats']): string {
  const parts = [
    heading('Diamond Horizon Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Mines:')} ${String(stats.totalMines)}`,
    `${label('Avg Hardness Clarity:')} ${colorScore(stats.avgHardnessClarity)}`,
    `${label('Avg Cut Precision:')} ${colorScore(stats.avgCutPrecision)}`,
    `${label('Avg Fire Dispersion:')} ${colorScore(stats.avgFireDispersion)}`,
    `${label('Avg Brilliance Quality:')} ${colorScore(stats.avgBrillianceQuality)}`,
    `${label('Avg Carat Substance:')} ${colorScore(stats.avgCaratSubstance)}`,
    `${label('Flawless Diamond:')} ${String(stats.flawlessDiamondCount)}`,
    `${label('Premium Gem:')} ${String(stats.premiumGemCount)}`,
    `${label('Proper Diamond:')} ${String(stats.properDiamondCount)}`,
    `${label('Rough Gem:')} ${String(stats.roughGemCount)}`,
    `${label('Industrial Stone:')} ${String(stats.industrialStoneCount)}`,
    `${label('Carbon:')} ${String(stats.carbonCount)}`,
    `${label('High Hardness:')} ${String(stats.hasHighHardnessCount)}`,
    `${label('High Precision:')} ${String(stats.hasHighPrecisionCount)}`,
    `${label('High Dispersion:')} ${String(stats.hasHighDispersionCount)}`,
    `${label('High Brilliance:')} ${String(stats.hasHighBrillianceCount)}`,
    `${label('High Substance:')} ${String(stats.hasHighSubstanceCount)}`,
    `${label('Overall Clarity:')} ${colorScore(stats.overallClarity)}`,
    `${label('Jeweler Grade:')} ${colorGrade(stats.jewelerGrade)}`,
    `${label('Best Facet:')} ${stats.bestFacet}`,
    `${label('Hardest:')} ${stats.hardest}`,
    `${label('Best Cut:')} ${stats.bestCut}`,
    `${label('Most Fire:')} ${stats.mostFire}`,
    `${label('Most Brilliant:')} ${stats.mostBrilliant}`,
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
  const items = recommendations.map(r => `${dim('\u{1F48E}')} ${r}`)
  return `${header}\n${items.join('\n')}`
}

// ─── Full Result Formatting ───────────────────────────────────────

/**
 * Format complete result as table
 * @example
 * formatResultTable(result) // full colored output
 */
export function formatResultTable(result: DiamondHorizonResult): string {
  const sections = [
    formatFacetsTable(result.facets),
    '',
    formatMinesTable(result.mines),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Horizon')} ${label('Flawless:')} ${result.horizon.isFlawless ? high('Yes') : low('No')} ${label('Overall Clarity:')} ${colorScore(result.horizon.overallClarity)}`,
    '',
    `${heading('Celebration')} ${label('Milestone #')} ${String(result.celebration.milestone)} ${label('Total Tests:')} ${String(result.celebration.totalTests)}`,
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
export function formatResultJson(result: DiamondHorizonResult): string {
  return JSON.stringify(result, null, 2)
}
