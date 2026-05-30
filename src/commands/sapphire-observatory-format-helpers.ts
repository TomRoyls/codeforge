import chalk from 'chalk'

import type { SapphireObservatoryResult, SapphireReading, SapphireDome, DomeCondition } from './sapphire-observatory-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(80, 120, 220)(String(score))
  if (score >= 75) return chalk.rgb(70, 110, 200)(String(score))
  if (score >= 60) return chalk.rgb(60, 100, 180)(String(score))
  if (score >= 40) return chalk.rgb(80, 90, 140)(String(score))
  if (score >= 20) return chalk.rgb(70, 80, 110)(String(score))
  return chalk.gray(String(score))
}

/** @example colorDomeCondition('sapphire-palace') */
export function colorDomeCondition(condition: DomeCondition | string): string {
  switch (condition) {
    case 'sapphire-palace': return chalk.rgb(80, 120, 220)('sapphire-palace')
    case 'gem-tower': return chalk.rgb(70, 110, 200)('gem-tower')
    case 'proper-observatory': return chalk.rgb(60, 100, 180)('proper-observatory')
    case 'stone-tower': return chalk.rgb(80, 90, 140)('stone-tower')
    case 'wooden-shack': return chalk.rgb(70, 80, 110)('wooden-shack')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatReadingTable(reading) */
export function formatReadingTable(reading: SapphireReading): string {
  const lines: string[] = [
    chalk.bold(`Sapphire Reading: ${reading.file}`),
    '',
    `  Celestial Clarity:      ${colorScore(reading.celestialClarity)}  ${chalk.dim(`(${reading.observing.sky})`)}`,
    `  Telescope Precision:    ${colorScore(reading.telescopePrecision)}  ${chalk.dim(`(${reading.focusing.lens})`)}`,
    `  Constellation Pattern:  ${colorScore(reading.constellationPattern)}  ${chalk.dim(`(${reading.connecting.map})`)}`,
    `  Nebula Depth:           ${colorScore(reading.nebulaDepth)}  ${chalk.dim(`(${reading.probing.cloud})`)}`,
    `  Cosmic Wisdom:          ${colorScore(reading.cosmicWisdom)}  ${chalk.dim(`(${reading.understanding.cosmos})`)}`,
    '',
    `  Quality Score: ${colorScore(reading.qualityScore)}  ${chalk.dim(`(${reading.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatReadingsTable(readings) */
export function formatReadingsTable(readings: SapphireReading[]): string {
  if (readings.length === 0) return chalk.dim('No sapphire readings found')
  const colWidths = {
    file: Math.max(4, ...readings.map((r) => r.file.length)),
    clarity: Math.max(7, ...readings.map((r) => String(r.celestialClarity).length)),
    precision: Math.max(9, ...readings.map((r) => String(r.telescopePrecision).length)),
    pattern: Math.max(7, ...readings.map((r) => String(r.constellationPattern).length)),
    depth: Math.max(5, ...readings.map((r) => String(r.nebulaDepth).length)),
    wisdom: Math.max(6, ...readings.map((r) => String(r.cosmicWisdom).length)),
    score: Math.max(5, ...readings.map((r) => String(r.qualityScore).length)),
  }
  const lines: string[] = [chalk.bold('Sapphire Readings'), '']
  const header =
    chalk.rgb(80, 120, 220)(padRight('File', colWidths.file)) + '  ' +
    chalk.rgb(80, 120, 220)(padLeft('Clarity', colWidths.clarity)) + '  ' +
    chalk.rgb(80, 120, 220)(padLeft('Precision', colWidths.precision)) + '  ' +
    chalk.rgb(80, 120, 220)(padLeft('Pattern', colWidths.pattern)) + '  ' +
    chalk.rgb(80, 120, 220)(padLeft('Depth', colWidths.depth)) + '  ' +
    chalk.rgb(80, 120, 220)(padLeft('Wisdom', colWidths.wisdom)) + '  ' +
    chalk.rgb(80, 120, 220)(padLeft('Score', colWidths.score))
  lines.push(header)
  lines.push(chalk.dim('\u2500'.repeat(header.length)))
  for (const r of readings) {
    lines.push(
      padRight(r.file, colWidths.file) + '  ' +
      padLeft(String(r.celestialClarity), colWidths.clarity) + '  ' +
      padLeft(String(r.telescopePrecision), colWidths.precision) + '  ' +
      padLeft(String(r.constellationPattern), colWidths.pattern) + '  ' +
      padLeft(String(r.nebulaDepth), colWidths.depth) + '  ' +
      padLeft(String(r.cosmicWisdom), colWidths.wisdom) + '  ' +
      padLeft(String(r.qualityScore), colWidths.score),
    )
  }
  return lines.join('\n')
}

/** @example formatDomeTable(dome) */
export function formatDomeTable(dome: SapphireDome): string {
  const lines: string[] = [
    chalk.bold(`Sapphire Dome: ${dome.directory}`),
    '',
    `  Readings:           ${dome.readings.length}`,
    `  Avg Clarity:        ${colorScore(dome.avgClarity)}`,
    `  Avg Precision:      ${colorScore(dome.avgPrecision)}`,
    `  Avg Wisdom:         ${colorScore(dome.avgWisdom)}`,
    `  Masterpieces:       ${dome.sapphireMasterpieceCount}`,
    `  Dome Type:          ${dome.domeType}`,
    `  Condition:          ${colorDomeCondition(dome.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatDomesTable(domes) */
export function formatDomesTable(domes: SapphireDome[]): string {
  if (domes.length === 0) return chalk.dim('No sapphire domes found')
  const lines: string[] = [chalk.bold('Sapphire Domes'), '']
  for (const d of domes) {
    lines.push(`  ${chalk.rgb(80, 120, 220)(d.directory)}  ${colorScore(d.avgClarity)}  ${colorDomeCondition(d.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: SapphireObservatoryResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Sapphire Observatory Statistics'),
    '',
    `  Total Files:                ${stats.totalFiles}`,
    `  Total Domes:                ${stats.totalDomes}`,
    `  Avg Celestial Clarity:      ${colorScore(stats.avgCelestialClarity)}`,
    `  Avg Telescope Precision:    ${colorScore(stats.avgTelescopePrecision)}`,
    `  Avg Constellation Pattern:  ${colorScore(stats.avgConstellationPattern)}`,
    `  Avg Nebula Depth:           ${colorScore(stats.avgNebulaDepth)}`,
    `  Avg Cosmic Wisdom:          ${colorScore(stats.avgCosmicWisdom)}`,
    `  Sapphire Masterpieces:      ${stats.sapphireMasterpieceCount}`,
    `  Celestial Gems:             ${stats.celestialGemCount}`,
    `  Proper Sapphires:           ${stats.properSapphireCount}`,
    `  Blue Glass:                 ${stats.blueGlassCount}`,
    `  Cloudy Quartz:              ${stats.cloudyQuartzCount}`,
    `  Void:                       ${stats.voidCount}`,
    `  Overall Luminosity:         ${colorScore(stats.overallLuminosity)}`,
    `  Astronomer Grade:           ${stats.astronomerGrade}`,
    `  Best Reading:               ${stats.bestReading || 'N/A'}`,
    `  Clearest:                   ${stats.clearest || 'N/A'}`,
    `  Most Precise:               ${stats.mostPrecise || 'N/A'}`,
    `  Most Connected:             ${stats.mostConnected || 'N/A'}`,
    `  Deepest:                    ${stats.deepest || 'N/A'}`,
    `  Wisest:                     ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(80, 120, 220)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: SapphireObservatoryResult): string {
  const lines: string[] = [
    chalk.bold('Sapphire Observatory Analysis'),
    '',
    formatReadingsTable(result.readings),
    '',
    formatDomesTable(result.domes),
    '',
    chalk.bold('Cosmos Overview'),
    '',
    `  Avg Clarity:          ${colorScore(result.cosmos.avgClarity)}`,
    `  Avg Precision:        ${colorScore(result.cosmos.avgPrecision)}`,
    `  Avg Wisdom:           ${colorScore(result.cosmos.avgWisdom)}`,
    `  Overall Luminosity:   ${colorScore(result.cosmos.overallLuminosity)}`,
    `  Is Sapphire:          ${result.cosmos.isSapphire ? chalk.rgb(80, 120, 220)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: SapphireObservatoryResult): string {
  return JSON.stringify(result, null, 2)
}
