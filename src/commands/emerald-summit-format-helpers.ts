// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'

import type { EmeraldSummitResult, EmeraldPeak, EmeraldRange } from './emerald-summit-helpers.js'

// ─── Color Palette ─────────────────────────────────────────────────

const EMERALD = chalk.rgb(0, 180, 100)
const JADE = chalk.rgb(60, 160, 90)
const SUMMIT = chalk.rgb(120, 200, 140)
const DIM = chalk.rgb(140, 180, 160)
const BULLET = '\u{26F0}'

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * @example colorScore(85)
 */
export function colorScore(score: number): string {
  if (score >= 80) return EMERALD.bold(String(score))
  if (score >= 60) return JADE(String(score))
  if (score >= 40) return SUMMIT(String(score))
  if (score >= 20) return DIM(String(score))
  return chalk.gray(String(score))
}

/**
 * @example colorGrade('emerald-pinnacle')
 */
export function colorGrade(grade: string): string {
  if (grade.includes('emerald') || grade.includes('everest') || grade.includes('panoramic') || grade.includes('granite') || grade.includes('mountain-sage') || grade.includes('impervious') || grade.includes('mountain-legend') || grade.includes('himalayas') || grade.includes('emerald-kingdom')) return EMERALD.bold(grade)
  if (grade.includes('jade') || grade.includes('major') || grade.includes('breathtaking') || grade.includes('solid') || grade.includes('summit-philosopher') || grade.includes('avalanche-proof') || grade.includes('expert') || grade.includes('alps') || grade.includes('jade-mountains')) return JADE(grade)
  if (grade.includes('proper') || grade.includes('guide') || grade.includes('shelter') || grade.includes('skilled') || grade.includes('proper-range')) return SUMMIT(grade)
  return DIM(grade)
}

// ─── Peak Table ────────────────────────────────────────────────────

/**
 * @example formatPeakTable(peak)
 */
export function formatPeakTable(peak: EmeraldPeak): string {
  const lines: string[] = []
  lines.push(EMERALD.bold(`${BULLET} ${peak.file}`))
  lines.push(`  Gem Altitude         : ${colorScore(peak.gemAltitude)}  ${colorGrade(peak.ascending.elevation)}`)
  lines.push(`  Peak Clarity         : ${colorScore(peak.peakClarity)}  ${colorGrade(peak.viewing.vista)}`)
  lines.push(`  Ridge Strength       : ${colorScore(peak.ridgeStrength)}  ${colorGrade(peak.fortifying.ridge)}`)
  lines.push(`  Summit Wisdom        : ${colorScore(peak.summitWisdom)}  ${colorGrade(peak.knowing.sage)}`)
  lines.push(`  Avalanche Resilience : ${colorScore(peak.avalancheResilience)}  ${colorGrade(peak.shielding.shield)}`)
  lines.push(`  Quality Score        : ${colorScore(peak.qualityScore)}  ${colorGrade(peak.condition)}`)
  return lines.join('\n')
}

/**
 * @example formatPeaksTable(peaks)
 */
export function formatPeaksTable(peaks: EmeraldPeak[]): string {
  if (peaks.length === 0) return chalk.gray('No emerald peaks to display')
  return peaks.map(formatPeakTable).join('\n\n')
}

// ─── Range Table ───────────────────────────────────────────────────

/**
 * @example formatRangeTable(range)
 */
export function formatRangeTable(range: EmeraldRange): string {
  const lines: string[] = []
  lines.push(EMERALD.bold(`${BULLET} ${range.directory}`))
  lines.push(`  Peaks            : ${range.peaks.length}`)
  lines.push(`  Avg Altitude     : ${colorScore(range.avgAltitude)}`)
  lines.push(`  Avg Clarity      : ${colorScore(range.avgClarity)}`)
  lines.push(`  Avg Wisdom       : ${colorScore(range.avgWisdom)}`)
  lines.push(`  Emerald Pinnacles: ${range.emeraldPinnacleCount}`)
  lines.push(`  Dust             : ${range.dustCount}`)
  lines.push(`  Range Type       : ${colorGrade(range.rangeType)}`)
  lines.push(`  Condition        : ${colorGrade(range.condition)}`)
  return lines.join('\n')
}

/**
 * @example formatRangesTable(ranges)
 */
export function formatRangesTable(ranges: EmeraldRange[]): string {
  if (ranges.length === 0) return chalk.gray('No emerald ranges to display')
  return ranges.map(formatRangeTable).join('\n\n')
}

// ─── Celebration ───────────────────────────────────────────────────

/**
 * @example formatCelebration(celebration)
 */
export function formatCelebration(celebration: EmeraldSummitResult['celebration']): string {
  const lines: string[] = []
  lines.push(EMERALD.bold(`\u{1F3F0} Milestone #${celebration.milestone} — ${celebration.name}`))
  lines.push(`  ${JADE(celebration.message)}`)
  lines.push(`  Previous Milestones: ${celebration.previousMilestones.join(', ')}`)
  lines.push(`  Total Tests: ~${celebration.totalTests.toLocaleString()}`)
  return lines.join('\n')
}

// ─── Stats Table ───────────────────────────────────────────────────

/**
 * @example formatStatsTable(stats)
 */
export function formatStatsTable(stats: EmeraldSummitResult['stats']): string {
  const lines: string[] = []
  lines.push(EMERALD.bold('Emerald Summit Statistics'))
  lines.push(`  Total Files            : ${stats.totalFiles}`)
  lines.push(`  Total Ranges           : ${stats.totalRanges}`)
  lines.push(`  Avg Gem Altitude       : ${colorScore(stats.avgGemAltitude)}`)
  lines.push(`  Avg Peak Clarity       : ${colorScore(stats.avgPeakClarity)}`)
  lines.push(`  Avg Ridge Strength     : ${colorScore(stats.avgRidgeStrength)}`)
  lines.push(`  Avg Summit Wisdom      : ${colorScore(stats.avgSummitWisdom)}`)
  lines.push(`  Avg Avalanche Resilience: ${colorScore(stats.avgAvalancheResilience)}`)
  lines.push(`  Emerald Pinnacle       : ${stats.emeraldPinnacleCount}`)
  lines.push(`  Jade Peak              : ${stats.jadePeakCount}`)
  lines.push(`  Proper Summit          : ${stats.properSummitCount}`)
  lines.push(`  Rocky Ridge            : ${stats.rockyRidgeCount}`)
  lines.push(`  Gravel Slope           : ${stats.gravelSlopeCount}`)
  lines.push(`  Dust                   : ${stats.dustCount}`)
  lines.push(`  Overall Altitude       : ${colorScore(stats.overallAltitude)}`)
  lines.push(`  Alpinist Grade         : ${colorGrade(stats.alpinistGrade)}`)
  lines.push(`  Best Peak              : ${JADE(stats.bestPeak)}`)
  lines.push(`  Highest                : ${JADE(stats.highest)}`)
  lines.push(`  Clearest               : ${JADE(stats.clearest)}`)
  lines.push(`  Strongest              : ${JADE(stats.strongest)}`)
  lines.push(`  Wisest                 : ${JADE(stats.wisest)}`)
  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────

/**
 * @example formatRecommendations(['improve X'])
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.gray('No recommendations')
  return recs.map(r => `${BULLET} ${JADE(r)}`).join('\n')
}

// ─── Full Result ───────────────────────────────────────────────────

/**
 * @example formatResultTable(result)
 */
export function formatResultTable(result: EmeraldSummitResult): string {
  const sections: string[] = []

  sections.push(formatCelebration(result.celebration))
  sections.push('')
  sections.push(EMERALD.bold('Emerald Peak Analysis'))
  sections.push(formatPeaksTable(result.peaks))
  sections.push('')
  sections.push(EMERALD.bold('Emerald Ranges'))
  sections.push(formatRangesTable(result.ranges))
  sections.push('')
  sections.push(formatStatsTable(result.stats))
  sections.push('')
  sections.push(EMERALD.bold('Massif'))
  sections.push(`  Avg Altitude   : ${colorScore(result.massif.avgAltitude)}`)
  sections.push(`  Avg Clarity    : ${colorScore(result.massif.avgClarity)}`)
  sections.push(`  Avg Wisdom     : ${colorScore(result.massif.avgWisdom)}`)
  sections.push(`  Is Emerald     : ${result.massif.isEmerald ? EMERALD.bold('YES') : chalk.gray('NO')}`)
  sections.push(`  Overall Altitude: ${colorScore(result.massif.overallAltitude)}`)
  sections.push('')
  sections.push(EMERALD.bold('Recommendations'))
  sections.push(formatRecommendations(result.recommendations))

  return sections.join('\n')
}

/**
 * @example formatResultJson(result)
 */
export function formatResultJson(result: EmeraldSummitResult): string {
  return JSON.stringify(result, null, 2)
}
