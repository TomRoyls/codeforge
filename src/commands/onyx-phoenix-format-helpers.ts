// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'

import type { OnyxPhoenixResult, OnyxFeather, OnyxNest } from './onyx-phoenix-helpers.js'

// ─── Color Palette ─────────────────────────────────────────────────

const ONYX = chalk.rgb(30, 30, 40)
const PHOENIX = chalk.rgb(220, 80, 40)
const FLAME = chalk.rgb(255, 160, 50)
const DIM = chalk.rgb(160, 140, 130)
const BULLET = '\u{1F426}'

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * @example colorScore(85)
 */
export function colorScore(score: number): string {
  if (score >= 80) return PHOENIX.bold(String(score))
  if (score >= 60) return FLAME(String(score))
  if (score >= 40) return ONYX.bold(String(score))
  if (score >= 20) return DIM(String(score))
  return chalk.gray(String(score))
}

/**
 * @example colorGrade('immortal-phoenix')
 */
export function colorGrade(grade: string): string {
  if (grade.includes('immortal') || grade.includes('obsidian') || grade.includes('perfect') || grade.includes('ancient') || grade.includes('surgical') || grade.includes('eternal') || grade.includes('phoenix-lord') || grade.includes('eternal-nest') || grade.includes('phoenix-sanctuary')) return PHOENIX.bold(grade)
  if (grade.includes('rising') || grade.includes('granite') || grade.includes('strong') || grade.includes('wise') || grade.includes('precise') || grade.includes('bright') || grade.includes('fire-keeper') || grade.includes('phoenix-roost') || grade.includes('rising-colony')) return FLAME(grade)
  if (grade.includes('proper') || grade.includes('healing') || grade.includes('insight') || grade.includes('flame') || grade.includes('heat') || grade.includes('ash-guardian') || grade.includes('proper-perch') || grade.includes('proper-flock')) return ONYX.bold(grade)
  return DIM(grade)
}

// ─── Feather Table ─────────────────────────────────────────────────

/**
 * @example formatFeatherTable(feather)
 */
export function formatFeatherTable(feather: OnyxFeather): string {
  const lines: string[] = []
  lines.push(PHOENIX.bold(`${BULLET} ${feather.file}`))
  lines.push(`  Dark Resilience   : ${colorScore(feather.darkResilience)}  ${colorGrade(feather.enduring.stone)}`)
  lines.push(`  Rebirth Quality   : ${colorScore(feather.rebirthQuality)}  ${colorGrade(feather.regenerating.rebirth)}`)
  lines.push(`  Ash Wisdom        : ${colorScore(feather.ashWisdom)}  ${colorGrade(feather.learning.ash)}`)
  lines.push(`  Flame Precision   : ${colorScore(feather.flamePrecision)}  ${colorGrade(feather.burning.flame)}`)
  lines.push(`  Ember Vitality    : ${colorScore(feather.emberVitality)}  ${colorGrade(feather.glowing.ember)}`)
  lines.push(`  Quality Score     : ${colorScore(feather.qualityScore)}  ${colorGrade(feather.condition)}`)
  return lines.join('\n')
}

/**
 * @example formatFeathersTable(feathers)
 */
export function formatFeathersTable(feathers: OnyxFeather[]): string {
  if (feathers.length === 0) return chalk.gray('No onyx feathers to display')
  return feathers.map(formatFeatherTable).join('\n\n')
}

// ─── Nest Table ────────────────────────────────────────────────────

/**
 * @example formatNestTable(nest)
 */
export function formatNestTable(nest: OnyxNest): string {
  const lines: string[] = []
  lines.push(PHOENIX.bold(`${BULLET} ${nest.directory}`))
  lines.push(`  Feathers          : ${nest.feathers.length}`)
  lines.push(`  Avg Resilience    : ${colorScore(nest.avgResilience)}`)
  lines.push(`  Avg Rebirth       : ${colorScore(nest.avgRebirth)}`)
  lines.push(`  Avg Wisdom        : ${colorScore(nest.avgWisdom)}`)
  lines.push(`  Immortal Phoenix  : ${nest.immortalPhoenixCount}`)
  lines.push(`  Ash               : ${nest.ashCount}`)
  lines.push(`  Nest Type         : ${colorGrade(nest.nestType)}`)
  lines.push(`  Condition         : ${colorGrade(nest.condition)}`)
  return lines.join('\n')
}

/**
 * @example formatNestsTable(nests)
 */
export function formatNestsTable(nests: OnyxNest[]): string {
  if (nests.length === 0) return chalk.gray('No onyx nests to display')
  return nests.map(formatNestTable).join('\n\n')
}

// ─── Stats Table ───────────────────────────────────────────────────

/**
 * @example formatStatsTable(stats)
 */
export function formatStatsTable(stats: OnyxPhoenixResult['stats']): string {
  const lines: string[] = []
  lines.push(PHOENIX.bold('Onyx Phoenix Statistics'))
  lines.push(`  Total Files         : ${stats.totalFiles}`)
  lines.push(`  Total Nests         : ${stats.totalNests}`)
  lines.push(`  Avg Dark Resilience : ${colorScore(stats.avgDarkResilience)}`)
  lines.push(`  Avg Rebirth Quality : ${colorScore(stats.avgRebirthQuality)}`)
  lines.push(`  Avg Ash Wisdom      : ${colorScore(stats.avgAshWisdom)}`)
  lines.push(`  Avg Flame Precision : ${colorScore(stats.avgFlamePrecision)}`)
  lines.push(`  Avg Ember Vitality  : ${colorScore(stats.avgEmberVitality)}`)
  lines.push(`  Immortal Phoenix    : ${stats.immortalPhoenixCount}`)
  lines.push(`  Rising Bird         : ${stats.risingBirdCount}`)
  lines.push(`  Proper Firebird     : ${stats.properFirebirdCount}`)
  lines.push(`  Wounded Falcon      : ${stats.woundedFalconCount}`)
  lines.push(`  Fallen Bird         : ${stats.fallenBirdCount}`)
  lines.push(`  Ash                 : ${stats.ashCount}`)
  lines.push(`  Overall Rebirth     : ${colorScore(stats.overallRebirth)}`)
  lines.push(`  Keeper Grade        : ${colorGrade(stats.keeperGrade)}`)
  lines.push(`  Best Feather        : ${FLAME(stats.bestFeather)}`)
  lines.push(`  Most Resilient      : ${FLAME(stats.mostResilient)}`)
  lines.push(`  Best Rebirth        : ${FLAME(stats.bestRebirth)}`)
  lines.push(`  Wisest              : ${FLAME(stats.wisest)}`)
  lines.push(`  Most Precise        : ${FLAME(stats.mostPrecise)}`)
  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────

/**
 * @example formatRecommendations(['improve X'])
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.gray('No recommendations')
  return recs.map(r => `${BULLET} ${FLAME(r)}`).join('\n')
}

// ─── Full Result ───────────────────────────────────────────────────

/**
 * @example formatResultTable(result)
 */
export function formatResultTable(result: OnyxPhoenixResult): string {
  const sections: string[] = []

  sections.push(PHOENIX.bold('Onyx Feather Analysis'))
  sections.push(formatFeathersTable(result.feathers))
  sections.push('')
  sections.push(PHOENIX.bold('Onyx Nests'))
  sections.push(formatNestsTable(result.nests))
  sections.push('')
  sections.push(formatStatsTable(result.stats))
  sections.push('')
  sections.push(PHOENIX.bold('Flight'))
  sections.push(`  Avg Resilience  : ${colorScore(result.flight.avgResilience)}`)
  sections.push(`  Avg Rebirth     : ${colorScore(result.flight.avgRebirth)}`)
  sections.push(`  Avg Wisdom      : ${colorScore(result.flight.avgWisdom)}`)
  sections.push(`  Is Immortal     : ${result.flight.isImmortal ? PHOENIX.bold('YES') : chalk.gray('NO')}`)
  sections.push(`  Overall Rebirth : ${colorScore(result.flight.overallRebirth)}`)
  sections.push('')
  sections.push(PHOENIX.bold('Recommendations'))
  sections.push(formatRecommendations(result.recommendations))

  return sections.join('\n')
}

/**
 * @example formatResultJson(result)
 */
export function formatResultJson(result: OnyxPhoenixResult): string {
  return JSON.stringify(result, null, 2)
}
