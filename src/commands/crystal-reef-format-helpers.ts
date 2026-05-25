// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'

import type { CrystalReefResult, CoralCrystal, CrystalAtoll } from './crystal-reef-helpers.js'

// ─── Color Palette ─────────────────────────────────────────────────

const CYAN = chalk.rgb(0, 200, 220)
const CORAL = chalk.rgb(255, 127, 80)
const DEEP = chalk.rgb(70, 130, 180)
const DIM = chalk.rgb(140, 160, 180)
const BULLET = '\u{1F420}'

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * @example colorScore(85)
 */
export function colorScore(score: number): string {
  if (score >= 80) return CYAN.bold(String(score))
  if (score >= 60) return CORAL(String(score))
  if (score >= 40) return DEEP(String(score))
  if (score >= 20) return DIM(String(score))
  return chalk.gray(String(score))
}

/**
 * @example colorGrade('pristine-reef')
 */
export function colorGrade(grade: string): string {
  if (grade.includes('pristine') || grade.includes('perfect') || grade.includes('great') || grade.includes('master') || grade.includes('ancient') || grade.includes('tsunami') || grade.includes('crystal') || grade.includes('marine-paradise')) return CYAN.bold(grade)
  if (grade.includes('healthy') || grade.includes('well') || grade.includes('rich') || grade.includes('coral-scientist') || grade.includes('storm') || grade.includes('clear') || grade.includes('deep') || grade.includes('coral-kingdom') || grade.includes('healthy-ocean')) return CORAL(grade)
  if (grade.includes('proper') || grade.includes('marine-biologist') || grade.includes('anchor') || grade.includes('visibility') || grade.includes('current') || grade.includes('proper-sea')) return DEEP(grade)
  return DIM(grade)
}

// ─── Coral Table ───────────────────────────────────────────────────

/**
 * @example formatCoralTable(coral)
 */
export function formatCoralTable(coral: CoralCrystal): string {
  const lines: string[] = []
  lines.push(CYAN.bold(`${BULLET} ${coral.file}`))
  lines.push(`  Crystalline Structure : ${colorScore(coral.crystallineStructure)}  ${colorGrade(coral.structuring.lattice)}`)
  lines.push(`  Coral Diversity       : ${colorScore(coral.coralDiversity)}  ${colorGrade(coral.diversifying.reef)}`)
  lines.push(`  Tide Resilience       : ${colorScore(coral.tideResilience)}  ${colorGrade(coral.enduring.tide)}`)
  lines.push(`  Depth Clarity         : ${colorScore(coral.depthClarity)}  ${colorGrade(coral.clarifying.depth)}`)
  lines.push(`  Ocean Wisdom          : ${colorScore(coral.oceanWisdom)}  ${colorGrade(coral.knowing.ocean)}`)
  lines.push(`  Quality Score         : ${colorScore(coral.qualityScore)}  ${colorGrade(coral.condition)}`)
  return lines.join('\n')
}

/**
 * @example formatCoralsTable(corals)
 */
export function formatCoralsTable(corals: CoralCrystal[]): string {
  if (corals.length === 0) return chalk.gray('No coral crystals to display')
  return corals.map(formatCoralTable).join('\n\n')
}

// ─── Atoll Table ───────────────────────────────────────────────────

/**
 * @example formatAtollTable(atoll)
 */
export function formatAtollTable(atoll: CrystalAtoll): string {
  const lines: string[] = []
  lines.push(CYAN.bold(`${BULLET} ${atoll.directory}`))
  lines.push(`  Corals           : ${atoll.corals.length}`)
  lines.push(`  Avg Structure    : ${colorScore(atoll.avgStructure)}`)
  lines.push(`  Avg Diversity    : ${colorScore(atoll.avgDiversity)}`)
  lines.push(`  Avg Wisdom       : ${colorScore(atoll.avgWisdom)}`)
  lines.push(`  Pristine Reefs   : ${atoll.pristineReefCount}`)
  lines.push(`  Dead Zones       : ${atoll.deadZoneCount}`)
  lines.push(`  Atoll Type       : ${colorGrade(atoll.atollType)}`)
  lines.push(`  Condition        : ${colorGrade(atoll.condition)}`)
  return lines.join('\n')
}

/**
 * @example formatAtollsTable(atolls)
 */
export function formatAtollsTable(atolls: CrystalAtoll[]): string {
  if (atolls.length === 0) return chalk.gray('No crystal atolls to display')
  return atolls.map(formatAtollTable).join('\n\n')
}

// ─── Stats Table ───────────────────────────────────────────────────

/**
 * @example formatStatsTable(stats)
 */
export function formatStatsTable(stats: CrystalReefResult['stats']): string {
  const lines: string[] = []
  lines.push(CYAN.bold('Crystal Reef Statistics'))
  lines.push(`  Total Files           : ${stats.totalFiles}`)
  lines.push(`  Total Atolls          : ${stats.totalAtolls}`)
  lines.push(`  Avg Crystalline Str.  : ${colorScore(stats.avgCrystallineStructure)}`)
  lines.push(`  Avg Coral Diversity   : ${colorScore(stats.avgCoralDiversity)}`)
  lines.push(`  Avg Tide Resilience   : ${colorScore(stats.avgTideResilience)}`)
  lines.push(`  Avg Depth Clarity     : ${colorScore(stats.avgDepthClarity)}`)
  lines.push(`  Avg Ocean Wisdom      : ${colorScore(stats.avgOceanWisdom)}`)
  lines.push(`  Pristine Reef         : ${stats.pristineReefCount}`)
  lines.push(`  Healthy Ecosystem     : ${stats.healthyEcosystemCount}`)
  lines.push(`  Proper Formation      : ${stats.properFormationCount}`)
  lines.push(`  Stressed Coral        : ${stats.stressedCoralCount}`)
  lines.push(`  Bleached Reef         : ${stats.bleachedReefCount}`)
  lines.push(`  Dead Zone             : ${stats.deadZoneCount}`)
  lines.push(`  Overall Vitality      : ${colorScore(stats.overallVitality)}`)
  lines.push(`  Marine Grade          : ${colorGrade(stats.marineGrade)}`)
  lines.push(`  Best Coral            : ${CORAL(stats.bestCoral)}`)
  lines.push(`  Most Structured       : ${CORAL(stats.mostStructured)}`)
  lines.push(`  Most Diverse          : ${CORAL(stats.mostDiverse)}`)
  lines.push(`  Most Resilient        : ${CORAL(stats.mostResilient)}`)
  lines.push(`  Wisest                : ${CORAL(stats.wisest)}`)
  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────

/**
 * @example formatRecommendations(['improve X'])
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.gray('No recommendations')
  return recs.map(r => `${BULLET} ${CORAL(r)}`).join('\n')
}

// ─── Full Result ───────────────────────────────────────────────────

/**
 * @example formatResultTable(result)
 */
export function formatResultTable(result: CrystalReefResult): string {
  const sections: string[] = []

  sections.push(CYAN.bold('Coral Crystal Analysis'))
  sections.push(formatCoralsTable(result.corals))
  sections.push('')
  sections.push(CYAN.bold('Crystal Atolls'))
  sections.push(formatAtollsTable(result.atolls))
  sections.push('')
  sections.push(formatStatsTable(result.stats))
  sections.push('')
  sections.push(CYAN.bold('Ocean'))
  sections.push(`  Avg Structure   : ${colorScore(result.ocean.avgStructure)}`)
  sections.push(`  Avg Diversity   : ${colorScore(result.ocean.avgDiversity)}`)
  sections.push(`  Avg Wisdom      : ${colorScore(result.ocean.avgWisdom)}`)
  sections.push(`  Is Pristine     : ${result.ocean.isPristine ? CYAN.bold('YES') : chalk.gray('NO')}`)
  sections.push(`  Overall Vitality: ${colorScore(result.ocean.overallVitality)}`)
  sections.push('')
  sections.push(CYAN.bold('Recommendations'))
  sections.push(formatRecommendations(result.recommendations))

  return sections.join('\n')
}

/**
 * @example formatResultJson(result)
 */
export function formatResultJson(result: CrystalReefResult): string {
  return JSON.stringify(result, null, 2)
}
