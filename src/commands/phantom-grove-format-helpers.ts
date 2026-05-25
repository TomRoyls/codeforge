// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'

import type { PhantomGroveResult, PhantomTree, PhantomClearing } from './phantom-grove-helpers.js'

// ─── Color Palette ─────────────────────────────────────────────────

const PHANTOM = chalk.rgb(180, 200, 255)
const MIST = chalk.rgb(150, 180, 220)
const ROOT = chalk.rgb(100, 160, 120)
const DIM = chalk.rgb(140, 145, 160)
const BULLET = '\u{1F333}'

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * @example colorScore(85)
 */
export function colorScore(score: number): string {
  if (score >= 80) return PHANTOM.bold(String(score))
  if (score >= 60) return MIST(String(score))
  if (score >= 40) return ROOT(String(score))
  if (score >= 20) return DIM(String(score))
  return chalk.gray(String(score))
}

/**
 * @example colorGrade('phantom-masterpiece')
 */
export function colorGrade(grade: string): string {
  if (grade.includes('masterpiece') || grade.includes('enchanted') || grade.includes('phantom-paradise') || grade.includes('phantom-ranger') || grade.includes('pure-phantom') || grade.includes('exorcist') || grade.includes('revealing') || grade.includes('deep-taproot') || grade.includes('shadow-sage')) return PHANTOM.bold(grade)
  if (grade.includes('ethereal') || grade.includes('mystical') || grade.includes('proper') || grade.includes('strong') || grade.includes('ghost-hunter') || grade.includes('clear-fog') || grade.includes('mystic-guide') || grade.includes('forest-warden') || grade.includes('dark-scholar')) return MIST(grade)
  if (grade.includes('foggy') || grade.includes('small') || grade.includes('apprentice') || grade.includes('heavy') || grade.includes('fearful') || grade.includes('shallow') || grade.includes('daylight')) return ROOT(grade)
  return DIM(grade)
}

// ─── Tree Table ────────────────────────────────────────────────────

/**
 * @example formatTreeTable(tree)
 */
export function formatTreeTable(tree: PhantomTree): string {
  const lines: string[] = []
  lines.push(PHANTOM.bold(`${BULLET} ${tree.file}`))
  lines.push(`  Ethereal Quality : ${colorScore(tree.etherealQuality)}  ${colorGrade(tree.drifting.spirit)}`)
  lines.push(`  Ghost Handling   : ${colorScore(tree.ghostHandling)}  ${colorGrade(tree.haunting.ghost)}`)
  lines.push(`  Mist Clarity     : ${colorScore(tree.mistClarity)}  ${colorGrade(tree.revealing.mist)}`)
  lines.push(`  Root Depth       : ${colorScore(tree.rootDepth)}  ${colorGrade(tree.grounding.root)}`)
  lines.push(`  Shadow Wisdom    : ${colorScore(tree.shadowWisdom)}  ${colorGrade(tree.knowing.shadow)}`)
  lines.push(`  Quality Score    : ${colorScore(tree.qualityScore)}  ${colorGrade(tree.condition)}`)
  return lines.join('\n')
}

/**
 * @example formatTreesTable(trees)
 */
export function formatTreesTable(trees: PhantomTree[]): string {
  if (trees.length === 0) return chalk.gray('No phantom trees to display')
  return trees.map(formatTreeTable).join('\n\n')
}

// ─── Clearing Table ────────────────────────────────────────────────

/**
 * @example formatClearingTable(clearing)
 */
export function formatClearingTable(clearing: PhantomClearing): string {
  const lines: string[] = []
  lines.push(PHANTOM.bold(`${BULLET} ${clearing.directory}`))
  lines.push(`  Trees              : ${clearing.trees.length}`)
  lines.push(`  Avg Quality        : ${colorScore(clearing.avgQuality)}`)
  lines.push(`  Avg Handling       : ${colorScore(clearing.avgHandling)}`)
  lines.push(`  Avg Wisdom         : ${colorScore(clearing.avgWisdom)}`)
  lines.push(`  Phantom Masterpieces: ${clearing.phantomMasterpieceCount}`)
  lines.push(`  Void               : ${clearing.voidCount}`)
  lines.push(`  Clearing Type      : ${colorGrade(clearing.clearingType)}`)
  lines.push(`  Condition          : ${colorGrade(clearing.condition)}`)
  return lines.join('\n')
}

/**
 * @example formatClearingsTable(clearings)
 */
export function formatClearingsTable(clearings: PhantomClearing[]): string {
  if (clearings.length === 0) return chalk.gray('No phantom clearings to display')
  return clearings.map(formatClearingTable).join('\n\n')
}

// ─── Stats Table ───────────────────────────────────────────────────

/**
 * @example formatStatsTable(stats)
 */
export function formatStatsTable(stats: PhantomGroveResult['stats']): string {
  const lines: string[] = []
  lines.push(PHANTOM.bold('Phantom Grove Statistics'))
  lines.push(`  Total Files          : ${stats.totalFiles}`)
  lines.push(`  Total Clearings      : ${stats.totalClearings}`)
  lines.push(`  Avg Ethereal Quality : ${colorScore(stats.avgEtherealQuality)}`)
  lines.push(`  Avg Ghost Handling   : ${colorScore(stats.avgGhostHandling)}`)
  lines.push(`  Avg Mist Clarity     : ${colorScore(stats.avgMistClarity)}`)
  lines.push(`  Avg Root Depth       : ${colorScore(stats.avgRootDepth)}`)
  lines.push(`  Avg Shadow Wisdom    : ${colorScore(stats.avgShadowWisdom)}`)
  lines.push(`  Phantom Masterpiece  : ${stats.phantomMasterpieceCount}`)
  lines.push(`  Ethereal Grove       : ${stats.etherealGroveCount}`)
  lines.push(`  Proper Forest        : ${stats.properForestCount}`)
  lines.push(`  Foggy Woods          : ${stats.foggyWoodsCount}`)
  lines.push(`  Dead Trees           : ${stats.deadTreesCount}`)
  lines.push(`  Void                 : ${stats.voidCount}`)
  lines.push(`  Overall Etherealness : ${colorScore(stats.overallEtherealness)}`)
  lines.push(`  Ranger Grade         : ${colorGrade(stats.rangerGrade)}`)
  lines.push(`  Best Tree            : ${MIST(stats.bestTree)}`)
  lines.push(`  Most Ethereal        : ${MIST(stats.mostEthereal)}`)
  lines.push(`  Best Ghost Hunter    : ${MIST(stats.bestGhostHunter)}`)
  lines.push(`  Clearest             : ${MIST(stats.clearest)}`)
  lines.push(`  Wisest               : ${MIST(stats.wisest)}`)
  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────

/**
 * @example formatRecommendations(['improve X'])
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.gray('No recommendations')
  return recs.map(r => `${BULLET} ${MIST(r)}`).join('\n')
}

// ─── Full Result ───────────────────────────────────────────────────

/**
 * @example formatResultTable(result)
 */
export function formatResultTable(result: PhantomGroveResult): string {
  const sections: string[] = []

  sections.push(PHANTOM.bold('Phantom Tree Analysis'))
  sections.push(formatTreesTable(result.trees))
  sections.push('')
  sections.push(PHANTOM.bold('Phantom Clearings'))
  sections.push(formatClearingsTable(result.clearings))
  sections.push('')
  sections.push(formatStatsTable(result.stats))
  sections.push('')
  sections.push(PHANTOM.bold('Forest'))
  sections.push(`  Avg Quality      : ${colorScore(result.forest.avgQuality)}`)
  sections.push(`  Avg Handling     : ${colorScore(result.forest.avgHandling)}`)
  sections.push(`  Avg Wisdom       : ${colorScore(result.forest.avgWisdom)}`)
  sections.push(`  Is Phantom       : ${result.forest.isPhantom ? PHANTOM.bold('YES') : chalk.gray('NO')}`)
  sections.push(`  Overall Ethereal : ${colorScore(result.forest.overallEtherealness)}`)
  sections.push('')
  sections.push(PHANTOM.bold('Recommendations'))
  sections.push(formatRecommendations(result.recommendations))

  return sections.join('\n')
}

/**
 * @example formatResultJson(result)
 */
export function formatResultJson(result: PhantomGroveResult): string {
  return JSON.stringify(result, null, 2)
}
