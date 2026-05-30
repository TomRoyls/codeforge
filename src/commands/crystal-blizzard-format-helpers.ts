import chalk from 'chalk'

import type { ShardCondition, StormCondition, CrystalShard, CrystalStorm, CrystalBlizzardResult } from './crystal-blizzard-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(135, 206, 235)(String(score))
  if (score >= 75) return chalk.rgb(100, 180, 220)(String(score))
  if (score >= 60) return chalk.rgb(80, 155, 200)(String(score))
  if (score >= 40) return chalk.rgb(60, 130, 180)(String(score))
  if (score >= 20) return chalk.rgb(100, 120, 160)(String(score))
  return chalk.gray(String(score))
}

/** @example colorCondition('crystal-masterpiece') */
export function colorCondition(condition: ShardCondition | string): string {
  switch (condition) {
    case 'crystal-masterpiece':
      return chalk.rgb(135, 206, 235)('crystal-masterpiece')
    case 'frozen-perfection':
      return chalk.rgb(100, 180, 220)('frozen-perfection')
    case 'proper-ice':
      return chalk.rgb(80, 155, 200)('proper-ice')
    case 'slush-pile':
      return chalk.rgb(60, 130, 180)('slush-pile')
    case 'puddle':
      return chalk.rgb(100, 120, 160)('puddle')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorStormCondition('ice-palace') */
export function colorStormCondition(condition: StormCondition | string): string {
  switch (condition) {
    case 'ice-palace':
      return chalk.rgb(135, 206, 235)('ice-palace')
    case 'frozen-cathedral':
      return chalk.rgb(100, 180, 220)('frozen-cathedral')
    case 'proper-glacier':
      return chalk.rgb(80, 155, 200)('proper-glacier')
    case 'melting-snowman':
      return chalk.rgb(60, 130, 180)('melting-snowman')
    case 'dry-ground':
      return chalk.rgb(100, 120, 160)('dry-ground')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatShardTable(shard) */
export function formatShardTable(shard: CrystalShard): string {
  const lines: string[] = [
    chalk.bold(`Crystal Shard: ${shard.file}`),
    '',
    `  Crystalline Precision: ${colorScore(shard.crystallinePrecision)}  ${chalk.dim(`(${shard.crystallizing.crystal})`)}`,
    `  Storm Resilience:     ${colorScore(shard.stormResilience)}  ${chalk.dim(`(${shard.weathering.storm})`)}`,
    `  Shard Clarity:        ${colorScore(shard.shardClarity)}  ${chalk.dim(`(${shard.refracting.refraction})`)}`,
    `  Frozen Beauty:        ${colorScore(shard.frozenBeauty)}  ${chalk.dim(`(${shard.sculpting.sculpture})`)}`,
    `  Ice Wisdom:           ${colorScore(shard.iceWisdom)}  ${chalk.dim(`(${shard.freezing.temperature})`)}`,
    '',
    `  Quality Score: ${colorScore(shard.qualityScore)}  ${chalk.dim(`(${colorCondition(shard.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatShardsTable(shards) */
export function formatShardsTable(shards: CrystalShard[]): string {
  if (shards.length === 0) return chalk.dim('No crystal shards found')

  const colWidths = {
    file: Math.max(4, ...shards.map((s) => s.file.length)),
    prec: Math.max(4, ...shards.map((s) => String(s.crystallinePrecision).length)),
    resi: Math.max(4, ...shards.map((s) => String(s.stormResilience).length)),
    clar: Math.max(4, ...shards.map((s) => String(s.shardClarity).length)),
    beau: Math.max(4, ...shards.map((s) => String(s.frozenBeauty).length)),
    wisd: Math.max(4, ...shards.map((s) => String(s.iceWisdom).length)),
    score: Math.max(5, ...shards.map((s) => String(s.qualityScore).length)),
  }

  const lines: string[] = [chalk.bold('Crystal Shards'), '']

  const header =
    chalk.rgb(135, 206, 235)(padRight('File', colWidths.file)) +
    '  ' +
    chalk.rgb(135, 206, 235)(padLeft('Prec', colWidths.prec)) +
    '  ' +
    chalk.rgb(135, 206, 235)(padLeft('Resi', colWidths.resi)) +
    '  ' +
    chalk.rgb(135, 206, 235)(padLeft('Clar', colWidths.clar)) +
    '  ' +
    chalk.rgb(135, 206, 235)(padLeft('Beau', colWidths.beau)) +
    '  ' +
    chalk.rgb(135, 206, 235)(padLeft('Wisd', colWidths.wisd)) +
    '  ' +
    chalk.rgb(135, 206, 235)(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const s of shards) {
    lines.push(
      padRight(s.file, colWidths.file) +
        '  ' +
        padLeft(String(s.crystallinePrecision), colWidths.prec) +
        '  ' +
        padLeft(String(s.stormResilience), colWidths.resi) +
        '  ' +
        padLeft(String(s.shardClarity), colWidths.clar) +
        '  ' +
        padLeft(String(s.frozenBeauty), colWidths.beau) +
        '  ' +
        padLeft(String(s.iceWisdom), colWidths.wisd) +
        '  ' +
        padLeft(String(s.qualityScore), colWidths.score),
    )
  }

  return lines.join('\n')
}

/** @example formatStormTable(storm) */
export function formatStormTable(storm: CrystalStorm): string {
  const lines: string[] = [
    chalk.bold(`Crystal Storm: ${storm.directory}`),
    '',
    `  Shards:        ${storm.shards.length}`,
    `  Avg Precision: ${colorScore(storm.avgPrecision)}`,
    `  Avg Resilience:${colorScore(storm.avgResilience)}`,
    `  Avg Wisdom:    ${colorScore(storm.avgWisdom)}`,
    `  Masterpieces:  ${storm.crystalMasterpieceCount}`,
    `  Storm Type:    ${storm.stormType}`,
    `  Condition:     ${colorStormCondition(storm.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatStormsTable(storms) */
export function formatStormsTable(storms: CrystalStorm[]): string {
  if (storms.length === 0) return chalk.dim('No crystal storms found')

  const lines: string[] = [chalk.bold('Crystal Storms'), '']

  for (const st of storms) {
    lines.push(
      `  ${chalk.rgb(135, 206, 235)(st.directory)}  ${colorScore(st.avgPrecision)}  ${colorStormCondition(st.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: CrystalBlizzardResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Crystal Blizzard Statistics'),
    '',
    `  Total Files:           ${stats.totalFiles}`,
    `  Total Storms:          ${stats.totalStorms}`,
    `  Avg Crystalline Prec:  ${colorScore(stats.avgCrystallinePrecision)}`,
    `  Avg Storm Resilience:  ${colorScore(stats.avgStormResilience)}`,
    `  Avg Shard Clarity:     ${colorScore(stats.avgShardClarity)}`,
    `  Avg Frozen Beauty:     ${colorScore(stats.avgFrozenBeauty)}`,
    `  Avg Ice Wisdom:        ${colorScore(stats.avgIceWisdom)}`,
    `  Crystal Masterpieces:  ${stats.crystalMasterpieceCount}`,
    `  Frozen Perfections:    ${stats.frozenPerfectionCount}`,
    `  Proper Ice:            ${stats.properIceCount}`,
    `  Slush Piles:           ${stats.slushPileCount}`,
    `  Puddles:               ${stats.puddleCount}`,
    `  Void:                  ${stats.voidCount}`,
    `  Overall Frostiness:    ${colorScore(stats.overallFrostiness)}`,
    `  Frost Mage Grade:      ${stats.frostMageGrade}`,
    `  Best Shard:            ${stats.bestShard || 'N/A'}`,
    `  Most Precise:          ${stats.mostPrecise || 'N/A'}`,
    `  Most Resilient:        ${stats.mostResilient || 'N/A'}`,
    `  Clearest:              ${stats.clearest || 'N/A'}`,
    `  Most Beautiful:        ${stats.mostBeautiful || 'N/A'}`,
    `  Wisest:                ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(135, 206, 235)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: CrystalBlizzardResult): string {
  const lines: string[] = [
    chalk.bold('Crystal Blizzard Analysis'),
    '',
    formatShardsTable(result.shards),
    '',
    formatStormsTable(result.storms),
    '',
    chalk.bold('Winter Overview'),
    '',
    `  Avg Precision:  ${colorScore(result.winter.avgPrecision)}`,
    `  Avg Resilience: ${colorScore(result.winter.avgResilience)}`,
    `  Avg Wisdom:     ${colorScore(result.winter.avgWisdom)}`,
    `  Frostiness:     ${colorScore(result.winter.overallFrostiness)}`,
    `  Is Crystalline: ${result.winter.isCrystalline ? chalk.rgb(135, 206, 235)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: CrystalBlizzardResult): string {
  return JSON.stringify(result, null, 2)
}
