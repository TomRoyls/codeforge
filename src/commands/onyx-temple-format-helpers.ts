import chalk from 'chalk'

import type { NaveCondition, OnyxNave, OnyxPillar, OnyxTempleResult, PillarCondition } from './onyx-temple-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(100, 100, 120)(String(score))
  if (score >= 75) return chalk.rgb(85, 85, 105)(String(score))
  if (score >= 60) return chalk.rgb(70, 70, 90)(String(score))
  if (score >= 40) return chalk.rgb(55, 55, 75)(String(score))
  if (score >= 20) return chalk.rgb(45, 45, 60)(String(score))
  return chalk.gray(String(score))
}

/** @example colorPillarCondition('onyx-masterpiece') */
export function colorPillarCondition(condition: PillarCondition | string): string {
  switch (condition) {
    case 'onyx-masterpiece':
      return chalk.rgb(100, 100, 120)('onyx-masterpiece')
    case 'dark-cathedral':
      return chalk.rgb(85, 85, 105)('dark-cathedral')
    case 'proper-stone':
      return chalk.rgb(70, 70, 90)('proper-stone')
    case 'cracked-pillar':
      return chalk.rgb(55, 55, 75)('cracked-pillar')
    case 'rubble':
      return chalk.rgb(45, 45, 60)('rubble')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorNaveCondition('onyx-basilica') */
export function colorNaveCondition(condition: NaveCondition | string): string {
  switch (condition) {
    case 'onyx-basilica':
      return chalk.rgb(100, 100, 120)('onyx-basilica')
    case 'dark-abbey':
      return chalk.rgb(85, 85, 105)('dark-abbey')
    case 'proper-temple':
      return chalk.rgb(70, 70, 90)('proper-temple')
    case 'ruined-church':
      return chalk.rgb(55, 55, 75)('ruined-church')
    case 'empty-lot':
      return chalk.rgb(45, 45, 60)('empty-lot')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatPillarTable(pillar) */
export function formatPillarTable(pillar: OnyxPillar): string {
  const lines: string[] = [
    chalk.bold(`Onyx Pillar: ${pillar.file}`),
    '',
    `  Obsidian Clarity:     ${colorScore(pillar.obsidianClarity)}  ${chalk.dim(`(${pillar.revealing.obsidian})`)}`,
    `  Dark Resilience:      ${colorScore(pillar.darkResilience)}  ${chalk.dim(`(${pillar.enduring.darkness})`)}`,
    `  Mirror Depth:         ${colorScore(pillar.mirrorDepth)}  ${chalk.dim(`(${pillar.reflecting.mirror})`)}`,
    `  Midnight Precision:   ${colorScore(pillar.midnightPrecision)}  ${chalk.dim(`(${pillar.carving.chisel})`)}`,
    `  Void Wisdom:          ${colorScore(pillar.voidWisdom)}  ${chalk.dim(`(${pillar.contemplating.void})`)}`,
    '',
    `  Quality Score: ${colorScore(pillar.qualityScore)}  ${chalk.dim(`(${colorPillarCondition(pillar.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatPillarsTable(pillars) */
export function formatPillarsTable(pillars: OnyxPillar[]): string {
  if (pillars.length === 0) return chalk.dim('No onyx pillars found')

  const colWidths = {
    file: Math.max(4, ...pillars.map((p) => p.file.length)),
    clr: Math.max(4, ...pillars.map((p) => String(p.obsidianClarity).length)),
    res: Math.max(4, ...pillars.map((p) => String(p.darkResilience).length)),
    dep: Math.max(4, ...pillars.map((p) => String(p.mirrorDepth).length)),
    prc: Math.max(4, ...pillars.map((p) => String(p.midnightPrecision).length)),
    wis: Math.max(4, ...pillars.map((p) => String(p.voidWisdom).length)),
    score: Math.max(5, ...pillars.map((p) => String(p.qualityScore).length)),
  }

  const lines: string[] = [chalk.bold('Onyx Pillars'), '']

  const header =
    chalk.rgb(100, 100, 120)(padRight('File', colWidths.file)) +
    '  ' +
    chalk.rgb(100, 100, 120)(padLeft('Clr', colWidths.clr)) +
    '  ' +
    chalk.rgb(100, 100, 120)(padLeft('Res', colWidths.res)) +
    '  ' +
    chalk.rgb(100, 100, 120)(padLeft('Dep', colWidths.dep)) +
    '  ' +
    chalk.rgb(100, 100, 120)(padLeft('Prc', colWidths.prc)) +
    '  ' +
    chalk.rgb(100, 100, 120)(padLeft('Wis', colWidths.wis)) +
    '  ' +
    chalk.rgb(100, 100, 120)(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const p of pillars) {
    lines.push(
      padRight(p.file, colWidths.file) +
        '  ' +
        padLeft(String(p.obsidianClarity), colWidths.clr) +
        '  ' +
        padLeft(String(p.darkResilience), colWidths.res) +
        '  ' +
        padLeft(String(p.mirrorDepth), colWidths.dep) +
        '  ' +
        padLeft(String(p.midnightPrecision), colWidths.prc) +
        '  ' +
        padLeft(String(p.voidWisdom), colWidths.wis) +
        '  ' +
        padLeft(String(p.qualityScore), colWidths.score),
    )
  }

  return lines.join('\n')
}

/** @example formatNaveTable(nave) */
export function formatNaveTable(nave: OnyxNave): string {
  const lines: string[] = [
    chalk.bold(`Onyx Nave: ${nave.directory}`),
    '',
    `  Pillars:          ${nave.pillars.length}`,
    `  Avg Clarity:      ${colorScore(nave.avgClarity)}`,
    `  Avg Precision:    ${colorScore(nave.avgPrecision)}`,
    `  Avg Wisdom:       ${colorScore(nave.avgWisdom)}`,
    `  Masterpieces:     ${nave.onyxMasterpieceCount}`,
    `  Nave Type:        ${nave.naveType}`,
    `  Condition:        ${colorNaveCondition(nave.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatNavesTable(naves) */
export function formatNavesTable(naves: OnyxNave[]): string {
  if (naves.length === 0) return chalk.dim('No onyx naves found')

  const lines: string[] = [chalk.bold('Onyx Naves'), '']

  for (const n of naves) {
    lines.push(
      `  ${chalk.rgb(100, 100, 120)(n.directory)}  ${colorScore(n.avgClarity)}  ${colorNaveCondition(n.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: OnyxTempleResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Onyx Temple Statistics'),
    '',
    `  Total Files:           ${stats.totalFiles}`,
    `  Total Naves:           ${stats.totalNaves}`,
    `  Avg Obsidian Clarity:  ${colorScore(stats.avgObsidianClarity)}`,
    `  Avg Dark Resilience:   ${colorScore(stats.avgDarkResilience)}`,
    `  Avg Mirror Depth:      ${colorScore(stats.avgMirrorDepth)}`,
    `  Avg Midnight Precision:${colorScore(stats.avgMidnightPrecision)}`,
    `  Avg Void Wisdom:       ${colorScore(stats.avgVoidWisdom)}`,
    `  Onyx Masterpieces:     ${stats.onyxMasterpieceCount}`,
    `  Dark Cathedral:        ${stats.darkCathedralCount}`,
    `  Proper Stone:          ${stats.properStoneCount}`,
    `  Cracked Pillar:        ${stats.crackedPillarCount}`,
    `  Rubble:                ${stats.rubbleCount}`,
    `  Void:                  ${stats.voidCount}`,
    `  Overall Depth:         ${colorScore(stats.overallDepth)}`,
    `  Architect Grade:       ${stats.architectGrade}`,
    `  Best Pillar:           ${stats.bestPillar || 'N/A'}`,
    `  Clearest:              ${stats.clearest || 'N/A'}`,
    `  Most Resilient:        ${stats.mostResilient || 'N/A'}`,
    `  Deepest:               ${stats.deepest || 'N/A'}`,
    `  Most Precise:          ${stats.mostPrecise || 'N/A'}`,
    `  Wisest:                ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(100, 100, 120)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: OnyxTempleResult): string {
  const lines: string[] = [
    chalk.bold('Onyx Temple Analysis'),
    '',
    formatPillarsTable(result.pillars),
    '',
    formatNavesTable(result.naves),
    '',
    chalk.bold('Sanctuary Overview'),
    '',
    `  Avg Clarity:    ${colorScore(result.sanctuary.avgClarity)}`,
    `  Avg Precision:  ${colorScore(result.sanctuary.avgPrecision)}`,
    `  Avg Wisdom:     ${colorScore(result.sanctuary.avgWisdom)}`,
    `  Depth:          ${colorScore(result.sanctuary.overallDepth)}`,
    `  Is Onyx:        ${result.sanctuary.isOnyx ? chalk.rgb(100, 100, 120)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: OnyxTempleResult): string {
  return JSON.stringify(result, null, 2)
}
