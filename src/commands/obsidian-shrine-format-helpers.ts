import chalk from 'chalk'

import type { ObsidianShrine as ObsidianShrineType, ObsidianTempleResult, ObsidianBlock, ShrineCondition } from './obsidian-shrine-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(30, 30, 40)(String(score))
  if (score >= 75) return chalk.rgb(50, 50, 65)(String(score))
  if (score >= 60) return chalk.rgb(70, 70, 90)(String(score))
  if (score >= 40) return chalk.rgb(100, 100, 120)(String(score))
  if (score >= 20) return chalk.rgb(140, 140, 160)(String(score))
  return chalk.gray(String(score))
}

/** @example colorShrineCondition('obsidian-cathedral') */
export function colorShrineCondition(condition: ShrineCondition | string): string {
  switch (condition) {
    case 'obsidian-cathedral': return chalk.rgb(30, 30, 50)('obsidian-cathedral')
    case 'dark-sanctuary': return chalk.rgb(50, 50, 70)('dark-sanctuary')
    case 'proper-temple': return chalk.rgb(70, 70, 95)('proper-temple')
    case 'ruined-shrine': return chalk.rgb(100, 100, 120)('ruined-shrine')
    case 'rubble': return chalk.rgb(140, 140, 160)('rubble')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
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

/** @example formatBlockTable(block) */
export function formatBlockTable(block: ObsidianBlock): string {
  const lines: string[] = [
    chalk.bold(`Obsidian Block: ${block.file}`),
    '',
    `  Volcanic Clarity:  ${colorScore(block.volcanicClarity)}  ${chalk.dim(`(${block.revealing.volcanic})`)}`,
    `  Dark Resilience:  ${colorScore(block.darkResilience)}  ${chalk.dim(`(${block.enduring.shadow})`)}`,
    `  Mirror Depth:     ${colorScore(block.mirrorDepth)}  ${chalk.dim(`(${block.reflecting.mirror})`)}`,
    `  Blade Precision:  ${colorScore(block.bladePrecision)}  ${chalk.dim(`(${block.cutting.blade})`)}`,
    `  Shadow Wisdom:    ${colorScore(block.shadowWisdom)}  ${chalk.dim(`(${block.knowing.shadow})`)}`,
    '',
    `  Quality Score: ${colorScore(block.qualityScore)}  ${chalk.dim(`(${block.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatBlocksTable(blocks) */
export function formatBlocksTable(blocks: ObsidianBlock[]): string {
  if (blocks.length === 0) return chalk.dim('No obsidian blocks found')
  const colWidths = {
    file: Math.max(4, ...blocks.map((b) => b.file.length)),
    clarity: Math.max(7, ...blocks.map((b) => String(b.volcanicClarity).length)),
    resilience: Math.max(10, ...blocks.map((b) => String(b.darkResilience).length)),
    depth: Math.max(5, ...blocks.map((b) => String(b.mirrorDepth).length)),
    precision: Math.max(9, ...blocks.map((b) => String(b.bladePrecision).length)),
    wisdom: Math.max(6, ...blocks.map((b) => String(b.shadowWisdom).length)),
    score: Math.max(5, ...blocks.map((b) => String(b.qualityScore).length)),
  }
  const lines: string[] = [chalk.bold('Obsidian Blocks'), '']
  const header =
    chalk.rgb(30, 30, 50)(padRight('File', colWidths.file)) + '  ' +
    chalk.rgb(30, 30, 50)(padLeft('Clarity', colWidths.clarity)) + '  ' +
    chalk.rgb(30, 30, 50)(padLeft('Resilience', colWidths.resilience)) + '  ' +
    chalk.rgb(30, 30, 50)(padLeft('Depth', colWidths.depth)) + '  ' +
    chalk.rgb(30, 30, 50)(padLeft('Precision', colWidths.precision)) + '  ' +
    chalk.rgb(30, 30, 50)(padLeft('Wisdom', colWidths.wisdom)) + '  ' +
    chalk.rgb(30, 30, 50)(padLeft('Score', colWidths.score))
  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))
  for (const b of blocks) {
    lines.push(
      padRight(b.file, colWidths.file) + '  ' +
      padLeft(String(b.volcanicClarity), colWidths.clarity) + '  ' +
      padLeft(String(b.darkResilience), colWidths.resilience) + '  ' +
      padLeft(String(b.mirrorDepth), colWidths.depth) + '  ' +
      padLeft(String(b.bladePrecision), colWidths.precision) + '  ' +
      padLeft(String(b.shadowWisdom), colWidths.wisdom) + '  ' +
      padLeft(String(b.qualityScore), colWidths.score))
  }
  return lines.join('\n')
}

/** @example formatShrineTable(shrine) */
export function formatShrineTable(shrine: ObsidianShrineType): string {
  const lines: string[] = [
    chalk.bold(`Obsidian Shrine: ${shrine.directory}`),
    '',
    `  Blocks:         ${shrine.blocks.length}`,
    `  Avg Clarity:    ${colorScore(shrine.avgClarity)}`,
    `  Avg Precision:  ${colorScore(shrine.avgPrecision)}`,
    `  Avg Wisdom:     ${colorScore(shrine.avgWisdom)}`,
    `  Masterpieces:   ${shrine.obsidianMasterpieceCount}`,
    `  Shrine Type:    ${shrine.shrineType}`,
    `  Condition:      ${colorShrineCondition(shrine.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatShrinesTable(shrines) */
export function formatShrinesTable(shrines: ObsidianShrineType[]): string {
  if (shrines.length === 0) return chalk.dim('No obsidian shrines found')
  const lines: string[] = [chalk.bold('Obsidian Shrines'), '']
  for (const s of shrines) {
    lines.push(`  ${chalk.rgb(30, 30, 50)(s.directory)}  ${colorScore(s.avgClarity)}  ${colorShrineCondition(s.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: ObsidianTempleResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Obsidian Temple Statistics'),
    '',
    `  Total Files:              ${stats.totalFiles}`,
    `  Total Shrines:            ${stats.totalShrines}`,
    `  Avg Volcanic Clarity:     ${colorScore(stats.avgVolcanicClarity)}`,
    `  Avg Dark Resilience:      ${colorScore(stats.avgDarkResilience)}`,
    `  Avg Mirror Depth:         ${colorScore(stats.avgMirrorDepth)}`,
    `  Avg Blade Precision:      ${colorScore(stats.avgBladePrecision)}`,
    `  Avg Shadow Wisdom:        ${colorScore(stats.avgShadowWisdom)}`,
    `  Obsidian Masterpieces:    ${stats.obsidianMasterpieceCount}`,
    `  Volcanic Perfection:      ${stats.volcanicPerfectionCount}`,
    `  Proper Blades:            ${stats.properBladeCount}`,
    `  Dull Glass:               ${stats.dullGlassCount}`,
    `  Shattered Rock:           ${stats.shatteredRockCount}`,
    `  Void:                     ${stats.voidCount}`,
    `  Overall Sharpness:        ${colorScore(stats.overallSharpness)}`,
    `  Priest Grade:             ${stats.priestGrade}`,
    `  Best Block:               ${stats.bestBlock || 'N/A'}`,
    `  Clearest:                 ${stats.clearest || 'N/A'}`,
    `  Most Resilient:           ${stats.mostResilient || 'N/A'}`,
    `  Deepest:                  ${stats.deepest || 'N/A'}`,
    `  Sharpest:                 ${stats.sharpest || 'N/A'}`,
    `  Wisest:                   ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(30, 30, 50)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: ObsidianTempleResult): string {
  const lines: string[] = [
    chalk.bold('Obsidian Temple Analysis'),
    '',
    formatBlocksTable(result.blocks),
    '',
    formatShrinesTable(result.shrines),
    '',
    chalk.bold('Volcanic Overview'),
    '',
    `  Avg Clarity:      ${colorScore(result.volcano.avgClarity)}`,
    `  Avg Precision:    ${colorScore(result.volcano.avgPrecision)}`,
    `  Avg Wisdom:       ${colorScore(result.volcano.avgWisdom)}`,
    `  Sharpness:        ${colorScore(result.volcano.overallSharpness)}`,
    `  Is Obsidian:      ${result.volcano.isObsidian ? chalk.rgb(30, 30, 50)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: ObsidianTempleResult): string {
  return JSON.stringify(result, null, 2)
}
