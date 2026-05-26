import chalk from 'chalk'

import type { AstronomerGrade, AzuriteCondition, AzuriteObservatoryResult, AzuriteReading, DomeCondition, DomeType } from './azurite-observatory-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(30, 60, 150)(String(score))
  if (score >= 75) return chalk.rgb(25, 50, 130)(String(score))
  if (score >= 60) return chalk.rgb(20, 40, 110)(String(score))
  if (score >= 40) return chalk.rgb(15, 30, 80)(String(score))
  if (score >= 20) return chalk.rgb(10, 20, 55)(String(score))
  return chalk.gray(String(score))
}

/** @example colorAzuriteCondition('azurite-masterpiece') */
export function colorAzuriteCondition(condition: AzuriteCondition | string): string {
  switch (condition) {
    case 'azurite-masterpiece': return chalk.rgb(30, 60, 150)('azurite-masterpiece')
    case 'celestial-blue': return chalk.rgb(25, 50, 130)('celestial-blue')
    case 'proper-azurite': return chalk.rgb(20, 40, 110)('proper-azurite')
    case 'faded-blue': return chalk.rgb(15, 30, 80)('faded-blue')
    case 'white-stone': return chalk.rgb(10, 20, 55)('white-stone')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorDomeType('grand-observatory') */
export function colorDomeType(type: DomeType | string): string {
  switch (type) {
    case 'grand-observatory': return chalk.rgb(30, 60, 150)('grand-observatory')
    case 'blue-dome': return chalk.rgb(25, 50, 130)('blue-dome')
    case 'proper-tower': return chalk.rgb(20, 40, 110)('proper-tower')
    case 'stone-pillar': return chalk.rgb(15, 30, 80)('stone-pillar')
    case 'empty-pedestal': return chalk.rgb(10, 20, 55)('empty-pedestal')
    case 'no-dome': return chalk.gray('no-dome')
    default: return chalk.gray(String(type))
  }
}

/** @example colorDomeCondition('azurite-palace') */
export function colorDomeCondition(condition: DomeCondition | string): string {
  switch (condition) {
    case 'azurite-palace': return chalk.rgb(30, 60, 150)('azurite-palace')
    case 'blue-tower': return chalk.rgb(25, 50, 130)('blue-tower')
    case 'proper-observatory': return chalk.rgb(20, 40, 110)('proper-observatory')
    case 'stone-tower': return chalk.rgb(15, 30, 80)('stone-tower')
    case 'empty-roof': return chalk.rgb(10, 20, 55)('empty-roof')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorAstronomerGrade('master-astronomer') */
export function colorAstronomerGrade(grade: AstronomerGrade | string): string {
  switch (grade) {
    case 'master-astronomer': return chalk.rgb(30, 60, 150)('master-astronomer')
    case 'observatory-director': return chalk.rgb(25, 50, 130)('observatory-director')
    case 'proper-observer': return chalk.rgb(20, 40, 110)('proper-observer')
    case 'amateur': return chalk.rgb(15, 30, 80)('amateur')
    case 'novice': return chalk.rgb(10, 20, 55)('novice')
    case 'blind-folded': return chalk.gray('blind-folded')
    default: return chalk.gray(String(grade))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatReadingTable(reading) */
export function formatReadingTable(reading: AzuriteReading): string {
  const lines: string[] = [
    chalk.bold(`Azurite Reading: ${reading.file}`),
    '',
    `  Deep-Blue Clarity:      ${colorScore(reading.deepBlueClarity)}  ${chalk.dim(`(${reading.illuminating.night})`)}`,
    `  Astronomical Precision: ${colorScore(reading.astronomicalPrecision)}  ${chalk.dim(`(${reading.calculating.orbit})`)}`,
    `  Mineral Endurance:      ${colorScore(reading.mineralEndurance)}  ${chalk.dim(`(${reading.preserving.pigment})`)}`,
    `  Sky Resilience:         ${colorScore(reading.skyResilience)}  ${chalk.dim(`(${reading.weathering.storm})`)}`,
    `  Cosmic Wisdom:          ${colorScore(reading.cosmicWisdom)}  ${chalk.dim(`(${reading.understanding.cosmos})`)}`,
    '',
    `  Quality Score: ${colorScore(reading.qualityScore)}  ${chalk.dim(`(${reading.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatReadingsTable(readings) */
export function formatReadingsTable(readings: AzuriteReading[]): string {
  if (readings.length === 0) return chalk.dim('No azurite readings found')
  const lines: string[] = [chalk.bold('Azurite Readings'), '']
  for (const r of readings) {
    lines.push(`  ${chalk.rgb(30, 60, 150)(r.file)}  Clr:${colorScore(r.deepBlueClarity)}  Prec:${colorScore(r.astronomicalPrecision)}  Score:${colorScore(r.qualityScore)}`)
  }
  return lines.join('\n')
}

/** @example formatDomeTable(dome) */
export function formatDomeTable(dome: AzuriteObservatoryResult['domes'][number]): string {
  const lines: string[] = [
    chalk.bold(`Azurite Dome: ${dome.directory}`),
    '',
    `  Readings:          ${dome.readings.length}`,
    `  Avg Clarity:       ${colorScore(dome.avgClarity)}`,
    `  Avg Precision:     ${colorScore(dome.avgPrecision)}`,
    `  Avg Wisdom:        ${colorScore(dome.avgWisdom)}`,
    `  Masterpieces:      ${dome.azuriteMasterpieceCount}`,
    `  Dome Type:         ${colorDomeType(dome.domeType)}`,
    `  Condition:         ${colorDomeCondition(dome.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatDomesTable(domes) */
export function formatDomesTable(domes: AzuriteObservatoryResult['domes']): string {
  if (domes.length === 0) return chalk.dim('No azurite domes found')
  const lines: string[] = [chalk.bold('Azurite Domes'), '']
  for (const d of domes) {
    lines.push(`  ${chalk.rgb(30, 60, 150)(d.directory)}  ${colorScore(d.avgClarity)}  ${colorDomeCondition(d.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: AzuriteObservatoryResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Azurite Observatory Statistics'),
    '',
    `  Total Files:              ${stats.totalFiles}`,
    `  Total Domes:              ${stats.totalDomes}`,
    `  Avg Deep-Blue Clarity:    ${colorScore(stats.avgDeepBlueClarity)}`,
    `  Avg Astronomical Prec.:   ${colorScore(stats.avgAstronomicalPrecision)}`,
    `  Avg Mineral Endurance:    ${colorScore(stats.avgMineralEndurance)}`,
    `  Avg Sky Resilience:       ${colorScore(stats.avgSkyResilience)}`,
    `  Avg Cosmic Wisdom:        ${colorScore(stats.avgCosmicWisdom)}`,
    `  Azurite Masterpieces:     ${stats.azuriteMasterpieceCount}`,
    `  Celestial Blues:          ${stats.celestialBlueCount}`,
    `  Proper Azurite:           ${stats.properAzuriteCount}`,
    `  Faded Blues:              ${stats.fadedBlueCount}`,
    `  White Stones:             ${stats.whiteStoneCount}`,
    `  Void:                     ${stats.voidCount}`,
    `  High Clarity Count:       ${stats.hasHighClarityCount}`,
    `  High Precision Count:     ${stats.hasHighPrecisionCount}`,
    `  High Endurance Count:     ${stats.hasHighEnduranceCount}`,
    `  High Resilience Count:    ${stats.hasHighResilienceCount}`,
    `  High Wisdom Count:        ${stats.hasHighWisdomCount}`,
    `  Overall Depth:            ${colorScore(stats.overallDepth)}`,
    `  Astronomer Grade:         ${colorAstronomerGrade(stats.astronomerGrade)}`,
    `  Best Reading:             ${stats.bestReading || 'N/A'}`,
    `  Clearest:                 ${stats.clearest || 'N/A'}`,
    `  Most Precise:             ${stats.mostPrecise || 'N/A'}`,
    `  Most Enduring:            ${stats.mostEnduring || 'N/A'}`,
    `  Most Resilient:           ${stats.mostResilient || 'N/A'}`,
    `  Wisest:                   ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(30, 60, 150)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: AzuriteObservatoryResult): string {
  const lines: string[] = [
    chalk.bold('Azurite Observatory Analysis'),
    '',
    formatReadingsTable(result.readings),
    '',
    formatDomesTable(result.domes),
    '',
    chalk.bold('Sky Overview'),
    '',
    `  Avg Clarity:     ${colorScore(result.sky.avgClarity)}`,
    `  Avg Precision:   ${colorScore(result.sky.avgPrecision)}`,
    `  Avg Wisdom:      ${colorScore(result.sky.avgWisdom)}`,
    `  Overall Depth:   ${colorScore(result.sky.overallDepth)}`,
    `  Is Azurite:      ${result.sky.isAzurite ? chalk.rgb(30, 60, 150)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: AzuriteObservatoryResult): string {
  return JSON.stringify(result, null, 2)
}
