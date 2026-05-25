// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'

import type { IronGardenResult, IronBloom, IronPlot } from './iron-garden-helpers.js'

// ─── Color Palette ─────────────────────────────────────────────────

const IRON = chalk.rgb(140, 140, 150)
const GARDEN = chalk.rgb(80, 160, 80)
const RUST = chalk.rgb(180, 90, 50)
const DIM = chalk.rgb(120, 120, 130)
const BULLET = '\u{1F33F}'

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * @example colorScore(85)
 */
export function colorScore(score: number): string {
  if (score >= 80) return GARDEN.bold(String(score))
  if (score >= 60) return IRON(String(score))
  if (score >= 40) return RUST(String(score))
  if (score >= 20) return DIM(String(score))
  return chalk.gray(String(score))
}

/**
 * @example colorGrade('iron-masterpiece')
 */
export function colorGrade(grade: string): string {
  if (grade.includes('iron') || grade.includes('steel') || grade.includes('master') || grade.includes('grand') || grade.includes('eden') || grade.includes('tempered') || grade.includes('galvanized') || grade.includes('perfect') || grade.includes('deep') || grade.includes('blazing') || grade.includes('estate') || grade.includes('ironworker')) return GARDEN.bold(grade)
  if (grade.includes('wrought') || grade.includes('stainless') || grade.includes('beautiful') || grade.includes('strong') || grade.includes('hot') || grade.includes('formal') || grade.includes('oasis') || grade.includes('forge-gardener')) return IRON(grade)
  if (grade.includes('proper') || grade.includes('skilled')) return RUST(grade)
  return DIM(grade)
}

// ─── Bloom Table ───────────────────────────────────────────────────

/**
 * @example formatBloomTable(bloom)
 */
export function formatBloomTable(bloom: IronBloom): string {
  const lines: string[] = []
  lines.push(GARDEN.bold(`${BULLET} ${bloom.file}`))
  lines.push(`  Strength Through Nature : ${colorScore(bloom.strengthThroughNature)}  ${colorGrade(bloom.fortifying.iron)}`)
  lines.push(`  Rust Resistance         : ${colorScore(bloom.rustResistance)}  ${colorGrade(bloom.protecting.coat)}`)
  lines.push(`  Bloom Precision         : ${colorScore(bloom.bloomPrecision)}  ${colorGrade(bloom.flowering.bloom)}`)
  lines.push(`  Root Depth              : ${colorScore(bloom.rootDepth)}  ${colorGrade(bloom.rooting.root)}`)
  lines.push(`  Forge Vitality          : ${colorScore(bloom.forgeVitality)}  ${colorGrade(bloom.energizing.forge)}`)
  lines.push(`  Quality Score           : ${colorScore(bloom.qualityScore)}  ${colorGrade(bloom.condition)}`)
  return lines.join('\n')
}

/**
 * @example formatBloomsTable(blooms)
 */
export function formatBloomsTable(blooms: IronBloom[]): string {
  if (blooms.length === 0) return chalk.gray('No iron blooms to display')
  return blooms.map(formatBloomTable).join('\n\n')
}

// ─── Plot Table ────────────────────────────────────────────────────

/**
 * @example formatPlotTable(plot)
 */
export function formatPlotTable(plot: IronPlot): string {
  const lines: string[] = []
  lines.push(GARDEN.bold(`${BULLET} ${plot.directory}`))
  lines.push(`  Blooms           : ${plot.blooms.length}`)
  lines.push(`  Avg Strength     : ${colorScore(plot.avgStrength)}`)
  lines.push(`  Avg Precision    : ${colorScore(plot.avgPrecision)}`)
  lines.push(`  Avg Vitality     : ${colorScore(plot.avgVitality)}`)
  lines.push(`  Masterpieces     : ${plot.ironMasterpieceCount}`)
  lines.push(`  Barren           : ${plot.barrenEarthCount}`)
  lines.push(`  Plot Type        : ${colorGrade(plot.plotType)}`)
  lines.push(`  Condition        : ${colorGrade(plot.condition)}`)
  return lines.join('\n')
}

/**
 * @example formatPlotsTable(plots)
 */
export function formatPlotsTable(plots: IronPlot[]): string {
  if (plots.length === 0) return chalk.gray('No iron plots to display')
  return plots.map(formatPlotTable).join('\n\n')
}

// ─── Stats Table ───────────────────────────────────────────────────

/**
 * @example formatStatsTable(stats)
 */
export function formatStatsTable(stats: IronGardenResult['stats']): string {
  const lines: string[] = []
  lines.push(GARDEN.bold('Iron Garden Statistics'))
  lines.push(`  Total Files           : ${stats.totalFiles}`)
  lines.push(`  Total Plots           : ${stats.totalPlots}`)
  lines.push(`  Avg Strength Nature   : ${colorScore(stats.avgStrengthThroughNature)}`)
  lines.push(`  Avg Rust Resistance   : ${colorScore(stats.avgRustResistance)}`)
  lines.push(`  Avg Bloom Precision   : ${colorScore(stats.avgBloomPrecision)}`)
  lines.push(`  Avg Root Depth        : ${colorScore(stats.avgRootDepth)}`)
  lines.push(`  Avg Forge Vitality    : ${colorScore(stats.avgForgeVitality)}`)
  lines.push(`  Iron Masterpiece      : ${stats.ironMasterpieceCount}`)
  lines.push(`  Steel Garden          : ${stats.steelGardenCount}`)
  lines.push(`  Proper Landscape      : ${stats.properLandscapeCount}`)
  lines.push(`  Rusty Bed             : ${stats.rustyBedCount}`)
  lines.push(`  Withered Plot         : ${stats.witheredPlotCount}`)
  lines.push(`  Barren Earth          : ${stats.barrenEarthCount}`)
  lines.push(`  Overall Fertility     : ${colorScore(stats.overallFertility)}`)
  lines.push(`  Gardener Grade        : ${colorGrade(stats.gardenerGrade)}`)
  lines.push(`  Best Bloom            : ${IRON(stats.bestBloom)}`)
  lines.push(`  Strongest             : ${IRON(stats.strongest)}`)
  lines.push(`  Most Resistant        : ${IRON(stats.mostResistant)}`)
  lines.push(`  Most Precise          : ${IRON(stats.mostPrecise)}`)
  lines.push(`  Most Vital            : ${IRON(stats.mostVital)}`)
  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────

/**
 * @example formatRecommendations(['improve X'])
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.gray('No recommendations')
  return recs.map(r => `${BULLET} ${IRON(r)}`).join('\n')
}

// ─── Full Result ───────────────────────────────────────────────────

/**
 * @example formatResultTable(result)
 */
export function formatResultTable(result: IronGardenResult): string {
  const sections: string[] = []

  sections.push(GARDEN.bold('Iron Bloom Analysis'))
  sections.push(formatBloomsTable(result.blooms))
  sections.push('')
  sections.push(GARDEN.bold('Iron Plots'))
  sections.push(formatPlotsTable(result.plots))
  sections.push('')
  sections.push(formatStatsTable(result.stats))
  sections.push('')
  sections.push(GARDEN.bold('Estate'))
  sections.push(`  Avg Strength    : ${colorScore(result.estate.avgStrength)}`)
  sections.push(`  Avg Precision   : ${colorScore(result.estate.avgPrecision)}`)
  sections.push(`  Avg Vitality    : ${colorScore(result.estate.avgVitality)}`)
  sections.push(`  Is Iron         : ${result.estate.isIron ? GARDEN.bold('YES') : chalk.gray('NO')}`)
  sections.push(`  Overall Fertility: ${colorScore(result.estate.overallFertility)}`)
  sections.push('')
  sections.push(GARDEN.bold('Recommendations'))
  sections.push(formatRecommendations(result.recommendations))

  return sections.join('\n')
}

/**
 * @example formatResultJson(result)
 */
export function formatResultJson(result: IronGardenResult): string {
  return JSON.stringify(result, null, 2)
}
