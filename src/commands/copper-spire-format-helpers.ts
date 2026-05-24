// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { CopperShingle, SpireTower, CopperSpireResult } from './copper-spire-helpers.js'

// ─── Color Palette (copper spire — warm copper/bronze/amber) ───────
const high = chalk.rgb(220, 160, 80)
const midHigh = chalk.rgb(195, 140, 70)
const mid = chalk.rgb(170, 120, 60)
const lowMid = chalk.rgb(145, 100, 50)
const low = chalk.rgb(120, 80, 40)

const best = chalk.rgb(240, 180, 90).bold
const good = chalk.rgb(215, 155, 75)
const okay = chalk.rgb(190, 130, 60)
const poor = chalk.rgb(160, 105, 50)
const worst = chalk.rgb(130, 85, 40)

const heading = chalk.rgb(230, 170, 85).bold
const label = chalk.rgb(200, 145, 70)
const dim = chalk.rgb(165, 120, 60)

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
 * colorGrade('cathedral-spire') // best (bold copper)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'ancient-patina': best, 'superconductor': best, 'stunning-patina': best,
    'bronze-masterpiece': best, 'century-tower': best, 'cathedral-spire': best,
    'grand-cathedral': best, 'magnificent-spire': best, 'master-architect': best,

    'aged-beauty': good, 'high-conductivity': good, 'beautiful-green': good,
    'strong-alloy': good, 'solid-foundation': good, 'patina-tower': good,
    'copper-tower': good, 'beautiful-tower': good, 'tower-builder': good,

    'proper-aging': okay, 'proper-flow': okay, 'proper-color': okay,
    'proper-mix': okay, 'proper-base': okay, 'proper-spire': okay,
    'proper-spire': okay, 'decent-steeple': okay, 'skilled-craftsman': okay,

    'premature-wear': poor, 'resistive-wire': poor, 'patchy-surface': poor,
    'weak-bond': poor, 'shaky-ground': poor, 'rusty-pole': poor,
    'small-steeple': poor, 'weathered-pole': poor, 'apprentice': poor,

    'fresh-copper': worst, 'insulated': worst, 'tarnished': worst,
    'brittle-composite': worst, 'sinking-foundation': worst, 'corroded-wire': worst,
    'weather-vane': worst, 'fallen-spire': worst, 'novice': worst,

    'no-patina': worst, 'no-conductivity': worst, 'no-beauty': worst,
    'no-alloy': worst, 'no-stability': worst, 'scrap': worst,
    'no-tower': worst, 'void': worst, 'scrap-dealer': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Shingle Formatting ───────────────────────────────────────────

/**
 * Format a single copper shingle for display
 * @example
 * formatShingleTable(shingle) // colored shingle info
 */
export function formatShingleTable(shingle: CopperShingle): string {
  const parts = [
    `${label('File:')} ${dim(shingle.file)}`,
    `${label('Patina Wisdom:')} ${colorScore(shingle.patinaWisdom)} ${colorGrade(shingle.aging.grade)}`,
    `${label('Conductivity Quality:')} ${colorScore(shingle.conductivityQuality)} ${colorGrade(shingle.conducting.conductivity)}`,
    `${label('Verdigris Beauty:')} ${colorScore(shingle.verdigrisBeauty)} ${colorGrade(shingle.beautifying.verdigris)}`,
    `${label('Alloy Resilience:')} ${colorScore(shingle.alloyResilience)} ${colorGrade(shingle.alloying.alloy)}`,
    `${label('Tower Stability:')} ${colorScore(shingle.towerStability)} ${colorGrade(shingle.stabilizing.tower)}`,
    `${label('Score:')} ${colorScore(shingle.qualityScore)} ${colorGrade(shingle.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format shingles as summary table
 * @example
 * formatShinglesTable(shingles) // multi-line table
 */
export function formatShinglesTable(shingles: CopperShingle[]): string {
  if (shingles.length === 0) return dim('No copper shingles found')
  const header = heading('Copper Spire Analysis')
  const rows = shingles.map(sh => formatShingleTable(sh))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Tower Formatting ─────────────────────────────────────────────

/**
 * Format a single spire tower for display
 * @example
 * formatTowerTable(tower) // colored tower info
 */
export function formatTowerTable(tower: SpireTower): string {
  const parts = [
    `${label('Tower:')} ${dim(tower.directory)}`,
    `${label('Type:')} ${colorGrade(tower.towerType)}`,
    `${label('Condition:')} ${colorGrade(tower.condition)}`,
    `${label('Shingles:')} ${String(tower.shingles.length)}`,
    `${label('Avg Wisdom:')} ${colorScore(tower.avgWisdom)}`,
    `${label('Avg Conductivity:')} ${colorScore(tower.avgConductivity)}`,
    `${label('Avg Stability:')} ${colorScore(tower.avgStability)}`,
    `${label('Cathedral Spires:')} ${String(tower.cathedralSpireCount)}`,
    `${label('Scrap:')} ${String(tower.scrapCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all spire towers as summary
 * @example
 * formatTowersTable(towers) // multi-line summary
 */
export function formatTowersTable(towers: SpireTower[]): string {
  if (towers.length === 0) return dim('No spire towers found')
  const header = heading('Spire Towers')
  const rows = towers.map(t => formatTowerTable(t))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: CopperSpireResult['stats']): string {
  const parts = [
    heading('Copper Spire Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Towers:')} ${String(stats.totalTowers)}`,
    `${label('Avg Patina Wisdom:')} ${colorScore(stats.avgPatinaWisdom)}`,
    `${label('Avg Conductivity Quality:')} ${colorScore(stats.avgConductivityQuality)}`,
    `${label('Avg Verdigris Beauty:')} ${colorScore(stats.avgVerdigrisBeauty)}`,
    `${label('Avg Alloy Resilience:')} ${colorScore(stats.avgAlloyResilience)}`,
    `${label('Avg Tower Stability:')} ${colorScore(stats.avgTowerStability)}`,
    `${label('Cathedral Spire:')} ${String(stats.cathedralSpireCount)}`,
    `${label('Patina Tower:')} ${String(stats.patinaTowerCount)}`,
    `${label('Proper Spire:')} ${String(stats.properSpireCount)}`,
    `${label('Rusty Pole:')} ${String(stats.rustyPoleCount)}`,
    `${label('Corroded Wire:')} ${String(stats.corrodedWireCount)}`,
    `${label('Scrap:')} ${String(stats.scrapCount)}`,
    `${label('High Wisdom:')} ${String(stats.hasHighWisdomCount)}`,
    `${label('High Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('High Beauty:')} ${String(stats.hasHighBeautyCount)}`,
    `${label('High Resilience:')} ${String(stats.hasHighResilienceCount)}`,
    `${label('High Stability:')} ${String(stats.hasHighStabilityCount)}`,
    `${label('Overall Elegance:')} ${colorScore(stats.overallElegance)}`,
    `${label('Architect Grade:')} ${colorGrade(stats.architectGrade)}`,
    `${label('Best Shingle:')} ${stats.bestShingle}`,
    `${label('Wisest:')} ${stats.wisest}`,
    `${label('Best Conductor:')} ${stats.bestConductor}`,
    `${label('Most Beautiful:')} ${stats.mostBeautiful}`,
    `${label('Most Stable:')} ${stats.mostStable}`,
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
  const items = recommendations.map(r => `${dim('\u25C6')} ${r}`)
  return `${header}\n${items.join('\n')}`
}

// ─── Full Result Formatting ───────────────────────────────────────

/**
 * Format complete result as table
 * @example
 * formatResultTable(result) // full colored output
 */
export function formatResultTable(result: CopperSpireResult): string {
  const sections = [
    formatShinglesTable(result.shingles),
    '',
    formatTowersTable(result.towers),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Skyline')} ${label('Magnificent:')} ${result.skyline.isMagnificent ? high('Yes') : low('No')} ${label('Overall Elegance:')} ${colorScore(result.skyline.overallElegance)}`,
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
export function formatResultJson(result: CopperSpireResult): string {
  return JSON.stringify(result, null, 2)
}
