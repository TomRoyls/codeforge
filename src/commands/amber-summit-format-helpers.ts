import chalk from 'chalk'

import type { RidgeCondition, PeakCondition, AmberPeak, AmberRidge, AmberSummitStats, AmberSummitResult } from './amber-summit-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(255, 191, 0)(String(score))
  if (score >= 75) return chalk.rgb(255, 165, 0)(String(score))
  if (score >= 60) return chalk.rgb(218, 165, 32)(String(score))
  if (score >= 40) return chalk.yellow(String(score))
  if (score >= 20) return chalk.rgb(255, 140, 0)(String(score))
  return chalk.gray(String(score))
}

/** @example colorCondition('amber-masterpiece') */
export function colorCondition(condition: PeakCondition | string): string {
  switch (condition) {
    case 'amber-masterpiece':
      return chalk.rgb(255, 191, 0)('amber-masterpiece')
    case 'golden-summit':
      return chalk.rgb(255, 165, 0)('golden-summit')
    case 'proper-peak':
      return chalk.rgb(218, 165, 32)('proper-peak')
    case 'faded-hill':
      return chalk.yellow('faded-hill')
    case 'barren-rock':
      return chalk.rgb(255, 140, 0)('barren-rock')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorRidgeCondition('amber-mountain') */
export function colorRidgeCondition(condition: RidgeCondition | string): string {
  switch (condition) {
    case 'amber-mountain':
      return chalk.rgb(255, 191, 0)('amber-mountain')
    case 'golden-range':
      return chalk.rgb(255, 165, 0)('golden-range')
    case 'proper-ridge':
      return chalk.rgb(218, 165, 32)('proper-ridge')
    case 'faded-hills':
      return chalk.yellow('faded-hills')
    case 'barren-plain':
      return chalk.rgb(255, 140, 0)('barren-plain')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

// ─── Table formatting ───────────────────────────────────

function padRight(str: string, len: number): string {
  if (str.length >= len) return str
  return str + ' '.repeat(len - str.length)
}

function padLeft(str: string, len: number): string {
  if (str.length >= len) return str
  return ' '.repeat(len - str.length) + str
}

/** @example formatPeakTable(peak) */
export function formatPeakTable(peak: AmberPeak): string {
  const lines: string[] = [
    chalk.bold(`Amber Peak: ${peak.file}`),
    '',
    `  Preservation Power: ${colorScore(peak.preservationPower)}  ${chalk.dim(`(${peak.protecting.amber})`)}`,
    `  Golden Elevation:   ${colorScore(peak.goldenElevation)}  ${chalk.dim(`(${peak.ascending.summit})`)}`,
    `  Resin Fortitude:    ${colorScore(peak.resinFortitude)}  ${chalk.dim(`(${peak.hardening.resin})`)}`,
    `  Peak Clarity:       ${colorScore(peak.peakClarity)}  ${chalk.dim(`(${peak.revealing.vista})`)}`,
    `  Ancient Wisdom:     ${colorScore(peak.ancientWisdom)}  ${chalk.dim(`(${peak.remembering.ancient})`)}`,
    '',
    `  Quality Score: ${colorScore(peak.qualityScore)}  ${chalk.dim(`(${colorCondition(peak.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatPeaksTable(peaks) */
export function formatPeaksTable(peaks: AmberPeak[]): string {
  if (peaks.length === 0) return chalk.dim('No amber peaks found')

  const colWidths = {
    file: Math.max(4, ...peaks.map((p) => p.file.length)),
    power: Math.max(5, ...peaks.map((p) => String(p.preservationPower).length)),
    elevation: Math.max(9, ...peaks.map((p) => String(p.goldenElevation).length)),
    fortitude: Math.max(9, ...peaks.map((p) => String(p.resinFortitude).length)),
    clarity: Math.max(7, ...peaks.map((p) => String(p.peakClarity).length)),
    wisdom: Math.max(7, ...peaks.map((p) => String(p.ancientWisdom).length)),
    score: Math.max(5, ...peaks.map((p) => String(p.qualityScore).length)),
  }

  const lines: string[] = [chalk.bold('Amber Peaks'), '']

  const header =
    chalk.rgb(255, 191, 0)(padRight('File', colWidths.file)) +
    '  ' +
    chalk.rgb(255, 191, 0)(padLeft('Power', colWidths.power)) +
    '  ' +
    chalk.rgb(255, 191, 0)(padLeft('Elevation', colWidths.elevation)) +
    '  ' +
    chalk.rgb(255, 191, 0)(padLeft('Fortitude', colWidths.fortitude)) +
    '  ' +
    chalk.rgb(255, 191, 0)(padLeft('Clarity', colWidths.clarity)) +
    '  ' +
    chalk.rgb(255, 191, 0)(padLeft('Wisdom', colWidths.wisdom)) +
    '  ' +
    chalk.rgb(255, 191, 0)(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const p of peaks) {
    lines.push(
      padRight(p.file, colWidths.file) +
        '  ' +
        padLeft(String(p.preservationPower), colWidths.power) +
        '  ' +
        padLeft(String(p.goldenElevation), colWidths.elevation) +
        '  ' +
        padLeft(String(p.resinFortitude), colWidths.fortitude) +
        '  ' +
        padLeft(String(p.peakClarity), colWidths.clarity) +
        '  ' +
        padLeft(String(p.ancientWisdom), colWidths.wisdom) +
        '  ' +
        padLeft(String(p.qualityScore), colWidths.score),
    )
  }

  return lines.join('\n')
}

/** @example formatRidgeTable(ridge) */
export function formatRidgeTable(ridge: AmberRidge): string {
  const lines: string[] = [
    chalk.bold(`Amber Ridge: ${ridge.directory}`),
    '',
    `  Peaks:        ${ridge.peaks.length}`,
    `  Avg Power:    ${colorScore(ridge.avgPower)}`,
    `  Avg Elevation:${colorScore(ridge.avgElevation)}`,
    `  Avg Wisdom:   ${colorScore(ridge.avgWisdom)}`,
    `  Masterpieces: ${ridge.amberMasterpieceCount}`,
    `  Ridge Type:   ${ridge.ridgeType}`,
    `  Condition:    ${colorRidgeCondition(ridge.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatRidgesTable(ridges) */
export function formatRidgesTable(ridges: AmberRidge[]): string {
  if (ridges.length === 0) return chalk.dim('No amber ridges found')

  const lines: string[] = [chalk.bold('Amber Ridges'), '']

  for (const r of ridges) {
    lines.push(
      `  ${chalk.rgb(255, 191, 0)(r.directory)}  ${colorScore(r.avgPower)}  ${colorRidgeCondition(r.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: AmberSummitStats): string {
  const lines: string[] = [
    chalk.bold('Amber Summit Statistics'),
    '',
    `  Total Files:          ${stats.totalFiles}`,
    `  Total Ridges:         ${stats.totalRidges}`,
    `  Avg Preservation Power:${colorScore(stats.avgPreservationPower)}`,
    `  Avg Golden Elevation: ${colorScore(stats.avgGoldenElevation)}`,
    `  Avg Resin Fortitude:  ${colorScore(stats.avgResinFortitude)}`,
    `  Avg Peak Clarity:     ${colorScore(stats.avgPeakClarity)}`,
    `  Avg Ancient Wisdom:   ${colorScore(stats.avgAncientWisdom)}`,
    `  Amber Masterpieces:   ${stats.amberMasterpieceCount}`,
    `  Golden Summits:       ${stats.goldenSummitCount}`,
    `  Proper Peaks:         ${stats.properPeakCount}`,
    `  Faded Hills:          ${stats.fadedHillCount}`,
    `  Barren Rocks:         ${stats.barrenRockCount}`,
    `  Void:                 ${stats.voidCount}`,
    `  Overall Elevation:    ${colorScore(stats.overallElevation)}`,
    `  Climber Grade:        ${stats.climberGrade}`,
    `  Best Peak:            ${stats.bestPeak || 'N/A'}`,
    `  Most Preserved:       ${stats.mostPreserved || 'N/A'}`,
    `  Most Elevated:        ${stats.mostElevated || 'N/A'}`,
    `  Most Fortified:       ${stats.mostFortified || 'N/A'}`,
    `  Clearest:             ${stats.clearest || 'N/A'}`,
    `  Wisest:               ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(255, 191, 0)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: AmberSummitResult): string {
  const lines: string[] = [
    chalk.bold('Amber Summit Analysis'),
    '',
    formatPeaksTable(result.peaks),
    '',
    formatRidgesTable(result.ridges),
    '',
    chalk.bold('Mountain Overview'),
    '',
    `  Avg Power:         ${colorScore(result.mountain.avgPower)}`,
    `  Avg Elevation:     ${colorScore(result.mountain.avgElevation)}`,
    `  Avg Wisdom:        ${colorScore(result.mountain.avgWisdom)}`,
    `  Overall Elevation: ${colorScore(result.mountain.overallElevation)}`,
    `  Is Amber:          ${result.mountain.isAmber ? chalk.rgb(255, 191, 0)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: AmberSummitResult): string {
  return JSON.stringify(result, null, 2)
}
