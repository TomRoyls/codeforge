// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'

import type { MidnightGardenResult, NightBloom, MoonlightBed } from './midnight-garden-helpers.js'

// ─── Color Palette ─────────────────────────────────────────────────

const NIGHT = chalk.rgb(75, 0, 130)
const MOON = chalk.rgb(200, 200, 255)
const BLOOM = chalk.rgb(180, 100, 220)
const FRAGRANCE = chalk.rgb(255, 200, 255)
const DIM = chalk.rgb(130, 130, 170)
const BULLET = '\u{1F33A}'

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * @example colorScore(85)
 */
export function colorScore(score: number): string {
  if (score >= 80) return MOON.bold(String(score))
  if (score >= 60) return BLOOM(String(score))
  if (score >= 40) return FRAGRANCE(String(score))
  if (score >= 20) return DIM(String(score))
  return chalk.gray(String(score))
}

/**
 * @example colorGrade('midnight-masterpiece')
 */
export function colorGrade(grade: string): string {
  if (grade.includes('midnight') || grade.includes('night-queen') || grade.includes('deep-forest') || grade.includes('full-moon') || grade.includes('jasmine') || grade.includes('perpetual') || grade.includes('royal') || grade.includes('paradise') || grade.includes('master')) return MOON.bold(grade)
  if (grade.includes('moonflower') || grade.includes('proper-shadow') || grade.includes('bright') || grade.includes('honeysuckle') || grade.includes('winter') || grade.includes('moonlit') || grade.includes('estate') || grade.includes('curator')) return BLOOM(grade)
  if (grade.includes('evening') || grade.includes('twilight') || grade.includes('proper') || grade.includes('proper-fragrance') || grade.includes('proper-endurance') || grade.includes('proper-bed') || grade.includes('proper-garden') || grade.includes('skilled')) return FRAGRANCE(grade)
  return DIM(grade)
}

// ─── Bloom Table ───────────────────────────────────────────────────

/**
 * @example formatBloomTable(bloom)
 */
export function formatBloomTable(bloom: NightBloom): string {
  const lines: string[] = []
  lines.push(NIGHT.bold(`${BULLET} ${bloom.file}`))
  lines.push(`  Nocturnal Bloom   : ${colorScore(bloom.nocturnalBloom)}  ${colorGrade(bloom.flowering.flower)}`)
  lines.push(`  Shadow Depth      : ${colorScore(bloom.shadowDepth)}  ${colorGrade(bloom.shadowing.shadow)}`)
  lines.push(`  Moonlit Clarity   : ${colorScore(bloom.moonlitClarity)}  ${colorGrade(bloom.illuminating.moonlight)}`)
  lines.push(`  Night Fragrance   : ${colorScore(bloom.nightFragrance)}  ${colorGrade(bloom.scenting.scent)}`)
  lines.push(`  Dark Resilience   : ${colorScore(bloom.darkResilience)}  ${colorGrade(bloom.enduring.endurance)}`)
  lines.push(`  Quality Score     : ${colorScore(bloom.qualityScore)}  ${colorGrade(bloom.condition)}`)
  return lines.join('\n')
}

/**
 * @example formatBloomsTable(blooms)
 */
export function formatBloomsTable(blooms: NightBloom[]): string {
  if (blooms.length === 0) return chalk.gray('No night blooms to display')
  return blooms.map(formatBloomTable).join('\n\n')
}

// ─── Bed Table ─────────────────────────────────────────────────────

/**
 * @example formatBedTable(bed)
 */
export function formatBedTable(bed: MoonlightBed): string {
  const lines: string[] = []
  lines.push(NIGHT.bold(`${BULLET} ${bed.directory}`))
  lines.push(`  Blooms        : ${bed.blooms.length}`)
  lines.push(`  Avg Bloom     : ${colorScore(bed.avgBloom)}`)
  lines.push(`  Avg Clarity   : ${colorScore(bed.avgClarity)}`)
  lines.push(`  Avg Resilience: ${colorScore(bed.avgResilience)}`)
  lines.push(`  Masterpieces  : ${bed.midnightMasterpieceCount}`)
  lines.push(`  Barren Soil   : ${bed.barrenSoilCount}`)
  lines.push(`  Bed Type      : ${colorGrade(bed.bedType)}`)
  lines.push(`  Condition     : ${colorGrade(bed.condition)}`)
  return lines.join('\n')
}

/**
 * @example formatBedsTable(beds)
 */
export function formatBedsTable(beds: MoonlightBed[]): string {
  if (beds.length === 0) return chalk.gray('No moonlight beds to display')
  return beds.map(formatBedTable).join('\n\n')
}

// ─── Stats Table ───────────────────────────────────────────────────

/**
 * @example formatStatsTable(stats)
 */
export function formatStatsTable(stats: MidnightGardenResult['stats']): string {
  const lines: string[] = []
  lines.push(NIGHT.bold('Midnight Garden Statistics'))
  lines.push(`  Total Files          : ${stats.totalFiles}`)
  lines.push(`  Total Beds           : ${stats.totalBeds}`)
  lines.push(`  Avg Nocturnal Bloom  : ${colorScore(stats.avgNocturnalBloom)}`)
  lines.push(`  Avg Shadow Depth     : ${colorScore(stats.avgShadowDepth)}`)
  lines.push(`  Avg Moonlit Clarity  : ${colorScore(stats.avgMoonlitClarity)}`)
  lines.push(`  Avg Night Fragrance  : ${colorScore(stats.avgNightFragrance)}`)
  lines.push(`  Avg Dark Resilience  : ${colorScore(stats.avgDarkResilience)}`)
  lines.push(`  Midnight Masterpiece : ${stats.midnightMasterpieceCount}`)
  lines.push(`  Moonlit Garden       : ${stats.moonlitGardenCount}`)
  lines.push(`  Twilight Bed         : ${stats.twilightBedCount}`)
  lines.push(`  Dim Corner           : ${stats.dimCornerCount}`)
  lines.push(`  Dark Patch           : ${stats.darkPatchCount}`)
  lines.push(`  Barren Soil          : ${stats.barrenSoilCount}`)
  lines.push(`  Overall Fragrance    : ${colorScore(stats.overallFragrance)}`)
  lines.push(`  Gardener Grade       : ${colorGrade(stats.gardenerGrade)}`)
  lines.push(`  Best Bloom           : ${BLOOM(stats.bestBloom)}`)
  lines.push(`  Best Blooming        : ${BLOOM(stats.bestBlooming)}`)
  lines.push(`  Deepest Shadow       : ${BLOOM(stats.deepestShadow)}`)
  lines.push(`  Clearest             : ${BLOOM(stats.clearest)}`)
  lines.push(`  Most Fragrant        : ${BLOOM(stats.mostFragrant)}`)
  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────

/**
 * @example formatRecommendations(['improve X'])
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.gray('No recommendations')
  return recs.map(r => `${BULLET} ${MOON(r)}`).join('\n')
}

// ─── Full Result ───────────────────────────────────────────────────

/**
 * @example formatResultTable(result)
 */
export function formatResultTable(result: MidnightGardenResult): string {
  const sections: string[] = []

  sections.push(NIGHT.bold('Night Bloom Analysis'))
  sections.push(formatBloomsTable(result.blooms))
  sections.push('')
  sections.push(NIGHT.bold('Moonlight Beds'))
  sections.push(formatBedsTable(result.beds))
  sections.push('')
  sections.push(formatStatsTable(result.stats))
  sections.push('')
  sections.push(NIGHT.bold('Estate'))
  sections.push(`  Avg Bloom      : ${colorScore(result.estate.avgBloom)}`)
  sections.push(`  Avg Clarity    : ${colorScore(result.estate.avgClarity)}`)
  sections.push(`  Avg Resilience : ${colorScore(result.estate.avgResilience)}`)
  sections.push(`  Is Moonlit     : ${result.estate.isMoonlit ? MOON.bold('YES') : chalk.gray('NO')}`)
  sections.push(`  Overall Fragr. : ${colorScore(result.estate.overallFragrance)}`)
  sections.push('')
  sections.push(NIGHT.bold('Recommendations'))
  sections.push(formatRecommendations(result.recommendations))

  return sections.join('\n')
}

/**
 * @example formatResultJson(result)
 */
export function formatResultJson(result: MidnightGardenResult): string {
  return JSON.stringify(result, null, 2)
}
