import chalk from 'chalk'

import type { LoomCondition, ThreadCondition, GoldenLoom, GoldenThread, GoldenStats, GoldenVeilResult } from './golden-veil-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.cyan(String(score))
  if (score >= 75) return chalk.blue(String(score))
  if (score >= 60) return chalk.green(String(score))
  if (score >= 40) return chalk.yellow(String(score))
  if (score >= 20) return chalk.rgb(255, 165, 0)(String(score))
  return chalk.red(String(score))
}

/** @example colorCondition('golden-masterpiece') */
export function colorCondition(condition: ThreadCondition | string): string {
  switch (condition) {
    case 'golden-masterpiece':
      return chalk.cyan('golden-masterpiece')
    case 'radiant-veil':
      return chalk.blue('radiant-veil')
    case 'proper-curtain':
      return chalk.green('proper-curtain')
    case 'faded-fabric':
      return chalk.yellow('faded-fabric')
    case 'torn-rag':
      return chalk.rgb(255, 165, 0)('torn-rag')
    case 'void':
      return chalk.red('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorLoomCondition('golden-palace') */
export function colorLoomCondition(condition: LoomCondition | string): string {
  switch (condition) {
    case 'golden-palace':
      return chalk.cyan('golden-palace')
    case 'radiant-hall':
      return chalk.blue('radiant-hall')
    case 'proper-chamber':
      return chalk.green('proper-chamber')
    case 'faded-room':
      return chalk.yellow('faded-room')
    case 'dark-corner':
      return chalk.rgb(255, 165, 0)('dark-corner')
    case 'void':
      return chalk.red('void')
    default:
      return chalk.gray(String(condition))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatThreadTable(thread) */
export function formatThreadTable(thread: GoldenThread): string {
  const lines: string[] = [
    chalk.bold(`Golden Thread: ${thread.file}`),
    '',
    `  Radiant Clarity:    ${colorScore(thread.radiantClarity)}  ${chalk.dim(`(${thread.illuminating.radiance})`)}`,
    `  Veil Elegance:      ${colorScore(thread.veilElegance)}  ${chalk.dim(`(${thread.weaving.veil})`)}`,
    `  Aurum Purity:       ${colorScore(thread.aurumPurity)}  ${chalk.dim(`(${thread.purifying.aurum})`)}`,
    `  Golden Resilience:  ${colorScore(thread.goldenResilience)}  ${chalk.dim(`(${thread.enduring.gold})`)}`,
    `  Legacy Wisdom:      ${colorScore(thread.legacyWisdom)}  ${chalk.dim(`(${thread.inheriting.legacy})`)}`,
    '',
    `  Quality Score: ${colorScore(thread.qualityScore)}  ${chalk.dim(`(${colorCondition(thread.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatThreadsTable(threads) */
export function formatThreadsTable(threads: GoldenThread[]): string {
  if (threads.length === 0) return chalk.dim('No golden threads found')

  const colWidths = {
    clarity: Math.max(7, ...threads.map((t) => String(t.radiantClarity).length)),
    elegance: Math.max(8, ...threads.map((t) => String(t.veilElegance).length)),
    file: Math.max(4, ...threads.map((t) => t.file.length)),
    purity: Math.max(6, ...threads.map((t) => String(t.aurumPurity).length)),
    resilience: Math.max(10, ...threads.map((t) => String(t.goldenResilience).length)),
    score: Math.max(5, ...threads.map((t) => String(t.qualityScore).length)),
    wisdom: Math.max(6, ...threads.map((t) => String(t.legacyWisdom).length)),
  }

  const lines: string[] = [chalk.bold('Golden Threads'), '']

  const header =
    chalk.cyan(padRight('File', colWidths.file)) +
    '  ' +
    chalk.cyan(padLeft('Clarity', colWidths.clarity)) +
    '  ' +
    chalk.cyan(padLeft('Elegance', colWidths.elegance)) +
    '  ' +
    chalk.cyan(padLeft('Purity', colWidths.purity)) +
    '  ' +
    chalk.cyan(padLeft('Resilience', colWidths.resilience)) +
    '  ' +
    chalk.cyan(padLeft('Wisdom', colWidths.wisdom)) +
    '  ' +
    chalk.cyan(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const t of threads) {
    lines.push(
      padRight(t.file, colWidths.file) +
        '  ' +
        padLeft(String(t.radiantClarity), colWidths.clarity) +
        '  ' +
        padLeft(String(t.veilElegance), colWidths.elegance) +
        '  ' +
        padLeft(String(t.aurumPurity), colWidths.purity) +
        '  ' +
        padLeft(String(t.goldenResilience), colWidths.resilience) +
        '  ' +
        padLeft(String(t.legacyWisdom), colWidths.wisdom) +
        '  ' +
        padLeft(String(t.qualityScore), colWidths.score),
    )
  }

  return lines.join('\n')
}

/** @example formatLoomTable(loom) */
export function formatLoomTable(loom: GoldenLoom): string {
  const lines: string[] = [
    chalk.bold(`Golden Loom: ${loom.directory}`),
    '',
    `  Threads:        ${loom.threads.length}`,
    `  Avg Clarity:    ${colorScore(loom.avgClarity)}`,
    `  Avg Elegance:   ${colorScore(loom.avgElegance)}`,
    `  Avg Wisdom:     ${colorScore(loom.avgWisdom)}`,
    `  Masterpieces:   ${loom.goldenMasterpieceCount}`,
    `  Loom Type:      ${loom.loomType}`,
    `  Condition:      ${colorLoomCondition(loom.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatLoomsTable(looms) */
export function formatLoomsTable(looms: GoldenLoom[]): string {
  if (looms.length === 0) return chalk.dim('No golden looms found')

  const lines: string[] = [chalk.bold('Golden Looms'), '']

  for (const l of looms) {
    lines.push(
      `  ${chalk.cyan(l.directory)}  ${colorScore(l.avgClarity)}  ${colorLoomCondition(l.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: GoldenStats): string {
  const lines: string[] = [
    chalk.bold('Golden Veil Statistics'),
    '',
    `  Total Files:           ${stats.totalFiles}`,
    `  Total Looms:           ${stats.totalLooms}`,
    `  Avg Radiant Clarity:   ${colorScore(stats.avgRadiantClarity)}`,
    `  Avg Veil Elegance:     ${colorScore(stats.avgVeilElegance)}`,
    `  Avg Aurum Purity:      ${colorScore(stats.avgAurumPurity)}`,
    `  Avg Golden Resilience: ${colorScore(stats.avgGoldenResilience)}`,
    `  Avg Legacy Wisdom:     ${colorScore(stats.avgLegacyWisdom)}`,
    `  Golden Masterpieces:   ${stats.goldenMasterpieceCount}`,
    `  Radiant Veils:         ${stats.radiantVeilCount}`,
    `  Proper Curtains:       ${stats.properCurtainCount}`,
    `  Faded Fabrics:         ${stats.fadedFabricCount}`,
    `  Torn Rags:             ${stats.tornRagCount}`,
    `  Void:                  ${stats.voidCount}`,
    `  Overall Radiance:      ${colorScore(stats.overallRadiance)}`,
    `  Weaver Grade:          ${stats.weaverGrade}`,
    `  Best Thread:           ${stats.bestThread || 'N/A'}`,
    `  Clearest:              ${stats.clearest || 'N/A'}`,
    `  Most Elegant:          ${stats.mostElegant || 'N/A'}`,
    `  Purest:                ${stats.purest || 'N/A'}`,
    `  Most Resilient:        ${stats.mostResilient || 'N/A'}`,
    `  Wisest:                ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.cyan('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: GoldenVeilResult): string {
  const lines: string[] = [
    chalk.bold('Golden Veil Analysis'),
    '',
    formatThreadsTable(result.threads),
    '',
    formatLoomsTable(result.looms),
    '',
    chalk.bold('Tapestry Overview'),
    '',
    `  Avg Clarity:     ${colorScore(result.tapestry.avgClarity)}`,
    `  Avg Elegance:    ${colorScore(result.tapestry.avgElegance)}`,
    `  Avg Wisdom:      ${colorScore(result.tapestry.avgWisdom)}`,
    `  Overall Radiance: ${colorScore(result.tapestry.overallRadiance)}`,
    `  Is Golden:       ${result.tapestry.isGolden ? chalk.green('yes') : chalk.red('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: GoldenVeilResult): string {
  return JSON.stringify(result, null, 2)
}
