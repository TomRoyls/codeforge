// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type {
  CoralPolyp,
  ReefSystem,
  CoralReefResult,
} from './coral-reef-helpers.js'

// ─── Color Palette ─────────────────────────────────────────────────
const high = chalk.rgb(255, 127, 80)
const midHigh = chalk.rgb(0, 206, 209)
const mid = chalk.rgb(64, 224, 208)
const lowMid = chalk.rgb(70, 130, 180)
const low = chalk.rgb(100, 100, 100)

const best = chalk.rgb(255, 127, 80).bold
const good = chalk.rgb(0, 206, 209)
const okay = chalk.rgb(64, 224, 208)
const poor = chalk.rgb(70, 130, 180)
const worst = chalk.rgb(60, 60, 60)

const heading = chalk.rgb(255, 127, 80).bold
const label = chalk.rgb(0, 206, 209)
const dim = chalk.rgb(140, 180, 160)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // coral
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
 * colorGrade('great-barrier') // best (coral bold)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, string> = {
    'great-barrier': best, 'vibrant-colony': best, 'giant-polyp': best,
    'massive-reef': best, 'deep-current': best, 'barrier-reef': best,
    'pristine-reef': best, 'marine-biologist': best,

    'thriving-reef': good, 'healthy-colony': good, 'strong-polyp': good,
    'branching-reef': good, 'strong-swimmer': good, 'atoll-reef': good,
    'healthy-reef': good, 'reef-guardian': good,

    'stable-colony': okay, 'proper-polyp': okay,
    'plate-reef': okay, 'proper-flow': okay, 'fringing-reef': okay,
    'fair-reef': okay, 'ocean-steward': okay,

    'stressed-reef': poor, 'stressed-colony': poor, 'weak-polyp': poor,
    'encrusting': poor, 'weak-current': poor, 'patch-reef': poor,
    'stressed-reef': poor, 'beachcomber': poor,

    'bleached-coral': worst, 'declining-colony': worst, 'fragile-polyp': worst,
    'fragile-framework': worst, 'stagnant': worst, 'dead-coral': worst,
    'rocky-shore': worst, 'degraded-reef': worst, 'tourist': worst,

    'dead-zone': worst, 'collapsed-colony': worst, 'dissolved': worst,
    'rubble': worst, 'beached': worst, 'sandbar': worst,
    'barren-coast': worst, 'dead-reef': worst, 'polluter': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Polyp Formatting ──────────────────────────────────────────────

/**
 * Format a single coral polyp for table display
 * @example
 * formatPolypTable(polyp) // colored table row
 */
export function formatPolypTable(polyp: CoralPolyp): string {
  const parts = [
    `${label('File:')} ${dim(polyp.file)}`,
    `${label('Biodiversity:')} ${colorScore(polyp.biodiversity)} ${colorGrade(polyp.diversifying.grade)}`,
    `${label('Colony Health:')} ${colorScore(polyp.colonyHealth)} ${colorGrade(polyp.colonizing.colony)}`,
    `${label('Polyp Strength:')} ${colorScore(polyp.polypStrength)} ${colorGrade(polyp.strengthening.polyp)}`,
    `${label('Reef Structure:')} ${colorScore(polyp.reefStructure)} ${colorGrade(polyp.structuring.architecture)}`,
    `${label('Current Resilience:')} ${colorScore(polyp.currentResilience)} ${colorGrade(polyp.adapting.adaptation)}`,
    `${label('Score:')} ${colorScore(polyp.qualityScore)} ${colorGrade(polyp.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format polyps as a summary table
 * @example
 * formatPolypsTable(polyps) // multi-line table
 */
export function formatPolypsTable(polyps: CoralPolyp[]): string {
  if (polyps.length === 0) return dim('No coral polyps found')
  const header = heading('Coral Polyp Analysis')
  const rows = polyps.map(p => formatPolypTable(p))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Reef Formatting ───────────────────────────────────────────────

/**
 * Format a reef system for display
 * @example
 * formatReefTable(reef) // colored reef summary
 */
export function formatReefTable(reef: ReefSystem): string {
  const parts = [
    `${label('Reef:')} ${dim(reef.directory)}`,
    `${label('Type:')} ${colorGrade(reef.reefType)}`,
    `${label('Condition:')} ${colorGrade(reef.condition)}`,
    `${label('Polyps:')} ${String(reef.polyps.length)}`,
    `${label('Avg Biodiversity:')} ${colorScore(reef.avgBiodiversity)}`,
    `${label('Avg Structure:')} ${colorScore(reef.avgStructure)}`,
    `${label('Avg Resilience:')} ${colorScore(reef.avgResilience)}`,
    `${label('Barrier Reefs:')} ${String(reef.barrierReefCount)}`,
    `${label('Sandbars:')} ${String(reef.sandbarCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all reefs as a summary table
 * @example
 * formatReefsTable(reefs) // multi-line reef summary
 */
export function formatReefsTable(reefs: ReefSystem[]): string {
  if (reefs.length === 0) return dim('No reef systems found')
  const header = heading('Reef System Analysis')
  const rows = reefs.map(r => formatReefTable(r))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ──────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats summary
 */
export function formatStatsTable(stats: CoralReefResult['stats']): string {
  const parts = [
    heading('Ocean Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Reefs:')} ${String(stats.totalReefs)}`,
    `${label('Avg Biodiversity:')} ${colorScore(stats.avgBiodiversity)}`,
    `${label('Avg Colony Health:')} ${colorScore(stats.avgColonyHealth)}`,
    `${label('Avg Polyp Strength:')} ${colorScore(stats.avgPolypStrength)}`,
    `${label('Avg Reef Structure:')} ${colorScore(stats.avgReefStructure)}`,
    `${label('Avg Current Resilience:')} ${colorScore(stats.avgCurrentResilience)}`,
    `${label('Barrier Reefs:')} ${String(stats.barrierReefCount)}`,
    `${label('Atoll Reefs:')} ${String(stats.atollReefCount)}`,
    `${label('Fringing Reefs:')} ${String(stats.fringingReefCount)}`,
    `${label('Patch Reefs:')} ${String(stats.patchReefCount)}`,
    `${label('Dead Coral:')} ${String(stats.deadCoralCount)}`,
    `${label('Sandbars:')} ${String(stats.sandbarCount)}`,
    `${label('High Diversity:')} ${String(stats.hasHighDiversityCount)}`,
    `${label('High Health:')} ${String(stats.hasHighHealthCount)}`,
    `${label('High Strength:')} ${String(stats.hasHighStrengthCount)}`,
    `${label('High Structure:')} ${String(stats.hasHighStructureCount)}`,
    `${label('High Resilience:')} ${String(stats.hasHighResilienceCount)}`,
    `${label('Overall Health:')} ${colorScore(stats.overallHealth)}`,
    `${label('Marine Grade:')} ${colorGrade(stats.marineGrade)}`,
    `${label('Best Polyp:')} ${stats.bestPolyp}`,
    `${label('Most Diverse:')} ${stats.mostDiverse}`,
    `${label('Healthiest:')} ${stats.healthiest}`,
    `${label('Strongest:')} ${stats.strongest}`,
    `${label('Best Structured:')} ${stats.bestStructured}`,
  ]
  return parts.join('\n')
}

// ─── Recommendation Formatting ─────────────────────────────────────

/**
 * Format recommendations as a list
 * @example
 * formatRecommendations(recs) // bullet list
 */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return dim('No recommendations')
  const header = heading('Recommendations')
  const items = recommendations.map(r => `${dim('•')} ${r}`)
  return `${header}\n${items.join('\n')}`
}

// ─── Full Result Formatting ────────────────────────────────────────

/**
 * Format complete result as a table
 * @example
 * formatResultTable(result) // full colored output
 */
export function formatResultTable(result: CoralReefResult): string {
  const sections = [
    formatPolypsTable(result.polyps),
    '',
    formatReefsTable(result.reefs),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Ocean')} ${label('Thriving:')} ${result.ocean.isThriving ? high('Yes') : low('No')} ${label('Overall Health:')} ${colorScore(result.ocean.overallHealth)}`,
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
export function formatResultJson(result: CoralReefResult): string {
  return JSON.stringify(result, null, 2)
}
