// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { PeridotRay, PeridotQuarry, PeridotDawnResult } from './peridot-dawn-helpers.js'

// ─── Color Palette (peridot olive-green) ───────────────────────────
const high = chalk.rgb(140, 200, 80)
const midHigh = chalk.rgb(125, 185, 70)
const mid = chalk.rgb(110, 170, 60)
const lowMid = chalk.rgb(95, 150, 50)
const low = chalk.rgb(80, 130, 40)

const best = chalk.rgb(160, 220, 100).bold
const good = chalk.rgb(145, 205, 85)
const okay = chalk.rgb(125, 185, 70)
const poor = chalk.rgb(105, 165, 55)
const worst = chalk.rgb(85, 145, 40)

const heading = chalk.rgb(170, 225, 110).bold
const label = chalk.rgb(155, 210, 95)
const dim = chalk.rgb(120, 140, 110)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // bright olive
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
 * colorGrade('olivine-treasure') // best (bold green)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'crystal-dawn': best, 'bursting-energy': best, 'fully-transparent': best,
    'exponential-growth': best, 'golden-sunrise': best, 'olivine-treasure': best,
    'zabargad-island': best, 'gem-quality': best, 'sun-herald': best,

    'clear-morning': good, 'high-vitality': good, 'clear-peridot': good,
    'rapid-expansion': good, 'warm-morning': good, 'fine-peridot': good,
    'proper-quarry': good, 'fine-find': good, 'dawn-bringer': good,

    'proper-daylight': okay, 'proper-energy': okay, 'proper-openness': okay,
    'proper-growth': okay, 'proper-light': okay, 'proper-olivine': okay,
    'volcanic-vent': okay, 'decent-yield': okay, 'morning-star': okay,

    'hazy-dawn': poor, 'low-energy': poor, 'slightly-cloudy': poor,
    'slow-growth': poor, 'cool-dawn': poor, 'chrysolite': poor,
    'surface-find': poor, 'low-grade': poor, 'early-bird': poor,

    'foggy-morning': worst, 'sluggish': worst, 'translucent': worst,
    'stagnant': worst, 'overcast': worst, 'serpentine': worst,
    'river-pebble': worst, 'exhausted': worst, 'late-riser': worst,

    'pitch-dark': worst, 'dormant': worst, 'opaque': worst,
    'shrinking': worst, 'eclipse': worst, 'sand': worst,
    'no-source': worst, 'barren': worst, 'night-owl': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Ray Formatting ────────────────────────────────────────────────

/**
 * Format a single ray for display
 * @example
 * formatRayTable(ray) // colored ray info
 */
export function formatRayTable(ray: PeridotRay): string {
  const parts = [
    `${label('File:')} ${dim(ray.file)}`,
    `${label('Clarity:')} ${colorScore(ray.morningClarity)} ${colorGrade(ray.clarifying.grade)}`,
    `${label('Vitality:')} ${colorScore(ray.freshVitality)} ${colorGrade(ray.vitalizing.energy)}`,
    `${label('Transparency:')} ${colorScore(ray.crystalTransparency)} ${colorGrade(ray.opening.crystal)}`,
    `${label('Growth:')} ${colorScore(ray.growthEnergy)} ${colorGrade(ray.growing.growth)}`,
    `${label('Warmth:')} ${colorScore(ray.sunlightWarmth)} ${colorGrade(ray.warming.sunlight)}`,
    `${label('Score:')} ${colorScore(ray.qualityScore)} ${colorGrade(ray.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format rays as summary table
 * @example
 * formatRaysTable(rays) // multi-line table
 */
export function formatRaysTable(rays: PeridotRay[]): string {
  if (rays.length === 0) return dim('No peridot rays found')
  const header = heading('Peridot Dawn Analysis')
  const rows = rays.map(r => formatRayTable(r))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Quarry Formatting ─────────────────────────────────────────────

/**
 * Format a quarry for display
 * @example
 * formatQuarryTable(quarry) // colored quarry info
 */
export function formatQuarryTable(quarry: PeridotQuarry): string {
  const parts = [
    `${label('Quarry:')} ${dim(quarry.directory)}`,
    `${label('Type:')} ${colorGrade(quarry.quarryType)}`,
    `${label('Condition:')} ${colorGrade(quarry.condition)}`,
    `${label('Rays:')} ${String(quarry.rays.length)}`,
    `${label('Avg Clarity:')} ${colorScore(quarry.avgClarity)}`,
    `${label('Avg Vitality:')} ${colorScore(quarry.avgVitality)}`,
    `${label('Avg Transparency:')} ${colorScore(quarry.avgTransparency)}`,
    `${label('Olivine Treasures:')} ${String(quarry.olivineTreasureCount)}`,
    `${label('Sand:')} ${String(quarry.sandCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all quarries as summary
 * @example
 * formatQuarriesTable(quarries) // multi-line quarry summary
 */
export function formatQuarriesTable(quarries: PeridotQuarry[]): string {
  if (quarries.length === 0) return dim('No peridot quarries found')
  const header = heading('Peridot Dawn Analysis')
  const rows = quarries.map(q => formatQuarryTable(q))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: PeridotDawnResult['stats']): string {
  const parts = [
    heading('Peridot Dawn Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Quarries:')} ${String(stats.totalQuarries)}`,
    `${label('Avg Morning Clarity:')} ${colorScore(stats.avgMorningClarity)}`,
    `${label('Avg Fresh Vitality:')} ${colorScore(stats.avgFreshVitality)}`,
    `${label('Avg Crystal Transparency:')} ${colorScore(stats.avgCrystalTransparency)}`,
    `${label('Avg Growth Energy:')} ${colorScore(stats.avgGrowthEnergy)}`,
    `${label('Avg Sunlight Warmth:')} ${colorScore(stats.avgSunlightWarmth)}`,
    `${label('Olivine Treasures:')} ${String(stats.olivineTreasureCount)}`,
    `${label('Fine Peridots:')} ${String(stats.finePeridotCount)}`,
    `${label('Proper Olivines:')} ${String(stats.properOlivineCount)}`,
    `${label('Chrysolite:')} ${String(stats.chrysoliteCount)}`,
    `${label('Serpentine:')} ${String(stats.serpentineCount)}`,
    `${label('Sand:')} ${String(stats.sandCount)}`,
    `${label('High Clarity:')} ${String(stats.hasHighClarityCount)}`,
    `${label('High Vitality:')} ${String(stats.hasHighVitalityCount)}`,
    `${label('High Transparency:')} ${String(stats.hasHighTransparencyCount)}`,
    `${label('High Energy:')} ${String(stats.hasHighEnergyCount)}`,
    `${label('High Warmth:')} ${String(stats.hasHighWarmthCount)}`,
    `${label('Overall Brightness:')} ${colorScore(stats.overallBrightness)}`,
    `${label('Dawn Grade:')} ${colorGrade(stats.dawnGrade)}`,
    `${label('Best Ray:')} ${stats.bestRay}`,
    `${label('Clearest:')} ${stats.clearest}`,
    `${label('Most Vital:')} ${stats.mostVital}`,
    `${label('Most Transparent:')} ${stats.mostTransparent}`,
    `${label('Warmest:')} ${stats.warmest}`,
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
export function formatResultTable(result: PeridotDawnResult): string {
  const sections = [
    formatRaysTable(result.rays),
    '',
    formatQuarriesTable(result.quarries),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Sunrise')} ${label('Dawning:')} ${result.sunrise.isDawning ? high('Yes') : low('No')} ${label('Overall Brightness:')} ${colorScore(result.sunrise.overallBrightness)}`,
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
export function formatResultJson(result: PeridotDawnResult): string {
  return JSON.stringify(result, null, 2)
}
