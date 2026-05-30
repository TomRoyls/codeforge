// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { SilkStrand, SilkLoom, SilkThreadResult } from './silk-thread-helpers.js'

// ─── Color Palette ─────────────────────────────────────────────────
const high = chalk.rgb(220, 180, 255)
const midHigh = chalk.rgb(190, 150, 235)
const mid = chalk.rgb(160, 120, 210)
const lowMid = chalk.rgb(130, 95, 185)
const low = chalk.rgb(100, 70, 160)

const best = chalk.rgb(240, 200, 255).bold
const good = chalk.rgb(210, 175, 245)
const okay = chalk.rgb(180, 145, 230)
const poor = chalk.rgb(150, 115, 210)
const worst = chalk.rgb(120, 85, 185)

const heading = chalk.rgb(230, 190, 255).bold
const label = chalk.rgb(200, 160, 240)
const dim = chalk.rgb(150, 165, 175)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // silk purple
 */
export function colorScore(score: number): string {
  if (score >= 80) return high(String(score))
  if (score >= 60) return midHigh(String(score))
  if (score >= 40) return mid(String(score))
  if (score >= 20) return lowMid(String(score))
  return low(String(score))
}

/**
 * Color a grade/tier string by quality
 * @example
 * colorGrade('master-weaver') // best (bold purple)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (text: string) => string> = {
    'spider-silk': best, 'damask': best, 'uniform-color': best, 'master-loom': best, 'egyptian-cotton': best,
    'master-weaver': best, 'silk-mill': best, 'luxury-fabric': best,

    'tensile-steel': good, 'jacquard': good, 'consistent-dye': good, 'precision-loom': good, 'high-thread': good,
    'fine-silk': good, 'weaving-workshop': good, 'fine-textile': good,

    'strong-thread': okay, 'proper-weave': okay, 'proper-shade': okay, 'proper-loom': okay, 'proper-count': okay,
    'proper-thread': okay, 'hand-loom': okay, 'decent-cloth': okay,

    'proper-yarn': poor, 'loose-weave': poor, 'patchy-dye': poor, 'wobbly-loom': poor, 'low-thread': poor,
    'cotton-yarn': poor, 'spinning-wheel': poor, 'rough-fabric': poor,

    'weak-thread': worst, 'fraying': worst, 'faded': worst, 'misaligned': worst, 'see-through': worst,
    'burlap': worst, 'distaff': worst, 'tattered': worst,

    'snapped': worst, 'unraveled': worst, 'bleached': worst, 'broken-loom': worst, 'gauze': worst,
    'shredded': worst, 'no-loom': worst, 'threads': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Strand Formatting ────────────────────────────────────────────

/**
 * Format a single strand for display
 * @example
 * formatStrandTable(strand) // colored strand info
 */
export function formatStrandTable(strand: SilkStrand): string {
  const parts = [
    `${label('File:')} ${dim(strand.file)}`,
    `${label('Tensile Strength:')} ${colorScore(strand.tensileStrength)} ${colorGrade(strand.strengthening.grade)}`,
    `${label('Weave Quality:')} ${colorScore(strand.weaveQuality)} ${colorGrade(strand.weaving.weave)}`,
    `${label('Dye Consistency:')} ${colorScore(strand.dyeConsistency)} ${colorGrade(strand.dyeing.dye)}`,
    `${label('Loom Precision:')} ${colorScore(strand.loomPrecision)} ${colorGrade(strand.looming.loom)}`,
    `${label('Thread Count:')} ${colorScore(strand.threadCount)} ${colorGrade(strand.counting.count)}`,
    `${label('Score:')} ${colorScore(strand.qualityScore)} ${colorGrade(strand.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format strands as summary table
 * @example
 * formatStrandsTable(strands) // multi-line table
 */
export function formatStrandsTable(strands: SilkStrand[]): string {
  if (strands.length === 0) return dim('No silk strands found')
  const header = heading('Silk Thread Analysis')
  const rows = strands.map(st => formatStrandTable(st))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Loom Formatting ──────────────────────────────────────────────

/**
 * Format a loom for display
 * @example
 * formatLoomTable(loom) // colored loom info
 */
export function formatLoomTable(loom: SilkLoom): string {
  const parts = [
    `${label('Loom:')} ${dim(loom.directory)}`,
    `${label('Type:')} ${colorGrade(loom.loomType)}`,
    `${label('Condition:')} ${colorGrade(loom.condition)}`,
    `${label('Strands:')} ${String(loom.strands.length)}`,
    `${label('Avg Tensile:')} ${colorScore(loom.avgTensile)}`,
    `${label('Avg Weave:')} ${colorScore(loom.avgWeave)}`,
    `${label('Avg Density:')} ${colorScore(loom.avgDensity)}`,
    `${label('Master Weaver:')} ${String(loom.masterWeaverCount)}`,
    `${label('Shredded:')} ${String(loom.shreddedCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all looms as summary
 * @example
 * formatLoomsTable(looms) // multi-line loom summary
 */
export function formatLoomsTable(looms: SilkLoom[]): string {
  if (looms.length === 0) return dim('No silk looms found')
  const header = heading('Silk Loom Analysis')
  const rows = looms.map(l => formatLoomTable(l))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ──────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: SilkThreadResult['stats']): string {
  const parts = [
    heading('Fabric Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Looms:')} ${String(stats.totalLooms)}`,
    `${label('Avg Tensile Strength:')} ${colorScore(stats.avgTensileStrength)}`,
    `${label('Avg Weave Quality:')} ${colorScore(stats.avgWeaveQuality)}`,
    `${label('Avg Dye Consistency:')} ${colorScore(stats.avgDyeConsistency)}`,
    `${label('Avg Loom Precision:')} ${colorScore(stats.avgLoomPrecision)}`,
    `${label('Avg Thread Count:')} ${colorScore(stats.avgThreadCount)}`,
    `${label('Master Weaver:')} ${String(stats.masterWeaverCount)}`,
    `${label('Fine Silk:')} ${String(stats.fineSilkCount)}`,
    `${label('Proper Thread:')} ${String(stats.properThreadCount)}`,
    `${label('Cotton Yarn:')} ${String(stats.cottonYarnCount)}`,
    `${label('Burlap:')} ${String(stats.burlapCount)}`,
    `${label('Shredded:')} ${String(stats.shreddedCount)}`,
    `${label('High Tensile:')} ${String(stats.hasHighTensileCount)}`,
    `${label('High Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('High Consistency:')} ${String(stats.hasHighConsistencyCount)}`,
    `${label('High Precision:')} ${String(stats.hasHighPrecisionCount)}`,
    `${label('High Density:')} ${String(stats.hasHighDensityCount)}`,
    `${label('Overall Quality:')} ${colorScore(stats.overallQuality)}`,
    `${label('Weaver Grade:')} ${colorGrade(stats.weaverGrade)}`,
    `${label('Best Strand:')} ${stats.bestStrand}`,
    `${label('Strongest:')} ${stats.strongest}`,
    `${label('Best Woven:')} ${stats.bestWoven}`,
    `${label('Most Consistent:')} ${stats.mostConsistent}`,
    `${label('Most Precise:')} ${stats.mostPrecise}`,
  ]
  return parts.join('\n')
}

// ─── Recommendation Formatting ─────────────────────────────────────

/**
 * Format recommendations as list
 * @example
 * formatRecommendations(recs) // bullet list
 */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return dim('No recommendations')
  const header = heading('Recommendations')
  const items = recommendations.map(r => `${dim('\u2022')} ${r}`)
  return `${header}\n${items.join('\n')}`
}

// ─── Full Result Formatting ────────────────────────────────────────

/**
 * Format complete result as table
 * @example
 * formatResultTable(result) // full colored output
 */
export function formatResultTable(result: SilkThreadResult): string {
  const sections = [
    formatStrandsTable(result.strands),
    '',
    formatLoomsTable(result.looms),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Fabric')} ${label('Fine Silk:')} ${result.fabric.isFineSilk ? high('Yes') : low('No')} ${label('Overall Quality:')} ${colorScore(result.fabric.overallQuality)}`,
    '',
    formatRecommendations(result.recommendations),
  ]
  return sections.join('\n')
}

/**
 * Format complete result as JSON
 * @example
 * formatResultJson(result) // JSON string
 */
export function formatResultJson(result: SilkThreadResult): string {
  return JSON.stringify(result, null, 2)
}
