import chalk from 'chalk'

import type { NaveCondition, PillarCondition, OnyxPillar, OnyxNave, OnyxCathedralStats, OnyxCathedralResult } from './onyx-cathedral-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(80, 0, 120)(String(score))
  if (score >= 75) return chalk.rgb(100, 0, 150)(String(score))
  if (score >= 60) return chalk.rgb(128, 0, 128)(String(score))
  if (score >= 40) return chalk.yellow(String(score))
  if (score >= 20) return chalk.rgb(255, 165, 0)(String(score))
  return chalk.gray(String(score))
}

/** @example colorCondition('onyx-masterpiece') */
export function colorCondition(condition: PillarCondition | string): string {
  switch (condition) {
    case 'onyx-masterpiece':
      return chalk.rgb(80, 0, 120)('onyx-masterpiece')
    case 'dark-sanctuary':
      return chalk.rgb(100, 0, 150)('dark-sanctuary')
    case 'proper-temple':
      return chalk.rgb(128, 0, 128)('proper-temple')
    case 'crumbling-stone':
      return chalk.yellow('crumbling-stone')
    case 'shattered-ruin':
      return chalk.rgb(255, 165, 0)('shattered-ruin')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorNaveCondition('obsidian-basilica') */
export function colorNaveCondition(condition: NaveCondition | string): string {
  switch (condition) {
    case 'obsidian-basilica':
      return chalk.rgb(80, 0, 120)('obsidian-basilica')
    case 'dark-temple':
      return chalk.rgb(100, 0, 150)('dark-temple')
    case 'proper-chapel':
      return chalk.rgb(128, 0, 128)('proper-chapel')
    case 'crumbling-ruin':
      return chalk.yellow('crumbling-ruin')
    case 'shattered-vestibule':
      return chalk.rgb(255, 165, 0)('shattered-vestibule')
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
    `  Obsidian Clarity:    ${colorScore(pillar.obsidianClarity)}  ${chalk.dim(`(${pillar.clarifying.glass})`)}`,
    `  Dark Resilience:     ${colorScore(pillar.darkResilience)}  ${chalk.dim(`(${pillar.enduring.shadow})`)}`,
    `  Mirror Depth:        ${colorScore(pillar.mirrorDepth)}  ${chalk.dim(`(${pillar.reflecting.mirror})`)}`,
    `  Midnight Precision:  ${colorScore(pillar.midnightPrecision)}  ${chalk.dim(`(${pillar.cutting.blade})`)}`,
    `  Void Wisdom:         ${colorScore(pillar.voidWisdom)}  ${chalk.dim(`(${pillar.knowing.void})`)}`,
    '',
    `  Quality Score: ${colorScore(pillar.qualityScore)}  ${chalk.dim(`(${colorCondition(pillar.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatPillarsTable(pillars) */
export function formatPillarsTable(pillars: OnyxPillar[]): string {
  if (pillars.length === 0) return chalk.dim('No onyx pillars found')

  const colWidths = {
    file: Math.max(4, ...pillars.map((p) => p.file.length)),
    clarity: Math.max(7, ...pillars.map((p) => String(p.obsidianClarity).length)),
    resilience: Math.max(10, ...pillars.map((p) => String(p.darkResilience).length)),
    depth: Math.max(6, ...pillars.map((p) => String(p.mirrorDepth).length)),
    precision: Math.max(9, ...pillars.map((p) => String(p.midnightPrecision).length)),
    wisdom: Math.max(7, ...pillars.map((p) => String(p.voidWisdom).length)),
    score: Math.max(5, ...pillars.map((p) => String(p.qualityScore).length)),
  }

  const lines: string[] = [chalk.bold('Onyx Pillars'), '']

  const header =
    chalk.rgb(80, 0, 120)(padRight('File', colWidths.file)) +
    '  ' +
    chalk.rgb(80, 0, 120)(padLeft('Clarity', colWidths.clarity)) +
    '  ' +
    chalk.rgb(80, 0, 120)(padLeft('Resilience', colWidths.resilience)) +
    '  ' +
    chalk.rgb(80, 0, 120)(padLeft('Depth', colWidths.depth)) +
    '  ' +
    chalk.rgb(80, 0, 120)(padLeft('Precision', colWidths.precision)) +
    '  ' +
    chalk.rgb(80, 0, 120)(padLeft('Wisdom', colWidths.wisdom)) +
    '  ' +
    chalk.rgb(80, 0, 120)(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const p of pillars) {
    lines.push(
      padRight(p.file, colWidths.file) +
        '  ' +
        padLeft(String(p.obsidianClarity), colWidths.clarity) +
        '  ' +
        padLeft(String(p.darkResilience), colWidths.resilience) +
        '  ' +
        padLeft(String(p.mirrorDepth), colWidths.depth) +
        '  ' +
        padLeft(String(p.midnightPrecision), colWidths.precision) +
        '  ' +
        padLeft(String(p.voidWisdom), colWidths.wisdom) +
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
    `  Pillars:       ${nave.pillars.length}`,
    `  Avg Clarity:   ${colorScore(nave.avgClarity)}`,
    `  Avg Precision: ${colorScore(nave.avgPrecision)}`,
    `  Avg Wisdom:    ${colorScore(nave.avgWisdom)}`,
    `  Masterpieces:  ${nave.onyxMasterpieceCount}`,
    `  Nave Type:     ${nave.naveType}`,
    `  Condition:     ${colorNaveCondition(nave.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatNavesTable(naves) */
export function formatNavesTable(naves: OnyxNave[]): string {
  if (naves.length === 0) return chalk.dim('No onyx naves found')

  const lines: string[] = [chalk.bold('Onyx Naves'), '']

  for (const n of naves) {
    lines.push(
      `  ${chalk.rgb(80, 0, 120)(n.directory)}  ${colorScore(n.avgClarity)}  ${colorNaveCondition(n.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: OnyxCathedralStats): string {
  const lines: string[] = [
    chalk.bold('Onyx Cathedral Statistics'),
    '',
    `  Total Files:           ${stats.totalFiles}`,
    `  Total Naves:           ${stats.totalNaves}`,
    `  Avg Obsidian Clarity:  ${colorScore(stats.avgObsidianClarity)}`,
    `  Avg Dark Resilience:   ${colorScore(stats.avgDarkResilience)}`,
    `  Avg Mirror Depth:      ${colorScore(stats.avgMirrorDepth)}`,
    `  Avg Midnight Precision:${colorScore(stats.avgMidnightPrecision)}`,
    `  Avg Void Wisdom:       ${colorScore(stats.avgVoidWisdom)}`,
    `  Onyx Masterpieces:     ${stats.onyxMasterpieceCount}`,
    `  Dark Sanctuaries:      ${stats.darkSanctuaryCount}`,
    `  Proper Temples:        ${stats.properTempleCount}`,
    `  Crumbling Stones:      ${stats.crumblingStoneCount}`,
    `  Shattered Ruins:       ${stats.shatteredRuinCount}`,
    `  Void:                  ${stats.voidCount}`,
    `  Overall Depth:         ${colorScore(stats.overallDepth)}`,
    `  Architect Grade:       ${stats.architectGrade}`,
    `  Best Pillar:           ${stats.bestPillar || 'N/A'}`,
    `  Clearest:              ${stats.clearest || 'N/A'}`,
    `  Most Resilient:        ${stats.mostResilient || 'N/A'}`,
    `  Deepest:               ${stats.deepest || 'N/A'}`,
    `  Sharpest:              ${stats.sharpest || 'N/A'}`,
    `  Wisest:                ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(80, 0, 120)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: OnyxCathedralResult): string {
  const lines: string[] = [
    chalk.bold('Onyx Cathedral Analysis'),
    '',
    formatPillarsTable(result.pillars),
    '',
    formatNavesTable(result.naves),
    '',
    chalk.bold('Darkness Overview'),
    '',
    `  Avg Clarity:    ${colorScore(result.darkness.avgClarity)}`,
    `  Avg Precision:  ${colorScore(result.darkness.avgPrecision)}`,
    `  Avg Wisdom:     ${colorScore(result.darkness.avgWisdom)}`,
    `  Overall Depth:  ${colorScore(result.darkness.overallDepth)}`,
    `  Is Onyx:        ${result.darkness.isOnyx ? chalk.rgb(80, 0, 120)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: OnyxCathedralResult): string {
  return JSON.stringify(result, null, 2)
}
