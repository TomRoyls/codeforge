// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { CrimsonWave, TideShore, CrimsonTideResult } from './crimson-tide-helpers.js'

// ─── Color Palette (crimson tide — deep red/ocean blue) ────────────
const high = chalk.rgb(220, 50, 50)
const midHigh = chalk.rgb(200, 60, 60)
const mid = chalk.rgb(180, 50, 50)
const lowMid = chalk.rgb(150, 45, 45)
const low = chalk.rgb(120, 40, 40)

const best = chalk.rgb(255, 80, 80).bold
const good = chalk.rgb(240, 70, 70)
const okay = chalk.rgb(210, 60, 60)
const poor = chalk.rgb(170, 50, 50)
const worst = chalk.rgb(140, 40, 40)

const heading = chalk.rgb(230, 60, 60).bold
const label = chalk.rgb(215, 55, 55)
const dim = chalk.rgb(180, 50, 50)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // bright crimson
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
 * colorGrade('tidal-masterpiece') // best (bold crimson)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'tidal-wave': best, 'perpetual-return': best, 'concentrated-essence': best,
    'surgical-strike': best, 'elephant-memory': best, 'tidal-masterpiece': best,
    'crimson-coast': best, 'powerful-coast': best, 'tide-master': best,

    'strong-surge': good, 'strong-recovery': good, 'rich-depth': good,
    'precise-wave': good, 'deep-recall': good, 'crimson-surge': good,
    'proper-shore': good, 'resilient-shore': good, 'sea-captain': good,

    'proper-swell': okay, 'proper-ebb': okay, 'proper-intensity': okay,
    'proper-aim': okay, 'proper-memory': okay, 'proper-tide': okay,
    'decent-beach': okay, 'decent-tide': okay, 'skilled-sailor': okay,

    'gentle-wave': poor, 'slow-recovery': poor, 'diluted-value': poor,
    'approximate-hit': poor, 'goldfish-memory': poor, 'gentle-current': poor,
    'rocky-coast': poor, 'calm-bay': poor, 'apprentice': poor,

    'flat-calm': worst, 'declining-tide': worst, 'surface-only': worst,
    'scattered-splash': worst, 'amnesia': worst, 'stagnant-water': worst,
    'mud-flat': worst, 'dried-up': worst, 'novice': worst,

    'no-surge': worst, 'no-recovery': worst, 'no-depth': worst,
    'no-precision': worst, 'no-memory': worst, 'dry-channel': worst,
    'no-shore': worst, 'void': worst, 'landlubber': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Wave Formatting ───────────────────────────────────────────────

/**
 * Format a single wave for display
 * @example
 * formatWaveTable(wave) // colored wave info
 */
export function formatWaveTable(wave: CrimsonWave): string {
  const parts = [
    `${label('File:')} ${dim(wave.file)}`,
    `${label('Surge Power:')} ${colorScore(wave.surgePower)} ${colorGrade(wave.surging.grade)}`,
    `${label('Ebb Resilience:')} ${colorScore(wave.ebbResilience)} ${colorGrade(wave.recovering.ebb)}`,
    `${label('Depth Intensity:')} ${colorScore(wave.depthIntensity)} ${colorGrade(wave.concentrating.depth)}`,
    `${label('Wave Precision:')} ${colorScore(wave.wavePrecision)} ${colorGrade(wave.precisioning.wave)}`,
    `${label('Ocean Memory:')} ${colorScore(wave.oceanMemory)} ${colorGrade(wave.remembering.ocean)}`,
    `${label('Score:')} ${colorScore(wave.qualityScore)} ${colorGrade(wave.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format waves as summary table
 * @example
 * formatWavesTable(waves) // multi-line table
 */
export function formatWavesTable(waves: CrimsonWave[]): string {
  if (waves.length === 0) return dim('No crimson waves found')
  const header = heading('Crimson Tide Analysis')
  const rows = waves.map(w => formatWaveTable(w))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Shore Formatting ──────────────────────────────────────────────

/**
 * Format a single shore for display
 * @example
 * formatShoreTable(shore) // colored shore info
 */
export function formatShoreTable(shore: TideShore): string {
  const parts = [
    `${label('Shore:')} ${dim(shore.directory)}`,
    `${label('Type:')} ${colorGrade(shore.shoreType)}`,
    `${label('Condition:')} ${colorGrade(shore.condition)}`,
    `${label('Waves:')} ${String(shore.waves.length)}`,
    `${label('Avg Power:')} ${colorScore(shore.avgPower)}`,
    `${label('Avg Resilience:')} ${colorScore(shore.avgResilience)}`,
    `${label('Avg Precision:')} ${colorScore(shore.avgPrecision)}`,
    `${label('Tidal Masterpieces:')} ${String(shore.tidalMasterpieceCount)}`,
    `${label('Dry Channels:')} ${String(shore.dryChannelCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all shores as summary
 * @example
 * formatShoresTable(shores) // multi-line summary
 */
export function formatShoresTable(shores: TideShore[]): string {
  if (shores.length === 0) return dim('No tide shores found')
  const header = heading('Tide Shores')
  const rows = shores.map(s => formatShoreTable(s))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ──────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: CrimsonTideResult['stats']): string {
  const parts = [
    heading('Crimson Tide Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Shores:')} ${String(stats.totalShores)}`,
    `${label('Avg Surge Power:')} ${colorScore(stats.avgSurgePower)}`,
    `${label('Avg Ebb Resilience:')} ${colorScore(stats.avgEbbResilience)}`,
    `${label('Avg Depth Intensity:')} ${colorScore(stats.avgDepthIntensity)}`,
    `${label('Avg Wave Precision:')} ${colorScore(stats.avgWavePrecision)}`,
    `${label('Avg Ocean Memory:')} ${colorScore(stats.avgOceanMemory)}`,
    `${label('Tidal Masterpiece:')} ${String(stats.tidalMasterpieceCount)}`,
    `${label('Crimson Surge:')} ${String(stats.crimsonSurgeCount)}`,
    `${label('Proper Tide:')} ${String(stats.properTideCount)}`,
    `${label('Gentle Current:')} ${String(stats.gentleCurrentCount)}`,
    `${label('Stagnant Water:')} ${String(stats.stagnantWaterCount)}`,
    `${label('Dry Channel:')} ${String(stats.dryChannelCount)}`,
    `${label('High Power:')} ${String(stats.hasHighPowerCount)}`,
    `${label('High Resilience:')} ${String(stats.hasHighResilienceCount)}`,
    `${label('High Intensity:')} ${String(stats.hasHighIntensityCount)}`,
    `${label('High Precision:')} ${String(stats.hasHighPrecisionCount)}`,
    `${label('High Memory:')} ${String(stats.hasHighMemoryCount)}`,
    `${label('Overall Surge:')} ${colorScore(stats.overallSurge)}`,
    `${label('Navigator Grade:')} ${colorGrade(stats.navigatorGrade)}`,
    `${label('Best Wave:')} ${stats.bestWave}`,
    `${label('Most Powerful:')} ${stats.mostPowerful}`,
    `${label('Most Resilient:')} ${stats.mostResilient}`,
    `${label('Most Intense:')} ${stats.mostIntense}`,
    `${label('Most Precise:')} ${stats.mostPrecise}`,
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
export function formatResultTable(result: CrimsonTideResult): string {
  const sections = [
    formatWavesTable(result.waves),
    '',
    formatShoresTable(result.shores),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Sea')} ${label('Crimson:')} ${result.sea.isCrimson ? high('Yes') : low('No')} ${label('Overall Surge:')} ${colorScore(result.sea.overallSurge)}`,
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
export function formatResultJson(result: CrimsonTideResult): string {
  return JSON.stringify(result, null, 2)
}
