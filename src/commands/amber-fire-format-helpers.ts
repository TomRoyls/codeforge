import chalk from 'chalk'

import type { AmberCondition, HearthCondition, AmberEmber, AmberBlazeResult, AmberHearth } from './amber-fire-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(255, 191, 0)(String(score))
  if (score >= 75) return chalk.rgb(220, 160, 0)(String(score))
  if (score >= 60) return chalk.rgb(185, 130, 0)(String(score))
  if (score >= 40) return chalk.rgb(150, 100, 0)(String(score))
  if (score >= 20) return chalk.rgb(115, 70, 0)(String(score))
  return chalk.gray(String(score))
}

/** @example colorAmberCondition('amber-masterpiece') */
export function colorAmberCondition(condition: AmberCondition | string): string {
  switch (condition) {
    case 'amber-masterpiece': return chalk.rgb(255, 191, 0)('amber-masterpiece')
    case 'golden-blaze': return chalk.rgb(220, 160, 0)('golden-blaze')
    case 'proper-fossil': return chalk.rgb(185, 130, 0)('proper-fossil')
    case 'cool-stone': return chalk.rgb(150, 100, 0)('cool-stone')
    case 'dust': return chalk.rgb(115, 70, 0)('dust')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorHearthCondition('amber-sanctuary') */
export function colorHearthCondition(condition: HearthCondition | string): string {
  switch (condition) {
    case 'amber-sanctuary': return chalk.rgb(255, 191, 0)('amber-sanctuary')
    case 'warm-cabin': return chalk.rgb(220, 160, 0)('warm-cabin')
    case 'proper-room': return chalk.rgb(185, 130, 0)('proper-room')
    case 'cold-cave': return chalk.rgb(150, 100, 0)('cold-cave')
    case 'empty-space': return chalk.rgb(115, 70, 0)('empty-space')
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

/** @example formatEmberTable(ember) */
export function formatEmberTable(ember: AmberEmber): string {
  const lines: string[] = [
    chalk.bold(`Amber Ember: ${ember.file}`),
    '',
    `  Preservation Warmth:  ${colorScore(ember.preservationWarmth)}  ${chalk.dim(`(${ember.preserving.amber})`)}`,
    `  Glow Clarity:         ${colorScore(ember.glowClarity)}  ${chalk.dim(`(${ember.illuminating.glow})`)}`,
    `  Fire Persistence:     ${colorScore(ember.firePersistence)}  ${chalk.dim(`(${ember.persisting.fire})`)}`,
    `  Ash Wisdom:           ${colorScore(ember.ashWisdom)}  ${chalk.dim(`(${ember.learning.ash})`)}`,
    `  Resin Strength:       ${colorScore(ember.resinStrength)}  ${chalk.dim(`(${ember.binding.resin})`)}`,
    '',
    `  Quality Score: ${colorScore(ember.qualityScore)}  ${chalk.dim(`(${colorAmberCondition(ember.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatEmbersTable(embers) */
export function formatEmbersTable(embers: AmberEmber[]): string {
  if (embers.length === 0) return chalk.dim('No amber embers found')
  const colWidths = {
    file: Math.max(4, ...embers.map((e) => e.file.length)),
    warm: Math.max(4, ...embers.map((e) => String(e.preservationWarmth).length)),
    glow: Math.max(4, ...embers.map((e) => String(e.glowClarity).length)),
    pers: Math.max(4, ...embers.map((e) => String(e.firePersistence).length)),
    wise: Math.max(4, ...embers.map((e) => String(e.ashWisdom).length)),
    str: Math.max(4, ...embers.map((e) => String(e.resinStrength).length)),
    score: Math.max(5, ...embers.map((e) => String(e.qualityScore).length)),
  }
  const lines: string[] = [chalk.bold('Amber Embers'), '']
  const header =
    chalk.rgb(255, 191, 0)(padRight('File', colWidths.file)) + '  ' +
    chalk.rgb(255, 191, 0)(padLeft('Warm', colWidths.warm)) + '  ' +
    chalk.rgb(255, 191, 0)(padLeft('Glow', colWidths.glow)) + '  ' +
    chalk.rgb(255, 191, 0)(padLeft('Pers', colWidths.pers)) + '  ' +
    chalk.rgb(255, 191, 0)(padLeft('Wisd', colWidths.wise)) + '  ' +
    chalk.rgb(255, 191, 0)(padLeft('Str', colWidths.str)) + '  ' +
    chalk.rgb(255, 191, 0)(padLeft('Score', colWidths.score))
  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))
  for (const e of embers) {
    lines.push(
      padRight(e.file, colWidths.file) + '  ' +
      padLeft(String(e.preservationWarmth), colWidths.warm) + '  ' +
      padLeft(String(e.glowClarity), colWidths.glow) + '  ' +
      padLeft(String(e.firePersistence), colWidths.pers) + '  ' +
      padLeft(String(e.ashWisdom), colWidths.wise) + '  ' +
      padLeft(String(e.resinStrength), colWidths.str) + '  ' +
      padLeft(String(e.qualityScore), colWidths.score),
    )
  }
  return lines.join('\n')
}

/** @example formatHearthTable(hearth) */
export function formatHearthTable(hearth: AmberHearth): string {
  const lines: string[] = [
    chalk.bold(`Amber Hearth: ${hearth.directory}`),
    '',
    `  Embers:            ${hearth.embers.length}`,
    `  Avg Warmth:        ${colorScore(hearth.avgWarmth)}`,
    `  Avg Persistence:   ${colorScore(hearth.avgPersistence)}`,
    `  Avg Wisdom:        ${colorScore(hearth.avgWisdom)}`,
    `  Masterpieces:      ${hearth.amberMasterpieceCount}`,
    `  Hearth Type:       ${hearth.hearthType}`,
    `  Condition:         ${colorHearthCondition(hearth.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatHearthsTable(hearths) */
export function formatHearthsTable(hearths: AmberHearth[]): string {
  if (hearths.length === 0) return chalk.dim('No amber hearths found')
  const lines: string[] = [chalk.bold('Amber Hearths'), '']
  for (const h of hearths) {
    lines.push(`  ${chalk.rgb(255, 191, 0)(h.directory)}  ${colorScore(h.avgWarmth)}  ${colorHearthCondition(h.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: AmberBlazeResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Amber Blaze Statistics'),
    '',
    `  Total Files:             ${stats.totalFiles}`,
    `  Total Hearths:           ${stats.totalHearths}`,
    `  Avg Preservation Warmth: ${colorScore(stats.avgPreservationWarmth)}`,
    `  Avg Glow Clarity:        ${colorScore(stats.avgGlowClarity)}`,
    `  Avg Fire Persistence:    ${colorScore(stats.avgFirePersistence)}`,
    `  Avg Ash Wisdom:          ${colorScore(stats.avgAshWisdom)}`,
    `  Avg Resin Strength:      ${colorScore(stats.avgResinStrength)}`,
    `  Amber Masterpieces:      ${stats.amberMasterpieceCount}`,
    `  Golden Blazes:           ${stats.goldenBlazeCount}`,
    `  Proper Fossils:          ${stats.properFossilCount}`,
    `  Cool Stones:             ${stats.coolStoneCount}`,
    `  Dust:                    ${stats.dustCount}`,
    `  Void:                    ${stats.voidCount}`,
    `  Overall Radiance:        ${colorScore(stats.overallRadiance)}`,
    `  Firekeeper Grade:        ${stats.firekeeperGrade}`,
    `  Best Ember:              ${stats.bestEmber || 'N/A'}`,
    `  Warmest:                 ${stats.warmest || 'N/A'}`,
    `  Clearest:                ${stats.clearest || 'N/A'}`,
    `  Most Persistent:         ${stats.mostPersistent || 'N/A'}`,
    `  Wisest:                  ${stats.wisest || 'N/A'}`,
    `  Strongest:               ${stats.strongest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(255, 191, 0)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: AmberBlazeResult): string {
  const lines: string[] = [
    chalk.bold('Amber Blaze Analysis'),
    '',
    formatEmbersTable(result.embers),
    '',
    formatHearthsTable(result.hearths),
    '',
    chalk.bold('Fire Overview'),
    '',
    `  Avg Warmth:      ${colorScore(result.fire.avgWarmth)}`,
    `  Avg Persistence: ${colorScore(result.fire.avgPersistence)}`,
    `  Avg Wisdom:      ${colorScore(result.fire.avgWisdom)}`,
    `  Radiance:        ${colorScore(result.fire.overallRadiance)}`,
    `  Is Amber:        ${result.fire.isAmber ? chalk.rgb(255, 191, 0)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: AmberBlazeResult): string {
  return JSON.stringify(result, null, 2)
}
