import chalk from 'chalk'

import type { EmeraldThroneResult, EmeraldDecree, EmeraldKingdom, KingdomCondition } from './emerald-scepter-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(80, 200, 120)(String(score))
  if (score >= 75) return chalk.rgb(60, 180, 100)(String(score))
  if (score >= 60) return chalk.rgb(40, 160, 80)(String(score))
  if (score >= 40) return chalk.rgb(80, 120, 140)(String(score))
  if (score >= 20) return chalk.rgb(60, 90, 110)(String(score))
  return chalk.gray(String(score))
}

/** @example colorKingdomCondition('emerald-palace') */
export function colorKingdomCondition(condition: KingdomCondition | string): string {
  switch (condition) {
    case 'emerald-palace': return chalk.rgb(80, 200, 120)('emerald-palace')
    case 'royal-court': return chalk.rgb(60, 180, 100)('royal-court')
    case 'proper-castle': return chalk.rgb(40, 160, 80)('proper-castle')
    case 'wooden-fort': return chalk.rgb(80, 120, 140)('wooden-fort')
    case 'tent': return chalk.rgb(60, 90, 110)('tent')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
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

/** @example formatDecreeTable(decree) */
export function formatDecreeTable(decree: EmeraldDecree): string {
  const lines: string[] = [
    chalk.bold(`Emerald Decree: ${decree.file}`),
    '',
    `  Gem Authority:        ${colorScore(decree.gemAuthority)}  ${chalk.dim(`(${decree.ruling.throne})`)}`,
    `  Throne Wisdom:        ${colorScore(decree.throneWisdom)}  ${chalk.dim(`(${decree.governing.reign})`)}`,
    `  Crown Precision:      ${colorScore(decree.crownPrecision)}  ${chalk.dim(`(${decree.decreeing.crown})`)}`,
    `  Scepter Resilience:   ${colorScore(decree.scepterResilience)}  ${chalk.dim(`(${decree.defending.shield})`)}`,
    `  Dynasty Endurance:    ${colorScore(decree.dynastyEndurance)}  ${chalk.dim(`(${decree.persisting.dynasty})`)}`,
    '',
    `  Quality Score: ${colorScore(decree.qualityScore)}  ${chalk.dim(`(${decree.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatDecreesTable(decrees) */
export function formatDecreesTable(decrees: EmeraldDecree[]): string {
  if (decrees.length === 0) return chalk.dim('No emerald decrees found')
  const colWidths = {
    file: Math.max(4, ...decrees.map((d) => d.file.length)),
    authority: Math.max(9, ...decrees.map((d) => String(d.gemAuthority).length)),
    wisdom: Math.max(6, ...decrees.map((d) => String(d.throneWisdom).length)),
    precision: Math.max(9, ...decrees.map((d) => String(d.crownPrecision).length)),
    resilience: Math.max(10, ...decrees.map((d) => String(d.scepterResilience).length)),
    endurance: Math.max(9, ...decrees.map((d) => String(d.dynastyEndurance).length)),
    score: Math.max(5, ...decrees.map((d) => String(d.qualityScore).length)),
  }
  const lines: string[] = [chalk.bold('Emerald Decrees'), '']
  const header =
    chalk.rgb(80, 200, 120)(padRight('File', colWidths.file)) + '  ' +
    chalk.rgb(80, 200, 120)(padLeft('Authority', colWidths.authority)) + '  ' +
    chalk.rgb(80, 200, 120)(padLeft('Wisdom', colWidths.wisdom)) + '  ' +
    chalk.rgb(80, 200, 120)(padLeft('Precision', colWidths.precision)) + '  ' +
    chalk.rgb(80, 200, 120)(padLeft('Resilience', colWidths.resilience)) + '  ' +
    chalk.rgb(80, 200, 120)(padLeft('Endurance', colWidths.endurance)) + '  ' +
    chalk.rgb(80, 200, 120)(padLeft('Score', colWidths.score))
  lines.push(header)
  lines.push(chalk.dim('\u2500'.repeat(header.length)))
  for (const d of decrees) {
    lines.push(
      padRight(d.file, colWidths.file) + '  ' +
      padLeft(String(d.gemAuthority), colWidths.authority) + '  ' +
      padLeft(String(d.throneWisdom), colWidths.wisdom) + '  ' +
      padLeft(String(d.crownPrecision), colWidths.precision) + '  ' +
      padLeft(String(d.scepterResilience), colWidths.resilience) + '  ' +
      padLeft(String(d.dynastyEndurance), colWidths.endurance) + '  ' +
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
    `  Decrees:              ${kingdom.decrees.length}`,
    `  Avg Authority:        ${colorScore(kingdom.avgAuthority)}`,
    `  Avg Precision:        ${colorScore(kingdom.avgPrecision)}`,
    `  Avg Endurance:        ${colorScore(kingdom.avgEndurance)}`,
    `  Masterpieces:         ${kingdom.emeraldMasterpieceCount}`,
    `  Kingdom Type:         ${kingdom.kingdomType}`,
    `  Condition:            ${colorKingdomCondition(kingdom.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatKingdomsTable(kingdoms) */
export function formatKingdomsTable(kingdoms: EmeraldKingdom[]): string {
  if (kingdoms.length === 0) return chalk.dim('No emerald kingdoms found')
  const lines: string[] = [chalk.bold('Emerald Kingdoms'), '']
  for (const k of kingdoms) {
    lines.push(`  ${chalk.rgb(80, 200, 120)(k.directory)}  ${colorScore(k.avgAuthority)}  ${colorKingdomCondition(k.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: EmeraldThroneResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Emerald Throne Statistics'),
    '',
    `  Total Files:              ${stats.totalFiles}`,
    `  Total Kingdoms:           ${stats.totalKingdoms}`,
    `  Avg Gem Authority:        ${colorScore(stats.avgGemAuthority)}`,
    `  Avg Throne Wisdom:        ${colorScore(stats.avgThroneWisdom)}`,
    `  Avg Crown Precision:      ${colorScore(stats.avgCrownPrecision)}`,
    `  Avg Scepter Resilience:   ${colorScore(stats.avgScepterResilience)}`,
    `  Avg Dynasty Endurance:    ${colorScore(stats.avgDynastyEndurance)}`,
    `  Emerald Masterpieces:     ${stats.emeraldMasterpieceCount}`,
    `  Royal Standards:          ${stats.royalStandardCount}`,
    `  Proper Gems:              ${stats.properGemCount}`,
    `  Base Metals:              ${stats.baseMetalCount}`,
    `  Tin Foils:                ${stats.tinFoilCount}`,
    `  Void:                     ${stats.voidCount}`,
    `  Overall Sovereignty:      ${colorScore(stats.overallSovereignty)}`,
    `  Sovereign Grade:          ${stats.sovereignGrade}`,
    `  Best Decree:              ${stats.bestDecree || 'N/A'}`,
    `  Most Authoritative:       ${stats.mostAuthoritative || 'N/A'}`,
    `  Wisest:                   ${stats.wisest || 'N/A'}`,
    `  Most Precise:             ${stats.mostPrecise || 'N/A'}`,
    `  Most Resilient:           ${stats.mostResilient || 'N/A'}`,
    `  Most Enduring:            ${stats.mostEnduring || 'N/A'}`,
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
    formatDecreesTable(result.decrees),
    '',
    formatKingdomsTable(result.kingdoms),
    '',
    chalk.bold('Empire Overview'),
    '',
    `  Avg Authority:      ${colorScore(result.empire.avgAuthority)}`,
    `  Avg Precision:      ${colorScore(result.empire.avgPrecision)}`,
    `  Avg Endurance:      ${colorScore(result.empire.avgEndurance)}`,
    `  Overall Sovereignty: ${colorScore(result.empire.overallSovereignty)}`,
    `  Is Emerald:         ${result.empire.isEmerald ? chalk.rgb(80, 200, 120)('yes') : chalk.gray('no')}`,
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
