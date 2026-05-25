import chalk from 'chalk'

import type { CourtCondition, SeatCondition, EmeraldSeat, EmeraldCourt, EmeraldThroneStats, EmeraldThroneResult } from './emerald-throne-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(80, 200, 120)(String(score))
  if (score >= 75) return chalk.rgb(50, 205, 50)(String(score))
  if (score >= 60) return chalk.green(String(score))
  if (score >= 40) return chalk.rgb(34, 139, 34)(String(score))
  if (score >= 20) return chalk.rgb(0, 128, 0)(String(score))
  return chalk.gray(String(score))
}

/** @example colorCondition('emerald-masterpiece') */
export function colorCondition(condition: SeatCondition | string): string {
  switch (condition) {
    case 'emerald-masterpiece':
      return chalk.rgb(80, 200, 120)('emerald-masterpiece')
    case 'royal-throne':
      return chalk.rgb(50, 205, 50)('royal-throne')
    case 'proper-seat':
      return chalk.green('proper-seat')
    case 'wooden-chair':
      return chalk.rgb(34, 139, 34)('wooden-chair')
    case 'broken-stool':
      return chalk.rgb(0, 128, 0)('broken-stool')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorCourtCondition('emerald-palace') */
export function colorCourtCondition(condition: CourtCondition | string): string {
  switch (condition) {
    case 'emerald-palace':
      return chalk.rgb(80, 200, 120)('emerald-palace')
    case 'royal-court':
      return chalk.rgb(50, 205, 50)('royal-court')
    case 'proper-hall':
      return chalk.green('proper-hall')
    case 'modest-room':
      return chalk.rgb(34, 139, 34)('modest-room')
    case 'ruined-keep':
      return chalk.rgb(0, 128, 0)('ruined-keep')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

// ─── Table formatting ───────────────────────────────────

function padRight(str: string, len: number): string {
  if (str.length >= len) return str
  return str + ' '.repeat(len - str.length)
}

function padLeft(str: string, len: number): string {
  if (str.length >= len) return str
  return ' '.repeat(len - str.length) + str
}

/** @example formatSeatTable(seat) */
export function formatSeatTable(seat: EmeraldSeat): string {
  const lines: string[] = [
    chalk.bold(`Emerald Seat: ${seat.file}`),
    '',
    `  Gem Authority:      ${colorScore(seat.gemAuthority)}  ${chalk.dim(`(${seat.ruling.throne})`)}`,
    `  Throne Wisdom:      ${colorScore(seat.throneWisdom)}  ${chalk.dim(`(${seat.judging.court})`)}`,
    `  Crown Precision:    ${colorScore(seat.crownPrecision)}  ${chalk.dim(`(${seat.crowning.crown})`)}`,
    `  Scepter Resilience: ${colorScore(seat.scepterResilience)}  ${chalk.dim(`(${seat.wielding.scepter})`)}`,
    `  Dynasty Endurance:  ${colorScore(seat.dynastyEndurance)}  ${chalk.dim(`(${seat.reigning.dynasty})`)}`,
    '',
    `  Quality Score: ${colorScore(seat.qualityScore)}  ${chalk.dim(`(${colorCondition(seat.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatSeatsTable(seats) */
export function formatSeatsTable(seats: EmeraldSeat[]): string {
  if (seats.length === 0) return chalk.dim('No emerald seats found')

  const colWidths = {
    file: Math.max(4, ...seats.map((p) => p.file.length)),
    auth: Math.max(5, ...seats.map((p) => String(p.gemAuthority).length)),
    wisdom: Math.max(6, ...seats.map((p) => String(p.throneWisdom).length)),
    prec: Math.max(5, ...seats.map((p) => String(p.crownPrecision).length)),
    resil: Math.max(5, ...seats.map((p) => String(p.scepterResilience).length)),
    endure: Math.max(6, ...seats.map((p) => String(p.dynastyEndurance).length)),
    score: Math.max(5, ...seats.map((p) => String(p.qualityScore).length)),
  }

  const lines: string[] = [chalk.bold('Emerald Seats'), '']

  const header =
    chalk.rgb(80, 200, 120)(padRight('File', colWidths.file)) +
    '  ' +
    chalk.rgb(80, 200, 120)(padLeft('Auth', colWidths.auth)) +
    '  ' +
    chalk.rgb(80, 200, 120)(padLeft('Wisdom', colWidths.wisdom)) +
    '  ' +
    chalk.rgb(80, 200, 120)(padLeft('Prec', colWidths.prec)) +
    '  ' +
    chalk.rgb(80, 200, 120)(padLeft('Resil', colWidths.resil)) +
    '  ' +
    chalk.rgb(80, 200, 120)(padLeft('Endure', colWidths.endure)) +
    '  ' +
    chalk.rgb(80, 200, 120)(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const p of seats) {
    lines.push(
      padRight(p.file, colWidths.file) +
        '  ' +
        padLeft(String(p.gemAuthority), colWidths.auth) +
        '  ' +
        padLeft(String(p.throneWisdom), colWidths.wisdom) +
        '  ' +
        padLeft(String(p.crownPrecision), colWidths.prec) +
        '  ' +
        padLeft(String(p.scepterResilience), colWidths.resil) +
        '  ' +
        padLeft(String(p.dynastyEndurance), colWidths.endure) +
        '  ' +
        padLeft(String(p.qualityScore), colWidths.score),
    )
  }

  return lines.join('\n')
}

/** @example formatCourtTable(court) */
export function formatCourtTable(court: EmeraldCourt): string {
  const lines: string[] = [
    chalk.bold(`Emerald Court: ${court.directory}`),
    '',
    `  Seats:          ${court.seats.length}`,
    `  Avg Authority:  ${colorScore(court.avgAuthority)}`,
    `  Avg Precision:  ${colorScore(court.avgPrecision)}`,
    `  Avg Wisdom:     ${colorScore(court.avgWisdom)}`,
    `  Masterpieces:   ${court.emeraldMasterpieceCount}`,
    `  Court Type:     ${court.courtType}`,
    `  Condition:      ${colorCourtCondition(court.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatCourtsTable(courts) */
export function formatCourtsTable(courts: EmeraldCourt[]): string {
  if (courts.length === 0) return chalk.dim('No emerald courts found')

  const lines: string[] = [chalk.bold('Emerald Courts'), '']

  for (const c of courts) {
    lines.push(
      `  ${chalk.rgb(80, 200, 120)(c.directory)}  ${colorScore(c.avgAuthority)}  ${colorCourtCondition(c.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: EmeraldThroneStats): string {
  const lines: string[] = [
    chalk.bold('Emerald Throne Statistics'),
    '',
    `  Total Files:          ${stats.totalFiles}`,
    `  Total Courts:         ${stats.totalCourts}`,
    `  Avg Gem Authority:    ${colorScore(stats.avgGemAuthority)}`,
    `  Avg Throne Wisdom:    ${colorScore(stats.avgThroneWisdom)}`,
    `  Avg Crown Precision:  ${colorScore(stats.avgCrownPrecision)}`,
    `  Avg Scepter Resilience:${colorScore(stats.avgScepterResilience)}`,
    `  Avg Dynasty Endurance:${colorScore(stats.avgDynastyEndurance)}`,
    `  Emerald Masterpieces: ${stats.emeraldMasterpieceCount}`,
    `  Royal Throne:         ${stats.royalThroneCount}`,
    `  Proper Seat:          ${stats.properSeatCount}`,
    `  Wooden Chair:         ${stats.woodenChairCount}`,
    `  Broken Stool:         ${stats.brokenStoolCount}`,
    `  Void:                 ${stats.voidCount}`,
    `  Overall Sovereignty:  ${colorScore(stats.overallSovereignty)}`,
    `  Monarch Grade:        ${stats.monarchGrade}`,
    `  Best Seat:            ${stats.bestSeat || 'N/A'}`,
    `  Most Authoritative:   ${stats.mostAuthoritative || 'N/A'}`,
    `  Wisest:               ${stats.wisest || 'N/A'}`,
    `  Most Precise:         ${stats.mostPrecise || 'N/A'}`,
    `  Most Resilient:       ${stats.mostResilient || 'N/A'}`,
    `  Most Enduring:        ${stats.mostEnduring || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(80, 200, 120)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: EmeraldThroneResult): string {
  const lines: string[] = [
    chalk.bold('Emerald Throne Analysis'),
    '',
    formatSeatsTable(result.seats),
    '',
    formatCourtsTable(result.courts),
    '',
    chalk.bold('Kingdom Overview'),
    '',
    `  Avg Authority:     ${colorScore(result.kingdom.avgAuthority)}`,
    `  Avg Precision:     ${colorScore(result.kingdom.avgPrecision)}`,
    `  Avg Wisdom:        ${colorScore(result.kingdom.avgWisdom)}`,
    `  Overall Sovereignty:${colorScore(result.kingdom.overallSovereignty)}`,
    `  Is Emerald:        ${result.kingdom.isEmerald ? chalk.rgb(80, 200, 120)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: EmeraldThroneResult): string {
  return JSON.stringify(result, null, 2)
}
