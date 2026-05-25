// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'

import type { AmberEmberResult, AmberGlow, AmberHearth } from './amber-ember-helpers.js'

// ─── Color Palette ─────────────────────────────────────────────────

const AMBER = chalk.rgb(255, 191, 0)
const EMBER = chalk.rgb(255, 140, 0)
const WARM = chalk.rgb(200, 160, 80)
const DIM = chalk.rgb(140, 145, 160)
const BULLET = '\u{1F525}'

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * @example colorScore(85)
 */
export function colorScore(score: number): string {
  if (score >= 80) return EMBER.bold(String(score))
  if (score >= 60) return WARM(String(score))
  if (score >= 40) return AMBER.bold(String(score))
  if (score >= 20) return DIM(String(score))
  return chalk.gray(String(score))
}

/**
 * @example colorGrade('amber-masterpiece')
 */
export function colorGrade(grade: string): string {
  if (grade.includes('masterpiece') || grade.includes('golden') || grade.includes('diamond') || grade.includes('ancient') || grade.includes('eternal') || grade.includes('fire-keeper') || grade.includes('inner-radiance') || grade.includes('golden-warmth')) return EMBER.bold(grade)
  if (grade.includes('proper') || grade.includes('strong') || grade.includes('warm') || grade.includes('bright') || grade.includes('long') || grade.includes('preserved') || grade.includes('ember-guardian') || grade.includes('hearth-tender')) return WARM(grade)
  if (grade.includes('soft') || grade.includes('fading') || grade.includes('dying') || grade.includes('cool') || grade.includes('dim') || grade.includes('apprentice') || grade.includes('small-candle')) return AMBER.bold(grade)
  return DIM(grade)
}

// ─── Glow Table ────────────────────────────────────────────────────

/**
 * @example formatGlowTable(glow)
 */
export function formatGlowTable(glow: AmberGlow): string {
  const lines: string[] = []
  lines.push(EMBER.bold(`${BULLET} ${glow.file}`))
  lines.push(`  Preservation Warmth : ${colorScore(glow.preservationWarmth)}  ${colorGrade(glow.warming.amber)}`)
  lines.push(`  Glow Clarity        : ${colorScore(glow.glowClarity)}  ${colorGrade(glow.illuminating.glow)}`)
  lines.push(`  Fire Persistence    : ${colorScore(glow.firePersistence)}  ${colorGrade(glow.enduring.ember)}`)
  lines.push(`  Ash Wisdom          : ${colorScore(glow.ashWisdom)}  ${colorGrade(glow.learning.ash)}`)
  lines.push(`  Resin Strength      : ${colorScore(glow.resinStrength)}  ${colorGrade(glow.hardening.resin)}`)
  lines.push(`  Quality Score       : ${colorScore(glow.qualityScore)}  ${colorGrade(glow.condition)}`)
  return lines.join('\n')
}

/**
 * @example formatGlowsTable(glows)
 */
export function formatGlowsTable(glows: AmberGlow[]): string {
  if (glows.length === 0) return chalk.gray('No amber glows to display')
  return glows.map(formatGlowTable).join('\n\n')
}

// ─── Hearth Table ──────────────────────────────────────────────────

/**
 * @example formatHearthTable(hearth)
 */
export function formatHearthTable(hearth: AmberHearth): string {
  const lines: string[] = []
  lines.push(EMBER.bold(`${BULLET} ${hearth.directory}`))
  lines.push(`  Glows             : ${hearth.glows.length}`)
  lines.push(`  Avg Warmth        : ${colorScore(hearth.avgWarmth)}`)
  lines.push(`  Avg Clarity       : ${colorScore(hearth.avgClarity)}`)
  lines.push(`  Avg Persistence   : ${colorScore(hearth.avgPersistence)}`)
  lines.push(`  Amber Masterpieces: ${hearth.amberMasterpieceCount}`)
  lines.push(`  Dust              : ${hearth.dustCount}`)
  lines.push(`  Hearth Type       : ${colorGrade(hearth.hearthType)}`)
  lines.push(`  Condition         : ${colorGrade(hearth.condition)}`)
  return lines.join('\n')
}

/**
 * @example formatHearthsTable(hearths)
 */
export function formatHearthsTable(hearths: AmberHearth[]): string {
  if (hearths.length === 0) return chalk.gray('No amber hearths to display')
  return hearths.map(formatHearthTable).join('\n\n')
}

// ─── Stats Table ───────────────────────────────────────────────────

/**
 * @example formatStatsTable(stats)
 */
export function formatStatsTable(stats: AmberEmberResult['stats']): string {
  const lines: string[] = []
  lines.push(EMBER.bold('Amber Ember Statistics'))
  lines.push(`  Total Files          : ${stats.totalFiles}`)
  lines.push(`  Total Hearths        : ${stats.totalHearths}`)
  lines.push(`  Avg Preservation Warmth : ${colorScore(stats.avgPreservationWarmth)}`)
  lines.push(`  Avg Glow Clarity        : ${colorScore(stats.avgGlowClarity)}`)
  lines.push(`  Avg Fire Persistence    : ${colorScore(stats.avgFirePersistence)}`)
  lines.push(`  Avg Ash Wisdom          : ${colorScore(stats.avgAshWisdom)}`)
  lines.push(`  Avg Resin Strength      : ${colorScore(stats.avgResinStrength)}`)
  lines.push(`  Amber Masterpiece    : ${stats.amberMasterpieceCount}`)
  lines.push(`  Golden Fossil        : ${stats.goldenFossilCount}`)
  lines.push(`  Proper Resin         : ${stats.properResinCount}`)
  lines.push(`  Cloudy Copal         : ${stats.cloudyCopalCount}`)
  lines.push(`  Cracked Amber        : ${stats.crackedAmberCount}`)
  lines.push(`  Dust                 : ${stats.dustCount}`)
  lines.push(`  Overall Warmth       : ${colorScore(stats.overallWarmth)}`)
  lines.push(`  Keeper Grade         : ${colorGrade(stats.keeperGrade)}`)
  lines.push(`  Best Glow            : ${WARM(stats.bestGlow)}`)
  lines.push(`  Warmest              : ${WARM(stats.warmest)}`)
  lines.push(`  Clearest             : ${WARM(stats.clearest)}`)
  lines.push(`  Most Persistent      : ${WARM(stats.mostPersistent)}`)
  lines.push(`  Wisest               : ${WARM(stats.wisest)}`)
  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────

/**
 * @example formatRecommendations(['improve X'])
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.gray('No recommendations')
  return recs.map(r => `${BULLET} ${WARM(r)}`).join('\n')
}

// ─── Full Result ───────────────────────────────────────────────────

/**
 * @example formatResultTable(result)
 */
export function formatResultTable(result: AmberEmberResult): string {
  const sections: string[] = []

  sections.push(EMBER.bold('Amber Glow Analysis'))
  sections.push(formatGlowsTable(result.glows))
  sections.push('')
  sections.push(EMBER.bold('Amber Hearths'))
  sections.push(formatHearthsTable(result.hearths))
  sections.push('')
  sections.push(formatStatsTable(result.stats))
  sections.push('')
  sections.push(EMBER.bold('Fire'))
  sections.push(`  Avg Warmth      : ${colorScore(result.fire.avgWarmth)}`)
  sections.push(`  Avg Clarity     : ${colorScore(result.fire.avgClarity)}`)
  sections.push(`  Avg Persistence : ${colorScore(result.fire.avgPersistence)}`)
  sections.push(`  Is Amber        : ${result.fire.isAmber ? EMBER.bold('YES') : chalk.gray('NO')}`)
  sections.push(`  Overall Warmth  : ${colorScore(result.fire.overallWarmth)}`)
  sections.push('')
  sections.push(EMBER.bold('Recommendations'))
  sections.push(formatRecommendations(result.recommendations))

  return sections.join('\n')
}

/**
 * @example formatResultJson(result)
 */
export function formatResultJson(result: AmberEmberResult): string {
  return JSON.stringify(result, null, 2)
}
