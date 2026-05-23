// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { DiamondGem, DiamondMine, DiamondCoreResult } from './diamond-core-helpers.js'

// ─── Color Palette (diamond) ───────────────────────────────────────
const high = chalk.rgb(185, 242, 255)
const midHigh = chalk.rgb(160, 220, 245)
const mid = chalk.rgb(135, 200, 235)
const lowMid = chalk.rgb(110, 175, 220)
const low = chalk.rgb(90, 155, 205)

const best = chalk.rgb(200, 250, 255).bold
const good = chalk.rgb(180, 240, 250)
const okay = chalk.rgb(155, 220, 240)
const poor = chalk.rgb(130, 195, 225)
const worst = chalk.rgb(105, 170, 210)

const heading = chalk.rgb(195, 245, 255).bold
const label = chalk.rgb(175, 235, 250)
const dim = chalk.rgb(150, 165, 175)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // brilliant blue-white
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
 * colorGrade('hope-diamond') // best (bold diamond)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, string> = {
    'flawless-hardness': best, 'flawless': best, 'ideal-cut': best,
    'hearts-arrows': best, 'heavy-carat': best, 'hope-diamond': best,
    'kimberley-pipe': best, 'premium-pipe': best, 'master-gemologist': best,

    'mohs-ten': good, 'vvs': good, 'excellent-cut': good,
    'brilliant-fire': good, 'substantial-weight': good, 'koh-i-noor': good,
    'alluvial-deposit': good, 'rich-seam': good, 'expert-lapidary': good,

    'proper-hard': okay, 'vs': okay, 'very-good-cut': okay,
    'proper-sparkle': okay, 'proper-mass': okay, 'proper-diamond': okay,
    'proper-mine': okay, 'decent-yield': okay, 'skilled-cutter': okay,

    'semi-hard': poor, 'si': poor, 'good-cut': poor,
    'some-scintillation': poor, 'light-weight': poor, 'industrial-diamond': poor,
    'test-pit': poor, 'low-grade': poor, 'appraiser': poor,

    'soft-mineral': worst, 'i1': worst, 'fair-cut': worst,
    'dull-stone': worst, 'featherweight': worst, 'rough-crystal': worst,
    'surface-find': worst, 'exhausted': worst, 'novice': worst,

    'talc-grade': worst, 'i2': worst, 'poor-cut': worst,
    'dead-light': worst, 'weightless': worst, 'graphite': worst,
    'no-mine': worst, 'barren': worst, 'coal-miner': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Gem Formatting ────────────────────────────────────────────────

/**
 * Format a single gem for display
 * @example
 * formatGemTable(gem) // colored gem info
 */
export function formatGemTable(gem: DiamondGem): string {
  const parts = [
    `${label('File:')} ${dim(gem.file)}`,
    `${label('Hardness:')} ${colorScore(gem.hardness)} ${colorGrade(gem.hardening.grade)}`,
    `${label('Clarity:')} ${colorScore(gem.clarity)} ${colorGrade(gem.clarifying.grade2)}`,
    `${label('Cut:')} ${colorScore(gem.cutPrecision)} ${colorGrade(gem.cutting.cut)}`,
    `${label('Fire:')} ${colorScore(gem.fireDispersion)} ${colorGrade(gem.dispersing.dispersion)}`,
    `${label('Carat:')} ${colorScore(gem.caratDensity)} ${colorGrade(gem.weighing.carat)}`,
    `${label('Score:')} ${colorScore(gem.qualityScore)} ${colorGrade(gem.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format gems as summary table
 * @example
 * formatGemsTable(gems) // multi-line table
 */
export function formatGemsTable(gems: DiamondGem[]): string {
  if (gems.length === 0) return dim('No diamond gems found')
  const header = heading('Diamond Core Analysis')
  const rows = gems.map(g => formatGemTable(g))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Mine Formatting ───────────────────────────────────────────────

/**
 * Format a mine for display
 * @example
 * formatMineTable(mine) // colored mine info
 */
export function formatMineTable(mine: DiamondMine): string {
  const parts = [
    `${label('Mine:')} ${dim(mine.directory)}`,
    `${label('Type:')} ${colorGrade(mine.mineType)}`,
    `${label('Condition:')} ${colorGrade(mine.condition)}`,
    `${label('Gems:')} ${String(mine.gems.length)}`,
    `${label('Avg Hardness:')} ${colorScore(mine.avgHardness)}`,
    `${label('Avg Clarity:')} ${colorScore(mine.avgClarity)}`,
    `${label('Avg Fire:')} ${colorScore(mine.avgFire)}`,
    `${label('Hope Diamonds:')} ${String(mine.hopeDiamondCount)}`,
    `${label('Graphite:')} ${String(mine.graphiteCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all mines as summary
 * @example
 * formatMinesTable(mines) // multi-line mine summary
 */
export function formatMinesTable(mines: DiamondMine[]): string {
  if (mines.length === 0) return dim('No diamond mines found')
  const header = heading('Diamond Mine Analysis')
  const rows = mines.map(m => formatMineTable(m))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: DiamondCoreResult['stats']): string {
  const parts = [
    heading('Diamond Core Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Mines:')} ${String(stats.totalMines)}`,
    `${label('Avg Hardness:')} ${colorScore(stats.avgHardness)}`,
    `${label('Avg Clarity:')} ${colorScore(stats.avgClarity)}`,
    `${label('Avg Cut Precision:')} ${colorScore(stats.avgCutPrecision)}`,
    `${label('Avg Fire Dispersion:')} ${colorScore(stats.avgFireDispersion)}`,
    `${label('Avg Carat Density:')} ${colorScore(stats.avgCaratDensity)}`,
    `${label('Hope Diamond:')} ${String(stats.hopeDiamondCount)}`,
    `${label('Koh-i-Noor:')} ${String(stats.kohINoorCount)}`,
    `${label('Proper Diamond:')} ${String(stats.properDiamondCount)}`,
    `${label('Industrial:')} ${String(stats.industrialDiamondCount)}`,
    `${label('Rough Crystal:')} ${String(stats.roughCrystalCount)}`,
    `${label('Graphite:')} ${String(stats.graphiteCount)}`,
    `${label('High Hardness:')} ${String(stats.hasHighHardnessCount)}`,
    `${label('High Clarity:')} ${String(stats.hasHighClarityCount)}`,
    `${label('High Precision:')} ${String(stats.hasHighPrecisionCount)}`,
    `${label('High Fire:')} ${String(stats.hasHighFireCount)}`,
    `${label('High Density:')} ${String(stats.hasHighDensityCount)}`,
    `${label('Overall Brilliance:')} ${colorScore(stats.overallBrilliance)}`,
    `${label('Gemologist Grade:')} ${colorGrade(stats.gemologistGrade)}`,
    `${label('Best Gem:')} ${stats.bestGem}`,
    `${label('Hardest:')} ${stats.hardest}`,
    `${label('Clearest:')} ${stats.clearest}`,
    `${label('Best Cut:')} ${stats.bestCut}`,
    `${label('Most Brilliant:')} ${stats.mostBrilliant}`,
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
export function formatResultTable(result: DiamondCoreResult): string {
  const sections = [
    formatGemsTable(result.gems),
    '',
    formatMinesTable(result.mines),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Vault')} ${label('Precious:')} ${result.vault.isPrecious ? high('Yes') : low('No')} ${label('Overall Brilliance:')} ${colorScore(result.vault.overallBrilliance)}`,
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
export function formatResultJson(result: DiamondCoreResult): string {
  return JSON.stringify(result, null, 2)
}
