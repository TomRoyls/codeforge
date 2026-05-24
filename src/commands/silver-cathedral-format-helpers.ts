// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { SilverPillar, SilverNave, SilverCathedralResult } from './silver-cathedral-helpers.js'

// ─── Color Palette (silver cathedral — moonlight/silver/candlelight) ─
const high = chalk.rgb(200, 210, 230)
const midHigh = chalk.rgb(175, 185, 210)
const mid = chalk.rgb(150, 160, 185)
const lowMid = chalk.rgb(125, 130, 155)
const low = chalk.rgb(100, 105, 130)

const best = chalk.rgb(230, 235, 255).bold
const good = chalk.rgb(210, 215, 240)
const okay = chalk.rgb(185, 190, 215)
const poor = chalk.rgb(155, 160, 180)
const worst = chalk.rgb(125, 130, 150)

const heading = chalk.rgb(220, 225, 250).bold
const label = chalk.rgb(200, 205, 235)
const dim = chalk.rgb(170, 175, 200)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // silver moonlight
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
 * colorGrade('holy-relic') // best (bold silver)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'full-moon': best, 'flying-buttress': best, 'crystal-chime': best,
    'master-tempered': best, 'eternal-flame': best, 'holy-relic': best,
    'grand-cathedral': best, 'sacred-ground': best, 'archbishop': best,

    'bright-crescent': good, 'gothic-arch': good, 'clear-bell': good,
    'well-forged': good, 'bright-candle': good, 'blessed-silver': good,
    'proper-church': good, 'blessed-hall': good, 'bishop': good,

    'proper-glow': okay, 'proper-vault': okay, 'proper-ring': okay,
    'proper-alloy': okay, 'proper-light': okay, 'proper-shrine': okay,
    'small-chapel': okay, 'proper-sanctuary': okay, 'abbot': okay,

    'clouded-moon': poor, 'flat-ceiling': poor, 'muffled-tone': poor,
    'brittle-silver': poor, 'flickering-wick': poor, 'tarnished-altar': poor,
    'wayside-shrine': poor, 'secular-building': poor, 'prior': poor,

    'dark-night': worst, 'collapsing-roof': worst, 'cracked-bell': worst,
    'bendy-wire': worst, 'burnt-out': worst, 'rusted-iron': worst,
    'ruined-abbey': worst, 'abandoned-ruin': worst, 'novice': worst,

    'no-light': worst, 'no-structure': worst, 'no-sound': worst,
    'no-strength': worst, 'no-candle': worst, 'dust': worst,
    'no-nave': worst, 'void': worst, 'pilgrim': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Pillar Formatting ────────────────────────────────────────────

/**
 * Format a single silver pillar for display
 * @example
 * formatPillarTable(pillar) // colored pillar info
 */
export function formatPillarTable(pillar: SilverPillar): string {
  const parts = [
    `${label('File:')} ${dim(pillar.file)}`,
    `${label('Lunar Purity:')} ${colorScore(pillar.lunarPurity)} ${colorGrade(pillar.purifying.moon)}`,
    `${label('Vault Architecture:')} ${colorScore(pillar.vaultArchitecture)} ${colorGrade(pillar.architecting.vault)}`,
    `${label('Bell Clarity:')} ${colorScore(pillar.bellClarity)} ${colorGrade(pillar.resonating.bell)}`,
    `${label('Silver Strength:')} ${colorScore(pillar.silverStrength)} ${colorGrade(pillar.tempering.temper)}`,
    `${label('Candle Wisdom:')} ${colorScore(pillar.candleWisdom)} ${colorGrade(pillar.illuminating.candle)}`,
    `${label('Score:')} ${colorScore(pillar.qualityScore)} ${colorGrade(pillar.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format pillars as summary table
 * @example
 * formatPillarsTable(pillars) // multi-line table
 */
export function formatPillarsTable(pillars: SilverPillar[]): string {
  if (pillars.length === 0) return dim('No silver pillars found')
  const header = heading('Silver Pillar Analysis')
  const rows = pillars.map(p => formatPillarTable(p))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Nave Formatting ──────────────────────────────────────────────

/**
 * Format a single silver nave for display
 * @example
 * formatNaveTable(nave) // colored nave info
 */
export function formatNaveTable(nave: SilverNave): string {
  const parts = [
    `${label('Nave:')} ${dim(nave.directory)}`,
    `${label('Type:')} ${colorGrade(nave.naveType)}`,
    `${label('Condition:')} ${colorGrade(nave.condition)}`,
    `${label('Pillars:')} ${String(nave.pillars.length)}`,
    `${label('Avg Purity:')} ${colorScore(nave.avgPurity)}`,
    `${label('Avg Architecture:')} ${colorScore(nave.avgArchitecture)}`,
    `${label('Avg Wisdom:')} ${colorScore(nave.avgWisdom)}`,
    `${label('Holy Relics:')} ${String(nave.holyRelicCount)}`,
    `${label('Dust:')} ${String(nave.dustCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all silver naves as summary
 * @example
 * formatNavesTable(naves) // multi-line summary
 */
export function formatNavesTable(naves: SilverNave[]): string {
  if (naves.length === 0) return dim('No silver naves found')
  const header = heading('Silver Naves')
  const rows = naves.map(n => formatNaveTable(n))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: SilverCathedralResult['stats']): string {
  const parts = [
    heading('Silver Cathedral Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Naves:')} ${String(stats.totalNaves)}`,
    `${label('Avg Lunar Purity:')} ${colorScore(stats.avgLunarPurity)}`,
    `${label('Avg Vault Architecture:')} ${colorScore(stats.avgVaultArchitecture)}`,
    `${label('Avg Bell Clarity:')} ${colorScore(stats.avgBellClarity)}`,
    `${label('Avg Silver Strength:')} ${colorScore(stats.avgSilverStrength)}`,
    `${label('Avg Candle Wisdom:')} ${colorScore(stats.avgCandleWisdom)}`,
    `${label('Holy Relic:')} ${String(stats.holyRelicCount)}`,
    `${label('Blessed Silver:')} ${String(stats.blessedSilverCount)}`,
    `${label('Proper Shrine:')} ${String(stats.properShrineCount)}`,
    `${label('Tarnished Altar:')} ${String(stats.tarnishedAltarCount)}`,
    `${label('Rusted Iron:')} ${String(stats.rustedIronCount)}`,
    `${label('Dust:')} ${String(stats.dustCount)}`,
    `${label('High Purity:')} ${String(stats.hasHighPurityCount)}`,
    `${label('High Architecture:')} ${String(stats.hasHighArchitectureCount)}`,
    `${label('High Clarity:')} ${String(stats.hasHighClarityCount)}`,
    `${label('High Strength:')} ${String(stats.hasHighStrengthCount)}`,
    `${label('High Wisdom:')} ${String(stats.hasHighWisdomCount)}`,
    `${label('Overall Holiness:')} ${colorScore(stats.overallHoliness)}`,
    `${label('Bishop Grade:')} ${colorGrade(stats.bishopGrade)}`,
    `${label('Best Pillar:')} ${stats.bestPillar}`,
    `${label('Purest:')} ${stats.purest}`,
    `${label('Best Architecture:')} ${stats.bestArchitecture}`,
    `${label('Clearest:')} ${stats.clearest}`,
    `${label('Wisest:')} ${stats.wisest}`,
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
  const items = recommendations.map(r => `${dim('\uD83D\uDD6F')} ${r}`)
  return `${header}\n${items.join('\n')}`
}

// ─── Full Result Formatting ───────────────────────────────────────

/**
 * Format complete result as table
 * @example
 * formatResultTable(result) // full colored output
 */
export function formatResultTable(result: SilverCathedralResult): string {
  const sections = [
    formatPillarsTable(result.pillars),
    '',
    formatNavesTable(result.naves),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Diocese')} ${label('Sacred:')} ${result.diocese.isSacred ? high('Yes') : low('No')} ${label('Overall Holiness:')} ${colorScore(result.diocese.overallHoliness)}`,
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
export function formatResultJson(result: SilverCathedralResult): string {
  return JSON.stringify(result, null, 2)
}
