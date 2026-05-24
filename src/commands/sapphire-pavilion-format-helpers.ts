// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { SapphirePillar, PavilionGround, SapphirePavilionResult } from './sapphire-pavilion-helpers.js'

// ─── Color Palette (sapphire pavilion — deep blue/silver/gold) ─────
const high = chalk.rgb(100, 140, 220)
const midHigh = chalk.rgb(85, 120, 200)
const mid = chalk.rgb(70, 100, 180)
const lowMid = chalk.rgb(55, 85, 160)
const low = chalk.rgb(40, 70, 140)

const best = chalk.rgb(140, 180, 255).bold
const good = chalk.rgb(115, 155, 235)
const okay = chalk.rgb(90, 130, 215)
const poor = chalk.rgb(70, 110, 195)
const worst = chalk.rgb(55, 90, 170)

const heading = chalk.rgb(130, 170, 250).bold
const label = chalk.rgb(105, 145, 230)
const dim = chalk.rgb(80, 120, 210)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // deep blue
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
 * colorGrade('sapphire-masterpiece') // best (bold blue)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'flawless-sapphire': best, 'diamond-pillar': best, 'impervious-dome': best,
    'grand-reception': best, 'bedrock-deep': best, 'sapphire-masterpiece': best,
    'palace-gardens': best, 'magnificent-pavilion': best, 'master-steward': best,

    'clear-gem': good, 'strong-column': good, 'strong-canopy': good,
    'beautiful-entrance': good, 'solid-foundation': good, 'gem-pavilion': good,
    'gem-grounds': good, 'beautiful-hall': good, 'palace-curator': good,

    'proper-transparency': okay, 'proper-support': okay, 'proper-roof': okay,
    'proper-lobby': okay, 'proper-base': okay, 'proper-hall': okay,
    'proper-courtyard': okay, 'decent-building': okay, 'skilled-keeper': okay,

    'cloudy-stone': poor, 'weak-beam': poor, 'leaky-roof': poor,
    'crude-door': poor, 'shallow-footing': poor, 'stone-building': poor,
    'small-yard': poor, 'modest-structure': poor, 'apprentice': poor,

    'opaque-rock': worst, 'crumbling-pillar': worst, 'no-shelter': worst,
    'hostile-entrance': worst, 'surface-slab': worst, 'wooden-hut': worst,
    'dirt-patch': worst, 'ruin': worst, 'novice': worst,

    'no-clarity': worst, 'no-support': worst, 'no-roof': worst,
    'no-entrance': worst, 'no-foundation': worst, 'ruins': worst,
    'no-ground': worst, 'void': worst, 'squatter': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Pillar Formatting ─────────────────────────────────────────────

/**
 * Format a single sapphire pillar for display
 * @example
 * formatPillarTable(pillar) // colored pillar info
 */
export function formatPillarTable(pillar: SapphirePillar): string {
  const parts = [
    `${label('File:')} ${dim(pillar.file)}`,
    `${label('Gem Clarity:')} ${colorScore(pillar.gemClarity)} ${colorGrade(pillar.clarifying.grade)}`,
    `${label('Pillar Strength:')} ${colorScore(pillar.pillarStrength)} ${colorGrade(pillar.bearing.pillar)}`,
    `${label('Roof Protection:')} ${colorScore(pillar.roofProtection)} ${colorGrade(pillar.shielding.roof)}`,
    `${label('Hall Elegance:')} ${colorScore(pillar.hallElegance)} ${colorGrade(pillar.welcoming.hall)}`,
    `${label('Foundation Depth:')} ${colorScore(pillar.foundationDepth)} ${colorGrade(pillar.grounding.foundation)}`,
    `${label('Score:')} ${colorScore(pillar.qualityScore)} ${colorGrade(pillar.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format pillars as summary table
 * @example
 * formatPillarsTable(pillars) // multi-line table
 */
export function formatPillarsTable(pillars: SapphirePillar[]): string {
  if (pillars.length === 0) return dim('No sapphire pillars found')
  const header = heading('Sapphire Pavilion Analysis')
  const rows = pillars.map(p => formatPillarTable(p))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Ground Formatting ─────────────────────────────────────────────

/**
 * Format a single pavilion ground for display
 * @example
 * formatGroundTable(ground) // colored ground info
 */
export function formatGroundTable(ground: PavilionGround): string {
  const parts = [
    `${label('Ground:')} ${dim(ground.directory)}`,
    `${label('Type:')} ${colorGrade(ground.groundType)}`,
    `${label('Condition:')} ${colorGrade(ground.condition)}`,
    `${label('Pillars:')} ${String(ground.pillars.length)}`,
    `${label('Avg Clarity:')} ${colorScore(ground.avgClarity)}`,
    `${label('Avg Strength:')} ${colorScore(ground.avgStrength)}`,
    `${label('Avg Depth:')} ${colorScore(ground.avgDepth)}`,
    `${label('Masterpieces:')} ${String(ground.sapphireMasterpieceCount)}`,
    `${label('Ruins:')} ${String(ground.ruinsCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all pavilion grounds as summary
 * @example
 * formatGroundsTable(grounds) // multi-line summary
 */
export function formatGroundsTable(grounds: PavilionGround[]): string {
  if (grounds.length === 0) return dim('No pavilion grounds found')
  const header = heading('Pavilion Grounds')
  const rows = grounds.map(g => formatGroundTable(g))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: SapphirePavilionResult['stats']): string {
  const parts = [
    heading('Sapphire Pavilion Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Grounds:')} ${String(stats.totalGrounds)}`,
    `${label('Avg Gem Clarity:')} ${colorScore(stats.avgGemClarity)}`,
    `${label('Avg Pillar Strength:')} ${colorScore(stats.avgPillarStrength)}`,
    `${label('Avg Roof Protection:')} ${colorScore(stats.avgRoofProtection)}`,
    `${label('Avg Hall Elegance:')} ${colorScore(stats.avgHallElegance)}`,
    `${label('Avg Foundation Depth:')} ${colorScore(stats.avgFoundationDepth)}`,
    `${label('Sapphire Masterpiece:')} ${String(stats.sapphireMasterpieceCount)}`,
    `${label('Gem Pavilion:')} ${String(stats.gemPavilionCount)}`,
    `${label('Proper Hall:')} ${String(stats.properHallCount)}`,
    `${label('Stone Building:')} ${String(stats.stoneBuildingCount)}`,
    `${label('Wooden Hut:')} ${String(stats.woodenHutCount)}`,
    `${label('Ruins:')} ${String(stats.ruinsCount)}`,
    `${label('High Clarity:')} ${String(stats.hasHighClarityCount)}`,
    `${label('High Strength:')} ${String(stats.hasHighStrengthCount)}`,
    `${label('High Protection:')} ${String(stats.hasHighProtectionCount)}`,
    `${label('High Elegance:')} ${String(stats.hasHighEleganceCount)}`,
    `${label('High Depth:')} ${String(stats.hasHighDepthCount)}`,
    `${label('Overall Grandeur:')} ${colorScore(stats.overallGrandeur)}`,
    `${label('Steward Grade:')} ${colorGrade(stats.stewardGrade)}`,
    `${label('Best Pillar:')} ${stats.bestPillar}`,
    `${label('Clearest:')} ${stats.clearest}`,
    `${label('Strongest:')} ${stats.strongest}`,
    `${label('Most Protected:')} ${stats.mostProtected}`,
    `${label('Deepest:')} ${stats.deepest}`,
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
  const items = recommendations.map(r => `${dim('\u{1F48E}')} ${r}`)
  return `${header}\n${items.join('\n')}`
}

// ─── Full Result Formatting ───────────────────────────────────────

/**
 * Format complete result as table
 * @example
 * formatResultTable(result) // full colored output
 */
export function formatResultTable(result: SapphirePavilionResult): string {
  const sections = [
    formatPillarsTable(result.pillars),
    '',
    formatGroundsTable(result.grounds),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Estate')} ${label('Magnificent:')} ${result.estate.isMagnificent ? high('Yes') : low('No')} ${label('Overall Grandeur:')} ${colorScore(result.estate.overallGrandeur)}`,
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
export function formatResultJson(result: SapphirePavilionResult): string {
  return JSON.stringify(result, null, 2)
}
