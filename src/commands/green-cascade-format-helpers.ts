import chalk from 'chalk'

import type { JadeCondition, StreamCondition, JadeDrop, JadeCascadeResult, JadeStream } from './green-cascade-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(0, 168, 107)(String(score))
  if (score >= 75) return chalk.rgb(0, 140, 90)(String(score))
  if (score >= 60) return chalk.rgb(0, 112, 74)(String(score))
  if (score >= 40) return chalk.rgb(0, 84, 58)(String(score))
  if (score >= 20) return chalk.rgb(0, 56, 42)(String(score))
  return chalk.gray(String(score))
}

/** @example colorJadeCondition('jade-masterpiece') */
export function colorJadeCondition(condition: JadeCondition | string): string {
  switch (condition) {
    case 'jade-masterpiece':
      return chalk.rgb(0, 168, 107)('jade-masterpiece')
    case 'perfect-flow':
      return chalk.rgb(0, 140, 90)('perfect-flow')
    case 'proper-stream':
      return chalk.rgb(0, 112, 74)('proper-stream')
    case 'murky-water':
      return chalk.rgb(0, 84, 58)('murky-water')
    case 'dry-bed':
      return chalk.rgb(0, 56, 42)('dry-bed')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorStreamCondition('jade-garden') */
export function colorStreamCondition(condition: StreamCondition | string): string {
  switch (condition) {
    case 'jade-garden':
      return chalk.rgb(0, 168, 107)('jade-garden')
    case 'flowing-sanctuary':
      return chalk.rgb(0, 140, 90)('flowing-sanctuary')
    case 'proper-pond':
      return chalk.rgb(0, 112, 74)('proper-pond')
    case 'stagnant-pool':
      return chalk.rgb(0, 84, 58)('stagnant-pool')
    case 'desert':
      return chalk.rgb(0, 56, 42)('desert')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatDropTable(drop) */
export function formatDropTable(drop: JadeDrop): string {
  const lines: string[] = [
    chalk.bold(`Jade Drop: ${drop.file}`),
    '',
    `  Flow Grace:        ${colorScore(drop.flowGrace)}  ${chalk.dim(`(${drop.flowing.current})`)}`,
    `  Cascade Clarity:   ${colorScore(drop.cascadeClarity)}  ${chalk.dim(`(${drop.clarifying.cascade})`)}`,
    `  Pool Depth:        ${colorScore(drop.poolDepth)}  ${chalk.dim(`(${drop.deepening.pool})`)}`,
    `  Mist Purity:       ${colorScore(drop.mistPurity)}  ${chalk.dim(`(${drop.purifying.mist})`)}`,
    `  River Wisdom:      ${colorScore(drop.riverWisdom)}  ${chalk.dim(`(${drop.accumulating.river})`)}`,
    '',
    `  Quality Score: ${colorScore(drop.qualityScore)}  ${chalk.dim(`(${colorJadeCondition(drop.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatDropsTable(drops) */
export function formatDropsTable(drops: JadeDrop[]): string {
  if (drops.length === 0) return chalk.dim('No jade drops found')

  const colWidths = {
    file: Math.max(4, ...drops.map((d) => d.file.length)),
    grace: Math.max(5, ...drops.map((d) => String(d.flowGrace).length)),
    clar: Math.max(4, ...drops.map((d) => String(d.cascadeClarity).length)),
    depth: Math.max(5, ...drops.map((d) => String(d.poolDepth).length)),
    purity: Math.max(5, ...drops.map((d) => String(d.mistPurity).length)),
    wisdom: Math.max(5, ...drops.map((d) => String(d.riverWisdom).length)),
    score: Math.max(5, ...drops.map((d) => String(d.qualityScore).length)),
  }

  const lines: string[] = [chalk.bold('Jade Drops'), '']

  const header =
    chalk.rgb(0, 168, 107)(padRight('File', colWidths.file)) +
    '  ' +
    chalk.rgb(0, 168, 107)(padLeft('Grace', colWidths.grace)) +
    '  ' +
    chalk.rgb(0, 168, 107)(padLeft('Clar', colWidths.clar)) +
    '  ' +
    chalk.rgb(0, 168, 107)(padLeft('Depth', colWidths.depth)) +
    '  ' +
    chalk.rgb(0, 168, 107)(padLeft('Purity', colWidths.purity)) +
    '  ' +
    chalk.rgb(0, 168, 107)(padLeft('Wisdm', colWidths.wisdom)) +
    '  ' +
    chalk.rgb(0, 168, 107)(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const d of drops) {
    lines.push(
      padRight(d.file, colWidths.file) +
        '  ' +
        padLeft(String(d.flowGrace), colWidths.grace) +
        '  ' +
        padLeft(String(d.cascadeClarity), colWidths.clar) +
        '  ' +
        padLeft(String(d.poolDepth), colWidths.depth) +
        '  ' +
        padLeft(String(d.mistPurity), colWidths.purity) +
        '  ' +
        padLeft(String(d.riverWisdom), colWidths.wisdom) +
        '  ' +
        padLeft(String(d.qualityScore), colWidths.score),
    )
  }

  return lines.join('\n')
}

/** @example formatStreamTable(stream) */
export function formatStreamTable(stream: JadeStream): string {
  const lines: string[] = [
    chalk.bold(`Jade Stream: ${stream.directory}`),
    '',
    `  Drops:              ${stream.drops.length}`,
    `  Avg Grace:          ${colorScore(stream.avgGrace)}`,
    `  Avg Depth:          ${colorScore(stream.avgDepth)}`,
    `  Avg Wisdom:         ${colorScore(stream.avgWisdom)}`,
    `  Masterpieces:       ${stream.jadeMasterpieceCount}`,
    `  Stream Type:        ${stream.streamType}`,
    `  Condition:          ${colorStreamCondition(stream.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatStreamsTable(streams) */
export function formatStreamsTable(streams: JadeStream[]): string {
  if (streams.length === 0) return chalk.dim('No jade streams found')

  const lines: string[] = [chalk.bold('Jade Streams'), '']

  for (const s of streams) {
    lines.push(
      `  ${chalk.rgb(0, 168, 107)(s.directory)}  ${colorScore(s.avgGrace)}  ${colorStreamCondition(s.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: JadeCascadeResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Jade Cascade Statistics'),
    '',
    `  Total Files:             ${stats.totalFiles}`,
    `  Total Streams:           ${stats.totalStreams}`,
    `  Avg Flow Grace:          ${colorScore(stats.avgFlowGrace)}`,
    `  Avg Cascade Clarity:     ${colorScore(stats.avgCascadeClarity)}`,
    `  Avg Pool Depth:          ${colorScore(stats.avgPoolDepth)}`,
    `  Avg Mist Purity:         ${colorScore(stats.avgMistPurity)}`,
    `  Avg River Wisdom:        ${colorScore(stats.avgRiverWisdom)}`,
    `  Jade Masterpieces:       ${stats.jadeMasterpieceCount}`,
    `  Perfect Flows:           ${stats.perfectFlowCount}`,
    `  Proper Streams:          ${stats.properStreamCount}`,
    `  Murky Waters:            ${stats.murkyWaterCount}`,
    `  Dry Beds:                ${stats.dryBedCount}`,
    `  Void:                    ${stats.voidCount}`,
    `  Overall Serenity:        ${colorScore(stats.overallSerenity)}`,
    `  Gardener Grade:          ${stats.gardenerGrade}`,
    `  Best Drop:               ${stats.bestDrop || 'N/A'}`,
    `  Most Graceful:           ${stats.mostGraceful || 'N/A'}`,
    `  Clearest:                ${stats.clearest || 'N/A'}`,
    `  Deepest:                 ${stats.deepest || 'N/A'}`,
    `  Purest:                  ${stats.purest || 'N/A'}`,
    `  Wisest:                  ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(0, 168, 107)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: JadeCascadeResult): string {
  const lines: string[] = [
    chalk.bold('Jade Cascade Analysis'),
    '',
    formatDropsTable(result.drops),
    '',
    formatStreamsTable(result.streams),
    '',
    chalk.bold('Garden Overview'),
    '',
    `  Avg Grace:        ${colorScore(result.garden.avgGrace)}`,
    `  Avg Depth:        ${colorScore(result.garden.avgDepth)}`,
    `  Avg Wisdom:       ${colorScore(result.garden.avgWisdom)}`,
    `  Serenity:         ${colorScore(result.garden.overallSerenity)}`,
    `  Is Jade:          ${result.garden.isJade ? chalk.rgb(0, 168, 107)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: JadeCascadeResult): string {
  return JSON.stringify(result, null, 2)
}
