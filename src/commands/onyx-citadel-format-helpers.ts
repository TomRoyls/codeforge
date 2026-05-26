import chalk from 'chalk'

import type { BlockCondition, CastleCondition, CastleType, CommanderGrade, OnyxBlock, OnyxCastle, OnyxCitadelResult } from './onyx-citadel-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(30, 30, 40)(String(score))
  if (score >= 75) return chalk.rgb(50, 45, 55)(String(score))
  if (score >= 60) return chalk.rgb(70, 65, 75)(String(score))
  if (score >= 40) return chalk.rgb(90, 85, 95)(String(score))
  if (score >= 20) return chalk.rgb(110, 105, 115)(String(score))
  return chalk.gray(String(score))
}

/** @example colorBlockCondition('onyx-masterpiece') */
export function colorBlockCondition(condition: BlockCondition | string): string {
  switch (condition) {
    case 'onyx-masterpiece': return chalk.rgb(30, 30, 40)('onyx-masterpiece')
    case 'dark-gem': return chalk.rgb(50, 45, 55)('dark-gem')
    case 'proper-onyx': return chalk.rgb(70, 65, 75)('proper-onyx')
    case 'gray-stone': return chalk.rgb(90, 85, 95)('gray-stone')
    case 'white-rock': return chalk.rgb(110, 105, 115)('white-rock')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorCastleType('dark-citadel') */
export function colorCastleType(type: CastleType | string): string {
  switch (type) {
    case 'dark-citadel': return chalk.rgb(30, 30, 40)('dark-citadel')
    case 'shadow-fortress': return chalk.rgb(50, 45, 55)('shadow-fortress')
    case 'proper-stronghold': return chalk.rgb(70, 65, 75)('proper-stronghold')
    case 'watchtower': return chalk.rgb(90, 85, 95)('watchtower')
    case 'ruin': return chalk.rgb(110, 105, 115)('ruin')
    case 'no-castle': return chalk.gray('no-castle')
    default: return chalk.gray(String(type))
  }
}

/** @example colorCastleCondition('onyx-palace') */
export function colorCastleCondition(condition: CastleCondition | string): string {
  switch (condition) {
    case 'onyx-palace': return chalk.rgb(30, 30, 40)('onyx-palace')
    case 'dark-tower': return chalk.rgb(50, 45, 55)('dark-tower')
    case 'proper-keep': return chalk.rgb(70, 65, 75)('proper-keep')
    case 'stone-walls': return chalk.rgb(90, 85, 95)('stone-walls')
    case 'wooden-fence': return chalk.rgb(110, 105, 115)('wooden-fence')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorCommanderGrade('dark-lord') */
export function colorCommanderGrade(grade: CommanderGrade | string): string {
  switch (grade) {
    case 'dark-lord': return chalk.rgb(30, 30, 40)('dark-lord')
    case 'citadel-guardian': return chalk.rgb(50, 45, 55)('citadel-guardian')
    case 'proper-sentinel': return chalk.rgb(70, 65, 75)('proper-sentinel')
    case 'watchman': return chalk.rgb(90, 85, 95)('watchman')
    case 'recruit': return chalk.rgb(110, 105, 115)('recruit')
    case 'sleeping-guard': return chalk.gray('sleeping-guard')
    default: return chalk.gray(String(grade))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatBlockTable(block) */
export function formatBlockTable(block: OnyxBlock): string {
  const lines: string[] = [
    chalk.bold(`Onyx Block: ${block.file}`),
    '',
    `  Obsidian Clarity:    ${colorScore(block.obsidianClarity)}  ${chalk.dim(`(${block.illuminating.vision})`)}`,
    `  Dark Fortress:       ${colorScore(block.darkFortress)}  ${chalk.dim(`(${block.fortifying.wall})`)}`,
    `  Blade Precision:     ${colorScore(block.bladePrecision)}  ${chalk.dim(`(${block.cutting.edge})`)}`,
    `  Shadow Resilience:   ${colorScore(block.shadowResilience)}  ${chalk.dim(`(${block.surviving.shadow})`)}`,
    `  Midnight Wisdom:     ${colorScore(block.midnightWisdom)}  ${chalk.dim(`(${block.knowing.hour})`)}`,
    '',
    `  Quality Score: ${colorScore(block.qualityScore)}  ${chalk.dim(`(${block.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatBlocksTable(blocks) */
export function formatBlocksTable(blocks: OnyxBlock[]): string {
  if (blocks.length === 0) return chalk.dim('No onyx blocks found')
  const lines: string[] = [chalk.bold('Onyx Blocks'), '']
  for (const b of blocks) {
    lines.push(`  ${chalk.rgb(30, 30, 40)(b.file)}  Cla:${colorScore(b.obsidianClarity)}  Str:${colorScore(b.darkFortress)}  Score:${colorScore(b.qualityScore)}`)
  }
  return lines.join('\n')
}

/** @example formatCastleTable(castle) */
export function formatCastleTable(castle: OnyxCastle): string {
  const lines: string[] = [
    chalk.bold(`Onyx Castle: ${castle.directory}`),
    '',
    `  Blocks:          ${castle.blocks.length}`,
    `  Avg Clarity:     ${colorScore(castle.avgClarity)}`,
    `  Avg Strength:    ${colorScore(castle.avgStrength)}`,
    `  Avg Wisdom:      ${colorScore(castle.avgWisdom)}`,
    `  Masterpieces:    ${castle.onyxMasterpieceCount}`,
    `  Castle Type:     ${colorCastleType(castle.castleType)}`,
    `  Condition:       ${colorCastleCondition(castle.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatCastlesTable(castles) */
export function formatCastlesTable(castles: OnyxCastle[]): string {
  if (castles.length === 0) return chalk.dim('No onyx castles found')
  const lines: string[] = [chalk.bold('Onyx Castles'), '']
  for (const c of castles) {
    lines.push(`  ${chalk.rgb(30, 30, 40)(c.directory)}  ${colorScore(c.avgStrength)}  ${colorCastleCondition(c.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: OnyxCitadelResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Onyx Citadel Statistics'),
    '',
    `  Total Files:              ${stats.totalFiles}`,
    `  Total Castles:            ${stats.totalCastles}`,
    `  Avg Obsidian Clarity:     ${colorScore(stats.avgObsidianClarity)}`,
    `  Avg Dark Fortress:        ${colorScore(stats.avgDarkFortress)}`,
    `  Avg Blade Precision:      ${colorScore(stats.avgBladePrecision)}`,
    `  Avg Shadow Resilience:    ${colorScore(stats.avgShadowResilience)}`,
    `  Avg Midnight Wisdom:      ${colorScore(stats.avgMidnightWisdom)}`,
    `  Onyx Masterpieces:        ${stats.onyxMasterpieceCount}`,
    `  Dark Gems:                ${stats.darkGemCount}`,
    `  Proper Onyx:              ${stats.properOnyxCount}`,
    `  Gray Stone:               ${stats.grayStoneCount}`,
    `  White Rock:               ${stats.whiteRockCount}`,
    `  Void:                     ${stats.voidCount}`,
    `  Overall Fortification:    ${colorScore(stats.overallFortification)}`,
    `  Commander Grade:          ${colorCommanderGrade(stats.commanderGrade)}`,
    `  Best Block:               ${stats.bestBlock || 'N/A'}`,
    `  Clearest:                 ${stats.clearest || 'N/A'}`,
    `  Strongest:                ${stats.strongest || 'N/A'}`,
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
export function formatResultTable(result: OnyxCitadelResult): string {
  const lines: string[] = [
    chalk.bold('Onyx Citadel Analysis'),
    '',
    formatBlocksTable(result.blocks),
    '',
    formatCastlesTable(result.castles),
    '',
    chalk.bold('Keep Overview'),
    '',
    `  Avg Clarity:        ${colorScore(result.keep.avgClarity)}`,
    `  Avg Strength:       ${colorScore(result.keep.avgStrength)}`,
    `  Avg Wisdom:         ${colorScore(result.keep.avgWisdom)}`,
    `  Overall Fort:       ${colorScore(result.keep.overallFortification)}`,
    `  Is Onyx:            ${result.keep.isOnyx ? chalk.rgb(30, 30, 40)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: OnyxCitadelResult): string {
  return JSON.stringify(result, null, 2)
}
