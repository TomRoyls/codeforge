import chalk from 'chalk'

import type { NestCondition, FeatherCondition, RubyFeather, RubyNest, RubyPhoenixStats, RubyPhoenixResult } from './ruby-phoenix-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.red(String(score))
  if (score >= 75) return chalk.rgb(220, 20, 60)(String(score))
  if (score >= 60) return chalk.rgb(255, 69, 0)(String(score))
  if (score >= 40) return chalk.yellow(String(score))
  if (score >= 20) return chalk.rgb(255, 165, 0)(String(score))
  return chalk.gray(String(score))
}

/** @example colorCondition('phoenix-masterpiece') */
export function colorCondition(condition: FeatherCondition | string): string {
  switch (condition) {
    case 'phoenix-masterpiece':
      return chalk.red('phoenix-masterpiece')
    case 'reborn-glory':
      return chalk.rgb(220, 20, 60)('reborn-glory')
    case 'proper-bird':
      return chalk.rgb(255, 69, 0)('proper-bird')
    case 'dying-flame':
      return chalk.yellow('dying-flame')
    case 'cold-remains':
      return chalk.rgb(255, 165, 0)('cold-remains')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorNestCondition('blazing-aerie') */
export function colorNestCondition(condition: NestCondition | string): string {
  switch (condition) {
    case 'blazing-aerie':
      return chalk.red('blazing-aerie')
    case 'fire-nest':
      return chalk.rgb(220, 20, 60)('fire-nest')
    case 'proper-perch':
      return chalk.rgb(255, 69, 0)('proper-perch')
    case 'dying-branch':
      return chalk.yellow('dying-branch')
    case 'cold-ground':
      return chalk.rgb(255, 165, 0)('cold-ground')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatFeatherTable(feather) */
export function formatFeatherTable(feather: RubyFeather): string {
  const lines: string[] = [
    chalk.bold(`Ruby Feather: ${feather.file}`),
    '',
    `  Crimson Vitality:  ${colorScore(feather.crimsonVitality)}  ${chalk.dim(`(${feather.blazing.fire})`)}`,
    `  Rebirth Quality:   ${colorScore(feather.rebirthQuality)}  ${chalk.dim(`(${feather.renewing.rebirth})`)}`,
    `  Ash Wisdom:        ${colorScore(feather.ashWisdom)}  ${chalk.dim(`(${feather.remembering.ash})`)}`,
    `  Flame Precision:   ${colorScore(feather.flamePrecision)}  ${chalk.dim(`(${feather.focusing.flame})`)}`,
    `  Ember Resilience:  ${colorScore(feather.emberResilience)}  ${chalk.dim(`(${feather.surviving.ember})`)}`,
    '',
    `  Quality Score: ${colorScore(feather.qualityScore)}  ${chalk.dim(`(${colorCondition(feather.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatFeathersTable(feathers) */
export function formatFeathersTable(feathers: RubyFeather[]): string {
  if (feathers.length === 0) return chalk.dim('No ruby feathers found')

  const colWidths = {
    file: Math.max(4, ...feathers.map((f) => f.file.length)),
    vitality: Math.max(8, ...feathers.map((f) => String(f.crimsonVitality).length)),
    rebirth: Math.max(7, ...feathers.map((f) => String(f.rebirthQuality).length)),
    wisdom: Math.max(6, ...feathers.map((f) => String(f.ashWisdom).length)),
    precision: Math.max(9, ...feathers.map((f) => String(f.flamePrecision).length)),
    resilience: Math.max(10, ...feathers.map((f) => String(f.emberResilience).length)),
    score: Math.max(5, ...feathers.map((f) => String(f.qualityScore).length)),
  }

  const lines: string[] = [chalk.bold('Ruby Feathers'), '']

  const header =
    chalk.red(padRight('File', colWidths.file)) +
    '  ' +
    chalk.red(padLeft('Vitality', colWidths.vitality)) +
    '  ' +
    chalk.red(padLeft('Rebirth', colWidths.rebirth)) +
    '  ' +
    chalk.red(padLeft('Wisdom', colWidths.wisdom)) +
    '  ' +
    chalk.red(padLeft('Precision', colWidths.precision)) +
    '  ' +
    chalk.red(padLeft('Resilience', colWidths.resilience)) +
    '  ' +
    chalk.red(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const f of feathers) {
    lines.push(
      padRight(f.file, colWidths.file) +
        '  ' +
        padLeft(String(f.crimsonVitality), colWidths.vitality) +
        '  ' +
        padLeft(String(f.rebirthQuality), colWidths.rebirth) +
        '  ' +
        padLeft(String(f.ashWisdom), colWidths.wisdom) +
        '  ' +
        padLeft(String(f.flamePrecision), colWidths.precision) +
        '  ' +
        padLeft(String(f.emberResilience), colWidths.resilience) +
        '  ' +
        padLeft(String(f.qualityScore), colWidths.score),
    )
  }

  return lines.join('\n')
}

/** @example formatNestTable(nest) */
export function formatNestTable(nest: RubyNest): string {
  const lines: string[] = [
    chalk.bold(`Ruby Nest: ${nest.directory}`),
    '',
    `  Feathers:         ${nest.feathers.length}`,
    `  Avg Vitality:     ${colorScore(nest.avgVitality)}`,
    `  Avg Precision:    ${colorScore(nest.avgPrecision)}`,
    `  Avg Resilience:   ${colorScore(nest.avgResilience)}`,
    `  Masterpieces:     ${nest.phoenixMasterpieceCount}`,
    `  Nest Type:        ${nest.nestType}`,
    `  Condition:        ${colorNestCondition(nest.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatNestsTable(nests) */
export function formatNestsTable(nests: RubyNest[]): string {
  if (nests.length === 0) return chalk.dim('No ruby nests found')

  const lines: string[] = [chalk.bold('Ruby Nests'), '']

  for (const n of nests) {
    lines.push(
      `  ${chalk.red(n.directory)}  ${colorScore(n.avgVitality)}  ${colorNestCondition(n.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: RubyPhoenixStats): string {
  const lines: string[] = [
    chalk.bold('Ruby Phoenix Statistics'),
    '',
    `  Total Files:           ${stats.totalFiles}`,
    `  Total Nests:           ${stats.totalNests}`,
    `  Avg Crimson Vitality:  ${colorScore(stats.avgCrimsonVitality)}`,
    `  Avg Rebirth Quality:   ${colorScore(stats.avgRebirthQuality)}`,
    `  Avg Ash Wisdom:        ${colorScore(stats.avgAshWisdom)}`,
    `  Avg Flame Precision:   ${colorScore(stats.avgFlamePrecision)}`,
    `  Avg Ember Resilience:  ${colorScore(stats.avgEmberResilience)}`,
    `  Phoenix Masterpieces:  ${stats.phoenixMasterpieceCount}`,
    `  Reborn Glories:        ${stats.rebornGloryCount}`,
    `  Proper Birds:          ${stats.properBirdCount}`,
    `  Dying Flames:          ${stats.dyingFlameCount}`,
    `  Cold Remains:          ${stats.coldRemainsCount}`,
    `  Void:                  ${stats.voidCount}`,
    `  Overall Inferno:       ${colorScore(stats.overallInferno)}`,
    `  Phoenix Grade:         ${stats.phoenixGrade}`,
    `  Best Feather:          ${stats.bestFeather || 'N/A'}`,
    `  Most Vital:            ${stats.mostVital || 'N/A'}`,
    `  Most Reborn:           ${stats.mostReborn || 'N/A'}`,
    `  Wisest:                ${stats.wisest || 'N/A'}`,
    `  Most Precise:          ${stats.mostPrecise || 'N/A'}`,
    `  Most Resilient:        ${stats.mostResilient || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.red('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: RubyPhoenixResult): string {
  const lines: string[] = [
    chalk.bold('Ruby Phoenix Analysis'),
    '',
    formatFeathersTable(result.feathers),
    '',
    formatNestsTable(result.nests),
    '',
    chalk.bold('Blaze Overview'),
    '',
    `  Avg Vitality:     ${colorScore(result.blaze.avgVitality)}`,
    `  Avg Precision:    ${colorScore(result.blaze.avgPrecision)}`,
    `  Avg Resilience:   ${colorScore(result.blaze.avgResilience)}`,
    `  Overall Inferno:  ${colorScore(result.blaze.overallInferno)}`,
    `  Is Phoenix:       ${result.blaze.isPhoenix ? chalk.red('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: RubyPhoenixResult): string {
  return JSON.stringify(result, null, 2)
}
