// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { RubyCurrent, TideBasin, RubyTideResult } from './ruby-tide-helpers.js'

// ─── Color Palette (ruby tide — crimson/deep red/coral) ────────────
const high = chalk.rgb(220, 100, 100)
const midHigh = chalk.rgb(200, 85, 85)
const mid = chalk.rgb(180, 70, 70)
const lowMid = chalk.rgb(155, 55, 55)
const low = chalk.rgb(130, 40, 40)

const best = chalk.rgb(255, 140, 140).bold
const good = chalk.rgb(235, 115, 115)
const okay = chalk.rgb(210, 95, 95)
const poor = chalk.rgb(185, 75, 75)
const worst = chalk.rgb(155, 55, 55)

const heading = chalk.rgb(245, 130, 130).bold
const label = chalk.rgb(215, 105, 105)
const dim = chalk.rgb(190, 85, 85)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // crimson
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
 * colorGrade('ruby-masterpiece') // best (bold crimson)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'tidal-bore': best, 'moon-driven': best, 'ruby-revealed': best,
    'surgical-wave': best, 'gulf-stream': best, 'ruby-masterpiece': best,
    'ruby-bay': best, 'magnificent-bay': best, 'tide-captain': best,

    'powerful-surge': good, 'steady-rhythm': good, 'gem-surface': good,
    'precise-strike': good, 'strong-undercurrent': good, 'crimson-wave': good,
    'crimson-harbor': good, 'crimson-shore': good, 'sea-commander': good,

    'proper-pulse': okay, 'proper-value': okay,
    'proper-aim': okay, 'proper-current': okay, 'proper-tide': okay,
    'proper-basin': okay, 'decent-coast': okay, 'skilled-sailor': okay,

    'gentle-flow': poor, 'irregular-beat': poor, 'hidden-value': poor,
    'approximate-hit': poor, 'weak-flow': poor, 'murky-current': poor,
    'small-cove': poor, 'murky-bay': poor, 'apprentice': poor,

    'stagnant-water': worst, 'arrhythmia': worst, 'buried-treasure': worst,
    'scattered-splash': worst, 'stagnant-depth': worst, 'stagnant-pool': worst,
    'ditch': worst, 'dried-up': worst, 'novice': worst,

    'no-current': worst, 'no-rhythm': worst, 'no-gem': worst,
    'no-precision': worst, 'no-flow': worst, 'dry-bed': worst,
    'no-basin': worst, 'void': worst, 'landlubber': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Current Formatting ───────────────────────────────────────────

/**
 * Format a single ruby current for display
 * @example
 * formatCurrentTable(current) // colored current info
 */
export function formatCurrentTable(current: RubyCurrent): string {
  const parts = [
    `${label('File:')} ${dim(current.file)}`,
    `${label('Crimson Power:')} ${colorScore(current.crimsonPower)} ${colorGrade(current.surging.grade)}`,
    `${label('Tidal Rhythm:')} ${colorScore(current.tidalRhythm)} ${colorGrade(current.pulsing.tide)}`,
    `${label('Gem Surfacing:')} ${colorScore(current.gemSurfacing)} ${colorGrade(current.revealing.gem)}`,
    `${label('Wave Precision:')} ${colorScore(current.wavePrecision)} ${colorGrade(current.striking.wave)}`,
    `${label('Deep Current:')} ${colorScore(current.deepCurrent)} ${colorGrade(current.flowing.deep)}`,
    `${label('Score:')} ${colorScore(current.qualityScore)} ${colorGrade(current.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format currents as summary table
 * @example
 * formatCurrentsTable(currents) // multi-line table
 */
export function formatCurrentsTable(currents: RubyCurrent[]): string {
  if (currents.length === 0) return dim('No ruby currents found')
  const header = heading('Ruby Tide Analysis')
  const rows = currents.map(c => formatCurrentTable(c))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Basin Formatting ─────────────────────────────────────────────

/**
 * Format a single tide basin for display
 * @example
 * formatBasinTable(basin) // colored basin info
 */
export function formatBasinTable(basin: TideBasin): string {
  const parts = [
    `${label('Basin:')} ${dim(basin.directory)}`,
    `${label('Type:')} ${colorGrade(basin.basinType)}`,
    `${label('Condition:')} ${colorGrade(basin.condition)}`,
    `${label('Currents:')} ${String(basin.currents.length)}`,
    `${label('Avg Power:')} ${colorScore(basin.avgPower)}`,
    `${label('Avg Rhythm:')} ${colorScore(basin.avgRhythm)}`,
    `${label('Avg Current:')} ${colorScore(basin.avgCurrent)}`,
    `${label('Masterpieces:')} ${String(basin.rubyMasterpieceCount)}`,
    `${label('Dry Beds:')} ${String(basin.dryBedCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all tide basins as summary
 * @example
 * formatBasinsTable(basins) // multi-line summary
 */
export function formatBasinsTable(basins: TideBasin[]): string {
  if (basins.length === 0) return dim('No tide basins found')
  const header = heading('Tide Basins')
  const rows = basins.map(b => formatBasinTable(b))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: RubyTideResult['stats']): string {
  const parts = [
    heading('Ruby Tide Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Basins:')} ${String(stats.totalBasins)}`,
    `${label('Avg Crimson Power:')} ${colorScore(stats.avgCrimsonPower)}`,
    `${label('Avg Tidal Rhythm:')} ${colorScore(stats.avgTidalRhythm)}`,
    `${label('Avg Gem Surfacing:')} ${colorScore(stats.avgGemSurfacing)}`,
    `${label('Avg Wave Precision:')} ${colorScore(stats.avgWavePrecision)}`,
    `${label('Avg Deep Current:')} ${colorScore(stats.avgDeepCurrent)}`,
    `${label('Ruby Masterpiece:')} ${String(stats.rubyMasterpieceCount)}`,
    `${label('Crimson Wave:')} ${String(stats.crimsonWaveCount)}`,
    `${label('Proper Tide:')} ${String(stats.properTideCount)}`,
    `${label('Murky Current:')} ${String(stats.murkyCurrentCount)}`,
    `${label('Stagnant Pool:')} ${String(stats.stagnantPoolCount)}`,
    `${label('Dry Bed:')} ${String(stats.dryBedCount)}`,
    `${label('High Power:')} ${String(stats.hasHighPowerCount)}`,
    `${label('High Rhythm:')} ${String(stats.hasHighRhythmCount)}`,
    `${label('High Surfacing:')} ${String(stats.hasHighSurfacingCount)}`,
    `${label('High Precision:')} ${String(stats.hasHighPrecisionCount)}`,
    `${label('High Current:')} ${String(stats.hasHighCurrentCount)}`,
    `${label('Overall Surge:')} ${colorScore(stats.overallSurge)}`,
    `${label('Captain Grade:')} ${colorGrade(stats.captainGrade)}`,
    `${label('Best Current:')} ${stats.bestCurrent}`,
    `${label('Most Powerful:')} ${stats.mostPowerful}`,
    `${label('Best Rhythm:')} ${stats.bestRhythm}`,
    `${label('Most Revealing:')} ${stats.mostRevealing}`,
    `${label('Deepest:')} ${stats.deepest}`,
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
  const items = recommendations.map(r => `${dim('\u{1F534}')} ${r}`)
  return `${header}\n${items.join('\n')}`
}

// ─── Full Result Formatting ───────────────────────────────────────

/**
 * Format complete result as table
 * @example
 * formatResultTable(result) // full colored output
 */
export function formatResultTable(result: RubyTideResult): string {
  const sections = [
    formatCurrentsTable(result.currents),
    '',
    formatBasinsTable(result.basins),
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
export function formatResultJson(result: RubyTideResult): string {
  return JSON.stringify(result, null, 2)
}
