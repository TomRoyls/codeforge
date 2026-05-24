// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { StarForge, CosmicForge, StarlightAnvilResult } from './starlight-anvil-helpers.js'

// ─── Color Palette (starlight anvil — gold/silver/cosmic) ──────────
const high = chalk.rgb(255, 200, 50)
const midHigh = chalk.rgb(230, 180, 45)
const mid = chalk.rgb(200, 160, 40)
const lowMid = chalk.rgb(170, 135, 35)
const low = chalk.rgb(140, 110, 30)

const best = chalk.rgb(255, 230, 100).bold
const good = chalk.rgb(245, 210, 75)
const okay = chalk.rgb(220, 190, 60)
const poor = chalk.rgb(185, 160, 50)
const worst = chalk.rgb(150, 130, 40)

const heading = chalk.rgb(250, 215, 70).bold
const label = chalk.rgb(235, 195, 55)
const dim = chalk.rgb(200, 170, 45)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // gold
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
 * colorGrade('cosmic-smith') // best (bold gold)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'divine-forge': best, 'neutron-star': best, 'orion-belt': best,
    'crystal-nebula': best, 'supernova-power': best, 'celestial-masterpiece': best,
    'cosmic-foundry': best, 'divine-armory': best, 'cosmic-smith': best,

    'master-craft': good, 'white-dwarf': good, 'big-dipper': good,
    'clear-cosmos': good, 'stellar-force': good, 'star-forged-tool': good,
    'stellar-forge': good, 'stellar-workshop': good, 'star-forge-master': good,

    'proper-forge': okay, 'proper-star': okay, 'proper-stars': okay,
    'proper-clarity': okay, 'proper-strength': okay, 'proper-instrument': okay,
    'proper-anvil': okay, 'decent-forge': okay, 'skilled-blacksmith': okay,

    'rough-hammer': poor, 'red-giant': poor, 'scattered-points': poor,
    'foggy-nebula': poor, 'weak-gravity': poor, 'rough-metal': poor,
    'small-hammer': poor, 'humble-anvil': poor, 'apprentice': poor,

    'misshapen-metal': worst, 'brown-dwarf': worst, 'random-dots': worst,
    'dense-cloud': worst, 'micro-gravity': worst, 'space-debris': worst,
    'cold-iron': worst, 'cold-hearth': worst, 'novice': worst,

    'no-forge': worst, 'no-star': worst, 'no-constellation': worst,
    'opaque': worst, 'no-strength': worst, 'stardust': worst,
    'no-forge': worst, 'void': worst, 'meteor-smasher': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Forge Formatting ──────────────────────────────────────────────

/**
 * Format a single forge for display
 * @example
 * formatForgeTable(forge) // colored forge info
 */
export function formatForgeTable(forge: StarForge): string {
  const parts = [
    `${label('File:')} ${dim(forge.file)}`,
    `${label('Celestial Forging:')} ${colorScore(forge.celestialForging)} ${colorGrade(forge.crafting.grade)}`,
    `${label('Star Hardness:')} ${colorScore(forge.starHardness)} ${colorGrade(forge.hardening.star)}`,
    `${label('Constellation Pattern:')} ${colorScore(forge.constellationPattern)} ${colorGrade(forge.patterning.constellation)}`,
    `${label('Nebula Clarity:')} ${colorScore(forge.nebulaClarity)} ${colorGrade(forge.clarifying.nebula)}`,
    `${label('Cosmic Strength:')} ${colorScore(forge.cosmicStrength)} ${colorGrade(forge.strengthening.cosmic)}`,
    `${label('Score:')} ${colorScore(forge.qualityScore)} ${colorGrade(forge.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format forges as summary table
 * @example
 * formatForgesTable(forges) // multi-line table
 */
export function formatForgesTable(forges: StarForge[]): string {
  if (forges.length === 0) return dim('No star forges found')
  const header = heading('Starlight Anvil Analysis')
  const rows = forges.map(f => formatForgeTable(f))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Workshop Formatting ───────────────────────────────────────────

/**
 * Format a workshop for display
 * @example
 * formatWorkshopTable(workshop) // colored workshop info
 */
export function formatWorkshopTable(workshop: CosmicForge): string {
  const parts = [
    `${label('Workshop:')} ${dim(workshop.directory)}`,
    `${label('Type:')} ${colorGrade(workshop.forgeType)}`,
    `${label('Condition:')} ${colorGrade(workshop.condition)}`,
    `${label('Forges:')} ${String(workshop.forges.length)}`,
    `${label('Avg Forging:')} ${colorScore(workshop.avgForging)}`,
    `${label('Avg Hardness:')} ${colorScore(workshop.avgHardness)}`,
    `${label('Avg Strength:')} ${colorScore(workshop.avgStrength)}`,
    `${label('Celestial Masterpieces:')} ${String(workshop.celestialMasterpieceCount)}`,
    `${label('Stardust Count:')} ${String(workshop.stardustCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all workshops as summary
 * @example
 * formatWorkshopsTable(workshops) // multi-line summary
 */
export function formatWorkshopsTable(workshops: CosmicForge[]): string {
  if (workshops.length === 0) return dim('No cosmic workshops found')
  const header = heading('Cosmic Workshops')
  const rows = workshops.map(w => formatWorkshopTable(w))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ──────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: StarlightAnvilResult['stats']): string {
  const parts = [
    heading('Starlight Anvil Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Workshops:')} ${String(stats.totalWorkshops)}`,
    `${label('Avg Celestial Forging:')} ${colorScore(stats.avgCelestialForging)}`,
    `${label('Avg Star Hardness:')} ${colorScore(stats.avgStarHardness)}`,
    `${label('Avg Constellation Pattern:')} ${colorScore(stats.avgConstellationPattern)}`,
    `${label('Avg Nebula Clarity:')} ${colorScore(stats.avgNebulaClarity)}`,
    `${label('Avg Cosmic Strength:')} ${colorScore(stats.avgCosmicStrength)}`,
    `${label('Celestial Masterpiece:')} ${String(stats.celestialMasterpieceCount)}`,
    `${label('Star-Forged Tool:')} ${String(stats.starForgedToolCount)}`,
    `${label('Proper Instrument:')} ${String(stats.properInstrumentCount)}`,
    `${label('Rough Metal:')} ${String(stats.roughMetalCount)}`,
    `${label('Space Debris:')} ${String(stats.spaceDebrisCount)}`,
    `${label('Stardust:')} ${String(stats.stardustCount)}`,
    `${label('High Forging:')} ${String(stats.hasHighForgingCount)}`,
    `${label('High Hardness:')} ${String(stats.hasHighHardnessCount)}`,
    `${label('High Pattern:')} ${String(stats.hasHighPatternCount)}`,
    `${label('High Clarity:')} ${String(stats.hasHighClarityCount)}`,
    `${label('High Strength:')} ${String(stats.hasHighStrengthCount)}`,
    `${label('Overall Power:')} ${colorScore(stats.overallPower)}`,
    `${label('Smith Grade:')} ${colorGrade(stats.smithGrade)}`,
    `${label('Best Forge:')} ${stats.bestForge}`,
    `${label('Best Crafted:')} ${stats.bestCrafted}`,
    `${label('Hardest:')} ${stats.hardest}`,
    `${label('Best Pattern:')} ${stats.bestPattern}`,
    `${label('Strongest:')} ${stats.strongest}`,
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
export function formatResultTable(result: StarlightAnvilResult): string {
  const sections = [
    formatForgesTable(result.forges),
    '',
    formatWorkshopsTable(result.workshops),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Cosmos')} ${label('Celestial:')} ${result.cosmos.isCelestial ? high('Yes') : low('No')} ${label('Overall Power:')} ${colorScore(result.cosmos.overallPower)}`,
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
export function formatResultJson(result: StarlightAnvilResult): string {
  return JSON.stringify(result, null, 2)
}
