// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { ObsidianWave, TidePool, ObsidianTideResult } from './obsidian-tide-helpers.js'

// ─── Color Palette (obsidian tide — dark/glass/deep-blue) ──────────
const high = chalk.rgb(60, 80, 180)
const midHigh = chalk.rgb(50, 70, 160)
const mid = chalk.rgb(40, 60, 140)
const lowMid = chalk.rgb(30, 50, 120)
const low = chalk.rgb(20, 40, 100)

const best = chalk.rgb(100, 130, 255).bold
const good = chalk.rgb(80, 110, 235)
const okay = chalk.rgb(60, 90, 210)
const poor = chalk.rgb(45, 70, 175)
const worst = chalk.rgb(30, 50, 140)

const heading = chalk.rgb(80, 120, 245).bold
const label = chalk.rgb(60, 100, 225)
const dim = chalk.rgb(45, 80, 200)

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
 * colorGrade('abyssal-diver') // best (bold blue)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'abyssal-power': best, 'ocean-rhythm': best, 'obsidian-mirror': best,
    'forged-in-fire': best, 'ancient-depth': best, 'obsidian-masterpiece': best,
    'volcanic-lagoon': best, 'volcanic-paradise': best, 'abyssal-diver': best,

    'deep-current': good, 'steady-tide': good, 'glass-clarity': good,
    'properly-cooled': good, 'deep-understanding': good, 'dark-gem': good,
    'dark-tide-pool': good, 'dark-beauty': good, 'deep-sea-explorer': good,

    'proper-depth': okay, 'proper-pulse': okay, 'proper-reflection': okay,
    'decent-formation': okay, 'proper-knowledge': okay, 'proper-glass': okay,
    'proper-pool': okay, 'decent-pool': okay, 'skilled-swimmer': okay,

    'shallow-water': poor, 'irregular-swell': poor, 'foggy-depth': poor,
    'premature-cooling': poor, 'surface-awareness': poor, 'cloudy-obsidian': poor,
    'shallow-puddle': poor, 'murky-puddle': poor, 'apprentice': poor,

    'surface-ripple': worst, 'chaotic-wave': worst, 'murky-water': worst,
    'unformed-lava': worst, 'shallow-ignorance': worst, 'cracked-glass': worst,
    'dry-basin': worst, 'dry-crack': worst, 'novice': worst,

    'no-depth': worst, 'still-water': worst, 'opaque': worst,
    'no-origin': worst, 'no-knowledge': worst, 'gravel': worst,
    'no-pool': worst, 'void': worst, 'landlubber': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Wave Formatting ──────────────────────────────────────────────

/**
 * Format a single wave for display
 * @example
 * formatWaveTable(wave) // colored wave info
 */
export function formatWaveTable(wave: ObsidianWave): string {
  const parts = [
    `${label('File:')} ${dim(wave.file)}`,
    `${label('Depth Power:')} ${colorScore(wave.depthPower)} ${colorGrade(wave.deepening.grade)}`,
    `${label('Tidal Rhythm:')} ${colorScore(wave.tidalRhythm)} ${colorGrade(wave.pulsing.tide)}`,
    `${label('Dark Clarity:')} ${colorScore(wave.darkClarity)} ${colorGrade(wave.illuminating.dark)}`,
    `${label('Volcanic Origin:')} ${colorScore(wave.volcanicOrigin)} ${colorGrade(wave.forging.volcanic)}`,
    `${label('Abyss Knowledge:')} ${colorScore(wave.abyssKnowledge)} ${colorGrade(wave.knowing.abyss)}`,
    `${label('Score:')} ${colorScore(wave.qualityScore)} ${colorGrade(wave.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format waves as summary table
 * @example
 * formatWavesTable(waves) // multi-line table
 */
export function formatWavesTable(waves: ObsidianWave[]): string {
  if (waves.length === 0) return dim('No obsidian waves found')
  const header = heading('Obsidian Tide Analysis')
  const rows = waves.map(w => formatWaveTable(w))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Pool Formatting ──────────────────────────────────────────────

/**
 * Format a pool for display
 * @example
 * formatPoolTable(pool) // colored pool info
 */
export function formatPoolTable(pool: TidePool): string {
  const parts = [
    `${label('Pool:')} ${dim(pool.directory)}`,
    `${label('Type:')} ${colorGrade(pool.poolType)}`,
    `${label('Condition:')} ${colorGrade(pool.condition)}`,
    `${label('Waves:')} ${String(pool.waves.length)}`,
    `${label('Avg Power:')} ${colorScore(pool.avgPower)}`,
    `${label('Avg Rhythm:')} ${colorScore(pool.avgRhythm)}`,
    `${label('Avg Knowledge:')} ${colorScore(pool.avgKnowledge)}`,
    `${label('Obsidian Masterpieces:')} ${String(pool.obsidianMasterpieceCount)}`,
    `${label('Gravel Count:')} ${String(pool.gravelCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all pools as summary
 * @example
 * formatPoolsTable(pools) // multi-line summary
 */
export function formatPoolsTable(pools: TidePool[]): string {
  if (pools.length === 0) return dim('No tide pools found')
  const header = heading('Tide Pools')
  const rows = pools.map(p => formatPoolTable(p))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ──────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: ObsidianTideResult['stats']): string {
  const parts = [
    heading('Obsidian Tide Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Pools:')} ${String(stats.totalPools)}`,
    `${label('Avg Depth Power:')} ${colorScore(stats.avgDepthPower)}`,
    `${label('Avg Tidal Rhythm:')} ${colorScore(stats.avgTidalRhythm)}`,
    `${label('Avg Dark Clarity:')} ${colorScore(stats.avgDarkClarity)}`,
    `${label('Avg Volcanic Origin:')} ${colorScore(stats.avgVolcanicOrigin)}`,
    `${label('Avg Abyss Knowledge:')} ${colorScore(stats.avgAbyssKnowledge)}`,
    `${label('Obsidian Masterpiece:')} ${String(stats.obsidianMasterpieceCount)}`,
    `${label('Dark Gem:')} ${String(stats.darkGemCount)}`,
    `${label('Proper Glass:')} ${String(stats.properGlassCount)}`,
    `${label('Cloudy Obsidian:')} ${String(stats.cloudyObsidianCount)}`,
    `${label('Cracked Glass:')} ${String(stats.crackedGlassCount)}`,
    `${label('Gravel:')} ${String(stats.gravelCount)}`,
    `${label('High Power:')} ${String(stats.hasHighPowerCount)}`,
    `${label('High Rhythm:')} ${String(stats.hasHighRhythmCount)}`,
    `${label('High Clarity:')} ${String(stats.hasHighClarityCount)}`,
    `${label('High Origin:')} ${String(stats.hasHighOriginCount)}`,
    `${label('High Knowledge:')} ${String(stats.hasHighKnowledgeCount)}`,
    `${label('Overall Depth:')} ${colorScore(stats.overallDepth)}`,
    `${label('Diver Grade:')} ${colorGrade(stats.diverGrade)}`,
    `${label('Best Wave:')} ${stats.bestWave}`,
    `${label('Most Powerful:')} ${stats.mostPowerful}`,
    `${label('Best Rhythm:')} ${stats.bestRhythm}`,
    `${label('Clearest:')} ${stats.clearest}`,
    `${label('Most Knowledgeable:')} ${stats.mostKnowledgeable}`,
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
export function formatResultTable(result: ObsidianTideResult): string {
  const sections = [
    formatWavesTable(result.waves),
    '',
    formatPoolsTable(result.pools),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Ocean')} ${label('Abyssal:')} ${result.ocean.isAbyssal ? high('Yes') : low('No')} ${label('Overall Depth:')} ${colorScore(result.ocean.overallDepth)}`,
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
export function formatResultJson(result: ObsidianTideResult): string {
  return JSON.stringify(result, null, 2)
}
