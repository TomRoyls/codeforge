import chalk from 'chalk'

import type { BlossomCondition, GroveCondition, IronBlossom, IronGrove, IronGroveResult } from './iron-grove-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(160, 140, 80)(String(score))
  if (score >= 75) return chalk.rgb(140, 120, 70)(String(score))
  if (score >= 60) return chalk.rgb(120, 100, 60)(String(score))
  if (score >= 40) return chalk.rgb(130, 110, 90)(String(score))
  if (score >= 20) return chalk.rgb(110, 95, 80)(String(score))
  return chalk.gray(String(score))
}

/** @example colorCondition('iron-masterpiece') */
export function colorCondition(condition: BlossomCondition | string): string {
  switch (condition) {
    case 'iron-masterpiece':
      return chalk.rgb(160, 140, 80)('iron-masterpiece')
    case 'steel-blossom':
      return chalk.rgb(140, 120, 70)('steel-blossom')
    case 'proper-alloy':
      return chalk.rgb(120, 100, 60)('proper-alloy')
    case 'rusted-branch':
      return chalk.rgb(130, 110, 90)('rusted-branch')
    case 'dead-stump':
      return chalk.rgb(110, 95, 80)('dead-stump')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorGroveCondition('steel-forest') */
export function colorGroveCondition(condition: GroveCondition | string): string {
  switch (condition) {
    case 'steel-forest':
      return chalk.rgb(160, 140, 80)('steel-forest')
    case 'iron-vineyard':
      return chalk.rgb(140, 120, 70)('iron-vineyard')
    case 'proper-orchard':
      return chalk.rgb(120, 100, 60)('proper-orchard')
    case 'weed-patch':
      return chalk.rgb(130, 110, 90)('weed-patch')
    case 'desert':
      return chalk.rgb(110, 95, 80)('desert')
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

/** @example formatBlossomTable(blossom) */
export function formatBlossomTable(blossom: IronBlossom): string {
  const lines: string[] = [
    chalk.bold(`Iron Blossom: ${blossom.file}`),
    '',
    `  Strength Through Nature: ${colorScore(blossom.strengthThroughNature)}  ${chalk.dim(`(${blossom.growing.vitality})`)}`,
    `  Rust Resistance:        ${colorScore(blossom.rustResistance)}  ${chalk.dim(`(${blossom.resisting.shield})`)}`,
    `  Bloom Precision:        ${colorScore(blossom.bloomPrecision)}  ${chalk.dim(`(${blossom.flowering.blossom})`)}`,
    `  Root Depth:             ${colorScore(blossom.rootDepth)}  ${chalk.dim(`(${blossom.rooting.root})`)}`,
    `  Forge Vitality:         ${colorScore(blossom.forgeVitality)}  ${chalk.dim(`(${blossom.forging.fire})`)}`,
    '',
    `  Quality Score: ${colorScore(blossom.qualityScore)}  ${chalk.dim(`(${colorCondition(blossom.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatBlossomsTable(blossoms) */
export function formatBlossomsTable(blossoms: IronBlossom[]): string {
  if (blossoms.length === 0) return chalk.dim('No iron blossoms found')

  const colWidths = {
    file: Math.max(4, ...blossoms.map((b) => b.file.length)),
    str: Math.max(4, ...blossoms.map((b) => String(b.strengthThroughNature).length)),
    rust: Math.max(4, ...blossoms.map((b) => String(b.rustResistance).length)),
    prec: Math.max(4, ...blossoms.map((b) => String(b.bloomPrecision).length)),
    root: Math.max(4, ...blossoms.map((b) => String(b.rootDepth).length)),
    vital: Math.max(4, ...blossoms.map((b) => String(b.forgeVitality).length)),
    score: Math.max(5, ...blossoms.map((b) => String(b.qualityScore).length)),
  }

  const lines: string[] = [chalk.bold('Iron Blossoms'), '']

  const header =
    chalk.rgb(160, 140, 80)(padRight('File', colWidths.file)) +
    '  ' +
    chalk.rgb(160, 140, 80)(padLeft('Str', colWidths.str)) +
    '  ' +
    chalk.rgb(160, 140, 80)(padLeft('Rust', colWidths.rust)) +
    '  ' +
    chalk.rgb(160, 140, 80)(padLeft('Prec', colWidths.prec)) +
    '  ' +
    chalk.rgb(160, 140, 80)(padLeft('Root', colWidths.root)) +
    '  ' +
    chalk.rgb(160, 140, 80)(padLeft('Vital', colWidths.vital)) +
    '  ' +
    chalk.rgb(160, 140, 80)(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const b of blossoms) {
    lines.push(
      padRight(b.file, colWidths.file) +
        '  ' +
        padLeft(String(b.strengthThroughNature), colWidths.str) +
        '  ' +
        padLeft(String(b.rustResistance), colWidths.rust) +
        '  ' +
        padLeft(String(b.bloomPrecision), colWidths.prec) +
        '  ' +
        padLeft(String(b.rootDepth), colWidths.root) +
        '  ' +
        padLeft(String(b.forgeVitality), colWidths.vital) +
        '  ' +
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
    `  Blossoms:       ${grove.blossoms.length}`,
    `  Avg Strength:   ${colorScore(grove.avgStrength)}`,
    `  Avg Precision:  ${colorScore(grove.avgPrecision)}`,
    `  Avg Vitality:   ${colorScore(grove.avgVitality)}`,
    `  Masterpieces:   ${grove.ironMasterpieceCount}`,
    `  Grove Type:     ${grove.groveType}`,
    `  Condition:      ${colorGroveCondition(grove.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatGrovesTable(groves) */
export function formatGrovesTable(groves: IronGrove[]): string {
  if (groves.length === 0) return chalk.dim('No iron groves found')

  const lines: string[] = [chalk.bold('Iron Groves'), '']

  for (const g of groves) {
    lines.push(
      `  ${chalk.rgb(160, 140, 80)(g.directory)}  ${colorScore(g.avgStrength)}  ${colorGroveCondition(g.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: IronGroveResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Iron Grove Statistics'),
    '',
    `  Total Files:             ${stats.totalFiles}`,
    `  Total Groves:            ${stats.totalGroves}`,
    `  Avg Strength/Nature:     ${colorScore(stats.avgStrengthThroughNature)}`,
    `  Avg Rust Resistance:     ${colorScore(stats.avgRustResistance)}`,
    `  Avg Bloom Precision:     ${colorScore(stats.avgBloomPrecision)}`,
    `  Avg Root Depth:          ${colorScore(stats.avgRootDepth)}`,
    `  Avg Forge Vitality:      ${colorScore(stats.avgForgeVitality)}`,
    `  Iron Masterpieces:       ${stats.ironMasterpieceCount}`,
    `  Steel Blossom:           ${stats.steelBlossomCount}`,
    `  Proper Alloy:            ${stats.properAlloyCount}`,
    `  Rusted Branch:           ${stats.rustedBranchCount}`,
    `  Dead Stump:              ${stats.deadStumpCount}`,
    `  Void:                    ${stats.voidCount}`,
    `  Overall Yield:           ${colorScore(stats.overallYield)}`,
    `  Blacksmith Grade:        ${stats.blacksmithGrade}`,
    `  Best Blossom:            ${stats.bestBlossom || 'N/A'}`,
    `  Strongest:               ${stats.strongest || 'N/A'}`,
    `  Most Resistant:          ${stats.mostResistant || 'N/A'}`,
    `  Most Precise:            ${stats.mostPrecise || 'N/A'}`,
    `  Deepest:                 ${stats.deepest || 'N/A'}`,
    `  Most Vital:              ${stats.mostVital || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(160, 140, 80)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: IronGroveResult): string {
  const lines: string[] = [
    chalk.bold('Iron Grove Analysis'),
    '',
    formatBlossomsTable(result.blossoms),
    '',
    formatGrovesTable(result.groves),
    '',
    chalk.bold('Harvest Overview'),
    '',
    `  Avg Strength:   ${colorScore(result.harvest.avgStrength)}`,
    `  Avg Precision:  ${colorScore(result.harvest.avgPrecision)}`,
    `  Avg Vitality:   ${colorScore(result.harvest.avgVitality)}`,
    `  Yield:          ${colorScore(result.harvest.overallYield)}`,
    `  Is Iron:        ${result.harvest.isIron ? chalk.rgb(160, 140, 80)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: IronGroveResult): string {
  return JSON.stringify(result, null, 2)
}
