// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { GoldenCurve, SpiralGalaxy, GoldenSpiralResult } from './golden-spiral-helpers.js'

// ─── Color Palette (golden/amber) ──────────────────────────────────
const high = chalk.rgb(255, 215, 0)
const midHigh = chalk.rgb(230, 190, 30)
const mid = chalk.rgb(200, 165, 50)
const lowMid = chalk.rgb(170, 140, 70)
const low = chalk.rgb(140, 115, 90)

const best = chalk.rgb(255, 223, 0).bold
const good = chalk.rgb(240, 200, 40)
const okay = chalk.rgb(215, 175, 60)
const poor = chalk.rgb(185, 145, 80)
const worst = chalk.rgb(155, 120, 100)

const heading = chalk.rgb(250, 210, 30).bold
const label = chalk.rgb(230, 190, 50)
const dim = chalk.rgb(150, 165, 175)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // golden
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
 * colorGrade('golden-masterpiece') // best (bold gold)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (text: string) => string> = {
    'golden-ratio': best, 'golden-section': best, 'elegant-curve': best, 'logarithmic-perfection': best, 'symphonic-growth': best,
    'golden-masterpiece': best, 'spiral-galaxy': best, 'golden-age': best, 'golden-architect': best,

    'fibonacci-perfect': good, 'well-proportioned': good, 'graceful-arc': good, 'smooth-arc': good, 'harmonic-expansion': good,
    'nautilus-perfection': good, 'barred-spiral': good, 'renaissance': good, 'master-designer': good,

    'proper-sequence': okay, 'proper-balance': okay, 'proper-expansion': okay, 'proper-curve': okay, 'proper-scaling': okay,
    'proper-spiral': okay, 'proper-vortex': okay, 'classical': okay, 'skilled-builder': okay,

    'uneven-growth': poor, 'uneven-weight': poor, 'clunky-growth': poor, 'angular': poor, 'discordant-growth': poor,
    'wonky-curve': poor, 'elliptical': poor, 'medieval': poor, 'apprentice': poor,

    'stunted': worst, 'imbalanced': worst, 'forced-expansion': worst, 'jagged-line': worst, 'chaotic-expansion': worst,
    'broken-coil': worst, 'irregular': worst, 'primitive': worst, 'novice': worst,

    'no-growth': worst, 'distorted': worst, 'no-expansion': worst, 'broken-path': worst, 'implosion': worst,
    'straight-line': worst, 'void': worst, 'square-peg': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Curve Formatting ──────────────────────────────────────────────

/**
 * Format a single curve for display
 * @example
 * formatCurveTable(curve) // colored curve info
 */
export function formatCurveTable(curve: GoldenCurve): string {
  const parts = [
    `${label('File:')} ${dim(curve.file)}`,
    `${label('Fibonacci Quality:')} ${colorScore(curve.fibonacciQuality)} ${colorGrade(curve.growing.grade)}`,
    `${label('Proportion Balance:')} ${colorScore(curve.proportionBalance)} ${colorGrade(curve.balancing.balance)}`,
    `${label('Growth Elegance:')} ${colorScore(curve.growthElegance)} ${colorGrade(curve.elegancing.growth)}`,
    `${label('Curve Smoothness:')} ${colorScore(curve.curveSmoothness)} ${colorGrade(curve.smoothing.curve)}`,
    `${label('Expansion Harmony:')} ${colorScore(curve.expansionHarmony)} ${colorGrade(curve.harmonizing.expansion)}`,
    `${label('Score:')} ${colorScore(curve.qualityScore)} ${colorGrade(curve.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format curves as summary table
 * @example
 * formatCurvesTable(curves) // multi-line table
 */
export function formatCurvesTable(curves: GoldenCurve[]): string {
  if (curves.length === 0) return dim('No golden curves found')
  const header = heading('Golden Curve Analysis')
  const rows = curves.map(c => formatCurveTable(c))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Galaxy Formatting ────────────────────────────────────────────

/**
 * Format a galaxy for display
 * @example
 * formatGalaxyTable(galaxy) // colored galaxy info
 */
export function formatGalaxyTable(galaxy: SpiralGalaxy): string {
  const parts = [
    `${label('Galaxy:')} ${dim(galaxy.directory)}`,
    `${label('Type:')} ${colorGrade(galaxy.galaxyType)}`,
    `${label('Condition:')} ${colorGrade(galaxy.condition)}`,
    `${label('Curves:')} ${String(galaxy.curves.length)}`,
    `${label('Avg Proportion:')} ${colorScore(galaxy.avgProportion)}`,
    `${label('Avg Elegance:')} ${colorScore(galaxy.avgElegance)}`,
    `${label('Avg Harmony:')} ${colorScore(galaxy.avgHarmony)}`,
    `${label('Golden Masterpieces:')} ${String(galaxy.goldenMasterpieceCount)}`,
    `${label('Straight Lines:')} ${String(galaxy.straightLineCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all galaxies as summary
 * @example
 * formatGalaxiesTable(galaxies) // multi-line galaxy summary
 */
export function formatGalaxiesTable(galaxies: SpiralGalaxy[]): string {
  if (galaxies.length === 0) return dim('No spiral galaxies found')
  const header = heading('Spiral Galaxy Analysis')
  const rows = galaxies.map(g => formatGalaxyTable(g))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ──────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: GoldenSpiralResult['stats']): string {
  const parts = [
    heading('Golden Spiral Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Galaxies:')} ${String(stats.totalGalaxies)}`,
    `${label('Avg Fibonacci Quality:')} ${colorScore(stats.avgFibonacciQuality)}`,
    `${label('Avg Proportion Balance:')} ${colorScore(stats.avgProportionBalance)}`,
    `${label('Avg Growth Elegance:')} ${colorScore(stats.avgGrowthElegance)}`,
    `${label('Avg Curve Smoothness:')} ${colorScore(stats.avgCurveSmoothness)}`,
    `${label('Avg Expansion Harmony:')} ${colorScore(stats.avgExpansionHarmony)}`,
    `${label('Golden Masterpiece:')} ${String(stats.goldenMasterpieceCount)}`,
    `${label('Nautilus Perfection:')} ${String(stats.nautilusPerfectionCount)}`,
    `${label('Proper Spiral:')} ${String(stats.properSpiralCount)}`,
    `${label('Wonky Curve:')} ${String(stats.wonkyCurveCount)}`,
    `${label('Broken Coil:')} ${String(stats.brokenCoilCount)}`,
    `${label('Straight Line:')} ${String(stats.straightLineCount)}`,
    `${label('High Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('High Proportion:')} ${String(stats.hasHighProportionCount)}`,
    `${label('High Elegance:')} ${String(stats.hasHighEleganceCount)}`,
    `${label('High Smoothness:')} ${String(stats.hasHighSmoothnessCount)}`,
    `${label('High Harmony:')} ${String(stats.hasHighHarmonyCount)}`,
    `${label('Overall Proportion:')} ${colorScore(stats.overallProportion)}`,
    `${label('Architect Grade:')} ${colorGrade(stats.architectGrade)}`,
    `${label('Best Curve:')} ${stats.bestCurve}`,
    `${label('Most Proportional:')} ${stats.mostProportional}`,
    `${label('Most Elegant:')} ${stats.mostElegant}`,
    `${label('Smoothest:')} ${stats.smoothest}`,
    `${label('Most Harmonious:')} ${stats.mostHarmonious}`,
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
export function formatResultTable(result: GoldenSpiralResult): string {
  const sections = [
    formatCurvesTable(result.curves),
    '',
    formatGalaxiesTable(result.galaxies),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Universe')} ${label('Golden:')} ${result.universe.isGolden ? high('Yes') : low('No')} ${label('Overall Proportion:')} ${colorScore(result.universe.overallProportion)}`,
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
export function formatResultJson(result: GoldenSpiralResult): string {
  return JSON.stringify(result, null, 2)
}
