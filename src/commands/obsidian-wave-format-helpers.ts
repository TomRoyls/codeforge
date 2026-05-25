import chalk from 'chalk'

import type { ShardCondition, ReefCondition, ObsidianShard, ObsidianReef, ObsidianTideResult } from './obsidian-wave-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(50, 50, 70)(String(score))
  if (score >= 75) return chalk.rgb(70, 70, 100)(String(score))
  if (score >= 60) return chalk.rgb(90, 90, 130)(String(score))
  if (score >= 40) return chalk.rgb(80, 80, 100)(String(score))
  if (score >= 20) return chalk.rgb(100, 100, 120)(String(score))
  return chalk.gray(String(score))
}

/** @example colorCondition('obsidian-masterpiece') */
export function colorCondition(condition: ShardCondition | string): string {
  switch (condition) {
    case 'obsidian-masterpiece':
      return chalk.rgb(50, 50, 70)('obsidian-masterpiece')
    case 'volcanic-perfection':
      return chalk.rgb(70, 70, 100)('volcanic-perfection')
    case 'proper-blade':
      return chalk.rgb(90, 90, 130)('proper-blade')
    case 'dull-glass':
      return chalk.rgb(80, 80, 100)('dull-glass')
    case 'warm-stone':
      return chalk.rgb(100, 100, 120)('warm-stone')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorReefCondition('obsidian-cathedral') */
export function colorReefCondition(condition: ReefCondition | string): string {
  switch (condition) {
    case 'obsidian-cathedral':
      return chalk.rgb(50, 50, 70)('obsidian-cathedral')
    case 'dark-palace':
      return chalk.rgb(70, 70, 100)('dark-palace')
    case 'proper-cave':
      return chalk.rgb(90, 90, 130)('proper-cave')
    case 'shallow-pool':
      return chalk.rgb(80, 80, 100)('shallow-pool')
    case 'dry-land':
      return chalk.rgb(100, 100, 120)('dry-land')
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

/** @example formatShardTable(shard) */
export function formatShardTable(shard: ObsidianShard): string {
  const lines: string[] = [
    chalk.bold(`Obsidian Shard: ${shard.file}`),
    '',
    `  Volcanic Glass:     ${colorScore(shard.volcanicGlass)}  ${chalk.dim(`(${shard.forming.formation})`)}`,
    `  Clarity Depth:      ${colorScore(shard.clarityDepth)}  ${chalk.dim(`(${shard.revealing.clarity})`)}`,
    `  Dark Resilience:    ${colorScore(shard.darkResilience)}  ${chalk.dim(`(${shard.enduring.darkness})`)}`,
    `  Mirror Precision:   ${colorScore(shard.mirrorPrecision)}  ${chalk.dim(`(${shard.reflecting.mirror})`)}`,
    `  Abyss Wisdom:       ${colorScore(shard.abyssWisdom)}  ${chalk.dim(`(${shard.channeling.abyss})`)}`,
    '',
    `  Quality Score: ${colorScore(shard.qualityScore)}  ${chalk.dim(`(${colorCondition(shard.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatShardsTable(shards) */
export function formatShardsTable(shards: ObsidianShard[]): string {
  if (shards.length === 0) return chalk.dim('No obsidian shards found')

  const colWidths = {
    file: Math.max(4, ...shards.map((s) => s.file.length)),
    gls: Math.max(3, ...shards.map((s) => String(s.volcanicGlass).length)),
    depth: Math.max(3, ...shards.map((s) => String(s.clarityDepth).length)),
    res: Math.max(3, ...shards.map((s) => String(s.darkResilience).length)),
    prec: Math.max(3, ...shards.map((s) => String(s.mirrorPrecision).length)),
    wis: Math.max(3, ...shards.map((s) => String(s.abyssWisdom).length)),
    score: Math.max(5, ...shards.map((s) => String(s.qualityScore).length)),
  }

  const lines: string[] = [chalk.bold('Obsidian Shards'), '']

  const header =
    chalk.rgb(90, 90, 130)(padRight('File', colWidths.file)) +
    '  ' +
    chalk.rgb(90, 90, 130)(padLeft('Gls', colWidths.gls)) +
    '  ' +
    chalk.rgb(90, 90, 130)(padLeft('Dpt', colWidths.depth)) +
    '  ' +
    chalk.rgb(90, 90, 130)(padLeft('Res', colWidths.res)) +
    '  ' +
    chalk.rgb(90, 90, 130)(padLeft('Prc', colWidths.prec)) +
    '  ' +
    chalk.rgb(90, 90, 130)(padLeft('Wis', colWidths.wis)) +
    '  ' +
    chalk.rgb(90, 90, 130)(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const s of shards) {
    lines.push(
      padRight(s.file, colWidths.file) +
        '  ' +
        padLeft(String(s.volcanicGlass), colWidths.gls) +
        '  ' +
        padLeft(String(s.clarityDepth), colWidths.depth) +
        '  ' +
        padLeft(String(s.darkResilience), colWidths.res) +
        '  ' +
        padLeft(String(s.mirrorPrecision), colWidths.prec) +
        '  ' +
        padLeft(String(s.abyssWisdom), colWidths.wis) +
        '  ' +
        padLeft(String(s.qualityScore), colWidths.score),
    )
  }

  return lines.join('\n')
}

/** @example formatReefTable(reef) */
export function formatReefTable(reef: ObsidianReef): string {
  const lines: string[] = [
    chalk.bold(`Obsidian Reef: ${reef.directory}`),
    '',
    `  Shards:          ${reef.shards.length}`,
    `  Avg Glass:       ${colorScore(reef.avgGlass)}`,
    `  Avg Precision:   ${colorScore(reef.avgPrecision)}`,
    `  Avg Wisdom:      ${colorScore(reef.avgWisdom)}`,
    `  Masterpieces:    ${reef.obsidianMasterpieceCount}`,
    `  Reef Type:       ${reef.reefType}`,
    `  Condition:       ${colorReefCondition(reef.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatReefsTable(reefs) */
export function formatReefsTable(reefs: ObsidianReef[]): string {
  if (reefs.length === 0) return chalk.dim('No obsidian reefs found')

  const lines: string[] = [chalk.bold('Obsidian Reefs'), '']

  for (const r of reefs) {
    lines.push(
      `  ${chalk.rgb(90, 90, 130)(r.directory)}  ${colorScore(r.avgGlass)}  ${colorReefCondition(r.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: ObsidianTideResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Obsidian Wave Statistics'),
    '',
    `  Total Files:           ${stats.totalFiles}`,
    `  Total Reefs:           ${stats.totalReefs}`,
    `  Avg Volcanic Glass:    ${colorScore(stats.avgVolcanicGlass)}`,
    `  Avg Clarity Depth:     ${colorScore(stats.avgClarityDepth)}`,
    `  Avg Dark Resilience:   ${colorScore(stats.avgDarkResilience)}`,
    `  Avg Mirror Precision:  ${colorScore(stats.avgMirrorPrecision)}`,
    `  Avg Abyss Wisdom:      ${colorScore(stats.avgAbyssWisdom)}`,
    `  Obsidian Masterpieces: ${stats.obsidianMasterpieceCount}`,
    `  Volcanic Perfections:  ${stats.volcanicPerfectionCount}`,
    `  Proper Blades:         ${stats.properBladeCount}`,
    `  Dull Glass:            ${stats.dullGlassCount}`,
    `  Warm Stones:           ${stats.warmStoneCount}`,
    `  Void:                  ${stats.voidCount}`,
    `  Overall Sharpness:     ${colorScore(stats.overallSharpness)}`,
    `  Bladesmith Grade:      ${stats.bladesmithGrade}`,
    `  Best Shard:            ${stats.bestShard || 'N/A'}`,
    `  Best Formed:           ${stats.bestFormed || 'N/A'}`,
    `  Deepest:               ${stats.deepest || 'N/A'}`,
    `  Most Resilient:        ${stats.mostResilient || 'N/A'}`,
    `  Sharpest:              ${stats.sharpest || 'N/A'}`,
    `  Wisest:                ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(90, 90, 130)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: ObsidianTideResult): string {
  const lines: string[] = [
    chalk.bold('Obsidian Wave Analysis'),
    '',
    formatShardsTable(result.shards),
    '',
    formatReefsTable(result.reefs),
    '',
    chalk.bold('Volcano Overview'),
    '',
    `  Avg Glass:        ${colorScore(result.volcano.avgGlass)}`,
    `  Avg Precision:    ${colorScore(result.volcano.avgPrecision)}`,
    `  Avg Wisdom:       ${colorScore(result.volcano.avgWisdom)}`,
    `  Overall Sharpness: ${colorScore(result.volcano.overallSharpness)}`,
    `  Is Obsidian:      ${result.volcano.isObsidian ? chalk.rgb(90, 90, 130)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: ObsidianTideResult): string {
  return JSON.stringify(result, null, 2)
}
