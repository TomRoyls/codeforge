import chalk from 'chalk'

import type { TreeCondition, GroveCondition, PhantomTree, PhantomGrove, PhantomWoodResult } from './phantom-wood-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(147, 130, 186)(String(score))
  if (score >= 75) return chalk.rgb(120, 110, 170)(String(score))
  if (score >= 60) return chalk.rgb(100, 95, 155)(String(score))
  if (score >= 40) return chalk.rgb(85, 80, 140)(String(score))
  if (score >= 20) return chalk.rgb(110, 105, 135)(String(score))
  return chalk.gray(String(score))
}

/** @example colorCondition('phantom-masterpiece') */
export function colorCondition(condition: TreeCondition | string): string {
  switch (condition) {
    case 'phantom-masterpiece':
      return chalk.rgb(147, 130, 186)('phantom-masterpiece')
    case 'spectral-grove':
      return chalk.rgb(120, 110, 170)('spectral-grove')
    case 'proper-spirit':
      return chalk.rgb(100, 95, 155)('proper-spirit')
    case 'dense-matter':
      return chalk.rgb(85, 80, 140)('dense-matter')
    case 'lead-weight':
      return chalk.rgb(110, 105, 135)('lead-weight')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorGroveCondition('primeval-woodland') */
export function colorGroveCondition(condition: GroveCondition | string): string {
  switch (condition) {
    case 'primeval-woodland':
      return chalk.rgb(147, 130, 186)('primeval-woodland')
    case 'enchanted-forest':
      return chalk.rgb(120, 110, 170)('enchanted-forest')
    case 'proper-grove':
      return chalk.rgb(100, 95, 155)('proper-grove')
    case 'thin-copse':
      return chalk.rgb(85, 80, 140)('thin-copse')
    case 'empty-clearing':
      return chalk.rgb(110, 105, 135)('empty-clearing')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatTreeTable(tree) */
export function formatTreeTable(tree: PhantomTree): string {
  const lines: string[] = [
    chalk.bold(`Phantom Tree: ${tree.file}`),
    '',
    `  Ethereal Quality:  ${colorScore(tree.etherealQuality)}  ${chalk.dim(`(${tree.drifting.ethereal})`)}`,
    `  Ghost Handling:    ${colorScore(tree.ghostHandling)}  ${chalk.dim(`(${tree.haunting.ghost})`)}`,
    `  Mist Clarity:      ${colorScore(tree.mistClarity)}  ${chalk.dim(`(${tree.clearing.mist})`)}`,
    `  Root Depth:        ${colorScore(tree.rootDepth)}  ${chalk.dim(`(${tree.rooting.root})`)}`,
    `  Shadow Wisdom:     ${colorScore(tree.shadowWisdom)}  ${chalk.dim(`(${tree.lurking.shadow})`)}`,
    '',
    `  Quality Score: ${colorScore(tree.qualityScore)}  ${chalk.dim(`(${colorCondition(tree.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatTreesTable(trees) */
export function formatTreesTable(trees: PhantomTree[]): string {
  if (trees.length === 0) return chalk.dim('No phantom trees found')

  const colWidths = {
    file: Math.max(4, ...trees.map((t) => t.file.length)),
    eth: Math.max(3, ...trees.map((t) => String(t.etherealQuality).length)),
    ghst: Math.max(3, ...trees.map((t) => String(t.ghostHandling).length)),
    mist: Math.max(3, ...trees.map((t) => String(t.mistClarity).length)),
    root: Math.max(3, ...trees.map((t) => String(t.rootDepth).length)),
    shdw: Math.max(3, ...trees.map((t) => String(t.shadowWisdom).length)),
    score: Math.max(5, ...trees.map((t) => String(t.qualityScore).length)),
  }

  const lines: string[] = [chalk.bold('Phantom Trees'), '']

  const header =
    chalk.rgb(147, 130, 186)(padRight('File', colWidths.file)) +
    '  ' +
    chalk.rgb(147, 130, 186)(padLeft('Eth', colWidths.eth)) +
    '  ' +
    chalk.rgb(147, 130, 186)(padLeft('Ghst', colWidths.ghst)) +
    '  ' +
    chalk.rgb(147, 130, 186)(padLeft('Mist', colWidths.mist)) +
    '  ' +
    chalk.rgb(147, 130, 186)(padLeft('Root', colWidths.root)) +
    '  ' +
    chalk.rgb(147, 130, 186)(padLeft('Shdw', colWidths.shdw)) +
    '  ' +
    chalk.rgb(147, 130, 186)(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const t of trees) {
    lines.push(
      padRight(t.file, colWidths.file) +
        '  ' +
        padLeft(String(t.etherealQuality), colWidths.eth) +
        '  ' +
        padLeft(String(t.ghostHandling), colWidths.ghst) +
        '  ' +
        padLeft(String(t.mistClarity), colWidths.mist) +
        '  ' +
        padLeft(String(t.rootDepth), colWidths.root) +
        '  ' +
        padLeft(String(t.shadowWisdom), colWidths.shdw) +
        '  ' +
        padLeft(String(t.qualityScore), colWidths.score),
    )
  }

  return lines.join('\n')
}

/** @example formatGroveTable(grove) */
export function formatGroveTable(grove: PhantomGrove): string {
  const lines: string[] = [
    chalk.bold(`Phantom Grove: ${grove.directory}`),
    '',
    `  Trees:          ${grove.trees.length}`,
    `  Avg Ethereal:   ${colorScore(grove.avgEthereal)}`,
    `  Avg Root Depth: ${colorScore(grove.avgRootDepth)}`,
    `  Avg Wisdom:     ${colorScore(grove.avgWisdom)}`,
    `  Masterpieces:   ${grove.phantomMasterpieceCount}`,
    `  Grove Type:     ${grove.groveType}`,
    `  Condition:      ${colorGroveCondition(grove.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatGrovesTable(groves) */
export function formatGrovesTable(groves: PhantomGrove[]): string {
  if (groves.length === 0) return chalk.dim('No phantom groves found')

  const lines: string[] = [chalk.bold('Phantom Groves'), '']

  for (const g of groves) {
    lines.push(
      `  ${chalk.rgb(147, 130, 186)(g.directory)}  ${colorScore(g.avgEthereal)}  ${colorGroveCondition(g.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: PhantomWoodResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Phantom Wood Statistics'),
    '',
    `  Total Files:          ${stats.totalFiles}`,
    `  Total Groves:         ${stats.totalGroves}`,
    `  Avg Ethereal Quality: ${colorScore(stats.avgEtherealQuality)}`,
    `  Avg Ghost Handling:   ${colorScore(stats.avgGhostHandling)}`,
    `  Avg Mist Clarity:     ${colorScore(stats.avgMistClarity)}`,
    `  Avg Root Depth:       ${colorScore(stats.avgRootDepth)}`,
    `  Avg Shadow Wisdom:    ${colorScore(stats.avgShadowWisdom)}`,
    `  Phantom Masterpieces: ${stats.phantomMasterpieceCount}`,
    `  Spectral Groves:      ${stats.spectralGroveCount}`,
    `  Proper Spirits:       ${stats.properSpiritCount}`,
    `  Dense Matter:         ${stats.denseMatterCount}`,
    `  Lead Weight:          ${stats.leadWeightCount}`,
    `  Void:                 ${stats.voidCount}`,
    `  Overall Luminosity:   ${colorScore(stats.overallLuminosity)}`,
    `  Ranger Grade:         ${stats.rangerGrade}`,
    `  Best Tree:            ${stats.bestTree || 'N/A'}`,
    `  Most Ethereal:        ${stats.mostEthereal || 'N/A'}`,
    `  Best Handled:         ${stats.bestHandled || 'N/A'}`,
    `  Clearest:             ${stats.clearest || 'N/A'}`,
    `  Deepest:              ${stats.deepest || 'N/A'}`,
    `  Wisest:               ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(147, 130, 186)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: PhantomWoodResult): string {
  const lines: string[] = [
    chalk.bold('Phantom Wood Analysis'),
    '',
    formatTreesTable(result.trees),
    '',
    formatGrovesTable(result.groves),
    '',
    chalk.bold('Woodland Overview'),
    '',
    `  Avg Ethereal:    ${colorScore(result.woodland.avgEthereal)}`,
    `  Avg Root Depth:  ${colorScore(result.woodland.avgRootDepth)}`,
    `  Avg Wisdom:      ${colorScore(result.woodland.avgWisdom)}`,
    `  Luminosity:      ${colorScore(result.woodland.overallLuminosity)}`,
    `  Is Phantom:      ${result.woodland.isPhantom ? chalk.rgb(147, 130, 186)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: PhantomWoodResult): string {
  return JSON.stringify(result, null, 2)
}
