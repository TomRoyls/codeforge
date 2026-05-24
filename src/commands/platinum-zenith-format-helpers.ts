// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { PlatinumPeak, MountainRange, PlatinumZenithResult } from './platinum-zenith-helpers.js'

// ─── Color Palette (platinum zenith — silver/platinum/white) ───────
const high = chalk.rgb(229, 228, 240)
const midHigh = chalk.rgb(200, 200, 220)
const mid = chalk.rgb(170, 170, 195)
const lowMid = chalk.rgb(140, 140, 165)
const low = chalk.rgb(115, 115, 140)

const best = chalk.rgb(240, 240, 255).bold
const good = chalk.rgb(220, 220, 240)
const okay = chalk.rgb(195, 195, 215)
const poor = chalk.rgb(165, 165, 185)
const worst = chalk.rgb(135, 135, 160)

const heading = chalk.rgb(235, 235, 250).bold
const label = chalk.rgb(210, 210, 230)
const dim = chalk.rgb(180, 180, 200)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // bright platinum
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
 * colorGrade('platinum-masterpiece') // best (bold platinum)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'platinum-peak': best, 'zenith-clarity': best, 'granite-summit': best,
    'atomic-clock': best, 'omniscient-view': best, 'platinum-masterpiece': best,
    'himalayan-range': best, 'platinum-summit': best, 'mountain-master': best,

    'golden-summit': good, 'crystal-peak': good, 'solid-peak': good,
    'surveyor-grade': good, 'panoramic-wisdom': good, 'alpine-ridge': good,
    'golden-peak': good, 'expert-alpinist': good,

    'proper-peak': okay, 'proper-summit-view': okay, 'proper-rock': okay,
    'proper-measurement': okay, 'proper-perspective': okay, 'proper-mountains': okay,
    'decent-mountain': okay, 'skilled-climber': okay,

    'foothill-quality': poor, 'cloudy-height': poor, 'crumbling-edge': poor,
    'rough-estimate': poor, 'tunnel-vision': poor, 'rocky-ridge': poor,
    'rolling-hills': poor, 'rocky-hill': poor, 'apprentice': poor,

    'base-camp': worst, 'foggy-ridge': worst, 'unstable-ledge': worst,
    'wild-guess': worst, 'narrow-view': worst, 'gravel-slope': worst,
    'flat-plain': worst, 'flatland': worst, 'novice': worst,

    'no-ascent': worst, 'no-view': worst, 'no-summit': worst,
    'no-measurement': worst, 'no-wisdom': worst, 'valley-floor': worst,
    'no-range': worst, 'void': worst, 'armchair-mountaineer': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Peak Formatting ───────────────────────────────────────────────

/**
 * Format a single peak for display
 * @example
 * formatPeakTable(peak) // colored peak info
 */
export function formatPeakTable(peak: PlatinumPeak): string {
  const parts = [
    `${label('File:')} ${dim(peak.file)}`,
    `${label('Peak Quality:')} ${colorScore(peak.peakQuality)} ${colorGrade(peak.perfecting.grade)}`,
    `${label('Pinnacle Clarity:')} ${colorScore(peak.pinnacleClarity)} ${colorGrade(peak.clarifying.pinnacle)}`,
    `${label('Summit Resilience:')} ${colorScore(peak.summitResilience)} ${colorGrade(peak.strengthening.summit)}`,
    `${label('Altitude Precision:')} ${colorScore(peak.altitudePrecision)} ${colorGrade(peak.precisioning.altitude)}`,
    `${label('Zenith Wisdom:')} ${colorScore(peak.zenithWisdom)} ${colorGrade(peak.knowing.zenith)}`,
    `${label('Score:')} ${colorScore(peak.qualityScore)} ${colorGrade(peak.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format peaks as summary table
 * @example
 * formatPeaksTable(peaks) // multi-line table
 */
export function formatPeaksTable(peaks: PlatinumPeak[]): string {
  if (peaks.length === 0) return dim('No platinum peaks found')
  const header = heading('Platinum Zenith Analysis')
  const rows = peaks.map(p => formatPeakTable(p))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Range Formatting ──────────────────────────────────────────────

/**
 * Format a single range for display
 * @example
 * formatRangeTable(range) // colored range info
 */
export function formatRangeTable(range: MountainRange): string {
  const parts = [
    `${label('Range:')} ${dim(range.directory)}`,
    `${label('Type:')} ${colorGrade(range.rangeType)}`,
    `${label('Condition:')} ${colorGrade(range.condition)}`,
    `${label('Peaks:')} ${String(range.peaks.length)}`,
    `${label('Avg Quality:')} ${colorScore(range.avgQuality)}`,
    `${label('Avg Clarity:')} ${colorScore(range.avgClarity)}`,
    `${label('Avg Wisdom:')} ${colorScore(range.avgWisdom)}`,
    `${label('Platinum Masterpieces:')} ${String(range.platinumMasterpieceCount)}`,
    `${label('Valley Floor:')} ${String(range.valleyFloorCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all ranges as summary
 * @example
 * formatRangesTable(ranges) // multi-line summary
 */
export function formatRangesTable(ranges: MountainRange[]): string {
  if (ranges.length === 0) return dim('No mountain ranges found')
  const header = heading('Mountain Ranges')
  const rows = ranges.map(r => formatRangeTable(r))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ──────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: PlatinumZenithResult['stats']): string {
  const parts = [
    heading('Platinum Zenith Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Ranges:')} ${String(stats.totalRanges)}`,
    `${label('Avg Peak Quality:')} ${colorScore(stats.avgPeakQuality)}`,
    `${label('Avg Pinnacle Clarity:')} ${colorScore(stats.avgPinnacleClarity)}`,
    `${label('Avg Summit Resilience:')} ${colorScore(stats.avgSummitResilience)}`,
    `${label('Avg Altitude Precision:')} ${colorScore(stats.avgAltitudePrecision)}`,
    `${label('Avg Zenith Wisdom:')} ${colorScore(stats.avgZenithWisdom)}`,
    `${label('Platinum Masterpiece:')} ${String(stats.platinumMasterpieceCount)}`,
    `${label('Golden Summit:')} ${String(stats.goldenSummitCount)}`,
    `${label('Proper Peak:')} ${String(stats.properPeakCount)}`,
    `${label('Rocky Ridge:')} ${String(stats.rockyRidgeCount)}`,
    `${label('Gravel Slope:')} ${String(stats.gravelSlopeCount)}`,
    `${label('Valley Floor:')} ${String(stats.valleyFloorCount)}`,
    `${label('High Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('High Clarity:')} ${String(stats.hasHighClarityCount)}`,
    `${label('High Resilience:')} ${String(stats.hasHighResilienceCount)}`,
    `${label('High Precision:')} ${String(stats.hasHighPrecisionCount)}`,
    `${label('High Wisdom:')} ${String(stats.hasHighWisdomCount)}`,
    `${label('Overall Altitude:')} ${colorScore(stats.overallAltitude)}`,
    `${label('Climber Grade:')} ${colorGrade(stats.climberGrade)}`,
    `${label('Best Peak:')} ${stats.bestPeak}`,
    `${label('Highest Quality:')} ${stats.highestQuality}`,
    `${label('Clearest View:')} ${stats.clearestView}`,
    `${label('Strongest:')} ${stats.strongest}`,
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
  const items = recommendations.map(r => `${dim('\u2022')} ${r}`)
  return `${header}\n${items.join('\n')}`
}

// ─── Full Result Formatting ────────────────────────────────────────

/**
 * Format complete result as table
 * @example
 * formatResultTable(result) // full colored output
 */
export function formatResultTable(result: PlatinumZenithResult): string {
  const sections = [
    formatPeaksTable(result.peaks),
    '',
    formatRangesTable(result.ranges),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Expedition')} ${label('Summit:')} ${result.expedition.isSummit ? high('Yes') : low('No')} ${label('Altitude:')} ${colorScore(result.expedition.overallAltitude)}`,
    '',
    `${heading('Celebration #510')} ${label('Platinum Zenith')} ${dim(result.celebration.message)}`,
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
export function formatResultJson(result: PlatinumZenithResult): string {
  return JSON.stringify(result, null, 2)
}
