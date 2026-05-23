// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { FrostCrystal, WinterLandscape, WinterFrostResult } from './winter-frost-helpers.js'

// ─── Color Palette (frost) ─────────────────────────────────────────
const high = chalk.rgb(160, 220, 255)
const midHigh = chalk.rgb(130, 195, 240)
const mid = chalk.rgb(100, 170, 225)
const lowMid = chalk.rgb(80, 140, 200)
const low = chalk.rgb(60, 110, 175)

const best = chalk.rgb(200, 235, 255).bold
const good = chalk.rgb(170, 220, 250)
const okay = chalk.rgb(140, 200, 235)
const poor = chalk.rgb(110, 170, 210)
const worst = chalk.rgb(80, 140, 185)

const heading = chalk.rgb(180, 230, 255).bold
const label = chalk.rgb(150, 215, 250)
const dim = chalk.rgb(150, 165, 175)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // ice blue
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
 * colorGrade('ice-palace') // best (bold frost)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, string> = {
    'ice-crystal': best, 'antifreeze-grade': best, 'diamond-ice': best,
    'unique-crystal': best, 'deep-permafrost': best, 'ice-palace': best,
    'arctic-tundra': best, 'pristine-winter': best, 'ice-archmage': best,

    'clear-frost': good, 'cold-resistant': good, 'glacier-solid': good,
    'distinct-pattern': good, 'stable-ground': good, 'frost-garden': good,
    'winter-wonderland': good, 'beautiful-frost': good, 'frost-wizard': good,

    'proper-crystal': okay, 'proper-handling': okay, 'proper-ice': okay,
    'proper-design': okay, 'proper-foundation': okay, 'proper-frost': okay,
    'frozen-lake': okay, 'proper-cold': okay, 'winter-sage': okay,

    'cloudy-ice': poor, 'brittle-in-cold': poor, 'slush': poor,
    'generic-template': poor, 'thawing': poor, 'slush-puddle': poor,
    'frost-morning': poor, 'thawing': poor, 'cold-acolyte': poor,

    'foggy-glass': worst, 'freezing': worst, 'thin-ice': worst,
    'cookie-cutter': worst, 'sinking': worst, 'ice-shard': worst,
    'light-dusting': worst, 'slushy': worst, 'novice': worst,

    'opaque-frost': worst, 'frozen-solid': worst, 'no-structure': worst,
    'identical-copy': worst, 'melted': worst, 'dry-ground': worst,
    'no-snow': worst, 'spring': worst, 'snowman': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Crystal Formatting ───────────────────────────────────────────

/**
 * Format a single crystal for display
 * @example
 * formatCrystalTable(crystal) // colored crystal info
 */
export function formatCrystalTable(crystal: FrostCrystal): string {
  const parts = [
    `${label('File:')} ${dim(crystal.file)}`,
    `${label('Crystal Clarity:')} ${colorScore(crystal.crystalClarity)} ${colorGrade(crystal.clarifying.grade)}`,
    `${label('Freeze Resistance:')} ${colorScore(crystal.freezeResistance)} ${colorGrade(crystal.resisting.freeze)}`,
    `${label('Ice Structure:')} ${colorScore(crystal.iceStructure)} ${colorGrade(crystal.structuring.structure)}`,
    `${label('Snowflake Uniqueness:')} ${colorScore(crystal.snowflakeUniqueness)} ${colorGrade(crystal.uniqueing.flake)}`,
    `${label('Permafrost Stability:')} ${colorScore(crystal.permafrostStability)} ${colorGrade(crystal.stabilizing.permafrost)}`,
    `${label('Score:')} ${colorScore(crystal.qualityScore)} ${colorGrade(crystal.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format crystals as summary table
 * @example
 * formatCrystalsTable(crystals) // multi-line table
 */
export function formatCrystalsTable(crystals: FrostCrystal[]): string {
  if (crystals.length === 0) return dim('No frost crystals found')
  const header = heading('Winter Frost Analysis')
  const rows = crystals.map(c => formatCrystalTable(c))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Landscape Formatting ──────────────────────────────────────────

/**
 * Format a landscape for display
 * @example
 * formatLandscapeTable(landscape) // colored landscape info
 */
export function formatLandscapeTable(landscape: WinterLandscape): string {
  const parts = [
    `${label('Landscape:')} ${dim(landscape.directory)}`,
    `${label('Type:')} ${colorGrade(landscape.landscapeType)}`,
    `${label('Condition:')} ${colorGrade(landscape.condition)}`,
    `${label('Crystals:')} ${String(landscape.crystals.length)}`,
    `${label('Avg Clarity:')} ${colorScore(landscape.avgClarity)}`,
    `${label('Avg Structure:')} ${colorScore(landscape.avgStructure)}`,
    `${label('Avg Stability:')} ${colorScore(landscape.avgStability)}`,
    `${label('Ice Palaces:')} ${String(landscape.icePalaceCount)}`,
    `${label('Dry Ground:')} ${String(landscape.dryGroundCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all landscapes as summary
 * @example
 * formatLandscapesTable(landscapes) // multi-line landscape summary
 */
export function formatLandscapesTable(landscapes: WinterLandscape[]): string {
  if (landscapes.length === 0) return dim('No winter landscapes found')
  const header = heading('Winter Landscape Analysis')
  const rows = landscapes.map(l => formatLandscapeTable(l))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: WinterFrostResult['stats']): string {
  const parts = [
    heading('Winter Frost Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Landscapes:')} ${String(stats.totalLandscapes)}`,
    `${label('Avg Crystal Clarity:')} ${colorScore(stats.avgCrystalClarity)}`,
    `${label('Avg Freeze Resistance:')} ${colorScore(stats.avgFreezeResistance)}`,
    `${label('Avg Ice Structure:')} ${colorScore(stats.avgIceStructure)}`,
    `${label('Avg Snowflake Uniqueness:')} ${colorScore(stats.avgSnowflakeUniqueness)}`,
    `${label('Avg Permafrost Stability:')} ${colorScore(stats.avgPermafrostStability)}`,
    `${label('Ice Palace:')} ${String(stats.icePalaceCount)}`,
    `${label('Frost Garden:')} ${String(stats.frostGardenCount)}`,
    `${label('Proper Frost:')} ${String(stats.properFrostCount)}`,
    `${label('Slush Puddle:')} ${String(stats.slushPuddleCount)}`,
    `${label('Ice Shard:')} ${String(stats.iceShardCount)}`,
    `${label('Dry Ground:')} ${String(stats.dryGroundCount)}`,
    `${label('High Clarity:')} ${String(stats.hasHighClarityCount)}`,
    `${label('High Resistance:')} ${String(stats.hasHighResistanceCount)}`,
    `${label('High Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('High Uniqueness:')} ${String(stats.hasHighUniquenessCount)}`,
    `${label('High Stability:')} ${String(stats.hasHighStabilityCount)}`,
    `${label('Overall Frost:')} ${colorScore(stats.overallFrost)}`,
    `${label('Cryomancer Grade:')} ${colorGrade(stats.cryomancerGrade)}`,
    `${label('Best Crystal:')} ${stats.bestCrystal}`,
    `${label('Clearest:')} ${stats.clearest}`,
    `${label('Most Resistant:')} ${stats.mostResistant}`,
    `${label('Best Structured:')} ${stats.bestStructured}`,
    `${label('Most Unique:')} ${stats.mostUnique}`,
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
export function formatResultTable(result: WinterFrostResult): string {
  const sections = [
    formatCrystalsTable(result.crystals),
    '',
    formatLandscapesTable(result.landscapes),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Tundra')} ${label('Crystalline:')} ${result.tundra.isCrystalline ? high('Yes') : low('No')} ${label('Overall Frost:')} ${colorScore(result.tundra.overallFrost)}`,
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
export function formatResultJson(result: WinterFrostResult): string {
  return JSON.stringify(result, null, 2)
}
