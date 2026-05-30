// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { JadeSeat, JadePalace, JadeThroneResult } from './jade-throne-helpers.js'

// ─── Color Palette (jade throne — imperial green/gold/jade) ───────
const high = chalk.rgb(0, 200, 100)
const midHigh = chalk.rgb(40, 170, 90)
const mid = chalk.rgb(80, 140, 70)
const lowMid = chalk.rgb(110, 115, 60)
const low = chalk.rgb(140, 95, 50)

const best = chalk.rgb(50, 255, 130).bold
const good = chalk.rgb(60, 220, 120)
const okay = chalk.rgb(90, 185, 100)
const poor = chalk.rgb(120, 150, 80)
const worst = chalk.rgb(150, 120, 65)

const heading = chalk.rgb(30, 230, 120).bold
const label = chalk.rgb(60, 210, 110)
const dim = chalk.rgb(100, 185, 95)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // imperial jade green
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
 * colorGrade('imperial-jade') // best (bold jade)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'imperial-jade': best, 'imperial-sage': best, 'divine-mandate': best,
    'master-carver': best, 'flawless-jade': best, 'thousand-year-dynasty': best,
    'forbidden-city': best, 'golden-age': best, 'jade-emperor': best,

    'court-treasure': good, 'court-philosopher': good, 'imperial-decree': good,
    'skilled-artisan': good, 'imperial-green': good, 'century-reign': good,
    'imperial-palace': good, 'prosperous-reign': good, 'court-minister': good,

    'proper-throne': okay, 'proper-scholar': okay, 'proper-authority': okay,
    'proper-craft': okay, 'proper-stone': okay, 'proper-rule': okay,
    'proper-courtyard': okay, 'stable-dynasty': okay,

    'carved-stone': poor, 'learning-student': poor, 'weak-rule': poor,
    'rough-hewn': poor, 'cloudy-jade': poor, 'brief-era': poor,
    'small-temple': poor, 'declining-era': poor, 'apprentice': poor,

    'rough-rock': worst, 'foolish-youth': worst, 'figurehead': worst,
    'crude-chisel': worst, 'cracked-stone': worst, 'passing-moment': worst,
    'humble-abode': worst, 'fallen-ruins': worst, 'novice': worst,

    'dust': worst, 'no-wisdom': worst, 'no-authority': worst,
    'no-craft': worst, 'no-purity': worst, 'no-legacy': worst,
    'no-palace': worst, 'void': worst, 'peasant': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Seat Formatting ──────────────────────────────────────────────

/**
 * Format a single jade seat for display
 * @example
 * formatSeatTable(seat) // colored seat info
 */
export function formatSeatTable(seat: JadeSeat): string {
  const parts = [
    `${label('File:')} ${dim(seat.file)}`,
    `${label('Wisdom Depth:')} ${colorScore(seat.wisdomDepth)} ${colorGrade(seat.knowing.sage)}`,
    `${label('Throne Authority:')} ${colorScore(seat.throneAuthority)} ${colorGrade(seat.commanding.sovereignty)}`,
    `${label('Carving Precision:')} ${colorScore(seat.carvingPrecision)} ${colorGrade(seat.crafting.craftsmanship)}`,
    `${label('Jade Purity:')} ${colorScore(seat.jadePurity)} ${colorGrade(seat.purifying.clarity)}`,
    `${label('Dynasty Endurance:')} ${colorScore(seat.dynastyEndurance)} ${colorGrade(seat.enduring.legacy)}`,
    `${label('Score:')} ${colorScore(seat.qualityScore)} ${colorGrade(seat.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format seats as summary table
 * @example
 * formatSeatsTable(seats) // multi-line table
 */
export function formatSeatsTable(seats: JadeSeat[]): string {
  if (seats.length === 0) return dim('No jade seats found')
  const header = heading('Jade Seat Analysis')
  const rows = seats.map(st => formatSeatTable(st))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Palace Formatting ────────────────────────────────────────────

/**
 * Format a single jade palace for display
 * @example
 * formatPalaceTable(palace) // colored palace info
 */
export function formatPalaceTable(palace: JadePalace): string {
  const parts = [
    `${label('Palace:')} ${dim(palace.directory)}`,
    `${label('Type:')} ${colorGrade(palace.palaceType)}`,
    `${label('Condition:')} ${colorGrade(palace.condition)}`,
    `${label('Seats:')} ${String(palace.seats.length)}`,
    `${label('Avg Wisdom:')} ${colorScore(palace.avgWisdom)}`,
    `${label('Avg Authority:')} ${colorScore(palace.avgAuthority)}`,
    `${label('Avg Purity:')} ${colorScore(palace.avgPurity)}`,
    `${label('Imperial Jade:')} ${String(palace.imperialJadeCount)}`,
    `${label('Dust:')} ${String(palace.dustCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all jade palaces as summary
 * @example
 * formatPalacesTable(palaces) // multi-line summary
 */
export function formatPalacesTable(palaces: JadePalace[]): string {
  if (palaces.length === 0) return dim('No jade palaces found')
  const header = heading('Jade Palaces')
  const rows = palaces.map(p => formatPalaceTable(p))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: JadeThroneResult['stats']): string {
  const parts = [
    heading('Jade Throne Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Palaces:')} ${String(stats.totalPalaces)}`,
    `${label('Avg Wisdom Depth:')} ${colorScore(stats.avgWisdomDepth)}`,
    `${label('Avg Throne Authority:')} ${colorScore(stats.avgThroneAuthority)}`,
    `${label('Avg Carving Precision:')} ${colorScore(stats.avgCarvingPrecision)}`,
    `${label('Avg Jade Purity:')} ${colorScore(stats.avgJadePurity)}`,
    `${label('Avg Dynasty Endurance:')} ${colorScore(stats.avgDynastyEndurance)}`,
    `${label('Imperial Jade:')} ${String(stats.imperialJadeCount)}`,
    `${label('Court Treasure:')} ${String(stats.courtTreasureCount)}`,
    `${label('Proper Throne:')} ${String(stats.properThroneCount)}`,
    `${label('Carved Stone:')} ${String(stats.carvedStoneCount)}`,
    `${label('Rough Rock:')} ${String(stats.roughRockCount)}`,
    `${label('Dust:')} ${String(stats.dustCount)}`,
    `${label('High Wisdom:')} ${String(stats.hasHighWisdomCount)}`,
    `${label('High Authority:')} ${String(stats.hasHighAuthorityCount)}`,
    `${label('High Precision:')} ${String(stats.hasHighPrecisionCount)}`,
    `${label('High Purity:')} ${String(stats.hasHighPurityCount)}`,
    `${label('High Endurance:')} ${String(stats.hasHighEnduranceCount)}`,
    `${label('Overall Sovereignty:')} ${colorScore(stats.overallSovereignty)}`,
    `${label('Emperor Grade:')} ${colorGrade(stats.emperorGrade)}`,
    `${label('Best Seat:')} ${stats.bestSeat}`,
    `${label('Wisest:')} ${stats.wisest}`,
    `${label('Most Authoritative:')} ${stats.mostAuthoritative}`,
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
  const items = recommendations.map(r => `${dim('\uD83D\uDC48')} ${r}`)
  return `${header}\n${items.join('\n')}`
}

// ─── Full Result Formatting ───────────────────────────────────────

/**
 * Format complete result as table
 * @example
 * formatResultTable(result) // full colored output
 */
export function formatResultTable(result: JadeThroneResult): string {
  const sections = [
    formatSeatsTable(result.seats),
    '',
    formatPalacesTable(result.palaces),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Court')} ${label('Imperial:')} ${result.court.isImperial ? high('Yes') : low('No')} ${label('Overall Sovereignty:')} ${colorScore(result.court.overallSovereignty)}`,
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
export function formatResultJson(result: JadeThroneResult): string {
  return JSON.stringify(result, null, 2)
}
