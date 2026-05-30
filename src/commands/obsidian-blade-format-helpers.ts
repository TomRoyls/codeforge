// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { ObsidianEdge, ObsidianQuarry, ObsidianBladeResult } from './obsidian-blade-helpers.js'

// ─── Color Palette (obsidian dark/volcanic) ────────────────────────
const high = chalk.rgb(180, 140, 255)
const midHigh = chalk.rgb(160, 120, 235)
const mid = chalk.rgb(140, 100, 215)
const lowMid = chalk.rgb(120, 80, 195)
const low = chalk.rgb(100, 60, 175)

const best = chalk.rgb(200, 160, 255).bold
const good = chalk.rgb(180, 140, 245)
const okay = chalk.rgb(160, 120, 225)
const poor = chalk.rgb(140, 100, 205)
const worst = chalk.rgb(120, 80, 185)

const heading = chalk.rgb(190, 150, 250).bold
const label = chalk.rgb(170, 130, 230)
const dim = chalk.rgb(150, 165, 175)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // obsidian purple
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
 * colorGrade('master-blade') // best (bold purple)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (text: string) => string> = {
    'monomolecular': best, 'conchoidal': best, 'prime-magma': best, 'mirror-finish': best, 'surgical-incision': best,
    'master-blade': best, 'volcanic-vent': best, 'prime-source': best, 'master-knapper': best,

    'scalpel-sharp': good, 'clean-break': good, 'quality-lava': good, 'high-gloss': good, 'precise-cut': good,
    'surgical-scalpel': good, 'obsidian-cliff': good, 'quality-mine': good, 'expert-flintknapper': good,

    'razor-edge': okay, 'proper-cleave': okay, 'proper-flow': okay, 'proper-polish': okay, 'proper-slice': okay,
    'proper-knife': okay, 'rocky-outcrop': okay, 'decent-quarry': okay, 'skilled-artisan': okay,

    'dull-blade': poor, 'uneven-break': poor, 'mixed-ash': poor, 'matte-finish': poor, 'rough-cut': poor,
    'dull-tool': poor, 'gravel-bed': poor, 'poor-source': poor, 'apprentice': poor,

    'blunt-edge': worst, 'splintered': worst, 'degraded-rock': worst, 'rough-surface': worst, 'hack': worst,
    'broken-shard': worst, 'sand-pit': worst, 'exhausted': worst, 'novice': worst,

    'no-edge': worst, 'shattered': worst, 'sediment': worst, 'unpolished': worst, 'no-cut': worst,
    'gravel': worst, 'no-quarry': worst, 'barren': worst, 'rock-thrower': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Edge Formatting ───────────────────────────────────────────────

/**
 * Format a single edge for display
 * @example
 * formatEdgeTable(edge) // colored edge info
 */
export function formatEdgeTable(edge: ObsidianEdge): string {
  const parts = [
    `${label('File:')} ${dim(edge.file)}`,
    `${label('Edge Sharpness:')} ${colorScore(edge.edgeSharpness)} ${colorGrade(edge.sharpening.grade)}`,
    `${label('Fracture Quality:')} ${colorScore(edge.fractureQuality)} ${colorGrade(edge.fracturing.fracture)}`,
    `${label('Volcanic Origin:')} ${colorScore(edge.volcanicOrigin)} ${colorGrade(edge.originating.origin)}`,
    `${label('Polish Level:')} ${colorScore(edge.polishLevel)} ${colorGrade(edge.polishing.polish)}`,
    `${label('Cutting Precision:')} ${colorScore(edge.cuttingPrecision)} ${colorGrade(edge.cutting.cut)}`,
    `${label('Score:')} ${colorScore(edge.qualityScore)} ${colorGrade(edge.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format edges as summary table
 * @example
 * formatEdgesTable(edges) // multi-line table
 */
export function formatEdgesTable(edges: ObsidianEdge[]): string {
  if (edges.length === 0) return dim('No obsidian edges found')
  const header = heading('Obsidian Edge Analysis')
  const rows = edges.map(e => formatEdgeTable(e))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Quarry Formatting ────────────────────────────────────────────

/**
 * Format a quarry for display
 * @example
 * formatQuarryTable(quarry) // colored quarry info
 */
export function formatQuarryTable(quarry: ObsidianQuarry): string {
  const parts = [
    `${label('Quarry:')} ${dim(quarry.directory)}`,
    `${label('Type:')} ${colorGrade(quarry.quarryType)}`,
    `${label('Condition:')} ${colorGrade(quarry.condition)}`,
    `${label('Edges:')} ${String(quarry.edges.length)}`,
    `${label('Avg Sharpness:')} ${colorScore(quarry.avgSharpness)}`,
    `${label('Avg Fracture:')} ${colorScore(quarry.avgFracture)}`,
    `${label('Avg Precision:')} ${colorScore(quarry.avgPrecision)}`,
    `${label('Master Blades:')} ${String(quarry.masterBladeCount)}`,
    `${label('Gravel:')} ${String(quarry.gravelCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all quarries as summary
 * @example
 * formatQuarriesTable(quarries) // multi-line quarry summary
 */
export function formatQuarriesTable(quarries: ObsidianQuarry[]): string {
  if (quarries.length === 0) return dim('No obsidian quarries found')
  const header = heading('Obsidian Quarry Analysis')
  const rows = quarries.map(q => formatQuarryTable(q))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ──────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: ObsidianBladeResult['stats']): string {
  const parts = [
    heading('Obsidian Blade Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Quarries:')} ${String(stats.totalQuarries)}`,
    `${label('Avg Edge Sharpness:')} ${colorScore(stats.avgEdgeSharpness)}`,
    `${label('Avg Fracture Quality:')} ${colorScore(stats.avgFractureQuality)}`,
    `${label('Avg Volcanic Origin:')} ${colorScore(stats.avgVolcanicOrigin)}`,
    `${label('Avg Polish Level:')} ${colorScore(stats.avgPolishLevel)}`,
    `${label('Avg Cutting Precision:')} ${colorScore(stats.avgCuttingPrecision)}`,
    `${label('Master Blade:')} ${String(stats.masterBladeCount)}`,
    `${label('Surgical Scalpel:')} ${String(stats.surgicalScalpelCount)}`,
    `${label('Proper Knife:')} ${String(stats.properKnifeCount)}`,
    `${label('Dull Tool:')} ${String(stats.dullToolCount)}`,
    `${label('Broken Shard:')} ${String(stats.brokenShardCount)}`,
    `${label('Gravel:')} ${String(stats.gravelCount)}`,
    `${label('High Sharpness:')} ${String(stats.hasHighSharpnessCount)}`,
    `${label('High Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('High Origin:')} ${String(stats.hasHighOriginCount)}`,
    `${label('High Level:')} ${String(stats.hasHighLevelCount)}`,
    `${label('High Precision:')} ${String(stats.hasHighPrecisionCount)}`,
    `${label('Overall Sharpness:')} ${colorScore(stats.overallSharpness)}`,
    `${label('Knapper Grade:')} ${colorGrade(stats.knapperGrade)}`,
    `${label('Best Edge:')} ${stats.bestEdge}`,
    `${label('Sharpest:')} ${stats.sharpest}`,
    `${label('Cleanest Fracture:')} ${stats.cleanestFracture}`,
    `${label('Best Origin:')} ${stats.bestOrigin}`,
    `${label('Best Polished:')} ${stats.bestPolished}`,
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
export function formatResultTable(result: ObsidianBladeResult): string {
  const sections = [
    formatEdgesTable(result.edges),
    '',
    formatQuarriesTable(result.quarries),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Volcano')} ${label('Sharp:')} ${result.volcano.isSharp ? high('Yes') : low('No')} ${label('Overall Sharpness:')} ${colorScore(result.volcano.overallSharpness)}`,
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
export function formatResultJson(result: ObsidianBladeResult): string {
  return JSON.stringify(result, null, 2)
}
