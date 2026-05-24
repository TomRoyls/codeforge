// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { EmeraldWave, EmeraldOcean, EmeraldTideResult } from './emerald-tide-helpers.js'

// ─── Color Palette (emerald tide — green/teal/ocean) ──────────────
const high = chalk.rgb(0, 210, 130)
const midHigh = chalk.rgb(30, 180, 110)
const mid = chalk.rgb(50, 155, 90)
const lowMid = chalk.rgb(80, 125, 70)
const low = chalk.rgb(110, 100, 55)

const best = chalk.rgb(0, 255, 150).bold
const good = chalk.rgb(30, 225, 130)
const okay = chalk.rgb(60, 195, 110)
const poor = chalk.rgb(95, 155, 85)
const worst = chalk.rgb(125, 125, 65)

const heading = chalk.rgb(0, 225, 145).bold
const label = chalk.rgb(40, 205, 125)
const dim = chalk.rgb(80, 185, 105)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // bright emerald
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
 * colorGrade('emerald-masterpiece') // best (bold emerald)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'emerald-masterpiece': best, 'abyssal-emerald': best, 'moon-driven': best,
    'lush-garden': best, 'crystal-clear': best, 'ancient-mariner': best,
    'emerald-sea': best, 'magnificent-ocean': best, 'master-navigator': best,

    'jade-wave': good, 'deep-gem': good, 'steady-rhythm': good,
    'healthy-growth': good, 'clean-water': good, 'wise-captain': good,
    'jade-ocean': good, 'beautiful-sea': good, 'sea-captain': good,

    'green-tide': okay, 'proper-depth': okay, 'proper-pulse': okay,
    'proper-green': okay, 'proper-purity': okay, 'proper-sailor': okay,
    'proper-gulf': okay, 'decent-bay': okay, 'skilled-sailor': okay,

    'murky-current': poor, 'shallow-water': poor, 'irregular-beat': poor,
    'wilting-plant': poor, 'murky-tide': poor, 'learning-navigator': poor,
    'small-bay': poor, 'murky-waters': poor, 'apprentice': poor,

    'stagnant-pool': worst, 'surface-ripple': worst, 'arrhythmia': worst,
    'dormant-seed': worst, 'polluted-water': worst, 'lost-swimmer': worst,
    'pond': worst, 'dried-up': worst, 'novice': worst,

    'dry-bed': worst, 'no-depth': worst, 'no-rhythm': worst,
    'no-life': worst, 'no-purity': worst, 'no-wisdom': worst,
    'no-ocean': worst, 'void': worst, 'landlubber': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Wave Formatting ──────────────────────────────────────────────

/**
 * Format a single emerald wave for display
 * @example
 * formatWaveTable(wave) // colored wave info
 */
export function formatWaveTable(wave: EmeraldWave): string {
  const parts = [
    `${label('File:')} ${dim(wave.file)}`,
    `${label('Gem Depth:')} ${colorScore(wave.gemDepth)} ${colorGrade(wave.diving.grade)}`,
    `${label('Tidal Rhythm:')} ${colorScore(wave.tidalRhythm)} ${colorGrade(wave.pulsing.tide)}`,
    `${label('Green Vitality:')} ${colorScore(wave.greenVitality)} ${colorGrade(wave.growing.growth)}`,
    `${label('Wave Purity:')} ${colorScore(wave.wavePurity)} ${colorGrade(wave.cleansing.cleanliness)}`,
    `${label('Ocean Wisdom:')} ${colorScore(wave.oceanWisdom)} ${colorGrade(wave.knowing.sage)}`,
    `${label('Score:')} ${colorScore(wave.qualityScore)} ${colorGrade(wave.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format waves as summary table
 * @example
 * formatWavesTable(waves) // multi-line table
 */
export function formatWavesTable(waves: EmeraldWave[]): string {
  if (waves.length === 0) return dim('No emerald waves found')
  const header = heading('Emerald Wave Analysis')
  const rows = waves.map(w => formatWaveTable(w))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Ocean Formatting ────────────────────────────────────────────

/**
 * Format a single emerald ocean for display
 * @example
 * formatOceanTable(ocean) // colored ocean info
 */
export function formatOceanTable(ocean: EmeraldOcean): string {
  const parts = [
    `${label('Ocean:')} ${dim(ocean.directory)}`,
    `${label('Type:')} ${colorGrade(ocean.oceanType)}`,
    `${label('Condition:')} ${colorGrade(ocean.condition)}`,
    `${label('Waves:')} ${String(ocean.waves.length)}`,
    `${label('Avg Depth:')} ${colorScore(ocean.avgDepth)}`,
    `${label('Avg Rhythm:')} ${colorScore(ocean.avgRhythm)}`,
    `${label('Avg Wisdom:')} ${colorScore(ocean.avgWisdom)}`,
    `${label('Emerald Masterpieces:')} ${String(ocean.emeraldMasterpieceCount)}`,
    `${label('Dry Beds:')} ${String(ocean.dryBedCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all emerald oceans as summary
 * @example
 * formatOceansTable(oceans) // multi-line summary
 */
export function formatOceansTable(oceans: EmeraldOcean[]): string {
  if (oceans.length === 0) return dim('No emerald oceans found')
  const header = heading('Emerald Oceans')
  const rows = oceans.map(o => formatOceanTable(o))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: EmeraldTideResult['stats']): string {
  const parts = [
    heading('Emerald Tide Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Oceans:')} ${String(stats.totalOceans)}`,
    `${label('Avg Gem Depth:')} ${colorScore(stats.avgGemDepth)}`,
    `${label('Avg Tidal Rhythm:')} ${colorScore(stats.avgTidalRhythm)}`,
    `${label('Avg Green Vitality:')} ${colorScore(stats.avgGreenVitality)}`,
    `${label('Avg Wave Purity:')} ${colorScore(stats.avgWavePurity)}`,
    `${label('Avg Ocean Wisdom:')} ${colorScore(stats.avgOceanWisdom)}`,
    `${label('Emerald Masterpiece:')} ${String(stats.emeraldMasterpieceCount)}`,
    `${label('Jade Wave:')} ${String(stats.jadeWaveCount)}`,
    `${label('Green Tide:')} ${String(stats.greenTideCount)}`,
    `${label('Murky Current:')} ${String(stats.murkyCurrentCount)}`,
    `${label('Stagnant Pool:')} ${String(stats.stagnantPoolCount)}`,
    `${label('Dry Bed:')} ${String(stats.dryBedCount)}`,
    `${label('High Depth:')} ${String(stats.hasHighDepthCount)}`,
    `${label('High Rhythm:')} ${String(stats.hasHighRhythmCount)}`,
    `${label('High Vitality:')} ${String(stats.hasHighVitalityCount)}`,
    `${label('High Purity:')} ${String(stats.hasHighPurityCount)}`,
    `${label('High Wisdom:')} ${String(stats.hasHighWisdomCount)}`,
    `${label('Overall Vitality:')} ${colorScore(stats.overallVitality)}`,
    `${label('Navigator Grade:')} ${colorGrade(stats.navigatorGrade)}`,
    `${label('Best Wave:')} ${stats.bestWave}`,
    `${label('Deepest:')} ${stats.deepest}`,
    `${label('Best Rhythm:')} ${stats.bestRhythm}`,
    `${label('Most Vital:')} ${stats.mostVital}`,
    `${label('Wisest:')} ${stats.wisest}`,
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
  const items = recommendations.map(r => `${dim('\uD83C\uDF0A')} ${r}`)
  return `${header}\n${items.join('\n')}`
}

// ─── Full Result Formatting ───────────────────────────────────────

/**
 * Format complete result as table
 * @example
 * formatResultTable(result) // full colored output
 */
export function formatResultTable(result: EmeraldTideResult): string {
  const sections = [
    formatWavesTable(result.waves),
    '',
    formatOceansTable(result.oceans),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Sea')} ${label('Emerald:')} ${result.sea.isEmerald ? high('Yes') : low('No')} ${label('Overall Vitality:')} ${colorScore(result.sea.overallVitality)}`,
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
export function formatResultJson(result: EmeraldTideResult): string {
  return JSON.stringify(result, null, 2)
}
