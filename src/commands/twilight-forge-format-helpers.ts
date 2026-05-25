// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'

import type { TwilightForgeResult, TwilightSpark, TwilightWorkshop } from './twilight-forge-helpers.js'

// ─── Color Palette ─────────────────────────────────────────────────

const TWILIGHT = chalk.rgb(180, 120, 255)
const EMBER = chalk.rgb(255, 140, 50)
const STAR = chalk.rgb(255, 220, 100)
const DIM = chalk.rgb(140, 145, 160)
const BULLET = '\u{1F525}'

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * @example colorScore(85)
 */
export function colorScore(score: number): string {
  if (score >= 80) return TWILIGHT.bold(String(score))
  if (score >= 60) return EMBER(String(score))
  if (score >= 40) return STAR(String(score))
  if (score >= 20) return DIM(String(score))
  return chalk.gray(String(score))
}

/**
 * @example colorGrade('twilight-masterpiece')
 */
export function colorGrade(grade: string): string {
  if (grade.includes('masterpiece') || grade.includes('grand-atelier') || grade.includes('twilight-empire') || grade.includes('twilight-master') || grade.includes('seamless') || grade.includes('night-vision') || grade.includes('first-star') || grade.includes('adaptive-smith') || grade.includes('dying-sun')) return TWILIGHT.bold(grade)
  if (grade.includes('starlit') || grade.includes('proper') || grade.includes('smooth') || grade.includes('low-light') || grade.includes('bright-planet') || grade.includes('flexible') || grade.includes('twilight-sage') || grade.includes('small-workshop') || grade.includes('star-forger') || grade.includes('dusk-smith')) return EMBER(grade)
  if (grade.includes('fading') || grade.includes('jarring') || grade.includes('light-dependent') || grade.includes('dim-star') || grade.includes('rigid') || grade.includes('fading-memory') || grade.includes('humble-shed') || grade.includes('dim-foundry') || grade.includes('apprentice')) return STAR(grade)
  return DIM(grade)
}

// ─── Spark Table ───────────────────────────────────────────────────

/**
 * @example formatSparkTable(spark)
 */
export function formatSparkTable(spark: TwilightSpark): string {
  const lines: string[] = []
  lines.push(TWILIGHT.bold(`${BULLET} ${spark.file}`))
  lines.push(`  Transition Grace  : ${colorScore(spark.transitionGrace)}  ${colorGrade(spark.bridging.transition)}`)
  lines.push(`  Dusk Resilience   : ${colorScore(spark.duskResilience)}  ${colorGrade(spark.enduring.dusk)}`)
  lines.push(`  Star Emergence    : ${colorScore(spark.starEmergence)}  ${colorGrade(spark.emerging.star)}`)
  lines.push(`  Forge Twilight    : ${colorScore(spark.forgeTwilight)}  ${colorGrade(spark.adapting.forge)}`)
  lines.push(`  Ember Wisdom      : ${colorScore(spark.emberWisdom)}  ${colorGrade(spark.knowing.ember)}`)
  lines.push(`  Quality Score     : ${colorScore(spark.qualityScore)}  ${colorGrade(spark.condition)}`)
  return lines.join('\n')
}

/**
 * @example formatSparksTable(sparks)
 */
export function formatSparksTable(sparks: TwilightSpark[]): string {
  if (sparks.length === 0) return chalk.gray('No twilight sparks to display')
  return sparks.map(formatSparkTable).join('\n\n')
}

// ─── Workshop Table ────────────────────────────────────────────────

/**
 * @example formatWorkshopTable(workshop)
 */
export function formatWorkshopTable(workshop: TwilightWorkshop): string {
  const lines: string[] = []
  lines.push(TWILIGHT.bold(`${BULLET} ${workshop.directory}`))
  lines.push(`  Sparks              : ${workshop.sparks.length}`)
  lines.push(`  Avg Grace           : ${colorScore(workshop.avgGrace)}`)
  lines.push(`  Avg Resilience      : ${colorScore(workshop.avgResilience)}`)
  lines.push(`  Avg Wisdom          : ${colorScore(workshop.avgWisdom)}`)
  lines.push(`  Twilight Masterpieces: ${workshop.twilightMasterpieceCount}`)
  lines.push(`  Void                : ${workshop.voidCount}`)
  lines.push(`  Workshop Type       : ${colorGrade(workshop.workshopType)}`)
  lines.push(`  Condition           : ${colorGrade(workshop.condition)}`)
  return lines.join('\n')
}

/**
 * @example formatWorkshopsTable(workshops)
 */
export function formatWorkshopsTable(workshops: TwilightWorkshop[]): string {
  if (workshops.length === 0) return chalk.gray('No twilight workshops to display')
  return workshops.map(formatWorkshopTable).join('\n\n')
}

// ─── Stats Table ───────────────────────────────────────────────────

/**
 * @example formatStatsTable(stats)
 */
export function formatStatsTable(stats: TwilightForgeResult['stats']): string {
  const lines: string[] = []
  lines.push(TWILIGHT.bold('Twilight Forge Statistics'))
  lines.push(`  Total Files          : ${stats.totalFiles}`)
  lines.push(`  Total Workshops      : ${stats.totalWorkshops}`)
  lines.push(`  Avg Transition Grace : ${colorScore(stats.avgTransitionGrace)}`)
  lines.push(`  Avg Dusk Resilience  : ${colorScore(stats.avgDuskResilience)}`)
  lines.push(`  Avg Star Emergence   : ${colorScore(stats.avgStarEmergence)}`)
  lines.push(`  Avg Forge Twilight   : ${colorScore(stats.avgForgeTwilight)}`)
  lines.push(`  Avg Ember Wisdom     : ${colorScore(stats.avgEmberWisdom)}`)
  lines.push(`  Twilight Masterpiece : ${stats.twilightMasterpieceCount}`)
  lines.push(`  Starlit Forge        : ${stats.starlitForgeCount}`)
  lines.push(`  Proper Dusk          : ${stats.properDuskCount}`)
  lines.push(`  Fading Light         : ${stats.fadingLightCount}`)
  lines.push(`  Dark Forge           : ${stats.darkForgeCount}`)
  lines.push(`  Void                 : ${stats.voidCount}`)
  lines.push(`  Overall Luminosity   : ${colorScore(stats.overallLuminosity)}`)
  lines.push(`  Smith Grade          : ${colorGrade(stats.smithGrade)}`)
  lines.push(`  Best Spark           : ${EMBER(stats.bestSpark)}`)
  lines.push(`  Most Graceful        : ${EMBER(stats.mostGraceful)}`)
  lines.push(`  Most Resilient       : ${EMBER(stats.mostResilient)}`)
  lines.push(`  Brightest            : ${EMBER(stats.brightest)}`)
  lines.push(`  Wisest               : ${EMBER(stats.wisest)}`)
  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────

/**
 * @example formatRecommendations(['improve X'])
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.gray('No recommendations')
  return recs.map(r => `${BULLET} ${EMBER(r)}`).join('\n')
}

// ─── Full Result ───────────────────────────────────────────────────

/**
 * @example formatResultTable(result)
 */
export function formatResultTable(result: TwilightForgeResult): string {
  const sections: string[] = []

  sections.push(TWILIGHT.bold('Twilight Spark Analysis'))
  sections.push(formatSparksTable(result.sparks))
  sections.push('')
  sections.push(TWILIGHT.bold('Twilight Workshops'))
  sections.push(formatWorkshopsTable(result.workshops))
  sections.push('')
  sections.push(formatStatsTable(result.stats))
  sections.push('')
  sections.push(TWILIGHT.bold('Dusk'))
  sections.push(`  Avg Grace           : ${colorScore(result.dusk.avgGrace)}`)
  sections.push(`  Avg Resilience      : ${colorScore(result.dusk.avgResilience)}`)
  sections.push(`  Avg Wisdom          : ${colorScore(result.dusk.avgWisdom)}`)
  sections.push(`  Is Twilight         : ${result.dusk.isTwilight ? TWILIGHT.bold('YES') : chalk.gray('NO')}`)
  sections.push(`  Overall Luminosity  : ${colorScore(result.dusk.overallLuminosity)}`)
  sections.push('')
  sections.push(TWILIGHT.bold('Recommendations'))
  sections.push(formatRecommendations(result.recommendations))

  return sections.join('\n')
}

/**
 * @example formatResultJson(result)
 */
export function formatResultJson(result: TwilightForgeResult): string {
  return JSON.stringify(result, null, 2)
}
