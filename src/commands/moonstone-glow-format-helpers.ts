// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { MoonstoneRay, MoonlightGarden, MoonstoneGlowResult } from './moonstone-glow-helpers.js'

// ─── Color Palette (moonstone glow) ──────────────────────────────
const high = chalk.rgb(180, 200, 230)
const midHigh = chalk.rgb(150, 175, 210)
const mid = chalk.rgb(130, 155, 195)
const lowMid = chalk.rgb(110, 130, 170)
const low = chalk.rgb(90, 110, 150)

const best = chalk.rgb(210, 225, 255).bold
const good = chalk.rgb(185, 205, 240)
const okay = chalk.rgb(160, 180, 220)
const poor = chalk.rgb(135, 155, 200)
const worst = chalk.rgb(110, 130, 180)

const heading = chalk.rgb(220, 235, 255).bold
const label = chalk.rgb(190, 210, 240)
const dim = chalk.rgb(140, 160, 200)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // bright moonstone
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
 * colorGrade('rainbow-moonstone') // best (bold moonstone)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'blue-sheen': best, 'radiant-core': best, 'cat-eye-sheen': best,
    'crystal-translucent': best, 'full-moon': best, 'rainbow-moonstone': best,
    'moonlit-garden': best, 'ethereal-glow': best, 'luna-master': best,

    'bright-glow': good, 'bright-essence': good, 'polished-surface': good,
    'proper-clarity': good, 'waxing-gibbous': good, 'blue-sheen-moonstone': good,
    'proper-collection': good, 'moonlight-display': good, 'moon-reader': good,

    'proper-adularescence': okay, 'proper-glow': okay, 'proper-finish': okay,
    'decent-depth': okay, 'first-quarter': okay, 'proper-moonstone': okay,
    'gem-display': okay, 'decent-collection': okay, 'stargazer': okay,

    'weak-sheen': poor, 'dim-center': poor, 'rough-surface': poor,
    'cloudy': poor, 'waxing-crescent': poor, 'orthoclase': poor,
    'stone-pile': poor, 'dim-corner': poor, 'night-watcher': poor,

    'dull-surface': worst, 'dark-core': worst, 'unpolished': worst,
    'opaque': worst, 'new-moon': worst, 'feldspar': worst,
    'gravel-bed': worst, 'dark-room': worst, 'twilight-observer': worst,

    'no-glow': worst, 'no-light': worst, 'raw-stone': worst,
    'dark': worst, 'eclipse': worst, 'pebble': worst,
    'no-garden': worst, 'empty': worst, 'blind': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Ray Formatting ───────────────────────────────────────────────

/**
 * Format a single ray for display
 * @example
 * formatRayTable(ray) // colored ray info
 */
export function formatRayTable(ray: MoonstoneRay): string {
  const parts = [
    `${label('File:')} ${dim(ray.file)}`,
    `${label('Adularescence:')} ${colorScore(ray.adularescence)} ${colorGrade(ray.glowing.grade)}`,
    `${label('Inner Light:')} ${colorScore(ray.innerLight)} ${colorGrade(ray.illuminating.quality)}`,
    `${label('Surface Sheen:')} ${colorScore(ray.surfaceSheen)} ${colorGrade(ray.polishing.polish)}`,
    `${label('Translucency Depth:')} ${colorScore(ray.translucencyDepth)} ${colorGrade(ray.clarifying.translucency)}`,
    `${label('Lunar Phase:')} ${colorScore(ray.lunarPhase)} ${colorGrade(ray.phasing.lunar)}`,
    `${label('Score:')} ${colorScore(ray.qualityScore)} ${colorGrade(ray.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format rays as summary table
 * @example
 * formatRaysTable(rays) // multi-line table
 */
export function formatRaysTable(rays: MoonstoneRay[]): string {
  if (rays.length === 0) return dim('No moonstone rays found')
  const header = heading('Moonstone Glow Analysis')
  const rows = rays.map(r => formatRayTable(r))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Garden Formatting ────────────────────────────────────────────

/**
 * Format a garden for display
 * @example
 * formatGardenTable(garden) // colored garden info
 */
export function formatGardenTable(garden: MoonlightGarden): string {
  const parts = [
    `${label('Garden:')} ${dim(garden.directory)}`,
    `${label('Type:')} ${colorGrade(garden.gardenType)}`,
    `${label('Condition:')} ${colorGrade(garden.condition)}`,
    `${label('Rays:')} ${String(garden.rays.length)}`,
    `${label('Avg Adularescence:')} ${colorScore(garden.avgAdularescence)}`,
    `${label('Avg Light:')} ${colorScore(garden.avgLight)}`,
    `${label('Avg Depth:')} ${colorScore(garden.avgDepth)}`,
    `${label('Rainbow Moonstones:')} ${String(garden.rainbowMoonstoneCount)}`,
    `${label('Pebbles:')} ${String(garden.pebbleCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all gardens as summary
 * @example
 * formatGardensTable(gardens) // multi-line garden summary
 */
export function formatGardensTable(gardens: MoonlightGarden[]): string {
  if (gardens.length === 0) return dim('No moonlight gardens found')
  const header = heading('Moonlight Gardens')
  const rows = gardens.map(g => formatGardenTable(g))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: MoonstoneGlowResult['stats']): string {
  const parts = [
    heading('Moonstone Glow Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Gardens:')} ${String(stats.totalGardens)}`,
    `${label('Avg Adularescence:')} ${colorScore(stats.avgAdularescence)}`,
    `${label('Avg Inner Light:')} ${colorScore(stats.avgInnerLight)}`,
    `${label('Avg Surface Sheen:')} ${colorScore(stats.avgSurfaceSheen)}`,
    `${label('Avg Translucency Depth:')} ${colorScore(stats.avgTranslucencyDepth)}`,
    `${label('Avg Lunar Phase:')} ${colorScore(stats.avgLunarPhase)}`,
    `${label('Rainbow Moonstones:')} ${String(stats.rainbowMoonstoneCount)}`,
    `${label('Blue Sheen Moonstones:')} ${String(stats.blueSheenMoonstoneCount)}`,
    `${label('Proper Moonstones:')} ${String(stats.properMoonstoneCount)}`,
    `${label('Orthoclase:')} ${String(stats.orthoclaseCount)}`,
    `${label('Feldspar:')} ${String(stats.feldsparCount)}`,
    `${label('Pebbles:')} ${String(stats.pebbleCount)}`,
    `${label('High Adularescence:')} ${String(stats.hasHighAdularescenceCount)}`,
    `${label('High Light:')} ${String(stats.hasHighLightCount)}`,
    `${label('High Sheen:')} ${String(stats.hasHighSheenCount)}`,
    `${label('High Depth:')} ${String(stats.hasHighDepthCount)}`,
    `${label('High Phase:')} ${String(stats.hasHighPhaseCount)}`,
    `${label('Overall Luminance:')} ${colorScore(stats.overallLuminance)}`,
    `${label('Moon Gazer Grade:')} ${colorGrade(stats.moonGazerGrade)}`,
    `${label('Best Ray:')} ${stats.bestRay}`,
    `${label('Most Luminous:')} ${stats.mostLuminous}`,
    `${label('Brightest:')} ${stats.brightest}`,
    `${label('Most Polished:')} ${stats.mostPolished}`,
    `${label('Most Translucent:')} ${stats.mostTranslucent}`,
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
export function formatResultTable(result: MoonstoneGlowResult): string {
  const sections = [
    formatRaysTable(result.rays),
    '',
    formatGardensTable(result.gardens),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Night')} ${label('Luminous:')} ${result.night.isLuminous ? high('Yes') : low('No')} ${label('Overall Luminance:')} ${colorScore(result.night.overallLuminance)}`,
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
export function formatResultJson(result: MoonstoneGlowResult): string {
  return JSON.stringify(result, null, 2)
}
