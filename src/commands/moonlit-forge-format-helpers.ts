// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { MoonlitIngot, MoonForge, MoonlitForgeResult } from './moonlit-forge-helpers.js'

// ─── Color Palette (moonlit forge — silver/blue/lunar) ────────────
const high = chalk.rgb(200, 210, 230)
const midHigh = chalk.rgb(185, 195, 215)
const mid = chalk.rgb(170, 180, 200)
const lowMid = chalk.rgb(155, 165, 185)
const low = chalk.rgb(140, 150, 170)

const best = chalk.rgb(220, 230, 250).bold
const good = chalk.rgb(200, 210, 230)
const okay = chalk.rgb(180, 190, 210)
const poor = chalk.rgb(160, 170, 190)
const worst = chalk.rgb(140, 150, 170)

const heading = chalk.rgb(190, 200, 225).bold
const label = chalk.rgb(175, 185, 210)
const dim = chalk.rgb(155, 165, 190)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // silver
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
 * colorGrade('celestial-ingot') // best (bold silver)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'masterwork-silver': best, 'master-tempered': best, 'shadow-master': best,
    'full-moon': best, 'north-star': best, 'celestial-ingot': best,
    'grand-moonforge': best, 'celestial-foundry': best, 'moon-master': best,

    'quality-moonlight': good, 'well-refined': good, 'skilled-shaper': good,
    'waxing-gibbous': good, 'constellation-guide': good, 'silver-masterpiece': good,
    'silver-foundry': good, 'moonlit-workshop': good, 'silver-smith': good,

    'proper-forge': okay, 'proper-temper': okay, 'proper-craft': okay,
    'proper-cycle': okay, 'proper-aim': okay, 'proper-ingot': okay,
    'proper-forge': okay, 'decent-forge': okay, 'skilled-forger': okay,

    'daylight-only': poor, 'rough-forged': poor, 'visible-only': poor,
    'half-moon': poor, 'lost-star': poor, 'rough-metal': poor,
    'small-anvil': poor, 'dim-anvil': poor, 'apprentice': poor,

    'dim-workshop': worst, 'untempered': worst, 'shadow-blind': worst,
    'new-moon': worst, 'cloudy-night': worst, 'tarnished-silver': worst,
    'cold-hearth': worst, 'dark-corner': worst, 'novice': worst,

    'dark-forge': worst, 'raw-metal': worst, 'no-craft': worst,
    'eclipse': worst, 'no-stars': worst, 'scrap': worst,
    'no-forge': worst, 'void': worst, 'blind-smith': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Ingot Formatting ─────────────────────────────────────────────

/**
 * Format a single ingot for display
 * @example
 * formatIngotTable(ingot) // colored ingot info
 */
export function formatIngotTable(ingot: MoonlitIngot): string {
  const parts = [
    `${label('File:')} ${dim(ingot.file)}`,
    `${label('Nocturnal Quality:')} ${colorScore(ingot.nocturnalQuality)} ${colorGrade(ingot.forging.grade)}`,
    `${label('Silver Tempering:')} ${colorScore(ingot.silverTempering)} ${colorGrade(ingot.tempering.temper)}`,
    `${label('Shadow Craft:')} ${colorScore(ingot.shadowCraft)} ${colorGrade(ingot.crafting.craft)}`,
    `${label('Moon Phase Adaptation:')} ${colorScore(ingot.moonPhaseAdaptation)} ${colorGrade(ingot.adapting.phase)}`,
    `${label('Starlight Precision:')} ${colorScore(ingot.starlightPrecision)} ${colorGrade(ingot.precisioning.starlight)}`,
    `${label('Score:')} ${colorScore(ingot.qualityScore)} ${colorGrade(ingot.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format ingots as summary table
 * @example
 * formatIngotsTable(ingots) // multi-line table
 */
export function formatIngotsTable(ingots: MoonlitIngot[]): string {
  if (ingots.length === 0) return dim('No moonlit ingots found')
  const header = heading('Moonlit Forge Analysis')
  const rows = ingots.map(i => formatIngotTable(i))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Forge Formatting ─────────────────────────────────────────────

/**
 * Format a forge for display
 * @example
 * formatForgeTable(forge) // colored forge info
 */
export function formatForgeTable(forge: MoonForge): string {
  const parts = [
    `${label('Forge:')} ${dim(forge.directory)}`,
    `${label('Type:')} ${colorGrade(forge.forgeType)}`,
    `${label('Condition:')} ${colorGrade(forge.condition)}`,
    `${label('Ingots:')} ${String(forge.ingots.length)}`,
    `${label('Avg Nocturnal:')} ${colorScore(forge.avgNocturnal)}`,
    `${label('Avg Tempering:')} ${colorScore(forge.avgTempering)}`,
    `${label('Avg Precision:')} ${colorScore(forge.avgPrecision)}`,
    `${label('Celestial Ingots:')} ${String(forge.celestialIngotCount)}`,
    `${label('Scrap:')} ${String(forge.scrapCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all forges as summary
 * @example
 * formatForgesTable(forges) // multi-line summary
 */
export function formatForgesTable(forges: MoonForge[]): string {
  if (forges.length === 0) return dim('No moon forges found')
  const header = heading('Moon Forges')
  const rows = forges.map(f => formatForgeTable(f))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: MoonlitForgeResult['stats']): string {
  const parts = [
    heading('Moonlit Forge Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Forges:')} ${String(stats.totalForges)}`,
    `${label('Avg Nocturnal Quality:')} ${colorScore(stats.avgNocturnalQuality)}`,
    `${label('Avg Silver Tempering:')} ${colorScore(stats.avgSilverTempering)}`,
    `${label('Avg Shadow Craft:')} ${colorScore(stats.avgShadowCraft)}`,
    `${label('Avg Moon Phase Adaptation:')} ${colorScore(stats.avgMoonPhaseAdaptation)}`,
    `${label('Avg Starlight Precision:')} ${colorScore(stats.avgStarlightPrecision)}`,
    `${label('Celestial Ingot:')} ${String(stats.celestialIngotCount)}`,
    `${label('Silver Masterpiece:')} ${String(stats.silverMasterpieceCount)}`,
    `${label('Proper Ingot:')} ${String(stats.properIngotCount)}`,
    `${label('Rough Metal:')} ${String(stats.roughMetalCount)}`,
    `${label('Tarnished Silver:')} ${String(stats.tarnishedSilverCount)}`,
    `${label('Scrap:')} ${String(stats.scrapCount)}`,
    `${label('High Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('High Silver:')} ${String(stats.hasHighSilverCount)}`,
    `${label('High Shadow:')} ${String(stats.hasHighShadowCount)}`,
    `${label('High Adaptation:')} ${String(stats.hasHighAdaptationCount)}`,
    `${label('High Precision:')} ${String(stats.hasHighPrecisionCount)}`,
    `${label('Overall Moonlight:')} ${colorScore(stats.overallMoonlight)}`,
    `${label('Smith Grade:')} ${colorGrade(stats.smithGrade)}`,
    `${label('Best Ingot:')} ${stats.bestIngot}`,
    `${label('Best Nocturnal:')} ${stats.bestNocturnal}`,
    `${label('Best Tempered:')} ${stats.bestTempered}`,
    `${label('Best Shadow:')} ${stats.bestShadow}`,
    `${label('Most Precise:')} ${stats.mostPrecise}`,
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
export function formatResultTable(result: MoonlitForgeResult): string {
  const sections = [
    formatIngotsTable(result.ingots),
    '',
    formatForgesTable(result.forges),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Night')} ${label('Celestial:')} ${result.night.isCelestial ? high('Yes') : low('No')} ${label('Overall Moonlight:')} ${colorScore(result.night.overallMoonlight)}`,
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
export function formatResultJson(result: MoonlitForgeResult): string {
  return JSON.stringify(result, null, 2)
}
