import chalk from 'chalk'

import type { CurtainCondition, VelvetCurtain, VelvetDarknessResult, VelvetFold } from './velvet-gloom-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(80, 40, 120)(String(score))
  if (score >= 75) return chalk.rgb(100, 60, 140)(String(score))
  if (score >= 60) return chalk.rgb(120, 80, 160)(String(score))
  if (score >= 40) return chalk.rgb(90, 60, 100)(String(score))
  if (score >= 20) return chalk.rgb(70, 40, 80)(String(score))
  return chalk.gray(String(score))
}

/** @example colorCurtainCondition('velvet-theater') */
export function colorCurtainCondition(condition: CurtainCondition | string): string {
  switch (condition) {
    case 'velvet-theater': return chalk.rgb(80, 40, 120)('velvet-theater')
    case 'silk-parlor': return chalk.rgb(100, 60, 140)('silk-parlor')
    case 'proper-room': return chalk.rgb(120, 80, 160)('proper-room')
    case 'bare-walls': return chalk.rgb(90, 60, 100)('bare-walls')
    case 'ruin': return chalk.rgb(70, 40, 80)('ruin')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatFoldTable(fold) */
export function formatFoldTable(fold: VelvetFold): string {
  const lines: string[] = [
    chalk.bold(`Velvet Fold: ${fold.file}`),
    '',
    `  Softness Quality:   ${colorScore(fold.softnessQuality)}  ${chalk.dim(`(${fold.soothing.texture})`)}`,
    `  Dark Comfort:       ${colorScore(fold.darkComfort)}  ${chalk.dim(`(${fold.comforting.embrace})`)}`,
    `  Shadow Elegance:    ${colorScore(fold.shadowElegance)}  ${chalk.dim(`(${fold.draping.drape})`)}`,
    `  Nocturnal Wisdom:   ${colorScore(fold.nocturnalWisdom)}  ${chalk.dim(`(${fold.contemplating.insight})`)}`,
    `  Night Resilience:   ${colorScore(fold.nightResilience)}  ${chalk.dim(`(${fold.persisting.endurance})`)}`,
    '',
    `  Quality Score: ${colorScore(fold.qualityScore)}  ${chalk.dim(`(${fold.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatFoldsTable(folds) */
export function formatFoldsTable(folds: VelvetFold[]): string {
  if (folds.length === 0) return chalk.dim('No velvet folds found')
  const colWidths = {
    file: Math.max(4, ...folds.map((f) => f.file.length)),
    softness: Math.max(8, ...folds.map((f) => String(f.softnessQuality).length)),
    comfort: Math.max(7, ...folds.map((f) => String(f.darkComfort).length)),
    elegance: Math.max(8, ...folds.map((f) => String(f.shadowElegance).length)),
    wisdom: Math.max(6, ...folds.map((f) => String(f.nocturnalWisdom).length)),
    resilience: Math.max(10, ...folds.map((f) => String(f.nightResilience).length)),
    score: Math.max(5, ...folds.map((f) => String(f.qualityScore).length)),
  }
  const lines: string[] = [chalk.bold('Velvet Folds'), '']
  const header =
    chalk.rgb(80, 40, 120)(padRight('File', colWidths.file)) + '  ' +
    chalk.rgb(80, 40, 120)(padLeft('Softness', colWidths.softness)) + '  ' +
    chalk.rgb(80, 40, 120)(padLeft('Comfort', colWidths.comfort)) + '  ' +
    chalk.rgb(80, 40, 120)(padLeft('Elegance', colWidths.elegance)) + '  ' +
    chalk.rgb(80, 40, 120)(padLeft('Wisdom', colWidths.wisdom)) + '  ' +
    chalk.rgb(80, 40, 120)(padLeft('Resilience', colWidths.resilience)) + '  ' +
    chalk.rgb(80, 40, 120)(padLeft('Score', colWidths.score))
  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))
  for (const f of folds) {
    lines.push(
      padRight(f.file, colWidths.file) + '  ' +
      padLeft(String(f.softnessQuality), colWidths.softness) + '  ' +
      padLeft(String(f.darkComfort), colWidths.comfort) + '  ' +
      padLeft(String(f.shadowElegance), colWidths.elegance) + '  ' +
      padLeft(String(f.nocturnalWisdom), colWidths.wisdom) + '  ' +
      padLeft(String(f.nightResilience), colWidths.resilience) + '  ' +
      padLeft(String(f.qualityScore), colWidths.score),
    )
  }
  return lines.join('\n')
}

/** @example formatCurtainTable(curtain) */
export function formatCurtainTable(curtain: VelvetCurtain): string {
  const lines: string[] = [
    chalk.bold(`Velvet Curtain: ${curtain.directory}`),
    '',
    `  Folds:              ${curtain.folds.length}`,
    `  Avg Softness:       ${colorScore(curtain.avgSoftness)}`,
    `  Avg Elegance:       ${colorScore(curtain.avgElegance)}`,
    `  Avg Wisdom:         ${colorScore(curtain.avgWisdom)}`,
    `  Masterpieces:       ${curtain.velvetMasterpieceCount}`,
    `  Curtain Type:       ${curtain.curtainType}`,
    `  Condition:          ${colorCurtainCondition(curtain.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatCurtainsTable(curtains) */
export function formatCurtainsTable(curtains: VelvetCurtain[]): string {
  if (curtains.length === 0) return chalk.dim('No velvet curtains found')
  const lines: string[] = [chalk.bold('Velvet Curtains'), '']
  for (const c of curtains) {
    lines.push(`  ${chalk.rgb(80, 40, 120)(c.directory)}  ${colorScore(c.avgSoftness)}  ${colorCurtainCondition(c.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: VelvetDarknessResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Velvet Darkness Statistics'),
    '',
    `  Total Files:            ${stats.totalFiles}`,
    `  Total Curtains:         ${stats.totalCurtains}`,
    `  Avg Softness Quality:   ${colorScore(stats.avgSoftnessQuality)}`,
    `  Avg Dark Comfort:       ${colorScore(stats.avgDarkComfort)}`,
    `  Avg Shadow Elegance:    ${colorScore(stats.avgShadowElegance)}`,
    `  Avg Nocturnal Wisdom:   ${colorScore(stats.avgNocturnalWisdom)}`,
    `  Avg Night Resilience:   ${colorScore(stats.avgNightResilience)}`,
    `  Velvet Masterpieces:    ${stats.velvetMasterpieceCount}`,
    `  Midnight Silk:          ${stats.midnightSilkCount}`,
    `  Proper Fabric:          ${stats.properFabricCount}`,
    `  Coarse Weave:           ${stats.coarseWeaveCount}`,
    `  Torn Rag:               ${stats.tornRagCount}`,
    `  Void:                   ${stats.voidCount}`,
    `  Overall Depth:          ${colorScore(stats.overallDepth)}`,
    `  Weaver Grade:           ${stats.weaverGrade}`,
    `  Best Fold:              ${stats.bestFold || 'N/A'}`,
    `  Softest:                ${stats.softest || 'N/A'}`,
    `  Most Comforting:        ${stats.mostComforting || 'N/A'}`,
    `  Most Elegant:           ${stats.mostElegant || 'N/A'}`,
    `  Wisest:                 ${stats.wisest || 'N/A'}`,
    `  Most Resilient:         ${stats.mostResilient || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(80, 40, 120)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: VelvetDarknessResult): string {
  const lines: string[] = [
    chalk.bold('Velvet Darkness Analysis'),
    '',
    formatFoldsTable(result.folds),
    '',
    formatCurtainsTable(result.curtains),
    '',
    chalk.bold('Night Overview'),
    '',
    `  Avg Softness:      ${colorScore(result.night.avgSoftness)}`,
    `  Avg Elegance:      ${colorScore(result.night.avgElegance)}`,
    `  Avg Wisdom:        ${colorScore(result.night.avgWisdom)}`,
    `  Overall Depth:     ${colorScore(result.night.overallDepth)}`,
    `  Is Velvet:         ${result.night.isVelvet ? chalk.rgb(80, 40, 120)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: VelvetDarknessResult): string {
  return JSON.stringify(result, null, 2)
}
