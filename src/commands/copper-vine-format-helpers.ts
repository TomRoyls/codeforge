// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { CopperTendril, CopperGarden, CopperVineResult } from './copper-vine-helpers.js'

// ─── Color Palette (copper verdigris) ─────────────────────────────
const high = chalk.rgb(200, 140, 80)
const midHigh = chalk.rgb(180, 120, 60)
const mid = chalk.rgb(160, 100, 50)
const lowMid = chalk.rgb(140, 80, 40)
const low = chalk.rgb(120, 60, 30)

const best = chalk.rgb(220, 160, 100).bold
const good = chalk.rgb(200, 140, 80)
const okay = chalk.rgb(180, 120, 60)
const poor = chalk.rgb(160, 100, 50)
const worst = chalk.rgb(140, 80, 40)

const heading = chalk.rgb(240, 180, 120).bold
const label = chalk.rgb(210, 150, 90)
const dim = chalk.rgb(160, 120, 80)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // bright copper
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
 * colorGrade('living-copper') // best (bold copper)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'pure-copper': best, 'superconductor': best, 'verdigris-beauty': best,
    'spreading-vine': best, 'bronze-strength': best, 'living-copper': best,
    'verdigris-garden': best, 'lush-growth': best, 'master-metallurgist': best,

    'highly-malleable': good, 'high-conductivity': good, 'graceful-patina': good,
    'far-reaching': good, 'brass-tough': good, 'growing-vine': good,
    'copper-arbor': good, 'healthy-vine': good, 'copper-artisan': good,

    'proper-flex': okay, 'proper-flow': okay, 'proper-aging': okay,
    'proper-extent': okay, 'proper-alloy': okay, 'proper-tendril': okay,
    'proper-trellis': okay, 'decent-garden': okay, 'skilled-craftsman': okay,

    'stiff-wire': poor, 'semiconductor': poor, 'premature-rust': poor,
    'short-reach': poor, 'weak-bond': poor, 'rigid-wire': poor,
    'wire-fence': poor, 'struggling-plant': poor, 'apprentice': poor,

    'rigid-bar': worst, 'resistor': worst, 'corroding': worst,
    'stunted': worst, 'brittle-mix': worst, 'corroded-pipe': worst,
    'rusty-pipe': worst, 'dead-vine': worst, 'novice': worst,

    'cast-iron': worst, 'insulator': worst, 'decaying': worst,
    'no-growth': worst, 'no-bond': worst, 'scrap-metal': worst,
    'no-garden': worst, 'barren': worst, 'scrap-dealer': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Tendril Formatting ───────────────────────────────────────────

/**
 * Format a single tendril for display
 * @example
 * formatTendrilTable(tendril) // colored tendril info
 */
export function formatTendrilTable(tendril: CopperTendril): string {
  const parts = [
    `${label('File:')} ${dim(tendril.file)}`,
    `${label('Malleability:')} ${colorScore(tendril.malleability)} ${colorGrade(tendril.bending.grade)}`,
    `${label('Conductivity:')} ${colorScore(tendril.conductivity)} ${colorGrade(tendril.conducting.conductor)}`,
    `${label('Patina Wisdom:')} ${colorScore(tendril.patinaWisdom)} ${colorGrade(tendril.aging.patina)}`,
    `${label('Tendril Reach:')} ${colorScore(tendril.tendrilReach)} ${colorGrade(tendril.reaching.tendril)}`,
    `${label('Alloy Strength:')} ${colorScore(tendril.alloyStrength)} ${colorGrade(tendril.alloying.alloy)}`,
    `${label('Score:')} ${colorScore(tendril.qualityScore)} ${colorGrade(tendril.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format tendrils as summary table
 * @example
 * formatTendrilsTable(tendrils) // multi-line table
 */
export function formatTendrilsTable(tendrils: CopperTendril[]): string {
  if (tendrils.length === 0) return dim('No copper tendrils found')
  const header = heading('Copper Vine Analysis')
  const rows = tendrils.map(t => formatTendrilTable(t))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Garden Formatting ─────────────────────────────────────────────

/**
 * Format a garden for display
 * @example
 * formatGardenTable(garden) // colored garden info
 */
export function formatGardenTable(garden: CopperGarden): string {
  const parts = [
    `${label('Garden:')} ${dim(garden.directory)}`,
    `${label('Type:')} ${colorGrade(garden.gardenType)}`,
    `${label('Condition:')} ${colorGrade(garden.condition)}`,
    `${label('Tendrils:')} ${String(garden.tendrils.length)}`,
    `${label('Avg Malleability:')} ${colorScore(garden.avgMalleability)}`,
    `${label('Avg Conductivity:')} ${colorScore(garden.avgConductivity)}`,
    `${label('Avg Strength:')} ${colorScore(garden.avgStrength)}`,
    `${label('Living Copper:')} ${String(garden.livingCopperCount)}`,
    `${label('Scrap Metal:')} ${String(garden.scrapMetalCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all gardens as summary
 * @example
 * formatGardensTable(gardens) // multi-line garden summary
 */
export function formatGardensTable(gardens: CopperGarden[]): string {
  if (gardens.length === 0) return dim('No copper gardens found')
  const header = heading('Copper Vine Gardens')
  const rows = gardens.map(g => formatGardenTable(g))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: CopperVineResult['stats']): string {
  const parts = [
    heading('Copper Vine Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Gardens:')} ${String(stats.totalGardens)}`,
    `${label('Avg Malleability:')} ${colorScore(stats.avgMalleability)}`,
    `${label('Avg Conductivity:')} ${colorScore(stats.avgConductivity)}`,
    `${label('Avg Patina Wisdom:')} ${colorScore(stats.avgPatinaWisdom)}`,
    `${label('Avg Tendril Reach:')} ${colorScore(stats.avgTendrilReach)}`,
    `${label('Avg Alloy Strength:')} ${colorScore(stats.avgAlloyStrength)}`,
    `${label('Living Copper:')} ${String(stats.livingCopperCount)}`,
    `${label('Growing Vines:')} ${String(stats.growingVineCount)}`,
    `${label('Proper Tendrils:')} ${String(stats.properTendrilCount)}`,
    `${label('Rigid Wires:')} ${String(stats.rigidWireCount)}`,
    `${label('Corroded Pipes:')} ${String(stats.corrodedPipeCount)}`,
    `${label('Scrap Metal:')} ${String(stats.scrapMetalCount)}`,
    `${label('High Malleability:')} ${String(stats.hasHighMalleabilityCount)}`,
    `${label('High Conductivity:')} ${String(stats.hasHighConductivityCount)}`,
    `${label('High Wisdom:')} ${String(stats.hasHighWisdomCount)}`,
    `${label('High Reach:')} ${String(stats.hasHighReachCount)}`,
    `${label('High Strength:')} ${String(stats.hasHighStrengthCount)}`,
    `${label('Overall Vitality:')} ${colorScore(stats.overallVitality)}`,
    `${label('Gardener Grade:')} ${colorGrade(stats.gardenerGrade)}`,
    `${label('Best Tendril:')} ${stats.bestTendril}`,
    `${label('Most Malleable:')} ${stats.mostMalleable}`,
    `${label('Most Conductive:')} ${stats.mostConductive}`,
    `${label('Wisest:')} ${stats.wisest}`,
    `${label('Most Expansive:')} ${stats.mostExpansive}`,
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
export function formatResultTable(result: CopperVineResult): string {
  const sections = [
    formatTendrilsTable(result.tendrils),
    '',
    formatGardensTable(result.gardens),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Forest')} ${label('Growing:')} ${result.forest.isGrowing ? high('Yes') : low('No')} ${label('Overall Vitality:')} ${colorScore(result.forest.overallVitality)}`,
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
export function formatResultJson(result: CopperVineResult): string {
  return JSON.stringify(result, null, 2)
}
