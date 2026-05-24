// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { ThunderIngot, ForgeComplex, ThunderForgeResult } from './thunder-forge-helpers.js'

// ─── Color Palette (thunder forge — electric blue/white/purple) ────
const high = chalk.rgb(140, 160, 255)
const midHigh = chalk.rgb(115, 135, 235)
const mid = chalk.rgb(90, 110, 210)
const lowMid = chalk.rgb(75, 95, 185)
const low = chalk.rgb(60, 80, 160)

const best = chalk.rgb(180, 200, 255).bold
const good = chalk.rgb(150, 170, 245)
const okay = chalk.rgb(120, 140, 225)
const poor = chalk.rgb(95, 115, 200)
const worst = chalk.rgb(75, 95, 175)

const heading = chalk.rgb(170, 190, 255).bold
const label = chalk.rgb(135, 155, 240)
const dim = chalk.rgb(100, 120, 215)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // electric blue
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
 * colorGrade('legendary-weapon') // best (bold electric)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'thunderbolt-strike': best, 'mythril-anvil': best, 'divine-inspiration': best,
    'master-temper': best, 'storm-master': best, 'legendary-weapon': best,
    'mythical-forge': best, 'legendary-armory': best, 'thunder-smith': best,

    'lightning-power': good, 'steel-anvil': good, 'creative-fire': good,
    'proper-heat-treat': good, 'weather-worker': good, 'thunder-forged': good,
    'grand-forge': good, 'thunder-workshop': good, 'master-forge': good,

    'proper-charge': okay, 'proper-anvil': okay, 'proper-spark': okay,
    'decent-temper': okay, 'proper-craft': okay, 'proper-blade': okay,
    'proper-workshop': okay, 'decent-forge': okay, 'skilled-blacksmith': okay,

    'static-electricity': poor, 'iron-block': poor, 'dim-spark': poor,
    'uneven-temper': poor, 'storm-tossed': poor, 'rough-metal': poor,
    'small-anvil': poor, 'dim-hearth': poor, 'apprentice': poor,

    'dead-battery': worst, 'cracked-stone': worst, 'dead-ember': worst,
    'botched-temper': worst, 'storm-damaged': worst, 'slag': worst,
    'cold-hearth': worst, 'cold-ashes': worst, 'novice': worst,

    'no-power': worst, 'no-anvil': worst, 'no-spark': worst,
    'no-temper': worst, 'no-craft': worst, 'dust': worst,
    'no-forge': worst, 'void': worst, 'scavenger': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Ingot Formatting ─────────────────────────────────────────────

/**
 * Format a single thunder ingot for display
 * @example
 * formatIngotTable(ingot) // colored ingot info
 */
export function formatIngotTable(ingot: ThunderIngot): string {
  const parts = [
    `${label('File:')} ${dim(ingot.file)}`,
    `${label('Lightning Power:')} ${colorScore(ingot.lightningPower)} ${colorGrade(ingot.powering.grade)}`,
    `${label('Anvil Strength:')} ${colorScore(ingot.anvilStrength)} ${colorGrade(ingot.enduring.anvil)}`,
    `${label('Spark Quality:')} ${colorScore(ingot.sparkQuality)} ${colorGrade(ingot.creating.spark)}`,
    `${label('Temper Precision:')} ${colorScore(ingot.temperPrecision)} ${colorGrade(ingot.tuning.temper)}`,
    `${label('Storm Craft:')} ${colorScore(ingot.stormCraft)} ${colorGrade(ingot.crafting.storm)}`,
    `${label('Score:')} ${colorScore(ingot.qualityScore)} ${colorGrade(ingot.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format ingots as summary table
 * @example
 * formatIngotsTable(ingots) // multi-line table
 */
export function formatIngotsTable(ingots: ThunderIngot[]): string {
  if (ingots.length === 0) return dim('No thunder ingots found')
  const header = heading('Thunder Forge Analysis')
  const rows = ingots.map(ig => formatIngotTable(ig))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Complex Formatting ───────────────────────────────────────────

/**
 * Format a single forge complex for display
 * @example
 * formatComplexTable(complex) // colored complex info
 */
export function formatComplexTable(complex: ForgeComplex): string {
  const parts = [
    `${label('Complex:')} ${dim(complex.directory)}`,
    `${label('Type:')} ${colorGrade(complex.complexType)}`,
    `${label('Condition:')} ${colorGrade(complex.condition)}`,
    `${label('Ingots:')} ${String(complex.ingots.length)}`,
    `${label('Avg Power:')} ${colorScore(complex.avgPower)}`,
    `${label('Avg Strength:')} ${colorScore(complex.avgStrength)}`,
    `${label('Avg Craft:')} ${colorScore(complex.avgCraft)}`,
    `${label('Legendary Weapons:')} ${String(complex.legendaryWeaponCount)}`,
    `${label('Dust:')} ${String(complex.dustCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all forge complexes as summary
 * @example
 * formatComplexesTable(complexes) // multi-line summary
 */
export function formatComplexesTable(complexes: ForgeComplex[]): string {
  if (complexes.length === 0) return dim('No forge complexes found')
  const header = heading('Forge Complexes')
  const rows = complexes.map(c => formatComplexTable(c))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: ThunderForgeResult['stats']): string {
  const parts = [
    heading('Thunder Forge Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Complexes:')} ${String(stats.totalComplexes)}`,
    `${label('Avg Lightning Power:')} ${colorScore(stats.avgLightningPower)}`,
    `${label('Avg Anvil Strength:')} ${colorScore(stats.avgAnvilStrength)}`,
    `${label('Avg Spark Quality:')} ${colorScore(stats.avgSparkQuality)}`,
    `${label('Avg Temper Precision:')} ${colorScore(stats.avgTemperPrecision)}`,
    `${label('Avg Storm Craft:')} ${colorScore(stats.avgStormCraft)}`,
    `${label('Legendary Weapon:')} ${String(stats.legendaryWeaponCount)}`,
    `${label('Thunder Forged:')} ${String(stats.thunderForgedCount)}`,
    `${label('Proper Blade:')} ${String(stats.properBladeCount)}`,
    `${label('Rough Metal:')} ${String(stats.roughMetalCount)}`,
    `${label('Slag:')} ${String(stats.slagCount)}`,
    `${label('Dust:')} ${String(stats.dustCount)}`,
    `${label('High Power:')} ${String(stats.hasHighPowerCount)}`,
    `${label('High Strength:')} ${String(stats.hasHighStrengthCount)}`,
    `${label('High Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('High Precision:')} ${String(stats.hasHighPrecisionCount)}`,
    `${label('High Craft:')} ${String(stats.hasHighCraftCount)}`,
    `${label('Overall Might:')} ${colorScore(stats.overallMight)}`,
    `${label('Smith Grade:')} ${colorGrade(stats.smithGrade)}`,
    `${label('Best Ingot:')} ${stats.bestIngot}`,
    `${label('Most Powerful:')} ${stats.mostPowerful}`,
    `${label('Strongest:')} ${stats.strongest}`,
    `${label('Most Creative:')} ${stats.mostCreative}`,
    `${label('Best Craft:')} ${stats.bestCraft}`,
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
  const items = recommendations.map(r => `${dim('\u26A1')} ${r}`)
  return `${header}\n${items.join('\n')}`
}

// ─── Full Result Formatting ───────────────────────────────────────

/**
 * Format complete result as table
 * @example
 * formatResultTable(result) // full colored output
 */
export function formatResultTable(result: ThunderForgeResult): string {
  const sections = [
    formatIngotsTable(result.ingots),
    '',
    formatComplexesTable(result.complexes),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Armory')} ${label('Legendary:')} ${result.armory.isLegendary ? high('Yes') : low('No')} ${label('Overall Might:')} ${colorScore(result.armory.overallMight)}`,
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
export function formatResultJson(result: ThunderForgeResult): string {
  return JSON.stringify(result, null, 2)
}
