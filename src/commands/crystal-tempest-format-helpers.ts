import chalk from 'chalk'

import type { CrystalField, CrystalCondition, CrystalShard, CrystalStats, CrystalTempestResult } from './crystal-tempest-helpers.js'

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

/** @example colorCondition('crystal-masterpiece') */
export function colorCondition(condition: CrystalCondition | string): string {
  switch (condition) {
    case 'crystal-masterpiece':
      return chalk.cyan('crystal-masterpiece')
    case 'frozen-perfection':
      return chalk.blue('frozen-perfection')
    case 'proper-ice':
      return chalk.green('proper-ice')
    case 'slush-puddle':
      return chalk.yellow('slush-puddle')
    case 'dry-ground':
      return chalk.rgb(255, 165, 0)('dry-ground')
    case 'void':
      return chalk.red('void')
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

/** @example formatShardTable(shard) */
export function formatShardTable(shard: CrystalShard): string {
  const lines: string[] = [
    chalk.bold(`\u0001\uF4CA Crystal Shard: ${shard.file}`),
    '',
    `  Crystalline Precision: ${colorScore(shard.crystallinePrecision)}  ${chalk.dim(`(${shard.forming.crystal})`)}`,
    `  Storm Resilience:      ${colorScore(shard.stormResilience)}  ${chalk.dim(`(${shard.weathering.storm})`)}`,
    `  Shard Clarity:         ${colorScore(shard.shardClarity)}  ${chalk.dim(`(${shard.refracting.shard})`)}`,
    `  Frozen Beauty:         ${colorScore(shard.frozenBeauty)}  ${chalk.dim(`(${shard.sculpting.sculpture})`)}`,
    `  Ice Wisdom:            ${colorScore(shard.iceWisdom)}  ${chalk.dim(`(${shard.remembering.glacier})`)}`,
    '',
    `  Quality Score: ${colorScore(shard.qualityScore)}  ${chalk.dim(`(${colorCondition(shard.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatShardsTable(shards) */
export function formatShardsTable(shards: CrystalShard[]): string {
  if (shards.length === 0) return chalk.dim('No crystal shards found')

  const colWidths = {
    beauty: Math.max(6, ...shards.map((s) => String(s.frozenBeauty).length)),
    clarity: Math.max(6, ...shards.map((s) => String(s.shardClarity).length)),
    file: Math.max(4, ...shards.map((s) => s.file.length)),
    precision: Math.max(9, ...shards.map((s) => String(s.crystallinePrecision).length)),
    resilience: Math.max(10, ...shards.map((s) => String(s.stormResilience).length)),
    score: Math.max(5, ...shards.map((s) => String(s.qualityScore).length)),
    wisdom: Math.max(6, ...shards.map((s) => String(s.iceWisdom).length)),
  }

  const lines: string[] = [chalk.bold('Crystal Shards'), '']

  const header =
    chalk.cyan(padRight('File', colWidths.file)) +
    '  ' +
    chalk.cyan(padLeft('Precision', colWidths.precision)) +
    '  ' +
    chalk.cyan(padLeft('Resilience', colWidths.resilience)) +
    '  ' +
    chalk.cyan(padLeft('Clarity', colWidths.clarity)) +
    '  ' +
    chalk.cyan(padLeft('Beauty', colWidths.beauty)) +
    '  ' +
    chalk.cyan(padLeft('Wisdom', colWidths.wisdom)) +
    '  ' +
    chalk.cyan(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const s of shards) {
    lines.push(
      padRight(s.file, colWidths.file) +
        '  ' +
        padLeft(String(s.crystallinePrecision), colWidths.precision) +
        '  ' +
        padLeft(String(s.stormResilience), colWidths.resilience) +
        '  ' +
        padLeft(String(s.shardClarity), colWidths.clarity) +
        '  ' +
        padLeft(String(s.frozenBeauty), colWidths.beauty) +
        '  ' +
        padLeft(String(s.iceWisdom), colWidths.wisdom) +
        '  ' +
        padLeft(String(s.qualityScore), colWidths.score),
    )
  }

  return lines.join('\n')
}

/** @example formatFieldTable(field) */
export function formatFieldTable(field: CrystalField): string {
  const lines: string[] = [
    chalk.bold(`Crystal Field: ${field.directory}`),
    '',
    `  Shards: ${field.shards.length}`,
    `  Avg Precision:  ${colorScore(field.avgPrecision)}`,
    `  Avg Resilience: ${colorScore(field.avgResilience)}`,
    `  Avg Wisdom:     ${colorScore(field.avgWisdom)}`,
    `  Masterpieces:   ${field.crystalMasterpieceCount}`,
    `  Field Type:     ${field.fieldType}`,
    `  Condition:      ${colorCondition(field.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatFieldsTable(fields) */
export function formatFieldsTable(fields: CrystalField[]): string {
  if (fields.length === 0) return chalk.dim('No crystal fields found')

  const lines: string[] = [chalk.bold('Crystal Fields'), '']

  for (const f of fields) {
    lines.push(
      `  ${chalk.cyan(f.directory)}  ${colorScore(f.avgPrecision)}  ${colorCondition(f.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: CrystalStats): string {
  const lines: string[] = [
    chalk.bold('Crystal Tempest Statistics'),
    '',
    `  Total Files:           ${stats.totalFiles}`,
    `  Total Fields:          ${stats.totalFields}`,
    `  Avg Precision:         ${colorScore(stats.avgCrystallinePrecision)}`,
    `  Avg Resilience:        ${colorScore(stats.avgStormResilience)}`,
    `  Avg Clarity:           ${colorScore(stats.avgShardClarity)}`,
    `  Avg Beauty:            ${colorScore(stats.avgFrozenBeauty)}`,
    `  Avg Wisdom:            ${colorScore(stats.avgIceWisdom)}`,
    `  Crystal Masterpieces:  ${stats.crystalMasterpieceCount}`,
    `  Frozen Perfections:    ${stats.frozenPerfectionCount}`,
    `  Proper Ice:            ${stats.properIceCount}`,
    `  Slush Puddles:         ${stats.slushPuddleCount}`,
    `  Dry Ground:            ${stats.dryGroundCount}`,
    `  Void:                  ${stats.voidCount}`,
    `  Overall Frost:         ${colorScore(stats.overallFrost)}`,
    `  Frost Grade:           ${stats.frostGrade}`,
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
    lines.push(`  ${chalk.cyan('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: CrystalTempestResult): string {
  const lines: string[] = [
    chalk.bold('\u0001\uF328 Crystal Tempest Analysis'),
    '',
    formatShardsTable(result.shards),
    '',
    formatFieldsTable(result.fields),
    '',
    chalk.bold('Blizzard Overview'),
    '',
    `  Avg Precision:  ${colorScore(result.blizzard.avgPrecision)}`,
    `  Avg Resilience: ${colorScore(result.blizzard.avgResilience)}`,
    `  Avg Wisdom:     ${colorScore(result.blizzard.avgWisdom)}`,
    `  Overall Frost:  ${colorScore(result.blizzard.overallFrost)}`,
    `  Is Crystal:     ${result.blizzard.isCrystal ? chalk.green('yes') : chalk.red('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: CrystalTempestResult): string {
  return JSON.stringify(result, null, 2)
}
