// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { CrystalPeak, CrystalRange, CrystalMountainResult } from './crystal-mountain-helpers.js'

// ─── Color Palette (crystal mountain — ice blue/crystal white/aurora) ─
const high = chalk.rgb(150, 220, 255)
const midHigh = chalk.rgb(125, 195, 240)
const mid = chalk.rgb(100, 170, 220)
const lowMid = chalk.rgb(80, 140, 190)
const low = chalk.rgb(60, 110, 160)

const best = chalk.rgb(200, 240, 255).bold
const good = chalk.rgb(170, 220, 250)
const okay = chalk.rgb(140, 195, 230)
const poor = chalk.rgb(110, 165, 200)
const worst = chalk.rgb(80, 130, 170)

const heading = chalk.rgb(180, 230, 255).bold
const label = chalk.rgb(155, 210, 245)
const dim = chalk.rgb(120, 180, 220)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // crystal blue
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
 * colorGrade('crystal-pinnacle') // best (bold ice blue)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'perfect-crystal': best, 'summit-view': best, 'ideal-facet': best,
    'permafrost-proof': best, 'panoramic-view': best, 'crystal-pinnacle': best,
    'himalayas': best, 'crystal-kingdom': best, 'mountain-master': best,

    'well-formed': good, 'high-ridge': good, 'excellent-cut': good,
    'winter-hardy': good, 'clear-vista': good, 'gem-peak': good,
    'alps': good, 'gem-mountains': good, 'expert-climber': good,

    'proper-lattice': okay, 'proper-peak': okay, 'proper-face': okay,
    'proper-coating': okay, 'proper-overlook': okay, 'proper-summit': okay,
    'proper-range': okay, 'skilled-alpinist': okay,

    'flawed-crystal': poor, 'base-camp': poor, 'rough-face': poor,
    'frost-sensitive': poor, 'clouded-peak': poor, 'rocky-ridge': poor,
    'foothills': poor, 'rocky-hills': poor, 'apprentice': poor,

    'amorphous': worst, 'valley-floor': worst, 'uncut-stone': worst,
    'frozen-solid': worst, 'foggy-summit': worst, 'gravel-slope': worst,
    'mound': worst, 'eroded-peaks': worst, 'novice': worst,

    'no-structure': worst, 'no-altitude': worst, 'no-facet': worst,
    'no-resilience': worst, 'no-view': worst, 'dust': worst,
    'no-range': worst, 'void': worst, 'flatlander': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Peak Formatting ───────────────────────────────────────────────

/**
 * Format a single crystal peak for display
 * @example
 * formatPeakTable(peak) // colored peak info
 */
export function formatPeakTable(peak: CrystalPeak): string {
  const parts = [
    `${label('File:')} ${dim(peak.file)}`,
    `${label('Crystalline Structure:')} ${colorScore(peak.crystallineStructure)} ${colorGrade(peak.structuring.lattice)}`,
    `${label('Peak Clarity:')} ${colorScore(peak.peakClarity)} ${colorGrade(peak.ascending.altitude)}`,
    `${label('Facet Precision:')} ${colorScore(peak.facetPrecision)} ${colorGrade(peak.faceting.cut)}`,
    `${label('Frost Resilience:')} ${colorScore(peak.frostResilience)} ${colorGrade(peak.enduring.frost)}`,
    `${label('Summit Wisdom:')} ${colorScore(peak.summitWisdom)} ${colorGrade(peak.elevating.summit)}`,
    `${label('Score:')} ${colorScore(peak.qualityScore)} ${colorGrade(peak.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format peaks as summary table
 * @example
 * formatPeaksTable(peaks) // multi-line table
 */
export function formatPeaksTable(peaks: CrystalPeak[]): string {
  if (peaks.length === 0) return dim('No crystal peaks found')
  const header = heading('Crystal Peak Analysis')
  const rows = peaks.map(p => formatPeakTable(p))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Range Formatting ──────────────────────────────────────────────

/**
 * Format a single crystal range for display
 * @example
 * formatRangeTable(range) // colored range info
 */
export function formatRangeTable(range: CrystalRange): string {
  const parts = [
    `${label('Range:')} ${dim(range.directory)}`,
    `${label('Type:')} ${colorGrade(range.rangeType)}`,
    `${label('Condition:')} ${colorGrade(range.condition)}`,
    `${label('Peaks:')} ${String(range.peaks.length)}`,
    `${label('Avg Structure:')} ${colorScore(range.avgStructure)}`,
    `${label('Avg Clarity:')} ${colorScore(range.avgClarity)}`,
    `${label('Avg Wisdom:')} ${colorScore(range.avgWisdom)}`,
    `${label('Crystal Pinnacles:')} ${String(range.crystalPinnacleCount)}`,
    `${label('Dust:')} ${String(range.dustCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all crystal ranges as summary
 * @example
 * formatRangesTable(ranges) // multi-line summary
 */
export function formatRangesTable(ranges: CrystalRange[]): string {
  if (ranges.length === 0) return dim('No crystal ranges found')
  const header = heading('Crystal Ranges')
  const rows = ranges.map(r => formatRangeTable(r))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ──────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: CrystalMountainResult['stats']): string {
  const parts = [
    heading('Crystal Mountain Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Ranges:')} ${String(stats.totalRanges)}`,
    `${label('Avg Crystalline Structure:')} ${colorScore(stats.avgCrystallineStructure)}`,
    `${label('Avg Peak Clarity:')} ${colorScore(stats.avgPeakClarity)}`,
    `${label('Avg Facet Precision:')} ${colorScore(stats.avgFacetPrecision)}`,
    `${label('Avg Frost Resilience:')} ${colorScore(stats.avgFrostResilience)}`,
    `${label('Avg Summit Wisdom:')} ${colorScore(stats.avgSummitWisdom)}`,
    `${label('Crystal Pinnacle:')} ${String(stats.crystalPinnacleCount)}`,
    `${label('Gem Peak:')} ${String(stats.gemPeakCount)}`,
    `${label('Proper Summit:')} ${String(stats.properSummitCount)}`,
    `${label('Rocky Ridge:')} ${String(stats.rockyRidgeCount)}`,
    `${label('Gravel Slope:')} ${String(stats.gravelSlopeCount)}`,
    `${label('Dust:')} ${String(stats.dustCount)}`,
    `${label('High Structure:')} ${String(stats.hasHighStructureCount)}`,
    `${label('High Clarity:')} ${String(stats.hasHighClarityCount)}`,
    `${label('High Precision:')} ${String(stats.hasHighPrecisionCount)}`,
    `${label('High Resilience:')} ${String(stats.hasHighResilienceCount)}`,
    `${label('High Wisdom:')} ${String(stats.hasHighWisdomCount)}`,
    `${label('Overall Altitude:')} ${colorScore(stats.overallAltitude)}`,
    `${label('Alpinist Grade:')} ${colorGrade(stats.alpinistGrade)}`,
    `${label('Best Peak:')} ${stats.bestPeak}`,
    `${label('Most Structured:')} ${stats.mostStructured}`,
    `${label('Clearest:')} ${stats.clearest}`,
    `${label('Most Precise:')} ${stats.mostPrecise}`,
    `${label('Wisest:')} ${stats.wisest}`,
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
  const items = recommendations.map(r => `${dim('\u2744')} ${r}`)
  return `${header}\n${items.join('\n')}`
}

// ─── Full Result Formatting ────────────────────────────────────────

/**
 * Format complete result as table
 * @example
 * formatResultTable(result) // full colored output
 */
export function formatResultTable(result: CrystalMountainResult): string {
  const sections = [
    formatPeaksTable(result.peaks),
    '',
    formatRangesTable(result.ranges),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Massif')} ${label('Crystalline:')} ${result.massif.isCrystalline ? high('Yes') : low('No')} ${label('Overall Altitude:')} ${colorScore(result.massif.overallAltitude)}`,
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
export function formatResultJson(result: CrystalMountainResult): string {
  return JSON.stringify(result, null, 2)
}
