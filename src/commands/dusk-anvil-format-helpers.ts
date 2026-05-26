import chalk from 'chalk'

import type { HearthCondition, TwilightForgeResult, TwilightHearth, TwilightSpark } from './dusk-anvil-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(255, 140, 50)(String(score))
  if (score >= 75) return chalk.rgb(220, 120, 40)(String(score))
  if (score >= 60) return chalk.rgb(185, 100, 35)(String(score))
  if (score >= 40) return chalk.rgb(150, 80, 30)(String(score))
  if (score >= 20) return chalk.rgb(115, 60, 25)(String(score))
  return chalk.gray(String(score))
}

/** @example colorHearthCondition('twilight-sanctuary') */
export function colorHearthCondition(condition: HearthCondition | string): string {
  switch (condition) {
    case 'twilight-sanctuary': return chalk.rgb(255, 140, 50)('twilight-sanctuary')
    case 'ember-hall': return chalk.rgb(220, 120, 40)('ember-hall')
    case 'proper-workshop': return chalk.rgb(185, 100, 35)('proper-workshop')
    case 'dark-corner': return chalk.rgb(150, 80, 30)('dark-corner')
    case 'void-space': return chalk.rgb(115, 60, 25)('void-space')
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

/** @example formatSparkTable(spark) */
export function formatSparkTable(spark: TwilightSpark): string {
  const lines: string[] = [
    chalk.bold(`Twilight Spark: ${spark.file}`),
    '',
    `  Transition Grace:  ${colorScore(spark.transitionGrace)}  ${chalk.dim(`(${spark.transitioning.transition})`)}`,
    `  Dusk Resilience:   ${colorScore(spark.duskResilience)}  ${chalk.dim(`(${spark.enduring.dusk})`)}`,
    `  Star Emergence:    ${colorScore(spark.starEmergence)}  ${chalk.dim(`(${spark.revealing.stars})`)}`,
    `  Forge Twilight:    ${colorScore(spark.forgeTwilight)}  ${chalk.dim(`(${spark.crafting.forge})`)}`,
    `  Ember Wisdom:      ${colorScore(spark.emberWisdom)}  ${chalk.dim(`(${spark.glowing.ember})`)}`,
    '',
    `  Quality Score: ${colorScore(spark.qualityScore)}  ${chalk.dim(`(${spark.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatSparksTable(sparks) */
export function formatSparksTable(sparks: TwilightSpark[]): string {
  if (sparks.length === 0) return chalk.dim('No twilight sparks found')
  const colWidths = {
    file: Math.max(4, ...sparks.map((s) => s.file.length)),
    gr: Math.max(4, ...sparks.map((s) => String(s.transitionGrace).length)),
    res: Math.max(4, ...sparks.map((s) => String(s.duskResilience).length)),
    star: Math.max(4, ...sparks.map((s) => String(s.starEmergence).length)),
    tw: Math.max(4, ...sparks.map((s) => String(s.forgeTwilight).length)),
    emb: Math.max(4, ...sparks.map((s) => String(s.emberWisdom).length)),
    score: Math.max(5, ...sparks.map((s) => String(s.qualityScore).length)),
  }
  const lines: string[] = [chalk.bold('Twilight Sparks'), '']
  const header =
    chalk.rgb(255, 140, 50)(padRight('File', colWidths.file)) + '  ' +
    chalk.rgb(255, 140, 50)(padLeft('Grace', colWidths.gr)) + '  ' +
    chalk.rgb(255, 140, 50)(padLeft('Dusk', colWidths.res)) + '  ' +
    chalk.rgb(255, 140, 50)(padLeft('Star', colWidths.star)) + '  ' +
    chalk.rgb(255, 140, 50)(padLeft('Forge', colWidths.tw)) + '  ' +
    chalk.rgb(255, 140, 50)(padLeft('Ember', colWidths.emb)) + '  ' +
    chalk.rgb(255, 140, 50)(padLeft('Score', colWidths.score))
  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))
  for (const s of sparks) {
    lines.push(
      padRight(s.file, colWidths.file) + '  ' +
      padLeft(String(s.transitionGrace), colWidths.gr) + '  ' +
      padLeft(String(s.duskResilience), colWidths.res) + '  ' +
      padLeft(String(s.starEmergence), colWidths.star) + '  ' +
      padLeft(String(s.forgeTwilight), colWidths.tw) + '  ' +
      padLeft(String(s.emberWisdom), colWidths.emb) + '  ' +
      padLeft(String(s.qualityScore), colWidths.score),
    )
  }
  return lines.join('\n')
}

/** @example formatHearthTable(hearth) */
export function formatHearthTable(hearth: TwilightHearth): string {
  const lines: string[] = [
    chalk.bold(`Twilight Hearth: ${hearth.directory}`),
    '',
    `  Sparks:        ${hearth.sparks.length}`,
    `  Avg Grace:     ${colorScore(hearth.avgGrace)}`,
    `  Avg Resilience:${colorScore(hearth.avgResilience)}`,
    `  Avg Wisdom:    ${colorScore(hearth.avgWisdom)}`,
    `  Masterpieces:  ${hearth.twilightMasterpieceCount}`,
    `  Hearth Type:   ${hearth.hearthType}`,
    `  Condition:     ${colorHearthCondition(hearth.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatHearthsTable(hearths) */
export function formatHearthsTable(hearths: TwilightHearth[]): string {
  if (hearths.length === 0) return chalk.dim('No twilight hearths found')
  const lines: string[] = [chalk.bold('Twilight Hearths'), '']
  for (const h of hearths) {
    lines.push(`  ${chalk.rgb(255, 140, 50)(h.directory)}  ${colorScore(h.avgGrace)}  ${colorHearthCondition(h.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: TwilightForgeResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Twilight Forge Statistics'),
    '',
    `  Total Files:               ${stats.totalFiles}`,
    `  Total Hearths:             ${stats.totalHearths}`,
    `  Avg Transition Grace:      ${colorScore(stats.avgTransitionGrace)}`,
    `  Avg Dusk Resilience:       ${colorScore(stats.avgDuskResilience)}`,
    `  Avg Star Emergence:        ${colorScore(stats.avgStarEmergence)}`,
    `  Avg Forge Twilight:        ${colorScore(stats.avgForgeTwilight)}`,
    `  Avg Ember Wisdom:          ${colorScore(stats.avgEmberWisdom)}`,
    `  Twilight Masterpieces:     ${stats.twilightMasterpieceCount}`,
    `  Golden Hour Perfection:    ${stats.goldenHourPerfectionCount}`,
    `  Proper Dusk:               ${stats.properDuskCount}`,
    `  Fading Light:              ${stats.fadingLightCount}`,
    `  Pitch Dark:                ${stats.pitchDarkCount}`,
    `  Void:                      ${stats.voidCount}`,
    `  Overall Luminosity:        ${colorScore(stats.overallLuminosity)}`,
    `  Smith Grade:               ${stats.smithGrade}`,
    `  Best Spark:                ${stats.bestSpark || 'N/A'}`,
    `  Most Graceful:             ${stats.mostGraceful || 'N/A'}`,
    `  Most Resilient:            ${stats.mostResilient || 'N/A'}`,
    `  Most Revealing:            ${stats.mostRevealing || 'N/A'}`,
    `  Best Forged:               ${stats.bestForged || 'N/A'}`,
    `  Wisest:                    ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(255, 140, 50)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: TwilightForgeResult): string {
  const lines: string[] = [
    chalk.bold('Twilight Forge Analysis'),
    '',
    formatSparksTable(result.sparks),
    '',
    formatHearthsTable(result.hearths),
    '',
    chalk.bold('Evening Overview'),
    '',
    `  Avg Grace:      ${colorScore(result.evening.avgGrace)}`,
    `  Avg Resilience: ${colorScore(result.evening.avgResilience)}`,
    `  Avg Wisdom:     ${colorScore(result.evening.avgWisdom)}`,
    `  Luminosity:     ${colorScore(result.evening.overallLuminosity)}`,
    `  Is Twilight:    ${result.evening.isTwilight ? chalk.rgb(255, 140, 50)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: TwilightForgeResult): string {
  return JSON.stringify(result, null, 2)
}
