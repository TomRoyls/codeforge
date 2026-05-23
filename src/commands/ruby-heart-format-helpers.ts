// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { RubyGem, RubyMine, RubyHeartResult } from './ruby-heart-helpers.js'

// ─── Color Palette (ruby) ──────────────────────────────────────────
const high = chalk.rgb(255, 80, 80)
const midHigh = chalk.rgb(230, 70, 80)
const mid = chalk.rgb(205, 60, 80)
const lowMid = chalk.rgb(180, 50, 75)
const low = chalk.rgb(155, 40, 70)

const best = chalk.rgb(255, 50, 60).bold
const good = chalk.rgb(240, 60, 70)
const okay = chalk.rgb(215, 55, 75)
const poor = chalk.rgb(185, 45, 70)
const worst = chalk.rgb(155, 35, 65)

const heading = chalk.rgb(255, 85, 90).bold
const label = chalk.rgb(245, 75, 85)
const dim = chalk.rgb(150, 130, 135)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // vivid ruby red
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
 * colorGrade('pigeon-blood-ruby') // best (bold ruby)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, string> = {
    'pigeon-blood': best, 'deep-crimson': best, 'eye-clean': best,
    'sapphire-hard': best, 'eternal-fire': best, 'pigeon-blood-ruby': best,
    'burma-mine': best, 'premium-vein': best, 'master-jeweler': best,

    'vivid-red': good, 'rich-red': good, 'minor-inclusions': good,
    'proper-hard': good, 'long-burning': good, 'burma-ruby': good,
    'thai-mine': good, 'rich-seam': good, 'ruby-expert': good,

    'proper-red': okay, 'proper-scarlet': okay, 'proper-clarity': okay,
    'good-hardness': okay, 'proper-flame': okay, 'proper-ruby': okay,
    'proper-deposit': okay, 'decent-yield': okay, 'skilled-gemologist': okay,

    'pinkish-red': poor, 'light-pink': poor, 'visible-inclusions': poor,
    'medium-hard': poor, 'fading-ember': poor, 'pink-sapphire': poor,
    'secondary-deposit': poor, 'low-grade': poor, 'appraiser': poor,

    'pale-red': worst, 'faded': worst, 'cloudy': worst,
    'soft-stone': worst, 'brief-spark': worst, 'garnet-imitation': worst,
    'surface-find': worst, 'exhausted': worst, 'novice': worst,

    'colorless': worst, 'washed-out': worst, 'opaque': worst,
    'crumbly': worst, 'cold-stone': worst, 'glass-fake': worst,
    'no-deposit': worst, 'barren': worst, 'bauble-seller': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Gem Formatting ────────────────────────────────────────────────

/**
 * Format a single gem for display
 * @example
 * formatGemTable(gem) // colored gem info
 */
export function formatGemTable(gem: RubyGem): string {
  const parts = [
    `${label('File:')} ${dim(gem.file)}`,
    `${label('Intensity:')} ${colorScore(gem.passionIntensity)} ${colorGrade(gem.intensifying.grade)}`,
    `${label('Depth:')} ${colorScore(gem.colorDepth)} ${colorGrade(gem.deepening.color)}`,
    `${label('Purity:')} ${colorScore(gem.inclusionPurity)} ${colorGrade(gem.purifying.inclusion)}`,
    `${label('Hardness:')} ${colorScore(gem.hardnessGrade)} ${colorGrade(gem.hardening.hardness)}`,
    `${label('Fire:')} ${colorScore(gem.fireSustainability)} ${colorGrade(gem.sustaining.fire)}`,
    `${label('Score:')} ${colorScore(gem.qualityScore)} ${colorGrade(gem.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format gems as summary table
 * @example
 * formatGemsTable(gems) // multi-line table
 */
export function formatGemsTable(gems: RubyGem[]): string {
  if (gems.length === 0) return dim('No ruby gems found')
  const header = heading('Ruby Heart Analysis')
  const rows = gems.map(g => formatGemTable(g))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Mine Formatting ───────────────────────────────────────────────

/**
 * Format a mine for display
 * @example
 * formatMineTable(mine) // colored mine info
 */
export function formatMineTable(mine: RubyMine): string {
  const parts = [
    `${label('Mine:')} ${dim(mine.directory)}`,
    `${label('Type:')} ${colorGrade(mine.mineType)}`,
    `${label('Condition:')} ${colorGrade(mine.condition)}`,
    `${label('Gems:')} ${String(mine.gems.length)}`,
    `${label('Avg Intensity:')} ${colorScore(mine.avgIntensity)}`,
    `${label('Avg Depth:')} ${colorScore(mine.avgDepth)}`,
    `${label('Avg Hardness:')} ${colorScore(mine.avgHardness)}`,
    `${label('Pigeon Blood:')} ${String(mine.pigeonBloodRubyCount)}`,
    `${label('Glass Fakes:')} ${String(mine.glassFakeCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all mines as summary
 * @example
 * formatMinesTable(mines) // multi-line mine summary
 */
export function formatMinesTable(mines: RubyMine[]): string {
  if (mines.length === 0) return dim('No ruby mines found')
  const header = heading('Ruby Mine Analysis')
  const rows = mines.map(m => formatMineTable(m))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: RubyHeartResult['stats']): string {
  const parts = [
    heading('Ruby Heart Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Mines:')} ${String(stats.totalMines)}`,
    `${label('Avg Passion Intensity:')} ${colorScore(stats.avgPassionIntensity)}`,
    `${label('Avg Color Depth:')} ${colorScore(stats.avgColorDepth)}`,
    `${label('Avg Inclusion Purity:')} ${colorScore(stats.avgInclusionPurity)}`,
    `${label('Avg Hardness Grade:')} ${colorScore(stats.avgHardnessGrade)}`,
    `${label('Avg Fire Sustainability:')} ${colorScore(stats.avgFireSustainability)}`,
    `${label('Pigeon Blood Ruby:')} ${String(stats.pigeonBloodRubyCount)}`,
    `${label('Burma Ruby:')} ${String(stats.burmaRubyCount)}`,
    `${label('Proper Ruby:')} ${String(stats.properRubyCount)}`,
    `${label('Pink Sapphire:')} ${String(stats.pinkSapphireCount)}`,
    `${label('Garnet Imitation:')} ${String(stats.garnetImitationCount)}`,
    `${label('Glass Fake:')} ${String(stats.glassFakeCount)}`,
    `${label('High Intensity:')} ${String(stats.hasHighIntensityCount)}`,
    `${label('High Depth:')} ${String(stats.hasHighDepthCount)}`,
    `${label('High Purity:')} ${String(stats.hasHighPurityCount)}`,
    `${label('High Grade:')} ${String(stats.hasHighGradeCount)}`,
    `${label('High Sustainability:')} ${String(stats.hasHighSustainabilityCount)}`,
    `${label('Overall Fire:')} ${colorScore(stats.overallFire)}`,
    `${label('Jeweler Grade:')} ${colorGrade(stats.jewelerGrade)}`,
    `${label('Best Gem:')} ${stats.bestGem}`,
    `${label('Most Intense:')} ${stats.mostIntense}`,
    `${label('Deepest:')} ${stats.deepest}`,
    `${label('Purest:')} ${stats.purest}`,
    `${label('Hardest:')} ${stats.hardest}`,
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
export function formatResultTable(result: RubyHeartResult): string {
  const sections = [
    formatGemsTable(result.gems),
    '',
    formatMinesTable(result.mines),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Treasury')} ${label('Precious:')} ${result.treasury.isPrecious ? high('Yes') : low('No')} ${label('Overall Fire:')} ${colorScore(result.treasury.overallFire)}`,
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
export function formatResultJson(result: RubyHeartResult): string {
  return JSON.stringify(result, null, 2)
}
