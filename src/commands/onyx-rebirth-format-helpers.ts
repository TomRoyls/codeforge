import chalk from 'chalk'

import type { FirebirdGrade, NestCondition, NestType, OnyxFeather, OnyxNest, OnyxPhoenixResult, OnyxCondition } from './onyx-rebirth-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(40, 20, 20)(String(score))
  if (score >= 75) return chalk.rgb(60, 20, 30)(String(score))
  if (score >= 60) return chalk.rgb(80, 30, 20)(String(score))
  if (score >= 40) return chalk.rgb(50, 20, 20)(String(score))
  if (score >= 20) return chalk.rgb(30, 15, 15)(String(score))
  return chalk.gray(String(score))
}

/** @example colorOnyxCondition('onyx-masterpiece') */
export function colorOnyxCondition(condition: OnyxCondition | string): string {
  switch (condition) {
    case 'onyx-masterpiece': return chalk.rgb(40, 20, 20)('onyx-masterpiece')
    case 'phoenix-gem': return chalk.rgb(60, 20, 30)('phoenix-gem')
    case 'proper-onyx': return chalk.rgb(80, 30, 20)('proper-onyx')
    case 'burnt-stone': return chalk.rgb(50, 20, 20)('burnt-stone')
    case 'cold-ember': return chalk.rgb(30, 15, 15)('cold-ember')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorNestType('phoenix-nest') */
export function colorNestType(type: NestType | string): string {
  switch (type) {
    case 'phoenix-nest': return chalk.rgb(40, 20, 20)('phoenix-nest')
    case 'ash-pyre': return chalk.rgb(60, 20, 30)('ash-pyre')
    case 'proper-roost': return chalk.rgb(80, 30, 20)('proper-roost')
    case 'branch-perch': return chalk.rgb(50, 20, 20)('branch-perch')
    case 'empty-ground': return chalk.rgb(30, 15, 15)('empty-ground')
    case 'no-nest': return chalk.gray('no-nest')
    default: return chalk.gray(String(type))
  }
}

/** @example colorNestCondition('onyx-palace') */
export function colorNestCondition(condition: NestCondition | string): string {
  switch (condition) {
    case 'onyx-palace': return chalk.rgb(40, 20, 20)('onyx-palace')
    case 'dark-spire': return chalk.rgb(60, 20, 30)('dark-spire')
    case 'proper-tower': return chalk.rgb(80, 30, 20)('proper-tower')
    case 'stone-ruin': return chalk.rgb(50, 20, 20)('stone-ruin')
    case 'empty-hearth': return chalk.rgb(30, 15, 15)('empty-hearth')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorFirebirdGrade('immortal-phoenix') */
export function colorFirebirdGrade(grade: FirebirdGrade | string): string {
  switch (grade) {
    case 'immortal-phoenix': return chalk.rgb(40, 20, 20)('immortal-phoenix')
    case 'rising-firebird': return chalk.rgb(60, 20, 30)('rising-firebird')
    case 'proper-fledgling': return chalk.rgb(80, 30, 20)('proper-fledgling')
    case 'nestling': return chalk.rgb(50, 20, 20)('nestling')
    case 'egg': return chalk.rgb(30, 15, 15)('egg')
    case 'ash': return chalk.gray('ash')
    default: return chalk.gray(String(grade))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatFeatherTable(feather) */
export function formatFeatherTable(feather: OnyxFeather): string {
  const lines: string[] = [
    chalk.bold(`Onyx Feather: ${feather.file}`),
    '',
    `  Obsidian Rebirth:  ${colorScore(feather.obsidianRebirth)}  ${chalk.dim(`(${feather.transforming.flame})`)}`,
    `  Ash Precision:     ${colorScore(feather.ashPrecision)}  ${chalk.dim(`(${feather.refining.ash})`)}`,
    `  Dark Resilience:   ${colorScore(feather.darkResilience)}  ${chalk.dim(`(${feather.enduring.shadow})`)}`,
    `  Fire Clarity:      ${colorScore(feather.fireClarity)}  ${chalk.dim(`(${feather.illuminating.light})`)}`,
    `  Phoenix Wisdom:    ${colorScore(feather.phoenixWisdom)}  ${chalk.dim(`(${feather.understanding.cycle})`)}`,
    '',
    `  Quality Score: ${colorScore(feather.qualityScore)}  ${chalk.dim(`(${feather.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatFeathersTable(feathers) */
export function formatFeathersTable(feathers: OnyxFeather[]): string {
  if (feathers.length === 0) return chalk.dim('No onyx feathers found')
  const lines: string[] = [chalk.bold('Onyx Feathers'), '']
  for (const f of feathers) {
    lines.push(`  ${chalk.rgb(40, 20, 20)(f.file)}  Reb:${colorScore(f.obsidianRebirth)}  Prec:${colorScore(f.ashPrecision)}  Score:${colorScore(f.qualityScore)}`)
  }
  return lines.join('\n')
}

/** @example formatNestTable(nest) */
export function formatNestTable(nest: OnyxNest): string {
  const lines: string[] = [
    chalk.bold(`Onyx Nest: ${nest.directory}`),
    '',
    `  Feathers:           ${nest.feathers.length}`,
    `  Avg Rebirth:        ${colorScore(nest.avgRebirth)}`,
    `  Avg Precision:      ${colorScore(nest.avgPrecision)}`,
    `  Avg Wisdom:         ${colorScore(nest.avgWisdom)}`,
    `  Masterpieces:       ${nest.onyxMasterpieceCount}`,
    `  Nest Type:          ${colorNestType(nest.nestType)}`,
    `  Condition:          ${colorNestCondition(nest.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatNestsTable(nests) */
export function formatNestsTable(nests: OnyxNest[]): string {
  if (nests.length === 0) return chalk.dim('No onyx nests found')
  const lines: string[] = [chalk.bold('Onyx Nests'), '']
  for (const n of nests) {
    lines.push(`  ${chalk.rgb(40, 20, 20)(n.directory)}  ${colorScore(n.avgRebirth)}  ${colorNestCondition(n.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: OnyxPhoenixResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Onyx Phoenix Statistics'),
    '',
    `  Total Files:               ${stats.totalFiles}`,
    `  Total Nests:               ${stats.totalNests}`,
    `  Avg Obsidian Rebirth:      ${colorScore(stats.avgObsidianRebirth)}`,
    `  Avg Ash Precision:         ${colorScore(stats.avgAshPrecision)}`,
    `  Avg Dark Resilience:       ${colorScore(stats.avgDarkResilience)}`,
    `  Avg Fire Clarity:          ${colorScore(stats.avgFireClarity)}`,
    `  Avg Phoenix Wisdom:        ${colorScore(stats.avgPhoenixWisdom)}`,
    `  Onyx Masterpieces:         ${stats.onyxMasterpieceCount}`,
    `  Phoenix Gems:              ${stats.phoenixGemCount}`,
    `  Proper Onyx:               ${stats.properOnyxCount}`,
    `  Burnt Stones:              ${stats.burntStoneCount}`,
    `  Cold Embers:               ${stats.coldEmberCount}`,
    `  Void:                      ${stats.voidCount}`,
    `  Overall Rebirth:           ${colorScore(stats.overallRebirth)}`,
    `  Firebird Grade:            ${colorFirebirdGrade(stats.firebirdGrade)}`,
    `  Best Feather:              ${stats.bestFeather || 'N/A'}`,
    `  Most Transformed:          ${stats.mostTransformed || 'N/A'}`,
    `  Most Precise:              ${stats.mostPrecise || 'N/A'}`,
    `  Most Resilient:            ${stats.mostResilient || 'N/A'}`,
    `  Clearest:                  ${stats.clearest || 'N/A'}`,
    `  Wisest:                    ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(40, 20, 20)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: OnyxPhoenixResult): string {
  const lines: string[] = [
    chalk.bold('Onyx Phoenix Analysis'),
    '',
    formatFeathersTable(result.feathers),
    '',
    formatNestsTable(result.nests),
    '',
    chalk.bold('Pyre Overview'),
    '',
    `  Avg Rebirth:          ${colorScore(result.pyre.avgRebirth)}`,
    `  Avg Precision:        ${colorScore(result.pyre.avgPrecision)}`,
    `  Avg Wisdom:           ${colorScore(result.pyre.avgWisdom)}`,
    `  Overall Rebirth:      ${colorScore(result.pyre.overallRebirth)}`,
    `  Is Onyx:              ${result.pyre.isOnyx ? chalk.rgb(40, 20, 20)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: OnyxPhoenixResult): string {
  return JSON.stringify(result, null, 2)
}
