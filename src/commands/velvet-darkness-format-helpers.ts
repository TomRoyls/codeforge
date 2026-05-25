import chalk from 'chalk'

import type { FoldCondition, CurtainCondition, VelvetFold, VelvetCurtain, VelvetDarknessStats, VelvetDarknessResult } from './velvet-darkness-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(75, 0, 130)(String(score))
  if (score >= 75) return chalk.rgb(90, 0, 150)(String(score))
  if (score >= 60) return chalk.rgb(106, 90, 205)(String(score))
  if (score >= 40) return chalk.rgb(80, 60, 160)(String(score))
  if (score >= 20) return chalk.rgb(60, 40, 120)(String(score))
  return chalk.gray(String(score))
}

/** @example colorCondition('velvet-masterpiece') */
export function colorCondition(condition: FoldCondition | string): string {
  switch (condition) {
    case 'velvet-masterpiece':
      return chalk.rgb(75, 0, 130)('velvet-masterpiece')
    case 'silk-night':
      return chalk.rgb(90, 0, 150)('silk-night')
    case 'proper-dark':
      return chalk.rgb(106, 90, 205)('proper-dark')
    case 'rough-twilight':
      return chalk.rgb(80, 60, 160)('rough-twilight')
    case 'harsh-daylight':
      return chalk.rgb(60, 40, 120)('harsh-daylight')
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
      return chalk.rgb(75, 0, 130)('velvet-theater')
    case 'dark-chamber':
      return chalk.rgb(90, 0, 150)('dark-chamber')
    case 'proper-room':
      return chalk.rgb(106, 90, 205)('proper-room')
    case 'dim-corner':
      return chalk.rgb(80, 60, 160)('dim-corner')
    case 'harsh-lit-hall':
      return chalk.rgb(60, 40, 120)('harsh-lit-hall')
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
    `  Softness Quality:   ${colorScore(fold.softnessQuality)}  ${chalk.dim(`(${fold.smoothing.fabric})`)}`,
    `  Dark Comfort:       ${colorScore(fold.darkComfort)}  ${chalk.dim(`(${fold.comforting.blanket})`)}`,
    `  Shadow Elegance:    ${colorScore(fold.shadowElegance)}  ${chalk.dim(`(${fold.draping.drape})`)}`,
    `  Nocturnal Wisdom:   ${colorScore(fold.nocturnalWisdom)}  ${chalk.dim(`(${fold.knowing.owl})`)}`,
    `  Night Resilience:   ${colorScore(fold.nightResilience)}  ${chalk.dim(`(${fold.surviving.night})`)}`,
    '',
    `  Quality Score: ${colorScore(fold.qualityScore)}  ${chalk.dim(`(${colorCondition(fold.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatFoldsTable(folds) */
export function formatFoldsTable(folds: VelvetFold[]): string {
  if (folds.length === 0) return chalk.dim('No velvet folds found')

  const colWidths = {
    file: Math.max(4, ...folds.map((f) => f.file.length)),
    soft: Math.max(4, ...folds.map((f) => String(f.softnessQuality).length)),
    comf: Math.max(4, ...folds.map((f) => String(f.darkComfort).length)),
    eleg: Math.max(5, ...folds.map((f) => String(f.shadowElegance).length)),
    wise: Math.max(4, ...folds.map((f) => String(f.nocturnalWisdom).length)),
    res: Math.max(3, ...folds.map((f) => String(f.nightResilience).length)),
    score: Math.max(5, ...folds.map((f) => String(f.qualityScore).length)),
  }

  const lines: string[] = [chalk.bold('Velvet Folds'), '']

  const header =
    chalk.rgb(75, 0, 130)(padRight('File', colWidths.file)) +
    '  ' +
    chalk.rgb(75, 0, 130)(padLeft('Soft', colWidths.soft)) +
    '  ' +
    chalk.rgb(75, 0, 130)(padLeft('Comf', colWidths.comf)) +
    '  ' +
    chalk.rgb(75, 0, 130)(padLeft('Eleg', colWidths.eleg)) +
    '  ' +
    chalk.rgb(75, 0, 130)(padLeft('Wise', colWidths.wise)) +
    '  ' +
    chalk.rgb(75, 0, 130)(padLeft('Res', colWidths.res)) +
    '  ' +
    chalk.rgb(75, 0, 130)(padLeft('Score', colWidths.score))

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
        padLeft(String(f.nocturnalWisdom), colWidths.wise) +
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
    `  Folds:                ${curtain.folds.length}`,
    `  Avg Softness:         ${colorScore(curtain.avgSoftness)}`,
    `  Avg Elegance:         ${colorScore(curtain.avgElegance)}`,
    `  Avg Resilience:       ${colorScore(curtain.avgResilience)}`,
    `  Velvet Masterpieces:  ${curtain.velvetMasterpieceCount}`,
    `  Curtain Type:         ${curtain.curtainType}`,
    `  Condition:            ${colorCurtainCondition(curtain.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatCurtainsTable(curtains) */
export function formatCurtainsTable(curtains: VelvetCurtain[]): string {
  if (curtains.length === 0) return chalk.dim('No velvet curtains found')

  const lines: string[] = [chalk.bold('Velvet Curtains'), '']

  for (const c of curtains) {
    lines.push(
      `  ${chalk.rgb(75, 0, 130)(c.directory)}  ${colorScore(c.avgSoftness)}  ${colorCurtainCondition(c.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: VelvetDarknessStats): string {
  const lines: string[] = [
    chalk.bold('Velvet Darkness Statistics'),
    '',
    `  Total Files:           ${stats.totalFiles}`,
    `  Total Curtains:        ${stats.totalCurtains}`,
    `  Avg Softness Quality:  ${colorScore(stats.avgSoftnessQuality)}`,
    `  Avg Dark Comfort:      ${colorScore(stats.avgDarkComfort)}`,
    `  Avg Shadow Elegance:   ${colorScore(stats.avgShadowElegance)}`,
    `  Avg Nocturnal Wisdom:  ${colorScore(stats.avgNocturnalWisdom)}`,
    `  Avg Night Resilience:  ${colorScore(stats.avgNightResilience)}`,
    `  Velvet Masterpieces:   ${stats.velvetMasterpieceCount}`,
    `  Silk Nights:           ${stats.silkNightCount}`,
    `  Proper Darks:          ${stats.properDarkCount}`,
    `  Rough Twilights:       ${stats.roughTwilightCount}`,
    `  Harsh Daylights:       ${stats.harshDaylightCount}`,
    `  Void:                  ${stats.voidCount}`,
    `  Overall Luxury:        ${colorScore(stats.overallLuxury)}`,
    `  Tailor Grade:          ${stats.tailorGrade}`,
    `  Best Fold:             ${stats.bestFold || 'N/A'}`,
    `  Softest:               ${stats.softest || 'N/A'}`,
    `  Most Comforting:       ${stats.mostComforting || 'N/A'}`,
    `  Most Elegant:          ${stats.mostElegant || 'N/A'}`,
    `  Wisest:                ${stats.wisest || 'N/A'}`,
    `  Most Resilient:        ${stats.mostResilient || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(75, 0, 130)('\u2022')} ${rec}`)
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
    chalk.bold('Evening Overview'),
    '',
    `  Avg Softness:     ${colorScore(result.evening.avgSoftness)}`,
    `  Avg Elegance:     ${colorScore(result.evening.avgElegance)}`,
    `  Avg Resilience:   ${colorScore(result.evening.avgResilience)}`,
    `  Overall Luxury:   ${colorScore(result.evening.overallLuxury)}`,
    `  Is Velvet:        ${result.evening.isVelvet ? chalk.rgb(75, 0, 130)('yes') : chalk.gray('no')}`,
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
