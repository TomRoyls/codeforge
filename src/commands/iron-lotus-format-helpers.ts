// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { IronPetal, LotusGarden, IronLotusResult } from './iron-lotus-helpers.js'

// ─── Color Palette (iron lotus — iron/dark-silver/pale-white) ──────
const high = chalk.rgb(180, 200, 220)
const midHigh = chalk.rgb(170, 190, 210)
const mid = chalk.rgb(155, 175, 195)
const lowMid = chalk.rgb(140, 160, 180)
const low = chalk.rgb(125, 145, 165)

const best = chalk.rgb(200, 220, 240).bold
const good = chalk.rgb(185, 205, 225)
const okay = chalk.rgb(165, 185, 205)
const poor = chalk.rgb(145, 155, 175)
const worst = chalk.rgb(125, 135, 155)

const heading = chalk.rgb(160, 190, 220).bold
const label = chalk.rgb(170, 180, 200)
const dim = chalk.rgb(150, 160, 175)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // pale-silver
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
 * colorGrade('mythical-bloom') // best (bold pale)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'perfect-paradox': best, 'unwavering-iron': best, 'micron-perfect': best,
    'iron-roots': best, 'pure-white': best, 'mythical-bloom': best,
    'forbidden-garden': best, 'divine-bloom': best, 'divine-smith': best,

    'iron-delicate': good, 'disciplined-steel': good, 'fine-craftsmanship': good,
    'strong-taproot': good, 'clean-bloom': good, 'forged-flower': good,
    'iron-temple': good, 'beautiful-garden': good, 'master-forge': good,

    'proper-balance': okay, 'proper-metal': okay, 'proper-detail': okay,
    'proper-anchoring': okay, 'proper-lotus': okay,
    'proper-garden': okay, 'decent-plot': okay, 'skilled-crafter': okay,

    'brute-force': poor, 'bending-copper': poor, 'rough-cut': poor,
    'shallow-hold': poor, 'tainted-petal': poor, 'rusty-petal': poor,
    'wild-patch': poor, 'neglected-bed': poor, 'apprentice': poor,

    'fragile-only': worst, 'soft-lead': worst, 'hammered-flat': worst,
    'loose-soil': worst, 'polluted-flower': worst, 'wilted-iron': worst,
    'weed-bed': worst, 'overgrown': worst, 'novice': worst,

    'no-balance': worst, 'no-discipline': worst, 'no-precision': worst,
    'no-roots': worst, 'no-bloom': worst, 'scrap-metal': worst,
    'no-garden': worst, 'void': worst, 'no-smith': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Petal Formatting ─────────────────────────────────────────────

/**
 * Format a single petal for display
 * @example
 * formatPetalTable(petal) // colored petal info
 */
export function formatPetalTable(petal: IronPetal): string {
  const parts = [
    `${label('File:')} ${dim(petal.file)}`,
    `${label('Strength Through Fragility:')} ${colorScore(petal.strengthThroughFragility)} ${colorGrade(petal.balancing.grade)}`,
    `${label('Iron Discipline:')} ${colorScore(petal.ironDiscipline)} ${colorGrade(petal.disciplining.iron)}`,
    `${label('Petal Precision:')} ${colorScore(petal.petalPrecision)} ${colorGrade(petal.precisioning.petal)}`,
    `${label('Root Fortitude:')} ${colorScore(petal.rootFortitude)} ${colorGrade(petal.fortifying.root)}`,
    `${label('Bloom Purity:')} ${colorScore(petal.bloomPurity)} ${colorGrade(petal.purifying.bloom)}`,
    `${label('Score:')} ${colorScore(petal.qualityScore)} ${colorGrade(petal.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format petals as summary table
 * @example
 * formatPetalsTable(petals) // multi-line table
 */
export function formatPetalsTable(petals: IronPetal[]): string {
  if (petals.length === 0) return dim('No iron petals found')
  const header = heading('Iron Lotus Analysis')
  const rows = petals.map(p => formatPetalTable(p))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Garden Formatting ────────────────────────────────────────────

/**
 * Format a garden for display
 * @example
 * formatGardenTable(garden) // colored garden info
 */
export function formatGardenTable(garden: LotusGarden): string {
  const parts = [
    `${label('Garden:')} ${dim(garden.directory)}`,
    `${label('Type:')} ${colorGrade(garden.gardenType)}`,
    `${label('Condition:')} ${colorGrade(garden.condition)}`,
    `${label('Petals:')} ${String(garden.petals.length)}`,
    `${label('Avg Strength:')} ${colorScore(garden.avgStrength)}`,
    `${label('Avg Discipline:')} ${colorScore(garden.avgDiscipline)}`,
    `${label('Avg Purity:')} ${colorScore(garden.avgPurity)}`,
    `${label('Mythical Blooms:')} ${String(garden.mythicalBloomCount)}`,
    `${label('Scrap Metal:')} ${String(garden.scrapMetalCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all gardens as summary
 * @example
 * formatGardensTable(gardens) // multi-line summary
 */
export function formatGardensTable(gardens: LotusGarden[]): string {
  if (gardens.length === 0) return dim('No lotus gardens found')
  const header = heading('Lotus Gardens')
  const rows = gardens.map(g => formatGardenTable(g))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: IronLotusResult['stats']): string {
  const parts = [
    heading('Iron Lotus Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Gardens:')} ${String(stats.totalGardens)}`,
    `${label('Avg Strength Through Fragility:')} ${colorScore(stats.avgStrengthThroughFragility)}`,
    `${label('Avg Iron Discipline:')} ${colorScore(stats.avgIronDiscipline)}`,
    `${label('Avg Petal Precision:')} ${colorScore(stats.avgPetalPrecision)}`,
    `${label('Avg Root Fortitude:')} ${colorScore(stats.avgRootFortitude)}`,
    `${label('Avg Bloom Purity:')} ${colorScore(stats.avgBloomPurity)}`,
    `${label('Mythical Bloom:')} ${String(stats.mythicalBloomCount)}`,
    `${label('Forged Flower:')} ${String(stats.forgedFlowerCount)}`,
    `${label('Proper Lotus:')} ${String(stats.properLotusCount)}`,
    `${label('Rusty Petal:')} ${String(stats.rustyPetalCount)}`,
    `${label('Wilted Iron:')} ${String(stats.wiltedIronCount)}`,
    `${label('Scrap Metal:')} ${String(stats.scrapMetalCount)}`,
    `${label('High Strength:')} ${String(stats.hasHighStrengthCount)}`,
    `${label('High Discipline:')} ${String(stats.hasHighDisciplineCount)}`,
    `${label('High Precision:')} ${String(stats.hasHighPrecisionCount)}`,
    `${label('High Fortitude:')} ${String(stats.hasHighFortitudeCount)}`,
    `${label('High Purity:')} ${String(stats.hasHighPurityCount)}`,
    `${label('Overall Perfection:')} ${colorScore(stats.overallPerfection)}`,
    `${label('Smith Grade:')} ${colorGrade(stats.smithGrade)}`,
    `${label('Best Petal:')} ${stats.bestPetal}`,
    `${label('Strongest:')} ${stats.strongest}`,
    `${label('Most Disciplined:')} ${stats.mostDisciplined}`,
    `${label('Most Precise:')} ${stats.mostPrecise}`,
    `${label('Purest:')} ${stats.purest}`,
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
export function formatResultTable(result: IronLotusResult): string {
  const sections = [
    formatPetalsTable(result.petals),
    '',
    formatGardensTable(result.gardens),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Forge')} ${label('Mythical:')} ${result.forge.isMythical ? high('Yes') : low('No')} ${label('Overall Perfection:')} ${colorScore(result.forge.overallPerfection)}`,
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
export function formatResultJson(result: IronLotusResult): string {
  return JSON.stringify(result, null, 2)
}
