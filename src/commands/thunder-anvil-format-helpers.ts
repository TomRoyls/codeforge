// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { ForgedBlade, ForgeWorkshop, ThunderAnvilResult } from './thunder-anvil-helpers.js'

// ─── Color Palette (anvil orange/yellow) ────────────────────────────
const high = chalk.rgb(255, 180, 60)
const midHigh = chalk.rgb(235, 155, 50)
const mid = chalk.rgb(210, 130, 40)
const lowMid = chalk.rgb(185, 105, 30)
const low = chalk.rgb(160, 80, 20)

const best = chalk.rgb(255, 210, 80).bold
const good = chalk.rgb(245, 185, 65)
const okay = chalk.rgb(225, 160, 55)
const poor = chalk.rgb(200, 130, 45)
const worst = chalk.rgb(175, 100, 35)

const heading = chalk.rgb(255, 200, 70).bold
const label = chalk.rgb(240, 170, 55)
const dim = chalk.rgb(150, 165, 175)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // anvil orange
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
 * colorGrade('legendary-blade') // best (bold orange)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (text: string) => string> = {
    'master-forged': best, 'surgical-strike': best, 'perfect-temper': best, 'fireworks': best, 'controlled-quench': best,
    'legendary-blade': best, 'master-forge': best, 'legendary-forge': best, 'master-smith': best,

    'well-forged': good, 'precise-blow': good, 'spring-steel': good, 'bright-sparks': good, 'proper-cool': good,
    'master-sword': good, 'proper-foundry': good, 'hot-fire': good, 'expert-forger': good,

    'proper-blade': okay, 'proper-strike': okay, 'proper-temper': okay, 'proper-sparks': okay, 'steady-cool': okay,
    'proper-weapon': okay, 'village-smithy': okay, 'warm-coals': okay, 'skilled-blacksmith': okay,

    'rough-forged': poor, 'wild-swing': poor, 'over-hardened': poor, 'few-sparks': poor, 'rapid-cool': poor,
    'dull-blade': poor, 'backyard-anvil': poor, 'cooling-embers': poor, 'apprentice': poor,

    'half-formed': worst, 'mis-hit': worst, 'too-soft': worst, 'dull-taps': worst, 'premature-freeze': worst,
    'bent-nail': worst, 'campfire': worst, 'cold-hearth': worst, 'novice': worst,

    'raw-ore': worst, 'missed-anvil': worst, 'untempered': worst, 'cold-metal': worst, 'never-cools': worst,
    'scrap-metal': worst, 'no-forge': worst, 'extinguished': worst, 'burn-fingers': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Blade Formatting ─────────────────────────────────────────────

/**
 * Format a single blade for display
 * @example
 * formatBladeTable(blade) // colored blade info
 */
export function formatBladeTable(blade: ForgedBlade): string {
  const parts = [
    `${label('File:')} ${dim(blade.file)}`,
    `${label('Forging Strength:')} ${colorScore(blade.forgingStrength)} ${colorGrade(blade.forging.grade)}`,
    `${label('Hammer Precision:')} ${colorScore(blade.hammerPrecision)} ${colorGrade(blade.hammering.hammer)}`,
    `${label('Temper Quality:')} ${colorScore(blade.temperQuality)} ${colorGrade(blade.tempering.temper)}`,
    `${label('Spark Generation:')} ${colorScore(blade.sparkGeneration)} ${colorGrade(blade.sparking.spark)}`,
    `${label('Cooling Rate:')} ${colorScore(blade.coolingRate)} ${colorGrade(blade.cooling.cooling)}`,
    `${label('Score:')} ${colorScore(blade.qualityScore)} ${colorGrade(blade.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format blades as summary table
 * @example
 * formatBladesTable(blades) // multi-line table
 */
export function formatBladesTable(blades: ForgedBlade[]): string {
  if (blades.length === 0) return dim('No forged blades found')
  const header = heading('Thunder Anvil Blade Analysis')
  const rows = blades.map(b => formatBladeTable(b))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Workshop Formatting ──────────────────────────────────────────

/**
 * Format a workshop for display
 * @example
 * formatWorkshopTable(workshop) // colored workshop info
 */
export function formatWorkshopTable(workshop: ForgeWorkshop): string {
  const parts = [
    `${label('Workshop:')} ${dim(workshop.directory)}`,
    `${label('Type:')} ${colorGrade(workshop.workshopType)}`,
    `${label('Condition:')} ${colorGrade(workshop.condition)}`,
    `${label('Blades:')} ${String(workshop.blades.length)}`,
    `${label('Avg Strength:')} ${colorScore(workshop.avgStrength)}`,
    `${label('Avg Precision:')} ${colorScore(workshop.avgPrecision)}`,
    `${label('Avg Temper:')} ${colorScore(workshop.avgTemper)}`,
    `${label('Legendary:')} ${String(workshop.legendaryBladeCount)}`,
    `${label('Scrap Metal:')} ${String(workshop.scrapMetalCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all workshops as summary
 * @example
 * formatWorkshopsTable(workshops) // multi-line workshop summary
 */
export function formatWorkshopsTable(workshops: ForgeWorkshop[]): string {
  if (workshops.length === 0) return dim('No forge workshops found')
  const header = heading('Forge Workshop Analysis')
  const rows = workshops.map(w => formatWorkshopTable(w))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ──────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: ThunderAnvilResult['stats']): string {
  const parts = [
    heading('Thunder Anvil Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Workshops:')} ${String(stats.totalWorkshops)}`,
    `${label('Avg Forging Strength:')} ${colorScore(stats.avgForgingStrength)}`,
    `${label('Avg Hammer Precision:')} ${colorScore(stats.avgHammerPrecision)}`,
    `${label('Avg Temper Quality:')} ${colorScore(stats.avgTemperQuality)}`,
    `${label('Avg Spark Generation:')} ${colorScore(stats.avgSparkGeneration)}`,
    `${label('Avg Cooling Rate:')} ${colorScore(stats.avgCoolingRate)}`,
    `${label('Legendary Blade:')} ${String(stats.legendaryBladeCount)}`,
    `${label('Master Sword:')} ${String(stats.masterSwordCount)}`,
    `${label('Proper Weapon:')} ${String(stats.properWeaponCount)}`,
    `${label('Dull Blade:')} ${String(stats.dullBladeCount)}`,
    `${label('Bent Nail:')} ${String(stats.bentNailCount)}`,
    `${label('Scrap Metal:')} ${String(stats.scrapMetalCount)}`,
    `${label('High Strength:')} ${String(stats.hasHighStrengthCount)}`,
    `${label('High Precision:')} ${String(stats.hasHighPrecisionCount)}`,
    `${label('High Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('High Generation:')} ${String(stats.hasHighGenerationCount)}`,
    `${label('High Rate:')} ${String(stats.hasHighRateCount)}`,
    `${label('Overall Craftsmanship:')} ${colorScore(stats.overallCraftsmanship)}`,
    `${label('Smith Grade:')} ${colorGrade(stats.smithGrade)}`,
    `${label('Best Blade:')} ${stats.bestBlade}`,
    `${label('Strongest:')} ${stats.strongest}`,
    `${label('Most Precise:')} ${stats.mostPrecise}`,
    `${label('Best Tempered:')} ${stats.bestTempered}`,
    `${label('Most Creative:')} ${stats.mostCreative}`,
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
export function formatResultTable(result: ThunderAnvilResult): string {
  const sections = [
    formatBladesTable(result.blades),
    '',
    formatWorkshopsTable(result.workshops),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Forge')} ${label('Active:')} ${result.forge.isForging ? high('Yes') : low('No')} ${label('Craftsmanship:')} ${colorScore(result.forge.overallCraftsmanship)}`,
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
export function formatResultJson(result: ThunderAnvilResult): string {
  return JSON.stringify(result, null, 2)
}
