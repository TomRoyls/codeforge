import chalk from 'chalk'

import type { BloomCondition, BedCondition, IronBloom, IronBed, IronGardenStats, IronGardenResult } from './iron-orchard-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(34, 139, 34)(String(score))
  if (score >= 75) return chalk.rgb(46, 139, 87)(String(score))
  if (score >= 60) return chalk.rgb(60, 179, 113)(String(score))
  if (score >= 40) return chalk.rgb(107, 142, 35)(String(score))
  if (score >= 20) return chalk.rgb(85, 107, 47)(String(score))
  return chalk.gray(String(score))
}

/** @example colorCondition('iron-masterpiece') */
export function colorCondition(condition: BloomCondition | string): string {
  switch (condition) {
    case 'iron-masterpiece':
      return chalk.rgb(34, 139, 34)('iron-masterpiece')
    case 'garden-paradise':
      return chalk.rgb(46, 139, 87)('garden-paradise')
    case 'proper-garden':
      return chalk.rgb(60, 179, 113)('proper-garden')
    case 'weedy-plot':
      return chalk.rgb(107, 142, 35)('weedy-plot')
    case 'rusty-gate':
      return chalk.rgb(85, 107, 47)('rusty-gate')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorBedCondition('botanical-palace') */
export function colorBedCondition(condition: BedCondition | string): string {
  switch (condition) {
    case 'botanical-palace':
      return chalk.rgb(34, 139, 34)('botanical-palace')
    case 'iron-garden':
      return chalk.rgb(46, 139, 87)('iron-garden')
    case 'proper-plot':
      return chalk.rgb(60, 179, 113)('proper-plot')
    case 'weedy-corner':
      return chalk.rgb(107, 142, 35)('weedy-corner')
    case 'rusty-gate':
      return chalk.rgb(85, 107, 47)('rusty-gate')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatBloomTable(bloom) */
export function formatBloomTable(bloom: IronBloom): string {
  const lines: string[] = [
    chalk.bold(`Iron Bloom: ${bloom.file}`),
    '',
    `  Strength Through Nature: ${colorScore(bloom.strengthThroughNature)}  ${chalk.dim(`(${bloom.structuring.frame})`)}`,
    `  Rust Resistance:         ${colorScore(bloom.rustResistance)}  ${chalk.dim(`(${bloom.protecting.coating})`)}`,
    `  Bloom Precision:         ${colorScore(bloom.bloomPrecision)}  ${chalk.dim(`(${bloom.flowering.bloom})`)}`,
    `  Root Depth:              ${colorScore(bloom.rootDepth)}  ${chalk.dim(`(${bloom.anchoring.root})`)}`,
    `  Forge Vitality:          ${colorScore(bloom.forgeVitality)}  ${chalk.dim(`(${bloom.energizing.forge})`)}`,
    '',
    `  Quality Score: ${colorScore(bloom.qualityScore)}  ${chalk.dim(`(${colorCondition(bloom.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatBloomsTable(blooms) */
export function formatBloomsTable(blooms: IronBloom[]): string {
  if (blooms.length === 0) return chalk.dim('No iron blooms found')

  const colWidths = {
    file: Math.max(4, ...blooms.map((b) => b.file.length)),
    str: Math.max(3, ...blooms.map((b) => String(b.strengthThroughNature).length)),
    res: Math.max(3, ...blooms.map((b) => String(b.rustResistance).length)),
    pre: Math.max(3, ...blooms.map((b) => String(b.bloomPrecision).length)),
    dep: Math.max(3, ...blooms.map((b) => String(b.rootDepth).length)),
    vit: Math.max(3, ...blooms.map((b) => String(b.forgeVitality).length)),
    score: Math.max(5, ...blooms.map((b) => String(b.qualityScore).length)),
  }

  const lines: string[] = [chalk.bold('Iron Blooms'), '']

  const header =
    chalk.rgb(34, 139, 34)(padRight('File', colWidths.file)) +
    '  ' +
    chalk.rgb(34, 139, 34)(padLeft('Str', colWidths.str)) +
    '  ' +
    chalk.rgb(34, 139, 34)(padLeft('Res', colWidths.res)) +
    '  ' +
    chalk.rgb(34, 139, 34)(padLeft('Pre', colWidths.pre)) +
    '  ' +
    chalk.rgb(34, 139, 34)(padLeft('Dep', colWidths.dep)) +
    '  ' +
    chalk.rgb(34, 139, 34)(padLeft('Vit', colWidths.vit)) +
    '  ' +
    chalk.rgb(34, 139, 34)(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const b of blooms) {
    lines.push(
      padRight(b.file, colWidths.file) +
        '  ' +
        padLeft(String(b.strengthThroughNature), colWidths.str) +
        '  ' +
        padLeft(String(b.rustResistance), colWidths.res) +
        '  ' +
        padLeft(String(b.bloomPrecision), colWidths.pre) +
        '  ' +
        padLeft(String(b.rootDepth), colWidths.dep) +
        '  ' +
        padLeft(String(b.forgeVitality), colWidths.vit) +
        '  ' +
        padLeft(String(b.qualityScore), colWidths.score),
    )
  }

  return lines.join('\n')
}

/** @example formatBedTable(bed) */
export function formatBedTable(bed: IronBed): string {
  const lines: string[] = [
    chalk.bold(`Iron Bed: ${bed.directory}`),
    '',
    `  Blooms:               ${bed.blooms.length}`,
    `  Avg Strength:         ${colorScore(bed.avgStrength)}`,
    `  Avg Precision:        ${colorScore(bed.avgPrecision)}`,
    `  Avg Vitality:         ${colorScore(bed.avgVitality)}`,
    `  Iron Masterpieces:    ${bed.ironMasterpieceCount}`,
    `  Bed Type:             ${bed.bedType}`,
    `  Condition:            ${colorBedCondition(bed.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatBedsTable(beds) */
export function formatBedsTable(beds: IronBed[]): string {
  if (beds.length === 0) return chalk.dim('No iron beds found')

  const lines: string[] = [chalk.bold('Iron Beds'), '']

  for (const bed of beds) {
    lines.push(
      `  ${chalk.rgb(34, 139, 34)(bed.directory)}  ${colorScore(bed.avgStrength)}  ${colorBedCondition(bed.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: IronGardenStats): string {
  const lines: string[] = [
    chalk.bold('Iron Garden Statistics'),
    '',
    `  Total Files:               ${stats.totalFiles}`,
    `  Total Beds:                ${stats.totalBeds}`,
    `  Avg Strength Through Nature: ${colorScore(stats.avgStrengthThroughNature)}`,
    `  Avg Rust Resistance:       ${colorScore(stats.avgRustResistance)}`,
    `  Avg Bloom Precision:       ${colorScore(stats.avgBloomPrecision)}`,
    `  Avg Root Depth:            ${colorScore(stats.avgRootDepth)}`,
    `  Avg Forge Vitality:        ${colorScore(stats.avgForgeVitality)}`,
    `  Iron Masterpieces:         ${stats.ironMasterpieceCount}`,
    `  Garden Paradises:          ${stats.gardenParadiseCount}`,
    `  Proper Gardens:            ${stats.properGardenCount}`,
    `  Weedy Plots:               ${stats.weedyPlotCount}`,
    `  Rusty Gates:               ${stats.rustyGateCount}`,
    `  Void:                      ${stats.voidCount}`,
    `  Overall Bloom:             ${colorScore(stats.overallBloom)}`,
    `  Gardener Grade:            ${stats.gardenerGrade}`,
    `  Best Bloom:                ${stats.bestBloom || 'N/A'}`,
    `  Strongest:                 ${stats.strongest || 'N/A'}`,
    `  Most Resistant:            ${stats.mostResistant || 'N/A'}`,
    `  Most Precise:              ${stats.mostPrecise || 'N/A'}`,
    `  Deepest:                   ${stats.deepest || 'N/A'}`,
    `  Most Vital:                ${stats.mostVital || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(34, 139, 34)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: IronGardenResult): string {
  const lines: string[] = [
    chalk.bold('Iron Garden Analysis'),
    '',
    formatBloomsTable(result.blooms),
    '',
    formatBedsTable(result.beds),
    '',
    chalk.bold('Landscape Overview'),
    '',
    `  Avg Strength:     ${colorScore(result.landscape.avgStrength)}`,
    `  Avg Precision:    ${colorScore(result.landscape.avgPrecision)}`,
    `  Avg Vitality:     ${colorScore(result.landscape.avgVitality)}`,
    `  Overall Bloom:    ${colorScore(result.landscape.overallBloom)}`,
    `  Is Iron:          ${result.landscape.isIron ? chalk.rgb(34, 139, 34)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: IronGardenResult): string {
  return JSON.stringify(result, null, 2)
}
