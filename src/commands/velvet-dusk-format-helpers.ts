import chalk from 'chalk'

import type { FoldCondition, CurtainCondition, VelvetFold, VelvetCurtain, VelvetDuskResult } from './velvet-dusk-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(100, 50, 150)(String(score))
  if (score >= 75) return chalk.rgb(120, 70, 140)(String(score))
  if (score >= 60) return chalk.rgb(140, 90, 130)(String(score))
  if (score >= 40) return chalk.rgb(120, 90, 120)(String(score))
  if (score >= 20) return chalk.rgb(100, 80, 100)(String(score))
  return chalk.gray(String(score))
}

/** @example colorCondition('velvet-masterpiece') */
export function colorCondition(condition: FoldCondition | string): string {
  switch (condition) {
    case 'velvet-masterpiece':
      return chalk.rgb(100, 50, 150)('velvet-masterpiece')
    case 'midnight-silk':
      return chalk.rgb(120, 70, 140)('midnight-silk')
    case 'proper-fabric':
      return chalk.rgb(140, 90, 130)('proper-fabric')
    case 'coarse-weave':
      return chalk.rgb(120, 90, 120)('coarse-weave')
    case 'torn-rag':
      return chalk.rgb(100, 80, 100)('torn-rag')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorCurtainCondition('velvet-theater') */
export function colorCurtainCondition(condition: CurtainCondition | string): string {
  switch (condition) {
    case 'velvet-theater':
      return chalk.rgb(100, 50, 150)('velvet-theater')
    case 'silk-parlor':
      return chalk.rgb(120, 70, 140)('silk-parlor')
    case 'proper-room':
      return chalk.rgb(140, 90, 130)('proper-room')
    case 'bare-walls':
      return chalk.rgb(120, 90, 120)('bare-walls')
    case 'ruin':
      return chalk.rgb(100, 80, 100)('ruin')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
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
    `  Quality Score: ${colorScore(fold.qualityScore)}  ${chalk.dim(`(${colorCondition(fold.condition)})`)}`,
  ]
  if (fold.celebration) {
    lines.push('', chalk.rgb(100, 50, 150)(fold.celebration))
  }
  return lines.join('\n')
}

/** @example formatFoldsTable(folds) */
export function formatFoldsTable(folds: VelvetFold[]): string {
  if (folds.length === 0) return chalk.dim('No velvet folds found')

  const colWidths = {
    file: Math.max(4, ...folds.map((f) => f.file.length)),
    soft: Math.max(4, ...folds.map((f) => String(f.softnessQuality).length)),
    comf: Math.max(4, ...folds.map((f) => String(f.darkComfort).length)),
    eleg: Math.max(4, ...folds.map((f) => String(f.shadowElegance).length)),
    wis: Math.max(4, ...folds.map((f) => String(f.nocturnalWisdom).length)),
    res: Math.max(4, ...folds.map((f) => String(f.nightResilience).length)),
    score: Math.max(5, ...folds.map((f) => String(f.qualityScore).length)),
  }

  const lines: string[] = [chalk.bold('Velvet Folds'), '']

  const header =
    chalk.rgb(100, 50, 150)(padRight('File', colWidths.file)) +
    '  ' +
    chalk.rgb(100, 50, 150)(padLeft('Soft', colWidths.soft)) +
    '  ' +
    chalk.rgb(100, 50, 150)(padLeft('Comf', colWidths.comf)) +
    '  ' +
    chalk.rgb(100, 50, 150)(padLeft('Eleg', colWidths.eleg)) +
    '  ' +
    chalk.rgb(100, 50, 150)(padLeft('Wis', colWidths.wis)) +
    '  ' +
    chalk.rgb(100, 50, 150)(padLeft('Resi', colWidths.res)) +
    '  ' +
    chalk.rgb(100, 50, 150)(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const f of folds) {
    lines.push(
      padRight(f.file, colWidths.file) +
        '  ' +
        padLeft(String(f.softnessQuality), colWidths.soft) +
        '  ' +
        padLeft(String(f.darkComfort), colWidths.comf) +
        '  ' +
        padLeft(String(f.shadowElegance), colWidths.eleg) +
        '  ' +
        padLeft(String(f.nocturnalWisdom), colWidths.wis) +
        '  ' +
        padLeft(String(f.nightResilience), colWidths.res) +
        '  ' +
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
    `  Folds:               ${curtain.folds.length}`,
    `  Avg Softness:        ${colorScore(curtain.avgSoftness)}`,
    `  Avg Elegance:        ${colorScore(curtain.avgElegance)}`,
    `  Avg Wisdom:          ${colorScore(curtain.avgWisdom)}`,
    `  Masterpieces:        ${curtain.velvetMasterpieceCount}`,
    `  Curtain Type:        ${curtain.curtainType}`,
    `  Condition:           ${colorCurtainCondition(curtain.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatCurtainsTable(curtains) */
export function formatCurtainsTable(curtains: VelvetCurtain[]): string {
  if (curtains.length === 0) return chalk.dim('No velvet curtains found')

  const lines: string[] = [chalk.bold('Velvet Curtains'), '']

  for (const c of curtains) {
    lines.push(
      `  ${chalk.rgb(100, 50, 150)(c.directory)}  ${colorScore(c.avgSoftness)}  ${colorCurtainCondition(c.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: VelvetDuskResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Velvet Dusk Statistics'),
    '',
    `  Total Files:           ${stats.totalFiles}`,
    `  Total Curtains:        ${stats.totalCurtains}`,
    `  Avg Softness Quality:  ${colorScore(stats.avgSoftnessQuality)}`,
    `  Avg Dark Comfort:      ${colorScore(stats.avgDarkComfort)}`,
    `  Avg Shadow Elegance:   ${colorScore(stats.avgShadowElegance)}`,
    `  Avg Nocturnal Wisdom:  ${colorScore(stats.avgNocturnalWisdom)}`,
    `  Avg Night Resilience:  ${colorScore(stats.avgNightResilience)}`,
    `  Velvet Masterpieces:   ${stats.velvetMasterpieceCount}`,
    `  Midnight Silk:         ${stats.midnightSilkCount}`,
    `  Proper Fabric:         ${stats.properFabricCount}`,
    `  Coarse Weave:          ${stats.coarseWeaveCount}`,
    `  Torn Rag:              ${stats.tornRagCount}`,
    `  Void:                  ${stats.voidCount}`,
    `  Overall Depth:         ${colorScore(stats.overallDepth)}`,
    `  Weaver Grade:          ${stats.weaverGrade}`,
    `  Best Fold:             ${stats.bestFold || 'N/A'}`,
    `  Softest:               ${stats.softest || 'N/A'}`,
    `  Most Comforting:       ${stats.mostComforting || 'N/A'}`,
    `  Most Elegant:          ${stats.mostElegant || 'N/A'}`,
    `  Wisest:                ${stats.wisest || 'N/A'}`,
    `  Most Resilient:        ${stats.mostResilient || 'N/A'}`,
  ]
  if (stats.celebration) {
    lines.push('', chalk.rgb(100, 50, 150)(stats.celebration))
  }
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(100, 50, 150)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: VelvetDuskResult): string {
  const lines: string[] = [
    chalk.bold('Velvet Dusk Analysis'),
    '',
    formatFoldsTable(result.folds),
    '',
    formatCurtainsTable(result.curtains),
    '',
    chalk.bold('Night Overview'),
    '',
    `  Avg Softness:   ${colorScore(result.night.avgSoftness)}`,
    `  Avg Elegance:   ${colorScore(result.night.avgElegance)}`,
    `  Avg Wisdom:     ${colorScore(result.night.avgWisdom)}`,
    `  Depth:          ${colorScore(result.night.overallDepth)}`,
    `  Is Velvet:      ${result.night.isVelvet ? chalk.rgb(100, 50, 150)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: VelvetDuskResult): string {
  return JSON.stringify(result, null, 2)
}
