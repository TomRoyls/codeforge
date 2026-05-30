// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'

import type { JadeWaterfallResult, JadeDrop, JadeBasin } from './jade-waterfall-helpers.js'

// ─── Color Palette ─────────────────────────────────────────────────

const JADE = chalk.rgb(0, 168, 107)
const WATER = chalk.rgb(100, 200, 255)
const MIST = chalk.rgb(180, 230, 200)
const DIM = chalk.rgb(130, 130, 170)
const BULLET = '\u{1F4A7}'

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * @example colorScore(85)
 */
export function colorScore(score: number): string {
  if (score >= 80) return JADE.bold(String(score))
  if (score >= 60) return WATER(String(score))
  if (score >= 40) return MIST(String(score))
  if (score >= 20) return DIM(String(score))
  return chalk.gray(String(score))
}

/**
 * @example colorGrade('jade-masterpiece')
 */
export function colorGrade(grade: string): string {
  if (grade.includes('jade') || grade.includes('effortless') || grade.includes('crystal') || grade.includes('bottomless') || grade.includes('ancient') || grade.includes('emerald-lake') || grade.includes('magnificent') || grade.includes('master')) return JADE.bold(grade)
  if (grade.includes('emerald') || grade.includes('smooth') || grade.includes('clear') || grade.includes('deep') || grade.includes('clean') || grade.includes('wise') || grade.includes('jade-pool') || grade.includes('beautiful') || grade.includes('river-guide')) return WATER(grade)
  if (grade.includes('proper') || grade.includes('proper-')) return MIST(grade)
  return DIM(grade)
}

// ─── Drop Table ────────────────────────────────────────────────────

/**
 * @example formatDropTable(drop)
 */
export function formatDropTable(drop: JadeDrop): string {
  const lines: string[] = []
  lines.push(JADE.bold(`${BULLET} ${drop.file}`))
  lines.push(`  Flow Grace       : ${colorScore(drop.flowGrace)}  ${colorGrade(drop.flowing.current)}`)
  lines.push(`  Cascade Clarity  : ${colorScore(drop.cascadeClarity)}  ${colorGrade(drop.cascading.step)}`)
  lines.push(`  Pool Depth       : ${colorScore(drop.poolDepth)}  ${colorGrade(drop.pooling.pool)}`)
  lines.push(`  Mist Purity      : ${colorScore(drop.mistPurity)}  ${colorGrade(drop.cleansing.mist)}`)
  lines.push(`  River Wisdom     : ${colorScore(drop.riverWisdom)}  ${colorGrade(drop.knowing.river)}`)
  lines.push(`  Quality Score    : ${colorScore(drop.qualityScore)}  ${colorGrade(drop.condition)}`)
  return lines.join('\n')
}

/**
 * @example formatDropsTable(drops)
 */
export function formatDropsTable(drops: JadeDrop[]): string {
  if (drops.length === 0) return chalk.gray('No jade drops to display')
  return drops.map(formatDropTable).join('\n\n')
}

// ─── Basin Table ───────────────────────────────────────────────────

/**
 * @example formatBasinTable(basin)
 */
export function formatBasinTable(basin: JadeBasin): string {
  const lines: string[] = []
  lines.push(JADE.bold(`${BULLET} ${basin.directory}`))
  lines.push(`  Drops          : ${basin.drops.length}`)
  lines.push(`  Avg Grace      : ${colorScore(basin.avgGrace)}`)
  lines.push(`  Avg Clarity    : ${colorScore(basin.avgClarity)}`)
  lines.push(`  Avg Wisdom     : ${colorScore(basin.avgWisdom)}`)
  lines.push(`  Masterpieces   : ${basin.jadeMasterpieceCount}`)
  lines.push(`  Dry Beds       : ${basin.dryBedCount}`)
  lines.push(`  Basin Type     : ${colorGrade(basin.basinType)}`)
  lines.push(`  Condition      : ${colorGrade(basin.condition)}`)
  return lines.join('\n')
}

/**
 * @example formatBasinsTable(basins)
 */
export function formatBasinsTable(basins: JadeBasin[]): string {
  if (basins.length === 0) return chalk.gray('No jade basins to display')
  return basins.map(formatBasinTable).join('\n\n')
}

// ─── Stats Table ───────────────────────────────────────────────────

/**
 * @example formatStatsTable(stats)
 */
export function formatStatsTable(stats: JadeWaterfallResult['stats']): string {
  const lines: string[] = []
  lines.push(JADE.bold('Jade Waterfall Statistics'))
  lines.push(`  Total Files        : ${stats.totalFiles}`)
  lines.push(`  Total Basins       : ${stats.totalBasins}`)
  lines.push(`  Avg Flow Grace     : ${colorScore(stats.avgFlowGrace)}`)
  lines.push(`  Avg Cascade Clarity: ${colorScore(stats.avgCascadeClarity)}`)
  lines.push(`  Avg Pool Depth     : ${colorScore(stats.avgPoolDepth)}`)
  lines.push(`  Avg Mist Purity    : ${colorScore(stats.avgMistPurity)}`)
  lines.push(`  Avg River Wisdom   : ${colorScore(stats.avgRiverWisdom)}`)
  lines.push(`  Jade Masterpiece   : ${stats.jadeMasterpieceCount}`)
  lines.push(`  Emerald Falls      : ${stats.emeraldFallsCount}`)
  lines.push(`  Proper Waterfall   : ${stats.properWaterfallCount}`)
  lines.push(`  Murky Cascade      : ${stats.murkyCascadeCount}`)
  lines.push(`  Trickle            : ${stats.trickleCount}`)
  lines.push(`  Dry Bed            : ${stats.dryBedCount}`)
  lines.push(`  Overall Flow       : ${colorScore(stats.overallFlow)}`)
  lines.push(`  Navigator Grade    : ${colorGrade(stats.navigatorGrade)}`)
  lines.push(`  Best Drop          : ${WATER(stats.bestDrop)}`)
  lines.push(`  Most Graceful      : ${WATER(stats.mostGraceful)}`)
  lines.push(`  Clearest           : ${WATER(stats.clearest)}`)
  lines.push(`  Deepest            : ${WATER(stats.deepest)}`)
  lines.push(`  Wisest             : ${WATER(stats.wisest)}`)
  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────

/**
 * @example formatRecommendations(['improve X'])
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.gray('No recommendations')
  return recs.map(r => `${BULLET} ${WATER(r)}`).join('\n')
}

// ─── Full Result ───────────────────────────────────────────────────

/**
 * @example formatResultTable(result)
 */
export function formatResultTable(result: JadeWaterfallResult): string {
  const sections: string[] = []

  sections.push(JADE.bold('Jade Drop Analysis'))
  sections.push(formatDropsTable(result.drops))
  sections.push('')
  sections.push(JADE.bold('Jade Basins'))
  sections.push(formatBasinsTable(result.basins))
  sections.push('')
  sections.push(formatStatsTable(result.stats))
  sections.push('')
  sections.push(JADE.bold('River'))
  sections.push(`  Avg Grace     : ${colorScore(result.river.avgGrace)}`)
  sections.push(`  Avg Clarity   : ${colorScore(result.river.avgClarity)}`)
  sections.push(`  Avg Wisdom    : ${colorScore(result.river.avgWisdom)}`)
  sections.push(`  Is Jade       : ${result.river.isJade ? JADE.bold('YES') : chalk.gray('NO')}`)
  sections.push(`  Overall Flow  : ${colorScore(result.river.overallFlow)}`)
  sections.push('')
  sections.push(JADE.bold('Recommendations'))
  sections.push(formatRecommendations(result.recommendations))

  return sections.join('\n')
}

/**
 * @example formatResultJson(result)
 */
export function formatResultJson(result: JadeWaterfallResult): string {
  return JSON.stringify(result, null, 2)
}
