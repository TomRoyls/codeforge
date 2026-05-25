// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'

import type { BronzeHorizonResult, BronzeRay, BronzeForge } from './bronze-horizon-helpers.js'

// ─── Color Palette ─────────────────────────────────────────────────

const BRONZE = chalk.rgb(205, 150, 60)
const COPPER = chalk.rgb(190, 120, 50)
const DAWN = chalk.rgb(220, 180, 100)
const DIM = chalk.rgb(140, 120, 100)
const BULLET = '\u{2699}'

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * @example colorScore(85)
 */
export function colorScore(score: number): string {
  if (score >= 80) return BRONZE.bold(String(score))
  if (score >= 60) return COPPER(String(score))
  if (score >= 40) return DAWN(String(score))
  if (score >= 20) return DIM(String(score))
  return chalk.gray(String(score))
}

/**
 * @example colorGrade('bronze-masterpiece')
 */
export function colorGrade(grade: string): string {
  if (grade.includes('bronze') || grade.includes('master') || grade.includes('masterwork') || grade.includes('noble') || grade.includes('copper-dawn') || grade.includes('master-smith') || grade.includes('ancient') || grade.includes('golden') || grade.includes('foundry')) return BRONZE.bold(grade)
  if (grade.includes('aged') || grade.includes('proper') || grade.includes('warm') || grade.includes('skilled') || grade.includes('expert') || grade.includes('prosperous') || grade.includes('workshop') || grade.includes('metallurgist')) return COPPER(grade)
  if (grade.includes('decent') || grade.includes('forger') || grade.includes('daybreak')) return DAWN(grade)
  return DIM(grade)
}

// ─── Ray Table ─────────────────────────────────────────────────────

/**
 * @example formatRayTable(ray)
 */
export function formatRayTable(ray: BronzeRay): string {
  const lines: string[] = []
  lines.push(BRONZE.bold(`${BULLET} ${ray.file}`))
  lines.push(`  Alloy Strength    : ${colorScore(ray.alloyStrength)}  ${colorGrade(ray.combining.alloy)}`)
  lines.push(`  Patina Wisdom     : ${colorScore(ray.patinaWisdom)}  ${colorGrade(ray.aging.patina)}`)
  lines.push(`  Dawn Clarity      : ${colorScore(ray.dawnClarity)}  ${colorGrade(ray.illuminating.dawn)}`)
  lines.push(`  Forge Precision   : ${colorScore(ray.forgePrecision)}  ${colorGrade(ray.crafting.forge)}`)
  lines.push(`  Durable Current   : ${colorScore(ray.durableCurrent)}  ${colorGrade(ray.conducting.flow)}`)
  lines.push(`  Quality Score     : ${colorScore(ray.qualityScore)}  ${colorGrade(ray.condition)}`)
  return lines.join('\n')
}

/**
 * @example formatRaysTable(rays)
 */
export function formatRaysTable(rays: BronzeRay[]): string {
  if (rays.length === 0) return chalk.gray('No bronze rays to display')
  return rays.map(formatRayTable).join('\n\n')
}

// ─── Forge Table ───────────────────────────────────────────────────

/**
 * @example formatForgeTable(forge)
 */
export function formatForgeTable(forge: BronzeForge): string {
  const lines: string[] = []
  lines.push(BRONZE.bold(`${BULLET} ${forge.directory}`))
  lines.push(`  Rays            : ${forge.rays.length}`)
  lines.push(`  Avg Strength    : ${colorScore(forge.avgStrength)}`)
  lines.push(`  Avg Clarity     : ${colorScore(forge.avgClarity)}`)
  lines.push(`  Avg Current     : ${colorScore(forge.avgCurrent)}`)
  lines.push(`  Masterpieces    : ${forge.bronzeMasterpieceCount}`)
  lines.push(`  Scrap           : ${forge.scrapCount}`)
  lines.push(`  Forge Type      : ${colorGrade(forge.forgeType)}`)
  lines.push(`  Condition       : ${colorGrade(forge.condition)}`)
  return lines.join('\n')
}

/**
 * @example formatForgesTable(forges)
 */
export function formatForgesTable(forges: BronzeForge[]): string {
  if (forges.length === 0) return chalk.gray('No bronze forges to display')
  return forges.map(formatForgeTable).join('\n\n')
}

// ─── Stats Table ───────────────────────────────────────────────────

/**
 * @example formatStatsTable(stats)
 */
export function formatStatsTable(stats: BronzeHorizonResult['stats']): string {
  const lines: string[] = []
  lines.push(BRONZE.bold('Bronze Horizon Statistics'))
  lines.push(`  Total Files         : ${stats.totalFiles}`)
  lines.push(`  Total Forges        : ${stats.totalForges}`)
  lines.push(`  Avg Alloy Strength  : ${colorScore(stats.avgAlloyStrength)}`)
  lines.push(`  Avg Patina Wisdom   : ${colorScore(stats.avgPatinaWisdom)}`)
  lines.push(`  Avg Dawn Clarity    : ${colorScore(stats.avgDawnClarity)}`)
  lines.push(`  Avg Forge Precision : ${colorScore(stats.avgForgePrecision)}`)
  lines.push(`  Avg Durable Current : ${colorScore(stats.avgDurableCurrent)}`)
  lines.push(`  Bronze Masterpiece  : ${stats.bronzeMasterpieceCount}`)
  lines.push(`  Aged Treasure       : ${stats.agedTreasureCount}`)
  lines.push(`  Proper Alloy        : ${stats.properAlloyCount}`)
  lines.push(`  Tarnished Metal     : ${stats.tarnishedMetalCount}`)
  lines.push(`  Rusty Iron          : ${stats.rustyIronCount}`)
  lines.push(`  Scrap               : ${stats.scrapCount}`)
  lines.push(`  Overall Luster      : ${colorScore(stats.overallLuster)}`)
  lines.push(`  Smith Grade         : ${colorGrade(stats.smithGrade)}`)
  lines.push(`  Best Ray            : ${COPPER(stats.bestRay)}`)
  lines.push(`  Strongest           : ${COPPER(stats.strongest)}`)
  lines.push(`  Wisest              : ${COPPER(stats.wisest)}`)
  lines.push(`  Clearest            : ${COPPER(stats.clearest)}`)
  lines.push(`  Most Conductive     : ${COPPER(stats.mostConductive)}`)
  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────

/**
 * @example formatRecommendations(['improve X'])
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.gray('No recommendations')
  return recs.map(r => `${BULLET} ${COPPER(r)}`).join('\n')
}

// ─── Full Result ───────────────────────────────────────────────────

/**
 * @example formatResultTable(result)
 */
export function formatResultTable(result: BronzeHorizonResult): string {
  const sections: string[] = []

  sections.push(BRONZE.bold('Bronze Ray Analysis'))
  sections.push(formatRaysTable(result.rays))
  sections.push('')
  sections.push(BRONZE.bold('Bronze Forges'))
  sections.push(formatForgesTable(result.forges))
  sections.push('')
  sections.push(formatStatsTable(result.stats))
  sections.push('')
  sections.push(BRONZE.bold('Age'))
  sections.push(`  Avg Strength   : ${colorScore(result.age.avgStrength)}`)
  sections.push(`  Avg Clarity    : ${colorScore(result.age.avgClarity)}`)
  sections.push(`  Avg Current    : ${colorScore(result.age.avgCurrent)}`)
  sections.push(`  Is Bronze      : ${result.age.isBronze ? BRONZE.bold('YES') : chalk.gray('NO')}`)
  sections.push(`  Overall Luster : ${colorScore(result.age.overallLuster)}`)
  sections.push('')
  sections.push(BRONZE.bold('Recommendations'))
  sections.push(formatRecommendations(result.recommendations))

  return sections.join('\n')
}

/**
 * @example formatResultJson(result)
 */
export function formatResultJson(result: BronzeHorizonResult): string {
  return JSON.stringify(result, null, 2)
}
