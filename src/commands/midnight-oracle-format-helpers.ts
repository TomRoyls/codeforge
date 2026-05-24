// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { OracleVision, OracleTemple, MidnightOracleResult } from './midnight-oracle-helpers.js'

// ─── Color Palette (midnight oracle) ─────────────────────────────
const high = chalk.rgb(100, 80, 180)
const midHigh = chalk.rgb(120, 100, 190)
const mid = chalk.rgb(140, 120, 200)
const lowMid = chalk.rgb(160, 140, 200)
const low = chalk.rgb(180, 160, 210)

const best = chalk.rgb(80, 60, 160).bold
const good = chalk.rgb(100, 80, 175)
const okay = chalk.rgb(120, 100, 185)
const poor = chalk.rgb(150, 130, 195)
const worst = chalk.rgb(170, 155, 210)

const heading = chalk.rgb(70, 50, 150).bold
const label = chalk.rgb(110, 90, 180)
const dim = chalk.rgb(150, 140, 200)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // deep purple
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
 * colorGrade('scrying-masterpiece') // best (bold purple)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'scrying-depth': best, 'monomolecular-edge': best, 'fresh-lava': best,
    'shadow-master': best, 'true-oracle': best, 'scrying-masterpiece': best,
    'delphic-oracle': best, 'oracle-chamber': best, 'oracle-supreme': best,

    'deep-reflection': good, 'scalpel-sharp': good, 'quality-magma': good,
    'clear-shadows': good, 'accurate-prediction': good, 'polished-oracle': good,
    'scrying-sanctum': good, 'divination-room': good, 'master-seer': good,

    'proper-mirror': okay, 'proper-edge': okay, 'proper-flow': okay,
    'proper-visibility': okay, 'proper-forecast': okay, 'proper-scryer': okay,
    'proper-temple': okay, 'decent-space': okay, 'skilled-diviner': okay,

    'surface-only': poor, 'dull-blade': poor, 'mixed-ash': poor,
    'dim-shadows': poor, 'vague-prophecy': poor, 'rough-crystal': poor,
    'dark-corner': poor, 'dim-corner': poor, 'apprentice': poor,

    'foggy-reflection': worst, 'blunt-edge': worst, 'degraded-rock': worst,
    'dark-corners': worst, 'wrong-prediction': worst, 'shattered-ball': worst,
    'broken-shrine': worst, 'ruined': worst, 'novice': worst,

    'blank': worst, 'no-edge': worst, 'sediment': worst,
    'pitch-black': worst, 'no-prophecy': worst, 'dust': worst,
    'no-temple': worst, 'void': worst, 'blind-prophet': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Vision Formatting ────────────────────────────────────────────

/**
 * Format a single vision for display
 * @example
 * formatVisionTable(vision) // colored vision info
 */
export function formatVisionTable(vision: OracleVision): string {
  const parts = [
    `${label('File:')} ${dim(vision.file)}`,
    `${label('Reflection Depth:')} ${colorScore(vision.reflectionDepth)} ${colorGrade(vision.reflecting.grade)}`,
    `${label('Edge Sharpness:')} ${colorScore(vision.edgeSharpness)} ${colorGrade(vision.sharpening.edge)}`,
    `${label('Volcanic Origin:')} ${colorScore(vision.volcanicOrigin)} ${colorGrade(vision.sourcing.origin)}`,
    `${label('Shadow Clarity:')} ${colorScore(vision.shadowClarity)} ${colorGrade(vision.revealing.shadow)}`,
    `${label('Prophecy Accuracy:')} ${colorScore(vision.prophecyAccuracy)} ${colorGrade(vision.prophesying.prophecy)}`,
    `${label('Score:')} ${colorScore(vision.qualityScore)} ${colorGrade(vision.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format visions as summary table
 * @example
 * formatVisionsTable(visions) // multi-line table
 */
export function formatVisionsTable(visions: OracleVision[]): string {
  if (visions.length === 0) return dim('No oracle visions found')
  const header = heading('Midnight Oracle Analysis')
  const rows = visions.map(v => formatVisionTable(v))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Temple Formatting ────────────────────────────────────────────

/**
 * Format a temple for display
 * @example
 * formatTempleTable(temple) // colored temple info
 */
export function formatTempleTable(temple: OracleTemple): string {
  const parts = [
    `${label('Temple:')} ${dim(temple.directory)}`,
    `${label('Type:')} ${colorGrade(temple.templeType)}`,
    `${label('Condition:')} ${colorGrade(temple.condition)}`,
    `${label('Visions:')} ${String(temple.visions.length)}`,
    `${label('Avg Depth:')} ${colorScore(temple.avgDepth)}`,
    `${label('Avg Sharpness:')} ${colorScore(temple.avgSharpness)}`,
    `${label('Avg Accuracy:')} ${colorScore(temple.avgAccuracy)}`,
    `${label('Masterpieces:')} ${String(temple.scryingMasterpieceCount)}`,
    `${label('Dust:')} ${String(temple.dustCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all temples as summary
 * @example
 * formatTemplesTable(temples) // multi-line temple summary
 */
export function formatTemplesTable(temples: OracleTemple[]): string {
  if (temples.length === 0) return dim('No oracle temples found')
  const header = heading('Oracle Temples')
  const rows = temples.map(t => formatTempleTable(t))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: MidnightOracleResult['stats']): string {
  const parts = [
    heading('Midnight Oracle Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Temples:')} ${String(stats.totalTemples)}`,
    `${label('Avg Reflection Depth:')} ${colorScore(stats.avgReflectionDepth)}`,
    `${label('Avg Edge Sharpness:')} ${colorScore(stats.avgEdgeSharpness)}`,
    `${label('Avg Volcanic Origin:')} ${colorScore(stats.avgVolcanicOrigin)}`,
    `${label('Avg Shadow Clarity:')} ${colorScore(stats.avgShadowClarity)}`,
    `${label('Avg Prophecy Accuracy:')} ${colorScore(stats.avgProphecyAccuracy)}`,
    `${label('Scrying Masterpieces:')} ${String(stats.scryingMasterpieceCount)}`,
    `${label('Polished Oracles:')} ${String(stats.polishedOracleCount)}`,
    `${label('Proper Scryers:')} ${String(stats.properScryerCount)}`,
    `${label('Rough Crystals:')} ${String(stats.roughCrystalCount)}`,
    `${label('Shattered Balls:')} ${String(stats.shatteredBallCount)}`,
    `${label('Dust:')} ${String(stats.dustCount)}`,
    `${label('High Depth:')} ${String(stats.hasHighDepthCount)}`,
    `${label('High Sharpness:')} ${String(stats.hasHighSharpnessCount)}`,
    `${label('High Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('High Clarity:')} ${String(stats.hasHighClarityCount)}`,
    `${label('High Accuracy:')} ${String(stats.hasHighAccuracyCount)}`,
    `${label('Overall Vision:')} ${colorScore(stats.overallVision)}`,
    `${label('Seer Grade:')} ${colorGrade(stats.seerGrade)}`,
    `${label('Best Vision:')} ${stats.bestVision}`,
    `${label('Deepest:')} ${stats.deepest}`,
    `${label('Sharpest:')} ${stats.sharpest}`,
    `${label('Purest:')} ${stats.purest}`,
    `${label('Most Accurate:')} ${stats.mostAccurate}`,
  ]
  return parts.join('\n')
}

// ─── Recommendation Formatting ────────────────────────────────────

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

// ─── Full Result Formatting ───────────────────────────────────────

/**
 * Format complete result as table
 * @example
 * formatResultTable(result) // full colored output
 */
export function formatResultTable(result: MidnightOracleResult): string {
  const sections = [
    formatVisionsTable(result.visions),
    '',
    formatTemplesTable(result.temples),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Prophecy')} ${label('Prophetic:')} ${result.prophecy.isProphetic ? high('Yes') : low('No')} ${label('Overall Vision:')} ${colorScore(result.prophecy.overallVision)}`,
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
export function formatResultJson(result: MidnightOracleResult): string {
  return JSON.stringify(result, null, 2)
}
