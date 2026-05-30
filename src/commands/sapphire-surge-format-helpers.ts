import chalk from 'chalk'

import type { OceanCondition, SapphireOcean, SapphireTideResult, SapphireWave } from './sapphire-surge-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(30, 120, 220)(String(score))
  if (score >= 75) return chalk.rgb(50, 140, 230)(String(score))
  if (score >= 60) return chalk.rgb(70, 160, 240)(String(score))
  if (score >= 40) return chalk.rgb(40, 100, 180)(String(score))
  if (score >= 20) return chalk.rgb(30, 80, 150)(String(score))
  return chalk.gray(String(score))
}

/** @example colorOceanCondition('sapphire-palace') */
export function colorOceanCondition(condition: OceanCondition | string): string {
  switch (condition) {
    case 'sapphire-palace': return chalk.rgb(30, 120, 220)('sapphire-palace')
    case 'ocean-floor': return chalk.rgb(50, 140, 230)('ocean-floor')
    case 'proper-depths': return chalk.rgb(70, 160, 240)('proper-depths')
    case 'shallow-reef': return chalk.rgb(40, 100, 180)('shallow-reef')
    case 'dry-dock': return chalk.rgb(30, 80, 150)('dry-dock')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatWaveTable(wave) */
export function formatWaveTable(wave: SapphireWave): string {
  const lines: string[] = [
    chalk.bold(`Sapphire Wave: ${wave.file}`),
    '',
    `  Gem Depth:        ${colorScore(wave.gemDepth)}  ${chalk.dim(`(${wave.diving.gem})`)}`,
    `  Tidal Rhythm:     ${colorScore(wave.tidalRhythm)}  ${chalk.dim(`(${wave.pulsing.tide})`)}`,
    `  Wave Purity:      ${colorScore(wave.wavePurity)}  ${chalk.dim(`(${wave.cleansing.wave})`)}`,
    `  Ocean Wisdom:     ${colorScore(wave.oceanWisdom)}  ${chalk.dim(`(${wave.accumulating.ocean})`)}`,
    `  Tide Resilience:  ${colorScore(wave.tideResilience)}  ${chalk.dim(`(${wave.enduring.shore})`)}`,
    '',
    `  Quality Score: ${colorScore(wave.qualityScore)}  ${chalk.dim(`(${wave.condition})`)}`,
  ]
  if (wave.celebration) {
    lines.push('', `  ${chalk.rgb(30, 120, 220)(wave.celebration)}`)
  }
  return lines.join('\n')
}

/** @example formatWavesTable(waves) */
export function formatWavesTable(waves: SapphireWave[]): string {
  if (waves.length === 0) return chalk.dim('No sapphire waves found')
  const colWidths = {
    file: Math.max(4, ...waves.map((w) => w.file.length)),
    depth: Math.max(5, ...waves.map((w) => String(w.gemDepth).length)),
    rhythm: Math.max(6, ...waves.map((w) => String(w.tidalRhythm).length)),
    purity: Math.max(6, ...waves.map((w) => String(w.wavePurity).length)),
    wisdom: Math.max(6, ...waves.map((w) => String(w.oceanWisdom).length)),
    resilience: Math.max(10, ...waves.map((w) => String(w.tideResilience).length)),
    score: Math.max(5, ...waves.map((w) => String(w.qualityScore).length)),
  }
  const lines: string[] = [chalk.bold('Sapphire Waves'), '']
  const header =
    chalk.rgb(30, 120, 220)(padRight('File', colWidths.file)) + '  ' +
    chalk.rgb(30, 120, 220)(padLeft('Depth', colWidths.depth)) + '  ' +
    chalk.rgb(30, 120, 220)(padLeft('Rhythm', colWidths.rhythm)) + '  ' +
    chalk.rgb(30, 120, 220)(padLeft('Purity', colWidths.purity)) + '  ' +
    chalk.rgb(30, 120, 220)(padLeft('Wisdom', colWidths.wisdom)) + '  ' +
    chalk.rgb(30, 120, 220)(padLeft('Resilience', colWidths.resilience)) + '  ' +
    chalk.rgb(30, 120, 220)(padLeft('Score', colWidths.score))
  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))
  for (const w of waves) {
    lines.push(
      padRight(w.file, colWidths.file) + '  ' +
      padLeft(String(w.gemDepth), colWidths.depth) + '  ' +
      padLeft(String(w.tidalRhythm), colWidths.rhythm) + '  ' +
      padLeft(String(w.wavePurity), colWidths.purity) + '  ' +
      padLeft(String(w.oceanWisdom), colWidths.wisdom) + '  ' +
      padLeft(String(w.tideResilience), colWidths.resilience)) + '  ' +
      padLeft(String(w.qualityScore), colWidths.score)
  }
  return lines.join('\n')
}

/** @example formatOceanTable(ocean) */
export function formatOceanTable(ocean: SapphireOcean): string {
  const lines: string[] = [
    chalk.bold(`Sapphire Ocean: ${ocean.directory}`),
    '',
    `  Waves:              ${ocean.waves.length}`,
    `  Avg Depth:          ${colorScore(ocean.avgDepth)}`,
    `  Avg Rhythm:         ${colorScore(ocean.avgRhythm)}`,
    `  Avg Wisdom:         ${colorScore(ocean.avgWisdom)}`,
    `  Masterpieces:       ${ocean.sapphireMasterpieceCount}`,
    `  Ocean Type:         ${ocean.oceanType}`,
    `  Condition:          ${colorOceanCondition(ocean.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatOceansTable(oceans) */
export function formatOceansTable(oceans: SapphireOcean[]): string {
  if (oceans.length === 0) return chalk.dim('No sapphire oceans found')
  const lines: string[] = [chalk.bold('Sapphire Oceans'), '']
  for (const o of oceans) {
    lines.push(`  ${chalk.rgb(30, 120, 220)(o.directory)}  ${colorScore(o.avgDepth)}  ${colorOceanCondition(o.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: SapphireTideResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Sapphire Tide Statistics'),
    '',
    `  Total Files:              ${stats.totalFiles}`,
    `  Total Oceans:             ${stats.totalOceans}`,
    `  Avg Gem Depth:            ${colorScore(stats.avgGemDepth)}`,
    `  Avg Tidal Rhythm:         ${colorScore(stats.avgTidalRhythm)}`,
    `  Avg Wave Purity:          ${colorScore(stats.avgWavePurity)}`,
    `  Avg Ocean Wisdom:         ${colorScore(stats.avgOceanWisdom)}`,
    `  Avg Tide Resilience:      ${colorScore(stats.avgTideResilience)}`,
    `  Sapphire Masterpieces:    ${stats.sapphireMasterpieceCount}`,
    `  Ocean Perfection:         ${stats.oceanPerfectionCount}`,
    `  Proper Tides:             ${stats.properTideCount}`,
    `  Murky Currents:           ${stats.murkyCurrentCount}`,
    `  Stagnant Pools:           ${stats.stagnantPoolCount}`,
    `  Void:                     ${stats.voidCount}`,
    `  Overall Depth:            ${colorScore(stats.overallDepth)}`,
    `  Captain Grade:            ${stats.captainGrade}`,
    `  Best Wave:                ${stats.bestWave || 'N/A'}`,
    `  Deepest:                  ${stats.deepest || 'N/A'}`,
    `  Most Rhythmic:            ${stats.mostRhythmic || 'N/A'}`,
    `  Purest:                   ${stats.purest || 'N/A'}`,
    `  Wisest:                   ${stats.wisest || 'N/A'}`,
    `  Most Resilient:           ${stats.mostResilient || 'N/A'}`,
  ]
  if (stats.celebration) {
    lines.push('', `  ${chalk.rgb(30, 120, 220)(stats.celebration)}`)
  }
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(30, 120, 220)('\u2022')} ${rec}`)
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
    formatOceansTable(result.oceans),
    '',
    chalk.bold('Oceanic Overview'),
    '',
    `  Avg Depth:      ${colorScore(result.sea.avgDepth)}`,
    `  Avg Rhythm:     ${colorScore(result.sea.avgRhythm)}`,
    `  Avg Wisdom:     ${colorScore(result.sea.avgWisdom)}`,
    `  Overall Depth:  ${colorScore(result.sea.overallDepth)}`,
    `  Is Sapphire:    ${result.sea.isSapphire ? chalk.rgb(30, 120, 220)('yes') : chalk.gray('no')}`,
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
