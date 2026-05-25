// ─── Imports ─────────────────────────────────────────────

import chalk from 'chalk'

import type {
  ObsidianShard,
  ObsidianChamber,
  ObsidianTempleResult,
} from './obsidian-temple-helpers.js'

// ─── Color Helpers ───────────────────────────────────────

export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(100, 50, 180)(String(score))
  if (score >= 75) return chalk.rgb(80, 80, 200)(String(score))
  if (score >= 60) return chalk.rgb(100, 150, 220)(String(score))
  if (score >= 40) return chalk.rgb(200, 150, 100)(String(score))
  if (score >= 20) return chalk.rgb(200, 100, 80)(String(score))
  return chalk.rgb(150, 60, 60)(String(score))
}

export function colorGrade(condition: string): string {
  switch (condition) {
    case 'obsidian-masterpiece': return chalk.rgb(100, 50, 180)(condition)
    case 'dark-sanctuary': return chalk.rgb(80, 80, 200)(condition)
    case 'proper-temple': return chalk.rgb(100, 150, 220)(condition)
    case 'crumbling-stone': return chalk.rgb(200, 150, 100)(condition)
    case 'shattered-glass': return chalk.rgb(200, 100, 80)(condition)
    case 'void': return chalk.rgb(150, 60, 60)(condition)
    default: return condition
  }
}

// ─── Shard Formatting ────────────────────────────────────

export function formatShardTable(shard: ObsidianShard): string {
  const lines = [
    `  ${chalk.bold(shard.file)}`,
    `    Volcanic Clarity:  ${colorScore(shard.volcanicClarity)}  Dark Resilience: ${colorScore(shard.darkResilience)}`,
    `    Mirror Depth:     ${colorScore(shard.mirrorDepth)}  Blade Precision: ${colorScore(shard.bladePrecision)}`,
    `    Shadow Wisdom:    ${colorScore(shard.shadowWisdom)}  Condition: ${colorGrade(shard.condition)}`,
    `    Quality Score:    ${colorScore(shard.qualityScore)}`,
  ]
  return lines.join('\n')
}

export function formatShardsTable(shards: ObsidianShard[]): string {
  if (shards.length === 0) return chalk.dim('No obsidian shards found')
  return shards.map(formatShardTable).join('\n\n')
}

// ─── Chamber Formatting ──────────────────────────────────

export function formatChamberTable(chamber: ObsidianChamber): string {
  const lines = [
    `  ${chalk.bold(chamber.directory)}/`,
    `    Type: ${chamber.chamberType}  Condition: ${chamber.condition}`,
    `    Avg Clarity: ${chamber.avgClarity}  Avg Precision: ${chamber.avgPrecision}  Avg Wisdom: ${chamber.avgWisdom}`,
    `    Masterpieces: ${chamber.obsidianMasterpieceCount}  Void: ${chamber.voidCount}`,
  ]
  return lines.join('\n')
}

export function formatChambersTable(chambers: ObsidianChamber[]): string {
  if (chambers.length === 0) return chalk.dim('No obsidian chambers found')
  return chambers.map(formatChamberTable).join('\n\n')
}

// ─── Stats Formatting ────────────────────────────────────

export function formatStatsTable(stats: ObsidianTempleResult['stats']): string {
  const lines = [
    chalk.bold('  Obsidian Temple Statistics'),
    `    Total Files:           ${stats.totalFiles}`,
    `    Total Chambers:        ${stats.totalChambers}`,
    `    Avg Volcanic Clarity:  ${stats.avgVolcanicClarity}`,
    `    Avg Dark Resilience:   ${stats.avgDarkResilience}`,
    `    Avg Mirror Depth:      ${stats.avgMirrorDepth}`,
    `    Avg Blade Precision:   ${stats.avgBladePrecision}`,
    `    Avg Shadow Wisdom:     ${stats.avgShadowWisdom}`,
    `    Obsidian Masterpieces: ${stats.obsidianMasterpieceCount}`,
    `    Dark Sanctuaries:      ${stats.darkSanctuaryCount}`,
    `    Proper Temples:        ${stats.properTempleCount}`,
    `    Crumbling Stones:      ${stats.crumblingStoneCount}`,
    `    Shattered Glass:       ${stats.shatteredGlassCount}`,
    `    Void:                  ${stats.voidCount}`,
    `    Overall Sharpness:     ${stats.overallSharpness}`,
    `    Temple Grade:          ${stats.templeGrade}`,
    `    Best Shard:            ${stats.bestShard}`,
    `    Clearest:              ${stats.clearest}`,
    `    Most Resilient:        ${stats.mostResilient}`,
    `    Deepest:               ${stats.deepest}`,
    `    Sharpest:              ${stats.sharpest}`,
    `    Wisest:                ${stats.wisest}`,
  ]
  return lines.join('\n')
}

// ─── Temple Formatting ───────────────────────────────────

export function formatTempleTable(temple: ObsidianTempleResult['temple']): string {
  const lines = [
    chalk.bold('  Temple Overview'),
    `    Avg Clarity:       ${temple.avgClarity}`,
    `    Avg Precision:     ${temple.avgPrecision}`,
    `    Avg Wisdom:        ${temple.avgWisdom}`,
    `    Is Obsidian:       ${temple.isObsidian}`,
    `    Overall Sharpness: ${temple.overallSharpness}`,
  ]
  return lines.join('\n')
}

// ─── Recommendations Formatting ──────────────────────────

export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.dim('No recommendations')
  return recs.map(r => `  • ${r}`).join('\n')
}

// ─── Result Formatting ───────────────────────────────────

export function formatResultTable(result: ObsidianTempleResult): string {
  const sections = [
    chalk.bold('\n◈ Obsidian Temple Analysis ◈\n'),
    chalk.bold('  Obsidian Shards'),
    formatShardsTable(result.shards),
    '\n',
    chalk.bold('  Obsidian Chambers'),
    formatChambersTable(result.chambers),
    '\n',
    formatTempleTable(result.temple),
    '\n',
    formatStatsTable(result.stats),
    '\n',
    chalk.bold('  Recommendations'),
    formatRecommendations(result.recommendations),
  ]
  return sections.join('\n')
}

export function formatResultJson(result: ObsidianTempleResult): string {
  return JSON.stringify(result, null, 2)
}
