// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { AbyssalDive, TrenchSystem, OceanTrenchResult } from './ocean-trench-helpers.js'

// ─── Color Palette ─────────────────────────────────────────────────
const high = chalk.rgb(0, 180, 220)
const midHigh = chalk.rgb(0, 140, 190)
const mid = chalk.rgb(0, 100, 160)
const lowMid = chalk.rgb(0, 70, 130)
const low = chalk.rgb(0, 40, 90)

const best = chalk.rgb(100, 220, 255).bold
const good = chalk.rgb(60, 190, 230)
const okay = chalk.rgb(30, 150, 200)
const poor = chalk.rgb(20, 100, 160)
const worst = chalk.rgb(10, 50, 100)

const heading = chalk.rgb(0, 180, 220).bold
const label = chalk.rgb(60, 160, 210)
const dim = chalk.rgb(120, 140, 170)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // deep blue
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
 * colorGrade('mariana-trench') // best (bold blue)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, string> = {
    'hadal-zone': best, 'titan-grade': best, 'angstrom-luminosity': best,
    'detailed-chart': best, 'pristine-abyss': best, 'mariana-trench': best,
    'deep-trench': best, 'pristine-depths': best, 'deep-sea-explorer': best,

    'abyssal-plain': good, 'deep-submersible': good, 'bright-glow': good,
    'good-map': good, 'deep-treasure': good, 'deep-abyss': good,
    'mid-ocean-ridge': good, 'healthy-ocean': good, 'submarine-captain': good,

    'bathyal-zone': okay, 'proper-hull': okay, 'proper-light': okay,
    'proper-navigation': okay, 'proper-depth': okay, 'mid-depth': okay,
    'continental-shelf': okay, 'fair-waters': okay, 'marine-biologist': okay,

    'mesopelagic': poor, 'thin-shell': poor, 'dim-glow': poor,
    'sketchy-map': poor, 'murky-bottom': poor, 'shallow-waters': poor,
    'coastal-waters': poor, 'polluted-depths': poor, 'diver': poor,

    'epipelagic': worst, 'cracking': worst, 'flicker': worst,
    'lost-at-sea': worst, 'toxic-depth': worst, 'tidal-pool': worst,
    'tidal-zone': worst, 'dead-sea': worst, 'snorkeler': worst,

    'surface-water': worst, 'imploded': worst, 'darkness': worst,
    'uncharted': worst, 'dead-zone': worst, 'dry-land': worst,
    'dry-land': worst, 'dried-up': worst, 'landlubber': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Dive Formatting ───────────────────────────────────────────────

/**
 * Format a single dive for display
 * @example
 * formatDiveTable(dive) // colored dive info
 */
export function formatDiveTable(dive: AbyssalDive): string {
  const parts = [
    `${label('File:')} ${dim(dive.file)}`,
    `${label('Code Depth:')} ${colorScore(dive.depth)} ${colorGrade(dive.diving.grade)}`,
    `${label('Pressure Resilience:')} ${colorScore(dive.pressureResilience)} ${colorGrade(dive.resisting.pressure)}`,
    `${label('Bioluminescence:')} ${colorScore(dive.bioluminescence)} ${colorGrade(dive.glowing.luminescence)}`,
    `${label('Current Mapping:')} ${colorScore(dive.currentMapping)} ${colorGrade(dive.mapping.chart)}`,
    `${label('Abyssal Quality:')} ${colorScore(dive.abyssalQuality)} ${colorGrade(dive.qualifying.grade2)}`,
    `${label('Score:')} ${colorScore(dive.qualityScore)} ${colorGrade(dive.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format dives as summary table
 * @example
 * formatDivesTable(dives) // multi-line table
 */
export function formatDivesTable(dives: AbyssalDive[]): string {
  if (dives.length === 0) return dim('No abyssal dives found')
  const header = heading('Ocean Trench Analysis')
  const rows = dives.map(d => formatDiveTable(d))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Trench Formatting ─────────────────────────────────────────────

/**
 * Format a trench for display
 * @example
 * formatTrenchTable(trench) // colored trench info
 */
export function formatTrenchTable(trench: TrenchSystem): string {
  const parts = [
    `${label('Trench:')} ${dim(trench.directory)}`,
    `${label('Type:')} ${colorGrade(trench.trenchType)}`,
    `${label('Condition:')} ${colorGrade(trench.condition)}`,
    `${label('Dives:')} ${String(trench.dives.length)}`,
    `${label('Avg Depth:')} ${colorScore(trench.avgDepth)}`,
    `${label('Avg Resilience:')} ${colorScore(trench.avgResilience)}`,
    `${label('Avg Bioluminescence:')} ${colorScore(trench.avgBioluminescence)}`,
    `${label('Mariana Trenches:')} ${String(trench.marianaTrenchCount)}`,
    `${label('Dry Land:')} ${String(trench.dryLandCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all trenches as summary
 * @example
 * formatTrenchesTable(trenches) // multi-line trench summary
 */
export function formatTrenchesTable(trenches: TrenchSystem[]): string {
  if (trenches.length === 0) return dim('No trench systems found')
  const header = heading('Trench System Analysis')
  const rows = trenches.map(t => formatTrenchTable(t))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ──────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: OceanTrenchResult['stats']): string {
  const parts = [
    heading('Expedition Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Trenches:')} ${String(stats.totalTrenches)}`,
    `${label('Avg Depth:')} ${colorScore(stats.avgDepth)}`,
    `${label('Avg Pressure Resilience:')} ${colorScore(stats.avgPressureResilience)}`,
    `${label('Avg Bioluminescence:')} ${colorScore(stats.avgBioluminescence)}`,
    `${label('Avg Current Mapping:')} ${colorScore(stats.avgCurrentMapping)}`,
    `${label('Avg Abyssal Quality:')} ${colorScore(stats.avgAbyssalQuality)}`,
    `${label('Mariana Trenches:')} ${String(stats.marianaTrenchCount)}`,
    `${label('Deep Abyss:')} ${String(stats.deepAbyssCount)}`,
    `${label('Mid Depth:')} ${String(stats.midDepthCount)}`,
    `${label('Shallow Waters:')} ${String(stats.shallowWatersCount)}`,
    `${label('Tidal Pool:')} ${String(stats.tidalPoolCount)}`,
    `${label('Dry Land:')} ${String(stats.dryLandCount)}`,
    `${label('High Depth:')} ${String(stats.hasHighDepthCount)}`,
    `${label('High Resilience:')} ${String(stats.hasHighResilienceCount)}`,
    `${label('High Bioluminescence:')} ${String(stats.hasHighBioluminescenceCount)}`,
    `${label('High Mapping Quality:')} ${String(stats.hasHighQualityMappingCount)}`,
    `${label('High Abyssal Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('Overall Depth:')} ${colorScore(stats.overallDepth)}`,
    `${label('Explorer Grade:')} ${colorGrade(stats.explorerGrade)}`,
    `${label('Best Dive:')} ${stats.bestDive}`,
    `${label('Deepest:')} ${stats.deepest}`,
    `${label('Most Resilient:')} ${stats.mostResilient}`,
    `${label('Brightest:')} ${stats.brightest}`,
    `${label('Best Mapped:')} ${stats.bestMapped}`,
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
export function formatResultTable(result: OceanTrenchResult): string {
  const sections = [
    formatDivesTable(result.dives),
    '',
    formatTrenchesTable(result.trenches),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Ocean')} ${label('Deep:')} ${result.ocean.isDeep ? high('Yes') : low('No')} ${label('Overall Depth:')} ${colorScore(result.ocean.overallDepth)}`,
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
export function formatResultJson(result: OceanTrenchResult): string {
  return JSON.stringify(result, null, 2)
}
