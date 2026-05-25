// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'

import type { VelvetNightResult, VelvetFold, VelvetChamber } from './velvet-night-helpers.js'

// ─── Color Palette ─────────────────────────────────────────────────

const VELVET = chalk.rgb(120, 50, 160)
const SILK = chalk.rgb(180, 130, 220)
const NIGHT = chalk.rgb(100, 80, 180)
const DIM = chalk.rgb(130, 130, 170)
const BULLET = '\u{1F319}'

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * @example colorScore(85)
 */
export function colorScore(score: number): string {
  if (score >= 80) return VELVET.bold(String(score))
  if (score >= 60) return SILK(String(score))
  if (score >= 40) return NIGHT(String(score))
  if (score >= 20) return DIM(String(score))
  return chalk.gray(String(score))
}

/**
 * @example colorGrade('velvet-masterpiece')
 */
export function colorGrade(grade: string): string {
  if (grade.includes('velvet') || grade.includes('silk') || grade.includes('master') || grade.includes('midnight') || grade.includes('warm') || grade.includes('eternal') || grade.includes('night-owl') || grade.includes('palace') || grade.includes('boudoir') || grade.includes('curator')) return VELVET.bold(grade)
  if (grade.includes('soft') || grade.includes('cozy') || grade.includes('elegant') || grade.includes('wise') || grade.includes('long') || grade.includes('proper') || grade.includes('room') || grade.includes('butler') || grade.includes('silk-night')) return SILK(grade)
  if (grade.includes('proper-') || grade.includes('skilled')) return NIGHT(grade)
  return DIM(grade)
}

// ─── Fold Table ────────────────────────────────────────────────────

/**
 * @example formatFoldTable(fold)
 */
export function formatFoldTable(fold: VelvetFold): string {
  const lines: string[] = []
  lines.push(VELVET.bold(`${BULLET} ${fold.file}`))
  lines.push(`  Softness Quality  : ${colorScore(fold.softnessQuality)}  ${colorGrade(fold.soothing.touch)}`)
  lines.push(`  Dark Comfort      : ${colorScore(fold.darkComfort)}  ${colorGrade(fold.comforting.embrace)}`)
  lines.push(`  Shadow Elegance   : ${colorScore(fold.shadowElegance)}  ${colorGrade(fold.adorning.shadow)}`)
  lines.push(`  Nocturnal Wisdom  : ${colorScore(fold.nocturnalWisdom)}  ${colorGrade(fold.knowing.sage)}`)
  lines.push(`  Night Resilience  : ${colorScore(fold.nightResilience)}  ${colorGrade(fold.enduring.night)}`)
  lines.push(`  Quality Score     : ${colorScore(fold.qualityScore)}  ${colorGrade(fold.condition)}`)
  return lines.join('\n')
}

/**
 * @example formatFoldsTable(folds)
 */
export function formatFoldsTable(folds: VelvetFold[]): string {
  if (folds.length === 0) return chalk.gray('No velvet folds to display')
  return folds.map(formatFoldTable).join('\n\n')
}

// ─── Chamber Table ─────────────────────────────────────────────────

/**
 * @example formatChamberTable(chamber)
 */
export function formatChamberTable(chamber: VelvetChamber): string {
  const lines: string[] = []
  lines.push(VELVET.bold(`${BULLET} ${chamber.directory}`))
  lines.push(`  Folds            : ${chamber.folds.length}`)
  lines.push(`  Avg Softness     : ${colorScore(chamber.avgSoftness)}`)
  lines.push(`  Avg Elegance     : ${colorScore(chamber.avgElegance)}`)
  lines.push(`  Avg Resilience   : ${colorScore(chamber.avgResilience)}`)
  lines.push(`  Masterpieces     : ${chamber.velvetMasterpieceCount}`)
  lines.push(`  Voids            : ${chamber.voidCount}`)
  lines.push(`  Chamber Type     : ${colorGrade(chamber.chamberType)}`)
  lines.push(`  Condition        : ${colorGrade(chamber.condition)}`)
  return lines.join('\n')
}

/**
 * @example formatChambersTable(chambers)
 */
export function formatChambersTable(chambers: VelvetChamber[]): string {
  if (chambers.length === 0) return chalk.gray('No velvet chambers to display')
  return chambers.map(formatChamberTable).join('\n\n')
}

// ─── Stats Table ───────────────────────────────────────────────────

/**
 * @example formatStatsTable(stats)
 */
export function formatStatsTable(stats: VelvetNightResult['stats']): string {
  const lines: string[] = []
  lines.push(VELVET.bold('Velvet Night Statistics'))
  lines.push(`  Total Files        : ${stats.totalFiles}`)
  lines.push(`  Total Chambers     : ${stats.totalChambers}`)
  lines.push(`  Avg Softness Qual. : ${colorScore(stats.avgSoftnessQuality)}`)
  lines.push(`  Avg Dark Comfort   : ${colorScore(stats.avgDarkComfort)}`)
  lines.push(`  Avg Shadow Eleg.   : ${colorScore(stats.avgShadowElegance)}`)
  lines.push(`  Avg Nocturnal Wis. : ${colorScore(stats.avgNocturnalWisdom)}`)
  lines.push(`  Avg Night Resil.   : ${colorScore(stats.avgNightResilience)}`)
  lines.push(`  Velvet Masterpiece : ${stats.velvetMasterpieceCount}`)
  lines.push(`  Silk Night         : ${stats.silkNightCount}`)
  lines.push(`  Proper Darkness    : ${stats.properDarknessCount}`)
  lines.push(`  Dim Twilight       : ${stats.dimTwilightCount}`)
  lines.push(`  Harsh Light        : ${stats.harshLightCount}`)
  lines.push(`  Void               : ${stats.voidCount}`)
  lines.push(`  Overall Comfort    : ${colorScore(stats.overallComfort)}`)
  lines.push(`  Curator Grade      : ${colorGrade(stats.curatorGrade)}`)
  lines.push(`  Best Fold          : ${SILK(stats.bestFold)}`)
  lines.push(`  Softest            : ${SILK(stats.softest)}`)
  lines.push(`  Most Comforting    : ${SILK(stats.mostComforting)}`)
  lines.push(`  Most Elegant       : ${SILK(stats.mostElegant)}`)
  lines.push(`  Wisest             : ${SILK(stats.wisest)}`)
  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────

/**
 * @example formatRecommendations(['improve X'])
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.gray('No recommendations')
  return recs.map(r => `${BULLET} ${SILK(r)}`).join('\n')
}

// ─── Full Result ───────────────────────────────────────────────────

/**
 * @example formatResultTable(result)
 */
export function formatResultTable(result: VelvetNightResult): string {
  const sections: string[] = []

  sections.push(VELVET.bold('Velvet Fold Analysis'))
  sections.push(formatFoldsTable(result.folds))
  sections.push('')
  sections.push(VELVET.bold('Velvet Chambers'))
  sections.push(formatChambersTable(result.chambers))
  sections.push('')
  sections.push(formatStatsTable(result.stats))
  sections.push('')
  sections.push(VELVET.bold('Manor'))
  sections.push(`  Avg Softness    : ${colorScore(result.manor.avgSoftness)}`)
  sections.push(`  Avg Elegance    : ${colorScore(result.manor.avgElegance)}`)
  sections.push(`  Avg Resilience  : ${colorScore(result.manor.avgResilience)}`)
  sections.push(`  Is Velvet       : ${result.manor.isVelvet ? VELVET.bold('YES') : chalk.gray('NO')}`)
  sections.push(`  Overall Comfort : ${colorScore(result.manor.overallComfort)}`)
  sections.push('')
  sections.push(VELVET.bold('Recommendations'))
  sections.push(formatRecommendations(result.recommendations))

  return sections.join('\n')
}

/**
 * @example formatResultJson(result)
 */
export function formatResultJson(result: VelvetNightResult): string {
  return JSON.stringify(result, null, 2)
}
