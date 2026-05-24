// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { JadeCarving, JadeTemple, JadeTempleResult } from './jade-temple-helpers.js'

// ─── Color Palette (jade green) ────────────────────────────────────
const high = chalk.rgb(0, 200, 120)
const midHigh = chalk.rgb(0, 180, 105)
const mid = chalk.rgb(0, 160, 90)
const lowMid = chalk.rgb(0, 140, 75)
const low = chalk.rgb(0, 120, 60)

const best = chalk.rgb(50, 220, 150).bold
const good = chalk.rgb(30, 200, 135)
const okay = chalk.rgb(20, 180, 115)
const poor = chalk.rgb(10, 155, 95)
const worst = chalk.rgb(0, 130, 75)

const heading = chalk.rgb(60, 230, 160).bold
const label = chalk.rgb(45, 210, 145)
const dim = chalk.rgb(105, 145, 125)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // bright jade
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
 * colorGrade('imperial-jade') // best (bold jade)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'nephrite-strong': best, 'imperial-court': best, 'master-carver': best,
    'imperial-glow': best, 'ancient-sage': best, 'imperial-jade': best,
    'forbidden-city': best, 'imperial-collection': best, 'jade-emperor': best,

    'jadeite-hard': good, 'scholar-garden': good, 'expert-artisan': good,
    'proper-translucency': good, 'wise-dragon': good, 'fine-jadeite': good,
    'fine-gallery': good, 'master-artisan': good,

    'proper-strength': okay, 'proper-tradition': okay, 'proper-craft': okay,
    'decent-glow': okay, 'proper-symbol': okay, 'proper-nephrite': okay,
    'proper-temple': okay, 'decent-display': okay, 'skilled-carver': okay,

    'weak-jade': poor, 'modern-interpretation': poor, 'rough-carve': poor,
    'cloudy-jade': poor, 'simple-shape': poor, 'common-jade': poor,
    'village-shrine': poor, 'common-shop': poor, 'apprentice': poor,

    'soapstone': worst, 'shallow-copy': worst, 'amateur-chip': worst,
    'opaque-stone': worst, 'meaningless-mark': worst, 'serpentine': worst,
    'garden-rock': worst, 'flea-market': worst, 'novice': worst,

    'cracked-jade': worst, 'no-heritage': worst, 'uncut-stone': worst,
    'dead-rock': worst, 'no-symbol': worst, 'river-stone': worst,
    'no-temple': worst, 'empty': worst, 'stone-mason': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Carving Formatting ────────────────────────────────────────────

/**
 * Format a single carving for display
 * @example
 * formatCarvingTable(carving) // colored carving info
 */
export function formatCarvingTable(carving: JadeCarving): string {
  const parts = [
    `${label('File:')} ${dim(carving.file)}`,
    `${label('Serenity:')} ${colorScore(carving.serenityStrength)} ${colorGrade(carving.strengthening.grade)}`,
    `${label('Depth:')} ${colorScore(carving.culturalDepth)} ${colorGrade(carving.deepening.culture)}`,
    `${label('Precision:')} ${colorScore(carving.carvingPrecision)} ${colorGrade(carving.carving.craftsmanship)}`,
    `${label('Translucency:')} ${colorScore(carving.translucencyQuality)} ${colorGrade(carving.translucency.glow)}`,
    `${label('Wisdom:')} ${colorScore(carving.symbolicWisdom)} ${colorGrade(carving.symbolizing.symbol)}`,
    `${label('Score:')} ${colorScore(carving.qualityScore)} ${colorGrade(carving.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format carvings as summary table
 * @example
 * formatCarvingsTable(carvings) // multi-line table
 */
export function formatCarvingsTable(carvings: JadeCarving[]): string {
  if (carvings.length === 0) return dim('No jade carvings found')
  const header = heading('Jade Temple Analysis')
  const rows = carvings.map(c => formatCarvingTable(c))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Temple Formatting ─────────────────────────────────────────────

/**
 * Format a temple for display
 * @example
 * formatTempleTable(temple) // colored temple info
 */
export function formatTempleTable(temple: JadeTemple): string {
  const parts = [
    `${label('Temple:')} ${dim(temple.directory)}`,
    `${label('Type:')} ${colorGrade(temple.templeType)}`,
    `${label('Condition:')} ${colorGrade(temple.condition)}`,
    `${label('Carvings:')} ${String(temple.carvings.length)}`,
    `${label('Avg Serenity:')} ${colorScore(temple.avgSerenity)}`,
    `${label('Avg Depth:')} ${colorScore(temple.avgDepth)}`,
    `${label('Avg Precision:')} ${colorScore(temple.avgPrecision)}`,
    `${label('Imperial Jade:')} ${String(temple.imperialJadeCount)}`,
    `${label('River Stone:')} ${String(temple.riverStoneCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all temples as summary
 * @example
 * formatTemplesTable(temples) // multi-line temple summary
 */
export function formatTemplesTable(temples: JadeTemple[]): string {
  if (temples.length === 0) return dim('No jade temples found')
  const header = heading('Jade Temple Analysis')
  const rows = temples.map(t => formatTempleTable(t))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: JadeTempleResult['stats']): string {
  const parts = [
    heading('Jade Temple Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Temples:')} ${String(stats.totalTemples)}`,
    `${label('Avg Serenity Strength:')} ${colorScore(stats.avgSerenityStrength)}`,
    `${label('Avg Cultural Depth:')} ${colorScore(stats.avgCulturalDepth)}`,
    `${label('Avg Carving Precision:')} ${colorScore(stats.avgCarvingPrecision)}`,
    `${label('Avg Translucency Quality:')} ${colorScore(stats.avgTranslucencyQuality)}`,
    `${label('Avg Symbolic Wisdom:')} ${colorScore(stats.avgSymbolicWisdom)}`,
    `${label('Imperial Jade:')} ${String(stats.imperialJadeCount)}`,
    `${label('Fine Jadeite:')} ${String(stats.fineJadeiteCount)}`,
    `${label('Proper Nephrite:')} ${String(stats.properNephriteCount)}`,
    `${label('Common Jade:')} ${String(stats.commonJadeCount)}`,
    `${label('Serpentine:')} ${String(stats.serpentineCount)}`,
    `${label('River Stone:')} ${String(stats.riverStoneCount)}`,
    `${label('High Serenity:')} ${String(stats.hasHighSerenityCount)}`,
    `${label('High Depth:')} ${String(stats.hasHighDepthCount)}`,
    `${label('High Precision:')} ${String(stats.hasHighPrecisionCount)}`,
    `${label('High Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('High Wisdom:')} ${String(stats.hasHighWisdomCount)}`,
    `${label('Overall Harmony:')} ${colorScore(stats.overallHarmony)}`,
    `${label('Artisan Grade:')} ${colorGrade(stats.artisanGrade)}`,
    `${label('Best Carving:')} ${stats.bestCarving}`,
    `${label('Most Serene:')} ${stats.mostSerene}`,
    `${label('Deepest:')} ${stats.deepest}`,
    `${label('Most Precise:')} ${stats.mostPrecise}`,
    `${label('Most Luminous:')} ${stats.mostLuminous}`,
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
export function formatResultTable(result: JadeTempleResult): string {
  const sections = [
    formatCarvingsTable(result.carvings),
    '',
    formatTemplesTable(result.temples),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Dynasty')} ${label('Imperial:')} ${result.dynasty.isImperial ? high('Yes') : low('No')} ${label('Overall Harmony:')} ${colorScore(result.dynasty.overallHarmony)}`,
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
export function formatResultJson(result: JadeTempleResult): string {
  return JSON.stringify(result, null, 2)
}
