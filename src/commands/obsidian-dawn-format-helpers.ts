// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { ObsidianShard, ObsidianCave, ObsidianDawnResult } from './obsidian-dawn-helpers.js'

// ─── Color Palette (obsidian dawn — volcanic glass/amber/firelight) ─
const high = chalk.rgb(255, 140, 50)
const midHigh = chalk.rgb(220, 120, 45)
const mid = chalk.rgb(180, 95, 40)
const lowMid = chalk.rgb(140, 75, 35)
const low = chalk.rgb(100, 55, 30)

const best = chalk.rgb(255, 200, 100).bold
const good = chalk.rgb(240, 170, 80)
const okay = chalk.rgb(210, 140, 60)
const poor = chalk.rgb(170, 110, 45)
const worst = chalk.rgb(130, 85, 35)

const heading = chalk.rgb(255, 180, 80).bold
const label = chalk.rgb(230, 150, 60)
const dim = chalk.rgb(180, 120, 50)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // volcanic amber
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
 * colorGrade('volcanic-masterpiece') // best (bold amber)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'crystal-flow': best, 'surgical-blade': best, 'scrying-mirror': best,
    'ancient-wisdom': best, 'sunrise-revelation': best, 'volcanic-masterpiece': best,
    'volcanic-chamber': best, 'magnificent-grotto': best, 'master-flintknapper': best,

    'clear-glass': good, 'razor-edge': good, 'true-reflection': good,
    'deep-knowledge': good, 'morning-clarity': good, 'razor-obsidian': good,
    'obsidian-gallery': good, 'beautiful-cavern': good, 'expert-knapper': good,

    'proper-obsidian': okay, 'proper-knife': okay, 'proper-glass': okay,
    'proper-understanding': okay, 'proper-daybreak': okay,
    'proper-cavern': okay, 'proper-cave': okay, 'skilled-shaper': okay,

    'cloudy-stone': poor, 'dull-blade': poor, 'foggy-mirror': poor,
    'partial-insight': poor, 'twilight-zone': poor, 'rough-stone': poor,
    'small-cave': poor, 'rough-tunnel': poor, 'apprentice': poor,

    'pumice': worst, 'blunt-rock': worst, 'cracked-glass': worst,
    'surface-level': worst, 'pre-dawn': worst, 'gravel': worst,
    'surface-crack': worst, 'collapsed-mine': worst, 'novice': worst,

    'no-clarity': worst, 'no-edge': worst, 'no-reflection': worst,
    'no-wisdom': worst, 'no-emergence': worst, 'dust': worst,
    'no-cave': worst, 'void': worst, 'rock-collector': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Shard Formatting ──────────────────────────────────────────────

/**
 * Format a single obsidian shard for display
 * @example
 * formatShardTable(shard) // colored shard info
 */
export function formatShardTable(shard: ObsidianShard): string {
  const parts = [
    `${label('File:')} ${dim(shard.file)}`,
    `${label('Volcanic Clarity:')} ${colorScore(shard.volcanicClarity)} ${colorGrade(shard.forming.volcano)}`,
    `${label('Edge Sharpness:')} ${colorScore(shard.edgeSharpness)} ${colorGrade(shard.honing.edge)}`,
    `${label('Mirror Depth:')} ${colorScore(shard.mirrorDepth)} ${colorGrade(shard.reflecting.mirror)}`,
    `${label('Dark Wisdom:')} ${colorScore(shard.darkWisdom)} ${colorGrade(shard.knowing.darkness)}`,
    `${label('Dawn Emergence:')} ${colorScore(shard.dawnEmergence)} ${colorGrade(shard.emerging.dawn)}`,
    `${label('Score:')} ${colorScore(shard.qualityScore)} ${colorGrade(shard.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format shards as summary table
 * @example
 * formatShardsTable(shards) // multi-line table
 */
export function formatShardsTable(shards: ObsidianShard[]): string {
  if (shards.length === 0) return dim('No obsidian shards found')
  const header = heading('Obsidian Shard Analysis')
  const rows = shards.map(sh => formatShardTable(sh))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Cave Formatting ───────────────────────────────────────────────

/**
 * Format a single obsidian cave for display
 * @example
 * formatCaveTable(cave) // colored cave info
 */
export function formatCaveTable(cave: ObsidianCave): string {
  const parts = [
    `${label('Cave:')} ${dim(cave.directory)}`,
    `${label('Type:')} ${colorGrade(cave.caveType)}`,
    `${label('Condition:')} ${colorGrade(cave.condition)}`,
    `${label('Shards:')} ${String(cave.shards.length)}`,
    `${label('Avg Clarity:')} ${colorScore(cave.avgClarity)}`,
    `${label('Avg Sharpness:')} ${colorScore(cave.avgSharpness)}`,
    `${label('Avg Wisdom:')} ${colorScore(cave.avgWisdom)}`,
    `${label('Volcanic Masterpieces:')} ${String(cave.volcanicMasterpieceCount)}`,
    `${label('Dust:')} ${String(cave.dustCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all obsidian caves as summary
 * @example
 * formatCavesTable(caves) // multi-line summary
 */
export function formatCavesTable(caves: ObsidianCave[]): string {
  if (caves.length === 0) return dim('No obsidian caves found')
  const header = heading('Obsidian Caves')
  const rows = caves.map(c => formatCaveTable(c))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ──────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: ObsidianDawnResult['stats']): string {
  const parts = [
    heading('Obsidian Dawn Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Caves:')} ${String(stats.totalCaves)}`,
    `${label('Avg Volcanic Clarity:')} ${colorScore(stats.avgVolcanicClarity)}`,
    `${label('Avg Edge Sharpness:')} ${colorScore(stats.avgEdgeSharpness)}`,
    `${label('Avg Mirror Depth:')} ${colorScore(stats.avgMirrorDepth)}`,
    `${label('Avg Dark Wisdom:')} ${colorScore(stats.avgDarkWisdom)}`,
    `${label('Avg Dawn Emergence:')} ${colorScore(stats.avgDawnEmergence)}`,
    `${label('Volcanic Masterpiece:')} ${String(stats.volcanicMasterpieceCount)}`,
    `${label('Razor Obsidian:')} ${String(stats.razorObsidianCount)}`,
    `${label('Proper Glass:')} ${String(stats.properGlassCount)}`,
    `${label('Rough Stone:')} ${String(stats.roughStoneCount)}`,
    `${label('Gravel:')} ${String(stats.gravelCount)}`,
    `${label('Dust:')} ${String(stats.dustCount)}`,
    `${label('High Clarity:')} ${String(stats.hasHighClarityCount)}`,
    `${label('High Sharpness:')} ${String(stats.hasHighSharpnessCount)}`,
    `${label('High Depth:')} ${String(stats.hasHighDepthCount)}`,
    `${label('High Wisdom:')} ${String(stats.hasHighWisdomCount)}`,
    `${label('High Emergence:')} ${String(stats.hasHighEmergenceCount)}`,
    `${label('Overall Luminosity:')} ${colorScore(stats.overallLuminosity)}`,
    `${label('Lapidary Grade:')} ${colorGrade(stats.lapidaryGrade)}`,
    `${label('Best Shard:')} ${stats.bestShard}`,
    `${label('Clearest:')} ${stats.clearest}`,
    `${label('Sharpest:')} ${stats.sharpest}`,
    `${label('Deepest:')} ${stats.deepest}`,
    `${label('Wisest:')} ${stats.wisest}`,
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
  const items = recommendations.map(r => `${dim('\u25C6')} ${r}`)
  return `${header}\n${items.join('\n')}`
}

// ─── Full Result Formatting ────────────────────────────────────────

/**
 * Format complete result as table
 * @example
 * formatResultTable(result) // full colored output
 */
export function formatResultTable(result: ObsidianDawnResult): string {
  const sections = [
    formatShardsTable(result.shards),
    '',
    formatCavesTable(result.caves),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Volcano')} ${label('Volcanic:')} ${result.volcano.isVolcanic ? high('Yes') : low('No')} ${label('Overall Luminosity:')} ${colorScore(result.volcano.overallLuminosity)}`,
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
export function formatResultJson(result: ObsidianDawnResult): string {
  return JSON.stringify(result, null, 2)
}
