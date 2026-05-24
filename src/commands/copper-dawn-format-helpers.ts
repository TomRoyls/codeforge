// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { CopperRay, CopperForge, CopperDawnResult } from './copper-dawn-helpers.js'

// ─── Color Palette (copper dawn — rose-gold/warm-amber/copper) ─────
const high = chalk.rgb(220, 120, 60)
const midHigh = chalk.rgb(195, 110, 55)
const mid = chalk.rgb(170, 100, 50)
const lowMid = chalk.rgb(140, 90, 50)
const low = chalk.rgb(110, 80, 45)

const best = chalk.rgb(255, 140, 60).bold
const good = chalk.rgb(235, 130, 65)
const okay = chalk.rgb(205, 120, 60)
const poor = chalk.rgb(175, 105, 55)
const worst = chalk.rgb(145, 90, 50)

const heading = chalk.rgb(240, 140, 70).bold
const label = chalk.rgb(220, 130, 65)
const dim = chalk.rgb(185, 115, 60)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // warm copper
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
 * colorGrade('masterwork-copper') // best (bold copper)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'noble-verdigris': best, 'rose-gold-dawn': best, 'superconductor': best,
    'warm-hearth': best, 'masterwork-forge': best, 'masterwork-copper': best,
    'grand-foundry': best, 'golden-age': best, 'master-smith': best,

    'aged-copper': good, 'warm-morning': good, 'excellent-conductor': good,
    'gentle-warmth': good, 'well-forged': good, 'aged-bronze': good,
    'proper-forge': good, 'prosperous-era': good, 'expert-forger': good,

    'proper-patina': okay, 'proper-daybreak': okay, 'proper-wire': okay,
    'proper-temperature': okay, 'proper-temper': okay, 'proper-copper': okay,
    'workshop': okay, 'proper-workshop': okay, 'skilled-metallurgist': okay,

    'tarnished-metal': poor, 'grey-dawn': poor, 'resistive-path': poor,
    'cold-metal': poor, 'weak-alloy': poor, 'rusty-wire': poor,
    'small-anvil': poor, 'rusty-shed': poor, 'apprentice': poor,

    'corroded-wire': worst, 'dark-morning': worst, 'insulated-wire': worst,
    'freezing-wire': worst, 'brittle-metal': worst, 'scrap': worst,
    'campfire': worst, 'abandoned-mine': worst, 'novice': worst,

    'no-patina': worst, 'no-dawn': worst, 'no-flow': worst,
    'no-warmth': worst, 'no-strength': worst, 'no-forge': worst,
    'void': worst, 'scrap-collector': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Ray Formatting ────────────────────────────────────────────────

/**
 * Format a single copper ray for display
 * @example
 * formatRayTable(ray) // colored ray info
 */
export function formatRayTable(ray: CopperRay): string {
  const parts = [
    `${label('File:')} ${dim(ray.file)}`,
    `${label('Patina Wisdom:')} ${colorScore(ray.patinaWisdom)} ${colorGrade(ray.aging.patina)}`,
    `${label('Dawn Clarity:')} ${colorScore(ray.dawnClarity)} ${colorGrade(ray.illuminating.dawn)}`,
    `${label('Conductivity:')} ${colorScore(ray.conductivityQuality)} ${colorGrade(ray.conducting.flow)}`,
    `${label('Warmth Resilience:')} ${colorScore(ray.warmthResilience)} ${colorGrade(ray.comforting.warmth)}`,
    `${label('Forge Strength:')} ${colorScore(ray.forgeStrength)} ${colorGrade(ray.strengthening.forge)}`,
    `${label('Score:')} ${colorScore(ray.qualityScore)} ${colorGrade(ray.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format rays as summary table
 * @example
 * formatRaysTable(rays) // multi-line table
 */
export function formatRaysTable(rays: CopperRay[]): string {
  if (rays.length === 0) return dim('No copper rays found')
  const header = heading('Copper Ray Analysis')
  const rows = rays.map(r => formatRayTable(r))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Forge Formatting ──────────────────────────────────────────────

/**
 * Format a single copper forge for display
 * @example
 * formatForgeTable(forge) // colored forge info
 */
export function formatForgeTable(forge: CopperForge): string {
  const parts = [
    `${label('Forge:')} ${dim(forge.directory)}`,
    `${label('Type:')} ${colorGrade(forge.forgeType)}`,
    `${label('Condition:')} ${colorGrade(forge.condition)}`,
    `${label('Rays:')} ${String(forge.rays.length)}`,
    `${label('Avg Wisdom:')} ${colorScore(forge.avgWisdom)}`,
    `${label('Avg Clarity:')} ${colorScore(forge.avgClarity)}`,
    `${label('Avg Strength:')} ${colorScore(forge.avgStrength)}`,
    `${label('Masterwork:')} ${String(forge.masterworkCopperCount)}`,
    `${label('Scrap:')} ${String(forge.scrapCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all copper forges as summary
 * @example
 * formatForgesTable(forges) // multi-line summary
 */
export function formatForgesTable(forges: CopperForge[]): string {
  if (forges.length === 0) return dim('No copper forges found')
  const header = heading('Copper Forges')
  const rows = forges.map(f => formatForgeTable(f))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: CopperDawnResult['stats']): string {
  const parts = [
    heading('Copper Dawn Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Forges:')} ${String(stats.totalForges)}`,
    `${label('Avg Patina Wisdom:')} ${colorScore(stats.avgPatinaWisdom)}`,
    `${label('Avg Dawn Clarity:')} ${colorScore(stats.avgDawnClarity)}`,
    `${label('Avg Conductivity:')} ${colorScore(stats.avgConductivityQuality)}`,
    `${label('Avg Warmth Resilience:')} ${colorScore(stats.avgWarmthResilience)}`,
    `${label('Avg Forge Strength:')} ${colorScore(stats.avgForgeStrength)}`,
    `${label('Masterwork Copper:')} ${String(stats.masterworkCopperCount)}`,
    `${label('Aged Bronze:')} ${String(stats.agedBronzeCount)}`,
    `${label('Proper Copper:')} ${String(stats.properCopperCount)}`,
    `${label('Tarnished Metal:')} ${String(stats.tarnishedMetalCount)}`,
    `${label('Rusty Wire:')} ${String(stats.rustyWireCount)}`,
    `${label('Scrap:')} ${String(stats.scrapCount)}`,
    `${label('High Wisdom:')} ${String(stats.hasHighWisdomCount)}`,
    `${label('High Clarity:')} ${String(stats.hasHighClarityCount)}`,
    `${label('High Conductivity:')} ${String(stats.hasHighQualityCount)}`,
    `${label('High Resilience:')} ${String(stats.hasHighResilienceCount)}`,
    `${label('High Strength:')} ${String(stats.hasHighStrengthCount)}`,
    `${label('Overall Luster:')} ${colorScore(stats.overallLuster)}`,
    `${label('Smith Grade:')} ${colorGrade(stats.smithGrade)}`,
    `${label('Best Ray:')} ${stats.bestRay}`,
    `${label('Wisest:')} ${stats.wisest}`,
    `${label('Clearest:')} ${stats.clearest}`,
    `${label('Most Conductive:')} ${stats.mostConductive}`,
    `${label('Strongest:')} ${stats.strongest}`,
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
  const items = recommendations.map(r => `${dim('\uD83D\uDD28')} ${r}`)
  return `${header}\n${items.join('\n')}`
}

// ─── Full Result Formatting ───────────────────────────────────────

/**
 * Format complete result as table
 * @example
 * formatResultTable(result) // full colored output
 */
export function formatResultTable(result: CopperDawnResult): string {
  const sections = [
    formatRaysTable(result.rays),
    '',
    formatForgesTable(result.forges),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Foundry')} ${label('Masterwork:')} ${result.foundry.isMasterwork ? high('Yes') : low('No')} ${label('Overall Luster:')} ${colorScore(result.foundry.overallLuster)}`,
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
export function formatResultJson(result: CopperDawnResult): string {
  return JSON.stringify(result, null, 2)
}
