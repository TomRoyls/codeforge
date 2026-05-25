// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'

import type { NeonGardenResult, NeonBloom, NeonBed } from './neon-garden-helpers.js'

// ─── Color Palette ─────────────────────────────────────────────────

const NEON = chalk.rgb(0, 255, 200)
const GLOW = chalk.rgb(255, 100, 255)
const PETAL = chalk.rgb(100, 200, 255)
const DIM = chalk.rgb(140, 145, 160)
const BULLET = '\u{1F33A}'

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * @example colorScore(85)
 */
export function colorScore(score: number): string {
  if (score >= 80) return NEON.bold(String(score))
  if (score >= 60) return GLOW(String(score))
  if (score >= 40) return PETAL(String(score))
  if (score >= 20) return DIM(String(score))
  return chalk.gray(String(score))
}

/**
 * @example colorGrade('neon-masterpiece')
 */
export function colorGrade(grade: string): string {
  if (grade.includes('masterpiece') || grade.includes('bioluminescent') || grade.includes('neon-eden') || grade.includes('neon-botanist') || grade.includes('blinding') || grade.includes('alive-with') || grade.includes('steady-beacon') || grade.includes('kaleidoscope') || grade.includes('fiber-optic')) return NEON.bold(grade)
  if (grade.includes('luminous') || grade.includes('glowing') || grade.includes('proper') || grade.includes('bright') || grade.includes('vibrant') || grade.includes('consistent') || grade.includes('varied') || grade.includes('glowing-foundation') || grade.includes('light-gardener') || grade.includes('skilled-cultivator')) return GLOW(grade)
  if (grade.includes('dim') || grade.includes('dormant') || grade.includes('flickering') || grade.includes('monoculture') || grade.includes('apprentice') || grade.includes('single-plant')) return PETAL(grade)
  return DIM(grade)
}

// ─── Bloom Table ───────────────────────────────────────────────────

/**
 * @example formatBloomTable(bloom)
 */
export function formatBloomTable(bloom: NeonBloom): string {
  const lines: string[] = []
  lines.push(NEON.bold(`${BULLET} ${bloom.file}`))
  lines.push(`  Luminosity Quality  : ${colorScore(bloom.luminosityQuality)}  ${colorGrade(bloom.shining.light)}`)
  lines.push(`  Structure Vibrancy  : ${colorScore(bloom.structureVibrancy)}  ${colorGrade(bloom.pulsing.pulse)}`)
  lines.push(`  Glow Consistency    : ${colorScore(bloom.glowConsistency)}  ${colorGrade(bloom.radiating.glow)}`)
  lines.push(`  Bloom Diversity     : ${colorScore(bloom.bloomDiversity)}  ${colorGrade(bloom.diversifying.garden)}`)
  lines.push(`  Root Brightness     : ${colorScore(bloom.rootBrightness)}  ${colorGrade(bloom.grounding.root)}`)
  lines.push(`  Quality Score       : ${colorScore(bloom.qualityScore)}  ${colorGrade(bloom.condition)}`)
  return lines.join('\n')
}

/**
 * @example formatBloomsTable(blooms)
 */
export function formatBloomsTable(blooms: NeonBloom[]): string {
  if (blooms.length === 0) return chalk.gray('No neon blooms to display')
  return blooms.map(formatBloomTable).join('\n\n')
}

// ─── Bed Table ─────────────────────────────────────────────────────

/**
 * @example formatBedTable(bed)
 */
export function formatBedTable(bed: NeonBed): string {
  const lines: string[] = []
  lines.push(NEON.bold(`${BULLET} ${bed.directory}`))
  lines.push(`  Blooms           : ${bed.blooms.length}`)
  lines.push(`  Avg Luminosity   : ${colorScore(bed.avgLuminosity)}`)
  lines.push(`  Avg Vibrancy     : ${colorScore(bed.avgVibrancy)}`)
  lines.push(`  Avg Brightness   : ${colorScore(bed.avgBrightness)}`)
  lines.push(`  Neon Masterpieces: ${bed.neonMasterpieceCount}`)
  lines.push(`  Barren Soil      : ${bed.barrenSoilCount}`)
  lines.push(`  Bed Type         : ${colorGrade(bed.bedType)}`)
  lines.push(`  Condition        : ${colorGrade(bed.condition)}`)
  return lines.join('\n')
}

/**
 * @example formatBedsTable(beds)
 */
export function formatBedsTable(beds: NeonBed[]): string {
  if (beds.length === 0) return chalk.gray('No neon beds to display')
  return beds.map(formatBedTable).join('\n\n')
}

// ─── Stats Table ───────────────────────────────────────────────────

/**
 * @example formatStatsTable(stats)
 */
export function formatStatsTable(stats: NeonGardenResult['stats']): string {
  const lines: string[] = []
  lines.push(NEON.bold('Neon Garden Statistics'))
  lines.push(`  Total Files           : ${stats.totalFiles}`)
  lines.push(`  Total Beds            : ${stats.totalBeds}`)
  lines.push(`  Avg Luminosity Quality : ${colorScore(stats.avgLuminosityQuality)}`)
  lines.push(`  Avg Structure Vibrancy : ${colorScore(stats.avgStructureVibrancy)}`)
  lines.push(`  Avg Glow Consistency  : ${colorScore(stats.avgGlowConsistency)}`)
  lines.push(`  Avg Bloom Diversity   : ${colorScore(stats.avgBloomDiversity)}`)
  lines.push(`  Avg Root Brightness   : ${colorScore(stats.avgRootBrightness)}`)
  lines.push(`  Neon Masterpiece      : ${stats.neonMasterpieceCount}`)
  lines.push(`  Luminous Garden       : ${stats.luminousGardenCount}`)
  lines.push(`  Proper Glow           : ${stats.properGlowCount}`)
  lines.push(`  Dim Bed               : ${stats.dimBedCount}`)
  lines.push(`  Dark Patch            : ${stats.darkPatchCount}`)
  lines.push(`  Barren Soil           : ${stats.barrenSoilCount}`)
  lines.push(`  Overall Brilliance    : ${colorScore(stats.overallBrilliance)}`)
  lines.push(`  Gardener Grade        : ${colorGrade(stats.gardenerGrade)}`)
  lines.push(`  Best Bloom            : ${GLOW(stats.bestBloom)}`)
  lines.push(`  Brightest             : ${GLOW(stats.brightest)}`)
  lines.push(`  Most Vibrant          : ${GLOW(stats.mostVibrant)}`)
  lines.push(`  Most Consistent       : ${GLOW(stats.mostConsistent)}`)
  lines.push(`  Best Rooted           : ${GLOW(stats.bestRooted)}`)
  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────

/**
 * @example formatRecommendations(['improve X'])
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.gray('No recommendations')
  return recs.map(r => `${BULLET} ${GLOW(r)}`).join('\n')
}

// ─── Full Result ───────────────────────────────────────────────────

/**
 * @example formatResultTable(result)
 */
export function formatResultTable(result: NeonGardenResult): string {
  const sections: string[] = []

  sections.push(NEON.bold('Neon Bloom Analysis'))
  sections.push(formatBloomsTable(result.blooms))
  sections.push('')
  sections.push(NEON.bold('Neon Beds'))
  sections.push(formatBedsTable(result.beds))
  sections.push('')
  sections.push(formatStatsTable(result.stats))
  sections.push('')
  sections.push(NEON.bold('Landscape'))
  sections.push(`  Avg Luminosity    : ${colorScore(result.landscape.avgLuminosity)}`)
  sections.push(`  Avg Vibrancy      : ${colorScore(result.landscape.avgVibrancy)}`)
  sections.push(`  Avg Brightness    : ${colorScore(result.landscape.avgBrightness)}`)
  sections.push(`  Is Neon           : ${result.landscape.isNeon ? NEON.bold('YES') : chalk.gray('NO')}`)
  sections.push(`  Overall Brilliance: ${colorScore(result.landscape.overallBrilliance)}`)
  sections.push('')
  sections.push(NEON.bold('Recommendations'))
  sections.push(formatRecommendations(result.recommendations))

  return sections.join('\n')
}

/**
 * @example formatResultJson(result)
 */
export function formatResultJson(result: NeonGardenResult): string {
  return JSON.stringify(result, null, 2)
}
