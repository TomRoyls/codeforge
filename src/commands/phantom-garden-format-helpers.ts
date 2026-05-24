// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { GhostBloom, PhantomPlot, PhantomGardenResult } from './phantom-garden-helpers.js'

// ─── Color Palette (phantom garden — spectral/moonlit/ethereal) ────
const high = chalk.rgb(180, 130, 255)
const midHigh = chalk.rgb(160, 110, 235)
const mid = chalk.rgb(140, 90, 215)
const lowMid = chalk.rgb(120, 70, 195)
const low = chalk.rgb(100, 50, 175)

const best = chalk.rgb(220, 180, 255).bold
const good = chalk.rgb(180, 130, 255)
const okay = chalk.rgb(155, 105, 230)
const poor = chalk.rgb(125, 75, 200)
const worst = chalk.rgb(95, 45, 170)

const heading = chalk.rgb(190, 140, 250).bold
const label = chalk.rgb(170, 120, 240)
const dim = chalk.rgb(140, 90, 210)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // spectral purple
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
 * colorGrade('ethereal-masterpiece') // best (bold spectral)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'ancient-spirit-tree': best, 'spectral-blossom': best, 'deep-ethereal': best,
    'abundant-spirit': best, 'legendary-seed': best, 'ethereal-masterpiece': best,
    'spirit-garden': best, 'transcendent-garden': best, 'spirit-gardener': best,

    'flourishing-ghost-vine': good, 'ghost-flower': good, 'strong-spirit-root': good,
    'rich-phantom-yield': good, 'future-sprout': good, 'ghost-paradise': good,
    'ghost-grove': good, 'beautiful-phantom': good, 'phantom-botanist': good,

    'proper-ethereal': okay, 'proper-phantom': okay, 'proper-invisible': okay,
    'proper-harvest': okay, 'proper-seed': okay, 'proper-phantom-garden': okay,
    'proper-plot': okay, 'decent-spirit-garden': okay, 'skilled-cultivator': okay,

    'wilting-phantom': poor, 'wilting-ghost': poor, 'shallow-ghost': poor,
    'meager-ghost': poor, 'dormant-seed': poor, 'wilting-spirit-bed': poor,
    'withered-bed': poor, 'fading-grove': poor, 'apprentice': poor,

    'fading-spirit': worst, 'invisible-bloom': worst, 'surface-wisp': worst,
    'barren-spirit': worst, 'sterile-seed': worst, 'dead-ghost-garden': worst,
    'barren-ground': worst, 'dead-earth': worst, 'novice': worst,

    'no-growth': worst, 'no-bloom': worst, 'no-root': worst,
    'no-harvest': worst, 'no-seed': worst, 'void': worst,
    'no-plot': worst, 'ghost': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Bloom Formatting ──────────────────────────────────────────────

/**
 * Format a single bloom for display
 * @example
 * formatBloomTable(bloom) // colored bloom info
 */
export function formatBloomTable(bloom: GhostBloom): string {
  const parts = [
    `${label('File:')} ${dim(bloom.file)}`,
    `${label('Ethereal Growth:')} ${colorScore(bloom.etherealGrowth)} ${colorGrade(bloom.evolving.grade)}`,
    `${label('Ghost Bloom:')} ${colorScore(bloom.ghostBloom)} ${colorGrade(bloom.flowering.blossom)}`,
    `${label('Spectral Root:')} ${colorScore(bloom.spectralRoot)} ${colorGrade(bloom.rooting.spectral)}`,
    `${label('Wraith Harvest:')} ${colorScore(bloom.wraithHarvest)} ${colorGrade(bloom.yielding.wraith)}`,
    `${label('Phantom Seed:')} ${colorScore(bloom.phantomSeed)} ${colorGrade(bloom.seeding.phantom)}`,
    `${label('Score:')} ${colorScore(bloom.qualityScore)} ${colorGrade(bloom.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format blooms as summary table
 * @example
 * formatBloomsTable(blooms) // multi-line table
 */
export function formatBloomsTable(blooms: GhostBloom[]): string {
  if (blooms.length === 0) return dim('No ghost blooms found')
  const header = heading('Phantom Garden Analysis')
  const rows = blooms.map(b => formatBloomTable(b))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Plot Formatting ───────────────────────────────────────────────

/**
 * Format a plot for display
 * @example
 * formatPlotTable(plot) // colored plot info
 */
export function formatPlotTable(plot: PhantomPlot): string {
  const parts = [
    `${label('Plot:')} ${dim(plot.directory)}`,
    `${label('Type:')} ${colorGrade(plot.plotType)}`,
    `${label('Condition:')} ${colorGrade(plot.condition)}`,
    `${label('Blooms:')} ${String(plot.blooms.length)}`,
    `${label('Avg Growth:')} ${colorScore(plot.avgGrowth)}`,
    `${label('Avg Root:')} ${colorScore(plot.avgRoot)}`,
    `${label('Avg Seed:')} ${colorScore(plot.avgSeed)}`,
    `${label('Ethereal Masterpieces:')} ${String(plot.etherealMasterpieceCount)}`,
    `${label('Void:')} ${String(plot.voidCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all plots as summary
 * @example
 * formatPlotsTable(plots) // multi-line summary
 */
export function formatPlotsTable(plots: PhantomPlot[]): string {
  if (plots.length === 0) return dim('No phantom plots found')
  const header = heading('Phantom Plots')
  const rows = plots.map(p => formatPlotTable(p))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ──────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: PhantomGardenResult['stats']): string {
  const parts = [
    heading('Phantom Garden Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Plots:')} ${String(stats.totalPlots)}`,
    `${label('Avg Ethereal Growth:')} ${colorScore(stats.avgEtherealGrowth)}`,
    `${label('Avg Ghost Bloom:')} ${colorScore(stats.avgGhostBloom)}`,
    `${label('Avg Spectral Root:')} ${colorScore(stats.avgSpectralRoot)}`,
    `${label('Avg Wraith Harvest:')} ${colorScore(stats.avgWraithHarvest)}`,
    `${label('Avg Phantom Seed:')} ${colorScore(stats.avgPhantomSeed)}`,
    `${label('Ethereal Masterpiece:')} ${String(stats.etherealMasterpieceCount)}`,
    `${label('Ghost Paradise:')} ${String(stats.ghostParadiseCount)}`,
    `${label('Proper Phantom Garden:')} ${String(stats.properPhantomGardenCount)}`,
    `${label('Wilting Spirit Bed:')} ${String(stats.wiltingSpiritBedCount)}`,
    `${label('Dead Ghost Garden:')} ${String(stats.deadGhostGardenCount)}`,
    `${label('Void:')} ${String(stats.voidCount)}`,
    `${label('High Growth:')} ${String(stats.hasHighGrowthCount)}`,
    `${label('High Bloom:')} ${String(stats.hasHighBloomCount)}`,
    `${label('High Root:')} ${String(stats.hasHighRootCount)}`,
    `${label('High Harvest:')} ${String(stats.hasHighHarvestCount)}`,
    `${label('High Seed:')} ${String(stats.hasHighSeedCount)}`,
    `${label('Overall Spirit:')} ${colorScore(stats.overallSpirit)}`,
    `${label('Gardener Grade:')} ${colorGrade(stats.gardenerGrade)}`,
    `${label('Best Bloom:')} ${stats.bestBloom}`,
    `${label('Most Evolving:')} ${stats.mostEvolving}`,
    `${label('Best Blossoming:')} ${stats.bestBlossoming}`,
    `${label('Deepest Rooted:')} ${stats.deepestRooted}`,
    `${label('Best Seeded:')} ${stats.bestSeeded}`,
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
export function formatResultTable(result: PhantomGardenResult): string {
  const sections = [
    formatBloomsTable(result.blooms),
    '',
    formatPlotsTable(result.plots),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Realm')} ${label('Ethereal:')} ${result.realm.isEthereal ? high('Yes') : low('No')} ${label('Overall Spirit:')} ${colorScore(result.realm.overallSpirit)}`,
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
export function formatResultJson(result: PhantomGardenResult): string {
  return JSON.stringify(result, null, 2)
}
