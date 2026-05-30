import chalk from 'chalk'

import type { CoveCondition, WaveCondition, SapphireCove, SapphireWave, SapphireStats, SapphireTideResult } from './sapphire-tide-helpers.js'

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

/** @example colorCondition('sapphire-masterpiece') */
export function colorCondition(condition: WaveCondition | string): string {
  switch (condition) {
    case 'sapphire-masterpiece':
      return chalk.cyan('sapphire-masterpiece')
    case 'gem-tide':
      return chalk.blue('gem-tide')
    case 'proper-wave':
      return chalk.green('proper-wave')
    case 'murky-puddle':
      return chalk.yellow('murky-puddle')
    case 'dry-shore':
      return chalk.rgb(255, 165, 0)('dry-shore')
    case 'void':
      return chalk.red('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorCoveCondition('sapphire-paradise') */
export function colorCoveCondition(condition: CoveCondition | string): string {
  switch (condition) {
    case 'sapphire-paradise':
      return chalk.cyan('sapphire-paradise')
    case 'gem-bay':
      return chalk.blue('gem-bay')
    case 'proper-shore':
      return chalk.green('proper-shore')
    case 'murky-cove':
      return chalk.yellow('murky-cove')
    case 'dry-beach':
      return chalk.rgb(255, 165, 0)('dry-beach')
    case 'void':
      return chalk.red('void')
    default:
      return chalk.gray(String(condition))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatWaveTable(wave) */
export function formatWaveTable(wave: SapphireWave): string {
  const lines: string[] = [
    chalk.bold(`Sapphire Wave: ${wave.file}`),
    '',
    `  Gem Depth:        ${colorScore(wave.gemDepth)}  ${chalk.dim(`(${wave.diving.ocean})`)}`,
    `  Tidal Rhythm:     ${colorScore(wave.tidalRhythm)}  ${chalk.dim(`(${wave.pulsing.tide})`)}`,
    `  Wave Purity:      ${colorScore(wave.wavePurity)}  ${chalk.dim(`(${wave.cleansing.wave})`)}`,
    `  Ocean Wisdom:     ${colorScore(wave.oceanWisdom)}  ${chalk.dim(`(${wave.accumulating.deep})`)}`,
    `  Tide Resilience:  ${colorScore(wave.tideResilience)}  ${chalk.dim(`(${wave.flowing.current})`)}`,
    '',
    `  Quality Score: ${colorScore(wave.qualityScore)}  ${chalk.dim(`(${colorCondition(wave.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatWavesTable(waves) */
export function formatWavesTable(waves: SapphireWave[]): string {
  if (waves.length === 0) return chalk.dim('No sapphire waves found')

  const colWidths = {
    depth: Math.max(5, ...waves.map((w) => String(w.gemDepth).length)),
    file: Math.max(4, ...waves.map((w) => w.file.length)),
    purity: Math.max(6, ...waves.map((w) => String(w.wavePurity).length)),
    resilience: Math.max(10, ...waves.map((w) => String(w.tideResilience).length)),
    rhythm: Math.max(6, ...waves.map((w) => String(w.tidalRhythm).length)),
    score: Math.max(5, ...waves.map((w) => String(w.qualityScore).length)),
    wisdom: Math.max(6, ...waves.map((w) => String(w.oceanWisdom).length)),
  }

  const lines: string[] = [chalk.bold('Sapphire Waves'), '']

  const header =
    chalk.cyan(padRight('File', colWidths.file)) +
    '  ' +
    chalk.cyan(padLeft('Depth', colWidths.depth)) +
    '  ' +
    chalk.cyan(padLeft('Rhythm', colWidths.rhythm)) +
    '  ' +
    chalk.cyan(padLeft('Purity', colWidths.purity)) +
    '  ' +
    chalk.cyan(padLeft('Wisdom', colWidths.wisdom)) +
    '  ' +
    chalk.cyan(padLeft('Resilience', colWidths.resilience)) +
    '  ' +
    chalk.cyan(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const w of waves) {
    lines.push(
      padRight(w.file, colWidths.file) +
        '  ' +
        padLeft(String(w.gemDepth), colWidths.depth) +
        '  ' +
        padLeft(String(w.tidalRhythm), colWidths.rhythm) +
        '  ' +
        padLeft(String(w.wavePurity), colWidths.purity) +
        '  ' +
        padLeft(String(w.oceanWisdom), colWidths.wisdom) +
        '  ' +
        padLeft(String(w.tideResilience), colWidths.resilience) +
        '  ' +
        padLeft(String(w.qualityScore), colWidths.score),
    )
  }

  return lines.join('\n')
}

/** @example formatCoveTable(cove) */
export function formatCoveTable(cove: SapphireCove): string {
  const lines: string[] = [
    chalk.bold(`Sapphire Cove: ${cove.directory}`),
    '',
    `  Waves:          ${cove.waves.length}`,
    `  Avg Depth:      ${colorScore(cove.avgDepth)}`,
    `  Avg Purity:     ${colorScore(cove.avgPurity)}`,
    `  Avg Resilience: ${colorScore(cove.avgResilience)}`,
    `  Masterpieces:   ${cove.sapphireMasterpieceCount}`,
    `  Cove Type:      ${cove.coveType}`,
    `  Condition:      ${colorCoveCondition(cove.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatCovesTable(coves) */
export function formatCovesTable(coves: SapphireCove[]): string {
  if (coves.length === 0) return chalk.dim('No sapphire coves found')

  const lines: string[] = [chalk.bold('Sapphire Coves'), '']

  for (const c of coves) {
    lines.push(
      `  ${chalk.cyan(c.directory)}  ${colorScore(c.avgDepth)}  ${colorCoveCondition(c.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: SapphireStats): string {
  const lines: string[] = [
    chalk.bold('Sapphire Tide Statistics'),
    '',
    `  Total Files:            ${stats.totalFiles}`,
    `  Total Coves:            ${stats.totalCoves}`,
    `  Avg Gem Depth:          ${colorScore(stats.avgGemDepth)}`,
    `  Avg Tidal Rhythm:       ${colorScore(stats.avgTidalRhythm)}`,
    `  Avg Wave Purity:        ${colorScore(stats.avgWavePurity)}`,
    `  Avg Ocean Wisdom:       ${colorScore(stats.avgOceanWisdom)}`,
    `  Avg Tide Resilience:    ${colorScore(stats.avgTideResilience)}`,
    `  Sapphire Masterpieces:  ${stats.sapphireMasterpieceCount}`,
    `  Gem Tides:              ${stats.gemTideCount}`,
    `  Proper Waves:           ${stats.properWaveCount}`,
    `  Murky Puddles:          ${stats.murkyPuddleCount}`,
    `  Dry Shores:             ${stats.dryShoreCount}`,
    `  Void:                   ${stats.voidCount}`,
    `  Overall Depth:          ${colorScore(stats.overallDepth)}`,
    `  Navigator Grade:        ${stats.navigatorGrade}`,
    `  Best Wave:              ${stats.bestWave || 'N/A'}`,
    `  Deepest:                ${stats.deepest || 'N/A'}`,
    `  Most Rhythmic:          ${stats.mostRhythmic || 'N/A'}`,
    `  Purest:                 ${stats.purest || 'N/A'}`,
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
    lines.push(`  ${chalk.cyan('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: SapphireTideResult): string {
  const lines: string[] = [
    chalk.bold('Sapphire Tide Analysis'),
    '',
    formatWavesTable(result.waves),
    '',
    formatCovesTable(result.coves),
    '',
    chalk.bold('Ocean Overview'),
    '',
    `  Avg Depth:      ${colorScore(result.ocean.avgDepth)}`,
    `  Avg Purity:     ${colorScore(result.ocean.avgPurity)}`,
    `  Avg Resilience: ${colorScore(result.ocean.avgResilience)}`,
    `  Overall Depth:  ${colorScore(result.ocean.overallDepth)}`,
    `  Is Sapphire:    ${result.ocean.isSapphire ? chalk.green('yes') : chalk.red('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: SapphireTideResult): string {
  return JSON.stringify(result, null, 2)
}
