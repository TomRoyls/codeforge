import chalk from 'chalk'

import type { GroveCondition, IronBlossom, IronGrove, IronOrchardResult } from './steel-orchard-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(80, 130, 60)(String(score))
  if (score >= 75) return chalk.rgb(60, 110, 50)(String(score))
  if (score >= 60) return chalk.rgb(50, 100, 60)(String(score))
  if (score >= 40) return chalk.rgb(100, 80, 40)(String(score))
  if (score >= 20) return chalk.rgb(80, 60, 30)(String(score))
  return chalk.gray(String(score))
}

/** @example colorGroveCondition('steel-forest') */
export function colorGroveCondition(condition: GroveCondition | string): string {
  switch (condition) {
    case 'steel-forest': return chalk.rgb(80, 130, 60)('steel-forest')
    case 'iron-vineyard': return chalk.rgb(60, 110, 50)('iron-vineyard')
    case 'proper-orchard': return chalk.rgb(50, 100, 60)('proper-orchard')
    case 'weed-patch': return chalk.rgb(100, 80, 40)('weed-patch')
    case 'desert': return chalk.rgb(80, 60, 30)('desert')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatBlossomTable(blossom) */
export function formatBlossomTable(blossom: IronBlossom): string {
  const lines: string[] = [
    chalk.bold(`Iron Blossom: ${blossom.file}`),
    '',
    `  Strength Through Nature: ${colorScore(blossom.strengthThroughNature)}  ${chalk.dim(`(${blossom.growing.vitality})`)}`,
    `  Rust Resistance:         ${colorScore(blossom.rustResistance)}  ${chalk.dim(`(${blossom.resisting.shield})`)}`,
    `  Bloom Precision:         ${colorScore(blossom.bloomPrecision)}  ${chalk.dim(`(${blossom.flowering.blossom})`)}`,
    `  Root Depth:              ${colorScore(blossom.rootDepth)}  ${chalk.dim(`(${blossom.rooting.root})`)}`,
    `  Forge Vitality:          ${colorScore(blossom.forgeVitality)}  ${chalk.dim(`(${blossom.forging.fire})`)}`,
    '',
    `  Quality Score: ${colorScore(blossom.qualityScore)}  ${chalk.dim(`(${blossom.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatBlossomsTable(blossoms) */
export function formatBlossomsTable(blossoms: IronBlossom[]): string {
  if (blossoms.length === 0) return chalk.dim('No iron blossoms found')
  const colWidths = {
    file: Math.max(4, ...blossoms.map((b) => b.file.length)),
    strength: Math.max(8, ...blossoms.map((b) => String(b.strengthThroughNature).length)),
    resist: Math.max(7, ...blossoms.map((b) => String(b.rustResistance).length)),
    bloom: Math.max(5, ...blossoms.map((b) => String(b.bloomPrecision).length)),
    root: Math.max(4, ...blossoms.map((b) => String(b.rootDepth).length)),
    forge: Math.max(5, ...blossoms.map((b) => String(b.forgeVitality).length)),
    score: Math.max(5, ...blossoms.map((b) => String(b.qualityScore).length)),
  }
  const lines: string[] = [chalk.bold('Iron Blossoms'), '']
  const header =
    chalk.rgb(80, 130, 60)(padRight('File', colWidths.file)) + '  ' +
    chalk.rgb(80, 130, 60)(padLeft('Strength', colWidths.strength)) + '  ' +
    chalk.rgb(80, 130, 60)(padLeft('RustRes', colWidths.resist)) + '  ' +
    chalk.rgb(80, 130, 60)(padLeft('Bloom', colWidths.bloom)) + '  ' +
    chalk.rgb(80, 130, 60)(padLeft('Root', colWidths.root)) + '  ' +
    chalk.rgb(80, 130, 60)(padLeft('Forge', colWidths.forge)) + '  ' +
    chalk.rgb(80, 130, 60)(padLeft('Score', colWidths.score))
  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))
  for (const b of blossoms) {
    lines.push(
      padRight(b.file, colWidths.file) + '  ' +
      padLeft(String(b.strengthThroughNature), colWidths.strength) + '  ' +
      padLeft(String(b.rustResistance), colWidths.resist) + '  ' +
      padLeft(String(b.bloomPrecision), colWidths.bloom) + '  ' +
      padLeft(String(b.rootDepth), colWidths.root) + '  ' +
      padLeft(String(b.forgeVitality), colWidths.forge) + '  ' +
      padLeft(String(b.qualityScore), colWidths.score),
    )
  }
  return lines.join('\n')
}

/** @example formatGroveTable(grove) */
export function formatGroveTable(grove: IronGrove): string {
  const lines: string[] = [
    chalk.bold(`Iron Grove: ${grove.directory}`),
    '',
    `  Blossoms:          ${grove.blossoms.length}`,
    `  Avg Strength:      ${colorScore(grove.avgStrength)}`,
    `  Avg Precision:     ${colorScore(grove.avgPrecision)}`,
    `  Avg Vitality:      ${colorScore(grove.avgVitality)}`,
    `  Masterpieces:      ${grove.ironMasterpieceCount}`,
    `  Grove Type:        ${grove.groveType}`,
    `  Condition:         ${colorGroveCondition(grove.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatGrovesTable(groves) */
export function formatGrovesTable(groves: IronGrove[]): string {
  if (groves.length === 0) return chalk.dim('No iron groves found')
  const lines: string[] = [chalk.bold('Iron Groves'), '']
  for (const g of groves) {
    lines.push(`  ${chalk.rgb(80, 130, 60)(g.directory)}  ${colorScore(g.avgStrength)}  ${colorGroveCondition(g.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: IronOrchardResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Iron Orchard Statistics'),
    '',
    `  Total Files:              ${stats.totalFiles}`,
    `  Total Groves:             ${stats.totalGroves}`,
    `  Avg Strength Through Nature: ${colorScore(stats.avgStrengthThroughNature)}`,
    `  Avg Rust Resistance:      ${colorScore(stats.avgRustResistance)}`,
    `  Avg Bloom Precision:      ${colorScore(stats.avgBloomPrecision)}`,
    `  Avg Root Depth:           ${colorScore(stats.avgRootDepth)}`,
    `  Avg Forge Vitality:       ${colorScore(stats.avgForgeVitality)}`,
    `  Iron Masterpieces:        ${stats.ironMasterpieceCount}`,
    `  Steel Blossoms:           ${stats.steelBlossomCount}`,
    `  Proper Alloys:            ${stats.properAlloyCount}`,
    `  Rusted Branches:          ${stats.rustedBranchCount}`,
    `  Dead Stumps:              ${stats.deadStumpCount}`,
    `  Void:                     ${stats.voidCount}`,
    `  Overall Yield:            ${colorScore(stats.overallYield)}`,
    `  Blacksmith Grade:         ${stats.blacksmithGrade}`,
    `  Best Blossom:             ${stats.bestBlossom || 'N/A'}`,
    `  Strongest:                ${stats.strongest || 'N/A'}`,
    `  Most Resistant:           ${stats.mostResistant || 'N/A'}`,
    `  Most Precise:             ${stats.mostPrecise || 'N/A'}`,
    `  Deepest Roots:            ${stats.deepest || 'N/A'}`,
    `  Most Vital:               ${stats.mostVital || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(80, 130, 60)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: IronOrchardResult): string {
  const lines: string[] = [
    chalk.bold('Iron Orchard Analysis'),
    '',
    formatBlossomsTable(result.blossoms),
    '',
    formatGrovesTable(result.groves),
    '',
    chalk.bold('Harvest Overview'),
    '',
    `  Avg Strength:     ${colorScore(result.harvest.avgStrength)}`,
    `  Avg Precision:    ${colorScore(result.harvest.avgPrecision)}`,
    `  Avg Vitality:     ${colorScore(result.harvest.avgVitality)}`,
    `  Overall Yield:    ${colorScore(result.harvest.overallYield)}`,
    `  Is Iron:          ${result.harvest.isIron ? chalk.rgb(80, 130, 60)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: IronOrchardResult): string {
  return JSON.stringify(result, null, 2)
}
