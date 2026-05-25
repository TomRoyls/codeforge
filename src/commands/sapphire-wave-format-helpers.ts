import chalk from 'chalk'

import type { WaveCondition, OceanCondition, SapphireWave, SapphireOcean, SapphireWaveResult } from './sapphire-wave-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(30, 80, 220)(String(score))
  if (score >= 75) return chalk.rgb(40, 100, 200)(String(score))
  if (score >= 60) return chalk.rgb(50, 120, 180)(String(score))
  if (score >= 40) return chalk.rgb(80, 140, 160)(String(score))
  if (score >= 20) return chalk.rgb(100, 130, 140)(String(score))
  return chalk.gray(String(score))
}

/** @example colorCondition('sapphire-masterpiece') */
export function colorCondition(condition: WaveCondition | string): string {
  switch (condition) {
    case 'sapphire-masterpiece':
      return chalk.rgb(30, 80, 220)('sapphire-masterpiece')
    case 'royal-blue':
      return chalk.rgb(40, 100, 200)('royal-blue')
    case 'proper-gem':
      return chalk.rgb(50, 120, 180)('proper-gem')
    case 'cloudy-stone':
      return chalk.rgb(80, 140, 160)('cloudy-stone')
    case 'plain-rock':
      return chalk.rgb(100, 130, 140)('plain-rock')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorOceanCondition('sapphire-palace') */
export function colorOceanCondition(condition: OceanCondition | string): string {
  switch (condition) {
    case 'sapphire-palace':
      return chalk.rgb(30, 80, 220)('sapphire-palace')
    case 'coral-castle':
      return chalk.rgb(40, 100, 200)('coral-castle')
    case 'proper-harbor':
      return chalk.rgb(50, 120, 180)('proper-harbor')
    case 'rocky-shore':
      return chalk.rgb(80, 140, 160)('rocky-shore')
    case 'dry-dock':
      return chalk.rgb(100, 130, 140)('dry-dock')
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

/** @example formatWaveTable(wave) */
export function formatWaveTable(wave: SapphireWave): string {
  const lines: string[] = [
    chalk.bold(`Sapphire Wave: ${wave.file}`),
    '',
    `  Gem Fury:            ${colorScore(wave.gemFury)}  ${chalk.dim(`(${wave.surging.intensity})`)}`,
    `  Strike Precision:    ${colorScore(wave.strikePrecision)}  ${chalk.dim(`(${wave.crashing.strike})`)}`,
    `  Lightning Clarity:   ${colorScore(wave.lightningClarity)}  ${chalk.dim(`(${wave.clarifying.vision})`)}`,
    `  Thunder Resilience:  ${colorScore(wave.thunderResilience)}  ${chalk.dim(`(${wave.thundering.armor})`)}`,
    `  Rain Wisdom:         ${colorScore(wave.rainWisdom)}  ${chalk.dim(`(${wave.nourishing.rainfall})`)}`,
    '',
    `  Quality Score: ${colorScore(wave.qualityScore)}  ${chalk.dim(`(${colorCondition(wave.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatWavesTable(waves) */
export function formatWavesTable(waves: SapphireWave[]): string {
  if (waves.length === 0) return chalk.dim('No sapphire waves found')

  const colWidths = {
    file: Math.max(4, ...waves.map((w) => w.file.length)),
    fury: Math.max(4, ...waves.map((w) => String(w.gemFury).length)),
    prec: Math.max(4, ...waves.map((w) => String(w.strikePrecision).length)),
    clar: Math.max(4, ...waves.map((w) => String(w.lightningClarity).length)),
    res: Math.max(4, ...waves.map((w) => String(w.thunderResilience).length)),
    wis: Math.max(4, ...waves.map((w) => String(w.rainWisdom).length)),
    score: Math.max(5, ...waves.map((w) => String(w.qualityScore).length)),
  }

  const lines: string[] = [chalk.bold('Sapphire Waves'), '']

  const header =
    chalk.rgb(30, 80, 220)(padRight('File', colWidths.file)) +
    '  ' +
    chalk.rgb(30, 80, 220)(padLeft('Fury', colWidths.fury)) +
    '  ' +
    chalk.rgb(30, 80, 220)(padLeft('Prec', colWidths.prec)) +
    '  ' +
    chalk.rgb(30, 80, 220)(padLeft('Clar', colWidths.clar)) +
    '  ' +
    chalk.rgb(30, 80, 220)(padLeft('Resi', colWidths.res)) +
    '  ' +
    chalk.rgb(30, 80, 220)(padLeft('Wis', colWidths.wis)) +
    '  ' +
    chalk.rgb(30, 80, 220)(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const w of waves) {
    lines.push(
      padRight(w.file, colWidths.file) +
        '  ' +
        padLeft(String(w.gemFury), colWidths.fury) +
        '  ' +
        padLeft(String(w.strikePrecision), colWidths.prec) +
        '  ' +
        padLeft(String(w.lightningClarity), colWidths.clar) +
        '  ' +
        padLeft(String(w.thunderResilience), colWidths.res) +
        '  ' +
        padLeft(String(w.rainWisdom), colWidths.wis) +
        '  ' +
        padLeft(String(w.qualityScore), colWidths.score),
    )
  }

  return lines.join('\n')
}

/** @example formatOceanTable(ocean) */
export function formatOceanTable(ocean: SapphireOcean): string {
  const lines: string[] = [
    chalk.bold(`Sapphire Ocean: ${ocean.directory}`),
    '',
    `  Waves:               ${ocean.waves.length}`,
    `  Avg Fury:            ${colorScore(ocean.avgFury)}`,
    `  Avg Precision:       ${colorScore(ocean.avgPrecision)}`,
    `  Avg Wisdom:          ${colorScore(ocean.avgWisdom)}`,
    `  Masterpieces:        ${ocean.sapphireMasterpieceCount}`,
    `  Ocean Type:          ${ocean.oceanType}`,
    `  Condition:           ${colorOceanCondition(ocean.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatOceansTable(oceans) */
export function formatOceansTable(oceans: SapphireOcean[]): string {
  if (oceans.length === 0) return chalk.dim('No sapphire oceans found')

  const lines: string[] = [chalk.bold('Sapphire Oceans'), '']

  for (const o of oceans) {
    lines.push(
      `  ${chalk.rgb(30, 80, 220)(o.directory)}  ${colorScore(o.avgFury)}  ${colorOceanCondition(o.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: SapphireWaveResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Sapphire Wave Statistics'),
    '',
    `  Total Files:            ${stats.totalFiles}`,
    `  Total Oceans:           ${stats.totalOceans}`,
    `  Avg Gem Fury:           ${colorScore(stats.avgGemFury)}`,
    `  Avg Strike Precision:   ${colorScore(stats.avgStrikePrecision)}`,
    `  Avg Lightning Clarity:  ${colorScore(stats.avgLightningClarity)}`,
    `  Avg Thunder Resilience: ${colorScore(stats.avgThunderResilience)}`,
    `  Avg Rain Wisdom:        ${colorScore(stats.avgRainWisdom)}`,
    `  Sapphire Masterpieces:  ${stats.sapphireMasterpieceCount}`,
    `  Royal Blue:             ${stats.royalBlueCount}`,
    `  Proper Gem:             ${stats.properGemCount}`,
    `  Cloudy Stone:           ${stats.cloudyStoneCount}`,
    `  Plain Rock:             ${stats.plainRockCount}`,
    `  Void:                   ${stats.voidCount}`,
    `  Overall Depth:          ${colorScore(stats.overallDepth)}`,
    `  Captain Grade:          ${stats.captainGrade}`,
    `  Best Wave:              ${stats.bestWave || 'N/A'}`,
    `  Most Intense:           ${stats.mostIntense || 'N/A'}`,
    `  Most Precise:           ${stats.mostPrecise || 'N/A'}`,
    `  Clearest:               ${stats.clearest || 'N/A'}`,
    `  Most Resilient:         ${stats.mostResilient || 'N/A'}`,
    `  Wisest:                 ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(30, 80, 220)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: SapphireWaveResult): string {
  const lines: string[] = [
    chalk.bold('Sapphire Wave Analysis'),
    '',
    formatWavesTable(result.waves),
    '',
    formatOceansTable(result.oceans),
    '',
    chalk.bold('Sea Overview'),
    '',
    `  Avg Fury:       ${colorScore(result.sea.avgFury)}`,
    `  Avg Precision:  ${colorScore(result.sea.avgPrecision)}`,
    `  Avg Wisdom:     ${colorScore(result.sea.avgWisdom)}`,
    `  Depth:          ${colorScore(result.sea.overallDepth)}`,
    `  Is Sapphire:    ${result.sea.isSapphire ? chalk.rgb(30, 80, 220)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: SapphireWaveResult): string {
  return JSON.stringify(result, null, 2)
}
