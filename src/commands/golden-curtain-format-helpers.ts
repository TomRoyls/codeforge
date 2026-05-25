import chalk from 'chalk'

import type { ThreadCondition, PalaceCondition, GoldenThread, GoldenPalace, GoldenCurtainResult } from './golden-curtain-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(255, 215, 0)(String(score))
  if (score >= 75) return chalk.rgb(230, 190, 0)(String(score))
  if (score >= 60) return chalk.rgb(200, 170, 30)(String(score))
  if (score >= 40) return chalk.rgb(170, 140, 50)(String(score))
  if (score >= 20) return chalk.rgb(130, 110, 70)(String(score))
  return chalk.gray(String(score))
}

/** @example colorCondition('golden-masterpiece') */
export function colorCondition(condition: ThreadCondition | string): string {
  switch (condition) {
    case 'golden-masterpiece':
      return chalk.rgb(255, 215, 0)('golden-masterpiece')
    case 'royal-standard':
      return chalk.rgb(230, 190, 0)('royal-standard')
    case 'proper-gold':
      return chalk.rgb(200, 170, 30)('proper-gold')
    case 'brass-finish':
      return chalk.rgb(170, 140, 50)('brass-finish')
    case 'tarnished-copper':
      return chalk.rgb(130, 110, 70)('tarnished-copper')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorPalaceCondition('golden-throne-room') */
export function colorPalaceCondition(condition: PalaceCondition | string): string {
  switch (condition) {
    case 'golden-throne-room':
      return chalk.rgb(255, 215, 0)('golden-throne-room')
    case 'royal-chamber':
      return chalk.rgb(230, 190, 0)('royal-chamber')
    case 'proper-hall':
      return chalk.rgb(200, 170, 30)('proper-hall')
    case 'tavern':
      return chalk.rgb(170, 140, 50)('tavern')
    case 'alley':
      return chalk.rgb(130, 110, 70)('alley')
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

/** @example formatThreadTable(thread) */
export function formatThreadTable(thread: GoldenThread): string {
  const lines: string[] = [
    chalk.bold(`Golden Thread: ${thread.file}`),
    '',
    `  Radiant Clarity:   ${colorScore(thread.radiantClarity)}  ${chalk.dim(`(${thread.illuminating.radiance})`)}`,
    `  Veil Elegance:     ${colorScore(thread.veilElegance)}  ${chalk.dim(`(${thread.draping.drape})`)}`,
    `  Aurum Purity:      ${colorScore(thread.aurumPurity)}  ${chalk.dim(`(${thread.purifying.karat})`)}`,
    `  Golden Resilience: ${colorScore(thread.goldenResilience)}  ${chalk.dim(`(${thread.enduring.permanence})`)}`,
    `  Legacy Wisdom:     ${colorScore(thread.legacyWisdom)}  ${chalk.dim(`(${thread.accumulating.legacy})`)}`,
    '',
    `  Quality Score: ${colorScore(thread.qualityScore)}  ${chalk.dim(`(${colorCondition(thread.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatThreadsTable(threads) */
export function formatThreadsTable(threads: GoldenThread[]): string {
  if (threads.length === 0) return chalk.dim('No golden threads found')

  const colWidths = {
    file: Math.max(4, ...threads.map((t) => t.file.length)),
    clar: Math.max(4, ...threads.map((t) => String(t.radiantClarity).length)),
    eleg: Math.max(4, ...threads.map((t) => String(t.veilElegance).length)),
    pur: Math.max(4, ...threads.map((t) => String(t.aurumPurity).length)),
    res: Math.max(4, ...threads.map((t) => String(t.goldenResilience).length)),
    wis: Math.max(4, ...threads.map((t) => String(t.legacyWisdom).length)),
    score: Math.max(5, ...threads.map((t) => String(t.qualityScore).length)),
  }

  const lines: string[] = [chalk.bold('Golden Threads'), '']

  const header =
    chalk.rgb(255, 215, 0)(padRight('File', colWidths.file)) +
    '  ' +
    chalk.rgb(255, 215, 0)(padLeft('Clar', colWidths.clar)) +
    '  ' +
    chalk.rgb(255, 215, 0)(padLeft('Eleg', colWidths.eleg)) +
    '  ' +
    chalk.rgb(255, 215, 0)(padLeft('Puri', colWidths.pur)) +
    '  ' +
    chalk.rgb(255, 215, 0)(padLeft('Resi', colWidths.res)) +
    '  ' +
    chalk.rgb(255, 215, 0)(padLeft('Wis', colWidths.wis)) +
    '  ' +
    chalk.rgb(255, 215, 0)(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const t of threads) {
    lines.push(
      padRight(t.file, colWidths.file) +
        '  ' +
        padLeft(String(t.radiantClarity), colWidths.clar) +
        '  ' +
        padLeft(String(t.veilElegance), colWidths.eleg) +
        '  ' +
        padLeft(String(t.aurumPurity), colWidths.pur) +
        '  ' +
        padLeft(String(t.goldenResilience), colWidths.res) +
        '  ' +
        padLeft(String(t.legacyWisdom), colWidths.wis) +
        '  ' +
        padLeft(String(t.qualityScore), colWidths.score),
    )
  }

  return lines.join('\n')
}

/** @example formatPalaceTable(palace) */
export function formatPalaceTable(palace: GoldenPalace): string {
  const lines: string[] = [
    chalk.bold(`Golden Palace: ${palace.directory}`),
    '',
    `  Threads:       ${palace.threads.length}`,
    `  Avg Clarity:   ${colorScore(palace.avgClarity)}`,
    `  Avg Purity:    ${colorScore(palace.avgPurity)}`,
    `  Avg Wisdom:    ${colorScore(palace.avgWisdom)}`,
    `  Masterpieces:  ${palace.goldenMasterpieceCount}`,
    `  Palace Type:   ${palace.palaceType}`,
    `  Condition:     ${colorPalaceCondition(palace.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatPalacesTable(palaces) */
export function formatPalacesTable(palaces: GoldenPalace[]): string {
  if (palaces.length === 0) return chalk.dim('No golden palaces found')

  const lines: string[] = [chalk.bold('Golden Palaces'), '']

  for (const p of palaces) {
    lines.push(
      `  ${chalk.rgb(255, 215, 0)(p.directory)}  ${colorScore(p.avgClarity)}  ${colorPalaceCondition(p.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: GoldenCurtainResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Golden Curtain Statistics'),
    '',
    `  Total Files:          ${stats.totalFiles}`,
    `  Total Palaces:        ${stats.totalPalaces}`,
    `  Avg Radiant Clarity:  ${colorScore(stats.avgRadiantClarity)}`,
    `  Avg Veil Elegance:    ${colorScore(stats.avgVeilElegance)}`,
    `  Avg Aurum Purity:     ${colorScore(stats.avgAurumPurity)}`,
    `  Avg Golden Resilience:${colorScore(stats.avgGoldenResilience)}`,
    `  Avg Legacy Wisdom:    ${colorScore(stats.avgLegacyWisdom)}`,
    `  Golden Masterpieces:  ${stats.goldenMasterpieceCount}`,
    `  Royal Standard:       ${stats.royalStandardCount}`,
    `  Proper Gold:          ${stats.properGoldCount}`,
    `  Brass Finish:         ${stats.brassFinishCount}`,
    `  Tarnished Copper:     ${stats.tarnishedCopperCount}`,
    `  Void:                 ${stats.voidCount}`,
    `  Overall Brilliance:   ${colorScore(stats.overallBrilliance)}`,
    `  Goldsmith Grade:      ${stats.goldsmithGrade}`,
    `  Best Thread:          ${stats.bestThread || 'N/A'}`,
    `  Clearest:             ${stats.clearest || 'N/A'}`,
    `  Most Elegant:         ${stats.mostElegant || 'N/A'}`,
    `  Purest:               ${stats.purest || 'N/A'}`,
    `  Most Resilient:       ${stats.mostResilient || 'N/A'}`,
    `  Wisest:               ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(255, 215, 0)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: GoldenCurtainResult): string {
  const lines: string[] = [
    chalk.bold('Golden Curtain Analysis'),
    '',
    formatThreadsTable(result.threads),
    '',
    formatPalacesTable(result.palaces),
    '',
    chalk.bold('Treasury Overview'),
    '',
    `  Avg Clarity:    ${colorScore(result.treasury.avgClarity)}`,
    `  Avg Purity:     ${colorScore(result.treasury.avgPurity)}`,
    `  Avg Wisdom:     ${colorScore(result.treasury.avgWisdom)}`,
    `  Brilliance:     ${colorScore(result.treasury.overallBrilliance)}`,
    `  Is Golden:      ${result.treasury.isGolden ? chalk.rgb(255, 215, 0)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: GoldenCurtainResult): string {
  return JSON.stringify(result, null, 2)
}
