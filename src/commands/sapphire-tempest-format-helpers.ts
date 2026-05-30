import chalk from 'chalk'

import type { BoltCondition, CloudCondition, SapphireBolt, SapphireCloud, SapphireStormStats, SapphireStormResult } from './sapphire-tempest-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(100, 149, 237)(String(score))
  if (score >= 75) return chalk.rgb(65, 105, 225)(String(score))
  if (score >= 60) return chalk.rgb(70, 130, 180)(String(score))
  if (score >= 40) return chalk.rgb(50, 100, 160)(String(score))
  if (score >= 20) return chalk.rgb(40, 80, 140)(String(score))
  return chalk.gray(String(score))
}

/** @example colorCondition('storm-masterpiece') */
export function colorCondition(condition: BoltCondition | string): string {
  switch (condition) {
    case 'storm-masterpiece':
      return chalk.rgb(100, 149, 237)('storm-masterpiece')
    case 'blue-tempest':
      return chalk.rgb(65, 105, 225)('blue-tempest')
    case 'proper-storm':
      return chalk.rgb(70, 130, 180)('proper-storm')
    case 'gray-cloud':
      return chalk.rgb(50, 100, 160)('gray-cloud')
    case 'clear-sky':
      return chalk.rgb(40, 80, 140)('clear-sky')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorCloudCondition('tempest-front') */
export function colorCloudCondition(condition: CloudCondition | string): string {
  switch (condition) {
    case 'tempest-front':
      return chalk.rgb(100, 149, 237)('tempest-front')
    case 'storm-cloud':
      return chalk.rgb(65, 105, 225)('storm-cloud')
    case 'proper-overcast':
      return chalk.rgb(70, 130, 180)('proper-overcast')
    case 'light-clouds':
      return chalk.rgb(50, 100, 160)('light-clouds')
    case 'clear-sky':
      return chalk.rgb(40, 80, 140)('clear-sky')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatBoltTable(bolt) */
export function formatBoltTable(bolt: SapphireBolt): string {
  const lines: string[] = [
    chalk.bold(`Sapphire Bolt: ${bolt.file}`),
    '',
    `  Gem Fury:           ${colorScore(bolt.gemFury)}  ${chalk.dim(`(${bolt.charging.storm})`)}`,
    `  Strike Precision:   ${colorScore(bolt.strikePrecision)}  ${chalk.dim(`(${bolt.striking.lightning})`)}`,
    `  Lightning Clarity:  ${colorScore(bolt.lightningClarity)}  ${chalk.dim(`(${bolt.illuminating.flash})`)}`,
    `  Thunder Resilience: ${colorScore(bolt.thunderResilience)}  ${chalk.dim(`(${bolt.echoing.thunder})`)}`,
    `  Rain Wisdom:        ${colorScore(bolt.rainWisdom)}  ${chalk.dim(`(${bolt.nourishing.rain})`)}`,
    '',
    `  Quality Score: ${colorScore(bolt.qualityScore)}  ${chalk.dim(`(${colorCondition(bolt.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatBoltsTable(bolts) */
export function formatBoltsTable(bolts: SapphireBolt[]): string {
  if (bolts.length === 0) return chalk.dim('No sapphire bolts found')

  const colWidths = {
    file: Math.max(4, ...bolts.map((b) => b.file.length)),
    fury: Math.max(4, ...bolts.map((b) => String(b.gemFury).length)),
    prec: Math.max(4, ...bolts.map((b) => String(b.strikePrecision).length)),
    clar: Math.max(5, ...bolts.map((b) => String(b.lightningClarity).length)),
    res: Math.max(4, ...bolts.map((b) => String(b.thunderResilience).length)),
    wis: Math.max(4, ...bolts.map((b) => String(b.rainWisdom).length)),
    score: Math.max(5, ...bolts.map((b) => String(b.qualityScore).length)),
  }

  const lines: string[] = [chalk.bold('Sapphire Bolts'), '']

  const header =
    chalk.rgb(100, 149, 237)(padRight('File', colWidths.file)) +
    '  ' +
    chalk.rgb(100, 149, 237)(padLeft('Fury', colWidths.fury)) +
    '  ' +
    chalk.rgb(100, 149, 237)(padLeft('Prec', colWidths.prec)) +
    '  ' +
    chalk.rgb(100, 149, 237)(padLeft('Clar', colWidths.clar)) +
    '  ' +
    chalk.rgb(100, 149, 237)(padLeft('Res', colWidths.res)) +
    '  ' +
    chalk.rgb(100, 149, 237)(padLeft('Wis', colWidths.wis)) +
    '  ' +
    chalk.rgb(100, 149, 237)(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const b of bolts) {
    lines.push(
      padRight(b.file, colWidths.file) +
        '  ' +
        padLeft(String(b.gemFury), colWidths.fury) +
        '  ' +
        padLeft(String(b.strikePrecision), colWidths.prec) +
        '  ' +
        padLeft(String(b.lightningClarity), colWidths.clar) +
        '  ' +
        padLeft(String(b.thunderResilience), colWidths.res) +
        '  ' +
        padLeft(String(b.rainWisdom), colWidths.wis) +
        '  ' +
        padLeft(String(b.qualityScore), colWidths.score),
    )
  }

  return lines.join('\n')
}

/** @example formatCloudTable(cloud) */
export function formatCloudTable(cloud: SapphireCloud): string {
  const lines: string[] = [
    chalk.bold(`Sapphire Cloud: ${cloud.directory}`),
    '',
    `  Bolts:              ${cloud.bolts.length}`,
    `  Avg Precision:      ${colorScore(cloud.avgPrecision)}`,
    `  Avg Clarity:        ${colorScore(cloud.avgClarity)}`,
    `  Avg Wisdom:         ${colorScore(cloud.avgWisdom)}`,
    `  Masterpieces:       ${cloud.stormMasterpieceCount}`,
    `  Cloud Type:         ${cloud.cloudType}`,
    `  Condition:          ${colorCloudCondition(cloud.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatCloudsTable(clouds) */
export function formatCloudsTable(clouds: SapphireCloud[]): string {
  if (clouds.length === 0) return chalk.dim('No sapphire clouds found')

  const lines: string[] = [chalk.bold('Sapphire Clouds'), '']

  for (const c of clouds) {
    lines.push(
      `  ${chalk.rgb(100, 149, 237)(c.directory)}  ${colorScore(c.avgPrecision)}  ${colorCloudCondition(c.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: SapphireStormStats): string {
  const lines: string[] = [
    chalk.bold('Sapphire Storm Statistics'),
    '',
    `  Total Files:           ${stats.totalFiles}`,
    `  Total Clouds:          ${stats.totalClouds}`,
    `  Avg Gem Fury:          ${colorScore(stats.avgGemFury)}`,
    `  Avg Strike Precision:  ${colorScore(stats.avgStrikePrecision)}`,
    `  Avg Lightning Clarity: ${colorScore(stats.avgLightningClarity)}`,
    `  Avg Thunder Resilience:${colorScore(stats.avgThunderResilience)}`,
    `  Avg Rain Wisdom:      ${colorScore(stats.avgRainWisdom)}`,
    `  Storm Masterpieces:    ${stats.stormMasterpieceCount}`,
    `  Blue Tempest:          ${stats.blueTempestCount}`,
    `  Proper Storm:          ${stats.properStormCount}`,
    `  Gray Cloud:            ${stats.grayCloudCount}`,
    `  Clear Sky:             ${stats.clearSkyCount}`,
    `  Void:                  ${stats.voidCount}`,
    `  Overall Fury:          ${colorScore(stats.overallFury)}`,
    `  Storm Grade:           ${stats.stormGrade}`,
    `  Best Bolt:             ${stats.bestBolt || 'N/A'}`,
    `  Most Furious:          ${stats.mostFurious || 'N/A'}`,
    `  Most Precise:          ${stats.mostPrecise || 'N/A'}`,
    `  Clearest:              ${stats.clearest || 'N/A'}`,
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
    lines.push(`  ${chalk.rgb(100, 149, 237)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: SapphireStormResult): string {
  const lines: string[] = [
    chalk.bold('Sapphire Storm Analysis'),
    '',
    formatBoltsTable(result.bolts),
    '',
    formatCloudsTable(result.clouds),
    '',
    chalk.bold('Weather Overview'),
    '',
    `  Avg Precision:    ${colorScore(result.weather.avgPrecision)}`,
    `  Avg Clarity:      ${colorScore(result.weather.avgClarity)}`,
    `  Avg Wisdom:       ${colorScore(result.weather.avgWisdom)}`,
    `  Overall Fury:     ${colorScore(result.weather.overallFury)}`,
    `  Is Sapphire:      ${result.weather.isSapphire ? chalk.rgb(100, 149, 237)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: SapphireStormResult): string {
  return JSON.stringify(result, null, 2)
}
