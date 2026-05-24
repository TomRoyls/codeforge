// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { IceCrystal, GlacierHall, FrostSanctuaryResult } from './frost-sanctuary-helpers.js'

// ─── Color Palette (frost sanctuary — ice/blue/white) ──────────────
const high = chalk.rgb(173, 216, 255)
const midHigh = chalk.rgb(140, 190, 255)
const mid = chalk.rgb(110, 170, 240)
const lowMid = chalk.rgb(90, 140, 210)
const low = chalk.rgb(70, 110, 180)

const best = chalk.rgb(200, 230, 255).bold
const good = chalk.rgb(160, 200, 255)
const okay = chalk.rgb(130, 175, 240)
const poor = chalk.rgb(100, 145, 210)
const worst = chalk.rgb(80, 115, 180)

const heading = chalk.rgb(190, 225, 255).bold
const label = chalk.rgb(150, 195, 255)
const dim = chalk.rgb(120, 160, 210)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // bright ice blue
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
 * colorGrade('frost-masterpiece') // best (bold ice)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'eternal-ice': best, 'crystal-clear': best, 'bedrock-solid': best,
    'arctic-survivor': best, 'northern-lights': best, 'frost-masterpiece': best,
    'ice-cathedral': best, 'eternal-sanctuary': best, 'frost-guardian': best,

    'well-preserved': good, 'transparent-ice': good, 'deep-permafrost': good,
    'frost-hardened': good, 'aurora-borealis': good, 'glacier-hall': good,
    'frost-palace': good, 'ice-keeper': good,

    'proper-crystal': okay, 'proper-clarity': okay, 'proper-foundation': okay,
    'proper-endurance': okay, 'proper-glow': okay, 'proper-glacier': okay,
    'decent-shelter': okay, 'proper-cave': okay, 'skilled-steward': okay,

    'melting-ice': poor, 'cloudy-ice': poor, 'shifting-ground': poor,
    'cold-sensitive': poor, 'dim-light': poor, 'ice-shelter': poor,
    'melting-cave': poor, 'snow-drift': poor, 'apprentice': poor,

    'thawed-water': worst, 'frozen-mud': worst, 'thawing-permafrost': worst,
    'frostbitten': worst, 'gray-sky': worst, 'slush': worst,
    'slush-pit': worst, 'no-hall': worst, 'novice': worst,

    'no-preservation': worst, 'opaque': worst, 'no-stability': worst,
    'no-endurance': worst, 'no-aurora': worst, 'puddle': worst,
    'void': worst, 'thawer': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Crystal Formatting ────────────────────────────────────────────

/**
 * Format a single crystal for display
 * @example
 * formatCrystalTable(crystal) // colored crystal info
 */
export function formatCrystalTable(crystal: IceCrystal): string {
  const parts = [
    `${label('File:')} ${dim(crystal.file)}`,
    `${label('Crystal Preservation:')} ${colorScore(crystal.crystalPreservation)} ${colorGrade(crystal.preserving.grade)}`,
    `${label('Ice Clarity:')} ${colorScore(crystal.iceClarity)} ${colorGrade(crystal.clarifying.ice)}`,
    `${label('Permafrost Stability:')} ${colorScore(crystal.permafrostStability)} ${colorGrade(crystal.stabilizing.permafrost)}`,
    `${label('Frost Resilience:')} ${colorScore(crystal.frostResilience)} ${colorGrade(crystal.enduring.frost)}`,
    `${label('Aurora Beauty:')} ${colorScore(crystal.auroraBeauty)} ${colorGrade(crystal.beautifying.aurora)}`,
    `${label('Score:')} ${colorScore(crystal.qualityScore)} ${colorGrade(crystal.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format crystals as summary table
 * @example
 * formatCrystalsTable(crystals) // multi-line table
 */
export function formatCrystalsTable(crystals: IceCrystal[]): string {
  if (crystals.length === 0) return dim('No ice crystals found')
  const header = heading('Frost Sanctuary Analysis')
  const rows = crystals.map(c => formatCrystalTable(c))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Hall Formatting ───────────────────────────────────────────────

/**
 * Format a single hall for display
 * @example
 * formatHallTable(hall) // colored hall info
 */
export function formatHallTable(hall: GlacierHall): string {
  const parts = [
    `${label('Hall:')} ${dim(hall.directory)}`,
    `${label('Type:')} ${colorGrade(hall.hallType)}`,
    `${label('Condition:')} ${colorGrade(hall.condition)}`,
    `${label('Crystals:')} ${String(hall.crystals.length)}`,
    `${label('Avg Preservation:')} ${colorScore(hall.avgPreservation)}`,
    `${label('Avg Clarity:')} ${colorScore(hall.avgClarity)}`,
    `${label('Avg Stability:')} ${colorScore(hall.avgStability)}`,
    `${label('Frost Masterpieces:')} ${String(hall.frostMasterpieceCount)}`,
    `${label('Puddles:')} ${String(hall.puddleCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all halls as summary
 * @example
 * formatHallsTable(halls) // multi-line summary
 */
export function formatHallsTable(halls: GlacierHall[]): string {
  if (halls.length === 0) return dim('No glacier halls found')
  const header = heading('Glacier Halls')
  const rows = halls.map(h => formatHallTable(h))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ──────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: FrostSanctuaryResult['stats']): string {
  const parts = [
    heading('Frost Sanctuary Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Halls:')} ${String(stats.totalHalls)}`,
    `${label('Avg Crystal Preservation:')} ${colorScore(stats.avgCrystalPreservation)}`,
    `${label('Avg Ice Clarity:')} ${colorScore(stats.avgIceClarity)}`,
    `${label('Avg Permafrost Stability:')} ${colorScore(stats.avgPermafrostStability)}`,
    `${label('Avg Frost Resilience:')} ${colorScore(stats.avgFrostResilience)}`,
    `${label('Avg Aurora Beauty:')} ${colorScore(stats.avgAuroraBeauty)}`,
    `${label('Frost Masterpiece:')} ${String(stats.frostMasterpieceCount)}`,
    `${label('Ice Cathedral:')} ${String(stats.iceCathedralCount)}`,
    `${label('Proper Glacier:')} ${String(stats.properGlacierCount)}`,
    `${label('Melting Ice:')} ${String(stats.meltingIceCount)}`,
    `${label('Slush:')} ${String(stats.slushCount)}`,
    `${label('Puddle:')} ${String(stats.puddleCount)}`,
    `${label('High Preservation:')} ${String(stats.hasHighPreservationCount)}`,
    `${label('High Clarity:')} ${String(stats.hasHighClarityCount)}`,
    `${label('High Stability:')} ${String(stats.hasHighStabilityCount)}`,
    `${label('High Resilience:')} ${String(stats.hasHighResilienceCount)}`,
    `${label('High Beauty:')} ${String(stats.hasHighBeautyCount)}`,
    `${label('Overall Frost:')} ${colorScore(stats.overallFrost)}`,
    `${label('Guardian Grade:')} ${colorGrade(stats.guardianGrade)}`,
    `${label('Best Crystal:')} ${stats.bestCrystal}`,
    `${label('Best Preserved:')} ${stats.bestPreserved}`,
    `${label('Clearest:')} ${stats.clearest}`,
    `${label('Most Stable:')} ${stats.mostStable}`,
    `${label('Most Beautiful:')} ${stats.mostBeautiful}`,
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
  const items = recommendations.map(r => `${dim('\u2744')} ${r}`)
  return `${header}\n${items.join('\n')}`
}

// ─── Full Result Formatting ────────────────────────────────────────

/**
 * Format complete result as table
 * @example
 * formatResultTable(result) // full colored output
 */
export function formatResultTable(result: FrostSanctuaryResult): string {
  const sections = [
    formatCrystalsTable(result.crystals),
    '',
    formatHallsTable(result.halls),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Arctic')} ${label('Frozen:')} ${result.arctic.isFrozen ? high('Yes') : low('No')} ${label('Overall Frost:')} ${colorScore(result.arctic.overallFrost)}`,
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
export function formatResultJson(result: FrostSanctuaryResult): string {
  return JSON.stringify(result, null, 2)
}
