import chalk from 'chalk'

import type { DecreeCondition, KingdomCondition, EmeraldDecree, EmeraldThroneResult, EmeraldKingdom } from './emerald-crown-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(16, 185, 129)(String(score))
  if (score >= 75) return chalk.rgb(16, 155, 110)(String(score))
  if (score >= 60) return chalk.rgb(16, 125, 95)(String(score))
  if (score >= 40) return chalk.rgb(16, 95, 75)(String(score))
  if (score >= 20) return chalk.rgb(16, 65, 55)(String(score))
  return chalk.gray(String(score))
}

/** @example colorDecreeCondition('emerald-masterpiece') */
export function colorDecreeCondition(condition: DecreeCondition | string): string {
  switch (condition) {
    case 'emerald-masterpiece':
      return chalk.rgb(16, 185, 129)('emerald-masterpiece')
    case 'royal-standard':
      return chalk.rgb(16, 155, 110)('royal-standard')
    case 'proper-gem':
      return chalk.rgb(16, 125, 95)('proper-gem')
    case 'base-metal':
      return chalk.rgb(16, 95, 75)('base-metal')
    case 'tin-foil':
      return chalk.rgb(16, 65, 55)('tin-foil')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorKingdomCondition('emerald-palace') */
export function colorKingdomCondition(condition: KingdomCondition | string): string {
  switch (condition) {
    case 'emerald-palace':
      return chalk.rgb(16, 185, 129)('emerald-palace')
    case 'royal-court':
      return chalk.rgb(16, 155, 110)('royal-court')
    case 'proper-castle':
      return chalk.rgb(16, 125, 95)('proper-castle')
    case 'wooden-fort':
      return chalk.rgb(16, 95, 75)('wooden-fort')
    case 'tent':
      return chalk.rgb(16, 65, 55)('tent')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatDecreeTable(decree) */
export function formatDecreeTable(decree: EmeraldDecree): string {
  const lines: string[] = [
    chalk.bold(`Emerald Decree: ${decree.file}`),
    '',
    `  Gem Authority:       ${colorScore(decree.gemAuthority)}  ${chalk.dim(`(${decree.ruling.throne})`)}`,
    `  Throne Wisdom:       ${colorScore(decree.throneWisdom)}  ${chalk.dim(`(${decree.governing.reign})`)}`,
    `  Crown Precision:     ${colorScore(decree.crownPrecision)}  ${chalk.dim(`(${decree.decreeing.crown})`)}`,
    `  Scepter Resilience:  ${colorScore(decree.scepterResilience)}  ${chalk.dim(`(${decree.defending.shield})`)}`,
    `  Dynasty Endurance:   ${colorScore(decree.dynastyEndurance)}  ${chalk.dim(`(${decree.persisting.dynasty})`)}`,
    '',
    `  Quality Score: ${colorScore(decree.qualityScore)}  ${chalk.dim(`(${colorDecreeCondition(decree.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatDecreesTable(decrees) */
export function formatDecreesTable(decrees: EmeraldDecree[]): string {
  if (decrees.length === 0) return chalk.dim('No emerald decrees found')

  const colWidths = {
    file: Math.max(4, ...decrees.map((d) => d.file.length)),
    auth: Math.max(4, ...decrees.map((d) => String(d.gemAuthority).length)),
    wis: Math.max(4, ...decrees.map((d) => String(d.throneWisdom).length)),
    prec: Math.max(4, ...decrees.map((d) => String(d.crownPrecision).length)),
    res: Math.max(4, ...decrees.map((d) => String(d.scepterResilience).length)),
    end: Math.max(4, ...decrees.map((d) => String(d.dynastyEndurance).length)),
    score: Math.max(5, ...decrees.map((d) => String(d.qualityScore).length)),
  }

  const lines: string[] = [chalk.bold('Emerald Decrees'), '']

  const header =
    chalk.rgb(16, 185, 129)(padRight('File', colWidths.file)) +
    '  ' +
    chalk.rgb(16, 185, 129)(padLeft('Auth', colWidths.auth)) +
    '  ' +
    chalk.rgb(16, 185, 129)(padLeft('Wis', colWidths.wis)) +
    '  ' +
    chalk.rgb(16, 185, 129)(padLeft('Prec', colWidths.prec)) +
    '  ' +
    chalk.rgb(16, 185, 129)(padLeft('Res', colWidths.res)) +
    '  ' +
    chalk.rgb(16, 185, 129)(padLeft('End', colWidths.end)) +
    '  ' +
    chalk.rgb(16, 185, 129)(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const d of decrees) {
    lines.push(
      padRight(d.file, colWidths.file) +
        '  ' +
        padLeft(String(d.gemAuthority), colWidths.auth) +
        '  ' +
        padLeft(String(d.throneWisdom), colWidths.wis) +
        '  ' +
        padLeft(String(d.crownPrecision), colWidths.prec) +
        '  ' +
        padLeft(String(d.scepterResilience), colWidths.res) +
        '  ' +
        padLeft(String(d.dynastyEndurance), colWidths.end) +
        '  ' +
        padLeft(String(d.qualityScore), colWidths.score),
    )
  }

  return lines.join('\n')
}

/** @example formatKingdomTable(kingdom) */
export function formatKingdomTable(kingdom: EmeraldKingdom): string {
  const lines: string[] = [
    chalk.bold(`Emerald Kingdom: ${kingdom.directory}`),
    '',
    `  Decrees:            ${kingdom.decrees.length}`,
    `  Avg Authority:      ${colorScore(kingdom.avgAuthority)}`,
    `  Avg Precision:      ${colorScore(kingdom.avgPrecision)}`,
    `  Avg Endurance:      ${colorScore(kingdom.avgEndurance)}`,
    `  Masterpieces:       ${kingdom.emeraldMasterpieceCount}`,
    `  Kingdom Type:       ${kingdom.kingdomType}`,
    `  Condition:          ${colorKingdomCondition(kingdom.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatKingdomsTable(kingdoms) */
export function formatKingdomsTable(kingdoms: EmeraldKingdom[]): string {
  if (kingdoms.length === 0) return chalk.dim('No emerald kingdoms found')

  const lines: string[] = [chalk.bold('Emerald Kingdoms'), '']

  for (const k of kingdoms) {
    lines.push(
      `  ${chalk.rgb(16, 185, 129)(k.directory)}  ${colorScore(k.avgAuthority)}  ${colorKingdomCondition(k.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: EmeraldThroneResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Emerald Throne Statistics'),
    '',
    `  Total Files:            ${stats.totalFiles}`,
    `  Total Kingdoms:         ${stats.totalKingdoms}`,
    `  Avg Gem Authority:      ${colorScore(stats.avgGemAuthority)}`,
    `  Avg Throne Wisdom:      ${colorScore(stats.avgThroneWisdom)}`,
    `  Avg Crown Precision:    ${colorScore(stats.avgCrownPrecision)}`,
    `  Avg Scepter Resilience: ${colorScore(stats.avgScepterResilience)}`,
    `  Avg Dynasty Endurance:  ${colorScore(stats.avgDynastyEndurance)}`,
    `  Emerald Masterpieces:   ${stats.emeraldMasterpieceCount}`,
    `  Royal Standard:         ${stats.royalStandardCount}`,
    `  Proper Gem:             ${stats.properGemCount}`,
    `  Base Metal:             ${stats.baseMetalCount}`,
    `  Tin Foil:               ${stats.tinFoilCount}`,
    `  Void:                   ${stats.voidCount}`,
    `  Overall Sovereignty:    ${colorScore(stats.overallSovereignty)}`,
    `  Sovereign Grade:        ${stats.sovereignGrade}`,
    `  Best Decree:            ${stats.bestDecree || 'N/A'}`,
    `  Most Authoritative:     ${stats.mostAuthoritative || 'N/A'}`,
    `  Wisest:                 ${stats.wisest || 'N/A'}`,
    `  Most Precise:           ${stats.mostPrecise || 'N/A'}`,
    `  Most Resilient:         ${stats.mostResilient || 'N/A'}`,
    `  Most Enduring:          ${stats.mostEnduring || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(16, 185, 129)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: EmeraldThroneResult): string {
  const lines: string[] = [
    chalk.bold('Emerald Throne Analysis'),
    '',
    formatDecreesTable(result.decrees),
    '',
    formatKingdomsTable(result.kingdoms),
    '',
    chalk.bold('Empire Overview'),
    '',
    `  Avg Authority:  ${colorScore(result.empire.avgAuthority)}`,
    `  Avg Precision:  ${colorScore(result.empire.avgPrecision)}`,
    `  Avg Endurance:  ${colorScore(result.empire.avgEndurance)}`,
    `  Sovereignty:    ${colorScore(result.empire.overallSovereignty)}`,
    `  Is Emerald:     ${result.empire.isEmerald ? chalk.rgb(16, 185, 129)('yes') : chalk.gray('no')}`,
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
