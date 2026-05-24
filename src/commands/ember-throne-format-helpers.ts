// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { EmberSeat, ThroneRoom, EmberThroneResult } from './ember-throne-helpers.js'

// ─── Color Palette (ember throne — amber/orange/coal) ────────────
const high = chalk.rgb(240, 160, 60)
const midHigh = chalk.rgb(225, 145, 50)
const mid = chalk.rgb(210, 130, 40)
const lowMid = chalk.rgb(195, 115, 30)
const low = chalk.rgb(180, 100, 20)

const best = chalk.rgb(255, 180, 80).bold
const good = chalk.rgb(240, 160, 60)
const okay = chalk.rgb(220, 140, 45)
const poor = chalk.rgb(200, 120, 30)
const worst = chalk.rgb(180, 100, 20)

const heading = chalk.rgb(230, 150, 55).bold
const label = chalk.rgb(215, 135, 45)
const dim = chalk.rgb(190, 110, 30)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // amber
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
 * colorGrade('imperial-throne') // best (bold amber)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'golden-throne': best, 'eternal-ember': best, 'phoenix-ash': best,
    'eternal-flame': best, 'perfect-radiator': best, 'imperial-throne': best,
    'grand-hall': best, 'imperial-palace': best, 'emperor': best,

    'iron-seat': good, 'long-burning': good, 'wise-cinders': good,
    'bright-beacon': good, 'even-warmth': good, 'warrior-seat': good,
    'throne-room': good, 'grand-hall': good, 'king': good,

    'proper-throne': okay, 'proper-coal': okay, 'proper-ash': okay,
    'proper-fire': okay, 'proper-distribution': okay, 'proper-chair': okay,
    'proper-chamber': okay, 'decent-room': okay, 'noble': okay,

    'wooden-chair': poor, 'quick-burn': poor, 'unburned-lessons': poor,
    'flickering-candle': poor, 'hot-spots': poor, 'common-stool': poor,
    'small-room': poor, 'humble-chamber': poor, 'knight': poor,

    'wobbly-stool': worst, 'dying-ember': worst, 'wasted-ash': worst,
    'dying-spark': worst, 'cold-corners': worst, 'broken-bench': worst,
    'closet': worst, 'ruined-hall': worst, 'peasant': worst,

    'no-seat': worst, 'cold-ash': worst, 'no-wisdom': worst,
    'no-flame': worst, 'no-heat': worst, 'rubble': worst,
    'no-room': worst, 'void': worst, 'beggar': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Seat Formatting ──────────────────────────────────────────────

/**
 * Format a single seat for display
 * @example
 * formatSeatTable(seat) // colored seat info
 */
export function formatSeatTable(seat: EmberSeat): string {
  const parts = [
    `${label('File:')} ${dim(seat.file)}`,
    `${label('Sovereignty Quality:')} ${colorScore(seat.sovereigntyQuality)} ${colorGrade(seat.reigning.grade)}`,
    `${label('Coal Endurance:')} ${colorScore(seat.coalEndurance)} ${colorGrade(seat.enduring.coal)}`,
    `${label('Ash Wisdom:')} ${colorScore(seat.ashWisdom)} ${colorGrade(seat.learning.ash)}`,
    `${label('Flame Authority:')} ${colorScore(seat.flameAuthority)} ${colorGrade(seat.commanding.flame)}`,
    `${label('Heat Distribution:')} ${colorScore(seat.heatDistribution)} ${colorGrade(seat.distributing.heat)}`,
    `${label('Score:')} ${colorScore(seat.qualityScore)} ${colorGrade(seat.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format seats as summary table
 * @example
 * formatSeatsTable(seats) // multi-line table
 */
export function formatSeatsTable(seats: EmberSeat[]): string {
  if (seats.length === 0) return dim('No ember seats found')
  const header = heading('Ember Throne Analysis')
  const rows = seats.map(s => formatSeatTable(s))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Room Formatting ──────────────────────────────────────────────

/**
 * Format a room for display
 * @example
 * formatRoomTable(room) // colored room info
 */
export function formatRoomTable(room: ThroneRoom): string {
  const parts = [
    `${label('Room:')} ${dim(room.directory)}`,
    `${label('Type:')} ${colorGrade(room.roomType)}`,
    `${label('Condition:')} ${colorGrade(room.condition)}`,
    `${label('Seats:')} ${String(room.seats.length)}`,
    `${label('Avg Sovereignty:')} ${colorScore(room.avgSovereignty)}`,
    `${label('Avg Endurance:')} ${colorScore(room.avgEndurance)}`,
    `${label('Avg Authority:')} ${colorScore(room.avgAuthority)}`,
    `${label('Imperial Thrones:')} ${String(room.imperialThroneCount)}`,
    `${label('Rubble:')} ${String(room.rubbleCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all rooms as summary
 * @example
 * formatRoomsTable(rooms) // multi-line summary
 */
export function formatRoomsTable(rooms: ThroneRoom[]): string {
  if (rooms.length === 0) return dim('No throne rooms found')
  const header = heading('Throne Rooms')
  const rows = rooms.map(r => formatRoomTable(r))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: EmberThroneResult['stats']): string {
  const parts = [
    heading('Ember Throne Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Rooms:')} ${String(stats.totalRooms)}`,
    `${label('Avg Sovereignty Quality:')} ${colorScore(stats.avgSovereigntyQuality)}`,
    `${label('Avg Coal Endurance:')} ${colorScore(stats.avgCoalEndurance)}`,
    `${label('Avg Ash Wisdom:')} ${colorScore(stats.avgAshWisdom)}`,
    `${label('Avg Flame Authority:')} ${colorScore(stats.avgFlameAuthority)}`,
    `${label('Avg Heat Distribution:')} ${colorScore(stats.avgHeatDistribution)}`,
    `${label('Imperial Throne:')} ${String(stats.imperialThroneCount)}`,
    `${label('Warrior Seat:')} ${String(stats.warriorSeatCount)}`,
    `${label('Proper Chair:')} ${String(stats.properChairCount)}`,
    `${label('Common Stool:')} ${String(stats.commonStoolCount)}`,
    `${label('Broken Bench:')} ${String(stats.brokenBenchCount)}`,
    `${label('Rubble:')} ${String(stats.rubbleCount)}`,
    `${label('High Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('High Endurance:')} ${String(stats.hasHighEnduranceCount)}`,
    `${label('High Wisdom:')} ${String(stats.hasHighWisdomCount)}`,
    `${label('High Authority:')} ${String(stats.hasHighAuthorityCount)}`,
    `${label('High Distribution:')} ${String(stats.hasHighDistributionCount)}`,
    `${label('Overall Majesty:')} ${colorScore(stats.overallMajesty)}`,
    `${label('Ruler Grade:')} ${colorGrade(stats.rulerGrade)}`,
    `${label('Best Seat:')} ${stats.bestSeat}`,
    `${label('Most Sovereign:')} ${stats.mostSovereign}`,
    `${label('Most Enduring:')} ${stats.mostEnduring}`,
    `${label('Wisest:')} ${stats.wisest}`,
    `${label('Most Authoritative:')} ${stats.mostAuthoritative}`,
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
export function formatResultTable(result: EmberThroneResult): string {
  const sections = [
    formatSeatsTable(result.seats),
    '',
    formatRoomsTable(result.rooms),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Kingdom')} ${label('Imperial:')} ${result.kingdom.isImperial ? high('Yes') : low('No')} ${label('Overall Majesty:')} ${colorScore(result.kingdom.overallMajesty)}`,
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
export function formatResultJson(result: EmberThroneResult): string {
  return JSON.stringify(result, null, 2)
}
