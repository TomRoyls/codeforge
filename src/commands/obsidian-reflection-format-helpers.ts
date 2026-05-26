import chalk from 'chalk'

import type { CavernCondition, CavernType, MirrorGrade, ObsidianCavern, ObsidianMirrorResult, ObsidianShard, ShardCondition } from './obsidian-reflection-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(30, 30, 40)(String(score))
  if (score >= 75) return chalk.rgb(50, 50, 60)(String(score))
  if (score >= 60) return chalk.rgb(80, 80, 90)(String(score))
  if (score >= 40) return chalk.rgb(110, 110, 120)(String(score))
  if (score >= 20) return chalk.rgb(140, 140, 150)(String(score))
  return chalk.gray(String(score))
}

/** @example colorCondition('obsidian-palace') */
export function colorCondition(condition: CavernCondition | string): string {
  switch (condition) {
    case 'obsidian-palace': return chalk.rgb(30, 30, 40)('obsidian-palace')
    case 'dark-vault': return chalk.rgb(50, 50, 60)('dark-vault')
    case 'proper-chamber': return chalk.rgb(80, 80, 90)('proper-chamber')
    case 'stone-cellar': return chalk.rgb(110, 110, 120)('stone-cellar')
    case 'dirt-hole': return chalk.rgb(140, 140, 150)('dirt-hole')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorShardCondition('obsidian-masterpiece') */
export function colorShardCondition(condition: ShardCondition | string): string {
  switch (condition) {
    case 'obsidian-masterpiece': return chalk.rgb(30, 30, 40)('obsidian-masterpiece')
    case 'volcanic-gem': return chalk.rgb(50, 50, 60)('volcanic-gem')
    case 'proper-glass': return chalk.rgb(80, 80, 90)('proper-glass')
    case 'cloudy-stone': return chalk.rgb(110, 110, 120)('cloudy-stone')
    case 'rough-rock': return chalk.rgb(140, 140, 150)('rough-rock')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorCavernType('mirror-chamber') */
export function colorCavernType(type: CavernType | string): string {
  switch (type) {
    case 'mirror-chamber': return chalk.rgb(30, 30, 40)('mirror-chamber')
    case 'dark-gallery': return chalk.rgb(50, 50, 60)('dark-gallery')
    case 'proper-cave': return chalk.rgb(80, 80, 90)('proper-cave')
    case 'shallow-hollow': return chalk.rgb(110, 110, 120)('shallow-hollow')
    case 'surface-crack': return chalk.rgb(140, 140, 150)('surface-crack')
    case 'no-cavern': return chalk.gray('no-cavern')
    default: return chalk.gray(String(type))
  }
}

/** @example colorMirrorGrade('seer') */
export function colorMirrorGrade(grade: MirrorGrade | string): string {
  switch (grade) {
    case 'seer': return chalk.rgb(30, 30, 40)('seer')
    case 'mirror-master': return chalk.rgb(50, 50, 60)('mirror-master')
    case 'proper-gazer': return chalk.rgb(80, 80, 90)('proper-gazer')
    case 'apprentice': return chalk.rgb(110, 110, 120)('apprentice')
    case 'novice': return chalk.rgb(140, 140, 150)('novice')
    case 'blind-folded': return chalk.gray('blind-folded')
    default: return chalk.gray(String(grade))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatShardTable(shard) */
export function formatShardTable(shard: ObsidianShard): string {
  const lines: string[] = [
    chalk.bold(`Obsidian Shard: ${shard.file}`),
    '',
    `  Volcanic Clarity:    ${colorScore(shard.volcanicClarity)}  ${chalk.dim(`(${shard.revealing.mirror})`)}`,
    `  Dark Reflection:     ${colorScore(shard.darkReflection)}  ${chalk.dim(`(${shard.reflecting.truth})`)}`,
    `  Edge Precision:      ${colorScore(shard.edgePrecision)}  ${chalk.dim(`(${shard.cutting.blade})`)}`,
    `  Void Resilience:     ${colorScore(shard.voidResilience)}  ${chalk.dim(`(${shard.surviving.depth})`)}`,
    `  Abyss Wisdom:        ${colorScore(shard.abyssWisdom)}  ${chalk.dim(`(${shard.fathoming.depth})`)}`,
    '',
    `  Quality Score: ${colorScore(shard.qualityScore)}  ${chalk.dim(`(${shard.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatShardsTable(shards) */
export function formatShardsTable(shards: ObsidianShard[]): string {
  if (shards.length === 0) return chalk.dim('No obsidian shards found')
  const lines: string[] = [chalk.bold('Obsidian Shards'), '']
  for (const sh of shards) {
    lines.push(`  ${chalk.rgb(30, 30, 40)(sh.file)}  Clarity:${colorScore(sh.volcanicClarity)}  Precision:${colorScore(sh.edgePrecision)}  Score:${colorScore(sh.qualityScore)}`)
  }
  return lines.join('\n')
}

/** @example formatCavernTable(cavern) */
export function formatCavernTable(cavern: ObsidianCavern): string {
  const lines: string[] = [
    chalk.bold(`Obsidian Cavern: ${cavern.directory}`),
    '',
    `  Shards:              ${cavern.shards.length}`,
    `  Avg Clarity:         ${colorScore(cavern.avgClarity)}`,
    `  Avg Precision:       ${colorScore(cavern.avgPrecision)}`,
    `  Avg Wisdom:          ${colorScore(cavern.avgWisdom)}`,
    `  Masterpieces:        ${cavern.obsidianMasterpieceCount}`,
    `  Cavern Type:         ${colorCavernType(cavern.cavernType)}`,
    `  Condition:           ${colorCondition(cavern.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatCavernsTable(caverns) */
export function formatCavernsTable(caverns: ObsidianCavern[]): string {
  if (caverns.length === 0) return chalk.dim('No obsidian caverns found')
  const lines: string[] = [chalk.bold('Obsidian Caverns'), '']
  for (const c of caverns) {
    lines.push(`  ${chalk.rgb(30, 30, 40)(c.directory)}  ${colorScore(c.avgClarity)}  ${colorCondition(c.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: ObsidianMirrorResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Obsidian Mirror Statistics'),
    '',
    `  Total Files:              ${stats.totalFiles}`,
    `  Total Caverns:            ${stats.totalCaverns}`,
    `  Avg Volcanic Clarity:     ${colorScore(stats.avgVolcanicClarity)}`,
    `  Avg Dark Reflection:      ${colorScore(stats.avgDarkReflection)}`,
    `  Avg Edge Precision:       ${colorScore(stats.avgEdgePrecision)}`,
    `  Avg Void Resilience:      ${colorScore(stats.avgVoidResilience)}`,
    `  Avg Abyss Wisdom:         ${colorScore(stats.avgAbyssWisdom)}`,
    `  Obsidian Masterpieces:    ${stats.obsidianMasterpieceCount}`,
    `  Volcanic Gems:            ${stats.volcanicGemCount}`,
    `  Proper Glass:             ${stats.properGlassCount}`,
    `  Cloudy Stones:            ${stats.cloudyStoneCount}`,
    `  Rough Rocks:              ${stats.roughRockCount}`,
    `  Void:                     ${stats.voidCount}`,
    `  Overall Depth:            ${colorScore(stats.overallDepth)}`,
    `  Mirror Grade:             ${colorMirrorGrade(stats.mirrorGrade)}`,
    `  Best Shard:               ${stats.bestShard || 'N/A'}`,
    `  Clearest:                 ${stats.clearest || 'N/A'}`,
    `  Most Honest:              ${stats.mostHonest || 'N/A'}`,
    `  Sharpest:                 ${stats.sharpest || 'N/A'}`,
    `  Most Resilient:           ${stats.mostResilient || 'N/A'}`,
    `  Wisest:                   ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(30, 30, 40)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: ObsidianMirrorResult): string {
  const lines: string[] = [
    chalk.bold('Obsidian Mirror Analysis'),
    '',
    formatShardsTable(result.shards),
    '',
    formatCavernsTable(result.caverns),
    '',
    chalk.bold('Abyss Overview'),
    '',
    `  Avg Clarity:          ${colorScore(result.abyss.avgClarity)}`,
    `  Avg Precision:        ${colorScore(result.abyss.avgPrecision)}`,
    `  Avg Wisdom:           ${colorScore(result.abyss.avgWisdom)}`,
    `  Overall Depth:        ${colorScore(result.abyss.overallDepth)}`,
    `  Is Obsidian:          ${result.abyss.isObsidian ? chalk.rgb(30, 30, 40)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: ObsidianMirrorResult): string {
  return JSON.stringify(result, null, 2)
}
