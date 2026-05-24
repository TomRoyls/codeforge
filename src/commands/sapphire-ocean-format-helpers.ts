// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { OceanWave, OceanDepth, SapphireOceanResult } from './sapphire-ocean-helpers.js'

// ─── Color Palette (sapphire ocean — deep blue/cyan/teal) ─────────
const high = chalk.rgb(64, 164, 223)
const midHigh = chalk.rgb(54, 149, 208)
const mid = chalk.rgb(44, 134, 193)
const lowMid = chalk.rgb(34, 119, 178)
const low = chalk.rgb(24, 104, 163)

const best = chalk.rgb(79, 195, 247).bold
const good = chalk.rgb(64, 164, 223)
const okay = chalk.rgb(49, 149, 208)
const poor = chalk.rgb(34, 134, 193)
const worst = chalk.rgb(24, 104, 163)

const heading = chalk.rgb(59, 154, 218).bold
const label = chalk.rgb(49, 139, 203)
const dim = chalk.rgb(39, 124, 188)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // cyan
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
 * colorGrade('sapphire-masterpiece') // best (bold cyan)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'crystal-waters': best, 'perfect-tide': best, 'great-barrier': best,
    'gulf-stream': best, 'mariana-trench': best, 'sapphire-masterpiece': best,
    'pristine-ocean': best, 'ocean-master': best,

    'clear-depth': good, 'steady-current': good, 'vibrant-reef': good,
    'strong-current': good, 'deep-survivor': good, 'ocean-jewel': good,
    'continental-shelf': good, 'clear-waters': good, 'deep-sea-captain': good,

    'proper-transparency': okay, 'proper-rhythm': okay, 'proper-ecosystem': okay,
    'proper-flow': okay, 'proper-depth': okay, 'proper-sea': okay,
    'proper-ocean': okay, 'decent-sea': okay, 'skilled-sailor': okay,

    'murky-waters': poor, 'irregular-wave': poor, 'bleached-coral': poor,
    'sluggish-creek': poor, 'pressure-crack': poor, 'murky-puddle': poor,
    'shallow-sea': poor, 'murky-waters': poor, 'apprentice': poor,

    'cloudy-depth': worst, 'chaotic-surf': worst, 'dead-reef': worst,
    'stagnant-pool': worst, 'crushed-hull': worst, 'stagnant-pond': worst,
    'tidal-pool': worst, 'polluted-bay': worst, 'novice': worst,

    'opaque-sea': worst, 'still-water': worst, 'no-ecosystem': worst,
    'no-flow': worst, 'no-depth': worst, 'dry-land': worst,
    'no-ocean': worst, 'void': worst, 'landlubber': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Wave Formatting ──────────────────────────────────────────────

/**
 * Format a single wave for display
 * @example
 * formatWaveTable(wave) // colored wave info
 */
export function formatWaveTable(wave: OceanWave): string {
  const parts = [
    `${label('File:')} ${dim(wave.file)}`,
    `${label('Depth Clarity:')} ${colorScore(wave.depthClarity)} ${colorGrade(wave.clarifying.grade)}`,
    `${label('Tidal Rhythm:')} ${colorScore(wave.tidalRhythm)} ${colorGrade(wave.pulsing.tide)}`,
    `${label('Coral Diversity:')} ${colorScore(wave.coralDiversity)} ${colorGrade(wave.thriving.coral)}`,
    `${label('Current Efficiency:')} ${colorScore(wave.currentEfficiency)} ${colorGrade(wave.flowing.current)}`,
    `${label('Abyss Resilience:')} ${colorScore(wave.abyssResilience)} ${colorGrade(wave.diving.abyss)}`,
    `${label('Score:')} ${colorScore(wave.qualityScore)} ${colorGrade(wave.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format waves as summary table
 * @example
 * formatWavesTable(waves) // multi-line table
 */
export function formatWavesTable(waves: OceanWave[]): string {
  if (waves.length === 0) return dim('No ocean waves found')
  const header = heading('Sapphire Ocean Analysis')
  const rows = waves.map(w => formatWaveTable(w))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Depth Formatting ─────────────────────────────────────────────

/**
 * Format a depth for display
 * @example
 * formatDepthTable(depth) // colored depth info
 */
export function formatDepthTable(depth: OceanDepth): string {
  const parts = [
    `${label('Depth:')} ${dim(depth.directory)}`,
    `${label('Type:')} ${colorGrade(depth.depthType)}`,
    `${label('Condition:')} ${colorGrade(depth.condition)}`,
    `${label('Waves:')} ${String(depth.waves.length)}`,
    `${label('Avg Clarity:')} ${colorScore(depth.avgClarity)}`,
    `${label('Avg Rhythm:')} ${colorScore(depth.avgRhythm)}`,
    `${label('Avg Resilience:')} ${colorScore(depth.avgResilience)}`,
    `${label('Sapphire Masterpieces:')} ${String(depth.sapphireMasterpieceCount)}`,
    `${label('Dry Land:')} ${String(depth.dryLandCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all depths as summary
 * @example
 * formatDepthsTable(depths) // multi-line summary
 */
export function formatDepthsTable(depths: OceanDepth[]): string {
  if (depths.length === 0) return dim('No ocean depths found')
  const header = heading('Ocean Depths')
  const rows = depths.map(d => formatDepthTable(d))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: SapphireOceanResult['stats']): string {
  const parts = [
    heading('Sapphire Ocean Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Depths:')} ${String(stats.totalDepths)}`,
    `${label('Avg Depth Clarity:')} ${colorScore(stats.avgDepthClarity)}`,
    `${label('Avg Tidal Rhythm:')} ${colorScore(stats.avgTidalRhythm)}`,
    `${label('Avg Coral Diversity:')} ${colorScore(stats.avgCoralDiversity)}`,
    `${label('Avg Current Efficiency:')} ${colorScore(stats.avgCurrentEfficiency)}`,
    `${label('Avg Abyss Resilience:')} ${colorScore(stats.avgAbyssResilience)}`,
    `${label('Sapphire Masterpiece:')} ${String(stats.sapphireMasterpieceCount)}`,
    `${label('Ocean Jewel:')} ${String(stats.oceanJewelCount)}`,
    `${label('Proper Sea:')} ${String(stats.properSeaCount)}`,
    `${label('Murky Puddle:')} ${String(stats.murkyPuddleCount)}`,
    `${label('Stagnant Pond:')} ${String(stats.stagnantPondCount)}`,
    `${label('Dry Land:')} ${String(stats.dryLandCount)}`,
    `${label('High Depth:')} ${String(stats.hasHighDepthCount)}`,
    `${label('High Rhythm:')} ${String(stats.hasHighRhythmCount)}`,
    `${label('High Diversity:')} ${String(stats.hasHighDiversityCount)}`,
    `${label('High Efficiency:')} ${String(stats.hasHighEfficiencyCount)}`,
    `${label('High Resilience:')} ${String(stats.hasHighResilienceCount)}`,
    `${label('Overall Depth:')} ${colorScore(stats.overallDepth)}`,
    `${label('Navigator Grade:')} ${colorGrade(stats.navigatorGrade)}`,
    `${label('Best Wave:')} ${stats.bestWave}`,
    `${label('Clearest:')} ${stats.clearest}`,
    `${label('Best Rhythm:')} ${stats.bestRhythm}`,
    `${label('Most Diverse:')} ${stats.mostDiverse}`,
    `${label('Most Efficient:')} ${stats.mostEfficient}`,
  ]
  return parts.join('\n')
}

// ─── Celebration Formatting ────────────────────────────────────────

/**
 * Format celebration info
 * @example
 * formatCelebration(celebration) // milestone display
 */
export function formatCelebration(celebration: SapphireOceanResult['celebration']): string {
  const parts = [
    heading(`\u{1F30A} Milestone #${celebration.milestone}: ${celebration.name}`),
    `${label('Message:')} ${celebration.message}`,
    `${label('Previous Milestones:')} ${celebration.previousMilestones.join(', ')}`,
    `${label('Total Tests:')} ${String(celebration.totalTests)}+`,
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
export function formatResultTable(result: SapphireOceanResult): string {
  const sections = [
    formatWavesTable(result.waves),
    '',
    formatDepthsTable(result.depths),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Ocean')} ${label('Pristine:')} ${result.ocean.isPristine ? high('Yes') : low('No')} ${label('Overall Depth:')} ${colorScore(result.ocean.overallDepth)}`,
    '',
    formatCelebration(result.celebration),
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
export function formatResultJson(result: SapphireOceanResult): string {
  return JSON.stringify(result, null, 2)
}
