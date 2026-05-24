// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'

import type { StarlightForgeResult, StarlightIngot, StarlightNursery } from './starlight-forge-helpers.js'

// ─── Color Palette ─────────────────────────────────────────────────

const STAR = chalk.rgb(135, 206, 250)
const FORGE = chalk.rgb(255, 200, 100)
const HOT = chalk.rgb(255, 140, 0)
const COOL = chalk.rgb(100, 149, 237)
const DIM = chalk.rgb(130, 130, 170)
const BULLET = '\u2728'

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * @example colorScore(85)
 */
export function colorScore(score: number): string {
  if (score >= 80) return STAR.bold(String(score))
  if (score >= 60) return FORGE(String(score))
  if (score >= 40) return HOT(String(score))
  if (score >= 20) return DIM(String(score))
  return chalk.gray(String(score))
}

/**
 * @example colorGrade('stellar-masterpiece')
 */
export function colorGrade(grade: string): string {
  if (grade.includes('stellar') || grade.includes('supernova') || grade.includes('neutron') || grade.includes('grand') || grade.includes('bright-nebula') || grade.includes('universal') || grade.includes('magnificent')) return STAR.bold(grade)
  if (grade.includes('bright') || grade.includes('blue') || grade.includes('white') || grade.includes('recognized') || grade.includes('clear') || grade.includes('galactic') || grade.includes('stellar-nursery') || grade.includes('beautiful')) return FORGE(grade)
  if (grade.includes('proper') || grade.includes('star-cluster') || grade.includes('star-forger')) return HOT(grade)
  return DIM(grade)
}

// ─── Ingot Table ───────────────────────────────────────────────────

/**
 * @example formatIngotTable(ingot)
 */
export function formatIngotTable(ingot: StarlightIngot): string {
  const lines: string[] = []
  lines.push(STAR.bold(`${BULLET} ${ingot.file}`))
  lines.push(`  Celestial Forging    : ${colorScore(ingot.celestialForging)}  ${colorGrade(ingot.igniting.flame)}`)
  lines.push(`  Star Hardness        : ${colorScore(ingot.starHardness)}  ${colorGrade(ingot.hardening.grade)}`)
  lines.push(`  Constellation Pattern: ${colorScore(ingot.constellationPattern)}  ${colorGrade(ingot.patterning.constellation)}`)
  lines.push(`  Nebula Clarity       : ${colorScore(ingot.nebulaClarity)}  ${colorGrade(ingot.clarifying.nebula)}`)
  lines.push(`  Cosmic Wisdom        : ${colorScore(ingot.cosmicWisdom)}  ${colorGrade(ingot.knowing.cosmos)}`)
  lines.push(`  Quality Score        : ${colorScore(ingot.qualityScore)}  ${colorGrade(ingot.condition)}`)
  return lines.join('\n')
}

/**
 * @example formatIngotsTable(ingots)
 */
export function formatIngotsTable(ingots: StarlightIngot[]): string {
  if (ingots.length === 0) return chalk.gray('No starlight ingots to display')
  return ingots.map(formatIngotTable).join('\n\n')
}

// ─── Nursery Table ─────────────────────────────────────────────────

/**
 * @example formatNurseryTable(nursery)
 */
export function formatNurseryTable(nursery: StarlightNursery): string {
  const lines: string[] = []
  lines.push(STAR.bold(`${BULLET} ${nursery.directory}`))
  lines.push(`  Ingots    : ${nursery.ingots.length}`)
  lines.push(`  Avg Forge : ${colorScore(nursery.avgForging)}`)
  lines.push(`  Avg Hard  : ${colorScore(nursery.avgHardness)}`)
  lines.push(`  Avg Wisdom: ${colorScore(nursery.avgWisdom)}`)
  lines.push(`  Masterpiece: ${nursery.stellarMasterpieceCount}`)
  lines.push(`  Void      : ${nursery.voidCount}`)
  lines.push(`  Type      : ${colorGrade(nursery.nurseryType)}`)
  lines.push(`  Condition : ${colorGrade(nursery.condition)}`)
  return lines.join('\n')
}

/**
 * @example formatNurseriesTable(nurseries)
 */
export function formatNurseriesTable(nurseries: StarlightNursery[]): string {
  if (nurseries.length === 0) return chalk.gray('No starlight nurseries to display')
  return nurseries.map(formatNurseryTable).join('\n\n')
}

// ─── Stats Table ───────────────────────────────────────────────────

/**
 * @example formatStatsTable(stats)
 */
export function formatStatsTable(stats: StarlightForgeResult['stats']): string {
  const lines: string[] = []
  lines.push(STAR.bold('Starlight Forge Statistics'))
  lines.push(`  Total Files            : ${stats.totalFiles}`)
  lines.push(`  Total Nurseries        : ${stats.totalNurseries}`)
  lines.push(`  Avg Celestial Forging  : ${colorScore(stats.avgCelestialForging)}`)
  lines.push(`  Avg Star Hardness      : ${colorScore(stats.avgStarHardness)}`)
  lines.push(`  Avg Constellation Pat. : ${colorScore(stats.avgConstellationPattern)}`)
  lines.push(`  Avg Nebula Clarity     : ${colorScore(stats.avgNebulaClarity)}`)
  lines.push(`  Avg Cosmic Wisdom      : ${colorScore(stats.avgCosmicWisdom)}`)
  lines.push(`  Stellar Masterpiece    : ${stats.stellarMasterpieceCount}`)
  lines.push(`  Bright Star            : ${stats.brightStarCount}`)
  lines.push(`  Proper Body            : ${stats.properBodyCount}`)
  lines.push(`  Dim Object             : ${stats.dimObjectCount}`)
  lines.push(`  Dark Matter            : ${stats.darkMatterCount}`)
  lines.push(`  Void                   : ${stats.voidCount}`)
  lines.push(`  Overall Luminosity     : ${colorScore(stats.overallLuminosity)}`)
  lines.push(`  Astronomer Grade       : ${colorGrade(stats.astronomerGrade)}`)
  lines.push(`  Best Ingot             : ${FORGE(stats.bestIngot)}`)
  lines.push(`  Most Forged            : ${FORGE(stats.mostForged)}`)
  lines.push(`  Hardest                : ${FORGE(stats.hardest)}`)
  lines.push(`  Best Patterned         : ${FORGE(stats.bestPatterned)}`)
  lines.push(`  Wisest                 : ${FORGE(stats.wisest)}`)
  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────

/**
 * @example formatRecommendations(['improve X'])
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.gray('No recommendations')
  return recs.map(r => `${BULLET} ${COOL(r)}`).join('\n')
}

// ─── Full Result ───────────────────────────────────────────────────

/**
 * @example formatResultTable(result)
 */
export function formatResultTable(result: StarlightForgeResult): string {
  const sections: string[] = []

  sections.push(STAR.bold('Starlight Ingot Analysis'))
  sections.push(formatIngotsTable(result.ingots))
  sections.push('')
  sections.push(STAR.bold('Starlight Nurseries'))
  sections.push(formatNurseriesTable(result.nurseries))
  sections.push('')
  sections.push(formatStatsTable(result.stats))
  sections.push('')
  sections.push(STAR.bold('Cosmos'))
  sections.push(`  Avg Forging    : ${colorScore(result.cosmos.avgForging)}`)
  sections.push(`  Avg Hardness   : ${colorScore(result.cosmos.avgHardness)}`)
  sections.push(`  Avg Wisdom     : ${colorScore(result.cosmos.avgWisdom)}`)
  sections.push(`  Is Stellar     : ${result.cosmos.isStellar ? STAR.bold('YES') : chalk.gray('NO')}`)
  sections.push(`  Overall Lumin. : ${colorScore(result.cosmos.overallLuminosity)}`)
  sections.push('')
  sections.push(STAR.bold('Recommendations'))
  sections.push(formatRecommendations(result.recommendations))

  return sections.join('\n')
}

/**
 * @example formatResultJson(result)
 */
export function formatResultJson(result: StarlightForgeResult): string {
  return JSON.stringify(result, null, 2)
}
