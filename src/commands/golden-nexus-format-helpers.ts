// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'

import type { GoldenNexusResult, GoldenThread, GoldenWeb } from './golden-nexus-helpers.js'

// ─── Color Palette ─────────────────────────────────────────────────

const GOLD = chalk.rgb(255, 215, 0)
const AMBER = chalk.rgb(255, 191, 0)
const WARM = chalk.rgb(255, 165, 0)
const GLOW = chalk.rgb(255, 223, 100)
const DIM = chalk.rgb(180, 150, 50)
const BULLET = '\u2726'

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * @example colorScore(85)
 */
export function colorScore(score: number): string {
  if (score >= 80) return GOLD.bold(String(score))
  if (score >= 60) return AMBER(String(score))
  if (score >= 40) return WARM(String(score))
  if (score >= 20) return DIM(String(score))
  return chalk.gray(String(score))
}

/**
 * @example colorGrade('golden-convergence')
 */
export function colorGrade(grade: string): string {
  if (grade.includes('golden') || grade.includes('solar') || grade.includes('cosmic')) return GOLD.bold(grade)
  if (grade.includes('radiant') || grade.includes('bright') || grade.includes('unbreakable') || grade.includes('perfect') || grade.includes('impervious') || grade.includes('enlightened') || grade.includes('master')) return AMBER(grade)
  if (grade.includes('proper') || grade.includes('strong') || grade.includes('tight') || grade.includes('expert') || grade.includes('golden-network')) return WARM(grade)
  return DIM(grade)
}

// ─── Thread Table ──────────────────────────────────────────────────

/**
 * @example formatThreadTable(thread)
 */
export function formatThreadTable(thread: GoldenThread): string {
  const lines: string[] = []
  lines.push(GOLD.bold(`${BULLET} ${thread.file}`))
  lines.push(`  Radiant Clarity    : ${colorScore(thread.radiantClarity)}  ${colorGrade(thread.illuminating.radiance)}`)
  lines.push(`  Connection Strength: ${colorScore(thread.connectionStrength)}  ${colorGrade(thread.binding.bond)}`)
  lines.push(`  Nexus Precision    : ${colorScore(thread.nexusPrecision)}  ${colorGrade(thread.converging.convergence)}`)
  lines.push(`  Field Resilience   : ${colorScore(thread.fieldResilience)}  ${colorGrade(thread.shielding.field)}`)
  lines.push(`  Core Wisdom        : ${colorScore(thread.coreWisdom)}  ${colorGrade(thread.knowing.insight)}`)
  lines.push(`  Quality Score      : ${colorScore(thread.qualityScore)}  ${colorGrade(thread.condition)}`)
  return lines.join('\n')
}

/**
 * @example formatThreadsTable(threads)
 */
export function formatThreadsTable(threads: GoldenThread[]): string {
  if (threads.length === 0) return chalk.gray('No golden threads to display')
  return threads.map(formatThreadTable).join('\n\n')
}

// ─── Web Table ─────────────────────────────────────────────────────

/**
 * @example formatWebTable(web)
 */
export function formatWebTable(web: GoldenWeb): string {
  const lines: string[] = []
  lines.push(GOLD.bold(`${BULLET} ${web.directory}`))
  lines.push(`  Threads      : ${web.threads.length}`)
  lines.push(`  Avg Clarity  : ${colorScore(web.avgClarity)}`)
  lines.push(`  Avg Strength : ${colorScore(web.avgStrength)}`)
  lines.push(`  Avg Wisdom   : ${colorScore(web.avgWisdom)}`)
  lines.push(`  Golden       : ${web.goldenConvergenceCount}`)
  lines.push(`  Void         : ${web.voidCount}`)
  lines.push(`  Type         : ${colorGrade(web.webType)}`)
  lines.push(`  Condition    : ${colorGrade(web.condition)}`)
  return lines.join('\n')
}

/**
 * @example formatWebsTable(webs)
 */
export function formatWebsTable(webs: GoldenWeb[]): string {
  if (webs.length === 0) return chalk.gray('No golden webs to display')
  return webs.map(formatWebTable).join('\n\n')
}

// ─── Stats Table ───────────────────────────────────────────────────

/**
 * @example formatStatsTable(stats)
 */
export function formatStatsTable(stats: GoldenNexusResult['stats']): string {
  const lines: string[] = []
  lines.push(GOLD.bold('Golden Nexus Statistics'))
  lines.push(`  Total Files             : ${stats.totalFiles}`)
  lines.push(`  Total Webs              : ${stats.totalWebs}`)
  lines.push(`  Avg Radiant Clarity     : ${colorScore(stats.avgRadiantClarity)}`)
  lines.push(`  Avg Connection Strength : ${colorScore(stats.avgConnectionStrength)}`)
  lines.push(`  Avg Nexus Precision     : ${colorScore(stats.avgNexusPrecision)}`)
  lines.push(`  Avg Field Resilience    : ${colorScore(stats.avgFieldResilience)}`)
  lines.push(`  Avg Core Wisdom         : ${colorScore(stats.avgCoreWisdom)}`)
  lines.push(`  Golden Convergence      : ${stats.goldenConvergenceCount}`)
  lines.push(`  Radiant Nexus           : ${stats.radiantNexusCount}`)
  lines.push(`  Proper Node             : ${stats.properNodeCount}`)
  lines.push(`  Dim Point               : ${stats.dimPointCount}`)
  lines.push(`  Dark Spot               : ${stats.darkSpotCount}`)
  lines.push(`  Void                    : ${stats.voidCount}`)
  lines.push(`  Overall Radiance        : ${colorScore(stats.overallRadiance)}`)
  lines.push(`  Weaver Grade            : ${colorGrade(stats.weaverGrade)}`)
  lines.push(`  Best Thread             : ${GLOW(stats.bestThread)}`)
  lines.push(`  Clearest                : ${GLOW(stats.clearest)}`)
  lines.push(`  Strongest               : ${GLOW(stats.strongest)}`)
  lines.push(`  Most Precise            : ${GLOW(stats.mostPrecise)}`)
  lines.push(`  Wisest                  : ${GLOW(stats.wisest)}`)
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

// ─── Celebration ───────────────────────────────────────────────────

/**
 * @example formatCelebration(celebration)
 */
export function formatCelebration(celebration: GoldenNexusResult['celebration']): string {
  const lines: string[] = []
  lines.push(GOLD.bold(`\n${BULLET} Milestone #${celebration.milestone} — ${celebration.name}`))
  lines.push(GOLD(celebration.message))
  lines.push(AMBER(`  Previous milestones: ${celebration.previousMilestones.join(', ')}`))
  lines.push(GLOW(`  Total tests across all commands: ${celebration.totalTests.toLocaleString()}+`))
  return lines.join('\n')
}

// ─── Full Result ───────────────────────────────────────────────────

/**
 * @example formatResultTable(result)
 */
export function formatResultTable(result: GoldenNexusResult): string {
  const sections: string[] = []

  sections.push(GOLD.bold('Golden Thread Analysis'))
  sections.push(formatThreadsTable(result.threads))
  sections.push('')
  sections.push(GOLD.bold('Golden Webs'))
  sections.push(formatWebsTable(result.webs))
  sections.push('')
  sections.push(formatStatsTable(result.stats))
  sections.push('')
  sections.push(GOLD.bold('Nexus'))
  sections.push(`  Avg Clarity   : ${colorScore(result.nexus.avgClarity)}`)
  sections.push(`  Avg Strength  : ${colorScore(result.nexus.avgStrength)}`)
  sections.push(`  Avg Wisdom    : ${colorScore(result.nexus.avgWisdom)}`)
  sections.push(`  Is Golden     : ${result.nexus.isGolden ? GOLD.bold('YES') : chalk.gray('NO')}`)
  sections.push(`  Overall Radiance: ${colorScore(result.nexus.overallRadiance)}`)
  sections.push('')
  sections.push(GOLD.bold('Recommendations'))
  sections.push(formatRecommendations(result.recommendations))
  sections.push(formatCelebration(result.celebration))

  return sections.join('\n')
}

/**
 * @example formatResultJson(result)
 */
export function formatResultJson(result: GoldenNexusResult): string {
  return JSON.stringify(result, null, 2)
}
