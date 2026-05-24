// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { StormBloom, StormPlot, StormGardenResult } from './storm-garden-helpers.js'

// ─── Color Palette (storm garden — emerald-green/leaf/spring) ────
const high = chalk.rgb(100, 200, 120)
const midHigh = chalk.rgb(90, 185, 110)
const mid = chalk.rgb(80, 170, 100)
const lowMid = chalk.rgb(70, 155, 90)
const low = chalk.rgb(60, 140, 80)

const best = chalk.rgb(120, 220, 140).bold
const good = chalk.rgb(105, 200, 125)
const okay = chalk.rgb(90, 180, 110)
const poor = chalk.rgb(75, 160, 95)
const worst = chalk.rgb(60, 140, 80)

const heading = chalk.rgb(95, 190, 115).bold
const label = chalk.rgb(85, 175, 105)
const dim = chalk.rgb(70, 155, 90)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // emerald
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
 * colorGrade('evergreen-paradise') // best (bold emerald)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'storm-proof': best, 'explosive-growth': best, 'dancing-wind': best,
    'deep-anchor': best, 'resurgent-garden': best, 'evergreen-paradise': best,
    'botanical-garden': best, 'lush-paradise': best, 'master-horticulturist': best,

    'weather-hardy': good, 'vigorous-sprout': good, 'bending-reed': good,
    'strong-taproot': good, 'quick-recovery': good, 'blooming-garden': good,
    'proper-plot': good, 'thriving-garden': good, 'expert-gardener': good,

    'proper-resilience': okay, 'proper-growth': okay, 'proper-flex': okay,
    'proper-roots': okay, 'proper-healing': okay, 'proper-garden': okay,
    'decent-bed': okay, 'decent-plot': okay, 'skilled-cultivator': okay,

    'weather-sensitive': poor, 'slow-growth': poor, 'rigid-trunk': poor,
    'shallow-roots': poor, 'slow-recovery': poor, 'struggling-patch': poor,
    'small-patch': poor, 'struggling-bed': poor, 'apprentice': poor,

    'storm-damaged': worst, 'stunted': worst, 'breaking-branch': worst,
    'surface-feeder': worst, 'permanent-damage': worst, 'withered-bed': worst,
    'window-box': worst, 'barren-ground': worst, 'novice': worst,

    'washed-away': worst, 'no-growth': worst, 'uprooted': worst,
    'no-roots': worst, 'no-recovery': worst, 'barren-earth': worst,
    'no-plot': worst, 'void': worst, 'black-thumb': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Bloom Formatting ─────────────────────────────────────────────

/**
 * Format a single bloom for display
 * @example
 * formatBloomTable(bloom) // colored bloom info
 */
export function formatBloomTable(bloom: StormBloom): string {
  const parts = [
    `${label('File:')} ${dim(bloom.file)}`,
    `${label('Weathering Resilience:')} ${colorScore(bloom.weatheringResilience)} ${colorGrade(bloom.weathering.grade)}`,
    `${label('Growth Vitality:')} ${colorScore(bloom.growthVitality)} ${colorGrade(bloom.growing.growth)}`,
    `${label('Storm Adaptation:')} ${colorScore(bloom.stormAdaptation)} ${colorGrade(bloom.adapting.storm)}`,
    `${label('Root Tenacity:')} ${colorScore(bloom.rootTenacity)} ${colorGrade(bloom.holding.root)}`,
    `${label('Bloom Recovery:')} ${colorScore(bloom.bloomRecovery)} ${colorGrade(bloom.recovering.bloom)}`,
    `${label('Score:')} ${colorScore(bloom.qualityScore)} ${colorGrade(bloom.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format blooms as summary table
 * @example
 * formatBloomsTable(blooms) // multi-line table
 */
export function formatBloomsTable(blooms: StormBloom[]): string {
  if (blooms.length === 0) return dim('No storm blooms found')
  const header = heading('Storm Garden Analysis')
  const rows = blooms.map(b => formatBloomTable(b))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Plot Formatting ──────────────────────────────────────────────

/**
 * Format a plot for display
 * @example
 * formatPlotTable(plot) // colored plot info
 */
export function formatPlotTable(plot: StormPlot): string {
  const parts = [
    `${label('Plot:')} ${dim(plot.directory)}`,
    `${label('Type:')} ${colorGrade(plot.plotType)}`,
    `${label('Condition:')} ${colorGrade(plot.condition)}`,
    `${label('Blooms:')} ${String(plot.blooms.length)}`,
    `${label('Avg Resilience:')} ${colorScore(plot.avgResilience)}`,
    `${label('Avg Vitality:')} ${colorScore(plot.avgVitality)}`,
    `${label('Avg Recovery:')} ${colorScore(plot.avgRecovery)}`,
    `${label('Evergreen Paradise:')} ${String(plot.evergreenParadiseCount)}`,
    `${label('Barren Earth:')} ${String(plot.barrenEarthCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all plots as summary
 * @example
 * formatPlotsTable(plots) // multi-line summary
 */
export function formatPlotsTable(plots: StormPlot[]): string {
  if (plots.length === 0) return dim('No storm plots found')
  const header = heading('Storm Plots')
  const rows = plots.map(p => formatPlotTable(p))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: StormGardenResult['stats']): string {
  const parts = [
    heading('Storm Garden Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Plots:')} ${String(stats.totalPlots)}`,
    `${label('Avg Weathering Resilience:')} ${colorScore(stats.avgWeatheringResilience)}`,
    `${label('Avg Growth Vitality:')} ${colorScore(stats.avgGrowthVitality)}`,
    `${label('Avg Storm Adaptation:')} ${colorScore(stats.avgStormAdaptation)}`,
    `${label('Avg Root Tenacity:')} ${colorScore(stats.avgRootTenacity)}`,
    `${label('Avg Bloom Recovery:')} ${colorScore(stats.avgBloomRecovery)}`,
    `${label('Evergreen Paradise:')} ${String(stats.evergreenParadiseCount)}`,
    `${label('Blooming Garden:')} ${String(stats.bloomingGardenCount)}`,
    `${label('Proper Garden:')} ${String(stats.properGardenCount)}`,
    `${label('Struggling Patch:')} ${String(stats.strugglingPatchCount)}`,
    `${label('Withered Bed:')} ${String(stats.witheredBedCount)}`,
    `${label('Barren Earth:')} ${String(stats.barrenEarthCount)}`,
    `${label('High Resilience:')} ${String(stats.hasHighResilienceCount)}`,
    `${label('High Vitality:')} ${String(stats.hasHighVitalityCount)}`,
    `${label('High Adaptation:')} ${String(stats.hasHighAdaptationCount)}`,
    `${label('High Tenacity:')} ${String(stats.hasHighTenacityCount)}`,
    `${label('High Recovery:')} ${String(stats.hasHighRecoveryCount)}`,
    `${label('Overall Verdure:')} ${colorScore(stats.overallVerdure)}`,
    `${label('Gardener Grade:')} ${colorGrade(stats.gardenerGrade)}`,
    `${label('Best Bloom:')} ${stats.bestBloom}`,
    `${label('Most Resilient:')} ${stats.mostResilient}`,
    `${label('Most Vital:')} ${stats.mostVital}`,
    `${label('Most Adaptive:')} ${stats.mostAdaptive}`,
    `${label('Best Recovery:')} ${stats.bestRecovery}`,
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
export function formatResultTable(result: StormGardenResult): string {
  const sections = [
    formatBloomsTable(result.blooms),
    '',
    formatPlotsTable(result.plots),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Garden')} ${label('Thriving:')} ${result.garden.isThriving ? high('Yes') : low('No')} ${label('Overall Verdure:')} ${colorScore(result.garden.overallVerdure)}`,
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
export function formatResultJson(result: StormGardenResult): string {
  return JSON.stringify(result, null, 2)
}
